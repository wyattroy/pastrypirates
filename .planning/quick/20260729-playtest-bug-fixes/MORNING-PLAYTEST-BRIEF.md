# Morning playtest brief — 30 July

## 1. While you were asleep

Six of the twelve things you found yesterday are fixed. The one that mattered most: **a bot could take
coins you did not have.** When Flaky Jack countered your trade offer, the game was counting the coins
you had already put on the table twice — once as part of your offer, and again as spare change you
could still be asked for. That is how you ended up at minus one. Now a bot can only ask for coins you
genuinely still have, and if you have none spare it does not make the offer at all.

The other five are wording and clarity: your lobby row printed your name twice, the ingredient pictures
sat in the wrong place, two of the docking lines said "it" without ever saying what "it" was, the buy
option silently disappeared when you could not afford it, and the last line in the blue box faded away
to nothing instead of staying put.

I also wrote up a separate answer to the question your coin bug raised — whether anything else can push
a purse below zero. Short version further down: yes, eight more places can, all for the same single
reason, and I have not touched any of them because how to handle it is your call.

## 2. Open this and play

**http://localhost:8911**

The first time you open it, force a full refresh — hold Shift and click the reload button, or press
Command-Shift-R. An ordinary reload is not enough, because the browser quietly keeps its own copies of
the game's code, and two of yesterday's "bugs" turned out to be nothing but that.

If the page does not load at all, the small local web server that serves the game is not running — start
it the same way you did yesterday and the address above will work.

## 3. What to look at, in order

**1. The lobby, before you start.**
Set up a room and look at the seat list. Each seat should show its captain's name exactly **once**. Your
own row should read your name, then a dash, then the word "you" — not "ye". Another person's seat should
just be their name, nothing after it. An empty seat should read its captain name, a dash, and the robot.
Yesterday yours read "Wyatt — Wyatt — ye"; it should now read "Wyatt — you".

**2. The dock button, and the flip that follows.**
Sail next to an island and look at the button. The little ingredient picture should sit **directly in
front of the island's name** — "Dock at 🥛 Full Cream Folly", not "🥛 Dock at Full Cream Folly". The
anchor stays out front, because the anchor is about the action, not the island. Then click it: the flip
prompt was already right yesterday and should look exactly as it did.

**3. Dock, and read the line in the blue box.**
Whatever the flip gives you, the ingredient picture should now sit **directly in front of the
ingredient's own name** — "a pod of 🍫 Luscious Cacao Beans", not "🍫 a pod of Luscious Cacao Beans".
And if you flip tails, your own line should now tell you which island you were at and which goods you
were looking at. Yesterday it read "ye flip TAILS, but buy it anyway for 3 coins" and "it" meant
nothing. It should now read like "ye dock at Full Cream Folly for some jugs of 🥛 Fresh Milk and flip
TAILS, but buy it anyway for 3 coins".

**4. Dock on tails with fewer than three coins.**
This is the one that needs a bit of setup — get yourself down to one or two coins, then dock somewhere
that still has stock and flip tails. Yesterday nothing appeared at all and the turn just handed you the
coins. Now you should get the same choice everyone else gets, with the buy option greyed out and a short
line underneath telling you why. It costs you one extra click, and that is deliberate: the point is that
you learn buying was possible.

**5. Trade with a bot while you are nearly broke.**
Offer a bot something with a coin or two attached, while holding barely more than you are offering. When
the bot counters and you cannot cover it, it should now simply not make the counter — it walks away and
you get the refusal line instead. Your coins can no longer go below zero on this path.

**6. Watch a bot's turn, or someone else's.**
The **last line** in the blue box should now stay on screen until the next line arrives. No slow fade to
an empty box. That was your call yesterday — players should be able to sit with each other's turns — and
the box should now never be empty. The pause between two lines that follow each other is unchanged; I
only stopped the very last one from disappearing.

## 4. Tell me yes or no

These are genuinely open. Everything else I either had your word on or had a written decision to follow.

1. **The way the last line behaves now.** It sits there until something replaces it, with no gentle fade
   in between — the new line just takes its place. Is that what you pictured, or did you want the old
   soft fade kept for the swap itself?

2. **A player who joins without typing a name.** They used to show up blank in a few places, not just in
   the lobby. They now fall back to their captain name everywhere. Fine?

3. **The four docking lines, read as copy.** Read them out loud once. They are your own words shifted
   from "Claude docks at…" into "ye dock at…" — I invented no new phrasing — but you have not read them
   in this form before.

4. **One line I restored further than you asked.** You pointed at the two tails lines. I also restored
   the empty-island line so it names the island again. My reasoning: fixing two of the three would have
   swapped one consistent problem for a new inconsistency. But it is one line more than you asked for,
   so say the word and I will put it back.

5. **The "ten percent less time on screen" requirement.** It no longer describes what the game does,
   because a last line never starts fading at all now. It needs its wording changed rather than
   re-tested. I did not touch the requirements file — that is yours. Want me to reword it?

6. **The coin question — this is the big one.** Eight more places can still push a purse below zero, and
   they all fail for the same single reason: the game checks whether you can afford something when it
   draws the buttons, then takes the coins after you click, and the twenty-second slow-play penalty can
   take a coin in between. My recommendation is one small shared check, used at all eight places, that
   re-confirms you can still afford it at the moment it charges you. I have not built it. The full
   write-up is in the file next to this one called COIN-AUDIT.md if you want the detail.

7. **Two lines changed after you had already approved them.** The dock button and the tails buy prompt
   both had their ingredient picture moved. Not one word changed — only where the picture sits. The
   review tool will show them to you again next time you sit down with it, so you can confirm them
   properly then.

## 5. Still open on purpose

- **The end-of-voyage box.** It no longer goes blank at the end, which is a side benefit of the last-line
  fix. But it still sits there on screen instead of tidying itself away when the voyage is over. That is
  a separate known item and it was never in scope for last night.
- **The eight coin paths above.** Found, written up, deliberately not touched.
- **One thing I want a second pair of eyes on.** The battle powder charge does not double-check that the
  attacker can afford it, the way the rest of the game's engine does for itself. Nothing can reach it
  today, so it is not a live bug — but it is the one place I was not confident enough to change on my own
  overnight.
- **Two battle lines of yours that are still not applied.** These are the ones from yesterday's count of
  four. They need a change to how battle text is sent to each player before your wording can go in, so
  they stay deferred rather than half-done.

## 6. Already fixed earlier today

- Your rewritten opening banner, and the Lookout wording with the possessive dropped — both were already
  in the game; your tab was showing you old code.
- The fishing button's number range now uses the proper dash, so it matches the buttons around it.
- **The confusing prompt of yours that appeared on other players' screens.** This was the best find of
  the playtest and it could only have been found by playing. Your own prompts were being sent to
  everybody. Other players now see "Wyatt is deciding…" instead, which is also what was making their
  blue box look empty — it was your prompt, faded to invisible. One bug, not two.
- **The greyed-out Trade button that showed the wrong explanation.** It was displaying the Attack
  button's tip while Attack was working fine. Both reasons can now show at once, and a greyed button's
  own explanation comes first.

One last note, and it is the only slightly awkward thing in here. There is a checking tool that was
supposed to exist by the time I started — the one whose whole job is to tell you "this line changed
after you approved it". It never got built yesterday. So item 7 above is me telling you by hand what
that tool would have told you automatically. I kept a list of every shipped line I touched, and item 7
is the whole list.
