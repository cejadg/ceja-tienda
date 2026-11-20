// Cada pedido tiene una referencia aleatoria (ref) y un token firmado con tu clave secreta.
// El link de descarga necesita las dos cosas, así nadie puede inventar ni adivinar links.
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { env } from './env.mjs';

export const newRef = (productId) => `${productId}.${randomBytes(9).toString('hex')}`;

export function signRef(ref) {
  return createHmac('sha256', env('ORDER_SECRET')).update(ref).digest('hex').slice(0, 40);
}

export function checkToken(ref, token) {
  if (typeof ref !== 'string' || typeof token !== 'string') return false;
  const good = Buffer.from(signRef(ref));
  const given = Buffer.from(token);
  return good.length === given.length && timingSafeEqual(good, given);
}

export const productOfRef = (ref) => String(ref).split('.')[0];
