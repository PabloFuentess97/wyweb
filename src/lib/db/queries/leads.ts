import 'server-only';
import { db } from '@/lib/db';
import { leads, type Lead, type NewLead } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';

export async function createLead(input: NewLead): Promise<Lead> {
  const [row] = await db.insert(leads).values(input).returning();
  if (!row) throw new Error('Insert lead returned no row');
  return row;
}

export async function getLeadById(id: string): Promise<Lead | undefined> {
  const [row] = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
  return row;
}

export async function getRecentLeads(limit = 50): Promise<Lead[]> {
  return db.select().from(leads).orderBy(desc(leads.createdAt)).limit(limit);
}
