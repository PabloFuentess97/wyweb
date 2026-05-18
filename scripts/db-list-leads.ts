import 'dotenv/config';
import postgres from 'postgres';

async function main() {
  const url = process.env.DATABASE_URL!;
  const ssl = url.includes('localhost') ? false : 'require';
  const sql = postgres(url, { max: 1, ssl });
  const rows = await sql<
    Array<{ id: string; name: string; email: string; source: string; created_at: Date }>
  >`SELECT id, name, email, source, created_at FROM leads ORDER BY created_at DESC LIMIT 5`;
  console.log(`Últimos ${rows.length} leads:`);
  for (const r of rows) {
    console.log(
      `  · ${r.id.slice(0, 8)} · ${r.name.padEnd(20)} · ${r.email.padEnd(30)} · ${r.source.padEnd(15)} · ${r.created_at.toISOString()}`,
    );
  }
  await sql.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
