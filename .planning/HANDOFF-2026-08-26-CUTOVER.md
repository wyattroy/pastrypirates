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

## 3. ~~THE HIGHEST-VALUE SMALL JOB — the pirate voice, in the live game~~ — WITHDRAWN

> ### ⛔ THIS JOB DOES NOT EXIST. THE COUNT WAS ZERO, NOT 22. See [§12](#12-the-pirate-voice-job-was-phantom--and-doing-it-would-have-been-destructive).
>
> Pointed at the promoted tree, `ui_contract_check` reports **67**, not ~22. Classified with the
> repo's own tokenizer: **59 are comment-only, 1 is code-only, and all 7 that touch a string are
> false positives** — six are `hd.you`, a boolean property, inside templates that already read
> "yer" and "ye've". **The true number of player-facing strings in the wrong register is ZERO.**
>
> **Doing this job would have rewritten 59 code comments — many of them direct quotations of
> Wyatt — into pirate speak.** The gate is fixed (2026-08-26); root now reports 0.
>
> The section is kept below, struck through, because the reasoning that produced it is the thing
> worth not repeating: the number came from a gate's output, unread.

### The original text, for the record

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
npm test                                             # expect 19 gates, exit 0 (18 + game_url_check)
curl -s https://playpastrypirates.com/src/ui/stage.js | grep -o 'PP4_STAMP = "[^"]*"'
curl -s -o /dev/null -w "%{http_code}\n" https://playpastrypirates.com/classic/   # expect 200
node 4/scripts/qa/gear.mjs --since=HEAD~1            # NOT bare — bare reports NONE after a push
node 4/scripts/game_url_check.js                     # the browser fleet points at the real game
```

**And one that is new, because the sea trial was silently testing nothing for most of 2026-08-26
(§10): `game_url_check.js` is the only thing that will tell you the drivers can still reach the
game. Run it before believing any voyage result.**

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

---

## 12. THE PIRATE-VOICE JOB WAS PHANTOM — and doing it would have been destructive

**§3 called this "the highest-value small job" and sized it at ~22 player-facing strings.** Run
against the promoted tree, `ui_contract_check` actually reports **67**. Neither number was ever
inspected; both came straight from a gate's output.

### What the 67 actually are, classified with the repo's own tokenizer

| | |
|---|---|
| comment only | **59** |
| code only | **1** |
| touching a string | **7 — and every one a false positive** |

Six of the seven are `hd.you` / `sh.you` — **a boolean property** — inside template literals in
`src/ui/util.js:510–524` whose words *already* read `"yer"` and `"ye've"`. They were correct before
anyone looked. The seventh, `index.html:2646`, sits inside an HTML comment; the player-facing text
three lines above it reads *"What do they call ye, captain?"*.

**The true count of player-facing strings in the pre-conversion register is ZERO.**

### Why the gate was wrong

`isLeadingComment` skipped only a line that **starts** with `//`, `/*` or `*`. This codebase indents
block-comment continuation lines with plain spaces, so **every line after the first of a long
WHY-comment read as code.** A line-wise prose grep with a naive comment heuristic — precisely the
artefact class CLAUDE.md already warns about for W002/W011.

### What acting on the list would have cost

It would have rewritten **59 code comments into pirate speak.** Those comments are the graveyard
(rule 10), and many of them **quote Wyatt directly** — *"you can plan ahead"*, *"you're right, we
don't"*, *"the etc is important here so i want you to understand my intention"*.

**Converting his own words into ye/yer destroys the record and breaks rule 12's voice boundary in
the one direction nobody thought to guard** — and changes nothing a player can see. A gate that is
confidently wrong is worse than no gate, because it *generates work*.

### The fix

The pronoun detector now runs over **speech only, region-classified, never line-guessed**: `.js`
string literals via the shared tokenizer (interpolation expressions are code to it, so
`${hd.you ? "yer" : "their"}` contributes only its quoted words), and `.html` markup text with HTML
and CSS block comments blanked. Masking preserves length and newlines, so reported line numbers stay
true.

**Red-proofed both directions**, because a narrower check can be a blind one: a planted file with a
genuinely bad player string, a comment mentioning "you and your crew", and an `${x.you ? …}` template
produces **exactly one** failure — the real one. Root went **67 → 0**; `classic`, the tree `npm test`
runs, still exits 0.

> **The pattern, for the third time today:** the number was believed because it came from an
> instrument, and the instrument had never been asked whether it could be wrong. Rule 6 covers
> defects; **it applies to WORKLISTS too.** A job list produced by a gate is a measurement, and it
> gets the same treatment as any other.

---

## 13. THE FINAL SCORING — and it is neither 4/4 nor 0/4

**The per-leg drill reported CAUGHT 4/4.** That number was not reported to Wyatt as a result,
because two of the four were "caught" by a line the gate itself prints as *"not failures"*. Instead
the drill was asked the question nobody had asked it: **can it fire on nothing?**

```bash
node 4/scripts/qa/seed_drill.mjs --null --reuse-baselines
```

Sail each leg AGAIN with nothing seeded and grade it exactly as a seed. Whatever it reports **is**
the noise floor, by construction — there is no seed to explain it.

### The measured floor

| leg | appeared | disappeared | **unstable** |
|---|---|---|---|
| `solo-phone` | 0 | 0 | **0 — identical** |
| `crew-phone` | 0 | **3** | **3** |

The three that flapped on crew-phone: `1 structural check failure(s)`, `3 observation(s) seen only
DURING an animation`, and **`no-cover-ask: "sailCell" over "test2: tap to sail"`** — the §0 family.

> **THE FIRST VERSION OF THE NULL TEST SAID "NOISE FLOOR: 0 — two unseeded runs agree."** It counted
> only signatures that APPEARED and ignored the three that VANISHED. **A disappearing signature is
> exactly as damning**, because the baseline is the subtrahend: when the baseline happens to HOLD a
> flapping signature a seeded run showing it is correctly subtracted, and when the baseline happens
> to LACK it, that same run reads as CAUGHT. **Instability is the measurement; which way it fell on
> the day is not.** Fixed to count both directions, and the drill now exits non-zero on a non-zero
> floor rather than printing a reassurance.

### So the four seeds score like this

| seed | leg | floor | verdict |
|---|---|---|---|
| **T-16** no glow on Start | solo | **0** | **CATCH STANDS** — but on weak evidence: its only new signature is a motion-only line the gate labels *not a failure*. Two unseeded runs had none; the seeded run had 3 |
| **T-30** Watch again shouting | solo | **0** | **CATCH STANDS**, and it is mechanistically coherent: the seed removes `animation: none` from `.bkoWatch`, so the button animates again, and the new signature is an extra during-animation observation |
| **T-12** homepage over a voyage | crew | **3** | **NOT ESTABLISHED.** Its "catch" is `sailCell <- covered by #pp4Cap` — the CAPTAINS PANEL, nothing to do with a homepage |
| **T-02** guest has no stay square | crew | **3** | **NOT ESTABLISHED.** Its "catch" is `sailCell off-screen` — nothing to do with a missing *stay* control, which the gate has no rule to detect at all |

**The screenshots settle T-12 and T-02 independently of the floor** (rule 19 — look at the rendered
picture, not the assertion). Both fail on the same screen,
`crew-phone-guest-006-settled.png`:

- **T-12's shot** shows a bright sail square at the foot of the board **clipped behind the captains
  panel**, and **no homepage anywhere on screen**. The seed had no visible effect.
- **T-02's shot** shows sail squares **cut off at the left edge of the phone**.

**Both are §0 — the pinned "sail squares a guest cannot tap" — surfacing intermittently.** A
genuine, intermittent bug in the game is indistinguishable from a seeded one when you subtract a
single baseline.

### THE LESSON THAT OUTLIVES THIS DRILL

**Differential grading against ONE baseline cannot work on a leg that has a flapping defect.** The
flapping thing here is a REAL BUG (§0), not harness noise — which is why raising `--max-min` will
not fix it. Two honest ways forward, in order of value:

1. **Fix §0.** It is the top of `BACKLOG.md` anyway, it is the one unacceptable class (a control a
   player cannot hit), and fixing it also makes crew-phone gradeable.
2. **Sail several baselines** and treat only signatures present in ALL of them as stable.

**Until one of those happens, a `crew-phone` CAUGHT means nothing and the drill now says so.**

### What Wyatt's ~15 lines actually bought

He said it was *"the cheapest way to make everything else built today actually mean something."*
It cost more than 15 lines, and it was right:

- it found the drill was **dead**, not merely mis-grading (`ENOENT`, guard in the wrong place);
- the fixed drill's first run then exposed that **the whole browser-QA fleet had been pointed at an
  empty directory since the cutover** (§10) — 77 dead references, no gate able to see one;
- and asking the drill whether it can fire on nothing exposed that **§0 makes crew-phone
  ungradeable**, which is a much more useful thing to know than "4/4".
