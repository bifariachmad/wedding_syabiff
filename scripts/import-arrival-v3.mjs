import sharp from 'sharp';
import fs from 'node:fs/promises';
const source='../scene1-artwork-v3';
for(const [name,width]of [['hand-left',650],['invitation-card',900],['burn-edge',850]]){
 if(process.argv[2]&&name!==process.argv[2])continue;
 let pipeline=sharp(`${source}/${name==='hand-left'?'hand-left-long':name}.png`);
 if(name!=='hand-left')pipeline=pipeline.trim({threshold:8});
 const out=`public/assets/png/arrival/${name}.png`;
 await pipeline.resize({width,withoutEnlargement:true}).png({palette:true,colours:96,dither:0,compressionLevel:9}).toFile(out);
 console.log(name,(await fs.stat(out)).size,await sharp(out).metadata());
}
if(!process.argv[2])await fs.copyFile(`${source}/manifest.json`,'artwork/arrival-generation-v3.json');
