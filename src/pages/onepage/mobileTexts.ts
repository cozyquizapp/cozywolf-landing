// Texte der Mobil-Fassung (eigenes Design "Website Mobile", KEINE responsive
// Variante der Desktop-Seite). DE aus dem abgenommenen Entwurf, EN nachgezogen.
// Gedankenstriche aus dem Entwurf sind per Repo-Regel durch Kommas ersetzt.
import type { Lang } from '../../lang';
import { TERMIN_AB } from './texts';
import { GEMEINSAM as G } from './gemeinsam';

export type MobileCat = {
  key: string; name: string; col: string; icon: string; claim: string;
} & (
  | { kind: 'pick'; q: string; opts: string[]; correct: number; fact: string; photo?: boolean }
  | { kind: 'guess'; q: string; target: number }
  | { kind: 'points'; q: string; opts: string[]; correct: number; correctLabel: string }
);

export type MobileDict = {
  nav: { items: { href: string; label: string }[]; menuLabel: string };
  hero: {
    kicker: string; hooks: string[]; rest: string; sub: string;
    cta: string; ctaSub: string; bookQ: string; bookCta: string; avail: string;
  };
  modes: {
    label: string; h2: string;
    quizChip: string; quizP: string; quizTeams: string; quizBullets: string[];
    avZeile: string; avAria: string;
    actIdle: string; actions: string[];
    arenaChip: string; arenaP: string; arenaFactions: string; arenaBullets: string[];
    frakHinweis: string;
  };
  teams: Record<string, string>;
  factions: { name: string; color: string; file: string; spruch: string }[];
  probe: {
    label: string; kicker: string; h2: string; sub: string; check1: string; check2: string;
    team: string; skipHint: string;
    cats: MobileCat[];
    progress: (n: number, total: number) => string;
    doneKicker: string; doneTitle: string; doneText: string;
    doneCta: string; doneAgain: string;
    tapHint: string; right: string; wrong: string;
    guessHint: string; bones: string;
    guessResult: (target: number, diff: number, near: boolean) => string;
    guessBtn: string; guessNext: string;
    pointsHint: string;
    pointsResult: (g: number) => string;
    pointsLeft: (n: number) => string; pointsAllSet: string;
  };
  anlaesse: {
    label: string; h2: string; sub: string; cta: string;
    cards: { badge: string; title: string; p: string }[];
  };
  ablauf: {
    label: string; h2: string; sub: string; priceBig: string; priceSub: string;
    wallAltOff: string; welcomeKicker: string; welcomeTitle: string; welcomeSub: string;
    bringT: string; bring: string; needT: string; need: string;
  };
  /** Der Spruch am Seitenende, zwei Zeilen. */
  kinetic: string[];
  johannes: { kicker: string; quote: { t: string; hot?: boolean }[]; name: string; role: string; photoAlt: string };
  faq: { label: string; h2: string; items: { q: string; a: string }[] };
  form: {
    label: string; h2: string; sub: string;
    tabEvent: string; tabTest: string;
    priceEvent: string; noteEvent: string; priceTest: string; noteTest: string; avail: string;
    okTitle: string; okBody: string;
    name: string; email: string; anlass: string; anlassOpts: string[];
    personen: string; nachricht: string; nachrichtPh: string;
    stadt: string; stadtPh: string; groesse: string; groesseOpts: string[];
    betreffEvent: string; betreffTest: string; artEvent: string; artTest: string;
    submit: string; sending: string;
    errorPre: string; errorPost: string;
    privacy1: string; privacyLink: string; privacy2: string;
  };
  footer: { imprint: string; privacy: string; instagram: string; aiNote: string };
};

const de: MobileDict = {
  nav: {
    items: [
      { href: '#spielarten', label: '01  Die Spielarten' },
      { href: '#probieren', label: '02  So spielt ihr' },
      { href: '#anlaesse', label: '03  Anlässe' },
      { href: '#ablauf', label: '04  Der Abend' },
      { href: '#johannes', label: 'Über mich' },
      { href: '#fragen', label: '05  Häufige Fragen' },
      { href: '#anfragen', label: '06  Anfragen' },
    ],
    menuLabel: 'Menü',
  },
  hero: {
    kicker: 'Moderiertes Live-Quiz für Teams in Hamburg',
    hooks: ['Wissen', 'Glück', 'Timing', 'Teamgeist', 'Bauchgefühl'],
    rest: 'ist nicht alles.',
    sub: G.de.heroSub,
    cta: 'Gratis für Test-Teams', ctaSub: G.de.ctaSub,
    bookQ: 'Lieber direkt buchen?', bookCta: 'Termin anfragen →',
    avail: `Ab 350 € · Termine ab ${TERMIN_AB.de}`,
  },
  modes: {
    label: 'Die Spielarten', h2: 'Zwei Modi, ein Abend',
    quizChip: 'Bis 40 Personen',
    quizP: 'Ihr spielt in Teams zu viert oder fünft an einem Handy, der Beamer ist die Bühne. Wer eine Frage richtig hat, setzt ein Feld.',
    quizTeams: '4 bis 8 Teams',
    quizBullets: [
      'Nicht wer die meisten Felder hat gewinnt, sondern wer die größte zusammenhängende Fläche hält',
      'Setzen, klauen, stapeln oder Joker',
      'Fünf Kategorien, drei Runden, Finale',
    ],
    avZeile: 'Sucht euch ein Team-Emoji aus',
    avAria: 'Team-Zeichen durchwechseln',
    actIdle: 'Jede richtige Antwort ist ein Zug auf dem Feld.',
    actions: [
      'Setzen, Glühbirnen erobern ein freies Feld',
      'Klauen, Pub-Crawl-Profis nehmen ein Feld ab',
      'Stapeln, Glühbirnen verstärken ein eigenes Feld',
      'Joker, Quiz-Mafia dreht ein Feld um',
    ],
    arenaChip: 'Ab 40 Personen',
    arenaP: 'Ihr spielt wie im CozyQuiz in Teams an einem Handy, nur gehört jedes Team zu einer von acht Fraktionen. Eine Fraktion fasst bis zu fünf Teams. Frage für Frage verschiebt sich die Rangfolge.',
    arenaFactions: '8 Fraktionen',
    arenaBullets: [
      'Kein Spielbrett, ein Rennen der Fraktionen',
      'Gewertet wird der Anteil richtiger Antworten, eine Fraktion mit acht Leuten hat keinen Vorteil gegenüber einer mit vier',
      'Zum Schluss fünf Awards und die Krönung',
    ],
    frakHinweis: 'Tippt ein Wappen an',
  },
  teams: { g: 'Quiz-Mafia', p: 'Glühbirnen', y: 'Hirnsturm', o: 'Pub-Crawl-Profis' },
  factions: [
    { name: 'Bauchgefühl', color: '#F97316', file: 'bauchgefuehl', spruch: 'Das Gefühl trügt nie.' },
    { name: 'Allwissen', color: '#FACC15', file: 'allwissen', spruch: 'Wir wissen es einfach.' },
    { name: 'Letzte Sekunde', color: '#A855F7', file: 'letztesekunde', spruch: 'Kurz vor knapp.' },
    { name: 'Glückstreffer', color: '#22C55E', file: 'glueckstreffer', spruch: 'Hauptsache richtig.' },
    { name: 'Risiko', color: '#EF4444', file: 'risiko', spruch: 'Alles oder nichts.' },
    { name: 'Improvisation', color: '#3B82F6', file: 'improvisation', spruch: 'Läuft schon irgendwie.' },
    { name: 'Einspruch', color: '#EC4899', file: 'einspruch', spruch: 'Das zählt nicht!' },
    { name: 'Feierabend', color: '#14B8A6', file: 'feierabend', spruch: 'Hauptsache dabei.' },
  ],
  probe: {
    label: 'Ausprobieren', kicker: 'Fünf Fragetypen, eine Runde',
    h2: 'So spielt ihr am Handy mit',
    sub: 'Ein Handy pro Team, QR-Code scannen, fertig. Hier läuft eine Runde von selbst durch, einen Fragetyp nach dem anderen, genau wie am Quizabend.',
    check1: 'Keine App, kein Login, kein Zettel',
    check2: 'Fünf Fragetypen, keine Runde fühlt sich gleich an',
    team: 'Team Glühbirnen', skipHint: 'Tippen zum Überspringen',
    progress: (n, total) => `Fragetyp ${n} von ${total}`,
    doneKicker: 'Demo durchgespielt',
    doneTitle: 'Das waren alle fünf Fragetypen.',
    doneText: 'An einem echten Abend kommen 40 bis 60 Fragen aus diesen Typen, und jede richtige Antwort ist ein Zug auf dem Spielfeld.',
    doneCta: 'Kostenlosen Testabend anfragen', doneAgain: 'Demo nochmal spielen',
    cats: [
      { key: 'mucho', name: 'Mu-Cho', col: '#3B82F6', icon: '/assets/cat-mucho.webp',
        claim: '4 Optionen, nur 1 ist richtig. Schnelligkeit entscheidet.', kind: 'pick',
        q: 'Was verschickte Netflix, bevor es Streaming gab?',
        opts: ['DVDs per Post', 'Videokassetten', 'Musik-CDs', 'Nichts, es gab nur Streaming'], correct: 0,
        fact: 'Netflix startete 1997 als DVD-Versand per Post.' },
      { key: 'schaetzchen', name: 'Schätzchen', col: '#F59E0B', icon: '/assets/cat-schaetzchen.webp',
        claim: 'Wer am nächsten dran liegt, gewinnt. Knapp dran zählt auch.', kind: 'guess',
        q: 'Wie viele Knochen hat ein erwachsener Mensch?', target: 206 },
      { key: 'cheese', name: 'Schau mal!', col: '#8B5CF6', icon: '/assets/cat-cheese.webp',
        claim: 'Erkennt das Bild und tippt die Antwort ins Handy.', kind: 'pick', photo: true,
        q: 'Was ist auf dem Bild?',
        opts: ['Kolosseum', 'Akropolis', 'Alhambra', 'Pantheon'], correct: 0,
        fact: 'Ins Kolosseum passten rund 50.000 Zuschauer.' },
      { key: 'zehn', name: '10 von 10', col: '#22C55E', icon: '/assets/cat-10v10.webp',
        claim: '3 Antworten, 10 Punkte. Alles auf eine Karte oder streuen?', kind: 'points',
        q: 'Wer gewann die Fußball-WM 2014? Verteilt 10 Punkte.',
        opts: ['Deutschland', 'Argentinien', 'Brasilien'], correct: 0, correctLabel: 'Deutschland' },
      { key: 'tuete', name: 'Bunte Tüte', col: '#EF4444', icon: '/assets/cat-buntetuete.webp',
        claim: 'Alles, was in keine Schublade passt.', kind: 'pick',
        q: 'Welche Aussage stimmt nicht?',
        opts: ['Honig verdirbt nicht', 'Bananen sind botanisch Beeren', 'Die Chinesische Mauer sieht man vom Mond', 'Ein Venus-Tag dauert länger als ein Venus-Jahr'], correct: 2,
        fact: 'Vom Mond aus ist die Mauer mit bloßem Auge nicht zu erkennen.' },
    ],
    tapHint: 'Tippt eine Antwort an.', right: 'Richtig. ', wrong: 'Daneben. ',
    guessHint: 'Schiebt den Regler und gebt eure Schätzung ab.', bones: 'Knochen',
    guessResult: (t, d, near) => `Richtig sind ${t}. Ihr lagt ${d} daneben${near ? ', das reicht für die Runde.' : '.'}`,
    guessBtn: 'Schätzung abgeben', guessNext: 'Nächste Frage kommt …',
    pointsHint: 'Verteilt alle 10 Punkte, dann wird abgerechnet.',
    pointsResult: g => `Deutschland war richtig. Ihr habt ${g} von 10 Punkten daraufgesetzt.`,
    pointsLeft: n => `Noch ${n} ${n === 1 ? 'Punkt' : 'Punkte'} zu verteilen`,
    pointsAllSet: 'Alle 10 Punkte gesetzt',
  },
  anlaesse: {
    label: 'Anlässe', h2: 'Für welchen Anlass?',
    sub: G.de.anlaesseSub,
    cta: 'Anfragen →',
    cards: [
      { badge: 'Team-Event', title: 'Firma oder Team',
        p: 'Abteilungen oder Tische treten gegeneinander an. Rechnung auf die Firma.' },
      { badge: 'Geburtstag', title: 'Private Feier',
        p: 'Ihr sitzt zusammen, ich übernehme den Rest. Auf Wunsch mit Fragen über das Geburtstagskind.' },
      { badge: 'Quiz-Nacht', title: 'Café, Bar oder Pub',
        p: 'Ein fester Quizabend gibt euren Gästen einen Grund, unter der Woche zu kommen. Der erste ist kostenlos.' },
    ],
  },
  ablauf: {
    label: 'Ablauf', h2: G.de.ablaufH2,
    sub: G.de.ablaufSub,
    priceBig: 'ab 350 €', priceSub: 'für den ganzen Abend',
    wallAltOff: 'Wohnzimmer mit Beamer, Wand noch dunkel',
    welcomeKicker: 'Herzlich willkommen zum', welcomeTitle: 'COZYQUIZ',
    welcomeSub: 'Macht’s euch bequem, gleich geht’s los!',
    bringT: 'Ich bringe mit:', bring: 'Beamer, Sound, Moderation und die Fragen, auf eure Runde abgestimmt.',
    needT: 'Ihr braucht:', need: 'Eine freie Wand, Strom und WLAN. Ein Handy pro Team habt ihr dabei.',
  },
  kinetic: ['STAY COZY.', 'STAY CURIOUS.'],
  johannes: {
    kicker: 'Über mich',
    quote: [
      { t: '„Mein Ziel: Ein Abend voller ' }, { t: 'Aha-Momente', hot: true }, { t: ', ' },
      { t: 'Lacher', hot: true }, { t: ' und guter ' }, { t: 'Stimmung', hot: true },
      { t: ', über den ihr noch lange sprecht."' },
    ],
    name: 'Johannes', role: 'Gründer & Quizmaster',
    photoAlt: 'Johannes, Quizmaster von CozyWolf',
  },
  faq: {
    label: 'Fragen', h2: 'Häufige Fragen',
    items: [
      { q: G.de.faqTechnikQ,
        a: 'Nein. Beamer und Sound bringe ich mit, deine Gäste scannen nur einen QR-Code und spielen im Browser. Keine App, kein Login.' },
      { q: G.de.faqGroesseQ,
        a: G.de.faqGroesseA },
      { q: G.de.faqDauerQ,
        a: G.de.faqDauerA },
      { q: 'Was kostet das?',
        a: G.de.faqPreisA },
    ],
  },
  form: {
    label: 'Anfragen', h2: 'Lust auf ein Quiz?',
    sub: 'Schreib kurz, worum es geht, ich melde mich mit einem Vorschlag.',
    tabEvent: 'Event anfragen', tabTest: 'Test-Team, gratis',
    priceEvent: 'ab 350 €', noteEvent: 'Moderation, Beamer, Sound und Aufbau sind enthalten. Keine versteckten Posten.',
    priceTest: '0 €', noteTest: 'CozyWolf startet gerade. Deshalb die ersten Runden kostenlos.',
    avail: `Termine ab ${TERMIN_AB.de}.`,
    okTitle: 'Danke, ist angekommen.', okBody: 'Ich melde mich so schnell ich kann bei dir.',
    name: 'Name', email: 'E-Mail',
    anlass: 'Anlass', anlassOpts: ['Firma oder Team', 'Private Feier', 'Café, Bar oder Pub', 'Etwas anderes'],
    personen: 'Personen', nachricht: 'Nachricht', nachrichtPh: 'Wann, wo, und was ist der Anlass?',
    stadt: 'Stadt / Region', stadtPh: 'z. B. Hamburg',
    groesse: 'Wie viele seid ihr?',
    groesseOpts: ['6–10 Leute', 'Mehr als 10', 'Weniger als 6', 'Weiß ich noch nicht'],
    betreffEvent: 'Quiz-Anfrage', betreffTest: 'Neues Test-Team',
    artEvent: 'Event-Anfrage', artTest: 'Test-Team',
    submit: 'Anfrage senden', sending: 'Senden …',
    errorPre: G.de.formFehler, errorPost: '.',
    privacy1: 'Ich nutze deine Angaben nur, um dir zu antworten. Mehr dazu in der ',
    privacyLink: 'Datenschutzerklärung', privacy2: '.',
  },
  footer: { imprint: 'Impressum', privacy: 'Datenschutz', instagram: 'Instagram', aiNote: G.de.aiHinweis },
};

const en: MobileDict = {
  nav: {
    items: [
      { href: '#spielarten', label: '01  The formats' },
      { href: '#probieren', label: '02  How you play' },
      { href: '#anlaesse', label: '03  Occasions' },
      { href: '#ablauf', label: '04  The evening' },
      { href: '#johannes', label: 'About me' },
      { href: '#fragen', label: '05  FAQ' },
      { href: '#anfragen', label: '06  Requests' },
    ],
    menuLabel: 'Menu',
  },
  hero: {
    kicker: 'Hosted live quiz for teams in Hamburg',
    hooks: ['Knowledge', 'Luck', 'Timing', 'Team spirit', 'Gut feeling'],
    rest: 'isn’t everything.',
    sub: G.en.heroSub,
    cta: 'Free for test teams', ctaSub: G.en.ctaSub,
    bookQ: 'Rather book directly?', bookCta: 'Request a date →',
    avail: `From €350 · dates from ${TERMIN_AB.en}`,
  },
  modes: {
    label: 'The formats', h2: 'Two modes, one evening',
    quizChip: 'Up to 40 people',
    quizP: 'You play in teams of four or five around one phone, the projector is the stage. Answer correctly, claim a tile.',
    quizTeams: '4 to 8 teams',
    quizBullets: [
      'It’s not the most tiles that wins, but the largest connected area',
      'Claim, steal, stack or play a joker',
      'Five categories, three rounds, a finale',
    ],
    avZeile: 'Pick your team emoji',
    avAria: 'Cycle through team marks',
    actIdle: 'Every correct answer is a move on the board.',
    actions: [
      'Claim, Lightbulbs take a free tile',
      'Steal, Pub Crawl Pros take a tile away',
      'Stack, Lightbulbs reinforce their own tile',
      'Joker, Quiz Mafia flips a tile',
    ],
    arenaChip: 'From 40 people',
    arenaP: 'You play like in CozyQuiz, in teams around one phone, except every team belongs to one of eight factions. A faction holds up to five teams. Question by question the ranking shifts.',
    arenaFactions: '8 factions',
    arenaBullets: [
      'No game board, a race of the factions',
      'Scored by the share of correct answers, a faction of eight has no advantage over one of four',
      'Five awards and the coronation at the end',
    ],
    frakHinweis: 'Tap a crest',
  },
  teams: { g: 'Quiz Mafia', p: 'Lightbulbs', y: 'Brainstorm', o: 'Pub Crawl Pros' },
  factions: [
    { name: 'Gut Feeling', color: '#F97316', file: 'bauchgefuehl', spruch: 'The gut never lies.' },
    { name: 'Know-It-All', color: '#FACC15', file: 'allwissen', spruch: 'We just know.' },
    { name: 'Last Second', color: '#A855F7', file: 'letztesekunde', spruch: 'Just in time.' },
    { name: 'Lucky Shot', color: '#22C55E', file: 'glueckstreffer', spruch: 'Right is right.' },
    { name: 'Risk', color: '#EF4444', file: 'risiko', spruch: 'All or nothing.' },
    { name: 'Improv', color: '#3B82F6', file: 'improvisation', spruch: 'We\u2019ll figure it out.' },
    { name: 'Objection', color: '#EC4899', file: 'einspruch', spruch: 'That doesn\u2019t count!' },
    { name: 'Knock-Off', color: '#14B8A6', file: 'feierabend', spruch: 'Just here for fun.' },
  ],

  probe: {
    label: 'Try it', kicker: 'Five question types, one round',
    h2: 'This is how you play along on your phone',
    check1: 'No app, no login, no paper',
    check2: 'Five question types, no round feels the same',
    sub: 'One phone per team, scan a QR code, done. Here a round plays through by itself, one question type after another, just like on quiz night.',
    team: 'Team Lightbulbs', skipHint: 'Tap to skip',
    progress: (n, total) => `Question type ${n} of ${total}`,
    doneKicker: 'Demo complete',
    doneTitle: 'That was all five question types.',
    doneText: 'A real evening runs 40 to 60 questions across these types, and every correct answer is a move on the board.',
    doneCta: 'Request a free trial night', doneAgain: 'Play the demo again',
    cats: [
      { key: 'mucho', name: 'Mu-Cho', col: '#3B82F6', icon: '/assets/cat-mucho.webp',
        claim: '4 options, only 1 is right. Speed decides.', kind: 'pick',
        q: 'What did Netflix ship before streaming existed?',
        opts: ['DVDs by mail', 'Video cassettes', 'Music CDs', 'Nothing, there was only streaming'], correct: 0,
        fact: 'Netflix launched in 1997 as a DVD-by-mail service.' },
      { key: 'schaetzchen', name: 'Ballpark', col: '#F59E0B', icon: '/assets/cat-schaetzchen.webp',
        claim: 'Closest guess wins. Nearly right still counts.', kind: 'guess',
        q: 'How many bones does an adult human have?', target: 206 },
      { key: 'cheese', name: 'Look Closer', col: '#8B5CF6', icon: '/assets/cat-cheese.webp',
        claim: 'Spot the picture and tap your answer on the phone.', kind: 'pick', photo: true,
        q: 'What is in the picture?',
        opts: ['Colosseum', 'Acropolis', 'Alhambra', 'Pantheon'], correct: 0,
        fact: 'The Colosseum held around 50,000 spectators.' },
      { key: 'zehn', name: '10 of 10', col: '#22C55E', icon: '/assets/cat-10v10.webp',
        claim: '3 answers, 10 points. All in or spread out?', kind: 'points',
        q: 'Who won the 2014 World Cup? Spread 10 points.',
        opts: ['Germany', 'Argentina', 'Brazil'], correct: 0, correctLabel: 'Germany' },
      { key: 'tuete', name: 'Mixed Bag', col: '#EF4444', icon: '/assets/cat-buntetuete.webp',
        claim: 'Everything that fits in no other box.', kind: 'pick',
        q: 'Which statement is false?',
        opts: ['Honey never spoils', 'Bananas are botanically berries', 'The Great Wall is visible from the Moon', 'A day on Venus lasts longer than its year'], correct: 2,
        fact: 'From the Moon the Wall cannot be seen with the naked eye.' },
    ],
    tapHint: 'Tap an answer.', right: 'Correct. ', wrong: 'Not quite. ',
    guessHint: 'Drag the slider and lock in your guess.', bones: 'bones',
    guessResult: (t, d, near) => `The answer is ${t}. You were ${d} off${near ? ', that wins the round.' : '.'}`,
    guessBtn: 'Lock in guess', guessNext: 'Next question coming …',
    pointsHint: 'Spread all 10 points, then we score it.',
    pointsResult: g => `Germany was correct. You put ${g} of 10 points on it.`,
    pointsLeft: n => `${n} ${n === 1 ? 'point' : 'points'} left to spread`,
    pointsAllSet: 'All 10 points placed',
  },
  anlaesse: {
    label: 'Occasions', h2: 'What’s the occasion?',
    sub: G.en.anlaesseSub,
    cta: 'Enquire →',
    cards: [
      { badge: 'Team event', title: 'Company or team',
        p: 'Departments or tables compete against each other. Invoice to the company.' },
      { badge: 'Birthday', title: 'Private party',
        p: 'You sit together, I take care of the rest. On request with questions about the birthday guest.' },
      { badge: 'Quiz night', title: 'Café, bar or pub',
        p: 'A regular quiz night gives your guests a reason to come in midweek. The first one is free.' },
    ],
  },
  ablauf: {
    label: 'How it works', h2: G.en.ablaufH2,
    sub: G.en.ablaufSub,
    priceBig: 'from €350', priceSub: 'for the whole evening',
    wallAltOff: 'Living room with projector, wall still dark',
    welcomeKicker: 'A warm welcome to', welcomeTitle: 'COZYQUIZ',
    welcomeSub: 'Make yourselves comfortable, we’re about to start!',
    bringT: 'I bring:', bring: 'Projector, sound, hosting and the questions, tuned to your crowd.',
    needT: 'You need:', need: 'A free wall, power and WiFi. One phone per team, you have that on you.',
  },
  kinetic: ['STAY COZY.', 'STAY CURIOUS.'],
  johannes: {
    kicker: 'About me',
    quote: [
      { t: '“My goal: an evening full of ' }, { t: 'aha moments', hot: true }, { t: ', ' },
      { t: 'laughs', hot: true }, { t: ' and good ' }, { t: 'vibes', hot: true },
      { t: ' that you’ll still talk about.”' },
    ],
    name: 'Johannes', role: 'Founder & quizmaster',
    photoAlt: 'Johannes, quizmaster of CozyWolf',
  },
  faq: {
    label: 'Questions', h2: 'Frequently asked questions',
    items: [
      { q: G.en.faqTechnikQ,
        a: 'No. I bring the projector and sound, your guests just scan a QR code and play in the browser. No app, no login.' },
      { q: G.en.faqGroesseQ,
        a: G.en.faqGroesseA },
      { q: G.en.faqDauerQ,
        a: G.en.faqDauerA },
      { q: 'What does it cost?',
        a: 'It starts at €350 for the whole evening, including tech and hosting. The exact price depends on headcount and occasion. Tell me briefly what you have in mind and you’ll get a fair offer.' },
    ],
  },
  form: {
    label: 'Requests', h2: 'Up for a quiz?',
    sub: 'Tell me briefly what you have in mind, and I’ll get back to you with a proposal.',
    tabEvent: 'Request an event', tabTest: 'Test team, free',
    priceEvent: 'from €350', noteEvent: 'Hosting, projector, sound and setup included. No hidden extras.',
    priceTest: '€0', noteTest: 'CozyWolf is just getting started. That’s why the first rounds are free.',
    avail: `Dates from ${TERMIN_AB.en}.`,
    okTitle: 'Thanks, got it.', okBody: 'I’ll get back to you as soon as I can.',
    name: 'Name', email: 'Email',
    anlass: 'Occasion', anlassOpts: ['Company or team', 'Private party', 'Café, bar or pub', 'Something else'],
    personen: 'People', nachricht: 'Message', nachrichtPh: 'When, where, and what’s the occasion?',
    stadt: 'City / region', stadtPh: 'e.g. Hamburg',
    groesse: 'How many are you?',
    groesseOpts: ['6–10 people', 'More than 10', 'Fewer than 6', 'Don’t know yet'],
    betreffEvent: 'Quiz request', betreffTest: 'New test team',
    artEvent: 'Event request', artTest: 'Test team',
    submit: 'Send request', sending: 'Sending …',
    errorPre: G.en.formFehler, errorPost: '.',
    privacy1: 'I only use your details to reply to you. More in the ',
    privacyLink: 'privacy policy', privacy2: '.',
  },
  footer: { imprint: 'Imprint', privacy: 'Privacy', instagram: 'Instagram', aiNote: G.en.aiHinweis },
};

const DICTS: Record<Lang, MobileDict> = { de, en };

export function mobileT(lang: Lang): MobileDict {
  return DICTS[lang];
}
