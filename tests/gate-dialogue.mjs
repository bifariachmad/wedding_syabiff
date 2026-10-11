import {chromium,devices} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const out='artifacts/gate-dialogue';
await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 const page=await browser.newPage({...devices['iPhone 13'],reducedMotion:'reduce'}),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.goto(process.env.INVITATION_BASE_URL||'http://127.0.0.1:5173/');
 await page.waitForFunction(()=>document.querySelector('#app')?.dataset.ready==='true');
 const settled=()=>page.waitForFunction(()=>!Object.entries(document.querySelector('#invitation').dataset).some(([key,value])=>(key.endsWith('Busy')||key==='travelling')&&value==='true'));
 async function next(){await page.locator('#nav-next').click();await settled();}
 async function back(){await page.locator('#nav-back').click();await settled();}
 while(await page.locator('#invitation').getAttribute('data-prologue')==='active')await next();
 const results=[];
 for(const mode of ['no-preference','reduce']){
  await page.emulateMedia({reducedMotion:mode});
  await next();
  assert.equal(await page.locator('#gate').getAttribute('data-courtyard-step'),'1');
  await page.evaluate(()=>{
   window.gateSamples=[];window.sampleGate=true;
   window.panelOpacity=dialogue=>{
    let opacity=1;
    if(!dialogue.getClientRects().length||getComputedStyle(dialogue).visibility==='hidden')return 0;
    for(let el=dialogue;el;el=el.parentElement)opacity*=Number(getComputedStyle(el).opacity);
    return opacity;
   };
   window.gateOpacity=()=>panelOpacity(document.querySelector('#gate .vn-dialogue'));
   function sample(){
    const gate=document.querySelector('#gate'),dialogue=gate.querySelector('.vn-dialogue');
    gateSamples.push({text:document.querySelector('#courtyard-line').textContent,opacity:gateOpacity(),walking:gate.dataset.walk==='walking',gateBoxLaidOut:dialogue.getClientRects().length>0,visiblePanels:[...document.querySelectorAll('.vn-dialogue,.arrival-caption')].filter(panel=>panelOpacity(panel)>.01).length});
    if(sampleGate)requestAnimationFrame(sample);
   }requestAnimationFrame(sample);
  });
  await page.locator('#nav-next').click();
  if(mode==='no-preference'){
   await page.waitForFunction(()=>document.querySelector('#gate').dataset.walk==='walking');
   await page.locator('#invitation').screenshot({path:`${out}/walking-start.png`});
   await page.waitForTimeout(1200);
   await page.locator('#invitation').screenshot({path:`${out}/walking-middle.png`});
  }
  await settled();
  assert.equal(await page.locator('.vn-scene.is-active').getAttribute('id'),'cover');
  await page.locator('#invitation').screenshot({path:`${out}/cover-${mode}.png`});
  await back();
  assert.equal(await page.locator('#gate').getAttribute('data-courtyard-step'),'2');
  assert.equal(await page.evaluate(()=>gateOpacity()),0);
  await page.locator('#invitation').screenshot({path:`${out}/open-gate-${mode}.png`});
  const samples=await page.evaluate(()=>{sampleGate=false;return gateSamples;});
  const flashes=samples.filter(frame=>frame.text===''&&frame.opacity>.01);
  const walking=samples.filter(frame=>frame.walking);
  results.push({mode,frames:samples.length,emptyBoxFrames:flashes.length,walkingFrames:walking.length,laidOutGateFrames:walking.filter(frame=>frame.gateBoxLaidOut).length,visiblePanelsWhileWalking:walking.filter(frame=>frame.visiblePanels>0).length,openGateBoxLaidOut:await page.locator('#gate .vn-dialogue').evaluate(el=>el.getClientRects().length>0)});
  await back();
  assert.equal(await page.locator('#courtyard-line').textContent(),'Aku penasaran...');
  assert.equal(await page.locator('#gate .vn-dialogue').evaluate(el=>Number(getComputedStyle(el).opacity)),1);
  assert.ok(await page.locator('#gate .vn-dialogue').isVisible(),'Back navigation restores the speaking dialogue');
  await back();
 }
 await fs.writeFile(`${out}/results.json`,JSON.stringify({results,errors},null,2));
 console.log(JSON.stringify({results,errors}));
 assert.ok(results.every(result=>result.emptyBoxFrames===0),'The open gate must never show an empty dialogue box during forward or back transitions');
 assert.ok(results.find(result=>result.mode==='no-preference').walkingFrames>0,'Capture the walking animation, not just the scene endpoints');
 assert.ok(results.every(result=>result.laidOutGateFrames===0&&!result.openGateBoxLaidOut),'The open-gate box must leave the layout entirely, including throughout the walk');
 assert.ok(results.every(result=>result.visiblePanelsWhileWalking===0),'No scene dialogue may appear during the walk');
 assert.deepEqual(errors,[]);
}finally{await browser.close();}
