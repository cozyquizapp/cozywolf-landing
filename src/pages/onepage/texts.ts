// Saemtliche Texte des One-Pagers, DE aus dem abgenommenen Entwurf
// "Website Rework E4", EN nachgezogen (Repo-Regel: alles zweisprachig).
// Seiten-spezifische Copy lebt bewusst hier statt in src/i18n.ts
// (dort liegen nur die geteilten Bausteine der Unterseiten).
import type { Lang } from '../../lang';

export type QuoteWord = { w: string; hot?: boolean };

export type ProbeDef =
  | { kind: 'pick'; q: string; opts: string[]; correct: number; fact: string }
  | { kind: 'guess'; q: string; target: number; unit: string }
  | { kind: 'points'; q: string; opts: string[]; correct: number; correctLabel: string };

export type OnePageDict = {
  nav: { spielarten: string; probieren: string; ablauf: string; ueber: string; cta: string };
  hero: {
    hooks: string[]; rest: string; sub: string;
    btn0: string; btn0Sub: string; btn1: string; btn1Sub: string;
    availability: string; imgAlt: string;
    phoneApp: string; phoneTeamA: string; phoneTeamB: string; phoneReady: string;
  };
  modes: {
    kicker: string; label: string; h2: string;
    quizChip: string; quizCalm: string; quizLead: string; quizBullets: string[];
    arenaChip: string; arenaCalm: string; arenaLead: string; arenaBullets: string[];
  };
  sim: {
    teams: Record<string, string>;
    questions: { cat: string; col: string; text: string; opts: string[]; correct: number; pick: number }[];
    welcomeKicker: string; welcomeTitle: string; welcomeSub: string;
    answering: string; reveal: string; verbSet: string; verbSteal: string; verbStack: string;
    answeredLine: (n: number) => string;
    field: string; fields: string; lead: string; tied: string;
    factions: Record<string, string>;
    waiting: string; phonesRight: (g: number, hits: number) => string;
  };
  anlaesse: {
    label: string; h2: string; sub: string; cta: string;
    cards: { badge: string; title: string; short: string; desc: string }[];
  };
  kinetic: string;
  probe: {
    kicker: string; label: string; h2: string; sub: string;
    check1: string; check2: string;
    cats: Record<string, { name: string; claim: string; detail: string }>;
    probes: Record<string, ProbeDef>;
    tapAnswer: string; guessFooter: string; guessPlaceholder: string;
    guessBtn: string; guessAgain: string;
    guessNear: (target: string, unit: string, diff: string) => string;
    guessFar: (target: string, unit: string, diff: string) => string;
    pointsLeft: (n: number) => string; pointsSubmit: string; pointsAgain: string;
    pointsResult: (label: string, g: number) => string;
    pointsFooterIdle: string; pointsFooterDone: string;
  };
  ablauf: { label: string; h2: string; sub: string; duo0Title: string; duo0: string[]; duo1Title: string; duo1: string[] };
  johannes: {
    kicker: string; quote: QuoteWord[]; body: string; chips: string[];
    name: string; role: string; photoAlt: string;
  };
  faq: { label: string; h2: string; items: { q: string; a: string }[] };
  form: {
    label: string; h2: string; sub: string; avail: string;
    tabEvent: string; tabTest: string;
    priceBig: string; priceSub: string; priceNote1: string; priceNote2: string;
    testBig: string; testSub: string; testNote1: string; testNote2: string;
    anlass: string; anlassPh: string; personen: string; personenPh: string;
    datum: string; datumPh: string; name: string; email: string;
    stadt: string; stadtPh: string; groesse: string; groesseOpts: string[];
    termin: string; terminPh: string;
    msgEvent: string; msgTest: string;
    sending: string; submitEvent: string; submitTest: string;
    okTitleEvent: string; okBodyEvent: string; okTitleTest: string; okBodyTest: string;
    errorPre: string; errorPost: string;
    privacy1: string; privacyLink: string; privacy2: string;
  };
  footer: { city: string; imprint: string; privacy: string; aiNote: string };
  sticky: string;
};

const de: OnePageDict = {
  nav: { spielarten: 'Spielarten', probieren: 'Ausprobieren', ablauf: 'Ablauf', ueber: 'Über mich', cta: 'Termin anfragen' },
  hero: {
    hooks: ['Wissen', 'Glück', 'Timing', 'Teamgeist', 'Bauchgefühl'],
    rest: 'ist nicht alles.',
    sub: 'Der gemütlichste Quizabend in Hamburg, den ihr je gespielt habt.',
    btn0: 'Gratis für Test-Teams', btn0Sub: 'Ein ganzer Abend, kostenlos',
    btn1: 'Termin anfragen', btn1Sub: 'Unverbindlich, Antwort in 24 Stunden',
    availability: 'Hamburg und Umland · ab 350 € · Termine ab Mitte September',
    imgAlt: 'Stimmungsbild, KI-erzeugt: Gäste in einer Hamburger Bar vor der Quiz-Leinwand',
    phoneApp: 'CozyQuiz', phoneTeamA: 'Glühbirnen', phoneTeamB: 'Quiz-Mafia', phoneReady: 'Bereit',
  },
  modes: {
    kicker: '[ 01 ]', label: 'Die Spielarten', h2: 'Zwei Modi, ein Abend',
    quizChip: 'Bis 30 Personen',
    quizCalm: 'Der Brettspielabend, in kleinen Teams. Jede richtige Antwort ist ein Zug auf dem Feld.',
    quizLead: 'Ihr spielt in Teams zu dritt oder viert an einem Handy, der Beamer ist die Bühne. Wer eine Frage richtig hat, setzt ein Feld.',
    quizBullets: [
      'Nicht wer die meisten Felder hat gewinnt, sondern wer die größte zusammenhängende Fläche hält',
      'Setzen, klauen, stapeln oder Joker',
      'Fünf Kategorien, drei Runden, Finale',
    ],
    arenaChip: 'Über 30 Personen',
    arenaCalm: 'Der große Abend: alle spielen als Fraktionen gegeneinander, live auf der Leinwand.',
    arenaLead: 'Jeder spielt an seinem eigenen Handy, für eine von acht Fraktionen. Frage für Frage wächst der Balken jeder Seite.',
    arenaBullets: [
      'Kein Spielbrett, ein Rennen der Fraktionen',
      'Gewertet wird der Anteil richtiger Antworten, eine Fraktion mit acht Leuten hat keinen Vorteil gegenüber einer mit vier',
      'Zum Schluss fünf Awards und die Krönung',
    ],
  },
  sim: {
    teams: {
      g: 'Quiz-Mafia', p: 'Glühbirnen', y: 'Hirnsturm', o: 'Pub-Crawl-Profis', b: 'Frag-Mich-Was-Leichtes',
    },
    questions: [
      { cat: 'Mu-Cho', col: '#3B82F6', text: 'Was verschickte Netflix, bevor es Streaming gab?',
        opts: ['DVDs per Post', 'Videokassetten', 'Musik-CDs'], correct: 0, pick: 0 },
      { cat: 'Mu-Cho', col: '#3B82F6', text: 'Womit fing Nintendo an?',
        opts: ['Spielkarten', 'Taschenrechner', 'Spielautomaten'], correct: 0, pick: 0 },
      { cat: 'Bunte Tüte', col: '#EF4444', text: 'Welche Aussage stimmt nicht?',
        opts: ['Honig verdirbt nicht', 'Die Chinesische Mauer sieht man vom Mond', 'Bananen sind botanisch Beeren'], correct: 1, pick: 2 },
    ],
    welcomeKicker: 'Herzlich willkommen zum', welcomeTitle: 'COZYQUIZ',
    welcomeSub: 'Macht’s euch bequem, gleich geht’s los!',
    answering: 'Teams antworten', reveal: 'Auflösung',
    verbSet: 'erobert', verbSteal: 'klaut', verbStack: 'stapelt',
    answeredLine: n => `${n}/6 Teams haben geantwortet`,
    field: 'Feld', fields: 'Felder', lead: ' · Führung', tied: ' · Gleichstand',
    factions: {
      bauchgefuehl: 'Bauchgefühl', glueckstreffer: 'Glückstreffer', allwissen: 'Allwissen',
      improvisation: 'Improvisation', feierabend: 'Feierabend', letztesekunde: 'Letzte Sekunde',
      einspruch: 'Einspruch', risiko: 'Risiko',
    },
    waiting: 'wartet auf die Antwort',
    phonesRight: (g, hits) => `+${g}  ${hits}/3 Handys richtig`,
  },
  anlaesse: {
    label: 'Anlässe', h2: 'Für welchen Anlass?',
    sub: 'Gleiches Spiel, anderer Abend. Ich stimme Fragen, Länge und Spielart auf eure Runde ab.',
    cta: 'Anfragen →',
    cards: [
      { badge: 'Team-Event', title: 'Firma oder Team',
        short: 'Abteilungen oder Tische treten als Fraktionen gegeneinander an. Ein fester Ansprechpartner, Rechnung auf die Firma, Ablauf vorher abgestimmt.',
        desc: 'Ich stimme Fragen, Länge und Spielart vorher mit euch ab, moderiere den ganzen Abend und bringe Beamer und Sound mit. Abteilungen oder Tische treten als Fraktionen gegeneinander an. Fester Ansprechpartner, Rechnung auf die Firma.' },
      { badge: 'Geburtstag', title: 'Private Feier',
        short: 'Geburtstag oder Freundeskreis, entspannte Runde, bei der ihr das Spielfeld erobert.',
        desc: 'Ihr sitzt zusammen, ich übernehme den Rest. Auf Wunsch baue ich ein paar Fragen über das Geburtstagskind ein. Ab sechs Personen sinnvoll, nach oben bis dreißig.' },
      { badge: 'Quiz-Nacht', title: 'Café, Bar oder Pub',
        short: 'Ein fester Quiz-Abend gibt euren Gästen einen Grund, unter der Woche zu kommen.',
        desc: 'Teams bleiben den ganzen Abend, bestellen zwischen den Runden und kommen zur nächsten Ausgabe wieder. Der erste Abend bei euch ist kostenlos, danach entscheidet ihr, ob eine feste Reihe daraus wird. Technik bringe ich mit, Format und Konditionen legen wir zusammen fest.' },
    ],
  },
  kinetic: 'STAY COZY. STAY CURIOUS.',
  probe: {
    kicker: 'Fünf Fragetypen, eine Runde', label: 'Ausprobieren',
    h2: 'Genau so sieht es auf eurem Handy aus',
    sub: 'Ein Handy pro Team, QR-Code scannen, fertig. Sucht euch einen Fragetyp aus und spielt ihn hier durch, genau wie am Quizabend.',
    check1: 'Keine App, kein Login, kein Zettel',
    check2: 'Fünf Fragetypen, keine Runde fühlt sich gleich an',
    cats: {
      mucho: { name: 'Mu-Cho', claim: 'Wählt die richtige Antwort.', detail: '4 Optionen, nur 1 ist richtig. Schnelligkeit entscheidet.' },
      schaetzchen: { name: 'Schätzchen', claim: 'Wer schätzt am nächsten dran?', detail: 'Wer am nächsten dran liegt, gewinnt. Knapp dran zählt auch.' },
      cheese: { name: 'Schau mal!', claim: 'Was ist das?', detail: 'Erkennt das Bild und tippt die Antwort ins Handy.' },
      zehn: { name: '10 von 10', claim: 'Verteilt eure Punkte klug.', detail: '3 Antworten, 10 Punkte. Alles auf eine Karte oder streuen?' },
      tuete: { name: 'Bunte Tüte', claim: 'Immer eine Überraschung.', detail: 'Top 5, Reihenfolge, CozyGuessr, Heiße Kartoffel, 4 gewinnt, Bluff.' },
    },
    probes: {
      mucho: { kind: 'pick', q: 'Was verschickte Netflix, bevor es Streaming gab?',
        opts: ['DVDs per Post', 'Videokassetten', 'Musik-CDs', 'Nichts, es gab nur Streaming'], correct: 0,
        fact: 'Netflix startete 1997 als DVD-Versand per Post. Der erste Stream kam erst zehn Jahre später.' },
      cheese: { kind: 'pick', q: 'Was ist auf dem Bild?',
        opts: ['Kolosseum', 'Akropolis', 'Alhambra', 'Pantheon'], correct: 0,
        fact: 'Ins Kolosseum passten rund 50.000 Zuschauer. Gebaut wurde es vor fast 2.000 Jahren.' },
      tuete: { kind: 'pick', q: 'Welche Aussage stimmt nicht?',
        opts: ['Honig verdirbt nicht', 'Bananen sind botanisch Beeren', 'Die Chinesische Mauer sieht man vom Mond', 'Ein Venus-Tag dauert länger als ein Venus-Jahr'], correct: 2,
        fact: 'Vom Mond aus ist die Chinesische Mauer mit bloßem Auge nicht zu erkennen. Die anderen drei stimmen.' },
      schaetzchen: { kind: 'guess', q: 'Wie viele Knochen hat ein erwachsener Mensch?', target: 206, unit: 'Knochen' },
      zehn: { kind: 'points', q: 'Wer gewann die Fußball-WM 2014? Verteilt 10 Punkte.',
        opts: ['Deutschland', 'Argentinien', 'Brasilien'], correct: 0, correctLabel: 'Deutschland' },
    },
    tapAnswer: 'Tippt eure Antwort an',
    guessFooter: 'Wer am nächsten dran liegt, gewinnt',
    guessPlaceholder: 'Eure Schätzung',
    guessBtn: 'Schätzung abgeben', guessAgain: 'Nochmal schätzen',
    guessNear: (t, u, d) => `Richtig: ${t} ${u}. Nur ${d} daneben, das holt Punkte.`,
    guessFar: (t, u, d) => `Richtig: ${t} ${u}. Ihr lagt ${d} daneben.`,
    pointsLeft: n => `Noch ${n} Punkte übrig`,
    pointsSubmit: 'Punkte abgeben', pointsAgain: 'Nochmal verteilen',
    pointsResult: (label, g) => `Richtig war ${label}. Ihr holt ${g} von 10 Punkten.`,
    pointsFooterIdle: 'Verteilt 10 Punkte auf drei Antworten',
    pointsFooterDone: 'Alles auf eine Antwort bringt am meisten, kostet aber alles.',
  },
  ablauf: {
    label: 'Ablauf', h2: 'Mehr als eine freie Wand braucht ihr nicht',
    sub: 'Beamer, Sound, Aufbau und Moderation bringe ich mit.',
    duo0Title: 'Ich bringe mit',
    duo0: ['Beamer und Sound, vorher aufgebaut', 'Moderation den ganzen Abend', 'Fragen, auf eure Runde abgestimmt', 'Das Spiel auf allen Handys'],
    duo1Title: 'Ihr braucht',
    duo1: ['Eine freie Wand oder einen Bildschirm', 'Strom und WLAN für eure Gäste', 'Platz für eure Runde', 'Ein Handy pro Team, das habt ihr dabei'],
  },
  johannes: {
    kicker: 'Gründer & Quizmaster',
    quote: [
      { w: '„Mein' }, { w: 'Ziel:' }, { w: 'Ein' }, { w: 'Abend' }, { w: 'voller' },
      { w: 'Aha-Momente,', hot: true }, { w: 'Lacher', hot: true }, { w: 'und' }, { w: 'guter' },
      { w: 'Stimmung,', hot: true }, { w: 'über' }, { w: 'den' }, { w: 'ihr' }, { w: 'noch' },
      { w: 'lange' }, { w: 'sprecht."' },
    ],
    body: 'Ich bin Johannes und moderiere jeden Abend selbst. Technik, Aufbau und die Fragen kommen von mir.',
    chips: ['Persönliche Moderation vor Ort', 'Für Gruppen von 10 bis 100 Personen', 'Individuell auf eure Gruppe abgestimmt', 'Region Hamburg und Umland'],
    name: 'Johannes', role: 'Gründer & Quizmaster',
    photoAlt: 'Johannes, Quizmaster von CozyWolf',
  },
  faq: {
    label: 'Fragen', h2: 'Häufige Fragen',
    items: [
      { q: 'Brauche ich eigene Technik?',
        a: 'Nein. Ich bringe Beamer und Sound selbst mit. Ihr braucht nur eine freie Wand oder einen Bildschirm, Strom und WLAN für deine Gäste.' },
      { q: 'Müssen meine Gäste etwas installieren?',
        a: 'Nichts. Alle scannen einen QR-Code und spielen direkt im Browser am Handy. Keine App, kein Login.' },
      { q: 'Für wie viele Personen funktioniert das?',
        a: 'Von der kleinen Runde bis zu 100 Personen. Kleine Gruppen erobern das Spielfeld, große Gruppen treten als Fraktionen an. Das Format passt sich an.' },
      { q: 'Wie lange dauert ein Quiz-Event?',
        a: 'Meist 90 bis 120 Minuten mit mehreren Runden. Die genaue Länge stimme ich vorher mit dir auf deinen Anlass ab.' },
      { q: 'Wie weit fährst du?',
        a: 'Ich bin in Hamburg und im Umland unterwegs. Für weiter entfernte Anfragen melde dich einfach kurz, meist lässt sich etwas einrichten.' },
      { q: 'Was kostet das?',
        a: 'Es geht bei 350 € für den ganzen Abend los, mit Technik und Moderation. Der genaue Preis richtet sich nach Personenzahl und Anlass. Schreib mir kurz, worum es geht, dann bekommst du von mir ein faires Angebot.' },
    ],
  },
  form: {
    label: 'Anfragen', h2: 'Lust auf ein Quiz?',
    sub: 'Schreib mir kurz zum Anlass und zur ungefähren Personenzahl, dann melde ich mich mit einem Vorschlag.',
    avail: 'Termine ab Mitte September.',
    tabEvent: 'Event anfragen', tabTest: 'Test-Team, kostenlos',
    priceBig: 'ab 350 €', priceSub: 'für den ganzen Abend',
    priceNote1: 'Moderation, Beamer, Sound und Aufbau', priceNote2: 'sind enthalten. Keine versteckten Posten.',
    testBig: '0 €', testSub: 'der ganze Abend',
    testNote1: 'CozyWolf startet gerade.', testNote2: 'Deshalb die ersten Runden kostenlos.',
    anlass: 'Anlass', anlassPh: 'Firmenevent, Geburtstag, Pub-Quiz …',
    personen: 'Ungefähre Personenzahl', personenPh: 'z. B. 40',
    datum: 'Wunsch-Datum oder Zeitraum', datumPh: 'z. B. Freitag im November',
    name: 'Dein Name', email: 'E-Mail für die Antwort',
    stadt: 'Stadt / Region', stadtPh: 'z. B. Hamburg',
    groesse: 'Wie viele seid ihr?',
    groesseOpts: ['6–10 Leute', 'Mehr als 10', 'Weniger als 6', 'Weiß ich noch nicht'],
    termin: 'Wann würde es passen?', terminPh: 'z. B. ein Freitag im Dezember, abends',
    msgEvent: 'Nachricht (optional)', msgTest: 'Noch was? (optional)',
    sending: 'Senden …', submitEvent: 'Anfrage absenden', submitTest: 'Als Test-Team anmelden',
    okTitleEvent: 'Danke, ist angekommen!',
    okBodyEvent: 'Ich melde mich mit einem Vorschlag bei dir. Meist geht das schnell.',
    okTitleTest: 'Ihr seid dabei!',
    okBodyTest: 'Ich melde mich mit einem Terminvorschlag, meist geht das schnell. Euer Quizabend geht aufs Haus.',
    errorPre: 'Da ging etwas schief. Schreib mir gern direkt an ', errorPost: '.',
    privacy1: 'Mit dem Absenden verarbeite ich deine Angaben, um deine Anfrage zu beantworten. Mehr dazu in der ',
    privacyLink: 'Datenschutzerklärung', privacy2: '.',
  },
  footer: { city: 'CozyWolf, Hamburg', imprint: 'Impressum', privacy: 'Datenschutz', aiNote: 'Stimmungsbilder auf dieser Seite sind KI-erzeugt.' },
  sticky: 'Termin anfragen',
};

const en: OnePageDict = {
  nav: { spielarten: 'Formats', probieren: 'Try it', ablauf: 'How it works', ueber: 'About me', cta: 'Request a date' },
  hero: {
    hooks: ['Knowledge', 'Luck', 'Timing', 'Team spirit', 'Gut feeling'],
    rest: 'isn’t everything.',
    sub: 'The coziest quiz night in Hamburg you’ve ever played.',
    btn0: 'Free for test teams', btn0Sub: 'A whole evening, on the house',
    btn1: 'Request a date', btn1Sub: 'No strings attached, reply within 24 hours',
    availability: 'Hamburg and around · from €350 · dates from mid-September',
    imgAlt: 'Mood image, AI-generated: guests in a Hamburg bar in front of the quiz screen',
    phoneApp: 'CozyQuiz', phoneTeamA: 'Lightbulbs', phoneTeamB: 'Quiz Mafia', phoneReady: 'Ready',
  },
  modes: {
    kicker: '[ 01 ]', label: 'The formats', h2: 'Two modes, one evening',
    quizChip: 'Up to 30 people',
    quizCalm: 'The board game night, in small teams. Every correct answer is a move on the board.',
    quizLead: 'You play in teams of three or four around one phone, the projector is the stage. Answer correctly, claim a tile.',
    quizBullets: [
      'It’s not the most tiles that wins, but the largest connected area',
      'Claim, steal, stack or play a joker',
      'Five categories, three rounds, a finale',
    ],
    arenaChip: 'Over 30 people',
    arenaCalm: 'The big night: everyone plays as factions against each other, live on the big screen.',
    arenaLead: 'Everyone plays on their own phone, for one of eight factions. Question by question, each side’s bar grows.',
    arenaBullets: [
      'No game board, a race of factions',
      'Scored by the share of correct answers, a faction of eight has no advantage over one of four',
      'Five awards and the coronation at the end',
    ],
  },
  sim: {
    teams: {
      g: 'Quiz Mafia', p: 'Lightbulbs', y: 'Brainstorm', o: 'Pub Crawl Pros', b: 'Ask-Me-Something-Easy',
    },
    questions: [
      { cat: 'Mu-Cho', col: '#3B82F6', text: 'What did Netflix ship before streaming existed?',
        opts: ['DVDs by mail', 'VHS tapes', 'Music CDs'], correct: 0, pick: 0 },
      { cat: 'Mu-Cho', col: '#3B82F6', text: 'How did Nintendo start?',
        opts: ['Playing cards', 'Calculators', 'Slot machines'], correct: 0, pick: 0 },
      { cat: 'Bunte Tüte', col: '#EF4444', text: 'Which statement is false?',
        opts: ['Honey never spoils', 'You can see the Great Wall from the Moon', 'Bananas are botanically berries'], correct: 1, pick: 2 },
    ],
    welcomeKicker: 'A warm welcome to', welcomeTitle: 'COZYQUIZ',
    welcomeSub: 'Make yourselves comfortable, we’re about to start!',
    answering: 'Teams answering', reveal: 'Reveal',
    verbSet: 'claims a tile', verbSteal: 'steals one', verbStack: 'stacks up',
    answeredLine: n => `${n}/6 teams have answered`,
    field: 'tile', fields: 'tiles', lead: ' · in the lead', tied: ' · tied',
    factions: {
      bauchgefuehl: 'Gut Feeling', glueckstreffer: 'Lucky Strike', allwissen: 'Know-It-Alls',
      improvisation: 'Improv', feierabend: 'After Hours', letztesekunde: 'Last Second',
      einspruch: 'Objection', risiko: 'Risk',
    },
    waiting: 'waiting for the answer',
    phonesRight: (g, hits) => `+${g}  ${hits}/3 phones right`,
  },
  anlaesse: {
    label: 'Occasions', h2: 'What’s the occasion?',
    sub: 'Same game, different night. I tune the questions, length and format to your crowd.',
    cta: 'Enquire →',
    cards: [
      { badge: 'Team event', title: 'Company or team',
        short: 'Departments or tables compete as factions. One fixed contact person, invoice to the company, agenda agreed beforehand.',
        desc: 'I agree the questions, length and format with you in advance, host the whole evening and bring the projector and sound. Departments or tables compete as factions. Fixed contact person, invoice to the company.' },
      { badge: 'Birthday', title: 'Private party',
        short: 'Birthday or friend group, a relaxed round where you conquer the game board.',
        desc: 'You sit together, I take care of the rest. On request I’ll add a few questions about the birthday guest. Works from six people, up to thirty.' },
      { badge: 'Quiz night', title: 'Café, bar or pub',
        short: 'A regular quiz night gives your guests a reason to come in midweek.',
        desc: 'Teams stay all evening, order between rounds and come back for the next edition. Your first night is free, then you decide whether it becomes a regular series. I bring the tech, we agree format and terms together.' },
    ],
  },
  kinetic: 'STAY COZY. STAY CURIOUS.',
  probe: {
    kicker: 'Five question types, one round', label: 'Try it',
    h2: 'This is exactly what it looks like on your phone',
    sub: 'One phone per team, scan a QR code, done. Pick a question type and play it through, just like on quiz night.',
    check1: 'No app, no login, no paper',
    check2: 'Five question types, no round feels the same',
    cats: {
      mucho: { name: 'Mu-Cho', claim: 'Pick the right answer.', detail: '4 options, only 1 is right. Speed decides.' },
      schaetzchen: { name: 'Schätzchen', claim: 'Who guesses closest?', detail: 'The closest guess wins. Nearly right counts too.' },
      cheese: { name: 'Schau mal!', claim: 'What is that?', detail: 'Recognise the picture and type your answer on the phone.' },
      zehn: { name: '10 von 10', claim: 'Spend your points wisely.', detail: '3 answers, 10 points. All in, or spread them out?' },
      tuete: { name: 'Bunte Tüte', claim: 'Always a surprise.', detail: 'Top 5, ordering, CozyGuessr, hot potato, connect four, bluff.' },
    },
    probes: {
      mucho: { kind: 'pick', q: 'What did Netflix ship before streaming existed?',
        opts: ['DVDs by mail', 'VHS tapes', 'Music CDs', 'Nothing, there was only streaming'], correct: 0,
        fact: 'Netflix started in 1997 as a DVD-by-mail service. The first stream came ten years later.' },
      cheese: { kind: 'pick', q: 'What’s in the picture?',
        opts: ['Colosseum', 'Acropolis', 'Alhambra', 'Pantheon'], correct: 0,
        fact: 'The Colosseum held around 50,000 spectators. It was built almost 2,000 years ago.' },
      tuete: { kind: 'pick', q: 'Which statement is false?',
        opts: ['Honey never spoils', 'Bananas are botanically berries', 'You can see the Great Wall from the Moon', 'A day on Venus is longer than a year on Venus'], correct: 2,
        fact: 'The Great Wall is not visible to the naked eye from the Moon. The other three are true.' },
      schaetzchen: { kind: 'guess', q: 'How many bones does an adult human have?', target: 206, unit: 'bones' },
      zehn: { kind: 'points', q: 'Who won the 2014 World Cup? Spend 10 points.',
        opts: ['Germany', 'Argentina', 'Brazil'], correct: 0, correctLabel: 'Germany' },
    },
    tapAnswer: 'Tap your answer',
    guessFooter: 'The closest guess wins',
    guessPlaceholder: 'Your guess',
    guessBtn: 'Submit guess', guessAgain: 'Guess again',
    guessNear: (t, u, d) => `Correct: ${t} ${u}. Only ${d} off, that scores.`,
    guessFar: (t, u, d) => `Correct: ${t} ${u}. You were ${d} off.`,
    pointsLeft: n => `${n} points left`,
    pointsSubmit: 'Submit points', pointsAgain: 'Spread again',
    pointsResult: (label, g) => `${label} was correct. You take ${g} of 10 points.`,
    pointsFooterIdle: 'Spread 10 points across three answers',
    pointsFooterDone: 'All-in scores the most, but costs everything.',
  },
  ablauf: {
    label: 'How it works', h2: 'A free wall is all you need',
    sub: 'I bring the projector, sound, setup and hosting.',
    duo0Title: 'I bring',
    duo0: ['Projector and sound, set up beforehand', 'Hosting all evening', 'Questions tuned to your crowd', 'The game on all phones'],
    duo1Title: 'You need',
    duo1: ['A free wall or a screen', 'Power and WiFi for your guests', 'Room for your crowd', 'One phone per team, you already have that'],
  },
  johannes: {
    kicker: 'Founder & quizmaster',
    quote: [
      { w: '“My' }, { w: 'goal:' }, { w: 'an' }, { w: 'evening' }, { w: 'full' }, { w: 'of' },
      { w: 'aha moments,', hot: true }, { w: 'laughs', hot: true }, { w: 'and' }, { w: 'good' },
      { w: 'vibes,', hot: true }, { w: 'that' }, { w: 'you’ll' }, { w: 'still' }, { w: 'talk' }, { w: 'about.”' },
    ],
    body: 'I’m Johannes and I host every evening myself. The tech, the setup and the questions come from me.',
    chips: ['Personal hosting on site', 'For groups of 10 to 100 people', 'Tailored to your group', 'Hamburg and around'],
    name: 'Johannes', role: 'Founder & quizmaster',
    photoAlt: 'Johannes, quizmaster of CozyWolf',
  },
  faq: {
    label: 'Questions', h2: 'Frequently asked questions',
    items: [
      { q: 'Do I need my own equipment?',
        a: 'No. I bring the projector and sound myself. You only need a free wall or a screen, power and WiFi for your guests.' },
      { q: 'Do my guests have to install anything?',
        a: 'Nothing. Everyone scans a QR code and plays right in the browser on their phone. No app, no login.' },
      { q: 'How many people does it work for?',
        a: 'From a small round up to 100 people. Small groups conquer the game board, large groups compete as factions. The format adapts.' },
      { q: 'How long does a quiz event take?',
        a: 'Usually 90 to 120 minutes with several rounds. I agree the exact length with you beforehand to fit your occasion.' },
      { q: 'How far do you travel?',
        a: 'I’m based in Hamburg and the surrounding area. For requests further out, just drop me a line, usually something can be arranged.' },
      { q: 'What does it cost?',
        a: 'It starts at €350 for the whole evening, including tech and hosting. The exact price depends on headcount and occasion. Tell me briefly what you have in mind and you’ll get a fair offer.' },
    ],
  },
  form: {
    label: 'Requests', h2: 'Up for a quiz?',
    sub: 'Drop me a line about the occasion and rough headcount, and I’ll get back to you with a proposal.',
    avail: 'Dates from mid-September.',
    tabEvent: 'Request an event', tabTest: 'Test team, free',
    priceBig: 'from €350', priceSub: 'for the whole evening',
    priceNote1: 'Hosting, projector, sound and setup', priceNote2: 'are included. No hidden extras.',
    testBig: '€0', testSub: 'the whole evening',
    testNote1: 'CozyWolf is just getting started.', testNote2: 'That’s why the first rounds are free.',
    anlass: 'Occasion', anlassPh: 'Company event, birthday, pub quiz …',
    personen: 'Rough headcount', personenPh: 'e.g. 40',
    datum: 'Preferred date or timeframe', datumPh: 'e.g. a Friday in November',
    name: 'Your name', email: 'Email for the reply',
    stadt: 'City / region', stadtPh: 'e.g. Hamburg',
    groesse: 'How many are you?',
    groesseOpts: ['6–10 people', 'More than 10', 'Fewer than 6', 'Don’t know yet'],
    termin: 'When would suit you?', terminPh: 'e.g. a Friday evening in December',
    msgEvent: 'Message (optional)', msgTest: 'Anything else? (optional)',
    sending: 'Sending …', submitEvent: 'Send request', submitTest: 'Sign up as a test team',
    okTitleEvent: 'Thanks, got it!',
    okBodyEvent: 'I’ll get back to you with a proposal. Usually quickly.',
    okTitleTest: 'You’re in!',
    okBodyTest: 'I’ll get back to you with a date proposal, usually quickly. Your quiz night is on the house.',
    errorPre: 'Something went wrong. Feel free to email me directly at ', errorPost: '.',
    privacy1: 'By sending, I process your details to answer your request. More in the ',
    privacyLink: 'privacy policy', privacy2: '.',
  },
  footer: { city: 'CozyWolf, Hamburg', imprint: 'Imprint', privacy: 'Privacy', aiNote: 'Mood images on this page are AI-generated.' },
  sticky: 'Request a date',
};

const DICTS: Record<Lang, OnePageDict> = { de, en };

export function onePageT(lang: Lang): OnePageDict {
  return DICTS[lang];
}
