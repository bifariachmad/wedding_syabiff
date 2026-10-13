import sharp from 'sharp';
import fs from 'node:fs/promises';
const source=JSON.parse(await fs.readFile('source-art/refinements-20261012/dialogue-height-prompts.json','utf8'));
const folder='public/assets/png/ui-v2';
const sizes=JSON.parse(await fs.readFile(folder+'/sizes.json','utf8'));
for(const asset of source.assets){
 const trimmed=await sharp(asset.path).trim({threshold:5}).toBuffer();
 const output=folder+'/'+asset.id+'.png';
 await sharp(trimmed).resize({width:960}).png().toFile(output);
 const {width,height}=await sharp(output).metadata();
 sizes[asset.id]={width,height};
 console.log(asset.id,width,height);
}
await fs.writeFile(folder+'/sizes.json',JSON.stringify(sizes,null,2)+'\n');
