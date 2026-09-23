const kyivDateTime = new Intl.DateTimeFormat("uk-UA", {
  timeZone: "Europe/Kyiv",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

export function formatBookingDateTime(value: string | null | undefined): {
  dateTime?: string;
  label: string;
} {
  const unavailable = { label: "Дата недоступна" };
  if (typeof value !== "string") return unavailable;

  // Legacy SQLite dates are UTC without a suffix. PostgreSQL dates include
  // an offset and may have microseconds; normalize both to browser-safe ISO.
  const parts = value.trim().match(
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?(Z|[+-]\d{2}(?::?\d{2})?)?$/i,
  );
  if (!parts) return unavailable;

  const [, year, month, day, hour, minute, second, fraction, offset] = parts;
  const daysInMonth = new Date(Date.UTC(Number(year), Number(month), 0)).getUTCDate();
  if (Number(month) < 1 || Number(month) > 12 || Number(day) < 1 || Number(day) > daysInMonth
    || Number(hour) > 23 || Number(minute) > 59 || Number(second) > 59) return unavailable;

  let zone = offset?.toUpperCase() || "Z";
  if (/^[+-]\d{2}$/.test(zone)) zone += ":00";
  else if (/^[+-]\d{4}$/.test(zone)) zone = `${zone.slice(0, 3)}:${zone.slice(3)}`;
  const milliseconds = fraction ? `.${fraction.slice(0, 3).padEnd(3, "0")}` : "";
  const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}${milliseconds}${zone}`);
  if (!Number.isFinite(date.getTime())) return unavailable;
  return { dateTime: date.toISOString(), label: kyivDateTime.format(date) };
}
