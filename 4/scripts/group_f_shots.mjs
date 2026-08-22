#!/usr/bin/env node
/* group_f_shots.mjs — Group F's instrument: pose the rare states, read the rendered rects, keep
 * the pictures, and time the coin.
 *
 *   node 4/scripts/group_f_shots.mjs --out=DIR --port=N --dbg=N [--size=WxH] [--mobile]
 *                                    [--scenes=fan,pass,pill,flips,menu] [--tag=NAME]
 *
 * WHY IT EXISTS. Wyatt's rescope (2026-08-22): "can you intelligently trigger the events that you
 * need, eg storms, by non destructively modifying code eg storm likelihood = 1?" — yes, and
 * docs/DRIVING-THE-GAME.md §5e is the method. Playing a voyage until a cornered eight-button fan
 * or a battle flip happens costs a night and yields one sample. Posing it costs seconds and yields
 * as many as you like.
 *
 * THE THREE RULES THIS FILE OBEYS, all of them earned:
 *   1. A LIVE MUTATION CANNOT SHIP; A SOURCE EDIT CAN. Everything here mutates the live `appState`
 *      object over CDP. Nothing under 4/src is edited to make a state happen — that is the old
 *      forced-storm method and Phase 14 carries a verification row proving it never shipped.
 *   2. RED-PROOF EVERY INJECTION. Each pose reports the known-negative it forced first, beside the
 *      positive, so a check that could not have failed is visible as one.
 *   3. SOLO ONLY. Injection desyncs a real room, where the host is the sole authority.
 *
 * GEOMETRY IS READ FROM THE RENDERER, NEVER RE-DERIVED (docs/BOARD-RENDERING.md §7): every number
 * below comes from getBoundingClientRect on the real element. There is no formula of this file's
 * own anywhere in the measurements, which is the mistake §7 records three times over.
 *
 * Hygiene: headless, --mute-audio, its own ports, bounded loops, kills what it starts.
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { REPO } from "./lib/chrome.mjs";
import { openChrome, sleep } from "./lib/cdp.mjs";

const arg = (k, d) => { const a = process.argv.find(s => s.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const has = k => process.argv.includes(`--${k}`);
const OUT = path.resolve(arg("out", "/tmp/group-f"));
const PORT = +arg("port", 8760), DBG = +arg("dbg", 9760);
const [W, H] = arg("size", "390x664").split("x").map(Number);
const MOBILE = has("mobile");
const SCENES = arg("scenes", "fan,pass,pill,menu,flips").split(",");
const TAG = arg("tag", `${W}x${H}`);
/* --root lets the BEFORE half of a before/after pair be served from a pristine `git archive HEAD`
   copy on its own port, which is how 260821-qwv red-proofed every one of its fixes: the working
   tree is never touched, there is no stash and no worktree, and Chrome's per-URL module cache
   cannot hand one run the other's code. */
const ROOT = path.resolve(arg("root", REPO));
fs.mkdirSync(OUT, { recursive: true });
const notes = [];
const log = (...a) => { const s = a.join(" "); console.log(s); notes.push(s); fs.appendFileSync(path.join(OUT, "log.txt"), s + "\n"); };

const c = await openChrome({ W, H, dbgPort: DBG, httpPort: PORT, serveRoot: ROOT,
  profileDir: path.join(OUT, `prof-${TAG}`), mobile: MOBILE });
const out = { tag: TAG, W, H, mobile: MOBILE, scenes: {} };
async function finish(code) {
  fs.writeFileSync(path.join(OUT, `result-${TAG}.json`), JSON.stringify(out, null, 2));
  try { c.close(); } catch {}
  try { execSync(`pkill -f "remote-debugging-port=${DBG}"`, { stdio: "ignore" }); } catch {}
  try { execSync(`pkill -f "http.server ${PORT}"`, { stdio: "ignore" }); } catch {}
  process.exit(code);
}
const die = async (msg) => { log("ABORT: " + msg); await finish(1); };
process.on("SIGINT", () => finish(1));

const shot = n => c.shot(path.join(OUT, `${TAG}-${n}.png`));
const ev = e => c.ev(e);

/* ---- the on-screen gate, the same predicate the layout gate and the real-mouse driver use ----
   RE-ARMED AFTER EVERY NAVIGATION, because a navigate wipes the window it was written on. Defining
   it once at the top and then reloading cost this file its first run: every click reported "not
   clickable" and the real error, `__gate is not defined`, was swallowed by the caller's own
   `return null`. A helper that vanishes silently is indistinguishable from a game that is broken. */
const armGate = () => ev(`window.__gate = (el) => {
  if (!el) return {ok:false, why:'no element'};
  const r = el.getBoundingClientRect();
  if (r.width < 4 || r.height < 4) return {ok:false, why:'zero size'};
  if (r.left < 0 || r.top < 0 || r.right > innerWidth || r.bottom > innerHeight) return {ok:false, why:'outside viewport'};
  const cx = r.left + r.width/2, cy = r.top + r.height/2;
  const hit = document.elementFromPoint(cx, cy);
  if (!hit || !(hit === el || el.contains(hit) || hit.contains(el))) return {ok:false, why:'occluded by '+(hit?(hit.id||hit.className||hit.tagName):'nothing')};
  return {ok:true, x:cx, y:cy};
};`);
/* A REAL MOUSE CLICK, and it will SCROLL FIRST rather than report "not clickable". The welcome
   screen's mode cards sit below the fold on a 664px-tall phone, so the gate honestly answers
   "outside viewport" and a naive driver stops on the very first tap of the run — which is what
   this cost the first time. Scrolling is what a player does; clicking a point that is off screen
   is not, so the gate stays strict and this scrolls into range before asking again. */
async function clickSel(sel, filter = "() => true") {
  const probe = `(() => { const els = [...document.querySelectorAll(${JSON.stringify(sel)})].filter(${filter});
     for (const el of els) { const g = __gate(el); if (g.ok) return {ok:true,x:g.x,y:g.y,txt:(el.textContent||'').trim().slice(0,24)}; }
     return {ok:false, n:els.length, why: els.length ? __gate(els[0]).why : 'none'}; })()`;
  let g = await ev(probe);
  if (g && g.ok) { await c.clickXY(g.x, g.y); return g.txt || "?"; }
  if (g && g.n && /outside viewport/.test(g.why || "")) {
    await ev(`(() => { const els = [...document.querySelectorAll(${JSON.stringify(sel)})].filter(${filter});
       if (els[0]) els[0].scrollIntoView({block:'center'}); return 1; })()`);
    await sleep(400);
    g = await ev(probe);
    if (g && g.ok) { await c.clickXY(g.x, g.y); return g.txt || "?"; }
  }
  return null;
}

/* ---- boot a solo voyage (DRIVING-THE-GAME §2, §3 — both of that section's traps) ---- */
log(`\n=== ${TAG} ${MOBILE ? "(touch)" : ""} — booting solo ===`);
await c.nav(`http://127.0.0.1:${PORT}/4/`); await sleep(2000);
await ev("localStorage.clear(); 1");
await c.nav(`http://127.0.0.1:${PORT}/4/`); await sleep(2500);
await armGate();
if (!await clickSel("#choiceSolo")) await die("solo card not clickable: " + JSON.stringify(await ev("(()=>{const e=document.getElementById('choiceSolo'); return e?{g:__gate(e), r:JSON.parse(JSON.stringify(e.getBoundingClientRect())), iw:innerWidth, ih:innerHeight, sy:scrollY, bh:document.body.scrollHeight}:'no #choiceSolo';})()")));
await sleep(900);
const ni = await ev("(()=>{const el=document.getElementById('nameModalInput'); if(!el) return null; const g=__gate(el); return g.ok?g:null;})()");
/* SELECT BEFORE TYPING. The name modal arrives PRE-FILLED, so inserting text appends to it and
   the run captains a boat called "Davy SconesDavy Scones" — which then shows up in every
   screenshot as a clipped captain name and reads exactly like a layout defect. A triple click
   selects the field's contents first, the same thing the layout gate does for the same reason. */
if (ni) {
  await c.send("Input.dispatchMouseEvent", { type: "mousePressed", x: ni.x, y: ni.y, button: "left", clickCount: 3 });
  await c.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: ni.x, y: ni.y, button: "left", clickCount: 3 });
  await c.type("Davy Scones");
}
if (!await clickSel("#btnNameConfirm")) await die("name confirm not clickable");
// a game with a HUMAN seat in it — never merely "a game exists" (§3: the welcome screen runs an
// all-bot attract board on appState.game, and posing into that poses the demo)
{
  let ok = false;
  for (let i = 0; i < 60 && !ok; i++) { await sleep(500);
    ok = await ev(`(async()=>{try{if(!window.appState){const m=await import('/4/src/state/index.js');window.appState=m.appState;}
      const g=window.appState.game; return !!(g&&g.players.some(p=>p.strategy==='human')&&document.getElementById('pp4Ribbon'));}catch(e){return false}})()`);
  }
  if (!ok) await die("no human solo game inside 30s");
}
// cache the live modules once (§6: appState is not a window global)
await ev(`(async()=>{ window.__F = {
  st:(await import('/4/src/state/index.js')).appState,
  flow:await import('/4/src/ui/flow.js'),
  board:await import('/4/src/ui/board.js'),
  orch:await import('/4/src/orchestrator.js') }; return 1; })()`);
// clear the intro barriers so the board is the thing on screen (§3c: a recipe card takes TWO taps)
for (let i = 0; i < 26; i++) {
  const n = await ev("[...document.querySelectorAll('#pp4Prompt .apBtn')].filter(b=>b.getBoundingClientRect().width>4).length");
  const staged = await ev("!!document.getElementById('actionPanel').dataset.pp4Stage || !!document.querySelector('#pp4Prompt .recipeList')");
  if (!staged && n === 0) break;
  if (!await clickSel("#pp4Prompt .recipeCard, #pp4Prompt .bkoCard")) {
    if (!await clickSel("#pp4Prompt .apBtn", "b => !/back|←|‹/i.test(b.textContent)")) await sleep(500);
  }
  await sleep(650);
}
log("booted.");

/* ================= the measurement ================= */
const MEASURE = `(() => {
  const R = el => { if (!el) return null; const r = el.getBoundingClientRect(); return {l:+r.left.toFixed(1),t:+r.top.toFixed(1),r:+r.right.toFixed(1),b:+r.bottom.toFixed(1),w:+r.width.toFixed(1),h:+r.height.toFixed(1)}; };
  const vis = el => { const cs = getComputedStyle(el); return cs.visibility!=='hidden' && cs.display!=='none' && parseFloat(cs.opacity) > .05; };
  const box = document.getElementById('pp4Prompt');
  const petals = [...document.querySelectorAll('#pp4Prompt .apBtn')].filter(b=>vis(b)&&b.getBoundingClientRect().width>4)
    .map(b => ({ r:R(b), text:(b.textContent||'').trim().slice(0,18), act:(b.dataset&&b.dataset.act)||'' }));
  const rib = document.getElementById('pp4Ribbon'), pill = document.getElementById('pp4Pill'), f = document.getElementById('footerRow');
  return {
    iw: innerWidth, ih: innerHeight,
    side: document.body.classList.contains('pp4Side'),
    mode: box ? (box.classList.contains('pp4Center') ? 'pp4Center' : box.classList.contains('radial') ? 'radial'
          : box.classList.contains('pp4Recipes') ? 'pp4Recipes' : box.classList.contains('centered') ? 'card-centered' : 'card') : 'none',
    petals,
    sub: R(document.querySelector('#pp4Prompt .apSub')),
    msg: R(document.querySelector('#pp4Prompt .apMsg')),
    hint: (()=>{const h=document.querySelector('.pp4PeekHint');return h&&getComputedStyle(h).display!=='none'?R(h.firstElementChild||h):null;})(),
    ribbon: R(rib), pill: R(pill),
    pillParent: pill ? (pill.parentNode.id || pill.parentNode.tagName) : null,
    pillZ: pill ? getComputedStyle(pill).zIndex : null,
    pillPos: pill ? getComputedStyle(pill).position : null,
    ff: R(document.getElementById('pp4FF')), clock: R(document.getElementById('pp4Clock')),
    menuBtn: R(document.getElementById('pp4Menu')), menuBtnVis: (()=>{const m=document.getElementById('pp4Menu');return m?getComputedStyle(m).display:'?';})(),
    cap: R(document.getElementById('pp4Cap')),
    capPanel: R(document.getElementById('captainsPanel')),
    capStyle: (()=>{const e=document.getElementById('pp4Cap'); if(!e) return null; const cs=getComputedStyle(e);
      return {pos:cs.position, top:cs.top, bottom:cs.bottom, height:cs.height, maxH:cs.maxHeight, pad:cs.padding, inline:e.getAttribute('style')||''};})(),
    capKids: [...(document.getElementById('pp4Cap')||{children:[]}).children].map(e=>({id:e.id||e.className, d:getComputedStyle(e).display, r:R(e)})),
    footer: R(f), footerParent: f ? (f.parentNode.id || f.parentNode.tagName) : null,
    footerVis: f ? getComputedStyle(f).display : '?',
    footerItems: f ? [...f.children].filter(vis).map(e=>(e.textContent||'').trim().replace(/\\s+/g,' ').slice(0,30)) : []
  };
})()`;

const ov = (a, b) => !!(a && b && Math.min(a.r, b.r) - Math.max(a.l, b.l) > 0 && Math.min(a.b, b.b) - Math.max(a.t, b.t) > 0);
const olap = (a, b) => (a && b) ? +Math.min(Math.min(a.r, b.r) - Math.max(a.l, b.l), Math.min(a.b, b.b) - Math.max(a.t, b.t)).toFixed(2) : null;
// the smallest EDGE-TO-EDGE gap between any two circles, and every pile
function fanStats(petals) {
  let minGap = Infinity; const piles = [];
  for (let i = 0; i < petals.length; i++) for (let j = i + 1; j < petals.length; j++) {
    const a = petals[i].r, b = petals[j].r;
    const gap = Math.hypot((a.l + a.w / 2) - (b.l + b.w / 2), (a.t + a.h / 2) - (b.t + b.h / 2)) - (a.w + b.w) / 2;
    if (gap < minGap) minGap = gap;
    if (ov(a, b)) piles.push(`${petals[i].text}/${petals[j].text} by ${olap(a, b)}px`);
  }
  return { n: petals.length, d: petals.length ? petals[0].r.w : null,
           minGap: petals.length > 1 ? +minGap.toFixed(2) : null, piles };
}

/* Pose a menu of N circles at a chosen board square, through the game's OWN localAsk so the DOM is
   built by the real builder and every class, short label and helper line is the real one.
   The ship is moved on the live object and repainted with paintShipAt (BOARD-RENDERING §6 — the
   documented whole-cell paint, which also carries the active-turn ring), because boatUXY() reads
   the RENDERED ship's transform, not the model. */
async function poseFan(cell, opts = {}) {
  const spec = JSON.stringify({ cell, ...opts });
  return ev(`(async(S)=>{ const {st,flow,board} = window.__F; S=JSON.parse(S);
    const seat = st.mySeat ?? 0, p = st.game.players[seat];
    p.pos = S.cell.slice();
    board.paintShipAt(seat, p.pos);
    const CR=['Fresh Milk','Cacao Pods','Speckled Eggs','Toasty Wheat','Sea Salt','Sugar Cane','Vanilla'];
    const opts=[];
    const n = S.n == null ? 7 : S.n;
    for(let i=0;i<n;i++) opts.push({label:CR[i%CR.length],short:CR[i%CR.length].split(' ')[0],value:'crate'+i});
    if(S.pass!==false) opts.push({label:'🌊 Pass <span class="nobrk">+1🌕</span>',value:'pass'});
    flow.localAsk("Wyargh, what'll ye do, cap'n?", opts, null,
      "Attacking costs ye 2 for powder. Firing downwind wins ties!");
    return {seat,pos:p.pos};
  })(${JSON.stringify(spec)})`);
}
// 700ms ship glide + the camera tween + the prompt's own pendingReveal gate all have to land
const settle = (ms = 2800) => sleep(ms);

/* ---- SCENE: the cornered eight-button fan, and the two helper-line seams (D-44) ---- */
if (SCENES.includes("fan")) {
  const s = out.scenes.fan = {};
  // RED-PROOF: two circles in the same corner CANNOT crowd. If the roomy case and the crowded case
  // measure the same, this is not measuring crowding at all.
  await poseFan([0, 0], { n: 1 }); await settle();
  s.control = fanStats((await ev(MEASURE)).petals);
  log(`fan RED-PROOF (2 circles, cornered): n=${s.control.n} minGap=${s.control.minGap} piles=${s.control.piles.length}`);
  // the corners are derived from the LIVE grid (cfg.grid is 15, not 10 — a hand-typed [9,9] is
  // mid-board and poses nothing) — the same "ask the game, do not assume" rule as everything else
  const G = await ev("window.__F.st.game.cfg.grid");
  for (const [name, cell] of [["corner-00", [0, 0]], ["corner-last", [G - 1, G - 1]], ["mid", [(G/2)|0, (G/2)|0]]]) {
    await poseFan(cell); await settle();
    const m = await ev(MEASURE);
    const f = fanStats(m.petals);
    s[name] = { mode: m.mode, ...f, sub: m.sub, hint: m.hint,
      subOnPetal: m.petals.filter(p => ov(p.r, m.sub)).map(p => `${p.text} by ${olap(p.r, m.sub)}px`),
      hintOnSub: ov(m.hint, m.sub) ? olap(m.hint, m.sub) : null,
      hintOnPetal: m.petals.filter(p => ov(p.r, m.hint)).map(p => p.text),
      offScreen: m.petals.filter(p => p.r.l < 0 || p.r.t < 0 || p.r.r > m.iw || p.r.b > m.ih).map(p => p.text),
      shot: await shot(`fan-${name}`) };
    log(`fan ${name}: mode=${m.mode} n=${f.n} circle=${f.d}px minGap=${f.minGap} piles=[${f.piles.join(", ")}] subOnPetal=[${s[name].subOnPetal.join(", ")}] hintOnSub=${s[name].hintOnSub} hintOnPetal=[${s[name].hintOnPetal.join(", ")}] offScreen=[${s[name].offScreen.join(", ")}]`);
  }
}

/* ---- SCENE: Pass is the lowest circle, in every fan direction (D-48) ---- */
if (SCENES.includes("pass")) {
  const s = out.scenes.pass = {};
  // a boat at the TOP of the board has open water below it (the fan points DOWN); a boat at the
  // BOTTOM is cornered against the captains card, so the fan points UP. Two directions, one rule.
  const G2 = await ev("window.__F.st.game.cfg.grid");
  for (const [name, cell, n] of [["down", [(G2/2)|0, 0], 4], ["up", [(G2/2)|0, G2-1], 4],
                                 ["up8", [0, G2-1], 7], ["left", [0, (G2/2)|0], 4], ["right", [G2-1, (G2/2)|0], 4]]) {
    await poseFan(cell, { n }); await settle();
    const m = await ev(MEASURE);
    const ys = m.petals.map(p => p.r.t + p.r.h / 2);
    const pi = m.petals.findIndex(p => /pass/i.test(p.text) || p.act === "pass");
    // "lowest" allows a TIE: in the cornered grid Pass shares the bottom row with three crates,
    // and what Wyatt asked for is that nothing is ever BELOW it, not that it stands alone.
    const lowest = Math.max(...ys);
    s[name] = { mode: m.mode, passIdx: pi, lowestY: lowest, passIsLowest: pi >= 0 && ys[pi] >= lowest - 1,
      passAbove: pi >= 0 ? m.petals.filter((p, i) => ys[i] > ys[pi] + 1).map(p => p.text) : null,
      order: m.petals.map((p, i) => `${p.text}@y${ys[i] | 0}`), shot: await shot(`pass-${name}`) };
    log(`pass ${name}: mode=${m.mode} passIsLowest=${s[name].passIsLowest} below-Pass=[${(s[name].passAbove||[]).join(", ")}] (${s[name].order.join(" | ")})`);
  }
}

/* ---- SCENE: the wind pill against the ribbon (D-47 + D-52) ---- */
if (SCENES.includes("pill")) {
  const s = out.scenes.pill = {};
  // the ⏩ shows only while a BOT holds the wheel in a solo game (ribbonTick) — a STATE, not a
  // style, so pose the state. RED-PROOF: it must be absent before and present after.
  const before = await ev("(()=>{const f=document.getElementById('pp4FF');return f?getComputedStyle(f).display:'?';})()");
  await ev(`(()=>{const {st}=window.__F; const seat=st.mySeat??0;
    st.curSeat = (seat+1)%st.game.players.length; st.liveDone=false; st.passAndPlay=false; return 1;})()`);
  await sleep(1500);
  const m = await ev(MEASURE);
  s.ffRedProof = { before, after: m.ff ? "shown" : "absent" };
  s.rects = { ribbon: m.ribbon, pill: m.pill, ff: m.ff, clock: m.clock, menu: m.menuBtn, cap: m.cap, capPanel: m.capPanel };
  s.pillParent = m.pillParent; s.pillZ = m.pillZ; s.pillPos = m.pillPos; s.side = m.side;
  s.pillOverFF = ov(m.pill, m.ff) ? olap(m.pill, m.ff) : null;
  s.pillOverClock = ov(m.pill, m.clock) ? olap(m.pill, m.clock) : null;
  s.pillOverMenu = ov(m.pill, m.menuBtn) ? olap(m.pill, m.menuBtn) : null;
  s.pillInRibbonBand = !!(m.pill && m.ribbon && m.pill.t >= m.ribbon.t - 1 && m.pill.b <= m.ribbon.b + 1);
  s.capBottomGap = m.cap ? +(m.ih - m.cap.b).toFixed(1) : null;
  s.capBoxVsContent = (m.cap && m.capPanel) ? +(m.cap.h - m.capPanel.h).toFixed(1) : null;
  s.shot = await shot("pill-ribbon");
  log(`pill: parent=${m.pillParent} pos=${m.pillPos} z=${m.pillZ} inRibbonBand=${s.pillInRibbonBand} overFF=${s.pillOverFF} overClock=${s.pillOverClock} overMenu=${s.pillOverMenu}`);
  log(`pill rects: ribbon=${JSON.stringify(m.ribbon)} pill=${JSON.stringify(m.pill)} ff=${JSON.stringify(m.ff)}`);
  log(`cap: box h=${m.cap && m.cap.h} content h=${m.capPanel && m.capPanel.h} bottomGap=${s.capBottomGap}px of ${m.ih}`);
  log(`cap style: ${JSON.stringify(m.capStyle)}`);
  log(`cap kids: ${JSON.stringify(m.capKids)}`);
  s.capStyle = m.capStyle; s.capKids = m.capKids;
}

/* ---- SCENE: the desktop menu column / the phone hamburger (D-50, D-51) ---- */
if (SCENES.includes("menu")) {
  const s = out.scenes.menu = {};
  let m = await ev(MEASURE);
  s.closed = { footerVis: m.footerVis, parent: m.footerParent, rect: m.footer, items: m.footerItems,
    side: m.side, menuBtn: m.menuBtnVis, cap: m.cap };
  s.closedShot = await shot("menu-resting");
  log(`menu resting: side=${m.side} display=${m.footerVis} parent=${m.footerParent} ☰=${m.menuBtnVis} items=${m.footerItems.length}`);
  log(`menu items: ${JSON.stringify(m.footerItems)}`);
  if (m.menuBtnVis !== "none") {
    await clickSel("#pp4Menu"); await sleep(700);
    m = await ev(MEASURE);
    s.open = { footerVis: m.footerVis, parent: m.footerParent, rect: m.footer, items: m.footerItems };
    s.openShot = await shot("menu-open");
    log(`menu open: display=${m.footerVis} parent=${m.footerParent} rect=${JSON.stringify(m.footer)}`);
    log(`menu items: ${JSON.stringify(m.footerItems)}`);
    if (await ev("document.body.classList.contains('pp4Foot')")) { await clickSel("#pp4Menu"); await sleep(400); }
  }
  const fin = s.open || s.closed;
  s.clockRow = fin.items.filter(t => /turn clock/i.test(t));
  s.offWindow = fin.rect ? (fin.rect.b > m.ih + 1 || fin.rect.r > m.iw + 1 || fin.rect.l < -1 || fin.rect.t < -1) : null;
  s.overCap = (m.side && ov(fin.rect, m.cap)) ? olap(fin.rect, m.cap) : null;
  log(`menu verdict: turn-clock row=[${s.clockRow.join(", ")}] offWindow=${s.offWindow} overCap=${s.overCap}`);
}

/* ---- SCENE: every coin flip takes the same time (D-49) ---- */
if (SCENES.includes("flips")) {
  const s = out.scenes.flips = { dock: [], battle: [] };
  /* THE INSTRUMENT. A MutationObserver on the coin's class, stamped in the rAF that FOLLOWS the
     mutation — i.e. the frame the change is painted, which is what a player actually waits
     through. Plus a permanent rAF ticker for the whole window, because an idle headless page stops
     producing frames and every animation then measures as free (DRIVING-THE-GAME §8a); the frame
     count is reported beside the numbers so a dead window is visible rather than believed. */
  await ev(`(()=>{
    window.__flip = { marks: [] };
    window.__f = 0; (function t(){ window.__f++; window.__raf = requestAnimationFrame(t); })();
    const el = document.getElementById('flipCoinWrap');
    const state = () => el.classList.contains('spin') ? 'spin'
      : el.classList.contains('heads') ? 'H' : el.classList.contains('tails') ? 'T'
      : el.classList.contains('active') ? 'active' : 'wait';
    let last = state();
    // the TAP is the start of what a player experiences; the paint is the start of what the code
    // controls. Both are recorded, because D-49's variation lives in the gap between them.
    el.addEventListener('click', () => window.__flip.marks.push({ s: 'tap', t: performance.now() }), true);
    new MutationObserver(() => {
      const s = state(); if (s === last) return; last = s;
      requestAnimationFrame(() => window.__flip.marks.push({ s, t: performance.now() }));
    }).observe(el, { attributes: true, attributeFilter: ['class'] });
    return 1; })()`);
  const readFlips = async () => ev(`(()=>{ const m = window.__flip.marks; const runs = [], taps = [];
    for (let i = 0; i < m.length; i++) if (m[i].s === 'spin') {
      for (let j = i + 1; j < m.length; j++) { if (m[j].s === 'H' || m[j].s === 'T') { runs.push(+(m[j].t - m[i].t).toFixed(1));
          for (let k = i - 1; k >= 0; k--) { if (m[k].s === 'tap') { taps.push(+(m[j].t - m[k].t).toFixed(1)); break; } }
          break; }
        if (m[j].s === 'spin') break; } }
    window.__flip.marks = []; return { runs, taps }; })()`);

  // --- the DOCK flip. humanFlip() is the real path, and the coin must be TAPPED (§4a:
  // #flipCoinWrap IS the button and is not an .apBtn) — that tap is exactly where the scheduling
  // latency D-49 is about enters the picture.
  for (let i = 0; i < 3; i++) {
    await ev(`(()=>{ const {st,flow} = window.__F; const p = st.game.players[st.mySeat ?? 0];
      window.__dockDone = false;
      flow.humanFlip(p, "Docking at the Flour Patch — dig for treasure!", false,
        "Heads pays 2 dubloons; tails pays nowt.").then(()=>{window.__dockDone=true;});
      return 1; })()`);
    let tapped = null;
    for (let k = 0; k < 30 && !tapped; k++) { await sleep(250); tapped = await clickSel("#flipCoinWrap.active"); }
    if (!tapped) { log(`dock flip ${i + 1}: coin never armed — skipped`); continue; }
    if (i === 0) { await sleep(400); s.dockShot = await shot("flip-dock-spinning"); }
    await sleep(3200);
    const r = await readFlips();
    if (r.runs.length) { s.dock.push(r.runs[0]); (s.dockTap = s.dockTap || []).push(r.taps[0] ?? null);
      log(`dock flip ${i + 1}: ${r.runs[0]} ms paint->result, ${r.taps[0] ?? "?"} ms TAP->result`); }
    else log(`dock flip ${i + 1}: no paint->result pair captured`);
    await sleep(1400);
  }
  // --- the BATTLE flips. asyncBattle() is exported. RED-PROOF: canAttack() must be FALSE before
  // the pose and TRUE after, or the battle we think we posed was already possible.
  const pre = await ev(`(()=>{const {st}=window.__F; const g=st.game, me=g.players[st.mySeat??0];
    const foe=g.players.find(p=>p!==me); return !!g.canAttack(me,foe);})()`);
  const posed = await ev(`(async()=>{ const {st,orch,board} = window.__F; const g = st.game;
    const me = g.players[st.mySeat ?? 0], foe = g.players.find(p => p !== me);
    me.pos = [4,4]; foe.pos = [5,4]; me.coins = Math.max(me.coins, 12); foe.coins = Math.max(foe.coins, 12);
    board.paintShipAt(g.players.indexOf(me), me.pos); board.paintShipAt(g.players.indexOf(foe), foe.pos);
    // canAttack() is powder + "the defender is carrying something" — NOT adjacency (that is
    // attackPlan's job). The first pose set the two ships side by side, which canAttack never
    // reads, and reported can=false; the red-proof is the only reason that was visible rather than
    // filed as "the battle path does not run".
    foe.baking = false;
    if (!foe.ing.length) foe.ing.push((foe.recipe && foe.recipe[0]) || 'Sea Salt');
    const can = !!g.canAttack(me, foe);
    if (can) { window.__battleDone = false; orch.asyncBattle(me, foe).then(()=>{window.__battleDone=true;}); }
    return { can, me: me.pos, foe: foe.pos }; })()`);
  s.battleRedProof = { canAttackBefore: pre, canAttackAfter: !!(posed && posed.can) };
  log(`battle pose RED-PROOF: canAttack before=${pre} after=${posed && posed.can}`);
  if (posed && posed.can) {
    // the attacker is a human seat, so its flip waits on a tap; the defender is a bot and flips on
    // its own. Tap whatever arms, bounded, then read every pair the observer caught.
    for (let k = 0; k < 90; k++) {
      await clickSel("#flipCoinWrap.active");
      await clickSel("#pp4Prompt .apBtn, .btlBtn", "b => !/back|←|‹/i.test(b.textContent)");
      if (k === 8) s.battleShot = await shot("flip-battle");
      if (await ev("!!window.__battleDone")) break;
      await sleep(450);
    }
    const rb = await readFlips();
    s.battle = rb.runs; s.battleTap = rb.taps;
    log(`battle flips: [${rb.runs.join(", ")}] ms paint->result`);
  }
  s.frames = await ev("window.__f");
  await ev("cancelAnimationFrame(window.__raf); 1");
  log(`frames driven across the flip window: ${s.frames} — a flat count would mean nothing was painting and every number above would be worthless`);
  const all = [...s.dock, ...s.battle];
  if (all.length) log(`ALL FLIPS: min=${Math.min(...all)} max=${Math.max(...all)} spread=${(Math.max(...all) - Math.min(...all)).toFixed(1)}ms`);
}

const errs = c.consoleErrs.slice(0, 10);
if (errs.length) log("CONSOLE: " + errs.join(" | "));
out.consoleErrors = errs;
out.notes = notes;
log(`\nwrote ${path.join(OUT, `result-${TAG}.json`)}`);
await finish(0);
