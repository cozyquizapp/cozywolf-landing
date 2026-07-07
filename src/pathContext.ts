// Separater Path-Context (verhindert Zirkel-Import Layout <-> routes).
// Trägt den aktuellen Pfad SSR-sicher durch (statt window.location), damit
// Client-Render und Prerender identische Nav-Aktiv-Zustände erzeugen.
import { createContext, useContext } from 'react';

export const PathCtx = createContext('/');
export function usePath(): string { return useContext(PathCtx); }
