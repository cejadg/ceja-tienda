// Cálculo del pedido: SIEMPRE se hace en el servidor, con los precios del catálogo.
import { createHash } from 'node:crypto';
import { CATALOG, DESCUENTOS, MAX_CARRITO, SIN_DESCUENTO } from './catalog.mjs';

export const pctPara = (n) => DESCUENTOS.reduce((pct, d) => (n >= d.min && d.pct > pct ? d.pct : pct), 0);

// Códigos cortos (6 hex) para que la referencia de un carrito entre en el límite de Mercado Pago.
const codigo = (id) => createHash('sha1').update(id).digest('hex').slice(0, 6);
let PORCODIGO = null;
function porCodigo() {
  if (!PORCODIGO) {
    PORCODIGO = new Map();
    for (const id of Object.keys(CATALOG)) {
      const c = codigo(id);
      if (PORCODIGO.has(c)) throw new Error('Códigos repetidos en el catálogo: ' + id);
      PORCODIGO.set(c, id);
    }
  }
  return PORCODIGO;
}

export const refDeCarrito = (ids, rnd) => (ids.length === 1 ? `${ids[0]}.${rnd}` : `~${ids.map(codigo).join('')}.${rnd}`);

// Devuelve la lista de ids que representa una referencia (formato viejo "id.xxxx" o de carrito "~codigos.xxxx"), o null.
export function idsDeRef(ref) {
  const [cabeza, resto, ...mas] = String(ref).split('.');
  if (resto === undefined || mas.length) return null;
  if (cabeza.startsWith('~')) {
    const c = cabeza.slice(1);
    if (!c || c.length % 6 || !/^[0-9a-f]+$/.test(c)) return null;
    const ids = [];
    for (let i = 0; i < c.length; i += 6) {
      const id = porCodigo().get(c.slice(i, i + 6));
      if (!id) return null;
      ids.push(id);
    }
    return ids;
  }
  return Object.hasOwn(CATALOG, cabeza) ? [cabeza] : null;
}

// Arma el pedido. `soloListos`: al vender exige que el producto esté en venta; al entregar no (ya se pagó).
export function armarPedido(ids, { soloListos = true } = {}) {
  if (!Array.isArray(ids) || !ids.length) return { error: 'vacio' };
  const unicos = [...new Set(ids)];
  if (unicos.length > MAX_CARRITO) return { error: 'demasiados' };
  for (const id of unicos) {
    const p = typeof id === 'string' && Object.hasOwn(CATALOG, id) ? CATALOG[id] : null;
    if (!p || p.price <= 0 || (soloListos && !p.ready)) return { error: 'producto' };
  }
  const nDesc = unicos.filter((id) => !SIN_DESCUENTO.includes(id)).length;
  const pct = pctPara(nDesc);
  const items = unicos.map((id) => {
    const p = CATALOG[id];
    const aplica = pct > 0 && !SIN_DESCUENTO.includes(id);
    return { id, title: p.title, price: p.price, unit: aplica ? Math.round(p.price * (100 - pct) / 100) : p.price, files: p.files };
  });
  const subtotal = items.reduce((a, i) => a + i.price, 0);
  const total = items.reduce((a, i) => a + i.unit, 0);
  return { items, subtotal, total, pct };
}
