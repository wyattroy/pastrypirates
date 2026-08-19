# Phase 02.1 — deferred items

Things found while executing this phase that are **out of scope for the plan that found them**.
Each names who owns it. Nothing here was fixed by the plan that recorded it.

---

## D1 — `docs/DRIVING-THE-GAME.md` §5c now teaches the opposite of the truth

**Found during:** 02.1-01 Task 3 · **Owner:** DOC-06 · **Recorded:** 2026-08-19

§5c's "what to assert for lockstep" table tells the next session, in bold, that
`game.players[].pos` / `.ing` / `round` are **HOST ONLY** — *"stale on a guest; never compare these
across clients"* — and its worked example prints the frozen spawn positions as proof.

After 02.1-01 that is false for `4/`. Those fields are now correct on a guest, and comparing them
across clients is exactly the right probe. **The doc is not merely out of date — it actively steers
the next session away from the check that would catch a regression of this very bug.**

The same section's caveat is why the fix took this long to be seen: the staleness had been written
down as a *property of the design* rather than a bug. `.planning/WINDOWS.md` entry 2 carries the
same note in the same words.

Not fixed here because 02.1-01's plan pins its diff to `4/src/orchestrator.js` alone, and the
executor prompt names DOC-06 as the owner of this file's repointing.

---

## D2 — `docs/DRIVING-THE-GAME.md` §5b's driver stalls forever on a disabled circle

**Found during:** 02.1-01 Task 1 · **Owner:** DOC-06 · **Recorded:** 2026-08-19

The published autoplay driver picks `#actionPanel .apBtn` with no liveness filter. A disabled
circle is still in the DOM and still has an `onclick`; `isDisabledBtn()` (`4/src/ui/util.js:1258`)
is `aria-disabled="true"`, and clicking one does nothing at all.

**Measured, this session:** a guest reached `coinStepper()`'s fallback (`4/src/ui/flow.js:1475` —
a REMOTE seat gets the ± stepper, not the slider), whose `− 1🌕` is disabled at the floor. The
driver clicked it **460 times over ten minutes**. The host sat frozen mid-battle waiting for an
answer that could never arrive, and the probe reported "harness incomplete" rather than any fault
in the game. The game was fine; the documented driver could not play it.

The fix used in this phase's rig, for the doc to adopt:

- filter to live buttons — `b.getAttribute('aria-disabled') !== 'true' && !b.disabled`
- prefer the **committing** circle first (`cls:"primary"` — "Offer it!", "Ask it!", every confirm),
  so a quantity prompt is answered rather than nudged
- a stall-breaker: the same label five times running means the press is not landing — rotate

---

## D3 — `.planning/WINDOWS.md` frontmatter counts disagree with its own rows

**Found during:** 02.1-01 Task 3 · **Owner:** unassigned (pre-existing) · **Recorded:** 2026-08-19

`gsd-tools windows append` refuses to write:

```
Error: Ledger counts disagree with entries:
frontmatter open/waived/fixed/total=5/1/9/15 but entries yield 6/0/3/9.
```

Pre-existing, unrelated to anything this phase touched, and it means **the ledger cannot accept new
entries at all** — which is why D1 and D2 are recorded here instead of there. Worth repairing
before `/gsd-ship`, since the ship gate reads that file.

---

## D4 — the why bubble shows a SYSTEM emoji coin, not the game's coin art

**Found during:** 02.1-02 Task 2 (seen in the screenshot, not in any assertion) · **Owner:**
unassigned — needs Wyatt's ruling · **Recorded:** 2026-08-19

With the flat-card bug fixed, tapping a greyed circle now speaks its whole reason, and the picture
shows what the numbers could not: the coin in that bubble is the **yellow system emoji 🌕**, while
every other coin on the same screen — the circle's own `(−2🌕)`, the captains list, the ribbon — is
Wyatt's drawn coin. Two different coins, a hundred pixels apart.

`showWhy()` (`4/src/ui/flow.js:162`) sets `d.textContent = why`, with the comment *"the reason is
prose, never markup"*. That is a deliberate choice and it is what makes the bubble immune to the
very corruption 02.1-02 just fixed — so it must not be casually undone. Rendering the coin art
there means letting that bubble accept markup again, which re-opens the door this plan closed.

**Not fixed here, deliberately:** it is pre-existing (the bubble behaved this way before this plan
too — the text was simply truncated so nobody saw the coin), it is outside 02.1-02's stated scope
(`emojify()` only), and whether one system emoji is worth reintroducing markup into the one
tooltip that is currently markup-proof is a taste-and-risk call that belongs to Wyatt, not to an
executor. It is flagged under CLAUDE.md rule 6 (consistency is broken here — but only
intentionally once he has seen it).

**Where to look:** `shots/green-guest-showwhy.png` and `shots/green-host-showwhy.png` from this
plan's probe run.
