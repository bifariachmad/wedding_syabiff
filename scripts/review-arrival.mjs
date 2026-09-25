import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
await fs.mkdir('artifacts/arrival',{recursive:true});
const p=await b.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
p.on('pageerror',e=>console.log('ERROR',e.stack));
try{
 for(const [width,height]of [[390,844],[360,640],[1440,900]]){
  await p.setViewportSize({width,height});await p.goto('http://127.0.0.1:5173/?to=Nadia%20Utami');await p.waitForFunction(()=>document.querySelector('#app').dataset.ready==='true');await p.evaluate(()=>document.fonts.ready);
  for(let step=0;step<7;step++){
   if(step){await p.locator('#nav-next').click();await p.waitForFunction(s=>document.querySelector('#arrival').dataset.step===String(s)&&document.querySelector('#invitation').dataset.prologueBusy==='false',step);}
   await p.screenshot({path:`artifacts/arrival/${width}-${step}.png`});
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.documentElement.scrollHeight<=innerHeight),true);
  }
  await p.locator('#nav-next').click();await p.waitForFunction(()=>document.querySelector('#invitation').dataset.prologue==='complete');
  await p.screenshot({path:`artifacts/arrival/${width}-gate.png`});
 }
}finally{await b.close();}
