// Full-Bleed Navy-Zahlen-Band: bricht die immer gleiche zentrierte Card-Grid-
// Monotonie (Design-Audit) UND bringt endlich die dritte Markenfarbe (Navy) als
// echtes durchgehendes Band ins Spiel. Grosse Zahlen in League Spartan.
import { useEffect, useRef, useState } from 'react';
import { BRAND, FONT_DISPLAY } from '../brand';
import { useLang } from '../lang';

type Stat = { numDe: string; numEn: string; de: string; en: string };

const DEFAULT: Stat[] = [
  { numDe: 'bis zu 100', numEn: 'up to 100', de: 'Mitspieler pro Event', en: 'players per event' },
  { numDe: '5', numEn: '5', de: 'Fragetypen', en: 'question types' },
  { numDe: '8', numEn: '8', de: 'Fraktionen', en: 'factions' },
  { numDe: '90 bis 120', numEn: '90 to 120', de: 'Minuten Programm', en: 'minutes of show' },
];

// Zaehlt die Zahl(en) in einem String von 0 hoch, sobald der Streifen in den
// Viewport scrollt. SSR-/no-JS-sicher: rendert initial den finalen Wert (Crawler
// sehen die echte Zahl); erst on-mount startet die Animation. Reduced-Motion:
// bleibt statisch. Mehrere Zahlen (z.B. "90 bis 120") laufen gemeinsam hoch.
function CountUp({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const parts = text.split(/(\d+)/);
  const targets = parts.map((p) => (/^\d+$/.test(p) ? parseInt(p, 10) : null));
  const [vals, setVals] = useState<(number | null)[]>(targets);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setVals(targets.map((t) => (t === null ? null : 0)));
    let raf = 0;
    let started = false;
    const run = () => {
      const dur = 1100;
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / dur);
        const e = 1 - Math.pow(1 - p, 3); // easeOutCubic
        setVals(targets.map((t) => (t === null ? null : Math.round(t * e))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (en.isIntersecting && !started) { started = true; run(); io.disconnect(); }
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <span ref={ref}>{parts.map((p, i) => (vals[i] === null ? p : vals[i])).join('')}</span>;
}

export function StatsBand({ items = DEFAULT }: { items?: Stat[] }) {
  const de = useLang() === 'de';
  return (
    <div style={{
      width: '100%',
      background: `linear-gradient(180deg, ${BRAND.navy} 0%, #172247 100%)`,
      borderTop: `1px solid rgba(${BRAND.pinkRgb},0.20)`,
      borderBottom: `1px solid rgba(${BRAND.pinkRgb},0.20)`,
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
    }}>
      <div style={{
        maxWidth: 1120, margin: '0 auto', padding: 'clamp(32px, 5vh, 56px) 20px',
        display: 'grid', gap: 'clamp(20px, 3vw, 40px)',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))',
        textAlign: 'center',
      }}>
        {items.map((s, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{
              fontFamily: FONT_DISPLAY, fontWeight: 800, letterSpacing: '-0.01em',
              fontSize: 'clamp(34px, 4.6vw, 58px)', lineHeight: 1,
              color: BRAND.pink, textShadow: `0 4px 24px rgba(${BRAND.pinkRgb},0.35)`,
            }}><CountUp text={de ? s.numDe : s.numEn} /></span>
            <span style={{
              fontSize: 'clamp(12px, 1.4vw, 15px)', fontWeight: 800, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: 'rgba(226,232,240,0.72)',
            }}>{de ? s.de : s.en}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
