import { test, expect } from '@playwright/test';
import { E2E_ADMIN } from './fixtures';

test.describe('Autenticación', () => {
  test('admin autenticado puede acceder a /admin', async ({ page }) => {
    // El project chromium ya viene con storageState — debería estar logueado
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin/);
    // No nos redirige a /login
    await expect(page).not.toHaveURL(/\/login/);
  });

  test.describe('sin sesión', () => {
    // Sobreescribe storageState para esta describe → simulamos anónimo
    test.use({ storageState: { cookies: [], origins: [] } });

    test('/admin redirige a /login', async ({ page }) => {
      await page.goto('/admin');
      await expect(page).toHaveURL(/\/login/);
    });

    test('credenciales inválidas → mensaje de error', async ({ page }) => {
      await page.goto('/login');
      await page.getByLabel(/email/i).fill(E2E_ADMIN.email);
      await page.getByLabel(/contraseña/i).fill('wrong-password');
      await page.getByRole('button', { name: /iniciar sesión|entrar/i }).click();

      // No debe redirigir; debe haber un error visible
      await expect(page).toHaveURL(/\/login/);
      await expect(
        page.getByText(/credenciales|incorrect|inválid/i),
      ).toBeVisible({ timeout: 8_000 });
    });
  });
});
