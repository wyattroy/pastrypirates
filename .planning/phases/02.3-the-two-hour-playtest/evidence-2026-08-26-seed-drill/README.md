# Evidence — the seeded-defect drill, 2026-08-26

**1.7 MB kept out of 7.7 GB.** Everything else was regenerable probe output and was deleted; this is
the part that BACKS A CLAIM somebody may want to check.

## Why these files exist at all

The drill's final run reported **CAUGHT 4/4**. The handoff
([`HANDOFF-2026-08-26-CUTOVER.md`](../../HANDOFF-2026-08-26-CUTOVER.md) §13) reports something
different — **2 stand, 2 not established** — and these files are why. Without them that correction
is one session's word against a summary line.

**They were also about to be destroyed by the drill itself:** `sail()` wipes each output directory
before reusing it, so the next run would have deleted exactly the screenshots the argument rests on.
Preserving them meant moving them out of the wipe path.

## The three screenshots — all `crew-phone`, guest seat, a tap-to-sail prompt

| file | what it shows |
|---|---|
| `crew-baseline-guest-006-settled.png` | **nothing seeded.** Every sail square on screen and reachable. §0 did NOT occur in this run |
| `T-12-seeded-guest-006-settled.png` | seed: *homepage drawn over a live voyage*. A bright sail square at the foot of the board is **clipped behind the captains panel**, and **there is no homepage anywhere on screen** |
| `T-02-seeded-guest-006-settled.png` | seed: *guest has no stay square*. Sail squares **cut off at the left edge of the phone** — nothing to do with a missing STAY control |

**The point of the pair-plus-baseline:** T-12 and T-02 were scored CAUGHT because their runs produced
failures the baseline lacked. The pictures show those failures are **§0 — sail squares a guest cannot
tap — surfacing intermittently**, not the seeded defects. A real intermittent bug is
indistinguishable from a seeded one when you subtract a single baseline.

## `reports/` — 12 × `report.json`, verbatim from `playtest_gate.mjs`

Named `<outdir>__<run>.json`. The two that carry the null test:

- `seed-drill-shots__baseline-crew-phone.json` vs `seed-drill-shots__null-crew-phone.json`
  → **3 signatures differ between two runs with NOTHING seeded.** That is the crew noise floor.
- `seed-drill-shots__baseline-solo-phone.json` vs `seed-drill-shots__null-solo-phone.json`
  → **identical.** Solo's floor is 0, which is why T-16 and T-30's catches stand.

`seed-drill-shots__baseline.json` is the *first* (pre-per-leg) baseline — the one whose verdict was
`leg error: solo card not clickable`, i.e. the run that proved the browser fleet was pointed at an
empty directory (§10).

## Re-checking it without re-sailing

`--reuse-baselines` reads `seed-drill-shots/baseline-<leg>/report.json`. To re-score from this
bundle, copy the two baseline files back into that shape first:

```bash
mkdir -p seed-drill-shots/baseline-crew-phone seed-drill-shots/baseline-solo-phone
cp reports/seed-drill-shots__baseline-crew-phone.json seed-drill-shots/baseline-crew-phone/report.json
cp reports/seed-drill-shots__baseline-solo-phone.json seed-drill-shots/baseline-solo-phone/report.json
```

**Do not treat a reused baseline as current once game code has changed** — the drill's own comment
says so, and it is the difference between re-scoring a finished run and inventing a fresh verdict.
