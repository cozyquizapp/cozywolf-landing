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
    // Der Steg ist genau so breit wie die Luecke und so lang wie die Kante
    // ohne ihre beiden Rundungen. Gezeichnet wird nur nach rechts und unten,
    // sonst laege jede Verbindung doppelt uebereinander.
    const stege = (rechts ? `<i style="right:calc(var(--luecke) * -1);top:16%;width:var(--luecke);height:68%;background:${team.farbe}"></i>` : '')
      + (unten ? `<i style="bottom:calc(var(--luecke) * -1);left:16%;height:var(--luecke);width:68%;background:${team.farbe}"></i>` : '');
    return `<span class="feld" style="--farbe:${team.farbe};--motiv:url(${team.motiv});`
      + `border-radius:${eck(oben, links)} ${eck(oben, rechts)} ${eck(unten, rechts)} ${eck(unten, links)};`
      + `opacity:${still ? .18 : 1};filter:saturate(${still ? .3 : 1})">${stege}</span>`;
  }).join('');
  return `<div class="brett" style="grid-template-columns:repeat(${K},1fr)">${zellen}</div>`;
};

/* 1. Karussell "Wissen ist nicht alles", drei Blaetter.

   Der erste Anlauf hatte sechs: ein Deckblatt und je eins pro Fragetyp. Wolf
   dazu: "keiner swiped 15 seiten ohne hook". Er hat in beidem recht. Ein
   Deckblatt, das "Fuenf Fragetypen" ankuendigt, beschreibt nur, was kommt,
   und beschreiben ist kein Grund zu wischen. Und sechs Bilder fuer eine
   Aufzaehlung sind fuenf zu viel.

   Also: erst eine Behauptung, die man anzweifelt, dann der Beleg, dann der
   Abschluss. Die fuenf Einzelblaetter bleiben, aber nicht als Karussell,
   sondern als fuenf einzelne Beitraege ueber fuenf Wochen -- dort tragen sie
   allein, weil sie nicht gegen einen Wisch antreten muessen. */
const symReihe = () => `<div class="reihe">${TYPEN.map(t =>
  `<span class="kachel" style="${kachel(t.farbe, t.sym)}"></span>`).join('')}</div>`;

dazu('cozyquiz', 'wissen-1', 'typ', `
  <div class="inhalt">
    <div class="kicker">CozyQuiz<i></i></div>
    <h1>Wissen ist<br>nicht alles.</h1>
    <p class="gross">Bei drei von fünf Fragetypen bringt es euch fast nichts.</p>
    ${symReihe()}
  </div>
  ${marke('Welche drei? →')}`);

dazu('cozyquiz', 'wissen-2', 'typ', `
  <div class="inhalt">
    <div class="kicker">Fünf Fragetypen<i></i></div>
    <div class="liste">${TYPEN.map(t => `<div class="zeile">
      <span class="kachel" style="${kachel(t.farbe, t.sym)}"></span>
      <div><b style="color:${t.farbe}">${esc(t.name)}</b><i>${esc(t.anspruch)}</i></div>
    </div>`).join('')}</div>
  </div>
  ${marke('Wischen →')}`);

dazu('cozyquiz', 'wissen-3', 'typ', `
  <div class="inhalt">
    <div class="kicker">Ein Abend<i></i></div>
    <h1 style="font-size:88px">Schätzen,<br>erkennen,<br>setzen, raten.</h1>
    <p class="gross">40 bis 60 Fragen über alle fünf Typen. Wer nur Wissen mitbringt, gewinnt nicht.</p>
  </div>
  ${marke('cozywolf.de')}`);

/* Die fuenf Einzelblaetter. Kein Karussell, sondern je ein Beitrag. */
TYPEN.forEach((t, i) => dazu('cozyquiz', `einzel-${i + 1}-${t.datei}`, 'typ', `
  <div class="zahl">${i + 1}</div>
  <div class="inhalt">
    <div class="kicker">Fragetyp ${i + 1} von 5<i></i></div>
    <span class="sym kachel" style="${kachel(t.farbe, t.sym)}"></span>
    <h2 style="color:${t.farbe}">${esc(t.name)}</h2>
    <div class="anspruch">${esc(t.anspruch)}</div>
    <div class="regel">${esc(t.regel)}</div>
  </div>
  ${marke('cozywolf.de')}`));

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

/* 3. Karussell "Welches Team gewinnt?", drei Blaetter.

   Vorher hiess das erste Blatt "Jede richtige Antwort ist ein Zug auf dem
   Feld". Wahr, aber es beschreibt. Jetzt steht dort eine Frage, die man im
   Kopf beantwortet, bevor man wischt, und die Antwort ist die
   ueberraschende: nicht das Team mit den meisten Feldern.

   Der Spielstand ist der von der Website und beweist die Regel von selbst:
   Gruen hat 7 Felder und davon nur 3 am Stueck, Gelb hat 4 und alle vier
   zusammenhaengend. */
dazu('cozyquiz', 'brett-1', 'brett-blatt', `
  <div class="kicker">CozyQuiz<i></i></div>
  <h2>Welches Team gewinnt?</h2>
  ${brett()}
  <div class="unter">Vier Teams, 36 Felder, Endstand.</div>
  ${marke('Auflösung →')}`);

dazu('cozyquiz', 'brett-2', 'brett-blatt', `
  <div class="kicker">Die meisten Felder<i></i></div>
  <h2>Grün führt. Sieben.</h2>
  ${brett('g')}
  <div class="unter">Mehr als jedes andere Team. Und trotzdem nicht der Sieger.</div>
  ${marke('Wischen →')}`);

dazu('cozyquiz', 'brett-3', 'brett-blatt', `
  <div class="kicker">Der Sieger<i></i></div>
  <h2>Gelb. Vier am Stück.</h2>
  ${brett('y')}
  <div class="unter">Es zählt die größte zusammenhängende Fläche, nicht die Menge.</div>
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
