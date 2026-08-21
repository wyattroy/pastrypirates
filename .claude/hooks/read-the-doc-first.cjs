#!/usr/bin/env node
/* read-the-doc-first.cjs — the structural half of CLAUDE.md rule 17.
 *
 * WHY THIS EXISTS (2026-08-19). Rule 17 says "read the subsystem's own design doc before writing a
 * line", and CLAUDE.md §4 carries the table of which doc goes with which subsystem. On 2026-08-19 a
 * session passed docs/DRIVING-THE-GAME.md faithfully to all four of its subagents, then picked up a
 * browser itself and never read it. It joined a crew game the wrong way (§5c documents the name
 * modal it skipped), hand-rolled a driver §5b already contains, and stalled Wyatt's table twice.
 * Wyatt: "why did i have to tell you to read that? how can you fix yourself to actually read the
 * things you need to read next time, without me having to remember that they exist?"
 *
 * The answer is not another rule. BOTH failures happened with rule 17 already in context — it was
 * present and did not fire. What was missing is a gate at the ROLE SWITCH, the moment a session
 * stops dispatching work and starts doing it. A document cannot enforce that. A hook can.
 *
 * WHAT IT DOES. On Edit/Write it reads the target path; on Bash it reads the command. If either
 * touches a subsystem in the §4 table, the FIRST attempt in a session is denied with the doc named.
 * A marker under .claude/hooks/.read-state/<session>/ then lets the retry through, so this is a
 * speed bump that cannot be missed, not a wall that stops work.
 *
 * Deliberately NOT a proof of reading — nothing here can know whether a file was understood. It
 * guarantees the reminder arrives at the moment of the action, which is the thing that was missing.
 */
const fs = require("fs");
const path = require("path");

/* The §4 table, as data. Add a row here in the same commit that adds a doc to CLAUDE.md §4. */
const SUBSYSTEMS = [
  {
    id: "trade",
    docs: ["docs/TRADE-SYSTEM.md"],
    why: "anything that trades",
    paths: [/trade/i, /4\/src\/ui\/flow\.js$/],
    code: [/humanTrade|counterOffer|respondToOffer|composeOffer|openingBid|settleTrade|botOpenOffer/],
  },
  {
    id: "audio",
    docs: ["docs/AUDIO.md"],
    why: "sound, music, or the mute control",
    paths: [/audio|sound|music|mute/i],
    code: [/playSfx|muteSlot|pp_muted|audioCtx/],
  },
  {
    id: "board",
    docs: ["docs/BOARD-RENDERING.md"],
    why: "anything drawn on the board",
    paths: [/4\/src\/ui\/(board|stage)\.js$/],
    code: [/CAM_HTML_LAYERS|camFit|sailHighlightRect|buildStage|boatUXY/],
  },
  {
    id: "bots",
    docs: ["docs/BOT-DESIGN-PRINCIPLES.md", "docs/BOT-V3-RACE-PLANNER.md"],
    why: "bot behaviour or tuning",
    paths: [/bot|planner/i],
    code: [/acquireTurns|racePlan|botTurn|strategies/],
  },
  {
    id: "driving",
    docs: ["docs/DRIVING-THE-GAME.md"],
    why: "browser or playtest automation",
    paths: [],
    /* the role-switch case: the session is about to drive a browser or stand up a server itself */
    bash: [
      /remote-debugging-port/i,
      /Google Chrome/i,
      /chromium|puppeteer|playwright|safaridriver|webdriver/i,
      /http\.server/i,
      /--headless/i,
    ],
  },
  {
    id: "deploy",
    docs: ["docs/GIT-AND-DEPLOY.md"],
    why: "git, deploying, or the live domain",
    paths: [/^(CNAME|robots\.txt|sitemap\.xml)$/],
    bash: [
      /git\s+push/i,
      /deploy-preview/i,
      /\brsync\b/i,
      /playpastrypirates\.com/i,
      /gh-pages/i,
    ],
  },
];

function readStdin() {
  try { return fs.readFileSync(0, "utf8"); } catch { return ""; }
}

/* The SKELETON of a shell command — what it DOES, with the prose it carries stripped out.
 *
 * Earned immediately: the very first commit of this hook was blocked by this hook, because its
 * commit message *described* a deploy ("git push", "playpastrypirates.com") inside a heredoc. A
 * commit message about deploying is not a deploy. Matching the raw command string means any
 * command that merely mentions a trigger word fires, which trains the reader to ignore it — the
 * exact failure mode this hook exists to prevent.
 *
 * So: drop heredoc bodies, drop quoted string literals, and match only what remains. */
/* Looking at something is not doing it.
 *
 * Third false positive of the hook's first hour: `pgrep -f remote-debugging-port | wc -l` tripped
 * the browser rule while merely counting processes — and it did so in the middle of reading a probe
 * result, which is exactly the noise that gets a gate ignored. Checking whether a browser is running,
 * or killing a stray one, is housekeeping; it does not need the driving doc. DRIVING it does.
 *
 * A command counts as inspection only when EVERY segment of it is one of these verbs, so a real
 * launch piped into grep is still a launch. */
const INSPECT = /^(pgrep|pkill|ps|lsof|kill|killall|ls|cat|head|tail|wc|grep|rg|find|echo|printf|which|type|stat|file|du|df|sed|awk|sort|uniq|cut|tr|jq|node\s+-e|test|\[)\b/;
function inspectionOnly(cmd) {
  const segs = String(cmd).split(/\||&&|;|\n/).map(s => s.trim()).filter(Boolean);
  if (!segs.length) return false;
  return segs.every(s => INSPECT.test(s.replace(/^\(+\s*/, "")));
}

function skeleton(cmd) {
  let s = String(cmd);
  // heredocs: <<EOF ... EOF and <<'EOF' ... EOF (also <<- variants)
  s = s.replace(/<<-?\s*(['"]?)([A-Za-z_][A-Za-z0-9_]*)\1[\s\S]*?^\s*\2\s*$/gm, " <<HEREDOC ");
  // an unterminated heredoc (still being written): drop everything after the opener
  s = s.replace(/<<-?\s*(['"]?)[A-Za-z_][A-Za-z0-9_]*\1[\s\S]*$/, " <<HEREDOC ");
  // quoted literals — commit messages, echo payloads, -m "..."
  s = s.replace(/'(?:[^'\\]|\\.)*'/g, " 'STR' ").replace(/"(?:[^"\\]|\\.)*"/g, ' "STR" ');
  return s;
}

function main() {
  const raw = readStdin();
  let input;
  try { input = JSON.parse(raw); } catch { process.exit(0); }   // unparseable: never block

  const tool = input.tool_name || "";
  const ti = input.tool_input || {};
  const session = String(input.session_id || "nosession").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 64) || "nosession";

  const filePath = String(ti.file_path || "");
  const command = String(ti.command || "");
  const content = String(ti.content || ti.new_string || "");

  // repo-relative path, so the table's patterns read the way CLAUDE.md writes them
  // derived, never typed: a cloud clone (2026-08-21) lives under a different path. Claude Code sets
  // CLAUDE_PROJECT_DIR for hooks; the fallback is this file's own location (.claude/hooks/ -> repo).
  const repo = process.env.CLAUDE_PROJECT_DIR || path.resolve(__dirname, "..", "..");
  const rel = filePath.startsWith(repo) ? filePath.slice(repo.length + 1) : filePath;

  /* Only GAME SOURCE counts as touching a subsystem.
   *
   * Earned the same way the skeleton() fix was: writing this hook's own test file tripped the board
   * rule, because the test's fixture text contains buildStage(). A test that mentions a function is
   * not touching the board, a design doc that describes trading is not trading, and a planning
   * record that quotes code is not code. Content matching outside real source is all false
   * positives, and false positives are what teach a reader to dismiss a gate. */
  const isSource = /^(4\/(src|scripts)|src|scripts)\//.test(rel) && /\.(js|mjs|cjs|html|css)$/.test(rel);
  const isNarrative = /^(docs|\.planning|\.claude|notes)\//.test(rel);

  const hits = [];
  for (const s of SUBSYSTEMS) {
    let hit = false;
    if ((tool === "Edit" || tool === "Write" || tool === "NotebookEdit") && !isNarrative) {
      if (rel && (s.paths || []).some(re => re.test(rel))) hit = true;
      if (!hit && isSource && content && (s.code || []).some(re => re.test(content))) hit = true;
    }
    if (tool === "Bash" && command && !inspectionOnly(command)) {
      if ((s.bash || []).some(re => re.test(skeleton(command)))) hit = true;
    }
    if (hit) hits.push(s);
  }
  if (!hits.length) process.exit(0);

  // one denial per subsystem per session — a speed bump, not a wall
  const stateDir = path.join(repo, ".claude", "hooks", ".read-state", session);
  const fresh = [];
  for (const s of hits) {
    const marker = path.join(stateDir, s.id);
    if (!fs.existsSync(marker)) fresh.push({ s, marker });
  }
  if (!fresh.length) process.exit(0);

  try { fs.mkdirSync(stateDir, { recursive: true }); } catch {}
  for (const f of fresh) { try { fs.writeFileSync(f.marker, new Date().toISOString()); } catch {} }

  const lines = fresh.map(({ s }) =>
    `  • ${s.why} → ${s.docs.join("  AND  ")}`
  );

  const reason =
`CLAUDE.md rule 17 — read the subsystem's design doc BEFORE writing a line.

This action touches:
${lines.join("\n")}

Read it now (the whole file if it is short; otherwise its table of contents and every
section that bears on what you are about to do — not just the one matching your current
error message). Then run this again; it will go through.

Why you are seeing this: on 2026-08-19 a session passed DRIVING-THE-GAME.md to all four of
its subagents and then drove a browser itself without reading it — skipping the documented
join flow and re-deriving a driver §5b already contains. Rule 17 was in context both times
and did not fire. The trigger is the ROLE SWITCH: the moment you stop dispatching work and
start doing it, you owe the same reading any subagent does.

This fires once per subsystem per session.`;

  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: reason,
    },
  }));
  process.exit(0);
}

main();
