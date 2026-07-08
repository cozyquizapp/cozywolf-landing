// Einheitliche Preiszeile fuer alle Anfrage-Seiten (Single Source, damit die
// Formulierung ueberall identisch ist). Preis noch nicht fix -> keine Zahl,
// aber transparent, wie kalkuliert wird. Ich-Form, keine Gedankenstriche.
import { BRAND } from '../brand';
import { useLang } from '../lang';

// address: 'du' = Bucher direkt (Home/Feiern/Kontakt/Ueber), 'ihr' = Team-Ton
// (Firmen, wo die ganze Seite 'eure' spricht). Wolf-Entscheidung 'pro Seite passend'.
export function PriceNote({ address = 'du' }: { address?: 'du' | 'ihr' }) {
  const de = useLang() === 'de';
  const text = de
    ? address === 'ihr'
      ? 'Preis auf Anfrage. Ich richte das Quiz auf eure Gruppengröße und euren Anlass aus, ohne versteckte Posten.'
      : 'Preis auf Anfrage. Ich richte das Quiz auf deine Gruppengröße und deinen Anlass aus, ohne versteckte Posten.'
    : 'Price on request. I tailor the quiz to your group size and occasion, with no hidden extras.';
  const reassure = de
    ? 'Unverbindlich anfragen, kostenlos und ohne Verpflichtung.'
    : 'Ask with no obligation, free and without commitment.';
  return (
    <div style={{ margin: '0 auto 22px', maxWidth: 560, textAlign: 'center' }}>
      <p style={{ margin: 0, fontSize: 16, color: BRAND.inkSoft, fontWeight: 500, lineHeight: 1.6 }}>{text}</p>
      <p style={{ margin: '6px 0 0', fontSize: 14, color: BRAND.pinkSoft, fontWeight: 700 }}>{reassure}</p>
    </div>
  );
}
