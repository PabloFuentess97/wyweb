# Wyweb

Plataforma SaaS para **Wyweb**, agencia de diseño web, SaaS a medida y
mantenimiento para autónomos, pymes y empresas españolas. Incluye web
pública, área cliente y backoffice multi-rol, todo en un solo proyecto
Next.js con motor de facturación propio.

> 🇪🇸 100% español · 100% self-hosted · 100% código propio

---

## 📋 Tabla de contenidos

- [Qué incluye](#-qué-incluye)
- [Stack tecnológico](#-stack-tecnológico)
- [Arquitectura](#-arquitectura)
- [Setup local](#-setup-local)
- [Scripts disponibles](#-scripts-disponibles)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Roles y permisos (RBAC)](#-roles-y-permisos-rbac)
- [Despliegue](#-despliegue)
- [Documentación](#-documentación)
- [Estado del proyecto](#-estado-del-proyecto)

---

## ✨ Qué incluye

### 🏠 Marketing público (`/`)

| Página | Descripción |
|---|---|
| `/` | Home con hero, 6 servicios, caso destacado, blog y CTA |
| `/grupo` | Sobre la agencia: valores, timeline 2020 → hoy |
| `/servicios` | Hub con los 6 servicios y proceso de trabajo (4 fases) |
| `/servicios/[slug]` | Página de servicio con features, casos, tech stack |
| `/blog` y `/blog/[slug]` | Blog técnico MDX con categorías y tags |
| `/contacto` | Formulario con anti-spam (honeypot + rate-limit + Zod) |
| `/legal/*` | Aviso legal · Privacidad · Cookies (RGPD/LSSI-CE) |
| `/robots.txt` y `/sitemap.xml` | SEO técnico generado dinámicamente |

**SEO integrado:** Schema.org Organization + WebSite + Service, OpenGraph,
Twitter cards, hreflang, canonicals, manifest.webmanifest.

**Headers de seguridad:** HSTS, X-Frame-Options, CSP estricta con allowlist
para Plausible/Sentry/MinIO, Permissions-Policy, Referrer-Policy.

### 👤 Área cliente (`/area-cliente`)

Acceso para `client_user` y `client_admin`:

| Sección | Funcionalidad |
|---|---|
| Dashboard | KPIs personales (servicios activos, facturas pendientes, tickets abiertos) |
| Servicios | Listado de servicios contratados + detalle con tickets, facturas y docs relacionados |
| Facturas | Histórico filtrable + detalle con descarga PDF (URL firmada MinIO 5 min TTL) |
| Tickets | Crear, responder y seguir tickets con SLA visible |
| Documentos | Lista por categoría + descarga vía URL firmada |
| Perfil | Cambiar nombre, contraseña, preferencias tema/idioma |

### 🛠️ Backoffice (`/admin`)

Acceso para `staff_agent` y `staff_admin`:

| Sección | Funcionalidad |
|---|---|
| **Dashboard** | KPIs globales, MRR, gráficos Recharts de ingresos/tickets últimos 12 meses |
| **Clientes** | DataTable con filtros + alta/edición + validación CIF/NIF/NIE algoritmo AEAT |
| **Servicios** | DataTable + workflow estado (pending → active → suspended → terminated) + asignación SLA tier |
| **Facturas** | DataTable + emisión + **PDF a medida** + workflow (draft → issued → paid/cancelled) |
| **Tickets** | DataTable + asignación a agente + estado + notas internas + tracking SLA |
| **Leads** | DataTable + estados + **conversión 1-click a cliente** |
| **Documentos** | Upload a MinIO + visibilidad por cliente |
| **Usuarios** *(staff_admin)* | Alta staff/cliente + cambio rol + suspensión + reenvío welcome email |
| **Auditoría** *(staff_admin)* | DataTable inmutable del `audit_log` con filtros y diff JSON expandible |
| **Contenido** *(staff_admin)* | Listado de posts MDX + estado published/draft + link editar en GitHub |
| **Ajustes** *(staff_admin)* | 5 pestañas: empresa, bancarios, facturación, email, plantillas |

### 💰 Sistema de facturación (BillingProvider)

Interfaz abstracta con implementación **self-built**:

- **Numeración correlativa atómica**: `UPDATE ... RETURNING (next-1)` con
  row-lock. Idempotente bajo concurrencia.
- **Plantilla PDF española** (`@react-pdf/renderer`): emisor + cliente +
  líneas con IVA desglosado + IRPF + IBAN + footer fixed.
- **Almacenamiento MinIO** con URLs firmadas TTL 5 min.
- **Workflow tipado:** `draft → issued → paid` o `→ cancelled`.
- **Audit log automático** en cada transición de estado.
- Switch por env var: `BILLING_PROVIDER=noop|self-built|holded|quaderno`.

### 📧 Sistema de emails

- **Resend** como provider (swappable).
- **React Email** para plantillas (welcome staff/cliente, password reset,
  lead notification, lead confirmation, ticket reply).
- **Plantillas custom** sobreescribibles desde `/admin/ajustes` por cada
  evento del sistema, con fallback al template React por defecto.

### 🔒 Autenticación y seguridad

- **Auth.js v5** con Credentials provider + **Argon2id** (`@node-rs/argon2`).
- **JWT strategy** con session enrichment (customerIds, role).
- **Password reset** con token de un solo uso (TTL 24h).
- **Rate limiting** por IP en login (10/15min), password reset (5/h), contacto (5/h).
- **2FA preparado** (campos TOTP en schema, activación en F5).
- **CSP estricta**, HSTS preload, anti-CSRF de Auth.js.
- **Compound RBAC**: middleware en `proxy.ts` (Next 16) + per-action
  `requireStaff()` / `requireStaffAdmin()` en cada server action.

### 🗄️ Persistencia

- **PostgreSQL 16** con extensiones `citext` (emails case-insensitive) y
  `pgcrypto` (UUIDs).
- **Drizzle ORM** con migraciones versionadas en `drizzle/migrations/`.
- **17 tablas:** users, accounts, sessions, customers, customer_users,
  services, invoices, invoice_lines, tickets, ticket_messages,
  ticket_attachments, documents, leads, audit_log, settings,
  password_reset_tokens, verification_tokens.
- **Audit log inmutable** con `actor_user_id + action + entity + diff JSONB + ip + user_agent`.

### 📊 Observabilidad

- **Plausible self-hosted** para analytics privacy-friendly (sin cookies, sin banner GDPR).
- **Glitchtip self-hosted** (Sentry-compatible) para error tracking
  server + cliente.
- **Audit log** con filtros y diff JSON desde `/admin/auditoria`.

### 🧪 Tests E2E

- **Playwright** con globalSetup que siembra fixtures determinísticas
  (admin + customer + draft invoice).
- **5 specs de smoke:** home, contacto, auth, admin-customer, admin-invoice
  workflow.
- Workflow CI condicional (solo con label `run-e2e` o `workflow_dispatch`).

---

## 🛠 Stack tecnológico

### Frontend

| Tech | Versión | Para qué |
|---|---|---|
| Next.js | 16 (App Router + Turbopack) | Framework + RSC + Server Actions |
| React | 19 | UI library |
| TypeScript | 5+ con `noUncheckedIndexedAccess` | Tipado estricto |
| Tailwind CSS | v4 | Estilos + design tokens |
| Radix UI | Primitives | Componentes accesibles (dialog, popover, select, tabs...) |
| Lucide React | latest | Iconografía |
| TanStack Table | v8 | DataTables con filtros, sort, bulk select |
| Recharts | v3 | Gráficos del dashboard admin |
| React Hook Form | v7 + Zod resolver | Formularios validados |
| Sonner | v2 | Toast notifications |

### Backend / Data

| Tech | Para qué |
|---|---|
| PostgreSQL 16 | BD principal con `citext` + `pgcrypto` |
| Drizzle ORM | Schema typesafe + migraciones |
| postgres-js | Driver con connection pool gestionado |
| Auth.js v5 + Drizzle adapter | Sesiones + JWT |
| @node-rs/argon2 | Hashing de passwords (Argon2id) |
| Zod v4 | Validación de inputs en server actions |

### Servicios externos

| Tech | Para qué |
|---|---|
| Resend | Email transaccional (swappable a Postal autohospedado) |
| MinIO (S3-compatible) | Storage de documentos + PDFs facturas |
| @aws-sdk/client-s3 + presigner | Cliente S3 |
| @react-pdf/renderer | Generación PDF facturas |
| @react-email/components | Plantillas email JSX |
| @content-collections | Compilación MDX para blog |
| shiki | Syntax highlighting en posts |
| zxcvbn | Password strength meter |
| @sentry/nextjs | Error tracking (compatible Glitchtip) |

### Infraestructura

| Tech | Para qué |
|---|---|
| Docker (multi-stage) | Build de imagen productiva |
| Coolify | PaaS self-hosted sobre Hetzner |
| Hetzner CCX23 | VPS productivo (4 vCPU / 16 GB / 160 GB) |
| Hetzner Storage Box | Backups pgBackRest off-site |
| GitHub Actions | CI/CD (lint + typecheck + build + push GHCR) |
| Playwright | Tests E2E |

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│  Cliente (browser)                                              │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS
┌────────────────────────▼────────────────────────────────────────┐
│  Traefik (Coolify)  ─ SSL Let's Encrypt automático              │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│  Next.js 16 app (standalone Docker)                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Marketing   │  │ Área cliente │  │  Backoffice  │          │
│  │  (público)   │  │ (client_*)   │  │  (staff_*)   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
│  Server Actions · Route handlers · Drizzle queries · Auth.js   │
└──┬─────────────┬─────────────┬──────────────┬──────────────────┘
   │             │             │              │
   ▼             ▼             ▼              ▼
┌──────┐   ┌──────────┐   ┌────────┐   ┌──────────────┐
│ Pgsql│   │  MinIO   │   │ Redis  │   │   Resend     │
│  16  │   │  (S3)    │   │ (opc.) │   │  (email)     │
└──────┘   └──────────┘   └────────┘   └──────────────┘
   │
   ▼
┌──────────────────┐
│  pgBackRest      │ → Hetzner Storage Box (off-site)
│  full + WAL      │
└──────────────────┘
```

---

## 🚀 Setup local

### Prerrequisitos

- **Node.js** 20+ (LTS)
- **pnpm** 10.33.0+ (pin en `packageManager`)
- **PostgreSQL 16** (local o remoto) con extensiones `citext` y `pgcrypto`
- *(Opcional)* **Docker Desktop** para levantar servicios con compose

### 1. Clonar e instalar

```bash
git clone https://github.com/PabloFuentess97/wyweb.git
cd wyweb
pnpm install
```

### 2. Variables de entorno

Copia el ejemplo y genera secrets:

```bash
cp .env.example .env
```

Genera los `*_SECRET` mínimos:

```bash
# AUTH_SECRET (48 bytes base64)
openssl rand -base64 48

# APP_ENCRYPTION_KEY (32 bytes base64)
openssl rand -base64 32

# CRON_SECRET (32 bytes base64)
openssl rand -base64 32
```

### 3. Servicios de soporte (opcional con Docker)

Si no tienes Postgres + Redis + MinIO locales:

```bash
pnpm docker:services  # arranca db + redis + minio + bucket init
```

### 4. Migraciones de BD

```bash
pnpm db:migrate
```

### 5. Sembrar admin + cliente demo

```bash
pnpm create-staff
# Te pide email/nombre/rol/pwd. Usa `staff_admin` para el primero.

pnpm tsx scripts/seed-demo-customer.ts
# Crea Cerámicas Granadinas SL con servicios, factura draft y ticket.
```

### 6. Arrancar dev server

```bash
pnpm dev
```

Abre **http://localhost:3000** · login con el admin que creaste arriba.

---

## 📜 Scripts disponibles

```bash
# Desarrollo
pnpm dev              # Next.js dev con Turbopack
pnpm build            # Build de producción (standalone)
pnpm start            # Sirve la build de producción

# Calidad
pnpm typecheck        # tsc --noEmit
pnpm lint             # ESLint (flat config v9)
pnpm format           # Prettier

# Base de datos
pnpm db:generate      # Genera migración desde schema
pnpm db:migrate       # Aplica migraciones pendientes
pnpm db:push          # Sincroniza schema (dev only)
pnpm db:studio        # Drizzle Studio (GUI BD)

# Seeds
pnpm create-staff     # Crea usuario staff interactivo

# Tests E2E
pnpm test:e2e         # Corre Playwright
pnpm test:e2e:ui      # Modo interactivo
pnpm test:e2e:install # Instala browsers

# Docker
pnpm docker:services       # Solo servicios (db/redis/minio) — app local con `pnpm dev`
pnpm docker:up             # Stack completo, replica producción
pnpm docker:down           # Para todo
pnpm docker:logs           # Tail logs app

# Producción
pnpm smoke:prod       # Smoke test contra https://wyweb.net
```

---

## 📁 Estructura del proyecto

```
wyweb/
├── .github/workflows/         # CI/CD (ci.yml, deploy.yml, e2e.yml)
├── docker/
│   ├── Dockerfile             # Multi-stage Node 20-alpine
│   ├── entrypoint.sh          # Aplica migraciones al arrancar
│   └── postgres-init/         # Extensiones citext + pgcrypto
├── docker-compose.yml         # Dev local (db + redis + minio)
├── docker-compose.production.yml    # Stack productivo all-in-one
├── docker-compose.observability.yml # Plausible + Glitchtip
├── drizzle/migrations/        # Migraciones SQL versionadas
├── content/blog/              # Posts MDX
├── docs/                      # deploy, backups, observability, runbook, go-live
├── e2e/                       # Playwright specs
├── public/                    # Assets estáticos
├── scripts/
│   ├── db-migrate.ts/.mjs     # Migrador (.mjs para runtime Docker)
│   ├── create-staff.ts        # Alta admin interactivo
│   ├── seed-demo-customer.ts  # Demo cliente con servicios/facturas/ticket
│   └── smoke-prod.mjs         # Verificación post-deploy
└── src/
    ├── app/
    │   ├── (marketing)/        # Web pública
    │   ├── (auth)/             # Login, recuperar, restablecer
    │   ├── (cliente)/          # Área cliente
    │   ├── (admin)/            # Backoffice
    │   ├── api/                # Route handlers (auth, contacto, cron, descargas)
    │   ├── layout.tsx          # Root layout + metadata + theme
    │   ├── manifest.ts         # PWA
    │   ├── robots.ts           # SEO
    │   └── sitemap.xml         # SEO dinámico
    ├── components/
    │   ├── ui/                 # Primitives (Button, Dialog, DataTable...)
    │   ├── layout/             # Header, sidebar, theme toggle...
    │   ├── marketing/          # Service pages, contact form...
    │   ├── cliente/            # Cards y widgets área cliente
    │   ├── admin/              # DataTable, filtros, charts
    │   ├── providers/          # ThemeProvider custom (sin next-themes)
    │   ├── analytics/          # Plausible script
    │   └── icons/              # Iconos custom + SVGs servicios
    ├── lib/
    │   ├── db/
    │   │   ├── schema.ts        # 17 tablas Drizzle
    │   │   ├── index.ts         # Cliente postgres-js + monkeypatch Date
    │   │   └── queries/         # Una query module por entidad
    │   ├── auth/                # Auth.js config edge + node
    │   ├── billing/             # BillingProvider + self-built + PDF template
    │   ├── email/               # Resend client + plantillas React Email
    │   ├── storage/             # S3 client + presigned URLs
    │   ├── validation/          # Schemas Zod
    │   ├── data/services.ts     # Definición de los 6 servicios públicos
    │   ├── ui-variants.ts       # CVA tokens + status labels
    │   ├── blog.ts              # Helpers content-collections
    │   ├── env.ts               # @t3-oss/env-nextjs (typed env)
    │   └── github.ts            # URLs para "Editar en GitHub"
    ├── instrumentation.ts       # Sentry server hook
    ├── instrumentation-client.ts # Sentry client init
    └── proxy.ts                 # Middleware Next 16 (RBAC routes)
```

---

## 👥 Roles y permisos (RBAC)

| Rol | Acceso | Capacidades |
|---|---|---|
| `staff_admin` | Backoffice completo | Todo + gestión usuarios, auditoría, ajustes, contenido |
| `staff_agent` | Backoffice operativo | Clientes, servicios, facturas, tickets, leads, documentos |
| `client_admin` | Área cliente de su organización | Ver/responder tickets, descargar facturas/docs, perfil |
| `client_user` | Área cliente (read-mostly) | Igual que admin pero no puede invitar otros usuarios |

Reglas enforced en dos capas:

1. **Middleware (`src/proxy.ts`)** redirige rutas `/admin/*` o
   `/area-cliente/*` según rol.
2. **Server actions** llaman `requireStaff()` o `requireStaffAdmin()` antes
   de cualquier operación, evitando bypass.

Todas las acciones críticas (alta/baja/cambio rol/emisión factura…) emiten
una fila en `audit_log` con `actor_user_id + action + diff + ip + user_agent`.

---

## 🚢 Despliegue

Documentado paso-a-paso en [`docs/deploy.md`](./docs/deploy.md):

1. **Provisioning VPS** Hetzner CCX23 con hardening básico (UFW + fail2ban + SSH key-only).
2. **DNS** apuntando subdominios a la IP.
3. **Coolify** instalado y configurado.
4. **Servicios** Postgres 16 + Redis 7 + MinIO (con bucket auto-init).
5. **App** desde Dockerfile vía Coolify, build push a GHCR.
6. **CI/CD** con GitHub Actions:
   - `ci.yml`: lint + typecheck + build en cada PR.
   - `deploy.yml`: build + push imagen + webhook Coolify en push a `main`.
   - `e2e.yml`: Playwright contra Postgres ephemeral (label `run-e2e`).
7. **Webhook** GitHub → Coolify para deploy automático.

**Coste estimado infraestructura:** ~35 €/mes (Hetzner CCX23 + Storage Box).

---

## 📚 Documentación

| Documento | Contenido |
|---|---|
| [`docs/deploy.md`](./docs/deploy.md) | Provisioning VPS + Coolify + DNS + CI/CD |
| [`docs/backups.md`](./docs/backups.md) | pgBackRest a Hetzner Storage Box + MinIO mirror + DR drill |
| [`docs/observability.md`](./docs/observability.md) | Plausible + Glitchtip setup |
| [`docs/runbook.md`](./docs/runbook.md) | Incidentes Sev-0/1/2 + comandos útiles |
| [`docs/go-live-checklist.md`](./docs/go-live-checklist.md) | Checklist T-7d / T-1d / T-0 / T+1d / T+7d / T+30d |

---

## 📈 Estado del proyecto

| Fase | Descripción | Estado |
|---|---|---|
| F1 | Marketing público | ✅ Live |
| F2 | Área cliente + Auth | ✅ Live |
| F3 | Backoffice + datos | ✅ Live |
| F4 | Facturación + PDF + workflow | ✅ Live |
| F5 | Deploy + observabilidad + hardening | ✅ Live |

**Decisiones técnicas pendientes** (cuando se necesiten):

- Activación 2FA TOTP (estructura ya preparada en schema).
- Export AEAT SII (solo si la facturación supera 6 M€/año).
- pgBackRest en producción real (documentado en `docs/backups.md`).
- Sentry SaaS si Glitchtip se queda corto (plug & play vía env vars).

---

## 🤝 Cómo contribuir

Esta es la plataforma interna de Wyweb. Si encuentras un bug o tienes una
idea, abre un issue.

```bash
# Ramas
git checkout -b feature/loquesea
pnpm typecheck && pnpm lint && pnpm build
git commit -m "feat: descripción concisa"
git push -u origin feature/loquesea
# Abre PR contra main — CI corre lint + typecheck + build
```

Antes de mergear, **el CI debe pasar verde** (lint + typecheck + build).
Si tocas algo crítico (auth, billing, BD), ejecuta los tests E2E
localmente con `pnpm test:e2e` y añade la label `run-e2e` al PR.

---

## 📝 Licencia

Propietario · Wyweb · Todos los derechos reservados.

---

<div align="center">

**Made with care in 🇪🇸 by [Wyweb](https://wyweb.net)**

</div>
