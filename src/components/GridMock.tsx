// CozyQuiz-Erober-Grid im ECHTEN Beamer-Look: verbundene Felder derselben Farbe
// verschmelzen zu einem soliden Gebiet (Ecken werden eckig, wo eine Kante
// fusioniert; die Luecke im Grid-Gap wird voll gefuellt) — genau wie im App-Grid
// (CozyQuizGridDisplay). Lustige Team-Namen wie aus der App. SSR-sicher.
import { BRAND } from '../brand';
import { useLang } from '../lang';
import { Section } from '../Layout';

type Team = { color: string; avatar: string; de: string; en: string };
const TEAMS: Team[] = [
  { color: '#EC4899', avatar: '/assets/av-fuchs.webp', de: 'Google sei Dank', en: 'Google Says Yes' },
  { color: '#3B82F6', avatar: '/assets/av-eule.webp',  de: 'Eulen-Spiegel',   en: 'Owl-Knowing' },
  { color: '#22C55E', avatar: '/assets/av-baer.webp',  de: 'Wissens-Wölfe',   en: 'The Wolf Pack' },
  { color: '#FACC15', avatar: '/assets/av-katze.webp', de: 'Käse-Kenner',     en: 'Cheese Wizards' },
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

const GAP = 7;
const RAD = 11;
const COLS = P[0].length;
const at = (r: number, c: number) => (P[r]?.[c] ?? null);

export function GridMock() {
  const lang = useLang();
  const de = lang === 'de';
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
        maxWidth: 500, margin: '0 auto',
        display: 'grid', gridTemplateColumns: `repeat(${COLS}, 1fr)`, gap: GAP,
        padding: 'clamp(12px, 2.2vw, 20px)', borderRadius: 24,
        background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(${BRAND.pinkRgb},0.16)`,
      }}>
        {P.flatMap((row, r) => row.map((owner, c) => {
          const idx = r * COLS + c;
          if (owner == null) {
            return <div key={idx} style={{ aspectRatio: '1 / 1', borderRadius: 8, background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.05)' }} />;
          }
          const team = TEAMS[owner];
          // Fusion: gleiche Team-Nachbarn (orthogonal)
          const nTop = at(r - 1, c) === owner;
          const nRight = at(r, c + 1) === owner;
          const nBottom = at(r + 1, c) === owner;
          const nLeft = at(r, c - 1) === owner;
          // Ecke eckig, wo eine anliegende Kante fusioniert (sonst RAD) — wie App
          const rTL = (nTop || nLeft) ? 0 : RAD;
          const rTR = (nTop || nRight) ? 0 : RAD;
          const rBR = (nBottom || nRight) ? 0 : RAD;
          const rBL = (nBottom || nLeft) ? 0 : RAD;
          // Aussen-Kanten dezent umrandet, innere (fusionierte) Kanten offen
          const bc = `${team.color}66`;
          const border = [
            nTop ? '' : `inset 0 1px 0 ${bc}`,
            nBottom ? '' : `inset 0 -1px 0 ${bc}`,
            nLeft ? '' : `inset 1px 0 0 ${bc}`,
            nRight ? '' : `inset -1px 0 0 ${bc}`,
            // 3D-Tiefe nur an Aussen-Unterkante
            nBottom ? '' : '0 4px 10px rgba(0,0,0,0.28)',
          ].filter(Boolean).join(', ');
          return (
            <div key={idx} style={{
              position: 'relative', aspectRatio: '1 / 1',
              borderRadius: `${rTL}px ${rTR}px ${rBR}px ${rBL}px`,
              background: `linear-gradient(135deg, ${team.color}, ${team.color}d9)`,
              boxShadow: border || undefined,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: `cwCellIn 0.4s cubic-bezier(0.2,1.3,0.4,1) ${idx * 0.018}s both`,
            }}>
              {/* Gap-Fueller: volle Kantenlaenge -> nahtloser Block statt duenner Brueckenbalken */}
              {nRight && <span aria-hidden style={{ position: 'absolute', right: -GAP - 1, top: 0, bottom: 0, width: GAP + 2, background: team.color, zIndex: 0 }} />}
              {nBottom && <span aria-hidden style={{ position: 'absolute', bottom: -GAP - 1, left: 0, right: 0, height: GAP + 2, background: team.color, zIndex: 0 }} />}
              <img src={team.avatar} alt="" aria-hidden loading="lazy" decoding="async" style={{
                position: 'relative', zIndex: 1, width: '78%', height: '78%', objectFit: 'contain',
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))',
              }} />
            </div>
          );
        }))}
      </div>

      <div style={{ display: 'flex', gap: 'clamp(14px, 2.5vw, 26px)', flexWrap: 'wrap', justifyContent: 'center', marginTop: 22 }}>
        {TEAMS.map((team, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontSize: 15, fontWeight: 800, color: team.color }}>
            <img src={team.avatar} alt="" aria-hidden loading="lazy" decoding="async" width={26} height={26} style={{ objectFit: 'contain' }} />
            {de ? team.de : team.en}
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
