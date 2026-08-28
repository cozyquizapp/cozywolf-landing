/**
 * Baut public/assets/og-cover.png aus tools/og-cover.html.
 *
 * Braucht einen laufenden Vorschau-Server auf 4192, weil die Seite Schriften,
 * Logo und Objekte ueber /fonts und /assets holt -- dieselben Dateien wie die
 * Website, damit das Vorschaubild nicht wieder auseinanderlaeuft.
 *
 * Gerendert wird in doppelter Groesse und danach auf 1200 auf 630 gerechnet:
 * so bleiben die Kanten der Schrift sauber. Kein Farbindex, der dunkle
 * Verlauf bekaeme sonst Streifen.
 */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const hier = path.dirname(fileURLToPath(import.meta.url));
const quelle = path.join(hier, 'og-cover.html');
const ziel = path.join(hier, '..', 'public', 'assets', 'og-cover.png');

const browser = await chromium.launch();
const seite = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 2 });
const fehlt = [];
seite.on('response', r => { if (r.status() >= 400) fehlt.push(`${r.status()} ${r.url()}`); });
await seite.setContent(fs.readFileSync(quelle, 'utf8'), { waitUntil: 'networkidle' });
await seite.evaluate(() => document.fonts.ready);
await seite.waitForTimeout(300);
if (fehlt.length) { console.error('Fehlende Dateien:', fehlt); process.exit(1); }
await seite.screenshot({ path: ziel, clip: { x: 0, y: 0, width: 1200, height: 630 } });
await browser.close();
console.log(`geschrieben: ${ziel} (2400x1260, danach von Hand auf 1200x630 rechnen)`);
