"""Enable Instagram Login path on Contabo (no Facebook Page link required)."""
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
IG_APP_ID = os.environ.get("META_INSTAGRAM_APP_ID", "895832266910953")
IG_APP_SECRET = os.environ.get("META_INSTAGRAM_APP_SECRET", "").strip()

FILES = [
    "backend/src/config/env.ts",
    "backend/src/platforms/instagram/instagram.adapter.ts",
    "backend/src/platforms/platform.config.ts",
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


def upsert_env(content: str, updates: dict[str, str]) -> str:
    lines = content.splitlines()
    seen: set[str] = set()
    out: list[str] = []
    for line in lines:
        if not line.strip() or line.strip().startswith("#") or "=" not in line:
            out.append(line)
            continue
        key = line.split("=", 1)[0].strip()
        if key in updates:
            out.append(f"{key}={updates[key]}")
            seen.add(key)
        else:
            out.append(line)
    for key, value in updates.items():
        if key not in seen:
            out.append(f"{key}={value}")
    return "\n".join(out) + "\n"


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

    updates = {
        "META_USE_INSTAGRAM_LOGIN": "true",
        "META_INSTAGRAM_APP_ID": IG_APP_ID,
        "META_INSTAGRAM_REDIRECT_URI": "https://169.58.63.125.sslip.io/api/v1/accounts/instagram/callback",
    }
    if IG_APP_SECRET:
        updates["META_INSTAGRAM_APP_SECRET"] = IG_APP_SECRET

    with sftp.open(f"{REMOTE}/.env", "r") as f:
        env_text = f.read().decode("utf-8", errors="replace")
    # If Instagram secret missing, reuse META_APP_SECRET as temporary fallback in container env
    if not IG_APP_SECRET and "META_APP_SECRET=" in env_text:
        for line in env_text.splitlines():
            if line.startswith("META_APP_SECRET="):
                updates["META_INSTAGRAM_APP_SECRET"] = line.split("=", 1)[1]
                safe_print("Using META_APP_SECRET as META_INSTAGRAM_APP_SECRET fallback")
                break

    with sftp.open(f"{REMOTE}/.env", "w") as f:
        f.write(upsert_env(env_text, updates))
    safe_print("Enabled META_USE_INSTAGRAM_LOGIN + Instagram App ID")

    code = run(
        ssh,
        f"cd {REMOTE} && docker compose -f docker-compose.prod.yml --env-file .env build backend "
        f"&& docker compose -f docker-compose.prod.yml --env-file .env up -d --force-recreate backend",
    )
    run(ssh, "sleep 5; curl -sS -m 15 https://169.58.63.125.sslip.io/api/v1/health || true")
    run(
        ssh,
        f"cd {REMOTE} && docker compose -f docker-compose.prod.yml --env-file .env exec -T backend "
        "node -e \"console.log('USE_IG_LOGIN='+process.env.META_USE_INSTAGRAM_LOGIN);"
        "console.log('IG_APP_ID='+(process.env.META_INSTAGRAM_APP_ID||''));"
        "console.log('IG_SECRET='+(process.env.META_INSTAGRAM_APP_SECRET?'SET':'EMPTY'));\"",
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
