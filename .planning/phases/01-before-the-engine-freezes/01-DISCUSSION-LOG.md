# Phase 1: Before the Engine Freezes - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-18
**Phase:** 1-before-the-engine-freezes
**Areas discussed:** The clock key already in players' browsers; The dead planner isn't dead; How the pass line says "+1🌕"; How wide the namespace sweep goes; The balance check

---

## Area selection

Four gray areas offered; Wyatt selected all four. A fifth (the balance check) was flagged in the
preamble as one Claude would otherwise decide, and Wyatt chose to settle it at the end.

---

## The clock key already in players' browsers

Presented with the measurement that `/4` is `Disallow`'d in `robots.txt:8` and `noindex` at
`4/index.html:10`, so only invited playtesters carry the planted key; and that the guard at
`4/src/ui/stage.js:1478` is `== null`, so it never unsets once written.

| Option | Description | Selected |
|--------|-------------|----------|
| Migrate then delete | Copy `pp_timerOff` into `pp4_timerOff`, then remove the old key. Preserves the `/4` setting; hands live back its own default. Risk: cannot distinguish a preference set in live from one set in `/4`. | |
| Delete it outright | Remove `pp_timerOff`, start fresh on `pp4_timerOff` (default OFF). Simpler, one less branch. Anyone who had deliberately turned the clock ON inside `/4` gets it switched off once. | ✓ |
| Leave it, just stop writing it | Namespace going forward only. Zero risk of overwriting a live preference; every playtester keeps the clock off in the real game until they toggle it by hand. | |

**User's choice:** Delete it outright.
**Notes:** Claude added, uncontested, that the deletion must be a one-time cleanup guarded by a
marker — deleting on every load would re-commit the same bug from the other direction.

---

### Follow-up: the default once multiplayer returns

Asked because the answer decides whether Phase 1 builds one stored key or two. Presented with
`4/src/orchestrator.js:1575` (host pushes the local preference to the whole room) and the intake
finding at `4/src/orchestrator.js:1143-1152` (`remotePrompt` has no timeout, so a dropped guest hangs
the host's voyage).

| Option | Description | Selected |
|--------|-------------|----------|
| OFF everywhere — one key | Keep the intent, one key. The hang is real but already scoped to MP-13 in Phase 4. | ✓ |
| OFF solo, ON when hosting | The clock is the only thing that currently unsticks a host waiting on someone who walked away. Costs a second preference and a branch. | |
| Defer — decide it in Phase 2 | Namespace as-is now; revisit with a real measurement after multiplayer playtesting. | |

**User's choice:** OFF everywhere — one key.
**Notes:** Wyatt's rationale, verbatim: *"multiplayer is played between friends, who can communicate
through the chat. the host's game would be 'hung' because their friend is no longer playing, even if
the timer was on."* He then raised two related multiplayer issues unprompted — guest reconnect, and
chat having nowhere to render in the new layout. Both captured as deferred to Phase 2; neither is
Phase 1 scope. Claude answered the reconnect question from the code rather than guessing.

---

## The dead planner isn't dead

First presentation used code names and was rejected: *"i don't understand your question, or what
planTurnClassic is -- give me more context."* Re-presented in plain language — two bot brains, only
one plays, the old one is the opponent in the tuning test.

| Option | Description | Selected |
|--------|-------------|----------|
| Keep it, label it loudly | Leave the code, put a blunt sign on it. Keeps the ladder's yardstick. | |
| Delete it, rebuild the test differently | Game ships one brain; the test compares against a saved recording instead of a live opponent. | ✓ |
| Move it out of the game code, into the test | Satisfies the criterion literally and keeps the ladder, but it leans on six other engine methods and needs reattaching from the script. | |

**User's choice:** Delete it — arrived at by his own reasoning rather than by picking an option:
*"we should never use the old bot brain, it's done. Bot tuning should be done with the newest
algorithm that is actually used in game. this follows one of my design principles -- elegance. why
would we use bot logic to simulate a game that is different from the actual bot logic in the game?
what am i missing here?"*

**Notes:** He was not missing anything. The old brain answers only "is the new brain better than the
old one?", which is settled and written down; the question Phase 1 needs answered lives entirely
inside the shipping brain. Claude named the one real cost — the numbers in
`docs/BOT-V3-RACE-PLANNER.md` become permanently unreproducible — and he proceeded.

**Correction surfaced during this area:** `REQUIREMENTS.md:130` and
`research/v2.0-intake/CODE-QUALITY.md:59` both claim `planTurnClassic` has zero callers.
`scripts/bot_ladder4.js:29` reads it off the prototype. FIX-06 is therefore two pieces of work.

---

## How the pass line says "+1🌕"

| Option | Description | Selected |
|--------|-------------|----------|
| Trailing `(+1🌕)` | Renderer appends the coin; all 100 hand-written strings untouched; one place to change. | (initially selected, then overridden) |
| A shared line of your own words | One clause added to all 50, saying out loud that passing pays. | |
| Write all 50 by hand | Each creature gets its own payment line. Best writing; 100 strings; every one a drift risk. | |

**User's choice:** Initially "Trailing `(+1🌕)`", then **overridden mid-flight**: *"add to the end of
each line 'and ye scribble a new recipe (+1🌕)' -- show me 10 sample lines now to make sure it
works."*

**Notes:** The 10 rendered samples exposed a grammar failure his clause could not survive in the
third person. Roughly 20 of the 50 lines end on the *creature* as nearest subject
(*"…and a dozen donut shrimp bounce past"*), so a conjugated clause hands the pen to the shrimp. The
addressed version was fine because he had written "**ye** scribble," which reaches back and grabs the
subject. Presented with the choice between repeating the name every time, sorting all 50 by hand, or
rewriting the clause, he rejected the whole direction: *"it's honestly pretty awkward, and it's
getting really long. is there a way you can work it into the beginning or end of each line, so that
it's easy to read but also cute? the core idea: you're getting recipe inspo from the sea creatures.
core constraint: must be short and easy to read."*

### Re-offer: a subjectless fragment

| Option | Description | Selected |
|--------|-------------|----------|
| `That's goin' in the recipe (+1🌕).` | 6 words. Matches the elision already in the corpus ("gettin' sassy"). | |
| `Into the recipe book it goes (+1🌕).` | 7 words. Warmest and most storybook; implies a physical book. | |
| `Recipe idea! (+1🌕)` | 3 words. Shortest by a wide margin; the tag never competes with the joke. | ✓ |

**User's choice:** `Recipe idea! (+1🌕)`.
**Notes:** All three were shown rendered on the same three lines, including the donut-shrimp line
that had broken every earlier attempt. A subjectless fragment needs no conjugation and no agreement,
so one string serves both persons across all 50 entries and the hand-written prose stays untouched.
Claude noted, uncontested, that the whole tag gets wrapped unbreakable rather than just the
parenthetical.

---

## How wide the namespace sweep goes

Presented initially as "five more keys leak the same way." **That framing was wrong and was corrected
during the area** — it grepped what `4/` writes without checking what the live game reads. The two
games share four keys, not six; `pp_rematch` and `pp_seaIdx` are `4/`-only and cannot leak.

Re-asked as a standing rule rather than a per-key decision.

| Option | Description | Selected |
|--------|-------------|----------|
| Share who you are, split how you play | Identity and name follow the player; anything that changes game behaviour gets a per-game key. Mute stays shared. Answers every future key. | ✓ |
| Each game keeps its own settings | Only identity shared. Cleanest separation; costs re-entering the captain name when switching games. | |
| Just fix the clock, decide the rest later | Smallest change; the next person to add a stored setting has no rule and will guess. | |

**User's choice:** Share who you are, split how you play.

---

## The balance check

Offered as an area Claude would otherwise decide; Wyatt chose to settle it.

| Option | Description | Selected |
|--------|-------------|----------|
| A bug — fix it before the freeze | If the ladder shows pass-farming, adjust before Phase 3 and report exactly what moved. Costs nothing now; after Phase 3 the same fix costs a re-record. | ✓ |
| A strategy — leave it, record the number | A player who works out that patience pays has found a real line; watch it in playtesting instead. | |
| Bring me the number, I'll decide | Safest, but puts a decision in his lap mid-phase and blocks Phase 3 until answered. | |

**User's choice:** A bug — fix it before the freeze.

---

## Claude's Discretion

- Where the dubloon is applied — `Game.ev()` is a recorder, not a reducer, so a shared `doPass()`
  helper is preferred over three inline payments.
- The one-time-cleanup marker mechanism for deleting `pp_timerOff`.
- Fixing the `no_undef_check` getter/setter false positive in the checker rather than in working
  code, and keeping the root and `4/` copies byte-identical.
- Sweeping all five `pp_timerOff` read/write sites in `4/`, not just the one FIX-01 names.
- Wrapping the whole narration tag unbreakable rather than just the coin parenthetical.
- Re-verifying which classic-planner helpers are safe to delete before deleting them.

## Deferred Ideas

- **Guest reconnect** (Phase 2) — works on paper via `pp4_sess`, but that code has never executed in
  `4/`, and Phase 2's criteria gate only the *host* reloading.
- **Multiplayer chat placement** (Phase 2) — `4/index.html:1503` disables the on-board speech bubbles
  entirely in the new stage layout. Chat has nowhere to render. A design job.
- **Bot-doc citations** (Phase 9) — `docs/BOT-V3-RACE-PLANNER.md` and `docs/FABLE-BOT-BRIEF.md` cite
  the deleted planner as the control arm; annotate rather than delete.
- **Three adjacent v1 todos** — bot/human parity audit; the v1 timer-toggle complaints. Re-point or
  close after the cutover.
