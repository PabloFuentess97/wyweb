import { defineConfig } from 'drizzle-kit';

if (!process.env.DATABASE_URL) {
  // Cargar .env si drizzle-kit se ejecuta sin Next
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('dotenv').config({ path: '.env' });
}

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  strict: true,
  verbose: true,
});
