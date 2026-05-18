import 'dotenv/config';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { hash } from '@node-rs/argon2';
import { eq } from 'drizzle-orm';
import { users } from '../src/lib/db/schema';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('✗ DATABASE_URL no definido. Aborto.');
    process.exit(1);
  }

  const ssl = url.includes('localhost') ? false : 'require';
  const client = postgres(url, { max: 1, ssl });
  const db = drizzle(client);

  const rl = createInterface({ input: stdin, output: stdout });

  console.log('\n──── CREAR CUENTA STAFF UXEA ────\n');

  const name = (await rl.question('Nombre completo: ')).trim();
  if (!name) fatal('Nombre requerido.', client);

  const email = (await rl.question('Email: ')).trim().toLowerCase();
  if (!email.includes('@')) fatal('Email no válido.', client);

  const role = (
    await rl.question('Rol [staff_admin / staff_agent] (default staff_admin): ')
  )
    .trim()
    .toLowerCase();
  const finalRole =
    role === 'staff_agent' ? 'staff_agent' : 'staff_admin';

  let password = (
    await rl.question(
      'Contraseña (mínimo 12 chars, vacío = dejar sin password y enviar reset): ',
    )
  ).trim();

  rl.close();

  // Comprobar si existe
  const [existing] = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing) {
    console.error(`\n✗ Ya existe un usuario con email ${email} (id=${existing.id}).`);
    await client.end();
    process.exit(1);
  }

  let passwordHash: string | null = null;
  if (password.length > 0) {
    if (password.length < 12) {
      console.error('\n✗ La contraseña debe tener mínimo 12 caracteres.');
      await client.end();
      process.exit(1);
    }
    passwordHash = await hash(password, {
      algorithm: 2, // Argon2id
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
    });
    password = ''; // limpiar de memoria
  }

  const [created] = await db
    .insert(users)
    .values({
      email,
      name,
      role: finalRole,
      passwordHash,
      emailVerified: passwordHash ? new Date() : null,
    })
    .returning({ id: users.id, email: users.email, role: users.role });

  if (!created) {
    console.error('\n✗ No se pudo crear el usuario.');
    await client.end();
    process.exit(1);
  }

  console.log('\n✓ Usuario creado:');
  console.log(`  · id    : ${created.id}`);
  console.log(`  · email : ${created.email}`);
  console.log(`  · rol   : ${created.role}`);
  if (!passwordHash) {
    console.log('\n⚠ Sin contraseña. El usuario debe usar /recuperar para fijar una.');
  } else {
    console.log('\n✓ Contraseña Argon2id guardada. Listo para iniciar sesión.');
  }

  await client.end();
  process.exit(0);
}

function fatal(msg: string, client: ReturnType<typeof postgres>): never {
  console.error(`✗ ${msg}`);
  void client.end();
  process.exit(1);
}

main().catch((err) => {
  console.error('✗ Error inesperado:', err);
  process.exit(1);
});
