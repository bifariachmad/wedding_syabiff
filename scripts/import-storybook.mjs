import fs from 'node:fs/promises';
import sharp from 'sharp';
const dir='../storybook-artwork',widths={'storybook-stage':800,'storybook-gate':640,'raven-messenger':440};
await fs.mkdir('artifacts/storybook',{recursive:true});
for(const [key,width]of Object.entries(widths)){
 await sharp(`${dir}/${key}.png`).trim({threshold:12}).resize({width}).png({palette:true,colours:160,quality:90,dither:.25,effort:10}).toFile(`public/assets/png/${key}.png`);
 await sharp(`public/assets/png/${key}.png`).resize(440,500,{fit:'contain',background:'#FFF9EF'}).flatten({background:'#FFF9EF'}).png().toFile(`artifacts/storybook/${key}-review.png`);
 const stat=await fs.stat(`public/assets/png/${key}.png`);console.log(key,stat.size);
}
await fs.copyFile(`${dir}/generation-manifest.json`,'artwork/storybook-generation.json');
let markup=await fs.readFile('src/markup.js','utf8');markup=markup.replace("const sceneArt={gate:'gate',book:'book-quill',messenger:'raven-flight'}","const sceneArt={gate:'storybook-gate',book:'storybook-stage',messenger:'raven-messenger'}");await fs.writeFile('src/markup.js',markup);
let html=await fs.readFile('index.html','utf8');html=html.replace('href="/assets/png/gate.png"','href="/assets/png/storybook-gate.png"').replace('name="theme-color" content="#15100E"','name="theme-color" content="#FFF9EF"');await fs.writeFile('index.html',html);
