import assert from "node:assert/strict";
import test from "node:test";
import { formatBookingDateTime } from "../app/admin/bookings/bookingDateTime.ts";

test("SQLite, PostgreSQL and ISO booking timestamps preserve the same instant", () => {
  for (const input of [
    "2026-09-23 20:53:30", "2026-09-23T20:53:30Z",
    "2026-09-23 20:53:30+00", "2026-09-23 20:53:30+00:00",
    "2026-09-23T23:53:30+03:00", "2026-09-23T23:53:30+0300",
    "2026-09-23 23:53:30+03", " 2026-09-23T20:53:30.000Z ",
  ]) {
    assert.deepEqual(formatBookingDateTime(input), {
      dateTime: "2026-09-23T20:53:30.000Z", label: "23.09.2026, 23:53:30",
    }, input);
  }
});

test("PostgreSQL microseconds normalize without appending a second timezone", () => {
  assert.deepEqual(formatBookingDateTime("2026-09-23 20:53:30.123456+00"), {
    dateTime: "2026-09-23T20:53:30.123Z", label: "23.09.2026, 23:53:30",
  });
});

test("Kyiv timezone handles winter, summer and date rollover", () => {
  assert.equal(formatBookingDateTime("2026-01-23T20:53:30Z").label, "23.01.2026, 22:53:30");
  assert.equal(formatBookingDateTime("2026-07-23T20:53:30Z").label, "23.07.2026, 23:53:30");
  assert.equal(formatBookingDateTime("2026-09-23T22:30:00Z").label, "24.09.2026, 01:30:00");
});

test("missing or invalid timestamps do not show Invalid Date or invent a timestamp", () => {
  for (const input of [undefined, null, "", "  ", "not a date", "2026-09-23",
    "2026-09-23T20:53:30ZZ", "2026-02-30 20:53:30", "2026-13-23 20:53:30",
    "2026-09-00 20:53:30", "2026-09-23 24:00:00", "2026-09-23 20:53:30+25:00",
  ]) assert.deepEqual(formatBookingDateTime(input), { label: "Дата недоступна" }, String(input));
});
