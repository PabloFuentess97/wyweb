import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { asc, eq, inArray, sql } from 'drizzle-orm';
import { customerUsers, services, users } from '../src/lib/db/schema';

async function main() {
  const url = process.env.DATABASE_URL!;
  const ssl = url.includes('localhost') ? false : 'require';
  const client = postgres(url, { max: 1, ssl });
  const db = drizzle(client);

  // Cliente demo
  const [link] = await db
    .select({ customerId: customerUsers.customerId, userId: users.id })
    .from(users)
    .leftJoin(customerUsers, eq(customerUsers.userId, users.id))
    .where(eq(users.email, 'demo-cliente@uxea.net'))
    .limit(1);

  if (!link?.customerId) {
    console.log('No customer link found');
    await client.end();
    return;
  }

  const customerIds = [link.customerId];

  const rows = await db
    .select({
      code: services.code,
      name: services.name,
      category: services.category,
      status: services.status,
      slaTier: services.slaTier,
      monthlyFeeCents: services.monthlyFeeCents,
      startedAt: services.startedAt,
    })
    .from(services)
    .where(inArray(services.customerId, customerIds))
    .orderBy(
      sql`CASE ${services.status}
        WHEN 'active' THEN 1
        WHEN 'pending' THEN 2
        WHEN 'suspended' THEN 3
        WHEN 'terminated' THEN 4
      END`,
      asc(services.code),
    );

  console.log('Servicios del cliente demo:');
  for (const s of rows) {
    const fee =
      s.monthlyFeeCents !== null
        ? `${(s.monthlyFeeCents / 100).toFixed(2)} €/mes`
        : '—';
    console.log(
      `  · ${s.code}  [${s.status}]  SLA-${s.slaTier}  ${fee}  ${s.name} (${s.category})`,
    );
  }

  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
