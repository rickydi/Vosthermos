-- Canal d'origine du lead : "chat" (site) ou "appel" (saisi par l'equipe).
ALTER TABLE "chat_conversations" ADD COLUMN "source" TEXT NOT NULL DEFAULT 'chat';
