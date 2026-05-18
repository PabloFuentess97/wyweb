import 'server-only';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { db } from '@/lib/db';
import { documents } from '@/lib/db/schema';

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
