import test from 'node:test';
import assert from 'node:assert/strict';
import { compareStudyMatches, scoreMedicalSearch } from '../app/search/medicalSearch.ts';
const match = (amount, score = 100, index = 0) => ({ item: { amount }, score, index });
test('equally relevant studies show higher prices first, unknown prices last', () => {
  const sorted = [match(800), match(undefined), match(3000), match(1700)].sort(compareStudyMatches);
  assert.deepEqual(sorted.map(x => x.item.amount), [3000, 1700, 800, undefined]);
});
test('price does not override relevance or explicit imaging intent', () => {
  assert.ok(compareStudyMatches(match(800, 200), match(5000, 100)) < 0);
  assert.ok(scoreMedicalSearch('МРТ головного мозку', 'МРТ головного мозку') > scoreMedicalSearch('МРТ головного мозку', 'КТ головного мозку'));
});
test('equal prices keep catalogue order', () => {
  assert.ok(compareStudyMatches(match(700, 100, 1), match(700, 100, 2)) < 0);
});