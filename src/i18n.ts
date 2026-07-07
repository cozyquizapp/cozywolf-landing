// Geteilte UI-Texte (Nav, Footer, gemeinsame Bausteine) DE+EN.
// Seiten-spezifische Copy lebt in der jeweiligen Page-Datei.
// Redaktion: Ich-Form (Solo), keine Gedankenstriche, sachlich-warm.
import type { Lang } from './lang';

type Dict = {
  // Nav
  navFirmen: string; navLocations: string; navFeiern: string;
  navUeber: string; navKontakt: string;
  // Footer
  footerTagline: string; footerImprint: string; footerPrivacy: string;
  footerWonky: string; footerMade: string;
  // Gemeinsame CTAs
  ctaBook: string; ctaContact: string;
  // Veranstalter-Reassurance-Block ("So laeuft ein Abend bei mir")
  reTitle: string;
  reUncomplicatedT: string; reUncomplicatedB: string;
  rePrepT: string; rePrepB: string;
  reScaleT: string; reScaleB: string;
  reDurationT: string; reDurationB: string;
  reHostT: string; reHostB: string;
  reRegionT: string; reRegionB: string;
};

const de: Dict = {
  navFirmen: 'Für Firmen', navLocations: 'Für Locations', navFeiern: 'Private Feiern',
  navUeber: 'Über mich', navKontakt: 'Kontakt',
  footerTagline: 'Live-Quiz-Abende, moderiert von mir.',
  footerImprint: 'Impressum', footerPrivacy: 'Datenschutz',
  footerWonky: 'Auch von mir: Wonky Guess',
  footerMade: 'CozyWolf · Johannes · Hamburg',
  ctaBook: 'Quiz anfragen', ctaContact: 'Schreib mir',
  reTitle: 'So läuft ein Abend bei mir',
  reUncomplicatedT: 'Unkompliziert',
  reUncomplicatedB: 'Deine Gäste scannen einen QR-Code und spielen am eigenen Handy. Keine App, keine Installation.',
  rePrepT: 'Du bereitest nichts vor',
  rePrepB: 'Ich bringe Beamer und Sound mit und baue alles auf. Du brauchst nur eine Projektionsfläche und WLAN für deine Gäste.',
  reScaleT: 'Von kleiner Runde bis 100 Personen',
  reScaleB: 'Kleine Gruppen erobern das Spielfeld, große Gruppen treten in Fraktionen gegeneinander an. Der Abend passt sich an.',
  reDurationT: 'Rund 90 bis 120 Minuten',
  reDurationB: 'Ein kompletter Quiz-Abend mit mehreren Runden. Länge stimmen wir vorher auf euren Anlass ab.',
  reHostT: 'Moderation inklusive',
  reHostB: 'Ich moderiere selbst, den ganzen Abend. Du musst dich um nichts kümmern und bist einfach dabei.',
  reRegionT: 'Region Hamburg',
  reRegionB: 'Ich bin in Hamburg und Umland unterwegs. Für weiter entfernte Anfragen einfach kurz melden.',
};

const en: Dict = {
  navFirmen: 'For companies', navLocations: 'For venues', navFeiern: 'Private parties',
  navUeber: 'About me', navKontakt: 'Contact',
  footerTagline: 'Live quiz nights, hosted by me.',
  footerImprint: 'Imprint', footerPrivacy: 'Privacy',
  footerWonky: 'Also by me: Wonky Guess',
  footerMade: 'CozyWolf · Johannes · Hamburg',
  ctaBook: 'Request a quiz', ctaContact: 'Write me',
  reTitle: 'How an evening works with me',
  reUncomplicatedT: 'Effortless',
  reUncomplicatedB: 'Your guests scan a QR code and play on their own phone. No app, no install.',
  rePrepT: 'You prepare nothing',
  rePrepB: 'I bring the projector and sound and set everything up. You only need a surface to project on and WiFi for your guests.',
  reScaleT: 'From small rounds to 100 people',
  reScaleB: 'Small groups conquer the board, large groups compete in factions. The evening adapts to your crowd.',
  reDurationT: 'Around 90 to 120 minutes',
  reDurationB: 'A full quiz night with several rounds. We agree the length beforehand to fit your occasion.',
  reHostT: 'Hosting included',
  reHostB: 'I host the whole evening myself. You do not have to worry about a thing and simply join in.',
  reRegionT: 'Hamburg area',
  reRegionB: 'I am based in and around Hamburg. For requests further out, just get in touch.',
};

const DICTS: Record<Lang, Dict> = { de, en };

export function t(lang: Lang): Dict {
  return DICTS[lang];
}
