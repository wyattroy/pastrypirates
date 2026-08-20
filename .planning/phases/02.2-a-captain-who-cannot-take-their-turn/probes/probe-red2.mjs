/* RED probe 2 — reproduce the TWO turn-blockers Wyatt actually hit, precisely.
 *
 * Probe 1 could not reproduce either, but neither of its attempts matched what happened:
 *   A. Wyatt's guest case was a FRESH BROWSER reclaiming the seat by pp_id (I swapped headless for
 *      a visible window mid-voyage), not a same-browser reload. Different code path: seat re-claim.
 *   B. Wyatt's host case needed an INCOMING TRADE OFFER from the guest. A bot-driven rig may never
 *      produce one, so probe 1 never tested it at all.
 *
 * Also re-measures the ribbon controls with the CORRECTED visibility predicate, and carries its own
 * red-proof: #pp4FF is display:none in a crew game by design (D-04), #pp4Menu is always shown — if
 * the predicate cannot tell those two apart it is not measuring visibility.
 */
import * as R from "../../../../4/scripts/mp_rig.mjs";
const PORT = 8641;                      // fresh port again (module cache, §1)
const H_DBG = 9511, G_DBG = 9512, G2_DBG = 9513;
const out = { when: "RED2", checks: [] };
const chk = (name, pass, detail) => { out.checks.push({ name, pass, detail }); console.log(pass ? "  PASS" : "  FAIL", name, "—", detail); };

try {
  const base = R.serve(PORT);
  console.log("serving", base);
  await R.sleep(1500);

  R.launch(H_DBG, "/tmp/pp4-r3-host", { headless: true });
  R.launch(G_DBG, "/tmp/pp4-r3-guest", { headless: true });
  const H = await R.attach(H_DBG), G = await R.attach(G_DBG);

  const code = await R.makeHost(H, base, "Wyargh");
  console.log("room:", code);
  await R.makeGuest(G, base, code, "Claude");

  await H.waitFor(`(()=>{const b=document.getElementById('btnStart');return !!(b&&b.offsetParent)})()`, 20000, "Start");
  await H.ev(`document.getElementById('btnStart').click();true`);
  await R.sleep(900);
  if (await H.ev(`(()=>{const b=document.getElementById('btnConfirmStart');return !!(b&&b.offsetParent)})()`))
    await H.ev(`document.getElementById('btnConfirmStart').click();true`);
  console.log("voyage started");
  await R.sleep(2500);

  // capture the guest's pp_id BEFORE anything else — defect A needs it
  const guestPpid = await G.ev(`localStorage.getItem('pp_id')`);
  console.log("guest pp_id:", guestPpid);

  await R.driver(H, base); await R.driver(G, base);
  for (let i = 0; i < 30; i++) {                    // bounded: get past the opening ceremony
    const r = await R.ribbonReport(G);
    if ((r.round || 0) >= 2) break;
    await R.sleep(3000);
  }

  /* ---------- the corrected UI comparison, with its own red-proof ---------- */
  console.log("\n--- ribbon controls, corrected predicate ---");
  const h = await R.ribbonReport(H), g = await R.ribbonReport(G);
  out.host = h; out.guest = g;
  await H.shot("red2-host.png"); await G.shot("red2-guest.png");

  chk("PREDICATE RED-PROOF: it can tell shown from hidden",
      h.menu?.shown === true && h.ff?.shown === false,
      `menu.shown=${h.menu?.shown} (expect true) | ff.shown=${h.ff?.shown} (expect false — no skip in a crew game, D-04)`);
  chk("C wind pill drawn on guest", !!g.pill?.shown,
      `host shown=${h.pill?.shown} rect=${JSON.stringify(h.pill?.rect)} pos=${h.pill?.pos} | guest shown=${g.pill?.shown} rect=${JSON.stringify(g.pill?.rect)} text="${g.pill?.text}"`);
  chk("D clock chip drawn on guest", !!g.clock?.shown, `host="${h.clock?.text}" guest="${g.clock?.text}" guest timerOff=${g.timerOff}`);
  chk("E chat chip drawn on guest", !!g.chat?.shown, `host shown=${h.chat?.shown} guest shown=${g.chat?.shown}`);

  /* ---------- DEFECT B: does the HOST see an incoming offer without a refresh? ---------- */
  console.log("\n--- defect B: host receives a trade offer from the guest ---");
  await R.driverOff(G);                              // drive the guest by hand into a trade
  let opened = false;
  for (let i = 0; i < 45 && !opened; i++) {           // bounded
    const s = JSON.parse(await G.ev(`JSON.stringify((()=>{const ap=document.getElementById('actionPanel');
      const b=ap?[...ap.querySelectorAll('.apBtns .apBtn')]:[];
      return {msg:ap&&ap.querySelector('.apMsg')?ap.querySelector('.apMsg').textContent.trim().slice(0,60):null,
              labels:b.map(x=>x.textContent.trim().slice(0,24)),
              dis:b.map(x=>x.getAttribute('aria-disabled')==='true'||x.classList.contains('apDis'))}})())`));
    const ti = s.labels.findIndex((l, k) => /trade/i.test(l) && !s.dis[k]);
    if (ti >= 0) {
      await G.ev(`[...document.querySelectorAll('#actionPanel .apBtns .apBtn')][${ti}].click();true`);
      opened = true; console.log("  guest opened a Trade"); break;
    }
    // otherwise answer whatever is up so the game keeps moving toward the guest's turn
    const li = s.labels.findIndex((l, k) => !s.dis[k] && !/back|←/i.test(l));
    if (li >= 0) await G.ev(`[...document.querySelectorAll('#actionPanel .apBtns .apBtn')][${li}].click();true`);
    await R.sleep(2000);
  }

  if (opened) {
    // walk the three-step trade machine (TRADE-SYSTEM.md §4): WANT -> GIVE -> coins -> commit
    for (let step = 0; step < 8; step++) {           // bounded
      await R.sleep(1600);
      const s = JSON.parse(await G.ev(`JSON.stringify((()=>{const ap=document.getElementById('actionPanel');
        const b=ap?[...ap.querySelectorAll('.apBtns .apBtn')]:[];
        return {msg:ap&&ap.querySelector('.apMsg')?ap.querySelector('.apMsg').textContent.trim().slice(0,60):null,
                labels:b.map(x=>x.textContent.trim().slice(0,24)),
                dis:b.map(x=>x.getAttribute('aria-disabled')==='true'||x.classList.contains('apDis'))}})())`));
      if (!s.labels.length) break;
      const i = s.labels.findIndex((l, k) => !s.dis[k] && !/back|←/i.test(l));
      if (i < 0) break;
      console.log(`  guest: "${s.msg}" -> ${s.labels[i]}`);
      await G.ev(`[...document.querySelectorAll('#actionPanel .apBtns .apBtn')][${i}].click();true`);
      if (/offer it|ask it|send/i.test(s.labels[i])) { console.log("  OFFER SENT"); break; }
    }

    // now: does the HOST get asked, with NO reload, within a generous bounded window?
    let hostAsked = null;
    for (let i = 0; i < 30; i++) {                   // bounded ~60s
      const hs = JSON.parse(await H.ev(`JSON.stringify((()=>{const ap=document.getElementById('actionPanel');
        const b=ap?[...ap.querySelectorAll('.apBtns .apBtn')]:[];
        return {msg:ap&&ap.querySelector('.apMsg')?ap.querySelector('.apMsg').textContent.trim().slice(0,90):null,
                labels:b.map(x=>x.textContent.trim().slice(0,22))}})())`));
      if (hs.labels.some(l => /accept|deny|summat/i.test(l))) { hostAsked = hs; break; }
      await R.sleep(2000);
    }
    await H.shot("red2-host-after-offer.png");
    chk("B host is asked about an incoming offer WITHOUT a refresh",
        !!hostAsked,
        hostAsked ? `host prompt: "${hostAsked.msg}" ${JSON.stringify(hostAsked.labels)}`
                  : "no Accept/Deny prompt appeared on the host within 60s of the offer being sent");
  } else {
    chk("B host is asked about an incoming offer WITHOUT a refresh", false,
        "INCONCLUSIVE — the guest never got a live Trade option within the bounded wait");
  }

  /* ---------- DEFECT A: a FRESH BROWSER reclaims the seat mid-voyage ---------- */
  console.log("\n--- defect A: fresh browser reclaims the seat (what actually happened) ---");
  await R.driver(H, base);                            // keep the host playing
  // wait until a prompt for the guest seat is genuinely outstanding
  let outstanding = null;
  for (let i = 0; i < 40; i++) {                      // bounded
    outstanding = await G.ev(`(async()=>{try{const st=(await import('${base}src/state/index.js')).appState;
      const s=await st.db.ref('rooms/'+st.room+'/prompt').once('value');const p=s.val();
      return p?JSON.stringify({seat:p.seat,id:p.id,msg:String(p.msg||'').slice(0,50)}):null}catch(e){return null}})()`);
    if (outstanding && JSON.parse(outstanding).seat === 1) break;
    await R.sleep(2000);
  }
  console.log("  outstanding:", outstanding);

  if (outstanding && JSON.parse(outstanding).seat === 1) {
    R.launch(G2_DBG, "/tmp/pp4-r3-guest2", { headless: true });
    const G2 = await R.attach(G2_DBG);
    await G2.goto(base);
    await G2.waitFor(`document.readyState==='complete'`, 30000, "G2 load");
    await G2.ev(`localStorage.clear();localStorage.setItem('pp_id',${JSON.stringify(guestPpid)});true`);
    await G2.goto(base);
    await G2.waitFor(`document.readyState==='complete'`, 30000, "G2 reload");
    await R.sleep(2000);
    // rejoin the same room with the same identity — the seat-reclaim path
    await G2.ev(`document.getElementById('choiceJoin').click();true`); await R.sleep(900);
    if (await G2.ev(`(()=>{const m=document.getElementById('nameModalInput');return !!(m&&m.offsetParent)})()`)) {
      await G2.ev(`document.getElementById('nameModalInput').value='Claude';document.getElementById('btnNameConfirm').click();true`);
      await R.sleep(900);
    }
    await G2.waitFor(`(()=>{const j=document.getElementById('joinCode');return !!(j&&j.offsetParent)})()`, 25000, "G2 join form");
    await G2.ev(`document.getElementById('joinCode').value=${JSON.stringify(code)};
                 document.getElementById('joinName').value='Claude';document.getElementById('btnJoin').click();true`);
    await R.sleep(8000);
    const a = await R.ribbonReport(G2);
    await G2.shot("red2-guest2-reclaimed.png");
    const still = await G2.ev(`(async()=>{try{const st=(await import('${base}src/state/index.js')).appState;
      const s=await st.db.ref('rooms/'+st.room+'/prompt').once('value');const p=s.val();
      return JSON.stringify({promptSeat:p?p.seat:null,mySeat:st.mySeat,room:st.room})}catch(e){return 'ERR'}})()`);
    chk("A fresh browser reclaiming a seat renders the outstanding prompt",
        (a.apBtns || 0) > 0 || !!a.apMsg,
        `after reclaim: apMsg=${JSON.stringify(a.apMsg)} apBtns=${a.apBtns} seat=${a.seat} | firebase ${still}`);
  } else {
    chk("A fresh browser reclaiming a seat renders the outstanding prompt", false,
        "INCONCLUSIVE — no prompt for the guest seat was outstanding within the bounded wait");
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
