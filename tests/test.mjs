import test from 'node:test';
import assert from 'node:assert/strict';

process.env.ORDER_SECRET = 'secreto-de-prueba-0123456789';
process.env.MP_ACCESS_TOKEN = 'TEST-token';
process.env.SITE_URL = 'https://ceja.example';
process.env.S3_ENDPOINT = 'https://cuenta123.r2.cloudflarestorage.com';
process.env.S3_BUCKET = 'ceja-archivos';
process.env.S3_ACCESS_KEY_ID = 'AKIAEXAMPLE';
process.env.S3_SECRET_ACCESS_KEY = 'secretoSecreto/ejemplo';

const { presignGet } = await import('../netlify/functions/lib/sigv4.mjs');
const checkout = (await import('../netlify/functions/checkout.mjs')).default;
const entrega = (await import('../netlify/functions/entrega.mjs')).default;
const gratis = (await import('../netlify/functions/gratis.mjs')).default;
const adminLink = (await import('../netlify/functions/admin-link.mjs')).default;
process.env.ADMIN_KEY = 'clave-admin-de-prueba';
const { signRef } = await import('../netlify/functions/lib/token.mjs');

test('firma SigV4 reproduce el ejemplo oficial de la documentación de AWS', () => {
  const url = presignGet({
    origin: 'https://examplebucket.s3.amazonaws.com', path: '/test.txt',
    accessKey: 'AKIAIOSFODNN7EXAMPLE', secretKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
    region: 'us-east-1', expires: 86400, now: new Date('2013-05-24T00:00:00Z'),
  });
  assert.ok(url.endsWith('X-Amz-Signature=aeeed9bbccd4d02ee5c0109b86d86835f995330da4c265957d157751f604d404'), url);
});

let llamadas;
function mockFetch(handler) {
  llamadas = [];
  globalThis.fetch = async (u, opts = {}) => {
    llamadas.push({ url: String(u), opts });
    return handler(String(u), opts);
  };
}
const resp = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });
const post = (path, body) => new Request('https://ceja.example' + path, { method: 'POST', body: JSON.stringify(body) });

test('checkout: producto inexistente, gratis y precio distinto no crean ningún cobro', async () => {
  mockFetch(() => { throw new Error('no debería llamar a Mercado Pago'); });
  assert.equal((await checkout(post('/api/checkout', { id: 'nada', price: 5000 }))).status, 404);
  assert.equal((await checkout(post('/api/checkout', { id: 'indio', price: 0 }))).status, 404);
  assert.equal((await checkout(post('/api/checkout', { id: '__proto__', price: 1 }))).status, 404);
  const r = await checkout(post('/api/checkout', { id: 'mint', price: 2000 }));
  assert.equal(r.status, 409);
  assert.equal((await r.json()).price, 5000);
  assert.equal(llamadas.length, 0);
  assert.equal((await checkout(new Request('https://ceja.example/api/checkout'))).status, 405);
});

test('checkout: crea la preferencia con el precio del servidor y devuelve el link de pago', async () => {
  mockFetch(() => resp({ id: 'pref1', init_point: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=pref1', sandbox_init_point: 'https://sandbox.example' }, 201));
  const r = await checkout(post('/api/checkout', { id: 'fight', price: 10000 }));
  assert.equal(r.status, 200);
  assert.equal((await r.json()).url, 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=pref1');
  const c = llamadas[0];
  assert.equal(c.url, 'https://api.mercadopago.com/checkout/preferences');
  assert.equal(c.opts.headers.authorization, 'Bearer TEST-token');
  const p = JSON.parse(c.opts.body);
  assert.equal(p.items[0].unit_price, 10000);
  assert.equal(p.items[0].currency_id, 'ARS');
  assert.equal(p.items[0].quantity, 1);
  assert.equal(p.auto_return, 'approved');
  assert.match(p.external_reference, /^fight\.[0-9a-f]{18}$/);
  const ok = new URL(p.back_urls.success);
  assert.equal(ok.origin + ok.pathname, 'https://ceja.example/gracias.html');
  assert.equal(ok.searchParams.get('ref'), p.external_reference);
  assert.equal(ok.searchParams.get('t'), signRef(p.external_reference));
  assert.equal(p.back_urls.failure, 'https://ceja.example/?pago=fallido');
});

test('checkout: si Mercado Pago falla, devuelve error y no un link', async () => {
  mockFetch(() => resp({ message: 'invalid' }, 400));
  const r = await checkout(post('/api/checkout', { id: 'mint', price: 5000 }));
  assert.equal(r.status, 502);
});

const ref = 'mint.0123456789abcdef01';
const urlEntrega = (r, t) => new Request(`https://ceja.example/api/entrega?ref=${encodeURIComponent(r)}&t=${t}`);

test('entrega: pago aprobado devuelve links firmados y temporales', async () => {
  mockFetch(() => resp({ results: [{ status: 'approved', transaction_amount: 5000 }] }));
  const r = await entrega(urlEntrega(ref, signRef(ref)));
  const d = await r.json();
  assert.equal(r.status, 200);
  assert.equal(d.estado, 'aprobado');
  assert.equal(d.archivos.length, 1);
  const u = new URL(d.archivos[0].url);
  assert.equal(u.host, 'cuenta123.r2.cloudflarestorage.com');
  assert.equal(u.pathname, '/ceja-archivos/posters/mint-jams.jpg');
  assert.equal(u.searchParams.get('X-Amz-Expires'), '3600');
  assert.ok(u.searchParams.get('X-Amz-Signature'));
  assert.ok(!d.archivos[0].url.includes('secretoSecreto'));
  assert.ok(llamadas[0].url.includes('external_reference=' + encodeURIComponent(ref)));
});

test('entrega: pendiente, rechazado, sin pago, monto incompleto y reembolsado NO entregan archivos', async () => {
  const casos = [
    [[{ status: 'in_process', transaction_amount: 5000 }], 'pendiente'],
    [[{ status: 'rejected', transaction_amount: 5000 }], 'rechazado'],
    [[{ status: 'refunded', transaction_amount: 5000 }], 'rechazado'],
    [[{ status: 'approved', transaction_amount: 1000 }], 'rechazado'],
    [[], 'sin_pago'],
  ];
  for (const [results, esperado] of casos) {
    mockFetch(() => resp({ results }));
    const d = await (await entrega(urlEntrega(ref, signRef(ref)))).json();
    assert.equal(d.estado, esperado, JSON.stringify(results));
    assert.equal(d.archivos, undefined);
  }
});

test('entrega: tokens falsos o manipulados se rechazan sin consultar nada', async () => {
  mockFetch(() => { throw new Error('no debería llamar a Mercado Pago'); });
  assert.equal((await entrega(urlEntrega(ref, 'x'.repeat(40)))).status, 403);
  assert.equal((await entrega(urlEntrega(ref, ''))).status, 403);
  assert.equal((await entrega(new Request('https://ceja.example/api/entrega'))).status, 403);
  // cambiar el producto del pedido manteniendo el token de otro
  const otro = 'fight.0123456789abcdef01';
  assert.equal((await entrega(urlEntrega(otro, signRef(ref)))).status, 403);
  // pedido del producto gratis: no se vende por esta vía
  const gratisRef = 'indio.0123456789abcdef01';
  assert.equal((await entrega(urlEntrega(gratisRef, signRef(gratisRef)))).status, 403);
  assert.equal(llamadas.length, 0);
});

test('entrega: si Mercado Pago no responde, no se entrega nada', async () => {
  mockFetch(() => resp({}, 500));
  const r = await entrega(urlEntrega(ref, signRef(ref)));
  assert.equal(r.status, 502);
});

test('gratis: solo entrega el producto de precio 0', async () => {
  const ok = await gratis(post('/api/gratis', { id: 'indio' }));
  assert.equal(ok.status, 200);
  assert.ok((await ok.json()).url.includes('/ceja-archivos/posters/gracias-indio.jpg'));
  assert.equal((await gratis(post('/api/gratis', { id: 'mint' }))).status, 404);
  assert.equal((await gratis(post('/api/gratis', { id: 'constructor' }))).status, 404);
});

test('admin-link: solo con la clave correcta devuelve un link que entrega', async () => {
  const mk = (k, r) => new Request(`https://ceja.example/api/admin-link?ref=${encodeURIComponent(r)}&k=${k}`);
  assert.equal((await adminLink(mk('mala', ref))).status, 403);
  assert.equal((await adminLink(mk('', ref))).status, 403);
  assert.equal((await adminLink(mk('clave-admin-de-prueba', 'indio.0123456789abcdef01'))).status, 400);
  assert.equal((await adminLink(mk('clave-admin-de-prueba', 'mint.zzz'))).status, 400);
  const r = await adminLink(mk('clave-admin-de-prueba', ref));
  assert.equal(r.status, 200);
  const l = new URL((await r.json()).link);
  assert.equal(l.searchParams.get('ref'), ref);
  assert.equal(l.searchParams.get('t'), signRef(ref));
  // y ese link realmente entrega cuando el pago está aprobado
  mockFetch(() => resp({ results: [{ status: 'approved', transaction_amount: 5000 }] }));
  const e = await (await entrega(urlEntrega(l.searchParams.get('ref'), l.searchParams.get('t')))).json();
  assert.equal(e.estado, 'aprobado');
});

test('admin-link: sin ADMIN_KEY configurada queda deshabilitada', async () => {
  const guardada = process.env.ADMIN_KEY; delete process.env.ADMIN_KEY;
  const r = await adminLink(new Request(`https://ceja.example/api/admin-link?ref=${ref}&k=`));
  process.env.ADMIN_KEY = guardada;
  assert.equal(r.status, 403);
});
