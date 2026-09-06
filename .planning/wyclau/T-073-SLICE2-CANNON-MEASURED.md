# Slice 2 — the cannon on a landed shot: measured before writing a line

**Wyatt's ruling (PRD box `s2`, 2026-09-06), verbatim:** *"The cannon sound should fire when a shot
has LANDED -- make sure that this does not overlap with teh second coin flip in a battle, but comes
a moment after it (eg. 100ms after)."*

## 1. THE OVERLAP HE WAS WORRIED ABOUT CANNOT HAPPEN — 630ms of clear air already

Measured 2026-09-06, not assumed. Timeline from the moment the SECOND flip's audio starts:

| t | what |
|---|---|
| 0 ms | `setFlipCoin("spin")` fires `playFlip()` — `src/ui/board.js:2373` |
| 965 ms | `sfx/coin-flip.mp3` ENDS (`ffprobe`: 0.964875 s) |
| 795 ms | spin over — `FLIP_SPIN_MS`, `src/ui/board.js:2330` |
| 1,595 ms | landed face has held `FLIP_LAND_HOLD_MS` = 800 (`board.js:2348`), the resolve publishes |

**So a cannon fired at the resolve lands 630 ms AFTER the coin sound has finished.** His "e.g.
100ms" is comfortably exceeded by pacing that already exists.

⭐ **THEREFORE NO OFFSET CONSTANT GETS WRITTEN.** Rule 9: the gap is derived from what the game
already computes (`FLIP_SPIN_MS + FLIP_LAND_HOLD_MS` against the stem's own length), and the honest
answer is that nothing needs adding. A typed `await sleep(100)` here would be a constant standing
in for a quantity two other constants already determine — and it would go silently wrong the day
either of them moves.

⚠ **WHAT WOULD PROVE THIS WRONG** (written before wiring, so it cannot be retrofitted): if the
cannon is ever heard on top of the coin, then either `playFlip()` is firing later than the spin
paint, or a path reaches the resolve without the 800 ms hold. Both are checkable; neither is
assumed here. `bFlip` (bot) was read and follows the same two sleeps as `hFlip` (human).

## 2. IT MUST NOT FIRE ON EVERY BATTLE — only when something actually LANDS

His words are "when a shot has LANDED". The resolve has four outcomes
(`src/orchestrator.js`, the `// ---- resolve ----` block):

| outcome | the line he reads | cannon? |
|---|---|---|
| one heads | *"X lands a hit!"* | **YES** |
| both heads, downwind | *"…but X's firing downwind and the shot hits!"* | **YES** |
| both heads, crosswind | *"…in the crosswind, the cannonballs collide."* | **NO — nothing lands** |
| both tails | *"Both miss — ⚫ TAILS all round."* | **NO** |

**The test is `scorer` being non-null**, which is exactly "a shot got through" and is already
computed. Wiring it to the battle rather than to the hit would fire a cannon over the line that
says the cannonballs collided.

## 3. NOT YET WIRED

Held while CEO review of slice 1 reads `src/ui/audio.js` and `src/orchestrator.js` — changing those
under a reviewer makes its verdict meaningless. `PP_SFX_Cannons.mp3` is 1.92 s, 33,540 bytes, and
already on the Mac at `~/Downloads/Pastry Pirates SFX/`.

---

## 4. VERIFIED IN A REAL BROWSER, not just with a file tool — 2026-09-06

`ffprobe` reads a container header. It does not prove the browser can DECODE the file, and the
whole drumroll change rests on `soundDurationMs()` returning a real number from a real
`AudioBuffer`. So the module was imported into headless Chrome against a local server, `initAudio()`
awaited, and the function called:

```
soundDurationMs("drumroll")  BEFORE any decode ->  0          (not NaN, not a throw)
soundDurationMs("drumroll")  AFTER  initAudio  ->  3148 ms
soundDurationMs("battle-won")                  ->  2900 ms
soundDurationMs("coin-flip")                   ->   965 ms
soundDurationMs("no-such-stem")                ->     0
WIN_SOUND = "battle-won"   DRUMROLL_SOUND = "drumroll"   SFX_FILES.length = 8
```

**3148 against ffprobe's 3150** — a 2 ms container-vs-decoder rounding difference, so the number the
narration box will actually use is confirmed by the decoder itself and not inferred from a header.

⭐ **THE ZERO IS THE IMPORTANT ONE.** The call site is
`flash("Drumroll...", undefined, soundDurationMs(DRUMROLL_SOUND) || undefined)` — the `|| undefined`
only saves the game from hanging the winner reveal if the function really does return a FALSY value
before decode. Measured, it returns `0`. A muted boot, an unsupported browser or a slow phone
therefore falls back to exactly the reading-speed hold it had before this change, rather than
holding the reveal open waiting for audio that is never coming.

**And `coin-flip` measured 965 ms in the browser too**, matching §1's figure from the file — so the
630 ms of clear air before the cannon is confirmed on both paths.

**Browser and local server were killed before this note was written** (`stray_probe_check`: none).
