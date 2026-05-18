# Wyweb.net

App web Next.js 15 para Grupo Wyweb (Granada). Marketing público + área cliente + backoffice staff. Self-hosted en VPS propio. Español de España.

## Commands

- `pnpm dev` — Dev server en :3000
- `pnpm build` — Production build (output standalone)
- `pnpm start` — Run production build
- `pnpm lint` — ESLint
- `pnpm typecheck` — `tsc --noEmit`
- `pnpm test` — Vitest unit
- `pnpm test:e2e` — Playwright E2E
- `pnpm db:generate` — Generar migración Drizzle desde schema
- `pnpm db:migrate` — Aplicar migraciones a DATABASE_URL
- `pnpm db:studio` — Abrir Drizzle Studio
- `pnpm db:seed` — Cargar datos de demo
- `pnpm content:build` — Compilar MDX collections
- `pnpm create-staff` — CLI para crear cuenta staff inicial

## Tech Stack

Next.js 15 (App Router) + TypeScript strict + Tailwind v4 + Radix UI + lucide-react + Postgres 16 + Drizzle ORM + Auth.js v5 + Argon2id + Resend + MinIO (S3) + Redis + BullMQ + MDX (@content-collections) + Plausible + Glitchtip. Deploy: Coolify sobre Hetzner.

## Architecture

### Directory Structure
- `src/app/(marketing)/` — Sitio público (SSG con ISR)
- `src/app/(auth)/` — Login, recuperación, verificación
- `src/app/(cliente)/area-cliente/` — Área cliente B2B (auth + role client_*)
- `src/app/(admin)/admin/` — Backoffice staff (auth + role staff_*)
- `src/app/api/` — REST: contacto, uploads, webhooks, cron
- `src/components/ui/` — Design system base
- `src/components/marketing/` — Componentes del sitio público
- `src/components/cliente/` — Componentes área cliente
- `src/components/admin/` — DataTable, dashboards, etc.
- `src/components/layout/` — Headers, footer, sidebars, topbar
- `src/components/icons/` — Markers de marca custom + iconos servicios
- `src/lib/db/` — Drizzle client + schema + queries
- `src/lib/auth/` — Auth.js config, password helpers, RBAC
- `src/lib/email/` — Provider abstraction + templates React Email
- `src/lib/billing/` — BillingProvider abstraction (F4)
- `src/lib/storage/` — MinIO/S3 client
- `src/lib/queue/` — BullMQ workers
- `src/lib/validation/` — Zod schemas compartidos cliente/server
- `content/blog/` — MDX posts
- `drizzle/migrations/` — SQL migrations versionadas
- `tests/` — Vitest + Playwright

### Data Flow
- **Lectura**: Server Component → Drizzle directo a Postgres. NO API intermedia.
- **Mutación cliente logueado**: Server Action en `app/.../actions.ts`. Validar Zod, check RBAC, audit log si destructiva, `revalidateTag()`.
- **Mutación pública** (form contacto): API route `app/api/contacto/route.ts` con Zod + rate limit + honeypot.
- **Cache**: `unstable_cache` con tags. Invalidar con `revalidateTag('customers')` etc.

### Key Patterns
- **Server Components by default.** `'use client'` solo si: hay `useState`, eventos del DOM, APIs del browser, o uso de Radix/RHF/sonner.
- **Auth en middleware.ts**: protege `/area-cliente/**` y `/admin/**`. Role check en cada server action.
- **Status visuales**: SIEMPRE color + icono + texto. Nunca solo color (a11y).
- **Datos numéricos**: `tabular-nums` (clase `tnum`). Formato euros via `formatEuros(cents)`.
- **Brand scoping**: componentes que representan datos asociados a una marca llevan `data-brand={record.brand}` en el root → reescribe `--color-accent` localmente.
- **Sin barrel exports.** Import directo desde `@/components/ui/button`, no desde `@/components/ui`.

## Code Organization Rules

1. **One component per file.** Max 300 líneas. Si crece, extraer sub-componentes.
2. **Path alias `@/`** para `src/`. Usar siempre.
3. **Sin `any`.** Si necesitas escape, usa `unknown` + type guard.
4. **Zod schemas** en `src/lib/validation/*.ts`, importadas tanto en cliente (RHF) como en server (action/api).
5. **Migraciones**: NUNCA editar SQL ya aplicado. Generar nueva migración.
6. **Server Actions** colocados como `actions.ts` junto a la page que las usa.
7. **Audit log** obligatorio en: crear/editar/eliminar customer, service, invoice, ticket assignment, user role change.
8. **Mobile-first**: media queries `@media (min-width: ...)`. Touch targets ≥44px. `@media (hover: hover)` para hovers.
9. **Tokens del design system**: usar SOLO los tokens de `globals.css`. NUNCA hex hardcoded en componentes.
10. **Iconos**: lucide-react o custom de `components/icons/`. Stroke 1.5. Nada de Material Icons / FontAwesome / emojis decorativos.

## Design System

Sistema "Engineered Editorial" — paleta tinta cálida, tipografía Inter + JetBrains Mono, radii 6/10/16px, motion 200-320ms, casi sin sombras (border 1px > shadow). Detalle completo en `docs/design-system.md` (copia del Anexo F del blueprint).

### Colors (semantic tokens)
- `--color-bg` `var(--ink-50)` (light: #FAFAF9, dark: #101013)
- `--color-surface` `var(--ink-0)`
- `--color-fg` `var(--ink-900)` (light: #0E1120, dark: #F4F4F5)
- `--color-fg-muted` `var(--ink-600)`
- `--color-border` `var(--ink-200)`
- `--color-accent` `var(--accent-uxea)` (default `#3B5BDB` light / `#7C9CFF` dark) — sobrescrito por `data-brand`

### Typography
- Headings: Inter, weight 600, letter-spacing -0.03em (display) / -0.02em (h3-h4)
- Body: Inter, weight 400, line-height 1.65
- Mono: JetBrains Mono con `tabular-nums` para números

### Style
- Border radius: 6px botones/inputs, 10px cards, 16px modals, full solo dots/avatares
- Shadows: rara vez (`--shadow-2`, `--shadow-3`)
- Spacing base: 8px
- Aesthetic: rigor técnico + voz editorial. Sobrio, denso pero respirado, hairlines 1px > sombras.

## Environment Variables

Todas en `.env.example`. Validadas en `src/lib/env.ts` con Zod. Build falla si falta una requerida.

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `AUTH_SECRET` | Secret Auth.js (openssl rand -base64 32) |
| `RESEND_API_KEY` | API key Resend |
| `S3_*` | MinIO credentials |
| `REDIS_URL` | Redis connection |
| `APP_ENCRYPTION_KEY` | AES key para datos sensibles |
| `CRON_SECRET` | Bearer token para `/api/cron/*` |
| `SENTRY_DSN` | Glitchtip DSN |

## Reglas No Negociables

1. **TypeScript strict siempre.** No `any`, no `// @ts-ignore`. Si hace falta, `unknown` + narrow.
2. **No registro público.** Las cuentas las crea staff. La página `/registro` no existe.
3. **Auth en middleware.** Toda ruta privada se protege ahí + check RBAC en server action.
4. **Audit log obligatorio** en operaciones destructivas o de cambio de rol.
5. **Mobile-first.** `@media (hover: hover)` para hovers, touch targets ≥44px.
6. **No tokens fuera del design system.** Si necesitas un color nuevo, añádelo a `globals.css` primero.
7. **Tablas Postgres con timestamps.** Toda tabla tiene `created_at`, las mutables `updated_at`, las soft-deletables `deleted_at`.
8. **Soft delete por defecto** en tablas con valor histórico (customers, invoices, tickets, users). Hard delete solo en tokens efímeros.
9. **Idempotencia** en webhooks y crons. Reintentos no duplican efectos.
10. **No commitear `.env`.** `.env.example` versionado, `.env.local` ignorado.
11. **Migraciones** se generan con `drizzle-kit`, se versionan, NUNCA se editan tras aplicar.
12. **Copy en es-ES.** "Email" → "Correo" o "Email" (consistente). "Submit" → "Enviar". Sin anglicismos forzados.
13. **A11y obligatoria.** focus-visible, aria-labels en iconos, contraste AA mínimo, no solo color como portador de info.
14. **Server Components by default.** `'use client'` justificado.
15. **Sin shadcn install.** El design system es custom — copiar componentes desde el blueprint, no `shadcn add`.
