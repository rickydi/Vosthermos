ALTER TABLE "clients" ADD COLUMN "friendly_email" BOOLEAN NOT NULL DEFAULT false;

UPDATE "clients"
SET "friendly_email" = true
WHERE "type" = 'gestionnaire';
