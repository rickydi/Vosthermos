-- Retire la cle "email" des metadata des journaux d'activite de type "auth"
-- (connexions, deconnexions, echecs). L'email de l'acteur ne doit plus etre
-- expose dans le journal; la colonne admin_email (tracabilite/anti-bruteforce)
-- est conservee. Les autres cles de metadata (ex: reason) sont preservees.
UPDATE "admin_activity_logs"
SET "metadata" = "metadata" - 'email'
WHERE "entity_type" = 'auth'
  AND "metadata" IS NOT NULL;
