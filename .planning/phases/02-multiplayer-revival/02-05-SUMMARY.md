---
phase: 02-multiplayer-revival
plan: 05
subsystem: multiplayer
tags: [chat, stage-ui, ribbon, hold-the-sea, css-specificity, headless-chrome, cdp]

# Dependency graph
requires:
  - phase: 02-multiplayer-revival (plan 03)
    provides: "The fixed `maybeBuildStage()` gate and the networked-mode ⏩ test (`appState.db && appState.room`) this plan's chip visibility and 💬 gating reuse verbatim, plus the proven two-process CDP host+guest driving pattern this plan's two probes extend."
provides:
  - "A 💬 chip in the ribbon, visible only in a crew game, that opens #pp4ChatSheet — the classic #chatPanel re-parented wholesale (not rebuilt), leaving #chatLog/#chatForm/#chatInput and orchestrator.js's wiring to them completely untouched"
  - "An unread dot (#pp4ChatDot) that lights while a message is unseen and clears the moment the sheet opens"
  - "#pp4ChatFlash: a message flashes under the ribbon, reveals with a typewriter, holds on D-15's own chatBubbleHoldMs curve, and fades — dismissible by a tap at any point including mid-reveal"
  - "Hold-the-sea (body.pp4Peek) now arms on ANY sea touch, not only while a prompt is showing — a direct mid-plan ruling from Wyatt, closing the gap where a lone narration bubble or the new flash never dimmed at all"
affects: [02-06, 02-07, 02-FINDINGS.md]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Re-parent, don't rebuild: a container element is created in stage.js's buildStage() (matching the existing #pp4Cap/#pp4Prompt/#controlsRow pattern) and the pre-existing static node is moved into it via appendChild, so ids and their orchestrator-side wiring never change."
    - "One capture-phase pointerdown listener, extended with a second condition block per toggleable sheet, rather than one listener per sheet."
    - "A floating box's CARD VALUES are copied by hand into its own id-scoped rule rather than sharing an existing class, when that class is also used as a behavioral selector elsewhere in the code (stage.js's `document.querySelector('.pp4Bub')` specifically means the live narration bubble)."
    - "CSS transition settle time (>160ms) is now a standing measurement caveat for this codebase: reading getComputedStyle immediately after a class toggle on an element carrying `transition:opacity` reports the STARTING value, not the cascaded target — proven by isolated repro, not assumed."

key-files:
  created:
    - "<scratchpad>/cdp.mjs — shared CDP launcher/client (Chrome launch, WebSocket JSON-RPC, poll helper), built fresh this plan since the scratchpad is session-isolated"
    - "<scratchpad>/probe-chat-sheet.mjs — Task 1's automated verify: host+guest networked voyage plus solo and Pass & Play passes, 14 checks"
    - "<scratchpad>/probe-chat-flash.mjs — Task 2's automated verify: host+guest networked voyage, 18 checks including two probe-authored red-proofs"
  modified:
    - "4/index.html — #pp4ChatSheet, #pp4Chat/#pp4ChatDot's shared-box-rule extension, #pp4ChatFlash, and #pp4ChatFlash added to the body.pp4Peek fade-rule selector list"
    - "4/src/ui/stage.js — ribbon markup (💬 chip), ribbonTick's chip-visibility gate, buildStage's sheet creation + open/close handler, the extended tap-outside listener, and the widened hold-the-sea arm site (Wyatt's mid-plan ruling)"
    - "4/src/ui/panel.js — appendChatLine gained the flash/unread-mark hook; renderChatFlash, removeChatFlash and setChatUnread are new exports"

key-decisions:
  - "The flash's top anchor is .pp4Bub.ambient's own 74px-under-the-ribbon offset, not #pp4Pill's 52px. #pp4Pill (the wind pill) is on screen for nearly the whole game at 52px; anchoring the flash there would sit it directly on top of the pill. 74px is the value this codebase already uses for exactly this role (an ambient top banner clear of both the ribbon and the pill), copied as a number, not re-derived."
  - "#pp4ChatFlash gets its OWN id-scoped CSS rule with .pp4Bub's card values copied into it, rather than sharing class=\"pp4Bub\". stage.js:1197's `document.querySelector('.pp4Bub')` specifically means the live narration bubble (it compares the bubble's text against the radial prompt's own pill to decide whether to retire it early) — a second element carrying that class would be a real behavioral hazard there, not just visual duplication. Confirmed by reading that call site, not assumed."
  - "The flash's hold duration is chatBubbleHoldMs() (4/src/ui/util.js, D-15) — the codebase's own dedicated chat-bubble hold curve, base 1000ms + 50ms/char + 300ms/pause, clamped 1200–7000ms, ×0.8 multiplier. Not msgHoldMs (the narration curve) and not a new number. The 300ms fade-out delay before DOM removal mirrors stageFlash's own `.pp4Bub.out` + `setTimeout(...,300)` pattern (stage.js) — also an existing number. The typewriter's 20ms/char rate is REVEAL_MS_PER_CHAR, the same module-scoped constant showChatBubble already uses."
  - "The unread-dot CLEAR on open is written twice by construction, not by an oversight: Task 1's sheet-open handler (stage.js) toggles #pp4ChatDot's class directly rather than importing panel.js's setChatUnread, because Task 1 committed before that export existed — importing a not-yet-exported name would have broken the module graph at that intermediate commit. Task 2 exports setChatUnread for appendChatLine's own SET side. Both write the same 'on' class to the same element; this is recorded so a later session doesn't 'simplify' one call site into the other without re-checking commit ordering."
  - "Wyatt's mid-plan ruling — hold-the-sea widened to arm on ANY sea touch, not conditionally on #pp4Prompt showing — was implemented in stage.js even though Task 2's own `<files>` tag didn't name that file; the plan-level frontmatter's `files_modified` already listed it, and the ruling was given directly for this session, overriding the task's original narrower read_first question."

patterns-established:
  - "A red-proof for a probe assertion that depends on live game state impossible to wait for naturally (here: a moment with zero narration/prompt content, which promptTick's own design keeps almost always non-empty) is done by forcing that one input directly per docs/DRIVING-THE-GAME.md §5e, then firing a REAL event and reading back what the real handler does — not by manually driving the effect (body.classList.add) and asserting on itself."

requirements-completed: [MP-03]

coverage:
  - id: D1
    description: "A 💬 chip in the ribbon, visible only in a crew game, opens a slide-up sheet built from the reused #chatPanel — #chatLog/#chatForm/#chatInput ids and the orchestrator's wiring to them are untouched"
    requirement: "MP-03"
    verification:
      - kind: e2e
        ref: "<scratchpad>/probe-chat-sheet.mjs (headless CDP, host+guest live Firebase voyage plus solo/Pass&Play passes) — 14/14 checks pass; visibility gate red-proofed (forced to 'none' in networked mode -> 3 checks failed as expected, restored -> green)"
        status: pass
    human_judgment: true
    rationale: "D-09 (02-CONTEXT.md): Claude shakes it out headless first; Wyatt then plays a real voyage on his phone, and THAT is the close. Chat also carries no requirement ID of its own — filed under MP-03 per the plan's own flagged_assumptions — and whether it READS right in play is explicitly a manual-only verification in 02-VALIDATION.md."
  - id: D2
    description: "An incoming message flashes briefly under the ribbon, reveals with a typewriter, holds on the chat-bubble curve, fades, carries an unread dot, and obeys hold-the-sea exactly like every other floating box — including the widened arm site that now dims a lone floating box with no prompt showing"
    requirement: "MP-03"
    verification:
      - kind: e2e
        ref: "<scratchpad>/probe-chat-flash.mjs (headless CDP, host+guest live Firebase voyage) — 18/18 checks pass; two assertions independently red-proofed (the widened arm site, and the body.pp4Peek selector list) before being trusted green"
        status: pass
    human_judgment: true
    rationale: "Same D-09 rationale as D1 — headless proof is real and red-then-green, but the phase's own ruling reserves the close for Wyatt's phone pass. Whether the flash READS right (timing, placement, legibility) is also explicitly a human judgment call, not something a probe can settle."

duration: ~2h
completed: 2026-08-19
status: complete
---

# Phase 2 Plan 5: Chat gets a home — the 💬 chip, the sheet, and the flash Summary

**Chat's sending/receiving code was already intact; only its place was gone. Restored as D-06/D-07 describe — a ribbon chip opening a re-parented (not rebuilt) sheet, an unread dot, and a flash under the ribbon on D-15's own hold curve — plus, on a direct mid-plan ruling from Wyatt, hold-the-sea now dims every floating box on a sea touch regardless of whether a prompt happens to be showing, closing a gap the flash itself would otherwise have fallen straight into.**

## Performance

- **Duration:** ~2h
- **Completed:** 2026-08-19
- **Tasks:** 2 (both `type="auto"`)
- **Files modified:** 3 (`4/index.html`, `4/src/ui/stage.js`, `4/src/ui/panel.js`)

## Accomplishments

- **The 💬 chip and the sheet (Task 1).** `#pp4Chat` sits in the ribbon immediately before ☰, sharing `#pp4Clock`/`#pp4FF`'s one box rule (their heights are pixel-identical, measured from the rendered page, not computed). It shows only in a crew game — `appState.db && appState.room`, the same test the ⏩ chip and the classic `#chatPanel` display gate already use. Clicking it toggles `body.pp4Chat`, re-parenting the pre-existing `#chatPanel` (its `#chatLog`/`#chatForm`/`#chatInput` ids untouched) into a new `#pp4ChatSheet`; opening clears the unread dot and focuses `#chatInput`; a tap outside the sheet closes it through the SAME capture-phase listener the ☰ menu already uses, extended with a second condition rather than duplicated.
- **The flash (Task 2).** `appendChatLine` (panel.js) — the one function `watchChat` already calls for every incoming message on every client — now also renders `#pp4ChatFlash` under the ribbon, skipping a captain's own message and skipping entirely while the sheet is open. It reveals with a typewriter (the same `REVEAL_MS_PER_CHAR` rate `showChatBubble` uses), holds on `chatBubbleHoldMs()` (D-15's own chat curve — not the narration curve, not a new number), and fades using the same `.35s` transition + `300ms` removal delay `stageFlash`'s own bubble already uses. A tap dismisses it instantly at any point, including mid-reveal.
- **A mid-plan ruling, implemented as directed.** Wyatt's read_first question for Task 2 asked whether hold-the-sea's arm condition (previously gated on `#pp4Prompt` being visible) should widen to cover a lone floating box. He answered directly, mid-session: widen it unconditionally, and the same reasoning applies to the whole `body.pp4Peek` rule, not just the flash. `4/src/ui/stage.js`'s `gestures()` pointerdown handler now adds `pp4Peek` on any sea touch, full stop; the two sanctioned exceptions (centre-stage intros, the flip veil) are enforced entirely by the CSS selector list, not by the arm site.

## Task Commits

1. **Task 1: A 💬 chip in the ribbon and a sheet that slides up** — `997b4d8` (feat) — `4/index.html`, `4/src/ui/stage.js`
2. **Task 2: The flash under the ribbon, and hold-the-sea widened** — `2b519e4` (feat) — `4/index.html`, `4/src/ui/panel.js`, `4/src/ui/stage.js`

## Files Created/Modified

- `4/index.html` — `#pp4ChatSheet` (fixed, bottom-anchored, no slide transition — see Deviations/Decisions), `#pp4Chat`/`#pp4ChatDot` (extends the `#pp4Clock`/`#pp4FF` shared box rule), `#pp4ChatFlash` (own id-scoped rule, values copied from `.pp4Bub`), and `#pp4ChatFlash` added to the `body.pp4Peek` selector list.
- `4/src/ui/stage.js` — ribbon markup gained the 💬 button; `ribbonTick()` gained the chip's networked-only visibility gate; `buildStage()` gained the sheet's creation/re-parent and its open/close handler; the capture-phase tap-outside listener gained a second condition block for the chat sheet; the `gestures()` pointerdown handler's hold-the-sea arm site was widened per Wyatt's ruling.
- `4/src/ui/panel.js` — `appendChatLine` gained the flash/unread-mark hook (guarded on own-message and sheet-open); `renderChatFlash`, `removeChatFlash` and `setChatUnread` are new exports.
- `<scratchpad>/cdp.mjs`, `<scratchpad>/probe-chat-sheet.mjs`, `<scratchpad>/probe-chat-flash.mjs` — not committed (scratchpad, session-isolated, per the plan's own artifact list).

## Swept Surfaces

**Hold-the-sea (`body.pp4Peek`) — every surface checked, with a verdict:**

| Surface | Verdict |
|---|---|
| `#pp4Prompt` (all styles: radial, centred, plain) | Still fades correctly under `pp4Peek` — probe-measured opacity `.13`, matched exactly against `#pp4ChatFlash`'s own opacity under the same class. Radial's own `#pp4Prompt.radial{opacity:1}` rule has LOWER CSS specificity than `body.pp4Peek #pp4Prompt{opacity:.13}` (1,1,0 vs 1,1,1) so it does not win — confirmed via CDP's `CSS.getMatchedStylesForNode`, not asserted from reading the rule. |
| Narration bubbles (`.pp4Bub`), including the new-day/wind lines | Selector unchanged, still present in the rule. Not independently re-probed against a live narration bubble this plan (none was modified), but the mechanism that would have failed it — the arm site reading `#pp4Prompt`'s visibility — is exactly what was widened; forcing `#pp4Prompt` hidden and firing a real touch now arms `pp4Peek` regardless, which is the general case a lone `.pp4Bub` needs too. |
| The stay-put confirm (`.pp4Stay`) | Selector unchanged, still present in the rule. Not independently modified or re-probed this plan. |
| `#pp4ChatFlash` (new) | Added to the selector list explicitly; probe-verified opacity `.13` under `pp4Peek`, matching `#pp4Prompt`'s own value under the same class. Red-proofed: removing it from the selector list made the check fail (`null` opacity match), restoring made it pass. |
| Centre-stage intros (`#pp4Prompt.pp4Center`) — sanctioned exception | Still fully opaque (`opacity:1`) under `pp4Peek` — the override rule read directly from the live stylesheet via CDP, its `cssText` confirmed to still set `opacity: 1`. |
| The flip-ceremony veil (`#pp4Veil`) — sanctioned exception | Confirmed by construction: no `body.pp4Peek` rule anywhere in the stylesheet targets `#pp4Veil` at all (probe searched every rule; found none), so it cannot be dimmed regardless of the arm-site change — the exception was never implemented as a special case and doesn't need to be. |
| The ☰ footer menu (`#footerRow`) | Checked and confirmed it correctly does **not** participate in `pp4Peek` — it's a menu, not informational content over the board, and was never in scope for hold-the-sea. |

**The sheet's open/close gesture and z-order — every surface checked:**

| Surface | Verdict |
|---|---|
| ☰ footer menu (`body.pp4Foot #footerRow`) | The precedent. Chat's sheet follows the identical pattern (toggle a body class, close on outside tap) and reuses the SAME `document.addEventListener("pointerdown", ..., true)` registration — extended with a second `if` block (different body class, different exclusion selector), not a second listener. |
| The recipe sheet (`#pp4Prompt.pp4Recipes`) | Checked and found N/A for this comparison: it is a mode of the decision prompt itself, not a user-toggleable sheet — it opens with a prompt and closes when the player commits a choice, with no tap-outside gesture of its own to match. |
| The prompt panel (`#pp4Prompt` in general) | Same verdict as the recipe sheet: state-driven, not user-toggled. Nothing to extend. |
| z-order | `#pp4ChatSheet` is `z-index:61`, above the footer menu's `60`, above the ribbon (`20`), `#pp4Fx` (`21`), `#pp4Cap` (`22`) and `#pp4Prompt` (`30`). Verified structurally (the stylesheet's declared values); the footer-open-plus-chat-open simultaneous case was not separately exercised live — closing one via an outside tap on the other's chip is handled by the same listener's two independent condition blocks, but that specific interaction was reasoned about, not driven. |

## Where the flash's timing came from

- **Hold duration:** `chatBubbleHoldMs(text)`, `4/src/ui/util.js` — D-15's dedicated chat-bubble curve (`base 1000 + 50/char + 300/pause`, clamped `1200–7000ms`, then `× CHAT_BUBBLE_HOLD_MULTIPLIER` (0.8)). Not `msgHoldMs` (the narration curve — different base/rates/clamp). Reused verbatim; no new duration.
- **Fade-out delay before removal:** `300ms`, matching `stageFlash`'s own `.pp4Bub.out` → `setTimeout(() => b.remove(), 300)` in `stage.js`. An existing number, not invented for this plan.
- **Reveal rate:** `REVEAL_MS_PER_CHAR` (`20`), the same module-scoped constant `showChatBubble` already uses in `panel.js`.
- **Fade transition duration:** `.35s`, matching `.pp4Bub`'s own `transition:opacity .35s`.
- Measured end-to-end for a short message ("hi"): appear-to-gone was `~1030ms` against an expected `~1260ms` (`960ms` hold + `300ms` fade), the difference explained by CDP round-trip/polling overhead that can only ever shrink the observed window, never grow it.

## How the sheet's open/close was reconciled with the ☰ menu's

Extended the **same** capture-phase `pointerdown` listener `buildStage()` already registers for the footer menu, adding a second `if` block inside the same callback rather than a second `addEventListener` call:

```js
document.addEventListener("pointerdown", e => {
  if (document.body.classList.contains("pp4Foot") && !e.target.closest("#footerRow,#pp4Menu"))
    document.body.classList.remove("pp4Foot");
  if (document.body.classList.contains("pp4Chat") && !e.target.closest("#pp4ChatSheet,#pp4Chat"))
    document.body.classList.remove("pp4Chat");
}, true);
```

Each block toggles its own body class against its own exclusion targets, since the two sheets close against different "outside" definitions and different classes — a single folded selector would have made one sheet's tap-outside accidentally close the other.

## Deviations from Plan

### Auto-fixed / directed issues

**1. [Directed by Wyatt, mid-plan] Hold-the-sea's arm site widened, touching `4/src/ui/stage.js` in Task 2**
- **Found during:** Task 2's own `<read_first>` question ("decide and state whether the flash should widen that condition").
- **What happened:** Rather than leaving this to my own judgment, Wyatt answered directly for this session: widen `gestures()`'s pointerdown handler to arm `pp4Peek` on any sea touch, unconditionally, and apply the same reasoning to the whole `body.pp4Peek` rule rather than the flash alone.
- **Why in scope despite Task 2's own `<files>` tag not naming `stage.js`:** the plan-level frontmatter's `files_modified` already listed `4/src/ui/stage.js` for the whole plan; the ruling was explicit and directly given, not inferred.
- **Fix:** `gestures()`'s pointerdown handler no longer reads `#pp4Prompt`'s visibility at all — it adds `pp4Peek` unconditionally. The two sanctioned exceptions are enforced entirely by the CSS selector list (`#pp4Prompt.pp4Center`'s override rule, and `#pp4Veil` never being targeted by any `pp4Peek` rule at all).
- **Verification:** Red-proofed — reverted the widening (restored the old `#pp4Prompt`-conditional), forced `#pp4Prompt` hidden, fired a real pointerdown: `armedWithNoPrompt` read `false` (FAIL, as expected). Restored the fix, same drive: `true` (PASS).

**Total deviations:** 1, directed rather than discovered — Rule 4 territory (an architectural-adjacent change to a shared gesture), resolved by Wyatt's own direct instruction rather than a checkpoint, since the instruction was already explicit in this session's prompt.

## A measurement caveat found and fixed in the probe itself, worth recording

The first run of `probe-chat-flash.mjs`'s hold-the-sea opacity check failed: `#pp4Prompt`'s computed opacity under `body.pp4Peek` read `"1"`, not the expected `".13"`. This looked like a real bug in the widened arm site or the CSS rule. It was neither — `#pp4Prompt` and `#pp4ChatFlash` both carry `transition:opacity .16s`/`.35s`, and reading `getComputedStyle` synchronously (or after only a CDP round-trip, which is not reliably slower than 160ms) reports the **starting** opacity of an in-flight transition, not its cascaded target. Isolated repro confirmed this exactly: reading immediately after adding the class gave `"1"`; reading after a 400ms wait gave `".13"`. Confirmed via CDP's `CSS.getMatchedStylesForNode` that the cascade itself was correct all along (the `body.pp4Peek #pp4Prompt` rule's specificity — `1,1,1` — does beat `#pp4Prompt.radial{opacity:1}`'s `1,1,0`, exactly as CSS spec says). The probe now waits `400ms` after any `pp4Peek` toggle before reading opacity. Recording this because it is the same family of trap `docs/HARD-WON-LESSONS.md` §2 already warns about ("never present an inference... without a measurement"), just in a new shape — this time the check itself needed fixing, not the code.

## Known Stubs

None.

## Issues Encountered

- **`sendChat`'s own 1-second client-side spam guard** (`appState.lastChatSendAt`) silently drops a send if two messages are submitted within 1000ms of each other. Cost one round of probe debugging (a poll for a flash timed out because the send was silently dropped). Every probe send is now spaced ≥1300ms apart.
- **Chrome ES-module caching** was avoided by always launching a fresh headless Chrome profile (`user-data-dir`) per browser instance rather than reusing one, per `docs/DRIVING-THE-GAME.md` §1.

## User Setup Required

None — no external service configuration required.

## Requirements Status

**MP-03 stays `Pending` in `REQUIREMENTS.md`**, not marked complete by this plan. Both deliverables (`coverage` above) are headlessly proven — red-then-green where a probe assertion allowed it, and always against the live production Firebase database — but D-09 (`02-CONTEXT.md`) reserves the actual requirement close for Wyatt's real-voyage phone pass, the same reasoning `02-01`/`02-02`/`02-03`'s own summaries applied to their requirements.

**What Wyatt's phone pass should specifically confirm for this plan:** that the 💬 chip and sheet feel right in real play (not just structurally correct headlessly) — placement, tap targets on a real thumb, and whether the flash's timing reads well rather than merely measuring on-curve; and that hold-the-sea's widened dimming doesn't make a lone narration bubble distracting when a finger briefly brushes the board mid-read.

## Next Phase Readiness

- **Ready:** chat has a home in the new stage — a chip, a sheet, an unread mark, and a flash that obeys hold-the-sea exactly like every other floating box, plus a now-uniform hold-the-sea arm site across the whole stage.
- **Zero headless Chrome and zero local `http.server` processes were left running** at the end of this plan (`ps aux` checked immediately before this summary was written, and again after all probes completed).
- **No voyage was driven to completion** — every probe stopped mid-voyage after building the stage and exchanging a handful of chat messages; every `rooms/<CODE>` this plan created was deleted (`s.db.ref('rooms/'+s.room).remove()`) in each probe's own cleanup step.
- **Ports used this plan** (avoid reusing without a fresh Chrome profile/port): static servers `8710`, `8720`; CDP debug ports `9711`–`9714`, `9721`–`9722`, `9891`–`9912` (a range of scratch/debug scripts used during development of the two probes, not all landing in the final two files).
- **`4/src/main.js`** confirmed byte-identical before/after (MD5 `c87d234ca8a5d0c395a1f015b344394a`, matching the checked-out HEAD copy).
- **`4/src/orchestrator.js`** confirmed byte-identical before/after (MD5 `1b3f22a279186373ecda588551078dc6`, matching the checked-out HEAD copy) — chat's whole send/receive path needed no edit, exactly as the plan's `key_links` predicted.
- **`PP4_STAMP`** confirmed unchanged (`"2026-08-18e"`, `4/src/ui/stage.js:32`) — the stamp bumps exactly once, in plan 02-07, per Wyatt's ONE DROP ruling.

## Self-Check: PASSED

- `4/index.html` — FOUND, diff confirmed scoped correctly (`#pp4ChatSheet`, `#pp4Chat`/`#pp4ChatDot`, `#pp4ChatFlash`, and the `body.pp4Peek` selector-list extension)
- `4/src/ui/stage.js` — FOUND, diff confirmed scoped correctly (ribbon markup, `ribbonTick`, `buildStage`, tap-outside listener, `gestures()` arm site)
- `4/src/ui/panel.js` — FOUND, diff confirmed scoped correctly (`appendChatLine`, `renderChatFlash`, `removeChatFlash`, `setChatUnread`)
- `4/src/main.js` — byte-identical before/after (MD5 `c87d234ca8a5d0c395a1f015b344394a`)
- `4/src/orchestrator.js` — byte-identical before/after (MD5 `1b3f22a279186373ecda588551078dc6`)
- `PP4_STAMP` — unchanged (`"2026-08-18e"`)
- Commit `997b4d8` — FOUND in `git log --oneline`
- Commit `2b519e4` — FOUND in `git log --oneline`
- `git diff --name-only | grep -v -E '^(4/|\.planning/)'` — printed only the three files the concurrent session owns (`.claude/CLAUDE.md`, `docs/GIT-AND-DEPLOY.md`, `docs/TRADE-SYSTEM.md`), nothing this plan touched
- Zero headless Chrome, zero `http.server` processes remaining — confirmed via `ps aux`

---
*Phase: 02-multiplayer-revival*
*Completed: 2026-08-19*
