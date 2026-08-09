// Sprach-Store (DE/EN) fuer die Multipage-Site. Persistiert in localStorage
// ('cw-lang', kompatibel zur alten App). Da Navigation ueber echte <a>-Links
// (Full-Page-Loads) laeuft, ueberlebt die Wahl den Seitenwechsel via localStorage;
// der Umschalter aktualisiert die aktuelle Seite ohne Reload via Store-Event.
import { useSyncExternalStore } from 'react';

export type Lang = 'de' | 'en';

const KEY = 'cw-lang';
const listeners = new Set<() => void>();

function read(): Lang {
  if (typeof window === 'undefined') return 'de';
  const stored = window.localStorage.getItem(KEY);
  if (stored === 'de' || stored === 'en') return stored;
  // Standard ist Deutsch, unabhaengig von der Browsersprache. Englisch gibt es
  // nur nach aktivem Klick auf den Umschalter (Livegang-Entscheidung 2026-08).
  return 'de';
}

let current: Lang = read();
// <html lang> auch beim initialen Laden an die gespeicherte Wahl angleichen,
// nicht erst beim naechsten Umschalten (index.html startet statisch mit "de").
if (typeof document !== 'undefined') document.documentElement.lang = current;

export function getLang(): Lang { return current; }

export function setLang(next: Lang): void {
  current = next;
  try { window.localStorage.setItem(KEY, next); } catch { /* ignore */ }
  if (typeof document !== 'undefined') document.documentElement.lang = next;
  listeners.forEach(l => l());
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

/** Reaktiver Sprach-Hook. Re-rendert Konsumenten beim Umschalten. */
export function useLang(): Lang {
  return useSyncExternalStore(subscribe, getLang, () => 'de');
}
