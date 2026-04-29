CREATE TABLE "client_photos" (
  "id" SERIAL PRIMARY KEY,
  "clientId" INTEGER,
  "followUpId" INTEGER,
  "title" TEXT,
  "notes" TEXT,
  "url" TEXT NOT NULL,
  "source" TEXT NOT NULL DEFAULT 'admin',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "client_photos_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "client_photos_followUpId_fkey" FOREIGN KEY ("followUpId") REFERENCES "client_follow_ups"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "client_photos_clientId_idx" ON "client_photos"("clientId");
CREATE INDEX "client_photos_followUpId_idx" ON "client_photos"("followUpId");
