#!/usr/bin/env node
// scripts/wyclau/retire_answered.mjs
//
// RECORDING WYATT'S ANSWER AND RETIRING HIS QUESTION ARE ONE ACT. This script is that act.
//
//     node scripts/wyclau/retire_answered.mjs --qid=<id> --verdict="<his words, verbatim>"
//     node scripts/wyclau/retire_answered.mjs --list          # what is asking him, with ids
//
// ⚠ WHY IT EXISTS, IN HIS WORDS, 2026-09-02 6:57 PM ET — the sixth instance in twelve hours:
//
//     "the page continues to re-show me thw e questions AFTER they're harvested. this is NOT fixed
//      and it is a PRIORITY more than any of the SEO work"
//
// and, the time he photographed it: "I already answered both of these about 15 minutes ago. Please
// tell me why the page still shows them, and is still asking me to answer them again."
//
// NOTHING HE DID WAS WRONG AND NOTHING WAS LOST. He typed his answers into his page, the page saved
// them, the harvest read them, and they reached the record. **Every step worked except the one that
// removes the question**, because harvesting WRITES the ruling and DELETES NOTHING — so the row goes
// on rendering in the Glass's Your Call card and the page goes on asking. Two acts joined by a
// session remembering the second one is the shape `.claude/CLAUDE.md` rule 23 forbids by name.
//
// THE HARVEST OF 22:5xZ IS THE PROOF THAT A RUNBOOK STEP IS NOT ENOUGH. Its own commit says "all
// five rules-page questions in the Your Call table above are now answered" — and it left all five
// asking, because its mandate was harvest-and-publish. **It detected the exact condition and had no
// authority to act on it.** This script is that authority, in one command.
//
// THE SHAPE IS `close_item.mjs`'s, deliberately: that script writes the tick, the ledger entry and
// the INBOX fate together so they cannot disagree. This one writes the RULED row and the deletion
// together for the same reason. One file write, so a crash cannot leave half of it done.
//
// WHAT IT DELIBERATELY DOES NOT DO: invent the verdict. His words plus a session's summary are not
// derivable from anything on disk, so `--verdict` is required and is written verbatim. The
// atomicity this buys is over the two EDITS, which is where the drift was — not over the sentence.
//
// AND IT DOES NOT COMMIT. Three sessions have shared this checkout today and one lost another's work
// to a `git add -A`; a script that commits on its own behalf inside somebody else's staging area is
// how that happens again. It prints the commit line and lets the caller run it.

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { section, tableRows, questionId, stripQid, QID_RE } from "./lib/chart_model.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const CHART = join(ROOT, ".planning", "CHART.md");

const argOf = (name) => {
  const a = process.argv.slice(2).find((x) => x.startsWith(`--${name}=`));
  return a ? a.slice(name.length + 3) : "";
};
const has = (name) => process.argv.slice(2).includes(`--${name}`);

const chart = readFileSync(CHART, "utf8");
const blockedText = section(chart, "BLOCKED ON WYATT") ?? "";
const rows = tableRows(blockedText).map((r) => ({
  raw: r.raw,
  cell: r.cells[0],
  ...questionId(r.cells[0]),
}));

if (has("list") || (!argOf("qid") && !argOf("verdict"))) {
  if (!rows.length) {
    console.log("Nothing is asking him — `## BLOCKED ON WYATT` is empty.");
  } else {
    console.log(`${rows.length} question(s) asking him right now:\n`);
    for (const r of rows) {
      console.log(`  --qid=${r.id}${r.explicit ? "" : "   (derived from the prose — this row has no <!--qid:…--> marker)"}`);
      console.log(`      ${stripQid(r.cell).replace(/\*\*/g, "").slice(0, 110)}\n`);
    }
  }
  if (!has("list")) {
    console.error(`
REFUSING — retiring a question needs both halves of the one act:

  node scripts/wyclau/retire_answered.mjs --qid=<id> --verdict="<his words, verbatim>"

--verdict is his answer as he wrote it, plus where it is recorded. It is written into the Chart's
## RULED table with the "now" cell left empty (untriaged, per that table's own three-move process),
and the question row is deleted in the SAME write. Never do one without the other: that is the fault
this replaces, and he has reported it six times.`);
    process.exit(1);
  }
  process.exit(0);
}

const qid = argOf("qid").trim().toLowerCase();
const verdict = argOf("verdict").trim();

if (!qid) { console.error("REFUSING — --qid=<id> is required. Run with --list to see what is asking him."); process.exit(1); }
if (!verdict) { console.error("REFUSING — --verdict=\"<his words>\" is required. A question retired with no answer on record is his words deleted, which is strictly worse than the bug."); process.exit(1); }

const target = rows.find((r) => r.id === qid);
if (!target) {
  console.error(`REFUSING — no live question in \`## BLOCKED ON WYATT\` has the id "${qid}".`);
  console.error(rows.length
    ? `\nWhat IS asking him:\n${rows.map((r) => `  ${r.id}`).join("\n")}\n\nRun with --list for the full text of each.`
    : "\nThat section is empty — nothing is asking him at all.");
  /* ⚠ THIS REFUSES RATHER THAN SHRUGS ON PURPOSE. A no-op that exits 0 tells the caller the
     retirement happened. The whole class of fault being fixed here is "the record says it was done
     and his page still asks", so a silent success is this bug wearing a different hat. */
  process.exit(1);
}

/* ⚠ THE ID GOES INTO THE RULED ROW, AND THAT IS WHAT MAKES THE GATE WORK ON EVERY MACHINE.
   `.planning/wyclau/LAST-HARVEST` is the exact receipt of what the harvest read, and it is
   gitignored — machine-local by nature, absent on a fresh clone. Stamping the qid onto the row we
   write puts the answered-set in git, so `answered_question_retired_check.mjs` can tell a question
   he has answered from one he has not on any machine, forever. */
const ruledRow = `| <!--qid:${qid}--> ${stripQid(target.cell)} | ${verdict} | |`;

const ruledText = section(chart, "RULED") ?? "";
const headerRule = ruledText.split("\n").findIndex((l) => /^\|[\s:|-]+$/.test(l.trim()));
if (headerRule < 0) { console.error("REFUSING — could not find the `|---|` header rule under `## RULED` in CHART.md, so there is no safe place to add the row. Fix the table by hand and run again."); process.exit(1); }

/* ONE `writeFileSync`, TWO EDITS. The deletion and the addition are computed against the same
   in-memory string and land together or not at all — a crash between them is not reachable. */
let next = chart.replace(ruledText, ruledText.split("\n")
  .flatMap((l, i) => (i === headerRule ? [l, ruledRow] : [l])).join("\n"));
const before = next;
next = next.split("\n").filter((l) => l !== target.raw).join("\n");
if (next === before) { console.error(`REFUSING — the question row was found by the parser but its exact line could not be removed. Nothing was written. The row: ${target.raw.slice(0, 90)}…`); process.exit(1); }

writeFileSync(CHART, next);

console.log(`RETIRED "${qid}" — one act, both halves:
  · added to \`## RULED\` with the "now" cell empty (untriaged, per that table's three-move process)
  · DELETED from \`## BLOCKED ON WYATT\`, so his page stops asking

Verify, then commit both halves together:
  node scripts/qa/answered_question_retired_check.mjs
  node scripts/qa/rulings_triage_check.mjs
  git add .planning/CHART.md && git commit

⚠ AND THE RECORD BEING FIXED IS NOT THE SAME EVENT AS HIS PAGE BEING FIXED. The row is gone from
CHART.md; the Glass still shows the old question until it is REGENERATED AND REPUBLISHED. That
happened once already — rows retired at 6:26 PM, his page still reading "Your call (2)" afterwards.
From where he sits, a fix he cannot see is identical to nothing having happened.`);
