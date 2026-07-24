#!/usr/bin/env node
// scripts/determinism_baseline.js
//
// The determinism regression oracle for the v1.1 milestone (D-09). Every later phase in this
// milestone answers "did we break it?" by diffing against the corpus this tool captures and
// verifies. Its quality is the ceiling on Phases 8–12's safety.
//
// --capture   replays every seed, writes scripts/fixtures/determinism/seed-<seed>.jsonl plus
//             manifest.json, and asserts the corpus is non-empty and well-formed.
// --verify    (default when no flag is given) replays every seed fresh, hashes the result, and
//             compares against the committed manifest — the behavior oracle.
//
// Tracer scope (Task 1): exactly one seed, 12345, so the whole capture → verify → red-proof path
// is proven end to end before the corpus is widened to the locked 30-seed range (Task 2, D-03).

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { loadEngine } from "./lib/load_engine.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.join(__dirname, "fixtures", "determinism");
const MANIFEST_PATH = path.join(FIXTURES_DIR, "manifest.json");

// same personality roster / seeding convention real_game_test.js established
const SEED_BASE = 12345;
const BOT_STRATS = ["pirate", "trader", "balanced", "rusher", "monopolist"];
const SEED_COUNT = 1; // Task 1 tracer — widened to 30 in Task 2 (D-03)

const mode = process.argv[2] === "--capture" ? "capture" : "verify";

function seedFile(seed) {
  return path.join(FIXTURES_DIR, `seed-${seed}.jsonl`);
}

function strategiesFor(i) {
  return [0, 1, 2, 3].map((s) => BOT_STRATS[(i + s) % BOT_STRATS.length]);
}

// Serialize one event per line, JSON.stringify with no replacer/indentation (D-06/D-07). Key
// order comes from Game.ev()'s insertion order and is stable across runs of identical code.
function serializeEvents(events) {
  return events.map((e) => JSON.stringify(e)).join("\n") + "\n";
}

function hashBytes(bytes) {
  return crypto.createHash("sha256").update(bytes).digest("hex");
}

function playSeed(Game, roundCfg, i, seed) {
  const strategies = strategiesFor(i);
  const cfg = roundCfg(strategies);
  const g = new Game(cfg, seed, true); // record=true — Game.ev() is a no-op otherwise
  g.play();
  return g;
}

async function capture() {
  const { Game, roundCfg, sourceHash } = await loadEngine();
  fs.mkdirSync(FIXTURES_DIR, { recursive: true });

  const perSeed = [];
  for (let i = 0; i < SEED_COUNT; i++) {
    const seed = SEED_BASE + i;
    const g = playSeed(Game, roundCfg, i, seed);
    if (!g.events.length) {
      console.error(`FAIL capture: seed ${seed} produced zero events — record flag or extraction is suspect.`);
      process.exit(1);
    }
    const bytes = serializeEvents(g.events);
    fs.writeFileSync(seedFile(seed), bytes);
    const sha256 = hashBytes(bytes);
    perSeed.push({ seed, file: path.basename(seedFile(seed)), events: g.events.length, sha256 });
    console.log(`  captured seed ${seed} — ${g.events.length} events`);
  }

  const manifest = {
    formatVersion: 1,
    capturedAt: new Date().toISOString(),
    seedBase: SEED_BASE,
    seedCount: SEED_COUNT,
    botStrategies: BOT_STRATS,
    seatRotation: "BOT_STRATS[(seedIndex + seat) % BOT_STRATS.length] for seat in 0..3",
    engineSourceHash: sourceHash,
    perSeed,
  };
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`\nWrote manifest.json (${perSeed.length} seed${perSeed.length === 1 ? "" : "s"}).`);
  process.exit(0);
}

async function verify() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error(`FAIL verify: no manifest found at ${MANIFEST_PATH} — run --capture first.`);
    process.exit(1);
  }
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  const { Game, roundCfg, sourceHash } = await loadEngine();

  let failures = 0;
  manifest.perSeed.forEach((entry, i) => {
    const { seed, sha256: expectedSha256 } = entry;

    // Comparison 1: hash the stored .jsonl bytes against the manifest entry — detects a
    // corrupted or stale committed fixture.
    const storedPath = seedFile(seed);
    if (!fs.existsSync(storedPath)) {
      console.log(`  FAIL  seed ${seed} — missing fixture file ${path.basename(storedPath)}`);
      failures++;
      return;
    }
    const storedBytes = fs.readFileSync(storedPath);
    const storedHash = hashBytes(storedBytes);
    if (storedHash !== expectedSha256) {
      console.log(`  FAIL  seed ${seed} — stored fixture hash mismatch (got=${storedHash} want=${expectedSha256})`);
      failures++;
      return;
    }

    // Comparison 2: replay fresh, serialize identically, hash, compare to the same manifest
    // entry — the behavior oracle.
    const g = playSeed(Game, roundCfg, i, seed);
    const freshBytes = serializeEvents(g.events);
    const freshHash = hashBytes(freshBytes);
    const ok = freshHash === expectedSha256;
    console.log(`  ${(ok ? "PASS" : "FAIL").padEnd(5)} seed ${seed} got=${freshHash} want=${expectedSha256}`);
    if (!ok) failures++;
  });

  // Comparison 3: engine source hash — diagnostic classification only, never drives exit code.
  if (manifest.engineSourceHash && sourceHash !== manifest.engineSourceHash) {
    console.log(
      `  NOTE: engineSourceHash differs from manifest (got=${sourceHash} want=${manifest.engineSourceHash}) — ` +
        `diagnostic only, not a pass/fail input.`
    );
  }

  console.log(`\n${failures === 0 ? "All seeds passed." : failures + " seed(s) FAILED."}`);
  process.exit(failures === 0 ? 0 : 1);
}

if (mode === "capture") {
  await capture();
} else {
  await verify();
}
