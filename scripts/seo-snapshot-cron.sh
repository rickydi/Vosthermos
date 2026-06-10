#!/bin/bash
# Capture hebdomadaire des positions Google Search Console -> SeoRanking (source=gsc).
# Lance par cron. L'historique s'accumule (1 snapshot/semaine) et alimente la vue par ville.
cd /home/vosthermo/vosthermos_app || exit 1
SECRET=$(grep -E '^SEO_SNAPSHOT_SECRET=' .env | cut -d= -f2-)
if [ -z "$SECRET" ]; then echo "$(date '+%F %T') ERREUR: SEO_SNAPSHOT_SECRET manquant"; exit 1; fi
echo -n "$(date '+%F %T') snapshot GSC -> "
curl -s -X POST "http://localhost:3002/api/admin/seo/snapshot?secret=$SECRET" --max-time 120
echo ""
