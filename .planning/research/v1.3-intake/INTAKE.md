# v1.3 Intake — Punch List Inventory

**Source:** `notes/edits for pastry pirates.pdf` (10 pages, read in full).
**Purpose:** Faithful, complete extraction of every item/sub-item in the PDF, in document order, plus cross-reference against current planning state. This document does NOT decide anything — it inventories and flags.

**IMPORTANT PROVENANCE NOTE (read first):** `.planning/PROJECT.md` and `.planning/todos/completed/*` both state that the **already-shipped v1.0 milestone's** 15-item punch list was sourced from a file with this exact same name — `notes/edits for pastry pirates.pdf` ("the 15-item punch list came from a live multiplayer game (~7pm ET) plus Safari testing, documented in `notes/edits for pastry pirates.pdf`" — PROJECT.md line 89). The file at that path **today** contains none of the v1.0-described content (no Safari storm crash, no MP timer pause bug, no battle reflip mechanics) — it contains an entirely different 16-item list (pass-and-play bugs, UI recentering, wind particles, ship colors, sequencing, tutorial/hints, narration changes, recipe dedup bug, Parley→Trade rename, trade-wind discoverability, multiplayer playtest bugs) that matches none of PROJECT.md's v1.0 bullet list. **The file has clearly been overwritten/reused for new content since v1.0 shipped.** Flagging this so nobody assumes this document double-counts already-shipped v1.0 work — it doesn't; the current PDF content is new.

---

## Inventory

### V13-01 — Pass-and-play bugs (section header)
- **verbatim:** "Bugs: in pass and play mode (if helpful, see the captain's log at the bottom of this pdf)"
- **source:** PDF item 1
- **restatement:** This is the heading for a group of pass-and-play bugs; it also points to a game log at the end of the document as supporting evidence.
- **kind:** bug
- **decision_needed:** no
- **area:** pass-and-play
- **evidence:** The captain's log at the bottom of the PDF is for a 4-captain (Cat Hook, Flaky Jack, Captain Cannoli, Wyyyyy) pass-and-play game — see V13-61 for full mining of that log.
- **engine_risk:** no

### V13-02 — Timer-disable button does nothing in pass-and-play
- **verbatim:** "Timer disable button not working"
- **source:** PDF item 1.a
- **restatement:** In pass-and-play mode, the button meant to turn off the turn timer doesn't do anything when clicked.
- **kind:** bug
- **decision_needed:** no
- **area:** pass-and-play
- **evidence:** none beyond the report itself
- **engine_risk:** no

### V13-03 — Timer-disable bug detail: pre-dates "confident-bassi," untested in pass-and-play
- **verbatim:** "when the timer-disable button is clicked during a pass-and-play game, it does nothing. The timer stays on. This was a bug before confident-bassi was finished. We haven't checked pass-and-play in any of our unit tests; it must be added to those."
- **source:** PDF item 1.a.i
- **restatement:** Wyatt says this button has been broken since before a project phase/branch called "confident-bassi" wrapped up, and that automated tests don't currently cover pass-and-play mode at all — he wants that test coverage added.
- **kind:** bug
- **decision_needed:** no
- **area:** pass-and-play
- **evidence:** **Notable:** the current git branch for this session is literally named `claude/confident-bassi-7263ea`. This is almost certainly the same "confident-bassi" Wyatt refers to — meaning this bug report may describe something observed either during or right after that branch's work. Worth confirming with Wyatt/git history what "confident-bassi" shipped, since he says the bug pre-dates its completion (i.e., not introduced by it, but not fixed by it either).
- **engine_risk:** no

### V13-04 — Unclear who is betting/calling on battles in pass-and-play
- **verbatim:** "Battle calling/betting during pass and play: It isn't clear in pass-and-play who is doing the calling on others' battles—"
- **source:** PDF item 1.b
- **restatement:** When one pass-and-play player is asked to bet on someone else's battle, it isn't obvious from the screen which player is being asked to bet.
- **kind:** bug
- **decision_needed:** no
- **area:** pass-and-play
- **evidence:** none beyond the report
- **engine_risk:** no

### V13-05 — Fix: name the player being asked to bet
- **verbatim:** "Fix: start bet/call action narration with the players name who is being asked to bet – eg \"Davy Scones, who do you want to bet on?\""
- **source:** PDF item 1.b.i
- **restatement:** Change the narration text so it starts by saying the name of the player who needs to place a bet, for example "Davy Scones, who do you want to bet on?"
- **kind:** narration-copy
- **decision_needed:** no
- **area:** narration
- **evidence:** Exact replacement wording given by Wyatt.
- **engine_risk:** no

### V13-06 — Unclear who the bot is asking to trade in pass-and-play
- **verbatim:** "Unclear in pass and play who the bot is hailing for a trade"
- **source:** PDF item 1.c
- **restatement:** When a bot wants to trade, it isn't clear which player it's addressing in pass-and-play mode.
- **kind:** bug
- **decision_needed:** no
- **area:** pass-and-play
- **evidence:** none beyond the report
- **engine_risk:** no

### V13-07 — Fix: bot should name the player it's trading with
- **verbatim:** "Fix: bot should refer to them by name"
- **source:** PDF item 1.c.i
- **restatement:** When a bot hails someone for a trade, the narration should say that player's name.
- **kind:** narration-copy
- **decision_needed:** no
- **area:** narration
- **evidence:** none
- **engine_risk:** no

### V13-08 — Don't force device-passing for screens everyone can read together
- **verbatim:** "Not exactly a bug, but bad UX: players had to pass the device each time they dismissed the first 2 narration screens (\"Ahoy!\" and \"The crew draws lots\"). Remove these from the pass an play flow – the players in real life can all read them together; one player can click the \"next\" buttons. they should only have to pass the device when making genuine decisions."
- **source:** PDF item 1.d
- **restatement:** Right now, in pass-and-play, everyone has to physically hand the device around just to click past two intro messages that all players can read together in person. Wyatt wants the device-passing requirement removed for those two screens — only require passing the device when someone is actually making a real decision.
- **kind:** ux-tweak
- **decision_needed:** yes
- **decision_question:** Wyatt explicitly labels this "not exactly a bug" — a UX/flow design choice, not a defect. Confirm this is scoped for the next milestone and there's no reason (e.g. anti-cheating, fairness) the device-pass gate exists on those two screens today.
- **area:** pass-and-play
- **evidence:** none
- **engine_risk:** no

### V13-09 — UI recentering bug (section header)
- **verbatim:** "UI recentering bug:"
- **source:** PDF item 2
- **restatement:** Heading for a bug about on-screen elements not staying centered relative to the game board.
- **kind:** bug
- **decision_needed:** no
- **area:** ui
- **evidence:** none
- **engine_risk:** no

### V13-10 — Yellow tiles and rising icons drift off-center on window resize
- **verbatim:** "If the window's shape is changed (eg made narrower) then the highlighted yellow tiles bounce off-center, and the icons that rise out of the ships veer off-center too. ensure that these vectors are calculated relative to the gameboard, not the window itself"
- **source:** PDF item 2.a
- **restatement:** If someone resizes or reshapes their browser window, the yellow highlighted movement squares and the little icons that float up from ships end up in the wrong spot. The fix is to calculate their positions based on the game board itself, not the browser window.
- **kind:** bug
- **decision_needed:** no
- **area:** ui
- **evidence:** none
- **engine_risk:** no

### V13-11 — New UI feature: ambient wind particles (section header)
- **verbatim:** "UI Feature:"
- **source:** PDF item 3
- **restatement:** Heading introducing a request for a new visual wind effect.
- **kind:** feature
- **decision_needed:** no
- **area:** ui
- **evidence:** none
- **engine_risk:** no

### V13-12 — Add a subtle wind-particle effect over the board
- **verbatim:** "Create a subtle \"wind\" effect, by having a few small particles blow gently over the game board in the direction of the wind."
- **source:** PDF item 3.a
- **restatement:** Add a small number of particles drifting gently across the game board, moving in whatever direction the wind is currently blowing, purely as a visual touch.
- **kind:** feature
- **decision_needed:** no
- **area:** ui
- **evidence:** none
- **engine_risk:** no

### V13-13 — Wind effect must be performant, reuse storm rain code
- **verbatim:** "Make sure this is performant on chrome and safari, ideally re-using the storm rain code with a different sprite, fewer sprites, and slower speed. it should feel like a gentle breeze."
- **source:** PDF item 3.b
- **restatement:** The new wind effect needs to run smoothly in both Chrome and Safari. Wyatt suggests building it by reusing the existing storm-rain rendering code, just with a different image, fewer particles, and a slower speed, so it reads as a gentle breeze rather than a storm.
- **kind:** ux-tweak
- **decision_needed:** no
- **area:** ui
- **evidence:** Safari performance is a known sensitive area — the project's storm-rain code was previously the site of a Safari-specific near-crash bug (fixed in v1.0 by switching to a pre-baked PNG tile, per PROJECT.md). Any reuse of that code path should inherit that same performance discipline.
- **engine_risk:** no

### V13-14 — Ship colors too similar (section header)
- **verbatim:** "UI Tweak:"
- **source:** PDF item 4
- **restatement:** Heading for a set of ship-color/UI-cleanup tweaks.
- **kind:** ux-tweak
- **decision_needed:** no
- **area:** ui
- **evidence:** none
- **engine_risk:** no

### V13-15 — Green and blue ships look too similar
- **verbatim:** "The green and blue ships/colors look too similar to some users."
- **source:** PDF item 4.a
- **restatement:** Some players have trouble telling the green ship and the blue ship apart.
- **kind:** bug
- **decision_needed:** no
- **area:** ui
- **evidence:** none
- **engine_risk:** no

### V13-16 — Change blue ship/captain to purple, all assets
- **verbatim:** "Make the blue ship purple, but of the same visual palette. Make sure to change every asset associated with this captain to the new purple – including the boat art asset"
- **source:** PDF item 4.b
- **restatement:** Recolor the blue captain's ship (and every image/asset tied to that captain) to a purple that still fits the game's overall color palette.
- **kind:** ux-tweak
- **decision_needed:** no
- **area:** assets
- **evidence:** none
- **engine_risk:** no

### V13-17 — Remove vestigial circle next to captain names
- **verbatim:** "Remove the circle next to each captain's name in the Captains box – it's a vestige from an earlier version of the game. make sure it doesn't break anything to remove it."
- **source:** PDF item 4.c
- **restatement:** Delete a leftover circular UI element next to each captain's name in the Captains box, since it's no longer needed — but check that removing it doesn't break anything else.
- **kind:** ux-tweak
- **decision_needed:** no
- **area:** ui
- **evidence:** none
- **engine_risk:** no

### V13-18 — Sequencing: move recipe choice between two specific narration lines
- **verbatim:** "Sequencing: move the recipe choice to happen AFTER the \"Ahoy! Gather every ingredient in yer recipe, then sail home first to win!\" narration, and BEFORE the \"The crew draws lots for sailing order\" narration."
- **source:** PDF item 5
- **restatement:** Right now the order of two early-game screens is wrong. Wyatt wants players to choose their recipe in between: first show the "Ahoy! Gather every ingredient..." message, then let players pick their recipe, then show the "crew draws lots for sailing order" message.
- **kind:** ux-tweak
- **decision_needed:** yes
- **decision_question:** This item's anchor text is "Ahoy! Gather every ingredient in yer recipe, then sail home first to win!" — but PDF item 9.a (V13-35) separately asks to REPLACE that exact same line with new wording ("Ahoy! Sail to the {dock} dock on each island..."). If both are built, does the recipe-choice reordering apply relative to the OLD line or the NEW line? These two items need to be sequenced/reconciled with each other before implementation.
- **area:** ux-tweak
- **evidence:** Cross-referenced against V13-35 (item 9.a), which touches the same narration string.
- **engine_risk:** unclear — moving *when* recipe selection happens relative to game start could shift when/whether recipe-assignment RNG draws occur relative to sailing-order RNG draws, which is exactly the kind of draw-order change the project's determinism annotations (Phase 8) exist to protect against. Needs code-level check by the next agent.

### V13-19 — Solo-mode final-round narration is redundant for the winning player
- **verbatim:** "In solo mode, the \"{player} reached the Isle of Tortuga and fired up the bakery! Last chance, crew — every other captain gets ONE final turn to race home!\" narration is strange/unnecessary when the player themselves is the one who made it back first. they KNOW that it's the final round, so we can change the text to say a piratey version of \"Every other captain has one more turn!\""
- **source:** PDF item 6
- **restatement:** When the human player is the one who wins the race home first, the game currently narrates it as if telling them the news about themselves in third person, which reads oddly. Wyatt wants it reworded to something like a piratey "Every other captain has one more turn!" instead — but he only sketches the idea, not the final line.
- **kind:** narration-copy
- **decision_needed:** yes
- **decision_question:** What exact replacement wording should be used for this end-game narration line? Wyatt gave a rough direction ("a piratey version of 'Every other captain has one more turn!'") but not final copy, and per the project's established pattern (storm-text rewrite, EOV badges), narration copy is normally Wyatt-authored/approved, not auto-generated.
- **area:** narration
- **evidence:** See V13-20 for the screenshot of the current text.
- **engine_risk:** no

### V13-20 — Screenshot of current narration/action-panel text
- **verbatim:** "[Screenshot, no separate caption text]"
- **source:** PDF item 6.a
- **restatement:** This bullet is just an embedded screenshot with no text of its own — included here so no sub-item is skipped.
- **kind:** ux-tweak
- **decision_needed:** no
- **area:** narration
- **evidence:** The screenshot shows the current in-game narration box, exactly as shipped: a yellow message box reading "🏴 Davy Scones reached the Isle of Tortuga and fired up the bakery! Last chance, crew – every other captain gets ONE final turn to race home!" with a button below it reading "⚓ Final round – set sail!" This confirms the exact current strings that V13-19 wants changed.
- **engine_risk:** no

### V13-21 — Tutorial helper text (section header)
- **verbatim:** "Tutorial helper text"
- **source:** PDF item 7
- **restatement:** Heading for a large request to build an in-game hints/tutorial system.
- **kind:** feature
- **decision_needed:** yes
- **decision_question:** This whole section (items 7.a–7.f) describes a first/second/third-time contextual hints system for new players. `.planning/STATE.md`'s Deferred Items table explicitly lists "Interactive tutorial (TUT-01…03)" as deferred to a later milestone. This isn't identical to TUT-01…03 (that's a scripted 30–60s guided walkthrough that auto-drops the player into a game; this is inline, action-triggered hint text with a settings toggle) but it serves the same onboarding goal and is a similarly large feature. **Does this count as bringing deferred tutorial scope back into the milestone, or is it a distinct, smaller "hints" feature that's in-scope on its own?**
- **area:** ui
- **evidence:** STATE.md Deferred Items: "Interactive tutorial (TUT-01…03) | Deferred to a later milestone | v1.2 requirements."
- **engine_risk:** no

### V13-22 — New players should get contextual mechanic explanations on first actions
- **verbatim:** "We want new players to gently learn to play the game, so let's bake text into the narration that appears the first (and second) time a player takes any action, to explain how it works – we want new players to get extra context on the gameplay."
- **source:** PDF item 7.a
- **restatement:** The first and second time a player does any type of action (sailing, fishing, docking, etc.), the game should show extra explanatory text about how that action works.
- **kind:** feature
- **decision_needed:** no
- **area:** ui
- **evidence:** none
- **engine_risk:** no

### V13-23 — Boat movement should ease in/out along an S-curve
- **verbatim:** "UI: boat movement: Boats move animation should be according to an S-curve – it currently looks like they move full speed immediately and ramp down in speed."
- **source:** PDF item 7.b (header) / 7.b.i (detail)
- **restatement:** Change the boat-movement animation so it starts slow, speeds up, then slows down again (an "S-curve" easing), instead of the current look where it starts at full speed and only slows down toward the end.
- **kind:** ux-tweak
- **decision_needed:** no
- **area:** ui
- **evidence:** none
- **engine_risk:** no

### V13-24 — "Eg:" — header introducing three staged example hint texts
- **verbatim:** "Eg:"
- **source:** PDF item 7.c (header)
- **restatement:** This is just a label introducing the three numbered examples that follow (V13-25 through V13-27); it has no independent content of its own.
- **kind:** narration-copy
- **decision_needed:** no
- **area:** narration
- **evidence:** none
- **engine_risk:** no

### V13-25 — Example: first-time action text spells out full mechanics
- **verbatim:** "on each player's first turn, the text doesn't just say \"Click a highlighted square to sail\" it says \"Pay 1 {dubloon image} to sail to any yellow square.\""
- **source:** PDF item 7.c.i
- **restatement:** Example of the hint system: on a player's very first turn, instead of a bare instruction, the game explains the actual cost mechanic in words.
- **kind:** narration-copy
- **decision_needed:** no
- **area:** narration
- **evidence:** This is presented as an illustrative "Eg" of the mechanism requested in 7.a/7.d, not necessarily locked final copy for every action.
- **engine_risk:** no

### V13-26 — Example: second-time action text adds a strategy hint
- **verbatim:** "On that player's second time doing that specific action, the narration gives another mechanics hint as part of the action panel: \"Sailing downwind goes farther than sailing against it!\""
- **source:** PDF item 7.c.ii
- **restatement:** Example: the second time a player does the same action, show a different tip — this time about strategy, not just mechanics.
- **kind:** narration-copy
- **decision_needed:** no
- **area:** narration
- **evidence:** Illustrative example, see V13-24 note.
- **engine_risk:** no

### V13-27 — Example: third-plus time, text becomes short/permanent
- **verbatim:** "On that player's 3rd time doing the action, the narration should be short and sweet, and remain consistent for the rest of the game; eg (sailing): \"Sail to any yellow square (-1)\""
- **source:** PDF item 7.c.iii
- **restatement:** Example: from the third time onward, the hint text shrinks down to a short, permanent version that stays the same for the rest of the game.
- **kind:** narration-copy
- **decision_needed:** no
- **area:** narration
- **evidence:** Illustrative example, see V13-24 note.
- **engine_risk:** no

### V13-28 — Deliverable: write two "game hints" per action, for Wyatt to review
- **verbatim:** "Write two \"game hints\" for each action that a player can take, which will be shown to the player the first and second time they do that action. These should organically explain the game's mechanics to players as they play. Give them to me to review."
- **source:** PDF item 7.d
- **restatement:** For every player action, write two hint messages (shown on the 1st and 2nd time that action happens) that teach the game's mechanics naturally. Wyatt wants to review this content himself before it ships.
- **kind:** narration-copy
- **decision_needed:** yes
- **decision_question:** Wyatt explicitly says "Give them to me to review" — this is a content-drafting task requiring his sign-off, not a decision the implementing agent can resolve on its own. Flagging so this doesn't get auto-shipped without his review pass.
- **area:** narration
- **evidence:** none
- **engine_risk:** no

### V13-29 — Deliverable: write a short 3rd+ time action prompt
- **verbatim:** "Write a 3rd action prompt that is short and to the point, which is used for the 3rd+ time the player does an action, until the end of the game"
- **source:** PDF item 7.e
- **restatement:** Also write one more short, permanent version of each action's text, used from the third time onward.
- **kind:** narration-copy
- **decision_needed:** yes
- **decision_question:** Same review-gate concern as V13-28 — this is copy that Wyatt would reasonably want to review before it ships, per the project's established "copy is Wyatt-authored" pattern (see PROJECT.md Key Decisions).
- **area:** narration
- **evidence:** none
- **engine_risk:** no

### V13-30 — Add a settings menu with a hints on/off toggle
- **verbatim:** "Add a settings menu with a \"hints\" button that can be turned on or off."
- **source:** PDF item 7.f
- **restatement:** Build a settings menu that includes a button letting players turn the new hint system on or off.
- **kind:** feature
- **decision_needed:** no
- **area:** settings
- **evidence:** none
- **engine_risk:** no

### V13-31 — Hints default on for first play in a new browser, then off
- **verbatim:** "By default, the hints should stay on the first time the player plays the game in a new browser; they should turn off after that, until the player turns them on again."
- **source:** PDF item 7.f.i
- **restatement:** New players see hints automatically the very first time they play in a browser; after that first playthrough, hints turn off by default unless the player switches them back on.
- **kind:** feature
- **decision_needed:** no
- **area:** settings
- **evidence:** none
- **engine_risk:** no

### V13-32 — Move turn clock on/off toggle into settings, keep play/pause on the clock
- **verbatim:** "move the turn clock activation/deactivation button into the settings (but keep play/pause button on the turn clock)"
- **source:** PDF item 7.f.ii
- **restatement:** Relocate the existing button that turns the turn-clock feature entirely on or off into the new settings menu, while leaving the separate play/pause button where it is today (on the clock itself).
- **kind:** ux-tweak
- **decision_needed:** yes
- **decision_question:** This implies a turn-clock on/off toggle already exists (matches V13-02/V13-03's "timer disable button") separate from the play/pause control Phase 13/14 just shipped. See the **Conflicts and Tensions** section below — this item, plus V13-60's "turn clock OFF by default" ask, both touch the same toggle and sit in tension with the just-shipped Phase 13 clock-auto-start fix. Needs reconciling with Wyatt before implementation.
- **area:** settings
- **evidence:** Cross-referenced with V13-02/V13-03 (existing but broken disable button) and V13-60 (turn-clock-off-by-default ask).
- **engine_risk:** no

### V13-33 — Make the compass bigger with tighter corner padding
- **verbatim:** "UI: Make the compass bigger, easier to see, and just 5px padding from its top and right edge to the corner of the game board"
- **source:** PDF item 8
- **restatement:** Enlarge the wind compass so it's easier to see, and reduce its spacing from the top-right corner of the game board to just 5 pixels.
- **kind:** ux-tweak
- **decision_needed:** no
- **area:** ui
- **evidence:** none
- **engine_risk:** no

### V13-34 — Narration changes (section header)
- **verbatim:** "Narration changes"
- **source:** PDF item 9
- **restatement:** Heading for a group of specific narration text/copy changes.
- **kind:** narration-copy
- **decision_needed:** no
- **area:** narration
- **evidence:** none
- **engine_risk:** no

### V13-35 — Replace the opening narration line with exact new wording
- **verbatim:** FROM: "Ahoy! Gather every ingredient in yer recipe, then sail home first to win! Each turn, ye sail, then ye plunder. Watch this panel — she'll steer ye straight!" TO: "\"Ahoy! Sail to the {dock image} dock on each island, flip a coin to get the ingredients in your recipe, then come home first!"
- **source:** PDF item 9.a
- **restatement:** Replace the game's opening instructional message with new wording that more clearly explains you need to sail to the dock icon on each island and flip a coin for ingredients.
- **kind:** narration-copy
- **decision_needed:** yes
- **decision_question:** See V13-18 (item 5) — this is the exact same narration string that item 5 uses as a sequencing anchor point ("AFTER the 'Ahoy! Gather every ingredient...' narration"). If this text changes, item 5's instruction needs to be re-anchored to whichever version of the line ships. Confirm build order/reconciliation with Wyatt.
- **area:** narration
- **evidence:** Exact before/after text given by Wyatt, no drafting needed on this one.
- **engine_risk:** no

### V13-36 — Clarify the docking flip outcome (heads=ingredient, tails=3 coins)
- **verbatim:** "When docking — narration should make it clearer that you have to flip to try to get an ingredient – heads, you get it, tails, you get 3 dubloons (and can try again next turn)"
- **source:** PDF item 9.b
- **restatement:** Make the docking narration clearer about the coin-flip rule: heads gets you the ingredient, tails gets you 3 coins instead (and you can try again the following turn).
- **kind:** narration-copy
- **decision_needed:** yes
- **decision_question:** No exact replacement wording is given — just the concept to convey. What exact text should explain this? (Same "Wyatt normally authors/approves final copy" consideration as V13-28/29.)
- **area:** narration
- **evidence:** none
- **engine_risk:** no

### V13-37 — Replace ambiguous movement-cost text with exact new wording
- **verbatim:** "Movement cost unclear: more cost to move farther or not? instead of \"click a highlighted square to sail (–1🪙)\" it should say \"Pay 1🪙 to sail to any yellow square\""
- **source:** PDF item 9.c
- **restatement:** The current sailing button text makes it unclear whether moving farther costs more. Replace it with clearer wording that says the cost is a flat 1 coin to sail to any yellow square.
- **kind:** narration-copy
- **decision_needed:** no
- **area:** narration
- **evidence:** Exact replacement text given.
- **engine_risk:** no

### V13-38 — Turn-clock-timeout dialogue currently only appears in the captain's log
- **verbatim:** "This turn-clock timeout dialogue only appears in the captain's log, not in the narration:"
- **source:** PDF item 9.d (header)
- **restatement:** Heading noting that certain timeout messages are logged but never actually shown to players in the on-screen narration box.
- **kind:** bug
- **decision_needed:** no
- **area:** narration
- **evidence:** none
- **engine_risk:** no

### V13-39 — The two specific missing timeout lines
- **verbatim:** "\"A was too slow — loses 1, everyone else +1\" and \"Snoozing pirates lose their treasure! A loses the turn — 2 tumbles overboard!"
- **source:** PDF item 9.d.i
- **restatement:** These two exact lines currently show up in the captain's log but never in the visible narration box.
- **kind:** bug
- **decision_needed:** no
- **area:** narration
- **evidence:** Both lines appear repeatedly in the captain's log at the bottom of the PDF, e.g. Round 1: "Cat Hook was too slow — loses 1🪙, everyone else +1🪙" and Round 12: "Snoozing pirates lose their treasure! Wyyyyy loses the turn — a crate of [ingredient] tumbles overboard and floats back to its island." (See V13-61.)
- **engine_risk:** no

### V13-40 — Requirement: captain's log and narration box must stay in parity (voice differs only)
- **verbatim:** "But we need the captain's log and narration to be in parity — everything written in the captain's log must be shown in the narration box (the only difference is voice – in the captain's log, 3rd person is always used; in the narration box, it says \"you\" if describing you the player's actions)"
- **source:** PDF item 9.d.ii
- **restatement:** Every line that shows up in the captain's log must also show up in the on-screen narration box — the only allowed difference is that the narration box should say "you" when it's about the local player, instead of the player's name.
- **kind:** bug
- **decision_needed:** no
- **area:** narration
- **evidence:** none
- **engine_risk:** no

### V13-41 — Fishing benefit unclear — show numeric value on the button
- **verbatim:** "Fishing benefit is not clear – when choosing to fish, put (+1-2🪙) on the button. Make clear that fishing either a candycrab or sugarfish is +2 by adding a + before the number"
- **source:** PDF item 9.e
- **restatement:** The fishing button doesn't currently show how much you can earn. Add "(+1-2🪙)" to the button text, and make sure catching a candycrab or sugarfish is clearly shown as "+2" with a plus sign.
- **kind:** narration-copy
- **decision_needed:** no
- **area:** narration
- **evidence:** Exact button text given.
- **engine_risk:** no

### V13-42 — Recipe logic bug (section header)
- **verbatim:** "Recipe logic bug:"
- **source:** PDF item 10
- **restatement:** Heading for a bug about duplicate recipe assignment.
- **kind:** bug
- **decision_needed:** no
- **area:** engine
- **evidence:** none
- **engine_risk:** yes

### V13-43 — Bug: Pound cake was offered to (and chosen by) two players
- **verbatim:** "Pound cake was offered to two players, and chosen by both."
- **source:** PDF item 10.a
- **restatement:** Two different players were both offered the same recipe (Pound Cake) and both picked it — recipes are supposed to be unique per player.
- **kind:** bug
- **decision_needed:** no
- **area:** engine
- **evidence:** none
- **engine_risk:** yes — a duplicate-recipe assignment strongly suggests the recipe-selection logic (likely RNG-driven, per this codebase's convention of routing all randomness through `this.r()`) isn't guaranteeing uniqueness.

### V13-44 — Expected fix: pre-select 8 unique recipes (2 per player) before the game starts
- **verbatim:** "Expected behavior: every player is offered two unique recipes (8 options total per game) which are pre-selected before the game and ensures that no duplicates happen"
- **source:** PDF item 10.b
- **restatement:** The intended design is that before the game even begins, the system should pick 8 different recipes total (2 choices per player, assuming 4 players) so that no recipe can ever be offered to, or chosen by, more than one player.
- **kind:** bug
- **decision_needed:** no
- **area:** engine
- **evidence:** none
- **engine_risk:** **YES — flagged prominently per instructions.** This almost certainly requires changing how/when recipe options are drawn from the RNG in the `Game` constructor or setup routine. Any change to the number, order, or timing of `this.r()` calls during recipe assignment will shift every subsequent RNG draw in the seeded sequence — this is exactly the class of change that invalidates the 31-seed determinism fixture corpus (`scripts/fixtures/determinism/`) per the project's hard constraint. This needs very careful code-level analysis (next agent's job) before any fix is planned, and likely needs a deliberate, gated re-record decision from Wyatt if it does touch the event stream.

### V13-45 — Rename "Parley" to "Trade" (section header)
- **verbatim:** "Rename \"Parley\" to \"Trade\""
- **source:** PDF item 11
- **restatement:** Heading proposing renaming the "Parley" feature/button to "Trade."
- **kind:** ux-tweak
- **decision_needed:** yes
- **decision_question:** See V13-46 — the actual ask is phrased as a question.
- **area:** ui
- **evidence:** none
- **engine_risk:** no

### V13-46 — Players don't understand "Parley" — rename to "Trade"?
- **verbatim:** "I received feedback that players don't know what parley means— change to \"Trade\"?"
- **source:** PDF item 11.a
- **restatement:** Playtesters didn't understand what "Parley" meant. Wyatt is asking whether the button/label should be renamed to "Trade" instead.
- **kind:** question-for-wyatt
- **decision_needed:** yes
- **decision_question:** Should the "Parley" button/label be renamed to "Trade" throughout the game? (Literally phrased as a question by Wyatt — "change to 'Trade'?")
- **area:** ui
- **evidence:** Per this codebase's own documented naming conventions (CLAUDE.md), internal function/event names already use "trade" terminology (`tryTrade()`, `tradeCandidate()`, `tradeOpp()`, event `{t: "trade", ...}`) — only the user-facing label currently says "Parley." A rename would likely be UI-label-only, not a data-model change.
- **engine_risk:** no

### V13-47 — Grey out the (renamed) trade button when no one has resources
- **verbatim:** "The parley button (now \"trade\") should be greyed-out if there's no one to trade with in the early game, with italicized text under it explaining that no one has resources. Players shouldn't have to click it to have that narration appear."
- **source:** PDF item 11.b
- **restatement:** Early in the game, when no other player has anything worth trading, the trade button should appear greyed out with small italic explanatory text underneath — rather than requiring the player to click it just to find out there's nothing to trade for.
- **kind:** ux-tweak
- **decision_needed:** yes
- **decision_question:** This item's naming ("the parley button (now 'trade')") assumes V13-46's rename question is already answered yes. It also needs exact italic explanatory copy drafted, which isn't given verbatim. Both points need resolving with Wyatt.
- **area:** ui
- **evidence:** none
- **engine_risk:** no

### V13-48 — Trade winds are not intuitive to new players (section header)
- **verbatim:** "The trade winds mechanics are not intuitive to new players"
- **source:** PDF item 12
- **restatement:** Heading introducing a discoverability problem with the trade-wind mechanic.
- **kind:** ux-tweak
- **decision_needed:** no
- **area:** ui
- **evidence:** none
- **engine_risk:** no

### V13-49 — Players don't know how to enter the trade winds
- **verbatim:** "They don't know how to enter them"
- **source:** PDF item 12.a
- **restatement:** New players don't understand how their ship gets pulled into the trade winds.
- **kind:** ux-tweak
- **decision_needed:** no
- **area:** ui
- **evidence:** Captain's log shows the trade winds firing without an obvious trigger from the player's perspective, e.g. Round 6: "Captain Cannoli is carried into the trade winds and whipped around the rim!" and Round 7: "Wyyyyy is carried into the trade winds and whipped around the rim!" (see V13-61).
- **engine_risk:** no

### V13-50 — Players don't know where the trade winds will take them
- **verbatim:** "They don't know where the winds will take them"
- **source:** PDF item 12.b
- **restatement:** Once caught in the trade winds, players can't predict where they'll end up.
- **kind:** ux-tweak
- **decision_needed:** no
- **area:** ui
- **evidence:** none
- **engine_risk:** no

### V13-51 — Research: how to visually signal whirlpools as "stop/drop-off" points
- **verbatim:** "We need to make whirlpools more clearly seem like the \"stopping\" or \"drop off\" points. Research what common semiotics/game symbols might be to convey that."
- **source:** PDF item 12.c
- **restatement:** Whirlpools are supposed to read visually as the spot where the trade-wind ride ends, but they don't communicate that clearly. Wyatt wants research into common visual symbols/conventions from other games that could convey "this is where you get off."
- **kind:** question-for-wyatt
- **decision_needed:** yes
- **decision_question:** This explicitly asks for research/options, not a specific design change — "Research what common semiotics/game symbols might be to convey that." Needs Wyatt's input/approval before any specific visual redesign is committed to.
- **area:** ui
- **evidence:** none
- **engine_risk:** no

### V13-52 — Research: how to make trade winds visually read as "windy" with direction
- **verbatim:** "We need to make the trade winds seem more \"windy\" as well as showing their direction. Research ways to convey this too."
- **source:** PDF item 12.d
- **restatement:** The trade winds should look and feel more like wind (versus just a special colored path) and should show which way they're flowing. Wyatt wants research into how to convey this visually.
- **kind:** question-for-wyatt
- **decision_needed:** yes
- **decision_question:** Same as V13-51 — an explicit research ask rather than a specific requested change.
- **area:** ui
- **evidence:** none
- **engine_risk:** no

### V13-53 — Bugs: multiplayer playtest (section header)
- **verbatim:** "Bugs: multiplayer playtest"
- **source:** PDF item 13
- **restatement:** Heading for a set of bugs found during a real multiplayer game between two named players.
- **kind:** bug
- **decision_needed:** no
- **area:** multiplayer
- **evidence:** This section is about a playtest between "Arrrrkay" and "Susharrrrrgh" — a **different session** from the captain's-log dump at the bottom of the PDF (which is a pass-and-play game between Cat Hook/Flaky Jack/Captain Cannoli/Wyyyyy). **The mined captain's log is NOT direct evidence for this section's bugs** — do not misapply it here. See V13-54.
- **engine_risk:** no

### V13-54 — Intro: the Arrrrkay/Susharrrrrgh playtest had many bugs
- **verbatim:** "The playtest on multiplayer involving Arrrrkay and Susharrrrrgh had many, many bugs in it. Here are their feedback notes:"
- **source:** PDF item 13.a
- **restatement:** Context sentence introducing the feedback notes below (V13-55 through V13-60) from a specific multiplayer playtest.
- **kind:** bug
- **decision_needed:** no
- **area:** multiplayer
- **evidence:** none beyond framing
- **engine_risk:** no

### V13-55 — Question: was turn order changed / why miss a turn every 4th time?
- **verbatim:** "Was the order of turns changed? Why miss a turn every 4th time?"
- **source:** PDF item 13.b
- **restatement:** Wyatt is asking (relaying player feedback) whether something changed the turn order, because players noticed someone's turn gets skipped roughly every 4 turns.
- **kind:** question-for-wyatt
- **decision_needed:** yes
- **decision_question:** Literally phrased as a question, and it's an investigation, not a specified fix. Is there an actual periodic turn-skip bug in multiplayer, or was this player perception/misreading of the UI?
- **area:** multiplayer
- **evidence:** No log evidence available for this specific playtest (the captain's log at the bottom is a different, pass-and-play session — see V13-53). This needs to be investigated against actual multiplayer game logs/code, not this PDF's captain's log.
- **engine_risk:** yes — turn order/turn-skipping is core engine turn-sequencing behavior; if a real bug (not just a UI misunderstanding), fixing it would very plausibly touch `src/engine/index.js`'s turn-taking logic and could affect the event stream.

### V13-56 — Fix: ensure no old turn-skipping mechanic/narration remains
- **verbatim:** "Make sure that the multiplayer codebase does not have the old turn-skipping mechanic in it, or the narration about passing the wheel – if this is still there, we need to remove it. It was an old vestige from an earlier gameplay mechanic prototype, but we removed it many merges ago (before i started using gsd-core)."
- **source:** PDF item 13.b.i
- **restatement:** Wyatt believes he already removed an old "turn skipping" / "passing the wheel" mechanic a while back (before the current planning system was in use), but wants it double-checked that no trace of it is still present in the multiplayer code.
- **kind:** bug
- **decision_needed:** no
- **area:** multiplayer
- **evidence:** Wyatt's own note that this predates "gsd-core" adoption — i.e. it's old enough that it may not be documented in current `.planning/` artifacts at all, so a code grep (not a planning-doc search) is the right way to verify.
- **engine_risk:** yes — if any vestige is found and removed, that's a direct engine-logic change.

### V13-57 — Parlays should allow 2-way ingredient trading, not just cash
- **verbatim:** "parlays should allow 2-way product trading (not just cash)"
- **source:** PDF item 13.c
- **restatement:** Wyatt expects that trading between players ("parlays") should let players swap actual ingredients with each other, not just pay/receive coins.
- **kind:** question-for-wyatt
- **decision_needed:** yes
- **decision_question:** See V13-58 — Wyatt himself says he isn't sure whether this already works and players just didn't understand the UI, or whether it's an actual bug/missing feature in multiplayer.
- **area:** multiplayer
- **evidence:** The pass-and-play captain's log (different session, but same underlying engine/trade logic) clearly shows ingredient-for-ingredient trades succeeding, e.g. Round 12: "Cat Hook trades Fresh Milk to Wyyyyy for Crystal Sugar, they each get +1🪙 for cooperating like good friendly pirates" and "Flaky Jack trades 5🪙 to Wyyyyy for Crystal Sugar — they each get +1🪙 for cooperating like good friendly pirates." This suggests the underlying trade mechanic *does* support ingredient swaps somewhere in the engine/flow — so if the Arrrrkay/Susharrrrrgh multiplayer session couldn't do it, the gap may be UI-specific to multiplayer, not a missing engine capability. This is circumstantial, not proof — flagging for the next investigating agent.
- **engine_risk:** unclear — depends entirely on where the investigation lands (UI-only bug vs. an actual multiplayer-specific engine/flow gap).

### V13-58 — Investigate: UI confusion vs. actual bug blocking ingredient trades
- **verbatim:** "I'm not sure if this was actually allowed and the players didn't understand the ui, in which case we need to make the whole trade flow much clearer, or whether a bug prevented them from trading ingredients with each other. investigate."
- **source:** PDF item 13.c.i
- **restatement:** Wyatt explicitly wants someone to figure out whether the players simply didn't understand how to use the trade UI, or whether there's an actual bug stopping ingredient-for-ingredient trades in multiplayer.
- **kind:** bug
- **decision_needed:** no
- **area:** multiplayer
- **evidence:** Same as V13-57.
- **engine_risk:** unclear

### V13-59 — Ingredients mysteriously disappeared ("dad's milk," "Susha's chocolate")
- **verbatim:** "dad's milk just disappeared. Susha's chocolate just disappeared — rotted? hmmm - some frustration…"
- **source:** PDF item 13.d
- **restatement:** During the playtest, two players' ingredients vanished from their inventory with no clear explanation, and it visibly frustrated them.
- **kind:** bug
- **decision_needed:** no
- **area:** multiplayer
- **evidence:** none specific to this session (again, the mined captain's log is a different, pass-and-play session — see V13-53's caveat). However, V13-61's pass-and-play log audit (item 14) documents very similar-sounding "ingredient disappears" symptoms in a different game, which may share a root cause worth checking.
- **engine_risk:** yes

### V13-60 — Investigate ingredient-disappearance cause; possibly turn clock OFF by default + explanatory modal
- **verbatim:** "Figure out what's causing ingredients to \"disappear\" – were they playing too slow? we may want the turn clock to be OFF by default, to allow first timers to understand how to play the game without stressing out – and then to give a modal pop-up explaining how the turn clock works when players elect to turn it on (eg. you have 20 seconds to make decisions; if you don't decide in that time, you lose 1 dubloon and everyone else gets 1. Then you have 10 more seconds to act, and if you don't, your turn gets skipped and you lose and ingredient or money) – and those ingredients must float back to their islands to be re-purchasable. ensure that is functioning correctly."
- **source:** PDF item 13.d.i
- **restatement:** Wyatt suspects the disappearing ingredients are a side-effect of players running out of time on the turn clock and losing items as a timeout penalty. He tentatively floats a bigger idea: turn the clock OFF by default so new players aren't stressed, and only show the timeout-rules explanation in a pop-up if/when a player actively chooses to turn the clock on. He also wants confirmation that ingredients lost to a timeout correctly float back to their island to be bought again (rather than vanishing for good).
- **kind:** question-for-wyatt
- **decision_needed:** yes
- **decision_question:** **This is the single most important tension in the whole document — see "Conflicts and Tensions" below.** Wyatt tentatively proposes the turn clock be OFF by default. Phase 13 (just shipped, human-verified) was a dedicated milestone phase specifically fixing the multiplayer turn clock so it starts running **on its own** ("no timer off/on toggle workaround is needed" — CLOCK-01, marked critical). Phase 14 then added a play/pause control on top of that running clock. Making the clock OFF by default would reverse the behavior Phase 13 was built to guarantee. This must go back to Wyatt explicitly before any implementation — do not resolve it either way.
- **area:** multiplayer
- **evidence:** REQUIREMENTS.md CLOCK-01: "the turn clock starts running normally so the first turn begins — the game no longer stalls 'paused' before it starts, and no timer off/on toggle workaround is needed (critical)." ROADMAP.md Phase 13 criterion 1: "the turn clock starts running on its own and the first turn begins... no timer off/on toggle workaround is needed." Also connects to V13-02/03 (existing-but-broken pass-and-play disable button) and V13-32 (moving the clock's on/off toggle into settings).
- **engine_risk:** yes — the "ensure [ingredient restock] is functioning correctly" clause implies a possible fix to the actual timeout/restock logic, which is core engine behavior (item tumbling overboard and floating back to its island for re-purchase).

### V13-61 — Audit the pass-and-play captain's log for the "ingredients disappearing" bug
- **verbatim:** "Look at the logs for the pass-and-play playtest involving Cat Hook, Captain Canolli and Wyyyy. There were many bugs in this playtest that were not desired code behaviors – sometimes ingredients got lost, sometimes the timer behaved strangely. At some point a milk entirely disappeared from circulation—that shouldn't happen. We took all 3 off the island, but somehow one disappeared without being restocked on the island. This may have been caused by, or related to, a time-out bug in Round 12 during 3-player pass-and-play mode, when wyyyyy did not play in time? Audit the entire log and report back what you notice."
- **source:** PDF item 14
- **restatement:** Wyatt wants a full review of the captain's log from a specific pass-and-play game, because ingredients and the timer behaved strangely — most notably, all three units of one milk ingredient were taken by players, but only some got restocked back on the island, so the total supply shrank. He suspects this might connect to a Round 12 turn-timeout event.
- **kind:** bug
- **decision_needed:** no
- **area:** pass-and-play
- **evidence:** **Full log audit follows — this is the actual captain's log the PDF dumps at the bottom, and it is the direct evidence base for this item (and, per item 1's own cross-reference, also for V13-01–08).**
  - **Player-count discrepancy in the source text itself:** item 14's own wording names only three players ("Cat Hook, Captain Canolli and Wyyy") and calls it "3-player pass-and-play mode," but the actual captain's log shows **four** distinct players throughout (Cat Hook, Flaky Jack, Captain Cannoli, Wyyyyy — each consistently color-coded). "Flaky Jack" is never mentioned in item 14's prose at all. This is a genuine ambiguity in the source document — flagging rather than smoothing over it, per instructions.
  - **Round 1:** "🕐 Cat Hook was too slow — loses 1🪙, everyone else +1🪙" — a timeout penalty fires on turn 1.
  - **Round 3 (storm begins):** "A gale blows Cat Hook off the dock!" appears twice in immediate succession for the same player in the same round — possibly a duplicate-event logging issue, or two genuinely distinct gale pushes; worth the next debugging agent's attention. Also: "Captain Cannoli offered 2🪙 for Wyyyyy's 🌟 Vanilla Beans — refused" (a trade offer/refusal event, unrelated to the bug but confirms trade-offer logging works).
  - **Round 4:** "Captain Cannoli flips 🇽 TAILS — runs aground! Loses half their coins" — this "runs aground, loses half of coins" penalty is a *distinct* consequence from the normal tails-outcome (get 3 coins) described in V13-36/9.b — it appears to be a storm-specific compounding penalty, worth the next agent confirming is intentional design vs. an unintended double-penalty bug.
  - **Round 6 / Round 7:** "Captain Cannoli is carried into the trade winds and whipped around the rim!" / "Wyyyyy is carried into the trade winds and whipped around the rim!" — trade-wind mechanic firing (relevant background for V13-49/50).
  - **Round 9:** "🕐 Cat Hook was too slow — loses 1🪙, everyone else +1🪙" — second timeout for the same player.
  - **Round 12 (highlighted yellow in the source PDF — visually distinct from the rest of the log, suggesting this is the specific section Wyatt flagged as suspicious):**
    - "Cat Hook was too slow — loses 1, everyone else +1"
    - "Wyyyyy was too slow — loses 1, everyone else +1" (appears twice in this round)
    - "Snoozing pirates lose their treasure! Wyyyyy loses the turn — a crate of Vanilla Beans tumbles overboard and floats back to its island."
    - "Cat Hook trades Fresh Milk to Wyyyyy for Crystal Sugar, they each get +1 for cooperating like good friendly pirates" — appears right after a "Cat Hook trades..." cooperation event; notably there is no earlier "Cat Hook offered..." line for this specific trade (unlike the Flaky Jack trade below, which has both an "offered...deal struck" line AND a separate "trades...cooperating" line) — **this inconsistent event pairing (sometimes one line, sometimes two for what should be the same kind of trade) is itself a candidate root cause worth the next agent checking against the code's event-emission logic.**
    - "Flaky Jack was too slow — loses 1, everyone else +1"
    - "Snoozing pirates lose their turn! Wyyyyy loses the turn — a crate of Crystal Sugar tumbles overboard and floats back to its island." (second overboard/timeout event for Wyyyyy in the same round)
    - "Flaky Jack offered 5 for Wyyyyy's Crystal Sugar — deal struck!" immediately followed by "Flaky Jack trades 5 to Wyyyyy for Crystal Sugar — they each get +1 for cooperating like good friendly pirates" — **two log lines for what appears to be one single trade action.** This double-logging pattern, combined with the timeout-driven "tumbles overboard and floats back to island" events happening twice to the same player in the same round, is the most likely candidate explanation for Wyatt's "one disappeared without being restocked" observation — if a restock-on-timeout code path fires but an accompanying duplicate-trade-log doesn't correspond to a real duplicated inventory change (or vice versa), a mismatch between logged events and actual state changes would produce exactly this symptom. **This is circumstantial pattern-matching from the log text, not a verified root cause — the next debugging agent needs to check this against the actual code (likely `src/engine/index.js` trade/timeout/restock handling).**
  - **Round 18:** "Wyyyyy returns to the Isle of Tortuga with a full recipe!" — the winning condition triggers.
  - **Round 19 (after the winner already returned home):** further battles and fishing continue for the other three players — this matches the "every other captain gets ONE final turn" mechanic referenced in V13-19/20 (item 6), confirming that mechanic exists and fires correctly at least in this pass-and-play log.
- **engine_risk:** yes — any fix arising from this audit (trade-event double-logging, timeout/restock mismatch) would very plausibly touch the engine's trade or timeout-handling code and its event emissions.

### V13-62 — Build narration.html review tool
- **verbatim:** "Create narration.html, a website based on art-review.html that shows every line of narration and lets me give you feedback on it, or direct changes in a textbox below it – and has a \"copy\" button to copy all my feedback to clipboard and paste it to you in one go."
- **source:** PDF item 15
- **restatement:** Build a new webpage (modeled on the existing `art-review.html` page) that lists every narration line in the game, with a text box under each line where Wyatt can type feedback, plus a "copy" button that gathers all his feedback into one block he can paste back to the AI assistant.
- **kind:** feature
- **decision_needed:** no
- **area:** narration
- **evidence:** References an existing `art-review.html` file as the pattern to follow — the next agent should locate and examine that file as a starting template.
- **engine_risk:** no

### V13-63 — Write a library of pastry-themed wind-flavor descriptor lines
- **verbatim:** "make descriptions for the flavor of the wind each turn – a long list of pre-written ingredient-based descriptors that add to the pastry feel of the game eg. \"cinnamon-sugar breeze blowing north\" or \"scents of fresh-baked bread on the southerly\" to evoke hunger in all the players."
- **source:** PDF item 16
- **restatement:** Write a big list of pre-written, pastry/ingredient-themed flavor-text lines describing the wind each turn (e.g. "cinnamon-sugar breeze blowing north"), to make the game feel more immersive.
- **kind:** narration-copy
- **decision_needed:** yes
- **decision_question:** This is a large volume of new narration content Wyatt hasn't drafted himself — per the project's established pattern (storm-text rewrite required his sign-off; game hints in V13-28/29 explicitly ask for his review), does he want to review/approve this list before it ships? Also worth clarifying with him: how is a specific line chosen each turn (random pick vs. deterministic pick) — see engine_risk note.
- **area:** narration
- **evidence:** none
- **engine_risk:** **yes, flagged prominently.** If a wind-flavor line is chosen randomly each turn using the game's seeded RNG (this codebase routes all randomness through `this.r()` per its own conventions), that consumes an RNG draw and shifts every subsequent draw in the seeded sequence — the same determinism-breaking risk class as V13-44 (recipe pre-selection). If instead the line is derived deterministically from existing state (e.g. a lookup keyed by the wind direction that's already part of engine state, with no new RNG draw), it would likely be event-stream-safe. This distinction matters a great deal and needs the next agent's code-level judgment before planning.

---

## Cross-Reference

### Against `.planning/REQUIREMENTS.md` (current v1.2 milestone)

No PDF item in this document is already a literal tracked requirement ID in REQUIREMENTS.md — the v1.2 requirements (CLOCK, STORM, AI, NARR, UI, META, KOFI, VERIFY) came from a **different** punch list (`edits for pastry pirates-2.pdf`), not this one. However, several PDF items fall in the *same category* as unbuilt Phase 15/16/17 work:

| PDF item(s) | Category | Verdict |
|---|---|---|
| V13-04/05 (battle-caller naming), V13-06/07 (bot trade-partner naming), V13-19/20 (solo end-narration), V13-34–41 (narration changes 9.a–e), V13-63 (wind flavor lines) | Narration | **Same broad category as Phase 15 (NARR-01…06), but NONE of these specific asks are among the tracked NARR-01…06 items.** Phase 15's NARR-01 is "a full audit of every narration branch... delivered to Wyatt" — that audit process *might* independently surface some of these, but as of today they are not in tracked scope. Treat as genuinely new work for the next milestone, while noting the audit (once run) may find overlap. |
| V13-09/10 (recentering bug), V13-11–13 (wind particles), V13-14–17 (ship colors/captains-box circle), V13-33 (compass size/padding) | UI/UX | **Same broad category as Phase 16 (UI-01…07), but none of Phase 16's specific tracked items (padding normalization, icon fade timing, moveable-square size/hover, welcome-flow shortcut, lobby name-doubling, EOV box, Open Graph/favicon, Ko-Fi) match any of these PDF asks.** Genuinely new work for the next milestone, adjacent in spirit to Phase 16's polish pass but not covered by it. |
| V13-53–60 (multiplayer playtest bugs) | Multiplayer | Phase 17's VERIFY-01 is a **verification gate** re-confirming the Phase 13 clock fix and an end-to-end playthrough — it is not a bug-fixing phase and does not cover turn-order bugs, ingredient-trade UI clarity, or the ingredient-disappearance bug. These are genuinely new bug reports. Worth noting: if Phase 17's own two-window playtest runs before these are triaged, it may re-discover some of them independently. |
| V13-21–32 (tutorial/hints, item 7) | Onboarding | See STATE.md cross-reference below — this is the most important scope question in the batch. |

**Conclusion:** none of this PDF's 63 items are already-tracked v1.2 requirements. Most fall into categories (narration, UI/UX, multiplayer) that Phase 15/16/17 will touch, but the *specific* asks are additive, not duplicative.

### Against `.planning/ROADMAP.md` (Phases 15/16/17 status)

Phases 15 (Narration Audit & Fixes), 16 (UI/UX Polish + Open Graph + Ko-Fi), and 17 (Final Multiplayer Verification) are **all still unbuilt** (0/TBD plans, "Not started" per ROADMAP.md's Progress table). This means:
- Any narration/UI/multiplayer work from this PDF that gets approved for the next milestone could, in principle, be sequenced either **alongside** Phases 15–17 (if v1.2 is still open) or **after** them as part of a new v1.3 milestone (matching this document's `v1.3-intake` folder name) — that sequencing decision is out of scope for this document and belongs to whoever plans next.
- Phase 15's NARR-01 audit deliverable, once produced, is the natural place to reconcile with V13-34–41's and V13-63's narration asks — flagging so the next planning agent checks for duplication before scheduling both.

### Against `.planning/STATE.md` → Deferred Items

STATE.md's Deferred Items table lists: tutorial (TUT-01…03), sound effects (AUDIO-01…03), island redesign (ISLAND-01…04), NETMOD-01, DX-01, DX-02, and STORM-02 (multiplayer guest storm-push animation parity).

**PDF item 7 (V13-21–32, "Tutorial helper text") is a hints/onboarding system, and the interactive tutorial (TUT-01…03) was explicitly deferred to a later milestone.** These are not identical asks — TUT-01…03 describes a scripted 30–60s guided walkthrough that auto-starts a solo game afterward; PDF item 7 describes contextual, action-triggered hint text with a settings toggle, shown organically during real play. But both serve the same underlying goal (helping brand-new players learn the game) and both are substantial features. **Flagging as an explicit scope question per the task instructions: does approving PDF item 7 constitute reviving the deferred tutorial scope, or is it legitimately separate, smaller work?** This is not something this document resolves.

No other PDF item overlaps with AUDIO, ISLAND, NETMOD-01, DX-01/02, or STORM-02 — though note V13-11–13 (ambient wind particles, reusing storm-rain rendering code) is topically adjacent to STORM-02 (multiplayer guest storm animation) in that both touch the storm/weather rendering system, without being the same request.

### Against `.planning/todos/pending/`

The only pending todo, `eov-narration-box-not-cleared.md` (tagged `resolves_phase: 16`, about the empty narration box not collapsing at end-of-voyage), does not overlap with any PDF item in this document.

### Against `.planning/PROJECT.md` → Key Decisions

One recorded Key Decision is directly relevant to how several items above (V13-19, V13-28, V13-29, V13-36, V13-63) should be handled: **"Storm-text audit produces a list back to Wyatt for rewrite | Copy is authored by Wyatt, not auto-generated | ✓ Good — audit delivered, rewrite applied v1.0."** This establishes precedent that new narration copy in this project goes through Wyatt for authorship/approval, not straight to implementation — which is why several narration-copy items above are flagged `decision_needed: yes` even where the PDF doesn't literally ask a question.

No PDF item was found to directly *reverse* a recorded Key Decision, with the singular, prominent exception discussed below.

---

## Conflicts and Tensions

### 1. Turn clock default state: PDF wants it OFF by default; Phase 13/14 shipped it running by default (THE key tension)

- **PDF side (V13-60, item 13.d.i):** "...we may want the turn clock to be OFF by default, to allow first timers to understand how to play the game without stressing out – and then to give a modal pop-up explaining how the turn clock works when players elect to turn it on..."
- **Shipped side (REQUIREMENTS.md, CLOCK-01, marked critical, complete):** "In a multiplayer game (2+ windows), the turn clock starts running normally so the first turn begins — the game no longer stalls 'paused' before it starts, and no timer off/on toggle workaround is needed *(critical)*." ROADMAP.md Phase 13 criterion 1 (human-verified, completed 2026-07-26): "the turn clock starts running on its own and the first turn begins... no timer off/on toggle workaround is needed."
- **Also shipped (Phase 14):** a play/pause control was added on top of the running clock (CLOCK-02/03), implying the clock is expected to be actively running by default, with pause as a manual override — not off by default.

Laid out factually, not resolved: Phase 13 was built specifically to *stop* the game from ever appearing paused/stalled by default — its whole point was making the clock start on its own. The PDF's tentative "clock OFF by default" idea would mean the clock does NOT start running by default, which is the literal opposite of what Phase 13 shipped and Wyatt human-verified. This is compounded by three other related-but-scattered PDF asks that all touch the same toggle mechanism without acknowledging each other or the shipped state:
- V13-02/03 (item 1.a): a pass-and-play "timer disable" button already exists today but is broken.
- V13-32 (item 7.f.ii): asks to relocate that toggle into a new settings menu, keeping play/pause separate.
- V13-60 (item 13.d.i): asks for the toggle's *default state* to flip to off, plus a new explanatory modal.

None of these four items reference each other or acknowledge Phase 13's fix. Whoever plans the next milestone needs Wyatt to explicitly reconcile: does "OFF by default" mean multiplayer specifically, solo/pass-and-play specifically, or both? And does it survive Phase 13's critical-fix framing, or supersede it?

### 2. Narration-sequencing anchor text changes out from under item 5's instructions

- **PDF side A (V13-18, item 5):** "move the recipe choice to happen AFTER the 'Ahoy! Gather every ingredient in yer recipe, then sail home first to win!' narration, and BEFORE the 'The crew draws lots for sailing order' narration."
- **PDF side B (V13-35, item 9.a):** asks to replace that exact same "Ahoy! Gather every ingredient..." line with entirely different wording ("Ahoy! Sail to the {dock} dock on each island...").

If both ship, item 5's instruction is anchored to text that item 9.a deletes. This isn't a disagreement about what should happen, just an ordering/reference dependency the PDF doesn't address — flagging so the next planning agent sequences these two consistently (e.g., decide whether the "AFTER X, BEFORE Y" placement rule is meant to survive the text rewrite, which seems obviously intended, and write the plan against the new copy rather than the old).

### 3. No other direct item-vs-item contradictions found

Beyond the two above, no other pair of PDF items was found to directly contradict each other. The Parley→Trade rename (V13-45–47) is asked as a question rather than conflicting with anything, and the multiplayer bug reports (V13-53–61) are investigative asks rather than firm requirements that could clash with something else in the list.

---

## Coverage Statement

- **Pages read:** all 10 pages of `notes/edits for pastry pirates.pdf` (confirmed via the Read tool that the document has exactly 10 pages — attempting to read page 11 returned "Requested page 11 is outside the document (PDF has 10 pages)").
- **Highest top-level item number found:** 16 ("make descriptions for the flavor of the wind each turn...").
- **Captain's log:** reached and mined. The log begins on page 4 immediately after item 16, under the heading "Note for you, in case helpful: Captain's log from the Cat Hook, Captain Cannoli, Wyyyyy game:" and runs through page 10, ending mid-Round 19 (the last visible line is "Cat Hook called it and backed it with 2 — Spotter's Bounty +5"). The log appears to end there naturally (page 10 is the last page of the PDF) rather than being cut off mid-sentence, but there is no explicit "end of log" marker, so it's possible additional rounds existed and were not included in this document — flagging that uncertainty rather than assuming completeness.
- **What I could not fully verify:** a few log lines in Round 3 show what may be a duplicate event ("A gale blows Cat Hook off the dock!" logged twice in immediate succession) — I've flagged this as a possible double-logging artifact in V13-61's evidence rather than asserting it's definitely a bug, since I can't rule out two genuinely separate gale pushes happening to the same player in one round from the text alone. Similarly, the Round 12 double-line trade pattern is presented as circumstantial pattern-matching, not a confirmed root cause — that confirmation requires reading the actual engine code, which is out of scope for this inventory pass.
- **Screenshots:** two embedded screenshots were found and described where they carried information — the item-6/V13-20 narration-box screenshot (described in full) and no other image content beyond that was found to carry additional textual information not already captured in the surrounding prose.
- **Nothing was skipped.** All 16 top-level items and every lettered/roman sub-item are represented as their own entry (V13-01 through V13-63), including sub-items that are pure headers or a screenshot with no independent text.
