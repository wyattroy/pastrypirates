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

  /* ── BUTTONS ANY QUESTION CAN CARRY ──────────────────────────────────────────────────────────────── */
  "button.back": "← Back",
  "button.nah": "Nah",
  "button.accept": "{icon} Accept",
  "button.deny": "{icon} Deny",
  "flip.button": "🌕 FLIP!",
  "parrot.ok": "🦜 Aye aye",

  /* ── WAITING — what every other screen reads while one captain decides ─────────────────────────── */
  "wait.deciding": "{name} is deciding…",
  "wait.sailing": "{name} is choosing where to sail…",
  "wait.ovens": "{name} steps up to the ovens…",
  "wait.mateys": "⚓ Waiting for yer mateys…",
  "battle.waiting": "⏳ Waiting for {who}…",

  /* ── SAILING ───────────────────────────────────────────────────────────────────────────────────────── */
  "sail.tap": "tap to sail",
  "sail.ask": "{name}: {what}",
  "sail.stay": "Stay put",
  "rim.head": "🌀 {name} rides at the head o' the current — she's got nowhere to carry ye from here.",

  /* ── THE OPENING CARDS ─────────────────────────────────────────────────────────────────────────────── */
  "intro.ahoy": "⚓ Ahoy! Choose a recipe, gather each ingredient, then sail home first to win!",
  "intro.ahoyGo": "⚓ Arrgh!",
  "intro.knowHow": "Do ye know how to play?",
  "intro.yes": "⚓️ Yarrgh!",
  "intro.no": "🦜 Nah",
  /* his rewrite, 2026-09-13 — "{Crustbeard} goes first! The rest o' ye get {coin}." */
  "intro.order": "{icon} {lead} {lead:goes|go} first! {lead:The rest o' ye get|The rest o' the crew get} 🌕.",
  "intro.orderGo": "🦜 Start",

  /* ── WHAT A CAPTAIN MAY DO ─────────────────────────────────────────────────────────────────────────── */
  "act.ask": "{name}, what'll ye do:",
  "act.dock": "Dock at {icon} {place}",
  "act.dockShort": "{icon} Dock",
  "act.attack": "⚔️ Attack −{n}🌕",
  "act.attackFree": "⚔️ Attack",
  "act.noPowder": "Ye can't afford the powder — {n}🌕 a broadside, and yer purse won't stretch.",
  "act.emptyHolds": "Their holds are empty — there's nothin' aboard worth takin'.",
  "act.trade": "🤝 Trade",
  "act.nothingToTrade": "Ye've nothin' to trade — an empty hold and an empty purse.",
  "act.noCargoOnWater": "Not a captain on the water is carryin' cargo to trade for.",
  "act.ovens": "{icon} Fire up the ovens!",
  "act.ovensShort": "{icon} Fire ovens!",
  "act.moveInstead": "← Actually, move instead",
  "act.muse": "Muse",
  "act.museCoin": "+{n}🌕",
  "act.cantAttack": "{p} {p:can't attack.|can't attack: no powder, or nothin' in their holds.}",
  "act.cantTrade": "{p} {p:can't trade.|can't trade: nothin' to offer, or no cargo on the water.}",
  "act.whom": "Attack whom?",

  /* ── DOCKING: THE FLIP AND THE BUY ────────────────────────────────────────────────────────────────────
     "Scrubbin' the docks" is the tails action's one name now — his pass, 2026-09-13, replacing W2-3's "workin'". */
  "dock.flipAsk": "Docking at {icon} {place}",
  "dock.flipHelp": "⚪ HEADS strikes buried treasure (+{heads}🌕) · ⚫ TAILS is a turn scrubbin' the docks (+{tails}🌕). Either way, ye may then buy an ingredient.",
  "dock.buyAsk.treasure": "⚪ TREASURE (+{n}🌕)! Buy {goods}?",
  "dock.buyAsk.work": "⚫ TAILS (+{n}🌕) — a turn scrubbin' the docks. Buy {goods}?",
  "dock.buy": "Buy {ing} −{price}🌕",
  "dock.shortWhy": "It costs {price}🌕 and ye've {coins}🌕 — {short}🌕 short.",
  "market.barter": "Trade any 2 ingredients fer {ing}",
  "market.barterShort": "2 → {icon}",
  "market.barterWhy": "The barter takes 2 ingredients off yer hands, and ye're carryin' {n}.",
  "market.first": "The black market'll take any 2 ingredients fer {goods} — what's the first?",
  "market.second": "Givin' {first} an' one more fer {goods} — what's the second?",

  /* ── TRADING ───────────────────────────────────────────────────────────────────────────────────────── */
  "trade.nothingAtAll": "{p} {p:has|have} nothin' to trade.",
  "trade.noCargo": "No one has cargo to trade for.",
  "trade.nobodyHas": "No captain on the water is carryin' {ing}.",
  "trade.want": "What do ye WANT from the table?",
  "trade.give": "What will ye GIVE for {want}?",
  "trade.coins": "Coins",
  "trade.emptyPurse": "Yer purse is empty — ye've no coin to offer, so it must be an ingredient.",
  "trade.nothingToOffer": "Ye don't have any to offer!",
  "trade.coinOnTop": "Would ye offer any coin on top?",
  "trade.howMany": "How many coins?",
  "trade.offerGo": "Offer it!",
  "trade.offered": "{q}: {p} offers {offer} for yer {want}.",
  "trade.counter": "💰 Ask for summat else",
  "trade.counterShort": "💰 Counter",
  "trade.nothingElse": "{name} has nothin' else aboard and no coin — ye can take it or leave it.",
  "trade.noSweetener": "{name} has no coin left to sweeten the deal — ye can take it or leave it.",
  "trade.silence": "Not a soul answers {p's} hail.",
  "trade.takes": "{icon} {q} takes yer {what}",
  "trade.accepts": "{icon} {q} accepts",
  "trade.wants": "💰 {q} wants {what}",
  "trade.wantsInstead": "💰 {q} wants {what} <i>instead</i>",
  "trade.offer": "offer",
  "trade.nothin": "nothin'",
  "trade.that": "that",
  "trade.notCarrying": "Ye're not carryin' {ing} any more.",
  "trade.tooDear": "That'd cost ye {n}🌕, and ye've only {coins}🌕 aboard.",
  "trade.walkAway": "🚫 Walk away",
  "trade.refuses": "{q} refuses outright",
  "trade.declines": "{q} declines",
  "trade.allDeclined": "No captain will part with {want} for {p:that|that offer of yers}.",
  "trade.answers": "Fer yer {want} the table answers:<br>{lines}<br>Take a deal, or walk away?",
  "trade.walksAway": "{p} {p:walks|walk} away from the table.",
  "trade.declined": "{q} {q:declines|decline} {p's} offer!",
  "counter.coin": "💰 Coin instead",
  "counter.coinShort": "💰 Coin",
  "counter.noCoin": "{name} has no coin at all — it must be an ingredient.",
  "counter.ask": "{q}: what o' {whose} will ye have instead?",
  "counter.noCargo": "{name} has no other cargo — ye can ask for coin, or deny.",
  "counter.asking": "{q}: ye're ASKIN' {what} for yer {want}",
  "counter.go": "Ask it!",

  /* ── CALLING A BATTLE ────────────────────────────────────────────────────────────────────────────────
     his rewrite, 2026-09-13 — "A battle's brewing! Guess the winner and win 1". The caller's name still leads: on one
     device the ask arrives out of nowhere, and the name is what says it is for them (his 2026-08-08 ruling). */
  "call.ask": "⚔️ {name} — a battle's brewing! Guess the winner and win {n}🌕.",
  "call.button": "Call {name}",
  "call.made": "🔭 {p} {p:calls|call} {called} from the crow's nest.",
  "call.paid": "{name} +{n}🌕",
  "call.unpaid": "{name} no bounty",
  "call.settle": "🔭 {parts}",

  /* ── WHILE YE LOOKED AWAY — the recap after a skip ─────────────────────────────────────────────── */
  "recap.line": "⏩ While ye looked away: {list}.",
  "recap.home": "made it home with a full recipe",
  "recap.bested": "bested {q} in battle",
  "recap.lost": "lost a battle to {q}",
  "recap.black": "paid the black market for {icon}",
  "recap.bought": "bought {icon} at {place}",
  "recap.traded": "struck a trade with {q}",
  "recap.docks": "scrubbed the docks at {place}",
  "recap.sailed": "sailed on",

  /* ── WHEN SOMETHING GOES WRONG ──────────────────────────────────────────────────────────────────── */
  "restore.unreadable": "We couldn't reach the crew's log for this voyage, so we can't tell how much of it is missing. Carrying on may put ye out of step with the rest of the crew.",
  "restore.short": "We rebuilt this voyage but came up {n} events short. Carrying on may put ye out of step with the rest of the crew.",
  "restore.shortOne": "We rebuilt this voyage but came up 1 event short. Carrying on may put ye out of step with the rest of the crew.",
  "error.aground": "The voyage has run aground. {err}",
};
