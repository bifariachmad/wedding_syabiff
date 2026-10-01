import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import QRCode from 'qrcode';
import { createBackend } from './gas-harness.mjs';

const backend = createBackend(), pin = 'test-only-pin';
const ada = backend.call({ action: 'reserve', name: 'Adelia & Keluarga', guests: 3 }).reservation;
const bima = backend.call({ action: 'reserve', name: 'Bima Pratama', guests: 2 }).reservation;
const clara = backend.call({ action: 'reserve', name: 'Clara <img src=x onerror=alert(1)>', guests: 1 }).reservation;
backend.call({ action: 'checkin', id: bima.id, pin });
let failList = false, failSave = false, holdList = false, releaseList;
let listStarted;
const requests = [];
await fs.mkdir('artifacts/reception', { recursive: true });
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1100 }, reducedMotion: 'reduce' });
const page = await context.newPage(), errors = [];
page.on('pageerror', error => errors.push(error.message));
await context.route('https://script.google.com/**', async route => {
  const body = route.request().postDataJSON(); requests.push(body.action);
  if (holdList && body.action === 'list') { listStarted?.(); await new Promise(resolve => { releaseList = resolve; }); }
  if ((failList && body.action === 'list') || (failSave && body.action === 'checkin')) return route.abort('failed');
  return route.fulfill({ json: backend.call(body) });
});
const login = async () => { await page.locator('#admin-pin').fill(pin); await page.locator('#login-submit').click(); await page.waitForSelector('#admin-panel:visible'); };
const find = async id => { await page.locator('#manual-code').fill(id); await page.locator('#manual-form button').click(); };
const noOverflow = async () => assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
try {
  await page.goto('http://127.0.0.1:5173/buku-tamu');
  await page.waitForFunction(() => document.querySelector('#app').dataset.ready === 'true');
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: 'artifacts/reception/login-desktop.png', fullPage: true });
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 1024 }); await noOverflow();
    if (width === 390) await page.screenshot({ path: 'artifacts/reception/login-mobile.png', fullPage: true });
  }
  await page.locator('#admin-pin').fill('wrong'); await page.locator('#login-submit').click();
  await page.waitForFunction(() => document.querySelector('#admin-status').textContent === 'PIN tidak valid.');
  assert.equal(await page.locator('#admin-panel').isVisible(), false);
  await login();
  assert.equal(await page.locator('#total-guests').textContent(), '6');
  assert.equal(await page.locator('#total-checkin').textContent(), '2');
  assert.equal(await page.locator('#total-waiting').textContent(), '4');
  assert.equal(await page.locator('.admin-row img').count(), 0);
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1100 }); await noOverflow();
    await page.screenshot({ path: `artifacts/reception/dashboard-${width}.png`, fullPage: true });
  }
  await page.locator('[data-filter="waiting"]').click(); assert.equal(await page.locator('.admin-row').count(), 2);
  await page.locator('[data-filter="present"]').click(); assert.equal(await page.locator('.admin-row').count(), 1);
  await page.locator('[data-filter="all"]').click();
  await page.locator('#search-name').fill(ada.id.slice(0, 3) + ' ' + ada.id.slice(3));
  assert.equal(await page.locator('.admin-row').count(), 1);
  await page.locator('#search-name').fill('tidak ada'); assert.equal(await page.locator('.admin-row').count(), 0);
  await page.locator('#search-name').fill('');
  await find('DJSL-' + ada.id); assert.equal(await page.locator('#mark-present').isVisible(), true);
  await find('000000'); assert.equal(await page.locator('#mark-present').count(), 0);
  assert.match(await page.locator('#checkin-result').textContent(), /Kode tidak ditemukan/);
  await find(ada.id); failSave = true;
  await page.locator('#mark-present').click();
  await page.waitForFunction(() => document.querySelector('#mark-present')?.textContent === 'Coba simpan lagi');
  assert.equal(await page.locator('#total-checkin').textContent(), '2');
  failSave = false; await page.locator('#mark-present').click();
  await page.waitForFunction(() => document.querySelector('#total-checkin').textContent === '5');
  const before = backend.data.find(row => row[0] === ada.id)[7];
  await find(ada.id); assert.equal(await page.locator('#mark-present').count(), 0);
  assert.equal(backend.data.find(row => row[0] === ada.id)[7], before);
  await page.locator('#next-guest').click(); assert.equal(await page.locator('#checkin-result').textContent(), '');
  failList = true; await page.locator('#refresh').click();
  await page.waitForFunction(() => document.querySelector('#sync-status').dataset.state === 'stale');
  assert.equal(await page.locator('.admin-row').count(), 3); failList = false;
  await page.locator('#refresh').click(); await page.waitForFunction(() => document.querySelector('#sync-status').dataset.state === 'synced');
  const qr = await QRCode.toDataURL('DJSL-' + clara.id, { width: 400, margin: 4 });
  await page.evaluate(async src => {
    const img = new Image(); img.src = src; await img.decode();
    const canvas = document.createElement('canvas'); canvas.width = 720; canvas.height = 720;
    const g = canvas.getContext('2d');
    const draw = () => { g.fillStyle = '#fff'; g.fillRect(0, 0, 720, 720); g.drawImage(img, 150, 150, 420, 420); };
    draw(); window.testDraw = setInterval(draw, 200);
    navigator.mediaDevices.getUserMedia = async () => { const stream = canvas.captureStream(5); window.testStream = stream; return stream; };
  }, qr);
  await page.locator('#scan').click();
  await page.waitForFunction(() => document.querySelector('#checkin-result').textContent.includes('Jumlah Tamu: 1'));
  assert.equal(await page.locator('#scanner-video').isVisible(), false);
  assert.equal(await page.locator('#checkin-result img').count(), 0);
  await page.locator('#mark-present').click(); await page.waitForFunction(() => document.querySelector('#total-checkin').textContent === '6');
  await page.waitForFunction(() => window.testStream.getTracks().every(track => track.readyState === 'ended'));
  await page.evaluate(() => clearInterval(window.testDraw));
  const csvPromise = page.waitForEvent('download'); await page.locator('#export').click();
  const csv = await csvPromise; await csv.saveAs('artifacts/reception/reservasi.csv');
  assert.match(await fs.readFile('artifacts/reception/reservasi.csv', 'utf8'), /Adelia & Keluarga/);
  // A response arriving after logout must never restore private guest data.
  holdList = true;
  const started = new Promise(resolve => { listStarted = resolve; });
  await page.locator('#refresh').click(); await started;
  await page.locator('#logout').click(); releaseList();
  await page.waitForResponse(response => response.url().startsWith('https://script.google.com/'));
  await page.waitForTimeout(100);
  assert.equal(await page.locator('#admin-panel').isVisible(), false);
  assert.equal(await page.locator('.admin-row').count(), 0);
  assert.equal(await page.locator('#admin-pin').inputValue(), '');
  holdList = false;
  await page.goto('http://127.0.0.1:5173/admin'); await login();
  assert.equal(await page.locator('#total-checkin').textContent(), '6');
  await page.evaluate(() => { navigator.mediaDevices.getUserMedia = async () => { throw new DOMException('Denied', 'NotAllowedError'); }; });
  await page.locator('#scan').click();
  await page.waitForFunction(() => document.querySelector('#admin-status').textContent.includes('Kamera tidak tersedia'));
  assert.equal(await page.locator('#scan').isVisible(), true);
  assert.deepEqual(errors, []);
  console.log('PASS: responsive 320–1440, PIN protection, filters, formatted-code search, unknown code clears selection, failed write/retry, idempotent check-in, QR camera decode + stop, stale list, CSV, logout race, /admin alias, camera denial. Tests used isolated Apps Script harness; no live guest records changed.');
} finally { await browser.close(); }
