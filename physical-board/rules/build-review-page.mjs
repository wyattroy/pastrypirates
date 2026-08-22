// Build the editable review artifact from rules-pirate.html: inline every image as a data URI,
// convert src attributes to data-img refs (so saved content never duplicates base64), and wrap
// the six pages in an editable shell that republishes itself via the artifact capability.
import fs from 'fs';

const REPO = '/home/user/pastrypirates';
const SRC = fs.readFileSync(`${REPO}/physical-board/rules/rules-pirate.html`, 'utf8');
const OUT = process.argv[2] || new URL('./review-page.html', import.meta.url).pathname;

// ---------- collect + transform the six page sections ----------
let sections = SRC.match(/<section class="page">[\s\S]*?<\/section>/g);
if (!sections || sections.length !== 6) throw new Error('expected 6 sections, got ' + (sections ? sections.length : 0));

const used = new Map(); // ref -> file path
const addImg = (ref, path) => { used.set(ref, path); return ref; };

const transform = (html) => html
  .replace(/src="\.\.\/\.\.\/assets\/icons\/([a-z0-9-]+)\.png"/g, (m, n) => `data-img="${addImg('i:' + n, `${REPO}/assets/icons/${n}.png`)}" alt=""`)
  .replace(/src="\.\.\/\.\.\/assets\/ingredients\/([a-z0-9-]+)\.png"/g, (m, n) => `data-img="${addImg('g:' + n, `${REPO}/assets/ingredients/${n}.png`)}" alt=""`)
  .replace(/src="\.\.\/\.\.\/assets\/logo\.jpg"/g, () => `data-img="${addImg('logo', `${REPO}/assets/logo.jpg`)}" alt="Pastry Pirates"`)
  .replace(/src="images\/([a-z0-9-]+)\.jpg"/g, (m, n) => `data-img="${addImg('s:' + n, `${REPO}/physical-board/rules/images/${n}.jpg`)}" alt=""`)
  .replace(/background-image:url\(images\/([a-z0-9-]+)\.jpg\);\s*/g, (m, n) => { addImg('s:' + n, `${REPO}/physical-board/rules/images/${n}.jpg`); return ''; })
  // crops lost their background-image above; tag them with the ref so the runtime can restore it
  .replace(/<div class="crop" style="([^"]*)"/g, (m, style) => m) // placeholder, handled below per-section
;

// crops: find each crop div in the ORIGINAL section to know which image it used, then re-tag.
const fixCrops = (orig, xformed) => {
  const refs = [...orig.matchAll(/<div class="crop" style="[^"]*?background-image:url\(images\/([a-z0-9-]+)\.jpg\)/g)].map(m => 's:' + m[1]);
  let i = 0;
  return xformed.replace(/<div class="crop" /g, () => `<div class="crop" data-bgimg="${refs[i++] || ''}" `);
};

sections = sections.map(s => fixCrops(s, transform(s)));

// the notes page appended after the six booklet pages
const notes = `
<section class="page" id="notesPage">
  <h2 style="margin-top:0;">📝 Notes for Claude</h2>
  <p class="muted-note">Anything ye want changed but don’t want to word yerself — write it here, or highlight any
  line on the pages above and leave a comment. When ye’re done, tell Claude and the changes get folded back into
  the printed PDFs.</p>
  <ul id="notesList">
    <li>(write yer first note here…)</li>
  </ul>
</section>`;

// ---------- inline images ----------
const IMG = {};
let total = 0;
for (const [ref, path] of used) {
  const buf = fs.readFileSync(path);
  const mime = path.endsWith('.jpg') ? 'image/jpeg' : 'image/png';
  IMG[ref] = `data:${mime};base64,${buf.toString('base64')}`;
  total += buf.length;
}
console.log('images inlined:', used.size, 'raw bytes:', total);

// ---------- the page ----------
const STYLE = `
  * { margin:0; padding:0; box-sizing:border-box; }
  :root {
    --desk:#dfe7e4; --desk-ink:#2a4a52; --desk-sub:#5a7078; --chrome:#fffdf4; --chrome-edge:#c6d4d2;
    --accent:#1a7f8c; --btn:#125a66; --btn-ink:#fffdf4; --warn:#c94a72;
  }
  @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
    --desk:#0d2b33; --desk-ink:#cfe2e2; --desk-sub:#8fb0b3; --chrome:#123c46; --chrome-edge:#1e5560;
    --accent:#5cc4cf; --btn:#29a3b2; --btn-ink:#08262c; --warn:#f08bab;
  } }
  :root[data-theme="dark"] {
    --desk:#0d2b33; --desk-ink:#cfe2e2; --desk-sub:#8fb0b3; --chrome:#123c46; --chrome-edge:#1e5560;
    --accent:#5cc4cf; --btn:#29a3b2; --btn-ink:#08262c; --warn:#f08bab;
  }
  html, body { background:var(--desk); }
  body { font-family:"Avenir Next","Segoe UI",Helvetica,Arial,sans-serif; color:var(--desk-ink); }

  /* ------- review chrome ------- */
  #bar { position:sticky; top:0; z-index:50; background:var(--chrome); border-bottom:1.5px solid var(--chrome-edge);
         display:flex; align-items:center; gap:14px; padding:10px 18px; flex-wrap:wrap; }
  #bar .ttl { font-family:Georgia,serif; font-size:16px; color:var(--desk-ink); font-weight:700; letter-spacing:.3px; }
  #bar .sp { flex:1; }
  #status { font-size:12px; color:var(--desk-sub); }
  #status.dirty { color:var(--warn); font-weight:600; }
  #saveBtn { background:var(--btn); color:var(--btn-ink); border:none; border-radius:9px; padding:8px 22px;
             font-size:13.5px; font-weight:700; cursor:pointer; font-family:inherit; }
  #saveBtn:disabled { opacity:.45; cursor:default; }
  #saveBtn:focus-visible, .edt:focus-visible { outline:2.5px solid var(--accent); outline-offset:2px; }
  #howto { max-width:816px; margin:16px auto 0; padding:0 8px; font-size:12.5px; color:var(--desk-sub); line-height:1.55; }
  #howto b { color:var(--desk-ink); }
  #paper { padding:14px 8px 60px; }

  /* ------- the printed pages (deliberately single-theme: they are the print proof) ------- */
  .page { width:816px; max-width:100%; background:#fffdf4; color:#14323c; padding:46px 52px; position:relative;
          margin:18px auto; border-radius:4px; box-shadow:0 3px 18px rgba(10,40,48,.25); }
  h1 { font-family:Georgia,"Times New Roman",serif; font-size:34px; color:#125a66; letter-spacing:.5px; }
  h2 { font-family:Georgia,serif; font-size:19px; color:#125a66; margin:18px 0 8px;
       border-bottom:2.5px solid #29a3b2; padding-bottom:3px; letter-spacing:.4px; }
  h3 { font-size:13.5px; color:#0e3a44; margin:10px 0 3px; text-transform:uppercase; letter-spacing:.8px; }
  .page p, .page li { font-size:12.8px; line-height:1.5; }
  .page p { margin:5px 0; }
  .page ul, .page ol { margin:4px 0 6px 18px; }
  .page li { margin:3px 0; }
  .page b { color:#0e3a44; }
  .ico { height:15px; vertical-align:-3px; }
  .ico-lg { height:22px; vertical-align:-6px; }
  .coin { height:14px; vertical-align:-2px; }
  .goal { background:#eaf6f7; border:2px solid #29a3b2; border-radius:12px; padding:12px 16px; margin:12px 0; }
  .callout { background:#f8f1dd; border-left:4px solid #d9a23a; border-radius:0 8px 8px 0; padding:8px 13px; margin:8px 0; font-size:12.3px; }
  .callout p { font-size:12.3px; }
  .num { display:inline-block; background:#29a3b2; color:#fff; font-weight:700; width:21px; height:21px;
         border-radius:50%; text-align:center; line-height:21px; font-size:12.5px; margin-right:7px; flex:none; }
  .step { display:flex; margin:9px 0; }
  .step > div { flex:1; }
  .cols { display:flex; gap:22px; flex-wrap:wrap; }
  .cols > * { flex:1; min-width:230px; }
  figure { margin:8px 0; text-align:center; }
  figcaption { font-size:10.8px; color:#5a7078; font-style:italic; margin-top:4px; line-height:1.35; }
  .shot { border-radius:10px; border:1.5px solid #cfdadd; max-width:100%; }
  .crop { border-radius:10px; border:1.5px solid #cfdadd; background-repeat:no-repeat; margin:0 auto; max-width:100%; }
  table.rules { border-collapse:collapse; width:100%; margin:6px 0; }
  table.rules th { background:#125a66; color:#fffdf4; font-size:11.5px; padding:5px 8px; text-align:left; }
  table.rules td { border-bottom:1px solid #d8e2e4; font-size:12.2px; padding:5px 8px; vertical-align:top; }
  table.rules tr:nth-child(even) td { background:#f3f8f8; }
  .footer { display:flex; justify-content:space-between; font-size:10px; color:#8aa0a6;
            border-top:1px solid #d8e2e4; padding-top:6px; margin-top:26px; }
  .pagetag { font-family:Georgia,serif; font-style:italic; }
  .kicker { font-size:12px; text-transform:uppercase; letter-spacing:2.5px; color:#c94a72; font-weight:700; }
  .muted-note { color:#5a7078; font-size:12px; }

  /* ------- editing affordance ------- */
  .edt { border-radius:4px; transition:box-shadow .12s; cursor:text; }
  .edt:hover { box-shadow:0 0 0 2px rgba(41,163,178,.35); }
  .edt:focus { outline:none; box-shadow:0 0 0 2.5px rgba(41,163,178,.75); background:rgba(41,163,178,.05); }
  @media (prefers-reduced-motion: reduce) { .edt { transition:none; } }
`;

const RUNTIME = `
(async function(){
  var $=function(id){return document.getElementById(id);};
  var IMG=JSON.parse($('imgs').textContent);
  var DOC=JSON.parse($('doc').textContent||'{}');

  // toolbar + paper rendered from constants so the served body stays the single source
  var app=$('app');
  var bar=document.createElement('div'); bar.id='bar';
  bar.innerHTML='<span class="ttl">🏴\\u200d☠️ Pastry Pirates Rulebook — review copy</span><span class="sp"></span>'
    +'<span id="status">All changes saved</span><button id="saveBtn" disabled>Save</button>';
  var howto=document.createElement('div'); howto.id='howto';
  howto.innerHTML='<b>Concrete wording change?</b> Click the text and type — then hit <b>Save</b> (it publishes for both of us). '
    +'<b>Need Claude’s help?</b> Highlight any passage and leave a comment, or use the Notes page at the end — '
    +'mention <b>@claude</b> in a comment to wake him. Unsaved edits are lost if ye close the tab.';
  var paper=document.createElement('div'); paper.id='paper';
  paper.appendChild(document.importNode($('tpl').content,true));
  app.appendChild(bar); app.appendChild(howto); app.appendChild(paper);

  // deterministic block ids over the rendered clone, in document order
  var SEL='p, li, h1, h2, h3, figcaption, td, th, .step > div, .callout';
  var blocks=paper.querySelectorAll(SEL); var byId={};
  for(var i=0;i<blocks.length;i++){
    var el=blocks[i];
    if(el.closest('.callout')&&!el.classList.contains('callout'))continue; // callout is one block
    var id='b'+i;
    el.setAttribute('data-doc',id);
    el.setAttribute('contenteditable','true');
    el.setAttribute('spellcheck','false');
    el.classList.add('edt');
    byId[id]=el;
    if(Object.prototype.hasOwnProperty.call(DOC,id))el.innerHTML=DOC[id];
  }

  // resolve images AFTER overrides so restored content gets its pictures back
  function resolveImgs(root){
    var imgs=root.querySelectorAll('img[data-img]');
    for(var k=0;k<imgs.length;k++){var r=imgs[k].getAttribute('data-img');if(IMG[r])imgs[k].src=IMG[r];}
    var crops=root.querySelectorAll('[data-bgimg]');
    for(var c=0;c<crops.length;c++){var b=crops[c].getAttribute('data-bgimg');if(IMG[b])crops[c].style.backgroundImage='url('+IMG[b]+')';}
  }
  resolveImgs(paper);

  // capture a block's canonical content: strip the data URIs and runtime attributes back out
  function capture(el){
    var cl=el.cloneNode(true);
    cl.removeAttribute('contenteditable');cl.removeAttribute('spellcheck');cl.removeAttribute('data-doc');
    cl.classList.remove('edt');
    var imgs=cl.querySelectorAll('img[data-img]');
    for(var k=0;k<imgs.length;k++)imgs[k].removeAttribute('src');
    return cl.innerHTML;
  }

  // dirty tracking
  var status=$('status'),saveBtn=$('saveBtn'),dirty=false;
  function setDirty(d){dirty=d;saveBtn.disabled=!d;
    status.textContent=d?'Unsaved changes':'All changes saved';
    status.className=d?'dirty':'';}
  paper.addEventListener('input',function(){setDirty(true);});
  window.addEventListener('beforeunload',function(e){if(dirty){e.preventDefault();e.returnValue='';}});
  // paste as plain text so outside formatting never sneaks into the booklet
  paper.addEventListener('paste',function(e){
    var t=e.target&&e.target.closest&&e.target.closest('.edt');if(!t)return;
    e.preventDefault();
    var txt=(e.clipboardData||window.clipboardData).getData('text/plain');
    document.execCommand('insertText',false,txt);
  });

  var artifact=null;
  try{ if(typeof claude!=='undefined'&&claude.use)artifact=await claude.use('artifact'); }catch(e){}
  if(!artifact){saveBtn.style.display='none';status.textContent='Read-only view — edits can’t be saved here';return;}

  saveBtn.addEventListener('click',async function(){
    saveBtn.disabled=true;status.className='';status.textContent='Saving…';
    var doc={};
    for(var id in byId)doc[id]=capture(byId[id]);
    var json=JSON.stringify(doc).replace(/</g,'\\\\u003c');
    var html='<!doctype html>\\n<html lang="en">\\n<head>\\n<meta charset="utf-8">\\n'
      +'<meta name="viewport" content="width=device-width, initial-scale=1">\\n'
      +'<title>'+document.title+'</title>\\n'
      +'<style>'+document.querySelector('style').textContent+'</style>\\n</head>\\n<body>\\n'
      +'<div id="app"></div>\\n'
      +$('tpl').outerHTML+'\\n'
      +'<scr'+'ipt id="imgs" type="application/json">'+$('imgs').textContent+'</scr'+'ipt>\\n'
      +'<scr'+'ipt id="doc" type="application/json">'+json+'</scr'+'ipt>\\n'
      +'<scr'+'ipt id="rt">'+$('rt').textContent+'</scr'+'ipt>\\n'
      +'</body>\\n</html>';
    try{
      await artifact.publish(html); // on success the view reloads to the new version
      status.textContent='Saved — reloading…';
    }catch(err){
      var code=err&&err.code;
      if(code==='conflict'){status.textContent='A newer version just landed — reloading to it';}
      else if(code==='not_writer'||code==='not_granted'){saveBtn.style.display='none';status.textContent='Read-only view — edits can’t be saved here';}
      else if(code==='rate_limited'){status.className='dirty';status.textContent='Saving too fast — wait a moment and try again';saveBtn.disabled=false;}
      else{status.className='dirty';status.textContent='Save failed ('+(code||'unknown')+') — yer edits are still on the page; try again';saveBtn.disabled=false;}
    }
  });
})();
`;

const esc = s => s; // sections come from our own trusted source
const IMGJSON = JSON.stringify(IMG);
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Pastry Pirates Rulebook</title>
<style>${STYLE}</style>
</head>
<body>
<div id="app"></div>
<template id="tpl">
${sections.map(esc).join('\n')}
${notes}
</template>
<script id="imgs" type="application/json">${IMGJSON}</script>
<script id="doc" type="application/json">{}</script>
<script id="rt">${RUNTIME}</script>
</body>
</html>`;

if (html.includes('src="images/') || html.includes('src="../../assets/')) throw new Error('unconverted image src remains');
fs.writeFileSync(OUT, html);
console.log('wrote', OUT, (html.length / 1048576).toFixed(2) + 'MB');
