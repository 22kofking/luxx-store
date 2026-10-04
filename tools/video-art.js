/* ==========================================================================
   LUXX STORE — ilustrações vetoriais das peças, usadas só por make-video.mjs
   para desenhar o vídeo padrão da bolinha (o site não usa mais ilustrações)
   Cada peça aceita: { type, color, detail, print, sole }
   ========================================================================== */
const ART = (() => {
  let seq = 0;
  const S = U.shade;
  const BOLT = 'M13 2 3 14h9l-1 8 10-12h-9l1-8z';

  const tone = (c) => {
    const dark = U.luma(c) < 0.2;
    return {
      c,
      d1: S(c, -0.16),
      d2: S(c, -0.34),
      d3: S(c, -0.55),
      l1: S(c, dark ? 0.14 : 0.16),
      l2: S(c, dark ? 0.26 : 0.32),
      seam: dark ? 'rgba(255,255,255,.16)' : 'rgba(0,0,0,.2)',
      rim: dark ? 'rgba(255,255,255,.22)' : 'rgba(255,255,255,.35)',
      edge: dark ? 'rgba(255,255,255,.14)' : 'rgba(0,0,0,.16)',
    };
  };

  const bolt = (x, y, size, fill, extra = '') =>
    `<path transform="translate(${x - size / 2} ${y - size / 2}) scale(${size / 24})" d="${BOLT}" fill="${fill}" ${extra}/>`;

  const word = (x, y, size, fill, txt = 'LUXX', extra = '') =>
    `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-size="${size}" font-weight="900" letter-spacing="${size * 0.06}" fill="${fill}" style="font-family:var(--f-logo,'Arial Black',Impact,sans-serif)" ${extra}>${txt}</text>`;

  /* estampa no peito/centro */
  const print = (p, x, y, s) => {
    const col = p.detail || '#ffd400';
    switch (p.print) {
      case 'none':
        return '';
      case 'logo':
        return word(x, y, 26 * s, col);
      case 'big':
        return bolt(x, y + 6 * s, 92 * s, col);
      case 'stack':
        return word(x, y - 16 * s, 24 * s, col) + word(x, y + 12 * s, 24 * s, 'none', 'LUXX', `stroke="${col}" stroke-width="1.4"`) + word(x, y + 40 * s, 24 * s, 'none', 'LUXX', `stroke="${col}" stroke-width="1.4" opacity=".55"`);
      case 'small':
        return bolt(x + 38 * s, y - 22 * s, 24 * s, col);
      case 'bolt':
      default:
        return bolt(x, y, 48 * s, col);
    }
  };

  const shadow = (cx, cy, rx, ry, o = 0.5) => {
    const id = 'lxs' + ++seq;
    return `<defs><radialGradient id="${id}"><stop offset="0" stop-color="#000" stop-opacity="${o}"/><stop offset=".6" stop-color="#000" stop-opacity="${o * 0.35}"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient></defs><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${id})"/>`;
  };

  /* ----------------------------------------------------------------- tee */
  const tee = (p) => {
    const t = tone(p.color);
    const body =
      'M163 56 Q200 92 237 56 Q270 64 302 74 Q332 102 360 146 Q342 172 318 188 L284 160 Q282 250 286 336 Q200 350 114 336 Q118 250 116 160 L82 188 Q58 172 40 146 Q68 102 98 74 Q130 64 163 56Z';
    return `
      ${shadow(200, 352, 150, 16)}
      <path d="${body}" fill="${t.c}"/>
      <path d="M116 160 Q118 250 114 336 Q126 339 138 341 Q132 250 136 170Z" fill="#000" opacity=".1"/>
      <path d="M284 160 Q282 250 286 336 Q274 339 262 341 Q268 250 264 170Z" fill="#000" opacity=".1"/>
      <path d="M98 74 Q68 102 40 146 Q58 172 82 188 L116 160 Q100 118 98 74Z" fill="#000" opacity=".06"/>
      <path d="M302 74 Q332 102 360 146 Q342 172 318 188 L284 160 Q300 118 302 74Z" fill="#000" opacity=".06"/>
      <path d="M118 158 Q104 118 100 80 M282 158 Q296 118 300 80" fill="none" stroke="${t.seam}" stroke-width="1.4" stroke-dasharray="4 4"/>
      <path d="M163 56 Q200 92 237 56 Q200 70 163 56Z" fill="${t.d3}"/>
      <path d="M161 55 Q200 98 239 55" fill="none" stroke="${t.d1}" stroke-width="8" stroke-linecap="round"/>
      <path d="M48 154 Q64 176 86 192" fill="none" stroke="${t.seam}" stroke-width="2" stroke-dasharray="4 4"/>
      <path d="M352 154 Q336 176 314 192" fill="none" stroke="${t.seam}" stroke-width="2" stroke-dasharray="4 4"/>
      <path d="M116 326 Q200 340 284 326" fill="none" stroke="${t.seam}" stroke-width="2" stroke-dasharray="4 4"/>
      <path d="M150 200 Q170 260 160 320 M248 210 Q236 260 244 318" fill="none" stroke="#000" stroke-opacity=".08" stroke-width="6" stroke-linecap="round"/>
      <path d="${body}" fill="none" stroke="${t.edge}" stroke-width="1.5"/>
      ${print(p, 200, 160, 1)}
    `;
  };

  /* -------------------------------------------------------------- hoodie */
  const sweatBody =
    'M156 98 Q200 126 244 98 L302 108 Q338 120 350 176 L368 290 L326 302 L304 198 L294 188 Q292 252 294 316 L106 316 Q108 252 106 188 L96 198 L74 302 L32 290 L50 176 Q62 120 98 108Z';
  const sweatBase = (t, p, withPocket) => `
      <path d="${sweatBody}" fill="${t.c}"/>
      <path d="M106 188 Q108 252 106 316 L128 316 Q124 250 130 196Z" fill="#000" opacity=".1"/>
      <path d="M294 188 Q292 252 294 316 L272 316 Q276 250 270 196Z" fill="#000" opacity=".1"/>
      <path d="M98 108 Q62 120 50 176 L32 290 L74 302 L96 198 Q108 150 98 108Z" fill="#000" opacity=".08"/>
      <path d="M302 108 Q338 120 350 176 L368 290 L326 302 L304 198 Q292 150 302 108Z" fill="#000" opacity=".08"/>
      <path d="M96 196 Q104 150 100 112 M304 196 Q296 150 300 112" fill="none" stroke="${t.seam}" stroke-width="1.4" stroke-dasharray="4 4"/>
      <path d="M74 300 L32 288 L27 316 L69 328Z" fill="${t.d1}"/>
      <path d="M326 300 L368 288 L373 316 L331 328Z" fill="${t.d1}"/>
      <path d="M106 314 L294 314 L292 348 L108 348Z" fill="${t.d1}"/>
      <path d="M114 318 V344 M126 318 V344 M138 318 V344 M150 318 V344 M162 318 V344 M174 318 V344 M186 318 V344 M198 318 V344 M210 318 V344 M222 318 V344 M234 318 V344 M246 318 V344 M258 318 V344 M270 318 V344 M282 318 V344" stroke="${t.seam}" stroke-width="1.2"/>
      <path d="M36 296 L31 314 M48 299 L43 318 M60 302 L55 321 M340 299 L345 318 M352 296 L357 314 M364 293 L369 311" stroke="${t.seam}" stroke-width="1.2"/>
      ${withPocket ? `
      <path d="M138 232 L262 232 Q268 268 282 302 L118 302 Q132 268 138 232Z" fill="${t.d1}" opacity=".55"/>
      <path d="M138 232 Q132 268 118 302 M262 232 Q268 268 282 302" fill="none" stroke="${t.d2}" stroke-width="3" stroke-linecap="round"/>
      <path d="M140 237 H260" stroke="${t.seam}" stroke-width="1.6" stroke-dasharray="4 4"/>` : ''}
      <path d="M150 210 Q160 260 156 306 M250 210 Q240 260 246 306" fill="none" stroke="#000" stroke-opacity=".08" stroke-width="6" stroke-linecap="round"/>
      <path d="${sweatBody}" fill="none" stroke="${t.edge}" stroke-width="1.5"/>
  `;

  const hoodie = (p) => {
    const t = tone(p.color);
    const cord = p.detail && p.print !== 'none' ? p.detail : t.l2;
    return `
      ${shadow(200, 352, 160, 16)}
      <path d="M136 116 C126 56 166 28 200 28 C234 28 274 56 264 116Z" fill="${t.d1}"/>
      <path d="M136 116 C126 56 166 28 200 28 C234 28 274 56 264 116Z" fill="none" stroke="${t.edge}" stroke-width="1.5"/>
      ${sweatBase(t, p, true)}
      <path d="M154 104 C150 64 174 46 200 46 C226 46 250 64 246 104 Q200 138 154 104Z" fill="${t.d3}"/>
      <path d="M152 100 C148 58 174 40 200 40 C226 40 252 58 248 100" fill="none" stroke="${t.d1}" stroke-width="6"/>
      <path d="M154 102 Q200 136 246 102" fill="none" stroke="${t.l1}" stroke-width="5" stroke-linecap="round"/>
      <path d="M184 120 Q182 140 180 160 M216 120 Q218 140 220 160" fill="none" stroke="${cord}" stroke-width="4" stroke-linecap="round"/>
      <rect x="176" y="158" width="8" height="15" rx="3" fill="${cord}"/>
      <rect x="216" y="158" width="8" height="15" rx="3" fill="${cord}"/>
      <circle cx="184" cy="120" r="4" fill="${t.d2}"/><circle cx="216" cy="120" r="4" fill="${t.d2}"/>
      ${print(p, 200, 206, 0.8)}
    `;
  };

  const crewneck = (p) => {
    const t = tone(p.color);
    return `
      ${shadow(200, 352, 160, 16)}
      ${sweatBase(t, p, false)}
      <path d="M156 98 Q200 126 244 98 Q200 110 156 98Z" fill="${t.d3}"/>
      <path d="M154 96 Q200 134 246 96" fill="none" stroke="${t.d1}" stroke-width="10" stroke-linecap="round"/>
      <path d="M160 101 Q200 128 240 101" fill="none" stroke="${t.seam}" stroke-width="1.2" stroke-dasharray="3 3"/>
      ${print(p, 200, 185, 1)}
    `;
  };

  /* -------------------------------------------------------------- jacket */
  const jacket = (p) => {
    const t = tone(p.color);
    const d = tone(p.detail || '#ffd400');
    const id = 'lxc' + ++seq;
    return `
      ${shadow(200, 352, 160, 16)}
      <defs><clipPath id="${id}"><path d="${sweatBody}"/></clipPath></defs>
      ${sweatBase(t, p, false)}
      <g clip-path="url(#${id})">
        <path d="M0 150 L400 150 L400 206 L0 206Z" fill="${d.c}"/>
        <path d="M0 206 L400 206" stroke="${d.d2}" stroke-width="2"/>
        <path d="M0 150 L400 150" stroke="${d.d2}" stroke-width="2"/>
      </g>
      <path d="M158 98 L160 72 Q200 84 240 72 L242 98 Q200 114 158 98Z" fill="${t.d1}"/>
      <path d="M160 72 Q200 84 240 72" fill="none" stroke="${t.l1}" stroke-width="2"/>
      <path d="M200 106 V312" stroke="${t.d3}" stroke-width="5"/>
      <path d="M200 106 V312" stroke="${t.l2}" stroke-width="1.5" stroke-dasharray="2 3"/>
      <rect x="194" y="112" width="12" height="20" rx="3" fill="${p.detail || '#ffd400'}" stroke="${t.d3}" stroke-width="1.5"/>
      <path d="M226 230 L262 226" stroke="${t.d3}" stroke-width="3" stroke-linecap="round"/>
      <path d="M138 230 L174 234" stroke="${t.d3}" stroke-width="3" stroke-linecap="round"/>
      ${p.print === 'none' ? '' : word(252, 178, 15, t.c, 'LUXX')}
    `;
  };

  /* --------------------------------------------------------------- pants */
  const pants = (p) => {
    const t = tone(p.color);
    const legs = 'M130 60 L270 60 L284 150 Q288 250 270 334 L224 336 Q214 252 204 162 Q200 150 196 162 Q186 252 176 336 L130 334 Q112 250 116 150Z';
    return `
      ${shadow(200, 362, 120, 14)}
      <path d="${legs}" fill="${t.c}"/>
      <path d="M204 162 Q214 252 224 336 L238 336 Q226 250 214 166Z" fill="#000" opacity=".18"/>
      <path d="M196 162 Q186 252 176 336 L162 336 Q174 250 186 166Z" fill="#000" opacity=".18"/>
      <path d="M116 150 Q112 250 130 334 L144 334 Q128 250 134 156Z" fill="#000" opacity=".12"/>
      <path d="M284 150 Q288 250 270 334 L256 334 Q272 250 266 156Z" fill="#000" opacity=".12"/>
      <rect x="128" y="36" width="144" height="28" rx="5" fill="${t.d1}"/>
      <path d="M128 50 H272" stroke="${t.seam}" stroke-width="1.2" stroke-dasharray="3 3"/>
      <path d="M190 64 Q188 84 182 96 M210 64 Q212 84 218 96" fill="none" stroke="${p.detail || t.l2}" stroke-width="3" stroke-linecap="round"/>
      <path d="M200 64 V126 Q200 136 190 140" fill="none" stroke="${t.seam}" stroke-width="2"/>
      <path d="M140 64 Q138 96 122 112 M260 64 Q262 96 278 112" fill="none" stroke="${t.d2}" stroke-width="2.5"/>
      <rect x="114" y="184" width="44" height="62" rx="5" fill="${t.d1}" stroke="${t.seam}" stroke-width="1.4" stroke-dasharray="3 3"/>
      <rect x="112" y="180" width="48" height="18" rx="4" fill="${t.d2}"/>
      <rect x="242" y="184" width="44" height="62" rx="5" fill="${t.d1}" stroke="${t.seam}" stroke-width="1.4" stroke-dasharray="3 3"/>
      <rect x="240" y="180" width="48" height="18" rx="4" fill="${t.d2}"/>
      <rect x="130" y="326" width="48" height="26" rx="5" fill="${t.d1}"/>
      <rect x="222" y="326" width="48" height="26" rx="5" fill="${t.d1}"/>
      <path d="M138 330 V348 M146 330 V348 M154 330 V348 M162 330 V348 M170 330 V348 M230 330 V348 M238 330 V348 M246 330 V348 M254 330 V348 M262 330 V348" stroke="${t.seam}" stroke-width="1.2"/>
      ${p.print === 'none' ? '' : bolt(264, 214, 18, p.detail || '#ffd400')}
      <path d="${legs}" fill="none" stroke="${t.edge}" stroke-width="1.5"/>
    `;
  };

  /* -------------------------------------------------------------- shorts */
  const shorts = (p) => {
    const t = tone(p.color);
    const legs = 'M128 92 L272 92 Q286 170 296 250 L212 262 Q206 196 200 182 Q194 196 188 262 L104 250 Q114 170 128 92Z';
    return `
      ${shadow(200, 300, 140, 14)}
      <path d="${legs}" fill="${t.c}"/>
      <path d="M200 182 Q206 196 212 262 L226 260 Q218 200 206 172Z" fill="#000" opacity=".18"/>
      <path d="M200 182 Q194 196 188 262 L174 260 Q182 200 194 172Z" fill="#000" opacity=".18"/>
      <path d="M128 92 Q114 170 104 250 L122 252 Q128 170 140 104Z" fill="#000" opacity=".12"/>
      <path d="M272 92 Q286 170 296 250 L278 252 Q272 170 260 104Z" fill="#000" opacity=".12"/>
      <rect x="126" y="70" width="148" height="28" rx="6" fill="${t.d1}"/>
      <path d="M134 76 V92 M146 76 V92 M158 76 V92 M170 76 V92 M182 76 V92 M218 76 V92 M230 76 V92 M242 76 V92 M254 76 V92 M266 76 V92" stroke="${t.seam}" stroke-width="1.2"/>
      <path d="M192 98 Q190 120 184 136 M208 98 Q210 120 216 136" fill="none" stroke="${p.detail || t.l2}" stroke-width="3" stroke-linecap="round"/>
      <path d="M200 98 V150" stroke="${t.seam}" stroke-width="2"/>
      <path d="M138 98 Q136 130 118 146 M262 98 Q264 130 282 146" fill="none" stroke="${t.d2}" stroke-width="2.5"/>
      <path d="M108 240 L188 250 M212 250 L292 240" fill="none" stroke="${t.seam}" stroke-width="1.6" stroke-dasharray="4 4"/>
      ${p.print === 'none' ? '' : bolt(250, 212, 26, p.detail || '#ffd400')}
      <path d="${legs}" fill="none" stroke="${t.edge}" stroke-width="1.5"/>
    `;
  };

  /* ------------------------------------------------------------- sneaker */
  const sneaker = (p) => {
    const t = tone(p.color);
    const sole = p.sole || '#f1efe9';
    const st = tone(sole);
    const d = p.detail || '#ffd400';
    const upper = 'M64 262 Q48 238 82 222 L150 200 Q190 184 212 156 L234 140 Q254 128 278 134 L308 138 Q338 138 350 160 Q362 190 360 256Z';
    return `
      ${shadow(204, 322, 172, 14, 0.6)}
      <path d="M44 286 Q44 306 66 310 L338 310 Q360 306 360 286Z" fill="${st.d2}"/>
      <path d="M44 290 Q36 262 70 256 L336 248 Q362 248 362 272 L360 292 Q200 300 44 290Z" fill="${sole}"/>
      <path d="M58 280 Q200 286 352 276" fill="none" stroke="${st.d1}" stroke-width="2"/>
      <path d="${upper}" fill="${t.c}"/>
      <path d="M64 262 Q48 238 82 222 L122 210 Q104 236 112 260Z" fill="${t.d1}"/>
      <path d="M306 138 Q338 138 350 160 Q362 190 360 256 L300 258 Q292 196 306 138Z" fill="${t.d1}"/>
      <path d="M118 212 Q104 236 112 260 M300 258 Q292 196 306 140" fill="none" stroke="${t.seam}" stroke-width="1.6" stroke-dasharray="4 4"/>
      <path d="M232 140 Q254 128 278 134 L308 138 Q302 154 270 156 Q242 156 232 140Z" fill="${t.d3}"/>
      <path d="M210 158 L222 108 Q236 98 252 106 L248 140Z" fill="${t.l1}"/>
      <path d="M222 108 Q236 98 252 106" fill="none" stroke="${t.edge}" stroke-width="1.5"/>
      <path transform="translate(150 158) rotate(-8) scale(5.4 4.2) translate(-3 -2)" d="${BOLT}" fill="${d}"/>
      <path d="M152 202 L170 186 M166 194 L184 176 M180 184 L198 166 M194 174 L212 156 M208 164 L226 146" stroke="${t.l2}" stroke-width="5" stroke-linecap="round"/>
      <path d="M152 202 L170 186 M166 194 L184 176 M180 184 L198 166 M194 174 L212 156 M208 164 L226 146" stroke="${t.d2}" stroke-width="1" stroke-linecap="round" opacity=".5"/>
      <path d="M346 160 L356 124 Q362 120 366 126 L360 168Z" fill="${d}"/>
      <path d="${upper}" fill="none" stroke="${t.edge}" stroke-width="1.5"/>
      <path d="M70 252 Q200 246 354 244" fill="none" stroke="${t.seam}" stroke-width="1.4" stroke-dasharray="3 4"/>
    `;
  };

  /* --------------------------------------------------------------- slide */
  const slideOne = (t, d, p, dx, dy, sc, dim) => {
    const strap = p.strapColor || t.c;
    const s = tone(strap);
    return `
    <g transform="translate(${dx} ${dy}) scale(${sc})" ${dim ? 'opacity=".5"' : ''}>
      <path d="M58 302 Q38 302 40 284 Q44 262 78 262 L318 254 Q356 252 360 278 Q362 302 330 304Z" fill="${t.d1}"/>
      <path d="M58 288 Q44 288 46 274 Q52 262 80 260 L318 252 Q350 250 354 266 Q356 282 330 284Z" fill="${t.c}"/>
      <path d="M46 276 Q200 276 356 270" fill="none" stroke="${t.l1}" stroke-width="2" opacity=".6"/>
      <path d="M52 294 Q200 294 354 288" fill="none" stroke="${t.d2}" stroke-width="2"/>
      <path d="M314 254 Q352 248 356 266" fill="none" stroke="${t.l2}" stroke-width="3" stroke-linecap="round" opacity=".5"/>
      <path d="M70 264 Q72 214 120 200 Q170 188 214 198 Q244 206 246 260Z" fill="${s.c}"/>
      <path d="M70 264 Q72 214 120 200 Q170 188 214 198 Q244 206 246 260" fill="none" stroke="${s.edge}" stroke-width="2"/>
      <path d="M86 258 Q88 222 124 212 Q168 202 208 210 Q230 216 232 256" fill="none" stroke="${s.seam}" stroke-width="1.6" stroke-dasharray="4 4"/>
      <path d="M84 240 Q96 210 136 202" fill="none" stroke="${s.rim}" stroke-width="4" stroke-linecap="round" opacity=".6"/>
      ${p.print === 'none' ? '' : word(160, 234, 30, d, 'LUXX', 'transform="rotate(-2 160 234)"')}
    </g>`;
  };
  const slide = (p) => {
    const t = tone(p.color);
    const d = p.detail || '#ffd400';
    return `
      ${shadow(210, 316, 176, 14, 0.6)}
      ${slideOne(t, d, p, 52, -66, 0.92, true)}
      ${slideOne(t, d, p, 0, 0, 1, false)}
    `;
  };

  /* ----------------------------------------------------------------- cap */
  const cap = (p) => {
    const t = tone(p.color);
    const d = p.detail || '#ffd400';
    return `
      ${shadow(200, 314, 150, 14)}
      <path d="M96 238 C88 150 150 106 206 106 C270 106 316 152 308 238Z" fill="${t.c}"/>
      <path d="M96 238 C88 150 150 106 206 106 C150 130 128 190 130 238Z" fill="#000" opacity=".14"/>
      <path d="M206 108 Q178 160 168 238 M206 108 Q238 160 250 238" fill="none" stroke="${t.seam}" stroke-width="2"/>
      <path d="M206 108 Q150 140 124 238 M206 108 Q268 140 286 238" fill="none" stroke="${t.seam}" stroke-width="1.2" stroke-dasharray="3 3"/>
      <circle cx="206" cy="108" r="8" fill="${t.d1}"/>
      <circle cx="150" cy="150" r="3.5" fill="${t.d2}"/><circle cx="264" cy="150" r="3.5" fill="${t.d2}"/>
      <path d="M70 244 Q200 214 334 240 Q356 254 336 272 Q200 294 82 270 Q56 258 70 244Z" fill="${t.d1}"/>
      <path d="M78 248 Q200 222 328 244 Q340 252 332 258 Q200 238 86 262 Q74 256 78 248Z" fill="${t.l1}" opacity=".55"/>
      <path d="M84 266 Q200 286 330 268" fill="none" stroke="${t.seam}" stroke-width="1.6" stroke-dasharray="4 4"/>
      <path d="M96 238 Q200 218 308 238" fill="none" stroke="${t.d2}" stroke-width="3"/>
      ${p.print === 'logo' ? word(208, 180, 30, d) : bolt(208, 178, 58, d)}
    `;
  };

  /* --------------------------------------------------------------- chain */
  const chain = (p) => {
    const c = p.color || '#d9b44a';
    const t = tone(c);
    const n = 30;
    let links = '';
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      const cx = 200 + Math.cos(a) * 128;
      const cy = 178 + Math.sin(a) * 118;
      const ang = (Math.atan2(Math.cos(a) * 118, -Math.sin(a) * 128) * 180) / Math.PI;
      const odd = i % 2;
      links += `<g transform="translate(${cx.toFixed(1)} ${cy.toFixed(1)}) rotate(${(ang + (odd ? 8 : -8)).toFixed(1)})">
        <rect x="-15" y="-10" width="30" height="20" rx="9" fill="${odd ? t.d1 : t.c}" stroke="${t.d2}" stroke-width="1.5"/>
        <rect x="-8" y="-4" width="16" height="8" rx="4" fill="${t.d3}"/>
        <path d="M-11 -6 Q0 -10 11 -6" fill="none" stroke="${t.l2}" stroke-width="2" stroke-linecap="round" opacity=".8"/>
      </g>`;
    }
    const d = p.detail || c;
    return `
      ${shadow(200, 330, 140, 12, 0.45)}
      ${links}
      <path d="M200 296 V312" stroke="${t.d1}" stroke-width="4"/>
      <g transform="translate(0 6)">
        <path transform="translate(168 306) scale(2.7)" d="${BOLT}" fill="${d}" stroke="${t.d2}" stroke-width=".6"/>
        <path transform="translate(168 306) scale(2.7)" d="M13 2 3 14h4" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width=".8"/>
      </g>
    `;
  };

  /* ------------------------------------------------------------- glasses */
  const glasses = (p) => {
    const t = tone(p.color || '#111111');
    const lens = U.mix(p.detail || '#ffd400', '#000000', 0.55);
    const id = 'lxg' + ++seq;
    const L = 'M78 176 Q130 166 186 176 Q190 224 166 242 Q118 254 88 232 Q70 210 78 176Z';
    const R = 'M222 176 Q270 166 322 176 Q330 210 312 232 Q282 254 234 242 Q210 224 222 176Z';
    return `
      ${shadow(200, 300, 150, 12, 0.45)}
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${U.shade(lens, 0.25)}"/><stop offset=".55" stop-color="${lens}"/><stop offset="1" stop-color="${U.shade(lens, -0.5)}"/></linearGradient></defs>
      <path d="M66 172 L46 178 L44 186 L70 184Z M334 172 L354 178 L356 186 L330 184Z" fill="${t.d1}"/>
      <path d="${L}" fill="url(#${id})"/><path d="${R}" fill="url(#${id})"/>
      <path d="M96 190 L132 182 L104 226Z M240 190 L276 182 L248 226Z" fill="#fff" opacity=".14"/>
      <path d="${L}" fill="none" stroke="${t.c}" stroke-width="7"/><path d="${R}" fill="none" stroke="${t.c}" stroke-width="7"/>
      <path d="M64 168 Q200 146 336 168 L334 184 Q200 164 66 184Z" fill="${t.c}"/>
      <path d="M70 170 Q200 150 330 170" fill="none" stroke="${t.rim}" stroke-width="2" opacity=".6"/>
      <path d="M186 182 Q200 172 214 182" fill="none" stroke="${t.c}" stroke-width="7"/>
      ${bolt(84, 176, 14, p.detail || '#ffd400')}
    `;
  };

  /* ----------------------------------------------------------------- bag */
  const bag = (p) => {
    const t = tone(p.color);
    const d = p.detail || '#ffd400';
    return `
      ${shadow(200, 318, 130, 12)}
      <path d="M124 196 C104 52 296 52 276 196" fill="none" stroke="${t.d1}" stroke-width="14" stroke-linecap="round"/>
      <path d="M124 196 C104 52 296 52 276 196" fill="none" stroke="${t.seam}" stroke-width="1.4" stroke-dasharray="4 4"/>
      <rect x="96" y="178" width="208" height="124" rx="30" fill="${t.c}"/>
      <rect x="96" y="178" width="208" height="124" rx="30" fill="none" stroke="${t.edge}" stroke-width="1.5"/>
      <path d="M96 236 Q100 296 126 302 L130 302 Q108 280 110 220Z" fill="#000" opacity=".15"/>
      <path d="M120 200 H280" stroke="${t.d3}" stroke-width="5" stroke-linecap="round"/>
      <path d="M120 200 H280" stroke="${t.l2}" stroke-width="1.4" stroke-dasharray="2 3"/>
      <rect x="252" y="194" width="16" height="26" rx="4" fill="${d}"/>
      <rect x="120" y="222" width="160" height="66" rx="18" fill="${t.d1}"/>
      <rect x="120" y="222" width="160" height="66" rx="18" fill="none" stroke="${t.seam}" stroke-width="1.4" stroke-dasharray="4 4"/>
      <rect x="168" y="240" width="64" height="30" rx="6" fill="${d}"/>
      ${word(200, 256, 15, U.luma(d) > 0.5 ? '#111' : '#fff')}
    `;
  };

  /* ---------------------------------------------------------------- tag (genérico) */
  const tag = (p) => {
    const t = tone(p.color || '#222222');
    const d = p.detail || '#ffd400';
    return `
      ${shadow(200, 320, 120, 12)}
      <path d="M120 120 L230 90 L310 170 L230 290 L120 260Z" fill="${t.c}" stroke="${t.edge}" stroke-width="2"/>
      <circle cx="152" cy="150" r="12" fill="${t.d3}"/>
      ${bolt(220, 190, 70, d)}
    `;
  };

  const TYPES = {
    tee: { label: 'Camiseta', fn: tee },
    hoodie: { label: 'Moletom com capuz', fn: hoodie },
    crewneck: { label: 'Moletom careca', fn: crewneck },
    jacket: { label: 'Jaqueta', fn: jacket },
    pants: { label: 'Calça', fn: pants },
    shorts: { label: 'Bermuda', fn: shorts },
    sneaker: { label: 'Tênis', fn: sneaker },
    slide: { label: 'Slide / Chinelo', fn: slide },
    cap: { label: 'Boné', fn: cap },
    chain: { label: 'Corrente', fn: chain },
    glasses: { label: 'Óculos', fn: glasses },
    bag: { label: 'Bolsa / Shoulder bag', fn: bag },
    tag: { label: 'Genérico', fn: tag },
  };

  const PRINTS = {
    bolt: 'Raio no centro',
    small: 'Raio pequeno no peito',
    big: 'Raio gigante',
    logo: 'Escrita LUXX',
    stack: 'LUXX repetido',
    none: 'Sem estampa',
  };

  function svg(art, opts = {}) {
    const a = art || {};
    const def = TYPES[a.type] || TYPES.tag;
    const p = { color: '#1c1c1c', detail: '#ffd400', print: 'bolt', ...a };
    const label = opts.label ? ` role="img" aria-label="${U.esc(opts.label)}"` : ' aria-hidden="true"';
    return `<svg class="${opts.cls || 'art'}" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"${label}>${def.fn(p)}</svg>`;
  }

  return { svg, TYPES, PRINTS, BOLT };
})();
