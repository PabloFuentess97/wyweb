/**
 * Datos de prueba E2E — fixtures determinísticas que el global-setup siembra
 * en BD antes de la ejecución, y el global-teardown borra después.
 *
 * Las contraseñas son las que se hashean con argon2id en el seed.
 */

export const E2E_ADMIN = {
  email: 'e2e-admin@uxea.test',
  password: 'e2e-admin-pwd-AAA111',
  name: 'E2E Admin',
} as const;

export const E2E_CUSTOMER = {
  cif: 'B12345674', // CIF válido sintético (algoritmo AEAT)
  legalName: 'Cliente E2E S.L.',
  emailBilling: 'billing+e2e@uxea.test',
  addressLine1: 'Calle Falsa 123',
  postalCode: '18001',
  city: 'Granada',
  province: 'Granada',
  country: 'ES',
} as const;

export const E2E_DRAFT_INVOICE = {
  // El número se asigna al emitir; en draft tiene un placeholder.
  description: 'Línea de prueba E2E',
  quantity: 1,
  unitPriceCents: 10_000, // 100 €
  vatRate: 21,
} as const;

export const E2E_NEW_CUSTOMER = {
  cif: 'B22222228', // distinto al fixture, para crear desde la UI
  legalName: 'Nuevo Cliente E2E S.L.',
  emailBilling: 'nuevo+e2e@uxea.test',
  phone: '+34 600 000 000',
  addressLine1: 'Avenida Test 1',
  postalCode: '18002',
  city: 'Granada',
  province: 'Granada',
} as const;
