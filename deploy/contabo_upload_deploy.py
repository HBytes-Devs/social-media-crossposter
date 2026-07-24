"""Upload local project to Contabo and start Docker stack. No GitHub required."""

from __future__ import annotations

import os
import secrets
import sys
import tarfile
import tempfile
import time
from pathlib import Path

import paramiko

# Avoid Windows console UnicodeEncodeError on docker checkmarks etc.
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

HOST = os.environ["CONTABO_HOST"]
USER = os.environ.get("CONTABO_USER", "root")
PASSWORD = os.environ["CONTABO_PASSWORD"]
LOCAL_ROOT = Path(__file__).resolve().parents[1]
VPS_IP = HOST
REMOTE_DIR = "/opt/social-media-crossposter"

EXCLUDE_DIRS = {
    "node_modules",
    "dist",
    ".git",
    ".cursor",
    "coverage",
    "__pycache__",
    ".vite",
}
EXCLUDE_FILES = {".env", ".DS_Store", "Thumbs.db"}


def run(ssh: paramiko.SSHClient, cmd: str, timeout: int = 600) -> tuple[int, str, str]:
    print(f"$ {cmd}")
    _stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout, get_pty=True)
    out = stdout.read().decode("utf-8", errors="replace")
    err = stderr.read().decode("utf-8", errors="replace")
    code = stdout.channel.recv_exit_status()
    if out.strip():
        print(out[-4000:])
    if err.strip():
        print(err[-2000:])
    print(f"[exit {code}]")
    return code, out, err


def should_exclude(path: Path) -> bool:
    parts = set(path.parts)
    if parts & EXCLUDE_DIRS:
        return True
    if path.name in EXCLUDE_FILES:
        return True
    if path.suffix in {".log", ".pyc"}:
        return True
    return False


def make_archive(dest: Path) -> None:
    with tarfile.open(dest, "w:gz") as tar:
        for root, dirs, files in os.walk(LOCAL_ROOT):
            root_path = Path(root)
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
            for name in files:
                file_path = root_path / name
                if should_exclude(file_path.relative_to(LOCAL_ROOT)):
                    continue
                arcname = Path("social-media-crossposter") / file_path.relative_to(LOCAL_ROOT)
                tar.add(file_path, arcname=str(arcname).replace("\\", "/"))


def build_env() -> str:
    example = (LOCAL_ROOT / "deploy" / ".env.prod.example").read_text(encoding="utf-8")
    example = example.replace("185.98.83.125", VPS_IP).replace("169.58.63.125", VPS_IP)

    db_pass = secrets.token_urlsafe(18)
    replacements = {
        "API_BASE_URL": f"http://{VPS_IP}",
        "FRONTEND_URL": f"http://{VPS_IP}",
        "POSTGRES_USER": "smc",
        "POSTGRES_PASSWORD": db_pass,
        "POSTGRES_DB": "smc_db",
        "DATABASE_URL": f"postgresql://smc:{db_pass}@postgres:5432/smc_db",
        "REDIS_URL": "redis://redis:6379",
        "JWT_SECRET": secrets.token_hex(32),
        "JWT_EXPIRES_IN": "24h",
        "TOKEN_ENCRYPTION_KEY": secrets.token_hex(32),
        "LINKEDIN_REDIRECT_URI": f"http://{VPS_IP}/api/v1/accounts/linkedin/callback",
        "META_REDIRECT_URI": f"http://{VPS_IP}/api/v1/accounts/facebook/callback",
        "META_INSTAGRAM_REDIRECT_URI": f"http://{VPS_IP}/api/v1/accounts/instagram/callback",
        "META_ADS_REDIRECT_URI": f"http://{VPS_IP}/api/v1/meta-ads/callback",
        "TWITTER_REDIRECT_URI": f"http://{VPS_IP}/api/v1/accounts/twitter/callback",
        "REDDIT_REDIRECT_URI": f"http://{VPS_IP}/api/v1/accounts/reddit/callback",
        "GOOGLE_ADS_REDIRECT_URI": f"http://{VPS_IP}/api/v1/google-ads/callback",
        "LINKEDIN_ADS_REDIRECT_URI": f"http://{VPS_IP}/api/v1/linkedin-ads/callback",
        "STRIPE_SUCCESS_URL": f"http://{VPS_IP}/settings?billing=success",
        "STRIPE_CANCEL_URL": f"http://{VPS_IP}/settings?billing=canceled",
    }

    lines: list[str] = []
    seen: set[str] = set()
    for line in example.splitlines():
        if not line.strip() or line.strip().startswith("#") or "=" not in line:
            lines.append(line)
            continue
        key = line.split("=", 1)[0].strip()
        if key in replacements:
            lines.append(f"{key}={replacements[key]}")
            seen.add(key)
        else:
            lines.append(line)

    for key, value in replacements.items():
        if key not in seen:
            lines.append(f"{key}={value}")

    return "\n".join(lines) + "\n"


def main() -> None:
    with tempfile.TemporaryDirectory() as tmp:
        archive = Path(tmp) / "smc.tar.gz"
        print("Creating archive...")
        make_archive(archive)
        print(f"Archive size: {archive.stat().st_size / (1024 * 1024):.1f} MB")

        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        print("Connecting...")
        ssh.connect(HOST, username=USER, password=PASSWORD, timeout=30)
        print("Connected")

        run(ssh, f"rm -rf {REMOTE_DIR} /opt/smc.tar.gz")
        sftp = ssh.open_sftp()
        print("Uploading archive...")
        sftp.put(str(archive), "/opt/smc.tar.gz")
        print("Upload complete")

        run(ssh, "cd /opt && tar -xzf smc.tar.gz && rm -f smc.tar.gz")

        with sftp.file(f"{REMOTE_DIR}/.env", "w") as handle:
            handle.write(build_env())
        sftp.close()
        print("Wrote production .env")

        code, _out, _err = run(
            ssh,
            f"cd {REMOTE_DIR} && docker compose -f docker-compose.prod.yml --env-file .env up -d --build",
            timeout=1800,
        )
        print("Compose finished with", code)

        time.sleep(12)
        run(ssh, f"cd {REMOTE_DIR} && docker compose -f docker-compose.prod.yml ps")
        run(ssh, "curl -sS http://127.0.0.1/api/v1/health || true")
        run(ssh, f"curl -sS http://{VPS_IP}/api/v1/health || true")

        ssh.close()
        print("DONE")


if __name__ == "__main__":
    main()
