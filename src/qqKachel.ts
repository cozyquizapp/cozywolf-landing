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


// ── Optischer Ausgleich ────────────────────────────────────────────────────
// Uebernommen aus cozyquizAvatars.ts der App (dort erzeugt von
// scripts/measure-avatar-fill.mjs, NICHT von Hand gepflegt).
//
// Warum es das braucht: die Motive sind auf ihre Alpha-Box beschnitten, und
// `contain` skaliert in einer quadratischen Kachel nach der groesseren Seite.
// Ein Wuerfel ist quadratisch und fuellt sie fast ganz, eine Teekanne ist
// breiter als hoch. Ueber alle 48 Motive hat die App 21,6 bis 87,1 Prozent
// Flaechenanteil gemessen, also Faktor vier. Der Ausgleich drueckt das auf
// Faktor 2,3; der Rest ist die Form der Gegenstaende selbst.
//
// FILL  = Anteil der Kachelkante, den das Motiv einnimmt.
// NUDGE = Verschiebung in Prozent der Kachelkante, nur fuer Motive, deren
//         Schwerpunkt deutlich neben der Mitte der Bounding-Box liegt.
const FILL: Record<string, number> = {
  'crystal-ball': 0.89,
  'game-die': 0.78,
  'mushroom': 0.92,
  'table-lamp': 0.92,
  'teapot': 0.91,
  'treasure-chest': 0.79,
};
const NUDGE: Record<string, [number, number]> = {
  'mushroom': [-0.2, 2.5],
};

/** Slug aus einem Avatar-Pfad `/assets/av-qq-<slug>.webp`. */
function slugAus(av: string): string {
  return av.replace(/^.*av-qq-/, '').replace(/\.webp$/, '');
}

/** Anteil der Kachelkante fuer dieses Motiv. 0.9 ist der Grundwert der App. */
export function motivAnteil(av: string): number {
  return FILL[slugAus(av)] ?? 0.9;
}

/** Sitz-Korrektur in Prozent der Kachelkante, oder null. */
export function motivSitz(av: string): [number, number] | null {
  return NUDGE[slugAus(av)] ?? null;
}

/** Eckenradius der Kachel: 16 Prozent, wie in der App.
 *  Brettfeld, Teammarke und Quirk-Kachel fahren dort denselben Wert - ein
 *  Prozentwert haelt die Form ueber alle Groessen gleich, ein fester Pixelwert
 *  waere auf einer grossen Zelle fast eckig und auf einer kleinen fast rund. */
export const KACHEL_RADIUS = '16%';

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
 * @param radius Eckenradius, per Vorgabe 16 Prozent.
 */
export function teammarke(farbe: string, av: string, px: number, radius: string = KACHEL_RADIUS): string {
  const sitz = motivSitz(av);
  const pos = sitz
    ? `calc(50% + ${(sitz[0] * px / 100).toFixed(2)}px) calc(50% + ${(sitz[1] * px / 100).toFixed(2)}px)`
    : 'center';
  return `width:${px}px;height:${px}px;flex:none;border-radius:${radius};`
    + `background-image:url(${av}),${KACHEL_VERLAUF};`
    + `background-color:${farbe};`
    + `background-size:${Math.round(px * motivAnteil(av))}px auto,auto;`
    + `background-position:${pos},center;`
    + `background-repeat:no-repeat,no-repeat;`
    + `box-shadow:${KANTEN};`;
}
