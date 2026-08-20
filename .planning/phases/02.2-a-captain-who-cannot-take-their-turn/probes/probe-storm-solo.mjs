/* D7, the other half — photograph the STORM camera, in solo, red-proofed.
 *
 * The storm camera has the same history as the battle camera: 02.1-01 fixed it by the same one
 * change and named it "correct by the same mechanism, not demonstrated". Nobody has photographed it.
 *
 * DRIVING-THE-GAME.md §5e gives the recipe and, more usefully, the TRAP:
 *
 *   "The first storm check written for this section PASSED WITHOUT PROVING ANYTHING: it set
 *    cfg.storm = 1, saw stormNow === true, and reported success — but stormNow was ALREADY true
 *    before the injection. It could not have failed. Force the negative first (cfg.storm = 0, wait
 *    for stormNow === false), THEN inject."
 *
 * So this probe establishes the known-negative before it injects. It is the third instrument in one
 * night to need that discipline, after offsetParent-on-a-fixed-element and polling-against-a-driver.
 *
 * Two things §5e warns will look like breakage and are not: the storm rolls at a ROUND BOUNDARY, so
 * nothing happens until the next round; and rollStorm refuses a third consecutive storm
 * (stormStreak >= 2). Solo only — injection is forbidden in multiplayer.
 */
import * as R from "../../../../4/scripts/mp_rig.mjs";
import fs from "node:fs";

const PORT = 8747;
const DBG = 9581;
const out = { when: "storm-solo", checks: [] };
const chk = (n, p, d) => { out.checks.push({ name: n, pass: p, detail: d }); console.log(p ? "  PASS" : "  FAIL", n, "—", d); };

const STORM = `JSON.stringify((()=>{
  const st=(()=>{try{return __pp_app_state_debug()}catch(e){return{}}})();
  const g=st.game||{};
  const vis=sel=>{const e=document.querySelector(sel); if(!e)return null;
    const cs=getComputedStyle(e), r=e.getBoundingClientRect();
    return {w:Math.round(r.width),h:Math.round(r.height),
            shown:r.width>0&&r.height>0&&cs.display!=='none'&&cs.visibility!=='hidden'&&parseFloat(cs.opacity||'1')>0.01};};
  const svg=document.querySelector('#boardwrap svg');
  return {round:g.round, stormNow:!!g.stormNow, stormNext:!!g.stormNext, cfgStorm:g.cfg?g.cfg.storm:null,
          storming:!!document.querySelector('#boardwrap.storming'),
          overlay:vis('#stormOverlay'),
          rain:document.querySelectorAll('#stormOverlay .rlayer').length,
          pill:(()=>{const p=document.getElementById('pp4Pill');return p?p.textContent.trim().slice(0,40):null})(),
          viewBox:svg?svg.getAttribute('viewBox'):null};})())`;

try {
  const base = R.serve(PORT);
  await R.sleep(1500);
  R.launch(DBG, "/tmp/pp4-storm", { headless: true });
  const C = await R.attach(DBG);

  await C.goto(base);
  await C.waitFor(`document.readyState==='complete'`, 30000, "load");
  await C.ev(`localStorage.clear();localStorage.setItem('pp_id','storm-'+Math.floor(Math.random()*1e9));true`);
  await C.goto(base);
  await C.waitFor(`document.readyState==='complete'`, 30000, "reload");
  await R.sleep(1200);
  await C.waitFor(`(()=>{const e=document.getElementById('choiceSolo');return !!(e&&e.offsetParent)})()`, 20000, "Solo");
  await C.ev(`document.getElementById('choiceSolo').click();true`);
  await R.sleep(900);
  if (await C.ev(`(()=>{const m=document.getElementById('nameModalInput');return !!(m&&m.offsetParent)})()`)) {
    await C.ev(`document.getElementById('nameModalInput').value='Claude';document.getElementById('btnNameConfirm').click();true`);
    await R.sleep(1200);
  }
  await C.waitFor(`(()=>{try{return !!__pp_app_state_debug().game}catch(e){return false}})()`, 30000, "game");
  console.log("solo game up");
  await R.driver(C, base);                    // the voyage must keep turning: storms roll at round boundaries

  const setStorm = v => C.ev(`(async()=>{try{const st=(await import('${base}src/state/index.js')).appState;
    st.game.cfg.storm=${v};return st.game.cfg.storm}catch(e){return 'ERR '+e.message}})()`);

  // ---- RED-PROOF: establish the known-negative BEFORE injecting (§5e's own warning) ----
  console.log("cfg.storm ->", await setStorm(0));
  let negative = null;
  for (let i = 0; i < 60; i++) {               // bounded
    const s = JSON.parse(await C.ev(STORM));
    if (s.round >= 1 && !s.stormNow) { negative = s; break; }
    await R.sleep(3000);
  }
  chk("RED-PROOF: a known-negative reached first — no storm with cfg.storm = 0",
      !!negative,
      negative ? `round ${negative.round}: stormNow=false, storming=${negative.storming}, overlay shown=${negative.overlay ? negative.overlay.shown : null}`
               : "never observed a storm-free round — the check below would prove nothing");
  if (negative) await C.shot("storm-0-calm.png");

  // ---- inject ----
  console.log("cfg.storm ->", await setStorm(1));
  let stormy = null;
  for (let i = 0; i < 80; i++) {               // bounded — storms roll at a ROUND boundary
    const s = JSON.parse(await C.ev(STORM));
    if (s.stormNow) { stormy = s; break; }
    if (i % 10 === 0) console.log(`  ...round ${s.round}, stormNow=${s.stormNow}, next=${s.stormNext}`);
    await R.sleep(3000);
  }
  chk("D7: a storm ARRIVES after the injection",
      !!stormy,
      stormy ? `round ${stormy.round}: stormNow=true, storming=${stormy.storming}, rain layers=${stormy.rain}, pill="${stormy.pill}"`
             : "no storm within the bounded wait (rollStorm refuses a third consecutive storm — §5e)");

  if (stormy) {
    await C.shot("storm-1-arrived.png");
    // let the camera settle, then photograph the framing
    await R.sleep(3000);
    const framed = JSON.parse(await C.ev(STORM));
    await C.shot("storm-2-camera.png");
    fs.writeFileSync(`${R.SHOTS}/storm-frames.json`, JSON.stringify({ negative, stormy, framed }, null, 1));
    chk("D7: the storm is DRAWN — overlay painted and the board marked storming",
        !!(framed.storming && framed.overlay && framed.overlay.shown && framed.rain > 0),
        `storming=${framed.storming} overlay=${JSON.stringify(framed.overlay)} rain layers=${framed.rain}`);
    chk("D7: the storm CAMERA moved — viewBox differs from the calm frame",
        !!(negative && framed.viewBox && negative.viewBox && framed.viewBox !== negative.viewBox),
        `calm viewBox="${negative && negative.viewBox}" vs storm viewBox="${framed.viewBox}"`);
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
