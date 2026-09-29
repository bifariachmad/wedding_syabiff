import {chromium,devices} from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage({...devices['iPhone 13'],viewport:{width:390,height:844},reducedMotion:'reduce'});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('**/src/invitation.js*',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('/* journey-ready */','window.testJourney=journey;')});});
await fs.mkdir('artifacts/layer-feedback',{recursive:true});
const shot=n=>page.screenshot({path:`artifacts/layer-feedback/${n}.png`});
try{
 await page.goto('http://127.0.0.1:5173/');await page.waitForFunction(()=>window.testJourney);
 assert.equal(await page.locator('#chapter-toggle,#chapter-menu').count(),0);
 await page.evaluate(()=>window.testJourney.chapter('greeting'));await page.evaluate(()=>window.testJourney.next());await shot('characters');
 await page.evaluate(()=>window.testJourney.chapter('location'));await page.emulateMedia({reducedMotion:'no-preference'});
 await page.evaluate(()=>{window.transition=window.testJourney.goTo(5)});await page.waitForTimeout(1150);await shot('scroll-middle');await page.evaluate(()=>window.transition);await shot('scroll-open');
 assert.equal(await page.locator('.agenda-roll').count(),1);assert.equal(await page.locator('img[src$="scroll-desk.png"]').count(),0);
 await page.evaluate(()=>{window.transition=window.testJourney.next()});await page.waitForTimeout(650);await shot('scroll-closing');await page.evaluate(()=>window.transition);
 await page.evaluate(()=>window.testJourney.goTo(7));await shot('book-closed');
 await page.evaluate(()=>{window.transition=window.testJourney.next()});await page.waitForTimeout(600);await shot('book-middle');await page.waitForTimeout(500);await shot('book-turn');await page.evaluate(()=>window.transition);assert.equal(await page.locator('#reservation').getAttribute('data-book-step'),'2');await shot('book-zoom');
 assert.deepEqual(errors,[]);console.log('PASS: no menu, single scroll roller, opening/closing and book intermediate frames, no browser errors.');
}finally{await browser.close();}
