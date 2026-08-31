#!/usr/bin/env node
/* glass-harvest-first.cjs — the structural half of the Glass's harvest rule.
 *
 * WHY THIS EXISTS (2026-08-31, the day Glass v2 shipped). The Glass is Wyatt's interface: he
 * writes ideas ON the page and the page saves them into itself. Those words live ONLY in the
 * published page until a session copies them into .planning/CHART.md. And glass.mjs always
 * regenerates the page with an EMPTY ideas list, because a script cannot read the artifact.
 *
 * SO A PUBLISH WITHOUT A HARVEST DELETES WHAT HE WROTE. It is a silent, total loss of the one
 * thing the interface exists to carry.
 *
 * THE INCIDENT THAT EARNED IT, THE SAME DAY, MEASURED NOT PREDICTED: the Razer engine
 * republished the Glass at 17:26:36Z having never read the live page. Nothing was lost only
 * because the ideas list happened to be empty. The rule was written in the Door and in
 * glass.mjs's own output, and it still did not reach a session that was not reading the Door
 * at that moment. CEO Review 47 had already called the count wrong ("three places" — the gate
 * holds no harvest check) and named the gap: prose, and this project's record says prose rots.
 *
 * WHAT IT DOES. Before an Artifact publish whose file_path is the Glass, it requires evidence
 * that this session read the live page first: a fresh .planning/wyclau/LAST-HARVEST stamp.
 * Missing or stale ⇒ deny once, with the exact steps. Write the stamp and the retry goes
 * through. A speed bump, not a wall.
 *
 * WHAT IT DELIBERATELY IS NOT. It cannot prove the ideas were actually copied into the Chart —
 * nothing here can read the artifact either. It guarantees the requirement ARRIVES at the
 * moment of the publish, which is precisely what was missing. Same honesty as qa-gear-first.
 *
 * IT MUST NEVER WEDGE ANYTHING. It touches exactly one tool call shape (an Artifact publish of
 * glass.html) and lets the retry through. It never blocks the heartbeat, npm test, git, or any
 * other publish: the Glass is how Wyatt sees the engine is alive, and a hook that could stop
 * the Glass being published would break the thing it is guarding.
 */
const fs = require("fs");
const path = require("path");

const STAMP = ".planning/wyclau/LAST-HARVEST";
const FRESH_MIN = 30; // a read older than this belongs to earlier work, not to this publish

function main() {
  let input = "";
  try { input = fs.readFileSync(0, "utf8"); } catch { process.exit(0); }
  let ev;
  try { ev = JSON.parse(input); } catch { process.exit(0); }

  if (ev.tool_name !== "Artifact") process.exit(0);
  const inp = ev.tool_input || {};
  // Only a PUBLISH of the Glass. read/list/status/comments and every other artifact go free.
  const action = inp.action || "publish";
  if (action !== "publish") process.exit(0);
  const fp = String(inp.file_path || "");
  if (!/glass\.html$/.test(fp)) process.exit(0);

  const root = ev.cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const stampPath = path.join(root, STAMP);
  let ageMin = Infinity;
  try { ageMin = (Date.now() - fs.statSync(stampPath).mtimeMs) / 60000; } catch {}
  if (ageMin <= FRESH_MIN) process.exit(0); // harvested in this working window — go ahead

  const reason = `HARVEST BEFORE YOU REPUBLISH THE GLASS — his words are on that page, and this
publish would overwrite them.

The Glass is two-way. Wyatt writes ideas ON the published page; they live in its
<script id="glassState"> block and NOWHERE ELSE. glass.mjs always regenerates with an
empty ideas list, because a script cannot read the artifact. So publishing over a live
page that holds unharvested ideas deletes them silently and completely.

DO THIS FIRST — three steps, about a minute:

  1. READ THE LIVE PAGE
       Artifact  action:"read"  url:"https://claude.ai/code/artifact/74034bde-ad7e-4861-913e-d5d190801af2"
     then find its state block:
       grep -o 'id="glassState">[^<]*' <the saved file>

  2. IF ideas[] IS NOT EMPTY, move every entry into .planning/CHART.md under
     "## THE IDEA INBOX" — his words verbatim, plus your recommendation — and commit.
     Each idea gets a fate (SHIPPED / SCHEDULED where / PARKED why) within a day.

  3. STAMP THAT YOU DID IT, then regenerate and publish:
       date -u +%Y-%m-%dT%H:%M:%SZ > ${STAMP}
       node scripts/wyclau/glass.mjs --note "..."

WHY A HOOK AND NOT A NOTE. This rule was written in the Door and printed by glass.mjs on
every run, and on 2026-08-31 at 17:26:36Z an engine republished the Glass without reading
the live page anyway. Nothing was lost — the list happened to be empty. A prompt you are
holding is a prompt you can skip; a rule that fires at the moment of the action is not.

This cannot prove you copied the ideas across — nothing here can read the artifact either.
It only guarantees you were asked at the right moment. Stamp it and the retry goes through.`;

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
