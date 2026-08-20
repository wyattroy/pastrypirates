#!/usr/bin/env node
/* Precision test for read-the-doc-first.cjs.
 *
 * The FALSE-POSITIVE half is the point. A gate that fires on prose merely mentioning a trigger word
 * trains its reader to dismiss it, which is worse than no gate at all. Two rows here are real
 * incidents from the hook's own first hour:
 *   - row "commit whose HEREDOC MESSAGE mentions..." — the hook blocked its own first commit,
 *     because that commit message described a deploy.
 *   - row "editing this hook's own test file" — writing this file tripped the board rule, because
 *     the fixture text below names a board function.
 * Both must stay silent.
 *
 * Run: node .claude/hooks/read-the-doc-first.test.cjs
 */
const { execFileSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const HOOK = path.join(__dirname, "read-the-doc-first.cjs");
const STATE = path.join(__dirname, ".read-state");
const REPO = "/Users/wyattroy/Documents/Projects/pastrypirates";
fs.rmSync(STATE, { recursive: true, force: true });

const BOARD_FN = "build" + "Stage()";        // split so this file is not its own fixture by accident

const BASH = [
  ["a REAL git push", "s1", "git push origin main", true],
  ["commit whose HEREDOC MESSAGE mentions git push + the live domain", "s2",
    "git commit -F - <<'EOF'\nchore: notes about git push and playpastrypirates.com\nEOF", false],
  ["commit with -m mentioning rsync and deploy", "s3",
    'git commit -m "fix: rsync and git push notes"', false],
  ["a REAL chrome launch", "s4",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome --headless=new --remote-debugging-port=9501", true],
  ["echo that merely NAMES chrome", "s5", "echo 'launching Google Chrome soon'", false],
  ["a REAL local server", "s6", "python3 -m http.server 8613", true],
  ["plain ls", "s7", "ls -la", false],
  ["grep whose PATTERN mentions the live domain", "s8", "grep -rn 'playpastrypirates.com' docs/", false],
  ["the deploy script for real", "s9", "bash scripts/deploy-preview.sh", true],
  ["pgrep COUNTING browsers (inspection, not driving)", "s10", "pgrep -f remote-debugging-port | wc -l", false],
  ["pkill cleaning up strays (housekeeping)", "s11", "pkill -f remote-debugging-port", false],
  ["a real launch PIPED into grep is still a launch", "s12",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome --headless=new | grep ok", true],
];

const EDITS = [
  ["editing the board renderer", "e1", `${REPO}/4/src/ui/stage.js`, BOARD_FN, true],
  ["editing a planning record", "e2", `${REPO}/.planning/STATE.md`, "notes about " + BOARD_FN, false],
  ["editing a design doc", "e3", `${REPO}/docs/BOARD-RENDERING.md`, "prose about " + BOARD_FN, false],
  ["editing this hook's own test file", "e4", `${REPO}/.claude/hooks/read-the-doc-first.test.cjs`, BOARD_FN, false],
  ["editing the trade flow", "e5", `${REPO}/4/src/ui/flow.js`, "humanTrade(p)", true],
];

let bad = 0;
const fired = (tool, session, tool_input) => {
  const payload = JSON.stringify({ session_id: session, tool_name: tool, tool_input });
  try { return execFileSync("node", [HOOK], { input: payload }).toString().includes("permissionDecision"); }
  catch { return false; }
};
const row = (ok, name, got, want) => {
  if (!ok) bad++;
  console.log(`  ${ok ? "ok  " : "BAD "} ${name} -> fired:${got} expected:${want}`);
};

console.log("Bash:");
for (const [name, sess, command, want] of BASH) {
  const got = fired("Bash", sess, { command });
  row(got === want, name, got, want);
}
console.log("Edit/Write:");
for (const [name, sess, file_path, new_string, want] of EDITS) {
  const got = fired("Edit", sess, { file_path, new_string });
  row(got === want, name, got, want);
}

const a = fired("Bash", "rep", { command: "git push origin main" });
const b = fired("Bash", "rep", { command: "git push origin main" });
row(a === true && b === false, "fires once per subsystem per session", `${a}/${b}`, "true/false");

fs.rmSync(STATE, { recursive: true, force: true });
console.log(bad ? `\n${bad} CASE(S) WRONG` : "\nall cases correct");
process.exit(bad ? 1 : 0);
