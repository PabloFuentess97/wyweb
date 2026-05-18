-- Extensiones requeridas por el schema (drizzle/migrations/0000_*.sql espera
-- que `citext` y `gen_random_uuid()` estén disponibles).
-- Este script se ejecuta en `docker-entrypoint-initdb.d` solo en la primera
-- creación del volumen — re-arranques posteriores no lo vuelven a ejecutar.

CREATE EXTENSION IF NOT EXISTS "citext";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
