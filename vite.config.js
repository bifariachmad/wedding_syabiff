import {defineConfig,loadEnv} from 'vite';
import {CONFIG} from './src/config.js';
import {invitationMarkup} from './src/markup.js';
export default defineConfig(({mode})=>{
 const env=loadEnv(mode,process.cwd(),'VITE_');
 const base=(env.VITE_DIGITAL_URL||CONFIG.BASE_URL).replace(/\/$/,'');
 return {server:{watch:{ignored:['**/artifacts/**']}},plugins:[{name:'invitation-metadata',transformIndexHtml(html){html=html.replace('<div id="app"></div>',`<div id="app">${invitationMarkup()}</div>`);return html.replace('content="/assets/og-image.png"',`content="${base}/assets/og-image.png"`);}}],build:{target:'es2022',sourcemap:false}};
});
