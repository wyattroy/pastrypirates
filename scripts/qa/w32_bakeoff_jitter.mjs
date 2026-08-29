/* W3-2 — DO THE BAKE-OFF CRATES JITTER AFTER BEING SHUFFLED?
 *
 *   node scripts/qa/w32_bakeoff_jitter.mjs      exit 0 = every crate travels forward and settles
 *
 * Wyatt: "Bake-off attempt 2+: the boxes jitter after being shuffled instead of settling smoothly."
 * His own hypothesis: "the open crates, or the borders around them."
 *
 * `?bake2=1` lands straight on attempt 2 (scripts/qa/w01_endgame_urls.mjs proves that flag lands
 * where it claims), so this needs no voyage.
 *
 * TWO MEASUREMENTS, because "jitter" could be either of two different things and they have
 * different fixes:
 *   THE BENCH — every crate's rect and its locked flag, and the gaps between consecutive crates.
 *     bakeoff.js measures ONE pitch (`bowls[1].left - bowls[0].left`) and every swap travels
 *     `(b-a) * pitch`. One spacing standing in for five positions is rule 9's shape: if the gaps
 *     are not equal, each crate lands slightly off and the commit snaps it straight — once per
 *     swap, which is what jitter looks like.
 *   THE MOTION — one crate's transform sampled every frame through the whole shuffle. A crate that
 *     settles smoothly moves in one direction and stops. A STEP BACKWARDS mid-swap, or a snap at
 *     the moment the contents commit, is the jitter itself and is visible in the trace.
 *
 * IT MUST BE ABLE TO FAIL: a run that never reaches attempt 2, or never sees a swap, prints NOT RUN
 * and exits non-zero. A shuffle nobody watched is not a shuffle that was smooth.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { serve, launch, attach, killAll, sleep } from "../mp_rig.mjs";
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

const PORT = 8506, DBG = 9406;
const url = serve(PORT);
launch(DBG, "/tmp/chrome-qa-w32");
const C = await attach(DBG);

const ADVANCE = `(()=>{
  const vis=e=>{if(!e)return false;const r=e.getBoundingClientRect();const s=getComputedStyle(e);
    return r.width>4&&r.height>4&&s.display!=='none'&&s.visibility!=='hidden';};
  const card=[...document.querySelectorAll('button')].find(b=>b.querySelector('.recipeThumb')&&vis(b));
  if(card){card.click();return 'recipe';}
  const go=[...document.querySelectorAll('button')].filter(vis)
    .find(b=>/arrgh|aye|continue|set sail|onward|begin|start|bake|ready/i.test((b.textContent||'')));
  if(go){go.click();return 'go:'+(go.textContent||'').trim().slice(0,14);}
  return null;})()`;

// the bench, read off what is painted — rects, locked flags, and the gaps between neighbours
const BENCH = `(()=>{const bs=[...document.querySelectorAll('.bkoBowl')];
  if(!bs.length) return null;
  const r=bs.map(b=>{const q=b.getBoundingClientRect();
    return {x:Math.round(q.left*100)/100, w:Math.round(q.width*100)/100,
            locked:b.classList.contains('locked')};});
  const gaps=r.slice(1).map((b,i)=>Math.round((b.x-r[i].x)*100)/100);
  return {n:r.length, bowls:r, gaps,
          attempt:(document.querySelector('.bkoAtt')||{}).textContent||null};})()`;

/* WATCH EVERY CRATE, AND WATCH THE SETTLE — the first version of this watched crate 0 alone and
   deliberately ignored motion near rest, so that the design's own return-to-zero at the commit was
   not miscounted as a fault. THAT IS EXACTLY WHERE HE SAYS THE JITTER IS: "instead of SETTLING
   smoothly". A detector that excludes the settle cannot see the reported bug, and it duly reported
   0 reversals on a bench he says jitters. Checking whether the instrument could reach its subject
   is what caught it — the acquittal was as suspect as a conviction would have been.
   So: every crate, every frame, transform x AND the ingredient it is carrying. A glide over a
   1000ms swap moves ~4px a frame; a SNAP is a single frame that jumps. And a content change that
   does not coincide with the position reset is the fill/cancel reconcile showing through. */
const WATCH = `(()=>{const bs=[...document.querySelectorAll('.bkoBowl')]; if(!bs.length) return 'no bench';
  window.__w32=[]; const t0=performance.now();
  const read=()=>{
    const row=bs.map(b=>{const m=new DOMMatrixReadOnly(getComputedStyle(b).transform);
      const img=b.querySelector('.bkoIng');
      return [Math.round(m.m41*10)/10, img?(img.getAttribute('src')||'').slice(-14):''];});
    window.__w32.push([Math.round(performance.now()-t0), row]);
    if(performance.now()-t0 < 12000) requestAnimationFrame(read);};
  requestAnimationFrame(read); return 'watching';})()`;

/* ONE WALK, TWO ENGINES. He plays Safari, and everything above was measured in Chromium only —
   which is exactly the gap that lets a "cannot reproduce" be wrong. WebKit's handling of
   Element.animate with fill:"forwards" followed by cancel() is the part of this choreography most
   likely to differ, and bakeoff.js even carries a no-WAAPI fallback "for very old WebKit". So the
   walk to the bench and the two measurements are a function, and both engines run it. */
async function measure(P, label) {
  await P.nav(P.base + "?bake2=1");
  for (let i = 0; i < 60 && !(await P.ev(`document.readyState==='complete'`)); i++) await sleep(500);
  await P.ev(`localStorage.clear();localStorage.setItem('pp_id','w32-'+Math.floor(Math.random()*1e9));true`);
  await P.nav(P.base + "?bake2=1");
  for (let i = 0; i < 60 && !(await P.ev(`document.readyState==='complete'`)); i++) await sleep(500);
  await sleep(1200);
  for (let i = 0; i < 40; i++) { if (await P.ev(`(()=>{const e=document.getElementById('choiceSolo');return !!(e&&e.offsetParent)})()`)) break; await sleep(600); }
  await P.ev(`document.getElementById('choiceSolo').click();true`); await sleep(900);
  for (let i = 0; i < 30; i++) { if (await P.ev(`(()=>{const m=document.getElementById('nameModalInput');return !!(m&&m.offsetParent)})()`)) break; await sleep(500); }
  await P.ev(`document.getElementById('nameModalInput').value='Davy Probe';true`);
  await P.ev(`document.getElementById('btnNameConfirm').click();true`);
  let bench = null;
  for (let i = 0; i < 60; i++) { bench = await P.ev(BENCH); if (bench && bench.n) break; await P.ev(ADVANCE); await sleep(1400); }
  if (!bench || !bench.n) { console.log(`\n### ${label}: NOT RUN — never reached a bake-off bench`); return null; }
  await P.ev(WATCH);
  for (let i = 0; i < 6; i++) { await P.ev(ADVANCE); await sleep(400); }
  await sleep(12300);
  const tr = JSON.parse(await P.ev(`JSON.stringify(window.__w32||[])`));
  return { bench, trace: tr };
}

await C.send("Emulation.setDeviceMetricsOverride", { width: 1200, height: 950, deviceScaleFactor: 1, mobile: false });
await C.goto(url + "?bake2=1");
await C.waitFor(`document.readyState==='complete'`, 30000, "load");
await C.ev(`localStorage.clear();localStorage.setItem('pp_id','w32-'+Math.floor(Math.random()*1e9));true`);
await C.goto(url + "?bake2=1");
await C.waitFor(`document.readyState==='complete'`, 30000, "reload");
await sleep(1000);
await C.waitFor(`(()=>{const e=document.getElementById('choiceSolo');return !!(e&&e.offsetParent)})()`, 25000, "home");
await C.ev(`document.getElementById('choiceSolo').click();true`); await sleep(700);
await C.waitFor(`(()=>{const m=document.getElementById('nameModalInput');return !!(m&&m.offsetParent)})()`, 15000, "name");
await C.ev(`document.getElementById('nameModalInput').value='Davy Probe';true`);
await C.ev(`document.getElementById('btnNameConfirm').click();true`);

let bench = null;
/* 60 x 1.4s, the same ceiling scripts/qa/w01_endgame_urls.mjs needed to reach the bake — a shorter
   loop reports "never reached a bench" about a game that was still walking there. */
for (let i = 0; i < 60; i++) {
  bench = await C.ev(BENCH);
  if (bench && bench.n) break;
  await C.ev(ADVANCE); await sleep(1400);
}
if (!bench || !bench.n) {
  const why = await C.ev(`(async()=>{try{
    if(!window.appState){const m=await import('/src/state/index.js');window.appState=m.appState;}
    const g=window.appState.game; const h=g&&(g.players.find(p=>p.strategy==='human')||g.players[0]);
    return JSON.stringify({day:g?g.round:null, baking:h?!!h.baking:null,
      attempts:h&&h.bake?h.bake.attempts:null, panel:(document.querySelector('.apMsg')||{}).textContent||null,
      bkoNodes:document.querySelectorAll('.bko,.bkoBowl,.bkoRow').length});}catch(e){return String(e.message)}})()`);
  console.log(`NOT RUN — never reached a bake-off bench. State: ${why}`);
  killAll(); process.exit(2);
}

console.log(`\n--- the bench (${bench.attempt || "attempt unknown"}) ---`);
bench.bowls.forEach((b, i) => console.log(`  crate ${i}  x ${b.x}  w ${b.w}${b.locked ? "   LOCKED" : ""}`));
const uniform = bench.gaps.every(g => Math.abs(g - bench.gaps[0]) < 0.5);
console.log(`  gaps between neighbours: ${bench.gaps.join(", ")}   ${uniform ? "UNIFORM" : "NOT UNIFORM"}`);

// start the shuffle if it has not started, then trace one crate
await C.ev(WATCH);
for (let i = 0; i < 6; i++) { await C.ev(ADVANCE); await sleep(400); }
await sleep(12300);
const trace = JSON.parse(await C.ev(`JSON.stringify(window.__w32||[])`));
if (trace.length < 60) { console.log(`NOT RUN — only ${trace.length} frames captured; nothing was watched`); killAll(); process.exit(2); }
const n = trace[0][1].length;
/* A GLIDE MOVES A FEW PIXELS A FRAME. Derived, not typed: the swap is SWAP_MS long and the longest
   journey on this bench is 4 pitches, so even the fastest legitimate frame is well under a fifth of
   a pitch. Anything above that in ONE frame is a discontinuity a player sees as a jerk. */
const pitch = bench.gaps[0];
const SNAP = pitch / 5;
const snaps = [], contentJumps = [];
let moved = false;
for (let c = 0; c < n; c++) {
  for (let i = 1; i < trace.length; i++) {
    const [t, row] = trace[i], prev = trace[i - 1][1];
    if (Math.abs(row[c][0]) > 1) moved = true;
    const dx = row[c][0] - prev[c][0];
    // the commit legitimately returns a crate to rest in one frame AND swaps its contents in the
    // same breath — that pair is the design, so it is only a snap when the content did NOT change
    const contentSame = row[c][1] === prev[c][1];
    if (Math.abs(dx) > SNAP && contentSame) snaps.push({ crate: c, t, dx: Math.round(dx) });
    if (!contentSame && Math.abs(row[c][0]) > 1)
      contentJumps.push({ crate: c, t, at: row[c][0] });
  }
}
/* AND THE FRAME CLOCK, which is the candidate my first two theories were hiding.
   "Jitter" in a glide is usually not a wrong POSITION — it is a frame that never arrived. The
   crates carry a 2px border and two background gradients and are NOT promoted to their own
   compositing layer, so every frame re-rasterises them; this project has form exactly here
   (docs/DRIVING-THE-GAME §8a measured the same animation at ~62 layouts/sec one way and zero the
   other). An average of 60fps hides a stall completely, so measure the GAPS, not the mean. */
  const ts = trace.map(p => p[0]);
  const gaps2 = ts.slice(1).map((t, i) => t - ts[i]);
  const sorted = gaps2.slice().sort((a, b) => a - b);
  const p50 = sorted[Math.floor(sorted.length * 0.5)];
  const p99 = sorted[Math.floor(sorted.length * 0.99)];
  const stalls = gaps2.filter(g => g > 33).length;         // two frames' worth at 60Hz
  const longStalls = gaps2.filter(g => g > 60).length;     // a visible hitch
  console.log(`\n--- the frame clock (${trace.length} frames) ---`);
  console.log(`  median gap ${p50}ms   99th ${p99}ms   worst ${Math.max(...gaps2)}ms`);
  console.log(`  frames longer than 33ms (a dropped frame): ${stalls}   longer than 60ms (a visible hitch): ${longStalls}`);

console.log(`\n--- the motion (${n} crates, ${trace.length} frames over 12s; a glide moves <${SNAP.toFixed(1)}px a frame) ---`);
console.log(`  crates that travelled: ${moved ? "yes" : "NO — nothing moved"}`);
console.log(`  SNAPS (a jump with no content change): ${snaps.length}${snaps.length ? "  e.g. " + snaps.slice(0, 5).map(s2 => `crate ${s2.crate} ${s2.dx > 0 ? "+" : ""}${s2.dx}px at ${s2.t}ms`).join(", ") : ""}`);
console.log(`  contents swapped while the crate was still away from rest: ${contentJumps.length}${contentJumps.length ? "  e.g. " + contentJumps.slice(0, 5).map(s2 => `crate ${s2.crate} at x${s2.at} (${s2.t}ms)`).join(", ") : ""}`);

console.log(`\n=== W3-2 VERDICT ===`);
if (!moved) { console.log("  NOT RUN — the bench was reached but no crate moved, so no shuffle was watched. Not a pass."); killAll(); process.exit(2); }
console.log(`  bench spacing ${uniform ? "uniform — the one-pitch assumption in bakeoff.js holds" : "NOT UNIFORM — `(b-a)*pitch` cannot land every crate correctly"}`);
console.log(`  ${snaps.length} snap(s), ${contentJumps.length} early content swap(s)`);
killAll();

/* ---- THE SAFARI LEG ---- */
let wkVerdict = "NOT RUN";
try {
  const { openWebKit } = await import("../lib/wk.mjs");
  const P = await openWebKit({ W: 1200, H: 950, httpPort: 8507, serveRoot: REPO,
                               profileDir: "/tmp/wk-w32", mobile: false, dsf: 1 });
  P.base = "http://127.0.0.1:8507/";
  /* THE CONTROL, AND WITHOUT IT THIS WHOLE LEG IS WORTHLESS. Headless WebKit in a container is
     slower than Chromium at everything, so "WebKit ran at 32fps during the shuffle" says nothing
     until we know what WebKit does here when it is NOT shuffling. Measured on the lobby, the same
     engine, the same container, seconds apart: if the idle clock is also ~31ms it is the container
     and I have no finding; if idle is ~17ms and only the bake-off halves, the animation is the
     cause and his report is reproduced. */
  await P.nav(P.base);
  for (let i = 0; i < 40 && !(await P.ev(`document.readyState==='complete'`)); i++) await sleep(500);
  await sleep(1500);
  await P.ev(`(()=>{window.__ctl=[];const t0=performance.now();
    const f=()=>{window.__ctl.push(Math.round(performance.now()-t0));
      if(performance.now()-t0<4000)requestAnimationFrame(f);};requestAnimationFrame(f);return 1;})()`);
  await sleep(4400);
  const ctl = JSON.parse(await P.ev(`JSON.stringify(window.__ctl||[])`));
  const cg = ctl.slice(1).map((t, i) => t - ctl[i]).sort((a, b) => a - b);
  const idleMedian = cg.length ? cg[Math.floor(cg.length / 2)] : null;
  console.log(`\n### WebKit CONTROL — an idle page in the same engine and container`);
  console.log(`  ${ctl.length} frames over 4s   median gap ${idleMedian}ms   worst ${cg.length ? cg[cg.length - 1] : "-"}ms`);

  const r = await measure(P, "WebKit (Safari's engine)");
  if (r) {
    const ts2 = r.trace.map(p => p[0]);
    const g2 = ts2.slice(1).map((t, i) => t - ts2[i]);
    const s2 = g2.slice().sort((a, b) => a - b);
    const n2 = r.trace[0][1].length;
    let snaps2 = 0, moved2 = false;
    const pitch2 = r.bench.gaps[0], SNAP2 = pitch2 / 5;
    for (let c = 0; c < n2; c++) for (let i = 1; i < r.trace.length; i++) {
      const row = r.trace[i][1], prev = r.trace[i - 1][1];
      if (Math.abs(row[c][0]) > 1) moved2 = true;
      if (Math.abs(row[c][0] - prev[c][0]) > SNAP2 && row[c][1] === prev[c][1]) snaps2++;
    }
    const hitch2 = g2.filter(x => x > 60).length, drop2 = g2.filter(x => x > 33).length;
    console.log(`\n### WebKit (Safari's engine), 1200x950`);
    console.log(`  gaps: ${r.bench.gaps.join(", ")}`);
    console.log(`  ${r.trace.length} frames  median ${s2[Math.floor(s2.length / 2)]}ms  worst ${Math.max(...g2)}ms  dropped ${drop2}  hitches ${hitch2}`);
    console.log(`  crates travelled: ${moved2 ? "yes" : "NO"}   snaps: ${snaps2}`);
    const wkMedian = s2[Math.floor(s2.length / 2)];
    /* THE COMPARISON IS AGAINST WEBKIT'S OWN IDLE CLOCK, never against Chromium's. */
    const slower = idleMedian != null && wkMedian > idleMedian * 1.4;
    console.log(`  idle here was ${idleMedian}ms; during the shuffle ${wkMedian}ms — ${slower ? "the shuffle is what slows it" : "no worse than this engine is anyway"}`);
    wkVerdict = !moved2 ? "NOT RUN (nothing moved)"
      : (snaps2 || hitch2) && slower ? `JITTER: ${snaps2} snap(s), ${hitch2} hitch(es), ${wkMedian}ms vs ${idleMedian}ms idle`
      : (snaps2 || hitch2) ? `${snaps2} snap(s)/${hitch2} hitch(es) BUT idle is ${idleMedian}ms too — this container's WebKit, not the game`
      : "clean";
  }
  await P.close();
} catch (e) {
  console.log(`\n### WebKit: did NOT run — ${String(e && e.message || e).slice(0, 140)}`);
}
console.log(`\n  Chromium: ${snaps.length || longStalls ? "JITTER" : "clean"}   WebKit: ${wkVerdict}`);
if (wkVerdict === "NOT RUN" || wkVerdict.startsWith("NOT RUN"))
  console.log("  ⚠ the Safari leg did not produce a measurement — that is not a pass. He plays Safari.");
process.exit(!uniform || snaps.length || contentJumps.length || longStalls || /JITTER|NOT RUN/.test(wkVerdict) ? 1 : 0);
