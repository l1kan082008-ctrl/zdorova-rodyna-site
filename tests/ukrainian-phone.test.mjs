import test from "node:test";
import assert from "node:assert/strict";
import { PHONE_PREFIX, formatPhoneNumber, getUkrainianPhoneDigits, validatePhoneNumber } from "../lib/ukrainianPhone.ts";

test("national and international pasted numbers share the family-form format without duplicating the country code", () => {
  for (const value of ["0671234567", "+380671234567", "380671234567", "+38 (067) 123-45-67", "  +38 067 123-45-67  "]) {
    const formatted = formatPhoneNumber(value);
    assert.equal(formatted, "+38 067 123-45-67", value);
    assert.equal(getUkrainianPhoneDigits(formatted), "0671234567");
    assert.equal(validatePhoneNumber(formatted), "");
    assert.equal(formatPhoneNumber(formatted), formatted, "editing a formatted value does not add another prefix");
    assert.equal(`+38${getUkrainianPhoneDigits(formatted)}`, "+380671234567", "submission has exactly one country code");
  }
});

test("partial typing retains the fixed prefix and progressively formats the subscriber digits", () => {
  for (const [value, expected] of [
    ["0", "+38 0"], ["06", "+38 06"], ["067", "+38 067"],
    ["0671", "+38 067 1"], ["0671234", "+38 067 123-4"],
    ["067123456", "+38 067 123-45-6"],
  ]) {
    assert.equal(formatPhoneNumber(value), expected);
    assert.notEqual(validatePhoneNumber(expected), "");
  }
});

test("clearing the field or retaining only the country prefix restores the empty-field state", () => {
  for (const value of ["", " ", "+", "+38", "+38 ", "letters"]) {
    assert.equal(formatPhoneNumber(value), PHONE_PREFIX, value);
    assert.equal(getUkrainianPhoneDigits(formatPhoneNumber(value)), "");
    assert.notEqual(validatePhoneNumber(formatPhoneNumber(value)), "");
  }
});

test("validation rejects incomplete, non-Ukrainian and all-zero subscriber numbers", () => {
  for (const value of ["+38 067", "067123456", "1671234567", "+38 167 123-45-67", "0000000000", "+380000000000", "380000000000"]) {
    assert.notEqual(validatePhoneNumber(value), "", value);
    assert.notEqual(validatePhoneNumber(formatPhoneNumber(value)), "", value);
  }
});
