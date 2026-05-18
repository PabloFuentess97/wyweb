import { test, expect } from '@playwright/test';
import { E2E_NEW_CUSTOMER } from './fixtures';

test.describe('Backoffice · Clientes', () => {
  test('listado renderiza el customer fixture', async ({ page }) => {
    await page.goto('/admin/clientes');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    // El customer fixture (B12345674) debe aparecer en la tabla
    await expect(page.getByText('B12345674')).toBeVisible();
  });

  test('crear nuevo cliente desde /admin/clientes/nuevo', async ({ page }) => {
    await page.goto('/admin/clientes/nuevo');

    await page.getByLabel('CIF / NIF', { exact: false }).fill(E2E_NEW_CUSTOMER.cif);
    await page.getByLabel('Razón social').fill(E2E_NEW_CUSTOMER.legalName);
    await page
      .getByLabel('Email facturación')
      .fill(E2E_NEW_CUSTOMER.emailBilling);
    await page.getByLabel('Teléfono').fill(E2E_NEW_CUSTOMER.phone);
    await page.getByLabel('Dirección', { exact: true }).fill(E2E_NEW_CUSTOMER.addressLine1);
    await page.getByLabel('Código postal').fill(E2E_NEW_CUSTOMER.postalCode);
    await page.getByLabel('Ciudad').fill(E2E_NEW_CUSTOMER.city);
    await page.getByLabel('Provincia').fill(E2E_NEW_CUSTOMER.province);

    await page.getByRole('button', { name: /crear cliente|guardar/i }).click();

    // Tras crear, redirige al detalle o vuelve al listado con el cliente nuevo
    await page.waitForURL(/\/admin\/clientes/, { timeout: 10_000 });
    await expect(page.getByText(E2E_NEW_CUSTOMER.legalName)).toBeVisible();
  });
});
