#!/usr/bin/env node
/* glass_gate_verdict_logged_check.mjs — the change-gate must RUN on every tick and leave a verdict.
 *
 * WHY (INBOX-20260902T0120Z). On the 01:02Z Glass tick the harvest had already found a real ruling
 * and a real idea, so the tick went straight to publishing without running
 * `glass_needs_publish.mjs` at all. The runbook told it to: step 3 said *"if step 2 found ideas or
 * rulings, you are publishing regardless of what this says"*. The publisher's own account:
 *
 *   "That was a judgment call to not run a check whose answer was moot, not a skip I didn't
 *    notice — but I take your point that 'the answer was moot' and 'the gate ran and I have a
 *    verdict on record' are different things, and only the second is auditable."
 *
 * THE DEFECT IS NOT THE PUBLISH. Publishing was correct — his words landing on the Chart IS a
 * change. The defect is that FROM OUTSIDE, a tick that skipped the gate and a tick where the gate
 * is not wired in at all look identical: `npm test` stays green either way, and everybody believes
 * the guard is live. A gate that is present but not consulted is worse than no gate — it is the
 * exact shape of the publish-stamp fault fixed hours earlier the same night, where a watch that
 * could not publish still marked the Glass as fresh.
 *
 * THE FIX THIS CHECKS: the override moves off the CHECK and onto the ACTION.
 * `scripts/wyclau/glass_gate_log.mjs` always runs the gate, always writes one line, and exits with
 * the gate's own code — except under `--harvested`, where the gate still runs and is still
 * recorded and only the DECISION is overridden. That is the item's sentence, mechanised.
 *
 * ⚠ WHAT THIS CHECK CAN AND CANNOT SEE, said out loud because an instrument that reports a result
 * without naming its subject is this project's oldest recurring fault:
 *   CAN see:    what the wrapper DOES — exit codes preserved, a line appended every run, an
 *               unreadable gate resolving to PUBLISH rather than to silence. Behavioural, run
 *               against an injected fake gate whose verdict and exit code this file chooses.
 *   CANNOT see: whether a human running the tick actually typed the command. Case 8 reads the
 *               runbook's PROSE, and prose-grepping is the weakest thing in this file — it is here
 *               because the fault class it guards is real and measured: `INBOX-20260902T05xxZ-c`
 *               found the permission layer covering one spelling while the documentation taught
 *               another, with nothing connecting them. This connects them. It does not enforce
 *               obedience, and no reader should think it does.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const WRAPPER = join(ROOT, "scripts", "wyclau", "glass_gate_log.mjs");
const RUNBOOK = join(ROOT, ".planning", "wyclau", "GLASS-UPDATE-SESSION.md");

let failures = 0;
const fail = (m) => { console.log(`  FAIL  ${m}`); failures++; };
const pass = (m) => console.log(`  ok    ${m}`);

console.log("the change-gate runs on every tick and leaves a verdict on the record\n");

if (!existsSync(WRAPPER)) {
  fail("scripts/wyclau/glass_gate_log.mjs does not exist — nothing records whether the gate ran, so a skipped tick and an unwired gate are indistinguishable");
  console.log(`\nFAIL (${failures})`);
  process.exit(1);
}

/* THE SEAM. A fake gate whose exit code and words this file chooses, so every case below is a
 * measurement of the wrapper rather than of whatever the real repo happens to look like today.
 * The real gate's own behaviour is glass_needs_publish_check.mjs's subject, not this file's. */
const box = mkdtempSync(join(os.tmpdir(), "pp-gatelog-"));
const LOG = join(box, "GATE-LOG");
const fakeGate = (verdict, code, crash = false) => {
  const p = join(box, `gate-${verdict}-${code}${crash ? "-crash" : ""}.mjs`);
  writeFileSync(p, crash
    ? `console.error("boom"); process.exit(${code});\n`
    : `console.log(${JSON.stringify(`${verdict} — because the fake gate said so`)}); process.exit(${code});\n`);
  return p;
};

const run = (args) => {
  try {
    return { code: 0, out: execFileSync(process.execPath, [WRAPPER, ...args], { encoding: "utf8" }) };
  } catch (e) {
    return { code: e.status ?? 1, out: `${e.stdout ?? ""}${e.stderr ?? ""}` };
  }
};
const logLines = () => {
  try { return readFileSync(LOG, "utf8").split("\n").filter((l) => l.trim()); } catch { return []; }
};

// 1. PUBLISH must pass straight through. The tick branches on the exit code; changing it would
//    change what the tick does, and this wrapper's whole claim is that it does not.
{
  const r = run([`--gate=${fakeGate("PUBLISH", 0)}`, `--log=${LOG}`]);
  if (r.code !== 0) fail(`a PUBLISH gate (exit 0) came back as exit ${r.code} — the wrapper changed the tick's decision instead of only recording it`);
  else pass("a PUBLISH gate exits 0 through the wrapper — the decision is untouched");
}

// 2. NOTHING-MOVED must pass straight through as 10, or a quiet night starts publishing again and
//    the change-gate is defeated by the thing meant to make it auditable.
{
  const r = run([`--gate=${fakeGate("NOTHING-MOVED", 10)}`, `--log=${LOG}`]);
  if (r.code !== 10) fail(`a NOTHING-MOVED gate (exit 10) came back as exit ${r.code} — the tick would publish on a quiet night, which is the waste the gate exists to remove`);
  else pass("a NOTHING-MOVED gate exits 10 through the wrapper — a quiet tick still ends silently");
}

// 3. APPEND, NEVER TRUNCATE. A log that keeps only the newest line answers "what did the last tick
//    say", which is what a session's memory already answered. The value is the HISTORY.
{
  const before = logLines().length;
  run([`--gate=${fakeGate("PUBLISH", 0)}`, `--log=${LOG}`]);
  const after = logLines();
  if (after.length !== before + 1) fail(`the log went from ${before} to ${after.length} lines across one run — it must grow by exactly one, never truncate`);
  else pass(`every run appends exactly one line (${after.length} now) and leaves the earlier ones alone`);
}

// 4. A LINE A HUMAN CAN AUDIT: when, and what the gate said. Without the timestamp the log cannot
//    be matched against a publish; without the verdict there is nothing to audit.
{
  const last = logLines().at(-1) ?? "";
  if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/.test(last)) fail(`the newest log line carries no UTC timestamp, so it cannot be matched against LAST-PUBLISH: ${last.slice(0, 120)}`);
  else pass("each line carries a UTC timestamp that can be lined up against LAST-PUBLISH");
  if (!/\b(PUBLISH|NOTHING-MOVED|UNREADABLE)\b/.test(last)) fail(`the newest log line carries no verdict word: ${last.slice(0, 120)}`);
  else pass("each line carries the verdict the gate actually returned");
}

// 5. THE GATE'S OWN WORDS SURVIVE. The gate explains itself ("a note is queued…", "no commit has
//    landed since…"); a log that keeps the verdict and drops the reason makes the next reader
//    re-derive what was already known.
{
  const last = logLines().at(-1) ?? "";
  if (!/because the fake gate said so/.test(last)) fail(`the gate's own explanation did not reach the log — only the verdict did: ${last.slice(0, 160)}`);
  else pass("the gate's own explanation reaches the log, not just its verdict");
}

/* 6. EVERY DOUBT RESOLVES TO PUBLISH — the discipline the gate itself already holds. A gate that
 *    CRASHES tells us nothing; the wrapper must not turn that into silence, because the failure
 *    mode of a missed publish is Wyatt reading a frozen page. It must still leave a line, so the
 *    crash is auditable rather than merely survived. */
{
  const before = logLines().length;
  const r = run([`--gate=${fakeGate("x", 1, true)}`, `--log=${LOG}`]);
  if (r.code !== 0) fail(`a crashing gate came back as exit ${r.code} — a broken input must resolve to PUBLISH, never suppress one`);
  else pass("a crashing gate resolves to PUBLISH (exit 0) rather than to silence");
  const after = logLines();
  if (after.length !== before + 1) fail("a crashing gate left no log line — the one tick most worth auditing is unrecorded");
  else if (!/UNREADABLE/.test(after.at(-1) ?? "")) fail(`a crashing gate was logged as something other than UNREADABLE: ${(after.at(-1) ?? "").slice(0, 140)}`);
  else pass("a crashing gate is recorded as UNREADABLE, so the record says what happened");
}

/* 7. THE ITEM'S OWN SENTENCE: THE OVERRIDE MOVES ONTO THE ACTION.
 *    Under --harvested the tick is publishing whatever the gate says — his words landing on the
 *    Chart is itself a change. That must not mean the gate goes unrun. The gate still runs, its
 *    real verdict is still what gets written down, and ONLY the exit code is overridden. */
{
  const before = logLines().length;
  const r = run([`--gate=${fakeGate("NOTHING-MOVED", 10)}`, `--log=${LOG}`, "--harvested"]);
  if (r.code !== 0) fail(`--harvested with a NOTHING-MOVED gate exited ${r.code} — the harvest must override the action, so the tick publishes his words`);
  else pass("--harvested overrides the ACTION: a NOTHING-MOVED tick still publishes when the harvest found his words");
  const last = logLines().at(-1) ?? "";
  if (logLines().length !== before + 1) fail("--harvested wrote no log line — this is exactly the tick that went unrecorded on 2026-09-02T01:02Z");
  else if (!/NOTHING-MOVED/.test(last)) fail(`--harvested recorded something other than the gate's real verdict: ${last.slice(0, 140)}`);
  else if (!/harvest/i.test(last)) fail(`--harvested did not record that the action was overridden, so the line reads as a plain publish: ${last.slice(0, 140)}`);
  else pass("--harvested does NOT override the check: the gate's real verdict and the override are both on the record");
}

/* 8. THE RUNBOOK AND THE TOOL MUST NAME EACH OTHER. The weakest case in this file, and it is here
 *    for a measured reason: on 2026-09-02 the allowlist covered `bash scripts/deploy-staging.sh`
 *    while three documents taught `./scripts/deploy-staging.sh`, and nothing connected them, so a
 *    watch following its own documentation was refused. A tool nobody is told to run is CEO 95's
 *    finding about the Chartkeeper: "a ranking tool nobody runs does not clean your list." */
{
  const book = existsSync(RUNBOOK) ? readFileSync(RUNBOOK, "utf8") : "";
  if (!book) fail(".planning/wyclau/GLASS-UPDATE-SESSION.md is missing — the tick has no runbook to follow");
  else {
    if (!/node scripts\/wyclau\/glass_gate_log\.mjs/.test(book))
      fail("the runbook never names `node scripts/wyclau/glass_gate_log.mjs` — the wrapper exists and nobody is told to run it, so no tick is any more auditable than before");
    else pass("the runbook's tick step names the wrapper by the exact command that exists");

    const skipClause = /regardless of what this says|skip(?:ping)? (?:the |this )?(?:check|gate)/i.exec(book);
    if (skipClause)
      fail(`the runbook still grants a skip of the CHECK ("${skipClause[0]}") — the override must land on the action, not on whether the gate runs`);
    else pass("the runbook grants no skip of the check itself — only of the decision it returns");
  }
}

console.log(failures === 0 ? "\nPASS" : `\nFAIL (${failures})`);
process.exit(failures === 0 ? 0 : 1);
