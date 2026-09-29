import sharp from 'sharp';
import fs from 'node:fs/promises';
const source='../source-art/scene1-artwork-v4';
for(const [name,width]of [['hand-short',650],['holding-hands',1000],['ui-panel',700],['ui-divider',850],['ui-sound-on',120],['ui-sound-off',120]]){
 if(process.argv[2]&&name!==process.argv[2])continue;
 let pipeline=sharp(`${source}/${name}.png`);
 if(name.startsWith('ui-'))pipeline=pipeline.trim({threshold:8});
 const out=`public/assets/png/arrival/${name}.png`;
 await pipeline.resize({width,withoutEnlargement:true}).png({palette:true,colours:96,dither:0,compressionLevel:9}).toFile(out);
 const m=await sharp(out).metadata();console.log(name,m.width,m.height,(await fs.stat(out)).size);
}
if(!process.argv[2])await fs.copyFile(`${source}/manifest.json`,'artwork/arrival-generation-v4.json');
