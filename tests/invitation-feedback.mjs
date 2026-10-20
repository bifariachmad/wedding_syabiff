import {chromium,devices} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createBackend} from './gas-harness.mjs';
import {CONFIG} from '../src/config.js';
const base=process.env.INVITATION_BASE_URL||'http://127.0.0.1:5173',out='artifacts/invitation-feedback';
await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 const context=await browser.newContext({...devices['iPhone 13'],reducedMotion:'reduce',acceptDownloads:true});
 const backend=createBackend(),errors=[];
 await context.route(/\/src\/config\.js(?:\?.*)?$/,async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace(/APPS_SCRIPT_URL: [^\r\n]+/,`APPS_SCRIPT_URL: '${base}/__test-api',`)});});
 await context.route('**/__test-api',route=>route.fulfill({contentType:'application/json',body:JSON.stringify(backend.call(route.request().postDataJSON()))}));
 await context.addInitScript(()=>{
  window.audioEvents=[];
  const create=AudioContext.prototype.createBufferSource;
  AudioContext.prototype.createBufferSource=function(){const node=create.call(this),start=node.start;node.start=function(...args){window.audioEvents.push({duration:node.buffer?.duration,scene:document.querySelector('.vn-scene.is-active')?.id,arrival:document.querySelector('#greeting')?.dataset.arrival,coupleOpacity:document.querySelector('#greeting .welcome-couple')?.style.opacity});return start.apply(node,args);};return node;};
 });
 const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
 const ready=()=>page.waitForFunction(()=>document.querySelector('#app')?.dataset.ready==='true');
 const settled=()=>page.waitForFunction(()=>!Object.entries(document.querySelector('#invitation').dataset).some(([key,value])=>(key.endsWith('Busy')||key==='travelling')&&value==='true'));
 async function advance(){await page.locator('#nav-next').click();await settled();}
 async function copy(selector,value){assert.equal(await page.locator(selector).textContent(),value);}
 async function shot(name){await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:`${out}/${name}.png`});}
 await page.goto(base+'/?to=Nadia%20Utami');await ready();
 const prologue=['Hari ini rasanya ada yang berbeda...','Wah... sepertinya ada tamu yang datang.','Lho... ke mana tamunya?','Undangan?','Dari siapa ya…','','Kamu diundang.'];
 for(let i=0;i<prologue.length;i++){await copy('#arrival-line',prologue[i]);if(i===5){assert.equal(await page.locator('.arrival-address').count(),0);assert.equal(await page.locator('.arrival-caption').evaluate(e=>getComputedStyle(e).opacity),'0');await shot('envelope');}if(i<6)await advance();}
 await copy('.arrival-card-copy strong','Kamu diundang');
 await page.locator('#nav-back').click();await settled();assert.equal(await page.locator('.arrival-caption').evaluate(e=>getComputedStyle(e).opacity),'0');await advance();await advance();
 await copy('#courtyard-line','Di mana ini…? Rasanya tidak asing.');
 await page.emulateMedia({reducedMotion:'no-preference'});await advance();await copy('#courtyard-line','Aku penasaran...');const gateStart=Date.now();await advance();const gateElapsed=Date.now()-gateStart;assert.ok(gateElapsed<6500,`Gate and logo transition completes in under 6.5 seconds (was ${gateElapsed}ms)`);
 assert.equal(await page.locator('.courtyard-rose-frame').count(),0);
 assert.equal(await page.locator('.wedding-logo').getAttribute('data-logo-state'),'complete');
 assert.ok(await page.locator('.logo-original').evaluate(el=>el.naturalWidth===1891));await shot('animated-logo');
 assert.equal((await page.evaluate(()=>audioEvents.filter(e=>Math.abs(e.duration-4.65)<.001))).length,1,'One full hinge creak per gate swing');
 await advance();await copy('#greeting-title','Sebuah pintu');await copy('#welcome-line','Rumah ini... terasa tidak asing...');await advance();
 await copy('#welcome-line','Hai, selamat datang! Aku Bifari. Mari masuk.');
 assert.equal((await page.evaluate(()=>audioEvents.filter(e=>e.scene==='greeting'&&e.arrival==='empty'&&e.coupleOpacity==='0'&&Math.abs(e.duration-.19)<.001))).length,3,'Three footsteps before hosts appear');
 await page.emulateMedia({reducedMotion:'reduce'});await advance();await copy('#welcome-line','Aku Syafira. Terima kasih sudah membuka undangan kami.');await advance();await advance();
 await copy('#countdown-title','Tanggal resepsi');await copy('#clockroom-line','Resepsi kami akan berlangsung pada Sabtu, 31 Oktober 2026.');
 await advance();await copy('#clockroom-line','Acaranya dimulai pukul 16:00 WIB. Sampai bertemu di sana!');await advance();await copy('#clockroom-line','Kabari kami lewat konfirmasi kehadiran di undangan ini, ya.');
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.evaluate(()=>{
  window.transitionFrames=[];window.captureTransition=true;
  window.effectiveOpacity=e=>{let opacity=1;for(;e;e=e.parentElement)opacity*=Number(getComputedStyle(e).opacity);return opacity;};
  function frame(){transitionFrames.push({old:effectiveOpacity(document.querySelector('.clockroom-countdown')),next:effectiveOpacity(document.querySelector('#location .vn-artwork'))});if(captureTransition)requestAnimationFrame(frame);}requestAnimationFrame(frame);
 });
 await advance();
 const frames=await page.evaluate(()=>{captureTransition=false;return transitionFrames;});
 assert.ok(frames.some(f=>f.next>.1));assert.ok(frames.every(f=>f.next<.01||f.old<.01),'Countdown must disappear before the map room appears');
 await page.locator('#nav-back').click();await settled();assert.ok(await page.evaluate(()=>effectiveOpacity(document.querySelector('.clockroom-countdown'))>.99));await advance();
 await page.emulateMedia({reducedMotion:'reduce'});
 await copy('#location-title','Lokasi resepsi');await copy('#maproom-line','Resepsi kami diadakan di Lumbung Kuliner.');await advance();await copy('#maproom-line','Buka Google Maps lewat tombol lokasi untuk melihat rutenya.');await advance();
 await copy('#rundown-0-title','Rundown acara');await copy('.agenda-line','Acara akan kami mulai pukul 16:00 WIB.');
 assert.deepEqual(await page.locator('.agenda-entry h3').allTextContents(),CONFIG.RUNDOWN.map(item=>item.title));assert.equal(await page.locator('.agenda-entry time').count(),0);
 assert.ok(await page.evaluate(()=>getComputedStyle(document.querySelector('.agenda-entry h3')).fontFamily===getComputedStyle(document.querySelector('.agenda-line')).fontFamily&&getComputedStyle(document.querySelector('.agenda-entry h3')).fontStyle==='normal'));
 for(const [width,height] of [[360,640],[390,844],[768,1024]]){
  await page.setViewportSize({width,height});await shot('rundown-'+width);
  assert.deepEqual(await page.locator('.agenda-card').evaluate(card=>{const r=card.getBoundingClientRect();return [...card.querySelectorAll('h3')].filter(el=>{const b=el.getBoundingClientRect();return b.left<r.left||b.right>r.right+1||b.bottom>r.bottom+1;}).map(el=>el.textContent);}),[]);
 }
 await page.setViewportSize({width:390,height:844});await advance();await copy('#dresscode-title','Dresscode');
 await copy('#wardrobe-line','Untuk dresscode, kami memilih maroon atau hitam.');await advance();await copy('#wardrobe-line','Kamu boleh memilih salah satunya atau memadukan keduanya.');await advance();await copy('#wardrobe-line','Pilih pakaian yang nyaman untuk menikmati acara.');
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.evaluate(()=>{window.bookTextFrames=[];window.captureBookText=true;function sample(){if(document.querySelector('#reservation').classList.contains('is-active'))bookTextFrames.push(document.querySelector('.guestbook-line').textContent);if(captureBookText)requestAnimationFrame(sample);}requestAnimationFrame(sample);});
 await advance();
 const bookTextFrames=await page.evaluate(()=>{captureBookText=false;return bookTextFrames;});
 assert.ok(new Set(bookTextFrames.filter(t=>t.length>0&&t.length<100)).size>5,'Book introduction types visibly, rather than appearing all at once');
 await copy('.guestbook-line','Beri tahu kami apakah kamu bisa hadir, supaya kami bisa menyiapkan tempat untukmu.');await shot('book-introduction');await page.emulateMedia({reducedMotion:'reduce'});await advance();
 assert.equal(await page.locator('#reservation-title').evaluate(el=>getComputedStyle(el).textAlign),'center');
 await copy('.reservation-intro','Bisa hadir atau sedang berhalangan? Beri kabar di sini, ya.');
 await page.locator('[name="attendance"][value="attending"]').check();await page.locator('#guest-count').fill('2');
 for(const [width,height] of [[360,640],[390,844],[768,1024]]){await page.setViewportSize({width,height});await shot('form-'+width);}
 await page.locator('#submit-reservation').click();await page.waitForSelector('#reservation-success:visible');
 assert.ok(await page.locator('#reservation-title').isHidden());
 for(const [width,height] of [[360,640],[390,844],[768,1024]]){
  await page.setViewportSize({width,height});await page.locator('#edit-reservation').scrollIntoViewIfNeeded();await shot('success-'+width);
  assert.ok(await page.locator('#edit-reservation').evaluate(el=>{const b=el.getBoundingClientRect(),range=document.createRange();range.selectNodeContents(el);const t=range.getBoundingClientRect(),p=el.closest('.vn-form-content').getBoundingClientRect();return t.left>=b.left&&t.right<=b.right&&b.left>=p.left&&b.right<=p.right+1&&b.bottom<=p.bottom+1;}),'Edit action fits its button and the book page at '+width);
 }
 const code=await page.locator('.ticket-code').textContent();
 await page.locator('#edit-reservation').click();await copy('#submit-reservation','Update Kehadiran');await page.locator('[name="attendance"][value="attending"]').check();await page.locator('#guest-count').fill('3');await page.locator('#submit-reservation').click();await page.waitForFunction(()=>document.querySelector('.ticket-guests').textContent==='3');await copy('.ticket-code',code);
 await page.setViewportSize({width:390,height:844});await advance();await shot('ticket-preview');
 assert.equal(await page.locator('.ending-music-credit').count(),0);
 for(const [width,height] of [[360,640],[390,844],[768,1024]]){
  await page.setViewportSize({width,height});await shot('ticket-preview-'+width);
  assert.ok(await page.evaluate(()=>document.querySelector('.ticket-preview').getBoundingClientRect().top>document.querySelector('#closing .welcome-heading').getBoundingClientRect().bottom),'Ticket does not overlap its heading at '+width);
 }
 const downloading=page.waitForEvent('download');await page.locator('#save-summary').click();const download=await downloading;await download.saveAs(out+'/sample-ticket.png');
 const png=await fs.readFile(out+'/sample-ticket.png');
 const decoded=await page.evaluate(async src=>{const {default:Scanner}=await import('/node_modules/qr-scanner/qr-scanner.min.js');return(await Scanner.scanImage(src,{returnDetailedScanResult:true})).data;},'data:image/png;base64,'+png.toString('base64'));
 assert.equal(decoded,'DJSL-'+code.replaceAll(' ',''));
 assert.ok((await page.locator('.ticket-preview').getAttribute('alt')).includes(CONFIG.EVENT.addressLines.join(', ')));
 await page.locator('#nav-back').click();await settled();await page.locator('#edit-reservation').click();await copy('#submit-reservation','Update Kehadiran');
 // Exercise the renderer with a maximum-length unbroken name and inspect actual paint bounds.
 const long=await page.evaluate(async()=>{
  const {renderSummaryCanvas}=await import('/src/summary.js');const original=CanvasRenderingContext2D.prototype.fillText,drawn=[];
  CanvasRenderingContext2D.prototype.fillText=function(text,x,y,...args){const m=this.measureText(text);drawn.push({text,left:x-m.actualBoundingBoxLeft,right:x+m.actualBoundingBoxRight,top:y-m.actualBoundingBoxAscent,bottom:y+m.actualBoundingBoxDescent});return original.call(this,text,x,y,...args);};
  try{const canvas=await renderSummaryCanvas({id:'123456',name:'N'.repeat(60),guests:5,demo:true});return {data:canvas.toDataURL(),drawn};}finally{CanvasRenderingContext2D.prototype.fillText=original;}
 });
 assert.ok(long.drawn.every(t=>t.left>=130&&t.right<=950&&t.top>=250&&t.bottom<=1380),'Ticket typography stays inside its decorative border');
 assert.ok(long.drawn.some(t=>t.text.includes('20244')));await fs.writeFile(out+'/long-name-ticket.png',Buffer.from(long.data.split(',')[1],'base64'));
 assert.ok(long.drawn.some(t=>t.text==='Teruntuk'));
 assert.ok(long.drawn.some(t=>t.text==='Dresscode:'));
 assert.ok(long.drawn.some(t=>t.text===CONFIG.EVENT.dresscode));
 assert.ok(!long.drawn.some(t=>t.text==='TIKET RESEPSI'||t.text==='KHUSUS UNTUK'||t.text.includes('Achmad Bifari')));
 assert.deepEqual(errors,[]);
 await fs.writeFile(out+'/results.json',JSON.stringify({copyParts:8,viewports:[360,390,768],hingeSound:true,footstepsBeforeHosts:3,transitionFrames:frames.length,returnTransition:true,reservationUpdated:true,ticketQrDecoded:decoded,addressComplete:true,longNameFits:true,browserErrors:errors},null,2));
 console.log('PASS: 8 chapters; sound timing; no countdown carryover; phone/tablet book, rundown and buttons; update reservation; PNG QR; full address; long names.');
}finally{await browser.close();}
