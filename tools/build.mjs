// Monta o site em um único arquivo: "LUXX STORE SITE.html".
// Também gera index.html: um atalho que abre o "LUXX STORE SITE.html" (útil na hospedagem —
// para atualizar o site basta substituir só o arquivo que o painel baixa, sem renomear nada).
// Uso: node tools/build.mjs
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath, pathToFileURL } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const defaults = (await import(pathToFileURL(path.join(ROOT, 'src/defaults.mjs')).href)).default;

const jsFiles = fs.readdirSync(path.join(ROOT, 'src/js')).filter((f) => f.endsWith('.js')).sort();
const js = jsFiles.map((f) => `/* ---- ${f} ---- */\n` + read('src/js/' + f)).join('\n');
const bundle = `(function () {\n'use strict';\n${js}\n})();`;
if (/<\/script|<!--/i.test(bundle)) throw new Error('O JavaScript contém "</script" ou "<!--", o que quebraria o HTML.');

// usa o próprio módulo de tema para calcular as variáveis iniciais (sem flash de cor errada)
const ctx = vm.createContext({ console, Intl, encodeURIComponent });
vm.runInContext(read('src/js/00-util.js') + '\n' + read('src/js/05-theme.js') + '\n;globalThis.__THEME = THEME;', ctx);
const THEME = ctx.__THEME;

const css = read('src/css/site.css') + '\n' + read('src/css/panel.css');
if (/<\/style/i.test(css)) throw new Error('CSS contém "</style".');
const video = 'data:video/mp4;base64,' + fs.readFileSync(path.join(ROOT, 'assets/luxx-bubble.mp4')).toString('base64');
const escAttr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const escText = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

const map = {
  TITLE: escText(defaults.seo.title),
  DESCRIPTION: escAttr(defaults.seo.description),
  FAVICON: escAttr(THEME.faviconHref(defaults)),
  FONTS: escAttr(THEME.fontsUrl(defaults)),
  VARS: THEME.vars(defaults),
  CSS: css,
  DATA: JSON.stringify(defaults).replace(/</g, '\\u003c'),
  VIDEO: video,
  JS: bundle,
};
// substituição em uma passada só (o conteúdo inserido nunca é reprocessado)
const html = read('src/template.html').replace(/\{\{(\w+)\}\}/g, (m, k) => {
  if (!(k in map)) throw new Error('Marcador desconhecido: ' + m);
  return map[k];
});

fs.writeFileSync(path.join(ROOT, 'LUXX STORE SITE.html'), html);

const target = 'LUXX%20STORE%20SITE.html';
const index = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${map.TITLE}</title>
<meta name="description" content="${map.DESCRIPTION}">
<meta property="og:type" content="website">
<meta property="og:title" content="${escAttr(defaults.seo.title)}">
<meta property="og:description" content="${map.DESCRIPTION}">
<meta name="theme-color" content="#0a0a0a">
<link rel="icon" href="${map.FAVICON}">
<script>location.replace('${target}' + location.search + location.hash);</script>
<noscript><meta http-equiv="refresh" content="0; url=${target}"></noscript>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0a0a0a;color:#ffd400;font:800 14px system-ui,sans-serif;letter-spacing:.2em}</style>
</head>
<body><a href="${target}" style="color:inherit">LUXX STORE ⚡</a></body>
</html>
`;
fs.writeFileSync(path.join(ROOT, 'index.html'), index);
console.log(`ok — LUXX STORE SITE.html (${(html.length / 1024).toFixed(0)} KB, ${jsFiles.length} módulos JS) + index.html (atalho)`);

// Opcional: versão para publicar como Artifact no claude.ai (a plataforma coloca o <html>/<head>;
// o arquivo começa direto pelo <title>). Uso: node tools/build.mjs --artifact caminho/saida.html
const ai = process.argv.indexOf('--artifact');
if (ai > -1) {
  const out = process.argv[ai + 1];
  if (!out) throw new Error('Informe o caminho: --artifact saida.html');
  const head = read('src/template.html');
  const bodyStart = head.indexOf('<div id="luxx-root">');
  const bodyEnd = head.lastIndexOf('</body>');
  const content =
    `<title>${escText(defaults.brand.name)}</title>\n` +
    `<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n` +
    `<link id="luxx-fonts" rel="stylesheet" href="{{FONTS}}">\n<style id="luxx-vars">{{VARS}}</style>\n<style id="luxx-css">\n{{CSS}}\n</style>\n<style id="luxx-custom"></style>\n` +
    head.slice(bodyStart, bodyEnd);
  const art = content.replace(/\{\{(\w+)\}\}/g, (m, k) => {
    if (!(k in map)) throw new Error('Marcador desconhecido: ' + m);
    return map[k];
  });
  fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
  fs.writeFileSync(out, art);
  console.log(`ok — versão Artifact: ${out} (${(art.length / 1024).toFixed(0)} KB)`);
}
