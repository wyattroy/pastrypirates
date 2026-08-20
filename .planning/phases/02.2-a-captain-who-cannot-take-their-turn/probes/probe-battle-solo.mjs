/* D7 — photograph a battle at last, in SOLO, where injection is allowed.
 *
 * The battle camera has been "correct by mechanism, never photographed" for three phases running:
 * 02.1-01 fixed it by the same change that fixed the sail camera but could not reach a battle;
 * 02.1-03's drive saw none; Wyatt's own gate voyage saw none; and a dedicated five-minute hunt in
 * probe-A saw none either. Battles are rare enough that waiting for one is not a strategy.
 *
 * DRIVING-THE-GAME.md §5e's own table: injection is **safe in solo** ("nothing else is watching the
 * state") and **forbidden in multiplayer** (mutating the host desyncs the broadcast against the
 * dlog). So the two questions get split:
 *
 *   - does a battle RENDER at all — prompt, controls, and a camera that frames both boats?  <- here
 *   - is a battle prompt lost when a browser is killed mid-voyage?                          <- needs
 *     two browsers, and stays in probe-A
 *
 * Park a bot next to the human, take the turn, choose Attack, and photograph what happens.
 */
import * as R from "../../../../4/scripts/mp_rig.mjs";
import fs from "node:fs";

const PORT = 8733;
const DBG = 9571;
const out = { when: "battle-solo", checks: [] };
const chk = (n, p, d) => { out.checks.push({ name: n, pass: p, detail: d }); console.log(p ? "  PASS" : "  FAIL", n, "—", d); };

const SNAP = `JSON.stringify((()=>{
  const ap=document.getElementById('actionPanel');
  const btns=ap?[...ap.querySelectorAll('.apBtns .apBtn')]:[];
  const coin=document.getElementById('flipCoinWrap');
  const vis=el=>{if(!el)return null;const cs=getComputedStyle(el),r=el.getBoundingClientRect();
    return {w:Math.round(r.width),h:Math.round(r.height),
            shown:r.width>0&&r.height>0&&cs.display!=='none'&&cs.visibility!=='hidden'};};
  return {
    apMsg:ap&&ap.querySelector('.apMsg')?ap.querySelector('.apMsg').textContent.trim().slice(0,70):null,
    apBtns:btns.map(b=>b.textContent.trim().slice(0,22)),
    btlBtns:[...document.querySelectorAll('.btlBtn')].map(b=>b.textContent.trim().slice(0,20)),
    coinArmed:!!(coin&&coin.classList.contains('active')),
    coinBox:vis(coin),
    battleWrapShown:!!document.querySelector('.btlWrap,#btlWrap,.pp4Battle'),
    sailCells:document.querySelectorAll('.sailCell').length};})())`;

try {
  const base = R.serve(PORT);
  await R.sleep(1500);
  R.launch(DBG, "/tmp/pp4-battle", { headless: true });
  const C = await R.attach(DBG);

  // ---- solo game ----
  await C.goto(base);
  await C.waitFor(`document.readyState==='complete'`, 30000, "load");
  await C.ev(`localStorage.clear();localStorage.setItem('pp_id','battle-'+Math.floor(Math.random()*1e9));true`);
  await C.goto(base);
  await C.waitFor(`document.readyState==='complete'`, 30000, "reload");
  await R.sleep(1200);
  await C.waitFor(`(()=>{const e=document.getElementById('choiceSolo');return !!(e&&e.offsetParent)})()`, 20000, "Solo visible");
  await C.ev(`document.getElementById('choiceSolo').click();true`);
  await R.sleep(900);
  if (await C.ev(`(()=>{const m=document.getElementById('nameModalInput');return !!(m&&m.offsetParent)})()`)) {
    await C.ev(`document.getElementById('nameModalInput').value='Claude';document.getElementById('btnNameConfirm').click();true`);
    await R.sleep(1200);
  }
  await C.waitFor(`(()=>{try{return !!__pp_app_state_debug().game}catch(e){return false}})()`, 30000, "game exists");
  console.log("solo game up");

  // clear the opening ceremony so the action menu is reachable
  await R.driver(C, base);
  for (let i = 0; i < 40; i++) {                         // bounded — get into round 1+
    const st = JSON.parse(await C.ev(`JSON.stringify((()=>{const g=__pp_app_state_debug().game||{};
      return {round:g.round,seat:__pp_app_state_debug().mySeat}})())`));
    if ((st.round || 0) >= 1) { console.log(`round ${st.round}, seat ${st.seat}`); break; }
    await R.sleep(2000);
  }
  console.log("driver off:", await R.driverOff(C));
  await R.sleep(1500);

  // ---- §5e: park a bot right next to me. SOLO ONLY. ----
  const PARK = `(async()=>{try{
    const st=(await import('${base}src/state/index.js')).appState;
    const g=st.game, me=g.players[st.mySeat];
    const foe=g.players.find(p=>p!==me && g.inPlay(p));
    if(!foe) return "no foe in play";
    // adjacent square, clamped inside the grid
    const [x,y]=me.pos; const nx=Math.max(0,Math.min(g.cfg.grid-1,x+1));
    foe.pos=[nx,y];
    if(!foe.ing.length) foe.ing.push(g.ings[0]);        // something worth taking
    if(typeof g.liveRender==="function")g.liveRender();
    return JSON.stringify({me:me.pos,foe:foe.pos,foeIdx:foe.idx,foeIng:foe.ing.map(String),coins:me.coins});
  }catch(e){return 'ERR '+e.message}})()`;
  console.log("parked:", await C.ev(PARK));

  // ---- take the turn and choose Attack ----
  let attacked = false;
  for (let i = 0; i < 60 && !attacked; i++) {           // bounded
    await R.sleep(1500);
    // RE-PARK EVERY PASS. Parking once is not enough: the bot takes its own turn and sails away
    // before the human's action menu comes round, so "Attack" is never offered. The state has to
    // be true at the moment the menu is BUILT, not merely at some point earlier.
    await C.ev(PARK);
    const s = JSON.parse(await C.ev(SNAP));
    if (s.sailCells > 0) {                               // stay put so we keep our neighbour
      const stay = s.apBtns.findIndex(l => /stay put/i.test(l));
      if (stay >= 0) { await C.ev(`[...document.querySelectorAll('#actionPanel .apBtns .apBtn')][${stay}].click();true`); continue; }
    }
    const ai = s.apBtns.findIndex(l => /attack/i.test(l));
    if (ai >= 0) {
      console.log(`  choosing: ${s.apBtns[ai]}`);
      await C.ev(`[...document.querySelectorAll('#actionPanel .apBtns .apBtn')][${ai}].click();true`);
      attacked = true; break;
    }
    const li = s.apBtns.findIndex(l => !/back|←/i.test(l));
    if (li >= 0) await C.ev(`[...document.querySelectorAll('#actionPanel .apBtns .apBtn')][${li}].click();true`);
  }
  chk("a battle could be reached at all (solo, bot parked adjacent)", attacked,
      attacked ? "Attack chosen" : "no live Attack option appeared within the bounded wait");

  if (attacked) {
    // photograph the battle as it plays out
    const frames = [];
    for (let i = 0; i < 16; i++) {                       // bounded ~24s
      await R.sleep(1500);
      const s = JSON.parse(await C.ev(SNAP));
      frames.push({ at: i * 1.5, ...s });
      if (i % 4 === 0) await C.shot(`battle-${String(i).padStart(2, "0")}.png`);
      if (s.coinArmed) { await C.shot("battle-coin-armed.png"); console.log(`  coin armed at ${i * 1.5}s`); }
      if (s.btlBtns.length) { await C.shot("battle-buttons.png"); console.log(`  battle buttons at ${i * 1.5}s: ${JSON.stringify(s.btlBtns)}`); }
      if (s.coinArmed && s.btlBtns.length) break;
    }
    fs.writeFileSync(`${R.SHOTS}/battle-frames.json`, JSON.stringify(frames, null, 1));
    const drew = frames.some(f => f.coinArmed || f.btlBtns.length || /battle|attack|flip|defend/i.test(f.apMsg || ""));
    chk("D7: the battle RENDERS — a control or a battle message appeared",
        drew,
        JSON.stringify(frames.filter(f => f.coinArmed || f.btlBtns.length || f.apMsg).slice(0, 4)));
    await C.shot("battle-final.png");
  }
  console.log("\nRESULTS_JSON " + JSON.stringify(out));
} catch (e) {
  console.error("PROBE FAILED:", e.message);
  console.log("\nRESULTS_JSON " + JSON.stringify(out));
} finally {
  R.killAll();
  console.log("killed all chromes and servers");
}
process.exit(0);
