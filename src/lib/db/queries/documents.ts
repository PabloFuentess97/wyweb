import 'server-only';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { customers, documents, users } from '@/lib/db/schema';

export type DocCategory = 'contract' | 'certificate' | 'report' | 'other';

export type DocumentItem = {
  id: string;
  name: string;
  category: DocCategory;
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: Date;
};

export async function getDocumentsByCustomer(
  customerIds: ReadonlyArray<string>,
): Promise<DocumentItem[]> {
  if (customerIds.length === 0) return [];
  const ids = customerIds as string[];

  return db
    .select({
      id: documents.id,
      name: documents.name,
      category: documents.category,
      storageKey: documents.storageKey,
      mimeType: documents.mimeType,
      sizeBytes: documents.sizeBytes,
      createdAt: documents.createdAt,
    })
    .from(documents)
    .where(
      and(
        inArray(documents.customerId, ids),
        eq(documents.visibleToClient, true),
      ),
    )
    .orderBy(desc(documents.createdAt));
}

// ─── Admin queries ────────────────────────────────────────────────────

export type AdminDocumentItem = {
  id: string;
  name: string;
  category: DocCategory;
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
  visibleToClient: boolean;
  customerId: string;
  customerName: string;
  customerCif: string;
  uploadedByName: string | null;
  createdAt: Date;
};

export async function getAdminDocumentsList(): Promise<AdminDocumentItem[]> {
  return db
    .select({
      id: documents.id,
      name: documents.name,
      category: documents.category,
      storageKey: documents.storageKey,
      mimeType: documents.mimeType,
      sizeBytes: documents.sizeBytes,
      visibleToClient: documents.visibleToClient,
      customerId: documents.customerId,
      customerName: customers.legalName,
      customerCif: customers.cif,
      uploadedByName: users.name,
      createdAt: documents.createdAt,
    })
    .from(documents)
    .innerJoin(customers, eq(customers.id, documents.customerId))
    .leftJoin(users, eq(users.id, documents.uploadedByUserId))
    .orderBy(desc(documents.createdAt));
}

export async function getAdminDocumentsStats(): Promise<{
  total: number;
  visibleCount: number;
  totalSizeBytes: number;
}> {
  const [row] = await db
    .select({
      total: sql<number>`COUNT(*)::int`,
      visibleCount: sql<number>`COUNT(*) FILTER (WHERE ${documents.visibleToClient} = true)::int`,
      totalSizeBytes: sql<number>`COALESCE(SUM(${documents.sizeBytes}), 0)::bigint`,
    })
    .from(documents);
  return {
    total: row?.total ?? 0,
    visibleCount: row?.visibleCount ?? 0,
    totalSizeBytes: Number(row?.totalSizeBytes ?? 0),
  };
}

export async function getAdminDocumentById(
  id: string,
): Promise<AdminDocumentItem | null> {
  const [row] = await db
    .select({
      id: documents.id,
      name: documents.name,
      category: documents.category,
      storageKey: documents.storageKey,
      mimeType: documents.mimeType,
      sizeBytes: documents.sizeBytes,
      visibleToClient: documents.visibleToClient,
      customerId: documents.customerId,
      customerName: customers.legalName,
      customerCif: customers.cif,
      uploadedByName: users.name,
      createdAt: documents.createdAt,
    })
    .from(documents)
    .innerJoin(customers, eq(customers.id, documents.customerId))
    .leftJoin(users, eq(users.id, documents.uploadedByUserId))
    .where(eq(documents.id, id))
    .limit(1);
  return row ?? null;
}

export async function getDocumentForClient(
  documentId: string,
  customerIds: ReadonlyArray<string>,
): Promise<DocumentItem | null> {
  if (customerIds.length === 0) return null;
  const ids = customerIds as string[];

  const [row] = await db
    .select({
      id: documents.id,
      name: documents.name,
      category: documents.category,
      storageKey: documents.storageKey,
      mimeType: documents.mimeType,
      sizeBytes: documents.sizeBytes,
      createdAt: documents.createdAt,
    })
    .from(documents)
    .where(
      and(
        eq(documents.id, documentId),
        inArray(documents.customerId, ids),
        eq(documents.visibleToClient, true),
      ),
    )
    .limit(1);

  return row ?? null;
}
