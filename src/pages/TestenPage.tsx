// Kampagnen-Landing für die Reel-/Insta-Aktion „Test-Team werden".
// Fokussiert: Angebot (Gratis-Quizabend) → so läuft's → Anmeldeformular.
// Bewusst NICHT in der Haupt-Navigation — wird aus dem Reel/Bio verlinkt.
import { BRAND, EMAIL, INSTA_URL, INSTA_HANDLE } from '../brand';
import { useLang } from '../lang';
import { Layout, Section, PageHero } from '../Layout';
import { TestTeamForm } from '../components/TestTeamForm';

const C = {
  de: {
    eyebrow: 'Test-Team gesucht',
    title: 'Spiel mein Quiz, bevor es alle tun.',
    sub: 'Ich baue ein Quiz: halb Pub-Quiz, halb Strategiespiel. Gespielt wird am Handy, euer Team erobert Feld für Feld. Ich suche ein paar Teams, die es mit mir durchspielen.',
    offerTag: 'Der Deal',
    offerTitle: 'Euer Quizabend? Geht aufs Haus.',
    offerBody: 'Ihr bekommt einen kompletten, moderierten Quizabend, komplett kostenlos. Dafür sagt ihr mir ehrlich, was Spaß gemacht hat und was noch hakt.',
    scarcity: 'Begrenzte Termine',
    region: 'Aktuell nur in Hamburg + Umland',
    stepsTitle: 'So läuft\'s',
    steps: [
      { n: '1', t: 'Anmelden', b: 'Kurz das Formular ausfüllen: Name, Stadt, wann es passt.' },
      { n: '2', t: 'Termin finden', b: 'Ich melde mich mit einem Vorschlag. Bei euch, im Büro oder wo ihr einen Raum mit freier Wand habt.' },
      { n: '3', t: 'Spielen & Feedback', b: 'Ihr spielt einen ganzen Abend, ich schau zu und höre zu. Euer Feedback formt das Spiel.' },
    ],
    formTitle: 'Meldet euch an',
    formSub: 'Ihr solltet mindestens 9 sein. Dann teile ich euch in Teams auf. Ich melde mich persönlich zurück.',
    or: 'Lieber direkt?',
    insta: 'Auf Instagram',
  },
  en: {
    eyebrow: 'Test teams wanted',
    title: 'Play my quiz before everyone else does.',
    sub: 'I am building a quiz: half pub quiz, half strategy game. You play on your phones and your team conquers the board field by field. I am looking for a few teams to play it through with me.',
    offerTag: 'The deal',
    offerTitle: 'Your quiz night? On the house.',
    offerBody: 'You get a full, hosted quiz night, completely free. In return you tell me honestly what was fun and what still needs work.',
    scarcity: 'Limited dates',
    region: 'Currently Hamburg + surroundings only',
    stepsTitle: 'How it works',
    steps: [
      { n: '1', t: 'Sign up', b: 'Fill in the short form: name, city, when it suits you.' },
      { n: '2', t: 'Find a date', b: 'I come back with a suggestion. At your place, the office, wherever you have a room with a free wall.' },
      { n: '3', t: 'Play & feedback', b: 'You play a whole evening, I watch and listen. Your feedback shapes the game.' },
    ],
    formTitle: 'Sign up',
    formSub: 'You should be at least 9. Then I split you into teams. I reply personally.',
    or: 'Prefer direct?',
    insta: 'On Instagram',
  },
};

export default function TestenPage() {
  const lang = useLang();
  const c = C[lang];
  return (
    <Layout>
      <PageHero eyebrow={c.eyebrow} eyebrowLower title={c.title} sub={c.sub} />

      {/* Angebot */}
      <Section style={{ paddingTop: 0 }}>
        <div style={{
          maxWidth: 620, margin: '0 auto',
          padding: 'clamp(22px, 3.5vw, 36px)', borderRadius: 24, textAlign: 'center',
          background: `radial-gradient(ellipse 80% 100% at 50% 0%, rgba(${BRAND.pinkRgb},0.16), rgba(255,255,255,0.03) 70%)`,
          border: `1.5px solid rgba(${BRAND.pinkRgb},0.3)`,
          boxShadow: `0 16px 44px rgba(0,0,0,0.35), 0 0 40px rgba(${BRAND.pinkRgb},0.10)`,
        }}>
          <span style={{
            display: 'inline-block', fontSize: 12, fontWeight: 900, letterSpacing: '0.16em',
            textTransform: 'uppercase', color: BRAND.pink, marginBottom: 12,
          }}>🐺 {c.offerTag}</span>
          <div style={{ fontSize: 'clamp(24px, 4.4vw, 34px)', fontWeight: 900, color: '#F1F5F9', lineHeight: 1.1, textWrap: 'balance' }}>
            {c.offerTitle}
          </div>
          <p style={{ margin: '14px auto 18px', maxWidth: 460, color: BRAND.inkSoft, fontSize: 'clamp(15px, 2vw, 17px)', fontWeight: 500, lineHeight: 1.6 }}>
            {c.offerBody}
          </p>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '8px 16px', borderRadius: 999,
            background: `rgba(${BRAND.pinkRgb},0.14)`, border: `1px solid rgba(${BRAND.pinkRgb},0.35)`,
            color: BRAND.pinkSoft, fontWeight: 800, fontSize: 14,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: BRAND.pink, boxShadow: `0 0 10px ${BRAND.pink}` }} />
            {c.scarcity}
          </span>
          <div style={{ marginTop: 12, fontSize: 13.5, fontWeight: 700, color: BRAND.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <span aria-hidden>📍</span>{c.region}
          </div>
        </div>
      </Section>

      {/* So läuft's */}
      <Section style={{ paddingTop: 0 }}>
        <h2 style={{
          textAlign: 'center', margin: '0 0 24px', fontSize: 'clamp(20px, 3.4vw, 28px)',
          fontWeight: 900, color: '#F1F5F9', letterSpacing: '-0.01em',
        }}>{c.stepsTitle}</h2>
        <div style={{
          display: 'grid', gap: 14, maxWidth: 900, margin: '0 auto',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
        }}>
          {c.steps.map((s) => (
            <div key={s.n} style={{
              padding: '20px 22px', borderRadius: 18,
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.10)',
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: 12, display: 'grid', placeItems: 'center',
                fontWeight: 900, fontSize: 18, color: '#fff',
                background: `linear-gradient(135deg, ${BRAND.pink}, ${BRAND.magenta})`,
                marginBottom: 12,
              }}>{s.n}</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#F1F5F9', marginBottom: 6 }}>{s.t}</div>
              <p style={{ margin: 0, color: BRAND.inkSoft, fontSize: 14.5, fontWeight: 500, lineHeight: 1.55 }}>{s.b}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Formular */}
      <Section style={{ paddingTop: 0 }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: '0 0 6px', fontSize: 'clamp(20px, 3.4vw, 28px)', fontWeight: 900, color: '#F1F5F9' }}>{c.formTitle}</h2>
          <p style={{ margin: 0, color: BRAND.muted, fontSize: 15, fontWeight: 600 }}>{c.formSub}</p>
        </div>
        <TestTeamForm />
        <div style={{
          maxWidth: 560, margin: '22px auto 0', textAlign: 'center',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        }}>
          <div style={{ fontSize: 15, color: BRAND.muted, fontWeight: 600 }}>
            {c.or} <a href={`mailto:${EMAIL}`} style={{ color: BRAND.pink, fontWeight: 800, textDecoration: 'none' }}>{EMAIL}</a>
          </div>
          <a href={INSTA_URL} target="_blank" rel="noopener noreferrer" style={{
            fontSize: 15, color: BRAND.pinkSoft, fontWeight: 700, textDecoration: 'none',
          }}>📸 {c.insta} · {INSTA_HANDLE}</a>
        </div>
      </Section>
    </Layout>
  );
}
