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
const TEAMS = [
  { id: 'd', color: '#3B82F6', av: '/assets/av-qq-donut.webp' },
  { id: 's', color: '#22C55E', av: '/assets/av-qq-strawberry.webp' },
  { id: 'b', color: '#EF4444', av: '/assets/av-qq-paper-boat.webp' },
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
  { av: '/assets/av-qq-table-lamp.webp',     farbe: '#3B82F6', gr: 21, x: 12, y: 66, r: 14,  d: 0.62, beat: false, tx: '-26px', ty: '24px',  tr: '20deg' },
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

// Beamerbild wird in Entwurfsgroesse gebaut und auf die Leinwand skaliert
const WALL_W = 640, WALL_H = 354;

type OPState = {
  formMode: 'event' | 'test'; formStatus: 'idle' | 'sending' | 'ok' | 'error';
  arenaPts?: Record<string, number>;
  arenaGain?: Record<string, { g: number; hits: number }>;
  arenaRound?: number;
  wallScale?: number;
  beam?: boolean; beamWelcome?: boolean;
  johFan?: boolean; hookI?: number; hookVor?: number | null;
  b01?: number; b01Hand?: Record<number, string>; frak?: string | null;
  tick?: number; hbOn?: number | null;
  probeCat?: string; probePick?: number | null;
  guessRaw?: string; guessDone?: boolean;
  points?: number[]; pointsDone?: boolean;
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
  private _arenaT: ReturnType<typeof setInterval> | undefined;
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

  arenaTick() {
    const round = (this.state.arenaRound || 0) + 1;
    // Nach acht Runden stehen bleiben statt auf null zuruecksetzen. Der
    // Ruecksprung erzeugte ein 20-Sekunden-Fenster, in dem acht Fraktionen mit
    // 0 Punkten dastanden. Ein Endstand ist ein Bild, eine Nullreihe ist ein
    // Fehler, auch wenn sie keiner ist.
    if (round > 8) return;
    const pts = { ...(this.state.arenaPts || {}) };
    const gain: Record<string, { g: number; hits: number }> = {};
    FACTIONS.forEach(f => {
      if (pts[f.id] == null) pts[f.id] = 0;
      const hits = Math.random() < 0.28 ? 3 : Math.random() < 0.5 ? 2 : Math.random() < 0.7 ? 1 : 0;
      if (hits) { const g = hits * 40; gain[f.id] = { g, hits }; pts[f.id] += g; }
    });
    this.setState({ arenaPts: pts, arenaGain: gain, arenaRound: round });
  }

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
      if (this.state.arenaRound || 0) return;
      this.arenaTick();
      // Bei „weniger Bewegung" den Endstand in einem Rutsch setzen, statt ihn
      // ueber zwanzig Sekunden wachsen zu lassen.
      if (this._reduziert) for (let i = 0; i < 8; i++) this.arenaTick();
    }, { rootMargin: '0px 0px -12% 0px' });
    this._spielIO.observe(el);
  }

  watchWall() {
    const box = document.querySelector('[data-m="screenbox"]');
    if (!box || typeof ResizeObserver === 'undefined') return;
    const measure = () => {
      const r = box.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const sc = Math.min(r.width / WALL_W, r.height / WALL_H);
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
    this._coarse = window.matchMedia('(hover:none)').matches || window.innerWidth < 861;
    this._arenaT = setInterval(() => {
      if (document.hidden) return;
      if (!this._spielSichtbar || this._reduziert) return;
      this.arenaTick();
    }, 2600);
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
      const k = document.querySelector('[data-kinetic]') as HTMLElement | null;
      if (k) {
        const r = k.getBoundingClientRect();
        const vh = window.innerHeight || 800;
        if (r.top < vh && r.bottom > 0) {
          const prog = 1 - (r.top + r.height / 2) / vh;
          k.style.letterSpacing = (0.02 + Math.max(-0.01, Math.min(0.06, prog * 0.07))).toFixed(3) + 'em';
        }
      }
    };
    window.addEventListener('scroll', this.onScroll, { passive: true });
  }

  componentWillUnmount() {
    clearInterval(this.gameTimer);
    clearInterval(this._b01T);
    clearTimeout(this._b01Neu);
    clearTimeout(this._beamT);
    clearInterval(this._arenaT);
    clearInterval(this._hookT);
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
      <header data-header="" style={sx(`position:sticky;overflow:visible;top:0;z-index:20;transition:padding .3s ${EASE},background .3s ${EASE},border-color .3s ${EASE};backdrop-filter:blur(14px);background:rgba(10,8,20,.86);box-shadow:0 12px 34px rgba(10,8,20,.55)`)}>
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
                <span key={`ein-${hookI}`} style={sx(`display:inline-block;color:${objekt.farbe};transition:color .4s ${EASE}`)}>
                  {hook.split('').map((ch, j) => (
                    <span key={j} className="cwWortEin" style={sx(`animation-delay:${(j * 0.032).toFixed(3)}s`)}>{ch === ' ' ? '\u00A0' : ch}</span>
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

  kicker(label: string) {
    return (
      <div data-reveal="" style={sx('display:flex;align-items:center;gap:12px;margin:0 0 14px;font-size:11.5px;font-weight:900;letter-spacing:.2em;text-transform:uppercase;color:rgba(246,239,230,.62);white-space:nowrap')}>
        {label.split('|')[0]}
        <span style={sx('flex:1;height:1px;background:linear-gradient(90deg,rgba(250,75,163,.35),transparent);max-width:180px')}></span>
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
   *   CozyArena -> die Rangfolge der Fraktionen, die sich live umsortiert.
   * Beides laeuft weiter, es haengt nur nicht mehr am Aufklappen.
   */
  renderModes() {
    const L = this.T;
    // Das Brett spielt nicht nach der Uhr, sondern nach Zuegen. b01 zaehlt,
    // wie viele gespielt sind; b01Hand haelt die Felder, die jemand selbst
    // gesetzt hat. Ein Tick der alten Uhr entspricht CYCLE Schritten, deshalb
    // die Umrechnung: so bleibt die gesamte Zeichenschicht unveraendert.
    const frakAn = FACTIONS.find(f => f.id === (this.state.frak ?? null)) || null;
    const zuege = this.state.b01 ?? 0;
    const g = this.gameVals(zuege ? CYCLE * (zuege - 1) + R_END + 1 : 0, this.state.b01Hand);
    this._b01Feld = g.cells.map(c => c.owned);
    const HAAR = 'rgba(246,239,230,.14)';
    const reihen = [
      {
        key: 'quiz', name: 'CozyQuiz', akzent: '#FA4BA3',
        chip: L.modes.quizChip, lead: L.modes.quizLead, bullets: L.modes.quizBullets,
      },
      {
        key: 'arena', name: 'CozyArena', akzent: '#FFC7E4',
        chip: L.modes.arenaChip, lead: L.modes.arenaLead, bullets: L.modes.arenaBullets,
      },
    ];

    return (
      <section id="spielarten" data-ton="168,85,247" data-shell="" style={sx('max-width:1180px;margin:0 auto;padding:84px 32px')}>
        {this.kicker(`${L.modes.kicker}|${L.modes.label}`)}
        <h2 data-reveal="" style={sx("margin:0 0 40px;font-family:'League Spartan',sans-serif;"
          + 'font-size:clamp(40px,5.2vw,84px);font-weight:900;line-height:.9;letter-spacing:-.032em;color:#F6EFE6')}>
          {L.modes.h2}
        </h2>

        {reihen.map((r, i) => (
          <div key={r.key} data-m="modereihe"
            style={sx('display:grid;grid-template-columns:290px 1fr 340px;gap:48px;align-items:start;'
              + `padding:52px 0;border-top:1px solid ${HAAR}${i === reihen.length - 1 ? `;border-bottom:1px solid ${HAAR}` : ''}`)}>
            <div data-reveal="">
              <div style={sx("font-family:'League Spartan',sans-serif;font-size:clamp(38px,4vw,58px);"
                + 'font-weight:900;line-height:.9;letter-spacing:-.03em;color:#F6EFE6')}>{r.name}</div>
              <div style={sx('margin-top:12px;font-size:12px;font-weight:900;letter-spacing:.16em;'
                + `text-transform:uppercase;color:${r.akzent}`)}>{r.chip}</div>
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
            </div>

            {r.key === 'quiz' ? (
              <div ref={this.boardWinRef} data-m="modeobjekt"
                onMouseEnter={() => this.brettLauf(true)} onMouseLeave={() => this.brettLauf(false)}
                style={sx('min-width:0;display:flex;justify-content:flex-end;height:340px;box-sizing:border-box')}>
                {this.renderBoard(g, i => this.brettSetzen(i))}
              </div>
            ) : (
              <div data-m="modeobjekt" style={sx('min-width:0')}>
                <div style={sx('position:relative;height:300px')}>{this.renderFactions()}</div>
                {/* Wolf: "haette ich beim hovern ueber die teamwappen der arena
                    gerne den namen und slogan". Die Sprueche stehen woertlich
                    in der App (QQ_MEGA_FACTIONS). Sie kommen NICHT in die
                    Zeile selbst: dort wuerde die Tabelle bei jedem Zeigen
                    springen, und eine springende Rangliste ist schlimmer als
                    kein Spruch. Stattdessen eine eigene Zeile mit
                    vorgehaltener Hoehe, unter der Tabelle. */}
                <div aria-live="polite" style={sx('margin-top:14px;min-height:44px;display:flex;align-items:center;gap:10px;flex-wrap:wrap')}>
                  {frakAn && (
                    <>
                      <span style={sx(`font-size:15px;font-weight:900;color:${frakAn.color}`)}>{L.sim.factions[frakAn.id]}</span>
                      <span style={sx('font-size:15px;font-weight:500;color:rgba(246,239,230,.7)')}>{L.sim.mottos[frakAn.id]}</span>
                    </>
                  )}
                </div>
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
  renderFactions() {
    const L = this.T;
    const pts = this.state.arenaPts || {};
    const vals = FACTIONS.map(f => pts[f.id] || 0);
    const max = Math.max(1, ...vals);
    const ranked = FACTIONS.slice().sort((a, b) => (pts[b.id] || 0) - (pts[a.id] || 0)).map(f => f.id);
    const H = 100 / FACTIONS.length;
    return FACTIONS.map(f => {
      const p = pts[f.id] || 0, r = ranked.indexOf(f.id), leadNow = r === 0 && p > 0;
      // Wolf am 2026-08-27: beim Zeigen soll die Zeile selbst eine Umrandung
      // bekommen, nicht nur der Spruch darunter erscheinen.
      const hov = this.state.frak === f.id;
      const rahmen = hov
        ? `background:linear-gradient(90deg,${f.color}33,${f.color}0d);border:1px solid ${f.color};box-shadow:0 0 26px ${f.color}4d`
        : leadNow
          ? `background:linear-gradient(90deg,${f.color}26,transparent);border:1px solid ${f.color}80;box-shadow:0 0 22px ${f.color}33`
          : 'border:1px solid transparent';
      return (
        <div key={f.id}
          onMouseEnter={() => { if (!this._coarse) this.setState({ frak: f.id }); }}
          onMouseLeave={() => { if (!this._coarse) this.setState({ frak: null }); }}
          style={sx(`position:absolute;left:0;right:0;top:0;height:${H}%;display:flex;align-items:center;gap:10px;padding:0 10px;border-radius:12px;box-sizing:border-box;transform:translateY(${r * 100}%);transition:transform 1.5s ${EASE},background .35s ease,border-color .35s ease,box-shadow .35s ease;cursor:default;${rahmen}`)}>
          <span style={sx(`flex:none;width:18px;text-align:center;font-size:15px;font-weight:900;color:${leadNow || hov ? '#F6EFE6' : 'rgba(246,239,230,.5)'};transition:color .5s ease`)}>{r + 1}</span>
          <span style={sx(teammarke(f.color, `/assets/crest-${f.id}.webp`, 30))}></span>
          <span style={sx('flex:none;width:124px;min-width:0')}>
            <span style={sx(`display:block;font-size:13.5px;font-weight:900;line-height:1.15;color:${f.color};white-space:nowrap;overflow:hidden;text-overflow:ellipsis`)}>{L.sim.factions[f.id]}</span>
          </span>
          {/* Der Balken ist eine liegende Kachel: gleicher Lichtverlauf, gleiche
              Kanten, nur 12 px hoch. Die Rinne dahinter bleibt eine Rinne. */}
          <span style={sx('flex:1;min-width:0;height:12px;border-radius:6px;background:rgba(246,239,230,.06);box-shadow:inset 0 1px 2px rgba(0,0,0,.4);overflow:hidden;display:block')}>
            <span style={sx(`display:block;height:100%;width:${Math.round((p / max) * 100)}%;border-radius:6px;`
              + `background:${KACHEL_VERLAUF},${f.color};`
              + 'box-shadow:inset 0 1px 0 rgba(255,255,255,.38),inset -2px 0 0 rgba(0,0,0,.18),0 2px 3px rgba(0,0,0,.42);'
              + `transition:width 1.8s ${EASE}`)}></span>
          </span>
          <span style={sx(`flex:none;width:44px;text-align:right;font-size:15px;font-weight:900;color:${f.color};font-variant-numeric:tabular-nums`)}>{p}</span>
        </div>
      );
    });
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
    const answered = phase === 'q' ? Math.min(6, Math.floor(t / 4)) : 6;
    const revealed = phase !== 'q';

    const qOptions = q.opts.map((label, k) => {
      const hit = revealed && k === q.correct;
      return {
        label, num: k + 1,
        style: `flex:1;display:flex;align-items:center;gap:10px;padding:12px 12px;border-radius:14px;box-sizing:border-box;background:${hit ? q.col + '22' : 'rgba(246,239,230,.035)'};border:1px solid ${hit ? q.col : 'rgba(246,239,230,.09)'};box-shadow:${hit ? `0 0 22px ${q.col}55` : 'none'};transition:background .4s ${EASE},border-color .4s ${EASE},box-shadow .4s ${EASE}`,
        numStyle: `font-family:'League Spartan',sans-serif;font-size:26px;font-weight:900;line-height:1;color:${hit ? q.col : q.col + 'cc'}`,
      };
    });

    const teamDiscs = TEAMS.map((tm, k) => ({
      style: teammarke(tm.color, tm.av, 42)
        + `opacity:${k < answered ? 1 : .38};transition:opacity .4s ${EASE}`,
    }));

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
        name: L.sim.teams[tm.id],
        sub: `${n} ${n === 1 ? L.sim.field : L.sim.fields}${leads ? (tied ? L.sim.tied : L.sim.lead) : ''}`,
        rowStyle: `display:inline-flex;align-items:center;gap:11px;flex:none;padding:7px 13px 7px 8px;border-radius:14px;box-sizing:border-box;transition:border-color .4s ${EASE},box-shadow .4s ${EASE},background .4s ${EASE};${isActive ? `border:1.5px solid ${tm.color};background:linear-gradient(90deg,${tm.color}1f,transparent);box-shadow:0 0 18px ${tm.color}55` : 'border:1.5px solid transparent'}`,
        discStyle: teammarke(tm.color, tm.av, 34)
          + (isActive ? `outline:3px solid ${tm.color}44;outline-offset:1px;` : ''),
        nameStyle: `font-size:15px;font-weight:900;letter-spacing:-.02em;color:${tm.color};line-height:1.15;white-space:nowrap`,
      };
    });

    const fc = active ? active.color : 'rgba(246,239,230,.12)';
    const verb = isStack ? L.sim.verbStack : isSteal ? L.sim.verbSteal : L.sim.verbSet;
    return {
      cells, standings, seconds, qOptions, teamDiscs,
      qText: q.text, catName: q.cat,
      showQuestion: phase !== 'b', showBoard: phase === 'b',
      statusLine: phase === 'b' ? `${active ? L.sim.teams[active.id] : ''} ${verb}` : (revealed ? L.sim.reveal : L.sim.answering),
      answeredLine: L.sim.answeredLine(answered, TEAMS.length),
      catPillStyle: `display:inline-flex;align-items:center;gap:8px;white-space:nowrap;flex:none;padding:6px 12px;border-radius:999px;background:${q.col}22;border:1px solid ${q.col}59;font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:${q.col};transition:all .4s ${EASE}`,
      qCardStyle: `padding:20px 18px;border-radius:16px;background:rgba(246,239,230,.03);border:1px solid ${q.col}59;box-shadow:0 0 34px ${q.col}2e;font-size:21px;font-weight:900;line-height:1.25;color:#F6EFE6;transition:border-color .4s ${EASE},box-shadow .4s ${EASE}`,
      ringStyle: `flex:none;width:62px;height:62px;border-radius:50%;border:3px solid ${q.col};display:flex;align-items:center;justify-content:center;font-family:'League Spartan',sans-serif;font-size:24px;font-weight:900;color:${q.col};box-shadow:0 0 24px ${q.col}55;transition:border-color .4s ${EASE},color .4s ${EASE}`,
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
    // Text braucht helle Toene auf #0A0814, #AB0055 nur als Flaechenfarbe
    const ACC = ['#FA4BA3', '#FFC7E4', '#FF7AC0'];
    const HAAR = 'rgba(246,239,230,.14)';
    return (
      <section id="anlaesse" data-shell="" style={sx('max-width:1180px;margin:0 auto;padding:84px 32px')}>
        {this.kicker(`[ 02 ]|${L.anlaesse.label}`)}
        <h2 data-reveal="" style={sx("margin:0 0 14px;font-family:'League Spartan',sans-serif;"
          + 'font-size:clamp(40px,5.2vw,84px);font-weight:900;line-height:.9;letter-spacing:-.032em;color:#F6EFE6')}>
          {L.anlaesse.h2}
        </h2>
        <p data-reveal="" style={sx('margin:0 0 26px;max-width:620px;font-size:17px;line-height:1.6;'
          + 'color:rgba(246,239,230,.62);font-weight:500;text-wrap:pretty')}>{L.anlaesse.sub}</p>

        {L.anlaesse.cards.map((cardT, i) => {
          const a = ACC[i];
          return (
            <div key={cardT.title} data-m="modereihe"
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
                <a href="#anfragen" style={sx(`display:inline-block;font-size:15.5px;font-weight:900;color:${a}`)}>
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
              <div aria-hidden="true" data-m="anlassnr"
                style={sx('position:relative;width:100%;max-width:230px;margin-left:auto;aspect-ratio:1/1')}>
                {ANLASS_GRUPPEN[i].map(o => (
                  <span key={o.av} className="cwAnlassObj"
                    style={sx(`position:absolute;left:${o.x}%;top:${o.y}%;width:${o.gr}%;aspect-ratio:1/1;`
                      + `--r:${o.r}deg;background:url(${o.av}) center/contain no-repeat;`
                      + 'filter:drop-shadow(0 10px 16px rgba(0,0,0,.55))')}></span>
                ))}
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
          <div style={sx('display:flex;flex-direction:column;gap:8px')}>
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
                <button key={i} type="button" onClick={() => this.setState({ probePick: i })}
                  style={sx(`display:flex;align-items:center;gap:11px;width:100%;padding:11px 12px;border-radius:14px;cursor:pointer;font-family:inherit;font-size:14px;font-weight:800;box-sizing:border-box;text-align:left;box-shadow:0 3px 0 rgba(0,0,0,.45);border:1px solid ${line};background:${fill};color:${text};transform:translateY(${chosen ? '-2px' : '0'});transition:all .3s ${EASE}`)}>
                  <span style={sx(`width:26px;height:26px;flex:none;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;background:${badge};color:${badgeCol}`)}>{letter}</span>
                  <span style={sx('text-align:left')}>{label}</span>
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
            onClick={() => this.setState(done ? { guessDone: false, guessRaw: '' } : { guessDone: raw0 !== '' })}
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
          <button type="button" onClick={() => { if (ready) this.setState(st => ({ pointsDone: !st.pointsDone })); }}
            style={sx(`width:100%;padding:12px;border-radius:14px;text-align:center;font-family:inherit;font-size:12.5px;font-weight:900;box-sizing:border-box;cursor:${ready ? 'pointer' : 'default'};border:1px solid ${ready ? col + '99' : 'rgba(246,239,230,.09)'};background:${done ? 'rgba(246,239,230,.05)' : (ready ? col : 'transparent')};color:${done ? 'rgba(246,239,230,.78)' : (ready ? '#0A0814' : 'rgba(246,239,230,.62)')};transition:all .3s ${EASE}`)}>
            {done ? L.probe.pointsAgain : (ready ? L.probe.pointsSubmit : L.probe.pointsLeft(10 - sum))}
          </button>
          <div style={sx(`overflow:hidden;box-sizing:border-box;text-align:center;font-size:12.5px;line-height:1.5;font-weight:800;color:#F6EFE6;max-height:${done ? '130px' : '0px'};padding:${done ? '12px' : '0 12px'};margin-top:${done ? '2px' : '0'};border-radius:14px;border:1px solid ${done ? pc + '80' : 'transparent'};background:${pc}14;opacity:${done ? 1 : 0};transition:max-height .5s ${EASE},padding .5s ${EASE},opacity .35s ease`)}>
            {done ? L.probe.pointsResult(p.correctLabel, gained) : ' '}
          </div>
        </div>
      );
    }

    return (
      <section id="probieren" data-ton="59,130,246" style={sx('border-top:1px solid rgba(246,239,230,.10);border-bottom:1px solid rgba(246,239,230,.10);background:radial-gradient(ellipse at 50% 0%,rgba(246,239,230,.04),transparent 65%)')}>
        <div data-shell="" style={sx('max-width:1180px;margin:0 auto;padding:80px 32px;display:grid;grid-template-columns:1fr 600px;gap:40px;align-items:center')} data-m="two2">
          <div>
            <div data-reveal="" style={sx('font-size:13px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;color:rgba(246,239,230,.62)')}>{L.probe.kicker}</div>
            {this.kicker(`[ 03 ]|${L.probe.label}`)}
            <h2 data-reveal="" style={sx("margin:12px 0 14px;font-family:'League Spartan',sans-serif;font-size:34px;font-weight:900;color:#F6EFE6")}>{L.probe.h2}</h2>
            <p data-reveal="" style={sx('margin:0 0 26px;max-width:520px;font-size:17px;line-height:1.6;color:rgba(246,239,230,.78);font-weight:500')}>{L.probe.sub}</p>
            <div style={sx(`margin-bottom:26px;padding:20px 22px;border-radius:18px;border:1px solid ${col}40;border-left:3px solid ${col};background:${col}0f;transition:border-color .3s ${EASE},background .3s ${EASE}`)}>
              <div style={sx(`font-size:18px;font-weight:900;line-height:1.35;color:${col};margin-bottom:7px`)}>{catT.claim}</div>
              <div style={sx('font-size:15.5px;line-height:1.6;font-weight:500;color:rgba(246,239,230,.78)')}>{catT.detail}</div>
            </div>
            <div data-reveal="" style={sx('display:flex;flex-direction:column;gap:10px;font-size:15.5px;font-weight:700;color:#F6EFE6')}>
              <span style={sx('display:flex;align-items:center;gap:11px')}><span style={sx('color:#FA4BA3')}>✓</span>{L.probe.check1}</span>
              <span style={sx('display:flex;align-items:center;gap:11px')}><span style={sx('color:#FA4BA3')}>✓</span>{L.probe.check2}</span>
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
            <div style={sx('display:flex;flex-direction:column;gap:11px;flex:none')}>
              {PROBE_ORDER.map((k, i) => {
                const mt = CAT_META.find(c => c.key === k);
                const ct = L.probe.cats[k];
                if (!mt) return null;
                const onT = k === key;
                // Bogen: mittlere Chips stehen weiter rechts als die aeusseren
                const arc = Math.round(20 * Math.sin((i + 0.5) / n * Math.PI));
                const pick = () => this.setState({ probeCat: k, probePick: null, guessRaw: '', guessDone: false, points: [4, 3, 3], pointsDone: false });
                return (
                  <button key={k} type="button" onMouseEnter={pick} onClick={pick}
                    style={sx(`display:inline-flex;align-items:center;gap:12px;padding:14px 22px;border-radius:999px;cursor:pointer;font-family:inherit;font-size:16px;font-weight:900;white-space:nowrap;transform:translateX(${arc}px) scale(${onT ? 1.05 : 1});transform-origin:left center;background:${onT ? mt.col + '26' : 'rgba(246,239,230,.03)'};border:1px solid ${onT ? mt.col : 'rgba(246,239,230,.1)'};color:${onT ? mt.col : 'rgba(246,239,230,.78)'};box-shadow:${onT ? '0 0 26px ' + mt.col + '3d' : 'none'};transition:transform .55s ${EASE},background .3s ${EASE},border-color .3s ${EASE},color .3s ${EASE},box-shadow .4s ${EASE}`)}>
                    <span style={sx(`display:block;width:30px;height:30px;flex:none;background:url(${mt.icon}) center/contain no-repeat;opacity:${onT ? 1 : .8}`)}></span>
                    {ct.name}
                  </button>
                );
              })}
            </div>
            <div style={sx('transform-style:preserve-3d;transform-origin:50% 84%;'
              + `transform:rotateX(${up ? (tilt ? -tilt.y * 9 : 0) : 64}deg) rotateY(${up && tilt ? (tilt.x * 12).toFixed(1) : 0}deg) rotateZ(${up ? 0 : -8}deg) scale(${up ? 1 : .9});`
              + `filter:brightness(${up ? 1 : .68});transition:transform ${tilt && up ? '.22s' : '1.15s'} ${EASE},filter 1.15s ${EASE}`)}>
              <div data-m="pphone" style={sx(`width:360px;height:600px;border-radius:46px;box-sizing:border-box;padding:20px 16px;display:flex;flex-direction:column;background:linear-gradient(180deg,#150c20,#0a0714);border:7px solid #06060c;box-shadow:0 30px 70px rgba(0,0,0,.6);transition:box-shadow .5s ${EASE}`)}>
                <div style={sx('display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:18px;border:1px solid rgba(168,85,247,.45);background:rgba(168,85,247,.07);margin-bottom:12px;flex:none')}>
                  <span style={sx(teammarke('#A855F7', '/assets/av-qq-crystal-ball.webp', 34))}></span>
                  <span style={sx('flex:1;font-size:15px;font-weight:900;color:#A855F7')}>{L.hero.phoneTeamA}</span>
                  <span style={sx('width:26px;height:26px;border-radius:9px;border:1px solid rgba(246,239,230,.14);display:flex;align-items:center;justify-content:center;font-size:11px;color:#c49ab5')}>☰</span>
                </div>
                <div key={key} style={sx(`position:relative;overflow:hidden;flex:1;min-height:0;padding:18px 16px;border-radius:22px;border:1px solid ${col}40;background:rgba(246,239,230,.025);box-sizing:border-box;overflow:hidden;animation:${PROBE_ORDER.indexOf(key) % 2 ? 'cwCardB' : 'cwCardA'} .55s ${EASE} both;transition:border-color .35s ${EASE}`)}>
                  <span style={sx(`display:inline-flex;align-items:center;padding:6px 13px;border-radius:999px;background:${col}1f;border:1px solid ${col}80;font-size:11px;font-weight:900;color:${col};flex:none`)}>{catT.name}</span>
                  {p.kind !== 'guess' && (
                    <div style={sx('margin:12px 0 14px;font-size:16px;font-weight:900;line-height:1.35;color:#F6EFE6')}>{p.q}</div>
                  )}
                  {cardBody}
                </div>
                <div style={sx('margin-top:auto;padding-top:12px;text-align:center;font-size:11px;font-weight:800;color:rgba(246,239,230,.62);flex:none')}>{footer}</div>
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
      <section id="ablauf" data-ton="34,197,94" style={sx('border-top:1px solid rgba(246,239,230,.10)')}>
        <div data-shell="" style={sx('max-width:1180px;margin:0 auto;padding:80px 32px')}>
          {this.kicker(`[ 04 ]|${L.ablauf.label}`)}
          <h2 data-reveal="" style={sx("margin:0 0 8px;font-family:'League Spartan',sans-serif;font-size:34px;font-weight:900;color:#F6EFE6")}>{L.ablauf.h2}</h2>
          <p data-reveal="" style={sx('margin:0 0 34px;max-width:620px;font-size:17px;line-height:1.6;color:rgba(246,239,230,.62);font-weight:500')}>{L.ablauf.sub}</p>

          <div data-reveal="" data-m="wall" onMouseEnter={beamStart} onMouseLeave={beamStop} onClick={beamStart}
            style={sx('position:relative;margin:0 0 44px;cursor:pointer')}>
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
            <div style={sx('position:relative;width:100%;aspect-ratio:16/9;border-radius:22px;overflow:hidden;'
              + `border:1px solid ${on ? 'rgba(246,239,230,.22)' : 'rgba(246,239,230,.10)'};`
              + 'background:linear-gradient(180deg,#141024,#0a0714);'
              + `box-shadow:${on ? '0 0 60px rgba(255,242,250,.06),inset 0 0 90px rgba(255,242,250,.03)' : 'none'};`
              + `transition:border-color .9s ${EASE},box-shadow 1.1s ${EASE}`)}>
              <div data-m="screenbox" style={sx(`position:absolute;inset:0;overflow:hidden;pointer-events:none;background:${on ? '#0b0714' : 'transparent'};transition:background .45s ${EASE} ${on ? '0s' : '.35s'}`)}>
                <div aria-hidden="true" style={sx(`position:absolute;inset:0;z-index:12;pointer-events:none;border-radius:14px;opacity:0;background:linear-gradient(160deg,#efe4dc,#cdbfcb);animation:${on ? 'cwBeamOn 1.9s cubic-bezier(.4,0,.3,1) both' : 'none'};transition:opacity .8s ease`)}></div>
                <div style={sx(`position:absolute;left:50%;top:50%;width:${WALL_W}px;height:${WALL_H}px;transform-origin:center center;opacity:${on ? 1 : 0};transition:opacity .5s ${EASE} ${on ? '1.1s' : '0s'};transform:translate(-50%,-50%) scale(${this.state.wallScale ?? 0.8})`)}>
                  <div data-m="wallscreen" style={sx('width:640px;height:354px;box-sizing:border-box;padding:18px;border-radius:22px;background:transparent;display:flex;flex-direction:column;justify-content:center;overflow:hidden;position:relative')}>
                    <div aria-hidden="true" style={sx(`position:absolute;inset:0;z-index:9;border-radius:22px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(ellipse at 50% 45%,#141024,#0b0714 72%);opacity:${this.state.beamWelcome ? 1 : 0};pointer-events:none;transition:opacity .8s ${EASE} ${this.state.beamWelcome ? '.75s' : '0s'}`)}>
                      <div style={sx('display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:16px 40px;border-radius:20px;border:1px solid rgba(246,239,230,.20);background:rgba(246,239,230,.05)')}>
                        <span style={sx('font-size:13px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;color:rgba(246,239,230,.62)')}>{L.sim.welcomeKicker}</span>
                        <span style={sx("font-family:'League Spartan',sans-serif;font-size:62px;font-weight:900;letter-spacing:.02em;line-height:1;color:#F6EFE6")}>{L.sim.welcomeTitle}</span>
                      </div>
                      <div style={sx('display:flex;align-items:center;gap:14px;margin-top:26px')}>
                        {/* Wolf am 2026-08-27: "der wolf ist alt aus der beamerview".
                            Nachgesehen: /logo.webp ist Bild fuer Bild dasselbe wie die
                            Pose augenzu.mundzu der App, also nicht alt, sondern schlafend.
                            Die App begruesst mit einer wachen, winkenden Pose. Genau die
                            steht jetzt hier: augenauf.mundauf.winken, aus dem App-Bestand
                            unter frontend/public/avatars/cozywolf, auf 320 px gerechnet. */}
                        <img src="/assets/wolf-winken.webp" alt="" width={62} height={62} style={sx('width:62px;height:62px')} />
                        <span style={sx('padding:12px 18px;border-radius:14px;border:1px solid rgba(246,239,230,.20);background:rgba(246,239,230,.03);font-size:15px;font-weight:900;line-height:1.35;color:#F6EFE6;text-align:center')}>{L.sim.welcomeSub}</span>
                      </div>
                    </div>
                    <span aria-hidden="true" style={sx('position:absolute;inset:0;border-radius:22px;pointer-events:none;overflow:hidden')}>
                      <span style={sx('position:absolute;top:0;bottom:0;width:38%;background:linear-gradient(90deg,transparent,rgba(246,239,230,.07),transparent)')}></span>
                    </span>
                    <span aria-hidden="true" style={sx('position:absolute;inset:0;border-radius:22px;pointer-events:none;background:radial-gradient(ellipse at 46% 44%,transparent 58%,rgba(0,0,0,.32))')}></span>
                    <div style={sx('position:relative;display:flex;align-items:center;justify-content:space-between;margin-bottom:14px')}>
                      <span style={sx(g.catPillStyle)}>{g.catName}</span>
                      <span style={sx('font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:rgba(246,239,230,.62)')}>{g.statusLine}</span>
                    </div>

                    {g.showQuestion && (
                      <>
                        <div style={sx('display:flex;gap:16px;align-items:flex-start')}>
                          <div style={sx('flex:1;min-width:0')}>
                            <div style={sx(g.qCardStyle)}>{g.qText}</div>
                            <div style={sx('display:flex;gap:8px;margin-top:14px')}>
                              {g.qOptions.map((o, i) => (
                                <div key={i} style={sx(o.style)}>
                                  <span style={sx(o.numStyle)}>{o.num}</span>
                                  <span style={sx('font-size:12px;font-weight:800;color:#F6EFE6;line-height:1.2')}>{o.label}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div style={sx(g.ringStyle)}>{g.seconds}</div>
                        </div>
                        <div style={sx('margin-top:18px;display:flex;flex-direction:column;align-items:center;gap:7px')}>
                          <span style={sx('font-size:12.5px;font-weight:900;letter-spacing:.06em;color:rgba(246,239,230,.62);white-space:nowrap')}>{g.answeredLine}</span>
                          <div style={sx('display:flex;gap:9px')}>
                            {g.teamDiscs.map((d, i) => <span key={i} style={sx(d.style)}></span>)}
                          </div>
                        </div>
                      </>
                    )}

                    {g.showBoard && (
                      <div style={sx('zoom:.95;width:100%;display:flex;gap:26px;align-items:center;justify-content:center')}>
                        {this.renderBoard(g)}
                        <div style={sx('flex:none;display:flex;flex-direction:column;gap:5px;min-width:0')}>
                          {g.standings.map((s, i) => (
                            <div key={i} style={sx(s.rowStyle)}>
                              <span style={sx(s.discStyle)}></span>
                              <span style={sx('flex:1;min-width:0;display:flex;flex-direction:column;gap:1px')}>
                                <span style={sx(s.nameStyle)}>{s.name}</span>
                                <span style={sx('font-size:13.5px;font-weight:800;color:rgba(246,239,230,.62);line-height:1.2')}>{s.sub}</span>
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

          {/* Fassung B2, von Wolf gewaehlt: die Aussage des Abschnitts ist nicht
              "hier sind zwei Listen", sondern "ihr braucht fast nichts". Also
              traegt die Ueberschrift das Ungleichgewicht, und darunter steht
              eine Zeile gegen vier.
              Weg sind die zwei Kaesten, die beim Zeigen aufklappten: sie
              versteckten beide Listen hinter einer Mausbewegung, und auf dem
              Handy gab es die gar nicht. Wolfs Einwand "nicht 2 mal die
              grosse schrift" ist der Grund, warum hier nichts gross gesetzt
              ist: die Ueberschrift sagt es schon. */}
          <div data-reveal="" data-m="modereihe"
            style={sx('display:grid;grid-template-columns:1fr 1fr;align-items:start;gap:48px;'
              + 'padding:36px 0 0;border-top:1px solid rgba(246,239,230,.14)')}>
            <div>
              <div style={sx('margin-bottom:16px;font-size:12px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;color:rgba(246,239,230,.55)')}>{L.ablauf.duo1Title}</div>
              <ul style={sx('margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:13px')}>
                {L.ablauf.duo1.map(item => (
                  <li key={item} style={sx('display:flex;gap:14px;font-size:16px;line-height:1.5;font-weight:600;color:rgba(246,239,230,.72);text-wrap:pretty')}>
                    <span style={sx('flex:none;width:16px;height:1px;margin-top:12px;background:rgba(246,239,230,.35)')}></span>{item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div style={sx('margin-bottom:16px;font-size:12px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;color:#FA4BA3')}>{L.ablauf.duo0Title}</div>
              <ul style={sx('margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:13px')}>
                {L.ablauf.duo0.map(item => (
                  <li key={item} style={sx('display:flex;gap:14px;font-size:16px;line-height:1.5;font-weight:600;color:#F6EFE6;text-wrap:pretty')}>
                    <span style={sx('flex:none;width:16px;height:1px;margin-top:12px;background:#FA4BA3')}></span>{item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    );
  }

  renderJohannes() {
    const L = this.T;
    const a = !!this.state.johFan;
    const side = (deg: string, x: string) => 'position:absolute;left:0;top:0;width:100%;height:100%;border-radius:50%;overflow:hidden;box-sizing:border-box;'
      + `border:3px solid rgba(250,75,163,${a ? .45 : 0});box-shadow:0 18px 40px rgba(0,0,0,.5);`
      + `transform:translateX(${a ? x : '0px'}) rotate(${a ? deg : '0deg'}) scale(${a ? .78 : .6});`
      + `opacity:${a ? 1 : 0};transition:transform .85s ${EASE},opacity .5s ${EASE},border-color .6s ${EASE}`;
    return (
      <section id="johannes" data-ton="249,115,22" style={sx('border-top:1px solid rgba(246,239,230,.10)')}>
        <div data-shell="" style={sx('max-width:1180px;margin:0 auto;padding:80px 32px;display:grid;grid-template-columns:300px 1fr;gap:52px;align-items:center')} data-m="joh">
          <div onMouseEnter={() => this.setState({ johFan: true })} onMouseLeave={() => this.setState({ johFan: false })}
            style={sx('display:flex;flex-direction:column;align-items:center;gap:14px')}>
            <div style={sx('position:relative;width:220px;height:220px')}>
              <div style={sx(side('-13deg', '-118px'))}>
                <img src="/assets/johannes-arm1.webp" alt="" style={sx('display:block;width:100%;height:100%;object-fit:cover;border-radius:50%')} />
              </div>
              <div style={sx(side('13deg', '118px'))}>
                <img src="/assets/johannes-arm2.webp" alt="" style={sx('display:block;width:100%;height:100%;object-fit:cover;border-radius:50%')} />
              </div>
              <img src="/assets/johannes-rund.jpg" loading="lazy" decoding="async" width={220} height={220} alt={L.johannes.photoAlt}
                style={sx(`position:relative;z-index:2;width:220px;height:220px;border-radius:50%;object-fit:cover;object-position:center 22%;border:3px solid rgba(250,75,163,${a ? .75 : .5});box-shadow:0 24px 50px rgba(0,0,0,.55);transform:scale(${a ? 1.04 : 1});transition:transform .8s ${EASE},border-color .6s ${EASE}`)} />
            </div>
            <div style={sx('text-align:center')}>
              <div style={sx('font-size:18px;font-weight:900;color:#F6EFE6')}>{L.johannes.name}</div>
              <div style={sx('font-size:13.5px;font-weight:700;letter-spacing:.04em;color:#F6EFE6')}>{L.johannes.role}</div>
            </div>
          </div>
          <div>
            <div data-reveal="" style={sx('font-size:12px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;color:rgba(246,239,230,.62);margin-bottom:12px')}>{L.johannes.kicker}</div>
            <h2 data-reveal="" style={sx("margin:0 0 18px;max-width:700px;font-family:'League Spartan',sans-serif;font-size:30px;font-weight:900;line-height:1.18;color:#F6EFE6;cursor:default;hyphens:none")}>
              {L.johannes.quote.map((qw, i) => (
                <span key={i}>
                  <span style={sx(`display:inline-block;white-space:nowrap;color:${qw.hot ? '#FA4BA3' : '#F6EFE6'}`)}>{qw.w}</span>
                  {i < L.johannes.quote.length - 1 ? ' ' : ''}
                </span>
              ))}
            </h2>
            <p style={sx('margin:0 0 22px;max-width:680px;font-size:17px;line-height:1.65;font-weight:500;color:rgba(246,239,230,.78)')}>{L.johannes.body}</p>
            <div data-reveal="" data-stagger="" style={sx('display:flex;flex-wrap:wrap;gap:10px')}>
              {L.johannes.chips.map(chip => (
                <span key={chip} style={sx('padding:9px 16px;border-radius:999px;background:rgba(246,239,230,.05);border:1px solid rgba(246,239,230,.20);font-size:14px;font-weight:700;color:#F6EFE6;white-space:nowrap')}>{chip}</span>
              ))}
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
      <section id="fragen" style={sx('border-top:1px solid rgba(246,239,230,.10)')}>
        <div data-shell="" style={sx('max-width:1180px;margin:0 auto;padding:80px 32px')}>
          {this.kicker(`[ 05 ]|${L.faq.label}`)}
          <h2 data-reveal="" style={sx("margin:0 0 36px;font-family:'League Spartan',sans-serif;font-size:34px;font-weight:900;color:#F6EFE6")}>{L.faq.h2}</h2>
          <div data-reveal="" data-m="faqgrid" style={sx('display:grid;gap:34px 56px;grid-template-columns:1fr 1fr')}>
            {L.faq.items.map(item => (
              <div key={item.q} style={sx('padding-top:22px;border-top:1px solid rgba(246,239,230,.14)')}>
                <div style={sx('margin-bottom:9px;font-size:18px;font-weight:900;line-height:1.3;color:#F6EFE6;text-wrap:balance')}>{item.q}</div>
                <div style={sx('font-size:15.5px;line-height:1.62;font-weight:500;color:rgba(246,239,230,.76);text-wrap:pretty')}>{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  renderForm() {
    const L = this.T;
    const test = this.state.formMode === 'test';
    const st = this.state.formStatus;
    const tab = (on: boolean) => `padding:10px 20px;border-radius:999px;border:none;cursor:pointer;white-space:nowrap;font-family:inherit;font-size:14.5px;font-weight:900;transition:background .25s ${EASE},color .25s ${EASE};background:${on ? '#F6EFE6' : 'transparent'};color:${on ? '#0A0814' : 'rgba(246,239,230,.78)'}`;
    const inputStyle = 'width:100%;box-sizing:border-box;padding:11px 14px;border-radius:12px;background:rgba(246,239,230,.05);border:1.5px solid rgba(246,239,230,.38);color:#F6EFE6;font-family:inherit;font-size:15px;font-weight:600';
    const labelStyle = 'font-size:13px;font-weight:800;color:rgba(246,239,230,.78);letter-spacing:.01em';
    const fieldWrap = 'display:flex;flex-direction:column;gap:6px';
    const req = <span aria-hidden="true" style={sx('color:#FA4BA3')}> *</span>;
    return (
      <section id="anfragen" data-ton="250,75,163" style={sx('background:radial-gradient(ellipse at 50% 0%,rgba(246,239,230,.05),transparent 70%)')}>
        <span aria-hidden="true" style={sx('display:block;height:1px;background:linear-gradient(90deg,transparent,rgba(250,75,163,.32),transparent)')}></span>
        <div style={sx('position:relative;max-width:760px;margin:0 auto;padding:88px 32px;text-align:center')}>
          <span aria-hidden="true" style={sx('position:absolute;top:20px;left:50%;transform:translateX(-50%);width:520px;height:220px;border-radius:50%;background:radial-gradient(ellipse,rgba(246,239,230,.05),transparent 70%);pointer-events:none')}></span>
          {this.kicker(`[ 06 ]|${L.form.label}`)}
          <h2 data-reveal="" style={sx("position:relative;margin:0 0 14px;font-family:'League Spartan',sans-serif;font-size:38px;font-weight:900;color:#F6EFE6")}>{L.form.h2}</h2>
          <p style={sx('margin:0 auto 10px;max-width:560px;font-size:17.5px;line-height:1.6;font-weight:500;color:rgba(246,239,230,.78)')}>{L.form.sub}</p>
          <p style={sx('margin:0 auto 18px;font-size:14px;font-weight:800;letter-spacing:.02em;color:#F6EFE6')}>{L.form.avail}</p>
          <div style={sx('position:relative;display:inline-flex;gap:6px;padding:6px;border-radius:999px;background:rgba(246,239,230,.04);border:1px solid rgba(246,239,230,.20);margin:0 0 22px')}>
            <button type="button" onClick={() => this.openForm('event')} style={sx(tab(!test))}>{L.form.tabEvent}</button>
            <button type="button" onClick={() => this.openForm('test')} style={sx(tab(test))}>{L.form.tabTest}</button>
          </div>
          <div data-form-panel="" style={sx(`overflow:hidden;max-height:1800px;opacity:1;transition:max-height 1.05s ${EASE},opacity .5s ${EASE} .18s`)}>

            <div data-m="pricerow" style={sx('position:relative;display:flex;align-items:center;justify-content:center;gap:14px;flex-wrap:wrap;margin:0 0 26px')}>
              <span style={sx('display:inline-flex;align-items:baseline;gap:8px;padding:12px 22px;border-radius:999px;background:rgba(246,239,230,.05);border:1px solid rgba(246,239,230,.20)')}>
                <span style={sx("font-family:'League Spartan',sans-serif;font-size:28px;font-weight:900;color:#F6EFE6;white-space:nowrap")}>{test ? L.form.testBig : L.form.priceBig}</span>
                <span style={sx('font-size:14px;font-weight:700;color:#F6EFE6;white-space:nowrap')}>{test ? L.form.testSub : L.form.priceSub}</span>
              </span>
              <span style={sx('font-size:14.5px;font-weight:700;color:rgba(246,239,230,.62);text-align:left')}>
                {test ? L.form.testNote1 : L.form.priceNote1}<br />{test ? L.form.testNote2 : L.form.priceNote2}
              </span>
            </div>

            {st === 'ok' && (
              <div role="status" style={sx('max-width:560px;margin:0 auto;padding:clamp(22px,3vw,34px);border-radius:24px;background:rgba(246,239,230,.03);border:1.5px solid rgba(246,239,230,.20);box-shadow:0 16px 40px rgba(0,0,0,.35);text-align:center')}>
                <div style={sx('font-size:22px;font-weight:900;color:#F6EFE6')}>{test ? L.form.okTitleTest : L.form.okTitleEvent}</div>
                <p style={sx('margin:10px 0 0;color:rgba(246,239,230,.78);font-weight:500;line-height:1.6')}>{test ? L.form.okBodyTest : L.form.okBodyEvent}</p>
              </div>
            )}

            {st !== 'ok' && (
              <form key={this.state.formMode} onSubmit={this.submitForm}
                style={sx('max-width:560px;margin:0 auto;text-align:left;padding:clamp(22px,3vw,34px);border-radius:24px;background:rgba(246,239,230,.03);border:1.5px solid rgba(246,239,230,.20);box-shadow:0 16px 40px rgba(0,0,0,.35)')}>
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
                      <div style={sx(fieldWrap + ';grid-column:1/-1')}>
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
                    {L.form.errorPre}<a href="mailto:hallo@cozywolf.de" style={sx('color:#FFC7E4')}>hallo@cozywolf.de</a>{L.form.errorPost}
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
                  {L.form.privacy1}<a href="/datenschutz" style={sx('color:#FFC7E4;font-weight:700')}>{L.form.privacyLink}</a>{L.form.privacy2}
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
      <div data-m="root" style={sx('min-height:100vh;background:#0A0814;width:100%')}>
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
        <section style={sx('border-top:1px solid rgba(246,239,230,.10);overflow:hidden;background:#0A0814')}>
          <div data-kinetic="" data-m="kin" style={sx("padding:66px 0;text-align:center;font-family:'League Spartan',sans-serif;font-size:clamp(26px,5vw,54px);font-weight:900;line-height:1.1;color:transparent;-webkit-text-stroke:1.2px rgba(250,75,163,.3);letter-spacing:.02em;white-space:nowrap;transition:letter-spacing .1s linear")}>{L.kinetic}</div>
        </section>
        <footer style={sx('border-top:1px solid rgba(246,239,230,.10)')}>
          <div data-m="foot" data-shell="" style={sx('max-width:1180px;margin:0 auto;padding:30px 32px;display:flex;align-items:center;gap:20px;font-size:14px;font-weight:600;color:rgba(246,239,230,.62)')}>
            <img src={LOGO} alt="" width={26} height={26} style={sx('width:26px;height:26px')} />
            <span style={sx('white-space:nowrap')}>{L.footer.city}</span>
            <a href="mailto:hallo@cozywolf.de" style={sx('color:#FFC7E4')}>hallo@cozywolf.de</a>
            <a href="/impressum" style={sx('color:#FFC7E4')}>{L.footer.imprint}</a>
            <a href="/datenschutz" style={sx('color:#FFC7E4')}>{L.footer.privacy}</a>
            <a href="https://instagram.com/cozywolf.events" style={sx('margin-left:auto;display:flex;align-items:center;gap:8px;color:#FFC7E4')}>@cozywolf.events</a>
          </div>
          <div data-shell="" style={sx('max-width:1180px;margin:0 auto;padding:0 32px 26px;font-size:12.5px;font-weight:600;color:rgba(246,239,230,.5)')}>{L.footer.aiNote}</div>
        </footer>
        <a href="#anfragen" data-m="sticky" style={sx('position:fixed;left:14px;right:14px;bottom:14px;z-index:40;align-items:center;justify-content:center;padding:15px 20px;border-radius:999px;background:#F6EFE6;color:#0A0814;font-weight:900;font-size:16px;box-shadow:0 14px 34px rgba(0,0,0,.55)')}>{L.sticky}</a>
      </div>
    );
  }
}

export default function OnePage() {
  const lang = useLang();
  return <OnePageInner lang={lang} />;
}
