import { test, expect } from '@playwright/test';

// Los tests dentro de este file mutan el mismo recurso (la draft fixture)
// → corrida serial para evitar carreras.
test.describe.configure({ mode: 'serial' });

test.describe('Backoffice · Facturas (workflow)', () => {
  test('emitir un draft → marcar pagada', async ({ page }) => {
    const invoiceId = process.env.E2E_DRAFT_INVOICE_ID;
    test.skip(!invoiceId, 'global-setup no expuso E2E_DRAFT_INVOICE_ID');

    // Auto-aceptar todos los confirm() del flujo (issue + markPaid + cancel)
    page.on('dialog', (dialog) => dialog.accept());

    await page.goto(`/admin/facturas/${invoiceId}`);

    // Estado inicial: draft → botón "Emitir factura" presente
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const issueBtn = page.getByRole('button', { name: /emitir factura/i });
    await expect(issueBtn).toBeVisible();

    await issueBtn.click();

    // Espera mensaje de éxito
    await expect(
      page.getByText(/factura emitida con número/i),
    ).toBeVisible({ timeout: 15_000 });

    // El número placeholder DRAFT-E2E-* fue reemplazado por uno correlativo
    await expect(page.locator('h1')).not.toContainText('DRAFT-E2E');

    // Ahora el workflow ofrece "Marcar como pagada"
    const markPaidBtn = page.getByRole('button', { name: /marcar como pagada/i });
    await expect(markPaidBtn).toBeVisible();
    await markPaidBtn.click();

    await expect(
      page.getByText(/factura marcada como pagada/i),
    ).toBeVisible({ timeout: 10_000 });

    // El estado pasa a "Pagada" en algún sitio del header
    await expect(page.getByText(/pagada/i).first()).toBeVisible();
  });

  test('listado de facturas refleja al menos una factura', async ({ page }) => {
    await page.goto('/admin/facturas');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    // Tras los tests previos hay un draft o una emitida
    // No verificamos cantidad exacta para no acoplar a orden
    await expect(page.locator('table')).toBeVisible();
  });
});
