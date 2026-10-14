import { chromium, devices } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createBackend } from './gas-harness.mjs';

const base = process.env.INVITATION_BASE_URL || 'http://127.0.0.1:5173';
const out = 'artifacts/rsvp';
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
try {
  const context = await browser.newContext({ ...devices['iPhone 13'], reducedMotion: 'reduce' });
  const backend = createBackend(), errors = [], requests = [];
  let failSave = false;
  await context.route('https://script.google.com/**', route => route.abort());
  await context.route(/\/src\/config\.js(?:\?.*)?$/, async route => {
    const response = await route.fetch();
    await route.fulfill({ response, body: (await response.text()).replace(/APPS_SCRIPT_URL: [^\r\n]+/, "APPS_SCRIPT_URL: '" + base + "/__test-api',") });
  });
  await context.route(/\/src\/invitation\.js(?:\?.*)?$/, async route => {
    const response = await route.fetch();
    await route.fulfill({ response, body: (await response.text()).replace('/* journey-ready */', 'window.auditJourney=journey;') });
  });
  await context.route('**/__test-api', async route => {
    const body = route.request().postDataJSON(); requests.push(body);
    await route.fulfill({ json: failSave ? { ok: false, error: 'Gagal uji' } : backend.call(body) });
  });
  // Decoration failures must not block RSVP or the saved ticket.
  await context.route('**/assets/png/ticket/stationery-no-lantern.png', route => route.abort());
  await context.route('**/assets/png/title/wedding-logo-stamp-v1.png', route => route.abort());
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  const settled = () => page.waitForFunction(() => !Object.entries(document.querySelector('#invitation').dataset).some(([key,value]) => (key.endsWith('Busy') || key === 'travelling') && value === 'true'));
  async function openBook(query = '?to=Nadia%20Utami') {
    await page.goto(base + '/' + query);
    await page.waitForFunction(() => document.querySelector('#app')?.dataset.ready === 'true');
    await page.evaluate(() => auditJourney.chapter('reservation'));
    await settled();
  }
  async function save() {
    await page.locator('#submit-reservation').click();
    await page.waitForSelector('#reservation-success:visible');
    await page.waitForFunction(() => !document.querySelector('#guest-name').disabled);
  }
  async function screenshot(name) {
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: out + '/' + name + '.png' });
  }
  await openBook();
  assert.equal(await page.locator('[name="attendance"]:checked').count(), 0);
  assert.equal(await page.locator('#submit-reservation').isDisabled(), true);
  assert.equal(await page.locator('#guest-count-field').isHidden(), true);
  for (const [width,height] of [[360,640],[390,844],[768,1024]]) {
    await page.setViewportSize({ width,height });
    await screenshot('choice-' + width);
    for (const label of await page.locator('.attendance-options label').all()) {
      const box = await label.boundingBox();
      assert.ok(box.height >= 44 && box.x >= 0 && box.x + box.width <= width, 'RSVP choices fit and remain touch-friendly');
    }
  }
  await page.setViewportSize({ width:390,height:844 });
  await page.getByRole('radio', { name:'Tidak dapat hadir', exact:true }).check();
  assert.equal(await page.locator('#guest-count').isDisabled(), true);
  await save();
  assert.deepEqual({ ...requests.find(request => request.action === 'reserve'), name:undefined, action:undefined, website:undefined }, { name:undefined, action:undefined, website:undefined, guests:0, attendance:'declined' });
  const id = backend.data[1][0];
  assert.equal(await page.locator('.ticket-qr').count(), 0);
  assert.match(await page.locator('#reservation-success').textContent(), /Tidak dapat hadir/);
  for (const [width,height] of [[360,640],[390,844],[768,1024]]) {
    await page.setViewportSize({ width,height });
    await page.locator('#edit-reservation').scrollIntoViewIfNeeded();
    await screenshot('declined-' + width);
  }
  await page.locator('#nav-next').click(); await settled();
  assert.equal(await page.locator('#closing-title').textContent(), 'Terima Kasih');
  assert.equal(await page.locator('#declined-summary').isVisible(), true);
  assert.equal(await page.locator('#save-summary').isHidden(), true);
  assert.equal(await page.locator('.ticket-preview').getAttribute('src'), null);
  await screenshot('closing-declined');

  // Reload a persisted decline, then change to attending and preserve the record.
  await openBook();
  assert.equal(await page.getByRole('radio', { name:'Tidak dapat hadir', exact:true }).isChecked(), true);
  assert.equal(await page.locator('#recall-ticket').textContent(), 'Lihat Konfirmasi');
  await page.getByRole('radio', { name:'Akan hadir', exact:true }).check();
  assert.equal(await page.locator('#recall-ticket').isHidden(), true);
  assert.equal(await page.locator('#nav-next').isDisabled(), true);
  await page.locator('#guest-count').fill('3');

  for (const [width,height] of [[360,640],[390,844],[768,1024]]) {
    await page.setViewportSize({width,height});
    await page.locator('#submit-reservation').scrollIntoViewIfNeeded();
    await screenshot('attending-form-' + width);
    const button = await page.locator('#submit-reservation').boundingBox();
    const content = await page.locator('.vn-form-content').boundingBox();
    assert.ok(button.y + button.height <= content.y + content.height + 1, 'Save remains reachable in the book');
  }
  await save();
  assert.equal(backend.data[1][0], id);
  assert.equal(backend.data[1][5], 3);
  assert.equal(await page.locator('.ticket-qr').count(), 1);
  await page.locator('#nav-next').click(); await settled();
  assert.equal(await page.locator('#save-summary').isVisible(), true);
  assert.equal(await page.locator('#declined-summary').isHidden(), true);
  assert.equal(await page.locator('.ticket-preview').isVisible(), true);
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#summary-calendar').click();
  const download = await downloadPromise;
  const calendar = await fs.readFile(await download.path(), 'utf8');
  assert.match(calendar, /BEGIN:VCALENDAR/);
  assert.match(calendar, /DTSTART:20261031T090000Z/);

  // A failed change leaves the last saved RSVP intact and allows a retry.
  await openBook();
  await page.getByRole('radio', { name:'Tidak dapat hadir', exact:true }).check();
  failSave = true;
  await page.locator('#submit-reservation').click();
  await page.waitForFunction(() => document.querySelector('#reservation-status').textContent.includes('Gagal mengirim'));
  assert.equal(backend.data[1][5], 3);
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('djsl-ticket')).guests), 3);
  assert.equal(await page.locator('#nav-next').isDisabled(), true);
  assert.equal(await page.locator('#submit-reservation').isEnabled(), true);
  failSave = false;
  await save();
  assert.equal(backend.data.length, 2);
  assert.equal(backend.data[1][5], 0);
  assert.equal(backend.call({ action:'checkin', id, pin:'test-only-pin' }).ok, false);
  assert.equal(await page.locator('.ticket-qr').count(), 0);
  assert.equal(await page.locator('.ticket-preview').getAttribute('src'), null);
  await openBook('?to=Tamu%20Lain');
  assert.equal(await page.locator('[name="attendance"]:checked').count(), 0, 'Another named invitation does not inherit the response');
  assert.equal(await page.locator('#nav-next').isDisabled(), true);
  backend.call({action:'saveSettings',pin:'test-only-pin',rsvpOpen:false});
  await openBook('?to=Tamu%20Baru');
  await page.getByRole('radio', {name:'Akan hadir',exact:true}).check();
  await page.waitForFunction(() => document.querySelector('#reservation-status').textContent.includes('ditutup'));
  assert.equal(await page.locator('#submit-reservation').isDisabled(), true);
  assert.deepEqual(errors, []);
  console.log('PASS: explicit RSVP, declined/attending, stable record, reload, failure/retry, old ticket blocked, phone/tablet layouts.');
} finally {
  await browser.close();
}
