import 'dotenv/config';
import { eq, like } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { customers, invoices, leads, users } from '../src/lib/db/schema';
import { E2E_ADMIN, E2E_CUSTOMER, E2E_NEW_CUSTOMER } from './fixtures';

/**
 * Limpia los datos sembrados + los creados durante los tests.
 * Idempotente — se puede correr múltiples veces sin error.
 */
export default async function globalTeardown() {
  const url = process.env.DATABASE_URL;
  if (!url) return;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('E2E teardown: NUNCA contra producción');
  }
  // Skippable: útil para mantener datos tras un fallo de test y debuggear.
  if (process.env.E2E_KEEP_DATA === 'true') {
    console.log('▸ E2E teardown: E2E_KEEP_DATA=true → saltando limpieza');
    return;
  }

  const ssl =
    url.includes('localhost') || url.includes('127.0.0.1') || url.includes('@db:')
      ? false
      : ('require' as const);
  const client = postgres(url, { max: 1, ssl });
  const db = drizzle(client);

  console.log('▸ E2E teardown: limpiando…');

  // Borra leads que pudieran haberse creado por tests del formulario público
  await db.delete(leads).where(like(leads.email, '%@uxea.test'));

  // Borra invoices del customer fixture (cascade borra invoice_lines)
  const fixtureCustomers = await db
    .select({ id: customers.id })
    .from(customers)
    .where(eq(customers.cif, E2E_CUSTOMER.cif));
  for (const c of fixtureCustomers) {
    await db.delete(invoices).where(eq(invoices.customerId, c.id));
  }

  // Borra los customers fixtures
  await db.delete(customers).where(eq(customers.cif, E2E_CUSTOMER.cif));
  await db.delete(customers).where(eq(customers.cif, E2E_NEW_CUSTOMER.cif));

  // Borra el admin de prueba
  await db.delete(users).where(eq(users.email, E2E_ADMIN.email));

  await client.end();
  console.log('✓ E2E teardown completado');
}
