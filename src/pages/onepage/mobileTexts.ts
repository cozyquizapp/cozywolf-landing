// Texte der Mobil-Fassung (eigenes Design "Website Mobile", KEINE responsive
// Variante der Desktop-Seite). DE aus dem abgenommenen Entwurf, EN nachgezogen.
// Gedankenstriche aus dem Entwurf sind per Repo-Regel durch Kommas ersetzt.
import type { Lang } from '../../lang';
import { TERMIN_AB } from './texts';

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
    hooks: string[]; rest: string; sub: string; sub2: string; imgAlt: string;
    cta: string; ctaSub: string; bookQ: string; bookCta: string; avail: string;
  };
  modes: {
    label: string; h2: string; sub: string;
    quizChip: string; quizP: string; quizTeams: string; quizBullets: string[];
    actIdle: string; actions: string[];
    arenaChip: string; arenaP: string; arenaFactions: string; arenaBullets: string[];
  };
  teams: Record<string, string>;
  factions: { name: string; color: string; file: string; p: number }[];
  probe: {
    label: string; h2: string; sub: string; team: string; skipHint: string;
    cats: MobileCat[];
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
  johannes: { kicker: string; quote: { t: string; hot?: boolean }[]; photoAlt: string };
  faq: { label: string; h2: string; items: { q: string; a: string }[] };
  form: {
    label: string; h2: string; sub: string;
    tabEvent: string; tabTest: string;
    priceEvent: string; noteEvent: string; priceTest: string; noteTest: string; avail: string;
    okTitle: string; okBody: string;
    name: string; email: string; anlass: string; anlassOpts: string[];
    personen: string; nachricht: string; nachrichtPh: string;
    submit: string; sending: string;
    errorPre: string; errorPost: string;
    privacy1: string; privacyLink: string; privacy2: string;
  };
  footer: { imprint: string; privacy: string; instagram: string; aiNote: string };
  sticky: { label: string; tag: string };
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
    hooks: ['Wissen', 'Glück', 'Timing', 'Teamgeist', 'Bauchgefühl'],
    rest: 'ist nicht alles.',
    sub: 'Der gemütlichste Quizabend in Hamburg, den ihr je gespielt habt.',
    sub2: 'Ich bringe Beamer, Sound und Moderation. Ihr spielt direkt am Handy, ihr braucht nur eine freie Wand.',
    imgAlt: 'Stimmungsbild, KI-erzeugt: Gäste in einer Hamburger Bar vor der Quiz-Leinwand',
    cta: 'Gratis für Test-Teams', ctaSub: 'Ein ganzer Abend, kostenlos',
    bookQ: 'Lieber direkt buchen?', bookCta: 'Termin anfragen →',
    avail: `Hamburg & Umland · Nächste Termine ab ${TERMIN_AB.de}`,
  },
  modes: {
    label: 'Die Spielarten', h2: 'Zwei Modi, ein Abend',
    sub: 'Tippt einen Modus an, um zu sehen, wie er gespielt wird.',
    quizChip: 'bis 30 Personen',
    quizP: 'Der Brettspielabend, in kleinen Teams. Jede richtige Antwort ist ein Zug auf dem Feld.',
    quizTeams: '4 bis 8 Teams',
    quizBullets: [
      'Teams zu dritt oder viert, ein Handy pro Team.',
      'Nicht die meisten Felder gewinnen, sondern die größte zusammenhängende Fläche.',
      'Jede gewonnene Frage ist eine Entscheidung.',
    ],
    actIdle: 'Jede richtige Antwort ist ein Zug auf dem Feld.',
    actions: [
      'Setzen, Glühbirnen erobern ein freies Feld',
      'Klauen, Pub-Crawl-Profis nehmen ein Feld ab',
      'Stapeln, Glühbirnen verstärken ein eigenes Feld',
      'Joker, Quiz-Mafia dreht ein Feld um',
    ],
    arenaChip: 'ab 25 Personen',
    arenaP: 'Die große Runde. Jeder spielt am eigenen Handy, acht Fraktionen treten gegeneinander an.',
    arenaFactions: '8 Fraktionen',
    arenaBullets: [
      'Beim Beitreten wählt jeder eine Fraktion: Bauchgefühl, Glückstreffer, Allwissen und fünf weitere.',
      'Kein Spielbrett, sondern ein Balken-Rennen der Fraktionen.',
      'Gewertet wird der Anteil richtiger Antworten, eine Fraktion mit acht Leuten hat keinen Vorteil gegenüber einer mit vier.',
      'Am Ende Siegerehrung mit fünf Awards und Krönung.',
    ],
  },
  teams: { g: 'Quiz-Mafia', p: 'Glühbirnen', y: 'Hirnsturm', o: 'Pub-Crawl-Profis' },
  factions: [
    { name: 'Bauchgefühl', color: '#F97316', file: 'bauchgefuehl', p: 92 },
    { name: 'Allwissen', color: '#FACC15', file: 'allwissen', p: 84 },
    { name: 'Letzte Sekunde', color: '#A855F7', file: 'letztesekunde', p: 71 },
    { name: 'Glückstreffer', color: '#22C55E', file: 'glueckstreffer', p: 63 },
    { name: 'Risiko', color: '#EF4444', file: 'risiko', p: 55 },
    { name: 'Improvisation', color: '#3B82F6', file: 'improvisation', p: 44 },
    { name: 'Einspruch', color: '#EC4899', file: 'einspruch', p: 36 },
    { name: 'Feierabend', color: '#14B8A6', file: 'feierabend', p: 28 },
  ],
  probe: {
    label: 'Fragetypen', h2: 'So spielt ihr',
    sub: 'QR-Code scannen, fertig. Beantwortet eine Frage, danach kommt die nächste Kategorie.',
    team: 'Team Glühbirnen', skipHint: 'Tippen zum Überspringen',
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
    sub: 'Gleiches Spiel, anderer Abend. Ich stimme Fragen, Länge und Spielart auf eure Runde ab.',
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
    label: 'Der Abend', h2: 'Mehr als eine freie Wand braucht ihr nicht',
    sub: 'Beamer, Sound, Aufbau und Moderation bringe ich mit.',
    priceBig: 'ab 350 €', priceSub: 'für den ganzen Abend',
    wallAltOff: 'Wohnzimmer mit Beamer, Wand noch dunkel',
    welcomeKicker: 'Herzlich willkommen zum', welcomeTitle: 'COZYQUIZ',
    welcomeSub: 'Macht’s euch bequem, gleich geht’s los!',
    bringT: 'Ich bringe mit:', bring: 'Beamer, Sound, Moderation und die Fragen, auf eure Runde abgestimmt.',
    needT: 'Ihr braucht:', need: 'Eine freie Wand, Strom und WLAN. Ein Handy pro Team habt ihr dabei.',
  },
  johannes: {
    kicker: 'Gründer & Quizmaster',
    quote: [
      { t: '„Mein Ziel: Ein Abend voller ' }, { t: 'Aha-Momente', hot: true }, { t: ', ' },
      { t: 'Lacher', hot: true }, { t: ' und guter ' }, { t: 'Stimmung', hot: true },
      { t: ', über den ihr noch lange sprecht."' },
    ],
    photoAlt: 'Johannes, Gründer und Quizmaster von CozyWolf',
  },
  faq: {
    label: 'Fragen', h2: 'Häufige Fragen',
    items: [
      { q: 'Brauche ich eigene Technik?',
        a: 'Nein. Beamer und Sound bringe ich mit, eure Gäste scannen nur einen QR-Code und spielen im Browser. Keine App, kein Login.' },
      { q: 'Für wie viele Personen funktioniert das?',
        a: 'Von der kleinen Runde bis zu 100 Personen. Kleine Gruppen erobern das Spielfeld, große Gruppen treten als Fraktionen an. Das Format passt sich an.' },
      { q: 'Wie lange dauert ein Quiz-Event?',
        a: 'Meist 90 bis 120 Minuten mit mehreren Runden. Die genaue Länge stimme ich vorher mit dir auf deinen Anlass ab.' },
      { q: 'Was kostet das?',
        a: 'Es geht bei 350 € für den ganzen Abend los, mit Technik und Moderation. Der genaue Preis richtet sich nach Personenzahl und Anlass. Schreib mir kurz, worum es geht, dann bekommst du von mir ein faires Angebot.' },
    ],
  },
  form: {
    label: 'Anfragen', h2: 'Lust auf ein Quiz?',
    sub: 'Schreib kurz, worum es geht, ich melde mich mit einem Vorschlag.',
    tabEvent: 'Event anfragen', tabTest: 'Test-Team, gratis',
    priceEvent: 'ab 350 €', noteEvent: 'Moderation, Beamer, Sound und Aufbau sind enthalten. Keine versteckten Posten.',
    priceTest: '0 €', noteTest: 'CozyWolf startet gerade. Deshalb die ersten Runden kostenlos.',
    avail: `Termine ab ${TERMIN_AB.de}.`,
    okTitle: 'Danke, ist angekommen.', okBody: 'Ich melde mich innerhalb von 24 Stunden bei dir.',
    name: 'Name', email: 'E-Mail',
    anlass: 'Anlass', anlassOpts: ['Firma oder Team', 'Private Feier', 'Café, Bar oder Pub', 'Etwas anderes'],
    personen: 'Personen', nachricht: 'Nachricht', nachrichtPh: 'Wann, wo, und was ist der Anlass?',
    submit: 'Anfrage senden', sending: 'Senden …',
    errorPre: 'Da ging etwas schief. Schreib mir gern direkt an ', errorPost: '.',
    privacy1: 'Ich nutze deine Angaben nur, um dir zu antworten. Mehr dazu in der ',
    privacyLink: 'Datenschutzerklärung', privacy2: '.',
  },
  footer: { imprint: 'Impressum', privacy: 'Datenschutz', instagram: 'Instagram', aiNote: 'Stimmungsbilder auf dieser Seite sind KI-erzeugt.' },
  sticky: { label: 'Gratis für Test-Teams', tag: '0 €' },
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
    hooks: ['Knowledge', 'Luck', 'Timing', 'Team spirit', 'Gut feeling'],
    rest: 'isn’t everything.',
    sub: 'The coziest quiz night in Hamburg you’ve ever played.',
    sub2: 'I bring the projector, sound and hosting. You play right on your phones, all you need is a free wall.',
    imgAlt: 'Mood image, AI-generated: guests in a Hamburg bar in front of the quiz screen',
    cta: 'Free for test teams', ctaSub: 'A whole evening, on the house',
    bookQ: 'Rather book directly?', bookCta: 'Request a date →',
    avail: `Hamburg & around · next dates from ${TERMIN_AB.en}`,
  },
  modes: {
    label: 'The formats', h2: 'Two modes, one evening',
    sub: 'Tap a mode to see how it’s played.',
    quizChip: 'up to 30 people',
    quizP: 'The board game night, in small teams. Every correct answer is a move on the board.',
    quizTeams: '4 to 8 teams',
    quizBullets: [
      'Teams of three or four, one phone per team.',
      'It’s not the most tiles that win, but the largest connected area.',
      'Every question you win is a decision.',
    ],
    actIdle: 'Every correct answer is a move on the board.',
    actions: [
      'Claim, Lightbulbs take a free tile',
      'Steal, Pub Crawl Pros take a tile away',
      'Stack, Lightbulbs reinforce their own tile',
      'Joker, Quiz Mafia flips a tile',
    ],
    arenaChip: 'from 25 people',
    arenaP: 'The big round. Everyone plays on their own phone, eight factions compete.',
    arenaFactions: '8 factions',
    arenaBullets: [
      'When joining, everyone picks a faction: Gut Feeling, Lucky Strike, Know-It-Alls and five more.',
      'No game board, but a bar race of the factions.',
      'Scored by the share of correct answers, a faction of eight has no advantage over one of four.',
      'At the end, an award ceremony with five awards and the coronation.',
    ],
  },
  teams: { g: 'Quiz Mafia', p: 'Lightbulbs', y: 'Brainstorm', o: 'Pub Crawl Pros' },
  factions: [
    { name: 'Gut Feeling', color: '#F97316', file: 'bauchgefuehl', p: 92 },
    { name: 'Know-It-Alls', color: '#FACC15', file: 'allwissen', p: 84 },
    { name: 'Last Second', color: '#A855F7', file: 'letztesekunde', p: 71 },
    { name: 'Lucky Strike', color: '#22C55E', file: 'glueckstreffer', p: 63 },
    { name: 'Risk', color: '#EF4444', file: 'risiko', p: 55 },
    { name: 'Improv', color: '#3B82F6', file: 'improvisation', p: 44 },
    { name: 'Objection', color: '#EC4899', file: 'einspruch', p: 36 },
    { name: 'After Hours', color: '#14B8A6', file: 'feierabend', p: 28 },
  ],
  probe: {
    label: 'Question types', h2: 'How you play',
    sub: 'Scan a QR code, done. Answer one question, then the next category comes up.',
    team: 'Team Lightbulbs', skipHint: 'Tap to skip',
    cats: [
      { key: 'mucho', name: 'Mu-Cho', col: '#3B82F6', icon: '/assets/cat-mucho.webp',
        claim: '4 options, only 1 is right. Speed decides.', kind: 'pick',
        q: 'What did Netflix ship before streaming existed?',
        opts: ['DVDs by mail', 'VHS tapes', 'Music CDs', 'Nothing, there was only streaming'], correct: 0,
        fact: 'Netflix started in 1997 as a DVD-by-mail service.' },
      { key: 'schaetzchen', name: 'Schätzchen', col: '#F59E0B', icon: '/assets/cat-schaetzchen.webp',
        claim: 'The closest guess wins. Nearly right counts too.', kind: 'guess',
        q: 'How many bones does an adult human have?', target: 206 },
      { key: 'cheese', name: 'Schau mal!', col: '#8B5CF6', icon: '/assets/cat-cheese.webp',
        claim: 'Recognise the picture and type your answer.', kind: 'pick', photo: true,
        q: 'What’s in the picture?',
        opts: ['Colosseum', 'Acropolis', 'Alhambra', 'Pantheon'], correct: 0,
        fact: 'The Colosseum held around 50,000 spectators.' },
      { key: 'zehn', name: '10 von 10', col: '#22C55E', icon: '/assets/cat-10v10.webp',
        claim: '3 answers, 10 points. All in, or spread them out?', kind: 'points',
        q: 'Who won the 2014 World Cup? Spend 10 points.',
        opts: ['Germany', 'Argentina', 'Brazil'], correct: 0, correctLabel: 'Germany' },
      { key: 'tuete', name: 'Bunte Tüte', col: '#EF4444', icon: '/assets/cat-buntetuete.webp',
        claim: 'Everything that fits no drawer.', kind: 'pick',
        q: 'Which statement is false?',
        opts: ['Honey never spoils', 'Bananas are botanically berries', 'You can see the Great Wall from the Moon', 'A day on Venus is longer than a year on Venus'], correct: 2,
        fact: 'The Great Wall is not visible to the naked eye from the Moon.' },
    ],
    tapHint: 'Tap an answer.', right: 'Correct. ', wrong: 'Not quite. ',
    guessHint: 'Move the slider and submit your guess.', bones: 'bones',
    guessResult: (t, d, near) => `The answer is ${t}. You were ${d} off${near ? ', that wins the round.' : '.'}`,
    guessBtn: 'Submit guess', guessNext: 'Next question coming …',
    pointsHint: 'Spread all 10 points, then we settle up.',
    pointsResult: g => `Germany was correct. You put ${g} of 10 points on it.`,
    pointsLeft: n => `${n} ${n === 1 ? 'point' : 'points'} left to spread`,
    pointsAllSet: 'All 10 points placed',
  },
  anlaesse: {
    label: 'Occasions', h2: 'What’s the occasion?',
    sub: 'Same game, different night. I tune the questions, length and format to your crowd.',
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
    label: 'The evening', h2: 'A free wall is all you need',
    sub: 'I bring the projector, sound, setup and hosting.',
    priceBig: 'from €350', priceSub: 'for the whole evening',
    wallAltOff: 'Living room with projector, wall still dark',
    welcomeKicker: 'A warm welcome to', welcomeTitle: 'COZYQUIZ',
    welcomeSub: 'Make yourselves comfortable, we’re about to start!',
    bringT: 'I bring:', bring: 'Projector, sound, hosting and the questions, tuned to your crowd.',
    needT: 'You need:', need: 'A free wall, power and WiFi. One phone per team, you have that on you.',
  },
  johannes: {
    kicker: 'Founder & quizmaster',
    quote: [
      { t: '“My goal: an evening full of ' }, { t: 'aha moments', hot: true }, { t: ', ' },
      { t: 'laughs', hot: true }, { t: ' and good ' }, { t: 'vibes', hot: true },
      { t: ' that you’ll still talk about.”' },
    ],
    photoAlt: 'Johannes, founder and quizmaster of CozyWolf',
  },
  faq: {
    label: 'Questions', h2: 'Frequently asked questions',
    items: [
      { q: 'Do I need my own equipment?',
        a: 'No. I bring the projector and sound, your guests just scan a QR code and play in the browser. No app, no login.' },
      { q: 'How many people does it work for?',
        a: 'From a small round up to 100 people. Small groups conquer the game board, large groups compete as factions. The format adapts.' },
      { q: 'How long does a quiz event take?',
        a: 'Usually 90 to 120 minutes with several rounds. I agree the exact length with you beforehand to fit your occasion.' },
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
    okTitle: 'Thanks, got it.', okBody: 'I’ll get back to you within 24 hours.',
    name: 'Name', email: 'Email',
    anlass: 'Occasion', anlassOpts: ['Company or team', 'Private party', 'Café, bar or pub', 'Something else'],
    personen: 'People', nachricht: 'Message', nachrichtPh: 'When, where, and what’s the occasion?',
    submit: 'Send request', sending: 'Sending …',
    errorPre: 'Something went wrong. Feel free to email me directly at ', errorPost: '.',
    privacy1: 'I only use your details to reply to you. More in the ',
    privacyLink: 'privacy policy', privacy2: '.',
  },
  footer: { imprint: 'Imprint', privacy: 'Privacy', instagram: 'Instagram', aiNote: 'Mood images on this page are AI-generated.' },
  sticky: { label: 'Free for test teams', tag: '€0' },
};

const DICTS: Record<Lang, MobileDict> = { de, en };

export function mobileT(lang: Lang): MobileDict {
  return DICTS[lang];
}
