# TWO INBOXES, ONE HIDDEN WORD, AND A DOOR THAT CANNOT SEE URGENCY

*Written by the Advisor 2026-09-02 at Wyatt's instruction. **Design only — nothing here is built.**
Three questions of his, answered with measurements, and one design he asked for.*

**His words:** *"We need SCHEDULED to be shown in The Glass -- i thought that the entire point of
The Chart is that those ARE scheduled. if that's not the case, please tell me what The Chart (which
is rendered on Glass) is. also explain why BLOCKED ON WYATT contains no table rows -- why was a task
that is genuinely blocked on my decision NOT added to BLOCKED ON WYATT? this is a failing. explain
it, diagnose it, propose a solution. Also design a way for you to inject immediate work that needs
to be done INTO the watch"*

---

## THE ROOT CAUSE, AND IT EXPLAINS ALL THREE AT ONCE

> ## ⚑ THERE ARE TWO INBOXES. HIS WORDS GO TO THE ONE THE WATCH IGNORES.
>
> | | file | who reads it |
> |---|---|---|
> | **The Watch's inbox** | `.planning/wyclau/INBOX.md` | `door/SKILL.md:81` — ***"Pick ONE item. INBOX first — the oldest OPEN item; his words outrank the Chart."*** |
> | **Where his Glass words land** | `.planning/CHART.md` → `## THE IDEA INBOX` | `GLASS-UPDATE-SESSION.md:124` — the harvest copies every idea *"into `.planning/CHART.md` under '## THE IDEA INBOX'"* |
>
> **The priority channel he asked for ALREADY EXISTS and already works. Everything he types into the
> Glass bypasses it.** An idea written on the Glass lands in the Chart's idea inbox, which the Door
> does not treat as *his words* at all — it is merely more Chart.
>
> **Measured now: `INBOX.md` holds 9 items marked `status: OPEN`.** The Door says oldest-OPEN-first,
> so `T-076` — the row carrying his four Glass asks, marked ★★★ — sits behind **all nine**. The stars
> are decoration; nothing reads them.

---

## 1 · WHAT "THE CHART" ON THE GLASS ACTUALLY IS

**Not the Chart. Two specific slices of it** (`glass.mjs:345, 385-386`):

1. every `- [ ]` row inside `## STEP 1 CHECKLIST`, **plus**
2. every `## THE IDEA INBOX` entry that has **not declared a fate**.

### THE FATE TEST IS THE BUG, AND IT CONTRADICTS THE CHARTER IN WRITING

`glass.mjs:375` treats these eight words as equivalent:

```
SHIPPED | PARKED | SCHEDULED | HARVESTED | CLOSED | DONE | FIXED | ROOT-CAUSED
```

**Five of them mean FINISHED. `SCHEDULED` means committed-and-not-done — which is the definition of
an open task.** Lumping them together is the whole fault.

**MEASURED against his Chart, using the page's own logic rather than a description of it:**

| | |
|---|---|
| ideas in the inbox | **15** |
| shown on the Glass | **2** |
| **hidden** | **13** |
| — by `SCHEDULED` | **9** |
| — by SHIPPED / FIXED / HARVESTED (genuinely finished) | 3 |
| — by PARKED | 1 |

**AND THE CHARTER ALREADY SAYS HE IS RIGHT.** `.planning/wyclau/CHARTER.md`, the Chart's own
definition: *"Every idea gets a **visible** fate (shipped / scheduled / parked-with-reason) within a
day."* **Scheduled and parked are named as VISIBLE fates. The implementation uses them to hide.**
This is not a judgement call — the code contradicts the approved charter.

### THE FIX: THREE STATES, NOT TWO

The fate test asks a yes/no question ("is it dealt with?") of something with three real answers:

| state | words | on the Glass |
|---|---|---|
| **OPEN** | no fate declared | shown — needs a fate |
| **COMMITTED** | `SCHEDULED` | **shown, marked as scheduled** — it is work he is owed |
| **CLOSED** | SHIPPED · DONE · FIXED · CLOSED · HARVESTED · ROOT-CAUSED | hidden; it is finished |
| **PARKED** | `PARKED` | **shown, dimmed, with its reason** — the charter says a parked fate is visible, and a park he cannot see is a park he cannot overrule |

**Derived, never hand-kept (rule 9):** the three buckets are one list each, and the Glass renders
by bucket. **No word may appear in two buckets** — a gate can assert that, and red-proof it by
planting `SCHEDULED` in the closed list.

---

## 2 · WHY `BLOCKED ON WYATT` RENDERS NOTHING

**`glass.mjs:311-321` reads TABLE ROWS ONLY** — lines beginning with `|`. Everything else in the
section is skipped in silence.

**The section is currently 100% prose.** So Your Call renders **(0)**, and it is *literally correct*
while being *practically a lie* — which is exactly what he saw in his screenshot, sitting directly
under a note that said a blocked question existed.

**AND A REAL QUESTION WAS BLOCKED AND NOT FILED THERE.** The kit-boundary decision — and the one
factual question that settles it, *"is any repo other than pastrypirates actually running wyclau
today?"* — was written into `.planning/SPEC-KIT-BOUNDARY.md`. **A spec file. Which the Glass does
not render.** Same failure as `SCHEDULED`, third instance in one night: **correct content, filed
where the surface he reads cannot see it.**

### THE FIX: MAKE THE SECTION STRUCTURALLY UNABLE TO HIDE A QUESTION

1. **`BLOCKED ON WYATT` is table rows or nothing.** A gate fails the build when the section contains
   prose ending in `?`, or any paragraph that is not the section's own header note. **Silent
   skipping is the fault; the renderer must never be the only thing that knows.**
2. **A question is not ASKED until it is a table row.** Writing it in a spec, a commit message, an
   inbox entry or a reply does not count. **One place, or it did not happen.**
3. **The Glass must never print `(0)` on faith.** If the section has content the renderer could not
   parse, the card says so — *"1 paragraph here is not a question I can render"* — rather than
   reporting zero. **A parser that silently discards input is an instrument that cannot fail.**

---

## 3 · INJECTING IMMEDIATE WORK — the channel exists; three changes make it work

**DO NOT BUILD A NEW ONE.** `door/SKILL.md:81` already gives `INBOX.md` absolute priority over the
Chart, oldest-OPEN-first. A second queue would be the thing Principle 1 forbids, and this project has
already paid for building a capability a doc said had shipped.

**What is actually broken is three joins, not the mechanism:**

**(a) THE HARVEST DELIVERS TO THE WRONG FILE.** `GLASS-UPDATE-SESSION.md` step 2 must write his
Glass words to **`INBOX.md` as `status: OPEN`**, not to the Chart's idea inbox — or to both, with
INBOX.md as the one carrying the status. **His words typed into the Glass should be the highest
-priority thing in the system, and today they are the lowest.** This is the single highest-value
change in this document and it is one line of the runbook, which is **not vendored.**

**(b) OLDEST-FIRST IS NOT URGENCY.** With nine OPEN items, "oldest first" means a thing he wrote
sixty seconds ago waits behind eight older ones. **Add exactly one optional marker — `priority: NOW`
— and the Door's rule becomes: any `NOW` item first, then oldest OPEN.** One marker, not a number:
a scale invites nine competing scores, and a single flag forces the real question — *is this more
urgent than the thing already flagged?*

**(c) ONE SLOT, NOT A QUEUE.** At most one `NOW` may exist at a time. **A gate fails the build on a
second one.** An interrupt with a queue is just another backlog, which is the fault this whole
document is about. Setting `NOW` on a second item means clearing the first — deliberately, in the
same commit.

**AND IT MUST BE VISIBLE:** the Glass renders the `NOW` item as its own line at the top — *"NEXT:
T-076 — his four Glass asks"* — so he can see what he injected and whether it has been taken. **An
injection he cannot see is indistinguishable from one that was ignored**, which is precisely tonight.

> **⚠ ONE HONEST DEPENDENCY, STATED NOT BURIED:** (b) and (c) change `door/SKILL.md`, which is
> **vendored** — the subject of `SPEC-KIT-BOUNDARY.md` and blocked patch 4. **(a) is not vendored
> and can ship immediately.** Ship (a) first: it alone would have put his four Glass asks at the top
> of the Watch's list five hours before he had to ask why nothing had happened.

---

## THE ONE SENTENCE UNDER ALL THREE

**Three separate surfaces silently discard correct input** — a fate word that hides committed work, a
parser that ignores prose, and a harvest that delivers to the wrong inbox — **and not one of them
reports that it dropped anything.** Every fix above is the same shape: **make the discard loud, or
stop discarding.**
