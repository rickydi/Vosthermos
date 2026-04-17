-- CreateTable
CREATE TABLE "client_units" (
    "id"          SERIAL NOT NULL,
    "clientId"    INTEGER NOT NULL,
    "code"        TEXT NOT NULL,
    "description" TEXT,
    "notes"       TEXT,
    "isActive"    BOOLEAN NOT NULL DEFAULT true,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_units_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "client_units_clientId_code_key" ON "client_units"("clientId", "code");
CREATE INDEX "client_units_clientId_isActive_idx" ON "client_units"("clientId", "isActive");

ALTER TABLE "client_units"
  ADD CONSTRAINT "client_units_clientId_fkey"
  FOREIGN KEY ("clientId") REFERENCES "clients"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: seed units from existing work_order_sections
INSERT INTO "client_units" ("clientId", "code", "isActive", "updatedAt")
SELECT DISTINCT wo."clientId", ws."unitCode", true, CURRENT_TIMESTAMP
FROM "work_order_sections" ws
JOIN "work_orders" wo ON wo."id" = ws."workOrderId"
ON CONFLICT ("clientId", "code") DO NOTHING;
