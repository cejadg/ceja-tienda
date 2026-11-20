// GET /api/entrega?ref=...&t=...
// Pregunta a Mercado Pago si ese pedido tiene un pago aprobado. Si lo tiene, devuelve
// links de descarga temporales. La respuesta SIEMPRE se calcula con lo que dice Mercado Pago,
// nunca con lo que mande el navegador.
import { armarPedido, idsDeRef } from './lib/pricing.mjs';
import { env } from './lib/env.mjs';
import { json } from './lib/http.mjs';
import { linkDeDescarga } from './lib/storage.mjs';
import { checkToken } from './lib/token.mjs';

const PENDIENTES = new Set(['pending', 'in_process', 'in_mediation', 'authorized']);

export default async (req) => {
  const q = new URL(req.url).searchParams;
  const ref = q.get('ref') || '';
  const t = q.get('t') || '';

  if (!checkToken(ref, t)) return json({ estado: 'invalido' }, 403);
  const ids = idsDeRef(ref);
  const pedido = ids ? armarPedido(ids, { soloListos: false }) : { error: 'ref' };
  if (pedido.error) return json({ estado: 'invalido' }, 403);
  const nombre = pedido.items.map((i) => i.title).join(', ');

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
  const aprobado = pagos.find((p) => p.status === 'approved' && Number(p.transaction_amount) >= pedido.total);
  if (aprobado) {
    const archivos = pedido.items.flatMap((i) => i.files).map((f) => ({ nombre: f.name, url: linkDeDescarga(f) }));
    return json({ estado: 'aprobado', producto: nombre, archivos });
  }
  if (pagos.some((p) => PENDIENTES.has(p.status))) return json({ estado: 'pendiente', producto: nombre });
  if (pagos.length) return json({ estado: 'rechazado', producto: nombre });
  return json({ estado: 'sin_pago', producto: nombre });
};

export const config = { path: '/api/entrega' };
