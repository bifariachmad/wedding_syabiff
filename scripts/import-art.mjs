import fs from 'node:fs/promises';
import sharp from 'sharp';
const sources=JSON.parse(await fs.readFile('artwork/sources.json','utf8'));
await fs.mkdir('public/assets/png',{recursive:true});
const results=[];
for(const source of sources){
  const meta=await sharp(source.path).metadata();
  const width=source.key==='gate-environment'?760:source.key==='gate'?700:source.key==='arch-roses'?650:source.key==='map-card'?680:source.key.startsWith('ornament')?450:source.key==='lantern'?300:440;
  let image=sharp(source.path);
  if(source.key!=='gate-environment'&&!meta.hasAlpha){
    // User-authorized cleanup of the generator's baked neutral checkerboard.
    // All intended artwork uses warm parchment, maroon, or dark ink; the grid
    // consists of bright neutral pixels. Preserve dark pen strokes and warm fills.
    const {data,info}=await image.ensureAlpha().raw().toBuffer({resolveWithObject:true});
    for(let i=0;i<data.length;i+=4){
      const r=data[i],g=data[i+1],b=data[i+2],light=(r+g+b)/3,chroma=Math.max(r,g,b)-Math.min(r,g,b);
      if(light>145){const warm=Math.max(0,Math.min(1,(chroma-9)/17));const brightness=Math.max(0,Math.min(1,(light-145)/35));data[i+3]=Math.round(255*(1-brightness*(1-warm)));}
    }
    image=sharp(data,{raw:{width:info.width,height:info.height,channels:4}});
  }
  if(source.key==='pendulum') image=image.trim({threshold:30});
  await image.resize({width:source.key==='pendulum'?120:width,withoutEnlargement:true}).png({palette:true,quality:88,colours:128,dither:.25,effort:10}).toFile(`public/assets/png/${source.key}.png`);
  const stat=await fs.stat(`public/assets/png/${source.key}.png`);
  results.push({key:source.key,alpha:meta.hasAlpha,source:[meta.width,meta.height],bytes:stat.size});
}
console.log(JSON.stringify(results));
