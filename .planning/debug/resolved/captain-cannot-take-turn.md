---
status: resolved
trigger: "Fix a confirmed gameplay-breaking fault: a captain with 0 coins AND an empty hold who is hailed into a trade gets a give-prompt with exactly one disabled button and no working Back — the whole table stalls forever. Evidence: .planning/phases/02.2-a-captain-who-cannot-take-their-turn/02.2-FINAL-QA-2026-08-21.md. Unattended overnight run."
created: 2026-08-21T00:00:00Z
updated: 2026-08-21T03:30:00Z
---

NOTE ON VERIFICATION: this was an unattended overnight run per the dispatching brief — self-verified
exhaustively (before/after browser repro, all five named gates, two full driven voyages to their
end-of-voyage cards) rather than confirmed by Wyatt playing it himself. Rule 19 (PLAY THE GAME) still
stands as the real gate — flagged in the FINAL-QA doc and the phase note for his own pass next time he
plays. Archived as resolved on the strength of the automated evidence below, not in place of his check.

## Current Focus

reasoning_checkpoint:
  hypothesis: "The Trade action-menu button (`canTrade`, flow.js:1811/1831) is enabled whenever ANY
    OTHER captain holds cargo, but never checks whether the acting captain P has anything at all to
    offer (coins or crates). A broke, empty-hold P can therefore click an enabled Trade button and
    enter humanTrade(), whose step 1 (GIVE) is then structurally unsatisfiable regardless of what P
    picked at step 0 (WANT) — Back only returns to step 0, which cannot fix a GIVE-side problem —
    producing a permanent cycle that soft-locks P's turn and, transitively, the whole table."
  confirming_evidence:
    - "Live browser repro (solo, state-injected p.coins=0/p.ing=[], another captain holding cargo):
       Trade button rendered enabled (disabled:null). Clicking it reached 'What will ye GIVE for
       Fresh Milk?' with exactly ONE button, disabled ('— coins only —', aria-disabled=true) plus
       the corner Back — matching the QA doc's screenshot exactly."
    - "Clicked the corner Back: landed on the WANT prompt (step 0), not an escape. Picked a
       different-looking want ('Fresh Milk' again, the first enabled option in DOM order): landed
       back on the IDENTICAL give-prompt (same single disabled button). Confirms step 1 depends
       only on p.coins/p.ing, never on st.want, so the cycle is unbreakable regardless of what is
       requested — this is the mechanism, not merely the symptom."
    - "Bot parity check (engine/index.js:1426, composeOffer): `if(!giveIng&&!giveCoins)return null`
       — a bot in the identical broke+empty-hold state never even opens the hail. Confirms this is
       a missing gate on the human side, not an intentional asymmetry (rule 13)."
  falsification_test: "If the give-prompt dead end could be escaped by some OTHER want choice, or
    if canTrade already excluded this state, the hypothesis would be false. Neither held: every
    enabled want in the WANT list led to the same single-disabled-button give-prompt (independent
    of `want` by construction, since ingOpts is built from p.ing/p.coins alone), and canTrade's
    live value in the browser was confirmed true (button not disabled) with p.coins=0 and
    p.ing=[]."
  fix_rationale: "Adding an independent `canOffer=p.coins>0||p.ing.length>0` leg to the Trade gate
    (mirroring Attack's existing independent `canAfford` leg, same file, same D-41 pattern) removes
    the root cause — P can never enter a trade they cannot possibly complete — rather than patching
    a symptom inside the already-entered flow. A symmetric top-of-function guard inside
    humanTrade() itself, and a redundant action-guard in humanAct's trade branch (mirroring
    Attack's own #5d safety net, which already exists for exactly this reason: 'the button is
    disabled..., but guard the action too... so we never enter [something] you can't [do]'), are
    defense-in-depth for any forced/edge selection — the same belt-and-suspenders shape Attack
    already uses, not a new pattern."
  blind_spots: "Have not yet re-run the two ORIGINALLY-stalled voyage modes (two-window crew,
    pass-and-play) end to end on the fixed build — only a solo repro of the specific mechanism.
    Have not yet checked whether the remote (guest) rendering path (prompt_field_parity_check /
    watchPrompt) needs the same `why` text threaded through for a broke remote human seat — the
    button gate itself lives in humanAct(), which both host and guest call through the same
    ask()/localAsk() path, so it SHOULD already be host/guest-symmetric (rule 23: one display
    path), but this must be verified against the parity gate, not assumed."
  candidate_causes:
    - "code: canTrade's missing independent condition (flow.js:1811) — confirmed root cause."
    - "config/data: none — p.coins/p.ing are live game state, not configuration; no threshold or
       constant is involved (rule 9 compliance: canOffer derives from live state the engine already
       tracks, no new constant introduced)."
  and_gate: "No — this is a single-cause defect. One missing boolean condition (canOffer) fully
    explains both the entry (enabled button) and the trapped state (step 1's structural
    unsatisfiability); no second, independent contributing condition is needed to produce the
    failure. (Checked: environment/data candidates considered and ruled out — this reproduces
    identically in solo, with no network/timing/RNG dependency.)"

hypothesis: humanTrade(p) is P's OWN turn-initiated offer-building flow (P chooses "Trade" from
their action menu). Step 1 ("what will ye GIVE") builds ingOpts purely from p.ing and p.coins —
independent of what P chose to WANT at step 0. A captain with p.coins===0 AND p.ing.length===0
therefore has an empty crate list, a permanently-disabled "coins only" option, and Back (rendered
as the corner circle, not a button-row option) which only returns to step 0 — re-picking WANT can
never fix the underlying "nothing to give" problem, since step 1 does not depend on `want`. The
menu gate that decides whether the Trade button is even enabled (`canTrade`, flow.js:1811) checks
only whether ANY OTHER captain holds cargo — it never checks whether P has anything to offer. So a
broke, empty-hold captain sees an ENABLED Trade button, clicks it, and is guaranteed to reach the
unwinnable step-1 prompt with no escape.
test: confirmed by full read of flow.js:1563-1626 (humanTrade), flow.js:1792-1832 (humanAct's
canTrade gate), and cross-checked against the bot's equivalent path
(engine/index.js:1400-1470 composeOffer/botOpenOffer), which DOES gate on the bot's own
coins/ing (`if(!giveIng&&!giveCoins)return null`) before ever hailing — confirming this is a
human/bot PARITY GAP (rule 13), not an intentional asymmetry.
expecting: browser repro (solo, state-injected broke+empty-hold seat, another captain holding
cargo) reproduces the QA doc's dead end; after the fix, the Trade button is disabled with a why
reason instead.
next_action: reproduce pre-fix in browser (solo mode, state injection per DRIVING-THE-GAME.md
§5e), then implement the button-gate fix at flow.js:1811/1831/1923 plus a symmetric top-of-function
guard in humanTrade() itself (defense in depth) and a redundant action-guard in humanAct's trade
branch (matching Attack's existing #5d pattern), then re-verify.

## Symptoms

expected: A captain with nothing at all to trade should never be able to enter (or get stuck in) a
trade they cannot possibly complete — either the Trade option is unavailable with a stated reason
(matching the D-41 greyed-button-with-reason family already used for Attack/Trade/coins-only/hail
Counter/dock buy-on-tails/storm anchor), or the flow declines cleanly and returns control.
actual: A captain with 0 coins and an empty hold can still click "Trade" (the button is enabled
whenever ANY OTHER captain holds cargo). They pick a WANT, then reach "What will ye GIVE for X?"
with exactly one button rendered (a permanently-disabled "— coins only —") and a corner Back that
only cycles them to step 0, which can never fix the underlying problem. The captain — and the whole
table, which waits on their turn — is stuck permanently.
errors: none (soft-lock, zero console errors per the QA doc — confirmed across all instrumented
windows).
reproduction: Two-window crew voyage, day 7, 101 events, seat 1 ("Blackbeard") at 0 coins/empty
hold, hailed into trade. Also reproduced independently in pass-and-play, day 2, 23 events, same
seat/state. Both documented with screenshots in the QA doc.
started: Exposed by tonight's (2026-08-20/21) unattended final QA pass depth (long autoplay
voyages that finally reached a broke+empty-hold state) — but the `canTrade` gate that allows this
has been unchanged since the /4 redesign's very first commit (511c427, 2026-08-11) per
`git log -S canTrade -- 4/src/ui/flow.js`. PRE-EXISTING, not a regression from tonight's other
Group C/C' work — see pre-existence verdict below once measured against e58fda4.

## Eliminated

(none yet — single clear hypothesis, confirmed by direct code read before any competing theory was
formed)

## Evidence

- timestamp: 2026-08-21T00:05:00Z
  checked: 4/src/ui/flow.js:1563-1626 (humanTrade), full function body
  found: Step 1's `ingOpts` is built from `[...new Set(p.ing)].map(...)` (empty when p.ing is
    empty) + a "coins only" option disabled via `!canOfferCoins` (`p.coins>0`) + a Back option
    (`back:true`, rendered as the corner "‹", not a button-row entry). When both p.ing and p.coins
    are empty/zero, the button row shows exactly one item, disabled. Clicking Back sets `step=0`
    and `continue`s the while loop — re-asking WANT, not GIVE. Step 1 depends only on
    `p.ing`/`p.coins`, never on `st.want`, so no WANT choice can ever produce a satisfiable GIVE
    step for this captain.
  implication: Matches the QA doc's measured before/after DOM diff exactly (corner Back does not
    escape) and explains WHY it doesn't: it returns to a step that structurally cannot fix the
    dead end. This is the mechanism the QA doc flagged as "read, not proven" — now proven.

- timestamp: 2026-08-21T00:07:00Z
  checked: 4/src/ui/flow.js:1792-1832 (humanAct, the action-menu builder) and line 1987 (the
    `v==="trade"` branch)
  found: `canTrade` (line 1811) = `appState.game.players.some(q=>q!==p&&!q.done&&q.ing.length>0)`
    — checks ONLY whether some other player holds cargo. Never checks p.coins or p.ing. The Trade
    button (line 1831) is `disabled:!canTrade` — so it is enabled whenever anyone else holds
    cargo, regardless of whether P has anything to give. Compare to Attack (line 1800/1828):
    `canAfford=p.coins>=appState.game.cfg.powder`, an INDEPENDENT self-affordability check with
    its own `why` line, explicitly commented (lines 1905-1919) as "these arms used to be an
    if/else-if chain, and the two conditions are INDEPENDENT" — Trade never received the
    equivalent self-affordability leg.
  implication: Root cause is a missing gate condition on the Trade button, structurally identical
    to a bug class this same file already fixed once for Attack. The fix is to add the missing
    independent condition, following the exact established pattern (D-41 family) rather than
    inventing a new one.

- timestamp: 2026-08-21T00:09:00Z
  checked: 4/src/engine/index.js:1400-1470 (composeOffer, botOpenOffer) and flow.js:2063-2066
    (botOpenTradeLive)
  found: The bot's OWN equivalent of humanTrade's offer-building is entirely engine-side.
    `composeOffer` line 1426: `if(!giveIng&&!giveCoins)return null;` — a bot with no spare crate
    and no coins to bid returns null, so `botOpenOffer` (which loops askable wants) also returns
    null, and `botOpenTradeLive` (flow.js:2066) returns false immediately — the bot silently
    declines to hail, no dead end, no wasted turn.
  implication: RULE 13 (bot/human parity) check: bots ALREADY handle the broke+empty-hold case
    correctly. This confirms the human path is the one with the gap, not an intentional design
    difference — fixing the human gate to match is restoring parity, not inventing new behaviour.

- timestamp: 2026-08-21T00:11:00Z
  checked: `git log --all -S canTrade -- 4/src/ui/flow.js`; `docs/TRADE-SYSTEM.md` section 4 (THE
    HUMAN FLOW); `.planning/todos/pending/flee-not-offered-when-broke.md`
  found: `canTrade` has been unchanged since 511c427 (2026-08-11, the very first /4 commit) — no
    prior graveyard argument to reopen. TRADE-SYSTEM.md documents humanTrade's 3-step machine
    ("Back always steps back") without ever addressing the P-has-nothing-to-offer case. The
    flee-not-offered-when-broke todo is Wyatt's DELIBERATE ruling that a broke defender's flee
    option should vanish silently and NEVER show a greyed button+reason, specifically because
    double-tails recurs many times per battle and a repeated reason would nag — that reasoning is
    FREQUENCY-based and explicitly does not apply to a once-per-turn-decision like Trade (which is
    already in the D-41 grey+reason family, item #2 of 6).
  implication: (1) Not reopening a settled argument — genuinely never addressed. (2) NOT the same
    fault-family as flee-not-offered — that ruling is about a HIGH-FREQUENCY, NON-BLOCKING
    omission (battle continues fine without flee); this fault is a LOW-FREQUENCY (once per turn)
    TOTAL SOFTLOCK (the whole table waits). Trade should get the grey+reason treatment (matches
    its existing D-41 membership); flee should not (Wyatt's explicit, frequency-based exception).
    These are different classes and the flee ruling must not be touched.

## Resolution

root_cause: "4/src/ui/flow.js:1811 — the Trade action's `canTrade` gate checks only whether
another captain holds cargo; it never checks whether the acting captain (p) has anything at all
to offer (p.coins>0 || p.ing.length>0). This lets a broke, empty-hold captain click an ENABLED
Trade button and enter humanTrade(), whose step 1 ('what will ye GIVE') is then structurally
unsatisfiable regardless of what they chose to WANT, and whose Back option only returns to step 0
(re-picking WANT), which can never fix a GIVE-side problem — producing a permanent soft-lock that
stalls the whole table. PRE-EXISTING since 511c427 (2026-08-11, the /4 redesign's very first
commit), unchanged through tonight's other work — exposed, not caused, by tonight's QA depth
(confirmed by diffing against e58fda4, the commit immediately before tonight's QA doc)."
fix: "Three coordinated edits in 4/src/ui/flow.js, all within humanAct()/humanTrade() (UI tier
only, 4/src/engine/ untouched): (1) humanAct(): added `const canOffer=p.coins>0||p.ing.length>0`
and folded it into `canTrade` as an independent AND-condition (mirrors Attack's own independent
`canAfford` leg, same D-41 grey+reason family) — the Trade button is now correctly disabled with
a stated reason when P has nothing to offer, matching bot parity (engine's composeOffer already
declines this state via `if(!giveIng&&!giveCoins)return null`, rule 13). (2) humanAct(): the
button's `why` and the menu's `sub` helper text each got an independent branch for the new
condition, following Attack's exact two-independent-reasons shape (never folded into one `if`, so
neither reason can silently suppress the other — same lesson Attack's own comment already states).
(3) humanAct()'s `v===\"trade\"` branch gained a redundant safety-net guard identical in shape to
Attack's existing `#5d` guard (defends a forced/edge selection, not just the button). (4) Defense
in depth: humanTrade(p) itself now declines cleanly (flash + return false) at the top of the
function when `!p.coins&&!p.ing.length`, symmetric with the existing step-0 `!anyHeld` guard, so
the function is self-protecting for any future caller, not only the current menu gate. No
`4/src/engine/` changes; no new constants (canOffer derives from live p.coins/p.ing, matching
rule 9); the flee-not-offered-when-broke ruling (different fault-family — high-frequency,
non-blocking, Wyatt's explicit no-greyed-button exception) was read and NOT touched."
verification: "(1) Live browser repro BEFORE fix (solo, state-injected p.coins=0/p.ing=[], another
captain holding cargo): Trade button enabled, give-prompt showed exactly one disabled button,
Back cycled to WANT and back to the identical give-prompt — reproduced the QA doc's dead end
exactly. (2) Same repro AFTER fix, fresh Chrome/server (module-cache-safe per
DRIVING-THE-GAME.md §1): Trade button now disabled=true with
why/data-why='Ye've nothin' to trade — an empty hold and an empty purse.', sub-text matches. (3)
Direct call humanTrade(brokeCaptain) returns false immediately, no dead-end render, panel
unchanged — defense-in-depth guard confirmed working standalone. (4) Gates: root `npm test`
PASSED 0 failing; `4/scripts/prompt_field_parity_check.js` PASS (3/3); `4/scripts/audio_map_check.js`
OK; `4/scripts/bot_bake_pass_check.js` PASS (5/5, 0 fail, 60 games); `scripts/host_guest_parity_check.js
--tree=4 --strict` shows exactly the three documented reds (SAILRECT, SWEEPARRIVE, ORCH-localAsk) —
nothing new. (5) TWO-WINDOW CREW VOYAGE, driven on both seats with the real Firebase rig
(4/scripts/mp_rig.mjs), autoplay answering every prompt including trades: reached 'Blackbeard is
deciding...' with Blackbeard's row reading EMPTY HOLD on the host's own CAPTAINS panel — the exact
scenario that caused the original stall, live-screenshotted — and the voyage continued straight
through it, past round 7 (the original stall point) to a full 14-day, 235-event finish: 'Flaky Jack
wins!' with 5 trades struck across the table (Wyargh alone struck 4). Host and guest both reported
identical round(14)/events(235) at the finish; guest's own End of Voyage screen captured on screen.
(6) PASS-AND-PLAY VOYAGE (no Firebase, single Chrome, one generic driver instance carrying every
hand-off automatically since the hand-off button is a normal .apBtn): ran 17 days, 300 events, 23
total trades (Wyatt alone struck 22), well past the original Day-2 stall point, to a clean 'Dough
Hook wins!' end screen. No stall, no dead-end give-prompt, in either mode, across ~2000+ combined
autoplay ticks and ~28 total trade offers resolved."
files_changed:
  - 4/src/ui/flow.js
