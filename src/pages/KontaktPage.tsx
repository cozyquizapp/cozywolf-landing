// Kontakt / Anfrage: vorausgefüllter Mailto + sichtbare, kopierbare Mail.
// Erste Fassung (Stufe 1/6). Ich-Form.
import { BRAND, EMAIL, INSTA_URL, INSTA_HANDLE } from '../brand';
import { useLang } from '../lang';
import { Layout, Section, PageHero } from '../Layout';
import { PriceNote } from '../components/PriceNote';
import { ContactForm } from '../components/ContactForm';

const C = {
  de: {
    eyebrow: 'Kontakt',
    title: 'Lass uns über dein Event reden.',
    sub: 'Schreib mir kurz zum Anlass, zur ungefähren Personenzahl und zum Wunsch-Zeitraum. Ich melde mich mit einem Vorschlag.',
    write: 'Anfrage schreiben',
    or: 'oder direkt an',
    insta: 'Auf Instagram',
    ttTag: '🐺 Test-Team gesucht',
    ttTitle: 'Lieber gratis spielen und mithelfen?',
    ttBody: 'Ich suche gerade ein paar Test-Teams in Hamburg. Ihr bekommt einen kompletten Quizabend aufs Haus — dafür sagt ihr mir ehrlich, was hakt.',
    ttCta: 'Test-Team werden',
  },
  en: {
    eyebrow: 'Contact',
    title: 'Let us talk about your event.',
    sub: 'Send me a short note about the occasion, rough number of people and preferred timeframe. I will come back with a suggestion.',
    write: 'Write a request',
    or: 'or directly to',
    insta: 'On Instagram',
    ttTag: '🐺 Test teams wanted',
    ttTitle: 'Rather play for free and help out?',
    ttBody: 'I am looking for a few test teams in Hamburg right now. You get a full quiz night on the house — in return you tell me honestly what still needs work.',
    ttCta: 'Become a test team',
  },
};

export default function KontaktPage() {
  const lang = useLang();
  const c = C[lang];
  return (
    <Layout>
      <PageHero eyebrow={c.eyebrow} title={c.title} sub={c.sub} />
      <Section style={{ paddingTop: 0 }}>
        <ContactForm />
        <div style={{
          maxWidth: 560, margin: '22px auto 0', textAlign: 'center',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
        }}>
          <div style={{ fontSize: 15, color: BRAND.muted, fontWeight: 600 }}>
            {c.or} <a href={`mailto:${EMAIL}`} style={{ color: BRAND.pink, fontWeight: 800, textDecoration: 'none' }}>{EMAIL}</a>
          </div>
          <a href={INSTA_URL} target="_blank" rel="noopener noreferrer" style={{
            fontSize: 15, color: BRAND.pinkSoft, fontWeight: 700, textDecoration: 'none',
          }}>📸 {c.insta} · {INSTA_HANDLE}</a>
          <PriceNote />
        </div>

        {/* Test-Team-Teaser — die /testen-Kampagne ist bewusst nicht in der Nav,
            aber wer auf Kontakt landet, soll das Gratis-Angebot sehen. */}
        <a href="/testen" style={{
          display: 'block', textDecoration: 'none',
          maxWidth: 560, margin: '32px auto 0',
          padding: 'clamp(20px, 3vw, 30px)', borderRadius: 22, textAlign: 'center',
          background: `radial-gradient(ellipse 90% 100% at 50% 0%, rgba(${BRAND.pinkRgb},0.15), rgba(255,255,255,0.03) 72%)`,
          border: `1.5px solid rgba(${BRAND.pinkRgb},0.32)`,
          boxShadow: `0 14px 40px rgba(0,0,0,0.32), 0 0 34px rgba(${BRAND.pinkRgb},0.10)`,
        }}>
          <span style={{
            display: 'inline-block', fontSize: 12, fontWeight: 900, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: BRAND.pink, marginBottom: 10,
          }}>{c.ttTag}</span>
          <div style={{ fontSize: 'clamp(20px, 3.4vw, 26px)', fontWeight: 900, color: '#F1F5F9', lineHeight: 1.15, textWrap: 'balance' }}>
            {c.ttTitle}
          </div>
          <p style={{ margin: '10px auto 16px', maxWidth: 440, color: BRAND.inkSoft, fontSize: 15, fontWeight: 500, lineHeight: 1.55 }}>
            {c.ttBody}
          </p>
          <span className="cw-btn" style={{
            display: 'inline-block', padding: '12px 26px', borderRadius: 999,
            background: `linear-gradient(135deg, ${BRAND.pink}, ${BRAND.magenta})`,
            color: '#fff', fontWeight: 900, fontSize: 15,
          }}>{c.ttCta} →</span>
        </a>
      </Section>
    </Layout>
  );
}
