// Zwei Modus-Embleme als Badge ueber dem Modus-Namen (Home-Karten).
// ArenaEmblem: Wolfs echtes Arena-PNG + 3 echte Wappen, die drueber schweben
// (Bob-Animation). GridEmblem: CSS-Grid, ein echter Avatar "landet" in einer
// Kachel. Gegensatz der beiden Modi: drueber schweben (Arena, Luft, Ansturm)
// vs. Boden besetzen (Quiz, taktisch, erobern). Rein dekorativ, SSR-sicher.
import { BRAND } from '../brand';

// 3 Wappen mit klarem Farbkontrast, schweben ueber der Arena.
const FLOAT = [
  { slug: 'risiko',      left: 15, top: 24, scale: 0.8 },
  { slug: 'bauchgefuehl', left: 50, top: 4,  scale: 1 },
  { slug: 'allwissen',   left: 85, top: 26, scale: 0.8 },
];

export function ArenaEmblem({ size = 76 }: { size?: number }) {
  return (
    <div style={{ position: 'relative', width: size, height: size }} aria-hidden>
      {/* Boden-Lichtpool: liegt hinter dem PNG, traegt die Szene auch ohne PNG */}
      <div style={{
        position: 'absolute', left: '10%', right: '10%', bottom: '4%', height: '26%',
        background: `radial-gradient(ellipse at 50% 100%, ${BRAND.magenta}66, transparent 72%)`,
        borderRadius: '50%', filter: 'blur(2px)',
      }} />
      {/* Wolfs echte Arena (leere Buehne) */}
      <img
        src="/assets/mode-arena.png" alt="" width={size} height={size}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'bottom' }}
      />
      {/* Echte Wappen schweben drueber (Wrapper haelt die X-Position, img wippt) */}
      {FLOAT.map((f, i) => (
        <span key={f.slug} style={{
          position: 'absolute', left: `${f.left}%`, top: `${f.top}%`,
          transform: 'translateX(-50%)',
        }}>
          <img
            src={`/assets/crest-${f.slug}.webp`} alt="" className="cw-emblem-float"
            width={30} height={30}
            style={{
              display: 'block', width: 30 * f.scale, height: 30 * f.scale, objectFit: 'contain',
              filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.45))',
              ['--fd' as string]: `${i * 0.5}s`,
            }}
          />
        </span>
      ))}
    </div>
  );
}

// CozyQuiz-Pendant: 3x3-Grid, Cluster in Pink erobert, ein Avatar landet
// gerade in seiner Kachel (Pop). 0 = leer, 1 = erobert, 2 = Avatar-Kachel.
const TILES = [1, 1, 0, 0, 1, 2, 1, 0, 0];
const PINK = BRAND.pink;

export function GridEmblem({ size = 76 }: { size?: number }) {
  return (
    <div aria-hidden style={{
      width: size, height: size,
      display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(3, 1fr)',
      gap: size * 0.07,
    }}>
      {TILES.map((t, i) => {
        if (t === 0) return <div key={i} style={{ borderRadius: size * 0.09, background: 'rgba(255,255,255,0.05)' }} />;
        if (t === 1) return (
          <div key={i} style={{
            borderRadius: size * 0.09,
            background: `radial-gradient(circle at 34% 28%, ${PINK}dd, ${PINK}aa 72%)`,
            boxShadow: `0 2px 5px ${PINK}55`,
          }} />
        );
        // Avatar-Kachel: der Avatar "landet" hier (Pop-Animation)
        return (
          <div key={i} className="cw-emblem-tile" style={{
            borderRadius: size * 0.09,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `radial-gradient(circle at 34% 28%, ${PINK}, ${PINK}bb 72%)`,
            boxShadow: `0 3px 8px ${PINK}77`,
          }}>
            <img src="/assets/av-fuchs.webp" alt="" width={22} height={22} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
          </div>
        );
      })}
    </div>
  );
}
