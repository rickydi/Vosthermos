#!/usr/bin/env bash
#
# Deploy Vosthermos en production avec ZERO downtime + ZERO charge sur le serveur.
#
# Strategie: build LOCAL + transfert SCP + extraction atomique sur le serveur.
# AUCUN build sur le serveur (le serveur Edge a 4 GB RAM et plante avec npm run build).
#
# Usage:   ./scripts/deploy.sh
# Options: ./scripts/deploy.sh --no-pull   # skip git pull
#          ./scripts/deploy.sh --no-build  # skip local build (utilise .next existant)
#
# ─── Lecons apprises (incidents 2026-04-09) ──────────────────────────
# 1. Le serveur Edge VPS a 4 GB RAM, 0 swap, container LXC.
#    `npm run build` Turbopack + SSG consomme >4 GB → OOM kill global du serveur.
#    Solution: builder en LOCAL ou` la RAM est dispo, transferer le .next.
#
# 2. Le .next contient des SYMLINKS vers /c/Users/... (Windows) dans
#    .next/node_modules/@prisma/client-<hash> et .next/node_modules/<pkg>-<hash>.
#    Tar preserve ces symlinks absolus qui sont casses sur Linux.
#    Solution: post-process sur le serveur — remplacer chaque symlink par
#    une copie REELLE du module + corriger le 'name' dans package.json
#    (ESM strict verifie le name du package).
#
# 3. PM2 etait configure avec --max-old-space-size=180 (180 MB heap),
#    insuffisant pour Next.js + 1316 pages SSG. Le worker crashait en boucle.
#    Solution: pm2 start avec --node-args='--max-old-space-size=1024' (1 GB).
#
# 4. PM2 reload (cluster mode) = zero downtime. PM2 restart = mini downtime.

set -euo pipefail

# ─── Config ────────────────────────────────────────────────────────
LOCAL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SSH_KEY="$HOME/.ssh/id_ed25519"
SSH_HOST="root@67.215.11.55"
SSH_PORT="2243"
APP_DIR="/home/vosthermo/vosthermos_app"
APP_NAME="vosthermos"
APP_URL="https://www.vosthermos.com"
TARBALL="next-build.tar.gz"

# ─── Args ──────────────────────────────────────────────────────────
SKIP_PULL=false
SKIP_BUILD=false
for arg in "$@"; do
  case $arg in
    --no-pull)  SKIP_PULL=true ;;
    --no-build) SKIP_BUILD=true ;;
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

# ─── 1. Pre-flight check ───────────────────────────────────────────
log "Verification du serveur..."
ssh_run "echo OK ; uptime ; free -m | head -2" > /dev/null || { err "SSH inaccessible"; exit 1; }
ok "Serveur joignable"

# ─── 2. Git pull (local) ───────────────────────────────────────────
if [ "$SKIP_PULL" = false ]; then
  log "git pull origin master (LOCAL)..."
  cd "$LOCAL_DIR"
  git pull origin master 2>&1 | tail -3
fi

# ─── 3. Build LOCAL ────────────────────────────────────────────────
if [ "$SKIP_BUILD" = false ]; then
  log "Build local (Next.js Turbopack)..."
  cd "$LOCAL_DIR"
  rm -rf .next
  if ! npm run build > /tmp/vosthermos-build.log 2>&1; then
    err "Build local a echoue. Voir /tmp/vosthermos-build.log"
    tail -30 /tmp/vosthermos-build.log
    exit 1
  fi
  if [ ! -f "$LOCAL_DIR/.next/BUILD_ID" ]; then
    err "Pas de BUILD_ID apres le build local"
    exit 1
  fi
  ok "Build local OK ($(du -sh .next | cut -f1))"
fi

# ─── 4. Tar + compression ──────────────────────────────────────────
log "Compression du .next..."
cd "$LOCAL_DIR"
rm -f "$TARBALL"
tar czf "$TARBALL" .next
ok "Tarball: $(du -sh "$TARBALL" | cut -f1)"

# ─── 5. SCP upload ─────────────────────────────────────────────────
log "Upload vers $SSH_HOST:/tmp/..."
scp -i "$SSH_KEY" -P "$SSH_PORT" -o ConnectTimeout=20 "$TARBALL" "$SSH_HOST:/tmp/" > /dev/null
ok "Upload OK"

# ─── 6. Sync git sur le serveur (pour cohérence du code source) ────
log "git pull origin master (SERVEUR)..."
ssh_run "cd $APP_DIR && git pull origin master 2>&1 | tail -3"

# ─── 7. Extraction atomique + fix symlinks Windows ─────────────────
log "Extraction du .next sur le serveur (atomique)..."
ssh_run "
set -e
cd $APP_DIR
# Backup du .next actuel (filet de securite)
if [ -d .next ]; then mv .next .next.backup; fi

# Extraction dans un dossier temporaire
mkdir -p .next.tmp
cd .next.tmp
tar xzf /tmp/$TARBALL
# Le tar contient un dossier '.next' a la racine, on remonte d'un niveau
if [ -d .next ]; then
  mv .next/* . 2>/dev/null || true
  mv .next/.[^.]* . 2>/dev/null || true
  rmdir .next
fi
cd ..
mv .next.tmp .next
" > /dev/null
ok "Extraction OK"

# ─── 8. Fix Windows symlinks dans .next/node_modules ───────────────
log "Fix des symlinks Windows + names ESM..."
ssh_run "
set -e
cd $APP_DIR/.next/node_modules 2>/dev/null || exit 0

# Trouver tous les symlinks et les remplacer par des copies reelles
# Pattern attendu: <package-name>-<hash16> ou @scope/<name>-<hash16>
fixed=0
for link in \$(find . -type l 2>/dev/null); do
  hashed_name=\$(basename \"\$link\")
  # Extraire le vrai nom de package (avant le hash de 16 hex)
  real_name=\$(echo \"\$hashed_name\" | sed -E 's/-[a-f0-9]{16}\$//')
  # Si scope @prisma, garder le scope
  parent_dir=\$(dirname \"\$link\")
  if [ \"\$parent_dir\" = \"./@prisma\" ] || [ \"\$parent_dir\" = \"@prisma\" ]; then
    real_pkg_path=\"$APP_DIR/node_modules/@prisma/\$real_name\"
    full_hashed_name=\"@prisma/\$hashed_name\"
  else
    real_pkg_path=\"$APP_DIR/node_modules/\$real_name\"
    full_hashed_name=\"\$hashed_name\"
  fi

  if [ -d \"\$real_pkg_path\" ]; then
    rm -f \"\$link\"
    cp -r \"\$real_pkg_path\" \"\$link\"
    # Fix le name dans package.json pour matcher le hash (ESM strict requirement)
    if [ -f \"\$link/package.json\" ]; then
      # sed compatible Linux (in-place)
      python3 -c \"
import json,sys
p='\$link/package.json'
with open(p,'r') as f: d=json.load(f)
d['name']='\$full_hashed_name'
with open(p,'w') as f: json.dump(d,f,indent=2)
\" 2>/dev/null || true
    fi
    fixed=\$((fixed + 1))
  fi
done
echo \"Fixed \$fixed symlinks\"
" 2>&1 | tail -3
ok "Symlinks corriges"

# ─── 9. Verification BUILD_ID ──────────────────────────────────────
if ! ssh_run "test -f $APP_DIR/.next/BUILD_ID"; then
  err "Pas de BUILD_ID apres extraction. Restore du backup..."
  ssh_run "cd $APP_DIR && rm -rf .next && mv .next.backup .next 2>/dev/null || true"
  exit 1
fi

# ─── 10. PM2 reload ────────────────────────────────────────────────
log "PM2 reload $APP_NAME (zero downtime)..."
ssh_run "pm2 reload $APP_NAME --update-env" > /dev/null

# ─── 11. Verification HTTP ─────────────────────────────────────────
sleep 5
log "Verification HTTP..."
HTTP_CODE=$(ssh_run "curl -s -o /dev/null -w '%{http_code}' --max-time 10 $APP_URL/")
if [ "$HTTP_CODE" != "200" ]; then
  err "Site retourne HTTP $HTTP_CODE — Restore du backup..."
  ssh_run "pm2 stop $APP_NAME ; cd $APP_DIR && rm -rf .next && mv .next.backup .next && pm2 start $APP_NAME"
  exit 1
fi
ok "Site UP (HTTP $HTTP_CODE)"

# Test rapide d'autres routes critiques
for route in /api/promo /reparation-portes-et-fenetres/boucherville /services/remplacement-vitre-thermos/saint-jerome; do
  CODE=$(curl -s -o /dev/null -w '%{http_code}' --max-time 8 "$APP_URL$route")
  printf "  %-55s %s\n" "$route" "$CODE"
done

# ─── 12. Cleanup ───────────────────────────────────────────────────
log "Cleanup..."
ssh_run "rm -rf $APP_DIR/.next.backup /tmp/$TARBALL"
rm -f "$LOCAL_DIR/$TARBALL"

ok "Deploy termine avec succes!"
echo
echo "  $APP_URL"
echo
