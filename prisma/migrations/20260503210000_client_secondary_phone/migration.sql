ALTER TABLE "clients" ADD COLUMN "secondary_phone" TEXT;

CREATE INDEX "clients_secondary_phone_idx" ON "clients"("secondary_phone");
