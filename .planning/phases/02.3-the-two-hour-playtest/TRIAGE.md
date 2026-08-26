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

## 0b. STATUS AFTER THE OVERNIGHT RUN (2026-08-26, build `2026-08-26g`)

**16 of 35 addressed. 3 verified on screen. 4 deliberately parked with a diagnosis. 12 untouched.**

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
| T-24 | tap to finish the text | **FIXED + VERIFIED** | mid-type tap 44→76 chars; finished-message tap changes nothing |
| T-25 | bake-off title | **FIXED + SCREENSHOT** | "Davy Probe, Yer Bake-Off" |
| T-27 | crates behind the green squares | **fixed** | swapping bowls raised for the swap only |
| T-29 | "?" cursor that does nothing | **fixed** | real `disabled` can't fire a click, so it stops promising |
| T-30 | Watch again glows | **FIXED + SCREENSHOT** | `animation:none` |
| T-31 | pink/blue colours | **fixed** | wrong→red, selected→yellow (it had no colour of its own) |
| T-32 | storm report pinned to player 1 | **fixed** | the anchor was the reading order of the sentence |
| T-33 | blue "?" art | **fixed (4 changes)** | 1739 of 1743 redundant image writes removed; hole art preloaded; the promised fallback now exists |
| T-01 | solo Enter dumps home | **parked** | does NOT reproduce in Chrome; goes to the WebKit mount |
| T-18 | parentheses split | **parked** | `nobrk` holds in solo at 390px; needs the ceremony at width |
| T-03 | wind announcement | **parked** | I claimed a screenshot confirmed it. **It did not.** Retracted |
| T-05, T-06, T-08, T-10, T-14, T-17, T-23, T-26, T-28, T-34, T-35 | | **untouched** | |

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
