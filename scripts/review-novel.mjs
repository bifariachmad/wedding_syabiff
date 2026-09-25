import { chromium } from 'playwright';
import fs from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
await fs.mkdir('artifacts/novel',{recursive:true});
const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
page.on('pageerror',e=>console.log('ERROR',e.message));
page.on('response',r=>{if(r.status()>=400)console.log('HTTP',r.status(),r.url());});
try{
for(const size of [{width:390,height:844},{width:360,height:640},{width:1440,height:900}]){
 await page.setViewportSize(size);await page.goto('http://127.0.0.1:5173/');await page.waitForFunction(()=>document.querySelector('#app').dataset.ready==='true');await page.evaluate(()=>document.fonts.ready);
 for(let s=0;s<4;s++){await page.locator('#nav-next').click();await page.waitForFunction(()=>document.querySelector('#invitation').dataset.prologueBusy==='false');}
 for(let i=0;i<16;i++){
  await page.waitForFunction(i=>document.querySelector('#invitation').dataset.scene===String(i)&&document.querySelector('#invitation').dataset.travelling==='false',i);
  if([0,1,2,3,4,10,13,14,15].includes(i))await page.screenshot({path:`artifacts/novel/${size.width}-${i}.png`});
  const clipped=await page.locator('.vn-scene.is-active .vn-dialogue').evaluate(el=>{const r=el.getBoundingClientRect();return r.top<55||r.bottom>innerHeight-60;});
  if(clipped)console.log('CLIPPED',size,i);
  if(i<15)await page.locator('#nav-next').click();
 }
}
}finally{await browser.close();}
