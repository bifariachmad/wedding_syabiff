import fs from 'node:fs/promises';
import sharp from 'sharp';
import { chromium } from 'playwright';
const files=(await fs.readdir('public/assets/png')).filter(x=>x.endsWith('.png')).sort();
await fs.mkdir('artifacts/raster-review',{recursive:true});
const markup=files.map(file=>`<article><h2>${file}</h2><p>${file.replace('.png','')} · transform / opacity on HTML wrappers</p><div class="samples">${['paper','ink'].map(theme=>`<div class="${theme}"><img src="/assets/png/${file}" width="100" height="140" alt="${file} 1x"/><img src="/assets/png/${file}" width="200" height="280" alt="${file} 2x"/></div>`).join('')}</div></article>`).join('');
await fs.writeFile('public/assets-preview.html',`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><meta name="viewport" content="width=device-width,initial-scale=1"><title>PNG artwork contact sheet</title><style>*{box-sizing:border-box}body{background:#D8C7A3;color:#15100E;margin:0;padding:22px;font:16px Georgia}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,620px),1fr));gap:20px}h1{font-size:36px}h2{font-size:18px}article{border:1px solid #15100E;padding:14px}.samples{display:grid;grid-template-columns:1fr 1fr;gap:8px}.samples>div{display:flex;align-items:center;justify-content:center;min-height:290px;padding:4px;overflow:hidden}.paper{background:#EADFC8}.ink{background:#15100E}img{max-width:66%;object-fit:contain}.ink img[src*=icon-]{filter:invert(92%) sepia(17%)}</style><h1>Dua Jiwa, Satu Lentera — original PNG artwork</h1><p>Character-reference style · 1× and 2× · paper and ink. Transparent cutout cleanup authorized by the user. Named motion wrappers are listed below. Full inventory: ASSETS.md.</p><main>${markup}</main></html>`);
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage({viewport:{width:1400,height:1000}});
await page.goto('http://127.0.0.1:5173/assets-preview.html');await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth));
const cards=page.locator('article');const shots=[];
for(let i=0;i<files.length;i++){const file=`artifacts/raster-review/asset-${i}.png`;await cards.nth(i).screenshot({path:file});shots.push(file);}
for(let i=0;i<shots.length;i+=6){const layers=[];for(let j=0;j<6&&i+j<shots.length;j++)layers.push({input:await sharp(shots[i+j]).resize(660,375,{fit:'contain',background:'#D8C7A3'}).toBuffer(),left:j%2*660,top:Math.floor(j/2)*375});await sharp({create:{width:1320,height:1125,channels:3,background:'#D8C7A3'}}).composite(layers).png().toFile(`artifacts/raster-review/sheet-${i/6+1}.png`);}
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.setViewportSize({width:390,height:844});await page.goto('http://127.0.0.1:5173/');await page.waitForSelector('#closing');await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(1200);
for(const id of ['gate','cover','greeting','countdown','location','rundown','dresscode','reservation','closing']){await page.locator('#'+id).scrollIntoViewIfNeeded();await page.waitForTimeout(1100);await page.locator('#'+id).screenshot({path:`artifacts/raster-review/scene-${id}.png`});}
await browser.close();console.log(JSON.stringify({assets:files.length,errors}));
