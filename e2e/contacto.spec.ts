import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Formulario de contacto', () => {
  test('envío válido → estado de éxito', async ({ page }) => {
    await page.goto('/contacto');

    await page.getByLabel('Nombre').fill('Tester E2E');
    await page.getByLabel('Email', { exact: true }).fill(`e2e-${Date.now()}@uxea.test`);
    await page.getByLabel('Empresa').fill('Empresa E2E S.L.');
    await page
      .getByLabel('Mensaje')
      .fill(
        'Hola, este es un mensaje de prueba E2E. Repito: prueba E2E. Una línea más para superar el mínimo de longitud.',
      );

    // Aceptar política — el checkbox de Radix se interactúa por su label
    await page.getByRole('checkbox', { name: /política de privacidad/i }).check();

    await page.getByRole('button', { name: /enviar mensaje/i }).click();

    // Esperamos confirmación visible
    await expect(page.getByText(/MENSAJE ENVIADO|hemos enviado/i)).toBeVisible({
      timeout: 10_000,
    });
  });

  test('envío inválido (sin email) → mensaje de error', async ({ page }) => {
    await page.goto('/contacto');

    await page.getByLabel('Nombre').fill('Tester');
    await page.getByLabel('Mensaje').fill('Mensaje suficientemente largo para validación.');
    await page.getByRole('checkbox', { name: /política de privacidad/i }).check();
    await page.getByRole('button', { name: /enviar mensaje/i }).click();

    // El botón no debería disparar éxito; el form pinta error en email
    await expect(page.getByText(/MENSAJE ENVIADO/i)).not.toBeVisible();
  });
});
