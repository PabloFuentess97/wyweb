import { test as setup, expect } from '@playwright/test';
import { E2E_ADMIN } from './fixtures';

const ADMIN_AUTH_FILE = './e2e/.auth/admin.json';

setup('autenticar admin', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel(/email/i).fill(E2E_ADMIN.email);
  await page.getByLabel(/contraseña/i).fill(E2E_ADMIN.password);
  await page.getByRole('button', { name: /iniciar sesión|entrar/i }).click();

  // Tras login exitoso, redirige a /admin (staff) o /area-cliente (client)
  await page.waitForURL(/\/(admin|area-cliente)/, { timeout: 10_000 });

  // Sanity check: hay algún elemento que confirma sesión
  await expect(page).toHaveURL(/\/admin/);

  await page.context().storageState({ path: ADMIN_AUTH_FILE });
});
