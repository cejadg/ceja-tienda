// Firma de URLs de descarga (AWS Signature V4, método GET), sin dependencias.
// Sirve para Cloudflare R2, Backblaze B2 y cualquier almacenamiento compatible con S3.
import { createHash, createHmac } from 'node:crypto';

const enc = (s) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());
const sha256 = (s) => createHash('sha256').update(s).digest('hex');
const hmac = (key, s) => createHmac('sha256', key).update(s).digest();

/**
 * @param {object} o
 * @param {string} o.origin     Ej: https://<cuenta>.r2.cloudflarestorage.com
 * @param {string} o.path       Ej: /mi-bucket/posters/mint-jams.jpg   (ya con el bucket si es path-style)
 * @param {string} o.accessKey
 * @param {string} o.secretKey
 * @param {string} o.region     'auto' en R2
 * @param {number} o.expires    segundos de vigencia del link
 * @param {Date}   [o.now]
 * @param {object} [o.query]    parámetros extra firmados (ej. response-content-disposition)
 */
export function presignGet({ origin, path, accessKey, secretKey, region, expires, now = new Date(), query = {} }) {
  const url = new URL(origin);
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const day = amzDate.slice(0, 8);
  const scope = `${day}/${region}/s3/aws4_request`;

  const params = {
    ...query,
    'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
    'X-Amz-Credential': `${accessKey}/${scope}`,
    'X-Amz-Date': amzDate,
    'X-Amz-Expires': String(expires),
    'X-Amz-SignedHeaders': 'host',
  };
  const canonicalQuery = Object.keys(params)
    .map((k) => [enc(k), enc(params[k])])
    .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');

  const canonicalPath = path.split('/').map(enc).join('/');
  const canonicalRequest = ['GET', canonicalPath, canonicalQuery, `host:${url.host}\n`, 'host', 'UNSIGNED-PAYLOAD'].join('\n');
  const stringToSign = ['AWS4-HMAC-SHA256', amzDate, scope, sha256(canonicalRequest)].join('\n');

  const kDate = hmac('AWS4' + secretKey, day);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, 's3');
  const kSigning = hmac(kService, 'aws4_request');
  const signature = createHmac('sha256', kSigning).update(stringToSign).digest('hex');

  return `${url.protocol}//${url.host}${canonicalPath}?${canonicalQuery}&X-Amz-Signature=${signature}`;
}
