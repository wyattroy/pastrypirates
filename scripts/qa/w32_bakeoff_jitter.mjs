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
import { serve, launch, attach, killAll, sleep } from "../mp_rig.mjs";

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
console.log(`\n--- the motion (${n} crates, ${trace.length} frames over 12s; a glide moves <${SNAP.toFixed(1)}px a frame) ---`);
console.log(`  crates that travelled: ${moved ? "yes" : "NO — nothing moved"}`);
console.log(`  SNAPS (a jump with no content change): ${snaps.length}${snaps.length ? "  e.g. " + snaps.slice(0, 5).map(s2 => `crate ${s2.crate} ${s2.dx > 0 ? "+" : ""}${s2.dx}px at ${s2.t}ms`).join(", ") : ""}`);
console.log(`  contents swapped while the crate was still away from rest: ${contentJumps.length}${contentJumps.length ? "  e.g. " + contentJumps.slice(0, 5).map(s2 => `crate ${s2.crate} at x${s2.at} (${s2.t}ms)`).join(", ") : ""}`);

console.log(`\n=== W3-2 VERDICT ===`);
if (!moved) { console.log("  NOT RUN — the bench was reached but no crate moved, so no shuffle was watched. Not a pass."); killAll(); process.exit(2); }
console.log(`  bench spacing ${uniform ? "uniform — the one-pitch assumption in bakeoff.js holds" : "NOT UNIFORM — `(b-a)*pitch` cannot land every crate correctly"}`);
console.log(`  ${snaps.length} snap(s), ${contentJumps.length} early content swap(s)`);
killAll();
process.exit(!uniform || snaps.length || contentJumps.length ? 1 : 0);
