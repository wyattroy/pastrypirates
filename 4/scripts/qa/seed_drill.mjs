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
 *   node 4/scripts/qa/seed_drill.mjs --seed=T-12     just one (the baseline still sails first)
 *   node 4/scripts/qa/seed_drill.mjs --leg=crew-phone
 *
 * IT ALWAYS PUTS THE FILE BACK, including on a crash — the restore is in a finally.
 *
 * ── HOW IT GRADES, AND WHY IT SPENT ITS WHOLE LIFE UNABLE TO FAIL ────────────────────────────
 * Until 2026-08-26 a seed scored CAUGHT when the leg exited non-zero. The leg exits non-zero ON ITS
 * OWN, for reasons that have nothing to do with any seed, so every seed scored CAUGHT whatever was
 * done to it. The drill built to prove the sea trial can fail could not itself fail — the same
 * fault as a probe that measures a display:none panel and reports PASS: an instrument reporting on
 * a subject it never reached.
 *
 * It now sails the leg ONCE WITH NOTHING SEEDED, keeps every failure that run names, and grades
 * each seed ONLY on failures the baseline did not already have. Exit status is not consulted at
 * all: two red runs both exit 1, and comparing two non-zero numbers tells you nothing.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const arg = (k, d) => { const a = process.argv.find(s => s.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };

/* Each seed re-introduces ONE bug Wyatt actually reported, by reversing the exact fix. `find` must
   match the shipped code; if it does not — or if the FILE itself has moved — the drill says so
   rather than silently testing nothing, which is the same failure mode as a check that cannot see
   its subject.

   THE PATHS ARE ROOT-RELATIVE BECAUSE THE GAME IS AT ROOT. The v2.0 cutover promoted `4/` to the
   repo root on 2026-08-26 and these four still pointed into `4/`, which now holds only `scripts/`.
   The drill did not report CANNOT SEED when that happened — it threw ENOENT and died, because the
   read sat outside the guard. It is inside it now. */
const SEEDS = [
  { id: "T-12", what: "the homepage drawn on top of a live voyage",
    file: "src/ui/lobby.js",
    find: "  hideStageLayer();\n  hideBootLoader();\n}\nexport function showRoom(){",
    with: "  hideBootLoader();\n}\nexport function showRoom(){" },
  { id: "T-16", what: "no orange glow on the ceremony's Start button",
    file: "index.html",
    find: "  #actionPanel .apBtn.ahoyGlow:not(:disabled):not([aria-disabled=\"true\"]),",
    with: "  #actionPanel .apBtn.ahoyGlowDISABLED:not(:disabled):not([aria-disabled=\"true\"])," },
  { id: "T-30", what: "Watch again shouting for attention",
    file: "index.html",
    find: "  #actionPanel .apBtn.bkoWatch,",
    with: "  #actionPanel .apBtn.bkoWatchDISABLED," },
  { id: "T-02", what: "a guest with no stay square — cannot stay put",
    file: "src/orchestrator.js",
    find: "hint:p.hint||null,pos:p.pos||null}",
    with: "hint:p.hint||null}" },
];

const only = arg("seed");
const seeds = only ? SEEDS.filter(s => s.id === only) : SEEDS;
const LEG = arg("leg", "solo-phone");
const SHOTS = path.join(REPO, "seed-drill-shots");
const results = [];

/* Counts move between two runs of the same build; the SHAPE of a failure does not. So the signature
   drops the digits: "4 structural check failure(s)" and "6 structural check failure(s)" are the same
   complaint and must not read as a seed being caught. The cost of that choice, stated plainly: a
   seed whose ONLY effect is to raise a count the baseline already reports will score MISSED. That is
   the safer direction to be wrong in — this drill exists because it was over-reporting CAUGHT. */
const norm = s => String(s).replace(/\d+/g, "#");

/* Read playtest_gate's own report.json rather than scraping its log. Returns null — NOT an empty
   set — when there is no report, because "the gate never wrote a verdict" and "the gate found
   nothing wrong" are opposite facts and must never collapse into the same value. */
function signatures(out) {
  const p = path.join(out, "report.json");
  if (!fs.existsSync(p)) return null;
  let legs; try { legs = JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; }
  const S = new Map();                                   // signature -> the raw text, for reporting
  for (const leg of legs || []) {
    for (const v of leg.verdict || []) S.set("verdict::" + norm(v), v);
    for (const scr of leg.screens || []) for (const f of scr.fails || []) S.set(`${f.rule}::${norm(f.what)}`, `${f.rule}: ${f.what}`);
  }
  return S;
}

function sail(tag) {
  const out = path.join(SHOTS, tag);
  fs.rmSync(out, { recursive: true, force: true });       // a stale report.json must never be read as this run's
  const r = spawnSync("node", ["4/scripts/playtest_gate.mjs", `--legs=${LEG}`,
    `--out=${out}`, "--judge=off", "--port=8900", "--dbg=9900",
    /* BOUNDED. A seeded bug that is going to be caught is caught in the opening minutes -- all
       four seeds here are visible on the first screens. A full voyage per seed would be ~40
       minutes for four, which is how a drill stops being run. */
    `--max-min=${arg("max-min", "4")}`],
    { cwd: REPO, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  return { status: r.status, sigs: signatures(out), out };
}

/* THE BASELINE. This is the whole fix: sail with nothing seeded so there is something to subtract. */
console.log(`▶ baseline — nothing seeded; sailing ${LEG} to find out what this leg says on its own…`);
const base = sail("baseline");
if (!base.sigs) {
  console.log(`\n  THE BASELINE WROTE NO REPORT (${path.join(base.out, "report.json")} absent).`);
  console.log(`  Without it there is nothing to subtract, so every seed would score CAUGHT again.`);
  console.log(`  Refusing to grade. Fix the leg first — this drill is worthless while it cannot fail.`);
  process.exit(2);
}
console.log(`  baseline names ${base.sigs.size} failure(s) of its own — these are subtracted from every seed:`);
for (const t of base.sigs.values()) console.log(`    · ${String(t).slice(0, 110)}`);

for (const s of seeds) {
  const full = path.join(REPO, s.file);
  /* The read is INSIDE the guard. A file that has moved reports CANNOT SEED like a line that has
     moved; before the cutover it threw ENOENT and killed the run instead. */
  if (!fs.existsSync(full)) {
    results.push({ ...s, verdict: "CANNOT SEED", note: `${s.file} does not exist — the tree moved, so this drill tested nothing` });
    console.log(`\n  ${s.id}  CANNOT SEED — ${s.file} is gone; not testing nothing and calling it a pass`);
    continue;
  }
  const original = fs.readFileSync(full, "utf8");
  if (!original.includes(s.find)) {
    results.push({ ...s, verdict: "CANNOT SEED", note: "the shipped code no longer contains the line this seed reverses — the fix moved, so this drill tested nothing" });
    console.log(`\n  ${s.id}  CANNOT SEED — the fix has moved; not testing nothing and calling it a pass`);
    continue;
  }
  try {
    fs.writeFileSync(full, original.replace(s.find, s.with));
    console.log(`\n▶ ${s.id} — ${s.what}\n  seeded into ${s.file}; sailing ${LEG}…`);
    const run = sail(s.id);
    if (!run.sigs) {
      results.push({ ...s, verdict: "NO REPORT", note: "the gate wrote no report.json for this run — NOT graded, and NOT a pass" });
      console.log(`  ${s.id}  NO REPORT — the gate never reached a verdict; this seed is not graded`);
      continue;
    }
    const fresh = [...run.sigs.keys()].filter(k => !base.sigs.has(k)).map(k => run.sigs.get(k));
    const caught = fresh.length > 0;
    results.push({ ...s, verdict: caught ? "CAUGHT" : "MISSED", fresh,
      note: caught ? fresh.slice(0, 2).map(t => String(t).slice(0, 90)).join(" | ") : `nothing the baseline did not already say (${run.sigs.size} vs ${base.sigs.size} failure(s))` });
    console.log(`  ${s.id}  ${caught ? "CAUGHT ✓" : "MISSED ✗"}  ${results.at(-1).note}`);
  } finally {
    fs.writeFileSync(full, original);            // always, even on a crash
  }
}

console.log("\n=== SEEDED-DEFECT DRILL ===");
console.log(`  leg: ${LEG}   baseline: ${base.sigs.size} pre-existing failure(s), subtracted from every seed`);
for (const r of results) console.log(`  ${r.id.padEnd(6)} ${r.verdict.padEnd(12)} ${r.what}`);
const missed = results.filter(r => r.verdict === "MISSED");
const graded = results.filter(r => r.verdict === "CAUGHT" || r.verdict === "MISSED");
console.log(`\n  caught ${results.filter(r => r.verdict === "CAUGHT").length} / ${graded.length} graded` +
            (graded.length < results.length ? `   (${results.length - graded.length} NOT GRADED — read them above; not-graded is not passed)` : ""));
for (const r of results.filter(r => r.verdict === "CAUGHT")) {
  console.log(`\n  ${r.id} was caught by:`);
  for (const f of r.fresh.slice(0, 4)) console.log(`    ✗ ${String(f).slice(0, 130)}`);
}
if (missed.length) {
  console.log(`\n  ${missed.length} REAL GAP(S) — the sea trial would not have found these:`);
  for (const m of missed) console.log(`    ${m.id}  ${m.what}`);
  console.log(`  This is a coverage finding about the PROCESS, not a bug in the game.`);
}
