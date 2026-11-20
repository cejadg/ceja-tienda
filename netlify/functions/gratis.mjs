// POST /api/gratis  { id }  ->  { url }   (solo para productos con precio 0)
import { CATALOG } from './lib/catalog.mjs';
import { json } from './lib/http.mjs';
import { linkDeDescarga } from './lib/storage.mjs';

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'metodo' }, 405);
  let body;
  try { body = await req.json(); } catch { return json({ error: 'datos' }, 400); }
  const product = Object.hasOwn(CATALOG, body?.id) ? CATALOG[body.id] : null;
  if (!product || !product.ready || product.price !== 0) return json({ error: 'producto' }, 404);
  return json({ url: linkDeDescarga(product.files[0]) });
};

export const config = { path: '/api/gratis' };
