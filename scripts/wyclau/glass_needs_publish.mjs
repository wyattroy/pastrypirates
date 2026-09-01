#!/usr/bin/env node
// VENDORED FROM claude-kit (plugins/wyclau) — edit THERE, not here. Re-vendor: `bash install.sh vendor <repo> wyclau` from claude-kit. Drift is caught by scripts/qa/vendor_check.mjs.
// scripts/wyclau/glass_needs_publish.mjs
//
//     node scripts/wyclau/glass_needs_publish.mjs
//       exit 0  -> PUBLISH        something moved; go through the full publish loop
//       exit 10 -> NOTHING-MOVED  no input changed since the last publish; end the tick silently
//
// ⚠ THE TICK IS NOT THE FAULT. ACTING UNCONDITIONALLY IS.
//
// Wyatt, 2026-09-01: "i think it violates past learnings in multiple ways regarding timers", and a
// CEO audit upheld him. bell.ps1 records that the previous watchdog's judgement stack -- heartbeat
// freshness, activity recency, the commit clock -- "guessed wrong in both directions ... and is
// DELETED, not tuned", replaced by one question the OS answers truthfully. The Bell kept its 10
// minute tick through that redesign and was right to. What it does NOT do is act every time it
// fires: it asks the process table a truthful question first and usually does nothing.
//
// This is that shape for the Glass. TICK OFTEN, ACT RARELY.
//
// MEASURED, NOT ASSERTED, the night this was written. Three autonomous ticks published at 22:32:20Z,
// 22:48:00Z and 23:03:01Z. The newest commit across all refs was 22:46:11Z at the second AND the
// third; GLASS-NOTE.md had not moved since 21:50Z. The third publish carried nothing new. Overnight,
// when nothing lands, essentially all 96 daily ticks are that one.
//
// AND IT IS NOT MERELY WASTE. glass.mjs records that a republish without harvesting first DELETES
// what Wyatt typed on the page, and that two publishers on one cadence made the platform's own
// conflict guard fire three times in five minutes. A clock multiplies the unattended chances to hit
// both faults; a change-gate removes almost all of them.
//
// ⚠⚠ THIS SCRIPT CANNOT SEE THE LIVE PAGE, AND MUST NEVER BE USED TO SKIP THE HARVEST.
// Ideas and rulings Wyatt types live ONLY in the published artifact until a session copies them into
// the record, and only a session holding the Artifact tool can read them. This script sees git and
// the local note file. So the runbook order is: READ THE LIVE PAGE AND HARVEST FIRST, ALWAYS, then
// ask this. If the page held ideas, that is itself a reason to publish and this script's answer is
// irrelevant. A check that quietly caused his words to go unharvested would be far worse than the
// waste it exists to remove.
//
// EVERY DOUBT RESOLVES TO PUBLISH -- the same discipline longRunStatus() uses in reverse. A missing
// stamp, an unparseable one, a git that will not answer, an unreadable note file: all PUBLISH. A
// broken input must never be able to SUPPRESS a publish, because the failure mode of a missed
// publish is Wyatt reading a frozen page, which is the bug this whole subsystem exists to prevent.

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const WY = join(ROOT, ".planning", "wyclau");

const say = (verdict, why) => {
  console.log(`${verdict} — ${why}`);
  process.exit(verdict === "PUBLISH" ? 0 : 10);
};

// The newest commit reachable in this clone across ALL refs — the same quantity glass.mjs uses for
// "last progress", so the page and this gate can never disagree about what counts as work landing.
let head = null;
try {
  head = execFileSync("git", ["-C", ROOT, "log", "-1", "--format=%H", "--all"], { encoding: "utf8" }).trim();
} catch {
  say("PUBLISH", "git would not answer what the newest commit is, so this cannot tell — publishing rather than guessing");
}
if (!head) say("PUBLISH", "git named no commit at all, so this cannot tell — publishing rather than guessing");

// A note queued for Wyatt is a reason to publish on its own: it exists precisely because the session
// that wrote it could not publish, and it reaches him no other way.
let noteQueued = false;
try {
  const body = readFileSync(join(WY, "GLASS-NOTE.md"), "utf8");
  const after = body.split(/^---$/m).slice(1).join("---").trim();
  noteQueued = after.length > 0;
} catch {
  say("PUBLISH", "GLASS-NOTE.md could not be read, so a note may be waiting for him — publishing rather than guessing");
}
if (noteQueued) say("PUBLISH", "a note is queued in GLASS-NOTE.md and reaches him no other way");

// What the last publish actually recorded. mark_glass_published.mjs writes `commit=<sha>` beside the
// version; a stamp without one predates this mechanism and cannot be compared against.
let stamped = null;
try {
  const line = readFileSync(join(WY, "LAST-PUBLISH"), "utf8");
  stamped = (line.match(/commit=([0-9a-f]{7,40})/) || [])[1] ?? null;
} catch {
  say("PUBLISH", "no LAST-PUBLISH stamp on this machine — nothing has been published from here yet");
}
if (!stamped) say("PUBLISH", "the last stamp records no commit, so there is nothing to compare against");

if (!head.startsWith(stamped) && !stamped.startsWith(head)) {
  say("PUBLISH", `work landed since the last publish (${stamped.slice(0, 7)} -> ${head.slice(0, 7)})`);
}

say("NOTHING-MOVED", `no commit has landed since ${stamped.slice(0, 7)} and no note is queued — the page already says this`);
