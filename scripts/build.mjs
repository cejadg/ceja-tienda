// Se ejecuta solo en cada deploy de Netlify (ver netlify.toml).
// Regla: un producto está "en venta" si existe public/img/<id>.jpg.
// Genera: public/catalogo.json (lo que lee la página Tienda) y netlify/functions/lib/ready.mjs
// (lo que usa el servidor para aceptar o rechazar compras).
import fs from 'node:fs';
import { CATALOG, DESCUENTOS, SIN_DESCUENTO, MAX_CARRITO } from '../netlify/functions/lib/catalog.mjs';

const DEST = ['mint', 'fallen', 'odisea', 'first', 'rodrigo', 'bocanada', 'mellon', 'abbey']; // orden de los destacados
const ids = Object.keys(CATALOG);
const listos = ids.filter((id) => fs.existsSync(new URL(`../public/img/${id}.jpg`, import.meta.url)));
const orden = [...DEST.filter((i) => listos.includes(i)), ...listos.filter((i) => !DEST.includes(i))];

const data = {};
for (const id of orden) {
  const p = CATALOG[id], pack = id === 'fight';
  data[id] = {
    title: p.title, price: p.price, img: `img/${id}.jpg`, pack, free: p.price === 0,
    kind: pack ? 'Pack digital' : 'Póster digital · A3',
    desc: pack ? 'Pack completo en un solo archivo ZIP. Cada archivo está listo para imprimir.'
               : 'Diseño original de Ceja. Archivo listo para llevar a la imprenta en tamaño A3.',
    specs: pack ? ['ZIP', 'Archivos JPG · CMYK · 300 DPI'] : ['JPG · CMYK', '300 DPI', '3508 × 4961 px'],
  };
}
fs.writeFileSync(new URL('../public/catalogo.json', import.meta.url), JSON.stringify({ productos: data, descuentos: DESCUENTOS, sinDescuento: SIN_DESCUENTO, max: MAX_CARRITO }));
fs.writeFileSync(new URL('../netlify/functions/lib/ready.mjs', import.meta.url),
  `// Generado por scripts/build.mjs en cada deploy. No editar a mano.\nexport const READY = ${JSON.stringify(listos)};\n`);
console.log(`Tienda: ${listos.length} de ${ids.length} productos en venta.`);
