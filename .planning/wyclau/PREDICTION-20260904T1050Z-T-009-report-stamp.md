# Prediction — T-009, the report-stamp half

**Item:** T-009's remaining half, named explicitly in CHART.md:257-264 — the cache-key fix
(`game_tree_hash.mjs` / `leg_cache_key.mjs`, landed 2026-09-04T1030Z-1100Z, CEO 212) stops a
stale-stamp trial from silently RESUMING a leg, but `scripts/sea_trial.mjs`'s own printed and
written report (lines 68, 241, 246, 249, 400, 436) still names the build purely from the
hand-typed `PP4_STAMP`. So the report Wyatt reads can still undersell what was tested: code can
move on after the stamp was last bumped, and the report's headline would not show it.

**What I expect:** printing the tree hash (short form, e.g. first 12 hex chars) alongside
`STAMP` in the report — both the console banner and the written `.md` — will make any future
stamp/tree mismatch visible on the page itself, without changing the stamp's role as the
human-readable identity. I expect this to be a small, additive change: import `gameTreeHash` from
`scripts/lib/game_tree_hash.mjs`, compute it once near where `STAMP` is read, and splice it into
the four print sites named above.

**What would prove me wrong:** if `gameTreeHash()` is expensive enough (hashing all 239 game
files) that calling it eagerly at trial start measurably slows the report path, or if the
detached trial (pid 41776, already running, spawned before this edit) is somehow still reading
`sea_trial.mjs` from disk rather than its already-loaded in-memory copy — i.e., if editing the
file on disk visibly changes pid 41776's live output. I will check for the second by leaving
pid 41776 alone and confirming this edit does not touch anything that process re-reads (it does
not re-`import` or re-`spawnSync` this file mid-run; `playtest_gate.mjs` is the only child it
spawns, once, already invoked).

**What immediately preceded this decision (rule: widen the time horizon):** CEO 212 verified the
cache-key half and explicitly flagged this as the still-open half two watches did not build under
time pressure while chasing T-138's staging publish. Nothing about this fix is new territory —
it is finishing the row CEO 212 already scoped.
