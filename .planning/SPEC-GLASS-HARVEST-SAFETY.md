# SPEC — THE GLASS CANNOT LOSE HIS WRITING

*Design only. Nothing here is built. Written by the Advisor 2026-09-02, 3:15 PM ET, at his direct
instruction. **Reviewed by a fresh CEO (117), which returned PARTIAL and found two real errors in the
first draft; both are corrected below and the correction is marked at each site.***

> ⚠ **THIS LINE USED TO SAY "verified by a fresh CEO before it reached him; filed as the top row of
> the Chart", IN THE PAST TENSE, WRITTEN WHILE THE CEO WAS STILL RUNNING AND WHILE THE ROW WAS NOT
> AT THE TOP.** CEO 117 caught it as the sixth consecutive instance of one fault: *"the summarising
> line always rounds toward finished."* It is left visible here rather than quietly swapped, because
> a document that silently repairs its own overclaim teaches nothing.

> **HIS INSTRUCTION, VERBATIM:**
>
> *"design a permanent solution to this problem: "That's the exact hazard I filed twenty minutes ago
> as a theory, arriving with your actual writing in it. The one-line version, and it's what the fix
> has to be built on: the harvest stamp records when a session looked. It is not evidence the page
> hasn't changed since. Your page carries its own version number — that's the fact that can answer
> "is a republish safe?", and a clock never can." then add it to the chart at the top priority"*

---

## 1. THE ONE SENTENCE THE WHOLE DESIGN HANGS ON — his, and it is right

**A republish is safe if and only if the version of the page you HARVESTED is the version that is
LIVE. That is a comparison of identities. A clock cannot express it, so no clock can enforce it.**

Everything below is that sentence made mechanical.

## 2. WHAT ACTUALLY HAPPENED, MEASURED — because the fix has to survive this exact replay

| time (ET) | what |
|---|---|
| 3:07:08 PM | the Glass tick harvested, correctly found **zero** ideas, and stamped `LAST-HARVEST` |
| 3:07:15 PM | **Wyatt's first idea landed** — seven seconds later |
| 3:07:23 – 3:07:43 PM | four more ideas |
| 3:09:08, 3:09:54 PM | two more, both marked **DO NOW** |
| — | from 3:07:08 PM the stamp read "fresh" for **thirty minutes**, and `glass-harvest-first.cjs` would have green-lit any republish in that window. A republish regenerates the page from disk and drops everything in `glassState`. |

**Seven ideas, none of them recoverable from anywhere but the live page.** They survived by luck of
ordering, not by design — the Advisor happened to read the page, and a later tick's read happened to
land after his writing.

**THE ACCEPTANCE TEST FOR ANYTHING BUILT HERE IS THAT EXACT SEQUENCE.** Harvest at T finds nothing,
he writes at T+7s, a session republishes at T+5min. **If his words do not survive that, the fix is
not a fix.**

## 3. THE FAULT IS NOT ONLY THE STAMP — IT IS WHERE THE GUARD IS PLACED

The stamp is the symptom his sentence names. Underneath it is something the runbook makes
unavoidable. `.planning/wyclau/GLASS-UPDATE-SESSION.md`'s nine steps run in this order:

```
2. READ the live page (the harvest)      <- the only moment his words are observed
3. run the change gate + log the verdict
4. write LAST-HARVEST                     <- the "evidence", written AFTER the read
4b. reap the Chart (a judgement pass)
5. read GLASS-NOTE.md and check it is still true
6. regenerate the page  (glass.mjs --note ...)
7. PUBLISH                                <- the destructive act
```

**Steps 3 through 6 are minutes of real work — a Chart reap, a staleness judgement, a regeneration.
So even a PERFECTLY executed tick has a multi-minute gap between the read and the publish, and
anything he types inside it is destroyed.** Today's incident used seven seconds of that gap. A
slower tick has a wider one.

⚠ **THEREFORE: MOVING THE GUARD MATTERS MORE THAN FIXING THE STAMP.** The check belongs at **step 7,
against the live page, in the same breath as the publish** — not at step 4, recording that step 2
happened. A guard that runs before minutes of unrelated work is a guard about the past.

## 4. THE DESIGN — four layers, each independently useful, cheapest first

### LAYER A — ✅ **MEASURED TRUE, 2026-09-02 4:58 PM ET.** THE PLATFORM REFUSES A STALE PUBLISH. NEVER `force`.

> ✅ **THIS IS NO LONGER AN INFERENCE. THE EXPERIMENT RAN AND IT REFUSED.** On a disposable artifact
> (`1130683a-f8ce-49de-8f10-43adbcf1d0c9`), never on the Glass: the Advisor published `rev 1`; the
> Glass-update session published `rev 2` at 4:57:45 PM, standing in for Wyatt typing an idea; the
> Advisor republished `rev 1` unchanged, no `force`. **Verbatim:** *"Publish refused — nothing was
> merged or published: a newer version (1788382665-1bce) published by another session or agent at
> 2026-09-02T20:57:45Z is live and this publish was not built on it."* It saved the live source and
> required it be read in full before any further publish.
>
> **AND A SECOND, INDEPENDENT GATE SURFACED WITHOUT BEING LOOKED FOR:** the peer's own first publish
> was refused because *"you hadn't viewed the live version of this artifact"*. **Two enforcement
> points — a read-gate and a stale-base gate.**
>
> ⚠ **SO §2's ACCEPTANCE TEST IS ALREADY PASSED BY THE RUNTIME, AND §2's NARRATIVE OVERSTATED THE
> DANGER.** The 3:07 PM sequence could not have destroyed his ideas silently; that publish would
> have been refused. **The hazard was reported as a near-miss without anyone measuring the
> protection** — rule 6, broken inside a document about not breaking it. Left standing, corrected
> here, rather than rewritten to look prescient.
>
> **WHAT STILL STANDS:** the harvest stamp remains a clock that cannot answer *"is a republish
> safe?"*. It is simply **not the last line of defence, and nobody knew that.** A guard never tested
> and a guard that does nothing are indistinguishable from inside.
>
> **WHAT IS LEFT OF LAYER A: one gate.** The runbook already says *"NEVER PASS `force`"*
> (`GLASS-UPDATE-SESSION.md:222-230`) and `force` appears nowhere in the Glass publish path — **but
> nothing enforces it, so it is a sentence, and sentences are what failed here.**
>
> ⚠ **AND THE RESIDUAL EXPOSURE MOVED — THIS IS THE PART TO CARRY FORWARD.** The tool refuses and
> **hands back the live source to merge**. A careless merge can still drop his words. The difference
> is that it is now a **visible act by a session holding his text**, not a silent overwrite. Layers
> C and D are re-aimed at that, and it is a far narrower target.

The Artifact tool carries optimistic concurrency: a publish is tracked against the version the
session last read or published, and **a publish over a newer version is REFUSED and hands back the
live content to merge onto**. `force: true` discards it. **This is exactly his invariant, already
implemented, already free — and it fails CLOSED**, which nothing else in this system currently does.

**The rule: a Glass publish NEVER passes `force`.** A conflict is not an obstacle to get past; it is
the system telling you he wrote something. **On conflict: re-read, harvest what is new, then
publish.**

- **Enforceable mechanically today:** a gate greps every Glass publish path and the runbook for
  `force`, and fails the build if one appears. `force` on the Glass is the single most dangerous
  token in this repo and nothing currently forbids it.
- ⚠ **WHAT IS GENUINELY UNKNOWN HERE IS NARROWER THAN THE FIRST DRAFT CLAIMED — CORRECTED BY CEO 117,
  AND THE CORRECTION MATTERS BECAUSE IT UNBLOCKS THE WORK.** The draft said nobody knew *"whether his
  in-page save is treated as the same session's own write and passes silently"*, and made that one
  experiment a precondition for everything. **Half of it was answered on disk, in the file this spec
  is about.** `glass.mjs:22-23`: his save **is a page self-publish that creates a new artifact
  version**, and *"sessions watching the artifact are woken by that save"* — a new version written by
  the page is not the publishing session's own write. **Rule 20 — read the subsystem's own doc first
  — would have caught this, and the spec's own author did not.**
- **WHAT REMAINS TO MEASURE, AND IT IS SMALL:** whether the tool's refusal actually fires for the
  publishing session, i.e. does a session that read version *N*, and publishes after his save made
  *N+1*, get the conflict rather than a silent overwrite. **One test: type an idea, then publish from
  a session that read the page beforehand, and record what comes back.** If it conflicts, Layer A is
  nearly the whole fix and B is hardening. If it does not, Layer A is worthless and B is mandatory.
  **Start from `glass.mjs:22-23`, not from zero** — and still do not build on this paragraph until
  the refusal itself has been seen.

### LAYER B — THE STAMP RECORDS AN IDENTITY, NOT A TIME — **downgraded to a convenience, 4:58 PM**

> **Layer A's measurement demoted this one.** With the runtime refusing a stale publish outright,
> comparing versions beforehand no longer stands between him and losing work — it turns a hard
> refusal into a smooth re-harvest. **Still worth doing, no longer mandatory, and it must not be
> built before Layer A's gate.** Deleting `FRESH_MIN` remains right either way: a clock that cannot
> answer the question should not be left standing beside one that can.

`.planning/wyclau/LAST-HARVEST` stops being a bare timestamp and becomes a receipt:

```json
{ "artifactVersion": "1788376194-19ee", "generatedAt": "...", "harvestedAt": "...",
  "ideaIds": ["i1788376035472", "..."], "rulingKeys": [] }
```

- **`artifactVersion` is the load-bearing field.** It is the fact his sentence points at.
- Immediately before publishing, the session re-reads the artifact and compares. **Equal → publish.
  Different → re-harvest first.** The comparison costs one read and is the only thing that can
  answer the question.
- **`FRESH_MIN = 30` is DELETED.** With a version to compare, a clock has no job; keeping it would
  leave a second, weaker answer standing beside the real one.

⚠ **A HOOK CANNOT DO THIS COMPARISON AND MUST NOT PRETEND TO.** `glass-harvest-first.cjs` is a shell
process with no Artifact tool; it cannot fetch the live version. **So the hook's honest job shrinks:
require that a receipt exists and names a version, and state in its denial that the session itself
must confirm the version is current.** A hook that claimed to verify liveness would be exactly the
instrument failure this whole document is about. `mark_glass_published.mjs` already refuses to stamp
a publish it was not given a version for, and says why in those words — **follow that file's example,
it got this right first.**

### LAYER C — HARVESTING IS IDEMPOTENT, BY ID

Every idea already carries a stable id (`i1788376035472`). A `harvest_glass.mjs` takes the page's
`glassState` and files anything whose id is not already in `INBOX.md` / `CHART.md`, skipping the
rest.

- **A double harvest becomes harmless**, so a session in doubt can always just harvest again. Today
  two sessions harvested the same seven ideas and had to compare notes by message to work out
  whether they had duplicated them — a question the data should answer, not a conversation.
- **A missed harvest becomes recoverable** as long as the page still holds it.
- **It removes the incentive that causes the damage**: skipping a harvest is currently "efficient",
  and this makes it free instead.

### LAYER D — A SECOND COPY **OUTSIDE THE ARTIFACT** (the one that ends the class)

Every layer above narrows the window. **This one removes it.** Today an idea lives in exactly one
place — the published artifact — from the moment he presses the button until a session copies it out.
**Any single-copy design keeps this failure class alive; only a second copy kills it.**

> ⚠ **THE FIRST DRAFT OF THIS LAYER SPECIFIED SOMETHING THAT ALREADY SHIPPED, AND A BUILDER FOLLOWING
> IT WOULD HAVE REBUILT IT.** It read: *"The page should append each idea to durable storage at the
> moment he submits it, before and independently of any session"*, and refused to name a capability.
> **That is `glass.mjs:1218` — `cap.publish(buildDoc(state))` on submit — described in
> `glass.mjs:21-23` in its own words (*"rebuilds its own full document with the idea appended and
> SAVES ITSELF as the new artifact version"*), declared at `glass.mjs:63-65`, and gated by
> `scripts/qa/glass_optimistic_save_check.mjs`.** Found by CEO 117; verified here by reading those
> lines, not on the reviewer's word.
>
> **THE MISSING WORD WAS *OUTSIDE*.** A capability that saves his idea back into the same page keeps
> his words in exactly one place — **and that place is the one a republish overwrites.** Self-saving
> is what makes his writing visible to sessions; it is not a second copy, and the first draft
> mistook one for the other.

**THE REQUIREMENT, STATED SO IT CANNOT BE SATISFIED BY WHAT ALREADY EXISTS:** at the moment he
submits, his words must reach **a store that is not the artifact** — a file in this repo, committed,
or an equivalent the page can write to that survives the page being regenerated. Then a lost
republish costs a re-read instead of his writing.

- **The mechanism is the open question and it is genuinely open**, because the page runs in a
  sandbox and cannot write to the repo directly. Candidates to weigh, not to assume: a session that
  is *woken by his save* (`glass.mjs:22-23` says sessions watching the artifact are) and whose FIRST
  act is to append the raw idea to a file and commit it, before any other step; or a page-side store
  distinct from the document. **Read the `artifact-capabilities` skill before choosing** — but the
  requirement above is what the choice has to satisfy, and "the page saves itself" does not.
- **This is the largest of the four and the only one that makes the acceptance test in §2 pass
  unconditionally.** A, B and C all still lose his words in some sufficiently unlucky ordering.

## 5. WHAT WOULD PROVE THIS DESIGN WRONG

Written before anything is built, per the prediction rule, so it cannot be retrofitted:

1. ✅ **THIS ONE FIRED, 4:58 PM ET, AND IT IS THE WHOLE VALUE OF HAVING WRITTEN IT DOWN FIRST.** It
   read: *"If the measurement in Layer A shows the platform already conflicts on his in-page saves,
   then most of B is ceremony and the honest fix is much smaller — one gate forbidding `force`, plus
   C. **Say so and build less.**"* **It does conflict. So: said, and the build is smaller.** A
   prediction written before the result is the only kind that can do this — retrofitted, it would
   have been reframed as a partial win.
2. **If ideas turn out NOT to carry stable ids across a republish**, Layer C's whole premise fails
   and idempotency needs a content hash instead. Check before building.
3. **If the page cannot be given durable storage on this account**, Layer D is unavailable and the
   honest ceiling is "the window is narrow" rather than "his words cannot be lost". **Say that out
   loud rather than letting D quietly not get built** — the part that is hard to build is exactly the
   part that has silently gone missing twice this week (the Chartkeeper, and the Glass session's own
   self-clearing).

## 6. WHAT THIS DOES NOT COVER

- **His RULINGS** (`rulings: {}`) travel the same path and have the same exposure. Everything here
  applies to them unchanged; they are omitted from the worked example only because today's incident
  happened to be ideas.
- **Ordering between sessions.** Three sessions share this checkout and any of them may publish.
  This spec makes each publish safe; it does not make them take turns.
