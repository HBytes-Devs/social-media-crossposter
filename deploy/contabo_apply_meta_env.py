"""Update Contabo .env Meta keys + recreate backend. Password from CONTABO_PASSWORD."""
from __future__ import annotations

import os
import re
import sys

import paramiko

HOST = os.environ.get("CONTABO_HOST", "169.58.63.125")
USER = os.environ.get("CONTABO_USER", "root")
PASSWORD = os.environ["CONTABO_PASSWORD"]
REMOTE = "/opt/social-media-crossposter"

UPDATES = {
    "API_BASE_URL": "http://169.58.63.125",
    "FRONTEND_URL": "http://169.58.63.125",
    "META_APP_ID": os.environ["META_APP_ID"],
    "META_APP_SECRET": os.environ["META_APP_SECRET"],
    "META_REDIRECT_URI": "http://169.58.63.125/api/v1/accounts/facebook/callback",
    "META_INSTAGRAM_REDIRECT_URI": "http://169.58.63.125/api/v1/accounts/instagram/callback",
    "META_CONFIG_ID": os.environ.get("META_CONFIG_ID", ""),
    "RECAPTCHA_SECRET_KEY": "",
    "LINKEDIN_CLIENT_ID": os.environ.get("LINKEDIN_CLIENT_ID", ""),
    "LINKEDIN_CLIENT_SECRET": os.environ.get("LINKEDIN_CLIENT_SECRET", ""),
    "LINKEDIN_REDIRECT_URI": "http://169.58.63.125/api/v1/accounts/linkedin/callback",
    "SUPER_ADMIN_EMAILS": "haseebcodejourney@gmail.com",
}


def safe_print(text: str) -> None:
    enc = getattr(sys.stdout, "encoding", None) or "utf-8"
    sys.stdout.buffer.write((text + "\n").encode(enc, errors="replace"))
    sys.stdout.flush()


def run(ssh: paramiko.SSHClient, cmd: str, timeout: int = 900) -> tuple[int, str]:
    safe_print(f"$ {cmd}")
    _stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout, get_pty=True)
    out = stdout.read().decode("utf-8", errors="replace")
    err = stderr.read().decode("utf-8", errors="replace")
    code = stdout.channel.recv_exit_status()
    text = (out + ("\n" + err if err.strip() else "")).strip()
    if text:
        # avoid dumping secrets
        safe = re.sub(r"(SECRET|PASSWORD|PASS|TOKEN|KEY)=([^\s]+)", r"\1=***", text)
        safe_print(safe[-5000:])
    safe_print(f"[exit {code}]")
    return code, text


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
        if key not in seen and value != "":
            out.append(f"{key}={value}")
        elif key not in seen and key == "RECAPTCHA_SECRET_KEY":
            out.append("RECAPTCHA_SECRET_KEY=")
    return "\n".join(out) + "\n"


def main() -> int:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print(f"Connecting {USER}@{HOST} ...")
    ssh.connect(HOST, username=USER, password=PASSWORD, timeout=30)

    code, _ = run(ssh, f"cd {REMOTE} && git pull origin master")
    if code != 0:
        print("git pull failed (continuing if tree exists)")

    sftp = ssh.open_sftp()
    remote_env = f"{REMOTE}/.env"
    with sftp.open(remote_env, "r") as f:
        current = f.read().decode("utf-8", errors="replace")
    updated = upsert_env(current, UPDATES)
    with sftp.open(remote_env, "w") as f:
        f.write(updated)
    sftp.close()
    print("Updated remote .env (Meta + Contabo redirects, reCAPTCHA cleared)")

    code, _ = run(
        ssh,
        f"cd {REMOTE} && docker compose -f docker-compose.prod.yml --env-file .env up -d --force-recreate backend",
    )
    if code != 0:
        ssh.close()
        return code

    # seed users (copy mjs if needed)
    run(ssh, f"cd {REMOTE} && docker compose -f docker-compose.prod.yml --env-file .env exec -T backend mkdir -p /app/scripts")
    run(
        ssh,
        f"cd {REMOTE} && docker compose -f docker-compose.prod.yml --env-file .env cp backend/scripts/seed-roles-users.mjs backend:/app/scripts/seed-roles-users.mjs",
    )
    run(
        ssh,
        f"cd {REMOTE} && docker compose -f docker-compose.prod.yml --env-file .env exec -T backend node /app/scripts/seed-roles-users.mjs",
    )

    run(ssh, "curl -s http://127.0.0.1/api/v1/health")
    run(ssh, "curl -s http://127.0.0.1/api/v1/auth/config")

    ssh.close()
    print("DONE")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except KeyError as e:
        print(f"Missing env var: {e}", file=sys.stderr)
        raise SystemExit(2)
    except Exception as e:
        print(f"FAILED: {e}", file=sys.stderr)
        raise SystemExit(1)
