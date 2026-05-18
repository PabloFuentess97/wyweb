# Observabilidad · Wyweb

Self-hosted **Plausible** (analytics privacy-friendly) + **Glitchtip**
(error tracking compatible con Sentry). Sin SaaS de terceros, sin cookies,
GDPR-friendly.

---

## Resumen

| Servicio   | Subdominio              | Propósito                        | Coste extra |
| ---------- | ----------------------- | -------------------------------- | ----------- |
| Plausible  | `analytics.wyweb.es`    | Pageviews, sources, devices, etc. Sin cookies. | 0 €         |
| Glitchtip  | `errors.wyweb.es`       | Stack traces, breadcrumbs, agrupado por hash. Compatible con Sentry SDK. | 0 €         |

Ambos viven en el mismo VPS Hetzner que la app, gestionados por Coolify.

---

## 1. Despliegue

El repo trae `docker-compose.observability.yml` con ambos stacks.

### 1.1 Importar en Coolify

1. **Project → wyweb-net → New Resource → Docker Compose**.
2. Pega el contenido de `docker-compose.observability.yml`.
3. Configura las variables (sección 1.2).
4. **Save**.

### 1.2 Variables requeridas

```bash
# Plausible
PLAUSIBLE_BASE_URL=https://analytics.wyweb.es
PLAUSIBLE_DB_PASSWORD=$(openssl rand -base64 24)
PLAUSIBLE_SECRET_KEY_BASE=$(openssl rand -base64 64)
PLAUSIBLE_TOTP_VAULT_KEY=$(openssl rand -base64 32)
PLAUSIBLE_FROM_EMAIL=noreply@wyweb.es
PLAUSIBLE_SMTP_HOST=smtp.resend.com
PLAUSIBLE_SMTP_PORT=587
PLAUSIBLE_SMTP_USER=resend
PLAUSIBLE_SMTP_PASSWORD=re_xxx  # API key de Resend

# Glitchtip
GLITCHTIP_DOMAIN=https://errors.wyweb.es
GLITCHTIP_DB_PASSWORD=$(openssl rand -base64 24)
GLITCHTIP_SECRET_KEY=$(openssl rand -base64 50)
GLITCHTIP_DEFAULT_FROM_EMAIL=errors@wyweb.es
GLITCHTIP_EMAIL_URL=smtp+tls://resend:re_xxx@smtp.resend.com:587
```

### 1.3 Configurar dominios en Coolify

Para cada servicio web (`plausible` y `glitchtip-web`):
1. **Domains**: pega el subdominio correspondiente.
2. **Port**: `8000` (ambos exponen este puerto internamente).
3. **Save & Deploy**.

DNS debe estar apuntando ya (configurado en [deploy.md §2](./deploy.md)).

### 1.4 Setup inicial Plausible

Tras el primer deploy:

1. Visita `https://analytics.wyweb.es` → te lleva a `/register` (la primera
   cuenta tiene rol owner).
2. Crea tu cuenta admin.
3. **New site** → `wyweb.es` → timezone `Europe/Madrid`, currency `EUR`.
4. Plausible te da un script — **ignóralo**: ya está montado en la app
   (sección 2).

### 1.5 Setup inicial Glitchtip

1. Visita `https://errors.wyweb.es` → register (la primera cuenta es admin).
2. **Organization → Create**: `Wyweb`.
3. **Project → Create**: `wyweb-net`, plataforma **JavaScript / Next.js**.
4. Copia el **DSN** que te muestra Glitchtip (formato
   `https://abc@errors.wyweb.es/1`).

> Glitchtip emite tanto el DSN privado (server-side) como el público
> (client-side). Para Sentry SDK, el mismo DSN funciona en ambos contextos.

---

## 2. Integración con la app

### 2.1 Plausible (ya integrado)

[`src/components/analytics/plausible.tsx`](../src/components/analytics/plausible.tsx)
inyecta el script de tracking si `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` está
configurada. Setup mínimo:

```bash
# .env de la app (en Coolify)
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=wyweb.es
NEXT_PUBLIC_PLAUSIBLE_HOST=https://analytics.wyweb.es
```

El script:
- Solo se carga en `NODE_ENV=production`.
- Sin cookies → no requiere banner GDPR.
- Apunta al endpoint self-hosted (no envía datos a `plausible.io`).

### 2.2 Glitchtip (ya integrado)

[`src/instrumentation.ts`](../src/instrumentation.ts) y
[`src/instrumentation-client.ts`](../src/instrumentation-client.ts) inicializan
Sentry SDK apuntando al DSN de Glitchtip.

Setup en Coolify:

```bash
# .env de la app
SENTRY_DSN=https://abc@errors.wyweb.es/1
NEXT_PUBLIC_SENTRY_DSN=https://abc@errors.wyweb.es/1
GIT_SHA=${GITHUB_SHA}  # opcional, para correlacionar errores con releases
```

Comportamiento:
- Solo init si DSN configurado y `NODE_ENV=production`.
- `tracesSampleRate: 0` → no enviamos traces de performance (Glitchtip no las
  procesa correctamente; reservadas a Sentry SaaS).
- Filtra errores de control flow (`NEXT_REDIRECT`, `NEXT_NOT_FOUND`).
- Anonimiza email/IP del contexto user (si la app los añade).

### 2.3 Verificar end-to-end

```bash
# Provoca un error desde la app para confirmar el pipeline
curl -X GET https://wyweb.es/api/sentry-test  # endpoint que tira excepción
```

> Ese endpoint NO existe por defecto — créalo solo para probar y bórralo
> después. Ejemplo:
> ```ts
> // src/app/api/sentry-test/route.ts
> export async function GET() { throw new Error('Sentry test'); }
> ```

A los 5–10 segundos verás el error en `https://errors.wyweb.es/<org>/<project>/issues/`.

---

## 3. Acceso protegido (basic auth)

Plausible y Glitchtip tienen logins propios, pero conviene añadir una **capa
extra de basic auth** delante para evitar bots y exposición pública.

En Coolify → cada servicio web → **HTTP Basic Auth**:
- User: el que quieras.
- Password: genera con `openssl rand -base64 24`.

Coolify inserta el middleware de Traefik automáticamente.

---

## 4. Métricas que importa monitorizar

### 4.1 Plausible

| Métrica                          | Por qué importa                                  |
| -------------------------------- | ------------------------------------------------ |
| Visitors únicos / día            | Crecimiento orgánico                             |
| Pageviews / contacto enviado     | Conversión funnel marketing                      |
| Top referrers                    | Detectar campañas o links externos relevantes    |
| Países / dispositivos            | Ajustar prioridades del producto                 |
| 404 errors                       | Links rotos, posts antiguos referenciados        |

### 4.2 Glitchtip

| Métrica                          | Acción                                          |
| -------------------------------- | ----------------------------------------------- |
| Issues nuevos último 24h         | Triage diario                                   |
| Issues con `count > 100`         | Bug afectando masa — alta prioridad             |
| Errores en `/api/auth/*`         | Login roto = bloqueante                         |
| Errores en `/api/facturas/*`     | Billing roto = bloqueante                       |
| Browser/version distribution     | Decidir cuándo dropear soporte de navegadores   |

### 4.3 Alertas recomendadas

En Glitchtip → **Alerts → New Alert**:
- **Trigger**: error rate > 10/h durante 5 min.
- **Channel**: webhook a Slack o email del equipo.

---

## 5. Operativa diaria

| Tarea                       | Frecuencia | Tiempo |
| --------------------------- | ---------- | ------ |
| Revisar issues nuevos       | Diaria     | 5 min  |
| Triage + asignación         | Diaria     | 10 min |
| Stats Plausible             | Semanal    | 5 min  |
| Limpiar issues resueltos    | Semanal    | 2 min  |
| Update agresivo Glitchtip   | Trimestral | 30 min |
| Update agresivo Plausible   | Trimestral | 15 min |

---

## 6. Migración a SaaS si en algún momento hace falta

Si llegas al punto de querer pasar de Glitchtip self-hosted a Sentry SaaS
(funcionalidades como performance, replay, AI suggestions):

1. Crea proyecto en Sentry SaaS, obtén DSN nuevo.
2. Cambia `SENTRY_DSN` en Coolify → redeploy automático.
3. Glitchtip se queda corriendo unas semanas como histórico (no migres
   issues, no merece la pena).
4. Tras N meses, apagas el stack Glitchtip.

Lo mismo aplica a Plausible Cloud si el self-hosted da problemas.

---

## 7. Troubleshooting

### Plausible: "Error: SECRET_KEY_BASE too short"
La clave debe ser ≥ 64 chars. Genera con `openssl rand -base64 64`.

### Plausible: el script carga pero no llegan eventos
Revisa que `data-api` apunta a `https://analytics.wyweb.es/api/event` y que
ese endpoint devuelve 202 ante un POST de prueba.

### Glitchtip: "permission denied" al crear migración
Asegúrate de que el job `glitchtip-migrate` corrió. Si quedó en error,
ejecuta manualmente:
```bash
docker exec -it glitchtip-web ./manage.py migrate
```

### Glitchtip: errores no llegan
1. Verifica que `SENTRY_DSN` está bien en Coolify (sin trailing slash).
2. En el navegador, abre DevTools → Network y busca POST a
   `errors.wyweb.es/api/.../envelope/`. Si está en rojo, el cliente no llega.
3. Si llega 401: chequea el DSN.
4. Si llega 200 pero no aparece: revisa logs del worker
   (`docker logs glitchtip-worker`).

### Source maps no se aplican (stacks ofuscados)
Glitchtip no soporta upload automático de source maps con el plugin oficial.
Para aplicar: genera source maps en build con `productionBrowserSourceMaps:
true` en `next.config.ts` y sube manualmente vía API. **No suele compensar**;
dejarlos ofuscados es OK para errores agrupados (Glitchtip agrupa por hash de
stacktrace, no por líneas exactas).
