import {chromium,devices} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 const page=await browser.newPage({...devices['iPhone 13'],reducedMotion:'reduce'});
 await page.route('**/src/config.js*',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace(/APPS_SCRIPT_URL: '[^']*'/,"APPS_SCRIPT_URL: ''")});});
 await page.route('**/src/invitation.js*',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('/* journey-ready */','window.testJourney=journey;')});});
 await page.goto('http://127.0.0.1:5173/');await page.waitForFunction(()=>window.testJourney);
 assert.equal(await page.locator('#chapter-toggle,#chapter-menu').count(),0);
 await page.evaluate(()=>window.testJourney.chapter('reservation'));await page.locator('#guest-name').fill('Tamu Pengujian');await page.locator('#submit-reservation').click();await page.waitForSelector('#reservation-success:visible');await page.evaluate(()=>window.testJourney.next());
 const code=await page.locator('.summary-code').textContent();assert.equal(await page.locator('#nav-next').isVisible(),false);assert.equal(await page.evaluate(()=>window.testJourney.next()),false);
 await page.evaluate(()=>window.testJourney.back());assert.equal(await page.locator('#nav-next').isVisible(),true);
 await page.reload();await page.waitForFunction(()=>window.testJourney);await page.evaluate(()=>window.testJourney.chapter('closing'));assert.equal(await page.locator('.summary-code').textContent(),code);assert.equal(await page.locator('#nav-next').isVisible(),false);
 console.log('PASS: no menu or replay button, back restored, saved ticket survives reload.');
}finally{await browser.close();}
