import { z } from 'zod';
import { isValidCifOrNif } from './customer';

const optionalString = (max: number) =>
  z
    .string()
    .max(max)
    .optional()
    .or(z.literal('').transform(() => undefined));

const ibanField = z
  .string()
  .max(34)
  .transform((v) => v.trim().toUpperCase().replace(/\s+/g, ''))
  .refine((v) => v.length === 0 || /^ES\d{22}$/.test(v), {
    message: 'IBAN no válido. Esperado formato ES + 22 dígitos.',
  })
  .optional()
  .or(z.literal('').transform(() => undefined));

const swiftField = z
  .string()
  .max(11)
  .transform((v) => v.trim().toUpperCase())
  .refine((v) => v.length === 0 || /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(v), {
    message: 'SWIFT/BIC no válido (8 u 11 caracteres).',
  })
  .optional()
  .or(z.literal('').transform(() => undefined));

export const updateCompanySchema = z.object({
  companyLegalName: z.string().min(2, 'Razón social requerida').max(200),
  companyTradeName: optionalString(200),
  companyCif: z
    .string()
    .min(8)
    .max(20)
    .transform((v) => v.trim().toUpperCase().replace(/[\s-]/g, ''))
    .refine((v) => isValidCifOrNif(v), { message: 'CIF/NIF no válido.' }),
  companyEmail: z
    .string()
    .email('Email no válido')
    .max(200)
    .transform((v) => v.toLowerCase()),
  companyPhone: optionalString(40),
  companyWebsite: z
    .string()
    .max(200)
    .url('URL no válida (incluye http:// o https://)')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  companyLogoUrl: z
    .string()
    .max(500)
    .url('URL del logo no válida')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  companyAddressLine1: z.string().min(2, 'Dirección requerida').max(200),
  companyAddressLine2: optionalString(200),
  companyPostalCode: z.string().min(4, 'CP no válido').max(10),
  companyCity: z.string().min(2).max(100),
  companyProvince: z.string().min(2).max(100),
  companyCountry: z.string().length(2, 'Código país ISO 2 letras').default('ES'),
});
export type UpdateCompanyInput = z.input<typeof updateCompanySchema>;

export const updateBankingSchema = z.object({
  bankIban: ibanField,
  bankSwiftBic: swiftField,
  bankName: optionalString(200),
});
export type UpdateBankingInput = z.input<typeof updateBankingSchema>;

export const updateInvoicingSchema = z.object({
  invoicePrefix: z
    .string()
    .min(1, 'Prefijo requerido')
    .max(10, 'Máx. 10 caracteres')
    .regex(/^[A-Z0-9-]+$/, 'Solo mayúsculas, dígitos o guion'),
  invoiceSeries: z
    .string()
    .min(1)
    .max(4)
    .regex(/^[A-Z0-9]+$/, 'Solo mayúsculas o dígitos'),
  invoiceNextNumber: z.coerce.number().int().min(1, 'Mínimo 1').max(9_999_999),
  invoiceNumberPadding: z.coerce.number().int().min(1).max(8),
  invoiceFooter: optionalString(2000),
  invoiceDefaultVatRate: z.coerce
    .number()
    .min(0, 'Mínimo 0%')
    .max(100, 'Máximo 100%'),
  invoiceDefaultPaymentTermsDays: z.coerce.number().int().min(0).max(365),
});
export type UpdateInvoicingInput = z.input<typeof updateInvoicingSchema>;

export const updateEmailSchema = z.object({
  emailFromName: z.string().min(2).max(100),
  emailFromAddress: z
    .string()
    .email('Email no válido')
    .max(200)
    .transform((v) => v.toLowerCase()),
  emailReplyTo: z
    .string()
    .max(200)
    .email('Email no válido')
    .optional()
    .or(z.literal('').transform(() => undefined))
    .transform((v) => (v ? v.toLowerCase() : v)),
  emailFooterHtml: optionalString(5000),
});
export type UpdateEmailInput = z.input<typeof updateEmailSchema>;

// Plantillas: claves cerradas y predefinidas
export const EMAIL_TEMPLATE_KEYS = [
  'invoice_issued',
  'invoice_overdue',
  'ticket_created',
  'ticket_resolved',
  'lead_received',
  'welcome_client',
] as const;

export type EmailTemplateKey = (typeof EMAIL_TEMPLATE_KEYS)[number];

export const EMAIL_TEMPLATE_LABELS: Record<EmailTemplateKey, string> = {
  invoice_issued: 'Factura emitida',
  invoice_overdue: 'Factura vencida',
  ticket_created: 'Ticket creado',
  ticket_resolved: 'Ticket resuelto',
  lead_received: 'Lead recibido (notificación interna)',
  welcome_client: 'Bienvenida cliente',
};

export const EMAIL_TEMPLATE_VARIABLES: Record<EmailTemplateKey, ReadonlyArray<string>> = {
  invoice_issued: ['{{customerName}}', '{{invoiceNumber}}', '{{totalAmount}}', '{{dueDate}}'],
  invoice_overdue: ['{{customerName}}', '{{invoiceNumber}}', '{{daysLate}}', '{{totalAmount}}'],
  ticket_created: ['{{customerName}}', '{{ticketCode}}', '{{ticketSubject}}', '{{ticketUrl}}'],
  ticket_resolved: ['{{customerName}}', '{{ticketCode}}', '{{resolutionNotes}}'],
  lead_received: ['{{leadName}}', '{{leadEmail}}', '{{leadCompany}}', '{{leadMessage}}'],
  welcome_client: ['{{customerName}}', '{{userName}}', '{{loginUrl}}'],
};

const templateEntrySchema = z.object({
  subject: z.string().max(200).optional().or(z.literal('')),
  body: z.string().max(20_000).optional().or(z.literal('')),
});

export const updateEmailTemplateSchema = z.object({
  key: z.enum(EMAIL_TEMPLATE_KEYS),
  subject: z.string().max(200),
  body: z.string().max(20_000),
});
export type UpdateEmailTemplateInput = z.input<typeof updateEmailTemplateSchema>;

export const emailTemplatesShape = z.record(
  z.enum(EMAIL_TEMPLATE_KEYS),
  templateEntrySchema,
);
export type EmailTemplatesMap = Partial<
  Record<EmailTemplateKey, { subject?: string; body?: string }>
>;
