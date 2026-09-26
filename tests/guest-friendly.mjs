import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import sharp from 'sharp';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage({viewport:{width:360,height:640},reducedMotion:'reduce',acceptDownloads:true});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('**/src/invitation.js*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('initChapterMenu(journey);','initChapterMenu(journey);window.testJourney=journey;')});});
const go=i=>page.evaluate(i=>window.testJourney.goTo(i),i),next=()=>page.evaluate(()=>window.testJourney.next());
const shot=name=>page.screenshot({path:`artifacts/guest-friendly/${name}.png`});
async function menu(id){await page.locator('#chapter-toggle').click();await page.locator(`[data-chapter="${id}"]`).click();await page.waitForFunction(()=>{const d=document.querySelector('#invitation').dataset;return d.travelling==='false'&&d.bookBusy!=='true'&&d.prologueBusy!=='true';});}
try{
 await fs.mkdir('artifacts/guest-friendly',{recursive:true});await page.goto('http://127.0.0.1:5173');await page.waitForFunction(()=>window.testJourney);await page.evaluate(()=>document.fonts.ready);
 await page.locator('#chapter-toggle').click();await shot('menu');await page.keyboard.press('Escape');assert.equal(await page.locator('#chapter-menu').isVisible(),false);assert.equal(await page.locator('#chapter-toggle').evaluate(e=>e===document.activeElement),true);
 await menu('closing');assert.equal(await page.locator('#invitation').getAttribute('data-scene'),'14');assert.equal(await page.locator('#reservation').getAttribute('data-book-step'),'2');assert.equal(await page.locator('#nav-next').isDisabled(),true);assert.match(await page.locator('#reservation-status').textContent(),/Silakan isi nama/);
 await menu('arrival');assert.equal(await page.locator('#invitation').getAttribute('data-prologue'),'active');await menu('gate');assert.equal(await page.locator('#invitation').getAttribute('data-prologue'),'complete');
 for(const [width,height]of [[360,640],[430,932],[1440,900],[844,390]]){
  await page.setViewportSize({width,height});await page.evaluate(()=>window.testJourney.chapter('location'));await shot(`location-${width}`);
  await go(12);await shot(`scroll-${width}`);assert.equal(await page.locator('#rundown-7 .agenda-entry:not([hidden])').count(),8);
  await go(13);await go(14);assert.equal(await page.locator('#reservation-form').isVisible(),false);await shot(`closed-${width}`);await next();await shot(`open-${width}`);await next();await shot(`form-${width}`);
  assert.equal(await page.locator('#reservation-form').isVisible(),true);assert.equal(await page.locator('#nav-next').isDisabled(),true);
  const bounds=await page.locator('.book-writing-area').evaluate(e=>{const r=e.getBoundingClientRect();return [...e.querySelectorAll('input:not([type="hidden"]),.reservation-intro')].filter(x=>x.offsetWidth&&!x.closest('.honeypot')).map(x=>{const b=x.getBoundingClientRect();return b.left>=r.left-1&&b.right<=r.right+1&&x.scrollWidth<=x.clientWidth+1;});});assert.ok(bounds.every(Boolean),`form text is inside page at ${width}`);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.documentElement.scrollHeight<=innerHeight),true);
  await go(15);assert.equal(await page.locator('#invitation').getAttribute('data-scene'),'14');
 }
 await page.setViewportSize({width:390,height:844});await go(13);await page.emulateMedia({reducedMotion:'no-preference'});await go(14);await next();await next();
 await page.locator('#guest-name').fill('Nadia Utami');await page.locator('#guest-count').fill('3');await page.locator('#guest-count').dispatchEvent('input');await page.locator('#submit-reservation').click();await page.waitForSelector('#reservation-success:visible');assert.match(await page.locator('#reservation-success').textContent(),/Data hanya tersimpan/);await shot('success');assert.equal(await page.locator('#nav-next').isEnabled(),true);
 await next();assert.equal(await page.locator('#invitation').getAttribute('data-scene'),'15');await page.waitForSelector('.summary-qr:visible');assert.equal(await page.locator('.summary-name').textContent(),'Nadia Utami');assert.equal(await page.locator('.summary-guests').textContent(),'3 tamu');assert.equal(await page.locator('#share,#closing-music').count(),0);
 const decoded=await page.evaluate(async()=>{const{default:QrScanner}=await import('/node_modules/qr-scanner/qr-scanner.min.js');return(await QrScanner.scanImage(document.querySelector('.summary-qr').src,{returnDetailedScanResult:true})).data;});assert.match(decoded,/^DEMO-DJSL-/);
 const dl=page.waitForEvent('download');await page.locator('#save-summary').click();await(await dl).saveAs('artifacts/guest-friendly/export.png');const metadata=await sharp('artifacts/guest-friendly/export.png').metadata();assert.equal(metadata.width,1080);assert.equal(metadata.height,1600);
 for(const[width,height]of [[360,640],[430,932],[1440,900],[844,390]]){await page.setViewportSize({width,height});await shot(`summary-${width}`);assert.equal(await page.locator('#save-summary').isVisible(),true);const ticketBounds=await page.locator('#closing .vn-dialogue').evaluate(e=>{const r=e.getBoundingClientRect(),save=e.querySelector('#save-summary').getBoundingClientRect();return {onScreen:r.left>=0&&r.right<=innerWidth,saveInside:save.bottom<=r.bottom-6,horizontal:e.scrollWidth<=e.clientWidth+1};});assert.ok(ticketBounds.onScreen&&ticketBounds.saveInside&&ticketBounds.horizontal,JSON.stringify({width,...ticketBounds}));}
 await page.setViewportSize({width:390,height:844});await menu('reservation');await page.locator('#edit-reservation').click();await page.locator('#guest-name').fill('Siti Aminah dan Keluarga');assert.equal(await page.locator('#nav-next').isDisabled(),true);await menu('closing');assert.equal(await page.locator('#invitation').getAttribute('data-scene'),'14');await page.locator('#submit-reservation').click();await page.waitForSelector('#reservation-success:visible');await menu('closing');assert.equal(await page.locator('.summary-name').textContent(),'Siti Aminah dan Keluarga');await shot('summary-family');
 await page.reload();await page.waitForFunction(()=>window.testJourney);await menu('closing');assert.equal(await page.locator('#invitation').getAttribute('data-scene'),'15');assert.equal(await page.locator('.summary-name').textContent(),'Siti Aminah dan Keluarga');assert.deepEqual(errors,[]);
 console.log('PASS: chapter navigation, keyboard dismissal, unsaved reservation guard, saved-ticket reload, coherent book sequence, form bounds in 4 viewports, edited-ticket guard, QR decoding and 1080x1600 export.');
}finally{await browser.close();}
