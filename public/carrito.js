// Carrito de compras. Guarda los artículos en este navegador (localStorage).
// El precio final y el descuento los vuelve a calcular el servidor al cobrar.
(function () {
  var KEY = 'ceja-carrito';
  var ids = [], info = null, desc = [], sinDesc = [], MAX = 12;
  var $ = function (id) { return document.getElementById(id); };
  var dlg = $('cart'); if (!dlg) return;

  function load() { try { var a = JSON.parse(localStorage.getItem(KEY) || '[]'); ids = Array.isArray(a) ? a.filter(function (x) { return typeof x === 'string'; }) : []; } catch (e) { ids = []; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch (e) {} }
  function fmt(n) { return 'ARS ' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt !== undefined) e.textContent = txt; return e; }
  function toast(m) { var a = $('aviso'); if (!a) return; a.textContent = m; a.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(function () { a.hidden = true; }, 3500); }

  function pctPara(n) { var p = 0; desc.forEach(function (d) { if (n >= d.min && d.pct > p) p = d.pct; }); return p; }
  function calc() {
    var list = ids.filter(function (id) { return info && info[id]; });
    var n = list.filter(function (id) { return sinDesc.indexOf(id) < 0; }).length;
    var pct = pctPara(n), sub = 0, total = 0;
    var items = list.map(function (id) {
      var p = info[id], aplica = pct > 0 && sinDesc.indexOf(id) < 0;
      var unit = aplica ? Math.round(p.price * (100 - pct) / 100) : p.price;
      sub += p.price; total += unit;
      return { id: id, p: p, unit: unit };
    });
    var next = null;
    desc.slice().sort(function (a, b) { return a.min - b.min; }).forEach(function (d) { if (!next && d.min > n && n > 0) next = d; });
    return { items: items, sub: sub, total: total, pct: pct, n: n, next: next };
  }

  function count() {
    var c = ids.filter(function (id) { return !info || info[id]; }).length;
    document.querySelectorAll('[data-cart-count]').forEach(function (e) { e.textContent = c; if (c) e.removeAttribute('data-zero'); else e.setAttribute('data-zero', ''); });
  }

  function render() {
    var c = calc(), list = $('cart-list'); list.textContent = '';
    c.items.forEach(function (it) {
      var li = el('li'), im = new Image(); im.src = it.p.img; im.alt = ''; im.width = 52; im.height = 74;
      var mid = el('div'); mid.appendChild(el('b', '', it.p.title));
      var pr = el('span', 'mono'); if (it.unit !== it.p.price) pr.appendChild(el('s', '', fmt(it.p.price))); pr.appendChild(document.createTextNode(fmt(it.unit))); mid.appendChild(pr);
      var rm = el('button', 'cart-rm', '✕'); rm.type = 'button'; rm.setAttribute('aria-label', 'Quitar ' + it.p.title); rm.setAttribute('data-rm', it.id);
      li.appendChild(im); li.appendChild(mid); li.appendChild(rm); list.appendChild(li);
    });
    var has = c.items.length > 0;
    $('cart-empty').hidden = has; $('cart-sum').hidden = !has; $('cart-go').hidden = !has; $('cart-note').hidden = !has;
    $('cart-sub').textContent = fmt(c.sub); $('cart-total').textContent = fmt(c.total);
    $('cart-dline').hidden = !c.pct;
    $('cart-dlabel').textContent = 'Descuento ' + c.pct + '%'; $('cart-disc').textContent = '− ' + fmt(c.sub - c.total);
    var nu = $('cart-nudge');
    if (c.next) { var f = c.next.min - c.n; nu.textContent = 'Sumá ' + f + (f === 1 ? ' póster más' : ' pósters más') + ' y tenés ' + c.next.pct + '% de descuento.'; nu.hidden = false; }
    else nu.hidden = true;
    count();
  }

  function promo() {
    if (!desc.length) return;
    var t = 'Llevá más, pagás menos: ' + desc.slice().sort(function (a, b) { return a.min - b.min; }).map(function (d, i, a) { return d.min + (i === a.length - 1 ? '+' : '') + ' pósters −' + d.pct + '%'; }).join(' · ');
    document.querySelectorAll('[data-promo]').forEach(function (e) { e.textContent = t; });
  }

  function buyBtn() {
    var b = $('buy-add'); if (!b) return;
    var inCart = ids.indexOf(window.CEJA_CUR) >= 0;
    b.textContent = inCart ? 'Ya está en el carrito · Ver carrito' : 'Agregar al carrito';
  }

  function add(id) {
    if (!id) return;
    if (ids.indexOf(id) >= 0) { $('buy').close(); open(); return; }
    if (ids.length >= MAX) { toast('El carrito admite hasta ' + MAX + ' artículos por compra.'); return; }
    ids.push(id); save(); render();
    var b = $('buy'); if (b && b.open) b.close();
    var c = calc();
    toast('Agregado al carrito' + (c.pct ? ' · ' + c.pct + '% de descuento' : ''));
  }
  function remove(id) { ids = ids.filter(function (x) { return x !== id; }); save(); render(); }
  function open() { render(); $('cart-error').hidden = true; if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', ''); }

  function pay() {
    var c = calc(); if (!c.items.length) return;
    var go = $('cart-go'), err = $('cart-error'); err.hidden = true; go.disabled = true; go.textContent = 'Abriendo Mercado Pago…';
    function reset() { go.disabled = false; go.textContent = 'Pagar con Mercado Pago'; }
    fetch('/api/checkout', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ids: c.items.map(function (i) { return i.id; }), total: c.total }) })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, status: r.status, d: d }; }); })
      .then(function (x) {
        if (x.ok && x.d && typeof x.d.url === 'string' && x.d.url.indexOf('https://') === 0) { location.href = x.d.url; return; }
        reset(); err.hidden = false;
        err.textContent = x.status === 409 ? 'Los precios cambiaron. Recargá la página y volvé a armar el carrito.' : x.status === 404 ? 'Alguno de los artículos ya no está disponible. Quitalo del carrito y probá de nuevo.' : 'No pudimos abrir Mercado Pago. Probá de nuevo en un momento.';
      })
      .catch(function () { reset(); err.hidden = false; err.textContent = 'No hay conexión. Revisá tu internet y probá de nuevo.'; });
  }

  document.addEventListener('click', function (e) {
    var t = e.target; if (!t.closest) return;
    if (t.closest('[data-cart-open]')) { open(); return; }
    var rm = t.closest('[data-rm]'); if (rm) { remove(rm.getAttribute('data-rm')); return; }
    if (t.closest('#buy-add')) { add(window.CEJA_CUR); return; }
    if (t.closest('#cart-go')) { pay(); return; }
    if (t.closest('#cart-more')) { dlg.close(); return; }
    if (t.closest('[data-buy]')) setTimeout(buyBtn, 0);
  });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  window.addEventListener('pageshow', function () { var g = $('cart-go'); if (g) { g.disabled = false; g.textContent = 'Pagar con Mercado Pago'; } });
  window.addEventListener('storage', function () { load(); render(); });

  load(); count();
  fetch('catalogo.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (d) {
    info = d.productos || {}; desc = d.descuentos || []; sinDesc = d.sinDescuento || []; MAX = d.max || 12;
    ids = ids.filter(function (id) { return info[id] && info[id].price > 0; }); save(); render(); promo();
  }).catch(function () {});
})();
