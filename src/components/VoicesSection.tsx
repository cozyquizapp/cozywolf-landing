// Stimmen-Sektion (Social Proof): Zitate von echten Teilnehmern/Test-Teams.
//
// WICHTIG: Solange QUOTES leer ist, rendert die Sektion NICHTS. Es gibt keine
// Platzhalter- oder Fake-Zitate. Zum Freischalten einfach echte Zitate eintragen:
//
//   const QUOTES: Quote[] = [
//     {
//       text: 'Wir haben den ganzen Abend gelacht und wollen direkt nochmal.',
//       name: 'Lena',
//       context: 'Test-Team, Hamburg',
//       // textEn/contextEn optional: ohne Uebersetzung wird das Original gezeigt.
//       // photo optional: '/assets/voices/lena-team.webp' (Foto vorher fragen!).
//     },
//   ];
//
// Fotos von echten Abenden (Raum, Beamer, Leute am Handy) koennen spaeter pro
// Zitat via `photo` dazu, oder als eigene Galerie-Zeile. Erst Material sammeln.
import { BRAND } from '../brand';
import { useLang } from '../lang';
import { Section } from '../Layout';
import { Reveal } from './Reveal';

type Quote = {
  text: string;      // Original-Zitat (meist Deutsch)
  textEn?: string;   // optionale EN-Fassung
  name: string;      // Vorname reicht
  context: string;   // z.B. 'Test-Team, Hamburg' oder 'Firmenevent, 60 Personen'
  contextEn?: string;
  photo?: string;    // optionaler Bildpfad, z.B. '/assets/voices/xyz.webp'
};

// Hier echte Zitate eintragen. Leer = Sektion erscheint nicht.
const QUOTES: Quote[] = [];

export function VoicesSection() {
  const de = useLang() === 'de';
  if (QUOTES.length === 0) return null;
  return (
    <Section>
      <h2 style={{
        margin: '0 0 clamp(20px, 3vh, 32px)', textAlign: 'center',
        fontSize: 'clamp(26px, 3.4vw, 40px)', fontWeight: 900, color: '#F1F5F9', letterSpacing: '-0.01em',
      }}>{de ? 'Stimmen nach dem Quiz' : 'What players say'}</h2>
      <Reveal stagger style={{
        display: 'grid', gap: 16,
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
        maxWidth: 960, margin: '0 auto',
      }}>
        {QUOTES.map((q, i) => (
          <figure key={i} className="cw-card" style={{
            margin: 0, display: 'flex', flexDirection: 'column', gap: 14,
            padding: 'clamp(20px, 2.4vw, 28px)', borderRadius: 20,
            background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(${BRAND.pinkRgb},0.18)`,
          }}>
            {q.photo && (
              <img src={q.photo} alt="" loading="lazy" decoding="async" style={{
                width: '100%', borderRadius: 14, objectFit: 'cover', aspectRatio: '3 / 2',
              }} />
            )}
            <blockquote style={{
              margin: 0, flex: 1, fontSize: 16.5, color: BRAND.ink,
              fontWeight: 600, lineHeight: 1.55,
            }}>
              <span aria-hidden style={{ color: BRAND.pink, fontWeight: 900, marginRight: 4 }}>„</span>
              {de ? q.text : (q.textEn ?? q.text)}
              <span aria-hidden style={{ color: BRAND.pink, fontWeight: 900, marginLeft: 2 }}>&ldquo;</span>
            </blockquote>
            <figcaption style={{ fontSize: 14, fontWeight: 800 }}>
              <span style={{ color: BRAND.pink }}>{q.name}</span>
              <span style={{ color: BRAND.muted }}> · {de ? q.context : (q.contextEn ?? q.context)}</span>
            </figcaption>
          </figure>
        ))}
      </Reveal>
    </Section>
  );
}
