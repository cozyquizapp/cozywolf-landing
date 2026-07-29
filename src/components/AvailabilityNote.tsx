// Verfuegbarkeits-Hinweis: naechste freie Termine. Ehrlich + leichte Dringlichkeit,
// senkt die Reibung an der Buchung (Erwartung setzen, Wunschtermin sichern).
// Ganzjaehrig sichtbar (anders als der saisonale SeasonalHint). Text an EINER
// Stelle -> beim Aendern (z.B. wenn Mitte September vorbei ist) nur hier anfassen.
// Ich-Form, keine Gedankenstriche.
import { BRAND } from '../brand';
import { useLang } from '../lang';

// Zentrale Verfuegbarkeits-Angabe. Zum Aktualisieren NUR diese zwei Zeilen aendern.
const AVAIL_DE = 'ab Mitte September';
const AVAIL_EN = 'from mid-September';

export function AvailabilityNote() {
  const de = useLang() === 'de';
  const text = de
    ? <>Nächste freie Termine <strong style={{ color: BRAND.ink, fontWeight: 900 }}>{AVAIL_DE}</strong>. Sichere dir jetzt deinen Wunschtermin.</>
    : <>Next available dates <strong style={{ color: BRAND.ink, fontWeight: 900 }}>{AVAIL_EN}</strong>. Secure your preferred slot now.</>;
  // Emoji INLINE im Text (nicht als eigenes Flex-Kind) → bricht nicht in eine
  // eigene Zeile ab; der ganze Block ist zentriert, egal ob 1 oder 2 Zeilen.
  return (
    <div style={{
      maxWidth: 520, margin: '0 auto',
      padding: '11px 22px', borderRadius: 16, textAlign: 'center',
      background: `rgba(${BRAND.pinkRgb},0.08)`,
      border: `1px solid rgba(${BRAND.pinkRgb},0.28)`,
    }}>
      <span style={{ fontSize: 14.5, fontWeight: 700, color: BRAND.inkSoft, lineHeight: 1.5 }}>
        <span aria-hidden style={{ marginRight: 8 }}>📅</span>{text}
      </span>
    </div>
  );
}
