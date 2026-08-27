/**
 * Mockups — Entwurfsvergleich fuer die Stationen unterhalb des Heros.
 *
 * 2026-08-27. Wolf zum aktuellen Stand: "der obere part gefaellt mir super,
 * vlt koennen wir den als grundrahmen nehmen fuer die website? alle weiteren
 * sachen sind so hmm ehrlich gesagt ... vlt 3-4 mockups fuer die einzelnen
 * stationen bauen und dann gemeinsam waehlen?"
 *
 * Diese Seite ist Werkzeug, nicht Produkt. Sie ist nicht verlinkt, steht auf
 * noindex und faellt raus, sobald die Handschrift gewaehlt ist.
 *
 * Verglichen werden nicht sieben Stationen mal vier Entwuerfe, sondern DREI
 * HANDSCHRIFTEN an EINER Station (01 Die Spielarten). Die Handschrift gilt
 * danach fuer die ganze Seite, deshalb entscheidet sie sich guenstiger an
 * einer Station als an sieben.
 *
 * Alle drei bedienen dieselben fuenf Regeln, die den Hero tragen:
 *   1. Die Schrift ist das Bild (League Spartan, gross, eng).
 *   2. Kacheln sind die einzige Bildsprache. Keine Fotos, keine Icon-Kreise.
 *   3. Flacher dunkler Grund, viel Luft, ein Akzent.
 *   4. Bewegung nur, wo sie etwas bedeutet.
 *   5. Nichts wechselt von allein, und nichts verrutscht.
 *
 * Texte kommen unveraendert aus onepage/texts.ts, damit der Vergleich ueber
 * die Form geht und nicht ueber neue Formulierungen.
 */
import { useState } from 'react';
import { useLang, setLang } from '../lang';
import { sx } from './onepage/sx';
import { onePageT } from './onepage/texts';
import { KACHEL_VERLAUF, kachel, motivAnteil, teammarke } from '../qqKachel';

const CREME = '#F6EFE6';
const GRUND = '#0A0814';
const SPARTAN = "'League Spartan',sans-serif";
const HAAR = 'rgba(246,239,230,.14)';
const EASE = 'cubic-bezier(.22,1,.36,1)';

// Die Objekte des Quiz-Modus: fuenf Teams, wie auf dem Brett.
const TEAM_OBJ = [
  { av: '/assets/av-qq-treasure-chest.webp', farbe: '#F97316' },
  { av: '/assets/av-qq-crystal-ball.webp', farbe: '#A855F7' },
  { av: '/assets/av-qq-mushroom.webp', farbe: '#22C55E' },
  { av: '/assets/av-qq-game-die.webp', farbe: '#FACC15' },
  { av: '/assets/av-qq-table-lamp.webp', farbe: '#3B82F6' },
];
// Die Objekte des Arena-Modus: acht Fraktionswappen.
const FRAKT_OBJ = [
  { av: '/assets/crest-bauchgefuehl.webp', farbe: '#F97316' },
  { av: '/assets/crest-glueckstreffer.webp', farbe: '#22C55E' },
  { av: '/assets/crest-allwissen.webp', farbe: '#FACC15' },
  { av: '/assets/crest-improvisation.webp', farbe: '#3B82F6' },
  { av: '/assets/crest-feierabend.webp', farbe: '#14B8A6' },
  { av: '/assets/crest-letztesekunde.webp', farbe: '#A855F7' },
  { av: '/assets/crest-einspruch.webp', farbe: '#EC4899' },
  { av: '/assets/crest-risiko.webp', farbe: '#EF4444' },
];

const FRAKT_IDS = FRAKT_OBJ.map(o => o.av.replace('/assets/crest-', '').replace('.webp', ''));

type Modus = {
  name: string; chip: string; calm: string; lead: string;
  bullets: string[]; objekte: typeof TEAM_OBJ; akzent: string;
};

const HANDSCHRIFTEN = {
  A: {
    name: 'Die Leinwand',
    idee: {
      de: 'Jede Station ist ein Beamerbild. Name riesig, Text daneben, ein Objekt rechts. Keine Karten, keine Kaesten, nur Haarlinien. Am naechsten am Hero.',
      en: 'Every station is a projected image. Huge name, text beside it, one object on the right. No cards, no boxes, just hairlines. Closest to the hero.',
    },
  },
  B: {
    name: 'Das Spielfeld',
    idee: {
      de: 'Der Abschnitt ist selbst ein Brett. Jeder Inhalt sitzt in einer Kachel, im Raster, wie im Spiel. Am eigensten, am riskantesten bei viel Text.',
      en: 'The section is a board itself. Every piece of content sits in a tile, in a grid, like in the game. Most ownable, riskiest where there is a lot of text.',
    },
  },
  C: {
    name: 'Die Runde',
    idee: {
      de: 'Eine duenne Linie laeuft durch die Seite, die Objekte haengen als Marker daran. Ruhig, sehr lesbar, fuehrt geradeaus zum Formular. Am bravsten.',
      en: 'A thin line runs down the page, the objects hang off it as markers. Calm, very readable, leads straight to the form. Tamest of the three.',
    },
  },
} as const;
type Brief = keyof typeof HANDSCHRIFTEN;

export default function Mockups() {
  const lang = useLang();
  const L = onePageT(lang);
  const [brief, setBrief] = useState<Brief>('A');
  const [mobil, setMobil] = useState(false);

  const modi: Modus[] = [
    {
      name: 'CozyQuiz', chip: L.modes.quizChip, calm: L.modes.quizCalm, lead: L.modes.quizLead,
      bullets: L.modes.quizBullets, objekte: TEAM_OBJ, akzent: '#FA4BA3',
    },
    {
      name: 'CozyArena', chip: L.modes.arenaChip, calm: L.modes.arenaCalm, lead: L.modes.arenaLead,
      bullets: L.modes.arenaBullets, objekte: FRAKT_OBJ, akzent: '#FFC7E4',
    },
  ];

  const inhalt = brief === 'A' ? <LeinwandA L={L} modi={modi} mobil={mobil} />
    : brief === 'B' ? <SpielfeldB L={L} modi={modi} mobil={mobil} />
      : <RundeC L={L} modi={modi} mobil={mobil} />;

  return (
    <div style={sx(`min-height:100dvh;background:${GRUND};color:${CREME};font-family:'Bricolage Grotesque',system-ui,sans-serif`)}>
      <style>{MOCKUP_CSS}</style>

      <header style={sx(`position:sticky;top:0;z-index:20;background:rgba(10,8,20,.92);backdrop-filter:blur(14px);border-bottom:1px solid ${HAAR}`)}>
        <div style={sx('max-width:1240px;margin:0 auto;padding:14px 24px;display:flex;align-items:center;gap:20px;flex-wrap:wrap')}>
          <span style={sx(`font-family:${SPARTAN};font-size:15px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:rgba(246,239,230,.62)`)}>
            Station 01, Die Spielarten
          </span>
          <span style={sx('flex:1')}></span>
          <Schalter werte={(['A', 'B', 'C'] as Brief[]).map(k => ({ k, label: `${k}  ${HANDSCHRIFTEN[k].name}` }))}
            aktiv={brief} waehle={k => setBrief(k as Brief)} />
          <Schalter werte={[{ k: 'd', label: 'Desktop' }, { k: 'm', label: 'Mobil' }]}
            aktiv={mobil ? 'm' : 'd'} waehle={k => setMobil(k === 'm')} />
          <Schalter werte={[{ k: 'de', label: 'DE' }, { k: 'en', label: 'EN' }]}
            aktiv={lang} waehle={k => setLang(k as 'de' | 'en')} />
        </div>
        <div style={sx(`max-width:1000px;margin:0 auto;padding:0 24px 14px;font-size:14.5px;line-height:1.55;color:rgba(246,239,230,.66)`)}>
          <b style={sx(`color:${CREME}`)}>{brief}. {HANDSCHRIFTEN[brief].name}.</b> {HANDSCHRIFTEN[brief].idee[lang]}
        </div>
      </header>

      {mobil ? (
        <div style={sx('display:flex;justify-content:center;padding:40px 20px 90px')}>
          <div style={sx(`width:390px;flex:none;border:8px solid #06060c;border-radius:44px;overflow:hidden;background:${GRUND};box-shadow:0 30px 70px rgba(0,0,0,.6)`)}>
            {inhalt}
          </div>
        </div>
      ) : (
        <div style={sx('padding:0 0 90px')}>{inhalt}</div>
      )}
    </div>
  );
}

function Schalter({ werte, aktiv, waehle }: {
  werte: { k: string; label: string }[]; aktiv: string; waehle: (k: string) => void;
}) {
  return (
    <div style={sx(`display:inline-flex;gap:2px;padding:3px;border-radius:999px;border:1px solid ${HAAR}`)}>
      {werte.map(w => (
        <button key={w.k} type="button" onClick={() => waehle(w.k)}
          style={sx('min-height:34px;padding:0 14px;border-radius:999px;border:0;cursor:pointer;font-family:inherit;font-size:12.5px;font-weight:900;letter-spacing:.04em;'
            + `background:${aktiv === w.k ? CREME : 'transparent'};color:${aktiv === w.k ? GRUND : 'rgba(246,239,230,.7)'};transition:background .2s ${EASE},color .2s ${EASE}`)}>
          {w.label}
        </button>
      ))}
    </div>
  );
}

/** Der Kicker aus dem Hero, unveraendert. Er ist Teil des Grundrahmens. */
function Kicker({ nummer, label }: { nummer: string; label: string }) {
  return (
    <div style={sx('display:flex;align-items:center;gap:12px;margin:0 0 18px;font-size:11.5px;font-weight:900;letter-spacing:.2em;text-transform:uppercase;color:rgba(246,239,230,.62);white-space:nowrap')}>
      {nummer}
      <span style={sx('flex:1;height:1px;background:linear-gradient(90deg,rgba(250,75,163,.35),transparent);max-width:180px')}></span>
      <span style={sx('color:rgba(246,239,230,.5)')}>{label}</span>
    </div>
  );
}

/** Objektreihe: die Kacheln, sonst nichts. Groesse je Fassung.
 *  spalten setzt feste Spalten statt freiem Umbruch: fuenf Teams stehen dann
 *  in einer Reihe, acht Fraktionen in zwei mal vier. Ein Umbruch nach sechs
 *  sieht aus wie ein Versehen, zwei volle Reihen sehen aus wie Absicht. */
function Objekte({ objekte, px, gap = 10, spalten }: {
  objekte: typeof TEAM_OBJ; px: number; gap?: number; spalten?: number;
}) {
  const raster = spalten ?? (objekte.length <= 5 ? objekte.length : 4);
  return (
    <div style={sx(`display:grid;grid-template-columns:repeat(${raster},max-content);gap:${gap.toFixed(2)}px`)}>
      {objekte.map(o => (
        <span key={o.av} className="mkKachel" style={sx(teammarke(o.farbe, o.av, px))}></span>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────── A. Die Leinwand
function LeinwandA({ L, modi, mobil }: { L: ReturnType<typeof onePageT>; modi: Modus[]; mobil: boolean }) {
  return (
    <section style={sx(`max-width:1240px;margin:0 auto;padding:${mobil ? '52px 22px 70px' : '96px 40px 120px'}`)}>
      <Kicker nummer="[ 01 ]" label={L.modes.label} />
      <h2 style={sx(`margin:0 0 ${mobil ? '46px' : '78px'};font-family:${SPARTAN};`
        + `font-size:${mobil ? '46px' : 'clamp(56px,7vw,104px)'};font-weight:900;line-height:.88;letter-spacing:-.035em;color:${CREME}`)}>
        {L.modes.h2}
      </h2>

      {modi.map((m, i) => (
        <div key={m.name} style={sx(`display:grid;gap:${mobil ? '26px' : '52px'};`
          + `grid-template-columns:${mobil ? '1fr' : '300px 1fr 300px'};align-items:start;`
          + `padding:${mobil ? '34px 0' : '54px 0'};border-top:1px solid ${HAAR}${i === modi.length - 1 ? `;border-bottom:1px solid ${HAAR}` : ''}`)}>
          <div>
            <div style={sx(`font-family:${SPARTAN};font-size:${mobil ? '40px' : '58px'};font-weight:900;line-height:.9;letter-spacing:-.03em;color:${CREME}`)}>
              {m.name}
            </div>
            <div style={sx(`margin-top:12px;font-size:12px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;color:${m.akzent}`)}>
              {m.chip}
            </div>
          </div>
          <div>
            <p style={sx(`margin:0 0 ${mobil ? '20px' : '26px'};font-size:${mobil ? '17px' : '19px'};line-height:1.55;font-weight:500;color:rgba(246,239,230,.82);max-width:56ch`)}>
              {m.lead}
            </p>
            <ul style={sx('margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:12px')}>
              {m.bullets.map(b => (
                <li key={b} style={sx('display:flex;gap:14px;font-size:15.5px;line-height:1.5;font-weight:600;color:rgba(246,239,230,.7)')}>
                  <span style={sx(`flex:none;width:18px;height:1px;margin-top:11px;background:${m.akzent}`)}></span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
          {/* Rechts steht das, was der Modus WIRKLICH ist. Beim Quiz das
              Spielfeld, denn darum geht es dort; bei der Arena die acht
              Fraktionen, die beim Zeigen ihren Namen sagen. */}
          <div style={sx(mobil ? '' : 'display:flex;justify-content:flex-end')}>
            {m.name === 'CozyQuiz'
              ? <Brett cs={mobil ? 44 : 41} />
              : <Fraktionen L={L} px={mobil ? 46 : 52} />}
          </div>
        </div>
      ))}
    </section>
  );
}

/**
 * Das Spielfeld, 7 mal 7, als ruhiges Standbild.
 *
 * Geometrie eins zu eins aus OnePage.gameVals(): Abstand 3,7 Prozent der
 * Zelle, Radius 16 Prozent, beides gemessen an der Beamer-Ansicht der App
 * (dort 107 px Zelle bei 4 px Abstand). Zu einem gleichfarbigen Nachbarn
 * faellt die Kante weg und ein Verbindungsstueck fuellt die Luecke, sonst
 * wuerden aus zwei Kanten eine doppelt so dicke Linie und aus einer Flaeche
 * fuenf Einzelfelder.
 *
 * Bewusst OHNE Simulation: hier steht ein Endstand, kein laufendes Spiel.
 * Auf der Leinwand soll ein Bild haengen, das man lesen kann, ohne zu warten.
 */
const BRETT_BESITZ: (string | null)[] = [
  null, 'o', 'o', null, null, 'p', null,
  null, 'o', null, null, 'p', 'p', null,
  'g', null, null, null, 'p', null, 'y',
  'g', 'g', null, null, null, 'y', 'y',
  'g', null, null, 'b', null, 'y', null,
  null, null, 'b', 'b', null, null, null,
  null, null, 'b', null, null, null, null,
];
const BRETT_TEAMS: Record<string, { farbe: string; av: string }> = {
  o: { farbe: '#F97316', av: '/assets/av-qq-treasure-chest.webp' },
  p: { farbe: '#A855F7', av: '/assets/av-qq-crystal-ball.webp' },
  g: { farbe: '#22C55E', av: '/assets/av-qq-mushroom.webp' },
  y: { farbe: '#FACC15', av: '/assets/av-qq-game-die.webp' },
  b: { farbe: '#3B82F6', av: '/assets/av-qq-table-lamp.webp' },
};

function Brett({ cs }: { cs: number }) {
  const GS = 7;
  // Nicht runden: bei 41 px Zelle macht ein gerundeter Abstand aus 3,7 Prozent
  // gemessene 4,9 Prozent, das Brett wird sichtbar luftiger als in der App.
  // Bruchteile von Bildpunkten sind in CSS erlaubt, also nimm sie.
  const gap = cs * 0.037;
  const rad = cs * 0.16;
  const at = (r: number, c: number) =>
    (r < 0 || c < 0 || r >= GS || c >= GS) ? null : BRETT_BESITZ[r * GS + c];

  return (
    <div style={sx(`display:grid;grid-template-columns:repeat(${GS},${cs}px);gap:${gap.toFixed(2)}px`)}>
      {BRETT_BESITZ.map((id, i) => {
        const r = Math.floor(i / GS), c = i % GS;
        const basis = `position:relative;width:${cs}px;height:${cs}px;box-sizing:border-box;`
          + 'display:flex;align-items:center;justify-content:center;';
        if (!id) return (
          <span key={i} style={sx(basis + `border-radius:${rad.toFixed(2)}px;`
            + 'background:rgba(246,239,230,.05);border:1px solid rgba(246,239,230,.20)')}></span>
        );

        const tm = BRETT_TEAMS[id];
        const nT = at(r - 1, c) === id, nR = at(r, c + 1) === id;
        const nB = at(r + 1, c) === id, nL = at(r, c - 1) === id;
        const ecke = (a: boolean, b: boolean) => (a || b) ? 0 : rad;
        const kanten = [
          nT ? '' : 'inset 0 1px 0 rgba(255,255,255,.38)',
          nL ? '' : 'inset 2px 0 0 rgba(255,255,255,.07)',
          nR ? '' : 'inset -2px 0 0 rgba(0,0,0,.18)',
          nB ? '' : 'inset 0 -3px 0 rgba(0,0,0,.2)',
          (nR && nB) ? '' : `${nR ? 0 : 2}px ${nB ? 0 : 3}px 0 rgba(0,0,0,.45)`,
          '0 5px 9px rgba(0,0,0,.3)',
        ].filter(Boolean).join(',');
        const flaeche = `${KACHEL_VERLAUF},${tm.farbe}`;
        const av = Math.round(cs * motivAnteil(tm.av));

        return (
          <span key={i} style={sx(basis
            + `border-radius:${ecke(nT, nL).toFixed(2)}px ${ecke(nT, nR).toFixed(2)}px ${ecke(nB, nR).toFixed(2)}px ${ecke(nB, nL).toFixed(2)}px;`
            + `background:${flaeche};box-shadow:${kanten}`)}>
            {/* Verbindungsstuecke nach rechts und nach unten, sie fuellen den
                Abstand samt der beiden runden Ecken. */}
            {nR && <span aria-hidden="true" style={sx(`position:absolute;z-index:2;left:${(cs - rad).toFixed(2)}px;top:${rad.toFixed(2)}px;`
              + `width:${(gap + rad * 2).toFixed(2)}px;height:${(cs - rad * 2).toFixed(2)}px;background:${flaeche}`)}></span>}
            {nB && <span aria-hidden="true" style={sx(`position:absolute;z-index:2;top:${(cs - rad).toFixed(2)}px;left:${rad.toFixed(2)}px;`
              + `height:${(gap + rad * 2).toFixed(2)}px;width:${(cs - rad * 2).toFixed(2)}px;background:${flaeche}`)}></span>}
            <span aria-hidden="true" style={sx(`position:relative;z-index:8;width:${av}px;height:${av}px;`
              + `background:url(${tm.av}) center/contain no-repeat`)}></span>
          </span>
        );
      })}
    </div>
  );
}

/**
 * Die acht Fraktionen. Beim Zeigen sagt jede ihren Namen, in ihrer Farbe.
 *
 * Der Name steht in einer eigenen Zeile unter der Gruppe, nicht an der Kachel:
 * acht Namen gleichzeitig waeren eine Liste, und ein Name AN der Kachel wuerde
 * die Reihe beim Zeigen umbrechen lassen. Die Zeile ist auf ihre Hoehe
 * vorgehalten, damit nichts springt. Ohne Mauszeiger (Handy) tut es der Tipp.
 */
function Fraktionen({ L, px }: { L: ReturnType<typeof onePageT>; px: number }) {
  const [zeigt, setZeigt] = useState<number | null>(null);
  const f = zeigt === null ? null : FRAKT_OBJ[zeigt];
  const name = zeigt === null ? '' : L.sim.factions[FRAKT_IDS[zeigt]];
  return (
    <div>
      <div style={sx('display:grid;grid-template-columns:repeat(4,max-content);gap:10px')}>
        {FRAKT_OBJ.map((o, i) => (
          <button key={o.av} type="button" className="mkKachel"
            onMouseEnter={() => setZeigt(i)} onMouseLeave={() => setZeigt(null)}
            onFocus={() => setZeigt(i)} onBlur={() => setZeigt(null)}
            onClick={() => setZeigt(z => z === i ? null : i)}
            aria-label={L.sim.factions[FRAKT_IDS[i]]}
            style={sx(`padding:0;border:0;cursor:pointer;background:transparent;${teammarke(o.farbe, o.av, px)}`)}>
          </button>
        ))}
      </div>
      <div aria-live="polite" style={sx('margin-top:14px;min-height:20px;font-size:14px;font-weight:900;'
        + `letter-spacing:.02em;color:${f ? f.farbe : 'transparent'};transition:color .25s ${EASE}`)}>
        {name || '\u00a0'}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────── B. Das Spielfeld
function SpielfeldB({ L, modi, mobil }: { L: ReturnType<typeof onePageT>; modi: Modus[]; mobil: boolean }) {
  const R = '20px';
  const felt = (farbe: string) => `${kachel(farbe, R)}box-sizing:border-box;padding:${mobil ? '18px' : '22px'};display:flex;flex-direction:column;`;
  return (
    <section style={sx(`max-width:1240px;margin:0 auto;padding:${mobil ? '52px 18px 70px' : '96px 40px 120px'}`)}>
      <Kicker nummer="[ 01 ]" label={L.modes.label} />
      <h2 style={sx(`margin:0 0 ${mobil ? '30px' : '48px'};font-family:${SPARTAN};`
        + `font-size:${mobil ? '46px' : 'clamp(56px,7vw,104px)'};font-weight:900;line-height:.88;letter-spacing:-.035em;color:${CREME}`)}>
        {L.modes.h2}
      </h2>

      {/* minmax statt fester Zeilenhoehe: der laengste Bullet ist 94 Zeichen
          lang und lief auf 390 px aus der Kachel heraus, ueber die Kachel
          darueber. Das Brett gibt das Raster vor, nicht die Zeilenhoehe. */}
      {modi.map(m => (
        <div key={m.name} style={sx(`display:grid;gap:${mobil ? '10px' : '14px'};margin-bottom:${mobil ? '10px' : '14px'};`
          + `grid-template-columns:${mobil ? 'repeat(2,1fr)' : 'repeat(4,1fr)'};`
          + `grid-auto-rows:minmax(${mobil ? '124px' : '154px'},auto)`)}>

          {/* Namenskachel, das grosse Feld auf dem Brett */}
          <div className="mkKachel" style={sx(felt(m.akzent === '#FA4BA3' ? '#2A1024' : '#241626')
            + `grid-column:span 2;${mobil ? '' : 'grid-row:span 2;'}justify-content:space-between;gap:${mobil ? '22px' : '0'};border:1px solid ${m.akzent}55`)}>
            <div style={sx(`font-family:${SPARTAN};font-size:${mobil ? '34px' : '46px'};font-weight:900;line-height:.92;letter-spacing:-.03em;color:${CREME}`)}>
              {m.name}
            </div>
            <div>
              <div style={sx(`margin-bottom:10px;font-size:11.5px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;color:${m.akzent}`)}>{m.chip}</div>
              <div style={sx(`font-size:${mobil ? '14px' : '15.5px'};line-height:1.5;font-weight:600;color:rgba(246,239,230,.76)`)}>{m.calm}</div>
            </div>
          </div>

          {m.bullets.map(b => (
            <div key={b} className="mkKachel" style={sx(felt('#17111F') + 'justify-content:flex-end')}>
              <span style={sx(`width:14px;height:2px;margin-bottom:12px;background:${m.akzent}`)}></span>
              <span style={sx(`font-size:${mobil ? '13.5px' : '14.5px'};line-height:1.42;font-weight:700;color:rgba(246,239,230,.82)`)}>{b}</span>
            </div>
          ))}

          {/* Objektkachel: die Spielsteine selbst, ohne Text */}
          <div className="mkKachel" style={sx(felt('#17111F') + 'justify-content:center;align-items:center')}>
            <Objekte objekte={m.objekte.slice(0, mobil ? 4 : 8)} px={mobil ? 34 : 38} gap={8} spalten={mobil ? 2 : 4} />
          </div>
        </div>
      ))}
    </section>
  );
}

// ─────────────────────────────────────────────────────── C. Die Runde
function RundeC({ L, modi, mobil }: { L: ReturnType<typeof onePageT>; modi: Modus[]; mobil: boolean }) {
  const mark = mobil ? 40 : 54;      // Kantenlaenge des Markers
  const spur = mobil ? 0 : 92;       // Einzug der Linie. Auf 390 px kostet
  const luft = mobil ? 16 : 30;      // jeder Einzug Textbreite, dort also null.
  return (
    <section style={sx(`max-width:1120px;margin:0 auto;padding:${mobil ? '52px 22px 70px' : '96px 40px 120px'}`)}>
      <div style={sx(`padding-left:${mobil ? 0 : spur + luft}px`)}>
        <Kicker nummer="[ 01 ]" label={L.modes.label} />
        <h2 style={sx(`margin:0 0 ${mobil ? '44px' : '70px'};font-family:${SPARTAN};`
          + `font-size:${mobil ? '42px' : 'clamp(50px,5.6vw,80px)'};font-weight:900;line-height:.9;letter-spacing:-.03em;color:${CREME}`)}>
          {L.modes.h2}
        </h2>
      </div>

      <div style={sx('position:relative')}>
        {/* Die Linie. Sie laeuft spaeter durch die ganze Seite, hier durch die Station. */}
        <span aria-hidden="true" style={sx(`position:absolute;left:${spur + mark / 2}px;top:8px;bottom:${mobil ? '-40px' : '-64px'};width:1px;`
          + 'background:linear-gradient(180deg,rgba(246,239,230,.28) 60%,rgba(246,239,230,0))')}></span>

        {modi.map((m, i) => (
          <div key={m.name} style={sx(`position:relative;display:grid;grid-template-columns:${spur + mark + luft}px 1fr;`
            + `padding-bottom:${i === modi.length - 1 ? '0' : mobil ? '52px' : '76px'}`)}>
            <div style={sx(`padding-left:${spur}px`)}>
              <span className="mkKachel" style={sx(teammarke(m.objekte[0].farbe, m.objekte[0].av, mark) + `position:relative;z-index:2;display:block`)}></span>
            </div>
            <div style={sx('min-width:0')}>
              <div style={sx(`display:flex;align-items:baseline;gap:14px;flex-wrap:wrap;margin-bottom:${mobil ? '10px' : '12px'}`)}>
                <span style={sx(`font-family:${SPARTAN};font-size:${mobil ? '28px' : '38px'};font-weight:900;letter-spacing:-.025em;line-height:1;color:${CREME}`)}>{m.name}</span>
                <span style={sx(`font-size:11.5px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;color:${m.akzent}`)}>{m.chip}</span>
              </div>
              <p style={sx(`margin:0 0 16px;font-size:${mobil ? '16px' : '18px'};line-height:1.55;font-weight:500;color:rgba(246,239,230,.8);max-width:52ch`)}>{m.lead}</p>
              <ul style={sx('margin:0 0 20px;padding:0;list-style:none;display:flex;flex-direction:column;gap:9px')}>
                {m.bullets.map(b => (
                  <li key={b} style={sx('display:flex;gap:12px;font-size:15px;line-height:1.5;font-weight:600;color:rgba(246,239,230,.66)')}>
                    <span style={sx(`flex:none;width:5px;height:5px;margin-top:9px;border-radius:2px;background:${m.akzent}`)}></span>
                    {b}
                  </li>
                ))}
              </ul>
              <Objekte objekte={m.objekte} px={mobil ? 32 : 38} gap={8} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const MOCKUP_CSS = `
html{background:${GRUND};color-scheme:dark}
body{margin:0;background:${GRUND}}
*{box-sizing:border-box}
/* Regel 4: Bewegung nur, wo sie etwas bedeutet. Hier: das Objekt hebt sich,
   wenn man darauf zeigt, wie im Hero. Sonst bewegt sich auf dieser Seite nichts. */
.mkKachel{transition:transform .34s ${EASE},filter .34s ${EASE}}
@media (hover:hover) and (pointer:fine){
  .mkKachel:hover{transform:translateY(-8px) scale(1.08);filter:brightness(1.08)}
}
@media (prefers-reduced-motion:reduce){.mkKachel{transition:none}}
button:focus-visible{outline:3px solid #FFC7E4;outline-offset:3px}
`;
