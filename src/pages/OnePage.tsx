/**
 * OnePage — der komplette Rework-One-Pager (Entwurf "Website Rework E4",
 * von Wolf abgenommen, Stand 2026-08). Ersetzt die alte Multi-Section-HomePage
 * auf der Route '/'. Die Unterseiten (/firmen, /feiern, ...) bleiben erreichbar.
 *
 * Portiert aus dem dc-Entwurf: die Stil-Generatoren liefern CSS-Strings und
 * werden ueber sx() in React-Styles uebersetzt, damit der abgenommene Look
 * exakt erhalten bleibt. Texte kommen zweisprachig aus onepage/texts.ts.
 * Design ist eingefroren; Aenderungen hier nur nach Ansage.
 */
import { Component } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { useLang, setLang, type Lang } from '../lang';
import { EMAIL, FORMSPREE_ID, INSTA_HANDLE, INSTA_URL } from '../brand';
import { sx } from './onepage/sx';
import { WAND_FUGEN, WAND_RAND, WAND_STEINE } from './onepage/wand';
import { KACHEL_VERLAUF, motivAnteil, qqGridSize, teammarke } from '../qqKachel';
import { ONEPAGE_CSS } from './onepage/css';
import { onePageT, type OnePageDict, type ProbeDef } from './onepage/texts';

const EASE = 'cubic-bezier(.22,1,.36,1)';
const LOGO = '/logo.webp';
/**
 * Der Textakzent.
 *
 * Erst Pink, dann Orange, jetzt Creme. Wolf am 27.08. zum Orange: "es beisst
 * sich mit dem logo", und er hat recht. Das Logo ist Pink und Dunkelblau.
 * Orange liegt im Farbkreis direkt neben Pink, zwei benachbarte Toene
 * nebeneinander werden nicht zu einem Paar, sondern zu einem Fehler.
 *
 * Deshalb gar kein zweiter Farbton in der Schrift. Hervorhebung laeuft ueber
 * Helligkeit: der betonte Teil steht in vollem Creme, der Rest gedaempft.
 * Verweise bekommen eine Unterlinie, damit sie ohne Farbe erkennbar bleiben.
 * Farbe traegt auf dieser Seite nur noch, was im Spiel auch Farbe hat:
 * Kacheln, Wappen, Brett. Damit steht das Pink des Logos allein da, statt mit
 * irgendetwas zu konkurrieren.
 *
 * Gemessen auf dem Grund #0A0814: 17,4 zu 1. Falls doch ein Farbton gewuenscht
 * ist, waere Gelb #FACC15 der naechste Kandidat, 12,96 zu 1, und weit genug
 * von Pink entfernt. Dann reicht diese eine Zeile.
 */
const AKZENT = '#F6EFE6';

/**
 * Der Stilschalter fuer die Kapitelfassungen aus dem Mockup.
 *
 * Wolf am 27.08.: "dafuer waere ein replizieren klonen der website nice um mal
 * wirklich zu sehen wie es werden koennte final". Ein Klon waere aber ab dem
 * ersten Tag ein zweiter Stand, der auseinanderlaeuft. Stattdessen traegt die
 * ECHTE Seite die Fassungen und zeigt sie auf Zuruf:
 *
 *   /d/?stil=2   zwei Stufen: Kapitel gross, alles darin klein
 *   /d/?stil=3   dazu Luft statt Linien zwischen den Kapiteln, Dichtewelle
 *   /d/?stil=4   dazu die Kapitelziffer als Bauteil
 *   /d/?stil=5   keine Linien, jedes Kapitel in eigenem sehr dunklen Ton
 *
 * Ohne den Zusatz bleibt alles, wie es ist. Wer sich entschieden hat, macht
 * aus der Zahl einen Vorgabewert und die Zeile hier faellt weg.
 */
/**
 * Die Handschrift der Seite, entschieden am 28.08.
 *
 * Bis dahin liessen sich fuenf Kapitelfassungen und vier Auftritte ueber die
 * Adresse durchprobieren (?stil= und ?bew=). Wolf hat K3 und T3 gewaehlt, also
 * stehen die Werte jetzt fest und die Schalter sind weg. Was dabei gilt:
 *
 *   Ueberschriften gross, eine Stufe fuer Kapitel und eine fuer alles darin.
 *   Keine Haarlinien zwischen den Kapiteln, dafuer Luft nach der Dichtewelle.
 *   Keine Schatten an der Oberflaeche; Spielsteine behalten ihre Kanten.
 *   Der Auftritt ist versetztes Hereinfahren aus Lage und Deckkraft.
 *
 * Die verworfenen Fassungen sind nicht verloren: K1, K2, K4 und K5 stehen
 * weiter in der Mockup-Station "Kapitel", T1, T2 und T4 in "Trennung". Dort
 * gehoeren sie hin, sie sind Entwuerfe und keine Einstellungen.
 */

/** Ab K3 traegt die Oberflaeche keine Schatten mehr. Spielsteine schon:
 *  ihre Kanten stehen in der Kacheldefinition der App und gehoeren zum
 *  Stein, nicht zum Layout. */
const schatten = (_wert: string) => '';

/**
 * Die Unterzeile eines Kapitels.
 *
 * Wolf am 28.08.: "die subtitel wirken jetzt lame". Nachgerechnet: seit die
 * Ueberschriften auf 75 px stehen, sprang die Seite von 75 direkt auf 17, und
 * 17 war genau die Groesse des Fliesstexts darunter. Die Referenzen halten das
 * viel enger, Apple 56 zu 21, Custo 38 zu 19, Air 32 zu 16, also Faktor 2 bis
 * 2,7; unsere 75 zu 17 waren Faktor 4,4. Jetzt eine eigene Stufe dazwischen.
 */
const UNTERZEILE = 'font-size:22px;line-height:1.5;font-weight:500;color:rgba(246,239,230,.72);max-width:46ch;text-wrap:pretty';

/**
 * Der grosse Modus heisst CrowdQuiz.
 *
 * Entschieden am 27.08. Die Regel dahinter, weil sie fuer jeden weiteren Namen
 * gilt: [wie es ist][was es ist], ein Wort, englisch, und beide Woerter
 * muessen auch im deutschen Mund liegen. Cozy und Quiz tun das, Factions
 * nicht. Wolfs zwei Korrekturen unterwegs: bei 160 Leuten ist nichts mehr
 * cozy, und der Modus ist nicht wild, sondern groesser. Crowd erfuellt alles,
 * und das Wort steht schon im Code der App, die beiden Fragetypen, die es nur
 * hier gibt, heissen crowdTop und crowdEstimate.
 *
 * ⚠️ In der App heisst der Modus weiter CozyArena, an 148 Stellen. Bis die
 * nachgezogen sind, heisst dasselbe Ding an zwei Orten anders. Der interne
 * Schluessel bleibt 'arena', damit Bilder und Bezeichner nicht mitwandern.
 */
const MODUS_GROSS = 'CrowdQuiz';

/** Die Kapitelueberschrift. Eine Stufe, ueberall dieselbe. */
const H2_GROSS = 'clamp(40px,5.2vw,84px)';

/**
 * Die Dichtewelle: dicht, mittel, luftig als Polster oben und unten.
 * Seit das Einrasten raus ist, machen diese Werte die ganze Ordnung. Sie
 * liegen in derselben Groessenordnung wie bei den Referenzen, Custo 110 px,
 * Apple 100 bis 120.
 */
const DICHTE: Record<string, string> = {
  dicht: '96px 32px 72px', mittel: '120px 32px 88px', luftig: '148px 32px 108px',
};

// Spielstand-Daten der Brett-Simulation (aus dem Entwurf, Wolfs Choreografie)
// Team-Avatare: das CozyQuiz-Objektset der App (48 Motive). Die Objekte sind
// farbneutral, die Teamfarbe kommt aus der Kachel darunter - deshalb sind hier
// Motiv und Farbe getrennt. Die Zuordnung folgt den Farb-Slots der App: die
// ersten acht Motive in COZYQUIZ_AVATARS sind index-gleich zu den acht Slots,
// also erbt jedes Team das Motiv seiner Farbe.
// ── Station 01: das Brett ────────────────────────────────────────────────
// Drei Teams, von Wolf gewaehlt: Donut, Erdbeere, Papierboot. Nach
// qqGridSize(3) ergibt das ein 5x5, und genau darum ging es ihm: "ich wuerde
// ein kleineres grid mit weniger teams, aber dafuer groesser nehmen". In der
// 340-px-Spalte waechst die Zelle damit von 49 auf 60 px.
//
// Die Farben sind die des BRETTS, nicht die der Avatare. Die App macht das
// genauso (QQ_BOARD_PALETTE, qqGetBoardColor in shared/quarterQuizTypes.ts):
// das Brett bekommt eine eigene, maximal kontrastierende Palette, damit sich
// nahe Avatarfarben auf dem Feld nicht verwechseln lassen.
//
// ABWEICHUNG, bewusst und gemeldet: die App vergibt die Palettenplaetze nach
// Beitrittsreihenfolge, bei drei Teams also 0, 1, 2 und damit Rot, Orange,
// Gelb. Drei benachbarte Farbtoene sind auf einem Brett kaum zu trennen. Hier
// stehen deshalb die Plaetze 0, 3 und 5, also Rot, Gruen, Blau. Wenn die App
// die Palette bei wenigen Teams spreizt, stimmen beide wieder ueberein.
// Satz G3 "Kuehl gegen warm", von Wolf am 27.08. aus vier Faessungen gewaehlt.
// Die beiden warmen Motive stehen auf kuehlen Kacheln, das neutrale Boot auf
// der einzigen leuchtenden Flaeche. Vorher sass die rote Erdbeere auf Gruen,
// also auf ihrer Gegenfarbe, und das cremefarbene Boot auf dem Rot, das der
// Erdbeere zustuende. Palettenplaetze 6, 5 und 3, also weit auseinander.
const TEAMS = [
  { id: 'd', color: '#A855F7', av: '/assets/av-qq-donut.webp' },
  { id: 's', color: '#3B82F6', av: '/assets/av-qq-strawberry.webp' },
  { id: 'b', color: '#22C55E', av: '/assets/av-qq-paper-boat.webp' },
];
const GRID = qqGridSize(TEAMS.length);

/**
 * Die beiden Gegner im Handy in Abschnitt 03.
 *
 * Wolf am 29.08.: "schaetzchen und 10 v 10 macht ohne gegner halt nicht sooo
 * viel sinn". Er hat recht: bei Mu-Cho ist die eigene Antwort richtig oder
 * falsch und damit fertig, aber eine Schaetzung ohne andere Schaetzungen sagt
 * nichts, und zehn Chips auch nicht. Also stehen nach der Abgabe zwei Teams
 * daneben, mit festen Zahlen.
 *
 * Die Zahlen sind so gewaehlt, dass beides moeglich ist. Beim Skelett (206)
 * liegen sie 16 und 48 daneben, wer also halbwegs zielt, gewinnt. Bei den
 * Chips haben sie 6 und 3 auf Frankreich, es braucht also sieben, um vorne zu
 * stehen -- genau die Regel, die Wolf am 29.08. nennt: "die logik bei 10 v 10
 * ist eben die meisten punkte auf der richtigen antwort zu haben".
 *
 * Die Kacheln kommen aus TEAMS, aber ohne den Donut: der ist violett wie das
 * eigene Team im Kopf des Handys.
 */
const RIVALEN = [
  { id: 's', tipp: 190, chips: 6 },
  { id: 'b', tipp: 254, chips: 3 },
];
/** Das eigene Team im Handy, dasselbe wie in der Kopfzeile. */
const ICH = { farbe: '#A855F7', av: '/assets/av-qq-crystal-ball.webp' };

// Vorbelegung und Zuege auf 5x5. Kein Stapeln mehr: Wolf wollte "keine
// doppelavatar kacheln", und der Stapel war der einzige Zug, der zwei Motive
// auf ein Feld legt. Setzen und Klauen bleiben, das Stapeln steht weiter im
// Text daneben.
// Geprueft: kein Feld ausserhalb, kein Zug auf eigenes Gebiet, jeder Klau
// trifft fremdes. Endstand 15 von 25 Feldern, groesste Flaeche je Team 5.
const PRESET: [string, number][] = [
  ['d', 0], ['d', 1], ['s', 4], ['s', 9], ['b', 20], ['b', 21],
  ['s', 5],   // wird von d geklaut
  ['d', 22],  // wird von b geklaut
];
type Move = { t: string; c: number; k?: 'steal' };
/**
 * Eine Runde ist eine Frage, und in einer Runde setzt JEDES Team, das richtig
 * lag.
 *
 * Wolf am 29.08.: "alle teams die eine frage richtig beantworten duerfen ein
 * feld setzen, wer zuerst richtig ist, darf zuerst, aber alle die richtig sind
 * duerfen". Vorher setzte je Runde genau eines, das war schlicht falsch.
 *
 * Wer in welcher Runde setzt, steht nicht frei, sondern folgt der Frage, die
 * die Leinwand gerade zeigt -- sonst setzt am Brett jemand, der eben noch
 * danebenlag. Die Fragen wechseln im Dreitakt (Mu-Cho, 10 von 10,
 * Schaetzchen), also auch die Reihen hier:
 *
 *   Mu-Cho    wahl [1,0,0], richtig ist 0 -> Erdbeere und Boot.
 *   10 von 10 Wolf am 29.08.: "gewinnt das team mit den meisten chips auf der
 *             richtigen antwort, bei gleichstand alle mit gleichviel". Punkte
 *             [[2,1,7],[3,1,6],[4,3,3]], richtig ist Frankreich, also 7 gegen
 *             6 gegen 3 -> der Donut allein. Die Verteilung stand vorher
 *             anders herum; so gewinnt jede Kategorie ein anderes Team, und
 *             der Donut geht nicht leer durch die ganze Folge.
 *   Schaetzchen Tipps 90, 128, 155 auf 132 -> die Erdbeere ist am naechsten,
 *             und nur der naechste Tipp setzt.
 *
 * Die Reihenfolge innerhalb einer Runde ist die Reihenfolge, in der die Teams
 * geantwortet haben, und das ist am Beamer die Reihenfolge der Kacheln unten:
 * Donut, Erdbeere, Boot. Wer zuerst richtig war, setzt zuerst.
 *
 * Geprueft: kein Feld ausserhalb, kein Zug auf ein schon belegtes Feld ausser
 * beim Klauen, jeder Klau trifft fremdes Gebiet. Endstand 14 von 25 Feldern,
 * Erdbeere 6, Donut 4, Boot 4.
 */
const ROUNDS: Move[][] = [
  [{ t: 's', c: 3 }, { t: 'b', c: 15 }],                 // Mu-Cho: zwei richtig
  [{ t: 'd', c: 6 }],                                    // 10 von 10: die meisten Chips
  [{ t: 's', c: 13 }],                                   // Schaetzchen: der naechste Tipp
  [{ t: 's', c: 14 }, { t: 'b', c: 22, k: 'steal' }],    // Mu-Cho
  [{ t: 'd', c: 5, k: 'steal' }],                        // 10 von 10
  [{ t: 's', c: 10 }],                                   // Schaetzchen
];
/** Dieselben Zuege am Stueck. Das Brett in 01 spielt sie einzeln ab. */
const MOVES: Move[] = ROUNDS.flat();

/* Wolf am 28.08.: "ich wuerde den loop des beamers nicht so lange machen,
   keiner schaut das so lange tbh". Stimmt, und nachgerechnet war es
   schlimmer als gedacht: 55 Schritte zu 300 ms sind 16,5 s je Runde, mal
   neun Runden plus Begruessung ergibt zweieinhalb Minuten. Das ist keine
   Vorschau, das ist ein Film.
   Jetzt 44 Schritte zu 190 ms: 4,2 s Frage, 1,5 s Aufloesung, 2,7 s Brett,
   macht 8,4 s je Runde und 76 s fuer die ganze Folge. Die Frage bleibt
   lesbar (drei Teams haben nach 2,3 s geantwortet), und das Brett kommt
   viermal so oft dran wie vorher, gemessen an der Zeit, die jemand
   tatsaechlich hinsieht. */
/* Der Takt der Beamer-Runde, in Ticks zu 190 ms.
 *
 * Wolf am 29.08.: "du musst die phasen trennen, frage active und danach
 * erst reveal, sonst wuerde es bedeuten waehrend die frage laeuft sehen
 * alle teams was die anderen waehlen. also erst frage active (mach nur so
 * 5 sekunden in dem loop) dann reveal".
 *
 * Also: 26 Ticks Frage (4,9 s), in denen nur der Zaehler hochlaeuft und
 * niemand sieht, was ein anderes Team gewaehlt hat, danach 18 Ticks
 * Aufloesung (3,4 s), in denen alles auf einmal erscheint, dann 14 Ticks
 * Brett (2,7 s). Die Aufloesung ist laenger als frueher, weil dort jetzt
 * auch etwas zu lesen steht. */
const CYCLE = 62, Q_END = 26, R_END = 44;
/** Abstand zwischen zwei Zuegen einer Runde, in Ticks. */
const SETZ_TAKT = 7;

const FACTIONS = [
  { id: 'bauchgefuehl', color: '#F97316' },
  { id: 'glueckstreffer', color: '#22C55E' },
  { id: 'allwissen', color: '#FACC15' },
  { id: 'improvisation', color: '#3B82F6' },
  { id: 'feierabend', color: '#14B8A6' },
  { id: 'letztesekunde', color: '#A855F7' },
  { id: 'einspruch', color: '#EC4899' },
  { id: 'risiko', color: '#EF4444' },
];

// ── Die Objektgruppe des Heros ───────────────────────────────────────────
// Wolfs Referenzen loesen beide dasselbe Problem: der erste Bildschirm traegt
// ohne ein einziges Foto. Slush stellt Sticker um die Schrift, MindMarket
// ueberlappende Papierfiguren, beide „directly on the canvas, no frames, no
// rounded clipping". Diese Rolle spielen hier die Kacheln, die am Abend auf
// der Leinwand stehen, also kein Dekor, sondern das Produkt.
//
// Bewusst NICHT im Raster: gedreht, verschieden gross, ueberlappend. Die
// Groessen sind eine Tiefenstaffelung; die grosse Truhe vorn traegt als
// EINZIGE das Ueberschwingen, nach der Hausregel „Overshoot nur fuer den
// einen Beat pro Bildschirm".
const GRUPPE = [
  { av: '/assets/obj-puzzle.webp',           farbe: '#F97316', gr: 40, x: 4,  y: 6,  r: -8,  d: 0.30, beat: true,  tx: '-22px', ty: '-14px', tr: '-13deg' },
  { av: '/assets/av-qq-crystal-ball.webp',   farbe: '#A855F7', gr: 33, x: 46, y: 0,  r: 10,  d: 0.38, beat: false, tx: '18px',  ty: '-22px', tr: '16deg' },
  { av: '/assets/av-qq-mushroom.webp',       farbe: '#22C55E', gr: 30, x: 33, y: 44, r: 6,   d: 0.46, beat: false, tx: '-10px', ty: '20px',  tr: '11deg' },
  { av: '/assets/obj-sanduhr.webp',          farbe: '#FACC15', gr: 24, x: 68, y: 40, r: -14, d: 0.54, beat: false, tx: '26px',  ty: '10px',  tr: '-20deg' },
  { av: '/assets/obj-gehirn.webp',           farbe: '#3B82F6', gr: 21, x: 12, y: 66, r: 14,  d: 0.62, beat: false, tx: '-26px', ty: '24px',  tr: '20deg' },
];

/**
 * Welches Objekt gehoert zu welchem Wort der Ueberschrift.
 *
 * Wolfs Idee: "wie waere es wenn jedes wort eine farbe der kachel rechts
 * haette? das wuerde dem ganzen etwas verknuepfung verleihen und vlt passen
 * die gewaehlten emojis ja sogar zum wort?" Genau darum geht es: links steht
 * ein Wort, rechts leuchtet das Objekt auf, das dazugehoert. Aus zwei Dingen
 * nebeneinander wird ein Satz.
 *
 * Index in hero.hooks -> Index in GRUPPE. Beide Sprachen fahren dieselbe
 * Reihenfolge, deshalb reicht die Position.
 *
 *   Wissen      -> Tischlampe      Licht geht auf.        Sitzt.
 *   Glueck      -> Fliegenpilz     Glueckspilz.           Sitzt.
 *   Timing      -> Sanduhr         Die Zeit laeuft.       Sitzt.
 *   Teamgeist   -> Puzzle          Zwei greifen ineinander. Sitzt.
 *   Bauchgefuehl-> Kristallkugel   Ahnung statt Wissen.   Sitzt.
 *
 * Sanduhr und Puzzle sind eigens gerendert (2026-08-27), weil der Objektsatz
 * der App weder Uhr noch Puzzle hat. Damit stehen zwei der fuenf Kacheln im
 * Hero nicht mehr fuer ein Motiv, das ein Team im Spiel waehlen kann. Der
 * Tausch ist trotzdem richtig: der Wuerfel bedeutete Zufall, nicht Timing,
 * und eine Kachel, die das falsche Wort illustriert, ist schlechter als eine,
 * die nicht im Spiel vorkommt. Wenn beide Motive spaeter in den Avatarsatz
 * der App wandern, loest sich der Rest von selbst.
 */
const WORT_OBJEKT = [4, 2, 3, 0, 1];
/** Umkehrung: welches Wort gehoert zu welchem Objekt. Fuer das Zeigen. */
const OBJEKT_WORT = GRUPPE.map((_, i) => WORT_OBJEKT.indexOf(i));

// ── Station 02: drei Objekte je Anlass ───────────────────────────────────
// Eigens gerendert (2026-08-27), nicht aus einem Emoji-Satz zusammengesucht:
// creme Koerper, Gold als Akzent, dunkles Blau fuer Sockel, hoechstens ein
// weiterer Ton je Objekt, kein Pink. Auf 48 px muss jedes noch als Silhouette
// erkennbar sein, deshalb keine duennen Teile und keine Schrift.
// gr = Kantenlaenge in Prozent des Feldes, x/y = Lage, r = Drehung. Dieselbe
// Staffelung wie im Hero: das groesste Objekt vorn und leicht gegen den
// Uhrzeigersinn, die kleineren dahinter.
const ANLASS_GRUPPEN = [
  [
    { av: '/assets/obj-namensschild.webp', gr: 54, x: 0, y: 10, r: -9 },
    { av: '/assets/obj-sekt.webp', gr: 48, x: 48, y: 0, r: 10 },
    { av: '/assets/obj-wimpel.webp', gr: 38, x: 42, y: 52, r: -6 },
  ],
  [
    { av: '/assets/obj-torte.webp', gr: 56, x: 2, y: 10, r: -7 },
    { av: '/assets/obj-ballons.webp', gr: 46, x: 52, y: 0, r: 9 },
    { av: '/assets/obj-geschenk.webp', gr: 38, x: 44, y: 54, r: -12 },
  ],
  [
    { av: '/assets/obj-bier.webp', gr: 54, x: 2, y: 8, r: -8 },
    { av: '/assets/obj-kaffee.webp', gr: 46, x: 50, y: 2, r: 11 },
    { av: '/assets/obj-tafel.webp', gr: 40, x: 40, y: 54, r: -5 },
  ],
];

const CAT_META = [
  { key: 'mucho', col: '#3B82F6', icon: '/assets/cat-mucho.webp' },
  { key: 'schaetzchen', col: '#F59E0B', icon: '/assets/cat-schaetzchen.webp' },
  { key: 'cheese', col: '#8B5CF6', icon: '/assets/cat-cheese.webp' },
  { key: 'zehn', col: '#22C55E', icon: '/assets/cat-10v10.webp' },
  { key: 'tuete', col: '#EF4444', icon: '/assets/cat-buntetuete.webp' },
];
const PROBE_ORDER = ['mucho', 'schaetzchen', 'cheese', 'zehn', 'tuete'];

/**
 * Die acht Fraktionswappen in der Zeile CrowdQuiz, Fassung W1 mit N1.
 *
 * Wolf am 28.08.: "W1 und N1 aber die 3 linken arena wappen sollen unter
 * crowdquiz in die luecke und die 5 rechts so wie sie sind gut plaztiert um es
 * etwas aufzusplitten".
 *
 * Damit ist die Tabelle raus. Sie war an dieser Stelle nie das, was CrowdQuiz
 * ausmacht -- Wolfs eigener Satz dazu: "die tabelle ist nicht gerade die
 * staerke von crowdquiz eher eine loesung um so viele teams unter einen hut zu
 * bekommen". Gemessen kam dazu, dass fuer den Balken in der 340 px breiten
 * Spalte nur 28 Pixel uebrig blieben, nachdem Rangzahl, Wappen, Name und
 * Punktzahl ihren Platz hatten. Ein Balkendiagramm mit 28-px-Balken ist keine
 * Buehne.
 *
 * Jetzt schweben acht Wappen, drei in der Luecke unter dem Namen und fuenf in
 * der Objektspalte. Kein Rang, kein Rennen, keine Zahl: die Zeile sagt, dass es
 * acht Fraktionen gibt und wie sie heissen, und das ist bei acht festen
 * Fraktionen die ganze Aussage. Der Stand gehoert auf die Leinwand, nicht auf
 * die Website.
 *
 * Die Plaetze sind von Hand gesetzt, nicht gerechnet. Eine Formel verteilt
 * gleichmaessig, und gleichmaessig sieht nach Raster aus statt nach
 * Konstellation. Zwei Bedingungen halten sie zusammen, beide nachgerechnet und
 * im Browser gemessen:
 *   1. Keine zwei Wappen ueberschneiden sich, auch nicht beim Schweben.
 *   2. Jedes Wappen hat nach innen genug Platz fuer seine Fahne (Name und
 *      Spruch, rund 196 px), ohne aus seiner Spalte zu laufen.
 */
/**
 * Die wechselnde Avatarwand in der Zeile CozyQuiz.
 *
 * Wolf am 28.08.: "du machst v1 unter cozyquiz, da ist perfekt platz dafuer !
 * und als pendant zu crowd quiz funktioniert das, wenn man drueber hovert
 * wechselt das feld auf dem man ist farbe und avatar durch?"
 *
 * Sein Zusatz ist besser als meine Fassung im Mockup. Dort lief beim Zeigen
 * die GANZE Wand los; jetzt wechselt nur die Kachel unter dem Zeiger. Das ist
 * aus drei Gruenden richtiger:
 *   - Es ist genau das, was ein Gast in der App tut: durchtippen, bis das
 *     eigene Zeichen da ist.
 *   - Es bewegt sich immer nur ein Ding, also kaempft nichts mit dem Brett in
 *     derselben Zeile um den Blick. Genau das war sein Einwand ("zu unruhig").
 *   - Es ist dieselbe Grammatik wie sonst auf der Seite: zeigen und es
 *     antwortet, wie die Wappen in CrowdQuiz und die Felder auf dem Brett.
 *
 * In Ruhe steht die Wand still. Was man weggedreht hat, bleibt stehen -- die
 * Wand traegt danach die Paarungen, die man selbst gemacht hat. Das ist der
 * Satz "frei kombinierbar", nur eben gespielt statt behauptet.
 *
 * Warum acht Kacheln: weil an einem Abend hoechstens acht Teams spielen und es
 * acht Farben gibt. Jede Farbe steht damit genau einmal im Bild. Das ist
 * Wolfs eigene Entscheidung aus der App ("da es maximal 8 teams mit 8 farben
 * sind ingame, wuerde ich nur 8 kacheln machen?").
 */
const AV_MOTIVE = [
  'donut', 'strawberry', 'game-die', 'crystal-ball', 'mushroom', 'table-lamp',
  'teapot', 'treasure-chest', 'paper-boat', 'croissant', 'cookie', 'compass',
  'popcorn', 'rocket', 'cheese', 'candle', 'houseplant', 'seashell',
  'snowflake', 'hot-air-balloon', 'playing-card', 'wizard-hat', 'disco-ball',
  'acorn', 'camera',
];
/** Die acht Teamfarben, 1:1 aus QQ_TEAM_PALETTE der App. */
const AV_FARBEN = ['#F97316', '#22C55E', '#14B8A6', '#A855F7', '#FACC15', '#3B82F6', '#EC4899', '#EF4444'];
/** Wie schnell eine Kachel durchwechselt, solange der Zeiger auf ihr liegt. */
const AV_TAKT = 620;

/**
 * Feine Koernung fuer die Wand in 04.
 *
 * Zwei Aufgaben in einem Bild. Erstens bricht sie die Streifen, die ein
 * dunkler Verlauf ueber wenige Stufen unweigerlich zeigt -- Wolf hat sie am
 * 28.08. als "verpixelt" gesehen, und sie sind es tatsaechlich: 8 Bit pro Kanal
 * reichen bei so kleinen Helligkeitsunterschieden nicht. Zweitens gibt sie der
 * Flaeche die matte Oberflaeche einer gestrichenen Wand statt eines Verlaufs.
 *
 * Als SVG im Datenpfad statt als Bilddatei: 300 Byte, kein zweiter Aufruf, und
 * die Koernung laesst sich in einer Zeile aendern.
 */
/* Hier stand WAND_KORN, eine feine Koernung als SVG. Sie sollte die Streifen
   brechen, die der graue Verlauf auf der Wand zeigte. Der Verlauf ist am
   28.08. rausgeflogen ("grau licht auf wand darf ganz weg"), damit hat die
   Koernung nichts mehr zu brechen. */

/**
 * Wolf am 28.08.: "crowdquiz avatare machen kein rennen absicht? beim rennen
 * koennte man freistehend sowas machen wie +85 punkte bei einem team, dann
 * aendert sich die reihenfolge, das waere nice, weil genau das im spiel
 * passiert".
 *
 * Ja, Absicht -- und die falsche. Mit der Tabelle ist auch das Rennen
 * rausgeflogen, und uebrig blieben acht Logos. Sein Einwand trifft: was
 * CrowdQuiz von acht Wappen unterscheidet, ist nicht die Liste, sondern das
 * Ereignis. Eine Fraktion punktet, und die Reihenfolge kippt.
 *
 * Das Rennen kommt also zurueck, aber nicht als Tabelle, sondern als das, was
 * am Abend wirklich passiert: eine Zahl steigt an einem Wappen auf, und danach
 * stehen die Wappen anders.
 *
 * Die Bedingung von vorhin bleibt bestehen ("duerfen sich nicht total
 * verdecken"), und sie ist der Grund fuer die Bauart:
 *
 *   Die SEITE ist je Fraktion fest. Drei gehoeren nach links, fuenf nach
 *   rechts, und daran aendert kein Punktestand etwas. Sonst spraenge ein
 *   Wappen quer ueber die Textspalte, wenn es von Platz 4 auf 3 zieht.
 *
 *   Der PLATZ innerhalb der Seite folgt dem Gesamtstand. Wer von den dreien
 *   links vorn liegt, steht oben links; wer von den fuenfen rechts vorn liegt,
 *   steht oben rechts. Bewegt wird also nur senkrecht in der eigenen Spalte.
 *
 * Der Preis ist ehrlich zu benennen: eine durchgehende Rangfolge von 1 bis 8
 * laesst sich so nicht ablesen. Das ist die Aufgabe der Tabelle, und die
 * gehoert auf die Leinwand am Abend. Hier geht es darum, dass es sich bewegt
 * und warum.
 */
/** Wie oft eine Fraktion punktet, und was so ein Treffer wert ist. */
const FRAK_TAKT = 3600;
const FRAK_PUNKTE = [40, 55, 70, 85, 100, 120];
/**
 * Wie stark alte Treffer verblassen, bevor ein neuer dazukommt.
 *
 * Wolf am 29.08.: "das team rennen bei crowdquiz passiert aktuell so selten,
 * dass man es nicht mitbekommt, etwas schade".
 *
 * Der Grund war Arithmetik, nicht der Takt: die Staende wurden seit dem ersten
 * Treffer aufaddiert, also lief das Feld immer weiter auseinander, und ein
 * einzelner Treffer von 40 bis 120 Punkten reichte irgendwann fuer keinen
 * Platzwechsel mehr. Gemessen ueber 400 Zuege bewegte sich anfangs jeder
 * vierte, in den letzten hundert nur noch jeder zehnte -- eine Bewegung alle
 * 36 Sekunden, und genau das hat Wolf gesehen.
 *
 * Mit dem Faktor bleibt das Feld beieinander: es zaehlen im Wesentlichen die
 * letzten Runden, aeltere verblassen. Damit bewegt sich bei zwei Dritteln der
 * Treffer etwas, also etwa alle fuenf Sekunden. Sichtbar ist der Faktor
 * nirgends, die Staende stehen seit dem 28.08. auf keiner Tabelle mehr, sie
 * bestimmen nur die Reihenfolge.
 */
const FRAK_ZERFALL = 0.82;

const FRAK_LINKS = [
  { id: 'allwissen', x: 16, y: 14, gr: 86 },
  { id: 'einspruch', x: 34, y: 48, gr: 72 },
  { id: 'feierabend', x: 14, y: 82, gr: 64 },
];
const FRAK_RECHTS = [
  { id: 'bauchgefuehl', x: 24, y: 10, gr: 84 },
  { id: 'improvisation', x: 72, y: 26, gr: 76 },
  { id: 'letztesekunde', x: 30, y: 48, gr: 68 },
  { id: 'risiko', x: 78, y: 68, gr: 62 },
  { id: 'glueckstreffer', x: 31, y: 88, gr: 56 },
];
/** Hoehe der beiden Felder. Links passt unter den Namen, rechts steht an der
 *  Stelle, an der vorher die Tabelle war (376 px), und darf etwas hoeher. */
const FRAK_H_LINKS = 340, FRAK_H_RECHTS = 420;
/**
 * Wolf am 28.08.: "ich faende gut wenn der reveal von einer kategorie kam,
 * dass man entweder nach ein paar sekunden oder durch klick auch zur naechsten
 * kommt". Beides, und die Uhr laeuft sichtbar: unter dem Knopf fuellt sich eine
 * Linie ueber genau diese Zeit. Sechs Sekunden, weil die Aufloesung ein bis
 * zwei Zeilen Text ist und darunter noch die Antworten stehen.
 */
const WEITER_MS = 6000;

// Beamerbild wird in Entwurfsgroesse gebaut und auf die Leinwand skaliert
const WALL_W = 640, WALL_H = 354;
/**
 * Die Funken der Begruessungsfolie.
 *
 * Wolf am 28.08.: "nimm am besten den bg ... also nimm die farbe mit sparks",
 * dazu ein Bild der echten Folie aus der App. Vorher lag hier ein rosa
 * Lichtfeld mit cremeweissen Punkten -- meine Erfindung. Die App macht es
 * anders und besser: Grund #120F18 mit zwei sehr leisen Verlaeufen, und die
 * Punkte sind warm, nicht weiss. Warm heisst hier Kerzenlicht, und genau das
 * ist der Ton, den der ganze Abend haben soll.
 *
 * Feste Liste statt Zufall: sie wird bei jedem Zeichnen gelesen, ein Zufall
 * darin liesse sie flackern. Die Verzoegerung je Funken ist aus dem Index
 * gerechnet, damit sie nicht im Gleichtakt atmen.
 */
const STERNE = Array.from({ length: 30 }, (_, i) => ({
  x: (i * 37) % 97,
  y: (i * 53) % 91,
  g: 1.6 + (i % 4) * 0.7,
  o: (0.30 + (i % 5) * 0.14).toFixed(2),
  d: ((i * 13) % 47) / 10,
}));

type OPState = {
  formMode: 'event' | 'test'; formStatus: 'idle' | 'sending' | 'ok' | 'error';
  wallScale?: number;
  beam?: boolean; beamWelcome?: boolean;
  johFan?: boolean; hookI?: number; hookVor?: number | null;
  /**
   * Die Sprache, mit der zuletzt gezeichnet wurde, und ob der naechste
   * Anstrich die Wortwalze ueberspringen soll.
   *
   * Gemeldet am 28.08. von einem Bekannten von Wolf, mit Video: beim
   * Sprachwechsel bricht die Ueberschrift. Reproduziert und gefilmt bei
   * 1440 px: aus "Wissen" wird "Knowledge", und weil die Buchstaben ihren
   * Platz in der Liste als Schluessel tragen, bleiben die ersten sechs
   * stehen und nur "dge" laeuft von unten herein. Auf halber Strecke steht
   * also "Knowle" und daneben ein halbes, angeschnittenes "d".
   *
   * Sein Vorschlag war, beim Sprachwechsel gar nicht zu animieren, und der
   * ist richtig: die Walze erzaehlt "dasselbe Wort, neue Bedeutung". Beim
   * Sprachwechsel wechselt aber nicht das Wort, sondern die ganze Seite,
   * und dann ist ein Rollen die falsche Aussage, selbst wenn es sauber
   * liefe. Also: einmal stumm zeichnen, danach laeuft alles wie vorher.
   */
  sprache?: Lang; stumm?: boolean;
  b01?: number; b01Hand?: Record<number, string>; frak?: string | null;
  /**
   * Das Rennen in der Zeile CrowdQuiz.
   *
   * Wolf am 28.08.: "crowdquiz avatare machen kein rennen absicht? beim rennen
   * koennte man freistehend sowas machen wie +85 punkte bei einem team, dann
   * aendert sich die reihenfolge, das waere nice, weil genau das im spiel
   * passiert".
   *
   * Ja, Absicht -- und die falsche. Mit der Tabelle ist auch das Rennen
   * rausgeflogen, uebrig blieben acht Logos. Was CrowdQuiz von acht Wappen
   * unterscheidet, ist nicht die Liste, sondern das Ereignis: eine Fraktion
   * punktet, und die Reihenfolge kippt.
   *
   * frakPunkte  Stand je Fraktion, nur fuer die Reihenfolge gebraucht.
   * frakTreffer Wer gerade gepunktet hat und um wie viel. Die Zahl steigt
   *             neben dem Wappen auf und verschwindet.
   * frakZieht   Wer gerade den Platz wechselt. Wer unterwegs ist, geht auf
   *             halbe Deckkraft und hinter die stehenden, damit sich beim
   *             Ueberholen nie zwei volle Wappen verdecken.
   */
  frakPunkte?: Record<string, number>;
  frakTreffer?: { id: string; p: number; n: number } | null;
  frakZieht?: Record<string, true>;
  /** Avatarwand in 01: Motiv und Farbe je Kachel, und welche gerade dran ist. */
  avObj?: number[]; avFarbe?: number[]; avAn?: number | null;
  /** Lage des Zeigers auf der Leinwand, 0 bis 1, fuer den Lichtkegel. */
  beamXY?: { x: number; y: number } | null;
  /** Worauf gerade gezeigt wird, in 05, 06 und 07. Schluessel ist der Text. */
  zeig?: string | null;
  tick?: number; hbOn?: number | null;
  probeCat?: string; probePick?: number | null;
  guessRaw?: string; guessDone?: boolean;
  points?: number[]; pointsDone?: boolean;
  /** Fix It in der Bunten Tuete: angetippte Karten in Tippreihenfolge. */
  ordSel?: number[]; ordDone?: boolean;
  /** Laeuft die Uhr zur naechsten Kategorie in 03? */
  weiterAn?: boolean;
  ptilt?: { x: number; y: number } | null; pUp?: boolean;
  boardWinW?: number; boardWinH?: number;
};

class OnePageInner extends Component<{ lang: Lang }, OPState> {
  state: OPState = { formMode: 'event', formStatus: 'idle' };

  /**
   * Sprachwechsel erkennen, bevor gezeichnet wird.
   *
   * Es muss hier stehen und nicht in componentDidUpdate: dort waere der
   * kaputte Anstrich schon auf dem Schirm gewesen und wuerde erst im
   * naechsten Bild korrigiert -- also genau das Zucken, das wir loswerden
   * wollen. Dazu faellt das vorherige Wort weg (hookVor), sonst laeuft
   * beim Wechsel ein Wort nach oben hinaus, das in dieser Sprache nie auf
   * dem Schirm stand.
   */
  static getDerivedStateFromProps(props: { lang: Lang }, state: OPState): Partial<OPState> | null {
    if (state.sprache === props.lang) return null;
    // Beim allerersten Anstrich gibt es nichts stummzuschalten, da laeuft
    // noch gar keine Walze.
    const erster = state.sprache === undefined;
    return { sprache: props.lang, stumm: !erster, hookVor: null };
  }

  gameTimer: ReturnType<typeof setInterval> | undefined;
  _spielSichtbar = false;
  _spielIO: IntersectionObserver | undefined;
  _reduziert = false;
  _b01T: ReturnType<typeof setInterval> | undefined;
  /** Welche Felder gerade belegt sind, fuer brettSetzen. */
  _b01Feld: boolean[] = [];
  /** Laeuft gerade der Abraeum-Zeitgeber? Dann nicht noch einen starten. */
  _b01Voll = false;
  _b01Neu: ReturnType<typeof setTimeout> | undefined;
  // Solange der Zeiger auf einem Objekt liegt, wechselt die Ueberschrift nicht
  // von selbst weiter. Sonst springt sie einem unter der Hand weg.
  _wortHalt = false;
  wallRO: ResizeObserver | undefined;
  io: IntersectionObserver | undefined;
  private _beamT: ReturnType<typeof setTimeout> | undefined;
  private _ablaufIO: IntersectionObserver | undefined;
  private _weiterT: ReturnType<typeof setTimeout> | undefined;
  private _avT: ReturnType<typeof setInterval> | undefined;
  private _frakT: ReturnType<typeof setInterval> | undefined;
  private _frakAusT: ReturnType<typeof setTimeout> | undefined;
  private _hookT: ReturnType<typeof setInterval> | undefined;
  private _boardWinEl: HTMLElement | null = null;
  private _boardWinRO: ResizeObserver | undefined;
  private _pStage: HTMLElement | null = null;
  private _pStageIO: IntersectionObserver | undefined;
  private _coarse = false;
  /** Die Flaeche mit den Fugen in 04. Traegt den Lichtfleck des Zeigers. */
  private _wand: HTMLDivElement | null = null;
  /** Der Wolf auf der Begruessungsfolie. Laeuft einmal, wenn die Lampe angeht. */
  private _wolfV: HTMLVideoElement | null = null;
  private onScroll: (() => void) | undefined;

  get T(): OnePageDict { return onePageT(this.props.lang); }
  get locale(): string { return this.props.lang === 'de' ? 'de-DE' : 'en-GB'; }

  // ------------------------------------------------- Formular (Formspree)
  submitForm = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    data.set('art', this.state.formMode === 'test' ? 'Test-Team' : 'Event-Anfrage');
    this.setState({ formStatus: 'sending' });
    try {
      const res = await fetch('https://formspree.io/f/' + FORMSPREE_ID, {
        method: 'POST', body: data, headers: { Accept: 'application/json' },
      });
      if (res.ok) { form.reset(); this.setState({ formStatus: 'ok' }); }
      else this.setState({ formStatus: 'error' });
    } catch { this.setState({ formStatus: 'error' }); }
  };

  openForm(mode: 'event' | 'test') {
    this.setState({ formMode: mode, formStatus: 'idle' });
    let n = 0;
    const settle = () => {
      const p = document.querySelector('[data-form-panel]');
      if (!p) return;
      const r = p.getBoundingClientRect();
      const over = r.bottom - window.innerHeight + 28;
      if (over > 4) window.scrollBy({ top: Math.min(over, r.top - 96), behavior: 'smooth' });
      if (++n < 14) setTimeout(settle, 90);
    };
    setTimeout(settle, 120);
  }

  startGame() {
    clearInterval(this.gameTimer);
    this.setState({ tick: 0 });
    this.gameTimer = setInterval(() => {
      this.setState(st => ({ tick: ((st.tick ?? 0) + 1) % (CYCLE * (ROUNDS.length + 1)) }));
    }, 190);
  }

  /* Hier standen frakFuehrt() und arenaTick(): die simulierte Wertung der
     acht Fraktionen, acht Runden lang, mit Rangfolge und kurzem Rahmen fuer
     jede Zeile, die den Platz wechselte. Sie hat nur die Tabelle in der Zeile
     CrowdQuiz gefuettert, und die ist am 28.08. rausgeflogen (siehe dort).
     Ohne Tabelle gibt es keinen Stand mehr anzuzeigen, und acht feste
     Fraktionen brauchen auf einer Website keinen Punktestand -- der gehoert
     auf die Leinwand am Abend. */
  /**
   * Das Brett in Station 01 spielt weiter, solange der Zeiger darauf liegt.
   *
   * Wolf: "beim hovern setzen sich felder ... waere auch krass wenn sich das
   * feld da setzt wo man die maus hinmacht und wenn man nebendran ist laeuft
   * automatisch". Genau das: ueber dem Brett laeuft die Choreografie weiter,
   * ueber einem leeren Feld setzt sich dieses Feld.
   *
   * Der Abschnitt spielt die Choreografie ausserdem einmal von selbst durch,
   * sobald er zu sehen ist. Wer nur scrollt, sieht das Brett trotzdem
   * entstehen; wer stehenbleibt, kann selbst setzen. Neun Zuege zu 650 ms
   * sind knapp sechs Sekunden, nicht die viereinhalb Minuten der alten
   * Beamer-Uhr.
   */
  brettLauf(an: boolean) {
    clearInterval(this._b01T);
    if (!an || this._reduziert) return;
    this._b01T = setInterval(() => {
      this.setState(st => {
        const n = (st.b01 ?? 0) + 1;
        if (n > MOVES.length) { clearInterval(this._b01T); queueMicrotask(() => this.brettPruefen()); return null; }
        return { b01: n };
      });
    }, 650);
  }

  /**
   * Wolf am 2026-08-27: "loop muesste irgendwann neu anfangen wenn voll".
   * Sobald kein leeres Feld mehr da ist, bleibt der Endstand kurz stehen,
   * damit man ihn noch sieht, danach wird abgeraeumt und neu gesetzt.
   * Wer per Hand setzt, fuellt die Reste selbst auf, also ist der Ausloeser
   * das volle Brett und nicht das Ende der Choreografie.
   */
  brettPruefen() {
    if (this._b01Voll || this._reduziert) return;
    const g = this.gameVals(((this.state.b01 ?? 0) ? CYCLE * ((this.state.b01 ?? 0) - 1) + R_END + 1 : 0), this.state.b01Hand, this.state.b01 ?? 0);
    if (g.cells.some(c => !c.owned)) return;
    this._b01Voll = true;
    this._b01Neu = setTimeout(() => {
      this._b01Voll = false;
      this.setState({ b01: 0, b01Hand: {} }, () => {
        if (this._spielSichtbar) this.brettLauf(true);
      });
    }, 1800);
  }

  /** Ein leeres Feld beim Zeigen selbst setzen. Besetzte bleiben unberuehrt:
   *  klauen soll man nicht aus Versehen. Die Teams kommen reihum. */
  brettSetzen(i: number) {
    if (this._coarse || this._b01Feld[i]) return;
    this.setState(st => {
      const hand = { ...(st.b01Hand || {}) };
      if (hand[i]) return null;
      hand[i] = TEAMS[Object.keys(hand).length % TEAMS.length].id;
      return { b01Hand: hand };
    }, () => this.brettPruefen());
  }

  /**
   * Die Rangfolge der Fraktionen fuellt sich, solange der Abschnitt zu sehen
   * ist, und sonst nicht.
   *
   * Vorher hing sie am Aufklappen der Karten: wer nicht mit der Maus darauf
   * ging, sah leere Balken. In der Fassung „Leinwand" gibt es kein Aufklappen
   * mehr, an dem sich der Start festmachen koennte. Sichtbarkeit ist der
   * ehrlichere Ausloeser: rechnen, wenn jemand hinsieht.
   *
   * Das Brett daneben braucht keinen Zeitgeber, es zeigt einen festen
   * Endstand (siehe gameVals). Die laufende Runde steht im Abschnitt Ablauf.
   */
  /**
   * Der Beamer geht beim Scrollen von allein an.
   *
   * Wolf am 28.08.: "es muss irgendeine art von anschalt motion bei scroll
   * geben". Bisher startete die Projektion nur bei onMouseEnter oder Klick,
   * und onMouseLeave schaltete sie wieder aus. Wer an 04 vorbeiscrollte, ohne
   * die Maus auf die Wand zu legen, sah nie etwas -- und auf einem Touchgeraet
   * gibt es Hover ueberhaupt nicht.
   *
   * Wolf am 28.08.: "beamer geht schon an bevor scroll da ist, kurzer flacker
   * moment soll da sein bei scroll, reset bei wieder hochscrollen?"
   *
   * Beides stimmte, und beides hatte dieselbe Ursache: beobachtet wurde der
   * ganze Abschnitt #ablauf. Der ist hoch, seine 45 Prozent sind lange
   * erreicht, bevor die Projektion ueberhaupt im Bild ist -- die Lampe ging
   * also samt Flackern an, waehrend man noch die Ueberschrift las. Jetzt
   * haengt der Ausloeser an der Projektion selbst, und zwar bei 55 Prozent
   * von ihr: sie steht dann sichtbar da, das Flackern faellt in den Moment,
   * in dem man sie ansieht.
   *
   * Dazu der Rueckweg. Bisher lief das genau einmal je Besuch, aus Sorge vor
   * einem Beamer, der bei jedem Vorbeiscrollen neu hochfaehrt. Die Sorge
   * loest sich mit einem weiten Totbereich: an geht sie bei 55 Prozent, aus
   * erst, wenn die Projektion GANZ aus dem Bild ist. Dazwischen liegt eine
   * volle Fensterhoehe, in der nichts passiert; ein Blinker braucht zwei
   * Schwellen, die dicht beieinander liegen.
   */
  ablaufBeobachten() {
    const el = document.querySelector('[data-m="wall"]');
    if (!el || typeof IntersectionObserver === 'undefined') return;
    this._ablaufIO = new IntersectionObserver(entries => {
      const e = entries[entries.length - 1];
      if (e.intersectionRatio >= 0.55) this.beamAn();
      else if (e.intersectionRatio === 0) this.beamAus();
    }, { threshold: [0, 0.55] });
    this._ablaufIO.observe(el);
  }

  /** Die Lampe an und die Folge starten. Aus beamStart herausgeloest, weil
   *  jetzt zwei Stellen sie brauchen: der Zeiger und der Beobachter. */
  beamAn() {
    if (this.state.beam) return;
    clearTimeout(this._beamT);
    clearInterval(this.gameTimer);
    this.setState({ beam: true, beamWelcome: true });
    const v = this._wolfV;
    if (v) { try { v.currentTime = 0; void v.play().catch(() => { /* stumm, blockt nicht */ }); } catch { /* egal */ } }
    // 5,2 s statt 3,8: so lang ist die Geste des Wolfs. Kuerzer hiesse, sie
    // mitten im Satz abzuschneiden.
    this._beamT = setTimeout(() => { this.setState({ beamWelcome: false }); this.startGame(); }, 5200);
  }

  /** Die Lampe aus, sobald die Projektion ganz aus dem Bild ist. Damit faengt
   *  der naechste Besuch wieder mit dem Flackern an, statt mit einem Bild,
   *  das schon laeuft. */
  beamAus() {
    if (!this.state.beam) return;
    clearTimeout(this._beamT);
    clearInterval(this.gameTimer);
    this._wolfV?.pause();
    this.setState({ beam: false, beamWelcome: false, tick: 0 });
  }

  spielartenBeobachten() {
    const el = document.getElementById('spielarten');
    if (!el || typeof IntersectionObserver === 'undefined') return;
    this._reduziert = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this._spielIO = new IntersectionObserver(([e]) => {
      this._spielSichtbar = e.isIntersecting;
      if (!e.isIntersecting) { this.brettLauf(false); this.frakLauf(false); return; }
      if ((this.state.b01 ?? 0) < MOVES.length) this.brettLauf(true);
      this.frakLauf(true);
    }, { rootMargin: '0px 0px -12% 0px' });
    this._spielIO.observe(el);
  }

  /** Hoehe des Fussbereichs als CSS-Variable, fuer die Mitte des Spruchs. */
  fussMessen = () => {
    const f = document.querySelector('footer');
    if (!f) return;
    const setzen = () => document.documentElement.style.setProperty('--fuss', `${Math.round(f.getBoundingClientRect().height)}px`);
    setzen();
    if (typeof ResizeObserver !== 'undefined') {
      this._fussRO = new ResizeObserver(setzen);
      this._fussRO.observe(f);
    }
  };
  _fussRO: ResizeObserver | undefined;

  watchWall() {
    const box = document.querySelector('[data-m="screenbox"]');
    if (!box || typeof ResizeObserver === 'undefined') return;
    const measure = () => {
      // Nicht getBoundingClientRect: seit die Leinwand gekippt steht, liefert
      // das die Huellbox der Drehung und damit zu viel. clientWidth ist die
      // Breite im eigenen Koordinatensystem, also die, um die es geht.
      const w = (box as HTMLElement).clientWidth, h = (box as HTMLElement).clientHeight;
      if (!w || !h) return;
      const sc = Math.min(w / WALL_W, h / WALL_H);
      if (Math.abs((this.state.wallScale ?? 0) - sc) > 0.002) this.setState({ wallScale: sc });
    };
    this.wallRO = new ResizeObserver(measure);
    this.wallRO.observe(box);
    measure();
  }

  boardWinRef = (el: HTMLElement | null) => {
    if (!el || this._boardWinEl === el) return;
    this._boardWinEl = el;
    this._boardWinRO = new ResizeObserver(() => {
      const w = el.clientWidth, h = el.clientHeight;
      if (w > 0 && (w !== this.state.boardWinW || h !== this.state.boardWinH)) this.setState({ boardWinW: w, boardWinH: h });
    });
    this._boardWinRO.observe(el);
  };

  phoneStageRef = (el: HTMLElement | null) => {
    if (!el || this._pStage === el) return;
    this._pStage = el;
    if (this.state.pUp === undefined) this.setState({ pUp: false });
    this._pStageIO = new IntersectionObserver(([en]) => {
      this.setState({ pUp: en.isIntersecting });
    }, { threshold: 0.35 });
    this._pStageIO.observe(el);
  };


  /**
   * Wer ueber cozywolf.de/testen kommt, soll das Test-Team-Formular sehen.
   *
   * Wolf bewirbt diesen Link in seinen Instagram-Beitraegen ("Alles zum
   * Testen: cozywolf.de/testen"). Die Weiterleitung fuehrte auf /#anfragen,
   * und dort stand das Formular in seiner Vorgabe: "Event anfragen", also die
   * kostenpflichtige Anfrage. Wer auf "euer Abend geht aufs Haus" klickt und
   * auf einem Formular landet, das nach einem Termin fuer ein bezahltes Event
   * fragt, hat den Faden verloren -- und zwar an der einzigen Stelle, an der
   * Wolf gerade aktiv Leute hinschickt.
   *
   * Jetzt fuehrt /testen auf /#testen, und das liest diese Funktion aus. Der
   * Abschnitt heisst weiter "anfragen", der Sprung geht also von Hand.
   */
  vomTestlink(): boolean {
    if (typeof window === 'undefined') return false;
    if (window.location.hash !== '#testen') return false;
    // Der Sprung von Hand, weil kein Element diese Kennung traegt.
    setTimeout(() => document.getElementById('anfragen')?.scrollIntoView({ block: 'start' }), 60);
    return true;
  }

  // ------------------------------------------------- Lifecycle
  componentDidMount() {
    if (this.vomTestlink()) this.setState({ formMode: 'test' });
    setTimeout(() => this.watchWall(), 60);
    this.fussMessen();
    this._coarse = window.matchMedia('(hover:none)').matches || window.innerWidth < 861;
    this._hookT = setInterval(() => {
      if (document.hidden || this._wortHalt) return;
      this.setState(s => ({ hookVor: s.hookI ?? 0, hookI: (s.hookI ?? 0) + 1, stumm: false }));
    }, 6800);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    /* Wolf am 28.08.: "der scrolleffekt der ueberschriften geht nach einmal
       scrollen nicht mehr, kann das sein?"

       Ja, und es war so gebaut. Der Beobachter unten meldet das Element nach
       dem ersten Auftauchen ab (unobserve) und setzt Deckkraft und Verschiebung
       fest auf den Endwert. Eine Einfahrt, einmal je Seitenaufruf -- wer
       zurueckscrollt, sieht nichts mehr.

       Das ist nicht das, was T3 sein sollte. Der Effekt soll an der
       SCROLLPOSITION haengen, nicht an einem einmaligen Ereignis: dann laeuft
       er beim Hochscrollen rueckwaerts und beim Runterscrollen wieder vor, so
       oft man will.

       Wo der Browser Scroll-Zeitgeber kennt, uebernimmt also das CSS
       (animation-timeline:view(), siehe css.ts), und der Beobachter hier haelt
       sich ganz raus -- inklusive der Startwerte, denn inline gesetzte
       Deckkraft null waere sonst der Zustand, den Firefox ohne Zeitgeber
       nie wieder verliert.

       Der Beobachter bleibt als Rueckfallebene fuer Browser ohne
       Scroll-Zeitgeber. Dort ist eine einmalige Einfahrt besser als keine. */
    const zeitgeber = typeof CSS !== 'undefined'
      && typeof CSS.supports === 'function'
      && CSS.supports('animation-timeline', 'view()');
    if (zeitgeber) {
      requestAnimationFrame(() => {
        this.grundfarbenBeobachten();
        this.spielartenBeobachten();
        this.ablaufBeobachten();
      });
      return;
    }

    // Die Bewegung sitzt am Abschnittswechsel: der ganze Abschnitt baut sich
    // beim Erreichen einmal in Folge auf (Richtung E3 des Entwurfs).
    this.io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const sec = e.target;
        this.io?.unobserve(sec);
        const SOFT = 'cubic-bezier(.16,.68,.24,1)';
        const items = Array.from(sec.querySelectorAll<HTMLElement>('[data-reveal]'));
        items.forEach((el, i) => {
          const d = i * 150;
          el.style.transition = `opacity 1.3s ${SOFT} ${d}ms, transform 1.6s ${SOFT} ${d}ms, filter 1.3s ${SOFT} ${d}ms`;
          el.style.opacity = '1';
          el.style.transform = 'none';
          el.style.filter = 'none';
          if (el.hasAttribute('data-stagger')) {
            Array.from(el.children as HTMLCollectionOf<HTMLElement>).forEach((c, j) => {
              c.style.transition = `opacity 1.2s ${SOFT} ${d + 160 + j * 150}ms, transform 1.5s ${SOFT} ${d + 160 + j * 150}ms`;
              c.style.opacity = '1';
              c.style.transform = 'none';
            });
          }
        });
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -12% 0px' });

    requestAnimationFrame(() => {
      document.querySelectorAll<HTMLElement>('[data-reveal]').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(24px) scale(.994)';
        el.style.filter = 'blur(3px)';
        el.style.transformOrigin = 'left top';
        if (el.hasAttribute('data-stagger')) {
          Array.from(el.children as HTMLCollectionOf<HTMLElement>).forEach(c => {
            c.style.opacity = '0'; c.style.transform = 'translateY(18px)';
          });
        }
      });
      document.querySelectorAll('section').forEach(s => this.io?.observe(s));
      this.grundfarbenBeobachten();
      this.spielartenBeobachten();
      this.ablaufBeobachten();
      document.querySelectorAll<HTMLElement>('section[data-ton]').forEach(el => {
        el.style.setProperty('--cw-band', el.dataset.ton || '10,8,20');
      });
    });

    this.onScroll = () => {
      const y = window.scrollY || 0;
      const h = document.querySelector('[data-header]') as HTMLElement | null;
      if (h) {
        const tight = y > 60;
        h.style.paddingTop = tight ? '0px' : '';
        h.style.background = tight ? 'rgba(10,8,20,.94)' : '';
        h.style.borderBottomColor = tight ? 'rgba(250,75,163,.32)' : '';
        const inner = h.firstElementChild as HTMLElement | null;
        if (inner) inner.style.padding = tight ? '9px 32px' : '14px 32px';
      }
    };
    window.addEventListener('scroll', this.onScroll, { passive: true });
  }

  /**
   * Ein Zug im Rennen: eine Fraktion punktet, danach steht sie anders.
   *
   * Die SEITE bleibt je Fraktion fest -- drei links, fuenf rechts -- und daran
   * aendert kein Punktestand etwas. Sonst spraenge ein Wappen quer ueber die
   * Textspalte, wenn es von Platz 4 auf 3 zieht. Der PLATZ innerhalb der Seite
   * folgt dem Gesamtstand: bewegt wird also nur senkrecht in der eigenen
   * Spalte, und die Plaetze einer Spalte ueberschneiden sich per Konstruktion
   * nicht.
   *
   * Der Preis ist ehrlich zu benennen: eine durchgehende Rangfolge von 1 bis 8
   * laesst sich so nicht ablesen. Das ist die Aufgabe der Tabelle, und die
   * gehoert auf die Leinwand am Abend. Hier geht es darum, dass es sich bewegt
   * und warum.
   */
  frakZug() {
    const ids = FACTIONS.map(f => f.id);
    const wer = ids[Math.floor(Math.random() * ids.length)];
    const p = FRAK_PUNKTE[Math.floor(Math.random() * FRAK_PUNKTE.length)];
    this.setState(st => {
      const stand = { ...(st.frakPunkte ?? {}) };
      for (const id of ids) if (stand[id] == null) stand[id] = 0;
      const platz = (q: Record<string, number>, gruppe: string[]) =>
        gruppe.slice().sort((a, b) => (q[b] ?? 0) - (q[a] ?? 0));
      const links = FRAK_LINKS.map(x => x.id), rechts = FRAK_RECHTS.map(x => x.id);
      const vor = [...platz(stand, links), ...platz(stand, rechts)];
      for (const id of ids) stand[id] *= FRAK_ZERFALL;
      stand[wer] += p;
      const nach = [...platz(stand, links), ...platz(stand, rechts)];
      const zieht: Record<string, true> = {};
      for (const id of ids) if (vor.indexOf(id) !== nach.indexOf(id)) zieht[id] = true;
      return { frakPunkte: stand, frakZieht: zieht,
        frakTreffer: { id: wer, p, n: (st.frakTreffer?.n ?? 0) + 1 } };
    });
    clearTimeout(this._frakAusT);
    this._frakAusT = setTimeout(() => this.setState({ frakZieht: {}, frakTreffer: null }), 1900);
  }

  /** Das Rennen laeuft nur, solange 01 im Bild ist. */
  frakLauf(an: boolean) {
    clearInterval(this._frakT);
    if (!an || this._reduziert) return;
    this._frakT = setInterval(() => { if (!document.hidden) this.frakZug(); }, FRAK_TAKT);
  }

  /** Die naechste Kategorie in 03, im Kreis. */
  naechsteKat() {
    const i = PROBE_ORDER.indexOf(this.state.probeCat || 'mucho');
    return PROBE_ORDER[(i + 1) % PROBE_ORDER.length];
  }

  /** Kategorie wechseln und alles zuruecksetzen, was zur alten gehoerte. */
  probeWechsel(k: string) {
    clearTimeout(this._weiterT);
    this.setState({
      probeCat: k, probePick: null, guessRaw: '', guessDone: false,
      points: [0, 0, 0], pointsDone: false, ordSel: [], ordDone: false, weiterAn: false,
    });
  }

  /** Nach einer Aufloesung: Uhr zur naechsten Kategorie starten. */
  weiterAb() {
    clearTimeout(this._weiterT);
    this.setState({ weiterAn: true });
    this._weiterT = setTimeout(() => this.probeWechsel(this.naechsteKat()), WEITER_MS);
  }

  /**
   * Eine Kachel der Avatarwand einen Schritt weiter: naechstes Motiv, naechste
   * Farbe. Das Motiv wird uebersprungen, wenn es schon im Bild steht -- sonst
   * stuenden zwei gleiche Zeichen nebeneinander, und das waere ein Fehler und
   * keine freie Wahl. Nicht "+ 8" rechnen: das haelt nur, solange der Vorrat
   * durch acht teilbar ist.
   */
  avSchritt(i: number) {
    this.setState(st => {
      const obj = (st.avObj ?? AV_MOTIVE.map((_, k) => k).slice(0, 8)).slice();
      const far = (st.avFarbe ?? AV_FARBEN.map((_, k) => k)).slice();
      let kandidat = (obj[i] + 1) % AV_MOTIVE.length, versuche = 0;
      while (obj.includes(kandidat) && versuche < AV_MOTIVE.length) {
        kandidat = (kandidat + 1) % AV_MOTIVE.length; versuche++;
      }
      obj[i] = kandidat;
      far[i] = (far[i] + 1) % AV_FARBEN.length;
      return { avObj: obj, avFarbe: far };
    });
  }

  /** Zeiger liegt auf einer Kachel: sie wechselt durch, bis er weitergeht. */
  avStart(i: number) {
    clearInterval(this._avT);
    clearInterval(this._frakT);
    clearTimeout(this._frakAusT);
    this.setState({ avAn: i });
    if (this._reduziert) { this.avSchritt(i); return; }
    this.avSchritt(i);
    this._avT = setInterval(() => this.avSchritt(i), AV_TAKT);
  }

  avStop() {
    clearInterval(this._avT);
    this.setState({ avAn: null });
  }

  componentWillUnmount() {
    clearInterval(this._avT);
    clearTimeout(this._weiterT);
    clearInterval(this.gameTimer);
    clearInterval(this._b01T);
    clearTimeout(this._b01Neu);
    clearTimeout(this._beamT);
    clearInterval(this._hookT);
    this._fussRO?.disconnect();
    this.io?.disconnect();
    this._grundIO?.disconnect();
    this.wallRO?.disconnect();
    this._boardWinRO?.disconnect();
    this._pStageIO?.disconnect();
    if (this.onScroll) window.removeEventListener('scroll', this.onScroll);
  }


  // Grundfarbe je Abschnitt (Twitch Turbo). Eigener Beobachter, weil dieser
  // beim Verlassen NICHT abbestellt: wer zurueckscrollt, soll die Farbe des
  // Abschnitts wiedersehen, in dem er landet.
  private _grundIO: IntersectionObserver | undefined;

  grundfarbenBeobachten() {
    const TOENE: Record<string, string> = {
      top:        '10,8,20',      // Hero bleibt der reine Grund
      spielarten: '168,85,247',   // Lila, die Farbe der Kristallkugel
      probieren:  '59,130,246',   // Blau, Mu-Cho
      ablauf:     '34,197,94',    // Gruen, der Pilz
      johannes:   '249,115,22',   // Orange, die Teekanne
      fragen:     '250,204,21',   // Gelb, der Wuerfel
      anfragen:   '250,75,163',   // Das Marken-Pink, einmal, am Ziel
    };
    const wurzel = document.documentElement;
    this._grundIO = new IntersectionObserver((eintraege) => {
      // Der Abschnitt, der am meisten Bild einnimmt, gibt den Ton an.
      const sichtbar = eintraege.filter(e => e.isIntersecting);
      if (!sichtbar.length) return;
      const bester = sichtbar.reduce((a, b2) => b2.intersectionRatio > a.intersectionRatio ? b2 : a);
      const ton = TOENE[(bester.target as HTMLElement).id] ?? '10,8,20';
      wurzel.style.setProperty('--cw-grundton', ton);
    }, { threshold: [0.12, 0.3, 0.55, 0.8] });
    document.querySelectorAll('section[id]').forEach(s => this._grundIO?.observe(s));
  }

  // ------------------------------------------------- Abschnitte
  renderHeader() {
    const L = this.T;
    const langBtn = (on: boolean) => `appearance:none;border:0;cursor:pointer;font:inherit;font-size:12.5px;font-weight:900;letter-spacing:.06em;padding:6px 11px;border-radius:999px;transition:background .25s ${EASE},color .25s ${EASE};background:${on ? '#F6EFE6' : 'transparent'};color:${on ? '#0A0814' : 'rgba(246,239,230,.62)'}`;
    return (
      <header data-header="" style={sx(`position:sticky;overflow:visible;top:0;z-index:20;transition:padding .3s ${EASE},background .3s ${EASE},border-color .3s ${EASE};backdrop-filter:blur(14px);background:rgba(10,8,20,.86)${schatten(';box-shadow:0 12px 34px rgba(10,8,20,.55)')}`)}>
        <div data-shell="" style={sx('max-width:1180px;margin:0 auto;padding:14px 32px;display:flex;align-items:center;gap:32px;white-space:nowrap')}>
          <a href="#top" style={sx('display:flex;align-items:center;gap:10px')}>
            <img src={LOGO} alt="CozyWolf" width={38} height={38} style={sx('width:38px;height:38px')} />
            <span style={sx("font-family:'League Spartan',sans-serif;font-weight:900;font-size:21px;letter-spacing:.02em;color:#F6EFE6")}>COZYWOLF</span>
          </a>
          <nav data-m="nav" style={sx('display:flex;gap:26px;margin-left:auto;font-size:15px;font-weight:700;color:rgba(246,239,230,.78)')}>
            <a href="#spielarten" style={sx('color:rgba(246,239,230,.78)')}>{L.nav.spielarten}</a>
            <a href="#probieren" style={sx('color:rgba(246,239,230,.78)')}>{L.nav.probieren}</a>
            <a href="#ablauf" style={sx('color:rgba(246,239,230,.78)')}>{L.nav.ablauf}</a>
            <a href="#johannes" style={sx('color:rgba(246,239,230,.78)')}>{L.nav.ueber}</a>
          </nav>
          <div data-m="lang" style={sx('display:flex;align-items:center;gap:4px;padding:3px;border-radius:999px;border:1px solid rgba(246,239,230,.1);background:rgba(246,239,230,.03)')}>
            <button type="button" onClick={() => setLang('de')} style={sx(langBtn(this.props.lang === 'de'))}>DE</button>
            <button type="button" onClick={() => setLang('en')} style={sx(langBtn(this.props.lang === 'en'))}>EN</button>
          </div>
          <a href="#anfragen" className="cwHovA" style={sx(`padding:11px 20px;border-radius:999px;background:#F6EFE6;color:#0A0814;font-weight:900;font-size:15px;transition:filter .28s ${EASE}`)}>{L.nav.cta}</a>
        </div>
      </header>
    );
  }

  renderHero() {
    const L = this.T;
    const on = this.state.hbOn ?? null;
    // Der gefuellte Knopf ist btn0, „Gratis fuer Test-Teams". Das sieht nach
    // einer Verwechslung aus - normalerweise gehoert die Buchung nach vorn -
    // ist aber Absicht: Wolf hat aktuell noch keine Kunden und braucht zuerst
    // Test-Teams (2026-08-27). Sobald Termine laufen, gehoert „Termin anfragen"
    // auf Platz 0 und das Gratisangebot auf Platz 1.
    /**
     * Wolf am 28.08.: "die buttons haben eine alte motion, gefaellt mir nicht
     * mehr, wie waere es dass sich ein button langsam fuellt mit der aktuellen
     * farbe des wortes oben wenn man draufbleibt? und sobald das wort wechselt
     * wechselt die farbe smooth wie oben auch".
     *
     * Weg ist die alte Bewegung, und sie war der Grund fuer sein Unbehagen:
     * der Knopf unter dem Zeiger wuchs von 50 auf 60 Prozent Breite, der
     * andere schrumpfte auf 40, dazu wechselten beide die Schriftgroesse. Die
     * zwei Knoepfe sind also bei jeder Mausbewegung gesprungen, und was
     * springt, laesst sich nicht anklicken, ohne dass man kurz zielt. Beide
     * behalten jetzt ihre Breite.
     *
     * Stattdessen laeuft die Fuellung von links herein, in der Farbe des
     * Wortes, das oben gerade steht. Damit haengt der Knopf am selben Faden
     * wie Ueberschrift und Objekt: ein Wort, eine Farbe, ein Gegenstand -- und
     * jetzt auch ein Knopf.
     *
     * Wechselt das Wort, waehrend der Zeiger liegen bleibt, blendet die Farbe
     * hinueber statt umzuspringen. 0,62 s, dieselbe Dauer wie die Wortwalze
     * (cwWortEin/cwWortAus in css.ts), damit beide als eine Bewegung gelesen
     * werden.
     *
     * Die Hoehe ist fest vorgehalten. Vorher wuchs der Knopf beim Zeigen von
     * 66 auf 79 px, weil die Unterzeile aufklappte, und weil die Reihe auf
     * stretch steht wuchs der andere gleich mit -- die Zeile darunter ist also
     * bei jeder Mausbewegung 13 px gerutscht. Bei 84 px Mindesthoehe passt die
     * aufgeklappte Unterzeile hinein, ohne dass sich aussen etwas bewegt.
     *
     * Die Schrift wird im gefuellten Zustand dunkel, und zwar bei allen fuenf
     * Farben. Nachgerechnet nach WCAG gegen den Grund #0A0814 und gegen Creme:
     *   Orange  7,08 : 2,46      Gruen  8,71 : 2,00
     *   Violett 5,02 : 3,47      Gelb  12,96 : 1,34
     *   Blau    5,40 : 3,22
     * Dunkel gewinnt ueberall, der schlechteste Fall ist 5,02 und liegt damit
     * ueber den 4,5 der Stufe AA. Es braucht also keine Fallunterscheidung je
     * Farbe.
     *
     * Die Unterzeile stand zuerst auf 70 Prozent Deckkraft und ist deshalb
     * jetzt voll deckend. Nachgerechnet auf der gefuellten Flaeche:
     *   70 %:  Orange 4,48  Violett 3,50  Gruen 5,10  Gelb 6,33  Blau 3,68
     *   80 %:  Orange 5,47  Violett 4,08  Gruen 6,44  Gelb 8,57  Blau 4,34
     *  100 %:  Orange 7,08  Violett 5,02  Gruen 8,71  Gelb 12,96 Blau 5,40
     * Bei 12,5 px fett gilt der normale Schwellwert von 4,5, nicht die 3,0 fuer
     * grosse Schrift -- gross ist erst 18,66 px fett. 70 und 80 Prozent fallen
     * damit auf Violett und Blau durch, 100 haelt ueberall.
     */
    const hb = (i: number, wortFarbe: string) => {
      const hot = on === i;
      const primary = i === 0;
      return {
        style: 'position:relative;display:flex;align-items:center;justify-content:center;flex:1;min-width:0;box-sizing:border-box;'
          + 'overflow:hidden;border-radius:999px;white-space:nowrap;font-weight:900;min-height:84px;padding:19px 22px;font-size:17px;'
          + (primary ? 'background:#F6EFE6;' : 'background:transparent;')
          + `border:1.5px solid ${primary ? 'transparent' : (hot ? wortFarbe : 'rgba(246,239,230,.38)')};`
          + `box-shadow:${primary ? '0 12px 30px rgba(0,0,0,.38)' : 'none'};`
          + `transition:border-color .62s ${EASE}`,
        // Von links herein, nicht von unten: links faengt der Satz an, und die
        // Richtung ist dieselbe wie beim Fortschrittsstrich in 03.
        fill: `position:absolute;inset:0;background:${wortFarbe};`
          + `transform:scaleX(${hot ? 1 : 0});transform-origin:left center;`
          + `transition:transform .62s ${EASE},background-color .62s ${EASE}`,
        lab: `display:block;line-height:1.15em;font-size:inherit;`
          + `color:${hot ? '#0A0814' : (primary ? '#0A0814' : '#F6EFE6')};transition:color .4s ${EASE}`,
        sub: `display:block;overflow:hidden;max-height:${hot ? '22px' : '0'};transition:max-height .5s ${EASE}`,
        subIn: 'display:block;padding-top:4px;font-size:12.5px;font-weight:800;letter-spacing:.02em;white-space:nowrap;'
          + `color:${hot ? '#0A0814' : 'rgba(10,8,20,.66)'};transform:translateY(${hot ? '0' : '-8px'});opacity:${hot ? 1 : 0};`
          + `transition:transform .5s ${EASE},opacity .4s ${EASE} ${hot ? '.1s' : '0s'}`,
      };
    };
    const hookI = this.state.hookI ?? 0;
    const n = L.hero.hooks.length;
    const hook = L.hero.hooks[hookI % n];
    // Das Wort davor bleibt waehrend des Wechsels stehen und laeuft nach oben
    // hinaus. Es steht im Zustand und wird nicht aus hookI-1 erraten: beim
    // Zeigen auf ein Objekt springt die Ueberschrift auf ein beliebiges Wort,
    // und dann ist der Vorgaenger eben nicht das Wort davor in der Liste.
    const vorI = this.state.hookVor ?? null;
    // Beim Sprachwechsel einmal ohne Walze zeichnen, siehe
    // getDerivedStateFromProps. Der Schluessel der Buchstaben wechselt dabei
    // mit, damit React sie neu aufbaut statt die alten weiterzubenutzen --
    // sonst behielten sie die Klasse aus dem vorigen Anstrich.
    const stumm = this.state.stumm === true;
    const vorher = vorI == null ? null : L.hero.hooks[vorI % n];
    const objekt = GRUPPE[WORT_OBJEKT[hookI % n] % GRUPPE.length];
    // Die Knoepfe kennen die Wortfarbe, deshalb stehen sie hier unten und
    // nicht oben: objekt.farbe ist erst ab dieser Zeile bekannt.
    const b0 = hb(0, objekt.farbe), b1 = hb(1, objekt.farbe);

    return (
      <section id="top" style={sx('position:relative;overflow:clip;min-height:100dvh;display:flex;flex-direction:column;border-bottom:1px solid rgba(246,239,230,.10)')}>
        <div aria-hidden="true" style={sx('position:absolute;top:-340px;left:50%;transform:translateX(-50%);width:1500px;height:980px;background:radial-gradient(ellipse at center,rgba(246,239,230,.05),rgba(10,8,20,0) 62%);pointer-events:none')}></div>

        <div data-shell="" data-m="hero" style={sx('position:relative;z-index:2;flex:1;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,440px);align-items:center;gap:56px;width:100%;max-width:1180px;margin:0 auto;padding:88px 32px 72px;box-sizing:border-box')}>
          <div style={sx('position:relative;z-index:1;min-width:0')}>
            {/* Die Zeile hier oben bleibt ohne die Bewegung. Gemessen: sie
                ist 14 px hoch, und "exit" ist genau so lang wie das Element
                -- die ganze Aufloesung laege damit in 14 px Scrollweg und
                waere ein Sprung, kein Verwehen. Sie ist ausserdem das Erste,
                was oben hinauslaeuft, also gar nicht das, was Wolf gemeint
                hat ("sonst bleibt er hart stehen wenn anderes verblurrt"). */}
            <p style={sx(`margin:0 0 22px;display:flex;align-items:center;gap:13px;font-size:12px;font-weight:900;letter-spacing:.2em;text-transform:uppercase;color:rgba(246,239,230,.62);animation:cwRise .8s ${EASE} both`)}>
              {L.hero.kicker}
              <span aria-hidden="true" style={sx('flex:1;max-width:110px;height:1px;background:linear-gradient(90deg,rgba(246,239,230,.20),transparent)')}></span>
            </p>
            <h1 data-aufloesen="" style={sx("margin:0;font-family:'League Spartan',sans-serif;font-weight:900;font-size:clamp(56px,8.6vw,142px);line-height:.84;letter-spacing:-.038em;color:#F6EFE6;will-change:transform")}>
              {/* Die Zeile ist breiter als ihre Spalte. Gemessen bei 1440 px
                  Fensterbreite: "Bauchgefuehl" ist 647 px breit, die Spalte
                  620 px, also wurden 27 px abgeschnitten. Statt die Schrift
                  fuer alle zu verkleinern, darf das lange Wort in die Luft
                  zwischen Text und Objekten laufen. Es passiert HINTER den
                  Objekten (z-Index), und geklammert bleibt es trotzdem, sonst
                  gaebe es keine Walze. */}
              <span data-wortzeile="" style={sx('position:relative;display:block;padding:.14em .1em .06em;margin:-.14em -.1em -.06em;overflow:hidden;white-space:nowrap')}>
                {vorher && (
                  <span key={`aus-${hookI}`} aria-hidden="true"
                    style={sx(`position:absolute;left:.1em;top:.14em;white-space:nowrap;color:${GRUPPE[WORT_OBJEKT[(vorI ?? 0) % n] % GRUPPE.length].farbe}`)}>
                    {vorher.split('').map((ch, j) => (
                      <span key={j} className="cwWortAus" style={sx(`animation-delay:${(j * 0.032).toFixed(3)}s`)}>{ch === ' ' ? '\u00A0' : ch}</span>
                    ))}
                  </span>
                )}
                {/* Fassung F2, Wolf am 27.08.: waehrend das alte Wort hinaus
                    laeuft und das neue herein kommt, wandert die Farbe von der
                    alten in die neue. Entscheidend ist, dass der Traeger KEINEN
                    neuen Schluessel bekommt: bekaeme er einen, baute React ihn
                    neu auf und faenge schon in der Zielfarbe an, die
                    Ueberblendung faende also nie statt. Genau das war vorher
                    der Fall, transition:color stand da und lief nie. Nur die
                    Buchstaben tragen den Schluessel, damit die Walze neu
                    startet. */}
                <span style={sx(`display:inline-block;color:${objekt.farbe};transition:color .62s linear`)}>
                  {hook.split('').map((ch, j) => (
                    <span key={stumm ? `s-${j}` : `${hookI}-${j}`} className={stumm ? undefined : 'cwWortEin'}
                      style={stumm ? undefined : sx(`animation-delay:${(j * 0.032).toFixed(3)}s`)}>{ch === ' ' ? '\u00A0' : ch}</span>
                  ))}
                </span>
              </span>
              <span style={sx(`display:block;animation:cwRise .9s ${EASE} both .12s`)}>{L.hero.rest}</span>
            </h1>
            {/* Die Huelle traegt die Scrollbewegung, die Zeilen darin ihren
                Auftritt. Beides auf dasselbe Element zu legen geht nicht: der
                Auftritt steht als animation im style-Attribut, und ein
                style-Attribut schlaegt jede Regel aus dem Stylesheet. Genau
                deshalb sitzt cwRise auch bei der Ueberschrift auf den Spans
                und nicht auf dem h1. */}
            <div data-verwehen="" style={sx('will-change:transform,filter,opacity')}>
            <p data-m="herosub" style={sx(`margin:26px 0 0;animation:cwRise .8s ${EASE} both .26s;font-size:18.5px;line-height:1.55;font-weight:500;color:rgba(246,239,230,.78);max-width:44ch;text-wrap:pretty`)}>{L.hero.sub}</p>
            <div onMouseLeave={() => this.setState({ hbOn: null })} style={sx(`margin-top:34px;animation:cwRise .8s ${EASE} both .34s;display:flex;align-items:stretch;gap:14px;max-width:520px`)}>
              <a href="#anfragen" onClick={() => this.openForm('test')} onMouseEnter={() => this.setState({ hbOn: 0 })} style={sx(b0.style)}>
                <span aria-hidden="true" style={sx(b0.fill)}></span>
                <span style={sx('position:relative;display:block;text-align:center')}>
                  <span style={sx(b0.lab)}>{L.hero.btn0}</span>
                  <span style={sx(b0.sub)}><span style={sx(b0.subIn)}>{L.hero.btn0Sub}</span></span>
                </span>
              </a>
              <a href="#anfragen" onMouseEnter={() => this.setState({ hbOn: 1 })} style={sx(b1.style)}>
                <span aria-hidden="true" style={sx(b1.fill)}></span>
                <span style={sx('position:relative;display:block;text-align:center')}>
                  <span style={sx(b1.lab)}>{L.hero.btn1}</span>
                  <span style={sx(b1.sub)}><span style={sx(b1.subIn)}>{L.hero.btn1Sub}</span></span>
                </span>
              </a>
            </div>
            <p style={sx(`margin:24px 0 0;animation:cwRise .8s ${EASE} both .42s;font-size:11.5px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;color:rgba(246,239,230,.62)`)}>{L.hero.availability}</p>
            </div>
          </div>

          {/* z-Index 3: die Objekte stehen ueber der Ueberschrift, damit das
              lange Wort HINTER ihnen durchlaeuft und nicht darueber.
              aria-hidden bleibt, es ist Bild und kein Inhalt; die Objekte sind
              trotzdem mit der Tastatur erreichbar, weil sie als Gruppe den
              Wortwechsel steuern. */}
          <div data-treiben="" data-m="hgruppe" aria-hidden="true" style={sx('position:relative;z-index:3;align-self:center;width:100%;aspect-ratio:1/1;pointer-events:none;will-change:transform,filter,opacity')}>
            {GRUPPE.map((k, i) => {
              // Das Objekt zum aktuellen Wort steht vorn, die anderen treten
              // zurueck. Kein Ausblenden, nur weniger Licht: sie bleiben die
              // Gruppe, aus der eines gerade gemeint ist.
              const wach = i === WORT_OBJEKT[hookI % n] % GRUPPE.length;
              // Wolfs Frage: "koennte sich das wort beim drueber hovern
              // veraendern links oder ist das too much?" Nicht zu viel, aber
              // andersherum: nicht das Wort reagiert auf den Zeiger, sondern
              // das Objekt. Eine Ueberschrift, die wechselt, weil der Zeiger
              // sie zufaellig streift, fuehlt sich unsicher an; ein Objekt,
              // das man absichtlich anfaehrt, ist eine Frage, und das Wort ist
              // die Antwort. Auf dem Handy gibt es kein Zeigen, dort laeuft
              // weiter der Takt.
              const zeigen = () => {
                if (this._coarse) return;
                this._wortHalt = true;
                const w = OBJEKT_WORT[i];
                if (w < 0 || (this.state.hookI ?? 0) % n === w) return;
                this.setState(st => ({ hookVor: st.hookI ?? 0, hookI: w, stumm: false }));
              };
              return (
              <span key={k.av}
                onMouseEnter={zeigen} onFocus={zeigen}
                onMouseLeave={() => { this._wortHalt = false; }}
                className={k.beat ? 'cwKachel cwKachel--beat' : 'cwKachel'}
                style={sx(`position:absolute;left:${k.x}%;top:${k.y}%;width:${k.gr}%;aspect-ratio:1/1;pointer-events:auto;`
                  + `--r:${k.r}deg;--d:${k.d}s;--tx:${k.tx};--ty:${k.ty};--tr:${k.tr};`
                  // Die Ebenen bleiben unangetastet, und die Kacheln bleiben voll
                  // deckend. Wolf zweimal, beide Male zu Recht: "ich wuerde die
                  // ebenen der kacheln nicht aendern" und "lass sie wie sie am
                  // anfang waren, leuchten ja, aber nicht durchsichtig, die
                  // ebenen muessen nicht verschwimmen".
                  //
                  // Mein Fehler hatte einen Namen: ich hatte Deckkraft benutzt,
                  // wo Licht gemeint war. Durchsichtig heisst "weiter weg", und
                  // damit verschwimmt genau die Tiefenstaffelung, die die Gruppe
                  // traegt. Jetzt regelt Helligkeit, welche gemeint ist, und ein
                  // farbiger Schein hebt sie zusaetzlich heraus.
                  + `--s:${wach ? 1.06 : 1};filter:brightness(${wach ? 1.08 : 0.72});`
                  + 'border-radius:16%;'
                  + `background-image:url(${k.av}),linear-gradient(180deg,rgba(255,255,255,.22) 0%,rgba(255,255,255,.06) 18%,rgba(255,255,255,0) 50%,rgba(0,0,0,.16) 78%,rgba(0,0,0,.34) 100%);`
                  + `background-color:${k.farbe};`
                  + `background-size:${Math.round(motivAnteil(k.av) * 100)}% auto,auto;`
                  + `background-position:center,center;background-repeat:no-repeat,no-repeat;`
                  + 'box-shadow:inset 0 1px 0 rgba(255,255,255,.38),inset 2px 0 0 rgba(255,255,255,.07),'
                  + 'inset -2px 0 0 rgba(0,0,0,.18),0 3px 4px rgba(0,0,0,.42),0 26px 50px rgba(0,0,0,.45)'
                  + `${wach ? ',0 0 46px ' + k.farbe + '66' : ''}`)}>
              </span>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  /**
   * Die Kennzeile eines Kapitels.
   *
   * Fassung K4 macht aus der Ziffer ein Bauteil statt einer Beschriftung: sie
   * steht dann gross und in Kontur links neben der Ueberschrift, die daneben
   * herumfliesst. Das passiert in CSS ueber data-nr und float, damit die
   * sechs Abschnitte nicht einzeln umgebaut werden muessen; die Ziffer kommt
   * aus dem Attribut, die kleine Zeile wird ausgeblendet.
   *
   * Der Anlass: Wolf am 28.08., "wenn man den hero scrollt wirkt der rest
   * langweilig". Nach Groesse und Bewegung fehlte den Kapiteln noch ein
   * Anker, den der Hero mit seiner Objektgruppe hat. Die Ziffer ist der
   * einzige, den wir nicht erfinden muessen, es gibt sie ohnehin.
   */
  kicker(label: string) {
    const nr = (label.split('|')[0].match(/\d+/) || [''])[0];
    return (
      <div data-reveal="" data-nr={nr || undefined} style={sx('display:flex;align-items:center;gap:12px;margin:0 0 14px;font-size:11.5px;font-weight:900;letter-spacing:.2em;text-transform:uppercase;color:rgba(246,239,230,.62);white-space:nowrap')}>
        {label.split('|')[0]}
        <span style={sx('flex:1;height:1px;background:linear-gradient(90deg,rgba(246,239,230,.28),transparent);max-width:180px')}></span>
        <span style={sx('color:rgba(246,239,230,.5)')}>{label.split('|')[1]}</span>
      </div>
    );
  }

  bullet(text: string, dotColor: string) {
    return (
      <span key={text} style={sx('display:flex;align-items:flex-start;gap:14px;font-size:21.5px;line-height:1.4;font-weight:600;color:#F6EFE6;text-wrap:pretty')}>
        <span style={sx(`width:9px;height:9px;border-radius:50%;background:${dotColor};flex:none;margin-top:11px`)}></span>{text}
      </span>
    );
  }

  /**
   * Station 01, Die Spielarten, in der Fassung „Die Leinwand" (A).
   *
   * 2026-08-27, von Wolf gewaehlt aus drei Entwuerfen auf /mockups: "ich
   * glaube version 1 ist fuer die sektion am besten".
   *
   * Was hier weggefallen ist: die zwei Karten, die beim Zeigen aufzogen und
   * die jeweils andere auf einen senkrechten Streifen zusammendrueckten. Sie
   * brachten ein Vokabular mit, das der Hero nicht hat (Kasten, Rand,
   * Schlagschatten), und sie versteckten den zweiten Modus hinter einer
   * Mausbewegung. Jetzt stehen beide da, untereinander, getrennt nur durch
   * eine Haarlinie: Name links, Text in der Mitte, rechts das Ding selbst.
   *
   * Rechts steht KEINE Dekoration, sondern das, was der Modus ist:
   *   CozyQuiz  -> das Brett, auf dem Flaeche entsteht.
   *   CrowdQuiz -> die Rangfolge der Fraktionen, die sich live umsortiert.
   * Beides laeuft weiter, es haengt nur nicht mehr am Aufklappen.
   */
  renderModes() {
    const L = this.T;
    // Das Brett spielt nicht nach der Uhr, sondern nach Zuegen. b01 zaehlt,
    // wie viele gespielt sind; b01Hand haelt die Felder, die jemand selbst
    // gesetzt hat. Ein Tick der alten Uhr entspricht CYCLE Schritten, deshalb
    // die Umrechnung: so bleibt die gesamte Zeichenschicht unveraendert.
    const zuege = this.state.b01 ?? 0;
    const g = this.gameVals(zuege ? CYCLE * (zuege - 1) + R_END + 1 : 0, this.state.b01Hand, zuege);
    this._b01Feld = g.cells.map(c => c.owned);
    const HAAR = 'rgba(246,239,230,.14)';
    const reihen = [
      {
        key: 'quiz', name: 'CozyQuiz', akzent: AKZENT,
        chip: L.modes.quizChip, lead: L.modes.quizLead, bullets: L.modes.quizBullets,
      },
      {
        key: 'arena',
        name: MODUS_GROSS,
        akzent: '#FACC15',
        chip: L.modes.arenaChip,
        // Unter dem neuen Namen stuende sonst "Acht Fraktionen ... einer von
        // acht Fraktionen". Statt der Wiederholung die Rechnung, die den Namen
        // ueberhaupt traegt: acht mal fuenf mal vier sind die 160, die weiter
        // unten auf dieser Seite ohnehin stehen.
        lead: L.modes.arenaLead,
        bullets: L.modes.arenaBullets,
      },
    ];

    return (
      <section id="spielarten" data-ton="168,85,247" data-shell="" style={sx(`max-width:1180px;margin:0 auto;padding:${DICHTE.dicht};`)}>
        {this.kicker(`${L.modes.kicker}|${L.modes.label}`)}
        <h2 data-reveal="" style={sx("margin:0 0 40px;font-family:'League Spartan',sans-serif;"
          + 'font-size:clamp(40px,5.2vw,84px);font-weight:900;line-height:.9;letter-spacing:-.032em;color:#F6EFE6')}>
          {L.modes.h2}
        </h2>

        {reihen.map((r, i) => (
          <div key={r.key} data-m="modereihe" data-halt=""
            style={sx('display:grid;grid-template-columns:290px 1fr 340px;gap:48px;align-items:start;'
              + `padding:52px 0;border-top:1px solid ${HAAR}${i === reihen.length - 1 ? `;border-bottom:1px solid ${HAAR}` : ''}`)}>
            <div data-reveal="">
              <div style={sx("font-family:'League Spartan',sans-serif;font-size:clamp(38px,4vw,58px);"
                + 'font-weight:900;line-height:.9;letter-spacing:-.03em;color:#F6EFE6')}>{r.name}</div>
              {/* Wolf am 2026-08-27: "pink aus schrift raus in 01". Der Akzent
                  bleibt als Strich vor den Punkten, die Schrift wird creme. */}
              <div style={sx('margin-top:12px;font-size:12px;font-weight:900;letter-spacing:.16em;'
                + 'text-transform:uppercase;color:rgba(246,239,230,.62)')}>{r.chip}</div>
              {/* Wolf am 28.08.: "mach die position nach links unter die
                  ueberschrift neben den text". Damit steht die Avatarwand in
                  der Zeile CozyQuiz genau dort, wo in der Zeile CrowdQuiz die
                  drei Wappen stehen: unter dem Namen, in der Luecke. Beide
                  Zeilen tragen dieselbe Form, und was sie zeigen ist gerade
                  der Unterschied zwischen den Modi -- links acht feste
                  Fraktionen, hier ein Feld, das man selbst zusammenstellt. */}
              {r.key === 'quiz' && this.renderAvatarWand()}
              {/* Wolf am 28.08.: "die 3 linken arena wappen sollen unter
                  crowdquiz in die luecke". Unter dem Namen stand bisher nichts
                  ausser Luft, und die Zeile war deshalb rechtslastig: alles
                  Sehenswerte lag in der Objektspalte. Drei Wappen fuellen die
                  Luecke und teilen die acht auf zwei Seiten auf, statt sie zu
                  einem Block zu stapeln. */}
              {r.key === 'arena' && (
                <div style={sx('margin-top:34px')}>
                  {this.renderFrakFeld(FRAK_LINKS, FRAK_H_LINKS, 'links')}
                </div>
              )}
            </div>

            <div data-reveal="">
              <p style={sx('margin:0 0 26px;font-size:19px;line-height:1.55;font-weight:500;'
                + 'color:rgba(246,239,230,.82);max-width:56ch;text-wrap:pretty')}>{r.lead}</p>
              <ul style={sx('margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:12px')}>
                {r.bullets.map(b => (
                  <li key={b} style={sx('display:flex;gap:14px;font-size:15.5px;line-height:1.5;'
                    + 'font-weight:600;color:rgba(246,239,230,.7);text-wrap:pretty')}>
                    <span style={sx(`flex:none;width:18px;height:1px;margin-top:11px;background:${r.akzent}`)}></span>
                    {b}
                  </li>
                ))}
              </ul>

              {/* Hier stand die Spruchkarte: ein Kasten mit Wappen, Namen und
                  Spruch der Fraktion, auf die man gerade zeigte.
                  Wolf am 28.08.: "ausserdem brauchen wir eine andere art den
                  teamnamen und slogan anzuzeigen, der kasten gefaellt mir
                  nicht", und danach die Wahl auf N1. Name und Spruch stehen
                  jetzt direkt am Wappen, an dem sie haengen, mit einer
                  Haarlinie dorthin. Kein Kasten, kein Grund, keine Kante -- und
                  man liest genau dort, wo man hinzeigt, statt am anderen Ende
                  der Zeile. */}
            </div>

            {r.key === 'quiz' ? (
              <div ref={this.boardWinRef} data-m="modeobjekt"
                onMouseEnter={() => this.brettLauf(true)} onMouseLeave={() => this.brettLauf(false)}
                style={sx('min-width:0;display:flex;justify-content:flex-end;height:340px;box-sizing:border-box')}>
                {this.renderBoard(g, i => this.brettSetzen(i))}
              </div>
            ) : (
              <div data-m="modeobjekt" style={sx('min-width:0')}>
                {/* Hier stand die Rangfolge der acht Fraktionen als Tabelle,
                    mit Rahmen in der Farbe der fuehrenden.
                    Wolf am 28.08.: "ich finde leider crowdquiz am schwaechsten
                    aktuell als bereich ... vlt doch keine tabelle sondern nur
                    die floating wappen?" und danach "W1 und N1".
                    Der Grund war messbar: die Spalte ist 340 px breit, und
                    nach Rangzahl, Wappen, Name und Punktzahl blieben fuer den
                    Balken 28 Pixel. Der laengste Balken war damit halb so lang
                    wie das Wappen daneben hoch ist. In derselben Spalte steht
                    eine Zeile darueber das Brett, und das ist ein Gegenstand.
                    Mit dem Rahmen ist auch frakFuehrt() weg, und mit der
                    Rangfolge die ganze Wertungssimulation: ohne Tabelle gibt
                    es keinen Stand mehr anzuzeigen. */}
                {this.renderFrakFeld(FRAK_RECHTS, FRAK_H_RECHTS, 'rechts')}
              </div>
            )}
          </div>
        ))}
      </section>
    );
  }

  /**
   * Das Pendant zum Brett: die Rangfolge der acht Fraktionen.
   *
   * Warum kein zweites Brett und keine Wand aus Wappen. Das Brett zeigt beim
   * CozyQuiz FLAECHE, weil dort Flaeche gewinnt. In der Arena gibt es kein
   * Brett, Wolfs eigener Satz dazu lautet „Kein Spielbrett, ein Rennen der
   * Fraktionen", und gewertet wird der ANTEIL richtiger Antworten. Ein Anteil
   * ist ein Balken, kein Feld: eine Reihe aus Kacheln wuerde gezaehlte Felder
   * behaupten, die es hier nicht gibt. Acht Wappen nebeneinander wiederum
   * waeren Deko, sie sagen nichts ueber den Stand.
   *
   * Gemeinsam bleibt die Oberflaeche: der Balken traegt denselben Lichtverlauf
   * und dieselben Kanten wie eine Kachel (src/qqKachel.ts), das Wappen sitzt
   * auf einer Kachel in seiner Fraktionsfarbe. Ein Vokabular, zwei Formen.
   */
  /**
   * Ein Feld schwebender Wappen. Fassung W1 mit N1, siehe FRAK_LINKS.
   *
   * Die Fahne mit Namen und Spruch haengt am Wappen selbst: eine Haarlinie
   * fuehrt hin, mehr nicht. Kein Kasten -- Wolf am 28.08.: "ausserdem brauchen
   * wir eine andere art den teamnamen und slogan anzuzeigen, der kasten
   * gefaellt mir nicht". Sie zeigt immer nach innen, also von links nach
   * rechts und von rechts nach links, damit sie nicht aus der Spalte laeuft.
   *
   * Waehrend jemand hinzeigt, treten die uebrigen Wappen zurueck. Ohne das
   * liefe die Fahne ueber das Wappen daneben, und freistellen sollte sie ja
   * gerade kein Kasten.
   */
  /**
   * Die Avatarwand: acht Kacheln, vier mal zwei, unter der Aufzaehlung der
   * Zeile CozyQuiz. Siehe AV_MOTIVE fuer das Warum.
   *
   * Die Zeile darunter ist woertlich die aus der App: "Sucht euch ein
   * Team-Emoji aus", so wie sie am Abend auf der Leinwand steht
   * (CozyQuizPausedView, Folie 'avatare'). Wolf: "schreib nur irgendwie waehle
   * dein avatar oder sowas, das reicht". Vorher stand dort "48 Objekte × 8
   * Farben, frei kombinierbar" -- richtig, aber eine Angabe statt einer
   * Aufforderung, und die Aufforderung ist das, was man hier tun kann.
   */
  renderAvatarWand() {
    const L = this.T;
    const obj = this.state.avObj ?? AV_MOTIVE.map((_, k) => k).slice(0, 8);
    const far = this.state.avFarbe ?? AV_FARBEN.map((_, k) => k);
    const an = this.state.avAn ?? null;
    // Die Kacheln sind nicht fest breit, sondern teilen sich die Spalte.
    // Grund: die Namensspalte ist 290 px breit und unter 1080 px nur noch 220.
    // Vier Kacheln zu 54 plus drei Fugen brauchen 237 -- das passt in 290, aber
    // nicht in 220. teammarke() liefert feste Pixel, die drei Angaben danach
    // ueberschreiben sie; 90 Prozent ist genau der Fuellanteil, den
    // motivAnteil() fuer diesen Satz zurueckgibt.
    const KW = 54;
    return (
      <div data-avwand="" style={sx(`margin-top:28px;width:100%;max-width:${KW * 4 + 21}px`)}>
        <div style={sx('display:grid;grid-template-columns:repeat(4,1fr);gap:7px')}>
          {obj.map((mi, i) => {
            const auf = an === i;
            const farbe = AV_FARBEN[far[i]];
            return (
              <button key={i} type="button"
                onMouseEnter={() => { if (!this._coarse) this.avStart(i); }}
                onMouseLeave={() => { if (!this._coarse) this.avStop(); }}
                onFocus={() => this.avStart(i)} onBlur={() => this.avStop()}
                onClick={() => { if (this._coarse) this.avSchritt(i); }}
                aria-label={L.modes.avAria}
                style={sx('display:block;width:100%;padding:0;border:none;background:none;cursor:pointer;line-height:0;'
                  + `transform:scale(${auf ? 1.08 : 1});transition:transform .28s ${EASE}`)}>
                {/* Der Wechsel selbst braucht keine Blende: das Motiv springt,
                    die Farbe blendet. Genau das ist der Punkt -- die beiden
                    haengen nicht aneinander. */}
                <span style={sx('display:block;' + teammarke(farbe, `/assets/av-qq-${AV_MOTIVE[mi]}.webp`, KW)
                  + 'width:100%;height:auto;aspect-ratio:1;background-size:90% auto,auto;'
                  + `transition:background-color .45s ${EASE}`)}></span>
              </button>
            );
          })}
        </div>
        <div style={sx('margin-top:13px;text-align:center;font-size:13px;font-weight:800;color:rgba(246,239,230,.55)')}>{L.modes.avZeile}</div>
      </div>
    );
  }

  renderFrakFeld(plaetze: { id: string; x: number; y: number; gr: number }[], hoehe: number, seite: 'links' | 'rechts') {
    const L = this.T;
    const an = this.state.frak ?? null;
    return (
      <div data-frakfeld={seite} style={sx(`position:relative;min-width:0;height:${hoehe}px`)}
        onMouseLeave={() => { if (!this._coarse) this.setState({ frak: null }); }}>
        {/* Der Platz folgt dem Stand, nicht der Reihenfolge im Feld: die
            Wappen einer Seite sortieren sich nach Punkten um. Die Groessen und
            Lagen bleiben dabei die der Liste -- getauscht wird, WER auf
            welchem Platz steht, nicht wo die Plaetze sind. */}
        {plaetze.map((_, i) => {
          const stand = this.state.frakPunkte ?? {};
          const rang = plaetze.slice().sort((a, b) => (stand[b.id] ?? 0) - (stand[a.id] ?? 0));
          const pl = { ...plaetze[i], id: rang[i].id };
          const f = FACTIONS.find(x => x.id === pl.id);
          if (!f) return null;
          const auf = an === f.id, still = !!an && !auf;
          const zieht = !!(this.state.frakZieht ?? {})[f.id] && !auf;
          const treffer = this.state.frakTreffer;
          const trifft = treffer?.id === f.id;
          const nachRechts = pl.x < 50;
          const zeig = () => { if (!this._coarse) this.setState({ frak: f.id }); };
          return (
            <button key={f.id} type="button"
              onMouseEnter={zeig} onFocus={zeig}
              onMouseLeave={() => { if (!this._coarse) this.setState({ frak: null }); }}
              onBlur={() => this.setState({ frak: null })}
              aria-label={`${L.sim.factions[f.id]} \u2014 ${L.sim.mottos[f.id]}`}
              style={sx(`position:absolute;left:${pl.x}%;top:${pl.y}%;padding:0;border:none;background:none;cursor:default;`
                + `z-index:${auf ? 6 : (zieht ? 1 : 2)};transition:left 1.3s ${EASE},top 1.3s ${EASE}`)}>
              <span data-schwebt="" style={sx('display:block;position:relative;'
                + `animation:cwSchweb${i % 2} ${11 + (i % 3) * 1.6}s ease-in-out ${(i * 0.8).toFixed(1)}s infinite`)}>
                {/* Der Schein liegt auf einem eigenen Kasten darunter und nicht
                    in box-shadow, sonst ueberschriebe er die Kanten der Kachel. */}
                <span aria-hidden="true" style={sx('position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);border-radius:50%;pointer-events:none;'
                  + `width:${Math.round(pl.gr * 1.6)}px;height:${Math.round(pl.gr * 1.6)}px;background:radial-gradient(circle,${f.color}55,transparent 68%);`
                  + `opacity:${auf ? 1 : 0};transition:opacity .4s ${EASE}`)}></span>
                {/* teammarke() setzt kein display. Ohne bleibt der span inline,
                    und dann greifen Breite und Hoehe nicht. */}
                <span style={sx('display:block;position:relative;' + teammarke(f.color, `/assets/crest-${f.id}.webp`, pl.gr)
                  + `transform:scale(${auf ? 1.1 : (zieht ? .92 : 1)});`
                  + `opacity:${still ? .28 : (zieht ? .5 : 1)};`
                  + `filter:saturate(${auf ? 1.15 : .84}) brightness(${auf || trifft ? 1.14 : .86});`
                  + `transition:transform .4s ${EASE},opacity .4s ${EASE},filter .4s ${EASE},width 1.3s ${EASE},height 1.3s ${EASE}`)}></span>
                {/* Die Zahl, die Wolf gemeint hat: "sowas wie +85 punkte bei
                    einem team, dann aendert sich die reihenfolge". Sie steigt
                    neben dem Wappen auf und loest sich auf. Der Schluessel
                    haengt an einem Zaehler, damit sie auch dann neu anlaeuft,
                    wenn dieselbe Fraktion zweimal hintereinander punktet. */}
                {trifft && treffer && (
                  <span key={treffer.n} aria-hidden="true"
                    style={sx('position:absolute;left:100%;top:6%;margin-left:8px;white-space:nowrap;pointer-events:none;z-index:7;'
                      + `font-family:'League Spartan',sans-serif;font-size:19px;font-weight:900;letter-spacing:-.01em;color:${f.color};`
                      + `animation:cwPunkt 1.9s ${EASE} both`)}>+{treffer.p}</span>
                )}
                <span aria-hidden="true" style={sx('position:absolute;top:50%;display:flex;align-items:center;gap:10px;white-space:nowrap;pointer-events:none;'
                  + `${nachRechts ? 'left:100%;flex-direction:row' : 'right:100%;flex-direction:row-reverse'};`
                  + `transform:translateY(-50%) translateX(${auf ? '0' : (nachRechts ? '-8px' : '8px')});`
                  + `opacity:${auf ? 1 : 0};transition:opacity .3s ${EASE},transform .35s ${EASE}`)}>
                  <span style={sx(`display:block;flex:none;width:${auf ? 26 : 0}px;height:1px;background:${f.color};transition:width .4s ${EASE}`)}></span>
                  <span style={sx(`display:flex;flex-direction:column;gap:3px;text-align:${nachRechts ? 'left' : 'right'}`)}>
                    <span style={sx(`font-size:11.5px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:${f.color}`)}>{L.sim.factions[f.id]}</span>
                    <span data-frakspruch="" style={sx('font-size:15px;font-weight:600;color:rgba(246,239,230,.86)')}>{`\u201e${L.sim.mottos[f.id]}\u201c`}</span>
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
    );
  }
  // ------------------------------------------------- Brett-Simulation
  /**
   * @param festerStand Statt der laufenden Uhr einen festen Zeitpunkt rechnen.
   *   Station 01 zeigt damit ein fertiges Brett statt eines halb leeren: die
   *   Choreografie braucht 16 Fragen à 16,5 Sekunden, also viereinhalb
   *   Minuten. So lange sieht niemand zu. Die laufende Runde steht weiter im
   *   Abschnitt Ablauf, dort gehoert sie hin, dort ist der Beamer.
   */
  gameVals(festerStand?: number, hand?: Record<number, string>, festeZuege?: number) {
    const L = this.T;
    const tick = festerStand ?? this.state.tick ?? 0;
    const cycle = Math.floor(tick / CYCLE);
    const t = tick % CYCLE;
    const phase = t < Q_END ? 'q' : (t < R_END ? 'r' : 'b');
    const q = L.sim.questions[cycle % L.sim.questions.length];
    // Alles, was vor dieser Runde liegt, plus die Zuege dieser Runde, einer
    // nach dem anderen: erst setzt, wer zuerst richtig war.
    let vorher = 0;
    for (let i = 0; i < cycle && i < ROUNDS.length; i++) vorher += ROUNDS[i].length;
    const runde = ROUNDS[cycle] ?? [];
    const gelegt = phase === 'b' ? Math.min(runde.length, Math.floor((t - R_END) / SETZ_TAKT) + 1) : 0;
    const played = MOVES.slice(0, festeZuege ?? (vorher + gelegt));
    // Die Uhr laeuft ueber die Fragephase und steht in der Aufloesung auf 0.
    const seconds = Math.max(0, Math.ceil((Q_END - t) * 0.19));
    // Die 6 stand hier fest, seit das Brett sechs Teams hatte. Mit drei Teams
    // stand darunter "6/3 Teams haben geantwortet".
    const answered = phase === 'q' ? Math.min(TEAMS.length, Math.floor(t / 7)) : TEAMS.length;
    const revealed = phase !== 'q';

    /* Die Antwortkarten.
     *
     * Wolf am 28.08.: "bei 10 v 10 werden alle punkte aller teams auf alle 3
     * antworten verteilt, das ergibt leider keinen sinn". Er hat recht, und der
     * Fehler war eine Summe: die Anzeige addierte ueber alle Teams und zeigte
     * damit bei drei Teams zu je zehn Punkten Werte wie 11, 5 und 14. Also 30
     * Punkte auf einer Frage, die "10 von 10" heisst.
     *
     * Am Abend verteilt JEDES Team seine eigenen zehn Punkte, und unter jeder
     * Antwort stehen die Teams, die darauf gesetzt haben, mit ihrem Einsatz.
     * Genau das steht jetzt hier: je Antwort eine Liste aus Teamkachel und
     * Zahl, absteigend sortiert, damit der groesste Einsatz oben liegt. Wer
     * nichts auf eine Antwort gesetzt hat, taucht dort nicht auf.
     *
     * Bei Mu-Cho steht unter der Antwort, wer sie gewaehlt hat. Wolf: "auch bei
     * mucho wird nicht gezeigt wer was gesetzt hat, danach kommt direkt das
     * feld setzen". Beides erscheint waehrend der Frage, Team fuer Team, so wie
     * die Abgaben am Abend eintrudeln.
     */
    const qOptions = q.opts.map((label, k) => {
      const hit = revealed && k === q.correct;
      // Erst zur Aufloesung. Waehrend die Frage laeuft, sieht am Beamer
      // niemand, worauf ein anderes Team gesetzt hat -- sonst waere die Frage
      // fuer alle, die noch tippen, keine mehr.
      const chips = !revealed ? [] : q.art === 'zehn' && q.punkte
        ? TEAMS.map((tm, ti) => ({ tm, wert: q.punkte?.[ti]?.[k] ?? 0, ti }))
            .filter(x => x.ti < answered && x.wert > 0)
            .sort((a, b) => b.wert - a.wert)
            .map(x => ({
              markeStyle: teammarke(x.tm.color, x.tm.av, 22) + 'display:block;flex:none',
              wert: x.wert,
              wertStyle: `font-family:'League Spartan',sans-serif;font-size:16px;font-weight:900;line-height:1;`
                + `color:${hit ? q.col : 'rgba(246,239,230,.8)'};font-variant-numeric:tabular-nums;transition:color .4s ${EASE}`,
            }))
        : q.art === 'mucho' && q.wahl
        ? TEAMS.map((tm, ti) => ({ tm, ti }))
            .filter(x => x.ti < answered && q.wahl?.[x.ti] === k)
            .map(x => ({
              markeStyle: teammarke(x.tm.color, x.tm.av, 22) + 'display:block;flex:none',
              wert: null as number | null, wertStyle: '',
            }))
        : [];
      return {
        label, num: k + 1, chips,
        style: `flex:1;display:flex;flex-direction:column;gap:9px;padding:12px 14px;border-radius:10px;box-sizing:border-box;background:${hit ? q.col + '1f' : 'rgba(0,0,0,.28)'};border:1px solid ${hit ? q.col : 'rgba(246,239,230,.14)'};box-shadow:${hit ? `0 0 26px ${q.col}55` : 'none'};transition:background .4s ${EASE},border-color .4s ${EASE},box-shadow .4s ${EASE}`,
        kopfStyle: 'display:flex;align-items:center;gap:12px',
        // Die Zeile fuer die Chips haelt ihre Hoehe frei, auch wenn noch
        // niemand gesetzt hat. Sonst waechst die Karte beim Eintrudeln und
        // die ganze Reihe zuckt.
        chipZeileStyle: 'display:flex;align-items:center;gap:8px;min-height:22px;flex-wrap:wrap',
        numStyle: `font-family:'League Spartan',sans-serif;font-size:28px;font-weight:900;line-height:1;color:${q.col}`,
      };
    });

    /* Der Zahlenstrahl fuer Schaetzchen.
     *
     * Wolf am 28.08.: "bei schaetzchen taucht nur das ergebnis auf ohne die
     * schaetzungen zu zeigen". Stimmte: es stand eine Zahl da und sonst
     * nichts, also gerade das Gegenteil dessen, was die Kategorie ausmacht.
     *
     * Aufbau uebernommen aus SchaetzchenReveal v4 der App ("NUR STRAHL"):
     * eine waagerechte Schiene, die Wahrheit als Diamant in der Mitte, jedes
     * Team mit seiner Kachel an seiner Tipp-Position, abwechselnd ueber und
     * unter der Schiene, dazu Wert und vorzeichenbehaftete Abweichung. Der
     * Naechste bekommt einen Ring, die anderen treten zurueck.
     *
     * Die Skala: die Wahrheit liegt bei 50 Prozent, der groesste Fehlschuss
     * landet bei 6 beziehungsweise 94 Prozent. Damit steht immer der ganze
     * Fehlerbereich im Bild, egal ob jemand um 4 oder um 400 danebenliegt,
     * und die Abstaende bleiben untereinander im richtigen Verhaeltnis.
     */
    const wahrheit = Number(q.loesung);
    const strahl = q.art === 'schaetz' && q.tipps && Number.isFinite(wahrheit) ? (() => {
      const groesster = Math.max(...q.tipps.map(v => Math.abs(v - wahrheit)), 1);
      const naechster = q.tipps.reduce((best, v, i) =>
        Math.abs(v - wahrheit) < Math.abs(q.tipps![best] - wahrheit) ? i : best, 0);
      return q.tipps.map((v, i) => {
        const ab = v - wahrheit;
        const links = 50 + (ab / groesster) * 44;
        const oben = i % 2 === 1;
        // Genau wie bei den Antwortkarten: die Tipps stehen erst in der
        // Aufloesung am Strahl, vorher zaehlt unten nur mit, wer schon dran war.
        const da = revealed;
        const siegt = revealed && i === naechster;
        return {
          da, oben,
          style: `position:absolute;left:${links.toFixed(1)}%;top:50%;transform:translate(-50%,${oben ? '-100%' : '0'});`
            + `display:flex;flex-direction:${oben ? 'column' : 'column-reverse'};align-items:center;gap:1px;`
            + `opacity:${da ? (revealed && !siegt ? .45 : 1) : 0};`
            + `transition:opacity .5s ${EASE}`,
          markeStyle: teammarke(TEAMS[i].color, TEAMS[i].av, 18)
            + `display:block;${siegt ? `box-shadow:0 0 0 2px ${q.col},0 0 18px ${q.col}88;` : ''}`
            + `transition:box-shadow .4s ${EASE}`,
          stielStyle: `display:block;width:1.5px;height:7px;background:${siegt ? q.col : 'rgba(246,239,230,.34)'};transition:background .4s ${EASE}`,
          wert: v,
          abweichung: (ab > 0 ? '+' : '') + ab,
          wertStyle: `font-family:'League Spartan',sans-serif;font-size:12px;font-weight:900;line-height:1;`
            + `color:${siegt ? q.col : '#F6EFE6'};font-variant-numeric:tabular-nums`,
          abStyle: `font-size:9px;font-weight:800;line-height:1;color:rgba(246,239,230,.55)`,
        };
      });
    })() : null;

    // Wie in der App: wer geantwortet hat, leuchtet und traegt einen Ring in
    // der Kategoriefarbe; wer noch nicht dran ist, steht entsaettigt da.
    const teamDiscs = TEAMS.map((tm, k) => {
      const fertig = k < answered;
      return {
        style: teammarke(tm.color, tm.av, 38)
          + `filter:${fertig ? 'none' : 'saturate(.25) brightness(.55)'};`
          + `outline:${fertig ? `2px solid ${q.col}` : '2px solid transparent'};outline-offset:2px;`
          + `transition:filter .4s ${EASE},outline-color .4s ${EASE}`,
      };
    });

    const byId: Record<string, typeof TEAMS[number]> = {};
    TEAMS.forEach(tm => { byId[tm.id] = tm; });
    const owner: Record<number, string> = {};
    PRESET.forEach(([id, cell]) => { owner[cell] = id; });
    // Der Stapel-Zug ist raus (Wolf: "keine doppelavatar kacheln"), damit auch
    // die Sonderbehandlung dafuer. Die Zeichenschicht kann weiterhin stapeln,
    // sie bekommt nur nichts mehr zu stapeln.
    const stacked = new Set<number>();
    const last = played[played.length - 1];
    let stolenFrom: string | null = null;
    played.forEach((mv, i) => {
      if (i === played.length - 1) stolenFrom = owner[mv.c] || null;
      owner[mv.c] = mv.t;
    });
    // Von Hand gesetzte Felder liegen ueber der Choreografie: wer mit dem
    // Zeiger auf ein leeres Feld faehrt, setzt es selbst.
    if (hand) for (const [k, v] of Object.entries(hand)) owner[Number(k)] = v;
    const active = last ? byId[last.t] : null;
    const isStack = false;
    const isSteal = !!last && last.k === 'steal';
    const justSet = last ? last.c : -1;
    const justStacked = -1;

    const GS = GRID;
    // Feld nutzt die volle Breite der rechten Spalte, die Tabelle sitzt darunter
    const budget = (this.state.boardWinW || 440) - 26;
    const hBudget = (this.state.boardWinH || 520) - 16;
    // Abstand und Radius aus der App, nachgelesen statt gemessen:
    // CozyQuizGridDisplay.tsx rechnet
    //   gap = 4 (fest)
    //   cellSize = floor((maxSize - (gridSize-1) * gap) / gridSize)
    //   cellRadius = max(4, cellSize * 0.16)
    // Der Abstand ist also KEIN Anteil, sondern feste 4 px. Hier stand vorher
    // 3,7 Prozent, abgeleitet aus einer einzigen Messung bei 107 px Zelle.
    // Auf einer 60-px-Zelle ergibt das 2,2 px statt 4, das Brett wirkt dadurch
    // enger als im Spiel.
    const GAP = 4;
    const CS = Math.max(26, Math.min(96, Math.floor((budget - (GS - 1) * GAP) / GS), Math.floor((hBudget - (GS - 1) * GAP) / GS)));
    const RAD = Math.max(4, Math.round(CS * 0.16));
    const at = (r: number, c: number) => (r < 0 || c < 0 || r >= GS || c >= GS) ? null : (owner[r * GS + c] || null);

    // Connect-Welle: BFS ueber das verbundene Gebiet des frisch gesetzten
    // Feldes, 140ms je Ring, wie CozyQuizGridDisplay im Spiel.
    const waveDelay: Record<number, number> = {};
    const ducks = new Set<number>();
    if (justSet >= 0 && owner[justSet]) {
      const own = owner[justSet], sr = Math.floor(justSet / GS), sc = justSet % GS;
      const seen = new Set([justSet]);
      const queue: [number, number, number][] = [[sr, sc, 0]];
      while (queue.length) {
        const [r, c, d] = queue.shift() as [number, number, number];
        const k = r * GS + c;
        if (waveDelay[k] === undefined || d * 140 < waveDelay[k]) waveDelay[k] = d * 140;
        for (const [nr, nc] of [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]) {
          const nk = nr * GS + nc;
          if (!seen.has(nk) && at(nr, nc) === own) { seen.add(nk); queue.push([nr, nc, d + 1]); }
        }
      }
      for (const [nr, nc] of [[sr - 1, sc], [sr + 1, sc], [sr, sc - 1], [sr, sc + 1]])
        if (nr >= 0 && nc >= 0 && nr < GS && nc < GS) ducks.add(nr * GS + nc);
    }

    type Cell = {
      owned: boolean; av: string; fresh: boolean; wave: boolean; stacked: boolean; dust: boolean;
      ghost: boolean; burst: boolean; bridgeR: boolean; bridgeB: boolean;
      style: string; avStyle?: string; avStyle2?: string; dustStyle?: string;
      ghostStyle?: string; ghostAvStyle?: string; burstStyle?: string;
      bridgeRStyle?: string; bridgeBStyle?: string; waveStyle?: string;
      ringA?: string; ringB?: string;
      shards: { style: string }[]; sparks: { style: string }[];
    };

    const cells: Cell[] = Array.from({ length: GS * GS }, (_, i) => {
      const tm = owner[i] ? byId[owner[i]] : null;
      const r = Math.floor(i / GS), c = i % GS;
      const base = `position:relative;width:${CS}px;height:${CS}px;display:flex;align-items:center;justify-content:center;box-sizing:border-box;transition:background .45s ${EASE},box-shadow .45s ${EASE};`;
      const duck = ducks.has(i) ? 'animation:cwDuck .45s ease-out .1s both;' : '';
      if (!tm) return {
        owned: false, av: '', fresh: false, wave: false, bridgeR: false, bridgeB: false,
        sparks: [], shards: [], ghost: false, burst: false, stacked: false, dust: false,
        style: base + duck + `border-radius:${RAD}px;background:rgba(246,239,230,.05);border:1px solid rgba(246,239,230,.20)`,
      };

      const own = owner[i], col = tm.color;
      const nT = at(r - 1, c) === own, nR = at(r, c + 1) === own, nB = at(r + 1, c) === own, nL = at(r, c - 1) === own;
      const rTL = (nT || nL) ? 0 : RAD, rTR = (nT || nR) ? 0 : RAD, rBR = (nB || nR) ? 0 : RAD, rBL = (nB || nL) ? 0 : RAD;
      const fresh = i === justSet;
      const stolenNow = fresh && isSteal;
      const isStacked = stacked.has(i);
      const freshStack = i === justStacked;
      const ghost = stolenNow && stolenFrom ? byId[stolenFrom] : null;
      const edge = (fused: boolean) => fused ? 'none' : `1px solid ${col}${fresh ? 'ff' : '55'}`;
      // Kachel-Kanten nach der einen Definition (src/qqKachel.ts): Licht auf der
      // Oberkante, Innenlichter an den Seiten, dunkle Unterkante, kurzer harter
      // Schlagschatten. Diese Weisswerte sind Licht und bleiben echtes Weiss.
      // Zu einem gleichfarbigen Nachbarn faellt die Kante weg, sonst wuerde aus
      // zwei aneinanderliegenden Kanten eine doppelt so dicke Linie.
      const insetTop = nT ? '' : 'inset 0 1px 0 rgba(255,255,255,.38)';
      const insetLeft = nL ? '' : 'inset 2px 0 0 rgba(255,255,255,.07)';
      const insetRight = nR ? '' : 'inset -2px 0 0 rgba(0,0,0,.18)';
      const insetBottom = nB ? '' : 'inset 0 -3px 0 rgba(0,0,0,.2)';
      const hardDrop = (nR && nB) ? '' : `${nR ? 0 : 2}px ${nB ? 0 : 3}px 0 rgba(0,0,0,.45)`;
      const shadow = [insetTop, insetLeft, insetRight, insetBottom, hardDrop, '0 5px 9px rgba(0,0,0,.3)', fresh ? `0 0 22px ${col}bb` : '', isStacked ? `0 0 16px ${col}77` : ''].filter(Boolean).join(',');
      // Senkrechter Verlauf, hell oben, dunkel unten: die Grundannahme „Licht
      // faellt von oben". Der frueher hier stehende diagonale Schein war die
      // alte, flachere Fassung der Kachel.
      const bg = `${KACHEL_VERLAUF},${col}`;
      const wd = waveDelay[i];
      const bridge = `position:absolute;background:${bg};z-index:2;pointer-events:none;${wd !== undefined ? `animation:cwBridgeFlash .44s ease-out ${wd}ms both;` : ''}`;
      const span = CS - RAD * 2;

      const avMain = (() => {
        const anim = fresh ? (stolenNow ? 'animation:cwSlam .5s cubic-bezier(.34,1.56,.64,1) .18s both;' : 'animation:cwDrop .6s cubic-bezier(.34,1.56,.64,1) .28s both;') : '';
        if (!isStacked) return `width:${Math.round(CS * motivAnteil(tm.av))}px;height:${Math.round(CS * motivAnteil(tm.av))}px;display:block;position:relative;z-index:8;background:url(${tm.av}) center/contain no-repeat;` + anim;
        const szv = Math.max(8, Math.round(CS * 0.54)), h = szv / 2;
        return `width:${szv}px;height:${szv}px;position:absolute;left:${Math.round(0.27 * CS - h)}px;top:${Math.round(0.27 * CS - h)}px;z-index:8;background:url(${tm.av}) center/contain no-repeat;` + anim;
      })();
      const av2 = (() => {
        if (!isStacked) return 'display:none';
        const szv = Math.max(8, Math.round(CS * 0.54)), h = szv / 2;
        return `width:${szv}px;height:${szv}px;position:absolute;left:${Math.round(0.73 * CS - h)}px;top:${Math.round(0.73 * CS - h)}px;z-index:8;background:url(${tm.av}) center/contain no-repeat;${freshStack ? 'animation:cwDrop .6s cubic-bezier(.34,1.56,.64,1) .1s both;' : ''}`;
      })();

      return {
        owned: true, av: tm.av, fresh,
        style: base + (fresh ? (stolenNow ? 'animation:cwSteal .55s cubic-bezier(.34,1.56,.64,1) both;' : 'animation:cwLand .55s cubic-bezier(.34,1.56,.64,1) both;') : duck)
          + `border-radius:${rTL}px ${rTR}px ${rBR}px ${rBL}px;background:${bg};border-top:${edge(nT)};border-right:${edge(nR)};border-bottom:${edge(nB)};border-left:${edge(nL)};box-shadow:${shadow};z-index:${fresh ? 5 : isStacked ? 4 : 1};${isStacked ? `transform:translateY(-3px);filter:drop-shadow(0 5px 6px rgba(0,0,0,.55)) drop-shadow(0 0 8px ${col}88);` : ''}`,
        avStyle: avMain,
        stacked: isStacked,
        avStyle2: av2,
        dust: freshStack,
        dustStyle: `position:absolute;inset:-6px;border-radius:${RAD + 6}px;border:2.5px solid ${col}cc;animation:cwDust .6s ease-out .1s both;pointer-events:none;z-index:3`,
        ghost: !!ghost,
        ghostStyle: ghost ? `position:absolute;inset:0;z-index:9;display:flex;align-items:center;justify-content:center;pointer-events:none;animation:cwYank .5s cubic-bezier(.45,0,.7,.35) both` : '',
        ghostAvStyle: ghost ? `width:${Math.round(CS * motivAnteil(ghost.av))}px;height:${Math.round(CS * motivAnteil(ghost.av))}px;background:url(${ghost.av}) center/contain no-repeat` : '',
        shards: stolenNow ? Array.from({ length: 8 }, (_, kk) => {
          const a = (kk * 45 + 10) * Math.PI / 180, d = CS * (0.75 + (kk % 3) * 0.16), szv = Math.max(4, Math.round(CS * 0.14));
          return { style: `position:absolute;width:${szv}px;height:${szv}px;border-radius:2px;background:${col};box-shadow:0 0 8px ${col};top:50%;left:50%;margin:${-szv / 2}px 0 0 ${-szv / 2}px;--shx:${(Math.cos(a) * d).toFixed(1)}px;--shy:${(Math.sin(a) * d).toFixed(1)}px;--shr:${(kk * 37 % 300 - 150)}deg;animation:cwShard .7s ease-out ${(0.05 + kk * 0.02).toFixed(2)}s both;pointer-events:none;z-index:6` };
        }) : [],
        burst: stolenNow,
        burstStyle: `position:absolute;inset:-7px;border-radius:${RAD + 7}px;border:2.5px solid #EF4444;animation:cwBurst .6s ease-out both;pointer-events:none;z-index:7`,
        bridgeR: nR, bridgeB: nB,
        bridgeRStyle: bridge + `right:${-GAP - 1}px;top:${RAD}px;width:${GAP + 2}px;height:${span}px`,
        bridgeBStyle: bridge + `bottom:${-GAP - 1}px;left:${RAD}px;height:${GAP + 2}px;width:${span}px`,
        wave: wd !== undefined,
        waveStyle: `position:absolute;inset:-2px;border-radius:${RAD + 2}px;background:radial-gradient(circle,${col}cc 0%,transparent 70%);animation:cwWave .6s ease-out ${wd || 0}ms both;pointer-events:none;z-index:4`,
        ringA: `position:absolute;inset:-6px;border-radius:${RAD + 6}px;border:2.5px solid ${col}88;animation:cwShock .7s ease-out both;pointer-events:none;z-index:6`,
        ringB: `position:absolute;inset:-4px;border-radius:${RAD + 4}px;border:1.5px solid ${col}44;animation:cwShock .9s ease-out .15s both;pointer-events:none;z-index:6`,
        sparks: fresh ? Array.from({ length: 6 }, (_, kk) => {
          const a = kk * 60 * Math.PI / 180, d = CS * 0.62;
          return { style: `position:absolute;width:4px;height:4px;border-radius:50%;background:${col};top:50%;left:50%;margin:-2px 0 0 -2px;--sx:${(Math.cos(a) * d).toFixed(1)}px;--sy:${(Math.sin(a) * d).toFixed(1)}px;animation:cwSpark .6s ease-out ${(0.1 + kk * 0.04).toFixed(2)}s both;pointer-events:none;z-index:7` };
        }) : [],
      };
    });

    const counts: Record<string, number> = {};
    TEAMS.forEach(tm => { counts[tm.id] = 0; });
    Object.values(owner).forEach(id => { if (counts[id] !== undefined) counts[id] += 1; });
    const maxC = Math.max(...Object.values(counts));
    const sorted = TEAMS.slice().sort((a, b) => counts[b.id] - counts[a.id]);
    const tied = sorted.filter(tm => counts[tm.id] === maxC).length > 1;
    const leaderId = maxC > 0 ? sorted[0].id : null;
    const standings = sorted.map(tm => {
      const n = counts[tm.id];
      const leads = tm.id === leaderId;
      const isActive = !!active && active.id === tm.id;
      return {
        // Der Spielstand der App, Stand 27.08.: Kachel, Name in CREME, dann
        // die Zahl gross und die Einheit klein daneben. Vorher stand der Name
        // in der Teamfarbe und die Felderzahl klein darunter. In der App
        // traegt die Kachel die Farbe und die Schrift bleibt creme, und die
        // Zahl ist das, was man aus zehn Metern lesen soll.
        name: L.sim.teams[tm.id],
        zahl: String(n),
        // Ohne den Zusatz "fuehrt" oder "Gleichstand": er hat die Zeile so
        // breit gemacht, dass der Teamname davor abgeschnitten wurde, und die
        // Fuehrung steht ohnehin schon oben in der Liste.
        einheit: n === 1 ? L.sim.field : L.sim.fields,
        sub: `${n} ${n === 1 ? L.sim.field : L.sim.fields}${leads ? (tied ? L.sim.tied : L.sim.lead) : ''}`,
        rowStyle: `display:flex;align-items:center;gap:13px;width:100%;padding:6px 12px 6px 6px;border-radius:14px;box-sizing:border-box;transition:border-color .4s ${EASE},box-shadow .4s ${EASE},background .4s ${EASE};${isActive ? `border:1.5px solid ${tm.color};background:linear-gradient(90deg,${tm.color}1f,transparent);box-shadow:0 0 18px ${tm.color}55` : 'border:1.5px solid transparent'}`,
        discStyle: teammarke(tm.color, tm.av, 38)
          + (isActive ? `outline:3px solid ${tm.color}44;outline-offset:1px;` : ''),
        nameStyle: 'font-size:14.5px;font-weight:900;letter-spacing:-.01em;color:#F6EFE6;line-height:1.15;white-space:nowrap',
      };
    });

    const fc = active ? active.color : 'rgba(246,239,230,.12)';
    const verb = isStack ? L.sim.verbStack : isSteal ? L.sim.verbSteal : L.sim.verbSet;
    return {
      cells, standings, seconds, qOptions, teamDiscs,
      qText: q.text, catName: q.cat,
      // Die drei Kategorien spielen verschieden, also sieht der Bereich unter
      // der Frage fuer jede anders aus. Siehe die Anmerkung bei questions in
      // texts.ts.
      qArt: q.art,
      qLoesung: q.loesung ?? '', qEinheit: q.einheit ?? '', strahl,
      strahlSchieneStyle: `position:absolute;left:0;right:0;top:50%;height:2px;`
        + `background:linear-gradient(90deg,transparent,${revealed ? q.col : 'rgba(246,239,230,.28)'} 12%,${revealed ? q.col : 'rgba(246,239,230,.28)'} 88%,transparent);`
        + `transition:background .5s ${EASE}`,
      strahlDiamantStyle: `position:absolute;left:50%;top:50%;width:11px;height:11px;`
        + `transform:translate(-50%,-50%) rotate(45deg);background:${q.col};`
        + `box-shadow:0 0 16px ${q.col};opacity:${revealed ? 1 : 0};transition:opacity .45s ${EASE}`,
      // Die beiden Randmarken standen frueher im Strahlkasten und lagen
      // damit genau auf den aeusseren Kacheln. Jetzt haben sie eine eigene
      // Zeile unter dem Kasten.
      strahlRandStyle: 'font-size:10px;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:rgba(246,239,230,.38);white-space:nowrap',
      schaetzStyle: `display:flex;align-items:baseline;justify-content:center;gap:8px;padding:5px 15px;border-radius:10px;box-sizing:border-box;`
        + `background:${revealed ? q.col + '1f' : 'rgba(0,0,0,.28)'};border:1px solid ${revealed ? q.col : 'rgba(246,239,230,.14)'};`
        + `box-shadow:${revealed ? `0 0 26px ${q.col}55` : 'none'};transition:background .4s ${EASE},border-color .4s ${EASE},box-shadow .4s ${EASE}`,
      schaetzZahlStyle: `font-family:'League Spartan',sans-serif;font-size:26px;font-weight:900;line-height:1;color:${revealed ? q.col : 'rgba(246,239,230,.34)'};font-variant-numeric:tabular-nums;transition:color .4s ${EASE}`,
      schaetzEinheitStyle: `font-size:12px;font-weight:900;color:${revealed ? '#F6EFE6' : 'rgba(246,239,230,.34)'};transition:color .4s ${EASE}`,
      // Wie weit die Runde ist: ein Zug von MOVES entspricht einer Frage.
      // Wolf am 29.08.: "der zeitbalken oben ist eigentlich ein timer der
      // ablaeuft". Stimmt, in der App laeuft der Streifen leer, waehrend die
      // Frage laeuft. Hier stand stattdessen der Fortschritt der ganzen Folge,
      // der Streifen wurde also immer laenger statt kuerzer.
      uhrAnteil: phase === 'q' ? Math.max(0, Math.round((1 - t / Q_END) * 100)) : 0,
      showQuestion: phase !== 'b', showBoard: phase === 'b', showReveal: revealed, runde: cycle,
      statusLine: phase === 'b' ? `${active ? L.sim.teams[active.id] : ''} ${verb}` : (revealed ? L.sim.reveal : L.sim.answering),
      answeredLine: L.sim.answeredLine(answered, TEAMS.length),
      // Die Beamer-Ansicht der App, Stand 27.08., nach den Bildschirmfotos, die
      // Wolf geschickt hat. Was sich gegen vorher geaendert hat:
      //  * Die Kategorie steht als GEFUELLTE Kapsel in ihrer Farbe mit dunkler
      //    Schrift, nicht als Umriss.
      //  * Die Frage steht frei und gross in der Mitte, ohne Kasten und ohne
      //    Rahmen. Der Kasten war das letzte, was die Folie eingeengt hat.
      //  * Die Uhr ist eine nackte Zahl oben rechts in der Kategoriefarbe,
      //    kein Ring mehr.
      //  * Die Antworten sind breite Zeilen mit Haarlinie, die Ziffer gross in
      //    der Kategoriefarbe, der Text in Creme.
      //  * Die Kategoriefarbe faerbt den ganzen Grund, nicht nur die Akzente.
      catFarbe: q.col,
      catPillStyle: `display:inline-flex;align-items:center;white-space:nowrap;flex:none;padding:5px 13px;border-radius:999px;background:${q.col};font-size:11.5px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:#0A0814;transition:background .4s ${EASE}`,
      qCardStyle: "font-family:'League Spartan',sans-serif;font-size:34px;font-weight:900;line-height:1.06;letter-spacing:-.022em;color:#F6EFE6;text-align:center;text-wrap:balance",
      ringStyle: `flex:none;font-family:'League Spartan',sans-serif;font-size:38px;font-weight:900;line-height:1;color:${q.col};font-variant-numeric:tabular-nums;transition:color .4s ${EASE}`,
      shakeStyle: (justSet >= 0) ? 'animation:cwShake .45s ease-out' : '',
      frameStyle: `padding:8px;border-radius:14px;background:rgba(246,239,230,.015);flex:none;--tc:${active ? fc + '55' : 'transparent'};${active ? 'animation:cwGridGlow 2.4s ease-in-out infinite;' : ''}border:2px solid ${active ? fc : 'rgba(246,239,230,.1)'};box-shadow:${active ? `0 0 36px ${fc}55, inset 0 0 30px ${fc}14` : 'inset 0 0 40px rgba(0,0,0,.5)'};transition:border-color .5s ${EASE},box-shadow .5s ${EASE}`,
      boardGridStyle: `display:grid;grid-template-columns:repeat(${GS},${CS}px);gap:${GAP}px`,
    };
  }

  /**
   * @param aufFeld Wird gerufen, wenn der Zeiger auf ein Feld faehrt. Nur
   *   Station 01 gibt das mit; der Beamer im Abschnitt Ablauf laeuft ohne.
   */
  renderBoard(g: ReturnType<OnePageInner['gameVals']>, aufFeld?: (i: number) => void): ReactNode {
    return (
      <div style={sx('display:flex;align-items:center')}>
        <div style={sx(g.shakeStyle)}>
          <div style={sx(g.frameStyle)}>
            <div style={sx(g.boardGridStyle)}>
              {g.cells.map((c, i) => (
                <span key={i} onMouseEnter={aufFeld ? () => aufFeld(i) : undefined} style={sx(c.style)}>
                  {c.owned && <span style={sx(c.avStyle || '')}></span>}
                  {c.bridgeR && <span style={sx(c.bridgeRStyle || '')}></span>}
                  {c.bridgeB && <span style={sx(c.bridgeBStyle || '')}></span>}
                  {c.wave && <span style={sx(c.waveStyle || '')}></span>}
                  {c.stacked && <span style={sx(c.avStyle2 || '')}></span>}
                  {c.dust && <span style={sx(c.dustStyle || '')}></span>}
                  {c.ghost && <span style={sx(c.ghostStyle || '')}><span style={sx(c.ghostAvStyle || '')}></span></span>}
                  {c.burst && <span style={sx(c.burstStyle || '')}></span>}
                  {c.shards.map((s, k) => <span key={'sh' + k} style={sx(s.style)}></span>)}
                  {c.fresh && (
                    <>
                      <span style={sx(c.ringA || '')}></span>
                      <span style={sx(c.ringB || '')}></span>
                      {c.sparks.map((s, k) => <span key={'sp' + k} style={sx(s.style)}></span>)}
                    </>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Station 02, Anlaesse, in der Fassung „Die Leinwand" (A).
   *
   * Weg sind die drei Karten, die beim Zeigen aufzogen und die anderen beiden
   * auf schmale Streifen quetschten. Dasselbe Vokabular wie bei Station 01,
   * dasselbe Problem: wer nicht mit der Maus darauf ging, las von drei
   * Anlaessen nur Ueberschriften, und wer auf dem Handy war, sah die
   * Bewegung gar nicht.
   *
   * Rechts steht hier ausnahmsweise kein Objekt aus dem Spiel, denn es gibt
   * keins: ein Geburtstag hat keine Spielfigur. Statt eines erfundenen
   * Symbols steht dort die Nummer, gross gesetzt. Das ist die zweite Saeule
   * des Heros, die Schrift selbst, und sie behauptet nichts, was nicht da ist.
   */
  renderAnlaesse() {
    const L = this.T;
    // Die Kennzeile bleibt gedaempft, der Verweis traegt den Akzent. Vorher
    // standen hier drei Pinktoene, und Pink soll aus der Schrift raus.
    const ACC = ['rgba(246,239,230,.62)', 'rgba(246,239,230,.62)', 'rgba(246,239,230,.62)'];
    const HAAR = 'rgba(246,239,230,.14)';
    return (
      <section id="anlaesse" data-shell="" style={sx(`max-width:1180px;margin:0 auto;padding:${DICHTE.luftig};`)}>
        {this.kicker(`[ 02 ]|${L.anlaesse.label}`)}
        <h2 data-reveal="" style={sx("margin:0 0 14px;font-family:'League Spartan',sans-serif;"
          + 'font-size:clamp(40px,5.2vw,84px);font-weight:900;line-height:.9;letter-spacing:-.032em;color:#F6EFE6')}>
          {L.anlaesse.h2}
        </h2>
        <p data-reveal="" style={sx('margin:0 0 30px;' + UNTERZEILE)}>{L.anlaesse.sub}</p>

        {L.anlaesse.cards.map((cardT, i) => {
          const a = ACC[i];
          return (
            <div key={cardT.title} data-m="modereihe" data-halt=""
              style={sx('display:grid;grid-template-columns:290px 1fr 340px;gap:48px;align-items:start;'
                + `padding:52px 0;border-top:1px solid ${HAAR}${i === L.anlaesse.cards.length - 1 ? `;border-bottom:1px solid ${HAAR}` : ''}`)}>
              <div data-reveal="">
                <div style={sx("font-family:'League Spartan',sans-serif;font-size:clamp(30px,3.1vw,44px);"
                  + 'font-weight:900;line-height:.95;letter-spacing:-.028em;color:#F6EFE6;text-wrap:balance')}>{cardT.title}</div>
                <div style={sx('margin-top:12px;font-size:12px;font-weight:900;letter-spacing:.16em;'
                  + `text-transform:uppercase;color:${a}`)}>{cardT.badge}</div>
              </div>

              <div data-reveal="">
                <p style={sx('margin:0 0 22px;font-size:18px;line-height:1.6;font-weight:500;'
                  + 'color:rgba(246,239,230,.82);max-width:60ch;text-wrap:pretty')}>{cardT.desc}</p>
                <a href="#anfragen" data-verweis="" style={sx(`display:inline-block;font-size:15.5px;font-weight:900;color:${AKZENT}`)}>
                  {L.anlaesse.cta}
                </a>
              </div>

              {/* Drei Objekte je Anlass, frei und ueberlappend wie die Gruppe im
                  Hero, ohne Kachel. Wolf hatte die Kachelfassung abgelehnt,
                  mit zwei Gruenden, die beide stimmen: die Kachel bedeutet im
                  Spiel ein Feld oder eine Teammarke, neben "Geburtstag"
                  bedeutet sie nichts, und drei grosse pinke Flaechen je
                  Abschnitt machen Pink zur Flaeche statt zur Marke.
                  Drei Objekte statt einem, weil eins den Anlass nie trifft:
                  eine Torte allein ist ein Kuchen, Torte mit Luftballons und
                  Geschenk ist ein Geburtstag. */}
              {/* Wolf am 2026-08-27: "3 emojis pro eventart sollen bei hover
                  auch etwas machen? (clean)". Sie faechern auf, statt einzeln
                  zu zucken: die Gruppe reagiert als Gruppe, jedes Objekt geht
                  von der Mitte weg, richtet sich etwas auf und kommt nach
                  vorn. Die Richtung faellt aus der eigenen Lage im Feld, es
                  gibt also keine Zahlenliste, die man mitpflegen muesste. */}
              <div aria-hidden="true" data-m="anlassnr" className="cwAnlassGruppe"
                style={sx('position:relative;width:100%;max-width:230px;margin-left:auto;aspect-ratio:1/1')}>
                {ANLASS_GRUPPEN[i].map((o, j) => {
                  const mx = o.x + o.gr / 2 - 50, my = o.y + o.gr / 2 - 50;
                  const len = Math.max(6, Math.hypot(mx, my));
                  return (
                    <span key={o.av} className="cwAnlassObj"
                      style={sx(`position:absolute;left:${o.x}%;top:${o.y}%;width:${o.gr}%;aspect-ratio:1/1;`
                        + `--r:${o.r}deg;--dx:${(mx / len * 10).toFixed(1)}px;--dy:${(my / len * 10 - 4).toFixed(1)}px;`
                        + `transition-delay:${(j * 0.05).toFixed(2)}s;`
                        + `background:url(${o.av}) center/contain no-repeat;`
                        + 'filter:drop-shadow(0 10px 16px rgba(0,0,0,.55))')}></span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>
    );
  }

  /**
   * Die kleine Rangliste im Handy, nach der Abgabe.
   *
   * Zeilen kommen schon sortiert herein, die erste ist die beste. Sie traegt
   * den Rahmen in der Kategoriefarbe, die anderen stehen ruhig daneben. Mehr
   * braucht es nicht: der Wert steht rechts, bei Schaetzchen zusaetzlich die
   * vorzeichenbehaftete Abweichung, damit man sieht, in welche Richtung
   * jemand danebenlag.
   */
  rangliste(zeilen: { name: string; farbe: string; av: string; wert: number; ab?: number }[], col: string) {
    return (
      <div style={sx('display:flex;flex-direction:column;gap:6px')}>
        {zeilen.map((z, i) => (
          <div key={i} style={sx('display:flex;align-items:center;gap:10px;padding:7px 10px;border-radius:12px;box-sizing:border-box;'
            + `border:1px solid ${i === 0 ? col + '99' : 'rgba(246,239,230,.09)'};background:${i === 0 ? col + '14' : 'rgba(246,239,230,.03)'}`)}>
            <span style={sx(teammarke(z.farbe, z.av, 22) + 'flex:none;display:block')}></span>
            <span style={sx(`flex:1;min-width:0;font-size:12.5px;font-weight:800;color:${i === 0 ? '#F6EFE6' : 'rgba(246,239,230,.62)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis`)}>{z.name}</span>
            {z.ab !== undefined && (
              <span style={sx('flex:none;font-size:11px;font-weight:800;color:rgba(246,239,230,.45)')}>{(z.ab > 0 ? '+' : '') + z.ab}</span>
            )}
            <span style={sx(`flex:none;font-family:'League Spartan',sans-serif;font-size:17px;font-weight:900;line-height:1;font-variant-numeric:tabular-nums;color:${i === 0 ? col : '#F6EFE6'}`)}>{z.wert}</span>
          </div>
        ))}
      </div>
    );
  }

  renderProbe() {
    const L = this.T;
    const key = this.state.probeCat || 'mucho';
    const meta = CAT_META.find(c => c.key === key) || CAT_META[0];
    const catT = L.probe.cats[key];
    const p: ProbeDef = L.probe.probes[key];
    const col = meta.col;
    const tilt = this.state.ptilt;
    const up = this.state.pUp !== false;
    const weiterAn = !!this.state.weiterAn;
    const n = PROBE_ORDER.length;

    let footer = L.probe.tapAnswer;
    let cardBody: ReactNode = null;

    if (p.kind === 'pick') {
      const sel = this.state.probePick;
      const answeredNow = sel !== null && sel !== undefined;
      const OK = '#22C55E', NO = '#EF4444', TEAMC = '#EF4444';
      footer = answeredNow ? p.fact : L.probe.tapAnswer;
      cardBody = (
        <>
          {/* Wolf am 29.08.: "wenn man eine antwort abgegeben hat erscheint
              das loesungsfeld im mockup halb abgeschnitten unten". Gemessen:
              bei Schau mal! stand der Inhalt nach der Antwort 28 px unter der
              Unterkante des Handys, die vierte Antwortzeile war halb weg. Die
              Ursache war das Foto: es lag als eigener Streifen ueber der
              Frage, kostete also 104 px plus Abstand zusaetzlich zur Frage,
              und wenn nach der Antwort der Weiter-Knopf aufgeht, fehlen genau
              die.

              Dieselbe Loesung wie in der Handy-Fassung, wo das schon am 28.08.
              so gebaut wurde: Foto NEBEN die Frage. Die Reihe kostet nur die
              Hoehe des groesseren von beiden. Gemessen bleiben jetzt 16 px
              Luft statt 28 px Ueberstand. */}
          {key === 'cheese' ? (
            <div style={sx('display:flex;align-items:center;gap:14px;margin:12px 0 14px')}>
              <img src="/assets/kolosseum.webp" alt="" style={sx('flex:none;display:block;width:104px;height:104px;object-fit:cover;border-radius:14px')} />
              <div style={sx("flex:1;min-width:0;font-family:'League Spartan',sans-serif;font-size:21px;font-weight:900;line-height:1.12;letter-spacing:-.018em;color:#F6EFE6;text-wrap:pretty")}>{p.q}</div>
            </div>
          ) : null}
          <div style={sx('display:flex;flex-direction:column;gap:9px')}>
            {p.opts.map((label, i) => {
              const chosen = sel === i;
              const right = i === p.correct;
              let line = 'rgba(246,239,230,.09)', fill = 'rgba(246,239,230,.04)', badge = TEAMC + '22', badgeCol: string = TEAMC;
              let letter = 'ABCD'[i], text = '#F6EFE6';
              if (answeredNow) {
                if (right) { line = OK; fill = 'rgba(34,197,94,.16)'; badge = OK; badgeCol = '#F6EFE6'; letter = '✓'; }
                else if (chosen) { line = NO; fill = 'rgba(239,68,68,.16)'; badge = NO; badgeCol = '#F6EFE6'; letter = '✕'; }
                else { text = 'rgba(246,239,230,.4)'; badgeCol = 'rgba(246,239,230,.35)'; }
              }
              return (
                <button key={i} type="button" onClick={() => { this.setState({ probePick: i }); this.weiterAb(); }}
                  style={sx('display:flex;align-items:center;gap:13px;width:100%;padding:12px 14px;border-radius:10px;cursor:pointer;'
                    + `font-family:inherit;font-size:14.5px;font-weight:900;box-sizing:border-box;text-align:left;`
                    + `border:1px solid ${line};background:${fill};color:${text};`
                    + `transform:translateY(${chosen ? '-2px' : '0'});transition:all .3s ${EASE}`)}>
                  <span style={sx("font-family:'League Spartan',sans-serif;flex:none;width:22px;text-align:center;"
                    + `font-size:24px;font-weight:900;line-height:1;color:${badgeCol === '#F6EFE6' ? badge : col}`)}>{letter}</span>
                  <span style={sx('text-align:left;line-height:1.25')}>{label}</span>
                </button>
              );
            })}
          </div>
        </>
      );
    }

    if (p.kind === 'guess') {
      const raw0 = this.state.guessRaw ?? '';
      const g = raw0 === '' ? 0 : parseInt(raw0, 10);
      const done = !!this.state.guessDone;
      const diff = Math.abs(g - p.target);
      const near = diff <= p.target * 0.1;
      const fmt = (x: number) => x.toLocaleString(this.locale);
      // Nach der Abgabe traegt die Fusszeile die Wahrheit. Der Kasten, in
      // dem sie vorher stand, ist weg: an seiner Stelle steht jetzt die
      // Rangliste, und beides zusammen passt nicht ins Geraet.
      footer = done
        ? (near ? L.probe.guessNear(fmt(p.target), p.unit, fmt(diff)) : L.probe.guessFar(fmt(p.target), p.unit, fmt(diff)))
        : L.probe.guessFooter;
      // Die eigene Schaetzung und die der beiden Gegner, nach Abstand zur
      // Wahrheit sortiert. Wer am naechsten dran ist, steht oben.
      const rang = [
        { name: L.hero.phoneTeamA, farbe: ICH.farbe, av: ICH.av, wert: g, ab: g - p.target },
        ...RIVALEN.map(r => {
          const tm = TEAMS.find(t => t.id === r.id) as typeof TEAMS[number];
          return { name: L.sim.teams[r.id], farbe: tm.color, av: tm.av, wert: r.tipp, ab: r.tipp - p.target };
        }),
      ].sort((a, b) => Math.abs(a.ab) - Math.abs(b.ab));
      cardBody = (
        <div style={sx('display:flex;flex-direction:column;gap:12px')}>
          <div style={sx('display:flex;align-items:center;gap:16px;margin:10px 0 2px')}>
            <img src="/assets/skelett.webp" alt="" style={sx('flex:none;height:150px;width:auto;display:block')} />
            <div style={sx('flex:1;min-width:0;font-size:16px;font-weight:900;line-height:1.35;color:#F6EFE6;text-wrap:pretty')}>{p.q}</div>
          </div>
          {/* Vor der Abgabe das Eingabefeld, danach die Rangliste an
              derselben Stelle. Die eigene Zahl steht dann in der Liste, das
              Feld waere also doppelt -- und der Platz im Geraet reicht nicht
              fuer beides. */}
          {done ? this.rangliste(rang, col) : (
            <input type="text" inputMode="numeric" value={raw0}
              onChange={e => {
                const raw = e.target.value.replace(/[^\d]/g, '').slice(0, 9);
                this.setState({ guessRaw: raw, guessDone: false });
              }}
              placeholder={L.probe.guessPlaceholder} aria-label={L.probe.guessPlaceholder}
              style={sx("width:100%;box-sizing:border-box;padding:14px 16px;border-radius:14px;background:rgba(246,239,230,.05);border:1.5px solid rgba(243,195,103,.45);color:#F59E0B;font-family:'League Spartan',sans-serif;font-size:32px;font-weight:900;text-align:center;outline:none")} />
          )}
          <button type="button"
            onClick={() => {
              if (done) { clearTimeout(this._weiterT); this.setState({ guessDone: false, guessRaw: '', weiterAn: false }); return; }
              if (raw0 === '') return;
              this.setState({ guessDone: true });
              this.weiterAb();
            }}
            style={sx(`width:100%;padding:13px;border-radius:14px;cursor:pointer;font-family:inherit;font-size:14px;font-weight:900;letter-spacing:.06em;text-transform:uppercase;border:none;background:${done ? 'rgba(246,239,230,.06)' : col};color:${done ? 'rgba(246,239,230,.78)' : '#0A0814'};box-shadow:0 4px 0 rgba(0,0,0,.4);transition:all .3s ${EASE}`)}>
            {done ? L.probe.guessAgain : L.probe.guessBtn}
          </button>
        </div>
      );
    }

    if (p.kind === 'points') {
      const pts = this.state.points || [0, 0, 0];
      const sum = pts.reduce((a, b) => a + b, 0);
      const done = !!this.state.pointsDone;
      const ready = sum === 10;
      const gained = pts[p.correct];
      const pc = gained >= 5 ? '#22C55E' : col;
      footer = done ? L.probe.rangChips(p.correctLabel) : L.probe.pointsFooterIdle;
      // Wolf am 29.08.: "die logik bei 10 v 10 ist eben die meisten punkte auf
      // der richtigen antwort zu haben". Also zaehlt hier nur die eine Spalte,
      // und die Rangliste steht nach der Abgabe an der Stelle der drei
      // Verteilzeilen: die eigene Zahl ist darin enthalten, und fuer beides
      // zusammen ist im Geraet kein Platz.
      const rang = [
        { name: L.hero.phoneTeamA, farbe: ICH.farbe, av: ICH.av, wert: gained },
        ...RIVALEN.map(r => {
          const tm = TEAMS.find(t => t.id === r.id) as typeof TEAMS[number];
          return { name: L.sim.teams[r.id], farbe: tm.color, av: tm.av, wert: r.chips };
        }),
      ].sort((a, b) => b.wert - a.wert);
      cardBody = (
        <div style={sx('display:flex;flex-direction:column;gap:10px')}>
          {done ? this.rangliste(rang, col) : p.opts.map((label, i) => (
            <div key={i} style={sx(`display:flex;align-items:center;gap:9px;padding:8px 11px;border-radius:14px;border:1px solid ${pts[i] > 0 ? col + '66' : 'rgba(246,239,230,.09)'};background:${pts[i] > 0 ? col + '14' : 'rgba(246,239,230,.03)'};box-sizing:border-box;transition:all .3s ${EASE}`)}>
              <span style={sx('flex:1;font-size:13.5px;font-weight:800;color:#F6EFE6')}>{label}</span>
              <button type="button" onClick={() => this.setState(st => { const nn = (st.points || [0, 0, 0]).slice(); if (nn[i] > 0) nn[i] -= 1; return { points: nn, pointsDone: false }; })}
                style={sx(`width:28px;height:28px;flex:none;border-radius:9px;cursor:pointer;font-family:inherit;font-size:15px;font-weight:900;border:1px solid ${col}59;background:${col}1f;color:${col}`)}>−</button>
              <span style={sx('width:26px;text-align:center;font-size:17px;font-weight:900;color:#22C55E')}>{pts[i]}</span>
              <button type="button" onClick={() => this.setState(st => { const nn = (st.points || [0, 0, 0]).slice(); if (nn.reduce((a, b) => a + b, 0) < 10) nn[i] += 1; return { points: nn, pointsDone: false }; })}
                style={sx(`width:28px;height:28px;flex:none;border-radius:9px;cursor:pointer;font-family:inherit;font-size:15px;font-weight:900;border:1px solid ${col}59;background:${col}1f;color:${col}`)}>+</button>
            </div>
          ))}
          <button type="button" onClick={() => {
            if (!ready) return;
            if (done) { clearTimeout(this._weiterT); this.setState({ pointsDone: false, weiterAn: false }); return; }
            this.setState({ pointsDone: true });
            this.weiterAb();
          }}
            style={sx(`width:100%;padding:12px;border-radius:14px;text-align:center;font-family:inherit;font-size:12.5px;font-weight:900;box-sizing:border-box;cursor:${ready ? 'pointer' : 'default'};border:1px solid ${ready ? col + '99' : 'rgba(246,239,230,.09)'};background:${done ? 'rgba(246,239,230,.05)' : (ready ? col : 'transparent')};color:${done ? 'rgba(246,239,230,.78)' : (ready ? '#0A0814' : 'rgba(246,239,230,.62)')};transition:all .3s ${EASE}`)}>
            {done ? L.probe.pointsAgain : (ready ? L.probe.pointsSubmit : L.probe.pointsLeft(10 - sum))}
          </button>
          <div style={sx(`overflow:hidden;box-sizing:border-box;text-align:center;font-size:12.5px;line-height:1.5;font-weight:800;color:#F6EFE6;max-height:${done ? '130px' : '0px'};padding:${done ? '12px' : '0 12px'};margin-top:${done ? '2px' : '0'};border-radius:14px;border:1px solid ${done ? pc + '80' : 'transparent'};background:${pc}14;opacity:${done ? 1 : 0};transition:max-height .5s ${EASE},padding .5s ${EASE},opacity .35s ease`)}>
            {done ? L.probe.pointsResult(p.correctLabel, gained) : ' '}
          </div>
        </div>
      );
    }

    /**
     * Wolf am 28.08.: "die gezeigte 10 von 10 und die bunte tuete existieren so
     * nicht in der app (oder nicht mehr)".
     *
     * Bei der Bunten Tuete stimmte es doppelt. Hier stand eine ganz normale
     * Multiple-Choice-Frage, also genau das, was Mu-Cho eine Zeile weiter oben
     * schon macht: von der Tuete war nichts zu sehen ausser dem Namen. Und die
     * Aufzaehlung darunter nannte sechs Unterspiele, von denen drei so nicht
     * mehr existieren. Laut shared/quarterQuizTypes.ts sind im normalen Abend
     * genau vier aktiv (QQ_BUNTE_TUETE_ACTIVE): Heisse Kartoffel, Top 5, Fix It,
     * Pin It. "Reihenfolge" heisst inzwischen Fix It, "CozyGuessr" heisst Pin
     * It, und "4 gewinnt" und "Bluff" stehen in QQ_BUNTE_TUETE_DEACTIVATED.
     *
     * Jetzt spielt die Karte eines der vier wirklich: Fix It. Man tippt vier
     * Karten in eine Reihenfolge, und erst danach zeigt sich, was stimmt. Das
     * ist die einzige Karte der Seite, die keine Antwortknoepfe hat, und genau
     * das ist der Punkt der Tuete.
     */
    if (p.kind === 'order') {
      const sel = this.state.ordSel || [];
      const done = !!this.state.ordDone;
      const OK = '#22C55E', NO = '#EF4444';
      const richtig = sel.filter((it, pos) => it === pos).length;
      footer = done ? p.fact : L.probe.ordHint;
      cardBody = (
        <div style={sx('display:flex;flex-direction:column;gap:9px')}>
          {p.start.map(idx => {
            const pos = sel.indexOf(idx);
            const gewaehlt = pos >= 0;
            const sitzt = done && pos === idx;
            const line = done ? (gewaehlt ? (sitzt ? OK : NO) : 'rgba(246,239,230,.09)')
              : (gewaehlt ? col + '66' : 'rgba(246,239,230,.09)');
            const fill = done ? (sitzt ? 'rgba(34,197,94,.16)' : (gewaehlt ? 'rgba(239,68,68,.14)' : 'rgba(246,239,230,.03)'))
              : (gewaehlt ? col + '14' : 'rgba(246,239,230,.03)');
            return (
              <button key={idx} type="button" disabled={done}
                onClick={() => {
                  if (done) return;
                  const nn = sel.includes(idx) ? sel.filter(x => x !== idx) : sel.concat(idx);
                  const fertig = nn.length === p.items.length;
                  this.setState({ ordSel: nn, ordDone: fertig });
                  if (fertig) this.weiterAb();
                }}
                style={sx('display:flex;align-items:center;gap:13px;width:100%;padding:12px 14px;border-radius:10px;box-sizing:border-box;text-align:left;'
                  + `font-family:inherit;font-size:14.5px;font-weight:900;cursor:${done ? 'default' : 'pointer'};`
                  + `border:1px solid ${line};background:${fill};color:${done && !gewaehlt ? 'rgba(246,239,230,.4)' : '#F6EFE6'};`
                  + `transform:translateX(${gewaehlt && !done ? '6px' : '0'});transition:all .3s ${EASE}`)}>
                <span style={sx("font-family:'League Spartan',sans-serif;flex:none;width:22px;text-align:center;font-size:22px;font-weight:900;line-height:1;"
                  + `color:${gewaehlt ? (done ? (sitzt ? OK : NO) : col) : 'rgba(246,239,230,.3)'}`)}>
                  {gewaehlt ? (done ? (sitzt ? '\u2713' : '\u2715') : String(pos + 1)) : '\u00b7'}
                </span>
                <span style={sx('line-height:1.25')}>{p.items[idx]}</span>
              </button>
            );
          })}
          <div style={sx(`overflow:hidden;box-sizing:border-box;text-align:center;font-size:12.5px;line-height:1.5;font-weight:800;color:#F6EFE6;`
            + `max-height:${done ? '90px' : '0px'};padding:${done ? '11px' : '0 11px'};margin-top:${done ? '2px' : '0'};border-radius:14px;`
            + `border:1px solid ${done ? (richtig === p.items.length ? OK : col) + '80' : 'transparent'};`
            + `background:${(richtig === p.items.length ? OK : col)}14;opacity:${done ? 1 : 0};`
            + `transition:max-height .5s ${EASE},padding .5s ${EASE},opacity .35s ease`)}>
            {done ? L.probe.ordResult(richtig, p.items.length) : ' '}
          </div>
        </div>
      );
    }

    return (
      <section id="probieren" data-ton="59,130,246" data-halt="" style={sx(`background:radial-gradient(ellipse at 50% 0%,rgba(246,239,230,.04),transparent 65%)`)}>
        <div data-shell="" style={sx('width:100%;max-width:1180px;margin:0 auto;padding:60px 32px;box-sizing:border-box;display:grid;grid-template-columns:1fr 600px;gap:48px;align-items:center')} data-m="two2">
          <div>
            {/* Wolf am 27.08.: "passt sektion 03 jetzt noch zum rest der
                seite?". Nein, an drei Stellen. Erstens standen hier zwei
                Grossbuchstabenzeilen uebereinander, die Kennzeile des
                Abschnitts und L.probe.kicker, und sie ueberdeckten sich sogar.
                Jetzt gilt dieselbe Folge wie ueberall: Kennzeile, Ueberschrift,
                Text, und die zweite Zeile steht klein und ohne Versalien
                darunter. */}
            {this.kicker(`[ 03 ]|${L.probe.label}`)}
            <h2 data-reveal="" style={sx(`margin:12px 0 10px;font-family:'League Spartan',sans-serif;font-size:${H2_GROSS};line-height:.9;letter-spacing:-.032em;font-weight:900;color:#F6EFE6`)}>{L.probe.h2}</h2>
            <div data-reveal="" style={sx('margin-bottom:16px;' + UNTERZEILE)}>{L.probe.kicker}</div>
            <p data-reveal="" style={sx('margin:0 0 26px;max-width:520px;font-size:17px;line-height:1.6;color:rgba(246,239,230,.78);font-weight:500')}>{L.probe.sub}</p>
            {/* Hier standen Anspruch und Satz des gewaehlten Fragetyps. Sie
                sind in die Spalte der Liste gewandert, siehe dort.
                Wolf am 28.08.: "text unten zu lange blurry, wie waere es den
                text ueber die kategorien zu machen?" Die Meldung galt der
                Unschaerfe, der eigentliche Fehler lag aber in der Zuordnung:
                die zwei Zeilen gehoeren zu der Kategorie, die man gerade
                gewaehlt hat, standen aber in einer anderen Spalte weit unter
                der Liste. Man aendert etwas in der Mitte und liest die Folge
                links unten. */}
            <div data-reveal="" style={sx('display:flex;flex-direction:column;gap:10px;font-size:15.5px;font-weight:700;color:#F6EFE6')}>
              <span style={sx('display:flex;align-items:center;gap:11px')}><span style={sx('color:#22C55E')}>✓</span>{L.probe.check1}</span>
              <span style={sx('display:flex;align-items:center;gap:11px')}><span style={sx('color:#22C55E')}>✓</span>{L.probe.check2}</span>
            </div>
          </div>

          <div ref={this.phoneStageRef}
            onMouseMove={e => {
              if (this._coarse) return;
              const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
              this.setState({ ptilt: { x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 } });
            }}
            onMouseLeave={() => this.setState({ ptilt: null })}
            data-m="probe" style={sx('display:flex;align-items:center;gap:52px;perspective:1200px')}>
            <div style={sx('display:flex;flex-direction:column;flex:none;min-width:250px;max-width:300px')}>
              {PROBE_ORDER.map((k, i) => {
                const mt = CAT_META.find(c => c.key === k);
                const ct = L.probe.cats[k];
                if (!mt) return null;
                const onT = k === key;
                // Bogen: mittlere Chips stehen weiter rechts als die aeusseren
                const arc = Math.round(20 * Math.sin((i + 0.5) / n * Math.PI));
                const pick = () => this.probeWechsel(k);
                return (
                  // Drittens: das hier waren die einzigen Kapseln in einer
                  // Liste auf der ganzen Seite. Jetzt sind es Zeilen mit
                  // Haarlinie, wie die Punkte in 01 und die Fragen in 06. Der
                  // gewaehlte Fragetyp traegt einen Strich in seiner Farbe und
                  // rueckt ein, statt sich aufzublasen. Der Bogen bleibt, er
                  // war Wolfs Idee und stoert die Zeilenform nicht.
                  // Wolf am 27.08.: "wenn man zwischen die kategorien auf die
                  // linie geht buggt es". Der Grund: das Einruecken um 8 px lag
                  // auf dem Knopf SELBST. Wer genau auf der Grenze stand, den
                  // schob der Knopf unter dem Zeiger weg, der Zeiger landete
                  // auf dem Nachbarn, der schob sich vor, und so weiter. Das
                  // Einruecken sitzt jetzt auf dem Inhalt, die Trefferflaeche
                  // bleibt stehen. Dazu greifen die Knoepfe senkrecht ineinander
                  // (negativer Rand plus Polster), damit es zwischen ihnen gar
                  // keine tote Linie mehr gibt.
                  <button key={k} type="button" onMouseEnter={pick} onClick={pick}
                    style={sx('display:block;width:100%;box-sizing:border-box;padding:13px 0;margin-bottom:-1px;cursor:pointer;'
                      + 'font-family:inherit;font-size:16px;font-weight:900;white-space:nowrap;text-align:left;background:none;'
                      + `border:none;border-top:1px solid rgba(246,239,230,.14);color:${onT ? mt.col : 'rgba(246,239,230,.7)'};`
                      + `transform:translateX(${arc}px);`
                      + `transition:transform .55s ${EASE},color .3s ${EASE}`)}>
                    <span style={sx('display:flex;align-items:center;gap:14px;pointer-events:none;'
                      + `transform:translateX(${onT ? 8 : 0}px);transition:transform .3s ${EASE}`)}>
                      <span aria-hidden="true" style={sx(`flex:none;width:${onT ? 26 : 14}px;height:2px;border-radius:2px;background:${onT ? mt.col : 'rgba(246,239,230,.3)'};transition:width .35s ${EASE},background .3s ${EASE}`)}></span>
                      <span style={sx(`display:block;width:30px;height:30px;flex:none;background:url(${mt.icon}) center/contain no-repeat;opacity:${onT ? 1 : .7};transition:opacity .3s ${EASE}`)}></span>
                      {ct.name}
                    </span>
                  </button>
                );
              })}
              {/* Anspruch und Satz des gewaehlten Fragetyps, direkt unter der
                  Liste. Dort passiert die Wahl, dort gehoert die Antwort hin.
                  Die Haarlinie schliesst die Liste ab, wie die Linie ueber
                  jeder Zeile sie oeffnet. Eine feste Mindesthoehe, damit die
                  Liste beim Wechseln nicht springt: der laengste der fuenf
                  Saetze braucht drei Zeilen, der kuerzeste eine. */}
              <div style={sx(`margin-top:20px;padding:18px 0 0;min-height:104px;border-top:1px solid rgba(246,239,230,.14)`)}>
                <div style={sx(`font-size:17px;font-weight:900;line-height:1.35;color:${col};margin-bottom:6px;transition:color .3s ${EASE}`)}>{catT.claim}</div>
                <div style={sx('font-size:15px;line-height:1.6;font-weight:500;color:rgba(246,239,230,.78);text-wrap:pretty')}>{catT.detail}</div>
              </div>
            </div>
            <div style={sx('transform-style:preserve-3d;transform-origin:50% 84%;'
              + `transform:rotateX(${up ? (tilt ? -tilt.y * 9 : 0) : 64}deg) rotateY(${up && tilt ? (tilt.x * 12).toFixed(1) : 0}deg) rotateZ(${up ? 0 : -8}deg) scale(${up ? 1 : .9});`
              + `filter:brightness(${up ? 1 : .68});transition:transform ${tilt && up ? '.22s' : '1.15s'} ${EASE},filter 1.15s ${EASE}`)}>
              {/* Wolf am 27.08.: "canva hat so ein handy mockup, vlt waere das
                  was fuer uns". Statt eines fremden Bildes ein echtes Geraet
                  in CSS: aeusserer Rahmen mit Lichtkante, innen ein schmaler
                  schwarzer Spalt zwischen Rahmen und Bildschirm, Aussparung
                  oben, Tasten an der Seite. Kostet kein Bild, skaliert
                  verlustfrei und laesst sich mitfaerben.
                  Die Masse sind die eines iPhone 15 im Verhaeltnis: 360 zu 600
                  ist 1 zu 1,67, das Geraet selbst 1 zu 2,03. */}
              <div aria-hidden="true" style={sx('position:absolute;left:-11px;top:150px;width:4px;height:34px;border-radius:3px 0 0 3px;background:linear-gradient(180deg,#2a2a33,#101016)')}></div>
              <div aria-hidden="true" style={sx('position:absolute;left:-11px;top:200px;width:4px;height:56px;border-radius:3px 0 0 3px;background:linear-gradient(180deg,#2a2a33,#101016)')}></div>
              <div aria-hidden="true" style={sx('position:absolute;right:-11px;top:186px;width:4px;height:76px;border-radius:0 3px 3px 0;background:linear-gradient(180deg,#2a2a33,#101016)')}></div>
              <div data-m="pphone" style={sx('position:relative;width:360px;height:600px;border-radius:52px;box-sizing:border-box;padding:20px 16px;display:flex;flex-direction:column;'
                + 'background:linear-gradient(180deg,#150c20,#0a0714);'
                + 'border:9px solid #0b0b12;'
                + 'box-shadow:0 0 0 1.5px #33333d,inset 0 0 0 1.5px rgba(246,239,230,.06),0 30px 70px rgba(0,0,0,.6);'
                + `transition:box-shadow .5s ${EASE}`)}>
                {/* Die Aussparung. Sie liegt ueber dem Inhalt, deshalb der
                    hohe z-Index, und traegt Hoerer und Kamera. */}
                <div aria-hidden="true" style={sx('position:absolute;left:50%;top:8px;transform:translateX(-50%);z-index:6;width:112px;height:26px;border-radius:14px;background:#0b0b12;display:flex;align-items:center;justify-content:center;gap:12px')}>
                  <span style={sx('width:34px;height:4px;border-radius:2px;background:#1b1b24')}></span>
                  <span style={sx('width:7px;height:7px;border-radius:50%;background:#141420;box-shadow:inset 0 0 0 1px rgba(120,130,180,.35)')}></span>
                </div>
                {/* Wolf am 27.08.: "optimiere die handy sektion". Der Kopf war
                    ein lila Kasten mit lila Schrift, das einzige Stueck Seite,
                    das noch so aussah. Jetzt eine Zeile mit Haarlinie: Kachel,
                    Name in Creme, Menue als drei Striche. Was das Handy zeigt,
                    bleibt inhaltlich, was die App zeigt; nur die Sprache ist
                    die der Seite. */}
                <div style={sx('display:flex;align-items:center;gap:11px;padding:0 4px 13px;margin-bottom:14px;flex:none;border-bottom:1px solid rgba(246,239,230,.14)')}>
                  <span style={sx(teammarke('#A855F7', '/assets/av-qq-crystal-ball.webp', 34))}></span>
                  <span style={sx('flex:1;min-width:0;font-size:15px;font-weight:900;color:#F6EFE6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>{L.hero.phoneTeamA}</span>
                  <span aria-hidden="true" style={sx('flex:none;display:flex;flex-direction:column;gap:3px')}>
                    <span style={sx('display:block;width:16px;height:1.5px;border-radius:1px;background:rgba(246,239,230,.5)')}></span>
                    <span style={sx('display:block;width:16px;height:1.5px;border-radius:1px;background:rgba(246,239,230,.5)')}></span>
                    <span style={sx('display:block;width:11px;height:1.5px;border-radius:1px;background:rgba(246,239,230,.5)')}></span>
                  </span>
                </div>
                <div key={key} style={sx('position:relative;overflow:hidden;flex:1;min-height:0;padding:4px 4px 0;box-sizing:border-box;'
                  + `animation:${PROBE_ORDER.indexOf(key) % 2 ? 'cwCardB' : 'cwCardA'} .55s ${EASE} both`)}>
                  {/* Gefuellte Kapsel mit dunkler Schrift, genau wie auf der
                      Leinwand in 04. Beide zeigen dieselbe Kategorie, also
                      sollen sie auch gleich aussehen. */}
                  <span style={sx('display:flex;align-items:center;gap:9px')}>
                    <span style={sx(`display:inline-flex;align-items:center;padding:5px 12px;border-radius:999px;background:${col};font-size:11px;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:#0A0814;flex:none;transition:background .35s ${EASE}`)}>{catT.name}</span>
                    {/* Die Tuete ist keine Kategorie mit einer Regel, sondern ein
                        Beutel voller Regeln. Also steht neben ihrem Namen, welches
                        Unterspiel gerade gezogen wurde. Sonst sieht man nur ein
                        Sortierspiel und nicht die Tuete. */}
                    {p.kind === 'order' && (
                      <span style={sx(`display:inline-flex;align-items:center;padding:4px 11px;border-radius:999px;border:1px solid ${col}66;font-size:11px;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:${col};flex:none`)}>{p.spiel}</span>
                    )}
                  </span>
                  {p.kind !== 'guess' && key !== 'cheese' && (
                    <div style={sx("margin:14px 0 16px;font-family:'League Spartan',sans-serif;font-size:21px;font-weight:900;line-height:1.12;letter-spacing:-.018em;color:#F6EFE6;text-wrap:balance")}>{p.q}</div>
                  )}
                  {cardBody}
                </div>
                <div style={sx('margin-top:auto;padding-top:12px;flex:none;display:flex;flex-direction:column;gap:9px')}>
                  <div style={sx('text-align:center;font-size:11px;font-weight:800;color:rgba(246,239,230,.62)')}>{footer}</div>
                  {/* Wolf am 28.08.: "ich faende gut wenn der reveal von einer
                      kategorie kam, dass man entweder nach ein paar sekunden
                      oder durch klick auch zur naechsten kommt".
                      Beides an derselben Stelle: der Knopf geht sofort weiter,
                      und die Linie darunter laeuft ueber genau die Zeit, nach
                      der es von allein passiert. Damit ist der Wechsel nie eine
                      Ueberraschung, man sieht ihn kommen und kann ihm
                      zuvorkommen. Die Linie haengt an der Animation und nicht
                      an einem Zaehler im Zustand: das kostet kein Neuzeichnen
                      pro Bild. */}
                  <button type="button" aria-hidden={!weiterAn} tabIndex={weiterAn ? 0 : -1}
                    onClick={() => this.probeWechsel(this.naechsteKat())}
                    style={sx('position:relative;overflow:hidden;width:100%;box-sizing:border-box;border-radius:12px;font-family:inherit;'
                      + 'font-size:11.5px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;text-align:center;'
                      + `border:${weiterAn ? '1px' : '0'} solid rgba(246,239,230,.2);background:rgba(246,239,230,.04);color:rgba(246,239,230,.8);`
                      + `cursor:pointer;line-height:1.2;padding:${weiterAn ? '11px 12px' : '0 12px'};max-height:${weiterAn ? '44px' : '0px'};`
                      + `opacity:${weiterAn ? 1 : 0};pointer-events:${weiterAn ? 'auto' : 'none'};`
                      + `transition:max-height .4s ${EASE},padding .4s ${EASE},opacity .3s ease`)}>
                    <span style={sx('position:relative;z-index:2')}>{L.probe.weiterZu(L.probe.cats[this.naechsteKat()].name)} &rarr;</span>
                    {weiterAn && (
                      <span key={key} aria-hidden="true" style={sx('position:absolute;left:0;bottom:0;height:2px;width:0;'
                        + `background:${col};animation:cwWeiter ${WEITER_MS}ms linear both`)}></span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
                  </div>
      </section>
    );
  }

  renderAblauf() {
    const L = this.T;
    const on = !!this.state.beam;
    const kipp = this.state.beamXY ? { x: this.state.beamXY.x - 0.5, y: this.state.beamXY.y - 0.5 } : null;
    // Der Lichtfleck des Zeigers auf den Fugen. Feste 230 px statt eines
    // masslosen "circle": ohne Mass rechnet ein Radialverlauf bis zur
    // entferntesten Ecke, und auf 914 px Breite wird daraus ein weicher
    // Schein statt eines Flecks. Zwei Ebenen benutzen ihn, deshalb steht er
    // einmal hier.
    const fleck = 'radial-gradient(circle 230px at var(--wx,50%) var(--wy,50%),#000 0%,rgba(0,0,0,.62) 38%,transparent 100%)';
    const g = this.gameVals();
    const beamStart = () => this.beamAn();
    return (
      <section id="ablauf" data-ton="34,197,94" data-halt="" style={sx('')}>
        <div data-shell="" style={sx('width:100%;max-width:1180px;margin:0 auto;padding:26px 32px;box-sizing:border-box')}>
          {/* Wolf am 28.08.: "koennen wir die sektion 04 nebeneinander machen?
              was mir dort aktuell nicht so gut gefaellt, wie der grosse text
              umgebrochen wird und wie die beamerview unter dem subtext mittig
              steht". Beides hatte dieselbe Ursache: Text und Leinwand standen
              untereinander in einer Spalte von 1116 px. Eine Ueberschrift
              bricht auf dieser Breite an einer Stelle um, die der Satz nicht
              vorgibt, und die Leinwand darunter war schmaler als der Text und
              hing deshalb mittig in einer zu breiten Spalte.
              Jetzt steht die Schrift links in einer eigenen Spalte, die so
              breit ist, dass der Umbruch dem Satz folgt, und die Leinwand
              nimmt rechts ihre Spalte ganz ein. Nichts steht mehr mittig in
              etwas, das breiter ist als es selbst. Unter 900 px fallen die
              Spalten wieder untereinander, dort ist die Leinwand zurecht die
              volle Breite. */}
          <div data-m="ablaufraum" style={sx('position:relative;display:grid;grid-template-columns:minmax(0,440px) minmax(0,1fr);gap:clamp(36px,4.6vw,72px);align-items:center')}>
            <div>
              {this.kicker(`[ 04 ]|${L.ablauf.label}`)}
              <h2 data-reveal="" style={sx(`margin:0 0 10px;font-family:'League Spartan',sans-serif;font-size:clamp(34px,3.4vw,56px);line-height:.96;letter-spacing:-.03em;font-weight:900;color:#F6EFE6;text-wrap:balance`)}>{L.ablauf.h2}</h2>
              <p data-reveal="" style={sx('margin:0;' + UNTERZEILE)}>{L.ablauf.sub}</p>
              {/* Wolf am 28.08.: "verschieben wir den beamer links unter den
                  text und nicht vor den screen". Damit steht er nicht mehr in
                  der 3D-Szene der Wand, kippt also auch nicht mit ihr -- was
                  richtiger ist: er steht auf einem Moebel im Raum, nicht an
                  der Wand.
                  Der Schein um die Silhouette ist von 0,20 auf 0,09 zurueck
                  ("weniger glow generell"). Im Bild selbst ist kein Licht,
                  sonst gaebe es keinen Unterschied zwischen aus und an. */}
              <div data-beamer="" style={sx('position:relative;margin-top:38px;width:186px;max-width:52%')}>
                {/* Der Lichtkegel.
                    Wolf am 28.08.: "die beamerlinse ist etwas hoeher also
                    liegt der beginn des strahls etwas niedrig am beamer vorne
                    ... da vorne dran setzen" und "das blurry licht aussenrum
                    kann eigentlich weg, da das licht der strahl des beamers
                    sich auf die begrenzung der beameransicht begrenzt (beamer
                    strahlt ja mainly das bild, nicht random licht aussenrum)".

                    Beides eingebaut, und der zweite Punkt hat den Kegel erst
                    richtig gemacht: er ist keine beliebige Lichtkeule, sondern
                    der Raum zwischen der Linse und den Kanten des Bildes. Also
                    ist sein Oeffnungswinkel keine Geschmacksfrage, sondern
                    ergibt sich aus der Geometrie.

                    Am 28.08. im Browser nachgemessen, Winkel von der Linse zur
                    oberen und unteren linken Ecke der Projektion:
                      1440 px:  +40,8 bis  -9,4 Grad   (Abstand 338 px)
                      1280 px:  +38,7 bis -14,7 Grad   (Abstand 330 px)
                      1024 px:  +34,2 bis  -9,6 Grad   (Abstand 317 px)
                    Also eine Achse von rund 14 Grad ueber der Waagerechten und
                    eine Oeffnung von rund 25 Grad zu jeder Seite. Im
                    Kegelverlauf zeigt 0 Grad nach oben, rechts sind 90 -- die
                    Achse liegt damit bei 76, der Verlauf laeuft von 51 bis 101.

                    Die Linse sitzt vorne oben am Gehaeuse, gemessen bei
                    93 Prozent der Breite und 30 der Hoehe. Vorher setzte der
                    Kegel bei 78/46 an, also zu weit hinten und zu tief -- genau
                    das, was Wolf gesehen hat.

                    Die Maske endet dort, wo der Strahl auf die Wand trifft:
                    338 px von 864 sind 39 Prozent, also ist bei 48 Schluss.
                    Weiter braucht es ihn nicht, dort ist das Licht schon Bild. */}
                <span aria-hidden="true" style={sx('position:absolute;left:93%;top:30%;width:min(900px,60vw);height:min(900px,60vw);'
                  + 'transform:translateY(-50%);z-index:0;pointer-events:none;mix-blend-mode:screen;'
                  + 'background:conic-gradient(from 51deg at 0% 50%,'
                  + 'transparent 0deg,rgba(255,246,232,.10) 5deg,rgba(255,246,232,.17) 12deg,'
                  + 'rgba(255,246,232,.17) 38deg,rgba(255,246,232,.10) 45deg,transparent 50deg);'
                  + 'mask-image:radial-gradient(circle at 0% 50%,transparent 0%,rgba(0,0,0,.2) 9%,rgba(0,0,0,.9) 26%,rgba(0,0,0,.75) 38%,transparent 48%);'
                  + `filter:blur(6px);opacity:${on ? 1 : 0};transition:opacity 1.4s ${EASE}`)}></span>
                {/* Das Gehaeuse liegt ueber dem Kegel und verdeckt dessen
                    Ansatz. Das ist der Grund, warum das Licht ueberhaupt
                    aussieht, als kaeme es von hinten aus dem Geraet. */}
                <img src="/assets/obj-beamer.webp" alt="" width={420} height={264}
                  style={sx('position:relative;z-index:2;display:block;width:100%;height:auto;'
                    + `filter:brightness(${on ? 1.03 : .84}) saturate(${on ? 1 : .9});transition:filter 1.4s ${EASE}`)} />
              </div>
            </div>
            <div>

          {/* Wolf am 27.08.: "beamer kleiner und gekippt". Also keine Leinwand
              ueber die volle Breite mehr, sondern 880 px, mittig, und leicht
              schraeg gestellt, als staende man neben statt vor ihr. Ein Geraet
              ist bewusst nicht im Bild: es waere wieder ein behaupteter Raum,
              und genau den haben wir mit den KI-Bildern rausgeworfen. Die
              Schraege nimmt beim Anspringen ab, damit die Frage gerade steht,
              wenn man sie lesen soll. */}
          {/* Wolf am 27.08.: "beim draufgehen gibts einen effekt, wenn man mit
              der maus druebergeht soll dieser Lichtstrahl mitwandern". Bisher
              stand der Schein fest bei 62 Prozent Breite. Jetzt liegt er dort,
              wo der Zeiger ist, wie der helle Fleck, den eine Beamerlampe auf
              die Wand wirft. Auf Geraeten ohne Zeiger bleibt er in der Mitte. */}
          {/* Kein Ausschalten mehr beim Verlassen: solange die Lampe von allein
              angeht, waere es widersinnig, sie bei jeder Mausbewegung wieder
              auszupusten. Der Zeiger lenkt nur noch den hellen Fleck. */}
          <div data-reveal="" data-m="wall" onMouseEnter={beamStart} onClick={beamStart}
            onMouseMove={e => {
              if (this._coarse) return;
              const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
              // Der Lichtfleck auf den Fugen geht direkt an das Element, nicht
              // ueber den Zustand: er soll jeder Mausbewegung folgen, und die
              // ganze Station dafuer neu zu rechnen waere zu teuer.
              const w = this._wand;
              if (w) {
                const q = w.getBoundingClientRect();
                w.style.setProperty('--wx', `${(e.clientX - q.left).toFixed(0)}px`);
                w.style.setProperty('--wy', `${(e.clientY - q.top).toFixed(0)}px`);
                w.style.setProperty('--wo', '1');
              }
              this.setState({ beamXY: { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height } });
            }}
            onMouseLeave={() => this.setState({ beamXY: null })}
            style={sx('position:relative;margin:0;width:100%;cursor:pointer;perspective:1100px')}>
            {/* Perspektive gehoert auf den Eltern, die Drehung auf das Kind.
                Standen beide auf demselben Element, greift die Perspektive
                nicht und die Kippung sah flach aus statt raeumlich. */}
            {/* Wolf am 27.08.: "lieber den 3d beamercard effekt ueberall, also
                kippen wenn nach rechts etc". Die Leinwand steht in Ruhe
                schraeg und richtet sich beim Anspringen fast gerade; solange
                der Zeiger darauf liegt, kippt sie ihm nach, wie die Karte in
                03 es mit dem Handy schon macht.
                Die Ausschlaege sind klein gehalten: 7 Grad zur Seite und 4
                nach oben. Mehr sieht auf einer Flaeche von 880 px nicht mehr
                nach einer Wand aus, sondern nach einer Spielkarte. */}
            <div style={sx(`transform:rotateY(${(on ? -5.2 + (kipp?.x ?? 0) * 7 : -15).toFixed(2)}deg) `
              + `rotateX(${(on ? 0.5 - (kipp?.y ?? 0) * 4 : 2.4).toFixed(2)}deg) scale(${on ? 1 : .95});`
              + `transform-origin:center center;transition:transform ${kipp && on ? '.18s' : '1.1s'} ${EASE}`)}>
            {/* Hier lag ein KI-Bild: ein Wohnzimmer mit sechs Leuten von hinten
                vor einer Beamerwand. Wolf hat es ausgemustert, wie schon das im
                Hero, und es stand ausgerechnet an der Stelle, an der die Seite
                behauptet, so laufe sein Abend. Damit ist es das letzte
                KI-Bild der Seite gewesen, und der Hinweis im Fussbereich
                konnte mit weg.
                An seine Stelle tritt kein anderes Bild, sondern die Leinwand
                selbst: eine dunkle Flaeche mit Haarlinie, die aufleuchtet,
                sobald das Spiel laeuft. Sie behauptet keinen Raum, den es
                nicht gibt, und der Inhalt darin ist echt. */}
            {/* Der Beamer selbst, seit dem 28.08. Wolf hat ihn gerendert und
                gefragt: "aber die linse in unsere richtung waere doch falsch,
                er soll ja an eine wand VOR uns strahlen, oder nicht?"

                Genau, und darum steht er so herum. Das gelieferte Bild zeigt
                das Geraet von schraeg hinten links: uns zugewandt sind das
                Lueftungsgitter und der Knopf, die Nase zeigt nach rechts in
                die Tiefe. Wir sehen also die RUECKSEITE, die Linse zeigt von
                uns weg -- auf die Wand. Ein sichtbares Objektiv braeuchte es
                dafuer gar nicht, und das gelieferte hat auch keins.

                Er sitzt unten links vor der Leinwand und ueberlappt ihre Ecke
                leicht. Diese Ueberlappung ist der einzige eindeutige Hinweis
                auf Tiefe: was etwas verdeckt, steht davor. Er liegt im selben
                gekippten Eltern-Element wie die Projektion, kippt also mit,
                wenn die Wand sich beim Anspringen aufrichtet.

                Der Lichtkegel ist ein Keil aus CSS, kein Teil des Bildes: er
                muss sich mitdrehen und beim Anschalten aufgehen, und beides
                kann ein gerendertes Bild nicht. */}
            {/* Wolf am 28.08.: "fehlt hinter dem beamer in 04 eigentlich noch
                die angedeutete wall? weil wir davon sprechen a free wall ist
                all you need, aber jetzt sieht es nur aus wie ein tablet oder
                so?"
                Er hat recht, und der Grund waren zwei Details. Erstens hatte
                die Projektion 22 px runde Ecken -- eine Beamerprojektion hat
                die nicht, ein Geraet schon. Zweitens endete das Bild an seiner
                eigenen Kante, es lag also auf nichts. Beides zusammen ergibt
                genau die Lesart Tablet.
                Jetzt steht dahinter eine Flaeche, die groesser ist als das
                Bild und an den Raendern ausblendet -- angedeutet, nicht
                behauptet: ein Rechteck mit harter Kante waere wieder ein
                Gegenstand, und einen Raum zu bauen hiesse, den Fehler der
                KI-Bilder zu wiederholen. Dazu faellt Licht darauf, sobald die
                Lampe an ist, denn ein Beamer erhellt immer auch die Wand um
                das Bild herum. Die Ecken der Projektion sind auf 4 px runter,
                also praktisch scharf.
                In Ruhe ist die Wand am deutlichsten -- dann ist sie das
                Einzige, was da ist, und genau das sagt die Ueberschrift.
                Springt die Lampe an, geht sie auf die Haelfte zurueck und das
                Licht des Beamers uebernimmt, so wie im Raum das Licht ausgeht,
                wenn das Bild kommt.
                Die Maske muss INNERHALB ihres Kastens auf null sein, sonst
                schneidet dessen Kante den Verlauf ab und man sieht wieder ein
                Rechteck. Gemessen: in der ersten Fassung lag die Maske an der
                Oberkante noch bei 0,68, und das war die sichtbare Linie. Die
                Ellipse von damals ist inzwischen der Wolke gewichen, siehe
                WAND_RAND. */}
            {/* Hier lag ein graues Lichtfeld: ein Verlauf, der die Wand als
                beleuchtete Flaeche zeigte.
                Wolf am 28.08.: "grau licht auf wand darf ganz weg". Er hat
                recht, und der Grund ist derselbe wie beim Saum um den Beamer:
                ein Beamer wirft ein BILD, kein Streulicht. Alles, was um die
                Projektion herum hell ist, widerspricht dem Kegel, den wir zwei
                Zeilen vorher genau auf die Bildkanten begrenzt haben.
                Uebrig bleibt die Wand als das, was sie ist: Fugen im Dunkeln. */}
            {/* Die Fugen. Sie liegen im selben gekippten Eltern-Element wie
                die Projektion, teilen also deren Neigung -- Wolfs Auflage:
                "sie hat die gleiche neigung wie die beamer view". Und sie
                liegen unter ihr, die Projektion deckt ihren Teil der Wand ab,
                wie es eine Projektion tut.
                Die Maske ist dieselbe wie beim Lichtfeld darunter, damit Wand
                und Fugen an derselben Stelle ins Dunkle ausblenden. Sonst
                haette man Fugen im Nichts, und das waere wieder eine
                behauptete Flaeche mit Kante. */}
            {/* Alle Schichten der Wand liegen jetzt in EINEM Kasten, und
                dieser Kasten traegt die Grenze. Vorher hatte jede Schicht ihre
                eigene Maske, und die Welle hatte gar keine -- sie endete an
                der Kante ihres Rechtecks. Das war die geradeste Linie im Bild
                und der Grund fuer Wolfs "die raender sind immernoch zu gerade".

                Wolf am 28.08. ausserdem: "man sieht oben und unten sehr viel
                wand, rechts und links wenig, etwas breiter die wand". Stimmt,
                gemessen: bei inset -38% / -8% war die Flaeche 1,16 mal so
                breit wie die Projektion und fast genauso hoch -- also
                quadratisch. Eine Wand ist breiter als hoch. Jetzt 1,5 mal so
                breit und 0,85 mal so hoch wie die Projektion breit ist.

                Die Maske hat zwei Ebenen: die Wolke gibt die unregelmaessige
                Grenze, das Ziegelraster sorgt dafuer, dass am Rand ganze
                Steine verschwinden statt halber Fugen. intersect multipliziert
                beide. */}
            {/* Die Flaeche nimmt Mausbewegungen selbst an. Vorher hing der
                Lichtfleck am Kasten der Projektion, und der ist viel kleiner
                als die Wand -- ueber den Ziegeln, also genau dort, wo man
                hinfaehrt, passierte nichts. Das war der eigentliche Grund fuer
                Wolfs "hover nicht wirklich ersichtlich". Sie liegt hinter der
                Projektion und hat nichts zu klicken, faengt also nichts weg. */}
            <div aria-hidden="true" data-wandfeld="" ref={el => { this._wand = el; }}
              onMouseMove={e => {
                if (this._coarse) return;
                const el = e.currentTarget as HTMLElement;
                const q = el.getBoundingClientRect();
                el.style.setProperty('--wx', `${(e.clientX - q.left).toFixed(0)}px`);
                el.style.setProperty('--wy', `${(e.clientY - q.top).toFixed(0)}px`);
                el.style.setProperty('--wo', '1');
              }}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.setProperty('--wo', '0')}
              style={sx('position:absolute;inset:-25.5% -25%;z-index:0;'
              + `mask-image:url("${WAND_RAND}"),url("${WAND_STEINE}");`
              + `-webkit-mask-image:url("${WAND_RAND}"),url("${WAND_STEINE}");`
              + 'mask-size:100% 100%,540px 216px;-webkit-mask-size:100% 100%,540px 216px;'
              + 'mask-repeat:no-repeat,repeat;-webkit-mask-repeat:no-repeat,repeat;'
              + 'mask-composite:intersect')}>
              {/* Die Fugen. Sie liegen im selben gekippten Eltern-Element wie
                  die Projektion, teilen also deren Neigung -- Wolfs Auflage:
                  "sie hat die gleiche neigung wie die beamer view". Und sie
                  liegen unter ihr, die Projektion deckt ihren Teil der Wand
                  ab, wie es eine Projektion tut. */}
              <div style={sx('position:absolute;inset:0;'
                + `background-image:url("${WAND_FUGEN}");background-size:216px 72px;`
                + `opacity:${on ? .38 : .24};transition:opacity 1.2s ${EASE}`)}></div>
              {/* Das Licht auf den Fugen.
                  Wolf am 28.08.: "schimmer ist zu fleckig, soll sich eher wie
                  linien durchziehen also wie durch ein netz oder so weniger
                  linear".

                  Vorher lief EIN breites Band ueber die Flaeche. Ein einzelnes
                  Band ist genau das: ein Fleck, der wandert. Jetzt sind es
                  zwei Scharen schmaler Linien, 104 und 166 Grad, also 62 Grad
                  gegeneinander, und sie laufen verschieden schnell und in
                  verschiedene Richtungen. Wo sie sich kreuzen, wird es kurz
                  heller. Das ist das Netz.

                  Das Muster selbst steht weiter still, bewegt wird nur die
                  Maske -- der Fehler von gestern (eine verschobene zweite
                  Kopie, die doppelte Fugen daneben zeichnet) bleibt damit
                  behoben. Die Maskenkachel ist mit 4000 Pixel absichtlich viel
                  groesser als die Flaeche, und der Weg einer Runde ist genau
                  eine Periode der Linienschar, geteilt durch den Sinus ihres
                  Winkels: 300 / sin(104) = 309,2 und 340 / sin(166+90) = 350,4.
                  Dadurch schliesst die Bewegung auf sich selbst, es gibt kein
                  Springen am Rundenende. */}
              <div aria-hidden="true" data-welle="" style={sx('position:absolute;inset:0;mix-blend-mode:screen;'
                + `background-image:url("${WAND_FUGEN}");background-size:216px 72px;`
                + `opacity:${on ? .98 : .72};`
                + 'mask-image:repeating-linear-gradient(104deg,transparent 0px,transparent 168px,rgba(0,0,0,.26) 206px,#000 226px,rgba(0,0,0,.26) 246px,transparent 300px);'
                + '-webkit-mask-image:repeating-linear-gradient(104deg,transparent 0px,transparent 168px,rgba(0,0,0,.26) 206px,#000 226px,rgba(0,0,0,.26) 246px,transparent 300px);'
                + 'mask-size:4000px 4000px;-webkit-mask-size:4000px 4000px;'
                + 'mask-repeat:no-repeat;-webkit-mask-repeat:no-repeat;'
                + `animation:cwFugenWelle ${on ? 9 : 14}s linear infinite;transition:opacity 1.2s ${EASE}`)}></div>
              <div aria-hidden="true" data-netz="" style={sx('position:absolute;inset:0;mix-blend-mode:screen;'
                + `background-image:url("${WAND_FUGEN}");background-size:216px 72px;`
                + `opacity:${on ? .72 : .52};`
                + 'mask-image:repeating-linear-gradient(166deg,transparent 0px,transparent 196px,rgba(0,0,0,.24) 236px,#000 254px,rgba(0,0,0,.24) 272px,transparent 340px);'
                + '-webkit-mask-image:repeating-linear-gradient(166deg,transparent 0px,transparent 196px,rgba(0,0,0,.24) 236px,#000 254px,rgba(0,0,0,.24) 272px,transparent 340px);'
                + 'mask-size:4000px 4000px;-webkit-mask-size:4000px 4000px;'
                + 'mask-repeat:no-repeat;-webkit-mask-repeat:no-repeat;'
                + `animation:cwFugenNetz ${on ? 13 : 19}s linear infinite;transition:opacity 1.2s ${EASE}`)}></div>
              {/* "und soll auf hover reagieren": ein zweiter, ruhiger Weg,
                  Licht auf die Fugen zu bringen -- dort, wo der Zeiger liegt,
                  werden sie hell. Kein Fleck auf der Wand (das graue Licht ist
                  am 28.08. genau deshalb rausgeflogen), sondern nur die Linien
                  selbst, denn dieselbe Zeichnung liegt darunter. Die Stelle
                  kommt als CSS-Variable direkt an das Element, ohne
                  Zustandswechsel, sonst rechnet die Seite bei jeder
                  Mausbewegung die ganze Station neu. */}
              <div aria-hidden="true" data-fugenlicht="" style={sx('position:absolute;inset:0;mix-blend-mode:screen;'
                + `background-image:url("${WAND_FUGEN}");background-size:216px 72px;`
                + `mask-image:${fleck};-webkit-mask-image:${fleck};`
                + `opacity:var(--wo,0);transition:opacity .45s ${EASE}`)}></div>
              {/* Wolf am 28.08.: "hover nicht wirklich ersichtlich". Der Fleck
                  war mit "circle" ohne Mass angegeben, und ohne Mass rechnet
                  ein Radialverlauf bis zur entferntesten Ecke -- auf einer
                  914 px breiten Flaeche waren die 56 Prozent also rund 300 px
                  weiches Nichts. Jetzt sind es feste 230 px mit hartem Kern,
                  und derselbe Fleck liegt ein zweites Mal darueber: zweimal
                  screen an derselben Stelle ist heller als einmal, ohne dass
                  die Fugen ausserhalb etwas abbekommen. */}
              <div aria-hidden="true" style={sx('position:absolute;inset:0;mix-blend-mode:screen;'
                + `background-image:url("${WAND_FUGEN}");background-size:216px 72px;`
                + `mask-image:${fleck};-webkit-mask-image:${fleck};`
                + `opacity:calc(var(--wo,0) * .7);transition:opacity .45s ${EASE}`)}></div>
            </div>
            {/* Hier lagen noch zwei Lichtschichten: eine Koernung, die die
                Streifen des grauen Verlaufs brechen sollte, und ein
                Lichtfleck, der beim Anspringen aufging. Beide sind mit dem
                Verlauf hinfaellig -- die Koernung hatte nichts mehr zu
                brechen, und der Fleck war genau das "graue Licht auf der
                Wand", das weg sollte. */}
            {/* In Ruhe hat die Projektion weder Rand noch Grund: der Beamer ist
                aus, also ist dort nichts ausser der Wand. Genau das behauptet
                die Ueberschrift, und ein dunkles Rechteck mit Haarlinie
                behauptete stattdessen ein Geraet. Erst wenn die Lampe angeht,
                bekommt sie eine Flaeche und eine Kante. */}
            <div data-m="leinwand" style={sx('position:relative;z-index:1;width:100%;aspect-ratio:16/9;border-radius:4px;overflow:hidden;'
              + `border:1px solid ${on ? 'rgba(246,239,230,.22)' : 'transparent'};`
              + `background:${on ? 'linear-gradient(180deg,#141024,#0a0714)' : 'transparent'};`
              + `box-shadow:${on ? '0 0 60px rgba(255,242,250,.06),inset 0 0 90px rgba(255,242,250,.03)' : 'none'};`
              + `transition:border-color .9s ${EASE},box-shadow 1.1s ${EASE},background .9s ${EASE}`)}>
              {/* In Ruhe war die Leinwand eine leere dunkle Flaeche, und seit
                  sie kleiner ist faellt das staerker auf. Also steht dort
                  jetzt, was zu tun ist. Geht weg, sobald die Lampe angeht. */}
              <div aria-hidden={on} style={sx('position:absolute;inset:0;z-index:14;display:flex;align-items:center;justify-content:center;pointer-events:none;'
                + `opacity:${on ? 0 : 1};transition:opacity .5s ${EASE}`)}>
                <span style={sx('padding:11px 20px;border-radius:999px;border:1px solid rgba(246,239,230,.18);background:rgba(246,239,230,.04);'
                  + 'font-size:14px;font-weight:800;letter-spacing:.02em;color:rgba(246,239,230,.62)')}>{L.ablauf.wandHint}</span>
              </div>
              <div data-m="screenbox" style={sx(`position:absolute;inset:0;overflow:hidden;pointer-events:none;background:${on ? '#0b0714' : 'transparent'};transition:background .45s ${EASE} ${on ? '0s' : '.35s'}`)}>
                <div aria-hidden="true" style={sx(`position:absolute;inset:0;z-index:12;pointer-events:none;opacity:0;background:linear-gradient(160deg,#efe4dc,#cdbfcb);animation:${on ? 'cwBeamOn 1.9s cubic-bezier(.4,0,.3,1) both' : 'none'};transition:opacity .8s ease`)}></div>
                <div style={sx(`position:absolute;left:50%;top:50%;width:${WALL_W}px;height:${WALL_H}px;transform-origin:center center;opacity:${on ? 1 : 0};transition:opacity .5s ${EASE} ${on ? '1.1s' : '0s'};transform:translate(-50%,-50%) scale(${this.state.wallScale ?? 0.8})`)}>
                  <div data-m="wallscreen" style={sx('width:640px;height:354px;box-sizing:border-box;padding:22px 26px;border-radius:4px;display:flex;flex-direction:column;overflow:hidden;position:relative;'
                    + `background:radial-gradient(ellipse 120% 90% at 50% 0%,${g.catFarbe}1f,transparent 62%),`
                    + `linear-gradient(180deg,${g.catFarbe}14,#07060d 70%);`
                    + `transition:background .6s ${EASE}`)}>
                    {/* Die Uhr der Frage, wie in der App als duenner Balken
                        ueber der ganzen Breite. Er laeuft leer, solange die
                        Frage laeuft, und ist in Aufloesung und Brett weg. */}
                    <span aria-hidden="true" style={sx('position:absolute;left:0;right:0;top:0;height:4px;z-index:10;background:rgba(246,239,230,.08)')}>
                      <span style={sx(`display:block;height:100%;width:${g.uhrAnteil}%;background:${g.catFarbe};transition:width .2s linear,background .6s ${EASE}`)}></span>
                    </span>
                    {/* Die Begruessungsfolie der App, Stand 27.08., nach dem
                        Bildschirmfoto von Wolf: dunkler Grund mit warmem
                        Schein und Sternen, klein die Zeile "Herzlich
                        willkommen zum", darunter die Wortmarke sehr gross und
                        weit gesperrt, darunter der Gruss. Der 3D-Wolf steht
                        links am Rand und ist angeschnitten.
                        Der Wolf kommt aus dem Begruessungsvideo der App
                        (public/videos/willkommen-wolf.webm, vp9, 768 px,
                        5,17 s): letztes Bild entnommen, der dunkle Grund von
                        aussen geflutet, 46 Prozent der Flaeche durchsichtig,
                        auf 440 px Hoehe gerechnet. Ein Video von einem
                        Megabyte fuer eine Geste, die auf der Landing niemand
                        zweimal sieht, waere die Ladezeit nicht wert. */}
                    {/* Wolf am 28.08.: "ecken komisch waehrend beamer aktiv".
                        Dieselbe Ursache wie beim Lichtblitz gestern, nur an
                        drei weiteren Schichten: Begruessung, Reflexion und
                        Abdunklung trugen 22 px Eckradius, der Kasten darunter
                        4. In den vier Ecken blieb damit ein dunkler Zwickel
                        stehen, der nicht zum Bild gehoert. Eine Projektion hat
                        keine runden Ecken; die Rundung schneidet ohnehin der
                        Kasten, keine dieser Schichten braucht eine eigene. */}
                    <div aria-hidden="true" style={sx('position:absolute;inset:0;z-index:9;overflow:hidden;pointer-events:none;'
                      // Uebernommen aus QQBeamerPage.tsx der App, Zeile 6060:
                      // derselbe Grund, dieselben zwei Verlaeufe. Der rosa
                      // Schein von vorher war meine Erfindung und hat die Folie
                      // waermer gemacht, als sie am Abend ist.
                      + 'background:radial-gradient(ellipse at 50% -10%,rgba(246,239,230,.10),transparent 55%),'
                      + 'radial-gradient(ellipse at 85% 110%,rgba(99,102,241,.08),transparent 55%),#120F18;'
                      + `opacity:${this.state.beamWelcome ? 1 : 0};transition:opacity .8s ${EASE} ${this.state.beamWelcome ? '.75s' : '0s'}`)}>
                      {STERNE.map((st, i) => (
                        <span key={i} style={sx(`position:absolute;left:${st.x}%;top:${st.y}%;width:${st.g}px;height:${st.g}px;border-radius:50%;`
                          + `background:rgba(247,228,168,${st.o});box-shadow:0 0 7px rgba(247,228,168,.55);`
                          + `animation:cwFunke 5.4s ease-in-out ${st.d}s infinite`)}></span>
                      ))}
                      {/* Wolf am 28.08.: "das waere das video des wolfs, wuerdest
                          du das reinnehmen wie in einem echten beamer?" und
                          "im github repo sollte schon ein freigestellter wolf
                          liegen". Beides stimmt: die Fassung, die er zuerst
                          geschickt hat, hat keinen Alphakanal (gemessen: null
                          Prozent durchsichtige Bildpunkte, Ecken voll deckend),
                          die aus der App hat einen (62,5 Prozent durchsichtig).
                          Also die aus der App, unveraendert uebernommen.

                          preload="none" und ein Standbild als poster: die Datei
                          ist 966 KB, und sie soll nicht beim Seitenaufbau
                          geladen werden, sondern erst wenn die Lampe angeht.
                          Bis dahin steht der gezeichnete Wolf da, wie bisher.
                          Faellt das Video aus, bleibt er stehen -- auf einer
                          Folie, die nur aus Marke besteht, darf kein Loch sein.

                          Kein loop, wie in der App: die Endpose ist ruhig, und
                          eine Geste, die sich wiederholt, wird aufdringlich. */}
                      <video ref={el => { this._wolfV = el; }}
                        src="/assets/wolf-willkommen.webm" poster="/assets/wolf-3d.webp"
                        muted playsInline preload="none" width={384} height={440}
                        // Wolf am 28.08.: "wolf abgeschnitten, etwas nach
                        // rechts schieben ohne in den mittigen text rein".
                        // Stimmt: bei left:-34px lagen 34 px des linken Arms
                        // ausserhalb der Projektion und wurden abgeschnitten.
                        // Das liest sich als Fehler, nicht als Absicht. Jetzt
                        // steht er ganz drin; das Polster des Textblocks
                        // wandert entsprechend mit, damit er weiter neben der
                        // Marke steht und nicht davor.
                        style={sx('position:absolute;left:12px;bottom:-26px;width:auto;height:74%;'
                          + 'filter:drop-shadow(0 18px 30px rgba(0,0,0,.55))')} />
                      {/* Wolf am 28.08.: "wolf sieht super aus, jetzt noch text
                          kleiner dann liegt der wolf nicht vorne dran".
                          Zwei Griffe: die Wortmarke von 76 auf 58 px, und der
                          Textblock bekommt links Platz fuer den Wolf. Er steht
                          bei 74 Prozent Hoehe und reicht damit rund 200 px in
                          die 640 px breite Folie -- der Text zentriert sich
                          jetzt in dem, was daneben uebrig ist, statt in der
                          ganzen Flaeche. Damit steht der Wolf neben der Marke
                          und nicht davor. */}
                      <div style={sx('position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:0 30px 0 258px;box-sizing:border-box')}>
                        <span style={sx('font-size:12px;font-weight:900;letter-spacing:.2em;text-transform:uppercase;color:rgba(246,239,230,.78)')}>{L.sim.welcomeKicker}</span>
                        <span style={sx("font-family:'League Spartan',sans-serif;font-size:58px;font-weight:900;letter-spacing:.05em;line-height:.92;color:#F6EFE6;text-transform:uppercase")}>{L.sim.welcomeTitle}</span>
                        <span style={sx('margin-top:8px;font-size:17px;font-weight:900;line-height:1.3;color:#F6EFE6;text-align:center')}>{L.sim.welcomeSub}</span>
                      </div>
                    </div>
                    <span aria-hidden="true" style={sx('position:absolute;inset:0;pointer-events:none;overflow:hidden')}>
                      {/* Kein runder Fleck mehr. Wolf: "eher diese reflektion
                          und nicht rund". Also ein schraeger Lichtstreifen wie
                          auf Glas, der mit der Kippung ueber die Flaeche
                          wandert: kippt die Wand nach rechts, laeuft die
                          Reflexion nach links, so wie sich ein Fenster in
                          einem Bildschirm verhaelt, den man dreht. */}
                      <span style={sx('position:absolute;inset:-40%;'
                        + `transform:translateX(${((kipp?.x ?? 0) * -34).toFixed(1)}%) rotate(-19deg);`
                        + 'background:linear-gradient(90deg,transparent 34%,rgba(255,250,242,.10) 46%,rgba(255,250,242,.14) 50%,rgba(255,250,242,.07) 55%,transparent 68%);'
                        + `transition:transform ${kipp ? '.18s' : '.7s'} ${EASE}`)}></span>
                    </span>
                    {/* Hier lag eine runde Abdunklung zu den Ecken hin. Auf
                        dunklem Grund liest sie sich nicht als Vignette,
                        sondern als runder heller Fleck in der Mitte, und genau
                        den hat Wolf am 27.08. noch gesehen, nachdem der
                        eigentliche Lichtfleck schon weg war. Jetzt dunkelt es
                        nur noch an den vier Kanten ab, gerade und ohne Mitte. */}
                    <span aria-hidden="true" style={sx('position:absolute;inset:0;pointer-events:none;'
                      + 'background:linear-gradient(180deg,rgba(0,0,0,.26),transparent 16%,transparent 84%,rgba(0,0,0,.26)),'
                      + 'linear-gradient(90deg,rgba(0,0,0,.22),transparent 12%,transparent 88%,rgba(0,0,0,.22))')}></span>
                    <div style={sx('position:relative;display:flex;align-items:center;gap:14px;flex:none')}>
                      <span style={sx(g.catPillStyle)}>{g.catName}</span>
                      <span style={sx('font-size:11px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:rgba(246,239,230,.5);white-space:nowrap')}>{g.statusLine}</span>
                      <span style={sx('flex:1')}></span>
                      <span style={sx(g.ringStyle)}>{g.showQuestion ? g.seconds : ''}</span>
                    </div>

                    {/* Wolf am 28.08.: "die uebergaenge in der
                        beamerpraesentation koennten noch etwas cleaner sein".
                        Vorher wurde hart geschnitten: Frage weg, Brett da, im
                        selben Bild. Jetzt blendet das Eintreffende in 0,38 s
                        auf und kommt dabei 10 px von unten -- eine
                        Folienschaltung statt eines Sprungs. Der Schluessel
                        haengt an der Rundennummer, damit die Bewegung bei
                        jedem Wechsel neu laeuft, aber NICHT beim Uebergang von
                        der Frage zur Aufloesung: dort blenden Rahmen und Grund
                        der richtigen Antwort weich um, und ein Neuaufbau
                        mittendrin wuerde genau das abwuergen. */}
                    {g.showQuestion && (
                      <div key={`f${g.runde}`} style={sx(`display:flex;flex-direction:column;flex:1;min-height:0;animation:cwFolie .38s ${EASE} both`)}>
                        {/* Die Frage steht frei und mittig, ohne Kasten. Der
                            Kasten war das letzte, was die Folie eingeengt hat,
                            und in der App gibt es ihn nicht. */}
                        <div style={sx('flex:1;display:flex;align-items:center;justify-content:center;padding:0 18px;min-height:0')}>
                          <div style={sx(g.qCardStyle)}>{g.qText}</div>
                        </div>
                        {/* Schaetzchen hat keine Antworten zum Anklicken,
                            sondern eine Zahl. Vor der Aufloesung stehen drei
                            Striche da, danach die Zahl mit ihrer Einheit -- das
                            ist der ganze Reiz der Kategorie, und drei
                            Auswahlzeilen daneben waeren eine Behauptung ueber
                            ein Spiel, das es so nicht gibt. */}
                        {g.qArt === 'schaetz' ? (
                          <div style={sx('flex:none;display:flex;flex-direction:column;align-items:center;gap:5px')}>
                            {/* Die Antworttafel steht ueber dem Strahl, wie in
                                der App. Vor der Aufloesung drei Striche. */}
                            <div style={sx(g.schaetzStyle)}>
                              <span style={sx(g.schaetzZahlStyle)}>{g.showReveal ? g.qLoesung : '– – –'}</span>
                              <span style={sx(g.schaetzEinheitStyle)}>{g.qEinheit}</span>
                            </div>
                            <div style={sx('position:relative;width:100%;height:96px')}>
                              <span aria-hidden="true" style={sx(g.strahlSchieneStyle)}></span>
                              <span aria-hidden="true" style={sx(g.strahlDiamantStyle)}></span>
                              {g.strahl?.map((s, i) => (
                                <span key={i} style={sx(s.style)}>
                                  <span style={sx('display:flex;flex-direction:column;align-items:center;gap:1px')}>
                                    <span style={sx(s.wertStyle)}>{s.wert}</span>
                                    <span style={sx(s.abStyle)}>{s.abweichung}</span>
                                  </span>
                                  <span style={sx(s.markeStyle)}></span>
                                  <span aria-hidden="true" style={sx(s.stielStyle)}></span>
                                </span>
                              ))}
                            </div>
                            <div style={sx('display:flex;justify-content:space-between;width:100%')}>
                              <span style={sx(g.strahlRandStyle)}>&larr; zu niedrig</span>
                              <span style={sx(g.strahlRandStyle)}>zu hoch &rarr;</span>
                            </div>
                          </div>
                        ) : (
                          <div style={sx('display:flex;gap:12px;flex:none')}>
                            {g.qOptions.map((o, i) => (
                              <div key={i} style={sx(o.style)}>
                                <div style={sx(o.kopfStyle)}>
                                  <span style={sx(o.numStyle)}>{o.num}</span>
                                  <span style={sx('flex:1;font-size:14px;font-weight:900;color:#F6EFE6;line-height:1.2')}>{o.label}</span>
                                </div>
                                {/* Wer auf diese Antwort gesetzt hat. Bei 10 von
                                    10 mit dem Einsatz daneben, bei Mu-Cho nur
                                    die Kachel. */}
                                <div style={sx(o.chipZeileStyle)}>
                                  {o.chips.map((c, j) => (
                                    <span key={j} style={sx('display:flex;align-items:center;gap:5px')}>
                                      <span style={sx(c.markeStyle)}></span>
                                      {c.wert !== null && <span style={sx(c.wertStyle)}>{c.wert}</span>}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        <div style={sx('margin-top:10px;display:flex;flex-direction:column;align-items:center;gap:6px;flex:none')}>
                          <span style={sx('font-size:12.5px;font-weight:900;letter-spacing:.04em;color:rgba(246,239,230,.7);white-space:nowrap')}>{g.answeredLine}</span>
                          <div style={sx('display:flex;gap:10px')}>
                            {g.teamDiscs.map((d, i) => <span key={i} style={sx(d.style)}></span>)}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Das Brett rechnet seine Zellgroesse aus der rechten
                        Spalte in Station 01 (340 px). In der Leinwand steht
                        weniger Hoehe zur Verfuegung, gemessen 262 px gegen
                        316 px Brett, und der Ueberstand hat die Kopfzeile
                        ueberdeckt. Deshalb hier ein Faktor statt einer
                        zweiten Rechnung: dieselbe Zeichnung, kleiner. */}
                    {g.showBoard && (
                      <div key={`b${g.runde}`} style={sx(`flex:1;min-height:0;width:100%;margin-top:8px;display:flex;gap:12px;align-items:center;justify-content:center;overflow:hidden;animation:cwFolie .38s ${EASE} both`)}>
                        <div style={sx('flex:none;transform:scale(.72);transform-origin:center center')}>
                          {this.renderBoard(g)}
                        </div>
                        <div style={sx('flex:1;max-width:340px;display:flex;flex-direction:column;gap:4px;min-width:0')}>
                          {g.standings.map((s, i) => (
                            <div key={i} style={sx(s.rowStyle)}>
                              <span style={sx(s.discStyle)}></span>
                              <span style={sx(s.nameStyle + ';flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis')}>{s.name}</span>
                              <span style={sx("flex:none;display:flex;align-items:baseline;gap:5px")}>
                                <span style={sx("font-family:'League Spartan',sans-serif;font-size:24px;font-weight:900;line-height:1;color:#F6EFE6;font-variant-numeric:tabular-nums")}>{s.zahl}</span>
                                <span style={sx('font-size:12.5px;font-weight:800;color:rgba(246,239,230,.55);white-space:nowrap')}>{s.einheit}</span>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
            </div>
          </div>

          {/* Fassung B2, von Wolf gewaehlt: die Aussage des Abschnitts ist nicht
              "hier sind zwei Listen", sondern "ihr braucht fast nichts". Also
              traegt die Ueberschrift das Ungleichgewicht, und darunter steht
              eine Zeile gegen vier.
              Weg sind die zwei Kaesten, die beim Zeigen aufklappten: sie
              versteckten beide Listen hinter einer Mausbewegung, und auf dem
              Handy gab es die gar nicht. Wolfs Einwand "nicht 2 mal die
              grosse schrift" ist der Grund, warum hier nichts gross gesetzt
              ist: die Ueberschrift sagt es schon. */}
          {/* Hier standen zwei Listen, "Ihr braucht" und "Ich bringe mit".
              Wolf am 28.08.: "mach das unten raus, das brauchts nicht die 2
              textfelder". Er hat recht, und zwar aus zwei Gruenden. Die
              Ueberschrift sagt es schon ("Mehr als eine freie Wand braucht ihr
              nicht"), und die Unterzeile sagt den Rest ("Beamer, Sound, Aufbau
              und Moderation bringe ich mit"). Die Listen haben das nur noch
              einmal aufgezaehlt. Was wirklich neu war, steht ohnehin in den
              Fragen weiter unten.
              Die Texte selbst bleiben in texts.ts stehen: sie sind gepflegt,
              zweisprachig, und die Handyfassung greift noch darauf zu. */}
        </div>
      </section>
    );
  }

  renderJohannes() {
    const L = this.T;
    return (
      <section id="johannes" data-ton="249,115,22" data-halt="" style={sx('')}>
        <div data-shell="" style={sx('width:100%;max-width:1180px;margin:0 auto;padding:60px 32px;box-sizing:border-box;display:grid;grid-template-columns:300px 1fr;gap:52px;align-items:start')} data-m="joh">
          {/* Wolf am 27.08.: das echte Foto bleibt, die auffaechernden Arme und
              der pinke Ring gehen. Die beiden Nebenbilder waren Schmuck, der
              beim Zeigen aufsprang und sonst nichts sagte, und der Ring hat
              Pink genau dort gesetzt, wo es raus soll. Uebrig bleibt ein
              rundes Foto mit einer Haarlinie, wie jede andere Kante der Seite. */}
          <div style={sx('display:flex;flex-direction:column;align-items:center;gap:14px')}>
            {/* Wolf am 28.08.: "kannst du dieses bild an die stelle des
                aktuellen packen? das ist sympatischer". Stimmt -- Muetze und
                offener Blick passen besser zu jemandem, der einen Abend
                moderiert, als ein neutrales Portraet.
                Der Ausschnitt ist hier schon quadratisch geschnitten (1180 von
                1180 aus 1180 mal 1600, ab Hoehe 210), deshalb steht die
                Bildlage jetzt auf center und nicht mehr auf "center 22%" --
                die 22 Prozent waren auf das alte Bild eingestellt.
                440 statt 320 px, also das Doppelte der Anzeigegroesse: das
                alte war fuer Retina schon knapp. Als webp 28 KB.
                Kein Zeigeeffekt, und das ist eine Entscheidung: jeder Hover auf
                dieser Seite beantwortet etwas. Ein Portraet hat darauf keine
                Antwort, und es ist die einzige Stelle, an der einen jemand
                ansieht -- was sich dabei bewegt, wirkt sofort wie ein
                Stockfoto. */}
            <img src="/assets/johannes-rund.webp" loading="lazy" decoding="async" width={440} height={440} alt={L.johannes.photoAlt}
              style={sx('width:220px;height:220px;border-radius:50%;object-fit:cover;object-position:center;border:1px solid rgba(246,239,230,.20);' + schatten('box-shadow:0 24px 50px rgba(0,0,0,.55)'))} />
            <div style={sx('font-size:18px;font-weight:900;color:#F6EFE6')}>{L.johannes.name}</div>
          </div>
          <div>
            {/* Wolf am 28.08. zu den Kapseln: "denk daran den text dann
                wieder richtig auszurichten ans bild". Vorher standen beide
                Spalten mittig zueinander, und das ging, solange die rechte
                durch die Kapseln laenger war als die linke. Ohne sie ist sie
                kuerzer, und mittig heisst dann: der Text schwebt neben dem
                Foto. Jetzt oben ausgerichtet -- das Zitat faengt dort an, wo
                das Foto anfaengt. Die 6 px Versatz gleichen die Zeilenhoehe
                des Kickers aus, damit seine Oberkante wirklich auf der des
                Fotos liegt und nicht seine Zeilenkante. */}
            <div data-reveal="" style={sx('margin-top:6px;font-size:12px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;color:rgba(246,239,230,.62);margin-bottom:12px')}>{L.johannes.kicker}</div>
            <h2 data-reveal="" style={sx("margin:0 0 18px;max-width:700px;font-family:'League Spartan',sans-serif;font-size:30px;font-weight:900;line-height:1.18;color:#F6EFE6;cursor:default;hyphens:none")}>
              {/* Ohne zweite Farbe traegt die Helligkeit die Betonung: das
                  Hervorgehobene steht in vollem Creme, der Rest gedaempft.
                  Wolf am 27.08.: "hier sollte beim hovern was mit den helleren
                  woertern passieren". Also zeigt man auf ein betontes Wort,
                  hebt es sich leicht an und der ganze uebrige Satz faellt
                  weiter zurueck; das betonte Wort steht dann allein da. Nur
                  die betonten Woerter reagieren, die uebrigen sind kein Ziel:
                  ein Satz, in dem jedes Wort zuckt, ist kein Zitat mehr. */}
              {L.johannes.quote.map((qw, i) => {
                const an = qw.hot && this.state.zeig === `q${i}`;
                const still = !!this.state.zeig && String(this.state.zeig).startsWith('q') && !an;
                return (
                  <span key={i}>
                    <span
                      onMouseEnter={qw.hot && !this._coarse ? () => this.setState({ zeig: `q${i}` }) : undefined}
                      onMouseLeave={qw.hot && !this._coarse ? () => this.setState({ zeig: null }) : undefined}
                      style={sx('display:inline-block;white-space:nowrap;'
                        + `color:${qw.hot ? '#F6EFE6' : 'rgba(246,239,230,.6)'};`
                        + `opacity:${still ? (qw.hot ? .4 : .3) : 1};`
                        + `transform:translateY(${an ? -3 : 0}px);`
                        + `${qw.hot ? 'cursor:default;' : ''}`
                        + `transition:opacity .3s ${EASE},transform .3s ${EASE}`)}>{qw.w}</span>
                    {i < L.johannes.quote.length - 1 ? ' ' : ''}
                  </span>
                );
              })}
            </h2>
            <p style={sx('margin:0 0 22px;max-width:680px;font-size:17px;line-height:1.65;font-weight:500;color:rgba(246,239,230,.78)')}>{L.johannes.body}</p>
            {/* Hier standen vier Kapseln: "Persoenliche Moderation vor Ort",
                "Fuer Gruppen von sechs bis 160 Personen", "Individuell auf
                eure Gruppe abgestimmt", "Region Hamburg und Umland".
                Wolf am 28.08.: "brauchen wir die noch?" Nein. Alle vier
                stehen schon woanders, und zwar konkreter: die Moderation im
                Kicker oben, in 04 und im Zitat direkt darueber; die
                Personenzahl in 01 ("Bis 40" / "Ab 40") und in der Antwort auf
                "Fuer wie viele Personen funktioniert das?" ("bis zu 160");
                das Abstimmen in 02 und 04; die Region im Kicker oben und in
                der Antwort auf "Wie weit faehrst du?".
                Dazu die Form: es war die einzige Wolke aus Kapseln auf der
                Seite. Das Muster kommt aus Lebenslaeufen, und unter einem
                persoenlichen Zitat liest es sich als Faehigkeitsliste statt
                als Aussage. */}
          </div>
        </div>
      </section>
    );
  }

  /**
   * Fassung D1, Wolf am 2026-08-27: alle sechs Fragen offen in zwei Spalten.
   * Keine Aufklapp-Kaesten mehr. Wer wissen will, was es kostet, muss nicht
   * erst klicken, und die Antworten stehen beim Scrollen einfach mit da.
   */
  renderFaq() {
    const L = this.T;
    return (
      <section id="fragen" data-halt="" style={sx('')}>
        <div data-shell="" style={sx('width:100%;max-width:1180px;margin:0 auto;padding:60px 32px;box-sizing:border-box')}>
          {this.kicker(`[ 05 ]|${L.faq.label}`)}
          <h2 data-reveal="" style={sx(`margin:0 0 36px;font-family:'League Spartan',sans-serif;font-size:${H2_GROSS};line-height:.9;letter-spacing:-.032em;font-weight:900;color:#F6EFE6`)}>{L.faq.h2}</h2>
          <div data-reveal="" data-m="faqgrid" style={sx('display:grid;gap:34px 56px;grid-template-columns:1fr 1fr')}>
            {/* Wolf am 27.08.: "h1 bei Kacheln, h2 bei text". Also hier das
                Anruecken: die Frage rueckt 10 px nach rechts und bekommt einen
                Strich, der von 0 auf 22 px waechst. Keine Farbe, nur Lage und
                Laenge, wie bei den Fragetypen in 03. */}
            {L.faq.items.map(item => {
              const an = this.state.zeig === item.q;
              return (
                <div key={item.q}
                  onMouseEnter={() => { if (!this._coarse) this.setState({ zeig: item.q }); }}
                  onMouseLeave={() => { if (!this._coarse) this.setState({ zeig: null }); }}
                  style={sx('padding-top:22px;border-top:1px solid rgba(246,239,230,.14);'
                    + `transform:translateX(${an ? 10 : 0}px);transition:transform .3s ${EASE}`)}>
                  <div style={sx('display:flex;align-items:baseline;gap:10px;margin-bottom:9px')}>
                    <span aria-hidden="true" style={sx(`flex:none;width:${an ? 22 : 0}px;height:2px;border-radius:2px;background:#F6EFE6;`
                      + `opacity:${an ? .8 : 0};transition:width .3s ${EASE},opacity .3s ${EASE}`)}></span>
                    <span style={sx('font-size:18px;font-weight:900;line-height:1.3;color:#F6EFE6;text-wrap:balance')}>{item.q}</span>
                  </div>
                  <div style={sx('font-size:15.5px;line-height:1.62;font-weight:500;color:rgba(246,239,230,.76);text-wrap:pretty')}>{item.a}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  renderForm() {
    const L = this.T;
    const test = this.state.formMode === 'test';
    const st = this.state.formStatus;
    const inputStyle = 'width:100%;box-sizing:border-box;padding:11px 14px;border-radius:12px;background:rgba(246,239,230,.05);border:1.5px solid rgba(246,239,230,.38);color:#F6EFE6;font-family:inherit;font-size:15px;font-weight:600';
    const labelStyle = 'font-size:13px;font-weight:800;color:rgba(246,239,230,.78);letter-spacing:.01em';
    const fieldWrap = 'display:flex;flex-direction:column;gap:6px';
    const req = <span aria-hidden="true" style={sx(`color:${AKZENT}`)}> *</span>;
    return (
      <section id="anfragen" data-ton="250,75,163" data-halt="" style={sx('background:radial-gradient(ellipse at 50% 0%,rgba(246,239,230,.05),transparent 70%)')}>
        <span aria-hidden="true" style={sx('display:block;height:1px;background:linear-gradient(90deg,transparent,rgba(246,239,230,.22),transparent)')}></span>
        {/* Fassung E1, von Wolf gewaehlt, mit seiner Auflage: "die formulare
            zwischen testteams und ernsthafter anfrage muss klar getrennt sein".
            Also links die Wahl als zwei grosse Zeilen mit ihrem Preis, rechts
            das Formular, das mit einer Aufschrift sagt, welcher der beiden
            gerade ausgefuellt wird. Zwei Reiter nebeneinander hatten das
            nicht geleistet: sie sahen aus wie eine Einstellung, nicht wie
            eine Entscheidung.
            Nebenwirkung, und die war das Ziel: der Abschnitt lag bei 1,29
            Bildschirmen und war damit der letzte, der nicht auf einen Halt
            passte. Nebeneinander statt untereinander loest das. */}
        <div data-shell="" data-m="formraum" style={sx('position:relative;width:100%;max-width:1180px;margin:0 auto;padding:56px 32px;box-sizing:border-box;'
          + 'display:grid;grid-template-columns:minmax(0,420px) minmax(0,1fr);gap:56px;align-items:stretch')}>
          <div style={sx('display:flex;flex-direction:column')}>
            {this.kicker(`[ 06 ]|${L.form.label}`)}
            <h2 data-reveal="" style={sx("margin:0 0 12px;font-family:'League Spartan',sans-serif;font-weight:900;line-height:1.02;letter-spacing:-.028em;color:#F6EFE6;text-wrap:balance;"
              + 'font-size:clamp(38px,4vw,64px)')}>{L.form.h2}</h2>
            <p style={sx('margin:0 0 10px;' + UNTERZEILE)}>{L.form.sub}</p>
            <p style={sx('margin:0 0 26px;font-size:14px;font-weight:800;letter-spacing:.02em;color:rgba(246,239,230,.62)')}>{L.form.avail}</p>

            {/* Die beiden Wege. Der gewaehlte steht hell und traegt einen
                Strich, der andere faellt zurueck. Das ist H2 aus dem
                Zeigen-Mockup, hier auf die Wahl angewandt.

                Wolf am 28.08.: "gleich hoch faende ich besser und ich finde es
                geht etwas unter, dass man waehlen kann links?"

                Beides stimmte, und es hing zusammen. Die Spalte stand auf
                align-items:start, war also so hoch wie ihr Inhalt und endete
                irgendwo neben dem Formularkasten. Und die zwei Wege sahen aus
                wie zwei Preisangaben, von denen eine ausgegraut ist: der
                nicht gewaehlte lag bei 45 Prozent Deckkraft, und ausgegraut
                heisst normalerweise "geht nicht", nicht "waehl mich".

                Beides loest dieselbe Massnahme: die Spalte wird gestreckt, und
                die beiden Wege teilen sich den uebrigen Platz (flex:1). Sie
                sind damit gleich gross, fuellen die Spalte bis zur Unterkante
                des Formulars und sehen aus wie zwei Felder, zwischen denen man
                sich entscheidet.
                Dazu drei kleine Zeichen: ein Ring vor jedem, der beim
                gewaehlten gefuellt ist -- das kennt jeder als Auswahl --, eine
                Zeile darueber, die zum Waehlen auffordert, und der nicht
                gewaehlte steht jetzt bei 62 statt 45 Prozent und hellt beim
                Zeigen auf. */}
            <div style={sx('margin-top:4px;font-size:12px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;color:rgba(246,239,230,.5)')}>{L.form.wahl}</div>
            {[
              { k: 'test' as const, an: test, gross: L.form.testBig, klein: L.form.testSub, titel: L.form.tabTest, n1: L.form.testNote1, n2: L.form.testNote2 },
              { k: 'event' as const, an: !test, gross: L.form.priceBig, klein: L.form.priceSub, titel: L.form.tabEvent, n1: L.form.priceNote1, n2: L.form.priceNote2 },
            ].map(w => (
              <button key={w.k} type="button" onClick={() => this.openForm(w.k)}
                aria-pressed={w.an} data-wahl="" data-an={w.an ? '' : undefined}
                style={sx('display:flex;flex-direction:column;justify-content:center;flex:1;width:100%;box-sizing:border-box;'
                  + 'text-align:left;cursor:pointer;background:none;font-family:inherit;'
                  + 'border:none;border-top:1px solid rgba(246,239,230,.14);padding:20px 0;'
                  + `opacity:${w.an ? 1 : .62};transition:opacity .3s ${EASE}`)}>
                <span style={sx('display:flex;align-items:center;gap:12px;margin-bottom:6px;'
                  + `transform:translateX(${w.an ? 10 : 0}px);transition:transform .3s ${EASE}`)}>
                  {/* Der Ring: gefuellt heisst gewaehlt. Das ist das Zeichen,
                      das jeder aus jedem Formular kennt, und es sagt in einem
                      Blick, dass hier eine Entscheidung liegt. */}
                  <span aria-hidden="true" style={sx('flex:none;display:flex;align-items:center;justify-content:center;'
                    + `width:15px;height:15px;border-radius:50%;border:1.5px solid rgba(246,239,230,${w.an ? '.9' : '.42'});`
                    + `transition:border-color .3s ${EASE}`)}>
                    <span style={sx(`display:block;width:7px;height:7px;border-radius:50%;background:#F6EFE6;`
                      + `transform:scale(${w.an ? 1 : 0});transition:transform .3s ${EASE}`)}></span>
                  </span>
                  <span style={sx("font-family:'League Spartan',sans-serif;font-size:clamp(24px,2.4vw,32px);font-weight:900;line-height:1;letter-spacing:-.025em;color:#F6EFE6;white-space:nowrap")}>{w.gross}</span>
                  <span style={sx('font-size:14px;font-weight:800;color:rgba(246,239,230,.7);white-space:nowrap')}>{w.klein}</span>
                </span>
                <span style={sx('display:block;font-size:15px;line-height:1.5;font-weight:600;color:rgba(246,239,230,.72);max-width:38ch')}>
                  {w.n1} {w.n2}
                </span>
              </button>
            ))}
          </div>

          {/* Die Spalte wird gestreckt, aber der Kasten darin muss sie auch
              fuellen -- sonst sind zwar die Spalten gleich hoch und die Karte
              endet trotzdem irgendwo dazwischen. Genau das war zu sehen:
              gemessen beide Spalten 575 px, die Karte darin nur 470. */}
          <div data-form-panel="" style={sx('min-width:0;display:flex;flex-direction:column;container-type:inline-size')}>

            {st === 'ok' && (
              <div role="status" style={sx('width:100%;box-sizing:border-box;padding:clamp(22px,3vw,34px);border-radius:24px;background:rgba(246,239,230,.03);border:1.5px solid rgba(246,239,230,.20);text-align:center' + schatten(';box-shadow:0 16px 40px rgba(0,0,0,.35)'))}>
                <div style={sx('font-size:22px;font-weight:900;color:#F6EFE6')}>{test ? L.form.okTitleTest : L.form.okTitleEvent}</div>
                <p style={sx('margin:10px 0 0;color:rgba(246,239,230,.78);font-weight:500;line-height:1.6')}>{test ? L.form.okBodyTest : L.form.okBodyEvent}</p>
              </div>
            )}

            {st !== 'ok' && (
              <form key={this.state.formMode} onSubmit={this.submitForm}
                style={sx('width:100%;flex:1;display:flex;flex-direction:column;justify-content:center;'
                  + 'text-align:left;padding:clamp(22px,3vw,30px);border-radius:24px;background:rgba(246,239,230,.03);border:1.5px solid rgba(246,239,230,.20);box-sizing:border-box' + schatten(';box-shadow:0 16px 40px rgba(0,0,0,.35)'))}>
                {/* Die Aufschrift. Wolfs Auflage war, dass klar getrennt sein
                    muss, welches der beiden Formulare man ausfuellt. Links
                    steht die Wahl, hier steht die Antwort darauf, in derselben
                    Zeile wie ein Wechselverweis fuer den Fall, dass man sich
                    vertan hat. */}
                <div style={sx('display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid rgba(246,239,230,.14)')}>
                  <span style={sx('font-size:11.5px;font-weight:900;letter-spacing:.18em;text-transform:uppercase;color:rgba(246,239,230,.5)')}>{L.form.label}</span>
                  <span style={sx("font-family:'League Spartan',sans-serif;font-size:22px;font-weight:900;line-height:1;letter-spacing:-.02em;color:#F6EFE6;white-space:nowrap;"
                    + `min-width:${Math.max(L.form.tabEvent.length, L.form.tabTest.length)}ch`)}>{test ? L.form.tabTest : L.form.tabEvent}</span>
                  {/* Hier stand bis zum 28.08. ein zweiter Schalter, der
                      auf die jeweils andere Fassung wechselte. Wolf: "der
                      switcher test team, free kann raus, er hat nur
                      verwirrt". Zu Recht: er stand direkt neben der
                      Aufschrift, die sagt, welches Formular gerade offen ist,
                      und sah damit aus wie deren Beschriftung, nicht wie ein
                      Knopf. Gewaehlt wird links in der Spalte, und zwar mit
                      zwei grossen Feldern, die genau dafuer da sind. Ein
                      zweites Bedienelement fuer dieselbe Entscheidung, drei
                      Zentimeter daneben und in anderer Form, macht aus einer
                      klaren Wahl eine Frage. */}
                </div>
                <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true" style={sx('display:none')} />
                <input type="hidden" name="_subject" value={test ? 'Neues Test-Team' : 'Quiz-Anfrage'} />
                <input type="hidden" name="art" value={test ? 'Test-Team' : 'Event-Anfrage'} />
                <div data-m="formfelder" style={sx('display:grid;gap:14px')}>
                  {!test && (
                    <>
                      <div style={sx(fieldWrap)}>
                        <label htmlFor="f-anlass" style={sx(labelStyle)}>{L.form.anlass}</label>
                        <input id="f-anlass" name="anlass" type="text" maxLength={120} placeholder={L.form.anlassPh} style={sx(inputStyle)} />
                      </div>
                      <div style={sx(fieldWrap)}>
                        <label htmlFor="f-personen" style={sx(labelStyle)}>{L.form.personen}</label>
                        <input id="f-personen" name="personen" type="text" maxLength={20} placeholder={L.form.personenPh} style={sx(inputStyle)} />
                      </div>
                      <div style={sx(fieldWrap)}>
                        <label htmlFor="f-name" style={sx(labelStyle)}>{L.form.name}{req}</label>
                        <input id="f-name" name="name" type="text" maxLength={100} required style={sx(inputStyle)} />
                      </div>
                      {/* Wolf am 27.08.: die Groesse darf sich beim Wechsel
                          nicht aendern. Gemessen waren es 553 gegen 475 px.
                          Beide Formulare haben vier Felder, aber dieses hier
                          lag ueber die volle Breite und machte aus zwei Reihen
                          drei. Die Aufteilung steht jetzt in css.ts unter
                          [data-m=formfelder], fest auf zwei Spalten. */}
                      <div style={sx(fieldWrap)}>
                        <label htmlFor="f-email" style={sx(labelStyle)}>{L.form.email}{req}</label>
                        <input id="f-email" name="email" type="email" maxLength={150} required style={sx(inputStyle)} />
                      </div>
                    </>
                  )}
                  {test && (
                    <>
                      <div style={sx(fieldWrap)}>
                        <label htmlFor="t-name" style={sx(labelStyle)}>{L.form.name}{req}</label>
                        <input id="t-name" name="name" type="text" maxLength={100} required style={sx(inputStyle)} />
                      </div>
                      <div style={sx(fieldWrap)}>
                        <label htmlFor="t-stadt" style={sx(labelStyle)}>{L.form.stadt}{req}</label>
                        <input id="t-stadt" name="stadt" type="text" maxLength={80} required placeholder={L.form.stadtPh} style={sx(inputStyle)} />
                      </div>
                      <div style={sx(fieldWrap)}>
                        <label htmlFor="t-groesse" style={sx(labelStyle)}>{L.form.groesse}</label>
                        <select id="t-groesse" name="groesse" defaultValue={L.form.groesseOpts[0]} style={sx(inputStyle + ';appearance:none')}>
                          {L.form.groesseOpts.map(o => (
                            <option key={o} value={o} style={sx('background:#171126;color:#F6EFE6')}>{o}</option>
                          ))}
                        </select>
                      </div>
                      <div style={sx(fieldWrap)}>
                        <label htmlFor="t-email" style={sx(labelStyle)}>{L.form.email}{req}</label>
                        <input id="t-email" name="email" type="email" maxLength={150} required style={sx(inputStyle)} />
                      </div>
                    </>
                  )}
                  <details style={sx('grid-column:1/-1')}>
                    <summary style={sx('display:flex;align-items:center;gap:9px;min-height:44px;font-size:14px;font-weight:700;color:rgba(246,239,230,.78);cursor:pointer;list-style:none')}>
                      <span aria-hidden="true" style={sx('display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:6px;border:1px solid rgba(246,239,230,.38);font-size:14px;font-weight:900;line-height:1')}>+</span>
                      {L.form.mehr}
                    </summary>
                    <div data-m="formfelder" style={sx('display:grid;gap:14px;padding-top:14px')}>
                      <div style={sx(fieldWrap + ';grid-column:1/-1')}>
                        <label htmlFor="f-datum" style={sx(labelStyle)}>{test ? L.form.termin : L.form.datum}</label>
                        <input id="f-datum" name={test ? 'termin' : 'datum'} type="text" maxLength={120} placeholder={test ? L.form.terminPh : L.form.datumPh} style={sx(inputStyle)} />
                      </div>
                      <div style={sx(fieldWrap + ';grid-column:1/-1')}>
                        <label htmlFor="f-nachricht" style={sx(labelStyle)}>{test ? L.form.msgTest : L.form.msgEvent}</label>
                        <textarea id="f-nachricht" name="nachricht" rows={4} maxLength={2000} style={sx(inputStyle + ';resize:vertical')}></textarea>
                      </div>
                    </div>
                  </details>
                </div>

                {st === 'error' && (
                  <p role="alert" style={sx('margin:14px 0 0;color:#FCA5A5;font-weight:700;font-size:14px;text-align:center')}>
                    {L.form.errorPre}<a href="mailto:hallo@cozywolf.de" data-verweis="" style={sx(`color:${AKZENT}`)}>hallo@cozywolf.de</a>{L.form.errorPost}
                  </p>
                )}

                <div style={sx('text-align:center;margin-top:20px')}>
                  <button type="submit" className="cwSubmit" style={sx(`padding:14px 30px;border-radius:999px;border:1.5px solid rgba(246,239,230,.38);background:#F6EFE6;color:#0A0814;font-family:inherit;font-weight:900;font-size:16px;cursor:pointer;transition:transform .2s ${EASE},filter .2s ${EASE}`)}>
                    {st === 'sending' ? L.form.sending : (test ? L.form.submitTest : L.form.submitEvent)}
                  </button>
                </div>
                <p style={sx('margin:16px auto 0;display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;font-size:13.5px;font-weight:600;color:rgba(246,239,230,.62)')}>
                  {L.form.direkt}
                  <a href={`mailto:${EMAIL}`} style={sx('color:#F6EFE6;font-weight:700')}>{EMAIL}</a>
                  <span aria-hidden="true" style={sx('opacity:.5')}>&middot;</span>
                  <a href={INSTA_URL} target="_blank" rel="noopener" style={sx('color:#F6EFE6;font-weight:700')}>{INSTA_HANDLE}</a>
                </p>
                <p style={sx('margin:14px auto 0;max-width:440px;text-align:center;font-size:12.5px;line-height:1.5;color:rgba(246,239,230,.62);font-weight:500')}>
                  {L.form.privacy1}<a href="/datenschutz" data-verweis="" style={sx(`color:${AKZENT};font-weight:700`)}>{L.form.privacyLink}</a>{L.form.privacy2}
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    );
  }

  render() {
    const L = this.T;
    return (
      <div data-m="root" data-bew="" style={sx('min-height:100vh;background:#0A0814;width:100%')}>
        <div aria-hidden="true" data-cw-grund=""></div>
        <style>{ONEPAGE_CSS}</style>
        {this.renderHeader()}
        {this.renderHero()}
        {this.renderModes()}
        {this.renderAnlaesse()}
        {this.renderProbe()}
        {this.renderAblauf()}
        {this.renderJohannes()}
        {this.renderFaq()}
        {this.renderForm()}
        {/* Wolf am 2026-08-27: der Spruch steht jetzt am Schluss, nicht mehr
            als Zwischenzeile mitten im Scrollen. */}
        {/* Wolf am 28.08.: der Spruch "geht unten etwas unter", er soll beim
            Weiterscrollen wachsen, bis er einen Bildschirm fuellt. Also ein
            eigener Halt statt einer Zeile am Rand: die Schrift steht auf ihrer
            Endgroesse und wird ueber die Ansichts-Zeitleiste von 0,32 auf 1
            hochgezogen, waehrend der Halt durchs Fenster faehrt.
            Endgroesse und nicht Anfangsgroesse als Grundwert, damit ein
            Browser ohne diese Zeitleiste den Spruch gross sieht und nicht
            winzig. Die Umrandung ist jetzt creme statt pink, wie alles andere
            in der Schrift auch. */}
        {/* Kein overflow:hidden mehr: ein Vorfahre mit overflow:hidden ist ein
            Scrollbehaelter, der nicht scrollt, und darin bleibt eine
            Ansichts-Zeitleiste stehen. Gemessen war der Spruch vorher an
            beiden Scrollstaenden exakt gleich gross. */}
        {/* Wolf am 28.08. zweimal: erst "platziere die schrift mittig wenn
            die scrollbar ganz unten ist", dann "text ist nicht mittig wenn ganz
            unten (ist das browser abhaengig?)".

            Die erste Fassung rechnete mit einem Polster von zwei Fusshoehen
            oben, das die Mitte um genau eine Fusshoehe nach unten schiebt. Die
            Rechnung stimmt, nur stand sie am Ende nicht mehr im Code: gemessen
            war --fuss korrekt auf 113 px, das padding-top des Abschnitts aber
            auf 0. Uebrig blieb ein Abschnitt von 92svh, der hoeher ist als der
            freie Bereich ueber dem Fuss, und dessen Mitte damit zu weit oben
            liegt. In Chromium waren das 16 px bei 2000x1013, 21 bei 1440x900,
            25 bei 1280x800 -- und ja, das ist browserabhaengig, weil svh je
            nach Browser und Werkzeugleisten verschieden ausfaellt.

            Statt die Rechnung zu reparieren, faellt sie weg: der Abschnitt ist
            jetzt genau so hoch wie der freie Bereich, 100svh minus Fusshoehe.
            Dann ist seine Unterkante die Oberkante des Fusses und seine eigene
            Mitte ist die Mitte des Fensters, ohne Ausgleich. Die 420 px als
            Untergrenze bleiben, damit der Spruch auf sehr flachen Fenstern
            nicht zerdrueckt wird.
            F wird weiter gemessen und nicht geschaetzt, der Fussbereich ist in
            beiden Sprachen verschieden hoch; 113 px ist nur der Notwert, falls
            die Messung noch nicht gelaufen ist. */}
        <section data-halt="" data-spruch="" style={sx('background:#0A0814;height:max(420px,calc(100svh - var(--fuss,113px)));min-height:0;padding:0 32px;box-sizing:border-box')}>
          {/* Wolf am 28.08.: "die schrift fuellt sich satisfying beim hovern,
              hast du ne idee mit was, soll geil aussehen, und nur da wo man
              mit der maus drueber hovert".

              Womit: mit dem Licht des Beamers. Die ganze Seite handelt davon,
              dass Licht auf eine Flaeche faellt -- in 04 auf die Wand, hier auf
              die Schrift. Der Zeiger ist der Lichtfleck, und wo er steht, sind
              die Buchstaben gefuellt statt nur umrandet. Es ist derselbe
              Gedanke wie oben, nur am Ende der Seite und in der Hand des
              Lesers.

              Zwei Lagen uebereinander: unten die Kontur wie bisher, darueber
              dieselbe Zeile gefuellt, aber mit einer Maske aus einem
              Radialverlauf, dessen Mitte am Zeiger haengt. Sichtbar ist die
              Fuellung nur im Fleck.

              Die Zeigerposition laeuft ueber zwei CSS-Variablen und nicht
              ueber den Zustand: setProperty kostet kein Neuzeichnen der
              Komponente, setState bei jeder Mausbewegung schon. Bei einer
              Zeile, die ueber die volle Fensterbreite laeuft, waeren das
              hunderte Durchlaeufe je Sekunde.

              Ohne Zeiger (Handy, Tastatur) bleibt die Kontur stehen. Der
              Fleck faengt bei Groesse null an, es blitzt also nichts auf,
              bevor die Maus da war. */}
          <div data-kinetic="" data-m="kin"
            onMouseMove={e => {
              const el = e.currentTarget as HTMLElement;
              const r = el.getBoundingClientRect();
              el.style.setProperty('--mx', `${e.clientX - r.left}px`);
              el.style.setProperty('--my', `${e.clientY - r.top}px`);
              el.style.setProperty('--r', '190px');
            }}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.setProperty('--r', '0px')}
            style={sx("position:relative;width:100%;text-align:center;font-family:'League Spartan',sans-serif;"
              + 'font-size:clamp(30px,6.8vw,118px);font-weight:900;line-height:1;color:transparent;'
              + '-webkit-text-stroke:1.4px rgba(246,239,230,.42);letter-spacing:-.01em;white-space:nowrap')}>
            {L.kinetic}
            {/* Wolf am 28.08.: "sollte stay cozy stay curious ganz leicht den
                effekt auch machen wenn niemand drueber hovert (nur minimal)
                das man es merkt und draufgeht mit der maus?"

                Berechtigt: eine Kontur, die sich nur beim Hovern fuellt, ist
                ein Angebot, das niemand sieht. Also wandert ohne Zeiger ein
                schmaler Lichtstreifen einmal durch die Zeile -- 1,0 Sekunde
                fuer den Durchgang, danach 9,8 Sekunden nichts. Wolf dazu:
                "eher wie einen vorbeihuschenden schatten" und "noch
                subtiler". Der Takt macht das Huschen, die Breite die
                Zurueckhaltung; das Naehere steht bei cwSpruchHuschen in
                css.ts. Sobald die Maus da ist, bleibt der Streifen weg und
                ueberlaesst ihr das Licht. */}
            <span aria-hidden="true" data-spruchidle="" style={sx('position:absolute;left:0;top:0;width:100%;'
              + 'color:#F6EFE6;-webkit-text-stroke:0;pointer-events:none;'
              + 'background:linear-gradient(92deg,#FFF6E8,#F6EFE6 46%,#FFE9C9);'
              + '-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;'
              + 'mask-image:radial-gradient(closest-side,#000 0%,rgba(0,0,0,.5) 46%,transparent 100%);'
              + '-webkit-mask-image:radial-gradient(closest-side,#000 0%,rgba(0,0,0,.5) 46%,transparent 100%);'
              + 'mask-size:180px 300%;-webkit-mask-size:180px 300%;'
              + 'mask-repeat:no-repeat;-webkit-mask-repeat:no-repeat')}>{L.kinetic}</span>
            <span aria-hidden="true" data-spruchlicht="" style={sx('position:absolute;left:0;top:0;width:100%;'
              + 'color:#F6EFE6;-webkit-text-stroke:0;pointer-events:none;'
              + 'background:linear-gradient(92deg,#FFF6E8,#F6EFE6 46%,#FFE9C9);'
              + '-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;'
              + 'mask-image:radial-gradient(circle var(--r,0px) at var(--mx,50%) var(--my,50%),#000 0%,rgba(0,0,0,.55) 55%,transparent 100%);'
              + 'transition:mask-image .25s linear')}>{L.kinetic}</span>
          </div>
        </section>
        <footer style={sx('border-top:1px solid rgba(246,239,230,.10)')}>
          <div data-m="foot" data-shell="" style={sx('max-width:1180px;margin:0 auto;padding:30px 32px;display:flex;align-items:center;gap:20px;font-size:14px;font-weight:600;color:rgba(246,239,230,.62)')}>
            <img src={LOGO} alt="" width={26} height={26} style={sx('width:26px;height:26px')} />
            <span style={sx('white-space:nowrap')}>{L.footer.city}</span>
            <a href="mailto:hallo@cozywolf.de" data-verweis="" style={sx(`color:${AKZENT}`)}>hallo@cozywolf.de</a>
            <a href="/impressum" data-verweis="" style={sx(`color:${AKZENT}`)}>{L.footer.imprint}</a>
            <a href="/datenschutz" data-verweis="" style={sx(`color:${AKZENT}`)}>{L.footer.privacy}</a>
            <a href="https://instagram.com/cozywolf.events" style={sx(`margin-left:auto;display:flex;align-items:center;gap:8px;color:${AKZENT}`)}>@cozywolf.events</a>
          </div>
          <div data-shell="" style={sx('max-width:1180px;margin:0 auto;padding:0 32px 26px;font-size:12.5px;font-weight:600;color:rgba(246,239,230,.5)')}>{L.footer.aiNote}</div>
        </footer>
        <a href="#anfragen" data-m="sticky" style={sx('position:fixed;left:14px;right:14px;bottom:14px;z-index:40;align-items:center;justify-content:center;padding:15px 20px;border-radius:999px;background:#F6EFE6;color:#0A0814;font-weight:900;font-size:16px' + schatten(';box-shadow:0 14px 34px rgba(0,0,0,.55)'))}>{L.sticky}</a>
      </div>
    );
  }
}

export default function OnePage() {
  const lang = useLang();
  return <OnePageInner lang={lang} />;
}
