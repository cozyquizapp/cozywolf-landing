// 404-Seite: unbekannte Pfade zeigten vorher still die Startseite (Soft-404).
// Jetzt: klare Meldung im Brand-Look + Wege zurueck. Wird als dist/404.html
// prerendert, die Vercel bei nicht gefundenen Pfaden mit Status 404 ausliefert.
import { BRAND, FONT_DISPLAY } from '../brand';
import { useLang } from '../lang';
import { Layout, Section, Btn } from '../Layout';

const C = {
  de: {
    eyebrow: '404',
    title: 'Diese Seite gibt es nicht.',
    sub: 'Der Link führt ins Leere. Kein Drama, von hier kommst du überall hin.',
    home: 'Zur Startseite',
    contact: 'Quiz anfragen',
  },
  en: {
    eyebrow: '404',
    title: 'This page does not exist.',
    sub: 'That link leads nowhere. No drama, you can get anywhere from here.',
    home: 'Back to the start',
    contact: 'Request a quiz',
  },
};

export default function NotFoundPage() {
  const c = C[useLang()];
  return (
    <Layout>
      <Section style={{ textAlign: 'center', paddingTop: 'clamp(56px, 12vh, 120px)', paddingBottom: 'clamp(56px, 12vh, 120px)' }}>
        <img src="/logo.webp" alt="" width={110} height={110}
          style={{ objectFit: 'contain', opacity: 0.9, filter: `drop-shadow(0 8px 24px rgba(${BRAND.pinkRgb},0.4))`, marginBottom: 18 }} />
        <div style={{
          fontFamily: FONT_DISPLAY, fontWeight: 800, color: BRAND.pink,
          fontSize: 15, letterSpacing: '0.16em', marginBottom: 12,
        }}>{c.eyebrow}</div>
        <h1 style={{
          margin: 0, fontFamily: FONT_DISPLAY, fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800,
          color: '#F6EFE6', letterSpacing: '-0.015em', textWrap: 'balance',
        }}>{c.title}</h1>
        <p style={{
          margin: '16px auto 26px', maxWidth: 480, fontSize: 17,
          color: BRAND.inkSoft, fontWeight: 600, lineHeight: 1.55,
        }}>{c.sub}</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Btn href="/">{c.home}</Btn>
          <Btn href="/kontakt" variant="secondary">{c.contact}</Btn>
        </div>
      </Section>
    </Layout>
  );
}
