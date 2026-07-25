"""Deploy Instagram config_id OAuth fix to Contabo."""
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
        safe_print(safe[-6000:])
    safe_print(f"[exit {code}]")
    return code


def main() -> int:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PASSWORD, timeout=40, banner_timeout=40)
    sftp = ssh.open_sftp()
    for rel in FILES:
        remote = f"{REMOTE}/{rel}"
        run(ssh, f"mkdir -p {'/'.join(remote.split('/')[:-1])}")
        safe_print(f"upload {rel}")
        sftp.put(str(LOCAL / rel), remote)

    code = run(
        ssh,
        f"cd {REMOTE} && docker compose -f docker-compose.prod.yml --env-file .env build backend "
        f"&& docker compose -f docker-compose.prod.yml --env-file .env up -d --force-recreate backend",
    )
    run(ssh, "sleep 5; curl -sS -m 15 https://169.58.63.125.sslip.io/api/v1/health || true")
    # Show whether connect URL now uses config_id
    run(
        ssh,
        f"cd {REMOTE} && docker compose -f docker-compose.prod.yml --env-file .env exec -T backend "
        "node -e \"console.log('META_CONFIG_ID='+(process.env.META_CONFIG_ID?'SET':'EMPTY'))\"",
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
