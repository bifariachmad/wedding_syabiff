import fs from 'node:fs/promises';
import sharp from 'sharp';
const root='public/assets/png/finale/';
const shapes={
 'scroll-paper':'237,208 758,208 760,455 766,717 775,835 785,1100 794,1254 206,1254 222,1100 229,816 233,557',
 'scroll-top':'207,132 243,148 410,155 612,155 749,148 786,130 801,155 806,194 789,225 752,217 291,216 208,223 193,205 191,169',
 'scroll-bottom':'172,1228 210,1240 460,1247 712,1242 827,1227 842,1251 846,1308 829,1340 791,1329 644,1315 340,1315 204,1333 173,1343 155,1316 157,1262'
};
for(const [name,points] of Object.entries(shapes)){
 const mask=Buffer.from(`<svg width="1000" height="1500"><polygon points="${points}" fill="white"/></svg>`);
 await sharp(root+'scroll-desk.png').ensureAlpha().composite([{input:mask,blend:'dest-in'}]).png().toFile(root+name+'.png');
}
