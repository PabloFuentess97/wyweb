import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import { customers, documents, users } from '../src/lib/db/schema';

/**
 * Seed idempotente: añade 3 documentos demo (contrato, certificado, informe)
 * al cliente "Cerámicas Granadinas SL". Las claves de storage son placeholders
 * — los archivos no se suben a S3, sólo los registros para la UI.
 */

const STORAGE_KEYS = [
  'demo/customers/ceramicas-granadinas/contrato-marco-2024.pdf',
  'demo/customers/ceramicas-granadinas/certificado-instalacion-fibra.pdf',
  'demo/customers/ceramicas-granadinas/informe-q1-2026.pdf',
];

async function main() {
  const url = process.env.DATABASE_URL!;
  const ssl = url.includes('localhost') ? false : 'require';
  const client = postgres(url, { max: 1, ssl });
  const db = drizzle(client);

  // 1. Customer demo
  const [customer] = await db
    .select({ id: customers.id })
    .from(customers)
    .where(eq(customers.cif, 'B18000001'))
    .limit(1);
  if (!customer) {
    console.error('✗ No se encontró el customer demo. Ejecuta seed-demo-customer.ts antes.');
    await client.end();
    process.exit(1);
  }

  // 2. User uploader (staff_admin de tests)
  const [staffUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, 'test-admin@uxea.net'))
    .limit(1);
  if (!staffUser) {
    console.error(
      '✗ No se encontró el staff. Ejecuta seed-test-user.ts antes.',
    );
    await client.end();
    process.exit(1);
  }

  const docs = [
    {
      name: 'Contrato Marco · Cerámicas Granadinas · 2024.pdf',
      category: 'contract' as const,
      storageKey: STORAGE_KEYS[0]!,
      mimeType: 'application/pdf',
      sizeBytes: 248_192,
    },
    {
      name: 'Certificado de instalación · Fibra 1Gbps.pdf',
      category: 'certificate' as const,
      storageKey: STORAGE_KEYS[1]!,
      mimeType: 'application/pdf',
      sizeBytes: 132_481,
    },
    {
      name: 'Informe trimestral · Q1 2026 · Uptime y SLA.pdf',
      category: 'report' as const,
      storageKey: STORAGE_KEYS[2]!,
      mimeType: 'application/pdf',
      sizeBytes: 412_033,
    },
  ];

  for (const d of docs) {
    const [existing] = await db
      .select({ id: documents.id })
      .from(documents)
      .where(eq(documents.storageKey, d.storageKey))
      .limit(1);
    if (existing) {
      console.log(`  · Documento ya existía: ${d.name}`);
      continue;
    }
    await db.insert(documents).values({
      customerId: customer.id,
      name: d.name,
      category: d.category,
      storageKey: d.storageKey,
      mimeType: d.mimeType,
      sizeBytes: d.sizeBytes,
      visibleToClient: true,
      uploadedByUserId: staffUser.id,
    });
    console.log(`  ✓ Documento creado: ${d.name}`);
  }

  console.log('\n✓ Seed documentos completado.');
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
