#!/bin/bash
# SessionStart hook — cloud-container browser setup for Pastry Pirates QA.
#
# WHY (docs/GIT-AND-DEPLOY.md §7, proven 2026-08-21): the cloud container routes HTTPS
# through a TLS-inspecting egress proxy. curl works out of the box; Chromium does not:
#   1. Chromium reads its own cert store (NSS), which starts empty — the proxy's CAs
#      must be imported or every external page fails cert verification.
#   2. The egress gateway RESETS Chromium's TLS 1.3 ClientHello mid-handshake
#      (net_error -101; curl's TLS 1.3 passes). Capping Chromium at TLS 1.2 works and
#      keeps certificate verification fully ON.
# Without both, a crew game fails SILENTLY — Firebase never loads, Host/Join do nothing,
# and it is indistinguishable from a multiplayer bug.
#
# This hook is a no-op everywhere except Claude Code cloud containers, and is safe to
# run any number of times.
set -uo pipefail

# Only in a Claude Code remote (cloud) session — instant no-op on the laptop.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

BUNDLE="${CCR_CA_BUNDLE:-/root/.ccr/ca-bundle.crt}"
CHROME_REAL="/opt/pw-browsers/chromium"
WRAPPER="/usr/local/bin/chromium"
DB_DIR="$HOME/.pki/nssdb"
DB="sql:$DB_DIR"

# Not every cloud image has the proxy or the browser — degrade to a no-op, never fail
# the session start.
if [ ! -f "$BUNDLE" ] || [ ! -x "$CHROME_REAL" ]; then
  echo "pastrypirates cloud QA setup: skipped (no proxy CA bundle or no Chromium on this image)"
  exit 0
fi

# 1. certutil (NSS tooling). apt may need an index refresh first; tolerate failure —
#    the wrapper below is still installed, and mouse_qa/solo work without certs.
if ! command -v certutil >/dev/null 2>&1; then
  apt-get install -y libnss3-tools >/dev/null 2>&1 \
    || { apt-get update >/dev/null 2>&1; apt-get install -y libnss3-tools >/dev/null 2>&1; } \
    || true
fi

# 2. Import every cert in the proxy bundle into Chromium's NSS store. Idempotent: the
#    first bundle cert's nickname is the marker.
if command -v certutil >/dev/null 2>&1; then
  mkdir -p "$DB_DIR"
  certutil -L -d "$DB" >/dev/null 2>&1 || certutil -N -d "$DB" --empty-password >/dev/null 2>&1
  if ! certutil -L -d "$DB" 2>/dev/null | grep -q "ccr-bundle-000"; then
    TMP=$(mktemp -d)
    ( cd "$TMP" && csplit -z -f c- -b "%03d.pem" "$BUNDLE" '/-----BEGIN CERTIFICATE-----/' '{*}' >/dev/null 2>&1 )
    n=0
    for f in "$TMP"/c-*.pem; do
      [ -f "$f" ] || continue
      certutil -A -n "$(printf 'ccr-bundle-%03d' "$n")" -t "C,," -i "$f" -d "$DB" >/dev/null 2>&1 || true
      n=$((n + 1))
    done
    rm -rf "$TMP"
    echo "pastrypirates cloud QA setup: imported $n proxy CA cert(s) into $DB"
  fi
fi

# 3. TLS 1.2 wrapper, installed as `chromium` on PATH so the QA scripts' resolver
#    (scripts/lib/chrome.mjs: CHROME_BIN, then PATH) finds it with no env var needed.
cat > "$WRAPPER" <<WRAP
#!/bin/bash
# Pastry Pirates cloud QA wrapper (installed by .claude/hooks/cloud-session-start.sh).
# The egress gateway resets Chromium's TLS 1.3 hello; 1.2 passes. Verification stays ON.
exec $CHROME_REAL --ssl-version-max=tls1.2 "\$@"
WRAP
chmod +x "$WRAPPER"

# Belt and braces: also export CHROME_BIN for the session.
if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  echo "export CHROME_BIN=$WRAPPER" >> "$CLAUDE_ENV_FILE"
fi

echo "pastrypirates cloud QA setup: browser ready (wrapper $WRAPPER -> $CHROME_REAL, TLS<=1.2 via proxy, CAs in $DB)"
exit 0
