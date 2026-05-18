import 'server-only';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '@/lib/env';
import * as schema from './schema';

const ssl =
  env.DATABASE_URL.includes('localhost') || env.DATABASE_URL.includes('127.0.0.1')
    ? false
    : 'require';

// Singleton del cliente postgres en development para evitar conexiones acumuladas
// con el HMR. En production cada instancia mantiene su pool.
declare global {
  var __pgClient__: ReturnType<typeof postgres> | undefined;
}

// Connection pool sizing depende del entorno:
// - dev con HMR: cada recompila puede recrear módulos. Singleton via
//   globalThis evita múltiples clientes, pero providers con pocas
//   conexiones (seenode, supabase/neon free) saturan rápido.
//   max: 1 en dev fuerza serialización dentro de un único socket;
//   postgres-js encola las queries y todo va bien.
// - prod: con BD dedicada en Coolify hay conexiones de sobra.
const isDev = env.NODE_ENV !== 'production';

function createClient() {
  const raw = postgres(env.DATABASE_URL, {
    max: isDev ? 1 : 10,
    idle_timeout: 20,
    max_lifetime: 60 * 30,
    connect_timeout: 30,
    ssl,
    onnotice: () => {
      /* silence */
    },
  });

  // Workaround Node 22 + postgres-js 3.4.x: el binding nativo del path
  // unsafe/prepared falla al serializar Date → timestamptz (OID 1184) con
  // "Received an instance of Date". Drizzle llama a `client.unsafe(query, params)`
  // — interceptamos para convertir Date a ISO string. Postgres parsea el
  // string como timestamptz sin problema.
  const originalUnsafe = raw.unsafe.bind(raw);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (raw as any).unsafe = (query: string, params?: unknown[], options?: unknown) => {
    if (params && Array.isArray(params)) {
      params = params.map((p) => (p instanceof Date ? p.toISOString() : p));
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (originalUnsafe as any)(query, params, options);
  };

  return raw;
}

const client = globalThis.__pgClient__ ?? createClient();

if (env.NODE_ENV !== 'production') {
  globalThis.__pgClient__ = client;
}

export const db = drizzle(client, { schema });
export { schema };
