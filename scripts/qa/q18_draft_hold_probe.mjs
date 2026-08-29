/* Q-18 — HOW LONG AFTER THE HOST DOES THE GUEST SEE THE RECIPE-DRAFT LINE?
 *
 *   node scripts/qa/q18_draft_hold_probe.mjs      prints the gap; exit 1 if the guest lags >250ms
 *
 * WHY THIS ONE MOMENT. CEO Review 24 found that the first cut of Q-18 held the guest's screen for
 * the FULL grace period at the start of every single crew game — the ordering fix manufacturing a
 * guaranteed divergence. The mechanism: `events.length-1` is -1 before the engine has produced
 * anything, `-1 != null` so it went out as a serial, and the guest's own frontier was still
 * undefined, which made the wait guard true regardless of the value. The recipe draft broadcasts
 * its line exactly there, before the round-1 `newround` event exists.
 *
 * THIS IS THE PICTURE THAT WOULD HAVE PAID FOR ITSELF, taken as a number instead: it watches BOTH
 * seats at 25ms and reports when each first shows a non-empty narration box. A wait-based bug is
 * invisible in a still frame and obvious in this gap.
 *
 * IT CAN FAIL, AND IT CAN FAIL HONESTLY. If neither seat ever draws, it says NOT RUN and exits 1 —
 * a leg that could not start is not a leg that passed.
 */
import { serve, launch, attach, killAll, sleep, makeHost, makeGuest, startVoyage } from "../mp_rig.mjs";

const PORT = 8512, DBG_H = 9412, DBG_G = 9413;
const BUDGET_MS = 250;                                  // well under the 450ms grace; a wire hop is tens
const url = serve(PORT);
launch(DBG_H, "/tmp/chrome-q18-host");
launch(DBG_G, "/tmp/chrome-q18-guest");
const H = await attach(DBG_H), G = await attach(DBG_G);
for (const C of [H, G]) await C.send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });

const NARR = `((document.querySelector('.pp4Bub')||{}).textContent||'').trim().slice(0,70)`;

console.log("Q-18 — the recipe-draft line, host against guest.\n");
const code = await makeHost(H, url, "test1");
console.log(`  room ${code}`);
await makeGuest(G, url, code, "test2");

const t0 = Date.now();
await startVoyage(H);
let hAt = null, gAt = null, hText = "", gText = "";
/* BOUNDED, never while(true) — rule 17. 25ms x 400 = 10s, and the draft line lands within ~3s. */
for (let i = 0; i < 400; i++) {
  if (hAt == null) { const t = await H.ev(NARR); if (t) { hAt = Date.now() - t0; hText = t; } }
  if (gAt == null) { const t = await G.ev(NARR); if (t) { gAt = Date.now() - t0; gText = t; } }
  if (hAt != null && gAt != null) break;
  await sleep(25);
}

console.log(`\n  host  first line at ${hAt == null ? "NEVER" : hAt + "ms"}   "${hText}"`);
console.log(`  guest first line at ${gAt == null ? "NEVER" : gAt + "ms"}   "${gText}"`);
killAll();
if (hAt == null || gAt == null) {
  console.log(`\n=== NOT RUN — one seat never drew a line at all. That is not a pass; it is a probe that could not reach its subject.`);
  process.exit(1);
}
const gap = gAt - hAt;
console.log(`\n  gap: ${gap}ms   (budget ${BUDGET_MS}ms — the grace period is 450ms, so a hold shows up here as ~450)`);
console.log(gap <= BUDGET_MS
  ? `\n=== PASS — the guest is within a wire hop of the host. No serial was sent for a line that has no event.`
  : `\n=== FAIL — the guest is ${gap}ms behind on the very first line of the voyage. Something is holding it.`);
process.exit(gap <= BUDGET_MS ? 0 : 1);
