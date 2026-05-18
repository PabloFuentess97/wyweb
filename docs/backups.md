# Backups · Wyweb

Estrategia de backups de Postgres + storage MinIO. Asume que ya está
desplegada la infraestructura del [deploy.md](./deploy.md).

> **Objetivo de recuperación**: RPO ≤ 5 min (datos perdidos máximo 5 minutos),
> RTO ≤ 30 min (tiempo de restauración tras un incidente).

---

## Resumen

| Recurso              | Cómo se respalda           | Frecuencia        | Destino             |
| -------------------- | -------------------------- | ----------------- | ------------------- |
| **Postgres**         | pgBackRest (full + diff + WAL) | Daily + WAL continuo | Hetzner Storage Box |
| **MinIO bucket**     | `mc mirror` programado     | Cada 6h           | Hetzner Storage Box |
| **Snapshot VPS**     | Hetzner snapshots          | Daily auto        | Hetzner             |
| **Coolify config**   | git + manual export        | En cada cambio    | Repo privado        |

Tres niveles de defensa:
1. **Snapshots Hetzner**: rebobinas todo el VPS si el host se corrompe.
2. **pgBackRest**: granularidad fina, point-in-time recovery (PITR).
3. **MinIO mirror**: PDFs y documentos espejo en otro storage.

---

## 1. Hetzner Storage Box

Storage Box es SFTP/SMB/Borg/S3 simultáneamente. **BX21** (1 TB, ~4 €/mes)
sobra para los primeros años.

1. Hetzner Robot → **Storage Box → Add Storage Box** → BX21.
2. Ubícalo en la misma región que el VPS para reducir latencia (Helsinki o
   Falkenstein).
3. Anota: hostname (`uXXXXXX.your-storagebox.de`), usuario (`uXXXXXX`),
   password (visible al crearlo, **guárdalo en un gestor de contraseñas**).
4. **External Reachability → Enable SSH support** (lo necesitas para SFTP/rsync/borg).
5. **Sub-accounts** → crea uno con scope a una carpeta concreta:
   - `/wyweb-net-backups/postgres`
   - `/wyweb-net-backups/minio-mirror`
   - Esto evita que un compromiso del VPS borre snapshots viejos si el
     sub-account es read-only para los antiguos.

---

## 2. pgBackRest

Es la herramienta gold-standard para Postgres. Ofrece:
- **Full + diff + incremental**: full semanal, diff diario.
- **WAL archiving**: cada commit se replica en segundos (RPO bajo).
- **Point-in-time recovery**: restaura a un instante exacto.
- **Verificación**: checksums en cada backup.

### 2.1 Setup como sidecar de Coolify

Crea un nuevo **Service → Custom Compose** en Coolify con este YAML:

```yaml
services:
  pgbackrest:
    image: pgbackrest/pgbackrest:latest
    restart: unless-stopped
    user: root
    volumes:
      - pgbackrest-config:/etc/pgbackrest
      - pgbackrest-logs:/var/log/pgbackrest
      # Comparte el mismo socket que el contenedor postgres:
      # En Coolify, el postgres expone su socket en un volumen nombrado.
      # Cambia el nombre del volumen al que corresponda en tu instancia.
      - wyweb-net-db-data:/var/lib/postgresql/data:ro
    environment:
      PGBACKREST_REPO1_TYPE: sftp
      PGBACKREST_REPO1_SFTP_HOST: u123456.your-storagebox.de
      PGBACKREST_REPO1_SFTP_HOST_USER: u123456-sub1
      PGBACKREST_REPO1_PATH: /wyweb-net-backups/postgres
      PGBACKREST_REPO1_RETENTION_FULL: "4"          # 4 semanas de fulls
      PGBACKREST_REPO1_RETENTION_DIFF: "7"
      PGBACKREST_REPO1_BUNDLE: "y"                   # Empaqueta WAL pequeños
      PGBACKREST_PROCESS_MAX: "4"
      PGBACKREST_LOG_LEVEL_FILE: detail
    secrets:
      - pgbackrest_sftp_key

volumes:
  pgbackrest-config:
  pgbackrest-logs:
  wyweb-net-db-data:
    external: true                                   # gestionado por Coolify

secrets:
  pgbackrest_sftp_key:
    external: true                                   # crea con: docker secret create
```

> El servicio Postgres de Coolify necesita configuración extra para que
> pgBackRest pueda hacer `archive_command`. Mira la sección 2.3.

### 2.2 Configuración inicial (one-time)

Dentro del contenedor pgbackrest:

```bash
# Crea la stanza (= proyecto en pgBackRest)
pgbackrest --stanza=wyweb-net stanza-create

# Verifica
pgbackrest --stanza=wyweb-net check
```

Y dentro del Postgres, edita `postgresql.conf` (Coolify → DB → Settings →
custom config):

```ini
# Archivado WAL → pgBackRest
archive_mode = on
archive_command = 'pgbackrest --stanza=wyweb-net archive-push %p'
archive_timeout = 60
max_wal_senders = 3
wal_level = replica
```

Reinicia el servicio Postgres tras estos cambios.

### 2.3 Cronjobs

pgBackRest no se programa solo — añade un cron en el contenedor sidecar:

```cron
# /etc/cron.d/pgbackrest
# Full backup todos los domingos 02:00
0 2 * * 0 root pgbackrest --stanza=wyweb-net --type=full backup
# Diff diario L–S 02:00
0 2 * * 1-6 root pgbackrest --stanza=wyweb-net --type=diff backup
# Verifica integridad cada día a las 06:00
0 6 * * * root pgbackrest --stanza=wyweb-net verify
```

### 2.4 Restauración (DR drill)

Practica este procedimiento al menos **una vez al mes** y documenta el tiempo
real medido.

```bash
# 1. Para el servicio Postgres
docker compose stop db

# 2. Borra los datos actuales (¡sí, borrar!)
docker run --rm -v wyweb-net-db-data:/data alpine sh -c "rm -rf /data/*"

# 3. Restaura el último backup
docker exec -it pgbackrest pgbackrest --stanza=wyweb-net \
  --delta restore

# Para PITR a un instante específico:
docker exec -it pgbackrest pgbackrest --stanza=wyweb-net \
  --type=time --target='2026-05-01 14:30:00' restore

# 4. Arranca de nuevo
docker compose start db

# 5. Verifica
docker exec wyweb-net-db psql -U wyweb -d wyweb -c "SELECT count(*) FROM users;"
```

---

## 3. Alternativa simple: pg_dump + rclone

Si pgBackRest te parece overkill al principio (lo es para una BD de pocos
GB), esta alternativa cubre RPO ≤ 1 día con menos complejidad:

### 3.1 Sidecar con pg_dump

Crea un servicio en Coolify:

```yaml
services:
  pg-dumper:
    image: postgres:16-alpine
    restart: unless-stopped
    depends_on:
      - db
    volumes:
      - pg-dumps:/backups
    environment:
      PGHOST: wyweb-net-db
      PGUSER: uxea
      PGPASSWORD: ${POSTGRES_PASSWORD}
      PGDATABASE: uxea_net
    command:
      - sh
      - -c
      - |
        apk add --no-cache rclone bash
        cat <<'EOF' > /usr/local/bin/dump.sh
        #!/bin/bash
        set -e
        TS=$$(date -u +%Y%m%dT%H%M%SZ)
        FILE="/backups/wyweb_$${TS}.sql.gz"
        echo "▸ Dumping to $$FILE"
        pg_dump --format=custom --no-owner --no-acl | gzip > "$$FILE"
        echo "▸ Uploading via rclone"
        rclone copy "$$FILE" hetzner:wyweb-net-backups/postgres/
        echo "▸ Cleaning local files >7d"
        find /backups -name "*.sql.gz" -mtime +7 -delete
        echo "✓ Done: $$FILE"
        EOF
        chmod +x /usr/local/bin/dump.sh
        # Cron: diario 02:00 UTC
        echo "0 2 * * * /usr/local/bin/dump.sh >> /var/log/pgdump.log 2>&1" > /tmp/cron
        crontab /tmp/cron
        crond -f -L /var/log/cron.log

volumes:
  pg-dumps:
```

### 3.2 Configurar rclone hacia Storage Box

```bash
# Dentro del contenedor pg-dumper o desde el host
rclone config

# Selecciona:
#   n) New remote
#   name> hetzner
#   storage> sftp
#   host> u123456.your-storagebox.de
#   user> u123456-sub1
#   port> 23  (Storage Box usa 23, no 22)
#   pass> <password>
#   key_file> (vacío)
```

Guarda el archivo `~/.config/rclone/rclone.conf` y móntalo como secret en el
contenedor.

### 3.3 Restauración pg_dump

```bash
# Descarga el último dump
rclone copy hetzner:wyweb-net-backups/postgres/wyweb_20260501T020000Z.sql.gz /tmp/

# Restaura
gunzip < /tmp/wyweb_*.sql.gz | \
  docker exec -i wyweb-net-db psql -U wyweb -d wyweb
```

---

## 4. Mirror del bucket MinIO

```yaml
services:
  minio-mirror:
    image: minio/mc:latest
    restart: unless-stopped
    depends_on:
      - minio
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD}
      STORAGE_BOX_USER: ${STORAGE_BOX_USER}
      STORAGE_BOX_HOST: ${STORAGE_BOX_HOST}
    command:
      - sh
      - -c
      - |
        apk add --no-cache rclone bash
        mc alias set local http://minio:9000 $$MINIO_ROOT_USER $$MINIO_ROOT_PASSWORD
        cat <<'EOF' > /usr/local/bin/mirror.sh
        #!/bin/bash
        echo "▸ Sincronizando bucket wyweb-net → Storage Box"
        mc mirror --overwrite --remove local/wyweb-net /tmp/mirror/
        rclone sync /tmp/mirror/ hetzner:wyweb-net-backups/minio-mirror/
        echo "✓ Mirror OK"
        EOF
        chmod +x /usr/local/bin/mirror.sh
        # Cada 6 horas
        echo "0 */6 * * * /usr/local/bin/mirror.sh >> /var/log/mirror.log 2>&1" > /tmp/cron
        crontab /tmp/cron
        crond -f -L /var/log/cron.log
```

---

## 5. Verificación de backups (importante)

Un backup que nunca se restaura **no es un backup**. Establece una rutina:

| Frecuencia       | Acción                                                 |
| ---------------- | ------------------------------------------------------ |
| **Cada deploy**  | El entrypoint del contenedor app falla si la migración no aplica → un backup intacto se valida implícitamente. |
| **Mensual**      | Restaura un dump en un Postgres efímero local y corre `pnpm db:migrate` + verifica una query simple. |
| **Trimestral**   | DR drill completo: Storage Box → VM nueva → restore → app arranca → smoke tests. Documenta el tiempo. |

```bash
# Script básico de verificación (corre en cualquier máquina con docker)
docker run -d --name pg-verify \
  -e POSTGRES_USER=uxea -e POSTGRES_PASSWORD=test -e POSTGRES_DB=uxea_net \
  postgres:16-alpine
sleep 10

rclone cat hetzner:wyweb-net-backups/postgres/wyweb_LATEST.sql.gz | \
  gunzip | docker exec -i pg-verify psql -U wyweb -d wyweb

docker exec pg-verify psql -U wyweb -d wyweb -c "
  SELECT count(*) FROM users;
  SELECT count(*) FROM customers;
  SELECT count(*) FROM invoices;
"
docker rm -f pg-verify
```

---

## 6. Snapshots de Coolify config

La configuración de Coolify (apps, env vars, dominios, secretos) NO se versiona
automáticamente. Para no perderla:

1. Coolify → **Settings → Backups → Backup all data** (descarga JSON encriptado).
2. Sube el JSON encriptado al Storage Box manualmente (o automatízalo via API).

Frecuencia: tras cada cambio significativo. Mínimo: mensual.

---

## 7. Runbook de incidente: pérdida de datos

1. **STOP** — Detén todo cambio en producción. Notifica al equipo.
2. **Identifica el alcance**: ¿qué se perdió? ¿desde cuándo?
3. **Punto de restauración**: el último backup *antes* del incidente.
4. **Restore**:
   - Si toda la BD está corrupta → procedimiento de [§2.4](#24-restauración-dr-drill)
   - Si es un set de filas → restaura en una BD efímera, exporta esas filas,
     `INSERT` en producción.
5. **Verifica** queries simples y un flujo end-to-end de la app.
6. **Comunica a usuarios afectados** si tocó datos visibles.
7. **Post-mortem** documentado en el repo (`docs/incidents/YYYY-MM-DD-XX.md`).
