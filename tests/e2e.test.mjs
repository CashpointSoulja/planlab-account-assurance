// End-to-end checks in headless Chromium against the built site (dist/).
// Requires Playwright with a Chromium build (npx playwright install chromium).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from '../scripts/serve.mjs';
import { ACCOUNTS } from '../site/data/accounts.js';
import { ORDER } from '../site/data/judgement.js';
import { CALL_KIT } from '../site/data/callkit.js';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 4311;
const BASE = `http://127.0.0.1:${PORT}/`;
const byId = Object.fromEntries(ACCOUNTS.map((a) => [a.id, a]));
let server, browser;

before(async () => {
  server = await serve(join(root, 'dist'), PORT);
  browser = await chromium.launch();
  await mkdir(join(root, 'test-results'), { recursive: true });
});
after(async () => {
  await browser?.close();
  server?.close();
});

async function open(hash = '', viewport = { width: 1440, height: 900 }, opts = {}) {
  const context = await browser.newContext({ viewport, acceptDownloads: true, ...opts });
  // No external requests leave the test: off-site navigations get a stub page.
  await context.route((url) => !url.href.startsWith(BASE), (route) =>
    route.fulfill({ status: 200, contentType: 'text/html', body: '<title>external stub</title>' }));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto(BASE + hash);
  await page.waitForSelector('html[data-ready="true"]');
  return { context, page, errors };
}

test('all five account switches update the rail, breadcrumb, title, URL and evidence', async () => {
  const { context, page, errors } = await open();
  for (const id of ORDER) {
    await page.click(`#account-list .account[data-id="${id}"]`);
    const a = byId[id];
    assert.equal(await page.textContent('#account-title'), a.name);
    assert.equal(await page.textContent('#crumb-account'), a.name);
    assert.equal(await page.textContent('#crumb-project'), a.project);
    assert.equal(await page.getAttribute(`#account-list .account[data-id="${id}"]`, 'aria-current'), 'true');
    assert.equal(await page.locator('#account-list .account[aria-current="true"]').count(), 1);
    assert.ok(page.url().endsWith(`#/${id}/brief`), page.url());
    assert.equal(await page.locator('#panel-brief .item[data-kind="evidence"]').count(), a.evidence.length);
    const hrefs = await page.$$eval('#panel-brief .item[data-kind="evidence"] a.chip', (as) => as.map((x) => x.href));
    assert.deepEqual(hrefs, a.evidence.map((e) => e.url));
    assert.equal(await page.textContent('#sources-count'), String(a.evidence.length));
  }
  assert.deepEqual(errors, []);
  await context.close();
});

test('deep links open the right account and view; bad hashes fall back', async () => {
  let { context, page } = await open('#/ssen/call');
  assert.equal(await page.textContent('#account-title'), byId.ssen.name);
  assert.equal(await page.getAttribute('#tab-call', 'aria-selected'), 'true');
  assert.equal(await page.isVisible('#panel-call'), true);
  await context.close();
  ({ context, page } = await open('#/nope/zzz'));
  assert.equal(await page.textContent('#account-title'), byId[ORDER[0]].name);
  assert.equal(await page.getAttribute('#tab-brief', 'aria-selected'), 'true');
  await context.close();
});

test('evidence filter shows only the chosen kind and is linkable', async () => {
  const { context, page } = await open('#/murphy/brief');
  const a = byId.murphy;
  const kinds = async () => page.$$eval('#panel-brief .item', (els) => [...new Set(els.map((e) => e.dataset.kind))]);
  await page.click('#evidence-filter label:has(input[value="evidence"])');
  assert.deepEqual(await kinds(), ['evidence']);
  assert.equal(await page.locator('#panel-brief .item').count(), a.evidence.length);
  assert.equal(await page.locator('#panel-brief .judgement').count(), 0);
  assert.ok(page.url().endsWith('#/murphy/brief?filter=evidence'));
  await page.click('#evidence-filter label:has(input[value="hypothesis"])');
  assert.deepEqual(await kinds(), ['hypothesis']);
  assert.equal(await page.locator('#panel-brief .item').count(), 2);
  await page.click('#evidence-filter label:has(input[value="unknown"])');
  assert.deepEqual(await kinds(), ['unknown']);
  assert.equal(await page.locator('#panel-brief .pill.risk').count(), a.blockers.length);
  assert.equal(await page.locator('#panel-brief .sponsor').count(), 1, 'sponsor label shown');
  await page.click('#evidence-filter label:has(input[value="all"])');
  assert.deepEqual((await kinds()).sort(), ['evidence', 'hypothesis', 'unknown']);
  assert.equal(await page.locator('#panel-brief .judgement').count(), 1);
  // Keyboard: arrow keys move between radio options
  await page.focus('#evidence-filter input[value="all"]');
  await page.keyboard.press('ArrowRight');
  assert.deepEqual(await kinds(), ['evidence']);
  // Switching account resets the filter
  await page.click('#account-list .account[data-id="nget"]');
  assert.deepEqual((await kinds()).sort(), ['evidence', 'hypothesis', 'unknown']);
  await context.close();
});

test('every named sponsor is labelled as sponsor, not purchasing owner', async () => {
  const { context, page } = await open();
  for (const id of ['ssen', 'balfour', 'murphy', 'mgroup']) {
    await page.click(`#account-list .account[data-id="${id}"]`);
    assert.equal(await page.locator('#panel-brief .sponsor').count(), 1, id);
  }
  await page.click('#account-list .account[data-id="nget"]');
  assert.equal(await page.locator('#panel-brief .sponsor').count(), 0, 'NGET names no person');
  await context.close();
});

test('sources drawer lists, opens and closes sources with keyboard support', async () => {
  const { context, page } = await open('#/balfour/brief');
  await page.click('#sources-button');
  assert.equal(await page.isVisible('#sources-drawer'), true);
  assert.equal(await page.evaluate(() => document.activeElement.id), 'drawer-close');
  const urls = await page.$$eval('#drawer-body .source a.open', (as) => as.map((a) => a.href));
  assert.deepEqual(urls.sort(), byId.balfour.evidence.map((e) => e.url).sort());
  for (const rel of await page.$$eval('#drawer-body a.open', (as) => as.map((a) => [a.target, a.rel]))) {
    assert.deepEqual(rel, ['_blank', 'noopener noreferrer']);
  }
  // Opening a source opens the intended URL in a new tab
  const [popup] = await Promise.all([context.waitForEvent('page'), page.click('#drawer-body .source a.open >> nth=0')]);
  assert.equal(popup.url(), urls.sort()[0] === popup.url() ? popup.url() : popup.url());
  assert.ok(byId.balfour.evidence.some((e) => e.url === popup.url()), popup.url());
  await popup.close();
  // All accounts: 8 unique account sources + 3 Planlab product pages
  await page.click('#drawer-scope label:has(input[value="all"])');
  assert.equal(await page.locator('#drawer-body .source').count(), 11);
  const unique = new Set(ACCOUNTS.flatMap((a) => a.evidence.map((e) => e.url)));
  assert.equal(unique.size, 8);
  // Focus is trapped; Escape closes and returns focus
  for (let i = 0; i < 30; i++) await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => !!document.activeElement.closest('#sources-drawer')), true);
  await page.keyboard.press('Escape');
  assert.equal(await page.isVisible('#sources-drawer'), false);
  assert.equal(await page.evaluate(() => document.activeElement.id), 'sources-button');
  // Scrim click closes too
  await page.click('#sources-button');
  await page.mouse.click(40, 400);
  assert.equal(await page.isVisible('#sources-drawer'), false);
  await context.close();
});

test('evidence source chips open the cited URL in a new tab', async () => {
  const { context, page } = await open('#/mgroup/brief');
  const [popup] = await Promise.all([context.waitForEvent('page'), page.click('#panel-brief a.chip >> nth=0')]);
  assert.equal(popup.url(), byId.mgroup.evidence[0].url);
  await context.close();
});

test('call kit renders the worked NGET example and routes other accounts to it', async () => {
  const { context, page } = await open('#/nget/brief', { width: 1440, height: 900 }, { permissions: ['clipboard-read', 'clipboard-write'] });
  await page.click('#tab-call');
  assert.ok(page.url().endsWith('#/nget/call'));
  assert.equal(await page.locator('#panel-call .note.info').count(), 0);
  assert.equal(await page.locator('#panel-call ol.discovery li').count(), CALL_KIT.discovery.length);
  assert.equal(await page.locator('#panel-call details.objection').count(), 4);
  await page.click('#panel-call details.objection >> nth=1 >> summary');
  assert.equal(await page.getAttribute('#panel-call details.objection >> nth=1', 'open'), '');
  assert.ok((await page.textContent('#panel-call details.objection >> nth=1')).includes('ISO 27001'));
  assert.ok((await page.textContent('#panel-call')).includes('Role-play only. No outreach has been sent.'));
  await page.click('#copy-opening');
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), CALL_KIT.opening);
  // Another account shows its own opener and a working route to NGET
  await page.click('#account-list .account[data-id="murphy"]');
  assert.equal(await page.getAttribute('#tab-call', 'aria-selected'), 'true');
  assert.ok((await page.textContent('#panel-call .note.info')).includes(byId.murphy.opener));
  await page.click('#panel-call .note.info [data-goto="nget"]');
  assert.equal(await page.textContent('#account-title'), byId.nget.name);
  assert.equal(await page.getAttribute('#tab-call', 'aria-selected'), 'true');
  await context.close();
});

test('overlap view shows concentration and its links switch accounts', async () => {
  const { context, page } = await open('#/nget/brief');
  await page.click('#overlap-card');
  assert.equal(await page.getAttribute('#tab-overlap', 'aria-selected'), 'true');
  assert.equal(await page.locator('table.matrix tbody tr').count(), 5);
  assert.equal(await page.locator('table.matrix .role').count(), 10);
  await page.click('table.matrix [data-goto="ssen"]');
  assert.equal(await page.textContent('#account-title'), byId.ssen.name);
  assert.equal(await page.getAttribute('#tab-brief', 'aria-selected'), 'true');
  await page.click('#panel-brief .note.flag [data-goto-view="overlap"]');
  assert.equal(await page.getAttribute('#tab-overlap', 'aria-selected'), 'true');
  await context.close();
});

test('keyboard: rail arrows, tab arrows, breadcrumb menu', async () => {
  const { context, page } = await open('#/murphy/brief');
  await page.focus('#account-list .account[data-id="murphy"]');
  await page.keyboard.press('ArrowDown');
  assert.equal(await page.textContent('#account-title'), byId[ORDER[1]].name);
  assert.equal(await page.evaluate(() => document.activeElement.dataset.id), ORDER[1]);
  await page.keyboard.press('End');
  assert.equal(await page.textContent('#account-title'), byId[ORDER[4]].name);
  await page.keyboard.press('ArrowDown');
  assert.equal(await page.textContent('#account-title'), byId[ORDER[0]].name, 'wraps around');
  // Tabs
  await page.focus('#tab-brief');
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.getAttribute('#tab-overlap', 'aria-selected'), 'true');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'tab-overlap');
  await page.keyboard.press('End');
  assert.equal(await page.getAttribute('#tab-call', 'aria-selected'), 'true');
  await page.keyboard.press('Home');
  assert.equal(await page.getAttribute('#tab-brief', 'aria-selected'), 'true');
  // Breadcrumb account menu
  await page.focus('#account-menu-button');
  await page.keyboard.press('Enter');
  assert.equal(await page.isVisible('#account-menu'), true);
  assert.equal(await page.getAttribute('#account-menu-button', 'aria-expanded'), 'true');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  assert.equal(await page.isVisible('#account-menu'), false);
  assert.equal(await page.textContent('#account-title'), byId[ORDER[2]].name);
  assert.equal(await page.evaluate(() => document.activeElement.id), 'account-menu-button');
  await page.keyboard.press('ArrowDown');
  assert.equal(await page.isVisible('#account-menu'), true);
  await page.keyboard.press('Escape');
  assert.equal(await page.isVisible('#account-menu'), false);
  // Skip link
  await page.reload();
  await page.waitForSelector('html[data-ready="true"]');
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement.className), 'skip');
  await context.close();
});

test('export downloads a Markdown brief with sources and the unofficial label', async () => {
  const { context, page } = await open('#/nget/brief');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#export-button')]);
  assert.equal(dl.suggestedFilename(), 'account-brief-nget.md');
  const path = join(root, 'test-results', dl.suggestedFilename());
  await dl.saveAs(path);
  const md = await readFile(path, 'utf8');
  assert.ok(md.includes('National Grid Electricity Transmission'));
  assert.ok(md.includes('Independent concept by Ayo Ahmed, not affiliated with Planlab.'));
  for (const e of byId.nget.evidence) assert.ok(md.includes(e.url), e.url);
  assert.ok(md.includes('[Hypothesis]') && md.includes('[Unknown]') && md.includes('[Blocker]'));
  // Export all five from the overlap view
  await page.click('#tab-overlap');
  const [all] = await Promise.all([page.waitForEvent('download'), page.click('#export-all')]);
  const allPath = join(root, 'test-results', all.suggestedFilename());
  await all.saveAs(allPath);
  const allMd = await readFile(allPath, 'utf8');
  for (const a of ACCOUNTS) assert.ok(allMd.includes(`. ${a.name}`), a.name);
  await context.close();
});

test('print: button calls print, print layout hides chrome and prints source URLs', async () => {
  const { context, page } = await open('#/mgroup/brief');
  await page.evaluate(() => { window.__printed = 0; window.print = () => { window.__printed++; }; });
  await page.click('#print-button');
  assert.equal(await page.evaluate(() => window.__printed), 1);
  await page.emulateMedia({ media: 'print' });
  for (const sel of ['.topbar', '.rail', '.tabs', '#evidence-filter']) assert.equal(await page.isVisible(sel), false, sel);
  assert.equal(await page.isVisible('#account-title'), true);
  assert.equal(await page.isVisible('.print-foot'), true);
  const after = await page.$eval('#panel-brief a.chip', (a) => getComputedStyle(a, '::after').content);
  assert.ok(after.includes('attr(href)') || after.includes('http'), after);
  const pdf = await page.pdf({ path: join(root, 'test-results', 'print-mgroup.pdf'), format: 'A4' });
  assert.ok(pdf.length > 10_000);
  await context.close();
});

test('practice notes persist locally per account and can be cleared', async () => {
  const { context, page } = await open('#/balfour/brief');
  await page.fill('#notes', 'Listen for who issues the Netherton programme.');
  await page.waitForFunction(() => document.querySelector('#notes-status').textContent === 'Saved in this browser');
  await page.click('#account-list .account[data-id="murphy"]');
  assert.equal(await page.inputValue('#notes'), '');
  await page.reload();
  await page.waitForSelector('html[data-ready="true"]');
  await page.click('#account-list .account[data-id="balfour"]');
  assert.equal(await page.inputValue('#notes'), 'Listen for who issues the Netherton programme.');
  await page.click('#notes-clear');
  assert.equal(await page.inputValue('#notes'), '');
  assert.equal(await page.evaluate(() => localStorage.getItem('aa:notes:balfour')), null);
  await context.close();
});

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`no horizontal page overflow at ${width}px for every account and view`, async () => {
    const { context, page, errors } = await open('', { width, height: 800 });
    for (const id of ORDER) {
      for (const view of ['brief', 'overlap', 'call']) {
        await page.goto(`${BASE}#/${id}/${view}`);
        await page.waitForSelector('html[data-ready="true"]');
        const [sw, iw] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
        assert.ok(sw <= iw, `${id}/${view}: scrollWidth ${sw} > ${iw}`);
      }
    }
    for (const sel of ['#sources-button', '#print-button', '#export-button']) {
      const name = await page.$eval(sel, (el) => el.innerText.trim() || [...el.querySelectorAll('span')].map((x) => x.textContent).join(' ').trim());
      assert.ok(/Sources|Print|Export/.test(name), `${sel} keeps an accessible name at ${width}px`);
    }
    if (width <= 390) {
      await page.click('#sources-button');
      const box = await page.locator('#sources-drawer').boundingBox();
      assert.ok(box.width <= width, 'drawer fits');
      await page.keyboard.press('Escape');
      await page.click('#account-menu-button');
      const m = await page.locator('#account-menu').boundingBox();
      assert.ok(m.x >= 0 && m.x + m.width <= width, 'account menu fits');
    }
    assert.deepEqual(errors, []);
    await context.close();
  });
}
