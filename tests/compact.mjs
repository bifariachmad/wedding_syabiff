import {chromium,devices} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage({...devices['iPhone 13'],reducedMotion:'reduce'});
await page.route('**/src/config.js*',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace(/APPS_SCRIPT_URL: '[^']*'/,"APPS_SCRIPT_URL: ''")});});
await page.route('**/src/invitation.js*',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('/* journey-ready */','window.testJourney=journey;')});});
await fs.mkdir('artifacts/compact',{recursive:true});
try{
 await page.goto('http://127.0.0.1:5173/');await page.waitForFunction(()=>window.testJourney);await page.evaluate(()=>window.testJourney.chapter('reservation'));
 await page.locator('#guest-name').fill('Tamu Pengujian');await page.locator('#submit-reservation').click();await page.waitForSelector('#reservation-success:visible');
 await page.reload();await page.waitForFunction(()=>window.testJourney);await page.evaluate(()=>window.testJourney.chapter('reservation'));
 for(const [width,height] of [[360,640],[390,844],[768,1024]]){
  await page.setViewportSize({width,height});await page.waitForTimeout(150);
  assert.equal(await page.locator('#recall-ticket').isVisible(),true);
  const fit=await page.locator('.book-writing-area').evaluate(e=>{const box=e.getBoundingClientRect(),c=e.querySelector('.vn-form-content');return {fits:c.scrollHeight<=c.clientHeight+1,bottom:e.querySelector('#recall-ticket').getBoundingClientRect().bottom<=box.bottom+1};});assert.ok(fit.fits&&fit.bottom,JSON.stringify({width,...fit}));
  await page.screenshot({path:`artifacts/compact/reservation-${width}.png`});
 }
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.testJourney.chapter('greeting'));await page.emulateMedia({reducedMotion:'no-preference'});
 await page.evaluate(()=>{window.transition=window.testJourney.goTo(3)});await page.waitForTimeout(230);assert.equal(await page.locator('.journey-walkers img').count(),0);assert.ok(Number(await page.locator('.journey-fade').evaluate(e=>getComputedStyle(e).opacity))>.9);await page.screenshot({path:'artifacts/compact/fade.png'});await page.evaluate(()=>window.transition);assert.equal(await page.locator('.journey-fade').count(),0);
 console.log('PASS: saved reservation including recall button fits without scroll at phone/tablet sizes; quick fade appears without walking characters and cleans up.');
}finally{await browser.close();}
