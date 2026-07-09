import { BRAND } from '../brand';

// Ambient-Fireflies fuer den Hero-Hintergrund — dieselbe ruhige Ambient-Sprache
// wie in der CozyQuiz-App (Beamer), hier in Marketing-Pink. Zwei Ebenen: grosse
// weiche Bokeh-Punkte (Tiefe) hinter kleinen Funken. Rein dekorativ, klickt nicht,
// SSR-sicher (statische Positionen, kein window/Date/Math.random beim Render),
// respektiert prefers-reduced-motion.

type Node = { x: number; y: number; dx: number; dy: number; dur: number; del: number; sz: number };

const FF: Node[] = [
  { x: 14, y: 72, dx: 52, dy: -74, dur: 5.6, del: 0.0, sz: 4 },
  { x: 82, y: 28, dx: -40, dy: -60, dur: 7.2, del: 0.8, sz: 3 },
  { x: 47, y: 83, dx: 70, dy: -88, dur: 6.3, del: 1.5, sz: 5 },
  { x: 22, y: 40, dx: -64, dy: -50, dur: 8.1, del: 2.1, sz: 3 },
  { x: 68, y: 62, dx: 46, dy: -66, dur: 5.9, del: 0.4, sz: 4 },
  { x: 38, y: 16, dx: -50, dy: -40, dur: 6.8, del: 1.9, sz: 3 },
  { x: 91, y: 70, dx: -72, dy: -54, dur: 7.6, del: 0.2, sz: 5 },
  { x: 56, y: 44, dx: 38, dy: -80, dur: 5.3, del: 2.6, sz: 3 },
  { x: 8, y: 34, dx: 44, dy: -60, dur: 7.0, del: 3.1, sz: 3 },
  { x: 74, y: 86, dx: -46, dy: -84, dur: 7.9, del: 0.6, sz: 4 },
  { x: 33, y: 58, dx: 60, dy: -52, dur: 6.0, del: 2.4, sz: 3 },
  { x: 61, y: 12, dx: -36, dy: -46, dur: 8.4, del: 1.2, sz: 4 },
];

const FF_DEEP: Node[] = [
  { x: 18, y: 60, dx: 26, dy: -36, dur: 13, del: 0.0, sz: 10 },
  { x: 70, y: 34, dx: -22, dy: -32, dur: 15, del: 2.0, sz: 12 },
  { x: 44, y: 78, dx: 20, dy: -40, dur: 14, del: 4.0, sz: 9 },
  { x: 86, y: 64, dx: -26, dy: -28, dur: 16, del: 1.2, sz: 11 },
  { x: 30, y: 24, dx: 22, dy: -30, dur: 13, del: 3.2, sz: 9 },
];

export function Fireflies() {
  const c = BRAND.pink;
  return (
    <div aria-hidden style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      pointerEvents: 'none', zIndex: 0,
    }}>
      <style>{`
        @keyframes cwFfMove {
          0%   { transform: translate(0,0) scale(1); opacity: 0; }
          12%  { opacity: 0.75; }
          45%  { transform: translate(var(--dx), var(--dy)) scale(1.3); opacity: 0.5; }
          90%  { opacity: 0.2; }
          100% { transform: translate(calc(var(--dx) * 1.6), calc(var(--dy) * 1.6)) scale(0.6); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .cw-ff { animation: none !important; opacity: 0.28 !important; }
        }
      `}</style>
      {FF_DEEP.map((f, i) => (
        <span key={`d${i}`} className="cw-ff" style={{
          position: 'absolute', left: `${f.x}%`, top: `${f.y}%`,
          width: f.sz, height: f.sz, borderRadius: '50%',
          background: c, opacity: 0.5, filter: 'blur(2px)',
          boxShadow: `0 0 ${f.sz + 6}px ${Math.round(f.sz / 2)}px rgba(${BRAND.pinkRgb},0.5)`,
          ['--dx' as string]: `${f.dx}px`, ['--dy' as string]: `${f.dy}px`,
          animation: `cwFfMove ${f.dur}s ease-in-out ${f.del}s infinite`,
          willChange: 'transform, opacity',
        }} />
      ))}
      {FF.map((f, i) => (
        <span key={i} className="cw-ff" style={{
          position: 'absolute', left: `${f.x}%`, top: `${f.y}%`,
          width: f.sz, height: f.sz, borderRadius: '50%',
          background: c,
          boxShadow: `0 0 ${f.sz + 3}px ${Math.round(f.sz / 2)}px rgba(${BRAND.pinkRgb},0.7)`,
          ['--dx' as string]: `${f.dx}px`, ['--dy' as string]: `${f.dy}px`,
          animation: `cwFfMove ${f.dur}s ease-in-out ${f.del}s infinite`,
          willChange: 'transform, opacity',
        }} />
      ))}
    </div>
  );
}
