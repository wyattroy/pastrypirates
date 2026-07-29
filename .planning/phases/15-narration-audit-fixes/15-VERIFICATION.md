---
phase: 15-narration-audit-fixes
verified: 2026-07-29T19:19:18Z
status: gaps_found
score: 14/19 must-haves verified
behavior_unverified: 2
overrides_applied: 0
gaps:
  - truth: "D-29 — 'you'→'ye' / 'your'→'yer' applied across ALL player-facing text"
    status: failed
    reason: >-
      14 live player-facing string literals still read "you"/"your". At least 6 of them
      belong to cards Wyatt tagged `keep` with empty notes, and the audit page applies
      pirateVoice() LIVE at its msgBox chokepoint (art-review/narration-audit.html:633-643),
      so the text he approved on those cards was the CONVERTED text. Under D-25 (`keep` =
      "ship exactly what this card displays") what shipped differs from what he approved.
      Root cause: 15-06 appears to have applied only rows carrying explicit replacement copy;
      `keep` + empty-notes rows were treated as "no source change" rather than "ship the
      converted rendering". D-29 is named in neither 15-06-PLAN.md nor 15-06-SUMMARY.md.
    artifacts:
      - path: "src/orchestrator.js:471"
        issue: "`⚔️ ${nm(att.idx)} attacks you — defend! FLIP` — battle defend prompt"
      - path: "src/orchestrator.js:545"
        issue: "`${pn(lose.idx)}, you lost! Pay with…` — carded (prompt:src/orchestrator.js:544, tag=keep, reviewed)"
      - path: "src/orchestrator.js:554"
        issue: "`${pn(win.idx)}, choose your plunder!` — carded, tag=keep"
      - path: "src/orchestrator.js:654"
        issue: "`${pn(p.idx)}, choose your recipe — …` — recipe-draft prompt"
      - path: "src/orchestrator.js:968"
        issue: "alert(\"Enter the room code your host shared.\") — named verbatim in D-32's absent-copy table"
      - path: "src/orchestrator.js:1143"
        issue: "`⚓ Reconnecting to your voyage…` — carded (prompt:src/orchestrator.js:1128, tag=keep)"
      - path: "src/ui/flow.js:266"
        issue: "`the storm blows you toward an island! Yer broke — if ye run aground, ye'll lose yer turn!` — two registers in one sentence"
      - path: "src/ui/flow.js:497"
        issue: "`accept ${offerDisplay} for your ${ilabelImg(want)}?` — carded (prompt:src/ui/flow.js:497, tag=keep, reviewed)"
      - path: "src/ui/flow.js:595"
        issue: "button label `Start your bakery!`"
      - path: "src/ui/flow.js:638"
        issue: "`🎣 Cast your line — flip!` — the REAL fishing prompt (D-33's live sibling)"
      - path: "src/ui/flow.js:813"
        issue: "`Counter — how much for your ${ilabelImg(ing)}?`"
      - path: "src/ui/util.js:91"
        issue: "`${escHtml(s.name)} — that's you!` — seat list"
      - path: "src/ui/lobby.js:108"
        issue: "`escHtml(s.name)+(me?\" — you\":\"\")` — lobby seat list"
      - path: "src/ui/panel.js:157"
        issue: "`\"or lose your turn\"` — shot-clock sub-caption in the yellow action panel"
    missing:
      - "Apply pirateVoice() (word-boundary, longest-alternative-first, case-preserving) to the 14 sites above"
      - "Decide with Wyatt whether src/ui/recipe.js's 3 recipe descriptions ('melt-in-your-mouth', 'run your thumb') are in scope — they are player-facing but read as baking prose, not pirate voice"
      - "src/ui/flow.js:125's fishCast fallback is dead copy (D-33) — convert or leave, but record which"
      - "Confirm `layout` was not corrupted — VERIFIED intact, no regression here"
  - truth: "D-17 — fmtItem() renders ingredients with the custom art, not system emoji"
    status: failed
    reason: >-
      fmtItem() is byte-for-byte unchanged and still emits `ING_EMOJI[x]`. The seven in-play
      ingredient emoji (🌾🥛🍬🥚🍫🌶️🌼) are still absent from EMOJI_IMG, so emojify() cannot
      rescue them either. Every trade/parley narration line therefore still renders a raw
      system-emoji ingredient sitting next to custom coin art — the exact inconsistency
      Wyatt reported. D-17's stated fix ("<img class=\"narrIcon\" src=\"${ING_IMG[x]}\">,
      keeping its existing coin handling") was not applied, and D-17 is not mentioned in
      15-06-PLAN.md or 15-06-SUMMARY.md.
    artifacts:
      - path: "src/ui/util.js:211"
        issue: "`export function fmtItem(x){...(ING_EMOJI[x]||\"\")+\" \"+iname(x);}` — raw emoji, unchanged"
      - path: "src/shared/index.js:77-94"
        issue: "EMOJI_IMG still has no ingredient-emoji keys"
      - path: "src/ui/util.js:382-384, 440-442"
        issue: "the 6 parley/trade narration branches that consume fmtItem()"
    missing:
      - "Change fmtItem() to emit `<img class=\"narrIcon\" src=\"${ING_IMG[x]}\" alt=\"${iname(x)}\"> ${iname(x)}` for ingredients, keeping the /coin/ branch as-is"
      - "Re-pin the affected literal expectations in scripts/narration_test.js"
  - truth: "D-54 — Wyatt's 11 approved second-party addressed lines are applied to source"
    status: partial
    reason: >-
      .planning/phases/15-narration-audit-fixes/15-ADDRESSED2-APPROVED.json was committed
      (7db54cf) with the message "This file is the source of truth for the fix", but only
      ONE of its 11 rows (bakeoff, 9ddd214) was actually applied. 7 of the remaining 10
      coincidentally match the mechanically-derived text already in source; 4 do not.
    artifacts:
      - path: "src/ui/util.js:498-508 (table:battle)"
        issue: "shipped defender line renders 'Davy Scones — ye lose 2–1. Ye bribe yer way out of giving away a crate with 5 coins.'; approved: 'Crustbeard wins 2–1 — ye bribe yer way out of givin' away a crate with 5🌕.'"
      - path: "src/ui/util.js:498-508 (table:battle~cleaned)"
        issue: "shipped 'Davy Scones — ye lose 2–1. Ye give up all ye have: 2 coins.'; approved 'Crustbeard wins 2–1 — ye give up all ye have: 2🌕.'"
      - path: "src/ui/util.js:498-508 (table:battle~crate)"
        issue: "shipped 'Davy Scones — ye lose 2–1. Crustbeard takes Cacao Pods.'; approved 'Crustbeard wins 2–1 and takes yer 🍫 Cacao Pods'"
      - path: "src/ui/flow.js:971"
        issue: "shipped '…calls ye to win and bets 2🌕!'; approved '…calls ye to win and bets 2🌕 on it!' — 'on it!' dropped"
    missing:
      - "Reconcile the 4 divergent rows against 15-ADDRESSED2-APPROVED.json, or record an explicit decision that the composed mainClause/spoilClause architecture supersedes his wording for the 3 battle rows"
  - truth: "The narration extraction/coverage self-check runs green and art-review/narration-inventory.json matches the shipped tree"
    status: failed
    reason: >-
      `node scripts/extract_narration_lines.js` exits 1 on HEAD. Its own coverage guard —
      the mechanism enforcing D-21 (every branch rendered), D-31 (every prompt shows its
      buttons), D-32 (every player-readable string has a card) and D-33 (no card shows
      unreachable text) — is currently RED, and it refuses to write the inventory. The
      committed art-review/narration-inventory.json is therefore stale relative to HEAD.
      15-06-SUMMARY.md claims it was "regenerated and verified byte-identical across two
      consecutive runs"; that is no longer true after the final commit (9ddd214) shifted
      src/ui/util.js by 4 lines. The script is NOT part of `npm test`, so nothing caught it.
    artifacts:
      - path: "scripts/extract_narration_lines.js"
        issue: "FAIL: no AD_HOC_META entry for src/ui/util.js:918 (enclosing fn \"narrateCurrent\") — stale hardcoded line-number table"
      - path: "art-review/narration-inventory.json"
        issue: "stale — cannot be regenerated while the self-check fails"
    missing:
      - "Update AD_HOC_META's line reference for narrateCurrent's onFlash site (src/ui/util.js:914→918) and regenerate the inventory"
      - "Consider adding the extractor to `npm test` (or a line-number-free anchor) so this class of drift is caught by CI"
  - truth: "D-25/D-52 — the battle round-result lines ship Wyatt's approved wording verbatim, icons included"
    status: partial
    reason: >-
      D-52's structural merge landed correctly (six branches → four; 482/483 collapse on
      `dwName`, 486/487 on `hitName`), but two of the four surviving lines dropped the ⚪️
      icon Wyatt explicitly typed into his rewrite, and one dropped a word. The sibling
      bakeoff lines in src/ui/flow.js DID keep their ⚪️/⚫️, so this reads as a miss rather
      than a decision. The battle footer goes through panel() → emojify(), so the icon
      would have rendered as custom art.
    artifacts:
      - path: "src/orchestrator.js:489"
        issue: "shipped 'Both fire HEADS — but ${dwName}'s downwind and the shot hits!'; approved 'Both fire ⚪️ HEADS — but Crustbeard's firing downwind and the shot hits!' (missing ⚪️ and 'firing')"
      - path: "src/orchestrator.js:490"
        issue: "shipped 'Both fire HEADS — but in the crosswind…'; approved 'Both fire ⚪️ HEADS — but in the crosswind…' (missing ⚪️)"
    missing:
      - "Re-apply the ⚪️ and 'firing' from misc:battleLine:src/orchestrator.js:482 and :484 in 15-DISPOSITIONS-FINAL.json"
deferred:
  - truth: "Guest sail highlights get class:\"sailCell\" (animation, hover, reduced-motion parity)"
    addressed_in: "Phase 16"
    evidence: "D-55/D-56 explicitly scope this to Phase 16 (UI-01…07); src/ui/flow.js:1117-1119 carries the deferral comment in code"
  - truth: "Host/guest render-parity regression test wired into npm test"
    addressed_in: "Phase 16"
    evidence: "15-CONTEXT.md D-56 'PHASE 16 TASK — host/guest render-parity test'"
  - truth: "Narration stops blocking the host's game loop (27 awaited flash() call sites)"
    addressed_in: "Phase 18"
    evidence: "D-58 RESOLVED — 'do 1 now and scope 2 as a follow-up phase'; ROADMAP Phase 18 'Narration Pacing — commentary, not a gate' (NARR-07)"
  - truth: "End-of-voyage narration box hidden/collapsed once the summary panel appears"
    addressed_in: "Phase 16"
    evidence: "ROADMAP Phase 16 UI-07; todo eov-narration-box-not-cleared, resolves_phase: 16"
  - truth: "BOT_STORM_STEP_MS vs STORM_STEP_MS parity"
    addressed_in: "Phase 18"
    evidence: "D-23's 'Flagged, NOT auto-included' clause; 15-06-SUMMARY.md routes it to Phase 18"
behavior_unverified_items:
  - truth: "NARR-06 / SC5 — narration text stays fully visible 10% less time before it begins fading, FROM A GUEST SEAT"
    test: "Two Chrome tabs, one host + one guest in the same room. Play until a narration line appears in the guest's yellow panel. Time how long the fully-opaque text sits before opacity starts dropping."
    expected: "The guest's .apMsg gains class 'fadeOut' after msgHoldMs(renderedText) — i.e. 0.72 × (1000 + 50·len + 300·pauses), clamped 1200-7000 then × 0.72 — the same moment the host's copy of that line fades. Before this phase the guest NEVER faded at all."
    why_human: "The hold is a wall-clock timer on a real DOM element behind a Firebase round-trip; no harness exercises showNarration(). D-57 states explicitly that NARR-06 'must be demonstrably true from a guest seat, not only a host seat'."
  - truth: "D-57/D-58 — showNarration()'s hold+fade is CANCELLABLE and never blocks"
    test: "On the guest tab, have the host fire two narration lines in quick succession (e.g. a storm push that produces back-to-back events). Also: while a guest narration line is still typing in, click a prompt button on the guest."
    expected: "(a) The second line displays fully opaque and does NOT inherit the first line's pending fade — the stale _narrToken must discard it (src/ui/panel.js:302-316). (b) The click registers immediately; the guest never waits on its own narration. (c) NEW RISK, watch for it: on the HOST, flash() (src/ui/panel.js:407-427) and showNarration() (via netNarrate, src/orchestrator.js:272) now EACH schedule an independent hold+fade on the same .apMsg element. Both compute msgHoldMs(el.textContent) and every call site passes either undefined or msgHoldMs(...) as holdMs, so they should coincide — confirm the host's narration still fades exactly once, smoothly, with no premature or double fade, on both the shortest (1200ms-floor) and longest (7000ms-cap) lines."
    why_human: "Cancellation and ordering invariants across an event-driven Firebase path. Static analysis confirms showNarration() is a non-async function with no awaiting caller (structurally non-blocking) and that the token guard is present, but neither the cancel nor the host double-schedule interaction is exercised by any test."
---

# Phase 15: Narration Audit & Fixes — Verification Report

**Phase Goal:** Narration reads naturally and consistently — repetitions are pruned per Wyatt's review, the local player is addressed directly, and the specific broken/missing lines are corrected.
**Verified:** 2026-07-29T19:19:18Z
**Status:** gaps_found
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Source | Status | Evidence |
|---|-------|--------|--------|----------|
| 1 | Full narration-branch audit delivered to Wyatt; pruning applied only after his review | SC1 / NARR-01 | ✓ VERIFIED | `art-review/narration-audit.html` (flow-chart page, D-01/D-21/D-22/D-30/D-31/D-32 rebuilds), `15-DISPOSITIONS-FINAL.json` = 209 rows, all `reviewed: true`; `15-COPY-APPROVED.md` transcribes them; 15-06 lands after 15-05's gate. See gap G4 — the coverage self-check has since gone red. |
| 2 | The missing "broke" line is restored; the storm intro names only the first leg | SC2 / NARR-02+03 | ✓ VERIFIED | `brokeSailLine()` `src/ui/flow.js:217-220` called from BOTH `humanTurn` and `botTurn` (D-11 case 1, human + bot); `brokeAnchorLine()` called at the storm-anchor gate (D-11 case 2); `stormIntroClause()` `src/ui/flow.js:374-376` → "First the ⛈️ storm blows ye 2 squares **{dir}**"; second leg announced separately by `humanWind`. All 6 assertions green in `scripts/narration_flow_test.js`. |
| 3 | The bribe line is context-smart — genuine bribe vs cleaned-out | SC3 / NARR-04 | ✓ VERIFIED | `src/ui/util.js:487-488` `isBribe = spoilIng==null && spoilN>=5`; `:504` bribe branch, `:505-507` cleaned-out branch, each with addressed + neutral forms. Guarded so a non-numeric spoil falls through to the cleaned-out framing rather than rendering NaN. |
| 4 | Narration addresses the local player in 2nd person, including "already anchored safely" | SC4 / NARR-05 | ✓ VERIFIED | D-13 fix present: `src/ui/flow.js:249` `ev({t:"anchorHold"}) → await narrateLastEvent() → liveRender()`, asserted by `narration_flow_test.js`. `anchorHold` copy at `src/ui/util.js:370` carries both renderings. `narrationVariants`/`pickNarrVariant` per-seat mechanism green across 14 assertions in `narration_test.js`. |
| 5 | Narration text stays fully visible 10% less time before it begins fading | SC5 / NARR-06 | ⚠️ PRESENT_BEHAVIOR_UNVERIFIED | `MSG_HOLD_MULTIPLIER` 0.8→0.72 at `src/ui/util.js:773`; unit-pinned as "exactly 0.9x its pre-change value" (`narration_test.js:220`). Host side proven. D-57 requires the criterion be demonstrably true **from a guest seat**; the new guest path has no test. Routed to playtest. |
| 6 | **Governing constraint** — nothing changes what `src/engine/index.js` records into the event stream; determinism stays green | 15-CONTEXT §domain | ✓ VERIFIED | `git diff --stat de30047..HEAD -- src/engine/index.js` → **empty output**. 31/31 determinism seeds PASS (`determinism_baseline.js --verify`). No `ok` field added to `trade` (D-19 SIMPLIFIED). All 14 `npm test` gates green, exit 0. |
| 7 | D-57/D-58 — `showNarration()` has a cancellable hold + fade, reusing `msgHoldMs()`, measured from rendered `textContent`, awaiting the typewriter reveal, and never becoming blocking | brief | ⚠️ PRESENT_BEHAVIOR_UNVERIFIED | All five required properties present at `src/ui/panel.js:302-316`: `_narrToken` bump + two `if(token!==_narrToken)return` guards; `msgHoldMs(text)` (the shared curve, no second multiplier); `text = el.textContent`; `await el._revealDone` before the hold; function is **not** `async` and returns `undefined`, and `grep -rn "await showNarration" src/` → 0 hits, so no caller awaits it. The cancellation and the host's new double-schedule interaction are runtime invariants with no test. |
| 8 | D-35 — one shared sail-prompt line across `localPickCell` and `remotePickHighlights` | brief | ✓ VERIFIED | `sailPickMsg(seat)` `src/ui/flow.js:175-177` is the single author. `localPickCell` renders it at `:208`; `pickCell` threads it into the remote payload at `:187` (`msg:sailPickMsg(p.idx)`); `watchPrompt` passes `p.msg` at `src/orchestrator.js:931`; `remotePickHighlights(cells,promptId,msg)` renders `msg` with a `sailPickMsg(appState.mySeat)` version-skew fallback (`:1126`). Guest-side code renders, never authors — the D-35 invariant is explicit in the comment. Wording matches Wyatt's approved `prompt:src/ui/flow.js:200` verbatim ("Crustbeard: click any yellow square to sail there (−1{coin})"); he left the addressed field empty, so one shared line IS the approved shape. |
| 9 | D-41 (+EXTENDED, +EXTENDED AGAIN) — four options disabled-with-sub-helper-text, no dead ends | brief | ✓ VERIFIED | **Trade/Parley:** `canTrade` from `tradeOpp(p).filter(q=>q.ing.length>0)` `flow.js:584-585`, drives `disabled:!canTrade` `:592` AND the guard `:432-434`; `sub` at `:605`. **"— coins only —":** `canOfferCoins=p.coins>0` `:462`, `disabled:!canOfferCoins` `:464`, `offerSub` `:466`. **Hail Counter:** `raises` computed BEFORE the prompt `:805`, `canCounter` `:806`, `disabled:!canCounter` `:808`, `sub` `:809`. **Attack:** unchanged pattern `:592` + `sub` `:604`. Non-clickability is structural — `localAsk` `flow.js:93-96` emits the HTML `disabled` attribute and skips `onclick` for disabled buttons; `disabled` and `sub` are both threaded to guests (`util.js:874-877`, `orchestrator.js:922`). |
| 10 | D-23 — bot and human narration hold the same duration; `CHAT_BUBBLE_HOLD_MULTIPLIER` untouched | brief | ✓ VERIFIED | `BOT_MSG_HOLD_MULTIPLIER` deleted; `botMsgHoldMs` is now `text=>msgHoldMs(text)` (`src/ui/util.js:810`). Every bot call site passes `msgHoldMs(...)` (`flow.js:343,362,759,779`). `CHAT_BUBBLE_HOLD_MULTIPLIER=0.8` unchanged (`util.js:819`). Asserted at `narration_test.js:225,239,260`. |
| 11 | D-19 SIMPLIFIED — parley emitted only when `!dealt`; no `ok` field; "Parley" unreadable by players | brief | ✓ VERIFIED | `src/ui/flow.js:824` `if(!dealt)g.ev({t:"parley",…})` — accepted hail emits only the `trade` event at `:829`. No `ok` field at any of the three parley emits (`:546`, `:555`, `:824`) and none on `trade`. Player-facing text: button `"🤝 Trade"` `:592`, prompt `"Trade with whom?"` `:447`; every remaining `parley`/`Parley` token is an event type, a cfg flag, or a comment. |
| 12 | D-29 — ye/yer conversion across ALL player-facing text, word-boundary matched, never identifiers/comments | brief | ✗ **FAILED** | `layout` intact (no `layet` corruption anywhere) and the converted lines that DID ship are correct. But **14 live player-facing strings still read "you"/"your"** — full list in the gap block. 9 of them are cards on the audit page, where `pirateVoice()` (`narration-audit.html:633-643`) renders the converted text, so what shipped ≠ what Wyatt approved (D-25). |
| 13 | D-17 — `fmtItem()` renders ingredients with custom art, not system emoji | brief | ✗ **FAILED** | `src/ui/util.js:211` unchanged, still `(ING_EMOJI[x]||"")+" "+iname(x)`. Ingredient emoji still absent from `EMOJI_IMG` (`src/shared/index.js:77-94`), so `emojify()` cannot rescue them. Affects the 6 trade/parley narration branches. |
| 14 | D-37 / D-37 RESOLVED — wind always "blows"; `shoves` permitted ONLY at the moored lucky-break branch | brief | ✓ VERIFIED | No player-facing string has wind/storm/gale/gust as subject of *carried*/*swept*/*whipped*/*moves*. `windmove` and the storm legs say "blows"; `EVENT_NARRATION.tradewind` `util.js:371` reads "is **blown** into the trade winds and **swept** around the rim" — matching Wyatt's own approved copy and his stated rule ("the trade winds themselves *sweep* you along, but the wind always *blows* you"). Only `shoves` occurrence in player-facing copy is `util.js:335`/`:347`, the `moored` lucky-break branch. |
| 15 | D-38 RESOLVED — parenthesised amounts signed; no ASCII hyphen as a player-facing minus; `flow.js` trade-offer summary is the exception | brief | ✓ VERIFIED | Every parenthesised coin amount carries `+` or U+2212 `−`: `flow.js:176,252,421,592,596,814,938`; `util.js:399,433,451,452,454,455,519,520,521,528,529`; `orchestrator.js:513,514`. The one bare-amount composed string is the deliberate exception at `src/ui/flow.js:493` — `"{ingredient} + {n}🌕"`, untouched. Only remaining ASCII hyphen near a coin is `flow.js:596` `"🎣 Fish (+1-2🌕)"`, a *range* separator, not a minus. |
| 16 | D-53 — no applied narration string contains `--`; every `–` sits between digits | brief | ✓ VERIFIED | Zero `--` in any string literal (all hits are `--` decrement operators, CSS custom properties, or comment rules). Every `–` in narration is a battle score `${aP}–${dP}` (`util.js:498-500`). Two non-digit `–` remain — `util.js:98` (the coin placeholder) and `panel.js:114` (the clock placeholder) — both pre-existing and explicitly counted in D-53's own audit ("one placeholder coin dash"); neither is narration prose. |
| 17 | D-59 — the storm flip button shows the real coin loss, signed per D-38 | brief | ✓ VERIFIED | `src/ui/flow.js:263` — `` `Flip (⚪ HEADS: dodge safely. ⚫ TAILS: lose half yer 🌕 (−${Math.max(1,Math.floor(p.coins/2))}🌕))` ``. Same expression the engine uses, U+2212 minus, applied only to the ordinary branch; the broke and truly-shipwrecked branches keep naming a crate / the turn. |
| 18 | D-16 — icon inventory of shipped narration is a superset of the pre-15-06 inventory | brief | ✓ VERIFIED (with warning) | Diffed the emoji-shorthand and `*_IMG` symbol multisets across `util.js`/`flow.js`/`orchestrator.js`/`panel.js`/`lobby.js`/`shared/index.js`/`board.js` between `ddefa8f` (pre-15-06) and HEAD: **zero icon KINDS lost, zero introduced.** Three occurrence-count drops (`🌀` 11→5, `⛈` 10→9, `🤝` 13→12) all trace to approved merges (D-36's three rim-sweep copies folding into one table entry, D-52's battle merges). **Warning:** two ⚪️ icons Wyatt *added* in his rewrites were not applied — see gap G5. |
| 19 | D-54 — Wyatt's 11 approved second-party addressed lines are applied | brief | ✗ **FAILED** | Only 1 of 11 applied (`bakeoff`, commit 9ddd214). 7 coincidentally match the mechanically-derived text; **4 diverge** — `table:battle`, `table:battle~cleaned`, `table:battle~crate`, `adhoc:src/ui/flow.js:901`. Rendered comparison in the gap block. |

**Score:** 14/19 truths verified (2 present, behavior-unverified; 3 failed)

---

### Deferred Items

Not gaps — explicitly scoped to a later phase by a recorded decision.

| # | Item | Addressed In | Evidence |
|---|------|-------------|----------|
| 1 | Guest sail highlights get `class:"sailCell"` (animation, hover, reduced-motion parity) | Phase 16 | D-55/D-56; the deferral is written into the code at `src/ui/flow.js:1117-1119` |
| 2 | Host/guest render-parity regression test in `npm test` | Phase 16 | D-56 "PHASE 16 TASK — host/guest render-parity test" |
| 3 | Narration stops blocking the host's game loop (27 awaited `flash()` sites) | Phase 18 | D-58 RESOLVED ("do 1 now and scope 2 as a follow-up phase"); ROADMAP Phase 18 / NARR-07 |
| 4 | Empty end-of-voyage narration box hidden | Phase 16 | ROADMAP UI-07; todo `eov-narration-box-not-cleared` |
| 5 | `BOT_STORM_STEP_MS` vs `STORM_STEP_MS` parity | Phase 18 | D-23's "Flagged, NOT auto-included" clause |
| 6 | Removing the dead `asym`/raider battle branch | Backlog | 15-CONTEXT §Deferred ("deliberately not in Phase 15") |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `flash()` `panel.js:412` | `netNarrate` `orchestrator.js:272` | `_nh.onBroadcast(msg,variants)` | ✓ WIRED | Not awaited; forwards `variants` |
| `netNarrate` | `showNarration` + `netSetNarr` | direct call + Firebase write | ✓ WIRED | Host picks its own variant via `pickNarrVariant` before display |
| `watchNarr` `orchestrator.js:942` | `showNarration` | `pickNarrVariant(v, appState.mySeat)` | ✓ WIRED | Guest selects its own addressed line |
| `pickCell` `flow.js:187` | `remotePickHighlights` `flow.js:1113` | `onRemotePrompt({kind:"pick",msg})` → `watchPrompt` `orchestrator.js:931` | ✓ WIRED | D-35's single-author invariant |
| `ask()` `util.js:873-877` | `localAsk` / `watchPrompt` | `disabled[]` + `sub` in the prompt payload | ✓ WIRED | D-41's greying + reason reaches guests too |
| `humanAct` `flow.js:584` | `humanTrade` guard `flow.js:432` | shared `tradeOpp(p).filter(q=>q.ing.length>0)` | ✓ WIRED | One availability computation, two consumers |
| `syncLogLines` `util.js:647` | `describeFor(e, NEUTRAL_VIEWER)` | explicit neutral viewer | ✓ WIRED | D-24: captain's log is third-person; `board.js:582` matches |
| `renderBattle` `orchestrator.js:302` | `panel()` → `emojify()` | `panel.js:188` | ✓ WIRED | Battle-footer `⚪️`/`⚫️` do become custom art |
| `EVENT_NARRATION` builders | `fmtItem()` `util.js:211` | ingredient rendering | ✗ **HOLLOW** | Wired, but the source emits raw system emoji — D-17 (gap G2) |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `showNarration` `panel.js:303` | `el.textContent` | `panel()` → `typewriterReveal` → `_revealDone` | Yes — awaited before measuring | ✓ FLOWING |
| `sailPickMsg` | `msg` in the remote prompt payload | `pickCell` → Firebase → `watchPrompt` | Yes, with `sailPickMsg(mySeat)` skew fallback | ✓ FLOWING |
| Storm flip button `flow.js:263` | `p.coins` | live player object at prompt time | Yes — same expression as the engine's own | ✓ FLOWING |
| `fmtItem(x)` | `ING_EMOJI[x]` | static map of system emoji | No custom art produced | ✗ per D-17 |
| `art-review/narration-inventory.json` | whole file | `scripts/extract_narration_lines.js` | **No** — script exits 1, refuses to write | ✗ STALE |

---

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Full gate suite (12 gates + determinism verify) | `npm test` | exit 0; all suites "PASSED — 0 failing check(s)" | ✓ PASS |
| Determinism corpus | `node scripts/determinism_baseline.js --verify` | 31/31 seeds PASS, "All seeds passed." | ✓ PASS |
| Engine event stream untouched across the whole phase | `git diff --stat de30047..HEAD -- src/engine/index.js` | empty output | ✓ PASS |
| Narration builders render without throwing, all 25 keys | `node scripts/narration_test.js` | PASSED — 0 failing | ✓ PASS |
| Turn-flow narration (D-11/D-13, broke lines, storm intro) | `node scripts/narration_flow_test.js` | PASSED — 0 failing | ✓ PASS |
| Two-party addressed variants render per seat | ad-hoc `describeFor()` harness over 9 fabricated events | rendered; 4 diverge from `15-ADDRESSED2-APPROVED.json` | ✗ FAIL (gap G3) |
| Narration coverage self-check + inventory regeneration | `node scripts/extract_narration_lines.js` | **exit 1** — "no AD_HOC_META entry for src/ui/util.js:918" | ✗ FAIL (gap G4) |
| `showNarration` fade/cancel end to end | — | requires two browsers + Firebase | ? SKIP → playtest |

### Probe Execution

| Probe | Command | Result | Status |
|-------|---------|--------|--------|
| — | — | No `scripts/*/tests/probe-*.sh` in this project; the gate suite is `npm test` | N/A |

---

### Requirements Coverage

| Requirement | Description | Status | Evidence |
|-------------|-------------|--------|----------|
| NARR-01 | Full narration audit delivered with a pruning recommendation; pruning applied after review | ✓ SATISFIED (with G4 caveat) | `art-review/narration-audit.html`, 209/209 reviewed dispositions, D-16…D-60 addenda; the coverage self-check has since regressed |
| NARR-02 | Missing "broke" line restored | ✓ SATISFIED | `brokeSailLine()` (human + bot) and `brokeAnchorLine()`, gate-asserted |
| NARR-03 | Storm intro reads "First, the storm pushes you {dir1}" | ✓ SATISFIED | `stormIntroClause()` `flow.js:374-376`; verb is "blows" per D-37, register per D-29 — both approved supersessions of the requirement's literal phrasing |
| NARR-04 | Context-smart bribe line | ✓ SATISFIED | bribe / cleaned-out split at `util.js:487-507` (follow D-12, not the requirement's mis-mapped literal amounts) |
| NARR-05 | 2nd-person address, incl. "already anchored safely" | ✓ SATISFIED | per-seat variants mechanism + D-13's missing `narrateLastEvent()` at `flow.js:249` |
| NARR-06 | Narration stays fully visible 10% less time before fading | ⚠️ NEEDS HUMAN | Host: 0.8→0.72, unit-pinned. Guest: new `showNarration` hold+fade, unexercised — D-57 requires it be demonstrated on a guest seat |

No orphaned requirements: REQUIREMENTS.md maps exactly NARR-01…06 to Phase 15, and all six are claimed across the phase's plans.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `scripts/extract_narration_lines.js` | AD_HOC_META | Hardcoded line-number table drifts silently; not in `npm test` | 🛑 Blocker | The D-21/D-31/D-32/D-33 coverage guard is red and the committed inventory is stale (gap G4) |
| `src/ui/util.js` | 211 | Helper unchanged while its stated fix was recorded as binding | 🛑 Blocker | D-17 — system emoji beside custom coin art in every trade line |
| `src/ui/panel.js` | 302-316 + 407-427 | Two independent hold+fade schedulers on the same `.apMsg` element on the host | ⚠️ Warning | Benign today (both compute `msgHoldMs(el.textContent)`; no call site passes a divergent `holdMs`), but nothing enforces that they stay in step. Routed to playtest. |
| `src/ui/flow.js` | 125 | Unreachable parameter fallback still present | ℹ️ Info | D-33 confirmed dead copy; harmless, but it is one of the 14 D-29 sites |
| `src/ui/flow.js` | 596 | `"🎣 Fish (+1-2🌕)"` uses an ASCII hyphen | ℹ️ Info | It is a range separator, not a minus — outside D-38's rule, but visually inconsistent beside the U+2212 used everywhere else |

No `TBD` / `FIXME` / `XXX` debt markers in any file this phase modified.

---

## Statically Verified vs. Deferred-to-Playtest

### Verified statically (no browser needed)

Truths 1, 2, 3, 4, 6, 8, 9, 10, 11, 14, 15, 16, 17, 18 above; the full `npm test` suite (12 gates + 31-seed determinism verify, exit 0); the empty `src/engine/index.js` diff across the entire phase; the icon-inventory superset diff; and the failure evidence for gaps G1-G5.

### DEFERRED TO PLAYTEST — do not mark these pass or fail here

A human two-tab (host + guest) Chrome session plus one solo Safari session must cover the following. Each item states the **exact observable**.

**P1 — Guest narration fades (D-57, NARR-06's own criterion).**
On the guest tab, a narration line in the yellow action panel must gain `class="apMsg fadeOut"` and animate to opacity 0 after a hold proportional to its length, matching the host's fade of the same line. *Before this phase the guest never faded at all — if it still doesn't, NARR-06 is only half-delivered.*

**P2 — Guest fade is cancellable (D-57).**
Trigger two narration lines back to back (a storm push that produces consecutive events works). The second line must stay fully opaque; it must NOT inherit the first line's pending fade. Watch for a line that fades within a fraction of a second of appearing.

**P3 — Guest narration never gates play (D-58).**
While a guest narration line is still typing in, click a prompt button on the guest. The click must register immediately. The guest must never feel like it is waiting on its own commentary.

**P4 — NEW RISK: host double-fade.**
`flash()` and `showNarration()` (reached via `netNarrate`) now *each* schedule a hold+fade on the same host `.apMsg`. Confirm host narration still fades **exactly once**, smoothly. Check both extremes: a very short line (hold clamps at the 1200ms floor × 0.72) and a very long battle-result line (clamps at the 7000ms cap × 0.72).

**P5 — Four disabled options, no dead ends (D-41 + EXTENDED ×2).**
- With 0 coins, in the trade flow: **"— coins only —"** renders greyed and un-clickable, with *"Ye don't have any coin to offer — pick a crate instead."* beneath the buttons.
- With no opponent holding cargo: **"🤝 Trade"** renders greyed with *"No one's holding cargo to trade for yet."*
- On a bot hail where the bot cannot afford a raise: **"Counter-offer"** renders greyed with *"{bot} can't afford to go any higher."*
- **"⚔️ Attack"** with insufficient powder: greyed with *"Yer too poor to afford powder! Go fishin' 🎣"*.
- Confirm none of the four dead-end messages (*"No one has cargo to trade for."*, *"Ye don't have any to offer!"*, and the silent Counter exit) can be reached by clicking a visibly-enabled control.
- Repeat at least one of these **from the guest seat** — `disabled` and `sub` are threaded over Firebase and should render identically.

**P6 — Storm flip button shows the real loss (D-59).**
With 1, 2, 3 and 7 coins, the ordinary storm-flip button must read *"Flip (⚪ HEADS: dodge safely. ⚫ TAILS: lose half yer 🌕 (−M🌕))"* where M = 1, 1, 1, 3 respectively. Then actually flip tails and confirm the coins lost equal M.

**P7 — Sail prompt is identical host vs guest (D-35).**
Both must read *"{Name}: click any yellow square to sail there (−1🌕)"* with a *"Stay put"* button. **Expected difference, NOT a Phase 15 defect:** the guest's highlighted squares still lack the `sailCell` class, so they do not pulse or respond to hover — deliberately deferred to Phase 16 (D-55/D-56).

**P8 — D-17 defect, visual confirmation (expected to FAIL).**
Complete a trade and read the narration line. It will render a **system-emoji ingredient** (🌾 etc.) beside **custom coin art**. Confirm the visual so Wyatt can see the gap this verification reports — do not treat it as a new finding.

**P9 — Trade/hail event hygiene (D-19).**
An accepted bot hail must produce **exactly one** captain's-log line. A refused offer must still narrate. The word "Parley" must appear nowhere a player can read.

**P10 — Docking sequence (D-46).**
Button: *"⚓ 🌾 Dock at the Flour Patch"*. Flip prompt: *"Docking at 🌾 the Flour Patch — flip!"* (ingredient icon, **place** name). Heads narration, as the actor: *"{Name} — ye haul aboard 🌾 a sack of Toasty Wheat!"* (no place clause). Spectators still see the place.

**P11 — Icons everywhere (D-16).**
Every narration line, prompt, button and the battle-scoreboard footer must render icons as **custom art**, not system emoji, on host and guest alike. Pay particular attention to `⚪`/`⚫` in the battle round-result lines.

**P12 — Register sweep (D-29 gap).**
Wyatt should confirm the 14 remaining "you"/"your" strings listed in gap G1 are the complete set to convert, and rule on the 3 recipe-description occurrences in `src/ui/recipe.js`.

**P13 — Captain's log stays third person (D-24).**
While the message box addresses you directly ("ye"), the captain's log for the same event must read third person with your name.

**P14 — Safari solo playthrough.**
Per the standing STATE.md precedent, run a solo Safari game through at least one storm and one battle. Use a fresh server port rather than a `?cb=` query string (Safari caches ES modules).

---

## Gaps Summary

Five gaps, three of them blocking.

**The two blockers are both binding decisions that were never planned.** Neither D-17 nor D-29 appears anywhere in `15-06-PLAN.md` or `15-06-SUMMARY.md`. They were recorded in `15-CONTEXT.md`'s review addendum as explicit instructions from Wyatt and then dropped between planning and execution:

- **D-17** — `fmtItem()` is byte-for-byte unchanged, so every trade/parley narration line still puts a raw system-emoji ingredient next to custom coin art. That is precisely the inconsistency Wyatt reported, and the fix was specified down to the exact markup.
- **D-29** — 14 live player-facing strings still read "you"/"your". The failure has a clean root cause: the audit page applies `pirateVoice()` live at render time, so a card tagged `keep` with empty notes *displays* the converted text and, under D-25, ships it. 15-06 appears to have applied only rows carrying explicit replacement copy, treating `keep` + empty-notes as "no source change". Six of the affected sites are confirmed `keep`-tagged, reviewed cards, which makes this a D-25 contract breach as well as a D-29 scope miss.

**The third blocker is tooling.** `scripts/extract_narration_lines.js` now exits 1 on a stale hardcoded line reference, so the coverage guard enforcing D-21/D-31/D-32/D-33 is red and `art-review/narration-inventory.json` no longer matches the tree. `npm test` does not run it, so nothing caught the regression — introduced by the phase's own final commit.

**Two partials are copy-fidelity misses.** Four of Wyatt's eleven approved second-party lines (`15-ADDRESSED2-APPROVED.json`, committed with the note "this file is the source of truth for the fix") were never applied — only `bakeoff` landed. And two battle round-result lines dropped the `⚪️` icon he explicitly typed into his rewrite, while their bakeoff siblings kept theirs.

**What did land is substantial and correct.** The governing constraint held perfectly: `src/engine/index.js` has an *empty diff across the entire phase*, all 31 determinism fixtures verify, and every one of the 12 gates is green. The structural work Wyatt asked for is genuinely done — the host/guest sail-prompt fork is closed at a single author, the bot/human hold curves are one curve, the parley/trade double-narration is gone, all four dead-end options grey out with reasons that reach guests over the wire, the guest narration path has a real cancellable hold+fade that no caller awaits, and every wind verb, signed amount, em dash and dock place-name matches the approved record.

The behaviour that cannot be settled here — the guest fade, its cancellation, and the newly-introduced double-schedule on the host — is listed as P1-P4 with exact observables for the playtest.

---

_Verified: 2026-07-29T19:19:18Z_
_Verifier: Claude (gsd-verifier)_
