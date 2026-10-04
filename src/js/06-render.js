/* ==========================================================================
   LUXX STORE — renderização do site a partir da configuração
   ========================================================================== */
const UI = { filter: 'all', sort: 'rel', editing: false, first: true };
const C = () => STATE.cfg;

/* ---------- textos ---------- */
const moneyShort = (v) => (Number.isInteger(+v) ? 'R$ ' + (+v).toLocaleString('pt-BR') : U.money(v));
const ph = (s) =>
  String(s == null ? '' : s).replace(/\{(cupom|desconto|loja|ano|frete|parcelas)\}/gi, (m, k) => {
    const c = C();
    switch (k.toLowerCase()) {
      case 'cupom':
        return c.store.coupon;
      case 'desconto':
        return c.store.couponPct;
      case 'loja':
        return c.brand.name;
      case 'ano':
        return new Date().getFullYear();
      case 'frete':
        return moneyShort(c.store.freeShipping);
      case 'parcelas':
        return c.store.installments;
      default:
        return m;
    }
  });
/* texto de um caminho da config (escapado; no modo edição mostra os {códigos}) */
const tx = (path) => {
  const raw = U.get(C(), path);
  return U.esc(UI.editing ? raw : ph(raw));
};
const ed = (path, ml) => ` data-edit="${path}"${ml ? ' data-ml="1"' : ''}`;

/* ---------- links ---------- */
const safeUrl = (u, fb = '#') => {
  const s = String(u || '').trim();
  if (!s) return fb;
  if (/^(javascript|vbscript|data:text)/i.test(s.replace(/\s/g, ''))) return fb;
  return s;
};
const waNumber = () => String(C().store.whatsapp || '').replace(/\D/g, '');
const wa = (msg) => {
  const n = waNumber();
  const t = encodeURIComponent(ph(msg || C().store.whatsappMsg || ''));
  return `https://wa.me/${n}${t ? '?text=' + t : ''}`;
};
const linkTo = (v) => {
  const s = String(v || '').trim();
  if (!s) return '#novidades';
  if (s.toLowerCase() === 'whatsapp') return wa();
  return safeUrl(s);
};
const isExternal = (h) => /^https?:/i.test(h);
const cssUrl = (u) => String(u || '').replace(/["'()\\\s<>]/g, (ch) => '%' + ch.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0'));
const tgt = (h) => (isExternal(h) ? ' target="_blank" rel="noopener"' : '');
const fmtPhone = (d) => {
  const n = String(d || '').replace(/\D/g, '');
  const m = /^55(\d{2})(\d{4,5})(\d{4})$/.exec(n);
  return m ? `+55 (${m[1]}) ${m[2]}-${m[3]}` : n ? '+' + n : '';
};

/* ---------- produtos ---------- */
const catOf = (id) => C().categories.find((c) => c.id === id);
const visibleProducts = () => C().products.filter((p) => !p.hidden);
const pIndex = (p) => C().products.indexOf(p);
const offPct = (p) => (+p.old > +p.price && +p.price > 0 ? Math.round((1 - p.price / p.old) * 100) : 0);
const installments = (price) => {
  const st = C().store;
  const n = Math.min(+st.installments || 1, Math.floor(price / (+st.minInstallment || 1)));
  return n >= 2 ? { n, v: price / n } : null;
};
const couponPrice = (p) => {
  const st = C().store;
  return st.couponPct > 0 && st.showCouponPrice && !p.soldout ? p.price * (1 - st.couponPct / 100) : 0;
};
const productMedia = (p, cls = 'art', alt) => {
  const src = p.img && MEDIA.url(p.img);
  if (src) return `<img src="${U.esc(src)}" alt="${U.esc(alt || p.name)}" loading="lazy" decoding="async">`;
  return ART.svg(p.art, { cls, label: alt || p.name });
};

const R = {};

R.logo = (c, editable = true) => {
  const b = c.brand;
  const src = b.logoImg && MEDIA.url(b.logoImg);
  if (src) return `<img class="lx-logo-img" src="${U.esc(src)}" alt="${U.esc(b.name)}" style="height:${+b.logoHeight || 38}px">`;
  const e = (p) => (editable ? ed(p) : '');
  return `<span class="lx-logo-mark">${b.logoBolt ? `<span class="lx-logo-bolt">${icon('bolt')}</span>` : ''}<span class="lx-logo-text"${e('brand.logoText')}>${U.esc(b.logoText)}</span>${
    b.logoSub ? `<span class="lx-logo-sub"${e('brand.logoSub')}>${U.esc(b.logoSub)}</span>` : ''
  }</span>`;
};

R.topbar = (c) => {
  const s = c.sections.topbar;
  if (!s.on || !s.items || !s.items.length) return '';
  const seq = (hidden) =>
    `<div class="lx-topbar-seq"${hidden ? ' aria-hidden="true"' : ''}>${s.items
      .map((t, i) => `<span${ed('sections.topbar.items.' + i)}>${tx('sections.topbar.items.' + i)}</span><i>${icon('bolt')}</i>`)
      .join('')}</div>`;
  // repete para a faixa nunca ficar vazia em telas largas
  return `<div class="lx-topbar" role="region" aria-label="Avisos da loja"><div class="lx-topbar-track">${seq(false)}${seq(true)}${seq(true)}${seq(true)}</div></div>`;
};

R.navLinks = (c) =>
  c.order
    .filter((id) => id !== 'hero' && c.sections[id] && c.sections[id].on && c.sections[id].nav)
    .map((id) => ({ id, label: ph(c.sections[id].nav) }));

R.header = (c) => {
  const links = R.navLinks(c);
  const cart = c.store.cart;
  return `<header class="lx-header" id="lx-header">
    <div class="lx-wrap lx-header-in">
      <button class="lx-burger" data-act="menu" aria-label="Abrir menu" aria-expanded="false" aria-controls="lx-mnav">${icon('menu')}</button>
      <a class="lx-logo" href="#top" aria-label="${U.esc(c.brand.name)} — início">${R.logo(c)}</a>
      <nav class="lx-nav" aria-label="Menu principal">${links.map((l) => `<a href="#${l.id}">${U.esc(l.label)}</a>`).join('')}</nav>
      <div class="lx-header-actions">
        ${c.store.search !== false ? `<button class="lx-hbtn" type="button" data-act="search" aria-label="Pesquisar produtos" title="Pesquisar (/)">${icon('search')}</button>` : ''}
        <a class="lx-hbtn lx-hide-m" href="${U.esc(wa())}" target="_blank" rel="noopener" aria-label="Falar no WhatsApp">${icon('whatsapp')}</a>
        ${cart ? `<button class="lx-hbtn lx-bag-btn" data-act="cart" aria-label="Abrir sacola">${icon('bag')}<span class="lx-bag-count">0</span></button>` : ''}
      </div>
    </div>
    <div class="lx-mnav" id="lx-mnav" hidden>
      <div class="lx-wrap">
        ${links.map((l) => `<a href="#${l.id}" data-act="close-menu">${U.esc(l.label)}${icon('arrow')}</a>`).join('')}
        <a class="lx-btn lx-btn--wa" href="${U.esc(wa())}" target="_blank" rel="noopener">${icon('whatsapp')} Falar no WhatsApp</a>
      </div>
    </div>
  </header>`;
};

R.hero = (c) => {
  const s = c.sections.hero;
  const img = s.img && MEDIA.url(s.img);
  const full = s.layout === 'full' && img;
  const visual = img ? `<img class="lx-stage-img" src="${U.esc(img)}" alt="">` : ART.svg(s.art);
  const b1 = linkTo(s.btn1Link);
  return `<section class="lx-hero${full ? ' lx-hero--full' : ''}" id="hero">
    ${full ? `<div class="lx-hero-photo" style="background-image:url('${U.esc(cssUrl(img))}')"></div><div class="lx-hero-shade" style="opacity:${+s.overlay}"></div>` : ''}
    <div class="lx-hero-bgword" aria-hidden="true">${U.esc(c.brand.logoText)}</div>
    <div class="lx-wrap lx-hero-grid">
      <div class="lx-hero-copy lx-reveal">
        <span class="lx-pill">${icon('bolt')}<span${ed('sections.hero.kicker')}>${tx('sections.hero.kicker')}</span></span>
        <h1 class="lx-h lx-hero-title"><span${ed('sections.hero.title')}>${tx('sections.hero.title')}</span> <span class="lx-hl"${ed('sections.hero.titleAccent')}>${tx('sections.hero.titleAccent')}</span></h1>
        <p class="lx-hero-text"${ed('sections.hero.text', 1)}>${tx('sections.hero.text')}</p>
        <div class="lx-ctas">
          <a class="lx-btn" href="${U.esc(b1)}"${tgt(b1)}><span${ed('sections.hero.btn1')}>${tx('sections.hero.btn1')}</span>${icon('arrow')}</a>
          <a class="lx-btn lx-btn--ghost" href="${U.esc(wa())}" target="_blank" rel="noopener">${icon('whatsapp')}<span${ed('sections.hero.btn2')}>${tx('sections.hero.btn2')}</span></a>
        </div>
        ${
          s.stats && s.stats.length
            ? `<ul class="lx-stats">${s.stats
                .map(
                  (st, i) =>
                    `<li><b${ed(`sections.hero.stats.${i}.big`)}>${tx(`sections.hero.stats.${i}.big`)}</b><span${ed(`sections.hero.stats.${i}.small`)}>${tx(
                      `sections.hero.stats.${i}.small`
                    )}</span></li>`
                )
                .join('')}</ul>`
            : ''
        }
      </div>
      ${
        full
          ? ''
          : `<div class="lx-stage lx-reveal">
        <div class="lx-stage-orbit"></div>
        <div class="lx-stage-disc"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${ART.BOLT}" fill="currentColor"/></svg></div>
        <div class="lx-stage-item">${visual}</div>
        ${s.sticker1 ? `<span class="lx-sticker lx-sticker--a"${ed('sections.hero.sticker1')}>${tx('sections.hero.sticker1')}</span>` : ''}
        ${s.sticker2 ? `<span class="lx-sticker lx-sticker--b"${ed('sections.hero.sticker2')}>${tx('sections.hero.sticker2')}</span>` : ''}
      </div>`
      }
    </div>
  </section>`;
};

R.marquee = (c) => {
  const w = (c.sections.marquee.words || []).filter(Boolean);
  if (!w.length) return '';
  const seq = (words, hidden) =>
    `<div class="lx-strip-seq"${hidden ? ' aria-hidden="true"' : ''}>${words.map((x) => `<span>${U.esc(ph(x))}</span><i>${icon('bolt')}</i>`).join('')}</div>`;
  const band = (words, cls) =>
    `<div class="lx-strip-band ${cls}"><div class="lx-strip-track">${seq(words)}${seq(words, 1)}${seq(words, 1)}${seq(words, 1)}</div></div>`;
  return `<div class="lx-strip" id="marquee" aria-label="${U.esc(w.join(', '))}">${band(w, '')}${band(w.slice().reverse(), 'lx-strip-band--b')}</div>`;
};

R.head = (id, link) => {
  const p = `sections.${id}.`;
  const s = C().sections[id];
  return `<div class="lx-sh lx-reveal">
    <div>
      <span class="lx-kicker">${icon('bolt')}<span${ed(p + 'kicker')}>${tx(p + 'kicker')}</span></span>
      <h2 class="lx-h lx-sh-title"${ed(p + 'title')}>${tx(p + 'title')}</h2>
      ${s.text || UI.editing ? `<p class="lx-sh-text"${ed(p + 'text', 1)}>${tx(p + 'text')}</p>` : ''}
    </div>
    ${link ? `<a class="lx-link" href="${link[0]}"${link[2] ? ` data-act="${link[2]}"` : ''}>${U.esc(link[1])}${icon('arrow')}</a>` : ''}
  </div>`;
};

R.price = (p, big) => {
  const inst = installments(+p.price);
  const cp = couponPrice(p);
  return `<div class="lx-price${big ? ' lx-price--big' : ''}">${+p.old > +p.price ? `<s>${U.money(p.old)}</s>` : ''}<strong>${U.money(p.price)}</strong></div>
    ${inst ? `<div class="lx-inst">ou ${inst.n}x de ${U.money(inst.v)} sem juros</div>` : ''}
    ${cp ? `<div class="lx-cprice">${icon('bolt')}${U.money(cp)} com ${U.esc(C().store.coupon)}</div>` : ''}`;
};

R.badges = (p) => {
  const out = [];
  if (p.soldout) out.push(['Esgotado', 'lx-badge--out']);
  else {
    if (p.badge) out.push([p.badge, '']);
    else if (p.isNew) out.push(['Novo', '']);
    const off = offPct(p);
    if (off) out.push([`-${off}%`, 'lx-badge--off']);
  }
  return out.length ? `<span class="lx-badges">${out.map(([t, k]) => `<span class="lx-badge ${k}">${U.esc(t)}</span>`).join('')}</span>` : '';
};

R.card = (p, rank) => {
  const i = pIndex(p);
  const cat = catOf(p.cat);
  const name = U.esc(p.name);
  return `<article class="lx-card${p.soldout ? ' is-out' : ''}" data-pid="${U.esc(p.id)}">
    <a class="lx-card-media" href="#produto-${U.esc(p.id)}" data-act="view" data-pid="${U.esc(p.id)}" aria-label="Ver detalhes: ${name}">
      ${R.badges(p)}
      ${rank ? `<span class="lx-rank" aria-hidden="true">${String(rank).padStart(2, '0')}</span>` : ''}
      ${productMedia(p)}
    </a>
    <div class="lx-card-body">
      ${cat ? `<span class="lx-card-cat">${U.esc(cat.name)}</span>` : ''}
      <h3 class="lx-card-name"><a href="#produto-${U.esc(p.id)}" data-act="view" data-pid="${U.esc(p.id)}"${ed('products.' + i + '.name')}>${name}</a></h3>
      ${R.price(p)}
    </div>
    <div class="lx-card-cta">
      <button class="lx-btn lx-btn--sm" type="button" data-act="view" data-pid="${U.esc(p.id)}">${p.soldout ? 'Avise-me' : 'Comprar'}</button>
      <a class="lx-card-wa" href="${U.esc(wa(SHOP.waProductMsg(p)))}" target="_blank" rel="noopener" aria-label="Pedir ${name} pelo WhatsApp">${icon('whatsapp')}</a>
    </div>
  </article>`;
};

R.novidades = (c) => {
  const s = c.sections.novidades;
  const list = visibleProducts()
    .filter((p) => p.isNew)
    .slice(0, +s.limit || 8);
  if (!list.length && !UI.editing) return '';
  const cards = list.map((p) => R.card(p)).join('') || `<p class="lx-empty">Marque produtos como “Novidade” no painel.</p>`;
  const body =
    s.layout === 'grid'
      ? `<div class="lx-grid lx-reveal">${cards}</div>`
      : `<div class="lx-rail-wrap lx-reveal"><div class="lx-rail" id="lx-rail-novidades" tabindex="0" aria-label="Novidades — deslize para o lado">${cards}</div>
         <div class="lx-rail-nav"><button class="lx-round" type="button" data-act="rail" data-dir="-1" aria-label="Anterior">${icon('arrowL')}</button><button class="lx-round" type="button" data-act="rail" data-dir="1" aria-label="Próximo">${icon('arrow')}</button></div></div>`;
  return `<section class="lx-sec" id="novidades"><div class="lx-wrap">${R.head('novidades', c.sections.catalogo.on ? ['#catalogo', 'Ver tudo'] : null)}${body}</div></section>`;
};

R.categorias = (c) => {
  if (!c.categories.length) return '';
  const vis = visibleProducts();
  const tiles = c.categories
    .map((k, i) => {
      const n = vis.filter((p) => p.cat === k.id).length;
      const src = k.img && MEDIA.url(k.img);
      return `<a class="lx-cat" href="#catalogo" data-act="filter" data-cat="${U.esc(k.id)}">
        <span class="lx-cat-name"${ed('categories.' + i + '.name')}>${U.esc(k.name)}</span>
        <span class="lx-cat-count">${n} ${n === 1 ? 'peça' : 'peças'}</span>
        <span class="lx-cat-go">${icon('arrow')}</span>
        <span class="lx-cat-art">${src ? `<img src="${U.esc(src)}" alt="" loading="lazy">` : ART.svg(k.art)}</span>
      </a>`;
    })
    .join('');
  return `<section class="lx-sec lx-sec--alt" id="categorias"><div class="lx-wrap">${R.head('categorias')}<div class="lx-cats lx-reveal">${tiles}</div></div></section>`;
};

R.promo = (c) => {
  const s = c.sections.promo;
  const st = c.store;
  const p = 'sections.promo.';
  return `<section class="lx-promo" id="promo">
    <div class="lx-promo-bg" aria-hidden="true">${U.esc(st.couponPct)}%</div>
    <div class="lx-wrap lx-promo-grid">
      <div class="lx-promo-copy lx-reveal">
        <span class="lx-kicker">${icon('bolt')}<span${ed(p + 'kicker')}>${tx(p + 'kicker')}</span></span>
        <h2 class="lx-h lx-promo-title"${ed(p + 'title')}>${tx(p + 'title')}</h2>
        <p${ed(p + 'text', 1)}>${tx(p + 'text')}</p>
        <div class="lx-countdown" id="lx-countdown" data-ends="${U.esc(s.endsAt || '')}" hidden></div>
      </div>
      <div class="lx-ticket lx-reveal">
        <span class="lx-ticket-label">Seu cupom</span>
        <strong class="lx-ticket-code" style="--len:${Math.max(4, String(st.coupon).length)}">${U.esc(st.coupon)}</strong>
        <span class="lx-ticket-off">${U.esc(st.couponPct)}% OFF em qualquer compra</span>
        <button class="lx-btn" type="button" data-act="copy-coupon">${icon('copy')}<span${ed(p + 'btn')}>${tx(p + 'btn')}</span></button>
        <a class="lx-ticket-link" href="${c.sections.catalogo.on ? '#catalogo' : '#novidades'}"><span${ed(p + 'btn2')}>${tx(p + 'btn2')}</span>${icon('arrow')}</a>
      </div>
    </div>
    ${s.note || UI.editing ? `<p class="lx-wrap lx-promo-note"${ed(p + 'note')}>${tx(p + 'note')}</p>` : ''}
  </section>`;
};

R.maisvendidos = (c) => {
  const s = c.sections.maisvendidos;
  const list = visibleProducts()
    .filter((p) => p.best)
    .slice(0, +s.limit || 8);
  if (!list.length && !UI.editing) return '';
  return `<section class="lx-sec" id="maisvendidos"><div class="lx-wrap">${R.head('maisvendidos', c.sections.catalogo.on ? ['#catalogo', 'Ver loja'] : null)}
    <div class="lx-grid lx-reveal">${list.map((p, i) => R.card(p, s.rank ? i + 1 : 0)).join('') || `<p class="lx-empty">Marque produtos como “Mais vendido” no painel.</p>`}</div></div></section>`;
};

R.catalogList = () => {
  let list = visibleProducts();
  if (UI.filter !== 'all') list = list.filter((p) => p.cat === UI.filter);
  const by = {
    low: (a, b) => a.price - b.price,
    high: (a, b) => b.price - a.price,
    new: (a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0),
    off: (a, b) => offPct(b) - offPct(a),
  }[UI.sort];
  return by ? list.slice().sort(by) : list;
};
R.catalogInner = (c) => {
  const vis = visibleProducts();
  const cats = c.categories.filter((k) => vis.some((p) => p.cat === k.id));
  if (UI.filter !== 'all' && !cats.some((k) => k.id === UI.filter)) UI.filter = 'all';
  const chip = (id, label, n) =>
    `<button class="lx-chip" type="button" data-act="filter-chip" data-cat="${U.esc(id)}" aria-pressed="${UI.filter === id}">${U.esc(label)}<small>${n}</small></button>`;
  const list = R.catalogList();
  return `<div class="lx-shop-bar">
      <div class="lx-chips" role="group" aria-label="Filtrar por categoria">${chip('all', 'Todos', vis.length)}${cats.map((k) => chip(k.id, k.name, vis.filter((p) => p.cat === k.id).length)).join('')}</div>
      <label class="lx-sr" for="lx-sort">Ordenar</label>
      <select class="lx-select" id="lx-sort" data-act="sort">
        ${[
          ['rel', 'Relevância'],
          ['new', 'Novidades'],
          ['low', 'Menor preço'],
          ['high', 'Maior preço'],
          ['off', 'Maior desconto'],
        ]
          .map(([v, l]) => `<option value="${v}"${UI.sort === v ? ' selected' : ''}>${l}</option>`)
          .join('')}
      </select>
    </div>
    <div class="lx-grid">${list.map((p) => R.card(p)).join('') || '<p class="lx-empty">Nenhuma peça nessa categoria por enquanto.</p>'}</div>`;
};
R.catalogo = (c) =>
  `<section class="lx-sec lx-sec--alt" id="catalogo"><div class="lx-wrap">${R.head('catalogo')}<div class="lx-reveal" id="lx-catalog">${R.catalogInner(c)}</div></div></section>`;

R.manifesto = (c) => {
  const p = 'sections.manifesto.';
  return `<section class="lx-sec lx-manifesto" id="manifesto"><div class="lx-wrap lx-man-grid">
    <div class="lx-man-word" aria-hidden="true">${U.esc(c.brand.logoText)}</div>
    <div class="lx-reveal">
      <span class="lx-kicker">${icon('bolt')}<span${ed(p + 'kicker')}>${tx(p + 'kicker')}</span></span>
      <h2 class="lx-h lx-man-title"${ed(p + 'title')}>${tx(p + 'title')}</h2>
      <p class="lx-man-text"${ed(p + 'text', 1)}>${tx(p + 'text')}</p>
      ${c.sections.manifesto.sign || UI.editing ? `<p class="lx-man-sign"${ed(p + 'sign')}>${tx(p + 'sign')}</p>` : ''}
    </div>
  </div></section>`;
};

R.beneficios = (c) => {
  const items = c.sections.beneficios.items || [];
  if (!items.length) return '';
  return `<section class="lx-sec lx-sec--alt" id="beneficios" style="padding-block:calc(clamp(40px,6vw,72px) * var(--space,1))"><div class="lx-wrap"><div class="lx-benefits lx-reveal">${items
    .map(
      (b, i) => `<div class="lx-benefit"><span class="lx-benefit-ic">${icon(b.icon || 'bolt')}</span>
      <h3${ed(`sections.beneficios.items.${i}.title`)}>${tx(`sections.beneficios.items.${i}.title`)}</h3>
      <p${ed(`sections.beneficios.items.${i}.text`)}>${tx(`sections.beneficios.items.${i}.text`)}</p></div>`
    )
    .join('')}</div></div></section>`;
};

R.whats = (c) => {
  const s = c.sections.whats;
  const p = 'sections.whats.';
  return `<section class="lx-sec" id="whats"><div class="lx-wrap"><div class="lx-wa-card lx-reveal">
    <div class="lx-wa-copy">
      <span class="lx-kicker">${icon('bolt')}<span${ed(p + 'kicker')}>${tx(p + 'kicker')}</span></span>
      <h2 class="lx-h lx-wa-title"${ed(p + 'title')}>${tx(p + 'title')}</h2>
      <p${ed(p + 'text', 1)}>${tx(p + 'text')}</p>
      <div class="lx-ctas">
        <a class="lx-btn lx-btn--wa" href="${U.esc(wa())}" target="_blank" rel="noopener">${icon('whatsapp')}<span${ed(p + 'btn')}>${tx(p + 'btn')}</span></a>
        ${c.sections.catalogo.on ? `<a class="lx-btn lx-btn--ghost" href="#catalogo"><span${ed(p + 'btn2')}>${tx(p + 'btn2')}</span>${icon('arrow')}</a>` : ''}
      </div>
    </div>
    ${
      s.chat && s.chat.length
        ? `<div class="lx-chat" aria-hidden="true">
      <div class="lx-chat-head"><span class="lx-chat-av">${icon('bolt')}</span><div><b>${U.esc(c.brand.name)}</b><small>online agora</small></div></div>
      <div class="lx-chat-body">${s.chat.map((m, i) => `<div class="lx-msg lx-msg--${m.from === 'l' ? 'l' : 'c'}"${ed(`sections.whats.chat.${i}.text`)}>${tx(`sections.whats.chat.${i}.text`)}</div>`).join('')}</div>
    </div>`
        : ''
    }
  </div></div></section>`;
};

R.socials = (c) => {
  const so = c.social;
  const list = [
    ['instagram', 'Instagram', so.instagram],
    ['tiktok', 'TikTok', so.tiktok],
    ['whatsapp', 'WhatsApp', waNumber() ? wa() : ''],
    ['youtube', 'YouTube', so.youtube],
    ['facebook', 'Facebook', so.facebook],
    ['x', 'X (Twitter)', so.x],
  ].filter((x) => x[2]);
  return list.map(([ic, label, href]) => `<a href="${U.esc(safeUrl(href))}" target="_blank" rel="noopener" aria-label="${label}">${icon(ic)}</a>`).join('');
};

R.footer = (c) => {
  const s = c.sections.footer;
  if (!s.on) return '';
  const links = R.navLinks(c);
  const ig = String(c.social.instagram || '').match(/instagram\.com\/([^/?#]+)/i);
  return `<footer class="lx-footer" id="contato">
    <div class="lx-wrap lx-foot-grid">
      <div class="lx-foot-brand">
        <a class="lx-foot-logo" href="#top" aria-label="${U.esc(c.brand.name)} — voltar ao topo">${R.logo(c, false)}</a>
        <p${ed('sections.footer.text', 1)}>${tx('sections.footer.text')}</p>
        <div class="lx-socials">${R.socials(c)}</div>
      </div>
      <div><h4>Loja</h4><ul>${links.map((l) => `<li><a href="#${l.id}">${U.esc(l.label)}</a></li>`).join('')}</ul></div>
      <div><h4>Ajuda</h4><ul>${(s.help || [])
        .filter(Boolean)
        .map((h) => `<li><a href="${U.esc(wa(`Olá, ${c.brand.name}! Quero saber sobre: ${h}`))}" target="_blank" rel="noopener">${U.esc(ph(h))}</a></li>`)
        .join('')}</ul></div>
      <div><h4>Atendimento</h4><ul class="lx-foot-contact">
        ${waNumber() ? `<li>${icon('whatsapp')}<a href="${U.esc(wa())}" target="_blank" rel="noopener">${U.esc(fmtPhone(waNumber()))}</a></li>` : ''}
        ${c.social.email ? `<li>${icon('mail')}<a href="mailto:${U.esc(c.social.email)}">${U.esc(c.social.email)}</a></li>` : ''}
        ${ig ? `<li>${icon('instagram')}<a href="${U.esc(safeUrl(c.social.instagram))}" target="_blank" rel="noopener">@${U.esc(ig[1])}</a></li>` : ''}
      </ul></div>
    </div>
    <div class="lx-wrap lx-foot-bottom">
      ${s.payments ? `<div class="lx-pay" aria-label="Formas de pagamento"><span>PIX</span><span>VISA</span><span>MASTERCARD</span><span>ELO</span><span>AMEX</span><span>BOLETO</span></div>` : ''}
      <div><p${ed('sections.footer.copyright')}>${tx('sections.footer.copyright')}</p>${s.legal || UI.editing ? `<p${ed('sections.footer.legal')}>${tx('sections.footer.legal')}</p>` : ''}</div>
    </div>
    <div class="lx-foot-big" data-act="secret" aria-hidden="true">${U.esc(c.brand.logoText)}</div>
  </footer>`;
};

R.page = (c) => {
  const main = c.order
    .filter((id) => c.sections[id] && c.sections[id].on && R[id])
    .map((id) => R[id](c))
    .join('');
  const fab = c.store.floatWhats
    ? `<a class="lx-fab" href="${U.esc(wa())}" target="_blank" rel="noopener" aria-label="Falar no WhatsApp">${icon('whatsapp')}</a>`
    : '';
  return `<div id="top"></div>${R.topbar(c)}${R.header(c)}<main id="conteudo">${main}</main>${R.footer(c)}${fab}`;
};

/* ---------- montagem e comportamentos pós-render ---------- */
/* Tudo já nasce visível (prints, prévias de link e leitores veem a página completa).
   Só o que ainda está abaixo da tela ganha uma animação de subida, disparada um pouco
   antes de aparecer. */
let revealObs = null;
function setupReveal(root) {
  if (revealObs) revealObs.disconnect();
  if (!document.body.classList.contains('lx-anim') || !('IntersectionObserver' in window) || !UI.first) return;
  const vh = window.innerHeight;
  revealObs = new IntersectionObserver(
    (ents) =>
      ents.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('lx-rise');
          revealObs.unobserve(en.target);
        }
      }),
    { rootMargin: '0px 0px 12% 0px' }
  );
  U.$$('.lx-reveal', root).forEach((e) => {
    if (e.getBoundingClientRect().top > vh) revealObs.observe(e);
  });
}

let cdTimer = null;
function setupCountdown() {
  clearInterval(cdTimer);
  const el = document.getElementById('lx-countdown');
  if (!el) return;
  const end = Date.parse(el.dataset.ends || '');
  if (!end) return;
  const tick = () => {
    const ms = end - Date.now();
    if (ms <= 0) {
      el.hidden = true;
      clearInterval(cdTimer);
      return;
    }
    const d = Math.floor(ms / 864e5);
    const h = Math.floor(ms / 36e5) % 24;
    const m = Math.floor(ms / 6e4) % 60;
    const s = Math.floor(ms / 1e3) % 60;
    const p2 = (n) => String(n).padStart(2, '0');
    el.innerHTML = [
      [d, 'dias'],
      [p2(h), 'horas'],
      [p2(m), 'min'],
      [p2(s), 'seg'],
    ]
      .map(([v, l]) => `<div><b>${v}</b><small>${l}</small></div>`)
      .join('');
    el.hidden = false;
  };
  tick();
  cdTimer = setInterval(tick, 1000);
}

R.mount = () => {
  const root = document.getElementById('luxx-root');
  const y = window.scrollY;
  root.innerHTML = R.page(C());
  setupReveal(root);
  setupCountdown();
  SHOP.updateCount();
  if (UI.editing) ADMIN.enableInline();
  if (!UI.first) window.scrollTo(0, y);
  UI.first = false;
};

R.refreshCatalog = () => {
  const el = document.getElementById('lx-catalog');
  if (el) el.innerHTML = R.catalogInner(C());
};
