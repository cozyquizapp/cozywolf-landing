// Zwei Modus-Embleme als Badge ueber dem Modus-Namen (Home-Karten).
// ArenaEmblem: Wolfs echtes Arena-PNG + 3 echte Wappen, die drueber schweben
// (Bob-Animation). GridEmblem: CSS-Grid, ein echter Avatar "landet" in einer
// Kachel. Gegensatz der beiden Modi: drueber schweben (Arena, Luft, Ansturm)
// vs. Boden besetzen (Quiz, taktisch, erobern). Rein dekorativ, SSR-sicher.
import { BRAND } from '../brand';

// 3 Wappen mit klarem Farbkontrast, schweben ueber der offenen Arena-Schale
// (Fraktionen ziehen ein). Positionen ueber dem Rand/der Schale, Mitte hoeher.
const FLOAT = [
  { slug: 'risiko',       left: 26, top: 16, scale: 0.72 },
  { slug: 'bauchgefuehl', left: 52, top: 3,  scale: 0.9 },
  { slug: 'allwissen',    left: 76, top: 17, scale: 0.72 },
];

export function ArenaEmblem({ size = 84 }: { size?: number }) {
  return (
    <div style={{ position: 'relative', width: size, height: size }} aria-hidden>
      {/* weicher Magenta-Glow hinter der Arena */}
      <div style={{
        position: 'absolute', inset: '18% 6% 4%',
        background: `radial-gradient(ellipse at 50% 60%, ${BRAND.magenta}44, transparent 70%)`,
        filter: 'blur(3px)',
      }} />
      {/* Wolfs echte Arena (leere Buehne) */}
      <img
        src="/assets/mode-arena.webp" alt="" width={size} height={size}
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
              filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))',
              ['--fd' as string]: `${i * 0.5}s`,
            }}
          />
        </span>
      ))}
    </div>
  );
}

// CozyQuiz-Pendant (Wolfs Idee): die besetzten Felder bilden ein "C", in jedem
// besetzten Feld sitzt der Wolf-Avatar (= das Feld wurde erobert). 4x4-Grid,
// 1 = erobert (Wolf drin), 0 = frei. Ein Feld "landet" gerade (Pop-Animation).
// Das "C" fuer Cozy, gebaut aus dem Erober-Grid -> Modus + Marke in einem Bild.
const C_GRID = [
  1, 1, 1, 1,
  1, 0, 0, 0,
  1, 0, 0, 0,
  1, 1, 1, 1,
];
const LAND_CELL = 3; // dieses Feld poppt gerade rein (oben rechts, Ende der C-Spitze)
// Felder im Hoodie-Blau des Wolfs (aus dem Avatar gesampelt): der pinke Wolf
// hebt sich klar ab, statt auf Pink zu verschwimmen. Navy ist zudem Markenfarbe.
const CELL_HI = '#2a5199';
const CELL_LO = '#183872';

export function GridEmblem({ size = 84 }: { size?: number }) {
  return (
    <div aria-hidden style={{
      width: size, height: size,
      display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: 'repeat(4, 1fr)',
      gap: size * 0.055,
    }}>
      {C_GRID.map((t, i) => {
        if (t === 0) return <div key={i} style={{ borderRadius: size * 0.07, background: 'rgba(255,255,255,0.05)' }} />;
        const landing = i === LAND_CELL;
        return (
          <div key={i} className={landing ? 'cw-emblem-tile' : undefined} style={{
            borderRadius: size * 0.07,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `radial-gradient(circle at 34% 28%, ${CELL_HI}, ${CELL_LO} 85%)`,
            boxShadow: `0 2px 5px ${CELL_LO}66`,
          }}>
            <img src="/assets/av-wolf.webp" alt="" width={20} height={20} style={{ width: '86%', height: '86%', objectFit: 'contain' }} />
          </div>
        );
      })}
    </div>
  );
}
