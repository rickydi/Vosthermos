ALTER TABLE "work_orders"
ADD COLUMN IF NOT EXISTS "quoteDepositPercent" DECIMAL(5, 2);
