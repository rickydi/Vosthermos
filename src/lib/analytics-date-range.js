const ANALYTICS_TIME_ZONE = "America/Montreal";

function offsetMinutesFor(instant, timeZone = ANALYTICS_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    timeZoneName: "longOffset",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(instant);
  const value = parts.find((part) => part.type === "timeZoneName")?.value || "GMT";
  const match = value.match(/^GMT([+-])(\d{2})(?::?(\d{2}))?$/);
  if (!match) return 0;
  const sign = match[1] === "-" ? -1 : 1;
  return sign * ((Number(match[2]) * 60) + Number(match[3] || 0));
}

function zonedMidnightUtc(year, month, day) {
  const guess = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  const offset = offsetMinutesFor(guess);
  const firstPass = new Date(guess.getTime() - offset * 60_000);
  const correctedOffset = offsetMinutesFor(firstPass);
  return new Date(guess.getTime() - correctedOffset * 60_000);
}

function addDays(year, month, day, days) {
  const date = new Date(Date.UTC(year, month - 1, day + days, 12, 0, 0, 0));
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

export function toMontrealDate(value) {
  return new Date(value).toLocaleDateString("en-CA", { timeZone: ANALYTICS_TIME_ZONE });
}

export function analyticsDateRange(searchParams) {
  const requestedDate = searchParams.get("date");
  const dateMatch = requestedDate?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateMatch) {
    const year = Number(dateMatch[1]);
    const month = Number(dateMatch[2]);
    const day = Number(dateMatch[3]);
    const next = addDays(year, month, day, 1);
    return {
      date: requestedDate,
      days: 1,
      since: zonedMidnightUtc(year, month, day),
      until: zonedMidnightUtc(next.year, next.month, next.day),
    };
  }

  const parsedDays = parseInt(searchParams.get("days") || "7", 10);
  const days = Number.isFinite(parsedDays) ? Math.max(0, Math.min(parsedDays, 365)) : 7;
  const now = new Date();

  if (days === 0) {
    const today = toMontrealDate(now);
    const [year, month, day] = today.split("-").map(Number);
    return {
      date: today,
      days,
      since: zonedMidnightUtc(year, month, day),
      until: now,
    };
  }

  const since = new Date(now);
  since.setDate(since.getDate() - days);
  return { date: null, days, since, until: null };
}

export function analyticsDailyKeys(range) {
  if (range.date) return [range.date];

  const keys = [];
  const loopDays = range.days === 0 ? 1 : range.days;
  for (let i = loopDays - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    keys.push(toMontrealDate(date));
  }
  return keys;
}
