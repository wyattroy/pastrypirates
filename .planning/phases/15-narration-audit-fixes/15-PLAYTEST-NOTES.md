# Phase 15 — playtest notes

---

# SESSION 2 — recorded two-tab playtest (2026-07-30, room NAMF)

Wyatt host on :8231, Claude guest seat 1 on :8232, 2 bots. Every narration line recorded on the guest
with timings via a MutationObserver on `#actionPanel`. ~150 lines logged.

## CONFIRMED FIXED — yesterday's and this morning's work, seen live

| Fix | Evidence on screen |
|---|---|
| **F7 prompt leak / delivery** | `Wyatt is deciding…` ×2 and `Wyatt is choosing where to sail…` ×2 reached the guest; **zero** host prompts leaked in ~150 lines. Wyatt confirmed the mirror image (`Claude is deciding`) on his side. Yesterday: 0 of 2516 lines carried the spectator form. |
| **F11 shadowed Trade reason** | Greyed `🤝 Trade` rendered with **its own** reason — *"No one's holding cargo to trade for yet."* — while `⚔️ Attack` sat enabled beside it. Yesterday this slot showed Attack's tip. |
| **F1/F2/UI-06 lobby** | `Claude — you` · `Wyatt` · `Dough Hook — 🤖 bot`. Name once, plain "you". Yesterday: `Wyatt — Wyatt — ye`. |
| **G4 intro + G5 reorder** | New intro wording; recipe draft now step TWO, before turn order, in multiplayer. |
| **G4 recipe prompt** | `Claude, choose yer recipe:` |
| **F5/G1 icon placement** | `Dock at 🥚 Clucker's Cove` · `Docking at 🥚 Clucker's Cove — flip!` · `buy a dozen 🥚 Sand-Speckled Eggs` — icon before the NOUN, inside the flavour phrase. |
| **F10/G1 dangling "it"** | `Claude — ye flip ⚫ TAILS, but buy a dozen 🥚 Sand-Speckled Eggs anyway for 3🌕` — goods named, place dropped per Wyatt's Q4 ruling. |
| **D-18 #2 storm second leg** | Same round, both forms correct: `Now the storm blows **Wyatt** west!` (spectator) vs `Now the storm blows **ye** west!` (actor). This line used to hardcode "you" for everyone. |
| **NARR-02 broke-can't-anchor** | `Claude — ye can't afford to anchor. Flip and take yer chances.` **First live sighting** — gate-asserted since 15-02, never before seen in play. Both halves of NARR-02 now confirmed. |
| **D-37 wind verb** | "blows" throughout; `Flaky Jack is blown into the trade winds and swept around the rim!` |
| **D-50 windHoldPhrase** | `— Round 2: wind still blows north, this northerly is gusting —` (helper, not string concatenation). |
| **G8 fade / F6** | Across ~150 lines **no live line ever carried `fadeOut`** — only the outgoing ghost. Panel height moved **0px** on every swap. Ghost CSS verified: `pointer-events:none`, `0.18s`, `position:absolute`. A sail click registered first time. |
| **D-33 real flip label** | `Flip to dodge!` — the genuine label, not the unreachable `"Flip the dubloon!"` fallback. |

## G10 — the storm anchor prompt offers a choice it cannot honour — **SHIPPED 2026-07-30**

**Wyatt:** *"oooh -- this should also have a greyed-out button because you can't anchor!"*

Seen at 0 coins during a storm push into land. The prompt read:

    Claude: the storm's blowin' ye into land! Anchor safely, or take yer chances dodging the rocks.
    [ Flip (⚪ HEADS: dodge safely. ⚫ TAILS: lose a crate) ]

**Two faults, not one:**
1. The `Pay 1🌕 to anchor` option **vanishes silently** when the purse is empty (`src/ui/flow.js:226` gates it on `p.coins>=1`) instead of greying out with its reason. Sixth instance of the D-41 family, after Attack, Trade, coins-only, hail-Counter and dock-buy.
2. **Worse — the prompt text still advertises it.** *"Anchor safely, **or** take yer chances"* offers a branch with no button behind it.

The information exists but lands on the wrong surface: the narration a beat earlier says *"ye can't afford to anchor"*, then the prompt contradicts it. Exactly D-40's finding — explanation on the commentary surface, decision on another.

**Fix needs both halves:** grey the anchor option with its reason (D-41 pattern), AND make the prompt not offer the choice when it is unavailable.

**Both halves shipped.** The option is pushed unconditionally with `disabled:broke` and his reason verbatim (`Yer too broke to anchor`), supplied ONLY when broke so assertion 6's reachability rule holds; and a third prompt case for broke-with-crates was built by DELETING the offer clause, never by writing new copy. The `brokeAnchorLine` narration (NARR-02 case 2) stays — the explanation now lives on BOTH surfaces, which is the fix, not duplication.

## G11 — coin-picker prompt reads oddly on a coins-only offer — **SHIPPED 2026-07-30**

`Add any 🌕 to yer offer of nothing yet?` — Wyatt: *"this is a weird statement, for players who only offer coins! It should just say 'How many?' -- and i think it would work with all branches"*. Approved: **`How many?`** for both branches. Note the crate branch also carries a `No extra coins` button, so that screen reads "How many?" above a row ending in that option — clear, but he loses the reminder of which crate he is offering.

## G12 — flip outcomes must be ALL CAPS in play — **SHIPPED 2026-07-30**

Wyatt: *"in most places, we use all caps for HEADS and TAILS -- but here, I forgot to."* Swept: the ONLY in-play offender is `src/ui/flow.js:519`'s tails dock prompt, fixed by his rewrite below. Everything else lowercase is **explanatory prose** (the how-to-play modal) or **statistics** (award bylines, `heads-luck`), and he ruled those stay: *"just the in-play line is fine, leave the prose and stats"*.

**Rule:** ALL CAPS when the game announces a flip outcome as it happens; lowercase when teaching or tallying. Same shape as the ye/you distinction.
**Hazard:** a blanket replace would hit `e.heads`, `p.heads` and the `.coin.heads` CSS class — the `layout`→`layet` trap from D-29. Scope to string literals.

## G13–G26 — the rest of the session-2 punch list, with dispositions

Lettered and executed by `.planning/quick/20260730-playtest-session2-fixes/PLAN.md` on 2026-07-30.

| ID | What he said / what it is | Disposition |
|----|---------------------------|-------------|
| **G13** | *"the two coin emojis next to each other are confusing"* — the storm flip button's ordinary branch | **SHIPPED.** `lose half yer treasure (−N🌕)`. The `trueShipwreck` and `broke` branches were already fine and are byte-identical. |
| **G14** | *"the tradewinds to move players square-by-square, quickly… then we don't need a new narration line, and the players are just seeing what happens"* | **SHIPPED, host AND guest, from ONE shared stepper**, with no engine change. A rim sweep is pure GEOMETRY over a static ring every client already holds — unlike a storm push, which is simulation. Bot-storm and battle-flee sweeps still render instantly (documented fall-back, no event at the entry cell). |
| **G15** | *"the storm animation didn't move your boat until AFTER the message disappeared… make the movement happen before the message, for all movements during all storms"* | **SHIPPED.** Five `windLeg` branches reversed to paint-then-narrate, and the gate that used to pin the WRONG order for two of them is now an INVARIANT over the whole function. The lag he actually watched was the rim sweep — that is G14. |
| **G16** | *"the whole thing is written in normal english not pirate, so the 'ye' feels weird and out of place"* — the privacy notice | **SHIPPED.** `you`. The register gate's exception list was generalised from "the LABEL class" to OUT-OF-CHARACTER CHROME with a `kind` field, and the credits anchor moved into it — a strictly tighter gate, not a widened one. |
| **G17** | *"please fade the current line, THEN show the next"* — overriding this morning's G8 overlap | **SHIPPED.** 180ms fade, then a 180ms-delayed reveal. `panel()` stays synchronous. He waved off the pacing objection: *"that's on me to decide."* **Needs his eye in a browser.** |
| **G18** | *"A boxed-in bot SHOULD escape via the rim"* | **SHIPPED, UI-tier.** `botTurn` now mirrors the engine's `takeTurn` ladder by CALLING the engine's existing `boxedIn()`/`rimEscape()`. Bots used to escape only in headless runs. |
| **G19** | Storm rain differed per client; he chose seeding (option 1) and the measured midpoint (option 3) | **SHIPPED.** `mulberry32(game.seed)`, never `game.r()`. baseSpeed 0.676, tile ×0.969 — the midpoint of the two screens measured live. Jitter KEPT; variation moved from between PLAYERS to between GAMES. **Needs his eye, and a Safari check.** |
| **G20** | The queued re-record batch | **RECORDED.** `docs/DETERMINISM-RERECORD-NEXT.md` extended with the bot-intelligence cross-reference. G14's guest half is explicitly NOT queued — it shipped without an engine change. |
| **G21** | *"i know this… I think it's fine -- it renders okay in the game, because the renderer seems to nudge them next to each other"* — ships stacking after a rim sweep | **RULED, do not fix.** `.planning/todos/pending/ships-stack-after-rim-sweep.md`. The renderer nudge (`shipXY`, ±0.18 cell) is the load-bearing half. |
| **G22** | *"we don't need to keep reminding a broke player that they're too broke to flee every time they flip double-tails lol. keep it as is"* | **RULED, do not fix** — and now explicitly **no greyed button either**, a deliberate exception to the D-41 family. Extended in `.planning/todos/pending/flee-not-offered-when-broke.md`. |
| **G23** | *"just the in-play line is fine, leave the prose and stats"* | **RULED.** `.planning/todos/pending/flip-outcomes-all-caps-in-play-only.md`. The sweep is DONE; the file exists to stop it being re-run, and names the `e.heads` / `p.heads` / `.coin.heads` blanket-replace hazard. |
| **G24** | *"i don't care at all about breathing room around inline items right now -- i just wanted the emoji wording fix"* | **DECLINED.** No inline-icon margin change was made; `index.html` had an empty diff in G13's commit. Recorded as a comment at the G13 site. |
| **G25** | Asked whether the four host/guest drifts were structurally fixed: *"yes, add it and pull D-55 forward"* | **SHIPPED.** ONE `sailHighlightRect()` builds both the host's and the guest's sail squares. The guest's dimmer, class-less, unanimated rect is gone. **Needs a guest-seat eyeball.** |
| **G26** | The parity gate D-56 recommended and nobody wrote | **SHIPPED.** `scripts/host_guest_parity_check.js`, `npm test` 16 → 17 gates. Three assertions, all red-proofed. D-57 (two narration schedulers) is the one drift still unenforced — recorded, deliberately not fixed. |

## COPY QUEUE — approved 2026-07-30, ALL APPLIED

Every item below shipped on 2026-07-30. Kept as the record of what was approved and where it went.

1. ✅ Tails dock prompt → `⚫️ TAILS! Take treasure instead? Or buy a bundle of 🌼 Velvety Vanilla Beans?` (amounts stay on the buttons, per his D-31 no-duplication principle) — **G12**
2. ✅ Coin picker → `How many?` — **G11**
3. ✅ Privacy notice → back to plain "you" (out-of-character chrome, like the labels) — **G16**
4. ✅ Fade → strict sequence: fade current line OUT, then show next. He explicitly waved off the drag concern: *"that's on me to decide"* — **G17**
5. ✅ Tortuga → **remove** the special case; it becomes a dock like any other. *"we're not adding another storm outcome -- we're actually removing one"* — shipped earlier the same day (G2, `20260730-playtest-notes-fixes`)
6. ✅ Dock addressed lines → drop the place — shipped earlier the same day (G1, same plan)
7. ✅ G10, G11, G12 above — all three shipped

---

# SESSION 1 — two-tab playtest notes (2026-07-29)

Wyatt hosting on `localhost:8911` (seat 0), Claude guest on `localhost:8912` (seat 1), 2 bots.
Room XUDV. Both origins serve worktree `new-gsd-project-e18e9f` at `ab98e04`.

Findings are logged live as Wyatt calls them. Nothing here is fixed yet.

---

## F1 — "ye" is wrong when it is an identifying LABEL, not address (D-29 exception)

**Wyatt, on the lobby seat row:** *"this should say 'you' not 'ye'."*

Screenshot showed: `Wyatt — Wyatt — ye`

**He is right, and it is a class of error rather than one string.** D-29 converted every
second-person pronoun in player-facing text. But "you" does two different jobs in this game:

- **Address** — speaking *to* the player inside a sentence: *"ye pay 1🌕 and sail"*, *"yer turn!"*,
  *"ye flip ⚫TAILS and run aground"*. **`ye`/`yer` is correct here** — this is the overwhelming
  majority (~50 sites) and none of them should change.
- **Demonstrative label** — pointing *at* an entry to say *this row is the reader*. Not a sentence,
  has no verb, and is not spoken in the game's voice. **`you` is correct here.** "Wyatt — ye" is not
  pirate, it is a grammar error: `ye` is a pronoun standing in for a person, so a bare
  `name — ye` reads as "Wyatt — thou", not "Wyatt — that's the one that's you".

**The rule to record (proposed):** the pirate register applies to text the *game speaks*. A label
that identifies which row/seat/field belongs to the reader is UI chrome, not narration, and keeps
plain "you".

**All three instances of the label class:**

| Site | Current | Should be |
|---|---|---|
| `src/ui/lobby.js:117` | `escHtml(s.name)+(me?" — ye":"")` | `" — you"` |
| `src/ui/util.js:98` | `` `${escHtml(s.name)} — that's ye!` `` | `that's you!` |
| `index.html:674` | `placeholder="Player 1 (ye)"` | `(you)` |

Verified by inspection that no *other* `ye`/`yer` site is in this class — the rest are all
in-sentence address and correctly converted.

**Consequence for the D-29 gate** (`scripts/ui_contract_check.js`): it currently drives
`\byou\b`/`\byour\b` to zero across player-facing strings, so restoring these three will make it
fail. The gate needs a narrow, *named* allowlist for the label class — with the reason attached, so
a later pass does not "fix" them back to `ye`. Same shape as the `src/ui/recipe.js` exclusion
already carried there.

---

## F2 — a seated player's name renders TWICE in the lobby row (pre-existing)

Spotted in the same screenshot: `Wyatt — Wyatt — ye`.

`src/ui/lobby.js:120-121` renders `${pn(i)} — ${label}`, and for a joined human
`label` already begins with `escHtml(s.name)` (`:117`). So the name is printed once by `pn(i)` and
again inside `label`.

**Not caused by D-29** — the duplication predates this phase; the `— ye` suffix just drew attention
to it. It only affects seated humans: an empty seat renders `label="🤖 bot"`, giving
`Davy Scones — 🤖 bot`, which is correct and useful.

Suggested renderings:
- me → `Wyatt — you`
- another human → `Claude`
- empty seat → `Davy Scones — 🤖 bot`

**Not yet raised with Wyatt as a decision** — flagged here; he saw the doubling in his own
screenshot but commented only on the pronoun.

---

## F3 — NOT A DEFECT: stale module cache on the host tab

**Wyatt:** *"This is old language, not my new updated language — I rewrote it"*, quoting his intro
barrier rewrite.

**His copy is already shipped, byte-for-byte.** `src/ui/flow.js:930`:

    ⚓ Ahoy! Gather every ingredient in yer recipe, then sail home first to win! <br><br>
    ⛵️ Each turn, ye sail, then ye plunder.<br><br>
    ${iconImg(EYES_IMG)} Watch this panel — she'll steer ye straight!

Matches what he pasted exactly, including the icon positions (D-16 satisfied).

**Cause: his host tab was serving cached ES modules.** Same symptom hit on the guest tab earlier in
this session — `localhost:8911` rendered the pre-D-29 splash (*"You came to the sunny shores"*) until
a fresh fetch, after which it correctly read *"Ye came…"*. Chrome caches each module URL separately,
so an ordinary reload is not sufficient.

**Resolution:** hard reload (Cmd+Shift+R) on the SAME origin — `pp_sess` is intact on 8911, so the
host session and room XUDV recover. Changing port would isolate storage and lose the room.

## F7 ROOT CAUSE FOUND — `ask()` broadcasts the HOST's raw prompt to every client

**This is the highest-value find of the playtest, and it was only findable by playing.**

**Wyatt:** *"just now, i saw that you received a very confusing version of MY prompt — you should never
receive my prompt though. You should receive 'wyatt is deciding'."*

**Confirmed with recorded evidence, not recollection.** The guest-side MutationObserver captured two of
his prompts arriving on seat 1's panel while seat 1 was NOT being asked to act:

| Reached the guest | Held |
|---|---|
| `Wyatt, what'll ye do:` | 1694 ms |
| `Tails! Take 3🌕 — or buy 🌼 a bundle of Velvety Vanilla Beans for 3🌕?` | 3242 ms |

At the moment of his screenshot the guest's box contained that exact prompt with
`class="apMsg fadeOut"` and **`opacity: 0`**.

**So his two complaints are ONE bug, photographed two seconds apart.** The "empty blue box" is his own
prompt text, still in the DOM, faded to invisible.

**The mechanism — `src/ui/util.js:906`, inside `ask()`:**

```js
const seat=appState.curSeat;
netHandlers().onBroadcast(seat===appState.mySeat?msg:`${pn(seat)} is deciding…`);
```

`ask()` runs on the HOST (it drives the game), so `appState.mySeat` is *the host's* seat. The branch
therefore resolves as:

| Actor | `seat===mySeat` on host | Broadcast to EVERY client |
|---|---|---|
| Host | **true** | the host's **raw prompt** — leaks to all guests |
| Guest | false | `X is deciding…` — including to the guest who is actually deciding |

The intent is plainly "actor sees the prompt, spectators see *is deciding*", but this line produces
**one string for the whole table**, so it cannot express a per-viewer difference. Fourth instance of
the same root shape as D-35 (sail wording), D-55 (highlight DOM), D-57 (guest fade): a single
broadcast where a per-viewer decision was intended.

**The fade is NOT at fault, and this must be recorded so it is not "fixed" by reverting D-57.** The
fade behaves correctly — it faithfully fades content that should never have been sent. Before D-57 the
leaked prompt simply sat on the guest's screen permanently instead of vanishing; the fade made a
pre-existing leak *visible*.

**Fix (Wyatt's, and the copy already exists):**
1. Always broadcast `${pn(seat)} is deciding…` — never the raw `msg`. The actor receives its real
   prompt through the separate prompt channel (`onLocalAsk` locally, `onRemotePrompt`/`watchPrompt`
   remotely), so dropping the raw broadcast costs the actor nothing.
2. Per F6, never fade the last line — so `Wyatt is deciding…` stays up and the box is never empty.

He named the shape himself: *"you can always just keep up '{player} is deciding' so that there's never
an empty blue box for the spectator."*

**Two hazards for whoever implements it:** the host must keep seeing its own real prompt (it arrives by
the other channel, so this is safe but worth asserting), and `is deciding…` must not clobber the
previous narration line too eagerly or it destroys the very thing F6 exists to preserve — players
watching each other's turns.

**Related strings already in the codebase** (so this is wiring, not new copy): `util.js:906`
`is deciding…`; `orchestrator.js:359` `is deciding…`; `orchestrator.js:688` `is choosing a recipe…`;
`flow.js:196` `is choosing where to sail…`.

---

## HOST-SEAT CONFIRMATIONS (Wyatt playing solo-with-bots, room HYMQ, screenshots)

Three more items verified on the HOST seat at 0-1 coins — a state the guest run never reached.

**NARR-02 / D-11 case 1 — the broke-can't-sail line: PASS, first live sighting.**

    Wy — yer too broke to pay the crew. No sailing this turn.

This is the requirement's whole point: before this phase a captain with 0 coins got no move and the game
said nothing. Rendered in the addressed form for the actor, at 0 coins, exactly as `brokeSailLine()`
specifies. Gate-asserted since 15-02, never seen in a real game until now.

**The 0-coin action-prompt reframe: PASS.**

    Wy, ye got nothin to pay yer crew, so they won't budge. Pick one:

`src/ui/flow.js:642`'s `p.coins<=0` branch. Reframes the menu rather than offering a sail option that
cannot work — the D-41 principle applied to the prompt itself rather than to a button.

**D-41 Attack — the reference implementation: PASS, greying AND reason.**

    ⚔️ Attack (−2🌕)   ← greyed
    Yer too poor to afford powder! Go fishin' 🎣

At 1 coin with an adjacent target. Confirms the pattern works end to end *when only one reason is in
play* — which sharpens F11 rather than contradicting it: the Attack branch is the one that always wins,
so its own text is never suppressed. F11 is specifically that the Trade reason lives in the `else` arm
and is shadowed whenever a target happens to be adjacent.

Also visible: `Fish (+1–2🌕)` now renders the en dash (`0022d74`).

**Running D-41 status:**

| Case | Greys out | Explains why |
|---|---|---|
| Attack — can't afford powder | ✅ | ✅ |
| Trade — nobody holding cargo | ✅ | ❌ shadowed (F11) |
| "— coins only —" at 0 coins | untested | untested |
| Hail `Counter` — bot can't raise | untested | untested |

---

## F12 — COINS GO NEGATIVE: the bot's counter-offer cap ignores coins already in the offer

**The most serious find of the playtest — it corrupts game state, not just wording.**

**Wyatt:** *"flaky jack counters me but i don't have enough to pay. AND YET i was able to pay it! I went
technically into -1, but am now at 0 because we get +1 for cooperating."*

Observed: Flaky Jack countered *"1🌕 more for my 🥚 Speckled Eggs, take it or leave it."* with buttons
`Pay 1🌕 more` / `Walk away`, while Wyatt held **1 coin** and had already committed coins to the offer.
He paid, went to **−1**, and the `tradeBonus` `p.coins++` masked it back to 0.

**Cause — `src/ui/flow.js:557` and `:566-570`:**

```js
const shortfall=Math.max(0,cost-bonus-ingVal-give.coins);
const askFor=Math.min(shortfall,p.coins);        // capped against TOTAL coins
…
const totalCoins=give.coins+askFor;              // but deducts the offer's coins as well
p.coins-=totalCoins;q.coins+=totalCoins;
if(appState.game.cfg.tradeBonus){p.coins++;q.coins++;}
```

`askFor` is capped at `p.coins`, but the amount actually debited is `give.coins + askFor`. The coins
already pledged in the original offer are counted twice — once in the offer, once as available headroom
for the counter. With `give.coins = 1` and `p.coins = 1`: `askFor = min(shortfall,1) = 1`, `totalCoins = 2`,
debited against a balance of 1 → **−1**.

The comment above the line states the intent — *"if the human can't cover the full shortfall, name the
smaller amount they can afford"* — so the cap is deliberate and simply computes the wrong headroom.

**Fix (one line):**

```js
const askFor=Math.min(shortfall,p.coins-give.coins);
```

The existing `askFor>0` guard then does the rest: a player with nothing to spare gets `askFor = 0`, no
counter is offered, and the flow falls through to the refusal — which is the D-41 pattern behaving
correctly.

**Determinism risk: none.** `src/ui/flow.js` is UI-tier, and this is inside `humanTrade` — a path
`Game.play()`'s headless corpus never executes (the same reasoning D-19 used to establish that zero
`parley` events appear in any of the 31 fixtures). `src/engine/index.js` is untouched.

**Severity note.** This is the same family as D-41's four dead-ends — an option offered without
verifying it can work — but it is the only instance that **mutates state wrongly** rather than
dead-ending harmlessly. The `tradeBonus` masking it to 0 is what makes it easy to miss: a player with
2+ coins of headroom never notices, and at exactly the boundary the bonus hides the negative.

**Worth checking alongside the fix:** whether any other path can drive `coins` below zero, and whether a
non-negative invariant belongs somewhere central. Flagged, not assumed.

---

## F11 — D-41: the greying WORKS, the "explain why" is unreachable when a target is adjacent

Tested deliberately in a restarted game (room HYMQ, 4 seats) after engineering the required window:
turn order put **Claude first**, so the action menu rendered before any captain had docked — event
stream was exactly `["newround","turn:1"]`, i.e. zero cargo on the table.

**The greying itself: PASS.** Measured on the live button:

| | Value |
|---|---|
| `disabled` property | `true` |
| class | `apBtn apDisabled` |
| computed opacity | `0.45` |

**The helper text: FAIL.** The rendered `.apSub` read
*"Attacking costs ye 2🌕 for powder. Firing downwind wins ties!"* — the **Attack** button's text, while
Attack was **enabled**. The greyed Trade button carried no reason at all, and the text shown beneath it
described a different, working button. That is worse than silence: it invites the player to connect the
greying to attack costs.

**Cause — `src/ui/flow.js:640-641`, an `else if` that should be additive:**

```js
let sub=null;
if(targets.length)sub=canAfford?`Attacking costs ye ${powder}🌕 for powder…`:`Yer too poor to afford powder! Go fishin' 🎣`;
else if(appState.game.tradeOpp(p).length&&!canTrade)sub=`No one's holding cargo to trade for yet.`;
```

Wyatt's approved Trade reason — *"No one's holding cargo to trade for yet."* — **is present in source** but
sits in the `else` arm, so it is unreachable whenever an attack target happens to be adjacent. The two
conditions are independent (an adjacent enemy says nothing about whether anyone holds cargo), so they
must not be exclusive.

**Priority is also inverted.** The surviving branch shows *informational* text for an ENABLED button and
suppresses *explanatory* text for a DISABLED one. A reason for a greyed control is strictly more useful
than a tip about a working one.

**Fix:** collect reasons into a list and render all that apply, ordering disabled-button explanations
first. `ask()`'s single `sub` slot (`util.js:898`, rendered at `flow.js:89` / `orchestrator.js:951`) can
carry several sentences, so no signature change is needed — this is a logic fix inside `humanAct`, not a
mechanism change.

**Why static review could not catch this.** The verifier confirmed the `disabled` flag exists and the
helper string exists. Both are true. What it could not see is that they are *mutually exclusive at
runtime* — which only surfaces when a target is adjacent AND no one holds cargo, the exact coincidence
this restarted game was set up to produce.

**Still untested:** the "— coins only —" greying (needs 0 coins plus an opponent holding cargo — opposite
conditions, so it comes later in the script) and the hail `Counter` greying (needs a bot hail where the
bot cannot afford a raise).

---

## F10 — the addressed dock `bought`/`coins` lines have a DANGLING "it" (deviation from D-46)

Read live on seat 1 after buying a crate on tails:

    Claude — ye flip ⚫ TAILS, but buy it anyway for 3🌕

**"It" has no antecedent.** The neutral sibling reads correctly because the goods are named earlier in
the same sentence:

    Claude docks at Full Cream Folly for 🥛 some jugs of Fresh Milk and flips ⚫ TAILS, but buys it anyway for 3🌕

**This is a deviation from D-46's explicit scope.** D-46: *"Only the `ing` (heads) narration branch
loses its place clause. The other three dock branches still need theirs. Do not apply the cut across
all four."* The heads branch is correct — `ye haul aboard 🍬 a jar of Crystal Sugar!` names the payoff,
so nothing dangles. But the addressed `bought` and `coins` branches (`src/ui/util.js`, `gA` object) were
cut down to `ye flip ⚫ TAILS, but buy it anyway for 3🌕` and `ye flip ⚫ TAILS and take 3🌕`, losing the
context that made "it" resolvable.

`coins` is less broken (`take 3🌕` needs no antecedent) but is equally uninformative — a player reading
only their own addressed line never learns WHICH island or ingredient they just passed up.

**Fix:** restore the goods to the addressed `bought` line at minimum, e.g.
`ye flip ⚫ TAILS, but buy 🥛 some jugs of Fresh Milk anyway for 3🌕`. Composes with F5 (icon directly
before the noun it names).

---

## F9 — dock-on-tails: the buy option vanishes silently when unaffordable

Observed on seat 1 with **2 coins** docking at Full Cream Folly. Wyatt, with enough coins, got the real
choice — *"Tails! Take 3🌕 — or buy 🌼 a bundle of Velvety Vanilla Beans for 3🌕?"* with two buttons. On
2 coins **no prompt appeared at all**; the turn resolved straight to `Claude — ye flip ⚫ TAILS and take 3🌕`.

Same family as D-41's four dead-ends, inverted: rather than offering an option that cannot work, this
**removes the choice with no explanation**. The player never learns that buying the crate was possible
but unaffordable — which is exactly the information that teaches the dock-on-tails rule.

Per D-41's own reference implementation (Attack: `disabled` + `sub` helper text), the buy option should
render greyed with its reason. Low severity, same one-line pattern, and it belongs with the D-41 work
rather than as a separate item.

---

## F7 (original observation) — an unnamed second-person prompt is shown to spectators as-is

Suspected while watching Wyatt's turn, then confirmed by comparing against my own turn.

**The observation.** While seat 1 (me) was NOT being asked to act — `#actionPanel` had no
`needsAction` class and no buttons — my panel displayed:

    Cast yer line — flip!

Later, on my own fishing turn, my panel displayed **the identical string**. So the actor and every
spectator read the same second-person sentence, and on a spectator's screen it reads as an instruction
to them.

**Why it happens.** Prompt text is composed once by the host and rendered verbatim by every client
(`watchPrompt` renders `p.msg` from the payload — the property that D-35's sweep correctly identified
as what keeps guest renderers from drifting). There is no actor/spectator variant for ordinary
prompts. One *does* exist for battles: `asyncBattle` picks between `msg` and `spectMsg` by
`seat===mySeat` (`src/orchestrator.js:361`) — so the mechanism is already in the codebase, just not
applied here.

**It is an inconsistency, not a blanket defect — some prompts already carry the name:**

| Prompt | Text | Named? |
|---|---|---|
| Sail pick (`sailPickMsg`) | `Claude: click any yellow square to sail there (−1🌕)` | ✓ |
| Action menu (`humanAct`) | `Claude, what'll ye do:` | ✓ |
| **Fishing** (`fishCast` label, `flow.js:592`) | `🎣 Cast yer line — flip!` | ✗ |
| **Docking flip** (`flow.js:433`) | `Docking at 🌾 the Flour Patch — flip!` | ✗ (but not second person, so it reads fine) |

So the defect is specifically **second person + no name**. The docking flip is unnamed too but phrased
neutrally, which is why it does not misread.

**This composes with F6, and F6 makes it MORE important.** Wyatt's fade decision is explicitly that
players should watch each other's turns as they happen — so hiding the actor's prompt from spectators
would be the wrong fix. The right fix is the name: either name the actor in the prompt (cheapest, and
matches the two prompts that already do it) or give prompts the actor/spectator split battles already
have.

**Not yet a decision — needs Wyatt's call** on which of those two shapes he wants.

---

## F8 — cosmetic: `Fish (+1-2🌕)` uses an ASCII hyphen as its range separator

`src/ui/flow.js:596`. Outside D-38's rule (it is a range, not a minus, so it takes no sign), but it
renders narrower and lighter than the U+2212 `−` used on every neighbouring control — visible in the
action menu where `Fish (+1-2🌕)` sits directly under `⚔️ Attack (−2🌕)`. The verifier flagged this as
info-level. An en dash `–` is the typographically correct separator for a numeric range. One character.

---

## F5 (NEW DECISION) — an ingredient icon goes directly before the NOUN it names

**Wyatt:** *"when the ingredient icons are referencing an ingredient (not the island) they should
always consistently go directly in front of the ingredient, not in front of the flavor like they do
now. In the 'Dock at Full Cream Folly' the icon should go directly in front of the island name —
'Dock at 🥛 Full Cream Folly'"*

**The rule:** the icon is a label on a noun, so it sits immediately before that noun — never floated
to the front of the clause, never before the flavour words. Applies whether the noun is an ingredient
name or an island name.

**Audit of every site, measured:**

| # | Site | Renders now | Verdict |
|---|---|---|---|
| 1 | `src/ui/flow.js:619` dock action button | `⚓ 🥛 Dock at Full Cream Folly` | ✗ icon before the whole clause. → `⚓ Dock at ${icon} ${place}` |
| 2 | `src/ui/flow.js:433` dock flip prompt | `Docking at 🌾 the Flour Patch — flip!` | ✓ already correct — icon directly before the place |
| 3 | `src/ui/util.js` `dock.ing` | `hauls aboard 🍫 a pod of Luscious Cacao Beans!` | ✗ icon before the FLAVOUR, not the name |
| 4 | `src/ui/util.js` `dock.bought` | `…for 🍫 a pod of… and flips ⚫ TAILS, but buys it anyway` | ✗ same |
| 5 | `src/ui/util.js` `dock.coins` | `…for 🍫 a pod of…, but flips ⚫ TAILS` | ✗ same |
| 6 | `src/ui/util.js` `dock.empty` | `finds no 🌾 Toasty Wheat` (via `ilabelImg`) | ✓ already correct |

**Sites 3-5 need a data change, not just a re-order — flagged because it is the non-obvious part.**
They render `${ingIcon} ${flavor}` where `flavor` is one authored string (`a pod of Luscious Cacao
Beans`). Putting the icon before the ingredient NAME means knowing where the name begins inside that
string, and it **cannot be derived**: `iname("cocoa")` is *"Cacao Pods"*, but the flavour reads
*"Luscious Cacao Beans"* — no substring match. So `DOCK_FLAVOR`'s 7 entries must be restructured to
mark the insertion point (e.g. a `{prefix, name}` pair rendered as `${prefix} ${icon} ${name}`).
Presentation-tier, no engine change.

Do NOT try to guess the split with a regex — the mismatch above is exactly the case that would
silently produce *"a pod of Luscious 🍫 Cacao Beans"*.

---

## F6 (NEW DECISION) — never fade the last line; fade ONLY when something replaces it

**Wyatt, choosing between the four options offered:** *"I actually don't think 3 is very user friendly.
we want players to be able to see and think about each others' turns with them, as they think. We don't
want those to fade out. I think #1 is the best call. Never fade the last line — only fade when
something replaces it."*

**His reasoning is the load-bearing part and supersedes my recommendation.** I proposed a status floor
("⏳ Waiting on Wyatt…"). He rejected it: narration is *shared attention* — players follow each other's
turns as they happen, so replacing a real line with a status message actively destroys the thing the
box is for. A line should persist until the next line needs the space.

**Implementation:**
- Guest `showNarration()` (`src/ui/panel.js`): the hold+fade from D-57 becomes fade-on-replacement.
  The `_narrToken` bump already identifies "a new line has arrived" — that is now the *only* trigger
  for fading the outgoing line.
- Host `flash()` (`src/ui/panel.js:384`): keep the hold — it is what paces consecutive lines and
  `flash()` is awaited — but stop fading to empty at the end. The next line's render replaces it.
- Reclaims the trailing ~500 ms fade per line, which also serves his standing "we don't want the game
  to drag" note (D-58).

**Honest consequence for NARR-06, recorded so it is not mistaken for a regression:** NARR-06's
criterion is *"narration stays fully visible 10% less time before it begins fading."* Under F6 a
TRAILING line never begins fading at all, so the criterion becomes inapplicable to it. The hold still
governs the gap between consecutive lines, so the 10% cut still does real work — but the requirement's
literal wording is superseded by this decision and should be re-worded rather than re-verified.

**Also supersedes** the empty-box half of the pending `eov-narration-box-not-cleared` todo: with no
fade-to-empty, the end-of-voyage box holds its last line instead of going blank.

**Scope: Phase 18** (narration pacing), alongside D-58's deferred un-blocking of the host loop.

---

## LIVE RESULTS — guest seat 1, room XUDV, round 1

Measured on the guest with a MutationObserver on `#actionPanel` recording, per narration line, the
time it appeared, the time `.fadeOut` landed, and how many times it faded.

**P1 — guest narration holds and fades (D-57/D-58, NARR-06's own criterion): PASS.**
Every line carried `class="apMsg fadeOut"` after a length-proportional hold. Sample:

| Line | Hold |
|---|---|
| `— Round 1: wind is blowin' west —` | 1911 ms |
| `Claude — ye flip ⚪ HEADS!` | 1585 ms |
| `Claude — ye haul aboard 🍬 a jar of Crystal Sugar!` | 2450 ms |
| `Dough Hook takes the wheel…` | 1731 ms |
| `Land's blockin' Wyatt's wind — can't sail as far…` | 4249 ms |

Before this phase the guest path was `panel(html)` and nothing else — no hold, no fade, ever. This is
the behaviour NARR-06 claimed and could not previously demonstrate from a guest seat.

**P4 — host/guest double-fade risk: no evidence of it on the guest.** Every line shows `fades: 1`.
(The verifier's concern was two schedulers on the same `.apMsg`; on this seat only one fired per line.)

**D-23 — bot and human narration hold the SAME duration: PASS, and cleanly measurable.** The same
event type fired for a bot and for a human two turns apart:

| Actor | Line | Hold |
|---|---|---|
| **Bot** | `Dough Hook casts a line, catches a 🐠 sugarfish! (+2🌕)` | **2990 ms** |
| **Human** | `Wyatt casts a line, catches a 🐠 sugarfish! (+2🌕)` | **2810 ms** |

Within 6%, and the residual is explained by character count ("Dough Hook" is 5 chars longer than
"Wyatt"). Under the old split (`BOT_MSG_HOLD_MULTIPLIER` 0.45 vs `MSG_HOLD_MULTIPLIER` 0.72) the bot
line would have displayed ~38% SHORTER than the human one. It does not.

**D-35 — one sail prompt for host and guest: PASS.** The guest rendered
`Claude: click any yellow square to sail there (−1🌕)` — the host-authored `sailPickMsg()` text, not
`remotePickHighlights`'s old hardcoded *"Yer move — click a highlighted square to sail"*.

**D-46 — dock sequence: PASS, all three steps.** Button `⚓ Dock at Glitter Bay` (place), flip prompt
`Docking at 🍬 Glitter Bay — flip!` (ingredient ICON + place name, custom art), heads narration
`Claude — ye haul aboard 🍬 a jar of Crystal Sugar!` (place clause correctly dropped from this branch
only).

**D-48 — dock flavour text KEPT: PASS.** "a jar of Crystal Sugar" — the `DOCK_FLAVOR` phrasing, not
the bare ingredient name. Reconciled in favour of keeping it, as he asked.

**D-19 — the word "parley" is gone: PASS.** Action menu reads `🤝 Trade`.

**D-34 — back marker label never rendered: PASS.** The dock flip prompt showed a circular `‹`, not
the words "← Back".

**D-17 — custom ingredient art inline: PASS (visually).** `sugar.png` rendered inside both the flip
prompt and the dock narration; no raw system-emoji ingredient appeared.

**D-29 — register: PASS in play.** `Claude, what'll ye do:`, `Claude, choose yer recipe`,
`Cast yer line — flip!`, `Land's blockin' Wyatt's wind`. Also the splash/`Yer captain name` after a
hard reload.

**Still NOT verified — the four greyed dead-ends (D-41).** `🤝 Trade` rendered ENABLED on my first
action, which is CORRECT here: Flaky Jack docked before me and took a wheat crate
(`{t:"dock",p:3,ing:"wheat",got:"ing"}` in the event stream), so an opponent did hold cargo. The greyed
state needs a window where nobody has docked — the bots closed it by moving first. Needs either a
fresh game checked on turn 1, or a deliberate setup. Same for "— coins only —" (needs 0 coins) and the
hail `Counter` (needs a bot that cannot afford a raise).

**CANDIDATE FINDING — a spectator sees a second-person prompt addressed to someone else.** While
watching Wyatt's turn, my guest panel displayed `Cast yer line — flip!` with **no name attached** and
no buttons. Read cold on a spectator's screen that says "cast YOUR line" to a player whose turn it is
not. Needs confirming that this is the broadcast prompt rather than narration, and if so it is a
D-08/D-18 case (second person shown to a non-actor). Not yet raised with Wyatt.

---

## F4 — the real count of unapplied approved copy: 4, not 37

Prompted by Wyatt after F3: *"run it now and give me the real count"*. A one-off comparison of all
**144** reviewed, non-merge approval fields in `15-DISPOSITIONS-FINAL.json` against `src/` +
`index.html`.

**Two wrong numbers before the right one, both over-reports, same cause.** Literal fragment matching
against source fails wherever the game *assembles* a sentence: `${DIRNAME[dir]}` where his note spells
out "south", `<span class="nobrk">` splitting a clause, `${ilabelImg(x)}` for an ingredient name, a
helper like `windHoldPhrase()` supplying "is gusting", or a single ` - ` in his note against ` — ` in
source. First pass said 37 unapplied; tightened matching said 19; hand-verifying all 19 said **3**.

**Confirmed unapplied (plus F3's intro banner = 4 total):**

| Row | Approved | Shipped |
|---|---|---|
| `misc:battleLine:orchestrator.js:482` (addressed) | *"Both fire ⚪️ HEADS — but **yer** firing downwind and the shot hits!"* | third-person only |
| `misc:battleLine:orchestrator.js:486` (addressed) | *"**Ye** land a hit!"* | *"Crustbeard lands a hit!"* — `grep "land a hit"` over `src/` returns nothing |
| `adhoc:src/ui/flow.js:928` | *"The Lookout settles — …"* | *"The Lookout's **Call** settles — …"* |

**Pattern: two of three are the ADDRESSED variant.** Third-person forms landed; second-person forms
were dropped. Same shape as D-54 (1 of 11 second-party lines applied).

**Fixed now:** the Lookout wording (`da2f977`) and F3's intro banner (`fbc543b`).

**Deliberately deferred — the two battle lines are NOT a copy fix.** `renderBattle()`
(`src/orchestrator.js:302`) composes a single footer string and `netSetBattle()` broadcasts it
identically to every client; `battleFooter(o)` reads one `result` field. There is no per-seat seam in
the battle path, unlike `flash()`'s `variants` argument. Applying these needs the D-10
neutral-plus-variants mechanism extended into `battleSnapshot()`/`battleFooter()`. This is what the
Task 9 checkpoint already flagged as "recommend defer"; confirmed by reading the code.

**Limits of this measurement, stated so the number is not over-trusted:** 84 fields have every
distinctive fragment present but word ORDER and line IDENTITY were not checked; 41 are too
placeholder-heavy to judge mechanically (*"Bet {N}{coin}"*). Only the planned render-based copy gate —
which generates each line from the live builders and compares it to the approval — settles those.
This heuristic establishes that the copy is broadly applied, not that it is exactly right.

**Harness lesson worth carrying** (extends the existing note in `project_safari_storm_module_cache`
memory from Safari to Chrome): after any source change, a playtest tab must be hard-reloaded, not
reloaded. Two separate false defects in one session traced to this. A cheap mitigation for next time:
have the page print its build/commit short-SHA somewhere visible, so "am I running current code?" is
answerable at a glance instead of by grepping source mid-playtest.

---
