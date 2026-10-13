import {chromium,devices} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createBackend} from './gas-harness.mjs';

const base=process.env.INVITATION_BASE_URL||'http://127.0.0.1:5173';
const out='artifacts/ui-artwork';
await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const failures=[],records=[];
try{
 const context=await browser.newContext({...devices['iPhone 13'],reducedMotion:'reduce'});
 const backend=createBackend();
 await context.route(/\/src\/invitation\.js(?:\?.*)?$/,async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('/* journey-ready */','window.auditJourney=journey;')});});
 await context.route(/\/src\/config\.js(?:\?.*)?$/,async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace(/APPS_SCRIPT_URL: '[^']*'/,`APPS_SCRIPT_URL: '${base}/__test-api'`)});});
 await context.route('**/__test-api',route=>route.fulfill({contentType:'application/json',body:JSON.stringify(backend.call(route.request().postDataJSON()))}));
 const page=await context.newPage();
 page.on('pageerror',e=>failures.push('Browser: '+e.message));
 const settled=()=>page.waitForFunction(()=>!Object.entries(document.querySelector('#invitation').dataset).some(([key,value])=>(key.endsWith('Busy')||key==='travelling')&&value==='true'));
 const next=async()=>{await page.locator('#nav-next').click();await settled();};
 const chapter=async id=>{await page.evaluate(id=>auditJourney.chapter(id),id);await settled();};
 async function audit(label,shot=false){
  await page.evaluate(()=>document.fonts.ready);
  const result=await page.evaluate(async()=>{
   function visible(el){if(!el||el.closest('[hidden]'))return false;for(let p=el;p;p=p.parentElement){const s=getComputedStyle(p);if(s.display==='none'||s.visibility==='hidden'||+s.opacity<.05)return false;}return el.getBoundingClientRect().width>0;}
   const selector='button,.arrival-caption,.arrival-speaker,.vn-dialogue,.vn-speaker,.clockroom-countdown,.maproom-venue,.cloth-option figcaption';
   const items=[];
   for(const el of document.querySelectorAll(selector)){
    if(!visible(el))continue;
    const s=getComputedStyle(el),b=el.getBoundingClientRect(),id=el.id||el.className;
    if(el.matches('.arrival-caption,.arrival-speaker,.vn-dialogue,.vn-speaker')&&!el.closest('#cover,#closing,#reservation[data-book-step="2"]')){
     if(!s.backgroundImage.includes('ui-v2/')||!s.backgroundImage.includes('-angular-v1.png'))items.push({id,error:'Dialogue must match the angular button style'});
    }
    if(el.matches('button')){
     const art=el.id==='music-toggle'?el.querySelector('img')?.src:s.backgroundImage;
     if(!art?.includes('ui-v2/button-')||!art.includes('-angular-v1.png'))items.push({id,error:'Button is missing the shared angular style'});
     if(s.borderRadius!=='0px')items.push({id,error:'Button still has rounded corners'});
     if(b.width<43||b.height<43)items.push({id,error:'Touch target is too small'});
    }
    if(s.borderImageSource!=='none')items.push({id,error:'Sliced/stretch border image still active'});
    const musicImage=el.id==='music-toggle'?el.querySelector('img'):null;
    if(!s.backgroundImage.includes('url(')&&!musicImage)continue;
    const url=musicImage?.src||s.backgroundImage.match(/url\("?([^"\)]+)"?\)/)?.[1];
    if(!url)continue;
    const img=new Image();img.src=url;
    try{await img.decode();}catch{items.push({id,error:'Missing artwork '+url});continue;}
    const scale=Math.min(b.width/img.naturalWidth,b.height/img.naturalHeight);
    const w=img.naturalWidth*scale,h=img.naturalHeight*scale;
    const paint={left:b.left+(b.width-w)/2,right:b.right-(b.width-w)/2,top:b.top+(b.height-h)/2,bottom:b.bottom-(b.height-h)/2};
    const errors=[];
    if(s.backgroundSize!=='contain')errors.push('Image can distort: '+s.backgroundSize);
    if(url.includes('/arrival/ui-panel.png'))errors.push('Generic button strip still used');
    const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
    let node;
    while((node=walker.nextNode())){
     const p=node.parentElement;
     if(!node.textContent.trim()||!visible(p)||p.closest('.sr-only'))continue;
     // Speaker tags intentionally overlap the outside of their dialogue frame.
     const tag=p.closest('.vn-speaker,.arrival-speaker');if(tag&&tag!==el)continue;
     const range=document.createRange();range.selectNodeContents(node);
     for(const r of range.getClientRects())if(r.width&&r.height&&(r.left<paint.left+2||r.right>paint.right-2||r.top<paint.top+2||r.bottom>paint.bottom-2))errors.push('Text outside artwork: '+node.textContent.trim());
    }
    items.push({id,asset:url.split('/').pop(),size:[b.width,b.height],native:[img.naturalWidth,img.naturalHeight],errors:[...new Set(errors)]});
   }
   return items;
  });
  records.push({label,items:result});
  for(const item of result){if(item.error)failures.push(label+': '+item.id+': '+item.error);for(const error of item.errors||[])failures.push(label+': '+item.id+': '+error);}
  if(shot)await page.screenshot({path:out+'/'+label+'.png'});
 }
 for(const [width,height] of [[320,568],[390,844],[768,1024]]){
  await page.setViewportSize({width,height});await page.goto(base+'/?to=Nadia%20Utami');await page.waitForFunction(()=>document.querySelector('#app')?.dataset.ready==='true');await settled();
  await page.locator('#music-toggle').click();await audit(width+'-music-toggle');
  await page.locator('#music-toggle').click();
  for(let step=0;step<7;step++){await audit(width+'-arrival-'+step,step===0);if(step<6)await next();}
  for(const [id,steps] of [['gate',2],['greeting',4],['countdown',3],['location',2],['rundown-0',1],['dresscode',3]]){
   await chapter(id);
   for(let step=0;step<steps;step++){
    await audit(width+'-'+id+'-'+step,step===steps-1);
    if(step<steps-1)await next();
   }
  }
  await page.evaluate(()=>auditJourney.goTo('reservation'));await settled();await audit(width+'-book-intro',true);await next();
  await page.locator('#plus').click();assert.equal(await page.locator('#guest-count').inputValue(),'2');await page.locator('#minus').click();assert.equal(await page.locator('#guest-count').inputValue(),'1');assert.ok(await page.locator('#minus').isDisabled());
  await audit(width+'-form',true);
  await page.locator('#submit-reservation').click();await page.waitForSelector('#reservation-success:visible');await audit(width+'-success',true);
  await page.locator('#edit-reservation').click();await audit(width+'-edit',true);
  await page.locator('#recall-ticket').click();await next();await audit(width+'-ticket',true);
  await page.locator('#nav-back').hover();await audit(width+'-nav-hover');
  await context.clearCookies();await page.evaluate(()=>localStorage.clear());
 }
 await fs.writeFile(out+'/results.json',JSON.stringify({failures,records},null,2));
 assert.deepEqual(failures,[],'All visible button/dialogue text must fit inside proportionally scaled artwork');
 console.log('PASS: '+records.length+' screen/state checks; matching angular buttons and dialogues; native artwork proportions; text fits; +/−, submit, edit, recall, ticket.');
}finally{await browser.close();}
