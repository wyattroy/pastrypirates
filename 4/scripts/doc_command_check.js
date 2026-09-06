#!/usr/bin/env node
// 4/scripts/doc_command_check.js
//
// EVERY COMMAND AND FILE PATH THE DOCS TELL A SESSION TO RUN MUST ACTUALLY EXIST.
//
// Wyatt, 2026-08-26: "If I ask you to run 'sea trial' in a year, how will your documentation know
// what file to open, and which process to run?"
//
// The answer today is that .claude/CLAUDE.md carries the two commands inline and is loaded into
// every session automatically. The answer in a year is "only if something checks" — and until this
// file, nothing did. gate_citation_check.js checks citations inside 4/src/**; the DOCS were
// unguarded, which is precisely where the instructions live.
//
// THIS HAS ALREADY COST SOMETHING. The sea trial printed a sweep command, `qa/matrix.mjs`, that had
// been deleted that same morning and was still referenced in FIVE places — found by a CEO review,
// not by a gate. And the v2.0 cutover will move every `4/scripts/...` path to `scripts/...`, so on
// that day both CLAUDE.md and QA-PROCESS.md will confidently name files that do not exist.
//
// It also catches a second, sneakier drift: CLAUDE.md's §4 "read this first" table has a MACHINE
// COPY in .claude/hooks/read-the-doc-first.cjs, whose own comment says "Add a row here in the same
// commit that adds a doc to CLAUDE.md §4." On 2026-08-26 a commit whose entire purpose was making
// learnings permanent added the prose row and skipped the enforced one. Nothing noticed. Now
// something does.
//
// House convention: no test runner, one PASS/FAIL line per case, every case runs before exit.
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

let failures = 0;
const fail = (what) => { failures++; console.log(`  FAIL  ${what}`); };
const pass = (what) => console.log(`  PASS  ${what}`);
const exists = (rel) => fs.existsSync(path.join(REPO, rel));

// The documents that TELL A SESSION WHAT TO DO. If a path here is wrong, a session follows it.
/* EVERY doc, not a hand-kept list of five. The list version scanned CLAUDE.md, QA-PROCESS,
   HARD-WON-LESSONS, DRIVING-THE-GAME and GIT-AND-DEPLOY — so docs/AUDIO.md, which CLAUDE.md §4
   itself tells you to read before touching sound, was never checked, and its link to the audio
   module sat dead for a day after the cutover with this gate reporting all green. A hand-kept
   list of what to guard is the same shape as the bug it is guarding against: it rots silently,
   and nothing says so. Derived from the directory instead. */
const DOCS = [".claude/CLAUDE.md", ".claude/CEO-BRIEF.md",
              ...fs.readdirSync(path.join(REPO, "docs")).filter(f => f.endsWith(".md")).map(f => "docs/" + f)];

console.log("doc_command_check — every command and link the docs name must exist\n");

/* ---- 1. `node <path>` commands ------------------------------------------------------------- */
let cmds = 0, badCmds = [];
for (const doc of DOCS) {
  if (!exists(doc)) { fail(`${doc} — the doc itself is missing`); continue; }
  const text = fs.readFileSync(path.join(REPO, doc), "utf8");
  for (const m of text.matchAll(/\bnode\s+([A-Za-z0-9_./-]+\.(?:mjs|js|cjs))/g)) {
    const rel = m[1];
    if (rel.startsWith("~") || rel.includes("node_modules")) continue;   // outside the repo on purpose
    cmds++;
    if (!exists(rel)) badCmds.push(`${doc} -> node ${rel}`);
  }
}
for (const b of badCmds) fail(`a doc tells a session to run a file that does not exist: ${b}`);
if (!badCmds.length) pass(`all ${cmds} \`node …\` commands in the docs point at real files`);

/* ---- 2. relative markdown links between repo files --------------------------------------- */
let links = 0, badLinks = [];
for (const doc of DOCS) {
  if (!exists(doc)) continue;
  const dir = path.dirname(path.join(REPO, doc));
  const text = fs.readFileSync(path.join(REPO, doc), "utf8");
  /* .md AND SOURCE FILES. This used to match `.md` only, and that hole let a real one through:
     docs/AUDIO.md linked `[4/src/ui/audio.js](../4/src/ui/audio.js)` for a whole day after the
     cutover deleted `4/`, and this gate reported "all 21 relative doc links resolve" the entire
     time. A doc that hands you a dead path to the SOURCE is exactly as broken as one that hands
     you a dead path to another doc — and the source links are the ones a session actually opens. */
  for (const m of text.matchAll(/\]\((\.{1,2}\/[^)#\s]+\.(?:md|js|mjs|cjs|html|json|py|sh))(?:#[^)]*)?\)/g)) {
    links++;
    if (!fs.existsSync(path.resolve(dir, m[1]))) badLinks.push(`${doc} -> ${m[1]}`);
  }
}
for (const b of badLinks) fail(`a doc links to a file that does not exist: ${b}`);
if (!badLinks.length) pass(`all ${links} relative doc links resolve`);

/* ---- 3. CLAUDE.md §4's table and the HOOK's copy of it must agree ------------------------- */
/* The hook is what actually stops a session; the table is what a human reads. When they disagree,
   the human-facing one wins the argument and the machine silently protects nothing. */
const hookPath = ".claude/hooks/read-the-doc-first.cjs";
if (!exists(hookPath)) {
  fail(`${hookPath} is missing — CLAUDE.md §4 has no machine enforcement at all`);
} else {
  const hook = fs.readFileSync(path.join(REPO, hookPath), "utf8");
  const claude = fs.readFileSync(path.join(REPO, ".claude/CLAUDE.md"), "utf8");
  // every docs/*.md named in the §4 table rows (lines that link a doc AND describe a trigger)
  const tableDocs = new Set();
  for (const m of claude.matchAll(/\|[^|\n]*\[`(docs\/[A-Za-z0-9._-]+\.md)`\]/g)) tableDocs.add(m[1]);
  const missing = [...tableDocs].filter(d => !hook.includes(d));
  if (missing.length) {
    fail(`in CLAUDE.md §4's table but NOT in the hook that enforces it: ${missing.join(", ")}`
       + `\n        -> add them to SUBSYSTEMS in ${hookPath}, as that file's own comment instructs`);
  } else {
    pass(`all ${tableDocs.size} doc(s) in CLAUDE.md §4 are also in the hook's SUBSYSTEMS table`);
  }
}


/* ---- 4. `bash <path>` commands and bare script paths ------------------------------------- */
/* Section 1 checks `node …` only, and that hole let a real one through for a day.
 *
 * On 2026-09-06 `scripts/deploy-preview.sh` was renamed to `scripts/deploy-staging.sh`. CLAUDE.md
 * §3 — the CNAME rule, the single most damaging thing in the file to get wrong — still said
 * "Deploy with `scripts/deploy-preview.sh` only", and GIT-AND-DEPLOY.md said it twice more. This
 * gate ran green through all of it, because it was looking for `node` and the deploy script is
 * `bash`. Honest check, wrong subject: the exact failure CLAUDE.md §1 describes about the day a
 * green suite blessed a broken build.
 *
 * So: any script path a doc names, whatever runs it. */
let shCmds = 0, badSh = [];
for (const doc of DOCS) {
  if (!exists(doc)) continue;
  const text = fs.readFileSync(path.join(REPO, doc), "utf8");
  for (const m of text.matchAll(/(?:\bbash\s+|\bsh\s+|(?<![\w./-])\.\/)([A-Za-z0-9_./-]+\.(?:sh|bash))/g)) {
    const rel = m[1].replace(/^\.\//, "");
    if (rel.startsWith("~") || rel.includes("node_modules")) continue;
    shCmds++;
    if (!exists(rel)) badSh.push(`${doc} -> ${rel}`);
  }
  /* A doc naming `scripts/foo.sh` in prose or backticks is telling you to run it just as surely
     as one prefixing it with `bash`. CLAUDE.md's CNAME rule is written exactly that way. */
  for (const m of text.matchAll(/`((?:scripts|4\/scripts)\/[A-Za-z0-9_./-]+\.(?:sh|mjs|js|cjs))`/g)) {
    shCmds++;
    if (!exists(m[1])) badSh.push(`${doc} -> ${m[1]}`);
  }
}
for (const b of [...new Set(badSh)]) fail(`a doc names a script that does not exist: ${b}`);
if (!badSh.length) pass(`all ${shCmds} script paths named in the docs exist`);

/* ---- 5. every PATH-ANCHORED regex in a hook must match a real file ------------------------ */
/* THE ROT THAT MADE THIS WHOLE SECTION NECESSARY, measured 2026-09-06 by feeding the hooks real
 * input and watching what they did:
 *
 *   Edit src/ui/board.js   (the live game today)     -> SILENT
 *   Edit src/ui/stage.js   (the live game today)     -> SILENT
 *   Edit index.html        (the live game today)     -> SILENT
 *   Edit 4/src/ui/stage.js (deleted by the cutover)  -> FIRES
 *
 * Both PreToolUse hooks still matched the `4/` tree the cutover deleted. They fired only on files
 * that do not exist and stayed quiet on every file that does — for nine days, while CLAUDE.md line
 * 832 went on asserting "a hook stops the first edit to game code in a session and states the
 * gear." Section 3 above could not see it: it checks that the DOCS named in the table are also
 * named in the hook, and both lists were fine. What rotted was the hook's aim.
 *
 * A gate pointed at the wrong tree is not silent, it is REASSURING (HARD-WON-LESSONS §3).
 *
 * Only regexes carrying a path SEPARATOR (`\/`) are checked — those claim "this is where that file
 * lives." Fuzzy content matchers like /bot|planner/i make no claim about the tree and are left
 * alone. The first draft of this check required a leading `^` as well, and found ZERO patterns
 * while reporting "all 0 path patterns match a real file" — a green line from a check that could
 * not fail, in a gate written to catch exactly that. Caught by printing what it had matched
 * before believing the verdict (CLAUDE.md §1, red-proof the instrument). */
const HOOKS = [".claude/hooks/read-the-doc-first.cjs", ".claude/hooks/qa-gear-first.cjs"];
const tracked = execFileSync("git", ["ls-files"], { cwd: REPO, encoding: "utf8" })
  .split("\n").filter(Boolean);
let pathRes = 0, deadRes = [];
for (const h of HOOKS) {
  if (!exists(h)) { fail(`${h} is missing — a rule in CLAUDE.md has lost its enforcement`); continue; }
  const src = fs.readFileSync(path.join(REPO, h), "utf8")
    .split("\n").filter(l => !/^\s*(\/\/|\*|\/\*)/.test(l)).join("\n");   // not the war stories
  for (const m of src.matchAll(/\/((?:\\.|\[[^\]]*\]|[^/\n\\])+)\/([gimsuy]*)/g)) {
    const body = m[1];
    if (!body.includes("\\/")) continue;                 // no path separator => not a path claim
    let re; try { re = new RegExp(body, m[2].replace(/[gy]/g, "")); } catch { continue; }
    pathRes++;
    if (!tracked.some(f => re.test(f))) deadRes.push(`${h} -> /${body}/`);
  }
}
for (const b of deadRes) {
  fail(`a hook's path pattern matches NO file in the repo — it can never fire: ${b}`
     + `\n        -> repoint it at the tree that exists today, or delete the rule`);
}
if (!deadRes.length) pass(`all ${pathRes} path patterns in the hooks match a real file`);

/* ---- 6. every deploy/publish script must actually TRIP the deploy hook -------------------- */
/* Section 5 proves a hook's patterns point at real files. It cannot prove the hook still fires on
 * the thing that matters, because `deploy-preview` carries no file extension and looks like any
 * other word. So this drives the hook for real, the way its own test file does.
 *
 * DERIVED FROM THE DIRECTORY, NOT TYPED. doc_command_check learned this once already, in section
 * 1's own comment: "a hand-kept list of what to guard is the same shape as the bug it is guarding
 * against — it rots silently, and nothing says so." A script added to scripts/ tomorrow is covered
 * the day it lands. */
const deployScripts = fs.existsSync(path.join(REPO, "scripts"))
  ? fs.readdirSync(path.join(REPO, "scripts"))
      .filter(f => /\.(sh|mjs|js)$/.test(f) && /deploy|publish/i.test(f))
      .map(f => "scripts/" + f)
  : [];
const docHook = path.join(REPO, ".claude/hooks/read-the-doc-first.cjs");
let silentDeploys = [];
if (deployScripts.length && fs.existsSync(docHook)) {
  for (const s of deployScripts) {
    const payload = JSON.stringify({
      session_id: "doccheck-" + Math.random().toString(36).slice(2),
      tool_name: "Bash",
      tool_input: { command: (s.endsWith(".sh") ? "bash " : "node ") + s },
    });
    let out = "";
    try {
      out = execFileSync("node", [docHook], {
        cwd: REPO, input: payload, encoding: "utf8",
        env: { ...process.env, CLAUDE_PROJECT_DIR: REPO },
      });
    } catch (e) { out = (e.stdout || "") + (e.stderr || ""); }
    if (!out.trim()) silentDeploys.push(s);
  }
}
for (const s of silentDeploys) {
  fail(`running ${s} does NOT trip the read-the-doc-first hook — the live domain is unguarded`
     + `\n        -> add its name to the deploy rule's bash[] in .claude/hooks/read-the-doc-first.cjs`);
}
if (deployScripts.length && !silentDeploys.length) {
  pass(`all ${deployScripts.length} deploy/publish script(s) trip the deploy hook`);
}

/* ---- 7. CLAUDE.md may only ever get SHORTER ---------------------------------------------- */
/* Wyatt, 2026-09-06, on being shown the growth curve: a hard size limit, gate-enforced, so adding
 * a rule forces removing or relocating one.
 *
 * THE CURVE THAT EARNED IT. CLAUDE.md was 399 lines on 2026-07-22 and 936 by 08-14. On 08-18 it
 * was pruned to 492 — cut nearly in half — and by 08-26 it was 990, BIGGER than before the prune,
 * with every line in it true. Accuracy was never the constraint. The file's own opening sentence
 * ("deliberately short so that it survives being read") describes a file whose rules table is 28
 * lines out of 990, and its own note under that table says three rules had to be merged because
 * they were competing for the same slot.
 *
 * A RATCHET, NOT A CLIFF. A gate that goes red on the day it is written, and stays red until
 * somebody finds a day to rewrite the rulebook, is a gate that teaches its reader to skip it —
 * which is the precise disease being treated. So: the file may hold or shrink, never grow. Every
 * trim lowers the ceiling permanently and the ceiling never rises again. Regrowth becomes
 * impossible rather than merely discouraged, and the build is green the whole way down.
 *
 * WHEN YOU TRIM IT, LOWER THIS NUMBER IN THE SAME COMMIT. That is the whole mechanism. */
const CEILING = 990;          // high-water mark. Only ever edit this DOWNWARD.
const TARGET  = 350;          // the goal: one screen of rules plus pointers.
const claudeText  = fs.readFileSync(path.join(REPO, ".claude/CLAUDE.md"), "utf8");
const claudeLines = claudeText.split("\n").length - (claudeText.endsWith("\n") ? 1 : 0);   // `wc -l`
if (claudeLines > CEILING) {
  fail(`.claude/CLAUDE.md grew to ${claudeLines} lines, over its ${CEILING}-line ceiling`
     + `\n        -> it is loaded into EVERY session. Move the story to a docs/ file and link it,`
     + `\n           or retire a rule that no longer earns its line. The ceiling never rises.`);
} else if (claudeLines > TARGET) {
  pass(`.claude/CLAUDE.md is ${claudeLines} lines — under its ${CEILING} ceiling `
     + `(${claudeLines - TARGET} above the ${TARGET} target; lower CEILING when you trim it)`);
} else {
  pass(`.claude/CLAUDE.md is ${claudeLines} lines — at or under the ${TARGET}-line target`);
}

console.log(`\n${failures === 0 ? "PASS" : "FAIL"} — ${failures} failure(s)`);
process.exit(failures === 0 ? 0 : 1);
