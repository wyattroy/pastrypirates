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
import path from "node:path";
import { fileURLToPath } from "node:url";
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

let failures = 0;
const fail = (what) => { failures++; console.log(`  FAIL  ${what}`); };
const pass = (what) => console.log(`  PASS  ${what}`);
const exists = (rel) => fs.existsSync(path.join(REPO, rel));

// The documents that TELL A SESSION WHAT TO DO. If a path here is wrong, a session follows it.
const DOCS = [".claude/CLAUDE.md", "docs/QA-PROCESS.md", "docs/HARD-WON-LESSONS.md",
              "docs/DRIVING-THE-GAME.md", "docs/GIT-AND-DEPLOY.md"];

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
  for (const m of text.matchAll(/\]\((\.{1,2}\/[^)#\s]+\.md)(?:#[^)]*)?\)/g)) {
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

console.log(`\n${failures === 0 ? "PASS" : "FAIL"} — ${failures} failure(s)`);
process.exit(failures === 0 ? 0 : 1);
