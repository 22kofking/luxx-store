/* ==========================================================================
   LUXX STORE — mídia (fotos e vídeos)
   Referências usadas na configuração:
     ''               → nada (usa ilustração)
     'media:<id>'     → arquivo embutido no próprio HTML (<script id="luxx-media-<id>">)
     'idb:<chave>'    → arquivo enviado pelo painel e salvo neste aparelho (IndexedDB)
     'https://...'    → link externo (ou caminho relativo)
   ========================================================================== */
const MEDIA = (() => {
  const DBN = 'luxx-media';
  const ST = 'files';
  const urls = new Map(); // ref → URL pronta para usar em src
  const mem = new Map(); // fallback quando o IndexedDB não está disponível
  let dbp = null;

  function db() {
    if (dbp) return dbp;
    dbp = new Promise((res, rej) => {
      try {
        const r = indexedDB.open(DBN, 1);
        r.onupgradeneeded = () => r.result.createObjectStore(ST);
        r.onsuccess = () => res(r.result);
        r.onerror = () => rej(r.error);
        r.onblocked = () => rej(new Error('blocked'));
      } catch (e) {
        rej(e);
      }
    });
    dbp.catch(() => {});
    return dbp;
  }
  async function tx(mode, fn) {
    const d = await db();
    return new Promise((res, rej) => {
      const t = d.transaction(ST, mode);
      const req = fn(t.objectStore(ST));
      t.oncomplete = () => res(req && req.result);
      t.onerror = () => rej(t.error);
      t.onabort = () => rej(t.error);
    });
  }
  const idbPut = (k, blob) => tx('readwrite', (s) => s.put(blob, k));
  const idbGet = (k) => tx('readonly', (s) => s.get(k));
  const idbDel = (k) => tx('readwrite', (s) => s.delete(k));

  const kind = (ref) => {
    const r = String(ref || '');
    if (!r) return 'none';
    if (r.startsWith('media:')) return 'embed';
    if (r.startsWith('idb:')) return 'idb';
    return 'url';
  };

  function embedText(id) {
    const el = document.getElementById('luxx-media-' + id);
    return el ? el.textContent.trim() : '';
  }

  function dataUrlToBlob(du) {
    const m = /^data:([^;,]+)?(;base64)?,(.*)$/s.exec(du);
    if (!m) return null;
    const type = m[1] || 'application/octet-stream';
    if (!m[2]) return new Blob([decodeURIComponent(m[3])], { type });
    const bin = atob(m[3]);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type });
  }

  const blobToDataUrl = (blob) =>
    new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result);
      fr.onerror = () => rej(fr.error);
      fr.readAsDataURL(blob);
    });

  async function getBlob(ref) {
    const k = kind(ref);
    if (k === 'embed') {
      const t = embedText(ref.slice(6));
      return t ? dataUrlToBlob(t) : null;
    }
    if (k === 'idb') {
      const key = ref.slice(4);
      if (mem.has(key)) return mem.get(key);
      try {
        return (await idbGet(key)) || null;
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  /* Resolve e guarda em cache a URL de uma referência */
  async function resolve(ref) {
    const k = kind(ref);
    if (k === 'none') return '';
    if (k === 'url') return ref;
    if (urls.has(ref)) return urls.get(ref);
    const blob = await getBlob(ref);
    if (!blob) {
      urls.set(ref, '');
      return '';
    }
    const u = URL.createObjectURL(blob);
    urls.set(ref, u);
    return u;
  }

  /* Versão síncrona (só funciona depois do preload/resolve) */
  function url(ref) {
    const k = kind(ref);
    if (k === 'none') return '';
    if (k === 'url') return ref;
    return urls.get(ref) || '';
  }

  /* Todas as referências de mídia usadas na configuração */
  function refs(cfg) {
    const out = [];
    const add = (r) => r && out.push(r);
    add(cfg.brand && cfg.brand.logoImg);
    add(cfg.sections && cfg.sections.hero && cfg.sections.hero.img);
    (cfg.categories || []).forEach((c) => add(c.img));
    (cfg.products || []).forEach((p) => add(p.img));
    add(cfg.bubble && cfg.bubble.video);
    return Array.from(new Set(out.filter((r) => kind(r) !== 'url')));
  }

  async function preload(cfg) {
    await Promise.all(refs(cfg).map((r) => resolve(r).catch(() => '')));
  }

  /* Salva um arquivo enviado pelo painel. Retorna a referência 'idb:...' */
  async function save(blob, prefix = 'f') {
    const key = prefix + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    let persisted = true;
    try {
      await idbPut(key, blob);
    } catch (e) {
      mem.set(key, blob);
      persisted = false;
    }
    const ref = 'idb:' + key;
    urls.set(ref, URL.createObjectURL(blob));
    return { ref, persisted };
  }

  /* Apaga do aparelho fotos/vídeos enviados que nenhuma configuração usa mais.
     (o histórico de desfazer não sobrevive a um recarregamento, então nada se perde) */
  async function gc(cfgs) {
    if (typeof indexedDB === 'undefined') return;
    const keep = new Set();
    cfgs.filter(Boolean).forEach((c) => refs(c).forEach((r) => kind(r) === 'idb' && keep.add(r.slice(4))));
    try {
      const keys = await tx('readonly', (s) => s.getAllKeys());
      await Promise.all((keys || []).filter((k) => !keep.has(k)).map((k) => idbDel(k)));
    } catch (e) {}
  }

  /* Reduz fotos grandes antes de salvar (mantém transparência de PNG) */
  async function shrinkImage(file, max = 1400) {
    if (!/^image\/(png|jpe?g|webp)$/i.test(file.type)) return file;
    let img;
    try {
      img = await new Promise((res, rej) => {
        const i = new Image();
        const u = URL.createObjectURL(file);
        i.onload = () => {
          URL.revokeObjectURL(u);
          res(i);
        };
        i.onerror = (e) => {
          URL.revokeObjectURL(u);
          rej(e);
        };
        i.src = u;
      });
    } catch (e) {
      return file;
    }
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const sc = Math.min(1, max / Math.max(w, h));
    if (sc === 1 && file.size < 700 * 1024) return file;
    const cv = document.createElement('canvas');
    cv.width = Math.round(w * sc);
    cv.height = Math.round(h * sc);
    cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
    const jpeg = /jpe?g/i.test(file.type);
    const out = await new Promise((res) => cv.toBlob(res, jpeg ? 'image/jpeg' : 'image/webp', 0.86));
    if (!out) return file;
    // navegador sem suporte a webp devolve png — tudo bem
    return out.size < file.size ? out : file;
  }

  async function toDataUrl(ref) {
    const blob = await getBlob(ref);
    return blob ? blobToDataUrl(blob) : '';
  }

  async function size(ref) {
    const k = kind(ref);
    if (k === 'embed') return Math.round((embedText(ref.slice(6)).length * 3) / 4);
    const b = await getBlob(ref);
    return b ? b.size : 0;
  }

  return { kind, resolve, url, refs, preload, save, gc, shrinkImage, toDataUrl, size, getBlob, dataUrlToBlob, embedText };
})();

/* YouTube: aceita links normais, youtu.be e Shorts */
const ytId = (u) => {
  const m = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/i.exec(String(u || ''));
  return m ? m[1] : '';
};
