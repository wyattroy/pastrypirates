#!/usr/bin/env node
/* Precision test for playtest-checklist-last.cjs — THE OWNERSHIP HALF.
 *
 * ============================================================================
 *  Why this file exists, and why it did not before
 * ============================================================================
 * That hook has now billed the wrong session THREE times — 2026-08-27, 2026-08-30 and
 * 2026-09-12 — and each repair was verified by running the hook once and watching it go quiet.
 * That is not a proof. A hook that has gone quiet by mistake ALSO goes quiet.
 *
 * The 2026-09-12 CEO review made the point exactly: it re-ran the PRE-FIX hook beside the fixed
 * one and got byte-identical output, so the "proven both ways" in that commit message had tested
 * code that was already there. One command — `git show <sha>^:<hook> > /tmp/old.cjs` — would have
 * shown it. This file is that command, made permanent and made a table.
 *
 * ============================================================================
 *  What it tests, and what it deliberately does not
 * ============================================================================
 * ONLY the question "whose work is this?". Not the freshness test, not the publishable-shape test.
 * Ownership is the half that has been wrong three times, and it is the half where BOTH failures
 * hurt: a false positive demands a playtest sheet for somebody else's work and Wyatt gets a sheet
 * describing things this session cannot verify; a false negative lets real game changes reach him
 * with no sheet at all, which is the failure the hook exists to prevent.
 *
 * Every scenario is built in a THROWAWAY repo under the system temp directory, never in this one.
 * `isGameCode` still resolves from the real hooks directory, which is correct — one definition of
 * "is this the game", as `lib/game-code.cjs` says.
 *
 * Run: node .claude/hooks/playtest-checklist-last.test.cjs
 */
const { execSync, execFileSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const HOOK = path.join(__dirname, "playtest-checklist-last.cjs");
const GAME = "src/ui/board.js";          // game code by lib/game-code.cjs
const DOC  = "docs/notes.md";            // never game code, wherever it lives

let failures = 0;

/* ---------------------------------------------------------------------------
   A throwaway repo, shaped like this one: `main` carrying the game's history and
   published as `origin/main`, and a side branch that has been away for a while.
   The published ref is created with update-ref rather than a real remote, because
   what the hook reads is refs/remotes — it never talks to a server.
--------------------------------------------------------------------------- */
function repo(build) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "checklist-hook-"));
  const git = (cmd) => execSync(`git ${cmd}`, { cwd: dir, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  const write = (rel, text) => {
    fs.mkdirSync(path.join(dir, path.dirname(rel)), { recursive: true });
    fs.writeFileSync(path.join(dir, rel), text);
  };

  git("init -q");
  git("symbolic-ref HEAD refs/heads/main");
  git('config user.email "t@t"'); git('config user.name "t"'); git("config commit.gpgsign false");
  /* THE THROWAWAY REPO PINS THE GIT SETTINGS THAT COULD CHANGE THE ANSWER. A test should measure
     the HOOK, not the computer it runs on, and these four are the ones that can quietly rewrite what
     `git diff` sees.

     ⚠ THIS IS HARDENING, NOT THE FIX for the cross-machine split — I thought it was and I was wrong,
     so it is written down rather than left as a plausible story. This suite is green on the Mac and
     3 FAILED on Wy-Blade at the same sha (2026-09-12), every failure an expected-SILENT that
     BLOCKed: uniformly too eager, nothing over-permissive. I tested `core.autocrlf` by forcing
     Windows' defaults here — `autocrlf true`, `eol crlf` — and the Mac stayed 7/7 green. Dead
     hypothesis. Wy-Blade had already killed three others by measuring: the sitemap exclusion, the
     path separators, and the reflog format.

     WHAT IS STILL UNEXPLAINED, for whoever picks this up: run with --verbose on the machine that
     goes red. It prints the hook's own words and the fixture's git state per scenario, which is the
     thing the harness was throwing away. */
  git("config core.autocrlf false"); git("config core.eol lf");
  git("config core.filemode false"); git("config core.safecrlf false");

  // main: the game's own history. Four commits so a "last change" exists well before any branch.
  write(GAME, "export function drawBoard(){ return 1; }\n");
  write(DOC, "# notes\n");
  write(".planning/keep.txt", "no checklist here — so any ours-game-code answer blocks\n");
  git("add -A"); git('commit -q -m "the game"');
  write(GAME, "export function drawBoard(){ return 2; }\n");
  git("add -A"); git('commit -q -m "the game moves on"');
  const mainTip = git("rev-parse HEAD").trim();
  git(`update-ref refs/remotes/origin/main ${mainTip}`);

  const ctx = { dir, git, write, mainTip, GAME, DOC };
  build(ctx);
  return ctx;
}

/* Run the hook exactly as the harness does, and report only what the harness sees. */
function run(dir, base) {
  const session = "hooktest";
  const stateDir = path.join(dir, ".claude", "hooks", ".read-state", session);
  fs.mkdirSync(stateDir, { recursive: true });
  if (base) fs.writeFileSync(path.join(stateDir, "session-base"), base);
  let out = "";
  try {
    const r = execFileSync("node", [HOOK], {
      cwd: dir, encoding: "utf8",
      env: { ...process.env, CLAUDE_PROJECT_DIR: dir },
      input: JSON.stringify({ session_id: session }),
      stdio: ["pipe", "pipe", "pipe"],
    });
    out = r; run.lastErr = "";
  } catch (e) { out = (e.stdout || "") + ""; run.lastErr = (e.stderr || "") + ""; }
  run.lastOut = out;                       // --verbose prints this; the harness used to drop it
  let blocked = false;
  try { blocked = JSON.parse(out.trim() || "{}").decision === "block"; } catch { blocked = false; }
  return blocked;
}

const VERBOSE = process.argv.includes("--verbose");

function check(name, expectBlock, build) {
  const ctx = repo(build);
  const { dir, base } = ctx;
  const got = run(dir, base);
  ctx.hookSaid = run.lastOut;
  ctx.hookShouted = run.lastErr || "";
  /* ⛔ THE INSTRUMENT MUST BE ABLE TO REPORT ITS OWN FAILURE — 2026-09-12, Wy-Blade's lesson, and
     the reason a dead reflog survived for weeks: a broken git call and a git call that legitimately
     found nothing looked identical from here. A verdict reached with a dead command is not a pass,
     however right the answer happens to be. Four rows on Windows were green for exactly that
     reason. */
  if (/GIT [A-Z ]*FAILED/.test(ctx.hookShouted)) {
    failures++;
    console.log(`  FAIL  instrument  ${name}\n        ${ctx.hookShouted.trim().split("\n")[0]}`);
    fs.rmSync(dir, { recursive: true, force: true });
    return;
  }
  if (VERBOSE) {
    const g = (cmd) => { try { return execSync(`git ${cmd}`, { cwd: dir, encoding: "utf8" }).trim(); } catch (e) { return "(" + (e.message || "failed").split("\n")[0] + ")"; } };
    console.log(`\n  ── ${name}`);
    console.log(`     git            ${g("--version")}`);
    console.log(`     autocrlf=${g("config --get core.autocrlf") || "(unset)"} eol=${g("config --get core.eol") || "(unset)"} filemode=${g("config --get core.filemode") || "(unset)"}`);
    console.log(`     HEAD           ${g("rev-parse --short HEAD")} on ${g("rev-parse --abbrev-ref HEAD")}`);
    console.log(`     base recorded  ${base || "(none)"}`);
    console.log(`     remote refs    ${g("for-each-ref --format=\"%(refname)\" refs/remotes").replace(/\n/g, " ") || "(none)"}`);
    console.log(`     -r --contains  ${g(`branch -r --contains ${g("rev-parse HEAD")}`).replace(/\n/g, " ") || "(empty)"}`);
    console.log(`     status         ${g("status --porcelain").replace(/\n/g, " | ") || "(clean)"}`);
    console.log(`     reflog         ${g('reflog --format=%h%x20%gs').split("\n").slice(0, 3).join(" | ") || "(none)"}`);
    console.log(`     HOOK SAID      ${(ctx.hookSaid || "").trim().slice(0, 600) || "(nothing)"}`);
  }
  const ok = got === expectBlock;
  if (!ok) failures++;
  console.log(`${ok ? "  ok  " : "  FAIL"}  ${expectBlock ? "BLOCK " : "silent"}  ${name}${ok ? "" : `   <- got ${got ? "BLOCK" : "silent"}`}`);
  fs.rmSync(dir, { recursive: true, force: true });
}

/* A branch that left `main` before its last commit, the way the laser-cut set left `dev` on
   21 August. `ctx.base` is the stamp the harness writes at SessionStart.

   IT IS HELD IN A VARIABLE, NOT A FILE IN THE REPO, AND THAT IS NOT TIDINESS. The first version of
   this file wrote it to `<repo>/.base`, where the very next `git add -A` committed it — and `.base`
   is game code by `lib/game-code.cjs`, which is an exclusion list. So three scenarios passed for
   the wrong reason and a fourth failed for one. A fixture that leaks into the thing it is testing
   is not a fixture. */
function awayBranch(ctx) {
  ctx.git("checkout -q -b side HEAD~1");
  ctx.write("physical/plan.txt", "the branch does its own work\n");
  ctx.git("add -A"); ctx.git('commit -q -m "side work"');
  ctx.base = ctx.git("rev-parse HEAD").trim();
}

console.log("\nplaytest-checklist-last.cjs — ownership\n");

/* THE ONE THAT SEPARATES THE 2026-09-12 FIX FROM THE 2026-08-31 ONE.
   `git diff base..HEAD` lists the game file (trees differ); `git log base..HEAD -- <file>` returns
   NOTHING, because history simplification drops a merge whose copy matches a parent's. Before the
   fix that empty answer read as "mine" and the hook demanded a sheet. */
check("catches up with a published branch, authors nothing", false, (c) => {
  awayBranch(c);
  c.git("merge -q main --no-edit");
});

/* THE FALSE NEGATIVE THAT WOULD MATTER MOST: the session writes the game file itself, and writes
   content that happens to be byte-identical to the published branch. The blob test must never be
   reached here — `git log` can attribute the file, so the older tests decide it. */
check("authors a game file whose content matches a published branch", true, (c) => {
  awayBranch(c);
  c.write(c.GAME, "export function drawBoard(){ return 2; }\n");   // identical to origin/main
  c.git("add -A"); c.git('commit -q -m "wrote it myself"');
});

/* A merge is not authorship — UNLESS the person resolved a conflict, which is authorship. The
   merge's tree then differs from both parents, so simplification keeps it and it stays ours. */
check("merges, and hand-resolves a conflict in a game file", true, (c) => {
  awayBranch(c);
  c.write(c.GAME, "export function drawBoard(){ return 99; }\n");
  c.git("add -A"); c.git('commit -q -m "side changes the board too"');
  try { c.git("merge -q main --no-edit"); } catch {}
  c.write(c.GAME, "export function drawBoard(){ return 3; }\n");   // a third answer: authored
  c.git("add -A"); c.git('commit -q -m "resolved by hand"');
});

check("writes a brand-new game file", true, (c) => {
  awayBranch(c);
  c.write("src/ui/newthing.js", "export const x = 1;\n");
  c.git("add -A"); c.git('commit -q -m "new"');
});

check("catches up with a published branch and writes only docs", false, (c) => {
  awayBranch(c);
  c.git("merge -q main --no-edit");
  c.write(c.DOC, "# notes\nmore words\n");
  c.git("add -A"); c.git('commit -q -m "docs only"');
});

/* THE DOCUMENTED WORKFLOW MUST NOT TRIP THE GATE ON ITSELF — 2026-09-12, found on Wy-Blade.
   docs/GIT-AND-DEPLOY.md §5 tells every merge touching a listed page to run sitemap_write.mjs
   afterwards, which rewrites a date in sitemap.xml computed from git log. Before sitemap.xml was
   excluded in lib/game-code.cjs, a session that changed nothing but docs and then followed its own
   instructions was told to produce a staging checklist. Fourth wrong accusation from this hook. */
check("silent: follows the documented workflow — docs, plus the sitemap date it tells you to write", false, (c) => {
  awayBranch(c);
  c.git("merge -q main --no-edit");
  c.write(c.DOC, "# notes\nmore words\n");
  c.write("sitemap.xml", '<?xml version="1.0"?><urlset><url><lastmod>2026-09-12</lastmod></url></urlset>\n');
  c.git("add -A"); c.git('commit -q -m "docs, and the sitemap date"');
});

/* KNOWN GAP, RECORDED ON PURPOSE — 2026-09-12.
   `const ours = new Set(dirty)` says uncommitted work is ours because nobody else could have
   written it. That is false in a STALE CHECKOUT: a second folder on the same branch shows every
   file the branch gained since its last pull as a staged DELETION, and the hook bills them to
   whoever is standing there. That is what actually fired on 2026-09-12 — 21 game files, none of
   them touched by anyone, in a folder three days behind.
   This row asserts TODAY'S behaviour, not the right one. When somebody fixes it, this row goes
   red, and that is the point: the change will be deliberate and visible rather than a silent
   loosening of the one test that stops Wyatt getting a fabricated sheet. */
check("KNOWN GAP: a stale checkout's phantom staged deletions read as authored", true, (c) => {
  awayBranch(c);
  c.git("merge -q main --no-edit");
  c.git(`rm -q --cached ${c.GAME}`);      // the shape a stale index takes: staged deletion
});

console.log(failures ? `\n${failures} FAILED\n` : "\nall ownership scenarios pass\n");
process.exit(failures ? 1 : 0);
