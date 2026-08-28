/**
 * MobileOnePage — die eigenstaendige Mobil-Fassung (Entwurf "Website Mobile",
 * von Wolf abgenommen). KEINE responsive Variante der Desktop-Seite: eigene
 * Abschnitts-Reihenfolge (01 Spielarten, 02 So spielt ihr, 03 Anlaesse),
 * Tippen statt Hover, eigenes Herobild. Ausgespielt unter derselben URL '/'
 * per User-Agent-Weiche (vercel.json) bzw. matchMedia im Client (main.tsx).
 *
 * Portiert 1:1 aus dem dc-Entwurf; Stil-Generatoren liefern CSS-Strings via
 * sx(). Der Formular-Versand ist hier echt (Formspree), im Entwurf war er
 * nur Attrappe. Design ist eingefroren.
 */
import { Component } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { useLang, setLang, type Lang } from '../lang';
import { FORMSPREE_ID, INSTA_URL, EMAIL } from '../brand';
import { sx } from './onepage/sx';
import { WAND_FUGEN, WAND_RAND, WAND_STEINE } from './onepage/wand';
import { motivAnteil, qqGridSize, teammarke } from '../qqKachel';
import { mobileT, type MobileDict, type MobileCat } from './onepage/mobileTexts';

const EASE = 'cubic-bezier(.22,1,.36,1)';
const LOGO = '/logo.webp';
// Der Akzent der Seite, wie in OnePage.tsx: creme, nicht mehr rosa.
const AKZENT = '#F6EFE6';

const MOBILE_CSS = `
html{background:#0A0814;color-scheme:dark;scroll-behavior:smooth;scroll-padding-top:76px}
body{margin:0;background:#0A0814;color:#F6EFE6;font-family:'Bricolage Grotesque',Nunito,system-ui,sans-serif;font-optical-sizing:auto;-webkit-font-smoothing:antialiased;overflow-x:hidden}
*{-webkit-tap-highlight-color:rgba(246,239,230,.18)}
a{color:#F6EFE6;text-decoration:none}
summary::-webkit-details-marker{display:none}
input,textarea,select,button{font-family:inherit}
a:focus-visible,button:focus-visible,summary:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible{outline:3px solid #F6EFE6;outline-offset:3px;border-radius:12px}
:focus:not(:focus-visible){outline:none}
@keyframes mRise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
@keyframes mLetter{0%{transform:translateY(108%) rotate(6deg);opacity:0}100%{transform:none;opacity:1}}
@keyframes mLetterB{0%{transform:translateY(108%) rotate(6deg);opacity:0}100%{transform:none;opacity:1}}
@keyframes mPop{0%{transform:scale(.4);opacity:0}60%{transform:scale(1.12)}100%{transform:scale(1);opacity:1}}
@keyframes mBurst{0%{transform:scale(.5);opacity:.9}100%{transform:scale(2.1);opacity:0}}
@keyframes mFlip{0%{transform:rotateY(0)}100%{transform:rotateY(360deg)}}
/* Die Wand in 04, dieselben Griffe wie auf dem Desktop: das Muster steht
   still, bewegt wird nur die Maske, und zwei Scharen schmaler Linien laufen
   verschieden schnell gegeneinander. Ohne Zeigerlicht, das gibt es hier
   nicht. */
@keyframes mWelle{from{mask-position:-2000px -2000px;-webkit-mask-position:-2000px -2000px}to{mask-position:-1690.8px -2000px;-webkit-mask-position:-1690.8px -2000px}}
@keyframes mNetz{from{mask-position:-2000px -2000px;-webkit-mask-position:-2000px -2000px}to{mask-position:-2000px -1649.6px;-webkit-mask-position:-2000px -1649.6px}}
@keyframes mFunke{0%,100%{opacity:.35}50%{opacity:1}}
@keyframes mBeam{0%{opacity:0}6%{opacity:.3}13%{opacity:.1}20%{opacity:.34}30%{opacity:.16}40%{opacity:.3}62%{opacity:.2}82%{opacity:.08}100%{opacity:0}}
@media (prefers-reduced-motion:reduce){[data-welle],[data-netz],[data-funke]{animation:none!important}}
`;

/**
 * Die fuenf Gegenstaende der Marke im Kopf.
 *
 * Erster Versuch war eine Reihe, fuenf gleich grosse Kacheln nebeneinander.
 * Wolf am 28.08.: "damit ist die mobile deutlich langweiliger ... die reihe
 * ist das gegenteil der mobile wo die objekte in verschiedenen ebenen
 * hintereinander stehen". Er hat recht. Eine Reihe ist eine Liste, und eine
 * Liste hat keine Tiefe; die Gruppe auf dem Desktop lebt genau davon, dass
 * die Dinger verschieden gross sind, sich ueberlappen, gekippt stehen und
 * dadurch vor- und hintereinander liegen.
 *
 * Meine Begruendung fuer die Reihe war der Platz, und die war zu bequem: die
 * Gruppe muss nicht quadratisch sein, nur weil sie es auf dem Desktop ist.
 * Hier ist sie ein flaches Band, 350 auf 168 px, also 48 Prozent der Breite.
 * Die Groessenstaffelung des Desktops bleibt (30, 25, 23, 20, 18 Prozent der
 * Breite), die Neigungen auch, und die Ueberlappungen sind gerechnet: jede
 * Kachel greift ein Stueck in die naechste, keine verdeckt eine andere ganz.
 *
 * z gibt die Ebene. Was gerade gemeint ist, kommt nach vorn, damit es
 * antippbar bleibt und nicht halb unter dem Nachbarn liegt.
 */
const MOBJEKTE = [
  { av: '/assets/obj-puzzle.webp',           farbe: '#F97316', wort: 3, l: 0,  t: 8,  gr: 30, r: -8,  z: 3 },
  { av: '/assets/av-qq-crystal-ball.webp',   farbe: '#A855F7', wort: 4, l: 24, t: 34, gr: 25, r: 10,  z: 4 },
  { av: '/assets/av-qq-mushroom.webp',       farbe: '#22C55E', wort: 1, l: 46, t: 0,  gr: 23, r: 6,   z: 2 },
  { av: '/assets/obj-sanduhr.webp',          farbe: '#FACC15', wort: 2, l: 66, t: 40, gr: 20, r: -14, z: 5 },
  { av: '/assets/obj-gehirn.webp',           farbe: '#3B82F6', wort: 0, l: 82, t: 4,  gr: 18, r: 14,  z: 1 },
];
/** Wort -> Gegenstand. Umkehrung von MOBJEKTE[].wort, wie OBJEKT_WORT im Desktop. */
const MWORT_OBJ = [0, 1, 2, 3, 4].map(w => MOBJEKTE.findIndex(o => o.wort === w));

/**
 * Die Avatarwand in 01: Motive und Farben, wie in OnePage.tsx.
 *
 * Sechzehn Motive reichen: mehr sieht niemand, der acht Kacheln durchtippt,
 * und jede Datei ist ein eigener Abruf.
 */
const AV_MOTIVE = ['donut', 'strawberry', 'game-die', 'crystal-ball', 'mushroom', 'table-lamp',
  'teapot', 'treasure-chest', 'paper-boat', 'croissant', 'cookie', 'compass',
  'popcorn', 'rocket', 'cheese', 'candle'];
const AV_FARBEN = ['#F97316', '#22C55E', '#14B8A6', '#A855F7', '#FACC15', '#3B82F6', '#EC4899', '#EF4444'];
const AV_START_OBJ = [0, 1, 2, 3, 4, 5, 6, 7];
const AV_START_FARBE = [0, 1, 2, 3, 4, 5, 6, 7];

/**
 * Die Lage der acht Wappen im Feld von 01, in Prozent des Feldes.
 *
 * Auf dem Desktop schweben sie in zwei Gruppen, drei links und fuenf rechts.
 * Auf 350 px Breite gibt es keine zwei Gruppen, also ein Feld: 330 auf 188,
 * die Groessen gestaffelt wie dort (von 26 bis 17 Prozent), die Lagen
 * gerechnet, damit sich keine zwei Wappen verdecken. z gibt die Ebene.
 */
/**
 * Drei Gegenstaende je Anlass, wie auf dem Desktop (ANLASS_GRUPPEN).
 *
 * Drei und nicht einer, weil einer den Anlass nie trifft: eine Torte allein
 * ist ein Kuchen, Torte mit Luftballons und Geschenk ist ein Geburtstag.
 * Frei und ueberlappend, ohne Kachel -- eine Kachel bedeutet im Spiel ein
 * Feld oder eine Teammarke, neben "Geburtstag" bedeutet sie nichts.
 */
/** Die Funken der Begruessungsfolie, warm wie in der App (#F7E4A8). */
const MFUNKEN = Array.from({ length: 22 }, (_, i) => ({
  x: (i * 37) % 97,
  y: (i * 53) % 91,
  g: 1.4 + (i % 4) * 0.5,
  o: (0.30 + (i % 5) * 0.14).toFixed(2),
  d: ((i * 13) % 47) / 10,
}));

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

const FRAK_LAGE = [
  { x: 0,  y: 2,  gr: 26, z: 3 },
  { x: 28, y: 16, gr: 22, z: 2 },
  { x: 52, y: 0,  gr: 24, z: 4 },
  { x: 78, y: 10, gr: 20, z: 1 },
  { x: 6,  y: 56, gr: 22, z: 2 },
  { x: 31, y: 64, gr: 19, z: 3 },
  { x: 54, y: 52, gr: 18, z: 1 },
  { x: 74, y: 58, gr: 24, z: 5 },
];

// Team-Avatare: das CozyQuiz-Objektset der App (48 Motive). Die Objekte sind
// farbneutral, die Teamfarbe kommt aus der Kachel darunter - deshalb sind hier
// Motiv und Farbe getrennt. Die Zuordnung folgt den Farb-Slots der App: die
// ersten acht Motive in COZYQUIZ_AVATARS sind index-gleich zu den acht Slots,
// also erbt jedes Team das Motiv seiner Farbe.
const TEAMS = [
  { id: 'g', color: '#22C55E', av: '/assets/av-qq-mushroom.webp' },
  { id: 'p', color: '#A855F7', av: '/assets/av-qq-crystal-ball.webp' },
  { id: 'y', color: '#FACC15', av: '/assets/av-qq-game-die.webp' },
  { id: 'o', color: '#F97316', av: '/assets/av-qq-treasure-chest.webp' },
];

// 6x6, weil qqGridSize(4) in der App 6 sagt (KioskQuiz
// shared/quarterQuizTypes.ts:257). Hier stand vorher 5x5 mit der Begruendung
// „dafuer grosse Felder". Das war eine Bequemlichkeit, kein Spielstand: wer
// mit vier Teams spielt, sieht am Abend ein 6x6.
const GRID = qqGridSize(TEAMS.length);
const BOARD = [
  'g', 'g', '', 'p', 'p', '',
  'g', '', 'y', 'p', '', '',
  '', 'y', 'y', '', 'p', 'p',
  'o', 'y', '', 'g', '', 'p',
  'o', 'o', '', 'g', '', '',
  '', 'o', '', '', 'g', 'g',
];

type BoardAction = { i: number; id: string; kind: 'set' | 'steal' | 'stack' | 'joker' };
// Auf 6x6 uebertragen: setzen neben eigenem Gebiet, klauen beim Nachbarn,
// stapeln auf dem eigenen Feld, Joker als letzter Zug.
const ACTIONS: BoardAction[] = [
  { i: 10, id: 'p', kind: 'set' },
  { i: 19, id: 'o', kind: 'steal' },
  { i: 16, id: 'p', kind: 'stack' },
  { i: 2, id: 'g', kind: 'joker' },
];

type MOPState = {
  open: 'quiz' | 'arena' | null;
  tab: 'event' | 'test';
  formStatus: 'idle' | 'sending' | 'ok' | 'error';
  cat: number; picked: number | null;
  step: number; hookI: number; wallOn: boolean;
  guess: number; guessDone: boolean;
  pts: number[]; ptsDone: boolean;
  act: number; acts: Record<number, BoardAction>;
  splash: boolean; count: number; done: boolean;
  scrolled?: boolean; menu?: boolean; stickyOn?: boolean;
  anlass?: string;
  /** Avatarwand in 01: Motiv und Farbe je Kachel. */
  avObj?: number[]; avFarbe?: number[];
  /** Angetipptes Wappen in 01. */
  frak?: string | null;
};

class MobileOnePageInner extends Component<{ lang: Lang }, MOPState> {
  state: MOPState = {
    open: 'quiz', tab: 'event', formStatus: 'idle', cat: 0, picked: null,
    step: 0, hookI: 0, wallOn: false, guess: 180, guessDone: false,
    pts: [0, 0, 0], ptsDone: false, act: -1, acts: {}, splash: false, count: 3, done: false,
  };

  private _io: IntersectionObserver | undefined;
  private _wio: IntersectionObserver | undefined;
  private _wall: HTMLElement | null = null;
  private _onScroll: (() => void) | undefined;
  private _onKey: ((e: KeyboardEvent) => void) | undefined;
  private _raf = 0;
  private _fill: ReturnType<typeof setInterval> | undefined;
  private _actT: ReturnType<typeof setInterval> | undefined;
  private _hookT: ReturnType<typeof setInterval> | undefined;
  private _sio: IntersectionObserver | undefined;
  /** Der Wolf auf der Begruessungsfolie in 04. */
  private _wolfV: HTMLVideoElement | null = null;
  private _catT: ReturnType<typeof setTimeout> | undefined;
  private _cdT: ReturnType<typeof setInterval> | undefined;

  get T(): MobileDict { return mobileT(this.props.lang); }

  componentDidMount() {
    // Abschnitts-Reveals: JS setzt die Startwerte, damit das prerenderte HTML
    // fuer Crawler ohne JavaScript vollstaendig sichtbar bleibt.
    const reduced = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    if (!reduced) {
      requestAnimationFrame(() => {
        document.querySelectorAll<HTMLElement>('[data-rv]').forEach(el => {
          el.style.opacity = '0';
          el.style.transform = 'translateY(20px)';
          el.style.transition = `opacity .7s ${EASE},transform .7s ${EASE}`;
        });
        this._io = new IntersectionObserver((es) => {
          es.forEach(e => {
            if (!e.isIntersecting) return;
            const el = e.target as HTMLElement;
            el.style.opacity = '1';
            el.style.transform = 'none';
            this._io?.unobserve(el);
          });
        }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
        document.querySelectorAll('[data-rv]').forEach(el => this._io?.observe(el));
      });

      this._onScroll = () => {
        if (this._raf) return;
        this._raf = requestAnimationFrame(() => {
          this._raf = 0;
          const sc = window.scrollY > 60;
          if (sc !== this.state.scrolled) this.setState({ scrolled: sc });
          const st = window.scrollY > window.innerHeight * 0.8;
          if (st !== this.state.stickyOn) this.setState({ stickyOn: st });
        });
      };
      window.addEventListener('scroll', this._onScroll, { passive: true });

      this._hookT = setInterval(() => {
        if (!document.hidden) this.setState(s => ({ hookI: s.hookI + 1 }));
      }, 6800);
    }

    if (this._wall) {
      this._wio = new IntersectionObserver((es) => {
        es.forEach(e => {
          const an = e.isIntersecting && e.intersectionRatio > .45;
          if (an !== this.state.wallOn) {
            // Der Wolf laeuft einmal, wenn die Lampe angeht, und haelt an,
            // wenn die Wand aus dem Bild ist. preload="none": die 966 KB
            // sollen nicht beim Seitenaufbau ueber Mobilfunk gehen.
            const v = this._wolfV;
            if (v) {
              if (an) { try { v.currentTime = 0; void v.play().catch(() => { /* stumm, blockt nicht */ }); } catch { /* egal */ } }
              else v.pause();
            }
          }
          this.setState({ wallOn: an });
        });
      }, { threshold: [.2, .5, .75] });
      this._wio.observe(this._wall);
    }

    // Menue mit Escape schliessen (Handoff 7: Tastaturfokus im Mobilmenue)
    this._onKey = (e) => { if (e.key === 'Escape' && this.state.menu) this.setState({ menu: false }); };
    window.addEventListener('keydown', this._onKey);

    // Das Brett in 01 faengt an, wenn der Abschnitt zu sehen ist, nicht beim
    // Laden. Vorher hing es an der aufgeklappten Karte; seit beide Bloecke
    // offen stehen, waere es sonst schon durchgelaufen, bevor jemand
    // hinsieht.
    const sp = document.getElementById('spielarten');
    if (sp && typeof IntersectionObserver !== 'undefined') {
      this._sio = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        this._sio?.disconnect();
        this.open('quiz');
      }, { threshold: 0.12 });
      this._sio.observe(sp);
    } else {
      this.open('quiz');
    }
  }

  componentWillUnmount() {
    this._io?.disconnect();
    this._sio?.disconnect();
    this._wio?.disconnect();
    if (this._onScroll) window.removeEventListener('scroll', this._onScroll);
    if (this._onKey) window.removeEventListener('keydown', this._onKey);
    cancelAnimationFrame(this._raf);
    clearInterval(this._fill); clearInterval(this._hookT); clearTimeout(this._catT);
    clearInterval(this._actT); clearInterval(this._cdT);
  }

  // ------------------------------------------------- Spielarten-Karten
  open(which: 'quiz' | 'arena' | null) {
    clearInterval(this._fill); clearInterval(this._actT);
    this.setState({ open: which, step: 0, act: -1, acts: {} });
    if (which === 'quiz') {
      this._fill = setInterval(() => {
        this.setState(p => {
          if (p.open !== 'quiz' || p.step >= BOARD.length) {
            clearInterval(this._fill);
            if (p.open === 'quiz') this.startActions();
            return null;
          }
          return { step: p.step + 1 };
        });
      }, 90);
    }
  }

  startActions() {
    clearInterval(this._actT);
    this._actT = setInterval(() => {
      this.setState(p => {
        if (p.open !== 'quiz') { clearInterval(this._actT); return null; }
        const next = p.act + 1;
        if (next >= ACTIONS.length) return { act: -1, acts: {} };
        const a = ACTIONS[next];
        return { act: next, acts: { ...p.acts, [a.i]: a } };
      });
    }, 2100);
  }

  // ------------------------------------------------- Fragetypen-Demo
  nextCat(delay: number) {
    clearTimeout(this._catT); clearInterval(this._cdT);
    // Nach dem fuenften Typ endet die Demo mit einer Abschlusskarte statt
    // still auf Frage 1 zu loopen.
    const last = this.state.cat >= this.T.probe.cats.length - 1;
    this._catT = setTimeout(() => {
      if (last) { this.setState({ done: true, splash: false }); return; }
      this.setState({ splash: true, count: 3 });
      this._cdT = setInterval(() => {
        if (this.state.count > 1) { this.setState(p => ({ count: p.count - 1 })); return; }
        clearInterval(this._cdT);
        this.setState(p => ({ splash: false, count: 3, cat: (p.cat + 1) % this.T.probe.cats.length, picked: null, guess: 180, guessDone: false, pts: [0, 0, 0], ptsDone: false }));
      }, 1000);
    }, delay);
  }

  // ------------------------------------------------- Formular (Formspree)
  submitForm = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    data.set('art', this.state.tab === 'test' ? 'Test-Team' : 'Event-Anfrage');
    data.set('_subject', this.state.tab === 'test' ? 'Neues Test-Team' : 'Quiz-Anfrage');
    this.setState({ formStatus: 'sending' });
    try {
      const res = await fetch('https://formspree.io/f/' + FORMSPREE_ID, {
        method: 'POST', body: data, headers: { Accept: 'application/json' },
      });
      if (res.ok) { form.reset(); this.setState({ formStatus: 'ok' }); }
      else this.setState({ formStatus: 'error' });
    } catch { this.setState({ formStatus: 'error' }); }
  };

  // ------------------------------------------------- Bausteine
  kicker(num: string, label: string) {
    return (
      <div data-rv="" style={sx('display:flex;align-items:center;gap:10px;margin:0 0 10px;font-size:10.5px;font-weight:900;letter-spacing:.2em;text-transform:uppercase;color:rgba(246,239,230,.62)')}>
        {num}
        <span style={sx('flex:1;height:1px;background:linear-gradient(90deg,rgba(246,239,230,.28),transparent)')}></span>
        <span style={sx('color:rgba(246,239,230,.5)')}>{label}</span>
      </div>
    );
  }

  /**
   * Ein Punkt war es frueher, jetzt ist es ein Strich.
   *
   * Auf dem Desktop steht vor jeder Zeile ein 18 px langer Strich in der
   * Akzentfarbe, kein Punkt: "der Akzent bleibt als Strich vor den Punkten"
   * (Wolf am 27.08.). Damit die beiden Fassungen dieselbe Handschrift haben,
   * gilt das hier auch.
   */
  bullet(text: string, color: string) {
    return (
      <span key={text} style={sx('display:flex;gap:12px;font-size:15px;line-height:1.5;font-weight:600;color:rgba(246,239,230,.78);text-wrap:pretty')}>
        <span style={sx(`flex:none;width:16px;height:1px;background:${color};margin-top:11px`)}></span>{text}
      </span>
    );
  }


  /**
   * Die Avatarwand in 01, acht Kacheln zu vier mal zwei.
   *
   * Auf dem Desktop wechselt eine Kachel, wenn der Zeiger darauf liegt, und
   * das Feld traegt danach die Paarungen, die man selbst gemacht hat. Hier
   * gibt es keinen Zeiger, also macht das Antippen dasselbe: ein Tipp, ein
   * Schritt. Motiv und Farbe haengen nicht aneinander, sie ruecken beide um
   * eins weiter -- genau das ist der Punkt, den die Wand zeigen soll.
   */
  avSchritt(i: number) {
    this.setState(st => {
      const obj = [...(st.avObj ?? AV_START_OBJ)];
      const far = [...(st.avFarbe ?? AV_START_FARBE)];
      obj[i] = (obj[i] + 1) % AV_MOTIVE.length;
      far[i] = (far[i] + 1) % AV_FARBEN.length;
      return { avObj: obj, avFarbe: far };
    });
  }

  renderAvatarWand() {
    const L = this.T;
    const obj = this.state.avObj ?? AV_START_OBJ;
    const far = this.state.avFarbe ?? AV_START_FARBE;
    return (
      <div style={sx('margin-top:18px')}>
        <div style={sx('display:grid;grid-template-columns:repeat(4,1fr);gap:8px')}>
          {obj.map((mi, i) => (
            <button key={i} type="button" onClick={() => this.avSchritt(i)} aria-label={L.modes.avAria}
              style={sx('display:block;width:100%;padding:0;border:none;background:none;line-height:0;cursor:pointer')}>
              <span style={sx('display:block;' + teammarke(AV_FARBEN[far[i]], `/assets/av-qq-${AV_MOTIVE[mi]}.webp`, 60)
                + `width:100%;height:auto;aspect-ratio:1;background-size:90% auto,auto;transition:background-color .45s ${EASE}`)}></span>
            </button>
          ))}
        </div>
        <div style={sx('margin-top:11px;text-align:center;font-size:12.5px;font-weight:800;color:rgba(246,239,230,.55)')}>{L.modes.avZeile}</div>
      </div>
    );
  }

  /**
   * Das Feld der acht Wappen in 01.
   *
   * Auf dem Desktop schweben sie verteilt, drei links unter dem Namen und
   * fuenf rechts, und wer mit dem Zeiger drueberfaehrt, sieht Namen und
   * Spruch. Hier ist die Breite knapp, also stehen alle acht in einem Feld,
   * und ein Tipp zeigt Namen und Spruch darunter. Keine Tabelle und keine
   * Balken: die Tabelle ist am 28.08. auf dem Desktop rausgeflogen, weil sie
   * nicht die Staerke von CrowdQuiz ist, sondern nur eine Loesung, um viele
   * Teams unterzubringen.
   */
  renderFrakFeld() {
    const L = this.T;
    const an = this.state.frak ?? null;
    const aktiv = L.factions.find(f => f.file === an) ?? null;
    return (
      <div style={sx('margin-top:18px')}>
        <div style={sx('position:relative;width:100%;aspect-ratio:330/188')}>
          {FRAK_LAGE.map((lage, i) => {
            const f = L.factions[i];
            const wach = an === f.file;
            return (
              <button key={f.file} type="button"
                onClick={() => this.setState(st => ({ frak: st.frak === f.file ? null : f.file }))}
                aria-label={f.name}
                style={sx(`position:absolute;left:${lage.x}%;top:${lage.y}%;width:${lage.gr}%;aspect-ratio:1;`
                  + 'padding:0;border:none;background:none;cursor:pointer;'
                  + `z-index:${wach ? 9 : lage.z};`
                  + `transform:scale(${wach ? 1.12 : 1});transition:transform .34s ${EASE}`)}>
                <span style={sx(`display:block;width:100%;height:100%;border-radius:50%;`
                  + `background:#111827 url(/assets/crest-${f.file}.webp) center/78% no-repeat;`
                  + `border:2px solid ${f.color}${wach ? 'ff' : '77'};`
                  + `box-shadow:0 4px 12px rgba(0,0,0,.5)${wach ? `,0 0 22px ${f.color}88` : ''};`
                  + `filter:brightness(${wach ? 1.1 : 0.82});`
                  + `transition:border-color .34s ${EASE},box-shadow .34s ${EASE},filter .34s ${EASE}`)}></span>
              </button>
            );
          })}
        </div>
        {/* Name und Spruch stehen unter dem Feld und nicht in einem Kasten am
            Wappen: Wolf am 28.08. zum Desktop, "der kasten gefaellt mir
            nicht". Solange nichts angetippt ist, steht dort die Aufforderung,
            damit die Zeile nicht springt. */}
        <div style={sx('margin-top:14px;min-height:44px;text-align:center')}>
          <div style={sx(`font-size:15px;font-weight:900;line-height:1.25;color:${aktiv ? aktiv.color : 'rgba(246,239,230,.5)'};transition:color .3s ease`)}>
            {aktiv ? aktiv.name : L.modes.frakHinweis}
          </div>
          <div style={sx(`margin-top:3px;font-size:13.5px;font-weight:700;line-height:1.3;color:rgba(246,239,230,.62);opacity:${aktiv ? 1 : 0};transition:opacity .3s ease`)}>
            {aktiv ? aktiv.spruch : '\u00A0'}
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------------------- Abschnitte
  renderHeader() {
    const L = this.T;
    const s = this.state;
    const langBtn = (on: boolean) => `min-height:44px;padding:0 14px;border:0;border-radius:999px;font-size:12.5px;font-weight:900;cursor:pointer;background:${on ? '#F6EFE6' : 'transparent'};color:${on ? '#0A0814' : 'rgba(246,239,230,.62)'}`;
    return (
      <header style={sx(`position:sticky;top:0;z-index:40;padding:12px 18px;overflow:visible;transition:background .5s ease,border-color .5s ease,backdrop-filter .4s ease;`
        + (s.scrolled
          ? 'background:rgba(10,8,20,.88);backdrop-filter:blur(14px);border-bottom:1px solid rgba(246,239,230,.20)'
          : 'background:linear-gradient(180deg,rgba(10,8,20,.55),rgba(10,8,20,0));border-bottom:1px solid transparent'))}>
        <span aria-hidden="true" style={sx(`position:absolute;left:0;right:0;top:0;height:132%;pointer-events:none;background:linear-gradient(180deg,rgba(6,4,12,.72) 0%,rgba(6,4,12,.42) 52%,rgba(6,4,12,0) 100%);opacity:${s.scrolled ? 0 : 1};transition:opacity .5s ease`)}></span>
        <div style={sx('position:relative;display:flex;align-items:center;gap:12px')}>
          <a href="#top" style={sx('display:flex;align-items:center;min-height:44px;gap:9px')}>
            <img src={LOGO} alt="CozyWolf" width={34} height={34} decoding="async" style={sx('width:34px;height:34px;object-fit:contain')} />
            <span style={sx("font-family:'League Spartan',sans-serif;font-weight:900;font-size:19px;color:#F6EFE6")}>CozyWolf</span>
          </a>
          <div style={sx('margin-left:auto;display:flex;align-items:center;gap:8px')}>
            <div style={sx('display:flex;padding:3px;border-radius:999px;background:rgba(246,239,230,.04);border:1px solid rgba(246,239,230,.09)')}>
              <button type="button" onClick={() => setLang('de')} style={sx(langBtn(this.props.lang === 'de'))}>DE</button>
              <button type="button" onClick={() => setLang('en')} style={sx(langBtn(this.props.lang === 'en'))}>EN</button>
            </div>
            <button type="button" aria-label={L.nav.menuLabel} aria-expanded={!!s.menu} onClick={() => this.setState(p => ({ menu: !p.menu }))}
              style={sx('flex:none;width:44px;height:44px;border-radius:14px;border:1px solid rgba(246,239,230,.38);background:rgba(246,239,230,.04);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;cursor:pointer')}>
              <span style={sx(`width:18px;height:2px;border-radius:2px;background:rgba(246,239,230,.78);transition:transform .4s ${EASE};transform:translateY(${s.menu ? '3.5px' : '0'}) rotate(${s.menu ? 45 : 0}deg)`)}></span>
              <span style={sx(`width:18px;height:2px;border-radius:2px;background:rgba(246,239,230,.78);transition:transform .4s ${EASE};transform:translateY(${s.menu ? '-3.5px' : '0'}) rotate(${s.menu ? -45 : 0}deg)`)}></span>
            </button>
          </div>
        </div>
        <nav style={sx(`position:absolute;left:12px;right:12px;top:calc(100% - 4px);z-index:60;border-radius:20px;background:rgba(13,10,25,.97);backdrop-filter:blur(16px);border:1px solid rgba(250,75,163,.26);box-shadow:0 22px 50px rgba(0,0,0,.6);overflow:hidden;transform-origin:100% 0;transform:translateY(${s.menu ? '0' : '-10px'}) scale(${s.menu ? 1 : .96});opacity:${s.menu ? 1 : 0};pointer-events:${s.menu ? 'auto' : 'none'};transition:transform .42s ${EASE},opacity .3s ease`)}>
          <div style={sx('display:flex;flex-direction:column')}>
            {L.nav.items.map((it, i) => (
              <a key={it.href} href={it.href} onClick={() => this.setState({ menu: false })}
                style={sx(i === L.nav.items.length - 1
                  ? 'display:flex;align-items:center;min-height:50px;padding:0 18px;font-size:16px;font-weight:800;color:#FA4BA3'
                  : 'display:flex;align-items:center;min-height:50px;padding:0 18px;font-size:16px;font-weight:800;color:#F6EFE6;border-bottom:1px solid rgba(246,239,230,.20)')}>{it.label}</a>
            ))}
          </div>
        </nav>
      </header>
    );
  }

  /**
   * Ein Wort antippen heisst hier: den Gegenstand antippen.
   *
   * Der Takt laeuft danach von vorn, sonst springt das Wort ein paar
   * Zehntel spaeter weiter und der Tipp fuehlt sich an, als haette er nicht
   * gezaehlt.
   */
  hookWaehlen(i: number) {
    clearInterval(this._hookT);
    this.setState({ hookI: i });
    this._hookT = setInterval(() => {
      if (!document.hidden) this.setState(s => ({ hookI: s.hookI + 1 }));
    }, 6800);
  }

  renderHero() {
    const L = this.T;
    const hookI = this.state.hookI;
    const hook = L.hero.hooks[hookI % L.hero.hooks.length];
    const anim = hookI % 2 ? 'mLetterB' : 'mLetter';
    // Das Wort traegt die Farbe seines Gegenstands, wie oben auf dem Desktop.
    // Der Wechsel blendet ueber, er springt nicht: 0,62 s, dieselbe Dauer wie
    // die Buchstabenwalze.
    const objekt = MOBJEKTE[MWORT_OBJ[hookI % MWORT_OBJ.length]];
    return (
      <section id="top" style={sx('position:relative;overflow:hidden')}>
        <div style={sx('position:relative;padding:28px 20px 34px')}>
<p style={sx(`margin:0 0 14px;font-size:11px;font-weight:900;letter-spacing:.2em;text-transform:uppercase;color:rgba(246,239,230,.62);animation:mRise .8s ${EASE} both`)}>{L.hero.kicker}</p>
          <h1 style={sx("margin:0;font-family:'League Spartan',sans-serif;font-weight:900;font-size:44px;line-height:.94;letter-spacing:-.03em")}>
            <span style={sx('display:block;padding:.14em .1em .06em;margin:-.14em -.1em -.06em;overflow:hidden;white-space:nowrap')}>
              {hook.split('').map((ch, j) => (
                <span key={`${hookI}-${j}`} style={sx(`display:inline-block;color:${objekt.farbe};transition:color .62s linear;animation:${anim} 1.05s ${EASE} both ${(j * 0.07).toFixed(3)}s`)}>{ch === ' ' ? ' ' : ch}</span>
              ))}
            </span>
            <span style={sx(`display:block;animation:mRise .8s ${EASE} both .12s`)}>{L.hero.rest}</span>
          </h1>
          <p style={sx(`margin:16px 0 0;font-size:16.5px;line-height:1.55;font-weight:600;color:rgba(246,239,230,.78);text-wrap:pretty;animation:mRise .8s ${EASE} both .1s`)}>{L.hero.sub}</p>
          {/* Hier stand eine zweite Unterzeile: "Ich bringe Beamer, Sound und
              Moderation. Ihr spielt direkt am Handy, ihr braucht nur eine
              freie Wand."
              Wolf am 28.08.: "was macht der ganze text da? gleich mal mit
              desktop ab, der meiste text ist weg". Er hat recht, und zwar
              doppelt: der Desktop hat im Kopf nur Kicker, Ueberschrift und
              eine Unterzeile, und der Satz selbst steht weiter unten schon
              einmal, als Ueberschrift von 04 samt Aufzaehlung. Zweimal
              dasselbe auf einem Bildschirm, den man erst durchscrollen muss,
              ist kein Nachdruck, sondern Fuellung. */}
          {/* Die Gegenstaende. Antippen waehlt das Wort -- auf dem Desktop
              macht das der Zeiger, hier gibt es keinen. Was gerade gemeint
              ist, steht vorn: etwas groesser, volle Helligkeit, ein Schein in
              seiner Farbe und die oberste Ebene. Die anderen treten ueber
              Helligkeit zurueck, nicht ueber Durchsichtigkeit; durchsichtig
              hiesse "weiter weg" und wuerde genau die Tiefenstaffelung
              verwischen, die das Bild traegt. */}
          <div style={sx(`position:relative;margin-top:20px;width:100%;aspect-ratio:350/168;animation:mRise .8s ${EASE} both .16s`)}>
            {MOBJEKTE.map((o, i) => {
              const wach = i === MWORT_OBJ[hookI % MWORT_OBJ.length];
              return (
                <button key={i} type="button" onClick={() => this.hookWaehlen(o.wort)}
                  aria-label={L.hero.hooks[o.wort]}
                  style={sx(`position:absolute;left:${o.l}%;top:${o.t}%;width:${o.gr}%;aspect-ratio:1;`
                    + `padding:0;border:none;background:none;line-height:0;cursor:pointer;`
                    + `z-index:${wach ? 9 : o.z};`
                    + `transform:rotate(${o.r}deg) scale(${wach ? 1.08 : 1});transition:transform .34s ${EASE}`)}>
                  <span style={sx('display:block;' + teammarke(o.farbe, o.av, 60)
                    + 'width:100%;height:100%;background-size:90% auto,auto;border-radius:16%;'
                    + `filter:brightness(${wach ? 1.08 : 0.7});`
                    + `box-shadow:0 10px 22px rgba(0,0,0,.55)${wach ? `,0 0 26px ${o.farbe}66` : ''};`
                    + `transition:filter .34s ${EASE},box-shadow .34s ${EASE}`)}></span>
                </button>
              );
            })}
          </div>
          <div style={sx(`margin-top:22px;display:flex;flex-direction:column;gap:11px;animation:mRise .8s ${EASE} both .18s`)}>
            <a href="#anfragen" onClick={() => this.setState({ tab: 'test', formStatus: 'idle' })}
              style={sx('display:flex;flex-direction:column;align-items:center;gap:3px;padding:16px 20px;border-radius:18px;background:#F6EFE6;color:#0A0814;font-weight:900;font-size:17px;min-height:56px;box-sizing:border-box;justify-content:center;'
                // Der Knopf bleibt creme, er ist der Hauptweg und darf
                // nicht die Farbe wechseln. Er bekommt nur einen Schein in
                // der Farbe des Wortes, damit der Faden von oben bis hierher
                // sichtbar bleibt: ein Wort, ein Gegenstand, ein Knopf.
                + `box-shadow:0 10px 26px rgba(0,0,0,.5),0 6px 34px ${objekt.farbe}3d;transition:box-shadow .62s linear`)}>
              {L.hero.cta}<span style={sx('font-size:13px;font-weight:800;opacity:.72')}>{L.hero.ctaSub}</span>
            </a>
            <div style={sx('display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap')}>
              <span style={sx('font-size:14.5px;font-weight:600;color:rgba(246,239,230,.62)')}>{L.hero.bookQ}</span>
              <a href="#anfragen" onClick={() => this.setState({ tab: 'event', formStatus: 'idle' })}
                style={sx('display:inline-flex;align-items:center;min-height:44px;padding:0 16px;border-radius:999px;border:1px solid rgba(246,239,230,.38);color:#F6EFE6;font-weight:800;font-size:14.5px')}>{L.hero.bookCta}</a>
            </div>
          </div>
          <div style={sx('margin-top:22px;display:flex;align-items:center;gap:9px;font-size:14px;font-weight:700;letter-spacing:.01em;color:rgba(246,239,230,.72)')}>
            <span style={sx(`flex:none;width:7px;height:7px;border-radius:50%;background:${objekt.farbe};transition:background .62s linear`)}></span>
            <span style={sx('text-wrap:pretty')}>{L.hero.avail}</span>
          </div>
        </div>
      </section>
    );
  }

  renderModes() {
    const L = this.T;
    const s = this.state;
    const acts = s.acts;
    const GS = GRID;
    const owner = BOARD.map((b, i) => {
      const ov = acts[i];
      if (ov) return ov.id;
      return i < s.step ? b : '';
    });
    const at = (r: number, c: number) => (r < 0 || c < 0 || r >= GS || c >= GS) ? null : owner[r * GS + c];
    const actTeam = s.act >= 0 ? TEAMS.find(t => t.id === ACTIONS[s.act].id) : null;

    /* Wolf am 28.08.: "die sektionen direkt unter dem hero sehen noch
          nicht aus wie in desktop, geh bitte alles stueck fuer stueck durch".

          Der groesste Unterschied war nicht die Farbe, sondern die Bauart.
          Hier standen zwei Klappkarten: eine offen, eine zu, mit Pluszeichen
          und der Zeile "Tippt einen Modus an". Der Desktop zeigt beide Zeilen
          offen. Wer aufklappen muss, sieht das Brett und die Wappen nie, und
          genau die sind das Beste an dem Abschnitt. Also weg mit der Klappe:
          zwei Bloecke untereinander, durch Haarlinien getrennt, wie die zwei
          Zeilen oben.

          Dazu die Reihenfolge des Desktops in jedem Block: Name, Reichweite,
          Absatz, drei Striche, dann der Gegenstand -- fuer CozyQuiz die
          Avatarwand und das Brett, fuer CrowdQuiz das Wappenfeld. */
    return (
      <section id="spielarten" style={sx('padding:14px 20px 42px;border-top:1px solid rgba(246,239,230,.10)')}>
        {this.kicker('[ 01 ]', L.modes.label)}
        <h2 data-rv="" style={sx("margin:0 0 26px;font-family:'League Spartan',sans-serif;font-size:29px;font-weight:900;letter-spacing:-.015em")}>{L.modes.h2}</h2>

        <div data-rv="" style={sx('padding:22px 0;border-top:1px solid rgba(246,239,230,.14)')}>
          <div style={sx("font-family:'League Spartan',sans-serif;font-size:30px;font-weight:900;line-height:.9;letter-spacing:-.03em;color:#F6EFE6")}>CozyQuiz</div>
          <div style={sx('margin-top:10px;font-size:11.5px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;color:rgba(246,239,230,.62)')}>{L.modes.quizChip}</div>
          <p style={sx('margin:14px 0 0;font-size:15.5px;line-height:1.55;font-weight:500;color:rgba(246,239,230,.82);text-wrap:pretty')}>{L.modes.quizP}</p>
          <div style={sx('margin-top:16px;display:flex;flex-direction:column;gap:11px')}>
            {L.modes.quizBullets.map(b => this.bullet(b, AKZENT))}
          </div>
          {this.renderAvatarWand()}
          <div style={sx('margin-top:20px;display:flex;align-items:center;gap:9px')}>
            <div style={sx('display:flex')}>
              {TEAMS.map((t, i) => (
                <span key={t.id} style={sx(teammarke(t.color, t.av, 32) + `border:2px solid #0f0a1a;margin-left:${i ? '-10px' : '0'};`)}></span>
              ))}
            </div>
            <span style={sx('font-size:12.5px;font-weight:800;letter-spacing:.04em;color:rgba(246,239,230,.5)')}>{L.modes.quizTeams}</span>
          </div>
            <div style={sx('width:100%;max-width:246px;margin:4px auto 0')}>
              <div style={sx(`padding:9px;border-radius:16px;background:rgba(246,239,230,.015);border:1.5px solid ${actTeam ? actTeam.color : 'rgba(246,239,230,.1)'};box-shadow:${actTeam ? '0 0 24px ' + actTeam.color + '44' : 'none'};transition:border-color .5s ease,box-shadow .5s ease`)}>
                <div style={sx(`display:grid;grid-template-columns:repeat(${GS},1fr);gap:0.72%`)}>
                  {owner.map((id, i) => {
                    const ov = acts[i];
                    const t = id ? TEAMS.find(x => x.id === id) : null;
                    const cellBase = 'position:relative;aspect-ratio:1;box-sizing:border-box;display:flex;align-items:center;justify-content:center;transition:background .45s ' + EASE + ',box-shadow .45s ' + EASE + ';';
                    if (!t) return <span key={i} style={sx(cellBase + 'border-radius:16%;background:rgba(246,239,230,.05);border:1px solid rgba(246,239,230,.20)')}></span>;
                    const r = Math.floor(i / GS), c = i % GS, col = t.color;
                    const nT = at(r - 1, c) === id, nR = at(r, c + 1) === id, nB = at(r + 1, c) === id, nL = at(r, c - 1) === id;
                    const rTL = (nT || nL) ? '0' : '16%', rTR = (nT || nR) ? '0' : '16%', rBR = (nB || nR) ? '0' : '16%', rBL = (nB || nL) ? '0' : '16%';
                    // Steg ueber den Rasterabstand zum gleichfarbigen Nachbarn.
                    // So lang wie die Zellkante ohne ihre beiden Rundungen,
                    // sonst schoebe er sich ueber die Ecke hinaus. Gezeichnet
                    // wird nur nach rechts und unten, sonst doppelt sich jede
                    // Verbindung.
                    const bruecke = `position:absolute;background:${col};z-index:2;pointer-events:none;`;
                    const steg = '68%';   // Zellkante ohne die beiden 16-Prozent-Rundungen
                    const fresh = !!ov;
                    const isStack = !!ov && ov.kind === 'stack';
                    const shadow = [
                      nT ? '' : 'inset 0 1px 0 rgba(246,239,230,.22)',
                      nB ? '' : 'inset 0 -3px 0 rgba(0,0,0,.2)',
                      (nR && nB) ? '' : `${nR ? 0 : 2}px ${nB ? 0 : 3}px 0 rgba(0,0,0,.45)`,
                      '0 5px 9px rgba(0,0,0,.3)',
                      fresh ? `0 0 22px ${col}bb` : '',
                      isStack ? `0 0 16px ${col}77` : '',
                    ].filter(Boolean).join(',');
                    const edge = (fused: boolean) => fused ? 'none' : `1px solid ${col}${fresh ? 'ff' : '55'}`;
                    return (
                      <span key={i} style={sx(cellBase
                        + `border-radius:${rTL} ${rTR} ${rBR} ${rBL};background:${col};box-shadow:${shadow};`
                        + `border-top:${edge(nT)};border-right:${edge(nR)};border-bottom:${edge(nB)};border-left:${edge(nL)}`)}>
                        <span style={sx(`width:${(motivAnteil(t.av) * 100).toFixed(0)}%;height:${(motivAnteil(t.av) * 100).toFixed(0)}%;background:url(${t.av}) center/contain no-repeat;animation:${ov && ov.kind === 'joker' ? 'mFlip .8s ' + EASE + ' both' : 'mPop .42s cubic-bezier(.34,1.56,.64,1) both'}`)}></span>
                        {isStack && <span style={sx(`position:absolute;right:6%;bottom:6%;width:${(motivAnteil(t.av) * 52).toFixed(0)}%;height:${(motivAnteil(t.av) * 52).toFixed(0)}%;background:url(${t.av}) center/contain no-repeat;animation:mPop .5s cubic-bezier(.34,1.56,.64,1) both .12s`)}></span>}
                        {nR && <span style={sx(bruecke + `right:-3.8%;top:16%;width:4.2%;height:${steg}`)}></span>}
                        {nB && <span style={sx(bruecke + `bottom:-3.8%;left:16%;height:4.2%;width:${steg}`)}></span>}
                        {!!ov && (ov.kind === 'steal' || ov.kind === 'joker') && <span style={sx(`position:absolute;inset:-3px;border-radius:20%;border:2px solid ${col};pointer-events:none;animation:mBurst .7s ease-out both`)}></span>}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          <div style={sx(`margin-top:12px;min-height:38px;display:flex;align-items:center;justify-content:center;text-align:center;font-size:13.5px;font-weight:900;line-height:1.4;color:${s.act < 0 ? 'rgba(246,239,230,.5)' : (actTeam ? actTeam.color : 'rgba(246,239,230,.5)')};transition:color .4s ease`)}>
            {s.act < 0 ? L.modes.actIdle : L.modes.actions[s.act]}
          </div>
        </div>

        <div data-rv="" style={sx('padding:22px 0;border-top:1px solid rgba(246,239,230,.14);border-bottom:1px solid rgba(246,239,230,.14)')}>
          <div style={sx("font-family:'League Spartan',sans-serif;font-size:30px;font-weight:900;line-height:.9;letter-spacing:-.03em;color:#F6EFE6")}>CrowdQuiz</div>
          <div style={sx('margin-top:10px;font-size:11.5px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;color:rgba(246,239,230,.62)')}>{L.modes.arenaChip}</div>
          <p style={sx('margin:14px 0 0;font-size:15.5px;line-height:1.55;font-weight:500;color:rgba(246,239,230,.82);text-wrap:pretty')}>{L.modes.arenaP}</p>
          <div style={sx('margin-top:16px;display:flex;flex-direction:column;gap:11px')}>
            {L.modes.arenaBullets.map(b => this.bullet(b, '#FACC15'))}
          </div>
          {this.renderFrakFeld()}
        </div>
      </section>
    );
  }

  renderProbe() {
    const L = this.T;
    const s = this.state;
    const C: MobileCat = L.probe.cats[s.cat];
    const N: MobileCat = L.probe.cats[(s.cat + 1) % L.probe.cats.length];

    let body: ReactNode = null;
    let hint = '', hintCol = 'rgba(246,239,230,.5)';

    if (C.kind === 'pick') {
      if (s.picked !== null) {
        const right = s.picked === C.correct;
        hint = (right ? L.probe.right : L.probe.wrong) + C.fact;
        hintCol = right ? '#34D399' : 'rgba(246,239,230,.62)';
      } else hint = L.probe.tapHint;
      body = (
        <>
          {C.photo && <img src="/assets/kolosseum.webp" loading="lazy" decoding="async" alt="" style={sx('display:block;width:100%;height:130px;margin-bottom:12px;object-fit:cover;border-radius:14px')} />}
          <div style={sx('font-size:17px;font-weight:900;line-height:1.35;text-wrap:pretty')}>{C.q}</div>
          <div style={sx('margin-top:16px;display:flex;flex-direction:column;gap:9px')}>
            {C.opts.map((o, i) => {
              const done = s.picked !== null, right = i === C.correct, chosen = i === s.picked;
              const bg = !done ? 'rgba(246,239,230,.04)' : right ? 'rgba(52,211,153,.14)' : chosen ? 'rgba(248,113,113,.12)' : 'rgba(246,239,230,.03)';
              const bd = !done ? 'rgba(246,239,230,.1)' : right ? 'rgba(52,211,153,.5)' : chosen ? 'rgba(248,113,113,.45)' : 'rgba(246,239,230,.07)';
              return (
                <button key={i} type="button" onClick={() => { if (s.picked !== null) return; this.setState({ picked: i }); this.nextCat(4200); }}
                  style={sx(`display:flex;align-items:center;gap:12px;width:100%;box-sizing:border-box;min-height:54px;padding:0 14px;border-radius:15px;cursor:pointer;text-align:left;background:${bg};border:1.5px solid ${bd};color:#F6EFE6;transition:background .35s ease,border-color .35s ease`)}>
                  <span style={sx(`flex:none;width:26px;height:26px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:12.5px;font-weight:900;background:${C.col}26;color:${C.col}`)}>{i + 1}</span>
                  <span style={sx('flex:1;text-align:left;font-size:15px;font-weight:800;line-height:1.3')}>{o}</span>
                  <span style={sx(`flex:none;font-size:16px;font-weight:900;color:${right ? '#34D399' : '#F87171'}`)}>{s.picked !== null && right ? '✓' : s.picked !== null && chosen ? '✕' : ''}</span>
                </button>
              );
            })}
          </div>
        </>
      );
    }

    if (C.kind === 'guess') {
      const g = s.guess, done = s.guessDone;
      const d = Math.abs(g - C.target), near = d <= 12;
      hint = done ? L.probe.guessResult(C.target, d, near) : L.probe.guessHint;
      hintCol = done && near ? '#34D399' : 'rgba(246,239,230,.62)';
      body = (
        <>
          <div style={sx('display:flex;align-items:center;gap:14px')}>
            <img src="/assets/skelett.webp" loading="lazy" decoding="async" alt="" style={sx('flex:none;height:150px;width:auto;display:block')} />
            <div style={sx('flex:1;min-width:0;font-size:17px;font-weight:900;line-height:1.35;text-wrap:pretty')}>{C.q}</div>
          </div>
          <div style={sx('margin-top:16px;display:flex;align-items:baseline;justify-content:center;gap:8px')}>
            <span style={sx(`font-family:'League Spartan',sans-serif;font-size:42px;font-weight:900;line-height:1;color:${done ? (near ? '#34D399' : '#F59E0B') : '#F59E0B'}`)}>{g}</span>
            <span style={sx('font-size:14px;font-weight:800;color:rgba(246,239,230,.62)')}>{L.probe.bones}</span>
          </div>
          <input type="range" min={80} max={400} step={1} value={g} aria-label={C.q}
            onChange={e => { if (done) return; clearTimeout(this._catT); this.setState({ guess: +e.target.value }); }}
            style={sx('width:100%;margin:14px 0 0;accent-color:#F59E0B;height:34px')} />
          <button type="button" onClick={() => { if (done) return; this.setState({ guessDone: true }); this.nextCat(4200); }}
            style={sx(`width:100%;min-height:50px;margin-top:10px;border:0;border-radius:15px;cursor:pointer;font-size:15.5px;font-weight:900;background:${done ? 'rgba(246,239,230,.06)' : '#F59E0B'};color:${done ? 'rgba(246,239,230,.78)' : '#0A0814'}`)}>
            {done ? L.probe.guessNext : L.probe.guessBtn}
          </button>
        </>
      );
    }

    if (C.kind === 'points') {
      const pts = s.pts, used = pts.reduce((a, b) => a + b, 0), left = 10 - used;
      if (s.ptsDone) {
        const on = pts[C.correct];
        hint = L.probe.pointsResult(on);
        hintCol = on >= 6 ? '#34D399' : 'rgba(246,239,230,.62)';
      } else hint = L.probe.pointsHint;
      body = (
        <>
          <div style={sx('font-size:17px;font-weight:900;line-height:1.35;text-wrap:pretty')}>{C.q}</div>
          <div style={sx('margin-top:16px;display:flex;flex-direction:column;gap:10px')}>
            {C.opts.map((o, i) => (
              <div key={i} style={sx(`display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:15px;background:${s.ptsDone && i === C.correct ? 'rgba(52,211,153,.14)' : 'rgba(246,239,230,.04)'};border:1.5px solid ${s.ptsDone && i === C.correct ? 'rgba(52,211,153,.5)' : 'rgba(246,239,230,.1)'};transition:background .4s ease,border-color .4s ease`)}>
                <span style={sx('flex:1;min-width:0;font-size:15px;font-weight:800')}>{o}</span>
                <button type="button" onClick={() => { if (s.ptsDone) return; clearTimeout(this._catT); this.setState(p => { const n = [...p.pts]; if (n[i] > 0) n[i]--; return { pts: n, ptsDone: false }; }); }}
                  style={sx('flex:none;width:38px;height:38px;border-radius:12px;border:1px solid rgba(246,239,230,.38);background:rgba(246,239,230,.05);color:#F6EFE6;font-size:19px;font-weight:900;cursor:pointer')}>−</button>
                <span style={sx('flex:none;width:26px;text-align:center;font-size:17px;font-weight:900;color:#F6EFE6')}>{pts[i]}</span>
                <button type="button" onClick={() => {
                  if (s.ptsDone) return;
                  const n = [...s.pts];
                  if (n.reduce((a, b) => a + b, 0) >= 10) return;
                  n[i]++;
                  const fin = n.reduce((a, b) => a + b, 0) === 10;
                  // Weiterschalten ausserhalb des Updaters: Seiteneffekte in
                  // setState-Updatern werden von React ggf. verworfen/doppelt
                  // ausgefuehrt, dann loopt die Demo statt zu enden.
                  this.setState({ pts: n, ptsDone: fin });
                  if (fin) this.nextCat(4200);
                }}
                  style={sx('flex:none;width:38px;height:38px;border-radius:12px;border:1px solid rgba(246,239,230,.38);background:rgba(246,239,230,.05);color:#F6EFE6;font-size:19px;font-weight:900;cursor:pointer')}>+</button>
              </div>
            ))}
          </div>
          <div style={sx(`margin-top:12px;text-align:center;font-size:13px;font-weight:900;letter-spacing:.06em;color:${left > 0 ? 'rgba(246,239,230,.62)' : '#22C55E'}`)}>
            {left > 0 ? L.probe.pointsLeft(left) : L.probe.pointsAllSet}
          </div>
        </>
      );
    }

    const skip = () => {
      clearInterval(this._cdT);
      this.setState(p => ({ splash: false, count: 3, cat: (p.cat + 1) % L.probe.cats.length, picked: null, guess: 180, guessDone: false, pts: [0, 0, 0], ptsDone: false }));
    };

    return (
      <section id="probieren" style={sx('padding:36px 20px 42px;border-top:1px solid rgba(246,239,230,.10);background:radial-gradient(ellipse at 50% 0%,rgba(246,239,230,.04),transparent 62%)')}>
        {this.kicker('[ 03 ]', L.probe.label)}
        <h2 data-rv="" style={sx("margin:0 0 10px;font-family:'League Spartan',sans-serif;font-size:29px;font-weight:900;letter-spacing:-.015em;text-wrap:balance")}>{L.probe.h2}</h2>
        {/* Dieselbe Reihenfolge wie auf dem Desktop: Ueberschrift, die kurze
            Zeile mit der Zahl, dann der Absatz. Der Absatz ist nicht woertlich
            derselbe -- auf dem Desktop sucht man sich einen Fragetyp aus, hier
            laeuft die Runde von selbst durch. Ein Text, der zum Antippen einer
            Liste auffordert, die es nicht gibt, waere schlimmer als eine
            Abweichung. */}
        <div data-rv="" style={sx('margin:0 0 8px;font-size:15.5px;line-height:1.6;color:rgba(246,239,230,.62);font-weight:600')}>{L.probe.kicker}</div>
        <p data-rv="" style={sx('margin:0 0 16px;font-size:15.5px;line-height:1.6;color:rgba(246,239,230,.78);font-weight:600;text-wrap:pretty')}>{L.probe.sub}</p>
        {/* Die fuenf Fragetypen als Zeile, der laufende hell. Auf dem Desktop
            steht dort eine Liste zum Auswaehlen; hier waehlt der Ablauf, also
            zeigt die Zeile, wo man gerade ist. Ohne sie ist "Fuenf Fragetypen"
            eine Behauptung, die man erst nach fuenf Runden nachpruefen kann. */}
        <div data-rv="" aria-hidden="true" style={sx('margin:0 0 18px;display:flex;align-items:center;justify-content:space-between;gap:8px')}>
          {L.probe.cats.map((c, i) => {
            const hier = !s.done && i === s.cat;
            const durch = s.done || i < s.cat;
            return (
              <span key={c.key} style={sx('flex:1;display:flex;flex-direction:column;align-items:center;gap:7px;min-width:0')}>
                <span style={sx(`display:block;width:100%;max-width:38px;aspect-ratio:1;background:url(${c.icon}) center/contain no-repeat;`
                  + `filter:brightness(${hier ? 1.1 : durch ? 0.9 : 0.55});transform:scale(${hier ? 1.12 : 1});`
                  + `transition:filter .4s ${EASE},transform .4s ${EASE}`)}></span>
                <span style={sx(`display:block;width:100%;height:2px;border-radius:2px;background:${hier ? c.col : durch ? 'rgba(246,239,230,.28)' : 'rgba(246,239,230,.10)'};transition:background .4s ${EASE}`)}></span>
              </span>
            );
          })}
        </div>

        {s.done && (
          <div style={sx('border-radius:26px;padding:34px 22px 28px;background:radial-gradient(ellipse at 50% 34%,rgba(246,239,230,.05),#0b0714 70%);border:1px solid rgba(246,239,230,.20);box-shadow:0 18px 44px rgba(0,0,0,.45);display:flex;flex-direction:column;align-items:center;min-height:470px;box-sizing:border-box;justify-content:center;text-align:center')}>
            <div style={sx('display:flex;gap:10px;justify-content:center')}>
              {L.probe.cats.map(c => (
                <span key={c.key} style={sx(`display:block;width:44px;height:44px;background:url(${c.icon}) center/contain no-repeat;filter:drop-shadow(0 4px 14px rgba(0,0,0,.5))`)}></span>
              ))}
            </div>
            <div style={sx('margin-top:18px;font-size:11px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;color:rgba(246,239,230,.62)')}>{L.probe.doneKicker}</div>
            <div style={sx("margin-top:8px;font-family:'League Spartan',sans-serif;font-size:24px;font-weight:900;line-height:1.15;color:#F6EFE6;text-wrap:balance")}>{L.probe.doneTitle}</div>
            <p style={sx('margin:12px 0 0;font-size:15px;line-height:1.6;font-weight:600;color:rgba(246,239,230,.78);text-wrap:pretty')}>{L.probe.doneText}</p>
            <a href="#anfragen" onClick={() => this.setState({ tab: 'test', formStatus: 'idle' })}
              style={sx('margin-top:22px;display:flex;align-items:center;justify-content:center;width:100%;box-sizing:border-box;min-height:54px;padding:0 20px;border-radius:18px;background:#F6EFE6;color:#0A0814;font-weight:900;font-size:16px;box-shadow:0 10px 26px rgba(0,0,0,.5)')}>{L.probe.doneCta}</a>
            <button type="button"
              onClick={() => { clearTimeout(this._catT); clearInterval(this._cdT); this.setState({ done: false, splash: false, count: 3, cat: 0, picked: null, guess: 180, guessDone: false, pts: [0, 0, 0], ptsDone: false }); }}
              style={sx('margin-top:10px;display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:0 18px;border-radius:999px;border:1px solid rgba(246,239,230,.38);background:transparent;color:#F6EFE6;font-weight:800;font-size:14.5px;cursor:pointer')}>{L.probe.doneAgain}</button>
          </div>
        )}

        {!s.done && s.splash && (
          <div role="status" aria-live="polite" onClick={skip}
            style={sx(`border-radius:26px;padding:34px 22px 26px;background:radial-gradient(ellipse at 50% 34%,${N.col}22,#0b0714 70%);border:1px solid ${N.col}55;box-shadow:0 18px 44px rgba(0,0,0,.45);display:flex;flex-direction:column;align-items:center;min-height:470px;box-sizing:border-box;justify-content:center`)}>
            <span aria-hidden="true" style={sx(`flex:none;display:block;width:92px;height:92px;background:url(${N.icon}) center/contain no-repeat;filter:drop-shadow(0 6px 22px rgba(0,0,0,.5))`)}></span>
            <div style={sx(`margin-top:16px;font-family:'League Spartan',sans-serif;font-size:38px;font-weight:900;letter-spacing:-.02em;line-height:1;color:${N.col}`)}>{N.name}</div>
            <div style={sx('margin-top:8px;font-size:15px;line-height:1.5;font-weight:800;color:rgba(246,239,230,.78);text-align:center;text-wrap:pretty')}>{N.claim}</div>
            <div style={sx(`margin-top:22px;width:46px;height:46px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'League Spartan',sans-serif;font-size:24px;font-weight:900;color:#0A0814;background:${N.col};box-shadow:0 0 24px ${N.col}66`)}>{s.count}</div>
            <div style={sx('margin-top:12px;font-size:12.5px;font-weight:800;letter-spacing:.06em;color:rgba(246,239,230,.5)')}>{L.probe.skipHint}</div>
          </div>
        )}

        {!s.done && !s.splash && (
          <div role="region" aria-live="polite"
            style={sx(`border-radius:26px;padding:18px;min-height:470px;box-sizing:border-box;background:radial-gradient(ellipse at 50% 0%,${C.col}1f,#0b0714 62%);border:1.5px solid ${C.col}66;box-shadow:0 18px 44px rgba(0,0,0,.45),0 0 26px ${C.col}22;transition:border-color .5s ease,box-shadow .5s ease,background .5s ease`)}>
            <div style={sx('display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px')}>
              <span style={sx(`padding:6px 13px;border-radius:999px;background:${C.col}22;border:1px solid ${C.col}66;font-size:11.5px;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:${C.col};white-space:nowrap;flex:none`)}>{C.name}</span>
              <span style={sx('font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:rgba(246,239,230,.5)')}>{`${L.probe.progress(s.cat + 1, L.probe.cats.length)} · ${L.probe.team}`}</span>
            </div>
            <div style={sx('font-size:14px;font-weight:800;line-height:1.4;color:rgba(246,239,230,.62);margin-bottom:14px')}>{C.claim}</div>
            {body}
            <div style={sx(`margin-top:14px;font-size:13.5px;line-height:1.55;font-weight:700;color:${hintCol};text-wrap:pretty`)}>{hint}</div>
          </div>
        )}
        {/* Die zwei Haken vom Desktop. Sie beantworten die zwei Fragen, die
            jeder stellt, bevor er zusagt: muss ich etwas installieren, und
            wird das nicht schnell langweilig. */}
        <div data-rv="" style={sx('margin-top:18px;display:flex;flex-direction:column;gap:9px')}>
          {[L.probe.check1, L.probe.check2].map(t => (
            <span key={t} style={sx('display:flex;gap:11px;font-size:14.5px;line-height:1.45;font-weight:700;color:#F6EFE6;text-wrap:pretty')}>
              <span style={sx('flex:none;color:#22C55E;font-weight:900')}>✓</span>{t}
            </span>
          ))}
        </div>
      </section>
    );
  }

  /**
   * Anlaesse, aufgebaut wie die Zeilen auf dem Desktop.
   *
   * Vorher waren es Karten mit Rahmen, einem Rangzeichen in Rosa ("01") und
   * dem kurzen Text. Der Desktop hat weder Rahmen noch Rangzeichen: Titel,
   * Anlass in Versalien, der lange Text, ein Verweis, und daneben drei
   * Gegenstaende. Das Rangzeichen war ausserdem irrefuehrend, es gibt keine
   * Reihenfolge unter den Anlaessen.
   *
   * Die drei Gegenstaende kommen mit, sie stehen hier ueber dem Text statt
   * daneben -- auf 350 px gibt es keine dritte Spalte. Ohne Auffaechern beim
   * Zeigen, das haengt am Zeiger.
   */
  renderAnlaesse() {
    const L = this.T;
    return (
      <section id="anlaesse" style={sx('padding:36px 20px 42px;border-top:1px solid rgba(246,239,230,.10)')}>
        {this.kicker('[ 02 ]', L.anlaesse.label)}
        <h2 data-rv="" style={sx("margin:0 0 10px;font-family:'League Spartan',sans-serif;font-size:29px;font-weight:900;letter-spacing:-.015em")}>{L.anlaesse.h2}</h2>
        <p data-rv="" style={sx('margin:0 0 8px;font-size:15.5px;line-height:1.6;color:rgba(246,239,230,.62);font-weight:600;text-wrap:pretty')}>{L.anlaesse.sub}</p>
        {L.anlaesse.cards.map((c, i) => (
          <div key={c.title} data-rv="" style={sx(`padding:24px 0;border-top:1px solid rgba(246,239,230,.14)${i === L.anlaesse.cards.length - 1 ? ';border-bottom:1px solid rgba(246,239,230,.14)' : ''}`)}>
            <div aria-hidden="true" style={sx('position:relative;width:100%;max-width:190px;margin:0 0 16px;aspect-ratio:1/1')}>
              {ANLASS_GRUPPEN[i].map(o => (
                <span key={o.av} style={sx(`position:absolute;left:${o.x}%;top:${o.y}%;width:${o.gr}%;aspect-ratio:1/1;`
                  + `transform:rotate(${o.r}deg);background:url(${o.av}) center/contain no-repeat;`
                  + 'filter:drop-shadow(0 10px 16px rgba(0,0,0,.55))')}></span>
              ))}
            </div>
            <div style={sx("font-family:'League Spartan',sans-serif;font-size:26px;font-weight:900;line-height:.95;letter-spacing:-.028em;color:#F6EFE6;text-wrap:balance")}>{c.title}</div>
            <div style={sx('margin-top:10px;font-size:11.5px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;color:rgba(246,239,230,.62)')}>{c.badge}</div>
            <p style={sx('margin:14px 0 16px;font-size:15px;line-height:1.6;color:rgba(246,239,230,.82);font-weight:500;text-wrap:pretty')}>{c.p}</p>
            <a href="#anfragen" onClick={() => this.setState({ tab: 'event', formStatus: 'idle', anlass: this.T.form.anlassOpts[Math.min(i, 2)] })}
              style={sx('display:inline-flex;align-items:center;min-height:44px;padding:0 18px;border-radius:999px;background:rgba(246,239,230,.05);border:1px solid rgba(246,239,230,.20);color:#F6EFE6;font-weight:900;font-size:14.5px')}>{L.anlaesse.cta}</a>
          </div>
        ))}
      </section>
    );
  }

  renderAblauf() {
    const L = this.T;
    const s = this.state;
    return (
      <section id="ablauf" style={sx('padding:36px 20px 42px;border-top:1px solid rgba(246,239,230,.10)')}>
        {this.kicker('[ 04 ]', L.ablauf.label)}
        <h2 data-rv="" style={sx("margin:0 0 6px;font-family:'League Spartan',sans-serif;font-size:29px;font-weight:900;text-wrap:balance")}>{L.ablauf.h2}</h2>
        <p data-rv="" style={sx('margin:0 0 14px;font-size:15.5px;line-height:1.6;color:rgba(246,239,230,.62);font-weight:600')}>{L.ablauf.sub}</p>
        <div data-rv="" style={sx('display:inline-flex;align-items:baseline;gap:9px;padding:11px 18px;border-radius:999px;background:rgba(246,239,230,.05);border:1px solid rgba(246,239,230,.20);margin:0 0 20px')}>
          <span style={sx("font-family:'League Spartan',sans-serif;font-size:22px;font-weight:900;color:#F6EFE6;white-space:nowrap")}>{L.ablauf.priceBig}</span>
          <span style={sx('font-size:13.5px;font-weight:700;color:#F6EFE6;white-space:nowrap')}>{L.ablauf.priceSub}</span>
        </div>
        {/* Hier lagen zwei KI-Fotos: ein Raum mit Leinwand, einmal dunkel
            und einmal beleuchtet, und die Projektion als Ausschnitt darauf.
            Genau die Sorte Bild, die auf dem Desktop rausgeflogen ist, und
            ausgerechnet unter der Ueberschrift, die sagt, dass man nichts
            braucht ausser einer Wand. Ein behaupteter Raum widerspricht dem
            Satz darueber.

            Jetzt dieselbe gezeichnete Wand wie auf dem Desktop: nur die Fugen,
            dazwischen der Seitengrund, und zwei Scharen Licht, die
            gegeneinander darueberlaufen. Ohne Zeigerlicht und ohne Kippung,
            beides haengt an einer Maus. Die Projektion steht gerade statt
            schraeg -- auf 350 px Breite kostet eine Drehung nur Flaeche. */}
        <div ref={el => { this._wall = el; }} data-rv="" style={sx('position:relative;overflow:hidden;margin:0 -20px 26px;padding:34px 0 30px')}>
          {/* Die Wand. Wolke und Ziegelraster als Maske, damit sie
              unregelmaessig ausblendet und am Rand ganze Steine verschwinden
              statt halber Fugen. */}
          <div aria-hidden="true" style={sx('position:absolute;inset:-6% -4%;pointer-events:none;'
            + `mask-image:url("${WAND_RAND}"),url("${WAND_STEINE}");`
            + `-webkit-mask-image:url("${WAND_RAND}"),url("${WAND_STEINE}");`
            + 'mask-size:100% 100%,540px 216px;-webkit-mask-size:100% 100%,540px 216px;'
            + 'mask-repeat:no-repeat,repeat;-webkit-mask-repeat:no-repeat,repeat;'
            + 'mask-composite:intersect')}>
            <div style={sx('position:absolute;inset:0;'
              + `background-image:url("${WAND_FUGEN}");background-size:108px 36px;`
              + `opacity:${s.wallOn ? .38 : .24};transition:opacity 1.2s ${EASE}`)}></div>
            <div data-welle="" style={sx('position:absolute;inset:0;mix-blend-mode:screen;'
              + `background-image:url("${WAND_FUGEN}");background-size:108px 36px;`
              + `opacity:${s.wallOn ? .98 : .72};`
              + 'mask-image:repeating-linear-gradient(104deg,transparent 0px,transparent 168px,rgba(0,0,0,.26) 206px,#000 226px,rgba(0,0,0,.26) 246px,transparent 300px);'
              + '-webkit-mask-image:repeating-linear-gradient(104deg,transparent 0px,transparent 168px,rgba(0,0,0,.26) 206px,#000 226px,rgba(0,0,0,.26) 246px,transparent 300px);'
              + 'mask-size:4000px 4000px;-webkit-mask-size:4000px 4000px;mask-repeat:no-repeat;-webkit-mask-repeat:no-repeat;'
              + `animation:mWelle ${s.wallOn ? 9 : 14}s linear infinite;transition:opacity 1.2s ${EASE}`)}></div>
            <div data-netz="" style={sx('position:absolute;inset:0;mix-blend-mode:screen;'
              + `background-image:url("${WAND_FUGEN}");background-size:108px 36px;`
              + `opacity:${s.wallOn ? .72 : .52};`
              + 'mask-image:repeating-linear-gradient(166deg,transparent 0px,transparent 196px,rgba(0,0,0,.24) 236px,#000 254px,rgba(0,0,0,.24) 272px,transparent 340px);'
              + '-webkit-mask-image:repeating-linear-gradient(166deg,transparent 0px,transparent 196px,rgba(0,0,0,.24) 236px,#000 254px,rgba(0,0,0,.24) 272px,transparent 340px);'
              + 'mask-size:4000px 4000px;-webkit-mask-size:4000px 4000px;mask-repeat:no-repeat;-webkit-mask-repeat:no-repeat;'
              + `animation:mNetz ${s.wallOn ? 13 : 19}s linear infinite;transition:opacity 1.2s ${EASE}`)}></div>
          </div>

          {/* Die Projektion. In Ruhe hat sie weder Rand noch Grund: der Beamer
              ist aus, dort ist nichts ausser Wand. */}
          <div style={sx('position:relative;width:82%;margin:0 auto;aspect-ratio:16/9;border-radius:4px;overflow:hidden;container-type:inline-size;'
            + `border:1px solid ${s.wallOn ? 'rgba(246,239,230,.22)' : 'transparent'};`
            + `background:${s.wallOn ? 'radial-gradient(ellipse at 50% -10%,rgba(246,239,230,.10),transparent 55%),radial-gradient(ellipse at 85% 110%,rgba(99,102,241,.08),transparent 55%),#120F18' : 'transparent'};`
            + `box-shadow:${s.wallOn ? '0 0 60px rgba(255,242,250,.06)' : 'none'};`
            + `transition:border-color .9s ${EASE},box-shadow 1.1s ${EASE},background .9s ${EASE}`)}>
            {/* In Ruhe steht dort, was zu tun ist. */}
            <div aria-hidden={s.wallOn} style={sx('position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;'
              + `opacity:${s.wallOn ? 0 : 1};transition:opacity .5s ${EASE}`)}>
              <span style={sx('padding:2.4cqw 4cqw;border-radius:999px;border:1px solid rgba(246,239,230,.18);background:rgba(246,239,230,.04);font-size:3.4cqw;font-weight:800;color:rgba(246,239,230,.62);white-space:nowrap')}>{L.ablauf.wallAltOff}</span>
            </div>
            {/* Die Funken der Begruessungsfolie, warm wie in der App. */}
            <div aria-hidden="true" style={sx(`position:absolute;inset:0;overflow:hidden;pointer-events:none;opacity:${s.wallOn ? 1 : 0};transition:opacity .9s ${EASE} ${s.wallOn ? '.6s' : '0s'}`)}>
              {MFUNKEN.map((f, i) => (
                <span key={i} data-funke="" style={sx(`position:absolute;left:${f.x}%;top:${f.y}%;width:${f.g}px;height:${f.g}px;border-radius:50%;`
                  + `background:rgba(247,228,168,${f.o});box-shadow:0 0 6px rgba(247,228,168,.55);animation:mFunke 5.4s ease-in-out ${f.d}s infinite`)}></span>
              ))}
              <video ref={el => { this._wolfV = el; }}
                src="/assets/wolf-willkommen.webm" poster="/assets/wolf-3d.webp"
                muted playsInline preload="none"
                style={sx('position:absolute;left:-3%;bottom:-4%;height:74%;width:auto;filter:drop-shadow(0 6px 14px rgba(0,0,0,.55))')} />
              <div style={sx('position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1.4cqw;padding:0 5cqw 0 30cqw;box-sizing:border-box')}>
                <span style={sx('font-size:2.6cqw;font-weight:900;letter-spacing:.2em;text-transform:uppercase;color:rgba(246,239,230,.78);white-space:nowrap')}>{L.ablauf.welcomeKicker}</span>
                <span style={sx("font-family:'League Spartan',sans-serif;font-size:9.2cqw;font-weight:900;letter-spacing:.05em;line-height:.92;color:#F6EFE6;text-transform:uppercase")}>{L.ablauf.welcomeTitle}</span>
                <span style={sx('margin-top:1.2cqw;font-size:3cqw;font-weight:900;line-height:1.3;color:#F6EFE6;text-align:center;text-wrap:balance')}>{L.ablauf.welcomeSub}</span>
              </div>
            </div>
            {/* Das Aufflackern der Lampe. Kein eigener Eckradius, den schneidet
                der Kasten -- sonst blieben in den vier Ecken dunkle Zwickel. */}
            <div aria-hidden="true" style={sx('position:absolute;inset:0;pointer-events:none;opacity:0;background:linear-gradient(160deg,#efe4dc,#cdbfcb);'
              + `animation:${s.wallOn ? 'mBeam 1.9s cubic-bezier(.4,0,.3,1) both' : 'none'}`)}></div>
          </div>
        </div>
        <div data-rv="" style={sx('padding:20px;border-radius:20px;background:rgba(246,239,230,.05);border:1px solid rgba(246,239,230,.20);display:flex;flex-direction:column;gap:16px')}>
          <div style={sx('display:flex;gap:12px')}>
            <span style={sx('flex:none;width:16px;height:1px;background:rgba(246,239,230,.62);margin-top:12px')}></span>
            <span style={sx('flex:1;font-size:15.5px;line-height:1.55;font-weight:700;color:#F6EFE6')}><strong style={sx('color:#F6EFE6')}>{L.ablauf.bringT}</strong> {L.ablauf.bring}</span>
          </div>
          <div style={sx('display:flex;gap:12px')}>
            <span style={sx('flex:none;width:16px;height:1px;background:rgba(246,239,230,.32);margin-top:12px')}></span>
            <span style={sx('flex:1;font-size:15.5px;line-height:1.55;font-weight:700;color:rgba(246,239,230,.78)')}><strong style={sx('color:#F6EFE6')}>{L.ablauf.needT}</strong> {L.ablauf.need}</span>
          </div>
        </div>
      </section>
    );
  }

  /**
   * Ueber mich.
   *
   * Vorher faecherten beim Hereinscrollen zwei weitere Fotos hinter dem
   * Portraet auf, und Portraet wie Zitat trugen Rosa. Auf dem Desktop ist
   * beides am 27.08. geflogen, mit einer Begruendung, die hier genauso gilt:
   * die zwei Nebenbilder waren Schmuck, der aufsprang und sonst nichts sagte,
   * und der Ring hat Rosa genau dort gesetzt, wo es raus soll. Uebrig bleibt
   * ein rundes Foto mit einer Haarlinie, wie jede andere Kante der Seite.
   *
   * Im Zitat traegt jetzt die Helligkeit die Betonung statt einer zweiten
   * Farbe: das Hervorgehobene in vollem Creme, der Rest gedaempft. Ohne
   * Zeigeeffekt, den gibt es hier nicht.
   */
  renderJohannes() {
    const L = this.T;
    return (
      <section id="johannes" style={sx('padding:36px 20px 42px;border-top:1px solid rgba(246,239,230,.10)')}>
        <div data-rv="" style={sx('display:flex;flex-direction:column;align-items:center;text-align:center;gap:14px')}>
          <img src="/assets/johannes-rund.webp" loading="lazy" decoding="async" width={440} height={440} alt={L.johannes.photoAlt}
            style={sx('width:170px;height:170px;border-radius:50%;object-fit:cover;object-position:center;border:1px solid rgba(246,239,230,.20);box-shadow:0 20px 40px rgba(0,0,0,.55)')} />
          <div style={sx('font-size:17px;font-weight:900;color:#F6EFE6')}>{L.johannes.name}</div>
          <div style={sx('margin-top:-6px;font-size:13.5px;font-weight:700;color:rgba(246,239,230,.62)')}>{L.johannes.role}</div>
          <div style={sx('margin-top:6px;font-size:11px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;color:rgba(246,239,230,.62)')}>{L.johannes.kicker}</div>
          <h2 style={sx("margin:4px 0 0;font-family:'League Spartan',sans-serif;font-size:23px;font-weight:900;line-height:1.24;text-wrap:pretty;hyphens:none")}>
            {L.johannes.quote.map((seg, i) => (
              <span key={i} style={sx(`color:${seg.hot ? '#F6EFE6' : 'rgba(246,239,230,.6)'}`)}>{seg.t}</span>
            ))}
          </h2>
        </div>
      </section>
    );
  }

  renderFaq() {
    const L = this.T;
    return (
      <section id="fragen" style={sx('padding:36px 20px 42px;border-top:1px solid rgba(246,239,230,.10)')}>
        {this.kicker('[ 05 ]', L.faq.label)}
        <h2 data-rv="" style={sx("margin:0 0 20px;font-family:'League Spartan',sans-serif;font-size:29px;font-weight:900")}>{L.faq.h2}</h2>
        <div data-rv="" style={sx('display:flex;flex-direction:column;gap:10px')}>
          {L.faq.items.map((item, i) => (
            <details key={i} style={sx('border-radius:16px;background:rgba(246,239,230,.03);border:1px solid rgba(246,239,230,.20);overflow:hidden')}>
              <summary style={sx('display:flex;align-items:center;gap:12px;padding:18px;min-height:56px;box-sizing:border-box;font-size:16px;font-weight:800;list-style:none;cursor:pointer')}>
                <span style={sx('flex:1')}>{item.q}</span>
                <span style={sx('font-size:19px;font-weight:900;color:#F6EFE6')}>+</span>
              </summary>
              <div style={sx('padding:0 18px 18px;font-size:15px;line-height:1.65;font-weight:600;color:rgba(246,239,230,.78)')}>{item.a}</div>
            </details>
          ))}
        </div>
      </section>
    );
  }

  renderForm() {
    const L = this.T;
    const s = this.state;
    const isTest = s.tab === 'test';
    const st = s.formStatus;
    const tab = (on: boolean) => `min-height:46px;padding:0 12px;border:0;border-radius:999px;font-size:14px;font-weight:900;cursor:pointer;background:${on ? '#F6EFE6' : 'transparent'};color:${on ? '#0A0814' : 'rgba(246,239,230,.62)'};transition:background .3s ease,color .3s ease`;
    const inputStyle = 'width:100%;box-sizing:border-box;min-height:52px;padding:0 14px;border-radius:14px;background:rgba(246,239,230,.05);border:1.5px solid rgba(246,239,230,.38);color:#F6EFE6;font-size:16px;font-weight:700;outline:none';
    const labelStyle = 'display:flex;flex-direction:column;gap:7px;font-size:12.5px;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:rgba(246,239,230,.62)';
    return (
      <section id="anfragen" style={sx('padding:36px 20px 46px;border-top:1px solid rgba(246,239,230,.10);background:radial-gradient(ellipse at 50% 0%,rgba(246,239,230,.05),transparent 66%)')}>
        {this.kicker('[ 06 ]', L.form.label)}
        <h2 data-rv="" style={sx("margin:0 0 10px;font-family:'League Spartan',sans-serif;font-size:32px;font-weight:900")}>{L.form.h2}</h2>
        <p data-rv="" style={sx('margin:0 0 8px;font-size:16px;line-height:1.6;font-weight:600;color:rgba(246,239,230,.78);text-wrap:pretty')}>{L.form.sub}</p>

        <div style={sx('display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:5px;border-radius:999px;background:rgba(246,239,230,.04);border:1px solid rgba(246,239,230,.20);margin-bottom:18px')}>
          <button type="button" onClick={() => this.setState({ tab: 'event', formStatus: 'idle' })} style={sx(tab(!isTest))}>{L.form.tabEvent}</button>
          <button type="button" onClick={() => this.setState({ tab: 'test', formStatus: 'idle' })} style={sx(tab(isTest))}>{L.form.tabTest}</button>
        </div>

        <div style={sx('display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:18px;background:rgba(246,239,230,.05);border:1px solid rgba(246,239,230,.20);margin-bottom:18px')}>
          <span style={sx("font-family:'League Spartan',sans-serif;font-size:24px;font-weight:900;color:#F6EFE6;white-space:nowrap")}>{isTest ? L.form.priceTest : L.form.priceEvent}</span>
          <span style={sx('flex:1;min-width:0;font-size:13.5px;font-weight:700;line-height:1.45;color:rgba(246,239,230,.78)')}>
            {isTest ? L.form.noteTest : L.form.noteEvent}
            <span style={sx('display:block;margin-top:3px;font-weight:800;color:#F6EFE6')}>{L.form.avail}</span>
          </span>
        </div>

        {st === 'ok' && (
          <div role="status" style={sx('padding:24px 20px;border-radius:22px;background:rgba(246,239,230,.03);border:1.5px solid rgba(246,239,230,.20);text-align:center')}>
            <div style={sx('font-size:19px;font-weight:900')}>{L.form.okTitle}</div>
            <p style={sx('margin:8px 0 0;font-size:15px;line-height:1.6;color:rgba(246,239,230,.78);font-weight:600')}>{L.form.okBody}</p>
          </div>
        )}

        {st !== 'ok' && (
          <form onSubmit={this.submitForm} style={sx('padding:18px;border-radius:22px;background:rgba(246,239,230,.03);border:1.5px solid rgba(246,239,230,.20);display:flex;flex-direction:column;gap:12px')}>
            <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true" style={sx('display:none')} />
            <label style={sx(labelStyle)}>{L.form.name}
              <input type="text" name="name" required autoComplete="name" style={sx(inputStyle)} />
            </label>
            <label style={sx(labelStyle)}>{L.form.email}
              <input type="email" name="email" required autoComplete="email" inputMode="email" style={sx(inputStyle)} />
            </label>
            <div style={sx('display:grid;grid-template-columns:1fr 108px;gap:12px')}>
              <label style={sx(labelStyle + ';min-width:0')}>{L.form.anlass}
                <select name="anlass" value={s.anlass || L.form.anlassOpts[0]} onChange={e => this.setState({ anlass: e.target.value })} style={sx(inputStyle)}>
                  {L.form.anlassOpts.map(o => <option key={o} value={o} style={sx('background:#171126;color:#F6EFE6')}>{o}</option>)}
                </select>
              </label>
              <label style={sx(labelStyle + ';min-width:0')}>{L.form.personen}
                <input type="number" name="personen" min={4} max={120} inputMode="numeric" placeholder="20" style={sx(inputStyle)} />
              </label>
            </div>
            <label style={sx(labelStyle)}>{L.form.nachricht}
              <textarea name="nachricht" rows={3} placeholder={L.form.nachrichtPh} style={sx(inputStyle.replace('min-height:52px;padding:0 14px', 'min-height:104px;padding:14px') + ';line-height:1.5;resize:vertical')}></textarea>
            </label>
            {st === 'error' && (
              <p role="alert" style={sx('margin:0;font-size:13.5px;line-height:1.5;color:#FCA5A5;font-weight:700;text-align:center')}>
                {L.form.errorPre}<a href={`mailto:${EMAIL}`} style={sx('color:#FFC7E4')}>{EMAIL}</a>{L.form.errorPost}
              </p>
            )}
            <button type="submit" style={sx('min-height:56px;border:0;border-radius:18px;background:#F6EFE6;color:#0A0814;font-size:17px;font-weight:900;box-shadow:0 10px 26px rgba(0,0,0,.5);cursor:pointer')}>
              {st === 'sending' ? L.form.sending : L.form.submit}
            </button>
            <p style={sx('margin:0;font-size:12.5px;line-height:1.5;color:rgba(246,239,230,.5);font-weight:600')}>
              {L.form.privacy1}<a href="/datenschutz" style={sx('display:inline-flex;align-items:center;min-height:44px;padding:0 4px;font-weight:800')}>{L.form.privacyLink}</a>{L.form.privacy2}
            </p>
          </form>
        )}
      </section>
    );
  }

  render() {
    const L = this.T;
    const s = this.state;
    return (
      <div style={sx('max-width:520px;margin:0 auto;position:relative;overflow:hidden;background:#0A0814;padding-bottom:96px')}>
        <style>{MOBILE_CSS}</style>
        {this.renderHeader()}
        {/* inert, solange das Menue offen ist: Fokus bleibt im Menue (Handoff 7) */}
        <div inert={s.menu || undefined}>
          {this.renderHero()}
          {this.renderModes()}
          {/* Reihenfolge wie auf dem Desktop: erst der Anlass, dann das
              Ausprobieren. Der Handy-Entwurf hatte beide vertauscht, und mit
              zwei Fassungen derselben Seite waeren das zwei verschiedene
              Argumentationen. Erst wofuer, dann wie. */}
          {this.renderAnlaesse()}
          {this.renderProbe()}
          {this.renderAblauf()}
          {this.renderJohannes()}
          {this.renderFaq()}
          {this.renderForm()}
          <footer style={sx('padding:28px 20px 34px;border-top:1px solid rgba(246,239,230,.10);display:flex;flex-direction:column;gap:16px')}>
            <div style={sx('display:flex;align-items:center;gap:10px')}>
              <img src={LOGO} alt="" loading="lazy" width={32} height={32} style={sx('width:32px;height:32px;object-fit:contain')} />
              <span style={sx("font-family:'League Spartan',sans-serif;font-weight:900;font-size:17px")}>CozyWolf</span>
            </div>
            <div style={sx('display:flex;flex-wrap:wrap;gap:8px')}>
              <a href="/impressum" style={sx('display:inline-flex;align-items:center;min-height:44px;padding:0 14px;border-radius:12px;background:rgba(246,239,230,.04);border:1px solid rgba(246,239,230,.38);font-size:14.5px;font-weight:800')}>{L.footer.imprint}</a>
              <a href="/datenschutz" style={sx('display:inline-flex;align-items:center;min-height:44px;padding:0 14px;border-radius:12px;background:rgba(246,239,230,.04);border:1px solid rgba(246,239,230,.38);font-size:14.5px;font-weight:800')}>{L.footer.privacy}</a>
              <a href={INSTA_URL} style={sx('display:inline-flex;align-items:center;min-height:44px;padding:0 14px;border-radius:12px;background:rgba(246,239,230,.04);border:1px solid rgba(246,239,230,.38);font-size:14.5px;font-weight:800')}>{L.footer.instagram}</a>
            </div>
            <div style={sx('font-size:12.5px;line-height:1.6;color:rgba(246,239,230,.5);font-weight:600')}>{L.footer.aiNote}</div>
          </footer>

          <div style={sx(`position:fixed;left:0;right:0;bottom:0;z-index:50;transform:translateY(${this.state.stickyOn ? '0' : '130%'});transition:transform .3s ${EASE};display:flex;justify-content:center;padding:10px 16px calc(10px + env(safe-area-inset-bottom));background:linear-gradient(180deg,rgba(10,8,20,0),rgba(10,8,20,.94) 42%);pointer-events:none`)}>
            <a href="#anfragen" onClick={() => this.setState({ tab: 'test', formStatus: 'idle' })}
              style={sx('pointer-events:auto;width:100%;max-width:488px;display:flex;align-items:center;justify-content:center;gap:9px;min-height:54px;border-radius:999px;background:#F6EFE6;color:#0A0814;font-size:16.5px;font-weight:900;box-shadow:0 12px 30px rgba(0,0,0,.5)')}>
              {L.sticky.label}<span style={sx('font-size:13px;font-weight:800;opacity:.7')}>{L.sticky.tag}</span>
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default function MobileOnePage() {
  const lang = useLang();
  return <MobileOnePageInner lang={lang} />;
}
