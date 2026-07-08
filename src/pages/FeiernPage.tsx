// Für private Feiern: CozyQuiz-Erober-Modus, entspannter Ton. Ideal für Runden
// bis zu 30 Personen. Redaktion: Ich-Form, keine Gedankenstriche.
import { BRAND } from '../brand';
import { useLang } from '../lang';
import { Layout, Section, Btn, PageHero } from '../Layout';
import { OrganizerFacts } from '../components/OrganizerFacts';
import { GridMock } from '../components/GridMock';
import { PriceNote } from '../components/PriceNote';
import { FlowTimeline } from '../components/FlowTimeline';

const C = {
  de: {
    eyebrow: 'Für private Feiern',
    title: 'Ein gemütlicher Quiz-Abend für deine Feier.',
    sub: 'Geburtstag, Freundeskreis oder einfach ein netter Abend. Ihr spielt in kleinen Teams und erobert Runde für Runde das Spielfeld. Ideal für Runden bis zu 30 Personen.',
    pointsTitle: 'Warum das Spaß macht',
    p1T: 'Für jede Runde etwas',
    p1B: 'Fünf verschiedene Fragetypen, quer durch die Themen. Es gibt immer eine Kategorie, in der du glänzt.',
    p2T: 'Kein Vorwissen nötig',
    p2B: 'Schätzen, tippen, kombinieren. Auch wer sich nicht als Quiz-Profi sieht, kommt gut mit und hat was zu lachen.',
    p3T: 'Ich mache den Rest',
    p3B: 'Du feierst, ich moderiere. Das Quiz und die Technik bringe ich mit, du sorgst für Gäste, Snacks und gute Laune.',
    flowTitle: 'So läuft der Abend',
    f1T: 'Handy raus, joinen',
    f1B: 'Deine Gäste scannen einen QR-Code und bilden kleine Teams. In wenigen Minuten sind alle dabei.',
    f2T: 'Felder erobern',
    f2B: 'Für jede richtige Antwort sichert ihr euch Felder auf dem Spielfeld. Wer clever spielt, baut sich das größte Gebiet.',
    f3T: 'Sieger feiern',
    f3B: 'Am Ende steht fest, wer den Abend für sich entschieden hat. Meistens gibt es dabei mehr zu lachen als zu grübeln.',
    occTitle: 'Passt zu',
    occ: ['Geburtstage', 'Freundeskreis', 'Jubiläen', 'Junggesellenabschiede', 'Familienfeiern', 'Vereinsabende'],
    cta: 'Feier anfragen',
  },
  en: {
    eyebrow: 'For private parties',
    title: 'A cozy quiz night for your celebration.',
    sub: 'Birthday, friends, or just a nice evening. You play in small teams and conquer the board round by round. Ideal for rounds up to 30 people.',
    pointsTitle: 'Why it is fun',
    p1T: 'Something for every round',
    p1B: 'Five different question types across all topics. There is always a category where you shine.',
    p2T: 'No prior knowledge needed',
    p2B: 'Guess, tap, combine. Even if you do not see yourself as a quiz pro, you keep up and have a laugh.',
    p3T: 'I do the rest',
    p3B: 'You celebrate, I host. I bring the quiz and the tech, you bring the guests, snacks and good mood.',
    flowTitle: 'How the evening runs',
    f1T: 'Phones out, join',
    f1B: 'Your guests scan a QR code and form small teams. In a few minutes everyone is in.',
    f2T: 'Conquer cells',
    f2B: 'For every correct answer you claim cells on the board. Play cleverly and build the largest territory.',
    f3T: 'Celebrate the winner',
    f3B: 'At the end it is clear who won the evening. Usually there is more to laugh about than to ponder.',
    occTitle: 'A good fit for',
    occ: ['Birthdays', 'Friends', 'Anniversaries', 'Bachelor parties', 'Family gatherings', 'Club evenings'],
    cta: 'Request a party',
  },
};

export default function FeiernPage() {
  const lang = useLang();
  const c = C[lang];
  const pts = [{ t: c.p1T, b: c.p1B }, { t: c.p2T, b: c.p2B }, { t: c.p3T, b: c.p3B }];
  const flow = [{ t: c.f1T, b: c.f1B }, { t: c.f2T, b: c.f2B }, { t: c.f3T, b: c.f3B }];
  return (
    <Layout>
      <PageHero eyebrow={c.eyebrow} title={c.title} sub={c.sub} />
      <Section style={{ paddingTop: 0, textAlign: 'center' }}>
        <Btn href="/kontakt">{c.cta}</Btn>
      </Section>

      <Section>
        <h2 style={secTitle}>{c.pointsTitle}</h2>
        <CardGrid items={pts} />
      </Section>

      <GridMock />

      <Section>
        <h2 style={secTitle}>{c.flowTitle}</h2>
        <FlowTimeline steps={flow} />
      </Section>

      <OrganizerFacts compact />

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
        <PriceNote />
        <Btn href="/kontakt">{c.cta}</Btn>
      </Section>
    </Layout>
  );
}

function CardGrid({ items }: { items: { t: string; b: string }[] }) {
  return (
    <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))' }}>
      {items.map((v, i) => (
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
  );
}

const secTitle: React.CSSProperties = {
  margin: '0 0 clamp(20px, 3vh, 32px)', textAlign: 'center',
  fontSize: 'clamp(26px, 3.4vw, 40px)', fontWeight: 900, color: '#F1F5F9', letterSpacing: '-0.01em',
};
