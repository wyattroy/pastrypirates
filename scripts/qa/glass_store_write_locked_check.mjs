#!/usr/bin/env node
/* glass_store_write_locked_check.mjs — CAN A STRANGER WRITE TO WYATT'S GLASS?
 *
 * ⛔ THIS GATE IS EXPECTED TO FAIL TODAY. That is its job. It is step 1 of the four steps
 * (`.claude/CLAUDE.md` §5: show it broken FIRST), written before a line of the store move, so
 * that "we locked it down" can never be claimed against a check that was only ever green.
 *
 * WHY IT EXISTS, in his words (2026-09-06, choosing real authentication over a curtain):
 *
 *     "If other people are able to add or change parts of my Glass watch, they could completely
 *      break the game."
 *
 * He was asked a question about CONFIDENTIALITY — who can read his notes — and answered about
 * INTEGRITY, which nobody had put on the table. He is right, and the reason generalises: the Glass
 * is not a page a watch DISPLAYS, it is a page a watch OBEYS. An idea he types becomes a Chart row
 * a watch takes as its one item; a DO NOW press becomes `chartkeeper --do-now` at rank 9,000,000,
 * displacing whatever was pinned; a ruling becomes an entry in DECISIONS.md that every later
 * session treats as settled law. So an open write path is not a leak — it is a stranger holding
 * commit-adjacent authority over an autonomous build system.
 *
 * WHAT IT MEASURES, and it is deliberately the real database rather than a fixture: it attempts an
 * UNAUTHENTICATED write to a dedicated probe path, then reads it back, then deletes it. Nothing it
 * writes can collide with game data — the path is namespaced and used by nothing else.
 *
 * ⚠ IT CLEANS UP AFTER ITSELF AND SAYS SO IF IT CANNOT. A probe that leaves rubbish in his live
 * database would be a gate that damages the thing it guards.
 *
 * EXIT 0 = the store REFUSED the write (what we are building toward)
 * EXIT 1 = the store ACCEPTED it — his Glass is writable by anyone who finds the URL
 * EXIT 2 = could not reach the database at all, which is NOT a pass (rule 6: an instrument that
 *          says NOT FOUND has told you about ITSELF, not about the world)
 */
const DB = "https://pastry-pirates-default-rtdb.firebaseio.com";
const PROBE = `/_glassgate_probe/${Date.now()}.json`;
const payload = { probe: "glass_store_write_locked_check", at: new Date().toISOString() };

const say = (s) => process.stdout.write(s + "\n");
say("glass_store_write_locked_check — can an unauthenticated stranger write to his Glass store?\n");

let res;
try {
  res = await fetch(DB + PROBE, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
} catch (e) {
  say(`  UNKNOWN  could not reach ${DB} — ${e.message}`);
  say("\n  This is NOT a pass. Nothing was measured about who can write.");
  process.exit(2);
}

if (res.status === 401 || res.status === 403) {
  say(`  PASS  the store REFUSED an unauthenticated write (HTTP ${res.status}).`);
  say("        Only he can put words into his own Glass.");
  process.exit(0);
}

if (!res.ok) {
  say(`  UNKNOWN  unexpected HTTP ${res.status} — neither a clear refusal nor a clear write.`);
  say("\n  This is NOT a pass. Read the response before believing anything about it.");
  process.exit(2);
}

/* It took the write. Prove it actually LANDED rather than trusting a 200 — a status code is a
   claim about the request, not about the database (rule 6, red-proof the instrument). */
const back = await fetch(DB + PROBE).then((r) => r.json()).catch(() => null);
const landed = back && back.probe === payload.probe;

let cleaned = false;
try {
  const del = await fetch(DB + PROBE, { method: "DELETE" });
  cleaned = del.ok;
} catch { /* reported below */ }

say(`  FAIL  the store ACCEPTED an unauthenticated write (HTTP ${res.status}).`);
say(`        read back and confirmed present: ${landed ? "YES — it really landed" : "no"}`);
say(`        probe deleted afterwards: ${cleaned ? "yes, nothing left behind" : "⚠ NO — remove " + PROBE}`);
say("");
say("  WHAT THIS MEANS, in plain terms: anyone who finds the database URL can put words into");
say("  his Glass. Those words are not decoration — an idea becomes a task a watch picks up, a");
say("  DO NOW press re-orders what gets built next, and a ruling becomes settled law every");
say("  later session obeys. This is the danger he named, measured rather than assumed.");
say("");
say("  THE FIX IS HIS HANDS, not a session's: a Firebase security rule on this path, set in his");
say("  console. No session can reach it. Until it is set, the store move must not ship.");
process.exit(1);
