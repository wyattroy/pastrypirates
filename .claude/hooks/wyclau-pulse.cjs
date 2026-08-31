'use strict';
/* WYCLAU PULSE — stamp evidence that a session is alive, on every tool call.
 *
 * WHY THIS IS NOT THE HEARTBEAT. `.planning/wyclau/HEARTBEAT` is a DELIBERATE pulse: a session
 * narrates what it is doing through glass.mjs, and the Glass shows that sentence. It is a
 * statement of intent, and the Door asks for one every 20 minutes. Two things it cannot do:
 *
 *   1. A session that is busy and simply not narrating looks exactly like a session that died.
 *      On 2026-08-31 the engine launched at 15:09:01Z worked to ~15:24Z, went quiet WITHOUT
 *      EXITING, and the 16:16:02Z watchdog tick launched a second engine on top of it. Nothing
 *      was broken -- the signal was wrong. CEO Review 44 parked this one window before it fired.
 *   2. The pulse rule is written for the UNATTENDED engine, and nothing carried it to a session a
 *      human is typing at. An interactive session pulses only if it remembers to, and the one
 *      that wrote this hook did not, for its first 6m29s.
 *
 * So LAST-ACTIVITY is EVIDENCE rather than narration: it is stamped here, by the harness, on every
 * tool call any session makes. Nobody has to remember it. watchdog.ps1 trusts whichever of the two
 * clocks is newer, and treats a MISSING LAST-ACTIVITY as "no information", never as "alive" --
 * absent must not wedge the watchdog shut.
 *
 * THIS HOOK MUST NEVER BLOCK A TOOL CALL. It exits 0 on every path, including every failure. A
 * liveness stamp that can break the session it is measuring is worse than no stamp at all.
 */
const fs = require('fs');
const path = require('path');

const RATE_LIMIT_MS = 60 * 1000;   // one write a minute is plenty against a 45-minute threshold

try {
  const repo = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const dir = path.join(repo, '.planning', 'wyclau');
  const file = path.join(dir, 'LAST-ACTIVITY');

  // Only stamp inside a tree that already has the wyclau directory. Creating it here would
  // scatter the file into unrelated checkouts, and a stamp in the wrong tree is worse than none.
  if (fs.existsSync(dir)) {
    let stale = true;
    try { stale = (Date.now() - fs.statSync(file).mtimeMs) > RATE_LIMIT_MS; } catch { stale = true; }
    if (stale) {
      fs.writeFileSync(file, new Date().toISOString() + '\ta session made a tool call here\n');
    }
  }
} catch { /* never block a tool call — see the header */ }

process.exit(0);
