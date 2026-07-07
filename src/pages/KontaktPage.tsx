// Kontakt / Anfrage: vorausgefüllter Mailto + sichtbare, kopierbare Mail.
// Erste Fassung (Stufe 1/6). Ich-Form.
import { BRAND, EMAIL, INSTA_URL, INSTA_HANDLE, anfrageMailto } from '../brand';
import { useLang } from '../lang';
import { Layout, Section, Btn, PageHero } from '../Layout';

const C = {
  de: {
    eyebrow: 'Kontakt',
    title: 'Lass uns über deinen Abend reden.',
    sub: 'Schreib mir kurz zum Anlass, zur ungefähren Personenzahl und zum Wunsch-Zeitraum. Ich melde mich mit einem Vorschlag.',
    write: 'Anfrage schreiben',
    or: 'oder direkt an',
    insta: 'Auf Instagram',
  },
  en: {
    eyebrow: 'Contact',
    title: 'Let us talk about your evening.',
    sub: 'Send me a short note about the occasion, rough number of people and preferred timeframe. I will come back with a suggestion.',
    write: 'Write a request',
    or: 'or directly to',
    insta: 'On Instagram',
  },
};

export default function KontaktPage() {
  const lang = useLang();
  const c = C[lang];
  return (
    <Layout>
      <PageHero eyebrow={c.eyebrow} title={c.title} sub={c.sub} />
      <Section style={{ paddingTop: 0 }}>
        <div style={{
          maxWidth: 560, margin: '0 auto', textAlign: 'center',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
        }}>
          <Btn href={anfrageMailto(lang)}>{c.write}</Btn>
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
