// Kompakte Mini-Visuals fuer die zwei Modus-Karten auf der Home:
// MiniGrid (CozyQuiz-Erobern) + MiniBars (Cozy-Arena-Rennen). Rein dekorativ,
// SSR-sicher, damit man die Spielarten schon auf der Startseite sieht.

const GRID_TEAMS = ['#FA4BA3', '#3B82F6'];
const GP: (number | null)[][] = [
  [0, 0, null, 1, 1],
  [0, 0, null, 1, null],
  [null, 0, null, 1, 1],
];
const GCOLS = GP[0].length, GROWS = GP.length, GGAP = 6;

export function MiniGrid() {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: `repeat(${GCOLS}, 1fr)`, gap: GGAP,
      maxWidth: 200, margin: '2px auto 0',
    }}>
      {GP.flatMap((row, r) => row.map((owner, c) => {
        const idx = r * GCOLS + c;
        if (owner == null) return <div key={idx} style={{ aspectRatio: '1/1', borderRadius: 5, background: 'rgba(255,255,255,0.05)' }} />;
        const col = GRID_TEAMS[owner];
        const right = c + 1 < GCOLS && GP[r][c + 1] === owner;
        const down = r + 1 < GROWS && GP[r + 1][c] === owner;
        return (
          <div key={idx} style={{
            position: 'relative', aspectRatio: '1/1', borderRadius: 6,
            background: `radial-gradient(circle at 34% 28%, ${col}, ${col}cc 72%)`,
            boxShadow: `0 2px 6px ${col}55`,
          }}>
            {right && <span aria-hidden style={{ position: 'absolute', right: -GGAP, top: '50%', transform: 'translateY(-50%)', width: GGAP + 4, height: '44%', background: col, borderRadius: 2 }} />}
            {down && <span aria-hidden style={{ position: 'absolute', bottom: -GGAP, left: '50%', transform: 'translateX(-50%)', height: GGAP + 4, width: '44%', background: col, borderRadius: 2 }} />}
          </div>
        );
      }))}
    </div>
  );
}

const BARS = [
  { color: '#EF4444', emblem: '🔥', pct: 100, crown: true },
  { color: '#FACC15', emblem: '⭐', pct: 82 },
  { color: '#3B82F6', emblem: '🎲', pct: 58 },
];

export function MiniBars() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 220, margin: '4px auto 0' }}>
      {BARS.map((b, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span aria-hidden style={{
            width: 24, height: 24, borderRadius: '50%', flexShrink: 0, fontSize: 12,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: `radial-gradient(circle at 34% 28%, ${b.color}, ${b.color}bb 65%)`,
            border: '1.5px solid rgba(255,255,255,0.3)',
          }}>{b.emblem}</span>
          <div style={{ flex: 1, height: 10, borderRadius: 999, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${b.pct}%`, borderRadius: 999, background: `linear-gradient(90deg, ${b.color}, ${b.color}cc)`, boxShadow: `0 0 8px ${b.color}66` }} />
          </div>
          {b.crown && <span aria-hidden style={{ fontSize: 14 }}>👑</span>}
        </div>
      ))}
    </div>
  );
}
