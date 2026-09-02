#!/usr/bin/env node
// scripts/game_url_check.js
//
// THE BROWSER FLEET MUST AGREE ON WHERE THE GAME IS, AND THAT PLACE MUST HOLD THE GAME.
//
// WHAT THIS COST, 2026-08-26. The v2.0 cutover promoted `4/` to the repo root, leaving `4/` holding
// only `scripts/`. Twelve browser scripts had `http://127.0.0.1:${PORT}/4/` hardcoded — 22 sites —
// and another 15 files did in-page `import("/4/src/…")`, 49 more. Seventy-seven references, none of
// which any gate could see.
//
// The failure was not loud. Chrome opened, python's http.server answered 200 with a DIRECTORY
// LISTING for `4/`, and every script then failed on the first thing it looked for with the same
// uninformative message: "solo card not clickable". THE ENTIRE SEA TRIAL WAS POINTED AT AN EMPTY
// DIRECTORY and read as the game being broken. The seeded-defect drill, run against it, dutifully
// reported "4 REAL GAP(S) — the sea trial would not have found these" about four bugs it had never
// got within a mile of. docs/HARD-WON-LESSONS.md §3: a gate aimed at the wrong tree is not silent,
// it is REASSURING.
//
// doc_command_check.js predicted exactly this class in its own header — "the v2.0 cutover will move
// every scripts/... path, so on that day the docs will confidently name files that do not exist"
// — and guards the DOCS. Nobody guarded the URLs the browser scripts navigate to. This does.
//
// It is CLAUDE.md rule 23 in gate form: the design-time question is *what makes these agree?* The
// answer is now `gameURL()` in scripts/lib/chrome.mjs, and this fails the build if a second
// spelling appears beside it.
//
// House convention: no test runner, one PASS/FAIL line per case, every case runs before exit.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SCRIPTS = path.join(REPO, "scripts");

let failures = 0;
const fail = (what) => { failures++; console.log(`  FAIL  ${what}`); };
const pass = (what) => console.log(`  PASS  ${what}`);

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e =>
  e.isDirectory() ? walk(path.join(dir, e.name))
  : /\.(mjs|js)$/.test(e.name) ? [path.join(dir, e.name)] : []);
const FILES = walk(SCRIPTS);

/* The one place allowed to name the path, plus the two files whose `/4/` is PROSE about this very
   incident. Everything else must go through gameURL()/GAME_PATH. */
const OWNER = path.join(SCRIPTS, "lib", "chrome.mjs");
const PROSE_OK = new Set([OWNER, path.join(SCRIPTS, "lib_twin_check.js"), path.join(SCRIPTS, "game_url_check.js")]);

console.log("game_url_check — one spelling of where the game is served, and it must be the game\n");

/* ONE QUESTION, ASKED OF EVERY TREE THE FLEET CAN NAVIGATE TO: does this path really hold a game?
   Not "a file is there" — the game specifically. Every driver's first act is clicking #choiceSolo,
   so its absence is precisely what breaks them, and a directory listing or the wrong tree's
   index.html would both sail past a mere existence check.

   ONE function rather than one per constant, and that is rule 23 rather than tidiness: the second
   tree's guard was first written as a copy of the first tree's, and two checks kept in step by
   discipline are two checks that drift. This is also the seam the red-proof drives, so the thing
   proved able to fail is the thing that runs. */
const whyNotAGame = (p) => {
  const idx = path.join(REPO, p, "index.html");
  if (!fs.existsSync(idx)) return `${path.relative(REPO, idx)} does not exist`;
  if (!fs.readFileSync(idx, "utf8").includes("choiceSolo")) return "its index.html has no #choiceSolo — that is not a game the drivers can drive";
  return null;
};

const treeCase = (constName, what) => {
  const src = fs.readFileSync(OWNER, "utf8");
  const m = src.match(new RegExp(`export const ${constName}\\s*=\\s*["'\`]([^"'\`]*)["'\`]`));
  if (!m) { fail(`scripts/lib/chrome.mjs does not export ${constName} — ${what} has no single spelling`); return null; }
  const why = whyNotAGame(m[1]);
  if (why) fail(`${constName} is "${m[1]}" but ${why}`);
  else pass(`${constName} "${m[1]}" serves ${what} (index.html has #choiceSolo)`);
  return m[1];
};

// 1. GAME_PATH must actually point at the game. This is the check that would have caught the cutover.
treeCase("GAME_PATH", "the game the drivers drive");

/* 1b. AND THE SAME QUESTION OF THE FROZEN v1. `/classic` is v1, not developed, and it shares this
   repo's `assets/` folder — so a probe that photographs it (to prove a format change did not blank
   the old game's recipe art) has to name it. The moment a script names it as a string literal we
   are back to a path nothing makes agree, which is what case 3 forbids.

   So CLASSIC_PATH joined GAME_PATH in chrome.mjs on 2026-09-02, and this case is the price of it:
   the second tree gets a single spelling AND a guard, exactly as the first one does. Without this,
   moving or renaming `classic/` would leave every classic-facing probe navigating to a directory
   listing and reporting the frozen game as broken — the 2026-08-26 failure, replayed on the tree
   nobody watches. */
treeCase("CLASSIC_PATH", "the frozen v1");

// 2. Nobody else may hardcode a local game URL.
{
  const bad = [];
  for (const f of FILES) {
    if (PROSE_OK.has(f)) continue;
    fs.readFileSync(f, "utf8").split("\n").forEach((line, i) => {
      /* fetch() is the CDP/WebKit CONTROL PLANE — /json/new, /json/list, /json/version, /status —
         and those hardcoded hosts are correct. The game is NAVIGATED to, never fetched. The first
         version of this check had no such discriminator and condemned all nine of them; every one
         works. CLAUDE.md rule 6: when a check condemns something known to work, suspect the check. */
      if (/fetch\(/.test(line)) return;
      if (/https?:\/\/(127\.0\.0\.1|localhost):\$\{[^}]+\}\//.test(line) && !/contact-|judge-queue/.test(line))
        bad.push(`${path.relative(REPO, f)}:${i + 1}`);
    });
  }
  if (bad.length) fail(`${bad.length} hardcoded local game URL(s) — use gameURL(port) from lib/chrome.mjs: ${bad.slice(0, 6).join(", ")}`);
  else pass("no script hardcodes a local game URL; all navigation goes through gameURL()");
}

// 3. No in-page module import may name a tree that the cutover can move.
{
  const bad = [];
  for (const f of FILES) {
    if (PROSE_OK.has(f)) continue;
    fs.readFileSync(f, "utf8").split("\n").forEach((line, i) => {
      const m = line.match(/import\(\s*["'`](\/(?!src\/)[^"'`]*\/src\/[^"'`]*)["'`]/);
      if (m) bad.push(`${path.relative(REPO, f)}:${i + 1} -> ${m[1]}`);
    });
  }
  if (bad.length) fail(`${bad.length} in-page import(s) naming a non-root tree — these 404 the moment a tree moves: ${bad.slice(0, 5).join(", ")}`);
  else pass("no in-page import names a tree other than the served root");
}

// 4. No script may READ or IMPORT a path under a tree the cutover deleted.
{
  /* THE FOURTH INSTANCE IN ONE DAY, and the most expensive: sea_trial.mjs:35 did
       fs.readFileSync(path.join(REPO, "4/src/ui/stage.js"))
     to print the build stamp, so THE SEA TRIAL — the gate CLAUDE.md mandates for every change —
     crashed with ENOENT before sailing a single leg, and had done since the cutover. ceo_brief.mjs
     carried the identical line, so "run CEO" was dead too. Cases 2 and 3 above only look at URLs
     and in-page imports; a Node-side file read is a different shape and slipped past both.
     Prose mentioning 4/src is fine and common (this file does it) — a STRING PASSED TO A READ is
     not. */
  const bad = [];
  for (const f of FILES) {
    if (PROSE_OK.has(f)) continue;
    fs.readFileSync(f, "utf8").split("\n").forEach((line, i) => {
      if (!/(readFileSync|existsSync|readdirSync|createReadStream|import\s*\(|require\s*\()/.test(line)) return;
      const m = line.match(/["'`]([^"'`]*\b4\/(?:src|index\.html)[^"'`]*)["'`]/);
      if (m) bad.push(`${path.relative(REPO, f)}:${i + 1} -> ${m[1]}`);
    });
  }
  if (bad.length) fail(`${bad.length} script(s) READ a path under 4/ that the cutover deleted: ${bad.slice(0, 5).join(", ")}`);
  else pass("no script reads or imports a path under the deleted 4/src tree");
}

// 5. RED-PROOF. A check that has never been seen to fail is not a check (CLAUDE.md rule 6).
{
  const synthetic = 'await c.nav(`http://127.0.0.1:${PORT}/4/`); await import("/4/src/ui/index.js");';
  const cdpLine   = 'tgt = await (await fetch(`http://127.0.0.1:${dbgPort}/json/new?about:blank`, { method: "PUT" })).json();';
  const urlRe = /https?:\/\/(127\.0\.0\.1|localhost):\$\{[^}]+\}\//;
  const impRe = /import\(\s*["'`](\/(?!src\/)[^"'`]*\/src\/[^"'`]*)["'`]/;
  const catchesURL = urlRe.test(synthetic) && !/fetch\(/.test(synthetic);
  const catchesImport = impRe.test(synthetic);
  /* BOTH DIRECTIONS. A gate that only proves it can go red is half a gate — the version before this
     one went red on nine CDP control-plane fetches that are all correct. So the red-proof also
     asserts the gate stays QUIET on the line it must never flag. */
  const sparesCDP = /fetch\(/.test(cdpLine);
  /* …and case 4, both ways: it must catch the read that killed the sea trial, and stay quiet on a
     comment that merely MENTIONS the old tree — this file is full of those on purpose. */
  const deadRead  = 'const stampSrc = fs.readFileSync(path.join(REPO, "4/src/ui/stage.js"), "utf8");';
  const proseOnly = '// the cutover deleted 4/src/ui/stage.js, which is why this gate exists';
  const readRe = /(readFileSync|existsSync|readdirSync|createReadStream|import\s*\(|require\s*\()/;
  const pathRe = /["'`]([^"'`]*\b4\/(?:src|index\.html)[^"'`]*)["'`]/;
  const catchesRead = readRe.test(deadRead) && pathRe.test(deadRead);
  const sparesProse = !(readRe.test(proseOnly) && pathRe.test(proseOnly));
  /* …and cases 1/1b, through the REAL function they run on, not a copy of it. A tree constant
     pointing somewhere with no index.html must be condemned; the tree that genuinely holds a game
     must be spared. `scripts/` is the honest negative here — it is a real directory in this repo
     with no index.html in it, so this proves the check looks at CONTENT rather than merely at
     whether the string is non-empty. */
  const catchesBogusTree = whyNotAGame("/no-such-tree/") !== null && whyNotAGame("scripts") !== null;
  const sparesRealTree   = whyNotAGame("/") === null;
  if (catchesURL && catchesImport && sparesCDP && catchesRead && sparesProse && catchesBogusTree && sparesRealTree)
    pass("red-proof: catches the URL, the import, the dead file read and a tree constant that holds no game; spares the CDP fetch, plain prose and the real tree");
  else fail(`red-proof FAILED (url:${catchesURL} import:${catchesImport} sparesCDP:${sparesCDP} read:${catchesRead} sparesProse:${sparesProse} bogusTree:${catchesBogusTree} realTree:${sparesRealTree})`);
}

console.log(`\n${failures ? "FAIL" : "PASS"} — ${failures} failure(s)`);
process.exit(failures ? 1 : 0);
