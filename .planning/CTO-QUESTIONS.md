# CTO questions — what the marathon worker needs from Wyatt

**Wyatt, 2026-08-27:** *"CTO asks for my input at critical junctures, and if that input is not given
within 10 minutes, it makes its best call and continues with the work."*

**AND THE EXEMPTION THAT MAKES THAT SAFE.** He is stepping away for DAYS. If every question defaults
after ten minutes, then every question defaults — and the CTO's "best call" quietly becomes the
entire design of the game while he is asleep. So questions come in two kinds and they are treated
differently:

| kind | what it covers | after 10 minutes |
|---|---|---|
| **MECHANISM** | which function, which file, what order, how to structure a fix | **takes the stated default and continues.** Logged, reversible, and named in the log so he can undo it. |
| **TASTE** | anything a player SEES and cannot un-see — wording, pacing, art, rules, difficulty | **NEVER defaults.** The item is PARKED and the CTO moves to the next backlog item. |

**Why taste never defaults:** CLAUDE.md is explicit that *"Taste, placement, wording and 'how much is
enough' are his. Mechanism is yours."* A ten-minute timer does not transfer taste; it only hides who
made the call. He comes back to a batch of QUESTIONS, not a batch of decisions somebody made for him.

> ### ⚠ THIS FILE IS THE ONLY CHANNEL. NOTHING PUSHES A QUESTION TO HIS PHONE.
>
> **Until 2026-08-27 this line read *"Every question is pushed to his phone when it is asked."* That
> was never true — no such code has ever existed.** Searching every script and hook for anything
> that reads this file finds exactly one program, `scripts/qa/cto_supervise.mjs`, and it only
> COUNTS the questions. (Its `push` calls are JavaScript array appends, which is presumably how the
> claim survived a reading.)
>
> Found by the CEO review of 2026-08-27, which put it plainly: *"If you are away for days, that is
> the difference between 'he has four questions waiting' and 'he never heard.'"*
>
> **So a parked question waits here until Wyatt opens this file, or until a session tells him.**
> Every CTO report must therefore name the open questions out loud rather than assuming he has seen
> them. If a real push is ever built, this warning is what should be deleted to make room for it.

## The format

```
### <ITEM-ID> — <one-line question>
- **kind:** MECHANISM | TASTE
- **asked:** <ISO8601>
- **default:** <what will happen at +10 min, or "none — TASTE, parks instead">
- **why it matters:** <one plain sentence>
- **answer:** <blank until Wyatt answers; then his words, verbatim>
- **resolved:** <ISO8601, or blank>
```

## Open questions

### Q-1 — Crustbeard started the ovens, but everyone got another turn before the bake-off. Is that right?
- **kind:** TASTE (rules — his)
- **asked:** 2026-08-27 (from his playtest notes)
- **default:** none — TASTE, parks instead
- **why it matters:** He is not sure whether he is misremembering his own rules. **Measure what the
  engine actually does and show him; do not change it.** A rule changed on a guess is a game he no
  longer recognises.
- **answer:**
- **resolved:**

### Q-2 — Should a player be able to watch a bot's bake-off?
- **kind:** TASTE (pacing — his)
- **asked:** 2026-08-27 (from his playtest notes: *"I didn't get to watch crustbeard's bakeoff, but i want to."*)
- **default:** none — TASTE, parks instead
- **why it matters:** Traced to ONE missing publish, so it is cheap to build — but it adds time to
  **every** bot turn, in every game, forever. That is a pacing decision, and pacing is taste.
- **answer:**
- **resolved:**

### Q-3 — The "End of voyage" heading now stays put instead of scrolling away. Keep or revert? ✅ RESOLVED
- **kind:** TASTE
- **asked:** 2026-08-26 (checklist item #5)
- **default:** none — TASTE, parks instead
- **why it matters:** Nobody set out to change it; it fell out of moving "Play again!" outside the
  scroller. One line either way.
- **answer:** **"Keep it — stays put."** Wyatt, 2026-08-27.
- **resolved:** 2026-08-27

  *Worth noting for the record: this question sat open for a day and cost one line of a question
  form to close. **Front-loading works.** Two of the three parked questions below are still open
  only because they need a MEASUREMENT put in front of him first, not because he is slow.*

### Q-4 — The staging build stamp drops the BRANCH name. Keep it that way?
- **kind:** TASTE (wording of something he reads on every playtest)
- **asked:** 2026-08-27 by the cloud CTO, while shipping W0-3
- **default:** none needed — **already shipped one way and trivially reversible**, one line in
  `scripts/deploy-staging.sh`. Flagged rather than parked because it does not block anything.
- **why it matters:** He decided W0-3 as *"date-based build number, staging appends `-staging`"*.
  Taken literally that also deletes the `@<sha>` added this morning — and that was added because
  staging once served different code under a stamp byte-identical to production's, so he would
  have played a stale build with no tell. **The sha was kept.** What was dropped instead is the
  branch name, which the commit already implies. The ☰ menu now reads:

      Build 2026.08.27.3-staging@0ad2e83     (was: v4 · build 2026-08-26k-CUTOVER-STAGING/aug26-night-fixes@b8d61e42)

  The deploy log still prints the branch, so nothing is lost from the record — only from the screen.
- **answer:**
- **resolved:**

### Q-5 — Today's build is numbered `.3`. Is that the right count?
- **kind:** MECHANISM, but **named as a guess** rather than defaulted quietly
- **asked:** 2026-08-27 by the cloud CTO
- **why it matters:** `YYYY.MM.DD.N` needs N = the Nth build published that day, and nothing in the
  repo counts publishes. **`2026.08.27.3` was taken verbatim from the number he wrote in the
  backlog**, not derived. If a different count is right, it is one character.
- **answer:**
- **resolved:**

### Q-6 — You cut "after dark" from the black-market card. Should the dock recap lose it too?
- **kind:** TASTE (wording — yours). **PARKED, not defaulted.**
- **asked:** 2026-08-27 by the cloud CTO, surfaced by two agents independently while shipping W2-2
- **why it matters:** Your new line is *"Sold-out islands fly the black market flag. They'll find ye
  one more ingredient — for 10🌕."* You deliberately dropped "after dark". But four lines in
  `src/ui/util.js:758-764` still narrate a black-market purchase as happening
  **"under cover o' dark"** — so the card that teaches the rule and the recap that reports it now
  use different imagery for the same act. Rule 8 says that is a defect *unless you chose it*.
- **the options, none taken:** (a) drop "under cover o' dark" from the recap to match the card;
  (b) keep it — the card states a rule, the recap narrates a moment, and flavour is welcome there;
  (c) something else.
- **nothing was changed either way.** This is wording a player sees, so it never defaults.
- **answer:**
- **resolved:**

### Q-7 — The How-to-Play rulebook types `3🌕` and `1🌕` by hand
- **kind:** MECHANISM, but reported rather than fixed because the fix is not small
- **asked:** 2026-08-27, found by the W2-3 audit at `index.html:2724`
- **why it matters:** Every other place in the game now DERIVES the dock payouts from
  `cfg.dockHeads` / `cfg.dockTails` — that is rule 9, and it is why a stale comment claiming
  "TREASURE PAYS 5" survived next to code paying 3. The rulebook modal is static HTML with no
  access to `cfg`, so making it derive needs a real mechanism, not a copy edit. `.planning/todos`
  already records this ("How-to-Play modal hardcodes economy numbers"). **Left alone deliberately:
  it is the one surface where the numbers can silently go wrong, and it deserves its own item.**
- **answer:**
- **resolved:**

### Q-8 — "Muse" wants a tooltip, and the game has no tooltip for an ENABLED button
- **kind:** MECHANISM (reported, not defaulted — it is bigger than the copy change it serves)
- **asked:** 2026-08-27 by the cloud CTO. This ANSWERS the open question the backlog attaches to
  W2-7: *"is there a tooltip mechanism for this button at all today?"*
- **the answer is no, and here is the evidence.** The only tap-to-explain mechanism in the prompt
  system is `data-why` (`src/ui/util.js:1730-1737`), and it is written **only when a button is
  DISABLED** — `it.disabled&&it.why`. It exists to explain why a greyed control cannot be pressed.
  There is nothing that attaches an explanation to a button a captain CAN press. The only other
  `title=` in the prompt path is on a captain ROW (`util.js:157`), not a button.
- **so W2-7 is two jobs, not one.** Renaming Pass → Muse is a copy change. Giving it the tooltip
  *"Watch the water and write a recipe about what you see."* needs a new affordance that does not
  exist — and rule 8 says whatever is built becomes the way EVERY enabled button explains itself,
  everywhere, forever. That is a design decision, not a rename.
- **also in the graveyard (rule 10), so nobody re-runs it silently:** this label already read
  *"Look into the ocean"* on 2026-08-05 and **was changed back to "Pass"** (`src/ui/util.js:558`
  records it). "Muse" is a different word and the rename is Wyatt's call; the history is here only
  so the argument is not repeated by accident.
- **nothing was changed.** The rename was not shipped on its own, because shipping half of it
  leaves a button whose whole point is a hint nobody can see.
- **answer:**
- **resolved:**

### Q-9 — The short weather line would delete three bits of your approved copy. All seven days, or only the calm ones?
- **kind:** TASTE (wording + scope — yours). **PARKED, not defaulted.**
- **asked:** 2026-08-27 by the cloud CTO, from the W2-1 measurement
- **the ambiguity in W2-1 is RESOLVED first:** you meant the **day-start narration line**
  (`src/ui/util.js:412-441`), not the wind pill. Decisive: your template `Day 12: Wind south.
  Tomorrow: a storm.` is **38 characters** and the pill is already **27**, so "too long" cannot be
  about the pill — and the pill carries no day number, while the narration line is the only surface
  with a day, a wind and a next-day wind in one sentence.
- **what is actually on screen today, all seven branches, measured:**

  | chars | line |
  |---|---|
  | 57 | `— Day 1: wind is blowin' north — 🧭 Next day: wind south.` |
  | 82 | `— Day 4: wind still blows west, this westerly is gusting — 🧭 Next day: wind east.` |
  | 84 | `— Day 7: wind still to the east, this easterly won't quit — 🧭 Next day: wind north.` |
  | 101 | `— Day 5: wind is blowin' south — 🧭 Next day: ⛈️ a storm's comin' — no tellin' which way she'll blow.` |
  | 91 | `Day 6: A ⛈️ storm be ragin'! It'll blow every ship 3 squares west. 🧭 Next day: wind north.` |
  | 139 | `— Day 9: ⛈️ The storm's baked in and won't cool down! It's aiming north...` |
  | 165 | `— Day 11: ⛈️ The storm's baked in and won't cool down! It's still aiming south. Fie, Poseidon!...` |

- **WHY IT WAS NOT SHIPPED.** Your template has no slot for a storm, so applying it to all seven
  deletes three things that are **your own approved copy** (`11cbf345`, 2026-07-29, from the 209
  reviewed dispositions, re-approved at D-49):
  1. **the storm's rule** — *"It'll blow every ship 3 squares west"* is the ONLY place a player is
     ever told how far a storm moves them;
  2. **the wind-streak flavour** — *"this westerly is gusting"*, *"won't quit"*;
  3. **"no tellin' which way she'll blow"** — the v2.1 rule (`4749bcd2`) that a FORECAST storm names
     no direction. Rendering it as `Tomorrow: a storm.` is a guess at your wording, not your wording.
- **the options:** (a) all seven days take the short form, and those three go; (b) the calm days go
  short and storms keep a sentence of their own — cuts 57→~33 chars on the common case and keeps
  the rule on screen (**the CTO's recommendation**); (c) short form plus your own storm wording.
- **the edit is ready either way** and derives day and both directions from the event (rule 9);
  nothing about the weather would be typed. `windHoldPhrase` (`util.js:336`) becomes dead code if
  the streak flavour goes.
- **⚠️ NO GATE PROTECTS THIS COPY.** Nothing under `scripts/` contains any of those literals, and
  the narration tests that did are in the parked `test:v1` chain.
- **answer:**
- **resolved:**

### Q-10 — With the shot clock away, the little clock panel goes quiet. What should it say? [TASTE]

- **what happened:** you had the shot clock taken out (temporarily) so the one-activity-engine work
  races nothing. The countdown, the ⏱ ribbon chip and the ⏱ toggle are gone; the ▶/⏸ pause button
  and its panel stay. While a bot plays, the panel still reads "waiting". When it is a human's turn
  it used to read "turn clock" — a feature that is no longer there — so for now it shows a blank
  label with a dim "–".
- **the options:** (a) leave it blank until the clock returns (**shipped for now — least invented**);
  (b) hide the little panel entirely except while paused; (c) your own words for an idle helm.
- **answer:**
- **resolved:**

### Q-11 — A guest's flip prompt now shows the full option row, like the host's. Keep it? [TASTE]

- **what happened:** converging the prompt renderer (one code path for host and guest — your rule)
  fixed a three-phase-old gap: a guest facing a coin-flip prompt that ALSO had other choices only
  ever saw the coin — the other buttons were never drawn on their screen. Now a guest sees exactly
  what the host sees: the coin AND the buttons. Also: a guest's plain coin-flip now shows the
  ceremony title and stakes (like the host) instead of a floating text bubble the host never had.
- **why it shipped without waiting:** the mapping notes said this needed your call; but rule 23
  says host and guest must draw one game, and the host's rendering was the intended one. If you
  prefer the old guest look, that is a deliberate exception to state, not a revert.
- **answer:**
- **resolved:**

### Q-12 — During the everyone-picks-a-recipe moment, whose boat should glow? [TASTE]

- **what happened:** while every captain picks a recipe at once (online), the glow used to sit on
  the LAST captain in the list — an accident of the old code, not a choice. The converged draft
  dispatcher does not reproduce it, so during the simultaneous pick nobody's boat glows. On a
  shared device (pass-and-play) the glow still follows whoever holds the device, seat by seat.
- **the options:** (a) nobody glows during a simultaneous pick (**shipped — honest, nothing is
  anyone's turn**); (b) every waiting captain glows; (c) something else.
- **answer:**
- **resolved:**

### Q-13 — The host coalesces back-to-back moments; a guest sees each one. Even them out? [MECHANISM — but the fix is player-visible, so parked as TASTE]

- **what happened:** both screens now draw through ONE consumer (your one-activity-engine ask).
  One difference remains, now localized to a single line: when the engine emits two events
  back-to-back, the host's screen draws only the second (its pops and sound for the first are
  skipped), while a guest draws both. Making the host match the guest means the host would
  hear/see slightly MORE than today — extra coin pops and sounds at moments that were silent.
- **the options:** (a) leave the host as it has always been (**shipped**); (b) drain every event
  on the host too, matching the guest exactly — one small edit, but it changes what you hear.
- **answer:**
- **resolved:**
