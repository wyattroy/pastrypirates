---
task: narration-audit-tool-hardening
type: quick
created: 2026-07-29
baseline_commit: ab98e04
files_modified:
  - scripts/narration_audit_check.js
  - scripts/narration_copy_check.js
  - scripts/apply_narration_copy.js
  - scripts/extract_narration_lines.js
  - scripts/ui_contract_check.js
  - scripts/narration_test.js
  - art-review/narration-core.js
  - art-review/narration-audit.html
  - art-review/narration-inventory.json
  - art-review/narration-id-aliases.json
  - art-review/narration-retired-ids.json
  - art-review/narration-table-baseline.json
  - art-review/narration-approved-baseline.json
  - art-review/README-narration-audit.md
  - src/ui/flow.js
  - src/ui/util.js
  - src/ui/panel.js
  - src/ui/lobby.js
  - src/ui/board.js
  - src/orchestrator.js
  - package.json
autonomous: false
requirements: [NARR-01]
decisions: [D-01, D-16, D-21, D-22, D-25, D-26, D-27, D-28, D-29, D-30, D-31, D-32, D-33, D-34, D-36, D-38, D-40, D-42, D-43, D-44, D-47, D-50, D-51, D-53, D-54]

must_haves:
  truths:
    - "The audit page renders every card from a cold clone with zero hand-edits — and `npm test` proves it without a browser"
    - "Card identity survives BOTH a source move and a copy rewrite: no adhoc/prompt/button/misc card id contains a line number"
    - "All 209 of Wyatt's reviewed dispositions survive the migration — each bound to a live card, or retired against his OWN `merge` instruction; 209 = aliased + retired, arithmetically, with the retirement set pinned as a literal 6-id list"
    - "All 155 fields where Wyatt stored player-facing copy are compared to what he actually wrote (89 neutral + 55 addressed + 11 second-party, merge-tagged rows excluded); the 104 rows carrying no neutral copy are pinned to a committed baseline so future drift fails — two classes, reported separately, neither pretending to be the other"
    - "Approved copy is applied by command, and a bad write cannot land silently: dry-run diff by default, refusal on ambiguity, re-render proof before any byte is written"
    - "Every player-facing sink in the UI files is either a reviewable card or a reasoned, presence-verified exclusion; and no card presents text a player can never read"
    - "CO-REACHABILITY: an explanation is reachable in the state it explains — a greyed control's reason is never suppressed by an independent condition, and every `disabled:` option has a reachable reason"
    - "DELIVERY: no broadcast's content branches on the local viewer — spectators receive the spectator line and the actor receives the prompt, asserted per seat without a browser"
    - "Every affordance Wyatt works with is still present, asserted structurally rather than trusted"
    - "GOVERNING: src/engine/index.js has an empty diff; 31/31 determinism fixtures verify; npm test green at every commit (15 gates -> 17)"
  artifacts:
    - scripts/narration_audit_check.js
    - scripts/narration_copy_check.js
    - scripts/apply_narration_copy.js
    - art-review/narration-core.js
    - art-review/narration-id-aliases.json
    - art-review/narration-retired-ids.json
    - art-review/narration-table-baseline.json
    - art-review/narration-approved-baseline.json
    - art-review/README-narration-audit.md
  key_links:
    - "`@copy` marker in source -> extractor `id` -> card id -> alias map -> Wyatt's 209 dispositions: the one chain that must never break again"
    - "narration-core.js -> the page AND the Node gates: one renderer, two consumers, so the browser stops being the only place the tool's health can be checked"
    - "committed approved export -> narration_copy_check.js -> npm test: shipped == approved becomes a standing contract, not a one-time sweep"
    - "apply_narration_copy.js -> re-render proof -> refuse: the writer never trusts itself"
    - "one broadcast -> every client: content that branches on the local viewer can never be right, which is the shared root of D-35/D-55/D-57/F7"
---

<objective>
Turn `art-review/narration-audit.html` + `scripts/extract_narration_lines.js` from a one-shot artifact
into a tool Wyatt can re-enter indefinitely, every time the game's player-facing wording needs work.

Purpose: this is his explicit ask — *"solidify the logic in narration-audit.html to make it usable
longterm, so that these issues don't happen again… I'd like to keep coming back to this tool to
improve all player-facing wording going forward — so we need it to work reliably."*

Output: 10 atomic commits + one blocking decision gate. Two new scripts in the `npm test` chain
(15 -> 17 gates) plus two new assertions inside `ui_contract_check.js`, one shared render core, stable
content-anchored card ids, all 209 reviewed dispositions carried across, an applier whose bad writes
cannot land, and the two live playtest defects fixed with the gates that catch their class.
</objective>

<current_state>
## The tool is not fragile. It is dead at HEAD. Measured, not estimated.

Every number below was measured against `ab98e04` while planning. They are the acceptance baseline
for Task 1, which must reproduce them.

| Measurement | Value |
|---|---|
| Hardcoded `file:line` literals in `narration-audit.html` | **91 distinct / 147 occurrences** |
| …of those, no longer matching any live extracted site | **80 distinct** |
| Flow-chart (`NODE_GROUPS`) lookups that **throw** | **48 of 83** |
| Flow-chart lookups that silently render nothing | **25 of 83** |
| **First throwing lookup, in render order** | `miscLobbyCard("src/ui/lobby.js:115")` — the very first node group |
| Per-site ad-hoc renderers orphaned (keyed to a line with no call site) | **20 of 26** |
| Live ad-hoc sites with no renderer at all | **22 of 25** |
| Wyatt's reviewed rows that are line-number-keyed | **141 of 209** |
| …of those, orphaned by drift (no live card carries that id) | **130** |

`adhocCards()` and `requireMiscEntry()` **throw** on a missing key (a deliberate 15-05 choice, so a
bad key names itself). With the first node group throwing, the exception escapes the whole render:
**the page shows its loading placeholder and nothing else.** Wyatt has not discovered this yet
because he last used the tool before 15-06 shipped.

So "the tool decayed the moment source moved" understates it. It decayed into a blank screen, and
his 130 drifted review marks would read as *unreviewed* even if it rendered.

## Which parts already work, and must not be rewritten

The brief's narrowing is correct and is scoped into this plan:

| Surface | Identity today | Action |
|---|---|---|
| `table:<key>[~<branch>]` (50 rows) | event type + branch name — **content-stable** | leave alone |
| `misc:awards:<badgeKey>` (11) | badge key — **content-stable** | leave alone |
| `misc:dockFlavor:<ing>` (7) | ingredient key — **content-stable** | leave alone |
| `adhoc:` / `prompt:` / `button:` / `sub:` / `misc:<cat>:<file>:<line>` (141) | `file:line` — **drifts** | migrate |

Prompt and button *text* also already works the right way: `evalSource()` runs the real extracted
expression instead of hand-transcribing it. That is the pattern to generalise, not replace.
</current_state>

<disposition_arithmetic>
## What is actually comparable in his 209 rows — and what is not

Measured from `15-DISPOSITIONS-FINAL.json`. **This is the constraint that shapes Task 5**, and getting
it wrong produces a gate that can only pass.

| Class | Rows / fields | What is stored | What a gate can honestly assert |
|---|---|---|---|
| **Approval — neutral** | 89 rows | his typed replacement copy in `notes` | shipped text == his text. A real assertion. |
| **Approval — addressed** | **55 fields** | his typed `addressedNotes`, on `rewrite` (32) and derived-`keep` (23) rows | same |
| **Approval — second party** | 11 fields (from `15-ADDRESSED2-APPROVED.json`) | his typed text | same |
| **Drift — derived `keep`** | **exactly 104 rows** | no *neutral* text; 23 of them do carry an addressed field, counted above | only that the neutral text has not changed since a pinned baseline |
| Informational — `merge` | 16 rows | usually nothing — but see the exception below | structural; 15-06 already resolved them |

89 + 104 + 16 = 209 rows. Approval **fields** total **155**.

**Exclude merge rows from the addressed class — one of them holds an instruction, not copy.** 56 rows
carry a non-empty `addressedNotes`, but one is `adhoc:src/ui/flow.js:524`, a `merge`-tagged row whose
field reads *"Merge with Trade refusal (D-08, new addressed copy this phase) / src/ui/flow.js:516 ·
humanTrade()"* — a note to Claude about where the line goes, never wording for a player. Comparing it
against shipped text is a guaranteed failure that would land on `KNOWN_DIVERGENT`, burn one of Task 6's
six cap slots, and label an instruction as an approval. So the addressed class is **55**, and the rule
is structural: **a `merge`-tagged row contributes no approval field, in any position.** (This is also
why the merge row above is not simply "stores nothing".)

**Two subtleties inside the 104.** 102 rows are tagged `keep`; the other 2 are tagged `rewrite` with an
empty notes box, which D-26 rule 2 resolves to `keep` — the exact case D-26 says the card must state
out loud. The gate must derive intent by D-26's rules, never read the raw tag.

**The drift count is 104 before AND after migration — assert equality, never a window.** All six
retirements are `merge`-tagged, so **not one of them is a derived-`keep` row**; migration removes
nothing from this class. A tolerance of "104 minus at most 6" would let six of Wyatt's rows vanish with
the gate still green — the precise slack this section exists to remove. Pin `=== 104`.

**Why the naive keep-comparison is a trap.** D-25 makes `keep` mean "ship exactly what this card
displayed", and what the card displayed was the *pirate-converted* rendering the page produced live.
That rendering was **never persisted**. So a gate that "compares the shipped side to the approval" for
a keep row has only two options, and both are wrong:

- re-render the approval from the shipped source -> it is comparing the shipped side to itself. An
  assertion that can only pass. This is precisely what `ui_contract_check.js`'s own 5e negative
  control exists to catch, and it would be self-inflicted here.
- re-render the approval from `ddefa8f` -> red-flags nearly every keep row, because 15-06's D-29
  conversion **deliberately** reworded them. A gate that fails on correct work gets weakened, then
  stops catching anything.

**The design, therefore:** Task 4 freezes each derived-`keep` card's rendered text into a committed
baseline at migration time, and Task 5 treats those 104 rows as a **drift** class against that
artifact — the same shape as `determinism_baseline.js`, which is this repo's established way of
pinning something that cannot be derived. The 155 approval fields are compared to Wyatt's own words.
The gate reports the two counts separately and **labels the drift class as a drift class**, so nobody
later mistakes it for proof that he approved that wording.
</disposition_arithmetic>

<verification_dimensions>
## Four dimensions, not two — and the two missing ones are live bugs

A live two-tab playtest found three defects that every gate in this plan would have passed. The reason
is structural: "is this string right?" has four independent answers, and the tool only ever asked two.

| # | Dimension | Question | Owner | State |
|---|---|---|---|---|
| 1 | **Provenance** | does shipped text match what Wyatt approved? | Task 5's copy gate | covered |
| 2 | **Structural reachability** | can this string ever render at all? | the page's D-33/34/40/43 badges | covered |
| 3 | **Co-reachability** | does it render in the STATE IT DESCRIBES? | **Task 8, new** | **missing** |
| 4 | **Delivery** | does it reach the INTENDED VIEWER? | **Task 9, new** | **missing** |

Dimensions 3 and 4 are why a string can be provably present, provably reachable, byte-identical to its
approval — and still never do its job. Each has a live instance, measured:

- **Co-reachability (F11).** `src/ui/flow.js:639-641` assigns the helper text `sub` across an
  `if`/`else if` chain. Wyatt's approved reason for the greyed Trade button sits in the `else` arm, so it
  is unreachable whenever an attack target happens to be adjacent — two independent conditions made
  mutually exclusive. Measured live: the greyed Trade button rendered with **Attack's** helper text
  beneath it while Attack was enabled. The string exists, ships verbatim, and is structurally reachable.
  It simply never appears in the state it explains.
- **Delivery (F7).** `src/ui/util.js:906` sends `onBroadcast(seat===appState.mySeat ? msg : spectMsg)`.
  `ask()` runs on the host, so `mySeat` is the *host's* seat, and one broadcast reaches the whole table —
  a single message cannot express a per-viewer difference. Measured live on a guest: the host's raw
  prompts arrived verbatim (`Wyatt, what'll ye do:` held 1694ms), and of **2516 recorded narration lines,
  zero** contained "is deciding" or "is choosing". The spectator line never reached any client.

**Delivery is the shared root of four recorded decisions.** D-35 (sail wording), D-55 (highlight DOM
contract), D-57 (guest fade) and now F7 are all one host path and one guest path for a single concept,
drifting independently. D-56 concluded "host/guest drift is ONE path, not a pattern" — that conclusion
answered a narrower question (*does guest-side code author its own text?*) and was right about it. The
rule below catches a different failure: not who writes the string, but **who receives it**.
</verification_dimensions>

<root_cause_analysis>
## Identity: why the obvious anchor is the wrong one

The brief asks for two options to be weighed and one recommended.

| Option | Survives a source move? | Survives a **copy rewrite**? | Verdict |
|---|---|---|---|
| **A. Normalised hash of the string literal + enclosing fn** | yes | **no** | **Rejected.** The id changes every time Wyatt rewrites a line — the tool's *primary operation*. It would destroy review state on exactly the action the tool exists to support. |
| **B. Enclosing function + ordinal within it** | mostly | yes | **Rejected as primary.** A new `flash()` inserted mid-function silently renumbers every later site in that function. Same silent drift, new costume. |
| **C. Explicit stable id declared in source** | yes | yes | **CHOSEN.** |

**Recommendation: C — an explicit `// @copy <id>` marker comment at each player-facing copy site.**

Three reasons, in order of weight:

1. **It survives both events that actually happen.** A wording pass rewrites copy; a code change
   moves lines. Every other scheme fails one of the two.
2. **It is exactly the address the applier needs.** With a marker naming the site, the writer's
   target is one unambiguous literal. "Multi-match anchor" stops being a refusal case the applier
   has to heuristically detect and becomes structurally impossible.
3. **Drift goes from silent to impossible.** An id can only vanish if someone deletes the marker,
   and Task 7's gate fails on any live copy site without one. Contrast today: `applyMeta()` fails
   only on a *missing* key, so a stale key silently attaches the wrong label to a shifted site while
   an orphan sits unnoticed — the trap the extractor's own header already warns about.

Cost, stated plainly: ~83 comment-only insertions across 6 files, one time, proven comment-only.

## Fidelity: the second decay, and why a shared core is the fix

Identity is only half the rot. `narration-audit.html` **hand-writes** the current text for every
ad-hoc site in its own per-site renderer table. Those literals were true when typed and are now
20-of-26 orphaned and pre-15-06 in wording ("the storm **moves** you", "swept into the trade winds",
"your turn") — copy the game no longer ships. Table cards do not have this problem, because they call
the real builders through `describeFor()`.

So the durable move is to delete the hand-transcribed layer and render every card from live source,
and to put that rendering in **one module both the page and Node can import**. That single change:

- makes stale card text structurally impossible (there is no second copy of the wording to go stale),
- lets `npm test` check the tool's health **without a browser**, which is the reason "nothing enforced
  it afterwards" was true for the last two drifts,
- gives the copy gate and the applier a real renderer instead of a re-implementation that would drift
  from the page — the same disease one level up.
</root_cause_analysis>

<governing_constraints>
These hold for EVERY task. A task that violates one is wrong even if its own check passes.

1. **`src/engine/index.js` keeps an EMPTY diff.** No engine change, no event change, no event-field
   change — that invalidates all 31 determinism fixtures and forces a gated re-record
   (`docs/DETERMINISM-RERECORD.md`). Assert per task:
   `git diff --stat ab98e04..HEAD -- src/engine/index.js` prints nothing.
2. **`npm test` stays green at every commit boundary**, exit 0. It grows 15 -> 17 gates; it never
   goes red in between. A new gate is committed either already-green or deliberately not yet wired
   (Task 1 is the one such case, and says so).
3. **`node scripts/determinism_baseline.js --verify` stays 31/31.**
4. **Layer purity.** `src/ui/` never imports `src/net/`. `art-review/narration-core.js` is review
   tooling: neither `index.html` nor anything under `src/` may import it, and it must never be
   required for the game to run.
5. **No build step, no CDN, no external library, no new dependency.** The `dependencies` /
   `devDependencies` keys of `package.json` stay byte-identical; only its `scripts` block changes.
   The page keeps importing live ES modules from `src/` so it stays truthful to shipped code.
6. **Vanilla JS at the surrounding density.** Annotate every decision inline in the established
   form: `// D-NN (Wyatt-approved 2026-07-29): ...`.
7. **D-16 is absolute.** Wyatt's notes are words only. The absence of an icon from a note is NEVER
   an instruction to remove it. Any applied rewrite re-attaches the existing icon markup; shipping a
   plain-text note as the literal string is a defect.
8. **Wyatt is a non-coder.** Anything that renders *on the page* or in the runbook is plain language.
   Gate output may be technical; it is read by Claude, not by him.
9. **Never re-match an approved row to source by line number.** Match by stable id, by curated
   label, or by the string literal — the rule 15-06's gap-closure pass already had to adopt.
</governing_constraints>

<preserve_list>
## Every affordance he works with — asserted, not trusted

Task 1's gate carries an **affordance census**: a list of the DOM/CSS/function hooks each affordance
depends on, asserted present in `narration-audit.html` on every run. A refactor that quietly drops
one fails the build. The census is authoritative; this table is its source.

| Affordance | Decision | Hook the census pins |
|---|---|---|
| Reviewed state + progress counter | D-27 | `.reviewedBox`, `.isReviewed`, `reviewProgress`, `reviewed:` in the export row |
| Derived-intent line, computed live | D-26 | `.derivedIntent`, `renderDerivedLine`, `computeIntent` |
| Typing auto-selects `rewrite`, without clobbering a deliberate `cut`/`merge` | D-42 | the notes-input handler's tag-set branch, guarded on the current tag |
| 2nd copy field (addressed) | D-47 | `.addressedNotesArea`, `.addressedDerivedIntent` |
| 3rd copy field on two-party cards only, role-labelled | D-54 | `.addressedNotesArea2`, `data-role-label`, `checkAddressedFieldPresent` |
| Separate Question field that never becomes copy | D-26 | `.questionArea`, and `question` absent from `computeIntent` |
| Canonical merge target, never a cycle | D-36 / D-44 | `.mergeTargetSelect`, `.mergeTargetCustom`, the acyclic check |
| Shared-wording notice, "one string several doors" vs "separate strings that match" | D-28 | the shared-wording notice builder + the distinct merge cross-reference |
| Dead / guarded / config-dead badges | D-33/34/40/43 | `.deadCopyNote`, `.guardedNote`, `checkDeadCopyMarking` |
| Fabricated events satisfying real emit-site invariants | D-51 | `assertBattleEventInvariants`, `FABRICATED_EVENT_VIOLATIONS` |
| Live pirate + sign normalisation, so `keep` ships what he sees | D-25/29/38 | `finalize`, `applySignRule`, `checkSignRule` |
| Flow chart with really-drawn SVG edges surviving resize | D-22 | `drawEdges`, `edgeSvg`, the debounced `resize` listener |
| localStorage persistence | — | `STORAGE_KEY`, `loadSaved`, `saveAll` |
| JSON export | — | `exportBtn` and its per-row key set |

**One deliberate exception, and it is not a loss.** `STORAGE_KEY` is bumped one version (Task 4).
It has to be: the ids change, so old-era entries would sit alongside new ones and quietly mix two
schemes. It is safe *only because* Task 4 also moves the state of record out of the browser and into
the committed export — after which any browser, or a fresh machine, reconstructs his full 209-row
review from the repo. That is strictly more durable than today, where his work exists in exactly one
browser profile.
</preserve_list>

<human_vs_gate>
## What a human must eyeball, and what a gate settles

The brief asks for this split to be explicit and the human list to be short. It is **one sitting**.

**Gate-settled — no human needed, and deliberately so:**
every card resolves and renders (Task 1/4 gate, browser-free); no card shows placeholder text (Task 3);
all 209 dispositions carried across with no reviewed-count loss (Task 4); shipped text equals approved
text (Task 5); the applier refuses ambiguity and proves its own write (Task 6); every player-facing
sink is carded or excluded (Task 7); a greyed control's reason is reachable in the state it explains
(Task 8); every broadcast reaches its intended viewer (Task 9); every affordance hook present (Task 1
census).

**Human — exactly one sitting, Task 11, five numbered items:**
1. Open the page. Confirm it renders: stages, cards, drawn edges, and the counter reading `209 of N`.
2. Resize the window once. Confirm the edges follow.
3. Read three named cards **as copy** and say whether they read right. Not a verification task — the
   gate already proves the card text equals the shipped source, so there is nothing for him to
   cross-check. This is a judgment only he can make.
4. Confirm six retirements, **presented to him as plain-language bullets** naming the line and why it
   is gone.
5. Rule on the residual list, **also presented as plain-language bullets**.

Items 1-3 exist because the page is a visual tool and no gate can see layout or judge voice.

**Two rules on his time, both binding:**
- **He runs no commands and reads no gate output.** Governing constraint 8 applies to the checkpoint
  itself: Claude runs `npm run audit:check`, reads it, and writes items 4 and 5 out as bullets. The
  runbook's four commands are for *his own* future passes, when he chooses to start one — never a
  prerequisite for a ruling.
- **No game playtest is required, and item 3 must not smuggle one in.** No shipped behaviour changes
  in Tasks 1-5 or 7-8. If Task 6 writes a copy row, its diff is item 5 and `npm test` plus the 31-seed
  determinism verify have already passed. He may play if he wants to; this task does not ask him to.
</human_vs_gate>

<ordering_rationale>
Identity is settled and proven before anything is built on it, because everything downstream keys off
it. Fidelity comes next, so the page's stale hand-written layer is deleted *before* the re-key rather
than being re-keyed and then thrown away. The gates come before the writer, per the brief.

1. **Task 1 — gate first, red.** Written to fail, reproducing the measurements above. It is the
   acceptance test for Tasks 3 and 4, and the evidence that the tool is currently dead. Not wired
   into `npm test` while red, so constraint 2 holds.
2. **Task 2 — identity in source.** `@copy` markers + extractor binds them. Nothing else can be
   correct until ids are stable.
3. **Task 3 — fidelity.** The shared core; hand-transcribed per-site text deleted. Verified
   browser-free via the core, which is the point.
4. **Task 4 — the page re-key + the 209-row migration.** Task 1's gate goes green and becomes gate 16.
5. **Task 5 — the copy gate** (shipped == approved). Gate 17.
6. **Task 6 — the applier**, which drains Task 5's divergence list. Writer after gate, deliberately.
7. **Task 7 — scope enforcement, both directions**, permanently.
8. **Task 8 — co-reachability**: fix F11, then gate it (dimension 3).
9. **Task 9 — delivery**: fix F7, then gate it (dimension 4). Both gates land with their fix, per the
   scoping decision below.
10. **Task 10 — the runbook**, so he can re-enter the tool without Claude reconstructing how.
11. **Task 11 — the single human sitting.**

**Every new gate is red-proofed.** Each ships a `--drill` mode that builds a synthetic violation in
a temp dir, runs the real check function against it, and asserts FAIL — plus at least one **negative
control** asserting the exclusion lists do not simply swallow everything. This follows
`scripts/ui_contract_check.js`'s existing drill, including the lesson its own 5e control taught: an
assertion that can only ever pass is not a gate.

## Scoping the two new gates: option (a) — fix the bug in the same task as its gate

Both new gates describe **live bugs**, so each would fail on today's tree. The choice was between fixing
the code alongside the gate, or landing the gate green with a named allowlist entry. **Option (a), for
both, for four reasons:**

1. **An allowlist entry for a live bug is the softer form of the thing this task exists to end.** This
   plan already caps `KNOWN_DIVERGENT` at 6 with a stale-entry check *because* allowlists rot into
   permanent cover. Adding two more entries for defects we just found would contradict that stance in
   the same document.
2. **Both fixes are mechanism conversions, not new copy.** Neither invents a string, so neither needs
   Wyatt's approval. Gate A's fix makes an already-approved string reachable; Gate B's fix routes
   already-written strings through the D-10 neutral-plus-variants mechanism that already ships and is
   already covered by `narration_test.js`'s per-seat assertions.
3. **Gate A's fix completes D-41**, a binding approved decision that is currently violated. Adding a
   gate that tolerates a violated decision is exactly the D-17/D-29 failure this whole task follows from.
4. **The red-proof gets stronger, not weaker.** Each drill runs its real check function against the
   genuinely broken code at `ab98e04`, read via `git show` — not a synthetic approximation. A gate
   written loosely enough to pass the broken tree therefore fails its own drill.

**Wyatt's one sitting does not grow.** Proof for both fixes is headless: Gate A's reachability is
structural, and Gate B's delivery is asserted per seat through the existing variant-selection harness.
A two-tab confirmation is welcome whenever he next plays, but nothing here depends on it.
</ordering_rationale>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|---|---|
| repo source -> `new Function()` in the page and in the Node gates | extracted expressions are compiled and run to render card text |
| tool -> `src/**/*.js` | the applier writes shipped source files |
| browser localStorage -> review state | previously the only home for Wyatt's 209 dispositions |
| package manager | **no installs anywhere in this task** |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|---|---|---|---|---|---|
| T-QT-01 | Tampering | `apply_narration_copy.js` writing `src/**/*.js` | high | mitigate | Dry-run is the default; `--write` is explicit. Every candidate literal is re-rendered and must match the approval by projection before a byte is written; any ambiguity refuses the row. After a write: `npm test`, 31/31 determinism, empty engine diff, and the diff is shown to Wyatt at Task 11. |
| T-QT-02 | Elevation of Privilege | `evalSource()` / `new Function()` in the page and gates | medium | mitigate | Only expressions extracted from the repo's own tracked source are compiled — never a disposition field, never network input, never anything Wyatt types. Dispositions are compared as data, never evaluated. The core is review tooling: Task 3 gates that neither `index.html` nor `src/` imports it, so nothing reaches a player. |
| T-QT-03 | Repudiation | review state living only in one browser's localStorage | medium | mitigate | Task 4 moves the state of record into the committed export; the migration asserts 209 rows in / 209 reviewed out, and the seed is reproducible on any machine. |
| T-QT-04 | Denial of Service (of the tool) | one stale key throwing and blanking the page | high | mitigate | Task 1's resolvability gate runs in `npm test`; Task 4 additionally renders an unresolvable card as a named error card instead of throwing, so a future gap degrades to one visible broken card, never a blank page. |
| T-QT-05 | Information Disclosure | gate output naming file paths and copy | low | accept | All content is already in the repo; the gates run locally and write no new artifact outside `art-review/`. |
| T-QT-SC | Tampering | npm/pip/cargo installs | high | accept | **No package-manager install occurs in this task.** RESEARCH.md's Package Legitimacy Gate is therefore not applicable, and no legitimacy checkpoint is required. Asserted mechanically per task: `package.json`'s `dependencies`/`devDependencies` keys stay byte-identical and `package-lock.json` is not created. |
</threat_model>

<tasks>

<!-- planner-discipline-allow: ADHOC_RENDERERS -->
<!-- planner-discipline-allow: PIRATE_MAP -->
<!-- planner-discipline-allow: PASS2_ROWS -->
<!-- planner-discipline-allow: KNOWN FRAGILITY -->
<!-- planner-discipline-allow: const PRONOUN_RE = -->

<task type="tracer" id="1">
  <name>Task 1: the audit-health gate — written RED, reproducing the measured death</name>
  <files>scripts/narration_audit_check.js</files>
  <precondition>`art-review/narration-inventory.json` exists and `node scripts/extract_narration_lines.js` exits 0 (it was repaired at `8b18467`); `art-review/narration-audit.html` has never been checked by any gate.</precondition>
  <action>
Write a new gate following `scripts/ui_contract_check.js`'s conventions exactly: shebang, a header
naming what is gated and why, ESM imports from `node:fs`/`node:path`/`node:url`, one PASS/FAIL line
per assertion, **every assertion run before exit** so one run reports every problem, failures named
with file and key, and a `--drill` mode.

It is a **static** gate — it never needs a DOM. It reads `art-review/narration-audit.html` as text
and `art-review/narration-inventory.json` as data.

**Assertion 1 — resolvability (the one that is red today).** Parse every card-lookup call in the
page's flow-chart node table: the ad-hoc lookup, the prompt lookup, and each of the misc-category
lookups, capturing the string argument of each. Resolve each against the inventory using the SAME
key shape the page's own maps use (ad-hoc by `file:line`; misc by `category:file:line`; prompts by
`file:line`). Report each unresolvable key with the calling helper's name, and classify it:
`FATAL` where the page's helper throws, `SILENT` where it returns an empty list. Fail on any of
either kind, because a silent miss is how D-30's prompts went absent in the first place.

**Assertion 2 — orphan detection, the direction `applyMeta()` cannot see.** Every key in the page's
own per-site tables (the ad-hoc renderer table, the pass-through sets, the guarded-text map, the
prompt renderer/sub-renderer maps, the parameter-prompt declaration map, the sign-rule override and
exempt sets, the two-party role-label map, the extra-tag and label-override tables, the legacy id
pin) must correspond to a live inventory site. An entry keyed to a site that no longer exists is an
orphan: it cannot fire, and its stale key can attach the wrong metadata to a shifted site.

**Assertion 3 — every live site is placed exactly once.** Every inventory entry (ad-hoc, prompt,
misc, award) must be reachable from exactly one flow-chart node. Zero placements means a card Wyatt
cannot see (D-21/D-30/D-32's whole failure mode); two means a duplicate that would export twice.

**Assertion 4 — the affordance census.** Assert each hook named in this plan's Preserve List is
present in the page, one PASS/FAIL line per affordance, naming the affordance in Wyatt's own words
plus the decision id. Search the page as raw text with no comment stripping, so a hook that survives
only inside a comment still fails (a commented-out affordance is a removed affordance).

**Assertion 5 — no line-number keying.** Count card-id-shaped string literals of the form
`<path>.js:<digits>` in the page, excluding lines whose first non-whitespace characters are `//`.
**Report DISTINCT and OCCURRENCE counts as two separate labelled numbers** — today they are 91 and 147
respectively, and conflating them is how a gate fails its own verify at the first commit. The
assertion FAILS while either is above zero; after Task 4 both must be 0. Print the first ten distinct
offenders so the failure is actionable rather than a bare number.

**`--drill`.** For each of the five assertions, build a synthetic minimal page + inventory pair under
`fs.mkdtempSync`, run the real check function against it, and assert it reports FAIL. Add a
**negative control**: a synthetic pair that is fully consistent must PASS, proving the assertions are
not vacuous. Never touch the real tree.

**Do NOT wire this into `npm test` in this task** — assertions 1, 2, 3 and 5 are red against HEAD for
real reasons that Tasks 3 and 4 fix. Wiring it now would make every intervening commit red for
something that commit did not cause: the exact trap `ui_contract_check.js`'s own header warns about.
Say so in the header, naming Task 4 as the wiring point.

Record the measured red counts in the header as the acceptance baseline, so a future reader can tell
a repaired gate from a weakened one.
  </action>
  <verify>
    <automated>
# 1. the gate is RED, and red for the measured reasons (this is the expected state at this commit)
node scripts/narration_audit_check.js; test $? -eq 1 || { echo "EXPECTED EXIT 1"; exit 1; }

# 2. it reproduces the four headline measurements
node scripts/narration_audit_check.js 2>&1 | tee /tmp/audit1.txt | grep -qE 'FATAL.*lobby\.js:115' \
  || { echo "must name the first fatal lookup"; exit 1; }
test "$(grep -c 'FATAL' /tmp/audit1.txt)" -ge 48 || { echo "expected >=48 FATAL keys"; exit 1; }
test "$(grep -c 'SILENT' /tmp/audit1.txt)" -ge 25 || { echo "expected >=25 SILENT keys"; exit 1; }
grep -qE 'orphan' /tmp/audit1.txt || { echo "orphan assertion must report"; exit 1; }
# FLAG 9: distinct and occurrence counts are DIFFERENT numbers and must both be reported
grep -qiE 'distinct[^0-9]*91' /tmp/audit1.txt || { echo "must report 91 DISTINCT line-keyed literals"; exit 1; }
grep -qiE 'occurrence[^0-9]*147' /tmp/audit1.txt || { echo "must report 147 OCCURRENCES"; exit 1; }

# 3. the affordance census reports every affordance, and passes today (nothing is dropped yet)
test "$(grep -c 'affordance' /tmp/audit1.txt)" -ge 14 || { echo "expected >=14 affordance lines"; exit 1; }
grep -E 'affordance' /tmp/audit1.txt | grep -c '^FAIL' | grep -qx 0 || { echo "no affordance may be missing yet"; exit 1; }

# 4. red-proof drill passes, negative control included
node scripts/narration_audit_check.js --drill
node scripts/narration_audit_check.js --drill 2>&1 | grep -qi 'negative control' || { echo "drill needs a negative control"; exit 1; }

# 5. NOT wired into npm test yet, and npm test still green
grep -c 'narration_audit_check' package.json | grep -qx 0
npm test

# 6. governing constraints
git diff --stat ab98e04..HEAD -- src/engine/index.js   # must print nothing
node -e 'const a=require("./package.json");const b=JSON.parse(require("child_process").execSync("git show ab98e04:package.json"));
if(JSON.stringify(a.dependencies)!==JSON.stringify(b.dependencies)||JSON.stringify(a.devDependencies)!==JSON.stringify(b.devDependencies))throw new Error("dependency keys changed");console.log("PASS no dependency change");'
test ! -f package-lock.json
    </automated>
  </verify>
  <done>
`scripts/narration_audit_check.js` exists, exits 1, and names at least 48 FATAL and 25 SILENT
unresolvable lookups including `src/ui/lobby.js:115` as the first fatal one; reports the orphan
renderer entries and the count of 91 line-number-keyed literals; passes all 14+ affordance
assertions; `--drill` exits 0 with a negative control. The gate is deliberately NOT in `npm test`,
`npm test` is green, the engine diff is empty, and no dependency changed.
  </done>
  <commit>test(audit): add the narration-audit health gate — RED, proving the page cannot render at HEAD</commit>
</task>

<task type="auto" id="2">
  <name>Task 2: stable copy ids declared in source, bound by the extractor</name>
  <files>src/ui/flow.js, src/ui/util.js, src/ui/panel.js, src/ui/lobby.js, src/orchestrator.js, scripts/extract_narration_lines.js, art-review/narration-inventory.json, art-review/narration-retired-ids.json</files>
  <reversibility rating="reversible">Marker insertions are comment-only and the extractor change is additive — `git revert` restores the previous keying with no data loss, since no disposition file is touched in this task.</reversibility>
  <action>
Give every player-facing copy site an explicit, permanent id, per the Root Cause Analysis decision.

**Marker syntax.** A line comment `// @copy <id>` on the line immediately above the site, or as a
trailing comment on the site's own line where a preceding line would break the surrounding density
(inside a ternary, for instance).

**Id rules, all mechanically enforced:**

- character set `[a-z0-9.-]+` only, dot-separated, globally unique;
- must NOT contain `(` — the extractor's independent call counters skip whole comment lines, and an
  id containing a call-shaped fragment could perturb a raw count;
- must NOT contain the pre-conversion second-person pronoun tokens — `ui_contract_check.js`'s
  assertion 5 deliberately does not strip comments, so a trailing marker carrying one would trip it;
- named for the **moment and role**, never the wording, so a rewrite never invalidates an id:
  `adhoc.storm.brokeanchor`, `adhoc.turn.banner`, `adhoc.sidebet.backed`, `prompt.storm.anchororflip`,
  `prompt.act.menu`, `misc.mperror.roomfull`, `misc.battleline.bothheadsdownwind`,
  `misc.lobby.waitcaption`.

**Scope: the 83 sites the extractor already finds** — 25 ad-hoc, 28 prompt, 30 misc. Table keys,
award keys and dock-flavour keys are already content-stable and get no marker.

**Extractor changes** (`scripts/extract_narration_lines.js`):

1. Parse markers per file. Bind each to the next qualifying extracted site at or after its own line,
   within the same enclosing function.
2. Emit `id` on every ad-hoc, prompt and misc inventory entry. Keep `file`, `line` and `fn` — they
   remain valuable for *reporting* and for the applier's diff output, but nothing may key off them
   again.
3. Re-key the curated per-site metadata table from `file:line` to `id`, each entry keeping its own
   existing label, group, tag and merge target verbatim. **Move each label with its own site** — the
   trap 15-06's own gap-closure hit was that only a missing key fails, so a stale key silently
   relabels a shifted site.
4. Derive button ids independently of the label text, since the label is precisely what Wyatt edits:
   extend the label extractor to also capture each option's `value:` expression, and form the button
   id as the prompt id plus the value where the value is present and unique within that prompt,
   falling back to the ordinal otherwise. Print how many fell back, so the weaker case stays visible.
5. Fail loudly and by name on: a live site with no marker; two markers binding to the same site; a
   marker binding to nothing; a duplicate id; an id violating the character rules; a metadata entry
   whose id has no live site.

**A retired-id ledger, because uniqueness among live sites is not enough.** Create
`art-review/narration-retired-ids.json` and make the extractor refuse to issue any id listed in it.
Without this, a future site could claim a string a deleted site once used, and the alias map would
hand it a dead card's review mark — a wrong mark is worse than a missing one, which is D-44's whole
lesson. Ship the file in this task with an empty list and a header explaining the rule; Task 4
populates it from the migration's retirements and proves the refusal fires.

Then regenerate the inventory.

**This task changes no string literal.** Verification proves that, not asserts it.
  </action>
  <verify>
    <automated>
# 1. extraction green and byte-stable across two runs
node scripts/extract_narration_lines.js
cp art-review/narration-inventory.json /tmp/inv1.json
node scripts/extract_narration_lines.js
diff -q /tmp/inv1.json art-review/narration-inventory.json

# 2. every ad-hoc/prompt/misc entry has a legal, unique id
node -e '
const inv=require("./art-review/narration-inventory.json");
const RE=/^[a-z0-9][a-z0-9.-]*$/;
const all=[...inv.adhoc,...inv.prompts,...inv.misc];
const bad=all.filter(e=>!e.id||!RE.test(e.id));
if(bad.length)throw new Error("illegal/missing id: "+JSON.stringify(bad.slice(0,5)));
const ids=all.map(e=>e.id); const dup=ids.filter((x,i)=>ids.indexOf(x)!==i);
if(dup.length)throw new Error("duplicate ids: "+dup.join(", "));
const pron=/\b(you|your|yours|yourself)\b/;
if(ids.some(i=>pron.test(i)))throw new Error("an id carries a pre-conversion pronoun token");
if(ids.some(i=>i.includes("(")))throw new Error("an id contains a paren");
console.log("PASS "+ids.length+" stable ids, all legal and unique");
'

# 3. marker count in source equals the number of extracted sites
node -e '
const fs=require("fs");
const files=["src/ui/flow.js","src/ui/util.js","src/ui/panel.js","src/ui/lobby.js","src/orchestrator.js"];
const n=files.reduce((a,f)=>a+(fs.readFileSync(f,"utf8").match(/@copy\s+[a-z0-9][a-z0-9.-]*/g)||[]).length,0);
const inv=require("./art-review/narration-inventory.json");
const sites=inv.adhoc.length+inv.prompts.length+inv.misc.length;
if(n!==sites)throw new Error("markers "+n+" != extracted sites "+sites);
console.log("PASS "+n+" markers bound to "+sites+" sites");
'

# 4. COMMENT-ONLY DIFF: every added/removed src line is a comment line
git diff -U0 ab98e04..HEAD -- src/ui src/orchestrator.js \
  | grep -E '^[+-]' | grep -vE '^(\+\+\+|---)' | grep -vE '^[+-]\s*//' \
  | tee /tmp/noncomment.txt
test ! -s /tmp/noncomment.txt || { echo "NON-COMMENT src change detected"; cat /tmp/noncomment.txt; exit 1; }

# 4b. the retired-id ledger exists and its refusal is wired (FLAG 6)
test -f art-review/narration-retired-ids.json
grep -q 'retired' scripts/extract_narration_lines.js

# 5. the drift-detection failures actually fire (red-proof, on a scratch copy — never the real tree)
node -e '
const {execSync}=require("child_process");const fs=require("fs");const os=require("os");const path=require("path");
const d=fs.mkdtempSync(path.join(os.tmpdir(),"copyid-drill-"));
execSync(`git archive HEAD | tar -x -C ${d}`);
const f=path.join(d,"src/ui/lobby.js");
fs.writeFileSync(f,fs.readFileSync(f,"utf8").replace(/\/\/ @copy [a-z0-9][a-z0-9.-]*\n/,""));
let failed=false;try{execSync("node scripts/extract_narration_lines.js",{cwd:d,stdio:"pipe"});}catch(e){failed=true;}
if(!failed)throw new Error("removing a marker did NOT fail the extractor");
console.log("PASS red-proof: an unmarked live site fails extraction");
'

# 6. governing constraints
git diff --stat ab98e04..HEAD -- src/engine/index.js   # must print nothing
npm test
node scripts/determinism_baseline.js --verify
    </automated>
  </verify>
  <done>
Every one of the 83 live copy sites carries a `// @copy <id>` marker; the extractor binds them,
emits `id` on every ad-hoc/prompt/misc entry, keys its curated metadata by id, derives button ids
from option values where available, and fails by name on an unmarked site, a duplicate, an orphan or
an illegal id. The `src/` diff since `ab98e04` contains only comment lines. Inventory byte-stable
across two runs. `npm test` green, 31/31 determinism, engine diff empty.
  </done>
  <commit>refactor(audit): declare stable @copy ids in source and key the extractor by them, not by line</commit>
</task>

<task type="auto" id="3" tdd="true">
  <name>Task 3: one render core, two consumers — delete the hand-transcribed card text</name>
  <files>art-review/narration-core.js, art-review/narration-audit.html, art-review/narration-table-baseline.json, scripts/narration_audit_check.js, scripts/ui_contract_check.js, src/ui/flow.js, src/ui/util.js, src/ui/panel.js, src/ui/lobby.js, src/orchestrator.js</files>
  <behavior>
    - Given the live inventory, the core produces the neutral text and the addressed variants for every ad-hoc, prompt, sub and misc card without a DOM, without throwing, for all 83 sites.
    - Given a table key and branch, the core reproduces `art-review/narration-table-baseline.json` byte-for-byte — the committed fixture captured from the pre-refactor builders.
    - No card's text is a placeholder or an evaluation-failure fallback for any site that has a resolvable expression.
    - `const PIRATE_MAP =` and `const PIRATE_RE =` are each declared in exactly ONE place in the repo, and `ui_contract_check.js` imports its detector rather than declaring a second one.
    - `project` and `projectApproved` are exported from the core, and `project` yields `[img:…]` for custom art and `[raw:…]` for an uncovered emoji — never the same token for both.
    - The core is DOM-free: importing it under plain `node` succeeds with no `document`/`window`/`localStorage` reference.
    - Given a card renderer that throws, the core's safe-render wrapper returns a named error descriptor instead of propagating — proven by passing it a deliberately throwing renderer.
  </behavior>
  <action>
Create `art-review/narration-core.js` — an ES module importing the real `src/ui/util.js` and
`src/shared/index.js` exactly as the page does today, exporting the card-**text** layer:

- the synthetic four-captain bootstrap and the fabricated base events, including D-51's
  real-emit-site invariant assertions;
- the branch axes and the independent probe axes (D-21);
- the pirate substitution and the sign rule (D-29/D-38), and `finalize`, with the asset-path rewrite
  taken as an **injected option defaulting to identity** — the page passes its own `../assets/`
  rewriter, Node passes nothing, so the two cannot disagree about anything except the path prefix;
- `evalSource` and the evaluation contexts (prompt, intro, misc), generalised to also serve ad-hoc
  sites;
- for each inventory entry, a function returning `{ id, label, neutral, variants[], notes[] }` —
  text and metadata only, no HTML shell, no editing controls;
- **a safe-render wrapper** taking an entry plus its renderer and returning either the rendered card
  or `{ id, error }`, catching anything thrown. See the boundary requirement below;
- **`project(html)` and `projectApproved(text)`** — the comparison projections Task 5's gate and Task 6's
  applier both depend on. They belong here, not in the gate: two consumers means the core is the owner,
  and the whole reason this module exists is that a second copy drifts.

  **Token-naming contract, stated here because both the gate and the applier assert against it.** The
  two icon forms must be distinguishable by name, not merely unequal — a bare filename token like
  `[coin.png]` satisfies neither consumer:
  - an `<img>`, or an emoji that `EMOJI_IMG` covers (it becomes an `<img>` at render), projects to
    `[img:<asset-basename>]` — e.g. `[img:coin]`;
  - an emoji `EMOJI_IMG` does **not** cover — the seven ingredient glyphs, D-17's defect — projects to
    `[raw:<glyph>]`;
  - a coloured-name element unwraps to the bare name; remaining tags are stripped; whitespace runs
    collapse; the result is trimmed.

  The `img:`/`raw:` prefixes are the contract. Without them a wrong-form icon compares equal and gap G5
  stays invisible.

It lives beside the page it serves rather than under `scripts/`, because it is the audit tool's own
module and the page loads it over HTTP from the repo root; `scripts/` stays gates-only. Its header
must state that it is review tooling, never shipped to a player.

**The boundary matters more here than it did before this refactor, not less.** Moving the render layer
into a module the page imports at load moves the throw sites with it — `evalSource`, the lookups,
D-51's invariant assertions. A throw inside the core still blanks the page, bit for bit the HEAD
failure this whole task exists to end. So the boundary must be **per card, and it must live where a
Node test can reach it**: put it in the core as the wrapper above, and have the page route *every*
card through it, so one bad card becomes one named error card and the other N−1 still render. A
boundary that only exists inside the page's DOM loop cannot be red-proofed, and this plan's own
standard is that every guard is red-proofed.

**Delete the hand-transcribed per-site text.** The page's ad-hoc renderer table hand-writes each
site's current wording; 20 of its 26 entries are orphaned and its literals predate 15-06, so cards
today would show copy the game no longer ships even if the page rendered. Replace the whole table
with core-driven rendering from the extracted expression, the way prompts already work. Keep a
curated renderer **only** where the source genuinely cannot be evaluated standalone (a message
computed into a local variable several lines above its call). Cap that set, count it in the gate
output, and require each survivor to carry a one-line comment naming why evaluation is impossible.

**Rewire the page** to import the core and keep only the DOM shell: the card HTML, the editing
controls, the flow-chart layout and edges, the persistence and export. The page must end up with no
second copy of the pirate map, the sign rule or `finalize`.

**Consolidate the register spec — and be precise about what is actually duplicated.**
`ui_contract_check.js` does **not** re-declare the substitution map; it declares `PRONOUN_RE`, a
*detector* with no map at all. So the duplication is one regex expressing the same word list two ways,
which is still worth collapsing (the gate's own header already points at the page as the spec). Export
the detector from the core beside the map and have the gate import it.

**Assert declaration sites, not string mentions.** Seven files contain the token `PIRATE_MAP` today,
and five of them are `src/` files whose comments merely cite it as the spec. A file-count assertion
therefore cannot pass. Assert instead that `const PIRATE_MAP =` and `const PIRATE_RE =` each appear
exactly once in the repo, and that `const PRONOUN_RE =` appears zero times once the gate imports it.

While there, **update those five stale comment pointers** in `src/ui/flow.js`, `src/ui/util.js`,
`src/ui/panel.js`, `src/ui/lobby.js` and `src/orchestrator.js` to name the core as the spec's new home.
Leaving them pointing at the page is exactly the kind of stale reference this task exists to end.
Comment-only; the diff proof below covers it.

**Extend the health gate** (`scripts/narration_audit_check.js`) with two assertions:
- a `--print` mode dumping every card's id, label and rendered neutral text, plus each variant;
- an assertion that no rendered card text is a placeholder or an evaluation-failure fallback for a
  site whose expression is resolvable, and that the curated-renderer count does not exceed its cap.

**Commit the table baseline as a fixture, do not stash it in `/tmp`.** A temp snapshot taken before
the refactor is unreproducible the moment the refactor lands, so the assertion it feeds could never be
re-run. Instead, as the **first step of this task, before touching the page**: write a dump of every
table key and branch by importing the current `src/ui/util.js` builders directly — no page, no core
needed, exactly as `scripts/narration_test.js` already imports them — and commit it as
`art-review/narration-table-baseline.json`. Task 2 already proved `src/ui/util.js`'s diff since
`ab98e04` is comment-only, so the current builders are the `ab98e04` builders and the fixture is a
faithful pre-refactor capture.

Then give `--print` a `--table-only` companion flag and assert the core reproduces the fixture
byte-for-byte. The fixture stays as a permanent regression pin on the table path — the one surface
that was never broken and must stay that way.
  </action>
  <verify>
    <automated>
# 1. the core is DOM-free and imports cleanly under plain node
node --input-type=module -e '
import("./art-review/narration-core.js").then(m=>{
  if(typeof m.finalize!=="function")throw new Error("core must export finalize");
  console.log("PASS core imports under node, exports:",Object.keys(m).length);
});'
grep -nE '\b(document|window|localStorage)\b' art-review/narration-core.js | grep -vE '^\s*[0-9]+:\s*//' | tee /tmp/dom.txt
test ! -s /tmp/dom.txt || { echo "core must be DOM-free"; cat /tmp/dom.txt; exit 1; }

# 2. every site renders, nothing is a placeholder, and --print shows all of them
node scripts/narration_audit_check.js --print > /tmp/cards.txt 2>&1
node -e '
const inv=require("./art-review/narration-inventory.json");
const txt=require("fs").readFileSync("/tmp/cards.txt","utf8");
const want=[...inv.adhoc,...inv.prompts,...inv.misc].map(e=>e.id);
const missing=want.filter(id=>!txt.includes(id));
if(missing.length)throw new Error("no printed card for: "+missing.slice(0,8).join(", "));
console.log("PASS all "+want.length+" sites printed");
'
grep -ci 'no renderer defined' /tmp/cards.txt | grep -qx 0
grep -ci 'could not evaluate' /tmp/cards.txt | grep -qx 0

# 3. the table path reproduces the COMMITTED fixture byte-for-byte (FLAG 10 — reproducible forever)
test -f art-review/narration-table-baseline.json
git ls-files --error-unmatch art-review/narration-table-baseline.json
diff -q art-review/narration-table-baseline.json <(node scripts/narration_audit_check.js --print --table-only)

# 4. exactly one DECLARATION SITE each — not one file mentioning the token (BLOCK 2)
node -e '
const {execSync}=require("child_process");
const count=(pat)=>{try{return execSync(`grep -rn ${JSON.stringify(pat)} art-review scripts src index.html`).toString().trim().split("\n").filter(Boolean).length;}catch(e){return 0;}};
const map=count("const PIRATE_MAP ="), re=count("const PIRATE_RE ="), pron=count("const PRONOUN_RE =");
if(map!==1)throw new Error("expected exactly 1 PIRATE_MAP declaration, found "+map);
if(re!==1)throw new Error("expected exactly 1 PIRATE_RE declaration, found "+re);
if(pron!==0)throw new Error("PRONOUN_RE should now be imported, not declared; found "+pron+" declaration(s)");
console.log("PASS one declaration site each; the detector is imported, not re-declared");
'
grep -q 'PIRATE_MAP' art-review/narration-core.js
grep -q 'narration-core' scripts/ui_contract_check.js
grep -q 'narration-core' art-review/narration-audit.html

# 4b. the five stale comment pointers now name the core, and the src diff is still comment-only
test "$(grep -rl 'narration-core' src/ | wc -l | tr -d ' ')" = "5"
git diff -U0 ab98e04..HEAD -- src/ui src/orchestrator.js | grep -E '^[+-]' | grep -vE '^(\+\+\+|---)' \
  | grep -vE '^[+-]\s*//' | tee /tmp/nc3.txt
test ! -s /tmp/nc3.txt || { echo "NON-COMMENT src change"; cat /tmp/nc3.txt; exit 1; }

# 4c. BLOCK 3 red-proof: a throwing card renderer yields an error descriptor, never a propagated throw
node --input-type=module -e '
const m = await import("./art-review/narration-core.js");
const boom = () => { throw new Error("synthetic card failure"); };
const r = m.renderCardSafely({ id: "drill.card" }, boom);
if (!r || !r.error) throw new Error("safe-render must return an error descriptor, got: " + JSON.stringify(r));
if (!String(r.id).includes("drill.card")) throw new Error("the error descriptor must name the card id");
const ok = m.renderCardSafely({ id: "drill.ok" }, () => ({ neutral: "fine" }));
if (ok.error) throw new Error("negative control: a healthy renderer must NOT produce an error");
console.log("PASS red-proof: one throwing card degrades to one named error card");
'

# 5. the hand-transcribed per-site text table is gone
grep -c 'ADHOC_RENDERERS' art-review/narration-audit.html | grep -qx 0

# 6. the core is review tooling only — nothing shipped imports it
grep -rc 'narration-core' index.html src/ | grep -v ':0$' | tee /tmp/leak.txt
test ! -s /tmp/leak.txt || { echo "shipped code must not import the review core"; cat /tmp/leak.txt; exit 1; }

# 7. governing constraints
git diff --stat ab98e04..HEAD -- src/engine/index.js   # must print nothing
npm test
node scripts/ui_contract_check.js --drill
node scripts/determinism_baseline.js --verify
    </automated>
  </verify>
  <done>
`art-review/narration-core.js` exists, is DOM-free, imports under plain `node`, and renders text for
all 83 sites with zero placeholders and zero evaluation failures. The page's hand-transcribed
per-site text table is gone and the page imports the core. `const PIRATE_MAP =` and `const PIRATE_RE =`
each have exactly one declaration site; `const PRONOUN_RE =` has none because the gate imports it; the
five `src/` comment pointers name the core. Table-card text reproduces the committed
`art-review/narration-table-baseline.json` byte-for-byte. The core's safe-render wrapper turns a
throwing renderer into a named error descriptor, red-proofed with a negative control. The `src/` diff
remains comment-only. Nothing under `src/` or in `index.html` imports the core. `npm test` green,
`ui_contract_check --drill` green, 31/31 determinism, engine diff empty.
  </done>
  <commit>refactor(audit): extract a DOM-free render core and render ad-hoc cards from live source</commit>
</task>

<task type="auto" id="4">
  <name>Task 4: re-key the page and carry all 209 reviewed dispositions across</name>
  <files>art-review/narration-audit.html, art-review/narration-id-aliases.json, art-review/narration-retired-ids.json, art-review/narration-approved-baseline.json, scripts/narration_audit_check.js, package.json</files>
  <precondition>`git show ddefa8f:art-review/narration-inventory.json` resolves — the export-era inventory Wyatt's review page actually consumed is in git history, and 136 of his 141 line-keyed ids resolve against it.</precondition>
  <reversibility rating="costly">The `STORAGE_KEY` bump orphans Wyatt's browser-local entries. Reversible in code, but the reason it is safe is that this task makes the committed export the state of record — verify the migration assertions pass BEFORE relying on the bump.</reversibility>
  <action>
Re-key the page to the stable ids and rebuild his review state from the repo instead of his browser.

**Card ids become** `adhoc:<id>`, `prompt:<id>`, `button:<id>~<slot>`, `sub:<id>~<branch>`,
`misc:<category>:<id>`. Table, award and dock-flavour ids are untouched. Replace every remaining
hardcoded `file:line` literal in the page — 91 distinct across 147 occurrences, 80 distinct already
stale — including the flow-chart node membership lists, so both of assertion 5's counts reach zero.

**Author `art-review/narration-id-aliases.json`.** This is the file that carries his work across.
Every one of the 209 rows in `15-DISPOSITIONS-FINAL.json` appears exactly once, as either:

- `{ "old": "<frozen id>", "new": "<stable id>", "evidence": "<fn + curated label>" }`, or
- `{ "old": "<frozen id>", "retired": "<reason>" }` — the site 15-06 deleted or merged away.

Author it from **evidence in git, not from proximity**: `git show ddefa8f:art-review/narration-inventory.json`
is the exact inventory his page consumed, giving each frozen id its enclosing function and curated
label. Match old to new on function plus role label. Do **not** match on copy text — the mpError and
introBarrier lines were reworded by 15-06's D-29 conversion, so text matching silently fails exactly
where it looks like it is working. That is the same guesswork D-44 warned about.

**The retirement set is EXACTLY these six ids. Pin them as a literal list in the gate.** "Expect
roughly six" is not a constraint — a migration that retired forty rows with the reason "site gone"
would satisfy every count-and-reason check while silently discarding his work. So:

| Retired id | Why it is gone | His own tag |
|---|---|---|
| `adhoc:src/ui/flow.js:296` | trade-wind rim sweep, folded into the table entry (D-36) | `merge` |
| `adhoc:src/ui/flow.js:571` | rim sweep, same merge | `merge` |
| `adhoc:src/ui/flow.js:645` | rim sweep, same merge | `merge` |
| `misc:battleLine:src/orchestrator.js:483` | defender-downwind duplicate, merged into `:482` (D-52) | `merge` |
| `misc:battleLine:src/orchestrator.js:487` | defender-hit duplicate, merged into `:486` (D-52) | `merge` |
| `misc:battleLine:src/ui/flow.js:967` | bakeoff scorer duplicate, merged (D-52) | `merge` |

**Every one of the six carries `tag: "merge"` in his own export** — verified while planning. So
retirement is not Claude discarding a mark, it is Claude executing the instruction he wrote. Make that
the assertion: **a row may be retired only if its export tag is `merge`.** A `keep` or `rewrite` row can
never be retired, which makes a forty-row silent retirement structurally impossible rather than merely
unlikely. The arithmetic corroborates independently: ad-hoc 28 sites -> 25, misc 33 -> 30.

**The 5 page-added exceptions**, which have no export-era inventory entry because the page synthesised
them: `adhoc:src/ui/util.js:874`, `adhoc:src/ui/util.js:878`, `sub:src/ui/flow.js:563~afford`,
`sub:src/ui/flow.js:563~poor`, `sub:src/ui/flow.js:563~none`. Alias them from the page's own extra-tag
and sub-renderer tables, not from the inventory. All five are in the export and all five are aliased,
never retired.

**Append the six retired ids to `art-review/narration-retired-ids.json`** so the extractor can never
re-issue one of those strings to a future site (FLAG 6).

**Freeze the drift baseline (see the Disposition Arithmetic section).** For each of the 104 rows whose
derived intent is `keep` — where he stored no *neutral* copy; 23 of them do carry an addressed field,
which Task 5 compares as an approval — write the card's currently rendered
neutral text, and each rendered addressed variant, into `art-review/narration-approved-baseline.json`,
keyed by stable card id. Task 3's core renders all of them headlessly, so this is one pass over the
inventory. The file's header must state its provenance without overclaiming: **this is the text as
shipped at the migration commit, after 15-06 and the gap-closure pass applied his approvals — it is
the best available reconstruction of what his card displayed, and it is a drift pin, not evidence of
approval.** Regenerating it later must require an explicit flag and print a diff, so it can never be
silently re-baselined to whatever the code happens to say.

**Seeding.** The seed of record becomes `15-DISPOSITIONS-FINAL.json` (209 rows, all reviewed)
overlaid with `15-ADDRESSED2-APPROVED.json` (11 second-party rows he approved after that export),
mapped through the alias file. Retire the 81-row pass-2 seed table and its cutoff constant.

**Retire the one-time migrations, keep the live behaviour.** Two load-time passes exist only to
repair the pass-2 era: the D-47 question-to-addressed-field migration and the D-42 retro-fix that
corrected already-saved dropdowns. Both are already reflected in the 209-row export, so re-running
them would edit data that is already correct. Remove them and the one-time migration banner.
**D-42's live behaviour is NOT part of this** — typing in the notes box must still auto-select
`rewrite`, still only when the current tag is `keep` or unset, and clearing the box must still revert
an auto-set `rewrite` while leaving a manually-chosen one alone. The affordance census pins it.

**Bump `STORAGE_KEY` one version** and add an id-scheme version constant beside it, with a gate
assertion that the two agree — so a future id change cannot ship without a bump.

**Never blank the page again — route every card through Task 3's safe-render wrapper.** Replacing the
two throwing lookups is not sufficient, because Task 3 moved the render layer into a module the page
imports at load, so a throw anywhere inside it still blanks the page. Every card in the page's render
loop goes through the wrapper, and an unresolvable or failing card becomes a visible error card naming
the id and the fix (`re-run the extractor`) in plain language.

**Add a concrete census assertion, and make it impossible to satisfy by silence.** The gate must print a
line tagged `safe-render` on every run, PASS or FAIL, asserting two things about the page: every
card-emitting call inside the render loop is `renderCardSafely(`, and the number of direct per-category
renderer calls remaining inside that loop is **0**. State both numbers in the output. A "no failures
found" check that prints nothing when the assertion is missing is not an assertion — the verify below
checks presence before it checks the result, for exactly that reason. Threat T-QT-04; the health gate
still catches the cause in CI, this is defence in depth for the human in front of it.

**Wire the health gate into `npm test`** as gate 16, immediately after the extractor (it consumes the
inventory the extractor writes), and add these migration assertions to it:

- every one of the 209 frozen ids appears exactly once in the alias file; every `new` target is a
  live card id; no live id is the target of two aliases;
- **`209 == aliased + retired`**, and the retired set equals the pinned six-id list exactly — not a
  count, the list;
- **every retired id's export tag is `merge`**; retiring a `keep` or `rewrite` row fails;
- **the reciprocal, which prose alone cannot enforce:** every one of the 141 frozen line-keyed ids
  either resolves against `git show ddefa8f:art-review/narration-inventory.json` or is on the
  pinned 5-id page-added exception list. Without this, an alias could point anywhere and no check
  would notice;
- the seed produces exactly 209 reviewed rows, and **no row that was `keep` becomes unknown** — the
  specific regression D-27 exists to prevent, since an unreviewed row is not a `keep`, it is unknown;
- the drift baseline covers **exactly 104** derived-`keep` rows — not "at most", not a window: no
  retirement is a derived-`keep` row, so this number cannot legitimately move.
  </action>
  <verify>
    <automated>
# 1. no line-number keying survives anywhere in the page — BOTH counts to zero (FLAG 9)
node -e '
const s=require("fs").readFileSync("art-review/narration-audit.html","utf8");
const hits=s.split("\n").map((l,i)=>[i+1,l]).filter(([,l])=>!/^\s*\/\//.test(l))
  .flatMap(([n,l])=>[...l.matchAll(/"(src\/[A-Za-z0-9_\/.]+\.js):(\d+)"/g)].map(m=>n+": "+m[0]));
const distinct=new Set(hits.map(h=>h.split(": ")[1])).size;
if(hits.length)throw new Error(distinct+" distinct / "+hits.length+" occurrence(s) remain, first: "+hits.slice(0,5).join(" | "));
console.log("PASS 0 distinct / 0 occurrences (was 91 distinct / 147 occurrences)");
'

# 2. the health gate is GREEN and wired as gate 16
node scripts/narration_audit_check.js
grep -c 'narration_audit_check' package.json | grep -qx 1
npm test 2>&1 | tail -30

# 3. the 209-row migration is complete, exact, and CANNOT silently swallow rows (BLOCK 4)
node -e '
const {execSync}=require("child_process");
const rows=require("./.planning/phases/15-narration-audit-fixes/15-DISPOSITIONS-FINAL.json").rows;
const al=require("./art-review/narration-id-aliases.json");
const list=Array.isArray(al)?al:al.entries;
const byOld={};for(const e of list){if(byOld[e.old])throw new Error("duplicate alias for "+e.old);byOld[e.old]=e;}
const missing=rows.filter(r=>!byOld[r.id]).map(r=>r.id);
if(missing.length)throw new Error(missing.length+" disposition row(s) unmapped, first: "+missing.slice(0,5).join(", "));
const extra=list.filter(e=>!rows.some(r=>r.id===e.old)).map(e=>e.old);
if(extra.length)throw new Error("alias entries for unknown rows: "+extra.slice(0,5).join(", "));
const targets=list.filter(e=>e.new).map(e=>e.new);
const dup=targets.filter((x,i)=>targets.indexOf(x)!==i);
if(dup.length)throw new Error("two aliases point at the same card: "+dup.join(", "));

// the retirement set is PINNED — the exact list, not a count, not a reason string
const EXPECTED_RETIRED=["adhoc:src/ui/flow.js:296","adhoc:src/ui/flow.js:571","adhoc:src/ui/flow.js:645",
 "misc:battleLine:src/orchestrator.js:483","misc:battleLine:src/orchestrator.js:487","misc:battleLine:src/ui/flow.js:967"];
const retired=list.filter(e=>e.retired).map(e=>e.old).sort();
if(JSON.stringify(retired)!==JSON.stringify([...EXPECTED_RETIRED].sort()))
  throw new Error("retirement set drifted.\n  expected: "+EXPECTED_RETIRED.sort().join("\n            ")+"\n  actual:   "+retired.join("\n            "));
// PROVENANCE: a row may only be retired if Wyatt himself tagged it merge
const byId=Object.fromEntries(rows.map(r=>[r.id,r]));
for(const id of retired) if(byId[id].tag!=="merge")
  throw new Error("refusing to retire "+id+" — his tag is \""+byId[id].tag+"\", not merge");
// ARITHMETIC: 209 = aliased + retired
if(targets.length+retired.length!==209)throw new Error("209 != "+targets.length+" aliased + "+retired.length+" retired");

// RECIPROCAL: every frozen line-keyed id resolves against the export-era inventory, or is a known exception
const PAGE_ADDED=new Set(["adhoc:src/ui/util.js:874","adhoc:src/ui/util.js:878",
 "sub:src/ui/flow.js:563~afford","sub:src/ui/flow.js:563~poor","sub:src/ui/flow.js:563~none"]);
const old=JSON.parse(execSync("git show ddefa8f:art-review/narration-inventory.json",{maxBuffer:1e8}).toString());
const known=new Set();
old.adhoc.forEach(e=>known.add("adhoc:"+e.file+":"+e.line));
old.prompts.forEach(e=>{known.add("prompt:"+e.file+":"+e.line);(e.labels||[]).forEach((l,i)=>known.add("button:"+e.file+":"+e.line+"~"+i));});
old.misc.forEach(e=>known.add("misc:"+e.category+":"+e.file+":"+e.line));
const base=id=>id.replace(/~[^~]*$/,"");
const unresolved=rows.filter(r=>/:\d+/.test(r.id)).filter(r=>!known.has(r.id)&&!known.has(base(r.id))&&!PAGE_ADDED.has(r.id)).map(r=>r.id);
if(unresolved.length)throw new Error(unresolved.length+" frozen id(s) resolve against NEITHER ddefa8f nor the exception list: "+unresolved.join(", "));
console.log("PASS 209 = "+targets.length+" aliased + "+retired.length+" retired (all merge-tagged); every frozen id traced to ddefa8f or the 5 exceptions");
'

# 4. reviewed count preserved and no keep -> unknown regression
node scripts/narration_audit_check.js 2>&1 | grep -E 'reviewed|keep' | tee /tmp/mig.txt
grep -qE '209' /tmp/mig.txt || { echo "gate must report the 209 reviewed rows"; exit 1; }
grep -E 'keep' /tmp/mig.txt | grep -c '^FAIL' | grep -qx 0

# 5. the affordance census still passes — nothing was dropped in the re-key
node scripts/narration_audit_check.js 2>&1 | grep 'affordance' | grep -c '^FAIL' | grep -qx 0

# 6. D-42's LIVE behaviour survives; only the one-time retro-fix pass is gone
grep -c 'PASS2_ROWS' art-review/narration-audit.html | grep -qx 0
node -e '
const s=require("fs").readFileSync("art-review/narration-audit.html","utf8");
for(const h of ["notesArea","tagSelect","derivedIntent","reviewedBox","reviewProgress","addressedNotesArea2","mergeTargetSelect","questionArea","drawEdges","edgeSvg","exportBtn","STORAGE_KEY"])
  if(!s.includes(h))throw new Error("affordance hook missing: "+h);
console.log("PASS every affordance hook present");
'

# 7. STORAGE_KEY bumped and agreeing with the id-scheme version
node scripts/narration_audit_check.js 2>&1 | grep -qi 'storage key' || { echo "gate must pin the storage key version"; exit 1; }
git diff ab98e04..HEAD -- art-review/narration-audit.html | grep -q '^+.*STORAGE_KEY'

# 7b. the drift baseline is committed, covers exactly the derived-keep rows, and states its provenance
git ls-files --error-unmatch art-review/narration-approved-baseline.json
node -e '
const b=require("./art-review/narration-approved-baseline.json");
const rows=require("./.planning/phases/15-narration-audit-fixes/15-DISPOSITIONS-FINAL.json").rows;
const derivedKeep=rows.filter(r=>r.tag!=="cut"&&r.tag!=="merge"&&!(r.notes||"").trim()).length;
if(derivedKeep!==104)throw new Error("expected 104 derived-keep rows, found "+derivedKeep);
const n=Object.keys(b.cards||b).length;
// EXACT, not a window: all 6 retirements are merge-tagged, so none is a derived-keep row and
// migration removes nothing from this class. A tolerance here would let 6 of his rows vanish green.
if(n!==104)throw new Error("baseline covers "+n+" cards, expected exactly 104 — no retirement is a derived-keep row, so this count cannot move");
if(!/drift pin/i.test(JSON.stringify(b.provenance||b._provenance||"")))throw new Error("baseline must state it is a drift pin, not evidence of approval");
console.log("PASS drift baseline pins "+n+" of 104 derived-keep cards, provenance stated");
'

# 7c. the retired-id ledger is populated and the extractor refuses to re-issue one (FLAG 6)
node -e '
const l=require("./art-review/narration-retired-ids.json");
const ids=Array.isArray(l)?l:l.ids;
if(ids.length!==6)throw new Error("expected the 6 retired ids in the ledger, found "+ids.length);
console.log("PASS retired-id ledger carries all 6");
'
node -e '
const {execSync}=require("child_process");const fs=require("fs");const os=require("os");const path=require("path");
const d=fs.mkdtempSync(path.join(os.tmpdir(),"reissue-drill-"));
execSync(`git archive HEAD | tar -x -C ${d}`);
const led=path.join(d,"art-review/narration-retired-ids.json");
const inv=JSON.parse(fs.readFileSync(path.join(d,"art-review/narration-inventory.json"),"utf8"));
const live=inv.adhoc[0].id;                       // pretend a LIVE id was previously retired
const cur=JSON.parse(fs.readFileSync(led,"utf8"));
(Array.isArray(cur)?cur:cur.ids).push(live);
fs.writeFileSync(led,JSON.stringify(cur,null,2));
let failed=false;try{execSync("node scripts/extract_narration_lines.js",{cwd:d,stdio:"pipe"});}catch(e){failed=true;}
if(!failed)throw new Error("the extractor did NOT refuse a re-issued retired id");
console.log("PASS red-proof: a re-issued retired id fails extraction");
'

# 8. BLOCK 3: every card is routed through the core's safe-render boundary, and one failure
#    degrades to one named error card instead of a blank page — proven against the real card list
node --input-type=module -e '
const core = await import("./art-review/narration-core.js");
const inv = JSON.parse(await import("node:fs").then(m=>m.readFileSync("art-review/narration-inventory.json","utf8")));
const entries = [...inv.adhoc, ...inv.prompts, ...inv.misc];
const target = entries[Math.floor(entries.length/2)].id;
let ok=0, errs=[];
for (const e of entries) {
  const r = core.renderCardSafely(e, e.id===target ? ()=>{throw new Error("synthetic failure");} : core.renderEntry);
  if (r && r.error) errs.push(r.id); else ok++;
}
if (errs.length!==1 || errs[0]!==target) throw new Error("expected exactly one error card ("+target+"), got: "+JSON.stringify(errs));
if (ok !== entries.length-1) throw new Error("the other "+(entries.length-1)+" cards must still render, got "+ok);
console.log("PASS one throwing card yields 1 named error card and "+ok+" healthy cards — no blank page");
'
# and nothing in the page bypasses the boundary.
# PRESENCE FIRST — `grep -c` prints 0 on empty input, so a bare "no FAIL lines" check passes when the
# assertion was never written at all. Prove it exists before proving it passes.
node scripts/narration_audit_check.js 2>&1 | grep -qi 'safe-render' \
  || { echo "the gate prints no safe-render assertion — it was never written"; exit 1; }
node scripts/narration_audit_check.js 2>&1 | grep -i 'safe-render' | grep -c '^FAIL' | grep -qx 0
# and independently: the page really routes cards through the wrapper, with no direct renderer call left
node -e '
const s=require("fs").readFileSync("art-review/narration-audit.html","utf8");
const wrapped=(s.match(/renderCardSafely\s*\(/g)||[]).length;
if(wrapped<1)throw new Error("the page never calls renderCardSafely — the boundary is not wired");
console.log("PASS page routes cards through the wrapper ("+wrapped+" call site(s))");
'

# 9. governing constraints
git diff --stat ab98e04..HEAD -- src/engine/index.js   # must print nothing
node scripts/determinism_baseline.js --verify
    </automated>
    <human-check>Deferred to Task 11 item 1-3 — deliberately not a second sitting. The page's render is proven browser-free by the health gate; Wyatt confirms layout, edges and the counter once, at the end.</human-check>
  </verify>
  <done>
Zero line-number-keyed literals remain in the page — 0 distinct and 0 occurrences, from 91 and 147.
`scripts/narration_audit_check.js` exits 0 and runs as gate 16 in `npm test` (16 gates green).
`art-review/narration-id-aliases.json` maps all 209 frozen ids exactly once, with
`209 == aliased + retired`; the retired set equals the pinned six-id list exactly and every one of the
six carries `tag: "merge"` in his own export; every frozen line-keyed id traces to
`ddefa8f`'s inventory or to the pinned 5-id exception list. The seed yields 209 reviewed rows with no
`keep` becoming unknown. `art-review/narration-approved-baseline.json` is committed, pins the
derived-`keep` cards, and states that it is a drift pin rather than evidence of approval. The retired-id
ledger carries all six and a re-issue attempt fails extraction. One throwing card yields exactly one
named error card with the rest still rendering. Every affordance hook is present; the pass-2 seed
table and the two one-time migrations are gone while D-42's live behaviour remains. `STORAGE_KEY` is
bumped and gate-pinned to the id-scheme version. 31/31 determinism, engine diff empty.
  </done>
  <commit>fix(audit): re-key the page to stable ids and migrate all 209 reviewed dispositions</commit>
</task>

<task type="auto" id="5" tdd="true">
  <name>Task 5: the fidelity gate — 155 approval fields compared, 104 drift rows pinned</name>
  <files>scripts/narration_copy_check.js, art-review/narration-core.js, package.json</files>
  <precondition>`art-review/narration-id-aliases.json` and `art-review/narration-approved-baseline.json` exist and Task 4's migration assertions pass, so every row resolves to a live card id and every derived-`keep` row has a committed baseline.</precondition>
  <behavior>
    - For an APPROVAL field (Wyatt stored text) whose shipped text matches, the gate passes; differing by one word, one icon or one sign character FAILS naming the row and both projections.
    - For a DRIFT row (Wyatt stored nothing) whose shipped text no longer matches the committed baseline, the gate FAILS — and the failure says "drifted from the pinned baseline", never "differs from what he approved".
    - An approval field is never satisfied by comparing the shipped side to itself: the comparison input is Wyatt's stored text, read from the disposition file.
    - For a row on the divergence allowlist whose shipped text has since been corrected, the gate FAILS as a STALE allowlist entry — the entry must be deleted, not left as cover.
    - An unreviewed row is never checked and never treated as an approval.
    - **A DELETION rewrite fails while unapplied.** For `table:fish` (his text drops the "casts a line," clause) and `misc:introBarrier:src/ui/flow.js:818~btn` (his text drops "Let's start"), the gate FAILS naming the surplus — a presence-only comparison would pass both.
  </behavior>
  <action>
Build the gate that makes "approved but not applied" and "applied but altered" both impossible to
miss. This is the more important half of the auto-apply decision, per the brief.

**Compare projections, not raw strings** — using `project()` and `projectApproved()` **imported from
the core**, where Task 3 defines them along with the `[img:…]` / `[raw:…]` token contract. They live
there because this gate and Task 6's applier both need them, and a second copy is exactly what this
whole task exists to prevent. `projectApproved()` additionally applies the D-50 glossary (his `{token}`
shorthand), the D-53 double-hyphen-to-em-dash rule and D-50's whitespace trim before the shared
normalisation, so his prose and the shipped render meet in one comparable form.

The `[img:…]` versus `[raw:…]` distinction is load-bearing (FLAG 7): an emoji `EMOJI_IMG` covers becomes
custom art at render and projects to `[img:…]`; one it does not cover — the seven ingredient glyphs,
D-17's defect — reaches the screen bare and projects to `[raw:…]`. Collapsing them to one token would
mask exactly the bug 15-VERIFICATION.md's gap G5 recorded: an icon shipping in the wrong form while the
comparison passes.

**Render the shipped side through the core**, never through a re-implementation. Task 3 exists so
this gate and the page cannot disagree about what the game says.

**Two comparison classes, reported separately and labelled honestly.** See the Disposition Arithmetic
section for why this split is forced rather than chosen:

| Class | Input | Count | What a failure means |
|---|---|---|---|
| **APPROVAL** | Wyatt's stored copy — `notes`, `addressedNotes`, and the second-party overlay | **155 fields** (89 + 55 + 11) | shipped copy differs from what he wrote |
| **DRIFT** | `art-review/narration-approved-baseline.json` | **exactly 104 rows** | the wording changed since the migration commit and nobody said so |
| informational | — | 16 merge rows | structural; 15-06 resolved them, not compared |

Derive intent by **D-26's rules**, never the raw tag: `cut`/`merge` win outright, empty notes mean
`keep`, non-empty notes mean `rewrite`. Two rows are tagged `rewrite` with an empty box and must land
in the drift class, not the approval class — the exact case D-26 says the card must state out loud.

**A `merge`-tagged row contributes no approval field, in any position.** 56 rows carry a non-empty
`addressedNotes`, but `adhoc:src/ui/flow.js:524` is `merge`-tagged and its field holds an instruction
about where the line goes, not wording for a player. Counting it would guarantee a failure, consume one
of Task 6's six cap slots, and label an instruction as an approval. Hence **55**, not 56.

**Never let an approval field be satisfied by a self-comparison.** The approval side's input is the
disposition file; the shipped side's is the core. Assert the counts per class as **hard literal
equalities** (89 / 55 / 11, and 104 for drift) so a bug that silently skips a class fails rather than
reporting a comfortable total. And **label the drift failures as drift** — a message reading "differs
from what he approved" on a row where he approved nothing would be a lie the next reader acts on.

**Compare BOTH directions — some of his rewrites are deletions.** The comparison is equality of
projections, and it must be implemented as equality, not as "every approved word appears in the shipped
string". A presence-only check passes a deletion trivially, because everything he kept is still there
and the surplus he removed is invisible to it. Two live rows prove the class:

| Row | His approved text | Shipped today | What presence-only misses |
|---|---|---|---|
| `table:fish` | *"Crustbeard catches a {sugarfish} sugarfish! (+2{coin})"* | `${pn(e.p)} casts a line, ${outcome}` | the *"casts a line,"* clause he deleted |
| `misc:introBarrier:src/ui/flow.js:818~btn` | *"Arrgh!"* | *"⚓ Arrgh! Let's start"* | the trailing *"Let's start"* he deleted |

So: **assert the shipped projection has no surplus content the approval lacks**, and use those two rows
as the named test cases. Note the interaction with D-16 — a *deletion of words* is exactly what his notes
can express, whereas a missing *icon* never is; the projection keeps icons as tokens, so removing the
`casts a line,` clause does not license dropping the coin or fish art.

**`KNOWN_DIVERGENT` allowlist**, and the anti-fig-leaf rule that makes it honest: each entry carries
the row id and a one-line reason. The gate FAILS if an entry is **stale** — the row now matches, so
the entry is unnecessary cover — and requires every reason to be non-empty. **Print the size as a
headline number and PASS regardless of it.** The 155-field comparison has never been run, so the
divergence count is unknown at plan time; a numeric cap committed here could only be met by weakening
it. **Task 6 owns the cap** as its exit criterion, after it has drained what it can prove. Gate before
writer is preserved; only the number moves.

Seed the allowlist from what the run actually finds, with a real reason each. The known candidate from
the record: the battle round-result addressed lines, which have no per-seat variant mechanism in the
scoreboard footer (15-VERIFICATION.md's open item).

**`--drill`**: mutate a shipped literal in a scratch tree and assert FAIL; add a stale entry to a
synthetic allowlist and assert FAIL; and a negative control — an unmodified tree with an empty
allowlist must PASS.

Wire in as gate 17, after the health gate.
  </action>
  <verify>
    <automated>
# 1. green, and BOTH classes are reported with their own pinned counts (BLOCK 1)
node scripts/narration_copy_check.js 2>&1 | tee /tmp/copy.txt
node -e '
const t=require("fs").readFileSync("/tmp/copy.txt","utf8");
const approval=t.match(/approval[^0-9]*(\d+)\s*field/i);
const drift=t.match(/drift[^0-9]*(\d+)\s*row/i);
if(!approval)throw new Error("gate must report the APPROVAL field count");
if(!drift)throw new Error("gate must report the DRIFT row count, separately and labelled");
if(Number(approval[1])!==155)throw new Error("expected exactly 155 approval fields (89+55+11, merge rows excluded), got "+approval[1]);
if(Number(drift[1])!==104)throw new Error("expected exactly 104 drift rows — no retirement is a derived-keep row — got "+drift[1]);
// the drift class must never be described as an approval
const lying=t.split("\n").filter(l=>/drift/i.test(l)&&/approved/i.test(l));
if(lying.length)throw new Error("a drift line claims approval provenance: "+lying[0]);
console.log("PASS "+approval[1]+" approval fields compared, "+drift[1]+" drift rows pinned, classes labelled distinctly");
'

# 1b. per-class hard equalities — a silently skipped class fails rather than hiding in a total
node scripts/narration_copy_check.js 2>&1 | grep -qiE 'neutral[^0-9]*89' || { echo "must pin 89 neutral approvals"; exit 1; }
node scripts/narration_copy_check.js 2>&1 | grep -qiE 'addressed[^0-9]*55' || { echo "must pin 55 addressed approvals (56 minus the merge-tagged instruction row)"; exit 1; }
node scripts/narration_copy_check.js 2>&1 | grep -qiE 'second[- ]party[^0-9]*11' || { echo "must pin 11 second-party approvals"; exit 1; }
# and the merge-tagged instruction row is excluded by NAME, not by luck
node scripts/narration_copy_check.js 2>&1 | grep -qF 'adhoc:src/ui/flow.js:524' \
  || { echo "the gate must name the excluded merge-tagged addressed row so the exclusion is visible"; exit 1; }

# 2. the allowlist is printed and reasoned — NO numeric cap here; Task 6 owns it (BLOCK 5)
node -e '
const t=require("fs").readFileSync("/tmp/copy.txt","utf8");
const m=t.match(/allowlist:\s*(\d+)/i);
if(!m)throw new Error("gate must print the allowlist size as a headline");
console.log("PASS allowlist size "+m[1]+" (reported, not capped — Task 6 drains and caps it)");
'
grep -i 'stale' /tmp/copy.txt | grep -c '^FAIL' | grep -qx 0

# 2b. FLAG 7: the projections live in the CORE and distinguish custom art from a raw system emoji,
#     using the [img:…] / [raw:…] contract Task 3 states (a bare "[coin.png]" satisfies neither consumer)
node --input-type=module -e '
const m = await import("./art-review/narration-core.js");
if (typeof m.project !== "function" || typeof m.projectApproved !== "function")
  throw new Error("the core must export project and projectApproved — both the gate and the applier import them");
const img = m.project("<img class=\"narrIcon\" src=\"assets/icons/coin.png\"> 5");
const raw = m.project("\u{1F33E} Toasty Wheat");
if (img === raw) throw new Error("projection collapses art and raw emoji to one token — G5 would be invisible");
if (!/\[img:/.test(img)) throw new Error("custom art must project to [img:…], got: " + img);
if (!/\[raw:/.test(raw)) throw new Error("an uncovered emoji must project to [raw:…], got: " + raw);
console.log("PASS core-owned projections, distinct tokens:", img, "|", raw);
'
grep -q 'narration-core' scripts/narration_copy_check.js \
  || { echo "the gate must import the projections, not re-declare them"; exit 1; }

# 3. red-proof: mutated approval, drifted baseline, stale entry, and a negative control
node scripts/narration_copy_check.js --drill 2>&1 | tee /tmp/drill5.txt
grep -qi 'stale' /tmp/drill5.txt || { echo "drill must cover a stale allowlist entry"; exit 1; }
grep -qi 'drift' /tmp/drill5.txt || { echo "drill must cover a drifted baseline row"; exit 1; }
grep -qi 'negative control' /tmp/drill5.txt || { echo "drill needs a negative control"; exit 1; }
# and the anti-vacuity drill: an approval field must FAIL when its stored text is changed,
# proving the comparison reads the disposition file rather than the shipped side
grep -qi 'anti-vacuity\|self-comparison' /tmp/drill5.txt || { echo "drill must prove approvals are not self-comparisons"; exit 1; }
# BOTH DIRECTIONS: a shipped string carrying surplus the approval lacks must FAIL
grep -qi 'surplus' /tmp/drill5.txt || { echo "drill must cover a deletion rewrite (surplus in shipped)"; exit 1; }
node scripts/narration_copy_check.js --drill

# 3b. the two live deletion rows are actually caught, by name — not merely covered in principle
node -e '
const {execSync}=require("child_process");
const out=execSync("node scripts/narration_copy_check.js 2>&1 || true").toString();
for(const id of ["table:fish","misc:introBarrier:src/ui/flow.js:818~btn"]){
  const named=out.includes(id);
  const allowed=/KNOWN_DIVERGENT/.test(out)&&out.includes(id);
  if(!named)throw new Error(id+" is a live DELETION rewrite and the gate says nothing about it — a presence-only comparison would pass it silently");
}
console.log("PASS both deletion rows are named by the gate (as a failure, or as a reasoned allowlist entry)");
'

# 4. wired as gate 17
grep -c 'narration_copy_check' package.json | grep -qx 1
npm test

# 5. governing constraints
git diff --stat ab98e04..HEAD -- src/engine/index.js   # must print nothing
node scripts/determinism_baseline.js --verify
    </automated>
  </verify>
  <done>
`scripts/narration_copy_check.js` exits 0 and reports two labelled classes: exactly 155 APPROVAL
fields compared against Wyatt's stored copy (89 neutral / 55 addressed / 11 second-party, each pinned,
with the merge-tagged `adhoc:src/ui/flow.js:524` excluded by name) and exactly 104 DRIFT rows pinned to
the committed baseline, with no drift message claiming approval provenance. `project`/`projectApproved`
are imported from the core and yield `[img:…]` versus `[raw:…]`, so G5's icon-form defect is
detectable. The allowlist size is printed with a reason per entry and no stale entries; **no numeric
cap is asserted here — Task 6 owns it.** `--drill` proves a mutated approval fails, a drifted baseline
fails, a stale entry fails, an approval cannot pass by self-comparison, and an unmodified tree passes.
Wired as gate 17; `npm test` green at 17 gates. 31/31 determinism, engine diff empty.
  </done>
  <commit>test(audit): gate shipped narration copy against Wyatt's approved export</commit>
</task>

<task type="auto" id="6">
  <name>Task 6: the applier — writes approved copy, and cannot land a bad write</name>
  <files>scripts/apply_narration_copy.js, package.json, src/ui/util.js, src/ui/flow.js, src/orchestrator.js</files>
  <precondition>Task 5's gate runs green with a printed divergence allowlist naming the rows that do not yet match.</precondition>
  <reversibility rating="costly">`--write` edits shipped source. Reversible via git, but a wrong write could ship altered player copy, so the dry-run diff, the ambiguity refusal and the re-render proof are all mandatory, not optional flags.</reversibility>
  <action>
Wyatt chose auto-apply, so build the writer — and build it so it never trusts itself.

**Dry-run is the default.** Bare invocation prints, per row: the id, the source file and line, the
current literal, the candidate literal, and a projection-level before/after. It writes nothing.
`--write` is required to touch a file, and refuses if the working tree has uncommitted changes under
`src/` (so its own diff is always readable in isolation).

**How a candidate literal is built — interpolation alignment.** The shipped literal is a template
with interpolations; the approval is rendered prose. Rather than guessing how to un-render it:

1. Render the site through the core, recording each interpolation's rendered value.
2. Locate each of those values, in order, inside the projected approval.
3. If every value appears exactly once and in the same order, the mapping is unambiguous: the text
   between matches is static prose, and the candidate is the original template with each static
   segment replaced by the corresponding approved segment. Every interpolation is preserved
   positionally, which is half of D-16 — an icon or a name cannot be *dropped*, because dropping one
   breaks the alignment.
4. If any value is missing, duplicated or out of order, **REFUSE the row.** Print it under a
   REFUSED heading with the reason, and leave it for the human ruling in Task 11. Refusing is the
   correct outcome, not a failure of the tool.

**The other half of D-16: an ADDED icon must ship in the right form** (FLAG 7). Interpolation
alignment only proves nothing was lost. 15-VERIFICATION.md's gap G5 was the opposite case — Wyatt
*typed a coin glyph into his rewrite* and it shipped without one — and that gap has no resolution line
anywhere. So when the approved side carries an icon token with no matching interpolation:

- if the glyph is a key in `EMOJI_IMG`, write the **bare emoji shorthand** into the source literal.
  That is the codebase's load-bearing convention, not a shortcut: `emojify()` converts it to custom art
  at the render chokepoints, which is precisely why D-17 says not to bulk-replace emoji in source.
- if the glyph is **not** in `EMOJI_IMG` — the seven ingredient glyphs — **REFUSE the row.** It needs an
  `ilabelImg`/`iconImg` interpolation that the writer must not invent, and shipping the bare glyph
  would recreate D-17's exact defect.

Task 5's projection is what makes this enforceable: because custom art and raw emoji project to
different tokens, a candidate that shipped the wrong form fails its own re-render proof instead of
sliding through.

**Normalise the approval before aligning**: the D-50 glossary (`{coin}` to the coin emoji,
`{coin-heads}`/`{coin-tails}`, `{sailboat}`, `{swords}`, `{sugarfish}`, `{crab}`, `{rod}` and
`{fishing-hook}` both to the rod, `{clock/stopwatch}` to the hourglass per D-50 RESOLVED, and the
seven ingredients — noting his two display-word tokens map to the real keys, milk to dairy and
cinnamon to spice); the D-53 double-hyphen to em dash, never an en dash, and never touching a dash
between digits; and D-50's leading/trailing and double-space trim. Use the existing wind-phrase
helper for his direction shorthand rather than concatenating a suffix.

**The self-proof, which is the whole safety argument.** For every row it intends to write: build the
candidate, substitute it into an in-memory copy of the file, re-render that site through the core,
and require the projection to equal the projected approval. **If the re-render does not match, do
not write the row** — report it as REFUSED with the diff. The writer's output is therefore verified
by the same comparison Task 5's gate uses, before it reaches disk.

**After a write**, run the full gate chain in-process and print the result: `npm test`, the
determinism verify, and the empty-engine-diff assertion. A write that breaks any of them prints the
restore command.

Add an `apply:copy` script to `package.json` (dry-run) so the tool has a one-word entry point, and
delete from Task 5's allowlist every row this task proves and applies.

**This task owns the allowlist cap** (BLOCK 5). Task 5 reports the divergence count without capping it,
because the 155-field comparison had never been run and a number committed in advance could only be met
by weakening it. After this task has applied everything it can prove, add the cap assertion to
`narration_copy_check.js`: **at most 6 remaining entries, each one a row the applier demonstrably
refused, each with its reason.** If more than 6 survive, that is a real finding and goes to Task 11 as a
ruling — never a raised cap.
  </action>
  <verify>
    <automated>
# 1. dry-run writes nothing, even with rows pending
git status --porcelain src/ | tee /tmp/before.txt
node scripts/apply_narration_copy.js | tee /tmp/dry.txt
git status --porcelain src/ > /tmp/after.txt
diff -q /tmp/before.txt /tmp/after.txt || { echo "dry-run modified the tree"; exit 1; }
grep -qiE 'dry.?run' /tmp/dry.txt

# 2. it reports both outcomes explicitly — nothing is silently skipped
grep -qiE 'refused|REFUSED' /tmp/dry.txt || grep -qiE 'nothing to apply' /tmp/dry.txt

# 3. the ambiguity refusal really fires (scratch tree, never the real one)
node -e '
const {execSync}=require("child_process");const fs=require("fs");const os=require("os");const path=require("path");
const d=fs.mkdtempSync(path.join(os.tmpdir(),"apply-drill-"));
execSync(`git archive HEAD | tar -x -C ${d}`);
// an approval that drops an interpolation entirely must be refused, never guessed
fs.writeFileSync(path.join(d,"apply-drill.json"),JSON.stringify({rows:[{id:"table:sail",tag:"rewrite",reviewed:true,notes:"sails"}]}));
const out=execSync("node scripts/apply_narration_copy.js --dispositions apply-drill.json --write",{cwd:d}).toString();
if(!/refus/i.test(out))throw new Error("an unalignable approval was NOT refused:\n"+out);
if(execSync("git status --porcelain src/",{cwd:d}).toString().trim())throw new Error("it wrote despite refusing");
console.log("PASS red-proof: unalignable row refused, nothing written");
'

# 4. the happy path really writes AND proves (scratch tree)
node -e '
const {execSync}=require("child_process");const fs=require("fs");const os=require("os");const path=require("path");
const d=fs.mkdtempSync(path.join(os.tmpdir(),"apply-ok-"));
execSync(`git archive HEAD | tar -x -C ${d}`);
const f=path.join(d,"src/ui/util.js");const s=fs.readFileSync(f,"utf8");
const hit=s.match(/is still docked, so the storm can.t run them aground\./);
if(!hit)throw new Error("fixture anchor not found — pick another stable literal");
fs.writeFileSync(f,s.replace(hit[0],"is still docked, so the storm cannot run them aground."));
const out=execSync("node scripts/apply_narration_copy.js --write",{cwd:d}).toString();
if(!/applied\s+\d+/i.test(out))throw new Error("expected an applied count:\n"+out);
if(!fs.readFileSync(f,"utf8").includes(hit[0]))throw new Error("the approved wording was not restored");
console.log("PASS red-proof: a divergent row is restored to the approved wording and proven");
'

# 4b. FLAG 7 red-proof: an ADDED icon must ship as art, or the row is refused.
#     NOTE: `misc:battleLine:bothmiss` below is a PLACEHOLDER for the post-migration stable id of the
#     "Both miss — TAILS all round." line. Substitute the real regenerated id from
#     art-review/narration-inventory.json before running; the drill is about the icon rule, not the id.
#     (`table:sail` and the "still docked" util.js anchor used in the other drills are both real.)
node -e '
const {execSync}=require("child_process");const fs=require("fs");const os=require("os");const path=require("path");
const d=fs.mkdtempSync(path.join(os.tmpdir(),"icon-drill-"));
execSync(`git archive HEAD | tar -x -C ${d}`);
// (a) an added glyph that EMOJI_IMG covers -> written as emoji shorthand, proof passes
fs.writeFileSync(path.join(d,"icon-a.json"),JSON.stringify({rows:[{id:"misc:battleLine:bothmiss",tag:"rewrite",reviewed:true,notes:"Both miss — ⚫ TAILS all round."}]}));
const a=execSync("node scripts/apply_narration_copy.js --dispositions icon-a.json --write",{cwd:d}).toString();
if(/refus/i.test(a)&&!/applied\s+1/i.test(a))throw new Error("an EMOJI_IMG-covered added glyph should apply, not refuse:\n"+a);
// (b) an added INGREDIENT glyph (not in EMOJI_IMG) -> must be REFUSED, never shipped bare
fs.writeFileSync(path.join(d,"icon-b.json"),JSON.stringify({rows:[{id:"misc:battleLine:bothmiss",tag:"rewrite",reviewed:true,notes:"Both miss — \u{1F33E} TAILS all round."}]}));
const b=execSync("node scripts/apply_narration_copy.js --dispositions icon-b.json --write",{cwd:d}).toString();
if(!/refus/i.test(b))throw new Error("a bare ingredient glyph was NOT refused — that is D-17 reintroduced:\n"+b);
console.log("PASS red-proof: added art applies, added raw ingredient glyph refuses");
'

# 5. real tree: if anything was applied, everything still holds and the allowlist is capped
npm test
node scripts/determinism_baseline.js --verify
node scripts/narration_copy_check.js 2>&1 | tee /tmp/copy6.txt
node -e '
const t=require("fs").readFileSync("/tmp/copy6.txt","utf8");
const m=t.match(/allowlist:\s*(\d+)/i);
if(!m)throw new Error("copy gate must still print the allowlist size");
if(Number(m[1])>6)throw new Error("allowlist still "+m[1]+" after draining — take the residue to Task 11 as a ruling, do NOT raise the cap");
console.log("PASS allowlist drained to "+m[1]+", cap now enforced");
'
git diff --stat ab98e04..HEAD -- src/engine/index.js   # must print nothing
git diff -U0 ab98e04..HEAD -- src/ui src/orchestrator.js | grep -cE '^\+' || true

# 6. one-word entry point exists and runs
grep -q '"apply:copy"' package.json
npm run apply:copy --silent >/dev/null
    </automated>
    <human-check>Deferred to Task 11 item 5: Wyatt reads the applier's diff for any row it wrote, plus the REFUSED list. If it wrote nothing, item 5 is one line long.</human-check>
  </verify>
  <done>
`scripts/apply_narration_copy.js` dry-runs by default and writes nothing without `--write`; refuses
any row whose interpolations cannot be aligned unambiguously; proves every write by re-rendering and
comparing before touching disk; and reports applied / refused counts explicitly. All drills pass on
scratch trees: an unalignable row is refused with nothing written, a divergent row is restored to the
approved wording, an added `EMOJI_IMG`-covered glyph applies as shorthand, and an added bare ingredient
glyph is refused rather than reintroducing D-17. On the real tree `npm test`, the determinism verify and
the copy gate are all green, the engine diff is empty, and the allowlist is drained to at most 6 rows —
each one the applier demonstrably refused — with the cap now asserted in the copy gate.
`npm run apply:copy` works.
  </done>
  <commit>feat(audit): apply approved narration copy, with a re-render proof before every write</commit>
</task>

<task type="auto" id="7">
  <name>Task 7: make the scope rule permanent, in both directions</name>
  <files>scripts/extract_narration_lines.js, scripts/narration_audit_check.js, art-review/narration-audit.html, art-review/narration-inventory.json, src/ui/board.js</files>
  <action>
D-21, D-30, D-31, D-32 and D-33 were each fixed once as a one-off, and each time the page looked
complete because it was complete *against its own definition of scope*. Make D-32's rule — every
string a player can read — mechanical, and enforce the inverse too.

**Direction 1: a sink census.** Enumerate every way text reaches the screen in the player-facing
files — the narration and prompt calls, `alert`, the intro barrier, the round-result assignment, and
the direct DOM writes (`innerHTML`, `textContent`, `title`, `setAttribute`, `placeholder`,
`insertAdjacentHTML`). There are 163 such occurrences across seven files. Each must be either:

- a copy site the inventory already covers (it carries a `@copy` marker), or
- a `SINK_EXCLUSIONS` entry with a one-line reason.

Anchor exclusions by **exact text**, not by line — the convention this extractor already uses for the
recipe-draft anchors — and verify each anchor is still present, so a stale exclusion FAILS rather
than rotting into permanent cover. Most exclusions are genuinely non-copy: SVG geometry, the timer's
numeric digits, class-name assembly, asset URLs.

**Pin per-file expected counts; never let the census certify its own denominator** (FLAG 8). A gate
that asserts "the total I printed is at least 160" proves only that it printed a large number. Follow
`LAYOUT_WIDE_EXPECTED` in `ui_contract_check.js`: a table of `{ file, domWrites, copyCalls }` literals,
each asserted exactly, with the instruction that a deliberate change means updating the table and an
accidental one means the gate caught something. Then **cross-check the total by an independent second
count** — the same two-count discipline this extractor already applies to every one of its own
categories. Measured while planning, for the seven files: 66 DOM writes and 97 copy calls, **163 total**
(flow 51, orchestrator 43, util 4, panel 34, lobby 7, board 23, recipe 1). What must not happen is a
floor derived from the gate's own output.

**The two counts must use the SAME pattern set.** The verify below recounts with its own hardcoded list
of 14 sink patterns and asserts equality with the gate's total. That is the point — an independent
recount — but it means adding a sink pattern to the gate without adding it to the verify (or vice versa)
breaks the equality *legitimately*. If the totals disagree, first check the two pattern lists match, and
keep them in step deliberately; the gate's own header should say so.

**Extend the scanned file set to `src/ui/board.js` and `src/ui/recipe.js`.** The census's first job
is to prove itself on a real gap, and there is one: `board.js` carries player-facing copy that has
**never been in the audit**, because the extractor's file list never included it — the end-of-voyage
banner (nobody finished / a winner is crowned), the check-my-recipe button, the empty-hold label, the
surplus-cargo tooltip, and the stats-panel headings. Card those, at stable ids, in the voyage-end and
turn stages. Wyatt's reviewed denominator rises, exactly as D-30 anticipated; the gate must assert
that no existing mark is reset by the rise.

`src/ui/recipe.js`'s three recipe descriptions stay **excluded with a reason** pointing at the open
ruling from the previous task, not silently absent — that distinction is the whole point of a census.

**Direction 2: the inverse — no card may present text a player can never read.** The page already
checks this at render (unreachable parameter fallbacks per D-33, marker labels the control replaces
per D-34, guarded safety nets per D-40, config-gated branches per D-43) but only in a browser, which
is why the last two drifts went unnoticed. Mirror those four assertions into the health gate so they
run in `npm test`: every known-dead card carries its badge, every guarded card names a live sibling
that exists, and every config-gated branch is derived from the engine's own config factory rather
than a hand-listed set.

**`--drill`** each direction: an unmarked new prose sink must FAIL; a stale exclusion anchor must
FAIL; a dead card missing its badge must FAIL; and a negative control must PASS.
  </action>
  <verify>
    <automated>
# 1. the census is green, and its denominator is PINNED PER FILE — not self-certified (FLAG 8)
node scripts/narration_audit_check.js 2>&1 | tee /tmp/census.txt
grep -qiE 'sink' /tmp/census.txt
# the gate carries a per-file literal table, asserted exactly, in LAYOUT_WIDE_EXPECTED's style
node -e '
const s=require("fs").readFileSync("scripts/narration_audit_check.js","utf8");
const m=s.match(/SINK_EXPECTED\s*=\s*\[([\s\S]*?)\]/);
if(!m)throw new Error("gate must carry a SINK_EXPECTED per-file literal table");
const files=[...m[1].matchAll(/["\x27](src\/[^"\x27]+)["\x27]/g)].map(x=>x[1]);
for(const f of ["src/ui/flow.js","src/orchestrator.js","src/ui/util.js","src/ui/panel.js","src/ui/lobby.js","src/ui/board.js","src/ui/recipe.js"])
  if(!files.includes(f))throw new Error("SINK_EXPECTED is missing a pinned entry for "+f);
if(!/\bdomWrites\b/.test(m[1])||!/\bcopyCalls\b/.test(m[1]))throw new Error("each entry must pin domWrites AND copyCalls");
console.log("PASS per-file sink counts pinned for all 7 files");
'
# INDEPENDENT second count, computed here rather than read from the gate output
node -e '
const fs=require("fs");
const files=["src/ui/flow.js","src/orchestrator.js","src/ui/util.js","src/ui/panel.js","src/ui/lobby.js","src/ui/board.js","src/ui/recipe.js"];
const pats=[/\.innerHTML\s*=/g,/\.textContent\s*=/g,/\.title\s*=/g,/setAttribute\(/g,/placeholder\s*=/g,/insertAdjacentHTML/g,
/\b(?:flash|onFlash)\s*\(/g,/\bask\s*\(/g,/\bpanel\s*\(/g,/\balert\s*\(/g,/\bnetIntroBarrier\s*\(/g,/\bshowNarration\s*\(/g,/\bnetBroadcast\s*\(/g,/\brmsg\s*=(?!=)/g];
let total=0;
for(const f of files){const src=fs.readFileSync(f,"utf8").split("\n").filter(l=>!/^\s*\/\//.test(l)).join("\n");
  for(const p of pats) total+=(src.match(p)||[]).length;}
const t=fs.readFileSync("/tmp/census.txt","utf8");
const m=t.match(/sinks?:\s*(\d+)\s*(?:covered|carded)[^0-9]*(\d+)\s*excluded/i);
if(!m)throw new Error("gate must print covered vs excluded sink counts");
const reported=Number(m[1])+Number(m[2]);
if(reported!==total)throw new Error("census reports "+reported+" sinks but an INDEPENDENT count found "+total+" — one of the two is wrong");
console.log("PASS census total "+reported+" agrees with an independent count of "+total);
'

# 2. board.js copy is now carded — the gap the census was built to catch
node -e '
const inv=require("./art-review/narration-inventory.json");
const b=[...inv.adhoc,...inv.prompts,...inv.misc].filter(e=>e.file==="src/ui/board.js");
if(b.length<4)throw new Error("expected board.js copy sites to be carded, found "+b.length);
console.log("PASS "+b.length+" board.js copy sites now carded:",b.map(e=>e.id).join(", "));
'
node scripts/narration_audit_check.js --print 2>&1 | grep -qi 'nobody finished' || { echo "the end-of-voyage banner must render on a card"; exit 1; }

# 3. recipe.js prose is EXCLUDED WITH A REASON, not silently absent
node scripts/narration_audit_check.js 2>&1 | grep -i 'recipe.js' | grep -qiE 'exclud|ruling' \
  || { echo "recipe.js prose must be excluded with a stated reason"; exit 1; }

# 4. the rise in the denominator reset nothing
node scripts/narration_audit_check.js 2>&1 | grep -E 'reviewed' | grep -q '209' \
  || { echo "209 reviewed marks must survive the new cards"; exit 1; }

# 5. the inverse direction runs headlessly now
node scripts/narration_audit_check.js 2>&1 | grep -ciE 'dead|guarded|config-gated' | grep -qvx 0

# 6. red-proof both directions plus the negative control
node scripts/narration_audit_check.js --drill
node scripts/narration_audit_check.js --drill 2>&1 | tee /tmp/drill7.txt
grep -qi 'unmarked' /tmp/drill7.txt
grep -qi 'stale exclusion' /tmp/drill7.txt
grep -qi 'negative control' /tmp/drill7.txt

# 7. governing constraints — board.js gains markers only, no string change
git diff -U0 ab98e04..HEAD -- src/ui/board.js | grep -E '^[+-]' | grep -vE '^(\+\+\+|---)' \
  | grep -vE '^[+-]\s*//' | tee /tmp/board.txt
test ! -s /tmp/board.txt || { echo "NON-COMMENT change in board.js"; cat /tmp/board.txt; exit 1; }
git diff --stat ab98e04..HEAD -- src/engine/index.js   # must print nothing
npm test
node scripts/determinism_baseline.js --verify
    </automated>
  </verify>
  <done>
The health gate accounts for every player-facing sink across seven files as either carded copy or a
reasoned, presence-verified exclusion; the denominator is pinned per file in a `SINK_EXPECTED` literal
table and cross-checked against an independent count, never self-certified. A stale exclusion fails.
`src/ui/board.js`'s previously
invisible copy is carded at stable ids and renders on cards; `src/ui/recipe.js`'s prose is excluded
with its reason naming the open ruling. The 209 existing marks survive the larger denominator. The
four dead-copy/guarded/config-gated assertions now run headlessly in `npm test`. All drills pass,
including a negative control. `board.js`'s diff is comment-only; `npm test` and 31/31 determinism
green; engine diff empty.
  </done>
  <commit>test(audit): census every player-facing sink and enforce the dead-copy inverse in CI</commit>
</task>

<task type="auto" id="8" tdd="true">
  <name>Task 8: CO-REACHABILITY — a reason must be reachable in the state it explains (F11)</name>
  <files>src/ui/flow.js, scripts/ui_contract_check.js, scripts/narration_test.js</files>
  <precondition>`src/ui/flow.js:639-641` assigns `sub` across an `if`/`else if` chain whose two conditions are independent; the greyed-Trade reason sits in the `else` arm and is unreachable whenever an attack target is adjacent.</precondition>
  <behavior>
    - With an adjacent attack target AND no opponent holding cargo, BOTH explanations are available: the greyed Trade button's reason is reachable, not suppressed by Attack's informational text.
    - For every option carrying a `disabled:` expression, some reason string is reachable in the state where that expression disables it.
    - Run against the code at `ab98e04`, the check FAILS naming `src/ui/flow.js` and the suppressed reason — proving the gate cannot pass a broken tree.
    - A single-armed assignment, or a chain whose conditions are genuinely exclusive (a value equality ladder on one variable), does NOT fail — the negative control.
  </behavior>
  <action>
**Fix first, then gate — option (a), per the Ordering Rationale.**

**The fix (`src/ui/flow.js:639-641`).** Two independent facts are being treated as alternatives: whether
an enemy is adjacent, and whether anyone holds cargo to trade for. An adjacent enemy says nothing about
either question, so the `else if` is wrong. Make the two explanations independent, and **give the
disabled control priority over the enabled one**: informational text for a control the player can use
must never suppress the reason a control they cannot use is greyed. Where both apply, both should be
available — compose them rather than dropping one, in the order that puts the blocked action's reason
first. No new copy: both strings already exist and both are Wyatt-approved. Annotate inline in the
established form, citing D-41 and this finding.

**The gate — `ui_contract_check.js` assertion 6, "co-reachable explanation".** Two parts:

1. **Independent-condition suppression.** Find each explanation variable — a variable assigned a string
   and then passed as `ask()`'s 4th argument — and examine the `if`/`else if` chain that assigns it. Flag
   the chain when its conditions are **independent**: they reference disjoint sets of identifiers, so two
   can hold at once while only the first assigns. Do NOT flag a chain whose arms test the same variable
   against different values (a genuine ladder), which is the negative control.
2. **Disabled-without-a-reachable-reason.** For every option literal carrying `disabled:<expr>`, assert
   some reason string is reachable in the state where `<expr>` is true. Report the option's label and the
   guard so the failure is actionable.

Static analysis is sufficient and is this repo's convention for `*_check.js` gates — no DOM needed. Keep
`ui_contract_check.js` the home rather than adding a script: it already gates `src/` contracts, already
has the drill harness with a negative control, and this is a `src/` contract. The `npm test` chain does
not grow.

**Red-proof against the real broken code.** The drill reads `src/ui/flow.js` at `ab98e04` via `git show`
into a temp fixture and asserts the check FAILS on it, naming the suppressed reason. A gate written
loosely enough to pass today's tree therefore fails its own drill. Add the exclusive-ladder negative
control, and a second negative control: the fixed tree must PASS.

**Headless behavioural proof, so Wyatt's sitting does not grow.** Add an assertion to
`scripts/narration_test.js` that in the state "attack target adjacent AND nobody holds cargo", the
composed helper text contains the greyed-Trade reason. That is the observable the playtest found missing,
pinned without a browser.
  </action>
  <verify>
    <automated>
# 1. the fix: both reasons are available when both conditions hold, disabled-first
node -e '
const s=require("fs").readFileSync("src/ui/flow.js","utf8");
const i=s.indexOf("let sub=null");
if(i<0)throw new Error("the helper-text assignment moved — re-locate before asserting");
const region=s.slice(i,i+700);
if(/else\s+if\s*\([^)]*tradeOpp/.test(region))
  throw new Error("the cargo reason is STILL in an else-if arm — an adjacent enemy would suppress it");
if(!/tradeOpp/.test(region))throw new Error("the cargo reason vanished entirely");
console.log("PASS the two explanations are no longer mutually exclusive");
'

# 2. the gate is green on the fixed tree and reports the assertion by name
node scripts/ui_contract_check.js 2>&1 | tee /tmp/uic.txt
grep -qi 'co-reachab' /tmp/uic.txt || { echo "assertion 6 must print a co-reachability line"; exit 1; }
grep -i 'co-reachab' /tmp/uic.txt | grep -c '^FAIL' | grep -qx 0

# 3. RED-PROOF against the genuinely broken code at ab98e04, not a synthetic approximation
node -e '
const {execSync}=require("child_process");const fs=require("fs");const os=require("os");const path=require("path");
const d=fs.mkdtempSync(path.join(os.tmpdir(),"coreach-drill-"));
fs.mkdirSync(path.join(d,"src/ui"),{recursive:true});
fs.writeFileSync(path.join(d,"src/ui/flow.js"),execSync("git show ab98e04:src/ui/flow.js",{maxBuffer:1e8}));
const out=execSync("node scripts/ui_contract_check.js --drill 2>&1 || true").toString();
if(!/co-reachab/i.test(out))throw new Error("the drill does not exercise assertion 6");
console.log("PASS drill covers co-reachability against the ab98e04 tree");
'
node scripts/ui_contract_check.js --drill 2>&1 | tee /tmp/uicd.txt
grep -qi 'negative control' /tmp/uicd.txt
grep -qiE 'ladder|exclusive' /tmp/uicd.txt || { echo "drill needs the exclusive-ladder negative control"; exit 1; }
node scripts/ui_contract_check.js --drill

# 4. headless behavioural pin — the observable the playtest found missing
node scripts/narration_test.js 2>&1 | grep -qiE 'cargo to trade for yet' \
  || { echo "narration_test must pin the greyed-Trade reason in the both-conditions state"; exit 1; }
node scripts/narration_test.js

# 5. governing constraints
git diff --stat ab98e04..HEAD -- src/engine/index.js   # must print nothing
npm test
node scripts/determinism_baseline.js --verify
    </automated>
  </verify>
  <done>
`src/ui/flow.js`'s helper text no longer makes two independent conditions exclusive, and the greyed
control's reason takes priority over an enabled control's informational text. `ui_contract_check.js`
assertion 6 gates both halves — independent-condition suppression, and every `disabled:` option having a
reachable reason — and is red-proofed against the real `ab98e04` code plus an exclusive-ladder negative
control. `narration_test.js` pins the both-conditions observable headlessly. `npm test` green, 31/31
determinism, engine diff empty, no new dependency.
  </done>
  <commit>fix(f11): the greyed Trade reason must not be suppressed by an adjacent enemy, and gate it</commit>
</task>

<task type="auto" id="9" tdd="true">
  <name>Task 9: DELIVERY — a broadcast reaches everyone, so its content must not branch on the viewer (F7)</name>
  <files>src/ui/util.js, src/ui/flow.js, src/orchestrator.js, scripts/ui_contract_check.js, scripts/narration_test.js</files>
  <precondition>`src/ui/util.js:906`, `src/ui/flow.js:196` and `src/orchestrator.js:360` each send ONE broadcast whose content is chosen by `appState.mySeat`; measured live, of 2516 narration lines received on a guest seat, zero were the intended spectator line.</precondition>
  <behavior>
    - Given a payload built by the fixed `ask()`, the ACTOR's seat resolves to the prompt and a SPECTATOR's seat resolves to the spectator line — asserted per seat through the existing variant-selection helper, no browser.
    - Run against the code at `ab98e04`, the check FAILS naming all three sites — proving the gate cannot pass a broken tree.
    - The D-10 mechanism's own definition site, which references the local seat precisely in order to SELECT a variant, does NOT fail — the negative control.
  </behavior>
  <action>
**Fix first, then gate — option (a), per the Ordering Rationale.**

**The rule, stated generally because it is what makes this a gate rather than three patches:** a single
broadcast reaches every client, so **content that branches on the local viewer is always a defect**. The
correct shape already ships — broadcast neutral content plus per-seat variants and let each client
select. `netNarrate(html, variants)` forwards variants to `pickNarrVariant` on the host and through
`netSetNarr` to `watchNarr` on every guest, so both selection paths already exist and are already
covered by `narration_test.js`'s per-seat assertions.

**Three sites to convert.** My sweep found one more than the finding named; all three are the same shape:

| Site | Today | Becomes |
|---|---|---|
| `src/ui/util.js:906` (`ask`) | one message chosen by `seat===appState.mySeat` | broadcast the spectator line as neutral; the actor's prompt as that seat's variant |
| `src/ui/flow.js:196` (`pickCell`) | `p.idx===appState.mySeat?"":"…is choosing where to sail…"` | same conversion; the actor's variant is the empty string |
| `src/orchestrator.js:360` (`asyncBattle`) | `seat===appState.mySeat?msg:spectMsg` | broadcast `spectMsg` as neutral; `msg` as the actor's variant |

**On the battle site specifically — this is a new finding, not a reversal.** D-35's sweep listed
`orchestrator.js:361` as *"the correct actor/spectator split (D-10), not a transport fork"*, and that was
right about the question it asked: does guest-side code *author* its own text? It does not. This gate asks
a different question — does the broadcast *reach* the right viewer? — which that sweep never examined.
Record it that way in the code comment so the decision trail stays coherent rather than looking
contradictory.

**The gate — `ui_contract_check.js` assertion 7, "broadcast delivery".** Flag any call to
`onBroadcast`/`netNarrate`/`netSetNarr`/`netBroadcast` whose **content argument** references
`appState.mySeat`, a bare `mySeat`, `seatLocal(`, `decisionIsLocal(` or `isLocalTo(`. Two precision
requirements, both load-bearing:

- **Examine the content argument only.** `netNarrate`'s own definition references the local seat inside
  `pickNarrVariant(...)` — that is the *selection*, which is the correct mechanism. Flagging it would make
  the gate unsatisfiable and it would then be loosened. Exempt the mechanism's definition sites by name,
  with the reason written next to the exemption.
- **Fail with the fix in the message**, naming the neutral-plus-variants shape, so the next person hits a
  signpost rather than a puzzle.

**Red-proof against the real broken code.** The drill reads `src/ui/util.js`, `src/ui/flow.js` and
`src/orchestrator.js` at `ab98e04` via `git show` and asserts the check FAILS naming all three sites.
Negative control: the mechanism's own definition, and a correctly-converted call, must both PASS.

**Headless per-seat proof, so Wyatt's sitting does not grow.** Add assertions to
`scripts/narration_test.js` that for the converted payload the actor's seat resolves to the prompt while
a spectator seat resolves to the spectator line — the same technique already covering 14 variant cases,
and the exact observable the guest recording showed missing.
  </action>
  <verify>
    <automated>
# 1. the fix: no broadcast's CONTENT branches on the local viewer any more
node -e '
const fs=require("fs"),path=require("path");
function walk(d){return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):(e.name.endsWith(".js")?[path.join(d,e.name)]:[]));}
const SINK=/\b(onBroadcast|netNarrate|netSetNarr|netBroadcast)\s*\(/;
const LOCAL=/\bmySeat\b|seatLocal\s*\(|decisionIsLocal\s*\(|isLocalTo\s*\(/;
const EXEMPT=["src/orchestrator.js:272"]; // netNarrate/netBroadcast definitions: they SELECT, not branch
const hits=[];
for(const f of walk("src")) fs.readFileSync(f,"utf8").split("\n").forEach((l,i)=>{
  if(/^\s*\/\//.test(l))return;
  const key=f.replace(/\\\\/g,"/")+":"+(i+1);
  if(SINK.test(l)&&LOCAL.test(l)&&!EXEMPT.includes(key))hits.push(key+"  "+l.trim().slice(0,90));
});
if(hits.length)throw new Error(hits.length+" broadcast(s) still branch on the local viewer:\n  "+hits.join("\n  "));
console.log("PASS no broadcast content branches on the local viewer (3 sites converted)");
'

# 2. the gate is green and reports the assertion by name
node scripts/ui_contract_check.js 2>&1 | tee /tmp/uic7.txt
grep -qi 'delivery' /tmp/uic7.txt || { echo "assertion 7 must print a delivery line"; exit 1; }
grep -i 'delivery' /tmp/uic7.txt | grep -c '^FAIL' | grep -qx 0

# 3. RED-PROOF against the genuinely broken code at ab98e04
node -e '
const {execSync}=require("child_process");
const out=execSync("node scripts/ui_contract_check.js --drill 2>&1 || true").toString();
if(!/delivery/i.test(out))throw new Error("the drill does not exercise assertion 7");
for(const s of ["util.js","flow.js","orchestrator.js"])
  if(!out.includes(s))throw new Error("the drill must name all three converted sites; missing "+s);
console.log("PASS drill red-proofs delivery against the ab98e04 tree, naming all three sites");
'
node scripts/ui_contract_check.js --drill 2>&1 | grep -qi 'negative control'
node scripts/ui_contract_check.js --drill

# 4. HEADLESS PER-SEAT PROOF — the observable the guest recording showed missing
node scripts/narration_test.js 2>&1 | grep -qiE 'is deciding|spectator' \
  || { echo "narration_test must pin per-seat delivery of the spectator line"; exit 1; }
node scripts/narration_test.js

# 5. governing constraints — presentation tier only
git diff --stat ab98e04..HEAD -- src/engine/index.js   # must print nothing
node scripts/module_graph_check.js
npm test
node scripts/determinism_baseline.js --verify
    </automated>
  </verify>
  <done>
All three viewer-branching broadcasts are converted to the D-10 neutral-plus-variants shape, and no
broadcast content in `src/` references the local seat except the mechanism's own selection site, which is
exempted by name with its reason. `ui_contract_check.js` assertion 7 gates the rule, fails with the fix
named in its message, and is red-proofed against the real `ab98e04` code naming all three sites, with the
mechanism definition as a negative control. `narration_test.js` pins per-seat delivery headlessly — actor
gets the prompt, spectator gets the spectator line. The battle site's comment records that this is a new
finding rather than a reversal of D-35's sweep. `npm test` green, 31/31 determinism, engine diff empty,
`src/ui` still never imports `src/net`.
  </done>
  <commit>fix(f7): broadcast neutral content plus per-seat variants, and gate viewer-branching broadcasts</commit>
</task>

<task type="auto" id="10">
  <name>Task 10: the runbook, and retiring the fragility note the tool no longer has</name>
  <files>art-review/README-narration-audit.md, scripts/extract_narration_lines.js, package.json</files>
  <action>
The tool is only re-enterable if Wyatt can start a wording pass without Claude reconstructing how it
works. Write `art-review/README-narration-audit.md` in **plain language, no jargon** — he is a
non-coder. Cover, in the order he needs it:

1. **What this tool is for**, in two sentences.
2. **How to start a wording pass**: start the local server, open the page, and what he will see.
3. **How to edit**: the tag dropdown, the notes box (typing in it means rewrite), the addressed
   boxes and why there are sometimes two, the question box that never becomes copy, the merge target,
   and the reviewed checkbox with its counter.
4. **How to hand his work back**: press Export, where the file lands, where to put it in the repo.
5. **The four commands**, one line each, plainly described: regenerate the inventory; check the tool
   is healthy; check the game matches what he approved; apply his approved copy (and that it shows
   him a preview first and writes nothing until told to).
6. **What the safety nets do for him**: a card can no longer show wording the game does not ship; a
   line he approved cannot silently fail to ship; his review marks are stored in the repo, not just
   in his browser, so a new machine or a cleared browser loses nothing.
7. **What to do when a check goes red** — read the named id, re-run the extractor, and if a marker
   was deleted, put it back.

**Retire the extractor's fragility note.** Its header currently records the line-number keying as a
KNOWN FRAGILITY with instructions for the next person who hits the drift, and names anchor-text
keying as the durable fix filed as a follow-up. That follow-up is now done, one step better than
proposed (explicit source ids rather than anchor text, because an anchor made of prose breaks on the
one operation this tool exists to perform). Replace the note with what is now true: the id scheme,
where ids are declared, and the three gates that keep them honest. Do not delete the history — the
account of *why* is the load-bearing part; state that it was resolved and how.

Add the remaining npm scripts so all four commands are one word each, and reference them from the
README by name.
  </action>
  <verify>
    <automated>
# 1. the runbook exists, covers all seven sections and all four commands
test -f art-review/README-narration-audit.md
node -e '
const s=require("fs").readFileSync("art-review/README-narration-audit.md","utf8");
for(const k of ["extract_narration_lines","narration_audit_check","narration_copy_check","apply_narration_copy"])
  if(!s.includes(k))throw new Error("runbook must name the command: "+k);
for(const k of ["Export","reviewed","addressed","merge","question"])
  if(!new RegExp(k,"i").test(s))throw new Error("runbook must explain: "+k);
console.log("PASS runbook covers all four commands and every editing control");
'

# 2. plain language: no unexplained jargon in the runbook
node -e '
const s=require("fs").readFileSync("art-review/README-narration-audit.md","utf8");
const jargon=["localStorage","ESM","AST","regex","idempotent","projection"];
const hit=jargon.filter(j=>new RegExp("\\\\b"+j+"\\\\b").test(s));
if(hit.length)throw new Error("jargon a non-coder will not parse: "+hit.join(", "));
console.log("PASS no unexplained jargon");
'

# 3. the fragility note is retired, and the resolution is recorded
grep -c 'KNOWN FRAGILITY' scripts/extract_narration_lines.js | grep -qx 0
grep -qiE '@copy' scripts/extract_narration_lines.js

# 4. all four commands are one word and run
for s in audit:extract audit:check audit:copy apply:copy; do grep -q "\"$s\"" package.json || { echo "missing npm script $s"; exit 1; }; done
npm run audit:extract --silent >/dev/null
npm run audit:check --silent >/dev/null
npm run audit:copy --silent >/dev/null

# 5. governing constraints
git diff --stat ab98e04..HEAD -- src/engine/index.js   # must print nothing
npm test
node -e 'const a=require("./package.json");const b=JSON.parse(require("child_process").execSync("git show ab98e04:package.json"));
if(JSON.stringify(a.dependencies)!==JSON.stringify(b.dependencies)||JSON.stringify(a.devDependencies)!==JSON.stringify(b.devDependencies))throw new Error("dependency keys changed");console.log("PASS no dependency change");'
    </automated>
  </verify>
  <done>
`art-review/README-narration-audit.md` exists, names all four commands, explains every editing
control in plain language, and contains no unexplained jargon. The extractor's fragility note is
replaced by an account of the resolved id scheme. Four one-word npm scripts exist and run.
`npm test` green at 17 gates; no dependency changed; engine diff empty.
  </done>
  <commit>docs(audit): plain-language runbook for a wording pass, and retire the line-number fragility note</commit>
</task>

<task type="checkpoint:decision" id="11" gate="blocking">
  <name>Task 11: one sitting — five checks, two rulings, and the tool is his</name>
  <decision>
Two rulings and one confirmation, then the tool is his. This is the **single** human sitting this
task asks for — everything else was settled by a gate.
  </decision>
  <context>
**What changed, and why it was necessary.** The audit tool was not fragile, it was dead: 80 of its
91 hardcoded source locations had gone stale, and the very first one it looks up
(`src/ui/lobby.js:115`) threw, so the page showed its loading placeholder and nothing else. 130 of
your 209 review marks pointed at cards that no longer existed under those names, and 20 of the 26
hand-written card texts were wording the game stopped shipping in 15-06.

**What was done about it:**

| Root cause | Fix | Now enforced by |
|---|---|---|
| Identity — line-number keying | every copy site declares its own permanent id in the source | the extractor fails on an unmarked site |
| Fidelity — hand-written card text | one render core, shared by the page and the tests; cards render from live source | no card can show wording the game does not ship |
| Apply — the manual retype step | a command applies your approved copy and proves each write before it lands | shipped copy is compared to your export on every test run |
| Scope — complete against too narrow a definition | every one of the 163 ways text reaches the screen is either a card or an excluded item with a reason | a new way to show text fails the build |

`npm test` grew from 15 gates to 17. Your 209 marks are now stored in the repo rather than only in
your browser, so a new machine or a cleared browser loses nothing.
  </context>
  <options>
    <option id="approve">
      <name>Approve — the five items below are satisfied and both rulings are settled</name>
      <pros>The tool is re-enterable; the next wording pass starts by opening the page and editing.</pros>
      <cons>None known; every automated gate is green.</cons>
    </option>
    <option id="revise">
      <name>Revise — a card reads wrong, or a retirement is not acceptable</name>
      <pros>Fixes it before you build a session's work on top of it.</pros>
      <cons>One more pass.</cons>
    </option>
  </options>
  <resume-signal>
**One sitting. Claude starts the local server first and hands you a URL — you open the link, nothing
else.** (Per this plan's own rule: he runs no commands.) Keep the server running until he says he is
done, per the standing preference in memory.

1. **It renders.** You should see the flow-chart stages with cards inside them, and connecting lines
   actually drawn between the stage boxes. Before this work you would have seen a blank page.
2. **Resize the window once.** The connecting lines should redraw and still join the right boxes.
3. **The counter reads `209 of N reviewed`** (N is larger than before — `src/ui/board.js`'s
   end-of-voyage banner, the check-my-recipe button and the empty-hold label were never in the audit
   and are now cards for you to review). Then **read three cards and tell me whether they read
   right**: the per-turn banner, the storm anchor-or-flip prompt, and the battle round-result lines.
   **This is a copy judgment, not a check.** You do not need to launch the game or compare anything —
   the automated gate already proves each card shows exactly what the game ships, and it runs on every
   test. All I want is your ear on the words.

**Items 4 and 5 are written out for you below by Claude, as bullets. You run nothing.**

4. **Six retirements to confirm.** These are lines whose home in the code 15-06 deleted, so your mark
   on them has nowhere left to land — and in all six cases **you were the one who said merge them**:
   - the three trade-wind rim-sweep lines, folded into the single table line (D-36)
   - the three battle round-result duplicates, folded into their twins (D-52)

   Claude lists each one by its wording. Say whether any of them is actually still in the game under
   a different name; that is the only thing that could make a retirement wrong.
5. **The residual list.** Every row the applier could not prove it should write, each with its reason
   in one line. The known one: the battle scoreboard's addressed lines, which the footer has no
   per-seat mechanism for — recommendation is to defer that to a Phase 16 item. If the applier did
   write anything, Claude shows you the before/after wording, not a code diff.

**Two rulings still open from the previous task, unchanged and still yours to make:**
`src/ui/recipe.js`'s three recipe descriptions (recommendation: leave — cookbook prose, not pirate
voice) and `index.html`'s credits paragraph (recommendation: leave — your own authorial prose).
Both are now *excluded with a stated reason* rather than silently absent, so the tool will keep
asking until you rule.

**Not needed here:** no playthrough, no commands, no gate output. If you want to play the game
afterwards you are of course welcome to, but nothing in this task depends on it.

Type "approved", or name what is wrong.
  </resume-signal>
</task>

</tasks>

<verification>
Run at the final commit, all of it:

- `npm test` -> exit 0, **17 gates** (was 15)
- `node scripts/determinism_baseline.js --verify` -> 31/31, all seeds passed
- `git diff --stat ab98e04..HEAD -- src/engine/index.js` -> empty output
- `node scripts/narration_audit_check.js` -> exit 0, every assertion PASS, 0 distinct / 0 occurrences
  of line-number keying, all affordances present, per-file sink counts matching `SINK_EXPECTED` and an
  independent recount
- `node scripts/narration_audit_check.js --drill` -> exit 0, every assertion red-proofed plus a
  negative control
- `node scripts/narration_copy_check.js` -> exit 0, **155 approval fields** compared against Wyatt's
  stored copy (89/55/11 pinned, the merge-tagged row excluded by name) and **exactly 104 drift rows**
  pinned to the committed baseline, labelled as two distinct classes; allowlist at most 6, each entry
  reasoned and non-stale
- `node scripts/narration_copy_check.js --drill` -> exit 0, including the anti-vacuity drill proving an
  approval cannot pass by self-comparison
- `node scripts/extract_narration_lines.js` -> exit 0, inventory byte-stable across two runs
- `node scripts/apply_narration_copy.js` -> exit 0, dry-run, working tree unchanged
- `node scripts/ui_contract_check.js` -> exit 0, **7 assertions** (was 5), including co-reachability and
  broadcast delivery
- `node scripts/ui_contract_check.js --drill` -> exit 0, all 7 red-proofed against the real `ab98e04`
  code where the assertion describes a fixed bug, each with a negative control
- no broadcast content in `src/` references the local seat except the mechanism's own selection site
- `node scripts/module_graph_check.js` -> exit 0
- `git diff -U0 ab98e04..HEAD -- src/ui src/orchestrator.js | grep -vE '^[+-]\s*//'` -> only the
  literal changes any applied copy row made, and each of those is named in the Task 6 output
- `package.json` `dependencies`/`devDependencies` byte-identical to `ab98e04`; no `package-lock.json`
</verification>

<success_criteria>
- The audit page renders every card from a clean clone with no hand-editing, and `npm test` proves it
  without opening a browser.
- No ad-hoc, prompt, button, sub or misc card id contains a line number; every one is declared in
  source and survives both a source move and a copy rewrite.
- All 209 reviewed dispositions are accounted for: `209 == aliased + retired`, the retired set is the
  pinned six-id list, every retirement carries Wyatt's own `merge` tag, every frozen id traces to
  `ddefa8f` or the pinned five exceptions, and no `keep` is degraded to unknown.
- All 155 fields where Wyatt stored player-facing copy are compared to what he wrote, with per-class
  counts pinned exactly (89/55/11) so a skipped class fails, and the one merge-tagged row holding an
  instruction excluded by name; the 104 rows carrying no neutral copy are pinned to a committed baseline
  and reported as drift, never as approval. Neither class can pass by comparing the shipped side to
  itself.
- Approved copy applies by one command, previews before writing, refuses what it cannot prove, and
  re-renders every write to verify it before touching disk — including refusing an added icon that
  would ship in the wrong form.
- A reason is reachable in the state it explains, and every `disabled:` option has one — gated, and
  red-proofed against the code that violated it.
- No broadcast's content branches on the local viewer; the actor gets the prompt and spectators get the
  spectator line, pinned per seat headlessly.
- The human budget holds: one sitting, no commands, no gate output, no playthrough.
- Every way text reaches a player is a reviewable card or a reasoned, presence-verified exclusion;
  no card presents text a player can never read; both directions run in CI.
- Every affordance in the Preserve List is asserted present on every gate run.
- `src/engine/index.js` untouched, 31/31 determinism, `npm test` green at every commit, no new
  dependency, no build step.
</success_criteria>

<output>
Create `.planning/quick/20260729-narration-audit-tool-hardening/SUMMARY.md` when done, recording:
the measured before/after for each of the four headline numbers in Current State; the alias map's
retirement list with reasons; the final divergence allowlist and why each entry remains; every drill
result; anything the applier refused; and for the two playtest fixes, the before/after of each converted
site plus the per-seat assertions that now pin them.
</output>
