# Handoff — 2026-08-26, after the cutover

> ## THE CUTOVER SHIPPED. `/4` IS NOW THE GAME.
> `playpastrypirates.com` serves it. v1 is at `/classic`. Live build **`2026-08-26k-CUTOVER`**,
> verified in a browser on the real domain. `main` level with `origin/main`, working tree clean.
>
> **This file supersedes `HANDOFF-2026-08-26-NIGHT.md`**, which was written an hour before the
> cutover and describes the old layout.

**Session: 8 commits.** Two rulebook corrections, two game fixes, one instrument fix, the whole QA
process written down, a durable backlog, and the cutover.

---

## 0. THE FIRST THING TO DO — sail squares a guest cannot tap

Pinned at the top of [`BACKLOG.md`](BACKLOG.md). `crew-phone`, guest, tap-to-sail: **two sail squares
off-screen and one under the captains panel.** It is the ONLY structural failure across 281 screens
in the final sea trial, it is on the SETTLED shot (not mid-animation), and it is the class D-38 calls
*"the one unacceptable outcome"* — a control the player cannot hit.

Deferred at the cutover by Wyatt's explicit call, on the understanding it was written down.
Start at `boardBand()` / `capBandBottom()` in `src/ui/stage.js` and [`BOARD-RENDERING.md`](../docs/BOARD-RENDERING.md).

---

## 1. WHERE EVERYTHING LIVES NOW — read this before any path

| | before | now |
|---|---|---|
| the game | `4/index.html`, `4/src/` | **`index.html`, `src/`** |
| v1 | `index.html`, `src/` | **`classic/`** |
| About | `about.html` | `about.html` (stayed — it is a SITE page) |
| assets / sfx | `assets/`, `sfx/` at root | unchanged; the promoted game uses `assets/`, classic uses `../assets/` |
| dev scripts | `4/scripts/` | **still `4/scripts/`** — deliberately not moved; see BACKLOG |
| `v2/`, `v2bakeoff/`, `3/` | existed | **deleted** (96 files, recoverable from git history) |

**`--tree=4` now THROWS.** Use nothing (or `--tree=root`) for the promoted game, `--tree=classic`
for v1. `scripts/lib/pick_tree.js` is the one place that decides.

---

## 2. THE SUITE IS GREEN AT 18 GATES — and the accounting is honest

`npm test` → exit 0. It went 34 → 18 and **not all of that is loss**:

- **6 deleted as duplicates** — the `--tree=4` runs; root IS the promoted game now, so the bare runs
  already cover it.
- **3 are an UPGRADE** — `dlog_replay_test`, `net_registry_test`, `rim_sweep_trace_test` passed
  against the promoted game and were left on root. They guard the LIVE game for the first time.
- **2 re-pointed** — `ui_contract_check --tree=classic` (now tree-aware), `hail_ranking_test` imports
  `classic/src/`.
- **10 PARKED**, each named with its symptom in [`BACKLOG.md`](BACKLOG.md). Their invocations are
  preserved verbatim in `package.json` under `scripts.test:v1` and `scripts.test:parked-citation`,
  so restoring them is copy-and-paste rather than archaeology.

**The determinism corpus is the significant park.** It was recorded against the engine that used to
be at root and failed 31/31 the instant the trees moved. Nothing was actually lost — it belongs to
classic, which is frozen, and the promoted game never had one — but the guard is off. Re-opening
that door is a documented one-way act: [`DETERMINISM-CAPTURE-4.md`](../docs/DETERMINISM-CAPTURE-4.md).

---

## 3. THE HIGHEST-VALUE SMALL JOB — the pirate voice, in the live game

Pointing `ui_contract_check` at the promoted tree surfaced **~22 player-facing strings still in the
pre-conversion "you/your" register** instead of ye/yer — `src/orchestrator.js` (1145, 1194–5, 1733,
2225), `src/ui/bakeoff.js` (645–7, 681), `src/ui/board.js:2205`, `src/ui/flow.js` (425, 749,
1232–5, 1376–7, 1402, 1499–1505…). Spec: `art-review/narration-audit.html`'s PIRATE_MAP.

Plus 2 debug globals off the allowlist: `window.__pulseBeacon` (`src/ui/pulsebeacon.js:151`) and
`window.__pp4` (`src/ui/stage.js:3331`).

**This is CLAUDE.md rule 12's voice boundary, visible to players, and it is a copy pass.** Fixing it
promotes `ui_contract_check` from guarding the frozen game to guarding the live one.

---

## 4. SEO — measured, and the diagnosis changed

Wyatt: *"The seo is literally not working… We need to be up top, indexed by ai and Gemini."*
Full write-up in [`BACKLOG.md`](BACKLOG.md); the three facts that matter:

1. **The domain is 41 days old** (created 2026-07-16, verified by whois). This is the single biggest
   explanation for the search screenshots.
2. **Probably not indexed at all** — zero results on DuckDuckGo for the exact title *"Pastry Pirates
   on the Sugar Seas"* and for *"playpastrypirates"*. Nobody competes for those strings, so this is
   the signature of absence, not of being outranked. **Google Search Console is step one and costs
   nothing.**
3. **A crawler sees ~10 words.** `index.html:2560` wraps the welcome screen in `display:none`, and no
   major AI crawler runs JavaScript. Prose in the raw HTML is the unlock.

**Bare "pastry pirates" is not winnable** — an 80-year-old Warner Bros. short owns it. The full title
and "pastry pirates game" are. **`llms.txt` is cargo cult; do not build one.**

---

## 5. THE PROCESS — read before changing how anything is tested

Today five separate instruments were wrong, each in a way that read as truth.

- **What to do:** [`docs/QA-PROCESS.md`](../docs/QA-PROCESS.md) → *"THE WHOLE LOOP, END TO END"*.
  Nine steps; the one-screen table at the bottom is the part to actually read.
- **What happened:** [`docs/HARD-WON-LESSONS.md`](../docs/HARD-WON-LESSONS.md) §10.
- **The one-line version:** *an instrument that cannot fail is not an instrument, and four of the
  five that lied were measuring something ADJACENT to what they reported.*

**New standing rule, inside rule 6:** write the prediction AND its falsifier down BEFORE measuring.
It caught two of my own wrong answers today and stopped one regression.

**`run CEO` is now a command:** `node 4/scripts/qa/ceo_brief.mjs --ask="<verbatim>"`. It pulls in the
previous verdict from [`CEO-REVIEWS.md`](CEO-REVIEWS.md) — **append yours when you are done**, or the
recurrence check silently stops working.

---

## 6. STILL BROKEN

- **§0** — the unreachable sail squares.
- **The seeded-defect drill still cannot fail.** `4/scripts/qa/seed_drill.mjs:72` grades on the leg's
  **exit status** (not a grep — an earlier doc said grep and was wrong), and the leg fails on its own
  for unrelated reasons, so every seed scores CAUGHT regardless. **Fix: one UNSEEDED baseline run
  first, then grade each seed only on failures the baseline did not have.** ~15 lines.
  **Until it exists there is no evidence the sea trial catches Wyatt's bugs.**
- **`deny` never exercised** in crew games. A theory that it shared a cause with the covering bug was
  written down in advance and disproved. Unexplained.
- **31% of screens hit the settle cap**, all `churn: geometry` (the text class is fixed).
- **8 of Wyatt's 35 playtest items untouched.**
- **Nothing gates the push.**
- **Safari:** headless WebKit now runs in the sea trial (Playwright at `/tmp/pw`, use `PW_DIR=/tmp/pw`)
  and completed a voyage. But `DRIVING-THE-GAME.md` §9 stands: *"Chrome is not Safari… a green
  harness still earns a human Safari pass."* **A storm has never been measured on a real device.**

---

## 7. VERIFY THE STATE YOURSELF — do not trust this file

```bash
git fetch origin && git status                       # expect clean, level with origin/main
npm test                                             # expect 18 gates, exit 0
curl -s https://playpastrypirates.com/src/ui/stage.js | grep -o 'PP4_STAMP = "[^"]*"'
curl -s -o /dev/null -w "%{http_code}\n" https://playpastrypirates.com/classic/   # expect 200
node 4/scripts/qa/gear.mjs --since=HEAD~1            # NOT bare — bare reports NONE after a push
```
