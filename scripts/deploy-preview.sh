#!/usr/bin/env bash
#
# Deploy the current working tree to the TEMPORARY preview site.
#
#   scripts/deploy-preview.sh "commit message"
#
# ============================================================================
#  WHY THIS SCRIPT EXISTS — read before "simplifying" it
# ============================================================================
#
# Two separate Claude sessions have now come within one command of publishing
# this repo's CNAME file into the preview repo. Both were hand-rolling an
# rsync. The second one caught it only because `git status` was read carefully
# before pushing; there was nothing stopping it.
#
# WHAT WOULD HAVE HAPPENED. CNAME contains `playpastrypirates.com`. GitHub
# Pages treats a CNAME file as a claim on that custom domain. Two repositories
# claiming one domain does not "merge" or "fail safe" — GitHub unsets the
# domain on the loser, and the LIVE GAME goes down for real players. Recovery
# means re-adding the domain and waiting on DNS/certificate re-issue, which is
# not instant. This is a production outage caused by a preview deploy.
#
# It is an easy mistake precisely because everything about it looks right:
# the preview repo IS a copy of this repo, so "copy everything across" is the
# obvious instinct, and CNAME is a 21-byte file nobody scrolls to in a
# 130-file diff.
#
# So the rule is mechanical, not remembered: DO NOT hand-roll this sync.
# Use this script. It refuses to copy CNAME, and it verifies afterwards that
# no CNAME reached the checkout — belt and braces, because the whole point is
# that the human/model doing the deploy is the part that failed twice.
#
set -euo pipefail

PREVIEW_REPO="wyattroy/pastrypirates-v13-preview"
SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MSG="${1:-Update preview}"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

# SITE-IDENTITY FILES. None of these ever leave this repo: each one tells the outside world
# "this deployment is playpastrypirates.com", which is a lie on the preview and an actively
# harmful one. rsync protects --exclude'd paths from --delete, so the preview keeps its OWN
# versions of these rather than losing them.
#
# robots.txt/sitemap.xml were added after the first real run of this script republished them:
# the preview carries `Disallow: /` to stay out of search, and this repo's copy says `Allow: /`
# plus a sitemap pointing at the live domain. Copying them across would have invited Google to
# index the preview as duplicate content competing with the real game — the same failure as
# CNAME wearing different clothes, and it went unnoticed until the deploy diff was read.
#
# ============================================================================
#  THE SECOND HALF OF THE EXCLUDES IS DERIVED, NOT TYPED — added 2026-08-26
# ============================================================================
# This list was hand-kept, written 2026-08-02, and by 2026-08-26 it had rotted
# into a live hazard: the QA runs that landed after it produced
#   seed-drill-shots  4.1G
#   sea-trial-shots   3.1G
#   crew-phone-shots  546M
#   mp-rig-shots      6.5M
# — 7.7 GB of probe screenshots, every one of them ALREADY in .gitignore and
# none of them in this list. rsync copies the WORKING TREE, not the index, so
# `.gitignore` does not protect a preview deploy. Running this script that day
# would have pushed 7.7 GB into the preview repo.
#
# That is the same shape as the two faults found the same day (a doc-check
# scanning a hand-kept list of five files; a profile ignore listing three of
# seven names): A HAND-KEPT LIST OF WHAT TO EXCLUDE ROTS EXACTLY LIKE THE THING
# IT GUARDS, AND NOTHING SAYS SO. So the transient-output half is now derived
# from .gitignore itself — one place says what is junk, and this follows it.
#
# WHAT IS NOT DERIVED, AND MUST NEVER BE. The site-identity files and the
# tracked directories below are excluded EXPLICITLY, because they are NOT in
# .gitignore and never will be: CNAME/robots.txt/sitemap.xml are tracked on
# purpose (they identify the live site), and .planning/, .claude/ and
# art-review/ are tracked on purpose too. Deriving these away would be the
# outage this script exists to prevent.
EXCLUDES=(
  --exclude=CNAME          # ← THE ONE THAT MATTERS. See the header.
  --exclude=robots.txt     # preview must stay Disallow:/ — do not publish the live Allow:/
  --exclude=sitemap.xml    # lists playpastrypirates.com URLs; meaningless on the preview
  --exclude=.git/
  --exclude=.planning/
  --exclude=.claude/
  --exclude=art-review/
  --exclude=notes/
  --exclude=node_modules/
  --exclude=.DS_Store
)

# Everything .gitignore calls junk is junk here too. Comments and blank lines
# dropped; negations (!foo) skipped rather than mis-translated, because rsync's
# include/exclude ordering is not git's and a wrong guess here is silent.
while IFS= read -r pat; do
  case "$pat" in
    ''|'#'*|'!'*) continue ;;
  esac
  EXCLUDES+=( "--exclude=$pat" )
done < "$SRC/.gitignore"

echo "    excludes: ${#EXCLUDES[@]} (3 site-identity + tracked dirs + everything .gitignore lists)"

echo "==> preview deploy: $PREVIEW_REPO"
[ -f "$SRC/CNAME" ] && echo "    (this repo owns CNAME -> $(cat "$SRC/CNAME") — it will NOT be copied)"

git -C "$SRC" diff --quiet || echo "    note: working tree has uncommitted changes; deploying them as-is"

gh repo clone "$PREVIEW_REPO" "$WORK/preview" -- -q
rsync -a --delete "${EXCLUDES[@]}" "$SRC/" "$WORK/preview/"

# --- the guard. Never remove; this is the whole reason the script exists. ---
if [ -e "$WORK/preview/CNAME" ]; then
  echo "FATAL: a CNAME reached the preview checkout." >&2
  echo "       Publishing it would contest playpastrypirates.com and can take" >&2
  echo "       the LIVE game offline. Refusing to push. Fix the excludes." >&2
  exit 1
fi
if git -C "$WORK/preview" ls-files --error-unmatch CNAME >/dev/null 2>&1; then
  echo "FATAL: CNAME is tracked in the preview repo already — remove it there first." >&2
  exit 1
fi
echo "    guard passed: no CNAME in the preview checkout"

cd "$WORK/preview"
if git diff --quiet && git diff --cached --quiet && [ -z "$(git status --porcelain)" ]; then
  echo "==> nothing changed; not pushing."
  exit 0
fi
git add -A
git status --short | sed 's/^/    /'
git commit -q -m "$MSG"
git push -q origin HEAD:main
echo "==> pushed. https://wyattroy.github.io/pastrypirates-v13-preview/"
echo "    (GitHub Pages takes a minute or two to rebuild.)"
