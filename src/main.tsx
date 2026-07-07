import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AppRoot } from './routes'

// Client-Einstieg. Das per Build prerenderte HTML (Inhalt fuer Crawler/AI) wird
// beim Laden von React neu aufgebaut (createRoot). Routing per Pfad; Navigation
// laeuft ueber echte <a>-Links (Full-Page-Loads), Vercel liefert je Route das
// passende prerenderte HTML aus.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRoot path={window.location.pathname} />
  </StrictMode>,
)
