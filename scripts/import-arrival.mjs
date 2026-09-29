import sharp from 'sharp';
import fs from 'node:fs/promises';
const source='../source-art/scene1-artwork';
await fs.mkdir('public/assets/png/arrival',{recursive:true});
for(const [name,width]of [['room-open',820],['door',360],['hands-envelope',1000],['hands-card',1000],['ink-portal',650],['envelope-floor',320],['hand-door',450]]){
 try{await fs.access(`${source}/${name}.png`);}catch{if(name==='hand-door')continue;throw new Error(`Missing ${name}`);}
 const out=`public/assets/png/arrival/${name}.png`;
 await sharp(`${source}/${name}.png`).resize({width,withoutEnlargement:true}).png({palette:true,colours:80,dither:0,compressionLevel:9}).toFile(out);
 console.log(name,(await fs.stat(out)).size);
}
await fs.copyFile(`${source}/manifest.json`,'artwork/arrival-generation.json');
