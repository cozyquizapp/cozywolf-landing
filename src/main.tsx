import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import LegalPage from './LegalPage'

// 2026-05-10 (Wolf-Wunsch Impressum + Datenschutz): pathname-basiertes
// Mini-Routing ohne react-router-Dep. Reicht für 3 statische Routen.
function Root() {
  const path = typeof window !== 'undefined' ? window.location.pathname : '/';
  if (path === '/impressum' || path.startsWith('/impressum/')) {
    return <LegalPage doc="impressum" />;
  }
  if (path === '/datenschutz' || path.startsWith('/datenschutz/')) {
    return <LegalPage doc="datenschutz" />;
  }
  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
