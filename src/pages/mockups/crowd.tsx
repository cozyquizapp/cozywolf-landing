/**
 * Drei Fassungen fuer die Zeile CrowdQuiz in Station 01.
 *
 * 2026-08-28, Wolf: "ich finde leider crowdquiz am schwaechsten aktuell als
 * bereich, ich weiss auch nicht warum aber er wirkt nicht hochwertig ... vlt
 * doch keine tabelle sondern nur die floating wappen? links 3 rechts 5 und
 * dann hoverbar mit dem slogan? ... (die tabelle ist nicht gerade die staerke
 * von crowdquiz eher eine loesung um so viele teams unter einen hut zu
 * bekommen, was bei cozyquiz mit dem grid aushaengeschild ist, ist bei crowd
 * notwendigkeit geworden weil ein grid fuer 40 geraete nicht funktioniert, die
 * tabelle war skalierbar)".
 *
 * Warum es tatsaechlich schwach wirkt, laesst sich messen und nicht nur fuehlen.
 * Die Objektspalte der Zeile ist 340 px breit. Darin liegen pro Zeile: Rangzahl
 * 18, Wappen 44, Name 124, Punktzahl 44, dazu vier Abstaende von 10, zweimal 10
 * Polster und der Rahmen. Am 28.08. bei 1440 px nachgemessen: fuer den Balken
 * bleiben 28 PIXEL. Achtundzwanzig. Der laengste Balken der Tabelle ist damit
 * so lang wie das Wappen daneben halb hoch ist, und der kuerzeste ist ein
 * Punkt. Das ist keine Buehne, das ist eine Anzeige, und in derselben Spalte
 * steht in der Zeile darueber das Brett, das ein Gegenstand ist. Deshalb faellt
 * die Zeile ab: nicht weil die Tabelle haesslich waere, sondern weil sie an
 * einer Stelle steht, an der ein Gegenstand erwartet wird, und dafuer viel zu
 * eng ist.
 *
 * Wolfs eigenes Argument ist der Schluessel. Die Tabelle ist bei CrowdQuiz
 * Notwendigkeit, nicht Aushaengeschild. Ein Aushaengeschild darf man zeigen,
 * eine Notwendigkeit erklaert man. Also gehoert an diese Stelle nicht die
 * Tabelle, sondern das, was CrowdQuiz eigentlich ist: acht Fraktionen, denen
 * man beitritt.
 *
 * W1 ist Wolfs Vorschlag genau so, W2 ist derselbe Vorschlag mit dem Rennen
 * darin, W3 ist die Gegenprobe: Tabelle behalten, aber Platz geben.
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

export type CrowdEntwurf = 1 | 2 | 3;

export const CROWD_ENTWUERFE: Record<CrowdEntwurf, { name: string; idee: { de: string; en: string } }> = {
  1: {
    name: 'Flankiert',
    idee: {
      de: 'Wolfs Vorschlag genau so. Keine Tabelle. Der Text steht in der Mitte, die acht Wappen schweben in den Raendern, drei links und fuenf rechts, und driften langsam. Wer auf eines zeigt, bekommt Namen und Spruch. Das ist die ruhigste und die hochwertigste der drei: nichts behauptet einen Stand, nichts zaehlt, es sind acht Zeichen und ein Text. Der Preis ist, dass CrowdQuiz damit sein einziges bewegtes Bild verliert -- das Rennen ist raus, uebrig bleibt Dekoration, wenn auch schoene.',
      en: 'Wolf’s proposal exactly. No table. The text sits in the middle, the eight crests float in the margins, three left and five right, drifting slowly. Point at one and you get its name and motto. The calmest and the most premium of the three: nothing claims a standing, nothing counts, it is eight marks and a text. The price is that CrowdQuiz loses its only moving picture -- the race is gone, what stays is decoration, however handsome.',
    },
  },
  2: {
    name: 'Das Feld',
    idee: {
      de: 'Dieselbe Anordnung, aber die Wappen schweben nicht zufaellig, sondern nach Stand: wer fuehrt, steigt nach oben und wird groesser, wer hinten liegt, sinkt und wird kleiner. Die Rangfolge sortiert sich weiter live um, nur eben ohne Zeilen, ohne Balken und ohne Zahlen. Damit bleibt das Rennen im Bild und die Tabelle ist trotzdem weg. Beim Zeigen kommt zum Spruch der Platz dazu, denn ohne Zahl irgendwo waere die Bewegung nicht lesbar.',
      en: 'The same arrangement, but the crests do not drift at random: they drift by standing. Whoever leads rises and grows, whoever trails sinks and shrinks. The ranking still re-sorts live, only without rows, bars or numbers. The race stays in the picture and the table is still gone. On hover the rank joins the motto, because without a number somewhere the motion would not be readable.',
    },
  },
  3: {
    name: 'Volle Breite',
    idee: {
      de: 'Die Gegenprobe: Tabelle behalten, aber ihr den Platz geben, den sie braucht. Aus drei Spalten werden zwei -- Name und Text schmal links, die Rangfolge nimmt den ganzen Rest. Der Balken waechst damit von 28 auf gemessene 410 px und ist wieder lesbar. Das ist die ehrlichste Fassung -- sie zeigt, was CrowdQuiz kann, naemlich vierzig Teams sortieren -- und die am wenigsten festliche. Wenn die Tabelle Notwendigkeit ist und nicht Aushaengeschild, ist das hier die Fassung, die das zugibt.',
      en: 'The counter-test: keep the table, but give it the room it needs. Three columns become two -- name and text narrow on the left, the ranking takes all the rest. The bar grows from 28 to a measured 410px and is legible again. This is the most honest version -- it shows what CrowdQuiz can do, namely sort forty teams -- and the least festive. If the table is a necessity and not a showpiece, this is the version that admits it.',
    },
  },
};

/**
 * Die Lage der acht Wappen in den Raendern, drei links und fuenf rechts, in
 * Prozent der Flaeche. Von Hand gesetzt und nicht gerechnet: eine Formel
 * verteilt gleichmaessig, und gleichmaessig sieht nach Raster aus statt nach
 * Konstellation. Jede Position traegt ausserdem eine eigene Driftdauer, damit
 * die acht nie im Gleichschritt schweben.
 */
const LAGE = [
  { x: 6, y: 14, gr: 92, s: 11 },
  { x: 17, y: 48, gr: 74, s: 14 },
  { x: 4, y: 79, gr: 82, s: 12.5 },
  { x: 76, y: 8, gr: 78, s: 13 },
  { x: 91, y: 30, gr: 96, s: 10.5 },
  { x: 79, y: 52, gr: 68, s: 15 },
  { x: 93, y: 72, gr: 86, s: 12 },
  { x: 74, y: 92, gr: 72, s: 13.5 },
];

const CSS = `
@keyframes cwSchweb0{0%,100%{transform:translate(-50%,-50%)}50%{transform:translate(-50%,calc(-50% - 14px))}}
@keyframes cwSchweb1{0%,100%{transform:translate(-50%,-50%)}50%{transform:translate(calc(-50% + 10px),calc(-50% + 11px))}}
@media (prefers-reduced-motion:reduce){[data-schwebt]{animation:none!important}}
`;

/** Ein schwebendes Wappen, in beiden Fassungen dasselbe Stueck. */
function Wappen({ f, x, y, gr, s, i, an, zeig, weg }: {
  f: typeof FRAKTIONEN[number]; x: number; y: number; gr: number; s: number;
  i: number; an: boolean; zeig: () => void; weg: () => void;
}) {
  return (
    <button type="button" onMouseEnter={zeig} onMouseLeave={weg} onFocus={zeig} onBlur={weg}
      aria-label={`${f.name} — ${f.motto}`}
      style={sx(`position:absolute;left:${x}%;top:${y}%;padding:0;border:none;background:none;cursor:pointer;`
        + `z-index:${an ? 5 : 2};transition:left 1.6s ${EASE},top 1.6s ${EASE}`)}>
      <span data-schwebt="" style={sx('display:block;'
        + `animation:cwSchweb${i % 2} ${s}s ease-in-out ${(i * 0.7).toFixed(1)}s infinite`)}>
        {/* teammarke() setzt kein display, und ohne display bleibt ein span
            inline: Breite und Hoehe greifen dann nicht und die Kachel ist
            0 mal 0. Der Schein liegt auf einem Kasten darunter statt in
            box-shadow, sonst ueberschriebe er die Kanten der Kachel. */}
        <span style={sx('position:relative;display:block')}>
          <span aria-hidden="true" style={sx('position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);border-radius:50%;pointer-events:none;'
            + `width:${Math.round(gr * 1.5)}px;height:${Math.round(gr * 1.5)}px;background:radial-gradient(circle,${f.color}55,transparent 68%);`
            + `opacity:${an ? 1 : 0};transition:opacity .4s ${EASE}`)}></span>
          <span style={sx('display:block;position:relative;' + teammarke(f.color, `/assets/crest-${f.id}.webp`, gr)
            + `transform:scale(${an ? 1.12 : 1});filter:saturate(${an ? 1.15 : .82}) brightness(${an ? 1.12 : .84});`
            + `transition:transform .4s ${EASE},filter .4s ${EASE},width .9s ${EASE},height .9s ${EASE},background-size .9s ${EASE}`)}></span>
        </span>
      </span>
    </button>
  );
}

/** Die Karte unter dem Text, die Namen und Spruch traegt. Hoehe vorgehalten. */
function Spruch({ f, platz }: { f: typeof FRAKTIONEN[number] | null; platz?: number }) {
  return (
    <div aria-live="polite" style={sx('margin-top:28px;min-height:104px')}>
      <div style={sx('display:flex;align-items:center;gap:18px;padding:16px 20px;border-radius:18px;box-sizing:border-box;max-width:520px;margin:0 auto;'
        + `background:${f ? `linear-gradient(90deg,${f.color}22,rgba(246,239,230,.02))` : 'transparent'};`
        + `border:1px solid ${f ? f.color + '4d' : 'transparent'};`
        + `opacity:${f ? 1 : 0};transform:translateY(${f ? '0' : '6px'});`
        + `transition:opacity .34s ${EASE},transform .34s ${EASE},background .34s ${EASE},border-color .34s ${EASE}`)}>
        <span style={sx('display:block;' + (f ? teammarke(f.color, `/assets/crest-${f.id}.webp`, 66) : 'flex:none;width:66px;height:66px'))}></span>
        <span style={sx('min-width:0;display:flex;flex-direction:column;gap:5px;text-align:left')}>
          <span style={sx(`font-size:12.5px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:${f ? f.color : 'transparent'}`)}>
            {f ? f.name : ' '}{f && platz ? `  ·  Platz ${platz}` : ''}
          </span>
          <span style={sx(`font-size:17px;line-height:1.35;font-weight:600;color:rgba(246,239,230,.86)`)}>{f ? `„${f.motto}“` : ' '}</span>
        </span>
      </div>
    </div>
  );
}

export function Crowd({ mobil, entwurf }: { mobil: boolean; entwurf: CrowdEntwurf }) {
  const [an, setAn] = useState<string | null>(null);
  const [pts, setPts] = useState<Record<string, number>>({});

  // Das Rennen laeuft nur, wo es gebraucht wird: in W2 fuer die Lage der
  // Wappen, in W3 fuer die Balken. In W1 gibt es keinen Stand, also auch
  // keine Uhr.
  useEffect(() => {
    if (entwurf === 1) return;
    const schritt = () => setPts(alt => {
      const neu: Record<string, number> = {};
      for (const f of FRAKTIONEN) neu[f.id] = (alt[f.id] || 0) + Math.round(Math.random() * 9);
      return neu;
    });
    schritt();
    const t = setInterval(schritt, 2600);
    return () => clearInterval(t);
  }, [entwurf]);

  const rang = FRAKTIONEN.slice().sort((a, b) => (pts[b.id] || 0) - (pts[a.id] || 0)).map(f => f.id);
  const gezeigt = FRAKTIONEN.find(f => f.id === an) || null;
  const max = Math.max(1, ...FRAKTIONEN.map(f => pts[f.id] || 0));

  const text = (
    <>
      <p style={sx('margin:0 0 22px;font-size:19px;line-height:1.55;font-weight:500;color:rgba(246,239,230,.82);max-width:52ch;text-wrap:pretty')}>
        Acht Fraktionen, fünf Teams je Fraktion, vier Köpfe je Team. Das sind 160 Leute an einem Abend, und jeder von ihnen spielt auf dem eigenen Handy mit.
      </p>
      <ul style={sx('margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:12px')}>
        {['Kein Spielbrett, ein Rennen der Fraktionen', 'Bis 40 Teams, gewertet wird der Anteil richtiger Antworten', 'Wer beitritt, sucht sich seine Fraktion selbst aus'].map(b => (
          <li key={b} style={sx('display:flex;gap:14px;font-size:15.5px;line-height:1.5;font-weight:600;color:rgba(246,239,230,.7)')}>
            <span style={sx('flex:none;width:18px;height:1px;margin-top:11px;background:#FACC15')}></span>{b}
          </li>
        ))}
      </ul>
    </>
  );

  const name = (
    <div>
      <div style={sx(`font-family:${SPARTAN};font-size:clamp(38px,4vw,58px);font-weight:900;line-height:.9;letter-spacing:-.03em;color:${CREME}`)}>CrowdQuiz</div>
      <div style={sx('margin-top:12px;font-size:12px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;color:rgba(246,239,230,.62)')}>Der grosse Abend</div>
    </div>
  );

  // ── W3: Tabelle, aber breit ────────────────────────────────────────────────
  if (entwurf === 3) {
    return (
      <div style={sx(`max-width:1180px;margin:0 auto;padding:52px 24px;border-top:1px solid ${HAAR};border-bottom:1px solid ${HAAR}`)}>
        <div style={sx(`display:grid;grid-template-columns:${mobil ? '1fr' : '340px 1fr'};gap:52px;align-items:start`)}>
          <div>
            {name}
            <div style={sx('margin-top:30px')}>{text}</div>
            <Spruch f={gezeigt} platz={gezeigt ? rang.indexOf(gezeigt.id) + 1 : undefined} />
          </div>
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
        </div>
      </div>
    );
  }

  // ── W1 und W2: Wappen in den Raendern ─────────────────────────────────────
  // In W2 haengt die Hoehe am Stand: Platz 1 steht bei 8 Prozent, Platz 8 bei
  // 90, dazwischen linear. Die Seite (links/rechts) bleibt fest, sonst
  // flaechen die Wappen quer durchs Bild und man verliert sie aus dem Auge.
  const feld = entwurf === 2;
  return (
    <div style={sx(`max-width:1180px;margin:0 auto;padding:52px 24px;border-top:1px solid ${HAAR};border-bottom:1px solid ${HAAR}`)}>
      <style>{CSS}</style>
      <div style={sx('display:flex;justify-content:center;margin-bottom:6px')}>{name}</div>
      <div style={sx(`position:relative;min-height:${mobil ? '520px' : '440px'};display:flex;align-items:center;justify-content:center`)}
        onMouseLeave={() => setAn(null)}>
        {!mobil && FRAKTIONEN.map((f, i) => {
          const l = LAGE[i];
          const r = rang.indexOf(f.id);
          // In W2 steigt die Groesse mit dem Platz: Fuehrender 104, Letzter 62.
          const gr = feld ? Math.round(104 - (r / 7) * 42) : l.gr;
          const y = feld ? Math.round(8 + (r / 7) * 82) : l.y;
          return <Wappen key={f.id} f={f} x={l.x} y={y} gr={gr} s={l.s} i={i}
            an={an === f.id} zeig={() => setAn(f.id)} weg={() => setAn(null)} />;
        })}
        <div style={sx(`position:relative;z-index:3;width:100%;max-width:${mobil ? '100%' : '520px'};text-align:center`)}>
          <div style={sx('display:flex;flex-direction:column;align-items:center')}>{text}</div>
          <Spruch f={gezeigt} platz={feld && gezeigt ? rang.indexOf(gezeigt.id) + 1 : undefined} />
        </div>
        {mobil && (
          <div style={sx('position:absolute;left:0;right:0;bottom:0;display:flex;flex-wrap:wrap;gap:12px;justify-content:center')}>
            {FRAKTIONEN.map(f => (
              <span key={f.id} style={sx('display:block;' + teammarke(f.color, `/assets/crest-${f.id}.webp`, 54))}></span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
