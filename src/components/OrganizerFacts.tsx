// Veranstalter-Reassurance-Block ("So läuft ein Abend bei mir").
// Wolf-Impuls 2026-07-07: der Besucher ist oft der Organisator, nicht der
// Spieler. Beantwortet prominent: unkompliziert? / Vorbereitung? / wie viele
// Personen? / Dauer? / Moderation inklusive? / Region. Wiederverwendbar auf
// Home + ganz oben auf /firmen.
import { BRAND } from '../brand';
import { useLang } from '../lang';
import { t } from '../i18n';
import { Section } from '../Layout';
import { Icon } from './Icon';

export function OrganizerFacts({ compact = false }: { compact?: boolean }) {
  const d = t(useLang());
  const facts = [
    { icon: 'handy', title: d.reUncomplicatedT, body: d.reUncomplicatedB },
    { icon: 'aufbau', title: d.rePrepT, body: d.rePrepB },
    { icon: 'team', title: d.reScaleT, body: d.reScaleB },
    { icon: 'dauer', title: d.reDurationT, body: d.reDurationB },
    { icon: 'moderation', title: d.reHostT, body: d.reHostB },
    { icon: 'standort', title: d.reRegionT, body: d.reRegionB },
  ];
  return (
    <Section style={compact ? { paddingTop: 'clamp(24px, 4vh, 48px)' } : undefined}>
      <h2 style={{
        margin: '0 0 clamp(20px, 3vh, 34px)', textAlign: 'center',
        fontSize: 'clamp(26px, 3.4vw, 40px)', fontWeight: 900, color: '#F1F5F9',
        letterSpacing: '-0.01em', textWrap: 'balance',
      }}>{d.reTitle}</h2>
      <div style={{
        display: 'grid', gap: 16,
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
      }}>
        {facts.map((f, i) => (
          <div key={i} style={{
            padding: 'clamp(18px, 2.2vw, 26px)', borderRadius: 18,
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid rgba(${BRAND.pinkRgb},0.18)`,
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            <Icon name={f.icon} size={44} />
            <div style={{ fontSize: 19, fontWeight: 900, color: BRAND.pink, letterSpacing: '-0.01em' }}>{f.title}</div>
            <div style={{ fontSize: 15, color: BRAND.inkSoft, fontWeight: 500, lineHeight: 1.55 }}>{f.body}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}
