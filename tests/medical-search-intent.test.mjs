import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreMedicalSearch, medicalHighlightParts } from '../app/search/medicalSearch.ts';

for (const [query, title] of [
  ['феритн', 'Феритин'], ['кардіолг', 'Кардіолог'],
  ['цукор у крові', 'Глюкоза'], ['сахар в крови', 'Глюкоза'],
  ['сахр в крови', 'Глюкоза'], ['дитячий лікар', 'Педіатр'],
  ['детский врач', 'Педіатр'], ['загальний аналіз крові', 'Загальний розгорнутий аналіз крові'],
  ['узи щитовидки', 'УЗД щитоподібної залози'], ['перевірити родимки', 'Дерматоскопія'],
  ['athbnby', 'Феритин'],
]) {
  test(`patient-style query: ${query}`, () => assert.ok(scoreMedicalSearch(query, title) > 0));
}
test('exact title wins over a mention in any category', () => {
  assert.ok(scoreMedicalSearch('Феритин', 'Феритин') > scoreMedicalSearch('Феритин', 'Аналізи', 'Феритин'));
});
test('short medical abbreviations do not fuzzy-match each other', () => assert.equal(scoreMedicalSearch('КТ', 'МРТ'), 0));
test('unrelated query produces no matches', () => assert.equal(scoreMedicalSearch('абракадабра', 'Феритин'), 0));
test('child doctor is not a pediatric lab panel', () => assert.equal(scoreMedicalSearch('дитячий лікар', 'Педіатрична панель алергенів'), 0));
test('synonyms highlight the actual matched title and preserve text', () => {
  const parts = medicalHighlightParts('Глюкоза крові', 'цукор у крові');
  assert.equal(parts.map(p => p.text).join(''), 'Глюкоза крові');
  assert.ok(parts.some(p => p.text === 'Глюкоза' && p.matched));
});

for (const [query, title] of [
  ['ангиография', 'КТ-ангіографія судин головного мозку'],
  ['ангиография сосудов головного мозга', 'КТ-ангіографія судин головного мозку'],
  ['ангиография сосудов шеи', 'КТ-ангіографія судин шиї'],
  ['ангиография нижних конечностей', 'КТ-ангіографія судин нижніх кінцівок'],
]) {
  test(`Russian angiography query: ${query}`, () => assert.ok(scoreMedicalSearch(query, title) > 0));
}
for (const query of ['ангеография', 'анг-е-о-графия', 'анг е о графия', 'ан-ги-о-графия', 'ангиография']) {
  test(`angiography spelling variant: ${query}`, () => {
    assert.ok(scoreMedicalSearch(query, 'КТ-ангіографія судин головного мозку') > 0);
  });
}
for (const query of ['анге', 'ан-ге', 'анги', 'ангі', 'ангео']) {
  test(`angiography autocomplete: ${query}`, () => {
    assert.ok(scoreMedicalSearch(query, 'КТ-ангіографія судин головного мозку') > 0);
    assert.equal(scoreMedicalSearch(query, 'Глюкоза'), 0);
  });
}