// Event-Zaehlung via GoatCounter (cookiefrei, ohne Banner-Pflicht, wie die
// Seitenaufrufe auch). Events erscheinen im Dashboard als eigene Pfade.
// Direkt ueber window.goatcounter.count statt data-goatcounter-click, weil
// count.js seine Click-Bindings beim Laden setzt und React die Elemente erst
// danach rendert. No-op wenn der Zaehler fehlt (Adblocker, lokal, SSR).
type GoatCounter = { count: (opts: { path: string; title?: string; event: boolean }) => void };

export function track(name: string): void {
  if (typeof window === 'undefined') return;
  const gc = (window as Window & { goatcounter?: GoatCounter }).goatcounter;
  try { gc?.count({ path: name, event: true }); } catch { /* ignore */ }
}
