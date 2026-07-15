-- Suivi clients : états temporaires du menu Contact.
-- contactStatus = "voicemail" | "waiting_photos" | NULL.
-- contactStatusAt démarre le délai de relance associé à cet état.
ALTER TABLE "client_follow_ups"
  ADD COLUMN IF NOT EXISTS "contactStatus" TEXT,
  ADD COLUMN IF NOT EXISTS "contactStatusAt" TIMESTAMP(3);
