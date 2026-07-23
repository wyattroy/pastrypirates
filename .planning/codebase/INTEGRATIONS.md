# External Integrations

**Analysis Date:** 2026-07-22

## APIs & External Services

**Google Firebase:**
- Firebase Realtime Database (primary integration for multiplayer)
  - SDK: `firebase-database-compat.js` v12.15.0 (loaded from `https://www.gstatic.com/firebasejs/12.15.0/`)
  - Usage: Real-time game state synchronization, multiplayer rooms, chat, player presence
  - Auth: Public API key in `index.html` (lines 4543-4550), no authentication required for players

## Data Storage

**Databases:**
- Firebase Realtime Database (cloud-hosted)
  - Connection: `databaseURL: "https://pastry-pirates-default-rtdb.firebaseio.com"`
  - Client: Firebase SDK v12.15.0 compat (no ORM)
  - Structure: Paths for `rooms`, `feedback`, `gamelogs`, `presence`

**Local Storage:**
- Browser `localStorage` for host-game recovery
  - Stores: Random seed (`pp_seed`), decision log (`pp_dlog`), player ID (`pp_id`)
  - Purpose: Allows host to resume game after accidental reload (see `resumeHostGame()` in `index.html`)

**File Storage:**
- None - all static assets served from repo root and `/assets/` directories

**Caching:**
- Browser HTTP caching for static files
- No server-side caching layer

## Authentication & Identity

**Auth Provider:**
- Custom (no centralized auth system)
- Players provide a name in the UI; no login required
- Host identification via `localStorage` persistence
- Anonymous Firebase access (no Firebase Authentication enabled)

**Implementation:**
- Player session: Unique `myId` generated client-side, stored in `localStorage`
- Room access: 4-letter room code shared between players
- Host authority: Game engine runs on host's browser; only host requires recovery

## Monitoring & Observability

**Error Tracking:**
- None (no external error tracking service)

**Logs:**
- Client-side console logging only
- Game-end logs: Exported to Firebase at `gamelogs/{timestamp}` (JSON structure)
- Player feedback: Captured via in-game "Feedback" button to `feedback/{timestamp}`
- No structured logging framework

**User Analytics:**
- Firebase Analytics optional (can be disabled, not required per README)
- Simple presence counter at `presence/{id}` for estimating concurrent players

## CI/CD & Deployment

**Hosting:**
- GitHub Pages (primary): `https://playpastrypirates.com/` (via `CNAME`)
- Fallback: `https://wyattroy.github.io/pastrypirates/`
- Static hosting (no build or deploy pipeline required)

**CI Pipeline:**
- None detected (repo is static)

## Environment Configuration

**Required env vars:**
- None (configuration embedded in `index.html`)

**Firebase Configuration Variables:**
- `apiKey`: "AIzaSyAA8FbPiKYc82MpCkQD2ABYirnnCl09OuA"
- `authDomain`: "pastry-pirates.firebaseapp.com"
- `databaseURL`: "https://pastry-pirates-default-rtdb.firebaseio.com"
- `projectId`: "pastry-pirates"
- `storageBucket`: "pastry-pirates.firebasestorage.app"
- `messagingSenderId`: "546790679465"
- `appId`: "1:546790679465:web:cdb72aa39660fca844dab8"
- `measurementId`: "G-2KK6EZDZSP"

**Secrets location:**
- Firebase API key is public (by design, per Firebase docs)
- No other secrets required or managed
- Configuration is version-controlled in `index.html`

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

## Real-time Sync Architecture

**Database Structure** (Firebase Realtime Database):

```
/rooms/{roomCode}
  /chat/{messageId}
    /name: string
    /text: string (max 140 chars)
  /seats/{seatIndex}
    /name: string (max 18 chars)
    /ship: {...ship state}
    /coins: number
    /ingredients: [...ingredient names]
    /recipe: [...target ingredient names]
  /dlog/{eventIndex}
    /choice: player decision (for host recovery via replay)
  /clock, /flip, /event, /decision: live game state broadcast
  /host: host browser identification

/feedback/{timestamp}
  /text: string (max 2000 chars)
  (write-once, preserves end-of-game feedback)

/gamelogs/{timestamp}
  /...: full game move log (write-once, for post-game analysis)

/presence/{playerId}: true
  (auto-removed on disconnect, lightweight connection counter)
```

**Sync Pattern:**
- Host browser runs full game engine; broadcasts state to all players
- All players listen to `/rooms/{roomCode}` for real-time updates
- Decisions recorded to `dlog` for deterministic replay on host refresh
- Chat syncs to `rooms/{roomCode}/chat` with text/name validation rules

**Security Rules** (enforced by Firebase):
- `/rooms`: `.read: true, .write: true` (wide open, by design for no-login UX)
- `/feedback`, `/gamelogs`: write-once only (`!data.exists()`)
- `/chat/*/text`: max 140 chars validation
- `/seats/*/name`: max 18 chars validation
- `/presence`: `.read: true, .write: true` (auto-cleanup on disconnect)

## Known Limitations

**Firebase Spark Tier (Free):**
- 100 simultaneous connections max (soft warning at 80+)
- 1 GB storage, 10 GB download per month
- No redundancy or SLA
- Sufficient for family games; would need upgrade for high traffic

**No-Auth Model:**
- Anyone with database URL can read/write `/rooms` (accepted trade-off)
- No user accounts or persistence beyond a game session
- Upgrade path: Add Firebase Anonymous Auth + restrict rules to `auth != null`

---

*Integration audit: 2026-07-22*
