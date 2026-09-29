import {chromium,devices} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 const page=await browser.newPage({...devices['iPhone 13'],reducedMotion:'reduce'});
 await page.route('**/src/config.js*',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace(/APPS_SCRIPT_URL: '[^']*'/,"APPS_SCRIPT_URL: ''")});});
 await page.route('**/src/invitation.js*',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('/* journey-ready */','window.testJourney=journey;')});});
 const open=async(url='http://127.0.0.1:5173/')=>{await page.goto(url);await page.waitForFunction(()=>window.testJourney);await page.evaluate(()=>window.testJourney.chapter('reservation'));};
 await open();assert.equal(await page.locator('#recall-ticket').isVisible(),false);assert.equal(await page.locator('#nav-next').textContent(),'Lanjut');
 await page.locator('#guest-name').fill('Tamu Satu');await page.locator('#submit-reservation').click();await page.waitForSelector('#reservation-success:visible');
 await open();assert.equal(await page.locator('#recall-ticket').isVisible(),true);
 for(const selector of ['#submit-reservation','#recall-ticket'])assert.ok(await page.locator(selector).evaluate(e=>{const form=document.querySelector('#reservation-form').getBoundingClientRect();return Math.abs(e.getBoundingClientRect().left-form.left)<1;}));
 await page.locator('#guest-name').fill('Tamu Baru');assert.equal(await page.locator('#recall-ticket').isVisible(),false);assert.equal(await page.locator('#nav-next').isDisabled(),true);
 await open('http://127.0.0.1:5173/?to=Tamu%20Baru');assert.equal(await page.locator('#guest-name').inputValue(),'Tamu Baru');assert.equal(await page.locator('#recall-ticket').isVisible(),false);
 await open();assert.equal(await page.locator('#guest-name').inputValue(),'Tamu Satu');assert.equal(await page.locator('#recall-ticket').isVisible(),true);
 console.log('PASS: fresh guest has no ticket action; saved matching guest can recall; edited/different recipient cannot recall stale ticket; both buttons left aligned; saved reservation preserved.');
}finally{await browser.close();}
