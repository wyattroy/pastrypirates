# The 2026-08-26 playtest — triage

**Source:** Wyatt's two-hour playtest of build `2026-08-25g`, 35 checklist items + 4 screenshots.
**His words:** *"many of these bugs should have been found by you."* He is right. Why, measured, in §0.

---

## 0. HOW THIS GOT PAST THE GATES — measured 2026-08-26, not guessed

**The gate for exactly this class of bug is GREEN, and it is green because the hole was declared
acceptable.** `scripts/host_guest_parity_check.js --tree=4`, run today, passes all 6 assertions and
ends with its own disclaimer:

> `THE DECLARATION STILL NAMES 1 GAP(S): localAsk.`
> `Green here means "no worse than declared", NOT "converted".`

The declared gap, measured in that run:

| renderer | reachable from the guest's path | called by the host's game loop |
|---|---|---|
| `localAsk` — **the prompt renderer** | **0** | **6** |
| `showNarration` | 2 | 4 |
| `playBakeoffLive` | 1 | 2 |
| `renderPickPrompt` | 1 | 2 |

**`localAsk` at 0 / 6 is Wyatt's "entire parallel track of code for guests", located.** The host
builds its own prompts inside the game loop; a guest is served from somewhere else. Everything that
is a prompt — stay put, the wind announcement, the battle card, "waiting for X" — inherits that
split. It was scheduled to close at 02.15 Stage 4, which was marked **abandonable under D-04**.

**A gate that declares its own gap and stays green is the "reassuring gate" failure**
(`docs/HARD-WON-LESSONS.md` §3). It did not fail to notice. It was configured to pass.

**Second finding: the bare gate reads the WRONG TREE.** `node scripts/host_guest_parity_check.js`
with no flag prints `tree: root (the OLD game — not the tree under development)` and passes 5/5 on a
game nobody is developing. `npm test` does run `--tree=4` as well, so this is a footgun for anyone
running it by hand rather than a hole in CI.

### Two corrections to Wyatt's own diagnosis, owed because a wrong mechanism wastes his time

1. **The bake-off swap is NOT rewritten for baker vs watcher.** He wrote *"you've poorly rewritten
   the swap for baker/watcher... that would be terrible sloppy embarassing architecture."* Measured:
   `playBakeoffLive` is ONE function in `4/src/ui/bakeoff.js`, shared, reachable from both tiers
   (listeners=1, host-loop=2). The jitter he saw is real; duplicated code is not its cause. **The fix
   is therefore a different fix** — same choreography, different start point.
2. **The prompt split IS real** and he identified it correctly from the outside, in #30d, without
   seeing the code. §0's table is his diagnosis, confirmed.

---

## 0b. STATUS AFTER THE OVERNIGHT RUN (2026-08-26, build `2026-08-26h`)

**22 of 35 addressed (1 partial). 4 verified on screen. 5 parked with a diagnosis. 8 untouched.**

*Counts checked against the rows below rather than typed from memory — the first version of this
line was stale within an hour, which is what conventions §2 warns about.*

| | Item | State | Evidence |
|---|---|---|---|
| T-02 | guest can't stay put | **fixed at the seam** | parity assertion 2 red→green. NOT yet seen in two windows |
| T-04 | battle card never leaves | **fixed at the seam** | one `applyBattleSnap`, both tiers. NOT yet seen in two windows |
| T-07 | battle box chases your boat | **fixed** | centred like an over-tall card |
| T-09 | wrong captain lit in a bake | **LOCATED, NOT FIXED** | probe still reads it red — two derivations of "whose turn is it"; converging them is a replay design call, yours |
| T-11 | host-return message never clears | **fixed** | "Yargh! They're back!" takes a normal hold |
| T-12 | homepage over a live game | **FIXED + SCREENSHOT** | `["pp4Ribbon","pp4Pill","pp4Cap","pp4Fx"]` → `[]` |
| T-13 | stale captains in a new room | **partial** | a new room starts empty; the *persistence* is not reproduced, 2 causes ruled out |
| T-15 | blank white narration box | **FIXED + MEASURED** | median **917ms → 334ms** |
| T-16 | no glow on Start | **fixed** | specificity, not a missing class |
| T-19 | slider says nothing | **fixed** | your sentence, verbatim |
| T-20 | coin on the dock button | **fixed** | both label widths together |
| T-21 | "Wait, not yet" too loud | **fixed** | blue |
| T-22 | focus on pre-game modals | **fixed** | wired into `showStep`, so no screen can be forgotten |
| T-17 | tap to finish the text | **FIXED + VERIFIED** | mid-type tap 44→76 chars; finished-message tap changes nothing |
| T-25 | bake-off title | **FIXED + SCREENSHOT** | "Davy Probe, Yer Bake-Off" |
| T-27 | crates behind the green squares | **fixed** | swapping bowls raised for the swap only |
| T-29 | "?" cursor that does nothing | **fixed** | real `disabled` can't fire a click, so it stops promising |
| T-30 | Watch again glows | **FIXED + SCREENSHOT** | `animation:none` |
| T-31 | pink/blue colours | **fixed** | wrong→red, selected→yellow (it had no colour of its own) |
| T-08 | storm report pinned to player 1 | **fixed** | the anchor was the reading order of the sentence |
| T-11 | host-return message never clears | **fixed** | "Yargh! They're back!" takes a normal hold |
| T-27 | crates behind the green squares | **fixed** | swapping bowls raised for the swap only |
| T-29 | "?" cursor that does nothing | **fixed** | real `disabled` can't fire a click, so it stops promising; watcher's crates lose the pointer and answer with "Now yer just watchin'" |
| T-34 | flips "not consistent" | **FIXED + GATED** | you were right. The SPIN was one constant; the LANDED HOLD was three things — and a **bot's dock coin held for nothing at all**. Now one constant, and a gate |
| T-35 | flip should match the sound | **FIXED + MEASURED** | the blip is at **795ms**; the flip was **1000ms**, landing 205ms late. Now 795 — offset 0ms |
| T-28 | rewatch covers too fast | **parked, diagnosed at the line** | fixing only the baker's side would desynchronise the watcher — the exact bug class you're angriest about |
| T-33 | blue "?" art | **fixed (4 changes)** | 1739 of 1743 redundant image writes removed; hole art preloaded; the promised fallback now exists |
| T-01 | solo Enter dumps home | **parked** | does NOT reproduce in Chrome; goes to the WebKit mount |
| T-18 | parentheses split | **parked** | `nobrk` holds in solo at 390px; needs the ceremony at width |
| T-03 | wind announcement | **parked** | I claimed a screenshot confirmed it. **It did not.** Retracted |
| T-01, T-03, T-09, T-18, T-28 | | **parked, each with a diagnosis** | see below |
| T-05, T-06, T-10, T-14, T-23, T-24, T-26, T-32 | | **untouched** | |

### T-06 — "no message on the host's screen" during a guest's bake: established, NOT fixed

Read, not reproduced (a crew bake needs the two-window rig, which is parked at budget):

- **The host DOES receive bench snapshots.** `watchBattle`'s bake branch —
  `if(v&&v.bake){applyBenchSnap(v.bake);return;}` — sits BEFORE the `if(appState.isHost)return;`
  guard, deliberately, because a bench is published by whoever is baking and that may be a guest.
- **`applyBenchSnap` skips only the publisher's own seat**, so a host watching a guest's bake should
  reach `benchWatch(snap)` and draw the bench.
- **`remotePrompt`'s `panel("")` is not the culprit** — it is on the ANSWER path and already carries
  a `keepPanel` exception for exactly this card.
- **A wait line IS broadcast**: `"{captain} steps up to the ovens…"` with `{wait:true}`.

**By reading, the host should show either the bench or that line. He saw neither.** That is exactly
where guessing gets expensive, so it stops here. Get `crew_stayput_check.mjs` finishing first; the
same rig then answers this.

> **Ask him before building either.** His expectation ("it should say the same 'waiting for {player}
> to decide' message") and the built design (every captain WATCHES the bake on a face-down bench —
> his own 2026-08-18 ruling) are different things. He may simply not have known the bench was
> supposed to be there.

> **TWO numbering corrections, in the open — and it is the same mistake twice.** The storm fix was
> labelled **T-32** and belongs to **T-08**; the tap-to-finish fix was labelled **T-24** and belongs
> to **T-17**. Both times I reached for HIS checklist number when the code and this document use
> mine. **The tell is a T-number that matches his item number** — when those two agree it is almost
> always the error, because the two sequences only line up by coincidence. Every citation in code
> now carries both, written as `T-08 — his checklist #32`, so neither can be read alone.
>
> **The original note follows.** The storm fix was first labelled **T-32** in its commit
> and code comment. T-32 in this document is the bake-off's reveal lag; the storm item is **T-08**
> (his checklist #32). I took HIS number instead of mine. Corrected in `stage.js` and here rather
> than quietly — a triage whose numbers drift from the code that cites them is worse than no
> triage, and this is exactly the class of error the "point, don't restate" convention exists for.

**Not one item was marked fixed on reading alone.** Everything above was either measured,
screenshotted, or is explicitly labelled as proven only at the seam.

---

## 1. THE THEMES, IN THE ORDER I WILL TACKLE THEM

35 findings. They are **not** 35 independent bugs — 7 of them are one architectural fault and 10 are
one subsystem.

| # | Theme | Items | Why it is here in the order |
|---|---|---|---|
| A | The solo Enter bug | 1 | One line, first thing a new player touches |
| B | One prompt path | 7 | The architectural root. His angriest note, and 7 items collapse into it |
| C | Whose turn is it | 2 | Visible in every mode, small |
| D | Leaving and coming back | 4 | Two are ugly and cheap |
| E | The first second of a stage | 3 | Cheapest visible polish per hour |
| F | Typography and copy | 5 | Same |
| G | The bake-off as a shared spectacle | 10 | Part bug, part design — needs his rulings |
| H | The broken ingredient art | 1 | Hardest; needs a reproduction before a fix |
| I | Timing guarantees | 2 | These become tests, not eyeballs |

---

## 2. THE NUMBERED LIST

Numbers are MINE (T-01…). His checklist numbers are kept beside them so nothing is renumbered away.

### A — The solo Enter bug

| T | His # | What happens | What should happen |
|---|---|---|---|
| T-01 | 12 | Solo: pressing Enter in the name box closes the modal and dumps you to the home screen. Pass-and-play and crew are fine | Enter presses that screen's continue button |

### B — ONE PROMPT PATH *(the `localAsk` gap, §0)*

| T | His # | What happens | What should happen |
|---|---|---|---|
| T-02 | 30.4 | **A guest cannot "stay put" at all** | Same affordance as the host. Architectural — he said explicitly: *"don't patch this, fix it architecturally"* |
| T-03 | 30.1 | Crew: the day's weather/wind announcement never appears for a guest | It appears, same as the host |
| T-04 | 30.3 | **Crew: after watching others battle, the battle card stays on a guest's screen indefinitely** — until their own turn | It clears when the battle ends. He flagged this "a serious, bad bug" |
| T-05 | 30.2 | Crew: the host's narration card appears before the boat sails, disappears, then resettles | It appears once and stays |
| T-06 | 18b | During a guest's bake, the host's screen shows NOTHING | The standard *"waiting for {player} to decide"*, as everywhere else |
| T-07 | 27c | Watching others battle: the battle box drifts, sometimes offscreen — looks like it is chasing your own boat | Centred over the board, and it stays there |
| T-08 | 32 | Storm narration reporting table-wide movement attaches to player 1 | The dark-blue table-wide box. **All modes**, not just pass-and-play |

### C — Whose turn is it

| T | His # | What happens | What should happen |
|---|---|---|---|
| T-09 | 18a, 34b | During ANY bake-off the previous captain stays lit — header ship ring AND captains box. Confirmed in his screenshot pair: both screens show Dough Hook active while the guest is being asked to bake | The baker is the active captain |
| T-10 | 18i | After the bake-off there is NO drumroll narration on either screen; the guest jumps straight to the end card while the host correctly gets the crown | Both get the drumroll, then the result |

### D — Leaving and coming back

| T | His # | What happens | What should happen |
|---|---|---|---|
| T-11 | 9 | The host-left message never clears once the host returns | It clears, replaced by *"Yargh! They're back!"*, which then times out normally |
| T-12 | 10 | Host leaves for good → back to port, but **the homepage draws on top of a still-running game** (screenshot 1: DAY 4 header, captains box and a live narration bubble all visible behind the welcome card) | The voyage is torn down before the homepage is shown |
| T-13 | 16 | Hosting a NEW game in the same browser shows the PREVIOUS game's captains in "Captains at the Table" until a manual refresh | A new room starts empty |
| T-14 | 20 | A guest closing a tab mid-bake gets no grace and the table gets no message | Every captain gets the host's 30-second treatment: a drop-out message to the others, the leave card only after 30s |

### E — The first second of a stage

| T | His # | What happens | What should happen |
|---|---|---|---|
| T-15 | 14b | Stage narration boxes sit **blank white for ~0.5s** before typing starts — "the crew draws lots", the recipe picker | *"The exact instant that a box appears, the text should start to appear in it"* |
| T-16 | 14a | No orange glow on the Start button (confirmed, screenshot 3) | It glows like every other stage control |
| T-17 | 24 | A centre-stage card cannot be tapped to finish its text | Tapping the card, or the space around it, completes the text — the same affordance as tapping to advance bot turns |

### F — Typography and copy

| T | His # | What happens | What should happen |
|---|---|---|---|
| T-18 | 34a | **Parentheses break away from their clause game-wide.** Screenshot 3: `Dough Hook (+2🌕` ends a line and `)` starts the next | A universal typing rule. `nobrk` spans exist and are applied piecemeal — this needs to be systemic |
| T-19 | 31 | The coin slider never says what it is for — the line reads *"Yer givin' X for Y"* | *"Would ye offer any coin on top?"* |
| T-20 | 26 | The dock button carries a coin image | The island's own ingredient (cinnamon at the spice isle) |
| T-21 | 17b | "Wait not yet" is orange — inconsistent, and brighter than the real orange | Blue |
| T-22 | 17a | Focus does not land in the first text box on pre-game modals | It does — name box or crew code |

### G — The bake-off as a shared spectacle

| T | His # | What happens | What should happen |
|---|---|---|---|
| T-23 | 22c | **Nobody can watch a BOT bake** | Every captain watches every captain's bake-off, in every mode. His words: *"a vital part of the gameplay and endgame tension"* |
| T-24 | 18g | After you bake, your screen cuts straight to someone else's bake-off | A celebratory stage — *"Ye baked it! Now let's see how the others counter…"* with an **Argh!** button |
| T-25 | 18h | The card says "The Bake-Off" | *"{Captain}'s Bake-Off"*, or *"{Your name}, Yer Bake-Off"* |
| T-26 | 18c | A watcher's crates **jitter at the end of the swap**; the baker's do not — and it follows the role, not the tier | Identical motion. **NOT duplicated code** (§0) — same function, different start point |
| T-27 | 18f | Crates move BEHIND the green "correct" squares | In front, so solved guesses read as locked in behind |
| T-28 | 18j | "Watch again" covers the ingredients too fast | The same study-as-long-as-you-like → *"I'm ready"* pattern as the first look |
| T-29 | 18e | A watcher's cursor changes over the crates, clicks do nothing, and the cursor turns into `?` for buttons that do nothing | A tooltip — *"Now yer just watchin'"* — and no cursor change where there is no action |
| T-30 | 18d | "Watch again" carries the orange attention glow | It does not |
| T-31 | 22a | Wrong-guess pink does not read as "bad"; the blue selection is too close to the green | Redder for wrong; **yellow** for selected |
| T-32 | 22b | Second attempt with only 2 crates left: the 1st turned pink instantly, then the 5th **lagged as if 2, 3 and 4 were being revealed invisibly** | Judge the remaining crates one after another, with no dead time for absent ones |

### H — The broken ingredient art

| T | His # | What happens | What should happen |
|---|---|---|---|
| T-33 | 34c | After "Watch again" ×3: one shuffle showed **two vanillas**; then board and hold art became blue `?` placeholders (screenshot 4 — `?` on three island tiles AND in two captains' hold chips), which **reappeared as cinnamon** during the next captain's bake | No duplicate ingredient; no placeholder. He predicted this is hard to debug and he is right |

### I — Timing guarantees that need tests, not eyes

| T | His # | What happens | What should happen |
|---|---|---|---|
| T-34 | 27a | Coin flips may not be consistent across dock / battle / bot / human | *"write a unit test to do each one"* |
| T-35 | 27b | The flip is not tied to its sound | The flip lasts exactly the audio file's length, so the coin lands on the file's final blip |

---

## 3. WHAT IS NOT A BUG

- **#31 (slider resets to 1 after a refresh).** His own verdict: *"that seems fine to me; nothing had
  been submitted."* Recorded so nobody "fixes" it.
- **#32 (no hand-off card for a second captain's trade answer).** His ruling: correct as built.
