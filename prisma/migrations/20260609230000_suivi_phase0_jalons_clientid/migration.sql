-- Phase 0 refonte suivi clients.
-- 1) Jalons horodatés + issue (outcome) sur les suivis.
-- 2) clientId (FK) sur les RDV et les conversations de chat -> remplace le matching flou.
-- SQL idempotent (IF NOT EXISTS / garde sur contrainte) : non cassant, ré-exécutable.

ALTER TABLE "client_follow_ups" ADD COLUMN IF NOT EXISTS "contactedAt" TIMESTAMP(3);
ALTER TABLE "client_follow_ups" ADD COLUMN IF NOT EXISTS "visitDoneAt" TIMESTAMP(3);
ALTER TABLE "client_follow_ups" ADD COLUMN IF NOT EXISTS "invoicedAt" TIMESTAMP(3);
ALTER TABLE "client_follow_ups" ADD COLUMN IF NOT EXISTS "outcome" TEXT NOT NULL DEFAULT 'open';

ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "clientId" INTEGER;
ALTER TABLE "chat_conversations" ADD COLUMN IF NOT EXISTS "clientId" INTEGER;

CREATE INDEX IF NOT EXISTS "appointments_clientId_idx" ON "appointments"("clientId");
CREATE INDEX IF NOT EXISTS "chat_conversations_clientId_idx" ON "chat_conversations"("clientId");

DO $$ BEGIN
  ALTER TABLE "appointments" ADD CONSTRAINT "appointments_clientId_fkey"
    FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "chat_conversations" ADD CONSTRAINT "chat_conversations_clientId_fkey"
    FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
