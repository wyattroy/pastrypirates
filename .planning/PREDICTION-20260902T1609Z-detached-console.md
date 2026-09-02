# PREDICTION — written BEFORE the first measurement, `INBOX-20260901T1440Z`

*Watch 2026-09-02T16:09Z, Wy-Blade. Rule 6's working form: write down what you expect and why, name
what would prove you wrong, then measure, then say plainly which parts were wrong.*

**THE ITEM.** Wyatt saw a black `C:\Program Files\nodejs\node.exe` console appear on his screen
mid-hour. It is the detached sea trial. Closing it kills an 85-minute run silently.

**THE INBOX'S STATED MECHANISM, which I am treating as a CLAIM and not as evidence:**
> "Node ignores `windowsHide` for `detached: true` console children on Windows, so
> start_trial_detached.mjs's trial gets its own visible console."

Nobody measured that. `start_trial_detached.mjs:66-71` does pass both `detached: true` and
`windowsHide: true`, so the claim is at least plausible from the source.

---

## WHAT I EXPECT, AND WHY

**P1 — the minimal case will show NO console window, and the stated mechanism will turn out to be
wrong.** Reading the Win32 contract rather than the Node docs: libuv turns `detached` into
`DETACHED_PROCESS | CREATE_NEW_PROCESS_GROUP`, and `DETACHED_PROCESS` means *the child gets no
console at all* — it neither inherits the parent's nor is given a new one. `windowsHide` becoming a
no-op there is true and also **irrelevant**, because `DETACHED_PROCESS` has already produced the
outcome `windowsHide` was asking for. So a bare `node -e "…"` spawned exactly the way the wrapper
spawns the trial should own **no window**.

**P2 — if P1 holds, the window he saw belongs to a DESCENDANT, not to the trial.** This is rule 27:
what happened immediately before? A process with no console that then spawns a console application
causes Windows to allocate a **fresh console for that child** — and a fresh console is a visible
black window. `sea_trial.mjs` spawns children (Node helpers, a static server, browsers). Under a
console-less parent each of those is a candidate. The title he read — the `node.exe` path — fits a
Node child at least as well as it fits the trial itself.

**P3 — whatever the source, the fix is a spawn flag and not a wrapper rewrite**, so this stays a
small item.

## WHAT WOULD PROVE ME WRONG — named now, in kilobytes not adjectives

- **P1 is wrong if** the minimal detached child reports a non-zero `MainWindowHandle`, or a console
  window is visibly present for it. Then the INBOX's mechanism stands as written and the fix belongs
  at `start_trial_detached.mjs:66-71`.
- **P2 is wrong if** P1 holds AND a real (or faithfully simulated) trial launch also produces no
  window on this machine. Then the sighting is unexplained by this line of reasoning and I must say
  so rather than ship a fix for a window nobody has reproduced. **A fix for an unreproduced window
  is not a fix; it is a guess with a commit hash.**
- **The instrument itself must be red-proofed:** the probe must report a window for a case *known*
  to have one (a child spawned with `detached:true, windowsHide:false`, which gets
  `CREATE_NEW_PROCESS_GROUP` without hiding). If the probe cannot see THAT window, it cannot see any,
  and its "no window" verdict is worthless — the exact shape of the `pgrep` all-clear that hid 183
  browsers this morning.

## THE HONEST RISK IN THIS ITEM

The bug is **intermittent by nature** — it appears only when a trial is started, which takes 85
minutes to finish and which no watch should start casually. So the temptation is to reason about it
instead of reproducing it. **The measurement must be of a real spawn, not of my reading of libuv.**
