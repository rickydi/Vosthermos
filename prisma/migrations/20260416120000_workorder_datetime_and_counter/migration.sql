-- CreateTable
CREATE TABLE "counters" (
    "key" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "counters_pkey" PRIMARY KEY ("key")
);

-- AlterTable: add new WorkOrder columns (nullable first so backfill can run)
ALTER TABLE "work_orders"
  ADD COLUMN "appointmentId"          INTEGER,
  ADD COLUMN "arrivalAt"              TIMESTAMP(3),
  ADD COLUMN "departureAt"            TIMESTAMP(3),
  ADD COLUMN "durationMinutes"        INTEGER,
  ADD COLUMN "interventionAddress"    TEXT,
  ADD COLUMN "interventionCity"       TEXT,
  ADD COLUMN "interventionPostalCode" TEXT,
  ADD COLUMN "visibleAuClient"        BOOLEAN NOT NULL DEFAULT true;

-- Backfill arrivalAt / departureAt from (date + HH:mm strings)
UPDATE "work_orders"
SET "arrivalAt" = ("date"::timestamp + ("heureArrivee" || ':00')::interval)
WHERE "heureArrivee" ~ '^[0-9]{2}:[0-9]{2}$';

UPDATE "work_orders"
SET "departureAt" = ("date"::timestamp + ("heureDepart" || ':00')::interval)
WHERE "heureDepart" ~ '^[0-9]{2}:[0-9]{2}$';

-- Backfill durationMinutes
UPDATE "work_orders"
SET "durationMinutes" = FLOOR(EXTRACT(EPOCH FROM ("departureAt" - "arrivalAt")) / 60)::int
WHERE "arrivalAt" IS NOT NULL AND "departureAt" IS NOT NULL AND "departureAt" > "arrivalAt";

-- Drop old string time columns
ALTER TABLE "work_orders"
  DROP COLUMN "heureArrivee",
  DROP COLUMN "heureDepart";

-- Unique + FK for appointmentId
CREATE UNIQUE INDEX "work_orders_appointmentId_key" ON "work_orders"("appointmentId");

ALTER TABLE "work_orders"
  ADD CONSTRAINT "work_orders_appointmentId_fkey"
  FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
