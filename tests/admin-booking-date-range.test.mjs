import assert from "node:assert/strict";
import test from "node:test";
import { spawnSync } from "node:child_process";
import {
  bookingDatePresets, formatBookingRange, getBookingMonthDays, getBookingPresetRange,
  getKyivToday, isBookingDate, shiftBookingDate, shiftBookingMonth,
} from "../app/admin/bookings/bookingDateRange.ts";

test("preset list exposes each supported quick range once with Ukrainian labels", () => {
  assert.deepEqual(bookingDatePresets.map(({ id }) => id), [
    "today", "yesterday", "this-week", "last-week", "7", "14", "this-month", "last-month", "30", "all",
  ]);
  assert.ok(bookingDatePresets.every(({ label }) => /[А-Яа-яІіЇїЄє]/u.test(label)));
});

test("date validation rejects rollover, non-ISO and impossible dates including century leap years", () => {
  for (const date of ["2024-02-29", "2000-02-29", "2026-11-03", "0099-12-31", "9999-12-31"]) {
    assert.equal(isBookingDate(date), true, date);
  }
  for (const date of [
    "2026-02-29", "1900-02-29", "2100-02-29", "2026-04-31", "2026-13-01",
    "2026-00-01", "2026-01-00", "2026-01-32", "2026-1-03", "03.11.2026",
    "2026-11-03T00:00:00Z", "2026-11-03 ", "0000-01-01", "", null, undefined,
  ]) assert.equal(isBookingDate(date), false, String(date));
});

test("today follows Kyiv midnight in winter and summer rather than UTC midnight", () => {
  for (const [instant, expected] of [
    ["2026-11-02T21:59:59Z", "2026-11-02"], ["2026-11-02T22:00:00Z", "2026-11-03"],
    ["2026-07-01T20:59:59Z", "2026-07-01"], ["2026-07-01T21:00:00Z", "2026-07-02"],
    ["2025-12-31T22:00:00Z", "2026-01-01"],
    ["2026-03-29T00:59:59Z", "2026-03-29"], ["2026-03-29T01:00:00Z", "2026-03-29"],
  ]) assert.equal(getKyivToday(new Date(instant)), expected, instant);
  assert.throws(() => getKyivToday(new Date("invalid")), RangeError);
});

test("day arithmetic crosses leap days, DST dates and year boundaries without skipping days", () => {
  for (const [date, offset, expected] of [
    ["2024-02-28", 1, "2024-02-29"], ["2024-03-01", -1, "2024-02-29"],
    ["2026-02-28", 1, "2026-03-01"], ["2026-03-28", 2, "2026-03-30"],
    ["2026-10-24", 2, "2026-10-26"], ["2025-12-31", 1, "2026-01-01"],
    ["2026-01-01", -1, "2025-12-31"], ["0099-12-31", 1, "0100-01-01"],
    ["2026-11-03", 0, "2026-11-03"],
  ]) assert.equal(shiftBookingDate(date, offset), expected);
  for (const [date, offset] of [["2026-02-30", 1], ["2026-11-03", 0.5], ["2026-11-03", Infinity], ["9999-12-31", 1], ["0001-01-01", -1]]) {
    assert.throws(() => shiftBookingDate(date, offset), RangeError);
  }
});

test("rolling ranges are inclusive of today and yesterday is exactly one calendar day", () => {
  assert.deepEqual(getBookingPresetRange("today", "2026-11-03"), { from: "2026-11-03", to: "2026-11-03" });
  assert.deepEqual(getBookingPresetRange("yesterday", "2026-01-01"), { from: "2025-12-31", to: "2025-12-31" });
  assert.deepEqual(getBookingPresetRange("7", "2026-11-03"), { from: "2026-10-28", to: "2026-11-03" });
  assert.deepEqual(getBookingPresetRange("14", "2026-11-03"), { from: "2026-10-21", to: "2026-11-03" });
  assert.deepEqual(getBookingPresetRange("30", "2026-03-01"), { from: "2026-01-31", to: "2026-03-01" });
  assert.deepEqual(getBookingPresetRange("all", "2026-11-03"), { from: "", to: "" });
});

test("weeks run Monday through Sunday, cross year boundaries and current week stops today", () => {
  assert.deepEqual(getBookingPresetRange("this-week", "2026-01-01"), { from: "2025-12-29", to: "2026-01-01" });
  assert.deepEqual(getBookingPresetRange("last-week", "2026-01-01"), { from: "2025-12-22", to: "2025-12-28" });
  assert.deepEqual(getBookingPresetRange("this-week", "2026-03-01"), { from: "2026-02-23", to: "2026-03-01" });
  assert.deepEqual(getBookingPresetRange("this-week", "2026-03-02"), { from: "2026-03-02", to: "2026-03-02" });
  assert.deepEqual(getBookingPresetRange("last-week", "2026-03-02"), { from: "2026-02-23", to: "2026-03-01" });
});

test("month presets use real month endings, include leap day, and never include future dates", () => {
  assert.deepEqual(getBookingPresetRange("this-month", "2026-11-03"), { from: "2026-11-01", to: "2026-11-03" });
  assert.deepEqual(getBookingPresetRange("last-month", "2024-03-15"), { from: "2024-02-01", to: "2024-02-29" });
  assert.deepEqual(getBookingPresetRange("last-month", "2025-03-01"), { from: "2025-02-01", to: "2025-02-28" });
  assert.deepEqual(getBookingPresetRange("last-month", "2026-01-01"), { from: "2025-12-01", to: "2025-12-31" });
  for (const today of ["2024-02-29", "2026-01-01", "2026-03-29", "2026-10-25", "2026-11-03"]) {
    for (const { id } of bookingDatePresets) {
      const range = getBookingPresetRange(id, today);
      assert.ok(range.from <= range.to && range.to <= today, `${id}: ${today}`);
    }
  }
  assert.throws(() => getBookingPresetRange("today", "2026-02-30"), RangeError);
  assert.throws(() => getBookingPresetRange("custom", "2026-11-03"), RangeError);
});

test("month navigation always returns the first day across short months and multiple years", () => {
  assert.equal(shiftBookingMonth("2026-01-01", -1), "2025-12-01");
  assert.equal(shiftBookingMonth("2024-02-01", 1), "2024-03-01");
  assert.equal(shiftBookingMonth("2026-12-01", 14), "2028-02-01");
  assert.equal(shiftBookingMonth("2026-11-01", 0), "2026-11-01");
  for (const [month, offset] of [["2026-11-03", 1], ["2026-02-30", 1], ["2026-11-01", 0.5], ["9999-12-01", 1]]) {
    assert.throws(() => shiftBookingMonth(month, offset), RangeError);
  }
});

test("calendar grids use Monday-first alignment and 42 cells padded only with null", () => {
  for (const [month, firstIndex, dayCount] of [
    ["2021-02-01", 0, 28], ["2024-02-01", 3, 29], ["2026-11-01", 6, 30], ["2020-08-01", 5, 31],
  ]) {
    const cells = getBookingMonthDays(month);
    assert.equal(cells.length, 42);
    assert.deepEqual(cells.slice(0, firstIndex), Array(firstIndex).fill(null));
    assert.deepEqual(cells.slice(firstIndex, firstIndex + dayCount), Array.from({ length: dayCount }, (_, i) => `${month.slice(0, 7)}-${String(i + 1).padStart(2, "0")}`));
    assert.deepEqual(cells.slice(firstIndex + dayCount), Array(42 - firstIndex - dayCount).fill(null));
  }
  assert.throws(() => getBookingMonthDays("2026-11-03"), RangeError);
});

test("range labels collapse a single day, preserve both endpoints and handle all time", () => {
  assert.equal(formatBookingRange({ from: "2026-11-03", to: "2026-11-03" }), "03.11.2026");
  assert.equal(formatBookingRange({ from: "2026-11-01", to: "2026-11-03" }), "01.11.2026 — 03.11.2026");
  assert.equal(formatBookingRange({ from: "", to: "" }), "За весь час");
  for (const range of [
    { from: "2026-11-03", to: "" }, { from: "", to: "2026-11-03" },
    { from: "2026-02-30", to: "2026-03-03" }, { from: "2026-11-03", to: "2026-11-01" },
  ]) assert.throws(() => formatBookingRange(range), RangeError);
});

test("calendar computations do not depend on the user's system time zone", () => {
  const moduleUrl = new URL("../app/admin/bookings/bookingDateRange.ts", import.meta.url).href;
  const script = `import { getKyivToday, shiftBookingDate, getBookingPresetRange } from ${JSON.stringify(moduleUrl)};
    console.log(JSON.stringify([getKyivToday(new Date('2026-11-02T22:00:00Z')), shiftBookingDate('2026-03-28', 2), getBookingPresetRange('this-week', '2026-01-01')]));`;
  for (const TZ of ["UTC", "America/Los_Angeles", "Pacific/Kiritimati", "Europe/Kyiv"]) {
    const result = spawnSync(process.execPath, ["--experimental-strip-types", "--input-type=module", "-e", script], {
      env: { ...process.env, TZ }, encoding: "utf8",
    });
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(JSON.parse(result.stdout), ["2026-11-03", "2026-03-30", { from: "2025-12-29", to: "2026-01-01" }], TZ);
  }
});
