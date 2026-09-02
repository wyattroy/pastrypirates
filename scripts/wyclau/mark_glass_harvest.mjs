#!/usr/bin/env node
// scripts/wyclau/mark_glass_harvest.mjs
//
// Run this immediately after READING the live Glass, passing the artifact version that read
// returned:
//
//     node scripts/wyclau/mark_glass_harvest.mjs --version=1788381450-c06f
//     node scripts/wyclau/mark_glass_harvest.mjs --version=<id> --ideas=i1788376035472,i178837... \
//                                                --rulings=<key>,<key>
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

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const WY = join(ROOT, ".planning", "wyclau");
const LAST_HARVEST = join(WY, "LAST-HARVEST");

const argOf = (name) => {
  const a = process.argv.slice(2).find((x) => x.startsWith(`--${name}=`));
  return a ? a.slice(name.length + 3).trim() : "";
};
const listOf = (name) => argOf(name).split(",").map((s) => s.trim()).filter(Boolean);

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

const receipt = {
  artifactVersion: version,
  harvestedAt: new Date().toISOString(),
  ideaIds: listOf("ideas"),
  rulingKeys: listOf("rulings"),
};

mkdirSync(WY, { recursive: true });
writeFileSync(LAST_HARVEST, `${JSON.stringify(receipt, null, 2)}\n`);

const carried = receipt.ideaIds.length + receipt.rulingKeys.length;
console.log(
  `LAST-HARVEST stamped ${receipt.harvestedAt} — artifact version ${version}` +
  (carried ? `, carrying ${receipt.ideaIds.length} idea(s) and ${receipt.rulingKeys.length} ruling(s)` : ", page held nothing new")
);
console.log("Before you publish: RE-READ the live page and compare its version to this one. Different means he wrote something — harvest again first. Never pass force.");
