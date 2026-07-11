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

echo "[deploy] installing dependencies"
npm install

echo "[deploy] applying prisma migrations"
npx prisma migrate deploy

echo "[deploy] generating prisma client"
npx prisma generate

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

# Conserver les assets statiques du build precedent: les pages en cache chez
# Google/CDN referencent encore les anciens chunks CSS/JS hashes. Sans ca,
# Googlebot recevait des 404 sur /_next/static/css/* et rendait les pages SANS
# styles pendant des jours (mesure dans les logs). Les noms sont hashes -> zero
# collision; -n = ne jamais ecraser un fichier du nouveau build.
if [ -d .next.old/static ]; then
  echo "[deploy] preserving previous build static assets (no-clobber merge)"
  cp -rn .next.old/static/. .next/static/ 2>/dev/null || true
fi

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
# Appel DIRECT a api.indexnow.org : la route /api/indexnow exige desormais une
# session admin (requireAdmin) et refuserait ce ping non authentifie.
INDEXNOW_KEY="vosthermos-indexnow-key-2026"
INDEXNOW_FULL_URLS=$(echo "$INDEXNOW_URLS" | sed 's|"/|"https://www.vosthermos.com/|g')
curl -s -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json" \
  -d "{\"host\": \"www.vosthermos.com\", \"key\": \"$INDEXNOW_KEY\", \"keyLocation\": \"https://www.vosthermos.com/$INDEXNOW_KEY.txt\", \"urlList\": $INDEXNOW_FULL_URLS}" \
  -o /dev/null -w "[deploy] IndexNow HTTP %{http_code} (200/202 = ok)" \
  --max-time 30 || echo "[deploy] IndexNow ping failed (non-critical)"
echo ""

echo "[deploy] done"
