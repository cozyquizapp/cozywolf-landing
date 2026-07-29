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
  return (
    <div style={{
      maxWidth: 560, margin: '0 auto',
      display: 'inline-flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'center',
      padding: '9px 16px', borderRadius: 999,
      background: `rgba(${BRAND.pinkRgb},0.08)`,
      border: `1px solid rgba(${BRAND.pinkRgb},0.28)`,
    }}>
      <span aria-hidden style={{ fontSize: 15 }}>📅</span>
      <span style={{ fontSize: 14.5, fontWeight: 700, color: BRAND.inkSoft, lineHeight: 1.4 }}>{text}</span>
    </div>
  );
}
