/* ==========================================================================
   LUXX STORE — estado / configuração
   A configuração "oficial" fica embutida no HTML (#luxx-data).
   O que o dono altera no painel vira um rascunho salvo neste aparelho
   (localStorage) até ele baixar o site atualizado.
   ========================================================================== */
const STATE = (() => {
  const KEY = 'luxx_cfg_v1';
  const EXP_KEY = 'luxx_exported_v1';
  const el = document.getElementById('luxx-data');
  const baseText = el ? el.textContent : '{}';
  let BASE = {};
  try {
    BASE = JSON.parse(baseText);
  } catch (e) {
    console.error('LUXX: configuração inválida', e);
  }
  const baseHash = U.hash(baseText);
  let cfg = null;
  let stale = null;
  let lastSnap = '';
  let saveOk = true;
  const past = [];
  const future = [];
  const subs = [];
  let timer = null;

  function load() {
    const d = U.store.get(KEY);
    if (d && d.cfg && d.base === baseHash) {
      cfg = U.fill(d.cfg, BASE);
    } else {
      if (d && d.cfg) {
        // rascunho feito numa versão anterior do arquivo — a não ser que este arquivo
        // seja justamente o que foi baixado a partir dele (aí não há nada a recuperar)
        const ex = U.store.get(EXP_KEY);
        if (ex && ex.file === baseHash && ex.cfg === U.hash(JSON.stringify(d.cfg))) U.store.del(KEY);
        else stale = d;
      }
      cfg = U.clone(BASE);
    }
    lastSnap = JSON.stringify(cfg);
    return cfg;
  }

  const persist = () => (saveOk = U.store.set(KEY, { base: baseHash, cfg, t: Date.now() }));
  const emit = (why) => subs.forEach((fn) => fn(why));

  function checkpoint() {
    clearTimeout(timer);
    timer = null;
    const snap = JSON.stringify(cfg);
    if (snap === lastSnap) return;
    past.push(lastSnap);
    if (past.length > 80) past.shift();
    future.length = 0;
    lastSnap = snap;
    persist();
    emit('history');
  }

  /* Chamado a cada alteração no painel: atualiza o site na hora e agrupa o histórico */
  function touch(why = 'change') {
    emit(why);
    clearTimeout(timer);
    timer = setTimeout(checkpoint, 650);
  }

  function setCfg(next, why) {
    cfg = next;
    lastSnap = JSON.stringify(cfg);
    persist();
    emit(why || 'replace');
  }

  function undo() {
    checkpoint();
    if (!past.length) return false;
    future.push(lastSnap);
    setCfg(JSON.parse(past.pop()), 'undo');
    return true;
  }
  function redo() {
    if (!future.length) return false;
    past.push(lastSnap);
    setCfg(JSON.parse(future.pop()), 'redo');
    return true;
  }

  function replace(next) {
    checkpoint();
    past.push(lastSnap);
    future.length = 0;
    setCfg(U.fill(next, BASE), 'replace');
  }

  function reset() {
    replace(U.clone(BASE));
    U.store.del(KEY);
  }

  return {
    load,
    get cfg() {
      return cfg;
    },
    get base() {
      return BASE;
    },
    get stale() {
      return stale;
    },
    get saveOk() {
      return saveOk;
    },
    get canUndo() {
      return past.length > 0 || (timer !== null && JSON.stringify(cfg) !== lastSnap);
    },
    get canRedo() {
      return future.length > 0;
    },
    noteExport(fileJson) {
      U.store.set(EXP_KEY, { file: U.hash(fileJson), cfg: U.hash(JSON.stringify(cfg)) });
    },
    hasDraft: () => {
      const d = U.store.get(KEY);
      return !!(d && d.base === baseHash && JSON.stringify(d.cfg) !== JSON.stringify(BASE));
    },
    restoreStale() {
      if (!stale) return;
      replace(stale.cfg);
      stale = null;
    },
    dismissStale() {
      stale = null;
      if (!past.length && JSON.stringify(cfg) === JSON.stringify(BASE)) U.store.del(KEY);
    },
    touch,
    checkpoint,
    undo,
    redo,
    replace,
    reset,
    on: (fn) => subs.push(fn),
  };
})();
