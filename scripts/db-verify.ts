import 'dotenv/config';
import postgres from 'postgres';

async function main() {
  const url = process.env.DATABASE_URL!;
  const ssl = url.includes('localhost') ? false : 'require';
  const sql = postgres(url, { max: 1, ssl });
  const tables = await sql<
    Array<{ table_name: string; col_count: number }>
  >`SELECT t.table_name, COUNT(c.column_name)::int AS col_count
    FROM information_schema.tables t
    LEFT JOIN information_schema.columns c ON c.table_name = t.table_name AND c.table_schema = t.table_schema
    WHERE t.table_schema='public'
    GROUP BY t.table_name
    ORDER BY t.table_name`;
  console.log(`Tablas en public (${tables.length}):`);
  for (const t of tables) {
    console.log(`  · ${t.table_name.padEnd(28)} ${t.col_count} cols`);
  }
  await sql.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
