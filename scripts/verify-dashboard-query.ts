import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { and, count, desc, eq, inArray, ne } from 'drizzle-orm';
import {
  customerUsers,
  invoices,
  services,
  tickets,
  users,
} from '../src/lib/db/schema';

async function main() {
  const url = process.env.DATABASE_URL!;
  const ssl = url.includes('localhost') ? false : 'require';
  const client = postgres(url, { max: 1, ssl });
  const db = drizzle(client);

  // 1. Encontrar cliente demo y sus customerIds
  const linkRows = await db
    .select({
      userId: users.id,
      userEmail: users.email,
      userName: users.name,
      userRole: users.role,
      customerId: customerUsers.customerId,
    })
    .from(users)
    .leftJoin(customerUsers, eq(customerUsers.userId, users.id))
    .where(eq(users.email, 'demo-cliente@uxea.net'));

  console.log('Cliente demo:');
  if (linkRows.length === 0) {
    console.log('  (no encontrado)');
    await client.end();
    return;
  }
  console.log(`  user      : ${linkRows[0]!.userName} (${linkRows[0]!.userEmail})`);
  console.log(`  rol       : ${linkRows[0]!.userRole}`);
  const customerIds = linkRows
    .map((r) => r.customerId)
    .filter((id): id is string => id !== null);
  console.log(`  customers : ${customerIds.length} (${customerIds.join(', ')})`);

  if (customerIds.length === 0) {
    await client.end();
    return;
  }

  // 2. Replicar la query del dashboard
  const [
    activeServicesRows,
    pendingInvoicesRows,
    openTicketsRows,
    overdueInvoicesRows,
    recentTicketsRows,
    recentInvoicesRows,
  ] = await Promise.all([
    db
      .select({ value: count() })
      .from(services)
      .where(
        and(inArray(services.customerId, customerIds), eq(services.status, 'active')),
      ),
    db
      .select({ value: count() })
      .from(invoices)
      .where(
        and(
          inArray(invoices.customerId, customerIds),
          inArray(invoices.status, ['issued', 'overdue']),
        ),
      ),
    db
      .select({ value: count() })
      .from(tickets)
      .where(
        and(
          inArray(tickets.customerId, customerIds),
          inArray(tickets.status, ['open', 'in_progress', 'waiting_customer']),
        ),
      ),
    db
      .select({ value: count() })
      .from(invoices)
      .where(
        and(
          inArray(invoices.customerId, customerIds),
          eq(invoices.status, 'overdue'),
        ),
      ),
    db
      .select({
        number: tickets.number,
        subject: tickets.subject,
        status: tickets.status,
      })
      .from(tickets)
      .where(inArray(tickets.customerId, customerIds))
      .orderBy(desc(tickets.createdAt))
      .limit(5),
    db
      .select({
        number: invoices.number,
        status: invoices.status,
        totalCents: invoices.totalCents,
      })
      .from(invoices)
      .where(
        and(inArray(invoices.customerId, customerIds), ne(invoices.status, 'draft')),
      )
      .orderBy(desc(invoices.issuedAt), desc(invoices.createdAt))
      .limit(5),
  ]);

  console.log('\nKPIs:');
  console.log(`  · Servicios activos    : ${activeServicesRows[0]?.value ?? 0}`);
  console.log(`  · Facturas pendientes  : ${pendingInvoicesRows[0]?.value ?? 0}`);
  console.log(`  · Tickets abiertos     : ${openTicketsRows[0]?.value ?? 0}`);
  console.log(`  · Facturas vencidas    : ${overdueInvoicesRows[0]?.value ?? 0}`);

  console.log('\nTickets recientes:');
  for (const t of recentTicketsRows) {
    console.log(`  · ${t.number}  [${t.status}]  ${t.subject}`);
  }

  console.log('\nFacturas recientes:');
  for (const inv of recentInvoicesRows) {
    console.log(`  · ${inv.number}  [${inv.status}]  ${(inv.totalCents / 100).toFixed(2)} €`);
  }

  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
