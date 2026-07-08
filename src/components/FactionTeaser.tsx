// Cozy-Arena-Fraktions-Teaser: die 8 echten Fraktionen mit den ECHTEN Wappen-PNGs
// aus der App (Farbe/Wappen/Motto = QQ_MEGA_FACTIONS). Zeigt visuell, worum es im
// Groß-Modus geht. SSR-sicher, Stagger-Einblendung per CSS-Keyframe.
import { BRAND } from '../brand';
import { useLang } from '../lang';
import { Section } from '../Layout';

type Faction = { slug: string; name: string; nameEn: string; color: string; de: string; en: string };

const FACTIONS: Faction[] = [
  { slug: 'bauchgefuehl',   name: 'Bauchgefühl',   nameEn: 'Gut Feeling', color: '#F97316', de: 'Das Gefühl trügt nie.', en: 'The gut never lies.' },
  { slug: 'glueckstreffer', name: 'Glückstreffer', nameEn: 'Lucky Guess', color: '#22C55E', de: 'Hauptsache richtig.',   en: 'Right is right.' },
  { slug: 'feierabend',     name: 'Feierabend',    nameEn: 'Happy Hour',  color: '#14B8A6', de: 'Hauptsache dabei.',     en: 'Just here for fun.' },
  { slug: 'letztesekunde',  name: 'Letzte Sekunde',nameEn: 'Last Second', color: '#A855F7', de: 'Kurz vor knapp.',       en: 'Just in time.' },
  { slug: 'allwissen',      name: 'Allwissen',     nameEn: 'Know-It-All', color: '#FACC15', de: 'Wir wissen es einfach.',en: 'We just know.' },
  { slug: 'improvisation',  name: 'Improvisation', nameEn: 'Wing It',     color: '#3B82F6', de: 'Läuft schon irgendwie.',en: "We'll figure it out." },
  { slug: 'einspruch',      name: 'Einspruch',     nameEn: 'Objection',   color: '#EC4899', de: 'Das zählt nicht!',      en: "That doesn't count!" },
  { slug: 'risiko',         name: 'Risiko',        nameEn: 'All In',      color: '#EF4444', de: 'Alles oder nichts.',    en: 'All or nothing.' },
];

export function FactionTeaser() {
  const lang = useLang();
  const de = lang === 'de';
  return (
    <Section>
      <style>{`
        @keyframes cwFactionIn { from { opacity: 0; transform: translateY(14px) scale(0.96); } to { opacity: 1; transform: none; } }
        .cw-faction { transition: transform 0.18s ease, border-color 0.18s ease; }
        .cw-faction:hover { transform: translateY(-4px); }
      `}</style>
      <h2 style={secTitle}>{de ? 'Wählt eure Fraktion' : 'Pick your faction'}</h2>
      <p style={{ margin: '0 auto clamp(24px, 3.5vh, 40px)', maxWidth: 640, textAlign: 'center', fontSize: 17, color: BRAND.inkSoft, fontWeight: 500, lineHeight: 1.6 }}>
        {de
          ? 'Bei großen Gruppen schließt sich jedes Handy einer von acht Fraktionen an. Jede hat ihre eigene Farbe, ihr Wappen und ihr Motto. Ab dann heißt es: wir gegen die.'
          : 'For large groups, every phone joins one of eight factions. Each has its own color, crest and motto. From then on it is us versus them.'}
      </p>
      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))' }}>
        {FACTIONS.map((f, i) => (
          <div key={f.name} className="cw-faction" style={{
            padding: 'clamp(18px, 2.2vw, 24px)', borderRadius: 20,
            background: `linear-gradient(160deg, ${f.color}18, rgba(255,255,255,0.02))`,
            border: `1px solid ${f.color}55`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center',
            animation: `cwFactionIn 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 0.06}s both`,
          }}>
            <div style={{
              width: 86, height: 86, position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div aria-hidden style={{
                position: 'absolute', inset: '8%', borderRadius: '50%',
                background: `radial-gradient(circle, ${f.color}55, transparent 70%)`, filter: 'blur(4px)',
              }} />
              <img src={`/assets/crest-${f.slug}.webp`} alt="" loading="lazy" decoding="async" width={86} height={86}
                style={{ position: 'relative', width: '100%', height: '100%', objectFit: 'contain', filter: `drop-shadow(0 4px 10px ${f.color}66)` }} />
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#F1F5F9' }}>{de ? f.name : f.nameEn}</div>
            <div style={{ fontSize: 14, fontWeight: 700, fontStyle: 'italic', color: f.color }}>„{de ? f.de : f.en}"</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

const secTitle: React.CSSProperties = {
  margin: '0 0 clamp(14px, 2vh, 20px)', textAlign: 'center',
  fontSize: 'clamp(26px, 3.4vw, 40px)', fontWeight: 900, color: '#F1F5F9', letterSpacing: '-0.01em',
};
