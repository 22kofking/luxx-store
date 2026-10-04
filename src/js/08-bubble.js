/* ==========================================================================
   LUXX STORE — bolinha de vídeo flutuante (arrastável)
   O visitante pode arrastar a bolinha para qualquer lugar da tela; a posição
   fica salva no aparelho dele. Tocar abre o vídeo grande com som.
   ========================================================================== */
const BUBBLE = (() => {
  const POS_KEY = 'luxx_bubble_pos_v1';
  const HINT_KEY = 'luxx_bubble_hint_v1';
  const CLOSED_KEY = 'luxx_bubble_closed';
  const M = 10; // margem da tela
  let el = null;
  let frame = null;
  let reopenBtn = null;
  let player = null;
  let src = '';
  let sig = '';
  let pos = null; // {fx, fy} frações da área livre
  let px = { x: 0, y: 0 };
  let drag = null;
  let hintShown = false;

  const b = () => C().bubble;
  const isMobile = () => window.matchMedia('(max-width: 767px)').matches;
  const dims = () => {
    const s = U.clamp(+(isMobile() ? b().sizeMobile : b().size) || 100, 56, 260);
    return { w: s, h: b().shape === 'story' ? Math.round(s * 1.6) : s };
  };
  const enabled = () => {
    const c = b();
    if (!c.on || !c.video) return false;
    if (c.closable && U.session.get(CLOSED_KEY) === '1') return false;
    return isMobile() ? c.mobile !== false : c.desktop !== false;
  };
  const sourceUrl = () => {
    const v = b().video;
    if (ytId(v)) return v;
    return MEDIA.url(v);
  };

  /* animação de reserva (peças surgindo) se o aparelho não tocar o vídeo */
  const fallbackHTML = () =>
    `<div class="lx-bubble-fb">${visibleProducts()
      .slice(0, 5)
      .map((p) => `<span>${ART.svg(p.art)}</span>`)
      .join('')}</div>`;
  let failed = false;
  function watchFail(v, box) {
    const ref = b().video;
    let retried = false;
    const toAnim = () => {
      if (box === frame) failed = true;
      box.querySelectorAll('video').forEach((x) => x.remove());
      if (!box.querySelector('.lx-bubble-fb')) box.insertAdjacentHTML('afterbegin', fallbackHTML());
    };
    v.addEventListener('error', () => {
      // vídeo guardado no arquivo: se o navegador recusar o endereço blob:, tenta direto pelos dados
      const data = MEDIA.kind(ref) === 'embed' ? MEDIA.embedText(ref.slice(6)) : '';
      if (!retried && data && /^blob:/.test(v.currentSrc || v.src)) {
        retried = true;
        v.src = data;
        const p = v.play();
        if (p && p.catch) p.catch(() => {});
      } else toAnim();
    });
    // o vídeo padrão é MP4/H.264: se o navegador não toca esse formato, já mostra a reserva
    if (ref === 'media:default-video' && v.canPlayType && !v.canPlayType('video/mp4; codecs="avc1.4D401F"')) toAnim();
  }

  function mediaHTML(url, big) {
    const y = ytId(url);
    if (y) {
      const q = `autoplay=1&mute=${big ? 0 : 1}&loop=1&playlist=${y}&controls=${big ? 1 : 0}&playsinline=1&rel=0&modestbranding=1`;
      return `<iframe src="https://www.youtube-nocookie.com/embed/${y}?${q}" title="Vídeo" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen tabindex="-1"></iframe>`;
    }
    return `<video src="${U.esc(url)}" ${big ? '' : 'muted '}autoplay loop playsinline preload="auto" disablepictureinpicture></video>`;
  }

  /* ---------- posição ---------- */
  function area() {
    const d = dims();
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    return { d, minX: M, minY: M, maxX: Math.max(M, vw - d.w - M), maxY: Math.max(M, vh - d.h - M - 6) };
  }
  function defaultPos() {
    const p = b().pos || 'bl';
    const fx = p.endsWith('r') ? 1 : 0;
    const fy = p.startsWith('t') ? 0.14 : p.startsWith('m') ? 0.5 : 1;
    return { fx, fy };
  }
  function place(x, y) {
    px = { x, y };
    el.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
    const hint = el.querySelector('.lx-bubble-hint');
    if (hint) {
      const left = x < document.documentElement.clientWidth / 2;
      hint.classList.toggle('r', left);
      hint.classList.toggle('l', !left);
    }
  }
  function applyPos() {
    if (!el) return;
    const a = area();
    const p = pos || defaultPos();
    place(a.minX + p.fx * (a.maxX - a.minX), a.minY + p.fy * (a.maxY - a.minY));
  }
  function savePos() {
    const a = area();
    pos = {
      fx: a.maxX > a.minX ? (px.x - a.minX) / (a.maxX - a.minX) : 0,
      fy: a.maxY > a.minY ? (px.y - a.minY) / (a.maxY - a.minY) : 0,
    };
    U.store.set(POS_KEY, pos);
  }

  /* ---------- arrastar ---------- */
  function onDown(e) {
    if (e.button > 0 || e.target.closest('.lx-bubble-x')) return;
    // evita que o navegador comece a "arrastar" um link/imagem que esteja embaixo da bolinha
    e.preventDefault();
    if (document.activeElement !== el) el.focus({ preventScroll: true });
    drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: px.x, oy: px.y, moved: false };
    try {
      el.setPointerCapture(e.pointerId);
    } catch (err) {}
  }
  function onMove(e) {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.sx;
    const dy = e.clientY - drag.sy;
    if (!drag.moved) {
      if (Math.hypot(dx, dy) < 7 || !b().drag) return;
      drag.moved = true;
      el.classList.add('dragging');
      hideHint();
    }
    const a = area();
    place(U.clamp(drag.ox + dx, a.minX, a.maxX), U.clamp(drag.oy + dy, a.minY, a.maxY));
    e.preventDefault();
  }
  function onUp(e) {
    if (!drag || e.pointerId !== drag.id) return;
    const was = drag.moved;
    drag = null;
    el.classList.remove('dragging');
    if (was) savePos();
    else if (e.type === 'pointerup') tap();
  }
  function onKey(e) {
    const step = e.shiftKey ? 60 : 20;
    const k = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
    if (k && b().drag) {
      const a = area();
      place(U.clamp(px.x + k[0], a.minX, a.maxX), U.clamp(px.y + k[1], a.minY, a.maxY));
      savePos();
      e.preventDefault();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      tap();
    }
  }

  function tap() {
    const c = b();
    if (c.tap === 'none') return;
    if (c.tap === 'whatsapp') U.openLink(wa());
    else if (c.tap === 'link') {
      const h = linkTo(c.ctaLink);
      if (isExternal(h)) U.openLink(h);
      else location.hash = h.replace(/^#/, '');
    } else openPlayer();
  }

  function hideHint() {
    const h = el && el.querySelector('.lx-bubble-hint');
    if (h) h.classList.remove('show');
    U.store.set(HINT_KEY, 1);
  }

  /* ---------- montar / atualizar ---------- */
  function build() {
    el = document.createElement('div');
    el.className = 'lx-bubble';
    el.tabIndex = 0;
    el.setAttribute('role', 'button');
    el.innerHTML = `<span class="lx-bubble-ring" aria-hidden="true"></span><div class="lx-bubble-frame"></div><span class="lx-bubble-label"></span>
      <button class="lx-bubble-x" type="button" aria-label="Fechar vídeo">${icon('close')}</button>
      <span class="lx-bubble-hint r" aria-hidden="true">${icon('move')}Arraste-me</span>`;
    frame = el.querySelector('.lx-bubble-frame');
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
    el.addEventListener('keydown', onKey);
    el.addEventListener('contextmenu', (e) => e.preventDefault());
    el.querySelector('.lx-bubble-x').addEventListener('click', (e) => {
      e.stopPropagation();
      U.session.set(CLOSED_KEY, '1');
      update();
    });
    document.body.appendChild(el);
  }

  function showReopen(show) {
    if (show && !reopenBtn) {
      reopenBtn = document.createElement('button');
      reopenBtn.className = 'lx-bubble-reopen';
      reopenBtn.type = 'button';
      reopenBtn.innerHTML = icon('play') + 'Vídeo';
      reopenBtn.addEventListener('click', () => {
        U.session.set(CLOSED_KEY, '0');
        update();
      });
      document.body.appendChild(reopenBtn);
    }
    if (reopenBtn) reopenBtn.hidden = !show;
  }

  function update() {
    const c = b();
    const closedByVisitor = c.on && c.closable && U.session.get(CLOSED_KEY) === '1';
    showReopen(closedByVisitor && !!c.video);
    if (!enabled()) {
      if (el) el.hidden = true;
      return;
    }
    if (!el) build();
    el.hidden = false;
    const d = dims();
    el.style.setProperty('--bs', d.w + 'px');
    el.style.setProperty('--bb', c.border || 'var(--accent)');
    el.style.setProperty('--bbw', (+c.borderWidth || 0) + 'px');
    el.className = `lx-bubble shape-${c.shape || 'circle'}${c.pulse ? ' pulse' : ''}${c.drag ? '' : ' nodrag'}`;
    el.querySelector('.lx-bubble-ring').hidden = !c.ring;
    el.querySelector('.lx-bubble-x').hidden = !c.closable;
    const lab = el.querySelector('.lx-bubble-label');
    lab.textContent = ph(c.label || '');
    lab.hidden = !c.label;
    el.setAttribute('aria-label', `${ph(c.title || 'Vídeo da coleção')} — ${c.tap === 'expand' ? 'toque para assistir' : 'toque para abrir'}${c.drag ? '. Arraste para mudar de lugar' : ''}`);
    const url = sourceUrl();
    const nsig = url + '|' + c.shape;
    if (nsig !== sig) {
      sig = nsig;
      src = url;
      failed = false;
      frame.innerHTML = url ? mediaHTML(url, false) : '';
      const v = frame.querySelector('video');
      if (v) {
        watchFail(v, frame);
        v.muted = true;
        const p = v.play();
        if (p && p.catch) p.catch(() => {});
      }
    }
    applyPos();
    if (c.drag && !hintShown && !U.store.get(HINT_KEY)) {
      hintShown = true;
      const h = el.querySelector('.lx-bubble-hint');
      setTimeout(() => h && h.classList.add('show'), 1800);
      setTimeout(() => h && h.classList.remove('show'), 6500);
    }
  }

  /* ---------- player grande ---------- */
  function openPlayer() {
    const c = b();
    if (!src) return;
    if (!player) {
      player = document.createElement('div');
      player.className = 'lx-player';
      player.setAttribute('role', 'dialog');
      player.setAttribute('aria-modal', 'true');
      player.addEventListener('click', (e) => {
        const t = e.target.closest('[data-bact]');
        if (!t) return;
        const a = t.dataset.bact;
        if (a === 'close') closePlayer();
        if (a === 'cta') {
          closePlayer();
          if (!isExternal(t.getAttribute('href'))) return;
        }
        if (a === 'sound') {
          const v = player.querySelector('video');
          if (v) {
            v.muted = !v.muted;
            t.innerHTML = icon(v.muted ? 'mute' : 'sound');
          }
        }
      });
      document.body.appendChild(player);
    }
    const yt = !!ytId(src);
    const cta = linkTo(c.ctaLink);
    player.setAttribute('aria-label', ph(c.title || 'Vídeo'));
    player.innerHTML = `<div class="lx-player-bg" data-bact="close"></div>
      <div class="lx-player-card">
        <div class="lx-player-media">${mediaHTML(src, true)}
          <div class="lx-player-tools">${yt ? '' : `<button type="button" data-bact="sound" aria-label="Som">${icon('sound')}</button>`}<button type="button" data-bact="close" aria-label="Fechar">${icon('close')}</button></div>
        </div>
        ${
          c.title || c.text || c.cta || c.cta2
            ? `<div class="lx-player-info">
          ${c.title ? `<h3 class="lx-h">${U.esc(ph(c.title))}</h3>` : ''}
          ${c.text ? `<p>${U.esc(ph(c.text))}</p>` : ''}
          <div class="lx-player-btns">
            ${c.cta ? `<a class="lx-btn" href="${U.esc(cta)}"${tgt(cta)} data-bact="cta">${U.esc(ph(c.cta))}</a>` : ''}
            ${c.cta2 ? `<a class="lx-btn lx-btn--wa" href="${U.esc(wa())}" target="_blank" rel="noopener">${icon('whatsapp')}${U.esc(ph(c.cta2))}</a>` : ''}
          </div></div>`
            : ''
        }
      </div>`;
    const small = frame && frame.querySelector('video');
    const v = player.querySelector('video');
    const media = player.querySelector('.lx-player-media');
    if (failed && v) {
      v.remove();
      media.insertAdjacentHTML('afterbegin', fallbackHTML());
      const snd = media.querySelector('[data-bact="sound"]');
      if (snd) snd.remove();
    } else if (v) {
      watchFail(v, media);
      if (small) {
        try {
          v.currentTime = small.currentTime;
        } catch (e) {}
        small.pause();
      }
      v.muted = false;
      const p = v.play();
      if (p && p.catch)
        p.catch(() => {
          v.muted = true;
          v.play().catch(() => {});
          const s = player.querySelector('[data-bact="sound"]');
          if (s) s.innerHTML = icon('mute');
        });
    }
    requestAnimationFrame(() => player.classList.add('open'));
    const x = player.querySelector('[data-bact="close"].lx-x, .lx-player-tools [data-bact="close"]');
    if (x) x.focus({ preventScroll: true });
    document.addEventListener('keydown', escClose);
  }
  function escClose(e) {
    if (e.key === 'Escape') closePlayer();
  }
  function closePlayer() {
    if (!player) return;
    player.classList.remove('open');
    document.removeEventListener('keydown', escClose);
    const v = player.querySelector('video');
    if (v) v.pause();
    setTimeout(() => {
      if (!player.classList.contains('open')) player.innerHTML = '';
    }, 320);
    const small = frame && frame.querySelector('video');
    if (small) small.play().catch(() => {});
    if (el) el.focus({ preventScroll: true });
  }

  function init() {
    pos = U.store.get(POS_KEY, null);
    document.addEventListener(
      'dragstart',
      (e) => {
        if (drag) e.preventDefault();
      },
      true
    );
    update();
    let rt;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        update();
      }, 120);
    });
  }

  function resetPos() {
    pos = null;
    U.store.del(POS_KEY);
    applyPos();
  }

  return { init, update, resetPos, openPlayer };
})();
