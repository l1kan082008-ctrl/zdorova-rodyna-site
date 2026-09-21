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
const { SiteSettingsProvider } = load('app/components/SiteSettingsProvider.tsx');
const { defaultSiteSettings } = load('lib/siteSettings.ts');
const { SiteHeader, SiteFooter } = load('app/components/SiteChrome.tsx');
const { FaqDirectory } = load('app/patients/faq/FaqDirectory.tsx');
const settings = { ...defaultSiteSettings, phone: '+38 (099) 000-00-01', email: 'test@example.test', address: 'Тестова адреса, 1', hours: ['Пн–Пт 09:00–18:00', 'Сб 10:00–13:00'], facebookUrl: 'https://facebook.com/example-test', instagramUrl: '' };
const render = (Component, value, props = {}) => renderToStaticMarkup(React.createElement(SiteSettingsProvider, { settings: value }, React.createElement(Component, props)));

test('header and footer render the same saved phone, including the callable href', () => {
  for (const [Component, props] of [[SiteHeader, { home: true }], [SiteFooter, {}]]) {
    const html = render(Component, settings, props);
    assert.ok(html.includes(settings.phone));
    assert.ok(html.includes('href="tel:+380990000001"'));
    assert.ok(!html.includes(defaultSiteSettings.phone));
  }
});

test('footer renders updated email, address and hours, without stale defaults', () => {
  const html = render(SiteFooter, settings);
  assert.ok(html.includes('href="mailto:test@example.test"'));
  assert.ok(html.includes(settings.address));
  for (const line of settings.hours) assert.ok(html.includes(line));
  for (const line of defaultSiteSettings.hours) assert.ok(!html.includes(line));
});

test('clearing optional social links removes their controls', () => {
  const html = render(SiteFooter, settings);
  assert.ok(html.includes('href="https://facebook.com/example-test"'));
  assert.ok(!html.includes('Здорова Родина в Instagram'));
  const cleared = render(SiteFooter, { ...settings, facebookUrl: '' });
  assert.ok(!cleared.includes('Здорова Родина у Facebook'));
  assert.ok(!cleared.includes('href=""'));
});

test('FAQ phone references follow the shared contact rather than an old literal', () => {
  const html = render(FaqDirectory, settings);
  assert.equal(html.split(settings.phone).length - 1, 2);
  assert.ok(!html.includes(defaultSiteSettings.phone));
});

test('separate server renders use their own contact values', () => {
  render(SiteFooter, settings);
  const html = render(SiteFooter, defaultSiteSettings);
  assert.ok(html.includes(defaultSiteSettings.phone));
  assert.ok(!html.includes(settings.phone));
});


test('TikTok and Threads links appear only when configured', () => {
  const html = render(SiteFooter, { ...settings, tiktokUrl: 'https://www.tiktok.com/@example-test', threadsUrl: 'https://www.threads.com/@example-test' });
  assert.ok(html.includes('href="https://www.tiktok.com/@example-test"'));
  assert.ok(html.includes('aria-label="Здорова Родина в TikTok"'));
  assert.ok(html.includes('href="https://www.threads.com/@example-test"'));
  assert.ok(html.includes('aria-label="Здорова Родина у Threads"'));
  const empty = render(SiteFooter, { ...settings, tiktokUrl: '', threadsUrl: '' });
  assert.ok(!empty.includes('Здорова Родина в TikTok'));
  assert.ok(!empty.includes('Здорова Родина у Threads'));
});

const { upgradeLegacySettingsDraft } = load('app/admin/settings/settingsDraft.ts');

test('adding social fields preserves an existing unsaved contact draft', () => {
  const oldBaseline = { ...defaultSiteSettings };
  delete oldBaseline.tiktokUrl;
  delete oldBaseline.threadsUrl;
  const raw = JSON.stringify({ version: 1, baseline: JSON.stringify(oldBaseline), value: { ...oldBaseline, address: 'Unfinished address', email: 'unfinished@' }, updatedAt: 123 });
  const upgraded = JSON.parse(upgradeLegacySettingsDraft(raw, defaultSiteSettings));
  assert.equal(upgraded.baseline, JSON.stringify(defaultSiteSettings));
  assert.equal(upgraded.value.address, 'Unfinished address');
  assert.equal(upgraded.value.email, 'unfinished@');
  assert.equal(upgraded.value.tiktokUrl, '');
  assert.equal(upgraded.value.threadsUrl, '');
  assert.equal(upgraded.updatedAt, 123);
  assert.equal(upgradeLegacySettingsDraft(raw, { ...defaultSiteSettings, address: 'Changed on server' }), raw);
});

test('current or malformed settings drafts are not overwritten during migration', () => {
  const raw = JSON.stringify({ version: 1, baseline: JSON.stringify(defaultSiteSettings), value: { ...defaultSiteSettings, threadsUrl: 'https://www.threads.com/@draft' }, updatedAt: 456 });
  assert.equal(upgradeLegacySettingsDraft(raw, defaultSiteSettings), raw);
  assert.equal(upgradeLegacySettingsDraft('broken', defaultSiteSettings), 'broken');
});
