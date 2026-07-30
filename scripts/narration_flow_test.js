#!/usr/bin/env node
// scripts/narration_flow_test.js
//
// Phase 15 plan 03 (NARR-02/NARR-03/NARR-05, D-11/D-13): DOM-free harness proving the turn-flow
// narration invariants that live inside src/ui/flow.js. Grows across this plan's 3 tasks:
//   Task 1 (D-13): windLeg's anchorHold branch awaits narrateLastEvent() before liveRender().
//   Task 2 (D-11): brokeSailLine/brokeAnchorLine — pure, viewer-aware "broke" narration builders,
//     for a human AND a bot who can't afford to sail, and a captain who can't afford to anchor.
//   Task 3 (NARR-03/D-07/D-08/D-10): stormIntroClause + every ad-hoc flash() site in this file
//     converted to the neutral-plus-variants broadcast form.
//
// windLeg/humanTurn/botTurn/humanAct etc all need the DOM to actually run, so their invariants are
// proven here as STRUCTURAL, source-text assertions instead — read src/ui/flow.js as text, locate
// the relevant function's body, and assert the rule (an ordering, a call site's presence, an
// absence) the same way scripts/ui_contract_check.js/scripts/no_undef_check.js do for their own
// source-text invariants. The pure exported builders (brokeSailLine, brokeAnchorLine,
// stormIntroClause) are imported and called directly — no DOM needed for those.
//
// Convention (matches hail_ranking_test.js/bot_storm_narration_test.js/narration_test.js): no
// assertion library, a local check(name, actual, expected) counter, plain console.log,
// process.exit(failures?1:0). Source-text file:line failures follow scripts/ui_contract_check.js's
// / scripts/no_undef_check.js's house convention for that style of assertion.
//
// Never touches the DOM, never imports/calls a turn function (windLeg/humanTurn/botTurn/humanAct
// etc never run here) — only src/ui/flow.js's own pure exported builders and source text.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { brokeSailLine, brokeAnchorLine, stormIntroClause, counterHeadroom, coinShortfall } from "../src/ui/flow.js";
import { appState } from "../src/state/index.js";
import { DIRS } from "../src/shared/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const FLOW_PATH = path.join(ROOT, "src", "ui", "flow.js");
const FLOW_SRC = fs.readFileSync(FLOW_PATH, "utf8");
const FLOW_REL = path.relative(ROOT, FLOW_PATH);

let failures = 0;
function check(name, actual, expected) {
  const ok = actual === expected;
  if (!ok) failures++;
  console.log(`  ${(ok ? "PASS" : "FAIL").padEnd(5)} ${name.padEnd(78)} got=${JSON.stringify(actual)} want=${JSON.stringify(expected)}`);
}
function checkTrue(name, actual) { check(name, actual, true); }

console.log("Turn-flow narration harness (NARR-02/03/05, D-11/D-13) — src/ui/flow.js\n");

/* ---------- helpers: string-index slicing (immune to awk's start==end same-line range trap) ---------- */
function extractFn(src, startMarker, endMarker) {
  const startIdx = src.indexOf(startMarker);
  if (startIdx < 0) return { body: null, startIdx: -1 };
  const searchFrom = startIdx + startMarker.length;
  const endIdx = endMarker ? src.indexOf(endMarker, searchFrom) : -1;
  const body = endIdx < 0 ? src.slice(startIdx) : src.slice(startIdx, endIdx);
  return { body, startIdx };
}
function lineOf(src, idx) {
  return idx < 0 ? "?" : src.slice(0, idx).split("\n").length;
}

/* ---------- Task 1 (D-13): windLeg's anchorHold branch awaits narrateLastEvent() ---------- */
{
  const { body: windLegBody } = extractFn(FLOW_SRC, "export async function windLeg", "export async function botWindLeg");
  checkTrue("windLeg function body located", !!windLegBody);
  if (windLegBody) {
    const mooredOrder = /ev\(\{t:"moored"[^}]*\}\);await narrateLastEvent\(\);liveRender\(\);/.test(windLegBody);
    checkTrue("windLeg: the moored branch keeps its ev() -> await narrateLastEvent() -> liveRender() order (the precedent D-13 copies)", mooredOrder);

    const anchorHoldOrder = /ev\(\{t:"anchorHold"[^}]*\}\);await narrateLastEvent\(\);liveRender\(\);/.test(windLegBody);
    const anchorIdx = FLOW_SRC.indexOf('ev({t:"anchorHold"');
    check(`D-13: windLeg's anchorHold branch (${FLOW_REL}:${lineOf(FLOW_SRC, anchorIdx)}) awaits narrateLastEvent() before liveRender(), same order as the moored branch above it`, anchorHoldOrder, true);
  }
}

/* ---------- Task 2 (D-11): brokeSailLine / brokeAnchorLine — pure, viewer-aware builders ---------- */
{
  checkTrue("brokeSailLine is exported and callable with no DOM", typeof brokeSailLine === "function");
  checkTrue("brokeAnchorLine is exported and callable with no DOM", typeof brokeAnchorLine === "function");

  // appState.mySeat starts unset (null/undefined) — an out-of-game caller like this script, same
  // baseline scripts/narration_test.js/scripts/bot_storm_narration_test.js run against.
  appState.mySeat = null;

  const sailNeutral = brokeSailLine(0, -1); // NEUTRAL_VIEWER === -1 (src/ui/util.js)
  const sailAddressed = brokeSailLine(0, 0);
  checkTrue("brokeSailLine: neutral rendering is non-empty and contains no JS undefined token", !!sailNeutral && !/undefined/.test(sailNeutral));
  checkTrue("brokeSailLine: addressed rendering is non-empty and contains no JS undefined token", !!sailAddressed && !/undefined/.test(sailAddressed));
  checkTrue("brokeSailLine: addressed rendering differs from the neutral rendering", sailAddressed !== sailNeutral);

  const anchorNeutral = brokeAnchorLine(1, -1);
  const anchorAddressed = brokeAnchorLine(1, 1);
  checkTrue("brokeAnchorLine: neutral rendering is non-empty and contains no JS undefined token", !!anchorNeutral && !/undefined/.test(anchorNeutral));
  checkTrue("brokeAnchorLine: addressed rendering is non-empty and contains no JS undefined token", !!anchorAddressed && !/undefined/.test(anchorAddressed));
  checkTrue("brokeAnchorLine: addressed rendering differs from the neutral rendering", anchorAddressed !== anchorNeutral);

  // appState.mySeat left null, viewerSeat OMITTED entirely -> isLocalTo's seatLocal() fallback ->
  // always false (no real seat ever equals null) -> both builders return their third-person form,
  // and that form names the seat via pn() (a <b style=...> wrapped name, not a raw "you").
  const sailFallback = brokeSailLine(2);
  const anchorFallback = brokeAnchorLine(2);
  check("brokeSailLine: appState.mySeat null + viewerSeat omitted returns the SAME text as the explicit neutral form", sailFallback, brokeSailLine(2, -1));
  check("brokeAnchorLine: appState.mySeat null + viewerSeat omitted returns the SAME text as the explicit neutral form", anchorFallback, brokeAnchorLine(2, -1));
  checkTrue("brokeSailLine: the fallback (third-person) form contains a <b> name tag from pn()", /<b /.test(sailFallback));
  checkTrue("brokeAnchorLine: the fallback (third-person) form contains a <b> name tag from pn()", /<b /.test(anchorFallback));

  // NARR-02: never mocks/shames the broke player — a lightweight lexical guard against the
  // obvious failure shapes (sarcasm/insult words), not a substitute for Wyatt's own D-04 read.
  const MOCKING_WORDS = /\b(loser|pathetic|idiot|stupid|dumb|broke-ass|poor sod|shame on)\b/i;
  checkTrue("brokeSailLine: neither rendering reads as mocking the broke player (NARR-02)", !MOCKING_WORDS.test(sailNeutral) && !MOCKING_WORDS.test(sailAddressed));
  checkTrue("brokeAnchorLine: neither rendering reads as mocking the broke player (NARR-02)", !MOCKING_WORDS.test(anchorNeutral) && !MOCKING_WORDS.test(anchorAddressed));
}

/* ---------- Task 2 structural: the three call sites exist inside the right functions ---------- */
{
  const { body: humanTurnBody } = extractFn(FLOW_SRC, "export async function humanTurn", "/* ================= bot hail (AI-01)");
  checkTrue("humanTurn function body located", !!humanTurnBody);
  if (humanTurnBody) {
    checkTrue("humanTurn: the human sail gate narrates its own broke moment via brokeSailLine (D-11 case 1, human)", humanTurnBody.includes("brokeSailLine"));
    checkTrue("humanTurn: the turn banner no longer pre-announces the second storm leg (windNow2)", !humanTurnBody.includes("windNow2"));
  }

  const { body: humanWindBody } = extractFn(FLOW_SRC, "export async function humanWind", "export async function humanDock");
  checkTrue("humanWind function body located", !!humanWindBody);
  if (humanWindBody) {
    checkTrue("humanWind: still announces the second leg's own direction at the moment it happens (windNow2)", humanWindBody.includes("windNow2"));
  }

  const { body: botTurnBody } = extractFn(FLOW_SRC, "export async function botTurn", "/* ================= battle-UI");
  checkTrue("botTurn function body located", !!botTurnBody);
  if (botTurnBody) {
    checkTrue("botTurn: the bot sail gate narrates its own broke moment via brokeSailLine (D-11 case 1, bot)", botTurnBody.includes("brokeSailLine"));
  }

  const { body: windLegBody2 } = extractFn(FLOW_SRC, "export async function windLeg", "export async function botWindLeg");
  checkTrue("windLeg function body located (case 2 check)", !!windLegBody2);
  if (windLegBody2) {
    checkTrue("windLeg: the storm-anchor block narrates the broke-can't-anchor moment via brokeAnchorLine (D-11 case 2)", windLegBody2.includes("brokeAnchorLine"));
    const payOpts = (windLegBody2.match(/value:"pay"/g) || []).length;
    const flipOpts = (windLegBody2.match(/value:"flip"/g) || []).length;
    check("windLeg: exactly one Pay-to-anchor option is ever pushed (unaffected by the broke narration)", payOpts, 1);
    check("windLeg: the flip is offered in every case (unaffected by the broke narration)", flipOpts, 1);
  }
}

/* ---------- Task 3 (NARR-03): stormIntroClause — one leg, second person, four distinct directions ---------- */
{
  checkTrue("stormIntroClause is exported and callable with no DOM", typeof stormIntroClause === "function");
  const byDir = {};
  for (const dk of Object.keys(DIRS)) {
    const clause = stormIntroClause(dk);
    byDir[dk] = clause;
    checkTrue(`stormIntroClause(${dk}): non-empty and contains no JS undefined token`, !!clause && !/undefined/.test(clause));
  }
  const dirKeys = Object.keys(DIRS);
  checkTrue("stormIntroClause: two different directions produce different output", byDir[dirKeys[0]] !== byDir[dirKeys[1]]);
}

/* ---------- Task 3 (D-07/D-08/D-09/D-10): every ad-hoc flash() site is neutral-plus-variants ---------- */
{
  const flashSeatLocalLines = FLOW_SRC.split("\n").filter((l) => /flash\([^;]*seatLocal\(/.test(l));
  check("no flash( call in src/ui/flow.js still selects its message with an inline seatLocal( ternary", flashSeatLocalLines.length, 0);

  const variantsFormLines = FLOW_SRC.split("\n").filter((l) => /flash\([^;]*\[\{\s*seat/.test(l));
  checkTrue(`the neutral-plus-variants form is in use at >= 8 sites (found ${variantsFormLines.length})`, variantsFormLines.length >= 8);

  const { body: botWindLegBody } = extractFn(FLOW_SRC, "export async function botWindLeg", "// only ever called during a storm now");
  checkTrue("botWindLeg function body located", !!botWindLegBody);
  if (botWindLegBody) {
    const nvCount = (botWindLegBody.match(/narrationVariants\(/g) || []).length;
    check("botWindLeg: both describe()-then-flash() sites now render neutral text with narrationVariants(...)", nvCount, 2);
  }

  // T-15-02: names still flow through pn()/poss() only — no raw ${x.name} interpolation anywhere
  // in this file (the same encoding guarantee narration_test.js already pins on util.js's side).
  const rawNameLines = FLOW_SRC.split("\n").filter((l) => /\$\{[A-Za-z_.[\]() ]*\.name\}/.test(l));
  check("T-15-02: no raw ${...name} interpolation in src/ui/flow.js — names flow through pn()/poss() only", rawNameLines.length, 0);
}

/* ---------- F12: counterHeadroom — a bot's counter can never demand coins already pledged ---------- */
{
  checkTrue("counterHeadroom is exported and callable with no DOM", typeof counterHeadroom === "function");

  // the live playtest case: Wyatt held 1 coin and had already pledged it, so the headroom is 0 and
  // the existing `askFor>0` guard suppresses the counter entirely (the D-41 pattern, correctly).
  check("F12: the live playtest case (shortfall 1, purse 1, 1 already pledged) offers NO counter", counterHeadroom(1, 1, 1), 0);
  check("F12: purse 3, 1 pledged, shortfall 5 -> names the smaller amount they CAN afford", counterHeadroom(5, 3, 1), 2);
  check("F12: purse 1, nothing pledged, shortfall 1 -> 1 (the case that always worked)", counterHeadroom(1, 1, 0), 1);
  check("F12: an over-pledged purse floors at 0, never a negative demand", counterHeadroom(4, 2, 3), 0);

  // the invariant the bug violated: whatever the bot demands, the captain can still pay what they
  // pledged PLUS the demand out of the purse they actually hold. Cannot be satisfied by inspection.
  let violation = null;
  let points = 0;
  for (let shortfall = 0; shortfall <= 8 && !violation; shortfall++) {
    for (let purse = 0; purse <= 8 && !violation; purse++) {
      for (let pledged = 0; pledged <= purse; pledged++) {
        const headroom = counterHeadroom(shortfall, purse, pledged);
        points++;
        if (headroom < 0 || pledged + headroom > purse) {
          violation = `shortfall=${shortfall} purse=${purse} pledged=${pledged} -> ${headroom}`;
          break;
        }
      }
    }
  }
  check(`F12 INVARIANT over ${points} points: pledged + headroom <= purse, and headroom >= 0${violation ? ` — FIRST VIOLATION ${violation}` : ""}`, violation, null);

  // the arithmetic is the whole defect, so the call site must keep using the helper — a future
  // inline rewrite of the expression is what this assertion exists to fail on.
  const counterIdx = FLOW_SRC.indexOf("scoffs — but counters");
  checkTrue("humanTrade's counter block located by its prompt (never by line number)", counterIdx > 0);
  if (counterIdx > 0) {
    const region = FLOW_SRC.slice(Math.max(0, counterIdx - 900), counterIdx + 200);
    const regionCode = region.split("\n").filter((l) => !/^\s*\/\//.test(l)).join("\n");
    checkTrue(`F12: humanTrade's counter block (${FLOW_REL}:${lineOf(FLOW_SRC, counterIdx)}) computes askFor through counterHeadroom(), not inline`, /counterHeadroom\s*\(/.test(regionCode));
    const liveCode = FLOW_SRC.split("\n").filter((l) => !/^\s*\/\//.test(l)).join("\n");
    check("F12: the old total-purse cap appears nowhere in live (non-comment) code", /Math\.min\(shortfall\s*,\s*p\.coins\s*\)/.test(liveCode), false);
  }
}

/* ---------- G6: one shared coin re-validation, called at every debit site that can interleave ----------
 * COIN-AUDIT.md's root cause, in one sentence: affordability is checked when the option list is
 * BUILT, the purse is debited AFTER the click, and the 20-second shot-clock penalty
 * (src/ui/util.js applyShotClockPenalty, takes Math.min(1,p.coins) from the DECIDING seat) fires
 * inside exactly that window. appState.turnExpired does not protect against it — that flag is set
 * at 30 seconds; the coin penalty fires at 20 and sets no flag at all.
 *
 * Wyatt, approving the audit's recommendation: "yes, build this check and apply it to all
 * situations."
 *
 * Same DOM-free shape as the F12 counterHeadroom block above: pure arithmetic, no DOM, no appState. */
{
  checkTrue("G6: coinShortfall is exported and callable with no DOM", typeof coinShortfall === "function");

  // 0 means "clear" — the purse covers the debit and the caller may proceed.
  check("G6: a purse that covers the debit clears it", coinShortfall(3, 5), 0);
  check("G6: debit 0 against purse 0 clears — a free choice is always affordable", coinShortfall(0, 0), 0);
  check("G6: debit EQUAL to the purse clears exactly — spending the last coin is legal", coinShortfall(5, 5), 0);
  check("G6: debit one more than the purse reports a shortfall of exactly 1", coinShortfall(6, 5), 1);
  check("G6: a wider gap reports the true shortfall, not a flag", coinShortfall(9, 4), 5);

  // the guard that stops the helper from becoming a way to CREDIT a purse
  checkTrue("G6: a NEGATIVE intended debit is unaffordable, never a silent credit", coinShortfall(-3, 5) > 0);
  checkTrue("G6: a NaN intended debit is unaffordable rather than clearing", coinShortfall(NaN, 5) > 0);
  checkTrue("G6: an Infinite intended debit is unaffordable rather than clearing", coinShortfall(Infinity, 5) > 0);
  checkTrue("G6: an undefined intended debit is unaffordable rather than clearing", coinShortfall(undefined, 5) > 0);

  // exhaustive: the helper never reports a negative shortfall, and clearing always means the debit
  // genuinely fits. Cannot be satisfied by inspection.
  let violation = null, points = 0;
  for (let debit = 0; debit <= 12 && !violation; debit++) {
    for (let purse = 0; purse <= 12; purse++) {
      const short = coinShortfall(debit, purse);
      points++;
      if (short < 0) { violation = `debit=${debit} purse=${purse} -> negative shortfall ${short}`; break; }
      if (short === 0 && purse - debit < 0) { violation = `debit=${debit} purse=${purse} cleared but would go negative`; break; }
      if (short > 0 && purse - debit >= 0) { violation = `debit=${debit} purse=${purse} reported a shortfall it does not have`; break; }
    }
  }
  check(`G6 INVARIANT over ${points} points: clearing implies purse-debit >= 0, and no shortfall is ever negative${violation ? ` — FIRST VIOLATION ${violation}` : ""}`, violation, null);

  // the helper is PURE — it must not mutate a purse-bearing object handed to it by mistake
  {
    const p = { coins: 5 };
    coinShortfall(3, p.coins);
    check("G6: the helper mutates nothing — the purse it was asked about is unchanged", p.coins, 5);
  }

  /* ---- the INTERLEAVE itself, arithmetically. This is the assertion that would have caught F12
   * and catches the whole class; the pure helper checks above would not. Scripted exactly as the
   * audit's shortest repro: an option priced against the purse the player HELD when the list was
   * built, then the 1-coin slow-play penalty, then the settlement. ---- */
  {
    let worst = null, cases = 0;
    for (let purse = 0; purse <= 8; purse++) {
      // the option list is built now: every price the player can currently afford is offered
      for (let priced = 0; priced <= purse; priced++) {
        // ...the player sits past 20s, and applyShotClockPenalty takes min(1, coins) from THIS seat
        const afterPenalty = purse - Math.min(1, purse);
        // ...and only now does the click resolve and the settlement run
        const settled = coinShortfall(priced, afterPenalty) === 0 ? afterPenalty - priced : afterPenalty;
        cases++;
        if (settled < 0) worst = worst || `purse=${purse} priced=${priced} penalty=1 -> ${settled}`;
      }
    }
    check(`G6: over ${cases} scripted (build -> 20s penalty -> settle) interleaves, no captain's purse can end below zero${worst ? ` — FIRST NEGATIVE ${worst}` : ""}`, worst, null);
    // and the unguarded arithmetic the audit found really does go negative, so the test above is
    // proving something rather than restating an impossibility
    checkTrue("G6: the UNGUARDED settlement genuinely goes negative on the audit's shortest repro (purse 3, priced 3, penalty 1) — the guard is load-bearing", (3 - Math.min(1, 3)) - 3 < 0);
  }
}

/* ---------- G6: the guards are actually AT the call sites, not merely available ----------
 * The helper passing its own unit tests proves nothing about whether anything calls it. Located by
 * CONTENT, never by line number, in this file's established convention. */
{
  const liveCode = FLOW_SRC.split("\n").filter((l) => !/^\s*\/\//.test(l)).join("\n");
  const ORCH_PATH = path.join(ROOT, "src", "orchestrator.js");
  const ORCH_REL = path.relative(ROOT, ORCH_PATH);
  const ORCH_SRC = fs.readFileSync(ORCH_PATH, "utf8");
  const orchCode = ORCH_SRC.split("\n").filter((l) => !/^\s*\/\//.test(l)).join("\n");

  // the five src/ui/flow.js sites, each identified by the debit it protects
  const flowSites = [
    ["site 5 — storm anchor pay", /v==="pay"&&!coinShortfall\(1,p\.coins\)/],
    ["site 2 — trade counter settlement (the FULL total, not just the increment)", /deal&&!coinShortfall\(give\.coins\+askFor,p\.coins\)/],
    ["site 3 — accepted-offer settlement routes to the existing decline path", /!accept\|\|coinShortfall\(give\.coins,p\.coins\)/],
    ["site 11 — side-bet stake, losing branch only", /won\|\|!coinShortfall\(bet\.amt,p\.coins\)/],
  ];
  for (const [name, re] of flowSites) {
    checkTrue(`G6: ${FLOW_REL} ${name} re-validates before debiting`, re.test(liveCode));
  }
  // sites 7 and 8 are the same guard shape at two sail sites — both must carry it
  const sailGuards = (liveCode.match(/dest&&!coinShortfall\(1,p\.coins\)/g) || []).length;
  check("G6: BOTH sail sites (7 — action menu, 8 — turn start) re-validate before p.coins--", sailGuards, 2);

  // the two src/orchestrator.js sites
  checkTrue(`G6: ${ORCH_REL} site 14 — defender flee re-validates, falling through to keep fighting`, /flee&&!coinShortfall\(1,def\.coins\)/.test(orchCode));
  checkTrue(`G6: ${ORCH_REL} site 13 — asyncBattle carries the engine's own powder guard`, /c\.powder&&coinShortfall\(c\.powder,att\.coins\)\)return null/.test(orchCode));
  // ...and it must sit BEFORE the opening broadcast, which is the whole answer to the audit's
  // "a battle snapshot may already be in flight" concern
  {
    const guardIdx = orchCode.indexOf("c.powder&&coinShortfall(c.powder,att.coins)");
    const openIdx = orchCode.indexOf("adhoc.battle.opening") >= 0
      ? orchCode.indexOf("attacks ${pn(def.idx)}! First to")
      : orchCode.indexOf("First to ${need} hits wins");
    checkTrue("G6: site 13's guard sits BEFORE asyncBattle's opening broadcast — no battle snapshot can be in flight when it returns null", guardIdx > 0 && openIdx > guardIdx);
  }

  // site 4 is already closed by yesterday's D-40 guard and must NOT be double-guarded
  checkTrue("G6: site 4 (dock buy) keeps its existing D-40 guard, re-reading p.coins rather than the pre-await flag", /buy&&p\.coins>=3/.test(liveCode));
  check("G6: site 4 is NOT double-guarded — one guard, not two doing the same job", /buy&&p\.coins>=3&&!coinShortfall/.test(liveCode), false);

  // the sites the audit marked SAFE are arithmetically closed; guarding them would add noise
  // without removing risk, so their existing clamps must still be the thing doing the work
  checkTrue("G6: site 12 (shot-clock forfeit) keeps its arithmetic clamp rather than gaining a redundant guard", /Math\.min\(5,p\.coins\)/.test(orchCode));
}

/* ---------- F5: an ingredient icon sits directly before the noun it names ---------- */
// Both sites live inside DOM-needing functions (humanAct, humanDock), so they are pinned as
// source-text assertions — this file's established convention. Located by CONTENT, never by line.
{
  const liveCode = FLOW_SRC.split("\n").filter((l) => !/^\s*\/\//.test(l)).join("\n");

  // Site 1 — the dock action button. Wyatt's own example: "Dock at 🥛 Full Cream Folly".
  const dockBtn = (liveCode.match(/`[^`]*Dock at[^`]*`/g) || []).find((t) => t.includes("⚓"));
  checkTrue("F5: the dock action button label located by content", !!dockBtn);
  if (dockBtn) {
    checkTrue(`F5: the dock button puts the icon AFTER "Dock at" — ${dockBtn}`, dockBtn.indexOf("Dock at") < dockBtn.indexOf("iconImg"));
    checkTrue("F5: the dock button's icon sits immediately before the place name, with nothing between them", /Dock at \$\{iconImg\(ING_IMG\[port\]\)\} \$\{dockPlace\(port\)\}/.test(dockBtn));
    checkTrue("F5/D-16: the dock button still carries its ingredient icon", dockBtn.includes("iconImg(ING_IMG[port])"));
    checkTrue("F5: the anchor still leads the dock button — it labels the ACTION, not the island", dockBtn.trim().startsWith("`⚓"));
  }

  // Site 2 — the dock-on-tails buy prompt, now rendered through the declared {prefix,name} split.
  const tailsIdx = liveCode.indexOf("Tails! Take");
  checkTrue("F5: the dock-on-tails buy prompt located by content", tailsIdx > 0);
  if (tailsIdx > 0) {
    const tailsRegion = liveCode.slice(tailsIdx - 120, tailsIdx + 260);
    checkTrue(`F5: the tails buy prompt renders its flavour through dockFlavorIcon() (${FLOW_REL}:${lineOf(FLOW_SRC, FLOW_SRC.indexOf("Tails! Take"))})`, /dockFlavorIcon\s*\(/.test(tailsRegion));
    checkTrue("F5: the buy BUTTON label keeps its own icon-then-name rendering (ilabelImg) — it was already correct", /ilabelImg\(ing\)/.test(tailsRegion));
  }
  check("F5: no icon-before-flavour interpolation survives anywhere in this file", /iconImg\(ING_IMG\[\w+\]\)\}\s*\$\{dockFlavor\(/.test(liveCode), false);
  check("F5: dockFlavor is no longer imported here — dockFlavorIcon replaced its only use", /\bdockFlavor\b(?!Icon)/.test(liveCode), false);

  // The dock FLIP prompt was measured ALREADY CORRECT in the playtest (icon directly before the
  // place name) and must not have moved. Located by its own text — "Docking at", not "Dock at".
  const flipPrompt = (liveCode.match(/`[^`]*Docking at[^`]*`/g) || []).find((t) => t.includes("flip!"));
  check("F5: the dock FLIP prompt is byte-unchanged — the playtest measured it already correct",
    flipPrompt, "`Docking at ${iconImg(ING_IMG[ing])} ${dockPlace(ing)} — flip!`");
}

/* ---------- F9: the unaffordable dock-buy option greys out with its reason, instead of vanishing ---------- */
{
  const liveCode = FLOW_SRC.split("\n").filter((l) => !/^\s*\/\//.test(l)).join("\n");
  const tailsIdx = liveCode.indexOf("Tails! Take");
  checkTrue("F9: the dock-on-tails prompt located by content", tailsIdx > 0);

  // 1. the coin test is OUT of the branch condition, so the prompt can no longer vanish. Extracted
  //    by balancing the if(...) parens — slicing to the prompt instead would run past the condition
  //    into the statement below it and read `const canBuy=p.coins>=3` as part of the guard.
  const before = liveCode.slice(Math.max(0, tailsIdx - 420), tailsIdx);
  const lastIf = before.lastIndexOf("if(");
  let depth = 0, condEnd = -1;
  for (let k = lastIf + 2; lastIf >= 0 && k < before.length; k++) {
    if (before[k] === "(") depth++;
    else if (before[k] === ")") { depth--; if (depth === 0) { condEnd = k; break; } }
  }
  const branchCond = condEnd < 0 ? "" : before.slice(lastIf, condEnd + 1);
  checkTrue("F9: the enclosing branch condition was located", !!branchCond);
  check(`F9: the coin test is OUT of the branch condition, so the prompt always shows — ${branchCond}`, /p\.coins/.test(branchCond), false);
  checkTrue("F9: the buy-rule and remaining-stock tests DO remain in the condition", /dockBuy/.test(branchCond) && /tokens/.test(branchCond));

  // 2. affordability now only decides whether the option is clickable
  const callRegion = liveCode.slice(tailsIdx, tailsIdx + 900);
  checkTrue("F9/D-41: the buy option carries a disabled flag", /disabled\s*:\s*!canBuy/.test(callRegion));
  checkTrue("F9: canBuy is computed from the purse", /const canBuy=p\.coins>=3;/.test(liveCode));

  // 3. Wyatt's approved reason ships BYTE-EXACT, with its U+2014 em dash and its coin shorthand
  const REASON = "Yer too broke to buy it — take the 3\u{1F315} instead.";
  checkTrue("F9: the approved reason is present byte-exact (U+2014 em dash, 🌕 emoji shorthand)", FLOW_SRC.includes(REASON));
  check("F9/D-53: the dash is U+2014 — not an en dash, not a hyphen", /Yer too broke to buy it (–|-) /.test(FLOW_SRC), false);
  check("F9/D-50: the coin stays as emoji shorthand — emojify() renders the art at the panel() chokepoint, so no hand-rolled img tag", /<img[^>]*coin[^>]*>\s*instead/i.test(FLOW_SRC), false);
  checkTrue("F9: the reason is supplied CONDITIONALLY, so an affordable captain sees no helper text", /canBuy\?null:`Yer too broke to buy it/.test(liveCode));

  // 4. D-40 safety net — and it re-reads the purse rather than trusting the pre-await flag, because
  //    the shot clock's 20s penalty can take a coin WHILE this prompt is open (COIN-AUDIT.md site 4).
  const buyGuard = (liveCode.slice(tailsIdx, tailsIdx + 900).match(/if\s*\(\s*buy[^)]*\)/) || [""])[0];
  checkTrue("F9/D-40: the purchase branch was located", !!buyGuard);
  checkTrue(`F9/D-40: the purchase is guarded on affordability as well as on the returned choice — ${buyGuard}`, /&&/.test(buyGuard));
  check("F9/D-40: the guard re-reads p.coins rather than trusting the pre-await canBuy flag", /if\(buy&&p\.coins>=3\)/.test(liveCode), true);
}

/* ---------- D-09: the round-level lines this plan must NOT touch stay out of this file's diff surface ---------- */
{
  checkTrue("D-09: this file never defines EVENT_NARRATION.newround (that table lives in src/ui/util.js, plan 15-04's territory)", !FLOW_SRC.includes("newround:"));
}

console.log(`\n${failures ? "FAILED" : "PASSED"} — ${failures} failing check(s)`);
process.exit(failures ? 1 : 0);
