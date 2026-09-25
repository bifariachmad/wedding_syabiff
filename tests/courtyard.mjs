import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
await fs.mkdir('artifacts/courtyard',{recursive:true});
const p=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[],failed=[];
p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)failed.push(r.url());});
const ready=()=>p.waitForFunction(()=>document.querySelector('#app').dataset.ready==='true');
const settled=()=>p.waitForFunction(()=>{const d=document.querySelector('#invitation').dataset;return d.prologueBusy==='false'&&d.travelling==='false'&&d.courtyardBusy!=='true';});
const next=async()=>{await p.locator('#nav-next').click();await settled();};
const back=async()=>{await p.locator('#nav-back').click();await settled();};
try{
 await p.goto('http://127.0.0.1:5173/');await ready();
 for(let i=0;i<7;i++)await next();
 assert.equal(await p.locator('#gate').getAttribute('data-courtyard-step'),'0');
 await p.locator('#gate img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));
 await p.screenshot({path:'artifacts/courtyard/mobile-arrival.png'});
 await p.emulateMedia({reducedMotion:'no-preference'});await next();
 assert.equal(await p.locator('#gate').getAttribute('data-courtyard-step'),'1');
 await p.locator('#nav-next').click();await p.waitForTimeout(1000);
 assert.equal(await p.locator('#nav-next').isDisabled(),true);
 await p.evaluate(()=>document.querySelector('#nav-next').click());
 assert.match(await p.locator('.courtyard-left').getAttribute('style'),/rotateY/);
 await p.screenshot({path:'artifacts/courtyard/opening.png'});await settled();
 assert.equal(await p.locator('#gate').getAttribute('data-courtyard-step'),'2');
 await p.screenshot({path:'artifacts/courtyard/open.png'});
 assert.match(await p.locator('.courtyard-left').getAttribute('style'),/rotateY\(102deg\)/);
 assert.match(await p.locator('.courtyard-right').getAttribute('style'),/rotateY\(-102deg\)/);
 await p.evaluate(()=>{window.walkSamples=[];const sample=()=>{const c=document.querySelector('.courtyard-camera'),m=new DOMMatrix(getComputedStyle(c).transform);window.walkSamples.push({scale:m.a,y:m.m42});if(document.querySelector('#invitation').dataset.scene==='0')requestAnimationFrame(sample);};requestAnimationFrame(sample);});
 await p.locator('#nav-next').click();await p.waitForTimeout(1100);
 assert.equal(await p.locator('.courtyard-crow').evaluate(e=>getComputedStyle(e).opacity),'1');
 assert.ok(await p.locator('.courtyard-camera').evaluate(e=>getComputedStyle(e).transform!=='none'));
 await p.screenshot({path:'artifacts/courtyard/walking.png'});await settled();
 assert.equal(await p.locator('#invitation').getAttribute('data-scene'),'1');
 assert.equal(await p.locator('.courtyard-wedding').textContent(),'The Wedding');
 assert.equal((await p.locator('#cover-title').textContent()).replace(/\s/g,''),'AchmadBifari&SyafiraAulia');
 const framing=await p.evaluate(()=>{const a=document.querySelector('#gate .courtyard-landscape').getBoundingClientRect(),b=document.querySelector('.courtyard-title-garden').getBoundingClientRect();return ['x','y','width','height'].map(k=>Math.abs(a[k]-b[k]));});
 assert.ok(framing.every(d=>d<1),`no background zoom reset: ${framing}`);
 const gait=await p.evaluate(()=>{const a=walkSamples;let turns=0,last=0;for(let i=1;i<a.length;i++){const delta=a[i].y-a[i-1].y;if(Math.abs(delta)<.02)continue;const sign=Math.sign(delta);if(last&&sign!==last)turns++;last=sign;}return turns;});assert.ok(gait>=6,'camera rises and settles across footsteps');
 assert.ok(await p.locator('#cover-title').evaluate(e=>getComputedStyle(e).fontFamily.startsWith('GALVANIZED')&&document.fonts.check('40px GALVANIZED')),'real GALVANIZED font loaded');
 await p.screenshot({path:'artifacts/courtyard/title.png'});
 await next();assert.equal(await p.locator('#invitation').getAttribute('data-scene'),'2');
 await back();await back();assert.equal(await p.locator('#gate').getAttribute('data-courtyard-step'),'2');
 await back();await back();await back();assert.equal(await p.locator('#invitation').getAttribute('data-prologue'),'active');
 await p.emulateMedia({reducedMotion:'reduce'});await next();
 for(const [width,height]of [[360,640],[430,932],[1440,900],[844,390]]){
  await p.setViewportSize({width,height});
  for(let stop=0;stop<4;stop++){
   if(stop)await next();
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.documentElement.scrollHeight<=innerHeight),true);
   assert.equal(await p.locator('.vn-navigation button').count(),2);
   assert.equal(await p.locator('.vn-scene:not([inert])').count(),1);
   const text=await p.locator(stop===3?'#cover .vn-dialogue':'#gate .vn-dialogue').boundingBox(),nav=await p.locator('.vn-bottom').boundingBox();
   assert.ok(text.y>=0&&text.y+text.height<=nav.y+2,`text fits ${width}x${height} stop${stop}`);
   await p.screenshot({path:`artifacts/courtyard/${width}-${stop}.png`});
  }
  await back();await back();await back();
 }
 assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
 console.log({morningArrival:true,separateGateHinges:true,depthWalk:true,weddingTitle:true,backAndReplay:true,reducedMotion:true,viewports:4,errors,failed});
}finally{await browser.close();}
