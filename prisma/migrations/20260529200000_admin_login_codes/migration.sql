CREATE TABLE "admin_login_codes" (
  "id" SERIAL NOT NULL,
  "adminUserId" INTEGER NOT NULL,
  "codeHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3),
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "ipAddress" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "admin_login_codes_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "admin_login_codes_adminUserId_createdAt_idx" ON "admin_login_codes"("adminUserId", "createdAt");
CREATE INDEX "admin_login_codes_expiresAt_idx" ON "admin_login_codes"("expiresAt");

ALTER TABLE "admin_login_codes"
  ADD CONSTRAINT "admin_login_codes_adminUserId_fkey"
  FOREIGN KEY ("adminUserId") REFERENCES "admin_users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
