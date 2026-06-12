-- Suivi clients : type de soumission (écrite = document dans le système, téléphone = verbale).
-- estimateType : 'written' | 'phone' | NULL. 'written' est posé automatiquement quand une
-- vraie soumission (WorkOrder en statut quote) est liée au suivi. SQL idempotent.

ALTER TABLE "client_follow_ups" ADD COLUMN IF NOT EXISTS "estimateType" TEXT;
