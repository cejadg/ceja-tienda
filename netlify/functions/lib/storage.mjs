import { env } from './env.mjs';
import { presignGet } from './sigv4.mjs';

// Link de descarga temporal (1 hora) a un archivo privado del bucket.
export function linkDeDescarga(file, { now = new Date(), expires = 3600 } = {}) {
  const endpoint = env('S3_ENDPOINT').replace(/\/+$/, '');   // https://<cuenta>.r2.cloudflarestorage.com
  const bucket = env('S3_BUCKET');
  return presignGet({
    origin: endpoint,
    path: `/${bucket}/${file.key}`,
    accessKey: env('S3_ACCESS_KEY_ID'),
    secretKey: env('S3_SECRET_ACCESS_KEY'),
    region: env('S3_REGION', { optional: true }) || 'auto',
    expires,
    now,
    query: { 'response-content-disposition': `attachment; filename*=UTF-8''${encodeURIComponent(file.name)}` },
  });
}
