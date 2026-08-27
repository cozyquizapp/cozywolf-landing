/**
 * Drei Zeigereffekte, als System statt als Einzelfall.
 *
 * 2026-08-27, Wolf: "jede sektion soll einen cleanen modernen hover effekt
 * haben, viele haben schon einen, einige noch nicht".
 *
 * Nachgesehen, welche Abschnitte heute auf den Zeiger reagieren:
 *   Hero     Kachel und Wort wechseln beim Zeigen
 *   01       Felder setzen sich, Fraktionszeile bekommt Rahmen und Spruch
 *   02       die drei Objekte faechern auf, die Zeile selbst tut nichts
 *   03       Fragetypen wechseln, das Handy kippt dem Zeiger nach
 *   04       Leinwand springt an, der Lichtkegel folgt dem Zeiger
 *   05       nichts, seit die auffaechernden Arme raus sind
 *   06       nichts
 *   07       nur die Knoepfe
 *
 * Statt fuer 05, 06 und 07 je einen eigenen Einfall zu bauen, stehen hier drei
 * VERFAHREN, die auf jede Liste der Seite passen. Ein Verfahren, ueberall
 * dasselbe, ist der Unterschied zwischen einer Seite und einer Sammlung von
 * Abschnitten.
 */
import { useRef, useState } from 'react';
import { sx } from '../onepage/sx';
import { CREME, HAAR, SPARTAN } from './stil';

export const HOVER_ENTWUERFE = {
  1: {
    name: 'Aufhellen',
    idee: {
      de: 'Worauf man zeigt, steht in vollem Creme; alles daneben faellt auf 45 Prozent. Nichts bewegt sich, nichts springt, die Hoehe bleibt. Das ruhigste der drei und das einzige, das auch bei sechs Fragen nebeneinander nicht unruhig wird. Es passt zu der Entscheidung, Betonung ueber Helligkeit statt ueber Farbe zu tragen.',
      en: 'What you point at stands in full cream; everything beside it drops to 45 percent. Nothing moves, nothing jumps, the height stays. The calmest of the three and the only one that stays quiet with six questions side by side. It matches the decision to carry emphasis through brightness rather than colour.',
    },
  },
  2: {
    name: 'Anruecken',
    idee: {
      de: 'Die Zeile unter dem Zeiger rueckt 10 px nach rechts, ihr Strich waechst von 14 auf 34 px. Farbe bleibt unberuehrt, es bewegt sich nur Lage und Laenge. Dasselbe Verfahren, das die Fragetypen in 03 schon benutzen, also nichts Neues, nur ueberall.',
      en: 'The row under the cursor moves 10px right and its dash grows from 14 to 34px. Colour is untouched; only position and length move. The same device the question types in 03 already use, so nothing new, just everywhere.',
    },
  },
  3: {
    name: 'Licht folgt',
    idee: {
      de: 'Hinter dem Block liegt ein weicher Schein, der dem Zeiger folgt, wie der Lichtkegel auf der Leinwand in 04. Nichts an den Zeilen selbst aendert sich. Am modernsten und am naechsten an dem, was die Seite in 04 ohnehin tut, aber es sagt nichts darueber, WORAUF man zeigt, also nur zusammen mit einem der beiden anderen sinnvoll.',
      en: 'A soft glow sits behind the block and follows the cursor, like the light cone on the screen in 04. Nothing about the rows themselves changes. The most modern and the closest to what the page already does in 04, but it says nothing about WHAT you are pointing at, so it only makes sense together with one of the other two.',
    },
  },
} as const;
export type HoverEntwurf = keyof typeof HOVER_ENTWUERFE;

const EASE = 'cubic-bezier(.22,1,.36,1)';

const FRAGEN = [
  { q: 'Brauche ich eigene Technik?', a: 'Nein. Beamer und Sound bringe ich mit. Ihr braucht eine freie Wand, Strom und WLAN.' },
  { q: 'Wie viele Leute gehen?', a: 'Von sechs bis 160. Bis 40 spielt ihr CozyQuiz, darueber CozyArena.' },
  { q: 'Was kostet ein Abend?', a: 'Ab 350 Euro, je nach Gruppe, Anfahrt und Laenge des Abends.' },
  { q: 'Wie lange dauert das?', a: 'Etwa zweieinhalb Stunden, Aufbau kommt eine Stunde vorher dazu.' },
];

const WEGE = [
  { titel: 'Testteam', preis: 'kostenlos', text: 'Ein ganzer Abend, umsonst. Ihr spielt, ich lerne.' },
  { titel: 'Euer Abend', preis: 'ab 350 €', text: 'Termin, Ort und Gruppe stehen, ich bringe den Rest mit.' },
];

export function HoverMuster({ mobil, entwurf }: { mobil: boolean; entwurf: HoverEntwurf }) {
  const [hov, setHov] = useState<string | null>(null);
  const [xy, setXy] = useState<{ x: number; y: number } | null>(null);
  const box = useRef<HTMLDivElement | null>(null);

  const hell = entwurf === 1, ruecken = entwurf === 2, licht = entwurf === 3;
  const stil = (k: string) => {
    const an = hov === k;
    return (hell ? `opacity:${hov && !an ? .45 : 1};` : '')
      + (ruecken ? `transform:translateX(${an ? 10 : 0}px);` : '')
      + `transition:opacity .3s ${EASE},transform .3s ${EASE}`;
  };
  const strich = (k: string) => `flex:none;height:2px;border-radius:2px;background:${CREME};`
    + `width:${ruecken && hov === k ? 34 : 14}px;opacity:${hov === k ? .9 : .4};`
    + `transition:width .3s ${EASE},opacity .3s ${EASE}`;

  return (
    <section style={sx(`max-width:1180px;margin:0 auto;padding:${mobil ? '26px 20px 60px' : '46px 32px 90px'}`)}
      ref={box}
      onMouseMove={e => {
        if (!licht || !box.current) return;
        const r = box.current.getBoundingClientRect();
        setXy({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
      }}
      onMouseLeave={() => { setHov(null); setXy(null); }}>
      <div style={sx('position:relative')}>
        {/* Der Schein liegt HINTER allem, deshalb eigener Kasten mit z-Index 0
            und pointer-events:none. Sonst faengt er das Zeigen selbst ab. */}
        {licht && (
          <div aria-hidden="true" style={sx('position:absolute;inset:-60px;z-index:0;pointer-events:none;border-radius:28px;'
            + `background:radial-gradient(ellipse 30% 34% at ${(xy?.x ?? 50).toFixed(1)}% ${(xy?.y ?? 50).toFixed(1)}%,rgba(246,239,230,.09),transparent 70%);`
            + `opacity:${xy ? 1 : 0};transition:background .12s linear,opacity .5s ${EASE}`)}></div>
        )}

        <div style={sx('position:relative;z-index:1')}>
          <div style={sx('margin-bottom:14px;font-size:11.5px;font-weight:900;letter-spacing:.2em;text-transform:uppercase;color:rgba(246,239,230,.5)')}>06 · Häufige Fragen</div>
          <div style={sx(`display:grid;gap:${mobil ? '22px' : '28px 52px'};grid-template-columns:${mobil ? '1fr' : '1fr 1fr'};margin-bottom:56px`)}>
            {FRAGEN.map(f => (
              <div key={f.q} onMouseEnter={() => setHov(f.q)}
                style={sx(`padding-top:20px;border-top:1px solid ${HAAR};${stil(f.q)}`)}>
                <div style={sx('display:flex;align-items:center;gap:12px;margin-bottom:8px')}>
                  {ruecken && <span style={sx(strich(f.q))}></span>}
                  <span style={sx(`font-size:18px;font-weight:900;line-height:1.3;color:${CREME}`)}>{f.q}</span>
                </div>
                <div style={sx('font-size:15.5px;line-height:1.62;font-weight:500;color:rgba(246,239,230,.76)')}>{f.a}</div>
              </div>
            ))}
          </div>

          <div style={sx('margin-bottom:14px;font-size:11.5px;font-weight:900;letter-spacing:.2em;text-transform:uppercase;color:rgba(246,239,230,.5)')}>07 · Zwei Wege</div>
          <div style={sx(`display:grid;gap:${mobil ? '18px' : '28px'};grid-template-columns:${mobil ? '1fr' : '1fr 1fr'};margin-bottom:56px`)}>
            {WEGE.map(w => (
              <div key={w.titel} onMouseEnter={() => setHov(w.titel)}
                style={sx(`padding:22px 0 0;border-top:1px solid ${HAAR};${stil(w.titel)}`)}>
                <div style={sx('display:flex;align-items:baseline;gap:12px;margin-bottom:8px')}>
                  {ruecken && <span style={sx(strich(w.titel) + ';align-self:center')}></span>}
                  <span style={sx(`font-family:${SPARTAN};font-size:${mobil ? '26px' : '34px'};font-weight:900;line-height:1;letter-spacing:-.025em;color:${CREME}`)}>{w.titel}</span>
                  <span style={sx('font-size:14px;font-weight:800;color:rgba(246,239,230,.6)')}>{w.preis}</span>
                </div>
                <div style={sx('font-size:15.5px;line-height:1.6;font-weight:500;color:rgba(246,239,230,.76);max-width:44ch')}>{w.text}</div>
              </div>
            ))}
          </div>

          <div style={sx('margin-bottom:14px;font-size:11.5px;font-weight:900;letter-spacing:.2em;text-transform:uppercase;color:rgba(246,239,230,.5)')}>05 · Die vier Kacheln</div>
          <div style={sx('display:flex;flex-wrap:wrap;gap:10px')}>
            {['Persönliche Moderation vor Ort', 'Sechs bis 160 Personen', 'Auf eure Gruppe abgestimmt', 'Hamburg und Umland'].map(c => (
              <span key={c} onMouseEnter={() => setHov(c)}
                style={sx('padding:9px 16px;border-radius:999px;background:rgba(246,239,230,.05);'
                  + `border:1px solid ${hov === c ? 'rgba(246,239,230,.5)' : 'rgba(246,239,230,.20)'};`
                  + `font-size:14px;font-weight:700;color:${CREME};white-space:nowrap;${stil(c)},border-color .3s ${EASE}`)}>{c}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
