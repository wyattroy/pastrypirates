// src/shared/audio.js
//
// Phase 21 (AUDIO-01/D-02/D-07/D-09/D-10/D-11/D-12/D-13). A new `shared` leaf-tier module — the
// only file in this tier besides src/shared/index.js. src/shared/index.js's own header (lines
// 1-6) states this tier's purity bar: "Holds no DOM, `window`, Firebase, wall-clock, or
// unseeded-random access — pure constants and pure helpers only." This file DELIBERATELY BREAKS
// the DOM/window half of that bar — it constructs an AudioContext, reads document.hidden, and
// reads/writes localStorage. That is a known, deliberate deviation, not an oversight.
//
// The compensating rule that keeps the tier honest: every one of those three touches lives ONLY
// inside initAudio(), isMuted() and setMuted() — never at module load, and never anywhere else in
// this file. That is what makes the module import cleanly under plain Node (where window,
// document and AudioContext are all undefined) — a hard structural requirement from
// 21-VALIDATION.md, not a style preference: scripts/audio_mapping_test.js (Task 2) cannot exist
// without it. It also keeps the second tier rule intact: this file imports nothing from anywhere
// under src/ — scripts/module_graph_check.js auto-scans every new file under src/ against that
// shape with no registration needed.
//
// Design: one AudioContext, one masterGain -> ctx.destination, one decoded AudioBuffer per sfx
// stem (decoded once, lazily, on initAudio()). Every play() call makes a FRESH
// AudioBufferSourceNode from the cached buffer through a fresh per-play GainNode — never reusing
// or restarting a node — which is exactly what makes repeats layer (D-10) instead of cutting each
// other off or being dropped (both explicitly rejected behaviours). Mute (D-13) and tab-blur
// (D-12) both act on the single masterGain — see applyMasterGain() — so they can never fight.

/* ================= Pure data — safe to import headlessly, nothing built at load ================= */

const SFX_DIR = "sfx/";
// The closed literal array — the ONLY source of a fetch URL anywhere in this module, never a
// runtime string (threat T-21-02). Adding a 7th stem later means adding it here, nowhere else.
const SFX_FILES = ["battle-swords", "coin-flip", "fishing", "ship-move", "store-ingredient", "storm"];
// Per-stem relative gain — CONTEXT.md "Claude's Discretion": the single tuning point for loudness
// normalising, so a by-ear browser pass adjusts one number per sound without restructuring
// anything else. Every stem defaults to 1 (no normalising applied yet).
const SFX_VOLUME = {
  "battle-swords": 1,
  "coin-flip": 1,
  "fishing": 1,
  "ship-move": 1,
  "store-ingredient": 1,
  "storm": 1,
};
// pp_-prefixed per-browser preference convention pp_timerOff already established
// (src/orchestrator.js:168) — mute follows it exactly, same key-naming shape.
const MUTE_KEY = "pp_muted";

/* ================= Lazy audio graph — built ONLY by initAudio(), nothing at module load ================= */

let ctx = null;
let masterGain = null;
const buffers = {}; // stem name -> decoded AudioBuffer
let visibilityHandlerAttached = false;
// Seeded lazily, on first isMuted()/setMuted() call — never read at module load.
let mutedCache = null;

function readMutedFromStorage() {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch (e) {
    return false; // absent/tampered store degrades to unmuted, never a crash (T-21-01)
  }
}

// isMuted()/setMuted() are safe to call before initAudio() has ever run — mutedCache is seeded
// independently of the audio graph, and applyMasterGain() (called by setMuted()) itself no-ops
// when ctx is still null.
function isMuted() {
  if (mutedCache === null) mutedCache = readMutedFromStorage();
  return mutedCache;
}
function setMuted(v) {
  mutedCache = !!v;
  try {
    localStorage.setItem(MUTE_KEY, mutedCache ? "1" : "0");
  } catch (e) {
    // swallowed — mirrors pp_timerOff's own try/catch discipline exactly
  }
  applyMasterGain();
}

// The one place the master level is decided (D-12/D-13): 0 when muted OR the tab is hidden,
// otherwise 1 — applied through a ramp, never a bare assignment, so mute and tab-blur can never
// stomp on each other mid-transition.
function applyMasterGain() {
  if (!ctx || !masterGain) return; // safe to call with no graph built yet
  const hidden = typeof document !== "undefined" && document.hidden;
  const target = isMuted() || hidden ? 0 : 1;
  masterGain.gain.setTargetAtTime(target, ctx.currentTime, 0.05);
}

async function loadOne(name) {
  const res = await fetch(`${SFX_DIR}${name}.mp3`);
  const arr = await res.arrayBuffer();
  buffers[name] = await ctx.decodeAudioData(arr);
}

// Lazy, idempotent — a second call returns immediately. Resolves window.AudioContext /
// window.webkitAudioContext and returns silently when neither exists, so an unsupported browser
// degrades to a fully playable silent game (the project's existing silent-failure-for-optional-
// operations convention, cf. iconAt()'s image-load fallback).
async function initAudio() {
  if (ctx) return;
  if (typeof window === "undefined") return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  masterGain = ctx.createGain();
  masterGain.connect(ctx.destination);
  applyMasterGain();
  // Fire-and-forget: a freshly-constructed AudioContext starts "suspended" under browser
  // autoplay policy even when construction itself happened inside a real user gesture's call
  // stack (as it does here — see the one-shot unlock in src/orchestrator.js's wireLobby()). A
  // rejected resume() must never propagate into the game action the gesture rode in on (T-21-04).
  ctx.resume().catch(() => {});
  if (!visibilityHandlerAttached && typeof document !== "undefined") {
    visibilityHandlerAttached = true;
    document.addEventListener("visibilitychange", () => {
      if (!ctx) return;
      if (!document.hidden) {
        // REQUIRED on iOS Safari — a backgrounded AudioContext enters "interrupted" and will not
        // resume playback on its own even once the tab is visible again.
        ctx.resume().catch(() => {});
      }
      applyMasterGain();
    });
  }
  await Promise.all(SFX_FILES.map(loadOne));
}

// The private play primitive. Returns immediately when ctx or the named buffer is missing (either
// initAudio() never ran, the browser is unsupported, or the fetch/decode hasn't resolved yet).
// A NEW AudioBufferSourceNode + a fresh per-play GainNode every call — never reused, never
// restarted, never dropped because another instance is already running (D-10).
function play(name, opts) {
  if (!ctx || !buffers[name]) return;
  const bus = (opts && opts.bus) || masterGain;
  const src = ctx.createBufferSource();
  src.buffer = buffers[name];
  const gain = ctx.createGain();
  gain.gain.value = SFX_VOLUME[name] != null ? SFX_VOLUME[name] : 1;
  src.connect(gain).connect(bus);
  src.start();
  return { src, gain };
}

// The single exported flip sound — every flip in the game passes through
// src/ui/board.js's setFlipCoin() "spin" branch, on both host and guest (D-02/D-07).
function playFlip() {
  play("coin-flip");
}

export { SFX_DIR, SFX_FILES, SFX_VOLUME, MUTE_KEY, initAudio, playFlip, isMuted, setMuted };
