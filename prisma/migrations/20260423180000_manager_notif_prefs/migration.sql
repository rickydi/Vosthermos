ALTER TABLE "manager_users" ADD COLUMN IF NOT EXISTS "notifyNewInvoice" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "manager_users" ADD COLUMN IF NOT EXISTS "notifyWorkOrderScheduled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "manager_users" ADD COLUMN IF NOT EXISTS "notifyInvoiceOverdue" BOOLEAN NOT NULL DEFAULT true;
