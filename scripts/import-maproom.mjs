import sharp from 'sharp';
import fs from 'node:fs/promises';
await fs.mkdir('public/assets/png/maproom',{recursive:true});
for(const name of ['raven-up','raven-down','map-room'])await sharp(`../scene5-artwork/${name}.png`).resize({width:name==='map-room'?1000:600}).png({palette:true,colours:160,dither:0,compressionLevel:9}).toFile(`public/assets/png/maproom/${name}.png`);
for(const who of ['bifari','syafira']){
 const mask=await sharp(`../scene3-artwork-v4/${who}-front.png`).extractChannel('alpha').resize(500,42,{fit:'fill'}).blur(4).linear(.6).png().toBuffer();
 await sharp({create:{width:500,height:42,channels:3,background:'#080305'}}).joinChannel(mask).png().toFile(`public/assets/png/maproom/${who}-ground.png`);
}
for(const name of ['gate-left','gate-right'])await fs.copyFile(`../scene2-gate-layers/${name}.png`,`public/assets/png/courtyard/${name}.png`);
await fs.copyFile('../scene5-artwork/prompts.json','artwork/maproom-generation.json');
await fs.copyFile('../scene2-gate-layers/metadata.json','artwork/gate-layer-registration.json');
