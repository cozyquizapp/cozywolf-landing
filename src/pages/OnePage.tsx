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
const MOVES: Move[] = [
  { t: 'b', c: 15 }, { t: 's', c: 3 }, { t: 'd', c: 6 }, { t: 'b', c: 16 },
  { t: 'd', c: 5, k: 'steal' }, { t: 's', c: 8 }, { t: 'b', c: 22, k: 'steal' },
  { t: 'd', c: 10 }, { t: 's', c: 14 },
];

const CYCLE = 55, Q_END = 25, R_END = 35;

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
// Die Sterne der Begruessungsfolie. Feste Liste statt Zufall: sie wird bei
// jedem Zeichnen gelesen, ein Zufall darin liesse sie flackern.
const STERNE = Array.from({ length: 26 }, (_, i) => ({
  x: (i * 37) % 97,
  y: (i * 53) % 91,
  g: 1.4 + (i % 3) * 0.8,
  o: (0.28 + (i % 4) * 0.16).toFixed(2),
}));

type OPState = {
  formMode: 'event' | 'test'; formStatus: 'idle' | 'sending' | 'ok' | 'error';
  wallScale?: number;
  beam?: boolean; beamWelcome?: boolean;
  johFan?: boolean; hookI?: number; hookVor?: number | null;
  b01?: number; b01Hand?: Record<number, string>; frak?: string | null;
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
  private _weiterT: ReturnType<typeof setTimeout> | undefined;
  private _hookT: ReturnType<typeof setInterval> | undefined;
  private _boardWinEl: HTMLElement | null = null;
  private _boardWinRO: ResizeObserver | undefined;
  private _pStage: HTMLElement | null = null;
  private _pStageIO: IntersectionObserver | undefined;
  private _coarse = false;
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
      this.setState(st => ({ tick: ((st.tick ?? 0) + 1) % (CYCLE * (MOVES.length + 1)) }));
    }, 300);
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
    const g = this.gameVals(((this.state.b01 ?? 0) ? CYCLE * ((this.state.b01 ?? 0) - 1) + R_END + 1 : 0), this.state.b01Hand);
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
  spielartenBeobachten() {
    const el = document.getElementById('spielarten');
    if (!el || typeof IntersectionObserver === 'undefined') return;
    this._reduziert = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this._spielIO = new IntersectionObserver(([e]) => {
      this._spielSichtbar = e.isIntersecting;
      if (!e.isIntersecting) { this.brettLauf(false); return; }
      if ((this.state.b01 ?? 0) < MOVES.length) this.brettLauf(true);
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

  // ------------------------------------------------- Lifecycle
  componentDidMount() {
    setTimeout(() => this.watchWall(), 60);
    this.fussMessen();
    this._coarse = window.matchMedia('(hover:none)').matches || window.innerWidth < 861;
    this._hookT = setInterval(() => {
      if (document.hidden || this._wortHalt) return;
      this.setState(s => ({ hookVor: s.hookI ?? 0, hookI: (s.hookI ?? 0) + 1 }));
    }, 6800);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

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
      points: [4, 3, 3], pointsDone: false, ordSel: [], ordDone: false, weiterAn: false,
    });
  }

  /** Nach einer Aufloesung: Uhr zur naechsten Kategorie starten. */
  weiterAb() {
    clearTimeout(this._weiterT);
    this.setState({ weiterAn: true });
    this._weiterT = setTimeout(() => this.probeWechsel(this.naechsteKat()), WEITER_MS);
  }

  componentWillUnmount() {
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
    const hb = (i: number) => {
      const hot = on === i, cold = on !== null && !hot;
      const primary = i === 0;
      return {
        style: `position:relative;display:flex;align-items:center;justify-content:center;flex:none;min-width:0;box-sizing:border-box;overflow:hidden;border-radius:999px;white-space:nowrap;font-weight:900;min-height:66px;`
          + `width:${hot ? 'calc(60% - 7px)' : (cold ? 'calc(40% - 7px)' : 'calc(50% - 7px)')};`
          + `padding:${hot ? '16px 26px 15px' : '19px 22px'};font-size:${cold ? 16 : (hot ? 18 : 17)}px;`
          + (primary ? 'background:#F6EFE6;' : 'background:transparent;border:1.5px solid rgba(246,239,230,.38);')
          + `box-shadow:${primary ? (hot ? '0 18px 44px rgba(0,0,0,.5)' : '0 12px 30px rgba(0,0,0,.38)') : 'none'};`
          + `transition:width .7s ${EASE},padding .7s ${EASE},font-size .7s ${EASE},box-shadow .5s ${EASE}`,
        fill: `position:absolute;inset:0;background:${primary ? '#FFFDF9' : 'rgba(246,239,230,.12)'};transform:scaleY(${hot ? 1 : 0});transform-origin:bottom center;transition:transform .6s ${EASE}`,
        lab: `display:block;line-height:1.15em;font-size:inherit;letter-spacing:${hot ? '-.005em' : '0'};color:${primary ? '#0A0814' : '#F6EFE6'};transition:color .4s ${EASE},letter-spacing .5s ${EASE}`,
        sub: `display:block;overflow:hidden;max-height:${hot ? '22px' : '0'};transition:max-height .6s ${EASE}`,
        subIn: `display:block;padding-top:4px;font-size:12.5px;font-weight:800;letter-spacing:.02em;white-space:nowrap;color:${primary ? 'rgba(10,8,20,.66)' : 'rgba(246,239,230,.72)'};transform:translateY(${hot ? '0' : '-8px'});opacity:${hot ? 1 : 0};transition:transform .6s ${EASE},opacity .45s ${EASE} ${hot ? '.1s' : '0s'}`,
      };
    };
    const b0 = hb(0), b1 = hb(1);
    const hookI = this.state.hookI ?? 0;
    const n = L.hero.hooks.length;
    const hook = L.hero.hooks[hookI % n];
    // Das Wort davor bleibt waehrend des Wechsels stehen und laeuft nach oben
    // hinaus. Es steht im Zustand und wird nicht aus hookI-1 erraten: beim
    // Zeigen auf ein Objekt springt die Ueberschrift auf ein beliebiges Wort,
    // und dann ist der Vorgaenger eben nicht das Wort davor in der Liste.
    const vorI = this.state.hookVor ?? null;
    const vorher = vorI == null ? null : L.hero.hooks[vorI % n];
    const objekt = GRUPPE[WORT_OBJEKT[hookI % n] % GRUPPE.length];

    return (
      <section id="top" style={sx('position:relative;overflow:clip;min-height:100dvh;display:flex;flex-direction:column;border-bottom:1px solid rgba(246,239,230,.10)')}>
        <div aria-hidden="true" style={sx('position:absolute;top:-340px;left:50%;transform:translateX(-50%);width:1500px;height:980px;background:radial-gradient(ellipse at center,rgba(246,239,230,.05),rgba(10,8,20,0) 62%);pointer-events:none')}></div>

        <div data-shell="" data-m="hero" style={sx('position:relative;z-index:2;flex:1;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,440px);align-items:center;gap:56px;width:100%;max-width:1180px;margin:0 auto;padding:88px 32px 72px;box-sizing:border-box')}>
          <div style={sx('position:relative;z-index:1;min-width:0')}>
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
                    <span key={`${hookI}-${j}`} className="cwWortEin" style={sx(`animation-delay:${(j * 0.032).toFixed(3)}s`)}>{ch === ' ' ? '\u00A0' : ch}</span>
                  ))}
                </span>
              </span>
              <span style={sx(`display:block;animation:cwRise .9s ${EASE} both .12s`)}>{L.hero.rest}</span>
            </h1>
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

          {/* z-Index 3: die Objekte stehen ueber der Ueberschrift, damit das
              lange Wort HINTER ihnen durchlaeuft und nicht darueber.
              aria-hidden bleibt, es ist Bild und kein Inhalt; die Objekte sind
              trotzdem mit der Tastatur erreichbar, weil sie als Gruppe den
              Wortwechsel steuern. */}
          <div data-treiben="" data-m="hgruppe" aria-hidden="true" style={sx('position:relative;z-index:3;align-self:center;width:100%;aspect-ratio:1/1;pointer-events:none')}>
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
                this.setState(st => ({ hookVor: st.hookI ?? 0, hookI: w }));
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
    const g = this.gameVals(zuege ? CYCLE * (zuege - 1) + R_END + 1 : 0, this.state.b01Hand);
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
  renderFrakFeld(plaetze: { id: string; x: number; y: number; gr: number }[], hoehe: number, seite: 'links' | 'rechts') {
    const L = this.T;
    const an = this.state.frak ?? null;
    return (
      <div data-frakfeld={seite} style={sx(`position:relative;min-width:0;height:${hoehe}px`)}
        onMouseLeave={() => { if (!this._coarse) this.setState({ frak: null }); }}>
        {plaetze.map((pl, i) => {
          const f = FACTIONS.find(x => x.id === pl.id);
          if (!f) return null;
          const auf = an === f.id, still = !!an && !auf;
          const nachRechts = pl.x < 50;
          const zeig = () => { if (!this._coarse) this.setState({ frak: f.id }); };
          return (
            <button key={f.id} type="button"
              onMouseEnter={zeig} onFocus={zeig}
              onMouseLeave={() => { if (!this._coarse) this.setState({ frak: null }); }}
              onBlur={() => this.setState({ frak: null })}
              aria-label={`${L.sim.factions[f.id]} \u2014 ${L.sim.mottos[f.id]}`}
              style={sx(`position:absolute;left:${pl.x}%;top:${pl.y}%;padding:0;border:none;background:none;cursor:default;`
                + `z-index:${auf ? 6 : 2}`)}>
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
                  + `transform:scale(${auf ? 1.1 : 1});opacity:${still ? .28 : 1};`
                  + `filter:saturate(${auf ? 1.15 : .84}) brightness(${auf ? 1.12 : .86});`
                  + `transition:transform .4s ${EASE},opacity .4s ${EASE},filter .4s ${EASE}`)}></span>
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
  gameVals(festerStand?: number, hand?: Record<number, string>) {
    const L = this.T;
    const tick = festerStand ?? this.state.tick ?? 0;
    const cycle = Math.floor(tick / CYCLE);
    const t = tick % CYCLE;
    const phase = t < Q_END ? 'q' : (t < R_END ? 'r' : 'b');
    const q = L.sim.questions[cycle % L.sim.questions.length];
    const idx = Math.min(MOVES.length, cycle + (phase === 'b' ? 1 : 0));
    const played = MOVES.slice(0, idx);
    const seconds = Math.max(1, Math.ceil((R_END - t) * 0.2));
    // Die 6 stand hier fest, seit das Brett sechs Teams hatte. Mit drei Teams
    // stand darunter "6/3 Teams haben geantwortet".
    const answered = phase === 'q' ? Math.min(TEAMS.length, Math.floor(t / 4)) : TEAMS.length;
    const revealed = phase !== 'q';

    const qOptions = q.opts.map((label, k) => {
      const hit = revealed && k === q.correct;
      return {
        label, num: k + 1,
        style: `flex:1;display:flex;align-items:center;gap:14px;padding:14px 16px;border-radius:10px;box-sizing:border-box;background:${hit ? q.col + '1f' : 'rgba(0,0,0,.28)'};border:1px solid ${hit ? q.col : 'rgba(246,239,230,.14)'};box-shadow:${hit ? `0 0 26px ${q.col}55` : 'none'};transition:background .4s ${EASE},border-color .4s ${EASE},box-shadow .4s ${EASE}`,
        numStyle: `font-family:'League Spartan',sans-serif;font-size:32px;font-weight:900;line-height:1;color:${q.col}`,
      };
    });

    // Wie in der App: wer geantwortet hat, leuchtet und traegt einen Ring in
    // der Kategoriefarbe; wer noch nicht dran ist, steht entsaettigt da.
    const teamDiscs = TEAMS.map((tm, k) => {
      const fertig = k < answered;
      return {
        style: teammarke(tm.color, tm.av, 42)
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
      // Wie weit die Runde ist: ein Zug von MOVES entspricht einer Frage.
      fortschritt: Math.round(Math.min(1, (cycle + 1) / (MOVES.length + 1)) * 100),
      showQuestion: phase !== 'b', showBoard: phase === 'b',
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
          {key === 'cheese' && (
            <img src="/assets/kolosseum.webp" alt="" style={sx('display:block;width:100%;height:104px;margin-bottom:12px;object-fit:cover;border-radius:14px')} />
          )}
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
      const gc = near ? '#22C55E' : col;
      footer = L.probe.guessFooter;
      const fmt = (x: number) => x.toLocaleString(this.locale);
      cardBody = (
        <div style={sx('display:flex;flex-direction:column;gap:14px')}>
          <div style={sx('display:flex;align-items:center;gap:16px;margin:12px 0 2px')}>
            <img src="/assets/skelett.webp" alt="" style={sx('flex:none;height:176px;width:auto;display:block')} />
            <div style={sx('flex:1;min-width:0;font-size:16px;font-weight:900;line-height:1.35;color:#F6EFE6;text-wrap:pretty')}>{p.q}</div>
          </div>
          <input type="text" inputMode="numeric" value={raw0}
            onChange={e => {
              const raw = e.target.value.replace(/[^\d]/g, '').slice(0, 9);
              this.setState({ guessRaw: raw, guessDone: false });
            }}
            placeholder={L.probe.guessPlaceholder} aria-label={L.probe.guessPlaceholder}
            style={sx("width:100%;box-sizing:border-box;padding:14px 16px;border-radius:14px;background:rgba(246,239,230,.05);border:1.5px solid rgba(243,195,103,.45);color:#F59E0B;font-family:'League Spartan',sans-serif;font-size:32px;font-weight:900;text-align:center;outline:none")} />
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
          <div style={sx(`overflow:hidden;box-sizing:border-box;text-align:center;font-size:13px;line-height:1.5;font-weight:800;color:#F6EFE6;max-height:${done ? '120px' : '0px'};padding:${done ? '13px' : '0 13px'};border-radius:14px;border:1px solid ${done ? gc + '80' : 'transparent'};background:${gc}14;opacity:${done ? 1 : 0};transition:max-height .5s ${EASE},padding .5s ${EASE},opacity .35s ease`)}>
            {done ? (near ? L.probe.guessNear(fmt(p.target), p.unit, fmt(diff)) : L.probe.guessFar(fmt(p.target), p.unit, fmt(diff))) : ' '}
          </div>
        </div>
      );
    }

    if (p.kind === 'points') {
      const pts = this.state.points || [4, 3, 3];
      const sum = pts.reduce((a, b) => a + b, 0);
      const done = !!this.state.pointsDone;
      const ready = sum === 10;
      const gained = pts[p.correct];
      const pc = gained >= 5 ? '#22C55E' : col;
      footer = done ? L.probe.pointsFooterDone : L.probe.pointsFooterIdle;
      cardBody = (
        <div style={sx('display:flex;flex-direction:column;gap:10px')}>
          {p.opts.map((label, i) => (
            <div key={i} style={sx(`display:flex;align-items:center;gap:9px;padding:10px 11px;border-radius:14px;border:1px solid ${pts[i] > 0 ? col + '66' : 'rgba(246,239,230,.09)'};background:${pts[i] > 0 ? col + '14' : 'rgba(246,239,230,.03)'};box-sizing:border-box;transition:all .3s ${EASE}`)}>
              <span style={sx('flex:1;font-size:13.5px;font-weight:800;color:#F6EFE6')}>{label}</span>
              <button type="button" onClick={() => this.setState(st => { const nn = (st.points || [4, 3, 3]).slice(); if (nn[i] > 0) nn[i] -= 1; return { points: nn, pointsDone: false }; })}
                style={sx(`width:28px;height:28px;flex:none;border-radius:9px;cursor:pointer;font-family:inherit;font-size:15px;font-weight:900;border:1px solid ${col}59;background:${col}1f;color:${col}`)}>−</button>
              <span style={sx('width:26px;text-align:center;font-size:17px;font-weight:900;color:#22C55E')}>{pts[i]}</span>
              <button type="button" onClick={() => this.setState(st => { const nn = (st.points || [4, 3, 3]).slice(); if (nn.reduce((a, b) => a + b, 0) < 10) nn[i] += 1; return { points: nn, pointsDone: false }; })}
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
            {/* Zweitens war das hier der letzte Kasten der Seite: Rahmen,
                Fuellung, dicker Balken links. 01, 02, 04 und 06 tragen
                Haarlinien, also traegt 03 jetzt auch eine. Die Farbe des
                Fragetyps bleibt, sie steht nur nicht mehr als Flaeche da. */}
            <div style={sx(`margin-bottom:26px;padding:20px 0 0;border-top:1px solid rgba(246,239,230,.14);transition:border-color .3s ${EASE}`)}>
              <div style={sx(`font-size:18px;font-weight:900;line-height:1.35;color:${col};margin-bottom:7px;transition:color .3s ${EASE}`)}>{catT.claim}</div>
              <div style={sx('font-size:15.5px;line-height:1.6;font-weight:500;color:rgba(246,239,230,.78)')}>{catT.detail}</div>
            </div>
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
            <div style={sx('display:flex;flex-direction:column;flex:none;min-width:250px')}>
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
                  {p.kind !== 'guess' && (
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
    const g = this.gameVals();
    const beamStart = () => {
      if (this.state.beam) return;
      clearTimeout(this._beamT);
      clearInterval(this.gameTimer);
      this.setState({ beam: true, beamWelcome: true });
      this._beamT = setTimeout(() => { this.setState({ beamWelcome: false }); this.startGame(); }, 3800);
    };
    const beamStop = () => {
      clearTimeout(this._beamT);
      clearInterval(this.gameTimer);
      this.setState({ beam: false, beamWelcome: false });
    };
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
          <div data-m="ablaufraum" style={sx('display:grid;grid-template-columns:minmax(0,440px) minmax(0,1fr);gap:clamp(36px,4.6vw,72px);align-items:center')}>
            <div>
              {this.kicker(`[ 04 ]|${L.ablauf.label}`)}
              <h2 data-reveal="" style={sx(`margin:0 0 10px;font-family:'League Spartan',sans-serif;font-size:clamp(34px,3.4vw,56px);line-height:.96;letter-spacing:-.03em;font-weight:900;color:#F6EFE6;text-wrap:balance`)}>{L.ablauf.h2}</h2>
              <p data-reveal="" style={sx('margin:0;' + UNTERZEILE)}>{L.ablauf.sub}</p>
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
          <div data-reveal="" data-m="wall" onMouseEnter={beamStart} onClick={beamStart}
            onMouseMove={e => {
              if (this._coarse) return;
              const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
              this.setState({ beamXY: { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height } });
            }}
            onMouseLeave={() => { beamStop(); this.setState({ beamXY: null }); }}
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
            <div style={sx(`transform:rotateY(${(on ? -2.6 + (kipp?.x ?? 0) * 7 : -11).toFixed(2)}deg) `
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
                Rechteck. Bei Mitte 50/47 und Radien 48/44 Prozent liegen alle
                vier Kanten ausserhalb der Ellipse. Gemessen: in der ersten
                Fassung lag die Maske an der Oberkante noch bei 0,68, und das
                war die sichtbare Linie. */}
            <div aria-hidden="true" style={sx('position:absolute;inset:-38% -8%;z-index:0;pointer-events:none;'
              + 'background:linear-gradient(174deg,rgba(246,239,230,.30),rgba(246,239,230,.235) 40%,rgba(246,239,230,.205) 70%,rgba(246,239,230,.19));'
              + 'mask-image:radial-gradient(54% 50% at 50% 50%,#000 30%,transparent 100%);'
              + '-webkit-mask-image:radial-gradient(54% 50% at 50% 50%,#000 30%,transparent 100%);'
              + `opacity:${on ? .55 : 1};transition:opacity 1.2s ${EASE}`)}></div>
            <div aria-hidden="true" style={sx('position:absolute;inset:-38% -8%;z-index:0;pointer-events:none;'
              + 'background:radial-gradient(47% 43% at 50% 47%,rgba(255,246,232,.30),rgba(255,246,232,.10) 52%,transparent 100%);'
              + `opacity:${on ? 1 : 0};transition:opacity 1.2s ${EASE}`)}></div>
            {/* In Ruhe hat die Projektion weder Rand noch Grund: der Beamer ist
                aus, also ist dort nichts ausser der Wand. Genau das behauptet
                die Ueberschrift, und ein dunkles Rechteck mit Haarlinie
                behauptete stattdessen ein Geraet. Erst wenn die Lampe angeht,
                bekommt sie eine Flaeche und eine Kante. */}
            <div style={sx('position:relative;z-index:1;width:100%;aspect-ratio:16/9;border-radius:4px;overflow:hidden;'
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
                <div aria-hidden="true" style={sx(`position:absolute;inset:0;z-index:12;pointer-events:none;border-radius:14px;opacity:0;background:linear-gradient(160deg,#efe4dc,#cdbfcb);animation:${on ? 'cwBeamOn 1.9s cubic-bezier(.4,0,.3,1) both' : 'none'};transition:opacity .8s ease`)}></div>
                <div style={sx(`position:absolute;left:50%;top:50%;width:${WALL_W}px;height:${WALL_H}px;transform-origin:center center;opacity:${on ? 1 : 0};transition:opacity .5s ${EASE} ${on ? '1.1s' : '0s'};transform:translate(-50%,-50%) scale(${this.state.wallScale ?? 0.8})`)}>
                  <div data-m="wallscreen" style={sx('width:640px;height:354px;box-sizing:border-box;padding:22px 26px;border-radius:4px;display:flex;flex-direction:column;overflow:hidden;position:relative;'
                    + `background:radial-gradient(ellipse 120% 90% at 50% 0%,${g.catFarbe}1f,transparent 62%),`
                    + `linear-gradient(180deg,${g.catFarbe}14,#07060d 70%);`
                    + `transition:background .6s ${EASE}`)}>
                    {/* Der Fortschritt der Runde, wie in der App als duenner
                        Balken ueber der ganzen Breite. */}
                    <span aria-hidden="true" style={sx('position:absolute;left:0;right:0;top:0;height:4px;z-index:10;background:rgba(246,239,230,.08)')}>
                      <span style={sx(`display:block;height:100%;width:${g.fortschritt}%;background:${g.catFarbe};transition:width 1.2s ${EASE},background .6s ${EASE}`)}></span>
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
                    <div aria-hidden="true" style={sx('position:absolute;inset:0;z-index:9;border-radius:22px;overflow:hidden;pointer-events:none;'
                      + 'background:radial-gradient(ellipse 62% 46% at 50% 40%,rgba(190,24,93,.30),transparent 68%),'
                      + 'radial-gradient(ellipse at 50% 45%,#1a1226,#0b0714 74%);'
                      + `opacity:${this.state.beamWelcome ? 1 : 0};transition:opacity .8s ${EASE} ${this.state.beamWelcome ? '.75s' : '0s'}`)}>
                      {STERNE.map((st, i) => (
                        <span key={i} style={sx(`position:absolute;left:${st.x}%;top:${st.y}%;width:${st.g}px;height:${st.g}px;border-radius:50%;background:rgba(246,239,230,${st.o});box-shadow:0 0 6px rgba(246,239,230,.5)`)}></span>
                      ))}
                      <img src="/assets/wolf-3d.webp" alt="" width={384} height={440}
                        style={sx('position:absolute;left:-34px;bottom:-26px;width:auto;height:74%;filter:drop-shadow(0 18px 30px rgba(0,0,0,.55))')} />
                      <div style={sx('position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:0 40px;box-sizing:border-box')}>
                        <span style={sx('font-size:13px;font-weight:900;letter-spacing:.2em;text-transform:uppercase;color:rgba(246,239,230,.78)')}>{L.sim.welcomeKicker}</span>
                        <span style={sx("font-family:'League Spartan',sans-serif;font-size:76px;font-weight:900;letter-spacing:.06em;line-height:.92;color:#F6EFE6;text-transform:uppercase")}>{L.sim.welcomeTitle}</span>
                        <span style={sx('margin-top:10px;font-size:19px;font-weight:900;line-height:1.3;color:#F6EFE6;text-align:center')}>{L.sim.welcomeSub}</span>
                      </div>
                    </div>
                    <span aria-hidden="true" style={sx('position:absolute;inset:0;border-radius:22px;pointer-events:none;overflow:hidden')}>
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
                    <span aria-hidden="true" style={sx('position:absolute;inset:0;border-radius:22px;pointer-events:none;'
                      + 'background:linear-gradient(180deg,rgba(0,0,0,.26),transparent 16%,transparent 84%,rgba(0,0,0,.26)),'
                      + 'linear-gradient(90deg,rgba(0,0,0,.22),transparent 12%,transparent 88%,rgba(0,0,0,.22))')}></span>
                    <div style={sx('position:relative;display:flex;align-items:center;gap:14px;flex:none')}>
                      <span style={sx(g.catPillStyle)}>{g.catName}</span>
                      <span style={sx('font-size:11px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:rgba(246,239,230,.5);white-space:nowrap')}>{g.statusLine}</span>
                      <span style={sx('flex:1')}></span>
                      <span style={sx(g.ringStyle)}>{g.seconds}</span>
                    </div>

                    {g.showQuestion && (
                      <>
                        {/* Die Frage steht frei und mittig, ohne Kasten. Der
                            Kasten war das letzte, was die Folie eingeengt hat,
                            und in der App gibt es ihn nicht. */}
                        <div style={sx('flex:1;display:flex;align-items:center;justify-content:center;padding:0 18px;min-height:0')}>
                          <div style={sx(g.qCardStyle)}>{g.qText}</div>
                        </div>
                        <div style={sx('display:flex;gap:12px;flex:none')}>
                          {g.qOptions.map((o, i) => (
                            <div key={i} style={sx(o.style)}>
                              <span style={sx(o.numStyle)}>{o.num}</span>
                              <span style={sx('font-size:14px;font-weight:900;color:#F6EFE6;line-height:1.2')}>{o.label}</span>
                            </div>
                          ))}
                        </div>
                        <div style={sx('margin-top:14px;display:flex;flex-direction:column;align-items:center;gap:8px;flex:none')}>
                          <span style={sx('font-size:12.5px;font-weight:900;letter-spacing:.04em;color:rgba(246,239,230,.7);white-space:nowrap')}>{g.answeredLine}</span>
                          <div style={sx('display:flex;gap:10px')}>
                            {g.teamDiscs.map((d, i) => <span key={i} style={sx(d.style)}></span>)}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Das Brett rechnet seine Zellgroesse aus der rechten
                        Spalte in Station 01 (340 px). In der Leinwand steht
                        weniger Hoehe zur Verfuegung, gemessen 262 px gegen
                        316 px Brett, und der Ueberstand hat die Kopfzeile
                        ueberdeckt. Deshalb hier ein Faktor statt einer
                        zweiten Rechnung: dieselbe Zeichnung, kleiner. */}
                    {g.showBoard && (
                      <div style={sx('flex:1;min-height:0;width:100%;margin-top:8px;display:flex;gap:12px;align-items:center;justify-content:center;overflow:hidden')}>
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
        <div data-shell="" style={sx('width:100%;max-width:1180px;margin:0 auto;padding:60px 32px;box-sizing:border-box;display:grid;grid-template-columns:300px 1fr;gap:52px;align-items:center')} data-m="joh">
          {/* Wolf am 27.08.: das echte Foto bleibt, die auffaechernden Arme und
              der pinke Ring gehen. Die beiden Nebenbilder waren Schmuck, der
              beim Zeigen aufsprang und sonst nichts sagte, und der Ring hat
              Pink genau dort gesetzt, wo es raus soll. Uebrig bleibt ein
              rundes Foto mit einer Haarlinie, wie jede andere Kante der Seite. */}
          <div style={sx('display:flex;flex-direction:column;align-items:center;gap:14px')}>
            <img src="/assets/johannes-rund.jpg" loading="lazy" decoding="async" width={220} height={220} alt={L.johannes.photoAlt}
              style={sx('width:220px;height:220px;border-radius:50%;object-fit:cover;object-position:center 22%;border:1px solid rgba(246,239,230,.20);' + schatten('box-shadow:0 24px 50px rgba(0,0,0,.55)'))} />
            <div style={sx('font-size:18px;font-weight:900;color:#F6EFE6')}>{L.johannes.name}</div>
          </div>
          <div>
            <div data-reveal="" style={sx('font-size:12px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;color:rgba(246,239,230,.62);margin-bottom:12px')}>{L.johannes.kicker}</div>
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
            <div data-reveal="" data-stagger="" style={sx('display:flex;flex-wrap:wrap;gap:10px')}>
              {/* Die Kacheln bekommen das Aufhellen: worauf man zeigt, steht
                  in vollem Creme, die anderen fallen auf 45 Prozent. Nichts
                  bewegt sich, die Zeile bricht also nicht um. */}
              {L.johannes.chips.map(chip => {
                const an = this.state.zeig === chip;
                const still = !!this.state.zeig && !an;
                return (
                  <span key={chip}
                    onMouseEnter={() => { if (!this._coarse) this.setState({ zeig: chip }); }}
                    onMouseLeave={() => { if (!this._coarse) this.setState({ zeig: null }); }}
                    style={sx('padding:9px 16px;border-radius:999px;background:rgba(246,239,230,.05);'
                      + `border:1px solid rgba(246,239,230,${an ? '.5' : '.20'});`
                      + 'font-size:14px;font-weight:700;color:#F6EFE6;white-space:nowrap;'
                      + `opacity:${still ? .45 : 1};transition:opacity .3s ${EASE},border-color .3s ${EASE}`)}>{chip}</span>
                );
              })}
            </div>
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
          + 'display:grid;grid-template-columns:minmax(0,420px) minmax(0,1fr);gap:56px;align-items:start')}>
          <div>
            {this.kicker(`[ 06 ]|${L.form.label}`)}
            <h2 data-reveal="" style={sx("margin:0 0 12px;font-family:'League Spartan',sans-serif;font-weight:900;line-height:1.02;letter-spacing:-.028em;color:#F6EFE6;text-wrap:balance;"
              + 'font-size:clamp(38px,4vw,64px)')}>{L.form.h2}</h2>
            <p style={sx('margin:0 0 10px;' + UNTERZEILE)}>{L.form.sub}</p>
            <p style={sx('margin:0 0 26px;font-size:14px;font-weight:800;letter-spacing:.02em;color:rgba(246,239,230,.62)')}>{L.form.avail}</p>

            {/* Die beiden Wege. Der gewaehlte steht hell und traegt einen
                Strich, der andere faellt zurueck. Das ist H2 aus dem
                Zeigen-Mockup, hier auf die Wahl angewandt. */}
            {[
              { k: 'test' as const, an: test, gross: L.form.testBig, klein: L.form.testSub, titel: L.form.tabTest, n1: L.form.testNote1, n2: L.form.testNote2 },
              { k: 'event' as const, an: !test, gross: L.form.priceBig, klein: L.form.priceSub, titel: L.form.tabEvent, n1: L.form.priceNote1, n2: L.form.priceNote2 },
            ].map(w => (
              <button key={w.k} type="button" onClick={() => this.openForm(w.k)}
                aria-pressed={w.an}
                style={sx('display:block;width:100%;box-sizing:border-box;text-align:left;cursor:pointer;background:none;font-family:inherit;'
                  + 'border:none;border-top:1px solid rgba(246,239,230,.14);padding:20px 0;'
                  + `opacity:${w.an ? 1 : .45};transition:opacity .3s ${EASE}`)}>
                <span style={sx('display:flex;align-items:center;gap:12px;margin-bottom:6px;'
                  + `transform:translateX(${w.an ? 10 : 0}px);transition:transform .3s ${EASE}`)}>
                  <span aria-hidden="true" style={sx(`flex:none;width:${w.an ? 26 : 0}px;height:2px;border-radius:2px;background:#F6EFE6;`
                    + `opacity:${w.an ? .9 : 0};transition:width .3s ${EASE},opacity .3s ${EASE}`)}></span>
                  <span style={sx("font-family:'League Spartan',sans-serif;font-size:clamp(24px,2.4vw,32px);font-weight:900;line-height:1;letter-spacing:-.025em;color:#F6EFE6;white-space:nowrap")}>{w.gross}</span>
                  <span style={sx('font-size:14px;font-weight:800;color:rgba(246,239,230,.7);white-space:nowrap')}>{w.klein}</span>
                </span>
                <span style={sx('display:block;font-size:15px;line-height:1.5;font-weight:600;color:rgba(246,239,230,.72);max-width:38ch')}>
                  {w.n1} {w.n2}
                </span>
              </button>
            ))}
          </div>

          <div data-form-panel="" style={sx('min-width:0')}>

            {st === 'ok' && (
              <div role="status" style={sx('width:100%;box-sizing:border-box;padding:clamp(22px,3vw,34px);border-radius:24px;background:rgba(246,239,230,.03);border:1.5px solid rgba(246,239,230,.20);text-align:center' + schatten(';box-shadow:0 16px 40px rgba(0,0,0,.35)'))}>
                <div style={sx('font-size:22px;font-weight:900;color:#F6EFE6')}>{test ? L.form.okTitleTest : L.form.okTitleEvent}</div>
                <p style={sx('margin:10px 0 0;color:rgba(246,239,230,.78);font-weight:500;line-height:1.6')}>{test ? L.form.okBodyTest : L.form.okBodyEvent}</p>
              </div>
            )}

            {st !== 'ok' && (
              <form key={this.state.formMode} onSubmit={this.submitForm}
                style={sx('width:100%;text-align:left;padding:clamp(22px,3vw,30px);border-radius:24px;background:rgba(246,239,230,.03);border:1.5px solid rgba(246,239,230,.20);box-sizing:border-box' + schatten(';box-shadow:0 16px 40px rgba(0,0,0,.35)'))}>
                {/* Die Aufschrift. Wolfs Auflage war, dass klar getrennt sein
                    muss, welches der beiden Formulare man ausfuellt. Links
                    steht die Wahl, hier steht die Antwort darauf, in derselben
                    Zeile wie ein Wechselverweis fuer den Fall, dass man sich
                    vertan hat. */}
                <div style={sx('display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid rgba(246,239,230,.14)')}>
                  <span style={sx('font-size:11.5px;font-weight:900;letter-spacing:.18em;text-transform:uppercase;color:rgba(246,239,230,.5)')}>{L.form.label}</span>
                  <span style={sx("font-family:'League Spartan',sans-serif;font-size:22px;font-weight:900;line-height:1;letter-spacing:-.02em;color:#F6EFE6;white-space:nowrap;"
                    + `min-width:${Math.max(L.form.tabEvent.length, L.form.tabTest.length)}ch`)}>{test ? L.form.tabTest : L.form.tabEvent}</span>
                  <span style={sx('flex:1')}></span>
                  {/* Und der Verweis wanderte um 35 px, weil seine Breite von
                      seinem eigenen Text kam und der beim Wechsel wechselt.
                      Jetzt haelt er die Breite des laengeren der beiden. */}
                  <button type="button" onClick={() => this.openForm(test ? 'event' : 'test')}
                    style={sx('background:none;border:none;padding:0;cursor:pointer;font-family:inherit;font-size:13.5px;font-weight:700;'
                      + `min-width:${Math.max(L.form.tabEvent.length, L.form.tabTest.length)}ch;text-align:right;`
                      + 'color:rgba(246,239,230,.62);text-decoration:underline;text-decoration-color:rgba(246,239,230,.3);text-underline-offset:3px')}>
                    {test ? L.form.tabEvent : L.form.tabTest}
                  </button>
                </div>
                <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true" style={sx('display:none')} />
                <input type="hidden" name="_subject" value={test ? 'Neues Test-Team' : 'Quiz-Anfrage'} />
                <input type="hidden" name="art" value={test ? 'Test-Team' : 'Event-Anfrage'} />
                <div style={sx('display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr))')}>
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
                          drei. Jetzt stehen beide als zwei mal zwei. */}
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
                    <div style={sx('display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));padding-top:14px')}>
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
        {/* Wolf am 28.08.: "platziere die schrift mittig wenn die scrollbar ganz
            unten ist, aktuell schiebt sich der text noch leicht ueber die
            mitte". Stimmt, und es ist Arithmetik: am Seitenende zeigt das
            Fenster die letzten 100svh, davon belegt der Fussbereich die
            unteren F Pixel. Der Text steht in einem Halt der Hoehe 100svh
            mittig, also svh/2 ueber dessen Unterkante; mittig im FENSTER
            waere svh/2 minus F. Ein Polster von 2F oben schiebt die Mitte um
            genau F nach unten und loest das exakt.
            F wird gemessen und nicht geschaetzt, der Fussbereich ist in
            beiden Sprachen verschieden hoch. */}
        <section data-halt="" data-spruch="" style={sx('background:#0A0814;height:clamp(420px,92svh,980px);min-height:0;padding:0 32px;box-sizing:border-box')}>
          <div data-kinetic="" data-m="kin" style={sx("width:100%;text-align:center;font-family:'League Spartan',sans-serif;"
            + 'font-size:clamp(30px,6.8vw,118px);font-weight:900;line-height:1;color:transparent;'
            + '-webkit-text-stroke:1.4px rgba(246,239,230,.42);letter-spacing:-.01em;white-space:nowrap')}>{L.kinetic}</div>
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
