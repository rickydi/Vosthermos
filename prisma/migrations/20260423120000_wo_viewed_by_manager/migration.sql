-- Add viewedByManagerAt to work_orders for unread indicator on gestionnaire portal
ALTER TABLE "work_orders" ADD COLUMN IF NOT EXISTS "viewedByManagerAt" TIMESTAMP(3);
