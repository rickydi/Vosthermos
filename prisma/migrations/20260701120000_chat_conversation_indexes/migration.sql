-- Index pour la liste chat (tri lastMessageAt desc) et le badge sidebar
-- (count unreadCount > 0, polle toutes les 30s par onglet admin).
CREATE INDEX IF NOT EXISTS "chat_conversations_lastMessageAt_idx" ON "chat_conversations"("lastMessageAt");

CREATE INDEX IF NOT EXISTS "chat_conversations_unreadCount_idx" ON "chat_conversations"("unreadCount");
