// Pastry Pirates v2 — the engine.
//
// The ONLY rules implementation in the game (PRD N2). Pure: no DOM, no wall clock, no Math.random.
// It never asks a UI anything — it runs as a generator, yielding a DecisionRequest whenever it needs
// a choice, and receiving a DecisionResponse back. Bots, humans, replays and guests are all just
// resolvers, which is what makes one rules implementation possible.
//
// The BOARD is reused wholesale from src/engine/index.js: island placement, the tetromino shapes,
// single-berth dock positions, the circular valid-cell set and the four clockwise rim arcs. v2
// changes the rules on top of it, not the sea.

import { Game as BoardGame, roundCfg } from "../src/engine/index.js";
import { emit } from "./events.js";

export const DIRS = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] };
export const OPP = { N: "S", S: "N", E: "W", W: "E" };
export const DK = ["N", "S", "E", "W"];
export const K = c => c[0] + "," + c[1];
export const man = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);

export const PRICE = [3, 4, 5];        // an island's 1st / 2nd / 3rd crate
export const TREASURE = 4;             // = the mean crate price, so a heads pays for one average crate
export const START_COINS = 5;
export const STORM_CHANCE = 0.2;       // 1 round in 5
export const RECIPE_SIZE = 5;

export const POWERS = {
  pilot:      { name: "Pilot",      blurb: "The wind never slows ye — always 4 squares, upwind or no." },
  racer:      { name: "Racer",      blurb: "Sail 6 when no step of yer move is upwind." },
  wholesaler: { name: "Wholesaler", blurb: "Ye always pay an island's openin' price of 3." },
  poacher:    { name: "Poacher",    blurb: "When the cast is spent, ye may still take 2 alone." },
  gambler:    { name: "Gambler",    blurb: "When ye take the pot, take one rung higher than it shows." },
  trawler:    { name: "Trawler",    blurb: "Ye decide after the coin lands — ye never bust." },
  trader:     { name: "Trader",     blurb: "Once a round, a struck deal pays ye +1." },
  shooter:    { name: "Shooter",    blurb: "Win a fight and yer committed coin comes back." },
};
export const POWER_KEYS = Object.keys(POWERS);

/* ---------------------------------------------------------------- events */
// One event per game-visible thing that happened. A storm is ONE event carrying every ship's
// result, not four — that is what lets the UI treat it as the single simultaneous beat it is.


/* ---------------------------------------------------------------- the game */

export class GameV2 {
  constructor(seed, seats) {
    // seats: [{ name, kind: "human" | "bot" }]
    this.board = new BoardGame(roundCfg(seats.map(() => "balanced")), seed, false);
    this.seed = seed;
    this.events = [];
    this.round = 0;
    this.over = false;
    this.finishOrder = [];
    this.sold = {};
    this.board.ings.forEach(i => this.sold[i] = 0);
    this.players = seats.map((s, i) => ({
      idx: i, name: s.name, kind: s.kind,
      pos: null, coins: START_COINS, ing: [], recipe: null, recipeChoices: null,
      power: null, done: false, lostTurn: false, refused: new Set(), traderPaidRound: -1,
    }));
    // THE PUBLIC REFUSAL LEDGER: "seat:ing" -> the highest price that captain has turned down for
    // that crate, in front of everybody. It lives on the game and not on a player because the
    // outcry IS public — the whole table watched you refuse 5 for milk, so the whole table knows.
    //
    // It was per-player before, as `refusedFor`, and it was dead: initialised, read by the bot, and
    // never once written to by anything. So no captain remembered any refusal, and two bots would
    // offer the same terms for the same crate one after the other.
    //
    // A floor does not silence anyone. It says what the next offer has to beat, which is what a
    // public refusal actually means, and it expires by itself: once you no longer need milk you
    // will take 6, and the market finds that out.
    this.floors = new Map();
    // A swap has no price, so a floor cannot bind it — and left unbound it became the whole of the
    // spam once coin offers were fixed: 798 of 1131 prompts to a stubborn captain were somebody
    // re-proposing a swap they had already turned down. So the exact pair is recorded instead.
    // "Cocoa for your milk, no" says nothing about eggs for your milk, and that offer still gets
    // made — it is the same terms that are settled, not the subject.
    this.swapsRefused = new Set();   // "seat:want:given"
    const dirs = Object.values(DIRS);
    this.players.forEach((p, i) => { const d = dirs[i % 4]; p.pos = [this.board.home[0] + d[0], this.board.home[1] + d[1]]; });
    this.windNow = null; this.windNext = null; this.stormNext = false; this.stormNow = false;
  }

  /* ---- board helpers (delegate to the reused board) ---- */
  get ings() { return this.board.ings; }
  get home() { return this.board.home; }
  get dockOf() { return this.board.dockOf; }
  r() { return this.board.r(); }
  flip() { return this.r() < 0.5; }
  land(c) { return this.board.blocked(c) || this.board.isIsland(c) || this.board.isHome(c); }
  onRim(c) { return this.board.onRim(c); }
  rimHeadOf(c) { return this.board.rimHead[K(c)]; }
  shipAt(c, self) { return this.players.some(q => q !== self && !q.done && q.pos[0] === c[0] && q.pos[1] === c[1]); }
  berthOf(p) { for (const ing of this.ings) { const d = this.dockOf[ing]; if (p.pos[0] === d[0] && p.pos[1] === d[1]) return ing; } return null; }
  berthTaken(ing, self) { const d = this.dockOf[ing]; return this.players.some(q => q !== self && !q.done && q.pos[0] === d[0] && q.pos[1] === d[1]); }
  needs(p) { return p.recipe ? p.recipe.filter(i => !p.ing.includes(i)) : []; }
  priceOf(ing, buyer) { return (buyer && buyer.power === "wholesaler") ? PRICE[0] : PRICE[Math.min(this.sold[ing], PRICE.length - 1)]; }
  atHome(p) { return man(p.pos, this.home) <= 1; }
  ev(type, fields) { return emit(this.events, type, fields || {}, this.round); }

  // Rule 1: 4 squares if no step is upwind, 2 if any step is. Pilot ignores the cap; Racer gets 6.
  reachable(p) {
    const up = OPP[this.windNow], out = new Map();
    const walk = (max, allowUp) => {
      const seen = new Set([K(p.pos)]); let fr = [p.pos];
      for (let s = 0; s < max; s++) {
        const nx = [];
        for (const c of fr) {
          if (this.onRim(c) && K(c) !== K(p.pos)) continue;   // the current ends your move
          for (const dk of DK) {
            if (!allowUp && dk === up) continue;
            const d = DIRS[dk], n = [c[0] + d[0], c[1] + d[1]], k = K(n);
            if (seen.has(k) || this.land(n)) continue;
            seen.add(k); nx.push(n);
            if (!this.shipAt(n, p)) out.set(k, n);
          }
        }
        fr = nx;
      }
    };
    if (p.power === "pilot") walk(4, true);
    else { walk(p.power === "racer" ? 6 : 4, false); walk(2, true); }
    return [...out.values()];
  }

  /* ---------------------------------------------------------------- the run loop */

  *run() {
    // ---- setup: recipe draft, then boat powers ----
    for (const p of this.players) {
      const a = this.sample(this.ings, RECIPE_SIZE);
      let b = this.sample(this.ings, RECIPE_SIZE), t = 0;
      while (t++ < 20 && a.slice().sort().join() === b.slice().sort().join()) b = this.sample(this.ings, RECIPE_SIZE);
      p.recipeChoices = [a, b];
      const pick = yield { kind: "recipe", seat: p.idx, options: [a, b] };
      p.recipe = p.recipeChoices[pick] || a;
      this.ev("recipe", { p: p.idx });
    }
    const pool = POWER_KEYS.slice();
    for (const p of this.players) {
      const pick = yield { kind: "power", seat: p.idx, options: pool.slice() };
      const key = pool.includes(pick) ? pick : pool[0];
      p.power = key; pool.splice(pool.indexOf(key), 1);
    }
    this.windNext = DK[Math.floor(this.r() * 4)];
    this.stormNext = this.r() < STORM_CHANCE;
    this.ev("setup", { seats: this.players.map(p => ({ i: p.idx, name: p.name, power: p.power })) });

    // ---- rounds ----
    while (!this.over && this.round < 60) {
      this.round++;
      // the vane: last round's prediction becomes this round's wind, then spin for next
      this.windNow = this.windNext; this.stormNow = this.stormNext;
      this.windNext = DK[Math.floor(this.r() * 4)];
      this.stormNext = this.r() < STORM_CHANCE;
      this.ev("round", { n: this.round, wind: this.windNow, storm: this.stormNow, windNext: this.windNext, stormNext: this.stormNext });

      if (this.stormNow) this.storm();
      this.castCalled = false;

      for (const p of this.players) {
        if (this.over) break;
        yield* this.turn(p);
        if (p.done) { yield* this.finalLap(p); this.over = true; }
      }
    }
    this.ev("gameover", { standings: this.standings() });
  }

  sample(a, k) { const c = [...a]; for (let i = c.length - 1; i > 0; i--) { const j = Math.floor(this.r() * (i + 1)); [c[i], c[j]] = [c[j], c[i]]; } return c.slice(0, k); }

  // Rule 7/8: one storm, every ship, all at once, before anybody's turn.
  storm() {
    const d = DIRS[this.windNow], moves = [];
    for (const p of this.players) {
      if (p.done) continue;
      const from = [...p.pos];
      if (this.berthOf(p) !== null || this.atHome(p)) { moves.push({ i: p.idx, from, to: from, safe: "berth" }); continue; }
      let aground = false, swept = false;
      for (let s = 0; s < 3; s++) {
        const n = [p.pos[0] + d[0], p.pos[1] + d[1]];
        if (this.land(n)) { aground = true; break; }
        if (this.shipAt(n, p)) break;
        p.pos = n;
        if (this.onRim(p.pos)) { const h = this.rimHeadOf(p.pos); if (h) { p.pos = [...h]; swept = true; } break; }
      }
      if (aground && p.power !== "blackpearl") { p.lostTurn = true; }
      moves.push({ i: p.idx, from, to: [...p.pos], aground, swept });
    }
    this.ev("storm", { dir: this.windNow, moves });
  }

  *turn(p) {
    if (p.done) return;
    if (p.lostTurn) { p.lostTurn = false; this.ev("aground", { p: p.idx }); return; }
    this.ev("turn", { p: p.idx });

    // ---- Sail (free) ----
    const cells = this.reachable(p);
    if (cells.length) {
      const choice = yield { kind: "sail", seat: p.idx, options: cells };
      if (choice && (choice[0] !== p.pos[0] || choice[1] !== p.pos[1])) {
        const from = [...p.pos]; p.pos = [...choice]; let swept = null;
        if (this.onRim(p.pos)) { const h = this.rimHeadOf(p.pos); if (h && K(h) !== K(p.pos)) { p.pos = [...h]; swept = [...p.pos]; } }
        this.ev("sail", { p: p.idx, from, to: [...p.pos], swept });
      }
    }

    // ---- Act ----
    const acts = this.legalActs(p);
    const act = yield { kind: "act", seat: p.idx, options: acts };
    yield* this.resolveAct(p, act || { a: "pass" });
  }

  // Is there any deal on the table worth calling for? Used to gate the action so "Trade" never
  // appears when nobody holds anything you want and you have nothing anyone wants.
  canOffer(p) {
    const need = this.needs(p);
    const live = this.players.filter(q => q !== p && !q.done);
    if (need.some(i => live.some(q => q.ing.includes(i)))) return true;
    const surplus = p.ing.filter(i => !need.includes(i));
    return surplus.some(i => live.some(q => this.needs(q).includes(i)));
  }
  legalActs(p) {
    const out = [];
    if (!this.needs(p).length && this.atHome(p)) out.push({ a: "bake" });
    const berth = this.berthOf(p);
    // Tying up is always allowed, stripped island or not. You are at the berth — often because a
    // gale put you there — and digging the sand for treasure does not need the storehouse to have
    // anything left in it. Gating the whole action on remaining crates meant a captain blown onto
    // an empty island could not even take their turn there.
    if (berth && !this.berthTaken(berth, p)) out.push({ a: "dock", ing: berth });
    const adj = this.players.filter(q => q !== p && !q.done && man(q.pos, p.pos) === 1);
    for (const q of adj) out.push({ a: "battle", target: q.idx });
    // Trade costs your action now. It used to be a free phase at the top of every turn, which made
    // the bots ask every rival every round — spam that read like advertising and stalled the game.
    // As an action it must beat docking, fighting and the cast, so it is only ever called when it
    // is genuinely the best thing to do. It is also what a captain DOES while crossing open water,
    // which is where the old build's 40-57% of do-nothing turns came from.
    if (this.canOffer(p)) out.push({ a: "trade" });
    if (!this.castCalled) out.push({ a: "cast" });
    else if (p.power === "poacher") out.push({ a: "poach" });
    out.push({ a: "pass" });
    return out;
  }

  *resolveAct(p, act) {
    if (act.a === "bake") {
      p.done = true; this.finishOrder.push(p.idx); this.ev("bake", { p: p.idx }); return;
    }
    if (act.a === "dock") {
      const ing = act.ing;
      // Rule 7: tying up is TWO things in a fixed order — dig for treasure, THEN buy. The flip is
      // resolved here so the order of RNG calls never depends on who is resolving, but the outcome
      // rides along in the request so a human can be shown a coin turning over instead of a number
      // that has already appeared. The response is discarded: this is a beat, not a decision.
      const heads = this.flip();
      yield { kind: "flip", seat: p.idx, options: { ing, heads, got: heads ? TREASURE : 0 } };
      if (heads) p.coins += TREASURE;
      this.ev("treasure", { p: p.idx, ing, heads, got: heads ? TREASURE : 0 });
      const cost = this.priceOf(ing, p);
      const needed = this.needs(p).includes(ing);   // ask BEFORE the crate is in the hold
      if (this.board.tokens[ing] > 0 && p.coins >= cost) {
        const buy = yield { kind: "buy", seat: p.idx, options: { ing, cost, need: needed } };
        if (buy) {
          p.coins -= cost; this.board.tokens[ing]--; this.sold[ing]++; p.ing.push(ing);
          this.ev("buy", { p: p.idx, ing, cost, needed });
        }
      } else if (this.board.tokens[ing] <= 0) this.ev("stripped", { p: p.idx, ing });
      else this.ev("broke", { p: p.idx, ing, cost });
      return;
    }
    if (act.a === "trade") { yield* this.outcry(p); return; }
    if (act.a === "battle") { yield* this.battle(p, this.players[act.target]); return; }
    if (act.a === "cast") { this.castCalled = true; yield* this.cast(p); return; }
    if (act.a === "poach") { p.coins += 2; this.ev("poach", { p: p.idx, got: 2 }); return; }
    this.ev("hold", { p: p.idx });
  }

  /* ---- the public refusal ledger ---- */
  floorFor(seat, ing) { return this.floors.get(seat + ":" + ing) || 0; }
  setFloor(seat, ing, price) {
    const k = seat + ":" + ing;
    if (price > (this.floors.get(k) || 0)) this.floors.set(k, price);
  }
  swapRefused(seat, want, given) { return this.swapsRefused.has(seat + ":" + want + ":" + given); }
  // Has this captain refused to part with this crate in public at all, at any price or for any
  // swap? That is the evidence about their recipe, separate from what it would now cost.
  heldOut(seat, ing) {
    if (this.floorFor(seat, ing)) return true;
    for (const k of this.swapsRefused) if (k.startsWith(seat + ":" + ing + ":")) return true;
    return false;
  }
  // The one question the table already knows this captain's answer to: these exact terms.
  answeredAlready(q, offer) {
    if (offer.sale) return false;
    if (offer.giveIng) return this.swapRefused(q.idx, offer.want, offer.giveIng);
    return (offer.giveCoins | 0) > 0 && this.floorFor(q.idx, offer.want) >= (offer.giveCoins | 0);
  }

  // Rule 4: ONE call to the whole table, one round of answers, the caller picks.
  *outcry(p) {
    const others = this.players.filter(q => q !== p && !q.done);
    if (!others.length) return;
    const offer = yield { kind: "offer", seat: p.idx, options: { need: this.needs(p), hold: p.ing.slice(), coins: p.coins } };
    if (!offer || offer.skip) return;
    this.ev("offer", { p: p.idx, want: offer.want, giveIng: offer.giveIng || null, giveCoins: offer.giveCoins || 0, sale: !!offer.sale });
    // every other captain who has not already answered this in public answers ONCE, blind
    const answers = [], refusers = [];
    // Who else could satisfy this call? It decides whether shaving your ask is worth anything.
    // Undercutting is a race against another holder; with no rival it is just giving money away,
    // which is what the old ladder invited every time it capped you below the offer.
    const holders = others.filter(q => offer.sale ? this.needs(q).includes(offer.want) : q.ing.includes(offer.want));
    // A PUBLIC REFUSAL STANDS UNTIL SOMEBODY BEATS IT. Turn down 5 for your milk in front of the
    // table and nobody has to ask you about 5 again — they heard you. Only a better number reopens
    // the question, which is the difference between a market and being advertised at: measured over
    // 200 games, 612 of 1238 answer prompts to a stubborn captain were at or under a price they had
    // already refused in public.
    //
    // This is not the bots being told to stop asking. The engine simply does not re-put a question
    // the table already has the answer to; a swap carries no price (giveCoins 0) so it is never
    // suppressed this way.
    const standing = holders.filter(q => this.answeredAlready(q, offer));
    const askable = holders.filter(q => !standing.includes(q));
    for (const q of standing) { refusers.push(q.idx); p.refused.add(q.idx); }
    if (standing.length) this.ev("standing", { p: p.idx, want: offer.want, price: offer.giveCoins | 0,
      giveIng: offer.giveIng || null, held: standing.map(q => q.idx) });
    for (const q of askable) {
      const ans = yield { kind: "answer", seat: q.idx, options: {
        offer, from: p.idx,
        rivals: askable.length - 1,          // others who could still take this call from you
        callerCoins: p.coins,                // the purse is on the table for all to see
        floor: this.floorFor(q.idx, offer.want),
      } };
      const no = !ans || !!ans.no;
      const ask = no ? null : Math.max(0, ans.ask | 0);
      this.ev("answer", { p: q.idx, ask, no, offered: offer.giveCoins | 0, swap: !!offer.giveIng, sale: !!offer.sale });
      if (!no) answers.push({ seat: q.idx, ask });
      else {
        refusers.push(q.idx);
        // A public refusal to part with a crate settles those terms. Coin sets the price the next
        // captain has to beat; a swap settles that pair. Only for the crate they were asked to GIVE
        // UP — declining to buy somebody's surplus says nothing about what you would sell.
        if (offer.sale) { /* refusing to buy binds nothing */ }
        else if (offer.giveIng) this.swapsRefused.add(q.idx + ":" + offer.want + ":" + offer.giveIng);
        else this.setFloor(q.idx, offer.want, Math.max(1, offer.giveCoins | 0));
        p.refused.add(q.idx);                // and it licenses the guns, whoever else answered
      }
    }
    // Answers may now come in ABOVE the call — the opening number is a bid, not a ceiling. What the
    // caller cannot do is pay coin they do not have.
    const payable = offer.sale ? answers : answers.filter(a => a.ask <= p.coins);
    if (!payable.length) {
      this.ev("nodeal", { p: p.idx, want: offer.want, refusers });
      return;
    }
    const pick = yield { kind: "pick", seat: p.idx, options: { answers: payable, offer } };
    if (pick === null || pick === undefined || pick < 0) { this.ev("walked", { p: p.idx }); return; }
    const deal = payable[Math.min(pick, payable.length - 1)];
    const q = this.players[deal.seat];
    if (offer.sale) {                                    // I sell them my crate for their bid
      const pay = Math.min(deal.ask, q.coins);
      q.coins -= pay; p.coins += pay;
      p.ing.splice(p.ing.indexOf(offer.want), 1); q.ing.push(offer.want);
      this.ev("trade", { a: p.idx, b: q.idx, gave: offer.want, got: pay + " coins", kind: "sale" });
    } else if (offer.giveIng) {                          // a swap
      p.ing.splice(p.ing.indexOf(offer.giveIng), 1); q.ing.push(offer.giveIng);
      q.ing.splice(q.ing.indexOf(offer.want), 1); p.ing.push(offer.want);
      this.ev("trade", { a: p.idx, b: q.idx, gave: offer.giveIng, got: offer.want, kind: "swap" });
    } else {                                             // I buy with coin, at whatever they asked
      const pay = deal.ask;
      p.coins -= pay; q.coins += pay;
      q.ing.splice(q.ing.indexOf(offer.want), 1); p.ing.push(offer.want);
      this.ev("trade", { a: p.idx, b: q.idx, gave: pay + " coins", got: offer.want, kind: "buy" });
    }
    for (const x of [p, q]) if (x.power === "trader" && x.traderPaidRound !== this.round) { x.traderPaidRound = this.round; x.coins += 1; }
  }

  // Rule 9: both commit any part of their purse, in secret. Downwind +1. Tie -> one flip each.
  *battle(att, def) {
    const bets = {};
    for (const x of [att, def]) bets[x.idx] = Math.max(0, Math.min(x.coins, (yield { kind: "commit", seat: x.idx, options: { max: x.coins, foe: (x === att ? def : att).idx, attacking: x === att } }) | 0));
    att.coins -= bets[att.idx]; def.coins -= bets[def.idx];
    const dx = def.pos[0] - att.pos[0], dy = def.pos[1] - att.pos[1];
    const aToD = DK.find(k => DIRS[k][0] === dx && DIRS[k][1] === dy);
    const dToA = DK.find(k => DIRS[k][0] === -dx && DIRS[k][1] === -dy);
    let A = bets[att.idx], D = bets[def.idx], downwind = null;
    if (this.windNow === aToD) { A += 1; downwind = "a"; } else if (this.windNow === dToA) { D += 1; downwind = "d"; }
    let win = null, how = "coins", flips = null;
    if (A > D) win = att; else if (D > A) win = def;
    else {
      const ah = this.flip(), dh = this.flip(); flips = [ah, dh]; how = "flip";
      if (ah && !dh) win = att; else if (dh && !ah) win = def;
      else { how = "cargo"; win = att.ing.length < def.ing.length ? att : def.ing.length < att.ing.length ? def : def; }
    }
    const lose = win === att ? def : att;
    if (win.power === "shooter" && bets[win.idx]) { win.coins += bets[win.idx]; this.ev("shooter", { p: win.idx, got: bets[win.idx] }); }
    // spoils: 5 coins or a crate, winner's choice
    let spoil = null;
    const crates = lose.ing.slice();
    if (crates.length) {
      const want = crates.filter(i => this.needs(win).includes(i));
      const take = yield { kind: "spoils", seat: win.idx, options: { crates, coins: Math.min(5, lose.coins), suggest: want[0] || crates[0] } };
      if (take && take.ing) { lose.ing.splice(lose.ing.indexOf(take.ing), 1); win.ing.push(take.ing); spoil = { ing: take.ing }; }
      else { const t = Math.min(5, lose.coins); lose.coins -= t; win.coins += t; spoil = { coins: t }; }
    } else { const t = Math.min(5, lose.coins); lose.coins -= t; win.coins += t; spoil = { coins: t }; }
    this.ev("battle", { a: att.idx, d: def.idx, ca: bets[att.idx], cd: bets[def.idx], downwind, how, flips, win: win.idx, spoil });
    // the Lookout settles: spectators called this fight for free
    yield* this.lookout(att, def, win);
  }

  *lookout(att, def, win) {
    const spec = this.players.filter(q => q !== att && q !== def && !q.done);
    if (!spec.length) return;
    const calls = [];
    for (const q of spec) {
      const c = yield { kind: "call", seat: q.idx, options: { a: att.idx, d: def.idx } };
      const right = c === win.idx;
      if (right) q.coins += 2;
      calls.push({ seat: q.idx, on: c, right });
    }
    this.ev("lookout", { calls });
  }

  // Rule 3 (v2): the Shared Cast. One coin, the whole table, pot doubles, tails wipes everyone in.
  *cast(caller) {
    const inPlay = this.players.filter(q => !q.done);
    let stage = 0, live = new Set(inPlay);
    const results = [], ladder = [];
    while (live.size) {
      const pot = Math.pow(2, stage);
      for (const q of [...live]) {
        const takes = q.power === "gambler" ? pot * 2 : pot;
        const stay = yield { kind: "cast", seat: q.idx, options: { pot, takes, stage } };
        if (!stay) { q.coins += takes; results.push({ seat: q.idx, took: takes, why: q.power === "gambler" ? "gambler" : "took" }); live.delete(q); }
      }
      if (!live.size) break;
      const heads = this.flip();
      ladder.push({ stage, pot, heads, still: [...live].map(q => q.idx) });
      if (heads) { stage++; if (stage > 10) { for (const q of live) { const t = Math.pow(2, stage); q.coins += t; results.push({ seat: q.idx, took: t, why: "took" }); } break; } }
      else {
        for (const q of live) {
          if (q.power === "trawler") { const t = Math.pow(2, stage + 1); q.coins += t; results.push({ seat: q.idx, took: t, why: "trawler" }); }
          else results.push({ seat: q.idx, took: 0, why: "bust" });
        }
        break;
      }
    }
    this.ev("cast", { caller: caller.idx, top: Math.pow(2, stage), results });
  }

  *finalLap(finisher) {
    this.ev("finallap", { p: finisher.idx });
    for (const q of this.players) {
      if (q === finisher || q.done) continue;
      yield* this.turn(q);
      if (!this.needs(q).length && this.atHome(q) && !q.done) { q.done = true; this.finishOrder.push(q.idx); this.ev("bake", { p: q.idx }); }
    }
  }

  standings() {
    const fin = this.finishOrder.map(i => this.players[i]);
    if (fin.length <= 1) return fin.map(p => ({ i: p.idx, res: p.coins + p.ing.length }));
    // more than one home: they open the bakery together, most resources takes the crown
    return fin.map(p => ({ i: p.idx, res: p.coins + p.ing.length })).sort((a, b) => b.res - a.res);
  }
  winner() {
    const s = this.standings();
    return s.length ? s[0].i : null;
  }
}
