"""Deploy HawkBytes preferred-page fix to Contabo + rebuild backend."""
from __future__ import annotations

import os
import re
import sys
from pathlib import Path

import paramiko

HOST = os.environ.get("CONTABO_HOST", "169.58.63.125")
USER = os.environ.get("CONTABO_USER", "root")
PASSWORD = os.environ["CONTABO_PASSWORD"]
REMOTE = "/opt/social-media-crossposter"
LOCAL = Path(__file__).resolve().parents[1]

FILES = [
    "backend/src/config/env.ts",
    "backend/src/platforms/platform.config.ts",
    "backend/src/platforms/facebook/facebook.adapter.ts",
    "backend/src/platforms/instagram/instagram.adapter.ts",
    "docker-compose.prod.yml",
]


def safe_print(text: str) -> None:
    enc = getattr(sys.stdout, "encoding", None) or "utf-8"
    sys.stdout.buffer.write((text + "\n").encode(enc, errors="replace"))
    sys.stdout.flush()


def run(ssh: paramiko.SSHClient, cmd: str, timeout: int = 1200) -> int:
    safe_print(f"$ {cmd}")
    _i, o, e = ssh.exec_command(cmd, timeout=timeout, get_pty=True)
    out = o.read().decode("utf-8", errors="replace")
    err = e.read().decode("utf-8", errors="replace")
    code = o.channel.recv_exit_status()
    text = (out + ("\n" + err if err.strip() else "")).strip()
    if text:
        safe = re.sub(r"(SECRET|PASSWORD|PASS|TOKEN|KEY)=([^\s]+)", r"\1=***", text)
        safe_print(safe[-8000:])
    safe_print(f"[exit {code}]")
    return code


def upsert_env(content: str, key: str, value: str) -> str:
    lines = content.splitlines()
    found = False
    out: list[str] = []
    for line in lines:
        if line.startswith(f"{key}=") or line.startswith(f"{key} ="):
            out.append(f"{key}={value}")
            found = True
        else:
            out.append(line)
    if not found:
        out.append(f"{key}={value}")
    return "\n".join(out) + "\n"


def main() -> int:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PASSWORD, timeout=40, banner_timeout=40)
    sftp = ssh.open_sftp()

    for rel in FILES:
        local = LOCAL / rel
        remote = f"{REMOTE}/{rel}".replace("\\", "/")
        parent = "/".join(remote.split("/")[:-1])
        run(ssh, f"mkdir -p {parent}")
        safe_print(f"upload {rel}")
        sftp.put(str(local), remote)

    with sftp.open(f"{REMOTE}/.env", "r") as f:
        env_text = f.read().decode("utf-8", errors="replace")
    env_text = upsert_env(env_text, "META_PREFERRED_PAGE_NAME", "HawkBytes")
    with sftp.open(f"{REMOTE}/.env", "w") as f:
        f.write(env_text)
    safe_print("Set META_PREFERRED_PAGE_NAME=HawkBytes")

    code = run(
        ssh,
        f"cd {REMOTE} && docker compose -f docker-compose.prod.yml --env-file .env build backend",
    )
    if code != 0:
        sftp.close()
        ssh.close()
        return code

    code = run(
        ssh,
        f"cd {REMOTE} && docker compose -f docker-compose.prod.yml --env-file .env up -d --force-recreate backend",
    )
    run(ssh, "sleep 5; curl -sS -m 15 https://169.58.63.125.sslip.io/api/v1/health || true")
    run(
        ssh,
        f"cd {REMOTE} && docker compose -f docker-compose.prod.yml --env-file .env exec -T backend "
        "node -e \"console.log('PREFERRED='+(process.env.META_PREFERRED_PAGE_NAME||'EMPTY'))\"",
    )

    sftp.close()
    ssh.close()
    safe_print("DONE")
    return code


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as e:
        safe_print(f"FAILED: {e}")
        raise SystemExit(1)
