ALTER TABLE "work_orders"
ADD COLUMN IF NOT EXISTS "quotePaymentSchedule" JSONB;
