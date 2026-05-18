import { test, expect } from '@playwright/test';

// Esta suite no requiere auth — limpiamos el storageState para evitar
// que el header del area-cliente se cuele.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Marketing público', () => {
  test('home renderiza, h1 visible, navegación operativa', async ({ page }) => {
    await page.goto('/');

    // h1 con la prop de valor o brand
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Status 200 implícito + meta tags
    await expect(page).toHaveTitle(/Uxea/i);

    // Navegación principal — al menos un link a /servicios
    const serviciosLink = page.getByRole('link', { name: /servicios/i }).first();
    await expect(serviciosLink).toBeVisible();
  });

  test('blog index lista posts publicados', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    // Debe haber al menos un artículo (los seeds del repo traen 3)
    await expect(page.getByRole('article').first()).toBeVisible();
  });

  test('legal/privacidad accesible', async ({ page }) => {
    const response = await page.goto('/legal/privacidad');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
