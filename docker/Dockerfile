# syntax=docker/dockerfile:1.7

# ──────────────────────────────────────────────────────────────────────────
# Multi-stage build para Uxea.net (Next.js 16 standalone)
#
# Stages:
#   1. base    → Node 20 alpine + corepack + libc6-compat (necesario para
#                bindings nativos de @node-rs/argon2 en musl).
#   2. deps    → instala dependencias con pnpm + frozen lockfile.
#   3. builder → compila Next.js (genera .next/standalone).
#   4. runner  → imagen final mínima: solo standalone + static + public.
# ──────────────────────────────────────────────────────────────────────────

ARG NODE_VERSION=20-alpine

FROM node:${NODE_VERSION} AS base
RUN apk add --no-cache libc6-compat \
  && corepack enable
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1


# ─── Dependencias ────────────────────────────────────────────────────────
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile


# ─── Builder ─────────────────────────────────────────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Token de build — ARG esperados desde docker compose / CI
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
ARG NEXT_PUBLIC_BRAND=uxea-soluciones
ARG NEXT_PUBLIC_PLAUSIBLE_DOMAIN
ARG NEXT_PUBLIC_SENTRY_DSN

ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_PUBLIC_BRAND=${NEXT_PUBLIC_BRAND}
ENV NEXT_PUBLIC_PLAUSIBLE_DOMAIN=${NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
ENV NEXT_PUBLIC_SENTRY_DSN=${NEXT_PUBLIC_SENTRY_DSN}

# Next.js compila content collections automáticamente vía withContentCollections().
# Genera el output standalone en .next/standalone.
RUN pnpm build


# ─── Runner (imagen final) ───────────────────────────────────────────────
FROM node:${NODE_VERSION} AS runner
RUN apk add --no-cache libc6-compat
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Usuario no-root
RUN addgroup -g 1001 -S nodejs \
  && adduser -S -u 1001 -G nodejs nextjs

# Copiar artefactos del standalone build
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Migraciones SQL + migrator script (.mjs puro, sin tsx).
# Copiamos explícitamente las dependencias que usa el migrator porque Next.js
# trace puede no incluir `drizzle-orm/postgres-js/migrator` (sub-export que solo
# usa el script, no la app).
COPY --from=builder --chown=nextjs:nodejs /app/drizzle ./drizzle
COPY --from=builder --chown=nextjs:nodejs /app/scripts/db-migrate.mjs ./scripts/db-migrate.mjs
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/drizzle-orm ./node_modules/drizzle-orm
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/postgres ./node_modules/postgres
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/dotenv ./node_modules/dotenv
COPY --chown=nextjs:nodejs docker/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

USER nextjs
EXPOSE 3000

# Healthcheck: golpear el servidor (Next.js responde 200/3xx en `/`)
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget --quiet --spider --tries=1 http://127.0.0.1:3000/ || exit 1

# Ejecuta migraciones y luego arranca el server standalone
ENTRYPOINT ["./entrypoint.sh"]
CMD ["node", "server.js"]
