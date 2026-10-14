/**
 * Capture documentation screenshots from a running production build.
 *
 *   npm run build && npm run start -- --hostname 0.0.0.0 &
 *   PLAYWRIGHT_CHROMIUM_PATH=/path/to/chromium node scripts/capture-screenshots.mjs
 *
 * Set BASE_URL to point at a different origin (default http://127.0.0.1:3000).
 */
import { mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const baseUrl = process.env.BASE_URL ?? 'http://127.0.0.1:3000';
const outDir = process.env.SHOT_DIR ?? 'docs/screenshots';
const shots = [
  { path: '/', name: 'home', viewport: { width: 1440, height: 1500 } },
  { path: '/shows/amaka-early', name: 'show-detail', viewport: { width: 1440, height: 1100 } },
  { path: '/schedule', name: 'schedule', viewport: { width: 1440, height: 1200 } },
  { path: '/podcasts', name: 'podcasts', viewport: { width: 1440, height: 1100 } },
  { path: '/news', name: 'stories', viewport: { width: 1440, height: 1100 } },
  { path: '/listen', name: 'listen-mobile', viewport: { width: 414, height: 900 } },
];

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH,
  args: ['--no-sandbox', '--mute-audio'],
});
for (const shot of shots) {
  const context = await browser.newContext({ viewport: shot.viewport, deviceScaleFactor: 1, isMobile: shot.viewport.width < 500 });
  const page = await context.newPage();
  await page.goto(`${baseUrl}${shot.path}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${outDir}/${shot.name}.jpg`, type: 'jpeg', quality: 72 });
  await context.close();
  console.log(`captured ${shot.name} → ${outDir}/${shot.name}.jpg`);
}
await browser.close();
