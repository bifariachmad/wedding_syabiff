import sharp from 'sharp';
import fs from 'node:fs/promises';
for(const name of ['bifari-front','syafira-front','manor-exterior']){
 const out=`public/assets/png/welcome/${name}.png`;
 const source=name==='manor-exterior'?'scene3-artwork-v2':'scene3-artwork-v4';
 await sharp(`../${source}/${name}.png`).resize({width:1000,withoutEnlargement:true}).png({palette:true,colours:192,dither:0,compressionLevel:9}).toFile(out);
 console.log(name,(await fs.stat(out)).size);
}
await fs.copyFile('../source-art/scene3-artwork-v2/prompt-manifest.json','artwork/welcome-generation-v2.json');
await fs.copyFile('../source-art/scene3-artwork-v4/prompt-manifest.json','artwork/welcome-generation-v4.json');
