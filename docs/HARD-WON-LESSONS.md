# Hard-won lessons

Everything that went wrong, nearly went wrong, or cost real time on this project — with the
evidence that earned each rule. Written 2026-08-05 during the v2.1 build and playtest.

Sibling to `docs/DRIVING-THE-GAME.md` (which is *how* to drive the game). This is *what to distrust*.

Read the top two sections before touching a file. Everything else is reference.

---

## 1. Where your edits land

### Absolute paths, always. The shell's working directory is not stable.

The Bash tool's cwd resets to the repo root, and **it announces the reset at the bottom of unrelated
command output**, where it is easy to miss. Twice in one session, edits meant for `v2/src/` landed in
`v1/src/`. Both were caught by `git status` and reverted before any commit — nothing else would have
noticed.

The trigger both times was a command beginning `cd /tmp && …` (to write a probe script), after which
every later relative path silently resolved against the wrong tree.

```bash
# not this
python3 - <<'PY'
p='src/ui/util.js'          # resolves in BOTH trees
PY

# this
python3 - <<'PY'
p='/home/user/pastrypirates/v2/src/ui/util.js'
PY
```

### The structural hazard: two trees with identical internal paths

`v2/` is a copy of the repo's own layout, so **`src/ui/util.js` exists in both**. A mis-rooted path
does not error. It opens a real file, the edit applies cleanly, `node --check` passes, the linter is
happy — and the wrong copy is now modified. **Every safety signal reports success.**

This is the same shape as the `CNAME` hazard in `CLAUDE.md`: a copy of the repo where a familiar path
quietly means something else.

### Run the constraint as a command

A "don't touch X" constraint you only hold in your head is one you will violate silently.

```bash
git diff --name-only | grep -v '^v2/'   # must print NOTHING
```

One line. It is the only thing that actually caught this, twice.

### `http.server` inherits the cwd too

A server started after a cwd reset served from the wrong root. `/v2/index.html` returned a 404 page,
which the probe rendered as *"the welcome screen is missing"* — a convincing phantom boot failure.

```bash
python3 -m http.server 8493 --directory /home/user/pastrypirates
```

Always pass `--directory`. And `curl` one asset to confirm the root before blaming the code.

---

## 2. Do not trust your own reasoning over a measurement

This is the single biggest theme of the session. Every one of these was a confident, plausible,
**wrong** conclusion that a two-minute measurement overturned.

### Never present an inference from a screenshot as proof

Twice I read pixel positions off a phone screenshot, reasoned about them, and stated the conclusion
as established fact. Both times Wyatt — correctly — rejected it. The second rejection was blunt:
*"Your diagnosis is wrong and insanely so."*

He was right. Squinting at a 400px board image and counting grid squares is not evidence. If a
screenshot is the only artefact, say what it *suggests* and then go and measure the thing.

**Better: make the next occurrence self-reporting.** Rather than keep arguing about the sail
highlights, I shipped a self-check that re-derives the legal move set from scratch on every prompt
and, if it ever disagrees with what is drawn, replaces the helper line with a red diagnostic naming
the wind, the position and the offending squares — so the screenshot *becomes* the bug report.

### A probe that inverts the function it is testing proves nothing

To check whether the sail highlights were drawn in the right place, I derived grid coordinates by
inverting `sailHighlightRect()` — the very function that draws them. **Any error would have cancelled
out.** The honest check was comparing the highlight rect's centre against where ships are drawn
(`(c+0.5)*cellPx` in both — they agreed).

The general form: **verify against an independent path, never against the suspect itself.**

### Write the independent implementation

When Wyatt insisted the movement rule was broken and I could not find it, the thing that settled it
was a brute-force enumeration of every path up to 4 steps, **sharing no code with the game**,
compared against the game's own reachability across 1,920 board/position/wind combinations. Zero
disagreements in either direction. That is proof; "I read the code and it looks right" is not.

### Verify that a check can FAIL

Before trusting the sail self-check's silence, I planted an illegal square three moves upwind and
confirmed the check flagged it. A check you have only ever seen pass is indistinguishable from a
check that cannot fail.

### Pure functions can be measured exactly — do that instead of eyeballing

Asked to make wind particles "20% speed", the temptation is to change the number and look at it.
`windDotFrame()` is pure, so:

```
distance travelled in 1s: 48px of a 400px layer -> 0.120 layer-heights/sec
prototype was 0.35 + 0.5*0.5 = 0.600  ->  exactly 20%
```

### Measure rendered geometry, never compute it

Two separate compass-chip failures came from arithmetic that looked right:

| What I assumed | What was true |
|---|---|
| SVG units ≈ screen pixels | viewBox is 640 wide, board renders ~374px → **1 unit ≈ 0.58px** |
| The chip's `transform` attribute positions it | A CSS animation writing `transform` **overrides the SVG attribute entirely** |
| 13 chars at font-size 16 fits a 128-unit box | Text measured 132 units — **it overflowed its own chip** |

The CSS-over-SVG one is worth its own line: **a CSS `transform` silently erases an element's SVG
`transform` attribute.** The chip's position vanished whenever the storm pulse turned on, snapping it
over the dial and 28px off the board. Fix: position on an outer `<g>`, animate an inner one.

```js
// getBoundingClientRect on the real element, compared to the board's own rect
const r = el.getBoundingClientRect(), b = svg.getBoundingClientRect();
{ left: r.left - b.left, right: r.right - b.left, boardW: b.width }
```

### Beware confounded metrics

After teaching bots to read the storm forecast, "storm pushed them further" went **36% → 44%** and I
briefly reported the change as a regression. It was not: the bots were now *closer to their targets*,
so there was less room to be pushed closer and more to be pushed further. The honest outcome measure
was game length, which **improved 15 → 14 rounds**.

Pick the metric that measures the *goal*, not a proxy that moves for other reasons.

---

## 3. Verification tooling that lies to you

### `no_undef_check.js` only inspects CALL-position identifiers

`href: STORM_CLOUD_IMG` — a bare value reference to an unimported constant — **passes the gate
clean**. It would have shipped as a silently broken image. The check is a floor, not a ceiling.

### Chrome caches ES modules per URL

Documented in `DRIVING-THE-GAME.md` §1 and it *still* cost two rounds this session. A fix looked
broken because the browser served a cached `flow.js` from a port used earlier.

- **Use a port you have never loaded**, every time.
- When a change appears not to have taken effect, `curl` the file from the server and read it before
  debugging the code.
- On a phone: **a private tab**, not a reload. A normal refresh will serve the old modules and the
  fix will look broken.

### Regex-deleting an arrow-function entry stops at the wrong brace

Deleting narration entries with a brace matcher failed twice, because for
`key:(a,b)=>({...})` the depth counter returns to zero at the **params** paren, long before the body
ends. It cut the key and left the body, producing a syntax error.

**Cut entry-to-next-entry instead** — find the next line matching `^  \w+:` and delete up to it.
Immune to params, bodies, template literals and nesting alike.

---

## 4. Probe hygiene

- **Playwright is not installed.** `npm install playwright --no-save --prefix /tmp/pw`, then launch
  with `executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'`. Do **not** run
  `playwright install`.
- **`clip` takes `width`/`height`, not `w`/`h`.** Cost three runs before I read the error properly.
- **Bound every probe and kill it the moment you have the answer.** `ps aux | grep chrome-linux` and
  `grep http.server` both at zero before you finish. A worker restart mid-session killed two
  background runs and left orphans.
- **`pkill` inside a compound command aborts the rest of it.** `pkill -f x && cat > /tmp/y <<'EOF'`
  exits 144 and never writes the file — which then "does not exist" a moment later.
- **A driven game takes tens of minutes to reach an end of voyage.** Inject the state instead
  (`DRIVING-THE-GAME.md` §5e). Injecting a full recipe at a human prompt reached the End of Voyage
  screen in ~90 seconds.
- **`appState` is not a window global.** `const st = (await import('/v2/src/state/index.js')).appState;`
  — a probe reading `window.appState` throws, and the resulting error looks exactly like a game bug.

---

## 5. Design and code lessons

### When you replace an algorithm, find out what the old one was compensating for

v1's `stepToward` used Dijkstra. The v2 rewrite scored candidate moves on Manhattan distance instead.
Manhattan lies next to land — a dock two squares away round the corner of its own island is four
squares of real sailing — so bots refused every move that did not shorten a line they could not
travel. **A third of all bot turns did nothing at all.** The tell was in the data (33% dead turns),
not in the code, which read perfectly sensibly.

### A rule the agents ignore reads as an unfair rule

Storms looked brutal at 38% of ships grounded per storm. The rules were fine; the **bots were sailing
into storms the compass had already shown them**. Teaching them to look one round ahead halved it to
20% and changed nothing else about how they play.

**Before tuning a number, check whether the agents are actually using the information the design
already gives them.**

### Deleting a punishment can delete a whole family of edge cases

The storm rule had grown five outcomes and three meanings for "dock". Asked what would simplify it
most, Wyatt dropped the lost turn entirely. The rule became one sentence — *"Land and other ships
stop ye short"* — and out went four narration entries, their audio mappings, an engine outcome, the
forfeit branch in **both** turn paths, and a how-to-play paragraph.

It cost nothing measurable: storms still shove 2.9 squares (most of a turn's sailing) and still fling
~0.85 ships per storm into the rim; **median game length did not move**.

### One word meaning three things will produce a family of bugs

"Dock" meant *a shelter you can be blown into*, *a shelter that holds you against land*, and *not a
shelter that stops you being blown away* — depending on approach direction. Two bugs in that family
surfaced within one session. `isBerth()` is now the single answer to "is this a berth".

### Anything drawn over a focal element competes with it

Three attempts at the forecast marker:

1. **Ghost needle** — same object, smaller and greyer. Mistaken for the live wind; produced a bogus
   "I sailed 3 upwind" bug report.
2. **Red chevron on the needle** — a genuinely different object and perfectly legible, but it shouted
   louder than the thing it was annotating.
3. **A chip beside the dial** — annotates without competing. This one worked.

### Silence is a bug

Removing the grounding rule left a storm outcome (land stops you) that narrated **nothing at all**.
Wyatt asked for the "dropped anchor" line back, and it turned out to be exactly the line that filled
the hole. When you delete a rule, check what its narration was covering.

### Rendering from event snapshots hides mid-turn state changes

The Captains panel draws coins from `events[evIdx].state`, not live player state. Dock coins were
awarded *before* the buy prompt but the event was emitted *after* it — so the game offered a purchase
priced against a total it had not shown yet. Fix: a silent `purse` event carrying the new snapshot at
the moment of the mutation.

**Any state change separated from its event by an `await` is invisible until the event lands.**

### The check must run before the side effect it prevents

Bot trade memory filtered *responses* after the offer had already been announced. But **the
announcement is the spam** — offers barely fell (706 → 543). Moving the check before the hail:
706 → 375, identical repeats **365 → 31 (−92%)**, and the hit rate doubled.

### `needs()` excludes what you already hold

`def.ing.some(i => needs(def).includes(i))` is **always false** — `needs()` is the recipe *minus* the
hold. The battle flee condition read that way and defenders fled **0 times in 3000 simulated
fights**. Test held crates against `recipe`, not `needs`.

---

## 6. Working with Wyatt

- **Ask 2–5 clarifying questions before building** (his standing rule, in `CLAUDE.md`). For the v2
  ruleset this ran to 62 questions across 16 batches before a line of code was written, and it was
  the right call — several answers were "a better third thing" neither option offered.
- **Taste, placement, wording and "how much is enough" are his. Mechanism is yours.** When he asks for
  copy, *propose it for approval* rather than shipping it silently.
- **He asks for renders — produce actual images.** Screenshot the real thing at phone scale
  (`viewport: {width:430,height:930}`) and send it. Do not describe what it will look like.
- **When he says a diagnosis is wrong, re-measure — do not defend it.** Both times he pushed back
  this session he was right and I was reasoning from too little.
- **Frame trade-offs with numbers.** Every design decision he made quickly was one where he was
  handed real measurements ("34.8% of your reachable squares are storm-proof, the shove helps 25% of
  the time") rather than adjectives.

---

## 7. The v2 build, in one paragraph

`v2/` is a full copy of the game beside v1, sharing `../assets` and `../sfx` (988K of its own).
Solo/pass-and-play only: Firebase script tags and the Host/Join cards removed, `src/net/` left on
disk unused so multiplayer is two `<script>` tags away. It ships from `main` and is served at
`playpastrypirates.com/v2/`, kept out of search by `Disallow: /v2/` in the root `robots.txt` plus a
`noindex` meta. **It must never carry `CNAME`, `robots.txt` or `sitemap.xml` of its own** — see
`CLAUDE.md` for why that can take the live game down. Rules live in `v2/RULES-V2.md`.
