CREATE TABLE "admin_activity_logs" (
  "id" SERIAL PRIMARY KEY,
  "admin_user_id" INTEGER,
  "admin_email" TEXT,
  "action" TEXT NOT NULL,
  "entity_type" TEXT NOT NULL,
  "entity_id" TEXT,
  "label" TEXT,
  "metadata" JSONB,
  "ip_address" TEXT,
  "user_agent" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "admin_activity_logs_admin_user_id_fkey"
    FOREIGN KEY ("admin_user_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "admin_activity_logs_admin_user_id_created_at_idx" ON "admin_activity_logs"("admin_user_id", "created_at");
CREATE INDEX "admin_activity_logs_entity_type_entity_id_idx" ON "admin_activity_logs"("entity_type", "entity_id");
CREATE INDEX "admin_activity_logs_action_idx" ON "admin_activity_logs"("action");
CREATE INDEX "admin_activity_logs_created_at_idx" ON "admin_activity_logs"("created_at");
