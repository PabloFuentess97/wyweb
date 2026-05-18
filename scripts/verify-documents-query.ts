import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { customerUsers, documents, users } from '../src/lib/db/schema';

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
      name: documents.name,
      category: documents.category,
      sizeBytes: documents.sizeBytes,
      mimeType: documents.mimeType,
      storageKey: documents.storageKey,
    })
    .from(documents)
    .where(
      and(
        inArray(documents.customerId, ids),
        eq(documents.visibleToClient, true),
      ),
    )
    .orderBy(desc(documents.createdAt));

  console.log(`Documentos del cliente demo (${list.length}):`);
  for (const d of list) {
    const kb = (d.sizeBytes / 1024).toFixed(1);
    console.log(`  · [${d.category}]  ${kb} KB  ${d.name}`);
    console.log(`      key: ${d.storageKey}`);
  }

  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
