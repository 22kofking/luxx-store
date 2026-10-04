/* ==========================================================================
   LUXX STORE — compra: detalhes do produto, sacola, cupom, WhatsApp, avisos
   ========================================================================== */
const SHOP = (() => {
  const KEY = 'luxx_cart_v1';
  let cart = U.store.get(KEY, null) || { items: [], coupon: '' };
  if (!Array.isArray(cart.items)) cart = { items: [], coupon: '' };
  const save = () => U.store.set(KEY, cart);
  const product = (id) => C().products.find((p) => p.id === id);
  const sizesOf = (p) =>
    String(p.sizes || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

  /* ---------- avisos (toast) ---------- */
  let toastEl;
  let toastT;
  function toast(msg, ic = 'check') {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'lx-toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastEl);
    }
    toastEl.innerHTML = icon(ic) + '<span>' + U.esc(msg) + '</span>';
    requestAnimationFrame(() => toastEl.classList.add('show'));
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove('show'), 2600);
  }

  /* ---------- mensagens de WhatsApp ---------- */
  const couponLine = () => {
    const st = C().store;
    return st.coupon && st.couponPct > 0 ? `\n\nQuero usar o cupom ${st.coupon} (${st.couponPct}% OFF) ⚡` : '';
  };
  function waProductMsg(p, size) {
    const c = C();
    if (p.soldout) return `Olá, ${c.brand.name}! Quero ser avisado quando *${p.name}* voltar ao estoque. ⚡`;
    return `Olá, ${c.brand.name}! ⚡ Quero comprar:\n\n• *${p.name}*${size ? ` — Tam. ${size}` : ''} — ${U.money(p.price)}${couponLine()}`;
  }

  /* ---------- sacola ---------- */
  const lines = () => cart.items.map((it, i) => ({ ...it, i, p: product(it.pid) })).filter((l) => l.p && !l.p.hidden);
  const count = () => lines().reduce((n, l) => n + l.qty, 0);
  const couponOk = () => {
    const st = C().store;
    return !!cart.coupon && !!st.coupon && st.couponPct > 0 && cart.coupon.trim().toUpperCase() === String(st.coupon).trim().toUpperCase();
  };
  function totals() {
    const sub = lines().reduce((s, l) => s + l.p.price * l.qty, 0);
    const disc = couponOk() ? sub * (C().store.couponPct / 100) : 0;
    return { sub, disc, total: sub - disc };
  }
  function updateCount() {
    const n = count();
    U.$$('.lx-bag-count').forEach((el) => {
      el.textContent = n;
      el.classList.toggle('has', n > 0);
    });
  }
  function add(pid, size, qty = 1) {
    const p = product(pid);
    if (!p) return;
    const ex = cart.items.find((i) => i.pid === pid && i.size === size);
    if (ex) ex.qty += qty;
    else cart.items.push({ pid, size, qty });
    save();
    updateCount();
    const b = U.$('.lx-bag-btn');
    if (b) {
      b.classList.remove('bump');
      void b.offsetWidth;
      b.classList.add('bump');
    }
    toast(`${p.name} na sacola!`, 'bag');
  }
  function cartMsg() {
    const c = C();
    const t = totals();
    const st = c.store;
    let m = `Olá, ${c.brand.name}! ⚡ Quero finalizar meu pedido pelo site:\n\n`;
    m += lines()
      .map((l) => `${l.qty}x *${l.p.name}*${l.size ? ` — Tam. ${l.size}` : ''} — ${U.money(l.p.price * l.qty)}`)
      .join('\n');
    m += `\n\nSubtotal: ${U.money(t.sub)}`;
    if (t.disc) m += `\nCupom ${st.coupon} (-${st.couponPct}%): -${U.money(t.disc)}`;
    m += `\n*Total: ${U.money(t.total)}*`;
    if (st.freeShipping > 0) m += t.total >= st.freeShipping ? '\nFrete: GRÁTIS 🎉' : '\nFrete: a calcular';
    m += '\n\nNome:\nCEP:\nPagamento (Pix ou cartão):';
    return m;
  }

  /* ---------- camadas (overlay, modal, gaveta) ---------- */
  let overlay;
  let modal;
  let drawer;
  let lastFocus = null;
  let qvPushed = false;
  const isOpen = (el) => el && el.classList.contains('open');

  function ensureOverlay() {
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.className = 'lx-overlay';
    overlay.hidden = true;
    overlay.addEventListener('click', () => {
      if (isOpen(modal)) closeModal();
      if (isOpen(drawer)) closeCart();
    });
    document.body.appendChild(overlay);
    return overlay;
  }
  function showOverlay(on) {
    ensureOverlay();
    if (on) {
      overlay.hidden = false;
      requestAnimationFrame(() => overlay.classList.add('open'));
      document.documentElement.style.overflow = 'hidden';
    } else if (!isOpen(modal) && !isOpen(drawer)) {
      overlay.classList.remove('open');
      document.documentElement.style.overflow = '';
      setTimeout(() => {
        if (!overlay.classList.contains('open')) overlay.hidden = true;
      }, 300);
    }
  }

  function openModal(html, label) {
    lastFocus = document.activeElement;
    if (!modal) {
      modal = document.createElement('div');
      modal.className = 'lx-modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      document.body.appendChild(modal);
    }
    modal.setAttribute('aria-label', label || 'Detalhes');
    modal.innerHTML = `<button class="lx-x" type="button" data-act="close-modal" aria-label="Fechar">${icon('close')}</button>${html}`;
    modal.scrollTop = 0;
    showOverlay(true);
    requestAnimationFrame(() => {
      modal.classList.add('open');
      const x = modal.querySelector('.lx-x');
      if (x) x.focus({ preventScroll: true });
    });
  }
  function closeModal(fromPop) {
    if (!isOpen(modal)) return;
    if (!fromPop && qvPushed) {
      qvPushed = false;
      try {
        history.back();
        return;
      } catch (e) {}
    }
    qvPushed = false;
    if (!fromPop && /^#produto-/.test(location.hash)) {
      try {
        history.replaceState(null, '', location.pathname + location.search);
      } catch (e) {}
    }
    modal.classList.remove('open');
    showOverlay(false);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  /* ---------- detalhes do produto ---------- */
  function quickView(pid) {
    const p = product(pid);
    if (!p) return false;
    const c = C();
    const cat = catOf(p.cat);
    const sizes = sizesOf(p);
    const pre = sizes.length === 1 ? sizes[0] : '';
    const st = c.store;
    openModal(
      `<div class="lx-qv" data-pid="${U.esc(p.id)}" data-size="${U.esc(pre)}">
        <div class="lx-qv-media">${R.badges(p)}${productMedia(p, 'art')}</div>
        <div class="lx-qv-info">
          ${cat ? `<span class="lx-card-cat">${U.esc(cat.name)}</span>` : ''}
          <h2 class="lx-h lx-qv-name">${U.esc(p.name)}</h2>
          <div>${R.price(p, true)}</div>
          ${p.desc ? `<p class="lx-qv-desc">${U.esc(p.desc)}</p>` : ''}
          ${
            sizes.length && !p.soldout
              ? `<div><div class="lx-qv-label">Tamanho <span id="lx-size-label">${U.esc(pre)}</span></div>
                <div class="lx-sizes" role="group" aria-label="Escolha o tamanho">${sizes
                  .map((s) => `<button class="lx-size" type="button" data-act="size" data-size="${U.esc(s)}" aria-pressed="${s === pre}">${U.esc(s)}</button>`)
                  .join('')}</div></div>`
              : ''
          }
          <div class="lx-qv-actions">
            ${
              p.soldout
                ? `<a class="lx-btn lx-btn--wa" href="${U.esc(wa(waProductMsg(p)))}" target="_blank" rel="noopener">${icon('whatsapp')}Avise-me quando chegar</a>`
                : `${st.cart ? `<button class="lx-btn" type="button" data-act="add" data-pid="${U.esc(p.id)}">${icon('bag')}Adicionar à sacola</button>` : ''}
                   <a class="lx-btn lx-btn--wa" data-act="buy-wa" data-pid="${U.esc(p.id)}" href="${U.esc(wa(waProductMsg(p, pre)))}" target="_blank" rel="noopener">${icon('whatsapp')}Comprar pelo WhatsApp</a>
                   ${p.link ? `<a class="lx-btn lx-btn--ghost" href="${U.esc(safeUrl(p.link))}" target="_blank" rel="noopener">Comprar no site${icon('arrow')}</a>` : ''}`
            }
          </div>
          <div class="lx-trust">
            ${st.freeShipping > 0 ? `<span>${icon('truck')}Frete grátis acima de ${U.esc(moneyShort(st.freeShipping))}</span>` : ''}
            <span>${icon('refresh')}Troca fácil</span><span>${icon('shield')}Compra segura</span>
          </div>
        </div>
      </div>`,
      p.name
    );
    return true;
  }
  function view(pid) {
    if (!product(pid)) return;
    try {
      if (location.hash !== '#produto-' + pid) {
        history.pushState({ lxqv: pid }, '', '#produto-' + pid);
        qvPushed = true;
      }
    } catch (e) {}
    quickView(pid);
  }
  function fromHash() {
    const m = /^#produto-(.+)$/.exec(location.hash);
    if (m && product(decodeURIComponent(m[1]))) {
      quickView(decodeURIComponent(m[1]));
      return true;
    }
    return false;
  }
  window.addEventListener('popstate', () => {
    if (!fromHash() && isOpen(modal)) closeModal(true);
  });

  function selectedSize(btn) {
    const qv = btn.closest('.lx-qv');
    const p = product(qv.dataset.pid);
    const size = qv.dataset.size;
    if (sizesOf(p).length && !size) {
      const box = qv.querySelector('.lx-sizes');
      if (box) {
        box.classList.remove('shake');
        void box.offsetWidth;
        box.classList.add('shake');
      }
      toast('Escolha o tamanho primeiro', 'tag');
      return null;
    }
    return { p, size };
  }

  /* lista simples (usada quando o catálogo está desligado) */
  function openList(catId) {
    const k = catOf(catId);
    const list = visibleProducts().filter((p) => p.cat === catId);
    openModal(
      `<div style="padding:26px 18px 30px"><h2 class="lx-h lx-qv-name" style="margin:4px 60px 18px 0">${U.esc(k ? k.name : 'Produtos')}</h2>
      <div class="lx-grid">${list.map((p) => R.card(p)).join('') || '<p class="lx-empty">Nenhuma peça por aqui ainda.</p>'}</div></div>`,
      k ? k.name : 'Produtos'
    );
  }

  /* ---------- gaveta da sacola ---------- */
  function cartHTML() {
    const ls = lines();
    const t = totals();
    const st = C().store;
    const n = count();
    const body = ls.length
      ? ls
          .map(
            (l) => `<div class="lx-line">
          <div class="lx-line-img">${productMedia(l.p, 'art')}</div>
          <div><b>${U.esc(l.p.name)}</b>${l.size ? `<small>Tamanho: ${U.esc(l.size)}</small>` : ''}
            <div class="lx-line-price">${U.money(l.p.price * l.qty)}</div>
            <div class="lx-qty"><button type="button" data-act="qty" data-i="${l.i}" data-d="-1" aria-label="Diminuir">${icon('minus')}</button><span>${l.qty}</span><button type="button" data-act="qty" data-i="${l.i}" data-d="1" aria-label="Aumentar">${icon('plus')}</button></div>
          </div>
          <button class="lx-line-del" type="button" data-act="del" data-i="${l.i}" aria-label="Remover ${U.esc(l.p.name)}">${icon('trash')}</button>
        </div>`
          )
          .join('')
      : `<div class="lx-cart-empty">${icon('bag')}<p>Sua sacola está vazia.<br>Bora montar esse visual?</p><a class="lx-btn lx-btn--sm" href="#novidades" data-act="close-cart">Ver novidades</a></div>`;
    let ship = '';
    if (ls.length && st.freeShipping > 0) {
      const left = st.freeShipping - t.total;
      const pct = Math.min(100, (t.total / st.freeShipping) * 100);
      ship = `<div class="lx-ship">${left > 0 ? `Faltam <b>${U.money(left)}</b> para o <b>frete grátis</b>` : '🎉 Você ganhou <b>frete grátis</b>!'}<div class="lx-ship-bar"><i style="width:${pct}%"></i></div></div>`;
    }
    const coupon = !ls.length
      ? ''
      : couponOk()
        ? `<div class="lx-coupon-ok"><span>${icon('bolt')} Cupom ${U.esc(st.coupon)} aplicado (-${st.couponPct}%)</span><button type="button" data-act="coupon-remove">remover</button></div>`
        : `<form class="lx-coupon-row" data-form="coupon"><label class="lx-sr" for="lx-coupon-in">Cupom de desconto</label><input class="lx-input" id="lx-coupon-in" name="coupon" placeholder="Cupom (ex: ${U.esc(st.coupon)})" autocomplete="off" value="${U.esc(cart.coupon || '')}"><button class="lx-btn lx-btn--sm" type="submit">Aplicar</button></form>`;
    const foot = ls.length
      ? `<div class="lx-drawer-foot">${ship}${coupon}
        <div class="lx-totals"><div><span>Subtotal</span><span>${U.money(t.sub)}</span></div>
        ${t.disc ? `<div class="lx-disc"><span>Cupom ${U.esc(st.coupon)}</span><span>-${U.money(t.disc)}</span></div>` : ''}
        <div class="lx-total"><span>Total</span><span>${U.money(t.total)}</span></div></div>
        <a class="lx-btn lx-btn--wa lx-btn--block" data-act="checkout" href="${U.esc(wa(cartMsg()))}" target="_blank" rel="noopener">${icon('whatsapp')}Finalizar pelo WhatsApp</a>
        <small style="text-align:center;color:var(--muted);font-size:12px">Você será levado ao WhatsApp com o pedido prontinho.</small></div>`
      : '';
    return `<div class="lx-drawer-head"><h2 class="lx-h" id="lx-cart-title">Sacola${n ? ` (${n})` : ''}</h2><button class="lx-x" type="button" data-act="close-cart" aria-label="Fechar sacola">${icon('close')}</button></div>
      <div class="lx-drawer-body">${body}</div>${foot}`;
  }
  function renderCart() {
    if (drawer) drawer.innerHTML = cartHTML();
    updateCount();
  }
  function openCart() {
    lastFocus = document.activeElement;
    if (isOpen(modal)) closeModal();
    if (!drawer) {
      drawer = document.createElement('aside');
      drawer.className = 'lx-drawer';
      drawer.setAttribute('role', 'dialog');
      drawer.setAttribute('aria-modal', 'true');
      drawer.setAttribute('aria-labelledby', 'lx-cart-title');
      document.body.appendChild(drawer);
    }
    renderCart();
    showOverlay(true);
    requestAnimationFrame(() => {
      drawer.classList.add('open');
      const x = drawer.querySelector('.lx-x');
      if (x) x.focus({ preventScroll: true });
    });
  }
  function closeCart() {
    if (!isOpen(drawer)) return;
    drawer.classList.remove('open');
    showOverlay(false);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  /* ---------- toque secreto para abrir o painel ---------- */
  let taps = [];
  function secretTap() {
    const now = Date.now();
    taps = taps.filter((t) => now - t < 3000);
    taps.push(now);
    if (taps.length >= 5) {
      taps = [];
      ADMIN.open();
    }
  }

  /* ---------- cliques (delegação) ---------- */
  function onClick(e) {
    if (UI.editing && e.target.closest('#luxx-root [data-edit]')) {
      e.preventDefault();
      return;
    }
    const el = e.target.closest('[data-act]');
    if (!el || el.closest('#lx-admin')) return;
    const act = el.dataset.act;
    switch (act) {
      case 'view':
        e.preventDefault();
        view(el.dataset.pid);
        break;
      case 'close-modal':
        closeModal();
        break;
      case 'size': {
        const qv = el.closest('.lx-qv');
        qv.dataset.size = el.dataset.size;
        U.$$('.lx-size', qv).forEach((b) => b.setAttribute('aria-pressed', String(b === el)));
        const lab = qv.querySelector('#lx-size-label');
        if (lab) lab.textContent = el.dataset.size;
        const buy = qv.querySelector('[data-act="buy-wa"]');
        if (buy) buy.href = wa(waProductMsg(product(qv.dataset.pid), el.dataset.size));
        break;
      }
      case 'add': {
        const s = selectedSize(el);
        if (!s) return;
        add(s.p.id, s.size);
        closeModal();
        break;
      }
      case 'buy-wa':
        // o link abre o WhatsApp sozinho; só bloqueia se faltar escolher o tamanho
        if (!selectedSize(el)) e.preventDefault();
        break;
      case 'cart':
        openCart();
        break;
      case 'close-cart':
        closeCart();
        break;
      case 'qty': {
        const it = cart.items[+el.dataset.i];
        if (!it) return;
        it.qty = Math.max(0, it.qty + +el.dataset.d);
        if (!it.qty) cart.items.splice(+el.dataset.i, 1);
        save();
        renderCart();
        break;
      }
      case 'del':
        cart.items.splice(+el.dataset.i, 1);
        save();
        renderCart();
        break;
      case 'coupon-remove':
        cart.coupon = '';
        save();
        renderCart();
        break;
      case 'copy-coupon': {
        const code = C().store.coupon;
        U.copy(code).then((ok) => {
          cart.coupon = code;
          save();
          toast(ok ? `Cupom ${code} copiado! Já está na sua sacola ⚡` : `Seu cupom: ${code} (já aplicado na sacola)`, 'bolt');
        });
        break;
      }
      case 'menu': {
        const nav = document.getElementById('lx-mnav');
        if (!nav) return;
        nav.hidden = !nav.hidden;
        el.setAttribute('aria-expanded', String(!nav.hidden));
        el.innerHTML = icon(nav.hidden ? 'menu' : 'close');
        break;
      }
      case 'close-menu': {
        const nav = document.getElementById('lx-mnav');
        if (nav) nav.hidden = true;
        const bt = U.$('.lx-burger');
        if (bt) {
          bt.setAttribute('aria-expanded', 'false');
          bt.innerHTML = icon('menu');
        }
        break;
      }
      case 'filter':
        UI.filter = el.dataset.cat;
        if (C().sections.catalogo.on) R.refreshCatalog();
        else {
          e.preventDefault();
          openList(el.dataset.cat);
        }
        break;
      case 'filter-chip':
        UI.filter = el.dataset.cat;
        R.refreshCatalog();
        break;
      case 'rail': {
        const rail = el.closest('.lx-rail-wrap').querySelector('.lx-rail');
        rail.scrollBy({ left: rail.clientWidth * 0.9 * +el.dataset.dir, behavior: 'smooth' });
        break;
      }
      case 'secret':
        secretTap();
        break;
      default:
    }
  }

  function onSubmit(e) {
    const f = e.target.closest('[data-form="coupon"]');
    if (!f) return;
    e.preventDefault();
    const v = f.coupon.value.trim();
    cart.coupon = v;
    save();
    if (couponOk()) toast(`Cupom ${C().store.coupon} aplicado! ⚡`, 'bolt');
    else toast('Cupom inválido 😕', 'close');
    renderCart();
  }

  function init() {
    document.addEventListener('click', onClick);
    document.addEventListener('submit', onSubmit);
    document.addEventListener('change', (e) => {
      if (e.target.matches('[data-act="sort"]')) {
        UI.sort = e.target.value;
        R.refreshCatalog();
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (isOpen(modal)) closeModal();
      else if (isOpen(drawer)) closeCart();
    });
    fromHash();
  }

  return { init, toast, waProductMsg, updateCount, renderCart, openCart, view, add, totals, cartMsg, closeModal, closeCart, get cart() { return cart; } };
})();
