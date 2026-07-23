# Contabo Docker Deploy (IP-first)

This guide runs the full SMC stack on a Contabo VPS using Docker Compose and the server IP only.

Current target:

- VPS IP: `185.98.83.125`
- Protocol: `http`
- Stack: `nginx` + frontend + backend + PostgreSQL + Redis

## What this deploy includes

- [docker-compose.prod.yml](../docker-compose.prod.yml)
- [frontend/Dockerfile](../frontend/Dockerfile)
- [deploy/nginx/default.conf](../deploy/nginx/default.conf)
- [deploy/.env.prod.example](../deploy/.env.prod.example)

## 1. Open Contabo firewall

In Contabo panel, allow:

- `TCP 22` for SSH
- `TCP 80` for HTTP

Keep database ports closed publicly. PostgreSQL and Redis stay internal to Docker.

## 2. SSH into the VPS

```bash
ssh root@185.98.83.125
```

## 3. Install Docker and Compose plugin

Ubuntu / Debian:

```bash
apt update && apt upgrade -y
apt install -y ca-certificates curl gnupg
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo \"$VERSION_CODENAME\") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
systemctl enable docker
systemctl start docker
docker --version
docker compose version
```

## 4. Clone the project

```bash
cd /opt
git clone https://github.com/HBytes-Devs/social-media-crossposter.git
cd social-media-crossposter
```

## 5. Create production env file

```bash
cp deploy/.env.prod.example .env
nano .env
```

Minimum fields to set before first boot:

- `POSTGRES_PASSWORD`
- `DATABASE_URL` to match the password above
- `JWT_SECRET`
- `TOKEN_ENCRYPTION_KEY`
- `AWS_*` if image uploads are needed
- OAuth client IDs / secrets for any platforms you want active

For this IP-first setup, leave:

- `API_BASE_URL=http://185.98.83.125`
- `FRONTEND_URL=http://185.98.83.125`

## 6. Build and start the full stack

```bash
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

Check status:

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f proxy
```

## 7. Verify the deployment

Browser:

- `http://185.98.83.125`

API health:

```bash
curl http://185.98.83.125/api/v1/health
```

Expected result includes:

- `status: ok`
- `database: connected`

## 8. Common update flow

When new code is pushed:

```bash
cd /opt/social-media-crossposter
git pull origin master
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

## 9. Useful commands

Restart everything:

```bash
docker compose -f docker-compose.prod.yml --env-file .env restart
```

Stop everything:

```bash
docker compose -f docker-compose.prod.yml --env-file .env down
```

Stop and remove volumes too:

```bash
docker compose -f docker-compose.prod.yml --env-file .env down -v
```

## 10. Important limitation on IP-only HTTP

This setup is fine for initial testing, login, dashboard, posting, and core API flows.

OAuth caveat:

- Meta / Facebook / Instagram / LinkedIn usually work best with `https` redirect URIs
- On plain `http://IP`, some reconnect flows may fail or be blocked by provider rules

When you buy a domain later, next step should be:

1. Point domain to Contabo IP
2. Add nginx TLS config with Let's Encrypt
3. Update `FRONTEND_URL`
4. Update all OAuth `*_REDIRECT_URI` values
5. Reconnect social accounts if required
