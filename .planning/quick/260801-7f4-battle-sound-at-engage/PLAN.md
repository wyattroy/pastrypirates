---
task: move-the-battle-sound-to-the-moment-battle-is-engaged
quick_id: 260801-7f4
type: quick
created: 2026-08-01
baseline_commit: c3f6f80
documentation_only: false
files_modified:
  - src/ui/audio.js
  - src/orchestrator.js
  - scripts/audio_mapping_test.js
autonomous: true
requirements: [AUDIO-01]

must_haves:
  truths:
    - "The sword clash sounds at the TOP of a battle — on the opening announcement, before the first coin flip — and nothing sounds when the battle resolves and spoils are taken"
    - "A guest hears exactly one clash per battle, fired on the no-battle -> battle transition only, never once per scoreboard write and never once per flip"
    - "The clash cannot play twice for one battle: EVENT_SOUND.battle is explicit null, and src/orchestrator.js carries exactly two engage call sites — one host-tier, one guest-tier, which never both run in the same browser"
    - "battleflee and dodge still map to battle-swords — the in-fight moments are untouched"
    - "src/engine/index.js is byte-unchanged: git diff --name-only HEAD -- src/engine/ returns nothing, so the v1.3 determinism corpus is not disturbed"
    - "npm test's 20 scripts all pass, including audio_mapping_test.js, narration_flow_test.js, extract_narration_lines.js and no_undef_check.js"
    - "The bakeoff gains no new sound on either tier — its audio behaviour is identical to today's"
  artifacts:
    - src/ui/audio.js
    - src/orchestrator.js
    - scripts/audio_mapping_test.js
  key_links:
    - "engage call -> the powder guard (src/orchestrator.js:432): the call sits AFTER the guard, or a battle refused for want of powder still makes a noise for a fight that never happens"
    - "engage call -> flash() (src/ui/panel.js:609-632): the call sits BEFORE the await, because flash() awaits the previous line's _revealDone and then sleeps msgHoldMs(text) — placed after it, the clash lands seconds late and Wyatt's original complaint returns in miniature"
    - "engage call -> the `@copy adhoc.battle.opening` marker: the call must not be inserted between that marker comment and the flash() literal it labels, or scripts/extract_narration_lines.js mis-associates the copy key"
    - "guest engage call -> appState.spectatingBattle: the field is read BEFORE it is assigned true, which is the entire edge trigger; assigned first, every scoreboard write re-fires the clash"
    - "guest engage call -> battleSnapshot's `title` (src/ui/flow.js:1520-1526): the only available discriminator between a broadside battle and the bakeoff; without it the guest gains a bakeoff clash the host never plays"
    - "EVENT_SOUND.battle -> scripts/audio_mapping_test.js: the harness must assert the null ACTIVELY by name, because its existing generic loop already passes on any explicit null — a future edit restoring the stem would slip through silently"
---

<objective>
Wyatt, 2026-08-01, after playing the Phase 21 build:

> *"I did hear battle sound — just not where I expected it. move the battle sound to the beginning of
> attack when battle is first engaged, not the end."*

This is a timing defect and nothing else. The sound fires; it fires in the wrong place. There is no
missing hook to hunt for.

Why it lands late: the clash hangs off the `battle` event, and `Game.ev({t:"battle",...})` is only
emitted once the whole fight has resolved — rounds fought, winner decided, spoils moved
(`src/orchestrator.js:655`, with the headless twin at `src/engine/index.js:581`). `liveRender()` on
the next line is what plays it. So the swords arrive as the loot is being counted.

Purpose: move the clash to the moment the fight is joined, on both tiers, without touching the
engine and without letting it play twice.

Output: one new named cue in `src/ui/audio.js`, two call sites in `src/orchestrator.js` (one host,
one guest), `EVENT_SOUND.battle` retired to explicit silence, and four new assertions in
`scripts/audio_mapping_test.js` pinning the new intent.
</objective>

<execution_context>
@$HOME/.claude/gsd-core/workflows/execute-plan.md
</execution_context>

<context>
@src/ui/audio.js
@scripts/audio_mapping_test.js
@docs/DETERMINISM-RERECORD-NEXT.md
</context>

<boundaries>
**HARD — the engine is fenced.**

- `src/engine/index.js` may not be modified. Not one line, not a comment. v1.3's determinism corpus
  is re-recorded exactly once, in v1.4 (`docs/DETERMINISM-RERECORD-NEXT.md` §7-8), and nothing in
  this task needs the engine. Its `t:"battle"` emission at line 581 stays exactly as it is.
- No change to what any event carries, and no field written onto an event object to communicate with
  the audio module. `src/ui/audio.js`'s own header states that rule at lines 241-246; it exists to
  protect the corpus.
- No new field on `appState` — the guest edge reuses `spectatingBattle`, which is already registered
  in `src/state/index.js:86`. Adding one would pull in `scripts/state_contract_check.js`.
- No new Firebase node, no new field on an existing synced payload. `scripts/net_contract_check.js`
  and `scripts/net_registry_test.js` stay untouched.
- No new sfx file. `SFX_FILES` (`src/ui/audio.js:31`) stays at six stems — it is the only source of a
  fetch URL anywhere in the module (threat T-21-02) and this task adds nothing to it.
- `src/ui/*` may not import `src/orchestrator.js`. The reverse is fine and already in place
  (`src/orchestrator.js:75` imports from `./ui/audio.js`).
- `npm test` is green at `c3f6f80` — 20 scripts, 0 failing checks, verified before this plan was
  written. It must still be green at the end. Do not loosen an assertion to get there.
</boundaries>

<decisions_taken_before_planning>
Four open questions were named in the ask. All four are settled here, from a read of the source, not
from assumption. Each is one line to overrule.

**1. Where the host call goes: after the powder guard, before the opening `flash()`.**

Concretely: after `if(c.powder&&coinShortfall(c.powder,att.coins))return null;` (`src/orchestrator.js:432`)
and before the `// D-08/D-25` comment block that introduces `battleOpenVariants` (line 433).

- *After the guard*, because that guard is a real `return null` — a battle refused for want of powder
  never happens, and must not announce itself with a clash. Nothing is broadcast above it either;
  that ordering is deliberate and `scripts/narration_flow_test.js:414-420` already pins it.
- *Before the `await flash(...)`*, because `flash()` (`src/ui/panel.js:609-632`) first awaits the
  PREVIOUS line's `el._revealDone` and then `await sleep(msgHoldMs(text))`. Its `ms` argument is not
  even read. Placing the call after that await delays the clash by the full reveal plus hold —
  seconds — which is Wyatt's exact complaint at a smaller scale. `flash()` does fire its
  `onBroadcast` synchronously on entry (line 614), so the host's clash and the host's announcement
  land together.
- *Before the `// @copy adhoc.battle.opening` marker*, never between that marker and the `flash()`
  literal it labels. `scripts/extract_narration_lines.js:437` keys `adhoc.battle.opening` to that
  literal; a statement wedged in between risks mis-association, and that script is in `npm test`.

**2. How the guest hook stays edge-triggered: `appState.spectatingBattle`, read before it is written.**

`watchBattle()` (`src/orchestrator.js:350-356`) fires on every write to the Firebase battle node, and
the host writes that node on every `renderBattle()` — many times per fight. So the callback itself is
not an edge; `spectatingBattle` is. It is already exactly the right shape: false before a battle,
true during, and reset to false when the node clears. The fix is to read it, play if it was false,
and only then assign true.

The reset arm is guaranteed. `asyncBattle` calls `netRemoveBattle` at line 623, which sits ABOVE
`if(fled)return` at line 624 — so the node clears on every exit path, flee included, and the guest
re-arms for the next battle. No new state, no dedup counter, no timer.

**Known, accepted variance, stated rather than discovered later.** The host fires on the
announcement; the guest fires on the first battle-node write, which is the first `renderBattle()` —
after `flash()`'s hold AND after `collectSideBets` (`src/ui/flow.js:1545`), which can put a human
spectator through two prompts. So on a table with human spectators the guest's clash can trail the
host's by several seconds. It is still *before the first coin flip*, and it still lands on the guest's
own visible engage moment — the battle scoreboard appearing — so the "end of fight" problem is fixed
on both tiers. Two tighter alternatives were considered and rejected: (a) hooking the guest on the
narration broadcast would mean matching announcement text, which is brittle and would break the next
time the copy is edited; (b) having the host write the battle node early would set
`spectatingBattle` early on guests, and `src/orchestrator.js:1099` gates `showNarration` on
`!appState.spectatingBattle` — it would silence the opening announcement and the whole side-bet
exchange on every guest. That is a regression, not a refinement. **The variance is in the human check
below so Wyatt can judge it live; closing it needs a new synced field, which is bigger than this
task.**

A guest who joins or reloads mid-battle hears one clash on arrival, because its `spectatingBattle`
starts false. Accepted — a late arrival hearing the fight it just walked into is not a defect.

**3. `EVENT_SOUND.battle` becomes explicit `null`.**

Not a dispatch-time suppression. `soundForEvent()` is pure and headlessly tested; making it return a
stem the dispatcher then declines to play would make the pure function lie and would need hidden
state. `battle` moves out of the `battle/battleflee/dodge` line and joins the D-06 explicit-silence
group, carrying a comment that names the engage site so the next reader is not left wondering where
the clash went. `battleflee` and `dodge` keep `battle-swords` — both are legitimate in-fight moments
and neither is touched.

What that means for the harness: **the existing test would pass on this change without being edited,
and that is precisely the problem.** `scripts/audio_mapping_test.js:131-138` loops generically —
`null` satisfies the "explicit null" arm with no named assertion at all. So the harness gets four new
checks that name the intent out loud (`battle` null; `battleflee` and `dodge` still swords;
`BATTLE_ENGAGE_SOUND` a real stem). That is tightening the harness to the new behaviour, which is
what the ask requires — not deleting or loosening anything.

**4. The bakeoff is OUT of scope — and must be actively kept out, on both tiers.**

`asyncBakeoff` (`src/ui/flow.js:1627`) drives the same scoreboard through `onRenderBattle` ->
`netSetBattle`, so an ungated guest edge WOULD fire a clash at bakeoff start while the host stayed
silent. This fix would therefore *create* an asymmetry if the gate were left out. The bakeoff is
currently silent by deliberate design (`EVENT_SOUND.bakeoff: null`, D-06); un-silencing it is a new
design call that belongs to Wyatt, not a side effect of a timing fix.

The discriminator is `title`. `battleSnapshot` (`src/ui/flow.js:1520-1526`) copies `title` only when
defined; `asyncBakeoff`'s `base()` (line 1634) sets `title:"🧁 The Bakeoff!"` and is the ONLY producer
of one anywhere in the repo (`renderBattle` at `src/orchestrator.js:324` defaults to
`"⚔️ Broadside Battle"` when it is absent). A snapshot carrying a `title` is a bakeoff. Net result:
bakeoff audio is byte-identical to today's. **If Wyatt wants the bakeoff to clash too, it is one line
on each tier — say so and it is done.**

**Recorded, not to be "fixed": fishing and the coin flip firing together.** Wyatt has already
accepted this. It is inherent — fishing IS a flip action, so `fish` -> `fishing` and the flip's own
`coin-flip` are two true things happening at once, layering by design (D-10). Leave it alone.
</decisions_taken_before_planning>

<tasks>

<task type="auto">
  <name>Task 1: Give the clash its own named cue, retire EVENT_SOUND.battle to silence, and pin both in the harness</name>
  <files>src/ui/audio.js, scripts/audio_mapping_test.js</files>
  <read_first>
    src/ui/audio.js lines 26-108 — the constants block, EVENT_SOUND, and the pure soundForEvent(); note that battle/battleflee/dodge currently share one line
    src/ui/audio.js lines 198-271 — play(), playFlip(), playWinScreen() and the export list; playWinScreen is the model to copy (a named moment cue, not an event mapping)
    scripts/audio_mapping_test.js lines 111-138 — the generic key-set and value loops that already pass on any explicit null, which is why named assertions are required
    scripts/audio_mapping_test.js lines 194-201 — the placeholder-constant assertions, the shape the new BATTLE_ENGAGE_SOUND check should mirror
  </read_first>
  <action>
In `src/ui/audio.js`, add a module constant `BATTLE_ENGAGE_SOUND` set to the `battle-swords` stem,
placed in the constants block immediately above `EVENT_SOUND`. Comment it as a real choice, NOT a
placeholder — unlike `WIN_SOUND_PLACEHOLDER` and `SHOTCLOCK_SOUND_PLACEHOLDER`, this stem literally
is a sword clash and is not on any shopping list for Luis. Naming it as a constant rather than
inlining the string is what lets the DOM-free harness assert it.

Add a function `playBattleEngage`, placed next to `playWinScreen` and built the same way: it calls
the private `play()` primitive with the constant and the master bus, nothing more. It must be defined
below `play()` and `masterGain`, and it must not touch `stormNode` or `fadeStorm`. Comment it with
what it marks — the moment a fight is joined, fired from the orchestrator's own battle-opening seams
rather than from an event, because the `battle` event does not exist until the fight is over. Export
both the constant and the function.

Then retire `EVENT_SOUND.battle`. Remove the `battle` key from the line it currently shares with
`battleflee` and `dodge`, leaving those two mapped to the sword stem exactly as they are, and adjust
that line's comment so it no longer claims to cover the battle itself. Add `battle` to the D-06
explicit-silence group as a strict `null`, with its own comment saying the clash moved to engage time
and naming `playBattleEngage` as where it went. `EVENT_SOUND` must still have exactly 25 keys, still
matching `EVENT_NARRATION` in both directions — you are changing one value, not the inventory.

In `scripts/audio_mapping_test.js`, add four named checks in a new section after the existing
`EVENT_SOUND` value loop. Use these check names verbatim, because the verify step greps the harness
output for them:

- `EVENT_SOUND.battle is explicit null - the clash moved to engage time`
- `EVENT_SOUND.battleflee still maps to battle-swords`
- `EVENT_SOUND.dodge still maps to battle-swords`
- `BATTLE_ENGAGE_SOUND is a member of SFX_FILES`

Import `BATTLE_ENGAGE_SOUND` alongside the existing imports from `../src/ui/audio.js`. Write a short
section header above the four explaining why they exist: the generic loop above already passes on any
explicit null, so without these a future edit that restores the stem — and re-creates the
double-clash — would slip through green. Do not weaken, reorder or delete any existing check.

Do not import or reference `playBattleEngage` from the harness. It calls `play()`, which needs a live
`ctx`; the harness is DOM-free by design and the bare import at its top is itself an assertion that
the module builds nothing at load.
  </action>
  <verify>
    <automated>
    node scripts/audio_mapping_test.js > /tmp/audio_t1.log 2>&1 && \
    grep -q 'the clash moved to engage time' /tmp/audio_t1.log && \
    grep -q 'battleflee still maps to battle-swords' /tmp/audio_t1.log && \
    grep -q 'dodge still maps to battle-swords' /tmp/audio_t1.log && \
    grep -q 'BATTLE_ENGAGE_SOUND is a member of SFX_FILES' /tmp/audio_t1.log && \
    grep -q 'PASSED' /tmp/audio_t1.log && \
    ! grep -q ' FAIL ' /tmp/audio_t1.log && \
    node -e '
    import("./src/ui/audio.js").then(m=>{
      if(m.EVENT_SOUND.battle!==null)throw new Error("battle is not strictly null");
      if(m.EVENT_SOUND.battleflee!=="battle-swords")throw new Error("battleflee was disturbed");
      if(m.EVENT_SOUND.dodge!=="battle-swords")throw new Error("dodge was disturbed");
      if(Object.keys(m.EVENT_SOUND).length!==25)throw new Error("EVENT_SOUND inventory changed size");
      if(m.SFX_FILES.length!==6)throw new Error("a stem was added or removed");
      if(typeof m.playBattleEngage!=="function")throw new Error("playBattleEngage is not exported as a function");
      if(!m.SFX_FILES.includes(m.BATTLE_ENGAGE_SOUND))throw new Error("BATTLE_ENGAGE_SOUND is not a real stem");
      if(m.soundForEvent({t:"battle"})!==null)throw new Error("soundForEvent still resolves a sound for battle");
      console.log("T1-SURFACE-OK");
    }).catch(e=>{console.error(e.message);process.exit(1);});' && \
    test -z "$(git status --porcelain -- src/engine/)" && \
    echo TASK1-OK
    </automated>
  </verify>
  <acceptance_criteria>
    - `src/ui/audio.js` exports `BATTLE_ENGAGE_SOUND` (a member of `SFX_FILES`) and `playBattleEngage` (a function).
    - `EVENT_SOUND.battle` is strictly `null`; `EVENT_SOUND.battleflee` and `EVENT_SOUND.dodge` are both still `"battle-swords"`.
    - `EVENT_SOUND` still has exactly 25 keys and `SFX_FILES` still has exactly 6 stems — no inventory change.
    - `soundForEvent({t:"battle"})` returns `null`.
    - `scripts/audio_mapping_test.js` prints all four new named checks and exits 0 with zero FAIL lines.
    - The module still imports cleanly under plain Node — the harness running at all is that proof.
    - `git status --porcelain -- src/engine/` is empty.
  </acceptance_criteria>
  <done>
The clash exists as a named, callable cue independent of the event feed; the event-tier mapping that
made it play at the end is explicitly silent; and the harness now asserts that intent by name rather
than passing on it by accident.
  </done>
</task>

<task type="auto">
  <name>Task 2: Fire the cue at engage on both tiers — host in asyncBattle, guest on the watchBattle edge</name>
  <files>src/orchestrator.js</files>
  <read_first>
    src/orchestrator.js line 75 — the existing import from ./ui/audio.js, the line to extend
    src/orchestrator.js lines 350-356 — watchBattle(), the guest's only signal that a battle started
    src/orchestrator.js lines 413-441 — asyncBattle's opening: the powder guard, the D-08/D-25 comment, the @copy marker, the awaited flash
    src/orchestrator.js lines 620-624 — netRemoveBattle sits ABOVE `if(fled)return`, which is what guarantees the guest edge re-arms after every battle including a flee
    src/orchestrator.js lines 1273-1274 — the host runs runLiveNet() only; watchBattle() runs only in the guest branch, which is why the two call sites can never both fire in one browser
    src/ui/panel.js lines 609-632 — flash() awaits the previous reveal and then sleeps the hold, and never reads its `ms` argument
    src/ui/flow.js lines 1520-1526 and 1627-1655 — battleSnapshot copies `title` when defined; asyncBakeoff's base() is the only thing in the repo that sets one
  </read_first>
  <action>
Extend the existing `./ui/audio.js` import on line 75 with `playBattleEngage`. Do not add a second
import statement.

**Host tier.** In `asyncBattle`, insert the engage call immediately after the powder guard line
`if(c.powder&&coinShortfall(c.powder,att.coins))return null;` and immediately before the `// D-08/D-25`
comment that introduces `battleOpenVariants`. It goes there and nowhere else, for two separate
reasons that must both hold: after the guard, so a battle refused for want of powder makes no noise
for a fight that never happens; before the awaited `flash(...)`, because `flash()` awaits the
previous line's reveal and then sleeps the message hold, so a call placed after it lands seconds late
and re-creates the exact complaint this task exists to fix. Do not move, reword or re-indent the
`// @copy adhoc.battle.opening` marker, and do not insert anything between that marker and the
`flash(...)` line it labels.

Comment the call with what it marks and why it sits above the flash rather than below it.

**Guest tier.** In `watchBattle`, the `if(v)` branch currently assigns `appState.spectatingBattle=true`
first. Restructure so the engage call happens BEFORE that assignment and only when
`appState.spectatingBattle` is still false — that read-then-assign order IS the edge trigger, and it
is the whole reason a callback that fires on every scoreboard write produces exactly one clash per
battle. Then gate it additionally on the snapshot NOT carrying a `title`: `title` is present only on
a bakeoff snapshot, and without that gate the guest would clash at bakeoff start while the host stays
silent — an asymmetry this fix would be creating, not inheriting. Leave the `renderBattleFromSnap`
call, the `inBattlePrompt` check and the `else` reset arm exactly as they are.

Comment the guest hook with three things: that the read-before-write order is load-bearing; that the
`title` check is the bakeoff exclusion and that the bakeoff staying silent is a deliberate D-06
choice Wyatt can reverse; and the accepted variance — the guest's clash lands on the first
battle-node write (the scoreboard appearing, still before the first flip) rather than on the
announcement, because the host does not write that node until after `flash()` and `collectSideBets`.

**One constraint on your comment wording, because a placement gate depends on it:** in any comment
you write, refer to the cue WITHOUT its call parentheses. The verify step counts occurrences of the
call form and requires exactly two — the two real call sites. A comment containing the call form
would break a check that exists to prove the clash cannot play twice.

Touch nothing else in this file. No engine change, no event change, no new `appState` field, no
Firebase write.
  </action>
  <verify>
    <automated>
    node -e '
    const s=require("fs").readFileSync("src/orchestrator.js","utf8");
    const calls=(s.match(/playBattleEngage\(\)/g)||[]).length;
    if(calls!==2)throw new Error("expected exactly 2 engage call sites, found "+calls);
    if(!/import\s*{[^}]*playBattleEngage[^}]*}\s*from\s*"\.\/ui\/audio\.js"/.test(s))throw new Error("playBattleEngage is not imported from ./ui/audio.js");
    const guard=s.indexOf("c.powder&&coinShortfall(c.powder,att.coins)");
    const marker=s.indexOf("adhoc.battle.opening");
    const host=s.indexOf("playBattleEngage()",guard);
    if(!(guard>0&&host>guard&&host<marker))throw new Error("host call is not between the powder guard and the opening copy marker");
    const wb=s.indexOf("export function watchBattle");
    const wbEnd=s.indexOf("export function battleAsk");
    const guest=s.indexOf("playBattleEngage()",wb);
    if(!(wb>0&&guest>wb&&guest<wbEnd))throw new Error("guest call is not inside watchBattle");
    const body=s.slice(wb,wbEnd);
    if(!/!appState\.spectatingBattle/.test(body))throw new Error("guest hook is not edge-triggered on spectatingBattle");
    if(body.indexOf("playBattleEngage()")>body.indexOf("appState.spectatingBattle=true"))throw new Error("guest edge is read AFTER the assignment - every scoreboard write would re-fire");
    if(!/\.title/.test(body))throw new Error("guest hook has no bakeoff title gate");
    console.log("T2-PLACEMENT-OK");' && \
    npm test > /tmp/npm_t2.log 2>&1 && tail -1 /tmp/npm_t2.log && \
    test -z "$(git status --porcelain -- src/engine/)" && \
    test -z "$(git diff --name-only HEAD -- src/engine/)" && \
    test -z "$(git diff --name-only HEAD -- src/state/ src/net/ index.html package.json)" && \
    echo TASK2-OK
    </automated>
    <human-check>
Wyatt drives these. Keep the local server up until he says commit.

**Check A — solo vs bots, Chrome (the primary check).** `npm start`, open the game, click once
anywhere first so audio unlocks, start a solo game, sail next to a bot captain and attack it.
  - The swords must sound the instant the `⚔️ ... attacks ... ! First to 2 hits wins…` line appears —
    before any coin flip.
  - The swords must NOT sound again when the fight ends and the spoils line appears.
  - His own words for a pass: swords at the start, silence at the finish.

**Check B — the same, in Safari.** One battle, same two observations. Safari is a first-class target
and its audio unlock behaves differently from Chrome's.

**Check C — two-tab multiplayer, host + guest (docs/DRIVING-THE-GAME.md, and §5d if a timing window
needs arming).** Run one battle with the guest tab audible.
  - The guest hears exactly ONE clash for the battle — not one per coin flip, not one per scoreboard
    update.
  - It arrives when the battle scoreboard appears on the guest's screen, before the first flip.
  - Nothing sounds on the guest when the battle resolves.
  - **Judgement call for Wyatt, flagged deliberately:** the guest's clash can trail the host's by a
    few seconds when a human spectator is placed through the side-bet prompts. It is still at the
    start of the fight rather than the end. If that gap bothers him it is a follow-up needing a new
    synced field, not a tweak to this change.

**Check D — bakeoff, opportunistic.** If a game reaches the bakeoff, confirm no swords sound at its
start on either tab. If no bakeoff occurs naturally, the automated `title`-gate check above covers
it; do not play a whole game to reach one.
    </human-check>
  </verify>
  <acceptance_criteria>
    - `src/orchestrator.js` contains exactly two engage call sites and one extended import — no second import statement.
    - The host call sits after the powder guard and before the `adhoc.battle.opening` copy marker (index ordering, asserted mechanically).
    - The guest call sits inside `watchBattle`, before `appState.spectatingBattle` is assigned true, guarded by both `!appState.spectatingBattle` and a `title` check.
    - `npm test` reports all 20 scripts passing, `narration_flow_test.js` and `extract_narration_lines.js` included.
    - `git diff --name-only HEAD` lists no path under `src/engine/`, `src/state/`, `src/net/`, and neither `index.html` nor `package.json`.
    - Check A passes in Chrome and Check B passes in Safari: swords on the opening line, silence at the resolution.
    - Check C passes: the guest hears exactly one clash per battle, before the first flip, and none at resolution.
  </acceptance_criteria>
  <done>
The clash marks the moment the fight is joined on every tier a player can be sitting at — solo, host
and guest — and it plays once per battle, never twice, with the engine and the determinism corpus
untouched.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| host -> guest (Firebase battle node) | The guest's new engage cue is triggered by remote data. The only thing read from it is the presence of the node and its `title` key. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-21-02 (restated) | Tampering | `src/ui/audio.js` fetch URLs | medium | mitigate | `SFX_FILES` stays a closed six-entry literal and `BATTLE_ENGAGE_SOUND` is a constant naming one of those six — no runtime string ever reaches a fetch URL. Asserted by `BATTLE_ENGAGE_SOUND is a member of SFX_FILES`. |
| T-7f4-01 | Denial of Service | guest `watchBattle` engage hook | low | mitigate | A malicious or looping battle-node write cannot machine-gun the clash: the edge trigger fires only on the false->true transition of `spectatingBattle`, so repeated writes during a battle are silent. |
| T-7f4-02 | Tampering | guest `title` discriminator | low | accept | A forged `title` on a real battle snapshot suppresses one guest's engage cue. Impact is one missing sound effect on one client — no state, economy or determinism consequence. Not worth a schema check. |
| T-7f4-SC | Tampering | package installs | high | mitigate | No package-manager install of any kind is in scope. `package.json` is in the negative-diff gate on Task 2. |
</threat_model>

<verification>
1. `npm test` — 20 scripts, 0 failing checks, matching the `c3f6f80` baseline.
2. `git diff --name-only HEAD` lists exactly three paths: `src/ui/audio.js`, `src/orchestrator.js`,
   `scripts/audio_mapping_test.js`.
3. The Task 2 placement gate passes — two call sites, correct order on both tiers.
4. Wyatt's Checks A, B and C pass; D is opportunistic.
</verification>

<success_criteria>
The sword clash marks the beginning of a battle instead of its end, on solo, host and guest alike; it
plays once per battle; `battleflee`, `dodge` and the bakeoff are exactly as they were; and the engine
and its determinism corpus are byte-unchanged.
</success_criteria>

<output>
Create `.planning/quick/260801-7f4-battle-sound-at-engage/SUMMARY.md` when done. Record in it: the
accepted host/guest timing variance and whether Wyatt let it stand, and the bakeoff exclusion as an
open one-line reversal if he wants the clash there too.
</output>
