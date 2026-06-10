-- Distingue la source des relevés SEO (serper legacy vs gsc). Additif, non cassant.
ALTER TABLE "seo_rankings" ADD COLUMN IF NOT EXISTS "source" TEXT NOT NULL DEFAULT 'serper';
CREATE INDEX IF NOT EXISTS "seo_rankings_source_checkedAt_idx" ON "seo_rankings"("source", "checkedAt");
