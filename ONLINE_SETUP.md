# 🏴‍☠️ Pastry Pirates Online — Setup

`online.html` lets 2–4 people play Pastry Pirates together over the internet, each in
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

## Step 4 — Paste your config into `online.html`

1. Open `online.html` in any text editor.
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
    }
  }
}
```

2. Click **Publish**.

**What this means:** anyone who knows your database URL can read/write the `rooms` data.
That's fine for casual games with friends — there's nothing sensitive in there, just game
state — but it is public. Don't reuse this project for anything private. (If you later want
it locked down, the usual upgrade is to turn on Firebase **Anonymous Authentication** and
change the rules to require `auth != null`.)

---

## Playing

1. **Share the file.** Everyone needs the same `online.html` (with your config in it). The
   easiest ways:
   - **Simplest:** send everyone the `online.html` file; each person double-clicks it to
     open it in their browser (works straight from `file://`).
   - **Nicer:** drop `online.html` on any static host — GitHub Pages, Netlify Drop
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
  creator's device and are broadcast to everyone else. So the **host should stay on the page**
  until the game ends. If a *non-host* player refreshes or drops, they can reopen the page and
  rejoin the same room automatically. If the **host** closes the tab mid-game, that game can't
  resume — just start a new one.
- **One game per room code.** To play again, the host creates a new game (new code).
- **Free-tier headroom is huge** for this use: the Spark plan gives 100 simultaneous
  connections and 1 GB stored / 10 GB downloaded per month. A full 4-player game syncs a few
  hundred tiny messages — you'd need thousands of games a month to notice.
- **Tidy up (optional).** Old rooms just sit in the database harmless and tiny. If you ever
  want to clear them, open Realtime Database in the console and delete the `rooms` node.

Happy plundering. 🧁
