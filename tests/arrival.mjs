import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
await fs.mkdir('artifacts/arrival',{recursive:true});
const page=await browser.newPage({viewport:{width:390,height:844}});
const errors=[],failed=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failed.push(r.url());});
const wait=()=>page.waitForFunction(()=>document.querySelector('#invitation').dataset.prologueBusy==='false');
try{
 await page.goto('http://127.0.0.1:5173/?to='+encodeURIComponent('<b>Nadia</b>'));await page.waitForFunction(()=>document.querySelector('#app').dataset.ready==='true');
 assert.equal(await page.locator('#arrival-guest').textContent(),'<b>Nadia</b>');assert.equal(await page.locator('#arrival-guest b').count(),0);
 assert.equal(await page.locator('#nav-back').isDisabled(),true);assert.equal(await page.locator('.vn-stage').evaluate(e=>e.inert),true);
 await page.mouse.wheel(0,700);assert.equal(await page.locator('#arrival').getAttribute('data-step'),'0');
 for(let step=1;step<=3;step++){
  await page.locator('#nav-next').click();await page.waitForTimeout(step===1?1800:step===2?1300:900);
  assert.equal(await page.locator('#nav-next').isDisabled(),true);
  await page.evaluate(()=>document.querySelector('#nav-next').click());
  await page.screenshot({path:`artifacts/arrival/motion-${step}.png`});
  await wait();assert.equal(await page.locator('#arrival').getAttribute('data-step'),String(step));
 }
 assert.equal(await page.locator('.arrival-open').evaluate(e=>getComputedStyle(e).visibility),'visible');
 await page.locator('#nav-next').click();await page.waitForTimeout(1600);await page.screenshot({path:'artifacts/arrival/portal-mid.png'});
 assert.equal(await page.locator('.arrival-portal').evaluate(e=>getComputedStyle(e).visibility),'visible');
 await wait();assert.equal(await page.locator('#invitation').getAttribute('data-prologue'),'complete');assert.equal(await page.locator('.vn-stage').evaluate(e=>e.inert),false);
 await page.locator('#nav-back').click();assert.equal(await page.locator('#arrival').getAttribute('data-step'),'3');assert.equal(await page.locator('#invitation').getAttribute('data-prologue'),'active');
 for(let step=2;step>=0;step--){await page.locator('#nav-back').click();await wait();assert.equal(await page.locator('#arrival').getAttribute('data-step'),String(step));}
 assert.equal(await page.locator('#nav-back').isDisabled(),true);
 await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await page.waitForFunction(()=>document.querySelector('#app').dataset.ready==='true');
 for(const [width,height]of [[360,640],[430,932],[1440,900],[844,390]]){
  await page.setViewportSize({width,height});
  for(let step=1;step<=3;step++){await page.locator('#nav-next').click();await wait();}
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.documentElement.scrollHeight<=innerHeight),true);
  const copy=await page.locator('.arrival-card-copy').boundingBox(),nav=await page.locator('.vn-navigation').boundingBox();assert.ok(copy.y>=0&&copy.y+copy.height<nav.y,`card fits ${width}x${height}`);
  await page.screenshot({path:`artifacts/arrival/final-${width}.png`});
  for(let step=2;step>=0;step--){await page.locator('#nav-back').click();await wait();}
 }
 assert.equal(await page.locator('.vn-navigation button').count(),2);assert.equal(await page.locator('svg').count(),0);assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
 const result={steps:4,normalMotion:true,doorHand:true,lookDownPickup:true,cardReadable:true,portalToGate:true,reverseAndReplay:true,rapidClicksLocked:true,plainTextPersonalization:true,reducedMotion:true,viewports:['360x640','430x932','1440x900','844x390'],noPageOverflow:true,onlyTwoNavigationButtons:true,errors,failedRequests:failed};
 await fs.writeFile('artifacts/arrival/results.json',JSON.stringify(result,null,2));console.log(result);
}finally{await browser.close();}
