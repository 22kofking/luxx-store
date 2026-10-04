/* ==========================================================================
   LUXX STORE — utilitários
   ========================================================================== */
const U = {};

U.$ = (sel, root = document) => root.querySelector(sel);
U.$$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

U.esc = (s) =>
  String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

U.clone = (o) => JSON.parse(JSON.stringify(o));

U.debounce = (fn, ms) => {
  let t;
  return (...a) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), ms);
  };
};

U.clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/* Lê/escreve caminhos tipo "content.hero.title" ou "products.3.name" */
U.get = (obj, path) => String(path).split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
U.set = (obj, path, val) => {
  const ks = String(path).split('.');
  let o = obj;
  for (let i = 0; i < ks.length - 1; i++) {
    if (o[ks[i]] == null || typeof o[ks[i]] !== 'object') o[ks[i]] = /^\d+$/.test(ks[i + 1]) ? [] : {};
    o = o[ks[i]];
  }
  o[ks[ks.length - 1]] = val;
};

/* Mescla "por baixo": completa o que faltar em `target` com `base` (sem sobrescrever) */
U.fill = (target, base) => {
  if (Array.isArray(base)) return Array.isArray(target) ? target : U.clone(base);
  if (base && typeof base === 'object') {
    const out = target && typeof target === 'object' && !Array.isArray(target) ? target : {};
    for (const k of Object.keys(base)) out[k] = U.fill(out[k], base[k]);
    return out;
  }
  return target === undefined ? base : target;
};

/* Hash simples (não criptográfico) — só para não deixar o PIN em texto puro */
U.hash = (s) => {
  let h = 2166136261;
  for (const ch of String(s)) {
    h ^= ch.codePointAt(0);
    h = Math.imul(h, 16777619);
  }
  return 'h' + (h >>> 0).toString(36);
};

/* ---------- dinheiro ---------- */
const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
U.money = (v) => BRL.format(Number(v) || 0).replace(/ /g, ' ');
U.num = (v) => {
  if (typeof v === 'number') return v;
  const s = String(v || '').replace(/[^\d,.-]/g, '');
  if (!s) return 0;
  // "1.299,90" → 1299.90 | "1299.90" → 1299.90
  const n = s.includes(',') ? s.replace(/\./g, '').replace(',', '.') : s;
  return parseFloat(n) || 0;
};

/* ---------- cores ---------- */
U.hexToRgb = (hex) => {
  let h = String(hex || '').trim().replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (!/^[0-9a-f]{6}$/i.test(h)) return { r: 0, g: 0, b: 0 };
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
};
U.rgbToHex = ({ r, g, b }) =>
  '#' + [r, g, b].map((v) => U.clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('');
U.mix = (a, b, t) => {
  const A = U.hexToRgb(a);
  const B = U.hexToRgb(b);
  return U.rgbToHex({ r: A.r + (B.r - A.r) * t, g: A.g + (B.g - A.g) * t, b: A.b + (B.b - A.b) * t });
};
/* amt < 0 escurece, amt > 0 clareia */
U.shade = (hex, amt) => (amt < 0 ? U.mix(hex, '#000000', -amt) : U.mix(hex, '#ffffff', amt));
U.luma = (hex) => {
  const { r, g, b } = U.hexToRgb(hex);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
};
U.rgba = (hex, a) => {
  const { r, g, b } = U.hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
};
U.isHex = (s) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(String(s || '').trim());
U.normHex = (s) => {
  let h = String(s || '').trim();
  if (!h.startsWith('#')) h = '#' + h;
  if (!U.isHex(h)) return null;
  if (h.length === 4) h = '#' + h.slice(1).split('').map((c) => c + c).join('');
  return h.toLowerCase();
};

/* ---------- armazenamento seguro (pode falhar em aba anônima/preview) ---------- */
U.store = {
  get(k, fb = null) {
    try {
      const v = localStorage.getItem(k);
      return v == null ? fb : JSON.parse(v);
    } catch (e) {
      return fb;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
      return true;
    } catch (e) {
      return false;
    }
  },
  del(k) {
    try {
      localStorage.removeItem(k);
    } catch (e) {}
  },
};
U.session = {
  get(k) {
    try {
      return sessionStorage.getItem(k);
    } catch (e) {
      return null;
    }
  },
  set(k, v) {
    try {
      sessionStorage.setItem(k, v);
    } catch (e) {}
  },
};

U.copy = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch (e2) {}
    ta.remove();
    return ok;
  }
};

U.reducedMotion = () => {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) {
    return false;
  }
};

U.fileSize = (b) => (b > 1048576 ? (b / 1048576).toFixed(1).replace('.', ',') + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB');
