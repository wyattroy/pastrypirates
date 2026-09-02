#!/usr/bin/env node
/* do_now_check.mjs — HIS INTERRUPT MUST REACH THE TOP, AND ONLY ONE THING MAY BE THERE.
 *
 * WHY (Wyatt, on the Glass, 2026-09-02 3:09 PM ET): "Do Now: in the Glass, Add a \"DO now\" button
 * next to \"Send to the Chart\" button that tells RANK to put this task at the top". And the design
 * it belongs to, his own, from the question UI the same day: "i need a way to say DO THIS NOW such
 * that RANK puts it at the top -- eg a checkbox underneath the ideas list that says 'Add to top of
 * list'".
 *
 * THE FEATURE IS ITS OWN ACCEPTANCE TEST, and that is not a joke. He had to type "DO NOW" in prose
 * because the button did not exist — and the request for the button then sank to 31 of 39 on the
 * list. Had this shipped, it would not have needed rescuing by hand.
 *
 * WHAT THIS GATE HOLDS, and every case is behavioural — a fixture on disk, the real tools run
 * against it, and what they actually did read back:
 *   1. a pinned row ranks FIRST, even when every other signal is against it;
 *   2. pinning does not re-order anything else — his ask is "put THIS task at the top", not
 *      "re-rank my list";
 *   3. ONE SLOT: pinning a second row releases the first, mechanically, in one act;
 *   4. two pins arriving any other way FAIL THE BUILD, naming both;
 *   5. a pin on a handle that does not exist is REFUSED — an interrupt he cannot see is
 *      indistinguishable from one that was ignored, which is what happened to him all day;
 *   6. releasing the pin works, so a watch can take the row;
 *   7. the page carries the button beside "Send to the Chart", and an idea he pins is saved
 *      carrying its flag;
 *   8. and the pin is VISIBLE on his own Tasks card, so he can see the interrupt landed.
 *
 * THE JOINT THIS GATE EXISTS FOR IS 7→8. Between his tap and RANK sits a HUMAN harvest step, and
 * every chain in this project that has broken has broken at a human joint: the harvest that lost
 * his words, the runbook step a tick walked past, the gate aimed at the wrong tree. So the pin is
 * not carried by an instruction to a session — it is carried by ONE COMMAND that writes it, and
 * case 3 proves the command is the only thing that can produce a valid pin.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const KEEPER = join(ROOT, "scripts", "wyclau", "chartkeeper.mjs");
const GLASS = join(ROOT, "scripts", "wyclau", "glass.mjs");

let failures = 0;
const fail = (m) => { console.log(`  FAIL  ${m}`); failures++; };
const pass = (m) => console.log(`  ok    ${m}`);

console.log("his DO NOW reaches the top of RANK, and only one thing is ever there\n");

const tmp = mkdtempSync(join(tmpdir(), "donow-"));
process.on("exit", () => { try { rmSync(tmp, { recursive: true, force: true }); } catch {} });

const chartFile = (name, body) => {
  const p = join(tmp, `${name}.md`);
  writeFileSync(p, body);
  return p;
};
/* Every run is pinned to a THROWAWAY archive, for the reason chartkeeper_check.mjs paid to learn:
   a run without --log falls back to the real .planning/CHART-LOG.md and writes fixture rows into
   the tree it is measuring. */
const run = (args) => {
  const chartArg = args.find((a) => a.startsWith("--chart="))?.slice(8) ?? "default";
  const own = `${chartArg.split(/[\\/]/).pop().replace(/\.md$/, "")}-LOG.md`;
  const pinned = args.some((a) => a.startsWith("--log=")) ? args : [...args, `--log=${join(tmp, own)}`];
  try {
    return { code: 0, out: execFileSync(process.execPath, [KEEPER, ...pinned], { encoding: "utf8", cwd: ROOT }) };
  } catch (e) {
    return { code: e.status ?? 1, out: `${e.stdout ?? ""}${e.stderr ?? ""}` };
  }
};
const runJson = (args) => {
  const r = run([...args, "--json"]);
  try { return { ...r, json: JSON.parse(r.out) }; } catch { return { ...r, json: null }; }
};

/* ── THE FIXTURE. One row that RANK already loves and one it has no reason to care about, so
   "the pin won" cannot be confused with "it was going to win anyway". T-801 touches src/ (+30)
   and reads as player-facing; T-803 carries nothing at all. ── */
const FIXTURE = `# THE CHART — fixture

## STEP 1 CHECKLIST — the reboot

- [ ] **A ROW RANK ALREADY LOVES** — it changes \`src/ui/flow.js\`, where a player can see it,
      ⟨\`T-801\`⟩
      and it has been raised more than once.
- [ ] **AN ORDINARY MIDDLE ROW** with nothing much to recommend it either way.
      ⟨\`T-802\`⟩
- [ ] **THE ROW HE WANTS DONE NOW** — nothing about this row is urgent to anyone but him.
      ⟨\`T-803\`⟩
- [ ] **ANOTHER ORDINARY ROW** so the ordering below has something to be stable about.
      ⟨\`T-804\`⟩

## BLOCKED ON WYATT

| Question | Recommendation | since |
|---|---|---|

## THE IDEA INBOX

- **A fated idea** — handled → **SHIPPED** 2026-09-01.
`;

const rankTitles = (p, extra = []) => {
  const r = runJson([`--chart=${p}`, "--rank", ...extra]);
  return r.json && Array.isArray(r.json.rank) ? r.json.rank.map((x) => String(x.title || "")) : null;
};
const pinnedRows = (p) =>
  (readFileSync(p, "utf8").match(/^\s*⟨[^⟩]*\bnow\s*:\s*yes\b[^⟩]*⟩\s*$/gmi) || []).length;

/* ── 1. THE PIN WINS, AND IT WINS AGAINST A ROW THAT WAS ALREADY WINNING ────────────────────── */
{
  const p = chartFile("pin-wins", FIXTURE);
  const before = rankTitles(p);
  if (!before) fail("--rank --json produced no ordered list on the fixture");
  else if (!/RANK ALREADY LOVES/.test(before[0]))
    fail(`the fixture is not set up as intended — expected the player-facing row first, got "${before[0].slice(0, 50)}"`);
  else pass("before the pin, the row RANK already loves is first (the fixture is honest)");

  const r = run([`--chart=${p}`, `--do-now=T-803`]);
  if (r.code !== 0) fail(`--do-now=T-803 exited ${r.code}: ${r.out.trim().slice(0, 200)}`);
  const after = rankTitles(p);
  if (!after) fail("--rank --json produced no ordered list after the pin");
  else if (!/HE WANTS DONE NOW/.test(after[0]))
    fail(`he said DO NOW and the row is at position ${after.findIndex((t) => /HE WANTS DONE NOW/.test(t)) + 1}, not 1 — his interrupt does not reach the top, which is the whole of what he asked for`);
  else pass("the row he pinned ranks FIRST, over a row RANK was already putting above it");
}

/* ── 2. THE PIN MOVES ONE ROW, NOT THE LIST. "put THIS task at the top" ─────────────────────── */
{
  const p = chartFile("pin-stable", FIXTURE);
  const before = rankTitles(p);
  run([`--chart=${p}`, `--do-now=T-803`]);
  const after = rankTitles(p);
  if (!before || !after) fail("could not rank one of the two passes");
  else {
    const b = before.filter((t) => !/HE WANTS DONE NOW/.test(t));
    const a = after.filter((t) => !/HE WANTS DONE NOW/.test(t));
    if (JSON.stringify(a) !== JSON.stringify(b))
      fail(`pinning one row re-ordered the others — he asked to move ONE task, not to re-rank his list.\n        was: ${JSON.stringify(b)}\n        now: ${JSON.stringify(a)}`);
    else pass("every other row kept its relative order — the pin lifts one row and disturbs nothing");
  }
}

/* ── 3. ONE SLOT, NOT A QUEUE — his design says so, and it is enforced by the WRITE, not by a rule.
      "Ticking it on a second item must displace the first, deliberately. An interrupt with a queue
      is just another backlog, which is the fault this whole design removes." ─────────────────── */
{
  const p = chartFile("one-slot", FIXTURE);
  run([`--chart=${p}`, `--do-now=T-803`]);
  if (pinnedRows(p) !== 1) fail(`after one pin the Chart carries ${pinnedRows(p)} pinned rows, expected exactly 1`);
  else pass("one pin marks exactly one row");
  run([`--chart=${p}`, `--do-now=T-802`]);
  const n = pinnedRows(p);
  if (n !== 1) fail(`pinning a second row left ${n} pinned rows — an interrupt with a queue is just another backlog`);
  else {
    const titles = rankTitles(p);
    if (titles && /ORDINARY MIDDLE ROW/.test(titles[0])) pass("pinning a second row released the first, in the same act — one slot, mechanically");
    else fail(`the second pin did not take the top slot; got "${titles ? titles[0].slice(0, 50) : "no ranking"}"`);
  }
}

/* ── 4. TWO PINS ARRIVING ANY OTHER WAY FAIL THE BUILD. The command cannot produce this state, so
      a hand edit is the only way in — and a hand edit is exactly what the record keeps losing to. */
{
  const TWO = FIXTURE
    .replace("⟨`T-802`⟩", "⟨`T-802` · now: yes⟩")
    .replace("⟨`T-803`⟩", "⟨`T-803` · now: yes⟩");
  const p = chartFile("two-pins", TWO);
  const r = run([`--chart=${p}`, "--rank"]);
  if (r.code === 0) fail("two rows carry DO NOW and the tool said nothing — his one interrupt slot silently became a list");
  else if (!/T-802/.test(r.out) || !/T-803/.test(r.out))
    fail(`refused two pins but did not name both rows (${r.out.trim().slice(0, 160)}) — a complaint he cannot act on is not a complaint`);
  else pass("two pinned rows fail the build, naming both");
}

/* ── 5. A PIN THAT LANDS NOWHERE IS REFUSED, LOUDLY. "An interrupt he cannot see is
      indistinguishable from one that was ignored" — his own words' consequence, and the thing
      that made him repeat himself five times on 2026-09-02. ─────────────────────────────────── */
{
  const p = chartFile("no-such-row", FIXTURE);
  const r = run([`--chart=${p}`, `--do-now=T-999`]);
  if (r.code === 0) fail("pinned a handle that is on no row and reported success — his tap would vanish with nothing to show for it");
  else if (pinnedRows(p) !== 0) fail("refused, and marked something anyway");
  else pass("a pin on a handle that does not exist is refused, and marks nothing");
}

/* ── 6. THE WATCH CAN RELEASE IT. A slot that cannot be emptied fills up once and stops working. */
{
  const p = chartFile("release", FIXTURE);
  run([`--chart=${p}`, `--do-now=T-803`]);
  /* Guard against a vacuous green: if the pin never landed, "the release worked" is a sentence
     about nothing. Case 6 is only a test once case 3 is real. */
  if (pinnedRows(p) !== 1) fail("case 6 cannot run — nothing was pinned to release");
  const r = run([`--chart=${p}`, "--do-now-clear"]);
  if (r.code !== 0) fail(`--do-now-clear exited ${r.code}: ${r.out.trim().slice(0, 160)}`);
  else if (pinnedRows(p) !== 0) fail("--do-now-clear left the row pinned — the slot can never be reused");
  else {
    const titles = rankTitles(p);
    if (titles && /RANK ALREADY LOVES/.test(titles[0])) pass("releasing the pin restores the ordinary ranking");
    else fail("the ranking did not return to its unpinned order after the release");
  }
}

/* ── 7 & 8. THE BUTTON HE ASKED FOR, ON THE PAGE, BESIDE THE ONE HE ALREADY HAS — AND THE PIN
      VISIBLE ON HIS OWN TASKS CARD. The page is rendered from a FIXTURE Chart to a FIXTURE file:
      a gate that renders the real page stamps the heartbeat and consumes GLASS-NOTE.md, and this
      project has already lost a watch's note that way (INBOX-20260902T0350Z). ───────────────── */
{
  const p = chartFile("page", FIXTURE.replace("⟨`T-803`⟩", "⟨`T-803` · now: yes⟩"));
  const out = join(tmp, "glass-fixture.html");
  let page = "";
  try {
    execFileSync(process.execPath, [GLASS, `--chart=${p}`, `--out=${out}`], { encoding: "utf8", cwd: ROOT });
    page = readFileSync(out, "utf8");
  } catch (e) {
    fail(`glass.mjs could not render against a fixture Chart (${String(e.status ?? e.message).slice(0, 120)}) — so nothing about his page can be checked without touching the real one`);
  }
  if (page) {
    const sendAt = page.indexOf('id="ideaSend"');
    const nowAt = page.indexOf('id="ideaDoNow"');
    if (nowAt === -1) fail('no "DO NOW" button on the page — his ask was for a button "next to \'Send to the Chart\'"');
    else if (Math.abs(nowAt - sendAt) > 400) fail("the DO NOW button exists but is not next to Send to the Chart");
    else pass('the DO NOW button sits beside "Send to the Chart"');
    if (!/DO NOW/i.test(page)) fail("the button carries no label he would recognise as his own words");
    else pass("it is labelled in his own words");
    /* The page's own script must WRITE the flag onto the idea and READ it back when it repaints,
       or the button is decoration.
       ⚠ SAID PLAINLY: THESE TWO ARE SOURCE-SHAPE ASSERTIONS, NOT BEHAVIOUR. There is no DOM here,
       so this gate cannot press the button. What covers the behaviour is the browser screenshot the
       watch takes of this same rendered page — and if that screenshot was not taken, this pair is
       the weakest thing in the file and should be read as such. */
    if (!/\bnow\s*=\s*true\b/.test(page)) fail("the page never writes a pin flag onto the idea it saves — the button would look like it worked and reach nothing");
    else pass("a pinned idea is saved carrying its flag, so the harvest can see it");
    /* ⚠ THIS ASSERTION WAS `\bi\.now\b` FOR ABOUT A MINUTE AND IT COULD NOT FAIL. `releasePins`
       contains `i.now` too, so deleting the entire pinned-idea rendering left it green — caught by
       red-proofing it, not by reading it. It now keys on the tag that rendering exists to produce. */
    if (!/className\s*=\s*"pinTag"/.test(page)) fail("nothing on the page renders the flag back, so a pinned idea would look identical to an ordinary one until a session harvested it");
    else pass("the page paints a pinned idea as pinned, immediately, before any session has seen it");
    /* And ONE SLOT on the page too: a second pin must release the first before it is published. */
    if (!/releasePins/.test(page)) fail("nothing on the page releases a previous pin — he could pin three ideas and the page would show three interrupts");
    else pass("pinning on the page releases any previous pin, before it is ever saved");
    const tasksCard = page.split(/<h2>The Chart \(Tasks To Do\)/)[1]?.split("</section>")[0] ?? "";
    if (!tasksCard) fail("could not find the Tasks card in the rendered page");
    else if (!/DO NOW/i.test(tasksCard))
      fail("a row carrying his pin is not marked on his Tasks card — an interrupt he cannot see is indistinguishable from one that was ignored");
    /* Case-INSENSITIVE, and that is not laziness: the page de-shouts a row's title on purpose
       (his ask, "the Glass is SHOUTING at me"), so this row reaches him as "The row he wants done
       now". A case-sensitive assertion here would fail on the page working correctly. */
    else if (!/he wants done now/i.test(tasksCard.split(/DO NOW/i)[1]?.slice(0, 200) ?? ""))
      fail("the Tasks card marks something as DO NOW, but not the row that carries the pin");
    else pass("the pinned row is marked DO NOW on his own Tasks card");
  }
}

console.log(failures ? `\nFAIL (${failures})` : "\nPASS");
process.exit(failures ? 1 : 0);
