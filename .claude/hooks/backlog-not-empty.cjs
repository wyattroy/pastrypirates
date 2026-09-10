#!/usr/bin/env node
// .claude/hooks/backlog-not-empty.cjs   —   fires on Stop
//
// A SESSION DOES NOT END WHILE THERE IS WORK IT COULD STILL DO.
//
// ============================================================================
//  Why this is a hook and not a rule
// ============================================================================
// Wyatt, 2026-09-09, twice in one night:
//   "I am annoyed that you left work on the table without completing it. this is BAD CLAUDE. you
//    should ALWAYS complete ALL WORK THAT YOU CAN and if you have BLOCKING questions, write them
//    into a checklist artifact for me and MOVE ON WITH ALL OTHER WORK."
//   "why did you stop?? i thought i told you to never stop working until there was no more work
//    left to do! did you add that to claude.md? do you need to write a hook to check your own
//    backlog at the end of your sessions, which works on another task unless it is parked with
//    questions?"
//
// The rule WAS added to CLAUDE.md (the "Finish everything you can" paragraph). He asked the right
// follow-up anyway, and the answer is the standing sentence of this whole hooks directory:
// A PROMPT YOU ARE HOLDING IS A PROMPT YOU CAN SKIP. The mentor charter was skipped while loaded
// in full; the QA gear was chosen by mood until a hook denied the first edit. A rule about
// finishing work is exactly the kind that loses to a long day, so the harness asks, not the model.
//
// ============================================================================
//  What counts as "still open", and what does not
// ============================================================================
// It reads .planning/BACKLOG.md — the durable list, by his own instruction ("write all of these
// somewhere DURABLE") — and counts bullets that are:
//     · not struck through (~~like this~~)
//     · not marked DONE / ✅
//     · not PARKED ON HIM
//
// THAT LAST EXCLUSION IS THE WHOLE REASON THIS IS NOT A NAG. His question named it precisely —
// "unless it is parked with questions". An item waiting on a taste call of his is not work the
// session is refusing to do; it is work the session is not ALLOWED to do. Those are marked with
// BLOCKED ON A TASTE CALL / HIS CALL / PARKED and are counted separately, and reported as context
// rather than as a reason to keep going.
//
// It only reads the sections that carry his own playtest lists (the 🟠/🟡/🔵 headings this repo
// uses for them), so the long historical cutover backlog above them cannot hold a session open
// forever. A hook that can never be satisfied is a hook somebody disables.
//
// ============================================================================
//  It blocks ONCE
// ============================================================================
// stop_hook_active is honoured: if the model has already been sent back once and is stopping
// again, this lets it go. Blocking twice on the same list is how a hook becomes a loop, and the
// model has no way to argue with it — the correct escape is that a session may end with items
// open, having SAID so, once it has been asked and answered.

const fs = require("fs");
const path = require("path");

let input = "";
try { input = fs.readFileSync(0, "utf8"); } catch (e) { /* no stdin: run standalone */ }
let payload = {};
try { payload = JSON.parse(input || "{}"); } catch (e) { payload = {}; }
if (payload.stop_hook_active) process.exit(0);   // already asked once this stop — let it end

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const file = path.join(root, ".planning", "BACKLOG.md");
if (!fs.existsSync(file)) process.exit(0);

let md = "";
try { md = fs.readFileSync(file, "utf8"); } catch (e) { process.exit(0); }

/* ⚠ IT COUNTS CHECKBOXES, NOT BULLETS, AND THE FIRST VERSION OF THIS HOOK IS WHY. Matching every
   `- ` bullet under an emoji heading found SIXTY-FIVE "items" — most of them prose: "Brand collision
   is the whole game (high confidence)", "Where to start: boardBand() and capBandBottom()". A hook
   that reports 65 open tasks when there are eight is a hook nobody believes, and a hook nobody
   believes gets deleted. So the backlog now carries an explicit, machine-readable convention and
   this reads only that:
       - [ ] open   - [x] done   - [?] parked on WYATT   - [~] blocked on a MACHINE (a trial, a build)
   Prose stays prose. Anything that wants to hold a session open has to say so in one character. */
/* ⚠ AND IT READS ONLY WHAT IS FENCED. Two earlier versions of this hook cried wolf: matching every
   bullet under an emoji heading found 65 "items", most of them prose; matching every `- [ ]`
   checkbox found 30, because the historical cutover backlog uses checkboxes too. Both numbers were
   useless, and a hook nobody believes gets deleted.
   So the LIVE list is fenced, explicitly, and everything outside the fence is history:
       <!-- OPEN-WORK -->  … - [ ] open · - [x] done · - [?] parked on Wyatt …  <!-- /OPEN-WORK -->
   Anything that wants to hold a session open has to be inside the fence and say so in one
   character. Nothing can drift into it by accident. */
const fence = md.match(/<!--\s*OPEN-WORK\s*-->([\s\S]*?)<!--\s*\/OPEN-WORK\s*-->/);
const body = fence ? fence[1] : "";
/* ⚠ THREE STATES, NOT TWO, AND THE THIRD IS THE ONE THAT LET A SESSION STOP. `- [?]` means WYATT
   has to answer — genuinely not the session's problem. `- [~]` means a MACHINE has to answer: a sea
   trial, a build, a deploy. Those are not his and they are not permission to stop; they only block
   THAT item, and the session should be doing something else while the machine works. Collapsing
   them onto one marker is what made "waiting on a trial" read as "waiting on Wyatt". */
const OPEN  = /^\s*[-*]\s*\[ \]\s+(.+)$/;
const PARK  = /^\s*[-*]\s*\[\?\]\s+(.+)$/;
const BLOCK = /^\s*[-*]\s*\[~\]\s+(.+)$/;
const open = [], parked = [], blocked = [];
for (const raw of body.split("\n")) {
  let m = raw.match(OPEN);
  if (m) { open.push(m[1].replace(/[*_`~]/g, "").trim()); continue; }
  m = raw.match(PARK);
  if (m) { parked.push(m[1].replace(/[*_`~]/g, "").trim()); continue; }
  m = raw.match(BLOCK);
  if (m) blocked.push(m[1].replace(/[*_`~]/g, "").trim());
}

/* ⭐ AN EMPTY FENCE IS NOT AN EMPTY BACKLOG — Wyatt, 2026-09-09: "why did i need to ask you this?
   how can you create a system for yourself that will cause you to automatically ask yourself that,
   and then do it?"
   ⚠ HE HAD TO ASK BECAUSE THE FIRST VERSION OF THIS HOOK STOPPED AT THE FENCE. The live list held
   two items, both waiting on a sea trial, so it let the session end — while a crash that kills CREW
   voyages, and a doc CLAUDE.md tells the next session to read FIRST that has been wrong for two
   days, sat untouched in the sections above. "Nothing live" is not "nothing to do", and a hook that
   confuses them is a hook that gives permission to stop.
   SO WHEN THE FENCE IS EMPTY OR ENTIRELY BLOCKED, IT ESCALATES rather than releasing: it names the
   🔴 sections of the wider backlog and asks for a reason, not a reminder. The exit is unchanged and
   still honest — say which and why, and you may stop — but it has to be SAID. */
const redSections = [...md.matchAll(/^##\s+🔴\s+(.+)$/gm)].map(m => m[1].replace(/[*_`~]/g, "").trim());
if (!open.length) {
  if (!redSections.length) {
    if (parked.length || blocked.length) console.error(`Backlog: nothing left you can do. ${parked.length} parked on Wyatt, ${blocked.length} waiting on a machine — say so in your reply.`);
    process.exit(0);
  }
  const shortR = t => (t.length > 84 ? t.slice(0, 81) + "…" : t);
  console.error(
`The live list has nothing OPEN${parked.length ? ` (${parked.length} parked on Wyatt` : ""}${blocked.length ? `${parked.length ? ", " : " ("}${blocked.length} waiting on a machine` : ""}${parked.length||blocked.length ? ")" : ""} — but the backlog still carries ${redSections.length} 🔴 section(s):

${redSections.slice(0, 6).map(t => "  · " + shortR(t)).join("\n")}

An empty fence is not an empty backlog. Pick one, or say plainly which of these you are NOT doing
and why. ⚠ "WAITING ON A TRIAL" COVERS THE FENCED ITEMS, NOT THESE — a machine working is not a
reason for you to be idle.`);
  process.exit(2);
}

const short = s => (s.length > 96 ? s.slice(0, 93) + "…" : s);
const list = open.slice(0, 8).map(s => "  · " + short(s)).join("\n");
const more = open.length > 8 ? `\n  …and ${open.length - 8} more` : "";
const parkedNote = parked.length
  ? `\n\n${parked.length} further item(s) are PARKED ON HIM and are not your problem — name them in your reply and move on.`
  : "";

console.error(
`.planning/BACKLOG.md still lists ${open.length} item(s) you could be doing:

${list}${more}${parkedNote}

His rule, in CLAUDE.md: "Finish everything you can, and never hand back a list you could have
shortened." A question only blocks the item it is about. Do the next one, or — if every remaining
item genuinely needs him — say which and why, and you may stop.`);
process.exit(2);
