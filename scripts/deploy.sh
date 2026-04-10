#!/usr/bin/env bash
#
# Deploy Vosthermos en production avec zero downtime.
#
# Usage:   ./scripts/deploy.sh
# Options: ./scripts/deploy.sh --no-pull   # skip git pull
#          ./scripts/deploy.sh --restart   # full pm2 restart instead of reload
#
# Lecons apprises (incident 2026-04-09):
# - Le serveur Edge a 4 GB RAM, 0 swap, container LXC (pas de swap possible)
# - Sans NODE_OPTIONS, npm run build OOM-kill le serveur entier (megabac+jmj+vosthermos down)
# - Le .next Turbopack n'est PAS portable entre machines (hash Prisma genere a chaque build)
#   donc on doit toujours builder sur la cible, pas en local + rsync
# - PM2 mode cluster + reload = zero downtime visible
# - mv .next .next.backup AVANT build = filet de securite si build echoue

set -euo pipefail

# ─── Config ────────────────────────────────────────────────────────
SSH_KEY="$HOME/.ssh/id_ed25519"
SSH_HOST="root@67.215.11.55"
SSH_PORT="2243"
APP_DIR="/home/vosthermo/vosthermos_app"
APP_NAME="vosthermos"
APP_URL="https://www.vosthermos.com"

# Memoire max pour Node pendant le build (le serveur a 4GB RAM, 0 swap)
NODE_MEMORY_LIMIT="2048"

# ─── Args ──────────────────────────────────────────────────────────
SKIP_PULL=false
USE_RESTART=false
for arg in "$@"; do
  case $arg in
    --no-pull) SKIP_PULL=true ;;
    --restart) USE_RESTART=true ;;
  esac
done

# ─── Helpers ───────────────────────────────────────────────────────
ssh_run() {
  ssh -i "$SSH_KEY" -p "$SSH_PORT" -o ConnectTimeout=20 -o ServerAliveInterval=10 "$SSH_HOST" "$@"
}

log()  { echo -e "\033[1;36m▶\033[0m $*"; }
ok()   { echo -e "\033[1;32m✓\033[0m $*"; }
warn() { echo -e "\033[1;33m!\033[0m $*"; }
err()  { echo -e "\033[1;31m✗\033[0m $*" >&2; }

# ─── Pre-flight check ──────────────────────────────────────────────
log "Verification du serveur..."
ssh_run "uptime ; free -m | head -2" || { err "SSH inaccessible"; exit 1; }

# ─── Git pull ──────────────────────────────────────────────────────
if [ "$SKIP_PULL" = false ]; then
  log "git pull origin master..."
  ssh_run "cd $APP_DIR && git pull origin master 2>&1 | tail -5"
else
  warn "Skip git pull"
fi

# ─── Build ─────────────────────────────────────────────────────────
log "Backup .next vers .next.backup..."
ssh_run "cd $APP_DIR && [ -d .next ] && mv .next .next.backup || true"

log "Build Next.js (NODE_OPTIONS=--max-old-space-size=$NODE_MEMORY_LIMIT)..."
if ! ssh_run "cd $APP_DIR && NODE_OPTIONS='--max-old-space-size=$NODE_MEMORY_LIMIT' npm run build 2>&1 | tail -20"; then
  err "Build a echoue. Restore du backup..."
  ssh_run "cd $APP_DIR && rm -rf .next && mv .next.backup .next 2>/dev/null || true"
  exit 1
fi

# Verifie que BUILD_ID existe (signal d'un build complet)
if ! ssh_run "test -f $APP_DIR/.next/BUILD_ID"; then
  err "Build incomplet (pas de BUILD_ID). Restore du backup..."
  ssh_run "cd $APP_DIR && rm -rf .next && mv .next.backup .next 2>/dev/null || true"
  exit 1
fi
ok "Build complet"

# ─── PM2 reload ────────────────────────────────────────────────────
if [ "$USE_RESTART" = true ]; then
  log "PM2 restart $APP_NAME..."
  ssh_run "pm2 restart $APP_NAME"
else
  log "PM2 reload $APP_NAME (zero downtime)..."
  ssh_run "pm2 reload $APP_NAME"
fi

# ─── Verification HTTP ─────────────────────────────────────────────
sleep 4
log "Verification HTTP..."
HTTP_CODE=$(ssh_run "curl -s -o /dev/null -w '%{http_code}' --max-time 10 $APP_URL/")
if [ "$HTTP_CODE" = "200" ]; then
  ok "Site UP (HTTP $HTTP_CODE)"
else
  err "Site retourne HTTP $HTTP_CODE — verifier les logs:"
  err "  ssh -i $SSH_KEY -p $SSH_PORT $SSH_HOST 'pm2 logs $APP_NAME --lines 30 --nostream'"
  exit 1
fi

# ─── Cleanup ───────────────────────────────────────────────────────
log "Cleanup .next.backup..."
ssh_run "rm -rf $APP_DIR/.next.backup"

ok "Deploy termine avec succes!"
echo
echo "  $APP_URL"
echo
