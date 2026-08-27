/**
 * Das Einrasten beim Scrollen, drei Fassungen.
 *
 * 2026-08-27, Wolf: "mein ziel waere es, dass jede sektion auf desktop 100%
 * groesse ohne vollbild optimiert ist im browser, dass man zu jeder stelle die
 * perfekten inhalte sieht (war bei allen referenz websites so, das einrasten
 * auf alle inhalte einer sektion)".
 *
 * GEMESSEN, bevor gebaut, auf der echten Seite bei 1440x780:
 *
 *   Hero          780 px   1,00 Bildschirme
 *   01            1252     1,61
 *   02            1376     1,76
 *   03             770     0,99
 *   04            1067     1,37
 *   05             473     0,61
 *   06             716     0,92
 *   07            1008     1,29
 *
 * Der Befund ist nicht "die Abschnitte sind zu lang", sondern "zwei Abschnitte
 * enthalten mehrere vollstaendige Inhalte": 01 traegt CozyQuiz UND CrowdQuiz,
 * 02 traegt drei Anlaesse. Als Ganzes koennen die nie auf einen Bildschirm,
 * ohne dass man sie staucht. Die Einheit zum Einrasten ist also die ZEILE und
 * nicht der Abschnitt. Aus sieben Abschnitten werden zehn Halte, und jeder
 * Halt zeigt genau einen vollstaendigen Inhalt.
 *
 * Was CSS dafuer hergibt, ohne eine Zeile JavaScript:
 *   scroll-snap-type: y proximity   auf dem Behaelter
 *   scroll-snap-align: start        auf jedem Halt
 *   scroll-snap-stop: normal        (nicht always, siehe Fassung 3)
 */
import { useState } from 'react';
import { sx } from '../onepage/sx';
import { CREME, HAAR, SPARTAN } from './stil';

export const SNAP_ENTWUERFE = {
  1: {
    name: 'Kein Einrasten',
    art: 'aus',
    idee: {
      de: 'Der heutige Stand zum Vergleich. Man kann ueberall stehenbleiben, auch mitten zwischen zwei Inhalten, und genau das passiert beim Scrollen mit dem Rad staendig.',
      en: 'Today’s state, for comparison. You can stop anywhere, including halfway between two pieces of content, and with a mouse wheel that is exactly what keeps happening.',
    },
  },
  2: {
    name: 'Sanft, Zeile fuer Zeile',
    art: 'proximity',
    idee: {
      de: 'scroll-snap-type: y proximity. Wer in der Naehe eines Halts aufhoert zu scrollen, wird dorthin gezogen; wer laenger durchzieht, wird nicht gebremst. Halt ist die Zeile, nicht der Abschnitt, also zehn statt sieben. Empfohlen: es fuehlt sich geordnet an, ohne dass die Seite einem das Scrollen aus der Hand nimmt.',
      en: 'scroll-snap-type: y proximity. Stop scrolling near a stop and you get pulled to it; keep going and nothing holds you back. The stop is the row, not the section, so ten instead of seven. Recommended: it feels ordered without the page taking scrolling out of your hands.',
    },
  },
  3: {
    name: 'Streng, ein Halt pro Wisch',
    art: 'mandatory',
    idee: {
      de: 'scroll-snap-type: y mandatory mit scroll-snap-stop: always. Jede Bewegung landet auf genau einem Halt, ueberspringen ist nicht moeglich. Am naechsten an einer Praesentation, aber es nimmt das Scrollen wirklich aus der Hand, und wer schnell zum Formular will, muss durch alle zehn. Auf Inhalten, die hoeher sind als das Fenster, ist mandatory ausserdem eine Falle: der Rest ist dann nicht erreichbar.',
      en: 'scroll-snap-type: y mandatory with scroll-snap-stop: always. Every gesture lands on exactly one stop, skipping is impossible. Closest to a presentation, but it really does take scrolling out of your hands, and anyone heading straight for the form has to pass all ten. On content taller than the window, mandatory is also a trap: the rest becomes unreachable.',
    },
  },
} as const;
export type SnapEntwurf = keyof typeof SNAP_ENTWUERFE;

const HALTE = [
  { nr: 'Hero', titel: 'Bauchgefühl ist nicht alles', hoehe: 1.00, inhalt: 'Wortwechsel, Objektgruppe, zwei Knöpfe' },
  { nr: '01 a', titel: 'CozyQuiz', hoehe: 0.80, inhalt: 'Text, Punkte, das Brett' },
  { nr: '01 b', titel: 'CrowdQuiz', hoehe: 0.81, inhalt: 'Text, Punkte, die Rangfolge' },
  { nr: '02 a', titel: 'Firmenfeier', hoehe: 0.59, inhalt: 'Text, Verweis, drei Objekte' },
  { nr: '02 b', titel: 'Geburtstag', hoehe: 0.59, inhalt: 'Text, Verweis, drei Objekte' },
  { nr: '02 c', titel: 'Kneipenabend', hoehe: 0.58, inhalt: 'Text, Verweis, drei Objekte' },
  { nr: '03', titel: 'So spielt ihr am Handy mit', hoehe: 0.99, inhalt: 'Text, fünf Fragetypen, das Handy' },
  { nr: '04', titel: 'Mehr als eine freie Wand', hoehe: 1.37, inhalt: 'Die Leinwand und die zwei Listen' },
  { nr: '05', titel: 'Über mich', hoehe: 0.61, inhalt: 'Foto, Zitat, vier Kacheln' },
  { nr: '06', titel: 'Häufige Fragen', hoehe: 0.92, inhalt: 'Sechs Fragen in zwei Spalten' },
  { nr: '07', titel: 'Termin anfragen', hoehe: 1.29, inhalt: 'Zwei Wege und das Formular' },
];

export function Einrasten({ mobil, entwurf }: { mobil: boolean; entwurf: SnapEntwurf }) {
  const f = SNAP_ENTWUERFE[entwurf];
  const [i, setI] = useState(0);
  const H = mobil ? 300 : 420;              // Hoehe des Fensters im Modell

  return (
    <section style={sx(`max-width:1240px;margin:0 auto;padding:${mobil ? '26px 20px 50px' : '40px 40px 80px'}`)}>
      <div style={sx(`display:grid;gap:${mobil ? '26px' : '44px'};grid-template-columns:${mobil ? '1fr' : 'minmax(0,1fr) 320px'};align-items:start`)}>
        {/* Ein Fenster im Kleinen. Der Behaelter scrollt selbst, damit sich das
            Einrasten hier ausprobieren laesst, ohne die Mockup-Seite zu kapern. */}
        <div style={sx(`position:relative;height:${H}px;overflow-y:auto;border:1px solid ${HAAR};border-radius:18px;background:#0d0a17;`
          + (f.art === 'aus' ? '' : `scroll-snap-type:y ${f.art};`)
          + 'scroll-behavior:smooth')}
          onScroll={e => {
            const el = e.currentTarget;
            setI(Math.round(el.scrollTop / H));
          }}>
          {HALTE.map((h, j) => (
            <div key={h.nr} style={sx(`height:${Math.round(H * Math.min(h.hoehe, 1))}px;box-sizing:border-box;padding:${mobil ? '18px' : '26px 30px'};`
              + `display:flex;flex-direction:column;justify-content:center;gap:8px;border-bottom:1px solid ${HAAR};`
              + (f.art === 'aus' ? '' : `scroll-snap-align:start;scroll-snap-stop:${f.art === 'mandatory' ? 'always' : 'normal'};`)
              + `background:${j % 2 ? 'rgba(246,239,230,.018)' : 'transparent'}`)}>
              <div style={sx('font-size:11px;font-weight:900;letter-spacing:.18em;text-transform:uppercase;color:rgba(246,239,230,.45)')}>{h.nr}</div>
              <div style={sx(`font-family:${SPARTAN};font-size:${mobil ? '22px' : '30px'};font-weight:900;line-height:1;letter-spacing:-.02em;color:${CREME}`)}>{h.titel}</div>
              <div style={sx('font-size:14px;font-weight:600;color:rgba(246,239,230,.6)')}>{h.inhalt}</div>
            </div>
          ))}
        </div>

        <div>
          <div style={sx(`margin-bottom:16px;font-size:19px;font-weight:900;color:${CREME}`)}>{f.name}</div>
          <div style={sx('font-size:14px;line-height:1.6;font-weight:500;color:rgba(246,239,230,.7);margin-bottom:20px')}>
            Halt {Math.min(i + 1, HALTE.length)} von {HALTE.length}: {HALTE[Math.min(i, HALTE.length - 1)].titel}
          </div>
          {/* Die gemessenen Hoehen, damit sichtbar ist, welcher Halt noch Luft
              braucht und welcher zu voll ist. */}
          {HALTE.map((h, j) => (
            <div key={h.nr} style={sx(`display:flex;align-items:center;gap:10px;padding:7px 0;border-top:1px solid ${HAAR};`
              + `opacity:${j === Math.min(i, HALTE.length - 1) ? 1 : .55}`)}>
              <span style={sx('flex:none;width:38px;font-size:11px;font-weight:900;letter-spacing:.1em;color:rgba(246,239,230,.5)')}>{h.nr}</span>
              <span style={sx('flex:1;height:8px;border-radius:4px;background:rgba(246,239,230,.07);overflow:hidden;display:block')}>
                <span style={sx(`display:block;height:100%;width:${Math.min(100, h.hoehe * 100)}%;`
                  + `background:${h.hoehe > 1.05 ? '#EF4444' : h.hoehe < 0.7 ? '#FACC15' : '#22C55E'}`)}></span>
              </span>
              <span style={sx('flex:none;width:44px;text-align:right;font-size:12px;font-weight:800;color:rgba(246,239,230,.6);font-variant-numeric:tabular-nums')}>{h.hoehe.toFixed(2)}</span>
            </div>
          ))}
          <div style={sx(`margin-top:14px;font-size:13px;line-height:1.55;font-weight:500;color:rgba(246,239,230,.55);border-top:1px solid ${HAAR};padding-top:12px`)}>
            Gruen heisst: passt auf einen Bildschirm. Gelb heisst: viel Luft, der Halt wirkt leer. Rot heisst: passt nicht, hier muss gekuerzt werden. Gemessen bei 1440 mal 780.
          </div>
        </div>
      </div>
    </section>
  );
}
