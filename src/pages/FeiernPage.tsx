// Für private Feiern: Erober-Modus, entspannter Ton. Erste Fassung (Stufe 1/5).
import { BRAND, anfrageMailto } from '../brand';
import { useLang } from '../lang';
import { Layout, Section, Btn, PageHero } from '../Layout';
import { OrganizerFacts } from '../components/OrganizerFacts';

const C = {
  de: {
    eyebrow: 'Für private Feiern',
    title: 'Ein gemütlicher Quiz-Abend für deine Feier.',
    sub: 'Geburtstag, Freundeskreis oder einfach ein netter Abend. Ihr spielt in kleinen Teams und erobert Runde für Runde das Spielfeld.',
    pointsTitle: 'Warum das Spaß macht',
    p1T: 'Für jede Runde etwas',
    p1B: 'Fünf verschiedene Fragetypen, quer durch die Themen. Es gibt immer eine Kategorie, in der du glänzt.',
    p2T: 'Kein Vorwissen nötig',
    p2B: 'Schätzen, tippen, kombinieren. Auch wer sich nicht als Quiz-Profi sieht, kommt gut mit und hat was zu lachen.',
    p3T: 'Ich mache den Rest',
    p3B: 'Du feierst, ich moderiere. Du musst nichts vorbereiten außer der Gästeliste.',
    cta: 'Feier anfragen',
  },
  en: {
    eyebrow: 'For private parties',
    title: 'A cozy quiz night for your celebration.',
    sub: 'Birthday, friends, or just a nice evening. You play in small teams and conquer the board round by round.',
    pointsTitle: 'Why it is fun',
    p1T: 'Something for every round',
    p1B: 'Five different question types across all topics. There is always a category where you shine.',
    p2T: 'No prior knowledge needed',
    p2B: 'Guess, tap, combine. Even if you do not see yourself as a quiz pro, you keep up and have a laugh.',
    p3T: 'I do the rest',
    p3B: 'You celebrate, I host. You prepare nothing except the guest list.',
    cta: 'Request a party',
  },
};

export default function FeiernPage() {
  const lang = useLang();
  const c = C[lang];
  const pts = [{ t: c.p1T, b: c.p1B }, { t: c.p2T, b: c.p2B }, { t: c.p3T, b: c.p3B }];
  return (
    <Layout>
      <PageHero eyebrow={c.eyebrow} title={c.title} sub={c.sub} />
      <Section style={{ paddingTop: 0, textAlign: 'center' }}>
        <Btn href={anfrageMailto(lang)}>{c.cta}</Btn>
      </Section>
      <Section>
        <h2 style={secTitle}>{c.pointsTitle}</h2>
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))' }}>
          {pts.map((p, i) => (
            <div key={i} style={{
              padding: 'clamp(20px, 2.4vw, 28px)', borderRadius: 20,
              background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(${BRAND.pinkRgb},0.18)`,
              display: 'flex', flexDirection: 'column', gap: 8,
            }}>
              <div style={{ fontSize: 19, fontWeight: 900, color: BRAND.pink }}>{p.t}</div>
              <div style={{ fontSize: 15, color: BRAND.inkSoft, fontWeight: 500, lineHeight: 1.6 }}>{p.b}</div>
            </div>
          ))}
        </div>
      </Section>
      <OrganizerFacts compact />
    </Layout>
  );
}

const secTitle: React.CSSProperties = {
  margin: '0 0 clamp(20px, 3vh, 32px)', textAlign: 'center',
  fontSize: 'clamp(26px, 3.4vw, 40px)', fontWeight: 900, color: '#F1F5F9', letterSpacing: '-0.01em',
};
