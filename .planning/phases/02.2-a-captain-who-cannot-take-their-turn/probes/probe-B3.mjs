/* Defect B, resolved — ask for something the HOST is actually holding.
 *
 * flow.js:1579 hails `g.holdersOf(offer.want, p)` filtered by `worthReAsking`. So a captain is only
 * asked about a crate they are CARRYING. Probe B2's guest asked for Toasty Wheat; if the host was
 * not holding wheat, the host was correctly never asked, and "the host painted nothing" is the
 * system working exactly as TRADE-SYSTEM.md I1 intends ("the announcement IS the spam").
 *
 * This makes the test decisive instead of ambiguous:
 *   1. read the host's hold from the host's own engine
 *   2. drive the guest to want SPECIFICALLY one of those crates
 *   3. record every row the host paints, with a MutationObserver that a 700ms driver cannot outrun
 *   4. ALSO log holdersOf / worthReAsking on the host, so a filtered-out host is visible as filtered
 *      rather than inferred from silence
 *
 * If the host is a holder, is not filtered, and still paints nothing -> real bug.
 * If the host is filtered, or not a holder -> correct behaviour, and B is not a defect.
 */
import * as R from "../../../../4/scripts/mp_rig.mjs";
import fs from "node:fs";
const PORT = 8707;
const H_DBG = 9551, G_DBG = 9552;
const out = { when: "B3", checks: [] };
const chk = (n, p, d) => { out.checks.push({ name: n, pass: p, detail: d }); console.log(p ? "  PASS" : "  FAIL", n, "—", d); };

const RECORDER = `(()=>{
  if(window.__rows) return "already";
  window.__rows=[]; const ap=document.getElementById("actionPanel"); if(!ap) return "no panel";
  const snap=()=>{const b=ap.querySelector(".apBtns"),m=ap.querySelector(".apMsg");
    const labels=b?[...b.querySelectorAll(".apBtn")].map(x=>x.textContent.trim().slice(0,26)):[];
    if(!labels.length)return;
    const rec={t:Date.now(),msg:m?m.textContent.trim().slice(0,90):"",labels};
    const last=window.__rows[window.__rows.length-1];
    if(last&&last.msg===rec.msg&&JSON.stringify(last.labels)===JSON.stringify(rec.labels))return;
    window.__rows.push(rec); if(window.__rows.length>500)window.__rows.shift();};
  new MutationObserver(snap).observe(ap,{childList:true,subtree:true,characterData:true});
  window.__rowTimer=setInterval(snap,150); snap(); return "recording";})()`;

/* wrap the two engine calls that decide WHO is hailed — observation only, no behaviour change */
const SPY = base => `(async()=>{
  const st=(await import('${base}src/state/index.js')).appState;
  const g=st.game; if(!g) return "no game";
  if(window.__spy) return "already";
  window.__spy={holders:[],reask:[]};
  const oh=g.holdersOf.bind(g);
  g.holdersOf=(ing,p)=>{const r=oh(ing,p);
    window.__spy.holders.push({t:Date.now(),ing:String(ing),asker:p&&p.idx,
      holders:(r||[]).map(x=>({idx:x.idx,strategy:x.strategy}))}); return r;};
  if(typeof g.worthReAsking==="function"){
    const ow=g.worthReAsking.bind(g);
    g.worthReAsking=(p,q,ing,offer)=>{const v=ow(p,q,ing,offer);
      window.__spy.reask.push({t:Date.now(),asker:p&&p.idx,asked:q&&q.idx,
        strategy:q&&q.strategy,ing:String(ing),worth:!!v}); return v;};
  }
  return "spying";})()`;

const PANEL = `JSON.stringify((()=>{const ap=document.getElementById('actionPanel');
  const b=ap?[...ap.querySelectorAll('.apBtns .apBtn')]:[];
  return {msg:ap&&ap.querySelector('.apMsg')?ap.querySelector('.apMsg').textContent.trim().slice(0,70):null,
          labels:b.map(x=>x.textContent.trim().slice(0,26)),
          prim:b.map(x=>x.classList.contains('primary')),
          dis:b.map(x=>x.getAttribute('aria-disabled')==='true'||x.classList.contains('apDis'))}})())`;

const isStepper = l => /^[+\-−–—]\s*\d|^[+\-−–—]$/.test(l.trim());
const isBack = l => /back|←|‹/i.test(l);
const isCommit = l => /offer it|ask it|send|confirm|aye|done|yes/i.test(l);
const isAnswer = l => /accept|deny|summat/i.test(l);

try {
  const base = R.serve(PORT);
  await R.sleep(1500);
  R.launch(H_DBG, "/tmp/pp4-b3-host", { headless: true });
  R.launch(G_DBG, "/tmp/pp4-b3-guest", { headless: true });
  const H = await R.attach(H_DBG), G = await R.attach(G_DBG);

  const code = await R.makeHost(H, base, "Wyargh");
  console.log("room:", code);
  await R.makeGuest(G, base, code, "Claude");
  await H.waitFor(`(()=>{const b=document.getElementById('btnStart');return !!(b&&b.offsetParent)})()`, 20000, "Start");
  await H.ev(`document.getElementById('btnStart').click();true`);
  await R.sleep(800);
  if (await H.ev(`(()=>{const b=document.getElementById('btnConfirmStart');return !!(b&&b.offsetParent)})()`))
    await H.ev(`document.getElementById('btnConfirmStart').click();true`);
  await R.sleep(2500);

  console.log("recorder:", await H.ev(RECORDER));
  console.log("spy:", await H.ev(SPY(base)));
  // BOTH seats must play. The previous run installed only the host driver and the table sat at
  // round 0 for six minutes — a crew game cannot advance past a human seat that never answers,
  // which is the exact stall this session inflicted on Wyatt's own game earlier tonight.
  await R.driver(H, base);
  await R.driver(G, base);

  // let the host accumulate cargo — holdersOf() only returns captains CARRYING the crate, so a
  // host with an empty hold is correctly never hailed and the test would prove nothing.
  // Injection is ruled out here: DRIVING-THE-GAME.md 5e says mutating the host in multiplayer
  // desyncs the broadcast against the dlog. So it has to be earned by play.
  let hold = [];
  for (let i = 0; i < 130; i++) {                      // bounded, ~6.5 min
    const s = await H.ev(`(async()=>{try{const st=(await import('${base}src/state/index.js')).appState;
      const g=st.game,me=g.players[st.mySeat];
      return JSON.stringify({ing:(me.ing||[]).map(String),round:g.round,
        all:(g.players||[]).map(q=>(q.ing||[]).length)})}catch(e){return null}})()`);
    if (s) { const j = JSON.parse(s); hold = j.ing;
      if (i % 10 === 0) console.log(`  ...round ${j.round}, holds per seat ${JSON.stringify(j.all)}`);
      if (hold.length) { console.log(`host holds ${JSON.stringify(hold)} at round ${j.round}`); break; } }
    await R.sleep(3000);
  }
  if (!hold.length) throw new Error("host never picked up cargo within the bounded wait");
  const wantSet = new Set(hold.map(x => x.toLowerCase()));

  // take the guest's wheel back before hand-driving it into a trade
  console.log("guest driver off:", await R.driverOff(G));
  await R.sleep(1200);

  // guest opens a Trade and asks for something the HOST is carrying
  let opened = false;
  for (let i = 0; i < 60 && !opened; i++) {
    const s = JSON.parse(await G.ev(PANEL));
    const ti = s.labels.findIndex((l, k) => /trade/i.test(l) && !s.dis[k]);
    if (ti >= 0) { await G.ev(`[...document.querySelectorAll('#actionPanel .apBtns .apBtn')][${ti}].click();true`); opened = true; break; }
    const li = s.labels.findIndex((l, k) => !s.dis[k] && !isBack(l) && !isStepper(l));
    if (li >= 0) await G.ev(`[...document.querySelectorAll('#actionPanel .apBtns .apBtn')][${li}].click();true`);
    await R.sleep(2000);
  }
  if (!opened) throw new Error("guest never got a live Trade");

  let sentAt = 0, chose = null;
  for (let step = 0; step < 10 && !sentAt; step++) {
    await R.sleep(1700);
    const s = JSON.parse(await G.ev(PANEL));
    if (!s.labels.length) continue;
    let i = -1;
    if (/WANT/i.test(s.msg || "")) {                    // the crate step: pick one the host holds
      i = s.labels.findIndex((l, k) => !s.dis[k] && [...wantSet].some(w => l.toLowerCase().includes(w.toLowerCase())));
      if (i >= 0) chose = s.labels[i];
      if (i < 0) { console.log(`  host's crates ${JSON.stringify(hold)} not live in ${JSON.stringify(s.labels)}`); }
    }
    if (i < 0) i = s.labels.findIndex((l, k) => !s.dis[k] && isCommit(l));
    if (i < 0) i = s.labels.findIndex((l, k) => !s.dis[k] && s.prim[k] && !isStepper(l) && !isBack(l));
    if (i < 0) i = s.labels.findIndex((l, k) => !s.dis[k] && !isStepper(l) && !isBack(l));
    if (i < 0) continue;
    console.log(`  guest: "${s.msg}" -> ${s.labels[i]}`);
    await G.ev(`[...document.querySelectorAll('#actionPanel .apBtns .apBtn')][${i}].click();true`);
    if (isCommit(s.labels[i])) { sentAt = Date.now(); console.log("  OFFER SENT, wanting:", chose); }
  }
  if (!sentAt) throw new Error("guest never committed an offer");

  await R.sleep(40000);

  const rows = JSON.parse(await H.ev(`JSON.stringify(window.__rows||[])`));
  const spy = JSON.parse(await H.ev(`JSON.stringify(window.__spy||{holders:[],reask:[]})`));
  fs.writeFileSync(`${R.SHOTS}/B3-rows.json`, JSON.stringify(rows, null, 1));
  fs.writeFileSync(`${R.SHOTS}/B3-spy.json`, JSON.stringify(spy, null, 1));

  const after = rows.filter(r => r.t >= sentAt - 1500);
  const hit = after.find(r => r.labels.some(isAnswer));
  const hSeat = JSON.parse(await H.ev(`JSON.stringify((()=>{try{return {seat:__pp_app_state_debug().mySeat}}catch(e){return {seat:null}}})())`)).seat;

  const holderCalls = (spy.holders || []).filter(h => h.t >= sentAt - 8000);
  const wasHolder = holderCalls.some(h => (h.holders || []).some(x => x.idx === hSeat));
  const reaskForHost = (spy.reask || []).filter(r => r.asked === hSeat && r.t >= sentAt - 8000);

  console.log(`\nhost seat ${hSeat} | rows after offer: ${after.length}`);
  for (const r of after.slice(0, 10)) console.log(`   +${((r.t - sentAt) / 1000).toFixed(1)}s "${r.msg}" ${JSON.stringify(r.labels)}`);
  console.log("holdersOf calls near the offer:", JSON.stringify(holderCalls.slice(-3)));
  console.log("worthReAsking for the host:", JSON.stringify(reaskForHost));

  chk("the host was among the holders of the wanted crate", wasHolder,
      `wanted="${chose}" host hold=${JSON.stringify(hold)} | holdersOf saw host: ${wasHolder}`);
  if (wasHolder) {
    const filtered = reaskForHost.length > 0 && reaskForHost.every(r => r.worth === false);
    if (filtered) {
      chk("B is CORRECT BEHAVIOUR — the host was deliberately filtered by worthReAsking", true,
          `worthReAsking(host) returned false ${reaskForHost.length}x — TRADE-SYSTEM.md I1, no unearned noise`);
    } else {
      chk("B the host was hailed AND painted an answer prompt", !!hit,
          hit ? `+${((hit.t - sentAt) / 1000).toFixed(1)}s "${hit.msg}" ${JSON.stringify(hit.labels)}`
              : `REAL BUG: host holds the crate, was not filtered, painted 0 answer rows in 40s`);
    }
  }
  await H.shot("B3-host.png"); await G.shot("B3-guest.png");
  console.log("\nRESULTS_JSON " + JSON.stringify(out));
} catch (e) {
  console.error("PROBE FAILED:", e.message);
  console.log("\nRESULTS_JSON " + JSON.stringify(out));
} finally {
  R.killAll();
  console.log("killed all chromes and servers");
}
process.exit(0);
