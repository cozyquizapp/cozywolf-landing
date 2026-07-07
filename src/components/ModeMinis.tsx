// Kompakte Mini-Visuals fuer die zwei Modus-Karten auf der Home:
// MiniGrid (CozyQuiz-Erobern, echte cozy3d-Avatare + Bruecken) + MiniBars
// (Cozy-Arena-Rennen, echte Fraktions-Embleme). Rein dekorativ, SSR-sicher,
// damit man die echten Spielarten schon auf der Startseite sieht.

// owner-Index (0/1) + Avatar-Slug pro erobertem Feld (echte cozy3d-Avatare).
const GRID_TEAMS = ['#EC4899', '#3B82F6'];
const GP: ({ o: number; av: string } | null)[][] = [
  [{ o: 0, av: 'fuchs' }, { o: 0, av: 'katze' }, null, { o: 1, av: 'baer' }, { o: 1, av: 'eule' }],
  [{ o: 0, av: 'baer' },  { o: 0, av: 'eule' },  null, { o: 1, av: 'fuchs' }, null],
  [null, { o: 0, av: 'katze' }, null, { o: 1, av: 'eule' }, { o: 1, av: 'baer' }],
];
const GCOLS = GP[0].length, GROWS = GP.length, GGAP = 6;

export function MiniGrid() {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: `repeat(${GCOLS}, 1fr)`, gap: GGAP,
      maxWidth: 210, margin: '2px auto 0',
    }}>
      {GP.flatMap((row, r) => row.map((cell, c) => {
        const idx = r * GCOLS + c;
        if (cell == null) return <div key={idx} style={{ aspectRatio: '1/1', borderRadius: 5, background: 'rgba(255,255,255,0.05)' }} />;
        const col = GRID_TEAMS[cell.o];
        const right = c + 1 < GCOLS && GP[r][c + 1]?.o === cell.o;
        const down = r + 1 < GROWS && GP[r + 1][c]?.o === cell.o;
        return (
          <div key={idx} style={{
            position: 'relative', aspectRatio: '1/1', borderRadius: 7,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `radial-gradient(circle at 34% 28%, ${col}dd, ${col}aa 72%)`,
            boxShadow: `0 2px 6px ${col}55`,
          }}>
            <img src={`/assets/av-${cell.av}.png`} alt="" width={26} height={26} style={{ width: '78%', height: '78%', objectFit: 'contain' }} />
            {right && <span aria-hidden style={{ position: 'absolute', right: -GGAP, top: '50%', transform: 'translateY(-50%)', width: GGAP + 4, height: '44%', background: col, borderRadius: 2, zIndex: -1 }} />}
            {down && <span aria-hidden style={{ position: 'absolute', bottom: -GGAP, left: '50%', transform: 'translateX(-50%)', height: GGAP + 4, width: '44%', background: col, borderRadius: 2, zIndex: -1 }} />}
          </div>
        );
      }))}
    </div>
  );
}

const BARS = [
  { color: '#EF4444', slug: 'risiko',        pct: 100, crown: true },
  { color: '#FACC15', slug: 'allwissen',     pct: 82 },
  { color: '#3B82F6', slug: 'improvisation', pct: 58 },
];

export function MiniBars() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 220, margin: '4px auto 0' }}>
      {BARS.map((b, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span aria-hidden style={{
            width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: `radial-gradient(circle at 34% 28%, ${b.color}, ${b.color}bb 65%)`,
            border: '1.5px solid rgba(255,255,255,0.3)',
          }}>
            <img src={`/assets/emblem-${b.slug}.png`} alt="" width={16} height={16} style={{ width: 16, height: 16, objectFit: 'contain' }} />
          </span>
          <div style={{ flex: 1, height: 10, borderRadius: 999, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${b.pct}%`, borderRadius: 999, background: `linear-gradient(90deg, ${b.color}, ${b.color}cc)`, boxShadow: `0 0 8px ${b.color}66` }} />
          </div>
          {b.crown && <span aria-hidden style={{ fontSize: 14 }}>👑</span>}
        </div>
      ))}
    </div>
  );
}
