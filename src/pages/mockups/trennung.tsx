/**
 * Wie ein Abschnitt vom naechsten abgesetzt wird, vier Fassungen.
 *
 * 2026-08-27, Wolf: "viele der referenzwebsites trennen die sectionen klarer,
 * es dreht sich raus oder es verschiebt sich, sodass die seite nie wie eine
 * lange seite wirkt ... dabei koennte zb das handy reingedreht werden wie die
 * dose bei mana mate".
 *
 * Alle vier haengen an derselben Quelle: wie weit der Halt im Fenster steht,
 * gemessen von -1 (kommt von unten) ueber 0 (steht mittig) bis +1 (geht nach
 * oben raus). Auf der echten Seite kaeme dieser Wert aus einer
 * scroll-driven animation (animation-timeline: view()), die ohne JavaScript
 * laeuft; hier im Modell rechnet ihn ein Scroll-Aufruf, damit sich das
 * Verhalten im kleinen Fenster ueberhaupt zeigen laesst.
 *
 * Was NICHT zur Wahl steht: die halbrunden Kanten von frueher. Wolf hat sie
 * abgelehnt ("die halbkreise in den sections sind so semi"), und sie loesen
 * das Problem auch nicht: sie trennen die Flaechen, nicht die Inhalte.
 */
import { useEffect, useRef, useState } from 'react';
import { sx } from '../onepage/sx';
import { CREME, HAAR, SPARTAN } from './stil';

export const TRENN_ENTWUERFE = {
  1: {
    name: 'Nichts',
    idee: {
      de: 'Der heutige Stand: die Halte stehen still untereinander, getrennt nur durch eine Haarlinie. Ruhig und schnell, aber genau das, was Wolf meint, wenn er sagt, die Seite wirke wie eine lange Seite.',
      en: 'Today’s state: the stops sit still one below the other, separated only by a hairline. Calm and fast, but exactly what Wolf means when he says the page reads as one long page.',
    },
  },
  2: {
    name: 'Eindrehen',
    idee: {
      de: 'Das Bild eines Halts (Brett, Handy, Leinwand, Foto) kommt gedreht und leicht gekippt herein und richtet sich auf, waehrend der Halt in die Mitte faehrt. Genau der Mana-Mate-Griff: ein Gegenstand dreht sich in seine Lage. Betrifft nur das Bild, nie den Text, sonst wird das Lesen zur Fahrt.',
      en: 'A stop’s object (board, phone, screen, photo) enters rotated and slightly tilted and straightens as the stop moves to the centre. Exactly the Mana Mate move: an object turns into place. Applies to the object only, never the text, otherwise reading becomes a ride.',
    },
  },
  3: {
    name: 'Versetzt hereinfahren',
    idee: {
      de: 'Die drei Spalten eines Halts kommen nacheinander von unten, links zuerst, das Bild zuletzt, je 60 ms versetzt. Kein Drehen, nur Lage. Ruhiger als das Eindrehen und passt auch zu Halten ohne Gegenstand, etwa den Fragen.',
      en: 'A stop’s three columns arrive from below one after another, left first, the object last, 60ms apart. No rotation, only position. Calmer than the turn-in, and it also suits stops without an object, such as the questions.',
    },
  },
  4: {
    name: 'Der Grund kippt',
    idee: {
      de: 'Nicht der Inhalt bewegt sich, sondern der Grund: jeder Halt traegt einen eigenen, sehr dunklen Farbton, und beim Wechsel schiebt sich der neue als schraege Kante ueber den alten. Die Seite bekommt dadurch Kapitel, ohne dass ein einziges Element wandert. Am billigsten in der Leistung und am ehesten das, was Referenzseiten mit "es verschiebt sich" meinen.',
      en: 'Not the content moves but the ground: every stop carries its own very dark hue, and on the change the new one slides over the old as a diagonal edge. The page gains chapters without a single element travelling. Cheapest in performance, and closest to what reference sites mean by “it shifts”.',
    },
  },
} as const;
export type TrennEntwurf = keyof typeof TRENN_ENTWUERFE;

const EASE = 'cubic-bezier(.22,1,.36,1)';

const HALTE = [
  { nr: '01', titel: 'CozyQuiz', text: 'Wer eine Frage richtig hat, setzt ein Feld.', ton: '#160e28', art: 'brett' },
  { nr: '03', titel: 'So spielt ihr mit', text: 'Ein Handy pro Team, QR-Code scannen, fertig.', ton: '#0c1526', art: 'handy' },
  { nr: '04', titel: 'Eine freie Wand', text: 'Beamer, Sound und Moderation bringe ich mit.', ton: '#0b1a14', art: 'wand' },
  { nr: '05', titel: 'Über mich', text: 'Ich moderiere jeden Abend selbst.', ton: '#1c1208', art: 'foto' },
];

export function Trennung({ mobil, entwurf }: { mobil: boolean; entwurf: TrennEntwurf }) {
  const H = mobil ? 320 : 460;
  /* Wolf am 28.08. zu T3: "das fehlt doch oder nicht? ich sehe t3 nicht?"
     Er hatte recht, und es lagen drei Sachen daran.

     Erstens war jeder Halt genau so hoch wie das Fenster und rastete mittig
     ein. Damit ist immer genau EIN Halt zu sehen, und zwar immer der, der
     schon angekommen ist. Das Hereinfahren gibt es nur waehrend der Fahrt,
     und die dauert bei eingerastetem Scrollen kaum eine Viertelsekunde. Wer
     danach hinsieht, sieht T1. Jetzt ist ein Halt 62 Prozent hoch und nichts
     rastet ein: der naechste steht immer schon zur Haelfte im Bild, und man
     kann mittendrin stehenbleiben und die Lage ansehen.

     Zweitens gab es den Versatz gar nicht, obwohl er im Namen steht. Die
     Beschreibung verspricht drei Spalten, je 60 ms nacheinander; im Modell
     waren es zwei Blocke ohne jede Verzoegerung. Jetzt sind es drei Teile
     (Zeile mit Nummer und Titel, Beschreibung, Gegenstand) mit 0, 60 und
     120 ms.

     Drittens stand pos anfangs auf dem INDEX der Halte statt auf ihrer Lage.
     Das war ein Tippfehler mit Tarnung: fuer den ersten Halt kommt zufaellig
     der richtige Wert heraus. Jetzt wird einmal beim Aufbau gemessen. */
  const HH = Math.round(H * 0.62);
  const [pos, setPos] = useState<number[]>(() => HALTE.map((_, i) => (i === 0 ? 0 : 1)));
  const kasten = useRef<HTMLDivElement | null>(null);

  const messen = () => {
    const el = kasten.current;
    if (!el) return;
    // -1 kommt von unten, 0 steht mittig, +1 geht oben raus
    setPos([...el.children].map(k => {
      const r = (k as HTMLElement).getBoundingClientRect();
      const e = el.getBoundingClientRect();
      return ((e.top + e.height / 2) - (r.top + r.height / 2)) / (e.height / 2);
    }));
  };
  useEffect(messen, []);

  return (
    <section style={sx(`max-width:1240px;margin:0 auto;padding:${mobil ? '24px 20px 50px' : '36px 40px 80px'}`)}>
      <div ref={kasten} onScroll={messen}
        style={sx(`height:${H}px;overflow-y:auto;border:1px solid ${HAAR};border-radius:18px;background:#0a0814;`
          + 'position:relative')}>
        {HALTE.map((h, i) => {
          const p = Math.max(-1, Math.min(1, pos[i] ?? 1));   // -1 unten, 0 Mitte, 1 oben
          const weg = Math.abs(p);                            // 0 = mittig, 1 = ganz weg
          const dreh = entwurf === 2 ? (p * -14).toFixed(1) : '0';
          const kipp = entwurf === 2 ? (weg * 9).toFixed(1) : '0';
          const hoch = entwurf === 3 ? (p * -58).toFixed(0) : '0';
          const schief = entwurf === 4 ? weg * 2.2 : 0;
          return (
            <div key={h.nr} style={sx(`position:relative;height:${HH}px;box-sizing:border-box;`
              + `display:flex;align-items:center;gap:${mobil ? '18px' : '34px'};padding:${mobil ? '20px' : '30px 36px'};`
              + (entwurf === 4 ? `background:${h.ton};clip-path:polygon(0 ${schief.toFixed(2)}%,100% 0,100% 100%,0 100%);` : `border-top:1px solid ${HAAR};`))}>
              <div style={sx('flex:1;min-width:0')}>
                <div style={sx((entwurf === 3 ? `transform:translateY(${hoch}px);opacity:${(1 - weg * .8).toFixed(2)};transition-delay:0ms;` : '')
                  + `transition:transform .45s ${EASE},opacity .45s ${EASE}`)}>
                  <div style={sx('font-size:11px;font-weight:900;letter-spacing:.18em;text-transform:uppercase;color:rgba(246,239,230,.45);margin-bottom:8px')}>{h.nr}</div>
                  <div style={sx(`font-family:${SPARTAN};font-size:${mobil ? '24px' : '34px'};font-weight:900;line-height:1;letter-spacing:-.025em;color:${CREME};margin-bottom:10px`)}>{h.titel}</div>
                </div>
                <div style={sx('font-size:15px;line-height:1.5;font-weight:500;color:rgba(246,239,230,.68);'
                  + (entwurf === 3 ? `transform:translateY(${(Number(hoch) * 1.35).toFixed(0)}px);opacity:${(1 - weg * .9).toFixed(2)};transition-delay:60ms;` : '')
                  + `transition:transform .45s ${EASE},opacity .45s ${EASE}`)}>{h.text}</div>
              </div>
              {/* Der Gegenstand des Halts. Nur er dreht sich, nie der Text. */}
              <div style={sx(`flex:none;width:${mobil ? 110 : 170}px;height:${mobil ? 150 : 230}px;border-radius:${h.art === 'handy' ? '22px' : '14px'};`
                + `background:linear-gradient(150deg,${h.ton},#07060d);border:2px solid rgba(246,239,230,.16);`
                + 'box-shadow:0 22px 44px rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;'
                + `font-size:12px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:rgba(246,239,230,.5);`
                + `transform:rotate(${dreh}deg) rotateY(${kipp}deg) translateY(${entwurf === 3 ? (Number(hoch) * 1.7).toFixed(0) : 0}px);`
                + (entwurf === 3 ? `opacity:${(1 - weg).toFixed(2)};transition-delay:120ms;` : '')
                + `transition:transform .5s ${EASE},opacity .5s ${EASE}`)}>{h.art}</div>
            </div>
          );
        })}
      </div>
      <div style={sx(`margin-top:16px;font-size:13.5px;line-height:1.6;font-weight:500;color:rgba(246,239,230,.6);max-width:70ch`)}>
        Im Fenster scrollen, um den Effekt zu sehen. Auf der echten Seite laeuft das ohne JavaScript ueber <b style={sx(`color:${CREME}`)}>animation-timeline: view()</b>; hier rechnet es ein Scroll-Aufruf, weil ein Kasten im Kasten keine eigene Ansichts-Zeitleiste hat.
      </div>
    </section>
  );
}
