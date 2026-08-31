#!/usr/bin/env node
/* THE SEA TRIAL MUST NOT SAY "PASS" ABOUT A LEG THAT NEVER SAILED.
 *
 *   node scripts/qa/trial_honesty_check.mjs
 *
 * WHAT THIS COST, 2026-08-27. The trial for build 2026.08.27.3 printed, in ONE report:
 *     | voyages that did NOT run | solo-desktop-wk, solo-phone-wk |
 *   and, forty lines later:
 *     == solo-desktop-wk: PASS (voyage incomplete)
 *     == solo-phone-wk:   PASS (voyage incomplete)
 *   A leg that could not start has no findings, and the summary printed PASS for anything with no
 *   findings. **That is the precise lie the sea trial was named to prevent, printed by the sea
 *   trial.** A skimmer reads PASS.
 *
 * AND THE REASON IT DID NOT RUN WAS ALSO FALSE. playtest_gate.mjs kept its OWN copy of "where is
 * playwright?", looking only in $PW_DIR or /tmp/pw, while scripts/lib/wk.mjs had been taught ~/.pw
 * on the same day. WebKit was installed and launching; the gate could not see it, and printed
 * install advice pointing at /tmp — which docs/DRIVING-THE-GAME.md §8c explicitly warns against,
 * because /tmp is cleared on reboot and that is how the Safari legs died the LAST time.
 * Two answers to one question, kept in step by memory (rule 23). They drifted in a day.
 *
 * House convention: no test runner, one PASS/FAIL line per case, every case runs before exit.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const gate = fs.readFileSync(path.join(ROOT, "scripts/playtest_gate.mjs"), "utf8");

let fails = 0;
const ok  = (m) => console.log("  PASS  " + m);
const bad = (m) => { fails++; console.log("  FAIL  " + m); };

/* ---- 1. a leg that did not run is reported as NOT RUN, never PASS ---- */
console.log("\nA leg that never sailed cannot be reported as a pass");
const { legVerdictLine } = await import(path.join(ROOT, "scripts/lib/leg_verdict.mjs"));
const CASES = [
  ["never ran",        { name: "solo-phone-wk", notRun: "WebKit unavailable", verdict: [], finished: false }, /NOT RUN/,        /PASS/],
  ["ran, no findings", { name: "solo-phone",    verdict: [],                  finished: true  },              /PASS/,           null],
  ["ran, findings",    { name: "crew-phone",    verdict: ["dead control"],    finished: true  },              /FAIL/,           /PASS/],
  ["ran, cut short",   { name: "crew-desktop",  verdict: [],                  finished: false },              /voyage incomplete/, null],
];
for (const [what, r, must, mustNot] of CASES) {
  const line = legVerdictLine(r);
  let good = must.test(line);
  if (good && mustNot && mustNot.test(line)) good = false;
  good ? ok(`${what.padEnd(18)} -> ${line.trim()}`)
       : bad(`${what.padEnd(18)} -> ${line.trim()}   (must match ${must}${mustNot ? `, must NOT match ${mustNot}` : ""})`);
}

/* ---- 2. ONE answer to "where is playwright?" ---- */
console.log("\nOne definition of where playwright lives");
// CODE, not prose. The comment explaining WHY /tmp/pw was wrong must survive — that is the
// graveyard (rule 10), and the first version of this check failed the fix for containing its own
// explanation of the bug it fixed.
const gateCode = gate.split("\n").filter(l => !/^\s*(\/\/|\*|\/\*)/.test(l)).join("\n");
/\/tmp\/pw/.test(gateCode)
  ? bad('playtest_gate.mjs still hardcodes /tmp/pw IN CODE — docs/DRIVING-THE-GAME.md §8c: /tmp is cleared on reboot, and that is how the Safari legs died once already')
  : ok("playtest_gate.mjs no longer hardcodes a playwright directory in code");
/from "\.\/lib\/wk\.mjs"|from "\.\/lib\/wk\.js"/.test(gate) || /playwrightDir|resolvePlaywright/.test(gate)
  ? ok("it asks scripts/lib/wk.mjs instead of keeping its own copy")
  : bad("it does not defer to wk.mjs — two answers to one question will drift again");

/* ---- 3. and the shared resolver agrees with reality right now ---- */
console.log("\nThe shared resolver can actually find what is installed");
const { playwrightDir } = await import(path.join(ROOT, "scripts/lib/wk.mjs"));
const found = await playwrightDir();
found ? ok(`resolved playwright at ${found}`)
      : bad("no playwright found — if it IS installed, this resolver is the thing that is wrong");

/* ---- 4. AND EVERY LEG THAT SAILED MUST HAVE ITS VERDICT PRINTED ----
   The 2026.08.29.1 report showed EIGHT verdicts for TEN legs. `solo-desktop: FAIL` and
   `solo-phone: FAIL` were both in the run's own final summary and neither reached the file, because
   the writer printed `gateOut.split("\n").slice(-60)` and the summary is longer than sixty lines.
   Meanwhile the header table went on saying "voyages that did NOT run: none". A leg with no printed
   verdict, counted as accounted-for, is section 1's lie wearing different clothes: a skimmer reads
   the table, sees nothing missing, and never learns two voyages failed.
   Checked in CODE, so it holds for a fleet of any size — a bigger literal would only move the cliff. */
console.log("\nEvery leg that sailed has its verdict printed");
const trialCode = fs.readFileSync(path.join(ROOT, "scripts/sea_trial.mjs"), "utf8")
  .replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/[^\n]*/g, "$1");
/slice\(-\d+\)[\s\S]{0,40}\|\|\s*"\(none run\)"/.test(trialCode)
  ? bad("sea_trial.mjs still prints the voyages block as a fixed tail (slice(-N)) — that is what dropped two of ten legs; print from the final summary instead, so the block is as long as the fleet needs")
  : ok("the voyages block is not a fixed tail of the output");
/const voyagesMissing\s*=\s*ranLegs\.filter/.test(trialCode) && /voyagesMissing\.length/.test(trialCode)
  ? ok("the report checks its OWN output for a missing leg and says so in the file, rather than trusting the slice")
  : bad("the report does not verify that every leg it says sailed actually has a verdict in it — a silent drop is exactly how this was missed");

/* ── AND EVERY SCREEN IT PHOTOGRAPHS IS A SCREEN IT CHECKED ────────────────────────────────────
   2026-08-31. The End of Voyage branch was an early `return` written as a TEARDOWN — grab a final
   photo and stop — so it stepped over the whole capture block above it and pushed
   `{ shot, sig: "end of voyage", fails: [] }`. That literal is indistinguishable in every report
   from "checked, and clean", on the last screen of every leg of every trial. It produced a PASS,
   which is why nothing noticed: this file's own first lesson, in a new place.

   It also skipped `waitSettled`, and that half is worse than it looks. The vision judge DOES read
   that screenshot (playtest_gate maps over rec.screens), so the eyes were handed the one frame
   guaranteed to be mid-flight — w34_eov_park_glide measured that card travelling 688px on desktop
   and 762px on tablet in 250ms.

   CHECKED STRUCTURALLY, NOT BY NAME: a screen enters the record through `rec.screens.push`, so the
   assertion is that there is exactly ONE such push and it lives inside the one function that
   settles and checks. That is rule 23 stated as an arithmetic fact — a SECOND push is a second
   capture path, whatever it is called, and no hand-kept list of branches has to be maintained. */
console.log("\nEvery screen the gate photographs is a screen it checked");
{
  const gateCode = gate.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/[^\n]*/g, "$1");
  /* "EXACTLY ONE PUSH" WAS THE FIRST DRAFT AND IT WAS TOO STRICT — the gate said so on its first
     run, which is the point of writing it before believing it. The crash handler pushes a screen
     too, and legitimately does NOT settle it: the page has just thrown, so waitSettled and MEASURE
     may not answer at all. What makes that one honest is that it records a REAL finding
     (`fails: [{ ok: false, rule: "run", … }]`), so it can never read as "checked, and clean".
     THE FAULT IS NOT A SECOND PUSH. It is a push that enters the record with NOTHING against it
     while standing outside the function that checks. That is the thing to count. */
  const pushArgs = [...gateCode.matchAll(/rec\.screens\.push\s*\(\s*\{([\s\S]{0,300}?)\}\s*\)/g)].map(m => m[1]);
  const settlerBody = (gateCode.match(/async function settleAndCheck\(([\s\S]*?)\n\}/) || [, ""])[1];
  const unchecked = pushArgs.filter(a => {
    if (settlerBody.includes(a)) return false;                    // the one that settles and checks
    return !/fails:\s*\[\s*\{/.test(a);                          // …or one that records a real finding
  });
  const inSettler = /async function settleAndCheck\([\s\S]*?rec\.screens\.push\s*\(/.test(gateCode);
  const settles   = /async function settleAndCheck\([\s\S]*?waitSettled\s*\(/.test(gateCode);
  const eovRoutes = /st\.over[\s\S]{0,400}?settleAndCheck\s*\(/.test(gateCode);
  unchecked.length === 0
    ? ok(`all ${pushArgs.length} screen record(s) either go through settleAndCheck or carry a real finding — none enters with nothing against it`)
    : bad(`${unchecked.length} screen(s) enter the record outside settleAndCheck with no finding against them — that reads as "checked, and clean" in every report (rule 23)`);
  inSettler ? ok("that path is inside settleAndCheck") : bad("the screen record is written outside settleAndCheck — the check and the record have come apart");
  settles   ? ok("settleAndCheck waits for the screen to stop moving before reading it") : bad("settleAndCheck no longer calls waitSettled — every screen would be judged mid-animation");
  eovRoutes ? ok("the End of Voyage branch routes through it, like every other screen") : bad("the End of Voyage branch no longer goes through settleAndCheck — that is exactly the fault this case was written for");
  /\bfails:\s*\[\]/.test(gateCode)
    ? bad("a screen is still recorded with a hardcoded empty `fails: []` — that reads as \"checked, and clean\" in every report and can never fail")
    : ok("no screen is recorded with a hardcoded empty findings list");
}

/* RED-PROOF. Each pattern must be able to say NO — proven against the code as it stood this
   morning, quoted verbatim from the commit that fixed it. */
{
  const before = `const f2 = OUT + "/" + tag + "-eov.png"; await c.shot(f2); rec.screens.push({ shot: f2, sig: "end of voyage", fails: [] });\n` +
                 `if (f) { rec.screens.push({ shot: fSettled, motionShot: f, fails }); }`;
  const crash  = `rec.screens.push({ shot: f, sig: "ERROR", fails: [{ ok: false, rule: "run", what: rec.error }] });`;
  const pick = src => [...src.matchAll(/rec\.screens\.push\s*\(\s*\{([\s\S]{0,300}?)\}\s*\)/g)].map(m => m[1]);
  /* goes RED on the pre-fix EOV push (nothing against it, no settler to be inside of) … */
  const redsOnBefore  = pick(before).filter(a => !/fails:\s*\[\s*\{/.test(a)).length >= 1;
  /* … and STAYS QUIET on the crash handler, which is outside the settler on purpose and honest. */
  const sparesCrash   = pick(crash).filter(a => !/fails:\s*\[\s*\{/.test(a)).length === 0;
  const noSettler = !/async function settleAndCheck\(/.test(before);
  const catchesLiteral = /\bfails:\s*\[\]/.test(before);
  redsOnBefore && sparesCrash && noSettler && catchesLiteral
    ? ok("red-proof: goes red on the pre-fix End of Voyage push and on a missing settler, and stays quiet on the crash handler, which is outside it on purpose")
    : bad(`red-proof FAILED (redOnBefore:${redsOnBefore} sparesCrash:${sparesCrash} noSettler:${noSettler} literal:${catchesLiteral}) — these cases may be unable to fail`);
}

console.log(fails ? `\nFAIL — ${fails}\n` : "\nPASS — the trial can no longer call a missing leg a pass, lose one out of the bottom of its own report, or photograph a screen it never checked\n");
process.exit(fails ? 1 : 0);
