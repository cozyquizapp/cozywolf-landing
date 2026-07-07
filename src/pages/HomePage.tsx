// Startseite: Marke → Produkt (ein Abend, zwei Modi) → Veranstalter-Fakten →
// 3 Zielgruppen-Einstiege → Johannes-Teaser → Kontakt.
// Erste Fassung (Stufe 1/2). Redaktion: Ich-Form, keine Gedankenstriche.
import { BRAND, FONT_DISPLAY, anfrageMailto } from '../brand';
import { useLang } from '../lang';
import { t } from '../i18n';
import { Layout, Section, Btn, PageHero } from '../Layout';
import { OrganizerFacts } from '../components/OrganizerFacts';
import { CategoryStrip } from '../components/CategoryStrip';
import { MiniQuiz } from '../components/MiniQuiz';
import { MiniGrid, MiniBars } from '../components/ModeMinis';
import { FaqSection } from '../components/FaqSection';
import { PriceNote } from '../components/PriceNote';
import { StatsBand } from '../components/StatsBand';

const C = {
  de: {
    eyebrow: 'Live-Quiz-Abende',
    title: 'Der Quiz-Abend, den ich für euch moderiere.',
    sub: 'Deine Gäste spielen am eigenen Handy, ich moderiere live und bringe die Fragen mit. Von der kleinen Runde bis zu 100 Personen.',
    modesTitle: 'Ein Abend, zwei Spielarten',
    mode1T: 'CozyQuiz: erobern',
    mode1B: 'Für Runden bis etwa 30 Personen. Jedes Team beantwortet Fragen und erobert Felder auf dem Spielfeld. Wissen trifft ein bisschen Taktik.',
    mode2T: 'Cozy Arena: Fraktionen',
    mode2B: 'Für große Gruppen bis zu 100 Personen. Alle schließen sich zu Fraktionen zusammen und kämpfen Frage für Frage um die Führung. Fair gewertet, egal wie groß ein Team ist.',
    audTitle: 'Für welchen Anlass?',
    audFirmenT: 'Firma oder Team?',
    audFirmenB: 'Team-Event, bei dem Abteilungen oder Tische als Fraktionen gegeneinander antreten.',
    audFeiernT: 'Private Feier?',
    audFeiernB: 'Geburtstag oder Freundeskreis, entspannte Runde mit dem Erober-Modus.',
    audLocationsT: 'Café, Bar oder Pub?',
    audLocationsB: 'Ein wiederkehrender Quiz-Abend, der Gäste anzieht und wiederkommen lässt.',
    audMore: 'Mehr erfahren',
    hostT: 'Wer moderiert?',
    hostB: 'Ich bin Johannes, Pädagoge und Moderator. Ich stehe selbst vorne und halte den Abend zusammen, mit einem guten Blick für die Gruppe.',
    hostCta: 'Über mich',
    ctaTitle: 'Lust auf einen Abend?',
    ctaBody: 'Schreib mir kurz zum Anlass und zur ungefähren Personenzahl, dann melde ich mich mit einem Vorschlag.',
    ctaTry: 'Quiz ausprobieren',
  },
  en: {
    eyebrow: 'Live quiz nights',
    title: 'The quiz night I host for you.',
    sub: 'Your guests play on their own phone, I host live and bring the questions. From a small round up to 100 people.',
    modesTitle: 'One evening, two ways to play',
    mode1T: 'CozyQuiz: conquer',
    mode1B: 'For rounds up to about 30 people. Each team answers questions and conquers cells on the board. Knowledge meets a bit of tactics.',
    mode2T: 'Cozy Arena: factions',
    mode2B: 'For large groups up to about 100 people. Everyone joins a faction and races for the lead question by question. Scored fairly, no matter how big a team is.',
    audTitle: 'For which occasion?',
    audFirmenT: 'Company or team?',
    audFirmenB: 'A team event where departments or tables compete as factions.',
    audFeiernT: 'Private party?',
    audFeiernB: 'Birthday or friends, a relaxed round with the conquer mode.',
    audLocationsT: 'Café, bar or pub?',
    audLocationsB: 'A recurring quiz night that brings your guests in and keeps them.',
    audMore: 'Learn more',
    hostT: 'Who hosts?',
    hostB: 'I am Johannes, an educator and host. I stand up front myself and hold the evening together, with a good eye for the group.',
    hostCta: 'About me',
    ctaTitle: 'Up for an evening?',
    ctaBody: 'Drop me a line about the occasion and rough number of people, and I will come back with a suggestion.',
    ctaTry: 'Try the quiz',
  },
};

export default function HomePage() {
  const lang = useLang();
  const c = C[lang];
  const d = t(lang);
  const audiences = [
    { href: '/firmen', title: c.audFirmenT, body: c.audFirmenB, icon: '🏢' },
    { href: '/feiern', title: c.audFeiernT, body: c.audFeiernB, icon: '🎉' },
    { href: '/locations', title: c.audLocationsT, body: c.audLocationsB, icon: '🍻' },
  ];
  return (
    <Layout>
      <PageHero eyebrow={c.eyebrow} title={c.title} sub={c.sub}
        visual={<img src="/logo.png" alt="" width={148} height={148} style={{ width: '100%', height: 'auto', filter: `drop-shadow(0 8px 24px rgba(${BRAND.pinkRgb},0.45))` }} />}
      />
      <Section style={{ paddingTop: 0, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Btn href={anfrageMailto(lang)}>{d.ctaBook}</Btn>
        <Btn href="#mini" variant="secondary">{c.ctaTry}</Btn>
      </Section>

      {/* Zielgruppen zuerst: Veranstalter ordnet sich sofort ein */}
      <Section style={{ paddingTop: 'clamp(24px, 4vh, 48px)' }}>
        <SecTitle>{c.audTitle}</SecTitle>
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))' }}>
          {audiences.map(a => (
            <a key={a.href} href={a.href} style={teaserCard}>
              <div style={{ fontSize: 30 }} aria-hidden>{a.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: BRAND.pink }}>{a.title}</div>
              <div style={{ fontSize: 15, color: BRAND.inkSoft, fontWeight: 500, lineHeight: 1.5, flex: 1 }}>{a.body}</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: BRAND.pinkSoft }}>{c.audMore} →</div>
            </a>
          ))}
        </div>
      </Section>

      <OrganizerFacts />

      {/* Zwei Modi */}
      <Section>
        <SecTitle>{c.modesTitle}</SecTitle>
        <div style={twoCol}>
          <ModeCard title={c.mode1T} body={c.mode1B} accent={BRAND.pink} visual={<MiniGrid />} />
          <ModeCard title={c.mode2T} body={c.mode2B} accent={BRAND.magenta} visual={<MiniBars />} />
        </div>
      </Section>

      <StatsBand />

      <CategoryStrip />

      {/* Mini-Quiz (Vorgeschmack, ersetzt den frueheren toten Ausprobieren-Link) */}
      <div id="mini"><MiniQuiz /></div>

      {/* Johannes-Teaser */}
      <Section>
        <div style={{
          display: 'flex', gap: 'clamp(20px, 4vw, 44px)', alignItems: 'center', flexWrap: 'wrap',
          padding: 'clamp(24px, 3vw, 40px)', borderRadius: 24,
          background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(${BRAND.pinkRgb},0.18)`,
        }}>
          <img src="/assets/johannes.jpg" alt="Johannes" style={{
            width: 132, height: 132, borderRadius: '50%', objectFit: 'cover', objectPosition: 'center 22%', flexShrink: 0,
            border: `3px solid rgba(${BRAND.pinkRgb},0.5)`,
          }} />
          <div style={{ flex: 1, minWidth: 240 }}>
            <h2 style={{ margin: '0 0 10px', fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 900, color: '#F1F5F9' }}>{c.hostT}</h2>
            <p style={{ margin: '0 0 16px', fontSize: 16, color: BRAND.inkSoft, fontWeight: 500, lineHeight: 1.6 }}>{c.hostB}</p>
            <Btn href="/ueber" variant="secondary">{c.hostCta}</Btn>
          </div>
        </div>
      </Section>

      <FaqSection />

      {/* Kontakt-CTA */}
      <Section style={{ textAlign: 'center' }}>
        <div style={{
          padding: 'clamp(28px, 4vw, 52px)', borderRadius: 24,
          background: `radial-gradient(ellipse at 50% 0%, rgba(${BRAND.pinkRgb},0.14), transparent 70%), rgba(255,255,255,0.025)`,
          border: `1.5px solid rgba(${BRAND.pinkRgb},0.3)`,
        }}>
          <h2 style={{ margin: '0 0 12px', fontFamily: FONT_DISPLAY, fontSize: 'clamp(26px, 3.4vw, 40px)', fontWeight: 800, color: '#F1F5F9' }}>{c.ctaTitle}</h2>
          <p style={{ margin: '0 auto 16px', maxWidth: 560, fontSize: 17, color: BRAND.inkSoft, fontWeight: 500, lineHeight: 1.6 }}>{c.ctaBody}</p>
          <PriceNote />
          <Btn href={anfrageMailto(lang)}>{d.ctaBook}</Btn>
        </div>
      </Section>
    </Layout>
  );
}

function SecTitle({ children }: { children: React.ReactNode }) {
  return <h2 style={{
    margin: '0 0 clamp(20px, 3vh, 32px)', textAlign: 'center',
    fontSize: 'clamp(26px, 3.4vw, 40px)', fontWeight: 900, color: '#F1F5F9', letterSpacing: '-0.01em',
  }}>{children}</h2>;
}

function ModeCard({ title, body, accent, visual }: { title: string; body: string; accent: string; visual?: React.ReactNode }) {
  return (
    <div style={{
      padding: 'clamp(22px, 2.6vw, 32px)', borderRadius: 20,
      background: 'rgba(255,255,255,0.03)', border: `1px solid ${accent}44`,
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{ fontSize: 22, fontWeight: 900, color: accent }}>{title}</div>
      <div style={{ fontSize: 16, color: BRAND.inkSoft, fontWeight: 500, lineHeight: 1.6, flex: 1 }}>{body}</div>
      {visual && <div style={{ marginTop: 4 }}>{visual}</div>}
    </div>
  );
}

const twoCol: React.CSSProperties = {
  display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
};
const teaserCard: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: 10,
  padding: 'clamp(20px, 2.4vw, 28px)', borderRadius: 20,
  background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(250,75,163,0.18)`,
  textDecoration: 'none',
};
