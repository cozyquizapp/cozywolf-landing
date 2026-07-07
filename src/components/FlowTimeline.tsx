// Horizontale nummerierte Timeline mit Verbindungslinie (Design-Audit: den
// sequentiellen 'So laeuft der Abend'-Ablauf als Timeline statt 3 gleicher
// Karten). Stapelt auf schmalen Screens vertikal, Linie blendet dort aus.
import { BRAND, FONT_DISPLAY } from '../brand';

export function FlowTimeline({ steps, accent = BRAND.pink }: {
  steps: { t: string; b: string }[]; accent?: string;
}) {
  return (
    <div style={{ position: 'relative' }}>
      <style>{`
        .cw-flow { position: relative; display: flex; gap: clamp(20px, 3vw, 44px); }
        .cw-flow-line { position: absolute; top: 32px; left: 14%; right: 14%; height: 2px; z-index: 0;
          background: linear-gradient(90deg, transparent, ${accent}66 20%, ${accent}66 80%, transparent); }
        .cw-flow-step { flex: 1 1 0; min-width: 200px; display: flex; flex-direction: column;
          align-items: center; text-align: center; gap: 12px; position: relative; z-index: 1; }
        @media (max-width: 760px) {
          .cw-flow { flex-direction: column; gap: 22px; }
          .cw-flow-line { display: none; }
        }
      `}</style>
      <div className="cw-flow">
        <div className="cw-flow-line" aria-hidden />
        {steps.map((s, i) => (
          <div className="cw-flow-step" key={i}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 30, color: '#fff',
              background: `linear-gradient(135deg, ${accent}, ${BRAND.magenta})`,
              border: '3px solid rgba(255,255,255,0.14)',
              boxShadow: `0 6px 20px ${accent}55`,
            }}>{i + 1}</div>
            <h3 style={{ margin: 0, fontSize: 'clamp(18px, 2vw, 22px)', fontWeight: 900, color: '#F1F5F9' }}>
              {s.t.replace(/^\d+\.\s*/, '')}
            </h3>
            <p style={{ margin: 0, maxWidth: 300, fontSize: 15, color: BRAND.inkSoft, fontWeight: 500, lineHeight: 1.6 }}>{s.b}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
