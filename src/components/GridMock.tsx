// CozyQuiz-Erober-Grid-Mock: zeigt das Spielfeld-Prinzip (Teams erobern Felder,
// bauen zusammenhängende Gebiete). Deterministisches Muster (SSR-sicher), Felder
// ploppen gestaffelt rein (CSS-Keyframe).
import { BRAND } from '../brand';
import { useLang } from '../lang';
import { Section } from '../Layout';

// Team-Farben (an die App angelehnt). null = freies Feld.
const TEAMS = ['#FA4BA3', '#3B82F6', '#22C55E', '#FACC15'];
const P: (number | null)[][] = [
  [null, 0, 0, null, null, 1, 1, null],
  [0, 0, 0, null, 1, 1, 1, null],
  [0, 0, null, null, null, 1, null, 3],
  [2, 2, null, null, 3, 3, 3, 3],
  [2, 2, 2, null, null, 3, 3, null],
  [null, 2, null, null, null, null, 3, null],
];

export function GridMock() {
  const de = useLang() === 'de';
  const cols = P[0].length;
  return (
    <Section>
      <style>{`
        @keyframes cwCellIn { from { opacity: 0; transform: scale(0.4); } to { opacity: 1; transform: none; } }
      `}</style>
      <h2 style={secTitle}>{de ? 'So sieht das Spielfeld aus' : 'This is the board'}</h2>
      <p style={{ margin: '0 auto clamp(22px, 3vh, 34px)', maxWidth: 620, textAlign: 'center', fontSize: 17, color: BRAND.inkSoft, fontWeight: 500, lineHeight: 1.6 }}>
        {de
          ? 'Für jede richtige Antwort erobert ihr ein Feld. Wer clever spielt, verbindet seine Felder zum größten zusammenhängenden Gebiet.'
          : 'For every correct answer you claim a cell. Play cleverly and connect your cells into the largest territory.'}
      </p>
      <div style={{
        maxWidth: 480, margin: '0 auto',
        display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 'clamp(5px, 1.2vw, 9px)',
        padding: 'clamp(10px, 2vw, 16px)', borderRadius: 20,
        background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(${BRAND.pinkRgb},0.16)`,
      }}>
        {P.flatMap((row, r) => row.map((owner, c) => {
          const col = owner == null ? null : TEAMS[owner];
          const idx = r * cols + c;
          return (
            <div key={idx} style={{
              aspectRatio: '1 / 1', borderRadius: 8,
              background: col
                ? `radial-gradient(circle at 34% 28%, ${col}, ${col}cc 70%)`
                : 'rgba(255,255,255,0.04)',
              border: col ? `1px solid ${col}` : '1px solid rgba(255,255,255,0.06)',
              boxShadow: col ? `0 3px 10px ${col}55` : 'none',
              animation: col ? `cwCellIn 0.4s cubic-bezier(0.2,1.3,0.4,1) ${idx * 0.02}s both` : undefined,
            }} />
          );
        }))}
      </div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', marginTop: 20 }}>
        {TEAMS.map((col, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 800, color: BRAND.muted }}>
            <span style={{ width: 14, height: 14, borderRadius: 4, background: col, boxShadow: `0 0 8px ${col}88` }} />
            {de ? `Team ${i + 1}` : `Team ${i + 1}`}
          </span>
        ))}
      </div>
    </Section>
  );
}

const secTitle: React.CSSProperties = {
  margin: '0 0 clamp(14px, 2vh, 20px)', textAlign: 'center',
  fontSize: 'clamp(26px, 3.4vw, 40px)', fontWeight: 900, color: '#F1F5F9', letterSpacing: '-0.01em',
};
