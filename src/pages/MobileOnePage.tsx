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
import { teammarke } from '../qqKachel';
import { mobileT, type MobileDict, type MobileCat } from './onepage/mobileTexts';

const EASE = 'cubic-bezier(.22,1,.36,1)';
const LOGO = '/logo.webp';

const MOBILE_CSS = `
html{background:#0A0814;color-scheme:dark;scroll-behavior:smooth;scroll-padding-top:76px}
body{margin:0;background:#0A0814;color:#F6EFE6;font-family:'Bricolage Grotesque',Nunito,system-ui,sans-serif;font-optical-sizing:auto;-webkit-font-smoothing:antialiased;overflow-x:hidden}
*{-webkit-tap-highlight-color:rgba(250,75,163,.18)}
a{color:#FA4BA3;text-decoration:none}a:hover{color:#FFC7E4}
summary::-webkit-details-marker{display:none}
input,textarea,select,button{font-family:inherit}
a:focus-visible,button:focus-visible,summary:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible{outline:3px solid #FFC7E4;outline-offset:3px;border-radius:12px}
:focus:not(:focus-visible){outline:none}
@keyframes mRise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
@keyframes mLetter{0%{transform:translateY(108%) rotate(6deg);opacity:0}100%{transform:none;opacity:1}}
@keyframes mLetterB{0%{transform:translateY(108%) rotate(6deg);opacity:0}100%{transform:none;opacity:1}}
@keyframes mPop{0%{transform:scale(.4);opacity:0}60%{transform:scale(1.12)}100%{transform:scale(1);opacity:1}}
@keyframes mBurst{0%{transform:scale(.5);opacity:.9}100%{transform:scale(2.1);opacity:0}}
@keyframes mFlip{0%{transform:rotateY(0)}100%{transform:rotateY(360deg)}}
`;

// Team-Avatare: das CozyQuiz-Objektset der App (48 Motive). Die Objekte sind
// farbneutral, die Teamfarbe kommt aus der Kachel darunter - deshalb sind hier
// Motiv und Farbe getrennt. Die Zuordnung folgt den Farb-Slots der App: die
// ersten acht Motive in COZYQUIZ_AVATARS sind index-gleich zu den acht Slots,
// also erbt jedes Team das Motiv seiner Farbe.
const TEAMS = [
  { id: 'g', color: '#22C55E', av: '/assets/av-qq-mushroom.webp' },
  { id: 'p', color: '#A855F7', av: '/assets/av-qq-crystal-ball.webp' },
  { id: 'y', color: '#FACC15', av: '/assets/av-qq-game-die.webp' },
  { id: 'o', color: '#F97316', av: '/assets/av-qq-teapot.webp' },
];

// 5x5 fuers Handy: vier Teams, dafuer grosse Felder
const BOARD = [
  'g', 'g', '', 'p', 'p',
  'g', '', 'y', 'p', '',
  '', 'y', 'y', '', 'p',
  'o', 'y', '', 'g', '',
  'o', 'o', '', '', 'g',
];

type BoardAction = { i: number; id: string; kind: 'set' | 'steal' | 'stack' | 'joker' };
const ACTIONS: BoardAction[] = [
  { i: 6, id: 'p', kind: 'set' },
  { i: 16, id: 'o', kind: 'steal' },
  { i: 8, id: 'p', kind: 'stack' },
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
  scrolled?: boolean; menu?: boolean; fan?: boolean;
  anlass?: string;
};

class MobileOnePageInner extends Component<{ lang: Lang }, MOPState> {
  state: MOPState = {
    open: 'quiz', tab: 'event', formStatus: 'idle', cat: 0, picked: null,
    step: 0, hookI: 0, wallOn: false, guess: 180, guessDone: false,
    pts: [0, 0, 0], ptsDone: false, act: -1, acts: {}, splash: false, count: 3, done: false,
  };

  private _io: IntersectionObserver | undefined;
  private _wio: IntersectionObserver | undefined;
  private _jio: IntersectionObserver | undefined;
  private _wall: HTMLElement | null = null;
  private _joh: HTMLElement | null = null;
  private _onScroll: (() => void) | undefined;
  private _onKey: ((e: KeyboardEvent) => void) | undefined;
  private _raf = 0;
  private _fill: ReturnType<typeof setInterval> | undefined;
  private _actT: ReturnType<typeof setInterval> | undefined;
  private _hookT: ReturnType<typeof setInterval> | undefined;
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
        });
      };
      window.addEventListener('scroll', this._onScroll, { passive: true });

      this._hookT = setInterval(() => {
        if (!document.hidden) this.setState(s => ({ hookI: s.hookI + 1 }));
      }, 6800);
    }

    if (this._wall) {
      this._wio = new IntersectionObserver((es) => {
        es.forEach(e => this.setState({ wallOn: e.isIntersecting && e.intersectionRatio > .45 }));
      }, { threshold: [.2, .5, .75] });
      this._wio.observe(this._wall);
    }

    // Menue mit Escape schliessen (Handoff 7: Tastaturfokus im Mobilmenue)
    this._onKey = (e) => { if (e.key === 'Escape' && this.state.menu) this.setState({ menu: false }); };
    window.addEventListener('keydown', this._onKey);

    // Die initial offene Quiz-Karte fuellt ihr Brett direkt beim Laden
    this.open('quiz');
  }

  componentWillUnmount() {
    this._io?.disconnect();
    this._wio?.disconnect();
    this._jio?.disconnect();
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
          if (p.open !== 'quiz' || p.step >= 25) {
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
        <span style={sx('flex:1;height:1px;background:linear-gradient(90deg,rgba(250,75,163,.35),transparent)')}></span>
        <span style={sx('color:rgba(246,239,230,.42)')}>{label}</span>
      </div>
    );
  }

  bullet(text: string, color: string) {
    return (
      <span key={text} style={sx('display:flex;gap:11px;font-size:15px;line-height:1.5;font-weight:700;color:#F6EFE6')}>
        <span style={sx(`flex:none;width:7px;height:7px;border-radius:50%;background:${color};margin-top:8px`)}></span>{text}
      </span>
    );
  }

  card(active: boolean, accent: string) {
    return `padding:20px;border-radius:22px;background:${active ? 'rgba(250,75,163,.06)' : 'rgba(246,239,230,.03)'};border:1px solid ${active ? accent : 'rgba(246,239,230,.09)'};cursor:pointer;transition:background .45s ${EASE},border-color .45s ${EASE}`;
  }
  bodyStyle(open: boolean) {
    return `display:grid;grid-template-rows:${open ? '1fr' : '0fr'};min-height:0;opacity:${open ? 1 : 0};transition:grid-template-rows .62s ${EASE},opacity .5s ease ${open ? '.08s' : '0s'};overflow:hidden`;
  }
  plus(open: boolean, color: string) {
    return `flex:none;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:19px;font-weight:900;color:${color};background:rgba(246,239,230,.06);transform:rotate(${open ? 45 : 0}deg);transition:transform .5s ${EASE}`;
  }

  // ------------------------------------------------- Abschnitte
  renderHeader() {
    const L = this.T;
    const s = this.state;
    const langBtn = (on: boolean) => `min-height:38px;padding:0 13px;border:0;border-radius:999px;font-size:12.5px;font-weight:900;cursor:pointer;background:${on ? '#FA4BA3' : 'transparent'};color:${on ? '#0A0814' : 'rgba(246,239,230,.62)'}`;
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
              style={sx('flex:none;width:44px;height:44px;border-radius:14px;border:1px solid rgba(246,239,230,.09);background:rgba(246,239,230,.04);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;cursor:pointer')}>
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

  renderHero() {
    const L = this.T;
    const hookI = this.state.hookI;
    const hook = L.hero.hooks[hookI % L.hero.hooks.length];
    const anim = hookI % 2 ? 'mLetterB' : 'mLetter';
    return (
      <section id="top" style={sx('position:relative;overflow:hidden;margin-top:-69px')}>
        <div style={sx('position:relative;height:320px;overflow:hidden')}>
          <img src="/assets/hero-room-m.webp" width={1040} height={693} fetchPriority="high" decoding="async" alt={L.hero.imgAlt}
            style={sx('position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:62% 50%;filter:brightness(1.16) saturate(1.04)')} />
          <span aria-hidden="true" style={sx('position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,8,20,.14) 0%,rgba(10,8,20,.2) 34%,rgba(10,8,20,.52) 62%,rgba(10,8,20,.86) 84%,#0A0814 100%)')}></span>
        </div>
        <div style={sx('position:relative;margin-top:-46px;padding:0 20px 34px')}>
          <h1 style={sx("margin:0;font-family:'League Spartan',sans-serif;font-weight:900;font-size:44px;line-height:.94;letter-spacing:-.03em")}>
            <span style={sx('display:block;padding:.14em .1em .06em;margin:-.14em -.1em -.06em;overflow:hidden;white-space:nowrap')}>
              {hook.split('').map((ch, j) => (
                <span key={`${hookI}-${j}`} style={sx(`display:inline-block;color:#F6EFE6;animation:${anim} 1.05s ${EASE} both ${(j * 0.07).toFixed(3)}s`)}>{ch === ' ' ? ' ' : ch}</span>
              ))}
            </span>
            <span style={sx(`display:block;animation:mRise .8s ${EASE} both .12s`)}>{L.hero.rest}</span>
          </h1>
          <p style={sx(`margin:16px 0 0;font-size:16.5px;line-height:1.55;font-weight:600;color:rgba(246,239,230,.78);text-wrap:pretty;animation:mRise .8s ${EASE} both .1s`)}>{L.hero.sub}</p>
          <p style={sx(`margin:10px 0 0;font-size:15px;line-height:1.55;font-weight:700;color:rgba(246,239,230,.62);text-wrap:pretty;animation:mRise .8s ${EASE} both .14s`)}>{L.hero.sub2}</p>
          <div style={sx(`margin-top:24px;display:flex;flex-direction:column;gap:11px;animation:mRise .8s ${EASE} both .18s`)}>
            <a href="#anfragen" onClick={() => this.setState({ tab: 'test', formStatus: 'idle' })}
              style={sx('display:flex;flex-direction:column;align-items:center;gap:3px;padding:16px 20px;border-radius:18px;background:#F6EFE6;color:#0A0814;font-weight:900;font-size:17px;min-height:56px;box-sizing:border-box;justify-content:center;box-shadow:0 10px 26px rgba(0,0,0,.5)')}>
              {L.hero.cta}<span style={sx('font-size:13px;font-weight:800;opacity:.72')}>{L.hero.ctaSub}</span>
            </a>
            <div style={sx('display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap')}>
              <span style={sx('font-size:14.5px;font-weight:600;color:rgba(246,239,230,.62)')}>{L.hero.bookQ}</span>
              <a href="#anfragen" onClick={() => this.setState({ tab: 'event', formStatus: 'idle' })}
                style={sx('display:inline-flex;align-items:center;min-height:44px;padding:0 16px;border-radius:999px;border:1px solid rgba(246,239,230,.20);color:#F6EFE6;font-weight:800;font-size:14.5px')}>{L.hero.bookCta}</a>
            </div>
          </div>
          <div style={sx('margin-top:22px;display:flex;align-items:center;gap:9px;font-size:14px;font-weight:700;letter-spacing:.01em;color:rgba(246,239,230,.72)')}>
            <span style={sx('flex:none;width:7px;height:7px;border-radius:50%;background:#FA4BA3')}></span>
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
    const GS = 5, RAD = 12;
    const owner = BOARD.map((b, i) => {
      const ov = acts[i];
      if (ov) return ov.id;
      return i < s.step ? b : '';
    });
    const at = (r: number, c: number) => (r < 0 || c < 0 || r >= GS || c >= GS) ? null : owner[r * GS + c];
    const actTeam = s.act >= 0 ? TEAMS.find(t => t.id === ACTIONS[s.act].id) : null;

    return (
      <section id="spielarten" style={sx('padding:14px 20px 42px;border-top:1px solid rgba(246,239,230,.10)')}>
        {this.kicker('[ 01 ]', L.modes.label)}
        <h2 data-rv="" style={sx("margin:0 0 6px;font-family:'League Spartan',sans-serif;font-size:29px;font-weight:900;letter-spacing:-.015em")}>{L.modes.h2}</h2>
        <p data-rv="" style={sx('margin:0 0 22px;font-size:15.5px;line-height:1.6;color:rgba(246,239,230,.62);font-weight:600;text-wrap:pretty')}>{L.modes.sub}</p>

        <div data-rv="" style={sx('display:flex;flex-direction:column;gap:14px')}>
          <div onClick={() => this.open(s.open === 'quiz' ? null : 'quiz')} style={sx(this.card(s.open === 'quiz', 'rgba(250,75,163,.45)'))}>
            <div style={sx('display:flex;align-items:center;gap:12px')}>
              <span style={sx("font-family:'League Spartan',sans-serif;font-size:22px;font-weight:900;color:#F6EFE6")}>CozyQuiz</span>
              <span style={sx('margin-left:auto;padding:5px 11px;border-radius:999px;background:rgba(246,239,230,.05);border:1px solid rgba(246,239,230,.20);font-size:11.5px;font-weight:900;color:#F6EFE6;white-space:nowrap')}>{L.modes.quizChip}</span>
              <span style={sx(this.plus(s.open === 'quiz', '#FA4BA3'))}>+</span>
            </div>
            <p style={sx('margin:10px 0 0;font-size:15px;line-height:1.55;color:rgba(246,239,230,.78);font-weight:600;text-wrap:pretty')}>{L.modes.quizP}</p>
            <div style={sx('margin-top:14px;display:flex;align-items:center;gap:9px')}>
              <div style={sx('display:flex')}>
                {TEAMS.map((t, i) => (
                  <span key={t.id} style={sx(teammarke(t.color, t.av, 32) + `border:2px solid #0f0a1a;margin-left:${i ? '-10px' : '0'};`)}></span>
                ))}
              </div>
              <span style={sx('font-size:12.5px;font-weight:800;letter-spacing:.04em;color:rgba(246,239,230,.42)')}>{L.modes.quizTeams}</span>
            </div>
            <div style={sx(this.bodyStyle(s.open === 'quiz'))}>
              <div style={sx('min-height:0;overflow:hidden;padding-top:16px;display:flex;flex-direction:column;gap:12px')}>
                {L.modes.quizBullets.map(b => this.bullet(b, '#FA4BA3'))}
                <div style={sx('width:100%;max-width:212px;margin:4px auto 0')}>
                  <div style={sx(`padding:9px;border-radius:16px;background:rgba(246,239,230,.015);border:1.5px solid ${actTeam ? actTeam.color : 'rgba(246,239,230,.1)'};box-shadow:${actTeam ? '0 0 24px ' + actTeam.color + '44' : 'none'};transition:border-color .5s ease,box-shadow .5s ease`)}>
                    <div style={sx('display:grid;grid-template-columns:repeat(5,1fr);gap:4px')}>
                      {owner.map((id, i) => {
                        const ov = acts[i];
                        const t = id ? TEAMS.find(x => x.id === id) : null;
                        const cellBase = 'position:relative;aspect-ratio:1;box-sizing:border-box;display:flex;align-items:center;justify-content:center;transition:background .45s ' + EASE + ',box-shadow .45s ' + EASE + ';';
                        if (!t) return <span key={i} style={sx(cellBase + `border-radius:${RAD}px;background:rgba(246,239,230,.028);border:1px solid rgba(246,239,230,.05)`)}></span>;
                        const r = Math.floor(i / GS), c = i % GS, col = t.color;
                        const nT = at(r - 1, c) === id, nR = at(r, c + 1) === id, nB = at(r + 1, c) === id, nL = at(r, c - 1) === id;
                        const rTL = (nT || nL) ? 0 : RAD, rTR = (nT || nR) ? 0 : RAD, rBR = (nB || nR) ? 0 : RAD, rBL = (nB || nL) ? 0 : RAD;
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
                            + `border-radius:${rTL}px ${rTR}px ${rBR}px ${rBL}px;background:${col};box-shadow:${shadow};`
                            + `border-top:${edge(nT)};border-right:${edge(nR)};border-bottom:${edge(nB)};border-left:${edge(nL)}`)}>
                            <span style={sx(`width:74%;height:74%;background:url(${t.av}) center/contain no-repeat;filter:drop-shadow(0 2px 3px rgba(0,0,0,.45));animation:${ov && ov.kind === 'joker' ? 'mFlip .8s ' + EASE + ' both' : 'mPop .42s cubic-bezier(.34,1.56,.64,1) both'}`)}></span>
                            {isStack && <span style={sx(`position:absolute;right:6%;bottom:6%;width:46%;height:46%;background:url(${t.av}) center/contain no-repeat;filter:drop-shadow(0 2px 4px rgba(0,0,0,.6));animation:mPop .5s cubic-bezier(.34,1.56,.64,1) both .12s`)}></span>}
                            {!!ov && (ov.kind === 'steal' || ov.kind === 'joker') && <span style={sx(`position:absolute;inset:-3px;border-radius:${RAD + 3}px;border:2px solid ${col};pointer-events:none;animation:mBurst .7s ease-out both`)}></span>}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div style={sx(`margin-top:12px;min-height:38px;display:flex;align-items:center;justify-content:center;text-align:center;font-size:13.5px;font-weight:900;line-height:1.4;color:${s.act < 0 ? 'rgba(246,239,230,.42)' : (actTeam ? actTeam.color : 'rgba(246,239,230,.42)')};transition:color .4s ease`)}>
                  {s.act < 0 ? L.modes.actIdle : L.modes.actions[s.act]}
                </div>
              </div>
            </div>
          </div>

          <div onClick={() => this.open(s.open === 'arena' ? null : 'arena')} style={sx(this.card(s.open === 'arena', 'rgba(96,165,250,.45)'))}>
            <div style={sx('display:flex;align-items:center;gap:12px')}>
              <span style={sx("font-family:'League Spartan',sans-serif;font-size:22px;font-weight:900;color:#60A5FA")}>CozyArena</span>
              <span style={sx('margin-left:auto;padding:5px 11px;border-radius:999px;background:rgba(96,165,250,.14);border:1px solid rgba(96,165,250,.3);font-size:11.5px;font-weight:900;color:#BFDBFE;white-space:nowrap')}>{L.modes.arenaChip}</span>
              <span style={sx(this.plus(s.open === 'arena', '#60A5FA'))}>+</span>
            </div>
            <p style={sx('margin:10px 0 0;font-size:15px;line-height:1.55;color:rgba(246,239,230,.78);font-weight:600;text-wrap:pretty')}>{L.modes.arenaP}</p>
            <div style={sx('margin-top:14px;display:flex;align-items:center;gap:9px')}>
              <div style={sx('display:flex')}>
                {L.factions.map((fa, i) => (
                  <span key={fa.file} style={sx(`width:32px;height:32px;border-radius:50%;flex:none;background:#111827 url(/assets/crest-${fa.file}.webp) center/78% no-repeat;border:2px solid ${fa.color}88;margin-left:${i ? '-11px' : '0'};box-shadow:0 3px 8px rgba(0,0,0,.45)`)}></span>
                ))}
              </div>
              <span style={sx('font-size:12.5px;font-weight:800;letter-spacing:.04em;color:rgba(246,239,230,.42)')}>{L.modes.arenaFactions}</span>
            </div>
            <div style={sx(this.bodyStyle(s.open === 'arena'))}>
              <div style={sx('min-height:0;overflow:hidden;padding-top:16px;display:flex;flex-direction:column;gap:12px')}>
                {L.modes.arenaBullets.map(b => this.bullet(b, '#60A5FA'))}
                <div style={sx('margin-top:4px;padding:12px;border-radius:16px;background:rgba(246,239,230,.03);border:1px solid rgba(246,239,230,.08);display:flex;flex-direction:column;gap:8px')}>
                  {L.factions.slice(0, 3).map((b, i) => (
                    <div key={b.file} style={sx('display:flex;align-items:center;gap:9px')}>
                      <span style={sx(`flex:none;width:26px;height:26px;background:url(/assets/crest-${b.file}.webp) center/contain no-repeat`)}></span>
                      <span style={sx('flex:1;min-width:0;display:flex;flex-direction:column;gap:3px')}>
                        <span style={sx('font-size:12.5px;font-weight:900;color:#F6EFE6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>{b.name}</span>
                        <span style={sx('height:6px;border-radius:999px;background:rgba(246,239,230,.07);overflow:hidden')}>
                          <span style={sx(`display:block;height:100%;width:${s.open === 'arena' ? b.p : 0}%;border-radius:999px;background:${b.color};transition:width 1.1s ${EASE} ${i * .12}s`)}></span>
                        </span>
                      </span>
                      <span style={sx(`flex:none;width:28px;text-align:right;font-size:12.5px;font-weight:900;color:${b.color}`)}>{b.p}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
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
    let hint = '', hintCol = 'rgba(246,239,230,.42)';

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
                  style={sx('flex:none;width:38px;height:38px;border-radius:12px;border:1px solid rgba(246,239,230,.14);background:rgba(246,239,230,.05);color:#F6EFE6;font-size:19px;font-weight:900;cursor:pointer')}>−</button>
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
                  style={sx('flex:none;width:38px;height:38px;border-radius:12px;border:1px solid rgba(246,239,230,.14);background:rgba(246,239,230,.05);color:#F6EFE6;font-size:19px;font-weight:900;cursor:pointer')}>+</button>
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
        {this.kicker('[ 02 ]', L.probe.label)}
        <h2 data-rv="" style={sx("margin:0 0 6px;font-family:'League Spartan',sans-serif;font-size:29px;font-weight:900;text-wrap:balance")}>{L.probe.h2}</h2>
        <p data-rv="" style={sx('margin:0 0 20px;font-size:15.5px;line-height:1.6;color:rgba(246,239,230,.78);font-weight:600;text-wrap:pretty')}>{L.probe.sub}</p>

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
              style={sx('margin-top:10px;display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:0 18px;border-radius:999px;border:1px solid rgba(246,239,230,.20);background:transparent;color:#F6EFE6;font-weight:800;font-size:14.5px;cursor:pointer')}>{L.probe.doneAgain}</button>
          </div>
        )}

        {!s.done && s.splash && (
          <div role="status" aria-live="polite" onClick={skip}
            style={sx(`border-radius:26px;padding:34px 22px 26px;background:radial-gradient(ellipse at 50% 34%,${N.col}22,#0b0714 70%);border:1px solid ${N.col}55;box-shadow:0 18px 44px rgba(0,0,0,.45);display:flex;flex-direction:column;align-items:center;min-height:470px;box-sizing:border-box;justify-content:center`)}>
            <span aria-hidden="true" style={sx(`flex:none;display:block;width:92px;height:92px;background:url(${N.icon}) center/contain no-repeat;filter:drop-shadow(0 6px 22px rgba(0,0,0,.5))`)}></span>
            <div style={sx(`margin-top:16px;font-family:'League Spartan',sans-serif;font-size:38px;font-weight:900;letter-spacing:-.02em;line-height:1;color:${N.col}`)}>{N.name}</div>
            <div style={sx('margin-top:8px;font-size:15px;line-height:1.5;font-weight:800;color:rgba(246,239,230,.78);text-align:center;text-wrap:pretty')}>{N.claim}</div>
            <div style={sx(`margin-top:22px;width:46px;height:46px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'League Spartan',sans-serif;font-size:24px;font-weight:900;color:#0A0814;background:${N.col};box-shadow:0 0 24px ${N.col}66`)}>{s.count}</div>
            <div style={sx('margin-top:12px;font-size:12.5px;font-weight:800;letter-spacing:.06em;color:rgba(246,239,230,.42)')}>{L.probe.skipHint}</div>
          </div>
        )}

        {!s.done && !s.splash && (
          <div role="region" aria-live="polite"
            style={sx(`border-radius:26px;padding:18px;min-height:470px;box-sizing:border-box;background:radial-gradient(ellipse at 50% 0%,${C.col}1f,#0b0714 62%);border:1.5px solid ${C.col}66;box-shadow:0 18px 44px rgba(0,0,0,.45),0 0 26px ${C.col}22;transition:border-color .5s ease,box-shadow .5s ease,background .5s ease`)}>
            <div style={sx('display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px')}>
              <span style={sx(`padding:6px 13px;border-radius:999px;background:${C.col}22;border:1px solid ${C.col}66;font-size:11.5px;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:${C.col};white-space:nowrap;flex:none`)}>{C.name}</span>
              <span style={sx('font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:rgba(246,239,230,.42)')}>{`${L.probe.progress(s.cat + 1, L.probe.cats.length)} · ${L.probe.team}`}</span>
            </div>
            <div style={sx('font-size:14px;font-weight:800;line-height:1.4;color:rgba(246,239,230,.62);margin-bottom:14px')}>{C.claim}</div>
            {body}
            <div style={sx(`margin-top:14px;font-size:13.5px;line-height:1.55;font-weight:700;color:${hintCol};text-wrap:pretty`)}>{hint}</div>
          </div>
        )}
      </section>
    );
  }

  renderAnlaesse() {
    const L = this.T;
    return (
      <section id="anlaesse" style={sx('padding:36px 20px 42px;border-top:1px solid rgba(246,239,230,.10)')}>
        {this.kicker('[ 03 ]', L.anlaesse.label)}
        <h2 data-rv="" style={sx("margin:0 0 6px;font-family:'League Spartan',sans-serif;font-size:29px;font-weight:900")}>{L.anlaesse.h2}</h2>
        <p data-rv="" style={sx('margin:0 0 22px;font-size:15.5px;line-height:1.6;color:rgba(246,239,230,.62);font-weight:600;text-wrap:pretty')}>{L.anlaesse.sub}</p>
        <div data-rv="" style={sx('display:flex;flex-direction:column;gap:12px')}>
          {L.anlaesse.cards.map((c, i) => (
            <div key={i} style={sx('padding:20px;border-radius:20px;background:rgba(246,239,230,.03);border:1px solid rgba(246,239,230,.20)')}>
              <div style={sx('display:flex;align-items:center;gap:10px;margin-bottom:8px')}>
                <span style={sx('font-size:11px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:rgba(246,239,230,.62)')}>{c.badge}</span>
                <span style={sx("margin-left:auto;font-family:'League Spartan',sans-serif;font-size:15px;font-weight:900;color:rgba(250,75,163,.35)")}>{`0${i + 1}`}</span>
              </div>
              <div style={sx("font-family:'League Spartan',sans-serif;font-size:21px;font-weight:900;margin-bottom:8px")}>{c.title}</div>
              <p style={sx('margin:0 0 14px;font-size:14.5px;line-height:1.6;color:rgba(246,239,230,.78);font-weight:600;text-wrap:pretty')}>{c.p}</p>
              <a href="#anfragen" onClick={() => this.setState({ tab: 'event', formStatus: 'idle', anlass: this.T.form.anlassOpts[Math.min(i, 2)] })}
                style={sx('display:inline-flex;align-items:center;min-height:44px;padding:0 18px;border-radius:999px;background:rgba(246,239,230,.05);border:1px solid rgba(246,239,230,.20);color:#F6EFE6;font-weight:900;font-size:14.5px')}>{L.anlaesse.cta}</a>
            </div>
          ))}
        </div>
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
        <div ref={el => { this._wall = el; }} data-rv="" style={sx('position:relative;overflow:hidden;margin:0 -20px 26px')}>
          <img src="/assets/wand.webp" loading="lazy" decoding="async" alt={L.ablauf.wallAltOff} style={sx('display:block;width:100%;height:auto')} />
          <img src="/assets/wand-an.webp" loading="lazy" decoding="async" alt="" aria-hidden="true"
            style={sx(`position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:${s.wallOn ? 1 : 0};transition:opacity 1.5s ${EASE}`)} />
          <div style={sx(`position:absolute;left:29.1%;top:13.7%;width:44.7%;height:31.4%;border-radius:8px;overflow:hidden;container-type:inline-size;display:flex;align-items:center;justify-content:center;background:${s.wallOn ? '#0b0714' : 'transparent'};box-shadow:${s.wallOn ? '0 0 46px rgba(255,242,250,.2)' : 'none'};transition:background 1.1s ease,box-shadow 1.3s ease`)}>
            <div style={sx(`display:flex;flex-direction:column;align-items:center;opacity:${s.wallOn ? 1 : 0};transform:scale(${s.wallOn ? 1 : .92});transition:opacity .9s ease ${s.wallOn ? '1.15s' : '0s'},transform 1.1s ${EASE} ${s.wallOn ? '1.15s' : '0s'}`)}>
              <div style={sx('display:flex;flex-direction:column;align-items:center;gap:.4cqw;padding:2cqw 5cqw;border-radius:3cqw;border:1px solid rgba(246,239,230,.20);background:rgba(246,239,230,.05)')}>
                <span style={sx('font-size:2.6cqw;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:rgba(246,239,230,.62);white-space:nowrap;line-height:1.2')}>{L.ablauf.welcomeKicker}</span>
                <span style={sx("font-family:'League Spartan',sans-serif;font-size:9.4cqw;font-weight:900;letter-spacing:.02em;line-height:1;color:#F6EFE6")}>{L.ablauf.welcomeTitle}</span>
              </div>
              <div style={sx('display:flex;align-items:center;gap:2.4cqw;margin-top:2.2cqw')}>
                <img src={LOGO} alt="" loading="lazy" width={26} height={26} style={sx('width:8.6cqw;height:8.6cqw;object-fit:contain')} />
                <span style={sx('padding:1.6cqw 2.8cqw;border-radius:2.4cqw;border:1px solid rgba(246,239,230,.20);background:rgba(246,239,230,.03);font-size:3cqw;font-weight:900;line-height:1.25;color:#F6EFE6;text-align:center;white-space:nowrap')}>{L.ablauf.welcomeSub}</span>
              </div>
            </div>
          </div>
        </div>
        <div data-rv="" style={sx('padding:20px;border-radius:20px;background:rgba(246,239,230,.05);border:1px solid rgba(246,239,230,.20);display:flex;flex-direction:column;gap:16px')}>
          <div style={sx('display:flex;gap:12px')}>
            <span style={sx('flex:none;width:7px;height:7px;border-radius:50%;background:#FA4BA3;margin-top:9px')}></span>
            <span style={sx('flex:1;font-size:15.5px;line-height:1.55;font-weight:700;color:#F6EFE6')}><strong style={sx('color:#FFC7E4')}>{L.ablauf.bringT}</strong> {L.ablauf.bring}</span>
          </div>
          <div style={sx('display:flex;gap:12px')}>
            <span style={sx('flex:none;width:7px;height:7px;border-radius:50%;background:rgba(246,239,230,.42);margin-top:9px')}></span>
            <span style={sx('flex:1;font-size:15.5px;line-height:1.55;font-weight:700;color:rgba(246,239,230,.78)')}><strong style={sx('color:#F6EFE6')}>{L.ablauf.needT}</strong> {L.ablauf.need}</span>
          </div>
        </div>
      </section>
    );
  }

  renderJohannes() {
    const L = this.T;
    const a = !!this.state.fan;
    const fanSide = (x: string, deg: number, delay: string) =>
      `position:absolute;left:0;top:0;width:150px;height:150px;border-radius:50%;overflow:hidden;border:1.5px solid rgba(250,75,163,.3);box-shadow:0 10px 24px rgba(0,0,0,.4);transform-origin:50% 50%;transform:translateX(${a ? x : '0'}) scale(${a ? .78 : .9}) rotate(${a ? deg : 0}deg);opacity:${a ? 1 : 0};transition:transform .95s ${EASE}${delay},opacity .6s ease${delay}`;
    return (
      <section id="johannes" style={sx('padding:36px 20px 42px;border-top:1px solid rgba(246,239,230,.10)')}>
        <div data-rv="" style={sx('display:flex;flex-direction:column;align-items:center;text-align:center;gap:16px')}>
          <div ref={el => {
            if (!el || this._joh === el) return;
            this._joh = el;
            this._jio?.disconnect();
            this._jio = new IntersectionObserver((es) => {
              es.forEach(e => this.setState({ fan: e.isIntersecting && e.intersectionRatio > .55 }));
            }, { threshold: [.2, .6, .8] });
            this._jio.observe(el);
          }} style={sx('position:relative;width:150px;height:150px')}>
            <div style={sx(fanSide('-88px', -15, ''))}>
              <img src="/assets/johannes-arm1.webp" loading="lazy" decoding="async" alt="" style={sx('display:block;width:100%;height:100%;object-fit:cover;border-radius:50%')} />
            </div>
            <div style={sx(fanSide('88px', 15, ' .08s'))}>
              <img src="/assets/johannes-arm2.webp" loading="lazy" decoding="async" alt="" style={sx('display:block;width:100%;height:100%;object-fit:cover;border-radius:50%')} />
            </div>
            <img src="/assets/johannes-rund.jpg" loading="lazy" decoding="async" width={150} height={150} alt={L.johannes.photoAlt}
              style={sx(`position:absolute;inset:0;width:150px;height:150px;border-radius:50%;object-fit:cover;border:2px solid rgba(250,75,163,.45);box-shadow:0 12px 30px rgba(0,0,0,.45);z-index:2;transform:scale(${a ? .94 : 1});transition:transform .9s ${EASE}`)} />
          </div>
          <div style={sx('font-size:11px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;color:rgba(246,239,230,.62)')}>{L.johannes.kicker}</div>
          <h2 style={sx("margin:0;font-family:'League Spartan',sans-serif;font-size:22px;font-weight:900;line-height:1.28;text-wrap:pretty")}>
            {L.johannes.quote.map((seg, i) => seg.hot
              ? <span key={i} style={sx('color:#FA4BA3')}>{seg.t}</span>
              : <span key={i}>{seg.t}</span>)}
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
    const tab = (on: boolean) => `min-height:46px;padding:0 12px;border:0;border-radius:999px;font-size:14px;font-weight:900;cursor:pointer;background:${on ? '#FA4BA3' : 'transparent'};color:${on ? '#0A0814' : 'rgba(246,239,230,.62)'};transition:background .3s ease,color .3s ease`;
    const inputStyle = 'width:100%;box-sizing:border-box;min-height:52px;padding:0 14px;border-radius:14px;background:rgba(246,239,230,.05);border:1.5px solid rgba(246,239,230,.20);color:#F6EFE6;font-size:16px;font-weight:700;outline:none';
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
            <p style={sx('margin:0;font-size:12.5px;line-height:1.5;color:rgba(246,239,230,.42);font-weight:600')}>
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
          {this.renderProbe()}
          {this.renderAnlaesse()}
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
              <a href="/impressum" style={sx('display:inline-flex;align-items:center;min-height:44px;padding:0 14px;border-radius:12px;background:rgba(246,239,230,.04);border:1px solid rgba(246,239,230,.20);font-size:14.5px;font-weight:800')}>{L.footer.imprint}</a>
              <a href="/datenschutz" style={sx('display:inline-flex;align-items:center;min-height:44px;padding:0 14px;border-radius:12px;background:rgba(246,239,230,.04);border:1px solid rgba(246,239,230,.20);font-size:14.5px;font-weight:800')}>{L.footer.privacy}</a>
              <a href={INSTA_URL} style={sx('display:inline-flex;align-items:center;min-height:44px;padding:0 14px;border-radius:12px;background:rgba(246,239,230,.04);border:1px solid rgba(246,239,230,.20);font-size:14.5px;font-weight:800')}>{L.footer.instagram}</a>
            </div>
            <div style={sx('font-size:12.5px;line-height:1.6;color:rgba(246,239,230,.42);font-weight:600')}>{L.footer.aiNote}</div>
          </footer>

          <div style={sx('position:fixed;left:0;right:0;bottom:0;z-index:50;display:flex;justify-content:center;padding:10px 16px calc(10px + env(safe-area-inset-bottom));background:linear-gradient(180deg,rgba(10,8,20,0),rgba(10,8,20,.94) 42%);pointer-events:none')}>
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
