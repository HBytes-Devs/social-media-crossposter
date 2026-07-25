"""Set demo users to PREMIUM ACTIVE on Contabo."""
from __future__ import annotations

import os
import sys

import paramiko

HOST = os.environ.get("CONTABO_HOST", "169.58.63.125")
USER = os.environ.get("CONTABO_USER", "root")
PASSWORD = os.environ["CONTABO_PASSWORD"]
REMOTE = "/opt/social-media-crossposter"

SQL = (
    "UPDATE \\\"User\\\" SET "
    "\\\"subscriptionTier\\\" = 'PREMIUM', "
    "\\\"subscriptionStatus\\\" = 'ACTIVE' "
    "WHERE email IN ("
    "'user@hawkbytes.com',"
    "'admin@hawkbytes.com',"
    "'haseebcodejourney@gmail.com'"
    "); "
    "SELECT email, \\\"subscriptionTier\\\", \\\"subscriptionStatus\\\" FROM \\\"User\\\" "
    "WHERE email IN ("
    "'user@hawkbytes.com',"
    "'admin@hawkbytes.com',"
    "'haseebcodejourney@gmail.com'"
    ");"
)


def main() -> int:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PASSWORD, timeout=40, banner_timeout=40)
    cmd = (
        f"cd {REMOTE} && docker compose -f docker-compose.prod.yml --env-file .env "
        f'exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "{SQL}"'
    )
    # Prefer explicit env from compose file via shell expansion on host
    cmd = (
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
    )
    print(f"$ {cmd[:120]}...")
    _i, o, e = ssh.exec_command(cmd, timeout=120, get_pty=True)
    out = o.read().decode("utf-8", errors="replace")
    err = e.read().decode("utf-8", errors="replace")
    code = o.channel.recv_exit_status()
    print(out[-4000:])
    if err.strip():
        print(err[-2000:])
    print(f"[exit {code}]")
    ssh.close()
    return code


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as ex:
        print(f"FAILED: {ex}", file=sys.stderr)
        raise SystemExit(1)
