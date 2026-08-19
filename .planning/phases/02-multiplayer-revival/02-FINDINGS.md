# Phase 2 Findings — what actually broke in the multiplayer revival

This is the record the ROADMAP asked for: not a feature list, but what the six plans in this phase
actually found when they turned the networking back on and drove it against the live game. Phases 4
and 5 are meant to be scoped from this document without re-running any of the work behind it —
everything below points at the plan summary that proved it rather than restating the proof.

Everything headless closed clean. The remaining gate — Wyatt playing a real voyage on his phone — is
this phase's own plan 02-07, and nothing here substitutes for it.

---

## 1. The one thing we deliberately did not fix: a dropped guest can hang the host forever

`remotePrompt()` (`4/src/orchestrator.js:1142-1152`) is how the host asks a rival — human or bot —
for a decision and waits for the answer. Read it and there is no clock anywhere in it: it sets up a
Firebase listener for that seat's response and just waits. If the guest who owns that seat closes
their laptop, loses signal, or simply never answers, the host's game sits frozen on that turn with no
way out short of the guest coming back or someone leaving the table.

**No code was written for this, on Wyatt's own ruling, given 2026-08-19: "write it down, don't fix
it."** That is not an oversight this document is flagging — it is the correct call, and the reasoning
is worth carrying forward so Phase 4 doesn't reopen the argument:

- **The obvious fix — a countdown that forces a guess if nobody answers — is already ruled out.**
  Phase 1's own decision record (D-03) settled this: *"multiplayer is played between friends, who can
  communicate through the chat. The host's game would be 'hung' because their friend is no longer
  playing, even if the timer was on."* A shot clock only helps if the problem is someone thinking too
  long. The problem here is someone not there at all, and a timer can't tell the difference between
  "still deciding" and "gone." Turning the clock on for this would punish players who are simply
  taking their time, without actually solving the case it's meant to solve.
- **The real fix is knowing the guest left, not guessing how long is too long.** That's presence
  detection — watching for the moment a player's connection actually drops — and it's already scoped
  as its own piece of work: MP-13, in Phase 4, which is about the bake-off's version of this exact
  problem (a captain who disconnects mid-bake). The engine's fallback guess is meant to fire on that
  presence signal, not on a clock. Phase 2 restored the networking; Phase 4 is where the "someone left
  the table" answer belongs.

So this is a known, named gap, not a bug that slipped through. Nobody hit it during the shakeout (see
§3), and it's expected that nobody will during a friendly two-person test voyage either — this only
bites when a real player actually walks away mid-turn, which is exactly the case Phase 4's MP-13
exists to close.

**A related paperwork problem, worth fixing before anyone plans against these documents again:**
`REQUIREMENTS.md`'s FIX-03 checklist item names exactly three sites to fix — the recipe-draft crash,
the unguarded room read, and the unescaped host HTML. `02-CONTEXT.md`'s own "Integration Points"
section, under a heading that literally says *"FIX-03's three sites, located by shape,"* lists **four**
bullets — the same three, plus this `remotePrompt` gap. The heading's count doesn't match its own
list. For the record: **FIX-03 in this phase meant the three named sites only.** The fourth item was
never FIX-03's to fix; it's the standing gap this section describes, and Phase 4 owns it under MP-13.

---

## 2. The three questions the ROADMAP asked this phase to answer

### Did the guest ever actually run the new stage?

No — not until this phase forced it to. The redesigned mobile view (the ribbon, the captain's box,
every bit of the `4/` visual redesign) had **never executed once on a guest's screen**, because
multiplayer had been switched off since before the redesign existed. The first time anyone tried to
observe it in a real networked game (plan 02-03, trying to test the skip button), it wasn't there at
all — not broken, just never built. A leftover guard from before Firebase was restored was silently
skipping the entire stage for every crew game. See §3 below for the fix; the finding here is that
nothing in `02-CONTEXT.md` or `02-RESEARCH.md` knew this guard existed, because nobody had run the
guest side of the redesign until this phase did.

Once fixed, the guest-side stage held up. A full played-out voyage (host and guest, seventeen days,
plan 02-06) ran the guest through every checkpoint sampled with no crash and no silent failure — the
ribbon, the camera, the prompt panel all rendered correctly the whole way through.

### Does the guest's lag on the ship-sliding animation match what the comment says it should?

Yes, as far as this phase could measure it. The code has a comment on the guest's rim-sweep animation
(`4/src/orchestrator.js:1210`) admitting a small, deliberate lag: the guest's coin and crate totals
update about one sweep's worth of time (roughly a tenth of a second per square moved) after the ship
itself finishes sliding, because the totals are drawn after the animation instead of during it. The
comment calls this accepted, not a bug. The full-voyage shakeout ran this animation on every single
event pushed to the guest and never saw it throw or desync — but nobody put a stopwatch on the actual
lag itself this phase, so "matches the comment" is confirmed by absence of trouble, not by a timed
measurement. Phase 4/5 planning that touches this animation should measure it directly rather than
trust the comment a second time.

### Does a greyed-out button give the guest the same reason the host would have gotten?

Yes, and this is a stronger answer than "seemed fine" — it's guaranteed by how the code is built, not
by luck. When an option is disabled (not enough coins, say), the host writes the *reason text* once
and broadcasts it; the guest's copy of the button markup just displays whatever it was handed. So a
guest tapping a greyed circle and a host looking at the same greyed circle are always reading the
identical sentence, because there's only ever one sentence written. The full-voyage shakeout confirmed
this directly on the guest side (a real disabled "Buy" button, tapped, showed its reason, matched
exactly). No host-side sample happened to exist in that same run, but given how the text is generated,
that's a difference of "we happened to sample it" rather than "it might differ."

---

## 3. What actually broke, and how a player would have seen it

**A guest crashed silently during the recipe draft, every time.** The moment a guest tried to watch
the shared recipe-picking screen mid-draft, their whole page died with no visible error — the screen
just stopped responding. The cause: the code assumed Firebase always hands back the list of picks as
an array, but the real, sparse mid-draft shape (some seats picked, some not) comes back as a plain
object instead, and the array-only code threw the instant it saw that shape. This closed before the
shakeout ran; see `02-02-SUMMARY.md`.

**A captain whose room vanished mid-start got the wrong error and got stuck.** If a room disappeared
in the moment between a captain tapping "start" and the game actually loading, the old code crashed
with a raw, unhelpful error and left that captain stranded on the room screen with a stale session —
worse, it told them "couldn't reach the multiplayer service," which is the wrong problem entirely.
Fixed to route through the same "this game is gone" screen the game already uses elsewhere. See
`02-02-SUMMARY.md`.

**The entire mobile redesign silently never turned on for a crew game.** This is the biggest surprise
of the phase and the one no document predicted. A single leftover line of code, written before
Firebase existed in `4/`, blocked the whole stage — the ribbon at the top, the day counter, the boats,
the clock, everything — from ever appearing in a networked game. It wasn't found by looking for it; it
was found because plan 02-03 tried to test the skip button and discovered there was nothing on screen
to click. Every plan after that one had to re-check its own work against the fixed version, because
anything built or tested against the broken tree would have been building on a screen that was never
really there. Full account and the measured before/after: `02-03-SUMMARY.md`.

**Typing a longer captain name than the game allows freezes the page with no explanation.** The name
box on screen lets you type up to 40 characters. The database itself only accepts 18, silently,
server-side — and going over that limit doesn't show an error message, it pops a blocking browser
alert that stops the page from responding to anything until it's dismissed, which on a phone looks
exactly like the game has crashed. This was already flagged before this phase started; it got a real,
concrete repro during this phase's work (a captured error message, not just a suspicion) and is not
fixed — it's out of scope for Phase 2 and is recorded here so whoever picks it up doesn't have to
rediscover it. See `02-04-SUMMARY.md` and `02-06-SUMMARY.md`.

**A tool problem worth knowing about, not a game problem:** when something throws inside the
networking code on this game's plain dev server, the browser's own error reporting lies about it —
it reports a useless generic "Script error" instead of the real error. The real error text only shows
up through a lower-level browser inspection channel. This cost real time diagnosing the recipe-draft
crash above and will cost the same time again for anyone debugging this tier without knowing it. See
`02-02-SUMMARY.md`.

---

## 4. What the documents got wrong, and what held together better than expected

Two of this phase's own planning documents (`02-CONTEXT.md`, `02-RESEARCH.md`) named a helper function
`esc()` in `4/src/ui/util.js` as the thing responsible for making sure a typed name can't be rendered
as live markup. **That function doesn't exist.** What actually does that job is a different, correctly
exported function called `escHtml`, which lives in `4/src/ui/recipe.js`, reached through `pn()` →
`pname()`. Every prompt, every rendered name in this game already goes through that real path. Anyone
reading the old citation and going looking for `esc()` in `util.js` will find a same-named local helper
that isn't it. See `02-04-SUMMARY.md` for the full correction.

The plan's own worked example for reproducing the recipe-draft crash — "seat 0 and seat 2 have picked,
seat 1 hasn't" — **does not actually crash the game.** Firebase pads that particular gap and hands
back a normal array, not the sparse shape the crash needs. The real trigger, found only by testing
directly against the live database rather than trusting the written example, is a single pick landing
at seat 3 (or any seat two or later) with nobody else having picked yet. The fix covers both shapes
either way, but the worked example that was meant to prove it was itself wrong. See `02-02-SUMMARY.md`.

The third of FIX-03's named crash sites — a worry that a captain's typed name could reach another
player's screen as live, clickable markup instead of plain text — **turned out to already be closed.**
Nothing needed fixing. `pname()` was already routing every typed name through the correct escaping
function before this phase started; the fear was real enough to be worth checking directly (and it
was checked, on a live guest's screen, with a name deliberately shaped like an attack), but the
protection was already there. See `02-04-SUMMARY.md`.

---

## 5. A design ruling made today, and why it applies everywhere, not just to chat

Hold-the-sea — holding a finger on the water to see the board underneath whatever's floating on top of
it — used to only work while a decision prompt was on screen. That meant a narration line sitting on
its own, or the new chat flash this phase added, wouldn't step aside for a held finger at all, which
breaks the game's own consistency rule: the same gesture should do the same thing everywhere.

Measured and put to Wyatt directly, he ruled: **widen it. Unconditionally, for every floating box on
the board, not just the new chat flash.** A held finger on the sea now dims everything floating over
it, full stop — narration bubbles, prompts of every style, the chat flash, all of it. The two
exceptions Wyatt already chose stand exactly as they were: the centre-stage story beats at the start
of a voyage, and the veil that covers the flip ceremony. Those two are still enforced by name in the
stylesheet, not by the touch handler, so widening the touch handler couldn't accidentally sweep them
in. Implemented in `02-05-SUMMARY.md`.

---

## 6. For Wyatt's gamelog shelf

Two rounds of headless testing this phase left rows behind in the permanent voyage log that Firebase
will not let anyone delete (not even Wyatt — that log is write-once by design, to keep it honest).

- **Four small test rows from plan 02-01**, each under 1KB and clearly tagged as throwaway/test data,
  already recorded in `02-01-SUMMARY.md`'s "Known Issue" section.
- **One full played-out test voyage from plan 02-06**, tagged with the identifier
  **`CLAUDE-PROBE-02-06`** — search the gamelog shelf for that exact string to find and permanently
  filter out the one complete voyage this phase's shakeout legitimately played to the end. Its captain
  names were also obviously test data (`CLAUDE-PROBE-0206`, `PROBE-0206-GUEST`), and it ended on day
  17. Full detail in `02-06-SUMMARY.md`.

No other row from this phase's work should be in that log — every other probe stopped short of the
end on purpose, since reaching the end is the one thing that can't be undone.
