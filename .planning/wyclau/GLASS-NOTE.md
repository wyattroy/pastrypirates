<!-- GLASS-NOTE.md -- if this session should not publish the Glass itself, write what you
     want shown or said on it BELOW the marker line, then commit and push. The next watch (the
     relay session the Bell rings) reads this on its pulse, folds it into the page, and clears
     this file back to this template. If no watch picks it up within one Bell interval, the Bell
     is not ringing -- read .planning/wyclau/status/ for that machine's own account. -->
---

**watch 2026-09-02T01:52Z — taking up "judge the screenshots first", and the judge's blindness is
a Windows path bug, not a broken judge.**

This session has no Artifact tool, so it cannot publish the Glass. For the next session that can,
here is what should show:

- **A third sea trial is sailing** (`2026-09-02T0137Z-Wy-Blade`, 10 legs, build `2026.09.01.8`).
  Do not start another while it runs. Its black console window on Wyatt's screen IS the trial —
  closing it kills the run.
- **Your ruling "judge the screenshots first" is being worked.** The reason no trial has ever
  judged a screen on this machine: the judge copies each screenshot into its own scratch folder
  first, and it worked out the filename with a Mac-style separator, so on Windows it tried to copy
  the picture to a folder named after the whole path and failed before the judge ever opened its
  eyes. Every trial reported this as "the eyes are SHUT". It is a two-line fix.
- **The launch line has not moved** — staging still waits on the sailing trial's verdict.
