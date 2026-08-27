// Gemeinsame Routen-Auflösung für Client (main.tsx) und Prerender (entry-server).
// Damit erzeugt der Build für jede Route statisches HTML mit Inhalt (SSG), sodass
// Crawler, Link-Previews und AI-Tools die Seite ohne JavaScript lesen können.
//
// Die Startseite existiert in zwei eigenständigen Fassungen (kein Responsive):
// '/d' = Desktop-One-Pager, '/m' = Mobil-Fassung. Beide werden unter '/'
// ausgespielt: serverseitig per User-Agent-Rewrite in vercel.json, clientseitig
// entscheidet main.tsx per matchMedia. Die früheren Unterseiten (/firmen, ...)
// sind entfernt und leiten per vercel.json auf '/' weiter.
import type { ReactElement } from 'react';
import { PathCtx } from './pathContext';
import LegalPage from './LegalPage';
import OnePage from './pages/OnePage';
import MobileOnePage from './pages/MobileOnePage';
import NotFoundPage from './pages/NotFoundPage';
import Mockups from './pages/Mockups';

export function normalizePath(p: string): string {
  return p.replace(/\/+$/, '') || '/';
}

function pageFor(path: string): ReactElement {
  switch (path) {
    case '/': return <OnePage />;
    case '/d': return <OnePage />;
    case '/m': return <MobileOnePage />;
    // Werkzeug, nicht Produkt: Entwurfsvergleich fuer die Stationen.
    // Nicht verlinkt, noindex, faellt raus sobald die Handschrift steht.
    case '/mockups': return <Mockups />;
    case '/impressum': return <LegalPage doc="impressum" />;
    case '/datenschutz': return <LegalPage doc="datenschutz" />;
    // Unbekannte Pfade: echte 404-Seite statt still die Startseite (Soft-404).
    default: return <NotFoundPage />;
  }
}

export function AppRoot({ path }: { path: string }) {
  const p = normalizePath(path);
  return <PathCtx.Provider value={p}>{pageFor(p)}</PathCtx.Provider>;
}

/** Alle prerenderbaren Routen (für das Build-Prerender-Skript gespiegelt). */
export const ROUTES = ['/d', '/m', '/mockups', '/impressum', '/datenschutz'];
