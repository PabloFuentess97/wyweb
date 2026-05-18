'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { auditLog, settings } from '@/lib/db/schema';
import {
  EMAIL_TEMPLATE_KEYS,
  type EmailTemplatesMap,
  updateBankingSchema,
  updateCompanySchema,
  updateEmailSchema,
  updateEmailTemplateSchema,
  updateInvoicingSchema,
} from '@/lib/validation/settings';

export type ActionState =
  | { status: 'idle' }
  | { status: 'success'; message?: string }
  | { status: 'error'; message: string; fieldErrors?: Record<string, string> };

const ROW_ID = 1;

async function requireStaffAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'staff_admin') {
    return {
      error: 'Esta acción requiere rol staff_admin.',
      session: null as never,
    };
  }
  return { error: null as never, session };
}

function fieldErrorsFromZod(
  issues: ReadonlyArray<{ path: ReadonlyArray<PropertyKey>; message: string }>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const k = issue.path.map((p) => String(p)).join('.');
    if (k && !out[k]) out[k] = issue.message;
  }
  return out;
}

function diffOf<T extends Record<string, unknown>>(
  prev: T,
  next: Partial<T>,
): Record<string, { from: unknown; to: unknown }> {
  const out: Record<string, { from: unknown; to: unknown }> = {};
  for (const key of Object.keys(next)) {
    const a = prev[key as keyof T];
    const b = (next as Record<string, unknown>)[key];
    if (a !== b) out[key] = { from: a ?? null, to: b ?? null };
  }
  return out;
}

function revalidateAll() {
  revalidatePath('/admin/ajustes');
}

export async function updateCompanySettingsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { error: authErr, session } = await requireStaffAdmin();
  if (authErr) return { status: 'error', message: authErr };

  const parsed = updateCompanySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Revisa los datos de la empresa.',
      fieldErrors: fieldErrorsFromZod(parsed.error.issues),
    };
  }
  const data = parsed.data;

  try {
    await db.transaction(async (tx) => {
      const [prev] = await tx.select().from(settings).where(eq(settings.id, ROW_ID)).limit(1);
      if (!prev) throw new Error('settings row missing');
      await tx
        .update(settings)
        .set({ ...data, updatedAt: new Date(), updatedByUserId: session.user.id })
        .where(eq(settings.id, ROW_ID));
      const diff = diffOf(prev as unknown as Record<string, unknown>, data);
      if (Object.keys(diff).length > 0) {
        await tx.insert(auditLog).values({
          actorUserId: session.user.id,
          action: 'settings.company_updated',
          entityType: 'settings',
          entityId: null,
          diff,
        });
      }
    });
  } catch (e) {
    console.error('[updateCompanySettings] DB error:', e);
    return { status: 'error', message: 'No se pudieron guardar los datos.' };
  }

  revalidateAll();
  return { status: 'success', message: 'Datos de empresa guardados.' };
}

export async function updateBankingSettingsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { error: authErr, session } = await requireStaffAdmin();
  if (authErr) return { status: 'error', message: authErr };

  const parsed = updateBankingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Revisa los datos bancarios.',
      fieldErrors: fieldErrorsFromZod(parsed.error.issues),
    };
  }
  const data = parsed.data;

  try {
    await db.transaction(async (tx) => {
      const [prev] = await tx.select().from(settings).where(eq(settings.id, ROW_ID)).limit(1);
      if (!prev) throw new Error('settings row missing');
      await tx
        .update(settings)
        .set({
          bankIban: data.bankIban ?? null,
          bankSwiftBic: data.bankSwiftBic ?? null,
          bankName: data.bankName ?? null,
          updatedAt: new Date(),
          updatedByUserId: session.user.id,
        })
        .where(eq(settings.id, ROW_ID));
      const diff = diffOf(prev as unknown as Record<string, unknown>, {
        bankIban: data.bankIban ?? null,
        bankSwiftBic: data.bankSwiftBic ?? null,
        bankName: data.bankName ?? null,
      });
      if (Object.keys(diff).length > 0) {
        await tx.insert(auditLog).values({
          actorUserId: session.user.id,
          action: 'settings.banking_updated',
          entityType: 'settings',
          entityId: null,
          // No registramos el IBAN completo en el diff por privacidad
          diff: maskIbanInDiff(diff),
        });
      }
    });
  } catch (e) {
    console.error('[updateBankingSettings] DB error:', e);
    return { status: 'error', message: 'No se pudieron guardar los datos bancarios.' };
  }

  revalidateAll();
  return { status: 'success', message: 'Datos bancarios guardados.' };
}

function maskIbanInDiff(
  diff: Record<string, { from: unknown; to: unknown }>,
): Record<string, { from: unknown; to: unknown }> {
  const masked: typeof diff = { ...diff };
  if (masked.bankIban) {
    masked.bankIban = {
      from: maskIban(masked.bankIban.from as string | null),
      to: maskIban(masked.bankIban.to as string | null),
    };
  }
  return masked;
}

function maskIban(value: string | null): string | null {
  if (!value) return value;
  if (value.length < 8) return '***';
  return `${value.slice(0, 4)}…${value.slice(-4)}`;
}

export async function updateInvoicingSettingsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { error: authErr, session } = await requireStaffAdmin();
  if (authErr) return { status: 'error', message: authErr };

  const parsed = updateInvoicingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Revisa la configuración de facturación.',
      fieldErrors: fieldErrorsFromZod(parsed.error.issues),
    };
  }
  const data = parsed.data;

  try {
    await db.transaction(async (tx) => {
      const [prev] = await tx.select().from(settings).where(eq(settings.id, ROW_ID)).limit(1);
      if (!prev) throw new Error('settings row missing');

      // Defensa: nunca permitir bajar el contador (rompería unicidad de números futuros)
      if (data.invoiceNextNumber < prev.invoiceNextNumber) {
        throw new Error(
          `No puedes bajar el contador de facturas (actual: ${prev.invoiceNextNumber}).`,
        );
      }

      await tx
        .update(settings)
        .set({
          invoicePrefix: data.invoicePrefix,
          invoiceSeries: data.invoiceSeries,
          invoiceNextNumber: data.invoiceNextNumber,
          invoiceNumberPadding: data.invoiceNumberPadding,
          invoiceFooter: data.invoiceFooter ?? null,
          invoiceDefaultVatRate: String(data.invoiceDefaultVatRate),
          invoiceDefaultPaymentTermsDays: data.invoiceDefaultPaymentTermsDays,
          updatedAt: new Date(),
          updatedByUserId: session.user.id,
        })
        .where(eq(settings.id, ROW_ID));

      const diff = diffOf(prev as unknown as Record<string, unknown>, {
        invoicePrefix: data.invoicePrefix,
        invoiceSeries: data.invoiceSeries,
        invoiceNextNumber: data.invoiceNextNumber,
        invoiceNumberPadding: data.invoiceNumberPadding,
        invoiceFooter: data.invoiceFooter ?? null,
        invoiceDefaultVatRate: String(data.invoiceDefaultVatRate),
        invoiceDefaultPaymentTermsDays: data.invoiceDefaultPaymentTermsDays,
      });
      if (Object.keys(diff).length > 0) {
        await tx.insert(auditLog).values({
          actorUserId: session.user.id,
          action: 'settings.invoicing_updated',
          entityType: 'settings',
          entityId: null,
          diff,
        });
      }
    });
  } catch (e) {
    console.error('[updateInvoicingSettings] DB error:', e);
    const msg = e instanceof Error ? e.message : 'No se pudo guardar.';
    return { status: 'error', message: msg };
  }

  revalidateAll();
  return { status: 'success', message: 'Configuración de facturación guardada.' };
}

export async function updateEmailSettingsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { error: authErr, session } = await requireStaffAdmin();
  if (authErr) return { status: 'error', message: authErr };

  const parsed = updateEmailSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Revisa la configuración de email.',
      fieldErrors: fieldErrorsFromZod(parsed.error.issues),
    };
  }
  const data = parsed.data;

  try {
    await db.transaction(async (tx) => {
      const [prev] = await tx.select().from(settings).where(eq(settings.id, ROW_ID)).limit(1);
      if (!prev) throw new Error('settings row missing');
      await tx
        .update(settings)
        .set({
          emailFromName: data.emailFromName,
          emailFromAddress: data.emailFromAddress,
          emailReplyTo: data.emailReplyTo ?? null,
          emailFooterHtml: data.emailFooterHtml ?? null,
          updatedAt: new Date(),
          updatedByUserId: session.user.id,
        })
        .where(eq(settings.id, ROW_ID));
      const diff = diffOf(prev as unknown as Record<string, unknown>, {
        emailFromName: data.emailFromName,
        emailFromAddress: data.emailFromAddress,
        emailReplyTo: data.emailReplyTo ?? null,
        emailFooterHtml: data.emailFooterHtml ?? null,
      });
      if (Object.keys(diff).length > 0) {
        await tx.insert(auditLog).values({
          actorUserId: session.user.id,
          action: 'settings.email_updated',
          entityType: 'settings',
          entityId: null,
          diff,
        });
      }
    });
  } catch (e) {
    console.error('[updateEmailSettings] DB error:', e);
    return { status: 'error', message: 'No se pudo guardar la configuración de email.' };
  }

  revalidateAll();
  return { status: 'success', message: 'Configuración de email guardada.' };
}

export async function updateEmailTemplateAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { error: authErr, session } = await requireStaffAdmin();
  if (authErr) return { status: 'error', message: authErr };

  const parsed = updateEmailTemplateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Revisa la plantilla.',
      fieldErrors: fieldErrorsFromZod(parsed.error.issues),
    };
  }
  const { key, subject, body } = parsed.data;

  try {
    await db.transaction(async (tx) => {
      const [prev] = await tx
        .select({ emailTemplates: settings.emailTemplates })
        .from(settings)
        .where(eq(settings.id, ROW_ID))
        .limit(1);
      if (!prev) throw new Error('settings row missing');

      const current = (prev.emailTemplates ?? {}) as EmailTemplatesMap;
      const isEmpty = subject.trim().length === 0 && body.trim().length === 0;
      const next: EmailTemplatesMap = { ...current };
      if (isEmpty) {
        delete next[key];
      } else {
        next[key] = { subject, body };
      }

      await tx
        .update(settings)
        .set({
          emailTemplates: next,
          updatedAt: new Date(),
          updatedByUserId: session.user.id,
        })
        .where(eq(settings.id, ROW_ID));

      await tx.insert(auditLog).values({
        actorUserId: session.user.id,
        action: isEmpty ? 'settings.template_reset' : 'settings.template_updated',
        entityType: 'settings',
        entityId: null,
        diff: {
          template: key,
          previous: current[key] ?? null,
          next: isEmpty ? null : { subject, body },
        },
      });
    });
  } catch (e) {
    console.error('[updateEmailTemplate] DB error:', e);
    return { status: 'error', message: 'No se pudo guardar la plantilla.' };
  }

  revalidateAll();
  return { status: 'success', message: 'Plantilla guardada.' };
}

export async function resetEmailTemplateAction(
  templateKey: string,
): Promise<ActionState> {
  const { error: authErr, session } = await requireStaffAdmin();
  if (authErr) return { status: 'error', message: authErr };

  if (!(EMAIL_TEMPLATE_KEYS as ReadonlyArray<string>).includes(templateKey)) {
    return { status: 'error', message: 'Plantilla desconocida.' };
  }

  try {
    await db.transaction(async (tx) => {
      const [prev] = await tx
        .select({ emailTemplates: settings.emailTemplates })
        .from(settings)
        .where(eq(settings.id, ROW_ID))
        .limit(1);
      if (!prev) throw new Error('settings row missing');
      const current = (prev.emailTemplates ?? {}) as EmailTemplatesMap;
      if (!(templateKey in current)) return;
      const next: EmailTemplatesMap = { ...current };
      delete next[templateKey as keyof EmailTemplatesMap];
      await tx
        .update(settings)
        .set({
          emailTemplates: next,
          updatedAt: new Date(),
          updatedByUserId: session.user.id,
        })
        .where(eq(settings.id, ROW_ID));
      await tx.insert(auditLog).values({
        actorUserId: session.user.id,
        action: 'settings.template_reset',
        entityType: 'settings',
        entityId: null,
        diff: { template: templateKey, previous: current[templateKey as keyof EmailTemplatesMap] ?? null },
      });
    });
  } catch (e) {
    console.error('[resetEmailTemplate] DB error:', e);
    return { status: 'error', message: 'No se pudo restablecer.' };
  }

  revalidateAll();
  return { status: 'success', message: 'Plantilla restablecida al valor por defecto.' };
}
