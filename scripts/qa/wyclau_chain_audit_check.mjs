#!/usr/bin/env node
/* wyclau_chain_audit_check.mjs — the RED half of the 2026-09-01 chain audit.
 *
 * WHY THIS EXISTS, AND WHY IT WAS WRITTEN BEFORE THE FIXES. Wyatt, 2026-09-01: "There is a problem
 * with the chain of command. When I intervene with bosun, it stops him from being in a loop... And
 * watchdog fails to recognize it or restart him on the chart work after. Also, bosun needs a way to
 * update glass more frequently. And run sea trials without turning off watchdog." He approved all
 * five fixes from the audit (https://claude.ai/code/artifact/a639d17d-60d3-4947-a0d6-c020111be8ed)
 * and ruled that the Quartermaster writes the failing checks while the Bosun writes the fixes --
 * so that step 1 of the four steps (SHOW IT BROKEN) is a separate hand from step 2, rather than a
 * step the fixing session promises it took.
 *
 * ⚠ THIS GATE IS EXPECTED TO FAIL WHEN IT LANDS. That is its whole job. Run it by name:
 *     npm run test:wyclau-audit
 * Turning it green is the definition of done for the five fixes; when it is green, MOVE IT INTO THE
 * `npm test` CHAIN and bump gates.total/ceiling in the same edit.
 *
 * ⚠ CORRECTION, CEO REVIEW 56, IN THE OPEN. The first version of this header said the gate was wired
 * into `npm test` "deliberately: a gate parked outside the chain is decorative, which is precisely
 * the defect CEO Review 52 found". BOTH HALVES WERE WRONG, and the reviewer caught it. Review 52's
 * finding was the OPPOSITE — the Glass publish-lag check had been wired INTO `npm test`, "which
 * meant a stale WYCLAU DASHBOARD could block a real GAME fix from reaching players through the
 * release gate", and it was moved OUT for exactly that reason (.planning/CEO-REVIEWS.md, and the
 * stop hook's own brake-1 header records the move). The decorative-gate finding was Review 46's,
 * which was never recorded and is noted in the record as lost. So this commit cited the review that
 * FORBIDS this placement as its licence to do it, and the consequence was live rather than
 * theoretical: the Chart's top open item is a sea trial of a real game fix headed for staging, and
 * CLAUDE.md §6 requires `npm test` exit 0 before deploy-staging.sh. A knowingly-red wyclau dashboard
 * gate in the release chain would have blocked a game fix from reaching players — the precise fault
 * this project has already paid for once.
 *
 * THE ONE ARCHITECTURAL MOVE THIS GATE ENCODES, and it is the reason the contracts below are node
 * scripts rather than PowerShell branches: TODAY THE WATCHDOG'S JUDGEMENT CANNOT BE TESTED. It is
 * written in PowerShell, so no check that runs in the cloud, in CI, or on a Mac can execute it, and
 * the only instrument available is grepping the script for strings -- exactly the "instrument that
 * measures something other than what it names" this project keeps paying for. Moving the DECISIONS
 * into small node helpers, and leaving PowerShell as the shim that runs them and acts on an exit
 * code, converts three untestable fixes into three testable ones. The one genuinely
 * platform-specific fact -- is a claude.exe with `-p /door` running -- stays in PowerShell and is
 * passed IN as a flag.
 *
 * WHAT THIS GATE CAN AND CANNOT SEE:
 *   CAN see:    the behaviour of every node helper below, driven as a real subprocess against real
 *               fixture directories -- exit codes, not source text; the real Stop hook's decisions,
 *               driven the same way; and whether watchdog.ps1 still writes HEARTBEAT in its own
 *               launch path.
 *   CANNOT see: whether watchdog.ps1 actually CALLS these helpers, or acts on their exit codes.
 *               PowerShell cannot be executed here. That half is proved on the Razer, by running a
 *               real tick and reading restarts.log -- and it is the Bosun's to prove, not this
 *               gate's to claim.
 */
"use strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const failures = [];
let passCount = 0;

function check(label, cond, detail) {
  if (cond) { passCount++; console.log(`PASS -- ${label}`); }
  else { failures.push(`${label}${detail ? `: ${detail}` : ""}`); console.error(`FAIL -- ${label}${detail ? `: ${detail}` : ""}`); }
}

const iso = (minsAgo) => new Date(Date.now() - minsAgo * 60000).toISOString();

function mkFixture(name) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `wyclau-${name}-`));
  fs.mkdirSync(path.join(dir, ".planning", "wyclau"), { recursive: true });
  return dir;
}
const cleanups = [];
function fixture(name) { const d = mkFixture(name); cleanups.push(d); return d; }

/* Run a repo script as a real subprocess. Returns {code, out, err, missing}. `missing` is the
 * honest distinction between "the contract is not built yet" and "it is built and answered wrong" —
 * without it every failure below reads identically and the Bosun cannot tell which it is. */
function runScript(rel, args) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) return { missing: true, code: null, out: "", err: "" };
  const r = spawnSync(process.execPath, [abs, ...args], { encoding: "utf8" });
  return { missing: false, code: r.status, out: (r.stdout || "").trim(), err: (r.stderr || "").trim() };
}

function expectExit(label, rel, args, want) {
  const r = runScript(rel, args);
  if (r.missing) { check(label, false, `${rel} does not exist yet — this contract is unbuilt`); return; }
  check(label, r.code === want, `expected exit ${want}, got ${r.code}${r.out ? ` (stdout: ${r.out})` : ""}`);
}

console.log("wyclau chain audit — the five approved fixes, checked by behaviour where possible\n");

/* ------------------------------------------------------------------------------------------------
 * FIX 1 — the long-run marker replaces the fake heartbeat.
 *
 * CONTRACT: `node scripts/wyclau/longrun_status.mjs --dir=<repo>` exits
 *     2 = no marker; nothing long-running; the watchdog judges normally
 *     0 = a long run is genuinely progressing; HOLD OFF
 *     1 = a long run exists but has STALLED, or its marker is unreadable; do NOT hold off
 *
 * The marker is .planning/wyclau/LONG-RUN, JSON, written BY THE LONG JOB ITSELF as it progresses:
 *   { "what", "startedAt", "updatedAt", "progress", "staleAfterMinutes" }
 * `staleAfterMinutes` is written by the job, not hardcoded here — a sea trial's leg time and a
 * determinism re-record's are not the same number, and CLAUDE.md rule 9 says a threshold that
 * cannot be right for both must be derived by whoever knows (docs/QA-PROCESS.md).
 *
 * THE ASSERTION THAT MATTERS MOST IS THE LAST ONE. A marker that is missing fields, malformed, or
 * dated in the future must resolve to 1 (do not hold off), never 0. A hold-off that a broken file
 * can make permanent IS the Monitor bug of 2026-08-31 rebuilt in a new place: the timer heartbeat
 * blinded the watchdog for 2h31m during the very exit test meant to prove no silent stalls.
 * ---------------------------------------------------------------------------------------------- */
{
  const LR = "scripts/wyclau/longrun_status.mjs";

  const none = fixture("lr-none");
  expectExit("longrun: no marker -> exit 2 (watchdog judges normally)", LR, [`--dir=${none}`], 2);

  const live = fixture("lr-live");
  fs.writeFileSync(path.join(live, ".planning/wyclau/LONG-RUN"), JSON.stringify({
    what: "sea trial, 10 legs", startedAt: iso(50), updatedAt: iso(2), progress: 6, staleAfterMinutes: 20,
  }));
  expectExit("longrun: progressing marker -> exit 0 (hold off)", LR, [`--dir=${live}`], 0);

  const stalled = fixture("lr-stalled");
  fs.writeFileSync(path.join(stalled, ".planning/wyclau/LONG-RUN"), JSON.stringify({
    what: "sea trial, 10 legs", startedAt: iso(200), updatedAt: iso(45), progress: 3, staleAfterMinutes: 20,
  }));
  expectExit("longrun: marker frozen past its own staleAfterMinutes -> exit 1 (STALLED, restart)", LR, [`--dir=${stalled}`], 1);

  const broken = fixture("lr-broken");
  fs.writeFileSync(path.join(broken, ".planning/wyclau/LONG-RUN"), "{ this is not json");
  expectExit("longrun: MALFORMED marker -> exit 1, never a permanent hold-off", LR, [`--dir=${broken}`], 1);

  // ⚠ CEO REVIEW 56: the comment above calls a marker with MISSING FIELDS the case that matters
  // most, and then never tested it. The reviewer fed a marker with no staleAfterMinutes, 24 hours
  // stale, to a plausible implementation and got exit 0 — hold off forever, the exact unfalsifiable
  // hold-off this contract forbids.
  const missingFields = fixture("lr-missing");
  fs.writeFileSync(path.join(missingFields, ".planning/wyclau/LONG-RUN"), JSON.stringify({
    what: "sea trial", startedAt: iso(1500), updatedAt: iso(1440), progress: 2,
  }));
  expectExit("longrun: marker MISSING staleAfterMinutes -> exit 1, not an indefinite hold-off", LR, [`--dir=${missingFields}`], 1);

  /* ⚠ MY OWN CONTRACT WAS WRONG HERE, AND WYATT'S restarts.log CAUGHT IT, 2026-09-01.
     Five consecutive hold-offs, 10:16Z to 10:56Z, all reading: long run "sea trial, 10 legs" is
     progressing (0/10 legs), last moved 11 ... 51 min ago. The leg counter never moved off ZERO
     and the engine was held off for 51 minutes anyway, because the test I specified was "is
     updatedAt recent", which is a FRESHNESS test wearing a PROGRESS test's name. That is the
     timer-versus-evidence fault this whole audit was about, one level down, in the fix for it.

     SO THE MARKER CARRIES TWO CLOCKS AND THEY MEAN DIFFERENT THINGS: `updatedAt` moves whenever
     the job touches the file at all, and `progressAt` moves ONLY when `progress` actually
     increases. Staleness is judged on progressAt. A job that is alive but achieving nothing must
     read as stalled, because from the watchdog's side those are the same thing. */
  const busyButFrozen = fixture("lr-busy-frozen");
  fs.writeFileSync(path.join(busyButFrozen, ".planning/wyclau/LONG-RUN"), JSON.stringify({
    what: "sea trial, 10 legs", startedAt: iso(70), updatedAt: iso(1),
    progressAt: iso(51), progress: 0, staleAfterMinutes: 20,
  }));
  expectExit(
    "longrun: file touched a minute ago but progress FROZEN at 0 for 51 min -> exit 1 (this is Wyatt's 10:16-10:56Z log)",
    LR, [`--dir=${busyButFrozen}`], 1
  );

  // The converse, so the check above cannot be satisfied by a script that simply always says 1.
  const genuinelyMoving = fixture("lr-moving");
  fs.writeFileSync(path.join(genuinelyMoving, ".planning/wyclau/LONG-RUN"), JSON.stringify({
    what: "sea trial, 10 legs", startedAt: iso(70), updatedAt: iso(1),
    progressAt: iso(4), progress: 6, staleAfterMinutes: 20,
  }));
  expectExit(
    "longrun: progress advanced 4 min ago -> exit 0 (hold off), so the frozen case is discriminating",
    LR, [`--dir=${genuinelyMoving}`], 0
  );

  const future = fixture("lr-future");
  fs.writeFileSync(path.join(future, ".planning/wyclau/LONG-RUN"), JSON.stringify({
    what: "clock skew", startedAt: iso(10), updatedAt: new Date(Date.now() + 3600e3).toISOString(),
    progress: 1, staleAfterMinutes: 20,
  }));
  expectExit("longrun: marker dated in the FUTURE -> exit 1, not an unfalsifiable hold-off", LR, [`--dir=${future}`], 1);
}

/* ------------------------------------------------------------------------------------------------
 * FIX 3 — the watchdog learns PROGRESS, not just life.
 *
 * CONTRACT: `node scripts/wyclau/should_launch.mjs --dir=<repo> --engine=<running|absent>`
 *     exit 0 = LAUNCH an engine, exit 1 = hold off. One plain-English reason on stdout either way.
 * `--engine` is passed in because "is a claude.exe with -p /door alive" is the one genuinely
 * Windows-only fact in the whole decision; keeping it a flag is what makes the rest testable here.
 *
 * THE CORE CASE IS THE FIRST ONE, and it is the fault Wyatt actually reported: he steers a session,
 * that session stamps LAST-ACTIVITY through wyclau-pulse.cjs on every tool call, and the watchdog
 * reads a fresh timestamp and holds off (watchdog.ps1:91, :103, :115) while the Chart does not move.
 * A recent tool call is not progress. A commit is. Human presence may buy a hold-off only while
 * commits are still landing.
 * ---------------------------------------------------------------------------------------------- */
{
  const SL = "scripts/wyclau/should_launch.mjs";

  // A fixture git repo whose newest commit is old, with LAST-ACTIVITY deliberately fresh.
  const stale = fixture("sl-stale-chart");
  const git = (d, ...a) => spawnSync("git", ["-C", d, ...a], { encoding: "utf8" });
  git(stale, "init", "-q");
  git(stale, "config", "user.email", "gate@example.com");
  git(stale, "config", "user.name", "gate");
  fs.writeFileSync(path.join(stale, "seed.txt"), "seed\n");
  git(stale, "add", "-A");
  spawnSync("git", ["-C", stale, "commit", "-q", "-m", "seed"], {
    encoding: "utf8",
    env: { ...process.env, GIT_AUTHOR_DATE: iso(180), GIT_COMMITTER_DATE: iso(180) },
  });
  fs.writeFileSync(path.join(stale, ".planning/wyclau/LAST-ACTIVITY"), `${iso(1)}\ta session made a tool call here\n`);

  expectExit(
    "should_launch: no commit for 3h + no engine -> exit 0 (LAUNCH), even with LAST-ACTIVITY one minute old",
    SL, [`--dir=${stale}`, "--engine=absent"], 0
  );

  expectExit(
    "should_launch: same stale Chart but an engine IS running -> exit 1 (hold off, do not stack a second)",
    SL, [`--dir=${stale}`, "--engine=running"], 1
  );

  // Fresh commit: work is landing, so hold off whether or not a process is visible.
  const fresh = fixture("sl-fresh-chart");
  git(fresh, "init", "-q");
  git(fresh, "config", "user.email", "gate@example.com");
  git(fresh, "config", "user.name", "gate");
  fs.writeFileSync(path.join(fresh, "seed.txt"), "seed\n");
  git(fresh, "add", "-A");
  git(fresh, "commit", "-q", "-m", "seed");
  expectExit(
    "should_launch: a commit landed minutes ago -> exit 1 (hold off; the Chart is moving)",
    SL, [`--dir=${fresh}`, "--engine=absent"], 1
  );

  // A live long run outranks a stale commit clock: a trial legitimately produces no commits.
  const during = fixture("sl-during-trial");
  git(during, "init", "-q");
  git(during, "config", "user.email", "gate@example.com");
  git(during, "config", "user.name", "gate");
  fs.writeFileSync(path.join(during, "seed.txt"), "seed\n");
  git(during, "add", "-A");
  spawnSync("git", ["-C", during, "commit", "-q", "-m", "seed"], {
    encoding: "utf8",
    env: { ...process.env, GIT_AUTHOR_DATE: iso(180), GIT_COMMITTER_DATE: iso(180) },
  });
  fs.writeFileSync(path.join(during, ".planning/wyclau/LONG-RUN"), JSON.stringify({
    what: "sea trial", startedAt: iso(60), updatedAt: iso(2), progress: 7, staleAfterMinutes: 20,
  }));
  // ⚠ CEO REVIEW 56 FIXED THIS CASE. It passed `--engine=running`, which the case four lines above
  // already establishes as an unconditional hold-off — so the two were indistinguishable and a
  // should_launch.mjs that NEVER OPENS the LONG-RUN file passed both. The reviewer proved it by
  // writing exactly that implementation. `--engine=absent` is the only form that forces the marker
  // to be consulted: without it, the whole long-run mechanism can be built, wired to nothing, and
  // the gate still goes green — which would leave Wyatt's "run sea trials without turning off
  // watchdog" unfixed with a green suite saying otherwise.
  expectExit(
    "should_launch: stale commits, NO engine, but a PROGRESSING long run -> exit 1 (only the marker can explain this)",
    SL, [`--dir=${during}`, "--engine=absent"], 1
  );
}

/* ------------------------------------------------------------------------------------------------
 * FIX 4 — the Glass may be published by someone else once it has gone stale.
 *
 * CONTRACT: `node scripts/wyclau/may_publish.mjs --dir=<repo>` exits 0 = this session MAY publish,
 * 1 = defer to the Bosun. The one-publisher ruling (2026-08-31) stands as the default and is only
 * overridden by measured staleness — the failure it was written against was two sessions publishing
 * within five minutes, not a session rescuing a page that has stopped moving.
 * ---------------------------------------------------------------------------------------------- */
{
  const MP = "scripts/wyclau/may_publish.mjs";

  const fresh = fixture("mp-fresh");
  fs.writeFileSync(path.join(fresh, ".planning/wyclau/HEARTBEAT"), `${iso(3)}\tworking\n`);
  fs.writeFileSync(path.join(fresh, ".planning/wyclau/LAST-PUBLISH"), `${iso(4)}\tpublished\n`);
  expectExit("may_publish: page is current -> exit 1 (defer; one publisher stands)", MP, [`--dir=${fresh}`], 1);

  const stalePage = fixture("mp-stale");
  fs.writeFileSync(path.join(stalePage, ".planning/wyclau/HEARTBEAT"), `${iso(2)}\tworking\n`);
  fs.writeFileSync(path.join(stalePage, ".planning/wyclau/LAST-PUBLISH"), `${iso(95)}\tpublished\n`);
  expectExit("may_publish: pulse 90+ min newer than the last publish -> exit 0 (rescue it)", MP, [`--dir=${stalePage}`], 0);

  const neverPublished = fixture("mp-never");
  fs.writeFileSync(path.join(neverPublished, ".planning/wyclau/HEARTBEAT"), `${iso(30)}\tworking\n`);
  expectExit("may_publish: pulses exist but nothing was ever published -> exit 0", MP, [`--dir=${neverPublished}`], 0);

  // ⚠ CEO REVIEW 56 ADDED THIS, AND IT IS THE CASE THAT MATTERS. Without it the threshold was
  // unpinned anywhere between 1 and 93 minutes, and a 60-minute implementation passed all three
  // checks above. That is not merely loose — it DEADLOCKS. The stop hook's brake 1 refuses to let
  // a session stop while the pulse is more than PUBLISH_LAG_THRESHOLD_MIN (20) newer than the last
  // publish. Pick any may_publish threshold above 20 and there is a live window — a 25-minute gap —
  // where brake 1 says "you may not stop until you publish" and may_publish says "defer, you may
  // not publish". The session can then do neither. So the threshold is DERIVED from the brake's,
  // not typed a second time (CLAUDE.md rule 9): whenever brake 1 would hold a session, somebody
  // must be permitted to publish.
  const deadlockBand = fixture("mp-deadlock-band");
  fs.writeFileSync(path.join(deadlockBand, ".planning/wyclau/HEARTBEAT"), `${iso(1)}\tworking\n`);
  fs.writeFileSync(path.join(deadlockBand, ".planning/wyclau/LAST-PUBLISH"), `${iso(26)}\tpublished\n`);
  expectExit(
    "may_publish: a 25 min lag -- past brake 1's 20 min hold -- MUST permit a publish, or the hook deadlocks",
    MP, [`--dir=${deadlockBand}`], 0
  );
}

/* ------------------------------------------------------------------------------------------------
 * FIX 2 — the loop gate moves from WHO LAUNCHED THIS to IS THIS SESSION WORKING.
 *
 * The Stop hook currently exits on its first line unless PP_BOSUN=1 (a gate the Quartermaster
 * recommended on 2026-08-31 and which this audit found to be on the wrong axis). The consequence is
 * exactly what Wyatt reported: he steers a session, that session is not watchdog-started, so the
 * loop is switched off in the very session carrying his instruction — one task, then a stop.
 *
 * NEW CONTRACT: a session is WORKING if HEAD has moved since its recorded session-base
 * (.claude/hooks/.read-state/<session_id>/session-base, written by session-base.cjs) OR the working
 * tree is dirty. A working session with unblocked Chart work must be blocked from stopping, whether
 * or not PP_BOSUN is set. A session that has changed nothing is talking, and may stop.
 *
 * ⚠ THIS CONTRADICTS A CURRENTLY-PASSING ASSERTION, ON PURPOSE, AND THAT IS THE HANDOVER NOTE:
 * scripts/qa/wyclau_stop_hook_check.mjs asserts "PP_BOSUN unset -> never blocks even with unblocked
 * Chart work present". That assertion locks in the behaviour being removed. It must be rewritten in
 * the SAME commit as the fix, or the suite contradicts itself and one of the two gates is a lie.
 * CLAUDE.md, rule 9's trap: list what reads a quantity, gates included, before changing how it is
 * produced.
 * ---------------------------------------------------------------------------------------------- */
{
  const HOOK = path.join(ROOT, ".claude", "hooks", "wyclau-stop-keep-working.cjs");

  function runHook(dir, env, stdin) {
    const r = spawnSync(process.execPath, [HOOK], {
      input: JSON.stringify(stdin), encoding: "utf8",
      env: { ...process.env, CLAUDE_PROJECT_DIR: dir, ...env },
      cwd: dir,
    });
    return (r.stdout || "").trim();
  }

  function workingRepo(name, { dirty }) {
    const d = fixture(name);
    const git = (...a) => spawnSync("git", ["-C", d, ...a], { encoding: "utf8" });
    git("init", "-q"); git("config", "user.email", "gate@example.com"); git("config", "user.name", "gate");
    fs.writeFileSync(path.join(d, "seed.txt"), "seed\n");
    git("add", "-A"); git("commit", "-q", "-m", "seed");
    const base = spawnSync("git", ["-C", d, "rev-parse", "HEAD"], { encoding: "utf8" }).stdout.trim();
    // One unblocked Chart item, so brake 3 cannot be the reason for any verdict below.
    fs.writeFileSync(path.join(d, ".planning", "CHART.md"),
      "## STEP 1 CHECKLIST\n\n- [ ] a real, unblocked item\n- [x] a done one\n\n## SOMETHING ELSE\n");
    // A publish that is current, so brake 1 cannot be the reason either.
    fs.writeFileSync(path.join(d, ".planning/wyclau/HEARTBEAT"), `${iso(2)}\tworking\n`);
    fs.writeFileSync(path.join(d, ".planning/wyclau/LAST-PUBLISH"), `${iso(3)}\tpublished\n`);
    const sess = "gatesession";
    const sdir = path.join(d, ".claude", "hooks", ".read-state", sess);
    fs.mkdirSync(sdir, { recursive: true });
    if (dirty) {
      // HEAD unchanged, but this session has edited the tree — still working.
      fs.writeFileSync(path.join(sdir, "session-base"), base + "\n");
      fs.writeFileSync(path.join(d, "seed.txt"), "seed, edited by this session\n");
    } else {
      // A commit landed since the session started: session-base is the PARENT of HEAD.
      fs.writeFileSync(path.join(sdir, "session-base"), "0".repeat(40) + "\n");
    }
    return { dir: d, session_id: sess };
  }

  const committed = workingRepo("hook-committed", { dirty: false });
  const outCommitted = runHook(committed.dir, {}, { session_id: committed.session_id });
  check(
    "loop gate: NO PP_BOSUN, but this session committed + unblocked Chart work -> must BLOCK",
    /"decision"\s*:\s*"block"/.test(outCommitted),
    outCommitted ? `got: ${outCommitted.slice(0, 160)}` : "got nothing — the hook exited on the PP_BOSUN gate"
  );

  const dirtyRepo = workingRepo("hook-dirty", { dirty: true });
  const outDirty = runHook(dirtyRepo.dir, {}, { session_id: dirtyRepo.session_id });
  check(
    "loop gate: NO PP_BOSUN, uncommitted edits by this session + unblocked Chart work -> must BLOCK",
    /"decision"\s*:\s*"block"/.test(outDirty),
    outDirty ? `got: ${outDirty.slice(0, 160)}` : "got nothing — the hook exited on the PP_BOSUN gate"
  );

  // The other half of the contract, and the brake that keeps Wyatt's own terminal usable: a session
  // that changed nothing is having a conversation, and must be allowed to end its turn.
  const clean = fixture("hook-clean");
  {
    const git = (...a) => spawnSync("git", ["-C", clean, ...a], { encoding: "utf8" });
    git("init", "-q"); git("config", "user.email", "gate@example.com"); git("config", "user.name", "gate");
    fs.writeFileSync(path.join(clean, "seed.txt"), "seed\n");
    git("add", "-A"); git("commit", "-q", "-m", "seed");
    const base = spawnSync("git", ["-C", clean, "rev-parse", "HEAD"], { encoding: "utf8" }).stdout.trim();
    // ⚠ CEO REVIEW 56 REBUILT THIS FIXTURE. It used to write CHART.md and session-base AFTER the
    // commit, leaving untracked files — so `git status --porcelain` was non-empty and a CORRECT
    // implementation of "dirty tree means working" FAILED here. The cheapest escape from that would
    // have been to narrow "dirty" to tracked files only, which blinds the hook to a session whose
    // entire output is NEW FILES — the commonest shape of work in this repo (every gate is a new
    // file, this one included). So the fixture is fixed instead of the contract being weakened.
    // .read-state is ignored here exactly as it is in the real repo (.gitignore:17).
    fs.writeFileSync(path.join(clean, ".gitignore"), ".claude/hooks/.read-state/\n");
    fs.mkdirSync(path.join(clean, ".planning"), { recursive: true });
    fs.writeFileSync(path.join(clean, ".planning", "CHART.md"),
      "## STEP 1 CHECKLIST\n\n- [ ] a real, unblocked item\n");
    git("add", "-A"); git("commit", "-q", "-m", "chart and ignores");
    const base2 = spawnSync("git", ["-C", clean, "rev-parse", "HEAD"], { encoding: "utf8" }).stdout.trim();
    const sdir = path.join(clean, ".claude", "hooks", ".read-state", "gatesession");
    fs.mkdirSync(sdir, { recursive: true });
    fs.writeFileSync(path.join(sdir, "session-base"), base2 + "\n");
    const porcelain = spawnSync("git", ["-C", clean, "status", "--porcelain"], { encoding: "utf8" }).stdout.trim();
    check("the 'changed nothing' fixture is genuinely git-clean (else it tests the opposite of its label)",
      porcelain === "", `git status --porcelain returned: ${porcelain}`);
  }
  // ⚠ VACUOUS TODAY, AND SAYING SO IS THE POINT. With PP_BOSUN unset the hook exits on its first
  // line, so this passes for a reason that has nothing to do with what it claims to protect. It
  // only becomes a real assertion once the gate above moves to "is this session working" — at
  // which point it is the brake that keeps Wyatt's own terminal usable. Recorded here rather than
  // left to look like coverage: a check that cannot fail is not a check (CLAUDE.md, rule 6).
  const outClean = runHook(clean, {}, { session_id: "gatesession" });
  check(
    "loop gate: a session that changed NOTHING is talking, not working -> must ALLOW the stop" +
      " [VACUOUS until the gate moves — passes today only because PP_BOSUN is unset]",
    outClean === "",
    `got: ${outClean.slice(0, 160)}`
  );
}

/* ------------------------------------------------------------------------------------------------
 * FIX 5a — brake 1 (the publish lag) gets a give-up.
 *
 * Brakes 2 and 3 can both end a turn: a stuck item gives up after three blocks, an all-GATED Chart
 * allows the stop. Brake 1 has neither — it blocks and returns before the counter is ever touched,
 * so a session that cannot publish is refused every stop with nothing to stop it. The hook's own
 * header says a hung session is worse than an early stop; brake 1 is the one place that is not
 * honoured. Same shape as brake 2: block three times, give up on the fourth and say so.
 * ---------------------------------------------------------------------------------------------- */
{
  const HOOK = path.join(ROOT, ".claude", "hooks", "wyclau-stop-keep-working.cjs");
  const d = fixture("brake1-giveup");
  const git = (...a) => spawnSync("git", ["-C", d, ...a], { encoding: "utf8" });
  git("init", "-q"); git("config", "user.email", "gate@example.com"); git("config", "user.name", "gate");
  fs.writeFileSync(path.join(d, "seed.txt"), "seed\n");
  git("add", "-A"); git("commit", "-q", "-m", "seed");
  fs.writeFileSync(path.join(d, ".planning", "CHART.md"), "## STEP 1 CHECKLIST\n\n- [ ] an item\n");
  // A pulse far newer than the last publish: brake 1 fires, and nothing else can.
  fs.writeFileSync(path.join(d, ".planning/wyclau/HEARTBEAT"), `${iso(1)}\tworking\n`);
  fs.writeFileSync(path.join(d, ".planning/wyclau/LAST-PUBLISH"), `${iso(90)}\tpublished\n`);

  const outs = [];
  for (let i = 0; i < 4; i++) {
    const r = spawnSync(process.execPath, [HOOK], {
      input: JSON.stringify({ session_id: "gatesession" }), encoding: "utf8",
      env: { ...process.env, CLAUDE_PROJECT_DIR: d, PP_BOSUN: "1" }, cwd: d,
    });
    outs.push((r.stdout || "").trim());
  }
  check("brake 1: blocks the first three times on an unpublishable page",
    outs.slice(0, 3).every((o) => /"decision"\s*:\s*"block"/.test(o)),
    `got: ${outs.slice(0, 3).map((o) => o.slice(0, 40)).join(" | ")}`);
  check("brake 1: GIVES UP on the 4th rather than refusing every stop forever",
    outs[3] === "",
    `got: ${outs[3].slice(0, 200)}`);
}

/* ------------------------------------------------------------------------------------------------
 * FIX 5b — the launch stamp is written by the engine, not by the launcher.
 *
 * watchdog.ps1 stamps HEARTBEAT itself the moment it launches ("relaunched by watchdog; engine
 * orienting"), and a 25-minute launch grace then holds off on that stamp. So a launch that FAILS
 * leaves a fresh heartbeat no engine wrote, and the next several ticks believe it. Structural check
 * only — and it says so, because a string in a file is not behaviour.
 * ---------------------------------------------------------------------------------------------- */
{
  // ⚠ CEO REVIEW 56: the first version matched /Set-Content\s+\$heartbeat/, and the reviewer evaded
  // it in one rewrite -- `Set-Content -Path $heartbeat -Value "..."`, identical behaviour, check
  // PASSES. That form is not hypothetical; it is the house style two lines later at watchdog.ps1's
  // own $lastLaunch write. So key on ANY write to $heartbeat ANYWHERE IN THE LAUNCH BLOCK -- from
  // Start-Process to the end of that try -- rather than on one spelling of one cmdlet.
  const ps = fs.readFileSync(path.join(ROOT, "scripts", "wyclau", "watchdog.ps1"), "utf8");
  const launchIdx = ps.indexOf("Start-Process");
  const launchBlock = launchIdx === -1 ? "" : ps.slice(launchIdx);
  // Any cmdlet that writes a file, in any argument order, naming $heartbeat.
  const WRITES_HEARTBEAT = /(Set-Content|Add-Content|Out-File|Tee-Object)[^\n]*\$heartbeat/;
  check(
    "watchdog.ps1 no longer writes HEARTBEAT anywhere in its launch path (structural check, not behavioural)",
    launchIdx !== -1 && !WRITES_HEARTBEAT.test(launchBlock),
    launchIdx === -1
      ? "could not find Start-Process — the launch block could not be located, so this check proves nothing"
      : "the launcher still writes HEARTBEAT after Start-Process, vouching for an engine that may not have started"
  );
  // Red-proof, in BOTH spellings the reviewer used — a pattern that only catches the form we
  // happen to have written today is a check that its own fix can walk around.
  check(
    "the launch-stamp assertion catches both spellings (red-proof)",
    WRITES_HEARTBEAT.test('Set-Content $heartbeat "x"') &&
    WRITES_HEARTBEAT.test('Set-Content -Path $heartbeat -Value "x"') &&
    !WRITES_HEARTBEAT.test('Set-Content -Path $lastLaunch -Value $now')
  );
}

for (const d of cleanups) { try { fs.rmSync(d, { recursive: true, force: true }); } catch { /* best effort */ } }

console.log("");
if (failures.length) {
  console.error(`FAIL wyclau chain audit — ${failures.length} of ${failures.length + passCount} checks failing:`);
  for (const f of failures) console.error(`  - ${f}`);
  console.error("\nThis gate is the RED half of the 2026-09-01 chain audit and is expected to fail until");
  console.error("all five approved fixes are in. Turning it green is what 'done' means for them.");
  process.exit(1);
}
console.log(`PASS wyclau chain audit — all ${passCount} checks green.`);
process.exit(0);
