/* Defect A — reproduce the ONE defect that survived, by replaying what actually happened.
 *
 * Live, in Wyatt's room BVUR: a prompt for seat 1 sat in rooms/<C>/prompt while the guest showed no
 * message, no buttons and no sail cells. One watchPrompt() call from the console rendered it
 * instantly and the queued turn played out. The host had been waiting on a captain who was never
 * asked, with the turn clock off, so nothing could break the deadlock.
 *
 * Three reproductions have already FAILED, so the obvious framings are wrong:
 *   1. same-browser reload with a prompt outstanding      -> rendered fine
 *   2. fresh browser reclaiming the seat by pp_id         -> rendered fine
 *   3. same, with a battle call outstanding               -> rendered fine
 *
 * The untested difference, and the one thing the live session did that none of those did: the
 * previous browser was KILLED — SIGKILL, mid-voyage, while still holding the seat — so the room
 * kept a live client entry for a browser that no longer existed. Then a NEW browser claimed the
 * same pp_id. That is what this replays.
 *
 * Candidate mechanism if it reproduces (orchestrator.js:1295):
 *     if(!p || p.seat !== appState.mySeat){ panel(""); ... return; }
 * A guest attaching that watcher before its seat is assigned discards the outstanding prompt, and a
 * Firebase `value` watcher never re-fires without a CHANGE — so it is never offered again.
 *
 * Do not fix anything from this file. Its only job is to make the failure summonable.
 */
import * as R from "../../../../4/scripts/mp_rig.mjs";
import { execSync } from "node:child_process";
import fs from "node:fs";

const PORT = 8719;
const H_DBG = 9561, G1_DBG = 9562, G2_DBG = 9563;
const out = { when: "A", checks: [] };
const chk = (n, p, d) => { out.checks.push({ name: n, pass: p, detail: d }); console.log(p ? "  PASS" : "  FAIL", n, "—", d); };

const wireProbe = base => `(async()=>{try{
  const st=(await import('${base}src/state/index.js')).appState;
  const s=await st.db.ref('rooms/'+st.room+'/prompt').once('value');const p=s.val();
  return JSON.stringify({promptSeat:p?p.seat:null,promptId:p?p.id:null,promptKind:p?p.kind:null,
    promptMsg:p?String(p.msg||'').replace(/<[^>]*>/g,'').slice(0,50):null,
    promptBattle:p?!!p.battle:false, promptFlip:p?!!p.flip:false,
    mySeat:st.mySeat,room:st.room});}catch(e){return 'ERR '+e.message}})()`;

/* WHAT "RENDERED" MEANS DEPENDS ON THE PROMPT KIND, and getting this wrong produced a false
 * reproduction on the first run of this probe. A kind:"ask" prompt paints buttons in #actionPanel.
 * A kind:"pick" prompt — the sail window, flow.js:537 — paints .sailCell rects on the BOARD and
 * legitimately leaves the panel's button row empty (orchestrator.js:1372). Checking apBtns alone
 * therefore reports a perfectly rendered sail prompt as unrendered. Ask what THIS kind draws. */
const RENDERED = `JSON.stringify((()=>{
  const ap=document.getElementById('actionPanel');
  const btns=ap?[...ap.querySelectorAll('.apBtns .apBtn')]:[];
  return {apMsg:ap&&ap.querySelector('.apMsg')?ap.querySelector('.apMsg').textContent.trim().slice(0,60):null,
          apBtns:btns.length,
          sailCells:document.querySelectorAll('.sailCell').length,
          btlBtns:document.querySelectorAll('.btlBtn').length,
          coinArmed:(()=>{const c=document.getElementById('flipCoinWrap');return !!(c&&c.classList.contains('active'))})()};})())`;
const anythingDrawn = r => (r.apBtns > 0) || !!r.apMsg || (r.sailCells > 0) || (r.btlBtns > 0) || r.coinArmed;

try {
  const base = R.serve(PORT);
  await R.sleep(1500);
  R.launch(H_DBG, "/tmp/pp4-a-host", { headless: true });
  R.launch(G1_DBG, "/tmp/pp4-a-g1", { headless: true });
  const H = await R.attach(H_DBG), G1 = await R.attach(G1_DBG);

  const code = await R.makeHost(H, base, "Wyargh");
  console.log("room:", code);
  await R.makeGuest(G1, base, code, "Claude");
  const ppid = await G1.ev(`localStorage.getItem('pp_id')`);
  console.log("guest pp_id:", ppid);

  await H.waitFor(`(()=>{const b=document.getElementById('btnStart');return !!(b&&b.offsetParent)})()`, 20000, "Start");
  await H.ev(`document.getElementById('btnStart').click();true`);
  await R.sleep(800);
  if (await H.ev(`(()=>{const b=document.getElementById('btnConfirmStart');return !!(b&&b.offsetParent)})()`))
    await H.ev(`document.getElementById('btnConfirmStart').click();true`);
  await R.sleep(2500);

  await R.driver(H, base); await R.driver(G1, base);      // BOTH seats — a stalled table proves nothing
  for (let i = 0; i < 40; i++) {                          // bounded: get into the voyage proper
    const r = await R.ribbonReport(G1);
    if ((r.round || 0) >= 2) { console.log(`voyage at round ${r.round}, ${r.events} events`); break; }
    await R.sleep(3000);
  }

  // KEEP THE GUEST PLAYING while hunting for the kind we want. Turning the driver off first
  // deadlocks the hunt: the guest stops sailing, so the voyage never reaches a battle or a trade,
  // so no kind:"ask" prompt is ever produced and the probe times out having tested nothing.
  // Poll fast instead and kill the browser the instant the wanted prompt appears.
  //
  // WAIT FOR kind:"ask" SPECIFICALLY. The two kinds behave differently after a kill+reclaim, which
  // is the finding: a kind:"pick" sail window came back correctly (18 .sailCell rects drawn), while
  // a kind:"ask" battle defence drew nothing at all. Taking whichever prompt happens to be up makes
  // the probe flap between PASS and FAIL for reasons that have nothing to do with the code.
  const WANT_KIND = process.argv[2] || "ask";
  let wire = null;
  for (let i = 0; i < 900; i++) {                         // bounded, ~5min at 330ms
    const w = JSON.parse(await G1.ev(wireProbe(base)));
    const kindOk = WANT_KIND === "any" ? true
      : WANT_KIND === "battle" ? (w.promptBattle === true)     // ask + battle + flip: renderBattleFromSnap
      : w.promptKind === WANT_KIND;
    if (w.promptSeat === w.mySeat && kindOk) { wire = w; break; }
    await R.sleep(330);
  }
  if (!wire) throw new Error(`no kind="${WANT_KIND}" prompt for the guest seat within the bounded wait`);
  console.log("outstanding for the guest:", JSON.stringify(wire));

  // ---- THE DIFFERENCE: kill the browser outright while it still holds the seat ----
  console.log("SIGKILLing the guest browser mid-prompt (not a reload)");
  try { execSync(`pkill -9 -f "remote-debugging-port=${G1_DBG}"`, { stdio: "ignore" }); } catch {}
  await R.sleep(6000);                                    // let the room keep its stale client a while

  // ---- a NEW browser claims the same identity ----
  R.launch(G2_DBG, "/tmp/pp4-a-g2", { headless: true });
  const G2 = await R.attach(G2_DBG);
  await G2.goto(base);
  await G2.waitFor(`document.readyState==='complete'`, 30000, "G2 load");
  await G2.ev(`localStorage.clear();localStorage.setItem('pp_id',${JSON.stringify(ppid)});true`);
  await G2.goto(base);
  await G2.waitFor(`document.readyState==='complete'`, 30000, "G2 reload");
  await R.sleep(2000);
  await G2.ev(`document.getElementById('choiceJoin').click();true`); await R.sleep(900);
  if (await G2.ev(`(()=>{const m=document.getElementById('nameModalInput');return !!(m&&m.offsetParent)})()`)) {
    await G2.ev(`document.getElementById('nameModalInput').value='Claude';document.getElementById('btnNameConfirm').click();true`);
    await R.sleep(900);
  }
  await G2.waitFor(`(()=>{const j=document.getElementById('joinCode');return !!(j&&j.offsetParent)})()`, 25000, "G2 join form");
  await G2.ev(`document.getElementById('joinCode').value=${JSON.stringify(code)};
               document.getElementById('joinName').value='Claude';document.getElementById('btnJoin').click();true`);
  console.log("replacement guest joined; watching for 40s");

  /* SEPARATE "never delivered" FROM "delivered and discarded". Attach an INDEPENDENT listener on
   * the same node and log every fire with appState.mySeat as it was at that instant. If Firebase
   * delivers and the panel stays empty, the fault is in watchPrompt's guard or in panel(); if it
   * never delivers, the fault is that the watcher was never attached at all. */
  await R.sleep(1500);
  console.log("spy listener:", await G2.ev(`(async()=>{try{
    const st=(await import('${base}src/state/index.js')).appState;
    if(!st.db||!st.room) return "no db/room";
    window.__pfires=[];
    st.db.ref('rooms/'+st.room+'/prompt').on('value',s=>{const p=s.val();
      window.__pfires.push({t:Date.now(),seat:p?p.seat:null,id:p?p.id:null,mySeat:st.mySeat,
        started:!!st.gameStarted,live:!!st.live,hasGame:!!st.game,
        panelInDom:!!document.getElementById('actionPanel')});});
    return "attached";}catch(e){return 'ERR '+e.message}})()`));

  // sample for a while — the prompt may land late rather than never
  let rendered = null;
  for (let i = 0; i < 20; i++) {                          // bounded ~40s
    await R.sleep(2000);
    const r = JSON.parse(await G2.ev(RENDERED));
    if (anythingDrawn(r)) { rendered = { at: i * 2, ...r }; break; }
  }
  const after = JSON.parse(await G2.ev(wireProbe(base)));
  const draw = JSON.parse(await G2.ev(RENDERED));
  const rep = await R.ribbonReport(G2);
  await G2.shot("A-replacement-guest.png"); await H.shot("A-host.png");

  console.log("wire after reclaim:", JSON.stringify(after));
  console.log("what the guest DREW:", JSON.stringify(draw), `| seat=${rep.seat} round=${rep.round}`);
  console.log("independent listener fires:", await G2.ev(`JSON.stringify(window.__pfires||[])`));
  console.log("client state:", await G2.ev(`(async()=>{try{const st=(await import('${base}src/state/index.js')).appState;
    return JSON.stringify({mySeat:st.mySeat,isHost:!!st.isHost,gameStarted:!!st.gameStarted,live:!!st.live,
      hasGame:!!st.game,evIdx:st.evIdx,replaying:!!st.replaying,
      panelInDom:!!document.getElementById('actionPanel'),
      stageBuilt:!!document.getElementById('pp4Ribbon')})}catch(e){return 'ERR'}})()`));

  chk("A the replacement guest renders the prompt that was outstanding when it arrived",
      !!rendered,
      rendered ? `rendered ~${rendered.at}s after joining: ${JSON.stringify(rendered)}`
               : `REPRODUCED: kind="${after.promptKind}" seat=${after.promptSeat} mySeat=${after.mySeat} still on the wire; guest drew NOTHING (${JSON.stringify(draw)}) after 40s`);

  if (!rendered) {   // confirm the live remedy also works here, which pins the mechanism
    const fix = await G2.ev(`(async()=>{try{const o=await import('${base}src/orchestrator.js');
      if(typeof o.watchPrompt==='function'){o.watchPrompt();return 'watchPrompt re-attached'}return 'not exported'}catch(e){return 'ERR '+e.message}})()`);
    await R.sleep(4000);
    const r2 = JSON.parse(await G2.ev(RENDERED));
    await G2.shot("A-after-rearm.png");
    chk("A(ii) re-attaching watchPrompt renders it — same remedy that worked live",
        anythingDrawn(r2), `${fix} -> ${JSON.stringify(r2)}`);
  }

  fs.writeFileSync(`${R.SHOTS}/A-result.json`, JSON.stringify(out, null, 1));
  console.log("\nRESULTS_JSON " + JSON.stringify(out));
} catch (e) {
  console.error("PROBE FAILED:", e.message);
  console.log("\nRESULTS_JSON " + JSON.stringify(out));
} finally {
  R.killAll();
  console.log("killed all chromes and servers");
}
process.exit(0);
