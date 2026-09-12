# HANDOFF — run the FULL sea trial LOCALLY on Wyatt's Mac, and time it

**For a fresh session running on the Mac** (`/Users/wyattroy/Documents/Projects/pastrypirates`).
Written 2026-08-28 by the cloud session that added the tablet legs and the WebKit crash-recovery.
The point of this run is twofold: prove the **local half** of "the full trial runs in Safari and
Chrome at the three sizes, cloud or local" (the cloud half is proven in the cloud session's
report), and produce a **timed, like-for-like comparison** of the two environments.

## 0. ⚠ YOU ARE NOT ALONE ON THIS BRANCH — read this first

**A cloud session is running a 24-hour autonomous window on this same branch right now.** That was
not foreseen when the first draft of this handoff was written, and it is a real collision: both
machines run `scripts/sea_trial.mjs`, which used to write `.planning/SEA-TRIAL.md` at a hardcoded
path. Whoever finished last silently overwrote the other's verdict — leaving one
authoritative-looking report describing a run that happened on the **other machine**. Rule 24
stands on being able to open that file and believe it.

**Fixed, and this handoff depends on the fix** (`scripts/qa/trial_report_ownership_check.mjs`
holds it): `--report=` names where a run writes, and **every report now states the machine it
sailed on**, derived from the environment — so even a forgotten flag cannot produce a report that
passes for the other's.

**The three rules while both sessions are live:**

1. **`git pull --rebase` before you commit anything**, every time. Two sessions append to
   `.planning/CTO-LEDGER.md`; a rebase turns that into a clean stack instead of a conflict.
2. **Write to your own files.** This run's report goes to `.planning/SEA-TRIAL-LOCAL.md`
   (the `--report=` flag below) and your notes to `.planning/LOCAL-TRIAL-LOG.md` — **never**
   `.planning/SEA-TRIAL.md`, which the cloud run owns while its window is open.
3. **Do not touch game code** (`index.html`, `src/**`). The cloud session has claimed Waves 4+6 in
   the ledger and is editing there. This session's whole job is to sail and time a trial.

## 0b. Then the standing rules

```bash
cd /Users/wyattroy/Documents/Projects/pastrypirates
git fetch origin && git checkout claude/cloud-handoff-planning-a9ay1u && git pull --rebase
```

- **This branch, not main.** The tablet legs, the ten-leg FULL list, and the WebKit recovery
  mount exist only on `claude/cloud-handoff-planning-a9ay1u`. A trial run on main measures a
  different game.
- **If the pull moved `.claude/CLAUDE.md`, re-read it from disk** (its own top box says why).
- Rule 17 is live: this is the laptop he sits at. The trial mutes and cleans up after itself,
  but check at the end: `pkill -f remote-debugging-port; pkill -f http.server`.

## 1. Preflight (2 minutes)

```bash
npm test                      # 35 gates, exit 0 — a red gate means STOP, the tree is wrong
ls ~/.pw/node_modules/playwright >/dev/null 2>&1 && echo "playwright OK" \
  || (mkdir -p ~/.pw && cd ~/.pw && npm i playwright && npx playwright install webkit)
```

Playwright's durable local home has been `~/.pw` (+ browsers in `~/Library/Caches/ms-playwright`)
since 2026-08-27 — it should already be there. Never install it to `/tmp`.

## 2. The run — timed

```bash
caffeinate -i node scripts/sea_trial.mjs --report=.planning/SEA-TRIAL-LOCAL.md
```

**The `--report=` flag is not optional while the cloud window is open** — without it this run
overwrites the authoritative report with a local verdict (§0). The report it writes states
`sailed on **local Mac (<hostname>)**` in its header, and the cloud's says `cloud container`, so
the two can always be told apart afterwards.

- `caffeinate -i` keeps the Mac awake for the duration; a sleep mid-trial is a fake stall.
- **The trial times itself** — no stopwatch needed. The header of `.planning/SEA-TRIAL.md`
  prints total minutes, and every log line in `sea-trial-shots/log.txt` carries a run-relative
  `[Ns]` stamp.
- Expect **10 legs** (solo/passplay/crew × desktop+phone in Chrome, solo × desktop+tablet+phone
  in BOTH engines) and roughly 60–100 minutes. Tell Wyatt within 10 minutes if it stalls
  (no new line in `sea-trial-shots/log.txt` for 7+ minutes = stalled).

## 3. After the run — build the comparison

Per-leg wall time, from the log's own stamps:

```bash
awk -F'[][]' '/^\[[0-9]+s\]/{ for(i=1;i<=NF;i++) if($i ~ /^(solo|passplay|crew)/){ leg=$i;
  t=$2+0; if(!(leg in s)) s[leg]=t; e[leg]=t } }
END{ for(l in s) printf "%-22s %4d s\n", l, e[l]-s[l] }' sea-trial-shots/log.txt | sort
```

Then fill this table and hand it back (paste into the cloud session, or to Wyatt directly):

| | cloud (container) | local (Mac) |
|---|---|---|
| total minutes (report header) | *(from the cloud SEA-TRIAL.md — the 10-leg number)* | |
| slowest leg + its seconds | | |
| WebKit legs: finished? | | |
| WebKit relaunches (`✱` lines in the leg summaries) | | |
| verdict + NOT-RUN count | | |

**The WebKit relaunch row is the most valuable cell.** In the cloud container, playwright's
Linux WebKit (`WPEWebProcess`) segfaults mid-voyage — diagnosed by core dump 2026-08-28, it is
WebKit's own compositing bug on that Linux build — and the mount now relaunches and resumes from
the game's own solo save, printing `✱ N WebKit relaunch(es)` in the leg summary. **On a Mac,
playwright uses a macOS WebKit build that should not share the bug. Zero relaunches locally
confirms the crash is container-only; relaunches locally would overturn that diagnosis — report
it loudly either way.**

For the cloud column: read the header and `✱` lines of the committed `.planning/SEA-TRIAL.md`
(the cloud session commits its 10-leg run there — check `git log -1 -- .planning/SEA-TRIAL.md`
for freshness; the 2026-08-28 8-leg cloud run was 62 min, as an older reference point).

## 4. Honesty rules for the report back

- A leg that captured no screens **did not run** — say so; never fold it into a pass.
- The judge is a witness, not a verdict — known bias families are listed in the checklist's
  "do NOT spend yer eyes" note and the ledger's 13:20 triage entry.
- Record the comparison table + anything surprising in **`.planning/LOCAL-TRIAL-LOG.md`** (your own
  file — see §0 rule 2), then add **one** timestamped line to `.planning/CTO-LEDGER.md` pointing at
  it. `git pull --rebase` immediately before that commit.
- Commit `.planning/SEA-TRIAL-LOCAL.md` as the run wrote it. **Never** `git checkout`/overwrite
  `.planning/SEA-TRIAL.md` — if it shows as modified on your machine, that is the cloud run's
  verdict arriving through a pull, not something to fix.
