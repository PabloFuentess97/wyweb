import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { auditLog } from '@/lib/db/schema';
import {
  getAdminDocumentById,
  getDocumentForClient,
} from '@/lib/db/queries/documents';
import {
  getPresignedGetUrl,
  StorageNotConfiguredError,
} from '@/lib/storage/presigned';

export const runtime = 'nodejs';

/**
 * Endpoint de descarga de documentos.
 *
 * - staff_*: descarga cualquier documento (incluso visibilidad oculta).
 * - client_*: solo documentos de sus customers con `visibleToClient = true`.
 *
 * Genera URL firmada GET a S3/MinIO (TTL 5 min), audit log, 302 redirect.
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
  const isStaff = session.user.role.startsWith('staff_');

  const doc = isStaff
    ? await getAdminDocumentById(id)
    : await getDocumentForClient(id, session.user.customerIds);
  if (!doc) {
    return NextResponse.json(
      {
        error: {
          code: 'NOT_FOUND',
          message: 'Documento no encontrado o no accesible.',
        },
      },
      { status: 404 },
    );
  }

  let url: string;
  try {
    url = await getPresignedGetUrl(doc.storageKey, {
      filename: doc.name,
      contentType: doc.mimeType,
    });
  } catch (e) {
    if (e instanceof StorageNotConfiguredError) {
      return NextResponse.json(
        {
          error: {
            code: 'STORAGE_NOT_CONFIGURED',
            message:
              'El almacenamiento todavía no está conectado. Inténtalo más tarde o contacta con soporte.',
          },
        },
        { status: 503 },
      );
    }
    console.error('[documentos/download] presigned URL error:', e);
    return NextResponse.json(
      {
        error: {
          code: 'STORAGE_ERROR',
          message: 'No se pudo generar el enlace de descarga.',
        },
      },
      { status: 500 },
    );
  }

  // Audit log
  try {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      undefined;
    await db.insert(auditLog).values({
      actorUserId: session.user.id,
      action: 'document.downloaded',
      entityType: 'document',
      entityId: doc.id,
      diff: { name: doc.name, category: doc.category },
      ip,
      userAgent: req.headers.get('user-agent') ?? undefined,
    });
  } catch (e) {
    // Audit fallido no bloquea la descarga, sólo loguea
    console.warn('[documentos/download] audit failed:', e);
  }

  return NextResponse.redirect(url, { status: 302 });
}
