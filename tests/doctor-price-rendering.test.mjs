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
let navigationParams = '';
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
    if (name === 'next/navigation') return { useSearchParams: () => new URLSearchParams(navigationParams) };
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
const screeningDoctors = [
  ['ishchuk-nadiia', 'Іщук Надія Степанівна'],
  ['pochtar-kateryna', 'Почтар Катерина Дмитрівна'],
  ['doctor-4cd65e03-d5d5-4cdc-b2ab-98668b2b7098', 'Мельник Віра Олегівна'],
  ['iziumska-olena', 'Ізюмська Олена Вікторівна'],
];
const bookingLinks = html => [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)]
  .map(([, href, content]) => ({ url: new URL(href.replaceAll('&amp;', '&'), 'https://example.test'), text: text(content).trim() }))
  .filter(({ url }) => url.pathname === '/contacts' && url.hash === '#booking');

for (const [name, render] of surfaces) {
  test(name + ': all four programme doctors retain normal booking and offer preselected screening booking', () => {
    for (const [id, doctorName] of screeningDoctors) {
      const doctor = { ...baseline, id, name: doctorName, specialty: 'Сімейний лікар, терапевт' };
      const links = bookingLinks(render(doctor));
      const screening = links.filter(({ url }) => url.searchParams.get('service') === 'Скринінг здоров’я 40+');
      assert.equal(screening.length, name === 'directory' ? 2 : 1, `${doctorName}: screening CTA on each card surface`);
      for (const link of screening) {
        assert.equal(link.url.searchParams.get('doctorId'), id);
        assert.equal(link.url.searchParams.get('doctor'), doctorName);
        assert.match(link.text, /40\+/);
      }
      assert.ok(links.some(({ url, text: label }) =>
        !url.searchParams.has('service')
        && url.searchParams.get('doctorId') === id
        && url.searchParams.get('doctor') === doctorName
        && label.startsWith('Записатися'),
      ), `${doctorName}: ordinary consultation booking is retained`);
    }
  });

  test(name + ': screening booking is absent for an unrelated family doctor or an ineligible consultation', () => {
    for (const doctor of [
      { ...baseline, id: 'unrelated-family-doctor', specialty: 'Сімейний лікар, терапевт' },
      { ...baseline, id: screeningDoctors[0][0], specialty: 'Рентгенолог' },
    ]) {
      const html = render(doctor);
      assert.ok(!bookingLinks(html).some(({ url }) => url.searchParams.has('service')));
      assert.ok(!text(html).includes('40+'));
    }
  });

  test(name + ': all doctor branches are visible with a stable doctor booking ID', () => {
    const first = 'м. Рівне, вул. Володимира Стельмаха, 18-М';
    const second = 'м. Рівне, вул. Олександра Олеся, 13';
    const html = render({ ...baseline, branch: `${first}\n${second}` });
    assert.ok(html.includes(`class="doctor-branch-addresses">${first}\n${second}<`));
    assert.ok(html.includes(`doctorId=${encodeURIComponent(baseline.id)}`));
    assert.ok(!html.includes('Відділення уточнюйте'));
  });
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

const directoryDoctors = [
  { ...baseline, id: 'fixture-family-first', name: 'Марія Приклад', specialty: 'Сімейний лікар, терапевт' },
  { ...baseline, id: 'fixture-cardiology', name: 'Олена Приклад', specialty: 'Кардіолог' },
  { ...baseline, id: 'fixture-family-last', name: 'Іван Тестовий', specialty: 'Педіатр, сімейний лікар' },
  { ...baseline, id: 'fixture-new-specialty', name: 'Андрій Демонстраційний', specialty: 'Нейрохірург' },
];
function renderDirectory(params) {
  const previous = navigationParams;
  navigationParams = new URLSearchParams(params).toString();
  try {
    // Effects do not run during this render. Filtering must precede native
    // hash scrolling, rather than shorten the document after hydration.
    return renderToStaticMarkup(React.createElement(DoctorsDirectory, { initialDoctors: directoryDoctors }));
  } finally {
    navigationParams = previous;
  }
}
const directoryCardIds = html => [...html.matchAll(/<article\b[^>]*\bid="doctor-card-([^"]+)"/g)].map(([, id]) => id);
const profileReturnLinks = html => [...html.matchAll(/<a\b[^>]*>/g)].flatMap(([anchor]) => {
  const href = anchor.match(/\bhref="([^"]+)"/)?.[1];
  if (!href) return [];
  const profile = new URL(href.replaceAll('&amp;', '&'), 'https://example.test');
  if (!profile.pathname.startsWith('/doctors/')) return [];
  assert.equal(profile.search, '', 'profile href is clean, even with a filtered return destination');
  assert.equal(profile.hash, '');
  const target = anchor.match(/\bdata-doctor-return-to="([^"]+)"/)?.[1];
  assert.ok(target, 'directory profile links retain return context outside the URL');
  return [{ profile, back: new URL(target.replaceAll('&amp;', '&'), 'https://example.test') }];
});

test('directory applies category aliases and category IDs in the initial HTML, before effects run', () => {
  for (const specialty of ['group:family', 'Сімейний лікар/терапевт', '  ТЕРАПЕВТ  ']) {
    const html = renderDirectory({ specialty });
    assert.deepEqual(directoryCardIds(html), ['fixture-family-first', 'fixture-family-last'], specialty);
    assert.match(html, /<option[^>]*value="group:family"[^>]*selected=""/);
  }
  assert.deepEqual(directoryCardIds(renderDirectory({ specialty: 'Нейрохірург' })), ['fixture-new-specialty']);
});

test('directory applies a name search immediately and search wins over a stale category', () => {
  for (const params of [{ search: 'Олена Приклад' }, { specialty: 'group:family', search: 'Олена Приклад' }]) {
    const html = renderDirectory(params);
    assert.deepEqual(directoryCardIds(html), ['fixture-cardiology']);
    assert.match(html, /id="doctor-search"[^>]*value="Олена Приклад"/);
    const links = profileReturnLinks(html);
    assert.ok(links.length > 0);
    for (const { back } of links) {
      assert.equal(back.searchParams.get('search'), 'Олена Приклад');
      assert.equal(back.searchParams.has('specialty'), false, 'return links must not revive the stale category');
      assert.equal(back.hash, '#doctor-card-fixture-cardiology');
    }
  }
  assert.deepEqual(directoryCardIds(renderDirectory({ search: 'Такого імені немає' })), []);
});

test('each filtered profile link returns to its own card with the same resolved directory filter', () => {
  const html = renderDirectory({ specialty: 'Сімейна медицина' });
  const links = profileReturnLinks(html);
  assert.ok(links.length > 0);
  for (const { profile, back } of links) {
    assert.equal(back.pathname, '/doctors');
    assert.equal(back.searchParams.get('specialty'), 'group:family');
    assert.equal(back.searchParams.has('search'), false);
    assert.equal(back.hash, `#doctor-card-${profile.pathname.split('/').at(-1)}`);
    assert.ok(directoryCardIds(html).includes(profile.pathname.split('/').at(-1)));
  }
});

test('empty or unknown categories show all doctors immediately and do not leak into return links', () => {
  for (const params of [{}, { specialty: '' }, { specialty: '   ', search: '   ' }, { specialty: 'Невідома категорія' }]) {
    const html = renderDirectory(params);
    assert.deepEqual(directoryCardIds(html), directoryDoctors.map(doctor => doctor.id));
    const links = profileReturnLinks(html);
    assert.ok(links.length > 0);
    for (const { profile, back } of links) {
      assert.equal(back.search, '');
      assert.equal(back.hash, `#doctor-card-${profile.pathname.split('/').at(-1)}`);
    }
  }
});

test('successive URL-driven renders switch filters without retaining a previous directory category', () => {
  assert.deepEqual(directoryCardIds(renderDirectory({ specialty: 'Кардіологія' })), ['fixture-cardiology']);
  assert.deepEqual(directoryCardIds(renderDirectory({ specialty: 'group:family' })), ['fixture-family-first', 'fixture-family-last']);
  assert.deepEqual(directoryCardIds(renderDirectory({ search: 'Андрій' })), ['fixture-new-specialty']);
  assert.deepEqual(directoryCardIds(renderDirectory({})), directoryDoctors.map(doctor => doctor.id));
});
