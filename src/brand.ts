// Zentrale Marken-Tokens fuer cozywolf.de (React-Multipage-Fundament, 2026-07-07).
//
// WICHTIG: Marketing-/Logo-Pink ist #FA4BA3 (per Logo-Pixel-Messung), NICHT das
// App-UI-Pink #EC4899. Auf der Marketing-Seite gilt das Logo-Pink. Wortmarke
// „COZYWOLF" in League Spartan (uppercase, solide), Fliesstext Bricolage Grotesque.

export const BRAND = {
  pink:     '#FA4BA3',       // Logo/Marketing-Pink
  pinkRgb:  '250,75,163',
  pinkSoft: '#FFC7E4',
  magenta:  '#AB0055',       // Logo-Ring/Magenta
  navy:     '#1E2A5A',
  bg:       '#0A0814',
  // Textskala des neuen Designs: warmes Creme statt kaltem Slate. Ein kaltes
  // Weiss neben einem warmen Grund sticht blaeulich ab, deshalb ist der
  // Primaertext #F6EFE6 und die leiseren Stufen sind derselbe Ton mit Alpha.
  ink:      '#F6EFE6',
  inkSoft:  'rgba(246,239,230,.78)',
  muted:    'rgba(246,239,230,.62)',
  hairline: 'rgba(246,239,230,.20)',
  surface:  'rgba(246,239,230,.05)',
} as const;

// Wortmarken-/Display-Font (nur fuer „COZYWOLF"-Logo-Look). Die Wortmarke ist
// die Marke selbst und bleibt bewusst League Spartan, waehrend die Arbeitsschrift
// mit dem neuen Design auf Bricolage Grotesque wechselt.
export const FONT_DISPLAY = "'League Spartan', 'Bricolage Grotesque', system-ui, sans-serif";
export const FONT_BODY = "'Bricolage Grotesque', 'Nunito', system-ui, sans-serif";

// Kontakt / externe Ziele (an EINER Stelle, ueberall wiederverwendet).
export const EMAIL = 'hallo@cozywolf.de';
export const INSTA_URL = 'https://instagram.com/cozywolf.events';
export const INSTA_HANDLE = '@cozywolf.events';
export const PLAY_URL = 'https://play.cozyquiz.app';
export const WONKY_URL = 'https://wonkyguess.fun';

// Formspree-Form-ID fuers Kontaktformular. Anlegen auf formspree.io -> neue Form
// -> die ID (der Teil nach /f/ in der Endpoint-URL) hier eintragen. Solange der
// Platzhalter steht, faellt das Formular sauber auf einen vorausgefuellten
// Mailto zurueck (funktioniert also auch schon vor dem Formspree-Setup).
export const FORMSPREE_ID = 'mykqabqa';
export const FORMSPREE_ACTIVE = (FORMSPREE_ID as string) !== 'REPLACE_ME';

// Vorausgefuellter Anfrage-Mailto (Betreff + Body-Geruest), an CTAs wiederverwendet.
export function anfrageMailto(lang: 'de' | 'en'): string {
  const subject = lang === 'de' ? 'Quiz-Anfrage' : 'Quiz booking request';
  const body = lang === 'de'
    ? ['Hi Johannes,', '', 'ich hätte Interesse an einem Quiz-Event.', '',
       'Anlass: ', 'Ungefähre Personenzahl: ', 'Wunsch-Datum/Zeitraum: ',
       'Ort: ', '', 'Viele Grüße'].join('\n')
    : ['Hi Johannes,', '', "I'd like to book a quiz.", '',
       'Occasion: ', 'Approx. number of people: ', 'Preferred date/timeframe: ',
       'Location: ', '', 'Best'].join('\n');
  return `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
