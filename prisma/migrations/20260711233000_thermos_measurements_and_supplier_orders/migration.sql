-- Structured thermos measurements, configurable suppliers, and supplier-order follow-up.

CREATE TABLE "thermos_measurements" (
    "id" SERIAL NOT NULL,
    "clientId" INTEGER NOT NULL,
    "followUpId" INTEGER,
    "workOrderId" INTEGER,
    "technicianId" INTEGER,
    "parentId" INTEGER,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "accuracy" TEXT NOT NULL DEFAULT 'approximate',
    "revision" INTEGER NOT NULL DEFAULT 1,
    "data" JSONB NOT NULL,
    "windowCount" INTEGER NOT NULL DEFAULT 0,
    "paneCount" INTEGER NOT NULL DEFAULT 0,
    "publicTokenHash" TEXT,
    "publicTokenExpiresAt" TIMESTAMP(3),
    "requestedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3),
    "validatedAt" TIMESTAMP(3),
    "aiAnalysisCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "thermos_measurements_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "thermos_suppliers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "contactName" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "leadTimeDays" INTEGER NOT NULL DEFAULT 21,
    "autoFollowUpEnabled" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "thermos_suppliers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "thermos_orders" (
    "id" SERIAL NOT NULL,
    "number" TEXT NOT NULL,
    "supplierId" INTEGER NOT NULL,
    "measurementId" INTEGER,
    "clientId" INTEGER,
    "followUpId" INTEGER,
    "workOrderId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "revision" INTEGER NOT NULL DEFAULT 1,
    "supplierNameSnapshot" TEXT NOT NULL,
    "supplierContactSnapshot" TEXT,
    "supplierEmailSnapshot" TEXT NOT NULL,
    "clientNameSnapshot" TEXT NOT NULL,
    "leadTimeDaysSnapshot" INTEGER NOT NULL,
    "sentAt" TIMESTAMP(3),
    "expectedReadyAt" TIMESTAMP(3),
    "nextReminderAt" TIMESTAMP(3),
    "lastReminderAt" TIMESTAMP(3),
    "reminderCount" INTEGER NOT NULL DEFAULT 0,
    "reminderLeaseUntil" TIMESTAMP(3),
    "lastReminderError" TEXT,
    "lastSupplierResponseAt" TIMESTAMP(3),
    "readyAt" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "thermos_orders_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "thermos_order_items" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "sourceThermosId" TEXT,
    "label" TEXT NOT NULL,
    "internalCode" TEXT NOT NULL,
    "windowNumber" INTEGER NOT NULL,
    "thermosNumber" INTEGER NOT NULL,
    "widthSixteenths" INTEGER NOT NULL,
    "heightSixteenths" INTEGER NOT NULL,
    "thicknessSixteenths" INTEGER NOT NULL,
    "options" JSONB,
    "grille" JSONB,
    "geometry" JSONB,
    "photoUrl" TEXT,
    "notes" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "thermos_order_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "thermos_order_response_tokens" (
    "id" TEXT NOT NULL,
    "orderId" INTEGER NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "thermos_order_response_tokens_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "thermos_order_events" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "actorType" TEXT NOT NULL,
    "actorLabel" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "thermos_order_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "thermos_measurements_publicTokenHash_key" ON "thermos_measurements"("publicTokenHash");
CREATE INDEX "thermos_measurements_clientId_createdAt_idx" ON "thermos_measurements"("clientId", "createdAt");
CREATE INDEX "thermos_measurements_followUpId_createdAt_idx" ON "thermos_measurements"("followUpId", "createdAt");
CREATE INDEX "thermos_measurements_workOrderId_idx" ON "thermos_measurements"("workOrderId");
CREATE INDEX "thermos_measurements_technicianId_status_idx" ON "thermos_measurements"("technicianId", "status");
CREATE INDEX "thermos_measurements_status_idx" ON "thermos_measurements"("status");

CREATE INDEX "thermos_suppliers_isActive_idx" ON "thermos_suppliers"("isActive");
CREATE INDEX "thermos_suppliers_email_idx" ON "thermos_suppliers"("email");
CREATE UNIQUE INDEX "thermos_suppliers_one_default_idx" ON "thermos_suppliers"("isDefault") WHERE "isDefault" = true;

CREATE UNIQUE INDEX "thermos_orders_number_key" ON "thermos_orders"("number");
CREATE UNIQUE INDEX "thermos_orders_one_active_per_measurement_idx" ON "thermos_orders"("measurementId") WHERE "measurementId" IS NOT NULL AND "status" NOT IN ('cancelled', 'received');
CREATE INDEX "thermos_orders_supplierId_idx" ON "thermos_orders"("supplierId");
CREATE INDEX "thermos_orders_measurementId_idx" ON "thermos_orders"("measurementId");
CREATE INDEX "thermos_orders_clientId_idx" ON "thermos_orders"("clientId");
CREATE INDEX "thermos_orders_followUpId_idx" ON "thermos_orders"("followUpId");
CREATE INDEX "thermos_orders_workOrderId_idx" ON "thermos_orders"("workOrderId");
CREATE INDEX "thermos_orders_status_idx" ON "thermos_orders"("status");
CREATE INDEX "thermos_orders_nextReminderAt_status_idx" ON "thermos_orders"("nextReminderAt", "status");

CREATE INDEX "thermos_order_items_orderId_idx" ON "thermos_order_items"("orderId");
CREATE UNIQUE INDEX "thermos_order_items_internalCode_key" ON "thermos_order_items"("internalCode");

CREATE UNIQUE INDEX "thermos_order_response_tokens_tokenHash_key" ON "thermos_order_response_tokens"("tokenHash");
CREATE INDEX "thermos_order_response_tokens_orderId_createdAt_idx" ON "thermos_order_response_tokens"("orderId", "createdAt");
CREATE INDEX "thermos_order_response_tokens_expiresAt_idx" ON "thermos_order_response_tokens"("expiresAt");

CREATE INDEX "thermos_order_events_orderId_createdAt_idx" ON "thermos_order_events"("orderId", "createdAt");

ALTER TABLE "thermos_measurements" ADD CONSTRAINT "thermos_measurements_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "thermos_measurements" ADD CONSTRAINT "thermos_measurements_followUpId_fkey" FOREIGN KEY ("followUpId") REFERENCES "client_follow_ups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "thermos_measurements" ADD CONSTRAINT "thermos_measurements_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "thermos_measurements" ADD CONSTRAINT "thermos_measurements_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "technicians"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "thermos_measurements" ADD CONSTRAINT "thermos_measurements_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "thermos_measurements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "thermos_orders" ADD CONSTRAINT "thermos_orders_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "thermos_suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "thermos_orders" ADD CONSTRAINT "thermos_orders_measurementId_fkey" FOREIGN KEY ("measurementId") REFERENCES "thermos_measurements"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "thermos_orders" ADD CONSTRAINT "thermos_orders_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "thermos_orders" ADD CONSTRAINT "thermos_orders_followUpId_fkey" FOREIGN KEY ("followUpId") REFERENCES "client_follow_ups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "thermos_orders" ADD CONSTRAINT "thermos_orders_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "thermos_order_items" ADD CONSTRAINT "thermos_order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "thermos_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "thermos_order_response_tokens" ADD CONSTRAINT "thermos_order_response_tokens_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "thermos_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "thermos_order_events" ADD CONSTRAINT "thermos_order_events_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "thermos_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
