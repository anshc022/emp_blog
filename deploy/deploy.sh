#!/usr/bin/env bash
# Deploy spill. to the TeamDesk VM.  Run from YOUR machine, never on the VM:
#
#     bash deploy/deploy.sh                      # deploys the commit you have checked out
#     SSH_TARGET=user@host bash deploy/deploy.sh
#
# Why the build happens here: the VM has 2 GB of RAM and runs TeamDesk. On 28 Sep 2026 a
# `next build` on it used all of that memory, TeamDesk stopped answering for about half an hour,
# and the box had to be reset from the Cloud console. The build is heavy and the result is plain
# JavaScript, so it is made here and only the output is shipped; the VM installs dependencies
# (only when the lockfile changed) and restarts. Nothing heavy runs next to TeamDesk.
set -euo pipefail
cd "$(dirname "$0")/.."

SSH_TARGET="${SSH_TARGET:-pranshuchourasia@35.200.237.138}"
SSH=(ssh -i "${SSH_KEY:-$HOME/.ssh/google_compute_engine}" -o ConnectTimeout=30)
SCP=(scp -i "${SSH_KEY:-$HOME/.ssh/google_compute_engine}" -o ConnectTimeout=30 -q)

if [ -n "$(git status --porcelain)" ]; then
  echo "commit or stash first — the VM checks out the same commit this build comes from" >&2
  exit 1
fi
COMMIT="$(git rev-parse HEAD)"
git fetch -q origin
git branch -r --contains "$COMMIT" | grep -q . || { echo "push $COMMIT first — the VM fetches it from GitHub" >&2; exit 1; }

echo "building $(git log -1 --format='%h %s') here"
npm ci --no-audit --no-fund --loglevel=error
rm -rf .next
NODE_ENV=production SESSION_SECRET=build-only DATABASE_PATH="$(mktemp -d)/build.db" npx next build >/dev/null

BUNDLE="$(mktemp -d)/spill-next.tgz"
tar -czf "$BUNDLE" --exclude='.next/cache' .next
echo "shipping $(du -h "$BUNDLE" | cut -f1) of build output"
"${SCP[@]}" "$BUNDLE" "$SSH_TARGET:/tmp/spill-next.tgz"
"${SSH[@]}" "$SSH_TARGET" "sudo bash -s $COMMIT" < deploy/remote.sh
