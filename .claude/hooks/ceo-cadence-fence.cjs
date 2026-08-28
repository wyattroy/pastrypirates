#!/usr/bin/env node
/* ceo-cadence-fence.cjs — the mechanical half of "CEO after EVERY item" (rule 25).
 *
 * WHY THIS EXISTS (2026-08-28). Wyatt ordered per-item CEO reviews twice ("CEO after every item,
 * not just at the end", 04:14; "I want CEO to review after every item", 15:30) and CEO Review 9
 * caught the once-at-the-end pattern recurring across two windows anyway. Review 10's own words:
 * "this one is still only words on a page — words that have now failed you twice... the next step
 * is a mechanical fence (a check that notices work landing while the review file sits untouched),
 * and I would not wait for a fourth occurrence to build it." This is that fence, built on the
 * verdict rather than after the next failure.
 *
 * WHAT IT DOES. On a `git commit`, it counts how many commits touching GAME CODE have landed since
 * `.planning/CEO-REVIEWS.md` last changed. At the threshold it denies the commit ONCE per session
 * (same speed-bump-not-wall marker protocol as qa-gear-first.cjs): the retry goes through, but the
 * reminder has arrived at the moment of the action instead of in a file nobody re-reads.
 *
 * THE THRESHOLD IS 5, and here is the reasoning rather than a bare number: an item's four-step loop
 * legitimately lands several commits (failing gate, fix, docs/ledger), so 1-4 game commits with no
 * review is normal mid-item work. Five game-code commits with the review file untouched is the
 * batching smell Review 9 described — more than one item's worth of work with no verdict landed.
 *
 * IT NEVER BLOCKS THE REVIEW ITSELF: a commit whose staged files include CEO-REVIEWS.md is the
 * verdict landing, and passes untouched. It never blocks on its own errors either — any git or
 * parse failure exits 0, because a broken fence must fail open, not hold the gate shut.
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const THRESHOLD = 5;

function main() {
  let input;
  try { input = JSON.parse(fs.readFileSync(0, "utf8")); } catch { process.exit(0); }
  if ((input.tool_name || "") !== "Bash") process.exit(0);
  const cmd = String((input.tool_input || {}).command || "");
  if (!/git\s+commit/.test(cmd)) process.exit(0);

  const repo = process.env.CLAUDE_PROJECT_DIR || path.resolve(__dirname, "..", "..");
  const session = String(input.session_id || "nosession").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 64) || "nosession";
  const git = (args) => execSync(`git ${args}`, { cwd: repo, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });

  try {
    // the review landing now? let it through — that commit IS the cadence being kept
    const staged = git("diff --cached --name-only");
    if (/\.planning\/CEO-REVIEWS\.md/.test(staged)) process.exit(0);

    const lastReview = git("log -1 --format=%H -- .planning/CEO-REVIEWS.md").trim();
    if (!lastReview) process.exit(0);   // no review has ever landed: nothing to measure against

    // one source for "what is game code" — the same lib the gear hook reads (rule 23)
    const { isGameCode } = require(path.join(__dirname, "lib", "game-code.cjs"));
    const out = git(`log ${lastReview}..HEAD --name-only --format=%H`);
    let gameCommits = 0, inCommit = false, counted = false;
    for (const line of out.split("\n")) {
      if (/^[0-9a-f]{40}$/.test(line.trim())) { inCommit = true; counted = false; continue; }
      if (inCommit && !counted && line.trim() && isGameCode(line.trim())) { gameCommits++; counted = true; }
    }
    if (gameCommits < THRESHOLD) process.exit(0);

    const stateDir = path.join(repo, ".claude", "hooks", ".read-state", session);
    const marker = path.join(stateDir, "ceo-cadence");
    if (fs.existsSync(marker)) process.exit(0);                  // one denial per session
    fs.mkdirSync(stateDir, { recursive: true });
    fs.writeFileSync(marker, new Date().toISOString());

    console.log(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason:
`CEO CADENCE — ${gameCommits} game-code commits have landed since .planning/CEO-REVIEWS.md last changed.

Wyatt's standing order (given twice, 2026-08-28): "I want CEO to review after every item."
The unit is the ITEM — each thing he asked for closes with its own fresh-context CEO verdict,
appended to .planning/CEO-REVIEWS.md, BEFORE the next item starts.

If the current item is genuinely still mid-flight, retry this commit — it will go through.
If an item has finished without its verdict, run the CEO first:

    node scripts/qa/ceo_brief.mjs --ask="<his request for THAT item, VERBATIM>"

then spawn a fresh-context reviewer with the brief, append its verdict verbatim, and commit
that with the item. Full contract: .claude/CEO-BRIEF.md.

Why this is a hook: the rule failed twice as words on a page. CEO Review 10 asked for the fence.`,
      },
    }));
  } catch { process.exit(0); }   // fail open, always
  process.exit(0);
}
main();
