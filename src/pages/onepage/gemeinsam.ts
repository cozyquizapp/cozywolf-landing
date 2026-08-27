// Texte, die in BEIDEN Fassungen wortgleich stehen muessen.
//
// 2026-08-27. Die Startseite existiert bewusst zweimal (siehe routes.tsx:
// „zwei eigenstaendige Fassungen, kein Responsive"). Das ist eine Entscheidung
// und bleibt. Der Fehler daran war nicht die Trennung, sondern dass auch die
// TATSACHEN doppelt getippt standen: Preis, Kapazitaet, Dauer, das
// Kernversprechen. Gemessen waren 54 Textbausteine wortgleich in beiden
// Dateien, also 34 Prozent des Mobil-Textes.
//
// Was das kostete, ist belegbar. An einem einzigen Tag mussten dieselben
// Angaben zweimal angefasst werden: die Personenzahlen (sechs Angaben, die
// sich gegenseitig widersprachen, darunter „bis 30" auf dem Desktop gegen
// „ab 25" auf dem Mobil), die Arena-Beschreibung und der Anredewechsel in der
// FAQ. Jede dieser Korrekturen konnte an einer Stelle landen und an der
// anderen nicht.
//
// ⚠️ Hier gehoert NUR hinein, was in beiden Fassungen dasselbe sein MUSS.
// Nicht hierher gehoeren die Quiz-Inhalte (Fragen, Antworten, Kategorien):
// die stehen heute zufaellig gleich, duerfen aber je Fassung abweichen, weil
// die Mobil-Fassung eine kuerzere Demo faehrt. Wer die hier zusammenzieht,
// nimmt eine Freiheit weg, die gewollt ist.
//
// Regel fuer neue Eintraege: kommt der Satz aus der Wirklichkeit (Preis,
// Zahl, Versprechen, Rechtliches), gehoert er hierher. Beschreibt er nur,
// wie diese eine Fassung gerade aussieht, gehoert er in die Fassung.

export const GEMEINSAM = {
  de: {
    // ── Das Kernversprechen ────────────────────────────────────────────────
    // Wolf am 27.08.: "hier steht btw zu oft hamburg". Im Hero stand es
    // dreimal: in der Kennzeile, hier und in der Fusszeile. Die Kennzeile
    // behaelt es, das ist die Zeile, die auch fuer die Suche zaehlt. Hier und
    // unten faellt es weg, ohne dass eine Zeile verschwindet.
    heroSub: 'Der gemütlichste Quizabend, den ihr je gespielt habt.',
    ctaSub: 'Ein ganzer Abend, kostenlos',
    anlaesseSub: 'Gleiches Spiel, anderer Abend. Ich stimme Fragen, Länge und Spielart auf eure Runde ab.',
    quizCalm: 'Der Brettspielabend, in kleinen Teams. Jede richtige Antwort ist ein Zug auf dem Feld.',

    // ── Der Ablauf ─────────────────────────────────────────────────────────
    ablaufH2: 'Mehr als eine freie Wand braucht ihr nicht',
    ablaufSub: 'Beamer, Sound, Aufbau und Moderation bringe ich mit.',

    // ── Die Tatsachen. Hier faellt eine Aenderung sonst nur halb an. ───────
    faqTechnikQ: 'Brauche ich eigene Technik?',
    faqGroesseQ: 'Für wie viele Personen funktioniert das?',
    faqGroesseA: 'Von der kleinen Runde bis zu 160 Personen. Kleine Gruppen erobern das Spielfeld, große Gruppen treten als Fraktionen an. Das Format passt sich an.',
    faqDauerQ: 'Wie lange dauert ein Quiz-Event?',
    faqDauerA: 'Meist 90 bis 120 Minuten mit mehreren Runden. Die genaue Länge stimme ich vorher mit dir auf deinen Anlass ab.',
    faqPreisA: 'Es geht bei 350 € für den ganzen Abend los, mit Technik und Moderation. Der genaue Preis richtet sich nach Personenzahl und Anlass. Schreib mir kurz, worum es geht, dann bekommst du von mir ein faires Angebot.',

    // ── Pflichtangaben und Fehlerfall ──────────────────────────────────────
    formFehler: 'Da ging etwas schief. Schreib mir gern direkt an ',
    // 2026-08-27 auf '' gesetzt: die Seite hat kein KI-Bild mehr. Zuletzt fiel
    // das Wohnzimmer mit der Beamerwand im Abschnitt Ablauf weg, davor das
    // Stimmungsbild im Hero. Ein Hinweis auf etwas, das es nicht gibt, ist
    // keine Ehrlichkeit, sondern eine falsche Angabe. Der Schluessel bleibt
    // stehen, damit er wieder gefuellt werden kann, falls je ein KI-Bild
    // dazukommt.
    aiHinweis: '',
  },
  en: {
    heroSub: 'The coziest quiz night you’ve ever played.',
    ctaSub: 'A whole evening, on the house',
    anlaesseSub: 'Same game, different night. I tune the questions, length and format to your crowd.',
    quizCalm: 'The board game night, in small teams. Every correct answer is a move on the board.',

    ablaufH2: 'A free wall is all you need',
    ablaufSub: 'I bring the projector, sound, setup and hosting.',

    faqTechnikQ: 'Do I need my own equipment?',
    faqGroesseQ: 'How many people does it work for?',
    faqGroesseA: 'From a small round up to 160 people. Small groups conquer the game board, large groups compete as factions. The format adapts.',
    faqDauerQ: 'How long does a quiz event take?',
    faqDauerA: 'Usually 90 to 120 minutes with several rounds. I agree the exact length with you beforehand to fit your occasion.',
    faqPreisA: 'It starts at €350 for the whole evening, including tech and hosting. The exact price depends on headcount and occasion. Tell me briefly what you have in mind and I’ll send you a fair quote.',

    formFehler: 'Something went wrong. Feel free to email me directly at ',
    aiHinweis: '',
  },
} as const;
