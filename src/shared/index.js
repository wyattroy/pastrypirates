// src/shared/index.js
//
// Phase 8 shared leaf tier (D-03/D-04). Holds no DOM, `window`, Firebase,
// wall-clock, or unseeded-random access — pure constants and pure helpers
// only, safe for both the engine module and (eventually) UI/net modules to
// import.

/* ================= RNG ================= */
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}}

export { mulberry32 };
