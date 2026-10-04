/* ==========================================================================
   LUXX STORE — tema: cores, fontes, estilo, CSS personalizado
   ========================================================================== */
const THEME = (() => {
  /* Fontes do Google testadas (nome, grupo, pesos disponíveis) */
  const FONTS = [
    ['Anton', 'Impacto / Streetwear', '400'],
    ['Bebas Neue', 'Impacto / Streetwear', '400'],
    ['Oswald', 'Impacto / Streetwear', '400;500;600;700'],
    ['Archivo Black', 'Impacto / Streetwear', '400'],
    ['Big Shoulders Display', 'Impacto / Streetwear', '600;700;800;900'],
    ['Barlow Condensed', 'Impacto / Streetwear', '400;500;600;700;800;900'],
    ['Saira Condensed', 'Impacto / Streetwear', '400;500;600;700;800;900'],
    ['Teko', 'Impacto / Streetwear', '400;500;600;700'],
    ['Bowlby One', 'Impacto / Streetwear', '400'],
    ['Russo One', 'Impacto / Streetwear', '400'],
    ['Six Caps', 'Impacto / Streetwear', '400'],
    ['Unbounded', 'Moderno', '400;600;700;800;900'],
    ['Syne', 'Moderno', '400;600;700;800'],
    ['Space Grotesk', 'Moderno', '400;500;600;700'],
    ['Sora', 'Moderno', '400;600;700;800'],
    ['Outfit', 'Moderno', '400;500;600;700;800;900'],
    ['Montserrat', 'Moderno', '400;500;600;700;800;900'],
    ['Poppins', 'Moderno', '400;500;600;700;800;900'],
    ['Michroma', 'Moderno', '400'],
    ['Orbitron', 'Moderno', '400;500;600;700;800;900'],
    ['Manrope', 'Texto', '400;500;600;700;800'],
    ['Inter', 'Texto', '400;500;600;700;800;900'],
    ['DM Sans', 'Texto', '400;500;600;700;800'],
    ['Plus Jakarta Sans', 'Texto', '400;500;600;700;800'],
    ['Urbanist', 'Texto', '400;500;600;700;800;900'],
    ['Work Sans', 'Texto', '400;500;600;700;800'],
    ['Barlow', 'Texto', '400;500;600;700;800;900'],
    ['Archivo', 'Texto', '400;500;600;700;800;900'],
    ['Rubik', 'Texto', '400;500;600;700;800;900'],
    ['Playfair Display', 'Luxo / Elegante', '400;500;600;700;800;900'],
    ['Cormorant Garamond', 'Luxo / Elegante', '400;500;600;700'],
    ['Cinzel', 'Luxo / Elegante', '400;500;600;700;800;900'],
    ['Bodoni Moda', 'Luxo / Elegante', '400;500;600;700;800;900'],
    ['DM Serif Display', 'Luxo / Elegante', '400'],
    ['Italiana', 'Luxo / Elegante', '400'],
    ['Marcellus', 'Luxo / Elegante', '400'],
    ['Permanent Marker', 'Urbano / Grafite', '400'],
    ['Bungee', 'Urbano / Grafite', '400'],
    ['Rubik Mono One', 'Urbano / Grafite', '400'],
    ['Monoton', 'Urbano / Grafite', '400'],
    ['Righteous', 'Urbano / Grafite', '400'],
    ['Black Ops One', 'Urbano / Grafite', '400'],
    ['Space Mono', 'Urbano / Grafite', '400;700'],
    ['Arial', 'Do aparelho (sem internet)', null],
    ['Helvetica', 'Do aparelho (sem internet)', null],
    ['Impact', 'Do aparelho (sem internet)', null],
    ['Georgia', 'Do aparelho (sem internet)', null],
    ['Courier New', 'Do aparelho (sem internet)', null],
  ];
  const FONT_MAP = Object.fromEntries(FONTS.map((f) => [f[0], f]));

  const FALLBACK = {
    title: "Impact, 'Arial Narrow Bold', sans-serif",
    body: "system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
    logo: "'Arial Black', Impact, sans-serif",
  };

  /* Temas prontos (mudam só o visual, nunca o conteúdo) */
  const PRESETS = {
    raio: {
      label: 'Raio ⚡ (padrão)',
      colors: {
        bg: '#0a0a0a', bg2: '#111111', surface: '#151515', productBg: '#1c1c1c', text: '#f4f2ec', muted: '#9d9d9d', title: '#ffffff',
        accent: '#ffd400', accentText: '#0a0a0a', border: '#272727', btnBg: '#ffd400', btnText: '#0a0a0a', price: '#ffffff',
        badgeBg: '#ffd400', badgeText: '#0a0a0a', headerBg: '#0a0a0a', headerText: '#f4f2ec', topbarBg: '#ffd400', topbarText: '#0a0a0a',
        promoBg: '#ffd400', promoText: '#0a0a0a', footerBg: '#050505', footerText: '#9d9d9d', whatsapp: '#25d366',
      },
      fonts: { title: 'Anton', body: 'Manrope', logo: 'Unbounded', titleWeight: 400, upper: true, italic: false, titleSpacing: 0 },
      style: { radius: 18, btnRadius: 999, glow: true, grain: true, btnStyle: 'solid' },
    },
    ouro: {
      label: 'Luxo dourado',
      colors: {
        bg: '#0b0a08', bg2: '#12100c', surface: '#16130e', productBg: '#1d1912', text: '#f3ede0', muted: '#a39a86', title: '#f8f1e2',
        accent: '#d4af37', accentText: '#0b0a08', border: '#2c261b', btnBg: '#d4af37', btnText: '#0b0a08', price: '#f3ede0',
        badgeBg: '#d4af37', badgeText: '#0b0a08', headerBg: '#0b0a08', headerText: '#f3ede0', topbarBg: '#d4af37', topbarText: '#0b0a08',
        promoBg: '#d4af37', promoText: '#0b0a08', footerBg: '#070605', footerText: '#a39a86', whatsapp: '#25d366',
      },
      fonts: { title: 'Playfair Display', body: 'Manrope', logo: 'Cinzel', titleWeight: 700, upper: false, italic: true, titleSpacing: -0.01 },
      style: { radius: 6, btnRadius: 4, glow: true, grain: true, btnStyle: 'solid' },
    },
    minimal: {
      label: 'Minimal branco',
      colors: {
        bg: '#f6f5f1', bg2: '#eeece6', surface: '#ffffff', productBg: '#ecebe6', text: '#111111', muted: '#6b6b6b', title: '#0a0a0a',
        accent: '#ffd400', accentText: '#0a0a0a', border: '#dedbd3', btnBg: '#0a0a0a', btnText: '#ffd400', price: '#0a0a0a',
        badgeBg: '#0a0a0a', badgeText: '#ffd400', headerBg: '#f6f5f1', headerText: '#111111', topbarBg: '#0a0a0a', topbarText: '#ffd400',
        promoBg: '#ffd400', promoText: '#0a0a0a', footerBg: '#0a0a0a', footerText: '#a1a1a1', whatsapp: '#1faa53',
      },
      fonts: { title: 'Archivo Black', body: 'Inter', logo: 'Archivo Black', titleWeight: 400, upper: true, italic: false, titleSpacing: -0.02 },
      style: { radius: 4, btnRadius: 0, glow: false, grain: false, btnStyle: 'solid' },
    },
    neon: {
      label: 'Neon night',
      colors: {
        bg: '#07070a', bg2: '#0d0d13', surface: '#111118', productBg: '#16161f', text: '#eef0f5', muted: '#8d90a0', title: '#ffffff',
        accent: '#e6ff00', accentText: '#07070a', border: '#23232f', btnBg: '#e6ff00', btnText: '#07070a', price: '#ffffff',
        badgeBg: '#e6ff00', badgeText: '#07070a', headerBg: '#07070a', headerText: '#eef0f5', topbarBg: '#e6ff00', topbarText: '#07070a',
        promoBg: '#e6ff00', promoText: '#07070a', footerBg: '#040406', footerText: '#8d90a0', whatsapp: '#25d366',
      },
      fonts: { title: 'Bebas Neue', body: 'Space Grotesk', logo: 'Rubik Mono One', titleWeight: 400, upper: true, italic: false, titleSpacing: 0.01 },
      style: { radius: 24, btnRadius: 999, glow: true, grain: true, btnStyle: 'outline' },
    },
    concreto: {
      label: 'Concreto urbano',
      colors: {
        bg: '#1b1b19', bg2: '#22221f', surface: '#272724', productBg: '#2f2f2b', text: '#ecebe6', muted: '#a3a29b', title: '#ffffff',
        accent: '#ffc700', accentText: '#141412', border: '#3a3a36', btnBg: '#ffc700', btnText: '#141412', price: '#ffffff',
        badgeBg: '#ffc700', badgeText: '#141412', headerBg: '#1b1b19', headerText: '#ecebe6', topbarBg: '#141412', topbarText: '#ffc700',
        promoBg: '#ffc700', promoText: '#141412', footerBg: '#141412', footerText: '#a3a29b', whatsapp: '#25d366',
      },
      fonts: { title: 'Oswald', body: 'Barlow', logo: 'Black Ops One', titleWeight: 700, upper: true, italic: false, titleSpacing: 0 },
      style: { radius: 2, btnRadius: 2, glow: false, grain: true, btnStyle: 'solid' },
    },
  };

  const famCSS = (name, kind) => {
    const n = String(name || '').replace(/['";{}<>]/g, '').trim();
    return n ? `'${n}', ${FALLBACK[kind]}` : FALLBACK[kind];
  };

  function vars(cfg) {
    const c = cfg.theme.colors;
    const f = cfg.theme.fonts;
    const s = cfg.theme.style;
    const a = c.accent;
    const pb = c.productBg;
    const hi = U.luma(pb) < 0.5 ? U.shade(pb, 0.09) : U.shade(pb, 0.45);
    return (
      ':root{' +
      [
        ['--bg', c.bg], ['--bg2', c.bg2], ['--surface', c.surface], ['--product-bg', pb], ['--product-hi', hi],
        ['--text', c.text], ['--muted', c.muted], ['--title', c.title], ['--accent', a], ['--accent-text', c.accentText],
        ['--border', c.border], ['--btn-bg', c.btnBg], ['--btn-text', c.btnText], ['--price', c.price],
        ['--badge-bg', c.badgeBg], ['--badge-text', c.badgeText], ['--header-bg', U.rgba(c.headerBg, 0.84)], ['--header-solid', c.headerBg],
        ['--header-text', c.headerText], ['--topbar-bg', c.topbarBg], ['--topbar-text', c.topbarText], ['--promo-bg', c.promoBg],
        ['--promo-text', c.promoText], ['--footer-bg', c.footerBg], ['--footer-text', c.footerText], ['--wa', c.whatsapp],
        ['--accent-08', U.rgba(a, 0.08)], ['--accent-12', U.rgba(a, 0.12)], ['--accent-20', U.rgba(a, 0.2)],
        ['--accent-35', U.rgba(a, 0.35)], ['--accent-55', U.rgba(a, 0.55)],
        ['--text-08', U.rgba(c.text, 0.08)], ['--text-20', U.rgba(c.text, 0.22)],
        ['--f-title', famCSS(f.title, 'title')], ['--f-body', famCSS(f.body, 'body')], ['--f-logo', famCSS(f.logo, 'logo')],
        ['--tw', f.titleWeight || 400], ['--ts', f.titleScale || 1], ['--base', (f.base || 16) + 'px'],
        ['--tls', (f.titleSpacing || 0) + 'em'], ['--tt', f.upper ? 'uppercase' : 'none'], ['--tst', f.italic ? 'italic' : 'normal'],
        ['--r', (s.radius ?? 18) + 'px'], ['--br', (s.btnRadius ?? 999) + 'px'], ['--bw', (s.border ?? 1) + 'px'],
        ['--maxw', (s.maxWidth || 1280) + 'px'], ['--space', s.space || 1], ['--cols-d', s.colsDesk || 4], ['--cols-m', s.colsMob || 2],
      ]
        .map(([k, v]) => `${k}:${v}`)
        .join(';') +
      '}'
    );
  }

  /* URL do Google Fonts para as fontes escolhidas */
  function fontsUrl(cfg) {
    const f = cfg.theme.fonts;
    const fams = {};
    const add = (name, weights) => {
      const n = String(name || '').trim();
      if (!n) return;
      const known = FONT_MAP[n];
      if (known && !known[2]) return; // fonte do aparelho
      const avail = known ? known[2].split(';') : ['400', '700'];
      const set = fams[n] || (fams[n] = new Set());
      weights.forEach((w) => {
        const best = avail.reduce((p, x) => (Math.abs(+x - w) < Math.abs(+p - w) ? x : p), avail[0]);
        set.add(best);
      });
    };
    add(f.title, [f.titleWeight || 400]);
    add(f.body, [400, 500, 600, 700, 800]);
    add(f.logo, [800, 900]);
    const parts = Object.entries(fams).map(([n, w]) => {
      const ws = Array.from(w).sort((a, b) => a - b);
      return 'family=' + encodeURIComponent(n).replace(/%20/g, '+') + ':wght@' + ws.join(';');
    });
    return parts.length ? 'https://fonts.googleapis.com/css2?' + parts.join('&') + '&display=swap' : '';
  }

  function ensureEl(id, tag, attrs = {}) {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement(tag);
      el.id = id;
      Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
      document.head.appendChild(el);
    }
    return el;
  }

  let lastFonts = null;
  function applyFonts(cfg) {
    const url = fontsUrl(cfg);
    if (url === lastFonts) return;
    lastFonts = url;
    const link = ensureEl('luxx-fonts', 'link', { rel: 'stylesheet' });
    if (!url) {
      link.removeAttribute('href');
      return;
    }
    link.onerror = () => {
      // fonte digitada à mão com peso inexistente: tenta sem pesos
      const simple = url.replace(/:wght@[\d;]+/g, '');
      if (link.getAttribute('href') !== simple) link.setAttribute('href', simple);
    };
    if (link.getAttribute('href') !== url) link.setAttribute('href', url);
  }

  function faviconHref(cfg) {
    const c = cfg.theme.colors;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="${c.bg}"/><path transform="translate(8 8) scale(2)" d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" fill="${c.accent}"/></svg>`;
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
  }

  function setMeta(name, content, attr = 'name') {
    let m = document.head.querySelector(`meta[${attr}="${name}"]`);
    if (!m) {
      m = document.createElement('meta');
      m.setAttribute(attr, name);
      document.head.appendChild(m);
    }
    m.setAttribute('content', content);
  }

  function apply(cfg) {
    ensureEl('luxx-vars', 'style').textContent = vars(cfg);
    ensureEl('luxx-custom', 'style').textContent = cfg.theme.css || '';
    applyFonts(cfg);
    const s = cfg.theme.style;
    const b = document.body;
    b.classList.toggle('lx-glow', !!s.glow);
    b.classList.toggle('lx-grain', !!s.grain);
    b.classList.toggle('lx-anim', !!s.anim && !U.reducedMotion());
    b.classList.toggle('lx-btn-outline', s.btnStyle === 'outline');
    ensureEl('luxx-icon', 'link', { rel: 'icon' }).setAttribute('href', faviconHref(cfg));
    document.title = cfg.seo.title || cfg.brand.name;
    setMeta('description', cfg.seo.description || '');
    setMeta('theme-color', cfg.theme.colors.headerBg);
    setMeta('og:title', cfg.seo.title || cfg.brand.name, 'property');
    setMeta('og:description', cfg.seo.description || '', 'property');
  }

  /* Aplica um tema pronto mantendo o resto da configuração */
  function preset(cfg, key) {
    const p = PRESETS[key];
    if (!p) return;
    cfg.theme.preset = key;
    Object.assign(cfg.theme.colors, p.colors);
    Object.assign(cfg.theme.fonts, p.fonts);
    Object.assign(cfg.theme.style, p.style);
    cfg.bubble.border = p.colors.accent;
  }

  return { FONTS, FONT_MAP, PRESETS, vars, fontsUrl, apply, preset, faviconHref };
})();
