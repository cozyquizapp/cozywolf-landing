// SSR-/Prerender-Einstieg: rendert eine Route zu statischem HTML (Node, kein
// Browser). Wird vom Build-Prerender-Skript (prerender.mjs) genutzt.
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { AppRoot } from './routes';

export function render(path: string): string {
  return renderToString(
    <StrictMode>
      <AppRoot path={path} />
    </StrictMode>,
  );
}
