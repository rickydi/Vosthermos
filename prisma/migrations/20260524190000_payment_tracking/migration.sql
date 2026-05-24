ALTER TABLE "work_orders"
  ADD COLUMN IF NOT EXISTS "invoiceIssuedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "invoiceSentAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "paymentDueAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "paidAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT,
  ADD COLUMN IF NOT EXISTS "paymentNotes" TEXT;

UPDATE "work_orders"
SET "invoiceIssuedAt" = COALESCE("invoiceIssuedAt", "date")
WHERE "statut" IN ('invoiced', 'sent', 'paid');

UPDATE "work_orders" wo
SET "paymentDueAt" = COALESCE(
  wo."paymentDueAt",
  COALESCE(wo."invoiceIssuedAt", wo."date") + (COALESCE(c."paymentTermsDays", 30) || ' days')::interval
)
FROM "clients" c
WHERE wo."clientId" = c."id"
  AND wo."statut" IN ('invoiced', 'sent', 'paid');

UPDATE "work_orders"
SET "invoiceSentAt" = COALESCE("invoiceSentAt", "updatedAt")
WHERE "statut" IN ('sent', 'paid');

UPDATE "work_orders"
SET "paidAt" = COALESCE("paidAt", "updatedAt")
WHERE "statut" = 'paid';

CREATE INDEX IF NOT EXISTS "work_orders_paymentDueAt_idx" ON "work_orders"("paymentDueAt");
CREATE INDEX IF NOT EXISTS "work_orders_paidAt_idx" ON "work_orders"("paidAt");
