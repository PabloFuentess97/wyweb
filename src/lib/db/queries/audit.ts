import 'server-only';
import { desc, eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { auditLog, users } from '@/lib/db/schema';

export type AuditLogItem = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  actorUserId: string | null;
  actorName: string | null;
  actorEmail: string | null;
  actorRole: string | null;
  diff: Record<string, unknown>;
  ip: string | null;
  userAgent: string | null;
  createdAt: Date;
};

export async function getAuditLogList(options: {
  limit?: number;
} = {}): Promise<AuditLogItem[]> {
  const limit = options.limit ?? 500;

  const rows = await db
    .select({
      id: auditLog.id,
      action: auditLog.action,
      entityType: auditLog.entityType,
      entityId: auditLog.entityId,
      actorUserId: auditLog.actorUserId,
      actorName: users.name,
      actorEmail: users.email,
      actorRole: users.role,
      diff: auditLog.diff,
      ip: auditLog.ip,
      userAgent: auditLog.userAgent,
      createdAt: auditLog.createdAt,
    })
    .from(auditLog)
    .leftJoin(users, eq(users.id, auditLog.actorUserId))
    .orderBy(desc(auditLog.createdAt))
    .limit(limit);

  return rows.map((r) => ({
    ...r,
    diff: (r.diff ?? {}) as Record<string, unknown>,
  }));
}

export async function getAuditLogStats(): Promise<{
  total: number;
  last24h: number;
  last7d: number;
  uniqueEntityTypes: number;
}> {
  const [row] = await db
    .select({
      total: sql<number>`COUNT(*)::int`,
      last24h: sql<number>`COUNT(*) FILTER (WHERE ${auditLog.createdAt} >= NOW() - INTERVAL '24 hours')::int`,
      last7d: sql<number>`COUNT(*) FILTER (WHERE ${auditLog.createdAt} >= NOW() - INTERVAL '7 days')::int`,
      uniqueEntityTypes: sql<number>`COUNT(DISTINCT ${auditLog.entityType})::int`,
    })
    .from(auditLog);

  return (
    row ?? {
      total: 0,
      last24h: 0,
      last7d: 0,
      uniqueEntityTypes: 0,
    }
  );
}

/** Acciones distintas del audit log (para filtro). */
export async function getAuditDistinctActions(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ action: auditLog.action })
    .from(auditLog)
    .orderBy(auditLog.action);
  return rows.map((r) => r.action);
}
