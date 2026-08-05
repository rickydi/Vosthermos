-- Journal des appels recus, consigne par l'app mobile (voir modele CallEvent).
CREATE TABLE "call_events" (
  "id" SERIAL NOT NULL,
  "phoneDigits" TEXT NOT NULL,
  "clientId" INTEGER,
  "deviceId" INTEGER,
  "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "call_events_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "call_events_phoneDigits_at_idx" ON "call_events"("phoneDigits", "at");
CREATE INDEX "call_events_clientId_at_idx" ON "call_events"("clientId", "at");
