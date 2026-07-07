// Full-Bleed Navy-Zahlen-Band: bricht die immer gleiche zentrierte Card-Grid-
// Monotonie (Design-Audit) UND bringt endlich die dritte Markenfarbe (Navy) als
// echtes durchgehendes Band ins Spiel. Grosse Zahlen in League Spartan.
import { BRAND, FONT_DISPLAY } from '../brand';
import { useLang } from '../lang';

type Stat = { numDe: string; numEn: string; de: string; en: string };

const DEFAULT: Stat[] = [
  { numDe: 'bis zu 100', numEn: 'up to 100', de: 'Gäste pro Abend', en: 'guests per night' },
  { numDe: '5', numEn: '5', de: 'Fragetypen', en: 'question types' },
  { numDe: '8', numEn: '8', de: 'Fraktionen', en: 'factions' },
  { numDe: '90 bis 120', numEn: '90 to 120', de: 'Minuten Programm', en: 'minutes of show' },
];

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
            }}>{de ? s.numDe : s.numEn}</span>
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
