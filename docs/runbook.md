# Runbook · Wyweb

Procedimientos operativos para incidentes y mantenimiento. Imprime esto el
día del go-live y tenlo a mano. Actualízalo cada vez que descubras algo nuevo
durante un incidente.

---

## Severity matrix

| Sev | Definición                                    | Tiempo máx respuesta | Comunicación |
| --- | --------------------------------------------- | -------------------- | ------------ |
| **0** | App caída / pérdida de datos / brecha seguridad | 15 min               | Llamada inmediata, todos hands |
| **1** | Funcionalidad crítica rota (login, billing)    | 1 h                  | Slack #incidents + página de status |
| **2** | Funcionalidad secundaria rota (blog, perfil)   | 4 h                  | Slack #incidents |
| **3** | Bug menor, performance degradado               | 1 día laboral        | Issue en GitHub |

---

## Acceso de emergencia

| Recurso              | Cómo entrar                                          |
| -------------------- | ---------------------------------------------------- |
| VPS Hetzner SSH      | `ssh deploy@wyweb.es` (clave en gestor de contraseñas) |
| Coolify panel        | https://coolify.wyweb.es (admin pwd en vault)        |
| Hetzner Robot        | https://robot.hetzner.com (cuenta org + 2FA)         |
| Cloudflare DNS       | https://dash.cloudflare.com (cuenta org + 2FA)       |
| Resend (email)       | https://resend.com (cuenta org + 2FA)                |
| MinIO consola        | https://s3-console.wyweb.es (basic auth + creds)     |
| Glitchtip            | https://errors.wyweb.es                              |
| Plausible            | https://analytics.wyweb.es                           |

---

## Incidentes Sev-0

### App devuelve 502/503 sostenido

1. Coolify → app → **Logs** (últimos 200 lines).
2. Si los logs están vacíos: el container está caído. **Restart** desde Coolify.
3. Si logs muestran `connection refused` a DB:
   ```bash
   ssh deploy@wyweb.es
   docker ps | grep wyweb-net-db
   docker logs --tail 100 wyweb-net-db
   ```
   Si DB está caída → `docker restart wyweb-net-db` → la app se recupera sola
   en ≤ 30s gracias al healthcheck.
4. Si DB OK pero app sigue fallando: rollback a la versión anterior:
   - Coolify → app → **Deployments** → click en el deploy previo → **Restore**.
5. Comunica el incidente vía Slack/email a los stakeholders.

### Datos perdidos / corruptos

Sigue [docs/backups.md §7](./backups.md#7-runbook-de-incidente-pérdida-de-datos):

1. STOP — detener todo cambio en prod.
2. Identifica alcance.
3. Punto de restauración.
4. Restore desde pgBackRest (PITR si es necesario).
5. Verifica integridad con queries simples.
6. Comunica a usuarios afectados.
7. Post-mortem en `docs/incidents/YYYY-MM-DD.md`.

### Brecha de seguridad sospechada

1. **No borres nada todavía** — los logs son evidencia.
2. Coolify → app → **Variables → Rotate**:
   - `AUTH_SECRET` → invalida todas las sesiones (forzando re-login).
   - `APP_ENCRYPTION_KEY` → invalida tokens de reset si existen.
3. Banear IPs sospechosas en el firewall Hetzner.
4. Coolify → DB → cambiar password → actualizar la env de la app → redeploy.
5. Auditar `audit_log` desde antes del incidente:
   ```sql
   SELECT * FROM audit_log
   WHERE created_at > now() - interval '24 hours'
   ORDER BY created_at DESC LIMIT 200;
   ```
6. Decidir si requiere notificación a la AEPD (>72h tras descubrir si hay
   datos personales afectados).

---

## Incidentes Sev-1

### Login no funciona

**Síntoma**: usuarios reportan que las credenciales correctas son rechazadas.

1. Verifica con un usuario de prueba:
   ```bash
   curl -X POST https://wyweb.es/api/auth/callback/credentials \
     -d 'email=tu@email.com&password=correcta'
   ```
2. Logs de la app → busca errores en el callback `signIn`.
3. ¿Algún cambio reciente en `AUTH_SECRET` o el adapter? Si sí → rollback.
4. Verifica que la tabla `users` no está corrupta:
   ```sql
   SELECT count(*) FROM users WHERE deleted_at IS NULL;
   ```

### Emisión de facturas falla

**Síntoma**: clic "Emitir factura" → error.

1. Logs → busca `[self-built.issue]` o `BillingInvalidStateError`.
2. Verifica que el contador `settings.invoice_next_number` no se haya
   corrompido:
   ```sql
   SELECT invoice_prefix, invoice_series, invoice_next_number FROM settings;
   ```
3. Si MinIO está caído → la emisión funciona pero el PDF no se genera. Revisa:
   ```bash
   docker logs wyweb-net-minio --tail 100
   curl https://s3.wyweb.es/minio/health/live
   ```
4. **No bajes manualmente el contador** — emite en una nueva serie si necesitas
   un número provisional.

### PDFs no se descargan

1. Verifica que el bucket existe:
   ```bash
   docker exec wyweb-net-minio mc alias set local http://localhost:9000 \
     $MINIO_ROOT_USER $MINIO_ROOT_PASSWORD
   docker exec wyweb-net-minio mc ls local/wyweb-net/invoices/ | head
   ```
2. Si los archivos están pero las URLs firmadas dan 403:
   - Revisa `MINIO_SERVER_URL` env var (debe ser `https://s3.wyweb.es`).
   - Revisa que la service account de S3 que usa la app tiene permisos
     `s3:GetObject` sobre `wyweb-net/*`.
3. Re-emite la factura → genera nuevo PDF (la anterior queda emitida pero
   sin PDF — anota issue para limpiar luego).

---

## Incidentes Sev-2

### Emails no llegan

1. Resend dashboard → **Logs** → buscar fallos del último día.
2. Verifica DKIM/SPF/DMARC del dominio:
   ```bash
   dig TXT wyweb.es
   dig TXT _dmarc.wyweb.es
   ```
3. Si Resend está OK → el problema puede ser greylisting del receptor.
   Reintentar manualmente desde el panel de Resend.
4. Si la cuota de Resend está agotada → upgrade del plan o cambio temporal a
   `EMAIL_FROM=...@gmail.com` con SMTP de Gmail (2FA + app password).

### Migración Drizzle falla en deploy

1. Coolify logs del último deploy → busca `[db-migrate]` o `migration failed`.
2. Si el error es por columna duplicada o constraint:
   ```bash
   docker exec -it wyweb-net-db psql -U wyweb -d wyweb
   # Compara schema actual vs esperado
   \d <tabla_problema>
   ```
3. Marca la migración como aplicada manualmente si el cambio ya está hecho:
   ```sql
   INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
   VALUES ('<hash de la migration>', '<timestamp ms>');
   ```
4. Redeploy.

### Cron SLA no dispara

1. Coolify no incluye cron jobs nativos para apps. Si usas un cron externo
   (ej. `cron-job.org` o un cron en el host) verifica que llama a:
   ```
   POST https://wyweb.es/api/cron/sla-check
   Authorization: Bearer <CRON_SECRET>
   ```
2. Logs de la app → busca `[cron/sla]`.

---

## Mantenimiento programado

### Update de Next.js

1. Branch nueva: `pnpm up next next-auth react react-dom --latest`.
2. `pnpm build` local → corregir cualquier breaking change.
3. CI corre lint + typecheck + smoke E2E.
4. Merge a `main` fuera de horario laboral si es major version.

### Update de dependencias

Frecuencia: mensual.
```bash
pnpm outdated
pnpm up <pkg>@latest
```
Excluir patches de seguridad — esos van inmediatos vía Dependabot.

### Rotación de secrets

Frecuencia: trimestral.

| Secret             | Cómo rotar                                              |
| ------------------ | ------------------------------------------------------- |
| `AUTH_SECRET`      | `openssl rand -base64 48` → Coolify → redeploy. Invalida sesiones. |
| `APP_ENCRYPTION_KEY` | Más sensible — solo si hay sospecha. Requiere migrar datos cifrados antes. |
| Postgres password  | `ALTER USER` + actualizar `DATABASE_URL` + redeploy.    |
| MinIO root         | Recrear service accounts; rotar root no rompe service accounts existentes. |
| Resend API key     | Resend → Settings → New key → cambiar en Coolify.       |

### Reinicio mensual del VPS

Recomendado para aplicar updates del kernel:
```bash
ssh deploy@wyweb.es
sudo apt-get update && sudo apt-get upgrade -y
sudo reboot
```

Coolify reinicia los servicios automáticamente. La downtime ronda los 60s.
Si quieres zero-downtime puedes mover el DNS a un VPS standby por 5 min.

---

## Comandos útiles

```bash
# Ver logs de la app en vivo
ssh deploy@wyweb.es "docker logs -f wyweb-net-app --tail 100"

# Conectar a la BD
ssh deploy@wyweb.es "docker exec -it wyweb-net-db psql -U wyweb -d wyweb"

# Ver clientes activos
SELECT count(*) FROM customers WHERE status = 'active' AND deleted_at IS NULL;

# Top 10 últimas auditorías
SELECT created_at, action, entity_type, entity_id
FROM audit_log
ORDER BY created_at DESC LIMIT 10;

# Disco usado por DB
docker exec wyweb-net-db psql -U wyweb -d wyweb -c \
  "SELECT pg_size_pretty(pg_database_size('uxea_net'));"

# Disco del VPS
ssh deploy@wyweb.es "df -h"

# RAM/CPU
ssh deploy@wyweb.es "docker stats --no-stream"

# Reiniciar app
ssh deploy@wyweb.es "docker restart wyweb-net-app"

# Smoke test producción (fuera del VPS, desde tu local)
pnpm smoke:prod
```

---

## Post-mortems

Tras cualquier incidente Sev-0 o Sev-1, escribe un post-mortem en
`docs/incidents/YYYY-MM-DD-<slug>.md` con esta plantilla:

```md
# YYYY-MM-DD · Slug del incidente

## Resumen
1-2 líneas qué pasó, durante cuánto tiempo, qué impacto.

## Timeline
- HH:MM — primer síntoma observado
- HH:MM — alerta disparada / usuario reportó
- HH:MM — diagnóstico inicial
- HH:MM — fix aplicado
- HH:MM — verificación OK

## Root cause
Causa real, no síntoma. Si fueron varios factores listálos.

## Impacto
- Usuarios afectados: X
- Operaciones perdidas: ej. N facturas no emitidas
- Datos perdidos: sí/no, si sí cuánto
- Comunicación enviada: sí/no a quién

## Detección
¿Cómo nos enteramos? ¿Tardamos? ¿Hay alerta a añadir?

## Acción correctiva (ya aplicada)
Lo que hicimos para resolver el incidente.

## Acción preventiva (futuro)
Cambios para que no vuelva a pasar. Crea issues en GitHub para cada uno.

## Lecciones aprendidas
Lo que aprendimos. Honestidad > política.
```
