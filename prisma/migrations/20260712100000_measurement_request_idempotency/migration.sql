ALTER TABLE "thermos_measurements"
  ADD COLUMN "idempotencyKey" TEXT,
  ADD COLUMN "publicTokenVersion" INTEGER NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX "thermos_measurements_idempotencyKey_key"
  ON "thermos_measurements"("idempotencyKey");
