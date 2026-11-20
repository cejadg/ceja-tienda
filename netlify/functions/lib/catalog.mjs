// Catálogo del servidor. Es la ÚNICA fuente de verdad de precios y archivos.
// El navegador nunca decide cuánto se cobra: el precio sale siempre de acá.
//
// key  = ruta exacta del archivo dentro del bucket privado (ver README, paso 3)
// name = nombre con el que se descarga el archivo
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
};
