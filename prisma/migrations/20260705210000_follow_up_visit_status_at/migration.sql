-- Moment ou l'etat de visite a ete coche : ancre les chronos SLA sur la coche
-- plutot que sur le vieux contactedAt.
ALTER TABLE "client_follow_ups" ADD COLUMN "visitStatusAt" TIMESTAMP(3);
