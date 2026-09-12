# Teaching a first-time player — a proposal for Wyatt's ruling

*Written 2026-08-28 while the sea trial sailed, on his "we can design the tutorial in parallel".
**This is a proposal, not a build.** The backlog's own first line on this says the shape is his
call, not a mechanism question — so nothing here has been built.*

> ## The honest limitation, first
>
> **Nobody has watched a real first-timer play this game.** The backlog says so and it is still
> true: every word below is reasoned from the code and from what the game does NOT say out loud,
> not from a person being confused in front of us. Wyatt has watched people play — **his memory of
> where they got stuck outranks this entire document.**

---

## 1. What a new player actually gets today

They pick a recipe, and then: *"Ahoy! Choose a recipe, gather each ingredient, then sail home first
to win!"* — one sentence — and a board with four ships, seven islands, a compass with two needles,
and a prompt saying *tap to sail*.

**Everything below is true of this game and is never said to them:**

| What they must work out | How they'd find out today |
|---|---|
| **Sailing into the wind halves your move** (4 squares → 2) | They tap a far square, it isn't offered, no reason given |
| **The ghost needle is TOMORROW's wind, and it is a promise** | Never mentioned; this is the game's entire planning layer |
| **Crates get dearer as they're taken** (3🌕 → 4🌕 → 5🌕) | They pay 5🌕 for something someone else paid 3🌕 for |
| **A sold-out island still has one crate** (black market) | Almost certainly never discovered |
| **Docking home with the full recipe starts a memory game** | The bake-off arrives with no warning at all |
| **A trade hails the whole table**, not one captain | The word "trade" implies otherwise |

**The wind rule is the one that matters most.** It is what makes this a game of planning rather
than a race — and it is invisible. A player who never learns it plays a random walk and loses to
bots who don't.

## 2. What the game already does WELL — the model to copy

*"Tap and hold the sea to reveal the board"* is the best teaching in the game. It appears **in
context**, at the moment it is useful, and it **retires itself after three uses**
(`PEEK_KEY`/`PEEK_LEARNED`, `src/ui/stage.js:441`). Nobody has to read anything, and it never
nags a player who has learned it.

**That pattern is the asset here.** It is proven, it is one small function, and this game's whole
voice is in-world and unobtrusive. Anything that reads like a manual fights the game's own tone.

## 3. Before building anything — the one-line measurement

**The backlog asks whether anyone opens "How to play". The game cannot currently answer that.**
`src/ui/usage.js` records visits, starts and finishes — nothing about the menu.

**One line of code adds it**, and within a few days of real traffic it answers the question that
decides this whole item:

- **If players DO open it** — the rules page (which now writes its own numbers from the live game,
  A-7) is being read, and the gap is only the moments it can't reach. Build small, in-context.
- **If players NEVER open it** — a second thing beside it would go equally unread, and the teaching
  has to happen *inside the first voyage* or not at all.

**Recommendation: ship the measurement now, decide the shape from the answer.** It costs an hour
and it is the difference between designing from evidence and designing from a hunch.

## 4. The four shapes, sized

Each row says what a player GETS, how much of the problem it covers, and what it leaves undone.

### A. Contextual first-time hints — the PEEK model, extended ⭐ RECOMMENDED

A handful of one-line, in-world hints that appear the first time a thing happens and retire once
learned. The important one is **the wind, taught at the moment it first costs you**: the first time
a player's move is capped, the sail prompt says *"The wind's against ye — half sail. Check the
compass afore ye plan."* Then never again.

- **A player gets:** the wind rule, the forecast promise, and the rising prices — each explained at
  the exact second it first bites, in the game's own voice.
- **Covers:** the three mechanics that actually decide whether they can play well. Roughly the
  whole "why am I losing" problem.
- **Leaves undone:** the bake-off (it has its own intro card already) and the black market.
- **Size:** small — one shared helper on the proven PEEK pattern, then one line of copy per hint.
  Yours to write; I'd draft and you'd rewrite, as with every other line in the game.

### B. A guided first voyage

A scripted opening game that walks them through a turn.

- **A player gets:** the most thorough teaching, and a safe place to be wrong.
- **Covers:** everything.
- **Leaves undone:** nothing — but it costs the most by a distance, and it is a **second game mode
  to keep in step with the real one forever**. This project has paid twice for two things kept in
  step by discipline (rule 23). Every future change to a prompt would have to be mirrored here.
- **Size:** large. A phase, not an item.

### C. An interstitial before the first game

Two or three cards of "how this works" before the first voyage.

- **A player gets:** the rules, in the order we choose.
- **Covers:** everything, in theory.
- **Leaves undone:** in practice, most of it — this is a manual with a page-turner, arriving before
  anything means anything to them. It is also the one shape that **delays play**, which is the
  opposite of what the opening does now.
- **Size:** small. Low cost, low value.

### D. Make "How to play" actually read

Surface the existing page at the right moment rather than building anything new.

- **A player gets:** a good rules page (now self-updating), if they open it.
- **Covers:** depends entirely on §3's measurement. Unknowable today.
- **Size:** tiny.

## 5. What I'd do, in order

1. **Measure whether the menu is opened** (one line, ships tonight if you want it).
2. **Build shape A's wind hint alone** — the single highest-value sentence in the game — and watch
   whether it changes anything.
3. **Then decide** whether prices and the forecast need their own hints, from what the numbers say.

**Why not the whole thing at once:** every hint is a sentence in your voice that a player reads
mid-game. Three good ones beat eight that make the game chatty, and the only way to know which
three is to ship one and look.

---

**Your call on:** the shape (A/B/C/D), whether to ship the measurement first, and — if A — whether
the wind hint is the right first sentence. The copy itself is yours in every case; I draft, you
rewrite, same as the rest of the game.
