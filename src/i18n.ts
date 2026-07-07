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
  footerTagline: 'Live-Quiz-Events, moderiert von mir.',
  footerImprint: 'Impressum', footerPrivacy: 'Datenschutz',
  footerWonky: 'Wonky Guess',
  footerMade: 'CozyWolf, Hamburg',
  ctaBook: 'Quiz anfragen', ctaContact: 'Schreib mir',
  reTitle: 'So läuft es bei mir ab',
  reUncomplicatedT: 'Unkompliziert',
  reUncomplicatedB: 'Deine Gäste scannen einen QR-Code und spielen am eigenen Handy. Keine App, keine Installation.',
  rePrepT: 'Aufbau übernehme ich',
  rePrepB: 'Ich bringe Beamer und Sound mit und baue alles auf. Du brauchst nur eine Projektionsfläche, WLAN und ein paar Getränke und Snacks für deine Gäste.',
  reScaleT: 'Von kleiner Runde bis zu 100 Personen',
  reScaleB: 'Kleine Gruppen erobern das Spielfeld, große Gruppen treten in Fraktionen gegeneinander an. Das Format passt sich an.',
  reDurationT: 'Rund 90 bis 120 Minuten',
  reDurationB: 'Ein komplettes Quiz-Programm mit mehreren Runden. Die Länge stimme ich vorher mit dir ab.',
  reHostT: 'Moderation inklusive',
  reHostB: 'Ich moderiere selbst, von Anfang bis Ende. Um das Programm musst du dich nicht kümmern, du bist einfach dabei.',
  reRegionT: 'Region Hamburg',
  reRegionB: 'Ich bin in Hamburg und Umland unterwegs. Für weiter entfernte Anfragen einfach kurz melden.',
};

const en: Dict = {
  navFirmen: 'For companies', navLocations: 'For venues', navFeiern: 'Private parties',
  navUeber: 'About me', navKontakt: 'Contact',
  footerTagline: 'Live quiz events, hosted by me.',
  footerImprint: 'Imprint', footerPrivacy: 'Privacy',
  footerWonky: 'Wonky Guess',
  footerMade: 'CozyWolf, Hamburg',
  ctaBook: 'Request a quiz', ctaContact: 'Write me',
  reTitle: 'How it works with me',
  reUncomplicatedT: 'Effortless',
  reUncomplicatedB: 'Your guests scan a QR code and play on their own phone. No app, no install.',
  rePrepT: 'I handle the setup',
  rePrepB: 'I bring the projector and sound and set everything up. You only need a surface to project on, WiFi and a few drinks and snacks for your guests.',
  reScaleT: 'From small rounds to 100 people',
  reScaleB: 'Small groups conquer the board, large groups compete in factions. The format adapts to your crowd.',
  reDurationT: 'Around 90 to 120 minutes',
  reDurationB: 'A full quiz programme with several rounds. I agree the length with you beforehand to fit your occasion.',
  reHostT: 'Hosting included',
  reHostB: 'I host from start to finish myself. You do not have to worry about the programme, you simply join in.',
  reRegionT: 'Hamburg area',
  reRegionB: 'I am based in and around Hamburg. For requests further out, just get in touch.',
};

const DICTS: Record<Lang, Dict> = { de, en };

export function t(lang: Lang): Dict {
  return DICTS[lang];
}
