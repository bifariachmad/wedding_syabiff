import { chromium } from 'playwright';
import lighthouse from 'lighthouse';
import fs from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--remote-debugging-port=9227']});
try{const result=await lighthouse('http://127.0.0.1:4173/',{port:9227,onlyCategories:['performance','accessibility'],logLevel:'error',output:['json','html']});await fs.writeFile('artifacts/lighthouse.json',result.report[0]);await fs.writeFile('artifacts/lighthouse.html',result.report[1]);console.log(JSON.stringify({performance:result.lhr.categories.performance.score,accessibility:result.lhr.categories.accessibility.score,bytes:result.lhr.audits['total-byte-weight'].numericValue,lcp:result.lhr.audits['largest-contentful-paint'].numericValue}));}finally{await browser.close();}
