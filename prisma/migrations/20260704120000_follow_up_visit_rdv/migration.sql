-- Suivi clients : visite planifiée avec rendez-vous (visitStatus='rdv') et
-- passage libre (visitStatus='anytime'). Date + créneau du RDV stockés sur le
-- suivi pour l'affichage direct dans la liste. SQL idempotent.

ALTER TABLE "client_follow_ups" ADD COLUMN IF NOT EXISTS "visitScheduledAt" TIMESTAMP(3);
ALTER TABLE "client_follow_ups" ADD COLUMN IF NOT EXISTS "visitTimeSlot" TEXT;
