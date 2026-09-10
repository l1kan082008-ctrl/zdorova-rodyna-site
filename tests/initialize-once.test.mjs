import test from 'node:test';
import assert from 'node:assert/strict';
import { initializeOnce } from '../lib/initializeOnce.ts';

test('schema initialization shares concurrent work and skips subsequent calls', async () => {
  const once = initializeOnce();
  let calls = 0;
  const initialize = async () => { calls++; };
  await Promise.all([once(initialize), once(initialize), once(initialize)]);
  await once(initialize);
  assert.equal(calls, 1);
});
test('failed schema initialization can retry', async () => {
  const once = initializeOnce();
  await assert.rejects(once(async () => { throw new Error('offline'); }));
  let calls = 0;
  await once(async () => { calls++; });
  assert.equal(calls, 1);
});
