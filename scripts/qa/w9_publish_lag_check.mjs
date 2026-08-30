/* W9 — "the guest is starved of the storm sweep, it is not busy."
   ─────────────────────────────────────────────────────────────────────────────────────────────
   WHAT IT MEASURES, AND WHY THE NUMBER IS TRUSTWORTHY
   Poses a swept storm push in a live crew room and measures, ON THE HOST TAB ONLY, the gap
   between the moment the `tradewind` event is APPENDED to game.events and the moment it is
   PUBLISHED (appState.evPushed passes its index). Both readings come from the same tab, so there
   is NO NETWORK IN THE NUMBER — this cannot be explained away as a slow guest or a slow link.
   It also measures the SAME quantity for every other event of the same storm as a built-in
   control, so the instrument is visibly able to print a small number as well as a large one. A
   check that cannot print PASS is not a check (CLAUDE.md rule 6: red-proof the instrument).

   THE DEFECT IT GUARDS (measured 2026-08-30, real two-browser crew room):
   the host emitted the sweep at t=2326ms, rode it inline for 1447ms, and it did not reach the wire
   until t=3989ms. The guest received it 47ms later and started its ride 64ms after that. The
   network was 47ms. Every other player's board was frozen for the length of the HOST'S OWN
   animation, and the freeze grew with it. Cause: the awaited ride ran before `liveRender()`, and
   liveRender (src/ui/panel.js -> netHandlers().onEvents -> src/orchestrator.js pushEvents) is the
   ONLY publisher in the tree. There is no timer that pushes. Fixed by publishing first
   (`publishNow()` in src/ui/flow.js) and leaving the ride exactly where it was.

   NOT the same thing as a guest being a moment behind — that is expected and deliberate
   (docs/INTENDED-BEHAVIOUR.md §3). This measures an ARTIFICIAL hold, on the host, before the wire.

   ─────────────────────────────────────────────────────────────────────────────────────────────
   NOT IN `npm test`. Deliberate: whether browser-driven gates join the suite is Q-22, parked for
   Wyatt. Run it by hand against a live crew room.

   USAGE
     1. serve the tree            python3 -m http.server 8548 --bind 127.0.0.1
     2. two chromes with          --remote-debugging-port=9631   (host)
                                  --remote-debugging-port=9632   (guest)
     3. get them into a room      see docs/DRIVING-THE-GAME.md §5c, or scripts/mp_rig.mjs
     4. node scripts/qa/w9_publish_lag_check.mjs [hostDebugPort] [gamePortSubstring]

   EXIT CODES — 0 GREEN, 1 RED, 2 NOT RUN.
   **NOT RUN IS NEVER A PASS.** A leg that could not start is not a leg that passed, and this
   check prints the reason it could not start rather than a verdict it has not earned. Use a FRESH
   room (few events) and, if the swept ship falls late in stormOrder, raise WINDOW_MS. */
import fs from 'node:fs';

const PORT      = +(process.argv[2] || 9631);
const SITE      = process.argv[3] || '127.0.0.1:8548';
const BUDGET_MS = 250;      // two frames of slack; publication is a synchronous call, not a wait
const WINDOW_MS = +(process.env.W9_WINDOW_MS || 60000);  // how long we will watch for the sweep
const OUT       = process.env.W9_OUT || null;            // optional raw-sample dump

const sleep = ms => new Promise(r => setTimeout(r, ms));
const NOTRUN = (why) => { console.log('NOT RUN — ' + why); console.log('           (a leg that could not start is not a leg that passed)'); process.exit(2); };

async function attach(port){
  let list;
  try { list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); }
  catch(e){ NOTRUN(`no debuggable browser on port ${port} (${e.message})`); }
  const t = list.find(x => x.type === 'page' && x.url.includes(SITE));
  if(!t) NOTRUN(`no game page on port ${port} whose URL contains "${SITE}"`);
  const ws = new WebSocket(t.webSocketDebuggerUrl); let id = 0; const pend = new Map();
  await new Promise(r => ws.onopen = r);
  ws.onmessage = e => { const m = JSON.parse(e.data); if(m.id && pend.has(m.id)){ pend.get(m.id)(m); pend.delete(m.id); } };
  const C = {};
  C.send = (method, params = {}) => new Promise(res => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
  C.evalJS = async expr => {
    const r = await C.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true, timeout: 40000 });
    if(r.result?.exceptionDetails) return '__ERR ' + String(r.result.exceptionDetails.exception?.description || '').slice(0, 300);
    return r.result?.result?.value;
  };
  await C.send('Runtime.enable');
  return C;
}

(async () => {
  const H = await attach(PORT);

  const pre = await H.evalJS(`(async()=>{window.__st=(await import('/src/state/index.js')).appState;
    window.__flow=await import('/src/ui/flow.js');window.__sh=await import('/src/shared/index.js');
    return JSON.stringify({host:window.__st.isHost,live:!!window.__st.live,room:window.__st.room,
      evs:window.__st.game?window.__st.game.events.length:null})})()`);
  if(typeof pre !== 'string' || pre.startsWith('__ERR')) NOTRUN('could not read the page state: ' + pre);
  console.log('page:', pre);
  const st = JSON.parse(pre);
  if(!st.host || !st.live || !st.room) NOTRUN('this tab is not a live host in a room — host a crew game first (docs/DRIVING-THE-GAME.md §5c)');

  /* POSE THE BOARD rather than sailing to it (CLAUDE.md rule 26, DRIVING-THE-GAME.md §5e): put a
     ship two water squares upwind of the rim so the engine's push ends SWEPT. A voyage played to
     a natural sweep is many minutes of stochastic sailing for one sample. */
  const pick = JSON.parse(await H.evalJS(`(()=>{const g=window.__st.game,D=window.__sh.DIRS;
    const water=c=>!g.blocked(c)&&!g.isIsland(c)&&!g.isHome(c)&&!g.onRim(c);
    const at=(c,p)=>g.players.some(q=>q!==p&&q.pos[0]===c[0]&&q.pos[1]===c[1]);
    const rim=[...g.rim].map(s=>s.split(',').map(Number));
    /* EVERY SQUARE ON THE ROUTE HAS TO BE CLEAR, INCLUDING THE RIM SQUARE ITSELF, and every seat is
       tried rather than only players[0]. An earlier version checked the two water squares and not
       the rim square a ship may already be sitting on: the push then came back \`landHeld\` (an
       \`anchorHold\` event, no sweep) three runs in a row and the check honestly printed NOT RUN
       each time. A pose that cannot produce its subject is a check that can never go green. */
    // a captain at the ovens or already home is not on the board and cannot be pushed at all
    for(const p of g.players.filter(q=>!q.done&&!q.baking)){for(const k of Object.keys(D)){const d=D[k];for(const R of rim){
      const c1=[R[0]-d[0],R[1]-d[1]],c=[R[0]-2*d[0],R[1]-2*d[1]];
      if(!water(c1)||!water(c))continue;
      if(at(c,p)||at(c1,p)||at(R,p))continue;
      p.pos=[...c];return JSON.stringify({dir:k,seat:p.idx,from:c,rim:R});}}}
    return JSON.stringify(null)})()`) || 'null');
  if(!pick) NOTRUN('could not pose a swept storm push on this board (no rim square with two clear water squares upwind)');
  console.log('posed:', JSON.stringify(pick));

  // sample events.length and evPushed every frame — publication is a synchronous call inside the
  // publisher, so a per-frame sample is finer than the thing being measured
  const frames = Math.ceil(WINDOW_MS / 16) + 240;
  await H.evalJS(`(()=>{window.__P=[];window.__run=true;const t0=performance.now();
    const tick=()=>{const s=window.__st;window.__P.push([+(performance.now()-t0).toFixed(1),s.game.events.length,s.evPushed]);
      if(window.__P.length<${frames}&&window.__run)requestAnimationFrame(tick);};requestAnimationFrame(tick);return 1})()`);
  await sleep(300);

  const before = await H.evalJS(`window.__st.game.events.length`);
  await H.evalJS(`window.__flow.runStormLive(${JSON.stringify(pick.dir)})`);

  /* ADAPTIVE WINDOW, and this is the fix for the way this check used to give up. The old version
     slept a fixed 25s; when the swept ship fell late in stormOrder the storm was still running when
     the sampler stopped, so the sweep was never seen PUBLISHED and the check printed NOT RUN with
     nothing to show for the run. It now watches until the sweep has been both emitted and
     published, or WINDOW_MS elapses — so a slow board costs time, not a verdict. */
  const t0 = Date.now(); let settled = false;
  while(Date.now() - t0 < WINDOW_MS){
    await sleep(500);
    const s = await H.evalJS(`(()=>{const g=window.__st.game;
      let i=-1;for(let k=g.events.length-1;k>=${before};k--)if(g.events[k].t==='tradewind'){i=k;break;}
      return JSON.stringify({i,pushed:window.__st.evPushed,n:g.events.length})})()`);
    if(typeof s !== 'string') continue;
    const v = JSON.parse(s);
    if(v.i >= 0 && v.pushed > v.i){ settled = true; break; }
  }
  await sleep(400);                     // let a few more frames land past the publish
  await H.evalJS(`window.__run=false;1`);

  const P     = JSON.parse(await H.evalJS(`JSON.stringify(window.__P)`));
  const kinds = JSON.parse(await H.evalJS(`JSON.stringify(window.__st.game.events.map(e=>e.t))`));
  if(OUT) fs.writeFileSync(OUT, JSON.stringify({ pick, before, settled, kinds, P }));

  const twIdx = kinds.map((t, i) => [t, i]).filter(([t, i]) => t === 'tradewind' && i >= before).map(([, i]) => i).pop();
  if(twIdx == null) NOTRUN('the posed storm emitted no `tradewind` — nothing was swept. Events after the push: ' + kinds.slice(before).join(','));

  const at    = pred => { for(const p of P) if(pred(p)) return p[0]; return null; };
  const lagFor = i => { const emit = at(p => p[1] > i), pub = at(p => p[2] > i);
                        return (emit == null || pub == null) ? null : { emit, pub, lag: +(pub - emit).toFixed(0) }; };
  const tw = lagFor(twIdx);

  console.log(`event #${twIdx} = tradewind (the rim sweep)  emitted at ${tw && tw.emit}ms, published at ${tw && tw.pub}ms`);
  console.log('CONTROL — the same measurement for every other event of this storm:');
  let controls = 0;
  for(let i = before; i < kinds.length; i++){
    const L = lagFor(i);
    if(i !== twIdx && L){ console.log(`   #${i} ${kinds[i].padEnd(14)} publish lag ${L.lag}ms`); controls++; }
  }
  if(!tw) NOTRUN(`never saw the sweep published inside the ${WINDOW_MS}ms window (settled=${settled}). Use a FRESH room, or raise W9_WINDOW_MS.`);
  if(!controls) NOTRUN('no control events were measurable — the instrument has not shown it can print a small number, so its big number means nothing yet');

  console.log(`\nSWEEP PUBLISH LAG = ${tw.lag}ms   (budget ${BUDGET_MS}ms)`);
  if(tw.lag > BUDGET_MS){
    console.log(`RED — the host held the swept-storm events for ${tw.lag}ms before putting them on the wire.`);
    console.log('      Every guest sat on a frozen board for that whole window, and it grows with the');
    console.log("      host's own animation. Publish before you ride: src/ui/flow.js publishNow().");
    process.exit(1);
  }
  console.log('GREEN — the sweep reached the wire within budget.');
  process.exit(0);
})().catch(e => { console.error('NOT RUN — probe error:', e.message); process.exit(2); });
