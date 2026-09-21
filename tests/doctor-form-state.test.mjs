import assert from "node:assert/strict";
import test from "node:test";
import { doctorProfileDraft, getSpecialtyOptions, splitSpecialties, upgradeLegacyDoctorDraft } from "../app/admin/doctors/doctorFormState.ts";

const doctor = {
  id: "test-doctor", name: "Тестова Лікарка", specialty: "Кардіолог, терапевт",
  experienceYears: null, consultationPrice: 0, repeatConsultationPrice: 450,
  branch: "Стара адреса прийому", description: "", biography: "",
  patientGroups: ["adults"], schedule: { mon: "09:00–15:00" }, photoUrl: "",
};

test("draft preserves both prices, including zero and unspecified values", () => {
  const draft = doctorProfileDraft(doctor);
  assert.equal(draft.consultationPrice, "0");
  assert.equal(draft.repeatConsultationPrice, "450");
  assert.equal(draft.branch, doctor.branch);
  assert.equal(doctorProfileDraft({ ...doctor, consultationPrice: null, repeatConsultationPrice: null }).repeatConsultationPrice, "");
});

test("specialty selection deduplicates case without losing an existing label", () => {
  assert.deepEqual(splitSpecialties(" Кардіолог, , терапевт, кардіолог "), ["Кардіолог", "терапевт"]);
  const options = getSpecialtyOptions(["Кардіолог, терапевт", "Терапевт, Нейрохірург"]);
  assert.equal(options.length, 3);
  assert.ok(options.includes("Нейрохірург"));
  assert.ok(options.includes("терапевт"));
});

test("old local draft is upgraded while preserving unsaved fields and timestamp", () => {
  const baseline = doctorProfileDraft(doctor);
  const oldBaseline = { ...baseline };
  delete oldBaseline.repeatConsultationPrice;
  const raw = JSON.stringify({ version: 1, baseline: JSON.stringify(oldBaseline), value: { ...oldBaseline, name: "Незбережене ім’я", consultationPrice: "700" }, updatedAt: 123 });
  const upgraded = JSON.parse(upgradeLegacyDoctorDraft(raw, baseline));
  assert.equal(upgraded.baseline, JSON.stringify(baseline));
  assert.equal(upgraded.value.name, "Незбережене ім’я");
  assert.equal(upgraded.value.consultationPrice, "700");
  assert.equal(upgraded.value.repeatConsultationPrice, "450");
  assert.equal(upgraded.updatedAt, 123);
});

test("migration does not restore stale data over a changed server profile", () => {
  const baseline = doctorProfileDraft(doctor);
  const oldBaseline = { ...baseline, name: "Попереднє ім’я" };
  delete oldBaseline.repeatConsultationPrice;
  const raw = JSON.stringify({ version: 1, baseline: JSON.stringify(oldBaseline), value: { ...oldBaseline, consultationPrice: "700" }, updatedAt: 123 });
  assert.equal(upgradeLegacyDoctorDraft(raw, baseline), raw);
});

test("current and invalid stored drafts are left to the existing safe-save policy", () => {
  const baseline = doctorProfileDraft(doctor);
  const raw = JSON.stringify({ version: 1, baseline: JSON.stringify(baseline), value: { ...baseline, repeatConsultationPrice: "500" }, updatedAt: 123 });
  assert.equal(upgradeLegacyDoctorDraft(raw, baseline), raw);
  assert.equal(upgradeLegacyDoctorDraft("invalid-json", baseline), "invalid-json");
});

test("qualifications are not offered as specialties but existing selections survive", () => {
  const values = ["Кардіолог, Д.м.н., К.мед.н., Доцент, Професор, Дитячий і дорослий", "Дитячий кардіолог"];
  assert.deepEqual(getSpecialtyOptions(values), ["Дитячий кардіолог", "Кардіолог"]);
  const selected = getSpecialtyOptions(values, "Кардіолог, К.мед.н., доцент");
  assert.ok(selected.includes("К.мед.н."));
  assert.ok(selected.some((value) => value.toLowerCase() === "доцент"));
  assert.ok(!selected.includes("Д.м.н."));
  assert.ok(!selected.includes("Дитячий і дорослий"));
});

test("visibility and order drafts keep explicit false and zero and inherit legacy ranks", () => {
  const hidden = doctorProfileDraft({ ...doctor, isActive: false, sortOrder: 0 });
  assert.equal(hidden.isActive, false);
  assert.equal(hidden.sortOrder, "0");
  const legacy = doctorProfileDraft(doctor);
  assert.equal(legacy.isActive, true);
  assert.equal(legacy.sortOrder, "1000");
  assert.equal(doctorProfileDraft({ ...doctor, id: "pochtar-kateryna" }).sortOrder, "0");
});

test("original pre-price draft gains new fields without replacing its unsaved content", () => {
  const baseline = doctorProfileDraft({ ...doctor, isActive: false, sortOrder: 0 });
  const original = { ...baseline };
  delete original.repeatConsultationPrice;
  delete original.isActive;
  delete original.sortOrder;
  delete original.showConsultationPriceOnRequest;
  const raw = JSON.stringify({ version: 1, baseline: JSON.stringify(original), value: { ...original, biography: "Незбережена біографія" }, updatedAt: 321 });
  const upgraded = JSON.parse(upgradeLegacyDoctorDraft(raw, baseline));
  assert.equal(upgraded.baseline, JSON.stringify(baseline));
  assert.equal(upgraded.value.biography, "Незбережена біографія");
  assert.equal(upgraded.value.repeatConsultationPrice, "450");
  assert.equal(upgraded.value.isActive, false);
  assert.equal(upgraded.value.sortOrder, "0");
  assert.equal(upgraded.updatedAt, 321);
});

test("previous two-price draft preserves its unsaved repeat price during visibility upgrade", () => {
  const baseline = doctorProfileDraft({ ...doctor, isActive: false, sortOrder: 12 });
  const previous = { ...baseline };
  delete previous.isActive;
  delete previous.sortOrder;
  delete previous.showConsultationPriceOnRequest;
  const raw = JSON.stringify({ version: 1, baseline: JSON.stringify(previous), value: { ...previous, repeatConsultationPrice: "550" }, updatedAt: 321 });
  const upgraded = JSON.parse(upgradeLegacyDoctorDraft(raw, baseline));
  assert.equal(upgraded.value.repeatConsultationPrice, "550");
  assert.equal(upgraded.value.isActive, false);
  assert.equal(upgraded.value.sortOrder, "12");
});

test("new-doctor browser drafts gain publication defaults without creating a record", () => {
  const baseline = { name: "", specialty: "", branch: "", consultationPrice: "", repeatConsultationPrice: "", isActive: true, sortOrder: "1000", showConsultationPriceOnRequest: false };
  const previous = { ...baseline };
  delete previous.isActive;
  delete previous.sortOrder;
  delete previous.showConsultationPriceOnRequest;
  const raw = JSON.stringify({ version: 1, baseline: JSON.stringify(previous), value: { ...previous, name: "Чернетка лікаря", specialty: "Кардіолог" }, updatedAt: 321 });
  const upgraded = JSON.parse(upgradeLegacyDoctorDraft(raw, baseline));
  assert.equal(upgraded.baseline, JSON.stringify(baseline));
  assert.equal(upgraded.value.name, "Чернетка лікаря");
  assert.equal(upgraded.value.specialty, "Кардіолог");
  assert.equal(upgraded.value.isActive, true);
  assert.equal(upgraded.value.sortOrder, "1000");
  assert.equal(upgraded.value.showConsultationPriceOnRequest, false);
});

test("a current hidden draft is not rewritten or reset to published", () => {
  const baseline = doctorProfileDraft(doctor);
  const raw = JSON.stringify({ version: 1, baseline: JSON.stringify(baseline), value: { ...baseline, isActive: false, sortOrder: "0" }, updatedAt: 321 });
  assert.equal(upgradeLegacyDoctorDraft(raw, baseline), raw);
});

test("unknown-price visibility is opt-in and remains explicit in the profile draft", () => {
  assert.equal(doctorProfileDraft(doctor).showConsultationPriceOnRequest, false);
  assert.equal(doctorProfileDraft({ ...doctor, showConsultationPriceOnRequest: false }).showConsultationPriceOnRequest, false);
  assert.equal(doctorProfileDraft({ ...doctor, showConsultationPriceOnRequest: true }).showConsultationPriceOnRequest, true);
});

test("previous publication drafts inherit the saved price opt-in without losing unsaved edits", () => {
  for (const showConsultationPriceOnRequest of [false, true]) {
    const baseline = doctorProfileDraft({ ...doctor, showConsultationPriceOnRequest });
    const previous = { ...baseline };
    delete previous.showConsultationPriceOnRequest;
    const raw = JSON.stringify({ version: 1, baseline: JSON.stringify(previous), value: { ...previous, consultationPrice: "", isActive: false, sortOrder: "0" }, updatedAt: 321 });
    const upgraded = JSON.parse(upgradeLegacyDoctorDraft(raw, baseline));
    assert.equal(upgraded.baseline, JSON.stringify(baseline));
    assert.equal(upgraded.value.showConsultationPriceOnRequest, showConsultationPriceOnRequest);
    assert.equal(upgraded.value.consultationPrice, "");
    assert.equal(upgraded.value.isActive, false);
    assert.equal(upgraded.value.sortOrder, "0");
    assert.equal(upgraded.updatedAt, 321);
  }
});

test("a current opt-in draft is retained and the opt-in participates in dirty comparisons", () => {
  const baseline = doctorProfileDraft(doctor);
  const value = { ...baseline, showConsultationPriceOnRequest: true };
  assert.notEqual(JSON.stringify(value), JSON.stringify(baseline));
  const raw = JSON.stringify({ version: 1, baseline: JSON.stringify(baseline), value, updatedAt: 321 });
  assert.equal(upgradeLegacyDoctorDraft(raw, baseline), raw);
  const saved = doctorProfileDraft({ ...doctor, showConsultationPriceOnRequest: true });
  assert.equal(JSON.stringify(value), JSON.stringify(saved));
});

test("migration leaves an existing price opt-in untouched when its legacy baseline is incomplete", () => {
  const baseline = doctorProfileDraft(doctor);
  const previous = { ...baseline };
  delete previous.showConsultationPriceOnRequest;
  const raw = JSON.stringify({ version: 1, baseline: JSON.stringify(previous), value: { ...previous, showConsultationPriceOnRequest: true }, updatedAt: 321 });
  assert.equal(upgradeLegacyDoctorDraft(raw, baseline), raw);
});
