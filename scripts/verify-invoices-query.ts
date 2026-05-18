import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm';
import {
  customerUsers,
  invoiceLines,
  invoices,
  users,
} from '../src/lib/db/schema';

async function main() {
  const url = process.env.DATABASE_URL!;
  const ssl = url.includes('localhost') ? false : 'require';
  const client = postgres(url, { max: 1, ssl });
  const db = drizzle(client);

  const [link] = await db
    .select({ customerId: customerUsers.customerId })
    .from(users)
    .leftJoin(customerUsers, eq(customerUsers.userId, users.id))
    .where(eq(users.email, 'demo-cliente@uxea.net'))
    .limit(1);

  if (!link?.customerId) {
    console.log('No customer link');
    await client.end();
    return;
  }

  const ids = [link.customerId];

  // Listing
  const list = await db
    .select({
      number: invoices.number,
      status: invoices.status,
      issuedAt: invoices.issuedAt,
      totalCents: invoices.totalCents,
    })
    .from(invoices)
    .where(
      and(inArray(invoices.customerId, ids), sql`${invoices.status} != 'draft'`),
    )
    .orderBy(desc(invoices.issuedAt));

  console.log('Facturas listing (cliente demo):');
  for (const inv of list) {
    console.log(
      `  · ${inv.number}  [${inv.status}]  ${inv.issuedAt}  ${(inv.totalCents / 100).toFixed(2)} €`,
    );
  }

  // Detalle de la primera con líneas
  if (list.length > 0) {
    const [first] = await db
      .select({
        id: invoices.id,
        number: invoices.number,
        subtotalCents: invoices.subtotalCents,
        vatCents: invoices.vatCents,
        irpfCents: invoices.irpfCents,
        totalCents: invoices.totalCents,
      })
      .from(invoices)
      .where(eq(invoices.number, list[0]!.number))
      .limit(1);

    if (first) {
      console.log(`\nDetalle de ${first.number}:`);
      console.log(`  subtotal : ${(first.subtotalCents / 100).toFixed(2)} €`);
      console.log(`  iva      : ${(first.vatCents / 100).toFixed(2)} €`);
      console.log(`  irpf     : ${(first.irpfCents / 100).toFixed(2)} €`);
      console.log(`  total    : ${(first.totalCents / 100).toFixed(2)} €`);

      const lines = await db
        .select({
          description: invoiceLines.description,
          quantity: invoiceLines.quantity,
          unitPriceCents: invoiceLines.unitPriceCents,
          subtotalCents: invoiceLines.subtotalCents,
        })
        .from(invoiceLines)
        .where(eq(invoiceLines.invoiceId, first.id))
        .orderBy(asc(invoiceLines.sortOrder));

      console.log(`\n  Líneas (${lines.length}):`);
      for (const l of lines) {
        console.log(
          `    · ${l.quantity.padStart(4)} × ${(l.unitPriceCents / 100).toFixed(2).padStart(8)} €  ${l.description}`,
        );
      }
    }
  }

  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
