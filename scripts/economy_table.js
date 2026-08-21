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
//
// THE TWO LEVERS, AS OVERRIDES, NEVER AS EDITS.
// `--crateBase` and `--powder` are spread over `roundCfg()`'s return value AT CONSTRUCTION, inside
// THIS file. `roundCfg()` itself is never touched, so the shipping config
// (4/src/engine/index.js:3040 crateBase, :3028 powder) never moves. D-17: "Change no number until
// he picks." This script is how the numbers get read without that ever being at risk.
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
//     so rather than add an emission. Group C just spent the one cheap moment for an engine change
//     (02.2-04) and Phase 3's determinism corpus is next — nothing here needed that moment.
//
// THE PROXY FOR "COULD A CAPTAIN DO WHAT THEY WANTED" — a judgement, stated so Wyatt can disagree
// with it. On a captain's OWN turn (the only turn on which Attack or Dock is even legal), two
// questions are asked against what the engine already recorded for that exact moment:
//   ATTACK — is there an adjacent, in-play opponent worth robbing (holding at least one crate,
//     not baking, `man(pos)<=1` — the same distance test canAttack/adjOpp already apply)? If yes,
//     that captain had A REASON to attack. Did they have `powder` coins to pay for it? If not,
//     they were PRICED OUT of a reason they had.
//   DOCK — is the captain standing on a dock (`adjPort`) selling something their own recipe still
//     needs (`needs()`)? If yes, that captain had A REASON to buy. Could they afford that island's
//     current price? If not, PRICED OUT.
// Per player per game: did they ever have a reason (attack or dock) and NEVER once could afford
// it? That is "boxed out" — the sharpest read of Wyatt's target, because it is the one number that
// answers his exact sentence ("every player feels able to do what they want AT LEAST ONCE"), not a
// softer average. The turn-level priced-out RATE is reported alongside it as the supporting detail.
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
// counts they are a subset of.

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

function buildCfg() {
  // The overrides live HERE, spread onto roundCfg()'s return value at construction time.
  // roundCfg() itself is never edited — the shipping config cannot move through this file.
  const cfg = { ...roundCfg(STRATS), bakeoff: true };
  if (CRATE_BASE_OVERRIDE !== undefined) cfg.crateBase = CRATE_BASE_OVERRIDE;
  if (POWDER_OVERRIDE !== undefined) cfg.powder = POWDER_OVERRIDE;
  return cfg;
}

// The exact formula 4/src/engine/index.js's cratePrice() documents in prose, applied to the
// snapshot's tokens AT THAT ROUND (o.tokens, already recorded by ev()) rather than the game's
// final tokens — because "priced out at the time" is the question, not "priced out at the end."
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
  let totalBattles = 0, totalAttWins = 0, totalRounds = 0, unfinished = 0, played = 0;
  let totalTurns = 0;
  let turnsWithAttackReason = 0, turnsPricedOutOfAttack = 0;
  let turnsWithCrateReason = 0, turnsPricedOutOfCrate = 0;
  let boxedOutPlayerGames = 0, over10PlayerGames = 0;
  const totalPlayerGames = GAMES * STRATS.length;

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

    const hadReason = STRATS.map(() => false);
    const hadAffordableReason = STRATS.map(() => false);
    const maxCoinsThisGame = STRATS.map(() => 0);

    for (const e of g.events) {
      if (!e.state) continue; // every recorded event carries one; defensive only
      for (let i = 0; i < e.state.length; i++) {
        purseSamples.push(e.state[i].coins);
        if (e.state[i].coins > maxCoinsThisGame[i]) maxCoinsThisGame[i] = e.state[i].coins;
      }
      if (e.t !== "turn") continue; // Attack/Dock are only legal on the actor's own turn
      totalTurns++;
      const actor = e.p;
      const me = e.state[actor];

      let attackReason = false;
      for (let j = 0; j < e.state.length; j++) {
        if (j === actor) continue;
        const q = e.state[j];
        if (cfg.bakeoff && q.baking) continue;
        if (q.done) continue;
        if (!q.ing.length) continue;
        if (man(me.pos, q.pos) > 1) continue;
        attackReason = true;
        break;
      }
      if (attackReason) {
        turnsWithAttackReason++;
        hadReason[actor] = true;
        if (me.coins >= (cfg.powder || 0)) hadAffordableReason[actor] = true;
        else turnsPricedOutOfAttack++;
      }

      const ing = g.adjPort({ pos: me.pos }); // the engine's own method, reconstructed pos only
      if (ing) {
        const needs = recipes[actor] ? recipes[actor].filter((x) => !me.ing.includes(x)) : [];
        if (needs.includes(ing)) {
          turnsWithCrateReason++;
          hadReason[actor] = true;
          const price = priceAt(cfg, e.tokens[ing]);
          if (price != null && me.coins >= price) hadAffordableReason[actor] = true;
          else if (price != null) turnsPricedOutOfCrate++;
        }
      }
    }

    for (let i = 0; i < STRATS.length; i++) {
      if (hadReason[i] && !hadAffordableReason[i]) boxedOutPlayerGames++;
      if (maxCoinsThisGame[i] > 10) over10PlayerGames++;
    }
  }

  const totalReasonTurns = turnsWithAttackReason + turnsWithCrateReason;
  const totalPricedOutTurns = turnsPricedOutOfAttack + turnsPricedOutOfCrate;

  return {
    script: "scripts/economy_table.js",
    command: `node scripts/economy_table.js ${GAMES} ${SEEDMULT}` +
      (CRATE_BASE_OVERRIDE !== undefined ? ` --crateBase=${CRATE_BASE_OVERRIDE}` : "") +
      (POWDER_OVERRIDE !== undefined ? ` --powder=${POWDER_OVERRIDE}` : "") +
      (JSON_OUT ? " --json" : ""),
    games: GAMES,
    seedMult: SEEDMULT,
    crateBase: cfg.crateBase,
    powder: cfg.powder,
    strategies: STRATS,
    typicalPurse: median(purseSamples),
    worstPurseEverHeld: purseSamples.length ? Math.max(...purseSamples) : null,
    battlesPerGame: round2(totalBattles / GAMES),
    attackWinsPerGame: round2(totalAttWins / GAMES),
    daysPerVoyage: round2(totalRounds / GAMES),
    unfinishedVoyages: unfinished,
    gamesPlayedToACaptainWinning: played,
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
        actual: `attack ${turnsPricedOutOfAttack}/${turnsWithAttackReason}, dock ${turnsPricedOutOfCrate}/${turnsWithCrateReason}`,
        holds: turnsPricedOutOfAttack <= turnsWithAttackReason && turnsPricedOutOfCrate <= turnsWithCrateReason,
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
  console.log(`crateBase=${record.crateBase}  powder=${record.powder}\n`);
  console.log(`  typical purse (median, sampled every turn): ${record.typicalPurse}`);
  console.log(`  worst purse anyone ever held:                ${record.worstPurseEverHeld}`);
  console.log(`  battles per game:                            ${record.battlesPerGame}`);
  console.log(`  days (rounds) per voyage:                    ${record.daysPerVoyage}`);
  console.log(`  unfinished voyages:                          ${record.unfinishedVoyages} of ${GAMES}`);
  console.log(`\n  proxy — "could a captain do what they wanted":`);
  console.log(`    priced-out rate, given a reason to act:    ${record.proxy.pricedOutRateGivenReason == null ? "n/a" : (100 * record.proxy.pricedOutRateGivenReason).toFixed(1) + "%"}`);
  console.log(`    boxed out ALL game (had a reason, never once could afford it): ${record.proxy.boxedOutPlayerGames}/${record.proxy.totalPlayerGames} player-games (${(100 * record.proxy.boxedOutRate).toFixed(1)}%)`);
  console.log(`    ever held over 10 coins:                   ${record.proxy.over10PlayerGames}/${record.proxy.totalPlayerGames} player-games (${(100 * record.proxy.over10Rate).toFixed(1)}%)`);
  console.log(`\n  harness controls (known before the run, checked against what it produced):`);
  for (const c of record.harnessControls)
    console.log(`    ${c.holds ? "holds" : "BROKEN"}  ${c.name.padEnd(58)} expected ${String(c.expected).padEnd(10)} actual ${c.actual}`);
  console.log(`\n  ${(wallMs / 1000).toFixed(1)}s. Re-run with --json to emit this record for an exact comparison across settings.`);
  console.log(`  Command that produced this run: ${record.command}\n`);
}
