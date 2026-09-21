import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const requirePackage = createRequire(import.meta.url);
const modules = new Map();
// Render real client components with their real context. Only framework link/image
// wrappers are replaced with HTML equivalents; no fetches or database calls occur.
function load(relative) {
  let filename = path.resolve(root, relative);
  if (!path.extname(filename)) filename += existsSync(filename + '.tsx') ? '.tsx' : '.ts';
  if (modules.has(filename)) return modules.get(filename).exports;
  assert.ok(filename.startsWith(root + path.sep));
  const loadedModule = { exports: {} };
  modules.set(filename, loadedModule);
  const source = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  const resolve = name => {
    if (name.endsWith('.css')) return {};
    if (name === 'next/navigation') return { useSearchParams: () => new URLSearchParams() };
    if (name === 'next/link') return { __esModule: true, default: ({ children, ...props }) => React.createElement('a', props, children) };
    if (name === 'next/image') return { __esModule: true, default: (props) => { const htmlProps = { ...props }; for (const key of ['fill', 'sizes', 'quality', 'priority', 'preload', 'unoptimized']) delete htmlProps[key]; return React.createElement('img', htmlProps); } };
    if (name.startsWith('@/')) return load(name.slice(2));
    if (name.startsWith('.')) return load(path.relative(root, path.resolve(path.dirname(filename), name)));
    if (['react', 'react/jsx-runtime', 'react-dom'].includes(name)) return requirePackage(name);
    throw new Error('Unexpected rendering dependency: ' + name);
  };
  new Function('require', 'module', 'exports', source)(resolve, loadedModule, loadedModule.exports);
  return loadedModule.exports;
}

const { DoctorsDirectory } = load('app/doctors/DoctorsDirectory.tsx');
const { DoctorProfileDetails } = load('app/doctors/[id]/DoctorProfileDetails.tsx');
const { defaultDoctors, formatDoctorConsultations } = load('app/doctors/doctorData.ts');
const baseline = { ...defaultDoctors[0], specialty: 'Кардіолог', consultationPrice: null, repeatConsultationPrice: null, showConsultationPriceOnRequest: false };
const text = html => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
const surfaces = [
  ['directory', doctor => renderToStaticMarkup(React.createElement(DoctorsDirectory, { initialDoctors: [doctor] }))],
  ['profile', doctor => renderToStaticMarkup(React.createElement(DoctorProfileDetails, { doctor }))],
];
for (const [name, render] of surfaces) {
  test(name + ': missing prices hide the full price block and retain booking', () => {
    const doctor = { ...baseline };
    delete doctor.showConsultationPriceOnRequest;
    const html = render(doctor);
    assert.ok(!html.includes('doctor-card-consultation-price'));
    assert.ok(!html.includes('Вартість консультації'));
    assert.ok(!text(html).includes('Консультація'));
    assert.ok(text(html).includes('Записатися'));
  });
  test(name + ': opt-in displays the existing price-on-request hint', () => {
    const html = render({ ...baseline, showConsultationPriceOnRequest: true });
    assert.match(text(html), /(?:Консультація|Вартість консультації)[\s·]+Уточнюйте/);
  });
  test(name + ': numeric zero is visible with the switch off', () => {
    const html = render({ ...baseline, consultationPrice: 0 });
    assert.ok(text(html).includes('0 ₴'));
    assert.ok(text(html).includes('Записатися'));
  });
  test(name + ': primary and repeat prices are both retained', () => {
    const html = render({ ...baseline, consultationPrice: 700, repeatConsultationPrice: 500 });
    assert.match(text(html), /Первинна[\s—]+700 ₴/);
    assert.match(text(html), /Повторна[\s—]+500 ₴/);
  });
  test(name + ': repeat-only hides unknown primary unless explicitly requested', () => {
    const doctor = { ...baseline, repeatConsultationPrice: 500 };
    const html = render(doctor);
    assert.ok(!text(html).includes('Первинна'));
    assert.match(text(html), /Повторна[\s—]+500 ₴/);
    assert.match(text(render({ ...doctor, showConsultationPriceOnRequest: true })), /Первинна[\s—]+Уточнюйте/);
  });
  test(name + ': the switch does not introduce consultations for radiologists', () => {
    const html = render({ ...baseline, specialty: 'Рентгенолог', consultationPrice: 700, showConsultationPriceOnRequest: true });
    assert.ok(!html.includes('700 ₴'));
    assert.ok(!text(html).includes('Записатися'));
  });
}
test('empty pricing summary is null, without a dangling separator or label', () => {
  assert.equal(formatDoctorConsultations(baseline), null);
  assert.equal(formatDoctorConsultations({ ...baseline, consultationPrice: 700 }), '700 ₴');
  assert.equal(formatDoctorConsultations({ ...baseline, repeatConsultationPrice: 0 }), 'Повторна — 0 ₴');
});

for (const [name, render] of surfaces) {
  test(name + ': empty schedule shows only the administrator notice and retains booking', () => {
    for (const schedule of [{}, { mon: '  ', tue: '\n' }]) {
      const html = render({ ...baseline, schedule });
      assert.ok(html.includes('Графік прийому уточнюйте в адміністратора.'));
      assert.ok(!html.includes('doctor-detail-schedule'));
      assert.ok(!html.includes('doctor-card-schedule-line'));
      assert.ok(!html.includes('Графік на тиждень'));
      assert.ok(!html.includes('Найближчий графік'));
      assert.ok(text(html).includes('Записатися'));
    }
  });
  test(name + ': a populated schedule is retained instead of the empty notice', () => {
    const html = render({ ...baseline, schedule: { mon: '09:00–15:00' } });
    assert.ok(html.includes('09:00–15:00'));
    assert.ok(!html.includes('Графік прийому уточнюйте в адміністратора.'));
    assert.ok(html.includes(name === 'profile' ? 'Години прийому' : 'Графік на тиждень'));
  });
  test(name + ': no appointment promise for an unscheduled radiologist', () => {
    const html = render({ ...baseline, specialty: 'Рентгенолог', schedule: {} });
    assert.ok(html.includes('Графік роботи уточнюйте в адміністратора.'));
    assert.ok(!html.includes('Години роботи'));
  });
}
test('empty and whitespace biographies leave no heading, placeholder or empty section', () => {
  for (const biography of ['', '  \n \t']) {
    const doctor = { ...baseline, biography };
    const profile = surfaces[1][1](doctor);
    assert.ok(!profile.includes('doctor-biography'));
    assert.ok(!profile.includes('doctor-detail-content'));
    assert.ok(!profile.includes('Інформація доповнюється'));
    assert.ok(!profile.includes('Біографія та професійний досвід'));
    const directory = surfaces[0][1](doctor);
    assert.ok(!text(directory).includes('Біографія'));
    assert.ok(text(directory).includes('Профіль'));
  }
});
test('real biography remains visible with its paragraphs and directory label', () => {
  const doctor = { ...baseline, biography: 'Освіта лікаря.\n\nПрофесійний досвід.' };
  const profile = surfaces[1][1](doctor);
  assert.ok(profile.includes('Біографія та професійний досвід'));
  assert.ok(profile.includes('<p>Освіта лікаря.</p>'));
  assert.ok(profile.includes('<p>Професійний досвід.</p>'));
  assert.ok(text(surfaces[0][1](doctor)).includes('Біографія'));
});
