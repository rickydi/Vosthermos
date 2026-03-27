"use client";

const PAGE_COLORS = {
  "/": "#e30718",
  "/boutique": "#3b82f6",
  "/services": "#10b981",
  "/contact": "#f59e0b",
  "/panier": "#8b5cf6",
  "/checkout": "#ec4899",
  "/produit": "#06b6d4",
};

function getPageColor(page) {
  for (const [prefix, color] of Object.entries(PAGE_COLORS)) {
    if (page === prefix || page.startsWith(prefix + "/")) return color;
  }
  return "#64748b";
}

function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return "0s";
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m${s.toString().padStart(2, "0")}s`;
}

export default function JourneyTimeline({ sessions }) {
  const deviceEmoji = (d) =>
    d === "Mobile" ? "\u{1F4F1}" : d === "Tablette" ? "\u{1F4BB}" : "\u{1F5A5}\u{FE0F}";

  return (
    <div className="space-y-6">
      {sessions.map((session) => (
        <div key={session.id} className="admin-card rounded-xl p-6 border">
          {/* Session header */}
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/5">
            <span className="text-lg">{deviceEmoji(session.device)}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="admin-text font-bold text-sm">{session.browser}</span>
                {session.referrer && (
                  <span className="admin-text-muted text-[10px]">
                    via {(() => { try { return new URL(session.referrer).hostname; } catch { return session.referrer; } })()}
                  </span>
                )}
              </div>
              <span className="admin-text-muted text-xs">
                {new Date(session.startedAt).toLocaleDateString("fr-CA", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="text-right">
              <span className="admin-text-muted text-xs">{session.events.length} page{session.events.length > 1 ? "s" : ""}</span>
            </div>
          </div>

          {/* Events timeline */}
          <div className="relative ml-4">
            {/* Vertical line */}
            <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-white/10"></div>

            <div className="space-y-0">
              {session.events.map((event, i) => {
                const color = getPageColor(event.page);
                return (
                  <div key={event.id} className="relative flex items-start gap-4 py-2">
                    {/* Dot */}
                    <div
                      className="relative z-10 w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5"
                      style={{ borderColor: color, backgroundColor: i === 0 ? color : "transparent" }}
                    >
                      {i === 0 && (
                        <div className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ backgroundColor: color }}></div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex items-center justify-between min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="admin-text text-sm font-mono truncate" style={{ color }}>
                          {event.page}
                        </span>
                        {event.duration > 0 && (
                          <span className="admin-text-muted text-[10px] bg-white/5 px-1.5 py-0.5 rounded flex-shrink-0">
                            {formatDuration(event.duration)}
                          </span>
                        )}
                      </div>
                      <span className="admin-text-muted text-[10px] flex-shrink-0 ml-2">
                        {new Date(event.enteredAt).toLocaleTimeString("fr-CA", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
