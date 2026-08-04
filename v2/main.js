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
      case "offer": {
        const need = G.needs(p), surplus = p.ing.filter(i => !need.includes(i));
        const opts = [];
        for (const i of need) if (G.players.some(q => q !== p && !q.done && q.ing.includes(i))) {
          const coins = Math.min(p.coins, 6);
          if (coins > 0) opts.push({ label: `I want ${ingBtn(i)} — I'll give ${coins}🌕`, value: { want: i, giveCoins: coins } });
          for (const s of surplus) opts.push({ label: `I want ${ingBtn(i)} — I'll give ${ING_NAME[s]}`, value: { want: i, giveIng: s } });
        }
        for (const s of surplus) if (G.players.some(q => q !== p && !q.done && G.needs(q).includes(s)))
          opts.push({ label: `I'll sell ${ingBtn(s)} — who'll pay?`, value: { want: s, sale: true } });
        opts.push({ label: "Say nothing", value: { skip: true } });
        return await UI.ask(`${you} — call one offer to the whole table.`, opts.slice(0, 7),
          "Everyone answers once, then ye pick.");
      }
      case "answer": {
        const { offer, from } = req.options;
        const who = `<b style="color:${HEXCOL[from]}">${G.players[from].name}</b>`;
        if (offer.sale) {
          const opts = [{ label: "No thanks", value: { no: true } }];
          for (const n of [2, 4, 6, 8].filter(n => n <= p.coins)) opts.push({ label: `I'll pay ${n}🌕`, value: { ask: n } });
          return await UI.ask(`${who} is selling ${ingBtn(offer.want)}. What'll ye pay?`, opts, "Highest bid wins it.");
        }
        const opts = [{ label: "I'll not deal", value: { no: true } }];
        if (offer.giveIng) opts.push({ label: `Aye — swap for ${ING_NAME[offer.giveIng]}`, value: { ask: 0 } });
        else for (const n of [1, 2, 3, 4, 6, 8].filter(n => n <= (offer.giveCoins | 0))) opts.push({ label: `I'll take ${n}🌕`, value: { ask: n } });
        return await UI.ask(`${who} wants ${ingBtn(offer.want)} and offers ${offer.giveIng ? ING_NAME[offer.giveIng] : offer.giveCoins + "🌕"}. Ye hold one.`,
          opts, "Undercut the others and the deal's yours.");
      }
      case "pick": {
        const { answers, offer } = req.options;
        const opts = answers.map((a, i) => ({ label: `${G.players[a.seat].name} — ${a.ask ? a.ask + "🌕" : "swap"}`, value: i }));
        opts.push({ label: "Walk away", value: -1 });
        return await UI.ask(`Answers for yer ${ING_NAME[offer.want]}. Take one?`, opts);
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
    let res;
    if (p.kind === "human") {
      await UI.narrate(activeHuman ?? humanSeats[0], false);
      UI.drawBoard(); UI.drawVane(); UI.drawCaptains(req.seat);
      res = await human(req);
    } else {
      res = bot(req);
      UI.drawBoard(); UI.drawVane(); UI.drawCaptains(activeHuman ?? -1);
      await UI.sleep(req.kind === "sail" || req.kind === "act" ? 120 : 40);
    }
    step = it.next(res);
    if (p.kind === "bot") await UI.narrate(activeHuman ?? humanSeats[0], false);
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
