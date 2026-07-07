// Für Locations (Café/Bar/Pub, wiederkehrende Events). Nutzen für den Wirt +
// wie es laufen könnte. Das Geschäftsmodell (Konditionen) steht noch nicht
// fest, daher ehrlicher Hinweis, aber KEIN Dead-End. Ich-Form, keine Gedankenstriche.
import { BRAND, anfrageMailto } from '../brand';
import { useLang } from '../lang';
import { Layout, Section, Btn, PageHero } from '../Layout';

const C = {
  de: {
    eyebrow: 'Für Locations',
    title: 'Ein Quiz-Abend, der deine Gäste bringt.',
    sub: 'Café, Bar oder Pub: ein wiederkehrender Abend, der Leute an einen sonst ruhigen Wochentag holt und zum Wiederkommen bringt.',
    valueTitle: 'Was es deiner Location bringt',
    v1T: 'Volles Haus am ruhigen Tag',
    v1B: 'Ein fester Quiz-Abend gibt Gästen einen Grund, ausgerechnet dann zu kommen, wenn sonst wenig los ist.',
    v2T: 'Gäste, die wiederkommen',
    v2B: 'Ein wiederkehrendes Format baut Stammpublikum auf. Teams kommen zurück, um es beim nächsten Mal besser zu machen.',
    v3T: 'Passt sich an den Abend an',
    v3B: 'Kleine Runde oder volles Haus, der Abend skaliert mit. Bis etwa 30 Gäste im Erober-Modus, größere Gruppen als Fraktionen bis etwa 100.',
    noteT: 'Konditionen arbeite ich mit dir aus',
    noteB: 'Für Locations lege ich das passende Format und die Konditionen noch fest. Wenn du eine Location hast und Interesse, schreib mir kurz, dann finden wir gemeinsam etwas, das für dich funktioniert.',
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
    noteT: 'We work out the terms together',
    noteB: 'For venues I am still setting the right format and terms. If you run a venue and are interested, drop me a line and we will find something that works for you.',
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
