// Startseite: Marke → Produkt (ein Abend, zwei Modi) → Veranstalter-Fakten →
// 3 Zielgruppen-Einstiege → Johannes-Teaser → Kontakt.
// Erste Fassung (Stufe 1/2). Redaktion: Ich-Form, keine Gedankenstriche.
import { BRAND, FONT_DISPLAY } from '../brand';
import { useLang } from '../lang';
import { t } from '../i18n';
import { Layout, Section, Btn, PageHero } from '../Layout';
import { OrganizerFacts } from '../components/OrganizerFacts';
import { CategoryStrip } from '../components/CategoryStrip';
import { MiniQuiz } from '../components/MiniQuiz';
import { MiniGrid, MiniBars } from '../components/ModeMinis';
import { GridEmblem, ArenaEmblem } from '../components/ModeEmblems';
import { Icon } from '../components/Icon';
import { Reveal } from '../components/Reveal';
import { SeasonalHint } from '../components/SeasonalHint';
import { FaqSection } from '../components/FaqSection';
import { PriceNote } from '../components/PriceNote';
import { StatsBand } from '../components/StatsBand';

const C = {
  de: {
    eyebrow: 'stay cozy. stay curious.',
    title: 'Live-Quiz-Events, die eure Gruppe zusammenbringen.',
    sub: 'Das gemütlichste Quiz, das ihr je gespielt habt. Ich bringe die Fragen, ihr die gute Laune.',
    modesTitle: 'Ein Quiz, zwei Spielarten',
    mode1T: 'CozyQuiz: das Feld',
    mode1B: 'Für Runden bis zu 30 Personen. Jedes Team beantwortet Fragen und erobert Felder auf dem Spielfeld. Wissen trifft ein bisschen Taktik.',
    mode2T: 'CozyArena: das Rennen',
    mode2B: 'Für große Gruppen bis zu 100 Personen. Alle schließen sich zu Fraktionen zusammen und kämpfen Frage für Frage um die Führung. Fair gewertet, egal wie groß ein Team ist.',
    whyTitle: 'Warum CozyWolf?',
    why: [
      'Kein PowerPoint-Quiz, sondern ein eigenes Spielkonzept',
      'Live moderiert, kein Automat',
      'Handverlesene Fragen mit Aha-Effekt',
      'Alle am eigenen Handy, kein Zettel und Stift',
      'Fünf abwechslungsreiche Fragetypen',
      'Spannung bis zur letzten Frage',
    ],
    audTitle: 'Für welchen Anlass?',
    audFirmenT: 'Firma oder Team?',
    audFirmenB: 'Team-Event, bei dem Abteilungen oder Tische als Fraktionen gegeneinander antreten.',
    audFeiernT: 'Private Feier?',
    audFeiernB: 'Geburtstag oder Freundeskreis, entspannte Runde, bei der ihr das Spielfeld erobert.',
    audLocationsT: 'Café, Bar oder Pub?',
    audLocationsB: 'Ein wiederkehrender Quiz-Abend, der Gäste anzieht und wiederkommen lässt.',
    audMore: 'Mehr erfahren',
    hostT: 'Wer moderiert?',
    hostB: 'Ich bin Johannes und sorge dafür, dass euer Quizabend rund läuft. Von Aufbau über Technik bis zur Moderation übernehme ich alles, ihr könnt euch entspannt zurücklehnen und den Abend genießen. Mein Ziel: ein Quiz, bei dem jede Gruppe mitfiebert, gemeinsam lacht und gerne bis zur letzten Frage dabei bleibt.',
    hostChips: [
      'Persönliche Moderation vor Ort',
      'Für Gruppen von 10 bis 100 Personen',
      'Individuell auf eure Gruppe abgestimmt',
      'Fragen und Ablauf passend zu eurem Event',
      'Flexibel für Firmenfeiern, Vereine und private Events',
    ],
    hostRole: 'Gründer & Quizmaster',
    hostCta: 'Lern mich kennen',
    ctaTitle: 'Lust auf ein Quiz?',
    ctaBody: 'Schreib mir kurz zum Anlass und zur ungefähren Personenzahl, dann melde ich mich mit einem Vorschlag.',
    ctaTry: 'Quiz ausprobieren',
  },
  en: {
    eyebrow: 'stay cozy. stay curious.',
    title: 'Live quiz events that bring your group together.',
    sub: 'The coziest quiz you have ever played. I bring the questions, you bring the fun.',
    modesTitle: 'One quiz, two ways to play',
    mode1T: 'CozyQuiz: the board',
    mode1B: 'For rounds up to 30 people. Each team answers questions and conquers cells on the board. Knowledge meets a bit of tactics.',
    mode2T: 'CozyArena: the race',
    mode2B: 'For large groups up to 100 people. Everyone joins a faction and races for the lead question by question. Scored fairly, no matter how big a team is.',
    whyTitle: 'Why CozyWolf?',
    why: [
      'No PowerPoint quiz, a game concept of its own',
      'Live hosted, not automated',
      'Hand-picked questions with an aha moment',
      'Everyone on their own phone, no pen and paper',
      'Five varied question types',
      'Tension until the very last question',
    ],
    audTitle: 'For which occasion?',
    audFirmenT: 'Company or team?',
    audFirmenB: 'A team event where departments or tables compete as factions.',
    audFeiernT: 'Private party?',
    audFeiernB: 'Birthday or friends, a relaxed round where you conquer the board.',
    audLocationsT: 'Café, bar or pub?',
    audLocationsB: 'A recurring quiz night that brings your guests in and keeps them.',
    audMore: 'Learn more',
    hostT: 'Who hosts?',
    hostB: 'I am Johannes, and I make sure your quiz night runs smoothly. From setup and tech to hosting, I take care of everything, so you can sit back and enjoy the evening. My goal: a quiz where every group cheers along, laughs together and happily stays in until the very last question.',
    hostChips: [
      'Personal hosting, on site',
      'For groups of 10 to 100',
      'Tailored to your group',
      'Questions and flow to match your event',
      'Flexible for company parties, clubs and private events',
    ],
    hostRole: 'Founder & quizmaster',
    hostCta: 'Get to know me',
    ctaTitle: 'Up for a quiz?',
    ctaBody: 'Drop me a line about the occasion and rough number of people, and I will come back with a suggestion.',
    ctaTry: 'Try the quiz',
  },
};

export default function HomePage() {
  const lang = useLang();
  const c = C[lang];
  const d = t(lang);
  const audiences = [
    { href: '/firmen', title: c.audFirmenT, body: c.audFirmenB, icon: 'firma' },
    { href: '/feiern', title: c.audFeiernT, body: c.audFeiernB, icon: 'feier' },
    { href: '/locations', title: c.audLocationsT, body: c.audLocationsB, icon: 'pub' },
  ];
  return (
    <Layout>
      <PageHero eyebrow={c.eyebrow} eyebrowLower title={c.title} sub={c.sub}
        visual={<img src="/logo.webp" alt="" width={148} height={148} fetchPriority="high" style={{ width: '100%', height: 'auto', filter: `drop-shadow(0 8px 24px rgba(${BRAND.pinkRgb},0.45))` }} />}
      />
      <SeasonalHint />
      <Section style={{ paddingTop: 0, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Btn href="/kontakt">{d.ctaBook}</Btn>
        <Btn href="#mini" variant="secondary">{c.ctaTry}</Btn>
      </Section>

      {/* Zielgruppen zuerst: Veranstalter ordnet sich sofort ein */}
      <Section style={{ paddingTop: 'clamp(24px, 4vh, 48px)' }}>
        <SecTitle>{c.audTitle}</SecTitle>
        <Reveal stagger style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))' }}>
          {audiences.map(a => (
            <a key={a.href} href={a.href} className="cw-card" style={teaserCard}>
              <span className="cw-card__icon" style={{ display: 'inline-flex' }}><Icon name={a.icon} size={48} /></span>
              <div style={{ fontSize: 20, fontWeight: 900, color: BRAND.pink }}>{a.title}</div>
              <div style={{ fontSize: 15, color: BRAND.inkSoft, fontWeight: 500, lineHeight: 1.5, flex: 1 }}>{a.body}</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: BRAND.pinkSoft }}>{c.audMore} <span className="cw-card__arrow">→</span></div>
            </a>
          ))}
        </Reveal>
      </Section>

      <OrganizerFacts />

      {/* Zwei Modi */}
      <Section>
        <SecTitle>{c.modesTitle}</SecTitle>
        <Reveal stagger style={twoCol}>
          <ModeCard title={c.mode1T} body={c.mode1B} accent={BRAND.pink} emblem={<GridEmblem />} visual={<MiniGrid />} />
          <ModeCard title={c.mode2T} body={c.mode2B} accent={BRAND.magenta} emblem={<ArenaEmblem />} visual={<MiniBars />} />
        </Reveal>
      </Section>

      {/* Warum CozyWolf — Differenzierung gegen 08/15-Eventquiz */}
      <Section>
        <SecTitle>{c.whyTitle}</SecTitle>
        <Reveal stagger style={{
          maxWidth: 760, margin: '0 auto',
          display: 'grid', gap: 'clamp(12px, 1.6vw, 16px)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
        }}>
          {c.why.map((w, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '15px 18px', borderRadius: 14,
              background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(${BRAND.pinkRgb},0.16)`,
            }}>
              <span aria-hidden style={{
                flexShrink: 0, width: 26, height: 26, borderRadius: '50%',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 15, fontWeight: 900, color: BRAND.pink,
                background: `rgba(${BRAND.pinkRgb},0.14)`,
              }}>✓</span>
              <span style={{ fontSize: 15.5, fontWeight: 700, color: BRAND.ink, lineHeight: 1.4 }}>{w}</span>
            </div>
          ))}
        </Reveal>
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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <img src="/assets/johannes.jpg" alt="Johannes, Quizmaster von CozyWolf" style={{
              width: 156, height: 156, borderRadius: '50%', objectFit: 'cover', objectPosition: 'center 22%',
              border: `3px solid rgba(${BRAND.pinkRgb},0.5)`,
            }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 17, fontWeight: 900, color: '#F1F5F9' }}>Johannes</div>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', color: BRAND.pinkSoft }}>{c.hostRole}</div>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 240 }}>
            <h2 style={{ margin: '0 0 10px', fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 900, color: '#F1F5F9' }}>{c.hostT}</h2>
            <p style={{ margin: '0 0 16px', fontSize: 16, color: BRAND.inkSoft, fontWeight: 500, lineHeight: 1.6 }}>{c.hostB}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '0 0 20px' }}>
              {c.hostChips.map((chip, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, fontWeight: 700, color: BRAND.ink }}>
                  <span aria-hidden style={{ color: BRAND.pink, fontSize: 16, fontWeight: 900 }}>✓</span>
                  {chip}
                </div>
              ))}
            </div>
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
          <Btn href="/kontakt">{d.ctaBook}</Btn>
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

function ModeCard({ title, body, accent, visual, emblem }: { title: string; body: string; accent: string; visual?: React.ReactNode; emblem?: React.ReactNode }) {
  return (
    <div className="cw-card" style={{
      padding: 'clamp(22px, 2.6vw, 32px)', borderRadius: 20,
      background: 'rgba(255,255,255,0.03)', border: `1px solid ${accent}44`,
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      {emblem && <div className="cw-card__icon" style={{ marginBottom: 2 }}>{emblem}</div>}
      <div style={{ fontSize: 22, fontWeight: 900, color: accent === BRAND.magenta ? BRAND.pinkSoft : accent }}>{title}</div>
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
