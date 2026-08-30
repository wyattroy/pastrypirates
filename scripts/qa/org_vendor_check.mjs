#!/usr/bin/env node
/* org_vendor_check.mjs — has the vendored organisation been edited in place?
 *
 * WHY THIS GATE EXISTS. Wyatt, 2026-08-30: "i need our new organization to work both in cloud and
 * local sessions, and be consistent across both." His ruling was VENDOR EVERYWHERE — the repo
 * carries the officers and the crew, and a local session reads the same copy a cloud container
 * does. One copy per repo instead of a plugin on the laptop and a copy in the cloud, which would
 * be two things kept in step by hand: the exact fault this project spent 2026-08-30 removing from
 * the game engine.
 *
 * ONE COPY IS ONLY ONE COPY IF NOBODY EDITS IT. The failure that actually happens is not exotic:
 * a session finds a bug in a vendored file, fixes it there because that is where it is looking,
 * and the repo and claude-kit silently diverge. Nothing fails, nothing warns, and the next vendor
 * run overwrites the fix.
 *
 * ⚠ WHAT THIS GATE CAN AND CANNOT SEE — and it says so in its own output, because an instrument
 * that reports a result without saying what it touched is this project's oldest recurring fault:
 *
 *   CAN see:    a vendored file EDITED, DELETED or ADDED inside this repo, by comparing every
 *               file against the sha256 recorded when it was vendored.
 *   CANNOT see: claude-kit moving FORWARD. That needs both trees, and a cloud container has only
 *               this one. `bash claude-kit/install.sh check <repo>` is the command that answers
 *               it, and it can only run where both exist.
 *
 * So a PASS here means "nobody has edited the copy", NOT "this copy is current". The two are
 * different claims and the gate must never let the first stand in for the second.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const DST = path.join(REPO, ".claude", "org");
const MANIFEST = path.join(DST, "MANIFEST.sha256");
const STAMP = path.join(DST, "VENDORED-FROM");

const fail = [];
const note = [];

if (!fs.existsSync(DST)) {
  // NOT AN ERROR. A repo may legitimately not use the organisation; saying "PASS" would be a
  // silent skip, and saying "FAIL" would force every repo to carry it. Say what is true.
  console.log("org vendor check — NOT APPLICABLE: no .claude/org/ in this repo (nothing vendored)");
  process.exit(0);
}
if (!fs.existsSync(MANIFEST)) {
  console.log("org vendor check\n\n  FAIL  .claude/org/ exists but MANIFEST.sha256 does not.");
  console.log("        A vendored copy with no manifest cannot be checked at all — re-run");
  console.log("        `bash <claude-kit>/install.sh vendor " + REPO + "`.");
  process.exit(1);
}

const rows = fs.readFileSync(MANIFEST, "utf8").split("\n").filter(Boolean).map(l => {
  const i = l.indexOf("  ");
  return { hash: l.slice(0, i), rel: l.slice(i + 2) };
});

const sha = f => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");

for (const r of rows) {
  const abs = path.join(REPO, r.rel);
  if (!fs.existsSync(abs)) { fail.push(`DELETED since vendoring: ${r.rel}`); continue; }
  if (sha(abs) !== r.hash) fail.push(`EDITED IN PLACE: ${r.rel}`);
}

/* ADDED files count too — BUT ONLY THE ONES THE KIT OWNS, and getting that wrong is instructive.
   The first version flagged every file in .claude/agents/ that was not in the manifest, and its own
   red-proof immediately condemned 34 pre-existing GSD role cards that belong to this repo and have
   nothing to do with the kit. That is the fault this project keeps paying for, committed inside the
   gate written to prevent it: AN INSTRUMENT WHOSE SUBJECT IS WIDER THAN THE THING IT IS CHECKING.
   The prefix below is DERIVED from the manifest's own agent filenames rather than typed, so it
   cannot fall out of step with what the kit actually vendors. */
const kitAgents = rows.map(r => r.rel).filter(r => r.startsWith(".claude/agents/"));
const prefix = (() => {
  const names = kitAgents.map(r => path.posix.basename(r));
  if (!names.length) return null;
  let p = names[0];
  for (const n of names) { while (p && !n.startsWith(p)) p = p.slice(0, -1); }
  return p && p.length >= 3 ? p : null;   // too short a prefix would over-reach again
})();
const known = new Set(rows.map(r => r.rel));
const agentsDir = path.join(REPO, ".claude", "agents");
if (prefix && fs.existsSync(agentsDir)) {
  for (const f of fs.readdirSync(agentsDir)) {
    if (!f.startsWith(prefix)) continue;                       // not the kit's — not this gate's business
    const rel = path.posix.join(".claude", "agents", f);
    if (!known.has(rel)) fail.push(`LOOKS LIKE A KIT ROLE CARD BUT IS NOT FROM THE KIT (lost on the next vendor): ${rel}`);
  }
  note.push(`only files named ${prefix}* in .claude/agents/ are this gate's business; ${fs.readdirSync(agentsDir).filter(f=>!f.startsWith(prefix)).length} other agent(s) there are the repo's own and were not examined`);
}

const stampLine = fs.existsSync(STAMP)
  ? (fs.readFileSync(STAMP, "utf8").split("\n")[0] || "").trim()
  : "(no VENDORED-FROM stamp)";

console.log("org vendor check — is the vendored organisation unedited?\n");
console.log(`  vendored from: ${stampLine}`);
console.log(`  files checked: ${rows.length}`);
  for (const n of note) console.log(`  scope: ${n}`);
  console.log("");

if (fail.length) {
  for (const f of fail) console.log(`  FAIL  ${f}`);
  console.log("\n  Edit these in claude-kit, never here, then re-vendor. If the change was");
  console.log("  deliberate and belongs to this repo alone, it does not belong in .claude/org/.");
  console.log("\nFAILED — the vendored organisation has been changed inside this repo.");
  process.exit(1);
}

console.log(`  PASS  all ${rows.length} vendored file(s) match the hash recorded when they were vendored`);
console.log("\n  NOT CHECKED, and only a machine holding claude-kit can: whether the KIT has moved");
console.log("  forward since. Run `bash <claude-kit>/install.sh check " + REPO + "` there.");
console.log("\nPASSED — nobody has edited the copy. That is not the same as it being current.");
