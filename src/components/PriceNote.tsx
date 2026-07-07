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
      ? 'Preis auf Anfrage. Ich richte den Abend auf eure Gruppengröße und euren Anlass aus, ohne versteckte Posten.'
      : 'Preis auf Anfrage. Ich richte den Abend auf deine Gruppengröße und deinen Anlass aus, ohne versteckte Posten.'
    : 'Price on request. I tailor the evening to your group size and occasion, with no hidden extras.';
  return (
    <p style={{
      margin: '0 auto 22px', maxWidth: 560, fontSize: 16,
      color: BRAND.inkSoft, fontWeight: 500, lineHeight: 1.6, textAlign: 'center',
    }}>{text}</p>
  );
}
