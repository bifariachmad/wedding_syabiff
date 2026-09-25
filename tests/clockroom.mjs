import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const p=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[],failed=[];
p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)failed.push(r.url());});
await fs.mkdir('artifacts/clockroom',{recursive:true});
const settle=()=>p.waitForFunction(()=>{const d=document.querySelector('#invitation').dataset;return d.travelling==='false'&&d.prologueBusy!=='true'&&d.courtyardBusy!=='true'&&d.welcomeBusy!=='true'&&d.clockBusy!=='true';});
const next=async()=>{await p.locator('#nav-next').click();await settle();};
const back=async()=>{await p.locator('#nav-back').click();await settle();};
try{
 await p.goto('http://127.0.0.1:5173/');await p.waitForFunction(()=>document.querySelector('#app').dataset.ready==='true');
 for(let i=0;i<11;i++)await next();
 await p.locator('#greeting img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));
 await p.screenshot({path:'artifacts/clockroom/matching-door-closed.png'});
 await p.emulateMedia({reducedMotion:'no-preference'});
 await p.locator('#nav-next').click();await p.waitForTimeout(1000);await p.screenshot({path:'artifacts/clockroom/matching-door-opening.png'});
 await p.waitForFunction(()=>document.querySelector('#greeting').dataset.speaking==='true');
 const mouth=await p.locator('#greeting .is-speaking .host-open').evaluate(async e=>{const values=[];for(let i=0;i<15;i++){values.push(getComputedStyle(e).opacity);await new Promise(r=>setTimeout(r,20));}return values;});
 assert.ok(mouth.includes('0')&&mouth.includes('1'),'mouth alternates open and closed');
 await p.screenshot({path:'artifacts/clockroom/bifari-speaking.png'});await settle();
 for(let i=0;i<3;i++)await next();
 assert.match(await p.locator('#welcome-line').textContent(),/jam besar/);
 await next();assert.equal(await p.locator('#invitation').getAttribute('data-scene'),'3');
 await p.screenshot({path:'artifacts/clockroom/arrival.png'});
 await next();await next();
 assert.equal(await p.locator('#countdown').getAttribute('data-clock-step'),'2');
 assert.equal(await p.locator('.clockroom-countdown').evaluate(e=>getComputedStyle(e).visibility),'visible');
 const before=await p.locator('[data-digit="3"]').textContent();await p.waitForTimeout(1100);assert.notEqual(await p.locator('[data-digit="3"]').textContent(),before);
 await p.screenshot({path:'artifacts/clockroom/countdown.png'});
 await next();await next();assert.equal(await p.locator('#invitation').getAttribute('data-scene'),'4');
 await back();assert.equal(await p.locator('#countdown').getAttribute('data-clock-step'),'3');
 await back();await back();await back();await back();assert.equal(await p.locator('#greeting').getAttribute('data-welcome-step'),'4');
 assert.equal(await p.locator('#greeting .character-bifari').evaluate(e=>new DOMMatrix(getComputedStyle(e).transform).a),1);
 await next();await p.emulateMedia({reducedMotion:'reduce'});
 for(const [width,height]of [[360,640],[430,932],[1440,900],[844,390]]){
  await p.setViewportSize({width,height});
  for(let step=0;step<4;step++){
   if(step)await next();
   assert.equal(await p.locator('#countdown').getAttribute('data-clock-step'),String(step));
   const box=await p.locator('#countdown .vn-dialogue').boundingBox(),nav=await p.locator('.vn-bottom').boundingBox();
   assert.ok(box.x>=0&&box.x+box.width<=width&&box.y>=0&&box.y+box.height<nav.y);
   if(step>=2){const card=await p.locator('.clockroom-countdown').boundingBox();assert.ok(card.y+card.height<=box.y||card.x+card.width<=box.x,`countdown and dialogue do not overlap ${width}: ${JSON.stringify({card,box})}`);}
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.documentElement.scrollHeight<=innerHeight),true);
   await p.screenshot({path:`artifacts/clockroom/${width}-${step}.png`});
  }
  await back();await back();await back();
 }
 assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
 const result={fourClockStops:true,mouthFrames:true,matchingDoorLayers:true,followHosts:true,countdownTicks:true,forwardBackReplay:true,fourViewports:true,noOverlap:true,errors,failed};
 await fs.writeFile('artifacts/clockroom/results.json',JSON.stringify(result,null,2));console.log(result);
}finally{await browser.close();}
