import assert from "node:assert/strict";
import test from "node:test";
import { getBookingHoursState } from "../lib/bookingHours.ts";
import { defaultSiteSettings } from "../lib/siteSettings.ts";

const hours = defaultSiteSettings.hours;
const state = (instant, schedule = hours) => getBookingHoursState(schedule, new Date(instant));

test("weekday hours include opening and exclude closing, using Kyiv winter time", () => {
  assert.equal(state("2026-11-02T05:59:59Z"), "closed");
  assert.equal(state("2026-11-02T06:00:00Z"), "open");
  assert.equal(state("2026-11-02T17:00:00Z"), "open");
  assert.equal(state("2026-11-02T17:59:59Z"), "open");
  assert.equal(state("2026-11-02T18:00:00Z"), "closed");
});

test("summer time uses Kyiv offset rather than a fixed UTC offset or device time", () => {
  assert.equal(state("2026-07-06T04:59:59Z"), "closed");
  assert.equal(state("2026-07-06T05:00:00Z"), "open");
  assert.equal(state("2026-07-06T16:59:59Z"), "open");
  assert.equal(state("2026-07-06T17:00:00Z"), "closed");
  assert.equal(state("2026-07-06T01:00:00-04:00"), "open");
});

test("Saturday closes at 17:00; Sunday is explicitly closed", () => {
  assert.equal(state("2026-11-07T14:59:59Z"), "open");
  assert.equal(state("2026-11-07T15:00:00Z"), "closed");
  assert.equal(state("2026-11-08T10:00:00Z"), "closed");
  assert.equal(state("2026-11-08T10:00:00Z", ["Пн–Сб 08:00–20:00"]), "closed");
  assert.equal(state("2026-11-08T22:30:00Z"), "closed"); // Monday 00:30 in Kyiv.
});

test("configured hours, Ukrainian separators, abbreviated punctuation and explicit closed days are respected", () => {
  const custom = [" ПН. — ПТ. · 09:30 — 18:15 ", "Сб: 10:00-13:00", "Нд · вихідний"];
  assert.equal(state("2026-11-02T07:29:59Z", custom), "closed");
  assert.equal(state("2026-11-02T07:30:00Z", custom), "open");
  assert.equal(state("2026-11-02T16:15:00Z", custom), "closed");
  assert.equal(state("2026-11-07T08:00:00Z", custom), "open");
  assert.equal(state("2026-11-08T09:00:00Z", custom), "closed");
  assert.equal(state("2026-11-07T09:00:00Z", ["Пн–Пт 08:00–19:00", "Сб–Нд: зачинено"]), "closed");
  assert.equal(state("2026-11-08T09:00:00Z", ["Сб–Нд вихідні"]), "closed");
});

test("daily schedules and midnight use local calendar time", () => {
  assert.equal(state("2026-11-08T10:00:00Z", ["Щодня 08:00–19:00"]), "open");
  assert.equal(state("2026-11-08T22:00:00Z", ["Щодня 00:00–24:00"]), "open");
  assert.equal(state("2026-11-08T22:00:00Z", ["Пн 00:00–01:00"]), "open");
  assert.equal(state("2026-11-08T23:00:00Z", ["Пн 00:00–01:00"]), "closed");
});

test("both sides of Kyiv daylight-saving transitions use the correct local hour", () => {
  const sunday = ["Нд 03:00–04:00"];
  assert.equal(state("2026-10-25T00:30:00Z", sunday), "open");
  assert.equal(state("2026-10-25T01:30:00Z", sunday), "open");
  assert.equal(state("2026-10-25T02:00:00Z", sunday), "closed");
  assert.equal(state("2026-03-29T00:59:59Z", sunday), "closed");
  assert.equal(state("2026-03-29T01:00:00Z", sunday), "closed"); // 03:00 is skipped.
});

test("unknown text, ambiguous day definitions and invalid time ranges never claim closure", () => {
  for (const schedule of [
    [], [""], ["Графік уточнюйте"], ["08:00–19:00"],
    ["Пн–Пт 08:00–19:00", "Сб за попереднім записом"],
    ["Пн–Пт 08:00–19:00", "Пт 09:00–18:00"],
    ["Щодня 08:00–19:00", "Нд вихідний"],
    ["Пн 08:00–12:00", "Пн 13:00–19:00"],
    ["Пн–Пт 19:00–08:00"], ["Пн 08:00–08:00"],
    ["Пн 24:00–25:00"], ["Пн 08:60–19:00"], ["Пн 08:00–24:01"],
    ["Пн 8–19"], ["Нд–Пн 08:00–19:00"], ["Щодня–Пт 08:00–19:00"],
    ["Пн–Пт 08:00–19:00 (крім свят)"], [null],
  ]) assert.equal(state("2026-11-08T10:00:00Z", schedule), "unknown", JSON.stringify(schedule));
  assert.equal(getBookingHoursState(hours, new Date(NaN)), "unknown");
  assert.equal(getBookingHoursState(null, new Date()), "unknown");
});
