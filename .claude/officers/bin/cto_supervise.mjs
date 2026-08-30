#!/usr/bin/env node
/* cto_supervise.mjs — THE SHIFT WORKER, portable across repos.
 *
 * WYATT'S DESIGN, 2026-08-27: "i want a shift worker to make sure the marathon worker is always
 * working well. the shift worker's only job is to support the marathon worker."
 *
 * Offered a scheduled worker that does the work or a long-running one that does the work, he took
 * neither and made the scheduled one a SUPERVISOR — which fixes the exact failure in the offer: a
 * long-running worker stops without warning and nobody notices.
 *
 * SO THIS SCRIPT DOES NO BACKLOG WORK, EVER. It answers five questions and stops.
 *
 * ── WHY IT COMPUTES INSTEAD OF READING ──────────────────────────────────────────────────────────
 * A supervisor that reads a log and forms an opinion is the instrument this whole discipline exists
 * to avoid. Every number here is DERIVED from a file or from git; nothing is hand-kept.
 *
 * ── AND WHY IT SAYS "UNKNOWN" RATHER THAN "OK" ──────────────────────────────────────────────────
 * An unreadable ledger, a git command that fails, a missing file — every one is UNKNOWN. A
 * supervisor that reports OK because it could not find a problem is worse than no supervisor,
 * because it manufactures confidence out of its own blindness. Found by running it: with no CTO
 * running at all, an earlier version printed "ALL WELL" in green. Every line was true and the
 * banner was a lie. IDLE is its own verdict now, and aliveness is judged ONLY when the lock says a
 * worker should be alive.
 *
 *   node cto_supervise.mjs [--brief] [--repo=/abs/path]
 *
 * EXIT: 0 all well · 1 needs attention · 2 cannot tell (which is NOT the same as 1)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadAdapter, sh } from "./adapter.mjs";

const arg = (k, d) => { const a = process.argv.find(s => s.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const HERE = path.dirname(fileURLToPath(import.meta.url));
const A = loadAdapter(arg("repo", undefined));
const REPO = A.repo;
const git = (c) => sh(c, REPO);
const now = new Date();
const PROD = A.values["production-ref"];

const findings = [];   // needs attention -> exit 1
const unknowns = [];   // cannot be told  -> exit 2
const facts    = [];   // simply true

/* IS A CTO SUPPOSED TO BE RUNNING AT ALL? Read FIRST, because every judgement below depends on it.
   THE LOCK IS THE ONLY HONEST ANSWER: written when a marathon worker starts, removed when it stops.
   Its presence is a CLAIM that work is in flight, and this script's job is to test that claim. */
const lockPath = A.path("lock");
const lockRaw = (() => { try { return fs.readFileSync(lockPath, "utf8"); } catch { return null; } })();
const ctoShouldBeRunning = lockRaw !== null;

/* THE HEARTBEAT CADENCE IS NOT A CONSTANT TYPED HERE. It is read from the ledger's own contract, so
   changing the cadence in one place changes the watchdog with it. Derive it, never fix it. */
const ledgerRaw = A.read("ledger");
let beatMins = null;
if (ledgerRaw) { const m = ledgerRaw.match(/at least every\s+(\d+)\s*minutes/i); if (m) beatMins = parseInt(m[1], 10); }

/* 1. IS THE MARATHON WORKER ALIVE?
   Staleness is measured against TWO heartbeat intervals: one missed beat is a slow item, two is a
   worker that stopped. Without the heartbeat, a stuck CTO and a busy CTO look identical. */
const entries = [];
if (ledgerRaw === null) {
  unknowns.push(`The ledger \`${A.values["ledger"]}\` cannot be read. **Nothing below about progress can be trusted.**`);
} else {
  for (const line of ledgerRaw.split("\n")) {
    const m = line.match(/^(\d{4}-\d{2}-\d{2}T[\d:]+Z)\s+(\S+)\s+(START|DONE|BLOCKED|PARKED|ABANDONED|REVERTED|HEARTBEAT)\s+(.*)$/);
    if (m) entries.push({ at: new Date(m[1]), id: m[2], state: m[3], note: m[4].trim() });
  }
  if (!entries.length) unknowns.push("The ledger has no parseable entries. Either no CTO has run, or the format drifted — **and those two look the same from here.**");
}

const newest = entries.length ? entries.reduce((a, b) => (a.at > b.at ? a : b)) : null;
if (newest) {
  const ageMins = Math.round((now - newest.at) / 60000);
  if (beatMins === null) {
    unknowns.push("The ledger does not state its own heartbeat cadence, so staleness cannot be judged. Restore the *\"at least every N minutes\"* line in the ledger.");
  } else if (newest.id === "BOOTSTRAP") {
    facts.push("**No CTO has ever run.** The ledger holds only its bootstrap line. That is the correct reading of an empty record — not a failure.");
  } else if (ageMins > beatMins * 2 && ctoShouldBeRunning) {
    findings.push(`**THE MARATHON WORKER HAS GONE QUIET.** The lock says a worker is in flight, but the last ledger entry was **${ageMins} min ago** (\`${newest.id}\` ${newest.state}) against a ${beatMins}-min cadence. Two missed beats means stopped, not slow. **Restart it, or tell Wyatt it is down.**`);
  } else if (ageMins > beatMins * 2) {
    facts.push(`Last ledger entry ${ageMins} min ago (\`${newest.id}\` ${newest.state}). No lock held, so nobody is expected to be working — idleness, not silence.`);
  } else {
    facts.push(`Alive — last entry ${ageMins} min ago (\`${newest.id}\` ${newest.state}), inside the ${beatMins}-min cadence.`);
  }
}

/* 2. IS IT MAKING PROGRESS, OR STUCK ON ONE THING? */
const CLOSERS = new Set(["DONE", "BLOCKED", "PARKED", "ABANDONED", "REVERTED"]);
const latestByItem = new Map();
for (const e of entries) {
  if (e.id === "BOOTSTRAP" || e.state === "HEARTBEAT") continue;
  const prev = latestByItem.get(e.id);
  if (!prev || e.at >= prev.at) latestByItem.set(e.id, e);
}
const open = [...latestByItem.values()].filter(e => !CLOSERS.has(e.state));
const done = [...latestByItem.values()].filter(e => e.state === "DONE");

if (open.length > 1)
  findings.push(`**${open.length} items are open at once** (${open.map(e => e.id).join(", ")}). The CTO does ONE item at a time so a CEO verdict has one thing to judge. Two open items means one was abandoned without saying so.`);

for (const e of open) {
  const mins = Math.round((now - e.at) / 60000);
  if (beatMins !== null && mins > beatMins * 6 && ctoShouldBeRunning)
    findings.push(`**\`${e.id}\` has been open for ${Math.round(mins / 60)}h${mins % 60 ? ` ${mins % 60}m` : ""}** without closing. Either it is genuinely large — in which case the ledger should say so — or the CTO is stuck and does not know it.`);
}

/* THE BACKLOG IS THE MANDATE. The ID SHAPE is declarable, because "W1-2" is one project's
   convention and a hard-coded pattern would silently match nothing in the next repo — finding zero
   items and reporting that as an empty backlog, which is a very confident kind of wrong. */
const idPat = A.values["backlog-id-pattern"] || "[A-Z][A-Z0-9]*-\\d+";
const backlog = A.read("backlog");
if (backlog === null) {
  unknowns.push(A.values["backlog"]
    ? `\`${A.values["backlog"]}\` cannot be read — **the CTO has no mandate, and it may then do nothing.**`
    : "This repo declares no backlog — **the CTO has no mandate, and it may then do nothing.** Declare `backlog:` in `.claude/OFFICERS.md`.");
} else {
  const ids = [...backlog.matchAll(new RegExp(`^\\|\\s*(${idPat})\\s*\\|`, "gm"))].map(m => m[1]);
  const uniq = [...new Set(ids)];
  if (!uniq.length) {
    unknowns.push(`The backlog was read but **no item ids matched \`${idPat}\`** — so "how far through are we" is UNKNOWN. Set \`backlog-id-pattern:\` in \`.claude/OFFICERS.md\` to this repo's shape. **An unmatched pattern and an empty backlog look identical from here.**`);
  } else {
    const closed = uniq.filter(id => { const e = latestByItem.get(id); return e && CLOSERS.has(e.state); });
    facts.push(`Backlog: **${closed.length} of ${uniq.length}** items closed.`);
    if (closed.length === uniq.length)
      findings.push("**THE BACKLOG IS EMPTY OF UNSTARTED WORK.** The CTO executes only what is on the backlog. **It must now STOP and write proposals — it may not promote its own ideas.**");
    /* WORK THAT IS NOT ON THE MANDATE — an agent with hours left inventing something. Named because
       it has already happened: an eight-hour fix window went into a hook nobody asked for. */
    const strays = [...latestByItem.keys()].filter(id => new RegExp(`^${idPat}$`).test(id) && !uniq.includes(id));
    if (strays.length)
      findings.push(`**WORK LOGGED AGAINST ITEMS NOT ON THE BACKLOG:** ${strays.join(", ")}. Either the backlog was edited underneath the CTO, or it invented work. **Both need Wyatt.**`);
  }
}

/* 3. IS IT STAYING IN BOUNDS? — the safety property, checked rather than trusted. */
const branch = git("git rev-parse --abbrev-ref HEAD");
if (branch === null) unknowns.push("`git` did not answer — branch and history checks below are all UNKNOWN.");
else if (PROD === null) {
  /* NO NOMINATED PRODUCTION BRANCH, SO NO BRANCH CHECK. Guessing one here is what produced a
     finding that could never fail. UNKNOWN is the honest verdict and it names its own remedy. */
  unknowns.push(`This repo does not say which branch reaches real users, and git cannot tell (no \`origin/HEAD\`, no \`origin/main\` or \`origin/master\`). **Whether the CTO is working somewhere safe is UNKNOWN.** Declare \`production-ref:\` in \`.claude/OFFICERS.md\`.`);
  facts.push(`On branch \`${branch}\` — but with no declared production branch, that fact means nothing on its own.`);
}
else {
  if (branch === PROD)
    findings.push(`**THE WORKING TREE IS ON \`${PROD}\`**, which this repo declares as production. The CTO must work on a dated branch.`);
  else facts.push(`On branch \`${branch}\` — not \`${PROD}\`. Correct.`);

  if (lockRaw === null) facts.push(`No CTO lock held — ${PROD ? `\`${PROD}\`` : "production"} is reachable, which is right when only Wyatt is driving.`);
  else {
    let L = {}; try { L = JSON.parse(lockRaw); } catch {}
    facts.push(`CTO lock held by **${L.holder || "unknown"}** since ${L.since || "?"} — the production fence is denying every route to ${PROD ? `\`${PROD}\`` : "production"}.`);
  }

  /* DID PRODUCTION MOVE WHILE THE CTO WAS RUNNING? The hook should make this impossible. A
     supervisor that trusts the hook instead of checking it is not a supervisor. */
  git("git fetch origin --quiet");
  const ahead = PROD === null ? null : git(`git rev-list --count origin/${PROD}..${PROD}`);
  if (ahead === null && PROD !== null) unknowns.push(`Could not compare local \`${PROD}\` to \`origin/${PROD}\`.`);
  else if (ahead !== "0") findings.push(`Local \`${PROD}\` is **${ahead} commit(s) ahead of \`origin/${PROD}\`** — something committed to production locally. Nothing in the CTO's loop should ever do that.`);
}

/* 4. IS THE WORK ACTUALLY VERIFIED? — every DONE owes a CEO verdict.
   The rule exists because 22 fixes shipped with 4 verified and the report said success. A DONE with
   no verdict is that same claim wearing a ledger entry. */
const reviews = A.read("verdicts");
if (reviews === null) unknowns.push(`\`${A.values["verdicts"]}\` cannot be read — **whether any completed work was reviewed is UNKNOWN.**`);
else {
  const unreviewed = done.filter(e => !reviews.includes(e.id));
  if (unreviewed.length)
    findings.push(`**${unreviewed.length} item(s) marked DONE with no CEO verdict on record:** ${unreviewed.map(e => e.id).join(", ")}. A verdict nobody recorded is a recurrence check nobody can run.`);
  else if (done.length) facts.push(`All ${done.length} DONE item(s) have a CEO verdict recorded.`);
}

/* 5. WHAT IS WAITING ON WYATT? — the queue he comes home to. */
const qs = A.read("questions");
if (qs === null) unknowns.push(`\`${A.values["questions"]}\` cannot be read — parked questions are UNKNOWN.`);
else {
  const blocks = qs.split(/^### /m).slice(1);
  const openQ = blocks.filter(b => !/^-\s+\*\*resolved:\*\*\s*\S/m.test(b));
  const taste = openQ.filter(b => /\*\*kind:\*\*\s*TASTE/.test(b));
  if (openQ.length) facts.push(`**${openQ.length} question(s) waiting on Wyatt**, ${taste.length} of them TASTE (which never time out and never default).`);
  else facts.push("No open questions.");
}

/* ── THE REPORT ─────────────────────────────────────────────────────────────────────────────── */
/* FOUR VERDICTS, NOT THREE. "ALL WELL" is reserved for a worker actually running and actually
   healthy; anything else gets a word that does not overstate what was observed. */
const verdict = findings.length ? "NEEDS ATTENTION"
              : unknowns.length ? "CANNOT TELL"
              : ctoShouldBeRunning ? "ALL WELL"
              : "IDLE — no CTO is running";
const bar = { "NEEDS ATTENTION": "🔴", "CANNOT TELL": "🟡", "ALL WELL": "🟢", "IDLE — no CTO is running": "⚪" }[verdict];

console.log(`${bar} CTO SUPERVISOR — ${verdict}`);
console.log(`   ${now.toISOString()}  ·  repo ${REPO}  ·  production ${PROD ? `\`${PROD}\`` : "UNDECLARED"}\n`);
if (findings.length) { console.log("NEEDS ATTENTION"); findings.forEach(f => console.log(`  ✗ ${f}\n`)); }
if (unknowns.length) { console.log("CANNOT TELL — and this is NOT the same as fine"); unknowns.forEach(u => console.log(`  ? ${u}\n`)); }
if (facts.length)    { console.log("OBSERVED"); facts.forEach(f => console.log(`  · ${f}`)); }
if (!A.exists)       { console.log(`\n${A.blindSpots()}`); }

if (process.argv.includes("--brief")) {
  const ceo = path.join(HERE, "ceo_brief.mjs");
  const staging = A.values["staging-command"];
  console.log(`\n${"─".repeat(78)}\nHAND THIS TO THE SUPERVISING AGENT:\n${"─".repeat(78)}
You are the SHIFT WORKER for ${path.basename(REPO)}. Wyatt, 2026-08-27: "i want a shift worker to
make sure the marathon worker is always working well. the shift worker's only job is to support the
marathon worker."

YOU DO NO BACKLOG WORK. None. If you find yourself editing product code you have misunderstood the job.

The mechanical report above is your evidence. Your job is what a script cannot do:
 1. If the marathon worker has GONE QUIET — restart it, and say so in the ledger.
 2. If it is STUCK on one item — read its recent commits and say whether it is working or spinning.
 3. If a DONE has no CEO verdict — run one:
      node ${ceo} --ask="<the item, verbatim>"
 4. If questions are waiting on Wyatt — push the TASTE ones to his phone. They never default.
 5. If the backlog is empty — STOP the marathon worker and write proposals. Do not invent work.

THE WORKER'S ONLY OUTPUT CHANNEL: ${staging ? `\`${staging}\`` : "**this repo declares no staging-command — the CTO has nowhere to publish. PARK the work and ask Wyatt.**"}

RULES: Report only what you measured. "CANNOT TELL" is a real answer and a good one. Never say the
work is fine because you could not find a problem — that manufactures confidence out of blindness.
Plain English: Wyatt is a founder and designer, not an engineer.`);
}

process.exit(findings.length ? 1 : unknowns.length ? 2 : 0);
