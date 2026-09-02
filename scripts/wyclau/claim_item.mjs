#!/usr/bin/env node
/* claim_item.mjs — the CLAIM half of the record, written the way the CLOSE already is.
 *
 * WYATT, 2026-09-02T16:1xZ: "what is being worked on RIGHT NOW? that needs to be visible just
 * underneath the emoji status."
 *
 * WHY THIS SCRIPT EXISTS RATHER THAN A REGEX OVER THE LEDGER, and it is measured rather than
 * argued. The first build of his ask parsed `### WATCH … — claims \`X\`` out of `.planning/
 * CTO-LEDGER.md`. Counted on the real file: **40 WATCH headings, and exactly 4 carry that shape —
 * all four written in the last two hours.** The rest are free prose by whoever was on watch:
 * "— situation and claim", "— DID NOT CLOSE ITS ITEM, DELIBERATELY", one with no date at all. And
 * nothing prescribes a shape: the Door says only "Claim it in the ledger." **A regex over that
 * would have shown him nothing this morning**, and gone silent again the first time somebody worded
 * a heading differently. (Spec: `.planning/SPEC-WHAT-IS-IN-HAND.md`, CEO-approved with changes.)
 *
 * So: the close is machine-written and durable (`close_item.mjs` appends a fixed line), and now the
 * claim is too. The ledger stays the human narrative it is good at instead of being asked to be a
 * database.
 *
 *   node scripts/wyclau/claim_item.mjs --item="T-088 — his five Glass asks" [--stale=90]
 *   node scripts/wyclau/claim_item.mjs --release        # nothing in hand (close_item does this too)
 *
 * MACHINE-LOCAL, exactly like LONG-RUN: `.planning/wyclau/IN-HAND`, gitignored. It reaches the
 * branch only by being summarized into `.planning/wyclau/status/<hostname>.md` by
 * publish_status.mjs — because a committed claim file would tell every other machine that IT is
 * working on something.
 *
 * IT DECLARES ITS OWN STALENESS, like LONG-RUN, so the page needs no new constant. The default is
 * 90 minutes, and the reason is on the record rather than invented: rings were measured 40, 60, 50
 * and 30 minutes apart on 2026-09-02, and a watch may end without closing — twice that day,
 * deliberately. So an hour-and-a-half-old claim is a watch that is gone, and the page says COLD
 * rather than pretending somebody is at work.
 */
"use strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const argv = process.argv.slice(2);
const arg = (name) => {
  const hit = argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : null;
};
const dirArg = arg("dir");
const repo = dirArg ? path.resolve(dirArg) : process.cwd();
const OUT = path.join(repo, ".planning", "wyclau", "IN-HAND");

if (argv.includes("--release")) {
  try { fs.rmSync(OUT); } catch { /* already gone — releasing twice is not an error */ }
  console.log("released — nothing in hand on this machine");
  process.exit(0);
}

const item = arg("item");
if (!item) {
  console.error("claim_item: --item=\"<handle> — <what it is>\" is required.");
  console.error("A claim nobody can read is the thing this replaces; refusing rather than writing a blank one.");
  process.exit(1);
}
const stale = Number(arg("stale") ?? 90);
if (!(stale > 0)) { console.error(`claim_item: --stale must be a positive number of minutes, got "${arg("stale")}"`); process.exit(1); }

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({
  item,
  watch: os.hostname(),
  claimedAt: new Date().toISOString(),
  staleAfterMinutes: stale,
}, null, 2) + "\n");
console.log(`in hand: ${item} — run publish_status.mjs and commit the status file so his page can see it`);
