# PREDICTION — T-220, the hook half CEO 180 left open

**Item:** `.planning/CHART.md:132` ⟨`T-220`⟩ — "LET A SEA TRIAL BE RUN AT A DEPTH SOMEBODY CHOOSES."
CEO Review 180 verdict PARTIAL, finding 1: `.claude/hooks/qa-gear-first.cjs` — the hook that stops
the FIRST edit to game code in a session and prints the QA-process reason — never mentions
`--gear=`, `--reason=` or `--explain`. `gear.mjs` was fixed to print an override note; the hook
that fires FIRST, before a session ever runs `gear.mjs`, still doesn't. CEO 180 tried to fix it
itself and reported the edit was BLOCKED for an unattended watch on this machine.

## What I expect, and why

I expect I CAN edit `.claude/hooks/qa-gear-first.cjs` from this watch, because
`.claude/settings.json`'s `permissions.allow` list contains a bare `"Edit"` and `"Write"` entry
with no path restriction, and the `deny` list only names `.env`-shaped read paths — nothing scopes
`.claude/hooks/`. CEO 180 reported the edit "attempted and BLOCKED" without quoting the refusal
text, so I cannot tell from the record whether that was a settings-level fence or something else
(a different watch's transient tool state, a stale cached permission set). I am about to test this
directly rather than repeat the claim.

If I CAN edit it: the fix is to append the same override note `gear.mjs` already prints (the
`--explain` / `--gear=COSMETIC --reason=` lines) into the hook's `reason` string, for the FULL and
PLUMBING branches (the only two this hook ever names), right after the "Which gear you are in..."
line and before "Full contract:". This closes CEO 180 finding 1 for real: the flag becomes
reachable from the FIRST place a session meets the gear decision, not just the second.

## What would prove me wrong

- If the Edit tool itself refuses the file (a permission prompt that cannot be answered, or a
  harness-level deny), that confirms CEO 180's finding and this remains a "session that can write
  there should finish it" item — I write that down plainly rather than forcing a workaround.
- If, after the edit, a fresh invocation of the hook (simulated via stdin) still does not surface
  `--gear=` in its FULL-gear output, my fix is wrong or incomplete.
- If the PLUMBING branch's reason text does not also carry the override (I must not fix only the
  branch I tested first).

## What happened immediately before this — rule per the widen-the-time-horizon check

CEO 180 ran 2026-09-03. Since then, three more watches have closed unrelated items (T-206/T-240,
the RULED-table triage) without touching this hook. Nothing suggests the permission fence, if real,
would have changed between then and now — same machine, same settings.json (verified no diff to
that file in `git log --oneline -- .claude/settings.json` since 2026-09-03, to be checked before
concluding).
