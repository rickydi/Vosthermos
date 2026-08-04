-- App mobile « Appels » : un enregistrement par telephone d'associe.
-- Le jeton n'est jamais stocke en clair (tokenHash), et un appareil perdu se
-- revoque sans toucher au compte admin de la personne.

CREATE TABLE "app_devices" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "platform" TEXT NOT NULL DEFAULT 'android',
  "model" TEXT,
  "appVersion" TEXT,
  "tokenHash" TEXT NOT NULL,
  "activationCode" TEXT,
  "activationExpiresAt" TIMESTAMP(3),
  "activatedAt" TIMESTAMP(3),
  "lastSeenAt" TIMESTAMP(3),
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "app_devices_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "app_devices_tokenHash_key" ON "app_devices"("tokenHash");
CREATE UNIQUE INDEX "app_devices_activationCode_key" ON "app_devices"("activationCode");
CREATE INDEX "app_devices_revokedAt_idx" ON "app_devices"("revokedAt");
