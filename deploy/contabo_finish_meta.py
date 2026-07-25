"""Finish Contabo backend recreate + seed after Meta .env update."""
from __future__ import annotations

import os
import re
import sys

import paramiko

HOST = os.environ.get("CONTABO_HOST", "169.58.63.125")
USER = os.environ.get("CONTABO_USER", "root")
PASSWORD = os.environ["CONTABO_PASSWORD"]
REMOTE = "/opt/social-media-crossposter"


def safe_print(text: str) -> None:
    enc = getattr(sys.stdout, "encoding", None) or "utf-8"
    sys.stdout.buffer.write((text + "\n").encode(enc, errors="replace"))
    sys.stdout.flush()


def run(ssh: paramiko.SSHClient, cmd: str, timeout: int = 900) -> int:
    safe_print(f"$ {cmd}")
    _stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout, get_pty=True)
    out = stdout.read().decode("utf-8", errors="replace")
    err = stderr.read().decode("utf-8", errors="replace")
    code = stdout.channel.recv_exit_status()
    text = (out + ("\n" + err if err.strip() else "")).strip()
    if text:
        safe = re.sub(r"(SECRET|PASSWORD|PASS|TOKEN|KEY)=([^\s]+)", r"\1=***", text)
        safe_print(safe[-6000:])
    safe_print(f"[exit {code}]")
    return code


def main() -> int:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    safe_print(f"Connecting {USER}@{HOST} ...")
    ssh.connect(HOST, username=USER, password=PASSWORD, timeout=40, banner_timeout=40)

    steps = [
        f"cd {REMOTE} && docker compose -f docker-compose.prod.yml --env-file .env up -d --force-recreate backend",
        f"cd {REMOTE} && docker compose -f docker-compose.prod.yml --env-file .env exec -T backend mkdir -p /app/scripts",
        f"cd {REMOTE} && docker compose -f docker-compose.prod.yml --env-file .env cp backend/scripts/seed-roles-users.mjs backend:/app/scripts/seed-roles-users.mjs",
        f"cd {REMOTE} && docker compose -f docker-compose.prod.yml --env-file .env exec -T backend node /app/scripts/seed-roles-users.mjs",
        "sleep 3; curl -s http://127.0.0.1/api/v1/health",
        "curl -s http://127.0.0.1/api/v1/auth/config",
        (
            f"cd {REMOTE} && docker compose -f docker-compose.prod.yml --env-file .env exec -T backend "
            "node -e \"const k=['META_APP_ID','META_APP_SECRET','META_REDIRECT_URI',"
            "'META_INSTAGRAM_REDIRECT_URI','RECAPTCHA_SECRET_KEY','API_BASE_URL'];"
            "for (const x of k) console.log(x+'='+(process.env[x]?'SET('+String(process.env[x].length)+')':'EMPTY'));\""
        ),
    ]
    for cmd in steps:
        code = run(ssh, cmd)
        if code != 0 and "curl" not in cmd and "node -e" not in cmd:
            ssh.close()
            return code

    ssh.close()
    safe_print("DONE")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as e:
        safe_print(f"FAILED: {e}")
        raise SystemExit(1)
