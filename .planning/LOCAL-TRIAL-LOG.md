# Local sea trial — 2026-08-28, Wyatt's Mac

Run by the local session on `claude/cloud-handoff-planning-a9ay1u`, answering
[`HANDOFF-2026-08-28-LOCAL-TRIAL.md`](HANDOFF-2026-08-28-LOCAL-TRIAL.md). Report:
[`SEA-TRIAL-LOCAL.md`](SEA-TRIAL-LOCAL.md). The cloud's own run is
[`SEA-TRIAL.md`](SEA-TRIAL.md) and was left untouched.

Both runs sailed the **same build, `2026.08.28.4`**, the same 10-leg FULL matrix, gear derived
(never forced) on both.

> **THE BUILD THIS RUN ACTUALLY MEASURED IS `1db8e2ad`, NOT "`2026.08.28.4`".** The stamp is no
> longer a unique identity — see finding 5. Quote the sha when quoting this report.

---

## THE COMPARISON

| | cloud (container) | local Mac (Wyatts-MacBook-Air.local) |
|---|---|---|
| total minutes | **91** | **119** |
| legs sailed | 10 of 10 | 10 of 10 |
| voyages NOT RUN | none | none |
| verdict | FAILED | FAILED |
| **WebKit relaunches** | **14** (11 + 2 + 1) | **0** |
| slowest leg | *(not recoverable — see note)* | `crew-desktop` 2456 s (40 min) |
| screens judged | — | 267, of which 2 timed out |

**Per-leg wall time, local** (first to last mention in `sea-trial-shots/log.txt`; `--parallel=2`,
so legs overlap and these sum to more than the total):

| leg | s | min |
|---|---|---|
| crew-desktop | 2456 | 40 |
| passplay-desktop | 1675 | 27 |
| passplay-phone | 1572 | 26 |
| crew-phone | 1496 | 24 |
| solo-tablet-wk | 1214 | 20 |
| solo-tablet | 1179 | 19 |
| solo-desktop | 1069 | 17 |
| solo-phone | 1031 | 17 |
| solo-phone-wk | 1009 | 16 |
| solo-desktop-wk | 912 | 15 |

**The cloud's per-leg times cannot be recovered.** `SEA-TRIAL.md` embeds only the last 60 lines of
its log and `sea-trial-shots/` is not committed, so every cloud leg summary carries the same
end-of-run stamp `[5464s]`. Only the 91-minute total is comparable. **Not stated as a comparison
where the data does not exist.**

---

## THE ROW THAT MATTERED: WebKit is container-only. CONFIRMED.

The cloud's three Safari-engine legs needed **14 relaunches** between them to finish at all —
`solo-desktop-wk` alone crashed **11 times**. Diagnosed there by core dump: SIGSEGV inside
`libWPEWebKit`'s own compositing walk.

**On this Mac: zero.** No `WPEWebProcess died`, no `Target crashed`, no `✱ relaunch`, and no hang —
searched across the whole 7127-second log, not sampled. All three legs sailed their voyages
straight through.

**So the diagnosis holds: it is the Linux WPE port, not WebKit as the game meets it.** macOS
Playwright WebKit does not use that backend. A Safari-family regression seen only in a container is
an artefact of the container until it reproduces here.

---

## THE PREDICTIONS, SCORED AGAINST WHAT HAPPENED

Written before the WebKit legs sailed, kept so it could not be retrofitted.

| # | prediction | outcome |
|---|---|---|
| 1 | wk legs finish with ZERO relaunches and ZERO hangs | **RIGHT** — 0 of each, all three legs |
| 2 | local total LOWER than the cloud's | **WRONG** — local 119 min vs cloud 91. Local was 31% *slower* |
| 3 | Chrome legs fail on the same known families, no new class | **RIGHT on families, with one real difference** (below) |

**Why #2 was wrong, since a miss with no cause is not a lesson.** The reasoning was "a capped
container should lose to a laptop." What that ignored is that the container had its machine to
itself, while this Mac was concurrently running an interactive Claude session, a *second* local
Claude session, and the judge's own `claude -p` subprocesses. **The comparison is not
container-vs-Mac; it is quiet-machine-vs-busy-machine.** A like-for-like timing number needs an
otherwise idle laptop, and this run is not that.

---

## THE ONE REAL DIFFERENCE: local `crew-desktop` did not finish

Local `crew-desktop` reports **"did not finish the voyage"** — 40 minutes, the longest leg, 49
screens caught mid-animation. The cloud's `crew-desktop` finished.

**Not folded into a pass, and not claimed as a game defect either.** It matches a pattern already
on the record: 2026-08-28 07:30 and 07:57 in [`CTO-LEDGER.md`](CTO-LEDGER.md) — a crew leg that
overran the driver budget under CPU contention, then completed normally when run alone on a quiet
machine, recorded as environmental with the cause explicitly unexplained. Same shape here, on a
machine measurably busier. **Unproven either way; it needs a crew-desktop leg alone on a quiet
laptop to settle, which this session did not run.**

Every other failure on both machines is the same set: judge findings in known families, screens
that never stopped moving, and "offered but never exercised: walk away" (driver coverage, not the
game). **No failure class appears locally that is absent from the cloud run.**

---

## WHAT THIS RUN FOUND THAT WAS NOT ABOUT TIMING

### 1. The sea trial's eyes were being shut by this repo's own hook — fixed (`1db8e2ad`)

The first local attempt produced `judge ERROR: vision call timed out` on **every** screen — 75
calls, 0 verdicts — while the legs sailed on looking healthy.

The judge shells out to a child `claude -p` per screenshot. That child inherited the trial's cwd,
loaded this project's `.claude/settings.json`, and ran this project's hooks. Every call is a new
session id, so `playtest-checklist-last.cjs`'s once-per-session guard never applied: it fired on
all of them, blocked the Stop, and sent each judge off to write a staging checklist instead of
returning its verdict. Fingerprint: **73 `checklist-asked` marker dirs** in
`.claude/hooks/.read-state/`, stamped inside the failed run's window and none after it.

> *(That number read **75** until CEO Review 14 checked it. It had been typed from a coarser
> `ls | wc -l` rather than counted; the 73 above comes from actually testing each directory for
> the marker file. The repo's own rule — never hand-type a number that can be counted — and it
> was broken in the very finding that exists to warn about unverified claims.)*

Red-proofed both directions, same call, same image, cwd the only difference — from the repo it was
still running at 40 s; from a temp dir it answered in 37 s. Fixed by running the judge from
`os.tmpdir()`; `imgPath` was already absolute.

**After the fix, in this run: 267 screens judged, 2 timeouts, 0 new hook markers.** The two
timeouts are ordinary variance against the 120 s ceiling and are reported as `ERROR`, never as
passes.

**Why it is worse than a loud failure:** the hook decides by comparing **file mtimes**, which a
branch checkout reorders. The cloud's 12:11 run got 14 judge findings on this same code. So the
eyes can be open on one run and shut on the next with nothing announcing the difference.

### 2. `--report=` separates the reports; `sea-trial-shots/` is still shared

The cross-machine fix (`814650c5`) gives each machine its own report. It does **not** separate
`sea-trial-shots/`, still a hardcoded path — including the `report.json` that `sea_trial.mjs` reads
to decide *which legs actually sailed*.

That is harmless across machines. It is **not** harmless on one machine, and there were **two local
Claude sessions in this checkout tonight** (a second started ~15:37, commit `cd02d6d1` at 15:23).
Two local trials would overwrite each other's screenshots and each other's evidence of what sailed
— the same silent-overwrite class `814650c5` just fixed, one layer down. **Filed, not fixed: this
session was told not to change machinery mid-run.**

### 3. Collision proved, not theorised

Before the `--report=` flag existed, this session's run had already stamped `19:35:09Z` over the
cloud's `18:44:08Z` in `SEA-TRIAL.md`. Caught and restored from git before any push.

### 4. Attribution correction

The cloud's ledger and its message credit **this** session with the `physical-board/` staging-leak
catch. **That was not this session.** It was the other local session — commit `cd02d6d1`,
2026-08-28 15:23:53. Verified independently as a real hazard (57 MB, untracked, hidden only by
`.git/info/exclude`, which `rsync` never reads, while `deploy-staging.sh` derives its excludes from
the shared `.gitignore`) and now closed by an explicit `--exclude=physical-board/`. **The fix is
right; the credit is wrong, and a false line in this record rots exactly like a false one in the
code.**

---

### 5. GAME CODE MOVED WITHOUT THE BUILD STAMP MOVING — `2026.08.28.4` now names two games

Found while committing this report, not looked for.

`a4069ed2` (*"the page gradient is the only background behind the stage (W4-3)"*, 2026-08-28
21:04:34Z) **changes `index.html`** — game code a player sees. The stamp in the tree before it and
in the tree after it is the same string:

```
stamp in that commit's tree: PP4_STAMP = "2026.08.28.4"
stamp before it:             PP4_STAMP = "2026.08.28.4"
```

**So `2026.08.28.4` now denotes at least two different games**, and both this report and the
cloud's name it as though it were one. This trial measured `1db8e2ad`, which predates W4-3; the
change landed in this checkout only on the post-run `git pull --rebase`, so **the run itself is
sound** — but the label on it is not unique.

**Why this matters more than a tidiness complaint.** Rule 24 says "did you run the sea trial?" is
answered by opening the report and comparing its build stamp to the one in the game's ☰ menu.
That check silently stops working the moment one stamp covers two games: the menu will read
`2026.08.28.4`, the report will read `2026.08.28.4`, they will match, and they will be describing
different code. `GIT-AND-DEPLOY.md` §5 already made this argument for staging — *"the sha stayed
because it is what makes it a build identity"* — and this is the same hole one level up.

**Not fixed here** (this session was told not to change machinery, and the stamp is the cloud's to
bump mid-window). **Filed loudly instead**, and every claim in this document is pinned to
`1db8e2ad` rather than to the stamp.

---

## WHAT THIS RUN DOES NOT ESTABLISH

- **Not a clean timing comparison.** Busy machine vs idle container (above). The 119 vs 91 is real
  but it does not measure the environments.
- **Not a verdict on `crew-desktop`.** Unfinished locally, finished in the cloud, cause unproven.
- **84 screens were never looked at — not 2.** ⚠ **CORRECTED 2026-08-28 after CEO Review 14 caught
  this line understating the gap by a factor of forty.** The original sentence read *"Two screens
  were never judged"*, naming only the two that timed out. It ignored the cap: the judge looks at
  the **first 30 distinct screens of a leg only** (`JUDGE_CAP`, `scripts/playtest_gate.mjs:58`,
  applied at `:481`). The run **captured 349** screens and **submitted 267**, so **82 were never
  shown to the judge at all**, plus the 2 that errored.
  **The sharpest case is the leg that most needed eyes:** `crew-desktop` — the only leg that did
  not finish its voyage — captured **60** screens, had **30** judged, and all 30 came back PASS.
  It reads as visually clean. Half of it was never opened.
  **And the report cannot show you this**, because its per-leg lines say *"vision judge FAILED 4
  screen(s)"* with **no denominator**. The fix is one word of arithmetic — *"judged 30 of 60"* —
  and it is not this session's to make mid-window; filed here instead.
- **The judge is a witness, not a verdict** — its 26 findings here are untriaged by this session
  and map, on inspection, to families already triaged in the ledger's 13:20 entry.
