# GO LIVE Checklist · Wyweb

Lista de verificación antes de hacer pública la web. Marca cada item solo
cuando esté **realmente** comprobado en el entorno de producción, no solo
porque "debería funcionar".

> Tiempo estimado completar todo: **2-4 horas**, mejor en una mañana sin
> interrupciones.

---

## T-7 días

### Infraestructura

- [ ] VPS Hetzner CCX23 provisionado, accesible vía SSH (no root, key-based)
- [ ] DNS apuntando: `wyweb.net`, `www`, `s3`, `s3-console`, `analytics`,
      `errors`, `coolify` (ver [deploy.md §2](./deploy.md#2-dns))
- [ ] Coolify instalado y accesible en `https://coolify.wyweb.net`
- [ ] Postgres 16 corriendo + healthcheck verde
- [ ] Redis 7 corriendo + healthcheck verde
- [ ] MinIO corriendo, bucket `wyweb-net` creado, service account con permisos
      mínimos generada
- [ ] Hetzner snapshots configurados (daily auto)
- [ ] Hetzner Storage Box (BX21) creado, sub-account read-write para backups
- [ ] pgBackRest configurado y haciendo backup full + WAL → ver
      [backups.md §2](./backups.md#2-pgbackrest)
- [ ] **Restauración de backup probada en staging** — DR drill ≤ 30 min

### Configuración del dominio

- [ ] Cloudflare proxy DESACTIVADO (la naranja en gris) — Traefik en Coolify
      ya hace SSL termination
- [ ] Cert SSL Let's Encrypt válido y auto-renovable
- [ ] HTTPS redirect funciona (HTTP → HTTPS 301)
- [ ] HSTS preload comprobado: https://hstspreload.org

### Email

- [ ] Resend dashboard → dominio `wyweb.net` verificado (DKIM, SPF, DMARC todos
      en verde)
- [ ] Email de prueba enviado y recibido (`info@wyweb.net` o similar)
- [ ] Plantillas tested:
  - [ ] Bienvenida cliente
  - [ ] Reset password
  - [ ] Notificación lead a info@
  - [ ] (Opcional) Plantillas custom de Settings vacías → fallback al default

### Observabilidad

- [ ] Plausible accesible en `analytics.wyweb.net`, site `wyweb.net` registrado
- [ ] Glitchtip accesible en `errors.wyweb.net`, project `wyweb-net` creado
- [ ] DSN de Glitchtip configurado en `SENTRY_DSN` y `NEXT_PUBLIC_SENTRY_DSN`
- [ ] **Test de error**: provocar exception → aparece en Glitchtip ≤ 30s
- [ ] **Test de pageview**: visitar la home → contador en Plausible se
      incrementa al cabo de unos minutos

### CI/CD

- [ ] Repo en GitHub con branch protections en `main` (requiere PR + review)
- [ ] Workflow `ci.yml` corre en cada PR, todos los checks verdes
- [ ] Secrets `COOLIFY_WEBHOOK_URL` y `COOLIFY_API_TOKEN` configurados
- [ ] Workflow `deploy.yml` testado: push a `main` → imagen en GHCR → Coolify
      hace pull y redeploy
- [ ] Coolify config puesta en modo "Existing Docker Image" para usar
      `ghcr.io/.../wyweb:latest`

---

## T-1 día

### Datos iniciales

- [ ] **Primer admin staff_admin** creado:
      ```bash
      pnpm tsx scripts/create-staff.ts --email tu@email.com --name "Tu Nombre" --role staff_admin
      ```
- [ ] Login con ese admin funciona en producción
- [ ] Datos de empresa rellenos en `/admin/ajustes`:
  - [ ] Razón social, CIF, dirección completa
  - [ ] Email corporativo + teléfono
  - [ ] Logo URL
  - [ ] IBAN + entidad bancaria
  - [ ] Pie de factura
  - [ ] Remitente de emails: `Wyweb <noreply@wyweb.net>`
- [ ] Seed inicial: si tienes clientes existentes a importar, hazlo ahora vía
      `scripts/seed-customers.ts` o SQL directo
- [ ] Estado de servicios sembrado para los clientes importados

### Contenido público

- [ ] Posts del blog publicados (`draft: false`) revisados ortográficamente
- [ ] Imágenes optimizadas (`< 200KB` para hero, `< 100KB` para secundarias)
- [ ] Páginas legales correctas y actualizadas:
  - [ ] `/legal/privacidad` con texto adaptado
  - [ ] `/legal/aviso-legal` con datos legales reales (CIF, dirección, email)
  - [ ] `/legal/cookies` (incluso sin cookies por Plausible, declarar técnicas)
- [ ] OG images verificadas: visita
      https://www.opengraph.xyz/url/https%3A%2F%2Fwyweb.net
- [ ] Favicon en `/favicon.svg` y `/apple-touch-icon.png` se cargan bien

### Hardening

- [ ] Headers de seguridad presentes (corre `pnpm smoke:prod`):
  - [ ] `Strict-Transport-Security`
  - [ ] `X-Frame-Options: DENY`
  - [ ] `X-Content-Type-Options: nosniff`
  - [ ] `Content-Security-Policy` válida (sin errores en consola)
  - [ ] `Referrer-Policy`
  - [ ] `Permissions-Policy`
- [ ] Rate-limit verificado:
  - [ ] 11 intentos consecutivos al login → último devuelve "Demasiados intentos"
  - [ ] 6 envíos del formulario contacto → último 429
  - [ ] 6 password reset → último error
- [ ] Firewall Hetzner activo (solo 22, 80, 443 desde fuera)
- [ ] UFW activo en el VPS (segunda capa)
- [ ] SSH config: `PasswordAuthentication no`, `PermitRootLogin no`
- [ ] fail2ban corriendo
- [ ] Updates desatendidos configurados (`unattended-upgrades`)
- [ ] Variables `*_SECRET` rotadas (no son las de dev)
- [ ] `.env` del VPS con permisos `600`, owner `deploy:deploy`

### SEO

- [ ] `/robots.txt` accesible y permite crawling de páginas públicas
- [ ] `/sitemap.xml` válido (https://www.xml-sitemaps.com/validate-xml-sitemap.html)
- [ ] Google Search Console: dominio verificado, sitemap submitted
- [ ] Bing Webmaster Tools: dominio verificado
- [ ] Schema.org Organization/LocalBusiness en homepage (verificar con
      https://validator.schema.org)
- [ ] Lighthouse score ≥ 90 en Performance/Accessibility/Best Practices/SEO
      para la home y `/servicios`

### Performance

- [ ] WebPageTest en `https://wyweb.net`:
  - [ ] FCP < 1.5s
  - [ ] LCP < 2.5s
  - [ ] CLS < 0.1
  - [ ] TBT < 200ms
- [ ] Imágenes en formato AVIF/WebP (Next.js Image lo hace automático)
- [ ] Fonts subsetted (`next/font/google` lo hace automático)

---

## T-0 (día del lanzamiento)

### Pre-flight (mañana)

- [ ] `pnpm smoke:prod` → todos los checks OK
- [ ] Login funcional desde un navegador limpio
- [ ] Registrarse / recuperar / restablecer password → flujo completo OK
- [ ] Crear un lead desde `/contacto` → aparece en `/admin/leads`
- [ ] Convertir lead a cliente → flujo completo
- [ ] Crear factura draft (vía SQL temporal o en una iteración futura desde UI)
      → emitirla → descargar PDF → marcar pagada
- [ ] Subir un documento desde `/admin/clientes/[id]` → cliente lo ve en su
      área → se descarga vía URL firmada

### Comunicación

- [ ] Email a primeros usuarios beta con: URL, credenciales, link al recovery
      por si pierden la pwd, email de soporte
- [ ] Página /contacto accesible desde links externos
- [ ] LinkedIn / RRSS post con la noticia

### Monitoring durante 4h post-launch

- [ ] Logs Coolify abiertos en pantalla
- [ ] Glitchtip dashboard abierto
- [ ] Plausible dashboard abierto
- [ ] Email de soporte/info revisado cada 30 min
- [ ] Alguien on-call con acceso al VPS

---

## T+1 día

- [ ] Verificar que el **backup nocturno** corrió con éxito
- [ ] Revisar `audit_log` de las últimas 24h — buscar comportamientos extraños
- [ ] Issues de Glitchtip nuevos → triage
- [ ] Stats de Plausible: visitors, sources, top pages
- [ ] Métrica clave: contactos generados / pageviews ≥ X% (define tu KPI)

---

## T+7 días

- [ ] Post-mortem suave: lo que se rompió y se arregló esta primera semana
- [ ] DR drill: restaura la BD desde el backup en una VM scratch → verifica
      tiempo real (apunta el dato en `docs/incidents/`)
- [ ] Verifica que todas las dependencias están actualizadas (Dependabot)
- [ ] Cron SLA: el job se ejecuta cada 15 min y actualiza tickets
- [ ] Revisión de costes en Hetzner — confirma que no hay sorpresas

---

## T+30 días

- [ ] Rotación de `AUTH_SECRET` (si no se hizo antes)
- [ ] Análisis de tickets cerrados — tendencia de tipos de incidencia
- [ ] Dependabot alerts: 0 abiertas
- [ ] Lighthouse + WebPageTest re-corridos
- [ ] DR drill mensual (siguiente)

---

## Si algo falla en producción y no estás seguro qué hacer

**STOP**. No improvises.

1. Lee [docs/runbook.md](./runbook.md).
2. Si no cubre el caso → rollback al deploy anterior:
   - Coolify → app → **Deployments** → click en el deploy anterior →
     **Restore**.
3. Comunica el incidente: `incidents@wyweb.net` o canal Slack.
4. Documenta lo que pasó en `docs/incidents/YYYY-MM-DD-<slug>.md` aunque sea
   una nota corta.
5. **Después** del incidente, escribe el post-mortem completo.

---

## Recursos rápidos

- 🚀 Despliegue → [deploy.md](./deploy.md)
- 💾 Backups → [backups.md](./backups.md)
- 📊 Observabilidad → [observability.md](./observability.md)
- 🔥 Incidentes → [runbook.md](./runbook.md)
- 🧪 Smoke prod → `pnpm smoke:prod`
- 🤖 E2E → `pnpm test:e2e`

---

**Última actualización**: completar al lanzar.
**Responsable on-call go-live**: [tu nombre / contacto].
