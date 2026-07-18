import { BRAND, FONT_DISPLAY, EMAIL } from '../brand';
import { useLang } from '../lang';
import { Layout, Section, Btn } from '../Layout';
import { ContactForm } from '../components/ContactForm';
import { FlowTimeline } from '../components/FlowTimeline';
import { MiniQuiz } from '../components/MiniQuiz';
import { Icon } from '../components/Icon';
import { Reveal } from '../components/Reveal';
import { FaqSection } from '../components/FaqSection';
import { MiniGrid, MiniBars } from '../components/ModeMinis';
import { GridEmblem, ArenaEmblem } from '../components/ModeEmblems';

const C = {
  de: {
    heroEyebrow: 'Live-Quiz-Events und Test-Teams in Hamburg',
    heroTitle: 'Das Quiz-Event, das sich wie ein echtes Produkt anfühlt.',
    heroSub: 'CozyWolf kombiniert Live-Moderation, Handy-Gameplay und zwei Spielmodi zu einem Abend, der Gruppen von 10 bis 100 Personen sofort mitzieht.',
    heroBook: 'Quiz anfragen',
    heroTry: 'Mini-Quiz ausprobieren',
    heroTest: 'Als Test-Team spielen',
    heroStats: [
      { value: '10 bis 100', label: 'Personen pro Event' },
      { value: '2', label: 'Spielmodi für kleine und große Gruppen' },
      { value: '0', label: 'App-Installationen nötig' },
    ],
    intentTitle: 'Direkt der richtige Einstieg',
    intents: [
      { title: 'Quiz anfragen', body: 'Für Firmen, Geburtstage und Locations, die einen moderierten Quizabend buchen wollen.', href: '/kontakt', icon: 'firma', linkLabel: 'Zur Anfrage' },
      { title: 'Quiz ausprobieren', body: 'Für alle, die erst sehen wollen, wie sich CozyWolf auf dem Handy und im Ablauf anfühlt.', href: '#demo', icon: 'handy', linkLabel: 'Zum Mini-Quiz' },
      { title: 'Test-Team werden', body: 'Für T-Shirt-Besucher und neugierige Gruppen, die kostenlos mitspielen und Feedback geben möchten.', href: '/testen', icon: 'team', linkLabel: 'Zur Test-Team-Seite' },
    ],
    problemTitle: 'Was klassische Quizabende oft verlieren',
    problemBody: 'Viele Formate sind nett, aber nicht stark genug inszeniert. Genau dort setzt CozyWolf an.',
    problems: [
      { title: 'Zu wenig Produktgefühl', body: 'Ein normaler Folienabend erklärt kaum, warum sich dieses Event besonders anfühlen soll.' },
      { title: 'Große Gruppen driften weg', body: 'Wenn nur die Schnellsten gewinnen, verlieren leise Tische und kleine Teams früh die Lust.' },
      { title: 'Zu viel Aufwand für Organisatoren', body: 'Technik, Ablauf und Moderation landen schnell bei der Person, die eigentlich Gastgeber sein wollte.' },
    ],
    solutionTitle: 'CozyWolf übernimmt nicht nur die Fragen, sondern den ganzen Abend.',
    solutionBody: 'Die Seite muss in Sekunden zeigen, warum das Format moderner wirkt als ein gewöhnliches Eventquiz. Deshalb stehen Produkt, Ablauf und Einstiegspfade direkt im Vordergrund.',
    solutionPoints: [
      'Live moderiert von Johannes, nicht automatisiert',
      'Alle spielen direkt im Browser am Handy',
      'Zwei Modi für kleine Runden und große Gruppen',
      'Technik, Aufbau und Dramaturgie kommen aus einer Hand',
    ],
    flowTitle: 'So kommt ihr von der Anfrage ins Spiel',
    flowSteps: [
      { t: 'Anfragen oder Test-Team werden', b: 'Du entscheidest sofort, ob du buchen, ausprobieren oder kostenlos als Test-Team spielen möchtest.' },
      { t: 'Format und Gruppengröße festlegen', b: 'Ich passe Modus, Länge und Frage-Dramaturgie an euren Anlass und eure Runde an.' },
      { t: 'Gemeinsam spielen', b: 'Am Eventabend läuft die Technik, die Moderation und das Gameplay aus einem Guss.' },
    ],
    modesTitle: 'Ein Abend, zwei Spielformen',
    modesBody: 'CozyWolf fühlt sich nicht nach derselben Vorlage für jede Gruppe an. Das Format wechselt abhängig von Größe und Stimmung.',
    modeQuizTitle: 'CozyQuiz',
    modeQuizBody: 'Kleine Teams erobern das Spielfeld Feld für Feld. Taktik und Wissen greifen ineinander, ohne hektisch zu werden.',
    modeArenaTitle: 'CozyArena',
    modeArenaBody: 'Große Gruppen laufen als Fraktionen ein Rennen um die Führung. Die Wertung bleibt fair, auch wenn Teams unterschiedlich groß sind.',
    featuresTitle: 'Warum Besucher dranbleiben',
    features: [
      { icon: 'moderation', title: 'Live gehostet', body: 'Die Stimmung kommt von echter Moderation, nicht von einer abgespielten Datei.' },
      { icon: 'handy', title: 'Kein Download', body: 'QR-Code scannen, Browser öffnen, losspielen. So sinkt die Einstiegshürde sofort.' },
      { icon: 'team', title: 'Für Gruppen gebaut', body: 'Kleine Teams und volle Räume bekommen jeweils einen Modus, der zu ihnen passt.' },
      { icon: 'puzzle', title: 'Fünf Fragetypen', body: 'Die Runden wechseln im Tempo und im Denkmuster. Dadurch bleibt der Abend frisch.' },
      { icon: 'aufbau', title: 'Setup inklusive', body: 'Ich bringe Beamer, Sound und Ablaufstruktur mit. Gastgeber bleiben Gastgeber.' },
      { icon: 'energie', title: 'Spannung bis zum Ende', body: 'Lead changes, Teamdynamik und klare Regeln halten die Energie stabil.' },
    ],
    audienceTitle: 'Für wen ist CozyWolf gedacht?',
    audiences: [
      { href: '/firmen', title: 'Für Firmen', body: 'Team-Events, Offsites und Sommerfeste, die mehr brauchen als nur Fragen auf einer Leinwand.', icon: 'firma' },
      { href: '/feiern', title: 'Für private Feiern', body: 'Geburtstage und Freundesrunden, die gemeinsam lachen, raten und gegeneinander antreten wollen.', icon: 'feier' },
      { href: '/locations', title: 'Für Bars und Cafés', body: 'Wiederkehrende Quizabende, die Gäste binden und ruhige Wochentage attraktiver machen.', icon: 'pub' },
    ],
    hostTitle: 'Die Vertrauensebene gehört nicht in den Footer.',
    hostBody: 'Ich bin Johannes und moderiere CozyWolf selbst. Von Aufbau über Technik bis zur Dramaturgie kommt alles aus einer Hand. Das gibt Veranstaltern Ruhe und sorgt dafür, dass das Format vor Ort genauso wirkt wie auf der Website.',
    hostBullets: [
      'Persönliche Moderation vor Ort',
      'Hamburg und Umland',
      '90 bis 120 Minuten Programmdauer',
      'Passend für Firmen, Feiern und Locations',
    ],
    hostCta: 'Mehr über Johannes',
    finalTitle: 'Bereit für den nächsten Schritt?',
    finalBody: 'Wenn du ein Event planst, schreib mir kurz Anlass, Größe und Zeitraum. Wenn du einfach mal mitspielen willst, werde Test-Team.',
    finalFormTitle: 'Quiz anfragen',
    finalFormBody: 'Ich melde mich mit einem konkreten Vorschlag zurück.',
    finalTestEyebrow: 'Kostenlos mitspielen',
    finalTestTitle: 'Ich suche sichtbar nach Test-Teams.',
    finalTestBody: 'Gerade für Menschen, die CozyWolf zufällig entdecken, soll es einen klaren Weg geben: Runde zusammenstellen, kostenlos spielen, ehrliches Feedback geben.',
    finalTestList: [
      'Perfekt für T-Shirt-Traffic und spontane Neugier',
      'Kompletter Quizabend statt trockener Demo',
      'Direkter Link zur eigenen Test-Team-Seite',
    ],
    finalTestCta: 'Zur Test-Team-Seite',
    finalDirect: 'Oder direkt schreiben an',
    showcaseLive: 'Live moderiert',
    showcaseQuestion: 'Frage 08 · Hauptstädte und schnelle Teams',
    showcaseSub: 'Ein Blick auf das aktuelle Spielgeschehen: Board links, Rennen rechts, Moderation darüber.',
    showcasePanelA: 'CozyQuiz Board',
    showcasePanelB: 'CozyArena Lead',
    showcaseTags: ['QR-Einstieg', '5 Fragetypen', 'Fair für große Gruppen'],
  },
  en: {
    heroEyebrow: 'Live quiz events and test teams in Hamburg',
    heroTitle: 'The quiz event that feels like a real product.',
    heroSub: 'CozyWolf combines live hosting, phone gameplay and two play modes into an evening that hooks groups of 10 to 100 people right away.',
    heroBook: 'Request a quiz',
    heroTry: 'Try the mini quiz',
    heroTest: 'Play as a test team',
    heroStats: [
      { value: '10 to 100', label: 'people per event' },
      { value: '2', label: 'play modes for small and large groups' },
      { value: '0', label: 'app installs required' },
    ],
    intentTitle: 'Choose the right way in',
    intents: [
      { title: 'Request a quiz', body: 'For companies, birthdays and venues that want to book a hosted quiz night.', href: '/kontakt', icon: 'firma', linkLabel: 'Go to booking' },
      { title: 'Try the quiz', body: 'For anyone who first wants to feel how CozyWolf works on a phone and in the room.', href: '#demo', icon: 'handy', linkLabel: 'Open the mini quiz' },
      { title: 'Become a test team', body: 'For curious visitors and T-shirt traffic who want to play for free and share feedback.', href: '/testen', icon: 'team', linkLabel: 'Go to the test-team page' },
    ],
    problemTitle: 'What classic quiz nights often lose',
    problemBody: 'Many formats are pleasant, but not staged strongly enough. That is exactly where CozyWolf starts.',
    problems: [
      { title: 'Not enough product feel', body: 'A normal slide deck evening rarely explains why this event should feel special.' },
      { title: 'Large groups drift off', body: 'When only the fastest teams matter, quieter tables and smaller teams lose energy early.' },
      { title: 'Too much organiser effort', body: 'Tech, timing and hosting quickly land on the person who only wanted to host guests.' },
    ],
    solutionTitle: 'CozyWolf does not just bring questions. It brings the whole evening.',
    solutionBody: 'The page has to show in seconds why the format feels more modern than a standard event quiz. That is why product, flow and entry points come first.',
    solutionPoints: [
      'Hosted live by Johannes, not automated',
      'Everyone plays right in the browser on a phone',
      'Two modes for small rounds and large groups',
      'Tech, setup and show flow come from one source',
    ],
    flowTitle: 'How you get from the first click to game night',
    flowSteps: [
      { t: 'Request or become a test team', b: 'You decide right away whether you want to book, try the product or play for free as a test team.' },
      { t: 'Match the format to the group', b: 'I tailor mode, duration and question flow to your occasion and group size.' },
      { t: 'Play together', b: 'On the event night, tech, hosting and gameplay feel like one coherent product.' },
    ],
    modesTitle: 'One evening, two play styles',
    modesBody: 'CozyWolf should not feel like the same template for every group. The format changes with scale and mood.',
    modeQuizTitle: 'CozyQuiz',
    modeQuizBody: 'Smaller teams conquer the board cell by cell. Tactics and knowledge work together without becoming frantic.',
    modeArenaTitle: 'CozyArena',
    modeArenaBody: 'Large groups race as factions for the lead. Scoring stays fair even when teams differ in size.',
    featuresTitle: 'Why visitors stay engaged',
    features: [
      { icon: 'moderation', title: 'Hosted live', body: 'The energy comes from real hosting, not a played-back file.' },
      { icon: 'handy', title: 'No download', body: 'Scan a QR code, open the browser, start playing. Friction stays low.' },
      { icon: 'team', title: 'Built for groups', body: 'Small teams and full rooms each get a mode that actually fits them.' },
      { icon: 'puzzle', title: 'Five question types', body: 'Rounds vary in tempo and thinking style, which keeps the evening fresh.' },
      { icon: 'aufbau', title: 'Setup included', body: 'I bring projector, sound and structure, so hosts can stay hosts.' },
      { icon: 'energie', title: 'Tension to the end', body: 'Lead changes, team dynamics and clear rules keep the room alive.' },
    ],
    audienceTitle: 'Who CozyWolf is for',
    audiences: [
      { href: '/firmen', title: 'For companies', body: 'Team events, offsites and celebrations that need more than questions on a screen.', icon: 'firma' },
      { href: '/feiern', title: 'For private parties', body: 'Birthdays and friend groups that want to laugh, guess and compete together.', icon: 'feier' },
      { href: '/locations', title: 'For bars and cafés', body: 'Recurring quiz nights that bring guests back and strengthen quiet weekdays.', icon: 'pub' },
    ],
    hostTitle: 'The trust layer should not live in the footer.',
    hostBody: 'I am Johannes and I host CozyWolf myself. Setup, tech and live moderation come from one source. That gives organisers peace of mind and makes the real evening feel as polished as the website.',
    hostBullets: [
      'Personal hosting on site',
      'Hamburg and surrounding area',
      '90 to 120 minutes of programme',
      'Built for companies, parties and venues',
    ],
    hostCta: 'More about Johannes',
    finalTitle: 'Ready for the next step?',
    finalBody: 'If you are planning an event, tell me the occasion, size and timeframe. If you just want to play first, become a test team.',
    finalFormTitle: 'Request a quiz',
    finalFormBody: 'I will come back to you with a concrete suggestion.',
    finalTestEyebrow: 'Play for free',
    finalTestTitle: 'I want test teams to be impossible to miss.',
    finalTestBody: 'Especially for people who discover CozyWolf by chance, there should be a clear next step: gather a group, play for free, share honest feedback.',
    finalTestList: [
      'Perfect for T-shirt traffic and spontaneous curiosity',
      'A full quiz night instead of a dry demo',
      'Direct path to the dedicated test-team page',
    ],
    finalTestCta: 'Go to the test-team page',
    finalDirect: 'Or write directly to',
    showcaseLive: 'Hosted live',
    showcaseQuestion: 'Question 08 · capitals and fast teams',
    showcaseSub: 'A quick look at the room: board on the left, race on the right, moderation above it all.',
    showcasePanelA: 'CozyQuiz board',
    showcasePanelB: 'CozyArena lead',
    showcaseTags: ['QR entry', '5 question types', 'Fair for large groups'],
  },
};

export default function HomePage() {
  const lang = useLang();
  const c = C[lang];

  return (
    <Layout>
      <style>{`
        @media (max-width: 720px) {
          .cw-home-actions {
            display: grid !important;
          }

          .cw-home-actions > a {
            width: 100%;
          }

          .cw-home-showcase {
            padding: 18px !important;
          }
        }
      `}</style>
      <Section
        data-sticky-trigger
        style={{
          paddingTop: 'clamp(44px, 8vh, 88px)',
          paddingBottom: 'clamp(40px, 6vh, 72px)',
          position: 'relative',
        }}
      >
        <div aria-hidden style={heroGlow} />
        <Reveal style={heroGrid}>
          <div style={{ display: 'grid', gap: 26, alignSelf: 'center' }}>
            <div style={{ display: 'grid', gap: 18 }}>
              <span style={heroEyebrow}>{c.heroEyebrow}</span>
              <h1 style={heroTitle}>{c.heroTitle}</h1>
              <p style={heroBody}>{c.heroSub}</p>
            </div>

            <div className="cw-home-actions" style={heroActions}>
              <Btn href="/kontakt">{c.heroBook}</Btn>
              <Btn href="#demo" variant="secondary">{c.heroTry}</Btn>
              <Btn href="/testen" variant="ghost">{c.heroTest}</Btn>
            </div>

            <div style={metricGrid}>
              {c.heroStats.map((item) => (
                <MetricCard key={item.label} value={item.value} label={item.label} />
              ))}
            </div>
          </div>

          <HeroShowcase
            live={c.showcaseLive}
            question={c.showcaseQuestion}
            sub={c.showcaseSub}
            panelA={c.showcasePanelA}
            panelB={c.showcasePanelB}
            tags={c.showcaseTags}
          />
        </Reveal>

        <div style={{ marginTop: 'clamp(26px, 4vw, 38px)' }}>
          <SectionHeading title={c.intentTitle} centered compact />
          <Reveal stagger style={intentGrid}>
            {c.intents.map((item) => (
              <IntentCard key={item.title} {...item} />
            ))}
          </Reveal>
        </div>
      </Section>

      <Section>
        <SectionHeading title={c.problemTitle} body={c.problemBody} centered />
        <Reveal stagger style={problemGrid}>
          {c.problems.map((item) => (
            <ProblemCard key={item.title} title={item.title} body={item.body} />
          ))}
        </Reveal>
      </Section>

      <Section style={splitSection}>
        <Reveal style={{ display: 'grid', gap: 22, alignContent: 'start' }}>
          <SectionHeading title={c.solutionTitle} body={c.solutionBody} />
          <div style={{ display: 'grid', gap: 12 }}>
            {c.solutionPoints.map((item) => (
              <div key={item} style={checkRow}>
                <span aria-hidden style={checkIcon}>+</span>
                <span style={checkText}>{item}</span>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal style={accentPanel}>
          <SectionHeading title={c.flowTitle} compact />
          <FlowTimeline steps={c.flowSteps} />
        </Reveal>
      </Section>

      <Section>
        <SectionHeading title={c.modesTitle} body={c.modesBody} centered />
        <Reveal stagger style={modeGrid}>
          <ModeCard
            title={c.modeQuizTitle}
            body={c.modeQuizBody}
            accent={BRAND.pink}
            emblem={<GridEmblem />}
            visual={<MiniGrid />}
          />
          <ModeCard
            title={c.modeArenaTitle}
            body={c.modeArenaBody}
            accent={BRAND.magenta}
            emblem={<ArenaEmblem />}
            visual={<MiniBars />}
          />
        </Reveal>
      </Section>

      <div id="demo">
        <MiniQuiz />
      </div>

      <Section>
        <SectionHeading title={c.featuresTitle} centered />
        <Reveal stagger style={featureGrid}>
          {c.features.map((item) => (
            <FeatureCard key={item.title} icon={item.icon} title={item.title} body={item.body} />
          ))}
        </Reveal>
      </Section>

      <Section style={splitSection}>
        <Reveal style={{ display: 'grid', gap: 22, alignContent: 'start' }}>
          <SectionHeading title={c.audienceTitle} />
          <div style={{ display: 'grid', gap: 16 }}>
            {c.audiences.map((item) => (
              <AudienceCard key={item.href} {...item} />
            ))}
          </div>
        </Reveal>

        <Reveal style={hostPanel}>
          <div style={hostHeader}>
            <img
              src="/assets/johannes.jpg"
              alt="Johannes, Quizmaster von CozyWolf"
              width={120}
              height={120}
              style={hostImage}
            />
            <div style={{ display: 'grid', gap: 6 }}>
              <div style={hostName}>Johannes</div>
              <div style={hostRole}>{lang === 'de' ? 'Gründer und Quizmaster' : 'Founder and quizmaster'}</div>
            </div>
          </div>
          <div style={{ display: 'grid', gap: 16 }}>
            <SectionHeading title={c.hostTitle} body={c.hostBody} compact />
            <div style={{ display: 'grid', gap: 10 }}>
              {c.hostBullets.map((item) => (
                <div key={item} style={hostBullet}>
                  <span aria-hidden style={hostBulletMark}>+</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div>
              <Btn href="/ueber" variant="secondary">{c.hostCta}</Btn>
            </div>
          </div>
        </Reveal>
      </Section>

      <FaqSection />

      <Section id="kontakt-form">
        <div style={finalShell}>
          <div style={{ display: 'grid', gap: 18 }}>
            <SectionHeading title={c.finalTitle} body={c.finalBody} />
            <div style={finalFormLead}>
              <div style={finalFormLeadTitle}>{c.finalFormTitle}</div>
              <div style={finalFormLeadBody}>{c.finalFormBody}</div>
            </div>
            <ContactForm />
          </div>

          <div style={testPanel}>
            <div style={testEyebrow}>{c.finalTestEyebrow}</div>
            <h3 style={testTitle}>{c.finalTestTitle}</h3>
            <p style={testBody}>{c.finalTestBody}</p>
            <div style={{ display: 'grid', gap: 10 }}>
              {c.finalTestList.map((item) => (
                <div key={item} style={testListRow}>
                  <span aria-hidden style={testListMark}>+</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gap: 14, marginTop: 8 }}>
              <Btn href="/testen">{c.finalTestCta}</Btn>
              <div style={directMail}>
                {c.finalDirect}{' '}
                <a href={`mailto:${EMAIL}`} style={{ color: '#fff4fb', fontWeight: 800, textDecoration: 'none' }}>
                  {EMAIL}
                </a>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </Layout>
  );
}

function SectionHeading({
  title,
  body,
  centered = false,
  compact = false,
}: {
  title: string;
  body?: string;
  centered?: boolean;
  compact?: boolean;
}) {
  return (
    <div style={{
      display: 'grid',
      gap: compact ? 10 : 14,
      maxWidth: centered ? 760 : 680,
      margin: centered ? '0 auto' : undefined,
      textAlign: centered ? 'center' : 'left',
    }}>
      <h2 style={{
        margin: 0,
        fontFamily: FONT_DISPLAY,
        fontSize: compact ? 'clamp(28px, 3.8vw, 40px)' : 'clamp(32px, 4.4vw, 48px)',
        fontWeight: 800,
        lineHeight: 1.02,
        letterSpacing: '-0.03em',
        color: '#fff4fb',
        textWrap: 'balance',
      }}>{title}</h2>
      {body && (
        <p style={{
          margin: 0,
          fontSize: 17,
          lineHeight: 1.65,
          color: 'rgba(226,232,240,0.76)',
          fontWeight: 600,
        }}>{body}</p>
      )}
    </div>
  );
}

function MetricCard({ value, label }: { value: string; label: string }) {
  return (
    <div style={metricCard}>
      <div style={metricValue}>{value}</div>
      <div style={metricLabel}>{label}</div>
    </div>
  );
}

function IntentCard({
  title,
  body,
  href,
  icon,
  linkLabel,
}: {
  title: string;
  body: string;
  href: string;
  icon: string;
  linkLabel: string;
}) {
  return (
    <a href={href} className="cw-card" style={intentCard}>
      <div style={{ display: 'inline-flex', width: 'fit-content' }}>
        <Icon name={icon} size={42} />
      </div>
      <div style={intentTitle}>{title}</div>
      <div style={intentBody}>{body}</div>
      <div style={intentLink}>{linkLabel}</div>
    </a>
  );
}

function ProblemCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="cw-card" style={problemCard}>
      <div style={problemTitle}>{title}</div>
      <div style={problemBody}>{body}</div>
    </div>
  );
}

function ModeCard({
  title,
  body,
  accent,
  emblem,
  visual,
}: {
  title: string;
  body: string;
  accent: string;
  emblem: React.ReactNode;
  visual: React.ReactNode;
}) {
  return (
    <div className="cw-card" style={{
      ...modeCard,
      border: `1px solid ${accent}38`,
      boxShadow: `0 24px 54px rgba(0,0,0,0.26), inset 0 1px 0 rgba(255,255,255,0.04)`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'grid', gap: 12, flex: 1, minWidth: 220 }}>
          <div style={{ display: 'inline-flex' }}>{emblem}</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: accent, letterSpacing: '-0.02em' }}>{title}</div>
          <p style={modeBody}>{body}</p>
        </div>
        <div style={{
          flex: '0 0 min(100%, 240px)',
          padding: 18,
          borderRadius: 22,
          background: 'rgba(255,255,255,0.035)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          {visual}
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="cw-card" style={featureCard}>
      <div style={{ display: 'inline-flex', width: 'fit-content' }}>
        <Icon name={icon} size={38} />
      </div>
      <div style={featureTitle}>{title}</div>
      <div style={featureBody}>{body}</div>
    </div>
  );
}

function AudienceCard({
  href,
  title,
  body,
  icon,
}: {
  href: string;
  title: string;
  body: string;
  icon: string;
}) {
  return (
    <a href={href} className="cw-card" style={audienceCard}>
      <div style={{ display: 'inline-flex', width: 'fit-content' }}>
        <Icon name={icon} size={38} />
      </div>
      <div style={featureTitle}>{title}</div>
      <div style={featureBody}>{body}</div>
    </a>
  );
}

function HeroShowcase({
  live,
  question,
  sub,
  panelA,
  panelB,
  tags,
}: {
  live: string;
  question: string;
  sub: string;
  panelA: string;
  panelB: string;
  tags: string[];
}) {
  return (
    <div className="cw-home-showcase" style={showcaseShell}>
      <div style={showcaseToolbar}>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={toolbarDot('#f97316')} />
          <span style={toolbarDot('#facc15')} />
          <span style={toolbarDot('#34d399')} />
        </div>
        <div style={toolbarBadge}>{live}</div>
      </div>

      <div style={showcaseQuestionCard}>
        <div style={showcaseKicker}>CozyWolf Live</div>
        <div style={showcaseQuestion}>{question}</div>
        <div style={showcaseQuestionSub}>{sub}</div>
      </div>

      <div style={showcasePanels}>
        <div style={showcasePanel}>
          <div style={showcasePanelTitle}>{panelA}</div>
          <MiniGrid />
        </div>
        <div style={showcasePanel}>
          <div style={showcasePanelTitle}>{panelB}</div>
          <MiniBars />
        </div>
      </div>

      <div style={showcaseTags}>
        {tags.map((tag) => (
          <span key={tag} style={showcaseTag}>{tag}</span>
        ))}
      </div>
    </div>
  );
}

const heroGlow: React.CSSProperties = {
  position: 'absolute',
  inset: '-6% 8% auto',
  height: 'clamp(300px, 50vw, 420px)',
  pointerEvents: 'none',
  background: `radial-gradient(circle at 50% 20%, rgba(${BRAND.pinkRgb},0.16), transparent 58%)`,
  filter: 'blur(18px)',
  opacity: 0.95,
};

const heroGrid: React.CSSProperties = {
  position: 'relative',
  zIndex: 1,
  display: 'grid',
  gap: 'clamp(26px, 4vw, 48px)',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
  alignItems: 'stretch',
};

const heroEyebrow: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  width: 'fit-content',
  padding: '9px 14px',
  borderRadius: 999,
  background: 'rgba(255,255,255,0.05)',
  border: `1px solid rgba(${BRAND.pinkRgb},0.22)`,
  color: '#fff4fb',
  fontWeight: 800,
  fontSize: 12.5,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
};

const heroTitle: React.CSSProperties = {
  margin: 0,
  fontFamily: FONT_DISPLAY,
  fontSize: 'clamp(44px, 7vw, 76px)',
  fontWeight: 800,
  lineHeight: 0.94,
  letterSpacing: '-0.05em',
  color: '#fff4fb',
  textWrap: 'balance',
};

const heroBody: React.CSSProperties = {
  margin: 0,
  maxWidth: 680,
  fontSize: 'clamp(18px, 2.2vw, 22px)',
  lineHeight: 1.62,
  color: 'rgba(226,232,240,0.82)',
  fontWeight: 600,
};

const heroActions: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 12,
};

const metricGrid: React.CSSProperties = {
  display: 'grid',
  gap: 12,
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))',
};

const metricCard: React.CSSProperties = {
  padding: '18px 18px 16px',
  borderRadius: 22,
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
};

const metricValue: React.CSSProperties = {
  fontFamily: FONT_DISPLAY,
  fontSize: 'clamp(28px, 4vw, 40px)',
  fontWeight: 800,
  lineHeight: 1,
  letterSpacing: '-0.03em',
  color: '#fff4fb',
  marginBottom: 8,
};

const metricLabel: React.CSSProperties = {
  fontSize: 13.5,
  lineHeight: 1.45,
  color: 'rgba(226,232,240,0.74)',
  fontWeight: 700,
};

const intentGrid: React.CSSProperties = {
  display: 'grid',
  gap: 16,
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
};

const intentCard: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
  padding: '22px',
  borderRadius: 24,
  background: 'rgba(255,255,255,0.045)',
  border: '1px solid rgba(255,255,255,0.08)',
  textDecoration: 'none',
};

const intentTitle: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 900,
  color: '#fff4fb',
  letterSpacing: '-0.02em',
};

const intentBody: React.CSSProperties = {
  fontSize: 15.5,
  lineHeight: 1.6,
  color: 'rgba(226,232,240,0.74)',
  fontWeight: 600,
  flex: 1,
};

const intentLink: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 800,
  color: BRAND.pinkSoft,
};

const problemGrid: React.CSSProperties = {
  display: 'grid',
  gap: 16,
  marginTop: 28,
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
};

const problemCard: React.CSSProperties = {
  padding: '22px 22px 24px',
  borderRadius: 24,
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
};

const problemTitle: React.CSSProperties = {
  fontSize: 21,
  fontWeight: 900,
  letterSpacing: '-0.02em',
  color: '#fff4fb',
  marginBottom: 10,
};

const problemBody: React.CSSProperties = {
  fontSize: 15.5,
  lineHeight: 1.62,
  color: 'rgba(226,232,240,0.74)',
  fontWeight: 600,
};

const splitSection: React.CSSProperties = {
  display: 'grid',
  gap: 'clamp(22px, 4vw, 34px)',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
  alignItems: 'start',
};

const checkRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 12,
  padding: '15px 16px',
  borderRadius: 18,
  background: 'rgba(255,255,255,0.035)',
  border: '1px solid rgba(255,255,255,0.07)',
};

const checkIcon: React.CSSProperties = {
  width: 26,
  height: 26,
  flexShrink: 0,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  background: `rgba(${BRAND.pinkRgb},0.18)`,
  color: BRAND.pinkSoft,
  fontWeight: 900,
  marginTop: 1,
};

const checkText: React.CSSProperties = {
  fontSize: 15.5,
  lineHeight: 1.55,
  color: '#fff4fb',
  fontWeight: 700,
};

const accentPanel: React.CSSProperties = {
  padding: 'clamp(24px, 3vw, 32px)',
  borderRadius: 30,
  background: 'linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.03))',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 26px 60px rgba(0,0,0,0.24)',
};

const modeGrid: React.CSSProperties = {
  display: 'grid',
  gap: 18,
  marginTop: 30,
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
};

const modeCard: React.CSSProperties = {
  padding: 'clamp(24px, 3vw, 32px)',
  borderRadius: 30,
  background: 'rgba(255,255,255,0.045)',
};

const modeBody: React.CSSProperties = {
  margin: 0,
  fontSize: 16,
  lineHeight: 1.62,
  color: 'rgba(226,232,240,0.78)',
  fontWeight: 600,
};

const featureGrid: React.CSSProperties = {
  display: 'grid',
  gap: 16,
  marginTop: 30,
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
};

const featureCard: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
  padding: '22px 22px 24px',
  borderRadius: 24,
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
};

const featureTitle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 900,
  color: '#fff4fb',
  letterSpacing: '-0.02em',
};

const featureBody: React.CSSProperties = {
  fontSize: 15.5,
  lineHeight: 1.58,
  color: 'rgba(226,232,240,0.74)',
  fontWeight: 600,
};

const audienceCard: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
  padding: '20px 20px 22px',
  borderRadius: 24,
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  textDecoration: 'none',
};

const hostPanel: React.CSSProperties = {
  display: 'grid',
  gap: 26,
  padding: 'clamp(24px, 3vw, 32px)',
  borderRadius: 30,
  background: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.03))',
  border: `1px solid rgba(${BRAND.pinkRgb},0.16)`,
  boxShadow: '0 26px 60px rgba(0,0,0,0.24)',
};

const hostHeader: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 18,
  flexWrap: 'wrap',
};

const hostImage: React.CSSProperties = {
  width: 120,
  height: 120,
  borderRadius: 28,
  objectFit: 'cover',
  objectPosition: 'center 22%',
  border: `1px solid rgba(${BRAND.pinkRgb},0.24)`,
  boxShadow: `0 18px 40px rgba(${BRAND.pinkRgb},0.12)`,
};

const hostName: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 900,
  color: '#fff4fb',
  letterSpacing: '-0.03em',
};

const hostRole: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 800,
  color: BRAND.pinkSoft,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
};

const hostBullet: React.CSSProperties = {
  display: 'flex',
  gap: 12,
  alignItems: 'flex-start',
  color: '#fff4fb',
  fontSize: 15,
  lineHeight: 1.5,
  fontWeight: 700,
};

const hostBulletMark: React.CSSProperties = {
  width: 22,
  height: 22,
  flexShrink: 0,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  background: `rgba(${BRAND.pinkRgb},0.16)`,
  color: BRAND.pinkSoft,
  fontWeight: 900,
};

const finalShell: React.CSSProperties = {
  display: 'grid',
  gap: 'clamp(18px, 3vw, 28px)',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
};

const finalFormLead: React.CSSProperties = {
  display: 'grid',
  gap: 6,
  padding: '18px 18px 20px',
  borderRadius: 22,
  background: 'rgba(255,255,255,0.035)',
  border: '1px solid rgba(255,255,255,0.08)',
  width: 'fit-content',
  minWidth: 'min(100%, 320px)',
};

const finalFormLeadTitle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 900,
  color: '#fff4fb',
  letterSpacing: '-0.02em',
};

const finalFormLeadBody: React.CSSProperties = {
  fontSize: 15,
  lineHeight: 1.58,
  color: 'rgba(226,232,240,0.74)',
  fontWeight: 600,
};

const testPanel: React.CSSProperties = {
  display: 'grid',
  gap: 16,
  alignContent: 'start',
  padding: 'clamp(24px, 3vw, 32px)',
  borderRadius: 30,
  background: `linear-gradient(180deg, rgba(${BRAND.pinkRgb},0.18), rgba(${BRAND.pinkRgb},0.06))`,
  border: `1px solid rgba(${BRAND.pinkRgb},0.22)`,
  boxShadow: `0 28px 60px rgba(${BRAND.pinkRgb},0.10), 0 18px 40px rgba(0,0,0,0.24)`,
};

const testEyebrow: React.CSSProperties = {
  width: 'fit-content',
  padding: '8px 12px',
  borderRadius: 999,
  background: 'rgba(255,255,255,0.12)',
  color: '#fff4fb',
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
};

const testTitle: React.CSSProperties = {
  margin: 0,
  fontFamily: FONT_DISPLAY,
  fontSize: 'clamp(30px, 4vw, 42px)',
  lineHeight: 0.98,
  letterSpacing: '-0.03em',
  color: '#fff4fb',
};

const testBody: React.CSSProperties = {
  margin: 0,
  fontSize: 16,
  lineHeight: 1.62,
  color: 'rgba(255,244,251,0.84)',
  fontWeight: 600,
};

const testListRow: React.CSSProperties = {
  display: 'flex',
  gap: 12,
  alignItems: 'flex-start',
  color: '#fff4fb',
  fontSize: 15,
  lineHeight: 1.52,
  fontWeight: 700,
};

const testListMark: React.CSSProperties = {
  width: 22,
  height: 22,
  flexShrink: 0,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  background: 'rgba(255,255,255,0.16)',
  color: '#fff4fb',
  fontWeight: 900,
};

const directMail: React.CSSProperties = {
  fontSize: 14.5,
  lineHeight: 1.5,
  color: 'rgba(255,244,251,0.82)',
  fontWeight: 600,
};

const showcaseShell: React.CSSProperties = {
  display: 'grid',
  gap: 16,
  alignContent: 'start',
  padding: 'clamp(18px, 2.6vw, 24px)',
  borderRadius: 32,
  background: 'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.035))',
  border: '1px solid rgba(255,255,255,0.10)',
  boxShadow: '0 32px 80px rgba(0,0,0,0.28)',
  minHeight: 0,
};

const showcaseToolbar: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
};

const toolbarDot = (color: string): React.CSSProperties => ({
  width: 10,
  height: 10,
  borderRadius: '50%',
  background: color,
});

const toolbarBadge: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: 999,
  background: 'rgba(255,255,255,0.06)',
  border: `1px solid rgba(${BRAND.pinkRgb},0.18)`,
  color: '#fff4fb',
  fontSize: 12.5,
  fontWeight: 800,
};

const showcaseQuestionCard: React.CSSProperties = {
  display: 'grid',
  gap: 8,
  padding: '18px 18px 20px',
  borderRadius: 24,
  background: 'rgba(12, 13, 26, 0.78)',
  border: '1px solid rgba(255,255,255,0.08)',
};

const showcaseKicker: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  color: BRAND.pinkSoft,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
};

const showcaseQuestion: React.CSSProperties = {
  fontSize: 'clamp(22px, 3vw, 30px)',
  lineHeight: 1.08,
  color: '#fff4fb',
  fontWeight: 900,
  letterSpacing: '-0.03em',
};

const showcaseQuestionSub: React.CSSProperties = {
  fontSize: 14.5,
  lineHeight: 1.56,
  color: 'rgba(226,232,240,0.72)',
  fontWeight: 600,
};

const showcasePanels: React.CSSProperties = {
  display: 'grid',
  gap: 14,
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
};

const showcasePanel: React.CSSProperties = {
  display: 'grid',
  gap: 12,
  padding: '16px 16px 18px',
  borderRadius: 24,
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
};

const showcasePanelTitle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 800,
  color: 'rgba(226,232,240,0.74)',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
};

const showcaseTags: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 10,
};

const showcaseTag: React.CSSProperties = {
  padding: '9px 12px',
  borderRadius: 999,
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
  color: '#fff4fb',
  fontSize: 13,
  fontWeight: 700,
};
