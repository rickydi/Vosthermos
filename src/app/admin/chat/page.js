import ChatPanel from "./ChatPanel";

export const metadata = { robots: "noindex, nofollow" };

export default function AdminChatPage() {
  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-extrabold admin-text mb-6">Chat clients</h1>
      <ChatPanel />
    </div>
  );
}
