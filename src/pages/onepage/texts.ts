// Saemtliche Texte des One-Pagers, DE aus dem abgenommenen Entwurf
// "Website Rework E4", EN nachgezogen (Repo-Regel: alles zweisprachig).
// Seiten-spezifische Copy lebt bewusst hier statt in src/i18n.ts
// (dort liegen nur die geteilten Bausteine der Unterseiten).
import type { Lang } from '../../lang';
import { GEMEINSAM as G } from './gemeinsam';

// Einzige Stelle fuer die Termin-Angabe (Handoff 0b): steckt in Hero-Zeile und
// Formular-Hinweis beider Fassungen. Aendert sich die Verfuegbarkeit, nur hier.
export const TERMIN_AB = { de: 'Mitte September', en: 'mid-September' } as const;

export type QuoteWord = { w: string; hot?: boolean };

export type ProbeDef =
  | { kind: 'pick'; q: string; opts: string[]; correct: number; fact: string }
  | { kind: 'guess'; q: string; target: number; unit: string }
  | { kind: 'points'; q: string; opts: string[]; correct: number; correctLabel: string }
  /**
   * Fix It, eines der vier Unterspiele der Bunten Tuete. `items` steht in der
   * richtigen Reihenfolge, `start` ist die Reihenfolge, in der die Karten auf
   * dem Handy liegen. Damit ist die Loesung im Text lesbar und die Anzeige
   * trotzdem gemischt.
   */
  | { kind: 'order'; spiel: string; q: string; items: string[]; start: number[]; fact: string };

export type OnePageDict = {
  nav: { spielarten: string; probieren: string; ablauf: string; ueber: string; cta: string };
  hero: {
    kicker: string; hooks: string[]; rest: string; sub: string;
    btn0: string; btn0Sub: string; btn1: string; btn1Sub: string;
    availability: string;
    phoneApp: string; phoneTeamA: string; phoneTeamB: string; phoneReady: string;
  };
  modes: {
    kicker: string; label: string; h2: string;
    quizChip: string; quizCalm: string; quizLead: string; quizBullets: string[];
    arenaChip: string; arenaCalm: string; arenaLead: string; arenaBullets: string[];
    avZeile: string; avAria: string;
  };
  sim: {
    teams: Record<string, string>;
    questions: {
      /** mucho: eine richtige Antwort. zehn: 10 Punkte verteilen. schaetz: eine Zahl raten. */
      art: 'mucho' | 'zehn' | 'schaetz';
      cat: string; col: string; text: string; opts: string[]; correct: number;
      /** Nur bei schaetz: die Loesung und ihre Einheit. */
      loesung?: string; einheit?: string;
      /** Nur bei zehn: wie die drei Teams ihre zehn Punkte verteilt haben. */
      punkte?: number[][];
    }[];
    welcomeKicker: string; welcomeTitle: string; welcomeSub: string;
    answering: string; reveal: string; verbSet: string; verbSteal: string; verbStack: string;
    answeredLine: (n: number, ges: number) => string;
    field: string; fields: string; lead: string; tied: string;
    factions: Record<string, string>;
    mottos: Record<string, string>;
    waiting: string; phonesRight: (g: number, hits: number) => string;
  };
  anlaesse: {
    label: string; h2: string; sub: string; cta: string;
    cards: { badge: string; title: string; short: string; desc: string }[];
  };
  kinetic: string;
  probe: {
    kicker: string; label: string; h2: string; sub: string;
    check1: string; check2: string; zurueck: string; weiter: string;
    cats: Record<string, { name: string; claim: string; detail: string }>;
    probes: Record<string, ProbeDef>;
    tapAnswer: string; guessFooter: string; guessPlaceholder: string;
    guessBtn: string; guessAgain: string;
    guessNear: (target: string, unit: string, diff: string) => string;
    guessFar: (target: string, unit: string, diff: string) => string;
    pointsLeft: (n: number) => string; pointsSubmit: string; pointsAgain: string;
    pointsResult: (label: string, g: number) => string;
    pointsFooterIdle: string; pointsFooterDone: string;
    ordHint: string; ordAgain: string; ordResult: (richtig: number, ges: number) => string;
    weiterZu: (name: string) => string;
  };
  ablauf: { label: string; h2: string; sub: string; wandHint: string; duo0Title: string; duo0: string[]; duo1Title: string; duo1: string[] };
  johannes: {
    kicker: string; quote: QuoteWord[]; body: string;
    name: string; role: string; photoAlt: string;
  };
  faq: { label: string; h2: string; items: { q: string; a: string }[] };
  form: {
    label: string; h2: string; sub: string; avail: string;
    tabEvent: string; tabTest: string; wahl: string;
    priceBig: string; priceSub: string; priceNote1: string; priceNote2: string;
    testBig: string; testSub: string; testNote1: string; testNote2: string;
    anlass: string; anlassPh: string; personen: string; personenPh: string;
    datum: string; datumPh: string; name: string; email: string;
    stadt: string; stadtPh: string; groesse: string; groesseOpts: string[];
    termin: string; terminPh: string;
    msgEvent: string; msgTest: string; mehr: string; direkt: string;
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
    kicker: 'Moderiertes Live-Quiz in Hamburg',
    hooks: ['Wissen', 'Glück', 'Timing', 'Teamgeist', 'Bauchgefühl'],
    rest: 'ist nicht alles.',
    sub: G.de.heroSub,
    btn0: 'Gratis für Test-Teams', btn0Sub: G.de.ctaSub,
    btn1: 'Termin anfragen', btn1Sub: 'Unverbindliche Antwort',
    availability: `Ab 350 € · Termine ab ${TERMIN_AB.de}`,
    phoneApp: 'CozyQuiz', phoneTeamA: 'Glühbirnen', phoneTeamB: 'Quiz-Mafia', phoneReady: 'Bereit',
  },
  modes: {
    kicker: '[ 01 ]', label: 'Die Spielarten', h2: 'Zwei Modi, ein Abend',
    quizChip: 'Bis 40 Personen',
    quizCalm: G.de.quizCalm,
    quizLead: 'Ihr spielt in Teams zu viert oder fünft an einem Handy, der Beamer ist die Bühne. Wer eine Frage richtig hat, setzt ein Feld.',
    quizBullets: [
      'Nicht wer die meisten Felder hat gewinnt, sondern wer die größte zusammenhängende Fläche hält',
      'Setzen, klauen, stapeln oder Joker',
      'Fünf Kategorien, drei Runden, Finale',
    ],
    avZeile: 'Sucht euch ein Team-Emoji aus',
    avAria: 'Team-Zeichen durchwechseln',
    arenaChip: 'Ab 40 Personen',
    arenaCalm: 'Der große Abend: alle spielen als Fraktionen gegeneinander, live auf der Leinwand.',
    arenaLead: 'Ihr spielt wie im CozyQuiz in Teams an einem Handy, nur gehört jedes Team zu einer von acht Fraktionen. Eine Fraktion fasst bis zu fünf Teams. Frage für Frage verschiebt sich die Rangfolge.',
    arenaBullets: [
      'Kein Spielbrett, ein Rennen der Fraktionen',
      'Gewertet wird der Anteil richtiger Antworten, eine Fraktion mit acht Leuten hat keinen Vorteil gegenüber einer mit vier',
      'Zum Schluss fünf Awards und die Krönung',
    ],
  },
  sim: {
    teams: {
      // Die Schluessel sind die der drei Teams auf dem Brett (d = Donut,
      // s = Erdbeere, b = Papierboot). Vorher standen hier g, p, y, o und b
      // aus dem alten Sechserfeld, und weil d und s darin fehlten, blieben im
      // Spielstand zwei von drei Namen leer.
      d: 'Quiz-Mafia', s: 'Pub-Crawl-Profis', b: 'Frag-Mich-Was-Leichtes',
    },
    /* Wolf am 28.08.: "bitte einmal mucho und einmal 10 v 10 und einmal
       schaetzchen, nicht 3 mal mucho? geht das?" Ja, aber nicht durch ein
       anderes Etikett auf derselben Folie -- genau das war der Fehler, den er
       bei Station 03 zu Recht angestrichen hat. Die drei Kategorien spielen
       verschieden, also sieht die Folie fuer jede anders aus: Mu-Cho waehlt
       eine Antwort, 10 von 10 verteilt zehn Punkte auf die drei, Schaetzchen
       hat gar keine Antworten, sondern eine Zahl. */
    questions: [
      { art: 'mucho', cat: 'Mu-Cho', col: '#3B82F6', text: 'Was verschickte Netflix, bevor es Streaming gab?',
        opts: ['DVDs per Post', 'Videokassetten', 'Musik-CDs'], correct: 0 },
      { art: 'zehn', cat: '10 von 10', col: '#22C55E', text: 'Welches Land hat die meisten Zeitzonen?',
        opts: ['Russland', 'USA', 'Frankreich'], correct: 2,
        punkte: [[6, 3, 1], [2, 2, 6], [3, 0, 7]] },
      { art: 'schaetz', cat: 'Schätzchen', col: '#F59E0B', text: 'Wie hoch ist der Michel?',
        opts: [], correct: 0, loesung: '132', einheit: 'Meter' },
    ],
    welcomeKicker: 'Herzlich willkommen zum', welcomeTitle: 'COZYQUIZ',
    welcomeSub: 'Macht’s euch bequem, gleich geht’s los!',
    answering: 'Teams antworten', reveal: 'Auflösung',
    verbSet: 'erobert', verbSteal: 'klaut', verbStack: 'stapelt',
    answeredLine: (n, ges) => `${n}/${ges} Teams haben geantwortet`,
    field: 'Feld', fields: 'Felder', lead: ' · Führung', tied: ' · Gleichstand',
    factions: {
      bauchgefuehl: 'Bauchgefühl', glueckstreffer: 'Glückstreffer', allwissen: 'Allwissen',
      improvisation: 'Improvisation', feierabend: 'Feierabend', letztesekunde: 'Letzte Sekunde',
      einspruch: 'Einspruch', risiko: 'Risiko',
    },
    // Woertlich aus der App: KioskQuiz shared/quarterQuizTypes.ts,
    // QQ_MEGA_FACTIONS, Felder mottoDe und mottoEn. Nicht neu erfunden.
    mottos: {
      bauchgefuehl: 'Das Gefühl trügt nie.', glueckstreffer: 'Hauptsache richtig.',
      allwissen: 'Wir wissen es einfach.', improvisation: 'Läuft schon irgendwie.',
      feierabend: 'Hauptsache dabei.', letztesekunde: 'Kurz vor knapp.',
      einspruch: 'Das zählt nicht!', risiko: 'Alles oder nichts.',
    },
    waiting: 'wartet auf die Antwort',
    phonesRight: (g, hits) => `+${g}  ${hits}/3 Handys richtig`,
  },
  anlaesse: {
    label: 'Anlässe', h2: 'Für welchen Anlass?',
    sub: G.de.anlaesseSub,
    cta: 'Anfragen →',
    cards: [
      { badge: 'Team-Event', title: 'Firma oder Team',
        short: 'Abteilungen oder Tische treten als Fraktionen gegeneinander an. Ein fester Ansprechpartner, Rechnung auf die Firma, Ablauf vorher abgestimmt.',
        desc: 'Ich stimme Fragen, Länge und Spielart vorher mit euch ab, moderiere den ganzen Abend und bringe Beamer und Sound mit. Abteilungen oder Tische treten als Fraktionen gegeneinander an. Fester Ansprechpartner, Rechnung auf die Firma.' },
      { badge: 'Geburtstag', title: 'Private Feier',
        short: 'Geburtstag oder Freundeskreis, entspannte Runde, bei der ihr das Spielfeld erobert.',
        desc: 'Ihr sitzt zusammen, ich übernehme den Rest. Auf Wunsch baue ich ein paar Fragen über das Geburtstagskind ein. Ab sechs Personen sinnvoll, nach oben bis vierzig.' },
      { badge: 'Quiz-Nacht', title: 'Café, Bar oder Pub',
        short: 'Ein fester Quiz-Abend gibt euren Gästen einen Grund, unter der Woche zu kommen.',
        desc: 'Teams bleiben den ganzen Abend, bestellen zwischen den Runden und kommen zur nächsten Ausgabe wieder. Der erste Abend bei euch ist kostenlos, danach entscheidet ihr, ob eine feste Reihe daraus wird. Technik bringe ich mit, Format und Konditionen legen wir zusammen fest.' },
    ],
  },
  kinetic: 'STAY COZY. STAY CURIOUS.',
  // 2026-08-27: die Ueberschrift hiess "Genau so sieht es auf eurem Handy
  // aus". Das Handy auf dieser Seite ist aber eine Nachbildung, kein Abbild
  // der Teamansicht der App, und die wird gerade ohnehin neu gestaltet. Was
  // die Seite wirklich einloest, ist die Mechanik: es sind dieselben fuenf
  // Fragetypen und dieselben Regeln, und man spielt sie durch. Also
  // verspricht die Ueberschrift jetzt das. Sobald die Teamansicht steht und
  // wir sie eins zu eins nachbauen, darf hier wieder "genau so" stehen.
  probe: {
    kicker: 'Fünf Fragetypen, eine Runde', label: 'Ausprobieren',
    h2: 'So spielt ihr am Handy mit',
    sub: 'Ein Handy pro Team, QR-Code scannen, fertig. Sucht euch einen Fragetyp aus und spielt ihn hier durch, genau wie am Quizabend.',
    zurueck: 'Zurück', weiter: 'Weiter',
    check1: 'Keine App, kein Login, kein Zettel',
    check2: 'Fünf Fragetypen, keine Runde fühlt sich gleich an',
    cats: {
      mucho: { name: 'Mu-Cho', claim: 'Wählt die richtige Antwort.', detail: '4 Optionen, nur 1 ist richtig. Schnelligkeit entscheidet.' },
      schaetzchen: { name: 'Schätzchen', claim: 'Wer schätzt am nächsten dran?', detail: 'Wer am nächsten dran liegt, gewinnt. Knapp dran zählt auch.' },
      cheese: { name: 'Schau mal!', claim: 'Was ist das?', detail: 'Erkennt das Bild und tippt die Antwort ins Handy.' },
      zehn: { name: '10 von 10', claim: 'Verteilt eure Punkte klug.', detail: '3 Antworten, 10 Punkte. Alles auf eine Karte oder streuen?' },
      tuete: { name: 'Bunte Tüte', claim: 'Immer eine Überraschung.', detail: 'Heiße Kartoffel, Top 5, Fix It, Pin It. Was kommt, sagt vorher keiner.' },
    },
    probes: {
      mucho: { kind: 'pick', q: 'Was verschickte Netflix, bevor es Streaming gab?',
        opts: ['DVDs per Post', 'Videokassetten', 'Musik-CDs', 'Nichts, es gab nur Streaming'], correct: 0,
        fact: 'Netflix startete 1997 als DVD-Versand per Post. Der erste Stream kam erst zehn Jahre später.' },
      cheese: { kind: 'pick', q: 'Was ist auf dem Bild?',
        opts: ['Kolosseum', 'Akropolis', 'Alhambra', 'Pantheon'], correct: 0,
        fact: 'Ins Kolosseum passten rund 50.000 Zuschauer. Gebaut wurde es vor fast 2.000 Jahren.' },
      tuete: { kind: 'order', spiel: 'Fix It', q: 'Sortiert nach Erfindung, das Älteste zuerst.',
        items: ['Buchdruck', 'Dampfmaschine', 'Telefon', 'Internet'], start: [2, 0, 3, 1],
        fact: 'Buchdruck 1450, Dampfmaschine 1712, Telefon 1876, Internet 1983.' },
      schaetzchen: { kind: 'guess', q: 'Wie viele Knochen hat ein erwachsener Mensch?', target: 206, unit: 'Knochen' },
      zehn: { kind: 'points', q: 'Welches Land hat die meisten Zeitzonen? Verteilt 10 Punkte.',
        opts: ['Russland', 'USA', 'Frankreich'], correct: 2, correctLabel: 'Frankreich' },
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
    ordHint: 'Tippt sie in die richtige Reihenfolge',
    ordAgain: 'Nochmal sortieren',
    ordResult: (richtig, ges) => `${richtig} von ${ges} an der richtigen Stelle.`,
    weiterZu: name => `Weiter zu ${name}`,
  },
  ablauf: {
    label: 'Ablauf', h2: G.de.ablaufH2,
    sub: G.de.ablaufSub,
    wandHint: 'Zeig auf die Wand, dann läuft eine Runde',
    duo0Title: 'Ich bringe mit',
    duo0: ['Beamer und Sound, vorher aufgebaut', 'Moderation den ganzen Abend', 'Fragen, auf eure Runde abgestimmt', 'Das Spiel auf allen Handys'],
    duo1Title: 'Ihr braucht',
    duo1: ['Eine freie Wand oder einen Bildschirm', 'Strom und WLAN für eure Gäste', 'Platz für eure Runde', 'Ein Handy pro Team, das habt ihr dabei'],
  },
  johannes: {
    kicker: 'Über mich',
    quote: [
      { w: '„Mein' }, { w: 'Ziel:' }, { w: 'Ein' }, { w: 'Abend' }, { w: 'voller' },
      { w: 'Aha-Momente,', hot: true }, { w: 'Lacher', hot: true }, { w: 'und' }, { w: 'guter' },
      { w: 'Stimmung,', hot: true }, { w: 'über' }, { w: 'den' }, { w: 'ihr' }, { w: 'noch' },
      { w: 'lange' }, { w: 'sprecht."' },
    ],
    body: 'Ich bin Johannes und moderiere jeden Abend selbst. Technik, Aufbau und die Fragen kommen von mir.',
    name: 'Johannes', role: 'Gründer & Quizmaster',
    photoAlt: 'Johannes, Quizmaster von CozyWolf',
  },
  faq: {
    label: 'Fragen', h2: 'Häufige Fragen',
    items: [
      { q: G.de.faqTechnikQ,
        a: 'Nein. Ich bringe Beamer und Sound selbst mit. Du brauchst nur eine freie Wand oder einen Bildschirm, Strom und WLAN für deine Gäste.' },
      { q: 'Müssen meine Gäste etwas installieren?',
        a: 'Nichts. Alle scannen einen QR-Code und spielen direkt im Browser am Handy. Keine App, kein Login.' },
      { q: G.de.faqGroesseQ,
        a: G.de.faqGroesseA },
      { q: G.de.faqDauerQ,
        a: G.de.faqDauerA },
      { q: 'Wie weit fährst du?',
        a: 'Ich bin in Hamburg und im Umland unterwegs. Für weiter entfernte Anfragen melde dich einfach kurz, meist lässt sich etwas einrichten.' },
      { q: 'Was kostet das?',
        a: G.de.faqPreisA },
    ],
  },
  form: {
    label: 'Anfragen', h2: 'Lust auf ein Quiz?',
    sub: 'Schreib mir kurz zum Anlass und zur ungefähren Personenzahl, dann melde ich mich mit einem Vorschlag.',
    avail: `Termine ab ${TERMIN_AB.de}.`,
    tabEvent: 'Event anfragen', tabTest: 'Test-Team, kostenlos',
    wahl: 'Such dir einen aus',
    priceBig: 'ab 350 €', priceSub: 'für den ganzen Abend',
    priceNote1: 'Moderation, Beamer, Sound und Aufbau', priceNote2: 'sind enthalten. Keine versteckten Posten.',
    testBig: '0 €', testSub: 'der ganze Abend',
    testNote1: 'CozyWolf startet gerade.', testNote2: 'Deshalb die ersten Runden kostenlos.',
    anlass: 'Anlass', anlassPh: 'Firmenevent, Geburtstag, Pub-Quiz …',
    personen: 'Ungefähre Personenzahl', personenPh: 'z. B. 40',
    datum: 'Wunsch-Datum oder Zeitraum', datumPh: 'z. B. Freitag im November',
    name: 'Dein Name', email: 'E-Mail für die Antwort',
    stadt: 'Stadt / Region', stadtPh: 'z. B. Hamburg',
    groesse: 'Personen',
    groesseOpts: ['6–10 Leute', 'Mehr als 10', 'Weniger als 6', 'Weiß ich noch nicht'],
    termin: 'Wann würde es passen?', terminPh: 'z. B. ein Freitag im Dezember, abends',
    msgEvent: 'Nachricht (optional)', msgTest: 'Noch was? (optional)',
    mehr: 'Mehr Angaben, das hilft mir beim Vorschlag',
    direkt: 'Lieber direkt schreiben?',
    sending: 'Senden …', submitEvent: 'Anfrage absenden', submitTest: 'Als Test-Team anmelden',
    okTitleEvent: 'Danke, ist angekommen!',
    okBodyEvent: 'Ich melde mich mit einem Vorschlag bei dir. Meist geht das schnell.',
    okTitleTest: 'Ihr seid dabei!',
    okBodyTest: 'Ich melde mich mit einem Terminvorschlag, meist geht das schnell. Euer Quizabend geht aufs Haus.',
    errorPre: G.de.formFehler, errorPost: '.',
    privacy1: 'Mit dem Absenden verarbeite ich deine Angaben, um deine Anfrage zu beantworten. Mehr dazu in der ',
    privacyLink: 'Datenschutzerklärung', privacy2: '.',
  },
  footer: { city: 'CozyWolf, Hamburg', imprint: 'Impressum', privacy: 'Datenschutz', aiNote: G.de.aiHinweis },
  sticky: 'Termin anfragen',
};

const en: OnePageDict = {
  nav: { spielarten: 'Formats', probieren: 'Try it', ablauf: 'How it works', ueber: 'About me', cta: 'Request a date' },
  hero: {
    kicker: 'Hosted live quiz in Hamburg',
    hooks: ['Knowledge', 'Luck', 'Timing', 'Team spirit', 'Gut feeling'],
    rest: 'isn’t everything.',
    sub: G.en.heroSub,
    btn0: 'Free for test teams', btn0Sub: G.en.ctaSub,
    btn1: 'Request a date', btn1Sub: 'A reply, no strings attached',
    availability: `From €350 · dates from ${TERMIN_AB.en}`,
    phoneApp: 'CozyQuiz', phoneTeamA: 'Lightbulbs', phoneTeamB: 'Quiz Mafia', phoneReady: 'Ready',
  },
  modes: {
    kicker: '[ 01 ]', label: 'The formats', h2: 'Two modes, one evening',
    quizChip: 'Up to 40 people',
    quizCalm: G.en.quizCalm,
    quizLead: 'You play in teams of four or five around one phone, the projector is the stage. Answer correctly, claim a tile.',
    quizBullets: [
      'It’s not the most tiles that wins, but the largest connected area',
      'Claim, steal, stack or play a joker',
      'Five categories, three rounds, a finale',
    ],
    avZeile: 'Pick your team emoji',
    avAria: 'Cycle through team marks',
    arenaChip: 'From 40 people',
    arenaCalm: 'The big night: everyone plays as factions against each other, live on the big screen.',
    arenaLead: 'You play in teams around one phone, just like in CozyQuiz, only each team belongs to one of eight factions. A faction holds up to five teams. Question by question, the ranking shifts.',
    arenaBullets: [
      'No game board, a race of factions',
      'Scored by the share of correct answers, a faction of eight has no advantage over one of four',
      'Five awards and the coronation at the end',
    ],
  },
  sim: {
    teams: {
      d: 'Quiz Mafia', s: 'Pub Crawl Pros', b: 'Ask-Me-Something-Easy',
    },
    questions: [
      { art: 'mucho', cat: 'Mu-Cho', col: '#3B82F6', text: 'What did Netflix ship before streaming existed?',
        opts: ['DVDs by mail', 'VHS tapes', 'Music CDs'], correct: 0 },
      { art: 'zehn', cat: 'All In', col: '#22C55E', text: 'Which country has the most time zones?',
        opts: ['Russia', 'USA', 'France'], correct: 2,
        punkte: [[6, 3, 1], [2, 2, 6], [3, 0, 7]] },
      { art: 'schaetz', cat: 'Close Call', col: '#F59E0B', text: 'How tall is Hamburg’s Michel?',
        opts: [], correct: 0, loesung: '132', einheit: 'metres' },
    ],
    welcomeKicker: 'A warm welcome to', welcomeTitle: 'COZYQUIZ',
    welcomeSub: 'Make yourselves comfortable, we’re about to start!',
    answering: 'Teams answering', reveal: 'Reveal',
    verbSet: 'claims a tile', verbSteal: 'steals one', verbStack: 'stacks up',
    answeredLine: (n, ges) => `${n}/${ges} teams have answered`,
    field: 'tile', fields: 'tiles', lead: ' · in the lead', tied: ' · tied',
    // 2026-08-27 an die App angeglichen. Vorher standen hier eigene
    // Uebersetzungen (Lucky Strike, Know-It-Alls, Improv, After Hours, Risk),
    // die es in KioskQuiz so nicht gibt. Wer auf Englisch spielt, haette auf
    // der Leinwand andere Namen gelesen als auf der Seite.
    // Quelle: shared/quarterQuizTypes.ts, QQ_MEGA_FACTIONS, nameEn.
    factions: {
      bauchgefuehl: 'Gut Feeling', glueckstreffer: 'Lucky Guess', allwissen: 'Know-It-All',
      improvisation: 'Wing It', feierabend: 'Happy Hour', letztesekunde: 'Last Second',
      einspruch: 'Objection', risiko: 'All In',
    },
    mottos: {
      bauchgefuehl: 'The gut never lies.', glueckstreffer: 'Right is right.',
      allwissen: 'We just know.', improvisation: 'We\u2019ll figure it out.',
      feierabend: 'Just here for fun.', letztesekunde: 'Just in time.',
      einspruch: 'That doesn\u2019t count!', risiko: 'All or nothing.',
    },
    waiting: 'waiting for the answer',
    phonesRight: (g, hits) => `+${g}  ${hits}/3 phones right`,
  },
  anlaesse: {
    label: 'Occasions', h2: 'What’s the occasion?',
    sub: G.en.anlaesseSub,
    cta: 'Enquire →',
    cards: [
      { badge: 'Team event', title: 'Company or team',
        short: 'Departments or tables compete as factions. One fixed contact person, invoice to the company, agenda agreed beforehand.',
        desc: 'I agree the questions, length and format with you in advance, host the whole evening and bring the projector and sound. Departments or tables compete as factions. Fixed contact person, invoice to the company.' },
      { badge: 'Birthday', title: 'Private party',
        short: 'Birthday or friend group, a relaxed round where you conquer the game board.',
        desc: 'You sit together, I take care of the rest. On request I’ll add a few questions about the birthday guest. Works from six people, up to forty.' },
      { badge: 'Quiz night', title: 'Café, bar or pub',
        short: 'A regular quiz night gives your guests a reason to come in midweek.',
        desc: 'Teams stay all evening, order between rounds and come back for the next edition. Your first night is free, then you decide whether it becomes a regular series. I bring the tech, we agree format and terms together.' },
    ],
  },
  kinetic: 'STAY COZY. STAY CURIOUS.',
  probe: {
    kicker: 'Five question types, one round', label: 'Try it',
    h2: 'This is how you play along on your phone',
    sub: 'One phone per team, scan a QR code, done. Pick a question type and play it through, just like on quiz night.',
    zurueck: 'Back', weiter: 'Next',
    check1: 'No app, no login, no paper',
    check2: 'Five question types, no round feels the same',
    cats: {
      mucho: { name: 'Mu-Cho', claim: 'Pick the right answer.', detail: '4 options, only 1 is right. Speed decides.' },
      schaetzchen: { name: 'Close Call', claim: 'Who guesses closest?', detail: 'The closest guess wins. Nearly right counts too.' },
      cheese: { name: 'Picture This', claim: 'What is that?', detail: 'Recognise the picture and type your answer on the phone.' },
      zehn: { name: 'All In', claim: 'Spend your points wisely.', detail: '3 answers, 10 points. All in, or spread them out?' },
      tuete: { name: 'Lucky Bag', claim: 'Always a surprise.', detail: 'Hot Potato, Top 5, Fix It, Pin It. Nobody knows which one is next.' },
    },
    probes: {
      mucho: { kind: 'pick', q: 'What did Netflix ship before streaming existed?',
        opts: ['DVDs by mail', 'VHS tapes', 'Music CDs', 'Nothing, there was only streaming'], correct: 0,
        fact: 'Netflix started in 1997 as a DVD-by-mail service. The first stream came ten years later.' },
      cheese: { kind: 'pick', q: 'What’s in the picture?',
        opts: ['Colosseum', 'Acropolis', 'Alhambra', 'Pantheon'], correct: 0,
        fact: 'The Colosseum held around 50,000 spectators. It was built almost 2,000 years ago.' },
      tuete: { kind: 'order', spiel: 'Fix It', q: 'Sort them by invention, oldest first.',
        items: ['Printing press', 'Steam engine', 'Telephone', 'Internet'], start: [2, 0, 3, 1],
        fact: 'Printing press 1450, steam engine 1712, telephone 1876, internet 1983.' },
      schaetzchen: { kind: 'guess', q: 'How many bones does an adult human have?', target: 206, unit: 'bones' },
      zehn: { kind: 'points', q: 'Which country has the most time zones? Spend 10 points.',
        opts: ['Russia', 'USA', 'France'], correct: 2, correctLabel: 'France' },
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
    ordHint: 'Tap them into the right order',
    ordAgain: 'Sort again',
    ordResult: (richtig, ges) => `${richtig} of ${ges} in the right spot.`,
    weiterZu: name => `Next: ${name}`,
  },
  ablauf: {
    label: 'How it works', h2: G.en.ablaufH2,
    sub: G.en.ablaufSub,
    wandHint: 'Point at the wall and a round starts',
    duo0Title: 'I bring',
    duo0: ['Projector and sound, set up beforehand', 'Hosting all evening', 'Questions tuned to your crowd', 'The game on all phones'],
    duo1Title: 'You need',
    duo1: ['A free wall or a screen', 'Power and WiFi for your guests', 'Room for your crowd', 'One phone per team, you already have that'],
  },
  johannes: {
    kicker: 'About me',
    quote: [
      { w: '“My' }, { w: 'goal:' }, { w: 'an' }, { w: 'evening' }, { w: 'full' }, { w: 'of' },
      { w: 'aha moments,', hot: true }, { w: 'laughs', hot: true }, { w: 'and' }, { w: 'good' },
      { w: 'vibes,', hot: true }, { w: 'that' }, { w: 'you’ll' }, { w: 'still' }, { w: 'talk' }, { w: 'about.”' },
    ],
    body: 'I’m Johannes and I host every evening myself. The tech, the setup and the questions come from me.',
    name: 'Johannes', role: 'Founder & quizmaster',
    photoAlt: 'Johannes, quizmaster of CozyWolf',
  },
  faq: {
    label: 'Questions', h2: 'Frequently asked questions',
    items: [
      { q: G.en.faqTechnikQ,
        a: 'No. I bring the projector and sound myself. You only need a free wall or a screen, power and WiFi for your guests.' },
      { q: 'Do my guests have to install anything?',
        a: 'Nothing. Everyone scans a QR code and plays right in the browser on their phone. No app, no login.' },
      { q: G.en.faqGroesseQ,
        a: G.en.faqGroesseA },
      { q: G.en.faqDauerQ,
        a: G.en.faqDauerA },
      { q: 'How far do you travel?',
        a: 'I’m based in Hamburg and the surrounding area. For requests further out, just drop me a line, usually something can be arranged.' },
      { q: 'What does it cost?',
        a: 'It starts at €350 for the whole evening, including tech and hosting. The exact price depends on headcount and occasion. Tell me briefly what you have in mind and you’ll get a fair offer.' },
    ],
  },
  form: {
    label: 'Requests', h2: 'Up for a quiz?',
    sub: 'Drop me a line about the occasion and rough headcount, and I’ll get back to you with a proposal.',
    avail: `Dates from ${TERMIN_AB.en}.`,
    tabEvent: 'Request an event', tabTest: 'Test team, free',
    wahl: 'Pick one',
    priceBig: 'from €350', priceSub: 'for the whole evening',
    priceNote1: 'Hosting, projector, sound and setup', priceNote2: 'are included. No hidden extras.',
    testBig: '€0', testSub: 'the whole evening',
    testNote1: 'CozyWolf is just getting started.', testNote2: 'That’s why the first rounds are free.',
    anlass: 'Occasion', anlassPh: 'Company event, birthday, pub quiz …',
    personen: 'Rough headcount', personenPh: 'e.g. 40',
    datum: 'Preferred date or timeframe', datumPh: 'e.g. a Friday in November',
    name: 'Your name', email: 'Email for the reply',
    stadt: 'City / region', stadtPh: 'e.g. Hamburg',
    groesse: 'People',
    groesseOpts: ['6–10 people', 'More than 10', 'Fewer than 6', 'Don’t know yet'],
    termin: 'When would suit you?', terminPh: 'e.g. a Friday evening in December',
    msgEvent: 'Message (optional)', msgTest: 'Anything else? (optional)',
    mehr: 'More details, so I can propose something that fits',
    direkt: 'Rather write directly?',
    sending: 'Sending …', submitEvent: 'Send request', submitTest: 'Sign up as a test team',
    okTitleEvent: 'Thanks, got it!',
    okBodyEvent: 'I’ll get back to you with a proposal. Usually quickly.',
    okTitleTest: 'You’re in!',
    okBodyTest: 'I’ll get back to you with a date proposal, usually quickly. Your quiz night is on the house.',
    errorPre: G.en.formFehler, errorPost: '.',
    privacy1: 'By sending, I process your details to answer your request. More in the ',
    privacyLink: 'privacy policy', privacy2: '.',
  },
  footer: { city: 'CozyWolf, Hamburg', imprint: 'Imprint', privacy: 'Privacy', aiNote: G.en.aiHinweis },
  sticky: 'Request a date',
};

const DICTS: Record<Lang, OnePageDict> = { de, en };

export function onePageT(lang: Lang): OnePageDict {
  return DICTS[lang];
}
