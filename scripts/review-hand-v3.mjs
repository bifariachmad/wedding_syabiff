import {chromium} from 'playwright';
import fs from 'node:fs/promises';
const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 const p=await b.newPage({viewport:{width:390,height:844}});
 await fs.mkdir('artifacts/arrival-v3',{recursive:true});
 await p.goto('http://127.0.0.1:5173/');await p.waitForFunction(()=>document.querySelector('#app').dataset.ready==='true');
 await p.locator('#nav-next').click();await p.waitForFunction(()=>document.querySelector('#invitation').dataset.prologueBusy==='false');
 await p.locator('#nav-next').click();await p.waitForTimeout(1080);await p.screenshot({path:'artifacts/arrival-v3/grip-review.png'});
 await p.waitForTimeout(700);await p.screenshot({path:'artifacts/arrival-v3/opening-review.png'});
 await p.waitForTimeout(650);await p.screenshot({path:'artifacts/arrival-v3/release-review.png'});
}finally{await b.close();}
