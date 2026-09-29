import fs from 'node:fs/promises';
// Materialize the admin entry for hosts that do not provide SPA rewrites.
const html=await fs.readFile('dist/index.html','utf8');
const start=html.indexOf('<div id="app">'),end=html.indexOf('<noscript>');
if(start<0||end<0)throw new Error('Missing HTML entry markers');
for(const route of ['admin','buku-tamu','reservasi','cetak','kamera','album-admin']){
  await fs.mkdir(`dist/${route}`,{recursive:true});
  await fs.writeFile(`dist/${route}/index.html`,html.slice(0,start)+'<div id="app"></div>\n'+html.slice(end));
}
