/* SEEDED-DEFECT DRILL — does the sea trial actually CATCH the bugs Wyatt found?
 *
 * Wyatt, 2026-08-26: "test sea trial on the same bugs that you worked on last night."
 *
 * RUNNING IT ON THE FIXED BUILD AND WATCHING IT GO GREEN PROVES ALMOST NOTHING. A suite that has
 * never been seen to fail is a suite nobody should trust — the lesson this repo learned three
 * separate ways in one night (a narration probe that measured a display:none panel and reported
 * PASS; a gear picker that called an empty diff "cosmetic"; a hook drill whose sessions collided).
 *
 * So this puts the bugs BACK, one at a time, and asks whether the sea trial notices. Professionals
 * call this seeding a defect — deliberately breaking something to measure what the tests can see.
 * Anything it does NOT catch is a real gap in coverage, reported as such rather than explained away.
 *
 *   node 4/scripts/qa/seed_drill.mjs                 every seed, on the fastest leg
 *   node 4/scripts/qa/seed_drill.mjs --seed=T-12     just one
 *
 * IT ALWAYS PUTS THE FILE BACK, including on a crash — the restore is in a finally.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const arg = (k, d) => { const a = process.argv.find(s => s.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };

/* Each seed re-introduces ONE bug Wyatt actually reported, by reversing the exact fix. `find` must
   match the shipped code; if it does not, the fix has moved and the drill says so rather than
   silently testing nothing — the same failure mode as a check that cannot see its subject. */
const SEEDS = [
  { id: "T-12", what: "the homepage drawn on top of a live voyage",
    file: "4/src/ui/lobby.js",
    find: "  hideStageLayer();\n  hideBootLoader();\n}\nexport function showRoom(){",
    with: "  hideBootLoader();\n}\nexport function showRoom(){" },
  { id: "T-16", what: "no orange glow on the ceremony's Start button",
    file: "4/index.html",
    find: "  #actionPanel .apBtn.ahoyGlow:not(:disabled):not([aria-disabled=\"true\"]),",
    with: "  #actionPanel .apBtn.ahoyGlowDISABLED:not(:disabled):not([aria-disabled=\"true\"])," },
  { id: "T-30", what: "Watch again shouting for attention",
    file: "4/index.html",
    find: "  #actionPanel .apBtn.bkoWatch,",
    with: "  #actionPanel .apBtn.bkoWatchDISABLED," },
  { id: "T-02", what: "a guest with no stay square — cannot stay put",
    file: "4/src/orchestrator.js",
    find: "hint:p.hint||null,pos:p.pos||null}",
    with: "hint:p.hint||null}" },
];

const only = arg("seed");
const seeds = only ? SEEDS.filter(s => s.id === only) : SEEDS;
const LEG = arg("leg", "solo-phone");
const results = [];

for (const s of seeds) {
  const full = path.join(REPO, s.file);
  const original = fs.readFileSync(full, "utf8");
  if (!original.includes(s.find)) {
    results.push({ ...s, verdict: "CANNOT SEED", note: "the shipped code no longer contains the line this seed reverses — the fix moved, so this drill tested nothing" });
    console.log(`  ${s.id}  CANNOT SEED — the fix has moved; not testing nothing and calling it a pass`);
    continue;
  }
  try {
    fs.writeFileSync(full, original.replace(s.find, s.with));
    console.log(`\n▶ ${s.id} — ${s.what}\n  seeded into ${s.file}; sailing ${LEG}…`);
    const r = spawnSync("node", ["4/scripts/playtest_gate.mjs", `--legs=${LEG}`,
      `--out=${path.join(REPO, "seed-drill-shots")}`, "--judge=off", "--port=8900", "--dbg=9900",
      /* BOUNDED. A seeded bug that is going to be caught is caught in the opening minutes -- all
         four seeds here are visible on the first screens. A full voyage per seed would be ~40
         minutes for four, which is how a drill stops being run. */
      `--max-min=${arg("max-min", "4")}`],
      { cwd: REPO, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
    const out = ((r.stdout || "") + (r.stderr || ""));
    const caught = r.status !== 0;
    const line = (out.match(/^.*(FAIL|finding|✗).*$/mi) || [])[0] || "";
    results.push({ ...s, verdict: caught ? "CAUGHT" : "MISSED", note: line.trim().slice(0, 140) });
    console.log(`  ${s.id}  ${caught ? "CAUGHT ✓" : "MISSED ✗"}  ${line.trim().slice(0, 100)}`);
  } finally {
    fs.writeFileSync(full, original);            // always, even on a crash
  }
}

console.log("\n=== SEEDED-DEFECT DRILL ===");
for (const r of results) console.log(`  ${r.id.padEnd(6)} ${r.verdict.padEnd(12)} ${r.what}`);
const missed = results.filter(r => r.verdict === "MISSED");
console.log(`\n  caught ${results.filter(r=>r.verdict==="CAUGHT").length} / ${results.length}`);
if (missed.length) {
  console.log(`\n  ${missed.length} REAL GAP(S) — the sea trial would not have found these:`);
  for (const m of missed) console.log(`    ${m.id}  ${m.what}`);
  console.log(`  This is a coverage finding about the PROCESS, not a bug in the game.`);
}
