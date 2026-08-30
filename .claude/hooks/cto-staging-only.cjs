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
/* MATCH THE ACTION, NOT THE PROSE. Added 2026-08-27 after this hook blocked a `git commit` whose
   MESSAGE said "every push to main is served to real players" — and a read-only
   `git merge-base --is-ancestor`, which asks a question and changes nothing.

   Why that is worth fixing rather than writing round: this repo's commit messages are deliberately
   long and they discuss pushing, merging and `main` constantly, because that is what the hard-won
   lessons are ABOUT. A gate that makes the house style unusable is a gate people start disabling —
   and the CTO's instruction is "do not work around this by other means", which only holds if the
   gate is not blocking things that cannot possibly reach a player.

   TWO SCRUBS, both of which remove DATA and never a command:
     · quoted spans — a commit message, an echo, a grep pattern. `git push origin "main"` survives
       it, because clause 1 also catches `push … origin` with nothing after it.
     · heredoc BODIES — the lines between `<<'MSG'` and the line that is exactly `MSG`. The
       terminator and everything after it are kept, so `<<MSG … MSG` followed by `git push origin
       main` is still caught.
   Everything the hook actually reasons about is a git subcommand, which cannot hide inside either.

   PROVEN BOTH WAYS by scripts/qa/cto_gate_check.js: all ten spellings of a route to `main` are
   still denied, and the three false positives are allowed. A gate relaxed without a red-proof is
   a gate disarmed. */
/* SCRUB THE MESSAGE, NOT EVERY QUOTE — corrected 2026-08-28 after a CEO review found two holes.
   The first version removed EVERY quoted span so that a commit message discussing "push to main"
   would stop tripping the gate. That worked, and it also made `bash -c "git push origin main"`
   invisible, because the dangerous command was itself inside quotes. The CEO ran five spellings
   against the hook and two got through; it then checked the PRE-relaxation hook at 7393ace1 and
   found the same two got through there too, so the hole is older than the fix that exposed it.

   THE PRECISE DISTINCTION, and it is the whole design: a COMMIT MESSAGE is the only place in a git
   command line where arbitrary English is expected. It arrives one of two ways — as the argument to
   -m/--message, or as a heredoc body feeding -F -. Those two, and only those two, are removed.
   Every other quoted string is left in place and inspected, so a command hidden inside quotes is
   still read. `git push origin "main"` and `bash -c "git push origin main"` both survive to be
   judged; `git commit -m "every push to main is served to real players"` does not. */
const scrub = (c) => {
  const lines = c.split("\n");
  const kept = [];
  let term = null;
  for (const line of lines) {
    if (term !== null) { if (line.trim() === term) term = null; continue; }   // drop heredoc body
    kept.push(line);
    const h = line.match(/<<-?\s*['"]?([A-Za-z_][A-Za-z0-9_]*)['"]?/);
    if (h) term = h[1];
  }
  return kept.join("\n")
    .replace(/(^|\s)(-m|--message)(=|\s+)'[^']*'/g, "$1$2 ")
    .replace(/(^|\s)(-m|--message)(=|\s+)"[^"]*"/g, "$1$2 ");
};
const scrubbed = scrub(cmd);

/* `git` ANYWHERE, not only at the start of the line. The old test required the command to begin
   with git or follow a ;&| — so wrapping it in another shell (`bash -c "git push origin main"`)
   walked straight past. A shell wrapper is not a different intention. */
const isGit = /\bgit\b/.test(scrubbed);
/* WHAT COUNTS AS NAMING `main`. The trailing set used to be whitespace, end, or a quote — so
   `git push origin $(echo main)` walked through on a closing parenthesis. A CEO found that by
   trying spellings this file's author had not. Shell metacharacters now close the word too.
   Still deliberately NOT a bare \bmain\b: that matches "domain", "maintain" and "main.js", and a
   gate that fires on the word "domain" is a gate people start switching off. */
const touchesMain = /(^|[\s:+'"\/])main([\s'")\];:;&|]|$)/.test(scrubbed);

const hazards = [];
if (isGit && /\bpush\b/.test(scrubbed) && (touchesMain || /\bpush\s+(-\S+\s+)*origin\s*$/.test(scrubbed)))
  hazards.push("pushes history to `main`, which is served to real players the instant it lands");
if (isGit && /\bmerge\b(?![-\w])/.test(scrubbed) && !/--abort|--no-commit\s+--no-ff\s+--stat/.test(scrubbed))
  hazards.push("merges branches — promotion to `main` is Wyatt's call, never the CTO's");
if (isGit && /\b(checkout|switch)\b/.test(scrubbed) && touchesMain && !/-b\b/.test(scrubbed))
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
