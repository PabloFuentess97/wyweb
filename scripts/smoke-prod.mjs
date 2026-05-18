#!/usr/bin/env node
/**
 * Smoke test post-deploy.
 * Comprueba que las URLs críticas de producción responden con el status
 * esperado y que ciertos headers de seguridad están presentes.
 *
 * Uso:
 *   node scripts/smoke-prod.mjs                          (asume https://uxea.net)
 *   BASE_URL=https://staging.uxea.net node scripts/smoke-prod.mjs
 *
 * Sale con código != 0 si algún check falla — apto para usar en CI/CD post-deploy.
 */

const BASE_URL = (process.env.BASE_URL ?? 'https://uxea.net').replace(/\/+$/, '');

const REQUIRED_HEADERS = [
  'strict-transport-security',
  'x-frame-options',
  'x-content-type-options',
  'content-security-policy',
];

const CHECKS = [
  { path: '/', expectStatus: 200, requireHeaders: true, label: 'Home' },
  { path: '/servicios', expectStatus: 200, label: 'Servicios index' },
  { path: '/servicios/conectividad', expectStatus: 200, label: 'Conectividad' },
  { path: '/blog', expectStatus: 200, label: 'Blog index' },
  { path: '/contacto', expectStatus: 200, label: 'Contacto' },
  { path: '/legal/privacidad', expectStatus: 200, label: 'Privacidad' },
  { path: '/legal/aviso-legal', expectStatus: 200, label: 'Aviso legal' },
  { path: '/legal/cookies', expectStatus: 200, label: 'Cookies' },
  { path: '/login', expectStatus: 200, label: 'Login' },
  { path: '/admin', expectStatus: [302, 307], label: '/admin redirige sin sesión' },
  { path: '/area-cliente', expectStatus: [302, 307], label: '/area-cliente redirige' },
  { path: '/robots.txt', expectStatus: 200, label: 'robots.txt' },
  { path: '/sitemap.xml', expectStatus: 200, label: 'sitemap.xml' },
  { path: '/favicon.svg', expectStatus: 200, label: 'favicon' },
  { path: '/api/contacto', expectStatus: 405, label: 'GET /api/contacto → 405' },
];

const HTTPS_REDIRECT = {
  url: BASE_URL.replace(/^https:\/\//, 'http://'),
  expectStatus: [301, 308],
  label: 'HTTP → HTTPS redirect',
};

let failures = 0;

async function check({ path, expectStatus, requireHeaders, label }) {
  const url = `${BASE_URL}${path}`;
  try {
    const res = await fetch(url, { redirect: 'manual' });
    const expected = Array.isArray(expectStatus) ? expectStatus : [expectStatus];
    const ok = expected.includes(res.status);

    let detail = `${ok ? '✓' : '✗'} ${label.padEnd(38)} ${res.status} ${path}`;
    if (!ok) {
      detail += ` (esperaba ${expected.join('/')})`;
      failures += 1;
    }

    if (requireHeaders) {
      const missing = REQUIRED_HEADERS.filter((h) => !res.headers.get(h));
      if (missing.length > 0) {
        detail += `\n  ⚠ Faltan headers: ${missing.join(', ')}`;
        failures += 1;
      }
    }

    console.log(detail);
  } catch (err) {
    console.log(`✗ ${label.padEnd(38)} ERROR ${path} → ${err.message}`);
    failures += 1;
  }
}

async function checkHttpsRedirect() {
  try {
    const res = await fetch(HTTPS_REDIRECT.url, { redirect: 'manual' });
    const ok = HTTPS_REDIRECT.expectStatus.includes(res.status);
    const location = res.headers.get('location') ?? '';
    const startsWithHttps = location.startsWith('https://');
    if (ok && startsWithHttps) {
      console.log(`✓ ${HTTPS_REDIRECT.label.padEnd(38)} ${res.status} → ${location}`);
    } else {
      console.log(
        `✗ ${HTTPS_REDIRECT.label.padEnd(38)} status=${res.status} location=${location}`,
      );
      failures += 1;
    }
  } catch {
    // En localhost no hay HTTP — no penaliza.
    console.log(`◌ ${HTTPS_REDIRECT.label.padEnd(38)} (saltado: HTTP no accesible)`);
  }
}

console.log(`▸ Smoke test contra ${BASE_URL}\n`);

await checkHttpsRedirect();
for (const c of CHECKS) await check(c);

console.log('');
if (failures === 0) {
  console.log(`✓ Todos los checks OK (${CHECKS.length + 1})`);
  process.exit(0);
}
console.log(`✗ ${failures} fallo(s)`);
process.exit(1);
