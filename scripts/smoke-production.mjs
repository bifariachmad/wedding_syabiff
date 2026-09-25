import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 const page=await browser.newPage({viewport:{width:360,height:640},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/');await page.waitForFunction(()=>document.querySelector('#app').dataset.ready==='true');
 while(await page.locator('#invitation').getAttribute('data-prologue')==='active'){await page.locator('#nav-next').click();await page.waitForFunction(()=>document.querySelector('#invitation').dataset.prologueBusy==='false');}
 for(let stop=0;stop<2;stop++){await page.locator('#nav-next').click();await page.waitForFunction(()=>document.querySelector('#invitation').dataset.courtyardBusy==='false');}
 for(let i=1;i<=14;i++){if(i===4)for(let stop=0;stop<3;stop++){await page.locator('#nav-next').click();await page.waitForFunction(()=>document.querySelector('#invitation').dataset.clockBusy==='false');}if(i===3)for(let stop=0;stop<4;stop++){await page.locator('#nav-next').click();await page.waitForFunction(()=>document.querySelector('#invitation').dataset.welcomeBusy==='false');}await page.locator('#nav-next').click();await page.waitForFunction(i=>document.querySelector('#invitation').dataset.scene===String(i)&&document.querySelector('#invitation').dataset.travelling==='false',i);}
 assert.equal(await page.locator('#reservation').getAttribute('aria-hidden'),null);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight&&document.documentElement.scrollWidth<=innerWidth),true);
 assert.equal(await page.locator('svg').count(),0);
 await page.screenshot({path:'artifacts/novel/production-reservation.png'});
 await page.goto('http://127.0.0.1:4173/admin/');await page.waitForSelector('#admin-login');
 assert.equal(await page.locator('#invitation').count(),0);assert.deepEqual(errors,[]);
 console.log('Production / and /admin/: passed. 16-scene navigation and small viewport: passed. No SVG DOM or browser errors.');
}finally{await browser.close();}

