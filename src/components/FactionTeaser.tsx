// Cozy-Arena-Fraktions-Teaser: die 8 echten Fraktionen (Farbe/Emblem/Motto aus
// der App, QQ_MEGA_FACTIONS). Zeigt visuell, worum es im Groß-Modus geht.
// SSR-sicher (nur CSS/Emoji), Stagger-Einblendung per CSS-Keyframe.
import { BRAND } from '../brand';
import { useLang } from '../lang';
import { Section } from '../Layout';

type Faction = { name: string; nameEn: string; color: string; emblem: string; de: string; en: string };

const FACTIONS: Faction[] = [
  { name: 'Bauchgefühl',   nameEn: 'Gut Feeling', color: '#F97316', emblem: '🌀', de: 'Das Gefühl trügt nie.', en: 'The gut never lies.' },
  { name: 'Glückstreffer', nameEn: 'Lucky Guess', color: '#22C55E', emblem: '🍀', de: 'Hauptsache richtig.',   en: 'Right is right.' },
  { name: 'Feierabend',    nameEn: 'Happy Hour',  color: '#14B8A6', emblem: '🍺', de: 'Hauptsache dabei.',     en: 'Just here for fun.' },
  { name: 'Letzte Sekunde',nameEn: 'Last Second', color: '#A855F7', emblem: '⏳', de: 'Kurz vor knapp.',       en: 'Just in time.' },
  { name: 'Allwissen',     nameEn: 'Know-It-All', color: '#FACC15', emblem: '⭐', de: 'Wir wissen es einfach.',en: 'We just know.' },
  { name: 'Improvisation', nameEn: 'Wing It',     color: '#3B82F6', emblem: '🎲', de: 'Läuft schon irgendwie.',en: "We'll figure it out." },
  { name: 'Einspruch',     nameEn: 'Objection',   color: '#EC4899', emblem: '🔨', de: 'Das zählt nicht!',      en: "That doesn't count!" },
  { name: 'Risiko',        nameEn: 'All In',      color: '#EF4444', emblem: '🔥', de: 'Alles oder nichts.',    en: 'All or nothing.' },
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
              width: 74, height: 74, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34,
              background: `radial-gradient(circle at 32% 28%, ${f.color}, ${f.color}bb 60%, ${f.color}88)`,
              boxShadow: `0 6px 18px ${f.color}66, inset 0 -6px 12px rgba(0,0,0,0.25)`,
              border: '2px solid rgba(255,255,255,0.35)',
            }} aria-hidden>{f.emblem}</div>
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
