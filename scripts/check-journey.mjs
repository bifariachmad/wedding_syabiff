import {chromium} from 'playwright';
const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const p=await b.newPage({viewport:{width:390,height:844}});
p.on('pageerror',e=>console.log('ERROR',e.stack));
try{
 await p.goto('http://127.0.0.1:5173/');await p.waitForFunction(()=>document.querySelector('#app').dataset.ready==='true');
 for(const target of [...Array.from({length:15},(_,i)=>i+1),14,13,12,11,10,9,8,7,6,5,4,3,2,1,0]){
  const before=Number(await p.locator('#invitation').getAttribute('data-scene'));
  console.log('GO',before,target);
  await p.locator(target>before?'#nav-next':'#nav-back').click();
  await p.waitForFunction(i=>document.querySelector('#invitation').dataset.scene===String(i)&&document.querySelector('#invitation').dataset.travelling==='false',target,{timeout:6000});
 }
 console.log('All 30 normal-motion transitions pass');
}catch(e){console.log(e.message);console.log(await p.locator('#invitation').evaluate(e=>({...e.dataset,active:document.activeElement?.outerHTML})));await p.screenshot({path:'artifacts/novel/journey-failure.png'});throw e;}finally{await b.close();}
