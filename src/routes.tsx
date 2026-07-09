// Gemeinsame Routen-Auflösung für Client (main.tsx) und Prerender (entry-server).
// Damit erzeugt der Build für jede Route statisches HTML mit Inhalt (SSG), sodass
// Crawler, Link-Previews und AI-Tools die Seite ohne JavaScript lesen können.
import type { ReactElement } from 'react';
import { PathCtx } from './pathContext';
import LegalPage from './LegalPage';
import HomePage from './pages/HomePage';
import FirmenPage from './pages/FirmenPage';
import LocationsPage from './pages/LocationsPage';
import FeiernPage from './pages/FeiernPage';
import UeberPage from './pages/UeberPage';
import KontaktPage from './pages/KontaktPage';
import TestenPage from './pages/TestenPage';

export function normalizePath(p: string): string {
  return p.replace(/\/+$/, '') || '/';
}

function pageFor(path: string): ReactElement {
  switch (path) {
    case '/impressum': return <LegalPage doc="impressum" />;
    case '/datenschutz': return <LegalPage doc="datenschutz" />;
    case '/firmen': return <FirmenPage />;
    case '/locations': return <LocationsPage />;
    case '/feiern': return <FeiernPage />;
    case '/ueber': return <UeberPage />;
    case '/kontakt': return <KontaktPage />;
    case '/testen': return <TestenPage />;
    default: return <HomePage />;
  }
}

export function AppRoot({ path }: { path: string }) {
  const p = normalizePath(path);
  return <PathCtx.Provider value={p}>{pageFor(p)}</PathCtx.Provider>;
}

/** Alle prerenderbaren Routen (für das Build-Prerender-Skript gespiegelt). */
export const ROUTES = ['/', '/firmen', '/locations', '/feiern', '/ueber', '/kontakt', '/testen', '/impressum', '/datenschutz'];
