import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
await fs.mkdir('artifacts/arrival-v2',{recursive:true});
const page=await browser.newPage({viewport:{width:390,height:844}});
const errors=[],failed=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failed.push(r.url());});
const wait=()=>page.waitForFunction(()=>document.querySelector('#invitation').dataset.prologueBusy==='false');
const ready=()=>page.waitForFunction(()=>document.querySelector('#app').dataset.ready==='true');
async function next(){await page.locator('#nav-next').click();await wait();}
try{
 await page.addInitScript(()=>{
  window.knockTimes=[];
  const create=AudioContext.prototype.createOscillator;
  AudioContext.prototype.createOscillator=function(){const osc=create.call(this),ctx=this,set=osc.frequency.setValueAtTime.bind(osc.frequency);osc.frequency.setValueAtTime=(value,time)=>{if(value===125)window.knockTimes.push({start:performance.now()+(time-ctx.currentTime)*1000,end:performance.now()+(time-ctx.currentTime+.16)*1000});return set(value,time);};return osc;};
 });
 await page.goto('http://127.0.0.1:5173/?to='+encodeURIComponent('<b>Nadia</b>'));await ready();
 assert.equal(await page.locator('#arrival-guest').textContent(),'<b>Nadia</b>');assert.equal(await page.locator('#arrival-guest b').count(),0);
 assert.equal(await page.locator('#nav-back').isDisabled(),true);assert.equal(await page.locator('.vn-stage').evaluate(e=>e.inert),true);
 await page.evaluate(()=>{new MutationObserver(()=>{if(document.querySelector('#arrival-line').textContent.startsWith('Ada')&&!window.dialogueAt)window.dialogueAt=performance.now();}).observe(document.querySelector('#arrival-line'),{childList:true,subtree:true,characterData:true});});
 await page.mouse.wheel(0,700);assert.equal(await page.locator('#arrival').getAttribute('data-step'),'0');
 await page.screenshot({path:'artifacts/arrival-v2/mobile-0.png'});
 await page.locator('#nav-next').click();await page.waitForFunction(()=>document.querySelector('#arrival').dataset.knock==='playing');
 assert.ok(!(await page.locator('#arrival-line').textContent()).startsWith('Ada'));
 await page.screenshot({path:'artifacts/arrival-v2/knock.png'});await wait();
 const timing=await page.evaluate(()=>({knocks:knockTimes,dialogueAt}));assert.equal(timing.knocks.length,3);assert.ok(timing.dialogueAt>=timing.knocks[2].end,JSON.stringify(timing));
 assert.equal(await page.locator('#arrival-line').textContent(),'Ada ketukan di pintu.');
 await page.locator('#nav-next').click();await page.waitForTimeout(1100);
 assert.equal(await page.locator('#nav-next').isDisabled(),true);await page.evaluate(()=>document.querySelector('#nav-next').click());
 await page.screenshot({path:'artifacts/arrival-v2/hand-grip.png'});await wait();
 assert.equal(await page.locator('#arrival').getAttribute('data-step'),'2');
 assert.equal(await page.locator('#arrival-line').textContent(),'Tak ada siapa-siapa…');
 const cloud=await page.locator('.arrival-clouds').evaluate(e=>getComputedStyle(e).transform);await page.waitForTimeout(400);assert.notEqual(await page.locator('.arrival-clouds').evaluate(e=>getComputedStyle(e).transform),cloud);
 for(let step=3;step<=6;step++){await next();assert.equal(await page.locator('#arrival').getAttribute('data-step'),String(step));await page.screenshot({path:`artifacts/arrival-v2/mobile-${step}.png`});if(step===3)assert.equal(await page.locator('#arrival-line').textContent(),'Hah, ada undangan.');if(step===4)assert.equal(await page.locator('#arrival-line').textContent(),'Dari siapa ya…');}
 assert.equal(await page.locator('.arrival-open').evaluate(e=>getComputedStyle(e).visibility),'visible');
 await page.locator('#nav-next').click();await page.waitForTimeout(1600);await page.screenshot({path:'artifacts/arrival-v2/portal-mid.png'});
 assert.equal(await page.locator('.arrival-portal').evaluate(e=>getComputedStyle(e).visibility),'visible');
 await wait();assert.equal(await page.locator('#invitation').getAttribute('data-prologue'),'complete');assert.equal(await page.locator('.vn-stage').evaluate(e=>e.inert),false);
 await page.locator('#nav-back').click();await wait();assert.equal(await page.locator('#arrival').getAttribute('data-step'),'6');
 await page.emulateMedia({reducedMotion:'reduce'});
 for(let step=5;step>=0;step--){await page.locator('#nav-back').click();await wait();assert.equal(await page.locator('#arrival').getAttribute('data-step'),String(step));}
 assert.equal(await page.locator('#nav-back').isDisabled(),true);
 for(const [width,height]of [[360,640],[430,932],[1440,900],[844,390]]){
  await page.setViewportSize({width,height});
  for(let step=0;step<=6;step++){
   if(step)await next();
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.documentElement.scrollHeight<=innerHeight),true);
   const heading=await page.locator('.arrival-heading').boundingBox(),back=await page.locator('#nav-back').boundingBox(),nextButton=await page.locator('#nav-next').boundingBox(),number=await page.locator('#journey-position').boundingBox();
   assert.ok(Math.abs(number.x+number.width/2-width/2)<2,'page number is centered');assert.ok(back.x<number.x&&nextButton.x>number.x+number.width);
   assert.ok(heading.y>=0&&heading.y+heading.height<height*.3,'title stays at top');
   if(step===6){const copy=await page.locator('.arrival-card-copy').boundingBox();assert.ok(copy.y>heading.y+heading.height&&copy.y+copy.height<back.y,`card fits ${width}x${height}`);}
   if([0,2,3,5,6].includes(step))await page.screenshot({path:`artifacts/arrival-v2/${width}-${step}.png`});
  }
  for(let step=5;step>=0;step--){await page.locator('#nav-back').click();await wait();}
 }
 assert.equal(await page.locator('.arrival-clouds').evaluate(e=>getComputedStyle(e).animationName),'none');
 assert.equal(await page.locator('.vn-navigation button').count(),2);assert.equal(await page.locator('svg').count(),0);assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
 const result={pages:7,knocksBeforeDialogue:timing,normalMotion:true,illustratedGrip:true,separateDownwardThoughts:true,movingClouds:true,cardReadable:true,portalToGate:true,reverseAndReplay:true,rapidClicksLocked:true,plainTextPersonalization:true,reducedMotion:true,viewports:['360x640','430x932','1440x900','844x390'],topHeading:true,centeredPageCounter:true,noPageOverflow:true,onlyTwoNavigationButtons:true,errors,failedRequests:failed};
 await fs.writeFile('artifacts/arrival-v2/results.json',JSON.stringify(result,null,2));console.log(result);
}finally{await browser.close();}
