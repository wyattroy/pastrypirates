/* ══════════════════════════════════════════════════════════════════════════════════════════════════
   src/shared/words.js — EVERY WORD THE GAME SAYS, IN ONE PLACE.

   Wyatt, 2026-09-13, on his narration pass: "All the narration should be re-architected to live in one
   place -- fix this." · "we use one engine, that accepts as arguments the action taken, the player type
   (human/bot), the location of the player (this browser/remote), and serves an event." · and, the night
   before: "i don't want to actually write out every single for of "ye" vs "Player"".

   HOW TO READ AN ENTRY, AND HOW TO CHANGE ONE
     "⚔️ {a} {a:attacks|attack} {d}!"
       {a}              a captain. Every other screen reads the captain's name; the captain's OWN screen
                        reads "ye". When that captain opens the sentence it reads "Crustbeard — ye", so a
                        pass-and-play screen still says who "ye" is.
       {a's}            the captain's: "Crustbeard's" elsewhere, "yer" on their own screen.
       {a:this|that}    two ways to say one thing: the first for every other screen, the second for {a}'s
                        own. Either side may be empty.
       {n} {place} …    a fact the game fills in — a number, an island, an ingredient, a direction.
       🌕 ⚪ ⚫ 🦜 🧁 …   stand for the game's own art, swapped in on screen. An amount of coin is never
                        split from its number across a line break.
       ""               the game says nothing at this moment.
     Written ONCE, as another captain would read it. The "ye" forms are derived by fill(), never typed.

   THE RULE THIS FILE EXISTS TO HOLD: A BOT AND A HUMAN ARE DESCRIBED IN THE SAME WORDS. A captain's type
   decides how a move is CHOSEN, never which sentence describes it; which screen is reading decides "ye".
   Nothing that calls this file may pick a line by who is playing.

   ZERO IMPORTS, ON PURPOSE. The game reads this file, and so can a plain `node` script or a review page —
   so the page Wyatt rewrites in is always the game's own words, never a copy that can drift (the Narration
   Pass of 2026-09-13 was built on a copy, and a third of its rows were lines the game no longer had).
   scripts/qa/words_one_place_check.mjs renders every entry and fails if a sentence is written into the
   game's code instead of here.
   ══════════════════════════════════════════════════════════════════════════════════════════════════ */

/* A captain, as a fact: `{a: seat(2)}`. Anything else in `facts` is filled in as written. */
export const seat = (i) => ({ seat: i });
const isSeat = (v) => v != null && typeof v === "object" && Object.prototype.hasOwnProperty.call(v, "seat");

/* Is the text so far the start of a sentence? "first" when nothing but art and markup came before;
   "next" after a full stop, "!" or "?"; otherwise mid-sentence. */
const ART = /[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu;
function sentenceAt(before) {
  const t = before.replace(/<[^>]*>/g, " ").replace(ART, "").trim();
  if (t === "") return "first";
  return /[.!?]$/.test(t) ? "next" : "";
}

/* fill(template, facts, look) — the whole grammar. `look` is how the calling screen sees captains:
   { me(seat) -> is this captain the one reading?, name(seat) -> the coloured name, poss(seat) -> "Name's" }.
   An unknown fact is left visible as {key}, so a missing value can never quietly vanish. */
export function fill(template, facts, look) {
  if (!template) return "";
  facts = facts || {};
  const re = /\{([A-Za-z0-9_]+)(?:('s)|:([^{}|]*)\|([^{}]*))?\}/g;
  let out = "", last = 0, m;
  while ((m = re.exec(template))) {
    out += template.slice(last, m.index);
    last = re.lastIndex;
    const [whole, key, possessive, other, own] = m;
    const v = facts[key];
    if (other !== undefined) { out += isSeat(v) && look.me(v.seat) ? own : other; continue; }
    if (isSeat(v)) {
      const mine = look.me(v.seat), at = sentenceAt(out);
      if (possessive) out += mine ? (at ? "Yer" : "yer") : look.poss(v.seat);
      else if (!mine) out += look.name(v.seat);
      else out += at === "first" ? `${look.name(v.seat)} — ye` : at ? "Ye" : "ye";
      continue;
    }
    if (v === undefined || v === null) { out += whole; continue; }
    out += String(v) + (possessive || "");
  }
  out += template.slice(last);
  // an amount and its coin are one readable thing — "(+3🌕)", "−2🌕", "5🌕" never break apart. A fact that
  // was itself filled from this file arrives already held together, and is left exactly as it came.
  return out.split(/(<span class="nobrk">[\s\S]*?<\/span>)/)
    .map((part, i) => (i % 2 ? part : part.replace(/\(?[+−]?\d+🌕\)?/g, (s) => `<span class="nobrk">${s}</span>`)))
    .join("");
}

export const WORDS = {
  /* ── THE DAY'S WEATHER — the first line of every day ─────────────────────────────────────────────
     His pass, 2026-09-13: "Wind still" for any repeated direction; a storm is blowin', now blowin' (it
     goes on, the wind turned) or still blowin' (it goes on, same way). "It'll blow every ship 3 squares"
     is gone — the storm's own summary names the squares when it pushes. "Tomorrow" stays (his pick). */
  "day.wind": "Day {day}: Wind {dir}.",
  "day.windStill": "Day {day}: Wind still {dir}.",
  "day.storm": "Day {day}: Storm's blowin' {dir}.",
  "day.stormNow": "Day {day}: Storm's now blowin' {dir}.",
  "day.stormStill": "Day {day}: Storm's still blowin' {dir}.",
  "day.tomorrow": "Tomorrow: {dir}.",
  "day.tomorrowStorm": "Tomorrow: a storm.",

  /* ── A CAPTAIN'S TURN BEGINS ─────────────────────────────────────────────────────────────────────
     ONE line for every captain, bot or human, on every screen — and silent, by his word: "can we cut it
     and see how it feels?" · "make sure your change is architectural -- not changing the bot line AND
     the human line". Put words here and every captain's turn says them. */
  "turn.start": "",

  /* ── THE COIN ────────────────────────────────────────────────────────────────────────────────────── */
  "flip.ask": "Flip the doubloon!",

  /* ── DOCKING ─────────────────────────────────────────────────────────────────────────────────────── */
  "dock.treasure": "{p} {p:finds|find} treasure (+{n}🌕) at {place}!",
  "dock.treasure.buy": "{p} {p:finds|find} treasure (+{n}🌕) at {place} and {p:buys|buy} {goods} (−{paid}🌕).",
  "dock.treasure.black": "{p} {p:finds|find} treasure (+{n}🌕) at {place} and {p:pays|pay} the black market for {goods} (−{paid}🌕).",
  "dock.treasure.barter": "{p} {p:finds|find} treasure (+{n}🌕) at {place} and {p:trades|trade} {gave} to the black market for {goods}.",
  "dock.work": "{p} {p:earns|earn} {n}🌕 scrubbin' the docks at {place}.",
  "dock.work.buy": "{p} {p:earns|earn} {n}🌕 scrubbin' the docks and {p:buys|buy} {goods} (−{paid}🌕).",
  "dock.work.black": "{p} {p:earns|earn} {n}🌕 scrubbin' the docks and {p:pays|pay} the black market for {goods} (−{paid}🌕).",
  "dock.work.barter": "{p} {p:earns|earn} {n}🌕 scrubbin' the docks and {p:trades|trade} {gave} to the black market for {goods}.",
  "dock.lastOne": "{p:That were the last of it|Ye took the last of it} — the shelves be bare!",
  "dock.gaveTwo": "{a} an' {b}",
  "dock.gaveTwoSame": "two {a}",

  /* ── TRADES AND CALLS ──────────────────────────────────────────────────────────────────────────── */
  "trade.struck": "🤝 {a} {a:trades|trade} {gave} to {b} for {got}",
  "call.right": "🔭 {p} called it! (+{n}🌕)",
  "call.wrong": "🔭 {p} called it wrong.",

  /* ── A BATTLE'S OUTCOME ────────────────────────────────────────────────────────────────────────── */
  "battle.takes": "⚔️ {winner} {winner:wins|win} and {winner:takes|take} {loser:|yer }{spoil}.",
  "battle.nothing": "⚔️ {winner} {winner:wins|win}, but there's nothing in {loser's} hold to plunder.",
  "battle.downwind": "⚔️ Both cannons land — but {winner} {winner:fires|fire} downwind, and the wind carries the shot home. {winner} {winner:takes|take} {loser:|yer }{spoil}.",
  "battle.slipsAway": "🏃 {d} {d:slips|slip} away!",

  /* ── THE STORM'S SUMMARY, after it pushes ─────────────────────────────────────────────────────────
     A group of captains is named as a list, so each piece is written for one captain and for several. */
  "storm.drives": "drives {who} {n} squares {dir}",
  "storm.blowsOff": "blows {who} clean off the dock",
  "storm.sweeps": "sweeps {who} into the trade winds",
  "storm.holds.one": "{who} drops anchor an' holds fast",
  "storm.holds.many": "{who} drop anchor an' hold fast",
  "storm.pinned.one": "{who} is pinned by the hull ahead",
  "storm.pinned.many": "{who} are pinned by the hull ahead",
  "storm.summary": "🌀 The storm {storm}!",
  "storm.summary.both": "🌀 The storm {storm} — {captains}!",
  "storm.summary.captains": "🌀 The storm blows through — {captains}!",
  "list.and": "an'",
  "list.ye": "ye",

  /* ── MUSING — the sighting itself is the sea creature's own sentence ──────────────────────────── */
  "muse.idea": "Recipe idea! (+{n}🌕)",
  "muse.unknown": "{p} {p:leans|lean} over the rail, and there's {what} down there.",
  "muse.somethin": "somethin' strange",

  /* ── HOME WITH A FULL RECIPE ───────────────────────────────────────────────────────────────────────
     His rewrite of the old final-round card, on the moment a captain actually arrives in today's game —
     the ovens lighting. */
  "ovens.lit": "🧁 {p} fired up the bakery!",
};
