# Parity-gate rows watched RED before their convergence — Wave 1

Per the gate's own rule: a row added after the fact proves nothing.

## renderAskPrompt DECL row — RED pre-convergence, 2026-08-28T05:55:45.164831Z

```
localAsk           listeners=0  host-loop=6  SUPERSEDED by renderAskPrompt — not a renderer any more — the LOCAL RESPONSE MECHANISM, reached THROUGH renderAskPrompt on both tiers. W1, 2026-08-28.
renderAskPrompt    listeners=0  host-loop=0  shared
```

## Q-18 / gate 48 — `scripts/qa/q18_narr_event_order_check.mjs`, 2026-08-29

**Step 1 of the four steps: the gate, shown FAILING on the broken tree, before the fix.**
CEO Review 25 ran the rebuilt gate against `87cf0e00^` — the tree as it was before the correction —
and got **5 failing assertions, exit 1**, including assertion 9, the one that holds Wyatt's ruling.
So the gate discriminates: it is not merely green on a tree that happens to be right.

**And ELEVEN breakages re-inserted into a scratch mirror, each proven to turn it RED.**
Six from CEO Review 24, all of which had walked past the first version green:

| | breakage | what it does to a player |
|---|---|---|
| B1 | `o["n"]=…` inside `Game.ev` | the engine emits a new field — the whole determinism corpus needs a re-record |
| B2 | `game.events[i].n=…` beside the wire stamp | the engine's own array is dirtied from outside |
| B3 | a second `payload.evN = 0` | every line names event 0, so nothing ever waits — the fix is off |
| B4 | `appState.evSeen=1e9` after the record | the guest's frontier is past every serial — the wait never engages |
| B5 | delete the single `tick();` | **the guest silently loses every held narration line, forever** |
| B6 | `NARR_EVENT_GRACE_MS = 2000` | a two-second stall on a line whose event is late |

Five from CEO Review 25, which walked past the rebuilt version green **and past all 48 gates**:

| | breakage | what it does to a player |
|---|---|---|
| N1 | the engage condition rewritten to `(false)` | the ordering barrier never engages on any line, ever |
| N2 | delete `applySubject();` from `drawIt` | **Wyatt's ruling entirely off**, and W4-2's subject fix with it |
| N3 | capture `myGen` BEFORE the bump | **every held line dropped forever** — B5's catastrophe, by reordering two adjacent lines |
| N4 | `evAt` returns `arr[0]` | the guest computes the subject from the wrong event |
| N5 | `arr[n].n=n` on evAt's own alias | the engine's array dirtied through an alias B2's search cannot see |

A sixth, N6 (inverting `subjectOf`'s rule), is caught by `w42_battle_bubble_check.mjs` instead —
the disclosed division of labour working, not a hole.

**THE RULE ALL ELEVEN TEACH, and it is one rule:** *an assertion that turns on ONE SPELLING of one
thing is not an assertion.* B1 was one property-access spelling. N1 was the presence of a condition
rather than its operands. N3 was two lines in the right order, which no presence test can see. N5
was the same write under a different name. Read the SET, the COUNT, the ORDER, or the OPERANDS —
never merely the presence.

### Six more, from CEO Review 26 — and the rule above was written and then not applied

The paragraph immediately above says *"read the SET, the COUNT, the ORDER, or the OPERANDS — never
merely the presence."* Assertions 9 and 10, written in the same commit as that paragraph, were
**presence tests**. All six of these were green on gate 48 **and on all 48 gates**:

| | breakage | what a player gets |
|---|---|---|
| **P2** | `const pre=window.__pp4.subjectSet` **`&&false`** | **two characters reverse the whole fix** — the wire carries nothing again, exactly as it did for days, while assertion 10 (written for this bug) prints its PASS line word for word |
| P1 | `evN:appState.narrEvIdx` → `evN:null` | the subject and the serial split back into two facts; the barrier is off on every line |
| P4 | `appState.narrEvIdx=null;` moved above the read in `readSubject` | no line ever carries a serial |
| P5 | `payload.evN = evN - 1` | every serial off by one — the guest resolves the wrong event and anchors bubbles to the wrong captain |
| P6 | a second `window.__pp4.subject = 0`, crew only | the host anchors every bubble to seat 0 while the guest computes correctly — pure host/guest divergence, W4-2's own family |
| N4′ | `return arr[0];` inserted **above** the lookup instead of replacing it | N4's catastrophe respelled — every presence test still matches, over code that can never run |

**P2 and N4′ are the ones to learn from, and they teach the same thing from two sides.** P2 leaves
the *position* of every required substring untouched and changes what the expression *evaluates to*.
N4′ leaves every required substring *present* and changes whether it is *reached*. A gate that asks
"is this text here, and is it before that text" answers yes to both.

**So: an assertion must read the OPERANDS of a condition and the REACHABILITY of a statement, not
the presence or the position of either.** Seventeen breakages are now on this page across three
reviews, and every single one of them is an instance of that one sentence.
