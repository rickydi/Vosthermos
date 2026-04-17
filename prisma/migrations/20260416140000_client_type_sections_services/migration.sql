-- Add Client.type
ALTER TABLE "clients" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'particulier';
CREATE INDEX "clients_type_idx" ON "clients"("type");

-- CreateTable: WorkOrderSection
CREATE TABLE "work_order_sections" (
    "id" SERIAL NOT NULL,
    "workOrderId" INTEGER NOT NULL,
    "unitCode" TEXT NOT NULL,
    "notes" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "work_order_sections_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "work_order_sections_workOrderId_idx" ON "work_order_sections"("workOrderId");

ALTER TABLE "work_order_sections"
  ADD CONSTRAINT "work_order_sections_workOrderId_fkey"
  FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable: add sectionId + serviceId to WorkOrderItem
ALTER TABLE "work_order_items"
  ADD COLUMN "sectionId" INTEGER,
  ADD COLUMN "serviceId" INTEGER;

CREATE INDEX "work_order_items_sectionId_idx" ON "work_order_items"("sectionId");

-- CreateTable: Service
CREATE TABLE "services" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPreset" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "services_code_key" ON "services"("code");
CREATE INDEX "services_category_idx" ON "services"("category");
CREATE INDEX "services_isActive_idx" ON "services"("isActive");

-- ForeignKeys: WorkOrderItem.sectionId / .serviceId
ALTER TABLE "work_order_items"
  ADD CONSTRAINT "work_order_items_sectionId_fkey"
  FOREIGN KEY ("sectionId") REFERENCES "work_order_sections"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "work_order_items"
  ADD CONSTRAINT "work_order_items_serviceId_fkey"
  FOREIGN KEY ("serviceId") REFERENCES "services"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed initial services based on Marronier patterns
INSERT INTO "services" ("code", "name", "category", "price", "isActive", "isPreset", "position", "updatedAt") VALUES
  ('thermo-petit',    'Thermo petit (jusqu''a 30")',  'thermo',        250.00, true, true,  10, CURRENT_TIMESTAMP),
  ('thermo-moyen',    'Thermo moyen (30-40")',        'thermo',        300.00, true, true,  20, CURRENT_TIMESTAMP),
  ('thermo-grand',    'Thermo grand (40-50")',        'thermo',        550.00, true, true,  30, CURRENT_TIMESTAMP),
  ('thermo-xl',       'Thermo XL (50"+)',             'thermo',        750.00, true, true,  40, CURRENT_TIMESTAMP),
  ('thermo-fixe',     'Thermo fixe',                  'thermo',        300.00, true, false, 50, CURRENT_TIMESTAMP),
  ('install-std',     'Installation standard',        'installation',   90.00, true, true,  10, CURRENT_TIMESTAMP),
  ('install-grande',  'Installation grande (41"+)',   'installation',  200.00, true, false, 20, CURRENT_TIMESTAMP),
  ('ajust-barrure',   'Ajustement barrure porte',     'ajustement',    120.00, true, true,  10, CURRENT_TIMESTAMP),
  ('ajust-fenetre',   'Ajustement fenetre',           'ajustement',     30.00, true, false, 20, CURRENT_TIMESTAMP),
  ('ajust-lock',      'Ajustement lock + plaquette',  'ajustement',    120.00, true, false, 30, CURRENT_TIMESTAMP),
  ('balai-porte',     'Balai de porte',               'quincaillerie', 160.00, true, true,  10, CURRENT_TIMESTAMP),
  ('manivelle',       'Manivelle + poignee plinthe',  'quincaillerie', 160.00, true, true,  20, CURRENT_TIMESTAMP),
  ('roulettes-mous',  'Roulettes porte moustiquaire', 'quincaillerie',  80.00, true, false, 30, CURRENT_TIMESTAMP),
  ('coupe-froide',    'Coupe froide patin',           'quincaillerie', 275.00, true, false, 40, CURRENT_TIMESTAMP),
  ('barrure-fenetre', 'Barrure fenetre',              'quincaillerie',  80.00, true, false, 50, CURRENT_TIMESTAMP),
  ('verre-secu',      'Verre securite + moulures alu','vitre',         750.00, true, false, 10, CURRENT_TIMESTAMP),
  ('fenetre-kit',     'Fenetre: charnieres+manivelle+ajust', 'autre',  390.00, true, false, 10, CURRENT_TIMESTAMP);
