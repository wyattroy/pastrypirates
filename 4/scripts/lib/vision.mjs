// vision.mjs — the AUTOMATIC vision judge (Wyatt's pick, 2026-08-21): look at a screenshot the way
// a person does and say whether it "looks right", with NO per-bug rules. This is what makes the
// gate general instead of a growing list of yesterday's bugs — the model SEES an empty panel or a
// clipped name the same way Wyatt does at a glance, without anyone naming "empty tower" in code.
//
// Vehicle: the `claude` CLI in print mode (`claude -p`), which uses the machine's existing Claude
// auth — no API key to manage, works the same on the laptop and in a cloud session. Proven
// 2026-08-21 to catch the build-v empty tower + name/coin overlap from one general prompt.
import { execFile } from "node:child_process";

const RUBRIC = `You are a meticulous UI reviewer looking at ONE screenshot of the browser board game "Pastry Pirates".
Judge ONLY the visual layout and presentation — NOT the gameplay, and NOT which islands/ships/recipes appear (those are randomized and always fine).
Mark FAIL if you can see ANY of these:
- an element cut off or clipped by a screen edge, by the top ribbon, or by another element;
- text overlapping other text or icons, running into a neighbour, or spilling outside its own box;
- a panel/card/box with large EMPTY dead space — much taller or wider than the content inside it;
- a button, message, prompt, or bubble jammed into a corner or against an edge, floating detached from what it belongs to, or off-screen;
- anything unreadable, misaligned, doubled, or obviously broken.
ACCEPTED — these are DESIGNED behaviour, never a FAIL and never worth listing as an issue:
- a scrollable card or sheet may run past the bottom of the screen; being cut off at the bottom edge is how it tells you to scroll;
- board artwork (the map, islands, ships, logo, decorative art) may be clipped at the edge of the board itself — the board is a camera view of a larger map, so its contents are cut off by design.
Mark PASS if the screen looks clean, balanced and intentional.
Reply with ONLY a JSON object, no prose:
{"verdict":"PASS"|"FAIL","issues":["short concrete phrase", "..."],"confidence":0.0-1.0}`;

function extractJSON(text) {
  // the model may wrap the JSON in prose or a code fence — pull the first {...} object out
  const fence = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  const raw = fence ? fence[1] : (text.match(/\{[\s\S]*\}/) || [null])[0];
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

// judge ONE screenshot. Returns {verdict, issues, confidence, raw} or {verdict:"ERROR", ...}.
// context is a short label ("desktop 1920 — sail prompt") folded into the prompt so the model knows
// the size/mode without it changing the layout rules.
export function judgeScreen(imgPath, context = "", { model = "claude-sonnet-5", timeoutMs = 120000 } = {}) {
  const prompt = `${RUBRIC}\n\nContext (informational only, does not change the rules): ${context}\nRead the image file at ${imgPath} and judge it.`;
  return new Promise((resolve) => {
    const child = execFile("claude", ["-p", prompt, "--model", model, "--output-format", "json"],
      { maxBuffer: 8 * 1024 * 1024 }, (err, stdout) => {
        if (err && !stdout) return resolve({ verdict: "ERROR", issues: ["vision call failed: " + String(err.message || err).slice(0, 120)], confidence: 0 });
        let text = stdout;
        try { const outer = JSON.parse(stdout); text = outer.result ?? stdout; } catch {}   // --output-format json wraps the reply in {result,...}
        const j = extractJSON(String(text));
        if (!j || !j.verdict) return resolve({ verdict: "ERROR", issues: ["unparseable judge reply"], confidence: 0, raw: String(text).slice(0, 200) });
        resolve({ verdict: /fail/i.test(j.verdict) ? "FAIL" : "PASS", issues: Array.isArray(j.issues) ? j.issues : [], confidence: +j.confidence || 0 });
      });
    const t = setTimeout(() => { try { child.kill("SIGKILL"); } catch {} resolve({ verdict: "ERROR", issues: ["vision call timed out"], confidence: 0 }); }, timeoutMs);
    child.on("exit", () => clearTimeout(t));
  });
}

// judge many screenshots with bounded concurrency (each call is a full CLI/account inference).
export async function judgeAll(items, { concurrency = 3, model = "claude-sonnet-5", onEach } = {}) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await judgeScreen(items[i].path, items[i].context || "", { model });
      if (onEach) onEach(items[i], results[i], i);
    }
  }));
  return results;
}
