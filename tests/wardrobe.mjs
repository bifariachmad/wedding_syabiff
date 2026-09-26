import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
const settle=()=>page.waitForFunction(()=>{const d=document.querySelector('#invitation').dataset;return d.travelling==='false'&&['prologueBusy','courtyardBusy','welcomeBusy','clockBusy','mapBusy','wardrobeBusy'].every(k=>d[k]!=='true');});
const click=async(back=false)=>{await page.locator(back?'#nav-back':'#nav-next').click();await settle();};
try{
 await fs.mkdir('artifacts/wardrobe',{recursive:true});await page.goto('http://127.0.0.1:5173/');await page.waitForFunction(()=>document.querySelector('#app').dataset.ready==='true');
 while(await page.locator('#invitation').getAttribute('data-prologue')==='active'||await page.locator('#invitation').getAttribute('data-scene')!=='12')await click();
 await page.emulateMedia({reducedMotion:'no-preference'});await click();assert.equal(await page.locator('#dresscode').getAttribute('data-wardrobe-step'),'0');await page.screenshot({path:'artifacts/wardrobe/entrance.png'});await click();assert.equal(await page.locator('.wardrobe-swatch').isVisible(),true);await page.screenshot({path:'artifacts/wardrobe/maroon.png'});await click(true);await page.emulateMedia({reducedMotion:'reduce'});
 for(const [width,height]of [[360,640],[430,932],[1440,900],[844,390]]){
  await page.setViewportSize({width,height});
  for(let i=0;i<4;i++){if(i)await click();assert.equal(await page.locator('#dresscode').getAttribute('data-wardrobe-step'),String(i));assert.equal(await page.locator('.wardrobe-swatch').isVisible(),i===1||i===2);assert.equal(await page.locator('#dresscode .vn-speaker').textContent(),i===2?'BIFARI':'SYAFIRA');const d=await page.locator('#dresscode .vn-dialogue').boundingBox(),n=await page.locator('.vn-bottom').boundingBox();assert.ok(d.x>=0&&d.y>=0&&d.x+d.width<=width+1&&d.y+d.height<=n.y+1);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.documentElement.scrollHeight<=innerHeight),true);if(i===1){const w=await page.locator('.wardrobe-swatch').boundingBox();assert.ok(w.x>=0&&w.x+w.width<=width+1,'cloth inside viewport');}if(i===1)await page.screenshot({path:`artifacts/wardrobe/${width}.png`});}
  await click();assert.equal(await page.locator('#invitation').getAttribute('data-scene'),'14');await click(true);assert.equal(await page.locator('#dresscode').getAttribute('data-wardrobe-step'),'3');for(let i=0;i<3;i++)await click(true);await click(true);assert.equal(await page.locator('#invitation').getAttribute('data-scene'),'12');await click();
 }
 assert.equal(await page.locator('#dresscode img').evaluateAll(a=>a.every(x=>x.complete&&x.naturalWidth>0)),true);assert.equal(await page.locator('svg').count(),0);assert.deepEqual(errors,[]);console.log('Scene 7: four reading stops, normal-motion entrance, maroon reveal, forward/back replay, 4 viewports, all PNGs loaded; no browser errors.');
}finally{await browser.close();}
