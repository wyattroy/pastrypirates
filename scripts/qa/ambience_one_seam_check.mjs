#!/usr/bin/env node
/* GATE: the ambience bed loads on its OWN path and starts from ONE seam.
 *
 *   node scripts/qa/ambience_one_seam_check.mjs
 *
 * WHY THIS EXISTS, and both halves were paid for before it was written.
 *
 * 1. THE LOAD PATH. `initAudio()` does `await Promise.all(SFX_FILES.map(loadOne))` — NO sound in
 *    the game can play until every stem in that array has downloaded and decoded. docs/AUDIO.md §3
 *    wrote the consequence down in advance: "Add a music bed to that list and every sound effect in
 *    the game goes silent until the music finishes downloading, potentially the first minute of
 *    play on a phone." The ambience is 917 KB against the ten stems' 583 KB — putting it in
 *    SFX_FILES would roughly triple the wait before a coin flip makes a noise, on the connection
 *    least able to afford it. The next session to add a stem will not have read that paragraph.
 *    THIS GATE HAS. It fails if any ambience clip appears in SFX_FILES.
 *
 * 2. THE SEAM. Wyatt, 2026-09-06, after the drumroll was "fixed" by pasting the call into the guest
 *    twin as well: "DO NOT ARCHITECT DRIFTABLE CODE OR I WILL FIRE YOU" and "there should be NO
 *    more precedent for drift, we have been fixing that tech debt for weeks now!!!" A bed started
 *    from a host path and a guest path is that same fault in a new coat — two screens, two
 *    lifetimes, and nothing making them agree.
 *    The bed is therefore started by the VIEW being up, not by who is computing the game.
 *    src/ui/lobby.js's own header already states the rule for its three screen functions: "Wired in
 *    these three functions rather than at each caller, because every route to these screens goes
 *    through them and a route added later cannot forget." showGameView() starts it; showHome() and
 *    showRoom() stop it. Solo, pass-and-play, host, guest and the reload-resume path all reach the
 *    board through those three and cannot drift apart.
 *
 * DERIVED, NOT LISTED — CLAUDE.md, "nothing is a constant". Every name below is read out of
 * src/ui/audio.js's own arrays. Adding a thirteenth clip needs no edit here.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const AUDIO = path.join(REPO, "src", "ui", "audio.js");
const LOBBY = path.join(REPO, "src", "ui", "lobby.js");

const failures = [];
const ok = m => console.log("  PASS  ", m);
const bad = m => { failures.push(m); console.log("  FAIL  ", m); };

console.log("ambience_one_seam_check — the bed loads on its own path and starts from one seam\n");

const audio = fs.readFileSync(AUDIO, "utf8");
const lobby = fs.readFileSync(LOBBY, "utf8");

const arr = (src, name) => {
  const m = src.match(new RegExp(`const\\s+${name}\\s*=\\s*\\[([^\\]]*)\\]`));
  return m ? m[1].split(",").map(s => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean) : null;
};

const AMB = arr(audio, "AMBIENCE_FILES");
const SFX = arr(audio, "SFX_FILES");

if (!AMB) {
  bad("src/ui/audio.js declares no AMBIENCE_FILES array — the gate cannot derive what to check, " +
      "so it fails rather than passing on nothing.");
} else if (!AMB.length) {
  bad("AMBIENCE_FILES is empty — a gate that checks zero files is not a green gate.");
} else {
  ok(`AMBIENCE_FILES names ${AMB.length} clip(s)`);

  /* 1 — every clip is on disk. Same reason sfx_files_exist_check exists: a merge once left
     src/ui/audio.js naming ten stems while sfx/ held eight, and npm test stayed green. */
  const missing = AMB.filter(s => !fs.existsSync(path.join(REPO, "sfx", `${s}.mp3`)));
  missing.length
    ? bad(`${missing.length} ambience clip(s) have no mp3 in sfx/: ${missing.map(s => s + ".mp3").join(", ")}`)
    : ok(`all ${AMB.length} ambience clips have an mp3 in sfx/`);

  /* 2 — THE LOAD PATH. Not one of them may sit in SFX_FILES. */
  if (!SFX) {
    bad("could not read SFX_FILES to prove the ambience is kept out of it");
  } else {
    const leaked = AMB.filter(s => SFX.includes(s));
    leaked.length
      ? bad(`${leaked.length} ambience clip(s) are in SFX_FILES: ${leaked.join(", ")}. ` +
            `initAudio() awaits Promise.all over that array, so EVERY sound in the game — the coin ` +
            `flip, the cannon, the your-turn bell — would stay silent until the whole ${
              Math.round(AMB.reduce((a, s) => a + (fs.existsSync(path.join(REPO, "sfx", s + ".mp3"))
                ? fs.statSync(path.join(REPO, "sfx", s + ".mp3")).size : 0), 0) / 1024)
            } KB bed had downloaded and decoded. docs/AUDIO.md §3 names this exact failure.`)
      : ok("no ambience clip is in SFX_FILES — the bed cannot block the game's other sounds");
  }

  /* 3 — the bed must have a load path of its own, or point 2 is met by simply never loading it. */
  /^\s*async function initAmbience\s*\(/m.test(audio) || /function initAmbience\s*\(/.test(audio)
    ? ok("initAmbience() exists — the bed has a load path of its own")
    : bad("no initAmbience() in src/ui/audio.js — keeping the clips out of SFX_FILES is only half " +
          "the requirement; they still need a path that fetches them without blocking the others.");
}

/* 4 — ONE SEAM. The three screen functions in lobby.js, and nowhere else. */
const startCalls = (lobby.match(/\bstartAmbience\s*\(/g) || []).length;
const stopCalls = (lobby.match(/\bstopAmbience\s*\(/g) || []).length;

const bodyOf = name => {
  const i = lobby.indexOf(`export function ${name}(){`);
  if (i < 0) return "";
  const j = lobby.indexOf("\n}", i);
  return lobby.slice(i, j < 0 ? lobby.length : j);
};

startCalls === 1
  ? ok("startAmbience() is called exactly once in src/ui/lobby.js")
  : bad(`startAmbience() is called ${startCalls} time(s) in src/ui/lobby.js — it must be exactly 1. ` +
        `Two start seams is the drumroll fault again: two screens, two lifetimes, nothing making them agree.`);

/\bstartAmbience\s*\(/.test(bodyOf("showGameView"))
  ? ok("showGameView() is the seam that starts the bed")
  : bad("showGameView() does not start the bed. It is the one function every route to the board " +
        "passes through — solo, pass-and-play, host, guest and the reload-resume path alike.");

stopCalls === 2
  ? ok("stopAmbience() is called exactly twice — showHome() and showRoom()")
  : bad(`stopAmbience() is called ${stopCalls} time(s) in src/ui/lobby.js — it must be exactly 2, ` +
        `one for each way of leaving the board.`);

for (const fn of ["showHome", "showRoom"]) {
  /\bstopAmbience\s*\(/.test(bodyOf(fn))
    ? ok(`${fn}() stops the bed`)
    : bad(`${fn}() does not stop the bed — leaving the board would leave the sea running under the lobby.`);
}

/* 5 — no OTHER file may start or stop it. That is what keeps the seam single. */
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e =>
  e.name === "node_modules" || e.name.startsWith(".") ? []
    : e.isDirectory() ? walk(path.join(d, e.name))
    : e.name.endsWith(".js") ? [path.join(d, e.name)] : []);

const strays = walk(path.join(REPO, "src"))
  .filter(f => f !== AUDIO && f !== LOBBY)
  .filter(f => /\b(startAmbience|stopAmbience)\s*\(/.test(fs.readFileSync(f, "utf8")))
  .map(f => path.relative(REPO, f));

strays.length
  ? bad(`${strays.length} file(s) outside lobby.js start or stop the bed: ${strays.join(", ")}. ` +
        `The seam is the SCREEN being up, never a game tier — a host path and a guest path is drift.`)
  : ok("no file outside src/ui/lobby.js starts or stops the bed");

/* 6 — his tuned numbers survive as named constants a human can find and change. */
const wants = [
  ["AMBIENCE_SEA", 0.596], ["AMBIENCE_GULL", 0.168], ["AMBIENCE_CREAK", 1.122],
  ["AMBIENCE_GULL_MEAN_SEC", 10], ["AMBIENCE_CREAK_MEAN_SEC", 13],
  ["AMBIENCE_SPREAD", 0.7], ["AMBIENCE_LIVELINESS", 0.35],
];
const wrong = wants.filter(([k, v]) => {
  const m = audio.match(new RegExp(`const\\s+${k}\\s*=\\s*([0-9.]+)`));
  return !m || Number(m[1]) !== v;
});
wrong.length
  ? bad(`${wrong.length} of Wyatt's tuned value(s) are missing or changed: ` +
        `${wrong.map(([k, v]) => `${k} should be ${v}`).join("; ")}. He dialled these by hand in the ` +
        `Sea Bed Tuner on 2026-09-07; they are his ruling, not a default to be improved on.`)
  : ok(`all ${wants.length} of his tuned values are present, unchanged`);

console.log(failures.length ? `\nFAIL — ${failures.length} failure(s)` : `\nPASS — 0 failure(s)`);
process.exit(failures.length ? 1 : 0);
