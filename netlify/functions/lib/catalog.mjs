// Catálogo del servidor. Es la ÚNICA fuente de verdad de precios y archivos.
// El navegador nunca decide cuánto se cobra: el precio sale siempre de acá.
//
// key  = ruta exacta del archivo dentro del bucket privado (ver README, paso 3)
// name = nombre con el que se descarga el archivo
// En venta = existe public/img/<id>.jpg (lo decide scripts/build.mjs en cada deploy).
import { READY } from './ready.mjs';

// Descuento por cantidad: se aplica sobre los PÓSTERS del carrito (el pack no entra).
// Con `min` pósters o más, cada póster tiene `pct` % de descuento. Se usa el tramo más alto que se cumpla.
// Para cambiarlo, editá estos números (y nada más): la página y el cobro lo toman de acá.
export const DESCUENTOS = [
  { min: 2, pct: 10 },
  { min: 3, pct: 15 },
  { min: 5, pct: 20 },
];
export const SIN_DESCUENTO = ['fight'];   // productos que no participan del descuento
export const MAX_CARRITO = 12;            // máximo de artículos por compra

export const CATALOG = {
  mint: {
    title: 'Mint Jams', price: 5000,
    files: [{ key: 'posters/mint-jams.jpg', name: 'Mint Jams - Ceja (A3 CMYK 300dpi).jpg' }],
  },
  fallen: {
    title: 'Fallen Angels', price: 5000,
    files: [{ key: 'posters/fallen-angels.jpg', name: 'Fallen Angels - Ceja (A3 CMYK 300dpi).jpg' }],
  },
  odisea: {
    title: 'La Odisea', price: 5000,
    files: [{ key: 'posters/la-odisea.jpg', name: 'La Odisea - Ceja (A3 CMYK 300dpi).jpg' }],
  },
  first: {
    title: 'First Light', price: 5000,
    files: [{ key: 'posters/first-light.jpg', name: 'First Light - Ceja (A3 CMYK 300dpi).jpg' }],
  },
  rodrigo: {
    title: 'Rodrigo Bueno', price: 5000,
    files: [{ key: 'posters/rodrigo-bueno.jpg', name: 'Rodrigo Bueno - Ceja (A3 CMYK 300dpi).jpg' }],
  },
  bocanada: {
    title: 'Bocanada', price: 5000,
    files: [{ key: 'posters/bocanada.jpg', name: 'Bocanada - Ceja (A3 CMYK 300dpi).jpg' }],
  },
  mellon: {
    title: 'Mellon Collie', price: 5000,
    files: [{ key: 'posters/mellon-collie.jpg', name: 'Mellon Collie - Ceja (A3 CMYK 300dpi).jpg' }],
  },
  abbey: {
    title: 'Abbey Road', price: 5000,
    files: [{ key: 'posters/abbey-road.jpg', name: 'Abbey Road - Ceja (A3 CMYK 300dpi).jpg' }],
  },
  fight: {
    title: 'Fight Club Pack', price: 10000,
    // Un solo archivo ZIP con todo el pack adentro.
    files: [{ key: 'packs/fight-club-pack.zip', name: 'Fight Club Pack - Ceja.zip' }],
  },
  // Gratis: price 0. Se entrega sin pago desde /api/gratis.
  indio: {
    title: 'Gracias Indio', price: 0,
    files: [{ key: 'posters/gracias-indio.jpg', name: 'Gracias Indio - Ceja (A3 CMYK 300dpi).jpg' }],
  },
  // ---- Pósters del resto de la tienda: ready:false hasta subir el archivo y la imagen (ver README) ----
  'amor-amarillo': {
    title: "Amor Amarillo", price: 5000,
    files: [{ key: 'posters/amor-amarillo.jpg', name: "Amor Amarillo - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'fuerza-natural': {
    title: "Fuerza Natural", price: 5000,
    files: [{ key: 'posters/fuerza-natural.jpg', name: "Fuerza Natural - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'ahi-vamos': {
    title: "Ahi Vamos", price: 5000,
    files: [{ key: 'posters/ahi-vamos.jpg', name: "Ahi Vamos - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'cancion-animal': {
    title: "Canción Animal", price: 5000,
    files: [{ key: 'posters/cancion-animal.jpg', name: "Canción Animal - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'doble-vida': {
    title: "Doble Vida", price: 5000,
    files: [{ key: 'posters/doble-vida.jpg', name: "Doble Vida - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'clics-modernos': {
    title: "Clics Modernos", price: 5000,
    files: [{ key: 'posters/clics-modernos.jpg', name: "Clics Modernos - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'almendra': {
    title: "Almendra", price: 5000,
    files: [{ key: 'posters/almendra.jpg', name: "Almendra - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'artaud': {
    title: "Artaud", price: 5000,
    files: [{ key: 'posters/artaud.jpg', name: "Artaud - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'grasa-de-las-capitales': {
    title: "Grasa de las Capitales", price: 5000,
    files: [{ key: 'posters/grasa-de-las-capitales.jpg', name: "Grasa de las Capitales - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'all-of-me': {
    title: "All of Me", price: 5000,
    files: [{ key: 'posters/all-of-me.jpg', name: "All of Me - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'locura': {
    title: "Locura", price: 5000,
    files: [{ key: 'posters/locura.jpg', name: "Locura - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'peliculas': {
    title: "Películas", price: 5000,
    files: [{ key: 'posters/peliculas.jpg', name: "Películas - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'enjambre': {
    title: "Enjambre", price: 5000,
    files: [{ key: 'posters/enjambre.jpg', name: "Enjambre - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'piano-bar': {
    title: "Piano Bar", price: 5000,
    files: [{ key: 'posters/piano-bar.jpg', name: "Piano Bar - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'casiopea': {
    title: "Casiopea", price: 5000,
    files: [{ key: 'posters/casiopea.jpg', name: "Casiopea - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'enanitos-verdes': {
    title: "Enanitos Verdes", price: 5000,
    files: [{ key: 'posters/enanitos-verdes.jpg', name: "Enanitos Verdes - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'comfort-y-musica-para-volar': {
    title: "Comfort y Música para Volar", price: 5000,
    files: [{ key: 'posters/comfort-y-musica-para-volar.jpg', name: "Comfort y Música para Volar - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'divididos-por-la-felicidad': {
    title: "Divididos por la Felicidad", price: 5000,
    files: [{ key: 'posters/divididos-por-la-felicidad.jpg', name: "Divididos por la Felicidad - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'jardin-de-los-presentes': {
    title: "Jardín de los Presentes", price: 5000,
    files: [{ key: 'posters/jardin-de-los-presentes.jpg', name: "Jardín de los Presentes - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'hijos-del-culo': {
    title: "Hijos del Culo", price: 5000,
    files: [{ key: 'posters/hijos-del-culo.jpg', name: "Hijos del Culo - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'la-era-de-la-boludez': {
    title: "La Era de la Boludez", price: 5000,
    files: [{ key: 'posters/la-era-de-la-boludez.jpg', name: "La Era de la Boludez - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'el-eternauta': {
    title: "El Eternauta", price: 5000,
    files: [{ key: 'posters/el-eternauta.jpg', name: "El Eternauta - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'caifanes': {
    title: "Caifanes", price: 5000,
    files: [{ key: 'posters/caifanes.jpg', name: "Caifanes - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'el-silencio': {
    title: "El Silencio", price: 5000,
    files: [{ key: 'posters/el-silencio.jpg', name: "El Silencio - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'patricio-rey-y-sus-redonditos-de-ricota': {
    title: "Patricio Rey y Sus Redonditos de Ricota", price: 5000,
    files: [{ key: 'posters/patricio-rey-y-sus-redonditos-de-ricota.jpg', name: "Patricio Rey y Sus Redonditos de Ricota - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'patricio-rey-y-sus-redonditos-de-ricota-4-de-agosto': {
    title: "Patricio Rey y Sus Redonditos de Ricota - 4 de Agosto", price: 5000,
    files: [{ key: 'posters/patricio-rey-y-sus-redonditos-de-ricota-4-de-agosto.jpg', name: "Patricio Rey y Sus Redonditos de Ricota - 4 de Agosto - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'gulp': {
    title: "Gulp", price: 5000,
    files: [{ key: 'posters/gulp.jpg', name: "Gulp - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'oktubre': {
    title: "Oktubre", price: 5000,
    files: [{ key: 'posters/oktubre.jpg', name: "Oktubre - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'oktubre-v2': {
    title: "Oktubre V2", price: 5000,
    files: [{ key: 'posters/oktubre-v2.jpg', name: "Oktubre V2 - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'un-baion-para-el-ojo-idiota': {
    title: "Un Baion para el Ojo Idiota", price: 5000,
    files: [{ key: 'posters/un-baion-para-el-ojo-idiota.jpg', name: "Un Baion para el Ojo Idiota - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'bang-bang-estas-liquidado': {
    title: "Bang Bang Estás Liquidado", price: 5000,
    files: [{ key: 'posters/bang-bang-estas-liquidado.jpg', name: "Bang Bang Estás Liquidado - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'la-mosca-y-la-sopa': {
    title: "La Mosca y la Sopa", price: 5000,
    files: [{ key: 'posters/la-mosca-y-la-sopa.jpg', name: "La Mosca y la Sopa - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'luzbelito': {
    title: "Luzbelito", price: 5000,
    files: [{ key: 'posters/luzbelito.jpg', name: "Luzbelito - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'momo-sampler': {
    title: "Momo Sampler", price: 5000,
    files: [{ key: 'posters/momo-sampler.jpg', name: "Momo Sampler - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'tren-de-fugitivos': {
    title: "Tren de Fugitivos", price: 5000,
    files: [{ key: 'posters/tren-de-fugitivos.jpg', name: "Tren de Fugitivos - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'el-tesoro-de-los-inocentes': {
    title: "El Tesoro de los Inocentes", price: 5000,
    files: [{ key: 'posters/el-tesoro-de-los-inocentes.jpg', name: "El Tesoro de los Inocentes - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'porco-rex': {
    title: "Porco Rex", price: 5000,
    files: [{ key: 'posters/porco-rex.jpg', name: "Porco Rex - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'scenery': {
    title: "Scenery", price: 5000,
    files: [{ key: 'posters/scenery.jpg', name: "Scenery - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'brothers-in-arms': {
    title: "Brothers in Arms", price: 5000,
    files: [{ key: 'posters/brothers-in-arms.jpg', name: "Brothers in Arms - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'facelift': {
    title: "Facelift", price: 5000,
    files: [{ key: 'posters/facelift.jpg', name: "Facelift - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'the-new-sound': {
    title: "The New Sound", price: 5000,
    files: [{ key: 'posters/the-new-sound.jpg', name: "The New Sound - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'in-the-court-of-the-crimson-king-ingles': {
    title: "In the Court of the Crimson King - Inglés", price: 5000,
    files: [{ key: 'posters/in-the-court-of-the-crimson-king-ingles.jpg', name: "In the Court of the Crimson King - Inglés - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'electric-ladyland': {
    title: "Electric Ladyland", price: 5000,
    files: [{ key: 'posters/electric-ladyland.jpg', name: "Electric Ladyland - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'songs-for-the-deaf': {
    title: "Songs for the Deaf", price: 5000,
    files: [{ key: 'posters/songs-for-the-deaf.jpg', name: "Songs for the Deaf - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'in-utero': {
    title: "In Utero", price: 5000,
    files: [{ key: 'posters/in-utero.jpg', name: "In Utero - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'around-the-fur': {
    title: "Around the Fur", price: 5000,
    files: [{ key: 'posters/around-the-fur.jpg', name: "Around the Fur - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'white-pony': {
    title: "White Pony", price: 5000,
    files: [{ key: 'posters/white-pony.jpg', name: "White Pony - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'system-of-a-down': {
    title: "System of a Down", price: 5000,
    files: [{ key: 'posters/system-of-a-down.jpg', name: "System of a Down - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'roots': {
    title: "Roots", price: 5000,
    files: [{ key: 'posters/roots.jpg', name: "Roots - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'rust-in-peace': {
    title: "Rust in Peace", price: 5000,
    files: [{ key: 'posters/rust-in-peace.jpg', name: "Rust in Peace - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'sera': {
    title: "Será", price: 5000,
    files: [{ key: 'posters/sera.jpg', name: "Será - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'al-parecer-todo-ha-sido-una-trampa': {
    title: "Al Parecer Todo ha sido una Trampa", price: 5000,
    files: [{ key: 'posters/al-parecer-todo-ha-sido-una-trampa.jpg', name: "Al Parecer Todo ha sido una Trampa - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'la-sintesis-o-konor': {
    title: "La Síntesis O'Konor", price: 5000,
    files: [{ key: 'posters/la-sintesis-o-konor.jpg', name: "La Síntesis O'Konor - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'fleabag': {
    title: "Fleabag", price: 5000,
    files: [{ key: 'posters/fleabag.jpg', name: "Fleabag - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'whiplash': {
    title: "Whiplash", price: 5000,
    files: [{ key: 'posters/whiplash.jpg', name: "Whiplash - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'serial-experiments-lain': {
    title: "Serial Experiments Lain", price: 5000,
    files: [{ key: 'posters/serial-experiments-lain.jpg', name: "Serial Experiments Lain - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'the-last-of-us': {
    title: "The Last of Us", price: 5000,
    files: [{ key: 'posters/the-last-of-us.jpg', name: "The Last of Us - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'eva-01': {
    title: "EVA-01", price: 5000,
    files: [{ key: 'posters/eva-01.jpg', name: "EVA-01 - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'nueve-reinas': {
    title: "Nueve Reinas", price: 5000,
    files: [{ key: 'posters/nueve-reinas.jpg', name: "Nueve Reinas - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'random-access-memories': {
    title: "Random Access Memories", price: 5000,
    files: [{ key: 'posters/random-access-memories.jpg', name: "Random Access Memories - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'luv-sic-hexalogy': {
    title: "LUV(SIC) Hexalogy", price: 5000,
    files: [{ key: 'posters/luv-sic-hexalogy.jpg', name: "LUV(SIC) Hexalogy - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'mike-mentzer': {
    title: "Mike Mentzer", price: 5000,
    files: [{ key: 'posters/mike-mentzer.jpg', name: "Mike Mentzer - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'seinfeld': {
    title: "Seinfeld", price: 5000,
    files: [{ key: 'posters/seinfeld.jpg', name: "Seinfeld - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'red': {
    title: "Red", price: 5000,
    files: [{ key: 'posters/red.jpg', name: "Red - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'calambre': {
    title: "Calambre", price: 5000,
    files: [{ key: 'posters/calambre.jpg', name: "Calambre - Ceja (A3 CMYK 300dpi).jpg" }],
  },
  'sweetener': {
    title: "Sweetener", price: 5000,
    files: [{ key: 'posters/sweetener.jpg', name: "Sweetener - Ceja (A3 CMYK 300dpi).jpg" }],
  },
};

for (const [id, p] of Object.entries(CATALOG)) p.ready = READY.includes(id);
