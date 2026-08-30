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

  /* WHAT *THIS SESSION* CHANGED — not what the branch contains.
     ────────────────────────────────────────────────────────────────────────────────────────────
     THIS IS THE SECOND ATTEMPT AT THIS TEST AND THE FIRST ONE WAS WRONG TWICE.

     It used to be `git diff --name-only origin/main...HEAD` — the whole branch, every session that
     ever touched it. On 2026-08-27 that produced a false demand and somebody CORRECTED THE WORDING
     rather than the trigger: the message started saying "THIS BRANCH" instead of "THIS SESSION",
     which made it honest about being wrong and left it wrong. On 2026-08-30 it fired again on a
     session that had changed ZERO lines of game code — the 17 game files were another session's,
     merged in so the sea trial could be rebuilt on the current game — and a sheet describing that
     other session's work reached Wyatt. His words: "that's duplicative and confusing."

     TWO TESTS NOW, and the second is what makes the first safe to be wrong:

       1. SESSION SCOPE. session-base.cjs stamps HEAD at SessionStart; the range is base..HEAD.
          Exact, and a merge cannot inflate it.
       2. OWNERSHIP. Whatever the range, a game file whose last change here sits on ANOTHER remote
          branch was written by another session and is theirs to describe. This holds even with no
          base stamped, which is why a missing stamp degrades the test instead of breaking it.

     Uncommitted work always counts as ours: nobody else could have written it. */
  const base = (() => {
    try { return fs.readFileSync(path.join(repo, ".claude", "hooks", ".read-state", session, "session-base"), "utf8").trim(); }
    catch { return ""; }
  })();
  const range = /^[0-9a-f]{7,40}$/.test(base) && sh(`git cat-file -e ${base}^{commit} && echo ok`).trim()
    ? `${base}..HEAD` : "origin/main...HEAD";

  const dirty = [
    ...sh("git diff --name-only").split("\n"),
    ...sh("git diff --name-only --cached").split("\n"),
  ].map((s) => s.trim()).filter(Boolean);
  const committed = sh(`git diff --name-only ${range}`).split("\n").map((s) => s.trim()).filter(Boolean);

  const ours = new Set(dirty);                            // uncommitted is ours by definition
  const mine = sh("git rev-parse --abbrev-ref --symbolic-full-name @{u}").trim();
  const foreign = new Map();                              // file -> the branch that owns it
  for (const f of committed) {
    if (ours.has(f)) continue;
    const sha = sh(`git log -1 --format=%H ${range} -- "${f}"`).trim();
    if (!sha) { ours.add(f); continue; }
    /* Which OTHER published branches carry the commit that last touched this file? If any does,
       that work was pushed by somebody else and this session merely has it in its history. */
    const owners = sh(`git branch -r --contains ${sha}`).split("\n")
      .map((s) => s.trim().replace(/^\*\s*/, ""))
      .filter((b) => b && !b.includes("->") && b !== mine);
    if (owners.length) foreign.set(f, owners[0]); else ours.add(f);
  }

  const game = [...ours].filter(isGameCode);
  const notMine = [...foreign.keys()].filter(isGameCode);
  if (!game.length) {
    /* NOTHING A PLAYER COULD SEE, FROM THIS SESSION. Silence is the correct output — but say so on
       stderr when game code IS present and belongs elsewhere, so the next reader of a transcript
       can tell "this hook decided not to fire" from "this hook never ran". */
    if (notMine.length) process.stderr.write(
      `[checklist hook] ${notMine.length} game file(s) changed on this branch, none by this session ` +
      `(${notMine.slice(0, 3).join(", ")}${notMine.length > 3 ? ", …" : ""} — from ${foreign.get(notMine[0])}). ` +
      `No sheet asked for: that work belongs to the session that wrote it.\n`);
    process.exit(0);
  }

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
  /* HOW OLD IS THE WORK — BY COMMIT TIME, NOT FILE MTIME.
     mtime is when the file was last WRITTEN TO DISK, and a merge or a checkout rewrites it. On
     2026-08-30, merging another branch stamped every game file with the merge time (src/ui/stage.js
     read 03:47:16, nine seconds before the merge commit), so every game file was newer than every
     checklist that had ever existed — and no sheet could ever have satisfied this hook again on
     that branch. A staleness test that a merge can reset is not a staleness test.
     Uncommitted work has no commit time, so it falls back to mtime, which is correct there: it
     really was just written. */
  const newestGame = Math.max(...game.map((f) => {
    const t = sh(`git log -1 --format=%ct ${range} -- "${f}"`).trim();
    if (t && !dirty.includes(f)) return +t * 1000;
    try { return fs.statSync(path.join(repo, f)).mtimeMs; } catch { return 0; }
  }));
  if (newestSheet > newestGame) process.exit(0);          // a fresh sheet already exists

  try { fs.mkdirSync(stateDir, { recursive: true }); fs.writeFileSync(marker, new Date().toISOString()); } catch {}

  const list = game.slice(0, 8).join(", ") + (game.length > 8 ? `, +${game.length - 8} more` : "");
  const latest = sheets.length ? sheets.sort((a, b) => b.m - a.m)[0].f : "(none)";
  const reason =
`THIS SESSION CHANGED GAME CODE, AND THERE IS NO CHECKLIST NEWER THAN THAT WORK.

It really is yours: the range is this session's own start commit to HEAD, and any file whose last
change here is already published on another branch has been excluded as that session's to describe.
(Before 2026-08-30 this compared the whole BRANCH and demanded sheets for other sessions' merged-in
work. If you believe the list below is not yours, that is a bug in this hook worth fixing, not a
sheet worth writing.)

  changed by this session: ${list}${notMine.length ? `\n  (excluded, not yours: ${notMine.length} file(s) from ${foreign.get(notMine[0])})` : ""}
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
    A REPO PATH IS NOT A DELIVERY. .planning/foo.html on a branch resolves, on a phone, to
    GitHub's SOURCE VIEW -- he gets a doctype and a wall of CSS, and the sheet he was
    supposed to tap through is unusable. He sent a screenshot of exactly that. The friction the
    sheet exists to remove is the friction the delivery reintroduced.
    SO: publish it as an Artifact and put the https://claude.ai/code/artifact/... URL in the
    reply. That renders, it works on a phone, it is private to him, and he can comment straight
    back on it. Commit the file to .planning/ as well -- that is the durable copy for the next
    session -- but THE LINK IS THE DELIVERABLE. Naming a file path and stopping there does not
    count as handing it over.

Then give him the LINK (and the file path beside it). Run again and this will not fire; it asks
once per session.`;

  process.stdout.write(JSON.stringify({ decision: "block", reason }));
  process.exit(0);
}
main();
