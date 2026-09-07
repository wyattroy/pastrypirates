# HANDOFF — the SFX work (`T-073`), 2026-09-06

**You are picking up sound work Wyatt has already ruled on in detail. Read §1 and §2 before you
touch anything — most of what looks like a decision has already been made, and several of the
"facts" in the original PRD are false.**

---

## 0. ⛔ FIRST: WHERE THE WORK IS, AND WHY IT IS NOT IN THE USUAL FOLDER

| | |
|---|---|
| **branch** | `sep06-sfx-only` (on GitHub) |
| **it was worked in** | a clone under a session scratchpad — **disposable, probably gone by the time you read this** |
| **do NOT use** | `/Users/wyattroy/Documents/Projects/pastrypirates` |

**His ruling, 2026-09-06:** *"just use the temp folder for now. i want to keep my Projects folder
clean."*

**WHY THE MAIN FOLDER IS OFF LIMITS: other sessions live in it and move its branch under you.**
It went `sep06-sfx` → `sep06-glass` → `sep06-cloudflare` in one afternoon. That is not hypothetical
damage — a staging deploy from this session was stamped with **another session's commit** because
`HEAD` moved between the command being written and run. Worktrees are retired here, so one folder
means one branch means one shared `HEAD`.

**So: clone fresh, work there, never `git checkout` in the main folder.**

```bash
git clone --branch sep06-sfx-only --single-branch https://github.com/wyattroy/pastrypirates.git /tmp/sfx
cd /tmp/sfx
git remote add gh https://github.com/wyattroy/pastrypirates.git    # push here, not to `origin`
git fetch gh 'refs/heads/main:refs/remotes/origin/main'            # ⛔ REQUIRED — see §5
```

⚠ **AND NEVER `git checkout` IN A FOLDER WHERE SOMETHING IS RUNNING.** This session did exactly
that mid-sea-trial and spent ten minutes trialling a tree with the sound files removed.

---

## 0b. ⛔ STAGING IS NOT SHOWING THE SOUNDS (as of 2026-09-06 evening)

Staging serves **`2026.09.04.2-staging@5c6eabb3`** — the cloud-handoff release candidate Wyatt
asked to play before deciding whether to ship it to `main` (frozen since 27 August, 1,427 commits
behind). **All three sound files 404 there — verified by curl, not assumed.**

**Nothing is lost.** Publishing from `sep06-sfx-only` puts them straight back. **Ask him first** —
staging is where he plays, and he is mid-decision on the release candidate.

His playtest sheet now carries a STOP banner saying so, so he cannot open the link and test a
build with no sounds in it.

⭐ **PUBLISH FROM A CLONE, NOT THE SHARED CHECKOUT.** `deploy-staging.sh` derives `SRC` from the
script's own location, so running it inside a clone publishes that clone: HEAD never moves, another
session's uncommitted files are not swept in, and `.git` is a real directory so the trailing-slash
`--exclude=.git/` bug cannot fire. **Both live sessions have now independently arrived at this;
treat it as the pattern while more than one session shares the tree.**

⚠ **AND `.planning/SEA-TRIAL.md` IS CURRENTLY LYING BY OMISSION** — it holds a 2-minute
`NOTHING SAILED / COSMETIC` run from Wy-Blade at 19:36Z, which overwrote the authoritative
82-minute FULL run from 13:28Z at the same build. Anyone opening the default file to answer *"did
the trial run?"* now gets the cosmetic one. **This is CLAUDE.md §3's shared-filename hazard, not a
cache.** It was not written by the SFX session — every trial here used `--report=` to its own path,
which is the documented defence. **Write your reports to `--report=` too.**

## 1. HIS RULINGS — the authority, and none of it is re-askable

**`.claude/memory/DECISIONS.md`, the `⟨T-261⟩` entries at the top.** His exact words are in
`.planning/wyclau/INBOX.md` (`INBOX-20260906T1622…`–`163615Z`). **Read those, NOT the PRD page** —
see §2.

| moment | his ruling |
|---|---|
| **Battle CALLED** | the sword clash. *"the sound is exciting"* — **already correct in code, change nothing** |
| **A shot LANDS** | `cannon` — **DONE**, guarded so it stays silent when nothing lands |
| **Your turn** | the bell, **heard by that player ONLY** — a sanctioned D-07 exception. **DONE** |
| **New day** | **nothing**, deliberately. Later: a wind whoosh or weather-vane creak (brief written for Luis) |
| **Turn timer runs out** | `Alarm` — **PARKED**: the feature does not exist. His words: *"this is not built into the current game though"* |
| **Coin flip** | **CLOSED. Do not touch.** He fixed the duration in code; `CoinFlip_Start`/`_End` are out of scope |
| **Victory** | `battle-won` — **DONE** |
| **Drumroll** | the box must match the file's length. **NOT DELIVERED — see §3** |
| **Ambience** | Luis's spec: a randomiser over ocean bed + gulls + creaks, **with randomised stereo**. WAV → MP3 |
| **Music** | smallest track, looping; a 3-phase sound button; 2-minute gap before it repeats |
| **Levelling** | *"level everything together, once"*, **after every file is in** — so new stems sit at `1` on purpose |
| **Scope** | one pass |

⚠ **`ClockTick` is the ONE box he left blank** (`q2`) while saying he had finished. It is the
warning tick by elimination once `Alarm` took timer-expiry — **that is an inference, not his
ruling. Do not wire it as confirmed.**

---

## 2. ⛔ THE PRD PAGE IS WRONG IN FOUR PLACES. DO NOT PLAN FROM IT.

`.planning/wyclau/T-261-SFX-PRD.html` is the page he annotated, and its own prose has been
measured false four times. Every one would have sent someone to change working code.

1. **"the drumroll window is a hard 2550ms floor and the file was sized to fit it"** — that floor
   was DELETED by D-34. Measured: box **1130 ms**, file **3148 ms**.
2. **"the sword clash MOVES — it currently plays on the resolve"** — it does not. It has fired at
   battle-engage for weeks (`src/orchestrator.js`, `playBattleEngage()`; `EVENT_SOUND.battle` is
   `null`). **His ruling is already satisfied.**
3. **"use the latest clip available" implies a file swap** — Luis's latest `PP_SFX_Battle.mp3` is
   **SHA-256 identical** to the shipped `sfx/battle-swords.mp3`. There is no newer export.
4. **"`SFX_VOLUME` — every value is still 1"** — six real values were already set
   (`src/ui/audio.js`). He answered `q7` against a false premise; his answer survives, but he was
   not shown the truth.

**And the clipping argument is settled, both sides right:** sample peak **−0.2 dBFS**, true peak
**+0.2 dBFS**. Luis masters to sample peak, so he is right it is not clipped; the project's
true-peak figure is also right. Moot in play — that stem is already attenuated to `0.46`.
**Nobody needs to ask Luis for a re-export.**

---

## 3. ⛔ THE DRUMROLL — READ THIS BEFORE YOU WIRE IT

**It is deliberately wired NOWHERE.** `sfx/drumroll.mp3` ships; nothing calls it.

**What happened, because repeating it will get you fired.** CEO 232 caught it playing on the host
only. It was "fixed" by pasting `playDrumroll()` into the guest twin as well, and the comment
justified that by citing `playWinScreen()`'s own twinning as *"the established shape"*.

**Wyatt: *"DO NOT ARCHITECT DRIFTABLE CODE OR I WILL FIRE YOU"*** and ***"there should be NO more
precedent for drift, we have been fixing that tech debt for weeks now!!!"***

He is right, and `CLAUDE.md` rule 23 names the mistake in advance: *"the existing one already
works, I'll just add a listener/branch/path for the new case… When a SECOND consumer appears,
CONVERGE."* **An existing violation was read as a precedent.** Both calls are removed (`a426dece`).

**THE ARCHITECTURE, in his words:** *"both the host AND the guest drain from one shared engine
event."* The gate says it too (`scripts/qa/one_event_consumer_check.mjs`): *"the whole drawing
sequence an event triggers — active-seat, rim sweep, render, pops, **sound**, end-meta — lives in
ONE function, and every tier reaches it."*

**So the drumroll rides an EVENT through the single `playForEvent` dispatcher. The your-turn bell
in this branch is the worked example — copy its shape.** Candidate: the `end` event.
**UNMEASURED and the only open question:** whether `end` drains close enough to the "Drumroll…"
beat (`liveResolveEndNet`'s own comment says it is consumed *"lines ago"*). **Measure it. This
session was wrong about audio timing twice; do not make it three.**

---

## 4. WHAT IS DONE, AND WHAT IS LEFT

**Done and on the branch** — victory fanfare (`battle-won`), cannon on a landed shot, the
your-turn bell (event-driven, seat-gated, with a guard that fails if a second sound is ever
gated), `docs/AUDIO.md`'s three false claims corrected, build stamped `2026.09.06.1`.

**Left, in his order:**
1. ~~**The ambience tuning artifact — HIS EXPLICIT ASK, and the next thing.**~~ **BUILT
   2026-09-07 — https://claude.ai/code/artifact/4623cd73-2340-4611-832f-522ebbf33442** (*Sea Bed
   Tuner*). **NINE sliders, not nineteen** — asked the 19-vs-15 question and his answer was a
   fourth option nobody had written down: ***"i just want the ambience and music sliders"***. So
   the game's ten shipped sounds are on the board as **audition buttons at their shipped
   `SFX_VOLUME`**, with no sliders — they are what the bed is balanced against, not what is being
   tuned. The nine: sea level, gull level, gull rate, creak level, creak rate, stereo spread,
   liveliness, music level, music pan.

   ⚠ **HE WAS ANNOYED THAT THE QUESTIONS WERE ASKED AT ALL.** Verbatim, mid-build: *"i disappointed
   that you asked me three minor questions instead of simply building it to your best guess"*, and
   on the music: *"you shouldn't have asked me this -- you should have just gotten it from the
   drive, which you have access to."* Two of the three were answerable without him — **the slider
   count was the only one that was genuinely his**, and even that one was only asked because a
   session's own warning box in DECISIONS.md turned his throwaway "10–15" into a gate. **Build to
   your best guess and show him the thing.**

   **MEASURED, so nobody re-derives it** (ffmpeg ebur128, integrated):

   | | length | integrated |
   |---|---|---|
   | `Ocean_Loop` | 16.71s | −32.2 LUFS |
   | `Seagull_1…5` | 2.6–3.2s | −19.6 to −21.2 (**within 1.6 dB of each other**) |
   | `BoatCreak_1…6` | 1.5–2.9s | −36.4 to −44.7 (**spread 8.3 dB**) |
   | the music cut | 34.47s | −17.8 LUFS, **mono** |

   Read that as: **gulls land 12 dB ABOVE the sea, creaks 6 dB UNDER it.** That is why one creak
   slider needs the per-clip trim the page computes (`10^((familyMean − I)/20)`) — creak 6 gets
   ×2.04 or it is inaudible at any setting. Defaults on the board: sea 0, gulls −6, creaks +6,
   music −12, gull every 22s, creak every 9s, spread 70%, liveliness 35%.

   ⛔ **THE MUSIC IN THE PAGE IS NOT HIS EDIT.** It is a 34.5s cut from the HEAD of the 6:53
   master in `~/Downloads`, made because the Chrome extension was not connected and his
   *"…short 1.m4a"* (3,566,975 B, Drive id `105jLnp6dFiLPboo4MTyvBaKSBEjb7CyU`) could not be
   fetched — the Drive MCP returns base64 into context, which is ~4.7 M characters and unusable.
   **Same track and same length; the in-point is a guess.** The page says so in its own words.
   Level and pan taken from it are good; the loop point is not settled.
2. ~~Wire the ambience with his numbers~~ **DONE 2026-09-07.** The bed plays for as long as the
   board is on screen. His nine tuned values are named constants in `src/ui/audio.js`; the loop
   points are scanned off the decoded samples rather than typed; the twelve clips load on their own
   path and are kept OUT of `SFX_FILES`; mute stops the bed outright rather than silencing it.
   **ONE SEAM — `showGameView()` starts it, `showHome()`/`showRoom()` stop it** (src/ui/lobby.js's
   three screen functions, whose own header says every route passes through them). No host path, no
   guest path, nothing to drift. `scripts/qa/ambience_one_seam_check.mjs` is gate 105 in `npm test`
   and fails if a second seam, a leaked clip, or a changed value of his ever appears.
   **Full write-up: `docs/AUDIO.md` §1b**, including what was measured in a live voyage.
   ⚠ **Music is still NOT wired** — see item 6; his `MUSIC_LEVEL` 0.141 and `MUSIC_PAN` −0.7 are
   recorded in the module so nobody re-derives them by ear.
3. The drumroll, per §3.
4. The 3-phase sound button (Music+SFX → SFX only → mute → back; 2-minute gap before the music
   repeats). **A new feature, not a sound swap — its own consistency sweep.**
5. Levelling everything once, at the end.
6. Music: **the 3.4 MB track is on Drive only, not on this machine**, and it is `.m4a` — needs
   converting. He approved pulling it from Drive.

---

## 5. TRAPS THAT COST THIS SESSION REAL TIME

- **`gear.mjs` and `sea_trial.mjs` say NONE in a single-branch clone** — they compare against
  `origin/main`, which such a clone does not have. A trial reported **NOTHING SAILED** in one
  minute and would have read as "no trial needed". **Fetch `main` first** (§0).
- **A sea trial is the wrong instrument for audio.** Wyatt: *"it doesn't make any sense to run it
  WITH SCREENSHOTS for an audio change."* Its judge looks at pixels. Use the assertions in
  `scripts/audio_mapping_test.js`, two tabs for host/guest, and his ears.
- **`npm run deploy:staging` fails from a WORKTREE** — `--exclude=.git/` has a trailing slash, so a
  worktree's `.git` FILE slips past. It aborts correctly; it does not lie. Use a clone.
- **Run `npm run bump` before publishing to staging** — it is now step 2 of the release loop in
  `docs/GIT-AND-DEPLOY.md`. It was missing from that list until today.
- **After editing a build stamp, grep for the OLD value and require zero hits.** The stamp appears
  in three different shapes in the checklist and a stale one survived twice.
- **CEO review numbers collide** — ten collisions across 215. Check yours is unique or
  `close_item.mjs` will refuse the close.
- **`.planning/sfx-slice1-checklist-2026-09-06.html`** is his playtest sheet, published at
  https://claude.ai/code/artifact/21da3595-14cc-49e6-9230-d12c9f8c6361 — republish that same URL,
  do not make a new one.

---

## 6. HIS STANDING ASKS ON THIS WORK

- **Sequence:** wire the sounds, then the slider board — **except the ambience**, where he ruled the
  board comes first.
- **Tell him the SIZE**, not just the change: what a player hears differently, how much of the job
  it covers, what it leaves undone.
- **A CEO review after every item**, appended to `.planning/CEO-REVIEWS.md` before the next starts.
- **Nothing reaches `main` without his approval.** Staging is where he plays.
