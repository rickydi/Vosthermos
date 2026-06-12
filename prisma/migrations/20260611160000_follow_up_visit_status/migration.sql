-- Suivi clients : état de la visite (à faire / faite / sans visite).
-- visitStatus : 'todo' | 'done' | 'none' | NULL. 'done' est posé automatiquement
-- avec visitDoneAt quand le technicien arrive sur place. SQL idempotent.

ALTER TABLE "client_follow_ups" ADD COLUMN IF NOT EXISTS "visitStatus" TEXT;
