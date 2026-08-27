/**
 * Vier Fassungen fuer die Rangfolge in Station 01, Zeile CrowdQuiz.
 *
 * 2026-08-27, Wolf: "der tabelle unten auch eine umrandung geben, leuchten je
 * nach team das fuehrt wie oben und als test die tabelle unten nach links
 * machen und leicht hochschieben".
 *
 * Zwei Ideen, die sich unabhaengig voneinander an- und abschalten lassen,
 * deshalb vier Fassungen statt zwei: so laesst sich sehen, was der Rahmen
 * allein macht und was die Verschiebung allein macht.
 *
 * Der Rahmen ist derselbe wie am Brett darueber (frameStyle in OnePage):
 * 2 px Linie in der Farbe der fuehrenden Seite, warmer Schein nach aussen,
 * kalter nach innen. Am Brett zeigt er, wer gerade am Zug ist. Hier zeigt er,
 * wer fuehrt, also dieselbe Aussage in derselben Form.
 */
import { useEffect, useState } from 'react';
import { sx } from '../onepage/sx';
import { teammarke, KACHEL_VERLAUF } from '../../qqKachel';
import { CREME, HAAR } from './stil';

const FACTIONS = [
  { id: 'bauchgefuehl', color: '#F97316', name: 'Bauchgefühl' },
  { id: 'glueckstreffer', color: '#22C55E', name: 'Glückstreffer' },
  { id: 'allwissen', color: '#FACC15', name: 'Allwissen' },
  { id: 'improvisation', color: '#3B82F6', name: 'Improvisation' },
  { id: 'feierabend', color: '#14B8A6', name: 'Feierabend' },
  { id: 'letztesekunde', color: '#A855F7', name: 'Letzte Sekunde' },
  { id: 'einspruch', color: '#EC4899', name: 'Einspruch' },
  { id: 'risiko', color: '#EF4444', name: 'Risiko' },
];

export const ARENA_ENTWUERFE = {
  1: {
    name: 'Wie jetzt',
    rahmen: false, links: false, wappen: 'normal',
    idee: {
      de: 'Der heutige Stand: die Rangfolge steht frei in der Spalte, rechtsbuendig wie das Brett darueber, ohne Rahmen. Ruhig, aber die Zeile CrowdQuiz hat damit kein Gegenstueck zum gerahmten Brett in der Zeile darueber.',
      en: 'What is live today: the ranking sits free in its column, right-aligned like the board above, with no frame. Calm, but the CrowdQuiz row then has no counterpart to the framed board in the row above.',
    },
  },
  2: {
    name: 'Mit Rahmen',
    rahmen: true, links: false, wappen: 'normal',
    idee: {
      de: 'Derselbe Rahmen wie am Brett: 2 px in der Farbe der fuehrenden Fraktion, Schein nach aussen. Wechselt die Fuehrung, wechselt die Farbe. Beide Zeilen tragen damit dasselbe Zeichen, und man sieht die Fuehrung schon aus dem Augenwinkel.',
      en: 'The same frame as the board: 2px in the leading faction’s colour, glowing outward. When the lead changes, the colour changes. Both rows then carry the same mark, and the lead is visible out of the corner of your eye.',
    },
  },
  3: {
    name: 'Nach links, etwas hoch',
    rahmen: false, links: true, wappen: 'normal',
    idee: {
      de: 'Wolfs Test: die Tabelle linksbuendig in ihrer Spalte und 24 px hoeher. Sie ruecht damit naeher an den Text und bricht die strenge rechte Kante, die Brett und Tabelle heute teilen. Ohne Rahmen wirkt sie dabei eher wie ein Teil des Textes als wie ein eigenes Bild.',
      en: 'Wolf’s test: the table left-aligned in its column and 24px higher. It moves closer to the text and breaks the strict right edge that board and table share today. Without a frame it then reads as part of the text rather than as its own picture.',
    },
  },
  4: {
    name: 'Beides',
    rahmen: true, links: true, wappen: 'normal',
    idee: {
      de: 'Rahmen und Verschiebung zusammen. Der Rahmen haelt sie als eigenes Bild zusammen, die Verschiebung nimmt der Spalte die Strenge. Von den vieren die lebendigste, und die einzige, bei der Brett und Tabelle nicht mehr wie zwei Kacheln auf derselben Linie stehen.',
      en: 'Frame and shift together. The frame holds it together as its own picture, the shift takes the rigidity out of the column. The liveliest of the four, and the only one where board and table no longer sit like two tiles on one line.',
    },
  },
  5: {
    name: 'Wappen groesser',
    rahmen: true, links: false, wappen: 'gross',
    idee: {
      de: 'Wolf am 27.08.: "die wappen sind etwas klein in der arena". Der einfachste Weg: die Zeile waechst von 37 auf 46 px, das Wappen von 30 auf 42. Die Tabelle wird damit 68 px hoeher als heute. Nichts springt, nichts muss man suchen, man sieht die Zeichen einfach. Der Preis ist die Hoehe, und Hoehe ist knapp, wenn jeder Abschnitt auf einen Bildschirm soll.',
      en: 'Wolf on 27 Aug: “the crests are a bit small in the arena”. The simplest route: the row grows from 37 to 46px, the crest from 30 to 42. The table ends up 68px taller than today. Nothing jumps, nothing has to be hunted for, you simply see the marks. The cost is height, and height is scarce if every section should fit one screen.',
    },
  },
  6: {
    name: 'Wappen springt vor',
    rahmen: true, links: false, wappen: 'sprung',
    idee: {
      de: 'Das Wappen bleibt klein und waechst beim Zeigen auf mehr als das Doppelte, ueber die Zeile hinaus, mit Schatten. Kostet keine Hoehe und belohnt das Zeigen, das die Zeile ohnehin schon traegt. Nachteil: wer nicht mit der Maus hingeht, sieht die Zeichen nie gross, und auf dem Handy gibt es kein Zeigen.',
      en: 'The crest stays small and grows to more than double on hover, out beyond the row, with a shadow. Costs no height and rewards the hover the row already carries. Downside: anyone who does not hover never sees the marks large, and on a phone there is no hover.',
    },
  },
  7: {
    name: 'Gross in der Karte',
    rahmen: true, links: false, wappen: 'karte',
    idee: {
      de: 'Die Zeile bleibt, wie sie ist, dafuer zeigt die Spruchkarte darunter das Wappen gross, 76 statt 42 px. Die Karte hat die Hoehe ohnehin vorgehalten, es kostet also nichts. Zeigen fuehrt damit zu einem Bild statt nur zu einer Zeile, und der Slogan bekommt endlich ein Gegengewicht.',
      en: 'The row stays as it is; instead the motto card below shows the crest large, 76 instead of 42px. The card already reserves that height, so it costs nothing. Hovering then yields a picture rather than just a line, and the motto finally gets a counterweight.',
    },
  },
} as const;
export type ArenaEntwurf = keyof typeof ARENA_ENTWUERFE;

const EASE = 'cubic-bezier(.22,1,.36,1)';
// Woertlich aus QQ_MEGA_FACTIONS der App.
const SPRUCH: Record<string, string> = {
  bauchgefuehl: 'Erster Gedanke, bester Gedanke.',
  glueckstreffer: 'Hauptsache richtig.',
  allwissen: 'Wir wussten das.',
  improvisation: 'Läuft schon irgendwie.',
  feierabend: 'Hauptsache gemütlich.',
  letztesekunde: 'Ging sich noch aus.',
  einspruch: 'Das zählt so nicht.',
  risiko: 'Alles oder nichts.',
};

export function ArenaTabelle({ mobil, entwurf }: { mobil: boolean; entwurf: ArenaEntwurf }) {
  const f = ARENA_ENTWUERFE[entwurf];
  const [pts, setPts] = useState<Record<string, number>>(() => {
    const p: Record<string, number> = {};
    FACTIONS.forEach((x, i) => { p[x.id] = 800 - i * 60; });
    return p;
  });

  // Die Rangfolge muss sich bewegen, sonst laesst sich nicht beurteilen, ob
  // der mitwandernde Rahmen unruhig wirkt. Feste Schrittfolge statt Zufall:
  // im Mockup soll jeder Durchlauf gleich aussehen.
  useEffect(() => {
    const schritte = [3, 5, 1, 7, 0, 4, 2, 6, 5, 3];
    let n = 0;
    const t = setInterval(() => {
      const wer = FACTIONS[schritte[n % schritte.length]].id;
      n += 1;
      setPts(p => ({ ...p, [wer]: (p[wer] || 0) + 120 }));
    }, 2000);
    return () => clearInterval(t);
  }, []);

  const [hov, setHov] = useState<string | null>(null);
  const gross = f.wappen === 'gross';
  const WP = gross ? 42 : 30;                       // Kachelkante des Wappens
  const HOEHE = (mobil ? 260 : 300) + (gross ? 68 : 0);
  const rang = FACTIONS.slice().sort((a, b) => pts[b.id] - pts[a.id]);
  const fuehrt = rang[0];
  const max = Math.max(1, ...FACTIONS.map(x => pts[x.id]));
  const H = 100 / FACTIONS.length;

  const tabelle = (
    <div style={sx(`position:relative;height:${HOEHE}px;width:100%`)}>
      {FACTIONS.map(x => {
        const r = rang.findIndex(y => y.id === x.id);
        return (
          <div key={x.id}
            onMouseEnter={() => setHov(x.id)} onMouseLeave={() => setHov(null)}
            style={sx(`position:absolute;left:0;right:0;top:0;height:${H}%;display:flex;align-items:center;gap:10px;`
            + `padding:0 10px;box-sizing:border-box;transform:translateY(${r * 100}%);transition:transform 1.5s ${EASE};`
            + `z-index:${hov === x.id ? 3 : 1}`)}>
            <span style={sx(`flex:none;width:18px;text-align:center;font-size:15px;font-weight:900;color:${r === 0 ? CREME : 'rgba(246,239,230,.5)'}`)}>{r + 1}</span>
            <span style={sx(teammarke(x.color, `/assets/crest-${x.id}.webp`, WP)
              + `transform:scale(${f.wappen === 'sprung' && hov === x.id ? 2.2 : 1});transform-origin:center left;`
              + `${f.wappen === 'sprung' && hov === x.id ? 'box-shadow:0 14px 28px rgba(0,0,0,.6);' : ''}`
              + `transition:transform .3s ${EASE},box-shadow .3s ${EASE}`)}></span>
            <span style={sx(`flex:none;width:124px;font-size:13.5px;font-weight:900;line-height:1.15;color:${x.color};white-space:nowrap;overflow:hidden;text-overflow:ellipsis`)}>{x.name}</span>
            <span style={sx('flex:1;min-width:0;height:12px;border-radius:6px;background:rgba(246,239,230,.06);box-shadow:inset 0 1px 2px rgba(0,0,0,.4);overflow:hidden;display:block')}>
              <span style={sx(`display:block;height:100%;width:${Math.round((pts[x.id] / max) * 100)}%;border-radius:6px;`
                + `background:${KACHEL_VERLAUF},${x.color};`
                + 'box-shadow:inset 0 1px 0 rgba(255,255,255,.38),inset -2px 0 0 rgba(0,0,0,.18),0 2px 3px rgba(0,0,0,.42);'
                + `transition:width 1.8s ${EASE}`)}></span>
            </span>
            <span style={sx(`flex:none;width:44px;text-align:right;font-size:15px;font-weight:900;color:${x.color};font-variant-numeric:tabular-nums`)}>{pts[x.id]}</span>
          </div>
        );
      })}
    </div>
  );

  // Derselbe Rahmen wie am Brett darueber, nur dass die Farbe hier von der
  // fuehrenden Seite kommt und nicht von der Seite am Zug.
  const hovF = FACTIONS.find(x => x.id === hov) || null;
  const rahmen = `padding:8px;border-radius:14px;background:rgba(246,239,230,.015);`
    + `border:2px solid ${fuehrt.color};box-shadow:0 0 36px ${fuehrt.color}55, inset 0 0 30px ${fuehrt.color}14;`
    + `transition:border-color .8s ${EASE},box-shadow .8s ${EASE}`;

  return (
    <section style={sx(`max-width:1180px;margin:0 auto;padding:${mobil ? '30px 22px 60px' : '60px 32px 90px'}`)}>
      <div style={sx(`display:grid;grid-template-columns:${mobil ? '1fr' : '290px 1fr 340px'};gap:48px;align-items:start;`
        + `padding:52px 0;border-top:1px solid ${HAAR};border-bottom:1px solid ${HAAR}`)}>
        <div>
          <div style={sx("font-family:'League Spartan',sans-serif;font-size:clamp(38px,4vw,58px);font-weight:900;line-height:.9;letter-spacing:-.03em;color:" + CREME)}>CrowdQuiz</div>
          <div style={sx('margin-top:12px;font-size:12px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;color:rgba(246,239,230,.62)')}>Ab 40 Personen</div>
        </div>
        <div>
          <p style={sx('margin:0 0 26px;font-size:19px;line-height:1.55;font-weight:500;color:rgba(246,239,230,.82);max-width:56ch')}>
            Ihr spielt wie im CozyQuiz in Teams an einem Handy, nur gehört jedes Team zu einer von acht Fraktionen. Frage für Frage wächst der Balken jeder Seite.
          </p>
          <div style={sx('font-size:14px;font-weight:700;color:rgba(246,239,230,.5)')}>
            Führt gerade: <span style={sx(`color:${fuehrt.color};font-weight:900`)}>{fuehrt.name}</span>
          </div>
        </div>
        <div style={sx(`min-width:0;display:flex;justify-content:${f.links ? 'flex-start' : 'flex-end'};`
          + `margin-top:${f.links ? '-24px' : '0'};transition:margin-top .5s ${EASE}`)}>
          <div style={sx('width:100%')}>
            <div style={sx(`${f.rahmen ? rahmen : 'padding:8px;border:2px solid transparent'}`)}>
              {tabelle}
            </div>
            {/* Die Spruchkarte, wie auf der Seite. In Fassung 7 traegt sie das
                Wappen gross, weil die Hoehe dort ohnehin vorgehalten ist. */}
            <div style={sx(`margin-top:16px;min-height:${f.wappen === 'karte' ? 108 : 82}px`)}>
              <div style={sx('display:flex;align-items:center;gap:14px;padding:14px 16px;border-radius:16px;box-sizing:border-box;'
                + `background:${hovF ? `linear-gradient(90deg,${hovF.color}1f,rgba(246,239,230,.02))` : 'transparent'};`
                + `border:1px solid ${hovF ? hovF.color + '4d' : 'transparent'};`
                + `opacity:${hovF ? 1 : 0};transition:opacity .34s ${EASE},background .34s ${EASE},border-color .34s ${EASE}`)}>
                <span style={sx(hovF ? teammarke(hovF.color, `/assets/crest-${hovF.id}.webp`, f.wappen === 'karte' ? 76 : 42) : 'flex:none;width:42px;height:42px')}></span>
                <span style={sx('min-width:0;display:flex;flex-direction:column;gap:3px')}>
                  <span style={sx(`font-size:12px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:${hovF ? hovF.color : 'transparent'}`)}>{hovF ? hovF.name : '\u00a0'}</span>
                  <span style={sx('font-size:15.5px;line-height:1.4;font-weight:600;color:rgba(246,239,230,.82)')}>{hovF ? `\u201e${SPRUCH[hovF.id]}\u201c` : '\u00a0'}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
