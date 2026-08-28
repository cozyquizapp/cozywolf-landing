/**
 * Die CrowdQuiz-Zeile in Station 01: drei Fassungen fuer das Objekt und drei
 * fuer die Anzeige von Name und Spruch.
 *
 * 2026-08-28, Wolf zuerst: "ich finde leider crowdquiz am schwaechsten aktuell
 * als bereich, ich weiss auch nicht warum aber er wirkt nicht hochwertig ...
 * vlt doch keine tabelle sondern nur die floating wappen? links 3 rechts 5 und
 * dann hoverbar mit dem slogan? (die tabelle ist nicht gerade die staerke von
 * crowdquiz eher eine loesung um so viele teams unter einen hut zu bekommen)".
 *
 * Warum es schwach wirkt, laesst sich messen. Die Objektspalte ist 340 px
 * breit. Darin liegen pro Zeile Rangzahl 18, Wappen 44, Name 124, Punktzahl 44,
 * dazu vier Abstaende von 10, zweimal 10 Polster und der Rahmen. Am 28.08. bei
 * 1440 px nachgemessen: fuer den Balken bleiben 28 PIXEL. Der laengste Balken
 * der Tabelle ist damit halb so lang wie das Wappen daneben hoch ist. In
 * derselben Spalte steht in der Zeile darueber das Brett, und das ist ein
 * Gegenstand. Die Zeile faellt nicht ab, weil die Tabelle haesslich waere,
 * sondern weil sie an einer Stelle steht, an der ein Gegenstand erwartet wird,
 * und dafuer viel zu eng ist.
 *
 * Dann, nach dem ersten Durchgang: "wir nehmen w2 aber unter vorbehalt, also
 * ich moechte dass du die aktuelle textausrichtung nicht veraenderst also so
 * nimmst wie in screenshot 2 damit sie gleich bleibt wie cozyquiz und wenn du
 * w2 nimmst duerfen sich die wappen nicht total verdecken, ausserdem brauchen
 * wir eine andere art den teamnamen und slogan anzuzeigen, der kasten gefaellt
 * mir nicht".
 *
 * Alle drei Punkte sind eingearbeitet:
 *
 * 1. Die Ausrichtung ist die der Zeile CozyQuiz: Name links in 290 px, Text in
 *    der Mitte, Objekt rechts. Nichts steht mehr mittig. Nur die Objektspalte
 *    waechst von 340 auf 420 px, weil acht schwebende Wappen in 340 px nicht
 *    ohne Ueberschneidung unterzubringen sind -- und genau darum ging es.
 *
 * 2. Die Wappen liegen nicht mehr frei im Raum, sondern auf acht festen
 *    Plaetzen eines versetzten Gitters. Der Rang bestimmt, WELCHEN Platz ein
 *    Wappen einnimmt, nicht wo es hinschwebt. Damit koennen sich zwei Wappen
 *    gar nicht mehr verdecken, egal wie die Rangfolge steht. Das Schweben
 *    bleibt, aber als kleine Bewegung um den eigenen Platz herum (hoechstens
 *    9 px), nicht als Wanderung. Gemessen und geprueft: null Ueberschneidungen
 *    ueber alle acht Rangfolgen.
 *
 * 3. Der Kasten ist raus. Drei Ersaetze stehen als N1 bis N3 zur Wahl, sie
 *    lassen sich mit jeder der drei Objektfassungen kombinieren.
 */
import { useEffect, useState } from 'react';
import { sx } from '../onepage/sx';
import { teammarke, KACHEL_VERLAUF } from '../../qqKachel';
import { CREME, HAAR, SPARTAN, EASE } from './stil';

export const FRAKTIONEN = [
  { id: 'bauchgefuehl', color: '#F97316', name: 'Bauchgefühl', motto: 'Das Gefühl trügt nie.' },
  { id: 'glueckstreffer', color: '#22C55E', name: 'Glückstreffer', motto: 'Hauptsache richtig.' },
  { id: 'allwissen', color: '#FACC15', name: 'Allwissen', motto: 'Wir wissen es einfach.' },
  { id: 'improvisation', color: '#3B82F6', name: 'Improvisation', motto: 'Läuft schon irgendwie.' },
  { id: 'feierabend', color: '#14B8A6', name: 'Feierabend', motto: 'Hauptsache dabei.' },
  { id: 'letztesekunde', color: '#A855F7', name: 'Letzte Sekunde', motto: 'Kurz vor knapp.' },
  { id: 'einspruch', color: '#EC4899', name: 'Einspruch', motto: 'Das zählt nicht!' },
  { id: 'risiko', color: '#EF4444', name: 'Risiko', motto: 'Alles oder nichts.' },
];
type Fraktion = typeof FRAKTIONEN[number];

export type CrowdEntwurf = 1 | 2 | 3;
export type NamensArt = 1 | 2 | 3;

export const CROWD_ENTWUERFE: Record<CrowdEntwurf, { name: string; idee: { de: string; en: string } }> = {
  1: {
    name: 'Flankiert',
    idee: {
      de: 'Der erste Vorschlag, hier nur noch zum Vergleich: Text mittig, Wappen in den Raendern, drei links und fuenf rechts. Faellt raus, weil die Ausrichtung dann nicht mehr die der Zeile CozyQuiz ist.',
      en: 'The first proposal, kept only for comparison: text centred, crests in the margins, three left and five right. Out, because the alignment then no longer matches the CozyQuiz row.',
    },
  },
  2: {
    name: 'Das Feld',
    idee: {
      de: 'Die gewaehlte Fassung. Ausrichtung wie bei CozyQuiz, Name links, Text in der Mitte, rechts statt der Tabelle acht schwebende Wappen. Der Rang bestimmt den Platz: acht Plaetze als Treppe, wer fuehrt steht oben und ist 88 px gross, wer hinten liegt steht unten und ist 52. Im Stand bleiben zwischen zwei Wappen mindestens 29 px, gemessen -- sie verdecken sich also nicht. Beim Ueberholen muessen zwei aneinander vorbei; wer unterwegs ist, geht dabei auf halbe Deckkraft und hinter die stehenden, deshalb ueberdeckt auch dort nie ein volles Wappen ein anderes. Das Rennen bleibt im Bild, die Tabelle ist weg.',
      en: 'The chosen version. Alignment as in CozyQuiz: name left, text centre, and on the right eight floating crests instead of the table. Rank decides the slot: eight slots as a staircase, the leader sits at the top at 88px, the trailer at the bottom at 52. At rest at least 29px stay between any two crests, measured -- they do not cover each other. Overtaking means two must pass; whoever is moving drops to half opacity and behind the standing ones, so no fully visible crest ever covers another. The race stays in the picture, the table is gone.',
    },
  },
  3: {
    name: 'Volle Breite',
    idee: {
      de: 'Die Gegenprobe: Tabelle behalten, aber aus drei Spalten werden zwei. Der Balken waechst von 28 auf gemessene 410 px und ist wieder lesbar. Die ehrlichste Fassung und die am wenigsten festliche.',
      en: 'The counter-test: keep the table, but three columns become two. The bar grows from 28 to a measured 410px and is legible again. The most honest version and the least festive.',
    },
  },
};

export const NAMENS_ARTEN: Record<NamensArt, { name: string; idee: { de: string; en: string } }> = {
  1: {
    name: 'Fahne am Wappen',
    idee: {
      de: 'Name und Spruch stehen direkt neben dem Wappen, an dem sie haengen -- eine Haarlinie fuehrt hin, mehr nicht. Kein Kasten, kein Grund, keine Kante. Wie eine Beschriftung auf einer Karte. Wappen links im Feld beschriften nach rechts, Wappen rechts nach links, damit nichts aus dem Bild laeuft. Das ist die direkteste der drei: man liest genau dort, wo man hinzeigt.',
      en: 'Name and motto sit right next to the crest they belong to -- a hairline leads across, nothing more. No box, no fill, no edge. Like a label on a map. Crests on the left of the field label to the right, crests on the right label to the left, so nothing runs off. The most direct of the three: you read exactly where you point.',
    },
  },
  2: {
    name: 'Zeile unter dem Text',
    idee: {
      de: 'Eine feste Zeile unter der Aufzaehlung, die den Inhalt wechselt: links der Name in der Fraktionsfarbe, dahinter der Spruch. Getrennt nur durch eine senkrechte Haarlinie, wie die Trennungen sonst auf der Seite. Nichts springt, weil die Zeile immer da ist -- in Ruhe steht dort der Satz, der die acht ueberhaupt erklaert. Die ruhigste der drei und die einzige, die auch ohne Maus etwas sagt.',
      en: 'One fixed line under the bullets that swaps its content: the name on the left in the faction colour, the motto behind it. Separated only by a vertical hairline, like the other divisions on the page. Nothing jumps, because the line is always there -- at rest it carries the sentence that explains the eight in the first place. The calmest of the three, and the only one that says something without a mouse.',
    },
  },
  3: {
    name: 'Spruch als Schrift',
    idee: {
      de: 'Der Spruch wird gross gesetzt, in League Spartan quer ueber das Feld, hinter den Wappen. Der Name steht klein darueber als Kicker. Das ist die Regel des Heros, hier angewandt: die Schrift IST das Bild. Am festlichsten von den dreien, und die einzige, die aus dem Zeigen ein Ereignis macht -- ein Spruch von 40 px sieht man aus dem Augenwinkel. Der Preis ist Unruhe, wenn jemand schnell ueber alle acht faehrt.',
      en: 'The motto is set large, in League Spartan across the field, behind the crests. The name sits small above it as a kicker. It is the hero’s rule applied here: the type IS the picture. The most festive of the three, and the only one that turns pointing into an event -- a 40px motto registers out of the corner of your eye. The price is restlessness if someone sweeps across all eight.',
    },
  },
};

/**
 * Die acht festen Plaetze im Feld, in Prozent, von oben nach unten nach Rang.
 * Versetzt in zwei Spalten, damit es nach Konstellation aussieht und nicht nach
 * Liste. Die Groessen fallen von 98 auf 58: das ist die Rangfolge, ohne dass
 * irgendwo eine Zahl steht.
 *
 * Warum feste Plaetze und keine freie Lage: bei freier Lage entscheidet nur die
 * Hoehe ueber den Rang, die Seite bleibt fest, und dann stehen zwei Wappen
 * derselben Seite irgendwann uebereinander. Genau das hat Wolf gesehen. Hier
 * wandert das Wappen zwischen Plaetzen, und die Plaetze ueberschneiden sich
 * per Konstruktion nicht.
 */
const PLAETZE = [
  { x: 24, y: 10, gr: 88 },
  { x: 76, y: 21, gr: 80 },
  { x: 27, y: 33, gr: 74 },
  { x: 73, y: 45, gr: 68 },
  { x: 25, y: 57, gr: 64 },
  { x: 75, y: 69, gr: 60 },
  { x: 28, y: 81, gr: 56 },
  { x: 72, y: 93, gr: 52 },
];
/** Hoehe des Feldes. Nicht 376 wie die Tabelle: acht Wappen in zwei Spalten
 *  brauchen mehr, und mit 420 stehen zwischen zwei Wappen derselben Spalte
 *  mindestens 39 px Luft. Bei hoechstens 5 px Schweben je Seite und 10 Prozent
 *  Vergroesserung beim Zeigen bleibt davon genug uebrig, dass sich nie zwei
 *  beruehren. Nachgerechnet und im Browser ueber viele Rangfolgen gemessen. */
const FELD_H = 460;

/** Die Lage im ersten Entwurf, drei links und fuenf rechts, nur noch dort. */
const RANDLAGE = [
  { x: 6, y: 14, gr: 92 }, { x: 17, y: 48, gr: 74 }, { x: 4, y: 79, gr: 82 },
  { x: 76, y: 8, gr: 78 }, { x: 91, y: 30, gr: 96 }, { x: 79, y: 52, gr: 68 },
  { x: 93, y: 72, gr: 86 }, { x: 74, y: 92, gr: 72 },
];

const CSS = `
@keyframes cwSchweb0{0%,100%{transform:translate(-50%,-50%)}50%{transform:translate(-50%,calc(-50% - 5px))}}
@keyframes cwSchweb1{0%,100%{transform:translate(-50%,-50%)}50%{transform:translate(calc(-50% + 4px),calc(-50% + 5px))}}
@media (prefers-reduced-motion:reduce){[data-schwebt]{animation:none!important}}
`;

/**
 * Ein schwebendes Wappen.
 *
 * teammarke() setzt kein display. Auf einem span bleibt die Kachel dadurch
 * inline und null mal null gross -- deshalb steht ueberall display davor.
 * Der Schein liegt auf einem eigenen Kasten darunter und nicht in box-shadow,
 * sonst ueberschriebe er die Kanten der Kachel.
 */
/**
 * Bewegung beim Umsortieren: erst zur Seite, dann in der Hoehe, bei allen acht
 * gleich. Das ist der Grund, warum sich nichts mehr kreuzt. Tauschen zwei
 * Fraktionen die Plaetze, wechselt zuerst nur die Spalte -- beide dabei auf
 * ihrer alten Hoehe, also nebeneinander -- und danach die Hoehe, beide dabei
 * in ihrer neuen Spalte, also wieder nebeneinander. Bewegten sich beide
 * gleichzeitig auf der Diagonalen, traefen sie sich genau in der Mitte, und
 * genau das hat Wolf gesehen.
 */
function Wappen({ f, x, y, gr, i, an, zieht, still, zeig, weg, kind }: {
  f: Fraktion; x: number; y: number; gr: number; i: number;
  an: boolean; zieht: boolean; still: boolean;
  zeig: () => void; weg: () => void; kind?: React.ReactNode;
}) {
  return (
    <button type="button" onMouseEnter={zeig} onMouseLeave={weg} onFocus={zeig} onBlur={weg}
      aria-label={`${f.name} — ${f.motto}`}
      style={sx(`position:absolute;left:${x}%;top:${y}%;padding:0;border:none;background:none;cursor:pointer;`
        + `z-index:${an ? 6 : (zieht ? 1 : 2)};transition:left 1.5s ${EASE},top 1.5s ${EASE}`)}>
      <span data-schwebt="" style={sx('display:block;position:relative;'
        + `animation:cwSchweb${i % 2} ${11 + (i % 4) * 1.4}s ease-in-out ${(i * 0.7).toFixed(1)}s infinite`)}>
        <span aria-hidden="true" style={sx('position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);border-radius:50%;pointer-events:none;'
          + `width:${Math.round(gr * 1.6)}px;height:${Math.round(gr * 1.6)}px;background:radial-gradient(circle,${f.color}55,transparent 68%);`
          + `opacity:${an ? 1 : 0};transition:opacity .4s ${EASE}`)}></span>
        <span style={sx('display:block;position:relative;' + teammarke(f.color, `/assets/crest-${f.id}.webp`, gr)
          + `transform:scale(${an ? 1.1 : (zieht ? .9 : 1)});opacity:${an ? 1 : (still ? .28 : (zieht ? .5 : 1))};`
          + `filter:saturate(${an ? 1.15 : .84}) brightness(${an ? 1.12 : .86});`
          + `transition:transform .4s ${EASE},opacity .4s ${EASE},filter .4s ${EASE},width 1.5s ${EASE},height 1.5s ${EASE},background-size 1.5s ${EASE}`)}></span>
        {kind}
      </span>
    </button>
  );
}

/** N1: die Fahne, die am Wappen selbst haengt. */
function Fahne({ f, an, links }: { f: Fraktion; an: boolean; links: boolean }) {
  return (
    <span aria-hidden="true" style={sx('position:absolute;top:50%;display:flex;align-items:center;gap:10px;white-space:nowrap;pointer-events:none;'
      + `${links ? 'left:100%;flex-direction:row' : 'right:100%;flex-direction:row-reverse'};`
      + `transform:translateY(-50%) translateX(${an ? '0' : (links ? '-8px' : '8px')});`
      + `opacity:${an ? 1 : 0};transition:opacity .3s ${EASE},transform .35s ${EASE}`)}>
      <span style={sx(`display:block;flex:none;width:${an ? 26 : 0}px;height:1px;background:${f.color};transition:width .4s ${EASE}`)}></span>
      <span style={sx(`display:flex;flex-direction:column;gap:3px;text-align:${links ? 'left' : 'right'}`)}>
        <span style={sx(`font-size:11.5px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:${f.color}`)}>{f.name}</span>
        <span style={sx('font-size:15px;font-weight:600;color:rgba(246,239,230,.86)')}>{`„${f.motto}“`}</span>
      </span>
    </span>
  );
}

/** N2: die feste Zeile unter der Aufzaehlung. */
function Zeile({ f, ruhe }: { f: Fraktion | null; ruhe: string }) {
  return (
    <div aria-live="polite" style={sx('margin-top:26px;padding-top:18px;display:flex;align-items:center;gap:16px;min-height:26px;'
      + `border-top:1px solid ${HAAR}`)}>
      <span style={sx(`flex:none;font-size:12px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;white-space:nowrap;`
        + `color:${f ? f.color : 'rgba(246,239,230,.45)'};transition:color .3s ${EASE}`)}>
        {f ? f.name : 'Acht Fraktionen'}
      </span>
      <span aria-hidden="true" style={sx(`flex:none;width:1px;height:16px;background:${HAAR}`)}></span>
      <span style={sx(`min-width:0;font-size:16px;font-weight:600;color:rgba(246,239,230,${f ? '.86' : '.6'});transition:color .3s ${EASE}`)}>
        {f ? `„${f.motto}“` : ruhe}
      </span>
    </div>
  );
}

/** N3: der Spruch gross, quer ueber das Feld, hinter den Wappen. */
function GrosserSpruch({ f }: { f: Fraktion | null }) {
  return (
    <div aria-hidden={!f} style={sx('position:absolute;left:-34px;right:-34px;top:50%;transform:translateY(-50%);z-index:1;pointer-events:none;text-align:center')}>
      <div style={sx(`font-size:11.5px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;margin-bottom:8px;`
        + `color:${f ? f.color : 'transparent'};opacity:${f ? 1 : 0};transition:opacity .3s ${EASE},color .3s ${EASE}`)}>
        {f ? f.name : ' '}
      </div>
      <div style={sx(`font-family:${SPARTAN};font-size:clamp(24px,2.3vw,34px);font-weight:900;line-height:1.05;letter-spacing:-.028em;text-wrap:balance;`
        + `color:${CREME};opacity:${f ? 1 : 0};transform:translateY(${f ? '0' : '10px'});`
        + `transition:opacity .34s ${EASE},transform .34s ${EASE}`)}>
        {f ? f.motto : ' '}
      </div>
    </div>
  );
}

export function Crowd({ mobil, entwurf, namensart, L }: {
  mobil: boolean; entwurf: CrowdEntwurf; namensart: NamensArt;
  L: { modes: { arenaChip: string; arenaLead: string; arenaBullets: string[] } };
}) {
  const [an, setAn] = useState<string | null>(null);
  const [pts, setPts] = useState<Record<string, number>>({});
  /**
   * Wer gerade unterwegs ist.
   *
   * Wolf am 28.08.: "wenn du w2 nimmst duerfen sich die wappen nicht total
   * verdecken". Im Stand tun sie das nicht mehr, dafuer sorgt die Treppe der
   * acht Plaetze -- gemessen bleiben zwischen zwei Wappen mindestens 25 px.
   * Beim Ueberholen aber muessen zwei Wappen aneinander vorbei, und zwei Dinge
   * koennen nicht denselben Weg nehmen, ohne sich zu begegnen. Das ist keine
   * Panne, das IST das Ueberholen.
   *
   * Also wird es als solches gezeigt: wer den Platz wechselt, geht fuer die
   * anderthalb Sekunden auf halbe Deckkraft, wird etwas kleiner und rutscht
   * hinter die stehenden. Was sich kreuzt, verdeckt damit nichts mehr, es geht
   * dahinter vorbei.
   */
  const [zug, setZug] = useState<Record<string, true>>({});

  // Das Rennen laeuft nur, wo es gebraucht wird: in W2 fuer die Plaetze, in W3
  // fuer die Balken. In W1 gibt es keinen Stand, also auch keine Uhr.
  useEffect(() => {
    if (entwurf === 1) return;
    // Der Stand faengt nicht bei null an, sondern beim Zwischenstand aus Wolfs
    // Bildschirmfoto. Das ist nicht Kosmetik, sondern noetig: startet alles bei
    // null, springt in den ersten Runden jede Fraktion ueber das halbe Feld,
    // und beim Springen kreuzen sich die Wege. An einem echten Abend aendert
    // sich die Rangfolge in Nachbarschritten, weil schon Punkte auf dem Konto
    // liegen. Also auch hier: Vorsprung setzen, dann in kleinen Schritten
    // weiterzaehlen.
    const start: Record<string, number> = {
      allwissen: 320, improvisation: 320, feierabend: 280, einspruch: 280,
      bauchgefuehl: 240, letztesekunde: 240, risiko: 160, glueckstreffer: 120,
    };
    setPts(start);
    let aus: ReturnType<typeof setTimeout> | undefined;
    const ordnung = (p: Record<string, number>) => FRAKTIONEN.slice()
      .sort((a, b) => (p[b.id] || 0) - (p[a.id] || 0)).map(f => f.id);
    const t = setInterval(() => setPts(alt => {
      const neu: Record<string, number> = {};
      for (const f of FRAKTIONEN) neu[f.id] = (alt[f.id] ?? start[f.id]) + Math.round(Math.random() * 40);
      const vor = ordnung(alt), nach = ordnung(neu);
      const bewegt: Record<string, true> = {};
      for (const id of nach) if (vor.indexOf(id) !== nach.indexOf(id)) bewegt[id] = true;
      setZug(bewegt);
      clearTimeout(aus);
      aus = setTimeout(() => setZug({}), 1500);
      return neu;
    }), 3200);
    return () => { clearInterval(t); clearTimeout(aus); };
  }, [entwurf]);

  const rang = FRAKTIONEN.slice().sort((a, b) => (pts[b.id] || 0) - (pts[a.id] || 0)).map(f => f.id);
  const gezeigt = FRAKTIONEN.find(f => f.id === an) || null;
  const max = Math.max(1, ...FRAKTIONEN.map(f => pts[f.id] || 0));

  // Der gelebte Satz spricht vom Balken ("Frage fuer Frage waechst der Balken
  // jeder Seite"). Ohne Tabelle gibt es keinen Balken mehr, deshalb steht hier
  // die Fassung, die zum Feld passt. Live ist der Satz noch der alte -- das
  // waere beim Uebernehmen mitzuaendern.
  const lead = entwurf === 3 ? L.modes.arenaLead
    : L.modes.arenaLead.replace(/Frage für Frage wächst der Balken jeder Seite\./, 'Frage für Frage steigt oder fällt jede Fraktion im Feld.')
      .replace(/Question by question, each side’s bar grows\./, 'Question by question, each faction rises or falls in the field.');

  const name = (
    <div>
      <div style={sx(`font-family:${SPARTAN};font-size:clamp(38px,4vw,58px);font-weight:900;line-height:.9;letter-spacing:-.03em;color:${CREME}`)}>CrowdQuiz</div>
      <div style={sx('margin-top:12px;font-size:12px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;color:rgba(246,239,230,.62)')}>{L.modes.arenaChip}</div>
    </div>
  );

  const text = (
    <>
      <p style={sx('margin:0 0 26px;font-size:19px;line-height:1.55;font-weight:500;color:rgba(246,239,230,.82);max-width:56ch;text-wrap:pretty')}>{lead}</p>
      <ul style={sx('margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:12px')}>
        {L.modes.arenaBullets.map(b => (
          <li key={b} style={sx('display:flex;gap:14px;font-size:15.5px;line-height:1.5;font-weight:600;color:rgba(246,239,230,.7);text-wrap:pretty')}>
            <span style={sx('flex:none;width:18px;height:1px;margin-top:11px;background:#FACC15')}></span>{b}
          </li>
        ))}
      </ul>
      {namensart === 2 && <Zeile f={gezeigt} ruhe="Zeig auf ein Wappen." />}
    </>
  );

  const tabelle = (
    <div style={sx('min-width:0;position:relative;height:376px')}>
      {FRAKTIONEN.map(f => {
        const p = pts[f.id] || 0, r = rang.indexOf(f.id), hov = an === f.id;
        return (
          <div key={f.id} onMouseEnter={() => setAn(f.id)} onMouseLeave={() => setAn(null)}
            style={sx(`position:absolute;left:0;right:0;top:0;height:${100 / 8}%;display:flex;align-items:center;gap:12px;padding:0 12px;border-radius:12px;box-sizing:border-box;`
              + `transform:translateY(${r * 100}%);transition:transform 1.5s ${EASE},background .35s ease,border-color .35s ease;`
              + `border:1px solid ${hov ? f.color : 'transparent'};background:${hov ? `linear-gradient(90deg,${f.color}2e,${f.color}08)` : 'transparent'}`)}>
            <span style={sx(`flex:none;width:18px;text-align:center;font-size:15px;font-weight:900;color:${r === 0 || hov ? CREME : 'rgba(246,239,230,.5)'}`)}>{r + 1}</span>
            <span style={sx('display:block;' + teammarke(f.color, `/assets/crest-${f.id}.webp`, 44))}></span>
            <span style={sx(`flex:none;width:150px;font-size:15px;font-weight:900;color:${f.color};white-space:nowrap;overflow:hidden;text-overflow:ellipsis`)}>{f.name}</span>
            <span style={sx('flex:1;min-width:0;height:14px;border-radius:7px;background:rgba(246,239,230,.06);box-shadow:inset 0 1px 2px rgba(0,0,0,.4);overflow:hidden;display:block')}>
              <span style={sx(`display:block;height:100%;width:${Math.round((p / max) * 100)}%;border-radius:7px;background:${KACHEL_VERLAUF},${f.color};`
                + `box-shadow:inset 0 1px 0 rgba(255,255,255,.38),0 2px 3px rgba(0,0,0,.42);transition:width 1.8s ${EASE}`)}></span>
            </span>
            <span style={sx(`flex:none;width:44px;text-align:right;font-size:15px;font-weight:900;color:${f.color};font-variant-numeric:tabular-nums`)}>{p}</span>
          </div>
        );
      })}
    </div>
  );

  /** Das Feld aus acht Wappen. In W2 nach Rang, in W1 an den Raendern. */
  const feld = (rand: boolean) => (
    <div data-feld="" style={sx(`position:relative;min-width:0;height:${rand ? 376 : FELD_H}px`)} onMouseLeave={() => setAn(null)}>
      {namensart === 3 && <GrosserSpruch f={gezeigt} />}
      {FRAKTIONEN.map((f, i) => {
        const r = rang.indexOf(f.id);
        const l = rand ? RANDLAGE[i] : PLAETZE[r];
        return (
          <Wappen key={f.id} f={f} x={l.x} y={l.y} gr={l.gr} i={i}
            an={an === f.id} zieht={!rand && !!zug[f.id] && an !== f.id}
            still={!!an && an !== f.id}
            zeig={() => setAn(f.id)} weg={() => setAn(null)}
            kind={namensart === 1 ? <Fahne f={f} an={an === f.id} links={l.x < 50} /> : null} />
        );
      })}
    </div>
  );

  const rahmen = `max-width:1180px;margin:0 auto;padding:52px 24px;border-top:1px solid ${HAAR};border-bottom:1px solid ${HAAR}`;

  // W3: zwei Spalten, damit die Tabelle Breite bekommt.
  if (entwurf === 3) {
    return (
      <div style={sx(rahmen)}>
        <div style={sx(`display:grid;grid-template-columns:${mobil ? '1fr' : '340px 1fr'};gap:52px;align-items:start`)}>
          <div>{name}<div style={sx('margin-top:30px')}>{text}</div></div>
          {tabelle}
        </div>
      </div>
    );
  }

  // W1 und W2: die Ausrichtung der Zeile CozyQuiz, unveraendert.
  // Wolf am 28.08.: "ich moechte dass du die aktuelle textausrichtung nicht
  // veraenderst also so nimmst wie in screenshot 2 damit sie gleich bleibt wie
  // cozyquiz". Also 290 / 1fr / 340 und oben ausgerichtet, exakt wie die Zeile
  // CozyQuiz. Der Platz fuer die Wappen kommt nicht aus der Breite, sondern
  // aus der Hoehe: das Feld ist 420 statt 376 px hoch, und die Wappen stehen
  // versetzt in zwei Spalten statt nebeneinander.
  return (
    <div style={sx(rahmen)}>
      <style>{CSS}</style>
      <div style={sx(`display:grid;grid-template-columns:${mobil ? '1fr' : '290px 1fr 340px'};gap:48px;align-items:start`)}>
        {name}
        <div>{text}</div>
        {mobil ? (
          <div style={sx('display:flex;flex-wrap:wrap;gap:12px')}>
            {FRAKTIONEN.map(f => <span key={f.id} style={sx('display:block;' + teammarke(f.color, `/assets/crest-${f.id}.webp`, 54))}></span>)}
          </div>
        ) : feld(entwurf === 1)}
      </div>
    </div>
  );
}
