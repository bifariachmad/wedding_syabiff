import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
await page.goto('http://127.0.0.1:5173/');await page.waitForSelector('.device-notice:visible');assert.equal(await page.locator('#invitation').count(),0);
await page.setViewportSize({width:440,height:956});await page.waitForSelector('#invitation:visible');await page.waitForFunction(()=>document.querySelector('#app').dataset.ready==='true');assert.equal(await page.locator('.device-notice').isVisible(),false);
await page.locator('#nav-next').click();await page.waitForFunction(()=>document.querySelector('#arrival').dataset.step==='1'&&document.querySelector('#invitation').dataset.prologueBusy==='false');
await page.setViewportSize({width:1440,height:900});await page.waitForSelector('.device-notice:visible');
await page.setViewportSize({width:440,height:956});await page.waitForSelector('#invitation:visible');assert.equal(await page.locator('#arrival').getAttribute('data-step'),'1');assert.equal(await page.locator('#invitation').count(),1);assert.equal(await page.locator('.device-notice').count(),1);
await page.screenshot({path:'artifacts/portrait/mobile-detection-fixed.png'});
console.log('PASS: desktop to mobile without reload, first interaction, return to desktop and mobile preserves progress, no duplicate scene.');
}finally{await browser.close();}
