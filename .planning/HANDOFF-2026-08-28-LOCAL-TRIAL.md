# HANDOFF — run the FULL sea trial LOCALLY on Wyatt's Mac, and time it

**For a fresh session running on the Mac** (`/Users/wyattroy/Documents/Projects/pastrypirates`).
Written 2026-08-28 by the cloud session that added the tablet legs and the WebKit crash-recovery.
The point of this run is twofold: prove the **local half** of "the full trial runs in Safari and
Chrome at the three sizes, cloud or local" (the cloud half is proven in the cloud session's
report), and produce a **timed, like-for-like comparison** of the two environments.

## 0. Before anything — the standing rules

```bash
cd /Users/wyattroy/Documents/Projects/pastrypirates
git fetch origin && git checkout claude/cloud-handoff-planning-a9ay1u && git pull
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
caffeinate -i node scripts/sea_trial.mjs
```

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
- Record the comparison table + anything surprising in `.planning/CTO-LEDGER.md` with a
  timestamped entry, and leave `.planning/SEA-TRIAL.md` as the local run wrote it — commit both.
