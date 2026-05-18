import { z } from 'zod';

/**
 * Validador de CIF/NIF/NIE español. Comprueba formato y dígito de control
 * cuando aplica. Para CIF, valida la letra de control según AEAT.
 *
 * - NIF: 8 dígitos + letra (TRWAGMYFPDXBNJZSQVHLCKE)
 * - NIE: X/Y/Z + 7 dígitos + letra
 * - CIF: A-W (excepto algunas) + 7 dígitos + dígito o letra de control
 */

const NIF_LETTERS = 'TRWAGMYFPDXBNJZSQVHLCKE';
const NIE_PREFIX_VALUES: Record<string, number> = { X: 0, Y: 1, Z: 2 };
const CIF_LETTERS_FOR_CONTROL = 'JABCDEFGHI';
const CIF_VALID_PREFIXES = 'ABCDEFGHJNPQRSUVW';

function validateNif(value: string): boolean {
  const m = value.match(/^(\d{8})([A-Z])$/);
  if (!m) return false;
  const num = Number.parseInt(m[1]!, 10);
  return NIF_LETTERS[num % 23] === m[2];
}

function validateNie(value: string): boolean {
  const m = value.match(/^([XYZ])(\d{7})([A-Z])$/);
  if (!m) return false;
  const prefix = NIE_PREFIX_VALUES[m[1]!] ?? 0;
  const num = Number.parseInt(`${prefix}${m[2]}`, 10);
  return NIF_LETTERS[num % 23] === m[3];
}

function validateCif(value: string): boolean {
  const m = value.match(/^([ABCDEFGHJNPQRSUVW])(\d{7})([0-9A-J])$/);
  if (!m) return false;
  const [, letter, digits, control] = m;
  if (!CIF_VALID_PREFIXES.includes(letter!)) return false;

  let evenSum = 0;
  let oddSum = 0;
  for (let i = 0; i < digits!.length; i++) {
    const d = Number.parseInt(digits!.charAt(i), 10);
    if (i % 2 === 0) {
      // posiciones impares (1,3,5,7) → multiplicar ×2 y sumar dígitos
      const doubled = d * 2;
      oddSum += Math.floor(doubled / 10) + (doubled % 10);
    } else {
      evenSum += d;
    }
  }
  const total = evenSum + oddSum;
  const controlDigit = (10 - (total % 10)) % 10;
  const controlLetter = CIF_LETTERS_FOR_CONTROL[controlDigit];

  // El control puede ser digit o letra según prefix
  if (/[KPQS]/.test(letter!)) return control === controlLetter;
  if (/[ABEH]/.test(letter!)) return control === String(controlDigit);
  // CDFGJNRUVW → cualquiera de las dos formas
  return control === String(controlDigit) || control === controlLetter;
}

export function isValidCifOrNif(raw: string): boolean {
  const value = raw.trim().toUpperCase().replace(/[\s-]/g, '');
  if (!value) return false;
  return validateNif(value) || validateNie(value) || validateCif(value);
}

const cifField = z
  .string()
  .min(1, 'CIF/NIF requerido')
  .max(20)
  .transform((v) => v.trim().toUpperCase().replace(/[\s-]/g, ''))
  .refine((v) => isValidCifOrNif(v), {
    message: 'CIF/NIF no válido. Comprueba el formato y la letra de control.',
  });

const ibanField = z
  .string()
  .max(34)
  .transform((v) => v.trim().toUpperCase().replace(/\s+/g, ''))
  .refine(
    (v) => v.length === 0 || /^ES\d{22}$/.test(v),
    { message: 'IBAN no válido. Esperado formato ES + 22 dígitos.' },
  )
  .optional()
  .or(z.literal('').transform(() => undefined));

export const createCustomerSchema = z.object({
  cif: cifField,
  legalName: z
    .string()
    .min(2, 'Razón social demasiado corta')
    .max(200, 'Demasiado larga'),
  tradeName: z
    .string()
    .max(200)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  emailBilling: z
    .string()
    .email('Email no válido')
    .max(200)
    .transform((v) => v.toLowerCase()),
  phone: z
    .string()
    .max(40)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  addressLine1: z.string().min(2, 'Dirección requerida').max(200),
  addressLine2: z
    .string()
    .max(200)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  postalCode: z
    .string()
    .min(4, 'CP no válido')
    .max(10, 'CP demasiado largo'),
  city: z.string().min(2).max(100),
  province: z.string().min(2).max(100),
  country: z.string().length(2, 'Código país ISO de 2 letras').default('ES'),
  iban: ibanField,
  status: z.enum(['active', 'suspended', 'archived']).default('active'),
  notes: z
    .string()
    .max(5000)
    .optional()
    .or(z.literal('').transform(() => undefined)),
});

export type CreateCustomerInput = z.input<typeof createCustomerSchema>;

export const updateCustomerSchema = createCustomerSchema.partial({
  cif: true,
});
export type UpdateCustomerInput = z.input<typeof updateCustomerSchema>;
