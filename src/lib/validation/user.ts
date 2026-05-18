import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Nombre demasiado corto').max(100, 'Demasiado largo'),
  themePreference: z.enum(['light', 'dark', 'system']).default('system'),
  densityPreference: z.enum(['comfortable', 'compact']).default('comfortable'),
  language: z.enum(['es-ES']).default('es-ES'),
});
export type UpdateProfileInput = z.input<typeof updateProfileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Introduce tu contraseña actual'),
    newPassword: z
      .string()
      .min(12, 'Mínimo 12 caracteres')
      .max(128, 'Máximo 128 caracteres'),
    confirm: z.string(),
  })
  .refine((d) => d.newPassword === d.confirm, {
    message: 'Las contraseñas no coinciden',
    path: ['confirm'],
  })
  .refine((d) => d.newPassword !== d.currentPassword, {
    message: 'La nueva contraseña debe ser diferente de la actual',
    path: ['newPassword'],
  });
export type ChangePasswordInput = z.input<typeof changePasswordSchema>;
