# CTO ledger — what the marathon worker has actually done

**APPEND ONLY. Newest at the BOTTOM. Never edit an entry.**

The backlog is the MANDATE (what may be worked on); this is the STATE (what has happened to each
item). Two files, two jobs — a status column inside the backlog would mean the mandate and the
progress rot together.

**Nothing here is hand-counted.** `cto_supervise.mjs` derives every number from these entries.
Never hand-type a number that can be counted.

## The format — one line per event, four fields

```
<ISO8601>  <ITEM-ID>  <STATE>  <one line of what happened>
```

**STATE is one of:** `START` · `DONE` · `BLOCKED` · `PARKED` · `ABANDONED` · `REVERTED` · `HEARTBEAT`

- `START` — work began. Staleness is measured from the newest START with no matching close.
- `DONE` — finished AND verified AND a CEO verdict is on record. **All three, or it is not DONE.**
- `BLOCKED` — cannot proceed for a mechanical reason. Names the blocker.
- `PARKED` — needs Wyatt. The question goes in the questions file. **Taste never times out.**
- `ABANDONED` — started, then dropped. Must say why. An item that silently stops is the failure this
  state exists to make visible.
- `REVERTED` — a CEO verdict said NOT DONE and the commit was backed out. **This is a success of the
  process, not a failure of it.**
- `HEARTBEAT` — "I am alive and working on <ID>", written at least every 20 minutes during a work
  session. **Without this, a stuck worker and a busy worker look identical** — telling them apart is
  the whole reason the supervisor exists.

## Entries

2026-01-01T00:00:00Z  BOOTSTRAP  HEARTBEAT  ledger created; no CTO has run yet
