# Phase 6: The Cutover - Context

**Gathered:** 2026-08-25
**Status:** Ready for planning — **but NOT ready to execute. See D-61.**

<domain>
## Phase Boundary

`playpastrypirates.com` serves the promoted game (`4/`), today's game keeps playing at `/classic`,
every bookmark still resolves, and exactly one deployment on earth claims to be the live site.

**In scope:** CUT-01…CUT-08, FIX-02, FIX-04, FIX-05 — the move itself, the path and metadata
rewrites it forces, deleting the three dead trees, closing the player-reachable dev flags, and the
two shipping defaults (wind dots, Safari storm) that must be decisions rather than accidents.

**Out of scope:** any gameplay change, any desktop layout work (Phases 7 and 8), and the trade
parallelism that Phase 5 still owes (which now GATES this phase — D-61).

**HARD CONSTRAINT, carried from ROADMAP.md: this is one-way.** `4/` forked 2026-08-11 and the repo
root has had no code commit since 2026-08-02. There is nothing to merge and nothing stranded — but
every fix made after this phase has to be made in the new tree.
</domain>

<decisions>
## Implementation Decisions

*Numbering continues the project-wide D-NN sequence (D-57 was set the same day — see
`.planning/phases/02.2-a-captain-who-cannot-take-their-turn/02.2-CONTEXT.md`).*

### The developer flags (FIX-02)

- **D-58: `?ovens=1` and `?windhud=1` are KEPT, and hidden behind a stored developer key.**
  Wyatt, 2026-08-25, choosing "keep them for you, hide them from players." A URL alone must not
  unlock either flag; the player must first have set a key in their own browser's storage, which a
  shared link cannot do. He flips it once and both flags work forever after on his devices.

  **Why this and not deletion.** `?ovens=1` is not dead code — it is his working instrument, and he
  extended it to CREW games on 2026-08-24, one day before this decision (`e576162`, `2d0fc9b`). A
  whole voyage to reach the ovens is 16-odd days and the thing under test takes ninety seconds.
  Deleting it would have taxed every future bake-off playtest to close a hole a stored key closes
  just as completely.

  **Do NOT touch `?bakeoff=0` / `?bakeoff=1`.** Its own comment calls it *"A ROLLBACK SWITCH, NOT A
  TUNING KNOB"* — it exists so a shipped ruleset can be turned off without a deploy, and it rides in
  `soloMeta` so a save cannot be resumed against a different ruleset. It is not in FIX-02's scope
  and was not put to him. Leave it reachable.

  — **Reversibility:** reversible — the gate is one predicate in front of two existing flag reads.

### The wind-dot prototype (FIX-05)

- **D-59: the drifting wind dots SHIP ON, at the new game's current 20 dots.** Wyatt, 2026-08-25.
  `4/src/ui/board.js:570` already ships `WIND_PROTOTYPE_ENABLED_DEFAULT=true`; that value stands and
  becomes deliberate rather than accidental.

  **AND THE SAFARI QUESTION IS ANSWERED — do not re-open it.** He was asked to let it be measured
  first and declined, with the measurement: *"it's well measured in safari, i've been playtesting it
  all week."* **He is right and the record was wrong.** Every document in `.planning/` says
  "nothing in `4/` has ever been measured on Safari"; that claim describes instrumented runs, and
  overlooks a week of real voyages on his own iPhone — including the eight-day pulse investigation
  that ended on that device on 2026-08-25. This is `docs/HARD-WON-LESSONS.md`'s own new lesson
  landing the other way up: **the user's device can be the only instrument, and here it was.**

  — **Reversibility:** reversible — one boolean, and a URL flag already overrides it either way.

- **D-59a: the rotted comment above it must be corrected in the same change.**
  `4/src/ui/board.js:569` reads *"Off by default (D-08, D-10)"* and the very next line is
  `=true`. A session reading that comment would report the opposite of what ships. Rewrite it to
  state the shipped default and cite this decision. **This is rule 6's other half and it is not
  optional cleanup.**

### Safari and storms (FIX-04)

- **D-62: FIX-04 IS CLOSED, MET ON HIS OWN iPHONE. Do not schedule a re-measurement.**
  Asked directly — and separately from the wind dots, because his wind answer did not cover storms
  and assuming it did would have been rule 6 all over again — whether a storm had actually hit him
  during the week: *"Yes, and storms are fine."*

  **This retires a sentence that appears in several planning documents:** *"nothing in `4/` has ever
  been measured on Safari."* It was written about instrumented runs and it overlooked a week of real
  voyages on the only device where the fault would show. **That is precisely the blind spot that cost
  eight days on the pulse bug** — three engines cleared it honestly and none of them was his phone.

  — **Reversibility:** n/a — a measurement verdict, not a change.

### The old URL (CUT-01, CUT-02)

- **D-60: `playpastrypirates.com/4` BOUNCES to the front page. It does not 404 and it does not serve
  a second copy.** Wyatt, 2026-08-25. Every link he has shared, every bookmark, and every `/4` path
  written into a month of playtest notes keeps resolving — and it resolves to the same game those
  links were pointing at.

  **The forbidden option, and why.** Keeping `/4` serving real files would put two copies of the same
  game on the live domain, which is the exact condition this milestone exists to end (rule 23; and
  `4/` vs root drift is the reason five trees became unreadable). One redirect file; no second tree.

  — **Reversibility:** reversible — a single file at `4/index.html`.

### Sequencing (this phase's own gate)

- **D-61: PHASE 5 LANDS FIRST. This phase does not execute until it does.** Wyatt, 2026-08-25,
  choosing "finish Phase 5 first, as the roadmap says" over both "move as soon as the plan is ready"
  and "move on your word." The roadmap already said `Depends on: Phase 5`; he confirmed it rather
  than waiving it.

  **What Phase 5 still owes** (`ROADMAP.md` § Phase 5, MP-09): holders in a multi-captain trade are
  asked **strictly in series** — measured 2026-08-23, seat 1 asked at +4.3s and cleared at +9.1s,
  seat 2 not asked until +9.1s. The deliverable is `collectTableAnswers(asker, offer, holders)`,
  with `recipeDraftNet` as the working precedent.

  — **Reversibility:** n/a — a sequencing decision, not a code change.

### Claude's Discretion

Mechanism throughout, and specifically:
- **How the trees are moved** (git mv vs. copy, and in which order) — his ruling is about the
  outcome, not the plumbing.
- **How `/classic` keeps finding its art.** Both games share ONE `assets/` folder at the repo root;
  the game that lives in a subfolder is the one that needs `../`. Today `4/` carries that `../` and
  the root game does not. After the move it is the other way round. **Rewriting ~30 references is
  the answer, not copying 18MB of art into `classic/`.** Not put to him — it is invisible to a
  player and reversible.
- **The shape of the developer-key gate** in D-58 (which key, where it is read).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Deploying, the live domain, and the thing that can take the game down
- `docs/GIT-AND-DEPLOY.md` — the full deploy loop and the incidents that earned it. **§5** is the
  push/pull/verify ritual.
- `.claude/CLAUDE.md` §3 — `CNAME`, `robots.txt`, `sitemap.xml` never leave this repo. **Two
  separate sessions came within one command of taking the live game down by copying `CNAME`**, both
  hand-rolling an `rsync`. Deploy previews with `scripts/deploy-preview.sh` only. When this phase
  adds or moves a file that identifies the live site, `EXCLUDES` is updated in the same commit.

### Safari, storms, and the performance argument
- `docs/HARD-WON-LESSONS.md` — read at session start, and re-read at the trigger.
- `docs/BOARD-RENDERING.md` — the five layers; an HTML overlay mapped to board coordinates must be
  in `CAM_HTML_LAYERS`, and anything animating continuously must be HTML, not SVG.
- **Measuring cost is not measuring layout.** `--disable-gpu` hid an entire finding once, and an idle
  headless page stops producing frames, so an animation measures as free. Same page, same 5s window:
  0.2% CPU / 0 layouts per second without a rAF loop, 11.1% / 60 with one. Drive frames, and quote
  the fps beside every figure.

### The record of this milestone
- `.planning/ROADMAP.md` § Phase 6 — the requirement list and the promotion-mechanics evidence.
- `.planning/REQUIREMENTS.md` — CUT-01…CUT-08, FIX-02, FIX-04, FIX-05.
- `.planning/research/v2.0-intake/` — the only synthesis of the `4/` development period, which left
  no GSD artifacts. Read before planning.
- `.planning/HANDOFF-2026-08-25.md` — current state, the instruments, and D-57.

</canonical_refs>

<code_context>
## Existing Code Insights

**All figures below were MEASURED on 2026-08-25, not read from a document.**

### The move is a swap, and it is small

`4/` contains only six things: `index.html`, `src/`, `scripts/`, `favicon.ico`, `favicon.png`,
`RULES-V2.md`. Everything else it uses — `assets/` (18M), `sfx/` (312K) — already lives at the repo
root and is SHARED with the live game. So the cutover exchanges one relative prefix:

| | Root game (v1) today | `4/` today | After the move |
|---|---|---|---|
| `ASSET_BASE` | `"assets/"` — `src/shared/index.js:22` | `"../assets/"` — `4/src/shared/index.js:24` | swap them |
| literals in its `index.html` | 25 × `assets/` | 24 × `../assets/` | swap them |
| literals in its `src/` | 4 × `assets/`, 1 × `sfx/` | (covered by `ASSET_BASE`) | swap them |

**The root game also links `about.html`, `lab.html` and `stats.html` (3 references) and those move
too.** `4/index.html` links `about.html` at `:2480` and `:2837` — both 404 at `/4` today and start
working for free once it is at the root (CUT-06).

### Metadata that is correct at `/4` and wrong at the root (CUT-04)

- `4/index.html:10` — `<meta name="robots" content="noindex, nofollow">`. Correct today; **at the
  root it de-indexes the live game.**
- `4/index.html:11` — `<title>Pastry Pirates — v3 bot test</title>`.
- `robots.txt` — carries `Disallow: /4/`, plus `/3/`, `/v2/`, `/v2bakeoff/` which become moot when
  those trees are deleted, plus `/lab.html` and `/stats.html` which stay.
- **Already correct, do not "fix" it:** `4/index.html:13` canonical is
  `https://playpastrypirates.com/`, which is where the game is going.

### Saved games and preferences (CUT-07) — mostly a non-problem, and here is why

The two games already namespace their own state, so a returning player's v1 voyage stays readable by
`/classic` and cannot be misread by the new game:

| | Root game (v1) | `4/` |
|---|---|---|
| own keys | `pp_sess`, `pp_solo`, `pp_timerOff` | `pp4_sess`, `pp4_solo`, `pp4_timerOff` |

**The keys they SHARE are the ones to think about:** `pp_id`, `pp_lastName`, `pp_wind_proto` (both),
and `pp_rematch`, `pp_seaIdx`, `pp_wind_hud` (`4/` only). `pp4_timerOff` was namespaced in Phase 1
(FIX-01, `fbf1088`) precisely because the un-namespaced version leaked between the games — **that is
the pattern to follow if any of the remaining shared keys turn out to matter.**

### The three dead trees (CUT-03)

`v2/` (1.0M), `v2bakeoff/` (1.1M) and `3/` (1.2M) — **47,400 lines** of `.js`/`.html`/`.css`, fully
preserved in git history.

### The dev flags (FIX-02)

- `?ovens=1` — `ovensNowEnabled()`, `4/src/shared/index.js`, constant `OVENS_NOW=false`. Reads
  `location.search`. **It draws no random numbers**, which is what makes it safe on a seeded game,
  and it rides in `soloMeta` so a save cannot be resumed against a different ruleset.
- `?windhud=1` — `4/src/ui/board.js:594`.
- `?bakeoff=0` / `?bakeoff=1` — same file, **out of scope, leave alone** (D-58).

### The gates move with the tree

Phase 3 pointed six gates at `4/`. This phase re-points them at the repo root, and **a green
`npm test` against the game at the root is this phase's own precondition for calling the cutover
done.** Note the standing trap: `scripts/host_guest_parity_check.js` reads the ROOT game's `src/`
and has been green throughout on a game nobody is developing. **A gate aimed at the wrong tree is
not silent, it is reassuring.**

</code_context>

<specifics>
## Specific Ideas

- **"Keep them for you, hide them from players."** D-58's shape comes from his own framing — the
  test is whether a link he sends someone can unlock the flag. It must not be able to.
- **The `/4` bounce is for the notes as much as the players.** A month of playtest documents, and
  every screenshot path in them, cite `/4`.

</specifics>

<deferred>
## Deferred Ideas

- **META-03 — Google Search Console verification.** Wyatt's own action, blocked behind CUT-04. It
  unblocks the moment the promoted game is indexable.
- **BACK-01** — two real gaps `4/` closes that v1 still has. Deferred, not dismissed: v1 becomes a
  frozen `/classic` archive, so the value is small.
- **The remaining shared `localStorage` keys** (`pp_id`, `pp_lastName`, `pp_wind_proto`,
  `pp_rematch`, `pp_seaIdx`, `pp_wind_hud`). Only namespace one if it is shown to cause a real
  crossover — FIX-01 was earned by a measured leak, not by tidiness.

</deferred>
