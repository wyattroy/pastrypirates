/* ============================================================================
 * art-review/narration-core.js — the narration audit's shared RENDER CORE.
 *
 * REVIEW TOOLING ONLY. This module is never shipped to a player and nothing in
 * `src/` or `index.html` may import it — `scripts/narration_audit_check.js`
 * gates that in both directions. It exists so the audit page and the Node gates
 * render every card's TEXT through ONE implementation instead of two.
 *
 * WHY IT EXISTS (the second decay, 15-07 Task 3). `narration-audit.html` used to
 * hand-write the current wording for every ad-hoc site in its own per-site
 * renderer table. Those literals were true when typed and had gone 20-of-26
 * orphaned and pre-15-06 in wording — cards would have shown copy the game no
 * longer ships. Table cards never had that problem, because they call the real
 * builders through describeFor(). This module generalises that: EVERY card's
 * text is produced from live source, and because the page and `npm test` both
 * import it, the tool's health is checkable WITHOUT A BROWSER — the reason
 * "nothing enforced it afterwards" was true for the last two drifts.
 *
 * WHAT IS AND IS NOT IN HERE. Text and metadata only: no HTML card shell, no
 * editing controls, no flow-chart layout, no persistence. The page owns all of
 * that. This module is DOM-free by contract (no document/window/localStorage)
 * so plain `node` can import it.
 *
 * THE TWO INJECTED DEPENDENCIES, and why they are injected rather than sniffed:
 *   - `fixAssetPaths` — the page serves from art-review/ and needs `../assets/`;
 *     Node needs no rewrite at all. Injected, DEFAULTING TO IDENTITY, so the two
 *     consumers cannot disagree about anything except the path prefix.
 *   - `sources` — a { "src/ui/flow.js": "<file text>" } map. Some copy sites
 *     interpolate a local computed a few lines above the call (`neutralBanner`,
 *     `promptMsg`, `sub`). Rather than hand-transcribing those — the exact rot
 *     this module deletes — resolveLocal() finds the local's OWN declaration in
 *     the real file and evaluates that. Node reads the files with fs; the page
 *     fetches them. Injecting the text keeps the core synchronous and DOM-free.
 * ==========================================================================*/

import { appState } from "../src/state/index.js";

/* ---- Synthetic four-captain bootstrap. A fixed roster so pn()/poss() render real
 * names in real seat colours, plus a game shape just complete enough that every
 * EVENT_NARRATION builder and every imported helper runs with no throw outside a
 * live game. appState is a plain mutable object and roundCfg is a pure function;
 * neither has import-time side effects (verified in 15-PATTERNS.md). ---- */
export const SEAT_NAMES = ["Crustbeard", "Davy Scones", "Dough Hook", "Flaky Jack"];
appState.roster = SEAT_NAMES.map((name) => ({ id: "synthetic", name }));
appState.game = {
  cfg: { tradeBonus: true, sardine: true, powder: 2 },
  events: [],
  // `flips`/`heads` feed src/ui/board.js's end-of-voyage heads-luck row (a plausible sample stands in
  // for a real tally, exactly as BASE_EVENTS stands in for a real event — it decides the NUMBER
  // interpolated, never the wording around it).
  players: [
    { recipe: ["wheat", "sugar", "eggs"], flips: 12, heads: 7 },
    { recipe: ["cocoa", "dairy", "spice"], flips: 9, heads: 4 },
    { recipe: ["vanilla", "spice"], flips: 11, heads: 6 },
    { recipe: ["wheat", "cocoa", "dairy"], flips: 8, heads: 3 },
  ],
  windNow: "N",
  windNow2: "S",
  stormNow: true,
  winner: 0,
  home: [0, 0],
  // The end-of-voyage stats table (D-32 board surface) interpolates these. Same standing: sample
  // tallies, so the real template runs and its HEADINGS — "Rounds", "attacker won X%", "yes — N
  // finishers" — are reviewable copy rather than prose somebody typed into this page by hand.
  round: 7,
  battles: 4,
  attWins: 3,
  trades: 5,
  finishOrder: [0, 1],
  // Method stubs the real option/helper-text expressions call while deciding which branch of a
  // prompt to build (`tradeOpp(p).length`, `needs(p).length`). They stand in for game state the
  // same way BASE_EVENTS stands in for a real event — they decide which branch renders, never what
  // it says. Without them the greyed-Trade helper text (D-41) could not be rendered at all.
  tradeOpp: () => [1],
  needs: () => ["cocoa"],
  ev: () => {},
};

export const {
  EVENT_NARRATION, describeFor, narrationVariants, NEUTRAL_VIEWER, pn, poss, fmtItem, pname,
} = await import("../src/ui/util.js");
export const {
  brokeSailLine, brokeAnchorLine, stormIntroClause, secondLegLine,
} = await import("../src/ui/flow.js");
const shared = await import("../src/shared/index.js");
export const {
  DIRNAME, emojify, ilabelImg, iconImg, ING_IMG, EMOJI_IMG, ASSET_BASE, HEXCOL,
  DOCK_FLAVOR, DOCK_PLACE, ING_ALL, dockPlace, dockFlavor, dockFlavorIcon, man,
} = shared;
const { recipeInfo, winRecipeSpan } = await import("../src/ui/recipe.js");

/* ============================================================================
 * Injected configuration
 * ==========================================================================*/
const config = {
  fixAssetPaths: (html) => html, // identity by default — Node needs no rewrite
  sources: {},                   // file path -> raw file text, for resolveLocal()
};
export function configure(opts) {
  if (!opts) return;
  if (typeof opts.fixAssetPaths === "function") config.fixAssetPaths = opts.fixAssetPaths;
  if (opts.sources) config.sources = opts.sources;
}
/** The files resolveLocal() needs text for — the consumer loads exactly these. */
export const SOURCE_FILES = [
  "src/ui/flow.js", "src/ui/util.js", "src/ui/panel.js", "src/ui/lobby.js",
  "src/ui/board.js", "src/orchestrator.js",
];

export function escapeHtml(s) {
  return (s || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

/* ============================================================================
 * D-29 pirate register — THE ONE DECLARATION SITE IN THE REPO.
 *
 * you->ye, your->yer, you're->yer: one word does both "your" and "you're" jobs,
 * Wyatt's explicit call. Case-preserving. Word-boundary matched and longest-
 * alternative-first (yourself/you're/yours before bare your/you) — otherwise
 * "you're" collapses to "ye're" and "yours"/"yourself" truncate. Word boundaries
 * are mandatory: `layout`, `layoutWide`, `youIdx`, `stillDockedYou`, `bonusYou`
 * and `outcomeYou` all contain "you" as a bare substring and would corrupt under
 * a naive replace (`layout` -> `layet`); \b rejects every one correctly.
 *
 * PRONOUN_RE is the DETECTOR half — the same word list expressed for "does this
 * string still contain pre-conversion second person?" rather than for
 * substitution. scripts/ui_contract_check.js imports it from here instead of
 * declaring a second copy; one regex expressing one word list two ways was the
 * duplication worth collapsing (15-07 Task 3).
 * ==========================================================================*/
export const PIRATE_MAP = { yourself: "yerself", "you're": "yer", yours: "yers", your: "yer", you: "ye" };
// Both regexes are DERIVED from PIRATE_MAP's own keys, longest-first. That is the point of putting
// them here: the word list is written down exactly ONCE in the repo. Previously the substitution
// map lived in the audit page and scripts/ui_contract_check.js expressed the same list a second way
// as a detector, so "which words are in scope?" had two answers that could drift apart.
const ALTERNATION = Object.keys(PIRATE_MAP).sort((a, b) => b.length - a.length).join("|");
export const PIRATE_RE = new RegExp(`\\b(${ALTERNATION})\\b`, "gi");
/** The DETECTOR half — same word list, asking "does this still contain pre-conversion 2nd person?" */
export const PRONOUN_RE = new RegExp(`\\b(?:${ALTERNATION})\\b`, "i");
export function pirateVoice(text) {
  if (!text) return text;
  return text.replace(PIRATE_RE, (match) => {
    const replacement = PIRATE_MAP[match.toLowerCase()];
    if (!replacement) return match;
    const firstIsUpper = match[0] !== match[0].toLowerCase() && match[0] === match[0].toUpperCase();
    return firstIsUpper ? replacement[0].toUpperCase() + replacement.slice(1) : replacement;
  });
}

/* ---- D-38 sign rule. Every parenthesised cost/benefit adjacent to a coin glyph
 * carries an explicit + or −, and every player-facing minus is U+2212. Applied
 * LIVE at the same chokepoint as D-29, because D-25 makes `keep` mean "ship
 * exactly what this card displays".
 *
 * A coin amount reaches applySignRule in ONE OF TWO SHAPES: ad-hoc/button text
 * is still a raw "🌕" (finalize() has not emojified it yet), while TABLE text is
 * already an <img> because describeFor() calls the real emojify() INTERNALLY
 * before returning. COIN_MARKER matches either shape so one rule covers both. ---- */
export const COIN_MARKER = '(?:🌕|<img[^>]*?src="[^"]*coin[^"]*"[^>]*>)';
const MINUS_HYPHEN_RE = new RegExp(`\\(-(\\d+)(${COIN_MARKER})\\)`, "g");
const SIGN_REPLACEMENTS = [
  [new RegExp(`\\(they pay 1(${COIN_MARKER})\\)`, "g"), (m, marker) => `(−1${marker})`],
  [new RegExp(`\\(pays 1(${COIN_MARKER})\\)`, "g"), (m, marker) => `(−1${marker})`],
  [new RegExp(`\\(2(${COIN_MARKER})\\)`, "g"), (m, marker) => `(+2${marker})`],
  [new RegExp(`\\(1(${COIN_MARKER})\\)`, "g"), (m, marker) => `(+1${marker})`],
];
export function applySignRule(html) {
  if (!html) return html;
  let out = html.replace(MINUS_HYPHEN_RE, (m, num, marker) => `(−${num}${marker})`);
  SIGN_REPLACEMENTS.forEach(([re, to]) => { out = out.replace(re, to); });
  return out;
}
/** The one place every piece of rendered/compared text flows through:
 *  applySignRule (D-38) -> emojify (custom art, D-17) -> asset-path rewrite -> pirateVoice (D-29).
 *  applySignRule MUST run before emojify — its regexes need the raw 🌕 character. */
export function finalize(html) {
  return pirateVoice(config.fixAssetPaths(emojify(applySignRule(html))));
}

/* ============================================================================
 * COMPARISON PROJECTIONS — owned here because Task 5's copy gate and Task 6's
 * applier BOTH import them, and a second copy is the disease this module cures.
 *
 * THE TOKEN-NAMING CONTRACT, which both consumers assert against. The two icon
 * forms must be distinguishable BY NAME, not merely unequal — a bare filename
 * token like "[coin.png]" satisfies neither consumer:
 *   - an <img>, or an emoji EMOJI_IMG covers (it BECOMES an <img> at render),
 *     projects to `[img:<asset-basename>]`   e.g. [img:coin-emoji]
 *   - an emoji EMOJI_IMG does NOT cover — the seven ingredient glyphs, D-17's
 *     defect — projects to `[raw:<glyph>]`
 * Collapsing the two would mask 15-VERIFICATION.md's gap G5 exactly: an icon
 * shipping in the wrong form while the comparison passes.
 * ==========================================================================*/
const IMG_TAG_RE = /<img\b[^>]*>/gi;
const SRC_RE = /src\s*=\s*"([^"]*)"/i;
function assetToken(src) {
  const base = String(src || "").split("/").pop().replace(/\.[a-z0-9]+$/i, "");
  return `[img:${base}]`;
}
/** Every emoji EMOJI_IMG covers, longest-first so multi-codepoint sequences match whole. */
const COVERED_EMOJI = Object.keys(EMOJI_IMG).sort((a, b) => b.length - a.length);
/** Any emoji-range glyph, so an UNCOVERED one is still visible as [raw:…] rather than silently kept. */
const EMOJI_RANGE_RE = /(?:\p{Extended_Pictographic}(?:️)?(?:‍\p{Extended_Pictographic}(?:️)?)*)/gu;

/** Project rendered HTML to a comparable form. Icons survive as named tokens. */
export function project(html) {
  if (html == null) return "";
  let s = String(html);
  // an <img> is already custom art
  s = s.replace(IMG_TAG_RE, (tag) => {
    const m = SRC_RE.exec(tag);
    return assetToken(m ? m[1] : "");
  });
  // a coloured-name element unwraps to the bare name
  s = s.replace(/<b[^>]*style="[^"]*color:[^"]*"[^>]*>([\s\S]*?)<\/b>/gi, "$1");
  // an emoji EMOJI_IMG covers becomes an <img> at render, so it projects the SAME way
  for (const glyph of COVERED_EMOJI) {
    if (s.includes(glyph)) s = s.split(glyph).join(assetToken(EMOJI_IMG[glyph]));
  }
  // anything emoji-shaped LEFT is art EMOJI_IMG does not cover — D-17's defect, kept visible
  s = s.replace(EMOJI_RANGE_RE, (g) => `[raw:${g}]`);
  // strip the remaining markup, collapse whitespace
  s = s.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, "");
  s = s.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');
  return s.replace(/\s+/g, " ").trim();
}

/* ---- D-50 glossary: Wyatt's {token} shorthand for an icon he wants in a rewrite.
 * His two DISPLAY-WORD tokens map to the real ingredient keys — milk to dairy,
 * cinnamon to spice — because he types what the game shows him, not the key. ---- */
export const APPROVED_GLOSSARY = {
  coin: "🌕", "coin-heads": "⚪", "coin-tails": "⚫", sailboat: "⛵", swords: "⚔",
  sugarfish: "🐠", crab: "🦀", rod: "🎣", "fishing-hook": "🎣",
  clock: "⏳", stopwatch: "⏳", // D-50 RESOLVED: both to the hourglass
};
/** Ingredient tokens resolve through the REAL art helper, never a hand-written path. */
const GLOSSARY_INGREDIENTS = { milk: "dairy", cinnamon: "spice" };

/** Project Wyatt's stored prose into the same comparable form as project(). */
export function projectApproved(text) {
  if (text == null) return "";
  let s = String(text);
  // his {token} shorthand -> the real markup, then the shared projection below
  s = s.replace(/\{([a-z0-9-]+)\}/gi, (whole, rawKey) => {
    const key = rawKey.toLowerCase();
    if (Object.prototype.hasOwnProperty.call(APPROVED_GLOSSARY, key)) return APPROVED_GLOSSARY[key];
    const ingKey = GLOSSARY_INGREDIENTS[key] || key;
    if (ING_ALL.includes(ingKey)) return ilabelImg(ingKey);
    return whole; // unknown token: leave it visible rather than silently dropping it
  });
  // D-53: a double hyphen is an EM dash, never an en dash — and never a dash between digits
  s = s.replace(/(?<!\d)--(?!\d)/g, "—");
  // D-50 whitespace discipline: trim, and collapse a double space
  s = s.replace(/[ \t]{2,}/g, " ").trim();
  return project(finalize(s));
}

/* ============================================================================
 * D-51: fabricated events must still satisfy their real emit sites' invariants.
 * A THIRD class of audit defect, distinct from the two already self-checked:
 *   D-21            a branch the game produces but no card renders
 *   D-33/34/40/43   a card renders text the game can never produce
 *   D-51            a card renders the RIGHT line with IMPOSSIBLE VALUES
 * ==========================================================================*/
export const FABRICATED_EVENT_VIOLATIONS = [];
export function assertBattleEventInvariants(ev, label) {
  // Paired-field invariant: every real emit site sets spoil and spoilIng TOGETHER —
  // spoil=ilabelImg(pick), spoilIng=pick (orchestrator.js, engine/index.js) — and spoil is never
  // null even on a coin win. A hand-written `spoil:null` is how the literal word "null" once
  // reached a rendered card.
  if (ev.spoilIng) {
    const expected = ilabelImg(ev.spoilIng);
    if (ev.spoil !== expected) {
      FABRICATED_EVENT_VIOLATIONS.push(`${label}: spoilIng=${JSON.stringify(ev.spoilIng)} is set but spoil is not ilabelImg(spoilIng) (got ${JSON.stringify(ev.spoil)}) — real emit sites always set both together (D-51)`);
    }
  } else if (ev.spoil == null) {
    FABRICATED_EVENT_VIOLATIONS.push(`${label}: spoil is ${JSON.stringify(ev.spoil)} with no spoilIng set — the real game never leaves spoil unset (D-51)`);
  }
  // Reachable-score invariant: asyncBattle() is first to 2 hits, so the winner's own round count
  // must be exactly 2 and the loser can never also reach 2.
  if (Array.isArray(ev.rounds)) {
    const aScore = ev.rounds.filter((r) => r[3] === "a").length;
    const dScore = ev.rounds.filter((r) => r[3] === "d").length;
    const winnerScore = ev.winner === ev.a ? aScore : dScore;
    const loserScore = ev.winner === ev.a ? dScore : aScore;
    if (winnerScore !== 2 || loserScore >= 2) {
      FABRICATED_EVENT_VIOLATIONS.push(`${label}: rounds score ${aScore}-${dScore} is not a reachable outcome for a first-to-2 battle (D-51)`);
    }
  }
}

/* ============================================================================
 * D-21: exhaustive branch enumeration for the EVENT_NARRATION table.
 * BASE_EVENTS gives every key a plausible default event; TABLE_BRANCHES lists one
 * entry PER BRANCH for every key that branches on something besides viewer
 * perspective. `tag: null` marks the branch keeping the bare `table:<key>` id.
 * ==========================================================================*/
export const BASE_EVENTS = {
  newround: () => ({ t: "newround", dir: "N", dir2: "S", windStreak: 1, storm: true, streak: 1, round: 3 }),
  windmove: () => ({ t: "windmove", p: 0 }),
  blownOut: () => ({ t: "blownOut", p: 0 }),
  sail: () => ({ t: "sail", p: 0 }),
  dodge: () => ({ t: "dodge", p: 0 }),
  anchor: () => ({ t: "anchor", p: 0 }),
  moored: () => ({ t: "moored", p: 0, reason: "justDocked" }),
  blocked: () => ({ t: "blocked", p: 0, other: 1 }),
  anchorHold: () => ({ t: "anchorHold", p: 0 }),
  tradewind: () => ({ t: "tradewind", p: 0 }),
  parley: () => ({ t: "parley", a: 0, b: 1, offer: "wheat", want: "sugar", ok: true }),
  aground: () => ({ t: "aground", p: 0, ing: null }),
  shipwrecked: () => ({ t: "shipwrecked", p: 0 }),
  dock: () => ({ t: "dock", p: 0, ing: "wheat", got: "ing", heads: 1 }),
  trade: () => ({ t: "trade", a: 0, b: 1, gave: "wheat", got: "sugar" }),
  sidebet: () => ({ t: "sidebet", p: 2, won: true, amt: 2, delta: 5, on: "a" }),
  // D-51: 2–1 in 3 rounds is a genuinely reachable first-to-2 outcome (the winner scores twice, the
  // loser once) rather than an impossible tie.
  battle: () => ({ t: "battle", a: 0, d: 1, winner: 0, rounds: [[1, 0, false, "a"], [0, 1, false, "d"], [1, 0, false, "a"]], spoil: "5 coins", spoilIng: null }),
  battleflee: () => ({ t: "battleflee", a: 0, d: 1 }),
  fish: () => ({ t: "fish", p: 0, heads: 1 }),
  finish: () => ({ t: "finish", p: 0 }),
  shotclock: () => ({ t: "shotclock", p: 0 }),
  // 2026-07-30: the event carries NO resource field any more — Wyatt removed both 30-second
  // penalties, so there is nothing to lose but the turn. The fabricated event must match the real
  // emit in expireShotClock exactly (`{t:"shotclockskip",p:p.idx}`), or the audit page would be
  // reviewing a shape the game can no longer produce.
  shotclockskip: () => ({ t: "shotclockskip", p: 0 }),
  bakeoff: () => ({ t: "bakeoff", a: 0, b: 1, winner: 0 }),
  end: () => ({ t: "end", winner: 0 }),
  turn: () => ({ t: "turn", p: 0 }),
};

// moored's movement-sensitive reasons need a real (turn-event, moored-event) pair in
// appState.game.events for movedSinceTurnStart() to resolve true/false instead of null.
//
// G2 (Wyatt-approved 2026-07-30): generalised from mooredDockEvent(moved) to take the reason too,
// because `home` now splits on movement exactly as `dock` does. D-21 requires the page to render
// EVERY branch, so the new home-shoved door needs its own card.
function mooredMovedEvent(reason, moved) {
  const at = moved ? [3, 3] : [0, 0];
  const turnEv = { t: "turn", p: 0, state: [{ pos: [0, 0] }, { pos: [9, 9] }, { pos: [9, 9] }, { pos: [9, 9] }] };
  const mooredEv = { t: "moored", p: 0, reason, state: [{ pos: at }, { pos: [9, 9] }, { pos: [9, 9] }, { pos: [9, 9] }] };
  appState.game.events = [turnEv, mooredEv];
  return mooredEv;
}

export const TABLE_BRANCHES = {
  // windStreak (direction-hold) and streak (storm-commitment) are two INDEPENDENT counters — this
  // key has 8 real branches, not 5: windHoldPhrase()'s own "is gusting" (windStreak===2) vs "won't
  // quit" (windStreak>=3) split is a further branch anywhere the `gust` clause is referenced.
  newround: [
    { tag: "freshWind", label: "Fresh wind, no storm", fields: { storm: false, windStreak: 1, streak: 0 } },
    { tag: "heldWindGusting", label: "Wind holds (2 rounds), no storm", fields: { storm: false, windStreak: 2, streak: 0 } },
    { tag: "heldWindWontQuit", label: "Wind holds (≥3 rounds — “won't quit”), no storm", fields: { storm: false, windStreak: 3, streak: 0 } },
    { tag: null, label: "Fresh storm", fields: { storm: true, windStreak: 1, streak: 1 } },
    { tag: "heldStorm", label: "Storm + wind holds (streak < 2)", fields: { storm: true, windStreak: 2, streak: 1 } },
    { tag: "streakStorm", label: "Storm committed ≥2 rounds running, wind not held", fields: { storm: true, windStreak: 1, streak: 2 } },
    { tag: "streakStormHeldGusting", label: "Storm committed ≥2 rounds + wind holds (2 rounds)", fields: { storm: true, windStreak: 2, streak: 2 } },
    { tag: "streakStormHeldWontQuit", label: "Storm committed ≥2 rounds + wind holds (≥3 — “won't quit”)", fields: { storm: true, windStreak: 3, streak: 2 } },
  ],
  moored: [
    { tag: null, label: "Reason: just docked", fields: { reason: "justDocked" } },
    { tag: "dockMoved", label: "Reason: dock — storm shoved you onto it THIS turn", buildEvent: () => mooredMovedEvent("dock", true) },
    { tag: "dockStill", label: "Reason: dock — already parked, storm-untouched", buildEvent: () => mooredMovedEvent("dock", false) },
    // fabricates no movement evidence, so movedSinceTurnStart returns null and this still renders
    // the "still docked" line — which is correct for a ship that was already berthed. Left as-is.
    { tag: "home", label: "Reason: home berth (Tortuga)", fields: { reason: "home" } },
    // G2 (Wyatt-approved 2026-07-30): the branch his playtest caught — a gust shoves ye onto the
    // Tortuga berth and it read as "still docked" instead of a lucky break.
    { tag: "homeMoved", label: "Reason: home berth (Tortuga) — storm shoved you onto it THIS turn", buildEvent: () => mooredMovedEvent("home", true) },
    { tag: "legacyFallback", label: "Reason: unrecognized (legacy replay log with no reason field)", fields: { reason: undefined } },
  ],
  parley: [
    { tag: null, label: "Deal struck", fields: { ok: true } },
    { tag: "refused", label: "Refused", fields: { ok: false } },
  ],
  aground: [
    { tag: null, label: "No crate held — half the coin purse lost", fields: { ing: null } },
    { tag: "crate", label: "Crate lost — tumbles overboard", fields: { ing: "wheat" } },
  ],
  dock: [
    { tag: null, label: "Heads — hauls aboard a crate", fields: { got: "ing", heads: 1 } },
    { tag: "empty", label: "Empty island — grabs 3 coins, no flip (NARR-07)", fields: { got: "empty" } },
    { tag: "bought", label: "Tails, buys the crate anyway", fields: { got: "bought", heads: 0 } },
    { tag: "coins", label: "Tails, takes the 3 coins", fields: { got: "coins", heads: 0 } },
  ],
  trade: [
    { tag: null, label: "Cooperation bonus ON (cfg.tradeBonus)", fields: {}, cfg: { tradeBonus: true } },
    { tag: "noBonus", label: "Cooperation bonus OFF", fields: {}, cfg: { tradeBonus: false } },
  ],
  sidebet: [
    { tag: null, label: "Won, backed with coin", fields: { won: true, amt: 2, delta: 5 } },
    { tag: "wonNoAmt", label: "Won, free call (no coin backed)", fields: { won: true, amt: 0, delta: 1 } },
    { tag: "lostAmt", label: "Lost, backed with coin", fields: { won: false, amt: 2, delta: -2 } },
    { tag: "lostNoAmt", label: "Lost, free call (no coin backed)", fields: { won: false, amt: 0, delta: 0 } },
  ],
  battle: [
    { tag: null, label: "Coin spoil — genuine bribe (a full 5-coin purse)", fields: { spoil: "5 coins", spoilIng: null } },
    { tag: "cleaned", label: "Coin spoil — cleaned out (under 5 coins)", fields: { spoil: "2 coins", spoilIng: null } },
    // D-51: derived via the SAME helper the game uses, never a hand-written literal — a hand-written
    // `spoil:null` is exactly how the literal word "null" reached a card once.
    { tag: "crate", label: "Ingredient spoil — a crate changes hands", fields: { spoil: ilabelImg("cocoa"), spoilIng: "cocoa" } },
  ],
  fish: [
    { tag: null, label: "Heads — sugarfish", fields: { heads: 1 } },
    { tag: "candycrab", label: "Tails, sardine rule ON — candycrab", fields: { heads: 0 }, cfg: { sardine: true } },
    { tag: "empty", label: "Tails, sardine rule OFF — empty-handed", fields: { heads: 0 }, cfg: { sardine: false } },
  ],
  // 2026-07-30: the two branches below rendered the crate-loss and coin-loss wordings. Both
  // mechanics are gone, so both branches are gone — D-21 requires a card for every branch that can
  // reach a player, and these two no longer can. Keeping them would have shown Wyatt two cards
  // rendering IDENTICAL text (the builder ignores `ing` now), which is worse than showing one.
  shotclockskip: [
    { tag: null, label: "Clock ran out — the turn is lost, nothing else", fields: {} },
  ],
};

export function withCfg(overrides, fn) {
  if (!overrides) return fn();
  const prev = Object.assign({}, appState.game.cfg);
  Object.assign(appState.game.cfg, overrides);
  try { return fn(); } finally { Object.assign(appState.game.cfg, prev); }
}
function resetEvents() { appState.game.events = []; }
export function tableCardId(key, tag) { return tag ? `table:${key}~${tag}` : `table:${key}`; }

export function renderTableBranch(key, spec) {
  resetEvents();
  const ev = spec.buildEvent ? spec.buildEvent() : Object.assign(BASE_EVENTS[key](), spec.fields || {});
  // D-51: check the ACTUAL constructed event against its real-emit-site invariants before rendering.
  if (key === "battle") assertBattleEventInvariants(ev, tableCardId(key, spec.tag));
  const run = () => ({ rendered: describeFor(ev, NEUTRAL_VIEWER), variants: narrationVariants(ev) });
  const { rendered, variants } = spec.cfg ? withCfg(spec.cfg, run) : run();
  resetEvents();
  return { rendered, variants, ev };
}

/** Every table card's TEXT, in the shape art-review/narration-table-baseline.json pins. */
export function tableCards() {
  const cards = {};
  for (const key of Object.keys(BASE_EVENTS)) {
    const specs = TABLE_BRANCHES[key] || [{ tag: null, label: `EVENT_NARRATION.${key}` }];
    for (const spec of specs) {
      const { rendered, variants } = renderTableBranch(key, spec);
      const neutral = rendered && rendered.txt ? finalize(rendered.txt) : null;
      cards[tableCardId(key, spec.tag)] = {
        key,
        label: spec.label || `EVENT_NARRATION.${key}`,
        silent: !neutral,
        neutral,
        variants: (variants || []).map((v) => ({ seat: v.seat, text: finalize(v.html) })),
      };
    }
  }
  return cards;
}

// Default recommendation per table key, and the curated per-key notes. Biased toward "rewrite" only
// where lines genuinely blur (D-06).
export const TABLE_TAGS = {
  newround: "keep", windmove: "rewrite", blownOut: "rewrite", sail: "keep", dodge: "keep",
  anchor: "keep", moored: "keep", blocked: "keep", anchorHold: "keep", tradewind: "rewrite",
  parley: "merge", aground: "keep", shipwrecked: "keep", dock: "keep", trade: "keep",
  sidebet: "keep", battle: "keep", battleflee: "keep", fish: "keep", finish: "keep",
  shotclock: "keep", shotclockskip: "keep", bakeoff: "keep", end: "keep", turn: "keep",
};
export const TABLE_MERGE_TARGET = { parley: "table:trade" }; // D-19
export const TABLE_BRANCH_MERGE_TARGET = {
  "table:newround~heldStorm": "table:newround",
  "table:newround~streakStormHeldWontQuit": "table:newround~streakStormHeldGusting",
};
export const TWO_PARTY_ROLE_LABELS = {
  battle: (ev, seat) => (seat === ev.a ? "the attacker" : "the defender"),
  battleflee: (ev, seat) => (seat === ev.a ? "the attacker" : "the defender"),
  parley: (ev, seat) => (seat === ev.a ? "the offerer" : "the other captain"),
  trade: (ev, seat) => (seat === ev.a ? "the offerer" : "the other captain"),
  blocked: (ev, seat) => (seat === ev.p ? "the blocked captain" : "the ship in the way"),
  bakeoff: (ev, seat) => (seat === ev.a ? "the first finalist" : "the other finalist"),
};

/* ============================================================================
 * EVALUATION — running the real extracted expression instead of transcribing it.
 *
 * A raw extracted snippet is a genuine JS expression: it compiled in the real
 * file, so it is guaranteed syntactically valid. Only expressions from the
 * repo's own tracked source are ever compiled here — never a disposition field,
 * never network input, never anything Wyatt types (threat T-QT-02).
 * ==========================================================================*/
const CTX_BASE = {
  pn, poss, pname, ilabelImg, iconImg, ingImg: shared.ingImg, iname: shared.iname, fmtItem, DIRNAME, appState, man,
  dockPlace, dockFlavor, ING_IMG, ING_ALL, DOCK_FLAVOR, DOCK_PLACE, HEXCOL, ASSET_BASE,
  // F5 (2026-07-29): the dock-on-tails buy prompt now renders its flavour through dockFlavorIcon(),
  // so the eval scope has to know the symbol — without it EVERY snippet in src/ui/flow.js throws
  // and the file's local-variable resolution is poisoned, not just the one card that uses it.
  dockFlavorIcon,
  describeFor, narrationVariants, NEUTRAL_VIEWER, brokeSailLine, brokeAnchorLine,
  stormIntroClause, secondLegLine, recipeInfo, winRecipeSpan,
  ns: pn, nm: pn, ny: pn,
  p: { idx: 0, coins: 4, ing: ["wheat", "sugar"], pos: [2, 2] },
  q: { idx: 1, coins: 4, ing: ["cocoa"], pos: [3, 2] },
  s: { idx: 2, coins: 4 }, o: { idx: 1 },
  att: { idx: 0 }, def: { idx: 1 }, win: { idx: 0 }, lose: { idx: 1 },
  A: { idx: 0 }, B: { idx: 1 },
  who: "a", ing: "wheat", want: "sugar", price: 6, askFor: 2, n: 3, port: "wheat",
  // sample coin-flip outcomes — `h`/`ah`/`dh` are the real locals the flip sites branch on
  need: 2, amt: 2, calledIdx: 0, h: true, ah: true, dh: false, e: { p: 0 }, g: appState.game,
  dwName: pn(0), code: "AB12", seatIdx: 1, i: 0, lead: pn(0),
  rest: `${pn(1)} (+1🌕), ${pn(2)} (+2🌕), ${pn(3)} (+3🌕)`,
  offerDisplay: `${ilabelImg("wheat")}`,
  st: { baseIng: "wheat", want: "sugar", q: { idx: 1 } },
  label: null,
  // sample interpolation DATA (never copy — every string below comes from source):
  // settleSideBets composes its line from a `parts` array built in a loop; a plausible two-bettor
  // sample stands in for the loop, exactly as BASE_EVENTS stands in for a real event.
  parts: [`${pn(2)} +5🌕`, `${pn(3)} −2🌕`],
};
Object.keys(shared).forEach((k) => { if (/_IMG$/.test(k) && !(k in CTX_BASE)) CTX_BASE[k] = shared[k]; });

/* An expression that legitimately EVALUATES to undefined (recipeInfo() on a recipe with no
 * artwork) must not be confused with one that could not run at all — otherwise the chain that
 * resolves `pic` from `wi` gives up at the first honest `undefined` and the whole victory line
 * renders as nothing. UNRESOLVED distinguishes the two; only the internal resolver sees it. */
const UNRESOLVED = Symbol("unresolved");
function tryEval(rawSrc, extraCtx) {
  if (!rawSrc) return UNRESOLVED;
  const ctx = Object.assign({}, CTX_BASE, extraCtx || {});
  const keys = Object.keys(ctx);
  try {
    const fn = new Function(...keys, `"use strict"; return (${rawSrc});`);
    return fn(...keys.map((k) => ctx[k]));
  } catch (err) {
    return UNRESOLVED;
  }
}

/** Compile and run one extracted expression. Returns null when it genuinely cannot run. */
export function evalSource(rawSrc, extraCtx) {
  const r = tryEval(rawSrc, extraCtx);
  return r === UNRESOLVED || r == null ? null : r;
}
function evalString(rawSrc, extraCtx) {
  const r = evalSource(rawSrc, extraCtx);
  return r == null ? null : (typeof r === "string" ? r : String(r));
}

/* ---- resolveLocal: the mechanism that replaced the hand-transcribed layer.
 *
 * Some copy sites interpolate a local computed a few lines above the call —
 * `neutralBanner`, `promptMsg`, `sub`, `battleOpenVariants`, `pic`. The old page
 * hand-wrote what those would produce, and that transcription is precisely what
 * went stale. Instead: find the local's OWN `const`/`let` declaration in the real
 * file, above the call site, and evaluate THAT expression. The copy therefore
 * always comes from source; only the sample CONDITIONS are curated (below),
 * which is the same discipline TABLE_BRANCHES already uses for events. ---- */
const DECL_CACHE = new Map();
function parses(expr) {
  try { new Function(`"use strict"; return (${expr});`); return true; } catch (e) { return false; }
}
/**
 * Find `name`'s own declaration above `beforeLine` and return its initialiser expression.
 *
 * A declaration may span lines — `const neutralBanner=stormNow` / `?\`…\`` / `:\`…\`;` — and the
 * FIRST line of such a ternary parses perfectly well on its own (`stormNow`), so "stop at the
 * first thing that parses" silently truncates a two-branch banner down to a bare boolean. The
 * statement end is what matters: accumulate until a line ends the statement with `;` AND the
 * accumulated text parses. (Caught live: the per-turn banner rendered as the string "true".)
 */
function findDeclaration(file, name, beforeLine) {
  const cacheKey = `${file}::${name}::${beforeLine}`;
  if (DECL_CACHE.has(cacheKey)) return DECL_CACHE.get(cacheKey);
  const text = config.sources[file];
  let found = null;
  if (text) {
    const lines = text.split("\n");
    const re = new RegExp(`^\\s*(?:const|let|var)\\s+${name}\\s*=\\s*([\\s\\S]*)$`);
    // walk BACKWARDS from the call site so the nearest enclosing declaration wins
    for (let i = Math.min(beforeLine, lines.length) - 1; i >= 0; i--) {
      const m = re.exec(lines[i]);
      if (!m) continue;
      let expr = m[1];
      for (let j = i; j < Math.min(i + 14, lines.length); j++) {
        if (j > i) expr += "\n" + lines[j];
        const stripped = expr.replace(/\s*;\s*$/, "").trim();
        if (/;\s*$/.test(expr) && parses(stripped)) { found = stripped; break; }
      }
      // a declaration with no terminating semicolon on any line: fall back to the first parse
      if (!found && parses(expr.trim())) found = expr.trim();
      if (found) break;
    }
  }
  DECL_CACHE.set(cacheKey, found);
  return found;
}

/**
 * Some locals are DECLARED empty and then ASSIGNED across an if/else chain —
 * `let sub=null; if(targets.length)sub=…; else if(…)sub=…;` — so the declaration alone
 * resolves to null and says nothing about the copy. Rebuild the real control flow instead:
 * collect the declaration plus every later assignment to that name up to the call site, run
 * them as one mini-program under the branch axis's own context, and return the result. The
 * wording still comes entirely from source; the axis only supplies which branch is being asked
 * about. This is what makes ask()'s `sub` helper text (D-33/D-41) reviewable at all.
 */
const FLOW_CACHE = new Map();
function findAssignmentFlow(file, name, beforeLine) {
  const cacheKey = `${file}::flow::${name}::${beforeLine}`;
  if (FLOW_CACHE.has(cacheKey)) return FLOW_CACHE.get(cacheKey);
  const text = config.sources[file];
  let program = null;
  if (text) {
    const lines = text.split("\n");
    const declRe = new RegExp(`^\\s*(?:const|let|var)\\s+${name}\\s*=`);
    const assignRe = new RegExp(`(?:^|[;{}\\s)])${name}\\s*=(?!=)`);
    let start = -1;
    for (let i = Math.min(beforeLine, lines.length) - 1; i >= 0; i--) {
      if (declRe.test(lines[i])) { start = i; break; }
    }
    if (start >= 0) {
      const kept = [];
      for (let i = start; i < Math.min(beforeLine, lines.length); i++) {
        const line = lines[i];
        if (/^\s*\/\//.test(line)) continue;
        if (i === start || assignRe.test(line)) kept.push(line.replace(/^\s*(?:const)\s+/, "let "));
      }
      const body = `${kept.join("\n")}\nreturn ${name};`;
      try { new Function(`"use strict"; ${body}`); program = body; } catch (e) { program = null; }
    }
  }
  FLOW_CACHE.set(cacheKey, program);
  return program;
}
function runFlow(program, extraCtx) {
  const ctx = Object.assign({}, CTX_BASE, extraCtx || {});
  const keys = Object.keys(ctx);
  try {
    const fn = new Function(...keys, `"use strict"; ${program}`);
    const result = fn(...keys.map((k) => ctx[k]));
    return result === undefined ? null : result;
  } catch (err) {
    return null;
  }
}
/* A local's own declaration may itself reference a further local (`pic` -> `wi` ->
 * recipeInfo(...)), so resolution is RECURSIVE with a depth cap. The cap exists so a
 * self-referential or mutually-referential pair can never spin. */
const MAX_LOCAL_DEPTH = 4;

/**
 * Evaluate a bare-identifier expression by resolving the identifier's own declaration —
 * falling back to its real assignment chain when the declaration alone yields nothing
 * (the `let sub=null; … sub=…` shape).
 */
export function resolveLocal(file, line, name, extraCtx, depth = 0) {
  const r = resolveLocalDeep(file, line, name, extraCtx, depth);
  return r === UNRESOLVED ? null : r;
}
function resolveLocalDeep(file, line, name, extraCtx, depth = 0) {
  const decl = findDeclaration(file, name, line);
  const declValue = decl == null ? UNRESOLVED : evalDeepRaw(decl, file, line, extraCtx, depth + 1);
  // `let sub=null` is a real declaration that really evaluates to null — the copy lives in the
  // REASSIGNMENTS below it. So a null/undefined declaration is not an answer; try the assignment
  // chain before accepting it, and only fall back to the declaration if the chain yields nothing.
  if (declValue !== UNRESOLVED && declValue !== null && declValue !== undefined) return declValue;
  const program = findAssignmentFlow(file, name, line);
  if (program) {
    const v = runFlow(program, extraCtx);
    if (v !== UNRESOLVED && v !== null && v !== undefined) return v;
  }
  return declValue;
}

/**
 * Evaluate `raw` against the shared context, resolving any identifier it references
 * that the context does not supply by reading that identifier's OWN declaration out
 * of the real source file. This is what replaced the hand-transcribed layer: the copy
 * always comes from source, however many locals deep it sits.
 */
function evalDeepRaw(raw, file, line, extraCtx, depth = 0) {
  if (!raw) return UNRESOLVED;
  const direct = tryEval(raw, extraCtx);
  if (direct !== UNRESOLVED) return direct;
  if (depth >= MAX_LOCAL_DEPTH) return UNRESOLVED;
  const ctx = Object.assign({}, CTX_BASE, extraCtx || {});
  const bare = String(raw).trim().match(/^([A-Za-z_$][A-Za-z0-9_$]*)$/);
  if (bare) return resolveLocalDeep(file, line, bare[1], extraCtx, depth);
  // A compound expression referencing one or more unbound locals. Only identifiers in a
  // VALUE position matter, but resolving a word that merely appears inside the template's
  // prose is harmless — it changes no output — so the cheap identifier sweep is safe.
  const idents = [...new Set((String(raw).match(/[A-Za-z_$][A-Za-z0-9_$]*/g) || []))].filter((n) => !(n in ctx));
  const bound = {};
  for (const n of idents) {
    const v = resolveLocalDeep(file, line, n, Object.assign({}, extraCtx, bound), depth);
    if (v !== UNRESOLVED) bound[n] = v;
  }
  if (!Object.keys(bound).length) return UNRESOLVED;
  return tryEval(raw, Object.assign({}, extraCtx, bound));
}
function evalWithLocals(raw, file, line, extraCtx) {
  const v = evalDeepRaw(raw, file, line, extraCtx, 0);
  return v === UNRESOLVED || v == null ? null : v;
}

/* ---- Curated BRANCH AXES for the sites whose local is a ternary. These supply
 * the CONDITION each branch represents, never the wording — the wording is read
 * out of the real declaration by resolveLocal(). Each entry names why the branch
 * exists, in Wyatt's own terms, so a card explains itself. ---- */
export const LOCAL_BRANCH_AXES = {
  // windLeg's storm-anchor prompt: broke vs solvent changes the whole framing.
  "prompt.storm.anchororflip": [
    { tag: null, ctx: { trueShipwreck: false }, note: "Shown in the ordinary case — the captain has something left to lose." },
    { tag: "shipwreck", ctx: { trueShipwreck: true }, note: "Shown when truly shipwrecked (no coins AND no crates) — running aground costs the turn itself." },
  ],
  // humanAct's action menu: an empty purse reframes the prompt.
  "prompt.act.menu": [
    { tag: null, ctx: { p: Object.assign({}, CTX_BASE.p, { coins: 4 }) }, note: "Shown when the captain can still afford to act." },
    { tag: "broke", ctx: { p: Object.assign({}, CTX_BASE.p, { coins: 0 }) }, note: "Shown when the purse is empty — the crew won't budge." },
  ],
  // humanTurn's per-turn banner: the storm clause is present or entirely absent.
  "adhoc.turn.banner": [
    { tag: null, ctx: { stormNow: true }, note: "A storm round — the banner names the leg happening now." },
    { tag: "noStorm", ctx: { stormNow: false }, note: "No storm this round — the storm-intro clause is entirely absent." },
  ],
  // humanFlip's announcement: heads or tails.
  "adhoc.flip.announce": [
    { tag: null, ctx: { h: true }, note: "The heads outcome." },
    { tag: "tails", ctx: { h: false }, note: "The tails outcome." },
  ],
  // humanTrade's bot refusal: a plain decline, or the taunt when the human is one crate from winning.
  "adhoc.trade.refusalbot": [
    { tag: null, ctx: { humanFinishes: false }, note: "The plain decline." },
    { tag: "finishTaunt", ctx: { humanFinishes: true }, note: "Fires instead of the plain decline when the human offerer is exactly one ingredient from finishing." },
  ],
};

/* ---- Sub-prompt (ask()'s 4th argument) branch axes. `sub` is helper text under
 * the buttons explaining why a greyed button is greyed (D-41). ---- */
export const SUB_BRANCH_AXES = {
  "prompt.act.menu": [
    { tag: "afford", ctx: { targets: [1], canAfford: true, canTrade: true }, note: "Shown when at least one target is adjacent AND the captain can afford powder." },
    { tag: "poor", ctx: { targets: [1], canAfford: false, canTrade: true }, note: "Shown when a target is adjacent but the captain can't afford powder." },
    { tag: "nocargo", ctx: { targets: [], canAfford: true, canTrade: false }, note: "Shown when nobody is holding cargo to trade for — the Trade button is greyed and this says why (D-41)." },
    { tag: "none", ctx: { targets: [], canAfford: true, canTrade: true }, note: "Deliberately silent — nothing is greyed, so no helper text renders at all." },
  ],
  "prompt.trade.give": [
    { tag: null, ctx: { canOfferCoins: false }, note: "Shown when the captain has no coin to offer — the “coins only” option is greyed and this says why." },
    { tag: "hascoin", ctx: { canOfferCoins: true }, note: "Deliberately silent — the captain has coin, so nothing is greyed." },
  ],
  "prompt.hail.offer": [
    { tag: null, ctx: { canCounter: false }, note: "Shown when the bot cannot afford to raise any further." },
    { tag: "cancounter", ctx: { canCounter: true }, note: "Deliberately silent — a counter-offer is still affordable." },
  ],
  // F9 (2026-07-29) — humanDock's dock-on-tails choice. Without this axis the card renders SILENT
  // under the default 4-coin context, so Wyatt's approved reason (the ONLY new copy in this pass)
  // would never reach the review page at all: present in source, reachable at runtime, invisible to
  // review. Same shape as the three siblings above.
  "prompt.dock.tailschoice": [
    { tag: null, ctx: { canBuy: false }, note: "Shown when the captain holds under 3 coins: the buy option renders greyed and this says why (F9/D-41). Before F9 the whole prompt did not appear at all in this state — the turn silently resolved to taking the coins." },
    { tag: "canbuy", ctx: { canBuy: true }, note: "Deliberately silent — the captain can afford the crate, so nothing is greyed and no helper text renders." },
  ],
};

/* ---- The ONE remaining curated renderer set, and why each survivor is here.
 * Cap: 2. Each must name why evaluating the real source is impossible. ---- */
export const CURATED_RENDERERS = {
  // draftWait sites are anchor-verified rather than call-arg-captured (see the extractor's own
  // header): the text is assembled across a broadcast helper's arguments at three different call
  // shapes, so there is no single expression to evaluate. Rendered from the extracted ANCHOR text,
  // which the extractor asserts is still present — so this cannot silently go stale.
  anchorDerived: true,
};
export const CURATED_RENDERER_CAP = 2;

/* ============================================================================
 * PER-ENTRY TEXT RENDERING
 * Every function below returns text + metadata only. No HTML shell.
 * ==========================================================================*/
export const PASS_THROUGH_ADHOC = new Set(["adhoc.round.header", "adhoc.round.finalheader", "adhoc.storm.botsquare", "adhoc.storm.botlegsummary", "adhoc.turn.boteventpassthrough"]);
export const PROMPT_PASS_THROUGH = new Set([
  "prompt.plumbing.localask",        // localAsk's own rendering plumbing — redundant with the ask() site
  "prompt.battle.scoreboard",        // renderBattle's live scoreboard — dynamic rounds/score, not fixed copy
  "prompt.net.draftrerender",        // re-renders an already-captured p.msg
  "prompt.net.promptrerender",       // re-renders an already-captured p.msg
  "prompt.net.promptrerenderbuttons",
  "prompt.sail.pickpanel",           // board highlighting, no copy of its own
  "prompt.sail.remotepickpanel",
]);
export const GUARDED_TEXT = {
  "adhoc:adhoc.act.nopowder": {
    guard: "the Attack option's own disabled:!canAfford flag — localAsk() gives a disabled button no click handler at all, so a normal player cannot trigger this guard",
    liveSibling: { id: "sub:prompt.act.menu~poor", label: "Helper text (sub) — humanAct() [too-poor-to-attack branch]" },
  },
};
export const ADHOC_TWO_PARTY_ROLE_LABELS = {
  "adhoc.battle.opening": ["the attacker", "the defender"],
  "adhoc.sidebet.backed": ["the bettor", "the called captain"],
  "adhoc.sidebet.freecall": ["the bettor", "the called captain"],
};

function variantsFrom(value, file, line, ctx) {
  const raw = value;
  if (raw == null) return [];
  const arr = Array.isArray(raw) ? raw : evalWithLocals(String(raw), file, line, ctx);
  if (!Array.isArray(arr)) return [];
  return arr.filter((v) => v && v.html != null).map((v) => ({ seat: v.seat, text: finalize(String(v.html)) }));
}

/** One ad-hoc site's text, rendered from its live extracted expression. */
export function renderAdhoc(entry, axis) {
  const ctx = axis && axis.ctx ? axis.ctx : {};
  const id = `adhoc:${entry.id}${axis && axis.tag ? "~" + axis.tag : ""}`;
  if (PASS_THROUGH_ADHOC.has(entry.id)) {
    return {
      id, label: entry.label, kind: "adhoc", passThrough: true, neutral: null, variants: [],
      notes: ["Table pass-through — renders whichever EVENT_NARRATION entry actually fired for that event (see its own card in the matching stage). Not counted as separate copy."],
    };
  }
  const neutralRaw = evalWithLocals(entry.rawNeutral, entry.file, entry.line, ctx);
  const neutral = neutralRaw == null ? null : finalize(String(neutralRaw));
  const variantsRaw = entry.rawVariants ? evalWithLocals(entry.rawVariants, entry.file, entry.line, ctx) : null;
  const variants = variantsFrom(variantsRaw, entry.file, entry.line, ctx);
  const notes = [];
  if (axis && axis.note) notes.push(axis.note);
  if (!variants.length && neutral) notes.push("No per-viewer variant exists for this line yet — it renders the same for every seat.");
  return {
    id, label: (axis && axis.label) || entry.label, kind: "adhoc",
    file: entry.file, line: entry.line, fn: entry.fn,
    neutral, variants, notes,
    rawNeutral: entry.rawNeutral, rawVariants: entry.rawVariants,
    defaultTag: entry.defaultTag, mergeInto: entry.mergeInto, siblingMerges: entry.siblingMerges,
    twoPartyRoles: ADHOC_TWO_PARTY_ROLE_LABELS[entry.id] || null,
    guarded: GUARDED_TEXT[`adhoc:${entry.id}`] || null,
    evalFailed: neutral == null,
  };
}

/** One prompt's own message text. */
export function renderPrompt(entry, axis) {
  const ctx = axis && axis.ctx ? axis.ctx : {};
  const id = `prompt:${entry.id}${axis && axis.tag ? "~" + axis.tag : ""}`;
  if (PROMPT_PASS_THROUGH.has(entry.id)) {
    return {
      id, label: `Prompt (${entry.kind}) — pass-through`, kind: "prompt", passThrough: true,
      neutral: null, variants: [],
      notes: ["Rendering plumbing, or a live scoreboard / re-render of a message already captured elsewhere — not new copy on its own."],
    };
  }
  const msg = evalWithLocals(entry.rawMsg, entry.file, entry.line, ctx);
  const neutral = msg == null ? null : finalize(String(msg));
  const notes = [];
  if (axis && axis.note) notes.push(axis.note);
  if (entry.labels.length === 0 && entry.dynamicBase) {
    notes.push(`Options are fully dynamic — generated live from ${entry.dynamicBase}. No fixed button copy to review here.`);
  }
  return {
    id, label: `Prompt (${entry.kind}) — ${entry.fn}()`, kind: "prompt",
    file: entry.file, line: entry.line, fn: entry.fn,
    neutral, variants: [], notes, rawNeutral: entry.rawMsg,
    defaultTag: "keep", evalFailed: neutral == null,
  };
}

/** One button label. */
export function renderButton(entry, labelEntry, index) {
  const slot = labelEntry.slot || String(index);
  const id = `button:${entry.id}~${slot}`;
  const isDead = !!(labelEntry.backMarker || labelEntry.flipMarker);
  // D-38: the counter-offer button's raw label is a bare `${n}🌕` — never parenthesised, so
  // applySignRule's regexes can never see it, and it always renders as a GAIN. Wyatt confirmed
  // "+{n}🌕". Targeted to this exact raw shape, never to "Never mind" (the same ask()'s other
  // option) and never to a price-only button elsewhere.
  const needsSignOverride = /^`\$\{n\}🌕`$/.test(String(labelEntry.raw).trim());
  const evaluated = evalString(labelEntry.raw);
  const withSign = evaluated != null && needsSignOverride ? `+${evaluated}` : evaluated;
  const notes = [];
  notes.push(labelEntry.condition
    ? `Shown only when: ${labelEntry.condition} — absent from the prompt otherwise.`
    : "Always present on this prompt (unconditional).");
  if (labelEntry.backMarker) {
    notes.push("NEVER RENDERED (D-34) — this option is flagged back:true, so localAsk() excludes it from the button row and renders a circular “‹” back control instead. This label text is never shown to a player.");
  }
  if (labelEntry.flipMarker) {
    notes.push("NEVER RENDERED (D-34) — this option is flagged flip:true, so localAsk() excludes it from the button row and renders the flippable coin control instead. This label text is never shown to a player.");
  }
  return {
    id, label: `Button — ${entry.fn}() [${slot}]`, kind: "button",
    file: entry.file, line: entry.line, fn: entry.fn,
    neutral: withSign == null ? null : finalize(withSign), variants: [], notes,
    rawNeutral: labelEntry.raw, dead: isDead, defaultTag: isDead ? "cut" : "keep",
    evalFailed: withSign == null,
  };
}

/** One sub (helper text under the buttons) branch. */
export function renderSub(entry, axis) {
  const id = `sub:${entry.id}~${axis.tag || "default"}`;
  const value = evalWithLocals(entry.rawSub, entry.file, entry.line, axis.ctx || {});
  const text = value == null ? null : String(value);
  return {
    id, label: `Helper text (sub) — ${entry.fn}()`, kind: "sub",
    file: entry.file, line: entry.line, fn: entry.fn,
    neutral: text == null ? null : finalize(text), variants: [],
    notes: [axis.note, "ask()'s own 4th argument — helper text under the buttons (D-33/D-41)."].filter(Boolean),
    rawNeutral: entry.rawSub, defaultTag: "keep",
    silent: text == null, evalFailed: false,
  };
}

const MISC_CTX = {
  introBarrier: {}, mpError: {}, battleLine: {}, paramPrompt: {}, lobby: {}, timer: {}, draftWait: {},
  // src/ui/board.js — the board chrome and the end-of-voyage summary. `st` is drawPanels()'s
  // per-event state snapshot and `i` the seat being drawn; both are locals the real prow-panel
  // expressions read, and resolveLocal() walks `hold`/`chips`/`extras`/`held` back to their own
  // declarations from there. A hold deliberately holding ONE recipe crate and TWO surplus ones is
  // what makes the surplus-cargo tooltip and the recipe chip render side by side, the way a player
  // sees them. `w` and `luck` are showStats()'s own locals.
  board: {
    i: 0,
    st: [
      { ing: ["wheat", "cocoa", "cocoa"] }, { ing: ["dairy"] }, { ing: [] }, { ing: ["sugar"] },
    ],
    w: 0,
    luck: appState.game.players.map((p) => (p.flips ? p.heads / p.flips : 0)),
  },
};
export const MISC_BRANCH_AXES = {
  "misc.timer.toggletooltip": [
    { tag: "off", ctx: { appState: { timerOff: true } }, note: "Shown while the timer is OFF — tapping the icon turns it back on." },
    { tag: "on", ctx: { appState: { timerOff: false } }, note: "Shown while the timer is ON — tapping the icon turns it off." },
  ],
  "misc.draftwait.recipechoosing": [
    { tag: "multi", ctx: { multi: true }, note: "Shown when more than one human is drafting a recipe at once." },
    { tag: "single", ctx: { multi: false }, note: "Shown when exactly one human is drafting (the rest of the crew are bots)." },
  ],
  // showStats()'s banner: somebody baked a winning recipe, or the voyage ran out of rounds first.
  "misc.board.eovbanner": [
    { tag: null, ctx: { w: 0 }, note: "Shown when a captain finished — the very last line of a completed voyage." },
    { tag: "nobody", ctx: { w: null }, note: "Shown when the round limit ran out with no finished recipe (game.winner is null)." },
  ],
  // ONE axis, not two: these two sites each have exactly one branch that carries wording, and the
  // context below is what makes that branch the one rendered. A second card for the other branch
  // would show crate icons with no copy in them — a card whose box holds nothing to review is the
  // D-33 mistake in a new place.
  // MOVED HERE 2026-07-31 (Wyatt): the Best Baker sentence used to be flashed into the blue box from
  // src/orchestrator.js; it now renders inside showStats()'s gold banner, directly under the recipe
  // picture. The ID IS DELIBERATELY UNCHANGED so his review mark follows the copy across the move —
  // that is the whole reason @copy ids exist. Only the winner branch carries words; with no winner
  // the site renders an empty string, so there is no second card to show (same rule as emptyhold).
  "adhoc.voyageend.victory": [
    { tag: null, ctx: { w: 0 }, note: "Shown under the winner's recipe picture in the gold End of Voyage banner. With no winner this site renders nothing at all." },
  ],
  "misc.board.emptyhold": [
    { tag: null, ctx: { held: [] }, note: "Rendered with an EMPTY hold, because the placeholder is the only wording this site has. With cargo aboard it renders the crate icons instead — no copy of its own; their tooltips are ingredient names, reviewable on the dock-flavour and ingredient cards." },
  ],
  "misc.board.surplustooltip": [
    { tag: null, ctx: { st: [{ ing: ["cocoa"] }, { ing: [] }, { ing: [] }, { ing: [] }] }, note: "Rendered with exactly ONE surplus crate so the tooltip reads on its own; the live site renders one of these per leftover crate, so the wording is repeated, never joined." },
  ],
};

/** One misc-category site's text. */
export function renderMisc(entry, axis) {
  const ctx = Object.assign({}, MISC_CTX[entry.category] || {}, (axis && axis.ctx) || {});
  const id = `misc:${entry.category}:${entry.id}${axis && axis.tag ? "~" + axis.tag : ""}`;
  const notes = [];
  if (axis && axis.note) notes.push(axis.note);
  // paramPrompt (D-33): the REAL text each caller of humanFlip()/fishCast() passes.
  if (entry.category === "paramPrompt" && !entry.hasLabel) {
    return {
      id, label: `${entry.callee}() call — ${entry.fn}() (no prompt reached)`, kind: "misc",
      file: entry.file, line: entry.line, fn: entry.fn, neutral: null, variants: [], silent: true,
      notes: [`Calls ${entry.callee}(p) with no label — this specific call site never reaches ${entry.callee}()'s own ask(), so no prompt text renders here.`],
      rawNeutral: entry.rawLabel || null, defaultTag: "keep", evalFailed: false,
    };
  }
  const raw = entry.rawMsg || entry.rawLabel || entry.rawButton || null;
  // draftWait is anchor-verified, not call-arg-captured — the extractor's own anchor check is what
  // keeps it honest, and the anchor IS the shipped text for these sites.
  const value = entry.category === "draftWait" && !raw
    ? entry.anchor
    : evalWithLocals(raw, entry.file, entry.line, ctx);
  const neutral = value == null ? null : finalize(String(value));
  const label = entry.category === "introBarrier" ? `Intro banner — ${entry.fn}()`
    : entry.category === "mpError" ? `Alert — ${entry.fn}()`
    : entry.category === "battleLine" ? `Live round result — ${entry.fn}()`
    : entry.category === "paramPrompt" ? `${entry.callee}() prompt — ${entry.fn}()`
    : entry.category === "draftWait" ? `Broadcast — ${entry.fn}()`
    : entry.category === "timer" ? `Timer toggle tooltip — ${entry.fn}()`
    : entry.category === "board" ? `Board / end-of-voyage — ${entry.fn}()`
    : `Lobby — ${entry.fn}()`;
  return {
    id, label, kind: "misc", category: entry.category,
    file: entry.file, line: entry.line, fn: entry.fn,
    neutral, variants: [], notes, rawNeutral: raw || entry.anchor,
    defaultTag: "keep", evalFailed: neutral == null,
  };
}

/** An introBarrier's dismiss button — its own reviewable card, per D-30's prompt/button pairing. */
export function renderMiscButton(entry) {
  const id = `misc:${entry.category}:${entry.id}~btn`;
  const value = evalWithLocals(entry.rawButton, entry.file, entry.line, {});
  const neutral = value == null ? null : finalize(String(value));
  return {
    id, label: "Button (dismiss)", kind: "misc", category: entry.category,
    file: entry.file, line: entry.line, fn: entry.fn,
    neutral, variants: [], notes: ["Always present on this banner (unconditional — the only way past it)."],
    rawNeutral: entry.rawButton, defaultTag: "keep", evalFailed: neutral == null,
  };
}

/** Every end-of-voyage award — name and byline together, as one unit of copy. */
export function awardCards(awards) {
  return (awards || []).map((b) => {
    const emblem = b.img ? `<img class="narrIcon" src="${ASSET_BASE}badges/${b.img}.png" alt="">` : "";
    const text = `${emblem} <b>${escapeHtml(b.name)}</b><br><i>${escapeHtml(b.byline)}</i>`;
    return {
      id: `misc:awards:${b.key}`, label: `Award — ${b.name}`, kind: "award",
      neutral: finalize(text), variants: [], notes: [`Stat category: ${b.key}`],
      defaultTag: "keep", evalFailed: false,
    };
  });
}

/** Every ingredient's dock-haul fragment — a live DOCK_FLAVOR import, never a snapshot. */
export function dockFlavorCards() {
  return ING_ALL.slice(0, 7).map((ing) => {
    const flavor = dockFlavor(ing);
    // The REAL containing line, for context only — through the actual dock builder's "coins" tails
    // branch, so the preview can never be wrong about what ships.
    const contextRendered = describeFor({ t: "dock", p: 0, ing, got: "coins", heads: 0 }, NEUTRAL_VIEWER);
    return {
      id: `misc:dockFlavor:${ing}`, label: `Dock flavour — ${ing}`, kind: "dockFlavor",
      neutral: finalize(flavor), variants: [],
      notes: [
        "This fragment is the only thing DOCK_FLAVOR actually stores — everything else on the card is context.",
        contextRendered && contextRendered.txt ? `Full line (EVENT_NARRATION.dock, the "coins" tails branch): ${finalize(contextRendered.txt)}` : "",
        `src/shared/index.js · DOCK_FLAVOR["${ing}"] — live import. Used ONLY in the two tails branches (bought/coins) — never on heads, never on an empty island.`,
      ].filter(Boolean),
      defaultTag: "keep", evalFailed: false,
    };
  });
}

/* ============================================================================
 * THE SAFE-RENDER BOUNDARY — per card, and reachable from a Node test.
 *
 * Moving the render layer into a module the page imports at load MOVED THE THROW
 * SITES WITH IT: evalSource, the lookups, D-51's invariant assertions. A throw
 * inside the core would still blank the page, bit for bit the HEAD failure this
 * whole task exists to end (threat T-QT-04). So the boundary is PER CARD and it
 * lives HERE rather than inside the page's DOM loop — a boundary that only exists
 * in the browser cannot be red-proofed, and this plan's standard is that every
 * guard is red-proofed.
 * ==========================================================================*/
export function renderCardSafely(entry, renderer, ...rest) {
  const id = (entry && entry.id) || "(unknown card)";
  try {
    const card = renderer(entry, ...rest);
    if (!card) return { id, error: "the renderer returned nothing at all" };
    return card.id ? card : Object.assign({ id }, card);
  } catch (err) {
    return {
      id,
      error: `${(err && err.message) || String(err)} — re-run the extractor (npm run audit:extract); if a // @copy marker was deleted, put it back`,
    };
  }
}

/* ============================================================================
 * WHOLE-INVENTORY RENDERING — the one entry point both consumers call.
 * ==========================================================================*/
/** Render exactly one inventory entry's PRIMARY card. Used by renderCardSafely's callers. */
export function renderEntry(entry) {
  if (!entry) throw new Error("renderEntry needs an inventory entry");
  if (entry.category) return renderMisc(entry);
  if (entry.rawMsg !== undefined && entry.labels !== undefined) return renderPrompt(entry);
  return renderAdhoc(entry);
}

/**
 * Every card's text, for the whole inventory, each one routed through the
 * safe-render boundary. One bad card becomes one named error card; the rest render.
 */
export function renderAllCards(inv) {
  const cards = [];
  const push = (c) => { cards.push(c); };

  // table
  const table = tableCards();
  for (const [id, c] of Object.entries(table)) {
    push({ id, label: c.label, kind: "table", key: c.key, neutral: c.neutral, silent: c.silent,
           variants: c.variants, notes: [], defaultTag: TABLE_TAGS[c.key] || "keep",
           mergeInto: TABLE_BRANCH_MERGE_TARGET[id] || TABLE_MERGE_TARGET[c.key] || null, evalFailed: false });
  }
  // ad-hoc
  for (const e of inv.adhoc || []) {
    const axes = LOCAL_BRANCH_AXES[e.id] || [null];
    for (const axis of axes) push(renderCardSafely(e, renderAdhoc, axis));
  }
  // prompts, their buttons and their subs
  for (const e of inv.prompts || []) {
    const axes = LOCAL_BRANCH_AXES[e.id] || [null];
    for (const axis of axes) push(renderCardSafely(e, renderPrompt, axis));
    if (!PROMPT_PASS_THROUGH.has(e.id)) {
      (e.labels || []).forEach((l, i) => push(renderCardSafely(e, renderButton, l, i)));
      if (e.rawSub) {
        const subAxes = SUB_BRANCH_AXES[e.id] || [{ tag: null, ctx: {}, note: "" }];
        for (const axis of subAxes) push(renderCardSafely(e, renderSub, axis));
      }
    }
  }
  // misc
  for (const e of inv.misc || []) {
    const axes = MISC_BRANCH_AXES[e.id] || [null];
    for (const axis of axes) push(renderCardSafely(e, renderMisc, axis));
    if (e.rawButton) push(renderCardSafely(e, renderMiscButton));
  }
  // awards and dock flavour
  awardCards(inv.awards).forEach(push);
  dockFlavorCards().forEach(push);
  return cards;
}
