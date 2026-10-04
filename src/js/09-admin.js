/* ==========================================================================
   LUXX STORE — PAINEL DO DONO
   Abrir: toque 5x no "LUXX" gigante do rodapé, ou abra o site com #admin no fim do link.
   ========================================================================== */
const ADMIN = (() => {
  const OWNER_KEY = 'luxx_owner_v1';
  const TAB_KEY = 'luxx_admin_tab';
  const DEFAULT_PIN = U.hash('luxx');
  const esc = U.esc;
  const cfg = () => STATE.cfg;
  const g = (p) => U.get(cfg(), p);
  let root = null;
  let body = null;
  let tab = U.store.get(TAB_KEY, 'inicio') || 'inicio';
  let fab = null;
  let peekBar = null;
  let editBar = null;
  let isOpen = false;
  let peeking = false;
  let search = '';
  const opened = { produtos: null, categorias: null, secoes: null };
  const customFont = new Set();
  let pendingRender = false;

  const TABS = [
    ['inicio', 'Início', 'bolt'],
    ['cores', 'Cores', 'palette'],
    ['fontes', 'Fontes', 'type'],
    ['estilo', 'Estilo', 'layout'],
    ['secoes', 'Seções e textos', 'grid'],
    ['produtos', 'Catálogo', 'tag'],
    ['categorias', 'Categorias', 'filter'],
    ['video', 'Vídeo', 'video'],
    ['marca', 'Marca e contato', 'star'],
    ['publicar', 'Publicar', 'rocket'],
  ];

  const SECTION_LABEL = {
    hero: 'Banner principal',
    marquee: 'Faixa animada',
    novidades: 'Novidades',
    categorias: 'Categorias',
    promo: 'Promoção (cupom)',
    maisvendidos: 'Mais vendidos',
    catalogo: 'Catálogo completo',
    manifesto: 'Manifesto da marca',
    beneficios: 'Benefícios',
    whats: 'Chamada do WhatsApp',
  };

  /* ====================================================================== */
  /* Campos de formulário                                                    */
  /* ====================================================================== */
  const hex6 = (v, fb = '#000000') => U.normHex(v) || fb;
  const hint = (h) => (h ? `<small class="lxa-hint">${h}</small>` : '');
  const fmtOut = (v, unit) => {
    const n = +v;
    if (unit === 'x') return n.toFixed(2).replace('.', ',') + 'x';
    if (unit === '%') return Math.round(n * 100) + '%';
    if (unit === 'em') return n.toFixed(2).replace('.', ',') + 'em';
    return (Number.isInteger(n) ? n : n.toFixed(2).replace('.', ',')) + (unit || '');
  };
  const F = {
    text: (p, label, o = {}) =>
      `<label class="lxa-field"><span>${label}</span><input type="text" data-p="${p}"${o.rrBlur ? ' data-rr-blur="1"' : ''} value="${esc(g(p) == null ? '' : g(p))}"${o.ph ? ` placeholder="${esc(o.ph)}"` : ''}${
        o.im ? ` inputmode="${o.im}"` : ''
      }${o.max ? ` maxlength="${o.max}"` : ''} autocomplete="off">${hint(o.hint)}</label>`,
    money: (p, label, o = {}) =>
      `<label class="lxa-field"><span>${label}</span><input type="text" data-p="${p}" data-t="money" inputmode="decimal" value="${
        g(p) ? (+g(p)).toFixed(2).replace('.', ',') : ''
      }" placeholder="${esc(o.ph || '0,00')}" autocomplete="off">${hint(o.hint)}</label>`,
    num: (p, label, o = {}) =>
      `<label class="lxa-field"><span>${label}</span><input type="number" data-p="${p}" data-t="num" value="${esc(g(p) == null ? '' : g(p))}" min="${o.min ?? ''}" max="${
        o.max ?? ''
      }" step="${o.step || 1}" inputmode="numeric">${hint(o.hint)}</label>`,
    area: (p, label, o = {}) =>
      `<label class="lxa-field"><span>${label}</span><textarea data-p="${p}" rows="${o.rows || 3}"${o.cls ? ` class="${o.cls}"` : ''}${
        o.ph ? ` placeholder="${esc(o.ph)}"` : ''
      } spellcheck="${o.cls ? 'false' : 'true'}">${esc(g(p) == null ? '' : g(p))}</textarea>${hint(o.hint)}</label>`,
    list: (p, label, o = {}) =>
      `<label class="lxa-field"><span>${label}</span><textarea data-p="${p}" data-t="list" rows="${o.rows || 4}">${esc((g(p) || []).join('\n'))}</textarea>${hint(
        o.hint || 'Uma por linha.'
      )}</label>`,
    range: (p, label, min, max, step, unit) =>
      `<label class="lxa-field"><span>${label}<b data-out="${p}">${fmtOut(g(p), unit)}</b></span><input type="range" data-p="${p}" data-t="num" data-unit="${
        unit || ''
      }" min="${min}" max="${max}" step="${step}" value="${esc(g(p))}"></label>`,
    toggle: (p, label, h, rr) =>
      `<label class="lxa-switch"><span>${label}${h ? `<small>${h}</small>` : ''}</span><input type="checkbox" data-p="${p}" data-t="bool"${rr ? ' data-rr="1"' : ''}${
        g(p) ? ' checked' : ''
      }><i></i></label>`,
    select: (p, label, opts, o = {}) =>
      `<label class="lxa-field"><span>${label}</span><select data-p="${p}"${o.t ? ` data-t="${o.t}"` : ''}${o.rr ? ' data-rr="1"' : ''}>${opts
        .map(([v, l]) => `<option value="${esc(v)}"${String(g(p)) === String(v) ? ' selected' : ''}>${esc(l)}</option>`)
        .join('')}</select>${hint(o.hint)}</label>`,
    color: (p, label, fb) =>
      `<div class="lxa-field"><span>${label}</span><div class="lxa-color-row"><input type="color" data-p="${p}" data-t="color" value="${hex6(
        g(p),
        fb
      )}" aria-label="${esc(label)}"><input type="text" data-p="${p}" data-t="hex" value="${esc(g(p) || fb || '')}" maxlength="7" spellcheck="false" autocomplete="off" aria-label="${esc(
        label
      )} (código)"></div></div>`,
    font: (p, label) => {
      const v = g(p) || '';
      const known = !!THEME.FONT_MAP[v] && !customFont.has(p);
      const groups = {};
      THEME.FONTS.forEach(([n, grp]) => (groups[grp] = groups[grp] || []).push(n));
      const opts = Object.entries(groups)
        .map(([grp, ns]) => `<optgroup label="${esc(grp)}">${ns.map((n) => `<option value="${esc(n)}"${n === v ? ' selected' : ''}>${esc(n)}</option>`).join('')}</optgroup>`)
        .join('');
      return `<div class="lxa-field"><span>${label}</span><select data-font="${p}">${opts}<option value="__custom"${known ? '' : ' selected'}>Outra fonte do Google (digitar o nome)…</option></select>
        ${known ? '' : `<input type="text" data-p="${p}" value="${esc(THEME.FONT_MAP[v] ? '' : v)}" placeholder="Nome exato, ex.: Bricolage Grotesque" style="margin-top:8px" autocomplete="off">${hint('Veja os nomes em fonts.google.com')}`}</div>`;
    },
    media: (p, label, o = {}) => {
      const v = g(p) || '';
      const k = MEDIA.kind(v);
      const url = MEDIA.url(v);
      return `<div class="lxa-field"><span>${label}</span><div class="lxa-media">
        <div class="lxa-media-prev">${url ? `<img src="${esc(url)}" alt="">` : icon('image')}</div>
        <div class="lxa-btns" style="flex:1">
          <span class="lxa-btn lxa-btn--sm lxa-file">${icon('upload')}${v ? 'Trocar foto' : 'Enviar foto'}<input type="file" accept="image/*" data-upload="${p}"></span>
          ${v ? `<button type="button" class="lxa-btn lxa-btn--sm lxa-btn--red" data-a="media-clear" data-p="${p}">${icon('trash')}Remover</button>` : ''}
        </div></div>
        ${
          k === 'url' || !v
            ? `<input type="text" data-p="${p}" data-rr-blur="1" value="${k === 'url' ? esc(v) : ''}" placeholder="ou cole o link de uma imagem (https://...)" style="margin-top:8px" autocomplete="off">`
            : hint(k === 'idb' ? 'Foto salva neste aparelho — vai junto quando você baixar o site.' : 'Foto guardada dentro do arquivo do site.')
        }${hint(o.hint)}</div>`;
    },
    art: (p) => {
      const a = g(p) || {};
      const types = Object.entries(ART.TYPES).map(([k, v]) => [k, v.label]);
      return `<div class="lxa-art-prev"><div data-artprev="${p}">${ART.svg(a)}</div><div style="flex:1">${F.select(p + '.type', 'Tipo de peça', types, { rr: 1 })}</div></div>
        <div class="lxa-row">${F.color(p + '.color', 'Cor da peça', '#1c1c1c')}${F.color(p + '.detail', 'Cor do detalhe', '#ffd400')}</div>
        ${['tee', 'hoodie', 'crewneck', 'jacket'].includes(a.type) ? F.select(p + '.print', 'Estampa', Object.entries(ART.PRINTS)) : ''}
        ${a.type === 'sneaker' ? F.color(p + '.sole', 'Cor do solado', '#f1efe9') : ''}
        ${a.type === 'slide' ? F.color(p + '.strapColor', 'Cor da tira', hex6(a.color, '#1c1c1c')) : ''}`;
    },
    objlist: (p, fields, tpl, o = {}) => {
      const arr = g(p) || [];
      const rows = arr
        .map(
          (it, i) =>
            `<div class="lxa-objrow ${o.cls || ''}">${fields
              .map(([k, label, kind, options]) =>
                kind === 'select'
                  ? `<select data-p="${p}.${i}.${k}" aria-label="${esc(label)}">${options
                      .map(([v, l]) => `<option value="${esc(v)}"${String(it[k]) === String(v) ? ' selected' : ''}>${esc(l)}</option>`)
                      .join('')}</select>`
                  : `<input type="text" data-p="${p}.${i}.${k}" value="${esc(it[k] == null ? '' : it[k])}" placeholder="${esc(label)}" aria-label="${esc(label)}" autocomplete="off">`
              )
              .join('')}<button type="button" class="lxa-icon lxa-icon--red" data-a="obj-del" data-p="${p}" data-i="${i}" aria-label="Remover">${icon('trash')}</button></div>`
        )
        .join('');
      return `${o.label ? `<div class="lxa-label">${o.label}</div>` : ''}${rows}<button type="button" class="lxa-btn lxa-btn--sm" data-a="obj-add" data-p="${p}" data-tpl="${esc(
        JSON.stringify(tpl)
      )}">${icon('plus')}Adicionar</button>`;
    },
  };
  const card = (title, html, cls = '') => `<div class="lxa-card ${cls}">${title ? `<h4>${title}</h4>` : ''}${html}</div>`;

  /* ====================================================================== */
  /* Abas                                                                    */
  /* ====================================================================== */
  const V = {};

  V.inicio = () => {
    const c = cfg();
    const stale = STATE.stale
      ? card(
          'Edições antigas encontradas',
          `<p class="lxa-note">Este aparelho tem alterações feitas numa versão anterior do arquivo do site. O site está mostrando a versão do arquivo.</p>
          <div class="lxa-btns"><button type="button" class="lxa-btn lxa-btn--sm lxa-btn--y" data-a="stale-restore">Restaurar edições antigas</button><button type="button" class="lxa-btn lxa-btn--sm" data-a="stale-dismiss">Descartar</button></div>`,
          'lxa-warn'
        )
      : '';
    return `<h2 class="lxa-h">Fala, chefe! ⚡</h2>
      <p class="lxa-sub">Aqui você muda <b>tudo</b> do site: cores, fontes, textos, produtos, fotos e o vídeo da bolinha. Tudo aparece na hora.</p>
      ${stale}
      ${
        waNumber()
          ? ''
          : card(
              'Falta 1 passo: seu WhatsApp',
              `<p class="lxa-note">Coloque o número da loja para os pedidos chegarem direto em você. Enquanto isso, o cliente escolhe o contato ao abrir o WhatsApp.</p><button type="button" class="lxa-btn lxa-btn--sm lxa-btn--y" data-go="marca">${icon('whatsapp')}Configurar WhatsApp</button>`,
              'lxa-warn'
            )
      }
      <div class="lxa-hub">
        <button type="button" class="wide" data-a="edit-mode">${icon('edit')}<span>Editar textos tocando no site<br><small>Toque em qualquer título ou frase e escreva por cima.</small></span></button>
        <button type="button" data-go="produtos">${icon('tag')}Catálogo<small>${c.products.length} produtos</small></button>
        <button type="button" data-go="cores">${icon('palette')}Cores<small>Fundo, texto, borda, botões…</small></button>
        <button type="button" data-go="fontes">${icon('type')}Fontes<small>${esc(c.theme.fonts.title)} + ${esc(c.theme.fonts.body)}</small></button>
        <button type="button" data-go="secoes">${icon('grid')}Seções<small>Ligar, desligar e reordenar</small></button>
        <button type="button" data-go="video">${icon('video')}Vídeo da bolinha<small>Troque o vídeo</small></button>
        <button type="button" data-go="marca">${icon('whatsapp')}WhatsApp e cupom<small>${esc(c.store.coupon)} · ${waNumber() ? esc(fmtPhone(c.store.whatsapp)) : '<b style="color:#ff5d5d">configure o número!</b>'}</small></button>
      </div>
      ${card('Temas prontos', presetsHTML(), '')}
      ${card(
        'Como funciona',
        `<ol class="lxa-steps"><li>Tudo que você muda fica <b>salvo neste aparelho</b> automaticamente.</li>
         <li>Errou? Use <b>Desfazer</b> (seta lá em cima).</li>
         <li>Quando estiver pronto, vá em <b>Publicar</b> e baixe o site atualizado para colocar no ar — aí todo mundo vê.</li>
         <li>Para abrir este painel de novo: toque <b>5 vezes no LUXX gigante</b> do rodapé, ou coloque <b>#admin</b> no fim do link do site.</li></ol>`
      )}`;
  };

  function presetsHTML() {
    const cur = cfg().theme.preset;
    return `<div class="lxa-presets">${Object.entries(THEME.PRESETS)
      .map(
        ([k, p]) =>
          `<button type="button" class="lxa-preset" data-preset="${k}" aria-pressed="${cur === k}"><span>${['bg', 'surface', 'accent', 'text']
            .map((x) => `<i style="background:${p.colors[x]}"></i>`)
            .join('')}</span>${esc(p.label)}</button>`
      )
      .join('')}</div><p class="lxa-note" style="margin:10px 0 0">Temas mudam só cores, fontes e cantos — seus textos e produtos continuam iguais.</p>`;
  }

  V.cores = () => {
    const grp = (title, list) => card(title, `<div class="lxa-colors">${list.map(([k, l]) => F.color('theme.colors.' + k, l)).join('')}</div>`);
    const sw = ['#ffd400', '#ffe600', '#facc15', '#ffc300', '#f5b700', '#e6ff00', '#d4af37', '#ffffff', '#0a0a0a', '#ff3b30', '#00e5ff', '#9b5cff'];
    return `<h2 class="lxa-h">Cores</h2><p class="lxa-sub">Toque no quadradinho para escolher ou digite o código (ex.: #FFD400).</p>
      ${card('Temas prontos', presetsHTML())}
      ${card(
        'Cor principal (raio ⚡)',
        `<div class="lxa-colors">${F.color('theme.colors.accent', 'Destaque')}${F.color('theme.colors.accentText', 'Texto em cima do destaque')}</div>
        <div class="lxa-swatches">${sw.map((c) => `<button type="button" class="lxa-sw" style="background:${c}" data-sw="${c}" data-p="theme.colors.accent" aria-label="Usar ${c}"></button>`).join('')}</div>
        <p class="lxa-note" style="margin:10px 0 0">A cor de destaque também é usada nos botões, selos e na promoção — ajuste cada um abaixo se quiser diferente.</p>`
      )}
      ${grp('Fundo e bordas', [
        ['bg', 'Fundo da página'],
        ['bg2', 'Fundo das seções alternadas'],
        ['surface', 'Fundo dos cards'],
        ['productBg', 'Fundo das fotos dos produtos'],
        ['border', 'Bordas e linhas'],
      ])}
      ${grp('Textos', [
        ['title', 'Títulos'],
        ['text', 'Texto principal'],
        ['muted', 'Texto secundário'],
        ['price', 'Preço'],
      ])}
      ${grp('Botões e selos', [
        ['btnBg', 'Botão (fundo)'],
        ['btnText', 'Botão (texto)'],
        ['badgeBg', 'Selo "Novo" (fundo)'],
        ['badgeText', 'Selo "Novo" (texto)'],
        ['whatsapp', 'Botões do WhatsApp'],
      ])}
      ${grp('Topo do site', [
        ['topbarBg', 'Barra de anúncios (fundo)'],
        ['topbarText', 'Barra de anúncios (texto)'],
        ['headerBg', 'Cabeçalho (fundo)'],
        ['headerText', 'Cabeçalho (texto)'],
      ])}
      ${grp('Promoção e rodapé', [
        ['promoBg', 'Bloco do cupom (fundo)'],
        ['promoText', 'Bloco do cupom (texto)'],
        ['footerBg', 'Rodapé (fundo)'],
        ['footerText', 'Rodapé (texto)'],
      ])}`;
  };

  V.fontes = () => {
    const weights = [
      [400, 'Normal (400)'],
      [500, 'Médio (500)'],
      [600, 'Semi-negrito (600)'],
      [700, 'Negrito (700)'],
      [800, 'Extra-negrito (800)'],
      [900, 'Black (900)'],
    ];
    return `<h2 class="lxa-h">Fontes das letras</h2><p class="lxa-sub">Mais de 40 fontes do Google. As do grupo "Impacto" são as mais streetwear.</p>
      <div class="lxa-fontprev" style="background:${esc(cfg().theme.colors.bg)};color:${esc(cfg().theme.colors.text)}">
        <div style="font-family:var(--f-title);font-weight:var(--tw);text-transform:var(--tt);font-style:var(--tst);letter-spacing:var(--tls);font-size:34px;line-height:1;color:${esc(
          cfg().theme.colors.title
        )}">Luxo de rua.</div>
        <div style="font-family:var(--f-body);font-size:14px;margin-top:8px">Peças exclusivas para quem nasceu pra ser notado.</div>
        <div style="font-family:var(--f-logo);font-weight:900;font-size:20px;margin-top:8px;color:${esc(cfg().theme.colors.accent)}">${esc(cfg().brand.logoText)}</div>
      </div>
      ${card('Escolha as fontes', F.font('theme.fonts.title', 'Títulos') + F.font('theme.fonts.body', 'Textos') + F.font('theme.fonts.logo', 'Logo (quando for texto)'))}
      ${card(
        'Ajustes dos títulos',
        F.select('theme.fonts.titleWeight', 'Peso (grossura)', weights, { t: 'num', hint: 'Algumas fontes só têm um peso.' }) +
          F.range('theme.fonts.titleScale', 'Tamanho dos títulos', 0.7, 1.4, 0.05, 'x') +
          F.range('theme.fonts.titleSpacing', 'Espaço entre as letras', -0.05, 0.2, 0.01, 'em') +
          F.toggle('theme.fonts.upper', 'TÍTULOS EM CAIXA ALTA') +
          F.toggle('theme.fonts.italic', 'Títulos em itálico')
      )}
      ${card('Texto', F.range('theme.fonts.base', 'Tamanho do texto', 13, 20, 1, 'px'))}
      <p class="lxa-note">Sem internet, o site usa fontes parecidas do aparelho.</p>`;
  };

  V.estilo = () =>
    `<h2 class="lxa-h">Estilo e layout</h2><p class="lxa-sub">Cantos, bordas, espaçamentos, colunas e efeitos.</p>
    ${card(
      'Cantos e bordas',
      F.range('theme.style.radius', 'Arredondamento dos cards', 0, 40, 1, 'px') +
        F.select('theme.style.btnRadius', 'Formato dos botões', [
          [0, 'Reto'],
          [6, 'Levemente arredondado'],
          [14, 'Arredondado'],
          [999, 'Pílula (redondo)'],
        ], { t: 'num' }) +
        F.select('theme.style.btnStyle', 'Estilo dos botões', [
          ['solid', 'Preenchido'],
          ['outline', 'Só contorno'],
        ]) +
        F.range('theme.style.border', 'Espessura das bordas', 0, 4, 1, 'px')
    )}
    ${card(
      'Layout',
      F.range('theme.style.maxWidth', 'Largura máxima do conteúdo', 1000, 1680, 20, 'px') +
        F.range('theme.style.space', 'Espaço entre as seções', 0.6, 1.6, 0.05, 'x') +
        `<div class="lxa-row">${F.select('theme.style.colsDesk', 'Colunas no computador', [
          [2, '2'],
          [3, '3'],
          [4, '4'],
          [5, '5'],
        ], { t: 'num' })}${F.select('theme.style.colsMob', 'Colunas no celular', [
          [1, '1'],
          [2, '2'],
        ], { t: 'num' })}</div>`
    )}
    ${card(
      'Efeitos',
      F.toggle('theme.style.glow', 'Brilho neon', 'Luz amarela atrás de botões, banner e cards') +
        F.toggle('theme.style.grain', 'Textura granulada', 'Visual de filme/streetwear por cima do site') +
        F.toggle('theme.style.anim', 'Animações', 'Elementos surgindo ao rolar, faixas em movimento') +
        F.toggle('store.floatWhats', 'Botão flutuante do WhatsApp', 'Bolinha verde no canto da tela')
    )}`;

  /* ---------- seções ---------- */
  const sp = (id, k) => `sections.${id}.${k}`;
  function sectionFields(id) {
    const T = (k, l, o) => F.text(sp(id, k), l, o);
    const A = (k, l, o) => F.area(sp(id, k), l, o);
    const head = () => T('nav', 'Nome no menu', { hint: 'Deixe vazio para não aparecer no menu.' }) + T('kicker', 'Selo pequeno (acima do título)') + T('title', 'Título') + A('text', 'Texto');
    switch (id) {
      case 'hero':
        return (
          F.select(sp(id, 'layout'), 'Layout', [
            ['split', 'Texto + ilustração/foto ao lado'],
            ['full', 'Foto de fundo (tela cheia)'],
          ], { hint: '"Foto de fundo" precisa de uma foto enviada abaixo.', rr: 1 }) +
          T('kicker', 'Selo (acima do título)') +
          T('title', 'Título — linha 1') +
          T('titleAccent', 'Título — linha 2 (na cor de destaque)') +
          A('text', 'Texto') +
          T('btn1', 'Botão principal') +
          T('btn1Link', 'Link do botão principal', { hint: 'Use #novidades, #catalogo, #promo, whatsapp ou um link https://' }) +
          T('btn2', 'Botão do WhatsApp') +
          `<div class="lxa-row">${T('sticker1', 'Adesivo 1')}${T('sticker2', 'Adesivo 2')}</div>` +
          F.objlist(sp(id, 'stats'), [
            ['big', 'Destaque'],
            ['small', 'Legenda'],
          ], { big: 'Novo', small: 'Legenda' }, { label: 'Destaques embaixo dos botões' }) +
          '<div style="height:14px"></div>' +
          F.media(sp(id, 'img'), 'Foto do banner (opcional)', { hint: 'Sem foto, aparece a ilustração abaixo.' }) +
          (g(sp(id, 'img')) ? F.range(sp(id, 'overlay'), 'Escurecer a foto (tela cheia)', 0, 0.9, 0.05, '%') : `<div class="lxa-label" style="margin-top:12px">Ilustração do banner</div>${F.art(sp(id, 'art'))}`)
        );
      case 'marquee':
        return F.list(sp(id, 'words'), 'Palavras da faixa');
      case 'novidades':
        return (
          `<p class="lxa-note">Aparecem aqui os produtos marcados como <b>Novidade</b> no Catálogo.</p>` +
          head() +
          F.select(sp(id, 'layout'), 'Exibição', [
            ['carousel', 'Carrossel (deslizar para o lado)'],
            ['grid', 'Grade'],
          ]) +
          F.num(sp(id, 'limit'), 'Máximo de produtos', { min: 1, max: 40 })
        );
      case 'maisvendidos':
        return (
          `<p class="lxa-note">Aparecem aqui os produtos marcados como <b>Mais vendido</b>, na ordem do Catálogo.</p>` +
          head() +
          F.num(sp(id, 'limit'), 'Máximo de produtos', { min: 1, max: 40 }) +
          F.toggle(sp(id, 'rank'), 'Mostrar ranking (01, 02, 03…)')
        );
      case 'categorias':
        return `<p class="lxa-note">As categorias em si você edita na aba <b>Categorias</b>.</p>` + head();
      case 'catalogo':
        return head();
      case 'promo':
        return (
          `<p class="lxa-note">O código do cupom e a porcentagem ficam em <b>Marca e contato</b>. Nos textos, <b>{cupom}</b> e <b>{desconto}</b> viram o código e a % automaticamente.</p>` +
          head() +
          T('btn', 'Botão copiar cupom') +
          T('btn2', 'Link abaixo do cupom') +
          A('note', 'Observação (letra miúda)', { rows: 2 }) +
          `<label class="lxa-field"><span>Contagem regressiva até (opcional)</span><input type="datetime-local" data-p="${sp(id, 'endsAt')}" value="${esc(g(sp(id, 'endsAt')) || '')}">${hint(
            'Deixe vazio para não mostrar o relógio. Quando o tempo acaba, o relógio some sozinho.'
          )}</label>`
        );
      case 'manifesto':
        return T('kicker', 'Selo pequeno') + T('title', 'Título') + A('text', 'Texto', { rows: 6 }) + T('sign', 'Assinatura');
      case 'beneficios':
        return F.objlist(sp(id, 'items'), [
          ['icon', 'Ícone', 'select', [['truck', 'Caminhão'], ['refresh', 'Troca'], ['card', 'Cartão'], ['shield', 'Escudo'], ['bolt', 'Raio'], ['star', 'Estrela'], ['bag', 'Sacola'], ['clock', 'Relógio'], ['whatsapp', 'WhatsApp'], ['pin', 'Local']]],
          ['title', 'Título'],
          ['text', 'Texto'],
        ], { icon: 'bolt', title: 'Novo benefício', text: 'Descrição' }, { cls: 'three' });
      case 'whats':
        return (
          head() +
          T('btn', 'Botão do WhatsApp') +
          T('btn2', 'Botão secundário (catálogo)') +
          F.objlist(sp(id, 'chat'), [
            ['from', 'Quem fala', 'select', [['c', 'Cliente'], ['l', 'Loja']]],
            ['text', 'Mensagem'],
          ], { from: 'c', text: 'Nova mensagem' }, { cls: 'chat', label: 'Conversa de exemplo (desenho do celular)' })
        );
      default:
        return '';
    }
  }

  V.secoes = () => {
    const c = cfg();
    const items = c.order
      .map((id, i) => {
        const s = c.sections[id];
        if (!s) return '';
        const open = opened.secoes === id;
        return `<div class="lxa-item${open ? ' open' : ''}${s.on ? '' : ' off'}">
          <div class="lxa-item-head">
            <label class="lxa-switch" style="padding:0;border:0" aria-label="Mostrar ${esc(SECTION_LABEL[id])}"><input type="checkbox" data-p="sections.${id}.on" data-t="bool" data-rr="1"${s.on ? ' checked' : ''}><i></i></label>
            <button type="button" class="lxa-item-main" data-a="sec-open" data-id="${id}"><b>${esc(SECTION_LABEL[id] || id)}</b><small>${s.on ? 'Visível' : 'Escondida'} · toque para editar</small></button>
            <div class="lxa-item-tools">
              <button type="button" class="lxa-icon" data-a="sec-move" data-i="${i}" data-d="-1" aria-label="Subir"${i === 0 ? ' disabled' : ''}>${icon('up')}</button>
              <button type="button" class="lxa-icon" data-a="sec-move" data-i="${i}" data-d="1" aria-label="Descer"${i === c.order.length - 1 ? ' disabled' : ''}>${icon('down')}</button>
            </div>
          </div>
          ${open ? `<div class="lxa-item-body">${sectionFields(id)}</div>` : ''}
        </div>`;
      })
      .join('');
    return `<h2 class="lxa-h">Seções e textos</h2><p class="lxa-sub">Ligue/desligue, mude a ordem com as setas e toque numa seção para editar os textos. Dica: dá pra editar direto no site em <b>Início → Editar textos</b>.</p>
      ${card('Barra de anúncios (topo)', F.toggle('sections.topbar.on', 'Mostrar barra de anúncios', '', true) + F.list('sections.topbar.items', 'Mensagens (uma por linha)', { hint: 'Use {cupom}, {desconto}, {frete} e {parcelas} para preencher automático.' }))}
      ${items}
      ${card(
        'Rodapé',
        F.area('sections.footer.text', 'Texto sobre a loja') +
          F.list('sections.footer.help', 'Links de ajuda', { hint: 'Um por linha. Cada um abre o WhatsApp com a dúvida escrita.' }) +
          F.text('sections.footer.copyright', 'Direitos autorais', { hint: '{ano} e {loja} são preenchidos sozinhos.' }) +
          F.text('sections.footer.legal', 'Linha extra (CNPJ, endereço…)') +
          F.toggle('sections.footer.payments', 'Mostrar formas de pagamento')
      )}`;
  };

  /* ---------- catálogo ---------- */
  function productForm(p, i) {
    const P = (k) => `products.${i}.${k}`;
    const cats = [['', '— sem categoria —']].concat(cfg().categories.map((k) => [k.id, k.name]));
    return (
      F.text(P('name'), 'Nome do produto') +
      `<div class="lxa-row">${F.money(P('price'), 'Preço (R$)')}${F.money(P('old'), 'Preço antigo "de"', { ph: 'opcional', hint: 'Mostra riscado + % OFF' })}</div>` +
      F.select(P('cat'), 'Categoria', cats, { rr: 1 }) +
      F.area(P('desc'), 'Descrição', { rows: 3 }) +
      F.text(P('sizes'), 'Tamanhos', { hint: 'Separe por vírgula: P, M, G, GG — ou 38, 39, 40. Use "Único" para tamanho único.' }) +
      F.text(P('badge'), 'Selo personalizado (opcional)', { hint: 'Ex.: "Últimas peças". Vazio = automático (Novo ou % OFF).' }) +
      `<div class="lxa-card" style="padding:4px 12px;margin:4px 0 12px">${F.toggle(P('isNew'), 'Novidade', 'Aparece na seção Novidades', true)}${F.toggle(P('best'), 'Mais vendido', 'Aparece na seção Mais vendidos', true)}${F.toggle(
        P('soldout'),
        'Esgotado',
        'Mostra "Avise-me" em vez de "Comprar"',
        true
      )}${F.toggle(P('hidden'), 'Esconder do site', 'Some do site sem apagar', true)}</div>` +
      F.media(P('img'), 'Foto do produto', { hint: 'Fundo transparente (PNG) ou foto quadrada/vertical ficam ótimos.' }) +
      (p.img ? '' : `<div class="lxa-label" style="margin-top:12px">Ilustração (usada quando não há foto)</div>${F.art(P('art'))}`) +
      F.text(P('link'), 'Link de compra externo (opcional)', { hint: 'Se preencher, aparece o botão "Comprar no site" (Shopee, Mercado Livre, Nuvemshop…).' }) +
      `<div class="lxa-grid2" style="margin-top:4px"><button type="button" class="lxa-btn lxa-btn--sm" data-a="prod-see" data-i="${i}">${icon('eye')}Ver no site</button><button type="button" class="lxa-btn lxa-btn--sm" data-a="prod-dup" data-i="${i}">${icon(
        'dup'
      )}Duplicar</button></div>
       <button type="button" class="lxa-btn lxa-btn--sm lxa-btn--red lxa-btn--block" style="margin-top:8px" data-a="prod-del" data-i="${i}">${icon('trash')}Excluir produto</button>`
    );
  }
  const thumb = (o) => {
    const u = o.img && MEDIA.url(o.img);
    return u ? `<img src="${esc(u)}" alt="">` : ART.svg(o.art);
  };

  function productList() {
    const c = cfg();
    const q = search.trim().toLowerCase();
    const list = c.products
      .map((p, i) => ({ p, i }))
      .filter(({ p }) => !q || (p.name + ' ' + ((catOf(p.cat) || {}).name || '')).toLowerCase().includes(q));
    const items = list
      .map(({ p, i }) => {
        const open = opened.produtos === p.id;
        const tags = [p.isNew && '<em class="y">Novo</em>', p.best && '<em class="y">Top</em>', p.soldout && '<em class="r">Esgotado</em>', p.hidden && '<em>Oculto</em>', offPct(p) && `<em>-${offPct(p)}%</em>`]
          .filter(Boolean)
          .join('');
        return `<div class="lxa-item${open ? ' open' : ''}${p.hidden ? ' off' : ''}">
          <div class="lxa-item-head">
            <button type="button" class="lxa-thumb" data-a="prod-open" data-id="${esc(p.id)}" aria-label="Editar ${esc(p.name)}">${thumb(p)}</button>
            <button type="button" class="lxa-item-main" data-a="prod-open" data-id="${esc(p.id)}"><b data-live="products.${i}.name">${esc(p.name)}</b><small>${U.money(p.price)} · ${esc(
              (catOf(p.cat) || {}).name || 'Sem categoria'
            )}</small>${tags ? `<span class="lxa-tags">${tags}</span>` : ''}</button>
            <div class="lxa-item-tools">
              <button type="button" class="lxa-icon" data-a="prod-move" data-i="${i}" data-d="-1" aria-label="Subir"${i === 0 ? ' disabled' : ''}>${icon('up')}</button>
              <button type="button" class="lxa-icon" data-a="prod-move" data-i="${i}" data-d="1" aria-label="Descer"${i === c.products.length - 1 ? ' disabled' : ''}>${icon('down')}</button>
            </div>
          </div>
          ${open ? `<div class="lxa-item-body">${productForm(p, i)}</div>` : ''}
        </div>`;
      })
      .join('');
    return items || '<p class="lxa-note">Nenhum produto encontrado.</p>';
  }
  V.produtos = () =>
    `<h2 class="lxa-h">Catálogo (${cfg().products.length})</h2><p class="lxa-sub">Toque num produto para editar preço, fotos, tamanhos e mais. As setas mudam a ordem no site.</p>
      <button type="button" class="lxa-btn lxa-btn--y lxa-btn--block" data-a="prod-add" style="margin-bottom:10px">${icon('plus')}Adicionar produto</button>
      <input type="text" class="lxa-search" data-search="1" value="${esc(search)}" placeholder="Buscar produto…" aria-label="Buscar produto" autocomplete="off" enterkeyhint="search">
      <div id="lxa-plist">${productList()}</div>`;

  V.categorias = () => {
    const c = cfg();
    const items = c.categories
      .map((k, i) => {
        const open = opened.categorias === k.id;
        const n = c.products.filter((p) => p.cat === k.id).length;
        return `<div class="lxa-item${open ? ' open' : ''}">
          <div class="lxa-item-head">
            <button type="button" class="lxa-thumb" data-a="cat-open" data-id="${esc(k.id)}" aria-label="Editar ${esc(k.name)}">${thumb(k)}</button>
            <button type="button" class="lxa-item-main" data-a="cat-open" data-id="${esc(k.id)}"><b data-live="categories.${i}.name">${esc(k.name)}</b><small>${n} ${n === 1 ? 'produto' : 'produtos'}</small></button>
            <div class="lxa-item-tools">
              <button type="button" class="lxa-icon" data-a="cat-move" data-i="${i}" data-d="-1" aria-label="Subir"${i === 0 ? ' disabled' : ''}>${icon('up')}</button>
              <button type="button" class="lxa-icon" data-a="cat-move" data-i="${i}" data-d="1" aria-label="Descer"${i === c.categories.length - 1 ? ' disabled' : ''}>${icon('down')}</button>
            </div>
          </div>
          ${
            open
              ? `<div class="lxa-item-body">${F.text(`categories.${i}.name`, 'Nome da categoria')}${F.media(`categories.${i}.img`, 'Foto da categoria (opcional)')}${
                  k.img ? '' : `<div class="lxa-label" style="margin-top:12px">Ilustração</div>${F.art(`categories.${i}.art`)}`
                }<button type="button" class="lxa-btn lxa-btn--sm lxa-btn--red lxa-btn--block" style="margin-top:8px" data-a="cat-del" data-i="${i}">${icon('trash')}Excluir categoria</button></div>`
              : ''
          }
        </div>`;
      })
      .join('');
    return `<h2 class="lxa-h">Categorias (${c.categories.length})</h2><p class="lxa-sub">Camisetas, moletons, tênis, slides… A primeira aparece em destaque (maior).</p>
      <button type="button" class="lxa-btn lxa-btn--y lxa-btn--block" data-a="cat-add" style="margin-bottom:12px">${icon('plus')}Adicionar categoria</button>${items}`;
  };

  /* ---------- vídeo ---------- */
  V.video = () => {
    const b = cfg().bubble;
    const v = b.video || '';
    const k = MEDIA.kind(v);
    const y = ytId(v);
    const url = y ? '' : MEDIA.url(v);
    const prev = y
      ? `<iframe src="https://www.youtube-nocookie.com/embed/${y}?autoplay=1&mute=1&loop=1&playlist=${y}&controls=0&playsinline=1" allow="autoplay" title="Prévia"></iframe>`
      : url
        ? `<video src="${esc(url)}" muted autoplay loop playsinline></video>`
        : '';
    const src =
      v === 'media:default-video'
        ? 'Vídeo padrão LUXX'
        : y
          ? 'Vídeo do YouTube'
          : k === 'idb'
            ? 'Vídeo enviado do aparelho'
            : k === 'embed'
              ? 'Vídeo guardado no arquivo do site'
              : v
                ? 'Vídeo por link'
                : 'Nenhum vídeo';
    return `<h2 class="lxa-h">Vídeo da bolinha</h2><p class="lxa-sub">A bolinha flutua no site com o vídeo rodando. O cliente pode arrastar para onde quiser e tocar para ver grande com som.</p>
      ${card('', F.toggle('bubble.on', 'Mostrar a bolinha de vídeo', '', true))}
      ${card(
        'Vídeo',
        `${prev ? `<div class="lxa-video-prev">${prev}</div>` : ''}<p class="lxa-note" style="text-align:center">Agora: <b>${esc(src)}</b><span data-vsize></span></p>
        <div class="lxa-grid2">
          <span class="lxa-btn lxa-btn--y lxa-file">${icon('upload')}Enviar vídeo<input type="file" accept="video/*" data-upload="bubble.video"></span>
          <button type="button" class="lxa-btn" data-a="video-default"${v === 'media:default-video' ? ' disabled' : ''}>${icon('refresh')}Vídeo padrão</button>
        </div>
        <div style="height:12px"></div>
        <label class="lxa-field"><span>Ou cole um link (MP4 ou YouTube)</span><input type="text" data-p="bubble.video" data-rr-blur="1" value="${
          k === 'url' ? esc(v) : ''
        }" placeholder="https://… .mp4  ou  https://youtube.com/shorts/…" autocomplete="off"></label>
        <p class="lxa-note" style="margin:0">Dica: vídeos <b>verticais e curtos (5 a 15 s)</b> ficam perfeitos. O vídeo enviado fica salvo neste aparelho e vai junto quando você baixar o site.</p>`
      )}
      ${card(
        'Aparência',
        F.select('bubble.shape', 'Formato', [
          ['circle', 'Bolinha (círculo)'],
          ['rounded', 'Quadrado arredondado'],
          ['story', 'Vertical (estilo stories)'],
        ]) +
          `<div class="lxa-row">${F.range('bubble.sizeMobile', 'Tamanho no celular', 56, 180, 2, 'px')}${F.range('bubble.size', 'No computador', 60, 220, 2, 'px')}</div>` +
          `<div class="lxa-row">${F.color('bubble.border', 'Cor da borda', '#ffd400')}${F.range('bubble.borderWidth', 'Espessura', 0, 8, 1, 'px')}</div>` +
          F.text('bubble.label', 'Etiqueta embaixo', { hint: 'Ex.: Drop ⚡, Ao vivo, Novo. Vazio = sem etiqueta.' }) +
          F.toggle('bubble.ring', 'Anel girando em volta') +
          F.toggle('bubble.pulse', 'Efeito pulsar')
      )}
      ${card(
        'Comportamento',
        F.toggle('bubble.drag', 'Cliente pode arrastar a bolinha', 'Ela fica onde o cliente soltar') +
          F.toggle('bubble.closable', 'Mostrar botão de fechar (x)') +
          F.toggle('bubble.mobile', 'Mostrar no celular') +
          F.toggle('bubble.desktop', 'Mostrar no computador') +
          '<div style="height:10px"></div>' +
          F.select('bubble.pos', 'Posição inicial', [
            ['bl', 'Canto inferior esquerdo'],
            ['br', 'Canto inferior direito'],
            ['ml', 'Meio, à esquerda'],
            ['mr', 'Meio, à direita'],
            ['tl', 'Em cima, à esquerda'],
            ['tr', 'Em cima, à direita'],
          ]) +
          `<button type="button" class="lxa-btn lxa-btn--sm lxa-btn--block" data-a="video-reset-pos" style="margin-bottom:12px">${icon('move')}Trazer a bolinha de volta para a posição inicial</button>` +
          F.select('bubble.tap', 'Quando tocar na bolinha', [
            ['expand', 'Abrir o vídeo grande com som'],
            ['link', 'Ir para o link do botão'],
            ['whatsapp', 'Abrir o WhatsApp'],
            ['none', 'Não fazer nada'],
          ])
      )}
      ${card(
        'Vídeo grande (depois do toque)',
        F.text('bubble.title', 'Título') +
          F.area('bubble.text', 'Texto', { rows: 2 }) +
          `<div class="lxa-row">${F.text('bubble.cta', 'Botão 1')}${F.text('bubble.ctaLink', 'Link do botão 1', { hint: '#novidades, #promo, whatsapp ou https://' })}</div>` +
          F.text('bubble.cta2', 'Botão 2 (WhatsApp)', { hint: 'Vazio = sem botão.' }) +
          `<button type="button" class="lxa-btn lxa-btn--sm lxa-btn--block" data-a="video-test">${icon('play')}Testar: abrir o vídeo grande</button>`
      )}`;
  };

  V.marca = () =>
    `<h2 class="lxa-h">Marca e contato</h2><p class="lxa-sub">Nome, logo, WhatsApp, cupom, preços e redes sociais.</p>
    ${card(
      'Nome e logo',
      F.text('brand.name', 'Nome da loja') +
        `<div class="lxa-row">${F.text('brand.logoText', 'Logo (texto)')}${F.text('brand.logoSub', 'Complemento')}</div>` +
        F.toggle('brand.logoBolt', 'Raio ⚡ ao lado do logo') +
        '<div style="height:10px"></div>' +
        F.media('brand.logoImg', 'Logo em imagem (opcional)', { hint: 'Se enviar, substitui o logo em texto no topo e no rodapé. PNG sem fundo fica melhor.' }) +
        (g('brand.logoImg') ? F.range('brand.logoHeight', 'Altura do logo', 20, 80, 1, 'px') : '')
    )}
    ${card(
      'WhatsApp',
      F.text('store.whatsapp', 'Número do WhatsApp', { im: 'tel', hint: 'Só números, com 55 + DDD. Ex.: 5511987654321' }) +
        F.area('store.whatsappMsg', 'Mensagem automática', { rows: 2 }) +
        `<a class="lxa-btn lxa-btn--sm lxa-btn--block" data-wa-test href="${esc(wa())}" target="_blank" rel="noopener">${icon('whatsapp')}Testar link do WhatsApp</a>`
    )}
    ${card(
      'Cupom, preços e sacola',
      `<div class="lxa-row">${F.text('store.coupon', 'Código do cupom', { max: 24 })}${F.num('store.couponPct', 'Desconto (%)', { min: 0, max: 90 })}</div>` +
        F.toggle('store.showCouponPrice', 'Mostrar preço com cupom nos produtos', 'Ex.: "⚡ R$ 134,91 com LUXX10"') +
        F.toggle('store.cart', 'Sacola de compras', 'O cliente junta as peças e finaliza no WhatsApp', true) +
        '<div style="height:10px"></div>' +
        `<div class="lxa-row">${F.num('store.installments', 'Parcelas sem juros (até)', { min: 1, max: 24 })}${F.money('store.minInstallment', 'Parcela mínima (R$)')}</div>` +
        F.money('store.freeShipping', 'Frete grátis acima de (R$)', { hint: 'Coloque 0 para não mostrar frete grátis.' })
    )}
    ${card(
      'Redes sociais',
      F.text('social.instagram', 'Instagram', { ph: 'https://instagram.com/sualoja' }) +
        F.text('social.tiktok', 'TikTok', { ph: 'https://www.tiktok.com/@sualoja' }) +
        F.text('social.youtube', 'YouTube', { ph: 'https://youtube.com/@sualoja' }) +
        F.text('social.facebook', 'Facebook', { ph: 'https://facebook.com/sualoja' }) +
        F.text('social.x', 'X (Twitter)', { ph: 'https://x.com/sualoja' }) +
        F.text('social.email', 'E-mail', { ph: 'contato@sualoja.com.br' }) +
        hint('Deixe vazio para esconder o ícone.')
    )}
    ${card('Google e aba do navegador', F.text('seo.title', 'Título da aba') + F.area('seo.description', 'Descrição (aparece no Google e quando compartilham o link)', { rows: 3 }))}`;

  V.publicar = () => {
    const draft = STATE.hasDraft();
    const share = !!(navigator.canShare && window.File) && !U.inViewer();
    const defaultPin = cfg().admin.pin === DEFAULT_PIN;
    return `<h2 class="lxa-h">Publicar e backup</h2><p class="lxa-sub">Suas mudanças já aparecem para você. Para os <b>clientes</b> verem, baixe o site atualizado e coloque no ar.</p>
      ${card(
        draft ? 'Você tem alterações não publicadas' : 'Tudo em dia',
        `<ol class="lxa-steps"><li>Toque em <b>Baixar site atualizado</b>.</li><li>Substitua o arquivo antigo pelo novo onde o site está hospedado (ex.: GitHub Pages, Netlify, Hostinger) — ou só guarde no celular.</li><li>Pronto! Fotos e vídeos enviados vão junto, dentro do arquivo.</li></ol>
        <button type="button" class="lxa-btn lxa-btn--y lxa-btn--block" data-a="export">${icon('download')}Baixar site atualizado</button>
        ${share ? `<button type="button" class="lxa-btn lxa-btn--block" style="margin-top:8px" data-a="share">${icon('upload')}Salvar / compartilhar arquivo (celular)</button>` : ''}`,
        draft ? 'lxa-warn' : 'lxa-ok'
      )}
      ${card(
        'Restaurar',
        `<p class="lxa-note">Abra um arquivo do site que você baixou antes para continuar editando de onde parou.</p>
        <span class="lxa-btn lxa-btn--block lxa-file">${icon('upload')}Carregar arquivo do site (.html)<input type="file" accept=".html,.htm,.json,text/html,application/json" data-import="1"></span>`
      )}
      ${card(
        'Senha do painel (PIN)',
        `${defaultPin ? '<p class="lxa-note"><b>Atenção:</b> você ainda usa o PIN padrão <b>luxx</b>. Troque abaixo.</p>' : ''}
        <label class="lxa-field"><span>Novo PIN</span><input type="password" id="lxa-newpin" autocomplete="new-password" placeholder="mínimo 4 caracteres"></label>
        <button type="button" class="lxa-btn lxa-btn--sm lxa-btn--block" data-a="pin-save">${icon('lock')}Salvar novo PIN</button>
        ${hint('O PIN só esconde o painel dos clientes. Mudanças feitas por outra pessoa no celular dela nunca alteram o seu site.')}`
      )}
      ${card(
        'Avançado: CSS personalizado',
        F.area('theme.css', 'Seu CSS (aplicado por cima de tudo)', {
          cls: 'lxa-code',
          rows: 8,
          ph: '/* Exemplo: */\n.lx-hero-title { letter-spacing: .02em; }\n.lx-card { border-width: 2px; }',
        }) + hint('Para quem entende de CSS. As classes do site começam com .lx-')
      )}
      ${card(
        'Zona de perigo',
        `<button type="button" class="lxa-btn lxa-btn--red lxa-btn--block" data-a="reset">${icon('trash')}Descartar alterações deste aparelho</button>
        <button type="button" class="lxa-btn lxa-btn--block" style="margin-top:8px" data-a="logout">${icon('lock')}Sair do modo dono neste aparelho</button>`
      )}`;
  };

  /* ====================================================================== */
  /* Montagem                                                                */
  /* ====================================================================== */
  function build() {
    root = document.createElement('div');
    root.id = 'lx-admin';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-label', 'Painel da loja');
    root.hidden = true;
    root.innerHTML = `<div class="lxa-head">
        <div class="lxa-title">${icon('bolt')}PAINEL</div>
        <button type="button" class="lxa-hbtn" data-a="undo" aria-label="Desfazer" title="Desfazer">${icon('undo')}</button>
        <button type="button" class="lxa-hbtn" data-a="redo" aria-label="Refazer" title="Refazer">${icon('redo')}</button>
        <button type="button" class="lxa-hbtn lxa-hbtn--y" data-a="peek">${icon('eye')}Ver site</button>
        <button type="button" class="lxa-hbtn" data-a="close" aria-label="Fechar painel">${icon('close')}</button>
      </div>
      <nav class="lxa-tabs" role="tablist">${TABS.map(([k, l, ic]) => `<button type="button" class="lxa-tab" role="tab" data-tab="${k}" aria-selected="${k === tab}">${icon(ic)}${l}</button>`).join('')}</nav>
      <div class="lxa-body" id="lxa-body"></div>
      <div class="lxa-foot"><span class="lxa-status" id="lxa-status"></span><button type="button" class="lxa-btn lxa-btn--sm lxa-btn--y" data-a="export">${icon('download')}Baixar site</button></div>`;
    document.body.appendChild(root);
    body = root.querySelector('#lxa-body');
    root.addEventListener('click', onClick);
    root.addEventListener('input', onInput);
    root.addEventListener('change', onChange);
    // re-render ao sair de alguns campos (ex.: link de foto) — mas nunca no meio da digitação:
    // se o foco foi para outro campo do painel, espera, senão o campo tocado seria recriado
    root.addEventListener('focusout', (e) => {
      if (e.target.dataset && e.target.dataset.rrBlur) pendingRender = true;
      if (!pendingRender) return;
      const next = e.relatedTarget;
      if (next && root.contains(next) && /^(INPUT|TEXTAREA|SELECT)$/.test(next.tagName)) return;
      pendingRender = false;
      render();
    });
  }

  function render() {
    if (!body) return;
    pendingRender = false;
    if (!V[tab]) tab = 'inicio';
    const st = body.scrollTop;
    body.innerHTML = V[tab]();
    body.scrollTop = st;
    U.$$('.lxa-tab', root).forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
    U.$$('video', body).forEach((v) => {
      v.muted = true;
      v.play().catch(() => {});
    });
    if (tab === 'video') {
      const ref = cfg().bubble.video;
      if (MEDIA.kind(ref) === 'idb' || MEDIA.kind(ref) === 'embed')
        MEDIA.size(ref).then((n) => {
          const s = body.querySelector('[data-vsize]');
          if (s && n) s.textContent = ` · ${U.fileSize(n)}`;
        });
    }
    status();
  }

  function status() {
    if (!root) return;
    const u = root.querySelector('[data-a="undo"]');
    const r = root.querySelector('[data-a="redo"]');
    if (u) u.disabled = !STATE.canUndo;
    if (r) r.disabled = !STATE.canRedo;
    const s = root.querySelector('#lxa-status');
    if (s) {
      s.classList.toggle('warn', !STATE.saveOk);
      s.innerHTML = STATE.saveOk ? `${icon('check')}<span>Salvo neste aparelho</span>` : `${icon('close')}<span>Este navegador não salvou — baixe o site para não perder</span>`;
    }
  }

  function goTab(k) {
    tab = k;
    U.store.set(TAB_KEY, k);
    body.scrollTop = 0;
    render();
    const t = root.querySelector(`.lxa-tab[data-tab="${k}"]`);
    if (t) t.scrollIntoView({ block: 'nearest', inline: 'center' });
  }

  /* ---------- entradas ---------- */
  function onInput(e) {
    const el = e.target;
    if (el.dataset.search) {
      search = el.value;
      const list = body.querySelector('#lxa-plist');
      if (list) list.innerHTML = productList();
      return;
    }
    if (el.dataset.font) return; // tratado no change
    const p = el.dataset.p;
    if (!p || el.type === 'file') return;
    const t = el.dataset.t || 'text';
    let v;
    switch (t) {
      case 'num':
        if (el.value === '') return;
        v = parseFloat(String(el.value).replace(',', '.'));
        if (isNaN(v)) return;
        break;
      case 'money':
        v = U.num(el.value);
        break;
      case 'bool':
        v = el.checked;
        break;
      case 'list':
        v = el.value
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean);
        break;
      case 'color': {
        v = el.value;
        const hx = el.parentNode.querySelector('[data-t="hex"]');
        if (hx) hx.value = v;
        break;
      }
      case 'hex': {
        v = U.normHex(el.value);
        if (!v) return;
        const cp = el.parentNode.querySelector('[data-t="color"]');
        if (cp) cp.value = v;
        break;
      }
      default:
        v = el.value;
    }
    U.set(cfg(), p, v);
    if (p.startsWith('theme.colors.') || p.startsWith('theme.fonts.') || p.startsWith('theme.style.')) cfg().theme.preset = 'custom';
    const out = body.querySelector(`[data-out="${p}"]`);
    if (out) out.textContent = fmtOut(v, el.dataset.unit);
    U.$$(`[data-live="${p}"]`, body).forEach((n) => (n.textContent = v));
    const artP = p.replace(/\.(type|color|detail|print|sole|strapColor)$/, '');
    const prev = body.querySelector(`[data-artprev="${artP}"]`);
    if (prev) prev.innerHTML = ART.svg(U.get(cfg(), artP));
    if (p === 'store.coupon') cfg().store.coupon = String(v).trim().toUpperCase();
    const waTest = body.querySelector('[data-wa-test]');
    if (waTest) waTest.href = wa();
    STATE.touch();
    status();
  }

  function onChange(e) {
    const el = e.target;
    if (el.dataset.font) {
      const p = el.dataset.font;
      STATE.checkpoint();
      if (el.value === '__custom') customFont.add(p);
      else {
        customFont.delete(p);
        U.set(cfg(), p, el.value);
        cfg().theme.preset = 'custom';
        STATE.touch();
      }
      render();
      if (el.value === '__custom') {
        const inp = body.querySelector(`input[data-p="${p}"]`);
        if (inp) inp.focus();
      }
      return;
    }
    if (el.dataset.upload) {
      STATE.checkpoint();
      return upload(el);
    }
    if (el.dataset.import) return importFile(el);
    if (el.dataset.rr) render();
    if (el.dataset.p === 'store.coupon') el.value = cfg().store.coupon;
  }

  async function upload(input) {
    const p = input.dataset.upload;
    const f = input.files && input.files[0];
    if (!f) return;
    const video = /^video\//.test(f.type) || p === 'bubble.video';
    if (video && f.size > 40 * 1048576 && !(await ask('Vídeo grande', `Esse vídeo tem ${U.fileSize(f.size)}. Vídeos grandes deixam o site pesado; prefira até 15 segundos.`, 'Usar mesmo assim'))) {
      input.value = '';
      return;
    }
    SHOP.toast(video ? 'Carregando vídeo…' : 'Carregando foto…', 'upload');
    try {
      const blob = video ? f : await MEDIA.shrinkImage(f);
      const { ref, persisted } = await MEDIA.save(blob, video ? 'vid' : 'img');
      U.set(cfg(), p, ref);
      STATE.touch();
      STATE.checkpoint();
      render();
      SHOP.toast(persisted ? (video ? 'Vídeo trocado! ⚡' : 'Foto salva! ⚡') : 'Atenção: este navegador não salvou o arquivo. Baixe o site antes de fechar.', persisted ? 'check' : 'close');
    } catch (err) {
      console.error(err);
      SHOP.toast('Não foi possível usar esse arquivo.', 'close');
    }
  }

  async function importFile(input) {
    const f = input.files && input.files[0];
    if (!f) return;
    try {
      await EXPORT.importFile(f);
      render();
      SHOP.toast('Site carregado! Continue editando ⚡', 'check');
    } catch (err) {
      console.error(err);
      SHOP.toast(err.message || 'Arquivo inválido', 'close');
    }
  }

  /* ---------- cliques ---------- */
  const move = (arr, i, d) => {
    const j = i + d;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  };
  const commit = () => {
    STATE.touch();
    STATE.checkpoint();
    render();
  };

  function onClick(e) {
    const t = e.target.closest('[data-a],[data-tab],[data-go],[data-preset],[data-sw]');
    if (!t || !root.contains(t)) return;
    // fecha o grupo de edições digitadas antes, para o "Desfazer" voltar uma ação de cada vez
    if (!['undo', 'redo'].includes(t.dataset.a)) STATE.checkpoint();
    if (t.dataset.tab) return goTab(t.dataset.tab);
    if (t.dataset.go) return goTab(t.dataset.go);
    if (t.dataset.preset) {
      THEME.preset(cfg(), t.dataset.preset);
      SHOP.toast(`Tema "${THEME.PRESETS[t.dataset.preset].label}" aplicado`, 'palette');
      return commit();
    }
    if (t.dataset.sw) {
      U.set(cfg(), t.dataset.p, t.dataset.sw);
      cfg().theme.preset = 'custom';
      return commit();
    }
    const a = t.dataset.a;
    const c = cfg();
    const i = +t.dataset.i;
    switch (a) {
      case 'close':
        return close();
      case 'peek':
        return peek(true);
      case 'undo':
        STATE.undo();
        return render();
      case 'redo':
        STATE.redo();
        return render();
      case 'edit-mode':
        return editMode(true);
      case 'stale-restore':
        STATE.restoreStale();
        return render();
      case 'stale-dismiss':
        STATE.dismissStale();
        return render();
      /* seções */
      case 'sec-open':
        opened.secoes = opened.secoes === t.dataset.id ? null : t.dataset.id;
        return render();
      case 'sec-move':
        move(c.order, i, +t.dataset.d);
        return commit();
      /* listas genéricas */
      case 'obj-add': {
        const arr = g(t.dataset.p) || [];
        arr.push(JSON.parse(t.dataset.tpl));
        U.set(c, t.dataset.p, arr);
        return commit();
      }
      case 'obj-del': {
        const arr = g(t.dataset.p) || [];
        arr.splice(i, 1);
        return commit();
      }
      case 'media-clear':
        U.set(c, t.dataset.p, '');
        return commit();
      /* produtos */
      case 'prod-open':
        opened.produtos = opened.produtos === t.dataset.id ? null : t.dataset.id;
        return render();
      case 'prod-move':
        move(c.products, i, +t.dataset.d);
        return commit();
      case 'prod-add': {
        const id = 'p' + Date.now().toString(36);
        const cat = (c.categories[0] || {}).id || '';
        c.products.unshift({
          id,
          name: 'Novo produto',
          cat,
          price: 99.9,
          old: 0,
          desc: 'Descreva a peça: tecido, caimento, detalhes que fazem a diferença.',
          sizes: 'P, M, G, GG',
          art: { type: 'tee', color: '#1c1c1c', detail: c.theme.colors.accent, print: 'bolt' },
          img: '',
          isNew: true,
          best: false,
        });
        opened.produtos = id;
        search = '';
        body.scrollTop = 0;
        SHOP.toast('Produto criado — preencha os dados', 'plus');
        return commit();
      }
      case 'prod-dup': {
        const copy = U.clone(c.products[i]);
        copy.id = 'p' + Date.now().toString(36);
        copy.name += ' (cópia)';
        c.products.splice(i + 1, 0, copy);
        opened.produtos = copy.id;
        return commit();
      }
      case 'prod-del': {
        const { id, name } = c.products[i];
        ask(`Excluir "${name}"?`, 'Dá para desfazer depois com a seta de voltar, lá em cima.', 'Excluir', true).then((ok) => {
          const k = cfg().products.findIndex((p) => p.id === id);
          if (!ok || k < 0) return;
          cfg().products.splice(k, 1);
          commit();
          SHOP.toast('Produto excluído', 'trash');
        });
        return;
      }
      case 'prod-see': {
        const p = c.products[i];
        peek(true);
        setTimeout(() => SHOP.view(p.id), 250);
        return;
      }
      /* categorias */
      case 'cat-open':
        opened.categorias = opened.categorias === t.dataset.id ? null : t.dataset.id;
        return render();
      case 'cat-move':
        move(c.categories, i, +t.dataset.d);
        return commit();
      case 'cat-add': {
        let id = 'categoria';
        let n = 2;
        while (c.categories.some((k) => k.id === id)) id = 'categoria-' + n++;
        c.categories.push({ id, name: 'Nova categoria', art: { type: 'tag', color: '#1c1c1c', detail: c.theme.colors.accent }, img: '' });
        opened.categorias = id;
        return commit();
      }
      case 'cat-del': {
        const { id, name } = c.categories[i];
        const n = c.products.filter((p) => p.cat === id).length;
        ask(`Excluir a categoria "${name}"?`, n ? `${n} produto(s) ficarão sem categoria (eles continuam no site).` : 'Dá para desfazer depois.', 'Excluir', true).then((ok) => {
          const k = cfg().categories.findIndex((x) => x.id === id);
          if (!ok || k < 0) return;
          cfg().products.forEach((p) => {
            if (p.cat === id) p.cat = '';
          });
          cfg().categories.splice(k, 1);
          commit();
        });
        return;
      }
      /* vídeo */
      case 'video-default':
        c.bubble.video = 'media:default-video';
        return commit();
      case 'video-reset-pos':
        BUBBLE.resetPos();
        SHOP.toast('Bolinha de volta ao lugar inicial', 'move');
        return;
      case 'video-test':
        peek(true);
        setTimeout(() => BUBBLE.openPlayer(), 200);
        return;
      /* publicar */
      case 'export':
        return EXPORT.download(t);
      case 'share':
        return EXPORT.share(t);
      case 'pin-save': {
        const inp = root.querySelector('#lxa-newpin');
        const v = (inp && inp.value.trim().toLowerCase()) || '';
        if (v.length < 4) return SHOP.toast('O PIN precisa ter pelo menos 4 caracteres', 'close');
        c.admin.pin = U.hash(v);
        U.store.set(OWNER_KEY, c.admin.pin);
        SHOP.toast('PIN salvo! Baixe o site para valer no arquivo publicado.', 'lock');
        return commit();
      }
      case 'reset':
        ask('Descartar as alterações?', 'Tudo volta a ser como está no arquivo do site. As mudanças feitas neste aparelho somem.', 'Descartar', true).then((ok) => {
          if (!ok) return;
          STATE.reset();
          render();
          SHOP.toast('Alterações descartadas', 'refresh');
        });
        return;
      case 'logout':
        U.store.del(OWNER_KEY);
        close();
        SHOP.toast('Você saiu do modo dono', 'lock');
        return;
      default:
    }
  }

  /* ====================================================================== */
  /* Abrir / fechar / espiar / modo edição                                   */
  /* ====================================================================== */
  const isOwner = () => U.store.get(OWNER_KEY) === cfg().admin.pin;

  /* Confirmação dentro da página (o confirm() do navegador é bloqueado em alguns lugares e é feio no celular) */
  function ask(title, detail, okLabel = 'Confirmar', danger = false) {
    return new Promise((resolve) => {
      const w = document.createElement('div');
      w.className = 'lxa-lock lxa-ask';
      w.setAttribute('role', 'alertdialog');
      w.setAttribute('aria-modal', 'true');
      w.setAttribute('aria-label', title);
      w.innerHTML = `<form><h3>${esc(title)}</h3>${detail ? `<p>${esc(detail)}</p>` : ''}<div class="lxa-lock-btns"><button type="button" data-x="1">Cancelar</button><button type="submit"${
        danger ? ' class="danger"' : ''
      }>${esc(okLabel)}</button></div></form>`;
      const onKey = (e) => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          done(false);
        }
      };
      const done = (v) => {
        w.remove();
        document.removeEventListener('keydown', onKey, true);
        resolve(v);
      };
      w.addEventListener('click', (e) => {
        if (e.target === w || e.target.closest('[data-x]')) done(false);
      });
      w.querySelector('form').addEventListener('submit', (e) => {
        e.preventDefault();
        done(true);
      });
      document.addEventListener('keydown', onKey, true);
      document.body.appendChild(w);
      setTimeout(() => w.querySelector('button[type="submit"]').focus(), 30);
    });
  }

  function floatBtn(cls, html, onclick) {
    const d = document.createElement('div');
    d.className = 'lxa-float ' + cls;
    d.innerHTML = html;
    d.addEventListener('click', onclick);
    document.body.appendChild(d);
    return d;
  }
  function refreshFloats() {
    const owner = isOwner();
    if (owner && !fab)
      fab = floatBtn('lxa-fab', `<button type="button" aria-label="Abrir painel">${icon('gear')}Painel</button>`, () => show());
    if (fab) fab.hidden = !owner || isOpen || peeking || UI.editing;
    if (!peekBar)
      peekBar = floatBtn('lxa-peek', `<button type="button" class="y" data-pk="back">${icon('gear')}Voltar ao painel</button>`, () => {
        peek(false);
      });
    peekBar.hidden = !(isOpen && peeking && !UI.editing);
    if (!editBar)
      editBar = floatBtn('lxa-editbar', `<span>${icon('edit')} Toque num texto com borda tracejada e escreva.</span><button type="button">Concluir</button>`, (e) => {
        if (e.target.closest('button')) editMode(false);
      });
    editBar.hidden = !UI.editing;
  }

  function show() {
    if (!root) build();
    root.hidden = false;
    isOpen = true;
    peeking = false;
    document.body.classList.remove('lxa-peeking');
    render();
    requestAnimationFrame(() => root.classList.add('open'));
    refreshFloats();
  }
  function close() {
    if (UI.editing) editMode(false, true);
    isOpen = false;
    peeking = false;
    document.body.classList.remove('lxa-peeking');
    if (root) {
      root.classList.remove('open');
      setTimeout(() => {
        if (!isOpen) root.hidden = true;
      }, 360);
    }
    STATE.checkpoint();
    refreshFloats();
  }
  function peek(on) {
    peeking = on;
    document.body.classList.toggle('lxa-peeking', on);
    if (!on) render();
    refreshFloats();
  }

  function lock() {
    const wrap = document.createElement('div');
    wrap.className = 'lxa-lock';
    const isDefault = cfg().admin.pin === DEFAULT_PIN;
    wrap.innerHTML = `<form autocomplete="off"><div class="lxa-lock-ic">${icon('lock')}</div><h3>Painel da loja</h3><p>Digite o PIN para editar o site.${isDefault ? ' (PIN inicial: <b>luxx</b>)' : ''}</p>
      <input type="password" name="pin" aria-label="PIN" autocomplete="current-password" autofocus><div class="lxa-err" aria-live="polite"></div>
      <div class="lxa-lock-btns"><button type="button" data-x="1">Cancelar</button><button type="submit">Entrar</button></div></form>`;
    document.body.appendChild(wrap);
    const form = wrap.querySelector('form');
    const inp = form.pin;
    setTimeout(() => inp.focus(), 50);
    wrap.addEventListener('click', (e) => {
      if (e.target === wrap || e.target.closest('[data-x]')) wrap.remove();
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (U.hash(inp.value.trim().toLowerCase()) === cfg().admin.pin) {
        U.store.set(OWNER_KEY, cfg().admin.pin);
        wrap.remove();
        show();
      } else {
        wrap.querySelector('.lxa-err').textContent = 'PIN incorreto';
        form.classList.remove('shake');
        void form.offsetWidth;
        form.classList.add('shake');
        inp.select();
      }
    });
  }

  function open() {
    if (isOwner()) show();
    else lock();
  }

  /* ---------- edição direto no site ---------- */
  function enableInline() {
    U.$$('#luxx-root [data-edit]').forEach((el) => {
      el.setAttribute('contenteditable', 'true');
      el.setAttribute('spellcheck', 'true');
    });
  }
  function editMode(on, silent) {
    UI.editing = on;
    document.body.classList.toggle('lx-editing', on);
    if (on) {
      SHOP.closeModal();
      SHOP.closeCart();
      peek(true);
    }
    R.mount();
    if (on) enableInline();
    else if (!silent) {
      STATE.checkpoint();
      peek(false);
    }
    refreshFloats();
  }
  function inlineInput(e) {
    const el = e.target.closest && e.target.closest('#luxx-root [data-edit][contenteditable]');
    if (!el) return;
    const v = el.dataset.ml ? el.innerText.replace(/ /g, ' ').replace(/\n{3,}/g, '\n\n') : el.textContent.replace(/ /g, ' ').replace(/\s*\n\s*/g, ' ');
    U.set(cfg(), el.dataset.edit, v);
    STATE.touch('inline');
  }

  function checkHash() {
    if (/^#(admin|painel)$/i.test(location.hash)) {
      try {
        history.replaceState(null, '', location.pathname + location.search);
      } catch (e) {}
      open();
    }
  }

  function init() {
    STATE.on((why) => {
      if (why === 'undo' || why === 'redo' || why === 'replace') {
        if (isOpen) render();
      }
      status();
    });
    document.addEventListener('input', inlineInput);
    document.addEventListener('keydown', (e) => {
      const el = e.target.closest && e.target.closest('#luxx-root [data-edit][contenteditable]');
      if (el && e.key === 'Enter' && !el.dataset.ml) {
        e.preventDefault();
        el.blur();
      }
      if (e.key === 'Escape' && isOpen && !peeking && !document.querySelector('.lxa-lock')) close();
    });
    document.addEventListener('paste', (e) => {
      const el = e.target.closest && e.target.closest('#luxx-root [data-edit][contenteditable]');
      if (!el) return;
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData('text');
      document.execCommand('insertText', false, el.dataset.ml ? text : text.replace(/\s*\n\s*/g, ' '));
    });
    window.addEventListener('hashchange', checkHash);
    checkHash();
    refreshFloats();
  }

  return { init, open, show, close, ask, enableInline, get isOpen() { return isOpen; } };
})();
