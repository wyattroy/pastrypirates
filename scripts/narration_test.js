#!/usr/bin/env node
// scripts/narration_test.js
//
// Phase 15 (NARR-05/D-07/D-08/D-10): the DOM-free harness every later narration plan in this
// phase asserts through. Two jobs:
//
//   1. (this wave, Wave 0) Pin the PRE-CHANGE baseline so nothing later in the phase can silently
//      break it: the full 25-key EVENT_NARRATION inventory the audit is sized against, every
//      builder surviving a minimal fabricated event with no throw, the `moored` invariants
//      scripts/bot_storm_narration_test.js already proves (mirrored here deliberately, so a
//      regression is caught by BOTH scripts, not only the older one), and the NARR-05 "encoding"
//      guarantee — a captain name with multi-byte/emoji characters survives narration intact,
//      escaped exactly once by pname()'s own escHtml().
//   2. (15-01's own tracer task) Prove the viewer-aware narration mechanism end to end on ONE
//      line (EVENT_NARRATION.dodge) — table builder -> viewer-neutral default + per-seat variants
//      -> flash() -> netNarrate -> netSetNarr's widened rooms/{code}/narr payload -> watchNarr's
//      per-client pick — entirely DOM-free, using a fake `db` that just records what it's handed.
//
// Convention (matches determinism_baseline.js/hail_ranking_test.js/storm_moored_reason_test.js/
// bot_storm_narration_test.js): no assertion library, a local check(name, actual, expected)
// counter, plain console.log, process.exit(failures?1:0). Direct `import` of the narration surface
// from src/ui/util.js — no DOM reference, no import of src/ui/flow.js or src/ui/panel.js.

import {
  EVENT_NARRATION, describe, pname, describeFor, NEUTRAL_VIEWER, narrationVariants,
  pickNarrVariant, msgHoldMs, botMsgHoldMs, chatBubbleHoldMs,
} from "../src/ui/util.js";
import { netSetNarr } from "../src/net/writers.js";
import { appState } from "../src/state/index.js";

let failures = 0;
function check(name, actual, expected) {
  const ok = actual === expected;
  if (!ok) failures++;
  console.log(`  ${(ok ? "PASS" : "FAIL").padEnd(5)} ${name.padEnd(78)} got=${JSON.stringify(actual)} want=${JSON.stringify(expected)}`);
}
function checkTrue(name, actual) { check(name, actual, true); }

// ---- bootstrap appState the way an out-of-game caller must ----
// Four claimed seats with real names (id truthy -> pname() always reads s.name, never the
// default Capt. NAMES fallback). appState.mySeat is left at its module default (null) — an
// out-of-game caller like this script, or a fresh bot_storm_narration_test.js run, never sets it.
appState.roster = [
  { id: "u0", name: "Davy Scones" },
  { id: "u1", name: "Crustbeard" },
  { id: "u2", name: "Dough Hook" },
  { id: "u3", name: "Flaky Jack" },
];
// minimal object carrying the two cfg flags the trade/fish builders read, so they don't throw
// reaching for appState.game.cfg.tradeBonus / .sardine outside a real Game instance
appState.game = { cfg: { tradeBonus: true, sardine: true } };

const at = () => [0, 0]; // describe()/captions() never need real board coordinates; neither does this harness

console.log("Narration audit harness — Wave 0 baseline + viewer-aware tracer (NARR-05/D-07/D-08/D-10)\n");

/* ---------- assertion 1: the 25-key inventory the audit is sized against ---------- */
const KEYS = Object.keys(EVENT_NARRATION);
check("EVENT_NARRATION has exactly 25 keys (the audit's inventory size)", KEYS.length, 25);

/* ---------- assertion 2: every key is a function; every builder survives a minimal fabricated event ---------- */
// one minimal, self-consistent fabricated event per key — just enough fields for that builder to
// run its full branch logic without throwing (no engine/DOM needed, mirrors bot_storm_narration_
// test.js's own direct-table-call style)
const FAB = {
  newround: { t: "newround", round: 1, dir: "N", dir2: "E", windStreak: 1, storm: false, streak: 0 },
  windmove: { t: "windmove", p: 0 },
  blownOut: { t: "blownOut", p: 0 },
  sail: { t: "sail", p: 0 },
  dodge: { t: "dodge", p: 0 },
  anchor: { t: "anchor", p: 0 },
  moored: { t: "moored", p: 0, reason: "justDocked" },
  blocked: { t: "blocked", p: 0, other: 1 },
  anchorHold: { t: "anchorHold", p: 0 },
  tradewind: { t: "tradewind", p: 0 },
  parley: { t: "parley", a: 0, b: 1, offer: "wheat", want: "sugar", ok: true },
  aground: { t: "aground", p: 0 },
  shipwrecked: { t: "shipwrecked", p: 0 },
  dock: { t: "dock", p: 0, ing: "wheat", got: "ing", heads: true },
  trade: { t: "trade", a: 0, b: 1, gave: "wheat", got: "sugar" },
  sidebet: { t: "sidebet", p: 0, won: true, delta: 2 },
  battle: { t: "battle", a: 0, d: 1, winner: 0, rounds: [[true, false, false, "a"]], spoil: "5 coins", spoilIng: null },
  battleflee: { t: "battleflee", a: 0, d: 1 },
  fish: { t: "fish", p: 0, heads: true },
  finish: { t: "finish", p: 0 },
  shotclock: { t: "shotclock", p: 0 },
  shotclockskip: { t: "shotclockskip", p: 0, coins: 2 },
  bakeoff: { t: "bakeoff", a: 0, b: 1, winner: 0 },
  end: { t: "end", winner: null },
  turn: { t: "turn", p: 0 },
};
for (const key of KEYS) {
  checkTrue(`EVENT_NARRATION.${key} is a function`, typeof EVENT_NARRATION[key] === "function");
  const fab = FAB[key];
  if (!fab) {
    console.log(`  FAIL  no fabricated event registered for key "${key}"`);
    failures++;
    continue;
  }
  let result, threw = false;
  try {
    result = EVENT_NARRATION[key](fab, at);
  } catch (e) {
    threw = true;
    console.log(`  FAIL  EVENT_NARRATION.${key}(...) threw: ${e && e.message}`);
    failures++;
  }
  if (!threw) {
    if (key === "turn") check("EVENT_NARRATION.turn(...) returns null (the one key with no line)", result, null);
    else checkTrue(`EVENT_NARRATION.${key}(...) returns an object`, result !== null && typeof result === "object");
  }
}

/* ---------- assertion 3: the moored baseline (mirrors bot_storm_narration_test.js's own checks) ---------- */
{
  const f = EVENT_NARRATION.moored;
  const justDocked = f({ t: "moored", p: 0, reason: "justDocked" }, at).txt;
  const home = f({ t: "moored", p: 0, reason: "home" }, at).txt;
  check("moored: reason justDocked and reason home render the identical line", justDocked, home);
  const bare = f({ t: "moored", p: 0 }, at).txt;
  checkTrue("moored: a no-reason event renders a real (non-empty, non-undefined) line", !!bare && !/undefined/.test(bare));
  checkTrue("describe(): a reasoned moored event still produces a non-null captain's-log line", describe({ t: "moored", p: 0, reason: "dock" }) !== null);
}

/* ---------- assertion 4 (NARR-05 encoding): a multi-byte/emoji captain name survives intact, escaped once ---------- */
{
  // "🐙" is deliberately an emoji with NO entry in shared/index.js's EMOJI_IMG map — describe()'s
  // final emojify() pass swaps every MAPPED emoji for its custom <img>, which would silently
  // rewrite this literal glyph inside the interpolated name and defeat the "survives intact"
  // assertion below for reasons that have nothing to do with narration encoding.
  const rawCaptainName = "Café Piér & Co. 🐙";
  const savedRoster = appState.roster;
  appState.roster = [{ id: "u0", name: rawCaptainName }, ...savedRoster.slice(1)];
  const expected = pname(0); // the single source of truth for how this name gets escaped
  checkTrue("dock: pname() HTML-escapes the ampersand exactly once (never left raw)", expected.includes("&amp;") && !expected.includes(" & "));
  const out = describe({ t: "dock", p: 0, ing: "wheat", got: "ing", heads: true });
  checkTrue("dock: describe() output is non-null for the emoji/multi-byte name case", out !== null);
  const txt = out ? out.txt : "";
  const occurrences = txt.split(expected).length - 1;
  check("dock: the escaped captain name appears exactly once in the narration", occurrences, 1);
  checkTrue("dock: the name survives intact (é + emoji both present)", txt.includes("Piér") && txt.includes("🐙"));
  appState.roster = savedRoster;
}

/* ---------- Task 2 (TRACER): viewer-aware narration, one line, end to end, DOM-free ----------
   Reproduces the whole chain — table builder -> viewer-neutral default + per-seat variants ->
   the payload netSetNarr writes -> pickNarrVariant's per-client selection — exactly as
   narrateLastEvent()/netNarrate()/watchNarr() do it in the real UI, but with a fake `db` that
   just records what it's handed instead of touching Firebase. */
{
  const dodgeEvent = { t: "dodge", p: 1 };

  // ---- table builder -> viewer-neutral default + per-seat variants (mirrors narrateLastEvent()) ----
  const neutral = describeFor(dodgeEvent, NEUTRAL_VIEWER);
  checkTrue("dodge: describeFor(e, NEUTRAL_VIEWER) is non-null", neutral !== null);
  const variants = narrationVariants(dodgeEvent);
  check("dodge: narrationVariants(e) has exactly one entry (the addressed subject seat)", variants.length, 1);
  checkTrue("dodge: the one variant's seat equals the event's subject seat (e.p)", variants.length === 1 && variants[0].seat === dodgeEvent.p);
  checkTrue("dodge: describeFor(e, subjectSeat).txt differs from the neutral rendering", describeFor(dodgeEvent, dodgeEvent.p).txt !== neutral.txt);
  checkTrue("dodge: with appState.mySeat unset, describe(e).txt equals the neutral rendering", describe(dodgeEvent).txt === neutral.txt);
  checkTrue("narrationVariants: calling it twice returns arrays with identical ordering", JSON.stringify(narrationVariants(dodgeEvent)) === JSON.stringify(variants));
  // Plan 15-04 Task 2 note: this originally pinned "anchor" as the no-viewer-branch example, but
  // Task 2 (D-07) deliberately gives `anchor` its own addressed branch — `newround` (D-09) is the
  // one entry guaranteed to stay branch-free for the life of this table, so the pin moves there.
  check("narrationVariants: a builder with no viewer branch (newround) returns an empty array", narrationVariants({ t: "newround", round: 1, dir: "N", dir2: "E", windStreak: 1, storm: false, streak: 0 }).length, 0);

  // ---- the payload netSetNarr writes (mirrors netNarrate/netBroadcast's own call) ----
  function makeFakeDb() {
    const calls = [];
    return { calls, ref(path) { return { set(payload) { calls.push({ path, payload }); return Promise.resolve(); } }; } };
  }
  const fakeDb = makeFakeDb();
  netSetNarr(fakeDb, "ROOM", neutral.txt, null, variants);
  check("netSetNarr: writes to the rooms/<room>/narr path", fakeDb.calls[0] && fakeDb.calls[0].path, "rooms/ROOM/narr");
  const payload = fakeDb.calls[0] && fakeDb.calls[0].payload;
  checkTrue("netSetNarr: a non-empty variants array lands on the written payload", !!payload && Array.isArray(payload.variants) && payload.variants.length === 1);
  check("netSetNarr: the written payload's html field is the viewer-neutral text", payload && payload.html, neutral.txt);

  // ---- pickNarrVariant's per-client selection (mirrors netNarrate's own screen AND watchNarr) ----
  check("pickNarrVariant: the subject seat gets the addressed text", pickNarrVariant(payload, dodgeEvent.p), variants[0].html);
  check("pickNarrVariant: a non-subject seat gets the viewer-neutral text", pickNarrVariant(payload, dodgeEvent.p + 1), neutral.txt);
  check("pickNarrVariant: a viewer with a null seat gets the viewer-neutral text", pickNarrVariant(payload, null), neutral.txt);
  check("pickNarrVariant: literal spec example — html-only payload", pickNarrVariant({ html: "X" }, 2), "X");
  check("pickNarrVariant: literal spec example — empty variants array", pickNarrVariant({ html: "X", variants: [] }, 2), "X");
  check("pickNarrVariant: literal spec example — null payload", pickNarrVariant(null, 2), "");
  check("pickNarrVariant: literal spec example — null seat falls back to html", pickNarrVariant({ html: "X", variants: [{ seat: 2, html: "Y" }] }, null), "X");

  // ---- both version-skew directions degrade cleanly to the payload's own html ----
  const fakeDbOld = makeFakeDb();
  netSetNarr(fakeDbOld, "ROOM", neutral.txt, null, []); // an "old host" writes no variants at all
  const oldPayload = fakeDbOld.calls[0].payload;
  checkTrue("netSetNarr: an empty variants array is OMITTED from the written payload entirely (not written as [])", !Object.prototype.hasOwnProperty.call(oldPayload, "variants"));
  check("pickNarrVariant: a payload with no variants key still yields the neutral text (old-host skew)", pickNarrVariant(oldPayload, dodgeEvent.p), neutral.txt);
  checkTrue("pickNarrVariant: never returns undefined/null for a well-formed payload", typeof pickNarrVariant(oldPayload, dodgeEvent.p) === "string");
}

/* ---------- Task 2 (NARR-06/D-14/D-15): the 10% hold cut, pinned across all three curves ----------
   Computes every "before" value from the documented base/per-char/pause/clamp formula with the
   OLD multiplier (never hardcoded from memory), then asserts the "after" value the live curve
   actually returns is exactly 0.9x that — mechanically enforcing D-14's "10% less time" on both
   cut curves, while chatBubbleHoldMs (D-15) stays completely unmoved by this task. */
{
  // mirrors msgHoldMs/botMsgHoldMs/chatBubbleHoldMs's own base/per-char/pause/clamp shape exactly,
  // parameterized by clamp bounds + multiplier, so "old value" can be computed without importing
  // a frozen pre-change copy of the function itself
  function holdFormula(text, lo, hi, multiplier) {
    text = text || "";
    const base = 1000, charTime = 50;
    let raw = base + text.length * charTime;
    const body = text.replace(/[.,!?]+$/, "");
    const pauses = (body.match(/[,!?.]/g) || []).length;
    raw += pauses * 300;
    return Math.round(Math.min(Math.max(raw, lo), hi) * multiplier);
  }

  const sample40 = "x".repeat(40); // 40 code units, no punctuation — the plan's own pinned sample

  /* ---- the numeric relationship: 0.9x the pre-change value, on both cut curves ---- */
  const oldHuman = holdFormula(sample40, 1200, 7000, 0.8); // msgHoldMs's PRE-Phase-15 multiplier
  const oldBot = holdFormula(sample40, 900, 2600, 0.5);    // botMsgHoldMs's PRE-Phase-15 multiplier
  check("msgHoldMs: 40-code-unit sample is exactly 0.9x its pre-change value", msgHoldMs(sample40), Math.round(oldHuman * 0.9));
  check("msgHoldMs: 40-code-unit sample returns 2160 (pinned literal)", msgHoldMs(sample40), 2160);
  check("botMsgHoldMs: 40-code-unit sample is exactly 0.9x its pre-change value", botMsgHoldMs(sample40), Math.round(oldBot * 0.9));
  check("botMsgHoldMs: 40-code-unit sample returns 1170 (pinned literal)", botMsgHoldMs(sample40), 1170);

  /* ---- the D-15 invariant: chat bubbles are UNCHANGED by this task, and equal to msgHoldMs's own pre-cut value ---- */
  const bubbleExpected = holdFormula(sample40, 1200, 7000, 0.8); // CHAT_BUBBLE_HOLD_MULTIPLIER, pinned at Task 1
  check("chatBubbleHoldMs: 40-code-unit sample is unchanged by the NARR-06 cut", chatBubbleHoldMs(sample40), bubbleExpected);
  check("chatBubbleHoldMs: 40-code-unit sample returns 2400 (pinned literal, equal to msgHoldMs's pre-change value)", chatBubbleHoldMs(sample40), 2400);

  /* ---- NARR-06 empty: "", null, undefined all return a positive, clamped-floor hold on every curve ---- */
  for (const input of ["", null, undefined]) {
    const label = input === "" ? '""' : String(input);
    const humanVal = msgHoldMs(input);
    check(`msgHoldMs(${label}): clamped floor 1200 x 0.72`, humanVal, 864);
    checkTrue(`msgHoldMs(${label}): positive integer, never NaN/zero/negative`, Number.isInteger(humanVal) && humanVal > 0);
    const botVal = botMsgHoldMs(input);
    check(`botMsgHoldMs(${label}): raw 1000 (above its own 900 floor) x 0.45`, botVal, 450);
    checkTrue(`botMsgHoldMs(${label}): positive integer, never NaN/zero/negative`, Number.isInteger(botVal) && botVal > 0);
    const bubbleVal = chatBubbleHoldMs(input);
    check(`chatBubbleHoldMs(${label}): clamped floor 1200 x 0.8`, bubbleVal, 960);
    checkTrue(`chatBubbleHoldMs(${label}): positive integer, never NaN/zero/negative`, Number.isInteger(bubbleVal) && bubbleVal > 0);
  }

  /* ---- NARR-06 encoding: emoji vs ASCII of equal String.length hold identically on all three curves ---- */
  // 20 astral-plane emoji, each a UTF-16 surrogate PAIR -> String.length === 40, same as the
  // 40-character ASCII sample — these curves only ever read text.length and match ASCII
  // punctuation, so this is unaffected by describe()/emojify()'s DOM-only EMOJI_IMG substitution.
  const emojiSample = "\u{1F419}".repeat(20); // octopus emoji, astral plane (surrogate pair)
  const asciiSample = "y".repeat(40);
  check("encoding: 20-emoji sample has String.length 40 (UTF-16 code units, not 20 grapheme clusters)", emojiSample.length, 40);
  check("encoding: 40-ASCII-character sample has String.length 40", asciiSample.length, 40);
  check("msgHoldMs: emoji sample and ASCII sample of equal String.length hold identically", msgHoldMs(emojiSample), msgHoldMs(asciiSample));
  check("botMsgHoldMs: emoji sample and ASCII sample of equal String.length hold identically", botMsgHoldMs(emojiSample), botMsgHoldMs(asciiSample));
  check("chatBubbleHoldMs: emoji sample and ASCII sample of equal String.length hold identically", chatBubbleHoldMs(emojiSample), chatBubbleHoldMs(asciiSample));

  /* ---- the D-15 invariant, restated across every sample string in this block: bubbles outlast narration ---- */
  for (const s of [sample40, emojiSample, asciiSample, ""]) {
    checkTrue(`chatBubbleHoldMs > msgHoldMs for sample len=${s.length}`, chatBubbleHoldMs(s) > msgHoldMs(s));
  }
}

/* ---------- Plan 15-04 Task 1 (NARR-04/D-12): battle spoil bribe-vs-cleaned-out split ----------
   Direct-table-call style (mirrors scripts/bot_storm_narration_test.js's own EVENT_NARRATION.
   moored assertions) — fabricated battle events, no engine/DOM needed. Asserts the boundary sits
   exactly between 4 and 5 coins, ingredient spoils are untouched, and an absent/empty/non-numeric
   spoil always falls through to the cleaned-out (least-claiming) framing with no undefined/NaN. */
{
  const f = EVENT_NARRATION.battle;
  const mkEvent = (spoil, spoilIng = null) => ({ t: "battle", a: 0, d: 1, winner: 0, rounds: [[true, false, false, "a"]], spoil, spoilIng });
  const isBribe = txt => /bribes their way out of giving away a crate/.test(txt);
  const isCleanedOut = txt => /has nothing left to give/.test(txt);

  const genuine = f(mkEvent("5 coins"), at).txt;
  const cleaned = f(mkEvent("2 coins"), at).txt;
  checkTrue("battle: 5-coin (bribe) wording differs from 2-coin (cleaned-out) wording", genuine !== cleaned);
  checkTrue("battle: both renderings non-empty with no undefined/NaN token", !!genuine && !!cleaned && !/undefined|NaN/.test(genuine) && !/undefined|NaN/.test(cleaned));

  for (const n of [0, 1, 2, 4]) {
    const txt = f(mkEvent(`${n} coins`), at).txt;
    checkTrue(`battle: ${n}-coin spoil renders the cleaned-out framing`, isCleanedOut(txt));
    checkTrue(`battle: ${n}-coin spoil does NOT render the bribe framing`, !isBribe(txt));
  }
  {
    const txt = f(mkEvent("5 coins"), at).txt;
    checkTrue("battle: 5-coin spoil renders the bribe framing", isBribe(txt));
    checkTrue("battle: 5-coin spoil does NOT render the cleaned-out framing", !isCleanedOut(txt));
  }

  // ingredient spoils are UNTOUCHED by the split — pin the literal "{winner} takes {spoil}." clause
  const ingTxt = f(mkEvent('<img class="ic" src="x">Wheat', "wheat"), at).txt;
  checkTrue("battle: ingredient-spoil clause still reads '{winner} takes {spoil}.' (untouched by the split)", ingTxt.includes('takes <img class="ic" src="x">Wheat.'));

  for (const [label, spoil] of [["absent", undefined], ["empty", ""], ["non-numeric", "abc coins"]]) {
    const txt = f(mkEvent(spoil), at).txt;
    checkTrue(`battle: ${label} spoil still renders a non-empty line with no undefined/NaN token`, !!txt && !/undefined|NaN/.test(txt));
    checkTrue(`battle: ${label} spoil falls through to the cleaned-out (least-claiming) framing`, isCleanedOut(txt));
  }
}

/* ---------- Plan 15-04 Task 1 (NARR-01 audit finding): shotclockskip narrates from the table ----------
   src/orchestrator.js's expireShotClock() no longer hand-writes text — both its branches now
   await narrateLastEvent(), which reads through EVENT_NARRATION.shotclockskip. This block proves
   the table entry itself (the single source of truth both branches now share) renders correctly
   for both the ingredient-loss and coin-loss shapes. The dedup itself (no more hand-written
   flash() strings in expireShotClock) is asserted at the shell level by this task's own <verify>
   awk/grep commands against src/orchestrator.js. */
{
  const f = EVENT_NARRATION.shotclockskip;
  const ingTxt = f({ t: "shotclockskip", p: 0, ing: "wheat" }, at).txt;
  checkTrue("shotclockskip: ingredient-loss wording is non-empty with no undefined token", !!ingTxt && !/undefined/.test(ingTxt));
  const coinTxt = f({ t: "shotclockskip", p: 0, coins: 3 }, at).txt;
  checkTrue("shotclockskip: coin-loss wording is non-empty with no undefined token", !!coinTxt && !/undefined/.test(coinTxt));
}

/* ---------- Plan 15-04 Task 2 (D-07/D-09): viewer-aware branches across the single-subject table ----------
   Iterates the table generically instead of asserting entry by entry: every key must still be
   callable with no throw; the viewer-neutral rendering must stay non-empty (except the keys
   documented as producing no text) and undefined-token-free; and for every one of the 16 keys this
   task covers, the addressed rendering must differ from the viewer-neutral rendering. `newround`
   (D-09) is pinned identical with and without a viewer seat — it never gains a branch. */
{
  const COVERED_SINGLE_SUBJECT = [
    "windmove", "blownOut", "sail", "anchor", "moored", "blocked", "anchorHold", "tradewind",
    "aground", "shipwrecked", "dock", "sidebet", "fish", "finish", "shotclock", "shotclockskip",
  ];
  check("COVERED_SINGLE_SUBJECT has exactly 16 keys (the plan's own covered-key count)", COVERED_SINGLE_SUBJECT.length, 16);
  const SILENT_KEYS = new Set(["turn", "end"]); // documented as producing no captain's-log line (or none in this fabricated shape)

  for (const key of KEYS) {
    const fab = FAB[key];
    let result, threw = false;
    try { result = EVENT_NARRATION[key](fab, at); } catch (e) { threw = true; }
    checkTrue(`viewer-neutral (post-Task2): EVENT_NARRATION.${key}(...) does not throw`, !threw);
    if (threw) continue;
    const txt = result && result.txt;
    if (!SILENT_KEYS.has(key)) {
      checkTrue(`viewer-neutral (post-Task2): EVENT_NARRATION.${key} renders non-empty text`, !!txt);
      checkTrue(`viewer-neutral (post-Task2): EVENT_NARRATION.${key} contains no JS undefined token`, !txt || !/undefined/.test(txt));
    }
  }

  for (const key of COVERED_SINGLE_SUBJECT) {
    const fab = FAB[key];
    const neutralTxt = describeFor(fab, NEUTRAL_VIEWER).txt;
    const addressedTxt = describeFor(fab, fab.p).txt;
    checkTrue(`${key}: addressed rendering differs from the viewer-neutral rendering`, addressedTxt !== neutralTxt);
    checkTrue(`${key}: addressed rendering is non-empty with no JS undefined token`, !!addressedTxt && !/undefined/.test(addressedTxt));
    checkTrue(`${key}: viewer-neutral rendering is non-empty with no JS undefined token`, !!neutralTxt && !/undefined/.test(neutralTxt));
  }

  // D-09: newround gets NO viewer branch at all — identical with and without a viewer seat
  const newroundFab = FAB.newround;
  check("newround: rendering identical with a viewer seat (0) and without one (undefined)",
    describeFor(newroundFab, 0).txt, describeFor(newroundFab, undefined).txt);
  check("newround: rendering identical with NEUTRAL_VIEWER too",
    describeFor(newroundFab, NEUTRAL_VIEWER).txt, describeFor(newroundFab, 1).txt);

  // moored invariants (mirrors assertion 3 / bot_storm_narration_test.js) must survive byte-identical
  {
    const f = EVENT_NARRATION.moored;
    const justDocked = f({ t: "moored", p: 0, reason: "justDocked" }, at).txt;
    const home = f({ t: "moored", p: 0, reason: "home" }, at).txt;
    check("moored (post-Task2, appState.mySeat unset): reason justDocked and reason home render the identical line", justDocked, home);
    const bare = f({ t: "moored", p: 0 }, at).txt;
    checkTrue("moored (post-Task2, appState.mySeat unset): a no-reason event renders a real (non-empty, non-undefined) line", !!bare && !/undefined/.test(bare));
    const dockLine = f({ t: "moored", p: 0, reason: "dock" }, at).txt;
    check("moored (post-Task2, appState.mySeat unset): reason \"dock\" with no position evidence renders the \"still docked\" line, not the shove line", dockLine, justDocked);
  }

  // Object.keys(EVENT_NARRATION).length still 25 — no key added or removed
  check("EVENT_NARRATION still has exactly 25 keys after Task 2", Object.keys(EVENT_NARRATION).length, 25);

  // describe(e) with appState.mySeat null equals describeFor(e, NEUTRAL_VIEWER) for every key
  for (const key of KEYS) {
    const fab = FAB[key];
    const d = describe(fab);
    const n = describeFor(fab, NEUTRAL_VIEWER);
    check(`describe(): ${key} equals describeFor(e, NEUTRAL_VIEWER) with appState.mySeat unset`, d ? d.txt : null, n ? n.txt : null);
  }

  // caps/pops are unchanged by addressing — the viewer only ever selects .txt
  for (const key of COVERED_SINGLE_SUBJECT) {
    const fab = FAB[key];
    const neutralResult = EVENT_NARRATION[key](fab, at, 0);
    const addressedResult = EVENT_NARRATION[key](fab, at, 0, fab.p);
    check(`${key}: caps array unchanged by addressing`, JSON.stringify(addressedResult.caps || []), JSON.stringify(neutralResult.caps || []));
    check(`${key}: pops array unchanged by addressing`, JSON.stringify(addressedResult.pops || []), JSON.stringify(neutralResult.pops || []));
  }
}

console.log(`\n${failures ? "FAILED" : "PASSED"} — ${failures} failing check(s)`);
process.exit(failures ? 1 : 0);
