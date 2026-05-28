CREATE TABLE IF NOT EXISTS "work_order_payments" (
  "id" SERIAL PRIMARY KEY,
  "workOrderId" INTEGER NOT NULL,
  "amount" DECIMAL(10,2) NOT NULL,
  "method" TEXT,
  "note" TEXT,
  "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "work_order_payments_workOrderId_fkey"
    FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "work_order_payments_workOrderId_idx"
  ON "work_order_payments"("workOrderId");

CREATE INDEX IF NOT EXISTS "work_order_payments_paidAt_idx"
  ON "work_order_payments"("paidAt");

INSERT INTO "work_order_payments" (
  "workOrderId",
  "amount",
  "method",
  "note",
  "paidAt",
  "createdAt",
  "updatedAt"
)
SELECT
  wo."id",
  wo."total",
  COALESCE(wo."paymentMethod", 'Paiement confirme'),
  wo."paymentNotes",
  COALESCE(wo."paidAt", wo."updatedAt", CURRENT_TIMESTAMP),
  COALESCE(wo."paidAt", wo."updatedAt", CURRENT_TIMESTAMP),
  COALESCE(wo."updatedAt", CURRENT_TIMESTAMP)
FROM "work_orders" wo
WHERE wo."statut" = 'paid'
  AND COALESCE(wo."total", 0) > 0
  AND NOT EXISTS (
    SELECT 1
    FROM "work_order_payments" p
    WHERE p."workOrderId" = wo."id"
  );
