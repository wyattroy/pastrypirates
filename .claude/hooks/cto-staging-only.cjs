#!/usr/bin/env node
/* cto-staging-only.cjs — the CTO cannot reach real players. A hook, not a promise.
 *
 * WHY THIS EXISTS (2026-08-27). Wyatt asked for a CTO that runs development while he is away for
 * DAYS. He then chose, from three options, "staging only, enforced by a hook":
 *
 *   "My core goal is to be able to step away from development for days at a time, and have the
 *    game noticeably better when I return, without always having to check in every few minutes."
 *
 * THE HAZARD IS STRUCTURAL, NOT HYPOTHETICAL. CLAUDE.md §6: every push to `main` is served to real
 * players IMMEDIATELY — there is no build step and nothing stands between `main` and the domain. An
 * autonomous agent working unattended for two days, with the ability to merge, is one bad judgement
 * away from a broken game in front of people who are mid-voyage. The CEO review catches that AFTER
 * the fact. This catches it before.
 *
 * WHY IT KEYS ON A LOCK AND NOT ON "IS THIS A ROBOT". A hook cannot ask who it is talking to, and a
 * hook that blocked `main` for EVERYONE would take the release process away from Wyatt — the exact
 * inversion of the rule (the merge is his). So the constraint attaches to the LOCK: while the CTO
 * holds it, main is unreachable; when nobody holds it, nothing changes. Wyatt is never blocked, and
 * the CTO cannot unblock itself without releasing the lock, which is a visible act on disk.
 *
 * DERIVED, NOT LISTED (the standing lesson from the cutover that broke six instruments): this does
 * not carry a hand-typed list of "dangerous commands". It asks one question of the actual command —
 * does this move history onto main, or publish to the production remote? — because a list of
 * forbidden spellings rots exactly like the thing it guards.
 *
 * IT DOES NOT BLOCK STAGING. ./scripts/deploy-staging.sh is the CTO's whole output channel and must
 * always work. It publishes to a DIFFERENT repo (wyattroy/pastrypirates-staging) and never touches
 * this one's main.
 */
const fs = require("fs");
const path = require("path");

const REPO = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const LOCK = path.join(REPO, ".planning", ".cto-lock");

let raw = "";
try { raw = fs.readFileSync(0, "utf8"); } catch { process.exit(0); }
let input;
try { input = JSON.parse(raw); } catch { process.exit(0); }   // unparseable: never block

if (input.tool_name !== "Bash") process.exit(0);

/* NO LOCK, NO CONSTRAINT. This is what keeps the release process Wyatt's. */
if (!fs.existsSync(LOCK)) process.exit(0);

let lock = {};
try { lock = JSON.parse(fs.readFileSync(LOCK, "utf8")); } catch { /* a corrupt lock still locks */ }

const cmd = String((input.tool_input && input.tool_input.command) || "");

/* THE THREE THINGS THAT REACH REAL PLAYERS. Everything else is allowed.

   1. pushing anything to this repo's main, under any spelling of the refspec
      (`git push origin main`, `git push origin HEAD:main`, `git push -f origin +main`, `git push`
      while main is checked out)
   2. merging INTO main — the promotion step itself
   3. checking main out at all, which is the move that makes an ordinary `git push` dangerous

   Read as questions about the command, not as a blocklist of strings. */
const isGit = /^\s*git\b|[;&|]\s*git\b/.test(cmd);
const touchesMain = /(^|[\s:+'"])main(\s|$|['"])/.test(cmd);

const hazards = [];
if (isGit && /\bpush\b/.test(cmd) && (touchesMain || /\bpush\s+(-\S+\s+)*origin\s*$/.test(cmd)))
  hazards.push("pushes history to `main`, which is served to real players the instant it lands");
if (isGit && /\bmerge\b/.test(cmd) && !/--abort|--no-commit\s+--no-ff\s+--stat/.test(cmd))
  hazards.push("merges branches — promotion to `main` is Wyatt's call, never the CTO's");
if (isGit && /\b(checkout|switch)\b/.test(cmd) && touchesMain && !/-b\b/.test(cmd))
  hazards.push("checks out `main` — from there an ordinary `git push` is a release");

if (!hazards.length) process.exit(0);

const since = lock.since ? ` (held since ${lock.since})` : "";
const reason = `⛔ THE CTO IS DRIVING AND MAY NOT REACH REAL PLAYERS.

The CTO lock is held by **${lock.holder || "unknown"}**${since}, on branch \`${lock.branch || "?"}\`.

This command ${hazards.join("; and it ")}.

**CLAUDE.md §6: every push to \`main\` is served to real players immediately.** There is no build
step and nothing stands between \`main\` and playpastrypirates.com. Wyatt chose "staging only,
enforced by a hook" on 2026-08-27 precisely so that days of unattended work cannot reach a player
he has not shown it to first.

**WHAT TO DO INSTEAD — this is the whole output channel, and it is not a lesser one:**

    ./scripts/deploy-staging.sh "what changed"     # -> staging.playpastrypirates.com

Wyatt plays staging, and the merge to \`main\` stays his. If he has explicitly told you to release,
he releases it himself, or he removes the lock:

    rm ${LOCK}

**Do not work around this by other means.** A CTO that finds another route to main has defeated the
one safety property it was given, and the next thing it does is unsupervised and in front of players.`;

console.log(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: "PreToolUse",
    permissionDecision: "deny",
    permissionDecisionReason: reason,
  },
}));
process.exit(0);
