#!/usr/bin/env node
// scripts/audio_mapping_test.js
//
// Phase 21 (AUDIO-01/21-VALIDATION.md § Wave 0): the DOM-free harness every later task in this
// phase's plans asserts through. This wave (21-01) gates src/shared/audio.js's pure surface only
// — the sfx file table, the per-stem volume table, the mute key, and mute get/set's no-audio-
// graph-required safety. 21-02 extends this same file with the 25-key EVENT_SOUND mapping
// assertions (storm dedup, borrow table, silent set) — the header comment stays accurate to that
// plan once it lands.
//
// Convention (matches scripts/narration_test.js): no assertion library, a local
// check(name, actual, expected) counter, plain console.log, process.exit(failures?1:0). Direct
// `import` of the audio surface from src/shared/audio.js — no DOM reference, no import of
// src/ui/board.js or src/orchestrator.js.
//
// The bare `import` of ../src/shared/audio.js immediately below is itself the first, unnamed
// assertion this script makes: if that module ever starts constructing an AudioContext, reading
// document, or reading localStorage at module load, this script throws before its first check
// line ever prints. That is the design constraint 21-VALIDATION.md imposes on the implementation
// (Wave 0 Requirements: "factor the mapping table and dispatch lookup so they are importable
// without constructing a live AudioContext"), made load-bearing by this harness's own existence.

import { SFX_DIR, SFX_FILES, SFX_VOLUME, MUTE_KEY, isMuted, setMuted } from "../src/shared/audio.js";
import { statSync } from "node:fs";

let failures = 0;
function check(name, actual, expected) {
  const ok = actual === expected;
  if (!ok) failures++;
  console.log(`  ${(ok ? "PASS" : "FAIL").padEnd(5)} ${name.padEnd(78)} got=${JSON.stringify(actual)} want=${JSON.stringify(expected)}`);
}
function checkTrue(name, actual) { check(name, actual, true); }

/* ================= SFX_FILES: exactly 6 stems, each resolving to a real, non-zero file ================= */

check("SFX_FILES has exactly 6 entries", SFX_FILES.length, 6);

for (const stem of SFX_FILES) {
  let size = 0;
  let threw = false;
  try {
    size = statSync(`${SFX_DIR}${stem}.mp3`).size;
  } catch (e) {
    threw = true;
  }
  checkTrue(`sfx/${stem}.mp3 exists on disk`, !threw);
  checkTrue(`sfx/${stem}.mp3 has non-zero size (got ${size} bytes)`, size > 0);
}

/* ================= SFX_VOLUME: one key per SFX_FILES entry, no orphans in either direction ================= */

const volumeKeys = Object.keys(SFX_VOLUME);
checkTrue(
  "every SFX_FILES stem has an SFX_VOLUME entry",
  SFX_FILES.every((name) => name in SFX_VOLUME)
);
checkTrue(
  "no SFX_VOLUME key is orphaned (absent from SFX_FILES)",
  volumeKeys.every((name) => SFX_FILES.includes(name))
);

/* ================= MUTE_KEY: the pp_-prefixed convention pp_timerOff already established ================= */

check("MUTE_KEY is exactly \"pp_muted\"", MUTE_KEY, "pp_muted");

/* ================= isMuted()/setMuted(): safe under Node, no audio graph required ================= */

// Under Node, localStorage does not exist — isMuted()'s try/catch fallback must degrade to
// unmuted (false) rather than throwing (threat T-21-01: an absent or tampered store reads as
// unmuted, never crashes).
let isMutedThrew = false;
let initialMuted;
try {
  initialMuted = isMuted();
} catch (e) {
  isMutedThrew = true;
}
checkTrue("isMuted() does not throw under Node (no localStorage global)", !isMutedThrew);
check("isMuted() returns false with no localStorage present", initialMuted, false);

// setMuted()/isMuted() must both be safe to call before initAudio() has ever run — no live ctx,
// no built graph — since applyMasterGain() (called internally by setMuted()) itself no-ops when
// ctx is still null.
let setMutedTrueThrew = false;
try {
  setMuted(true);
} catch (e) {
  setMutedTrueThrew = true;
}
checkTrue("setMuted(true) does not throw with no audio graph built", !setMutedTrueThrew);
check("isMuted() returns true after setMuted(true)", isMuted(), true);

let setMutedFalseThrew = false;
try {
  setMuted(false);
} catch (e) {
  setMutedFalseThrew = true;
}
checkTrue("setMuted(false) does not throw with no audio graph built", !setMutedFalseThrew);
check("isMuted() returns false after setMuted(false)", isMuted(), false);

console.log(`\n${failures ? "FAILED" : "PASSED"} — ${failures} failing check(s)`);
process.exit(failures ? 1 : 0);
