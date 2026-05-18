import 'server-only';
import { cookies } from 'next/headers';

/**
 * Lee la cookie `theme` server-side y devuelve el valor a usar como atributo
 * `data-theme` en `<html>` en el primer paint, evitando FOUC.
 *
 * Si no hay cookie (primer visita) devuelve `'light'` como neutral. El cliente,
 * tras hidratar, actualizará a `dark` si el SO lo prefiere.
 */
export async function getInitialTheme(): Promise<'light' | 'dark'> {
  const store = await cookies();
  const value = store.get('theme')?.value;
  if (value === 'dark') return 'dark';
  if (value === 'light') return 'light';
  // 'system' o ausente → light por defecto, el cliente reconcilia
  return 'light';
}
