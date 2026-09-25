import sharp from 'sharp';
import fs from 'node:fs/promises';
await fs.mkdir('public/assets/png/clockroom',{recursive:true});
for(const name of ['bifari-speaking','syafira-speaking','bifari-speaking-closed','syafira-speaking-closed','clock-room','garden-shrub']){
 await sharp(`../scene4-artwork/${name}.png`).resize({width:1000,withoutEnlargement:true}).png({palette:true,colours:192,dither:0,compressionLevel:9}).toFile(`public/assets/png/clockroom/${name}.png`);
}
// Full-resolution registration is preserved across facade and both leaves.
for(const name of ['facade','door-left','door-right'])await fs.copyFile(`../scene3-door-layers/${name}.png`,`public/assets/png/welcome/${name}.png`);
await fs.copyFile('../scene4-artwork/prompt-manifest.json','artwork/clockroom-generation.json');
await fs.copyFile('../scene3-door-layers/metadata.json','artwork/matching-door-layers.json');
