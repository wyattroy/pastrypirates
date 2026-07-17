# 🏴‍☠️ Pastry Pirates Online — Setup

`index.html` lets 2–4 people play Pastry Pirates together over the internet, each in
their own browser, anywhere. Empty seats are filled by bots. It syncs the game through a
free **Firebase Realtime Database**. You only have to do this setup **once**, and only the
person creating the games needs a Firebase project — everyone else just opens the page.

The whole thing runs on Firebase's free **Spark** plan. A family game uses a tiny fraction
of the free limits.

---

## Step 1 — Create a Firebase project

1. Go to <https://console.firebase.google.com/> and sign in with a Google account.
2. Click **Add project** (or **Create a project**). Give it any name, e.g. `pastry-pirates`.
3. Google Analytics is optional — you can turn it off. Click **Create project**.

## Step 2 — Create the Realtime Database

1. In the left sidebar, open **Build → Realtime Database**.
   (Make sure it's *Realtime Database*, **not** *Firestore*.)
2. Click **Create Database**.
3. Pick a location (any is fine; the closest region is nicest).
4. When asked about security rules, choose **Start in test mode**, then **Enable**.
5. You'll land on the database view. Copy the URL shown at the top — it looks like
   `https://pastry-pirates-default-rtdb.firebaseio.com/`. You'll need it in Step 4.

## Step 3 — Register a web app to get your config

1. Click the **⚙️ gear → Project settings**.
2. Scroll to **Your apps** and click the **web** icon `</>`.
3. Give it a nickname (e.g. `web`) and click **Register app**. You can skip Hosting.
4. Firebase shows a `firebaseConfig` object. Keep this tab open — you'll copy from it next.

It looks like this:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "pastry-pirates.firebaseapp.com",
  databaseURL: "https://pastry-pirates-default-rtdb.firebaseio.com",
  projectId: "pastry-pirates",
  appId: "1:1234567890:web:abc123"
};
```

## Step 4 — Paste your config into `index.html`

1. Open `index.html` in any text editor.
2. Near the bottom of the `<script>`, find the block that starts with
   `▼▼▼ PASTE YOUR OWN FIREBASE PROJECT CONFIG HERE`.
3. Replace the placeholder `firebaseConfig` with the one from your Firebase tab.
   **The `databaseURL` line is the important one** — the app won't start until it no longer
   says `PASTE_YOUR...`.
4. Save the file.

> If `databaseURL` isn't shown in your config, copy the URL you noted in Step 2 and add it
> as the `databaseURL` line yourself.

## Step 5 — Set the database rules

Test mode works for ~30 days, then locks. To keep the game working, set simple rules:

1. In **Realtime Database → Rules**, replace everything with:

```json
{
  "rules": {
    "rooms": {
      ".read": true,
      ".write": true
    },
    "feedback": {
      ".read": true,
      ".write": true
    },
    "gamelogs": {
      ".read": true,
      ".write": true
    }
  }
}
```

2. Click **Publish**.

`feedback` and `gamelogs` are where the in-game feedback box and end-of-game move logs are
saved (see below) — they're separate from `rooms` because room data gets wiped when a new
game starts, but you want to keep feedback and logs around to read later.

**What this means:** anyone who knows your database URL can read/write the `rooms` data.
That's fine for casual games with friends — there's nothing sensitive in there, just game
state — but it is public. Don't reuse this project for anything private. (If you later want
it locked down, the usual upgrade is to turn on Firebase **Anonymous Authentication** and
change the rules to require `auth != null`.)

### Reading playtester data back

Every finished game (solo or multiplayer) writes its full move log to `gamelogs/{timestamp}`,
and anyone who uses the in-game **💬 Feedback** button writes to `feedback/{timestamp}`. To
read these later: **Realtime Database → Data** tab in the Firebase console, then expand the
`gamelogs` or `feedback` node. Each entry is plain JSON — click the `⋮` menu on a node to
export it if you want to pull everything into a spreadsheet or script at once.

---

## Playing

1. **Share the file.** Everyone needs the same `index.html` (with your config in it). The
   easiest ways:
   - **Simplest:** send everyone the `index.html` file; each person double-clicks it to
     open it in their browser (works straight from `file://`).
   - **Nicer:** drop `index.html` on any static host — GitHub Pages, Netlify Drop
     (<https://app.netlify.com/drop>), etc. — and share the link. (If you host it, make sure
     your Firebase project's *Authentication → Settings → Authorized domains* isn't blocking
     it — with these open, no-auth rules it won't, but it's the place to look if syncing fails.)
2. **Create a game.** One person types their name, picks the number of captains (2–4), and
   clicks **Create a new game**. They get a 4-letter **room code**.
3. **Join.** Everyone else opens the page, types their name, enters the room code, and clicks
   **Join**. They claim a seat as they arrive.
4. **Bots fill the rest.** Any seat nobody takes is played by a bot — the host can pick each
   bot's style (pirate / trader / balanced / rusher) in the lobby.
5. **Start.** The host clicks **Start the voyage!** Everyone sees the same board. When it's
   your turn, your choices appear in the yellow panel under the board; the wind, dice flips,
   battles, and trades all sync to everyone in real time.

## Good to know / limits

- **The host's browser runs the game.** All the rules and bot logic execute on the
  creator's device and are broadcast to everyone else. If a *non-host* player refreshes or
  drops, they can reopen the page and rejoin the same room automatically. **The host can now
  safely refresh, too:** if the host accidentally reloads mid-game, reopening the page silently
  rebuilds the exact game state (by replaying the recorded moves) and keeps driving the voyage —
  no restart needed. This works as long as the host comes back in the same browser (the recovery
  keys off local storage). A host who fully closes the browser and doesn't return still ends the
  game, since nobody is left to run it.
- **One game per room code.** To play again, the host creates a new game (new code).
- **Free-tier headroom is huge** for this use: the Spark plan gives 100 simultaneous
  connections and 1 GB stored / 10 GB downloaded per month. A full 4-player game syncs a few
  hundred tiny messages — you'd need thousands of games a month to notice.
- **Tidy up (optional).** Old rooms just sit in the database harmless and tiny. If you ever
  want to clear them, open Realtime Database in the console and delete the `rooms` node.

---

## Security & hosting notes (what's set up, and why)

This project is served from **GitHub Pages** at `https://wyattroy.github.io/pastrypirates/`,
and the repo is public. Here's the security posture and the reasoning, so future-you isn't
surprised.

### The Firebase config in `index.html` is public — and that's fine

The `firebaseConfig` block (including `apiKey`) is committed to the public repo. GitHub's
secret scanner flags it as a "Google API key," but a Firebase **web** API key is *designed*
to be public — it identifies the project, it is not a password, and it does not by itself
grant access to any data. Google's own docs say these keys don't need to be treated as
secrets. So the GitHub "secrets detected" alert for this key is a known false alarm and can
be dismissed. (Docs: <https://firebase.google.com/docs/projects/api-keys>.)

The things that *would* be real secrets — and must **never** be committed — are a Firebase
**Admin SDK service-account JSON** or a legacy **FCM server key**. This project uses neither.

### What actually protects the data: the database rules

Data access is enforced by **Realtime Database Security Rules**, not by the API key. Current
rules are wide open on `/rooms` (`.read`/`.write: true`). That's an intentional trade-off:

- **Pro:** zero friction — no login, anyone with a room code can play.
- **Con:** anyone who discovers the database URL can read/write the `rooms` data.

For this game that's acceptable — the only thing stored is transient game state (room codes,
ship positions, coins, event log), nothing personal or sensitive. Old rooms can be deleted
anytime. If this ever needs locking down, the standard upgrade is to enable **Firebase
App Check** and/or switch to auth-based rules (`auth != null`) with Anonymous Authentication.

### API key hardening that was applied (optional, done)

In **Google Cloud Console → APIs & Services → Credentials**, the auto-created *"Browser key
(auto created by Firebase)"* was restricted:

- **Application restrictions → Websites**, allowing:
  - `wyattroy.github.io/*` (the live GitHub Pages site)
  - `localhost/*` (local testing over a dev server)
- **API restrictions:** left at the standard auto-populated Firebase set (all enabled project
  APIs). Not narrowed further — narrowing this by hand is easy to get wrong and can silently
  break Firebase.

This stops the key from being reused by *other* websites for *other* Google APIs. It does
**not** replace the database rules — it's defense-in-depth, not the main guard.

Two consequences to remember:

- The key is now bound to `wyattroy.github.io` / `localhost`. Opening `index.html` directly
  from disk (`file://`) sends no referrer, so Firebase Auth/Installations calls may warn — but
  Realtime Database traffic doesn't use this key, so the **game still works**. For the cleanest
  experience, play from the GitHub Pages URL.
- If the GitHub Pages domain or repo name ever changes, update the **Websites** allow-list to
  match, or syncing from the new URL will be blocked.

---

## How host-refresh recovery works (and the one rule to keep it working)

The host's browser *is* the game engine — the whole game loop and every player's state live
in that one tab's memory and are broadcast to everyone else. So an accidental host refresh used
to wipe the game for the entire table. It no longer does, and here's the mechanism, because it
imposes a rule future edits must respect.

### The idea: deterministic replay

The engine is driven entirely by a **seeded pseudo-random generator** (`mulberry32`), so a game
is a pure function of its `seed` plus the sequence of **human decisions**. Bots, dice, wind,
battles — all of it — replays identically from the same seed. (The seed itself is random per
game, so coin tosses are just as unpredictable to players as ever. "Deterministic" here means
*reproducible given the seed*, not *predictable*.)

So instead of trying to serialize the live game object (messy — it holds `Set`s, live
cross-references, and the RNG's internal position) and figuring out where in a deep `await`
stack to resume, we do something cheaper:

1. **Record** every human decision to Firebase as it's made — just a tiny ordered log of
   indices/cells under `rooms/<code>/dlog`.
2. **On an accidental host reload**, `resumeHostGame()` re-runs the *real* game loop in
   `replaying=true` mode: rendering, delays, and broadcasts are suppressed, and each human
   prompt is answered instantly from the recorded log. This silently rebuilds the exact state.
3. When the log runs out (`endReplay()`), it hands back to live play at the precise spot the
   reload interrupted, pushing only the events the crew hasn't already seen.

Because it re-runs the actual loop, it rebuilds even state that lives *only* in local
variables — e.g. a battle's round-by-round score inside `asyncBattle`'s closure — for free.

This keys off `localStorage`, so recovery works when the host comes back in the **same
browser**. It does not migrate the host to a different device or to another player.

### ⚠️ The rule: every human decision must flow through an instrumented chokepoint

Replay only works because *all* human input is recorded at a few shared functions —
currently **`ask()`**, **`pickCell()`**, and **`battleAsk()`**. Each one records the choice
when live and returns the recorded choice when replaying.

**If you add a new way to collect a player's choice, it must route through one of those
functions — or be instrumented the same way (record on the way out, short-circuit to the log
during replay).** A decision collected on a new, un-instrumented path won't be recorded, so on
replay there's nothing to answer it and the rebuild will hang at that prompt.

This is exactly what bit the "battle coins on screen" change: it forked a second decision
function (`battleAsk`) off of `ask` to render buttons inside the battle scoreboard, which
quietly moved battle flips onto a path the recorder didn't cover until `battleAsk` was
instrumented too.

If input handling ever grows enough paths that this rule feels fragile, the sturdier (but
heavier) alternative is to snapshot the full game state as JSON after each action and rebuild
from that — it doesn't care *how* input is collected, only *what state results*. For now the
chokepoint approach is far less code.

Happy plundering. 🧁
