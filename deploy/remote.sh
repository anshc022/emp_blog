#!/usr/bin/env bash
# The VM half of deploy/deploy.sh. Runs as root on the VM with the commit as $1 and the build
# output already at /tmp/spill-next.tgz. Does no building.
#
# Idempotent: the first run creates the service user, directories and fresh secrets — generated
# here, never printed, never leaving the machine. Every run checks out the commit, installs
# dependencies only if the lockfile changed, swaps in the build and restarts.
set -euo pipefail

COMMIT="$1"
REPO="https://github.com/anshc022/emp_blog.git"
APP=/opt/spill
DATA=/var/lib/spill
ETC=/etc/spill
BUNDLE=/tmp/spill-next.tgz

[ -f "$BUNDLE" ] || { echo "no build at $BUNDLE — run deploy/deploy.sh from your machine" >&2; exit 1; }

id spill >/dev/null 2>&1 || useradd --system --home-dir "$APP" --shell /usr/sbin/nologin spill
install -d -o spill -g spill -m 750 "$DATA"
install -d -o root -g spill -m 750 "$ETC"
if [ ! -f "$ETC/spill.env" ]; then
  ( umask 027
    {
      echo "SESSION_SECRET=$(openssl rand -base64 32)"
      echo "TEAMDESK_API_URL=https://35-200-237-138.nip.io"
      echo "TEAMDESK_APP_KEY=$(openssl rand -hex 24)"
    } > "$ETC/spill.env" )
  chown root:spill "$ETC/spill.env"
  chmod 640 "$ETC/spill.env"
  echo "created $ETC/spill.env with fresh secrets"
fi

if [ ! -d "$APP/.git" ]; then
  install -d -o spill -g spill "$APP"
  sudo -u spill git clone --quiet "$REPO" "$APP" </dev/null
fi
sudo -u spill git -C "$APP" fetch --quiet origin </dev/null
sudo -u spill git -C "$APP" checkout --quiet --force "$COMMIT" </dev/null
echo "checked out $(sudo -u spill git -C "$APP" log -1 --format='%h %s' </dev/null)"

# Dependencies are light next to a build, but still only redone when the lockfile moved.
LOCK_HASH="$(sha256sum "$APP/package-lock.json" | cut -d' ' -f1)"
if [ ! -d "$APP/node_modules" ] || [ "$(cat "$DATA/.installed-lock" 2>/dev/null)" != "$LOCK_HASH" ]; then
  echo "installing dependencies"
  sudo -u spill bash -c "cd '$APP' && nice -n 19 npm ci --no-audit --no-fund --loglevel=error" </dev/null
  echo "$LOCK_HASH" > "$DATA/.installed-lock"
else
  echo "dependencies unchanged"
fi

rm -rf "$APP/.next.new"
install -d -o spill -g spill "$APP/.next.new"
tar -xzf "$BUNDLE" -C "$APP/.next.new" --strip-components=1
chown -R spill:spill "$APP/.next.new"
rm -rf "$APP/.next.old"
[ -d "$APP/.next" ] && mv "$APP/.next" "$APP/.next.old"
mv "$APP/.next.new" "$APP/.next"
rm -f "$BUNDLE"

install -m 644 "$APP/deploy/spill.service" /etc/systemd/system/spill.service
systemctl daemon-reload
systemctl enable --quiet spill
systemctl restart spill

for _ in $(seq 1 30); do
  if curl -sf -o /dev/null http://172.17.0.1:3100/login; then
    rm -rf "$APP/.next.old"
    echo "spill is up on 172.17.0.1:3100"
    exit 0
  fi
  sleep 1
done
journalctl -u spill -n 40 --no-pager
exit 1
