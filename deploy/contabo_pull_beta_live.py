"""Pull beta-version on Contabo and rebuild the live stack. Keeps existing .env."""

from __future__ import annotations

import os
import sys

import paramiko

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

HOST = os.environ.get("CONTABO_HOST", "169.58.63.125")
USER = os.environ.get("CONTABO_USER", "root")
PASSWORD = os.environ.get("CONTABO_PASSWORD")
REMOTE = "/opt/social-media-crossposter"
BRANCH = os.environ.get("DEPLOY_BRANCH", "beta-version")


def run(ssh: paramiko.SSHClient, cmd: str, timeout: int = 1800) -> tuple[int, str]:
    print(f"$ {cmd}")
    _i, o, e = ssh.exec_command(cmd, timeout=timeout, get_pty=True)
    out = o.read().decode("utf-8", errors="replace")
    err = e.read().decode("utf-8", errors="replace")
    code = o.channel.recv_exit_status()
    if out.strip():
        print(out[-5000:])
    if err.strip():
        print(err[-2000:])
    print(f"[exit {code}]")
    return code, out


def main() -> int:
    if not PASSWORD:
        print("CONTABO_PASSWORD is required", file=sys.stderr)
        return 2

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PASSWORD, timeout=40, banner_timeout=40)

    cmds = [
        f"cd {REMOTE} && git remote -v && git status -sb",
        f"cd {REMOTE} && git fetch origin {BRANCH}",
        # Preserve VPS-only edits, then hard-sync to the deploy branch
        f'cd {REMOTE} && git stash push -u -m "pre-{BRANCH}-deploy" || true',
        f"cd {REMOTE} && git checkout -f {BRANCH} && git reset --hard origin/{BRANCH}",
        f"cd {REMOTE} && git log -1 --oneline && git status -sb",
        f"cd {REMOTE} && docker compose -f docker-compose.prod.yml --env-file .env up -d --build",
        f"cd {REMOTE} && docker compose -f docker-compose.prod.yml ps",
        "curl -skS https://127.0.0.1/api/v1/health || curl -sS http://127.0.0.1/api/v1/health || true",
        # Keep demo users on Premium after rebuild
        (
            f"cd {REMOTE} && set -a && . ./.env && set +a && "
            "docker compose -f docker-compose.prod.yml --env-file .env "
            'exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" '
            "-c \"UPDATE \\\"User\\\" SET \\\"subscriptionTier\\\"='PREMIUM', "
            "\\\"subscriptionStatus\\\"='ACTIVE' "
            "WHERE email IN ('user@hawkbytes.com','admin@hawkbytes.com',"
            "'haseebcodejourney@gmail.com'); "
            "SELECT email, \\\"subscriptionTier\\\", \\\"subscriptionStatus\\\" FROM \\\"User\\\" "
            "WHERE email IN ('user@hawkbytes.com','admin@hawkbytes.com',"
            "'haseebcodejourney@gmail.com');\""
        ),
    ]

    for cmd in cmds:
        code, _ = run(ssh, cmd, timeout=1800 if "docker compose" in cmd else 180)
        if code != 0 and "docker compose" in cmd and "psql" not in cmd:
            ssh.close()
            return code

    ssh.close()
    print("LIVE_DEPLOY_DONE")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
