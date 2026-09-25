import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const p=await b.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[],failed=[];
p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)failed.push(r.url());});
await fs.mkdir('artifacts/welcome',{recursive:true});
const settle=()=>p.waitForFunction(()=>{const d=document.querySelector('#invitation').dataset;return d.travelling==='false'&&d.prologueBusy==='false'&&d.courtyardBusy!=='true'&&d.welcomeBusy!=='true';});
const next=async()=>{await p.locator('#nav-next').click();await settle();};
const back=async()=>{await p.locator('#nav-back').click();await settle();};
try{
 await p.goto('http://127.0.0.1:5173/');await p.waitForFunction(()=>document.querySelector('#app').dataset.ready==='true');
 for(let i=0;i<11;i++)await next();
 assert.equal(await p.locator('#invitation').getAttribute('data-scene'),'2');
 await p.locator('#greeting img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));
 await p.screenshot({path:'artifacts/welcome/arrival.png'});
 await p.emulateMedia({reducedMotion:'no-preference'});
 await p.locator('#nav-next').click();await p.waitForTimeout(900);
 assert.equal(await p.locator('#nav-next').isDisabled(),true);
 await p.evaluate(()=>document.querySelector('#nav-next').click());
 assert.match(await p.locator('.welcome-door-left').getAttribute('style'),/rotateY/);
 await p.screenshot({path:'artifacts/welcome/opening.png'});await settle();
 assert.equal(await p.locator('#greeting').getAttribute('data-welcome-step'),'1');
 await p.screenshot({path:'artifacts/welcome/open.png'});
 await next();assert.equal(await p.locator('#welcome-line').textContent(),'Di antara gelap dan cahaya, kami memilih saling menemukan.');
 await next();assert.equal(await p.locator('#welcome-line').textContent(),'Dengan hangat, kami mengundangmu menyaksikan hari kami.');
 await p.screenshot({path:'artifacts/welcome/invitation.png'});
 await next();assert.equal(await p.locator('#invitation').getAttribute('data-scene'),'3');
 await back();assert.equal(await p.locator('#greeting').getAttribute('data-welcome-step'),'3');
 await back();await back();await back();await back();
 assert.equal(await p.locator('#invitation').getAttribute('data-scene'),'1');
 assert.equal(await p.locator('.courtyard-rose-frame').evaluate(e=>getComputedStyle(e).opacity),'1');
 await next();
 await p.emulateMedia({reducedMotion:'reduce'});
 for(const [width,height]of [[360,640],[430,932],[1440,900],[844,390]]){
  await p.setViewportSize({width,height});
  for(let step=0;step<4;step++){
   if(step)await next();
   assert.equal(await p.locator('#greeting').getAttribute('data-welcome-step'),String(step));
   const text=await p.locator('#greeting .vn-dialogue').boundingBox(),nav=await p.locator('.vn-bottom').boundingBox();
   assert.ok(text.x>=0&&text.x+text.width<=width&&text.y>=0&&text.y+text.height<nav.y,`dialogue fits ${width} stop${step}`);
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.documentElement.scrollHeight<=innerHeight),true);
   assert.equal(await p.locator('.vn-navigation button').count(),2);
   assert.equal(await p.locator('.vn-scene:not([inert])').count(),1);
   await p.screenshot({path:`artifacts/welcome/${width}-${step}.png`});
  }
  await back();await back();await back();
 }
 assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
 const result={fourStops:true,doorHinges:true,coupleWelcome:true,originalInvitationCopy:true,forwardBackReplay:true,rapidClickLock:true,reducedMotion:true,fourViewports:true,noOverflow:true,errors,failed};
 await fs.writeFile('artifacts/welcome/results.json',JSON.stringify(result,null,2));console.log(result);
}finally{await b.close();}
