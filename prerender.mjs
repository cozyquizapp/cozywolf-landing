// Build-Prerender: erzeugt fuer jede Route statisches HTML mit Inhalt, damit
// Crawler, Link-Previews und AI-Tools die Seite ohne JavaScript lesen koennen.
// Laeuft nach `vite build` (Client) + `vite build --ssr` (Server-Bundle).
import fs from 'node:fs';
import path from 'node:path';

const ROUTES = ['/', '/firmen', '/locations', '/feiern', '/ueber', '/kontakt', '/impressum', '/datenschutz'];

const template = fs.readFileSync('dist/index.html', 'utf8');
const { render } = await import('./dist-server/entry-server.js');

if (!template.includes('<div id="root"></div>')) {
  throw new Error('prerender: <div id="root"></div> nicht im Template gefunden');
}

for (const route of ROUTES) {
  const body = render(route);
  const html = template.replace('<div id="root"></div>', `<div id="root">${body}</div>`);
  const dir = route === '/' ? 'dist' : path.join('dist', route);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  console.log('prerendered', route, '->', path.join(dir, 'index.html'));
}
console.log('prerender done:', ROUTES.length, 'Routen');
