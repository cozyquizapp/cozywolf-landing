// Kategorien-Leiste: die 5 Fragetypen mit den echten App-Icons (public/assets).
// Zeigt die Abwechslung ("keine Runde fühlt sich gleich an"). SSR-sicher.
import { BRAND } from '../brand';
import { useLang } from '../lang';
import { Section } from '../Layout';
import { Reveal } from './Reveal';

type Cat = { img: string; de: string; en: string; deB: string; enB: string };

const CATS: Cat[] = [
  { img: '/assets/cat-mucho.webp',      de: 'Mu-Cho',     en: 'Mu-Cho',     deB: 'Wähle die richtige Antwort.',        enB: 'Pick the right answer.' },
  { img: '/assets/cat-schaetzchen.webp',de: 'Schätzchen', en: 'Close Call', deB: 'Wer schätzt am nächsten dran?',      enB: 'Who guesses closest?' },
  { img: '/assets/cat-cheese.webp',     de: 'Schau-mal',  en: 'Look-See',   deB: 'Was ist auf dem Bild?',              enB: 'What is in the picture?' },
  { img: '/assets/cat-10v10.webp',      de: '10 von 10',  en: '10 of 10',   deB: 'Verteilt eure Punkte klug.',         enB: 'Distribute your points wisely.' },
  { img: '/assets/cat-buntetuete.webp', de: 'Bunte Tüte', en: 'Mixed Bag',  deB: 'Immer eine Überraschung.',           enB: 'Always a surprise.' },
];

export function CategoryStrip() {
  const de = useLang() === 'de';
  return (
    <Section>
      <h2 style={secTitle}>{de ? 'Fünf Fragetypen' : 'Five question types'}</h2>
      <p style={{ margin: '0 auto clamp(22px, 3vh, 34px)', maxWidth: 620, textAlign: 'center', fontSize: 17, color: BRAND.inkSoft, fontWeight: 500, lineHeight: 1.6 }}>
        {de ? 'Quer durch die Themen und Spielarten. Keine Runde fühlt sich gleich an, und jeder findet seine Kategorie.'
            : 'Across all topics and styles. No round feels the same, and everyone finds their category.'}
      </p>
      <Reveal stagger style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))' }}>
        {CATS.map(c => (
          <div key={c.de} className="cw-card" style={{
            padding: 'clamp(16px, 2vw, 22px)', borderRadius: 18,
            background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(${BRAND.pinkRgb},0.16)`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center',
          }}>
            <img className="cw-card__icon" src={c.img} alt="" aria-hidden loading="lazy" decoding="async" width={72} height={72}
              style={{ objectFit: 'contain', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.4))' }} />
            <div style={{ fontSize: 17, fontWeight: 900, color: BRAND.pink }}>{de ? c.de : c.en}</div>
            <div style={{ fontSize: 14, color: BRAND.inkSoft, fontWeight: 500, lineHeight: 1.5 }}>{de ? c.deB : c.enB}</div>
          </div>
        ))}
      </Reveal>
    </Section>
  );
}

const secTitle: React.CSSProperties = {
  margin: '0 0 clamp(14px, 2vh, 20px)', textAlign: 'center',
  fontSize: 'clamp(26px, 3.4vw, 40px)', fontWeight: 900, color: '#F1F5F9', letterSpacing: '-0.01em',
};
