// Für Locations (Café/Bar/Pub, wiederkehrende Events). Bewusster Stub: das
// Geschäftsmodell (Erlös) steht noch nicht fest. Trotzdem KEIN Dead-End, es
// gibt einen ehrlichen Hinweis + Kontakt. Erste Fassung (Stufe 1/6).
import { BRAND, anfrageMailto } from '../brand';
import { useLang } from '../lang';
import { Layout, Section, Btn, PageHero } from '../Layout';

const C = {
  de: {
    eyebrow: 'Für Locations',
    title: 'Ein Quiz-Abend, der deine Gäste bringt.',
    sub: 'Café, Bar oder Pub: ein wiederkehrender Abend, der Leute an einen sonst ruhigen Wochentag holt und zum Wiederkommen bringt.',
    noteT: 'Diese Seite baue ich gerade aus',
    noteB: 'Für Locations arbeite ich das passende Format und die Konditionen noch aus. Wenn du eine Location hast und Interesse, schreib mir kurz, dann finden wir gemeinsam etwas, das für dich funktioniert.',
    cta: 'Interesse? Schreib mir',
  },
  en: {
    eyebrow: 'For venues',
    title: 'A quiz night that brings your guests in.',
    sub: 'Café, bar or pub: a recurring evening that fills an otherwise quiet weekday and gets people to come back.',
    noteT: 'I am still building this out',
    noteB: 'For venues I am still working out the right format and terms. If you run a venue and are interested, drop me a line and we will find something that works for you.',
    cta: 'Interested? Write me',
  },
};

export default function LocationsPage() {
  const lang = useLang();
  const c = C[lang];
  return (
    <Layout>
      <PageHero eyebrow={c.eyebrow} title={c.title} sub={c.sub} />
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
