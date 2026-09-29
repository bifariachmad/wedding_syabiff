import {chromium} from 'playwright';
import fs from 'node:fs/promises';
await fs.mkdir('output/pdf',{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{const page=await browser.newPage({viewport:{width:1440,height:1100}});await page.goto((process.env.PRINT_BASE_URL||'http://127.0.0.1:5173')+'/cetak');await page.waitForFunction(()=>document.querySelector('#app')?.dataset.ready==='true');await page.evaluate(()=>document.fonts.ready);await page.locator('#a5-digital').evaluate(img=>img.decode());await page.pdf({path:'output/pdf/undangan-bifari-syafira-A5.pdf',preferCSSPageSize:true,printBackground:true});console.log('PDF A5 generated.');}finally{await browser.close();}
