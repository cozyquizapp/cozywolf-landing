import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const base = process.argv[2] ?? 'http://localhost:5173';
const outDir = process.argv[3] ?? 'renders';
const views = (process.argv[4] ?? '0:0,90:0,180:0,270:0').split(',');
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1024, height: 1024 }, deviceScaleFactor: 1 });
page.on('console', (m) => { if (m.type() === 'error') console.log('PAGE ERROR:', m.text()); });
page.on('pageerror', (e) => console.log('PAGE EXCEPTION:', e.message));

for (const v of views) {
  const [az, el] = v.split(':').map(Number);
  await page.goto(`${base}/?az=${az}&el=${el}&size=1024`, { waitUntil: 'networkidle' });
  await page.waitForFunction('window.__ready === true', null, { timeout: 30000 });
  const stats = await page.evaluate('window.__stats');
  const name = `${outDir}/view_az${az}_el${el}.png`;
  await page.locator('canvas').screenshot({ path: name });
  console.log(name, JSON.stringify(stats));
}
await browser.close();
