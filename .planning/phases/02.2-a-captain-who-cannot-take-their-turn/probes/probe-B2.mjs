/* Defect B, third attempt — with an instrument that cannot be raced.
 *
 * Attempt 1 (probe 2): the guest never sent an offer (oscillated on the coin stepper). Invalid.
 * Attempt 2 (probe B): the offer sent, but the HOST DRIVER was answering prompts every 700ms while
 *   I polled every 2000ms — so "no Accept/Deny appeared" may only mean "answered before I looked".
 *   Racing my own observation. Also void: reloading the host returns it to the welcome screen, not
 *   into the game, so the reload half tested nothing.
 *
 * Here a MutationObserver on #actionPanel records EVERY button row the host ever paints, with a
 * timestamp — so a prompt answered in 700ms is still in the record. The host driver keeps running,
 * because the voyage has to progress for a trade to be possible at all. The question becomes exact:
 * after the guest's offer crosses the wire, does an Accept / Ask for summat else / Deny row EVER
 * appear in the host's paint history?
 */
import * as R from "../../../../4/scripts/mp_rig.mjs";
import fs from "node:fs";
const PORT = 8691;
const H_DBG = 9541, G_DBG = 9542;
const out = { when: "B2", checks: [] };
const chk = (n, p, d) => { out.checks.push({ name: n, pass: p, detail: d }); console.log(p ? "  PASS" : "  FAIL", n, "—", d); };

const RECORDER = `(()=>{
  if(window.__rows) return "already";
  window.__rows=[];
  const ap=document.getElementById("actionPanel");
  if(!ap) return "no actionPanel";
  const snap=()=>{
    const btns=ap.querySelector(".apBtns"); const msg=ap.querySelector(".apMsg");
    const labels=btns?[...btns.querySelectorAll(".apBtn")].map(b=>b.textContent.trim().slice(0,26)):[];
    if(!labels.length) return;
    const rec={t:Date.now(), msg:msg?msg.textContent.trim().slice(0,80):"", labels};
    const last=window.__rows[window.__rows.length-1];
    if(last&&last.msg===rec.msg&&JSON.stringify(last.labels)===JSON.stringify(rec.labels))return;
    window.__rows.push(rec);
    if(window.__rows.length>500)window.__rows.shift();
  };
  new MutationObserver(snap).observe(ap,{childList:true,subtree:true,characterData:true});
  window.__rowTimer=setInterval(snap,150);   // belt and braces: catch a row that never mutates again
  snap();
  return "recording";
})()`;

const PANEL = `JSON.stringify((()=>{const ap=document.getElementById('actionPanel');
  const b=ap?[...ap.querySelectorAll('.apBtns .apBtn')]:[];
  return {msg:ap&&ap.querySelector('.apMsg')?ap.querySelector('.apMsg').textContent.trim().slice(0,70):null,
          labels:b.map(x=>x.textContent.trim().slice(0,26)),
          prim:b.map(x=>x.classList.contains('primary')),
          dis:b.map(x=>x.getAttribute('aria-disabled')==='true'||x.classList.contains('apDis'))}})())`;

const isStepper = l => /^[+\-−–—]\s*\d|^[+\-−–—]$/.test(l.trim());
const isBack = l => /back|←|‹/i.test(l);
const isCommit = l => /offer it|ask it|send|confirm|aye|done|yes/i.test(l);
const isAnswerOffer = l => /accept|deny|summat/i.test(l);

try {
  const base = R.serve(PORT);
  await R.sleep(1500);
  R.launch(H_DBG, "/tmp/pp4-b2-host", { headless: true });
  R.launch(G_DBG, "/tmp/pp4-b2-guest", { headless: true });
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

  console.log("host recorder:", await H.ev(RECORDER));
  await R.driver(H, base);                                   // host plays; recorder sees everything

  // guest, hand-driven, to a real offer
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

  let sentAt = 0;
  for (let step = 0; step < 10 && !sentAt; step++) {
    await R.sleep(1700);
    const s = JSON.parse(await G.ev(PANEL));
    if (!s.labels.length) continue;
    let i = s.labels.findIndex((l, k) => !s.dis[k] && isCommit(l));
    if (i < 0) i = s.labels.findIndex((l, k) => !s.dis[k] && s.prim[k] && !isStepper(l) && !isBack(l));
    if (i < 0) i = s.labels.findIndex((l, k) => !s.dis[k] && !isStepper(l) && !isBack(l));
    if (i < 0) continue;
    console.log(`  guest: "${s.msg}" -> ${s.labels[i]}`);
    await G.ev(`[...document.querySelectorAll('#actionPanel .apBtns .apBtn')][${i}].click();true`);
    if (isCommit(s.labels[i])) { sentAt = Date.now(); console.log("  OFFER SENT at", sentAt); }
  }
  if (!sentAt) throw new Error("guest never reached a committing button");

  await R.sleep(45000);                                       // let the table react, bounded

  const rows = JSON.parse(await H.ev(`JSON.stringify(window.__rows||[])`));
  fs.writeFileSync(`${R.SHOTS}/B2-host-rows.json`, JSON.stringify(rows, null, 1));
  const after = rows.filter(r => r.t >= sentAt - 1500);
  const hit = after.find(r => r.labels.some(isAnswerOffer));

  console.log(`\nhost painted ${rows.length} rows total, ${after.length} after the offer`);
  console.log("rows after the offer:");
  for (const r of after.slice(0, 14)) console.log(`   +${((r.t - sentAt) / 1000).toFixed(1)}s  "${r.msg}"  ${JSON.stringify(r.labels)}`);

  chk("B the host is asked about an incoming offer (recorder, cannot be raced)",
      !!hit,
      hit ? `+${((hit.t - sentAt) / 1000).toFixed(1)}s after the offer: "${hit.msg}" ${JSON.stringify(hit.labels)}`
          : `no Accept / Ask for summat else / Deny row in ${after.length} host paints across 45s`);

  // did the offer actually reach the wire? separates "host ignored it" from "it was never sent"
  const wire = await G.ev(`(async()=>{try{const st=(await import('${base}src/state/index.js')).appState;
    const s=await st.db.ref('rooms/'+st.room).once('value');const v=s.val()||{};
    return JSON.stringify({hasPrompt:!!v.prompt, promptSeat:v.prompt?v.prompt.seat:null,
      promptMsg:v.prompt?String(v.prompt.msg||'').slice(0,60):null,
      response:v.response?JSON.stringify(v.response).slice(0,80):null})}catch(e){return 'ERR '+e.message}})()`);
  console.log("wire after offer:", wire);
  out.wire = wire;
  await H.shot("B2-host-final.png"); await G.shot("B2-guest-final.png");
  console.log("\nRESULTS_JSON " + JSON.stringify(out));
} catch (e) {
  console.error("PROBE FAILED:", e.message);
  console.log("\nRESULTS_JSON " + JSON.stringify(out));
} finally {
  R.killAll();
  console.log("killed all chromes and servers");
}
process.exit(0);
