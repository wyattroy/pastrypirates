#!/usr/bin/env node
// .claude/hooks/parked-work-is-mine.cjs   —   fires on Stop
//
// PARKING IS A CLASSIFICATION, AND I GET IT WRONG IN ONE DIRECTION.
//
// ============================================================================
//  What happened, 2026-09-10
// ============================================================================
// A CEO review found two faults in the recipe picker. I wrote both into
// .planning/BACKLOG.md as prose, told Wyatt they were "written down rather than left in a commit
// message", and stopped. His reply:
//
//   "why did you not just fix them?? why are you telling me, instead of doing the work? you are
//    violating claude.md"
//
// He was right, and the reason is worth being precise about, because "try harder" does not fix it.
// BOTH ITEMS WERE MECHANISM. One was "does the picture's inset track the ingredient icons across
// the card widths" — a browser answers that. The other was "does the back card protrude" — a
// browser answers that too, and when I finally ran it the answer contradicted the argument I had
// written down instead. Neither was ever his to decide.
//
// THE MIS-CLASSIFICATION IS ALWAYS THE SAME SHAPE: I was uncertain, and I filed uncertainty under
// "his call". But uncertainty about a MEASUREMENT is not uncertainty about TASTE. The test is one
// line and it has no judgement in it:
//
//        Could running something answer this?  Then it is MINE.
//        Only he can answer it?                Then it is HIS.
//
// The tell is in the text I write while parking. Both notes that day contained an instruction to
// measure — "Measure the icon inset across the desktop --rcW range first, then derive" and "it
// wants checking on a real screen". **A parked item that tells someone to go and measure is a
// to-do I wrote for myself and did not do.**
//
// ============================================================================
//  Why a hook and not a rule
// ============================================================================
// The rule already existed. CLAUDE.md has said "complete ALL WORK THAT YOU CAN" since 2026-09-09,
// and I had read it that morning. Wyatt's own finding, 2026-08-24: "A prompt you are holding is a
// prompt you can skip." So this does not add a sentence; it adds a thing the harness runs.
//
// It also closes a hole in the hook that already exists. backlog-not-empty.cjs reads the LIVE LIST
// — `- [ ]` open, `- [?]` parked on Wyatt, `- [~]` waiting on a machine — and blocks a stop while
// open work remains. It never fired that day, and it was right not to: **I had written prose.**
// Prose in the backlog is invisible to it. So the second half of this hook is simply: work you
// decline to do goes on the list, in the shape the list is read in, or nothing can ever see it.
//
// ============================================================================
//  What it does
// ============================================================================
// On Stop, it looks at what THIS SESSION added to .planning/BACKLOG.md (from the sha stamped by
// session-base.cjs, plus the working tree) and blocks if either is true:
//
//   A.  A new `- [?]` (parked on Wyatt) item whose own words say a measurement would settle it.
//       Satisfy it by measuring, or by writing `CANNOT MEASURE: <reason>` in the same item — which
//       is a real answer ("his laptop is dying" was, that same afternoon) and forces the
//       classification to be made out loud instead of by drift.
//
//   B.  New prose that declares something undone — NOT DONE, not started, "wants checking" — with
//       no live-list item anywhere in the added lines. That is the exact shape of the 2026-09-10
//       failure: a careful write-up of work, filed where nothing reads it.
//
// It never blocks twice for the same stop (stop_hook_active), never blocks on a session with no
// base sha, and never blocks on someone else's backlog edits.
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

/* Exported for the test beside this file. Pure: text in, findings out — the decision lives here
   rather than inside the git plumbing, so it can be red-proofed without a repo. */
function findings(addedLines) {
  const added = addedLines.filter((l) => l.trim());
  const joined = added.join("\n");

  /* A measurement verb IN AN IMPERATIVE. "measured at 29" is a result and must not trip this;
     "measure it first" is a to-do. The difference is the tense, so match the bare stem and the
     phrases that ask for a look, never the past participle. */
  const ASKS_FOR_A_MEASUREMENT = new RegExp(
    // an imperative: "measure X first / then / before / across", never "was measured at 29"
    "(?:^|[.:*_\\s])(?:measure|re-measure|remeasure)\\b[^.]{0,120}?\\b(?:first|then|before|across)\\b"
    + "|\\bneeds? measuring\\b"
    + "|\\bwants? (?:checking|measuring)\\b"
    + "|\\bcheck(?:ing)? (?:it )?on a real (?:screen|device)\\b"
    + "|\\bverify (?:this|it|that) (?:first|before)\\b", "i");
  const EXCUSED = /\bCANNOT MEASURE:/;

  const PARKED_ITEM = /^\s*[-*]\s*\[\?\]\s+(.+)$/;
  const ANY_ITEM = /^\s*[-*]\s*\[[ ?~]\]\s+/;
  const DECLARES_UNDONE =
    /\bNOT DONE\b|\bNOT ACTED\b|\bnot started\b|\bnot yet (?:done|started|fixed)\b|\bstill (?:open|to do)\b|\bparked\b/i;

  const out = [];

  // A — parked on Wyatt, but the item itself asks for a measurement
  for (const line of added) {
    const m = line.replace(/^\+/, "").match(PARKED_ITEM);
    if (!m) continue;
    if (!ASKS_FOR_A_MEASUREMENT.test(m[1])) continue;
    if (EXCUSED.test(m[1])) continue;
    out.push({ kind: "parked-but-measurable", text: m[1].replace(/[*_`~]/g, "").trim().slice(0, 150) });
  }

  /* B — prose that hands somebody a MEASUREMENT to take, with no live-list item added anywhere.
     ⚠ IT DOES NOT ALSO REQUIRE THE WORDS "NOT DONE", and that is the correction the test forced.
     The second of the two notes that day never declared anything undone — it simply said "Measure
     the icon inset across the desktop range first, then derive" and stopped. Requiring both
     signals let the exact case that prompted this hook walk straight through it. An instruction to
     go and measure, filed where no list can see it, IS the failure on its own. */
  const anyItemAdded = added.some((l) => ANY_ITEM.test(l.replace(/^\+/, "")));
  if (!anyItemAdded && ASKS_FOR_A_MEASUREMENT.test(joined) && !EXCUSED.test(joined)) {
    const line = added.find((l) => DECLARES_UNDONE.test(l) || ASKS_FOR_A_MEASUREMENT.test(l)) || "";
    out.push({ kind: "prose-only", text: line.replace(/^\+/, "").replace(/[*_`~#]/g, "").trim().slice(0, 150) });
  }
  return out;
}

function main() {
  let input = {};
  try { input = JSON.parse(fs.readFileSync(0, "utf8")); } catch {}
  if (input.stop_hook_active) process.exit(0);   // already blocked once this stop — say it once

  const repo = process.env.CLAUDE_PROJECT_DIR || path.resolve(__dirname, "..", "..");
  const session = String(input.session_id || "nosession").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 64) || "nosession";
  const baseFile = path.join(repo, ".claude", "hooks", ".read-state", session, "session-base");
  if (!fs.existsSync(baseFile)) process.exit(0);          // unknown start — never guess
  const base = fs.readFileSync(baseFile, "utf8").trim();
  if (!/^[0-9a-f]{7,40}$/.test(base)) process.exit(0);

  let diff = "";
  try {
    diff = execSync(`git diff ${base} -- .planning/BACKLOG.md`,
      { cwd: repo, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 8 << 20 });
  } catch { process.exit(0); }                            // no git, no base, nothing to say

  const added = diff.split("\n").filter((l) => l.startsWith("+") && !l.startsWith("+++")).map((l) => l.slice(1));
  if (!added.length) process.exit(0);

  const hits = findings(added);
  if (!hits.length) process.exit(0);

  const park = hits.filter((h) => h.kind === "parked-but-measurable");
  const prose = hits.filter((h) => h.kind === "prose-only");
  const lines = [];
  lines.push("PARKED WORK THAT LOOKS LIKE YOURS — check the classification before ye stop.\n");
  lines.push("  Could running something answer it?  -> it is YOURS. Go and run it.");
  lines.push("  Only Wyatt can answer it?           -> it is HIS. Leave it parked.\n");
  for (const h of park) {
    lines.push(`  [?] parked on Wyatt, but it asks for a measurement:\n      ${h.text}`);
  }
  for (const h of prose) {
    lines.push(`  Written as PROSE, so the live list cannot see it and neither can any hook:\n      ${h.text}`);
    lines.push("      Put it on the list — [ ] yours, [?] his, [~] waiting on a machine.");
  }
  lines.push("\n  2026-09-10: two CEO findings were filed like this and handed back. Wyatt:");
  lines.push('  "why did you not just fix them?? why are you telling me, instead of doing the work?"');
  lines.push("  Both were mechanism. One measurement contradicted the argument written in its place.\n");
  lines.push("  If it genuinely cannot be measured NOW — his machine is struggling, the thing needs a");
  lines.push("  real device — say so IN the item: `CANNOT MEASURE: <reason>`. That is a real answer;");
  lines.push("  drifting into [?] is not.");
  console.error(lines.join("\n"));
  process.exit(2);
}

if (require.main === module) main();
module.exports = { findings };
