// Für Firmen & Teams: Cozy Arena als Held, faire Wertung, Teambuilding,
// Anlässe. Veranstalter-Fakten prominent oben. Preis auf Anfrage.
// Erste Fassung (Stufe 1/3).
import { BRAND, anfrageMailto } from '../brand';
import { useLang } from '../lang';
import { Layout, Section, Btn, PageHero } from '../Layout';
import { OrganizerFacts } from '../components/OrganizerFacts';

const C = {
  de: {
    eyebrow: 'Für Firmen & Teams',
    title: 'Ein Team-Event, bei dem alle mitspielen.',
    sub: 'Eure Abteilungen oder Tische treten als Fraktionen gegeneinander an. Jeder trägt bei, keiner sitzt raus.',
    valuesTitle: 'Warum das für Teams funktioniert',
    v1T: 'Fraktionen statt Einzelkampf',
    v1B: 'Jedes Handy schließt sich einer Fraktion an. Ihr spielt als Gruppe gegen die anderen, das klassische wir gegen die, das Teams zusammenschweißt.',
    v2T: 'Fair für ungleiche Teams',
    v2B: 'Gewertet wird die Trefferquote, nicht die reine Anzahl. Eine kleine Abteilung kann eine große schlagen. Niemand ist von vornherein im Nachteil.',
    v3T: 'Spannung bis zum Schluss',
    v3B: 'Ein Balken-Rennen mit Führungswechseln, am Ende wird die Sieger-Fraktion gekrönt. Auch wer hinten liegt, bleibt drin.',
    occTitle: 'Passt zu',
    occ: ['Firmenevents', 'Weihnachtsfeiern', 'Sommerfeste', 'Team-Tage', 'Vereinsfeste', 'Jubiläen'],
    priceNote: 'Preis auf Anfrage. Ich richte den Abend auf eure Gruppengröße und euren Anlass aus.',
    cta: 'Für euer Team anfragen',
  },
  en: {
    eyebrow: 'For companies & teams',
    title: 'A team event where everyone plays.',
    sub: 'Your departments or tables compete as factions. Everyone contributes, nobody sits out.',
    valuesTitle: 'Why this works for teams',
    v1T: 'Factions, not solo play',
    v1B: 'Every phone joins a faction. You play as a group against the others, the classic us versus them that brings teams together.',
    v2T: 'Fair for uneven teams',
    v2B: 'Scoring uses the hit rate, not the raw count. A small department can beat a large one. Nobody is at a disadvantage from the start.',
    v3T: 'Tension until the end',
    v3B: 'A bar race with lead changes, and the winning faction gets crowned at the end. Even those behind stay in it.',
    occTitle: 'A good fit for',
    occ: ['Company events', 'Christmas parties', 'Summer parties', 'Team days', 'Club celebrations', 'Anniversaries'],
    priceNote: 'Price on request. I tailor the evening to your group size and occasion.',
    cta: 'Request for your team',
  },
};

export default function FirmenPage() {
  const lang = useLang();
  const c = C[lang];
  const values = [
    { t: c.v1T, b: c.v1B }, { t: c.v2T, b: c.v2B }, { t: c.v3T, b: c.v3B },
  ];
  return (
    <Layout>
      <PageHero eyebrow={c.eyebrow} title={c.title} sub={c.sub} />
      <Section style={{ paddingTop: 0, textAlign: 'center' }}>
        <Btn href={anfrageMailto(lang)}>{c.cta}</Btn>
      </Section>

      <OrganizerFacts compact />

      <Section>
        <h2 style={secTitle}>{c.valuesTitle}</h2>
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))' }}>
          {values.map((v, i) => (
            <div key={i} style={{
              padding: 'clamp(20px, 2.4vw, 28px)', borderRadius: 20,
              background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(${BRAND.pinkRgb},0.18)`,
              display: 'flex', flexDirection: 'column', gap: 8,
            }}>
              <div style={{ fontSize: 19, fontWeight: 900, color: BRAND.pink }}>{v.t}</div>
              <div style={{ fontSize: 15, color: BRAND.inkSoft, fontWeight: 500, lineHeight: 1.6 }}>{v.b}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section style={{ textAlign: 'center' }}>
        <h2 style={secTitle}>{c.occTitle}</h2>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 28 }}>
          {c.occ.map(o => (
            <span key={o} style={{
              padding: '9px 18px', borderRadius: 999, fontSize: 15, fontWeight: 800,
              color: BRAND.pinkSoft, background: `rgba(${BRAND.pinkRgb},0.10)`,
              border: `1px solid rgba(${BRAND.pinkRgb},0.3)`,
            }}>{o}</span>
          ))}
        </div>
        <p style={{ margin: '0 auto 22px', maxWidth: 560, fontSize: 16, color: BRAND.inkSoft, fontWeight: 500, lineHeight: 1.6 }}>{c.priceNote}</p>
        <Btn href={anfrageMailto(lang)}>{c.cta}</Btn>
      </Section>
    </Layout>
  );
}

const secTitle: React.CSSProperties = {
  margin: '0 0 clamp(20px, 3vh, 32px)', textAlign: 'center',
  fontSize: 'clamp(26px, 3.4vw, 40px)', fontWeight: 900, color: '#F1F5F9', letterSpacing: '-0.01em',
};
