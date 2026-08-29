/* Q-18 — A LINE IS NEVER DRAWN AHEAD OF THE EVENT THAT CAUSED IT, AND BOTH SEATS DECIDE WITH ONE RULE.
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
 * THIS GATE READS SOURCE TEXT AND MAY ONLY CLAIM THINGS ABOUT SOURCE TEXT (CEO Review 21's rule).
 * Every pass line below therefore names the TEXT IT FOUND, not the behaviour it hopes that text
 * produces. Whether the two screens actually agree is q21_purse_parity.mjs's job, in two browsers.
 *
 * REBUILT 2026-08-29 AFTER CEO REVIEW 24 WALKED SIX WORKING BREAKAGES PAST THE FIRST VERSION GREEN,
 * including one where the guest silently swallows narration lines forever. Each is now named beside
 * the assertion that stops it, so the next person can see what a hole here actually looks like.
 */
/* ONE STRIPPER (2026-08-29). Every gate carried its own copy, and every copy deleted BLOCK
   comments first — so a LINE comment containing the characters that open one swallowed 152
   lines of src/orchestrator.js, the whole import block included, in eight gates at once.
   See scripts/qa/lib/strip_comments.mjs for the measurement. */
import { stripComments as strip } from "./lib/strip_comments.mjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
let fails = 0;
const pass = m => console.log("PASS " + m);
const fail = m => { console.log("FAIL " + m); fails++; };
const read = rel => strip(fs.readFileSync(path.join(REPO, rel), "utf8"));
const orch = read("src/orchestrator.js");
const writers = read("src/net/writers.js");
const engine = read("src/engine/index.js");
const shared = read("src/shared/index.js");

/* (1) THE ENGINE STILL EMITS EXACTLY WHAT IT EMITTED. This is the assertion that protects the
   determinism corpus — CLAUDE.md's Project section: changing what the engine emits into the event
   stream invalidates the whole corpus and forces a gated re-record.
   BREAKAGE 1, WALKED PAST THE OLD VERSION: `o["n"]=this.events.length;`. The old guard was
   `!/o\.n\s*=/` — one spelling of one property access, protecting the most expensive thing in the
   repo. It now reads every property `ev(o)` assigns onto `o`, in BOTH spellings, and compares that
   SET against what the corpus was recorded with. A new field of any name fails, whatever it is
   called and however it is written. */
{
  const body = (engine.match(/\bev\(o\)\s*\{[\s\S]*?this\.events\.push\(o\);\}/) || [""])[0];
  const RECORDED = ["round", "wind", "storm", "wind2", "state", "tokens"];
  const assigned = [...body.matchAll(/\bo(?:\.([A-Za-z_$][\w$]*)|\[\s*["'`]([^"'`]+)["'`]\s*\])\s*=/g)]
    .map(m => m[1] || m[2]);
  const extra = [...new Set(assigned)].filter(k => !RECORDED.includes(k));
  const missing = RECORDED.filter(k => !assigned.includes(k));
  if (body && !extra.length && !missing.length)
    pass(`ev(o) assigns exactly {${RECORDED.join(", ")}} onto the event and nothing else — the text the determinism corpus was recorded against, in either spelling`);
  else
    fail(`ev(o)'s emitted field set has moved (found body:${!!body} unexpected:[${extra}] missing:[${missing}]) — anything added here changes what the engine emits and forces a gated re-record of the whole determinism corpus (CLAUDE.md, Project)`);
}

/* (2) AND THE ENGINE'S OWN ARRAY IS NEVER WRITTEN THROUGH FROM OUTSIDE.
   BREAKAGE 2: `appState.game.events[appState.evPushed].n=appState.evPushed;` beside the wire stamp.
   The old version only ever looked inside ev(o), so dirtying the array from the orchestrator was
   invisible to it. The serial must live on the DEEP COPY and nowhere else. */
{
  const stampsCopy = /const wire\s*=\s*JSON\.parse\(JSON\.stringify\([\s\S]{0,120}?\)\)/.test(orch)
    && /\bwire\.n\s*=\s*appState\.evPushed\b/.test(orch)
    && /netPushEvent\([^)]*\bwire\b/.test(orch);
  /* any assignment INTO the events array, however indexed — `events[i].x =`, `events[i] =` */
  const writesThrough = [...orch.matchAll(/\bgame\.events\s*\[[^\]]*\]\s*(?:\.[\w$]+\s*)?=[^=]/g)].map(m => m[0].trim());
  if (stampsCopy && !writesThrough.length)
    pass("the serial is written onto the deep copy (`wire.n = appState.evPushed`) and no text anywhere in the orchestrator assigns into game.events[...] — the engine's own array is only ever pushed to");
  else
    fail(`the engine's array is not protected (stamps the copy:${stampsCopy} writes found into game.events[...]:[${writesThrough}]) — a field written onto the engine's own event object is a field the corpus was not recorded with`);
}

/* (3) THE LINE CARRIES THE SERIAL, ADDITIVELY, AND THE FIELD IS SET IN EXACTLY ONE PLACE.
   BREAKAGE 3: append `payload.evN = 0;` after the required line. Every line then names event 0,
   nothing ever waits, and the whole fix is off with all the old assertions still matching. A
   single-assignment count is what stops it — and it is the same shape as the `subj` field beside
   it, which also has exactly one write. */
{
  const guarded = /if\s*\(evN\s*!=\s*null\)\s*payload\.evN\s*=\s*evN/.test(writers);
  const writes = (writers.match(/payload\.evN\s*=/g) || []).length;
  const inSignature = /function netSetNarr\([^)]*\bevN\b[^)]*\)/.test(writers);
  if (guarded && inSignature && writes === 1)
    pass("netSetNarr takes evN and writes payload.evN in exactly one place, behind a null guard — the same additive shape `wait`, `variants` and `subj` already use, and no second write that could pin it to a constant");
  else
    fail(`the serial field is not sound (in the signature:${inSignature} guarded write present:${guarded} total writes to payload.evN:${writes}, must be 1) — a second assignment can pin every line to one serial and silently disable the wait while every other assertion here still matches`);
}

/* (4) -1 IS NOT A SERIAL. `events.length-1` is -1 before the engine has produced anything, and
   `-1 != null`, so the first version sent it — while the guest's own frontier was still undefined,
   which made the guard true regardless. The recipe draft broadcasts its line exactly there, so
   EVERY crew game began with the guest's screen held for the full grace period. A fix against
   divergence was manufacturing a guaranteed one (CEO Review 24; reproduced before it was believed).
   Both ends are held: the host must not send a negative serial, and the guest must not wait on one. */
{
  const hostRefuses = /function narrEvN\(\)\s*\{[\s\S]*?n\s*>=\s*0[\s\S]*?\}/.test(orch)
    && /events\.length\s*-\s*1/.test(orch);
  const guestRefuses = /v\.evN\s*!=\s*null\s*&&\s*v\.evN\s*>=\s*0/.test(orch);
  if (hostRefuses && guestRefuses)
    pass("the host's narrEvN() returns null below zero and the guest's guard reads `v.evN >= 0` — neither end treats -1 as an address, so a line sent before the first event draws at once");
  else
    fail(`a negative serial can still be treated as an address (host clamps it:${hostRefuses} guest guard requires >= 0:${guestRefuses}) — the recipe-draft line names event -1 and the guest holds it for the full grace period in every crew game`);
}

/* (5) THE GUEST'S OWN FRONTIER IS RECORDED, AND NOTHING ELSE SETS IT.
   BREAKAGE 4: `appState.evSeen=1e9;` after the required record line. The wait then never engages.
   Assignments are counted and located instead of merely found. */
{
  const records = /if\(e&&e\.n!=null\)appState\.evSeen=e\.n/.test(orch);
  /* `=` NOT FOLLOWED BY `=`. The first cut of this counter matched `appState.evSeen==null` — the
     guard in watchNarr — as an assignment, reported 3 and failed a correct tree. An instrument
     that miscounts its own subject is worth no more than one that cannot see it. */
  const writes = (orch.match(/appState\.evSeen\s*=(?!=)/g) || []).length;
  const resets = /appState\.evSeen=null/.test(orch);
  if (records && resets && writes === 2)
    pass("appState.evSeen is written in exactly two places — from each arriving event's own `n`, and back to null when a voyage starts — so no third line can move the guest's frontier");
  else
    fail(`the guest's frontier is not trustworthy (records from the feed:${records} reset at voyage start:${resets} total assignments:${writes}, must be 2) — any extra write can park it past every serial and switch the wait off entirely`);
}

/* (6) THE WAIT IS ACTUALLY STARTED, IS BOUNDED, AND FALLS BACK TO TODAY.
   BREAKAGE 5, THE WORST ONE: delete the single `tick();` that starts the loop. The block still
   contained `setTimeout(tick`, the deadline test and the else-branch, so every old assertion
   matched — while a guest silently lost every narration line whose event had not landed, forever.
   `node --check` passed too. The loop being STARTED is now its own assertion.
   BREAKAGE 6: `NARR_EVENT_GRACE_MS = 2000`, inside the old 1..2000 window, and the pass line
   obligingly printed "for at most 2000ms". The ceiling is now 600ms — above that it is not a
   hand-off, it is a stall a player would feel. */
{
  const blk = (orch.match(/if\(v\.evN!=null[\s\S]*?\} else drawIt\(\);/) || [""])[0];
  const started = /\n\s*tick\(\);\s*\n/.test(blk);
  const loops = /setTimeout\(tick/.test(blk);
  const deadline = /Date\.now\(\)>=until/.test(blk);
  const grace = (orch.match(/NARR_EVENT_GRACE_MS\s*=\s*(\d+)/) || [, null])[1];
  const bounded = grace != null && +grace > 0 && +grace <= 600;
  const fallsBack = /\} else drawIt\(\);/.test(blk);
  if (blk && started && loops && deadline && bounded && fallsBack)
    pass(`the held-line block starts its loop with a bare tick(), re-arms with setTimeout, carries a deadline test, caps the grace at ${grace}ms (<= 600), and ends in an else that draws immediately`);
  else
    fail(`the wait is not safe (block found:${!!blk} loop actually started:${started} re-arms:${loops} deadline test:${deadline} grace ${grace}ms within 1..600:${bounded} else-draws:${fallsBack}) — a block that never calls tick() drops every held line silently, and a grace above 600ms is a stall rather than a hand-off`);
}

/* (7) A HELD LINE CANNOT REPAINT OVER A NEWER ONE. `narr` is a single slot written with .set(), so
   only the newest sentence is real — but each arriving line runs its own timer. Sequence CEO Review
   24 found: a line naming a held event, then a battle line 200ms later drawn at once, then the
   event lands and the older sentence paints over the newer. The generation counter is the guard. */
{
  const bumps = /appState\.narrGen\s*=\s*\(appState\.narrGen\|\|0\)\s*\+\s*1/.test(orch);
  const captured = /const myGen\s*=\s*appState\.narrGen/.test(orch);
  const drops = /if\(appState\.narrGen!==myGen\)return;/.test(orch);
  if (bumps && captured && drops)
    pass("every arriving line bumps appState.narrGen, each held loop captures the value it started with, and the tick returns early when they differ — the text that stops an older sentence painting over a newer one");
  else
    fail(`two lines can still be drawn out of order (bumps a generation:${bumps} captures it:${captured} tick drops when superseded:${drops}) — a line held for its event repaints over the newer line that overtook it, up to the whole grace window later`);
}

/* (8) EVERY WRITER TO THE SLOT SENDS THE SAME FIELDS. netBroadcast — the battle play-by-play, which
   is where coins move MOST — used to send neither the subject nor the serial, so the fault this
   whole item exists to close stayed fully live for battle spoils (CEO Review 24). Two writers to
   one Firebase slot that disagree about what they put in it is the same fault in miniature. */
{
  const one = /function sendNarr\(html,variants,opts,subj\)\{[\s\S]*?netSetNarr\([\s\S]*?narrEvN\(\)\)/.test(orch);
  const narrateUses = /export function netNarrate\([\s\S]{0,900}?sendNarr\(html,variants,opts,subj\)/.test(orch);
  const broadcastUses = /export function netBroadcast\([\s\S]{0,400}?sendNarr\(html,variants,opts,subj\)/.test(orch);
  const noStragglers = (orch.match(/netSetNarr\(/g) || []).length === 1;
  if (one && narrateUses && broadcastUses && noStragglers)
    pass("netNarrate and netBroadcast both go through one sendNarr(), and `netSetNarr(` appears exactly once in the orchestrator — one payload assembly, so the battle play-by-play carries the same subject and serial every other line does");
  else
    fail(`the two narration writers do not share their payload (single assembler:${one} netNarrate uses it:${narrateUses} netBroadcast uses it:${broadcastUses} netSetNarr called exactly once:${noStragglers}) — a second call site is a second opinion about what a line carries, and battles are where coins move most`);
}

/* (9) AND THE GUEST PREFERS THE REAL EVENT — Wyatt's ruling in text. The first cut of this item
   shipped an ordering barrier and stopped one line short of the ruling: the guest still read the
   host's pre-drawn answer. It now runs the SAME shared rule over the event it already holds, with
   the host's answer surviving only as the fallback for a line that has no event.
   (Whether that rule is the RIGHT rule is w42_battle_bubble_check.mjs's assertion, not this one.) */
{
  const ruleIsShared = /function subjectOf\(e\)\{/.test(shared) && /\bexport\s*\{[^}]*\bsubjectOf\b/.test(shared);
  const guestComputes = /window\.__pp4\.subject=subjectOf\(ev\)/.test(orch);
  const fromItsOwnFeed = /const evAt=n=>\{[\s\S]*?appState\.game\.events[\s\S]*?\};/.test(orch);
  const fallsBack = /if\(v\.subj!=null\)\{window\.__pp4\.subject=\(v\.subj===-1\?null:v\.subj\)/.test(orch);
  if (ruleIsShared && guestComputes && fromItsOwnFeed && fallsBack)
    pass("subjectOf lives once in src/shared/index.js and is exported; the guest looks the event up in its OWN feed and runs that same function over it, keeping the host's wire answer only for a line with no event");
  else
    fail(`the guest does not prefer the real event (rule shared and exported:${ruleIsShared} guest calls subjectOf on it:${guestComputes} looks it up in its own feed:${fromItsOwnFeed} still falls back to v.subj:${fallsBack}) — that is the shape Wyatt approved, and reading the host's pre-drawn answer instead is one field per decision, forever`);
}

console.log(fails ? `\nFAILED — ${fails} failure(s)`
  : "\nPASSED — the TEXT found: ev(o)'s field set is unchanged and nothing writes into the engine's array; the serial is stamped on the wire copy, written once, and never negative at either end; the guest's frontier has exactly two writers; the held-line loop is started, capped at 600ms and falls through to an immediate draw; a superseded line drops; both narration writers share one payload; and the guest computes the subject from its own copy of the event with the one shared rule. Whether the two SCREENS agree is measured by scripts/qa/q21_purse_parity.mjs, in two real browsers.");
process.exit(fails ? 1 : 0);
