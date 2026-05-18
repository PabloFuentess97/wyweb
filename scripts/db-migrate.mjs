// Versión .mjs del migrator usada en runtime de producción (entrypoint del
// contenedor). El equivalente .ts (`db-migrate.ts`) se mantiene para `pnpm
// db:migrate` en local con tsx. Ambos scripts hacen lo mismo.

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL no definido. Aborto.');
    process.exit(1);
  }

  const ssl = url.includes('localhost') || url.includes('127.0.0.1') || url.includes('@db:')
    ? false
    : 'require';

  console.log(`▸ Conectando a Postgres (ssl=${ssl})…`);
  const migrationClient = postgres(url, { max: 1, ssl });
  const db = drizzle(migrationClient);

  console.log('▸ Aplicando migraciones desde ./drizzle/migrations …');
  await migrate(db, { migrationsFolder: './drizzle/migrations' });

  console.log('✓ Migraciones aplicadas correctamente.');
  await migrationClient.end();
  process.exit(0);
}

main().catch((err) => {
  console.error('✗ Migración falló:', err);
  process.exit(1);
});
