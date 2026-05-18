import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { auditLog, customerUsers, invoices } from '@/lib/db/schema';
import { createBillingProvider } from '@/lib/billing/provider';
import {
  BillingInvalidStateError,
  BillingNotFoundError,
} from '@/lib/billing/provider';
import { StorageNotConfiguredError } from '@/lib/storage/presigned';

export const runtime = 'nodejs';

/**
 * Descarga PDF de una factura.
 * - staff_*: acceso a cualquier factura.
 * - client_*: solo facturas de los customers a los que pertenece, y nunca drafts.
 * Devuelve 302 a una URL firmada (TTL 5 min). Audit log de la descarga.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Sesión no válida.' } },
      { status: 401 },
    );
  }

  const { id } = await params;

  const [inv] = await db
    .select({
      id: invoices.id,
      number: invoices.number,
      status: invoices.status,
      customerId: invoices.customerId,
      pdfStorageKey: invoices.pdfStorageKey,
    })
    .from(invoices)
    .where(eq(invoices.id, id))
    .limit(1);

  if (!inv) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Factura no encontrada.' } },
      { status: 404 },
    );
  }

  // RBAC para clientes: deben pertenecer al customer + factura no draft
  const isStaff = session.user.role.startsWith('staff_');
  if (!isStaff) {
    if (inv.status === 'draft') {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Factura no encontrada.' } },
        { status: 404 },
      );
    }
    const [link] = await db
      .select({ customerId: customerUsers.customerId })
      .from(customerUsers)
      .where(eq(customerUsers.userId, session.user.id))
      .limit(50);
    const customerIds = (session.user.customerIds ?? []) as string[];
    const allowed =
      customerIds.includes(inv.customerId) || link?.customerId === inv.customerId;
    if (!allowed) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Acceso no autorizado.' } },
        { status: 403 },
      );
    }
  }

  if (!inv.pdfStorageKey) {
    return NextResponse.json(
      {
        error: {
          code: 'PDF_NOT_GENERATED',
          message:
            'Esta factura aún no tiene PDF generado. Si es staff, vuelve a emitirla para regenerar el PDF.',
        },
      },
      { status: 409 },
    );
  }

  let url: string;
  try {
    const provider = createBillingProvider();
    url = await provider.getPdfUrl(inv.id);
  } catch (e) {
    if (e instanceof StorageNotConfiguredError) {
      return NextResponse.json(
        {
          error: {
            code: 'STORAGE_NOT_CONFIGURED',
            message: 'Almacenamiento PDF no configurado.',
          },
        },
        { status: 503 },
      );
    }
    if (e instanceof BillingNotFoundError) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: e.message } },
        { status: 404 },
      );
    }
    if (e instanceof BillingInvalidStateError) {
      return NextResponse.json(
        { error: { code: 'INVALID_STATE', message: e.message } },
        { status: 409 },
      );
    }
    console.error('[facturas/pdf] error:', e);
    return NextResponse.json(
      { error: { code: 'INTERNAL', message: 'Error generando descarga.' } },
      { status: 500 },
    );
  }

  // Audit log (no bloqueante)
  try {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      undefined;
    await db.insert(auditLog).values({
      actorUserId: session.user.id,
      action: 'invoice.pdf_downloaded',
      entityType: 'invoice',
      entityId: inv.id,
      diff: { number: inv.number },
      ip,
      userAgent: req.headers.get('user-agent') ?? undefined,
    });
  } catch (e) {
    console.warn('[facturas/pdf] audit failed:', e);
  }

  return NextResponse.redirect(url, { status: 302 });
}
