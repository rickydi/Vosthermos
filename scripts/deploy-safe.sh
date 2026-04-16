#!/bin/bash
# Deploy for vosthermos with rollback safety
# - Stops pm2 to free RAM during build (VPS too small for concurrent build + run)
# - Builds into .next.new
# - On success: swap .next.new -> .next and start pm2
# - On failure: keep old .next intact and restart pm2 (site comes back with previous build)

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

echo "[deploy] stopping pm2 $APP_NAME to free memory"
pm2 stop "$APP_NAME" || true

echo "[deploy] building into .next.new (webpack)"
set +e
NEXT_DIST_DIR=".next.new" npm run build
BUILD_EXIT=$?
set -e

if [ $BUILD_EXIT -ne 0 ] || [ ! -f .next.new/BUILD_ID ]; then
  echo "[deploy] BUILD FAILED (exit=$BUILD_EXIT) — restoring old build"
  rm -rf .next.new
  pm2 start "$APP_NAME"
  exit 1
fi

echo "[deploy] swapping .next.new -> .next"
rm -rf .next.old
[ -d .next ] && mv .next .next.old
mv .next.new .next

echo "[deploy] starting pm2 $APP_NAME"
pm2 start "$APP_NAME"

echo "[deploy] cleanup .next.old"
rm -rf .next.old

# Wait for pm2 app to be ready
sleep 8

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
