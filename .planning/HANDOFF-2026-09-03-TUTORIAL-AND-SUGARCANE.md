# Handoff — 2026-09-03 — the tutorial spec, the crate rename, and the sugar-cane art batch

Written at Wyatt's request as this session was restarted mid-art-batch. A fresh session should be
able to pick up cold from this file alone. **Every ruling is also in
[`.claude/memory/DECISIONS.md`](../.claude/memory/DECISIONS.md) — read that first, it is the
authority; this file is the situation report.**

Branch: `claude/cloud-handoff-planning-a9ay1u`. **No game code was changed all session.** The only
tracked files touched are records: `.claude/memory/DECISIONS.md`, `.planning/CEO-REVIEWS.md`, and the
new `art-review/ingredients-sugarcane/` batch folder.

---

## 1. WHERE TO PICK UP — the one live task

**Generate the remaining sugar-cane icon candidates in Gemini, at prompt v3.** Five images exist,
none of them on the current brief. Details in §4. Everything else below is settled context.

---

## 2. WHAT THIS SESSION PRODUCED (all published, all live)

| what | link |
|---|---|
| **The Pilot** — the tutorial spec (rev 4) | https://claude.ai/code/artifact/c649f0df-b3d6-4837-8f08-b6c44a8aef18 |
| **Pilot Fittings** — the option sheets he chose from | https://claude.ai/code/artifact/365d5a1e-3e9d-4daf-b1a4-41cfebba3077 |
| **Mocked On The Board** — mocks drawn inside a live voyage | https://claude.ai/code/artifact/3aec2f18-4f35-459e-8aaa-367a550eb805 |
| **The Chart Room** — earlier companion | https://claude.ai/code/artifact/3f6fbed6-66aa-4f8a-91c2-c6cc626fa803 |
| **Course Tuner** — live slider tool, his settings baked in | https://claude.ai/code/artifact/4e122a8a-3329-4ef6-b389-b69d12ca2637 |
| **Crate or Ingredient** — his 31 rulings, db-backed | https://claude.ai/code/artifact/15a5f335-6746-4fda-a80f-63fee9511fb0 |
| **Sugar Cane — ten studies** — my SVG studies (NOT the real process) | https://claude.ai/code/artifact/375cc93e-d955-483f-9af5-2107123340c0 |

**Read his crate rulings back with the Artifact tool** rather than asking him again:
`action:"read_db"`, `db_op:"list"`, `collection:"decisions"`, url = the Crate or Ingredient link.
All 31 are ruled (20 change, 11 keep). `decisions/sugarWord` was deliberately DELETED — see §3.

---

## 3. SETTLED — do not reopen any of this

**The tutorial is "The Pilot":** every teachable moment holds a short array of phrasings, longest
first, indexed by how many times that moment has been seen; **the bottom rung of every array is the
copy that ships today**, so a veteran's game is byte-identical. 29 rulings are in `DECISIONS.md`.
Highlights: parrot + `?` button (parrot KEEPS the Start button — one voice in two places); two-state
toggle; dashes not dots, constant size, opacity-only fade; dashes curve along the source line; the
marker pulses and the ripple ring is gone; one continuous tour; decay by time away.

**His final course settings** (the tuner's baseline, and the spec):
```json
{"len":8,"gap":7,"thk":2.6,"ang":7,"a1":0.13,"f1":0.3,"a2":0.05,"f2":0.85,"jit":0.02,
 "rnd":14,"o0":0.98,"o1":0.42,"sep":0.85,"clp":0.34,"mk":0.5,"pd":0.15,"ps":1.2,"mark":"x"}
```
**The X is his own drawing**, `notes/x.png` (265x284). **`notes/` is gitignored** — shipping means
copying it into `assets/icons/` first. The tuner embeds a 149x160 downscale; copy the original.

**The crate language is settled.** Ingredients are called ingredients EXCEPT where the word is a unit
of supply (an island's stock), the bake-off bench (his cup-and-ball reason), and the dock's arrival
line. Final flavour set — **"a crate of X"**:
```
Sugar Cane   Milk Jugs   Cinnamon Sticks   Wheat Sheaves
Cacao Pods   Speckled Eggs   Vanilla Beans
```
**`ING_NAME.sugar` moves from "Crystal Sugar" to "Sugar Cane"** so the card and the dock agree.

**Why Sugar Cane, and it is a structural find, not a word choice.** Six of seven ingredients name the
RAW thing the baker transforms; sugar alone named the refined product. `Cacao Pods -> chocolate` asks
a player to imagine something; `Crystal Sugar -> sugar` asks nothing. **GRAVEYARD — words he rejected,
do not re-propose:** Sugar Cubes (*"no one would ever bake with sugar cubes"*), Sugar Loaves
(*"sounds like a finished bakery product"* — **"loaf" primes BREAD in a baking game**), Lumps (not
delicious), Casks (hard to picture), Jars (weird), Bricks (not delicious), **Sugar Gems (he approved
then withdrew it minutes later: *"as a human, it just doesn't quite make intuitive sense"*)**.

---

## 4. THE LIVE TASK — the sugar-cane art batch

### The process is `.planning/art-audit.md` + `.planning/art-generation-process.md`
**READ BOTH BEFORE TOUCHING ANYTHING.** They are tracked and shared. **They are NOT in `notes/`** —
they moved out on 2026-08-02 (commit `e9c7e700`) precisely because `notes/` is gitignored. An
out-of-date memory pointed this session at the dead `notes/` path; it then *invented* a process by
inferring one from the `art-review/` folder and had to be corrected by Wyatt. **Do not repeat that.**

### Where the batch stands: `art-review/ingredients-sugarcane/`
`prompts.json` holds every prompt, with `prompt_v1`, `prompt_v2` and the current `prompt` (v3).

| file | brief | state |
|---|---|---|
| `01-standing-sheaf.png` | v1 green | on WHITE (Gemini ignored the background) and 2730x1536 |
| `03-diagonal-stalk.png` | v1 green | on-brief background, 2048x2090. Cleanest v1 |
| `04-crossed-pair.png` | v1 green | on-brief background, 2752x1536 (16:9 not 1:1) |
| `05-tied-bundle.png` | v1 green | on-brief background |
| `03v2-diagonal-purple.png` | v2 | PARTIAL MISS — only purple *banding* on a green stalk, and no sugar pile at all |

**None are on the current brief.** Judge the v1 four on silhouette only.

### The brief evolved three times — v3 is current
- **v1** green cane. **v2** (his note) *"i want the sugar cane to look more purple -- doesn't it
  often?"* — yes: **purple ribbon cane is a real variety**. Plus *"i want it to show a pile of
  glittering sugar next to it too"*.
- **v3** (his note, the last thing he said before the restart): *"you can boost up the purple to make
  it stand out more and make it look more delicious/sumptuous"*. v3 is already written into
  `prompts.json` — vivid royal purple/magenta/plum, glossy and jewel-like, explicitly appetising, plus
  a generous glittering sugar heap. **Nothing has been generated at v3 yet.**

### Driving Gemini — hard-won specifics, all measured this session
Chrome window at coordinate frame **1456x828**. Screenshots at `scale:0.5` (halve the displayed
coords to read them, but ALWAYS pass full-frame coords back).
- **New chat** `(73, 114)` · **input box** `(812, 413)` · **send arrow** `(1164, 504)` after a ~1050
  char prompt · **download button** `(1192, 290)` after scrolling up 5 ticks at `(900, 400)`.
- **Enter does NOT submit. Neither does cmd+Return** (tested — the runbook is right, only the arrow
  works). **cmd+A selects the whole PAGE, not the textarea** — never use it to clear the box; start a
  New chat instead.
- **The send click misses roughly half the time** because the input box resizes. The runbook's
  instruction to screenshot before every send is correct and this session paid for ignoring it.
  Recovery is easy: the post-wait screenshot shows the text still sitting in the box.
- Generation takes **40–60s**, longer than the runbook's 18s.
- **Downloads land in `~/Downloads`** and — contrary to `art-generation-process.md` §0 — **Bash CAN
  read, write and move files there.** Verified this session. No directory grant is needed. Move with:
  `N=$(ls -t ~/Downloads/Gemini_Generated_Image_*.png | head -1); mv "$N" art-review/ingredients-sugarcane/NN-slug.png`
- **Gemini errored twice on prompt 02** (stacked billets) with a hard "I encountered an error".
  Prompt 03 succeeded immediately after, so it was prompt-specific, not an outage.

### Next steps, in order
1. Generate the ten at **v3**, one per new chat, staging into `art-review/ingredients-sugarcane/`.
2. **Build `art-review/ingredients-sugarcane/gallery.html`** — the runbook requires: full-size image,
   filename, the **exact prompt used** in a `<details>`, a `<textarea>` per card, **localStorage
   autosave**, an **Export feedback (JSON)** button, a **Copy to clipboard** button, and a **Clear
   all**. Flag every quality miss on its card (background, aspect ratio, ignored brief). Open it with
   `open <path>`, never the browser navigate tool. *(A gallery build was written and then interrupted
   before it ran — it is not on disk.)*
3. **STOP for his review.** Do not crop, key or wire anything into `assets/` until he approves a
   specific image. Integration is a separate, separately-triggered step.

---

## 5. STILL OPEN, needing him

- **Which cane icon** wins — nothing chosen.
- **The two picker defects** he was offered and left unticked: the *"Bake this!"* pill covers the
  recipe artwork, and the picker card hides the lower 45% of the board.
- ~~**`notes/x.png` must move to `assets/icons/`** before the X can ship.~~ **DONE 2026-09-03** —
  the 265x284 original is now `assets/icons/course-marker-x.png` (not the tuner's downscale), and the
  source is `art-review/x/x.psd`. Named `course-marker-x` because `cancel-x.png` and `close-x.png`
  already exist. The originals are still in the gitignored `notes/`; these copies are the tracked ones.
- **The ribbon overflows at 320px** once the `?` is added (measured: 21px, at any variant). The fix
  belongs to the ribbon's flex behaviour and can ship on its own.

## 6. MISTAKES THIS SESSION MADE — so the next one does not

1. **Searched from memory instead of the repo** and invented an art process. The runbook was in the
   obvious place all along.
2. **Ignored a documented instruction to save round-trips** (the screenshot-before-send rule) and
   lost more turns to failed sends than it saved.
3. **Four CEO reviews in a row caught the same fault: a claim the page's own evidence contradicts** —
   a caption over the wrong picture, a duplicated screenshot, a wave described as slower when its own
   numbers made it faster. **Standing correction: after writing any caption, re-open the image and
   read the caption against the picture.**
4. **Invented a constraint and defended it for rounds** — that every crate must hold countable plural
   things. It was tidiness, not a rule, and it cost several rounds of wrong suggestions before Wyatt
   found the actual structural answer himself.
