import sharp from 'sharp';
import fs from 'node:fs/promises';
const {assets}=JSON.parse(await fs.readFile('source-art/refinements-20261012/angular-buttons-prompts.json','utf8'));
const folder='public/assets/png/ui-v2';
const sizes=JSON.parse(await fs.readFile(folder+'/sizes.json','utf8'));
for(const asset of assets){
 const rectangular=/button-(compact|wide)-/.test(asset.id);
 const cutout=await sharp(asset.path).trim({threshold:5}).toBuffer();
 await sharp(cutout).resize({width:rectangular?960:192}).png().toFile(asset.output);
 const {width,height}=await sharp(asset.output).metadata();
 sizes[asset.id]={width,height};
 console.log(asset.id,width,height);
}
await fs.writeFile(folder+'/sizes.json',JSON.stringify(sizes,null,2)+'\n');
let css=await fs.readFile('src/angular-buttons.css','utf8');
for(const type of ['compact','wide']){
 const {width,height}=sizes['button-'+type+'-angular-v1'];
 css=css.replace(new RegExp('--button-'+type+'-ratio:[^;]+;'),'--button-'+type+'-ratio:'+width+'/'+height+';');
}
await fs.writeFile('src/angular-buttons.css',css);
