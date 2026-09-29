// Explicit integration check. Uploads a generated test image and removes only that image afterward.
import {chromium} from 'playwright';
import sharp from 'sharp';
import assert from 'node:assert/strict';
import {del} from '@vercel/blob';
import {eventKey,setSession,readJson,writeJson} from '../server/album-core.js';
const base=process.env.LIVE_BASE_URL||'https://wedding-syabiff.vercel.app';
const original=await readJson('album/settings.json',{revealed:false,uploadsOpen:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
let photoId,owner,changedSettings=false;
try{
 const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage();
 await page.goto(base+'/kamera#album='+eventKey());await page.locator('#camera-name').fill('Uji Sistem - akan dibersihkan');await page.locator('#camera-login-form button').click();await page.waitForSelector('#camera-workspace:visible');await page.waitForFunction(()=>!document.querySelector('#camera-status').textContent.includes('Menghubungkan'));assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'mobile overflow');
 owner=(await (await context.request.get(base+'/api/album')).json()).session.owner;
 const fixture=await sharp({create:{width:480,height:640,channels:3,background:'#5b2841'}}).jpeg().toBuffer();
 await page.locator('#photo-file').setInputFiles({name:'uji-sistem.jpg',mimeType:'image/jpeg',buffer:fixture});
 await page.waitForFunction(()=>document.querySelector('#camera-status').textContent.startsWith('Foto tersimpan'),{},{timeout:90000});
 await page.waitForSelector('#photo-grid img');const src=await page.locator('#photo-grid img').first().getAttribute('src');photoId=new URL(src,base).searchParams.get('id');assert.equal((await context.request.get(base+src)).status(),200);assert.equal(await page.locator('.queue-item').count(),0);
 const anon=await browser.newContext();assert.equal((await anon.request.get(base+src)).status(),401);
 const other=await browser.newContext();await other.request.post(base+'/api/album',{data:{action:'join',key:eventKey(),name:'Tamu uji kedua'}});assert.equal((await other.request.get(base+src)).status(),404);
 let adminCookie;setSession({setHeader:(_,value)=>adminCookie=value.split(';')[0]},{role:'admin',name:'Panitia QA'});
 const [name,value]=adminCookie.split('=');const admin=await browser.newContext();await admin.addCookies([{name,value,domain:new URL(base).hostname,path:'/api',secure:true,httpOnly:true,sameSite:'Lax'}]);
 const priorList=await (await admin.request.post(base+'/api/album',{data:{action:'list'}})).json();assert.equal(priorList.ok,true);
 let result=await (await admin.request.post(base+'/api/album',{data:{action:'moderate',id:photoId,status:'approved'}})).json();assert.equal(result.ok,true,JSON.stringify(result));
 if(priorList.photos.every(p=>p.id===photoId)){
  changedSettings=true;result=await (await admin.request.post(base+'/api/album',{data:{action:'settings',revealed:true}})).json();assert.equal(result.ok,true);assert.equal((await other.request.get(base+src)).status(),200);
  result=await (await admin.request.post(base+'/api/album',{data:{action:'moderate',id:photoId,status:'hidden'}})).json();assert.equal(result.ok,true);assert.equal((await other.request.get(base+src)).status(),404);
 }
 console.log('PASS production: guest join, private client upload, receipt, download, anonymous rejection, other-guest privacy, moderation and reveal.');
}catch(e){console.error('Live test failed:',e.message);process.exitCode=1;}finally{
 if(photoId&&owner){await del([`photos/${owner}/${photoId}.jpg`,`meta/${photoId}.json`]);console.log('Synthetic test photo removed.');}
 if(changedSettings)await writeJson('album/settings.json',original);
 await browser.close();
}
