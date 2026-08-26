/* seat_parity.mjs — DO THE TWO CAPTAINS SEE THE SAME GAME?
 *
 * Wyatt's design principle (2026-08-26): "the game itself should remain consistent for every player
 * in every mode... players of different modes see different things, which is not what we want."
 * CLAUDE.md rule 23's design-time question is "what makes these two agree?" — and until this file
 * the honest answer was "nothing; we keep them in step".
 *
 * WHY IT DID NOT EXIST BEFORE, and it is a real problem rather than an oversight: playtest_gate
 * already plays BOTH crew seats to a true end of voyage, and then throws the comparison away — each
 * seat is judged against the universal rules ALONE. Seven of Wyatt's 35 findings are "both screens
 * are individually fine and they disagree", which no single-screen rule can see. A rule saying
 * "a narration box must have text in it" passes happily on a screen with no narration box at all.
 * A MISSING THING IS INVISIBLE TO A CHECKER THAT ONLY INSPECTS WHAT IS PRESENT.
 *
 * WHY IT COMPARES THE TABLE AND NOT THE WHOLE SCREEN. The two seats are not in lockstep — one is
 * being asked something while the other waits, and their prompts SHOULD differ. Comparing whole
 * screens would cry wolf on every turn, and a gate that cries wolf teaches its reader to dismiss it
 * (HARD-WON-LESSONS). So this compares only THE SHARED TRUTH: facts about the table that must hold
 * on every screen no matter whose turn it is.
 *
 * What that set catches, from his own list:
 *   T-03  the day's wind never appears for the guest      -> wind
 *   T-09  the previous captain stays lit during a bake     -> lit
 *   T-04  a battle card that never leaves the guest        -> battle
 *   T-06  the host shows nothing during a guest's bake     -> bench
 *   plus any purse, day or roster that drifts between the two.
 */

/* One screen's view of the SHARED truth. Deliberately small: everything here is a fact about the
   table, never about the viewer. Anything viewer-specific (your own prompt, your own buttons) is
   excluded by construction rather than by an allow-list, so a new per-seat control cannot silently
   start being compared. */
export const SEAT_VIEW = `JSON.stringify((()=>{
  const txt = el => el ? (el.innerText||'').replace(/\\s+/g,' ').trim() : null;
  const vis = el => { if(!el) return false; const r=el.getBoundingClientRect(); const s=getComputedStyle(el);
    return r.width>1 && r.height>1 && s.display!=='none' && s.visibility!=='hidden'; };
  const rib = document.getElementById('pp4Ribbon');
  const day = rib ? ((txt(rib)||'').match(/DAY\\s*\\d+/)||[])[0]||null : null;
  const rows = [...document.querySelectorAll('[id^=prow]')].map(r => {
    const t = txt(r)||'';
    return { name: t.split(' ')[0]||'', purse: (t.match(/\\d+/)||[])[0]||null, lit: r.classList.contains('activeTurn') };
  });
  const hd = [...document.querySelectorAll('.bkoHd')].find(vis);
  return {
    day,
    wind: txt(document.getElementById('pp4Pill')),
    captains: rows.map(r => r.name + ':' + r.purse).join(','),
    lit: rows.filter(r => r.lit).map(r => r.name).join(',') || '(nobody)',
    battle: !!(document.querySelector('#pp4Prompt .btl') && vis(document.querySelector('#pp4Prompt .btl'))),
    bench: hd ? (txt(hd)||'').replace(/attempt.*$/,'').trim() : null,
  };
})())`;

/* WHAT IS ALLOWED TO DIFFER, and why each one is on the list. Anything not named here that differs
   is a finding. Keeping this list SHORT is the whole value — every entry is a place the two screens
   are permitted to disagree, which is a place a bug can hide. */
const ALLOWED = {
  // The captains box is ordered per viewer in pass-and-play (the acting captain floats to the top),
  // so ORDER is not compared — only the SET. Handled in compare(), not here.
};

/* Compare two views. Returns [] when the table agrees. */
export function compareSeats(a, b, { aName = "host", bName = "guest" } = {}) {
  if (!a || !b) return [];
  const out = [];
  const say = (field, why) => out.push({ field, why });

  if (a.day !== b.day) say("day", `${aName} shows ${JSON.stringify(a.day)}, ${bName} shows ${JSON.stringify(b.day)}`);
  if (a.wind !== b.wind) say("wind", `${aName} shows ${JSON.stringify(a.wind)}, ${bName} shows ${JSON.stringify(b.wind)}`);

  // SET, not order — pass-and-play floats the acting captain to the top of the box by design.
  const setOf = s => (s || "").split(",").filter(Boolean).sort().join(",");
  if (setOf(a.captains) !== setOf(b.captains))
    say("captains", `${aName}: ${a.captains || "(none)"}   ${bName}: ${b.captains || "(none)"}`);

  if (a.lit !== b.lit) say("whose turn", `${aName} lights ${a.lit}, ${bName} lights ${b.lit}`);
  if (a.battle !== b.battle) say("battle card", `${aName} ${a.battle ? "has" : "has no"} battle card, ${bName} ${b.battle ? "has" : "has no"}`);
  if (!!a.bench !== !!b.bench) say("bake-off bench", `${aName} ${a.bench ? `shows "${a.bench}"` : "shows no bench"}, ${bName} ${b.bench ? `shows "${b.bench}"` : "shows no bench"}`);

  return out;
}

/* Sample both seats once they have BOTH stopped moving, then compare.
   THE SETTLE IS NOT OPTIONAL: mid-tween the two are legitimately out of step, and comparing then
   would report the network's latency as a bug. `stableFor` consecutive identical reads on both
   sides is what separates "they disagree" from "one has not caught up yet". */
export async function compareWhenSettled(A, B, { sampleMs = 250, stableFor = 3, capMs = 6000 } = {}) {
  const t0 = Date.now();
  let lastA = null, lastB = null, stable = 0;
  while (Date.now() - t0 < capMs) {
    let a = null, b = null;
    try { a = JSON.parse(await A.ev(SEAT_VIEW)); b = JSON.parse(await B.ev(SEAT_VIEW)); } catch { return { skipped: "a seat could not be read" }; }
    const same = JSON.stringify(a) === JSON.stringify(lastA) && JSON.stringify(b) === JSON.stringify(lastB);
    stable = same ? stable + 1 : 0;
    lastA = a; lastB = b;
    if (stable >= stableFor) return { a, b, findings: compareSeats(a, b) };
    await new Promise(r => setTimeout(r, sampleMs));
  }
  // Never guess. A pair that never settles is reported as such, not compared and not passed.
  return { a: lastA, b: lastB, skipped: `neither seat settled within ${capMs}ms — not compared` };
}
