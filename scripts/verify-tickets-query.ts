import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { asc, eq, inArray, sql } from 'drizzle-orm';
import {
  customerUsers,
  ticketMessages,
  tickets,
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

  const list = await db
    .select({
      number: tickets.number,
      subject: tickets.subject,
      status: tickets.status,
      priority: tickets.priority,
      messageCount: sql<number>`(
        SELECT COUNT(*)::int FROM ${ticketMessages}
        WHERE ${ticketMessages.ticketId} = ${tickets.id}
          AND ${ticketMessages.isInternalNote} = false
      )`,
    })
    .from(tickets)
    .where(inArray(tickets.customerId, ids));

  console.log('Tickets del cliente demo:');
  for (const t of list) {
    console.log(
      `  · ${t.number}  [${t.status}/${t.priority}]  msgs=${t.messageCount}  ${t.subject.slice(0, 50)}`,
    );
  }

  // Mensajes del primer ticket
  if (list.length > 0) {
    const [first] = await db
      .select({ id: tickets.id })
      .from(tickets)
      .where(eq(tickets.number, list[0]!.number))
      .limit(1);
    if (first) {
      const msgs = await db
        .select({
          authorRole: ticketMessages.authorRole,
          body: ticketMessages.body,
          authorName: users.name,
          createdAt: ticketMessages.createdAt,
        })
        .from(ticketMessages)
        .leftJoin(users, eq(users.id, ticketMessages.authorId))
        .where(eq(ticketMessages.ticketId, first.id))
        .orderBy(asc(ticketMessages.createdAt));

      console.log(`\nMensajes de ${list[0]!.number} (${msgs.length}):`);
      for (const m of msgs) {
        console.log(`  · [${m.authorRole}] ${m.authorName ?? '?'}: ${m.body.slice(0, 60)}…`);
      }
    }
  }

  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
