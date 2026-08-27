/**
 * Vier Farbsaetze fuer das Brett in Station 01, zum Nebeneinanderlegen.
 *
 * 2026-08-27, Wolf: "gerne andere farben zu den avataren (vlt passender hast
 * du ideen, oder mockup?)". Der Anlass ist im Bildschirmfoto gut zu sehen:
 * die rote Erdbeere sitzt auf gruenen Kacheln, also genau auf ihrer
 * Gegenfarbe, und das flimmert. Das cremefarbene Boot wiederum sitzt auf dem
 * Rot, das der Erdbeere zustuende.
 *
 * Alle Farben stammen weiter aus QQ_BOARD_PALETTE der App, es wird also nur
 * die Zuordnung getauscht, keine neue Farbe erfunden. Die Palette:
 * #EF4444 rot, #F97316 orange, #FACC15 gelb, #22C55E gruen, #06B6D4 cyan,
 * #3B82F6 blau, #A855F7 lila, #EC4899 pink.
 *
 * Der Endstand ist derselbe wie auf der Seite, damit man wirklich nur die
 * Farbe vergleicht und nicht die Verteilung.
 */
import { sx } from '../onepage/sx';
import { KACHEL_VERLAUF, motivAnteil } from '../../qqKachel';
import { CREME, HAAR } from './stil';

const DONUT = '/assets/av-qq-donut.webp';
const ERDBEERE = '/assets/av-qq-strawberry.webp';
const BOOT = '/assets/av-qq-paper-boat.webp';

export const BRETT_FARBEN = {
  1: {
    name: 'Wie jetzt',
    farben: { d: '#3B82F6', s: '#22C55E', b: '#EF4444' },
    idee: {
      de: 'Der heutige Stand: Palettenplatz 0, 3 und 5. Maximal weit auseinander, aber die rote Erdbeere steht auf ihrer Gegenfarbe Gruen, und das cremefarbene Boot bekommt das Rot.',
      en: 'What is live today: palette slots 0, 3 and 5. As far apart as possible, but the red strawberry sits on its complementary green, and the cream boat gets the red.',
    },
  },
  2: {
    name: 'Nach Motiv',
    farben: { d: '#EC4899', s: '#EF4444', b: '#3B82F6' },
    idee: {
      de: 'Jede Kachel bekommt den Ton, den ihr Motiv ohnehin traegt: rosa Glasur auf Pink, Erdbeere auf Rot, Papierboot auf Blau, also Boot auf Wasser. Kachel und Motiv wirken wie ein Stueck. Der Einwand steht in der App selbst: pink und rot nebeneinander sind auf einem Brett schwer zu trennen, genau davor warnt der Kommentar an QQ_BOARD_PALETTE.',
      en: 'Every tile takes the hue its motif already carries: pink glaze on pink, strawberry on red, paper boat on blue, boat on water. Tile and motif read as one piece. The objection is written in the app itself: pink and red side by side are hard to tell apart on a board, which is exactly what the comment on QQ_BOARD_PALETTE warns about.',
    },
  },
  3: {
    name: 'Kuehl gegen warm',
    farben: { d: '#A855F7', s: '#3B82F6', b: '#22C55E' },
    idee: {
      de: 'Die beiden warmen Motive bekommen kuehle Kacheln, das neutrale Boot die einzige warme Flaeche. Rosa auf Lila ist eine Familie, Rot auf Blau ist Kontrast ohne Flimmern, Creme auf Gruen leuchtet. Drei weit auseinanderliegende Palettenplaetze, also auch auf dem Beamer sicher zu trennen.',
      en: 'The two warm motifs get cool tiles, the neutral boat the only lively surface. Pink on purple is a family, red on blue is contrast without vibration, cream on green glows. Three widely spaced palette slots, so still safe to tell apart on a projector.',
    },
  },
  4: {
    name: 'Dunkel und ruhig',
    farben: { d: '#A855F7', s: '#06B6D4', b: '#F97316' },
    idee: {
      de: 'Wie drei, nur mit Cyan statt Blau und Orange statt Gruen. Cyan hat unter der Erdbeere mehr Abstand als Blau, Orange unter dem Boot passt zum Pappton des Papiers. Insgesamt der waermste Satz, und der, der dem Hero am naechsten steht.',
      en: 'Like three, with cyan instead of blue and orange instead of green. Cyan gives the strawberry more distance than blue does, and orange under the boat matches the cardboard tone of the paper. The warmest set overall, and the closest to the hero.',
    },
  },
} as const;
export type BrettFarbe = keyof typeof BRETT_FARBEN;

/** Endstand aus PRESET + MOVES der Seite, 15 von 25 Feldern. */
const BESITZ: (string | null)[] = [
  'd', 'd', null, 's', 's',
  'd', 'd', null, 's', 's',
  'd', null, null, null, 's',
  'b', 'b', null, null, null,
  'b', 'b', 'b', null, null,
];
const GS = 5;
const AV: Record<string, string> = { d: DONUT, s: ERDBEERE, b: BOOT };

function Brett({ farben, cs }: { farben: Record<string, string>; cs: number }) {
  const gap = 4;                       // fest, wie in CozyQuizGridDisplay
  const rad = Math.max(4, Math.round(cs * 0.16));
  const at = (r: number, c: number) => (r < 0 || c < 0 || r >= GS || c >= GS) ? null : BESITZ[r * GS + c];
  return (
    <div style={sx(`padding:10px;border-radius:16px;background:rgba(246,239,230,.04);border:1px solid ${HAAR};`
      + `display:grid;grid-template-columns:repeat(${GS},${cs}px);gap:${gap}px`)}>
      {BESITZ.map((id, i) => {
        const r = Math.floor(i / GS), c = i % GS;
        const basis = `width:${cs}px;height:${cs}px;box-sizing:border-box;display:block;`;
        if (!id) return (
          <span key={i} style={sx(basis + `border-radius:${rad}px;background:rgba(246,239,230,.05);border:1px solid rgba(246,239,230,.18)`)}></span>
        );
        const nT = at(r - 1, c) === id, nR = at(r, c + 1) === id;
        const nB = at(r + 1, c) === id, nL = at(r, c - 1) === id;
        const ecke = (a: boolean, b: boolean) => (a || b) ? 0 : rad;
        const av = AV[id];
        return (
          <span key={i} style={sx(basis
            + `border-radius:${ecke(nT, nL)}px ${ecke(nT, nR)}px ${ecke(nB, nR)}px ${ecke(nB, nL)}px;`
            + `background-image:url(${av}),${KACHEL_VERLAUF};background-color:${farben[id]};`
            + `background-size:${Math.round(motivAnteil(av) * 100)}% auto,auto;`
            + 'background-position:center,center;background-repeat:no-repeat,no-repeat;'
            + [
              nT ? '' : 'inset 0 1px 0 rgba(255,255,255,.38)',
              nL ? '' : 'inset 2px 0 0 rgba(255,255,255,.07)',
              nR ? '' : 'inset -2px 0 0 rgba(0,0,0,.18)',
              nB ? '' : '0 3px 4px rgba(0,0,0,.42)',
            ].filter(Boolean).join(',').replace(/^/, 'box-shadow:'))}></span>
        );
      })}
    </div>
  );
}

export function BrettFarben({ mobil, entwurf }: { mobil: boolean; entwurf: BrettFarbe }) {
  const cs = mobil ? 46 : 74;
  const satz = BRETT_FARBEN[entwurf];
  return (
    <section style={sx(`max-width:1240px;margin:0 auto;padding:${mobil ? '30px 22px 50px' : '46px 40px 80px'}`)}>
      <div style={sx(`display:flex;flex-wrap:wrap;gap:${mobil ? '26px' : '46px'};align-items:flex-start`)}>
        <Brett farben={satz.farben} cs={cs} />
        <div style={sx('flex:1;min-width:260px')}>
          <div style={sx(`margin-bottom:14px;font-size:19px;font-weight:900;color:${CREME}`)}>{satz.name}</div>
          {(['d', 's', 'b'] as const).map(k => (
            <div key={k} style={sx('display:flex;align-items:center;gap:12px;padding:9px 0;border-top:1px solid ' + HAAR)}>
              <span style={sx(`width:34px;height:34px;flex:none;border-radius:6px;background-color:${satz.farben[k]};`
                + `background-image:url(${AV[k]}),${KACHEL_VERLAUF};background-size:${Math.round(motivAnteil(AV[k]) * 100)}% auto,auto;`
                + 'background-position:center,center;background-repeat:no-repeat,no-repeat;'
                + 'box-shadow:inset 0 1px 0 rgba(255,255,255,.38),0 2px 3px rgba(0,0,0,.42)')}></span>
              <span style={sx(`font-size:15px;font-weight:800;color:${CREME}`)}>
                {k === 'd' ? 'Donut' : k === 's' ? 'Erdbeere' : 'Papierboot'}
              </span>
              <span style={sx('font-size:13.5px;font-weight:700;letter-spacing:.06em;color:rgba(246,239,230,.6);font-variant-numeric:tabular-nums')}>{satz.farben[k]}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
