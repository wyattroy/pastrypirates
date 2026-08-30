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
//
// ============================================================================
//  A SHEET HE CANNOT TAP IS A SHEET THAT DOES NOT EXIST
// ============================================================================
// Wyatt, 2026-08-30: "your html files must always be clickable for me to open on a phone -- this
// link opens github and is useless. the whole point of the html is that i have no friction when
// giving you feedback."
//
// The last line of this hook used to read "Then hand him the file path." A session did exactly
// that, and what he tapped was GitHub's SOURCE VIEW of the file: a syntax-highlighted listing of
// the CSS, on a phone, with no checkboxes and no notes boxes. Every requirement below was met and
// the deliverable was still worthless, because a repo path is not a page.
//
// SO THE SHEET IS PUBLISHED AND HE IS GIVEN A URL, and the file is written in the shape that can
// be published: NO <!doctype>, <html>, <head> or <body> of its own -- the host supplies those --
// so the file begins with <title> and <style>. The check below enforces the SHAPE, which is the
// part a hook can see; the wording enforces the rest. A wrapped file cannot be published at all,
// which is why that one is worth blocking on.
//
// ============================================================================
//  AND TELL HIM HOW TO GET THERE -- PER ITEM
// ============================================================================
// Wyatt, 2026-08-30, asking for this rule: "whenever a checklist item asks me to test a specific
// part of the game, the item must tell me HOW to jump straight to that part. I don't remember the
// flags, and I shouldn't have to play a whole voyage to reach the thing you changed."
//
// THE EVIDENCE IS THE REQUEST ITSELF, and it is better than any argument for the rule. He asked
// for it while misremembering the bake-off shortcut as "?bakeoff2=1". THAT FLAG DOES NOT EXIST.
// The real one is ?ovens=1 -- and its own comment in src/shared/index.js says a whole voyage to
// reach the ovens is "16-odd days, and the thing being tested at the end of it takes ninety
// seconds". HE BUILT THAT SHORTCUT HIMSELF AND COULD NOT RECALL ITS NAME. If the person who
// commissioned it cannot remember it, no sheet may assume he will.
//
// THE FLAG LIST IS DELIBERATELY NOT IN THIS FILE. A hand-kept list of flags rots exactly the way
// everything else this file warns about rots, and it would rot in the one place a session goes
// looking for the truth. The bullet points at the grep instead.
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
  /* A FRESH SHEET IS NOT ENOUGH -- IT MUST BE PUBLISHABLE. The Artifact host wraps the file in its
     own <!doctype>/<head>/<body>, so a file carrying its own document wrapper cannot be published,
     and an unpublishable sheet is one he can only reach as source on GitHub. That is the whole
     2026-08-30 failure. The check reads the file rather than trusting a name. */
  const sheetsByAge = sheets.slice().sort((a, b) => b.m - a.m);
  const freshest = sheetsByAge[0];
  if (newestSheet > newestGame) {
    let head = "";
    try { head = fs.readFileSync(path.join(planning, freshest.f), "utf8").slice(0, 2000); } catch {}
    /* NOT ANCHORED TO THE START OF THE FILE, and that is the correction. The first version tested
       /^\s*<!doctype/ — so a single HTML comment, or anything else, ahead of the doctype defeated
       it and the sheet sailed through unpublishable. CEO review 30 found it by constructing exactly
       that file and watching the check pass. One character of regex, and it was the check's only
       job. It now looks for the wrapper tags ANYWHERE in the opening 2000 bytes, which is where a
       document wrapper lives and where a legitimate sheet has only <title> and the top of <style>. */
    if (!/<!doctype|<html[\s>]|<head[\s>]|<body[\s>]/i.test(head)) process.exit(0);   // fresh AND publishable
    try { fs.mkdirSync(stateDir, { recursive: true }); fs.writeFileSync(marker, new Date().toISOString()); } catch {}
    process.stdout.write(JSON.stringify({ decision: "block", reason:
`.planning/${freshest.f} IS FRESH BUT CANNOT BE PUBLISHED, so he can only reach it as source on
GitHub -- a syntax-highlighted listing of the CSS, on a phone, with no checkboxes. That is the
exact thing he called useless on 2026-08-30.

STRIP ITS DOCUMENT WRAPPER: delete the <!doctype>, <html>, <head>, the two <meta> tags and the
<body>/</body>/</html> tags. The file must BEGIN with <title> and <style>; the Artifact host
supplies the charset, the viewport and the document around it.

THEN PUBLISH IT and give him the https:// link -- not the path, not the GitHub URL.` }));
    process.exit(0);
  }

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
  - GIVE HIM THE EXACT URL THAT LANDS ON THE THING, PER ITEM. Not once at the top -- different
    items need different entry points, so the URL belongs in the item, beside what to do.
    Never a feature name, and never "start a game and play until you reach it".
    READ THE CURRENT FLAGS FROM SOURCE rather than reciting them: grep -rn "location.search" src/
    Half of them also ride on devHost(), so they are dead on the production domain -- check that
    too before writing one into a sheet.
    IF THE STATE AN ITEM NEEDS HAS NO ENTRY POINT AT ALL, BUILD ONE in the same change. His eyes
    are the scarcest thing in this project; spending them on sixteen days of sailing to reach a
    ninety-second bake-off is the waste this bullet exists to stop.
    WHY IT IS NOT DECORATION: a half-remembered flag loads a URL that silently does NOTHING --
    no error, no hint -- so he plays the default path, sees the old behaviour, and reports the
    item green. That is the stale-sheet failure arriving by a different road.
  - Mark anything that is HIS DECISION rather than a defect, and say so in the item.
  - List what is ALREADY KNOWN so he does not spend his eyes re-finding it.

  - WRITE IT WITH NO DOCUMENT WRAPPER: no <!doctype>, <html>, <head> or <body> of its own. The
    file starts with <title> then <style>. This is not style -- it is what makes the file
    publishable, and a file that cannot be published is a file he can only read as source.

  - THEN PUBLISH IT AND HAND HIM THE LINK, NOT THE PATH.
    Wyatt, 2026-08-30: "your html files must always be clickable for me to open on a phone --
    this link opens github and is useless. the whole point of the html is that i have no
    friction when giving you feedback."
    A repo path and a GitHub blob URL are the SAME failure: both show him the CSS, not the
    checklist. He sent a screenshot of exactly that -- a syntax-highlighted listing on a phone,
    no checkboxes, no notes boxes. Every requirement above was met and the sheet was still
    worthless.
    So: publish it with the Artifact tool and put the https:// URL it returns in the reply he
    reads. Commit the file to .planning/ as well -- that is the durable copy for the next
    session -- but THE LINK IS THE DELIVERABLE. Naming a path and stopping there does not count
    as handing it over.

Then give him the LINK (and the file path beside it). Run again and this will not fire; it asks
once per session.`;

  process.stdout.write(JSON.stringify({ decision: "block", reason }));
  process.exit(0);
}
main();
