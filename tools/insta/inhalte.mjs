/**
 * Was auf den Instagram-Blaettern steht.
 *
 * Bewusst getrennt von der Form: die Gestaltung liegt in blaetter.html, hier
 * stehen nur Texte und Daten. Eine neue Fragekarte ist damit ein Eintrag in
 * FRAGEN und kein neues Blatt.
 *
 * Die Namen, Farben und Sprueche sind aus der Website uebernommen
 * (src/pages/onepage/texts.ts) und nicht neu erfunden. Weicht hier etwas ab,
 * sagt der Beitrag etwas anderes als die Seite, auf die er verweist.
 */

/** Die fuenf Fragetypen, in der Reihenfolge des Abends. */
export const TYPEN = [
  { datei: 'mucho', name: 'Mu-Cho', farbe: '#3B82F6', sym: '/assets/cat-mucho.webp',
    anspruch: 'Wählt die richtige Antwort.',
    regel: '4 Optionen, nur 1 ist richtig. Schnelligkeit entscheidet.' },
  { datei: 'schaetzchen', name: 'Schätzchen', farbe: '#F59E0B', sym: '/assets/cat-schaetzchen.webp',
    anspruch: 'Wer schätzt am nächsten dran?',
    regel: 'Wer am nächsten dran liegt, gewinnt. Knapp dran zählt auch.' },
  { datei: 'cheese', name: 'Schau mal!', farbe: '#8B5CF6', sym: '/assets/cat-cheese.webp',
    anspruch: 'Was ist das?',
    regel: 'Erkennt das Bild und tippt die Antwort ins Handy.' },
  { datei: 'zehn', name: '10 von 10', farbe: '#22C55E', sym: '/assets/cat-10v10.webp',
    anspruch: 'Verteilt eure Punkte klug.',
    regel: '3 Antworten, 10 Punkte. Alles auf eine Karte oder streuen?' },
  { datei: 'tuete', name: 'Bunte Tüte', farbe: '#EF4444', sym: '/assets/cat-buntetuete.webp',
    anspruch: 'Immer eine Überraschung.',
    regel: 'Heiße Kartoffel, Top 5, Fix It, Pin It. Was kommt, sagt vorher keiner.' },
];

/**
 * Fragekarten. Je Eintrag entstehen zwei Blaetter: die Frage und die
 * Aufloesung. Zwei Bilder statt eines, damit im Feed ein Moment zum Raten
 * bleibt, bevor die Antwort kommt.
 *
 * Die erste ist die aus der Vorfuehrung auf der Website. Die zweite und
 * dritte sind neu, mit Hamburg-Bezug: der Michel steht schon in der
 * Beamer-Vorfuehrung, und die Speicherstadt ist die Sorte Frage, bei der
 * Hamburger den Kopf schuetteln und trotzdem falsch liegen.
 */
export const FRAGEN = [
  { datei: 'netflix', typ: 'mucho',
    frage: 'Was verschickte Netflix, bevor es Streaming gab?',
    optionen: ['DVDs per Post', 'Videokassetten', 'Musik-CDs', 'Nichts, es gab nur Streaming'],
    richtig: 0,
    aufloesung: 'Netflix startete 1997 als DVD-Versand. Der erste Stream kam zehn Jahre später.' },
  { datei: 'michel', typ: 'schaetzchen',
    frage: 'Wie hoch ist der Michel?',
    einheit: 'Meter', loesung: '132',
    aufloesung: '132 Meter. Bei Schätzchen gewinnt, wer am nächsten dran liegt, nicht wer es genau weiß.' },
  { datei: 'speicherstadt', typ: 'mucho',
    frage: 'Worauf steht die Speicherstadt?',
    optionen: ['Auf Eichenpfählen', 'Auf Beton', 'Auf einer Sandbank', 'Auf Stahlträgern'],
    richtig: 0,
    aufloesung: 'Auf Millionen Eichenpfählen im Elbschlick. Unter Wasser hält Eiche praktisch ewig.' },
];

/** Die acht Fraktionen aus CrowdQuiz, mit ihren Sprüchen. */
export const FRAKTIONEN = [
  { datei: 'bauchgefuehl', name: 'Bauchgefühl', farbe: '#F97316', spruch: 'Das Gefühl trügt nie.' },
  { datei: 'glueckstreffer', name: 'Glückstreffer', farbe: '#22C55E', spruch: 'Hauptsache richtig.' },
  { datei: 'allwissen', name: 'Allwissen', farbe: '#FACC15', spruch: 'Wir wissen es einfach.' },
  { datei: 'improvisation', name: 'Improvisation', farbe: '#3B82F6', spruch: 'Läuft schon irgendwie.' },
  { datei: 'feierabend', name: 'Feierabend', farbe: '#14B8A6', spruch: 'Hauptsache dabei.' },
  { datei: 'letztesekunde', name: 'Letzte Sekunde', farbe: '#A855F7', spruch: 'Kurz vor knapp.' },
  { datei: 'einspruch', name: 'Einspruch', farbe: '#EC4899', spruch: 'Das zählt nicht!' },
  { datei: 'risiko', name: 'Risiko', farbe: '#EF4444', spruch: 'Alles oder nichts.' },
];

/**
 * Das Spielbrett von CozyQuiz, wie es auf der Website steht
 * (src/pages/MobileOnePage.tsx, BOARD und TEAMS). 6 auf 6, weil die App bei
 * vier Teams 6x6 spielt.
 *
 * Der Spielstand ist nicht zufaellig gewaehlt, er beweist die Regel:
 *   Pilz gruen        7 Felder, groesste zusammenhaengende Flaeche 3
 *   Kugel violett     6 Felder, groesste Flaeche 3
 *   Wuerfel gelb      4 Felder, groesste Flaeche 4
 *   Kiste orange      4 Felder, groesste Flaeche 4
 * Gruen hat also fast doppelt so viele Felder wie Gelb und verliert trotzdem.
 * Genau das ist der Satz, den die Website behauptet und den ein Bild besser
 * zeigt als jede Erklaerung.
 */
export const TEAMS = [
  { id: 'g', farbe: '#22C55E', motiv: '/assets/av-qq-mushroom.webp' },
  { id: 'p', farbe: '#A855F7', motiv: '/assets/av-qq-crystal-ball.webp' },
  { id: 'y', farbe: '#FACC15', motiv: '/assets/av-qq-game-die.webp' },
  { id: 'o', farbe: '#F97316', motiv: '/assets/av-qq-treasure-chest.webp' },
];

export const BRETT_KANTE = 6;
export const BRETT = [
  'g', 'g', '',  'p', 'p', '',
  'g', '',  'y', 'p', '',  '',
  '',  'y', 'y', '',  'p', 'p',
  'o', 'y', '',  'g', '',  'p',
  'o', 'o', '',  'g', '',  '',
  '',  'o', '',  '',  'g', 'g',
];
