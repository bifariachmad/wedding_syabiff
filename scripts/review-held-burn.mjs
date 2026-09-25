import {chromium} from 'playwright';
import fs from 'node:fs/promises';
const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 const p=await b.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});await fs.mkdir('artifacts/arrival-v4',{recursive:true});
 await p.goto('http://127.0.0.1:5173/');await p.waitForFunction(()=>document.querySelector('#app').dataset.ready==='true');
 for(let i=0;i<6;i++){await p.locator('#nav-next').click();await p.waitForFunction(()=>document.querySelector('#invitation').dataset.prologueBusy==='false');}
 await p.screenshot({path:'artifacts/arrival-v4/held-card-review.png'});await p.emulateMedia({reducedMotion:'no-preference'});
 await p.locator('#nav-next').click();await p.waitForFunction(()=>document.querySelector('#arrival').dataset.burn==='burning');await p.waitForTimeout(1600);
 await p.screenshot({path:'artifacts/arrival-v4/held-burn-review.png'});
}finally{await b.close();}
