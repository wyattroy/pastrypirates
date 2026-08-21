#!/usr/bin/env node
// scripts/economy_table.js
//
// D-17's INSTRUMENT. "Run the numbers." Wyatt's own words on item 12.
//
// scripts/bot_ladder4.js already measures pass rate and voyage length from the engine's own
// recorded event stream. It does NOT report the three things D-17 asks for: purses over time,
// battle counts, and "could a captain do what they wanted." This script sits beside it and adds
// those three, reusing the identical construction (`roundCfg(STRATS)` + `bakeoff:true`, the dev
// seed family ×7919) so a reader can trust the two scripts are measuring the same game.
//
//   node scripts/economy_table.js [games] [seedMult] [--json] [--crateBase=N] [--powder=N]
//                                 [--dockTails=N] [--dockHeads=N] [--startCoins=N] [--blackMarket=N]
//
// THE LEVERS, AS OVERRIDES, NEVER AS EDITS.
// `--crateBase`, `--powder`, `--dockTails`, `--dockHeads`, `--startCoins` and `--blackMarket` are
// spread over `roundCfg()`'s return value AT CONSTRUCTION, inside THIS file. `roundCfg()` itself is
// never touched, so the shipping config (4/src/engine/index.js:3049 dockHeads/dockTails/crateBase,
// :3035 startCoins, :3037 powder, :3063 blackMarket) never moves. D-17: "Change no number until he
// picks." This script is how the numbers get read without that ever being at risk.
//
// 2026-08-21 CORRECTION (Wyatt, re-reading the first matrix): "I did not mean change the cost of
// crates. I meant change the payout from flipping a coin at the dock." The first matrix (see the
// dated section below this one in docs/../02.2-ECONOMY-TABLE.md) swept `crateBase`/`powder` — the
// WRONG lever. `--dockTails`/`--dockHeads` were named as untouched candidates in that table's own
// "what the numbers do not tell you" section and are what this file's second matrix actually sweeps.
//
// NO NEW INSTRUMENTATION. NO ENGINE-EMISSION CHANGE. Everything below is already recorded or
// already tracked, read a different way — same pattern bot_ladder4.js's header describes for turns
// and passes:
//   - Every event the engine ever emits already carries a full per-seat snapshot, attached by
//     `ev()` itself (4/src/engine/index.js:316-322): `o.state` (pos, coins, ing, done, baking for
//     EVERY seat, not just the actor) and `o.tokens` (every island's remaining stock), both stamped
//     with `o.round`. Purses over time and island stock over time cost nothing to read — they were
//     already being written into `g.events` for a reason that has nothing to do with this script.
//   - Battle counts are `g.battles` / `g.attWins`, plain instance fields the engine already
//     increments (4/src/engine/index.js:299 init, :1709/:1768 increment). Read off the finished
//     game object.
//   - The "could a captain do what they wanted" proxy calls the engine's OWN public methods
//     (`adjPort`, `needs`) on reconstructed `{pos}` objects built from the recorded snapshots, and
//     reuses the SAME pricing formula `cratePrice()` already documents in prose
//     (4/src/engine/index.js:801-813) — applied to the snapshot's `tokens` at that round rather
//     than the game's final tokens, because "did this captain get priced out AT THE TIME" is what
//     the question actually asks. This is a read, not a rebuild: nothing here is a second,
//     independent implementation of a rule the engine already has — it is the same rule, called or
//     quoted, against data the engine already wrote down.
//   - If something turns out not to be readable this way, this script is expected to STOP and say
//     so rather than add an emission.
//
// THE PROXY FOR "COULD A CAPTAIN DO WHAT THEY WANTED" — a judgement, stated so Wyatt can disagree
// with it. On a captain's OWN turn (the only turn on which Attack or Dock is even legal), two
// questions are asked against what the engine already recorded for that exact moment:
//   ATTACK — is there an adjacent, in-play opponent worth robbing? Two readings, both reported,
//     because they can differ (Wyatt, 2026-08-21: "define worth robbing... report both if they
//     differ"):
//       "any"  — holding at least one crate at all, `man(pos)<=1` (the same distance test
//                canAttack/adjOpp already apply). This was the ONLY reading in the first matrix.
//       "need" — holding at least one crate this captain's OWN recipe still needs (`needs()`), the
//                stricter reading: robbing a rival who has nothing useful to a bakery isn't really
//                "worth" it even though the engine legally allows it.
//     If yes (either reading), that captain had A REASON to attack. Did they have `powder` coins to
//     pay for it? If not, PRICED OUT of that reason.
//   DOCK — is the captain standing on a dock (`adjPort`) selling something their own recipe still
//     needs (`needs()`)? If yes, that captain had A REASON to buy. Could they afford that island's
//     current price? If not, PRICED OUT. (Already recipe-filtered in both attack readings' combined
//     total — dock only has the one reading, because "worth docking for" already means "my recipe
//     needs this," there is no looser variant to compare it against.)
//
// LOCKED-OUT CAPTAIN (Wyatt's exact target metric, 2026-08-21): "did that captain have a reason to
// act and never once, the entire game, could afford it" — per captain per game. This is the SAME
// computation the first matrix called "boxed out," reported a new way: instead of one rate over all
// player-games, tallied PER GAME so it can answer "how many games have at least one shut-out
// captain in them, and how many captains does a typical bad game shut out." Two independent
// tallies, one per ATTACK reading ("any" / "need"), because a captain locked out under "any crate
// nearby" and a captain locked out under "only a crate my recipe needs" are different (weaker)
// claims and Wyatt asked to see both.
//
// THE HELD-OUT SEED FAMILY STAYS HELD OUT. bot_ladder4.js reserves a second seed multiplier for
// close calls; that literal is never written here, on purpose — grep this file for it and find
// nothing, so a later editor cannot accidentally promote it into this script's own default. Pass it
// on the command line if a cell ever needs the held-out family, exactly as bot_ladder4.js's own
// header instructs.
//
// BOUNDED. Every loop below is a `for` over a fixed count derived from argv. No unbounded loop.
//
// THE HARNESS CHECKS ITSELF (docs/HARD-WON-LESSONS.md §3 — a harness is unreviewed code). Every run
// prints controls whose values are known before anything is measured: every game accounted for
// (`w==null` counted separately, never `!w` — seat 0 is a real winner); the event stream was
// actually recorded; a reason-to-act was observed at least once (a run that never sees a single
// reason is measuring something other than the game); priced-out counts never exceed the reason
// counts they are a subset of; the two attack readings' priced-out counts never exceed their own
// reason counts either; the locked-out-per-game distribution sums back to the game count.

import { Game, roundCfg } from "../4/src/engine/index.js";
import { man } from "../4/src/shared/index.js";

const ARGV = process.argv.slice(2);
const FLAGS = ARGV.filter((a) => a.startsWith("--"));
const POS = ARGV.filter((a) => !a.startsWith("--"));
const JSON_OUT = FLAGS.includes("--json");

const GAMES = +(POS[0] || 300);
const SEEDMULT = +(POS[1] || 7919);
const STRATS = ["pirate", "trader", "balanced", "rusher"];

function flagValue(name) {
  const f = FLAGS.find((x) => x.startsWith(`--${name}=`));
  return f ? +f.split("=")[1] : undefined;
}
const CRATE_BASE_OVERRIDE = flagValue("crateBase");
const POWDER_OVERRIDE = flagValue("powder");
const DOCK_TAILS_OVERRIDE = flagValue("dockTails");
const DOCK_HEADS_OVERRIDE = flagValue("dockHeads");
const START_COINS_OVERRIDE = flagValue("startCoins");
const BLACK_MARKET_OVERRIDE = flagValue("blackMarket");

function buildCfg() {
  // The overrides live HERE, spread onto roundCfg()'s return value at construction time.
  // roundCfg() itself is never edited — the shipping config cannot move through this file.
  const cfg = { ...roundCfg(STRATS), bakeoff: true };
  if (CRATE_BASE_OVERRIDE !== undefined) cfg.crateBase = CRATE_BASE_OVERRIDE;
  if (POWDER_OVERRIDE !== undefined) cfg.powder = POWDER_OVERRIDE;
  if (DOCK_TAILS_OVERRIDE !== undefined) cfg.dockTails = DOCK_TAILS_OVERRIDE;
  if (DOCK_HEADS_OVERRIDE !== undefined) cfg.dockHeads = DOCK_HEADS_OVERRIDE;
  if (START_COINS_OVERRIDE !== undefined) cfg.startCoins = START_COINS_OVERRIDE;
  if (BLACK_MARKET_OVERRIDE !== undefined) cfg.blackMarket = BLACK_MARKET_OVERRIDE;
  return cfg;
}

// The exact formula 4/src/engine/index.js's cratePrice() documents in prose, applied to the
// snapshot's tokens AT THAT ROUND (o.tokens, already recorded by ev()) rather than the game's
// final tokens, because "priced out at the time" is the question, not "priced out at the end."
function priceAt(cfg, left) {
  if (left == null) return null;
  if (!left || left <= 0) return cfg.blackMarket || null;
  if (left >= 1e9) return cfg.crateBase - 1;
  return Math.max(1, cfg.crateBase - left);
}

function median(arr) {
  if (!arr.length) return null;
  const s = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function run() {
  const cfg = buildCfg();

  const purseSamples = [];
  let worstPurseEverHeld = 0; // tracked incrementally — Math.max(...purseSamples) blows the call
  // stack once a few hundred games pile thousands of samples into one spread (measured: crashes
  // silently past ~150 games, RangeError "Maximum call stack size exceeded", caught by this
  // script's own verify run before the matrix was trusted)
  let totalBattles = 0, totalAttWins = 0, totalRounds = 0, unfinished = 0, played = 0;
  let totalTurns = 0;

  // Two attack readings, "any" and "need" — see the header. Dock reason is shared by both (it was
  // already recipe-filtered).
  let turnsWithAttackReasonAny = 0, turnsPricedOutOfAttackAny = 0;
  let turnsWithAttackReasonNeed = 0, turnsPricedOutOfAttackNeed = 0;
  let turnsWithCrateReason = 0, turnsPricedOutOfCrate = 0;

  // Legacy (first-matrix) per-player-game tallies, kept for exact backward comparison against the
  // 2026-08-20 table (which used only the "any" attack reading).
  let boxedOutPlayerGames = 0, over10PlayerGames = 0;
  const totalPlayerGames = GAMES * STRATS.length;

  // Wyatt's exact target metric (2026-08-21): tallied PER GAME, one tally per attack reading.
  const lockedOutDistAny = new Array(STRATS.length + 1).fill(0); // index = # locked-out captains that game
  const lockedOutDistNeed = new Array(STRATS.length + 1).fill(0);
  let gamesWithAnyLockedOutAny = 0, gamesWithAnyLockedOutNeed = 0;
  let sumLockedOutAny = 0, sumLockedOutNeed = 0;

  for (let s = 1; s <= GAMES; s++) {
    const g = new Game(cfg, s * SEEDMULT, true);
    const w = g.play(); // SEAT INDEX or null — `w==null` is the only "nobody won" test
    totalRounds += g.round;
    totalBattles += g.battles;
    totalAttWins += g.attWins;
    if (w == null) unfinished++; else played++;

    // recipe is assigned once at construction (engine/index.js:272) and never changes through
    // play() — reading it off the finished game object is the same value needs() reads live.
    const recipes = g.players.map((p) => p.recipe);

    const hadReasonAny = STRATS.map(() => false);
    const hadAffordableAny = STRATS.map(() => false);
    const hadReasonNeed = STRATS.map(() => false);
    const hadAffordableNeed = STRATS.map(() => false);
    const maxCoinsThisGame = STRATS.map(() => 0);

    for (const e of g.events) {
      if (!e.state) continue; // every recorded event carries one; defensive only
      for (let i = 0; i < e.state.length; i++) {
        purseSamples.push(e.state[i].coins);
        if (e.state[i].coins > maxCoinsThisGame[i]) maxCoinsThisGame[i] = e.state[i].coins;
        if (e.state[i].coins > worstPurseEverHeld) worstPurseEverHeld = e.state[i].coins;
      }
      if (e.t !== "turn") continue; // Attack/Dock are only legal on the actor's own turn
      totalTurns++;
      const actor = e.p;
      const me = e.state[actor];
      const myRecipe = recipes[actor];
      const myNeeds = myRecipe ? myRecipe.filter((x) => !me.ing.includes(x)) : [];

      let attackReasonAny = false, attackReasonNeed = false;
      for (let j = 0; j < e.state.length; j++) {
        if (j === actor) continue;
        const q = e.state[j];
        if (cfg.bakeoff && q.baking) continue;
        if (q.done) continue;
        if (!q.ing.length) continue;
        if (man(me.pos, q.pos) > 1) continue;
        attackReasonAny = true;
        if (myNeeds.length && q.ing.some((c) => myNeeds.includes(c))) attackReasonNeed = true;
      }
      const canAffordAttack = me.coins >= (cfg.powder || 0);
      if (attackReasonAny) {
        turnsWithAttackReasonAny++;
        hadReasonAny[actor] = true;
        if (canAffordAttack) hadAffordableAny[actor] = true;
        else turnsPricedOutOfAttackAny++;
      }
      if (attackReasonNeed) {
        turnsWithAttackReasonNeed++;
        hadReasonNeed[actor] = true;
        if (canAffordAttack) hadAffordableNeed[actor] = true;
        else turnsPricedOutOfAttackNeed++;
      }

      const ing = g.adjPort({ pos: me.pos }); // the engine's own method, reconstructed pos only
      if (ing && myNeeds.includes(ing)) {
        turnsWithCrateReason++;
        hadReasonAny[actor] = true;
        hadReasonNeed[actor] = true;
        const price = priceAt(cfg, e.tokens[ing]);
        if (price != null && me.coins >= price) {
          hadAffordableAny[actor] = true;
          hadAffordableNeed[actor] = true;
        } else if (price != null) {
          turnsPricedOutOfCrate++;
        }
      }
    }

    let lockedOutThisGameAny = 0, lockedOutThisGameNeed = 0;
    for (let i = 0; i < STRATS.length; i++) {
      const boxedAny = hadReasonAny[i] && !hadAffordableAny[i];
      const boxedNeed = hadReasonNeed[i] && !hadAffordableNeed[i];
      if (boxedAny) { boxedOutPlayerGames++; lockedOutThisGameAny++; }
      if (boxedNeed) lockedOutThisGameNeed++;
      if (maxCoinsThisGame[i] > 10) over10PlayerGames++;
    }
    lockedOutDistAny[lockedOutThisGameAny]++;
    lockedOutDistNeed[lockedOutThisGameNeed]++;
    sumLockedOutAny += lockedOutThisGameAny;
    sumLockedOutNeed += lockedOutThisGameNeed;
    if (lockedOutThisGameAny > 0) gamesWithAnyLockedOutAny++;
    if (lockedOutThisGameNeed > 0) gamesWithAnyLockedOutNeed++;
  }

  const totalReasonTurns = turnsWithAttackReasonAny + turnsWithCrateReason;
  const totalPricedOutTurns = turnsPricedOutOfAttackAny + turnsPricedOutOfCrate;

  return {
    script: "scripts/economy_table.js",
    command: `node scripts/economy_table.js ${GAMES} ${SEEDMULT}` +
      (CRATE_BASE_OVERRIDE !== undefined ? ` --crateBase=${CRATE_BASE_OVERRIDE}` : "") +
      (POWDER_OVERRIDE !== undefined ? ` --powder=${POWDER_OVERRIDE}` : "") +
      (DOCK_TAILS_OVERRIDE !== undefined ? ` --dockTails=${DOCK_TAILS_OVERRIDE}` : "") +
      (DOCK_HEADS_OVERRIDE !== undefined ? ` --dockHeads=${DOCK_HEADS_OVERRIDE}` : "") +
      (START_COINS_OVERRIDE !== undefined ? ` --startCoins=${START_COINS_OVERRIDE}` : "") +
      (BLACK_MARKET_OVERRIDE !== undefined ? ` --blackMarket=${BLACK_MARKET_OVERRIDE}` : "") +
      (JSON_OUT ? " --json" : ""),
    games: GAMES,
    seedMult: SEEDMULT,
    crateBase: cfg.crateBase,
    powder: cfg.powder,
    dockTails: cfg.dockTails,
    dockHeads: cfg.dockHeads,
    startCoins: cfg.startCoins,
    blackMarket: cfg.blackMarket,
    strategies: STRATS,
    typicalPurse: median(purseSamples),
    worstPurseEverHeld: purseSamples.length ? worstPurseEverHeld : null,
    battlesPerGame: round2(totalBattles / GAMES),
    attackWinsPerGame: round2(totalAttWins / GAMES),
    daysPerVoyage: round2(totalRounds / GAMES),
    unfinishedVoyages: unfinished,
    gamesPlayedToACaptainWinning: played,
    // Legacy proxy — first matrix's shape, "any crate" attack reading only. Kept so the
    // 2026-08-20 baseline row can be reproduced exactly.
    proxy: {
      turnsObserved: totalTurns,
      turnsWithAReasonToAttackOrDock: totalReasonTurns,
      turnsPricedOutGivenAReason: totalPricedOutTurns,
      pricedOutRateGivenReason: totalReasonTurns ? round4(totalPricedOutTurns / totalReasonTurns) : null,
      boxedOutPlayerGames,
      totalPlayerGames,
      boxedOutRate: round4(boxedOutPlayerGames / totalPlayerGames),
      over10PlayerGames,
      over10Rate: round4(over10PlayerGames / totalPlayerGames),
    },
    // Wyatt's exact target metric (2026-08-21) — per GAME, not per player-game. Two readings.
    lockedOut: {
      any: {
        definition: "adjacent rival held ANY crate, or captain stood on a dock selling a crate their recipe needs — and never once afforded either, the whole voyage",
        gamesWithAtLeastOneLockedOutCaptain: gamesWithAnyLockedOutAny,
        totalGames: GAMES,
        shareOfGames: round4(gamesWithAnyLockedOutAny / GAMES),
        meanLockedOutCaptainsPerGame: round4(sumLockedOutAny / GAMES),
        distribution: lockedOutDistAny, // index i = games with exactly i locked-out captains (of 4 seats)
      },
      need: {
        definition: "adjacent rival held a crate THIS captain's own recipe still needs, or captain stood on a dock selling a crate their recipe needs — and never once afforded either, the whole voyage",
        gamesWithAtLeastOneLockedOutCaptain: gamesWithAnyLockedOutNeed,
        totalGames: GAMES,
        shareOfGames: round4(gamesWithAnyLockedOutNeed / GAMES),
        meanLockedOutCaptainsPerGame: round4(sumLockedOutNeed / GAMES),
        distribution: lockedOutDistNeed,
      },
    },
    harnessControls: [
      {
        name: "every game accounted for",
        why: "play() returns a seat index or null; played + unfinished must equal games. seat 0 is a real winner, so this is tested with == null, never !w",
        expected: GAMES,
        actual: played + unfinished,
        holds: played + unfinished === GAMES,
      },
      {
        name: "the event stream was recorded",
        why: "ev() opens with if(!this.record)return; — with the flag off every derived count is 0, which reads as a plausible finding instead of a broken harness",
        expected: "> 0",
        actual: totalTurns,
        holds: totalTurns > 0,
      },
      {
        name: "a reason to act was observed at least once",
        why: "a run that never sees a single adjacent opponent or a single dock-with-a-need is not measuring this game's economy",
        expected: "> 0",
        actual: totalReasonTurns,
        holds: totalReasonTurns > 0,
      },
      {
        name: "priced-out counts never exceed the reason counts they are a subset of",
        why: "a captain can only be priced out of a reason they had",
        expected: "<= reason counts",
        actual: `attack(any) ${turnsPricedOutOfAttackAny}/${turnsWithAttackReasonAny}, attack(need) ${turnsPricedOutOfAttackNeed}/${turnsWithAttackReasonNeed}, dock ${turnsPricedOutOfCrate}/${turnsWithCrateReason}`,
        holds: turnsPricedOutOfAttackAny <= turnsWithAttackReasonAny &&
          turnsPricedOutOfAttackNeed <= turnsWithAttackReasonNeed &&
          turnsPricedOutOfCrate <= turnsWithCrateReason,
      },
      {
        name: "need-reading attack reasons never exceed any-reading (need is the stricter subset)",
        why: "\"a crate my recipe needs\" can only be a subset of \"any crate at all\" — if need ever exceeds any, the two readings are not measuring what they claim to",
        expected: "<= any-reading count",
        actual: `${turnsWithAttackReasonNeed} <= ${turnsWithAttackReasonAny}`,
        holds: turnsWithAttackReasonNeed <= turnsWithAttackReasonAny,
      },
      {
        name: "locked-out-per-game distribution sums back to the game count",
        why: "every game must land in exactly one distribution bucket (0..4 locked-out captains) — a mismatch means a game was double-counted or dropped",
        expected: GAMES,
        actual: `any=${lockedOutDistAny.reduce((a, b) => a + b, 0)}, need=${lockedOutDistNeed.reduce((a, b) => a + b, 0)}`,
        holds: lockedOutDistAny.reduce((a, b) => a + b, 0) === GAMES && lockedOutDistNeed.reduce((a, b) => a + b, 0) === GAMES,
      },
    ],
  };
}

function round2(x) { return x == null ? null : Number(x.toFixed(2)); }
function round4(x) { return x == null ? null : Number(x.toFixed(4)); }

const t0 = Date.now();
const record = run();
const wallMs = Date.now() - t0;

if (JSON_OUT) {
  console.log(JSON.stringify(record, null, 2));
  console.error(`${(wallMs / 1000).toFixed(1)}s wall clock (stderr, so stdout stays byte-identical between runs)`);
} else {
  console.log(`\n${GAMES} games, seed family ×${SEEDMULT}, 4-seat table, bake-off ruleset`);
  console.log(`crateBase=${record.crateBase}  powder=${record.powder}  dockTails=${record.dockTails}  dockHeads=${record.dockHeads}  startCoins=${record.startCoins}  blackMarket=${record.blackMarket}\n`);
  console.log(`  typical purse (median, sampled every turn): ${record.typicalPurse}`);
  console.log(`  worst purse anyone ever held:                ${record.worstPurseEverHeld}`);
  console.log(`  battles per game:                            ${record.battlesPerGame}`);
  console.log(`  days (rounds) per voyage:                    ${record.daysPerVoyage}`);
  console.log(`  unfinished voyages:                          ${record.unfinishedVoyages} of ${GAMES}`);
  console.log(`\n  LOCKED-OUT CAPTAINS (Wyatt's target metric, per game):`);
  for (const [label, r] of [["any crate", record.lockedOut.any], ["recipe-need crate", record.lockedOut.need]]) {
    console.log(`    [attack reading: ${label}]`);
    console.log(`      games with >=1 locked-out captain:   ${r.gamesWithAtLeastOneLockedOutCaptain}/${r.totalGames} (${(100 * r.shareOfGames).toFixed(1)}%)`);
    console.log(`      mean locked-out captains per game:   ${r.meanLockedOutCaptainsPerGame}`);
    console.log(`      distribution (0..4 locked-out):      [${r.distribution.join(", ")}]`);
  }
  console.log(`\n  secondary — purse ceiling ("ever held over 10 coins"): ${record.proxy.over10PlayerGames}/${record.proxy.totalPlayerGames} player-games (${(100 * record.proxy.over10Rate).toFixed(1)}%)`);
  console.log(`  legacy proxy (first matrix, per player-game, "any crate" only): boxed out ${record.proxy.boxedOutPlayerGames}/${record.proxy.totalPlayerGames} (${(100 * record.proxy.boxedOutRate).toFixed(1)}%)`);
  console.log(`\n  harness controls (known before the run, checked against what it produced):`);
  for (const c of record.harnessControls)
    console.log(`    ${c.holds ? "holds" : "BROKEN"}  ${c.name.padEnd(78)} expected ${String(c.expected).padEnd(10)} actual ${c.actual}`);
  console.log(`\n  ${(wallMs / 1000).toFixed(1)}s. Re-run with --json to emit this record for an exact comparison across settings.`);
  console.log(`  Command that produced this run: ${record.command}\n`);
}
