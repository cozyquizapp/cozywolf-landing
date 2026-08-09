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
import { FORMSPREE_ID } from '../brand';
import { sx } from './onepage/sx';
import { ONEPAGE_CSS } from './onepage/css';
import { onePageT, type OnePageDict, type ProbeDef } from './onepage/texts';

const EASE = 'cubic-bezier(.22,1,.36,1)';
const LOGO = '/logo.webp';

// Spielstand-Daten der Brett-Simulation (aus dem Entwurf, Wolfs Choreografie)
const TEAMS = [
  { id: 'g', color: '#22C55E', av: '/assets/av3d-giraffe.webp' },
  { id: 'p', color: '#A855F7', av: '/assets/av3d-koala.webp' },
  { id: 'y', color: '#FACC15', av: '/assets/av3d-capybara.webp' },
  { id: 'o', color: '#F97316', av: '/assets/av3d-kuh.webp' },
  { id: 'b', color: '#3B82F6', av: '/assets/av3d-pinguin.webp' },
];
const PRESET: [string, number][] = [['y', 29], ['y', 35], ['y', 36], ['p', 40], ['p', 41], ['p', 47], ['o', 31]];
type Move = { t: string; c?: number; k?: 'steal' | 'stack'; sk?: number };
const MOVES: Move[] = [
  { t: 'g', c: 16 }, { t: 'b', c: 4 }, { t: 'y', c: 10 }, { t: 'o', c: 2 }, { t: 'p', c: 20 },
  { t: 'g', c: 17 }, { t: 'b', c: 36, k: 'steal' }, { t: 'y', c: 3 }, { t: 'p', c: 19 }, { t: 'g', c: 23 },
  { t: 'b', c: 18 }, { t: 'g', c: 41, k: 'steal' }, { t: 'y', c: 24 }, { t: 'p', k: 'stack', sk: 40 }, { t: 'o', c: 25 },
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
// Position des Handys im Hero-Foto (relativ), fuer Blob und Screen-Overlay
const PHONE = { x: 0.775, y: 0.855 };
const BLOB = { wc: 0.3, hc: 0.34, wo: 3.4, ho: 3.4, opC: 0.7, opO: 0.46 };

type OPState = {
  formMode: 'event' | 'test'; formStatus: 'idle' | 'sending' | 'ok' | 'error';
  mode?: 'quiz' | 'arena' | null;
  arenaPts?: Record<string, number>;
  arenaGain?: Record<string, { g: number; hits: number }>;
  arenaRound?: number;
  wallScale?: number; anlass?: number | null;
  beam?: boolean; beamWelcome?: boolean;
  johFan?: boolean; openW?: number; hookI?: number;
  tick?: number; blob?: boolean; hbOn?: number | null; duoHover?: number | null;
  probeCat?: string; probePick?: number | null;
  guessRaw?: string; guessDone?: boolean;
  points?: number[]; pointsDone?: boolean;
  ptilt?: { x: number; y: number } | null; pUp?: boolean;
  boardWinW?: number; boardWinH?: number;
};

class OnePageInner extends Component<{ lang: Lang }, OPState> {
  state: OPState = { formMode: 'event', formStatus: 'idle' };

  gameTimer: ReturnType<typeof setInterval> | undefined;
  switchTimer: ReturnType<typeof setTimeout> | undefined;
  wallRO: ResizeObserver | undefined;
  io: IntersectionObserver | undefined;
  private _beamT: ReturnType<typeof setTimeout> | undefined;
  private _anlT: ReturnType<typeof setTimeout> | undefined;
  private _arenaT: ReturnType<typeof setInterval> | undefined;
  private _hookT: ReturnType<typeof setInterval> | undefined;
  private _mx: number | undefined; private _my: number | undefined;
  private _anlMx: number | undefined; private _anlMy: number | undefined;
  private _modesEl: HTMLElement | null = null;
  private _modesRO: ResizeObserver | undefined;
  private _boardWinEl: HTMLElement | null = null;
  private _boardWinRO: ResizeObserver | undefined;
  private _scene: HTMLElement | null = null;
  private _sceneRO: ResizeObserver | undefined;
  private _sceneFit: (() => void) | undefined;
  private _blobWrap: HTMLElement | null = null;
  private _blobRaf = 0;
  private _blobLast: number | null = null;
  private _blobTarget = false;
  private _blobP = 0;
  private _pStage: HTMLElement | null = null;
  private _pStageIO: IntersectionObserver | undefined;
  private _coarse = false;
  private _trackMouse: ((e: MouseEvent) => void) | undefined;
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

  // ------------------------------------------------- Spielarten-Karten
  // Waehrend des Spaltenwechsels pausiert die Spiel-Simulation: sonst rechnet
  // React mitten in der Layout-Animation 49 Zellen neu und es ruckelt.
  switchMode(next: 'quiz' | 'arena' | null) {
    if ((this.state.mode ?? null) === next) return;
    clearInterval(this.gameTimer);
    clearTimeout(this.switchTimer);
    if (next === 'arena') this.setState({ mode: next, arenaPts: {}, arenaGain: {}, arenaRound: 0 });
    else this.setState({ mode: next });
    if (next == null) return;
    this.switchTimer = setTimeout(() => {
      if (next === 'quiz') this.startGame();
      else this.arenaTick();
    }, 380);
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
    if (round > 8) { this.setState({ arenaPts: {}, arenaGain: {}, arenaRound: 0 }); return; }
    const pts = { ...(this.state.arenaPts || {}) };
    const gain: Record<string, { g: number; hits: number }> = {};
    FACTIONS.forEach(f => {
      if (pts[f.id] == null) pts[f.id] = 0;
      const hits = Math.random() < 0.28 ? 3 : Math.random() < 0.5 ? 2 : Math.random() < 0.7 ? 1 : 0;
      if (hits) { const g = hits * 40; gain[f.id] = { g, hits }; pts[f.id] += g; }
    });
    this.setState({ arenaPts: pts, arenaGain: gain, arenaRound: round });
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

  // ------------------------------------------------- Anlaesse
  anlassPick(i: number) {
    if (i === (this.state.anlass ?? null)) return;
    // Karten, die beim Aufziehen unter den ruhenden Zeiger wandern, loesen
    // mouseenter aus, ohne dass der Nutzer sich bewegt hat: solche Wechsel ignorieren
    const moved = this._mx !== this._anlMx || this._my !== this._anlMy;
    if (this.state.anlass != null && !moved) return;
    clearTimeout(this._anlT);
    this._anlT = setTimeout(() => {
      if (this._mx != null && this._my != null) {
        const el = document.elementFromPoint(this._mx, this._my);
        const card = el && el.closest ? el.closest('[data-anlass]') : null;
        if (card && Number((card as HTMLElement).dataset.anlass) !== i) return;
      }
      this._anlMx = this._mx; this._anlMy = this._my;
      this.setState({ anlass: i });
    }, 210);
  }

  // ------------------------------------------------- Hero-Blob
  blobFrame(now: number) {
    const w = this._blobWrap, inner = this._scene;
    if (!w || !inner || !w.parentElement) return;
    const t = this._blobLast == null ? 16 : Math.min(50, now - this._blobLast);
    this._blobLast = now;
    const target = this._blobTarget ? 1 : 0;
    const dur = this._blobTarget ? 2900 : 2200;
    let p = this._blobP;
    const step = t / dur;
    p = target > p ? Math.min(1, p + step) : Math.max(0, p - step);
    this._blobP = p;
    const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
    const L = w.parentElement, LW = L.clientWidth, LH = L.clientHeight;
    if (!LW) return;
    const sW = LW, sH = LW / 1.5, sT = LH - sH;
    const cx = PHONE.x * sW, cy = sT + PHONE.y * sH;
    const breath = 1 + 0.05 * Math.sin(now / 1750) * (1 - e);
    const bw = sW * BLOB.wc * Math.pow(BLOB.wo / BLOB.wc, e) * breath;
    const bh = sH * BLOB.hc * Math.pow(BLOB.ho / BLOB.hc, e) * breath;
    const bl = cx - bw / 2, bt = cy - bh / 2;
    w.style.left = bl.toFixed(1) + 'px'; w.style.top = bt.toFixed(1) + 'px';
    w.style.width = bw.toFixed(1) + 'px'; w.style.height = bh.toFixed(1) + 'px';
    inner.style.width = sW.toFixed(1) + 'px';
    inner.style.left = (-bl).toFixed(1) + 'px';
    inner.style.top = (sT - bt).toFixed(1) + 'px';
    inner.style.opacity = (BLOB.opC + (BLOB.opO - BLOB.opC) * e).toFixed(3);
    const sh = inner.querySelector('[data-heroshade]') as HTMLElement | null;
    if (sh) sh.style.opacity = (e * e).toFixed(3);
  }

  blobLoop() {
    cancelAnimationFrame(this._blobRaf);
    const tick = (now: number) => {
      this._blobRaf = requestAnimationFrame(tick);
      if (document.hidden) return;
      this.blobFrame(now);
    };
    this._blobRaf = requestAnimationFrame(tick);
  }

  setBlob(v: boolean) { this._blobTarget = v; this.setState({ blob: v }); }

  heroSceneRef = (el: HTMLElement | null) => {
    if (!el || this._scene === el) return;
    this._scene = el;
    // Handy-Screen-Overlay: perspektivische Matrix auf das Handy im Foto,
    // vermessen im Entwurf (Box 100x217 auf das Foto-Quad)
    const k = 98 / 217;
    const P = { a: 0.5131223050550144, d: 0.11407164779754392, g: -0.000021891688899505144,
                b: -1.10423155084744 * k, e: -0.19042846482961767 * k, h: -0.0006630664975972594 * k, c: 1169.2, f: 887.8 };
    const fit = () => {
      const scr = el.querySelector('[data-phonescreen]') as HTMLElement | null;
      if (!scr) return;
      const s = el.clientWidth / 1536;
      scr.style.transform = `matrix3d(${P.a * s},${P.d * s},0,${P.g},${P.b * s},${P.e * s},0,${P.h},0,0,1,0,${P.c * s},${P.f * s},0,1)`;
    };
    this._sceneFit = fit;
    fit();
    this._sceneRO = new ResizeObserver(fit);
    this._sceneRO.observe(el);
    window.addEventListener('resize', fit, { passive: true });
    const im = el.querySelector('img');
    if (im) im.addEventListener('load', fit);
    setTimeout(fit, 60);
    setTimeout(fit, 400);
  };

  blobWrapRef = (el: HTMLElement | null) => {
    if (el && this._blobWrap !== el) { this._blobWrap = el; this.blobLoop(); }
  };

  modesRef = (el: HTMLElement | null) => {
    if (!el || this._modesEl === el) return;
    this._modesEl = el;
    this._modesRO = new ResizeObserver(() => {
      const w = Math.round((el.clientWidth - 20) / 1.185) - 62;
      if (w > 0 && w !== this.state.openW) this.setState({ openW: w });
    });
    this._modesRO.observe(el);
  };

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
    document.querySelectorAll('details').forEach(d => {
      d.addEventListener('toggle', () => {
        const p = d.querySelector('[data-faq-plus]') as HTMLElement | null;
        if (p) p.style.transform = d.open ? 'rotate(135deg)' : '';
      });
    });
    this._coarse = window.matchMedia('(hover:none)').matches || window.innerWidth < 861;
    this._trackMouse = e => { this._mx = e.clientX; this._my = e.clientY; };
    document.addEventListener('mousemove', this._trackMouse, { passive: true });
    this._arenaT = setInterval(() => {
      if (document.hidden) return;
      if ((this.state.mode ?? null) !== 'arena') return;
      this.arenaTick();
    }, 8200);
    this._hookT = setInterval(() => {
      if (document.hidden) return;
      this.setState(s => ({ hookI: (s.hookI ?? 0) + 1 }));
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
    clearTimeout(this.switchTimer);
    clearTimeout(this._beamT);
    clearTimeout(this._anlT);
    clearInterval(this._arenaT);
    clearInterval(this._hookT);
    cancelAnimationFrame(this._blobRaf);
    this.io?.disconnect();
    this.wallRO?.disconnect();
    this._modesRO?.disconnect();
    this._boardWinRO?.disconnect();
    this._sceneRO?.disconnect();
    this._pStageIO?.disconnect();
    if (this.onScroll) window.removeEventListener('scroll', this.onScroll);
    if (this._sceneFit) window.removeEventListener('resize', this._sceneFit);
    if (this._trackMouse) document.removeEventListener('mousemove', this._trackMouse);
  }

  // ------------------------------------------------- Abschnitte
  renderHeader() {
    const L = this.T;
    const langBtn = (on: boolean) => `appearance:none;border:0;cursor:pointer;font:inherit;font-size:12.5px;font-weight:900;letter-spacing:.06em;padding:6px 11px;border-radius:999px;transition:background .25s ${EASE},color .25s ${EASE};background:${on ? '#FA4BA3' : 'transparent'};color:${on ? '#0A0814' : '#94a3b8'}`;
    return (
      <header data-header="" style={sx(`position:sticky;overflow:visible;top:0;z-index:20;transition:padding .3s ${EASE},background .3s ${EASE},border-color .3s ${EASE};backdrop-filter:blur(14px);background:rgba(10,8,20,.86);box-shadow:0 12px 34px rgba(10,8,20,.55)`)}>
        <div data-shell="" style={sx('max-width:1180px;margin:0 auto;padding:14px 32px;display:flex;align-items:center;gap:32px;white-space:nowrap')}>
          <a href="#top" style={sx('display:flex;align-items:center;gap:10px')}>
            <img src={LOGO} alt="CozyWolf" width={38} height={38} style={sx('width:38px;height:38px')} />
            <span style={sx("font-family:'League Spartan',sans-serif;font-weight:900;font-size:21px;letter-spacing:.02em;color:#F1F5F9")}>COZYWOLF</span>
          </a>
          <nav data-m="nav" style={sx('display:flex;gap:26px;margin-left:auto;font-size:15px;font-weight:700;color:#cbd5e1')}>
            <a href="#spielarten" style={sx('color:#cbd5e1')}>{L.nav.spielarten}</a>
            <a href="#probieren" style={sx('color:#cbd5e1')}>{L.nav.probieren}</a>
            <a href="#ablauf" style={sx('color:#cbd5e1')}>{L.nav.ablauf}</a>
            <a href="#johannes" style={sx('color:#cbd5e1')}>{L.nav.ueber}</a>
          </nav>
          <div data-m="lang" style={sx('display:flex;align-items:center;gap:4px;padding:3px;border-radius:999px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.03)')}>
            <button type="button" onClick={() => setLang('de')} style={sx(langBtn(this.props.lang === 'de'))}>DE</button>
            <button type="button" onClick={() => setLang('en')} style={sx(langBtn(this.props.lang === 'en'))}>EN</button>
          </div>
          <a href="#anfragen" className="cwHovA" style={sx(`padding:11px 20px;border-radius:999px;background:#FA4BA3;color:#0A0814;font-weight:900;font-size:15px;transition:filter .28s ${EASE}`)}>{L.nav.cta}</a>
        </div>
      </header>
    );
  }

  renderHero() {
    const L = this.T;
    const open = !!this.state.blob;
    const on = this.state.hbOn ?? null;
    const hb = (i: number) => {
      const hot = on === i, cold = on !== null && !hot;
      const primary = i === 0;
      return {
        style: `position:relative;display:flex;align-items:center;justify-content:center;flex:none;min-width:0;box-sizing:border-box;overflow:hidden;border-radius:999px;white-space:nowrap;font-weight:900;min-height:66px;`
          + `width:${hot ? 'calc(60% - 7px)' : (cold ? 'calc(40% - 7px)' : 'calc(50% - 7px)')};`
          + `padding:${hot ? '16px 26px 15px' : '19px 22px'};font-size:${cold ? 16 : (hot ? 18 : 17)}px;`
          + (primary ? 'background:#FA4BA3;' : 'background:transparent;border:1.5px solid rgba(250,75,163,.32);')
          + `box-shadow:${primary ? (hot ? '0 18px 44px rgba(250,75,163,.4)' : '0 12px 30px rgba(250,75,163,.2)') : 'none'};`
          + `transition:width .7s ${EASE},padding .7s ${EASE},font-size .7s ${EASE},box-shadow .5s ${EASE}`,
        fill: `position:absolute;inset:0;background:${primary ? '#FFC7E4' : '#AB0055'};transform:scaleY(${hot ? 1 : 0});transform-origin:bottom center;transition:transform .6s ${EASE}`,
        lab: `display:block;line-height:1.15em;font-size:inherit;letter-spacing:${hot ? '-.005em' : '0'};color:${primary ? '#0A0814' : (hot ? '#FFE3F1' : '#FFC7E4')};transition:color .4s ${EASE},letter-spacing .5s ${EASE}`,
        sub: `display:block;overflow:hidden;max-height:${hot ? '22px' : '0'};transition:max-height .6s ${EASE}`,
        subIn: `display:block;padding-top:4px;font-size:12.5px;font-weight:800;letter-spacing:.02em;white-space:nowrap;color:${primary ? 'rgba(10,8,20,.66)' : 'rgba(255,227,241,.78)'};transform:translateY(${hot ? '0' : '-8px'});opacity:${hot ? 1 : 0};transition:transform .6s ${EASE},opacity .45s ${EASE} ${hot ? '.1s' : '0s'}`,
      };
    };
    const b0 = hb(0), b1 = hb(1);
    const hookI = this.state.hookI ?? 0;
    const hook = L.hero.hooks[hookI % L.hero.hooks.length];
    const anim = hookI % 2 ? 'cwLetterB' : 'cwLetter';
    return (
      <section id="top" style={sx('position:relative;overflow:hidden;min-height:82vh;display:flex;flex-direction:column;border-bottom:1px solid rgba(250,75,163,.07)')}>
        <div style={sx('position:absolute;top:-340px;left:50%;transform:translateX(-50%);width:1500px;height:980px;background:radial-gradient(ellipse at center,rgba(250,75,163,.24),rgba(10,8,20,0) 62%);pointer-events:none')}></div>
        <div style={sx('position:absolute;right:0;bottom:0;width:100%;aspect-ratio:1536/1024;pointer-events:none;z-index:3')}>
          <div
            onMouseEnter={() => this.setBlob(true)}
            onMouseLeave={() => this.setBlob(false)}
            onClick={() => this.setBlob(!this._blobTarget)}
            style={sx(`position:absolute;pointer-events:auto;cursor:pointer;left:${open ? '16%' : '68%'};top:${open ? '8%' : '78%'};width:${open ? '84%' : '19%'};height:${open ? '92%' : '15%'};border-radius:50%;transition:left .5s ease,top .5s ease,width .5s ease,height .5s ease`)}
          ></div>
        </div>
        <div aria-hidden="true" style={sx('position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:1')}>
          <div ref={this.blobWrapRef} style={sx('position:absolute;left:0;top:0;width:10px;height:10px;overflow:hidden;-webkit-mask-image:radial-gradient(ellipse 50% 50% at 50% 50%,#000 44%,rgba(0,0,0,.55) 62%,rgba(0,0,0,0) 80%);mask-image:radial-gradient(ellipse 50% 50% at 50% 50%,#000 44%,rgba(0,0,0,.55) 62%,rgba(0,0,0,0) 80%);-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-size:100% 100%;mask-size:100% 100%')}>
            <div ref={this.heroSceneRef} style={sx('position:absolute;left:0;top:0;width:100%')}>
              <img src="/assets/hero-bar.webp" width={1536} height={1024} fetchPriority="high" alt={L.hero.imgAlt} style={sx('display:block;width:100%;height:auto')} />
              <div aria-hidden="true" data-heroshade="" style={sx('position:absolute;inset:0;pointer-events:none;opacity:0;background:linear-gradient(to right,rgba(10,8,20,.8) 0%,rgba(10,8,20,.42) 18%,rgba(10,8,20,0) 38%)')}></div>
              <div aria-hidden="true" data-phonescreen="" style={sx('position:absolute;left:0;top:0;width:100px;height:217px;transform-origin:0 0;overflow:hidden;border-radius:13px;background:linear-gradient(180deg,#150c20,#0b0714);box-shadow:0 0 26px rgba(168,85,247,.6),0 0 60px rgba(250,75,163,.32)')}>
                <div style={sx('position:absolute;inset:0;display:flex;flex-direction:column;gap:9px;padding:16px 11px;box-sizing:border-box')}>
                  <div style={sx('font-size:9px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:#FA4BA3;line-height:1')}>{L.hero.phoneApp}</div>
                  <div style={sx('display:flex;align-items:center;gap:7px;padding:7px 7px;border-radius:9px;box-sizing:border-box;background:#A855F72e;border:1px solid #A855F7')}>
                    <span style={sx('flex:none;width:19px;height:19px;border-radius:50%;background:#A855F7 url(/assets/av3d-koala.webp) center/contain no-repeat')}></span>
                    <span style={sx('flex:1;min-width:0;font-weight:900;line-height:1;color:#A855F7;white-space:nowrap;overflow:hidden;font-size:9px')}>{L.hero.phoneTeamA}</span>
                  </div>
                  <div style={sx('display:flex;align-items:center;gap:7px;padding:7px 7px;border-radius:9px;box-sizing:border-box;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1)')}>
                    <span style={sx('flex:none;width:19px;height:19px;border-radius:50%;background:#22C55E url(/assets/av3d-giraffe.webp) center/contain no-repeat')}></span>
                    <span style={sx('flex:1;min-width:0;font-weight:900;line-height:1;color:#e2e8f0;white-space:nowrap;overflow:hidden;font-size:9px')}>{L.hero.phoneTeamB}</span>
                  </div>
                  <div style={sx('margin-top:auto;padding:8px 0;border-radius:8px;background:#FA4BA3;color:#0A0814;font-size:10px;font-weight:900;text-align:center;line-height:1')}>{L.hero.phoneReady}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={sx('position:relative;z-index:2;flex:1;display:flex;align-items:center;width:100%;max-width:1180px;margin:0 auto;padding:72px 32px')} data-shell="" data-m="hero">
          <div style={sx('width:100%;max-width:660px')}>
            <h1 style={sx("margin:0;font-family:'League Spartan',sans-serif;font-weight:900;font-size:clamp(52px,6.6vw,104px);line-height:.9;letter-spacing:-.035em;color:#F1F5F9")}>
              <span style={sx('display:block;padding:.14em .1em .06em;margin:-.14em -.1em -.06em;overflow:hidden;white-space:nowrap')}>
                {hook.split('').map((ch, j) => (
                  <span key={`${hookI}-${j}`} style={sx(`display:inline-block;color:#FA4BA3;animation:${anim} 1.05s ${EASE} both ${(j * 0.07).toFixed(3)}s`)}>{ch === ' ' ? '\u00A0' : ch}</span>
                ))}
              </span>
              <span style={sx(`display:block;animation:cwRise .9s ${EASE} both .12s`)}>{L.hero.rest}</span>
            </h1>
            <p data-m="herosub" style={sx(`margin:24px 0 0;animation:cwRise .8s ${EASE} both .26s;font-size:18px;line-height:1.6;font-weight:500;color:#cbd5e1;white-space:nowrap`)}>{L.hero.sub}</p>
            <div onMouseLeave={() => this.setState({ hbOn: null })} style={sx(`margin-top:30px;animation:cwRise .8s ${EASE} both .34s;display:flex;align-items:stretch;gap:14px;max-width:560px`)}>
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
            <div style={sx('margin-top:22px;display:flex;align-items:center;flex-wrap:wrap;gap:10px;font-size:11.5px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;color:#94a3b8')}>
              <span style={sx('width:8px;height:8px;border-radius:50%;background:#FA4BA3;box-shadow:0 0 12px #FA4BA3')}></span>
              {L.hero.availability}
            </div>
          </div>
        </div>
      </section>
    );
  }

  kicker(label: string) {
    return (
      <div data-reveal="" style={sx('display:flex;align-items:center;gap:12px;margin:0 0 14px;font-size:11.5px;font-weight:900;letter-spacing:.2em;text-transform:uppercase;color:#FA4BA3;white-space:nowrap')}>
        {label.split('|')[0]}
        <span style={sx('flex:1;height:1px;background:linear-gradient(90deg,rgba(250,75,163,.35),transparent);max-width:180px')}></span>
        <span style={sx('color:#64748b')}>{label.split('|')[1]}</span>
      </div>
    );
  }

  bullet(text: string, dotColor: string) {
    return (
      <span key={text} style={sx('display:flex;align-items:flex-start;gap:14px;font-size:21.5px;line-height:1.4;font-weight:600;color:#e6edf6;text-wrap:pretty')}>
        <span style={sx(`width:9px;height:9px;border-radius:50%;background:${dotColor};flex:none;margin-top:11px`)}></span>{text}
      </span>
    );
  }

  calmChip(neutral: boolean, accent: string) {
    return `align-self:flex-start;box-sizing:border-box;overflow:hidden;white-space:nowrap;`
      + `margin:${neutral ? '78px' : '0px'} 0 0;padding:${neutral ? '6px 13px' : '0 13px'};`
      + `max-height:${neutral ? '30px' : '0px'};border-radius:999px;`
      + `background:${accent}1f;border:1px solid ${accent}${neutral ? '59' : '00'};`
      + `font-size:11px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:${accent};`
      + `opacity:${neutral ? 1 : 0};transition:opacity .4s ${EASE} ${neutral ? '.26s' : '0s'},max-height .7s ${EASE},margin .7s ${EASE},padding .7s ${EASE}`;
  }

  calmLead(neutral: boolean) {
    return `margin:${neutral ? '14px' : '0px'} 0 0;max-width:420px;overflow:hidden;`
      + `max-height:${neutral ? '120px' : '0px'};font-size:16px;line-height:1.55;font-weight:600;color:#a5b4c8;text-wrap:pretty;`
      + `opacity:${neutral ? 1 : 0};transition:opacity .4s ${EASE} ${neutral ? '.3s' : '0s'},max-height .7s ${EASE},margin .7s ${EASE}`;
  }

  renderModes() {
    const L = this.T;
    const m = this.state.mode ?? null;
    const quiz = m === 'quiz', arena = m === 'arena', neutral = m == null;
    const cols = neutral ? '1fr 1fr' : (quiz ? '1fr 0.185fr' : '0.185fr 1fr');
    const card = (accent: string, open: boolean) => `position:relative;display:flex;flex-direction:column;box-sizing:border-box;overflow:hidden;contain:layout;min-width:0;border-radius:22px;background:linear-gradient(165deg,${accent}${open ? '14' : '0d'},rgba(255,255,255,.02) 60%);border:1px solid ${accent}${open ? '47' : '30'};padding:${open ? '30px' : '24px 12px'};cursor:${open ? 'default' : 'pointer'};transition:background .5s ${EASE},border-color .5s ${EASE},box-shadow .5s ${EASE};box-shadow:${open ? `0 26px 54px rgba(0,0,0,.42),0 0 0 1px ${accent}22` : 'none'}`;
    const modeTitle = (open: boolean, accent: string, calm: boolean) =>
      `position:absolute;z-index:2;font-family:'League Spartan',sans-serif;font-weight:900;line-height:.92;letter-spacing:-.025em;white-space:nowrap;pointer-events:none;`
      + `color:${accent};text-shadow:0 0 46px ${accent}4d;`
      + (open
        ? `left:30px;top:24px;font-size:46px;transform:translate(0,0) rotate(0deg);`
        : calm
          ? `left:30px;top:24px;font-size:52px;transform:translate(0,0) rotate(0deg);`
          : `left:50%;top:50%;font-size:64px;transform:translate(-50%,-50%) rotate(-90deg);`)
      + `transition:left .95s ${EASE},top .95s ${EASE},font-size .95s ${EASE},transform .95s ${EASE},color .6s ${EASE}`;
    const lead = (open: boolean) =>
      `margin:0;font-size:18.5px;line-height:1.5;font-weight:600;color:#b3c1d3;max-width:min(100%,720px);text-wrap:pretty;`
      + `opacity:${open ? 1 : 0};transform:translateX(${open ? '0' : '-10px'});transition:opacity .5s ${EASE} .25s,transform .7s ${EASE}`;
    const openPaneStyle = `display:flex;flex-direction:column;height:100%;padding-top:3px;box-sizing:border-box;${this.state.openW ? 'width:' + this.state.openW + 'px;' : ''}transform-origin:left center;animation:cwGrow .8s ${EASE} .26s both;overflow:hidden`;
    const g = this.gameVals();

    return (
      <section id="spielarten" data-shell="" style={sx('max-width:1180px;margin:0 auto;padding:84px 32px')}>
        {this.kicker(`${L.modes.kicker}|${L.modes.label}`)}
        <h2 data-reveal="" style={sx("margin:0 0 24px;font-family:'League Spartan',sans-serif;font-size:34px;font-weight:900;letter-spacing:-.015em;color:#F1F5F9")}>{L.modes.h2}</h2>
        <div data-m="modes" ref={this.modesRef} onMouseLeave={() => this.switchMode(null)}
          style={sx(`display:grid;grid-template-columns:${cols};gap:20px;align-items:stretch;height:${neutral ? '230px' : '700px'};transition:grid-template-columns 1.05s ${EASE},height 1.05s ${EASE}`)}>
          <div onMouseEnter={() => this.switchMode('quiz')} onClick={() => this.switchMode('quiz')} style={sx(card('#FA4BA3', quiz))}>
            <span style={sx(modeTitle(quiz, '#FA4BA3', neutral))}>CozyQuiz</span>
            <span style={sx(this.calmChip(neutral, '#FA4BA3'))}>{L.modes.quizChip}</span>
            <p style={sx(this.calmLead(neutral))}>{L.modes.quizCalm}</p>
            {quiz && (
              <div style={sx(openPaneStyle)}>
                <div style={sx('display:flex;flex-wrap:wrap;gap:36px;margin-top:58px;flex:1;min-height:0;align-items:center')}>
                  <div data-m="modetext" style={sx('flex:1.6 1 380px;min-width:288px;max-width:470px;display:flex;flex-direction:column;gap:22px')}>
                    <p style={sx(lead(true))}>{L.modes.quizLead}</p>
                    <div style={sx('display:flex;flex-direction:column;gap:18px')}>
                      {L.modes.quizBullets.map(b => this.bullet(b, '#FA4BA3'))}
                    </div>
                  </div>
                  <div ref={this.boardWinRef} style={sx('flex:1 1 250px;max-width:460px;min-width:0;height:100%;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;padding:4px 0')}>
                    {this.renderBoard(g)}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div onMouseEnter={() => this.switchMode('arena')} onClick={() => this.switchMode('arena')} style={sx(card('#AB0055', arena))}>
            <span style={sx(modeTitle(arena, '#FFC7E4', neutral))}>CozyArena</span>
            <span style={sx(this.calmChip(neutral, '#FFC7E4'))}>{L.modes.arenaChip}</span>
            <p style={sx(this.calmLead(neutral))}>{L.modes.arenaCalm}</p>
            {arena && (
              <div style={sx(openPaneStyle)}>
                <div style={sx('display:flex;flex-wrap:wrap;gap:36px;margin-top:58px;flex:1;min-height:0;align-items:center')}>
                  <div data-m="modetext" style={sx('flex:1.6 1 380px;min-width:288px;max-width:470px;display:flex;flex-direction:column;gap:22px')}>
                    <p style={sx(lead(true))}>{L.modes.arenaLead}</p>
                    <div style={sx('display:flex;flex-direction:column;gap:18px')}>
                      {L.modes.arenaBullets.map(b => this.bullet(b, '#FFC7E4'))}
                    </div>
                  </div>
                  <div style={sx('position:relative;flex:1 1 230px;max-width:392px;min-width:0;height:100%;box-sizing:border-box;padding:4px 0')}>
                    <div style={sx('position:relative;width:100%;height:100%')}>
                      {this.renderFactions()}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  renderFactions() {
    const L = this.T;
    const pts = this.state.arenaPts || {};
    const vals = FACTIONS.map(f => pts[f.id] || 0);
    const max = Math.max(1, ...vals);
    const ranked = FACTIONS.slice().sort((a, b) => (pts[b.id] || 0) - (pts[a.id] || 0)).map(f => f.id);
    const H = 100 / FACTIONS.length;
    return FACTIONS.map(f => {
      const p = pts[f.id] || 0, r = ranked.indexOf(f.id), leadNow = r === 0 && p > 0;
      return (
        <div key={f.id} style={sx(`position:absolute;left:0;right:0;top:0;height:${H}%;display:flex;align-items:center;gap:9px;padding:0 10px;border-radius:12px;box-sizing:border-box;transform:translateY(${r * 100}%);transition:transform 1.5s ${EASE},background .6s ease,border-color .6s ease,box-shadow .6s ease;${leadNow ? `background:linear-gradient(90deg,${f.color}26,transparent);border:1px solid ${f.color}80;box-shadow:0 0 22px ${f.color}33` : 'border:1px solid transparent'}`)}>
          <span style={sx(`flex:none;width:18px;text-align:center;font-size:15px;font-weight:900;color:${leadNow ? '#fff' : '#64748b'};transition:color .5s ease`)}>{r + 1}</span>
          <span style={sx(`flex:none;width:30px;height:30px;background:url(/assets/crest-${f.id}.webp) center/contain no-repeat`)}></span>
          <span style={sx('flex:none;width:104px;min-width:0')}>
            <span style={sx(`font-size:13.5px;font-weight:900;line-height:1.15;color:${f.color};white-space:nowrap;overflow:hidden;text-overflow:ellipsis`)}>{L.sim.factions[f.id]}</span>
          </span>
          <span style={sx('flex:1;min-width:0;height:11px;border-radius:999px;background:rgba(255,255,255,.06);overflow:hidden;display:block')}>
            <span style={sx(`display:block;height:100%;width:${Math.round((p / max) * 100)}%;border-radius:999px;background:linear-gradient(180deg,${f.color},${f.color}cc);box-shadow:inset 0 1px 0 rgba(255,255,255,.45);transition:width 1.8s ${EASE}`)}></span>
          </span>
          <span style={sx(`flex:none;width:46px;text-align:right;font-size:15px;font-weight:900;color:${f.color}`)}>{p}</span>
        </div>
      );
    });
  }

  // ------------------------------------------------- Brett-Simulation
  gameVals() {
    const L = this.T;
    const tick = this.state.tick ?? 0;
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
        style: `flex:1;display:flex;align-items:center;gap:10px;padding:12px 12px;border-radius:14px;box-sizing:border-box;background:${hit ? q.col + '22' : 'rgba(255,255,255,.035)'};border:1px solid ${hit ? q.col : 'rgba(255,255,255,.09)'};box-shadow:${hit ? `0 0 22px ${q.col}55` : 'none'};transition:background .4s ${EASE},border-color .4s ${EASE},box-shadow .4s ${EASE}`,
        numStyle: `font-family:'League Spartan',sans-serif;font-size:26px;font-weight:900;line-height:1;color:${hit ? q.col : q.col + 'cc'}`,
      };
    });

    const teamDiscs = TEAMS.map((tm, k) => ({
      style: `width:42px;height:42px;border-radius:50%;background-image:url(${tm.av});background-color:${tm.color};background-size:35px auto;background-position:center;background-repeat:no-repeat;box-shadow:${k < answered ? `0 0 0 2px ${tm.color}` : '0 0 0 2px rgba(255,255,255,.08)'};opacity:${k < answered ? 1 : .38};transition:opacity .4s ${EASE},box-shadow .4s ${EASE}`,
    }));

    const byId: Record<string, typeof TEAMS[number]> = {};
    TEAMS.forEach(tm => { byId[tm.id] = tm; });
    const owner: Record<number, string> = {};
    PRESET.forEach(([id, cell]) => { owner[cell] = id; });
    const stacked = new Set<number>();
    const last = played[played.length - 1];
    let stolenFrom: string | null = null;
    played.forEach((mv, i) => {
      if (mv.k === 'stack') { if (mv.sk !== undefined) stacked.add(mv.sk); return; }
      if (mv.c === undefined) return;
      if (i === played.length - 1) stolenFrom = owner[mv.c] || null;
      owner[mv.c] = mv.t;
    });
    const active = last ? byId[last.t] : null;
    const isStack = !!last && last.k === 'stack';
    const isSteal = !!last && last.k === 'steal';
    const justSet = last && !isStack && last.c !== undefined ? last.c : -1;
    const justStacked = isStack && last.sk !== undefined ? last.sk : -1;

    const GS = 7;
    // Feld nutzt die volle Breite der rechten Spalte, die Tabelle sitzt darunter
    const budget = (this.state.boardWinW || 440) - 26;
    const hBudget = (this.state.boardWinH || 520) - 16;
    const CS = Math.max(26, Math.min(56, Math.floor((budget - 6 * 8) / GS), Math.floor((hBudget - 6 * 8) / GS)));
    const GAP = CS >= 46 ? 8 : 6, RAD = CS >= 46 ? 9 : 7;
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

    const cells: Cell[] = Array.from({ length: 49 }, (_, i) => {
      const tm = owner[i] ? byId[owner[i]] : null;
      const r = Math.floor(i / GS), c = i % GS;
      const base = `position:relative;width:${CS}px;height:${CS}px;display:flex;align-items:center;justify-content:center;box-sizing:border-box;transition:background .45s ${EASE},box-shadow .45s ${EASE};`;
      const duck = ducks.has(i) ? 'animation:cwDuck .45s ease-out .1s both;' : '';
      if (!tm) return {
        owned: false, av: '', fresh: false, wave: false, bridgeR: false, bridgeB: false,
        sparks: [], shards: [], ghost: false, burst: false, stacked: false, dust: false,
        style: base + duck + `border-radius:${RAD}px;background:rgba(255,255,255,.028);border:1px solid rgba(255,255,255,.05)`,
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
      const insetTop = nT ? '' : 'inset 0 1px 0 rgba(255,255,255,.22)';
      const insetBottom = nB ? '' : 'inset 0 -3px 0 rgba(0,0,0,.2)';
      const hardDrop = (nR && nB) ? '' : `${nR ? 0 : 2}px ${nB ? 0 : 3}px 0 rgba(0,0,0,.45)`;
      const shadow = [insetTop, insetBottom, hardDrop, '0 5px 9px rgba(0,0,0,.3)', fresh ? `0 0 22px ${col}bb` : '', isStacked ? `0 0 16px ${col}77` : ''].filter(Boolean).join(',');
      const bg = `linear-gradient(135deg,${col}ff,${col}d9)`;
      const wd = waveDelay[i];
      const bridge = `position:absolute;background:${bg};z-index:2;pointer-events:none;${wd !== undefined ? `animation:cwBridgeFlash .44s ease-out ${wd}ms both;` : ''}`;
      const span = CS - RAD * 2;

      const avMain = (() => {
        const anim = fresh ? (stolenNow ? 'animation:cwSlam .5s cubic-bezier(.34,1.56,.64,1) .18s both;' : 'animation:cwDrop .6s cubic-bezier(.34,1.56,.64,1) .28s both;') : '';
        if (!isStacked) return `width:${Math.round(CS * 0.62)}px;height:${Math.round(CS * 0.62)}px;display:block;position:relative;z-index:8;background:url(${tm.av}) center/contain no-repeat;` + anim;
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
        ghostAvStyle: ghost ? `width:${Math.round(CS * 0.62)}px;height:${Math.round(CS * 0.62)}px;background:url(${ghost.av}) center/contain no-repeat` : '',
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
        discStyle: `width:34px;height:34px;border-radius:50%;background-image:url(${tm.av});background-color:${tm.color};background-size:28px auto;background-position:center;background-repeat:no-repeat;flex:none;transition:box-shadow .4s ${EASE};${isActive ? `box-shadow:0 0 0 3px ${tm.color}44` : ''}`,
        nameStyle: `font-size:15px;font-weight:900;letter-spacing:-.02em;color:${tm.color};line-height:1.15;white-space:nowrap`,
      };
    });

    const fc = active ? active.color : 'rgba(255,255,255,.12)';
    const verb = isStack ? L.sim.verbStack : isSteal ? L.sim.verbSteal : L.sim.verbSet;
    return {
      cells, standings, seconds, qOptions, teamDiscs,
      qText: q.text, catName: q.cat,
      showQuestion: phase !== 'b', showBoard: phase === 'b',
      statusLine: phase === 'b' ? `${active ? L.sim.teams[active.id] : ''} ${verb}` : (revealed ? L.sim.reveal : L.sim.answering),
      answeredLine: L.sim.answeredLine(answered),
      catPillStyle: `display:inline-flex;align-items:center;gap:8px;white-space:nowrap;flex:none;padding:6px 12px;border-radius:999px;background:${q.col}22;border:1px solid ${q.col}59;font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:${q.col};transition:all .4s ${EASE}`,
      qCardStyle: `padding:20px 18px;border-radius:16px;background:rgba(255,255,255,.03);border:1px solid ${q.col}59;box-shadow:0 0 34px ${q.col}2e;font-size:21px;font-weight:900;line-height:1.25;color:#fff;transition:border-color .4s ${EASE},box-shadow .4s ${EASE}`,
      ringStyle: `flex:none;width:62px;height:62px;border-radius:50%;border:3px solid ${q.col};display:flex;align-items:center;justify-content:center;font-family:'League Spartan',sans-serif;font-size:24px;font-weight:900;color:${q.col};box-shadow:0 0 24px ${q.col}55;transition:border-color .4s ${EASE},color .4s ${EASE}`,
      shakeStyle: (justSet >= 0) ? 'animation:cwShake .45s ease-out' : '',
      frameStyle: `padding:8px;border-radius:14px;background:rgba(255,255,255,.015);flex:none;--tc:${active ? fc + '55' : 'transparent'};${active ? 'animation:cwGridGlow 2.4s ease-in-out infinite;' : ''}border:2px solid ${active ? fc : 'rgba(255,255,255,.1)'};box-shadow:${active ? `0 0 36px ${fc}55, inset 0 0 30px ${fc}14` : 'inset 0 0 40px rgba(0,0,0,.5)'};transition:border-color .5s ${EASE},box-shadow .5s ${EASE}`,
      boardGridStyle: `display:grid;grid-template-columns:repeat(${GS},${CS}px);gap:${GAP}px`,
    };
  }

  renderBoard(g: ReturnType<OnePageInner['gameVals']>): ReactNode {
    return (
      <div style={sx('display:flex;align-items:center')}>
        <div style={sx(g.shakeStyle)}>
          <div style={sx(g.frameStyle)}>
            <div style={sx(g.boardGridStyle)}>
              {g.cells.map((c, i) => (
                <span key={i} style={sx(c.style)}>
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

  renderAnlaesse() {
    const L = this.T;
    const hov = this.state.anlass ?? null;
    // Text braucht helle Toene auf #0A0814, #AB0055 nur als Flaechenfarbe
    const ACC = ['#FA4BA3', '#FFC7E4', '#FF7AC0'];
    const cols = [0, 1, 2].map(i => hov === null ? '1fr' : (hov === i ? '4.4fr' : '.5fr')).join(' ');
    return (
      <section style={sx('border-top:1px solid rgba(250,75,163,.07)')}>
        <div data-shell="" style={sx('max-width:1180px;margin:0 auto;padding:80px 32px')}>
          {this.kicker(`[ 02 ]|${L.anlaesse.label}`)}
          <h2 data-reveal="" style={sx("margin:0 0 8px;font-family:'League Spartan',sans-serif;font-size:34px;font-weight:900;color:#F1F5F9")}>{L.anlaesse.h2}</h2>
          <p data-reveal="" style={sx('margin:0 0 34px;max-width:620px;font-size:17px;line-height:1.6;color:#94a3b8;font-weight:500')}>{L.anlaesse.sub}</p>
          <div data-reveal="" data-stagger="" data-m="three"
            onMouseLeave={() => { clearTimeout(this._anlT); this.setState({ anlass: null }); }}
            style={sx(`display:grid;grid-template-columns:${cols};gap:20px;align-items:stretch;height:380px;transition:grid-template-columns 1.3s ${EASE}`)}>
            {L.anlaesse.cards.map((cardT, i) => {
              const onC = hov === i, a = ACC[i];
              const slim = hov !== null && !onC;
              return (
                <div key={i} data-anlass={i}
                  onMouseEnter={() => this.anlassPick(i)} onClick={() => this.anlassPick(i)}
                  style={sx(`position:relative;display:flex;flex-direction:column;gap:14px;padding:${slim ? '26px 14px' : '34px 30px 30px'};border-radius:24px;overflow:hidden;box-sizing:border-box;height:100%;min-width:0;background:linear-gradient(170deg,${a}${onC ? '2e' : '1a'},rgba(255,255,255,.02) 62%);border:1px solid ${a}${onC ? 'cc' : '3d'};box-shadow:${onC ? `0 28px 56px rgba(0,0,0,.5),0 0 46px ${a}1f` : 'none'};transition:background 1.1s ${EASE},border-color 1.1s ${EASE},box-shadow 1.1s ${EASE},padding 1.25s ${EASE}`)}>
                  <span aria-hidden="true" style={sx(`position:absolute;right:${slim ? '50%' : '26px'};bottom:${slim ? 'auto' : '-38px'};${slim ? 'top:26px;transform:translateX(50%);' : ''}font-family:'League Spartan',sans-serif;font-size:${slim ? 44 : 150}px;font-weight:900;line-height:1;color:${a};opacity:${slim ? .5 : .1};transition:font-size 1.05s ${EASE},opacity .8s ${EASE}`)}>{`0${i + 1}`}</span>
                  <span style={sx(`position:relative;align-self:flex-start;padding:5px 12px;border-radius:999px;background:${a}1f;border:1px solid ${a}59;font-size:10.5px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:${a};white-space:nowrap;opacity:${slim ? 0 : 1};max-height:${slim ? '0px' : '30px'};overflow:hidden;transition:opacity .55s ${EASE},max-height .95s ${EASE}`)}>{cardT.badge}</span>
                  <span style={sx(`position:relative;font-family:'League Spartan',sans-serif;font-size:${onC ? 34 : 27}px;font-weight:900;line-height:1.1;white-space:normal;text-wrap:balance;color:#F1F5F9;opacity:${slim ? 0 : 1};max-height:${slim ? '0px' : '120px'};overflow:hidden;transition:font-size .85s ${EASE},opacity .55s ${EASE},max-height .95s ${EASE}`)}>{cardT.title}</span>
                  <span style={sx(`position:relative;overflow:hidden;font-size:15.5px;line-height:1.6;font-weight:500;color:#cbd5e1;max-width:600px;max-height:${slim ? '0px' : '160px'};opacity:${slim ? 0 : 1};transition:max-height 1s ${EASE},opacity .5s ${EASE}`)}>{cardT.short}</span>
                  <span style={sx(`position:relative;overflow:hidden;font-size:15.5px;line-height:1.65;font-weight:500;color:#cbd5e1;max-width:620px;max-height:${onC ? '200px' : '0px'};opacity:${onC ? 1 : 0};transform:translateY(${onC ? '0' : '8px'});transition:max-height 1.2s ${EASE},opacity .8s ${EASE} ${onC ? '.3s' : '0s'},transform .95s ${EASE}`)}>{cardT.desc}</span>
                  <a href="#anfragen" data-m="anlasscta" style={sx(`position:relative;margin-top:auto;font-size:14.5px;font-weight:900;color:${a};opacity:${slim ? 0 : 1};transition:opacity .6s ${EASE}`)}>{L.anlaesse.cta}</a>
                </div>
              );
            })}
          </div>
        </div>
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
              let line = 'rgba(255,255,255,.09)', fill = 'rgba(255,255,255,.04)', badge = TEAMC + '22', badgeCol: string = TEAMC;
              let letter = 'ABCD'[i], text = '#fff';
              if (answeredNow) {
                if (right) { line = OK; fill = 'rgba(34,197,94,.16)'; badge = OK; badgeCol = '#fff'; letter = '✓'; }
                else if (chosen) { line = NO; fill = 'rgba(239,68,68,.16)'; badge = NO; badgeCol = '#fff'; letter = '✕'; }
                else { text = 'rgba(255,255,255,.4)'; badgeCol = 'rgba(255,255,255,.35)'; }
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
            <div style={sx('flex:1;min-width:0;font-size:16px;font-weight:900;line-height:1.35;color:#fff;text-wrap:pretty')}>{p.q}</div>
          </div>
          <input type="text" inputMode="numeric" value={raw0}
            onChange={e => {
              const raw = e.target.value.replace(/[^\d]/g, '').slice(0, 9);
              this.setState({ guessRaw: raw, guessDone: false });
            }}
            placeholder={L.probe.guessPlaceholder} aria-label={L.probe.guessPlaceholder}
            style={sx("width:100%;box-sizing:border-box;padding:14px 16px;border-radius:14px;background:rgba(255,255,255,.05);border:1.5px solid rgba(243,195,103,.45);color:#F59E0B;font-family:'League Spartan',sans-serif;font-size:32px;font-weight:900;text-align:center;outline:none")} />
          <button type="button"
            onClick={() => this.setState(done ? { guessDone: false, guessRaw: '' } : { guessDone: raw0 !== '' })}
            style={sx(`width:100%;padding:13px;border-radius:14px;cursor:pointer;font-family:inherit;font-size:14px;font-weight:900;letter-spacing:.06em;text-transform:uppercase;border:none;background:${done ? 'rgba(255,255,255,.06)' : col};color:${done ? '#cbd5e1' : '#0A0814'};box-shadow:0 4px 0 rgba(0,0,0,.4);transition:all .3s ${EASE}`)}>
            {done ? L.probe.guessAgain : L.probe.guessBtn}
          </button>
          <div style={sx(`overflow:hidden;box-sizing:border-box;text-align:center;font-size:13px;line-height:1.5;font-weight:800;color:#e2e8f0;max-height:${done ? '120px' : '0px'};padding:${done ? '13px' : '0 13px'};border-radius:14px;border:1px solid ${done ? gc + '80' : 'transparent'};background:${gc}14;opacity:${done ? 1 : 0};transition:max-height .5s ${EASE},padding .5s ${EASE},opacity .35s ease`)}>
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
            <div key={i} style={sx(`display:flex;align-items:center;gap:9px;padding:10px 11px;border-radius:14px;border:1px solid ${pts[i] > 0 ? col + '66' : 'rgba(255,255,255,.09)'};background:${pts[i] > 0 ? col + '14' : 'rgba(255,255,255,.03)'};box-sizing:border-box;transition:all .3s ${EASE}`)}>
              <span style={sx('flex:1;font-size:13.5px;font-weight:800;color:#fff')}>{label}</span>
              <button type="button" onClick={() => this.setState(st => { const nn = (st.points || [4, 3, 3]).slice(); if (nn[i] > 0) nn[i] -= 1; return { points: nn, pointsDone: false }; })}
                style={sx(`width:28px;height:28px;flex:none;border-radius:9px;cursor:pointer;font-family:inherit;font-size:15px;font-weight:900;border:1px solid ${col}59;background:${col}1f;color:${col}`)}>−</button>
              <span style={sx('width:26px;text-align:center;font-size:17px;font-weight:900;color:#22C55E')}>{pts[i]}</span>
              <button type="button" onClick={() => this.setState(st => { const nn = (st.points || [4, 3, 3]).slice(); if (nn.reduce((a, b) => a + b, 0) < 10) nn[i] += 1; return { points: nn, pointsDone: false }; })}
                style={sx(`width:28px;height:28px;flex:none;border-radius:9px;cursor:pointer;font-family:inherit;font-size:15px;font-weight:900;border:1px solid ${col}59;background:${col}1f;color:${col}`)}>+</button>
            </div>
          ))}
          <button type="button" onClick={() => { if (ready) this.setState(st => ({ pointsDone: !st.pointsDone })); }}
            style={sx(`width:100%;padding:12px;border-radius:14px;text-align:center;font-family:inherit;font-size:12.5px;font-weight:900;box-sizing:border-box;cursor:${ready ? 'pointer' : 'default'};border:1px solid ${ready ? col + '99' : 'rgba(255,255,255,.09)'};background:${done ? 'rgba(255,255,255,.05)' : (ready ? col : 'transparent')};color:${done ? '#cbd5e1' : (ready ? '#0A0814' : '#94a3b8')};transition:all .3s ${EASE}`)}>
            {done ? L.probe.pointsAgain : (ready ? L.probe.pointsSubmit : L.probe.pointsLeft(10 - sum))}
          </button>
          <div style={sx(`overflow:hidden;box-sizing:border-box;text-align:center;font-size:12.5px;line-height:1.5;font-weight:800;color:#e2e8f0;max-height:${done ? '130px' : '0px'};padding:${done ? '12px' : '0 12px'};margin-top:${done ? '2px' : '0'};border-radius:14px;border:1px solid ${done ? pc + '80' : 'transparent'};background:${pc}14;opacity:${done ? 1 : 0};transition:max-height .5s ${EASE},padding .5s ${EASE},opacity .35s ease`)}>
            {done ? L.probe.pointsResult(p.correctLabel, gained) : ' '}
          </div>
        </div>
      );
    }

    return (
      <section id="probieren" style={sx('border-top:1px solid rgba(250,75,163,.07);border-bottom:1px solid rgba(250,75,163,.07);background:radial-gradient(ellipse at 50% 0%,rgba(250,75,163,.1),transparent 65%)')}>
        <div data-shell="" style={sx('max-width:1180px;margin:0 auto;padding:80px 32px;display:grid;grid-template-columns:1fr 600px;gap:40px;align-items:center')} data-m="two2">
          <div>
            <div data-reveal="" style={sx('font-size:13px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;color:#FFC7E4')}>{L.probe.kicker}</div>
            {this.kicker(`[ 03 ]|${L.probe.label}`)}
            <h2 data-reveal="" style={sx("margin:12px 0 14px;font-family:'League Spartan',sans-serif;font-size:34px;font-weight:900;color:#F1F5F9")}>{L.probe.h2}</h2>
            <p data-reveal="" style={sx('margin:0 0 26px;max-width:520px;font-size:17px;line-height:1.6;color:#cbd5e1;font-weight:500')}>{L.probe.sub}</p>
            <div style={sx(`margin-bottom:26px;padding:20px 22px;border-radius:18px;border:1px solid ${col}40;border-left:3px solid ${col};background:${col}0f;transition:border-color .3s ${EASE},background .3s ${EASE}`)}>
              <div style={sx(`font-size:18px;font-weight:900;line-height:1.35;color:${col};margin-bottom:7px`)}>{catT.claim}</div>
              <div style={sx('font-size:15.5px;line-height:1.6;font-weight:500;color:#cbd5e1')}>{catT.detail}</div>
            </div>
            <div data-reveal="" style={sx('display:flex;flex-direction:column;gap:10px;font-size:15.5px;font-weight:700;color:#e2e8f0')}>
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
                    style={sx(`display:inline-flex;align-items:center;gap:12px;padding:14px 22px;border-radius:999px;cursor:pointer;font-family:inherit;font-size:16px;font-weight:900;white-space:nowrap;transform:translateX(${arc}px) scale(${onT ? 1.05 : 1});transform-origin:left center;background:${onT ? mt.col + '26' : 'rgba(255,255,255,.03)'};border:1px solid ${onT ? mt.col : 'rgba(255,255,255,.1)'};color:${onT ? mt.col : '#cbd5e1'};box-shadow:${onT ? '0 0 26px ' + mt.col + '3d' : 'none'};transition:transform .55s ${EASE},background .3s ${EASE},border-color .3s ${EASE},color .3s ${EASE},box-shadow .4s ${EASE}`)}>
                    <span style={sx(`display:block;width:30px;height:30px;flex:none;background:url(${mt.icon}) center/contain no-repeat;opacity:${onT ? 1 : .8}`)}></span>
                    {ct.name}
                  </button>
                );
              })}
            </div>
            <div style={sx('transform-style:preserve-3d;transform-origin:50% 84%;'
              + `transform:rotateX(${up ? (tilt ? -tilt.y * 9 : 0) : 64}deg) rotateY(${up && tilt ? (tilt.x * 12).toFixed(1) : 0}deg) rotateZ(${up ? 0 : -8}deg) scale(${up ? 1 : .9});`
              + `filter:brightness(${up ? 1 : .68});transition:transform ${tilt && up ? '.22s' : '1.15s'} ${EASE},filter 1.15s ${EASE}`)}>
              <div data-m="pphone" style={sx(`width:360px;height:600px;border-radius:46px;box-sizing:border-box;padding:20px 16px;display:flex;flex-direction:column;background:linear-gradient(180deg,#150c20,#0a0714);border:7px solid #06060c;box-shadow:0 0 60px ${col}3d,0 0 120px rgba(250,75,163,.16),0 30px 70px rgba(0,0,0,.6);transition:box-shadow .5s ${EASE}`)}>
                <div style={sx('display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:18px;border:1px solid rgba(168,85,247,.45);background:rgba(168,85,247,.07);margin-bottom:12px;flex:none')}>
                  <span style={sx('width:34px;height:34px;border-radius:50%;background:#A855F7 url(/assets/av3d-koala.webp) center/28px no-repeat;flex:none')}></span>
                  <span style={sx('flex:1;font-size:15px;font-weight:900;color:#A855F7')}>{L.hero.phoneTeamA}</span>
                  <span style={sx('width:26px;height:26px;border-radius:9px;border:1px solid rgba(255,255,255,.14);display:flex;align-items:center;justify-content:center;font-size:11px;color:#c49ab5')}>☰</span>
                </div>
                <div key={key} style={sx(`flex:1;min-height:0;padding:18px 16px;border-radius:22px;border:1px solid ${col}40;background:rgba(255,255,255,.025);box-sizing:border-box;overflow:hidden;animation:${PROBE_ORDER.indexOf(key) % 2 ? 'cwCardB' : 'cwCardA'} .55s ${EASE} both;transition:border-color .35s ${EASE}`)}>
                  <span style={sx(`display:inline-flex;align-items:center;padding:6px 13px;border-radius:999px;background:${col}1f;border:1px solid ${col}80;font-size:11px;font-weight:900;color:${col};flex:none`)}>{catT.name}</span>
                  {p.kind !== 'guess' && (
                    <div style={sx('margin:12px 0 14px;font-size:16px;font-weight:900;line-height:1.35;color:#fff')}>{p.q}</div>
                  )}
                  {cardBody}
                </div>
                <div style={sx('margin-top:auto;padding-top:12px;text-align:center;font-size:11px;font-weight:800;color:#94a3b8;flex:none')}>{footer}</div>
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
    const dh = this.state.duoHover ?? null;
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
    const duo = [
      { c: '#FA4BA3', bg: 'linear-gradient(160deg,rgba(250,75,163,.12),rgba(255,255,255,.02))', bd: 'rgba(250,75,163,.28)', title: L.ablauf.duo0Title, items: L.ablauf.duo0 },
      { c: '#FFC7E4', bg: 'rgba(255,255,255,.03)', bd: 'rgba(255,255,255,.1)', title: L.ablauf.duo1Title, items: L.ablauf.duo1 },
    ];
    return (
      <section id="ablauf" style={sx('border-top:1px solid rgba(250,75,163,.07)')}>
        <div data-shell="" style={sx('max-width:1180px;margin:0 auto;padding:80px 32px')}>
          {this.kicker(`[ 04 ]|${L.ablauf.label}`)}
          <h2 data-reveal="" style={sx("margin:0 0 8px;font-family:'League Spartan',sans-serif;font-size:34px;font-weight:900;color:#F1F5F9")}>{L.ablauf.h2}</h2>
          <p data-reveal="" style={sx('margin:0 0 34px;max-width:620px;font-size:17px;line-height:1.6;color:#94a3b8;font-weight:500')}>{L.ablauf.sub}</p>

          <div data-reveal="" data-m="wall" onMouseEnter={beamStart} onMouseLeave={beamStop} onClick={beamStart}
            style={sx('position:relative;margin:0 0 44px;cursor:pointer')}>
            <div style={sx('position:relative;width:100%;aspect-ratio:16/9;border-radius:22px;overflow:hidden;border:1px solid rgba(255,255,255,.08);background:#0d0a17')}>
              <img src="/assets/wand.webp" loading="lazy" decoding="async" alt="" style={sx('position:absolute;inset:0;width:100%;height:100%;object-fit:cover')} />
              <img src="/assets/wand-an.webp" loading="lazy" decoding="async" alt="" aria-hidden="true"
                style={sx(`position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:${on ? 1 : 0};transition:opacity .9s ${EASE} ${on ? '.1s' : '.15s'}`)} />
              <div data-m="screenbox" style={sx(`position:absolute;left:29.1%;top:13.7%;width:44.7%;height:31.4%;overflow:hidden;pointer-events:none;border-radius:16px;background:${on ? '#0b0714' : 'transparent'};box-shadow:${on ? '0 0 70px rgba(255,242,250,.22),0 0 22px rgba(255,242,250,.14)' : '0 0 0 rgba(0,0,0,0)'};transition:box-shadow 1.1s ${EASE} ${on ? '.2s' : '0s'},background .45s ${EASE} ${on ? '0s' : '.35s'}`)}>
                <div aria-hidden="true" style={sx(`position:absolute;inset:0;z-index:12;pointer-events:none;border-radius:14px;opacity:0;background:linear-gradient(160deg,#fffdfb,#ece2ea);animation:${on ? 'cwBeamOn 1.9s cubic-bezier(.4,0,.3,1) both' : 'none'};transition:opacity .8s ease`)}></div>
                <div style={sx(`position:absolute;left:50%;top:50%;width:${WALL_W}px;height:${WALL_H}px;transform-origin:center center;opacity:${on ? 1 : 0};transition:opacity .5s ${EASE} ${on ? '1.1s' : '0s'};transform:translate(-50%,-50%) scale(${this.state.wallScale ?? 0.8})`)}>
                  <div data-m="wallscreen" style={sx('width:640px;height:354px;box-sizing:border-box;padding:18px;border-radius:22px;background:transparent;display:flex;flex-direction:column;justify-content:center;overflow:hidden;position:relative')}>
                    <div aria-hidden="true" style={sx(`position:absolute;inset:0;z-index:9;border-radius:22px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(ellipse at 50% 45%,#141024,#0b0714 72%);opacity:${this.state.beamWelcome ? 1 : 0};pointer-events:none;transition:opacity .8s ${EASE} ${this.state.beamWelcome ? '.75s' : '0s'}`)}>
                      <div style={sx('display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:16px 40px;border-radius:20px;border:1px solid rgba(250,75,163,.35);background:rgba(250,75,163,.06)')}>
                        <span style={sx('font-size:13px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;color:#FA4BA3')}>{L.sim.welcomeKicker}</span>
                        <span style={sx("font-family:'League Spartan',sans-serif;font-size:62px;font-weight:900;letter-spacing:.02em;line-height:1;color:#FA4BA3")}>{L.sim.welcomeTitle}</span>
                      </div>
                      <div style={sx('display:flex;align-items:center;gap:14px;margin-top:26px')}>
                        <img src={LOGO} alt="" width={62} height={62} style={sx('width:62px;height:62px')} />
                        <span style={sx('padding:12px 18px;border-radius:14px;border:1px solid rgba(250,75,163,.45);background:rgba(255,255,255,.03);font-size:15px;font-weight:900;line-height:1.35;color:#F1F5F9;text-align:center')}>{L.sim.welcomeSub}</span>
                      </div>
                    </div>
                    <span aria-hidden="true" style={sx('position:absolute;inset:0;border-radius:22px;pointer-events:none;overflow:hidden')}>
                      <span style={sx('position:absolute;top:0;bottom:0;width:38%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.07),transparent)')}></span>
                    </span>
                    <span aria-hidden="true" style={sx('position:absolute;inset:0;border-radius:22px;pointer-events:none;background:radial-gradient(ellipse at 46% 44%,transparent 58%,rgba(0,0,0,.32))')}></span>
                    <div style={sx('position:relative;display:flex;align-items:center;justify-content:space-between;margin-bottom:14px')}>
                      <span style={sx(g.catPillStyle)}>{g.catName}</span>
                      <span style={sx('font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#8FA0B8')}>{g.statusLine}</span>
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
                                  <span style={sx('font-size:12px;font-weight:800;color:#fff;line-height:1.2')}>{o.label}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div style={sx(g.ringStyle)}>{g.seconds}</div>
                        </div>
                        <div style={sx('margin-top:18px;display:flex;flex-direction:column;align-items:center;gap:7px')}>
                          <span style={sx('font-size:12.5px;font-weight:900;letter-spacing:.06em;color:#94a3b8;white-space:nowrap')}>{g.answeredLine}</span>
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
                                <span style={sx('font-size:13.5px;font-weight:800;color:#8FA0B8;line-height:1.2')}>{s.sub}</span>
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

          <div data-reveal="" data-m="two" style={sx('display:grid;grid-template-columns:1fr 1fr;align-items:start;gap:20px')}>
            {duo.map((d, i) => {
              const onD = dh === i;
              return (
                <div key={i}
                  onMouseEnter={() => this.setState({ duoHover: i })}
                  onMouseLeave={() => this.setState({ duoHover: null })}
                  onClick={() => this.setState({ duoHover: i })}
                  style={sx(`position:relative;overflow:hidden;box-sizing:border-box;min-width:0;padding:32px 30px;border-radius:22px;background:${d.bg};border:1px solid ${onD ? d.c + '80' : d.bd};cursor:default;transition:padding .95s ${EASE},border-color .6s ease,background .6s ease`)}>
                  <div style={sx(`font-size:${onD ? 13 : 12}px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;white-space:nowrap;color:${d.c};transition:font-size .6s ${EASE}`)}>{d.title}</div>
                  <ul style={sx(`margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:13px;overflow:hidden;max-height:${onD ? '260px' : '0px'};margin-top:${onD ? '18px' : '0px'};opacity:${onD ? 1 : 0};transform:translateY(${onD ? '0' : '8px'});transition:max-height .95s ${EASE},margin-top .95s ${EASE},opacity .5s ease ${onD ? '.22s' : '0s'},transform .7s ${EASE}`)}>
                    {d.items.map(item => (
                      <li key={item} style={sx('display:flex;align-items:flex-start;gap:11px;font-size:16px;line-height:1.5;font-weight:600;white-space:nowrap;color:#e2e8f0')}>
                        <span style={sx(`flex:none;width:7px;height:7px;margin-top:8px;border-radius:50%;background:${d.c}`)}></span>{item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
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
      <section id="johannes" style={sx('border-top:1px solid rgba(250,75,163,.07)')}>
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
              <div style={sx('font-size:18px;font-weight:900;color:#F1F5F9')}>{L.johannes.name}</div>
              <div style={sx('font-size:13.5px;font-weight:700;letter-spacing:.04em;color:#FFC7E4')}>{L.johannes.role}</div>
            </div>
          </div>
          <div>
            <div data-reveal="" style={sx('font-size:12px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;color:#FFC7E4;margin-bottom:12px')}>{L.johannes.kicker}</div>
            <h2 data-reveal="" style={sx("margin:0 0 18px;max-width:700px;font-family:'League Spartan',sans-serif;font-size:30px;font-weight:900;line-height:1.18;color:#F1F5F9;cursor:default;hyphens:none")}>
              {L.johannes.quote.map((qw, i) => (
                <span key={i}>
                  <span style={sx(`display:inline-block;white-space:nowrap;color:${qw.hot ? '#FA4BA3' : '#F1F5F9'}`)}>{qw.w}</span>
                  {i < L.johannes.quote.length - 1 ? ' ' : ''}
                </span>
              ))}
            </h2>
            <p style={sx('margin:0 0 22px;max-width:680px;font-size:17px;line-height:1.65;font-weight:500;color:#cbd5e1')}>{L.johannes.body}</p>
            <div data-reveal="" data-stagger="" style={sx('display:flex;flex-wrap:wrap;gap:10px')}>
              {L.johannes.chips.map(chip => (
                <span key={chip} style={sx('padding:9px 16px;border-radius:999px;background:rgba(250,75,163,.1);border:1px solid rgba(250,75,163,.3);font-size:14px;font-weight:700;color:#e2e8f0;white-space:nowrap')}>{chip}</span>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  renderFaq() {
    const L = this.T;
    return (
      <section style={sx('border-top:1px solid rgba(250,75,163,.07)')}>
        <div style={sx('max-width:820px;margin:0 auto;padding:80px 32px')}>
          {this.kicker(`[ 05 ]|${L.faq.label}`)}
          <h2 data-reveal="" style={sx("margin:0 0 30px;font-family:'League Spartan',sans-serif;font-size:34px;font-weight:900;color:#F1F5F9")}>{L.faq.h2}</h2>
          <div data-reveal="" style={sx('display:flex;flex-direction:column;gap:12px')}>
            {L.faq.items.map((item, i) => (
              <details key={i} className="cwFaqCard" style={sx(`border-radius:16px;background:rgba(255,255,255,.03);border:1px solid rgba(250,75,163,.18);overflow:hidden;transition:background .25s ${EASE},border-color .25s ${EASE}`)}>
                <summary style={sx('display:flex;align-items:center;gap:14px;padding:20px 22px;font-size:17px;font-weight:800;color:#F1F5F9;list-style:none;cursor:pointer')}>
                  <span style={sx('flex:1')}>{item.q}</span>
                  <span style={sx(`font-size:20px;font-weight:900;color:#FA4BA3;transition:transform .34s ${EASE}`)} data-faq-plus="">+</span>
                </summary>
                <div style={sx(`animation:cwFaq .34s ${EASE} both;padding:0 22px 20px;font-size:15.5px;line-height:1.65;font-weight:500;color:#cbd5e1`)}>{item.a}</div>
              </details>
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
    const tab = (on: boolean) => `padding:10px 20px;border-radius:999px;border:none;cursor:pointer;white-space:nowrap;font-family:inherit;font-size:14.5px;font-weight:900;transition:background .25s ${EASE},color .25s ${EASE};background:${on ? '#FA4BA3' : 'transparent'};color:${on ? '#0A0814' : '#cbd5e1'}`;
    const inputStyle = 'width:100%;box-sizing:border-box;padding:11px 14px;border-radius:12px;background:rgba(255,255,255,.05);border:1.5px solid rgba(255,255,255,.12);color:#F1F5F9;font-family:inherit;font-size:15px;font-weight:600';
    const labelStyle = 'font-size:13px;font-weight:800;color:#cbd5e1;letter-spacing:.01em';
    const fieldWrap = 'display:flex;flex-direction:column;gap:6px';
    const req = <span aria-hidden="true" style={sx('color:#FA4BA3')}> *</span>;
    return (
      <section id="anfragen" style={sx('background:radial-gradient(ellipse at 50% 0%,rgba(250,75,163,.14),transparent 70%)')}>
        <span aria-hidden="true" style={sx('display:block;height:1px;background:linear-gradient(90deg,transparent,rgba(250,75,163,.32),transparent)')}></span>
        <div style={sx('position:relative;max-width:760px;margin:0 auto;padding:88px 32px;text-align:center')}>
          <span aria-hidden="true" style={sx('position:absolute;top:20px;left:50%;transform:translateX(-50%);width:520px;height:220px;border-radius:50%;background:radial-gradient(ellipse,rgba(250,75,163,.22),transparent 70%);pointer-events:none')}></span>
          {this.kicker(`[ 06 ]|${L.form.label}`)}
          <h2 data-reveal="" style={sx("position:relative;margin:0 0 14px;font-family:'League Spartan',sans-serif;font-size:38px;font-weight:900;color:#F1F5F9")}>{L.form.h2}</h2>
          <p style={sx('margin:0 auto 10px;max-width:560px;font-size:17.5px;line-height:1.6;font-weight:500;color:#cbd5e1')}>{L.form.sub}</p>
          <p style={sx('margin:0 auto 18px;font-size:14px;font-weight:800;letter-spacing:.02em;color:#FFC7E4')}>{L.form.avail}</p>
          <div style={sx('position:relative;display:inline-flex;gap:6px;padding:6px;border-radius:999px;background:rgba(255,255,255,.04);border:1px solid rgba(250,75,163,.22);margin:0 0 22px')}>
            <button type="button" onClick={() => this.openForm('event')} style={sx(tab(!test))}>{L.form.tabEvent}</button>
            <button type="button" onClick={() => this.openForm('test')} style={sx(tab(test))}>{L.form.tabTest}</button>
          </div>
          <div data-form-panel="" style={sx(`overflow:hidden;max-height:1800px;opacity:1;transition:max-height 1.05s ${EASE},opacity .5s ${EASE} .18s`)}>

            <div data-m="pricerow" style={sx('position:relative;display:flex;align-items:center;justify-content:center;gap:14px;flex-wrap:wrap;margin:0 0 26px')}>
              <span style={sx('display:inline-flex;align-items:baseline;gap:8px;padding:12px 22px;border-radius:999px;background:rgba(250,75,163,.12);border:1px solid rgba(250,75,163,.45)')}>
                <span style={sx("font-family:'League Spartan',sans-serif;font-size:28px;font-weight:900;color:#FA4BA3;white-space:nowrap")}>{test ? L.form.testBig : L.form.priceBig}</span>
                <span style={sx('font-size:14px;font-weight:700;color:#FFC7E4;white-space:nowrap')}>{test ? L.form.testSub : L.form.priceSub}</span>
              </span>
              <span style={sx('font-size:14.5px;font-weight:700;color:#94a3b8;text-align:left')}>
                {test ? L.form.testNote1 : L.form.priceNote1}<br />{test ? L.form.testNote2 : L.form.priceNote2}
              </span>
            </div>

            {st === 'ok' && (
              <div role="status" style={sx('max-width:560px;margin:0 auto;padding:clamp(22px,3vw,34px);border-radius:24px;background:rgba(255,255,255,.03);border:1.5px solid rgba(250,75,163,.24);box-shadow:0 16px 40px rgba(0,0,0,.35),0 0 32px rgba(250,75,163,.1);text-align:center')}>
                <div style={sx('font-size:22px;font-weight:900;color:#F1F5F9')}>{test ? L.form.okTitleTest : L.form.okTitleEvent}</div>
                <p style={sx('margin:10px 0 0;color:#cbd5e1;font-weight:500;line-height:1.6')}>{test ? L.form.okBodyTest : L.form.okBodyEvent}</p>
              </div>
            )}

            {st !== 'ok' && (
              <form key={this.state.formMode} onSubmit={this.submitForm}
                style={sx('max-width:560px;margin:0 auto;text-align:left;padding:clamp(22px,3vw,34px);border-radius:24px;background:rgba(255,255,255,.03);border:1.5px solid rgba(250,75,163,.24);box-shadow:0 16px 40px rgba(0,0,0,.35),0 0 32px rgba(250,75,163,.1)')}>
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
                        <label htmlFor="f-datum" style={sx(labelStyle)}>{L.form.datum}</label>
                        <input id="f-datum" name="datum" type="text" maxLength={120} placeholder={L.form.datumPh} style={sx(inputStyle)} />
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
                            <option key={o} value={o} style={sx('background:#171126;color:#F1F5F9')}>{o}</option>
                          ))}
                        </select>
                      </div>
                      <div style={sx(fieldWrap)}>
                        <label htmlFor="t-email" style={sx(labelStyle)}>{L.form.email}{req}</label>
                        <input id="t-email" name="email" type="email" maxLength={150} required style={sx(inputStyle)} />
                      </div>
                      <div style={sx(fieldWrap + ';grid-column:1/-1')}>
                        <label htmlFor="t-termin" style={sx(labelStyle)}>{L.form.termin}</label>
                        <input id="t-termin" name="termin" type="text" maxLength={120} placeholder={L.form.terminPh} style={sx(inputStyle)} />
                      </div>
                    </>
                  )}
                  <div style={sx(fieldWrap + ';grid-column:1/-1')}>
                    <label htmlFor="f-nachricht" style={sx(labelStyle)}>{test ? L.form.msgTest : L.form.msgEvent}</label>
                    <textarea id="f-nachricht" name="nachricht" rows={4} maxLength={2000} style={sx(inputStyle + ';resize:vertical')}></textarea>
                  </div>
                </div>

                {st === 'error' && (
                  <p role="alert" style={sx('margin:14px 0 0;color:#FCA5A5;font-weight:700;font-size:14px;text-align:center')}>
                    {L.form.errorPre}<a href="mailto:hallo@cozywolf.de" style={sx('color:#FFC7E4')}>hallo@cozywolf.de</a>{L.form.errorPost}
                  </p>
                )}

                <div style={sx('text-align:center;margin-top:20px')}>
                  <button type="submit" className="cwSubmit" style={sx(`padding:14px 30px;border-radius:999px;border:1.5px solid rgba(255,255,255,.18);background:linear-gradient(135deg,#CE1C6F,#AB0055);color:#fff;font-family:inherit;font-weight:900;font-size:16px;cursor:pointer;transition:transform .2s ${EASE},filter .2s ${EASE}`)}>
                    {st === 'sending' ? L.form.sending : (test ? L.form.submitTest : L.form.submitEvent)}
                  </button>
                </div>
                <p style={sx('margin:14px auto 0;max-width:440px;text-align:center;font-size:12.5px;line-height:1.5;color:#94a3b8;font-weight:500')}>
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
        <style>{ONEPAGE_CSS}</style>
        {this.renderHeader()}
        {this.renderHero()}
        {this.renderModes()}
        {this.renderAnlaesse()}
        <section style={sx('border-top:1px solid rgba(250,75,163,.07);border-bottom:1px solid rgba(250,75,163,.07);overflow:hidden;background:#0A0814')}>
          <div data-kinetic="" data-m="kin" style={sx("padding:56px 0;text-align:center;font-family:'League Spartan',sans-serif;font-size:clamp(26px,5vw,54px);font-weight:900;line-height:1.1;color:transparent;-webkit-text-stroke:1.2px rgba(250,75,163,.3);letter-spacing:.02em;white-space:nowrap;transition:letter-spacing .1s linear")}>{L.kinetic}</div>
        </section>
        {this.renderProbe()}
        {this.renderAblauf()}
        {this.renderJohannes()}
        {this.renderFaq()}
        {this.renderForm()}
        <footer style={sx('border-top:1px solid rgba(250,75,163,.07)')}>
          <div data-m="foot" data-shell="" style={sx('max-width:1180px;margin:0 auto;padding:30px 32px;display:flex;align-items:center;gap:20px;font-size:14px;font-weight:600;color:#94a3b8')}>
            <img src={LOGO} alt="" width={26} height={26} style={sx('width:26px;height:26px')} />
            <span style={sx('white-space:nowrap')}>{L.footer.city}</span>
            <a href="mailto:hallo@cozywolf.de" style={sx('color:#FFC7E4')}>hallo@cozywolf.de</a>
            <a href="/impressum" style={sx('color:#FFC7E4')}>{L.footer.imprint}</a>
            <a href="/datenschutz" style={sx('color:#FFC7E4')}>{L.footer.privacy}</a>
            <a href="https://instagram.com/cozywolf.events" style={sx('margin-left:auto;display:flex;align-items:center;gap:8px;color:#FFC7E4')}>@cozywolf.events</a>
          </div>
          <div data-shell="" style={sx('max-width:1180px;margin:0 auto;padding:0 32px 26px;font-size:12.5px;font-weight:600;color:#64748b')}>{L.footer.aiNote}</div>
        </footer>
        <a href="#anfragen" data-m="sticky" style={sx('position:fixed;left:14px;right:14px;bottom:14px;z-index:40;align-items:center;justify-content:center;padding:15px 20px;border-radius:999px;background:#FA4BA3;color:#0A0814;font-weight:900;font-size:16px;box-shadow:0 14px 34px rgba(0,0,0,.55)')}>{L.sticky}</a>
      </div>
    );
  }
}

export default function OnePage() {
  const lang = useLang();
  return <OnePageInner lang={lang} />;
}
