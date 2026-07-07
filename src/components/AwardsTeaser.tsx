// Krönung + Awards-Teaser (Beamer-Finale): am Ende wird die Sieger-Fraktion
// gekrönt, dazu die 3 Fraktions-Awards. Teasert das Finale, ohne den Ausgang zu
// spoilern (Beispiel-Fraktionen). SSR-sicher, sanfte Einblendung.
import { BRAND } from '../brand';
import { useLang } from '../lang';
import { Section } from '../Layout';

const WINNER = { slug: 'risiko', name: 'Risiko', nameEn: 'All In', color: '#EF4444', de: 'Alles oder nichts.', en: 'All or nothing.' };

const AWARDS = [
  { award: 'award-speedy',       color: '#FACC15', slug: 'allwissen',     name: 'Allwissen',     nameEn: 'Know-It-All', de: 'Schnellstes Team',     en: 'Fastest team' },
  { award: 'award-sharpshooter', color: '#F97316', slug: 'bauchgefuehl',  name: 'Bauchgefühl',   nameEn: 'Gut Feeling', de: 'Treffsicherstes Team', en: 'Sharpest team' },
  { award: 'award-underdog',     color: '#3B82F6', slug: 'improvisation', name: 'Improvisation', nameEn: 'Wing It',     de: 'Beste Aufholjagd',     en: 'Best comeback' },
];

export function AwardsTeaser() {
  const de = useLang() === 'de';
  return (
    <Section>
      <style>{`
        @keyframes cwCrownFloat { 0%,100% { transform: translateX(-50%) translateY(0) rotate(-8deg); } 50% { transform: translateX(-50%) translateY(-6px) rotate(-8deg); } }
        @keyframes cwRise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
      `}</style>
      <h2 style={secTitle}>{de ? 'Und am Ende wird gekrönt' : 'And in the end, a crowning'}</h2>
      <p style={{ margin: '0 auto clamp(24px, 3.5vh, 40px)', maxWidth: 620, textAlign: 'center', fontSize: 17, color: BRAND.inkSoft, fontWeight: 500, lineHeight: 1.6 }}>
        {de ? 'Die Sieger-Fraktion wird gefeiert, dazu gibt es kleine Auszeichnungen. Wer sie holt, entscheidet sich erst am Ende des Abends.'
            : 'The winning faction is celebrated, with a few small awards. Who takes them is only decided at the very end.'}
      </p>

      {/* Sieger-Krönung */}
      <div style={{
        maxWidth: 460, margin: '0 auto clamp(24px, 3.5vh, 40px)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center',
        padding: 'clamp(24px, 3.5vw, 40px)', borderRadius: 24,
        background: `radial-gradient(ellipse 70% 90% at 50% 20%, ${WINNER.color}22, transparent 70%), rgba(255,255,255,0.03)`,
        border: `1.5px solid ${WINNER.color}55`,
      }}>
        <div style={{ position: 'relative' }}>
          <span aria-hidden style={{ position: 'absolute', top: -26, left: '50%', transform: 'translateX(-50%) rotate(-8deg)', fontSize: 34, animation: 'cwCrownFloat 3s ease-in-out infinite' }}>👑</span>
          <div style={{
            width: 120, height: 120,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `radial-gradient(circle, ${WINNER.color}44, transparent 68%)`,
          }}>
            <img src={`/assets/crest-${WINNER.slug}.png`} alt="" width={120} height={120}
              style={{ width: '100%', height: '100%', objectFit: 'contain', filter: `drop-shadow(0 0 24px ${WINNER.color}aa)` }} />
          </div>
        </div>
        <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#e9c46a' }}>
          {de ? 'Champions der Arena' : 'Arena champions'}
        </div>
        <div style={{ fontSize: 'clamp(26px, 3.4vw, 38px)', fontWeight: 900, color: '#F1F5F9' }}>{de ? WINNER.name : WINNER.nameEn}</div>
        <div style={{ fontSize: 16, fontWeight: 800, fontStyle: 'italic', color: WINNER.color }}>„{de ? WINNER.de : WINNER.en}"</div>
      </div>

      {/* 3 Awards */}
      <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', maxWidth: 820, margin: '0 auto' }}>
        {AWARDS.map((a, i) => (
          <div key={a.de} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '16px 18px', borderRadius: 18,
            background: 'rgba(255,255,255,0.03)', border: `1px solid ${a.color}44`,
            animation: `cwRise 0.5s ease ${i * 0.1}s both`,
          }}>
            <img src={`/assets/${a.award}.png`} alt="" width={40} height={40} aria-hidden
              style={{ width: 40, height: 40, objectFit: 'contain', flexShrink: 0, filter: `drop-shadow(0 2px 6px ${a.color}66)` }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 800, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.06em', color: BRAND.inkSoft }}>{de ? a.de : a.en}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <span aria-hidden style={{
                  width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  background: `radial-gradient(circle at 34% 28%, ${a.color}, ${a.color}bb 65%)`,
                  border: '1.5px solid rgba(255,255,255,0.3)',
                }}>
                  <img src={`/assets/emblem-${a.slug}.png`} alt="" width={16} height={16} style={{ width: 16, height: 16, objectFit: 'contain' }} />
                </span>
                <span style={{ fontSize: 16, fontWeight: 900, color: a.color }}>{de ? a.name : a.nameEn}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

const secTitle: React.CSSProperties = {
  margin: '0 0 clamp(14px, 2vh, 20px)', textAlign: 'center',
  fontSize: 'clamp(26px, 3.4vw, 40px)', fontWeight: 900, color: '#F1F5F9', letterSpacing: '-0.01em',
};
