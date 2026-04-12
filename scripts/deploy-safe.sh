#!/bin/bash
# Atomic-swap deploy for vosthermos
# - Builds to .next.new while pm2 keeps serving the old .next
# - Only swaps + reloads if build succeeded
# - On failure, site stays up untouched

set -e

APP_NAME="vosthermos"
APP_DIR="/home/vosthermo/vosthermos_app"
LOCKFILE="/tmp/vost-deploy.lock"

cd "$APP_DIR"

# Prevent concurrent deploys
exec 200>"$LOCKFILE"
flock -n 200 || { echo "[deploy] another deploy is running"; exit 1; }

echo "[deploy] git pull"
git pull origin master

echo "[deploy] cleaning old .next.new"
rm -rf .next.new

echo "[deploy] building into .next.new (webpack, heap 1536MB)"
NODE_OPTIONS="--max-old-space-size=1536" NEXT_DIST_DIR=".next.new" npm run build

if [ ! -f .next.new/BUILD_ID ]; then
  echo "[deploy] BUILD FAILED — no BUILD_ID found, pm2 untouched"
  rm -rf .next.new
  exit 1
fi

echo "[deploy] swapping .next.new -> .next"
rm -rf .next.old
[ -d .next ] && mv .next .next.old
mv .next.new .next

echo "[deploy] pm2 reload $APP_NAME"
pm2 reload "$APP_NAME" --update-env

echo "[deploy] cleanup old build"
rm -rf .next.old

echo "[deploy] done"
