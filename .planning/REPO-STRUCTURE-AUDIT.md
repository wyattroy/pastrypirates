# Repo & project-file structure — audit and proposal

**Status: PROPOSAL. Nothing here has been executed.** Wyatt asked for the write-up first
(2026-08-02): *"can you audit the whole project to see what is git-ignored, and what isn't, and make
better recommendations for how to structure the git, and project files?"* — and then, on scope,
chose to decide later rather than have it done at the end of a long session.

His direction is already recorded per problem below. What is missing is only the go-ahead.

---

## Measurements (2026-08-02)

| area | tracked | share | note |
|---|---|---|---|
| **`art-review/`** | **484.1 MB** | **94%** | raw Gemini output + one 43.8 MB `.psd` |
| `assets/` | 18.1 MB | 3% | the art the game actually ships |
| `.planning/` | 9.1 MB | 2% | 383 files |
| `scripts/` | 4.2 MB | <1% | 65 files |
| `src/` | 0.7 MB | <1% | **the entire game engine + UI, 20 files** |
| `docs/` | 0.1 MB | <1% | 5 files |
| **`notes/`** | **IGNORED** | — | 189 MB on Wyatt's disk only |

`.git` is **572 MB**; `size-pack` 464.7 MB. `.gitignore` says to revisit "when the tracked total
passes ~700 MB (Pages caps a published site at 1 GB)" — that threshold is closer than it reads,
because the pack is already 464 MB and Pages counts what it publishes.

**The shape of the problem in one line: the game is 1% of its own repository.**

---

## Problem 1 — `art-review/` is 94% of the repo, and it is on the public internet

**Evidence.** Measured live:

```
https://playpastrypirates.com/art-review/coin/coin-heads.psd  ->  HTTP 200, 45,939,909 bytes
```

A 43.8 MB Photoshop file, and every raw Gemini export, are publicly downloadable from the game's
own domain. Nothing links to them, but nothing prevents a crawler either, and all of it counts
against the Pages 1 GB cap and sits in every clone.

**THE CRITICAL DETAIL, and it changes the obvious plan.** `.gitignore` proposes moving "the whole
folder" to an orphan branch. **That would break `npm test`.** Three gates read from `art-review/`:

| script | reads |
|---|---|
| `scripts/extract_narration_lines.js` | writes `narration-inventory.json` |
| `scripts/narration_audit_check.js` | `narration-inventory.json`, `narration-approved-baseline.json`, `narration-id-aliases.json`, `narration-retired-ids.json`, `narration-table-baseline.json` |
| `scripts/ui_contract_check.js` | `narration-audit.html` (the PIRATE_MAP spec) |

Fortunately the split is almost perfectly clean:

| | size | files |
|---|---|---|
| media (`.png .jpg .jpeg .psd`) | **483.5 MB** | 110 |
| tooling + data (`.html .js .json .md`) | **0.6 MB** | 12 |

**Recommendation (Wyatt chose this): archive the 110 MEDIA files to an orphan `art-archive` branch;
keep the 12 tooling files on `main`.** Removes 483 MB from every clone and from the published site,
and `npm test` is untouched because it only ever reads the 0.6 MB.

The 12 files that must stay:

```
art-review/README-narration-audit.md      art-review/narration-core.js
art-review/gallery.html                   art-review/narration-approved-baseline.json
art-review/gallery-batch2.html            art-review/narration-id-aliases.json
art-review/gallery-icons.html             art-review/narration-inventory.json
art-review/gallery-sound.html             art-review/narration-retired-ids.json
art-review/narration-audit.html           art-review/narration-table-baseline.json
```

**Why an orphan branch and not `.gitignore`.** The existing comment already answers this and it is
still right: Gemini output is not reproducible — the same prompt yields a different image — so this
is the only backup of art that cannot be remade, and an ignored file is one `git clean -xdf` from
gone. An orphan branch keeps the bytes in the repository while removing them from `main`.

**Second, independent fix regardless of the above:** stop Pages publishing `art-review/` at all. It
is review tooling, not the game. The gallery pages are opened from a local server during art work.

---

## Problem 2 — the provenance trail is unreadable to everyone but Wyatt

**48 tracked files cite `notes/`**, which is gitignored. The citations are the *evidence* for why
decisions were made, quoted from code comments and planning documents:

| cited target | references |
|---|---|
| `notes/edits …` (the playtest PDFs) | 35 |
| `notes/edits for pastry pirates.pdf` | 8 |
| `notes/trade winds animation bug.mov` | 6 |
| `notes/tradewinds v5.mov` | 5 |
| `notes/tradewinds jitter.mov` | 3 |
| plus `ONLINE_SETUP.md` (9 refs) and `DESIGN_REPORT.md` (4 refs), both ignored at the repo root | 13 |

Two files of this class were fixed on 2026-08-02 (`art-audit.md`, `art-generation-process.md` moved
to `.planning/`). **This is the same defect, 24× larger.** A session reading
`// notes/edits BUG-01 …` in `src/` cannot open it, cannot verify the claim, and has no idea whether
the comment still describes reality.

`notes/` is 189 MB, and the bulk is not the valuable part:

| | size |
|---|---|
| `narration-box-bug-2.mov` | 100 MB |
| `ripple bug.mov` | 33 MB |
| `narration sizing glitches.mov` | 29 MB |
| 2 playtest PDFs | 13.5 MB |
| **5 markdown docs + board map** | **~5 MB** |

**Recommendation (Wyatt chose this): track the documents, describe the media.**

1. Move the 5 markdown docs (`RULES.md`, `Rules_boardgame.md`, `DESIGN_REPORT.md`,
   `ONLINE_SETUP.md`, `pastry_pirates_recipes.md`) and the board map into the repo. Kilobytes, and
   they are already cited by tracked files.
2. Leave the `.mov` and `.pdf` bulk out of git, but **rewrite each citation to say what the
   recording showed**:

   ```
   BEFORE   // see notes/trade winds animation bug.mov
   AFTER    // the ring ran ~2 squares ahead of the boat for the whole sweep
            // (screen recording, 2026-07-31, held locally)
   ```

   A pointer nobody can follow is worse than a sentence that carries the finding.

---

## Problem 3 — `art-review/narration-inventory.json` is three things at once

It is **generated** by `npm test`, **served** at runtime (`narration-audit.html` does
`fetch("narration-inventory.json")`), and used as a **historical baseline**
(`narration_audit_check.js` runs `git show <commit>:art-review/narration-inventory.json` for drift
detection).

Consequence: the working tree goes dirty on every test run. **74 commits have touched this file**,
and it had to be discarded repeatedly during this session's work — friction on every commit, and a
standing risk that a real change gets swept up in a "just the generated file" discard.

**No recommendation yet — this one needs a decision, and all three roles are legitimate:**

- **(a)** Make the writer a no-op when output is byte-identical. Smallest change, kills the churn,
  keeps all three roles. Does not help when content genuinely changes.
- **(b)** Split the roles: generated copy under a build path (ignored), a committed snapshot only
  when it is deliberately re-baselined. Cleanest conceptually; touches the drift-detection logic,
  which is load-bearing.
- **(c)** Leave it and document the churn as expected. Zero risk, permanent papercut.

---

## Problem 4 — the ignore rules do not express any principle

Today's rules are a list of accidents rather than a taxonomy:

```
.DS_Store            ← noise, correct
__pycache__/         ← build output, correct
ONLINE_SETUP.md      ← a REFERENCE DOC, cited by 9 tracked files
DESIGN_REPORT.md     ← a REFERENCE DOC, cited by 4 tracked files
notes/               ← 5 MB of cited docs AND 162 MB of media, one rule for both
node_modules/        ← correct
```

Two reference documents are ignored by name at the root while remaining cited from tracked files,
and one directory rule covers material of two entirely different kinds.

**Proposed principle — sort by WHY a file exists, not where it happened to land:**

| kind | home | tracked? |
|---|---|---|
| the game | `src/ index.html assets/ sfx/` | yes |
| gates and tooling | `scripts/`, `art-review/*.{html,js,json}` | yes |
| decisions and their evidence | `.planning/`, `docs/` | yes |
| irreplaceable raw art | orphan `art-archive` branch | yes, off `main` |
| bulk media evidence (`.mov`, big PDFs) | local only, **described** in the citing file | no |
| machine noise / build output | anywhere | no |

---

## Execution plan, for when this is approved

Ordered so each step is independently verifiable and independently revertible.

**Step 1 — stop publishing `art-review/`** (smallest, immediate, reversible)
Verify: `curl -o /dev/null -w "%{http_code}" https://playpastrypirates.com/art-review/coin/coin-heads.psd`
returns 404.

**Step 2 — track the reference docs and repair the dead citations**
Move the 5 markdown docs + board map into `.planning/` (or `docs/`), repoint all references, rewrite
`.mov`/PDF citations as descriptions.
Verify: `git ls-files -z | xargs -0 grep -l "notes/"` returns nothing; `npm test` green.

**Step 3 — archive the 110 media files to `art-archive`**
Keep the 12 tooling files on `main`.
Verify **before deleting anything from `main`**: the orphan branch contains all 110 files and their
bytes match; `npm test` still green on `main` afterwards; the gallery pages still open locally with
a documented checkout step.

**Step 4 — decide Problem 3** (a, b or c above).

**Risks worth stating plainly**

- Step 3 is the only one that is awkward to undo, because it rewrites where 483 MB lives. Do it
  alone, on a quiet day, not bundled with anything else.
- The `.psd` is 43.8 MB and irreplaceable — confirm it is on `art-archive` and readable **before** it
  leaves `main`.
- `git clean -xdf` remains the standing hazard for anything ignored. That is exactly why the raw art
  goes to a branch rather than into `.gitignore`.
- History still contains the 484 MB. Removing it from `main` shrinks new clones' checkout, not the
  pack. Genuinely shrinking `.git` means rewriting history (`git filter-repo`), which breaks every
  existing clone and is **not** recommended here.

---

**Source:** full-repo audit, 2026-08-02, at Wyatt's request. Measurements taken from the live tree
and the live site on that date; re-measure before acting if significant time has passed.
