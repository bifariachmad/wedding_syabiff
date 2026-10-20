import {chromium,devices} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createBackend} from './gas-harness.mjs';

const base=process.env.INVITATION_BASE_URL||'http://127.0.0.1:5173';
const out='artifacts/ui-artwork';
await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const failures=[],records=[];
let context,page;
async function useContext(options){
 await context?.close();
 context=await browser.newContext({...options,reducedMotion:'reduce'});
 const backend=createBackend();
 await context.route(/\/src\/invitation\.js(?:\?.*)?$/,async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('/* journey-ready */','window.auditJourney=journey;')});});
 await context.route(/\/src\/config\.js(?:\?.*)?$/,async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace(/APPS_SCRIPT_URL: [^\r\n]+/,`APPS_SCRIPT_URL: '${base}/__test-api',`)});});
 await context.route('**/__test-api',route=>route.fulfill({contentType:'application/json',body:JSON.stringify(backend.call(route.request().postDataJSON()))}));
 page=await context.newPage();
 page.on('pageerror',e=>failures.push('Browser: '+e.message));
}
try{
 await useContext(devices['iPhone 13']);
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
 // The stage must be a single, centred 9:16 column with no device notice and no horizontal scroll.
 async function stage(label){
  const s=await page.evaluate(()=>{const a=document.querySelector('#app').getBoundingClientRect(),notice=document.querySelector('.device-notice');
   return {notice:!!notice&&!notice.hidden&&notice.getClientRects().length>0,invitations:document.querySelectorAll('#invitation').length,notices:document.querySelectorAll('.device-notice').length,ready:document.querySelector('#app').dataset.ready,
    scroll:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth,vw:innerWidth,left:a.left,right:innerWidth-a.right,top:a.top,bottom:innerHeight-a.bottom,ratio:a.width/a.height,width:a.width,height:a.height,vh:innerHeight};});
  const fail=error=>failures.push(label+': stage: '+error+' '+JSON.stringify(s));
  if(s.notice)fail('device notice is visible');
  if(s.invitations!==1||s.notices!==1)fail('invitation mounted more than once');
  if(s.ready!=='true')fail('#app is not ready');
  if(s.scroll>0)fail('horizontal scroll');
  if(Math.abs(s.left-s.right)>1||Math.abs(s.top-s.bottom)>1)fail('stage is not centred');
  if(Math.abs(s.ratio-9/16)>.004)fail('stage is not 9:16');
  // Tall phones letterbox vertically; anything wider than 9:16 must use the full height (up to the 760px column cap).
  if(s.width<s.vw-1&&s.height<Math.min(s.vh,760*16/9)-1)fail('stage does not use the full height');
  return s;
 }
 // RSVP writing area: every visible text line stays on the paper and inside the stage.
 async function formFits(label){
  const errors=await page.evaluate(()=>{
   const stage=document.querySelector('#app').getBoundingClientRect(),paper=document.querySelector('#reservation .book-writing-area')?.getBoundingClientRect(),errors=[];
   if(!paper)return ['writing area missing'];
   const content=document.querySelector('#reservation .vn-form-content');if(content&&content.scrollWidth>content.clientWidth+1)errors.push('form scrolls sideways');
   const walker=document.createTreeWalker(document.querySelector('#reservation .book-writing-area'),NodeFilter.SHOW_TEXT);let node;
   while((node=walker.nextNode())){const p=node.parentElement;if(!node.textContent.trim()||!p.getClientRects().length||p.closest('[hidden],.sr-only,[aria-hidden="true"]')||getComputedStyle(p).visibility==='hidden')continue;
    const range=document.createRange();range.selectNodeContents(node);
    for(const r of range.getClientRects())if(r.width&&(r.left<Math.max(paper.left,stage.left)-1||r.right>Math.min(paper.right,stage.right)+1))errors.push('Text off the paper: '+node.textContent.trim());}
   return [...new Set(errors)];
  });
  for(const error of errors)failures.push(label+': form: '+error);
 }
 async function journey(width,height,name=String(width)){
  await page.setViewportSize({width,height});await page.goto(base+'/?to=Nadia%20Utami');await page.waitForFunction(()=>document.querySelector('#app')?.dataset.ready==='true');await settled();
  await stage(name+'-load');
  await page.locator('#music-toggle').click();await audit(name+'-music-toggle');
  await page.locator('#music-toggle').click();
  for(let step=0;step<7;step++){await audit(name+'-arrival-'+step,step===0);if(step<6)await next();}
  for(const [id,steps] of [['gate',2],['greeting',4],['countdown',3],['location',2],['rundown-0',1],['dresscode',3]]){
   await chapter(id);
   for(let step=0;step<steps;step++){
    await audit(name+'-'+id+'-'+step,step===steps-1);
    if(step<steps-1)await next();
   }
  }
  await page.evaluate(()=>auditJourney.goTo('reservation'));await settled();await audit(name+'-book-intro',true);await next();
  await page.locator('[name="attendance"][value="attending"]').check();
  await page.locator('#plus').click();assert.equal(await page.locator('#guest-count').inputValue(),'2');await page.locator('#minus').click();assert.equal(await page.locator('#guest-count').inputValue(),'1');assert.ok(await page.locator('#minus').isDisabled());
  await audit(name+'-form',true);await formFits(name+'-form');
  await page.locator('#submit-reservation').click();await page.waitForSelector('#reservation-success:visible');await audit(name+'-success',true);
  await page.locator('#edit-reservation').click();await audit(name+'-edit',true);
  await page.locator('#recall-ticket').click();await next();await audit(name+'-ticket',true);
  await page.locator('#nav-back').hover();await audit(name+'-nav-hover');
  await stage(name+'-end');
  await context.clearCookies();await page.evaluate(()=>localStorage.clear());
 }
 // Common phone viewports: iPhone SE 1st gen, small Android, iPhone SE 2/3, iPhone 13/14, Pixel/Galaxy, iPhone Pro Max, tablet.
 for(const [width,height] of [[320,568],[360,740],[375,667],[390,844],[412,915],[430,932],[768,1024]])await journey(width,height);
 // A phone turned sideways shows the rotate notice; turning it back resumes the same, single invitation.
 await page.setViewportSize({width:844,height:390});
 assert.equal(await page.locator('.device-notice').isVisible(),true);assert.match(await page.locator('.device-notice').textContent(),/Putar/);assert.equal(await page.locator('#app').isHidden(),true);
 await page.screenshot({path:out+'/phone-landscape-notice.png'});
 await page.setViewportSize({width:390,height:844});await page.waitForFunction(()=>document.querySelector('#app').dataset.ready==='true');await stage('phone-rotated-back');
 // Desktop and laptop (mouse + keyboard, no touch), e.g. WhatsApp Web.
 for(const [width,height] of [[1366,768],[1920,1080]]){
  await useContext({viewport:{width,height},deviceScaleFactor:1,hasTouch:false,isMobile:false});
  await journey(width,height,'desktop-'+width+'x'+height);
  await page.screenshot({path:out+'/desktop-'+width+'x'+height+'-overview.png'});
  // Arrow keys page through the story like the Next/Back buttons.
  await chapter('gate');assert.equal(await page.locator('#invitation').getAttribute('data-scene'),'0');
  await page.locator('body').focus();for(let i=0;i<2;i++){await page.keyboard.press('ArrowRight');await settled();}
  assert.equal(await page.locator('#invitation').getAttribute('data-scene'),'1','ArrowRight should advance the story on desktop');
  await page.keyboard.press('ArrowLeft');await settled();assert.equal(await page.locator('#invitation').getAttribute('data-scene'),'0','ArrowLeft should go back on desktop');
 }
 // Tablet held in landscape, then turned to portrait without a reload.
 await useContext({viewport:{width:1024,height:768},userAgent:devices['iPad (gen 7)'].userAgent,deviceScaleFactor:2,hasTouch:true,isMobile:true});
 await journey(1024,768,'tablet-1024x768');
 await page.setViewportSize({width:768,height:1024});await stage('tablet-rotated-portrait');
 await page.setViewportSize({width:1024,height:768});await stage('tablet-rotated-landscape');await page.screenshot({path:out+'/tablet-1024x768-overview.png'});
 await fs.writeFile(out+'/results.json',JSON.stringify({failures,records},null,2));
 assert.deepEqual(failures,[],'All visible button/dialogue text must fit inside proportionally scaled artwork');
 console.log('PASS: '+records.length+' screen/state checks; matching angular buttons and dialogues; native artwork proportions; text fits; +/−, submit, edit, recall, ticket.');
}finally{await browser.close();}
