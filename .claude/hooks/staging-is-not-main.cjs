#!/usr/bin/env node
/* staging-is-not-main.cjs — fires when a session is about to ask GIT whether the work shipped.
 *
 * WHY THIS EXISTS, 2026-09-06, and it is Wyatt's own words that earned it:
 *   "i'm still so confused, claude... i just want to build pastry pirates features, but i'm
 *    getting so bogged down stuck and confused every time that YOU get confused by our staging
 *    vs production structure."
 *
 * WHAT HAPPENED. He said he had merged the branch that morning. A session ran
 *
 *     git merge-base --is-ancestor HEAD origin/main    -> NO
 *     git rev-list --count origin/main..HEAD           -> 1355
 *
 * and told him the merge had failed — twice — then alarmed him that real players were on an
 * eleven-day-old build. BOTH NUMBERS WERE TRUE AND ABOUT THE WRONG SUBJECT. This checkout's
 * `origin` is the PRODUCTION repo; he was talking about STAGING, which is a DIFFERENT REPOSITORY
 * (wyattroy/pastrypirates-staging), published by COPY. There is no ancestry to measure, so git
 * cannot answer the question at all — and it does not say so, it just answers something else.
 *
 * WRITING IT DOWN WAS ALREADY TRIED AND WAS NOT ENOUGH. docs/GIT-AND-DEPLOY.md section 5 has
 * described the two repos for weeks. .claude/CLAUDE.md section 6 gained it the same morning as
 * this hook. He then had to explain it AGAIN. Charter principle 2: RULES EXECUTE OR EXPIRE — a
 * rule is a hook, a gate or a script, and prose is context, not enforcement.
 *
 * IT DOES NOT BLOCK. Asking git about production is legitimate and common; the fault was reading
 * a production answer as a staging one. So this prints the distinction at the moment of the
 * command and gets out of the way. A hook that blocks a normal command teaches people to work
 * around hooks.
 *
 * Fires ONCE per session, like its siblings — the point is to arrive at the moment, not to nag.
 */
"use strict";
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

let payload = "";
try { payload = fs.readFileSync(0, "utf8"); } catch { process.exit(0); }

let cmd = "";
try { cmd = (JSON.parse(payload).tool_input || {}).command || ""; } catch { process.exit(0); }
if (!cmd) process.exit(0);

// THE TRIGGER IS "ASKING GIT WHERE THE WORK IS", not the word "main". Deliberately narrow: it
// matches ancestry/comparison questions aimed at a main ref, which is the shape that misled.
// A plain `git log main` or `git checkout main` is not this fault and is left alone.
const ASKS_GIT_WHERE_IT_IS = [
  /merge-base[^\n]*\bmain\b/,
  /rev-list[^\n]*\bmain\b/,
  /branch\s+(-r|-a|--remotes|--all)?[^\n]*--contains/,
  /\bgit\s+diff[^\n]*origin\/main/,
  /\bgit\s+log[^\n]*origin\/main\.\./,
];
if (!ASKS_GIT_WHERE_IT_IS.some((re) => re.test(cmd))) process.exit(0);

// Once per session. Keyed on the session marker session-base.cjs writes, falling back to a daily
// key so a session without one still gets it at most once a day rather than every command.
const dir = path.join(os.tmpdir(), "pp-hooks");
const key = (process.env.CLAUDE_SESSION_ID || new Date().toISOString().slice(0, 10)).replace(/\W/g, "");
const flag = path.join(dir, `staging-is-not-main-${key}`);
try {
  fs.mkdirSync(dir, { recursive: true });
  if (fs.existsSync(flag)) process.exit(0);
  fs.writeFileSync(flag, "1");
} catch { /* if the flag cannot be written, printing twice is the harmless failure */ }

process.stderr.write(`
────────────────────────────────────────────────────────────────────────────
 STOP — GIT CANNOT TELL YOU WHETHER THE WORK SHIPPED.

 This checkout's \`origin\` is  github.com/wyattroy/pastrypirates  — PRODUCTION.
 Staging is a DIFFERENT REPOSITORY (wyattroy/pastrypirates-staging) and is
 published by COPY, not by merge. THERE IS NO ANCESTRY TO MEASURE, so a
 merge-base / rev-list answer is about production only — and it will not
 tell you that. It will just answer a question you did not ask.

 ASK THE SITES INSTEAD:

     node scripts/where_is_my_work.mjs

 It prints your working tree, staging and production stamps side by side.

 AND BEFORE YOU ALARM HIM: production being OLDER than your branch is NORMAL.
 It is deliberately unreleased and moves only when Wyatt approves a merge to
 main. On 2026-09-06 a session reported that as a failure, twice, and cost him
 a morning he wanted to spend building the game.

 Vocabulary, because the wrong verb is what caused it:
   PUBLISH to staging  = a copy.  Any branch, any time, no approval.
   RELEASE to production = a merge to main. His approval. Live instantly.
────────────────────────────────────────────────────────────────────────────
`);
process.exit(0);
