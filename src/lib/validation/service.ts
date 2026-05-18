import { z } from 'zod';

export const SERVICE_CATEGORY = [
  'web-design',
  'saas',
  'ecommerce',
  'seo',
  'maintenance',
  'branding',
] as const;

export const SERVICE_STATUS = [
  'active',
  'pending',
  'suspended',
  'terminated',
] as const;

export const SLA_TIER = ['none', 'bronze', 'silver', 'gold', 'platinum'] as const;

export const createServiceSchema = z.object({
  customerId: z.string().uuid('Cliente requerido'),
  name: z.string().min(2, 'Nombre demasiado corto').max(200),
  description: z
    .string()
    .max(1000)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  category: z.enum(SERVICE_CATEGORY),
  status: z.enum(SERVICE_STATUS).default('pending'),
  slaTier: z.enum(SLA_TIER).default('none'),
  startedAt: z
    .string()
    .optional()
    .or(z.literal('').transform(() => undefined)),
  endedAt: z
    .string()
    .optional()
    .or(z.literal('').transform(() => undefined)),
  monthlyFeeCents: z
    .union([z.coerce.number().int().nonnegative().max(10_000_000), z.literal('')])
    .transform((v) => (v === '' || v === undefined ? undefined : Number(v)))
    .optional(),
  metadata: z
    .string()
    .max(10_000)
    .optional()
    .or(z.literal('').transform(() => undefined))
    .refine(
      (v) => {
        if (!v) return true;
        try {
          JSON.parse(v);
          return true;
        } catch {
          return false;
        }
      },
      { message: 'Metadata debe ser JSON válido o vacío.' },
    ),
});
export type CreateServiceInput = z.input<typeof createServiceSchema>;

export const updateServiceSchema = createServiceSchema.partial({
  customerId: true,
});

/** Define qué transiciones de status son válidas. */
export const STATUS_TRANSITIONS: Record<
  (typeof SERVICE_STATUS)[number],
  ReadonlyArray<(typeof SERVICE_STATUS)[number]>
> = {
  pending: ['active', 'terminated'],
  active: ['suspended', 'terminated'],
  suspended: ['active', 'terminated'],
  terminated: [],
};

export const STATUS_TRANSITION_LABEL: Record<string, string> = {
  active: 'Activar',
  suspended: 'Suspender',
  terminated: 'Terminar',
};
