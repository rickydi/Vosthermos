#!/bin/bash
# Envoie les SMS de secours (WhatsApp non confirme apres 10 min) arrives a
# echeance. Independant d'un onglet admin ouvert : lance par cron toutes les
# 2 minutes. Voir src/app/api/admin/internal-notify/route.js (action process-due).
cd /home/vosthermo/vosthermos_app || exit 1
SECRET=$(grep -E '^INTERNAL_NOTIFY_CRON_SECRET=' .env | cut -d= -f2-)
if [ -z "$SECRET" ]; then echo "$(date '+%F %T') ERREUR: INTERNAL_NOTIFY_CRON_SECRET manquant"; exit 1; fi
curl -s -X POST "http://localhost:3002/api/admin/internal-notify?secret=$SECRET" \
  -H "Content-Type: application/json" \
  -d '{"action":"process-due"}' \
  --max-time 60
echo ""
