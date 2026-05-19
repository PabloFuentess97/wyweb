'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { auditLog, customers, documents } from '@/lib/db/schema';
import { getS3Client } from '@/lib/storage/s3';
import { getAdminDocumentById } from '@/lib/db/queries/documents';

export type ActionState =
  | { status: 'idle' }
  | { status: 'success'; message?: string }
  | {
      status: 'error';
      message: string;
      fieldErrors?: Record<string, string>;
    };

async function requireStaff() {
  const session = await auth();
  if (!session?.user || !session.user.role.startsWith('staff_')) {
    return { error: 'Esta acción requiere rol staff.', session: null as never };
  }
  return { error: null as never, session };
}

// Máx 25 MB por archivo
const MAX_FILE_BYTES = 25 * 1024 * 1024;

const uploadSchema = z.object({
  customerId: z.string().uuid('Cliente requerido'),
  name: z
    .string()
    .min(1, 'Nombre requerido')
    .max(255, 'Demasiado largo'),
  category: z.enum(['contract', 'certificate', 'report', 'other']),
  visibleToClient: z.coerce.boolean().default(true),
});

function safeFilename(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[^\w.\-]/g, '_')
    .slice(0, 200);
}

export async function uploadDocumentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { error: authErr, session } = await requireStaff();
  if (authErr) return { status: 'error', message: authErr };

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return {
      status: 'error',
      message: 'Selecciona un archivo.',
      fieldErrors: { file: 'Archivo requerido' },
    };
  }
  if (file.size > MAX_FILE_BYTES) {
    return {
      status: 'error',
      message: `Archivo demasiado grande (máx ${MAX_FILE_BYTES / 1024 / 1024} MB).`,
      fieldErrors: { file: 'Máximo 25 MB' },
    };
  }

  const parsed = uploadSchema.safeParse({
    customerId: formData.get('customerId'),
    name: formData.get('name') || file.name,
    category: formData.get('category') || 'other',
    visibleToClient: formData.get('visibleToClient') === 'on',
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const k = issue.path.map(String).join('.');
      if (k && !fieldErrors[k]) fieldErrors[k] = issue.message;
    }
    return {
      status: 'error',
      message: 'Revisa los datos.',
      fieldErrors,
    };
  }
  const data = parsed.data;

  // Valida que el customer existe y está activo
  const [customer] = await db
    .select({ id: customers.id })
    .from(customers)
    .where(eq(customers.id, data.customerId))
    .limit(1);
  if (!customer) {
    return {
      status: 'error',
      message: 'Cliente no encontrado.',
      fieldErrors: { customerId: 'Cliente no válido' },
    };
  }

  // Sube a MinIO
  const s3 = getS3Client();
  if (!s3) {
    return {
      status: 'error',
      message: 'MinIO no está configurado en este entorno.',
    };
  }

  const ts = Date.now();
  const storageKey = `documents/${data.customerId}/${ts}-${safeFilename(file.name)}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    await s3.client.send(
      new PutObjectCommand({
        Bucket: s3.config.bucket,
        Key: storageKey,
        Body: buffer,
        ContentType: file.type || 'application/octet-stream',
      }),
    );
  } catch (e) {
    console.error('[uploadDocument] S3 error:', e);
    return {
      status: 'error',
      message: 'No se pudo subir el archivo a MinIO.',
    };
  }

  let createdId: string;
  try {
    const result = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(documents)
        .values({
          customerId: data.customerId,
          name: data.name,
          category: data.category,
          storageKey,
          mimeType: file.type || 'application/octet-stream',
          sizeBytes: file.size,
          visibleToClient: data.visibleToClient,
          uploadedByUserId: session.user.id,
        })
        .returning({ id: documents.id });
      if (!created) throw new Error('Insert failed');

      await tx.insert(auditLog).values({
        actorUserId: session.user.id,
        action: 'document.uploaded',
        entityType: 'document',
        entityId: created.id,
        diff: {
          customerId: data.customerId,
          name: data.name,
          category: data.category,
          sizeBytes: file.size,
        },
      });
      return created.id;
    });
    createdId = result;
  } catch (e) {
    console.error('[uploadDocument] DB error:', e);
    // Rollback del upload S3 si fallo BD
    try {
      await s3.client.send(
        new DeleteObjectCommand({
          Bucket: s3.config.bucket,
          Key: storageKey,
        }),
      );
    } catch {
      /* ignore */
    }
    return { status: 'error', message: 'No se pudo registrar el documento.' };
  }

  revalidatePath('/admin/documentos');
  revalidatePath('/area-cliente/documentos');
  redirect(`/admin/documentos?uploaded=${createdId}`);
}

export async function toggleDocumentVisibilityAction(
  documentId: string,
): Promise<ActionState> {
  const { error: authErr, session } = await requireStaff();
  if (authErr) return { status: 'error', message: authErr };

  const doc = await getAdminDocumentById(documentId);
  if (!doc) return { status: 'error', message: 'Documento no encontrado.' };

  const nextValue = !doc.visibleToClient;
  try {
    await db.transaction(async (tx) => {
      await tx
        .update(documents)
        .set({ visibleToClient: nextValue })
        .where(eq(documents.id, documentId));
      await tx.insert(auditLog).values({
        actorUserId: session.user.id,
        action: 'document.visibility_changed',
        entityType: 'document',
        entityId: documentId,
        diff: {
          name: doc.name,
          visibleToClient: { from: doc.visibleToClient, to: nextValue },
        },
      });
    });
  } catch (e) {
    console.error('[toggleVisibility] error:', e);
    return { status: 'error', message: 'No se pudo actualizar la visibilidad.' };
  }

  revalidatePath('/admin/documentos');
  revalidatePath('/area-cliente/documentos');
  return {
    status: 'success',
    message: nextValue
      ? 'Documento visible para el cliente.'
      : 'Documento oculto para el cliente.',
  };
}

export async function deleteDocumentAction(
  documentId: string,
): Promise<ActionState> {
  const { error: authErr, session } = await requireStaff();
  if (authErr) return { status: 'error', message: authErr };

  const doc = await getAdminDocumentById(documentId);
  if (!doc) return { status: 'error', message: 'Documento no encontrado.' };

  // Borra primero de la BD; si BD falla, no toca S3
  try {
    await db.transaction(async (tx) => {
      await tx.delete(documents).where(eq(documents.id, documentId));
      await tx.insert(auditLog).values({
        actorUserId: session.user.id,
        action: 'document.deleted',
        entityType: 'document',
        entityId: documentId,
        diff: {
          name: doc.name,
          customerId: doc.customerId,
          sizeBytes: doc.sizeBytes,
        },
      });
    });
  } catch (e) {
    console.error('[deleteDocument] DB error:', e);
    return { status: 'error', message: 'No se pudo eliminar el documento.' };
  }

  // Borra de MinIO (best effort; si falla queda huérfano pero la BD ya está limpia)
  const s3 = getS3Client();
  if (s3) {
    try {
      await s3.client.send(
        new DeleteObjectCommand({
          Bucket: s3.config.bucket,
          Key: doc.storageKey,
        }),
      );
    } catch (e) {
      console.warn('[deleteDocument] S3 cleanup failed (object orphan):', e);
    }
  }

  revalidatePath('/admin/documentos');
  revalidatePath('/area-cliente/documentos');
  return { status: 'success', message: 'Documento eliminado.' };
}

