import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AppRoot, normalizePath } from './routes'

// Client-Einstieg. Das per Build prerenderte HTML (Inhalt fuer Crawler/AI) wird
// beim Laden von React neu aufgebaut (createRoot). Routing per Pfad; Navigation
// laeuft ueber echte <a>-Links (Full-Page-Loads).
//
// Startseiten-Weiche: '/' hat zwei eigenstaendige Fassungen (Desktop '/d',
// Mobil '/m'). Serverseitig liefert Vercel per User-Agent die passende aus;
// hier entscheidet dieselbe Frage nochmal am Geraet (Handoff 0: matchMedia
// oder Zeigegeraet ohne Hover), damit auch Direktaufrufe und Sonderfaelle
// die richtige Fassung mounten.
function effectivePath(): string {
  const p = normalizePath(window.location.pathname)
  if (p !== '/') return p
  const mobile = window.matchMedia('(max-width: 820px)').matches
    || window.matchMedia('(hover: none)').matches
  return mobile ? '/m' : '/d'
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRoot path={effectivePath()} />
  </StrictMode>,
)
