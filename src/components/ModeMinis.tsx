// Kompakte Mini-Visuals fuer die zwei Modus-Karten auf der Home:
// MiniGrid (CozyQuiz-Erobern, echte cozy3d-Avatare + Bruecken) + MiniBars
// (Cozy-Arena-Rennen, echte Fraktions-Embleme). Rein dekorativ, SSR-sicher,
// damit man die echten Spielarten schon auf der Startseite sieht.

// App-realistisch: eine Team-FARBE = EIN Avatar (nicht pro Feld gemischt).
// Jedes Team hat Farbe + festen Avatar; die Zellen speichern nur den Team-Index.
const GRID_TEAMS = [
  { color: '#EC4899', av: 'fuchs' },
  { color: '#3B82F6', av: 'eule' },
  { color: '#10B981', av: 'baer' },
];
const GP: (number | null)[][] = [
  [0, 0, null, 1, 1],
  [2, 0, null, 1, null],
  [2, 2, null, 1, 1],
];
const GCOLS = GP[0].length, GROWS = GP.length, GGAP = 6;

export function MiniGrid() {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: `repeat(${GCOLS}, 1fr)`, gap: GGAP,
      maxWidth: 210, margin: '2px auto 0',
    }}>
      {GP.flatMap((row, r) => row.map((o, c) => {
        const idx = r * GCOLS + c;
        if (o == null) return <div key={idx} style={{ aspectRatio: '1/1', borderRadius: 5, background: 'rgba(255,255,255,0.05)' }} />;
        const team = GRID_TEAMS[o];
        const col = team.color;
        const right = c + 1 < GCOLS && GP[r][c + 1] === o;
        const down = r + 1 < GROWS && GP[r + 1][c] === o;
        return (
          <div key={idx} className="cw-mg-cell" style={{
            position: 'relative', aspectRatio: '1/1', borderRadius: 7,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `radial-gradient(circle at 34% 28%, ${col}dd, ${col}aa 72%)`,
            boxShadow: `0 2px 6px ${col}55`,
            ['--d' as string]: `${(r + c) * 0.13}s`,
          }}>
            <img src={`/assets/av-${team.av}.webp`} alt="" width={26} height={26} style={{ width: '78%', height: '78%', objectFit: 'contain' }} />
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
            <img src={`/assets/emblem-${b.slug}.webp`} alt="" width={16} height={16} style={{ width: 16, height: 16, objectFit: 'contain' }} />
          </span>
          <div style={{ flex: 1, height: 10, borderRadius: 999, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
            <div className="cw-mb-fill" style={{
              height: '100%', width: `${b.pct}%`, borderRadius: 999,
              background: `linear-gradient(90deg, ${b.color}, ${b.color}cc)`, boxShadow: `0 0 8px ${b.color}66`,
              ['--w' as string]: `${b.pct}%`, ['--d' as string]: `${(BARS.length - 1 - i) * 0.28}s`,
            }} />
          </div>
          {b.crown && <span aria-hidden className="cw-mb-crown" style={{ fontSize: 14, display: 'inline-block' }}>👑</span>}
        </div>
      ))}
    </div>
  );
}
