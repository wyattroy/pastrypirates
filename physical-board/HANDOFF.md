# HANDOFF — the laser-cut Pastry Pirates, 2026-09-12

Written to start a **fresh session** cold. Read this whole file first. It supersedes
[`HANDOFF-2026-08-22.md`](HANDOFF-2026-08-22.md) — keep that one for the island saga (§3),
the icon line-up method, and the chest build notes, which are still true.

**Wyatt is a designer, not an engineer.** Plain English. No toolchain nouns. Ask intent with the
question UI, never in prose. His taste is his; mechanism is yours.

---

## 0. The first thing to know: the working folder's `git status` is a lie

Open a terminal in `/Users/wyattroy/Documents/Projects/pastrypirates` and `git status` shows
**129 changed files, 67 of them staged deletions**, including today's hand-made art. It looks like
somebody wiped `.planning/`.

**Nobody deleted anything. Do not commit it. See §1.**

---

## 1. The `.planning` "mass deletion" — investigated 2026-09-12, closed

### Who caused it

**No one.** There was no deletion. This is a **stale checkout** reading as one.

Two working folders are checked out on the **same branch, `dev`**:

| Folder | On | State |
|---|---|---|
| `/Users/wyattroy/Documents/Projects/pastrypirates` (the main folder) | `dev` | files + index frozen at `b622c317`, **2026-09-09 14:15** — its last `git pull` |
| `.claude/worktrees/google-search-console-020493` | `dev` | live; has added **85 commits** since, through `d445a767` today |

The second folder is the session titled **“Mac: Dev”** — `local_5b2ec633-5fa1-43d9-8f2d-451981cc64dd`,
still running. It is the one doing the captain's-box art work.

In git, a branch pointer is shared between folders but the *files* and the *staging area* are not.
So the main folder's `HEAD` now points at today's `dev` tip while its files are three days old.
`git status` compares the two and reports the difference as **your** pending change:

- a file `dev` **gained** since Sep 9 → reads as a **staged deletion**
- a file `dev` **changed** since Sep 9 → reads as a **staged modification**

### The proof, not the theory

```
index tree vs b622c317 tree  →  exactly 2 differences
    M  .claude/CLAUDE.md          (Wyatt's own trim, already committed as 3990a401)
    A  docs/ARTIFACT-GUIDELINES.md (restored by hand this session)

dev gained since b622c317     →  68 files added, 61 modified, 0 deleted
staged "deletions"            →  67, every one of them a file dev ADDED
```

Every "deleted" file — `.planning/CURRENT-SHEET.md`, `.planning/posed/*`, `.planning/sea-trials/*`,
`art-review/captains-box/*.jpeg`, `scripts/qa/_*.mjs` — has an **add** commit on `dev` dated
2026-09-09 or later and **no delete commit anywhere**. They are on disk in the Mac: Dev worktree
right now.

### Same story for `docs/ARTIFACT-GUIDELINES.md`

It was never deleted either. It was **born** on `dev` in `b6e16987` (2026-09-10) — *after* the main
folder's last pull — so it simply was not in this folder. Restoring it here was the right call; the
19 new lines of **§11 A QUESTION CARRIES ITS OWN EVIDENCE** written on top of it are the only
genuinely new tracked content in the whole main folder.

*(`physical-board/README.md` still carries a line saying that file is "currently DELETED from the
working tree." That line is wrong and is corrected in this pass.)*

### Should it be committed?

**No. Committing it would be a serious loss.** It would delete 68 files from `dev` — including
2026-09-11's captain's-box and sugar-cane art, which was committed precisely because *"it cannot be
remade"* — and revert 61 more to Sep 9, undoing 85 commits of the Mac: Dev session's work while it
is still running.

**This has already happened once here.** `dev` carries the commit:

> `0d0116a0` — *Restore his CLAUDE.md — my own `git add -A` reverted it two minutes after pushing it*

That is this exact trap, sprung, two days ago. **Never run `git add -A`, `git commit -a`, or
`git add .` in the main folder.**

### The repair — safe, and it loses nothing

Verified before writing: `dev == origin/dev` (pushed, nothing local-only); nothing exists in the
index that is absent from `HEAD`; `physical-board/` is in `.git/info/exclude` with **0** tracked
files, so a restore cannot touch the laser work.

```bash
cd /Users/wyattroy/Documents/Projects/pastrypirates
cp docs/ARTIFACT-GUIDELINES.md /tmp/AG-keep.md   # the 19 new lines — the only unique content
git fetch origin && git restore --source=HEAD --staged --worktree .
cp /tmp/AG-keep.md docs/ARTIFACT-GUIDELINES.md   # put §11 back on top of the real file
git status --short                               # expect ONE line: M docs/ARTIFACT-GUIDELINES.md
```

Then commit that one file to `dev` normally, by path (`git commit docs/ARTIFACT-GUIDELINES.md`),
never `-a`.

**Ask Wyatt before running it.** It overwrites ~60 stale files in his main folder. It is safe, but
it is his folder, and the Mac: Dev session is live in the same repo.

### Why it will recur if nothing changes

Two folders on one branch is the cause. Either Mac: Dev moves onto its own branch, or the main
folder stops being treated as a place to run `git status` at all. Worth putting to him as a
question once the repair is done.

---

## 2. Seeing the other sessions on this machine

The session tools are deferred — load them first, in one call:

```
ToolSearch  query: select:mcp__ccd_session_mgmt__list_sessions,mcp__ccd_session_mgmt__search_session_transcripts,mcp__ccd_session_mgmt__send_message,mcp__ccd_session_mgmt__get_session
```

Then `list_sessions` for what is running, `search_session_transcripts` to find which session
discussed a file or a decision, and `send_message` to talk to one. As of 2026-09-12 15:23 UTC the
two live ones in this repo are:

| Title | Session id | Folder |
|---|---|---|
| **Mac: Dev** | `local_5b2ec633-5fa1-43d9-8f2d-451981cc64dd` | `.claude/worktrees/google-search-console-020493` |
| this laser work | — | the main folder (branch `physical-board`, via plumbing) |

`git worktree list` is the other half of the picture, and it is the one that does not lie about
which branch a folder is really on.

---

## 3. Where the laser set stands

Branch tip **`3644dafa`**, folder clean against it (verified). Everything is generated by
`physical-board/generate.mjs` — one file, ~190 KB, the single source. `node generate.mjs` rewrites
every SVG, DXF and `tuner-data.json`, and prunes stale `sheet-N.*`.

**Material, and the rule:** `MAT6 = 6.0`, `MAT3 = 3.1` — his calipered sheet, not a nominal number.
**Caliper every new sheet and set it in the source.** `KERF = 0.18` (6 mm), `KERF3 = 0.08` (3 mm).

| Group | State |
|---|---|
| Board | **One continuous circle** on the 6 mm sheet, cut in situ so the grain runs through all four quarters. His ruling, twice. Do not split it. |
| Two boards | Both games on one **42 × 78 cm** sheet with the small parts packed round them. `GRID_SCALE = 0.934` was *solved* from that sheet, not typed — squares are 23.35 mm. |
| 3 mm | Two games on **three** sheets, 222 pieces, 0 overlaps, 99/98/88 % fill, against a measured 2.22-sheet floor. |
| Islands | **Seven** (he removed two). Each rastered with the one ingredient it stocks and its price in a coin, 3/4/5, from the engine's own ladder. |
| Ingredient tiles | Rounded squares that sit on the grass and flip for the bakeoff. His dialled numbers are in the source as defaults. |
| Docks | T-shaped, 50 % into the square, full-circle bollards, one plank language throughout. Tortuga's are baked in. |
| Tortuga | 1 square, docks integral, its own cut file. |
| Spinner | WIND NOW flag gone (it would not pack flat); a cut arrow below WIND NOW on the ring; N S E W as black coins with white letters on the outer ring, matching the inner wheel. |
| Ships | **Mast A, his spec:** 2 mm nub, 4 mm post, 6.98 mm tab — the tab wider than the post so its shoulders bear on the deck. Left/right imbalance 0.001 mm. Options b/c retired and deleted. |
| Crates, chests | Cut, but the 3 mm press fits came out **loose** — see §4. |

**The two live pages. Re-use them in place; publishing without the URL orphans what he has dialled.**

| Page | URL |
|---|---|
| Cutting sheets | https://claude.ai/code/artifact/e7bbbc72-cad8-4550-b0c6-102416ad449f |
| Board pieces (the tuner) | https://claude.ai/code/artifact/29500861-942d-4690-a1ef-cae20fe0e54e |

---

## 4. Open, and waiting on him

1. **The 3 mm kerf.** `KERF3 = 0.08` dates from the old 2.6 mm batch, and it is why the crates and
   chests were loose enough that he had to glue them. **He is to caliper a sail tab from the next
   cut** — drawn 6.9 mm — and report the number. Finished minus drawn gives the real kerf, and the
   thin-ply joints get corrected from it. Nothing else unblocks this.
2. **The staged illusion in the main folder** — §1. Offer the repair; do not run it unasked.
3. **His verdict on the Mast A render**, sent at the end of the last session.

---

## 5. How to work this branch

**Nothing here may ever land on `main`** (public, serves the live game) or on `dev`. The folder is
git-ignored in the main checkout. Commit without switching branches, through a temporary index:

```bash
export GIT_INDEX_FILE=$(mktemp) && git read-tree physical-board && git add -f -A physical-board \
  && T=$(git write-tree) && C=$(git commit-tree $T -p physical-board -F msg.txt) \
  && unset GIT_INDEX_FILE && git update-ref refs/heads/physical-board $C
```

zsh gotcha: write `${C}:refs/heads/x` — zsh reads `:r` as a modifier.

**Rules this work earned the hard way:**

- **A question carries its own evidence.** A choice between shapes shows the shapes, in the page, at
  one scale, beside what they replace. A link back to chat is a round trip, not context.
  (`docs/ARTIFACT-GUIDELINES.md` §11.)
- **The preview stays pinned** while he scrolls the dials. No standfirst, no byline.
- **Kerf is compensated outward on outlines, inward on holes**, so the *finished* part matches the
  design. Seams cut in situ carry `noKerf` — offsetting them would close the open polyline.
- **A hole must not be flagged EXTERNAL in a DXF hatch** or Rhino fills it solid black and he has to
  delete layers by hand at the laser. `art/dxf.py` nests by containment and samples the centroid
  plus eight edge midpoints, majority vote — one sample left 146 holes wrong.
- **Show him the render, magnified and true size, before you ask.** Three mast rounds were rejected
  because the drawings were not the real geometry.
