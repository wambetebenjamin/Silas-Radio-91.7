import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGES: { path: string; heading: string | RegExp }[] = [
  { path: '/', heading: /Nairobi’s own/ },
  { path: '/about', heading: /About Silas Radio/ },
  { path: '/shows', heading: /What’s on Silas Radio/ },
  { path: '/shows/amaka-early', heading: /Amaka Early Drive/ },
  { path: '/schedule', heading: /The weekly schedule/ },
  { path: '/presenters', heading: /The people on the microphone/ },
  { path: '/presenters/mary-wanjiru', heading: /Mary Wanjiru/ },
  { path: '/podcasts', heading: /The listening library/ },
  { path: '/podcasts/amaka-early-preview', heading: /The Amaka Early Drive preview/ },
  { path: '/news', heading: /News and stories/ },
  { path: '/listen', heading: /91\.7 FM from Nairobi/ },
  { path: '/request', heading: /Request a song/ },
  { path: '/studio', heading: /How the studio works/ },
  { path: '/newsletter', heading: /The weekly playlist/ },
  { path: '/advertise', heading: /Advertise with Silas Radio/ },
  { path: '/contact', heading: /Contact the studio/ },
  { path: '/contests', heading: /Contests and giveaways/ },
  { path: '/register', heading: /Listen without an account/ },
  { path: '/legal/privacy-policy', heading: /Privacy Policy/ },
];

test.describe('every route is a real page', () => {
  for (const { path, heading } of PAGES) {
    test(`${path} renders a headed document with site chrome`, async ({ page, isMobile }) => {
      const response = await page.goto(path);
      expect(response?.status(), `${path} status`).toBe(200);
      await expect(page.getByRole('heading', { level: 1 })).toContainText(heading);
      await expect(page.getByRole('contentinfo')).toBeAttached();
      await expect(page.getByTestId('radio-audio')).toBeAttached();
      await expect(page.getByRole('banner')).toBeAttached();
      if (isMobile) await expect(page.getByRole('button', { name: 'Open navigation' })).toBeAttached();
      else await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeAttached();
    });
  }

  test('unknown show slugs return a 404 page', async ({ page }) => {
    const response = await page.goto('/shows/definitely-not-a-show');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/could not find that page/i);
  });
});

test.describe('navigation', () => {
  test('the header marks the current page and links stay in-app', async ({ page, isMobile }) => {
    await page.goto('/podcasts');
    const nav = page.getByRole('navigation', { name: isMobile ? 'Mobile navigation' : 'Main navigation' });
    if (isMobile) {
      await page.getByRole('button', { name: 'Open navigation' }).click();
    }
    await expect(nav.getByRole('link', { name: 'Podcasts', exact: true })).toHaveAttribute('aria-current', 'page');
    await expect(nav.getByRole('link', { name: 'Home', exact: true })).not.toHaveAttribute('aria-current', 'page');
    if (!isMobile) {
      await nav.getByRole('link', { name: 'Stories', exact: true }).click();
      await expect(page).toHaveURL(/\/news$/);
    }
  });

  test('bookmarks to the old one-page anchors still land on a page', async ({ page }) => {
    await page.goto('/#schedule');
    await expect(page).toHaveURL(/\/schedule$/);
    await page.goto('/?presenter=mary-wanjiru');
    await expect(page).toHaveURL(/\/presenters\/mary-wanjiru$/);
  });

  test('legacy template URLs redirect to their new homes', async ({ page }) => {
    await page.goto('/tours.html');
    await expect(page).toHaveURL(/\/schedule$/);
    await page.goto('/live');
    await expect(page).toHaveURL(/\/listen$/);
  });
});

test.describe('schedule', () => {
  test('day tabs switch between hosted programmes and gap-filling music', async ({ page }) => {
    await page.goto('/schedule');
    await expect(page.getByRole('tab', { name: /Saturday/ })).toBeAttached();
    const selected = page.getByRole('tab', { selected: true });
    const firstDay = (await selected.textContent())?.slice(0, 3);
    await page.getByRole('tab', { name: /Wednesday/ }).click();
    await expect(page.getByRole('tab', { name: /Wednesday/ })).toHaveAttribute('aria-selected', 'true');
    await expect(page).toHaveURL(/day=Wednesday/);
    const panel = page.getByRole('tabpanel');
    await expect(panel.getByText(/until/).first()).toBeVisible();
    if (firstDay !== 'Wed') {
      const before = await panel.textContent();
      await page.getByRole('tab', { name: /Sunday/ }).click();
      expect(await panel.textContent()).not.toBe(before);
    }
  });

  test('programme times are labelled as East Africa Time', async ({ page }) => {
    await page.goto('/schedule');
    await expect(page.getByText(/East Africa Time/)).toBeVisible();
  });
});

test.describe('catalogues and forms', () => {
  test('show filters and search actually narrow the list', async ({ page }) => {
    await page.goto('/shows');
    const all = await page.locator('.catalogue-grid > *').count();
    await page.getByRole('button', { name: 'Culture', exact: true }).click();
    const filtered = await page.locator('.catalogue-grid > *').count();
    expect(filtered).toBeGreaterThan(0);
    expect(filtered).toBeLessThan(all);
    await page.getByRole('searchbox', { name: /Search shows/ }).fill('sheng');
    await expect(page.getByRole('status').filter({ hasText: /show/ })).toContainText(/1 show/);
    await expect(page).toHaveURL(/q=sheng/);
  });

  test('the song request form validates and never claims delivery without a backend', async ({ page }) => {
    await page.goto('/request');
    const requestForm = page.locator('.form-panel');
    await requestForm.getByRole('button', { name: /Send to the studio/ }).click();
    await expect(requestForm.getByText(/Tell us your name/)).toBeVisible();
    await requestForm.getByLabel('Your name').fill('Amani Test');
    await requestForm.getByLabel('Phone number').fill('0712 345 678');
    await requestForm.getByLabel('Song title').fill('Test Track');
    await requestForm.getByLabel('Artist').fill('Test Artist');
    await requestForm.getByRole('button', { name: /Send to the studio/ }).click();
    const status = page.locator('.form-status');
    await expect(status).toContainText(/Preview only|Recorded|received|try again|couldn’t/i);
    await expect(status).not.toContainText(/has been delivered|Thank you\. The studio has your message/i);
  });

  test('contests stay clearly closed and the register page does not collect passwords', async ({ page }) => {
    await page.goto('/contests');
    await expect(page.getByText(/No contests are accepting entries/)).toBeVisible();
    await page.goto('/register');
    await expect(page.locator('input[type="password"]')).toHaveCount(0);
    await expect(page.getByText(/are not open yet/)).toBeVisible();
  });
});

test.describe('audio', () => {
  test('the persistent player keeps the same element and track across navigation', async ({ page }) => {
    await page.goto('/podcasts/amaka-early-preview');
    const heading = page.locator('.detail-hero');
    await heading.getByRole('button', { name: /Play preview/ }).click();
    await expect(heading.getByRole('button', { name: /Pause preview/ })).toBeVisible();
    const src = await page.getByTestId('radio-audio').getAttribute('src');
    expect(src).toMatch(/\/audio\/stream\/demo-0[123]\.mp3/);
    await page.getByRole('link', { name: 'All audio previews' }).click();
    await expect(page).toHaveURL(/\/podcasts$/);
    await expect(page.getByTestId('radio-audio')).toHaveAttribute('src', src!);
    await expect(page.getByRole('button', { name: 'Pause audio' })).toBeVisible();
  });

  test('the listening room marks demo audio honestly', async ({ page }) => {
    await page.goto('/listen');
    await expect(page.getByText(/You are hearing a demo/)).toBeVisible();
    await page.getByRole('button', { name: /Listen live/ }).first().click();
    await expect(page.getByRole('button', { name: /Pause radio/ }).first()).toBeVisible();
  });
});

test.describe('accessibility', () => {
  for (const path of ['/', '/schedule', '/listen', '/request', '/contests']) {
    test(`${path} has no serious accessibility violations`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name === 'mobile' && path === '/', 'covered on desktop');
      await page.goto(path);
      // axe-core resolves its own playwright-core copy; the Page instance is identical at runtime.
      const results = await new AxeBuilder({ page: page as unknown as import('playwright-core').Page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      const serious = results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''));
      expect(serious.map((violation) => `${violation.id} (${violation.nodes.length}): ${violation.nodes[0]?.target?.join(' ')}`)).toEqual([]);
    });
  }
});
