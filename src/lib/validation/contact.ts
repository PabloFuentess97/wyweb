import { z } from 'zod';

export const contactSchema = z.object({
  name: z
    .string()
    .min(2, 'Nombre demasiado corto')
    .max(100, 'Nombre demasiado largo'),
  email: z.string().email('Email no válido').max(200),
  phone: z
    .string()
    .max(40, 'Teléfono demasiado largo')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  company: z
    .string()
    .max(120, 'Empresa demasiado larga')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  message: z
    .string()
    .min(10, 'Cuéntanos un poco más (mínimo 10 caracteres)')
    .max(2000, 'Demasiado largo, resume en menos de 2000 caracteres'),
  source: z.string().max(60).default('web-contact'),
  /** Honeypot — debe estar vacío. Si llega con valor, el endpoint lo descarta en silencio. */
  website: z.string().max(500).optional().default(''),
  /** Consentimiento RGPD. */
  consent: z
    .union([z.boolean(), z.literal('on')])
    .transform((v) => (v === true || v === 'on'))
    .refine((v) => v === true, {
      message: 'Debes aceptar la política de privacidad',
    }),
});

export type ContactInput = z.input<typeof contactSchema>;
export type ContactData = z.output<typeof contactSchema>;
