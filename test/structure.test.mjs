import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('has exactly one required id each', () => {
  for (const id of ['grades-form', 'username', 'password', 'status', 'grades-output']) {
    const count = (html.match(new RegExp(`id="${id}"`, 'g')) || []).length;
    assert.equal(count, 1, `expected exactly one #${id}`);
  }
});

test('CSP restricts connect-src to node-server.ru', () => {
  assert.match(html, /connect-src 'self' https:\/\/node-server\.ru/);
});

test('calls the three required Web Service functions', () => {
  for (const fn of ['core_webservice_get_site_info', 'core_enrol_get_users_courses', 'gradereport_user_get_grade_items']) {
    assert.ok(html.includes(fn), `missing call to ${fn}`);
  }
});

test('password field is cleared after submit (no persistence)', () => {
  assert.match(html, /password'\)\.value = ''/);
});

test('inline script has valid JavaScript syntax', () => {
  const script = html.match(/<script>([\s\S]*)<\/script>/)[1];
  const tmpPath = fileURLToPath(new URL('../.tmp-script-check.mjs', import.meta.url));
  writeFileSync(tmpPath, script);
  try {
    execFileSync(process.execPath, ['--check', tmpPath]);
  } finally {
    unlinkSync(tmpPath);
  }
});
