# The wording review tool

## 1. What this is for

Every word the game says to a player — the narration in the blue box, the buttons, the
prompts, the error messages, the end-of-voyage awards — is collected onto one page as a
card you can read and rewrite. You edit the wording on the cards; Claude applies your
edits to the game.

You can come back to it whenever you want to work on wording. It does not go stale
between visits any more: see section 6 for what stops that happening.

## 2. Starting a wording pass

Ask Claude to start the local server and hand you a link. You open the link. That's it —
you never type a command.

(If you ever want to do it yourself: `npm start`, then open
`http://localhost:8000/art-review/narration-audit.html`. The page has to be opened
through a server rather than by double-clicking the file, because it reads the game's
real code as it loads.)

What you'll see: the game's flow laid out left to right in stages — before the game, the
top of a round, a turn, sailing, docking, battle, the end of the voyage — with connecting
lines drawn between the boxes. Inside each box are the cards for the wording that appears
at that moment. At the top of the page there's a counter telling you how many cards
you've marked as reviewed.

**Each card shows you the wording the game actually says right now.** Not a copy of it
that somebody typed out — the real thing, read out of the game's own code every time the
page loads. Where a line reads differently depending on who's looking at it, you'll see
both: the neutral version, and the version addressed to the captain it's about.

## 3. Editing a card

Each card has:

- **Rec.** — a dropdown: keep, cut, merge, or rewrite. "Keep" means ship exactly what the
  card is showing you.
- **Notes (neutral)** — the main wording box. **Typing anything in here means "rewrite"**,
  and the dropdown switches to rewrite by itself so you don't have to remember. If you
  clear the box again, it switches back. If you deliberately chose cut or merge, typing
  won't override that.
- **Addressed ("you") version** — the same line as the captain it's about would read it.
  Most lines have two renderings and this is the second one.
- **A third box, on some cards only** — when a line names *two* captains (a battle, a
  trade), each of them reads it differently, so there are three versions in total. The
  box is labelled with the role — "addressed to the attacker", "addressed to the
  defender" — rather than a sample name, because the name tells you nothing about which
  version ships where.
- **Question for Claude** — anything that's a question rather than wording. **Nothing you
  type here ever becomes text in the game.** Use it freely.
- **Merge target** — only used when you pick "merge". Pick which line this one should fold
  into. A merge with no target isn't something Claude can act on.
- **I've reviewed this card** — tick it. The counter at the top of the page tracks it. An
  untouched card is *not* a decision, which is why the tick exists.

Some cards carry a badge. They're worth reading before you spend a rewrite on one:

- **never rendered** — this text can't reach a player at all (the button it belongs to is
  replaced by an icon, for instance). Don't rewrite it; there's nothing to change.
- **guarded** — a real safety net that a normal game won't reach. Worth keeping. The badge
  names the card where the wording a player *does* read lives, so you can redirect your
  rewrite there.
- **config-gated** — correct wording for a setting the game currently always has switched
  one way, so it never shows today. Worth keeping.

## 4. Handing your work back

Press **Export** at the top of the page. A file downloads. Tell Claude where it landed
and he'll put it in the repo and apply it.

Your marks are also stored in the repo itself, not only in this browser. That means a new
laptop, a cleared browser, or a different browser all rebuild your full review — nothing
is trapped in one profile any more.

## 5. The commands

You don't run these. They're listed so you know what exists, and so Claude and you are
talking about the same things.

| Command | What it does |
|---|---|
| `npm run audit:extract` | Re-reads the game's code and rebuilds the list of every place the game says something. Run after the game's code changes. Under the bonnet: `scripts/extract_narration_lines.js`. |
| `npm run audit:check` | Checks the tool itself is healthy — every card resolves and renders, no card shows placeholder text, and all 209 of your reviewed decisions are still accounted for. Under the bonnet: `scripts/narration_audit_check.js`. |
| `npm test` | Runs everything, including both of the above. |

**Two more commands are planned and not built yet:**
`scripts/narration_copy_check.js` (checks the game's wording still matches what you
approved) and `scripts/apply_narration_copy.js` (applies your approved wording by command,
showing you a preview first and writing nothing until told to). Until those exist, Claude
applies your approved wording by hand and shows you the before/after. See
`.planning/quick/20260729-narration-audit-tool-hardening/SUMMARY.md` for where that stands.

## 6. What the safety nets do for you

These are the reasons this tool stopped decaying between visits:

- **A card can no longer show wording the game doesn't say.** Card text used to be typed
  out by hand into the page. It went out of date, and by the time anyone looked, 20 of the
  26 hand-written entries were wording the game had stopped using. That layer is deleted —
  every card now reads the game's real code.
- **The page can no longer go blank.** It used to point at lines of code by number, and
  when the code moved, the very first thing it looked up failed and took the whole page
  down with it. Every place the game says something now carries its own permanent name in
  the code, so moving code around can't break the link. And if one card ever does fail,
  you get one card saying so — never a blank screen.
- **Your decisions can't quietly go missing.** Every one of your 209 reviewed decisions is
  checked on every test run: how many there are, that none has been dropped, and that
  nothing marked "keep" has quietly reverted to undecided. Six of them were retired
  because the line they were about no longer exists — and in all six cases you were the
  one who said to merge it. The tool refuses to retire anything you didn't say to merge.
- **The tool is checked without a browser.** Everything above runs as part of `npm test`.
  The old problem wasn't that things broke — it was that nothing noticed for a whole phase.
- **A greyed-out button explains itself in the state where it's greyed.** Found in the
  July 29th playtest: the greyed Trade button was showing Attack's helper text instead of
  its own reason. Now checked automatically.
- **A message meant for spectators reaches spectators.** Also found in that playtest: the
  other players were receiving your prompts word for word instead of "…is deciding".
  Also now checked automatically.

## 7. If a check goes red

The failure names the exact card. In order:

1. **Run `npm run audit:extract`, then the check again.** Most of the time the game's code
   moved and the list just needs rebuilding.
2. **If it still fails, look at what the message names.** If it says a place the game says
   something has no name, a `// @copy <name>` comment was deleted from the game's code —
   put it back on the line above.
3. **If a card says it couldn't be built**, the card itself tells you the same two steps in
   plain language. The rest of the page still works while you sort it out.

You never have to guess which card is affected — every failure names it.
