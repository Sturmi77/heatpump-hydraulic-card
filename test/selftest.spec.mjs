import { expect, test } from '@playwright/test';

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
