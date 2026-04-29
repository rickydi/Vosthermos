CREATE TABLE "client_follow_ups" (
    "id" SERIAL NOT NULL,
    "clientId" INTEGER,
    "title" TEXT NOT NULL,
    "source" TEXT,
    "status" TEXT NOT NULL DEFAULT 'to_call',
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "contactName" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "service" TEXT,
    "estimateAmount" DECIMAL(10,2),
    "estimateSentAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "jobCompletedAt" TIMESTAMP(3),
    "nextAction" TEXT,
    "nextActionDate" TIMESTAMP(3),
    "lostReason" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_follow_ups_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "client_follow_ups_clientId_idx" ON "client_follow_ups"("clientId");
CREATE INDEX "client_follow_ups_status_idx" ON "client_follow_ups"("status");
CREATE INDEX "client_follow_ups_nextActionDate_idx" ON "client_follow_ups"("nextActionDate");
CREATE INDEX "client_follow_ups_updatedAt_idx" ON "client_follow_ups"("updatedAt");

ALTER TABLE "client_follow_ups" ADD CONSTRAINT "client_follow_ups_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
