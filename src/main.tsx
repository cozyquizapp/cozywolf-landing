import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import LegalPage from './LegalPage'
import HomePage from './pages/HomePage'
import FirmenPage from './pages/FirmenPage'
import LocationsPage from './pages/LocationsPage'
import FeiernPage from './pages/FeiernPage'
import UeberPage from './pages/UeberPage'
import KontaktPage from './pages/KontaktPage'

// Pfad-basiertes Mini-Routing ohne react-router (Navigation = echte <a>-Links,
// Full-Page-Loads; Vercel leitet jede Route auf app.html). Stufe 1: die neuen
// Routen liegen auf der React-App. Die Startseite `/` wird vorerst noch von der
// alten statischen public/index.html bedient (Cutover in Stufe 2).
function Root() {
  const raw = typeof window !== 'undefined' ? window.location.pathname : '/';
  const path = raw.replace(/\/+$/, '') || '/';
  if (path === '/impressum') return <LegalPage doc="impressum" />;
  if (path === '/datenschutz') return <LegalPage doc="datenschutz" />;
  if (path === '/firmen') return <FirmenPage />;
  if (path === '/locations') return <LocationsPage />;
  if (path === '/feiern') return <FeiernPage />;
  if (path === '/ueber') return <UeberPage />;
  if (path === '/kontakt') return <KontaktPage />;
  return <HomePage />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
