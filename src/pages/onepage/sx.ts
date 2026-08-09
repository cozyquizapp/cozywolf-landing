import type { CSSProperties } from 'react';

// Wandelt die CSS-Strings des Rework-Entwurfs (dc-Format) in React-Style-Objekte.
// Die Stil-Generatoren aus dem Entwurf bleiben dadurch 1:1 erhalten, statt jede
// der ~300 Deklarationen von Hand in Objekt-Syntax zu uebersetzen.
// Cache, weil identische Strings pro Render vielfach vorkommen (49 Zellen etc.).
const cache = new Map<string, CSSProperties>();

export function sx(css: string): CSSProperties {
  const hit = cache.get(css);
  if (hit) return hit;
  const out: Record<string, string> = {};
  for (const decl of css.split(';')) {
    const i = decl.indexOf(':');
    if (i < 0) continue;
    const prop = decl.slice(0, i).trim();
    const val = decl.slice(i + 1).trim();
    if (!prop) continue;
    if (prop.startsWith('--')) { out[prop] = val; continue; }
    const camel = prop.startsWith('-webkit-')
      ? 'Webkit' + prop.slice(8).replace(/^[a-z]/, c => c.toUpperCase()).replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
      : prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    out[camel] = val;
  }
  if (cache.size > 6000) cache.clear();
  cache.set(css, out as CSSProperties);
  return out as CSSProperties;
}
