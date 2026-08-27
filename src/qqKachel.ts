// Die Kachel - EINE Definition fuer alle Teamflaechen auf der Landing.
//
// Uebernommen aus dem Design der App (frontend/src/qqKachel.ts). Dort ist sie
// die Wiedererkennung der Marke: die Kachel vom Brett wird der Baustein im
// Turm. Damit die Website und der Abend denselben Gegenstand zeigen, gilt hier
// dieselbe Definition.
//
// Die Tiefe kommt NICHT aus Weichzeichnung, sondern aus vier harten Kanten:
//   1. Ein senkrechter Verlauf ueber der Teamfarbe, hell oben, dunkel unten.
//   2. Ein Ein-Pixel-Licht auf der Oberkante: die Kante selbst leuchtet.
//   3. Zwei Innenlichter an den Seiten, links hell, rechts dunkel.
//   4. Ein kurzer, harter Schlagschatten - kurz, damit er als Auflagepunkt
//      liest und nicht als Schweben.
//
// Diese Weisswerte sind Licht, kein Text und keine Flaeche. Sie bleiben deshalb
// bewusst echtes Weiss und werden NICHT auf die warme Creme-Skala gezogen.
//
// ⚠️ Nichts davon liegt auf dem Motiv. Die Avatare des CozyQuiz-Sets tragen
// ihren Eigenschatten im Alpha; alles hier wirkt auf die FLAECHE dahinter.

/** Der Lichtverlauf ueber der Teamfarbe, ohne die Farbe selbst. */
export const KACHEL_VERLAUF = 'linear-gradient(180deg,rgba(255,255,255,.22) 0%,rgba(255,255,255,.06) 18%,'
  + 'rgba(255,255,255,0) 50%,rgba(0,0,0,.16) 78%,rgba(0,0,0,.34) 100%)';

/** Die vier harten Kanten als box-shadow. */
const KANTEN = 'inset 0 1px 0 rgba(255,255,255,.38),inset 2px 0 0 rgba(255,255,255,.07),'
  + 'inset -2px 0 0 rgba(0,0,0,.18),0 3px 4px rgba(0,0,0,.42)';

/** Eckenradius der Teammarke: 18 Prozent, wie in der App. */
export const KACHEL_RADIUS = '18%';

/**
 * Die Flaeche einer Kachel als CSS-String (passend zu sx()).
 * @param farbe Die Teamfarbe. Sie traegt die Bedeutung, der Rest ist nur Licht.
 * @param radius Eckenradius; die Teammarke faehrt 18 Prozent, das Brett 6px.
 */
export function kachel(farbe: string, radius: string = KACHEL_RADIUS): string {
  return `border-radius:${radius};background:${KACHEL_VERLAUF},${farbe};box-shadow:${KANTEN};`;
}

/**
 * Eine Teammarke: das farbneutrale Objekt auf der Kachel in Teamfarbe.
 * Das Motiv liegt als eigene Ebene UEBER dem Lichtverlauf, damit der Verlauf
 * die Flaeche modelliert und nicht das Bild.
 * @param farbe Teamfarbe der Kachel.
 * @param av Pfad zum Avatar-Motiv.
 * @param px Kantenlaenge in Bildpunkten.
 * @param radius Eckenradius, per Vorgabe 18 Prozent.
 */
export function teammarke(farbe: string, av: string, px: number, radius: string = KACHEL_RADIUS): string {
  return `width:${px}px;height:${px}px;flex:none;border-radius:${radius};`
    + `background-image:url(${av}),${KACHEL_VERLAUF};`
    + `background-color:${farbe};`
    + `background-size:${Math.round(px * 0.76)}px auto,auto;`
    + `background-position:center,center;`
    + `background-repeat:no-repeat,no-repeat;`
    + `box-shadow:${KANTEN};`;
}
