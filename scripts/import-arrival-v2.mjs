import sharp from 'sharp';
import fs from 'node:fs/promises';
const source='../source-art/scene1-artwork-v2';
for(const [name,width]of [['room-open',820],['door',360],['hand-grip',500],['knock-marks',240],['clouds',650],['tree',400]]){
 const out=`public/assets/png/arrival/${name}.png`;
 await sharp(`${source}/${name}.png`).resize({width,withoutEnlargement:true}).png({palette:true,colours:80,dither:0,compressionLevel:9}).toFile(out);
 console.log(name,(await fs.stat(out)).size);
}
await fs.copyFile(`${source}/manifest.json`,'artwork/arrival-generation-v2.json');
