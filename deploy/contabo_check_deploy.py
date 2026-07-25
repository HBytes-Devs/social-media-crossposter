"""Compare local workspace vs Contabo deployed sources + running backend image."""
from __future__ import annotations

import hashlib
import os
import sys
from pathlib import Path

import paramiko

LOCAL = Path(r"C:\Users\micro\social-media-crossposter")
REMOTE = "/opt/social-media-crossposter"
FILES = [
    "backend/src/platforms/instagram/instagram.adapter.ts",
    "backend/src/platforms/facebook/facebook.adapter.ts",
    "backend/src/platforms/platform.config.ts",
    "backend/src/config/env.ts",
    "docker-compose.prod.yml",
    "deploy/nginx/default.conf",
]


def safe_print(text: str) -> None:
    enc = getattr(sys.stdout, "encoding", None) or "utf-8"
    sys.stdout.buffer.write((text + "\n").encode(enc, errors="replace"))
    sys.stdout.flush()


def sha12(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()[:12]


def main() -> int:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(
        "169.58.63.125",
        username="root",
        password=os.environ["CONTABO_PASSWORD"],
        timeout=40,
    )
    sftp = ssh.open_sftp()

    safe_print("=== Local vs Contabo /opt source ===")
    diffs = 0
    for rel in FILES:
        local = LOCAL / rel
        remote = f"{REMOTE}/{rel}"
        lh = sha12(local.read_bytes()) if local.exists() else "MISSING"
        try:
            with sftp.open(remote, "rb") as f:
                rh = sha12(f.read())
        except Exception as e:  # noqa: BLE001
            rh = f"ERR:{e}"
        mark = "OK" if lh == rh else "DIFF"
        if mark == "DIFF":
            diffs += 1
        safe_print(f"{mark} {rel}\n    local={lh} remote={rh}")

    def run(cmd: str) -> str:
        _i, o, _e = ssh.exec_command(cmd, timeout=90, get_pty=True)
        return o.read().decode("utf-8", errors="replace")

    safe_print("\n=== Contabo git ===")
    safe_print(
        run(
            f"cd {REMOTE} && (git rev-parse --short HEAD; git log -1 --pretty='%h %s %ci'; "
            "git status -sb) 2>&1 | head -20"
        )
    )

    safe_print("=== Running backend image markers ===")
    safe_print(
        run(
            f"cd {REMOTE} && docker compose -f docker-compose.prod.yml --env-file .env exec -T backend "
            "node -e \"const fs=require('fs');"
            "const p='/app/dist/platforms/instagram/instagram.adapter.js';"
            "const t=fs.readFileSync(p,'utf8');"
            "console.log('has_rerequest='+t.includes('rerequest'));"
            "console.log('has_permissions_diag='+t.includes('Granted permissions'));"
            "console.log('has_page_token_enrich='+t.includes('connected_instagram_account'));"
            "console.log('mtime='+fs.statSync(p).mtime.toISOString());\""
        )
    )

    safe_print("=== Runtime env ===")
    safe_print(
        run(
            f"cd {REMOTE} && docker compose -f docker-compose.prod.yml --env-file .env exec -T backend "
            "node -e \"console.log('API_BASE_URL='+process.env.API_BASE_URL);"
            "console.log('PREFERRED='+(process.env.META_PREFERRED_PAGE_NAME||''));"
            "console.log('META_CONFIG_ID='+(process.env.META_CONFIG_ID?'SET':'EMPTY'));"
            "console.log('META_REDIRECT='+(process.env.META_REDIRECT_URI||''));"
            "console.log('IG_REDIRECT='+(process.env.META_INSTAGRAM_REDIRECT_URI||''));\""
        )
    )

    safe_print("=== Containers ===")
    safe_print(
        run(
            f"cd {REMOTE} && docker compose -f docker-compose.prod.yml ps "
            "--format 'table {{.Name}}\t{{.Status}}'"
        )
    )

    sftp.close()
    ssh.close()
    safe_print(f"\nSUMMARY source_file_diffs={diffs}")
    return 0 if diffs == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
