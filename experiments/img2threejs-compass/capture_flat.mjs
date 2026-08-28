import { chromium } from 'playwright';
const browser = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage({ viewport:{width:1024,height:1024} });
await page.goto('http://localhost:5199/?az=0&el=0&size=1024&flat=1',{waitUntil:'networkidle'});
await page.waitForFunction('window.__ready === true');
await page.locator('canvas').screenshot({ path:'renders/blockout_flat_az0.png' });
console.log('renders/blockout_flat_az0.png');
await browser.close();
