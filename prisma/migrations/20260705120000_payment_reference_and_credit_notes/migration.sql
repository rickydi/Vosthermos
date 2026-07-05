-- Paiements : n° de confirmation Moneris (ou n° cheque / ref virement) + cle d'idempotence
ALTER TABLE "work_order_payments" ADD COLUMN "reference" TEXT;
ALTER TABLE "work_order_payments" ADD COLUMN "clientKey" TEXT;
CREATE UNIQUE INDEX "work_order_payments_clientKey_key" ON "work_order_payments"("clientKey");

-- Notes de credit / recus de remboursement (snapshot comptable fige)
CREATE TABLE "credit_notes" (
    "id" SERIAL NOT NULL,
    "number" TEXT NOT NULL,
    "workOrderId" INTEGER,
    "invoiceNumber" TEXT NOT NULL,
    "clientId" INTEGER,
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT,
    "reason" TEXT,
    "refundMethod" TEXT,
    "refundRef" TEXT,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "tps" DECIMAL(10,2) NOT NULL,
    "tvq" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credit_notes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "credit_notes_number_key" ON "credit_notes"("number");
CREATE INDEX "credit_notes_workOrderId_idx" ON "credit_notes"("workOrderId");
CREATE INDEX "credit_notes_issuedAt_idx" ON "credit_notes"("issuedAt");

ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
