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
- **The seeded-defect drill has been FIXED but not yet RUN — see [§8](#8-the-seeded-defect-drill--it-could-not-fail-and-now-it-can).**
  It graded on the leg's exit status and the leg fails on its own, so every seed scored CAUGHT; worse,
  its four seeds still pointed into `4/` after the cutover and it died on `ENOENT` before reaching its
  own "the fix moved" guard. It now sails an unseeded baseline and grades each seed only on failures
  the baseline did not have. **The prediction for all four seeds is written down in §8 BEFORE the run.
  Until someone sails it there is still no evidence the sea trial catches Wyatt's bugs.**
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

---

## 8. THE SEEDED-DEFECT DRILL — it could not fail, and now it can

**Wyatt, 2026-08-26:** *"the seed drill still cannot fail, so nothing yet proves the sea trial
catches your bugs. It's ~15 lines — run one unseeded baseline and grade each seed only on failures
the baseline didn't have. That's the cheapest way to make everything else built today actually mean
something."*

**He was right about the fault and right about the fix.** Two things were wrong, and the second was
worse than the one on the record.

### It was not mis-grading. It was DEAD.

`§6` said the drill graded on exit status and therefore always said CAUGHT. True, but it had stopped
getting that far. **All four seeds pointed into `4/`** — `4/src/ui/lobby.js`, `4/index.html`,
`4/src/orchestrator.js` — and the cutover moved the game to root that morning. `4/` now holds only
`scripts/`.

The drill has a `CANNOT SEED` branch written for exactly this ("the fix moved, so this drill tested
nothing"). **It never reached it**, because the `readFileSync` sat *outside* the guard, so a missing
file threw `ENOENT` and killed the process:

```
Error: ENOENT: no such file or directory, open '…/pastrypirates/4/src/ui/lobby.js'
    at …/4/scripts/qa/seed_drill.mjs:55:23
```

**A guard that only covers the cheap failure is not a guard.** The read is inside it now, so a tree
that moves reports `CANNOT SEED` exactly like a line that moves.

### Why exit status could never work — measured, not reasoned

The old drill's own leftover report is the evidence. `seed-drill-shots/report.json` names exactly
two failures, and neither has anything to do with any seed:

```
· did not finish the voyage
· 6 screen(s) never stopped moving before being checked
```

**The leg exits non-zero because it does not finish inside the 4-minute bound.** Every seed inherits
that. Comparing two non-zero exit codes tells you nothing at all.

### What it does now

Sails the leg **once with nothing seeded**, keeps every failure that run names, and grades each seed
**only on failures the baseline did not already have**. Exit status is not consulted.

- **The comparator is `playtest_gate.mjs`'s own `report.json`**, not its log — `verdict[]` per leg
  plus every `screens[].fails[]` as `{rule, what}`. Verified against three real reports on disk:
  10, 8 and 2 signatures respectively, parsed clean.
- **Counts are normalised out of the signature** (`\d+` → `#`), because "4 structural check
  failure(s)" and "6" are the same complaint and a wobbling count must not read as a catch.
  **The cost, stated plainly: a seed whose only effect is to raise a count the baseline already
  reports will score MISSED.** That is the safer direction to be wrong in — this drill exists
  because it over-reported CAUGHT.
- **No report is `null`, not an empty set.** "The gate never reached a verdict" and "the gate found
  nothing wrong" are opposite facts. A seed whose run wrote no report scores `NO REPORT` and is
  counted as **not graded**, never as passed. If the *baseline* writes no report the drill refuses
  to grade at all and exits 2.
- **Each run gets its own `--out` subdirectory, wiped first**, so a stale `report.json` can never be
  read as this run's.
- **Red-proofed before use:** fed identical baseline and seeded sets, the grader returns MISSED —
  the verdict the old one was structurally incapable of producing.

**Size: ~100 lines changed, about half of them comment.** Wyatt's ~15-line estimate was right about
the logic.

### WHAT IS STILL NOT PROVEN — do not skip this

**The drill has been made able to fail. It has not yet been RUN.** Nothing below the line is
established until someone sails it:

```bash
node 4/scripts/qa/seed_drill.mjs            # baseline + 4 seeds, ~25 min of browser
```

**The prediction was written before any of it, and it is on the record so it cannot be retrofitted:**

| seed | predicted | why |
|---|---|---|
| T-12 homepage over a live voyage | **CAUGHT** | a full-screen overlay should trip `not-occluded` / `on-screen` |
| T-16 no orange glow on Start | **MISSED** | `structuralChecks` measures geometry, occlusion and clipping. There is no rule that can see a glow, and the drill runs `--judge=off` |
| T-30 Watch again shouting | **MISSED** | same — a CSS class rename with no geometric consequence |
| T-02 guest has no stay square | **MISSED** | it is a *guest* bug and the drill's default leg is `solo-phone`, where no guest exists. **The instrument cannot reach its subject** |

**The falsifier, also written first:** if all four come back CAUGHT with distinct new signatures
traceable to their seed, the coverage reasoning above is wrong and should be reported as wrong.

**If T-02 lands MISSED for the reason predicted, that is a finding about the DRILL, not the sea
trial** — a guest bug must be seeded on `crew-phone`, not solo. `--leg=` already takes it.

---

## 9. 10,371 CHROME PROFILES ARE TRACKED ON A PUBLIC REPO

A second session investigated the GitHub secret-scanning alert and wrote up
`~/Downloads/notetoqasession.md`. **Its findings hold. Its recommended action was stale, and one of
its claims is now false.** Both verified here rather than taken on trust.

### The alert is not a real leak

The Google API key at `…/prof-passplay-phone-a/Default/shared_proto_db/000003.log` is **Chrome's
own**, baked into the browser binary — 1,337 occurrences, all Chrome calling
`optimizationguide-pa.googleapis.com`, byte-identical across 15 independently created profiles. A
per-project key cannot be identical across separate profiles. **Nothing to rotate.**

The other session also opened the rest of each profile, because the repo is public: cookies empty,
logins empty, history one `127.0.0.1` URL, no auth tokens. **The game has no Firebase Auth at all,
so there were never player tokens to leak.** Those DBs were empty because the profiles were fresh —
**luck, not a guarantee**, which is the actual reason to fix this.

### What is measured, on `main` at `8cad02da`

| | |
|---|---|
| tracked files total | **13,194** |
| of those, Chrome profile files | **10,371** |
| `.git` on disk | **2.7 GB** |
| the flagged key file | **still tracked** |
| `mp-rig-shots/` | in `.gitignore` **and 7 PNGs already tracked** — ignoring never affects a tracked file |

### The branch is real, but the note's headline is out of date

`claude/github-issue-investigation-exs7h3` — three commits, forked at `401b4e02`, **nine commits
behind `main`**. Everything from `8f4beae3` through the cutover and `8cad02da` landed after it.

- **The note says it "fast-forwards with zero conflicts." It no longer does.** `git merge-base
  --is-ancestor origin/main <branch>` fails, and a simulated merge (`git merge-tree --write-tree`,
  which touches nothing) reports **exactly one conflict: `.gitignore`** — because the cutover added
  `sea-trial-shots/` and friends to it after the note was written. One conflict, resolvable as the
  union of both sides.
- **It does NOT resurrect `3/`, `v2/` or `v2bakeoff/`.** A first read here used `git diff main
  branch` and concluded that it would; **that was wrong, and a two-tree diff is not a merge
  preview.** The simulated merge keeps every cutover deletion. Recorded because the wrong method is
  the reusable lesson.
- **The merged tree measured: 2,481 files (from 13,194), zero profile files, key file gone**, and
  `index.html`, `src/orchestrator.js`, `classic/index.html` and `4/scripts/` all intact.

### The caveat the note understates

**Deleting the files in a new commit does not remove them from history.** The key stays retrievable
at `5d82213` and `.git` stays 2.7 GB; only the working tree and future `git clone --depth 1` get
smaller. For a Chrome-baked key that is fine — **but "once the files are gone" promises more than a
delete commit delivers.** Anything that truly removes it means rewriting public history.

### Second hole worth keeping

Ignoring output *directories* cannot catch this class: **a browser profile lands wherever `--out`
points**, and `5d82213` happened because `--out` was aimed inside `.planning/phases/…`, outside
every ignored directory. The branch's second commit ignores the profile **names** as shape globs
(`prof/`, `prof-*/`, `profile/`, `profile-*/`, `_sheet-profile/`, `chrome-probe*/`) across the seven
scripts that create them. That is the durable half of the fix.

### Recommended order

1. Merge the branch, resolving `.gitignore` as the union of both sides.
2. `git rm --cached -r mp-rig-shots` — ignored but tracked, so the ignore is inert.
3. Dismiss the GitHub alert as "used in tests".

**Expect ~10,700 files to vanish from the checkout on the next pull. That is the point, and it will
look alarming mid-run — do it at a quiet moment.**

### Unrelated and larger, flagged so it is not lost again

The Realtime DB takes writes on four top-level paths — `rooms/`, `presence/`, `feedback/`,
`gamelogs/` — and **the game never authenticates**. The security rules are the only thing protecting
it, and the `databaseURL` is in view-source. `.planning/codebase/CONCERNS.md:141` flagged this and it
was never resolved. Wyatt has been told.

---

## 10. THE SEA TRIAL HAD NOT TESTED THE GAME SINCE THE CUTOVER

**Found by making the seed drill able to fail — which is exactly what Wyatt said it would buy.**
The fixed drill's first run reported *"4 REAL GAP(S) — the sea trial would not have found these."*
Its own baseline, one line above, said:

```
· leg error: solo card not clickable
· did not finish the voyage
```

**The leg never got past the front screen.** Nothing had reached any seeded code. A drill that had
just been made able to fail immediately produced a confident wrong finding — because it was still
grading a run that never happened.

### The cause: 77 references to a directory the cutover emptied

`playtest_gate.mjs:85` navigated to `http://127.0.0.1:${PORT}/4/`. `4/` now holds only `scripts/`,
so python's `http.server` answered **200 with a directory listing**, Chrome loaded it happily, and
the first thing every driver looks for — `#choiceSolo` — was not on the page.

| | count |
|---|---|
| scripts navigating to `/4/` | **12 files, 22 sites** |
| in-page `import("/4/src/…")` calls | **15 files, 49 sites** |
| **total dead references** | **77** |
| gates that could see any of them | **0** |

**`docs/DRIVING-THE-GAME.md` had already been updated and no longer mentions `/4/` anywhere.** The
doc was right; the code it documents was orphaned. `HARD-WON-LESSONS.md` §3 names the shape exactly:
*a gate aimed at the wrong tree is not silent, it is REASSURING.*

### The fix is rule 23's, not a find-and-replace

`gameURL(port)` and `GAME_PATH` now live **once**, in `4/scripts/lib/chrome.mjs`, and all 22
navigations go through them. Twenty-two copies of a constant kept in step by discipline is the
defect rule 23 forbids *before a line is written*.

**PROVEN, not assumed:** before the repoint the gate died instantly at the front screen; after it, a
`solo-phone` leg reached **DAY 0 → DAY 1 → DAY 2**, clicked sail squares, ran a trade, and exercised
14 interaction kinds.

### The new gate — `4/scripts/game_url_check.js`, in `npm test` (19 gates)

Its load-bearing case is **not** "does a file exist":

> **`GAME_PATH` must resolve to an `index.html` that actually CONTAINS `#choiceSolo`.** A directory
> listing and the wrong tree's `index.html` both pass a mere existence check. This is the case that
> would have caught the cutover on the day it happened.

Plus: no script may hardcode a local game URL; no in-page import may name a non-root tree; and a
**two-way red-proof**. The first version of the URL case had no `fetch()` discriminator and
condemned **nine CDP `/json/new` calls that are all correct** — rule 6, *when a check condemns
something known to work, suspect the check first.* Verified by reintroducing the defect, watching it
go red, and removing it again.

### Doc rot from the same cause, swept in the same pass

**35 lines** across `DISPLAY-RULES`, `DETERMINISM-CAPTURE-4`, `TRADE-SYSTEM`, `AUDIO`,
`HARD-WON-LESSONS`, `GIT-AND-DEPLOY` and `CLAUDE.md` still sent readers to `4/src/…`.

- **`CLAUDE.md` §6 told every session to bump `PP4_STAMP` in `4/src/ui/stage.js`** — the deploy
  loop's single most-run step, pointing at nothing.
- **Both deploy docs still carried the reassurance the cutover INVERTED:** *"merging does not touch
  the root game, they are different files."* True with two trees; **false with one.** Every push to
  `main` is served to real players immediately. Both now say so, in a warning box.
- **Rule 23's own citation was wrong in both halves** — `4/src/orchestrator.js:1654` is a deleted
  tree *and* a line reading `const subHtml=…`. The host/guest fork is one `if/else` pair at
  **`src/orchestrator.js:2318-2319`**. Corrected by reading it.

### `doc_command_check.js` reported all-green throughout, and why

It scanned a **hand-kept list of five docs** with a **`.md`-only** link regex. So `docs/AUDIO.md` —
which `CLAUDE.md` §4 itself tells you to read before touching sound — **was never checked at all**,
and its dead link to the audio module sat green for a day.

The list is now **derived from the directory** and the regex covers source files: **13 → 47
commands, 21 → 24 links.** It immediately found three more dead commands (a determinism recipe whose
copy-into-`4/` step the cutover made obsolete, and a brief pointing into the deleted `v2bakeoff/`).
Red-proofed with two planted defects.

> **The lesson, and it is the same one three times today:** a hand-kept list of what to guard rots
> exactly like the thing it guards, and nothing says so. Derive it.

---

## 11. WHAT THE DRILL ACTUALLY MEASURED — and the prediction it falsified

**The 0/4 from the first valid run is WITHDRAWN, not reported.** Two of its four rows were grading
code that never executed.

**The prediction in §8 was written before any run. Here is how it held up, in the open:**

| seed | predicted | actual | |
|---|---|---|---|
| T-12 | **CAUGHT** — a full-screen overlay should trip `not-occluded` | **WRONG, and for a reason I did not consider** | `showRoom()` is the multiplayer room screen (`lobby.js:263` guards on `appState.room`). A solo leg never runs the seeded line. It was not a coverage gap; it was an unreachable seed |
| T-16 | MISSED — geometry checks cannot see a glow | reachable, and the reasoning held | `appState.isHost` is TRUE in solo, so solo *does* run `netIntroBarrier()`. Confirmed by the gate's own coverage line: `arrgh:1/1`, `start:1/1` |
| T-30 | MISSED — a CSS class rename with no geometric consequence | reachable, reasoning held | the bake-off's Watch again button; solo plays bake-offs |
| T-02 | MISSED — *"it is a guest bug and the leg is solo"* | **right, and for exactly the stated reason** | the line is `orchestrator.js:1716`, inside `watchPrompt()`, attached only on a guest (`orchestrator.js:2319`) |

**Writing the falsifier down is what made T-12 reportable as wrong instead of quietly reframed as a
partial win.** The stated falsifier — *"if the covered squares are not where I expect, the
explanation cannot be right"* — is what forced checking reachability at all.

### So the drill now pairs every seed with a leg that can reach it

Each seed carries its `leg` **and the `why`**, and the drill sails **one baseline per leg**.
`--leg=` still forces them all onto one leg, and every forced row is marked — because three of these
four would silently measure nothing that way.

### THE SECOND CONFOUND, and it is not fixed — it is only made visible

The baseline is bounded at **4 minutes** (the gate's real default is 35) and **does not finish its
voyage**. So `"did not finish the voyage"` is one of the baseline's own signatures and is therefore
**subtracted from every seed** — which is exactly the signature a seed that *breaks the game
outright* would produce.

**While that is true, the drill is blind to its most important class of catch.** It now prints that
warning itself, on the leg it applies to, rather than burying it here:

> *⚠ this baseline did not finish its voyage, so "did not finish" cannot discriminate. A seed that
> BREAKS the game outright will read as MISSED. Raise `--max-min` until the baseline finishes before
> trusting a MISSED on this leg.*

**The next person to touch this should raise `--max-min` until at least the solo baseline finishes,
then re-run.** Until then, a MISSED is *"not yet a gap"*, not *"a gap"*.
