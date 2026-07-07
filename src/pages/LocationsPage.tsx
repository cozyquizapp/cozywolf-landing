// Für Locations (Café/Bar/Pub, wiederkehrende Events). Nutzen für den Wirt +
// die zwei Modi mit Rahmeninfos (Location waehlt je nach Groesse/Stil) +
// ehrlicher Konditionen-Hinweis (KEIN Dead-End). Ich-Form, keine Gedankenstriche.
import { BRAND, anfrageMailto } from '../brand';
import { useLang } from '../lang';
import { Layout, Section, Btn, PageHero } from '../Layout';
import { SplitRow } from '../components/SplitRow';
import { MiniGrid, MiniBars } from '../components/ModeMinis';

const C = {
  de: {
    eyebrow: 'Für Locations',
    title: 'Ein Quiz-Abend, der deine Gäste bringt.',
    sub: 'Café, Bar oder Pub: ein wiederkehrender Abend, der an einem sonst ruhigen Wochentag Leute reinholt und zum Wiederkommen bringt.',
    valueTitle: 'Was es deiner Location bringt',
    v1T: 'Volles Haus am ruhigen Tag',
    v1B: 'Ein fester Quiz-Abend gibt Gästen einen Grund, ausgerechnet dann zu kommen, wenn sonst wenig los ist.',
    v2T: 'Gäste, die wiederkommen',
    v2B: 'Ein wiederkehrendes Format baut Stammpublikum auf. Teams kommen zurück, um es beim nächsten Mal besser zu machen.',
    v3T: 'Passt sich an den Abend an',
    v3B: 'Kleine Runde oder volles Haus, der Abend skaliert mit. Bis etwa 30 Gäste im Erober-Modus, größere Gruppen als Fraktionen bis etwa 100.',
    modeTitle: 'Welcher Modus passt zu deiner Location?',
    modeSub: 'Je nach Größe und Stil deines Ladens wählen wir den passenden Abend aus. Beides moderiere ich komplett selbst.',
    m1Eyebrow: 'CozyQuiz',
    m1Title: 'Das Erober-Grid',
    m1Body: 'Kleine Teams erobern Feld für Feld das Spielfeld. Gemütlich und taktisch, ideal für überschaubare Runden.',
    m1Info: [
      { i: '👥', t: 'Bis etwa 30 Gäste' },
      { i: '🧩', t: 'Kleine Teams, Erober-Modus' },
      { i: '📍', t: 'Café, kleine Bar, ruhiger Abend' },
    ],
    m2Eyebrow: 'Cozy Arena',
    m2Title: 'Das Fraktions-Rennen',
    m2Body: 'Alle schließen sich zu Fraktionen zusammen und kämpfen Frage für Frage um die Führung. Laut und mitreißend, für volle Häuser.',
    m2Info: [
      { i: '👥', t: 'Bis etwa 100 Gäste' },
      { i: '⚡', t: 'Große Gruppen als Fraktionen' },
      { i: '📍', t: 'Pub-Abend, volles Haus, Event' },
    ],
    noteT: 'Konditionen arbeite ich mit dir aus',
    noteB: 'Für Locations lege ich das passende Format und die Konditionen mit dir zusammen fest. Wenn du eine Location hast und Interesse, schreib mir kurz, dann finde ich mit dir etwas, das für dich funktioniert.',
    cta: 'Interesse? Schreib mir',
  },
  en: {
    eyebrow: 'For venues',
    title: 'A quiz night that brings your guests in.',
    sub: 'Café, bar or pub: a recurring evening that fills an otherwise quiet weekday and gets people to come back.',
    valueTitle: 'What it brings your venue',
    v1T: 'A full house on a quiet day',
    v1B: 'A regular quiz night gives guests a reason to come exactly when things are usually slow.',
    v2T: 'Guests who return',
    v2B: 'A recurring format builds a regular crowd. Teams come back to do better next time.',
    v3T: 'Adapts to the evening',
    v3B: 'Small round or full house, the evening scales. Up to about 30 guests in conquer mode, larger groups as factions up to about 100.',
    modeTitle: 'Which mode fits your venue?',
    modeSub: 'Depending on the size and style of your place we pick the right evening. I host both entirely myself.',
    m1Eyebrow: 'CozyQuiz',
    m1Title: 'The conquer board',
    m1Body: 'Small teams claim the board cell by cell. Cozy and tactical, ideal for manageable rounds.',
    m1Info: [
      { i: '👥', t: 'Up to about 30 guests' },
      { i: '🧩', t: 'Small teams, conquer mode' },
      { i: '📍', t: 'Café, small bar, quiet night' },
    ],
    m2Eyebrow: 'Cozy Arena',
    m2Title: 'The faction race',
    m2Body: 'Everyone joins a faction and races for the lead question by question. Loud and gripping, for full houses.',
    m2Info: [
      { i: '👥', t: 'Up to about 100 guests' },
      { i: '⚡', t: 'Large groups as factions' },
      { i: '📍', t: 'Pub night, full house, event' },
    ],
    noteT: 'We work out the terms together',
    noteB: 'For venues I set the right format and terms together with you. If you run a venue and are interested, drop me a line and I will find something that works for you.',
    cta: 'Interested? Write me',
  },
};

export default function LocationsPage() {
  const lang = useLang();
  const c = C[lang];
  const values = [{ t: c.v1T, b: c.v1B }, { t: c.v2T, b: c.v2B }, { t: c.v3T, b: c.v3B }];
  return (
    <Layout>
      <PageHero eyebrow={c.eyebrow} title={c.title} sub={c.sub} />

      <Section style={{ paddingTop: 0 }}>
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

      {/* Zwei Modi als Split-Layout — Location waehlt je nach Groesse/Stil */}
      <Section>
        <h2 style={secTitle}>{c.modeTitle}</h2>
        <p style={{ margin: '0 auto clamp(28px, 4vh, 48px)', maxWidth: 640, textAlign: 'center', fontSize: 17, color: BRAND.inkSoft, fontWeight: 500, lineHeight: 1.6 }}>{c.modeSub}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(36px, 6vh, 72px)' }}>
          <SplitRow visual={<ModeVisual accent={BRAND.pink}><MiniGrid /></ModeVisual>}>
            <ModeText eyebrow={c.m1Eyebrow} title={c.m1Title} body={c.m1Body} info={c.m1Info} accent={BRAND.pink} />
          </SplitRow>
          <SplitRow flip visual={<ModeVisual accent={BRAND.magenta}><MiniBars /></ModeVisual>}>
            <ModeText eyebrow={c.m2Eyebrow} title={c.m2Title} body={c.m2Body} info={c.m2Info} accent={BRAND.magenta} />
          </SplitRow>
        </div>
      </Section>

      <Section style={{ paddingTop: 0 }}>
        <div style={{
          maxWidth: 640, margin: '0 auto', textAlign: 'center',
          padding: 'clamp(26px, 4vw, 44px)', borderRadius: 22,
          background: `rgba(${BRAND.pinkRgb},0.06)`,
          border: `1.5px solid rgba(${BRAND.pinkRgb},0.3)`,
        }}>
          <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: BRAND.pink, marginBottom: 12 }}>{c.noteT}</div>
          <p style={{ margin: '0 auto 24px', fontSize: 16, color: BRAND.inkSoft, fontWeight: 500, lineHeight: 1.65 }}>{c.noteB}</p>
          <Btn href={anfrageMailto(lang)}>{c.cta}</Btn>
        </div>
      </Section>
    </Layout>
  );
}

function ModeVisual({ accent, children }: { accent: string; children: React.ReactNode }) {
  return (
    <div style={{
      width: '100%', maxWidth: 360,
      padding: 'clamp(26px, 3.5vw, 40px)', borderRadius: 24,
      background: `radial-gradient(ellipse at 50% 0%, ${accent}18, transparent 70%), rgba(255,255,255,0.03)`,
      border: `1px solid ${accent}44`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {children}
    </div>
  );
}

function ModeText({ eyebrow, title, body, info, accent }: {
  eyebrow: string; title: string; body: string; info: { i: string; t: string }[]; accent: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: accent }}>{eyebrow}</div>
      <h3 style={{ margin: 0, fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 900, color: '#F1F5F9', letterSpacing: '-0.01em' }}>{title}</h3>
      <p style={{ margin: 0, fontSize: 16, color: BRAND.inkSoft, fontWeight: 500, lineHeight: 1.6 }}>{body}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 4 }}>
        {info.map((it, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, fontSize: 15, fontWeight: 700, color: BRAND.inkSoft }}>
            <span aria-hidden style={{
              width: 30, height: 30, flexShrink: 0, borderRadius: 9, fontSize: 15,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              background: `${accent}1f`, border: `1px solid ${accent}44`,
            }}>{it.i}</span>
            {it.t}
          </div>
        ))}
      </div>
    </div>
  );
}

const secTitle: React.CSSProperties = {
  margin: '0 0 clamp(14px, 2vh, 20px)', textAlign: 'center',
  fontSize: 'clamp(26px, 3.4vw, 40px)', fontWeight: 900, color: '#F1F5F9', letterSpacing: '-0.01em',
};
