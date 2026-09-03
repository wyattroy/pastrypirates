# PREDICTION — the Lesson: three faults, and only one of them is the one he named

**Written 2026-09-03T16:30Z, before changing a line.**

## HIS WORDS

> *"also: the Lesson is two days old; it is formatted wrong, and whatever process is supposed to
> give me new ones does not exist in a formal way yet. build that, get CEO approval."*

## WHAT I EXPECT — the three causes, each measured before it is fixed

**(a) STALE.** `.planning/wyclau/LESSONS.md` holds **one entry**, dated 2026-09-01. Nothing writes
to it. The card already tells him so — *"No lesson yet today — the day's close owes one"* — which is
the page being honest about a process that does not exist.

**(b) FORMATTED WRONG, and it is two separate bugs in one line.** `glass.mjs:1304` renders the body
with `white-space:pre-line` inside `esc(...)`:
- `pre-line` **preserves the source file's newlines**, and that file is hard-wrapped at ~82 columns
  for a text editor. So his page breaks mid-sentence — *"…because from the outside a / hard-working
  session…"* — exactly as his screenshot shows.
- `esc(...)` escapes the markdown, so `*crash-only design*` reaches him as **literal asterisks**.

**(c) NO PROCESS.** The charter says the day's close owes a lesson; nothing takes one, validates it,
or puts it in the file. "The day's close" is a sentence in a runbook.

## THE FIX I EXPECT

- **Unwrap on render**: join hard-wrapped lines inside a paragraph, keep blank-line paragraph
  breaks, and let the browser wrap to his screen. Render `**strong**`, `*em*` and `` `code` `` after
  escaping, so it stays safe.
- **`scripts/wyclau/add_lesson.mjs`** — the formal way one is written: date, title, body; validated;
  appended newest-first.
- **Named in the Door's Close step**, or it is a capability nothing invokes — which has failed twice
  on this project already.
- **A gate** on the format and on the Door naming the command.

## WHAT WOULD PROVE ME WRONG

1. **If unwrapping destroys a lesson that WANTS line breaks** — a list, a table, a quoted command.
   **Check the existing lesson's shape before unwrapping**, and preserve lines that begin with a
   list marker or are indented, rather than flattening everything.
2. **If `esc()` is load-bearing against his own text.** He writes these; a lesson quoting `<div>`
   must not become markup. **Escape FIRST, then apply markdown to the escaped string** — never the
   other way round.
3. **If a gate on "a lesson exists today" is the wrong gate.** It would fail the build on any day
   nobody wrote one — punishing the build for a human cadence. **The gate should hold the FORMAT and
   the MACHINERY; the page's own "no lesson yet today" line is what holds the cadence.**

## THE TRAP

**He asked for three things and the middle one is the easiest to skip.** "Build the process" is the
sentence; "formatted wrong" is the thing he can see. **If I ship a writer and a gate and his page
still breaks mid-sentence, I have answered the instruction and not the complaint** — which is
exactly the fault CEO 172 and his second button message just established, hours ago, on this same
page.

**Second: I must not write him a lesson to make the card look fresh.** The card being honestly empty
is better than a filled one nobody learned anything from. The process is the deliverable; today's
lesson is his day's close, not mine to manufacture.
