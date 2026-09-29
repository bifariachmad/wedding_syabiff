import {chromium,devices} from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createBackend} from './gas-harness.mjs';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const backend=createBackend(),errors=[];
await fs.mkdir('artifacts/portrait',{recursive:true});
const context=await browser.newContext({...devices['iPhone 13'],viewport:{width:390,height:844},reducedMotion:'reduce',acceptDownloads:true});
await context.route('**/src/config.js*',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace(/APPS_SCRIPT_URL: '[^']*'/,"APPS_SCRIPT_URL: '/test-reservation'")});});
await context.route('**/test-reservation',r=>r.fulfill({contentType:'application/json',body:JSON.stringify(backend.call(r.request().postDataJSON()))}));
await context.route('**/src/invitation.js*',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('/* journey-ready */','/* journey-ready */window.testJourney=journey;')});});
const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
const chapter=id=>page.evaluate(id=>window.testJourney.chapter(id),id),next=()=>page.evaluate(()=>window.testJourney.next());
const shot=name=>page.screenshot({path:`artifacts/portrait/${name}.png`});
try{
 await page.goto('http://127.0.0.1:5173/');await page.waitForFunction(()=>window.testJourney);await page.evaluate(()=>document.fonts.ready);
 for(const [width,height] of [[360,640],[390,844],[430,932],[768,1024],[820,1180]]){
  await page.setViewportSize({width,height});
  const box=await page.locator('#app').boundingBox();assert.ok(Math.abs(box.width/box.height-9/16)<.002);
  await chapter('location');await shot(`location-${width}`);assert.equal(await page.locator('.maproom-venue').isVisible(),true);
  await chapter('rundown-0');await shot(`agenda-${width}`);assert.equal(await page.locator('.agenda-entry').count(),8);
  assert.ok(await page.locator('.agenda-entry').evaluateAll(rows=>rows.every((e,i)=>!i||rows[i-1].getBoundingClientRect().bottom<=e.getBoundingClientRect().top+1)));
  await chapter('dresscode');await page.evaluate(()=>window.testJourney.goTo('reservation'));await shot(`book-closed-${width}`);
  assert.equal(await page.locator('.book-right').evaluate(e=>getComputedStyle(e).opacity),'0');
  await next();assert.equal(await page.locator('#reservation').getAttribute('data-book-step'),'2');await shot(`book-form-${width}`);
  const geometry=await page.evaluate(()=>{const a=document.querySelector('.book-right').getBoundingClientRect(),b=document.querySelector('#reservation .vn-dialogue').getBoundingClientRect();return [a.left-b.left,a.top-b.top,a.width-b.width,a.height-b.height];});assert.ok(geometry.every(x=>Math.abs(x)<2),JSON.stringify(geometry));
  assert.equal(await page.locator('#reservation-form').isVisible(),true);
  assert.equal(await page.locator('#guest-name').evaluate(e=>getComputedStyle(e).backgroundColor),'rgba(0, 0, 0, 0)');
 }
 await page.setViewportSize({width:390,height:844});await page.locator('#guest-name').fill('Nadia Utami');await page.locator('#submit-reservation').click();await page.waitForSelector('#reservation-success:visible');await shot('success');assert.match(backend.data[1][0],/^[1-9][0-9]{5}$/);
 await next();await page.waitForSelector('.ticket-preview:visible');await shot('ticket');
 const download=page.waitForEvent('download');await page.locator('#save-summary').click();await(await download).saveAs('artifacts/portrait/ticket-export.png');
 await page.setViewportSize({width:1024,height:768});assert.equal(await page.locator('.device-notice').isVisible(),true);assert.match(await page.locator('.device-notice').textContent(),/Putar/);
 await page.setViewportSize({width:390,height:844});await chapter('gate');await page.emulateMedia({reducedMotion:'no-preference'});await next();await next();assert.equal(await page.locator('#invitation').getAttribute('data-scene'),'1');await shot('wedding');
 await chapter('location');await next();await next();assert.equal(await page.locator('#invitation').getAttribute('data-scene'),'5');await next();assert.equal(await page.locator('#invitation').getAttribute('data-scene'),'6');
 await page.evaluate(()=>window.testJourney.goTo('reservation'));await next();await shot('book-normal-motion');
 const sound=await page.evaluate(async()=>{const a=new Audio('/assets/audio/canon-in-d-piano.mp3');await new Promise((ok,no)=>{a.onloadedmetadata=ok;a.onerror=no});return a.duration;});assert.ok(sound>150);
 const desktop=await browser.newPage({viewport:{width:1440,height:900}});await desktop.goto('http://127.0.0.1:5173/');await desktop.waitForSelector('.device-notice');await desktop.screenshot({path:'artifacts/portrait/desktop.png'});assert.match(await desktop.locator('.device-notice').textContent(),/Buka undangan di HP/);assert.equal(await desktop.locator('#invitation').count(),0);
 assert.deepEqual(errors,[]);console.log('PASS: portrait 9:16 phone/tablet, desktop and landscape gate, scene flow, book geometry, form styling, live-backend mock six-digit ticket, export, scroll transitions, audio asset.');
}finally{await browser.close();}
