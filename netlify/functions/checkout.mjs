// POST /api/checkout   { id, price }  ->  { url }   (link de pago de Mercado Pago)
import { CATALOG } from './lib/catalog.mjs';
import { env } from './lib/env.mjs';
import { json } from './lib/http.mjs';
import { newRef, signRef } from './lib/token.mjs';

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'metodo' }, 405);

  let body;
  try { body = await req.json(); } catch { return json({ error: 'datos' }, 400); }

  const product = Object.hasOwn(CATALOG, body?.id) ? CATALOG[body.id] : null;
  if (!product || product.price <= 0) return json({ error: 'producto' }, 404);

  // Si el precio que vio el cliente no coincide con el del servidor, no se cobra: se avisa.
  if (Number(body.price) !== product.price) return json({ error: 'precio_cambio', price: product.price }, 409);

  const site = (env('SITE_URL', { optional: true }) || new URL(req.url).origin).replace(/\/+$/, '');
  const ref = newRef(body.id);
  const t = signRef(ref);
  const volver = `${site}/gracias.html?ref=${encodeURIComponent(ref)}&t=${t}`;

  const preferencia = {
    items: [{
      id: body.id,
      title: `${product.title} - Ceja`,
      description: 'Archivo digital para imprimir (descarga inmediata)',
      quantity: 1,
      currency_id: 'ARS',
      unit_price: product.price,
    }],
    back_urls: { success: volver, pending: volver, failure: `${site}/?pago=fallido` },
    auto_return: 'approved',
    external_reference: ref,
    statement_descriptor: 'CEJA',
  };

  const r = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${env('MP_ACCESS_TOKEN')}` },
    body: JSON.stringify(preferencia),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    console.error('Mercado Pago rechazó la preferencia', r.status, JSON.stringify(data));
    return json({ error: 'mercadopago' }, 502);
  }
  const url = env('MP_USE_SANDBOX', { optional: true }) === '1' ? data.sandbox_init_point : data.init_point;
  if (!url) return json({ error: 'mercadopago' }, 502);
  return json({ url });
};

export const config = { path: '/api/checkout' };
