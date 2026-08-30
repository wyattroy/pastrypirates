#!/usr/bin/env node
/* production-fence.mjs — the CTO cannot reach real users. A hook, not a promise.
 *
 * WHY THIS EXISTS. Wyatt asked for a CTO that runs development while he is away for DAYS, and then
 * chose, from three options, "staging only, enforced by a hook":
 *
 *   "My core goal is to be able to step away from development for days at a time, and have the
 *    game noticeably better when I return, without always having to check in every few minutes."
 *
 * THE HAZARD IS STRUCTURAL, NOT HYPOTHETICAL. In a repo that publishes from its default branch,
 * every push to production is served to real users immediately. An autonomous agent working
 * unattended for two days, able to merge, is one bad judgement away from a broken product in front
 * of people who are mid-session. The CEO review catches that AFTER the fact. This catches it before.
 *
 * WHY IT KEYS ON A LOCK AND NOT ON "IS THIS A ROBOT". A hook cannot ask who it is talking to, and
 * one that blocked production for EVERYONE would take the release process away from Wyatt — the
 * exact inversion of the rule, since the merge is his. So the constraint attaches to the LOCK:
 * while the CTO holds it, production is unreachable; when nobody holds it, nothing changes. Wyatt
 * is never blocked, and the CTO cannot unblock itself without releasing the lock, which is a
 * visible act on disk.
 *
 * DERIVED, NOT LISTED. There is no hand-typed list of "dangerous commands" here. It asks one
 * question of the actual command — does this move history onto production? — because a list of
 * forbidden spellings rots exactly like the thing it guards.
 *
 * IT IS INERT IN EVERY REPO THAT IS NOT RUNNING A CTO. No lock file, no opinion, immediate exit.
 * That matters more here than in a single project: this ships as a plugin and loads everywhere.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const allow = () => process.exit(0);
let loadAdapter;
const sh = (c) => { try { return execSync(c, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); } catch { return null; } };

let raw = "";
try { raw = fs.readFileSync(0, "utf8"); } catch { allow(); }
let input;
try { input = JSON.parse(raw); } catch { allow(); }        // unparseable: never block
if (input.tool_name !== "Bash") allow();

const REPO = process.env.CLAUDE_PROJECT_DIR || process.cwd();

/* THE LOCK IS FOUND WITHOUT THE ADAPTER, ON PURPOSE.
 *
 * The adapter used to be a STATIC import, and a static import that fails kills the process before
 * any guard in this file runs — so a missing or broken adapter meant the fence failed OPEN while
 * looking fully armed. Found 2026-08-27 while trying to force a crash: the test copy could not
 * resolve the adapter, the process died silently, and every command sailed through.
 *
 * So the order is now: find the lock with plain fs (no dependencies at all) -> if there is no lock,
 * exit and never think again -> only then load the adapter, inside a guard that can DENY. */
const LOCK_CANDIDATES = [".claude/.cto-lock", ".planning/.cto-lock"];
const lockPath = LOCK_CANDIDATES.map((r) => path.join(REPO, r)).find((f) => { try { return fs.existsSync(f); } catch { return false; } });

/* NO LOCK, NO CONSTRAINT. This is what keeps the release process Wyatt's, and it is also why a
   broken fence can never block his shell: with no CTO driving, this process is already gone. */
if (!lockPath) allow();

let A;
try {
  ({ loadAdapter } = await import("../bin/adapter.mjs"));
  A = loadAdapter(REPO);
} catch (e) {
  deny(`A CTO holds the lock and the fence could not load its own configuration: \`${e && e.message}\`.

It cannot tell whether this command reaches real users, so it is refusing. **An error is not
permission.** Fix the fence, or release the lock deliberately:

    rm ${lockPath}`);
}

let lock = {};
try { lock = JSON.parse(fs.readFileSync(lockPath, "utf8")); } catch { /* a corrupt lock still locks */ }

/* FROM HERE ON, A CRASH MUST DENY — NOT ALLOW.
 *
 * Caught by a CEO review, 2026-08-27: the code below was written to fail CLOSED when production is
 * undeclared, but hooks.json invoked it as `... || true`, so ANY crash failed OPEN and said nothing.
 * Two opposite instincts, and the outer one silently won.
 *
 * The asymmetry is deliberate and it is the whole safety argument: with no lock this process has
 * already exited 0 above, so a broken fence can never block Wyatt's own shell. Past this line a CTO
 * is driving, and an error means the fence cannot vouch for the command — which is a reason to
 * refuse it, not to wave it through. */
/* FROM HERE ON A CRASH MUST DENY, AND THIS IS AN EXPLICIT try/catch RATHER THAN AN
   uncaughtException HANDLER — because the handler DID NOT WORK. Tested by forcing a throw
   2026-08-27: a top-level throw during ES-module evaluation does not reach that handler, so the
   fence still failed open while looking guarded. The lesson is the one this whole system is built
   on: a safety mechanism nobody made FAIL is not known to work.

   The asymmetry is deliberate. With no lock this process already exited 0 above, so a broken
   fence can never block Wyatt's own shell. Past this line a CTO is driving, and an error means
   the fence cannot vouch for the command — a reason to refuse it, not to wave it through. */

try {
  const cmd = String((input.tool_input && input.tool_input.command) || "");
  const isGit = /^\s*git\b|[;&|]\s*git\b/.test(cmd);
  if (!isGit) allow();

  const PROD = A.values["production-ref"];

  /* FAIL CLOSED WHEN PRODUCTION IS UNDECLARED. A CTO is driving and the repo has not said which
     branch reaches real users — so this hook cannot tell a safe push from a release. The safe answer
     to "I don't know" is not "go ahead". */
  if (!PROD) {
    if (!/\b(push|merge)\b/.test(cmd)) allow();
    deny(`A CTO holds the lock and **this repo has not declared which branch reaches real users.**

  The fence cannot tell a safe push from a release, so it is refusing both. That is deliberate: the
  safe answer to "I don't know" is never "go ahead".

  **Fix it in one line** — add to \`${path.join(REPO, ".claude", "OFFICERS.md")}\`:

      - **production-ref:** main
      - **staging-command:** <how this repo publishes for review>`);
  }

  /* THE THREE THINGS THAT REACH REAL USERS. Everything else is allowed.
       1. pushing to production under any spelling of the refspec
       2. merging — the promotion step itself
       3. checking production out at all, which makes an ordinary `git push` dangerous

     WHY THIS RESOLVES THE REFSPEC INSTEAD OF PATTERN-MATCHING THE COMMAND. The first version tested
     whether the branch name appeared next to a space, colon, plus or quote. A SLASH was not on that
     list, so `git push origin refs/heads/main` — the long, fully-qualified, CAREFUL spelling — walked
     straight past, along with `HEAD:refs/heads/main` and `main:refs/heads/main`. Caught by a CEO
     review on 2026-08-27 and reproduced against this hook before being believed.
   
     THE PATTERN IS THE POINT, NOT THE BUG: a guard that fires on the obvious spelling and misses the
     careful one reads as complete either way. It is the same fault as a check whose subject is its
     own answer — vigilance that cannot fail. Both shipped in one commit. So this no longer asks what
     the command LOOKS like; it works out what the push would actually DO. */

  const norm = (r) => String(r || "").replace(/^\+/, "").replace(/^refs\/heads\//, "");
  /* A refspec's DESTINATION is the part after the last colon (`HEAD:main`, `main:refs/heads/main`);
     with no colon, source and destination are the same thing. */
  const destOf = (spec) => norm(spec.includes(":") ? spec.slice(spec.lastIndexOf(":") + 1) : spec);

  const currentBranch = sh(`git -C "${REPO}" rev-parse --abbrev-ref HEAD`);
  const hazards = [];

  /* Shell chains are split, so `cd x && git push origin main` is judged on the git part. */
  for (const part of cmd.split(/&&|\|\||;|\|/)) {
    const t = part.trim().split(/\s+/).filter(Boolean);
    const gi = t.findIndex((w) => w === "git");
    if (gi < 0) continue;
    const words = t.slice(gi + 1).filter((w) => w !== "-C" );
    const verb = words.find((w) => !w.startsWith("-"));

    if (verb === "push") {
      const after = words.slice(words.indexOf("push") + 1);
      const flags = after.filter((w) => w.startsWith("-"));
      const bare  = after.filter((w) => !w.startsWith("-"));
      /* --all and --mirror push every branch, production included, naming none of them. */
      if (flags.some((f) => /^--(all|mirror)$/.test(f)))
        hazards.push(`pushes ALL branches with \`${flags.find((f) => /^--(all|mirror)$/.test(f))}\`, which includes \`${PROD}\``);
      const refspecs = bare.slice(1);                 // bare[0] is the remote
      if (refspecs.length) {
        for (const spec of refspecs)
          if (destOf(spec) === PROD)
            hazards.push(`pushes to \`${PROD}\` (as \`${spec}\`), which is served to real users the instant it lands`);
      } else if (currentBranch === PROD) {
        /* A bare `git push` NAMES NO BRANCH, AND THAT IS THE POINT — it pushes the one you are
           STANDING ON. The hazard lives in the repo's state, not the command, so no amount of
           reading the string can reveal it. */
        hazards.push(`pushes with no branch named while \`${PROD}\` is checked out — which reaches real users just as surely as naming it`);
      }
    }

    if (verb === "merge" && !/--abort|--no-commit\s+--no-ff\s+--stat/.test(part))
      hazards.push(`merges branches — promotion to \`${PROD}\` is Wyatt's call, never the CTO's`);

    if ((verb === "checkout" || verb === "switch") && !words.includes("-b") && !words.includes("-c")) {
      if (words.slice(1).some((w) => !w.startsWith("-") && norm(w) === PROD))
        hazards.push(`checks out \`${PROD}\` — from there an ordinary \`git push\` is a release`);
    }
  }

  if (!hazards.length) allow();

  const staging = A.values["staging-command"];
  const since = lock.since ? ` (held since ${lock.since})` : "";
  deny(`The CTO lock is held by **${lock.holder || "unknown"}**${since}, on branch \`${lock.branch || "?"}\`.

  This command ${hazards.join("; and it ")}.

  **Every push to \`${PROD}\` is served to real users immediately.** Wyatt chose "staging only,
  enforced by a hook" precisely so that days of unattended work cannot reach someone he has not shown
  it to first.

  **WHAT TO DO INSTEAD — this is the whole output channel, and it is not a lesser one:**

  ${staging ? `    ${staging}` : `    *** This repo declares no \`staging-command\` in .claude/OFFICERS.md, so the CTO has
      nowhere to publish. PARK the item, write the question, and wait for Wyatt. ***`}

  Wyatt plays what you publish, and the merge to \`${PROD}\` stays his. If he has explicitly told you
  to release, he releases it himself, or he removes the lock:

      rm ${lockPath}

  **Do not work around this by other means.** A CTO that finds another route to production has
  defeated the one safety property it was given, and the next thing it does is unsupervised and in
  front of real people.`);
} catch (e) {
  deny(`The fence itself failed while a CTO holds the lock: \`${e && e.message}\`.

It cannot tell whether this command reaches real users, so it is refusing. **An error is not
permission.** Fix the fence, or release the lock deliberately:

    rm ${lockPath}`);
}

function deny(reason) {
  console.log(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: `⛔ THE CTO IS DRIVING AND MAY NOT REACH REAL USERS.\n\n${reason}`,
    },
  }));
  process.exit(0);
}
