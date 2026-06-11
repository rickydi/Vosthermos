-- Suivi clients : tentatives de contact restées sans réponse.
-- contactAttempts = nombre d'appels/contacts sans réponse (le client n'a pas répondu).
-- lastAttemptAt   = horodatage de la dernière tentative.
-- SQL idempotent (IF NOT EXISTS) : non cassant, ré-exécutable.

ALTER TABLE "client_follow_ups" ADD COLUMN IF NOT EXISTS "contactAttempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "client_follow_ups" ADD COLUMN IF NOT EXISTS "lastAttemptAt" TIMESTAMP(3);
