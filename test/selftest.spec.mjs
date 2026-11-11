import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
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
