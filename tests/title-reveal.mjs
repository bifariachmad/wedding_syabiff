import {chromium,devices} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const out='artifacts/title-reveal';
await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 const page=await browser.newPage({...devices['iPhone 13'],reducedMotion:'reduce'}),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.goto(process.env.INVITATION_BASE_URL||'http://127.0.0.1:5173/');
 await page.waitForFunction(()=>document.querySelector('#app')?.dataset.ready==='true');
 const settled=()=>page.waitForFunction(()=>!Object.entries(document.querySelector('#invitation').dataset).some(([k,v])=>(k.endsWith('Busy')||k==='travelling')&&v==='true'));
 async function next(){await page.locator('#nav-next').click();await settled();}
 while(await page.locator('#invitation').getAttribute('data-prologue')==='active')await next();
 await next();
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.evaluate(()=>{
  window.logoFrames=[];
  function sample(){const host=document.querySelector('.wedding-logo');logoFrames.push({progress:Number(host.dataset.logoProgress||0),time:performance.now()});if(host.dataset.logoState!=='complete'||!logoFrames.some(f=>f.progress>0&&f.progress<1))requestAnimationFrame(sample);}
  requestAnimationFrame(sample);
 });
 await next();
 assert.equal(await page.locator('.wedding-logo').getAttribute('data-logo-ready'),'true');
 assert.equal(await page.locator('.wedding-logo').getAttribute('data-logo-state'),'complete');
 const frames=await page.evaluate(()=>logoFrames.filter(f=>f.progress>0&&f.progress<1));
 assert.ok(frames.length>20,'Growth plays across distinct frames');
 const maxGap=Math.max(...frames.slice(1).map((frame,i)=>frame.time-frames[i].time));
 await page.screenshot({path:`${out}/complete-phone.png`});
 // Freeze the real reveal at milestones to inspect roots, text and their alignment.
 await page.evaluate(async()=>{
  const {createTitleReveal}=await import('/src/title-reveal.js');
  window.logoPreview=createTitleReveal(document.querySelector('.wedding-logo'));
  await logoPreview.prepare();
  logoPreview.reveal({to(state,options){window.previewState=state;window.previewDraw=options.onUpdate;}},0);
 });
 for(const progress of [.12,.3,.5,.7,.9]){
  await page.evaluate(p=>{previewState.progress=p;previewDraw();},progress);
  await page.locator('.wedding-logo').screenshot({path:`${out}/growth-${Math.round(progress*100)}.png`});
 }
 await page.evaluate(()=>logoPreview.finish());
 for(const [width,height] of [[360,640],[768,1024]]){
  await page.setViewportSize({width,height});
  assert.ok(await page.locator('.wedding-logo').evaluate(el=>{const rect=el.getBoundingClientRect(),image=el.querySelector('img').getBoundingClientRect();return Math.abs(rect.width/rect.height-1891/831)<.01&&Math.abs(rect.width-image.width)<1&&image.left>=0&&image.right<=innerWidth;}),'Original logo composition fits viewport');
  await page.screenshot({path:`${out}/complete-${width}.png`});
 }
 // Back navigation should restore the exact source image without replaying growth.
 await page.emulateMedia({reducedMotion:'reduce'});await next();
 await page.locator('#nav-back').click();await settled();
 assert.ok(await page.locator('.logo-growth').isHidden());
 assert.equal(await page.locator('.logo-original').evaluate(el=>getComputedStyle(el).visibility),'visible');
 assert.deepEqual(errors,[]);
 console.log(JSON.stringify({ok:true,animationFrames:frames.length,maxFrameGapMs:Math.round(maxGap),screenshots:out}));
}finally{await browser.close();}
