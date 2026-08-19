#!/usr/bin/env node
/* RULE-02 GATE — the pass narration tells the captain they were paid, on all 100 renderings.
 *
 * WHY THIS EXISTS. RULE-01 pays a dubloon for passing. A payment the interface never mentions is a
 * payment the player has to discover by watching their own purse, and a tag that states an amount
 * the engine did not pay is the interface lying to them about it. So the two land together and both
 * gates must be green before either is shippable.
 *
 * THE TAG IS A SUBJECTLESS FRAGMENT, AND THAT IS THE ENTIRE DESIGN (D-06, Wyatt 2026-08-18). The 50
 * sea sightings are hand-written prose PAIRS — an addressed form and a third-person form carrying a
 * name marker — and roughly twenty of them end on the CREATURE as the nearest grammatical subject
 * ("...and a dozen donut shrimp bounce past."). Any appended clause carrying a verb hands the pen to
 * the shrimp. A fragment with no subject, no verb and no agreement reads identically after all fifty
 * sentences in both persons, which is why the tag can be appended by the renderer in ONE place and
 * all 100 hand-written strings stay untouched.
 *
 * That is also the seaLine contract (4/src/ui/util.js): both persons are read out verbatim, nothing
 * is conjugated, no article is guessed, no agreement is derived. The deleted seaSighting() did all
 * three and got the plurals wrong. This gate is what stops that coming back.
 *
 * WHAT IT GATES
 *   RULE-02 coverage    All 100 renderings — 50 entries x the addressed and third-person persons —
 *                       end with the tag. One check line per rendering, each naming its own fault.
 *   RULE-02 ENCODING    *** THE EDGE THIS GATE EXISTS FOR ***
 *                       Asserted on the string the builder ACTUALLY RETURNS, never on the source
 *                       literal, so a coin mangled or split by the render pipeline is caught. The
 *                       coin is checked as a whole grapheme (code-point iteration, not a substring
 *                       match, which a lone surrogate would satisfy) and the whole rendering is
 *                       swept for unpaired surrogates.
 *   D-50 chokepoint     The coin rides through the ONE emoji chokepoint: a raw character in the
 *                       builder body that emojify() swaps for the coin image, exactly as panel()
 *                       does at render time. Proven by running emojify() over every rendering, and
 *                       by asserting the builder body hand-rolls no image markup of its own.
 *   D-06 wrapping       The tag is wrapped WHOLE in a no-break span — the unit and its amount are
 *                       one readable thing and must not split across a line break (the sailing-order
 *                       precedent, G27/P7). Asserted as one exact substring, so nothing can creep in
 *                       between the opening tag and the coin.
 *   Sentence intact     Each entry's own sighting sentence still renders verbatim, ahead of the tag.
 *                       The renderer appends; it does not rewrite.
 *   Caption + pop       The on-ship caption and the wave pop are unchanged. The tag lands in the
 *                       narration text only.
 *
 * FIXTURE VALIDATION (docs/HARD-WON-LESSONS.md §3 — a fixture that cannot exist in the game proves
 * nothing). Every creature here is READ OUT of SEA_CREATURES rather than typed, and the shape of
 * what was read is asserted before anything is measured. A hand-typed sighting would let this file
 * "prove" the tag works on a sentence the game does not contain.
 *
 * CONTROLS, because a harness is unreviewed code. The entry count, the pair shape, the name marker
 * in the third-person form, and the fact that the two persons render DIFFERENTLY are all printed and
 * checked before the 100 renderings run — a builder that ignored its viewer argument would otherwise
 * sail through 100 identical assertions.
 *
 * WHY THE EXPLICIT EXIT. Importing 4/src/ui/util.js arms module-scope timers that hold Node's event
 * loop open forever after a perfectly SUCCESSFUL import — the same reason 4/scripts/stage_import_
 * check.js and 4/scripts/pp4_timeroff_check.js force theirs. A gate that hangs CI is worse than no
 * gate.
 *
 * IT PRINTS RENDERED COPY, NOT A DESCRIPTION OF IT (CLAUDE.md §1). Wyatt picked this wording after
 * seeing real lines on screen and reversing himself twice, and he judges copy the same way every
 * time. The samples below include the donut-shrimp line, which broke every earlier draft.
 *
 * FAILURE DEMONSTRATION (CLAUDE.md §4 — a check nobody has seen fail is not yet a check). Recorded
 * with observed exit codes in 01-04-SUMMARY.md.
 *
 * Run: node 4/scripts/pass_narration_test.js
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { EVENT_NARRATION, pn, NEUTRAL_VIEWER } from "../src/ui/util.js";
import { SEA_CREATURES, emojify, COIN_IMG, WAVE_IMG } from "../src/shared/index.js";
import { appState } from "../src/state/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");            // -> 4/
const UTIL_PATH = path.join(ROOT, "src", "ui", "util.js");
const UTIL_SRC = fs.readFileSync(UTIL_PATH, "utf8");

let failures = 0;
function check(name, actual, expected) {
  const ok = actual === expected;
  if (!ok) failures++;
  console.log(`  ${(ok ? "PASS" : "FAIL").padEnd(5)} ${name.padEnd(78)} got=${JSON.stringify(actual)} want=${JSON.stringify(expected)}`);
}
function checkTrue(name, actual) { check(name, actual, true); }
function countOf(src, needle) { return src.split(needle).length - 1; }

// Four claimed seats with real names (a truthy id makes pname() read the name rather than the
// seat-indexed default). appState.mySeat is left at its module default — this gate always passes an
// explicit viewerSeat, so the live value is never consulted.
appState.roster = [
  { id: "u0", name: "Davy Scones" },
  { id: "u1", name: "Crustbeard" },
  { id: "u2", name: "Dough Hook" },
  { id: "u3", name: "Flaky Jack" },
];
const at = () => [0, 0];   // the builder needs board coordinates for its pop; it never reads them here
const SEAT = 1;            // Crustbeard, the seat D-06's own rendered check was written against

// The tag, and the whole-unit wrapping it must arrive in. Both written once, here, and everything
// below is asserted against these rather than against a literal repeated per assertion.
const TAG = "Recipe idea! (+1\u{1F315})";
const WRAPPED = `<span class="nobrk">${TAG}</span>`;
const COIN = "\u{1F315}";
// A high surrogate not followed by a low one, or a low surrogate not preceded by a high one. This is
// what a multi-code-point character split by a careless slice or re-encode leaves behind.
const LONE_SURROGATE = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/;

function render(entry, mine) {
  return EVENT_NARRATION.pass({ t: "pass", p: SEAT, sea: entry }, at, 40, mine ? SEAT : NEUTRAL_VIEWER);
}
function plain(html) { return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim(); }

console.log("\nRULE-02 — the pass narration says the captain was paid\n");

/* ================= the fixture, before anything is measured ================= */
console.log("  -- fixture: the sightings are the game's own, not this file's --");
check("CONTROL: SEA_CREATURES holds 50 hand-written entries", SEA_CREATURES.length, 50);
checkTrue("CONTROL: every entry is a pair carrying both persons",
  SEA_CREATURES.every((s) => s && typeof s.y === "string" && typeof s.t === "string" && s.y.length > 0 && s.t.length > 0));
checkTrue("CONTROL: every third-person entry carries the name marker",
  SEA_CREATURES.every((s) => s.t.includes("{}")));
checkTrue("CONTROL: no entry writes the tag itself — the renderer appends it in one place",
  SEA_CREATURES.every((s) => !s.y.includes("Recipe idea") && !s.t.includes("Recipe idea")));
// A builder that ignored its viewer argument would sail through 100 identical assertions below.
checkTrue("CONTROL: the two persons really do render differently",
  render(SEA_CREATURES[0], true).txt !== render(SEA_CREATURES[0], false).txt);
checkTrue("CONTROL: emojify() swaps a raw coin for the coin image", emojify(COIN).includes(COIN_IMG));

/* ================= 100 renderings ================= */
console.log("\n  -- 100 renderings: 50 entries x the addressed and third-person persons --");

function verdict(entry, mine) {
  const out = render(entry, mine);
  const txt = out && out.txt;
  if (typeof txt !== "string") return "the builder returned no narration text";
  const problems = [];
  // the tag, whole, unbroken, and at the end
  if (!txt.endsWith(WRAPPED)) problems.push("does not end with the tag wrapped whole in a no-break span");
  if (countOf(txt, TAG) !== 1) problems.push(`the tag appears ${countOf(txt, TAG)} times, not once`);
  if (countOf(txt, WRAPPED) !== 1) problems.push("the no-break wrapping is missing or duplicated");
  // ENCODING — on the returned string, and as a whole grapheme
  if (!Array.from(txt).includes(COIN)) problems.push("the coin did not survive as a whole grapheme");
  if (LONE_SURROGATE.test(txt)) problems.push("the rendering contains an unpaired surrogate");
  // D-50 — the raw coin resolves at the chokepoint, and nothing hand-rolls it earlier
  const emojified = emojify(txt);
  if (!emojified.includes(COIN_IMG)) problems.push("the coin does not resolve to the coin image at the chokepoint");
  if (emojified.includes(COIN)) problems.push("a raw coin survived the chokepoint unresolved");
  // the sighting sentence itself, verbatim, ahead of the tag
  const sentence = mine ? entry.y : entry.t.replace("{}", pn(SEAT));
  const si = txt.indexOf(sentence);
  if (si < 0) problems.push("the entry's own sighting sentence is not rendered verbatim");
  else if (si > txt.indexOf(WRAPPED)) problems.push("the tag renders ahead of the sighting sentence");
  // the caption and the pop are narration-text-free
  const capTxt = out.caps && out.caps[0] && out.caps[0][1];
  if (capTxt !== "\u{1F30A} looks into the ocean") problems.push(`the on-ship caption changed: ${JSON.stringify(capTxt)}`);
  if (!out.pops || out.pops[0][1] !== "\u{1F30A}" || out.pops[0][2] !== false || out.pops[0][3] !== WAVE_IMG) {
    problems.push("the wave pop changed");
  }
  return problems.length ? problems.join("; ") : "ok";
}

for (let i = 0; i < SEA_CREATURES.length; i++) {
  check(`#${String(i).padStart(2, "0")} addressed`, verdict(SEA_CREATURES[i], true), "ok");
  check(`#${String(i).padStart(2, "0")} third-person`, verdict(SEA_CREATURES[i], false), "ok");
}

/* ================= the builder's own source ================= */
console.log("\n  -- 4/src/ui/util.js: appended in one place, resolved at the chokepoint --");
check("the tag is written in exactly one place in the narration table", countOf(UTIL_SRC, "Recipe idea!"), 1);

const passIdx = UTIL_SRC.indexOf("\n  pass:(e,at,cellPx,viewerSeat)=>(");
checkTrue("CONTROL: the pass builder was located in the narration table", passIdx >= 0);
if (passIdx >= 0) {
  const body = UTIL_SRC.slice(passIdx, UTIL_SRC.indexOf("\n  unfinish:", passIdx));
  console.log(`         pass builder anchored at util.js:${UTIL_SRC.slice(0, passIdx).split("\n").length + 1}, ${body.split("\n").length} lines`);
  checkTrue("the builder body carries the tag", body.includes(TAG));
  check("the builder body wraps it in exactly one no-break span", countOf(body, "nobrk"), 1);
  checkTrue("the builder body hand-rolls no image markup — the coin resolves at the chokepoint",
    !body.includes("iconImg(") && !body.includes("COIN_IMG") && !body.includes("<img"));
}

/* ================= rendered samples, for a human to read ================= */
// Three lines at both persons, printed as the panel receives them and as they read on screen. #04 is
// the donut-shrimp line that broke every earlier draft; #00 opens the list and #49 closes the ring.
console.log("\n  -- rendered samples (D-06: show the copy, do not describe it) --");
for (const i of [0, 4, 49]) {
  for (const mine of [true, false]) {
    const out = render(SEA_CREATURES[i], mine);
    console.log(`\n    #${String(i).padStart(2, "0")} ${mine ? "addressed " : "third-person"}  ${plain(out.txt)}`);
    console.log(`         raw:  ${out.txt}`);
  }
}

console.log(`\n  ${SEA_CREATURES.length * 2} renderings checked, ${failures} failure(s)\n`);
// util.js arms module-scope timers on import; without this the gate hangs after a successful run.
process.exit(failures ? 1 : 0);
