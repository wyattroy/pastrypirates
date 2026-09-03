#!/usr/bin/env node
// scripts/wyclau/mark_glass_harvest.mjs
//
// Run this immediately after READING the live Glass, passing the artifact version that read
// returned:
//
//     node scripts/wyclau/mark_glass_harvest.mjs --version=1788381450-c06f
//     node scripts/wyclau/mark_glass_harvest.mjs --version=<id> --ideas=i1788376035472,i178837... \
//                                                --rulings=<key>,<key>
//     node scripts/wyclau/mark_glass_harvest.mjs --version=<id> \
//                                                --retire=<qid>::<his words, verbatim>   (repeatable)
//
// ⚑ AND IT IS THE THING THAT RETIRES HIS ANSWERED QUESTIONS — 2026-09-03, `T-090` gap (a).
//
// HIS WORDS, THE SIXTH TIME IN TWELVE HOURS: "the page continues to re-show me thw e questions AFTER
// they're harvested. this is NOT fixed and it is a PRIORITY more than any of the SEO work."
//
// `retire_answered.mjs` was built to end that and CEO 125 found the hole in it: **nothing called
// it.** The spec asks for retirement "run by the harvest… not a session following a runbook step",
// and what shipped was a command a session types. The 22:5xZ harvest is the proof that is not
// enough — its own commit says "all five rules-page questions in the Your Call table above are now
// answered" and it left all five asking.
//
// THIS FILE IS THE CALLER, AND IT WAS ALWAYS THE RIGHT ONE. It is the one command a harvest cannot
// skip (the runbook requires it, a hook requires it, a gate reads its receipt), and it is already
// handed the exact ids he ruled under in `--rulings=`. So it now does two things nothing else did:
//
//   · `--retire=<qid>::<verdict>` retires the question IN THE SAME ACT that writes the receipt; and
//   · a `--rulings=` key whose question is STILL LIVE and carries no verdict is REFUSED.
//
// The refusal is the half that matters. A capability the caller may skip is a runbook step wearing a
// flag, and a runbook step is exactly what failed six times.
//
// ⚠ WHY THIS FILE EXISTS — WYATT'S OWN SENTENCE, AND IT IS THE WHOLE DESIGN (2026-09-02, `T-105`):
//
//     "the harvest stamp records when a session looked. It is not evidence the page hasn't changed
//      since. Your page carries its own version number — that's the fact that can answer 'is a
//      republish safe?', and a clock never can."
//
// Until today `.planning/wyclau/LAST-HARVEST` was a bare ISO timestamp and the only thing that read
// it read its MTIME. A publish was allowed if some session had looked at the page within thirty
// minutes — at anything, for any reason, with any result.
//
// WHAT THAT COST, MEASURED, NOT IMAGINED. 2026-09-02: the Glass tick harvested at 3:07:08 PM and
// correctly found zero ideas. Wyatt's first idea landed at 3:07:15 PM — SEVEN SECONDS LATER — and
// six more followed. From that moment the stamp read "fresh" for half an hour, and any republish in
// that window would have regenerated the page from disk and dropped all seven. They survived by
// luck of ordering. Nothing in the system could have told the difference.
//
// A RECEIPT ANSWERS A QUESTION A CLOCK CANNOT EVEN ASK. `artifactVersion` is the version that was
// actually read. Immediately before publishing, a session re-reads the live page and compares: same
// version -> nothing has changed under you, publish. Different -> he wrote something, harvest again
// first. That comparison is the only honest answer to "is a republish safe?", and it needs an
// identity to make it.
//
// DELIBERATELY NOT DONE, and this is the same line `mark_glass_published.mjs` draws: no attempt to
// contact the artifact and confirm the version is real. This is a plain node script and cannot
// reach the Artifact tool. A check that pretended to verify something it cannot reach would be the
// instrument failure this whole fix exists to end. What this buys is that the stamp stops being an
// assertion about a clock and becomes a receipt somebody can hold against the live page.
//
// LAST-HARVEST is gitignored — machine-local by nature, like LAST-PUBLISH and HEARTBEAT.

import { writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { liveQuestions, retireQuestion } from "./lib/retire.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const WY = join(ROOT, ".planning", "wyclau");
const LAST_HARVEST = join(WY, "LAST-HARVEST");
const CHART = join(ROOT, ".planning", "CHART.md");

const argOf = (name) => {
  const a = process.argv.slice(2).find((x) => x.startsWith(`--${name}=`));
  return a ? a.slice(name.length + 3).trim() : "";
};
const listOf = (name) => argOf(name).split(",").map((s) => s.trim()).filter(Boolean);
/* `--retire=` is the one REPEATABLE flag here, because a tick often carries several of his answers.
   `argOf` takes the first match by design; this takes them all. */
const allOf = (name) => process.argv.slice(2).filter((x) => x.startsWith(`--${name}=`)).map((x) => x.slice(name.length + 3));

const version = argOf("version");

if (!version) {
  console.error(`REFUSING TO STAMP — no harvest to record.

This file is a RECEIPT for a page you actually read, and it must name WHICH VERSION you read.
A stamp that records only the time tells the next reader you looked, and nothing about what was
there — so it cannot answer the one question that matters before a republish: has he written
something since?

Pass the artifact version the read returned:

  node scripts/wyclau/mark_glass_harvest.mjs --version=<id>

If you have no version id, you have not read the live page. Read it first:

  Artifact  action:"read"  url:"https://claude.ai/code/artifact/74034bde-ad7e-4861-913e-d5d190801af2"

then move every glassState.ideas AND glassState.rulings entry into .planning/CHART.md
verbatim, commit, and stamp with the version that read returned.`);
  process.exit(1);
}

/* ═══ THE RETIREMENT — computed BEFORE anything is written, so a refusal leaves the tree exactly as
   it found it. Half a harvest is worse than none: a Chart edited with no receipt, or a receipt
   claiming a retirement that did not happen, are both records that lie, and this whole item exists
   because the record and his page disagreed. */
let chart = null;
try { chart = readFileSync(CHART, "utf8"); } catch { /* no Chart here — say so only if it is needed */ }

const retireArgs = allOf("retire").map((spec) => {
  const at = spec.indexOf("::");
  return at < 0
    ? { qid: spec.trim(), verdict: "", malformed: true }
    : { qid: spec.slice(0, at).trim().toLowerCase(), verdict: spec.slice(at + 2), malformed: false };
});

const retiredIds = [];
if (retireArgs.length) {
  if (chart === null) {
    console.error(`REFUSING — --retire= was given but ${CHART} could not be read, so there is no question to retire and no way to record his answer. Nothing was written.`);
    process.exit(1);
  }
  for (const r of retireArgs) {
    if (r.malformed) {
      console.error(`REFUSING — --retire=${r.qid} has no "::". The form is --retire=<qid>::<his words, verbatim>. Nothing was written.`);
      process.exit(1);
    }
    const result = retireQuestion(chart, r.qid, r.verdict);
    if (!result.ok) {
      console.error(`REFUSING — ${result.error}`);
      console.error(result.live.length
        ? `\nWhat IS asking him:\n${result.live.map((id) => `  ${id}`).join("\n")}`
        : "\n`## BLOCKED ON WYATT` is empty — nothing is asking him at all.");
      console.error("\nNothing was written: not the Chart, not the receipt. Fix the id and run the whole harvest stamp again.");
      process.exit(1);
    }
    chart = result.next;      // each retirement is applied to the running text; ONE write at the end
    retiredIds.push(r.qid);
  }
}

/* ⚑ THE REFUSAL, AND IT IS THE HALF THAT MAKES THIS MECHANICAL. A key in `--rulings=` names a
   question he has ANSWERED. If that question is still a live row in `## BLOCKED ON WYATT` and no
   verdict came with it, then this harvest is about to record his answer and leave his page asking —
   the exact thing he has now reported six times. Refuse, and say which question and how. */
if (chart !== null) {
  const stillAsking = new Set(liveQuestions(chart).map((q) => q.id));
  const unretired = listOf("rulings").map((k) => k.toLowerCase()).filter((k) => stillAsking.has(k) && !retiredIds.includes(k));
  if (unretired.length) {
    console.error(`REFUSING TO STAMP — ${unretired.length} question(s) he has ANSWERED are still asking him.

You are recording a harvest that read his ruling on ${unretired.map((k) => `"${k}"`).join(", ")}, and ${unretired.length === 1 ? "that question is" : "those questions are"} still a live row in \`## BLOCKED ON WYATT\`. Stamping now files the receipt and leaves his page asking a question he has already answered — six times in twelve hours, in his words: "the page continues to re-show me thw e questions AFTER they're harvested."

Retire ${unretired.length === 1 ? "it" : "them"} in the SAME act as this stamp:

${unretired.map((k) => `  --retire=${k}::<his words, verbatim>`).join("\n")}

so the whole command reads:

  node scripts/wyclau/mark_glass_harvest.mjs --version=${version} \\
${unretired.map((k) => `    --retire=${k}::"<his words>"`).join(" \\\n")}

Nothing was written.`);
    process.exit(1);
  }
}

const receipt = {
  artifactVersion: version,
  harvestedAt: new Date().toISOString(),
  ideaIds: listOf("ideas"),
  /* DERIVED, NOT RE-TYPED. A question retired by this run WAS a ruling this harvest carried, so the
     caller never has to name it twice — and the receipt cannot disagree with what was retired. */
  rulingKeys: [...new Set([...listOf("rulings").map((k) => k.toLowerCase()), ...retiredIds])],
};

mkdirSync(WY, { recursive: true });
/* THE CHART FIRST, THEN THE RECEIPT. If the second write fails, the retirement is on disk and
   unrecorded — recoverable, and visible in `git status`. The other order would leave a receipt
   claiming a retirement that never happened, which is a record that lies. */
if (retiredIds.length) writeFileSync(CHART, chart);
writeFileSync(LAST_HARVEST, `${JSON.stringify(receipt, null, 2)}\n`);

if (retiredIds.length) {
  console.log(`RETIRED ${retiredIds.length} answered question(s) in the same act as this stamp: ${retiredIds.join(", ")}
  · his words added to \`## RULED\` with the "now" cell empty (untriaged, per that table's three-move process)
  · the rows DELETED from \`## BLOCKED ON WYATT\`, so his page stops asking`);
}

const carried = receipt.ideaIds.length + receipt.rulingKeys.length;
console.log(
  `LAST-HARVEST stamped ${receipt.harvestedAt} — artifact version ${version}` +
  (carried ? `, carrying ${receipt.ideaIds.length} idea(s) and ${receipt.rulingKeys.length} ruling(s)` : ", page held nothing new")
);
console.log("Before you publish: RE-READ the live page and compare its version to this one. Different means he wrote something — harvest again first. Never pass force.");
