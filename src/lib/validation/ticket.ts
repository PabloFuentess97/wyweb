import { z } from 'zod';

export const PRIORITY_VALUES = ['low', 'normal', 'high', 'critical'] as const;

export const createTicketSchema = z.object({
  subject: z
    .string()
    .min(5, 'El asunto debe tener al menos 5 caracteres')
    .max(200, 'Máximo 200 caracteres'),
  body: z
    .string()
    .min(10, 'Cuéntanos un poco más (mínimo 10 caracteres)')
    .max(10_000, 'Máximo 10.000 caracteres'),
  priority: z.enum(PRIORITY_VALUES).default('normal'),
  serviceId: z
    .string()
    .uuid()
    .optional()
    .or(z.literal('').transform(() => undefined)),
});

export type CreateTicketInput = z.input<typeof createTicketSchema>;

export const addMessageSchema = z.object({
  body: z
    .string()
    .min(2, 'Escribe un mensaje')
    .max(10_000, 'Máximo 10.000 caracteres'),
});

export type AddMessageInput = z.input<typeof addMessageSchema>;
