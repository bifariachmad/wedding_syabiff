import { defineConfig } from 'vite';
import { CONFIG } from './src/config.js';
import { invitationMarkup } from './src/markup.js';
import fs from 'node:fs';
export default defineConfig({
  server: { watch: { ignored: ['**/artifacts/**'] } },
  plugins: [{
    name: 'invitation-metadata',
    transformIndexHtml(html) {
      const origin = CONFIG.BASE_URL.replace(/\/$/, '');
      html=html.replace('<div id="app"></div>',`<div id="app">${invitationMarkup()}</div>`);
      return origin ? html.replace('content="/assets/og-image.png"', `content="${origin}/assets/og-image.png"`) : html;
    },
    buildStart() {
      const path = 'apps-script/Code.gs';
      if (fs.existsSync(path)) {
        const text = fs.readFileSync(path, 'utf8').replace(/const MAX_GUESTS = \d+;/, `const MAX_GUESTS = ${CONFIG.MAX_GUESTS};`);
        fs.writeFileSync(path, text);
      }
    },
  }],
  build: { target: 'es2022', sourcemap: false },
});
