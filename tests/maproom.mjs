import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const p=await b.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[],failed=[];
p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)failed.push(r.url());});
await fs.mkdir('artifacts/maproom',{recursive:true});
const settle=()=>p.waitForFunction(()=>{const d=document.querySelector('#invitation').dataset;return d.travelling==='false'&&['prologueBusy','courtyardBusy','welcomeBusy','clockBusy','mapBusy'].every(k=>d[k]!=='true');});
const next=async()=>{await p.locator('#nav-next').click();await settle();};const back=async()=>{await p.locator('#nav-back').click();await settle();};
try{
 await p.goto('http://127.0.0.1:5173/');await p.waitForFunction(()=>document.querySelector('#app').dataset.ready==='true');
 for(let i=0;i<6;i++)await next();
 await p.emulateMedia({reducedMotion:'no-preference'});await p.locator('#nav-next').click();await p.waitForFunction(()=>document.querySelector('#arrival').dataset.burn==='portal');
 assert.match(await p.locator('.arrival-portal-window').evaluate(e=>getComputedStyle(e).filter),/brightness\(0\)/);
 await p.waitForTimeout(1450);const mid=await p.locator('.arrival-portal-window').evaluate(e=>parseFloat(getComputedStyle(e).filter.match(/[\d.]+/)[0]));assert.ok(mid>0&&mid<1);await p.screenshot({path:'artifacts/maproom/portal-lightening.png'});await settle();
 await next();await next();await p.locator('#nav-next').click();await p.waitForTimeout(1000);
 const frames=await p.locator('.courtyard-crow').evaluate(async el=>{let out=[];for(let i=0;i<24;i++){out.push([...el.children].map(e=>getComputedStyle(e).opacity));await new Promise(r=>setTimeout(r,20));}return out;});assert.ok(frames.some(a=>a[0]==='1'&&a[1]==='0')&&frames.some(a=>a[0]==='0'&&a[1]==='1'));
 await p.screenshot({path:'artifacts/maproom/raven.png'});await settle();assert.equal(await p.locator('.courtyard-date').count(),0);assert.equal(await p.locator('.courtyard-wedding').evaluate(e=>getComputedStyle(e).color),'rgb(173, 53, 79)');
 await next();await p.locator('#nav-next').click();await p.waitForTimeout(900);assert.ok(await p.locator('.welcome-exterior').evaluate(e=>new DOMMatrix(getComputedStyle(e).transform).a>1));
 await p.waitForFunction(()=>document.querySelector('#greeting').dataset.arrival==='empty');assert.equal(await p.locator('#greeting .welcome-couple').evaluate(e=>getComputedStyle(e).opacity),'0');await p.screenshot({path:'artifacts/maproom/empty-room.png'});await settle();
 const sy=await p.locator('#greeting .character-syafira').boundingBox(),bi=await p.locator('#greeting .character-bifari').boundingBox();assert.ok(sy.x<bi.x);await p.screenshot({path:'artifacts/maproom/hosts.png'});
 await p.emulateMedia({reducedMotion:'reduce'});for(let i=0;i<4;i++)await next();
 assert.equal(await p.locator('#invitation').getAttribute('data-scene'),'3');await next();await next();await p.screenshot({path:'artifacts/maproom/grounded-clock.png'});await next();
 assert.match(await p.locator('#clockroom-line').textContent(),/meja peta/);
 await p.emulateMedia({reducedMotion:'no-preference'});await next();await p.screenshot({path:'artifacts/maproom/arrival.png'});await next();
 assert.equal(await p.locator('#location').getAttribute('data-map-step'),'1');assert.equal(await p.locator('.maproom-link').getAttribute('href'),'https://maps.app.goo.gl/d5nJ9Rfvx1j3bCwp7');await p.screenshot({path:'artifacts/maproom/venue.png'});
 await next();await next();await next();assert.equal(await p.locator('#invitation').getAttribute('data-scene'),'5');await back();assert.equal(await p.locator('#location').getAttribute('data-map-step'),'3');
 await back();await back();await back();await back();assert.equal(await p.locator('#countdown').getAttribute('data-clock-step'),'3');await next();
 await p.emulateMedia({reducedMotion:'reduce'});
 for(const[width,height]of [[360,640],[430,932],[1440,900],[844,390]]){
  await p.setViewportSize({width,height});
  for(let step=0;step<4;step++){
   if(step)await next();const box=await p.locator('#location .vn-dialogue').boundingBox(),nav=await p.locator('.vn-bottom').boundingBox();
   assert.ok(box.x>=0&&box.x+box.width<=width&&box.y>=0&&box.y+box.height<nav.y,`dialogue fits ${width}`);
   assert.ok(await p.locator('#location .vn-dialogue').evaluate(e=>e.scrollHeight<=e.clientHeight+2),`dialogue content fits ${width} step${step}`);
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.documentElement.scrollHeight<=innerHeight),true);
   await p.screenshot({path:`artifacts/maproom/${width}-${step}.png`});
  }await back();await back();await back();
 }
 assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);console.log({portalDarkToLight:true,twoRavenPNGs:true,noCoverDate:true,maroonHeading:true,emptyRoomBeforeHosts:true,syafiraLeft:true,fourMapStops:true,venueLink:true,reverseReplay:true,fourViewports:true,errors,failed});
}finally{await b.close();}
