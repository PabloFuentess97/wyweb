import 'server-only';
import { S3Client } from '@aws-sdk/client-s3';
import { env } from '@/lib/env';

export type S3Config = {
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicUrl: string;
  forcePathStyle: boolean;
};

/**
 * Lee la config S3 desde env. Devuelve `null` si no está completa — útil
 * para entornos dev que aún no tienen MinIO configurado.
 */
export function getS3Config(): S3Config | null {
  const {
    S3_ENDPOINT,
    S3_REGION,
    S3_ACCESS_KEY_ID,
    S3_SECRET_ACCESS_KEY,
    S3_BUCKET,
    S3_PUBLIC_URL,
  } = env;
  if (
    !S3_ENDPOINT ||
    !S3_REGION ||
    !S3_ACCESS_KEY_ID ||
    !S3_SECRET_ACCESS_KEY ||
    !S3_BUCKET ||
    !S3_PUBLIC_URL
  ) {
    return null;
  }
  return {
    endpoint: S3_ENDPOINT,
    region: S3_REGION,
    accessKeyId: S3_ACCESS_KEY_ID,
    secretAccessKey: S3_SECRET_ACCESS_KEY,
    bucket: S3_BUCKET,
    publicUrl: S3_PUBLIC_URL,
    forcePathStyle: true, // MinIO requiere path-style
  };
}

let cachedClient: { client: S3Client; config: S3Config } | null = null;

/**
 * Devuelve un par {client, config} con el cliente S3 ya inicializado, o `null`
 * si la config no está disponible. Cachea la instancia.
 */
export function getS3Client(): { client: S3Client; config: S3Config } | null {
  if (cachedClient) return cachedClient;
  const config = getS3Config();
  if (!config) return null;

  const client = new S3Client({
    endpoint: config.endpoint,
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    forcePathStyle: config.forcePathStyle,
  });
  cachedClient = { client, config };
  return cachedClient;
}
