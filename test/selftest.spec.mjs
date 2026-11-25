import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { expect, test } from '@playwright/test';

// Field case from a diagnostic report (scripts/report-fixture.mjs, #395): the configuration's map wins over the preset's, as in the
// card, and a thermostat that fills two keys keeps the attribute of each line.
test('report fixture keeps configuration maps and thermostat attributes', async ({}, testInfo) => {
  const report = testInfo.outputPath('report.txt');
  writeFileSync(report, [
    'Heat Pump Hydraulic Card diagnostic report',
    'Preset: kronoterm',
    '',
    'Entity mappings:',
    '- dhw_top: climate.kronoterm_dhw_temperature = heat (current_temperature 49.6)',
    '- dhw_target: climate.kronoterm_dhw_temperature = heat (temperature 50)',
    '',
    'Maps:',
    '- mode_map: heat=heating, off=off (preset)',
    '- mode_map: heat=dhw (configuration)',
    '- valve_map: on=dhw, off=heating (preset)',
    '',
  ].join('\n'));
  const run = (...extra) => JSON.parse(execFileSync(process.execPath, ['scripts/report-fixture.mjs', report, '--issue', '1', ...extra], { encoding: 'utf8' }));
  const fixture = run();
  expect(fixture.config.mode_map).toEqual({ heat: 'dhw', off: 'off' });
  expect(fixture.config.valve_map).toEqual({ on: 'dhw', off: 'heating' });
  expect(fixture.config.entities).toEqual({ dhw_top: 'climate.f_dhw_top', dhw_target: 'climate.f_dhw_top' });
  expect(fixture.states['climate.f_dhw_top']).toEqual({ state: 'heat', attributes: { current_temperature: 49.6, temperature: 50 } });
  expect(run('--set', 'valve_map=custom').config.valve_map).toBe('custom');
});

// Upstream watch (scripts/upstream-watch.mjs): what counts as new starts at the time of the review, so the changes the review has just
// checked are not reported again (#484, #485). GitHub is replaced by a stub that filters commits by `since`, as the API does.
test('upstream watch counts from the time of the review', async ({}, testInfo) => {
  const cwd = testInfo.outputPath('watch');
  mkdirSync(`${cwd}/upstream`, { recursive: true });
  const stub = testInfo.outputPath('stub.mjs');
  writeFileSync(stub, `
    const { commits, release } = JSON.parse(process.env.HFC_WATCH_STUB);
    globalThis.fetch = async (url) => {
      const u = new URL(url);
      const reply = (body) => ({ status: 200, ok: true, json: async () => body, text: async () => '' });
      if (u.pathname === '/repos/o/r/releases/latest') return reply({ tag_name: 'v2', published_at: release, html_url: 'https://example.test/v2' });
      if (u.pathname === '/repos/o/r/commits') {
        const since = Date.parse(u.searchParams.get('since'));
        return reply(commits.filter((d) => Date.parse(d) >= since)
          .map((d) => ({ sha: d, html_url: 'https://example.test/c', commit: { message: 'change of ' + d, author: { date: d } } })));
      }
      if (u.pathname === '/repos/o/r/contents/a.py') return reply({});
      throw new Error('unexpected request: ' + url);
    };
  `);
  const file = `${cwd}/upstream/demo.json`;
  const manifest = (reviewed) => writeFileSync(file, JSON.stringify({ preset: 'demo', reviewed, sources: [{ repo: 'o/r', branch: 'main', paths: ['a.py'] }] }));
  const script = `${process.cwd()}/scripts/upstream-watch.mjs`;
  const run = (stubbed, ...args) => {
    const env = { ...process.env, HFC_WATCH_STUB: JSON.stringify(stubbed) };
    delete env.GITHUB_TOKEN; delete env.GITHUB_REPOSITORY;
    return execFileSync(process.execPath, ['--import', pathToFileURL(stub).href, script, ...args], { cwd, env, encoding: 'utf8' });
  };
  const commits = ['2026-11-22T09:00:00Z', '2026-11-22T10:30:00Z', '2026-11-23T00:30:00Z'];
  const seen = (out) => commits.filter((d) => out.includes(`change of ${d}`));

  // With a time: the changes before it are reviewed, later ones of the same day are new.
  manifest({ date: '2026-11-22', at: '2026-11-22T10:00:00Z', version: 'v1' });
  const timed = run({ commits, release: '2026-11-22T09:30:00Z' }, '--dry-run');
  expect(seen(timed)).toEqual(commits.slice(1));
  expect(timed).not.toContain('New release');
  expect(run({ commits, release: '2026-11-22T11:00:00Z' }, '--dry-run')).toContain('New release: [v2]');
  expect(run({ commits: commits.slice(0, 1), release: '2026-11-22T09:30:00Z' }, '--dry-run')).toContain('(no changes)');
  // With an offset the time is the same moment.
  manifest({ date: '2026-11-22', at: '2026-11-22T12:00:00+02:00', version: 'v1' });
  expect(seen(run({ commits, release: '2026-11-22T09:30:00Z' }, '--dry-run'))).toEqual(commits.slice(1));

  // With a date only (older reviews): the whole day counts as reviewed.
  manifest({ date: '2026-11-22', version: 'v1' });
  const dated = run({ commits, release: '2026-11-22T11:00:00Z' }, '--dry-run');
  expect(seen(dated)).toEqual(commits.slice(2));
  expect(dated).not.toContain('New release');
  expect(run({ commits, release: '2026-11-23T01:00:00Z' }, '--dry-run')).toContain('New release: [v2]');

  // --ack writes the time of the review; what came before is then no change.
  const before = Math.floor(Date.now() / 1000) * 1000;
  run({ commits, release: '2026-11-22T11:00:00Z' }, '--ack', 'demo');
  const { reviewed } = JSON.parse(readFileSync(file, 'utf8'));
  expect(reviewed.at.startsWith(reviewed.date)).toBe(true);
  expect(Date.parse(reviewed.at)).toBeGreaterThanOrEqual(before);
  expect(Date.parse(reviewed.at)).toBeLessThanOrEqual(Date.now());
  expect(reviewed.version).toBe('v2');
  expect(run({ commits, release: '2026-11-22T11:00:00Z' }, '--dry-run')).toContain('(no changes)');
  expect(run({}, '--check')).toContain('valid');
});

test('browser self-test passes', async ({ page }, testInfo) => {
  test.setTimeout(150_000);
  await page.goto('/test/selftest.html');

  const result = page.locator('#result');
  await expect(result).toHaveText(/^(PASS|FAIL)$/, { timeout: 120_000 });

  const status = (await result.textContent())?.trim();
  const log = (await page.locator('#log').textContent())?.trim() || '(no self-test log)';
  await testInfo.attach('selftest.log', {
    body: Buffer.from(log),
    contentType: 'text/plain',
  });

  expect(status, log).toBe('PASS');
});

// Drawing snapshot, generated combinations and zone matrices (test/topology.html); it draws about 3,500 cases, so it gets more time.
test('topology test passes', async ({ page }, testInfo) => {
  test.setTimeout(600_000);
  await page.goto('/test/topology.html');

  const result = page.locator('#result');
  await expect(result).toHaveText(/^(PASS|FAIL)$/, { timeout: 580_000 });

  const status = (await result.textContent())?.trim();
  const log = (await page.locator('#log').textContent())?.trim() || '(no topology log)';
  await testInfo.attach('topology.log', {
    body: Buffer.from(log),
    contentType: 'text/plain',
  });

  expect(status, log).toBe('PASS');
});

// Nightly layout sweep (.github/workflows/layout-nightly.yml): the long-text passes of the topology test once per built-in
// language at the card width HFC_SWEEP_WIDTH (pixels). Skipped in the normal run. HFC_SWEEP_LANGS (comma-separated) narrows it.
test('layout sweep passes', async ({ page }, testInfo) => {
  const width = Number(process.env.HFC_SWEEP_WIDTH);
  test.skip(!width, 'nightly only: set HFC_SWEEP_WIDTH');
  test.setTimeout(3_600_000);
  await page.goto('/test/topology.html?only=^$');
  await expect(page.locator('#result')).toHaveText(/^(PASS|FAIL)$/, { timeout: 60_000 });
  const langs = (process.env.HFC_SWEEP_LANGS || '').split(',').map((l) => l.trim()).filter(Boolean);
  if (!langs.length) langs.push(...await page.evaluate(() => Object.keys(HFC_LANGUAGES)));
  const failed = [];
  for (const lang of langs) {
    await page.goto(`/test/topology.html?sweep&lang=${encodeURIComponent(lang)}&width=${width}`);
    const result = page.locator('#result');
    await expect(result).toHaveText(/^(PASS|FAIL)$/, { timeout: 900_000 });
    const log = (await page.locator('#log').textContent())?.trim() || '(no topology log)';
    await testInfo.attach(`sweep-${lang}-${width}.log`, { body: Buffer.from(log), contentType: 'text/plain' });
    if ((await result.textContent())?.trim() !== 'PASS') failed.push(`${lang} at ${width} px:\n${log}`);
  }
  expect(failed.length, failed.join('\n\n')).toBe(0);
});
