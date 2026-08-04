// Pastry Pirates v2 — THE EVENT REGISTRY.
//
// One table. Every event the engine can emit is declared here exactly once, together with its
// fields, its narration tier, and the line that describes it. There is nowhere else to add an event
// and nowhere else to narrate one.
//
// WHY THIS FILE EXISTS. In the first v2 build the engine emitted 21 event types and the UI narrated
// 18. The three it missed included `turn`, so a player could not see whose turn it was and the log
// read as an ownerless stream. Other things — a Trawler surviving a bust, a Gambler taking a rung
// higher — happened silently because they were buried inside an event nobody had thought to unpack.
// Both bugs are the same bug: the event and its narration lived in different files, so one could
// exist without the other and nothing complained.
//
// Here they cannot. `emit()` throws on a type that is not registered, and every registered type
// must carry a `line`. `checkRegistry()` asserts it, and the self-test runs it.
//
// TIERS (PRD §6). The old build narrated everything at one weight, so a turn header could not be
// made louder than a pass and therefore nothing read at all.
//   beat   — the table must watch this: a round, a storm, the cast, a fight, somebody finishing
//   line   — a normal action: a dock, a deal, a sail with something to say
//   ticker — routine flow; shown small, no hold

export const TIER = { BEAT: "beat", LINE: "line", TICKER: "ticker" };

// ctx supplies presentation without the registry knowing about the DOM:
//   ctx.name(seat) -> captain's name, coloured   ctx.ing(key) -> crate name + icon
//   ctx.you        -> the seat being narrated to, or -1
const R = (tier, fields, line) => ({ tier, fields, line });

export const EVENTS = {

  /* ---- setup ---------------------------------------------------------- */
  setup: R(TIER.BEAT, ["seats"], (e, c) =>
    `The captains put to sea — ${e.seats.map(s => `${c.name(s.i)} in the <b>${s.power}</b>`).join(", ")}.`),

  recipe: R(TIER.TICKER, ["p"], (e, c) =>
    `${c.name(e.p)} pockets a recipe and tells nobody.`),

  /* ---- the round ------------------------------------------------------ */
  round: R(TIER.BEAT, ["n", "wind", "storm", "windNext", "stormNext"], (e, c) =>
    `<span class="hdr">Round ${e.n} — wind blows <b>${e.wind}</b>${e.storm ? ", and a GALE is on us" : ""}.` +
    ` Next round: ${e.windNext}${e.stormNext ? " ⛈" : ""}</span>`),

  storm: R(TIER.BEAT, ["dir", "moves"], (e, c) => {
    const aground = e.moves.filter(m => m.aground).map(m => c.name(m.i));
    const swept = e.moves.filter(m => m.swept).map(m => c.name(m.i));
    const safe = e.moves.filter(m => m.safe).map(m => c.name(m.i));
    let s = `⛈ The gale drives every ship <b>${e.dir}</b>!`;
    if (safe.length) s += ` ${safe.join(" and ")} ${safe.length > 1 ? "ride" : "rides"} it out at anchor.`;
    if (swept.length) s += ` ${swept.join(" and ")} ${swept.length > 1 ? "are" : "is"} caught by the current 🌀`;
    if (aground.length) s += ` <b>${aground.join(" and ")} ${aground.length > 1 ? "run" : "runs"} aground</b> — the turn's lost to repairs.`;
    return s;
  }),

  // THE ONE THAT WAS MISSING. Without it the log has no owner and nothing else makes sense.
  turn: R(TIER.BEAT, ["p"], (e, c) => `<span class="hdr">⚓ ${c.name(e.p)} takes the wheel…</span>`),

  aground: R(TIER.LINE, ["p"], (e, c) => `🛠 ${c.name(e.p)} spends the turn on repairs.`),

  /* ---- sailing -------------------------------------------------------- */
  sail: R(TIER.TICKER, ["p", "from", "to", "swept"], (e, c) =>
    e.swept ? `⛵ ${c.name(e.p)} sails into the rim — and the trade winds seize her! 🌀`
            : `⛵ ${c.name(e.p)} sails.`),

  hold: R(TIER.TICKER, ["p"], (e, c) => `${c.name(e.p)} holds course.`),

  /* ---- the dock ------------------------------------------------------- */
  treasure: R(TIER.LINE, ["p", "ing", "heads", "got"], (e, c) =>
    e.heads ? `⚪ ${c.name(e.p)} turns up treasure at the dock — <b>+${e.got}🌕</b>`
            : `⚫ ${c.name(e.p)} digs at the dock and finds nothing but sand.`),

  buy: R(TIER.LINE, ["p", "ing", "cost", "needed"], (e, c) =>
    `📦 ${c.name(e.p)} buys ${c.ing(e.ing)} for ${e.cost}🌕` +
    (e.needed ? "" : " — <i>and doesn't need it…</i>")),

  stripped: R(TIER.LINE, ["p", "ing"], (e, c) =>
    `${c.name(e.p)} finds the ${c.ing(e.ing)} storehouse bare — nothing left but the sand.`),

  broke: R(TIER.LINE, ["p", "ing", "cost"], (e, c) =>
    `${c.name(e.p)} hasn't the coin for ${c.ing(e.ing)} (${e.cost}🌕).`),

  /* ---- the market ----------------------------------------------------- */
  offer: R(TIER.LINE, ["p", "want", "giveIng", "giveCoins", "sale"], (e, c) =>
    e.sale ? `📣 ${c.name(e.p)} cries a sale — <b>${c.ing(e.want)}</b>. Who'll pay?`
           : `📣 ${c.name(e.p)} calls out: <b>I want ${c.ing(e.want)}</b>, and I'll give ` +
             (e.giveIng ? c.ing(e.giveIng) : `${e.giveCoins}🌕`)),

  // A refusal already given in public does not need giving twice. Narrated so the price the caller
  // has to beat is visible, rather than the captain simply going quiet for no stated reason.
  standing: R(TIER.TICKER, ["p", "want", "price", "giveIng", "held"], (e, c) =>
    `${(e.held || []).map(i => c.name(i)).join(" and ")} already said no to ` +
    (e.giveIng ? `${c.ing(e.giveIng)} for ${c.ing(e.want)}` : `${e.price}🌕 for ${c.ing(e.want)}`) +
    ` — ${c.name(e.p)} will have to do better.`),

  answer: R(TIER.TICKER, ["p", "ask", "no", "offered", "swap", "sale"], (e, c) => {
    if (e.no) return `${c.name(e.p)} shakes their head.`;
    if (e.swap || !e.ask) return `${c.name(e.p)} will take the swap.`;
    if (e.sale) return `${c.name(e.p)} bids ${e.ask}🌕.`;
    if (e.ask > e.offered) return `${c.name(e.p)} holds out — <b>${e.ask}🌕</b> or nothing.`;
    if (e.ask < e.offered) return `${c.name(e.p)} undercuts — ${e.ask}🌕.`;
    return `${c.name(e.p)} will take the ${e.ask}🌕.`;
  }),

  trade: R(TIER.LINE, ["a", "b", "gave", "got", "kind"], (e, c) =>
    `🤝 ${c.name(e.a)} and ${c.name(e.b)} strike a deal — ${e.gave} for ${e.got}.`),

  nodeal: R(TIER.LINE, ["p", "want", "refusers"], (e, c) =>
    `🙅 Nobody will part with ${c.ing(e.want)} at that price. ${c.name(e.p)} marks it down` +
    ((e.refusers || []).length ? ` against ${e.refusers.map(i => c.name(i)).join(" and ")}.` : ".")),

  walked: R(TIER.TICKER, ["p"], (e, c) => `${c.name(e.p)} doesn't like the price and walks away.`),

  /* ---- battle --------------------------------------------------------- */
  battle: R(TIER.BEAT, ["a", "d", "ca", "cd", "downwind", "how", "win", "spoil"], (e, c) => {
    const how = e.how === "coins" ? "on powder alone"
      : e.how === "flip" ? "on the flip of the bullion" : "on the lighter hold";
    const sp = e.spoil.ing ? c.ing(e.spoil.ing) : `${e.spoil.coins}🌕`;
    return `⚔️ ${c.name(e.a)} attacks ${c.name(e.d)}! ` +
      `(${e.ca}🌕 against ${e.cd}🌕${e.downwind ? ", and the downwind ship gains +1" : ""}) — ` +
      `<b>${c.name(e.win)} wins ${how}</b> and takes ${sp}.`;
  }),

  shooter: R(TIER.LINE, ["p", "got"], (e, c) =>
    `🎯 ${c.name(e.p)}'s powder was well spent — <b>${e.got}🌕 comes back</b>.`),

  lookout: R(TIER.LINE, ["calls"], (e, c) => {
    const right = e.calls.filter(x => x.right).map(x => c.name(x.seat));
    return `🔭 The Lookout settles — ${right.length ? right.join(" and ") + " called it (+2🌕)" : "nobody called it right"}.`;
  }),

  /* ---- the cast ------------------------------------------------------- */
  // Carries every captain's outcome AND the reason for it, so a Trawler surviving a bust or a
  // Gambler taking a rung higher is visible instead of buried in a number.
  cast: R(TIER.BEAT, ["caller", "top", "results"], (e, c) => {
    const parts = e.results.map(r => {
      const who = c.name(r.seat);
      if (r.why === "gambler") return `${who} <b>+${r.took}🌕</b> (a rung higher — Gambler)`;
      if (r.why === "trawler") return `${who} <b>+${r.took}🌕</b> (decided after the coin landed — Trawler)`;
      if (r.why === "bust") return `${who} <b>loses the lot</b>`;
      return `${who} +${r.took}🌕`;
    });
    return `🎣 ${c.name(e.caller)} calls the cast! The pot climbed to <b>${e.top}🌕</b>. ${parts.join(" · ")}`;
  }),

  poach: R(TIER.LINE, ["p", "got"], (e, c) =>
    `🎣 ${c.name(e.p)} slips a line over the side alone — +${e.got}🌕`),

  /* ---- the end -------------------------------------------------------- */
  bake: R(TIER.BEAT, ["p"], (e, c) =>
    `<span class="hdr">🧁 ${c.name(e.p)} reaches Tortuga with a full recipe and fires the ovens!</span>`),

  finallap: R(TIER.BEAT, ["p"], (e, c) =>
    `<span class="hdr">🏁 Final lap — every other captain gets ONE last turn!</span>`),

  gameover: R(TIER.BEAT, ["standings"], (e, c) =>
    `<span class="hdr">👑 ${e.standings.length ? c.name(e.standings[0].i) + " is the Best Baker in the Caribbean!"
      : "Nobody made it home."}</span>`),
};

/* ---------------------------------------------------------------- emit + narrate */

let seq = 0;

// The ONLY way an event enters the game. Throws on an unregistered type, so a new event cannot be
// added without also adding its line — which is the whole point of the file.
export function emit(events, type, fields, round) {
  const spec = EVENTS[type];
  if (!spec) throw new Error(`emit("${type}"): not in the event registry. Add it to v2/events.js — the line is required.`);
  const e = Object.assign({ t: type, v: 1, id: ++seq, round }, fields);
  for (const f of spec.fields) if (!(f in e)) e[f] = null;   // declared but absent reads as null, never undefined
  events.push(e);
  return e;
}

// In play, a line that throws must never take the game down — it degrades to a bare tag. But that
// tag is indistinguishable from a working line to any check that only asks "did something come
// back", which is how `nodeal` shipped rendering as the literal text "[nodeal]": the event declared
// a `refusers` field, the engine never passed it, emit() filled it with null, and `.length` threw
// on every single one. So the self-test passes strict and gets the throw.
export function narrate(e, ctx, strict) {
  const spec = EVENTS[e.t];
  if (!spec) return null;
  try { return spec.line(e, ctx); }
  catch (err) {
    if (strict) throw new Error(`event "${e.t}" threw while narrating: ${err.message}\n  ${JSON.stringify(e)}`);
    return `[${e.t}]`;
  }
}

export const tierOf = e => (EVENTS[e.t] || {}).tier || TIER.TICKER;

// Which captain is this event ABOUT? The board can then speak the line from that ship instead of
// only listing it in the log. Derived from the field names the registry already uses rather than
// declared per event, so a new event gets a bubble without anyone remembering to ask for one:
// `p` is the acting captain everywhere, `a` is the attacker, `caller` calls the cast.
// A null owner means the whole table — a round, a storm, the end — and belongs on the board itself.
export function ownerOf(e) {
  for (const f of ["p", "a", "caller"]) if (typeof e[f] === "number") return e[f];
  return null;
}

// Asserted by the self-test. Cheap, and it is the check that would have caught both playtest bugs.
export function checkRegistry() {
  const bad = [];
  for (const [k, s] of Object.entries(EVENTS)) {
    if (typeof s.line !== "function") bad.push(`${k}: no line`);
    if (!Object.values(TIER).includes(s.tier)) bad.push(`${k}: bad tier`);
    if (!Array.isArray(s.fields)) bad.push(`${k}: no fields`);
  }
  if (bad.length) throw new Error("event registry invalid:\n  " + bad.join("\n  "));
  return Object.keys(EVENTS).length;
}
