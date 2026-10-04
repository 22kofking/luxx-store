/* ==========================================================================
   LUXX STORE — pesquisa de produtos (lupa no cabeçalho)
   Ignora acentos e maiúsculas, entende plural/singular e alguns sinônimos.
   ========================================================================== */
const SEARCH = (() => {
  let el = null;
  let input = null;
  let list = null;
  let isOpen = false;
  let lastFocus = null;

  const norm = (s) =>
    String(s || '')
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
      .toLowerCase();

  /* palavras que o cliente usa → como as peças costumam ser chamadas */
  const SYN = {
    camisa: 'camiseta', blusa: 'moletom', casaco: 'jaqueta', jaqueta: 'corta-vento', moleton: 'moletom', hoodie: 'moletom',
    capuz: 'hoodie', chinelo: 'slide', sandalia: 'slide', calcado: 'tenis', sapato: 'tenis', sneaker: 'tenis', short: 'bermuda',
    shorts: 'bermuda', cordao: 'corrente', colar: 'corrente', bolsa: 'bag', pochete: 'bag', mochila: 'bag', chapeu: 'bone',
    jogger: 'calca',
  };
  const variants = (w) => {
    const out = [w];
    if (w.length > 3 && w.endsWith('es')) out.push(w.slice(0, -2));
    if (w.length > 2 && w.endsWith('s')) out.push(w.slice(0, -1));
    out.slice().forEach((v) => SYN[v] && out.push(SYN[v]));
    return out;
  };

  function find(q) {
    const words = norm(q).split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    return visibleProducts()
      .map((p) => {
        const name = norm(p.name);
        const nameWords = name.split(/[\s-]+/);
        const cat = norm((catOf(p.cat) || {}).name);
        const desc = norm(p.desc);
        let score = 0;
        for (const w of words) {
          const vs = variants(w);
          if (vs.some((v) => nameWords.some((x) => x.startsWith(v)))) score += 10;
          else if (vs.some((v) => name.includes(v))) score += 6;
          else if (vs.some((v) => cat.includes(v))) score += 4;
          else if (w.length > 2 && vs.some((v) => desc.includes(v))) score += 1;
          else return null; // toda palavra digitada precisa aparecer em algum lugar
        }
        if (nameWords[0].startsWith(words[0])) score += 3;
        if (p.soldout) score -= 2;
        return { p, score };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.p);
  }

  /* destaca no nome o trecho digitado (sem perder os acentos do nome) */
  function mark(name, q) {
    const words = norm(q).split(/\s+/).filter((w) => w.length > 1);
    const chars = Array.from(name);
    const flat = chars.map((ch) => {
      const n = norm(ch);
      return n.length === 1 ? n : ch.toLowerCase();
    });
    const plain = flat.join('');
    const hit = new Array(chars.length).fill(false);
    words.forEach((w) => {
      // só o que foi digitado (e plural), sem sinônimos
      variants(w)
        .filter((v) => w.startsWith(v))
        .forEach((v) => {
        let i = plain.indexOf(v);
          while (i > -1) {
            for (let k = i; k < i + v.length; k++) hit[k] = true;
            i = plain.indexOf(v, i + v.length);
          }
        });
    });
    let out = '';
    let on = false;
    chars.forEach((ch, i) => {
      if (hit[i] !== on) {
        out += hit[i] ? '<mark>' : '</mark>';
        on = hit[i];
      }
      out += U.esc(ch);
    });
    return out + (on ? '</mark>' : '');
  }

  const row = (p, q) => {
    const cat = catOf(p.cat);
    return `<button class="lx-sr-row" type="button" data-sact="go" data-pid="${U.esc(p.id)}">
      <span class="lx-sr-img">${productMedia(p, 'art')}</span>
      <span class="lx-sr-info"><b>${q ? mark(p.name, q) : U.esc(p.name)}</b><small>${U.esc(cat ? cat.name : '')}${p.soldout ? ' · Esgotado' : ''}</small></span>
      <span class="lx-sr-price">${+p.old > +p.price ? `<s>${U.money(p.old)}</s>` : ''}${U.money(p.price)}</span>
    </button>`;
  };

  function draw() {
    const q = input.value.trim();
    if (!q) {
      const vis = visibleProducts();
      const cats = C().categories.filter((k) => vis.some((p) => p.cat === k.id));
      const top = vis.filter((p) => p.best && !p.soldout).slice(0, 4);
      list.innerHTML = `${
        cats.length
          ? `<p class="lx-sr-label">Buscas rápidas</p><div class="lx-sr-chips">${cats
              .map((k) => `<button class="lx-chip" type="button" data-sact="fill" data-q="${U.esc(k.name)}">${U.esc(k.name)}</button>`)
              .join('')}</div>`
          : ''
      }${top.length ? `<p class="lx-sr-label">Mais procurados</p>${top.map((p) => row(p)).join('')}` : ''}`;
      return;
    }
    const res = find(q);
    list.innerHTML = res.length
      ? `<p class="lx-sr-label" aria-live="polite">${res.length} ${res.length === 1 ? 'peça encontrada' : 'peças encontradas'}</p>${res.map((p) => row(p, q)).join('')}`
      : `<div class="lx-sr-empty" aria-live="polite"><p>Nenhuma peça encontrada para <b>“${U.esc(q)}”</b>.</p><p>Confira a escrita ou pergunte pra gente: às vezes a peça chegou e ainda não está no site.</p>
          <a class="lx-btn lx-btn--wa" href="${U.esc(wa(`Olá, ${C().brand.name}! Vocês têm ${q}?`))}" target="_blank" rel="noopener">${icon('whatsapp')}Perguntar no WhatsApp</a></div>`;
  }

  function build() {
    el = document.createElement('div');
    el.className = 'lx-search';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', 'Pesquisar produtos');
    el.inert = true;
    el.innerHTML = `<div class="lx-search-top"><div class="lx-search-in">
        <form class="lx-search-bar" role="search" data-sform="1">
          ${icon('search')}
          <label class="lx-sr" for="lx-q">Pesquisar produtos</label>
          <input id="lx-q" type="search" placeholder="Buscar: tênis, moletom, boné…" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="search">
          <button class="lx-search-x" type="button" data-sact="close" aria-label="Fechar pesquisa">${icon('close')}</button>
        </form></div></div>
      <div class="lx-search-body"><div class="lx-search-in" id="lx-search-list"></div></div>`;
    document.body.appendChild(el);
    input = el.querySelector('#lx-q');
    list = el.querySelector('#lx-search-list');
    input.addEventListener('input', draw);
    el.querySelector('form').addEventListener('submit', (e) => {
      e.preventDefault();
      input.blur(); // fecha o teclado para ver os resultados
    });
    el.addEventListener('click', (e) => {
      const t = e.target.closest('[data-sact]');
      if (!t) return;
      if (t.dataset.sact === 'close') close();
      else if (t.dataset.sact === 'fill') {
        input.value = t.dataset.q;
        draw();
      } else if (t.dataset.sact === 'go') {
        close(true);
        SHOP.view(t.dataset.pid);
      }
    });
  }

  function open() {
    if (!el) build();
    lastFocus = document.activeElement;
    el.inert = false;
    el.classList.add('open');
    isOpen = true;
    document.documentElement.style.overflow = 'hidden';
    draw();
    input.focus(); // na mesma hora do toque, para o teclado do celular abrir
    input.select();
  }

  function close(keepFocus) {
    if (!isOpen) return;
    isOpen = false;
    el.classList.remove('open');
    el.inert = true;
    document.documentElement.style.overflow = '';
    if (!keepFocus && lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  function init() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) close();
      // atalho no computador: "/" abre a pesquisa
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable;
      if (e.key === '/' && !typing && !isOpen && C().store.search !== false && !document.getElementById('lx-admin')?.classList.contains('open')) {
        e.preventDefault();
        open();
      }
    });
  }

  return { init, open, close, find, get isOpen() { return isOpen; } };
})();
