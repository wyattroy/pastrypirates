# v1.3 Intake — Decisions Needed

Read this in one sitting. Everything below is a question for you — nothing here has been decided or built.

---

## The gating question — do first, before anything else

**v1.2 has three unbuilt phases left**: Phase 15 (Narration Audit & Fixes), Phase 16 (UI/UX Polish + Open Graph + Ko-Fi), Phase 17 (Final Multiplayer Verification). This new 63-item punch list is a *different* document (`notes/edits for pastry pirates.pdf`, reused/overwritten since v1.0) from the one that produced v1.2's requirements. Step 2 checked and only **one** of the 63 new items (a narration 2nd-person fix) overlaps anything Phase 15/16 already plans to do.

**Option A — Finish v1.2 first, start v1.3 after.**
Phases 15–17 are already scoped and requirement-mapped; Phase 15's narration audit is already supposed to go to you for review, and Phase 17 is the playtest that actually confirms the multiplayer clock fix (Phase 13, shipped) holds up end-to-end. Finishing them closes out a milestone cleanly with a known, small remaining size (narration audit + fixes, UI polish + Ko-Fi + social preview, one verification pass). Cost: the new list's two urgent bugs (broken pass-and-play timer button, multiplayer playtest bugs) wait until 15–17 are done — but those phases are small, likely days not weeks.

**Option B — Fold overlapping new items into 15/16, re-cut those phases now.**
Only 1 of 63 items actually overlaps. Re-cutting means reopening phases that are already planned (Phase 15 in particular is about to ask for your narration-audit review) to inject new, unrelated narration/UI asks into the same review pass. Risk: muddies one review with two different projects' worth of copy decisions, delays 15/16 further while they're re-scoped, and gives you a bigger, harder-to-review batch instead of two clean ones.

**Option C — Park v1.2, go straight at the new list.**
The new list's blocking bugs (pass-and-play timer, multiplayer playtest problems) match your Core Value most directly — "playable and fair end-to-end." But this leaves Phase 17's own verification (confirming the critical Phase-13 clock fix actually holds under a real Safari+Chrome two-window game) undone indefinitely, and Phase 15/16's already-committed narration audit and UI polish sit unfinished with no plan to return to them.

**My recommendation: Option A**, with one adjustment — sequence the new list so its worst bugs (pass-and-play timer, multiplayer playtest bugs) become the very first phase of v1.3, run immediately after Phase 17 closes. That gets 15–17 finished cleanly (they're small and one of them is your own outstanding review), while the new list's urgent bugs still land fast right after, not weeks later. The draft roadmap in this folder is built assuming this — see its Assumptions section.

---

## D-01 — Should the multiplayer/pass-and-play turn clock be OFF by default?

**Items:** V13-32, V13-60(b)
**Why you have to decide this:** the new PDF tentatively asks for the clock to be OFF by default with an explanatory pop-up; Phase 13 — shipped, and you personally verified it — was built specifically so the clock starts running **on its own**, with no off/on toggle needed. These are opposite defaults. Nobody should touch this code until you say which one you actually want.

**Options:**
- **A — Keep it ON by default (Phase 13's shipped behavior).** The clock starts running the moment the game does, exactly as you verified. New players who don't understand the timer see it running with no explanation unless the settings-menu hints system (see D-02) also ships.
- **B — Turn it OFF by default, add a one-time modal explaining the rules when a player turns it on.** Matches the PDF's tentative idea and would likely feel calmer for brand-new players. Cost: reverses the specific behavior Phase 13 was built and verified to guarantee, and multiplayer games would then start with no timer pressure unless someone opts in — worth checking that doesn't reintroduce any version of the "game feels stalled" problem Phase 13 fixed.
- **C — OFF by default, but only for solo/pass-and-play; stays ON for real multiplayer.** Splits the difference — new players get the calmer pass-and-play experience the PDF describes, while the already-verified multiplayer behavior is untouched. Needs its own explanatory modal like B, scoped to fewer code paths.

**My recommendation:** genuinely your call — this is a product feel decision, not a technical one. If forced to guess at intent: the PDF's own reasoning ("allow first timers to understand how to play... without stressing out") reads more like a solo/pass-and-play concern than a competitive-multiplayer one, which would point to **C**. But I'm not confident enough in that read to call it for you.

---

## D-02 — Does the new "hints" system count as reviving the tutorial you deferred?

**Items:** V13-21, V13-22, V13-24–27, V13-30, V13-31
**Why you have to decide this:** `.planning/STATE.md` explicitly lists "Interactive tutorial (TUT-01…03)" as deferred to a later milestone. This new ask (inline hint text that appears the first/second/third time a player takes an action, with a settings toggle) is NOT the same feature as TUT-01…03 (a scripted 30–60s guided walkthrough that auto-starts a solo game) — but it's the same size class of work (a whole new settings menu doesn't exist yet at all) chasing the same goal: helping brand-new players learn the game.

**Options:**
- **A — Yes, build it now, as new v1.3 scope.** Ships real onboarding help this milestone. Cost: this is the single largest item in the whole 63-item list — no settings menu exists today, so it's new UI infrastructure from zero, plus you'd need to write two hint lines per action (sail, dock, trade, attack, fish, at minimum) and a short permanent version of each, which is real writing time on top of the code.
- **B — No, this counts as the same deferred bucket — leave it deferred alongside TUT-01…03.** Keeps v1.3 smaller and focused on bugs/polish. The scripted-walkthrough tutorial and this inline-hints idea would then both wait for a dedicated onboarding milestone where they can be designed together instead of piecemeal.
- **C — Build only the plumbing now (settings menu shell), defer the actual hint content and copy.** Gets the settings menu built (which D-01's clock-toggle relocation and the hints toggle both need anyway) without committing to writing all the hint copy this milestone.

**My recommendation: no strong pull either way — genuinely your call**, but flagging the practical tradeoff plainly: this is real feature work, not a bug fix, and picking A roughly doubles the copy-writing you'd personally need to do for this milestone (on top of D-06's batch below). If you want v1.3 to stay a fast punch-list clear like v1.2, B or C are the smaller bets.

---

## D-03 — How much investigation time to spend on the five "can't reproduce from reading code" bugs?

**Items:** V13-09/10 (yellow tiles/icons drift on window resize), V13-55 (turn skipped every 4th time?), V13-57/58 (can multiplayer players actually trade ingredients, or is it just confusing?), V13-59/60/61 (ingredients vanishing from the game entirely)
**Why you have to decide this:** step 2 read every relevant line of code for all five and found nothing wrong — the resize math looks resize-safe, there's no turn-skip logic anywhere, ingredient totals are conserved in every code path traced. That means these can't be estimated or fixed from reading code alone; someone has to actually reproduce them live (playing the game, resizing windows, deliberately timing out a turn) and watch what happens.

**Options:**
- **A — One dedicated live-investigation session covering all five before any other v1.3 work starts.** Likely the cheapest path since several probably share a root cause or at least a repro setup (a live multiplayer + pass-and-play session with devtools open). You get real answers before committing to a schedule for anything downstream.
- **B — Fix the pass-and-play timer bug first (already confirmed, see Cluster B), then only re-test the ingredient-disappearance mystery — treat the other three as lower priority, investigate later or not at all.** Step 2's own strongest lead is that the disappearance may be a side effect of the already-broken pass-and-play timer toggle; fixing that first might make this investigation cheaper or resolve it outright.
- **C — Skip investigation for now; treat all five as open bug reports and revisit only if a player hits them again.** Cheapest short-term, but leaves real uncertainty about whether people can actually trade ingredients in multiplayer, which seems like something worth knowing.

**My recommendation: B.** It's the smallest first step, has a plausible payoff (may explain the disappearance for free), and doesn't block the rest of the milestone — the other three (resize, turn-skip, trade-UI-vs-bug) can be spiked afterward in whatever order feels right.

---

## D-04 — Rename "Parley" to "Trade"?

**Items:** V13-45, V13-46, V13-47
**Why you have to decide this:** you asked this exact question in the source document ("change to 'Trade'?") — it was never resolved, just flagged. It's a pure product/taste call.

**Options:**
- **A — Rename it.** Playtesters didn't know what "Parley" meant; "Trade" is unambiguous. Cost: touches exactly 3 user-facing strings (the button label, one prompt, one Credits-modal sentence) — code-cheap regardless.
- **B — Keep "Parley."** Preserves the game's pirate-flavor voice; the confusion could instead be addressed with a one-time hint (ties into D-02) rather than a rename.

**My recommendation:** genuinely your call — no technical basis to prefer either; both cost the same to build. This is entirely about the game's voice.

---

## D-05 — Trade-wind visual clarity: research now, or defer?

**Items:** V13-51, V13-52 (and, downstream, V13-49/50's actual visual build)
**Why you have to decide this:** you explicitly asked for *research* here ("research what common semiotics/game symbols might be..."), not a specific fix — nothing should be built until you've seen and picked from real options.

**Options:**
- **A — Commission the research this milestone**, as a small spike that comes back to you with 2–3 concrete visual directions (how to signal whirlpools as "stop here," how to make the trade winds read as windy with a clear direction) before any board-rendering work starts.
- **B — Defer this entirely to a later milestone** and leave the trade winds visually as they are for now, focusing v1.3 on bugs/polish instead.

**My recommendation: A**, scoped small — this is cheap to spike (a design-research pass, not a build) and the current mechanic really is confirmed non-obvious (ships get swept into the trade winds with zero warning today), so getting your input queued up now means the actual visual fix can ship in this milestone if you like a direction, or slip cleanly to later if you don't.

---

## D-06 — The copy you need to personally write or approve (batching the ask)

**Items:** V13-19 (solo end-of-voyage line), V13-28/29 (per-action hint text, 2 variants + 1 short version, if D-02 is yes), V13-36 (docking flip-rule clarifier), V13-47 (trade-button grey-out sub-text), V13-63 (a whole library of pastry-themed wind-flavor lines)
**Why you have to decide this:** this project's own established pattern (the storm-text rewrite before v1.0) is that narration copy comes from you, not auto-generated — several of these items have no exact wording drafted yet, only a description of what they should say.

**Options:**
- **A — One batched writing session covering everything above**, likely using the narration-review tool (V13-62, part of the draft roadmap's Phase 3) to see all existing lines in context while you write the new ones. Slower to start, but you only get asked once instead of five separate times.
- **B — Trickle it in per-phase** — write only what's needed for whichever phase is next, as it comes up. Gets individual fixes shipped sooner, at the cost of being asked repeatedly over the milestone.

**My recommendation: A**, if your schedule allows one longer sitting — it's the same total writing either way, and doing it once avoids five separate context-switches back into this project.

---

## D-07 — Pass-and-play: stop forcing device-passing on the two read-together intro screens

**Items:** V13-08
**Why you have to decide this:** you flagged this yourself as "not exactly a bug" — a UX choice, not a defect — and asked us to confirm there's no hidden reason (anti-cheat, fairness) the device-pass gate exists on those two screens today.
**Options:**
- **A — Confirmed clean, go ahead and remove the forced pass on those two screens.** Step 2 read the actual code: the gate exists purely because one shared function treats every pass-and-play message identically, not because these two screens have special handling. No fairness/anti-cheat mechanism was found tied to them.
- **B — Leave it as-is.**

**My recommendation: A.** This is close to a rubber stamp — the investigation already came back clean, and it's exactly the flow improvement you asked for.
