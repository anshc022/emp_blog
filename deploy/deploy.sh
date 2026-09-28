#!/usr/bin/env bash
# Deploy spill. on the TeamDesk VM.   sudo bash deploy.sh [branch]      (default: main)
#
# Idempotent: the first run creates the service user, the data and secrets directories and fresh
# secrets; every run checks out the branch, builds it as the service user and restarts. Secrets are
# generated here and never leave the machine — nothing prints them.
set -euo pipefail

REF="${1:-main}"
REPO="https://github.com/anshc022/emp_blog.git"
APP=/opt/spill
DATA=/var/lib/spill
ETC=/etc/spill

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
  sudo -u spill git clone --quiet "$REPO" "$APP"
fi
sudo -u spill git -C "$APP" fetch --quiet origin
sudo -u spill git -C "$APP" checkout --quiet --force "origin/$REF"
echo "building $(sudo -u spill git -C "$APP" log -1 --format='%h %s')"

# Build against a throwaway database: the build imports the app, which opens one.
sudo -u spill bash -c "cd '$APP' && npm ci --no-audit --no-fund --loglevel=error \
  && NODE_ENV=production SESSION_SECRET=build-only DATABASE_PATH='$APP/.build.db' npx next build >/dev/null \
  && rm -f '$APP'/.build.db*"

install -m 644 "$APP/deploy/spill.service" /etc/systemd/system/spill.service
systemctl daemon-reload
systemctl enable --quiet spill
systemctl restart spill

for _ in $(seq 1 30); do
  curl -sf -o /dev/null http://172.17.0.1:3100/login && { echo "spill is up on 172.17.0.1:3100"; exit 0; }
  sleep 1
done
journalctl -u spill -n 40 --no-pager
exit 1
