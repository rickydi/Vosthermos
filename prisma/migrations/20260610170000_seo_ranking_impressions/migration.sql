-- Stocke les impressions GSC par relevé -> permet la position MOYENNE PONDÉRÉE
-- (la vraie position vue, pondérée par le volume de recherche). Additif.
ALTER TABLE "seo_rankings" ADD COLUMN IF NOT EXISTS "impressions" INTEGER NOT NULL DEFAULT 0;
