# Wyatt's playtest notes — RECOVERED 2026-09-18

He closed the browser tab and asked: *"i had written a LOT of notes in the playtest browser tab but
then i clsoed it -- are those lost?"* They were not: the checklist writes every keystroke to the
page's shared store as well as to the browser, so closing the tab loses nothing. This is that store,
read back and written down where a tab cannot take it.

**62 verdicts, 19 written notes, 3 playtest ticks, 3,853 characters of his own words.**

---

### `cf-404` — PROBLEM

use the standard background that's on all the other non-game pages (blurry board

### `i10-bots` — LOOKS RIGHT

what does "dragging the scrubber" in your description mean? there is no scrubber.

### `i10-popin` — PROBLEM

Nope, see video. diagnose the root cause.

### `i10-storm` — (no verdict given)

I mean, the fact that the active player's ship is now invisible is a problem so bad that i can't even test this

### `i10-veil` — PROBLEM

Nope, see screenshot. there has to be a simpler way -- can you just make a new fullscreen div that's on top of everything else, and put the stage modal on top of that?

### `i11-coins` — PROBLEM

Problem: THe coin sound earned from Muse should happen when the coin LANDS in the hold, not when it is earned. Problem: the active player's ship disappeared. This should be done architecutrally with an event fired by the coin arriving in the hold, regardless of where the coin came from -- i noticed that the sound enters at the correct time when docking; this suggests that once again you've made a stupid patchy fix instead of fixing it at the root. I need you to be better and stop doing that -- can you suggest ways to ensure that you make extensible architectural fixes? i am sick and tired of typing the word "architectural" to you -- it's clearly not working. what would you instruct ME to say to YOU so that YOu write better code that solves root issues instead of one-offs?

### `i12-bots` — LOOKS RIGHT

I asked you to retune the algorithm to make bots more strategic. They may already be strategic enough; but i can beat them almost 100% of the time, which means I'm doing something strategfy wise that they aren't. this is cool, in a way -- but i'd like them to get smarter; and for eventually, us to have a tuner where players could set the skill level of the bots from easy to diabolical.

### `i13-voyagelog` — LOOKS RIGHT

This is great! is it watching my playtests on staging to? it should be! i'm very good at this game, and it should learn from me. Also, it should only try to learn from humans who win. we don't want the bots learning bad moves from bad human players.

### `i14-dark` — LOOKS RIGHT

ALMOST -- the edges are still wrong during the pre-game narration

### `i17-score` — LOOKS RIGHT

I think winning should just give you +500, make it a clean number.

### `i17-victory` — LOOKS RIGHT

we're soooo close to being able to merge to main, it looks awesome. A few problems: 
the final voyage end ceremony does not seem to be centered on the screen properly WHEN the user reseizes their screen -- it should be calculated every time the screen size changes. 
the boats on the podium should always be centered -- when dough hook wins, the podium is placed off center (why?)

### `i175-cleanup` — LOOKS RIGHT

problem: when i passed on buying a crate at a dock, 3 coins dropped out of my purse; even though i didn't buy anything from the dock. this animation event  apparently is attached to the wrong event -- it should be attached to buying a crate; not simply ending your turn at a dock. 
the camera should center a bot before they begin to move;

### `i175-swipe` — LOOKS RIGHT

click-dragging to swipe those end cards doesn't work -- it's really buggy. when i click once, the card starts to drag; when i release, the card continues to drag. this may have been an issue with mouse up outside the window? I'm not sure -- in any case, fix it.

### `i176-predark` — LOOKS RIGHT

you MUST make sure you're using the same code to do this in an extensible non-drifting way though. If for example i want to change that darkness, or change the area that "all stages" make dark, it must be changeable in one place, not two. pls confirm.

### `q10-coins` — PROBLEM

The tuner sheet already solves this.

### `q10-dials` — LOOKS RIGHT

I entered my numbers.

### `q10-ribbon` — PROBLEM

The top bar shows whose turn it is -- which is the active player who decided to attack. this does not need to change during a battle; it should not.

### `q17-coinword` — PROBLEM

It's fine -- the coin is there for a short time, it actually is a GOOD thing that  adds to the depth of the game. Look, here's a general rule: if important game elements like words or sail squares are blocked for a finite, short amount of time, or can be interacted with to stop them from covering each other, that's fine. that passes.

### `q48-camera` — LOOKS RIGHT

Yep i love it -- this is much better.

---

## Verdicts with no note attached

- `i-hail` — LOOKS RIGHT
- `i10-bits` — LOOKS RIGHT
- `i10-cannon` — LOOKS RIGHT
- `i10-crates` — LOOKS RIGHT
- `i10-fight` — LOOKS RIGHT
- `i10-muse` — LOOKS RIGHT
- `i10-sailtap` — LOOKS RIGHT
- `i11-dockline` — LOOKS RIGHT
- `i11-sail` — LOOKS RIGHT
- `i11-spend` — LOOKS RIGHT
- `i14-coins` — LOOKS RIGHT
- `i14-diamond` — LOOKS RIGHT
- `i14-flinch` — LOOKS RIGHT
- `i14-ship` — LOOKS RIGHT
- `i14-smoke` — LOOKS RIGHT
- `i14-tuner` — LOOKS RIGHT
- `i14-words` — LOOKS RIGHT
- `i15-crate` — LOOKS RIGHT
- `i15-tuner` — LOOKS RIGHT
- `i16-bake` — LOOKS RIGHT
- `i16-bob` — LOOKS RIGHT
- `i16-coinsout` — LOOKS RIGHT
- `i16-fightcoin` — LOOKS RIGHT
- `i16-flee` — LOOKS RIGHT
- `i16-onscreen` — LOOKS RIGHT
- `i16-plunder` — LOOKS RIGHT
- `i16-sounds` — LOOKS RIGHT
- `i17-close` — LOOKS RIGHT
- `i17-crew` — LOOKS RIGHT
- `i17-hint` — LOOKS RIGHT
- `i17-tapcoin` — LOOKS RIGHT
- `i175-bake` — LOOKS RIGHT
- `i175-halted` — LOOKS RIGHT
- `i176-500` — LOOKS RIGHT
- `i176-ceremony` — LOOKS RIGHT
- `i176-dockpass` — LOOKS RIGHT
- `i176-swipemouse` — PROBLEM
- `q10-404` — LOOKS RIGHT
- `q17-aground` — LOOKS RIGHT
- `q17-bakin` — LOOKS RIGHT
- `q17-hailbox` — LOOKS RIGHT
- `q17-readybtn` — LOOKS RIGHT
- `q17-sailcam` — LOOKS RIGHT
- `q17-waitlines` — LOOKS RIGHT
