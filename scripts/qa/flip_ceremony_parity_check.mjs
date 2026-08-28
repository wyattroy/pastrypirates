#!/usr/bin/env node
/* THE FLIP CEREMONY MUST READ THE SAME ON BOTH SIDES OF THE WIRE.
 *
 *   node scripts/qa/flip_ceremony_parity_check.mjs
 *
 * FOUND 2026-08-28 while mapping fork 2 for the one-activity-engine work, and it is two real bugs a
 * guest has been living with, not plumbing:
 *
 *   1. THE CEREMONY HAD NO WORDS ON A GUEST. `window.__pp4.flipMsg` is stamped in exactly two
 *      places (src/ui/flow.js), both on the HOST's local path. src/ui/stage.js writes
 *      `fm ? emojify(String(fm.m)) : ""` for the title and the same for the stakes — so a guest's
 *      flip ceremony drew an EMPTY title over EMPTY stakes. The wire already carried `msg` and
 *      `sub`; nobody assigned them.
 *   2. THE GUEST'S COIN DID NOT SPIN WHEN TAPPED. The host paints the spin in the tap's own frame
 *      (`setFlipCoin("spin")`) — that IS the playtest-22 fix for "the coin disappears, the word
 *      FLIP remains, then after a second or two the coin starts to flip". The guest never called
 *      it, so a guest still sees the fault the host had fixed: a blank coin, then a spin a beat
 *      later when the host's broadcast lands.
 *
 * AND THE GUARD IS THE POINT, NOT AN AFTERTHOUGHT. `src/ui/stage.js` has a `!fm && btl` fallback
 * that writes "⚔️ Broadside!" for a BATTLE flip, which borrows no words. Stamping flipMsg
 * unconditionally would silently destroy the battle ceremony's title. So this check asserts BOTH
 * directions: the ordinary flip stamps, and the battle path must not.
 *
 * House convention: no test runner, one PASS/FAIL line per case, every case runs before exit.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const rd = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");
const orch = rd("src/orchestrator.js"), flow = rd("src/ui/flow.js"), stage = rd("src/ui/stage.js");

let fails = 0;
const ok  = (m) => console.log("  PASS  " + m);
const bad = (m) => { fails++; console.log("  FAIL  " + m); };

// the guest's flip branch: from `if(flipIdx>=0){` to its closing `return;`
const lines = orch.split("\n");
const s = lines.findIndex(l => /if\(flipIdx>=0\)\{/.test(l));
const e = s < 0 ? -1 : s + lines.slice(s).findIndex(l => /^\s*return;\s*$/.test(l));
const guestFlip = s < 0 ? "" : lines.slice(s, e + 1).join("\n");

console.log("\nThe guest's flip prompt says what the host's says");
if (!guestFlip) bad("could not find the guest flip branch in orchestrator.js — check pointed at nothing");
else {
  /flipMsg/.test(guestFlip)      ? ok("it stamps window.__pp4.flipMsg, so the ceremony has a title and stakes")
                                 : bad("no flipMsg — the guest's ceremony draws an EMPTY title and EMPTY stakes (stage.js writes `fm ? … : \"\"`)");
  /setFlipCoin\("spin"\)/.test(guestFlip) ? ok('it paints setFlipCoin("spin") in the tap\'s own frame, like the host')
                                 : bad('no setFlipCoin("spin") — the guest sees the blank-coin-then-spin fault playtest 22 fixed for the host');
  /p\.battle|!p\.battle/.test(guestFlip) || /battle/.test(guestFlip)
    ? ok("the stamp is guarded so a BATTLE flip is excluded")
    : bad("nothing excludes a battle flip — stamping unconditionally kills stage.js's `!fm && btl` \"⚔️ Broadside!\" title");
}

console.log("\nThe battle ceremony still borrows no words");
/if\s*\(\s*!fm\s*&&\s*btl\s*\)/.test(stage) ? ok("stage.js still has the `!fm && btl` fallback the battle title depends on")
                                            : bad("the `!fm && btl` fallback is gone — the battle ceremony title will be blank");

console.log("\nThe host path is unchanged");
(flow.match(/flipMsg/g) || []).length >= 2 ? ok("the host still stamps flipMsg on both its flip paths")
                                           : bad("the host's flipMsg stamps were disturbed");

console.log(fails ? `\nFAIL — ${fails}\n` : "\nPASS — both sides of the wire draw the same ceremony\n");
process.exit(fails ? 1 : 0);
