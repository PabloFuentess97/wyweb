# Despliegue · Wyweb · Hetzner + Coolify

Guía operativa end-to-end para desplegar la aplicación a producción.
Asume conocimientos básicos de SSH, DNS y Docker. **Tiempo estimado: 2–3 horas
la primera vez**, luego push-to-deploy automático.

---

## 0. Resumen de la arquitectura productiva

```
┌────────────────────────────────────────────────────────────────────┐
│  Hetzner Cloud · CCX23 · Helsinki                                  │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                    │
│   Coolify (Traefik + dashboard)                                    │
│     ├─ wyweb-net           → Next.js app (la imagen del repo)       │
│     ├─ db                 → Postgres 16 (volumen persistente)      │
│     ├─ redis              → Redis 7 (rate-limit / sesiones)        │
│     ├─ minio              → S3 self-hosted (PDFs, documentos)      │
│     ├─ plausible          → analytics.wyweb.es                     │
│     └─ glitchtip          → errors.wyweb.es                        │
│                                                                    │
│   Backups → Hetzner Storage Box (pgBackRest + WAL)                 │
└────────────────────────────────────────────────────────────────────┘
```

| Subdominio              | Servicio       | Acceso             |
| ----------------------- | -------------- | ------------------ |
| `wyweb.es`              | App Next.js    | Público            |
| `s3.wyweb.es`           | MinIO API      | Público (firmado)  |
| `s3-console.wyweb.es`   | MinIO consola  | Basic Auth + IP    |
| `analytics.wyweb.es`    | Plausible      | Basic Auth         |
| `errors.wyweb.es`       | Glitchtip      | Basic Auth         |
| `coolify.wyweb.es`      | Coolify panel  | Solo IP allowlist  |

---

## 1. Provisioning del VPS (Hetzner Cloud)

### 1.1 Crear servidor

1. Login en https://console.hetzner.cloud
2. **New project** → "Wyweb Net" (si todavía no existe).
3. **Servers → Add Server**:
   - **Location**: Helsinki (`hel1`) o Falkenstein (`fsn1`).
     Helsinki tiene mejor latencia para Granada y misma legislación EU.
   - **Image**: Ubuntu 24.04
   - **Type**: **CCX23** — 4 vCPU dedicados (AMD), 16 GB RAM, 160 GB NVMe.
   - **Networking**: deja IPv4 + IPv6 públicas.
   - **SSH key**: añade tu clave pública (genera con `ssh-keygen -t ed25519`
     si no tienes).
   - **Firewall**: salta este paso, configuramos después.
   - **Name**: `wyweb-net-prod-01`
4. Anota la IP pública (ejemplo: `49.12.34.56`).

### 1.2 Firewall Hetzner

Crea **Firewalls → New firewall** con estas reglas inbound:

| Protocolo | Puerto | Origen          | Descripción                  |
| --------- | ------ | --------------- | ---------------------------- |
| TCP       | 22     | Tu IP / VPN     | SSH (no `0.0.0.0/0`)         |
| TCP       | 80     | `0.0.0.0/0`     | HTTP (Let's Encrypt)         |
| TCP       | 443    | `0.0.0.0/0`     | HTTPS                        |
| TCP       | 6001   | Tu IP           | Coolify dashboard (alt.)     |
| TCP       | 8000   | Tu IP           | Coolify dashboard (default)  |

Asocia el firewall al servidor `wyweb-net-prod-01`.

### 1.3 Hardening básico del SO

```bash
# Login como root con tu key
ssh root@49.12.34.56

# Actualiza
apt-get update && apt-get upgrade -y
apt-get install -y ufw fail2ban unattended-upgrades

# Crea usuario no-root
adduser --disabled-password --gecos "" deploy
usermod -aG sudo deploy
mkdir -p /home/deploy/.ssh
cp ~/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys

# Endurece SSH
sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart ssh

# Updates desatendidos
dpkg-reconfigure --priority=low unattended-upgrades

# UFW (segunda capa además del firewall Hetzner)
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

A partir de ahora conéctate como `deploy`:
```bash
ssh deploy@49.12.34.56
```

### 1.4 Swap (recomendado en Coolify)

```bash
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## 2. DNS

Configura los registros A (y AAAA si quieres IPv6) en tu registrar:

| Nombre              | Tipo | Valor          | TTL   |
| ------------------- | ---- | -------------- | ----- |
| `@` (wyweb.es)      | A    | `49.12.34.56`  | 300   |
| `www`               | A    | `49.12.34.56`  | 300   |
| `s3`                | A    | `49.12.34.56`  | 300   |
| `s3-console`        | A    | `49.12.34.56`  | 300   |
| `analytics`         | A    | `49.12.34.56`  | 300   |
| `errors`            | A    | `49.12.34.56`  | 300   |
| `coolify`           | A    | `49.12.34.56`  | 300   |

Verifica que se han propagado:
```bash
dig +short wyweb.es
dig +short s3.wyweb.es
```

Espera a que devuelvan tu IP antes de seguir (Let's Encrypt fallará si DNS no está listo).

---

## 3. Instalación de Coolify

```bash
ssh deploy@49.12.34.56
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | sudo bash
```

El script hace:
- Instala Docker y Docker Compose.
- Levanta Coolify en `http://49.12.34.56:8000`.
- Te muestra un token de instalación que **anotas** — es la contraseña de
  primer login.

Abre `http://49.12.34.56:8000` en el navegador, completa el setup wizard:
1. Crea tu cuenta de admin.
2. **Settings → Instance** → pon `coolify.wyweb.es` como FQDN.
3. **Settings → Instance → Public IPv4** → confirma `49.12.34.56`.
4. Habilita Let's Encrypt en `Settings → Email`.

A partir de aquí accede vía `https://coolify.wyweb.es` (Coolify saca cert
automáticamente para sí mismo).

---

## 4. Servicios base

> **Recomendación**: usa el approach **Coolify-managed services** (cada servicio
> es un "Resource" en Coolify, gestionado individualmente). Si prefieres el
> approach single-stack, usa el `docker-compose.production.yml` del repo y salta
> a la sección 5.

### 4.1 Postgres 16

1. **Project → wyweb-net → New Resource → Database → PostgreSQL**.
2. Versión: **16**.
3. **Name**: `wyweb-net-db`.
4. **Username**: `uxea`. **Database**: `uxea_net`. Password: genera con
   `openssl rand -base64 24`.
5. **Storage**: 30 GB (suficiente para los primeros años; ampliable).
6. **Init script** (importante):
   ```sql
   CREATE EXTENSION IF NOT EXISTS "citext";
   CREATE EXTENSION IF NOT EXISTS "pgcrypto";
   ```
7. **Public**: `false` (solo accesible por servicios internos de Coolify).
8. **Backups**: Coolify ofrece backups automáticos a S3 — configúralos
   apuntando a Hetzner Storage Box en F5 (paso 38).

Anota el **DATABASE_URL interno** que Coolify te muestra (formato
`postgres://wyweb:xxx@wyweb-net-db:5432/wyweb`).

### 4.2 Redis 7

1. **New Resource → Database → Redis** → versión 7.
2. **Name**: `wyweb-net-redis`.
3. **Public**: `false`.
4. **Persistence**: AOF habilitado.

Anota el **REDIS_URL interno** (`redis://wyweb-net-redis:6379`).

### 4.3 MinIO

Coolify no tiene MinIO como recurso nativo, así que lo añadimos como
**Service → Custom (Docker Compose)**:

```yaml
# Coolify Service: wyweb-net-minio
services:
  minio:
    image: minio/minio:latest
    restart: unless-stopped
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD}
      MINIO_BROWSER_REDIRECT_URL: https://s3-console.wyweb.es
      MINIO_SERVER_URL: https://s3.wyweb.es
    volumes:
      - minio-data:/data
    labels:
      - "coolify.managed=true"
      # Traefik labels los añade Coolify automáticamente cuando le indicas
      # los dominios desde la UI (ver siguiente paso).

volumes:
  minio-data:
```

En la UI de Coolify, en el servicio MinIO:
1. **Domains**: `s3.wyweb.es` → puerto interno `9000` (API S3).
2. **Domains**: `s3-console.wyweb.es` → puerto interno `9001` (consola web).
3. **Variables**:
   - `MINIO_ROOT_USER`: genera con `openssl rand -hex 12`.
   - `MINIO_ROOT_PASSWORD`: genera con `openssl rand -base64 32`.
4. **Save & Deploy**.

Verifica SSL: `https://s3.wyweb.es/minio/health/live` debe devolver 200.

#### Crear bucket inicial

Desde la consola en `https://s3-console.wyweb.es`:
1. Login con `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD`.
2. **Buckets → Create Bucket** → nombre `wyweb-net`. Sin object locking, sin
   versioning (puedes activar versioning más tarde si quieres).
3. **Identity → Service Accounts → Create**:
   - Pol restrictiva: solo PutObject/GetObject sobre `wyweb-net/*`.
   - Anota Access Key + Secret Key — irán a las env vars de la app.

---

## 5. Aplicación Next.js

### 5.1 Crear el resource

1. **Project → wyweb-net → New Resource → Application**.
2. **Source**:
   - Repository: `https://github.com/PabloFuentess97/wyweb`.
   - Branch: `main`.
   - **Build Pack**: `Dockerfile`.
   - **Dockerfile location**: `docker/Dockerfile`.
   - **Base directory**: `/`.
3. **Domain**: `https://wyweb.es,https://www.wyweb.es` (Coolify hará el
   redirect www → apex).
4. **Port**: `3000`.

### 5.2 Variables de entorno

Pega en **Environment Variables** (Coolify las inyecta en build y runtime):

```
# Core
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://wyweb.es

# Auth.js (genera con: openssl rand -base64 48)
AUTH_SECRET=<48 bytes base64>
AUTH_URL=https://wyweb.es
AUTH_TRUST_HOST=true

# DB / Redis (URLs internas que te dio Coolify)
DATABASE_URL=postgres://wyweb:<pwd>@wyweb-net-db:5432/wyweb
REDIS_URL=redis://wyweb-net-redis:6379

# Storage (S3 service account, no las root credentials)
S3_ENDPOINT=https://s3.wyweb.es
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=<service account access key>
S3_SECRET_ACCESS_KEY=<service account secret>
S3_BUCKET=wyweb-net
S3_PUBLIC_URL=https://s3.wyweb.es

# Email (Resend con dominio wyweb.es verificado)
RESEND_API_KEY=re_xxx
EMAIL_FROM=Wyweb <noreply@wyweb.es>
EMAIL_TO_LEADS=info@wyweb.es

# App
APP_ENCRYPTION_KEY=<32+ chars: openssl rand -base64 32>
CRON_SECRET=<32+ chars: openssl rand -base64 32>

# Billing
BILLING_PROVIDER=self-built

# GitHub integration
GITHUB_REPO_URL=https://github.com/PabloFuentess97/wyweb
GITHUB_DEFAULT_BRANCH=main

# Observabilidad (cuando Glitchtip esté arriba — paso 38)
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=wyweb.es
```

> ⚠️ **Build args vs runtime**: las que empiezan con `NEXT_PUBLIC_` se
> inlinean en el bundle del cliente, así que tienen que estar disponibles **en
> build time**. En Coolify marca esas como "Available at buildtime".

### 5.3 Deploy

1. **Save**.
2. **Deploy** → Coolify clona, construye la imagen Docker (usa `docker/Dockerfile`),
   ejecuta el container con `entrypoint.sh` (que aplica migraciones primero).
3. Sigue logs en tiempo real desde la UI.
4. Cuando el healthcheck pase verde → la app está live en `https://wyweb.es`.

---

## 6. CI/CD con GitHub Actions

El repo trae dos workflows en `.github/workflows/`:

### 6.1 `ci.yml` — validación en PRs

Triggers: `pull_request` a `main`, push a ramas feature.
Jobs paralelos:
- **lint** — `pnpm lint`
- **typecheck** — `pnpm typecheck`
- **build (smoke)** — `pnpm build` con cache de `.next/cache`

No requiere secrets — usa env vars fake para que `@t3-oss/env-nextjs` valide
sin acceder a recursos reales.

### 6.2 `deploy.yml` — deploy automático en push a `main`

Pipeline:
1. **validate** — lint + typecheck (rápido, falla pronto si hay regresión).
2. **build-and-push** — Docker buildx → empuja a `ghcr.io/<owner>/wyweb`
   con tags `:latest`, `:<git-sha>`, `:main-<sha7>`. Cache buildx vía
   GitHub Actions (`type=gha`).
3. **deploy** — `curl` al webhook de Coolify con bearer token.
4. **smoke-test** — espera 60s y golpea `https://wyweb.es/` esperando 200
   (no bloqueante; solo warning si falla).

### 6.3 Secrets requeridos en GitHub

Ve a **GitHub → repo → Settings → Secrets and variables → Actions** y crea:

| Secret                  | De dónde sacarlo                                     |
| ----------------------- | ---------------------------------------------------- |
| `COOLIFY_WEBHOOK_URL`   | Coolify → app → **Webhooks** → "Deploy webhook URL". Suele tener el formato `https://coolify.wyweb.es/api/v1/deploy?uuid=xxx` |
| `COOLIFY_API_TOKEN`     | Coolify → **Profile → API tokens → Create token**. Permisos: `deploy` sobre el resource de la app. |

`GITHUB_TOKEN` ya viene incluido (auto-emitido) y se usa para autenticar
contra GHCR — no hace falta crearlo manualmente.

### 6.4 Configurar Coolify para pull desde GHCR

Si la app está configurada como "Application from Git", Coolify puede
construir la imagen él mismo. Pero ya que CI/CD construye y empuja a GHCR,
es mejor cambiar a "Existing Docker Image":

1. Coolify → app → **Sources** → cambia a **Docker Registry**.
2. **Image**: `ghcr.io/pablofuentess97/wyweb:latest`
3. **Registry credentials**:
   - Crea un PAT en GitHub con scope `read:packages`.
   - Coolify → **Settings → Private Registries → Add Registry**:
     - Name: `ghcr`
     - URL: `ghcr.io`
     - Username: tu usuario GitHub
     - Password: el PAT
4. Asocia el registry a la app.
5. Cuando el deploy webhook se dispara, Coolify hace `docker pull
   ghcr.io/.../wyweb:latest` y reinicia con la imagen nueva.

### 6.5 Webhook GitHub → Coolify (alternativa sin Actions)

Si NO quieres pasar por GitHub Actions y prefieres que Coolify haga la build:

1. En Coolify → tu app → **Webhooks** → copia la **Webhook URL**.
2. En GitHub → repo → **Settings → Webhooks → Add webhook**:
   - URL: la de Coolify.
   - Content type: `application/json`.
   - Secret: el que genera Coolify.
   - Events: **Just the push event**.
3. Activa en Coolify → app → **Settings → Auto Deploy**.

Esta ruta es más simple pero pierde:
- Validación lint/typecheck antes del deploy (puedes romper prod con un PR mergeado).
- Cache buildx compartido entre workflows.
- Tags inmutables por SHA (rollbacks más simples).

**Recomendado: la ruta CI/CD (6.1–6.4)**.

---

## 7. Primer admin

Una vez la app está arriba, no hay manera de loguearse porque la BD está
vacía. Ejecuta el script de creación de staff dentro del container:

```bash
# Lista contenedores
docker ps | grep wyweb-net-app

# Ejecuta dentro
docker exec -it <container_id> sh
node ./node_modules/.bin/tsx ./scripts/create-staff.ts \
  --email tu@email.com \
  --name "Tu Nombre" \
  --role staff_admin
```

> El script `create-staff.ts` usa tsx, que **no está en runtime de
> producción** (lo eliminé del runner para reducir la imagen). Dos opciones:
>
> 1. **Insert directo** vía `docker exec` + psql (más simple para 1 vez):
>    ```bash
>    docker exec -it wyweb-net-db psql -U wyweb -d wyweb
>    ```
>    luego:
>    ```sql
>    -- Hash con argon2id (ejecuta antes en local: pnpm tsx scripts/hash-pwd.ts <pwd>)
>    INSERT INTO users (email, name, password_hash, role, email_verified_at)
>    VALUES ('tu@email.com', 'Tu Nombre', '<hash>', 'staff_admin', now());
>    ```
> 2. **One-shot container** que sí incluye tsx:
>    ```bash
>    docker run --rm --network coolify -e DATABASE_URL=... \
>      wyweb-net:latest \
>      sh -c "node ./node_modules/.bin/tsx ./scripts/create-staff.ts ..."
>    ```
>    No funciona out-of-the-box porque el runner no incluye tsx; necesitarías
>    una imagen específica para tareas o crear el primer admin desde local
>    apuntando a la BD prod.

**La forma más práctica**: corre `pnpm create-staff` desde tu máquina local
con `DATABASE_URL` apuntando a la BD prod (un solo uso, después se gestionan
desde `/admin/usuarios`).

---

## 8. Verificación post-deploy

| Check                                           | Cómo                                          |
| ----------------------------------------------- | --------------------------------------------- |
| Home pública carga                              | `curl -I https://wyweb.es` → 200              |
| HTTPS forzado                                   | `curl -I http://wyweb.es` → 301 a https       |
| Login funciona                                  | UI: `/login` con tu admin                     |
| Migraciones aplicadas                           | logs del entrypoint: "✓ Migraciones aplicadas" |
| MinIO accesible desde la app                    | sube un documento desde `/admin/documentos`   |
| PDFs de facturas se generan y descargan         | emite una factura draft de prueba             |
| Webhook GitHub responde                         | git push a `main` → Coolify dispara redeploy  |
| Sin errores en logs                             | `docker compose logs app` desde Coolify       |

---

## 9. Operativa diaria

| Tarea                            | Comando / acción                              |
| -------------------------------- | --------------------------------------------- |
| Ver logs en vivo                 | Coolify UI → app → **Logs**                   |
| Forzar redeploy                  | Coolify UI → app → **Deploy** (botón manual)  |
| Rollback a versión anterior      | Coolify UI → app → **Deployments** → Restore  |
| Conectar a Postgres              | `docker exec -it wyweb-net-db psql -U uxea`    |
| Conectar a Redis                 | `docker exec -it wyweb-net-redis redis-cli`    |
| Aplicar migración manual         | `docker exec wyweb-net-app node scripts/db-migrate.mjs` |
| Reiniciar solo la app            | Coolify UI → app → **Restart**                |
| Ampliar disco DB                 | Hetzner Cloud → Volumes (no requiere reinicio)|

---

## 10. Costes estimados (orientativos, año 2026)

| Recurso                       | €/mes  |
| ----------------------------- | ------ |
| Hetzner CCX23                 | ~28 €  |
| Hetzner Storage Box BX21 (1 TB) | ~4 €   |
| Hetzner Snapshots automáticos | ~1 €   |
| Resend (cuota free / paid)    | 0–20 € |
| Dominio `wyweb.es`            | ~12 €/año |
| **Total infra base**          | **~35 €/mes** |

Comparativa: misma capacidad en Vercel + Supabase + Resend rondaría 80–150
€/mes con menos control sobre los datos.

---

## 11. Troubleshooting

### La app no arranca, logs muestran "DATABASE_URL undefined"
Coolify no inyectó las env vars. Verifica que están guardadas y haz redeploy.

### Healthcheck falla
La app tarda más de 20s en arrancar (migraciones lentas). Aumenta
`start-period` en el HEALTHCHECK del Dockerfile o desactiva temporalmente
con la flag de Coolify.

### Let's Encrypt no genera el cert
DNS no propagado o el firewall bloquea puerto 80. Verifica con
`dig +short wyweb.es` y `curl -I http://wyweb.es`.

### Migración falla por permisos
La BD necesita las extensions `citext` y `pgcrypto`. El init script en sección
4.1 debería haberlas creado. Si no:
```sql
CREATE EXTENSION IF NOT EXISTS "citext";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### MinIO firma URLs con localhost
Falta `MINIO_SERVER_URL=https://s3.wyweb.es` en las env del servicio.

### `argon2` no carga (musl error)
La imagen runner está sobre alpine pero faltan `libc6-compat`. Verifica el
Dockerfile (la sección runner debe tener `apk add --no-cache libc6-compat`).
Si persiste, cambia base a `node:20-slim` (Debian).

---

## 12. Próximos pasos

- **Paso 37 — CI/CD**: tests + lint + typecheck en GitHub Actions antes del
  webhook a Coolify.
- **Paso 38 — Backups + observabilidad**: pgBackRest a Storage Box, Plausible,
  Glitchtip.
- **Paso 39 — Tests E2E**: Playwright contra preview deployments.
- **Paso 40 — Hardening + GO LIVE**: rate-limits, CSP, monitor uptime, runbook
  de incidentes.
