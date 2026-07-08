// Build-Prerender: erzeugt fuer jede Route statisches HTML mit Inhalt (damit
// Crawler/AI/Link-Previews ohne JavaScript lesen koennen) UND setzt pro Seite
// eigene Meta-Titel/Beschreibung + Open-Graph/Twitter-Tags + Canonical +
// JSON-LD (LocalBusiness/FAQPage/Person). Schreibt am Ende sitemap.xml.
// Laeuft nach `vite build` (Client) + `vite build --ssr` (Server).
import fs from 'node:fs';
import path from 'node:path';

const BASE = 'https://cozywolf.de';
const OG_IMG = `${BASE}/assets/og-cover.png`;

// Route -> Titel + Beschreibung (Deutsch = Prerender-Default). Titel keyword-nah
// (Hamburg + Suchbegriffe) fuer die Haupt-Zielgruppen-Seiten.
const META = {
  '/':            { t: 'CozyWolf, Live-Quiz-Events in Hamburg', d: 'Moderierte Live-Quiz-Events für Firmen, private Feiern und Locations. Alle spielen am Handy, ich bringe alles mit und moderiere selbst.' },
  '/firmen':      { t: 'Teamevent-Quiz für Firmen in Hamburg | CozyWolf', d: 'Ein Team-Event, bei dem eure Abteilungen als Fraktionen gegeneinander antreten. Faire Wertung, bis etwa 100 Personen, in Hamburg und Umland.' },
  '/feiern':      { t: 'Quiz für Geburtstag & private Feiern | CozyWolf Hamburg', d: 'Ein gemütlicher Quiz-Abend für Geburtstag und Freundeskreis. Kleine Teams erobern das Spielfeld, ich moderiere den ganzen Abend.' },
  '/locations':   { t: 'Kneipenquiz für Bars & Pubs in Hamburg | CozyWolf', d: 'Ein wiederkehrender Quiz-Abend für Café, Bar oder Pub, der Gäste an ruhigen Tagen bringt und zum Wiederkommen bewegt.' },
  '/ueber':       { t: 'Über Johannes, CozyWolf', d: 'Ich bin Johannes, Pädagoge und Moderator. Ich entwickle und moderiere die CozyWolf-Quiz-Events selbst, mit einem guten Blick für die Gruppe.' },
  '/kontakt':     { t: 'Kontakt, CozyWolf', d: 'Frag dein Quiz-Event an. Schreib mir kurz zu Anlass, Personenzahl und Wunsch-Zeitraum, ich melde mich mit einem Vorschlag.' },
  '/impressum':   { t: 'Impressum, CozyWolf', d: 'Impressum und Anbieterkennzeichnung von CozyWolf.' },
  '/datenschutz': { t: 'Datenschutz, CozyWolf', d: 'Datenschutzerklärung von cozywolf.de.' },
};
const ROUTES = Object.keys(META);
const NOINDEX = new Set(['/impressum', '/datenschutz']);

// LocalBusiness/ProfessionalService — Local-SEO-Grundlage, auf jeder Route.
const ORG_LD = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'CozyWolf',
  description: META['/'].d,
  url: BASE,
  image: OG_IMG,
  email: 'hallo@cozywolf.de',
  areaServed: { '@type': 'City', name: 'Hamburg' },
  address: { '@type': 'PostalAddress', addressLocality: 'Hamburg', addressCountry: 'DE' },
  founder: { '@type': 'Person', name: 'Johannes' },
  sameAs: ['https://instagram.com/cozywolf.events'],
};

// FAQPage — Quelle: src/components/FaqSection.tsx (DE, nur Home). Bei Aenderung
// dort hier mitpflegen (Rich-Result "Haeufige Fragen").
const FAQ = [
  ['Brauche ich eigene Technik?', 'Nein. Ich bringe Beamer und Sound selbst mit. Du brauchst nur eine freie Wand oder einen Bildschirm, Strom und WLAN für deine Gäste.'],
  ['Müssen meine Gäste etwas installieren?', 'Nichts. Alle scannen einen QR-Code und spielen direkt im Browser am Handy. Keine App, kein Login.'],
  ['Für wie viele Personen funktioniert das?', 'Von der kleinen Runde bis zu 100 Personen. Kleine Gruppen erobern das Spielfeld, große Gruppen treten als Fraktionen an. Das Format passt sich an.'],
  ['Wie lange dauert ein Quiz-Event?', 'Meist 90 bis 120 Minuten mit mehreren Runden. Die genaue Länge stimme ich vorher mit dir auf deinen Anlass ab.'],
  ['Wie weit fährst du?', 'Ich bin in Hamburg und im Umland unterwegs. Für weiter entfernte Anfragen melde dich einfach kurz, meist lässt sich etwas einrichten.'],
  ['Was kostet das?', 'Der Preis richtet sich nach Personenzahl und Anlass. Schreib mir kurz, worum es geht, dann bekommst du von mir ein faires Angebot.'],
];
const FAQ_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map(([q, a]) => ({
    '@type': 'Question', name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
};
const PERSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Johannes',
  jobTitle: 'Moderator und Quizmaster',
  worksFor: { '@type': 'Organization', name: 'CozyWolf' },
  url: `${BASE}/ueber`,
};

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
// JSON-LD sicher in <script> einbetten: nur "<" neutralisieren (kein HTML-esc).
function ldScript(obj) {
  return `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;
}

const template = fs.readFileSync('dist/index.html', 'utf8');
const { render } = await import('./dist-server/entry-server.js');

if (!template.includes('<div id="root"></div>')) {
  throw new Error('prerender: <div id="root"></div> nicht im Template gefunden');
}

for (const route of ROUTES) {
  const m = META[route];
  const url = BASE + route;
  const ld = [ORG_LD];
  if (route === '/') ld.push(FAQ_LD);
  if (route === '/ueber') ld.push(PERSON_LD);

  const head = [
    `<link rel="canonical" href="${esc(url)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="CozyWolf" />`,
    `<meta property="og:locale" content="de_DE" />`,
    `<meta property="og:title" content="${esc(m.t)}" />`,
    `<meta property="og:description" content="${esc(m.d)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:image" content="${esc(OG_IMG)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="CozyWolf, Live-Quiz-Events in Hamburg" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(m.t)}" />`,
    `<meta name="twitter:description" content="${esc(m.d)}" />`,
    `<meta name="twitter:image" content="${esc(OG_IMG)}" />`,
    ...ld.map(ldScript),
  ];
  if (NOINDEX.has(route)) head.push(`<meta name="robots" content="noindex, follow" />`);

  let html = template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(m.t)}</title>`)
    .replace(/<meta name="description" content="[\s\S]*?"\s*\/?>/, `<meta name="description" content="${esc(m.d)}" />`)
    .replace('</head>', `${head.join('')}</head>`)
    .replace('<div id="root"></div>', `<div id="root">${render(route)}</div>`);

  const dir = route === '/' ? 'dist' : path.join('dist', route);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  console.log('prerendered', route, '->', path.join(dir, 'index.html'));
}

// sitemap.xml aus den indexierbaren Routen (Legal ausgenommen).
const sm = ROUTES.filter(r => !NOINDEX.has(r))
  .map(r => `<url><loc>${BASE}${r === '/' ? '/' : r}</loc></url>`).join('');
fs.writeFileSync('dist/sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sm}</urlset>`);
console.log('sitemap.xml geschrieben:', ROUTES.length - NOINDEX.size, 'URLs');
console.log('prerender done:', ROUTES.length, 'Routen (Meta + OG + Canonical + JSON-LD)');
