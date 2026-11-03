// Regenerates docs/screenshots from the built site: npm run build && node scripts/screenshots.mjs
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'docs/screenshots');
const PORT = 4312;
const BASE = `http://127.0.0.1:${PORT}/`;

await mkdir(out, { recursive: true });
const server = await serve(join(root, 'dist'), PORT);
const browser = await chromium.launch();

async function shot(name, hash, width, height, { full = false, before, media } = {}) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 2 });
  await page.goto(BASE + hash);
  await page.waitForSelector('html[data-ready="true"]');
  if (media) await page.emulateMedia({ media });
  if (before) await before(page);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: join(out, `${name}.png`), fullPage: full });
  await page.close();
  console.log(`docs/screenshots/${name}.png`);
}

await shot('desktop-1440-brief-murphy', '#/murphy/brief', 1440, 900);
await shot('desktop-1440-brief-nget', '#/nget/brief', 1440, 900);
await shot('desktop-1440-overlap', '#/balfour/overlap', 1440, 1000);
await shot('desktop-1440-call-kit', '#/nget/call', 1440, 900);
await shot('desktop-1440-sources', '#/balfour/brief', 1440, 900, { before: (p) => p.click('#sources-button') });
await shot('desktop-1440-filter-unknowns', '#/ssen/brief?filter=unknown', 1440, 900);
await shot('mobile-390-brief', '#/balfour/brief', 390, 844, { full: true });
await shot('mobile-320-brief', '#/nget/brief', 320, 640);
await shot('mobile-390-menu', '#/mgroup/brief', 390, 844, { before: (p) => p.click('#account-menu-button') });
await shot('print-preview-nget', '#/nget/brief', 900, 1200, { full: true, media: 'print' });

await browser.close();
server.close();
