/* W5-2 — THE CALL BUTTONS SIT BESIDE THEIR OWN BOAT, AND STAY THERE.
 * Wyatt: "The buttons to call other battling captains sit on top of their boats, and often on the
 * WRONG boat. They should be directly beside the boats — side, top or bottom — so the player can
 * read the wind and the situation."
 *
 * MEASURED IN CHROMIUM BEFORE ANY CHANGE, with the real prompt posed at three sizes
 * (scripts/qa/w52_call_beside_boat.mjs — that probe is the measurement; this gate holds the rule):
 *   phone 390  (35px boats)  circle covered  0–5% of its own hull
 *   desktop 1200 (67px)                      12%
 *   tablet 768   (83–88px)                   24–27%
 * The bigger the board the more hull the answer hides, because the seed was the literal `ay + 26`
 * — a constant standing in for half a boat, and a boat is drawn `cell` wide (rule 9).
 *
 * AND THE SECOND HALF, reproduced by posing the two options in the order that fires it: D-48's
 * "the last option takes the lowest spot" is a SWAP between two spots. Harmless in a fan around
 * your own ship, where every spot is interchangeable. These spots are anchored to NAMED boats, so
 * the swap put each circle beside the other captain's boat — measured at 768px: "Call Captain 2"
 * 425px from Captain 2, sitting 24% on Captain 1's hull, and vice versa. It fires whenever the
 * attacker's boat is right of the defender's: about half of all fights. "Often."
 *
 * WHAT THIS MUST NOT BREAK: D-48 itself. The ordinary fan around your own ship still has to run
 * lastLowest(), or "Pass is always the lowest circle" is silently repealed — so this gate requires
 * it to survive OUTSIDE the anchored-boats branch, not merely to be absent inside it.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
let fails = 0;
const pass = m => console.log("PASS " + m);
const fail = m => { console.log("FAIL " + m); fails++; };
const src = fs.readFileSync(path.join(REPO, "src/ui/stage.js"), "utf8");
const code = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/[^\n]*/g, "$1");

/* Anchor on the branch itself rather than on line numbers: `if (onBoats){` inside the radial
   placement, up to the `menu.forEach` that writes the spots out. */
const branch = (() => {
  const i = code.indexOf("if (onBoats){");
  if (i < 0) return "";
  const j = code.indexOf("menu.forEach((b, i) =>", i);
  return j < 0 ? "" : code.slice(i, j);
})();

if (!branch) fail("could not find the anchored-boats placement branch in stage.js — re-anchor this gate, do not delete it");
else {
  /* (1) THE OFFSET COMES FROM THE BOAT, NOT FROM A NUMBER. */
  /* THE SEED IS WHATEVER `let spots = anchors.map(...)` PRODUCES, however it is written — one line
     or twenty. Matching only the multi-line form made the one-line `ay + 26` original read as an
     EMPTY seed, so the red-proof failed for "boatRad absent" and reported "a literal ay±N
     survives:false" about a tree whose whole seed was that literal. A gate that reaches the right
     verdict through a reason that is not true is the fault this project keeps paying for. */
  const seedAt = branch.indexOf("let spots = anchors.map(");
  const seed = seedAt < 0 ? null : branch.slice(seedAt, branch.indexOf("\n      const NEED", seedAt) + 1 || undefined);
  const derived = !!seed && /boatRad\s*\(/.test(seed) && /growPeak/.test(branch);
  const constantStern = !!seed && /ay\s*[+-]\s*\d+\s*\]/.test(seed);
  if (seed === null) fail("could not find `let spots = anchors.map(` in the anchored-boats branch — the seed has moved; re-anchor this assertion rather than trusting its silence");
  else if (derived && !constantStern)
    pass("the circle is offset by the boat's OWN rendered half-size plus the petal at its pulse peak — no typed stand-in for half a boat");
  else
    fail(`the offset is not derived from the boat (boatRad used:${derived}, a literal ay±N survives:${constantStern}) — a constant is right for exactly one board scale, and the board scales`);

  /* (2) NOTHING MAY COME TO REST ON A HULL — seed, separation, clamp or fallback row. */
  const guards = (branch.match(/onHull\s*\(/g) || []).length;   // call sites; the `const onHull =` definition does not match
  const hullsBuilt = /const onHull\s*=/.test(branch) && /const hulls\s*=/.test(branch) && /boatUXY\s*\(\s*i\s*\)/.test(branch);
  // the repair loop is the half that catches what the clamp and the even-row fallback do AFTER seeding
  const repairs = /for \(let pass[\s\S]*?hulls\.find\(/.test(branch);
  if (hullsBuilt && guards >= 2 && repairs)
    pass(`every hull is an obstacle, projected through the same camera as the anchors — ${guards} onHull call site(s) (choosing the side, and the retry) plus a repair pass over what the clamp and the fallback row did`);
  else
    fail(`the hulls are not guarded (defined+built:${hullsBuilt}, onHull call sites:${guards}, repair pass:${repairs}) — the band clamp and the even-row fallback know nothing about boats and will put a circle back on one`);

  /* (3) D-48 IS NOT APPLIED TO SPOTS THAT ARE NOT INTERCHANGEABLE. */
  if (/lastLowest\s*\(/.test(branch))
    fail("lastLowest() is applied inside the anchored-boats branch — it SWAPS two spots, and these spots name specific boats, so it puts each circle beside the wrong captain (measured: 425px off, at 768px)");
  else
    pass("lastLowest() is not applied where each spot names a boat — a swap there is the wrong-boat bug");
}

/* (4) …AND D-48 STILL GOVERNS THE ORDINARY FAN. */
const after = branch ? code.slice(code.indexOf("menu.forEach((b, i) =>", code.indexOf("if (onBoats){"))) : code;
if (/=\s*lastLowest\s*\(/.test(after))
  pass("D-48 survives for the fan around your own ship, where Pass may take any spot");
else
  fail("lastLowest() is no longer applied to the ordinary fan — 'the Pass button is always the lowest one' has been repealed by a fix aimed at a different prompt");

console.log(fails ? `\nFAILED — ${fails} failure(s)` : "\nPASSED — the call circles sit beside their own boat, clear of every hull, and D-48 still owns the ordinary fan");
process.exit(fails ? 1 : 0);
