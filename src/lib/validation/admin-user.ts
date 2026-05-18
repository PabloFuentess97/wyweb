import { z } from 'zod';

export const ROLE_VALUES = [
  'staff_admin',
  'staff_agent',
  'client_admin',
  'client_user',
] as const;
export type Role = (typeof ROLE_VALUES)[number];

const STAFF_ROLES = ['staff_admin', 'staff_agent'] as const;
const CLIENT_ROLES = ['client_admin', 'client_user'] as const;

export const createStaffSchema = z.object({
  name: z.string().min(2, 'Nombre demasiado corto').max(100),
  email: z
    .string()
    .email('Email no válido')
    .max(200)
    .transform((v) => v.toLowerCase().trim()),
  role: z.enum(STAFF_ROLES),
});
export type CreateStaffInput = z.input<typeof createStaffSchema>;

export const createClientSchema = z.object({
  name: z.string().min(2, 'Nombre demasiado corto').max(100),
  email: z
    .string()
    .email('Email no válido')
    .max(200)
    .transform((v) => v.toLowerCase().trim()),
  role: z.enum(CLIENT_ROLES),
  customerId: z.string().uuid('Cliente requerido'),
  customerRole: z.enum(['admin', 'viewer']).default('viewer'),
});
export type CreateClientInput = z.input<typeof createClientSchema>;

export const changeRoleSchema = z.object({
  role: z.enum(ROLE_VALUES),
});
