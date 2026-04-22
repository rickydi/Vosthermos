-- Building model
CREATE TABLE "buildings" (
  "id" SERIAL NOT NULL,
  "clientId" INTEGER NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "address" TEXT,
  "position" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "buildings_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "buildings_clientId_code_key" ON "buildings"("clientId", "code");
CREATE INDEX "buildings_clientId_idx" ON "buildings"("clientId");
ALTER TABLE "buildings" ADD CONSTRAINT "buildings_clientId_fkey"
  FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Extend ClientUnit with buildingId
ALTER TABLE "client_units" ADD COLUMN "buildingId" INTEGER;
CREATE INDEX "client_units_buildingId_idx" ON "client_units"("buildingId");
ALTER TABLE "client_units" ADD CONSTRAINT "client_units_buildingId_fkey"
  FOREIGN KEY ("buildingId") REFERENCES "buildings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- UnitOpening (fenêtres/portes)
CREATE TABLE "unit_openings" (
  "id" SERIAL NOT NULL,
  "unitId" INTEGER NOT NULL,
  "type" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "description" TEXT,
  "photoUrl" TEXT,
  "year" INTEGER,
  "brand" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ok',
  "position" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "unit_openings_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "unit_openings_unitId_idx" ON "unit_openings"("unitId");
ALTER TABLE "unit_openings" ADD CONSTRAINT "unit_openings_unitId_fkey"
  FOREIGN KEY ("unitId") REFERENCES "client_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ManagerUser
CREATE TABLE "manager_users" (
  "id" SERIAL NOT NULL,
  "email" TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "phone" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "lastLoginAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "manager_users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "manager_users_email_key" ON "manager_users"("email");
CREATE INDEX "manager_users_email_idx" ON "manager_users"("email");

-- ManagerClient (m2m)
CREATE TABLE "manager_clients" (
  "managerId" INTEGER NOT NULL,
  "clientId" INTEGER NOT NULL,
  "permissions" TEXT[] NOT NULL DEFAULT ARRAY['view_work_orders','view_invoices','request_intervention']::TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "manager_clients_pkey" PRIMARY KEY ("managerId","clientId")
);
CREATE INDEX "manager_clients_clientId_idx" ON "manager_clients"("clientId");
ALTER TABLE "manager_clients" ADD CONSTRAINT "manager_clients_managerId_fkey"
  FOREIGN KEY ("managerId") REFERENCES "manager_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "manager_clients" ADD CONSTRAINT "manager_clients_clientId_fkey"
  FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ManagerSession
CREATE TABLE "manager_sessions" (
  "token" TEXT NOT NULL,
  "managerId" INTEGER NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "userAgent" TEXT,
  "ip" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "manager_sessions_pkey" PRIMARY KEY ("token")
);
CREATE INDEX "manager_sessions_managerId_idx" ON "manager_sessions"("managerId");
CREATE INDEX "manager_sessions_expiresAt_idx" ON "manager_sessions"("expiresAt");
ALTER TABLE "manager_sessions" ADD CONSTRAINT "manager_sessions_managerId_fkey"
  FOREIGN KEY ("managerId") REFERENCES "manager_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ManagerMagicToken
CREATE TABLE "manager_magic_tokens" (
  "token" TEXT NOT NULL,
  "managerId" INTEGER NOT NULL,
  "email" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "manager_magic_tokens_pkey" PRIMARY KEY ("token")
);
CREATE INDEX "manager_magic_tokens_managerId_idx" ON "manager_magic_tokens"("managerId");
CREATE INDEX "manager_magic_tokens_expiresAt_idx" ON "manager_magic_tokens"("expiresAt");
ALTER TABLE "manager_magic_tokens" ADD CONSTRAINT "manager_magic_tokens_managerId_fkey"
  FOREIGN KEY ("managerId") REFERENCES "manager_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
