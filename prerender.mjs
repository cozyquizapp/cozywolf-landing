// Build-Prerender: erzeugt fuer jede Route statisches HTML mit Inhalt (damit
// Crawler/AI/Link-Previews ohne JavaScript lesen koennen) UND setzt pro Seite
// eigene Meta-Titel/Beschreibung + Open-Graph/Twitter-Tags (fuer Link-Vorschauen
// und SEO). Laeuft nach `vite build` (Client) + `vite build --ssr` (Server).
import fs from 'node:fs';
import path from 'node:path';

const BASE = 'https://cozywolf.de';
const OG_IMG = `${BASE}/assets/og-cover.png`;

// Route -> Titel + Beschreibung (Deutsch = Prerender-Default).
const META = {
  '/':            { t: 'CozyWolf, Live-Quiz-Events in Hamburg', d: 'Moderierte Live-Quiz-Events für Firmen, private Feiern und Locations. Alle spielen am eigenen Handy, ich bringe alles mit und moderiere selbst.' },
  '/firmen':      { t: 'CozyWolf für Firmen und Teams', d: 'Ein Team-Event, bei dem eure Abteilungen als Fraktionen gegeneinander antreten. Faire Wertung, bis etwa 100 Personen, in Hamburg und Umland.' },
  '/feiern':      { t: 'CozyWolf für private Feiern', d: 'Ein gemütlicher Quiz-Abend für Geburtstag und Freundeskreis. Kleine Teams erobern das Spielfeld, ich moderiere den ganzen Abend.' },
  '/locations':   { t: 'CozyWolf für Locations', d: 'Ein wiederkehrender Quiz-Abend für Café, Bar oder Pub, der Gäste an ruhigen Tagen bringt und zum Wiederkommen bewegt.' },
  '/ueber':       { t: 'Über Johannes, CozyWolf', d: 'Ich bin Johannes, Pädagoge und Moderator. Ich entwickle und moderiere die CozyWolf-Quiz-Events selbst, mit einem guten Blick für die Gruppe.' },
  '/kontakt':     { t: 'Kontakt, CozyWolf', d: 'Frag dein Quiz-Event an. Schreib mir kurz zu Anlass, Personenzahl und Wunsch-Zeitraum, ich melde mich mit einem Vorschlag.' },
  '/impressum':   { t: 'Impressum, CozyWolf', d: 'Impressum und Anbieterkennzeichnung von CozyWolf.' },
  '/datenschutz': { t: 'Datenschutz, CozyWolf', d: 'Datenschutzerklärung von cozywolf.de.' },
};
const ROUTES = Object.keys(META);

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const template = fs.readFileSync('dist/index.html', 'utf8');
const { render } = await import('./dist-server/entry-server.js');

if (!template.includes('<div id="root"></div>')) {
  throw new Error('prerender: <div id="root"></div> nicht im Template gefunden');
}

for (const route of ROUTES) {
  const m = META[route];
  const url = BASE + route;
  const og = [
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="CozyWolf" />`,
    `<meta property="og:title" content="${esc(m.t)}" />`,
    `<meta property="og:description" content="${esc(m.d)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:image" content="${esc(OG_IMG)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(m.t)}" />`,
    `<meta name="twitter:description" content="${esc(m.d)}" />`,
    `<meta name="twitter:image" content="${esc(OG_IMG)}" />`,
  ].join('');

  let html = template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(m.t)}</title>`)
    .replace(/<meta name="description" content="[\s\S]*?"\s*\/?>/, `<meta name="description" content="${esc(m.d)}" />`)
    .replace('</head>', `${og}</head>`)
    .replace('<div id="root"></div>', `<div id="root">${render(route)}</div>`);

  const dir = route === '/' ? 'dist' : path.join('dist', route);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  console.log('prerendered', route, '->', path.join(dir, 'index.html'));
}
console.log('prerender done:', ROUTES.length, 'Routen (mit Meta + OG)');
