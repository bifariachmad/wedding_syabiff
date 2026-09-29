import sharp from 'sharp';
import fs from 'node:fs/promises';
await fs.mkdir('public/assets/png/welcome',{recursive:true});
for(const name of ['welcome-hall','manor-door']){
 const out=`public/assets/png/welcome/${name}.png`;
 await sharp(`../source-art/scene3-artwork/${name}.png`).resize({width:1000,withoutEnlargement:true}).png({palette:true,colours:128,dither:0,compressionLevel:9}).toFile(out);
 console.log(name,(await fs.stat(out)).size);
}
await fs.copyFile('../source-art/scene3-artwork/prompt-manifest.json','artwork/welcome-generation.json');
