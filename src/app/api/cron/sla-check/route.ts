import { NextResponse, type NextRequest } from 'next/server';
import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { auditLog } from '@/lib/db/schema';
import { env } from '@/lib/env';

export const runtime = 'nodejs';

/**
 * Cron diario / horario: detecta tickets con SLA vencido y marca evento en
 * el audit log. Idempotente: si el ticket ya tiene audit `ticket.sla_breached`
 * para su `slaDueAt` actual, no se vuelve a registrar.
 *
 * Trigger esperado: cron externo (Coolify/cron del VPS) con header
 *   Authorization: Bearer ${CRON_SECRET}
 *
 * En desarrollo, si CRON_SECRET no está fijado, el endpoint requiere igualmente
 * un header válido (no acepta sin auth).
 */
export async function GET(req: NextRequest) {
  const cronSecret = env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      {
        error: {
          code: 'CRON_NOT_CONFIGURED',
          message: 'CRON_SECRET no está definido en este entorno.',
        },
      },
      { status: 503 },
    );
  }

  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Token inválido.' } },
      { status: 401 },
    );
  }

  // Tickets con SLA vencido que aún no tienen primera respuesta y no están cerrados
  const breachedRows = await db.execute(sql`
    SELECT
      t.id,
      t.number,
      t.subject,
      t.priority,
      t.customer_id AS "customerId",
      c.legal_name AS "customerName",
      t.assigned_to_user_id AS "assignedToUserId",
      t.sla_due_at AS "slaDueAt"
    FROM tickets t
    JOIN customers c ON c.id = t.customer_id
    WHERE t.sla_due_at IS NOT NULL
      AND t.sla_due_at < NOW()
      AND t.first_response_at IS NULL
      AND t.status NOT IN ('resolved','closed')
      AND NOT EXISTS (
        SELECT 1 FROM audit_log al
        WHERE al.entity_type = 'ticket'
          AND al.entity_id = t.id
          AND al.action = 'ticket.sla_breached'
          AND (al.diff->>'slaDueAt')::timestamptz = t.sla_due_at
      )
    ORDER BY t.sla_due_at ASC
  `);

  type Row = {
    id: string;
    number: string;
    subject: string;
    priority: string;
    customerId: string;
    customerName: string;
    assignedToUserId: string | null;
    slaDueAt: string;
  };
  const breached = breachedRows as unknown as Row[];

  let logged = 0;
  for (const row of breached) {
    try {
      await db.insert(auditLog).values({
        actorUserId: null,
        action: 'ticket.sla_breached',
        entityType: 'ticket',
        entityId: row.id,
        diff: {
          number: row.number,
          subject: row.subject,
          priority: row.priority,
          customerId: row.customerId,
          customerName: row.customerName,
          assignedToUserId: row.assignedToUserId,
          slaDueAt: row.slaDueAt,
        },
      });
      logged += 1;
    } catch (e) {
      console.error('[sla-check] audit insert error:', e);
    }
  }

  // TODO F2: enviar email a staff_admin con resumen si logged > 0
  // (lo dejamos como nota — la cola BullMQ se monta en Paso 22)

  return NextResponse.json({
    data: {
      checkedAt: new Date().toISOString(),
      breachedFound: breached.length,
      logged,
    },
  });
}
