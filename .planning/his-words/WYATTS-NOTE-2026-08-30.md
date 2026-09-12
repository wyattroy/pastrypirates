# The founding note — Wyatt, 2026-08-30, verbatim

*This is the note that started the wyclau reboot. It is preserved word for word. Every design
decision in this folder answers to it.*

---

Note to Claude about Pastry pirates

Claude, I'm not having fun working on this game with you any more. This note is my attempt to start
afresh, get your advice, and come up with a new strategy.

how we got here.
I had an idea for a game. I asked you to prototype it for me by creating a simulator based on the
rules I imagined in my head, to show me if this little "model world" i was imagining, of pirating
and baking pastries, was a balanced one. then i asked you to give the simulator a gui so i could
watch it run. then I asked you to let me play one of the seats of the game. Then i realized it was
actually fun — and we started building Pastry Pirates for real. None of this was pre-planned. the
game as it exists today started as machinery bolted on top of a python simulator.

where we are today
You cannot hold the whole game in your context. you cannot remember how it is supposed to behave,
and what is a bug. You can't even test it properly, or remember how you once tested it effectively,
because in between sessions you forget what you learned. You have a bloated claude.md file, hard
earned lessons split across hundreds of comments and other files, and a gsd framework that you no
longer touch, as well as a whole new multi-agent "team" structure we designed that works sometimes,
but doesn't work much of the time. I ask you to fix one small bug and 12 hours later, after enormous
effort and usage on your part, and hours of my cumulative time, you fix parts of it — while the game
still suffers from enormous brownfield tech debt that keeps its gameplay buggy, inconsistent, and
difficult to fix or improve. Meanwhile, I get more and more frustrated with you, sad, and confused,
as your limitations around remembering your own mistakes AND my design intentions show themselves in
rapidly-filling contexts, self-destructing cloud containers, agents that stop silently, test gates
that pass things they shouldn't, and hooks that fire when they don't need to. It's no longer fun any
more. And that makes me sad — because until the project got this big, it really was fun to build
this with you. and i want it to be fun again.

where we need to go
I have so many ideas for pastry pirates. Some are small, like making the game consistent for
different users. Some are huge, like one day adding logins and charging money for digital merch. I
can't do any of these ideas if you don't help me figure out a better way for us to work. What I want
is to be able to give you all of my ideas, and you help sort them, then you execute them, then you
test them as you go, and after however much time you need to do the work, you confidently show it to
me to make sure that it matches my expectations. I don't want to be your QA, I want to be your
manager. I created a CEO, CTO, and team of agents for you so that i can be the chairman of the
board, coming to you with a guiding vision and trusting you with the expertise to execute it. So
far, that trust has been met with hit or miss work and I'm starting to lose it.

what resources we have
I have a razer blade 15 pc that can be always on, running local sessions that i remote to my phone.
I have a macbook that can stay on every night, but that I need to close and move with during the
day, and i'd love to not interrupt your work. I have access to claude's cloud containers, though
those seem to max out at 4 cores and they drop sessions after 15 minutes that they think are idle. I
have a willingness to answer hard blocking questions that you ask of me clearly, if you give me
enough context to understand them. I'm on the Claude Max plan at $200/month and currently am not
using all of it.

What i want you to do
Come up with a plan. I want your help: read everything in the repo. research current (as in,
TODAY'S) best practices by ingesting anthropic's blogs on claude code and learning how they work.
then learn about my game and how it works by reading the entire code base and all the documents in
the repo and writing as many documents or reports as you need to. interview me — extensively, with
20-30 questions, about my goals for the game, my design values, my ideal ways of working with you,
and anything else you can think of that a stunningly a-class ceo would ask of their board chair.
then blue-sky design the ideal process for us to work together — starting with pastry pirates, but
ideally, in a way that is elegantly architected and applicable to any project. I want to be able to
run our new process, "wyclau" any time a challenge is too hard to solve through brute force, opus,
and fable alone. i want you to make building things together fun again.
