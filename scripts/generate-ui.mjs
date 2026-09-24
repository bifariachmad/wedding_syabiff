import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import sharp from 'sharp';
await fs.mkdir('public/assets/png',{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage();
const images=await page.evaluate(()=>{
 const result={},ink='#15100E',paper='#D8C7A3',light='#EADFC8',maroon='#6B1420';
 const canvas=(name,w,h,draw)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');draw(g,w,h);result[name]=c.toDataURL('image/png').split(',')[1];};
 const icons={pin:'M12 22S4 14 4 9a8 8 0 0 1 16 0c0 5-8 13-8 13ZM15 9a3 3 0 1 0-6 0a3 3 0 1 0 6 0',calendar:'M3 5h18v16H3ZM3 10h18M7 2v5M17 2v5M7 14h2m5 0h2m-9 3h2m5 0h2','music-on':'M9 17V5l12-3v13M9 8l12-3M9 18a3 3 0 1 0-6 0a3 3 0 1 0 6 0M21 16a3 3 0 1 0-6 0a3 3 0 1 0 6 0','music-off':'M9 17V5l12-3v13M2 2l20 20M9 18a3 3 0 1 0-6 0a3 3 0 1 0 6 0',share:'M8 10l7-4M8 14l7 4M8 12a3 3 0 1 0-6 0a3 3 0 1 0 6 0M21 4a3 3 0 1 0-6 0a3 3 0 1 0 6 0M21 20a3 3 0 1 0-6 0a3 3 0 1 0 6 0',download:'M12 2v13m-5-5 5 5 5-5M3 16v5h18v-5',check:'M3 12l6 7L22 4',close:'M5 5l14 14M19 5L5 19',plus:'M4 12h16M12 4v16',minus:'M4 12h16'};
 for(const [name,path]of Object.entries(icons))canvas('icon-'+name,72,72,g=>{g.scale(3,3);g.lineCap='round';g.lineJoin='round';g.strokeStyle=ink;g.lineWidth=1.9;g.stroke(new Path2D(path));g.globalAlpha=.2;g.translate(.25,-.18);g.lineWidth=.65;g.stroke(new Path2D(path));});
 canvas('scanner-frame',240,240,g=>{g.scale(10,10);g.strokeStyle=paper;g.lineWidth=1;g.stroke(new Path2D('M2 8V2h6M16 2h6v6M22 16v6h-6M8 22H2v-6'));});
 let seed=42;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 canvas('paper-filter',180,180,(g,w,h)=>{g.fillStyle=paper;g.fillRect(0,0,w,h);for(let i=0;i<8000;i++){g.fillStyle=i%2?ink:light;g.globalAlpha=random()*.15;g.fillRect(random()*w,random()*h,random()*1.5+.25,random()*2+.25);}});
 canvas('fold-lines',360,500,g=>{g.strokeStyle=ink;g.globalAlpha=.08;g.lineWidth=1;g.beginPath();g.moveTo(177,0);g.lineTo(183,250);g.lineTo(176,500);g.moveTo(0,249);g.lineTo(360,253);g.stroke();});
 canvas('stain-coffee',220,220,g=>{g.strokeStyle=maroon;for(let i=0;i<7;i++){g.globalAlpha=.018;g.lineWidth=3;g.beginPath();g.ellipse(110+i*.4,110,74+i,78-i,.2,0,Math.PI*1.9);g.stroke();}});
 canvas('ink-splatter',120,120,g=>{g.fillStyle=ink;for(let i=0;i<18;i++){g.globalAlpha=random()*.35;g.beginPath();g.ellipse(60+(random()-.5)*75,60+(random()-.5)*75,random()*5+1,random()*7+1,random()*6,0,7);g.fill();}});
 canvas('mask-torn-edge',640,40,g=>{g.fillStyle=paper;g.beginPath();g.moveTo(0,40);for(let x=0;x<=640;x+=6)g.lineTo(x,8+random()*12);g.lineTo(640,40);g.closePath();g.fill();});
 canvas('stars',500,260,g=>{g.fillStyle=paper;for(let i=0;i<8;i++){const x=25+(i*139)%450,y=20+(i*71)%220,s=3+i%3;g.beginPath();g.moveTo(x,y-2*s);g.lineTo(x+s,y-s*.5);g.lineTo(x+2*s,y);g.lineTo(x+s*.5,y+s);g.lineTo(x,y+2*s);g.lineTo(x-s*.5,y+s);g.lineTo(x-2*s,y);g.lineTo(x-s,y-s*.5);g.closePath();g.fill();}});
 canvas('ticket',340,500,g=>{g.fillStyle=light;g.fillRect(10,10,320,480);g.strokeStyle=ink;g.lineWidth=2;g.strokeRect(10,10,320,480);g.lineWidth=1;g.strokeRect(20,20,300,460);g.setLineDash([2,5]);g.beginPath();g.moveTo(10,180);g.lineTo(330,180);g.stroke();g.strokeRect(95,260,150,150);});
 return result;
});
for(const [name,data]of Object.entries(images))await fs.writeFile(`public/assets/png/${name}.png`,Buffer.from(data,'base64'));
await browser.close();
for(const [name,size]of [['favicon-32',32],['apple-touch-icon-180',180],['icon-512',512]]){
 const symbol=await sharp('public/assets/png/lantern.png').resize(Math.round(size*.72),Math.round(size*.9),{fit:'inside'}).toBuffer();
 const m=await sharp(symbol).metadata();
 await sharp({create:{width:size,height:size,channels:4,background:'#15100E'}}).composite([{input:symbol,left:Math.round((size-m.width)/2),top:Math.round((size-m.height)/2)}]).png({palette:true}).toFile(`public/assets/${name}.png`);
}
console.log(`Generated ${Object.keys(images).length} procedural PNG UI and texture assets, plus three PNG brand icons.`);
