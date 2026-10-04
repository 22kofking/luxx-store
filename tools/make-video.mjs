// Gera o vídeo padrão da "bolinha" (assets/luxx-bubble.mp4) a partir das ilustrações do site.
// Uso: node tools/make-video.mjs   (requer Playwright + ffmpeg com libx264)
import fs from 'fs';
import path from 'path';
import os from 'os';
import { execFileSync } from 'child_process';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let pw;
try {
  pw = require('playwright');
} catch (e) {
  console.error('Playwright não encontrado. Instale com: npm install && npx playwright install chromium');
  process.exit(1);
}

const SIZE = 400;
const FPS = 30;
const OUT = path.join(ROOT, 'assets', 'luxx-bubble.mp4');

const js = ['00-util.js', '02-art.js'].map((f) => fs.readFileSync(path.join(ROOT, 'src/js', f), 'utf8')).join('\n');

const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Unbounded:wght@800;900&display=swap" rel="stylesheet">
<style>
:root{--f-logo:'Unbounded','Arial Black',sans-serif;--y:#ffd400;--k:#0b0b0b}
*{box-sizing:border-box;margin:0;padding:0}
body{background:#000}
#st{position:relative;width:${SIZE}px;height:${SIZE}px;overflow:hidden;background:var(--k);font-family:'Anton',Impact,sans-serif}
.layer{position:absolute;inset:0}
#bg{transition:none}
#glow{background:radial-gradient(circle at 50% 46%,rgba(255,212,0,.32),rgba(255,212,0,0) 62%)}
#bigtxt{position:absolute;left:0;top:50%;white-space:nowrap;font-size:150px;line-height:1;transform:translateY(-50%);-webkit-text-stroke:2px rgba(255,255,255,.12);color:transparent;font-family:var(--f-logo);font-weight:900;letter-spacing:4px}
#item{position:absolute;left:50%;top:47%;width:300px;height:300px;margin:-150px 0 0 -150px}
#item svg{width:100%;height:100%;display:block}
#label{position:absolute;left:0;right:0;bottom:62px;text-align:center;font-size:34px;letter-spacing:1px;text-transform:uppercase}
#label small{display:block;font-family:var(--f-logo);font-weight:800;font-size:13px;letter-spacing:3px;margin-bottom:2px;opacity:.75}
#center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
#flash{background:#fff}
#vign{background:radial-gradient(circle at 50% 50%,rgba(0,0,0,0) 60%,rgba(0,0,0,.22) 80%)}
.bolt{position:absolute;width:120px;height:120px}
</style></head><body><div id="st">
<div class="layer" id="bg"></div><div class="layer" id="glow"></div>
<div id="bigtxt">LUXX LUXX LUXX LUXX LUXX</div>
<div id="item"></div><div id="label"></div><div id="center"></div>
<div class="layer" id="vign"></div><div class="layer" id="flash"></div>
</div>
<script>${js}
const Y='#ffd400', K='#0b0b0b';
const ITEMS=[
  {art:{type:'tee',color:'#1b1b1b',detail:Y,print:'bolt'},bg:Y,fg:K,name:'Camiseta Volt',kick:'NOVO DROP'},
  {art:{type:'hoodie',color:Y,detail:K,print:'logo'},bg:K,fg:Y,name:'Hoodie Raio',kick:'EDIÇÃO LIMITADA'},
  {art:{type:'sneaker',color:'#f4f2ee',detail:Y,sole:'#ffffff'},bg:Y,fg:K,name:'Tênis Street LX',kick:'MAIS VENDIDO'},
  {art:{type:'slide',color:'#1b1b1b',detail:Y,strapColor:Y},bg:K,fg:Y,name:'Slide Volt',kick:'CONFORTO ⚡'},
  {art:{type:'cap',color:'#1b1b1b',detail:Y},bg:Y,fg:K,name:'Boné Trucker',kick:'NOVO DROP'},
  {art:{type:'chain',color:'#d9b44a',detail:Y},bg:K,fg:Y,name:'Corrente Gold',kick:'ACESSÓRIOS'},
];
const svgs=ITEMS.map(i=>ART.svg(i.art));
const INTRO=1.0, SEG=1.0, OUTRO=1.5;
const TOTAL=INTRO+ITEMS.length*SEG+OUTRO;
const $=id=>document.getElementById(id);
const easeOutBack=x=>{const c1=1.70158,c3=c1+1;return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2)};
const easeOut=x=>1-Math.pow(1-x,3);
const cl=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
let lastItem=-1;
const BOLT_SVG=(c,s)=>'<svg viewBox="0 0 24 24" width="'+s+'" height="'+s+'"><path d="'+ART.BOLT+'" fill="'+c+'"/></svg>';
window.render=function(t){
  const flash=$('flash'), bg=$('bg'), glow=$('glow'), big=$('bigtxt'), item=$('item'), label=$('label'), center=$('center');
  big.style.transform='translate('+(-((t*60)%300))+'px,-50%)';
  flash.style.opacity=0; center.innerHTML=''; label.innerHTML=''; item.style.opacity=0;
  if(t<INTRO){
    const p=t/INTRO;
    bg.style.background=K; glow.style.opacity=.9; big.style.opacity=1;
    const s=p<.3?1.08-0.08*easeOut(p/.3):1+0.025*Math.sin((p-.3)*9);
    const o=1;
    center.innerHTML='<div style="transform:scale('+s+');opacity:'+o+'"><div style="display:flex;align-items:center;justify-content:center;gap:4px">'+BOLT_SVG(Y,64)+'<span style="font-family:var(--f-logo);font-weight:900;font-size:78px;color:#fff;letter-spacing:2px;line-height:1">LUXX</span></div><div style="font-family:var(--f-logo);font-weight:800;font-size:15px;letter-spacing:9px;color:'+Y+';margin-top:8px">STORE</div></div>';
    flash.style.opacity=p>.55&&p<.7?(1-Math.abs(p-.6)/.1)*.35:0;
    flash.style.background=Y;
    return;
  }
  const ti=t-INTRO;
  const idx=Math.floor(ti/SEG);
  if(idx<ITEMS.length){
    const it=ITEMS[idx]; const p=(ti-idx*SEG)/SEG;
    bg.style.background=it.bg; glow.style.opacity=it.bg===K?1:0; big.style.opacity=1;
    big.style.webkitTextStroke='2px '+(it.bg===K?'rgba(255,255,255,.12)':'rgba(0,0,0,.14)');
    if(lastItem!==idx){item.innerHTML=svgs[idx]; lastItem=idx;}
    let y=0,s=1,r=0,o=1;
    if(p<.24){const e=easeOutBack(p/.24); y=140*(1-e); s=.55+.45*e; r=-14*(1-e);}
    else if(p<.84){const q=(p-.24)/.6; y=-6*Math.sin(q*Math.PI); s=1+.05*q; r=2*Math.sin(q*Math.PI);}
    else {const q=(p-.84)/.16; s=1.05+.5*easeOut(q); o=1-q; y=-6;}
    item.style.opacity=o;
    item.style.transform='translateY('+y+'px) scale('+s+') rotate('+r+'deg)';
    const lo=p<.18?0:p<.3?(p-.18)/.12:p>.86?Math.max(0,1-(p-.86)/.1):1;
    label.innerHTML='<div style="color:'+it.fg+';opacity:'+lo+';transform:translateY('+(10*(1-Math.min(1,lo)))+'px)"><small>'+it.kick+'</small>'+it.name+'</div>';
    flash.style.background=it.bg===K?Y:'#fff';
    flash.style.opacity=p<.06?(1-p/.06)*.5:0;
    return;
  }
  const p=(ti-ITEMS.length*SEG)/OUTRO;
  bg.style.background=Y; glow.style.opacity=0; big.style.opacity=1; big.style.webkitTextStroke='2px rgba(0,0,0,.14)';
  const e=p<.2?easeOutBack(p/.2):1; const pulse=1+.04*Math.sin(p*18);
  center.innerHTML='<div style="color:'+K+';transform:scale('+(e*pulse)+')"><div style="font-family:var(--f-logo);font-weight:800;font-size:15px;letter-spacing:6px">OFERTA RELÂMPAGO</div><div style="font-size:92px;line-height:.95;margin:6px 0 8px">10% OFF</div><div style="display:inline-block;border:3px dashed '+K+';border-radius:12px;padding:6px 16px;font-family:var(--f-logo);font-weight:900;font-size:34px;letter-spacing:3px">LUXX10</div></div>';
  flash.style.background=Y; flash.style.opacity=p<.05?(1-p/.05)*.5:0;
  if(p>.9){flash.style.background=K; flash.style.opacity=(p-.9)/.1;}
};
window.TOTAL=TOTAL;
</script></body></html>`;

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'luxx-video-'));
const page = path.join(tmp, 'video.html');
fs.writeFileSync(page, html);

const fontCache = new Map();
const b = await pw.chromium.launch();
const ctx = await b.newContext({ viewport: { width: SIZE, height: SIZE }, deviceScaleFactor: 1 });
// Fontes do Google baixadas pelo Node (funciona também atrás de proxy corporativo)
await ctx.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/, async (route) => {
  const url = route.request().url();
  try {
    if (!fontCache.has(url)) {
      const r = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36' } });
      fontCache.set(url, { status: r.status, body: Buffer.from(await r.arrayBuffer()), ct: r.headers.get('content-type') || '' });
    }
    const c = fontCache.get(url);
    await route.fulfill({ status: c.status, body: c.body, headers: { 'content-type': c.ct, 'access-control-allow-origin': '*' } });
  } catch (e) {
    await route.abort();
  }
});
const p = await ctx.newPage();
await p.goto('file://' + page);
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(300);
const total = await p.evaluate(() => window.TOTAL);
const frames = Math.round(total * FPS);
const st = await p.$('#st');
for (let i = 0; i < frames; i++) {
  await p.evaluate((t) => window.render(t), i / FPS);
  await st.screenshot({ path: path.join(tmp, `f${String(i).padStart(4, '0')}.png`) });
}
await b.close();

fs.mkdirSync(path.dirname(OUT), { recursive: true });
execFileSync('ffmpeg', [
  '-y', '-loglevel', 'error',
  '-framerate', String(FPS),
  '-i', path.join(tmp, 'f%04d.png'),
  '-vf', 'scale=360:360:flags=lanczos',
  '-c:v', 'libx264', '-profile:v', 'main', '-level', '3.1', '-pix_fmt', 'yuv420p',
  '-crf', '27', '-preset', 'veryslow', '-tune', 'animation',
  '-movflags', '+faststart', '-an',
  OUT,
]);
// poster (primeiro frame "cheio")
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', '0.6', '-i', OUT, '-frames:v', '1', '-q:v', '4', path.join(tmp, 'poster.jpg')]);
fs.rmSync(tmp, { recursive: true, force: true });
console.log('ok', OUT, (fs.statSync(OUT).size / 1024).toFixed(0) + ' KB', frames + ' frames');
