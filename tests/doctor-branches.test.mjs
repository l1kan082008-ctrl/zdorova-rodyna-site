import assert from "node:assert/strict";
import test from "node:test";
import { splitDoctorBranches, joinDoctorBranches, doctorBookingHref } from "../lib/doctorBranches.ts";

test("branch lists preserve commas inside full addresses and legacy single addresses", () => {
  const first = "м. Рівне, вул. Тестова, 1, каб. 219";
  const second = "м. Рівне, вул. Прикладова, 2";
  assert.deepEqual(splitDoctorBranches(first), [first]);
  assert.deepEqual(splitDoctorBranches(` ${first}\r\n\n${second}\n${first} `), [first, second]);
  assert.equal(joinDoctorBranches([first, second, first]), `${first}\n${second}`);
  assert.equal(joinDoctorBranches([]), "");
  assert.deepEqual(splitDoctorBranches(" \n "), []);
});

test("doctor booking links preserve doctor identity and optional service without query injection", () => {
  const doctor = { id: "test-id", name: "Лікар & тест" };
  const link = new URL(doctorBookingHref(doctor, "Консультація & УЗД"), "https://example.invalid");
  assert.equal(link.pathname, "/contacts");
  assert.equal(link.searchParams.get("doctor"), doctor.name);
  assert.equal(link.searchParams.get("doctorId"), doctor.id);
  assert.equal(link.searchParams.get("service"), "Консультація & УЗД");
  assert.equal(link.searchParams.size, 3);
  assert.equal(link.hash, "#booking");
});
