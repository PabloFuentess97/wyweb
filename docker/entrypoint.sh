#!/bin/sh
set -e

# Aplica migraciones de base de datos antes de arrancar el server.
# Si falla, el contenedor no arranca (mejor que arrancar contra schema viejo).
if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "▸ Aplicando migraciones Drizzle…"
  node ./scripts/db-migrate.mjs
  echo "✓ Migraciones aplicadas."
else
  echo "▸ RUN_MIGRATIONS=false → saltando migraciones."
fi

exec "$@"
