#!/usr/bin/env node
/* ONE RING, ONE ANSWER — the active-turn ripple must not depend on which drawing path ran.
 *
 *   node scripts/qa/ripple_one_answer_check.mjs
 *
 * WYATT, 2026-08-31: **"no ripple ring in the ovens."** The ring stays with whoever last took the
 * wheel; it does not move to the captain who has stepped up to bake.
 *
 * WHAT WENT WRONG. Two functions in src/ui/board.js draw that ring, and each passed a DIFFERENT
 * event list to the same walk:
 *   renderLiveShips()  ->  activeTurnSeat()  ->  TURN_ONLY          ["turn"]
 *   render()           ->  deriveActiveSeat() with NO options  ->   TURN_ESTABLISHING
 *                                                                   ["turn","ovens","bake"]
 * So during a bake the ring's position depended on which path last ran. That is rule 23 exactly:
 * one thing a player looks at, two answers, kept in step by nobody. src/shared/storyboard.js:25-29
 * records that ovens/bake were added because a bake "is not a turn" and the ring pointed at the
 * previous captain — read as a bug at the time, and ruled NOT a bug now.
 *
 * THE ASSERTION IS ABOUT AGREEMENT, NOT ABOUT A PARTICULAR LIST. If Wyatt reverses himself
 * tomorrow, both sites move together and this stays green. What it forbids is the two of them
 * disagreeing — which is the only part that cannot be right either way.
 *
 * House convention: no test runner, one PASS/FAIL line per case, every case runs before exit.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const board = fs.readFileSync(path.join(ROOT, "src/ui/board.js"), "utf8");

let failures = 0;
const fail = (w) => { failures++; console.log(`  FAIL  ${w}`); };
const pass = (w) => console.log(`  PASS  ${w}`);
console.log("ripple_one_answer_check — the ring must not depend on which drawing path ran\n");

/* Strip comments: this file's own prose names both lists, and so does board.js's header. */
const code = board.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/[^\n]*/g, "$1");

/* INSTRUMENT REACHED ITS SUBJECT? Prove the ring and both drawing paths are still here before
   believing any verdict about them. A gate that silently stops finding its subject reports PASS. */
const ringSites = [...code.matchAll(/ringTo\s*\(/g)].length;
const hasLive = /export function renderLiveShips\s*\(/.test(code);
const hasRender = /export function render\s*\(/.test(code);
if (ringSites >= 2 && hasLive && hasRender) pass(`instrument reached its subject — ${ringSites} ringTo() site(s), and both renderLiveShips() and render() are present`);
else fail(`cannot find the subject (ringTo sites:${ringSites} renderLiveShips:${hasLive} render:${hasRender}) — every verdict below is meaningless`);

/* THE LIST EACH RING SITE EFFECTIVELY USES. A deriveActiveSeat call with no `establishing` option
   takes the module default, so an ABSENT option is itself an answer — and it is the one that
   differed. Read the nearest preceding seat derivation for each ringTo(). */
const seatFor = (idx) => {
  const before = code.slice(0, idx);
  const calls = [...before.matchAll(/deriveActiveSeat\s*\(([^;]*?)\)\s*;|activeTurnSeat\s*\(\s*\)/g)];
  const last = calls[calls.length - 1];
  if (!last) return null;
  if (last[0].startsWith("activeTurnSeat")) return "TURN_ONLY (via activeTurnSeat)";
  const m = last[1] && last[1].match(/establishing\s*:\s*([A-Z_]+)/);
  return m ? `${m[1]} (explicit)` : "TURN_ESTABLISHING (the default — no option passed)";
};
const lists = [...code.matchAll(/ringTo\s*\(/g)].map(m => seatFor(m.index)).filter(Boolean);
const distinct = [...new Set(lists.map(l => l.split(" ")[0]))];

distinct.length === 1
  ? pass(`every ring site derives the seat from the same event list — ${distinct[0]}; the ring cannot depend on which path drew it`)
  : fail(`the ring's seat comes from ${distinct.length} DIFFERENT event lists depending on which path drew it: ${lists.join("  |  ")}`);

/* AND IT MUST BE THE LIST HE RULED FOR. Separate case, because "they agree" and "they agree on the
   right answer" are different claims and only one of them is his call. */
distinct.length === 1 && distinct[0] === "TURN_ONLY"
  ? pass("and it is TURN_ONLY — the ring stays with the last captain to take the wheel, per Wyatt's ruling of 2026-08-31")
  : fail(`the ring counts ${distinct.join("/")}, so it moves to the captain at the ovens during a bake. Wyatt, 2026-08-31: "no ripple ring in the ovens"`);

/* RED-PROOF. Both directions, run through the SAME reader used above. */
{
  const twoAnswers = `function a(){ const s=deriveActiveSeat(ev,i,{establishing:TURN_ONLY}); ringTo(s,x,y); }\nfunction b(){ let q=deriveActiveSeat(ev,i); ringTo(q,x,y); }`;
  const oneAnswer  = `function a(){ const s=deriveActiveSeat(ev,i,{establishing:TURN_ONLY}); ringTo(s,x,y); }\nfunction b(){ let q=deriveActiveSeat(ev,i,{establishing:TURN_ONLY}); ringTo(q,x,y); }`;
  const read = src => {
    const seat = (idx) => {
      const calls = [...src.slice(0, idx).matchAll(/deriveActiveSeat\s*\(([^;]*?)\)\s*;|activeTurnSeat\s*\(\s*\)/g)];
      const last = calls[calls.length - 1]; if (!last) return null;
      if (last[0].startsWith("activeTurnSeat")) return "TURN_ONLY";
      const m = last[1] && last[1].match(/establishing\s*:\s*([A-Z_]+)/);
      return m ? m[1] : "TURN_ESTABLISHING";
    };
    return [...new Set([...src.matchAll(/ringTo\s*\(/g)].map(m => seat(m.index)).filter(Boolean))];
  };
  const redsOnSplit = read(twoAnswers).length === 2;
  const greenOnOne  = read(oneAnswer).length === 1 && read(oneAnswer)[0] === "TURN_ONLY";
  redsOnSplit && greenOnOne
    ? pass("red-proof: the same reader reports TWO lists for a split pair and ONE for a converged pair — an omitted option is read as the default, which is the spelling that differed")
    : fail(`red-proof FAILED (redsOnSplit:${redsOnSplit} greenOnOne:${greenOnOne}) — this gate may be unable to fail`);
}

console.log(`\n${failures ? "FAIL" : "PASS"} — ${failures} failure(s)`);
process.exit(failures ? 1 : 0);
