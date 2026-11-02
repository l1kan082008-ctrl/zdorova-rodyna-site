export type BookingHoursState = "open" | "closed" | "unknown";

const weekdays = ["пн", "вт", "ср", "чт", "пт", "сб", "нд"];
const formattedWeekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const kyivClock = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Kyiv",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

type Interval = { start: number; end: number };

function minutes(value: string, allowDayEnd = false): number | null {
  const [hour, minute] = value.split(":").map(Number);
  if (allowDayEnd && hour === 24 && minute === 0) return 1440;
  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59
    ? hour * 60 + minute : null;
}

/** Interpret only complete, unambiguous schedules; free-text exceptions stay unknown. */
export function getBookingHoursState(hours: readonly string[], now: Date = new Date()): BookingHoursState {
  if (!Array.isArray(hours) || !hours.length || !(now instanceof Date) || !Number.isFinite(now.getTime())) return "unknown";

  const schedule = new Map<number, Interval | null>();
  for (const raw of hours) {
    if (typeof raw !== "string") return "unknown";
    const line = raw.trim().toLocaleLowerCase("uk-UA").replace(/[\u2010-\u2015\u2212]/gu, "-");
    const match = /^(щодня|пн|вт|ср|чт|пт|сб|нд)\.?(?:\s*-\s*(пн|вт|ср|чт|пт|сб|нд)\.?)?\s*(?:[·:]\s*)?(.+)$/u.exec(line);
    if (!match || (match[1] === "щодня" && match[2])) return "unknown";

    const first = match[1] === "щодня" ? 0 : weekdays.indexOf(match[1]);
    const last = match[1] === "щодня" ? 6 : match[2] ? weekdays.indexOf(match[2]) : first;
    if (last < first) return "unknown";

    let interval: Interval | null = null;
    const details = match[3].trim().replace(/^-\s*/u, "");
    if (!/^(?:вихідний|вихідні|зачинено)$/u.test(details)) {
      const time = /^(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/u.exec(details);
      if (!time) return "unknown";
      const start = minutes(time[1]);
      const end = minutes(time[2], true);
      // Overnight shifts and overlapping definitions need an explicit structured schedule.
      if (start === null || end === null || end <= start) return "unknown";
      interval = { start, end };
    }
    for (let day = first; day <= last; day++) {
      if (schedule.has(day)) return "unknown";
      schedule.set(day, interval);
    }
  }

  const parts = kyivClock.formatToParts(now);
  const day = formattedWeekdays.indexOf(parts.find(part => part.type === "weekday")?.value ?? "");
  const hour = Number(parts.find(part => part.type === "hour")?.value);
  const minute = Number(parts.find(part => part.type === "minute")?.value);
  if (day < 0 || !Number.isFinite(hour) || !Number.isFinite(minute)) return "unknown";
  const interval = schedule.get(day);
  if (!interval) return "closed";
  const current = hour * 60 + minute;
  return current >= interval.start && current < interval.end ? "open" : "closed";
}
