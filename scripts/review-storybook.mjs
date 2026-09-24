import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import sharp from 'sharp';
await fs.mkdir('artifacts/storybook',{recursive:true});
const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await b.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:5173/');await page.waitForFunction(()=>document.querySelector('#app')?.dataset.ready==='true');await page.evaluate(()=>document.fonts.ready);
for(const id of ['gate','cover','greeting','countdown','location','rundown','dresscode','reservation','closing']){
 const section=page.locator('#'+id);await section.scrollIntoViewIfNeeded();await section.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(async img=>{if(img.dataset.src){img.src=img.dataset.src;delete img.dataset.src;}img.loading='eager';await img.decode().catch(()=>{});})));await section.screenshot({path:`artifacts/storybook/${id}.png`});
}
await b.close();
const names=['gate','cover','greeting','countdown','location','dresscode','reservation','closing'];const layers=[];for(let i=0;i<names.length;i++)layers.push({input:await sharp(`artifacts/storybook/${names[i]}.png`).resize(260,620,{fit:'contain',background:'#E9DDC9'}).toBuffer(),left:i%4*260,top:Math.floor(i/4)*620});await sharp({create:{width:1040,height:1240,channels:3,background:'#E9DDC9'}}).composite(layers).png().toFile('artifacts/storybook/overview.png');console.log(JSON.stringify({errors,sections:9}));
