---
phase: 15-narration-audit-fixes
extracted: 2026-07-30
sources:
  - 15-CONTEXT.md (D-16…D-60)
  - 15-PLAYTEST-NOTES.md (sessions 1 and 2; F1–F12, G1–G30)
  - 15-VERIFICATION.md (re-verification, 19/19)
  - 15-REVIEW.md (3 critical, 14 warnings, 4 info)
  - .planning/quick/20260729-* and 20260730-* (six quick tasks)
  - .planning/quick/20260729-playtest-bug-fixes/COIN-AUDIT.md
---

# Phase 15 — durable learnings

This is not a summary of what got built; the SUMMARY files already do that. This is the set of
patterns that showed up more than once, with the evidence that makes each one credible, so the next
phase does not have to rediscover them.

Nine learnings. Two of them are about mistakes I made.

---

## 1. "Is this string right?" has four separate answers. We only ever asked two.

**In plain terms:** we kept checking that a sentence existed and that the game *could* show it. We
never checked that it showed up in the right situation, or that it reached the right person. Those
two unasked questions produced the worst bugs of the phase.

The four dimensions, now written into the header of `scripts/ui_contract_check.js:405`:

| # | Question | Who asks it |
|---|---|---|
| 1 | **Provenance** — does the shipped text match what Wyatt approved? | the copy gate |
| 2 | **Structural reach** — can this string ever render at all? | the audit page's badges |
| 3 | **Co-reachability** — does it render *in the state it describes*? | assertion 6 |
| 4 | **Delivery** — does it reach the *intended viewer*? | assertion 7 |

**Evidence for dimension 3 — F11.** Wyatt's approved reason for the greyed Trade button
(*"No one's holding cargo to trade for yet."*) was in the source, spelled correctly, and provably
reachable. It sat in the `else` arm of an if/else-if chain whose two conditions were independent
(is an enemy adjacent? / is anyone holding cargo?). So whenever an enemy happened to be adjacent,
the greyed Trade button rendered with **Attack's** helper text beneath it — while Attack was
enabled. Present, reachable, byte-identical to its approval, and doing the opposite of its job.

**Evidence for dimension 4 — F7.** `ask()` at `src/ui/util.js:906` composed one broadcast string for
the whole table: the actor's raw prompt if the actor was the host, otherwise *"X is deciding…"*.
Since `ask()` runs on the host, this leaked **the host's private prompt to every guest**. The
recorded playtest caught `Wyatt, what'll ye do:` sitting on the guest's panel for 1694ms. It also
explains Wyatt's "empty blue box" complaint — the box was not empty, it held his own leaked prompt
faded to `opacity: 0`. Two complaints, one bug, photographed two seconds apart.

**Why it generalises.** Both bugs are invisible to the two questions we were asking. A grep proves
presence. A reachability badge proves the branch is live. Neither can see that two conditions are
mutually exclusive at runtime, or that a single broadcast cannot express a per-viewer difference.

**Do differently.** When reviewing any player-facing string, walk all four dimensions explicitly.
Note the irony worth remembering: dimension 1, provenance, is credited in that header to "the copy
gate" — and the copy gate is the one script in this phase that was never written (see #7).

---

## 2. A gate must be watched to fail before it is trusted. Five faked their own green.

**In plain terms:** five different automated checks reported success without actually checking
anything. Each one printed a number that looked exactly like a healthy result.

| # | The check | How it faked green |
|---|---|---|
| 1 | `… \| grep -c '^FAIL' \| grep -qx 0` (~8 uses in the hardening plan) | `grep -c` prints `0` on empty input, so a check for "no FAIL lines" passes when the assertion **was never written at all** |
| 2 | T9's `botWindLeg` mirror | reported *"0 call sites checked"* and passed — it looked for `narrateLastEvent()`, and `botWindLeg` narrates via `await flash(describeFor(…))` |
| 3 | `scripts/host_guest_parity_check.js` | ran its entry block and `process.exit()`ed **on import**, printing its own verdict during another gate's red-proof and making it look like the caller's result |
| 4 | `scripts/ui_contract_check.js` | same defect, **still unfixed** — its red-proof was done by temporary file swap instead |
| 5 | `scripts/narration_audit_check.js` assertion 8 (WR-06) | reads its input via `try { … } catch { return null }`, and `runChecks` only *pushes* the assertion when the input is non-null. Lose the file and the assertion does not fail — it **vanishes**, and the totals line re-derives itself to print `22/22 assertion group(s) PASS`, exit 0 |

Number 5 is the sharpest, because its trigger is not hypothetical: assertion 8 guards all 209 of
Wyatt's reviewed dispositions, and its input lives under `.planning/`, which **this project's own
`/gsd-cleanup` archives and `/gsd-pr-branch` strips**. The gate is designed to disappear on exactly
the day it matters.

**A sixth is still live.** WR-04: `ui_contract_check` assertion 6a, the assertion written
specifically to prevent F11, currently reports *"0 chain(s)"* — F11's own fix converted the chain to
independent `if`s, and 6a `continue`s when there are no chains. Its regex also requires a same-line,
brace-free assignment, so a natural re-introduction of F11 evades it. Its `--drill` red-proof passes
only because the synthetic fixture is written in the one shape the regex accepts. **That is luck
dressed as proof.**

**Two rules the phase converged on, both with working examples already in the tree:**

- **Assert presence before asserting absence.** The presence-first pattern
  (`.planning/quick/20260729-narration-audit-tool-hardening/PLAN.md:1095`): prove the assertion
  prints at all, *then* prove it prints no failures.
- **Refuse rather than skip when an input is missing.** `checkStormRainSeeded`
  (`scripts/ui_contract_check.js:718`) refuses to pass when it cannot find its anchors. WR-06 names
  it explicitly: *"the right pattern; copy it."*

**And the red-proof method that worked** (G26/T8): run the new gate against the **real** pre-fix
tree — `git show <parent-commit>:src/ui/flow.js` written to a temp root — never a synthetic fixture,
and **never a SHA hardcoded into the gate itself**, because a pinned SHA rots and turns a real
assertion into decoration.

---

## 3. The dominant failure mode was the *partial* fix, not the missed one.

**In plain terms:** over and over, the right code was already sitting a few lines away. Someone had
fixed the idea once and hand-copied it — and the copy drifted.

`15-PLAYTEST-NOTES.md:38` names it after the third occurrence in a single day:
*"a guard that exists in one path and was never carried to the other… **The engine is right every
time; it is the hand-copies that drift.**"*

| Finding | Right here | Wrong here |
|---|---|---|
| **G18** boxed-in bot escape | engine `takeTurn` (`src/engine/index.js:738`) | live UI `botTurn` (`src/ui/flow.js:944`) — bots froze in the game people play and escaped only in headless runs |
| **G15** paint before narrate | `botWindLeg:400` — *and it carries a comment describing this exact bug* | five `windLeg` branches (`:299`, `:307`, `:310`, `:341`, `:356`). The comment asserted the human path "already uses" the right order — true of the one line it cited, false of its siblings |
| **G29** leg summary guard | `src/engine/index.js:722` guards on movement | `src/ui/flow.js:549` **and** `:599` do not — producing *"A gale blows Crustbeard off the dock!"* followed by *"Crustbeard is still docked."* |
| **CR-01** ghost fade duration | moved 180→800ms in three places (`panel.js:241`, `index.html:289`, `panel.js:285`) | not the fourth — a `setTimeout(drop,250)` belt, which therefore **always won**, ripping every line out at ~70% opacity and leaving the box empty for 550ms |

**Two aggravating details worth carrying:**

- G15's literal test pins had **frozen the bug**: `narration_flow_test.js:68-73` asserted the *wrong*
  order for two branches and went red when the bug was fixed. A literal pin records behaviour, not
  intent. They were replaced with an invariant over the whole function.
- CR-01's two source files each carry a shouted comment — *"THIS NUMBER LIVES IN EXACTLY TWO
  PLACES… MOVE THEM TOGETHER"* — and **nothing gates it** (WR-07). The comment was wrong about the
  count and unenforceable either way.

**Do differently.** When you fix a behaviour, the next question is never "did it work?" but **"where
else is this same idea written?"** Then prefer, in order: (a) one shared function both paths call,
(b) an invariant over the whole file rather than a pin on one line, (c) at minimum, a gate. A comment
saying "keep these in sync" is not any of the three.

---

## 4. Host/guest forks: one idea implemented twice, four times over. Only structure fixed it.

**In plain terms:** the game has a "host" browser that runs the game and "guest" browsers that watch.
Four separate features were written twice — once for each side — and every one of them drifted apart.

| Fork | What drifted |
|---|---|
| **D-35** sail prompt | *"Crustbeard: click a highlighted square to sail"* on the host vs *"Yer move — click a highlighted square to sail"* on the guest. Same moment, same player, two sentences |
| **D-55** sail highlights | guest squares had no `sailCell` class, a different orange (`#fdb63d` vs `#ffc23a`), `.4` vs `.5` opacity, **no pulse animation and no hover** — the two affordances that say "this is clickable" |
| **D-57** narration fade | `showNarration()` was, in full, one line of `panel(html)`. No hold, no fade, ever. NARR-06's own success criterion was therefore **false for every remote player in every online game** |
| **F7** prompt delivery | one broadcast string where a per-viewer decision was intended (see #1) |

D-35's sweep found the structural signature and it is worth stating as a rule:
**guest-side code renders text, it never authors it.** `remotePickHighlights` was the only guest
function that composed its own player-facing copy, and it was the only one that had drifted. Every
other remote path is a pure renderer, so its wording *cannot* diverge.

**The cure that worked was structural, not disciplinary.** D-56 had already diagnosed it correctly a
day earlier — the two renderers *"match by discipline, not by structure — nothing enforces it, and
nothing would notice if they diverged tomorrow."* The fix that landed was one shared builder per
cross-tier surface (`sailHighlightRect()` for G25, `rimSweepPath()` for G14) plus
`scripts/host_guest_parity_check.js` with three red-proofed assertions.

**Say honestly how late this was.** For nearly the whole phase, none of the four was gated. The
parity gate landed on 2026-07-30, the last working day, and only because Wyatt asked directly whether
the four drifts were structurally fixed (*"yes, add it and pull D-55 forward"* — D-55 had been
deferred to Phase 16 twice). **D-57 is still unenforced today**
(`.planning/todos/pending/narration-two-schedulers-unenforced.md`, whose own description is now
stale — see WR-13 and W2). And WR-13 notes the new gate is symmetric-only with no presence floor:
drop `apDisabled` from *both* renderers and it stays green reporting "0 tokens on the host, 0 on the
guest." The pattern held, but it was not caught by process.

---

## 5. Playtesting and code review find disjoint sets of bugs. Neither substitutes.

**In plain terms:** the worst bugs came from two completely different activities, and neither
activity would have found the other's bugs.

**Only playing found these:**

- **F7** the prompt leak — needed two browsers, two seats, and a MutationObserver recording ~150
  lines. `15-PLAYTEST-NOTES.md:267`: *"the highest-value find of the playtest, and it was only
  findable by playing."*
- **F12** the negative purse — Wyatt at 1 coin, countered for 1 more, paid it, went to −1. Masked
  back to 0 by the `tradeBonus` `p.coins++`, which is exactly why nobody had noticed.
- **G15** the storm animation moving the boat *after* the message vanished.
- **F6/G8** the empty blue box, and the pacing judgement behind it.
- **F11** — playing, but only after **deliberately engineering the window**: a restarted game where
  turn order put the human first, so the menu rendered with zero cargo on the table. Note two of the
  four D-41 dead-ends were *still* never seen, because the bots kept closing the window.

**Only reading the code found these:**

- **CR-01** — the 250ms belt. Never visible as "a bug"; it looks like the fade is just quick.
- **CR-02** — `humanTrade` splices on an unchecked `indexOf`, so a `-1` removes the player's **last**
  crate and then mints a crate that is not in play. Reachable because `humanTrade` has no
  `turnExpired` guard at all, and `expireShotClock` resolves the pending prompt *before* confiscating
  a crate — so a timed-out partner **auto-accepts** a trade for a crate the clock just took.
- **CR-03** — a battle flee "refunds" a side-bet stake that collection never debited. Free coins, no
  event, no narration.

CR-02 and CR-03 are **pre-existing since Phase 11**, which is why they did not block the merge
(Wyatt: *"ship it and fix those next"*). Neither would ever surface in play — they are silent.

**Do differently.** Budget for both, and do not let a green playtest stand in for a read, or a clean
read stand in for a playtest. Also note the COIN-AUDIT's sharpest line about why a *third* kind of
check would have caught neither: the proposed headless invariant over the 31 determinism fixtures
was rejected because `Game.play()` is fully synchronous — *"It has no `await`, therefore no window.
… **It tests the one place the bug cannot be.**"*

**Harness lesson, cheap and real** (F3): two separate false defects in one session traced to a stale
ES-module cache in a playtest tab. After any source change, a playtest tab must be **hard**-reloaded.
The suggested mitigation stands: print the build's short commit SHA somewhere on the page, so "am I
running current code?" is answerable at a glance instead of by grepping source mid-playtest.

---

## 6. Constants that don't mean what they say — and the arithmetic that catches them.

**In plain terms:** the code said narration would stay on screen between 1.2 and 7 seconds. No player
ever experienced those numbers. The real range was 0.86 to 5.04 seconds.

The clamp was applied to the raw value and *then* multiplied by `MSG_HOLD_MULTIPLIER` (0.72), so
`1200` and `7000` were bounds on an intermediate number nobody ever sees. The visible range was
**864–5040ms**. Wyatt found it by reasoning about the source, not by any tool:
*"the clamp should happen last. right? The idea is that nothing is visible for less than 1200ms and
nothing is visible for more than 7000ms."* The comment now lives at `src/ui/util.js:903`.

**Two things make this worse than a simple slip:**

1. **The wrong number was documented and tested for three plans before anyone saw it as a bug.**
   `15-02-PLAN.md:137` pins `msgHoldMs("")` at *"864 (clamped floor 1200 × 0.72)"* and `:161` records
   it as a **mitigated** threat. The artifact of the bug was written down, reviewed, and accepted as
   correct behaviour.
2. **The fix had to retire the multiplier, not stack on it.** Keeping `MSG_HOLD_MULTIPLIER` would
   have rendered Wyatt's new 3200 ceiling as 2304 and his 1200 floor as 864 — recreating the exact
   defect one layer down. His numbers *are* the visible milliseconds now.

WR-14 lists the tail: **four load-bearing comments still contradicting the code** after G28 —
`panel.js:243` says "It stays 180ms" two lines above `800`; `index.html:274` computes a worst case
from a ceiling that is now 2000; `util.js:988` claims `chatBubbleHoldMs` shares "the same 1200/7000
clamp," which it no longer shares any part of.

**Do differently.** When a constant is meant to describe something a human will *perceive*, compute
the value the human actually gets and write **that** in the comment. If a multiplier sits between the
constant and the output, the constant is not the number — either move the multiplier or delete it.

---

## 7. Approved-but-never-applied: the approval-to-code step was a human retyping a list.

**In plain terms:** Wyatt reviewed and approved 209 pieces of game text on a web page. Getting those
words into the code was done by hand. Four of his rewrites never made it, and we could not prove how
many more were subtly wrong.

**The chain that must never break** (named in the hardening plan): `@copy` marker in source →
extractor `id` → card id → alias map → Wyatt's 209 dispositions.

**Three separate ways it leaked:**

1. **No comparison ever existed.** `15-VERIFICATION.md:291` states it flatly: no script compares
   shipped source text against `15-COPY-APPROVED.md` or the approval fields of
   `15-DISPOSITIONS-FINAL.json`. **There is no applier.** `scripts/narration_copy_check.js` still
   does not exist. This is recorded as *the phase's most significant residual*.
2. **`15-ADDRESSED2-APPROVED.json` was committed as "the source of truth for the fix" and then
   1 of its 11 rows was applied.** Seven coincidentally match what shipped; four genuinely diverge.
3. **The audit page rendered *converted* text live.** It applies its own `pirateVoice()` at the
   `msgBox` chokepoint every card passes through. So a card Wyatt tagged `keep` with empty notes
   *displayed* the converted text — and under D-25, `keep` means "ship exactly what this card
   displays." 15-06 applied only rows carrying explicit replacement copy and treated `keep` + empty
   notes as "no source change." At least 6 of 14 affected sites were confirmed `keep`-tagged and
   reviewed. **The game did not match what he signed off on.**

**Honest measurement, and its limits (F4).** Three passes over 144 reviewed non-merge approval
fields narrowed 37 unapplied → 19 → **3** hand-verified (plus F3's intro banner = 4). But 84 fields
have every distinctive fragment present while *word order and line identity were never checked*, and
41 are too placeholder-heavy to judge mechanically. **19 of 144 are conclusively settled.** The
heuristic establishes that the copy is broadly applied, not that it is right.

**The remedy that did work, and is worth stealing.** For the `pirateVoice()` breach, rather than
extracting the converter into `src/` (dead runtime code), the page's own regex was used as
*specification and verifier*: each of the 15 shipped literals is asserted byte-equal to
`pirateVoice(<the same literal at baseline 9ddd214>)`. That proves **shipped == approved**, not
"looks converted."

**Two matching rules learned the hard way:**

- **Never re-match an approved row to source by line number.** The `AD_HOC_META` line-number keying
  drifted twice. Match by label and by the literal text.
- **D-16 is absolute:** Wyatt's notes are words only — the notes box could not carry inline icon
  markup. **The absence of an icon from a note is never an instruction to remove it.**

**Do differently.** If a human is the transport between approval and code, assume loss. Build the
comparison gate *before* the approval pass, not after — and make the review surface show exactly the
bytes that will ship.

---

## 8. My own misses, recorded because they are the instructive ones.

### G30 — I wrote up a defect that contradicted a decision Wyatt made four hours earlier.

I claimed the `home` shelter line should stop saying "docked," because a square beside Tortuga is not
a berth. Wyatt: *"your diagnosis violates past insights."* He was right on two counts:

1. **He had set the model that same morning, deciding G2:** *"we're not adding another storm outcome
   — we're actually removing one. we're just treating tortuga like any other dock."* Under that
   model Tortuga **is** a dock, so "still docked" is accurate. G2 was explicitly a *removal* of
   Tortuga's special case; G30 proposed putting one back.
2. **D-28 had already settled the shared string** — `justDocked` / `home` / `dock`-when-unmoved are
   *"not three copies to consolidate, they are one string with three doors into it."* Splitting
   `home` off is precisely what D-28 warned a reader not to do.

What he actually saw was fully explained by **G29 alone**: the unguarded leg summary invents a
"blown off the dock" that never happened, which makes the following shelter line look contradictory.
One bug, not two.

**The lesson is worth more than the finding was.** I diagnosed from the code outward without checking
whether the behaviour I was calling wrong had already been *chosen*. The codebase's own comments at
the `moored` builder in `src/ui/util.js` say so at length — I read past them. **Before writing up
anything as a defect, check the decision record for the thing you are about to call broken.**

### CR-01 — I introduced a regression, and a code review caught it, not a gate.

G28 was my change. I moved the fade duration in three places and missed the fourth, so the feature
Wyatt had just watched and approved *never actually ran*. It shipped green because
`narration_test.js:955` pins only the CSS half. It was found by a human reading the diff
(`15-REVIEW.md:77`) and fixed in `8f76d5b`, which now derives the belt from `GHOST_FADE_MS` rather
than repeating the literal.

**Two things follow.** The gate that would have caught it is trivial and still absent for the general
case (WR-07: `grep GHOST_FADE_MS scripts/` returns zero hits). And "Wyatt approved it in the browser"
is proof about the *prototype he watched*, not about what shipped — a retune approved live still
needs its constants verified afterward.

---

## 9. What was luck, said plainly.

Not everything that worked was method, and it is worth separating the two so we do not over-trust the
process.

- **F11 was found because a game happened to start with the human first.** Two of the four D-41
  greyed dead-ends have *still* never been seen on screen, for the same reason in reverse — the bots
  kept closing the window in both recorded sessions. That is unmeasured area, not a clean bill.
- **Assertion 6a's red-proof passes on a fixture written in the one shape its regex accepts.** It
  reports "0 chains" against the real code (WR-04). We proved it can go red; we did not prove it goes
  red for the bug it exists to catch.
- **F12 was visible only at exactly 1 coin.** The `tradeBonus` `p.coins++` masks the negative purse
  back to 0, so a player with 2+ coins of headroom never sees it. We caught it at the one balance
  where it shows.
- **The COIN-AUDIT's reframing was the real win, and it was a judgement call, not a tool output.**
  Eight at-risk debit sites were correctly re-read as *"one missing step repeated eight times"*,
  which became the single shared `coinShortfall()` helper (G6). Its own sharpest line:
  *"The one debit that is provably safe on its own is the one that breaks six others, because safety
  was reasoned about per-line and the defect is between lines."*

---

## Queued follow-ups — see the source, not a restatement here

- `docs/DETERMINISM-RERECORD-NEXT.md` — engine purity (`spoil`/`gave` become data, drop `ilabelImg`
  from the engine, delete the dead raider branch), bot intelligence, STORM-02. **One gated
  `--capture` pass, not three.** §9 specifically warns against re-queuing the rim sweep or treating
  STORM-02 as solved because G14 shipped.
- `.planning/todos/pending/economy-trade-and-flee-corruption.md` — CR-02 and CR-03, both pre-existing
  since Phase 11. Its closing note ties directly to learning #3: *"G6 added re-validation for COINS;
  CR-02 shows CRATES were never given the same treatment."*
- `.planning/quick/20260730-bot-intelligence/PLAN.md` — not yet executed. Contains the transferable
  bit about **choosing your measuring instrument**: `cocoa_pirates_sim.py` was rejected as the
  benchmark and kept as history, because it does not model the rim at all and uses an 11-grid against
  the shipped 15 — *"measuring a change to one program using a different program."*
- Audit tool Tasks 5, 6, 7 (shipped-vs-approved comparison, applier, permanent scope rule) — recorded
  as deliberately absent in `15-VERIFICATION.md`, and the direct cause of learning #7.
