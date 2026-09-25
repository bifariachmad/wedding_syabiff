import {chromium} from 'playwright';
const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const p=await b.newPage({viewport:{width:360,height:640},reducedMotion:'reduce'});await p.goto('http://127.0.0.1:5173/');await p.waitForFunction(()=>document.querySelector('#app').dataset.ready==='true');
console.log(await p.evaluate(()=>['#invitation','.vn-bottom','.vn-navigation','#nav-back','#nav-next','#journey-position'].map(s=>{let e=document.querySelector(s),c=getComputedStyle(e);return {s,rect:e.getBoundingClientRect().toJSON(),transform:c.transform,translate:c.translate,bg:c.backgroundImage,grid:c.gridTemplateColumns}})));
await b.close();
