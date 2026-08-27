/**
 * Das Kapitelsystem: Ueberschriftenstufen, Modulraster, Dichtewelle.
 *
 * Grundlage ist Wolfs Rueckmeldung vom 27.08. samt der fremden Vollanalyse.
 * Bevor daraus etwas gebaut wird, die MESSUNG an der echten Seite bei
 * 1440x780, weil ein Teil der Analyse einen aelteren Stand beschreibt:
 *
 *   Ueberschriften   75, 75, 34, 34, 30, 34, 44 px
 *   Abschnittshoehen alle 780 px, seit jeder Halt einen Bildschirm traegt
 *   Fragen           kein Aufklappen mehr, offen in zwei Spalten
 *   Preis            zweimal genannt, nicht dreimal
 *   Awards           eine Aufzaehlungszeile, kein Block
 *
 * Bestaetigt hat sich davon genau ein Punkt, und es ist derselbe, den Wolf
 * selbst gespuert hat: die Ueberschriften folgen keinem System. Zwei Kapitel
 * rufen mit 75 px, die uebrigen fluestern mit 30 bis 44. Danach faellt die
 * Seite hinter dem Hero ab.
 *
 * Die drei Fassungen unterscheiden sich nur darin, WIE VIEL System es sein
 * soll. Der Inhalt ist in allen dreien derselbe.
 */
import { sx } from '../onepage/sx';
import { CREME, HAAR, SPARTAN } from './stil';

export const KAPITEL_ENTWUERFE = {
  1: {
    name: 'Wie jetzt',
    idee: {
      de: 'Der heutige Stand: 01 und 02 tragen 75 px, 03, 04 und 06 tragen 34, 05 dreissig, 07 vierundvierzig. Haarlinien trennen alles von allem. Die Sektionen sind gleich hoch, aber typografisch passiert nach dem Hero nichts mehr.',
      en: 'Today: 01 and 02 carry 75px, 03, 04 and 06 carry 34, 05 thirty, 07 forty-four. Hairlines separate everything from everything. The sections are equal in height, but typographically nothing happens after the hero.',
    },
  },
  2: {
    name: 'Zwei Stufen',
    idee: {
      de: 'Eine Stufe fuer Kapitel, eine fuer alles darin. Jedes Kapitel bekommt 75 px, jede Zeile darin 34. Sonst aendert sich nichts: keine Module, keine neuen Farbflaechen. Die kleinste moegliche Aenderung, und sie loest den Abfall nach dem Hero schon zur Haelfte.',
      en: 'One step for chapters, one for everything inside. Every chapter gets 75px, every row inside it 34. Nothing else changes: no modules, no new colour fields. The smallest possible change, and it already fixes half the drop after the hero.',
    },
  },
  3: {
    name: 'Kapitel und Module',
    idee: {
      de: 'Zusaetzlich zur Stufe: die Haarlinien zwischen den Kapiteln fallen weg und werden durch Luft ersetzt, 140 px oben und 100 unten. Linien bleiben nur INNERHALB eines Kapitels, wo sie Zeilen trennen. Dazu die Dichtewelle: 01 und 04 dicht, 02 und 05 luftig, 03 und 06 dazwischen. Das ist der Vorschlag.',
      en: 'On top of the step: the hairlines between chapters go and are replaced by air, 140px above and 100 below. Lines remain only INSIDE a chapter, where they separate rows. Plus the density wave: 01 and 04 dense, 02 and 05 airy, 03 and 06 in between. This is the proposal.',
    },
  },
  4: {
    name: 'Ziffer als Anker',
    idee: {
      de: 'Die Kapitelziffer wird zum Bauteil statt zur Beschriftung: 120 px, links neben der Ueberschrift, in der Grundfarbe mit Kontur statt gefuellt. Die Ueberschrift darf dafuer kleiner sein, 48 px, und liest sich leichter. Das ist der architektonische Weg: nicht die Schrift ruft, sondern die Ordnung. Kostet Breite in der linken Spalte.',
      en: 'The chapter number becomes a building block instead of a label: 120px, left of the heading, outlined in the ground colour rather than filled. The heading may then be smaller, 48px, and reads more easily. The architectural route: not the type shouts, but the order does. Costs width in the left column.',
    },
  },
  5: {
    name: 'Farbkapitel',
    idee: {
      de: 'Gar keine Linien, auch nicht innerhalb. Stattdessen traegt jedes Kapitel einen eigenen, sehr dunklen Ton, kaum unterscheidbar einzeln, deutlich im Uebergang. Die Seite bekommt Kapitel, ohne dass ein Strich gezogen wird. Am naechsten an der zweiten Referenz, und das Einzige, was auch ohne Bewegung funktioniert. Risiko: auf schlecht eingestellten Bildschirmen sieht man die Toene nicht.',
      en: 'No lines at all, not even inside. Instead every chapter carries its own very dark hue, barely distinguishable alone, clear at the transition. The page gains chapters without a single rule being drawn. Closest to the second reference, and the only one that works without motion. Risk: on badly calibrated screens the hues are invisible.',
    },
  },
} as const;
export type KapitelEntwurf = keyof typeof KAPITEL_ENTWUERFE;

const KAPITEL = [
  { nr: '01', h2: 'Zwei Modi, ein Abend', dichte: 'dicht', zeilen: ['CozyQuiz · bis 40 Personen', 'CrowdQuiz · ab 40 Personen'] },
  { nr: '02', h2: 'Für welchen Anlass?', dichte: 'luftig', zeilen: ['Firmenfeier', 'Geburtstag', 'Kneipenabend'] },
  { nr: '03', h2: 'So spielt ihr am Handy mit', dichte: 'mittel', zeilen: ['Fünf Fragetypen, eine Runde'] },
  { nr: '04', h2: 'Mehr als eine freie Wand braucht ihr nicht', dichte: 'dicht', zeilen: ['Die Leinwand', 'Ihr braucht · Ich bringe mit'] },
  { nr: '05', h2: 'Über mich', dichte: 'luftig', zeilen: ['Johannes, Foto und Zitat'] },
  { nr: '06', h2: 'Häufige Fragen', dichte: 'mittel', zeilen: ['Sechs Fragen in zwei Spalten'] },
  { nr: '07', h2: 'Lust auf ein Quiz?', dichte: 'dicht', zeilen: ['Zwei Wege', 'Das Formular'] },
];

// Die heutigen Groessen, gemessen, nicht geschaetzt.
const HEUTE: Record<string, number> = { '01': 75, '02': 75, '03': 34, '04': 34, '05': 30, '06': 34, '07': 44 };
const LUFT: Record<string, [number, number]> = { dicht: [96, 72], mittel: [120, 88], luftig: [148, 108] };
// Fassung 5: je Kapitel ein eigener sehr dunkler Ton. Einzeln kaum zu
// unterscheiden, im Uebergang deutlich. Alle liegen dicht am Grund #0A0814.
const TOENE: Record<string, string> = {
  '01': '#0d0a1a', '02': '#0a0c18', '03': '#090e19', '04': '#080f14',
  '05': '#100c12', '06': '#0b0a16', '07': '#110b16',
};

export function Kapitel({ mobil, entwurf }: { mobil: boolean; entwurf: KapitelEntwurf }) {
  const stufen = entwurf === 1;
  const module = entwurf === 3 || entwurf === 5;
  const ziffer = entwurf === 4;
  const farbe = entwurf === 5;
  return (
    <section style={sx(`max-width:1180px;margin:0 auto;padding:${mobil ? '20px 20px 60px' : '30px 32px 90px'}`)}>
      {KAPITEL.map((k, i) => {
        const gr = stufen ? HEUTE[k.nr] : 75;
        const [oben, unten] = module ? LUFT[k.dichte] : [56, 56];
        return (
          <div key={k.nr} style={sx(`padding:${mobil ? Math.round(oben * .55) : oben}px ${farbe ? (mobil ? '20px' : '40px') : '0'} ${mobil ? Math.round(unten * .55) : unten}px;`
            + (farbe ? `background:${TOENE[k.nr]};margin:0 ${mobil ? '-20px' : '-40px'};` : '')
            // Fassungen 3 und 5: keine Linie ZWISCHEN Kapiteln, nur Luft
            // beziehungsweise nur der Tonwechsel.
            + (module || i === 0 ? '' : `border-top:1px solid ${HAAR};`))}>
            <div style={sx('display:flex;align-items:baseline;gap:14px;margin-bottom:18px')}>
              {!ziffer && <span style={sx('font-size:11.5px;font-weight:900;letter-spacing:.2em;color:rgba(246,239,230,.45)')}>[ {k.nr} ]</span>}
              {module && (
                <span style={sx('font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:rgba(246,239,230,.3)')}>{k.dichte}</span>
              )}
            </div>
            {/* Fassung 4: die Ziffer traegt, die Ueberschrift folgt. */}
            <div style={sx(`display:flex;align-items:${ziffer ? 'flex-start' : 'baseline'};gap:${ziffer ? (mobil ? '18px' : '30px') : '0'}`)}>
              {ziffer && (
                <span aria-hidden="true" style={sx(`flex:none;font-family:${SPARTAN};font-size:${mobil ? 62 : 120}px;font-weight:900;line-height:.78;`
                  + 'color:transparent;-webkit-text-stroke:1.5px rgba(246,239,230,.28);letter-spacing:-.04em')}>{k.nr}</span>
              )}
              <h2 style={sx(`margin:0 0 ${module ? 34 : 22}px;font-family:${SPARTAN};font-weight:900;line-height:.94;letter-spacing:-.03em;color:${CREME};`
                + `font-size:${mobil ? Math.round((ziffer ? 48 : gr) * .52) : (ziffer ? 48 : gr)}px;text-wrap:balance;max-width:${gr > 50 ? '18ch' : '30ch'}`)}>{k.h2}</h2>
            </div>
            {/* Die Zeilen innerhalb eines Kapitels behalten ihre Haarlinie:
                dort trennt sie Gleichartiges, und genau das ist ihre Aufgabe. */}
            {k.zeilen.map(z => (
              <div key={z} style={sx(`padding:${module ? 18 : 13}px 0;`
                + (farbe ? '' : `border-top:1px solid ${HAAR};`)
                + `font-size:${stufen ? 16 : 18}px;font-weight:700;color:rgba(246,239,230,.7)`)}>{z}</div>
            ))}
          </div>
        );
      })}
    </section>
  );
}
