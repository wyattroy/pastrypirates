#!/usr/bin/env node
/* WHO ANSWERS FOR THIS SEAT — two questions, seven rows, one table.
 *
 *   node scripts/qa/decider_table_check.mjs
 *
 * STEP 5 OF THE ONE-DIRECTOR PLAN ASKED FOR A DECIDER INTERFACE. Measuring first found that its
 * substance already exists, and that the plan's framing of it was wrong in a way worth writing
 * down rather than building around.
 *
 * THE PLAN SAID: "Mode becomes a table of Deciders, not a set of ifs scattered through the code…
 * you delete the concept of mode from every layer except the one line that chooses a Decider."
 * THE TREE SAYS: there are 13 `appState.passAndPlay` references in all of src/, and the choice is
 * already made by TWO predicates, each asking a DIFFERENT question:
 *
 *   DOES A PERSON ANSWER, or a bot?      p.strategy === "human"
 *                                        src/orchestrator.js:973, 998, 1033
 *   DOES THIS DEVICE ANSWER, or another? decisionIsLocal(seat)   src/ui/util.js:1873
 *                                        = (passAndPlay && strategy==="human") || seatLocal(seat)
 *
 * THEY ARE NOT DUPLICATES AND MUST NOT BE MERGED. Enumerated over every mode, they agree on six
 * rows and differ on exactly one — a crew host holding a turn for a REMOTE human: a person
 * answers, but not at this device. That single row is the whole reason two predicates exist, and
 * collapsing them would break precisely the case the Decider abstraction was invented to name.
 *
 * SO THIS GATE LOCKS THE TABLE INSTEAD OF RENAMING IT. The risk the plan is really guarding
 * against is a THIRD answer to "who answers?" appearing somewhere, or these two drifting. A rename
 * carries real risk and no player-visible gain; the table is what must not move.
 *
 * House convention: no test runner, one PASS/FAIL line per case, every case runs before exit.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/[^\n]*/g, "$1");

let failures = 0;
const fail = (w) => { failures++; console.log(`  FAIL  ${w}`); };
const pass = (w) => console.log(`  PASS  ${w}`);
console.log("decider_table_check — who answers for this seat must have exactly two answers\n");

const util = strip(read("src/ui/util.js"));
const orch = strip(read("src/orchestrator.js"));

/* INSTRUMENT REACHED ITS SUBJECT. Both predicates must still exist, or every verdict below is
   about a tree that no longer has the thing being checked. */
{
  const hasLocal = /function decisionIsLocal\s*\(/.test(util);
  const personSites = [...orch.matchAll(/\.strategy\s*===\s*"human"\s*\?/g)].length;
  hasLocal && personSites > 0
    ? pass(`instrument reached its subject — decisionIsLocal() exists, and ${personSites} site(s) choose person-or-bot`)
    : fail(`cannot find the subject (decisionIsLocal:${hasLocal} person/bot sites:${personSites}) — every verdict below is meaningless`);
}

/* ONE SPELLING OF "DOES A PERSON ANSWER". Three identical copies live in orchestrator.js today
   (973/998/1033) and that is tolerable only while they are IDENTICAL — three things kept in step by
   discipline is rule 23's shape. If they ever differ, that is the drift, and it is what this
   catches. Compared as normalised text so a renamed loop variable is not a false alarm. */
{
  /* THE FIRST VERSION OF THIS CASE WAS WRONG AND THE GATE SAID SO ON ITS FIRST RUN — worth keeping,
     because the wrong version is the tempting one. It demanded that EVERY `strategy === "human"`
     match the turn-taking shape, and found 9 against 3. The other six are not drift: they ask the
     same question for different purposes — is the attacker a person (:633), is the winner a person
     (:822), which seats are people, for the draft and for counting (:925, :1203), and one local
     flag (:1046). A gate that calls legitimate reuse "drift" trains people to ignore it.
     WHAT IS ACTUALLY INVARIANT, and it is two things:
       · the TURN-TAKING branch has one shape, wherever it appears; and
       · the person test itself has one spelling everywhere, so there is no second way to ask. */
  const turnSites = [...orch.matchAll(/await\s*\(\s*(\w+)\.strategy\s*===\s*"human"\s*\?\s*humanTurn\(\1\)\s*:\s*botTurn\(\1\)\s*\)/g)].length;
  const turnBranches = [...orch.matchAll(/\?\s*humanTurn\s*\(/g)].length;
  turnSites === turnBranches && turnSites > 0
    ? pass(`all ${turnSites} turn-taking site(s) are the identical line — no copy has drifted`)
    : fail(`${turnBranches} site(s) branch to humanTurn but only ${turnSites} match the canonical shape \`await (p.strategy==="human"?humanTurn(p):botTurn(p))\` — one copy has drifted`);

  /* ONE PROPERTY, ONE VALUE — the OPERATOR may vary, and this case said otherwise on its second
     run. `!== "human"` is a legitimate negation of the same question, not a second way of asking
     it; flagging it was the gate bending toward strictness rather than toward truth. What would
     actually be a second answer is a different property (`.type`, `.kind`, `.isBot`) or a
     different value (`'human'`, `"HUMAN"`, `"bot"` inverted) — because THOSE can disagree with
     each other, and an operator cannot. Third version of this case; stopping here because the
     invariant is now stated rather than tuned until green. */
  const both = [util, orch].join("\n");
  /* SCOPED TO THE VALUE, AND THE REASON IS A LIMIT OF THE INSTRUMENT, NOT A JUDGEMENT THAT THE
     PROPERTY DOES NOT MATTER. The version before this also scanned for a SECOND property
     (.kind, .isBot, …) and flagged `p.kind === "ask"` — which is the PROMPT's kind, not a
     player's. A text reader cannot tell `p` the player from `p` the prompt, and a gate that
     cries wolf on legitimate code teaches people to ignore it, which is worse than the gap it
     covers (HARD-WON-LESSONS: a disabled gate is worse than no gate, because it was believed for
     a while).
     Third wrong version of this case in a row. That count is itself the finding: I kept adjusting
     until it went green instead of asking what it could actually know. What it CAN know, exactly
     and without ambiguity, is which values `.strategy` is compared against — and a second value
     there is a genuine second answer. Property drift is named in the morning checklist as
     something a human should look at, rather than asserted badly here. */
  const values = new Set([...both.matchAll(/\.strategy\s*(?:===|!==|==|!=)\s*["']([^"']*)["']/g)].map(m => m[1]));
  const uses = [...both.matchAll(/\.strategy\s*(?:===|!==)\s*"human"/g)].length;
  values.size === 1 && values.has("human")
    ? pass(`.strategy is compared against exactly one value everywhere — "human", ${uses} use(s). The operator varies legitimately; the question does not.`)
    : fail(`.strategy is compared against ${values.size} different value(s) (${[...values].join(", ")}) — two values can disagree with each other, which is a second answer to one question`);
}

/* ONE DEFINITION OF "DOES THIS DEVICE ANSWER". A second spelling anywhere is a third answer to the
   question, which is the fault the Decider interface exists to prevent. */
{
  const defs = [...util.matchAll(/function decisionIsLocal\s*\(/g)].length;
  const inlineCopies = [...[util, orch].join("\n").matchAll(/passAndPlay\s*&&[^\n]*strategy\s*===\s*"human"/g)].length;
  defs === 1 && inlineCopies === 1
    ? pass("decisionIsLocal is defined once and its rule is spelled nowhere else — the device question has one answer")
    : fail(`the device question has ${defs} definition(s) and ${inlineCopies} inline spelling(s) of its rule — a second copy is a third answer to "who answers?"`);
}

/* THE TABLE ITSELF, RUN. Seven rows over every mode. The one row where the two questions DISAGREE
   is the reason both exist; if that row ever agrees, someone has merged them and broken the crew
   host holding a turn for a remote human. */
{
  const isLocal = (c) => (c.pp && c.strat === "human") || c.local;
  const ROWS = [
    ["solo, my seat",             { pp: false, strat: "human", local: true  }],
    ["solo, bot seat",            { pp: false, strat: "bot",   local: false }],
    ["pass & play, human seat",   { pp: true,  strat: "human", local: false }],
    ["pass & play, bot seat",     { pp: true,  strat: "bot",   local: false }],
    ["crew host, own seat",       { pp: false, strat: "human", local: true  }],
    ["crew host, REMOTE human",   { pp: false, strat: "human", local: false }],
    ["crew host, bot seat",       { pp: false, strat: "bot",   local: false }],
  ];
  const disagreeing = ROWS.filter(([, c]) => (c.strat === "human") !== isLocal(c)).map(([n]) => n);
  disagreeing.length === 1 && disagreeing[0] === "crew host, REMOTE human"
    ? pass(`the two questions differ on exactly one row — "${disagreeing[0]}": a person answers, but not at this device. That row is why both predicates exist.`)
    : fail(`the two questions now differ on ${disagreeing.length} row(s) (${disagreeing.join("; ") || "none"}). Exactly one — the crew host holding a turn for a remote human — is correct. None means they have been merged and that case is broken.`);
}

/* A DECIDER MAY DRAW, BUT MUST EMIT NO EVENT — the plan's load-bearing rule, and the one that keeps
   a mode difference from becoming a fork. passGate is the hand-over Decider; if it ever emits an
   event, pass & play stops being local-by-construction and can make two screens disagree.
   src/ui/audio.js already observed this invariant in the words "no new event at all". */
{
  const lobby = strip(read("src/ui/lobby.js"));
  const gate = (lobby.match(/export function passGate\s*\([\s\S]*?\n\}/) || [""])[0];
  const emits = /\.ev\s*\(|netBroadcast\s*\(|game\.ev\b/.test(gate);
  gate && !emits
    ? pass("passGate draws and waits but emits no event — the hand-over is local by construction and cannot make two screens disagree")
    : fail(gate ? "passGate now emits an event — the hand-over has become a fork wearing a feature's clothes (the plan's own rule: what leaves a Decider, upward, is only the answer)" : "passGate not found — this case cannot see its subject");
}

/* RED-PROOF, through the same reader each case uses. */
{
  const merged = (c) => (c.pp && c.strat === "human") || c.local || c.strat === "human";   // the plausible wrong merge
  const remoteRow = { pp: false, strat: "human", local: false };
  const mergeIsCaught = ((remoteRow.strat === "human") !== merged(remoteRow)) === false;
  const driftIsCaught = !/await\s*\(\s*(\w+)\.strategy\s*===\s*"human"\s*\?\s*humanTurn\(\1\)\s*:\s*botTurn\(\1\)\s*\)/
    .test(`await (p.strategy==="human"?humanTurn(p):botTurn(q))`);
  const emitIsCaught = /\.ev\s*\(/.test(`export function passGate(s){ appState.game.ev({t:"handover"}); }`);
  mergeIsCaught && driftIsCaught && emitIsCaught
    ? pass("red-proof: catches the two questions merged, a drifted person-or-bot copy, and a passGate that emits")
    : fail(`red-proof FAILED (merge:${mergeIsCaught} drift:${driftIsCaught} emit:${emitIsCaught}) — these cases may be unable to fail`);
}

console.log(`\n${failures ? "FAIL" : "PASS"} — ${failures} failure(s)`);
process.exit(failures ? 1 : 0);
