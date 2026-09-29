import {chromium,devices} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 const page=await browser.newPage({...devices['iPhone 13']});
 await page.addInitScript(()=>{localStorage.setItem('djsl-music','false');const Original=window.Audio;window.Audio=function(...args){const a=new Original(...args);window.testAudio=a;return a;};window.Audio.prototype=Original.prototype;});
 await page.route('**/src/invitation.js*',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('/* journey-ready */','window.testJourney=journey;')});});
 await page.goto('http://127.0.0.1:5173/');await page.waitForFunction(()=>window.testJourney);
 assert.equal(await page.evaluate(()=>!!window.testAudio),false);
 await page.locator('#nav-next').click();await page.waitForFunction(()=>window.testAudio&&!window.testAudio.paused&&window.testAudio.currentTime>0);
 assert.equal(await page.evaluate(()=>window.testAudio.muted),false);assert.equal(await page.evaluate(()=>window.testAudio.volume),.1);
 await page.locator('#music-toggle').click();assert.equal(await page.evaluate(()=>window.testAudio.muted),true);
 await page.waitForFunction(()=>document.querySelector('#invitation').dataset.prologueBusy!=='true');
 await page.locator('#nav-next').click();assert.equal(await page.evaluate(()=>window.testAudio.muted),true);
 await page.waitForFunction(()=>document.querySelector('#invitation').dataset.prologueBusy!=='true');
 await page.evaluate(()=>window.testJourney.chapter('greeting'));
 const elapsed=await page.evaluate(async()=>{const start=performance.now();await window.testJourney.goTo(3);return performance.now()-start;});
 assert.ok(elapsed<1100,`fade took ${elapsed} ms`);assert.equal(await page.locator('.journey-walkers,.journey-fade').count(),0);
 console.log('PASS: first Next starts actual BGM playback even with old muted preference; manual mute persists on later Next; no walking overlay; fade completes in '+Math.round(elapsed)+' ms.');
}finally{await browser.close();}
