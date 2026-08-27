/**
 * Geteilte Bausteine der Mockup-Seite.
 *
 * Herausgezogen, als die zweite Datei mit Entwuerfen dazukam: die Tokens und
 * der Kicker wuerden sonst in beiden Dateien stehen, und dann laufen sie
 * auseinander. Die Mockup-Seite ist Werkzeug und faellt wieder raus, aber
 * solange sie existiert, soll sie dieselbe Handschrift zeigen wie die Seite.
 */
import { sx } from '../onepage/sx';

export const CREME = '#F6EFE6';
export const GRUND = '#0A0814';
export const SPARTAN = "'League Spartan',sans-serif";
export const HAAR = 'rgba(246,239,230,.14)';
export const EASE = 'cubic-bezier(.22,1,.36,1)';
export const PINK = '#FA4BA3';

/** Der Kicker aus dem Hero, unveraendert. Er ist Teil des Grundrahmens. */
export function Kicker({ nummer, label }: { nummer: string; label: string }) {
  return (
    <div style={sx('display:flex;align-items:center;gap:12px;margin:0 0 18px;font-size:11.5px;font-weight:900;letter-spacing:.2em;text-transform:uppercase;color:rgba(246,239,230,.62);white-space:nowrap')}>
      {nummer}
      <span style={sx('flex:1;height:1px;background:linear-gradient(90deg,rgba(250,75,163,.35),transparent);max-width:180px')}></span>
      <span style={sx('color:rgba(246,239,230,.5)')}>{label}</span>
    </div>
  );
}

/** Die grosse Abschnitts-Ueberschrift der Fassung „Leinwand". */
export function H2({ text, mobil, klein }: { text: string; mobil: boolean; klein?: boolean }) {
  return (
    <h2 style={sx(`margin:0 0 16px;font-family:${SPARTAN};`
      + `font-size:${mobil ? (klein ? '36px' : '42px') : klein ? 'clamp(38px,4.2vw,64px)' : 'clamp(44px,5.4vw,88px)'};`
      + `font-weight:900;line-height:.9;letter-spacing:-.033em;color:${CREME};text-wrap:balance`)}>
      {text}
    </h2>
  );
}

/** Eine Zeile der Fassung „Leinwand": Haarlinie oben, drei Spalten. */
export function Zeile({ spalten, letzte, mobil, children }: {
  spalten: string; letzte?: boolean; mobil: boolean; children: React.ReactNode;
}) {
  return (
    <div style={sx(`display:grid;gap:${mobil ? '22px' : '48px'};align-items:start;`
      + `grid-template-columns:${mobil ? '1fr' : spalten};`
      + `padding:${mobil ? '28px 0' : '46px 0'};border-top:1px solid ${HAAR}`
      + `${letzte ? `;border-bottom:1px solid ${HAAR}` : ''}`)}>
      {children}
    </div>
  );
}
