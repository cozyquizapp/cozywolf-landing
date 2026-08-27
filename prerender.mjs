// Build-Prerender: erzeugt fuer jede Route statisches HTML mit Inhalt (damit
// Crawler/AI/Link-Previews ohne JavaScript lesen koennen) UND setzt pro Seite
// eigene Meta-Titel/Beschreibung + Open-Graph/Twitter-Tags + Canonical +
// JSON-LD (LocalBusiness/FAQPage). Schreibt am Ende sitemap.xml.
// Laeuft nach `vite build` (Client) + `vite build --ssr` (Server).
//
// Die Startseite hat zwei eigenstaendige Fassungen: '/d' (Desktop) und '/m'
// (Mobil). Beide werden per vercel.json unter '/' ausgespielt (User-Agent-
// Weiche), deshalb zeigen Canonical und og:url beider Fassungen auf '/'.
// dist/index.html wird nach dem Prerender geloescht, damit die Rewrites fuer
// '/' greifen (Vercel bedient sonst die Datei aus dem Dateisystem zuerst).
import fs from 'node:fs';
import path from 'node:path';

const BASE = 'https://cozywolf.de';
const OG_IMG = `${BASE}/assets/og-cover.png`;

const HOME = {
  t: 'CozyWolf, Live-Quiz-Events in Hamburg',
  d: 'Moderierte Live-Quiz-Events in Hamburg und Umland. Für Firmen, private Feiern und Locations. Ich bringe Beamer, Sound und Moderation mit, ab 350 € für den ganzen Abend.',
};

// Route -> Titel + Beschreibung (Deutsch = Prerender-Default) + Canonical.
const META = {
  '/d':           { ...HOME, canonical: '/' },
  '/m':           { ...HOME, canonical: '/' },
  '/mockups':     { t: 'Mockups, CozyWolf', d: 'Interner Entwurfsvergleich.' },
  '/impressum':   { t: 'Impressum, CozyWolf', d: 'Impressum und Anbieterkennzeichnung von CozyWolf.' },
  '/datenschutz': { t: 'Datenschutz, CozyWolf', d: 'Datenschutzerklärung von cozywolf.de.' },
  '/404':         { t: 'Seite nicht gefunden, CozyWolf', d: 'Diese Seite gibt es nicht. Zurück zur Startseite von CozyWolf.' },
};
const ROUTES = Object.keys(META);
const NOINDEX = new Set(['/mockups', '/impressum', '/datenschutz', '/404']);

// LocalBusiness/ProfessionalService — Local-SEO-Grundlage, auf jeder Route.
const ORG_LD = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'CozyWolf',
  description: HOME.d,
  url: BASE,
  image: OG_IMG,
  email: 'hallo@cozywolf.de',
  priceRange: 'ab 350 €',
  areaServed: { '@type': 'City', name: 'Hamburg' },
  address: { '@type': 'PostalAddress', addressLocality: 'Hamburg', addressCountry: 'DE' },
  founder: { '@type': 'Person', name: 'Johannes' },
  sameAs: ['https://instagram.com/cozywolf.events'],
};

// FAQPage — Quelle: src/pages/onepage/texts.ts (DE, FAQ des One-Pagers).
// Bei Aenderung dort hier mitpflegen (Rich-Result "Haeufige Fragen").
const FAQ = [
  ['Brauche ich eigene Technik?', 'Nein. Ich bringe Beamer und Sound selbst mit. Ihr braucht nur eine freie Wand oder einen Bildschirm, Strom und WLAN für deine Gäste.'],
  ['Müssen meine Gäste etwas installieren?', 'Nichts. Alle scannen einen QR-Code und spielen direkt im Browser am Handy. Keine App, kein Login.'],
  ['Für wie viele Personen funktioniert das?', 'Von der kleinen Runde bis zu 160 Personen. Kleine Gruppen erobern das Spielfeld, große Gruppen treten als Fraktionen an. Das Format passt sich an.'],
  ['Wie lange dauert ein Quiz-Event?', 'Meist 90 bis 120 Minuten mit mehreren Runden. Die genaue Länge stimme ich vorher mit dir auf deinen Anlass ab.'],
  ['Wie weit fährst du?', 'Ich bin in Hamburg und im Umland unterwegs. Für weiter entfernte Anfragen melde dich einfach kurz, meist lässt sich etwas einrichten.'],
  ['Was kostet das?', 'Es geht bei 350 € für den ganzen Abend los, mit Technik und Moderation. Der genaue Preis richtet sich nach Personenzahl und Anlass. Schreib mir kurz, worum es geht, dann bekommst du von mir ein faires Angebot.'],
];
const FAQ_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map(([q, a]) => ({
    '@type': 'Question', name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
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
  const url = BASE + (m.canonical ?? route);
  const ld = [ORG_LD];
  if (route === '/d' || route === '/m') ld.push(FAQ_LD);

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

  // /404 wird als flache Datei dist/404.html geschrieben. Vercel liefert eine
  // 404.html im Output-Root automatisch mit Status 404 aus, wenn kein Pfad passt.
  let out;
  if (route === '/404') {
    out = path.join('dist', '404.html');
  } else {
    const dir = path.join('dist', route);
    fs.mkdirSync(dir, { recursive: true });
    out = path.join(dir, 'index.html');
  }
  fs.writeFileSync(out, html);
  console.log('prerendered', route, '->', out);

  // /mockups zusaetzlich als flache Datei. Vercel liefert '/mockups' dann
  // direkt aus 'mockups.html' aus, ganz ohne den Rewrite in vercel.json.
  // Grund: die Route kam beim ersten Versuch als 404 zurueck, obwohl
  // dist/mockups/index.html im Build lag. Zwei unabhaengige Wege sind hier
  // billiger als raten, welcher der beiden greift. Faellt mit der Route weg.
  if (route === '/mockups') {
    fs.writeFileSync(path.join('dist', 'mockups.html'), html);
    console.log('prerendered', route, '-> dist/mockups.html (Fallback)');
  }
}

// Root-Datei entfernen: '/' wird per Rewrite aus /d bzw. /m bedient.
fs.rmSync('dist/index.html');
console.log('dist/index.html entfernt ("/" laeuft ueber die UA-Rewrites)');

// stand.txt: welcher Commit liegt gerade auf der Domain?
//
// 2026-08-27. Wolf sah auf cozywolf.de tagelang einen alten Stand, waehrend
// GitHub laengst den neuen trug. Von aussen war nicht zu unterscheiden, ob
// der Build fehlschlug, ob die Domain an einem anderen Zweig haengt oder ob
// nur der Browser cachte: die Seite sieht in allen drei Faellen gleich aus.
// Diese Datei beantwortet das ohne Werkzeuge und ohne Zugang: einmal
// cozywolf.de/stand.txt aufrufen. Steht dort ein alter Commit, liegt es an
// der Auslieferung. Steht dort der erwartete, liegt es am Browser.
const sha = process.env.VERCEL_GIT_COMMIT_SHA || 'lokal';
const zweig = process.env.VERCEL_GIT_COMMIT_REF || '-';
fs.writeFileSync('dist/stand.txt',
  `commit: ${sha}\nzweig:  ${zweig}\ngebaut: ${new Date().toISOString()}\n`);
console.log('stand.txt geschrieben:', sha, zweig);

// sitemap.xml: die Site ist ein One-Pager, indexierbar ist nur '/'.
fs.writeFileSync('dist/sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${BASE}/</loc></url></urlset>`);
console.log('sitemap.xml geschrieben: 1 URL');
console.log('prerender done:', ROUTES.length, 'Routen (Meta + OG + Canonical + JSON-LD)');
