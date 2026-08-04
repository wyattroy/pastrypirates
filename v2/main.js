// Pastry Pirates v2 — wiring only. No rules, no rendering; it just plugs resolvers into the engine.
import { GameV2, POWERS, K, man } from "./engine.js";
import { botResolver } from "./strategy.js";
import * as UI from "./ui.js";
const A = UI.A;
import { ING_NAME, ING_EMOJI, ING_IMG, HEXCOL } from "../src/shared/index.js";

let G, bot, seats, humanSeats = [], activeHuman = null;

const $ = id => document.getElementById(id);
const ingBtn = i => `<img class="ii" src="${A(ING_IMG[i])}" alt=""> ${ING_NAME[i] || i}`;

// pass-and-play: hand the device over before a different captain is asked to decide
async function handOver(seat) {
  if (humanSeats.length < 2 || activeHuman === seat) { activeHuman = seat; return; }
  activeHuman = seat;
  UI.drawCaptains(-1);
  await UI.ask(`Pass the spyglass to <b style="color:${HEXCOL[seat]}">${G.players[seat].name}</b>.`,
    [{ label: "I'm ready", value: 1 }], "Everyone else, eyes away — recipes are secret.");
}

function humanResolver() {
  return async function resolve(req) {
    const p = G.players[req.seat];
    await handOver(req.seat);
    UI.drawCaptains(req.seat);
    const you = `<b style="color:${HEXCOL[p.idx]}">${p.name}</b>`;

    switch (req.kind) {
      case "recipe": {
        const [a, b] = req.options;
        const show = r => r.map(i => ING_EMOJI[i]).join(" ");
        return await UI.ask(`${you} — two recipes, keep one. Which path can ye actually sail?`,
          [{ label: show(a), value: 0 }, { label: show(b), value: 1 }],
          "Look at where the islands fell and where ye start.");
      }
      case "power": {
        return await UI.ask(`${you} — choose yer ship.`,
          req.options.map(k => ({ label: `<b>${POWERS[k].name}</b><br><small>${POWERS[k].blurb}</small>`, value: k })));
      }
      case "sail": {
        UI.drawBoard(); UI.drawVane();
        return await new Promise(res => {
          UI.say(`${you} — click a yellow square to sail there, or hold course.`);
          UI.highlight(req.options, c => { $("panel").innerHTML = ""; res(c); });
          const p2 = $("panel"), b = document.createElement("button");
          b.className = "apBtn"; b.textContent = "Hold course";
          b.addEventListener("click", () => { $("panel").innerHTML = ""; res(null); });
          p2.appendChild(b);
        });
      }
      case "act": {
        const lbl = o => o.a === "bake" ? "🧁 Fire the ovens — WIN"
          : o.a === "dock" ? `⚓ Dock — ${ingBtn(o.ing)} (${G.priceOf(o.ing, p)}🌕)`
          : o.a === "battle" ? `⚔️ Attack ${G.players[o.target].name}`
          : o.a === "trade" ? "🤝 Hail the fleet — call a trade"
          : o.a === "cast" ? "🎣 Call the cast"
          : o.a === "poach" ? "🎣 Poach alone (+2🌕)" : "Hold";
        return await UI.ask(`${you} — what'll ye do?`, req.options.map(o => ({ label: lbl(o), value: o })));
      }
      case "flip": {
        const { ing, heads, got } = req.options;
        return await UI.flipCoin(`${you} ties up at ${ingBtn(ing)} — dig for treasure first.`, heads, got);
      }
      case "buy": {
        const { ing, cost, need } = req.options;
        return await UI.ask(`Buy ${ingBtn(ing)} for <b>${cost}🌕</b>?`,
          [{ label: `Aye, ${cost}🌕`, value: true }, { label: "Nay", value: false }],
          need ? "Ye need this one." : "Ye don't need it — but somebody might.");
      }
      // TWO STEPS: what ye want, then what ye'll give for it. It was one screen listing every crate
      // crossed with every way of paying — sliced to seven buttons, so options simply disappeared,
      // and coins were capped at six however full yer purse. Splitting it means nothing is ever
      // truncated and the price is a number instead of a guessed rung.
      case "offer": {
        const need = G.needs(p), surplus = p.ing.filter(i => !need.includes(i));
        const holdersOf = i => G.players.filter(q => q !== p && !q.done && q.ing.includes(i));
        for (;;) {
          const opts = [];
          for (const i of need) if (holdersOf(i).length) opts.push({ label: `I want ${ingBtn(i)}`, value: { want: i } });
          for (const s of surplus) if (G.players.some(q => q !== p && !q.done && G.needs(q).includes(s)))
            opts.push({ label: `I'll sell ${ingBtn(s)}`, value: { want: s, sale: true } });
          opts.push({ label: "Say nothing", value: { skip: true } });
          const pick = await UI.ask(`${you} — call one offer to the whole table.`, opts,
            "Everyone answers once, then ye pick.");
          if (pick.skip || pick.sale) return pick;

          // what ye'll give. Terms already refused in public are gone from the menu — asking again
          // with the same words is the spam, whoever is doing it.
          const swaps = surplus.filter(s => holdersOf(pick.want).some(q => !G.swapRefused(q.idx, pick.want, s)));
          const ways = [];
          if (p.coins > 0) ways.push({ label: `Coin — up to ${p.coins}🌕`, value: "coin" });
          for (const s of swaps) ways.push({ label: `Trade away ${ingBtn(s)}`, value: s });
          if (!ways.length) { await UI.ask(`Ye've nothing to offer for ${ingBtn(pick.want)}.`,
            [{ label: "Back", value: 1 }]); continue; }
          const way = await UI.ask(`Ye want ${ingBtn(pick.want)}. What'll ye give?`, ways,
            "They may hold out for more — ye can still walk away.", "Change what I want");
          if (way === UI.BACK) continue;
          if (way !== "coin") return { want: pick.want, giveIng: way };

          const n = await UI.stepper({
            msg: `How much for ${ingBtn(pick.want)}?`, min: 1, max: p.coins, start: Math.min(p.coins, 4),
            sub: "Yer opening bid — not a ceiling. Anyone may ask for more.",
            back: "Change what I give", confirm: "Call it",
          });
          if (n === UI.BACK) continue;
          return { want: pick.want, giveCoins: n };
        }
      }
      case "answer": {
        const { offer, from, rivals, callerCoins, floor } = req.options;
        const who = `<b style="color:${HEXCOL[from]}">${G.players[from].name}</b>`;
        if (offer.sale) {
          if (p.coins < 1) return { no: true };
          const bid = await UI.stepper({
            msg: `${who} is selling ${ingBtn(offer.want)}. What'll ye pay?`,
            min: 0, max: p.coins, start: Math.min(p.coins, 3),
            sub: "Highest bid takes it. Nought means ye're out.", confirm: "Bid it",
          });
          return bid > 0 ? { ask: bid } : { no: true };
        }
        const opts = [{ label: "I'll not deal", value: { no: true } }];
        if (offer.giveIng) {
          opts.push({ label: `Aye — swap for ${ING_NAME[offer.giveIng]}`, value: { ask: 0 } });
          return await UI.ask(`${who} wants ${ingBtn(offer.want)} and offers ${ING_NAME[offer.giveIng]}. Ye hold one.`,
            opts, "Crate for crate, or nothing.");
        }
        // Their number opens the haggle; it does not cap it. Name any price up to what is actually
        // in their purse — and go UNDER their number only when another captain could take the deal
        // instead, because that is the only time undercutting wins you anything.
        const n0 = offer.giveCoins | 0;
        const sub = (rivals > 0
          ? `${rivals === 1 ? "One other captain holds" : rivals + " other captains hold"} one too — shave yer ask and the deal's yours.`
          : `Ye're the only one holding it. ${who} has ${callerCoins}🌕 in the purse.`)
          + (floor ? ` <b>Ye turned down ${floor}🌕 for this before.</b>` : "");
        opts.push({ label: `Aye — ${n0}🌕`, value: { ask: n0 } });
        opts.push({ label: "Name me price", value: "haggle" });
        const first = await UI.ask(`${who} wants ${ingBtn(offer.want)} and offers <b>${n0}🌕</b>. Ye hold one.`,
          opts, sub);
        if (first !== "haggle") return first;
        const lo = rivals > 0 ? 1 : n0;      // undercutting is only for beating another holder
        const ask = await UI.stepper({
          msg: `What'll ye take for ${ingBtn(offer.want)}?`,
          min: lo, max: Math.max(lo, callerCoins), start: Math.max(lo, Math.min(callerCoins, n0 + 1)),
          sub: `${who} can pay ${callerCoins}🌕 at most.` + (rivals > 0 ? " Under their call, ye beat the others." : ""),
          back: "Never mind", confirm: "That's me price",
        });
        return ask === UI.BACK ? { no: true } : { ask };
      }
      case "pick": {
        const { answers, offer } = req.options;
        const n0 = offer.giveCoins | 0;
        const opts = answers.map((a, i) => ({
          label: `${G.players[a.seat].name} — ${a.ask ? a.ask + "🌕" : "swap"}` +
            (!offer.sale && !offer.giveIng && a.ask > n0 ? ` <small>(holds out for ${a.ask - n0} more)</small>` : ""),
          value: i }));
        opts.push({ label: "Walk away", value: -1 });
        return await UI.ask(`Answers for yer ${ING_NAME[offer.want]}. Take one?`,
          opts, offer.sale ? "Ye asked the table to bid." : `Ye called ${n0}🌕.`);
      }
      case "commit": {
        const { max, foe, attacking } = req.options;
        const f = `<b style="color:${HEXCOL[foe]}">${G.players[foe].name}</b>`;
        const steps = [...new Set([0, 1, 2, 3, Math.ceil(max / 2), max].filter(n => n >= 0 && n <= max))].sort((a, b) => a - b);
        return await UI.ask(`${attacking ? `Ye attack ${f}` : `${f} attacks ye`} — commit yer powder, in secret.`,
          steps.map(n => ({ label: `${n}🌕`, value: n })), "Ye lose it whether ye win or lose. Downwind adds +1.");
      }
      case "spoils": {
        const { crates, coins } = req.options;
        const opts = crates.map(c => ({ label: `Take ${ingBtn(c)}`, value: { ing: c } }));
        if (coins > 0) opts.push({ label: `Take ${coins}🌕`, value: { coins: true } });
        return await UI.ask("Ye won. What'll ye take?", opts);
      }
      case "call": {
        const { a, d } = req.options;
        return await UI.ask(`⚔️ ${G.players[a].name} attacks ${G.players[d].name}. Call it from the crow's nest — free, +2🌕 if ye're right.`,
          [{ label: G.players[a].name, value: a, color: HEXCOL[a] }, { label: G.players[d].name, value: d, color: HEXCOL[d] }]);
      }
      case "cast": {
        const { pot, takes, stage } = req.options;
        return await UI.ask(`🎣 The pot stands at <b>${takes}🌕</b>. Take it, or ride the next flip?`,
          [{ label: `Take ${takes}🌕`, value: false }, { label: `Ride — for ${takes * 2}🌕`, value: true }],
          "Heads and it doubles. Tails and everyone still in gets nothing.");
      }
      default: return null;
    }
  };
}

async function drive() {
  const human = humanResolver();
  const it = G.run();
  let step = it.next();
  while (!step.done) {
    const req = step.value;
    const p = G.players[req.seat];
    // Draw FIRST, then narrate, then ask. Everything the last step did is on the board before any
    // line describes it — which matters now the lines are bubbles pinned to ships: narrating first
    // spoke from where a ship used to be, and left the vane reading "—" while the log announced
    // the wind.
    UI.drawBoard(); UI.drawVane();
    UI.drawCaptains(p.kind === "human" ? req.seat : (activeHuman ?? -1));
    await UI.narrate(activeHuman ?? humanSeats[0], false);
    // No sleep here on purpose. The narration clock in ui.js is the ONLY thing that sets the pace;
    // a second delay stacked on top meant two places decided the speed and neither knew about the
    // other. A bot step that says nothing now costs nothing.
    const res = p.kind === "human" ? await human(req) : bot(req);
    step = it.next(res);
  }
  await UI.narrate(activeHuman ?? humanSeats[0], false);
  UI.drawBoard(); UI.drawCaptains(activeHuman ?? -1);
  const s = G.standings(), w = G.winner();
  UI.say(`<span class="hdr">👑 ${w === null ? "Nobody" : G.players[w].name} is the Best Baker in the Caribbean!</span><br>` +
    s.map(x => `${G.players[x.i].name} — ${x.res} resources`).join("<br>") +
    `<br><br><button class="apBtn" onclick="location.reload()">Sail again</button>`);
}

export function start(nHumans, nBots) {
  const names = ["Crumble", "Biscotti", "Gingersnap", "Shortbread"];
  seats = [];
  for (let i = 0; i < nHumans; i++) seats.push({ name: names[i], kind: "human" });
  for (let i = 0; i < nBots; i++) seats.push({ name: names[nHumans + i], kind: "bot" });
  humanSeats = seats.map((s, i) => s.kind === "human" ? i : -1).filter(i => i >= 0);
  activeHuman = humanSeats[0] ?? null;
  G = new GameV2((Date.now() ^ 0x9e3779b9) >>> 0, seats);
  bot = botResolver(G);
  UI.attach(G); UI.resetNarration();
  const hide = $("setup"), show = $("game");
  if (hide) hide.style.display = "none";
  if (show) show.style.display = "";
  UI.drawBoard(); UI.drawVane(); UI.drawCaptains(humanSeats[0] ?? -1);
  drive().catch(e => { UI.say(`<b>Something broke:</b> ${e.message}`); console.error(e); });
}
window.startV2 = start;
