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

/* ⚠ WIDENED 2026-09-01, BECAUSE IT WATCHED ME SHIP FOUR UNREVIEWED ITEMS AND SAID NOTHING.
   Wyatt asked "how can you ensure the CEO is on for every turn?" after the advisor session shipped
   can_push.mjs, the Bell's output capture, the Door's publish rule and the Glass's clock fix with
   no verdict on any of them. THE FENCE WAS WORKING EXACTLY AS WRITTEN: it counted only GAME-CODE
   commits, and not one of those four touched index.html or src/. An instrument measuring a subset
   of the thing it is named for reads, from inside, exactly like an instrument finding nothing.
   SO IT NOW COUNTS REVIEWABLE WORK, not game code: any commit touching a tracked file that is not
   itself part of the record. Infrastructure IS work — the sea trial, the Bell and the Door decide
   whether the game ships, and shipping them unreviewed is the batching this fence exists to stop.
   The record files are excluded because a commit that only writes the log is not an item. */
const THRESHOLD = 3;
/* Files that are the RECORD rather than work. A commit touching only these is bookkeeping and must
   not count toward the fence, or the fence would fire on its own ledger entries forever. */
const RECORD_ONLY = [
  /^\.planning\/CTO-LEDGER\.md$/,
  /^\.planning\/CEO-REVIEWS\.md$/,
  /^\.planning\/wyclau\/(INBOX|LESSONS)\.md$/,
  /^\.planning\/wyclau\/status\//,
  /^\.planning\/CHART\.md$/,
  /^\.claude\/memory\/DECISIONS\.md$/,
];
const isRecord = (f) => RECORD_ONLY.some((re) => re.test(f));

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

    const out = git(`log ${lastReview}..HEAD --name-only --format=%H`);
    let workCommits = 0, inCommit = false, counted = false;
    for (const line of out.split("\n")) {
      const f = line.trim();
      if (/^[0-9a-f]{40}$/.test(f)) { inCommit = true; counted = false; continue; }
      if (inCommit && !counted && f && !isRecord(f)) { workCommits++; counted = true; }
    }
    if (workCommits < THRESHOLD) process.exit(0);

    /* ⚠ ONE DENIAL PER *UNREVIEWED STRETCH*, NOT PER SESSION — corrected 2026-09-01, and this was
       the bigger of the two faults. The marker used to be written once and then suppress the fence
       for the rest of the session. That is fine for a watch, which lives one item; it is useless
       for a long advisor session, where it means ONE reminder per DAY however much lands after it.
       Replayed against today's real history: the count crossed the old threshold, and the fence
       still never spoke, because it had already spent its single denial hours earlier.
       The marker now REMEMBERS WHICH REVIEW IT LAST FIRED AGAINST. A new verdict landing changes
       that sha, which re-arms the fence for the next stretch. Keeping the cadence is what buys
       silence — nothing else does. */
    const stateDir = path.join(repo, ".claude", "hooks", ".read-state", session);
    const marker = path.join(stateDir, "ceo-cadence");
    let firedAgainst = null;
    try { firedAgainst = fs.readFileSync(marker, "utf8").trim(); } catch { firedAgainst = null; }
    if (firedAgainst === lastReview) process.exit(0);            // already warned for THIS stretch
    fs.mkdirSync(stateDir, { recursive: true });
    fs.writeFileSync(marker, lastReview);

    console.log(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason:
`CEO CADENCE — ${workCommits} commits of real work (game code OR the tooling that gates it) have landed since .planning/CEO-REVIEWS.md last changed.

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
