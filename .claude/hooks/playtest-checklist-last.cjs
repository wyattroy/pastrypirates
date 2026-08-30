#!/usr/bin/env node
// .claude/hooks/playtest-checklist-last.cjs   —   fires on Stop
//
// IF THIS SESSION CHANGED THE GAME, WYATT NEEDS A CHECKLIST BEFORE IT ENDS.
//
// ============================================================================
//  Why this is a hook and not a rule
// ============================================================================
// Wyatt, 2026-08-27: "i want you to ALWAYS give me a checklist html in the format we designed
// before for me to use to write you comments and notes -- make me a new one, then add this as a
// hook at the end of sessions that require my eyes."
//
// ALWAYS is the word that makes it a hook. This repo already learned the general form twice — the
// mentor charter was skipped while loaded in context, and the QA gear was chosen by mood until
// qa-gear-first.cjs started denying the first edit. The standing sentence is: A PROMPT YOU ARE
// HOLDING IS A PROMPT YOU CAN SKIP. So the harness asks, not the model's memory.
//
// ============================================================================
//  What it actually checks
// ============================================================================
// 1. Did this branch change GAME CODE against origin/main? (shared definition — one place decides,
//    see lib/game-code.cjs and the day both copies of that rule were wrong at once.)
// 2. If so, is there a checklist in .planning/ that is NEWER than the newest game change?
// A checklist written before the last three fixes is a checklist that does not describe them.
//
// It BLOCKS rather than warns, because a warning at the end of a session is read by nobody: the
// session is over. Blocking gives the model one more turn to write the sheet.
// It fires ONCE per session — the same marker discipline qa-gear-first.cjs uses, so a session
// cannot be trapped in a loop by a hook it has already answered.
const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");
const { isGameCode } = require(path.join(__dirname, "lib", "game-code.cjs"));

function main() {
  let input;
  try { input = JSON.parse(fs.readFileSync(0, "utf8")); } catch { process.exit(0); }
  // A hook that re-fires on the turn it caused would loop forever.
  if (input.stop_hook_active) process.exit(0);

  const repo = process.env.CLAUDE_PROJECT_DIR || path.resolve(__dirname, "..", "..");
  const session = String(input.session_id || "nosession").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 64) || "nosession";
  const sh = (c) => { try { return execSync(c, { cwd: repo, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }); } catch { return ""; } };

  /* WHAT CHANGED, committed or not. origin/main is the shipped game, so this is "everything this
     branch would put in front of a player". Uncommitted work counts: a session that edits and does
     not commit still changed what staging would carry. */
  const changed = [
    ...sh("git diff --name-only origin/main...HEAD").split("\n"),
    ...sh("git diff --name-only").split("\n"),
    ...sh("git diff --name-only --cached").split("\n"),
  ].map((s) => s.trim()).filter(Boolean);
  const game = [...new Set(changed.filter(isGameCode))];
  if (!game.length) process.exit(0);                      // nothing a player could see

  const stateDir = path.join(repo, ".claude", "hooks", ".read-state", session);
  const marker = path.join(stateDir, "checklist-asked");
  if (fs.existsSync(marker)) process.exit(0);

  /* IS THERE A CHECKLIST NEWER THAN THE WORK? mtime, not existence — a sheet written before the
     last three fixes does not describe them, and handing Wyatt a stale sheet is worse than handing
     him none: he would test the wrong things and report them as passing. */
  const planning = path.join(repo, ".planning");
  const sheets = fs.existsSync(planning)
    ? fs.readdirSync(planning).filter((f) => /checklist.*\.html$/i.test(f))
        .map((f) => ({ f, m: fs.statSync(path.join(planning, f)).mtimeMs }))
    : [];
  const newestSheet = sheets.length ? Math.max(...sheets.map((s) => s.m)) : 0;
  const newestGame = Math.max(...game.map((f) => {
    try { return fs.statSync(path.join(repo, f)).mtimeMs; } catch { return 0; }
  }));
  if (newestSheet > newestGame) process.exit(0);          // a fresh sheet already exists

  try { fs.mkdirSync(stateDir, { recursive: true }); fs.writeFileSync(marker, new Date().toISOString()); } catch {}

  const list = game.slice(0, 8).join(", ") + (game.length > 8 ? `, +${game.length - 8} more` : "");
  const latest = sheets.length ? sheets.sort((a, b) => b.m - a.m)[0].f : "(none)";
  const reason =
`THIS BRANCH CHANGES THE GAME AND HAS NO CHECKLIST NEWER THAN THAT WORK.

(Wording corrected 2026-08-27: this said "THIS SESSION CHANGED THE GAME", which it cannot know. It
compares origin/main...HEAD — the whole BRANCH, across every session that touched it. A session that
changed only docs was told it had changed the game, which is the kind of false statement from an
instrument this project has been burned by repeatedly. What is true is the line above.)

  changed: ${list}
  newest checklist in .planning/: ${latest}${sheets.length ? " — older than the work above" : ""}

WRITE ONE, in the established format. Copy .planning/staging-checklist.html and replace the
header stamp, the localStorage KEY, and the DATA array. It must give him, per item:

  look   what to DO — a concrete action, in his words, not a feature name
  right  what SHOULD happen, so a difference is obvious without knowing the code
  why    the evidence — the measurement, or his own quote that earned it

AND THE PARTS THAT ARE NOT DECORATION:
  - Say which build to open, with the FULL stamp including @sha. He must be able to tell at a
    glance whether he is on the build you mean; a branch name alone is not a build identity.
  - PUBLISH TO STAGING FIRST, then write the sheet against what staging actually serves. A sheet
    describing your working tree while staging carries something older is how he tests the wrong
    build and reports it green.
  - Mark anything that is HIS DECISION rather than a defect, and say so in the item.
  - List what is ALREADY KNOWN so he does not spend his eyes re-finding it.

  - GIVE HIM A LINK HE CAN TAP ON A PHONE, AND IT MUST RENDER THE PAGE, NOT ITS SOURCE.
    Wyatt, 2026-08-30: "your html files must always be clickable for me to open on a phone --
    this link opens github and is useless. the whole point of the html is that i have no
    friction when giving you feedback."
    A REPO PATH IS NOT A DELIVERY. `.planning/foo.html` on a branch resolves, on a phone, to
    GitHub's SOURCE VIEW -- he gets `<!doctype html>` and a wall of CSS, and the sheet he was
    supposed to tap through is unusable. He sent a screenshot of exactly that. The friction the
    sheet exists to remove is the friction the delivery reintroduced.
    SO: publish it as an Artifact and put the https://claude.ai/code/artifact/... URL in the
    reply. That renders, it works on a phone, it is private to him, and he can comment straight
    back on it. Commit the file to `.planning/` as well -- that is the durable copy for the next
    session -- but THE LINK IS THE DELIVERABLE. Naming a file path and stopping there does not
    count as handing it over.

Then give him the LINK (and the file path beside it). Run again and this will not fire; it asks
once per session.`;

  process.stdout.write(JSON.stringify({ decision: "block", reason }));
  process.exit(0);
}
main();
