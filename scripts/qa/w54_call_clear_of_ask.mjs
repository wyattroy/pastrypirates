/* W5-4 — DOES A "CALL THE WINNER" CIRCLE SIT ON THE QUESTION IT ANSWERS?
 *
 *   node scripts/qa/w54_call_clear_of_ask.mjs        exit 0 = the pill is never covered
 *
 * THE FINDING THIS EXISTS FOR. Release sea trial 2026-09-01T1914Z, leg `passplay-phone`, the only
 * structural failure in ten legs: `no-cover-ask` — "Call Flaky Jack" over "Davy Scones — a battle's
 * brewi[ng]". The previous trial caught the same check once on a different prompt. A player is
 * asked by name to pick a winner and the circle they must tap is drawn on the sentence that asks.
 *
 * POSED, NOT SAILED (CLAUDE.md rule 26). Three probe runs of a stochastic voyage gave 7/12/5 on a
 * question two pictures settle. So this poses the exact prompt collectSideBets() poses — localAsk
 * with two options carrying `seat`, which is the only input the anchored-boats placement reads —
 * and walks the two named captains across the board, because WHERE the fight is, is the variable
 * the trial could not control.
 *
 * THE GEOMETRY IS THE GATE'S OWN, NOT A RE-DERIVATION. `shapeOverlap` in scripts/lib/checks.mjs is
 * copied in shape (circle centre to nearest point on the box, tol 4) so a pass here means the same
 * thing a pass there means. Measuring a different quantity than the one that is broken is the
 * failure CLAUDE.md rule 26 was written about.
 *
 * IT ALSO MEASURES WHY, in the only way that can separate the two candidate causes:
 *   wantTop   — where liftAskClearOfFan() would put the pill (blockTop - pillH - 10)
 *   pillTop   — where the pill actually is
 * pillTop > wantTop means the lift ASKED to go higher and was refused by its `tSafe - 34` floor —
 * it is clamp-bound, the mechanism CEO review 4 measured on guest-022 in 2026-08-26. pillTop close
 * to wantTop with an overlap still present means something else defeated the lift, which is the
 * host-016 case that review recorded as NOT ESTABLISHED. Reporting which one it is, per pose, is
 * the whole point of the probe.
 */
import path from "node:path";
import { serve, launch, attach, killAll, sleep, REPO } from "../mp_rig.mjs";
import { freshProfileDir } from "../lib/cdp.mjs";

const PORT = 8494, DBG = 9394;
const url = serve(PORT);
/* ABSOLUTE, AND FRESHENED — rule 18, plus the Windows fault cdp.mjs already carries. A relative
   `--user-data-dir` never brought Chrome up here at all (measured: "no chrome on 9394", twenty
   seconds of polling, Chrome installed and resolving fine), and on Windows a profile a killed run
   still holds open cannot be unlinked, so freshProfileDir falls to a sibling rather than dying. */
launch(DBG, freshProfileDir(path.join(REPO, ".tmp-chrome-w54")));
const C = await attach(DBG);

const ADVANCE = `(()=>{
  const vis=e=>{if(!e)return false;const r=e.getBoundingClientRect();const s=getComputedStyle(e);
    return r.width>4&&r.height>4&&s.display!=='none'&&s.visibility!=='hidden';};
  const card=[...document.querySelectorAll('button')].find(b=>b.querySelector('.recipeThumb')&&vis(b));
  if(card){card.click();return 'recipe';}
  const go=[...document.querySelectorAll('button')].filter(vis)
    .find(b=>/arrgh|aye|continue|set sail|onward|begin|start/i.test((b.textContent||'')));
  if(go){go.click();return 'intro:'+(go.textContent||'').trim().slice(0,16);}
  return null;})()`;

// what shape is a square, and how big is the board? asked of the game rather than assumed
const SHAPE = `(async()=>{try{
  const st=(await import('/src/state/index.js')).appState; const g=st.game; if(!g) return {err:'no game'};
  return {pos:JSON.stringify(g.players[0].pos), n:g.N||g.n||g.size||null,
    keys:Object.keys(g).filter(k=>/^(N|n|size|w|h|dim|grid)$/.test(k)),
    players:g.players.length, me:st.mySeat};
}catch(e){return {err:String(e.message).slice(0,160)}}})()`;

// put the two named captains on chosen squares, then pose the real call prompt on them
const pose = (a, d, ax, ay, dx, dy) => `(async()=>{try{
  const f=await import('/src/ui/flow.js');
  const b=await import('/src/ui/board.js');
  const st=(await import('/src/state/index.js')).appState; const g=st.game; if(!g) return {err:'no game'};
  /* A SQUARE IS AN ARRAY, [x,y] — asked of the live game, not assumed. The first version of this
     probe wrote {x,y}, the ships never moved, and twenty-one poses returned the identical screen
     with "0 covered". That is a check that could not fail, so the numbers below report where the
     boats ACTUALLY are and the caller refuses a pose that did not move them. */
  g.players[${a}].pos=[${ax},${ay}]; g.players[${d}].pos=[${dx},${dy}];
  b.snapShipTo(${a}, g.players[${a}].pos); b.snapShipTo(${d}, g.players[${d}].pos);
  f.localAsk("\\u2694\\uFE0F "+(g.players[${a}].name||"Captain")+" \\u2014 a battle's brewing! Call the winner \\u2014 it's free, and ye get 2\\uD83C\\uDF15 if yer right.",
    [{label:"Call "+(g.players[${a}].name||("Captain "+${a})),value:"a",seat:${a}},
     {label:"Call "+(g.players[${d}].name||("Captain "+${d})),value:"d",seat:${d}}]);
  return {ok:true};
}catch(e){return {err:String(e.message).slice(0,160)}}})()`;

/* THE GATE'S OWN MATH, and the lift's own arithmetic, read off what is painted. */
const MEASURE = `(async()=>{try{
  const bd=await import('/src/ui/board.js');
  const ap=document.getElementById('actionPanel'); if(!ap) return {err:'no actionPanel'};
  const box=document.getElementById('pp4Prompt');
  const msg=ap.querySelector('.apMsg'); if(!msg) return {err:'no .apMsg'};
  const btns=[...ap.querySelectorAll('.apBtn')].filter(b=>b.offsetWidth>4);
  if(!btns.length) return {err:'no buttons'};
  const R=e=>{const r=e.getBoundingClientRect();return {l:r.left,t:r.top,r:r.right,b:r.bottom,w:r.width,h:r.height};};
  const mr=R(msg);
  // circle vs rectangle, exactly as scripts/lib/checks.mjs shapeOverlap does it at tol 4
  const near=(c,box2)=>{const cx=c.l+c.w/2, cy=c.t+c.h/2;
    const px=Math.max(box2.l,Math.min(cx,box2.r)), py=Math.max(box2.t,Math.min(cy,box2.b));
    return Math.min(c.w,c.h)/2 - Math.hypot(cx-px,cy-py);};
  const rows=btns.map(bt=>{const r=R(bt); const d=near(r,mr);
    return {label:(bt.textContent||'').trim().slice(0,18), seat:bt.dataset?bt.dataset.seat:null,
      x:Math.round(r.l), y:Math.round(r.t), w:Math.round(r.w),
      onAsk: d > 4, deep: Math.round(d*100)/100};});
  const blockTop=Math.min(...btns.map(b=>R(b).t));
  // where the boats actually ARE on screen, so a pose that did not move them is visible
  const ships=(bd.boardShipEls()||[]).map(e=>{const r=e.getBoundingClientRect();
    return Math.round(r.left)+','+Math.round(r.top);});
  return {radial: !!(box&&box.classList.contains('radial')), ships:ships.join(' '),
    stage: ap.dataset?(ap.dataset.pp4Stage||null):null,
    msg:(msg.textContent||'').trim().slice(0,34),
    pillTop:Math.round(mr.t), pillH:Math.round(mr.h), pillL:Math.round(mr.l), pillW:Math.round(mr.w),
    wantTop:Math.round(blockTop-mr.h-10), blockTop:Math.round(blockTop),
    rows, covered: rows.some(r=>r.onAsk)};
}catch(e){return {err:String(e.message).slice(0,160)}}})()`;

async function boot(tag, w, h, mobile){
  await C.send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: mobile ? 2 : 1, mobile });
  await C.goto(url);
  await C.waitFor(`document.readyState==='complete'`, 30000, `${tag}: load`);
  await C.ev(`localStorage.clear();localStorage.setItem('pp_id','w54-'+Math.floor(Math.random()*1e9));true`);
  await C.goto(url);
  await C.waitFor(`document.readyState==='complete'`, 30000, `${tag}: reload`);
  await sleep(1000);
  await C.waitFor(`(()=>{const e=document.getElementById('choiceSolo');return !!(e&&e.offsetParent)})()`, 25000, `${tag}: home`);
  await C.ev(`document.getElementById('choiceSolo').click();true`);
  await sleep(800);
  await C.waitFor(`(()=>{const m=document.getElementById('nameModalInput');return !!(m&&m.offsetParent)})()`, 15000, `${tag}: name`);
  await C.ev(`document.getElementById('nameModalInput').value='Davy Probe';true`);
  await C.ev(`document.getElementById('btnNameConfirm').click();true`);
  // advance until a real RADIAL board prompt is live — posing over an unresolved ceremony ask
  // leaves data-pp4-stage set and every later prompt is routed to the centre stage instead (w52)
  // BOUNDED, and generous: a solo game reaches its first radial board prompt in a handful of taps
  // most of the time and occasionally needs a long ceremony out of the way first. At 40 tries two
  // of three legs came back NOT RUN on one run and all three ran on the next — a budget that thin
  // makes the probe's own verdict depend on the weather.
  for (let i = 0; i < 90; i++){
    const live = await C.ev(`(()=>{const b=document.getElementById('pp4Prompt');const a=document.getElementById('actionPanel');
      return !!(b&&b.classList.contains('radial')&&a&&!a.dataset.pp4Stage&&a.querySelector('.apBtn'))})()`);
    if (live) return true;
    await C.ev(ADVANCE); await sleep(900);
  }
  return false;
}

const LEGS = [["phone", 390, 844, true], ["phone-short", 390, 664, true], ["tablet", 768, 1024, false]];
let covered = 0, measured = 0, clampBound = 0, notRun = 0;
const shots = [];

for (const [tag, w, h, mob] of LEGS){
  console.log(`\n--- ${tag} ${w}x${h} ---`);
  if (!(await boot(tag, w, h, mob))){ console.log("  NOT RUN — never reached a live radial board prompt"); notRun++; continue; }
  const shape = await C.ev(SHAPE);
  if (!shape || shape.err){ console.log(`  NOT RUN — ${shape ? shape.err : "no shape"}`); notRun++; continue; }
  console.log(`  board: pos=${shape.pos} keys=${JSON.stringify(shape.keys)} n=${shape.n} players=${shape.players} me=${shape.me}`);
  const seats = [];
  for (let i = 0; i < shape.players && seats.length < 2; i++) if (i !== shape.me) seats.push(i);
  if (seats.length < 2){ console.log("  NOT RUN — need two captains who are not me"); notRun++; continue; }
  const N = shape.n || 12;
  let lastShips = null;
  // WHERE THE FIGHT IS, IS THE VARIABLE THE TRIAL COULD NOT CONTROL. Walk the pair down the board:
  // the top rows are where the pill's ceiling and the circles' band floor are predicted to collide.
  const POSES = [];
  for (const row of [0, 1, 2, Math.floor(N / 2), N - 2]) POSES.push([2, row, 5, row]);
  POSES.push([1, 0, 2, 1]);                                    // adjacent, hard against the top-left
  POSES.push([Math.max(0, N - 3), 0, Math.max(0, N - 2), 1]);  // adjacent, top-RIGHT corner
  for (const [ax, ay, dx, dy] of POSES){
    const p = await C.ev(pose(seats[0], seats[1], ax, ay, dx, dy));
    if (!p || p.err){ console.log(`  pose(${ax},${ay})/(${dx},${dy}): POSE FAILED — ${p ? p.err : "no result"}`); notRun++; continue; }
    await sleep(1600);                                  // let the stage tick place, lift and re-place
    const m = await C.ev(MEASURE);
    if (!m || m.err){ console.log(`  pose(${ax},${ay})/(${dx},${dy}): NOT RUN — ${m ? m.err : "no measurement"}`); notRun++; continue; }
    if (!m.radial){ console.log(`  pose(${ax},${ay})/(${dx},${dy}): NOT RUN — not radial (stage=${m.stage})`); notRun++; continue; }
    /* THE POSE MUST HAVE LANDED. A probe that measures a screen it never created is the failure
       CLAUDE.md rule 6 names, and this one committed it: the first version wrote {x,y} squares,
       nothing moved, and twenty-one identical screens read as "0 covered". Two different poses
       that produce the identical ship layout are NOT RUN, never a pass. */
    if (m.ships === lastShips){ console.log(`  pose(${ax},${ay})/(${dx},${dy}): NOT RUN — the boats did not move (pose did not land)`); notRun++; continue; }
    lastShips = m.ships;
    measured++;
    const cb = m.pillTop > m.wantTop + 1;
    if (m.covered){ covered++; if (cb) clampBound++; }
    const flag = m.covered ? (cb ? "  <-- COVERED (lift clamp-bound)" : "  <-- COVERED (lift NOT clamped)") : "";
    console.log(`  boats (${ax},${ay})/(${dx},${dy})  pill top ${m.pillTop} h${m.pillH}  lift wanted ${m.wantTop}  circles top ${m.blockTop}${flag}`);
    for (const r of m.rows) console.log(`      seat ${r.seat} "${r.label}" at ${r.x},${r.y}  clearance ${-r.deep}px${r.onAsk ? "  ON THE ASK" : ""}`);
    if (m.covered && shots.length < 4){ const f = `w54-${tag}-${ax}${ay}-${dx}${dy}.png`; await C.shot(f); shots.push(f); }
  }
}

console.log(`\n=== W5-4 VERDICT ===`);
console.log(`  poses measured: ${measured}   NOT RUN: ${notRun}   circle on the ask: ${covered} (${clampBound} of them with the lift clamp-bound)`);
if (shots.length) console.log(`  shots: ${shots.join(", ")}`);
if (!measured){ console.log("  NOTHING MEASURED — not a pass."); killAll(); process.exit(2); }
killAll();
process.exit(covered ? 1 : 0);
