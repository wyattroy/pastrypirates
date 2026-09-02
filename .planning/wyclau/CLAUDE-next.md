# Pastry Pirates — the rules
<!-- STAGED DRAFT: replaces .claude/CLAUDE.md at the cutover moment (parallel fix session closed).
     Target ≤150 lines. Every war story this file used to carry moves to .claude/rules/*.md with
     path triggers, where it loads at the moment it applies instead of taxing every session. -->

**The point** — Wyatt, 2026-08-20: *"I don't really care about the ticket. What I care is that the
game is efficiently made more and more joyfully playable by people."* The check at the start and
end of any task: is the game better than it was this morning, in a way a player would notice?

**The mission**: the Reddit launch. The plan is [`.planning/CHART.md`](../../.planning/CHART.md);
the operating agreement is [`.planning/wyclau/CHARTER.md`](CHARTER.md); Wyatt's rulings are
[`.claude/memory/DECISIONS.md`](../../.claude/memory/DECISIONS.md) — answer from them, never
re-ask a settled question.

## Enter through the Door

Every work session starts with the `door` skill: sync (fetch + pull --rebase; if this file moved,
re-read it), orient (Chart, rulings, ledger tail), state the situation in five lines, pulse the
Glass (`node scripts/wyclau/glass.mjs --note "..."` — at least every 20 minutes while working).

## Safety — real damage lives here

1. **`main` is production.** Every push to it is served to real players immediately. It requires
   Wyatt's approval, always. Staging (`npm run deploy:staging`) is pre-approved.
2. **`CNAME`, `robots.txt`, `sitemap.xml` never leave this repo** — they claim the live domain.
   Deploy with the scripts; never hand-roll a sync.
3. **Assume another session is on this branch.** `git pull --rebase` before every commit; claim an
   item in the ledger before editing it; own your artifacts (`--report=`), never overwrite shared
   ones.
4. **Kill every headless browser and server you started, before you reply.** Bound every probe.
5. **Absolute paths always** — more than one tree shares this layout.
6. **Fetch before you trust any git ref.** Never report git state from memory.

## The Proof — what "done" means

1. **Gear first** (`node scripts/qa/gear.mjs`): testing depth comes from the files touched, never
   from how the change feels.
2. **Four steps, never reordered**: a check that FAILS on the current build → the change → that
   same check green → sweep (`npm test`, `node scripts/sea_trial.mjs` at the gear's depth).
3. **Before Wyatt sees a build**: full voyages played to the end card in all three modes,
   host and guest screenshots compared. He playtests for taste, never for "does it work."
4. **Every item closes with a fresh-context CEO** (`ceo` skill), verdict appended to
   `.planning/CEO-REVIEWS.md`, reaching him in its words.
5. **Instruments earn trust like features**: a new checker is quarantined until it has caught its
   target bug — red-proof both directions. A check that cannot fail proves nothing. When a check
   condemns something known to work, suspect the check first.
6. **Write the prediction down before you measure** — and what would prove you wrong. Say plainly
   which parts were wrong afterwards.
7. **When the question is a picture, pose the board** (same seed, before/after, two screenshots) —
   never go hunting for a rate. When a bug makes no sense in its own moment, widen the time
   horizon: what happened just before?
8. **A comment is not a measurement.** Neither is a summary — open the source it summarizes.

## Working with Wyatt

1. **Ask 2–5 intent questions before building anything non-trivial — with the question UI, never
   prose.** Recommendation first, measurements in the question. Batch questions; park taste with a
   recommendation (never default it); answer mechanism from his recorded rulings, naming the one
   used.
2. **Restate every mid-flight instruction in your next reply.** Scroll up before hunting.
3. **Plain English, and state the SIZE**: what a player gets, how much of the problem it covers,
   what it leaves undone. Term-once teaching, and **one short lesson every day**, tied to the live
   work.
4. **One short report at the end of a run**: WHAT WORKED · WHAT I LEARNED (and where it's
   written) · WHAT'S NEXT. New information only. Corrections surface only when they change his
   decisions; the rest goes in the ledger. Never end a turn on an offer.
5. **Read every screenshot he sends, pixel by pixel** — pairs compared element by element; his
   annotations are a floor, not a ceiling.
6. **Anything he is meant to read or use is published and handed to him as a URL** — never a file
   path. When he steps away, ask him to confirm the phone link works; never claim remote control
   is down (you cannot know that — only he can re-arm it, with `/remote-control`).
7. **Hold the whole game.** His list outranks yours; say when the ask is not the biggest lever;
   triage and recommend before fixing a handed list.

## Design rules (detail loads at its trigger — `.claude/rules/`)

- **One display path**: host/guest decides who computes, never what is drawn. Before adding a
  second consumer of anything, converge the first into the new path. Ask: what makes these two
  agree?
- **Check `docs/INTENDED-BEHAVIOUR.md` before calling any host/guest difference a bug.**
- **Consistency is a core value** — same gesture, same behaviour everywhere; exceptions are
  Wyatt's explicit picks. **Nothing is a constant** — derive from what the game computes.
- **Bots and humans have identical rules and affordances.** The narration box reveals top to
  bottom. The credits/About page stays out of pirate voice — never "fix" it.
- **Read the graveyard**: the git log holds what was already tried; read it before re-running a
  settled argument. Read a subsystem's design doc (`docs/`) before writing a line in it.
- **Determinism**: the engine is seeded and replay depends on it — prefer UI-tier fixes; changing
  what the engine emits forces a gated re-record.

## The stack, in one breath

Vanilla HTML/CSS/JS, native ES modules, no build step (a code-privacy build step is an OPEN
decision — see the Chart). Firebase Realtime DB for multiplayer. Safari is first-class. Board
overlays join `CAM_HTML_LAYERS` or detach on zoom; continuous animation is HTML, never SVG.
