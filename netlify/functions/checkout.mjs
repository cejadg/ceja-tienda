// POST /api/checkout   { id, price }  ->  { url }   (link de pago de Mercado Pago)
import { randomBytes } from 'node:crypto';
import { armarPedido, refDeCarrito } from './lib/pricing.mjs';
import { env } from './lib/env.mjs';
import { json } from './lib/http.mjs';
import { signRef } from './lib/token.mjs';

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'metodo' }, 405);

  let body;
  try { body = await req.json(); } catch { return json({ error: 'datos' }, 400); }

  // Acepta un carrito { ids, total } o un solo producto { id, price }.
  const ids = Array.isArray(body?.ids) ? body.ids : [body?.id];
  const visto = Number(body?.total ?? body?.price);
  const pedido = armarPedido(ids);
  if (pedido.error) return json({ error: pedido.error }, pedido.error === 'demasiados' ? 400 : 404);

  // Si el total que vio el cliente no coincide con el del servidor, no se cobra: se avisa.
  if (visto !== pedido.total) return json({ error: 'precio_cambio', price: pedido.total }, 409);

  const site = (env('SITE_URL', { optional: true }) || new URL(req.url).origin).replace(/\/+$/, '');
  const ref = refDeCarrito(pedido.items.map((i) => i.id), randomBytes(9).toString('hex'));
  const t = signRef(ref);
  const volver = `${site}/gracias.html?ref=${encodeURIComponent(ref)}&t=${t}`;

  const preferencia = {
    items: pedido.items.map((i) => ({
      id: i.id,
      title: `${i.title} - Ceja`,
      description: pedido.pct && i.unit !== i.price ? `Archivo digital (descuento ${pedido.pct}% por cantidad)` : 'Archivo digital para imprimir (descarga inmediata)',
      quantity: 1,
      currency_id: 'ARS',
      unit_price: i.unit,
    })),
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
