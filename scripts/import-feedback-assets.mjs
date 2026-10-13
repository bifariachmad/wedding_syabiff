import sharp from 'sharp';
import fs from 'node:fs/promises';
const source='source-art/refinements-20261012', target='public/assets/png';
await fs.mkdir(`${target}/title`,{recursive:true});
await sharp(`${source}/hands-envelope-black.png`).resize(1000,667).png().toFile(`${target}/arrival/hands-envelope-black.png`);
await sharp(`${source}/envelope-black.png`).resize(480,320).png().toFile(`${target}/arrival/envelope-floor-black.png`);
await sharp(`${source}/stationery-no-lantern.png`).resize(1080,1600,{fit:'fill'}).png().toFile(`${target}/ticket/stationery-no-lantern.png`);
await fs.copyFile(`${source}/logo-approved.png`,`${target}/title/wedding-logo.png`);
// Crop the three deliberately separated rows into independent animation sprites.
for(const [name,box] of [
 ['the',{left:520,top:10,width:375,height:266}],
 ['wedding',{left:0,top:290,width:1536,height:531}],
 ['names',{left:300,top:835,width:900,height:189}],
])await sharp(`${source}/logo-layers-sheet.png`).extract(box).png().toFile(`${target}/title/${name}.png`);
console.log('Imported black rose envelopes, lantern-free ticket paper and three title layers.');
