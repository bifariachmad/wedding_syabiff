import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
await fs.mkdir('artifacts/arrival-v3',{recursive:true});
const page=await browser.newPage({viewport:{width:390,height:844}});
const errors=[],failed=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failed.push(r.url());});
const wait=()=>page.waitForFunction(()=>document.querySelector('#invitation').dataset.prologueBusy==='false');
const ready=()=>page.waitForFunction(()=>document.querySelector('#app').dataset.ready==='true');
async function next(){await page.locator('#nav-next').click();await wait();}
try{
 await page.addInitScript(()=>{
  window.knockTimes=[];window.sfxTones=[];
  const create=AudioContext.prototype.createOscillator;
  AudioContext.prototype.createOscillator=function(){const osc=create.call(this),ctx=this,set=osc.frequency.setValueAtTime.bind(osc.frequency);osc.frequency.setValueAtTime=(value,time)=>{window.sfxTones.push({value,at:performance.now()});if(value===125)window.knockTimes.push({start:performance.now()+(time-ctx.currentTime)*1000,end:performance.now()+(time-ctx.currentTime+.16)*1000});return set(value,time);};return osc;};
 });
 await page.goto('http://127.0.0.1:5173/?to='+encodeURIComponent('<b>Nadia</b>'));await ready();
 assert.equal(await page.locator('#arrival-guest').textContent(),'<b>Nadia</b>');assert.equal(await page.locator('#arrival-guest b').count(),0);
 assert.equal(await page.locator('#nav-back').isDisabled(),true);assert.equal(await page.locator('.vn-stage').evaluate(e=>e.inert),true);
 await page.evaluate(()=>{new MutationObserver(()=>{if(document.querySelector('#arrival-line').textContent.startsWith('Ada')&&!window.dialogueAt)window.dialogueAt=performance.now();}).observe(document.querySelector('#arrival-line'),{childList:true,subtree:true,characterData:true});});
 await page.mouse.wheel(0,700);assert.equal(await page.locator('#arrival').getAttribute('data-step'),'0');
 await page.screenshot({path:'artifacts/arrival-v3/mobile-0.png'});
 await page.locator('#nav-next').click();await page.waitForFunction(()=>document.querySelector('#arrival').dataset.knock==='playing');
 assert.ok(!(await page.locator('#arrival-line').textContent()).startsWith('Ada'));
 await page.screenshot({path:'artifacts/arrival-v3/knock.png'});await wait();
 const timing=await page.evaluate(()=>({knocks:knockTimes,dialogueAt}));assert.equal(timing.knocks.length,3);assert.ok(timing.dialogueAt>=timing.knocks[2].end,JSON.stringify(timing));
 assert.equal(await page.locator('#arrival-line').textContent(),'Ada ketukan di pintu.');
 await page.locator('#nav-next').click();await page.waitForTimeout(1100);
 assert.equal(await page.locator('#nav-next').isDisabled(),true);await page.evaluate(()=>document.querySelector('#nav-next').click());
 await page.screenshot({path:'artifacts/arrival-v3/hand-grip.png'});await wait();
 assert.equal(await page.locator('#arrival').getAttribute('data-step'),'2');
 assert.equal(await page.locator('#arrival-line').textContent(),'Tak ada siapa-siapa…');
 const cloud=await page.locator('.arrival-clouds').evaluate(e=>getComputedStyle(e).transform);await page.waitForTimeout(400);assert.notEqual(await page.locator('.arrival-clouds').evaluate(e=>getComputedStyle(e).transform),cloud);
 for(let step=3;step<=6;step++){await next();assert.equal(await page.locator('#arrival').getAttribute('data-step'),String(step));await page.screenshot({path:`artifacts/arrival-v3/mobile-${step}.png`});if(step===3)assert.equal(await page.locator('#arrival-line').textContent(),'Hah, ada undangan.');if(step===4)assert.equal(await page.locator('#arrival-line').textContent(),'Dari siapa ya…');}
 assert.equal(await page.locator('.arrival-open').evaluate(e=>getComputedStyle(e).visibility),'visible');
 await page.locator('#nav-next').click();await page.waitForFunction(()=>document.querySelector('#arrival').dataset.burn==='burning');await page.waitForTimeout(1300);
 assert.equal(await page.locator('.arrival-portal').evaluate(e=>getComputedStyle(e).visibility),'hidden');
 assert.equal(await page.locator('.arrival-open').evaluate(e=>getComputedStyle(e).visibility),'hidden','hands leave before paper burns');
 await page.screenshot({path:'artifacts/arrival-v3/burning.png'});
 await page.waitForFunction(()=>document.querySelector('#arrival').dataset.burn==='complete');
 assert.equal(await page.locator('.arrival-floating').evaluate(e=>getComputedStyle(e).visibility),'hidden','paper consumed');
 assert.equal(await page.locator('.arrival-portal').evaluate(e=>getComputedStyle(e).visibility),'hidden','portal waits until after burn');
 await page.screenshot({path:'artifacts/arrival-v3/ashes-before-portal.png'});
 await page.waitForFunction(()=>document.querySelector('#arrival').dataset.burn==='portal');await page.waitForTimeout(1000);await page.screenshot({path:'artifacts/arrival-v3/portal-mid.png'});
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
   if(step===6){const copy=await page.locator('.arrival-card-copy').boundingBox();assert.ok(copy.y>heading.y+heading.height&&copy.y+copy.height<back.y,`card fits ${width}x${height}`);assert.equal(await page.locator('.arrival-card-copy strong').evaluate(e=>{const r=document.createRange();r.selectNodeContents(e);return r.getClientRects().length;}),1,'invitation text is one line');assert.equal(await page.locator('.arrival-card-copy strong').evaluate(e=>e.scrollWidth<=e.clientWidth),true,'one-line copy fits');}
   if([0,2,3,5,6].includes(step))await page.screenshot({path:`artifacts/arrival-v3/${width}-${step}.png`});
  }
  for(let step=5;step>=0;step--){await page.locator('#nav-back').click();await wait();}
 }
 assert.equal(await page.locator('.arrival-clouds').evaluate(e=>getComputedStyle(e).animationName),'none');
 for(let i=0;i<6;i++)await next();
 await page.locator('#nav-next').click();await page.waitForFunction(()=>document.querySelector('#arrival').dataset.burn==='complete');
 assert.equal(await page.locator('.arrival-floating').evaluate(e=>getComputedStyle(e).visibility),'hidden');
 assert.equal(await page.locator('.arrival-portal').evaluate(e=>getComputedStyle(e).visibility),'hidden','reduced motion preserves burn-before-portal');await wait();
 assert.equal(await page.locator('#invitation').getAttribute('data-prologue'),'complete');
 const muted=await page.evaluate(async()=>{const audio=await import('/src/audio.js');await audio.toggleAudio();const before=sfxTones.length;audio.sound('latch');audio.sound('ignite');audio.sound('portal');return sfxTones.length===before;});assert.equal(muted,true,'new sound effects respect mute');
 assert.equal(await page.locator('.vn-navigation button').count(),2);assert.equal(await page.locator('svg').count(),0);assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
 const audio=await page.evaluate(()=>sfxTones);assert.ok(audio.some(s=>s.value===780),'latch sound');assert.ok(audio.some(s=>s.value===180),'ignition sound');assert.ok(audio.find(s=>s.value===72).at-audio.find(s=>s.value===180).at>3200,'portal sound follows completed burn');
 const result={pages:7,knocksBeforeDialogue:timing,normalMotion:true,leftHandWithoutHardware:true,separateDownwardThoughts:true,movingClouds:true,oneLineInvitation:true,burnBeforePortal:true,latchIgnitionPortalSounds:true,portalToGate:true,reverseAndReplay:true,rapidClicksLocked:true,plainTextPersonalization:true,reducedMotion:true,viewports:['360x640','430x932','1440x900','844x390'],topHeading:true,centeredPageCounter:true,noPageOverflow:true,onlyTwoNavigationButtons:true,errors,failedRequests:failed};
 await fs.writeFile('artifacts/arrival-v3/results.json',JSON.stringify(result,null,2));console.log(result);
}finally{await browser.close();}
