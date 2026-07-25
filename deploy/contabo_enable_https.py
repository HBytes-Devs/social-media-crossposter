"""Enable HTTPS on Contabo via sslip.io + Let's Encrypt (Facebook OAuth requires HTTPS)."""
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
DOMAIN = "169.58.63.125.sslip.io"
PUBLIC = f"https://{DOMAIN}"
LOCAL_ROOT = Path(__file__).resolve().parents[1]

URL_UPDATES = {
    "API_BASE_URL": PUBLIC,
    "FRONTEND_URL": PUBLIC,
    "META_REDIRECT_URI": f"{PUBLIC}/api/v1/accounts/facebook/callback",
    "META_INSTAGRAM_REDIRECT_URI": f"{PUBLIC}/api/v1/accounts/instagram/callback",
    "LINKEDIN_REDIRECT_URI": f"{PUBLIC}/api/v1/accounts/linkedin/callback",
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
        safe = re.sub(r"(SECRET|PASSWORD|PASS|TOKEN|KEY)=([^\s]+)", r"\1=***", text)
        safe_print(safe[-7000:])
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
        if key not in seen:
            out.append(f"{key}={value}")
    return "\n".join(out) + "\n"


def sftp_put(sftp: paramiko.SFTPClient, local: Path, remote: str) -> None:
    safe_print(f"upload {local.name} -> {remote}")
    sftp.put(str(local), remote)


def main() -> int:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    safe_print(f"Connecting {USER}@{HOST} ...")
    ssh.connect(HOST, username=USER, password=PASSWORD, timeout=40, banner_timeout=40)
    sftp = ssh.open_sftp()

    run(
        ssh,
        f"mkdir -p {REMOTE}/deploy/nginx {REMOTE}/deploy/certbot/www "
        f"{REMOTE}/deploy/certbot/conf {REMOTE}/deploy/certbot/work {REMOTE}/deploy/certbot/logs",
    )
    sftp_put(
        sftp,
        LOCAL_ROOT / "deploy/nginx/default.http-bootstrap.conf",
        f"{REMOTE}/deploy/nginx/default.conf",
    )
    sftp_put(sftp, LOCAL_ROOT / "docker-compose.prod.yml", f"{REMOTE}/docker-compose.prod.yml")

    run(ssh, "command -v ufw >/dev/null && ufw allow 443/tcp || true")
    run(ssh, "command -v ufw >/dev/null && ufw allow 80/tcp || true")

    # Phase 1: HTTP-only proxy so ACME challenge works
    run(
        ssh,
        f"cd {REMOTE} && docker compose -f docker-compose.prod.yml --env-file .env up -d --force-recreate proxy",
    )

    run(ssh, "apt-get update -qq && DEBIAN_FRONTEND=noninteractive apt-get install -y -qq certbot")
    code, _ = run(
        ssh,
        "certbot certonly --webroot "
        f"-w {REMOTE}/deploy/certbot/www "
        f"-d {DOMAIN} "
        "--email admin@hawkbytes.com --agree-tos --non-interactive "
        f"--config-dir {REMOTE}/deploy/certbot/conf "
        f"--work-dir {REMOTE}/deploy/certbot/work "
        f"--logs-dir {REMOTE}/deploy/certbot/logs",
    )
    if code != 0:
        safe_print("Let's Encrypt failed — open Contabo firewall TCP 80 (and 443)")
        sftp.close()
        ssh.close()
        return code

    # Phase 2: full HTTPS nginx
    sftp_put(sftp, LOCAL_ROOT / "deploy/nginx/default.conf", f"{REMOTE}/deploy/nginx/default.conf")
    run(
        ssh,
        f"cd {REMOTE} && docker compose -f docker-compose.prod.yml --env-file .env up -d --force-recreate proxy",
    )

    with sftp.open(f"{REMOTE}/.env", "r") as f:
        current = f.read().decode("utf-8", errors="replace")
    updated = upsert_env(current, URL_UPDATES)
    with sftp.open(f"{REMOTE}/.env", "w") as f:
        f.write(updated)
    safe_print("Updated .env to HTTPS sslip URLs")

    run(
        ssh,
        f"cd {REMOTE} && docker compose -f docker-compose.prod.yml --env-file .env up -d --force-recreate backend proxy",
    )
    run(ssh, "sleep 4")
    run(ssh, f"curl -sS -m 15 https://{DOMAIN}/api/v1/health || true")
    run(
        ssh,
        f"cd {REMOTE} && docker compose -f docker-compose.prod.yml --env-file .env exec -T backend "
        "node -e \"console.log('API_BASE_URL='+process.env.API_BASE_URL); "
        "console.log('META_REDIRECT_URI='+process.env.META_REDIRECT_URI);\"",
    )

    sftp.close()
    ssh.close()
    safe_print("DONE")
    safe_print(f"App URL: {PUBLIC}")
    safe_print(f"FB callback: {PUBLIC}/api/v1/accounts/facebook/callback")
    safe_print(f"IG callback: {PUBLIC}/api/v1/accounts/instagram/callback")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as e:
        safe_print(f"FAILED: {e}")
        raise SystemExit(1)
