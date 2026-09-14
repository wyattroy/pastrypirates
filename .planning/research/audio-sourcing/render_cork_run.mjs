// THE CORK POP, AS HE DIALLED IT, AT EVERY PITCH THE RISE REACHES — one file of 19 slots.
// His settings (2026-09-13): cork pop, starting pitch 1 st, climb 1 st per pop, stops after 18 pops, volume 55%.
// So pop k is pitched 1 + min(k,18) semitones: 19 distinct pops. Each is the tuner's own POPS.cork recipe at that
// pitch — a 30ms cubed-decay noise burst through a highpass at 2f, and a sine gliding f*0.7 -> f*1.6 over 45ms under a
// 3ms attack / 90ms decay — so every pop keeps its length as it climbs (a sped-up sample would shorten as it rose).
// Slot s (0..18) holds the pop at 1+s semitones, starting LEAD_S into a SLOT_S slot: the lead absorbs an mp3
// decoder's priming delay either way, so the game never cuts a pop's attack.
import fs from "node:fs";
const SR = 48000, SLOT_S = 0.3, LEAD_S = 0.04, SLOTS = 19, VOL = 0.55;
const slotLen = Math.floor(SR * SLOT_S), out = new Float32Array(slotLen * SLOTS);
let seed = 12345; const rnd = () => ((seed = (seed * 1103515245 + 12345) >>> 0) / 4294967296) * 2 - 1;
for (let s = 0; s < SLOTS; s++) {
  const f = 440 * Math.pow(2, (1 + s) / 12), base = s * slotLen + Math.floor(SR * LEAD_S);
  const nLen = Math.floor(SR * 0.03), rc = 1 / (2 * Math.PI * f * 2), dt = 1 / SR, a = rc / (rc + dt);
  let prevIn = 0, prevOut = 0;
  for (let i = 0; i < nLen; i++) { const x = rnd() * Math.pow(1 - i / nLen, 3); const y = a * (prevOut + x - prevIn); prevIn = x; prevOut = y; out[base + i] += 0.5 * y; }
  let phase = 0;
  for (let i = 0; i < Math.floor(SR * 0.14); i++) {
    const t = i / SR;
    const fr = t < 0.045 ? f * 0.7 * Math.pow((f * 1.6) / (f * 0.7), t / 0.045) : f * 1.6;
    phase += 2 * Math.PI * fr / SR;
    const g = t < 0.003 ? 0.0001 * Math.pow(0.45 / 0.0001, t / 0.003) : t < 0.093 ? 0.45 * Math.pow(0.0001 / 0.45, (t - 0.003) / 0.09) : 0.0001;
    out[base + i] += g * Math.sin(phase);
  }
}
const LEN = out.length, buf = Buffer.alloc(44 + LEN * 2);
buf.write("RIFF", 0); buf.writeUInt32LE(36 + LEN * 2, 4); buf.write("WAVE", 8); buf.write("fmt ", 12); buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
buf.write("data", 36); buf.writeUInt32LE(LEN * 2, 40);
let peak = 0;
for (let i = 0; i < LEN; i++) { const v = out[i] * VOL; peak = Math.max(peak, Math.abs(v)); buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(v * 32767))), 44 + i * 2); }
fs.writeFileSync(new URL("./cork-pop-run.wav", import.meta.url), buf);   // then: ffmpeg -i cork-pop-run.wav -ac 1 -ar 48000 -c:a libmp3lame -b:a 96k sfx/cork-pop.mp3
console.log(`${SLOTS} slots × ${SLOT_S}s @${SR}Hz, peak ${(20 * Math.log10(peak)).toFixed(1)} dBFS`);
