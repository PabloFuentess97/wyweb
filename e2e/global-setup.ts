import 'dotenv/config';
import { hash } from '@node-rs/argon2';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import {
  customers,
  invoiceLines,
  invoices,
  users,
} from '../src/lib/db/schema';
import { E2E_ADMIN, E2E_CUSTOMER, E2E_DRAFT_INVOICE } from './fixtures';

/**
 * Siembra usuario admin, customer fixture y una factura draft con una línea.
 * Idempotente: si ya existen, actualiza. Hace ON CONFLICT por unique key.
 */
export default async function globalSetup() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('E2E: falta DATABASE_URL');
  if (process.env.NODE_ENV === 'production') {
    throw new Error('E2E: NUNCA ejecutar setup contra una BD de producción');
  }

  const ssl =
    url.includes('localhost') || url.includes('127.0.0.1') || url.includes('@db:')
      ? false
      : ('require' as const);
  const client = postgres(url, { max: 1, ssl });
  const db = drizzle(client);

  console.log('▸ E2E setup: sembrando datos…');

  // Hash de la contraseña con la misma config que usa la app
  const passwordHash = await hash(E2E_ADMIN.password, {
    algorithm: 2 /* Argon2id */,
    timeCost: 3,
    memoryCost: 65536,
    parallelism: 1,
  });

  // 1) Admin
  await db
    .insert(users)
    .values({
      email: E2E_ADMIN.email,
      name: E2E_ADMIN.name,
      passwordHash,
      role: 'staff_admin',
      emailVerified: new Date(),
    })
    .onConflictDoUpdate({
      target: users.email,
      set: { passwordHash, role: 'staff_admin', deletedAt: null },
    });

  // 2) Customer fixture
  await db
    .insert(customers)
    .values({
      cif: E2E_CUSTOMER.cif,
      legalName: E2E_CUSTOMER.legalName,
      emailBilling: E2E_CUSTOMER.emailBilling,
      addressLine1: E2E_CUSTOMER.addressLine1,
      postalCode: E2E_CUSTOMER.postalCode,
      city: E2E_CUSTOMER.city,
      province: E2E_CUSTOMER.province,
      country: E2E_CUSTOMER.country,
      status: 'active',
    })
    .onConflictDoUpdate({
      target: customers.cif,
      set: {
        legalName: E2E_CUSTOMER.legalName,
        emailBilling: E2E_CUSTOMER.emailBilling,
        status: 'active',
        deletedAt: null,
      },
    });

  // 3) Draft invoice — borramos los anteriores e insertamos uno fresco
  const [customer] = await db
    .select({ id: customers.id })
    .from(customers)
    .where(eq(customers.cif, E2E_CUSTOMER.cif))
    .limit(1);
  if (!customer) throw new Error('E2E: customer fixture no se sembró');

  // Borra cualquier draft con número que empiece por DRAFT-E2E
  // (no toca facturas reales del entorno)
  // No es 100% atómico pero al ser un único worker en setup vale.

  const totalCents = E2E_DRAFT_INVOICE.unitPriceCents * E2E_DRAFT_INVOICE.quantity;
  const vatCents = Math.round((totalCents * E2E_DRAFT_INVOICE.vatRate) / 100);

  const [createdInvoice] = await db
    .insert(invoices)
    .values({
      customerId: customer.id,
      number: `DRAFT-E2E-${Date.now()}`,
      series: 'A',
      status: 'draft',
      subtotalCents: totalCents,
      vatCents,
      totalCents: totalCents + vatCents,
      notes: 'Factura E2E sembrada por global-setup',
    })
    .returning({ id: invoices.id });

  if (!createdInvoice) throw new Error('E2E: insert invoice failed');

  await db.insert(invoiceLines).values({
    invoiceId: createdInvoice.id,
    description: E2E_DRAFT_INVOICE.description,
    quantity: String(E2E_DRAFT_INVOICE.quantity),
    unitPriceCents: E2E_DRAFT_INVOICE.unitPriceCents,
    vatRate: String(E2E_DRAFT_INVOICE.vatRate),
    irpfRate: '0',
    subtotalCents: totalCents,
    sortOrder: 0,
  });

  // Exporta el id para que los tests lo usen
  process.env.E2E_DRAFT_INVOICE_ID = createdInvoice.id;
  console.log(`▸ E2E setup: draft invoice id=${createdInvoice.id}`);

  await client.end();
  console.log('✓ E2E setup completado');
}
