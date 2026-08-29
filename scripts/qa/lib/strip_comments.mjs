/* THE ONE COMMENT STRIPPER, because eight copies of a wrong one is eight blind gates.
 *
 * WHAT IT COST, MEASURED 2026-08-29 (found while following gate 42 to the moved `subjectOf` rule).
 * Every text gate carried this line, copied from the one before it:
 *
 *     const strip = s => s.replace(BLOCK_RE, "").replace(LINE_RE, "$1")
 *       where BLOCK_RE matches slash-star, anything lazily, star-slash — and LINE_RE matches
 *       slash-slash to end of line. (Written out in words on purpose: spelling the block pattern
 *       literally inside a block comment ends the comment, which is this bug in one line.)
 *
 * It deletes BLOCK comments first. So a LINE comment containing the two characters that open one
 * silently opens a block comment — and `src/orchestrator.js:17` says `src/flow/<star>.js` inside a
 * `//` comment. The stripper therefore swallowed everything from line 17 to the next `*<slash>` at
 * line 168: **152 lines, including the ENTIRE import block**, invisible to all eight gates that
 * read that file. An assertion about an import there could only ever report absence, which reads
 * exactly like a real failure and is worth no more than a real pass (rule 6: an instrument that
 * reports NOT FOUND has told you something about ITSELF).
 *
 * THE FIX IS TO READ LEFT TO RIGHT, which is the only order in which "which comment started first"
 * has an answer. Strings are tracked too, so `"a /* b"` no longer opens one either.
 *
 * WHAT IT STILL CANNOT DO, said plainly rather than discovered later: it does not detect regular
 * expression literals, so `/[/*]/` would confuse it. The old one could not either, and no gate in
 * this repo reads a file where that appears. If one ever does, this is the place to fix it once.
 */
export function stripComments(src) {
  let out = "", i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i], d = src[i + 1];
    if (c === "/" && d === "*") {                       // block comment: drop to the closer
      const end = src.indexOf("*/", i + 2);
      i = end === -1 ? n : end + 2;
      continue;
    }
    if (c === "/" && d === "/") {                       // line comment: drop to the newline
      const end = src.indexOf("\n", i);
      i = end === -1 ? n : end;                          // keep the newline itself
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {          // a string is not a comment
      out += c; i++;
      while (i < n) {
        if (src[i] === "\\") { out += src[i] + (src[i + 1] || ""); i += 2; continue; }
        out += src[i];
        if (src[i] === c) { i++; break; }
        i++;
      }
      continue;
    }
    out += c; i++;
  }
  return out;
}
