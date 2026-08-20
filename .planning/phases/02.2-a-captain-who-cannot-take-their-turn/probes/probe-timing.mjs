/* How LATE is a guest's ribbon, measured rather than argued.
 *
 * Wyatt's Safari host showed the clock chip, the chat bubble and the wind pill at DAY 1. The guest
 * beside it showed none of the three. At DAY 2 (probe 2) all three were present on both, with
 * identical rects — so nothing is permanently missing. The real question is the GAP: from the moment
 * each side's stage exists, how long until each control is on screen?
 *
 * Samples both tiers every 500ms from stage-build to a bounded horizon and reports, per control, the
 * first sample where it is painted — plus the event count at that moment, which is the thing a guest
 * is actually waiting for. CLAUDE.md rule 6: an interaction that differs in two places is a bug
 * unless Wyatt chose the exception. This measures the size of the difference so he can choose.
 */
import * as R from "../../../../4/scripts/mp_rig.mjs";
import fs from "node:fs";
const PORT = 8677;
const H_DBG = 9531, G_DBG = 9532;

const SAMPLE = `JSON.stringify((()=>{
  const st=(()=>{try{return __pp_app_state_debug()}catch(e){return{}}})();
  const g=st.game||{};
  const on=id=>{const e=document.getElementById(id); if(!e) return false;
    const cs=getComputedStyle(e), r=e.getBoundingClientRect();
    return r.width>0&&r.height>0&&cs.display!=='none'&&cs.visibility!=='hidden'&&parseFloat(cs.opacity||'1')>0.01;};
  return {t:Math.round(performance.now()), events:(g.events||[]).length, round:g.round,
          windNow:g.windNow||null, timerOff:st.timerOff, room:!!st.room,
          ribbon:on('pp4Ribbon'), pill:on('pp4Pill'), clock:on('pp4Clock'), chat:on('pp4Chat')};})())`;

const series = { host: [], guest: [] };

try {
  const base = R.serve(PORT);
  await R.sleep(1500);
  R.launch(H_DBG, "/tmp/pp4-t-host", { headless: true });
  R.launch(G_DBG, "/tmp/pp4-t-guest", { headless: true });
  const H = await R.attach(H_DBG), G = await R.attach(G_DBG);

  const code = await R.makeHost(H, base, "Wyargh");
  console.log("room:", code);
  await R.makeGuest(G, base, code, "Claude");
  await H.waitFor(`(()=>{const b=document.getElementById('btnStart');return !!(b&&b.offsetParent)})()`, 20000, "Start");
  await H.ev(`document.getElementById('btnStart').click();true`);
  await R.sleep(800);
  if (await H.ev(`(()=>{const b=document.getElementById('btnConfirmStart');return !!(b&&b.offsetParent)})()`))
    await H.ev(`document.getElementById('btnConfirmStart').click();true`);
  const t0 = Date.now();
  console.log("voyage started — sampling both tiers");

  await R.driver(H, base); await R.driver(G, base);

  for (let i = 0; i < 160; i++) {                       // bounded: ~80s at 500ms
    const [h, g] = await Promise.all([H.ev(SAMPLE), G.ev(SAMPLE)]);
    const ms = Date.now() - t0;
    series.host.push({ ms, ...JSON.parse(h) });
    series.guest.push({ ms, ...JSON.parse(g) });
    const last = series.guest[series.guest.length - 1];
    if (last.pill && last.clock && last.chat && last.round >= 2) break;
    await R.sleep(500);
  }

  const firstTrue = (arr, key) => { const r = arr.find(s => s[key]); return r ? r : null; };
  console.log("\n--- first moment each control is PAINTED (ms after the voyage started) ---");
  console.log("control    | host                              | guest");
  for (const key of ["ribbon", "clock", "chat", "pill"]) {
    const h = firstTrue(series.host, key), g = firstTrue(series.guest, key);
    const f = r => r ? `${String(r.ms).padStart(6)}ms  ev=${String(r.events).padStart(3)} round=${r.round}` : "        never in window";
    const gap = (h && g) ? `   gap ${g.ms - h.ms}ms` : "";
    console.log(`${key.padEnd(10)} | ${f(h).padEnd(32)} | ${f(g)}${gap}`);
  }
  const gLast = series.guest[series.guest.length - 1], hLast = series.host[series.host.length - 1];
  console.log(`\nfinal: host pill=${hLast.pill} clock=${hLast.clock} chat=${hLast.chat} | guest pill=${gLast.pill} clock=${gLast.clock} chat=${gLast.chat}`);
  console.log(`guest windNow first non-null: ${(series.guest.find(s => s.windNow) || {}).ms ?? "never"}ms`);
  console.log(`guest timerOff first true:    ${(series.guest.find(s => s.timerOff) || {}).ms ?? "never"}ms`);
  fs.writeFileSync(`${R.SHOTS}/timing-series.json`, JSON.stringify(series, null, 1));
  await H.shot("timing-host-final.png"); await G.shot("timing-guest-final.png");
} catch (e) {
  console.error("PROBE FAILED:", e.message);
} finally {
  R.killAll();
  console.log("killed all chromes and servers");
}
process.exit(0);
