/* W3-4 — THE END OF VOYAGE CARD IS DRAGGED, NOT FIRED, AND IT LANDS WITHOUT A BOUNCE.
 * Wyatt: "The End of Voyage card SLAMS down to the captains box. It should scroll smoothly."
 *
 * MEASURED IN CHROMIUM BEFORE ANY CHANGE (scripts/qa/w34_eov_park_glide.mjs — that probe is the
 * evidence; this is the tripwire):
 *   one 4px trackpad notch moved the card 688px on a 1200px desktop and 762px on a tablet — the
 *   ENTIRE journey, in 250ms, off a gesture that had barely started
 *   and it went 28px / 31px PAST the captains box before springing back, because the settle curve
 *   ended at 1.15 instead of 1
 * Both are the signature of a slam. Afterwards: one notch moves it 4px, the release parks it with
 * 0px of overshoot, and a finger still drags it live.
 *
 * THIS GATE READS SOURCE TEXT AND MAY ONLY CLAIM THINGS ABOUT SOURCE TEXT (CEO Review 21's rule).
 * The picture is the probe's job.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
let fails = 0;
const pass = m => console.log("PASS " + m);
const fail = m => { console.log("FAIL " + m); fails++; };
/* COMMENTS STRIPPED FIRST, and this is not tidiness. The first run of this gate read
   `cubic-bezier(...,1.15)` out of the prose comment that EXPLAINS the fix and reported the curve's
   end point as NaN — my own explanation defeating my own check. An instrument that reads a file
   must read the part of it the browser reads. */
const html = fs.readFileSync(path.join(REPO, "index.html"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const stage = fs.readFileSync(path.join(REPO, "src/ui/stage.js"), "utf8");
const code = stage.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/[^\n]*/g, "$1");

/* (1) THE CURVE LANDS ON 1. A cubic-bezier whose last control point is above 1 goes past its
   destination and comes back — measured at 28px past the captains box. */
const rule = (html.match(/body\.pp4Stage #statsWrap \{[\s\S]*?\}/) || [""])[0];
const bez = (rule.match(/cubic-bezier\(([^)]*)\)/) || [, ""])[1];
const endY = parseFloat((bez.split(",")[3] || "").trim());
if (!rule) fail("could not find the `body.pp4Stage #statsWrap` rule — re-anchor this gate, do not delete it");
else if (Number.isFinite(endY) && endY <= 1)
  pass(`the settle curve lands on its destination — cubic-bezier(${bez.trim()}), final control point ${endY}`);
else
  fail(`the settle curve ends at ${endY} — anything above 1 overshoots and springs back, which is what a slam IS (measured 28px past the captains box on desktop, 31px on tablet)`);

/* (2) THE DURATION SCALES WITH THE JOURNEY, and the stylesheet still owns the full-travel number. */
const varDur = /transition\s*:\s*transform\s+var\(\s*--pp4EovSettle\s*,\s*[.\d]+s\s*\)/.test(rule);
const jsSets = /setProperty\(\s*"--pp4EovSettle"/.test(code);
const jsDerives = /const fullMs\s*=[\s\S]{0,160}getComputedStyle\(wrap\)\.transitionDuration/.test(code)
  && /fullMs\s*\*\s*Math\.max\(/.test(code);
if (varDur && jsSets && jsDerives)
  pass("the settle time is a variable stage.js sets in proportion to the distance travelled, and the full-travel number is written once, in the stylesheet, and read back from it");
else
  fail(`the settle time is not distance-proportional (css declares the variable:${varDur}, stage.js sets it:${jsSets}, and derives the full-travel time from the stylesheet rather than re-typing it:${jsDerives}) — a flat quarter-second is right for the full park and a slam for everything shorter`);

/* (3) THE WHEEL ACCUMULATES INTO THE CARD instead of committing the whole journey on notch one. */
const wheelBlk = (code.match(/wrap\.addEventListener\("wheel"[\s\S]*?\{ passive: false \}\);/) || [""])[0];
if (!wheelBlk) fail("could not find the wheel handler in stage.js — re-anchor this assertion");
else {
  const accumulates = /eovTranslateY\(wrap\)\s*\+\s*e\.deltaY/.test(wheelBlk)
    && /wrap\.style\.transform\s*=/.test(wheelBlk) && /classList\.add\("pp4EovDrag"\)/.test(wheelBlk);
  const fires = /settle\(\s*g\.dY/.test(wheelBlk);
  if (accumulates && !fires)
    pass("a wheel notch is added to the card's own position and drawn there — the card follows the scroll instead of being launched at the captains box");
  else
    fail(`the wheel still commits the whole journey (accumulates into the transform:${accumulates}, calls settle(g.dY) directly:${fires}) — measured: one 4px notch threw the card 688px`);
}

/* (4) ONE RELEASE RULE, TWO INPUT DEVICES. The wheel and the finger both have to decide "park or
   come back" the same way, or they drift — which is exactly what they had already done. */
const releaseUses = (code.match(/EOV_PARK_RELEASE_FRACTION/g) || []).length;
const wheelReleases = /const wheelRelease\s*=[\s\S]{0,420}EOV_PARK_RELEASE_FRACTION/.test(code);
if (releaseUses >= 2 && wheelReleases)
  pass(`the wheel's release reads the same EOV_PARK_RELEASE_FRACTION the finger's does (${releaseUses} readers of the one ratio)`);
else
  fail(`the wheel does not share the pointer's release rule (readers:${releaseUses}, wheelRelease consults it:${wheelReleases}) — two rules for one gesture drift, and these two already had`);

console.log(fails ? `\nFAILED — ${fails} failure(s)`
  : "\nPASSED — the stylesheet's settle curve lands on 1, its duration is set from the distance, the wheel accumulates rather than fires, and both input paths share one release rule. What the card DOES is measured by scripts/qa/w34_eov_park_glide.mjs, not here.");
process.exit(fails ? 1 : 0);
