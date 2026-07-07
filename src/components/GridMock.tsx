// CozyQuiz-Erober-Grid-Mock im Beamer-Look: Team-Avatare in den Feldern +
// Brücken zwischen orthogonal verbundenen Feldern derselben Farbe (wie das
// "größte zusammenhängende Gebiet" auf dem Beamer). Deterministisch, SSR-sicher.
import { BRAND } from '../brand';
import { useLang } from '../lang';
import { Section } from '../Layout';

type Team = { color: string; avatar: string };
const TEAMS: Team[] = [
  { color: '#FA4BA3', avatar: '/assets/av-fuchs.png' },
  { color: '#3B82F6', avatar: '/assets/av-eule.png' },
  { color: '#22C55E', avatar: '/assets/av-baer.png' },
  { color: '#FACC15', avatar: '/assets/av-katze.png' },
];

// null = freies Feld
const P: (number | null)[][] = [
  [null, 0, 0, null, null, 1, 1, null],
  [0, 0, 0, null, 1, 1, 1, null],
  [0, 0, null, null, null, 1, null, 3],
  [2, 2, null, null, 3, 3, 3, 3],
  [2, 2, 2, null, null, 3, 3, null],
  [null, 2, null, null, null, null, 3, null],
];

const GAP = 8;      // px, fest, damit die Brücken exakt die Lücke überbrücken
const ROWS = P.length;
const COLS = P[0].length;

export function GridMock() {
  const de = useLang() === 'de';
  return (
    <Section>
      <style>{`@keyframes cwCellIn { from { opacity: 0; transform: scale(0.4); } to { opacity: 1; transform: none; } }`}</style>
      <h2 style={secTitle}>{de ? 'So sieht das Spielfeld aus' : 'This is the board'}</h2>
      <p style={{ margin: '0 auto clamp(22px, 3vh, 34px)', maxWidth: 620, textAlign: 'center', fontSize: 17, color: BRAND.inkSoft, fontWeight: 500, lineHeight: 1.6 }}>
        {de
          ? 'Für jede richtige Antwort erobert ihr ein Feld. Verbundene Felder wachsen zu einem Gebiet zusammen, und das größte zusammenhängende Gebiet gewinnt.'
          : 'For every correct answer you claim a cell. Connected cells grow into one territory, and the largest connected territory wins.'}
      </p>

      <div style={{
        maxWidth: 480, margin: '0 auto',
        display: 'grid', gridTemplateColumns: `repeat(${COLS}, 1fr)`, gap: GAP,
        padding: 'clamp(12px, 2.2vw, 18px)', borderRadius: 22,
        background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(${BRAND.pinkRgb},0.16)`,
      }}>
        {P.flatMap((row, r) => row.map((owner, c) => {
          const idx = r * COLS + c;
          if (owner == null) {
            return <div key={idx} style={{ aspectRatio: '1 / 1', borderRadius: 8, background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.05)' }} />;
          }
          const team = TEAMS[owner];
          const rightBridge = c + 1 < COLS && P[r][c + 1] === owner;
          const downBridge = r + 1 < ROWS && P[r + 1][c] === owner;
          return (
            <div key={idx} style={{
              position: 'relative', aspectRatio: '1 / 1', borderRadius: 10,
              background: `radial-gradient(circle at 34% 28%, ${team.color}, ${team.color}cc 72%)`,
              boxShadow: `0 3px 10px ${team.color}55, inset 0 -4px 8px rgba(0,0,0,0.22)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: `cwCellIn 0.4s cubic-bezier(0.2,1.3,0.4,1) ${idx * 0.02}s both`,
            }}>
              {rightBridge && (
                <span aria-hidden style={{
                  position: 'absolute', right: -GAP, top: '50%', transform: 'translateY(-50%)',
                  width: GAP + 6, height: '46%', background: team.color, borderRadius: 3, zIndex: 0,
                }} />
              )}
              {downBridge && (
                <span aria-hidden style={{
                  position: 'absolute', bottom: -GAP, left: '50%', transform: 'translateX(-50%)',
                  height: GAP + 6, width: '46%', background: team.color, borderRadius: 3, zIndex: 0,
                }} />
              )}
              <img src={team.avatar} alt="" aria-hidden style={{
                position: 'relative', zIndex: 1, width: '74%', height: '74%', objectFit: 'contain',
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))',
              }} />
            </div>
          );
        }))}
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', marginTop: 20 }}>
        {TEAMS.map((team, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 800, color: BRAND.muted }}>
            <img src={team.avatar} alt="" aria-hidden width={22} height={22} style={{ objectFit: 'contain' }} />
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
