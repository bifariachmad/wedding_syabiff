import sharp from 'sharp';
import fs from 'node:fs/promises';
await fs.mkdir('public/assets/png/courtyard',{recursive:true});
for(const [name,width]of [['morning-garden',1024],['gate-pair',1000]]){
 const out=`public/assets/png/courtyard/${name}.png`;
 await sharp(`../source-art/scene2-artwork/${name}.png`).resize({width}).png({palette:true,colours:128,dither:0,compressionLevel:9}).toFile(out);
 console.log(name,(await fs.stat(out)).size);
}
await fs.copyFile('../source-art/scene2-artwork/manifest.json','artwork/courtyard-generation.json');
