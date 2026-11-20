// GET /api/admin-link?ref=mint.xxxxxxxx&k=TU_ADMIN_KEY
// Solo para vos: si un cliente perdió su link de descarga, buscá el pedido en Mercado Pago,
// copiá su "referencia externa" (ref) y abrí esta dirección. Te devuelve el link para reenviarle.
import { timingSafeEqual } from 'node:crypto';
import { CATALOG } from './lib/catalog.mjs';
import { env } from './lib/env.mjs';
import { json } from './lib/http.mjs';
import { productOfRef, signRef } from './lib/token.mjs';

export default async (req) => {
  const q = new URL(req.url).searchParams;
  const key = env('ADMIN_KEY', { optional: true });
  const given = Buffer.from(q.get('k') || '');
  const good = Buffer.from(key);
  if (!key || good.length !== given.length || !timingSafeEqual(good, given)) return json({ error: 'no autorizado' }, 403);

  const ref = q.get('ref') || '';
  const id = productOfRef(ref);
  if (!/^[a-z0-9]+\.[0-9a-f]{18}$/.test(ref) || !Object.hasOwn(CATALOG, id) || CATALOG[id].price <= 0) return json({ error: 'ref inválida' }, 400);

  const site = (env('SITE_URL', { optional: true }) || new URL(req.url).origin).replace(/\/+$/, '');
  return json({ link: `${site}/gracias.html?ref=${encodeURIComponent(ref)}&t=${signRef(ref)}` });
};

export const config = { path: '/api/admin-link' };
