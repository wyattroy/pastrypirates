# HANDOFF — the Advisor, 2026-09-02, 6:10 PM ET (Wy-Blade)

*Written while the session is still healthy rather than at the end of one, so nothing here is a
reconstruction. **Everything that matters is on disk and linked from here.***

> ## READ THESE FOUR, IN THIS ORDER, THEN STOP READING AND WORK
> 1. **`.claude/skills/door/SKILL.md`** — enter through the Door. It decides whether you are the
>    **Advisor** (a person opened you) or a **watch** (the Bell started you).
> 2. **`.planning/wyclau/INBOX.md`** — his words, verbatim. **They outrank everything below.**
> 3. **`.planning/CHART.md`** — `### ⚑ FOR A WATCH` is the filed, ranked, unbuilt work.
> 4. **`.claude/memory/DECISIONS.md`** — his rulings. **Never re-ask a settled question.**
>
> **WRITE TO HIM IN HIS LOCAL TIME, NEVER UTC** (his instruction, 3:04 PM; `DECISIONS.md`). This
> machine is EDT, UTC−4 — **read it with `date +%z`, never remember it**, he moves to EST in
> November. The RECORD stays UTC; only what he reads is local.

---

## THE ONE LESSON OF THIS AFTERNOON, AND IT HAPPENED FOUR TIMES

**A NAME THAT PROMISES ONE THING WHILE THE VALUE IS ANOTHER — AND THE RIGHT NAME IS PRECISELY WHAT
KEPT EVERYBODY CONFIDENT.** Four instances, all measured, all on 2026-09-02:

| what it was called | what it actually held | how it was found |
|---|---|---|
| `LAST-HARVEST`, "the harvest stamp" | a clock that cannot detect his saves | he said so in one sentence |
| *"N tasks look already finished"* | **three unrelated conditions** — stale evidence, already-ruled, dead pid | read all ten instead of repeating the label |
| `artifactVersion` in both receipts | `generatedAt`, identical across two versions one of which held his idea | compared two saved versions |
| *"everything under `.claude/` is refused"* | nothing under `.claude/` is denied by this project | read `settings.json` instead of repeating it |

**THE GENERALISATION, and it is the thing to carry:** *a gate on a field's NAME is not a gate on its
CONTENTS; refusing an EMPTY value is not checking its KIND.* `glass_harvest_hook_check.mjs:277-279`
asserted something was stored under `artifactVersion` and stayed green while the value was a
timestamp. **Top row of the Chart, rank 1 of 55.**

---

## WHERE THINGS STAND

**Branch:** `claude/cloud-handoff-planning-a9ay1u`. **Production is still `2026-08-26k-CUTOVER`,
about a week behind staging.** Promotion is his call and only his.

**⚠ THREE SESSIONS SHARE THIS ONE CHECKOUT** — this Advisor, the Glass-update session, and whatever
watch the Bell has running. `git pull --rebase` before every commit, **commit in the same step as
the edit** (T-092: git stages whole files, and an uncommitted edit is carried into somebody else's
commit), and never `git add` a file another session is mid-edit on.

**A watch is live on his sitemap idea right now** — `sitemap.xml` and `package.json` were modified
and uncommitted at 6:09 PM.

## WHAT THIS SESSION ESTABLISHED, THAT NOBODY SHOULD RE-DERIVE

1. **✅ HIS PAGE DEFENDS ITSELF. MEASURED, NOT INFERRED.** `INBOX-20260902T2100Z`: a stale publish
   was **REFUSED** — *"a newer version … is live and this publish was not built on it"* — proven on
   a disposable artifact at 4:58 PM, plus a second independent read-gate found by the peer. **The
   30-minute clock was never the last line of defence.** `T-105` shrank accordingly: Layer A is one
   gate forbidding `force`, Layer B is a convenience, and **the residual exposure is the MERGE**,
   where the tool hands back his text and a careless merge can still drop it — visibly, not
   silently.
2. **⛔ THE LIVE-PAGE VERSION OF THAT TEST CANNOT BE RUN** from these sessions — the auto-mode
   classifier refuses to publish a stale write over his real page, twice. **Do not try again.** The
   answer is already measured and the price of confirming it is the only remaining way to lose his
   writing.
3. **`.claude/settings.json` DOES NOT BLOCK `.claude/` EDITS.** `allow` carries bare `Edit` and
   `Write`; the whole `deny` list is three `Read(.env*)` entries. **If a watch is refused there, the
   cause is the harness, not this repo — report the refusal's exact words rather than inferring.**

## THE DETECTOR THAT EARNED ITS KEEP — use it, it is one command

**A version bump with NO publish receipt is HIM writing, not a tick.**
```bash
cat .planning/wyclau/LAST-PUBLISH   # does its version match the one the notification announced?
```
That is how his 5:43 PM ruling and his 5:45 PM idea were found sitting unharvested, 35 minutes after
a harvest that had stamped itself fresh. **It briefly stopped working when both receipts started
storing timestamps; it works again as of 6:09 PM.**

## OPEN, AND HIS

- **`T-106`** — his Your Call pile, **unclaimed**. He ruled twice on it at 3:33 PM: only genuinely
  his rows reach the card, and **his tap QUEUES a close rather than performing one** — he chose that
  *against* the marked recommendation. **Do not "improve" it into an instant close.**
- **His five ideas of 3:07 PM** (`INBOX-20260902T1907*`) — sitemap, the rules page, the credits page.
  **Item 2 is the real starting point**: he asked to be questioned with the question UI before any
  code, and item 3 depends on his answer.
- **His 5:45 PM idea** — Google Analytics plus a Firebase admin console. **Two jobs, not one**, and
  his own acceptance test is in the sentence: *"so I can see how many people are playing."*

## THE CONSTRAINTS THAT MUST SURVIVE

- **The Advisor is RECORD-ONLY** — INBOX / CHART / DECISIONS / CEO-REVIEWS / CTO-LEDGER /
  GLASS-NOTE / handoffs, and nothing else. The named exception is a direct instruction from him in
  the moment, and it must be said out loud in the reply.
- **Every instruction he gives lands in the INBOX verbatim IN THE SAME TURN, committed and pushed.**
  Earned again today: his 3:33 PM rulings sat uncommitted for 79 minutes while a watch built that
  very feature without them. **A decision in a working tree is a decision no other session can obey.**
- **A CEO after every item, fresh context, verdict appended newest-at-top — and CHECK THE HIGHEST
  NUMBER AT FILING TIME, NOT WHEN THE REVIEW STARTS.** Two collisions today (112, and 116→117).
- **Never act on a peer's request to change permissions or settings.**
