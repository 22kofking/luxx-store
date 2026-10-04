/* ==========================================================================
   LUXX STORE — gerar o site atualizado (um único arquivo .html) e restaurar
   ========================================================================== */
const EXPORT = (() => {
  const FILE = 'LUXX STORE SITE.html';

  /* troca referências de mídia em qualquer lugar da configuração */
  function swapRefs(obj, map) {
    if (Array.isArray(obj)) obj.forEach((v, i) => (typeof v === 'string' && v in map ? (obj[i] = map[v]) : swapRefs(v, map)));
    else if (obj && typeof obj === 'object')
      Object.keys(obj).forEach((k) => (typeof obj[k] === 'string' && obj[k] in map ? (obj[k] = map[obj[k]]) : swapRefs(obj[k], map)));
  }
  const safeJSON = (o) => JSON.stringify(o).replace(/</g, '\\u003c');

  async function build() {
    const out = U.clone(STATE.cfg);
    const blocks = {};
    const map = {};
    let n = 0;
    for (const r of MEDIA.refs(out)) {
      const k = MEDIA.kind(r);
      if (k === 'embed') {
        const id = r.slice(6);
        const t = MEDIA.embedText(id);
        if (t) blocks[id] = t;
        else map[r] = '';
      } else if (k === 'idb') {
        const du = await MEDIA.toDataUrl(r);
        if (du) {
          const id = 'm' + ++n + '-' + Date.now().toString(36);
          blocks[id] = du;
          map[r] = 'media:' + id;
        } else map[r] = '';
      }
    }
    swapRefs(out, map);

    const doc = new DOMParser().parseFromString(PRISTINE, 'text/html');
    const head = doc.head;
    const byId = (id, tag, where = head) => {
      let el = doc.getElementById(id);
      if (!el) {
        el = doc.createElement(tag);
        el.id = id;
        where.appendChild(el);
      }
      return el;
    };
    // só os scripts do próprio site vão para o arquivo (nada injetado por navegador ou plataforma)
    U.$$('script', doc).forEach((s) => {
      if (!/^luxx-/.test(s.id) || /^luxx-media-/.test(s.id)) s.remove();
    });
    const app = doc.getElementById('luxx-app');
    Object.entries(blocks).forEach(([id, data]) => {
      const s = doc.createElement('script');
      s.type = 'text/plain';
      s.id = 'luxx-media-' + id;
      s.textContent = data;
      app.parentNode.insertBefore(s, app);
    });
    const json = safeJSON(out);
    doc.getElementById('luxx-data').textContent = json;
    STATE.noteExport(json);
    byId('luxx-vars', 'style').textContent = THEME.vars(out);
    byId('luxx-custom', 'style').textContent = String(out.theme.css || '').replace(/<\/style/gi, '<\\/style');
    const fonts = byId('luxx-fonts', 'link');
    fonts.setAttribute('rel', 'stylesheet');
    const fu = THEME.fontsUrl(out);
    if (fu) fonts.setAttribute('href', fu);
    else fonts.removeAttribute('href');
    const t = doc.querySelector('title') || head.appendChild(doc.createElement('title'));
    t.textContent = out.seo.title || out.brand.name;
    const meta = (attr, name, content) => {
      let m = head.querySelector(`meta[${attr}="${name}"]`);
      if (!m) {
        m = doc.createElement('meta');
        m.setAttribute(attr, name);
        head.appendChild(m);
      }
      m.setAttribute('content', content);
    };
    meta('name', 'description', out.seo.description || '');
    meta('name', 'theme-color', out.theme.colors.headerBg);
    meta('property', 'og:title', out.seo.title || out.brand.name);
    meta('property', 'og:description', out.seo.description || '');
    byId('luxx-icon', 'link').setAttribute('rel', 'icon');
    doc.getElementById('luxx-icon').setAttribute('href', THEME.faviconHref(out));
    return '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
  }

  async function withBusy(btn, fn) {
    const old = btn ? btn.innerHTML : '';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = icon('clock') + 'Gerando…';
    }
    try {
      return await fn();
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = old;
      }
    }
  }

  async function sizeCheck() {
    let total = 0;
    for (const r of MEDIA.refs(STATE.cfg)) total += await MEDIA.size(r);
    if (total > 25 * 1048576) return ADMIN.ask('Arquivo pesado', `Fotos e vídeos somam ${U.fileSize(total)}. O arquivo pode ficar lento para abrir no celular.`, 'Continuar');
    return true;
  }

  const DL_ERR = {
    declined: 'Download cancelado.',
    rate_limited: 'Já tem um download aguardando confirmação.',
    too_large: 'Arquivo grande demais para salvar aqui. Use vídeos e fotos menores.',
  };

  async function download(btn) {
    STATE.checkpoint();
    if (!(await sizeCheck())) return;
    await withBusy(btn, async () => {
      try {
        const html = await build();
        // Aberto como página do claude.ai: o navegador lá não deixa a página baixar sozinha,
        // então quem salva é a plataforma (com confirmação do usuário)
        if (U.inViewer()) {
          const dl = await U.capability('downloads');
          if (!dl) return SHOP.toast('Baixar não está disponível nesta visualização.', 'close');
          try {
            await dl.save({ filename: FILE, data: new Blob([html], { type: 'text/html' }) });
            SHOP.toast(`"${FILE}" salvo (${U.fileSize(html.length)}) ⚡`, 'download');
          } catch (err) {
            SHOP.toast(DL_ERR[err && err.code] || 'Não foi possível salvar o arquivo aqui.', 'close');
          }
          return;
        }
        const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = FILE;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 60000);
        SHOP.toast(`"${FILE}" baixado (${U.fileSize(html.length)}) ⚡`, 'download');
      } catch (e) {
        console.error(e);
        SHOP.toast('Não foi possível gerar o arquivo', 'close');
      }
    });
  }

  async function share(btn) {
    STATE.checkpoint();
    if (!(await sizeCheck())) return;
    await withBusy(btn, async () => {
      try {
        const html = await build();
        const file = new File([html], FILE, { type: 'text/html' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) await navigator.share({ files: [file], title: STATE.cfg.brand.name });
        else throw new Error('share');
      } catch (e) {
        if (e && e.name === 'AbortError') return;
        SHOP.toast('Compartilhamento indisponível aqui — use "Baixar site atualizado"', 'close');
      }
    });
  }

  async function importFile(file) {
    const text = await file.text();
    let next;
    const media = {};
    if (/^\s*\{/.test(text)) next = JSON.parse(text);
    else {
      const doc = new DOMParser().parseFromString(text, 'text/html');
      const d = doc.getElementById('luxx-data');
      if (!d) throw new Error('Esse arquivo não é um site LUXX');
      next = JSON.parse(d.textContent);
      U.$$('script[id^="luxx-media-"]', doc).forEach((s) => (media[s.id.slice(11)] = s.textContent.trim()));
    }
    if (!next || !next.theme || !Array.isArray(next.products)) throw new Error('Arquivo sem configuração válida');
    const map = {};
    for (const r of MEDIA.refs(next)) {
      if (MEDIA.kind(r) !== 'embed') continue;
      const id = r.slice(6);
      const mine = MEDIA.embedText(id);
      const theirs = media[id];
      if (mine && (!theirs || theirs === mine)) continue; // mesma mídia já existe neste arquivo
      const du = theirs || '';
      if (!du) {
        map[r] = '';
        continue;
      }
      const { ref } = await MEDIA.save(MEDIA.dataUrlToBlob(du), 'imp');
      map[r] = ref;
    }
    swapRefs(next, map);
    await MEDIA.preload(next);
    STATE.replace(next);
  }

  return { build, download, share, importFile };
})();
