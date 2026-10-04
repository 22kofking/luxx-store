/* ==========================================================================
   LUXX STORE — inicialização
   ========================================================================== */
async function boot() {
  const root = document.getElementById('luxx-root');
  try {
    STATE.load();
    THEME.apply(C());
    await MEDIA.preload(C());
    R.mount();
    SHOP.init();
    BUBBLE.init();
    ADMIN.init();
    // limpeza de arquivos antigos só no aparelho do dono (visitantes nunca enviam mídia)
    if (U.store.get('luxx_owner_v1')) MEDIA.gc([C(), STATE.stale && STATE.stale.cfg]);
  } catch (err) {
    console.error('LUXX:', err);
    if (root && !root.children.length)
      root.innerHTML = '<p class="lx-noscript">Ops! Não foi possível carregar o site. Tente abrir no Chrome ou Safari.</p>';
    return;
  }

  const rerender = U.debounce(async () => {
    await MEDIA.preload(C());
    R.mount();
    BUBBLE.update();
  }, 140);

  STATE.on((why) => {
    if (why === 'history') return;
    THEME.apply(C());
    if (why === 'inline') return;
    rerender();
  });
}

boot();
