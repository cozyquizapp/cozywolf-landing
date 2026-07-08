// Cozy-Arena-Balken-Rennen-Teaser (Beamer-Look): nach jeder Frage wachsen die
// Fraktions-Balken, der Führende trägt die Krone. Teasert das Live-Rennen, ohne
// den ganzen Ablauf zu spoilern. Balken wachsen per CSS-Keyframe rein. SSR-sicher.
import { BRAND } from '../brand';
import { useLang } from '../lang';
import { Section } from '../Layout';

type Row = { slug: string; name: string; nameEn: string; color: string; val: number };

const ROWS: Row[] = [
  { slug: 'risiko',        name: 'Risiko',        nameEn: 'All In',      color: '#EF4444', val: 42 },
  { slug: 'allwissen',     name: 'Allwissen',     nameEn: 'Know-It-All', color: '#FACC15', val: 38 },
  { slug: 'bauchgefuehl',  name: 'Bauchgefühl',   nameEn: 'Gut Feeling', color: '#F97316', val: 31 },
  { slug: 'improvisation', name: 'Improvisation', nameEn: 'Wing It',     color: '#3B82F6', val: 27 },
  { slug: 'feierabend',    name: 'Feierabend',    nameEn: 'Happy Hour',  color: '#14B8A6', val: 19 },
];

export function BarRaceTeaser() {
  const de = useLang() === 'de';
  const max = Math.max(...ROWS.map(r => r.val));
  return (
    <Section>
      <style>{`@keyframes cwBarGrow { from { width: 0; } to { width: var(--cw-w); } }`}</style>
      <h2 style={secTitle}>{de ? 'Das Fraktions-Rennen' : 'The faction race'}</h2>
      <p style={{ margin: '0 auto clamp(22px, 3vh, 34px)', maxWidth: 620, textAlign: 'center', fontSize: 17, color: BRAND.inkSoft, fontWeight: 500, lineHeight: 1.6 }}>
        {de
          ? 'Nach jeder Frage wächst der Balken eurer Fraktion. Wer vorne liegt, trägt die Krone, bis ihn jemand überholt. Bis zur letzten Frage bleibt es offen.'
          : 'After each question your faction’s bar grows. Whoever leads wears the crown, until someone overtakes. It stays open until the last question.'}
      </p>

      <div style={{
        maxWidth: 620, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12,
        padding: 'clamp(16px, 2.4vw, 24px)', borderRadius: 22,
        background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(${BRAND.pinkRgb},0.16)`,
      }}>
        {ROWS.map((r, i) => {
          const pct = Math.round((r.val / max) * 100);
          const leader = i === 0;
          return (
            <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                flexShrink: 0, width: 42, height: 42, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `radial-gradient(circle at 34% 28%, ${r.color}, ${r.color}bb 65%)`,
                boxShadow: `0 3px 10px ${r.color}66, inset 0 -3px 6px rgba(0,0,0,0.25)`,
                border: '2px solid rgba(255,255,255,0.3)',
              }} aria-hidden>
                <img src={`/assets/emblem-${r.slug}.webp`} alt="" loading="lazy" decoding="async" width={26} height={26} style={{ width: 26, height: 26, objectFit: 'contain' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 15, fontWeight: 900, color: '#F1F5F9' }}>
                    {leader && <span aria-hidden style={{ marginRight: 6 }}>👑</span>}
                    {de ? r.name : r.nameEn}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 900, color: r.color, fontVariantNumeric: 'tabular-nums' }}>{r.val}</span>
                </div>
                <div style={{ height: 12, borderRadius: 999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 999,
                    background: `linear-gradient(90deg, ${r.color}, ${r.color}cc)`,
                    boxShadow: `0 0 12px ${r.color}66`,
                    ['--cw-w' as string]: `${pct}%`,
                    animation: `cwBarGrow 1s cubic-bezier(0.34,1.05,0.5,1) ${0.15 + i * 0.12}s both`,
                  }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

const secTitle: React.CSSProperties = {
  margin: '0 0 clamp(14px, 2vh, 20px)', textAlign: 'center',
  fontSize: 'clamp(26px, 3.4vw, 40px)', fontWeight: 900, color: '#F1F5F9', letterSpacing: '-0.01em',
};
