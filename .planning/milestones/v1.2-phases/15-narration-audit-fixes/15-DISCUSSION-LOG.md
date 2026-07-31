# Phase 15: Narration Audit & Fixes - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-27
**Phase:** 15-narration-audit-fixes
**Areas discussed:** Audit format & sign-off, Saying "you" in multiplayer, The fuzzy line fixes, Timing cut reach

---

## Audit format & sign-off

### Q1 — How should the narration audit reach you for review?

| Option | Description | Selected |
|--------|-------------|----------|
| Browser page | Throwaway HTML page (art-review gallery pattern) rendering every line as it looks in-game, grouped by moment, tagged keep/cut/merge/rewrite | ✓ |
| Markdown document | Plain document listing every line as raw text with notes | |
| Both | Page to look at plus a document to type edits into | |

**User's choice:** Browser page
**Notes:** Chosen so repetition can be judged the way a player experiences it — rendered, in sequence, with emoji and ingredient art, rather than as code.

### Q2 — How much should wait for your review before anything gets changed?

| Option | Description | Selected |
|--------|-------------|----------|
| One review, all wording | Page carries pruning marks AND proposed new wording for NARR-02…05; non-wording work (timing, anchorHold fix) builds in parallel | ✓ |
| Pruning only waits | Ship the six listed fixes without waiting; only pruning gates | |
| Everything waits | Nothing changes until the audit comes back | |

**User's choice:** One review, all wording

### Q3 — How hard should I recommend you cut?

| Option | Description | Selected |
|--------|-------------|----------|
| Rewrite rather than cut | Keep roughly the same line count; make blurred-together lines sound distinct | ✓ |
| Trim the true duplicates | Only flag lines that literally say the same thing twice | |
| Cut hard | One clear line per moment; remove variations on a theme | |

**User's choice:** Rewrite rather than cut
**Notes:** Flavor is not the thing being optimized away — sameness is.

---

## Saying "you" in multiplayer

### Q1 — How should "you" work in the big message box during a multiplayer game?

| Option | Description | Selected |
|--------|-------------|----------|
| Host sends both versions | Host writes each line twice (named + "you") and notes the subject seat; each client picks. No game-rule or event-stream change | ✓ |
| Log only in multiplayer | Captain's log says "you"; the big box keeps names online | |
| Each browser writes its own | Stop sending sentences between browsers entirely | |

**User's choice:** Host sends both versions
**Notes:** "Each browser writes its own" was rejected because ~18 ad-hoc messages aren't game events and would still need the string path — two systems to keep in step.

### Q2 — Only when you did it, or also when it happened to you?

| Option | Description | Selected |
|--------|-------------|----------|
| Both doer and target | "You attack Davy Scones" and "Davy Scones attacks you" (~44 lines gain a second version) | ✓ |
| Only when you did it | Matches the requirement literally (~30 lines) | |
| Round headers too | Plus storm/round banners speaking to you directly | |

**User's choice:** Both doer and target
**Notes:** Round/storm headers explicitly excluded — they address the whole table.

### Q3 — In pass-and-play, who is "you"?

| Option | Description | Selected |
|--------|-------------|----------|
| Whoever's turn it is | "You" follows the active human seat; bots get names | |
| Names only | No "you" at all when several people share one screen | |
| Only the first seat | "You" always means seat one | |
| **Other (free text)** | Name-prefix + second person | ✓ |

**User's choice (free text):** *"in pass-and-play, start with {playername} before saying you -- eg. Crustbeard -- you do this; or Crustbeard -- you're being attacked; or Crustbeard -- it's your turn"*

**Follow-up sent mid-discussion:** *"Actually -- i think we can keep the narration consistent across all play forms -- they can all start with your playername (it adds immersion) before using 'you'."*

**Notes:** This broadened the decision from pass-and-play only to every play mode, and simplified the work — one self-referential form rather than two. Immersion is the stated reason for the name prefix, not disambiguation.

---

## The fuzzy line fixes

### Q1 — Which missing "broke" line did you have in mind?

| Option | Description | Selected |
|--------|-------------|----------|
| Can't afford to sail | No coins means no move; currently silent, and completely silent for bots | |
| Can't afford to anchor | The "Pay 1🌕 to anchor" option silently vanishes when broke | |
| Both | A line for each | ✓ |

**User's choice:** Both

### Q2 — The bribe line — how should the three battle-coin situations read?

| Option | Description | Selected |
|--------|-------------|----------|
| Tell all three apart | Real bribe / cleaned out / raider, each with its own wording | |
| Just fix the raider line | Only clean up the leaked "2c (raider)" text | |
| Let me describe it | User spells out the mapping | |
| **Other (free text)** | Raised a rules concern instead | ✓ |

**User's response (free text):** *"I'm confused by the raider rule, I didn't write that. If an attacker loses, they should face the same consequences as the defender in the case that the defender loses. The defender should get 5c or their crate of choice; the outcome should be symmetrical."*

**Resolution:** Verified `asym` is hardcoded `false` (`src/engine/index.js:821`), so the raider branch never executes and its `"2c (raider)"` string can never reach a player. Battles are **already symmetrical** — attacker and defender losses both fall through the same block. No rules change, no engine change, no determinism re-record. The real source of the reported "2 🪙" was traced to `"N coins (all they had)"` rendering for a loser holding 2 coins.

### Q2b (re-asked after resolution) — How should the two battle-coin outcomes read?

| Option | Description | Selected |
|--------|-------------|----------|
| Bribe vs cleaned out | Keep bribe framing only where a bribe happened; the empty-hold case stops pretending | ✓ |
| One honest line | Collapse both, no bribe framing at all | |
| Let me write them | Placeholder wording, user drafts | |

**User's choice:** Bribe vs cleaned out

### "Already anchored safely" — no question asked

Traced to a bug rather than wording: `src/ui/flow.js:224` emits the `anchorHold` event without a `narrateLastEvent()` call, so the line never plays on the local player's own turn while bots narrate every storm outcome. Reported to the user as a one-line fix requiring no decision.

---

## Timing cut reach

### Q1 — What should the 10% cut apply to?

| Option | Description | Selected |
|--------|-------------|----------|
| Both narrations, not bubbles | Human + bot narration holds cut 10%; chat bubbles keep current timing | ✓ |
| Everything on the timer | Narration and bubbles all 10% shorter | |
| Your narration only | Bot lines already hold about half as long | |

**User's choice:** Both narrations, not bubbles
**Notes:** A bubble is another player talking to you, not the game reporting — it deserves the extra beat. Requires separating `showChatBubble`'s shared `msgHoldMs` call so the two can drift apart intentionally.

---

## Claude's Discretion

- How the audit page is generated (hand-written HTML vs a script walking `EVENT_NARRATION` and the `flash()` call sites) — a script is preferable if it makes "did we miss a line?" answerable.
- The exact new multiplier values (0.8 → 0.72, 0.5 → 0.45 are the literal readings).
- The exact shape of the widened `narr` payload, provided older clients fall back to today's `html`.
- Draft wording for every new or changed line — Claude drafts, Wyatt approves in the single review pass.

## Deferred Ideas

- Remove the dead `asym` / raider battle branch (`src/engine/index.js:567-568`, `src/orchestrator.js:516`) — verified unreachable, carries a player-facing string that can never render. Not in Phase 15: deleting an engine branch is a cleanliness change in a narration phase, and it sits next to the determinism corpus.
- `eov-narration-box-not-cleared` todo reviewed but not folded — already scoped as Phase 16's UI-07.
