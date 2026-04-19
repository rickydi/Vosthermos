#!/bin/bash
# Deploy for vosthermos ZERO-DOWNTIME (VPS 16GB upgrade)
# - Build into .next.new WITHOUT stopping pm2 (site continues serving old build)
# - On success: atomic swap + pm2 reload (zero-downtime, cluster mode)
# - On failure: old .next intact, no action needed (site never went down)

set -e

APP_NAME="vosthermos"
APP_DIR="/home/vosthermo/vosthermos_app"
LOCKFILE="/tmp/vost-deploy.lock"

cd "$APP_DIR"

exec 200>"$LOCKFILE"
flock -n 200 || { echo "[deploy] another deploy is running"; exit 1; }

echo "[deploy] git pull"
git pull origin master

echo "[deploy] cleaning any old .next.new"
rm -rf .next.new

echo "[deploy] building into .next.new (pm2 still serving old build = no downtime)"
set +e
NEXT_DIST_DIR=".next.new" npm run build
BUILD_EXIT=$?
set -e

if [ $BUILD_EXIT -ne 0 ] || [ ! -f .next.new/BUILD_ID ]; then
  echo "[deploy] BUILD FAILED (exit=$BUILD_EXIT) — old build still serving, no rollback needed"
  rm -rf .next.new
  exit 1
fi

echo "[deploy] atomic swap .next.new -> .next"
rm -rf .next.old
[ -d .next ] && mv .next .next.old
mv .next.new .next

echo "[deploy] zero-downtime reload pm2 $APP_NAME (cluster mode)"
pm2 reload "$APP_NAME" --update-env

echo "[deploy] cleanup .next.old"
rm -rf .next.old

# Wait for reload to settle (pm2 reload is fast, 2s is enough)
sleep 3

# Trigger IndexNow (Bing, Yandex, DuckDuckGo, Naver) with priority URLs.
# Google doesn't support IndexNow — use GSC manually for Google.
echo "[deploy] pinging IndexNow with priority URLs"
INDEXNOW_URLS='[
  "/",
  "/services",
  "/services/remplacement-vitre-thermos",
  "/services/remplacement-quincaillerie",
  "/services/reparation-porte-patio",
  "/services/reparation-porte-fenetre",
  "/services/reparation-portes-bois",
  "/services/restauration-fenetres-bois-patrimoine",
  "/portail-gestionnaire",
  "/services/moustiquaires-sur-mesure",
  "/services/calfeutrage",
  "/services/desembuage",
  "/services/insertion-porte",
  "/services/coupe-froid",
  "/outils",
  "/outils/quiz-diagnostic",
  "/outils/cout-thermos",
  "/outils/reparer-vs-remplacer",
  "/guides",
  "/guides/remplacer-roulette-porte-patio",
  "/guides/diagnostiquer-vitre-thermos-embuee",
  "/guides/ajuster-porte-patio-qui-glisse-mal",
  "/guides/reparer-moustiquaire-dechiree",
  "/guides/calfeutrer-fenetre-exterieur",
  "/guides/desembuer-vitre-thermos",
  "/guides/changer-coupe-froid-porte-patio",
  "/guides/changer-manivelle-fenetre",
  "/mcp-docs",
  "/boutique",
  "/blogue",
  "/prix",
  "/faq",
  "/diagnostic"
]'
curl -s -X POST "http://localhost:3002/api/indexnow" \
  -H "Content-Type: application/json" \
  -d "{\"urls\": $INDEXNOW_URLS}" \
  --max-time 30 || echo "[deploy] IndexNow ping failed (non-critical)"
echo ""

echo "[deploy] done"
