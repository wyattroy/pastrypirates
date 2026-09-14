# CEO reviews — newest at the TOP, append-only

**Never edit an old verdict.** A review that turned out wrong is evidence about the reviewer and
belongs on the record exactly as it was written. Each CEO is handed the previous verdict so it can
say whether a fault is *recurring* — which is the check this file exists to make possible.

---

## 2026-09-14 · `sep14-game-feel` (word serving = dev `e4e0df64`) · ARCHITECTURE AUDIT: how player-facing words are served, and how to future-proof it · **NOT A PASS/FAIL REVIEW. WORDS NEARLY ALL IN ONE FILE; RULES ARE NOT — BATTLES AND DOCKING WRITTEN TWICE, AND MOST SCREENS ARE SENT FINISHED SENTENCES.**

**Asked for by Wyatt, 2026-09-14** ("have the ceo audit our current setup for serving player-facing words, and suggest ways to make it more robust according to my design values"). Verbatim below.

Paths are relative to the repo root, `/Users/wyattroy/Documents/Projects/pastrypirates/.claude/worktrees/google-search-console-020493`. I read the code on `sep14-game-feel`. Against `origin/dev`, only `course.js`, `press.js` and `stage.js` differ, so line numbers in `stage.js` are this branch's. I ran the words check, the display-door check and the mode-fork check myself, and all three pass. I started no browser or server and edited nothing.

## 1. Read this first

**Your words are nearly all in one file, but your rules are not: battles and docking are each written twice, and most screens are still sent finished sentences instead of "which line, about whom". Fix those two things and Pasta Pirates gets close to swapping one folder.**

("human/both" in your message reads as "human/bot".)

---

## 2. The map, as it really is

### How each kind of word reaches a screen

**An event line (dock, trade, battle result, storm, muse)**
- **Path:**
  - The event is recorded: 33 `this.ev` calls in `src/engine/index.js`, plus 5 recorded outside the engine (`src/orchestrator.js:790,823,854,885`, `src/ui/flow.js:3613`).
  - It goes through the one consumer, `consumeEvent` (`orchestrator.js:1791`), then the one narrator, `narrateEvent` (`src/ui/util.js:1881`). The narrator waits for the board to finish (`:1883`).
  - `EVENT_NARRATION` picks a line id (`util.js:510-747`), then `say()` and `fill()` build it (`src/shared/words.js:62`).
  - `flash()` picks this screen's version (`src/ui/panel.js:1270`).
- **Who writes the sentence:** the host, for every screen. It builds one "everyone else" line plus a "ye" version for each captain named (`util.js:794-805`).
- **On the wire:** finished HTML plus the versions (`src/net/writers.js:79-81`). A guest only picks one (`orchestrator.js:2256`).

**The captain's log**
- Each screen words it itself, from the event, inside the consumer (`orchestrator.js:1865`, third person per `util.js:863-869`). Nothing crosses the wire.

**A question (Accept / Deny, "what'll ye do")**
- **Path:** built inside the turn code, where it is asked. Examples: the trade offer (`flow.js:3026`), the crow's-nest call (`:3581`), the dock flip (`:1881`), fire and defend (`orchestrator.js:712,718`). Then `ask(msg, opts)` (`util.js:1597`) draws it locally or sends it with `remotePrompt` (`orchestrator.js:1661`).
- **Who writes it:** the host, from one viewpoint that each caller picks (for example `say("trade.offered",…,q.idx)` at `flow.js:3026`).
- **On the wire:** finished `msg`, `labels`, `why`, `sub` and slider texts (`util.js:1641-1675`, `1565-1579`).

**A button label**
- `say()` runs when the options are built (`flow.js:3027-3035`), and `optionButtonsHTML` draws them (`util.js:1485`). Labels cross the wire as finished strings.

**A wait line ("…is deciding…")**
- `ask()` sends one before every question (`util.js:1636`). There are also `flow.js:802` (sailing), `:915` (ovens), `:3362` (mateys), `orchestrator.js:564-576` (battle) and `:1044` (recipe draft).
- The host words them with `sayAll`, and they go as HTML plus versions.

**The battle card**
- **Path:** the host runs the fight (`orchestrator.js:635-890`). `battlePublish` (`:281`) draws it locally and sends a snapshot. The guest's `watchBattle` (`:507`) draws it through `battleFooter` (`flow.js:3544`).
- **The lines are mixed:**
  - Some go as `{id, facts}` and each screen words them (`orchestrator.js:710,716,726,830` → `flow.js:3555`).
  - Four go as finished HTML (`orchestrator.js:728,734,737,833`).
  - "Waiting for…" goes as a seat number (`:593` → `flow.js:3551`).

**A guest's screen**
- Events, narration and questions come through the same consumer (`:1971`), `watchNarr` (`:2202`) and the same prompt renderer (`:2062`).
- **The guest words only a few things itself:** the captain's log, some battle lines, the bake-off watcher line (`orchestrator.js:409`), the skip recap (`flow.js:119`) and the lobby. The host worded everything else.

**Pass-and-play**
- Handing over the device changes `mySeat` (`src/ui/lobby.js:413,421`), and "ye" follows `mySeat` (`util.js:2009-2010`).
- Every human seat answers on this device (`src/shared/storyboard.js:213-214`).
- A line that opens with its captain reads "Crustbeard — ye", so a shared screen still says who "ye" is (`words.js:77`).

**Theme names (islands, ingredients, captains, directions)**
- These are code tables in `src/shared/index.js`: `ING_NAME` :225, `DOCK_PLACE` :232, `DOCK_FLAVOR` :260, `DIRNAME` :304, `NAMES` :616. They are passed into lines as finished text (`util.js:576`).

**Sea-creature sightings**
- 50 sightings, each typed twice (`src/shared/index.js:~346-447`).
- The sentence text is stored on the event and read back (`util.js:498-507`). So it is saved in Firebase and in solo saves.

**The recipe book**
- `RECIPE_BOOK` (`src/ui/recipe.js:44`, 21 real recipes), `RECIPE_STEPS` (`src/shared/recipe-steps.js:33`) and the art list (`recipe.js:318-335`).

**The parrot's tutorial ladder**
- It lives in `words.js:522`, but `{name}` is filled by a plain text replace that bypasses `fill()` (`orchestrator.js:1084,1863`).

**Static page text**
- `index.html` holds 185 text nodes and 11 labels by my count, including "Sail the Caribbean" in its page description (`:15`). The about, credits, rules, privacy and stats pages add more.

### Where your four variables are actually decided

| Variable | One place? | Evidence |
|---|---|---|
| **actionTaken** | **No.** There is no action object. | A human's choice comes back from `ask()` as a value (`util.js:1694`), and separate code applies each action in `flow.js` (dock `:1869`, trade `:2237`, menu `:2503`). A bot's choice is made in `flow.js` `botTurn` (`:3119`) or in the engine's `takeTurn` (`engine/index.js:2887`). Only the event list is uniform. |
| **playerType** | **Mostly.** | At the turn door, `flow.js:2892` picks `humanTurn` or `botTurn`. It is also checked ad hoc at `flow.js:2337, 3004, 3357, 3574`. The intent is right: type decides how a move is chosen. |
| **playerLocation** | **Yes**, as two pure answers. | "Who answers" is `decisionIsLocal` (`util.js:2023` → `storyboard.js:213`). "Who reads ye" is `isLocalTo` (`util.js:2009`). But each caller picks the viewpoint (`flow.js:3026`, `orchestrator.js:718`), and `mySeat ?? 0` is read directly in `stage.js:266,1179,1190,3074,4560,4674,5541` and `flow.js:113,122,716`. |
| **gameMode** | **No.** There is no mode value. | It is three flags: `passAndPlay` (`flow.js:3718`), `room`/`db`, and `isHost` (`flow.js:3702`). They are read at `flow.js:2982,3299`, `util.js:129`, `lobby.js:374,474`, `board.js:1760` and `stage.js:1585`. The right pattern already exists: `src/shared/visibility.js` asks "do the captains share a device?" instead of naming a mode. |

### Where the CTO's map is wrong or incomplete

- **"The battle card is the only place words cross the wire as data."** Wrong both ways.
  - The captain's log, the battle "waiting" line and the bake-off watcher line also travel as data.
  - The battle card still sends 4 lines as finished HTML.
- **HOLE 1 counts 2 question doors; there are 5.** Each sends finished text: `ask`, `battleAsk`, the sail pick (`flow.js:840`), the recipe/intro channel (`orchestrator.js:1692-1700`), and the bake-off prompt. The bake-off prompt sends the baker's ready-made name (`flow.js:940`).
- **"The words all come from one file."** Not yet:
  - The "ye / yer / Crustbeard — ye" grammar is typed into `fill()` (`words.js:75-77`), even though the file has a `list.ye` entry (`:153`).
  - The engine writes English into events: "nothing" and "N coins" (`engine/index.js:1320,1703,1953`), plus the sea sentences.
  - One line is glued together in code from a name and a fragment (`stage.js:4406`).
  - The bake-off title is written twice by hand ("{who}'s Bake-Off" / "{who}, Yer Bake-Off"), picked in code (`bakeoff.js:188`). That is exactly the "write both forms" you said you don't want.
- **A line about a captain still gets a ready-made name, and the check misses it.** "battle.hit" gets `nm()` through a variable (`orchestrator.js:732-734`), so the captain who lands the hit never reads "ye". The name check only spots `pn(`/`nm(` written inside the call.
- **The biggest "one engine" gap is not on the map.**
  - **Battles are written twice:** once live in `orchestrator.js:635-890`, which moves coins and crates itself at `:651,822,873`, and once as the engine's `battle()` (`engine/index.js:1888`), which the engine's own bot turns use (`:2914`).
  - **Docking is written twice:** a human's dock pays in `flow.js:1884`, under a comment that says *"Keep this in step with Game.doDock or bots and humans diverge on the rule"* (`:1875`). A bot's dock pays in the engine (`engine/index.js:1079`).
  - **The crow's-nest bounty** is paid in display code (`flow.js:3612`).
  - I did not measure whether these copies disagree today. They are kept in step by hand.
- **Words are used as switches.**
  - The bake-off bench's title text is what silences the battle clash sound (`orchestrator.js:380,400,502`).
  - Which captain a narration bubble points at is sometimes guessed from a name's colour in the HTML (`stage.js:1786`).
- **The fork counter can't see a display fork the code calls a "declared gap".** It is `if(appState.isHost)return;` in `watchBattle` (`orchestrator.js:522`). The counter skips `orchestrator.js` on purpose, and never counts `strategy` or `room` checks.
- **Where the map is right (measured):** 343 entries and 11 ladders; `say`/`sayAll`/`sayText`; `flash()` picks per screen in every mode; one consumer, `eventDrawn` and `decisionIsLocal`.

---

## 3. Against your values

| Value | Verdict | Evidence |
|---|---|---|
| One engine: every screen reacts to one list of events | **HOLDS** | Host (`panel.js:230`) and guest (`orchestrator.js:1997`) both reach `consumeEvent`. |
| One engine: one set of rules | **DOES NOT HOLD** | Battles twice (`orchestrator.js:635-890` vs `engine/index.js:1888`); dock pay twice (`flow.js:1884` vs `engine/index.js:1079`); bounty in display code (`flow.js:3612`). |
| One display engine | **PARTIAL** | Right: one consumer, one narrator (`util.js:1881`), one prompt renderer for host and guest (`orchestrator.js:2062,1745`). Not yet: the host words nearly everything and ships HTML, and the battle card is host-drawn and guest-watched (`orchestrator.js:515-522`). |
| Words in one place for a reskin | **PARTIAL** | 343 lines and 21 parrot lines are in `words.js`. Still outside: 100 sea sentences, names, islands, directions, 21 recipes, `index.html` plus 5 pages, the "ye" grammar inside `fill()`, and English inside engine events. |
| Bots = humans | **PARTIAL** | Right: `say()` cannot see bot or human (`util.js:405-408`), and there is one narrator for both. Not yet: human and bot docks run different code. Bots never get the question a human gets, so "a bot may only do what the human menu offers" rests on care, not structure. That last point is my reading, not measured. |
| No mode forks in what a player sees | **PARTIAL** | 42 fork lines, held by a ratchet (measured). Some are your rulings, e.g. no skip button in crew or pass-and-play (`stage.js:1571-1577`). The counter can't see `orchestrator.js:522`, the online-only chat button (`stage.js:1598`), or `strategy` checks. |
| Nothing is a constant | **PARTIAL** | Right for amounts in lines, which come from the game's settings (`util.js:562,745`, `panel.js:1158`). Theme facts are typed into code: 4 captain names (`shared/index.js:616`) and 7 islands (`:232`). The order of ingredients and directions feeds the random board setup ("ORDER IS LOAD-BEARING", `shared/index.js:213, ~301`). |

---

## 4. Recommendations

**The known problem, numbered, so each recommendation can say how much it covers ("~N of 12"):**
1. Theme text outside the words file.
2. The pirate grammar typed into `fill()`.
3. Questions built where they're asked, sent as finished text through 5 doors.
4. Finished words stored inside events.
5. Battle rules written twice.
6. Dock and bounty payouts in display code.
7. No single answer to "who is looking, and in what setup".
8. Words used as switches.
9. Side doors around the grammar (text replace, name plus fragment, two bake-off titles, battle.hit).
10. Blind spots in the checks.
11. No test that real events give the right line on each screen. The existing golden test covers the sail animation only.
12. Sentences glued from fragments and plurals chosen in code. This blocks a second language and is mostly harmless for an English reskin.

**Sizes:** S = a few files · M = one subsystem · L = touches every turn. Ranked by value to you: Pasta Pirates within a year, a much bigger game, and crew play online.

### R1. A theme pack: all theme content as data, one folder per game
- **What you get:** Pasta Pirates starts as "copy the pastry folder, rewrite it, play it on staging". Pastry players see no change.
- **What goes in it:**
  - the words file;
  - captain, island, ingredient and direction names;
  - sea creatures rewritten once as `{p}` lines, deleting the 50 duplicate typings;
  - recipes;
  - the art and sound list (R10);
  - the page shell (R11).
- **Size:** M. **Covers:** 1 and most of 2 (~2 of 12), but that is the whole of the reskin's content problem.
- **Risk:**
  - Ingredient and direction order feeds the random board setup, so a pack must swap names and art into fixed slots and never reorder them.
  - A different *number* of ingredients is a rules change, not a skin. That is your call when you get there.
  - Old solo saves keep their old sea sentences (`util.js:498-507`) until R4.
- **Leaves undone:** questions, words inside events, the doubled rules.
- **Fits:** yes. It is one plain module per theme, with no build step.

### R2. One rulebook, with questions as engine events
*"Command pattern": the engine says, as data, "captain 2 must choose: buy or leave". A person answers on a screen, a bot answers in code, and only the engine applies the answer.*
- **What a player gets:** bots and people get the same menu, and a guest's question can never differ from the host's.
- **What you get:** each new action is written once, not two or three times, and the "keep this in step" comment (`flow.js:1875`) goes away.
- **Size:** L. **Covers:** 3, 5, 6 and most of 7 (~4 of 12).
- **Risk:**
  - Highest of all. It touches every turn: `flow.js` `:1869`, `:2237`, `:2503`, `:3119` and `orchestrator.js:635-890`.
  - The answer log stores which button was pressed (`util.js:1600`), so older solo saves would be refused. The game already refuses those safely (`util.js:2183`).
  - Convert one question at a time, the way `storyboard.js` converted one event kind.
- **Leaves undone:** the theme.
- **Fits:** yes. The remote answer path already exists (`orchestrator.js:1661-1688`).
- **If the battle card is going away** (your 2026-09-13 note), rebuild the battle this way rather than polishing the card.

### R3. Finish the "presenter" layer
*A presenter is one pure function: event + game snapshot + who is looking → what to draw and which lines to say.*
- **It already has a plan:** `.planning/architecture-one-director.html`, section "Four layers". Its first piece is `present()` in `storyboard.js`, which handles the sail animation only.
- **Next step:** move `EVENT_NARRATION` (`util.js:510-747`) in. Today it reads live game state (`:562,745`) and the host's names (`:377-401`); it would be handed them instead.
- **What a player gets:** nothing at first. Then every screen words each event itself, so "the guest read the host's version" bugs can't happen.
- **Size:** M. **Covers:** half of 7 directly, and makes 4 and 11 cheap.
- **Risk:** low, done one event kind at a time.
- **Leaves undone:** questions.
- **Fits:** exactly. `src/shared/` is already checked to stay pure.

### R4. Words cross the wire, and live in events, as "line id + facts"
- **Where:** narration, question text, labels, reasons, slider texts, the baker's name, and the engine's "nothing", "N coins" and sea sentences.
- **What a player gets:** a guest reads "ye" in every question and battle line, exactly like the host.
- **What you get:** old voyages replay in a new theme's words.
- **Size:** M. **Covers:** 4, the wire half of 3, and part of 9 (~2 of 12).
- **Risk:** a room with a new host and an old guest. Send the finished text beside the id for one release; the code already adds fields this way (`util.js:1561-1576`).
- **Leaves undone:** who builds the question (R2).
- **Fits:** well. `words.js` imports nothing (`words.js:39-43`), so every device already has the whole table.

### R5. One "view context": your four variables, made real
- **The shape:**
  - `view = {viewerSeat, sharedDevice, online, computesGame}`, built in one function.
  - `actor = {seat, isPerson, answersHere}` for each event.
  - Later, `setup = {board, recipes, theme}`.
  - There is no mode name; capabilities stand in for it, as `visibility.js` already does.
- **Pushback:** give the display everything *except* player type. `say()` is deliberately blind to bot or human (`util.js:405-408`), and that blindness is what guarantees bots and humans get the same words. Only the bot badge needs to know.
- **Size:** S. **Covers:** 7 (1 of 12), and it makes R2 and R3 cheaper. **Risk:** low.

### R6. The grammar moves into the words file
*"ICU-style": the industry's standard notation for plurals and "you vs a name" choices inside one sentence.*
- **What moves:**
  - "ye / yer / Crustbeard — ye" and possessives (`words.js:75-82`);
  - one-or-many choices (`util.js:732-733`, `storm.holds.one/many`);
  - list joining (`util.js:711-716`, `bakeoff.js:168`).
- **How:** extend `fill()` rather than add a library.
- **What you get:** Pasta's voice ("you", or Italian-flavoured) needs no code.
- **Size:** S. **Covers:** 2 and 12 (2 of 12).
- **Risk:** every line re-renders. The words check already renders all 343 for every viewer; add a before/after diff.

### R7. A "golden" test of real lines, plus a pseudo-theme
*Golden test: a committed file of what every line said in recorded voyages, per screen. It fails when a line changes without anyone meaning it to. Pseudo-theme: every word replaced by its id, so any readable English left on screen is a leak.*
- **What you get:** a readable diff whenever lines change, and a staging link (`?theme=ids`) where a leak is obvious on your phone.
- **Size:** S, after R3. I did not check whether the narrator can run without a browser today.
- **Covers:** 11 and part of 10 (~2 of 12).
- **Fits:** yes. Recorded voyages already exist (`scripts/fixtures/storyboard/events.jsonl`).

### Smaller ones

| # | What | What you get | Size | Covers | Risk | Fits? |
|---|---|---|---|---|---|---|
| R8 | Widen the checks: scan engine, shared, net and all HTML; catch names passed through variables; forbid `.replace("{`; count `strategy`/`room` forks and `orchestrator.js` display forks, with an allowed list. | Leaks caught before you see them | S | 10 | Red on day one; use the existing ratchet | Yes |
| R9 | Stop using words as switches: mark the bench `kind:"bake"` (`orchestrator.js:380,400,502`); take the bubble's captain from the event only (`stage.js:1786`). | A Pasta title can't turn the battle clash on during a bake-off | S | 8 | Low | Yes |
| R10 | One art and sound list per theme. Today it is spread across `EMOJI_IMG` (`shared/index.js:139`), island art (`:209`), pastry art (`recipe.js:318-335`), `EVENT_SOUND` (`audio.js:275`) and the preload list (`util.js:2105-2160`). | Pasta art drops in by filename; a missing file fails a test, not your phone | S–M | part of 1 | Low | Yes |
| R11 | Theme switch on staging only (`?theme=pasta`, like `?ovens=1`), plus a second page shell per theme | Play Pasta on staging while players keep Pastry; no words blinking in | S | delivery | Low | Yes |
| R12 | Theme completeness check: every line, every ingredient's name, art and island, enough sea creatures, valid recipe orders | A half-finished pack can't reach staging | S | 10 | Low | Yes |
| R13 | Version each event and upgrade old shapes when read ("upcasting"; `fixEv` already exists, `util.js:2326`) | Old voyages still replay after R4 | S | part of 4 | Low | Yes |
| R14 | Seeded simulation on the *one* rulebook, after R2. Today the engine's own bot turns use `engine.battle` (`:2914`), while players get `orchestrator.js`'s battle. So headless bot tuning measures a fight nobody plays; that is inference, not measured. | Bot tuning tests the real game | M | checks 5 | Binding a test corpus is your ruling (CLAUDE.md) | Yes |
| R15 | A second language | Nearly free after R1, R4 and R6. Each screen words its own lines, so two crewmates could even read two languages | the translation | 12 | Phone text limits, e.g. 34-character recipe steps | Yes |

---

## 5. What NOT to do

- **No framework, build step or TypeScript.** React or Redux would fight "vanilla modules in Safari and Chrome" for no gain to players.
- **No translation library.** `fill()` is about 30 lines and already does the hard part ("ye" on the reader's own screen). A library adds a download and would still need that logic. This is my opinion.
- **Don't pass player type to the display.** It reopens "bots and humans read different words".
- **No server-run game** (Cloud Functions, cheat-proof servers). One host sending events works; server authority is anti-cheat you don't need.
- **No full event-store machinery** (read models, projections). The event list and answer log already cover it.
- **Don't design for many themes or mods.** Design for two. A third will show what to generalise.
- **No content pipeline** (spreadsheet, export, import) and no in-game theme switcher. One file per theme that your review page reads directly is what already worked, and CLAUDE.md says not to build tooling when the ask is the game.
- **No rollback or lockstep networking.** Those are for fast action games; this is turn-based with one host.
- **No big-bang rewrite.** Convert one kind at a time.
- **Don't translate before the reskin** has proved the seams.

---

## 6. A phased path

**Phase 1: the narrator goes pure and gets a golden test.** (S–M; players see nothing)
- **What:**
  - Move `EVENT_NARRATION`, `narrationSubjects`/`narrationVariants` and `seaLine` into `src/shared/`, handed the snapshot, settings, names and viewpoint.
  - Record golden lines per screen.
  - Fix the two words-as-switches.
- **Why first:** every later step moves words or rules, and this is the net that catches mistakes. It moves no theme text, so it respects your "don't do anything yet".
- **Files:** `src/ui/util.js`, new `src/shared/narrate.js`, `src/shared/storyboard.js`, `src/orchestrator.js` (380, 400, 502), `src/ui/stage.js` (1786), new `scripts/qa/narration_golden_check.mjs`, `package.json`.

**Phase 2: one view context and wider checks.** (S)
- **Files:** `src/ui/util.js` (1999–2023), `src/shared/visibility.js`, `src/shared/storyboard.js` (213), the `mySeat`/`passAndPlay` readers in `flow.js`, `stage.js`, `lobby.js` and `board.js`, `scripts/qa/words_one_place_check.mjs`, `scripts/mode_fork_check.js`.

**Phase 3: line ids on the wire and in events.** (M)
- **Files:** `src/net/writers.js` (56, 79, 127, 141), `src/orchestrator.js` (205, 243, 552–600, 710–833, 1661, 1692, 2001, 2202), `src/ui/util.js` (1565, 1597), `src/ui/flow.js` (840, 928–940, 3544), `src/ui/panel.js` (1220), `src/engine/index.js` (1320, 1703, 1953, sea creature storage), `src/ui/bakeoff.js` (188), `src/ui/stage.js` (4406).

**Phase 4: the theme pack, when you say go.** (M)
- **What:** grammar into the words file; sea creatures as single lines; names, islands, recipes, the art and sound list and the page shell; `?theme=` on staging; the completeness check.
- **Files:** `src/shared/words.js` moves into a theme folder; `src/shared/index.js` (225–304, ~346–447, 616), `src/ui/recipe.js`, `src/shared/recipe-steps.js`, `src/ui/audio.js` (275), `src/ui/util.js` (2105–2160), `index.html` and the about, credits, rules, privacy and stats pages, `scripts/module_graph_check.js`.

**Phase 5: one rulebook, questions as events, one kind at a time.** (L)
- **Order:**
  1. Dock (deletes the copy at `flow.js:1884`).
  2. Crow's-nest call (moves the payout at `flow.js:3603-3620` into the engine).
  3. Battle (deletes the rules copy at `orchestrator.js:635-890`, and replaces the battle card if you retire it).
  4. Trade.
  5. Action menu.
  6. Recipe draft and intro.
  7. Bake-off.
- **Files:** `src/engine/index.js`, `src/ui/flow.js`, `src/orchestrator.js`, `src/ui/util.js` (`ask`, save version at 2183), `src/net/writers.js`, `scripts/dlog_replay_test.js`.

**Phase 6, only if wanted:** a seeded test corpus bound to the one rulebook (your ruling), then a second language.

---

## Files read
- `/Users/wyattroy/Documents/Projects/pastrypirates/.claude/worktrees/google-search-console-020493/.claude/CLAUDE.md`
- `…/.planning/CEO-REVIEWS.md` (top entry)
- `…/.claude/memory/DECISIONS.md` (searched; lines 2895–2912, 2980–3091)
- `…/src/shared/words.js` (whole)
- `…/src/ui/util.js` (370–869, 1455–1764, 1795–2054, function index)
- `…/src/orchestrator.js` (195–634, 700–760, 1655–2294, function index)
- `…/src/ui/panel.js` (236–246, 1130–1303)
- `…/src/ui/flow.js` (100–160, 836–870, 925–945, 1872–1892, 2880–2895, 3290–3348, 3510–3634, searches)
- `…/src/shared/storyboard.js` (1–216), `…/src/shared/visibility.js`, `…/src/shared/host.js` (head)
- `…/src/shared/index.js` (215–308, 330–460, searches)
- `…/src/engine/index.js` (1074–1100, 2905–2916, searches)
- `…/src/ui/recipe.js` (44–56, searches), `…/src/shared/recipe-steps.js` (1–40)
- `…/src/net/writers.js` (79–91, function index)
- `…/src/ui/lobby.js` (468–480), `…/src/ui/board.js` (1750–1765), `…/src/ui/audio.js` (275–300), `…/src/ui/stage.js` (1570–1600, searches), `…/src/ui/bakeoff.js` (searches)
- `…/index.html` (text scan)
- `…/scripts/qa/words_one_place_check.mjs` (whole, run), `…/scripts/qa/one_display_door_check.mjs` (whole, run), `…/scripts/mode_fork_check.js` (whole, run), `…/scripts/ui_contract_check.js` (header), `…/scripts/qa/storyboard_golden_check.mjs` (header), `…/package.json` (test script)
- `…/.planning/architecture-one-director.html` (section titles)

(`…` = `/Users/wyattroy/Documents/Projects/pastrypirates/.claude/worktrees/google-search-console-020493`)

---

## 2026-09-14 · `fb1da47f` · AUDIT: does every line of narration come from one place, and are the pictures still in the lines? · **PARTIAL. THE PICTURES ARE ALL THERE AND ONE NARRATOR SERVES BOTS AND HUMANS — BUT "EVERY LINE IN ONE PLACE" IS NOT TRUE YET, AND THE WORDS CHECK CLAIMS MORE THAN IT CAN SEE.**

**Reviewed:** dev `fb1da47f`, staging `2026.09.14.1-staging@fb1da47f`. Verbatim below, including its closing note that it was read-only and did not write this entry.

## THE ONE SENTENCE FOR WYATT (read this first)

> **Your two worries are answered well: every picture that was in a line is still in it (I recounted them all myself; the only pictures that went left with lines you cut, and you were told which), and bot and human moves now go through one narrator. But "every single line in one place" is not true yet. The 100 sea-creature sentences, the recipe book, the welcome screen and a few buttons like "Change yer name" and "FLIP" still live outside the words file. And the automatic check that announces "everything a player reads comes out of words.js" cannot see them.**

**How I checked:** I read the code at `fb1da47f` and ran the words check myself (it passes). I pulled every line with a picture from before the work (`95e1bcd7`) and matched each one against today's words file. I searched all of `src/` with my own scan instead of trusting the CTO's, and fetched staging. No browser or server was started and nothing in the repo was edited. My probe scripts are in `/private/tmp/claude-501/ceo-probe-narration/`.

---

## 1. Each thing he asked for

### (a) "All narration now comes from one consistent narration engine instead of being passed as variables through different weird places": **PARTIAL**

**Done, and checked:**
- **The words really are in one file.** `src/shared/words.js` holds 331 entries and the parrot's 11 tutorial scripts. Every entry renders cleanly.
- **Staging runs exactly this.** It serves `2026.09.14.1-staging@fb1da47f`, and its `words.js` is byte-for-byte identical to the repo's.
- **One narrator for things that happen in the game.**
  - A human's move reaches it through `src/ui/panel.js:1135-1137`, a bot's through `src/ui/util.js:1986`. Both call the same `narrateEvent` at `util.js:1903`.
  - The start of a turn is narrated once, at `src/ui/flow.js:2891`, before the code splits into a human turn and a bot turn (`flow.js:2892`).
  - A battle opens with one line for both kinds of captain (`src/orchestrator.js:648`).
- **Bots and humans get the same words.** I searched for any line picked by bot-versus-human. The only hit is `orchestrator.js:870`, and that is a question only a person gets asked, not a different description.

**Not done:**
- **The words are in one place; the moments that say them are not.** About 340 spots in 8 files each build their own sentence and hand it on: flow.js 119, util.js 82, orchestrator.js 61, stage.js 25, bakeoff.js 22, board.js 17, panel.js 7, lobby.js 6. There are also 64 direct calls that show a line on screen. Questions, cards, the battle play-by-play and wait lines still go "through different weird places". The CTO admits this (gap b).
  - For Pasta Pirates this does not stop you changing words. It does mean "one engine" describes the words, not the delivery.
- **There are two kinds of captain placeholder, not one grammar.**
  - Only 9 calls hand the words file a *captain*, which becomes "ye" on that captain's own screen.
  - 44 calls hand it a *ready-made coloured name*, which can never become "ye": flow.js 26, orchestrator.js 14, board.js 3, util.js 1. Examples are `flow.js:2146` (a counter-offer) and `orchestrator.js:870` (the plunder choice).
  - At those 44 spots, the code picks name-or-"ye", not the words file. I did not see one wrong on screen; these lines are probably only shown to someone else. But a Pasta Pirates writer will meet `{p}`, which turns into "ye", and `{name}`, which never does.
- **One deliberate change from his wording.** He asked for an engine that takes "the player type (human/bot)". The CTO left that input out on purpose (`util.js:401-408`), so a bot and a human *cannot* be described differently. That fits the project rule. He should be told in one plain line that this was a choice, not an oversight.

### (b) "Very easily change every single line of narration and dialogue" for Pasta Pirates: **PARTIAL** (partly by his own "don't do anything yet")

Still outside `words.js`:

| What | Where | Admitted? |
|---|---|---|
| **50 sea-creature sightings = 100 sentences**, each written twice by hand ("ye peep into…" / "{} peeps into…"). Spoken in every Muse line. | `src/shared/index.js:347-448`; "ye" chosen in code at `util.js:514` | Yes (gap a) |
| Island names, dock flavours, default captain names | `src/shared/index.js:232-233, 616` | Yes |
| Recipe book (~235 wordy strings) and bake-off step names (~105) | `src/ui/recipe.js`, `src/shared/recipe-steps.js` | Yes |
| Welcome screen, menus, rules (~160 runs of text) | `index.html` | Yes |
| **"Change yer name"** button, in pirate voice | `src/ui/lobby.js:469` | **No** |
| **"FLIP"** on the coin | `src/ui/board.js:2526` | **No** |
| Tooltips "— that's you!" and "🤖 bot (strategy)" | `src/ui/util.js:163` | **No** |
| Screen-reader label "Back" | `util.js:1513` | Partly (gap d names aria labels) |
| "📜 recipe name" inside the victory line | `recipe.js:356`, used at `board.js:2180` | **No** |

Dead words also remain in code. No player sees them, but a reskinner searching for "bakery" will trip on them:
- The captions table, with "⚔️ wins!", "🏃 flees!", "🧁 fired up the bakery" and "🌊 looks into the ocean" (`util.js:587-763`). Nothing calls `captions()` (`util.js:906`), and the code itself says "Nothing renders caps" (`util.js:762`).
- `windHoldPhrase`, "this northerly won't quit" (`util.js:453-457`), which has no caller.

### (c) "Make sure images were not taken out of the lines; if they were, tell me which": **DONE, independently confirmed**

**Method:** I took every piece of text with a picture in the 9 game code files before the work, and matched each one by shared words to its entry today. I read by hand all 21 lines where the match seemed to lack a picture, plus every picture type whose count fell.

**Result:** 174 picture uses before, 162 after. Every drop is explained:
- **The "ye" and third-person copies of one line became a single entry:** ⚔️ 24→17, 🔭 9→5, 🤝 8→4, 🏃 6→4.
- **Lines he cut entirely.** The CTO told him about these by name: turn banners ⛵🧭, final-round card 🏁⛵🦜, the old "returns with a full recipe" line 🏁, the old bakery line 🧁, flip announcements ⚪⚫.
- **The 🤝 stamps over the boats**, which he chose to remove.

**All five restores are present:**
- Dock lines ⚪ ×4 and ⚫ ×4 (`words.js:105-112`).
- Downwind hit ⚪ and crosswind miss ⚪ (`words.js:307-308`; before the work these were `orchestrator.js:724/726`).
- "⚫ Both miss." (`words.js:310`).

**The lines I suspected all still have their picture:** 🪨 `words.js:287`, 🏴 `:369`, 🔭 `:270`, ⚔️…🌕 `:265`, 🌊 `:144`, 🏃 `:126`.

**I found no picture lost that he wasn't told about.**
- **Limit:** the matching is approximate. A coin lost on one line and gained on another could hide (🌕 went 38→46).

### (d) His ruling "ye everywhere" (solo too): **DONE in code, not yet seen on screen**

- **Solo and crew now use the same rule.** Both places that pick a line now pick this screen's version in every mode: `panel.js:1270` and `orchestrator.js:210`.
- **Pass-and-play follows the phone.** "Ye" goes to whoever has the phone, because the hand-over sets it (`lobby.js:413, 421`).
- **No choice of words depends on the game mode any more.**
- **Only labels still differ by bot or human:** `lobby.js:459-460` and `util.js:163`. They say what a seat *is*; they don't describe a move.

---

## 2. Delivered but not asked for

- **The deletions came from his own narration pass**, so they were asked for. That covers the old day loop, the "Pass the board" overlay, "Drumroll…", the banners and the handshake stamps (`lobby.js:417-419` quotes his "cut it if not").
- **The words check** (`scripts/qa/words_one_place_check.mjs`, 191 lines) is tooling. It is defensible as the guard for his architecture ask and displaced nothing. It is also the thing that overclaims (§3).
- **Not displaced, but not addressed:** the only finished sea trial containing this work failed 10 of 10.
  - It ran on build `2026.09.13.5`, which includes `1b9e3698` (checked in git). See `.planning/SEA-TRIAL.md:3`.
  - Its failures are features offered but never tried, plus **12 screens the picture-judging check flagged, across 5 voyages** (`SEA-TRIAL.md:47,54,59,70,76`). The report says "OPEN THESE".
  - The account says nothing about anyone opening them. The trial on `fb1da47f` is still not back.

## 3. Claims the repo does not support

1. **"No sentence typed into the game code near a display call" and "everything a player reads comes out of words.js"** (`words_one_place_check.mjs:145`). This is only true of what the check looks at: text sitting next to a fixed list of display calls (`:100`).
   - It skips any all-capitals word of four letters or fewer (`:120`), which is how "FLIP" gets through.
   - It exempts **all of `recipe.js`** with an empty-text rule that matches everything (`:89`). The rule that spots out-of-date exemptions skips empty ones (`:146`), so this one is never flagged.
   - It misses `lobby.js:469`, `board.js:2526`, `util.js:163` and `util.js:1513`.
2. **"No picture typed into a line in that code (2 listed exceptions)"** (`:176`). This is contradicted by four spots. All four pictures are game art, so they are still on screen and nothing is lost; the claim is just untrue.
   - `flow.js:2143` and `flow.js:2413`: a 🌕 typed inside the counter-offer lines.
   - `stage.js:1407`: ⛈ in the forecast pill.
   - `recipe.js:356`: 📜 in the victory line.
3. **"The counter-offer circle's 🌕 moved into words.js."** It moved for one spot (`flow.js:2435`). The same coin is still typed 22 lines above in the same function (`flow.js:2413`) and again at `flow.js:2143`.
4. **The file header says "The 'ye' forms are derived by fill(), never typed"** (`words.js:21`). The sightings have "ye" typed by hand 50 times (`src/shared/index.js:347-448`). The account admits the sightings are outside; the header states the opposite.
5. **"The ye/name choice depends only on which screen is reading."** True for event lines. Not true at the 44 calls that pass a ready-made name (§1a).
6. **Two code comments now say the opposite of the code they describe.** `panel.js:1244-1247` explains why it picks "only when `appState.room` is set", and `orchestrator.js:2193-2195` repeats it. Since `fb1da47f`, `panel.js:1270` picks in every mode.

**Checked and true:** 331 entries, 11 parrot scripts, gates total 114 (`package.json:6`), staging serving `fb1da47f`.

## 4. Is the last verdict's fault fixed, or back in new clothes?

**Back, in new clothes.** Last time a check passed where it looked (the corners of the picture, one direction) and was read as a pass everywhere. This time the words check looks only at text beside certain display calls, in 17 files. It waves through short capital words and all of `recipe.js`. Then it prints "everything a player reads comes out of words.js". The picture check looks in the same limited places and makes the same universal claim.

In fairness, the CTO's own account says "the guard is a heuristic" (gap d), which is better disclosure than last time. But the check's output and account item 7 still say the general thing.

"No one looked" also recurs. Nothing was seen on screen after `fb1da47f` (gap e), although the solo "ye" change rewords every solo line.

## 5. Did the CTO spend its own head on bulk reading?

**None I can prove.** I cannot see the session transcript. The scratchpad suggests the right habit: results were written to files rather than dumped into the conversation (`text_sites.txt` 207 lines, `npm_test.log` 105 KB, patch scripts up to 42 KB). I cannot tell whether the 105 KB test log was then read whole.

The one read the account describes, checking about 174 picture lines by hand, caught dock lines its script missed. That is judgment, not a fault.

The reading that belongs in the main thread, looking at the running game after `fb1da47f`, did not happen.

---

**Not done by me:** the brief asks for this verdict to be added to `.planning/CEO-REVIEWS.md`. Your rules for me said read-only, so I did not write it. Whoever launched me should record it.

---

## 2026-09-12 · `d227e12d` · AUDIT: is the plaque keyed out, and is the X fixed? · **TWO OF THE THREE PICTURES ARE PROPERLY CUT OUT. THE LAPTOP ONE IS NOT — IT IS STILL A RECTANGLE OF WOOD.**

**Its one sentence for Wyatt, verbatim:**

> **The white is genuinely gone from all three pictures — you were right, it was there, and it has
> been removed — but only two of the three plaques were actually cut around the rope: the one your
> laptop and desktop use is still a rectangular slab of wood with the corners nicked off, so on a big
> screen you will still see a hard straight edge of bare plank above and to the left of the rope
> instead of the page behind it.**

**Reviewed:** commit `d227e12d` on `dev`. Method: read the three PNGs' actual bytes with node
(IHDR / PLTE / tRNS chunks, then inflate the image data and decode every pixel's alpha), rendered a
3× magnified corner line-up of all three on a magenta ground so transparency is unmistakable, and
read the CSS and the two QA scripts. **No browser and no server was started** (per the brief). The
repo was not edited except for this entry. Probe scripts lived in the CEO's scratchpad.

---

### 1. For each thing he asked for

#### (a) "Key it out for all sizes" — **PARTIAL. Two of three.**

Every PNG does have a real alpha channel, so the headline claim is not a fabrication: all three are
8-bit **palette** PNGs (IHDR colour type **3**) carrying a `tRNS` chunk, and **all four corners of
all three decode to alpha 0** — fully transparent. Decoding the whole image, **not one of the three
has a single near-white opaque pixel** (`r,g,b` all > 235: **zero**, in all three). *The white
background he photographed is really gone.* That much is DONE and I can prove it.

But "keyed out" means cut around the object, and that is where they part company:

| | phone.png | column.png | tablet.png |
|---|---|---|---|
| size | 760×495 | 1024×597 | 1024×412 |
| `tRNS` alpha entries | **77 partial + 1 clear** | **1 clear, 0 partial** | **28 partial + 1 clear** |
| transparent + part-transparent | 1.19% + 1.35% | **0.35% + 0.00%** | 1.34% + 1.07% |
| how deep the cut goes from the top edge | max **77 px**, mean 3.2 | max **22 px**, mean **0.1** | max **231 px**, mean 3.1 |
| opaque pixels along the very top row | 330 / 760 | **1002 / 1024** | 71 / 1024 |

**`column.png` is 99.65% kept.** The brief warned me an earlier run reported "100% kept" for this
picture; that warning was real and is only cosmetically resolved. Its whole transparent area is a
nick at each corner no more than 22 px deep on a 1024-px-wide image — about 2%. And its `tRNS` chunk
has exactly **one** entry, meaning a hard on/off cut with **zero** anti-aliased edge pixels, where
the phone picture has 77 and the tablet 28. **These three files are not the output of one consistent
process**, whatever `scripts/art/key.mjs` was asked to do.

The magnified corner line-up settles it by eye: on phone and tablet the rope is the outer edge and
the page shows through outside it; on **column** there is a band of **bare wood outside the rope,
sliced flat by the canvas edge** along the top and the left. Sampling the outer edge ring, **89 of
124 sample points on column.png are opaque**, mean colour `rgb(122,83,48)` — brown plank, not
background. On phone only 8 of 122 are opaque; on tablet 24 of 124.

So: **phone DONE · tablet DONE · column NOT DONE.** He said "for all sizes", and the size he sits in
front of on a laptop is the one that missed.

#### (b) "Ensure the entire plaque is visible within the screen area" — **NOT DONE, and the check cannot fail.**

The cited evidence is `overflowsLeft: 0, overflowsRight: 0` from
`scripts/qa/_modal_and_plaque_look.mjs:38`. That check reads `#pp4Cap.getBoundingClientRect()` and
compares it to `innerWidth`. **`#pp4Cap` is a block element filling its column — it can never report
a horizontal overflow.** The two numbers are zero by construction, at every screen size, on every
build, before and after this commit. *A check that cannot go red is not a measurement.* It also
tests the **box**, never the **picture** inside it.

And the picture is the thing he photographed. `index.html:3524` sets
`background: url(...) center / 100% 100% no-repeat`. **`100% 100%` stretches** the image to the box's
exact shape, ignoring its real proportions. By the CTO's own reported number the box measured
`w390 h217` — **1.80 : 1** — while `phone.png` is 760×495 = **1.54 : 1**. That is a **17% horizontal
stretch** on a picture of twisted rope.

This flatly contradicts the repo's own claim. `index.html:3509-3511` states the box "lands at
390x243 … about 1.60 : 1.68 : 2.46" and that "the worst stretch anywhere is **4%**". The measurement
taken for *this* commit says the phone box is **217 px tall, not 243** — 12% shorter than the comment
assumes, which is precisely where the extra stretch comes from. **One of those two numbers is wrong
and nobody noticed they disagreed.** I cannot settle which without a browser, and the brief forbids
one, so I report it as what it provably is: *a contradiction inside the CTO's own evidence*, not yet
a confirmed on-screen defect. One posed screenshot at 390 wide would close it.

#### (c) "The x button is misaligned and the wrong color" — **alignment DONE; colour FIXED but the stated reason is false.**

**Alignment: genuinely fixed, and the mechanism is right.** `index.html:365` is now
`align-items: flex-start` (was `center`). The X is injected into the card (`src/orchestrator.js:2945`)
and pinned at `top: 14px` (`index.html:392`); the title row's top padding is `14px`
(`index.html:372`), so with `flex-start` the icons sit at the same 14 px. I checked the detail the
claim skipped: **the X and the icons are both 38×38** (`index.html:392` and `index.html:387`), so
aligning their tops also aligns their centres. This holds.

**Colour: the cyan is really gone — the explanation is arithmetic that does not survive checking.**
`brightness(0)` first does flatten any source hue to black, so the cyan he photographed cannot
recur. But the comment at `index.html:396-398` claims "sepia+saturate warms the white to the card's
cream." I ran the filter chain through the spec's own colour matrices. Starting from black,
`invert(1)` → `rgb(255,255,255)`; `sepia(.35)` → `rgb(255,255,249)`; `saturate(2.2)` →
`rgb(255,255,243)`; `hue-rotate(-12deg)` → `rgb(255,254,244)`; and then the trailing
**`brightness(1.06)` multiplies it straight back to `rgb(255,255,255)`.** The final X is **pure
white**. The card's cream is roughly `rgb(253,245,225)`. **The last four steps of that filter are
dead weight and the comment describes an effect that does not happen.** White may well be the right
answer — but the code says it is doing something it is not, and the next person will believe it.

---

### 2. Delivered but not asked for

Two things rode along in the same commit:

- **`src/ui/audio.js` (+46) and `scripts/qa/w36_music_resumes_check.mjs` (+58)** — the W3-6
  music-resume work. The CTO's own account says that check is **RED** (start offsets read `[0,0]`).
  A known-broken feature is bundled into the commit he is being asked to approve for the plaque and
  the X. It displaced nothing, but it means staging now carries a feature its own instrument says
  does not work, inside a release whose stated subject is two art fixes.
- **`package.json` weight ceiling raised.** PNG is heavier than JPEG, so the gate was moved to let
  the art through. This is defensible — the files *were* quantized to 0.86 MB total, which matches
  the claim — but it is a gate loosened, and it is the second commit in a row to loosen it.

### 3. Claims unsupported by what is in the repo

1. **`package.json`** — the account says `ceilingBytes` was raised "4194304 -> 5138022". In *this*
   commit it went **4561920 → 5138022**. The 4194304 figure belongs to the previous commit
   `dc0bbf2f`. Small, but it is the CTO misreporting its own diff.
2. **`index.html:3511`** — "the worst stretch anywhere is 4%" is contradicted by the CTO's own
   measurement of the same box in the same commit (17%, per §1b).
3. **`index.html:398`** — "sepia+saturate warms the white to the card's cream." It does not; the
   result is `rgb(255,255,255)` (per §1c).
4. **The account's framing that all three pictures were keyed by one process** is contradicted by
   the files themselves: 77 / 1 / 28 partial-alpha entries (per §1a).
5. **No one looked.** `scripts/qa/_modal_and_plaque_look.mjs:42,58` writes `look-plaque.png` and
   `look-modal.png`, and the script's own header (`:1-4`) says both things "were *verified* by
   reading CSS last time, which is how they shipped wrong." **Neither screenshot exists anywhere in
   the tree.** This repo commits posed screenshots as a matter of course (`.planning/posed/` holds
   dozens). There is no artefact showing anybody looked at the rendered result. That is the fault
   "Did you QA any of this??" names, and on the evidence in the repo it has not changed.

### 4. Is the last verdict's fault fixed, or recurring?

**RECURRING, in new clothes — the same shape, twice.** The previous verdict's fault was *a guarantee
pinned to one direction that reads as a general guarantee*: a rule that stopped the board being
**shorter** than a square and said nothing about **taller**.

Here it happens twice over:

- **The keying was checked at the corners.** The corners are the one place where all three files
  pass. Check the **edges** and column.png fails outright (1002 of 1024 top-row pixels opaque). A
  pass at one location, read as a pass everywhere.
- **`overflowsLeft` / `overflowsRight`** measure the horizontal axis only, on the box only. Nothing
  looks at the vertical, and nothing looks at the picture — which is the axis the stretch is on.

Same mistake, one axis over, exactly as last time.

### 5. Did the CTO spend its own head on reading it could have delegated?

**None that I can name — and I want to be precise about why.** The account handed to me describes
*what was built*, not *how it was read*, so there is no record of file-reading to audit. What I can
see is circumstantial and points the right way: the commit is 11 files and 184 lines, which is not
the signature of a session that had filled itself with bulk file contents. I found no evidence of
whole files read to find one rule, no trial reports read line by line, no git archaeology in the
main thread. **I am not going to invent a finding to fill this slot.**

One thing I will say in the other direction, since the brief asks me to flag the inverse fault: the
reading that *should* have been in the main thread — **looking at the rendered picture** — is the
reading that did not happen at all (§3.5). The failure here is not too much reading. It is too
little looking.

### 6. One sentence

At the top of this entry.

**Housekeeping, observed not acted on:** the 44 dead `.tmp-*` Chrome profile directories the last
CEO reported are still in this worktree, and the probes in this commit create more of the same shape
(`.tmp-look-<pid>`, `.tmp-capshape-<pid>`). Still not the CEO's to delete.

---

## 2026-09-12 · `be8a5208` · AUDIT: is the board drawn as a square? · **HE IS RIGHT — THE FRAME IS NOT SQUARE, THE BOARD INSIDE IT IS**

**Reviewed:** Wyatt's *"the board is always supposed to be viewed in a square, and it looks like that
square is slightly rectangular now, at least on mobile. I would like you to have the CEO check that
and audit that."* Measured, not read: a real solo game posed in headless Chrome (mobile emulation,
deviceScaleFactor 2) at nine viewports across three builds, via `scripts/mp_rig.mjs`
(serve/launch/attach/killAll). Every number below is off `getBoundingClientRect` and
`getScreenCTM` in the live page. Probes lived in the CEO's scratchpad; the repo was not edited.

**Its one sentence for Wyatt, verbatim:**

> **You are right and your eye is calibrated: the white rounded frame around the sea is 375 wide by
> 421 tall on your iPhone — 46 px taller than a square — but the board *inside* it is drawn perfectly
> square and nothing is stretched, so this is a frame that is too tall, not a board that is squashed;
> and it has been exactly this shape since before tonight, so nothing tonight broke it.**

### What is square, measured

| viewport | the framed board window | verdict |
|---|---|---|
| 375×635 (iPhone, older Safari bars) | **375 × 375** | square |
| 375×670 | **375 × 375** | square — the exact boundary |
| 375×690 | 375 × 395 | 1 : 1.05 |
| **375×716 (his iPhone, Safari bars showing)** | **375 × 421** | **1 : 1.12 — 46 px too tall** |
| 375×812 (full screen) | 375 × 517 | 1 : 1.38 |
| 390×664 | **390 × 390** | square |
| 390×844 | 390 × 549 | 1 : 1.41 |
| 1280×800 laptop | **756 × 756** | square |
| 1920×1080 | **1036 × 1036** | square |

**The board itself is square everywhere, at every zoom.** The SVG's own screen matrix has identical
x and y scale to five decimal places at every size measured (e.g. 1.10734 / 1.10734), and a grid
square — 42.667 board units — renders **47.247 × 47.247 px**. Nothing on the board is stretched, and
no cell is a rectangle. `preserveAspectRatio` is `xMidYMin meet` throughout, which makes that true by
construction. The board art is a square asset (`assets/board.webp`, 2132 × 2132).

### Where the squareness is lost — three lines, and the third is the one he can see

1. **`src/ui/stage.js:894-896`** — the square rule is a **floor, not an equality**.
   `squareRoom = Math.max(64, vhPx() - ribH - vwPx() - phoneFootReserve)` then
   `CAP_BASE = Math.min(250, S.capNeed || …, squareRoom)` then
   `availH = Math.max(200, vhPx() - ribH - CAP_BASE - phoneFootReserve)`.
   `Math.min(…, squareRoom)` stops the strip being **shorter** than a square (the 2026-08-23 fix,
   "the board's square outranks the captains card"). Nothing stops it being **taller**. The strip is
   simply whatever is left after the captain's box takes what it measures — 209 px — so it is
   `vh − 86 − 209` where a square would be `vw`.
   **The derived rule, verified at four heights and correct at all four:** the window is square only
   while the page's visible height is at most **board width + 295** (295 = 86 px top band + 209 px
   captain's box). Above that it is exactly `height − width − 295` px taller than a square.
2. **`src/ui/stage.js:901-903`** — `aspect = availH / vwPx(); h = c.w * aspect; if (h > 640) h = 640`.
   While the camera is fully zoomed out, `h` clamps at 640, the square board letterboxes inside the
   tall strip, and `boardBottom` (`:916`) pulls the captain's box up to meet it — so at the recipe
   screen the visible sea still *reads* square. The instant the director zooms in, `h` drops below
   640, the viewBox takes the **strip's** shape, the sea fills the whole strip and the card drops
   away. Measured at 375×812: captain's box top **461 at the opening, 599 after 14 s of play**.
3. **`index.html:153`** — `#board { … border-radius:10px; border:1.5px solid var(--line); }` with
   **`index.html:1851`** — `body.pp4Stage #board { width:100%; height:100%; }`. **That white rounded
   outline is the thing he is calling "the square", and it traces the element box — the whole strip —
   not the square board inside it.** On a short phone the two coincide and the frame is square; on a
   tall phone the frame is the rectangle and the board floats inside it.

### Is it tonight's regression? No — posed before and after

Same phone, same solo game, three builds:

| build | board window at 375×812 | captain's box |
|---|---|---|
| `dd56bb96` (before tonight) | 375 × **517** | 209 px |
| `be8a5208` (what he is playing) | 375 × **517** | 209 px |
| `dev` HEAD now | 375 × **513** | 213 px |

**The CTO's claim that tonight did not touch the board's geometry is upheld on substance — and its
mechanism is wrong.** The board's height is *derived from* the captain's box's measured height
(`S.capNeed`), and tonight's work rebuilt that box. It grew 209 → 213 px, which moved the board
window by 4 px — *towards* square, not away. The claim was reasoned rather than measured, and "a
comment is not a measurement" cuts both ways: it happened to land, but the arithmetic it denied is
real and the next such change could move it the other way.

### Answers in order

1. **His one question — DONE.** Board square? Cells and drawn board: **yes, everywhere, exactly.**
   Board *window* on a tall phone: **no — 375 × 421 on his iPhone, 46 px out.** Both measured.
2. **Not asked for:** nothing. This was an audit with no code to displace.
3. **Unsupported claim:** one — the brief's *"Nothing in tonight's work touched the board's
   geometry"*, corrected above (`src/ui/stage.js:895` makes the board's height a function of the
   captain's box).
4. **Last verdict's fault — "an exemption/answer pinned to one name" — RECURRED IN NEW CLOTHES.**
   The 2026-08-23 square fix is pinned to one direction: it guarantees the board is never *shorter*
   than a square and says nothing about *taller*. Same shape of mistake, one axis over.
5. **Bulk reading in the main thread: none found.** There is no CTO account to audit here. The CEO
   itself delegated the doc archaeology (BOARD-RENDERING.md, INTENDED-BEHAVIOUR.md, the git
   `--grep="square"` history) to a subagent and read only the rendered game, the screenshots and the
   ~40 lines of geometry code it cited — which is where the reading belonged.
6. **One sentence:** at the top of this entry.

**Housekeeping, observed not acted on:** 44 dead `.tmp-*` Chrome profile directories from earlier
probes are sitting in this worktree. They are gitignored and hold no live process
(`stray_probe_check` green), but they are real disk. Not this CEO's to delete.

---

## 2026-09-12 · `claude/sfx-background-sound-tuner-ef949a` · the stranded one-commit branch · **LEAVE IT**

**Reviewed:** Wyatt's *"also get ceo to verify that claude/sfx-background-sound-tuner-ef949a needs to
be merged, and if save, merge it."* Read-only; `git ls-remote` rather than `git fetch`.

**Its one sentence for Wyatt, verbatim:**

> **Leave it — that stranded branch holds five lines of a playtest sheet that was replaced by a better
> one on `dev` seven minutes later, the replacement already has the corrected build stamp in it, so
> there is genuinely nothing to save and nothing to merge.**

**Verdict: LEAVE IT** — not merge, and not even push. `eda99761` is one file,
`.planning/staging-checklist-2026-09-07-sfx.html`, 5 lines, correcting a build stamp. Seven minutes
later `ef20473b` put a *combined* sheet on `dev` that already carries the corrected stamp three times
over (lines 77, 79, 110) and the sound items with it. Nothing in the repo links to the old sheet.
The repo's own habit is that superseded sheets keep their original stamps and are never
retro-corrected. The worktree still sitting on the branch is clean and holds nothing.

**Its correction to the CTO, and it was right:** *"The CTO correctly established that the commit is
unique to this machine, then stopped one step short of asking whether unique meant valuable.
'Local-only' is a fact about storage, not a claim about worth."* One command —
`git log --all -- '.planning/staging-checklist*'` — would have shown the replacement sitting directly
above it. **ACTED ON: not merged, not pushed.**

---

## 2026-09-12 · `6e3940e9` · the checklist-hook "fix" · **SAFE TO MERGE, BUT IT IS NOT THE FIX IT SAYS IT IS**

**Reviewed:** Wyatt's *"get ceo to review your hook fix, and if ceo approves, merge it."* Read-only in
this repo; it built throwaway repos under its own scratchpad to construct seven sessions this repo
cannot produce, and re-ran the PRE-FIX hook beside the fixed one at three session bases.

**Its one sentence for Wyatt, verbatim:**

> **Merge it — I spent an hour trying to make this hook go quiet on a session that really did change
> the game and I could not, in seven different ways — but know that on your branch today it changes
> nothing: the old hook and the new one print the same 71 lines, character for character, the files
> it was arguing about are the laser-cut `.dxf` files and not `index.html` at all, and the "proven
> both ways" in that commit message tested code that was already there.**

**What it found.** The new code is safe — both of its exits default to *ours*, and it could not be
made to silence a session that authored game code in seven constructed scenarios. But it never runs:
`git diff --name-only 9fd9955c..HEAD | while read f; ... → 75 ATTR, 0 EMPTY`. Both claimed proofs
tested code that predated the commit — proof (a) is the 2026-08-31 reflog test's silence, proof (b)
exercises `const ours = new Set(dirty)` at `:132`. It also caught the brief citing
`git diff d1ecf9c7 HEAD -- physical-board/` as empty when the command that is empty is
`git diff d1ecf9c7 061f8971 -- physical-board/`: right answer, wrong evidence.

**WHAT HAPPENED NEXT, and it goes further than the verdict.** Its two conditions were "amend the
message" and "write the test". Writing the test settled it: **all six ownership scenarios pass on
BOTH versions of the hook.** The fix is inert, so `253ad9ad` reverts it and keeps the test.

**The real cause, measured.** Running the hook with the MAIN folder as the project directory
reproduces its firing list exactly — 21 paths, the game files among that stale checkout's **132
phantom staged changes**. `ours = new Set(dirty)` treats a stale index as authored work. Recorded in
the test as a KNOWN GAP row asserting today's behaviour, so a future fix is visible rather than a
silent loosening. **ACTED ON: fix reverted, test landed, the diagnosis corrected on the record.**

---

## 2026-09-12 · `086beee8`..`5eff19e4` · eleven commits · **THE PAPERWORK IS EXCELLENT AND THE GAME DID NOT MOVE**

**Reviewed:** his ten asks in the captain's-box stream, oldest first, ending with *"This process is
not working."* Repo-read-only by instruction: no browser, no server. **`npm test` deliberately NOT
run** — this repo's own record (`b684271a`) says one gate in it starts a browser, and I was told not
to. Everything below is read off the files, off the committed art's pixels, and off the session's own
transcript. `git fetch` run before any statement about git.

**My one sentence for Wyatt, verbatim:**

> **Everything you ruled on yesterday got written down properly for the first time — but from 6pm to
> 11:37pm not one line of the game changed, the plaque still cannot fit four captains because the
> picture was ordered at 2:1 when a division anyone could have done that morning says it needs 1.6:1,
> and the crates-on-one-line you called "awesome" is still not on staging for you to play.**

**Verdicts**

| ask | verdict |
|---|---|
| #1 — the pill covers the card, write it somewhere durable | **DONE** — and done properly, in the one place a machine reads |
| #2 — crates on one line, his settings | **DONE in code · NOT ON STAGING**, so he still has not played it |
| #3 — sugar cane art review | **DONE** — four shapes, shown at play size, he picked one; the winner is not in the game yet |
| #3 — the new plaque art review | **DONE** — both round-1 rejected, round 3 produced |
| #4 — previews at the real game size, not squares | **DONE** |
| #5 — more weathered, a little darker | **DONE** |
| #6 — the new art not showing in the mockup | **DONE** |
| #7 — four captains only · card gradient · 25% fill · a real tuner | **DONE** |
| #8 — "did you even QA this?" | **PARTIAL** — that fault fixed; the replacement shipped with a row cut off |
| #9 — "the center area is messed up" | superseded by #10 |
| #10 — two source pictures at the box's size | **PARTIAL** — model adopted, tuner rebuilt, **no art generated** |
| this turn — the handoff prompt | **DONE, and it is good** — three cited corrections below |

---

### The one number that cost the whole evening

**Nine of his messages went to one picture. Only ONE of them (#5, "more weathered and a little
darker") was him judging the art.** The other six — #4, #6, #7, #8, #9, #10 — were him reporting that
the *preview* was broken: squares instead of the real box, art that did not appear, an impossible
two-captain table, a double rope, a wrecked centre, and finally the whole mechanism.

**The fault was visible before a single image was generated.** `.claude/memory/DECISIONS.md` records
the round-2 prompt asking for **"2:1 (the box's real shape)"**. It is not the box's real shape. The
row rulings written down that same day give the arithmetic: band 31 + four 32px rows + 3px gaps +
padding = **204px of content in a 390px-wide box**. Allow for a rope and the picture has to be about
**1.6:1**. At 2:1 — and at the 2.11:1 that was actually drawn — the fourth captain does not fit, and
no amount of slicing, knotting or tuning can make it fit.

**The decision that should have been made differently, and when:** on 2026-09-11, at the round-2
prompt, before any art was ordered. Divide 390 by 204 first. Everything after it — the CSS nine-slice,
the four masked knots, the wood crop, three complete tuner rebuilds, and his *"your system is
completely failing"* — is downstream of one division that was skipped. **Three of the tuner's rebuilds
were machinery, not the thing he asked for. He deleted all three himself in #10.**

**And the arithmetic that proves it is printed inside the tuner he was sent.** The tuner computes
`SHORT by 41px: the picture wants to be 1.61:1` and draws the box with `overflow:hidden`, so the
fourth captain is clipped. I re-derived it: at 390 wide, 2.11:1 gives 185px of picture, 14% inset top
and bottom leaves 133px of board, the rows need 174px. **The page told the CTO it did not fit, and it
was published to him anyway.** That is the moment to have stopped — not after he replied.

---

### What is actually in the repo after all of it

```
git diff --stat 34168a43..HEAD   →  15 files, 100 insertions
```

**Not one of them is a game file.** Six of the seven art-stream commits touch only
`DECISIONS.md`, `BACKLOG.md` and `CURRENT-SHEET.md`; the seventh commits eight source JPEGs into
`art-review/`. The last time the game itself changed was **16:15 local on 09-11**. The captain's box a
player opens today has no plaque, no rope and no wood.

**And three game commits are stranded before staging.** `.planning/CURRENT-SHEET.md` names staging as
`dd56bb96`; `dev` is `5eff19e4`. Between them sit `2791099e` (his whole phone playtest, eleven game
files), `301725e8` (crates on one line — the thing he called *"awesome... Implement it"*) and
`34168a43`. **He has not been able to play a single fix he asked for on 09-11.** Production
(`origin/main` = `a473be4b`) is from 2026-09-06; that part is normal and not a fault.

**Housekeeping is clean**, and it should be said: `dev` is pushed and matches `origin/dev` exactly
(nothing stranded on the Air), and `node scripts/qa/stray_probe_check.mjs` passes — no abandoned
browsers on this machine.

---

### #1 — the pill. DONE, and it is the best-executed item here.

The ruling is in the **single** ```accepted fence (`docs/INTENDED-BEHAVIOUR.md:368-382`), which is the
one `scripts/lib/vision.mjs:38-47` reads at runtime and **throws** rather than run without. There is
no second fence to drift out of step with. It is also at `.claude/memory/DECISIONS.md:2330`, in a
comment above the rule itself (`index.html:3160-3162`, which explicitly retires the two older comments
that worried about what the pill covers), and the probe that flagged it is deleted. I opened
`sea-trial-shots/judge-results.json`: **exactly 8 entries flipped to PASS, each carrying the reason.**
This is what "write it somewhere durable" should look like every time.

### #2 — the crates. His numbers, faithfully. One claim in the record is wrong.

`src/ui/util.js:193` — `HOLD_GAP_PX=3, HOLD_MAX_OVERLAP=0.35`. His settings exactly. The tuner's model
matches the real game rather than approximating it (`--rowH1` 32/40 and `--rowGap` 3/4 at
`index.html:3377` and `index.html:3437`). The rebuild is guarded against churn by comparing the string
it wrote (`src/ui/board.js:1808-1813`), which is the right guard.

**But "the newest crate on top" is written in three places and the code does not do it.** Other
captains' crates are `hold.slice().sort()` (`src/ui/board.js:1798`) and the viewer's own are in recipe
order (`src/ui/board.js:1784`), so the crate that sits on top is the last one *alphabetically* or the
last in the recipe — never the newest. Invisible to a player; wrong in `src/ui/util.js:188`, in the
tuner's footer, and now in the new handoff's §5.

### The handoff written this morning — good, with three corrections

It is measured, specific, honest about A and B being nearly the same shape, and it names the real
constraint. I checked its arithmetic end to end and **every number reconciles**: 204px and 255px of
content match the stylesheet's own row and padding rules; 1.55 / 1.69 / 2.47 follow from those plus the
rope; the canvas sizes, rope thicknesses and twist counts all follow from 2048px wide. Three things to
fix before a cleared session acts on it:

1. **§6 names the wrong cause, and a session sent to fix it will edit a rule that never runs.** It
   cites `index.html:1765` for the fourth captain being cut off at 390×664. That line lives inside
   `body.pp4Stage.pp4Side #pp4Col` — the side-by-side column. At 390 wide the layout takes the stacked
   branch and **removes** `pp4Side` (`src/ui/stage.js:3121`). The clamp that actually applies on a
   phone is set inline at **`src/ui/stage.js:3158`**. The bug may well be real — it is a probe reading
   I cannot re-run without a browser — but the cause is misattributed.
2. **"Rope thickness is fixed at 24 screen pixels" is a choice, not a measurement**, and it sits in a
   section headed *"read off the running game, not guessed"*. It is the one number that decides how
   much edge the rope eats — which is exactly what he complained about. On a phone it takes 19% of the
   box's height. Mark it as the CTO's pick and put it to him.
3. **The §6 bug is on no list** — the handoff says so itself. That is the previous verdict's finding
   (I) starting over in a new file.

---

### 2. Delivered that he did NOT ask for — and it did not displace anything

- **Eight source images committed to `art-review/`** (~18 MB). Not asked for, correct anyway: they
  cannot be regenerated, and the commit message says so.
- **`DECISIONS.md` grew 352 lines.** Not asked for. It is the single biggest improvement in this set.
- **Nothing displaced work he asked for.** The evening's cost was three tuner rebuilds on mechanisms
  he later deleted — that is a wrong-turn cost, not a substitution.

### 3. Claims the repo does not support

| claim | where | what I measured |
|---|---|---|
| "the board starts **13.6%** in from the top and bottom and about **9%** from the sides", stated as measured off the round-3 art | `.claude/memory/DECISIONS.md:2470`, and the same sentence in the tuner | Scanning `plaque-r3-keyed.png` myself: **top 12.2%, bottom 12.1–12.9%, right 5.0–6.0%, left 5.0–9.1%** (unstable — the border is hand-painted and uneven). **The 9% side figure is roughly 1.6× the rope's real thickness**, i.e. ~13px per side of good wood thrown away on a 390px box. Method: variance-threshold scan; I name its wobble rather than hide it. Part of the "gratuitous space on the edges" he complained about is this number, not the picture. |
| "the newest on top" | `src/ui/util.js:188`, tuner footer, handoff §5 | `src/ui/board.js:1798` sorts; `:1784` uses recipe order |
| "the three sugar-cane variants he asked for are not generated" | the CTO's own brief to me | **Four were generated and he picked the tied bundle** (`DECISIONS.md:2413`; four JPEGs in `88078de4`). The three un-generated ones are the *follow-ups* he asked for after picking, correctly parked with a real reason. The account understates its own work — rarer than flattery, and still inaccurate. |
| "the rope eats roughly 13.6% of the height at top and bottom" in his screenshot | the CTO's own brief | that is the tuner's **setting** (`insetY` 14), not a measurement of what he saw |

### 4. Is the last verdict's fault fixed, or recurring?

**Split, and the split matters.**

- **Finding (I) — "his rulings exist nowhere but this conversation": FIXED, decisively.** Every ruling
  I spot-checked is in `DECISIONS.md` in his own words, and the pill ruling went further and reached
  the code path that reads it. Two verdicts in a row named this; it has been answered.
- **"Stale facts written into the source": RECURRED.** The 13.6%/9% pair and "newest on top" are now
  baked into a durable file as measurements, and the 9% is the evidence the layout rests on.
- **A NEW fault, and it is larger than either:** an evening's work that **cannot reach a player**, and
  three approved fixes stalled before staging. The previous two verdicts judged fixes that were at
  least in the game. This one judges a day that produced rulings, art files and an excellent handoff —
  and moved nothing a player can see.

### 5. Did the CTO spend its own head on reading it could have delegated?

**I measured this rather than guessed it**, by streaming the session's own transcript without reading
it into my context. Since 2026-09-11:

- **597 Bash calls in the main thread, ~945,000 characters (~236k tokens) of tool output — and ZERO
  subagents.** Not one delegation all day. The only `Agent` call in the window is the CEO audit itself,
  this morning. `sed -n` ranges alone poured **392,615 characters** (~98k tokens) of source into the
  main thread; `grep -n` another ~102,000.
- **The per-call discipline is genuinely good and I want to say so**: no single result exceeded 20,000
  characters, `| cut -c1-200` appears repeatedly, the megabytes of base64 art were written to
  `*_uris.json` by scripts and spliced into pages by scripts so they **never** entered context, and the
  probes return summaries rather than dumps. The fault is the aggregate, not any one read.
- **The exceptions hold and I am NOT counting them:** the 15:40–15:57 UTC reading run across
  `flow.js`, `orchestrator.js`, `engine/index.js`, `panel.js`, `pilot.js` and `stage.js` (~80k chars)
  landed **34 minutes before `2791099e`, which edited exactly those files** — a file under active edit,
  main-thread by design. The 88 `browser_batch` calls are the rendered game and the art rounds
  (rule 19). Wyatt's own words and screenshots are his.
- **The clearly delegatable reads I can name:** `.planning/art-generation-process.md` read **three
  times** in the main thread (02:05, 02:06 and 04:08 UTC, ~30,000 characters total) — a runbook, read
  to follow, re-read twice; and `scripts/qa/_crew_motion_check.mjs` read whole (200 lines, 6,980 chars)
  to check one behaviour, on a day it was never edited. Small on their own.

**The honest conclusion: bulk reading is not what broke this day.** Zero delegation across ~236k
tokens of tool output on the day he said the process is not working is a real signal — but the thing
that actually cost the evening was one skipped division, not a full context window.

### 6. One sentence Wyatt should read first

> **Everything you ruled on yesterday got written down properly for the first time — but from 6pm to
> 11:37pm not one line of the game changed, the plaque still cannot fit four captains because the
> picture was ordered at 2:1 when a division anyone could have done that morning says it needs 1.6:1,
> and the crates-on-one-line you called "awesome" is still not on staging for you to play.**

---

## 2026-09-10 · `c61bdddb` + `3c54758f` · two commits · **MIXED — #1 is half-fixed, #2's "too big" is not answered**

**Reviewed:** his #1 (the cards jump after the swap), his #2 (the sizes were for desktop; the cards
are too big; the padding round the picture is wrong), and his 14.1 (the wait line on the host).
Repo-read-only, by instruction: no browser, no probe, no server. `npm test` run once — **exit 0,
0 failures.** Everything below is read from the files and from arithmetic done on the numbers those
files declare.

**Its one sentence for Wyatt, verbatim:**

> **The big 100px jump you filmed is genuinely found and genuinely fixed — but a smaller 15px
> version of the very same jump is still there on a desktop window narrower than about 1000px, by
> the CTO's own measurement; "the cards are TOO big" was not acted on and was not written down
> anywhere you will ever see it again; and the commit that did all this also wiped your own edit to
> CLAUDE.md and pushed it before putting it back.**

**Verdicts**

| ask | verdict |
|---|---|
| #1 — the cards jump after the swap | **PARTIAL** — the ~100px cause is right and fixed; a 15px cause survives on desktop |
| #2 — the sizes were for DESKTOP only | **PARTIAL** — the three enlargements are correctly gated; two changes still reach a phone |
| #2 — "you made the cards TOO big" | **NOT DONE**, and not parked anywhere durable |
| #2 — the padding round the recipe image | **PARTIAL** — the picture's half is right; the number it was matched TO does not reconcile |
| 14.1 — the wait line on the host | **DONE** for the symptom he reported, with two unguarded edges |

---

### #1 — the jump. The big cause is right. A smaller one is still live on desktop.

**The diagnosis is correct and well evidenced.** `height:auto` on the artwork made the card's height
a function of that pastry's shape, the front card changes identity on a swap, and the row's height
follows the front card — so the stack lurched. `aspect-ratio:1.35` + `object-fit:contain`
(`index.html:3058-3060`) removes it. I confirmed the pastry shapes myself by reading the WebP
headers: they really do run from 1.049 to a good deal wider, so the mechanism is real.

**But the second cause was fixed on phones only, and desktop needs it too.** The title reservation
is behind `@media (max-width: 900px)` (`index.html:2987-2989`). The CTO's own probe result, written
into the comment three lines above it, says **"card 250 -> longest is 54px"** and a one-line title is
39px. The card is **250px wide from the stylesheet** (`index.html:2753`) whenever the captains box is
not a side column beside the board — and that side-column decision is made in JavaScript from the
window's height as well as its width (`src/ui/stage.js:3049`), so a window of, say, 950 x 800 is
"desktop" to the CSS (over 901) but still gets the 250px card. In that window the reservation does
not apply, the two titles differ by 15px, and **the stack jumps on every swap.** Same defect, one
seventh the size.

The same gap covers the ordinary laptop case: stage.js's own comment says the derived card is
**"~245 at 1280"** (`src/ui/stage.js:3675`) — narrower than 250, so titles wrap there too, and the
probe never measured anything between 250 and 365 (`scripts/qa/_recipe_title_lines.mjs:26`).

**So the claim "card heights EQUAL at 1920, at 820, at 768 and at 390 — a swap cannot resize the
stack at any size" is false.** Four widths were measured; the band where it still moves was not one
of them. The four numbers are probably all true. The sentence they were used to support is not.

**Does the card's floor rescue it? No — that rule does nothing at all.** `min-height:
calc(var(--rcW) * 0.87)` (`index.html:2799-2800`) is the rule carrying his "make the cards larger
vertically by 50%". Working it out from the file's own numbers, the card's actual content comes to
about 0.97–1.02 of its width at every desktop size, and the floor is 0.87 — so **the floor is never
reached and the rule has no effect.** The card's height is now decided entirely by
`aspect-ratio:1.35`. Worth knowing before anyone tries to re-dial his 50% by touching that line.

**Does the fixed shape re-create his "far too much empty space" complaint? No, and I want to say so
plainly.** With the box at 1.35 and the picture fitted inside it, the *widest* pastry gets about
**19px of dead space above and below** on a 365px card, and the *squarest* gets about 34px at each
SIDE and none top or bottom. He complained about **66px above and below**. This is roughly a third
of that, and it has mostly moved to the sides. That is a fair trade, honestly made.

**Three numbers written into the source are wrong** — the same fault the last verdict named.
- `index.html:3041` and the commit body: the pastries "run from 1.049 (Mayan Cocoa Souffle) to
  **1.515** (Caramel Slice)". Measured from the files: the widest is **1.615 — Crispy Cocoa Snaps
  (`assets/pastries/11-crispy-cocoa-snaps.webp`, 512x317)**. The CTO missed the widest of the
  twenty-one while claiming to have measured all of them.
- `index.html:3044`: "six of the first eight sit between 1.32 and 1.40". **Four do** (1.330, 1.326,
  1.323, 1.320); 1.403 and 1.463 do not, and 1.049 and 1.515 plainly do not.
- `index.html:3060` says the card is now **"340 tall at 1920"**; the commit message for the same
  change says **"353 tall at 1920"**. One of the two is stale, and whoever reads the file next gets
  the wrong one.

---

### #2 — desktop-only. The gating is real and the braces are clean. Two things still reach a phone.

**I checked the braces the way I was asked to, and they are correct.** Parsing the whole stylesheet
with comments stripped: the `@media (min-width: 901px)` block that starts at `index.html:3023` closes
at `index.html:3065` and encloses exactly two rules — the 52px ingredient icons and the `.recipeThumb`
block. Nothing was swept in. The other two blocks (`index.html:2798-2801`, `index.html:2987-2989`)
are also correctly closed, and the file's brace nesting balances end to end. **No leak.**

**But "below it the card is byte-for-byte what it was" is not true.** I rebuilt the card's complete
rule set from the last build before his 09-10 asks (`f5b5091d`) and from HEAD, and diffed them. Below
901px, three things differ:

1. **`padding: 6px 6px 8px` → `padding: 9px 9px 12px`** (`index.html:2786`) — **unscoped, still
   applies on every phone and tablet.** It sits directly under a comment headed "⭐ HIS 2026-09-10
   SIZES" (`index.html:2784`). This is exactly the thing he complained about, left in place.
2. **A new `min-height: 54px` on the title** below 901px (`index.html:2988`) — the phone's card is
   now up to 15px taller than it was. Defensible (it is what makes the phone stop jumping) but it is
   a change to the mobile card's look, and it should have been said, not denied.
3. The swap transition 0.15s → 0.38s — his own 380, a motion change, correctly applied everywhere.

Netting 1 and 2 out: a 390px phone's card is roughly **7–22px taller** than before his desktop asks,
not identical. The honest sentence was "everything that made it *bigger on purpose* is gated; the
padding and the title reservation still apply, here is why" — not "byte-for-byte".

---

### #2 — "you made the cards TOO big." NOT DONE, and the dodge is the paperwork, not the argument.

**The argument itself is legitimate.** His video is a narrow window; the enlargement was ungated;
removing it below 901px genuinely changes what he was looking at. Measuring the back card at 7–12px
inside the panel and saying so is the right instinct. I would not call the reasoning a dodge.

**Two things make it NOT DONE anyway.**

First, **shrinking the card does not help the back card fit — it hurts.** The back card is pinned at
`top:10px` and scaled to `.965` (`index.html:2847`, `index.html:2857`), so it hangs below the front
card by roughly `10px minus 3.5% of the card's height`, plus a little more from its 1.1° tilt. On a
tall card that is negative — it tucks inside. **The shorter the card gets, the further the back one
protrudes.** So the 21–34px reduction the padding fix delivered as a side effect moves the back
card's bottom edge the *wrong* way. If "doesn't fit in the space available to it" means the back card
poking past the sheet, this change makes it very slightly worse, not better. I could not measure it —
no browser — so this is arithmetic, not a confirmed defect. It is the first thing to check.

Second, and this is the real failure: **the item exists nowhere but a commit message.** Nothing was
written to `.planning/BACKLOG.md` or `.claude/memory/DECISIONS.md` — neither file has been touched
since `89ecec72`, before both commits. `.planning/CURRENT-SHEET.md` still names build
`2026.09.07.3-staging@6012fe66`, so the sheet on his phone does not carry these fixes either. **His
CLAUDE.md says in as many words: "A list that lives only in a chat reply is gone when the session
ends."** This one is. **That is the exact fault the previous CEO verdict recorded as finding (I),
recurring nine days later.**

---

### #2 — the padding round the recipe image. Half of it is right; the target it was matched to does not reconcile.

**The picture's own half is correct arithmetic.** `width: calc(100% - 40px)` on a centred image
inside a card with 9px padding puts the picture's edge at 9 + 20 = **29px**. That checks out
(`index.html:3058`).

**The 29 it was matched TO does not.** The claim is "Measured at 1920: picture 15, icon row 9, first
icon 29" (`index.html:3056-3057`). Working the icon row out from the rules in the same file — row
padding 6px a side (`index.html:3011`), a five-column grid with 5px gaps, each icon capped at 52px
(`index.html:3024`) and centred in its column — the first icon's left edge lands at about **21px**
on the widest card the code permits (`RC_CARD_MAX = 375`, `src/ui/stage.js:2287`), and less on a
narrower one. For the icon to sit at 29 the card would have to be about 450px wide, which the code
caps out below.

If that arithmetic is right, **the picture is now inset ~8–10px MORE than the ingredients — his
complaint mirrored rather than fixed.** I could not run a browser to settle it, and I am not calling
it confirmed. But it is a measurement stated as fact that the stylesheet does not support, and it is
the single fastest thing to re-check before he sees this.

---

### 14.1 — the wait line. DONE, with two edges nobody is watching.

**The mechanism is right and it is in the right place.** The line was retired only by the panel going
empty and then filling again, and the crew path never passes through empty — so it survived onto the
host's own recipe picker. Keying on panel.js's existing per-prompt stamp instead of inventing a
second clock or reading the text is the correct instinct, and it is one place that covers every
prompt style (`src/ui/stage.js:3581-3584`). The probe is honest, too: it asserts the line **does**
appear first, so a probe that stopped exercising the bug would fail rather than quietly pass
(`scripts/qa/_crew_waitline_check.mjs:66-67`).

**Can it kill the line the instant it is born — the regression the comment above it says was caught
once before? Not on the path he reported.** `panel()` runs the tick synchronously as it finishes, so
by the time a wait line is armed the stamp is already current. Good.

**Two edges are unguarded.**
- **The stamp counts panel renders, not questions.** `const seq=++panelSeq` (`src/ui/panel.js:540`)
  increments on *every* panel draw that has a button row — including a redraw of the *same* question.
  The comment claims "it increments once per question asked" (`src/ui/stage.js:3577`); that is not
  what panel.js does. If anything re-renders the host's panel while he is genuinely waiting, the line
  goes early. The robust version records the stamp where the wait line is armed
  (`src/ui/stage.js:1847`) instead of trusting a value another loop keeps up to date — one line.
- **Reduced motion turns the fix off.** The stamp is only written when `hasButtons && !reduced`
  (`src/ui/panel.js:539`), so a player with "reduce motion" on never gets a stamp and 14.1 comes
  straight back for them.
- The probe sleeps 4.2s before judging (`scripts/qa/_crew_waitline_check.mjs:56`), so it cannot tell
  "retired at the right moment" from "retired too early", and it never covers the second wait — the
  one armed after the host picks his own recipe (`src/ui/flow.js:3311`).

---

### What was delivered that he did NOT ask for

- **`c61bdddb` reverted his own edit to `.claude/CLAUDE.md`, in full, and pushed it.** The file in
  that commit is byte-identical to the pre-trim version (`89ecec72`) — his 117-insertion,
  133-deletion trim (`3990a401`) was wiped by a `git add -A` inside a commit that was meant to be two
  CSS fixes. Restored two minutes later in `0d0116a0`, and HEAD is correct now. **His own writing was
  destroyed and re-created, on a shared branch, in a window where the other machine could have pulled
  it.** He should know it happened.
- **Two new probes, neither in the gate chain** — `scripts/qa/_recipe_title_lines.mjs` and
  `scripts/qa/_crew_waitline_check.mjs`. The `_` prefix is this repo's own convention for hand-run
  probes and thirteen others live the same way, so this is not a rule broken. It does mean **nothing
  in `npm test` guards either fix**, and the next person to touch the picker's CSS or the panel's
  stamp will not be told.
- Neither displaced work he asked for. The CLAUDE.md revert cost a commit and a scare, not an item.

### Claims unsupported by what is in the repo

| claim | where | what the repo says |
|---|---|---|
| pastries run 1.049 to **1.515** | `index.html:3041` + commit body | widest is **1.615** — `assets/pastries/11-crispy-cocoa-snaps.webp` |
| "six of the first eight sit between 1.32 and 1.40" | `index.html:3044` | **four** do |
| card is "**340** tall at 1920" | `index.html:3060` | the commit body says **353** for the same measurement |
| "first icon 29" at 1920 | `index.html:3057` | the rules in the same file compute **~21** at the maximum card width |
| "below it the card is byte-for-byte what it was" | commit body | padding `index.html:2786` and title `index.html:2988` both still change the phone's card |
| "a swap cannot resize the stack at any size" | commit body | 901–~1000px windows keep the 250px card with no title reservation; by the CTO's own probe that is a 15px jump |

### Is the last verdict's fault fixed, or recurring?

**Recurring, twice, in new clothing.**

1. **Finding (I) — "his rulings exist nowhere but this conversation."** Recurred exactly. The half of
   #2 that was not done was not written to `.planning/BACKLOG.md`, `.claude/memory/DECISIONS.md` or
   the sheet. Nine days, same fault.
2. **"Stale facts now written into the source."** Recurred. Three wrong numbers are now baked into
   `index.html`'s comments, and one of them (the aspect range) is the evidence the fix rests on.
3. **A softer echo of "bug 3 — the fix's mechanism is absorbed."** The rule carrying his "50% taller"
   ask, `min-height: calc(var(--rcW) * 0.87)` (`index.html:2799`), is a floor the card's own content
   already exceeds at every desktop width. It is not wrong; it is simply doing nothing.

**What genuinely improved on the last verdict:** the fix is a real root cause with real evidence
behind it, the media-query braces are clean where the last one shipped a selector that silently lost,
the probe carries its own red-proof, the CTO says out loud that he guessed twice before measuring,
and `npm test` is green. This is a better piece of work than the one reviewed on 2026-09-08. It is
still not what he asked for on two of five counts.

---

## 2026-09-08 · `a6c2894b`..`2d676cd1` · six commits · **MIXED — one named bug NOT DONE**

**Reviewed:** his three named bugs (coin vanishing, the bot-attack blocker, the desktop recipe
picker), his twelve playtest-artifact notes, the updated artifact, and "do it" on converging the
drain.

**Its one sentence for Wyatt, verbatim:**

> **Nine of your twelve notes are genuinely done and the blocker's mechanism is correctly found —
> but the desktop recipe picker you filed as bug 3 looks pixel-for-pixel the same as before the fix
> in their own screenshots, the tablet picker cuts your captains box in half instead of covering
> it, and the updated playtest artifact you asked for was never made.**

**Verdicts**

| ask | verdict |
|---|---|
| bug 1 — coin vanishes before the stage | DONE |
| bug 2 — BLOCKER, bot attack | DONE, but never played in a real crew game |
| bug 3 — desktop picker | **NOT DONE** |
| s3 · s4 · s7 · t1 · t2 · t3 · t5 · r3 · r4 | DONE (s7 ungated) |
| s8 Safari | PARTIAL — honestly labelled as a hypothesis |
| r7 cover the captains box | **PARTIAL — the tablet half fails outright** |
| q29 show option 2 | UNVERIFIABLE — "option 2" exists nowhere in the repo |
| the updated playtest artifact | **NOT PRODUCED** *(see CTO note below)* |
| "do it" — the convergence | DONE in substance; the GATE that claims to hold it does not |

**Findings that stand, in its words**

- **bug 3:** the 44px lift is clamped by `topBandPx()` (`stage.js:3269`) and on desktop the captains
  column starts right under the ribbon, so the whole lift is absorbed. *"And a vertical lift cannot
  overlap the board on desktop anyway — the board is to the left, not below."*
- **r7 tablet:** the sheet is a centred column that bisects the captains box, all four names legible
  either side. Cause: `#actionPanel` is still capped at the board's width by a shared classic rule
  (`index.html:2088-2094`) — a rule the repo had already parked as *"a taste call Wyatt has not
  made."* **His r7 IS that ruling, and the parked question was never unparked.**
- **the centring (unasked-for):** blank cream below the card went 145px → 190px and a new ~127px
  band appeared above; ~44% of the sheet is empty. It also sets `justify-content:center` on the
  element that already carries `overflow-y:auto` (`index.html:2331`), so on a short screen the
  title can scroll out of reach and cannot be scrolled back to.
- **the new gate has two holes:** it reads only `flow.js` and `orchestrator.js` (2 of ~11 files), so
  a ride added to `board.js` passes; and one alias (`const _ride = animateSailRoute`) defeats its
  literal regex. The red-proof exercised one shape only.
- **`await liveRender()` widens a pre-existing deadlock hazard** — it now awaits *every* unconsumed
  event, and `localAsk`'s resolver fires only from a tap. Also `panel.js:164` dereferences
  `appState.game` **before** the guard at `:165`, so it can throw synchronously and return no
  promise.
- **`setFlipCoin`'s new guard sits ABOVE `stopFlipSpinSound()`** (`board.js:2397` vs `:2409`), so a
  deferred blanking skips the one line written to stop the spin sound outliving the picture. No live
  path found — a weakened invariant, not a measured bug.
- **stale facts now written into the source:** `docs/AUDIO.md:210` still says the music gap is 60
  (it is 180) and warns against restoring 120; "~57 call sites" is really **48** and that wrong
  number is now in `panel.js:156`, `panel.js:173` and `flow.js:1181`; `panel.js:173` still says
  liveRender "stays synchronous"; nine awaited sites, not eight.
- **`.pp4RcSwap` has no `:focus` rule at all**, so "keep it on the button" is satisfied by the front
  card's ring, not the circle's — keyboard focus on the swap button is invisible.
- **the coin-flip ruling (H):** *"I read it and I agree with the CTO"* — `DECISIONS.md:518-522` is
  scoped word for word to the flip's SOUND. **No conflict.**
- **(I) confirmed:** nothing was written to `.claude/memory/`, `docs/` or `.planning/` except six
  PNGs, so his four rulings and all twelve notes *"exist nowhere but this conversation."*
- **the sail-length retraction is CORRECT** (`storyboard.js:161`). *"The CTO was right to retract,
  and Wyatt was right to push."*
- **§5 (delegation):** *"I cannot answer this one honestly"* — no access to the CTO's thread. Not
  checked, no evidence found.

**Where the CTO disputes it, on the record:** the updated playtest artifact **was** produced and
published (same URL, twice). The CEO is repo-read-only and an Artifact is not a repo file, so it
could not see it — a scope limit of the review, not a miss in the work. Everything else above is
accepted.

**No previous verdict existed.** This file did not exist before today, so the recurrence check
could not run — the CEO named that as a finding about the process, and it is.
