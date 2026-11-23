import assert from "node:assert/strict";
import test from "node:test";
import { doctorCategories } from "../app/doctors/doctorCategories.ts";
import { findPublicDoctorCategory, getPublicDoctorCategories, matchesPublicDoctorCategory } from "../lib/publicDoctorSpecialties.ts";

test("canonical public categories keep their order when oncology is available or hidden", () => {
  assert.deepEqual(getPublicDoctorCategories([]), doctorCategories.filter(({ value }) => value !== "group:oncology"));
  assert.deepEqual(getPublicDoctorCategories([{ specialty: "Кардіолог, терапевт, Лікар УЗД серця, Уролог-онколог, Ортопед-травматолог" }]), doctorCategories);
});

test("oncology directions require a published oncology specialty", () => {
  const otherDoctors = [
    { specialty: "Уролог-онколог", isActive: false },
    { specialty: "Рентгенолог", biography: "Викладає на кафедрі онкології." },
    { specialty: "Рентгенолог, онкологічна візуалізація" },
  ];
  const aliases = ["Онкологія", "group:oncology"];
  const categories = getPublicDoctorCategories(otherDoctors);
  for (const alias of aliases) assert.equal(findPublicDoctorCategory(alias, categories), undefined);

  for (const specialty of ["Онкологія", "Онколог", "Уролог-онколог, к.мед.н."]) {
    const active = getPublicDoctorCategories([...otherDoctors, { specialty, isActive: true }]);
    for (const alias of aliases) {
      const oncology = findPublicDoctorCategory(alias, active);
      assert.equal(oncology?.value, "group:oncology");
      assert.ok(matchesPublicDoctorCategory(specialty, oncology));
      assert.equal(matchesPublicDoctorCategory("Рентгенолог, онкологічна візуалізація", oncology), false);
    }
  }
});

test("only active doctors add new individual specialties, without degrees or qualifiers", () => {
  const categories = getPublicDoctorCategories([
    { specialty: "Проктолог-хірург, д.м.н., професор, дитячий і дорослий" },
    { specialty: " проктолог-хірург , К.мед.н., доцент, дитячий та дорослий" },
    { specialty: "Нейрохірург", isActive: false },
    { specialty: "Гепатолог, доктор медичних наук, кандидат медичних наук" },
  ]);
  assert.deepEqual(categories.filter(({ specialty }) => specialty).map(({ label }) => label), ["Гепатолог", "Проктолог-хірург"]);
});

test("unknown half of compound specialty and pediatric specialty keep a dedicated filter", () => {
  const categories = getPublicDoctorCategories([{ specialty: "Кардіолог-аритмолог, Дитячий проктолог" }]);
  assert.deepEqual(categories.filter(({ specialty }) => specialty).map(({ label }) => label), ["Дитячий проктолог", "Кардіолог-аритмолог"]);
});

test("a dynamic filter matches every doctor with the exact individual specialty", () => {
  const category = getPublicDoctorCategories([{ specialty: "Проктолог-хірург" }]).find(({ label }) => label === "Проктолог-хірург");
  assert.ok(category);
  assert.equal(matchesPublicDoctorCategory("Проктолог-хірург, к.мед.н., доцент", category), true);
  assert.equal(matchesPublicDoctorCategory("Кардіолог, проктолог-хірург", category), true);
  assert.equal(matchesPublicDoctorCategory("Хірург", category), false);
  assert.equal(matchesPublicDoctorCategory("Проктолог-хірург-онколог", category), false);
  assert.equal(category.value, "specialty:проктолог-хірург");
  assert.deepEqual(category.urlAliases, ["проктолог-хірург"]);
});

test("existing canonical groups retain compound and child matching", () => {
  const categories = getPublicDoctorCategories([]);
  assert.equal(matchesPublicDoctorCategory("Уролог-онколог", categories.find(({ value }) => value === "group:urology")), true);
  assert.equal(matchesPublicDoctorCategory("Дитячий проктолог", categories.find(({ value }) => value === "group:pediatrics")), true);
});

test("shared specialty URLs accept case, spaces and typographic hyphen variants", () => {
  const categories = getPublicDoctorCategories([{ specialty: "Проктолог-хірург" }]);
  for (const value of ["ПРОКТОЛОГ–ХІРУРГ", "  проктолог - хірург ", "specialty:Проктолог-хірург"]) {
    assert.equal(findPublicDoctorCategory(value, categories)?.value, "specialty:проктолог-хірург");
  }
  assert.equal(findPublicDoctorCategory("Кардіологія", categories)?.value, "group:cardiology");
  assert.equal(findPublicDoctorCategory("GROUP:CARDIOLOGY", categories)?.value, "group:cardiology");
  assert.equal(findPublicDoctorCategory("невідомий", categories), undefined);
});
