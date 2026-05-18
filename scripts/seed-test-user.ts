import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { hash } from '@node-rs/argon2';
import { eq } from 'drizzle-orm';
import { users } from '../src/lib/db/schema';

async function main() {
  const url = process.env.DATABASE_URL!;
  const ssl = url.includes('localhost') ? false : 'require';
  const client = postgres(url, { max: 1, ssl });
  const db = drizzle(client);

  const email = 'test-admin@uxea.net';
  const name = 'Test Admin';
  const password = 'TestPassword2026!';

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing) {
    console.log(`✓ Usuario test ya existe (id=${existing.id}). Email: ${email}`);
    await client.end();
    return;
  }

  const passwordHash = await hash(password, {
    algorithm: 2,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });

  const [created] = await db
    .insert(users)
    .values({
      email,
      name,
      role: 'staff_admin',
      passwordHash,
      emailVerified: new Date(),
    })
    .returning({ id: users.id });

  console.log(`✓ Usuario test creado:`);
  console.log(`  email   : ${email}`);
  console.log(`  password: ${password}`);
  console.log(`  role    : staff_admin`);
  console.log(`  id      : ${created?.id}`);

  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
