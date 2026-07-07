// Zentrale Marken-Tokens fuer cozywolf.de (React-Multipage-Fundament, 2026-07-07).
//
// WICHTIG: Marketing-/Logo-Pink ist #FA4BA3 (per Logo-Pixel-Messung), NICHT das
// App-UI-Pink #EC4899. Auf der Marketing-Seite gilt das Logo-Pink. Wortmarke
// „COZYWOLF" in League Spartan (uppercase, solide), Fliesstext Nunito.

export const BRAND = {
  pink:     '#FA4BA3',       // Logo/Marketing-Pink
  pinkRgb:  '250,75,163',
  pinkSoft: '#FFC7E4',
  magenta:  '#AB0055',       // Logo-Ring/Magenta
  navy:     '#1E2A5A',
  bg:       '#0A0814',
  ink:      '#e2e8f0',
  inkSoft:  '#cbd5e1',
  muted:    '#94a3b8',
} as const;

// Wortmarken-/Display-Font (nur fuer „COZYWOLF"-Logo-Look). Body = Nunito.
export const FONT_DISPLAY = "'League Spartan', 'Nunito', system-ui, sans-serif";
export const FONT_BODY = "'Nunito', system-ui, sans-serif";

// Kontakt / externe Ziele (an EINER Stelle, ueberall wiederverwendet).
export const EMAIL = 'hallo@cozywolf.de';
export const INSTA_URL = 'https://instagram.com/cozywolf.events';
export const INSTA_HANDLE = '@cozywolf.events';
export const PLAY_URL = 'https://play.cozyquiz.app';
// TODO(Wolf): echte Wonky-Guess-URL eintragen (separates Repo cozyquizapp/wonkyguess).
export const WONKY_URL = 'https://wonkyguess.cozywolf.de';

// Vorausgefuellter Anfrage-Mailto (Betreff + Body-Geruest), an CTAs wiederverwendet.
export function anfrageMailto(lang: 'de' | 'en'): string {
  const subject = lang === 'de' ? 'Quiz-Anfrage' : 'Quiz booking request';
  const body = lang === 'de'
    ? ['Hi Johannes,', '', 'ich haette Interesse an einem Quiz-Abend.', '',
       'Anlass: ', 'Ungefaehre Personenzahl: ', 'Wunsch-Datum/Zeitraum: ',
       'Ort: ', '', 'Viele Gruesse'].join('\n')
    : ['Hi Johannes,', '', "I'd like to book a quiz night.", '',
       'Occasion: ', 'Approx. number of people: ', 'Preferred date/timeframe: ',
       'Location: ', '', 'Best'].join('\n');
  return `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
