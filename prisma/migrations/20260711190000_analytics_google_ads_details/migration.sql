-- Attribution Google Ads detaillee. Les valeurs viennent du suffixe d'URL
-- ValueTrack configure sur les campagnes (campagne, groupe, mot-cle, appareil).
ALTER TABLE "analytics_sessions" ADD COLUMN "utmTerm" TEXT;
ALTER TABLE "analytics_sessions" ADD COLUMN "utmContent" TEXT;
ALTER TABLE "analytics_sessions" ADD COLUMN "googleAdsCampaignId" TEXT;
ALTER TABLE "analytics_sessions" ADD COLUMN "googleAdsAdGroupId" TEXT;
ALTER TABLE "analytics_sessions" ADD COLUMN "googleAdsKeyword" TEXT;
ALTER TABLE "analytics_sessions" ADD COLUMN "googleAdsMatchType" TEXT;
ALTER TABLE "analytics_sessions" ADD COLUMN "googleAdsCreativeId" TEXT;
ALTER TABLE "analytics_sessions" ADD COLUMN "googleAdsNetwork" TEXT;
ALTER TABLE "analytics_sessions" ADD COLUMN "googleAdsDevice" TEXT;

CREATE INDEX "analytics_sessions_googleAdsCampaignId_idx"
  ON "analytics_sessions"("googleAdsCampaignId");
