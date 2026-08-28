/**
 * Baut public/assets/og-cover.png aus tools/og-cover.html.
 *
 * Braucht einen laufenden Vorschau-Server auf 4192, weil die Seite Schriften,
 * Logo und Objekte ueber /fonts und /assets holt -- dieselben Dateien wie die
 * Website, damit das Vorschaubild nicht wieder auseinanderlaeuft.
 *
 * Gerendert wird in doppelter Groesse und im Browser selbst auf 1200 auf 630
 * heruntergerechnet: so bleiben die Kanten der Schrift sauber, ohne dass ein
 * zweites Werkzeug noetig waere.
 *
 * Dazu wird gemessen und, wenn noetig, gemeckert. Messenger zeigen die
 * Vorschau quadratisch und schneiden mittig zu, also x 285 bis 915. Was da
 * herausragt, sieht in WhatsApp niemand. Das Skript prueft jedes Element in
 * .mitte gegen dieses Fenster und bricht ab, wenn eines heraussteht.
 *
 * Zum Ansehen legt es beide Zuschnitte im Systemtemp ab: das ganze Bild und
 * das Quadrat.
 */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';

const BREIT = 1200, HOCH = 630;
const QUADRAT = { x: (BREIT - HOCH) / 2, breite: HOCH };   // x 285 bis 915

const hier = path.dirname(fileURLToPath(import.meta.url));
const quelle = path.join(hier, 'og-cover.html');
const ziel = path.join(hier, '..', 'public', 'assets', 'og-cover.png');
const pruefOrdner = fs.mkdtempSync(path.join(os.tmpdir(), 'og-cover-'));

const browser = await chromium.launch();
const seite = await browser.newPage({ viewport: { width: BREIT, height: HOCH }, deviceScaleFactor: 2 });
const fehlt = [];
seite.on('response', r => { if (r.status() >= 400) fehlt.push(`${r.status()} ${r.url()}`); });
await seite.setContent(fs.readFileSync(quelle, 'utf8'), { waitUntil: 'networkidle' });
await seite.evaluate(() => document.fonts.ready);
await seite.waitForTimeout(300);
if (fehlt.length) { console.error('Fehlende Dateien:', fehlt); process.exit(1); }

// messen: steht alles Wichtige im quadratischen Ausschnitt?
const mass = await seite.evaluate(({ x, breite }) => {
  const raus = [], drin = [];
  for (const el of document.querySelectorAll('.mitte > *')) {
    const r = el.getBoundingClientRect();
    const name = el.className || el.tagName.toLowerCase();
    const zeile = { name, links: Math.round(r.left), rechts: Math.round(r.right), oben: Math.round(r.top), unten: Math.round(r.bottom) };
    (r.left < x || r.right > x + breite ? raus : drin).push(zeile);
  }
  return { raus, drin };
}, QUADRAT);
console.table(mass.drin);
if (mass.raus.length) {
  console.error(`\nRagt aus dem quadratischen Ausschnitt (x ${QUADRAT.x} bis ${QUADRAT.x + QUADRAT.breite}):`);
  console.table(mass.raus);
  process.exit(1);
}

// in doppelter Groesse aufnehmen und im Browser sauber herunterrechnen
const gross = await seite.screenshot({ clip: { x: 0, y: 0, width: BREIT, height: HOCH } });
const rechner = await browser.newPage();
const [ganz, quadrat] = await rechner.evaluate(async ({ daten, BREIT, HOCH, QUADRAT }) => {
  const bild = new Image();
  bild.src = 'data:image/png;base64,' + daten;
  await bild.decode();
  const male = (bx, by, bw, bh, zw, zh) => {
    const c = document.createElement('canvas');
    c.width = zw; c.height = zh;
    const g = c.getContext('2d');
    g.imageSmoothingQuality = 'high';
    g.drawImage(bild, bx, by, bw, bh, 0, 0, zw, zh);
    return c.toDataURL('image/png').split(',')[1];
  };
  const f = bild.naturalWidth / BREIT;              // Faktor der Aufnahme
  return [
    male(0, 0, bild.naturalWidth, bild.naturalHeight, BREIT, HOCH),
    male(QUADRAT.x * f, 0, QUADRAT.breite * f, bild.naturalHeight, QUADRAT.breite, HOCH),
  ];
}, { daten: gross.toString('base64'), BREIT, HOCH, QUADRAT });
await browser.close();

fs.writeFileSync(ziel, Buffer.from(ganz, 'base64'));
const pGanz = path.join(pruefOrdner, 'ganz.png');
const pQuadrat = path.join(pruefOrdner, 'quadrat.png');
fs.writeFileSync(pGanz, Buffer.from(ganz, 'base64'));
fs.writeFileSync(pQuadrat, Buffer.from(quadrat, 'base64'));
console.log(`\ngeschrieben: ${ziel} (${BREIT}x${HOCH})`);
console.log(`zum Ansehen: ${pGanz}`);
console.log(`Quadrat wie im Messenger: ${pQuadrat}`);
