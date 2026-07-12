#!/bin/bash
# Vérifie les commandes de thermos dont la date prévue est atteinte et envoie
# une seule demande de confirmation au fournisseur. La route réserve chaque
# commande avant l'envoi pour éviter les doublons si deux crons se chevauchent.
set -e

cd /home/vosthermo/vosthermos_app || exit 1
SECRET=$(grep -E '^THERMOS_ORDER_CRON_SECRET=' .env | cut -d= -f2-)

if [ -z "$SECRET" ]; then
  echo "$(date '+%F %T') ERREUR: THERMOS_ORDER_CRON_SECRET manquant"
  exit 1
fi

curl -sS -X POST "http://localhost:3002/api/admin/thermos-orders/reminders" \
  -H "Authorization: Bearer $SECRET" \
  -H "Content-Type: application/json" \
  --max-time 120
echo ""
