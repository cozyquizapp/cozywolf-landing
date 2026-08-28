/**
 * Drei Fassungen fuer den Farbwechsel der Hero-Ueberschrift.
 *
 * 2026-08-27, Wolf: "ein effekt, dass die farbe etwas verlaeuft wenn ein neues
 * wort kommt? aber es geht nur wenn es geil aussieht". Weil sich Bewegung
 * schlecht beschreiben laesst, stehen hier alle drei Lesarten nebeneinander.
 *
 * Technik geprueft: der Verlauf durch die Schrift laeuft ueber
 * background-clip:text mit einem uebergrossen Verlauf, dessen Position
 * animiert wird. Das kommt ohne @property aus, das Firefox bis heute nicht
 * unterstuetzt, und traegt rund 96 Prozent der Browser. Fuer den Rest bleibt
 * die Schrift schlicht einfarbig, weil color als Rueckfall darunter steht.
 *
 * Ein Detail, das die Fassungen auseinanderhaelt: waehrend die Walze laeuft,
 * traegt jeder Buchstabe eine eigene Transformation. Eine Transformation
 * erzeugt einen eigenen Malkontext, und durch den hindurch kann kein
 * background-clip des Elternelements greifen. Fassung A setzt den Verlauf
 * deshalb erst, wenn die Walze fertig ist, nicht waehrend sie laeuft.
 */
import { useEffect, useRef, useState } from 'react';
import { sx } from '../onepage/sx';
import type { OnePageDict } from '../onepage/texts';
import { CREME, SPARTAN, Kicker } from './stil';

export const FARB_ENTWUERFE = {
  1: {
    name: 'Der Wisch',
    idee: {
      de: 'Das neue Wort kommt in Creme herein, danach laeuft die Farbe von links nach rechts durch die Buchstaben, wie Tinte, die sich vollsaugt. Ruhig und deutlich, dauert eine halbe Sekunde laenger als der reine Wortwechsel.',
      en: 'The new word arrives in cream, then the colour runs through the letters from left to right, like ink soaking in. Calm and clear, and half a second longer than the plain word change.',
    },
  },
  2: {
    name: 'Die Ueberblendung',
    idee: {
      de: 'Waehrend das alte Wort hinauslaeuft und das neue hereinkommt, wandert die Farbe von der alten in die neue, also etwa von Lila nach Gruen. Am unauffaelligsten: es sieht aus, als waere die Schrift aus einem Material, das seine Farbe wechselt.',
      en: 'While the old word rolls out and the new one rolls in, the colour travels from the old to the new, say from purple to green. Subtlest of the three: it looks as if the type were made of a material that changes colour.',
    },
  },
  3: {
    name: 'Der Nachlauf',
    idee: {
      de: 'Das Wort steht sofort in seiner Farbe, aber hinter ihm bleibt fuer einen Moment ein weicher Schein derselben Farbe stehen und zieht nach oben ab, wie eine Spur. Am auffaelligsten, und am naechsten an dem, was man „verlaufen" nennt.',
      en: 'The word appears in its colour at once, but a soft glow of the same colour lingers behind it for a moment and drifts upward, like a trail. The most noticeable, and the closest to what “bleeding” usually means.',
    },
  },
} as const;
export type FarbEntwurf = keyof typeof FARB_ENTWUERFE;

const OBJEKTE = [
  { av: '/assets/obj-puzzle.webp', farbe: '#F97316', gr: 40, x: 4, y: 6, r: -8 },
  { av: '/assets/av-qq-crystal-ball.webp', farbe: '#A855F7', gr: 33, x: 46, y: 0, r: 10 },
  { av: '/assets/av-qq-mushroom.webp', farbe: '#22C55E', gr: 30, x: 33, y: 44, r: 6 },
  { av: '/assets/obj-sanduhr.webp', farbe: '#FACC15', gr: 24, x: 68, y: 40, r: -14 },
  { av: '/assets/obj-gehirn.webp', farbe: '#3B82F6', gr: 21, x: 12, y: 66, r: 14 },
];
const WORT_OBJEKT = [4, 2, 3, 0, 1];
const ROLLE = 620;   // Dauer der Walze in ms, wie auf der Seite

export function HeroFarbe({ L, mobil, entwurf }: { L: OnePageDict; mobil: boolean; entwurf: FarbEntwurf }) {
  const woerter = L.hero.hooks;
  const n = woerter.length;
  const [i, setI] = useState(0);
  const [vor, setVor] = useState<number | null>(null);
  const [fertig, setFertig] = useState(true);   // Walze durch, Verlauf darf laufen
  const uhr = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    // Im Mockup schneller als auf der Seite (dort 6,8 s), damit man den Effekt
    // beim Vergleichen nicht suchen muss.
    uhr.current = setInterval(() => {
      setVor(i);
      setI(x => (x + 1) % n);
    }, 3400);
    return () => clearInterval(uhr.current);
  }, [i, n]);

  useEffect(() => {
    setFertig(false);
    const t = setTimeout(() => setFertig(true), ROLLE);
    return () => clearTimeout(t);
  }, [i]);

  const farbe = OBJEKTE[WORT_OBJEKT[i] % OBJEKTE.length].farbe;
  const wort = woerter[i];
  const gr = mobil ? '46px' : 'clamp(56px,7.6vw,128px)';

  // Fassung 1: erst die Walze in Creme, danach der Verlauf durch die Schrift.
  const wisch = fertig ? (
    <span key={`w${i}`} className="mkWisch"
      style={sx(`display:inline-block;color:${farbe};`
        + `background-image:linear-gradient(90deg,${farbe} 0%,${farbe} 42%,${CREME} 58%,${CREME} 100%);`
        + 'background-size:230% 100%;-webkit-background-clip:text;background-clip:text;'
        + '-webkit-text-fill-color:transparent;color:transparent')}>{wort}</span>
  ) : (
    <span key={`r${i}`} style={sx(`display:inline-block;color:${CREME}`)}>
      {wort.split('').map((c, j) => (
        <span key={j} className="cwWortEin" style={sx(`animation-delay:${(j * 0.032).toFixed(3)}s`)}>{c}</span>
      ))}
    </span>
  );

  // Fassung 2: ein Traeger, dessen Farbe uebergeht. Nur die Buchstaben
  // bekommen einen neuen Schluessel, der Traeger nicht, sonst gaebe es nichts,
  // von dem aus die Farbe wandern koennte.
  const blende = (
    <span style={sx(`display:inline-block;color:${farbe};transition:color ${ROLLE}ms linear`)}>
      {wort.split('').map((c, j) => (
        <span key={`${i}-${j}`} className="cwWortEin" style={sx(`animation-delay:${(j * 0.032).toFixed(3)}s`)}>{c}</span>
      ))}
    </span>
  );

  // Fassung 3: das Wort sofort in Farbe, dahinter eine weiche Spur.
  const nachlauf = (
    <span style={sx('position:relative;display:inline-block')}>
      <span key={`n${i}`} aria-hidden="true" className="mkNachlauf"
        style={sx(`position:absolute;left:0;top:0;color:${farbe};filter:blur(22px)`)}>{wort}</span>
      <span style={sx(`position:relative;display:inline-block;color:${farbe}`)}>
        {wort.split('').map((c, j) => (
          <span key={`${i}-${j}`} className="cwWortEin" style={sx(`animation-delay:${(j * 0.032).toFixed(3)}s`)}>{c}</span>
        ))}
      </span>
    </span>
  );

  return (
    <section style={sx(`max-width:1240px;margin:0 auto;padding:${mobil ? '46px 22px 60px' : '80px 40px 100px'}`)}>
      <div style={sx(`display:grid;gap:${mobil ? '34px' : '56px'};align-items:center;grid-template-columns:${mobil ? '1fr' : 'minmax(0,1fr) minmax(0,420px)'}`)}>
        <div style={sx('position:relative;z-index:1;min-width:0')}>
          <Kicker nummer={L.hero.kicker} label="Hero" />
          <h1 style={sx(`margin:0;font-family:${SPARTAN};font-weight:900;font-size:${gr};line-height:.86;letter-spacing:-.038em;color:${CREME}`)}>
            <span style={sx(`display:block;padding:.14em .1em .06em;margin:-.14em -.1em -.06em;overflow:hidden;white-space:nowrap;${mobil ? '' : 'width:calc(100% + 150px)'}`)}>
              {entwurf === 1 ? wisch : entwurf === 2 ? blende : nachlauf}
            </span>
            <span style={sx('display:block')}>{L.hero.rest}</span>
          </h1>
          <p style={sx('margin:24px 0 0;max-width:44ch;font-size:18px;line-height:1.55;font-weight:500;color:rgba(246,239,230,.78)')}>{L.hero.sub}</p>
          <div style={sx('margin-top:18px;font-size:12.5px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:rgba(246,239,230,.5)')}>
            Vorheriges Wort: {vor == null ? '–' : woerter[vor]} · aktuell: {wort}
          </div>
        </div>

        {/* Die Kacheln sind hier bewusst voll deckend. Wolf: "lass sie wie sie
            am anfang waren, leuchten ja, aber nicht durchsichtig". Also
            Helligkeit und Schein statt Deckkraft, die Ebenen bleiben. */}
        <div aria-hidden="true" style={sx('position:relative;z-index:3;width:100%;aspect-ratio:1/1')}>
          {OBJEKTE.map((k, j) => {
            const wach = j === WORT_OBJEKT[i] % OBJEKTE.length;
            return (
              <span key={k.av} style={sx(`position:absolute;left:${k.x}%;top:${k.y}%;width:${k.gr}%;aspect-ratio:1/1;`
                + `border-radius:16%;transform:rotate(${k.r}deg) scale(${wach ? 1.06 : 1});`
                + `background-image:url(${k.av}),linear-gradient(180deg,rgba(255,255,255,.22) 0%,rgba(255,255,255,.06) 18%,rgba(255,255,255,0) 50%,rgba(0,0,0,.16) 78%,rgba(0,0,0,.34) 100%);`
                + `background-color:${k.farbe};background-size:74% auto,auto;background-position:center,center;background-repeat:no-repeat,no-repeat;`
                + `filter:brightness(${wach ? 1.08 : 0.72});`
                + 'box-shadow:inset 0 1px 0 rgba(255,255,255,.38),inset 2px 0 0 rgba(255,255,255,.07),inset -2px 0 0 rgba(0,0,0,.18),'
                + `0 3px 4px rgba(0,0,0,.42),0 26px 50px rgba(0,0,0,.45)${wach ? `,0 0 46px ${k.farbe}66` : ''};`
                + 'transition:transform .55s cubic-bezier(.22,1,.36,1),filter .55s cubic-bezier(.22,1,.36,1),box-shadow .55s cubic-bezier(.22,1,.36,1)')}></span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
