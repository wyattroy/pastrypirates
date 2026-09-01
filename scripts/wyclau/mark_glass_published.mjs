#!/usr/bin/env node
// VENDORED FROM claude-kit (plugins/wyclau) — edit THERE, not here. Re-vendor: `bash install.sh vendor <repo> wyclau` from claude-kit. Drift is caught by scripts/qa/vendor_check.mjs.
// scripts/wyclau/mark_glass_published.mjs
//
// Run this immediately after the Artifact tool call that publishes the Glass succeeds, passing the
// version that call returned:
//
//     node scripts/wyclau/mark_glass_published.mjs --version=1788301109-8c5c
//
// A plain node script cannot call the Artifact tool itself (only a live session can), so this
// records that a publish REALLY happened.
//
// ⚠ WHY IT DEMANDS A VERSION — earned 2026-09-01, and it is rule 6's failure in its purest form.
// This script used to take NO arguments, verify NOTHING, and write "Glass published"
// unconditionally. So anything that ran it stamped a publish, including a `claude -p` watch, which
// on the Blade has no Artifact tool and therefore cannot publish at all (settled behaviourally
// that night: ToolSearch("select:Artifact") and ToolSearch("+artifact") both returned no matching
// deferred tools, and the print session's own prompt listed subagent tools as "All tools except
// Agent, Artifact, ArtifactComments..."). The stamp could only ever say one thing, which is what
// CLAUDE.md means by "a measurement that cannot fail is not a measurement".
//
// WHAT IT COST, so nobody softens this back: on the night it was found, a session read this file
// twice and reported it to Wyatt as fact — once as evidence of when the Glass had last been
// published, once as the baseline of a polling watch it had armed. Neither reading was safe, and
// neither was flagged as unsafe, because the file looks authoritative.
//
// WHAT THIS DOES AND DOES NOT BUY. It does NOT make forgery impossible; a determined caller can
// invent a string. It converts a SILENT honour system into an EXPLICIT claim that names a
// checkable artifact version — the stamp stops being an assertion and becomes a receipt somebody
// can hold against the live page. That is the whole of the improvement, and overstating it here
// would be the same class of error the file is being fixed for.
//
// DELIBERATELY NOT DONE: no attempt to contact the artifact and confirm the version is real. This
// is a plain node script; it cannot reach the Artifact tool. A check that pretended to verify
// something it cannot reach would be the instrument failure this fix exists to end.
//
// LAST-PUBLISH is local and gitignored, same as HEARTBEAT — per-machine by nature. NOTE (verified
// 2026-09-01): no CODE currently reads it. The publish-lag brake it was written to feed,
// wyclau-stop-keep-working.cjs, was deleted in claude-kit commit 2dd722c (the Watch redesign) and
// exists in neither repo nor in settings.json. It is kept because SESSIONS read it and act on it,
// which is precisely why it must not be able to lie to them.

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const WY = join(ROOT, ".planning", "wyclau");
const LAST_PUBLISH = join(WY, "LAST-PUBLISH");

const arg = process.argv.slice(2).find((a) => a.startsWith("--version="));
const version = arg ? arg.slice("--version=".length).trim() : "";

if (!version) {
  console.error(`REFUSING TO STAMP — no publish to record.

This file is a RECEIPT for a publish that happened, not a note that one was intended.
Stamping it without one tells the next reader (a session, or Wyatt) that the Glass is
current when it may not be, and nothing downstream can tell the difference.

Pass the version the Artifact publish call returned:

  node scripts/wyclau/mark_glass_published.mjs --version=<id>

If you have no version id, you have not published. Publish first:
  1. READ the live page and harvest any ideas/rulings into .planning/CHART.md
  2. node scripts/wyclau/glass.mjs --note "..."
  3. publish .planning/wyclau/glass.html with the Artifact tool
  4. then run this, with the version that call returned.

If you have no Artifact tool at all -- a 'claude -p' watch on some machines does not --
then you cannot publish and must not stamp. Write what you wanted shown into
.planning/wyclau/GLASS-NOTE.md and commit it; the next session that CAN publish folds it in.`);
  process.exit(1);
}

const nowIso = new Date().toISOString();
mkdirSync(WY, { recursive: true });
writeFileSync(LAST_PUBLISH, `${nowIso}\tGlass published\tversion=${version}\n`);
console.log(`LAST-PUBLISH stamped ${nowIso} (artifact version ${version})`);
