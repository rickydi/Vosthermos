ALTER TABLE "work_orders"
  ADD COLUMN "followUpId" INTEGER;

CREATE INDEX "work_orders_followUpId_idx" ON "work_orders"("followUpId");

ALTER TABLE "work_orders"
  ADD CONSTRAINT "work_orders_followUpId_fkey"
  FOREIGN KEY ("followUpId") REFERENCES "client_follow_ups"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
