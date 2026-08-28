/**
 * Baut die Instagram-Blaetter als PNG.
 *
 * Braucht einen laufenden Vorschau-Server auf 4192, weil die Blaetter
 * Schriften, Logo, Symbole und Wappen ueber /fonts und /assets holen --
 * dieselben Dateien wie die Website. Das ist der ganze Sinn der Sache: ein
 * Beitrag kann nicht vom Design der Seite abweichen, weil er es benutzt.
 *
 * Gerendert wird in doppelter Groesse und im Browser auf 1080 auf 1350
 * heruntergerechnet, damit die Kanten der Schrift sauber bleiben.
 *
 *   npm run build
 *   npx vite preview --port 4192 --strictPort &
 *   node tools/insta/bauen.mjs
 *
 * Ergebnis: tools/insta/fertig/<name>.png, durchnummeriert in der
 * Reihenfolge, in der die Bilder ins Karussell gehoeren.
 */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import { TYPEN, FRAGEN, FRAKTIONEN, TEAMS, BRETT, BRETT_KANTE } from './inhalte.mjs';

const BREIT = 1080, HOCH = 1350;
const hier = path.dirname(fileURLToPath(import.meta.url));
const zielOrdner = path.join(hier, 'fertig');

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const marke = (rechts = '') => `<div class="marke">
  <img src="/logo.webp" alt=""><span>CozyWolf</span><i></i>${rechts ? `<em>${esc(rechts)}</em>` : ''}</div>`;
const kachel = (farbe, motiv) => `--farbe:${farbe};--motiv:url(${motiv})`;

// ── Die Blaetter ───────────────────────────────────────────────────────────
// Welche Gruppe gebaut wird. CozyQuiz ist der Abend bis 40 Personen, also
// Fragetypen und Brett; CrowdQuiz ab 40 mit den Fraktionen kommt spaeter.
// Wolf am 28.08.: "mach aber erstmal ein cozyquiz online content, da brauchen
// wir keine fraktionen, da zaehlt das grid".
const GRUPPE = process.argv[2] ?? 'cozyquiz';

const blaetter = [];
const dazu = (gruppe, name, klasse, innen) => {
  if (gruppe !== GRUPPE) return;
  blaetter.push({ name, html:
    `<section class="blatt ${klasse}" data-name="${name}"><div class="schein"></div>${innen}</section>` });
};

/**
 * Das Brett als HTML.
 *
 * Dieselbe Zeichnung wie auf der Website: gleichfarbige Nachbarn verlieren
 * die Rundung zueinander und bekommen einen Steg ueber den Rasterabstand, so
 * dass aus einzelnen Feldern eine Flaeche wird. Ohne das waeren es bunte
 * Punkte, und die Regel liesse sich am Bild nicht ablesen.
 *
 * @param hervor Kuerzel eines Teams, das hervorgehoben wird; die anderen
 *               treten zurueck. null zeigt alle gleich.
 */
const brett = (hervor = null) => {
  const K = BRETT_KANTE;
  const at = (r, c) => (r < 0 || c < 0 || r >= K || c >= K) ? '' : BRETT[r * K + c];
  const zellen = BRETT.map((id, i) => {
    const r = Math.floor(i / K), c = i % K;
    if (!id) return '<span class="leer"></span>';
    const team = TEAMS.find(x => x.id === id);
    const oben = at(r - 1, c) === id, rechts = at(r, c + 1) === id;
    const unten = at(r + 1, c) === id, links = at(r, c - 1) === id;
    const eck = (a, b) => (a || b) ? '0' : '16%';
    const still = hervor && hervor !== id;
    const stege = (rechts ? `<i style="right:-4%;top:16%;width:4.4%;height:68%;background:${team.farbe}"></i>` : '')
      + (unten ? `<i style="bottom:-4%;left:16%;height:4.4%;width:68%;background:${team.farbe}"></i>` : '');
    return `<span class="feld" style="--farbe:${team.farbe};--motiv:url(${team.motiv});`
      + `border-radius:${eck(oben, links)} ${eck(oben, rechts)} ${eck(unten, rechts)} ${eck(unten, links)};`
      + `opacity:${still ? .18 : 1};filter:saturate(${still ? .3 : 1})">${stege}</span>`;
  }).join('');
  return `<div class="brett" style="grid-template-columns:repeat(${K},1fr)">${zellen}</div>`;
};

// 1. Karussell "Die fuenf Fragetypen": ein Deckblatt und fuenf Typen.
dazu('cozyquiz', 'typen-0-titel', 'typ', `
  <div class="kicker">CozyQuiz<i></i></div>
  <h1>Fünf Fragetypen.<br>Keine Runde<br>wie die andere.</h1>
  <p class="gross">Ein Abend läuft über alle fünf. Wer nur Wissen mitbringt, gewinnt nicht.</p>
  ${marke('Wischen →')}`);

TYPEN.forEach((t, i) => dazu('cozyquiz', `typen-${i + 1}-${t.datei}`, 'typ', `
  <div class="zahl">${i + 1}</div>
  <div class="inhalt">
    <div class="kicker">Fragetyp ${i + 1} von 5<i></i></div>
    <span class="sym kachel" style="${kachel(t.farbe, t.sym)}"></span>
    <h2 style="color:${t.farbe}">${esc(t.name)}</h2>
    <div class="anspruch">${esc(t.anspruch)}</div>
    <div class="regel">${esc(t.regel)}</div>
  </div>
  ${marke(i === TYPEN.length - 1 ? 'cozywolf.de' : 'Wischen →')}`));

// 2. Fragekarten: je Frage ein Blatt mit der Frage und eins mit der Aufloesung.
FRAGEN.forEach(f => {
  const t = TYPEN.find(x => x.datei === f.typ);
  const kapsel = `<div class="kapsel"><span class="k kachel" style="${kachel(t.farbe, t.sym)}"></span>${esc(t.name)}</div>`;
  const liste = (zeigen) => f.optionen ? `<ol>${f.optionen.map((o, i) => {
    const r = zeigen && i === f.richtig;
    return `<li class="${r ? 'richtig' : ''}"><b style="${r ? '' : `background:${t.farbe}26;color:${t.farbe}`}">${i + 1}</b>${esc(o)}${r ? '<span class="haken">✓</span>' : ''}</li>`;
  }).join('')}</ol>` : `<div class="aufloesung" style="font-family:'League Spartan',sans-serif;font-size:132px;font-weight:900;line-height:1;color:${zeigen ? t.farbe : 'rgba(246,239,230,.34)'};margin-top:64px">${zeigen ? esc(f.loesung) : '?'}<span style="font-size:42px;font-weight:800;color:rgba(246,239,230,.6);margin-left:20px">${esc(f.einheit)}</span></div>`
    + (zeigen ? '' : `<div style="margin-top:26px;font-size:32px;font-weight:800;color:rgba(246,239,230,.72)">Schätzt mal. Knapp daneben zählt auch.</div>`);

  dazu('cozyquiz', `frage-${f.datei}-1`, 'frage', `
    ${kapsel}<h2>${esc(f.frage)}</h2>${liste(false)}
    <div class="frageHinweis">Antwort auf Bild 2 →</div>
    ${marke('Ein Abend, 40 bis 60 Fragen')}`);
  dazu('cozyquiz', `frage-${f.datei}-2`, 'frage', `
    ${kapsel}<h2>${esc(f.frage)}</h2>${liste(true)}
    <div class="aufloesung">${esc(f.aufloesung)}</div>
    ${marke('cozywolf.de')}`);
});

// 3. Das Brett. Drei Blaetter, die eine Erwartung aufbauen und sie brechen:
// erst der Spielstand, dann das Team mit den meisten Feldern, dann der
// Gewinner, der weniger Felder hat.
dazu('cozyquiz', 'brett-1', 'brett-blatt', `
  <div class="kicker">CozyQuiz<i></i></div>
  <h2 style="font-size:72px">Jede richtige Antwort<br>ist ein Zug auf dem Feld.</h2>
  ${brett()}
  <div class="unter">Vier Teams, ein Brett, 40 bis 60 Fragen. Setzen, klauen, stapeln oder Joker.</div>
  ${marke('Wischen →')}`);

dazu('cozyquiz', 'brett-2', 'brett-blatt', `
  <div class="kicker">CozyQuiz<i></i></div>
  <h2 style="font-size:72px">Grün hat die<br>meisten Felder.</h2>
  ${brett('g')}
  <div class="unter"><b style="color:#22C55E;font-size:52px;font-family:'League Spartan',sans-serif">7</b>
    <span>von 21 gesetzten Feldern. Mehr als jedes andere Team.</span></div>
  ${marke('Wischen →')}`);

dazu('cozyquiz', 'brett-3', 'brett-blatt', `
  <div class="kicker">CozyQuiz<i></i></div>
  <h2 style="font-size:72px">Gewonnen hat<br>trotzdem Gelb.</h2>
  ${brett('y')}
  <div class="unter"><b style="color:#FACC15;font-size:52px;font-family:'League Spartan',sans-serif">4</b>
    <span>Felder, aber am Stück. Es zählt die größte zusammenhängende Fläche, nicht die Menge.</span></div>
  ${marke('cozywolf.de')}`);

// 4. Die Fraktionen. Ein Blatt, alle acht, zum Selbsteinordnen.
dazu('crowdquiz', 'fraktionen', 'frak', `
  <div class="kicker">CrowdQuiz<i></i></div>
  <h1 style="font-size:88px">Welche Fraktion<br>seid ihr?</h1>
  <div class="feld">${FRAKTIONEN.map(f => `<div class="eins">
      <span class="kachel" style="${kachel(f.farbe, `/assets/crest-${f.datei}.webp`)}"></span>
      <b>${esc(f.name)}</b><i>${esc(f.spruch)}</i></div>`).join('')}</div>
  <p class="gross" style="font-size:30px;margin-top:44px">Ab 40 Personen spielt ihr nicht als Teams, sondern als Fraktionen gegeneinander. Bis zu fünf Teams pro Fraktion.</p>
  ${marke('cozywolf.de')}`);

// ── Rendern ────────────────────────────────────────────────────────────────
const huelle = fs.readFileSync(path.join(hier, 'blaetter.html'), 'utf8');
const seiteHtml = huelle.replace('<body>\n</body>', `<body>\n${blaetter.map(b => b.html).join('\n')}\n</body>`);

const browser = await chromium.launch();
const seite = await browser.newPage({ viewport: { width: BREIT, height: HOCH }, deviceScaleFactor: 2 });
const fehlt = [];
seite.on('response', r => { if (r.status() >= 400) fehlt.push(`${r.status()} ${r.url()}`); });
await seite.setContent(seiteHtml, { waitUntil: 'networkidle' });
await seite.evaluate(() => document.fonts.ready);
await seite.waitForTimeout(400);
if (fehlt.length) { console.error('Fehlende Dateien:', fehlt); process.exit(1); }

// Was ueber den Rand eines Blattes laeuft, ist im Feed abgeschnitten.
const zuHoch = await seite.evaluate(() => [...document.querySelectorAll('.blatt')]
  .filter(b => b.scrollHeight > b.clientHeight + 1)
  .map(b => `${b.dataset.name}: ${b.scrollHeight} statt ${b.clientHeight}`));
if (zuHoch.length) { console.error('Inhalt laeuft aus dem Blatt:'); zuHoch.forEach(z => console.error('  ' + z)); }

fs.rmSync(zielOrdner, { recursive: true, force: true });
fs.mkdirSync(zielOrdner, { recursive: true });
const rechner = await browser.newPage();
for (const [i, b] of blaetter.entries()) {
  const gross = await seite.locator(`[data-name="${b.name}"]`).screenshot();
  const klein = await rechner.evaluate(async ({ daten, BREIT, HOCH }) => {
    const bild = new Image();
    bild.src = 'data:image/png;base64,' + daten;
    await bild.decode();
    const c = document.createElement('canvas');
    c.width = BREIT; c.height = HOCH;
    const g = c.getContext('2d');
    g.imageSmoothingQuality = 'high';
    g.drawImage(bild, 0, 0, bild.naturalWidth, bild.naturalHeight, 0, 0, BREIT, HOCH);
    return c.toDataURL('image/png').split(',')[1];
  }, { daten: gross.toString('base64'), BREIT, HOCH });
  const datei = path.join(zielOrdner, `${String(i + 1).padStart(2, '0')}-${b.name}.png`);
  fs.writeFileSync(datei, Buffer.from(klein, 'base64'));
}
await browser.close();
console.log(`${blaetter.length} Blaetter geschrieben nach ${zielOrdner} (${BREIT}x${HOCH})`);
if (zuHoch.length) process.exit(1);
