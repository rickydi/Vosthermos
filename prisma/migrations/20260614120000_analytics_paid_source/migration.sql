-- Provenance payante / campagnes sur les sessions analytics.
-- gclid présent = clic Google Ads (auto-tagging). utm_* = autres campagnes.
ALTER TABLE "analytics_sessions" ADD COLUMN "gclid" TEXT;
ALTER TABLE "analytics_sessions" ADD COLUMN "utmSource" TEXT;
ALTER TABLE "analytics_sessions" ADD COLUMN "utmMedium" TEXT;
ALTER TABLE "analytics_sessions" ADD COLUMN "utmCampaign" TEXT;
