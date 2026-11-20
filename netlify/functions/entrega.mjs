// GET /api/entrega?ref=...&t=...
// Pregunta a Mercado Pago si ese pedido tiene un pago aprobado. Si lo tiene, devuelve
// links de descarga temporales. La respuesta SIEMPRE se calcula con lo que dice Mercado Pago,
// nunca con lo que mande el navegador.
import { CATALOG } from './lib/catalog.mjs';
import { env } from './lib/env.mjs';
import { json } from './lib/http.mjs';
import { linkDeDescarga } from './lib/storage.mjs';
import { checkToken, productOfRef } from './lib/token.mjs';

const PENDIENTES = new Set(['pending', 'in_process', 'in_mediation', 'authorized']);

export default async (req) => {
  const q = new URL(req.url).searchParams;
  const ref = q.get('ref') || '';
  const t = q.get('t') || '';

  if (!checkToken(ref, t)) return json({ estado: 'invalido' }, 403);
  const id = productOfRef(ref);
  const product = Object.hasOwn(CATALOG, id) ? CATALOG[id] : null;
  if (!product || product.price <= 0) return json({ estado: 'invalido' }, 403);

  const url = new URL('https://api.mercadopago.com/v1/payments/search');
  url.searchParams.set('external_reference', ref);
  url.searchParams.set('sort', 'date_created');
  url.searchParams.set('criteria', 'desc');
  url.searchParams.set('limit', '20');

  const r = await fetch(url, { headers: { authorization: `Bearer ${env('MP_ACCESS_TOKEN')}` } });
  if (!r.ok) {
    console.error('Mercado Pago no respondió la búsqueda', r.status);
    return json({ estado: 'error' }, 502);
  }
  const pagos = (await r.json()).results || [];

  // Pago aprobado y por el monto completo (un pago aprobado pero reembolsado ya no figura "approved").
  const aprobado = pagos.find((p) => p.status === 'approved' && Number(p.transaction_amount) >= product.price);
  if (aprobado) {
    const archivos = product.files.map((f) => ({ nombre: f.name, url: linkDeDescarga(f) }));
    return json({ estado: 'aprobado', producto: product.title, archivos });
  }
  if (pagos.some((p) => PENDIENTES.has(p.status))) return json({ estado: 'pendiente', producto: product.title });
  if (pagos.length) return json({ estado: 'rechazado', producto: product.title });
  return json({ estado: 'sin_pago', producto: product.title });
};

export const config = { path: '/api/entrega' };
