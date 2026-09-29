import {chromium,devices} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 const page=await browser.newPage({...devices['iPhone 13'],reducedMotion:'reduce'});
 await page.route('**/src/invitation.js*',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('/* journey-ready */','window.testJourney=journey;')});});
 await page.goto('http://127.0.0.1:5173/');await page.waitForFunction(()=>window.testJourney);await page.evaluate(()=>window.testJourney.chapter('gate'));await page.evaluate(()=>window.testJourney.next());await page.emulateMedia({reducedMotion:'no-preference'});
 await page.evaluate(()=>{window.transition=window.testJourney.next()});
 await page.waitForFunction(()=>document.querySelector('#gate').dataset.walk==='walking');
 const scale=()=>page.locator('#gate .courtyard-camera').evaluate(e=>new DOMMatrix(getComputedStyle(e).transform).a);
 const before=await scale();await page.waitForTimeout(1200);assert.ok(await scale()>before+.2);assert.equal(await page.locator('#cover .vn-dialogue').evaluate(e=>getComputedStyle(e).opacity),'0');assert.equal(await page.locator('.journey-fade').count(),0);
 await page.evaluate(()=>window.transition);assert.equal(await page.locator('#gate').getAttribute('data-walk'),'complete');assert.equal(await page.locator('#cover').getAttribute('class').then(c=>c.includes('is-active')),true);assert.ok(Math.abs(await scale()-2.65)<.02);assert.equal(await page.locator('#cover .vn-dialogue').evaluate(e=>getComputedStyle(e).opacity),'1');
 console.log('PASS: gate opens, camera walks inward before title, final scale 2.65 retained, no transition overlay during walk.');
}finally{await browser.close();}
