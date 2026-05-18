import 'server-only';
import {
  GetObjectCommand,
  PutObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getS3Client } from './s3';

const DEFAULT_GET_TTL = 60 * 5; // 5 min — coincide con el blueprint
const DEFAULT_PUT_TTL = 60 * 10; // 10 min para uploads grandes

export class StorageNotConfiguredError extends Error {
  constructor() {
    super('S3 / MinIO no está configurado en este entorno.');
    this.name = 'StorageNotConfiguredError';
  }
}

export class StorageObjectNotFoundError extends Error {
  constructor(key: string) {
    super(`Objeto no encontrado en S3: ${key}`);
    this.name = 'StorageObjectNotFoundError';
  }
}

/**
 * Genera URL firmada GET para descargar un objeto. TTL por defecto 5 min.
 * Si `filename` se provee, fuerza Content-Disposition para que el navegador
 * descargue con ese nombre.
 */
export async function getPresignedGetUrl(
  key: string,
  options: {
    expiresIn?: number;
    filename?: string;
    contentType?: string;
  } = {},
): Promise<string> {
  const s3 = getS3Client();
  if (!s3) throw new StorageNotConfiguredError();

  const command = new GetObjectCommand({
    Bucket: s3.config.bucket,
    Key: key,
    ...(options.filename && {
      ResponseContentDisposition: `attachment; filename="${encodeRfc5987(options.filename)}"`,
    }),
    ...(options.contentType && { ResponseContentType: options.contentType }),
  });
  return getSignedUrl(s3.client, command, {
    expiresIn: options.expiresIn ?? DEFAULT_GET_TTL,
  });
}

/**
 * Genera URL firmada PUT para subir un objeto. TTL por defecto 10 min.
 */
export async function getPresignedPutUrl(
  key: string,
  options: {
    expiresIn?: number;
    contentType: string;
    contentLength?: number;
  },
): Promise<string> {
  const s3 = getS3Client();
  if (!s3) throw new StorageNotConfiguredError();

  const command = new PutObjectCommand({
    Bucket: s3.config.bucket,
    Key: key,
    ContentType: options.contentType,
    ...(options.contentLength && { ContentLength: options.contentLength }),
  });
  return getSignedUrl(s3.client, command, {
    expiresIn: options.expiresIn ?? DEFAULT_PUT_TTL,
  });
}

/**
 * Comprueba si un objeto existe en el bucket.
 */
export async function objectExists(key: string): Promise<boolean> {
  const s3 = getS3Client();
  if (!s3) throw new StorageNotConfiguredError();
  try {
    await s3.client.send(
      new HeadObjectCommand({ Bucket: s3.config.bucket, Key: key }),
    );
    return true;
  } catch (e) {
    if ((e as { name?: string }).name === 'NotFound') return false;
    if ((e as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode === 404) {
      return false;
    }
    throw e;
  }
}

/** RFC 5987 encoding para nombres con caracteres no-ASCII en headers HTTP. */
function encodeRfc5987(str: string): string {
  return encodeURIComponent(str).replace(/['()]/g, escape).replace(/\*/g, '%2A');
}
