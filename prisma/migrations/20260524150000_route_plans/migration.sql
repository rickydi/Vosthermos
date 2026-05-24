CREATE TABLE "route_plans" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "date" DATE NOT NULL,
  "technicianId" INTEGER,
  "area" TEXT,
  "startCity" TEXT,
  "status" TEXT NOT NULL DEFAULT 'planned',
  "targetRevenue" DECIMAL(10,2),
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "route_plans_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "route_plans_date_idx" ON "route_plans"("date");
CREATE INDEX "route_plans_technicianId_idx" ON "route_plans"("technicianId");
CREATE INDEX "route_plans_status_idx" ON "route_plans"("status");

ALTER TABLE "route_plans"
  ADD CONSTRAINT "route_plans_technicianId_fkey"
  FOREIGN KEY ("technicianId") REFERENCES "technicians"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "work_orders"
  ADD COLUMN "routeId" INTEGER,
  ADD COLUMN "routePosition" INTEGER;

CREATE INDEX "work_orders_routeId_idx" ON "work_orders"("routeId");

ALTER TABLE "work_orders"
  ADD CONSTRAINT "work_orders_routeId_fkey"
  FOREIGN KEY ("routeId") REFERENCES "route_plans"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
