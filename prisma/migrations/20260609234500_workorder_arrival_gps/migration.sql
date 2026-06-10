-- Phase 3 terrain : géolocalisation ponctuelle capturée au tap « Je suis arrivé » (Loi 25).
ALTER TABLE "work_orders" ADD COLUMN IF NOT EXISTS "arrivalLat" DOUBLE PRECISION;
ALTER TABLE "work_orders" ADD COLUMN IF NOT EXISTS "arrivalLng" DOUBLE PRECISION;
