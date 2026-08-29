/* Q-18 — A LINE IS NEVER DRAWN AHEAD OF THE EVENT THAT CAUSED IT.
 *
 * Wyatt's ruling, 2026-08-29, from the question UI: "Send the event too — additive, reversible: the
 * guest prefers the real event and falls back to today's picture when it's absent."
 *
 * WHAT IT IS FOR, MEASURED RATHER THAN ARGUED. The sentence and the event travel on two separate
 * Firebase paths — `rooms/<room>/narr` (set) and `rooms/<room>/ev` (push) — watched by two
 * independent listeners with no ordering between them. On the host both happen inside one local
 * call and are always in step. On the guest they are two messages that can land in either order.
 * A 12-minute two-browser game (scripts/qa/q21_purse_parity.mjs) caught it four times: twice the
 * guest drew a trade sentence while its captains box still held the pre-trade purse, and twice the
 * mirror image. Both totals were right on both screens — each had applied a COMPLETE trade, at a
 * different moment. Rule 23 in its plainest form: two things kept in step by nothing.
 *
 * THE SHAPE OF THE FIX, and each half is held below:
 *   the host stamps a SERIAL on the wire copy of each event   (never on the engine's own object —
 *     that would change what the engine emits and invalidate the determinism corpus)
 *   the narration carries the serial it belongs to
 *   the guest records how far its own feed has reached
 *   and holds a line whose event has not arrived — BOUNDED, so a dropped write degrades to exactly
 *     today's behaviour instead of stalling the story
 *
 * THIS GATE READS SOURCE TEXT AND CLAIMS ONLY THINGS ABOUT SOURCE TEXT (CEO Review 21's rule).
 * Whether the two screens actually agree is q21_purse_parity.mjs's job, in two real browsers.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
let fails = 0;
const pass = m => console.log("PASS " + m);
const fail = m => { console.log("FAIL " + m); fails++; };
const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/[^\n]*/g, "$1");
const orch = strip(fs.readFileSync(path.join(REPO, "src/orchestrator.js"), "utf8"));
const writers = strip(fs.readFileSync(path.join(REPO, "src/net/writers.js"), "utf8"));
const engine = strip(fs.readFileSync(path.join(REPO, "src/engine/index.js"), "utf8"));

/* (1) THE SERIAL IS STAMPED ON THE COPY, AND THE ENGINE IS UNTOUCHED.
   This is the assertion that protects the determinism corpus, so it is the one that matters most:
   PROJECT.md says changing what the engine emits into the event stream forces a gated re-record. */
{
  const push = (orch.match(/while\s*\(appState\.evPushed[\s\S]*?\n  \}/) || [""])[0];
  const onCopy = /JSON\.parse\(JSON\.stringify\([\s\S]{0,120}?\)\)/.test(push)
    && /\bwire\.n\s*=\s*appState\.evPushed\b/.test(push)
    && /netPushEvent\([^)]*\bwire\b/.test(push);
  /* `Game.ev` must not have grown a serial of its own. It stamps round/wind/storm/state/tokens and
     nothing else may join them without a re-record. */
  const evBody = (engine.match(/\bev\(o\)\s*\{[\s\S]*?this\.events\.push\(o\);\}/) || [""])[0];
  const engineClean = !!evBody && !/o\.n\s*=/.test(evBody);
  if (onCopy && engineClean)
    pass("the serial is stamped on the broadcast COPY (wire.n = appState.evPushed) and Game.ev still emits nothing new — the determinism corpus is untouched");
  else
    fail(`the serial is not confined to the wire (stamped on the copy:${onCopy}, engine event still clean:${engineClean}) — a field added inside Game.ev changes what the engine emits and forces a gated re-record of the whole determinism corpus`);
}

/* (2) THE LINE CARRIES THE SERIAL, AND ADDITIVELY. */
{
  const carries = /function netSetNarr\([^)]*\bevN\b[^)]*\)/.test(writers)
    && /if\s*\(evN\s*!=\s*null\)\s*payload\.evN\s*=\s*evN/.test(writers);
  const hostSends = /netSetNarr\([^;]*\bevN\b[^;]*\)/.test(orch)
    && /const evN\s*=[\s\S]{0,80}events\.length\s*-\s*1/.test(orch);
  if (carries && hostSends)
    pass("the narration payload carries the serial of the event it is about, omitted when there is none — the same additive shape `wait`, `variants` and `subj` already use");
  else
    fail(`the line does not name its event (writer carries evN:${carries}, host sends it:${hostSends})`);
}

/* (3) THE GUEST KNOWS HOW FAR ITS OWN FEED HAS REACHED. */
{
  const records = /if\(e&&e\.n!=null\)appState\.evSeen=e\.n/.test(orch);
  if (records) pass("the guest records the serial of each event as it arrives, so it can tell whether a line is ahead of its own feed");
  else fail("the guest does not record the serial of the events it consumes — it has no way to know a line is ahead of it");
}

/* (4) IT WAITS, AND THE WAIT IS BOUNDED. A wait with no ceiling turns a dropped write into a
   stalled story, which is far worse than the flicker it was added to fix. */
{
  const blk = (orch.match(/if\(v\.evN!=null[\s\S]*?\} else drawIt\(\);/) || [""])[0];
  const waits = /appState\.evSeen<v\.evN/.test(blk) && /setTimeout\(tick/.test(blk);
  const grace = (orch.match(/NARR_EVENT_GRACE_MS\s*=\s*(\d+)/) || [, null])[1];
  const bounded = !!blk && /Date\.now\(\)>=until/.test(blk) && grace != null && +grace > 0 && +grace <= 2000;
  const fallsBack = /\} else drawIt\(\);/.test(orch);
  if (waits && bounded && fallsBack)
    pass(`the guest holds a line whose event has not landed, for at most ${grace}ms, then draws anyway — and a payload with no serial draws immediately, exactly as today`);
  else
    fail(`the wait is not safe (waits for the feed:${waits}, has a ceiling of 1-2000ms:${bounded} (grace=${grace}), still draws when no serial is sent:${fallsBack}) — an unbounded wait turns one lost write into a story that stops`);
}

console.log(fails ? `\nFAILED — ${fails} failure(s)`
  : "\nPASSED — the text found: the serial rides on the broadcast copy only, the line names its event, the guest tracks its own feed, and the wait has a ceiling with today's behaviour as its floor. Whether the two screens agree is measured by scripts/qa/q21_purse_parity.mjs, not here.");
process.exit(fails ? 1 : 0);
