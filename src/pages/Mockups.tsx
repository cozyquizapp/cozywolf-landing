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
import type { ReactElement } from 'react';
import { useLang, setLang } from '../lang';
import { sx } from './onepage/sx';
import { onePageT } from './onepage/texts';
import { KACHEL_VERLAUF, kachel, motivAnteil, qqGridSize, teammarke } from '../qqKachel';

import { CREME, GRUND, SPARTAN, HAAR, EASE, Kicker } from './mockups/stil';
import { HeroFarbe, FARB_ENTWUERFE, type FarbEntwurf } from './mockups/heroFarbe';
import { BrettFarben, BRETT_FARBEN, type BrettFarbe } from './mockups/brettFarben';
import {
  Ablauf, UeberMich, Fragen, Anfragen,
  ABLAUF_ENTWUERFE, JOH_ENTWUERFE, FAQ_ENTWUERFE, FORM_ENTWUERFE,
} from './mockups/weitere';

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

/**
 * Station 02, Anlaesse. Drei Entwuerfe INNERHALB der Handschrift A.
 *
 * 2026-08-27, Wolfs Einwand: "du hast gar keine mockups vorgeschlagen". Zu
 * Recht. Dass die Handschrift A ist, ist entschieden; was in der dritten
 * Spalte steht, ist es nicht. Bei Station 01 steht dort das Spiel selbst
 * (Brett, Rangfolge). Ein Geburtstag hat kein Spielobjekt, deshalb ist die
 * Frage hier offen und gehoert gestellt, nicht von mir beantwortet.
 */
const ANLASS_ENTWUERFE = {
  1: {
    name: 'Die Ziffer',
    idee: {
      de: 'Rechts steht die Nummer, gross und leise. Sie behauptet nichts, was es nicht gibt, und nutzt die zweite Saeule des Heros: die Schrift selbst. Am ruhigsten, aber die Spalte sagt nichts ueber den Anlass.',
      en: 'A large, quiet numeral on the right. It claims nothing that is not there and leans on the hero\u2019s second pillar, the type itself. Calmest, but the column says nothing about the occasion.',
    },
  },
  2: {
    name: 'Das Format',
    idee: {
      de: 'Rechts steht, wie gross die Runde bei diesem Anlass ist, als Kacheln: vier Teams fuer die private Feier, acht Fraktionen fuer die Firma. Die Spalte arbeitet, statt zu schmuecken. Dafuer muss die Angabe stimmen, sonst wird aus Schmuck ein Versprechen.',
      en: 'The right column shows how big the round is for this occasion, as tiles: four teams for a private party, eight factions for a company night. The column works instead of decorating. The numbers have to be right, or decoration turns into a promise.',
    },
  },
  4: {
    name: 'Objektgruppe',
    idee: {
      de: 'Rechts stehen drei Objekte fuer den Anlass, frei und ueberlappend wie die Gruppe im Hero, OHNE Kachel. Die Kachel bedeutet im Spiel ein Feld oder ein Team, beides gibt es hier nicht, und drei pinke Kacheln je Abschnitt waeren ausserdem Pink als Flaeche statt als Marke.',
      en: 'Three objects per occasion on the right, free and overlapping like the hero cluster, WITHOUT a tile. In the game a tile means a field or a team, and neither exists here; three pink tiles per section would also make pink a surface instead of a brand mark.',
    },
  },
  3: {
    name: 'Nur Text',
    idee: {
      de: 'Keine dritte Spalte. Anlass links, Text rechts, viel Luft dazwischen, groessere Ueberschriften. Am naechsten am Hero und am schnellsten zu lesen. Dafuer sieht die Station der naechsten aehnlicher.',
      en: 'No third column. Occasion left, text right, generous space between, larger headings. Closest to the hero and quickest to read, but the station looks more like the next one.',
    },
  },
} as const;
type AnlassEntwurf = keyof typeof ANLASS_ENTWUERFE;

/**
 * Station 03, Ausprobieren. Drei Entwuerfe, alle in der Handschrift A.
 *
 * Die Station hat als einzige schon ein echtes Objekt: das Handy. Die Frage
 * ist deshalb nicht "was steht rechts", sondern "wessen Bildschirm zeigen
 * wir". Am Abend gibt es zwei: die Wand und die Hand.
 */
const PROBE_ENTWUERFE = {
  1: {
    name: 'Das Handy',
    idee: {
      de: 'Wie heute, nur ohne Kasten: der Anspruch steht als Zeile an einer Haarlinie statt in einem gerahmten Feld, die fuenf Fragetypen als Reihe unter dem Text statt als Spalte daneben. Rechts das Handy. Am wenigsten Risiko, am wenigsten Neues.',
      en: 'Like today, minus the box: the claim sits on a hairline instead of a framed panel, the five question types run as a row under the text instead of a column beside it. Phone on the right. Least risk, least new.',
    },
  },
  2: {
    name: 'Die Wand',
    idee: {
      de: 'Kein Geraet. Rechts steht die Frage so, wie sie am Abend an der Wand steht: gross, mit den Antworten darunter. Das passt zu der Verabredung, dass der Desktop die Leinwand ist und das Handy die Mobilfassung. Risiko: die Station heisst „so sieht es auf eurem Handy aus", und dann kommt kein Handy.',
      en: 'No device. On the right, the question appears the way it does on the wall: large, answers underneath. This matches the agreement that desktop is the canvas and the phone is the mobile version. Risk: the station says \u201cthis is what it looks like on your phone\u201d and then shows no phone.',
    },
  },
  4: {
    name: 'Handy und Stapel',
    idee: {
      de: 'Das Handy vorn, dahinter faechern die anderen vier Fragetypen auf. Loest den Widerspruch der beiden anderen: die Ueberschrift sagt „so sieht es auf eurem Handy aus", also muss ein Handy da sein, und gleichzeitig sieht man auf einen Blick, dass es fuenf verschiedene sind.',
      en: 'Phone in front, the other four question types fanned out behind it. Resolves the contradiction in the other two: the heading says \u201cthis is what it looks like on your phone\u201d, so a phone has to be there, and at the same time you see at a glance that there are five different types.',
    },
  },
  3: {
    name: 'Der Stapel',
    idee: {
      de: 'Die fuenf Fragetypen liegen als gedrehter Stapel uebereinander, wie die Objektgruppe im Hero. Der vorderste ist lesbar, die anderen schauen hervor. Zeigt auf einen Blick, dass es fuenf verschiedene sind, und benutzt dieselbe Anordnung wie oben.',
      en: 'The five question types lie in a rotated stack, like the hero cluster. The front one is readable, the others peek out. Shows at a glance that there are five different ones, and reuses the arrangement from the top.',
    },
  },
} as const;
type ProbeEntwurf = keyof typeof PROBE_ENTWUERFE;

const PROBE_TYPEN = [
  { k: 'mucho', icon: '/assets/cat-mucho.webp', col: '#3B82F6' },
  { k: 'schaetzchen', icon: '/assets/cat-schaetzchen.webp', col: '#F59E0B' },
  { k: 'cheese', icon: '/assets/cat-cheese.webp', col: '#8B5CF6' },
  { k: 'zehn', icon: '/assets/cat-10v10.webp', col: '#22C55E' },
  { k: 'tuete', icon: '/assets/cat-buntetuete.webp', col: '#EF4444' },
] as const;

export default function Mockups() {
  const lang = useLang();
  const L = onePageT(lang);
  type Stat = '00' | '01' | '02' | '03' | '04' | '05' | '06' | '07' | 'BF';
  const [station, setStation] = useState<Stat>('01');
  // Fuer die Stationen 04 bis 07 genuegt ein Zaehler je Station: sie haben
  // alle drei Entwuerfe und keine eigene Logik.
  const [va, setVa] = useState<Record<string, number>>({});
  const [brief, setBrief] = useState<Brief>('A');
  const [entwurf, setEntwurf] = useState<AnlassEntwurf>(1);
  const [probe, setProbe] = useState<ProbeEntwurf>(1);
  const [farbe, setFarbe] = useState<FarbEntwurf>(1);
  const [bf, setBf] = useState<BrettFarbe>(1);
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

  const v = va[station] ?? 1;
  const WEITERE: Record<string, {
    titel: string; nr: string;
    entw: Record<number, { name: string; idee: { de: string; en: string } }>;
    bau: (p: { L: typeof L; mobil: boolean; entwurf: number }) => ReactElement;
  }> = {
    '04': { titel: 'Ablauf', nr: 'B', entw: ABLAUF_ENTWUERFE, bau: Ablauf },
    '05': { titel: 'Ueber mich', nr: 'C', entw: JOH_ENTWUERFE, bau: UeberMich },
    '06': { titel: 'Fragen', nr: 'D', entw: FAQ_ENTWUERFE, bau: Fragen },
    '07': { titel: 'Anfragen', nr: 'E', entw: FORM_ENTWUERFE, bau: Anfragen },
  };
  const w = WEITERE[station];

  const inhalt = station === 'BF' ? <BrettFarben mobil={mobil} entwurf={bf} />
    : station === '00' ? <HeroFarbe L={L} mobil={mobil} entwurf={farbe} />
    : w ? w.bau({ L, mobil, entwurf: v })
    : station === '03' ? <Probieren L={L} mobil={mobil} entwurf={probe} />
      : station === '02' ? <Anlaesse L={L} mobil={mobil} entwurf={entwurf} />
        : brief === 'A' ? <LeinwandA L={L} modi={modi} mobil={mobil} />
          : brief === 'B' ? <SpielfeldB L={L} modi={modi} mobil={mobil} />
            : <RundeC L={L} modi={modi} mobil={mobil} />;

  return (
    <div style={sx(`min-height:100dvh;background:${GRUND};color:${CREME};font-family:'Bricolage Grotesque',system-ui,sans-serif`)}>
      <style>{MOCKUP_CSS}</style>

      <header style={sx(`position:sticky;top:0;z-index:20;background:rgba(10,8,20,.92);backdrop-filter:blur(14px);border-bottom:1px solid ${HAAR}`)}>
        <div style={sx('max-width:1240px;margin:0 auto;padding:14px 24px;display:flex;align-items:center;gap:20px;flex-wrap:wrap')}>
          <Schalter werte={[
            { k: '00', label: 'Hero' },
            { k: '01', label: '01' }, { k: '02', label: '02' }, { k: '03', label: '03' },
            { k: '04', label: '04' }, { k: '05', label: '05' }, { k: '06', label: '06' }, { k: '07', label: '07' },
            { k: 'BF', label: 'Brettfarben' },
          ]} aktiv={station} waehle={k => setStation(k as Stat)} />
          <span style={sx(`font-family:${SPARTAN};font-size:14px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:rgba(246,239,230,.62);white-space:nowrap`)}>
            {station === 'BF' ? 'Brettfarben' : station === '00' ? 'Farbwechsel' : station === '01' ? 'Spielarten' : station === '02' ? 'Anlaesse' : station === '03' ? 'Ausprobieren' : w.titel}
          </span>
          <span style={sx('flex:1')}></span>
          {station === 'BF'
            ? <Schalter werte={([1, 2, 3, 4] as BrettFarbe[]).map(k => ({ k: String(k), label: `G${k}  ${BRETT_FARBEN[k].name}` }))}
              aktiv={String(bf)} waehle={k => setBf(Number(k) as BrettFarbe)} />
            : station === '00'
            ? <Schalter werte={([1, 2, 3] as FarbEntwurf[]).map(k => ({ k: String(k), label: `F${k}  ${FARB_ENTWUERFE[k].name}` }))}
              aktiv={String(farbe)} waehle={k => setFarbe(Number(k) as FarbEntwurf)} />
            : station === '01'
            ? <Schalter werte={(['A', 'B', 'C'] as Brief[]).map(k => ({ k, label: `${k}  ${HANDSCHRIFTEN[k].name}` }))}
              aktiv={brief} waehle={k => setBrief(k as Brief)} />
            : station === '02'
              ? <Schalter werte={([1, 2, 4, 3] as AnlassEntwurf[]).map(k => ({ k: String(k), label: `A${k}  ${ANLASS_ENTWUERFE[k].name}` }))}
                aktiv={String(entwurf)} waehle={k => setEntwurf(Number(k) as AnlassEntwurf)} />
              : station === '03'
                ? <Schalter werte={([1, 4, 2, 3] as ProbeEntwurf[]).map(k => ({ k: String(k), label: `P${k}  ${PROBE_ENTWUERFE[k].name}` }))}
                  aktiv={String(probe)} waehle={k => setProbe(Number(k) as ProbeEntwurf)} />
                : <Schalter werte={[1, 2, 3].map(k => ({ k: String(k), label: `${w.nr}${k}  ${w.entw[k].name}` }))}
                  aktiv={String(v)} waehle={k => setVa(a => ({ ...a, [station]: Number(k) }))} />}
          <Schalter werte={[{ k: 'd', label: 'Desktop' }, { k: 'm', label: 'Mobil' }]}
            aktiv={mobil ? 'm' : 'd'} waehle={k => setMobil(k === 'm')} />
          <Schalter werte={[{ k: 'de', label: 'DE' }, { k: 'en', label: 'EN' }]}
            aktiv={lang} waehle={k => setLang(k as 'de' | 'en')} />
        </div>
        <div style={sx(`max-width:1000px;margin:0 auto;padding:0 24px 14px;font-size:14.5px;line-height:1.55;color:rgba(246,239,230,.66)`)}>
          {station === 'BF'
            ? <><b style={sx(`color:${CREME}`)}>G{bf}. {BRETT_FARBEN[bf].name}.</b> {BRETT_FARBEN[bf].idee[lang]} <i style={sx('opacity:.7')}>Gleicher Endstand in allen vier, verglichen wird nur die Farbe. Alle Toene aus QQ_BOARD_PALETTE der App.</i></>
            : station === '00'
            ? <><b style={sx(`color:${CREME}`)}>F{farbe}. {FARB_ENTWUERFE[farbe].name}.</b> {FARB_ENTWUERFE[farbe].idee[lang]} <i style={sx('opacity:.7')}>Wechselt hier alle 3,4 s statt alle 6,8 s, damit man nicht warten muss.</i></>
            : station === '01'
            ? <><b style={sx(`color:${CREME}`)}>{brief}. {HANDSCHRIFTEN[brief].name}.</b> {HANDSCHRIFTEN[brief].idee[lang]}</>
            : station === '02'
              ? <><b style={sx(`color:${CREME}`)}>A{entwurf}. {ANLASS_ENTWUERFE[entwurf].name}.</b> {ANLASS_ENTWUERFE[entwurf].idee[lang]} <i style={sx('opacity:.7')}>Die Handschrift steht, es geht nur um die dritte Spalte.</i></>
              : station === '03'
                ? <><b style={sx(`color:${CREME}`)}>P{probe}. {PROBE_ENTWUERFE[probe].name}.</b> {PROBE_ENTWUERFE[probe].idee[lang]} <i style={sx('opacity:.7')}>Statisch, immer Mu-Cho: es geht um die Form, nicht um die Bedienung.</i></>
                : <><b style={sx(`color:${CREME}`)}>{w.nr}{v}. {w.entw[v].name}.</b> {w.entw[v].idee[lang]} <i style={sx('opacity:.7')}>Alle drei in der Handschrift A, verglichen wird nur, was der Abschnitt aus seinem Inhalt macht.</i></>}
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
 * Das Spielfeld als ruhiges Standbild. Die Kantenlaenge kommt aus
 * qqGridSize() und nicht aus dem Bauchgefuehl: fuenf Teams ergeben 6 mal 6.
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
const BRETT_KANTE = qqGridSize(5);   // fuenf Teams -> 6x6, wie in der App
// Derselbe Endstand, den die Simulation auf /d erreicht (OnePage PRESET +
// MOVES). Das Mockup zeigt damit kein ausgedachtes Brett, sondern das Bild,
// das am Ende einer Runde wirklich dasteht.
const BRETT_BESITZ: (string | null)[] = [
  'g', 'g', null, 'y', 'y', null,
  'g', 'g', null, 'y', null, 'p',
  null, null, null, null, 'p', 'p',
  'o', 'o', null, 'b', null, 'p',
  'o', 'o', null, 'b', 'b', null,
  null, null, null, null, 'b', null,
];
const BRETT_TEAMS: Record<string, { farbe: string; av: string }> = {
  o: { farbe: '#F97316', av: '/assets/av-qq-treasure-chest.webp' },
  p: { farbe: '#A855F7', av: '/assets/av-qq-crystal-ball.webp' },
  g: { farbe: '#22C55E', av: '/assets/av-qq-mushroom.webp' },
  y: { farbe: '#FACC15', av: '/assets/av-qq-game-die.webp' },
  b: { farbe: '#3B82F6', av: '/assets/av-qq-table-lamp.webp' },
};

function Brett({ cs }: { cs: number }) {
  const GS = BRETT_KANTE;
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

/**
 * Station 02, Anlaesse. Drei Entwuerfe, alle in der Handschrift A.
 *
 * Unterschied ist einzig die dritte Spalte:
 *   1 Ziffer  - die Nummer, gross und leise.
 *   2 Format  - die Groesse der Runde als Kacheln.
 *   3 nichts  - zwei Spalten, dafuer groessere Ueberschriften.
 *
 * Die Zahlen in Entwurf 2 kommen aus den vorhandenen Texten und nicht aus
 * der Fantasie: die Firma spielt als Fraktionen (bis acht), die private
 * Feier "ab sechs Personen, nach oben bis vierzig", also vier Teams zu je
 * einem Handy als typische Runde. Fuer das Cafe steht in keinem Text eine
 * Groesse; dort haette die Spalte nichts zu sagen, und genau das ist das
 * Argument gegen diesen Entwurf.
 */
const ANLASS_FORMAT: { objekte: typeof TEAM_OBJ; label: { de: string; en: string } }[] = [
  { objekte: FRAKT_OBJ, label: { de: 'Bis acht Fraktionen', en: 'Up to eight factions' } },
  { objekte: TEAM_OBJ.slice(0, 4), label: { de: 'Vier Teams, ein Handy je Team', en: 'Four teams, one phone each' } },
  { objekte: TEAM_OBJ, label: { de: 'Feste Reihe, wechselnde Runden', en: 'A regular series, changing crowds' } },
];
const ANLASS_ACC = ['#FA4BA3', '#FFC7E4', '#FF7AC0'];

/**
 * Drei Objekte je Anlass, frei angeordnet wie die Gruppe im Hero.
 *
 * 2026-08-27, Wolf zur Kachel-Fassung: "noch zu viel pink und die emojis sind
 * nicht super passend ... ich wuerde vermutlich keine kacheln nehmen, eher
 * 3 3d emoji objekte (aehnlich wie ganz oben die kacheln angeordnet)".
 *
 * Beides stimmt. Die Kachel bedeutet im Spiel ein Feld oder eine Teammarke;
 * neben "Geburtstag" bedeutet sie nichts. Und drei grosse pinke Flaechen je
 * Abschnitt machen Pink zur Flaeche, obwohl die Hausregel lautet: Pink ist
 * Logo und Marke, nicht Produkt. Ohne Kachel bleibt Pink im Abschnitt genau
 * dort, wo es hingehoert, im Kicker und im Anfragen-Link.
 *
 * Drei Objekte statt einem, weil ein einzelnes den Anlass nie trifft: eine
 * Torte allein ist ein Kuchen, Torte mit Luftballons und Geschenk ist ein
 * Geburtstag. Alle neun stammen aus dem Objektsatz der App
 * eigens gerendert, nicht aus einem Emoji-Satz zusammengesucht: creme
 * Koerper, Gold als Akzent, dunkles Blau fuer Sockel, hoechstens ein
 * weiterer Ton je Objekt. Kein Pink, das ist Marke.
 *
 * gr = Kantenlaenge in Prozent des Feldes, x/y = Position, r = Drehung.
 * Dieselbe Staffelung wie im Hero: das groesste Objekt vorn und leicht
 * gegen den Uhrzeigersinn, die kleineren dahinter.
 */
type Obj = { av: string; gr: number; x: number; y: number; r: number };
const ANLASS_GRUPPEN: Obj[][] = [
  [
    { av: '/assets/obj-namensschild.webp', gr: 54, x: 0,  y: 10, r: -9 },
    { av: '/assets/obj-sekt.webp',         gr: 48, x: 48, y: 0,  r: 10 },
    { av: '/assets/obj-wimpel.webp',       gr: 38, x: 42, y: 52, r: -6 },
  ],
  [
    { av: '/assets/obj-torte.webp',    gr: 56, x: 2,  y: 10, r: -7 },
    { av: '/assets/obj-ballons.webp',  gr: 46, x: 52, y: 0,  r: 9 },
    { av: '/assets/obj-geschenk.webp', gr: 38, x: 44, y: 54, r: -12 },
  ],
  [
    { av: '/assets/obj-bier.webp',   gr: 54, x: 2,  y: 8,  r: -8 },
    { av: '/assets/obj-kaffee.webp', gr: 46, x: 50, y: 2,  r: 11 },
    { av: '/assets/obj-tafel.webp',  gr: 40, x: 40, y: 54, r: -5 },
  ],
];
function Anlaesse({ L, mobil, entwurf }: {
  L: ReturnType<typeof onePageT>; mobil: boolean; entwurf: AnlassEntwurf;
}) {
  const lang = useLang();
  const spalten = mobil ? '1fr'
    : entwurf === 3 ? '380px 1fr' : entwurf === 4 ? '290px 1fr 200px' : '290px 1fr 340px';
  return (
    <section style={sx(`max-width:1240px;margin:0 auto;padding:${mobil ? '52px 22px 70px' : '96px 40px 120px'}`)}>
      <Kicker nummer="[ 02 ]" label={L.anlaesse.label} />
      <h2 style={sx(`margin:0 0 14px;font-family:${SPARTAN};`
        + `font-size:${mobil ? '44px' : 'clamp(52px,6.6vw,96px)'};font-weight:900;line-height:.9;letter-spacing:-.035em;color:${CREME}`)}>
        {L.anlaesse.h2}
      </h2>
      <p style={sx(`margin:0 0 ${mobil ? '18px' : '26px'};max-width:620px;font-size:17px;line-height:1.6;color:rgba(246,239,230,.62);font-weight:500`)}>
        {L.anlaesse.sub}
      </p>

      {L.anlaesse.cards.map((k, i) => {
        const a = ANLASS_ACC[i];
        const fmt = ANLASS_FORMAT[i];
        return (
          <div key={k.title} style={sx(`display:grid;gap:${mobil ? '22px' : '48px'};grid-template-columns:${spalten};`
            + `align-items:start;padding:${mobil ? '30px 0' : '52px 0'};border-top:1px solid ${HAAR}`
            + `${i === L.anlaesse.cards.length - 1 ? `;border-bottom:1px solid ${HAAR}` : ''}`)}>
            <div>
              <div style={sx(`font-family:${SPARTAN};`
                + `font-size:${mobil ? '32px' : entwurf === 3 ? 'clamp(36px,3.8vw,54px)' : 'clamp(30px,3.1vw,44px)'};`
                + `font-weight:900;line-height:.95;letter-spacing:-.028em;color:${CREME};text-wrap:balance`)}>{k.title}</div>
              <div style={sx(`margin-top:12px;font-size:12px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;color:${a}`)}>{k.badge}</div>
            </div>

            <div>
              <p style={sx(`margin:0 0 20px;font-size:${mobil ? '16.5px' : '18px'};line-height:1.6;font-weight:500;color:rgba(246,239,230,.82);max-width:60ch`)}>{k.desc}</p>
              <span style={sx(`font-size:15.5px;font-weight:900;color:${a}`)}>{L.anlaesse.cta}</span>
            </div>

            {entwurf === 1 && !mobil && (
              <div style={sx('display:flex;justify-content:flex-end;min-width:0')}>
                <span style={sx(`font-family:${SPARTAN};font-size:clamp(90px,9vw,150px);font-weight:900;line-height:.8;letter-spacing:-.05em;color:${a};opacity:.16`)}>
                  {`0${i + 1}`}
                </span>
              </div>
            )}
            {entwurf === 4 && (
              <div style={sx(`position:relative;${mobil ? 'width:190px;' : 'width:100%;max-width:230px;margin-left:auto;'}aspect-ratio:1/1`)}>
                {ANLASS_GRUPPEN[i].map(o => (
                  <span key={o.av} aria-hidden="true" className="mkKachel"
                    style={sx(`position:absolute;left:${o.x}%;top:${o.y}%;width:${o.gr}%;aspect-ratio:1/1;`
                      + `--r:${o.r}deg;`
                      + `background:url(${o.av}) center/contain no-repeat;`
                      + 'filter:drop-shadow(0 10px 16px rgba(0,0,0,.55))')}></span>
                ))}
              </div>
            )}
            {entwurf === 2 && (
              <div style={sx(mobil ? '' : 'display:flex;flex-direction:column;align-items:flex-end;gap:12px')}>
                <Objekte objekte={fmt.objekte} px={mobil ? 42 : 48} gap={9} />
                <span style={sx(`${mobil ? 'display:block;margin-top:10px;' : 'text-align:right;'}font-size:12px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:rgba(246,239,230,.55)`)}>
                  {fmt.label[lang]}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}

/**
 * Station 03, Ausprobieren. Drei Entwuerfe, alle Handschrift A.
 *
 * Statisch: gezeigt wird immer derselbe Fragetyp (Mu-Cho). Ein Mockup soll
 * die Form entscheiden, nicht die Bedienung; die Bedienung steht schon auf
 * der echten Seite und bleibt, welcher Entwurf auch gewinnt.
 */
function Probieren({ L, mobil, entwurf }: {
  L: ReturnType<typeof onePageT>; mobil: boolean; entwurf: ProbeEntwurf;
}) {
  const typ = PROBE_TYPEN[0];
  const cat = L.probe.cats.mucho;
  const frage = L.probe.probes.mucho;
  const opts = ('opts' in frage ? frage.opts : []) as string[];
  const AKZENT = typ.col;

  // Die Frage, wie sie am Abend aussieht. Fuer P1 im Handy, fuer P2 an der
  // Wand, fuer P3 auf dem vordersten Blatt des Stapels.
  const frageBild = (gross: boolean) => (
    <>
      <span style={sx(`display:inline-flex;align-items:center;gap:8px;padding:${gross ? '7px 15px' : '6px 13px'};border-radius:999px;`
        + `background:${AKZENT}1f;border:1px solid ${AKZENT}80;font-size:${gross ? '13px' : '11px'};font-weight:900;color:${AKZENT}`)}>
        <span style={sx(`display:block;width:${gross ? 20 : 16}px;height:${gross ? 20 : 16}px;background:url(${typ.icon}) center/contain no-repeat`)}></span>
        {cat.name}
      </span>
      <div style={sx(`margin:${gross ? '20px' : '12px'} 0 ${gross ? '22px' : '14px'};font-size:${gross ? '30px' : '16px'};`
        + `font-weight:900;line-height:1.28;color:${CREME};text-wrap:balance`)}>{frage.q}</div>
      <div style={sx(`display:grid;gap:${gross ? '10px' : '8px'}`)}>
        {opts.map((o, i) => (
          <span key={o} style={sx(`display:flex;align-items:center;gap:${gross ? 14 : 10}px;padding:${gross ? '14px 16px' : '11px 12px'};`
            + `border-radius:${gross ? 16 : 13}px;box-sizing:border-box;`
            + `background:${i === 0 ? AKZENT + '22' : 'rgba(246,239,230,.035)'};`
            + `border:1px solid ${i === 0 ? AKZENT : 'rgba(246,239,230,.09)'};`
            + `box-shadow:${i === 0 ? '0 0 22px ' + AKZENT + '55' : 'none'}`)}>
            <span style={sx(`font-family:${SPARTAN};font-size:${gross ? 26 : 20}px;font-weight:900;line-height:1;color:${AKZENT}`)}>{i + 1}</span>
            <span style={sx(`font-size:${gross ? '17px' : '13.5px'};font-weight:700;color:${CREME}`)}>{o}</span>
          </span>
        ))}
      </div>
    </>
  );

  const text = (
    <div style={sx('min-width:0')}>
      <Kicker nummer="[ 03 ]" label={L.probe.label} />
      <h2 style={sx(`margin:0 0 16px;font-family:${SPARTAN};`
        + `font-size:${mobil ? '40px' : 'clamp(44px,5vw,78px)'};font-weight:900;line-height:.92;letter-spacing:-.032em;color:${CREME}`)}>
        {L.probe.h2}
      </h2>
      <p style={sx('margin:0 0 26px;max-width:54ch;font-size:18px;line-height:1.6;font-weight:500;color:rgba(246,239,230,.8)')}>{L.probe.sub}</p>

      {/* Der Anspruch stand bisher in einem gerahmten Kasten mit farbigem
          Rand. Das ist Karten-Vokabular, dasselbe, das bei 01 und 02 raus
          ist. Eine Haarlinie links reicht vollkommen. */}
      <div style={sx(`margin:0 0 26px;padding-left:18px;border-left:2px solid ${AKZENT}`)}>
        <div style={sx(`font-size:18px;font-weight:900;line-height:1.35;color:${AKZENT};margin-bottom:6px`)}>{cat.claim}</div>
        <div style={sx('font-size:15.5px;line-height:1.6;font-weight:500;color:rgba(246,239,230,.78)')}>{cat.detail}</div>
      </div>

      <div style={sx('display:flex;flex-direction:column;gap:10px;font-size:15.5px;font-weight:700;color:#F6EFE6;margin-bottom:26px')}>
        <span style={sx('display:flex;align-items:center;gap:11px')}><span style={sx('color:#FA4BA3')}>✓</span>{L.probe.check1}</span>
        <span style={sx('display:flex;align-items:center;gap:11px')}><span style={sx('color:#FA4BA3')}>✓</span>{L.probe.check2}</span>
      </div>

      {/* Die fuenf Typen als Reihe unter dem Text statt als Spalte daneben:
          die Spalte kostete 200 px Breite genau dort, wo der Text sie
          braucht. Im Stapel-Entwurf faellt die Reihe weg, dort sind die fuenf
          das Bild. */}
      {entwurf !== 3 && (
        <div style={sx('display:flex;flex-wrap:wrap;gap:9px')}>
          {PROBE_TYPEN.map((t, i) => (
            <span key={t.k} style={sx('display:inline-flex;align-items:center;gap:9px;padding:10px 15px;border-radius:999px;'
              + `font-size:14.5px;font-weight:900;white-space:nowrap;`
              + `background:${i === 0 ? t.col + '26' : 'rgba(246,239,230,.03)'};`
              + `border:1px solid ${i === 0 ? t.col : 'rgba(246,239,230,.1)'};`
              + `color:${i === 0 ? t.col : 'rgba(246,239,230,.78)'}`)}>
              <span style={sx(`display:block;width:22px;height:22px;background:url(${t.icon}) center/contain no-repeat`)}></span>
              {L.probe.cats[t.k].name}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  const handy = (
    <div style={sx(`width:${mobil ? '100%' : '340px'};max-width:340px;aspect-ratio:340/580;box-sizing:border-box;`
      + 'padding:18px 15px;display:flex;flex-direction:column;border-radius:44px;'
      + 'background:linear-gradient(180deg,#150c20,#0a0714);border:7px solid #06060c;box-shadow:0 30px 70px rgba(0,0,0,.6)')}>
      <div style={sx('display:flex;align-items:center;gap:10px;padding:10px 11px;border-radius:16px;'
        + 'border:1px solid rgba(168,85,247,.45);background:rgba(168,85,247,.07);margin-bottom:12px;flex:none')}>
        <span style={sx(teammarke('#A855F7', '/assets/av-qq-crystal-ball.webp', 30))}></span>
        <span style={sx('flex:1;font-size:14px;font-weight:900;color:#A855F7')}>{L.hero.phoneTeamA}</span>
      </div>
      <div style={sx(`flex:1;min-height:0;padding:16px 14px;border-radius:20px;border:1px solid ${AKZENT}40;background:rgba(246,239,230,.025);box-sizing:border-box`)}>
        {frageBild(false)}
      </div>
      <div style={sx('margin-top:auto;padding-top:11px;text-align:center;font-size:11px;font-weight:800;color:rgba(246,239,230,.62);flex:none')}>
        {L.probe.tapAnswer}
      </div>
    </div>
  );

  const wand = (
    <div style={sx('width:100%;max-width:520px;box-sizing:border-box;padding:34px 32px;'
      + `border-radius:26px;border:1px solid ${HAAR};background:radial-gradient(ellipse at 50% 0%,rgba(246,239,230,.05),transparent 70%)`)}>
      {frageBild(true)}
    </div>
  );

  // Fuenf Blaetter, gedreht und versetzt, das vorderste lesbar.
  const stapel = (
    <div style={sx(`position:relative;width:100%;max-width:${mobil ? '320px' : '420px'};aspect-ratio:1/1.06`)}>
      {PROBE_TYPEN.slice().reverse().map((t, j) => {
        const i = PROBE_TYPEN.length - 1 - j;      // 4 hinten ... 0 vorn
        const vorn = i === 0;
        const dreh = [-2, 5, -7, 9, -11][i];
        return (
          <div key={t.k} className="mkKachel"
            // Nach oben rechts aufgefaechert, nicht gerade gestapelt: gerade
            // gestapelt verdeckt das vorderste Blatt genau die Kategorie-Marke
            // der hinteren, und dann sieht man nicht, dass es fuenf
            // verschiedene sind. Das ist aber die ganze Aussage.
            style={sx(`position:absolute;left:${i * 6}%;top:${(4 - i) * 4.2}%;width:76%;height:83%;`
              + `--r:${dreh}deg;box-sizing:border-box;border-radius:22px;padding:${vorn ? '22px 20px' : '16px'};`
              + `background:linear-gradient(180deg,#1a1329,#120d1e);border:1px solid ${vorn ? t.col + '80' : 'rgba(246,239,230,.13)'};`
              + `box-shadow:0 ${vorn ? 26 : 14}px ${vorn ? 46 : 26}px rgba(0,0,0,.5)`)}>
            {vorn ? frageBild(false) : (
              <span style={sx(`display:inline-flex;align-items:center;gap:8px;padding:6px 13px;border-radius:999px;`
                + `background:${t.col}1f;border:1px solid ${t.col}66;font-size:11.5px;font-weight:900;color:${t.col}`)}>
                <span style={sx(`display:block;width:16px;height:16px;background:url(${t.icon}) center/contain no-repeat`)}></span>
                {L.probe.cats[t.k].name}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );

  // P4: das Handy vorn, die vier uebrigen Typen dahinter aufgefaechert. Sie
  // zeigen nur ihre Marke, mehr braucht es nicht: sie beantworten die Frage
  // "wie viele gibt es", nicht "wie sieht die Frage aus".
  const handyStapel = (
    <div style={sx(`position:relative;width:100%;max-width:${mobil ? '330px' : '470px'};aspect-ratio:${mobil ? '330/600' : '470/620'}`)}>
      {PROBE_TYPEN.slice(1).reverse().map((t, j) => {
        const i = 4 - j;                       // 4 ganz hinten ... 1 direkt hinter dem Handy
        return (
          <div key={t.k} className="mkKachel"
            // Treppe nach oben rechts, und die Marke sitzt an der RECHTEN
            // Kante: links deckt das Handy die Blaetter ab, dort waere sie
            // unsichtbar, und dann zeigte der Faecher nur graue Raender.
            style={sx(`position:absolute;right:${(4 - i) * 5}%;top:${(4 - i) * 4}%;width:${mobil ? 58 : 54}%;height:62%;`
              + `--r:${[0, 3, 6, 9, 12][i]}deg;transform-origin:bottom left;box-sizing:border-box;padding:14px 16px;`
              + 'border-radius:24px;background:linear-gradient(180deg,#1a1329,#120d1e);'
              + `border:1px solid rgba(246,239,230,.13);box-shadow:0 14px 28px rgba(0,0,0,.5);`
              + 'display:flex;justify-content:flex-end;align-items:flex-start')}>
            {/* Nur das Zeichen, kein Name: vom Blatt ist neben dem Handy rund
                ein Viertel zu sehen, und ein Name wie „Schaetzchen" wird darin
                angeschnitten. Die fuenf Namen stehen ohnehin als Reihe unter
                dem Text. Der Faecher beantwortet nur „es gibt mehr". */}
            <span style={sx(`display:flex;align-items:center;justify-content:center;width:40px;height:40px;flex:none;`
              + `border-radius:13px;background:${t.col}1f;border:1px solid ${t.col}66`)}>
              <span style={sx(`display:block;width:24px;height:24px;background:url(${t.icon}) center/contain no-repeat`)}></span>
            </span>
          </div>
        );
      })}
      <div style={sx('position:absolute;left:0;bottom:0;width:74%')}>{handy}</div>
    </div>
  );

  const rechts = entwurf === 1 ? handy : entwurf === 4 ? handyStapel
    : entwurf === 2 ? wand : stapel;
  return (
    <section style={sx(`max-width:1240px;margin:0 auto;padding:${mobil ? '52px 22px 70px' : '96px 40px 120px'}`)}>
      <div style={sx(`display:grid;gap:${mobil ? '34px' : '56px'};align-items:center;`
        + `grid-template-columns:${mobil ? '1fr' : entwurf === 1 ? '1fr 340px' : entwurf === 4 ? '1fr 470px' : '1fr 520px'}`)}>
        {text}
        <div style={sx(mobil ? 'display:flex;justify-content:center' : 'display:flex;justify-content:flex-end')}>{rechts}</div>
      </div>
    </section>
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
@keyframes mkWisch{from{background-position:100% 0}to{background-position:0 0}}
@keyframes mkNachlauf{0%{opacity:.55;transform:translateY(0)}100%{opacity:0;transform:translateY(-30px)}}
.mkWisch{animation:mkWisch .62s cubic-bezier(.4,0,.2,1) both}
.mkNachlauf{animation:mkNachlauf .95s cubic-bezier(.22,1,.36,1) both}
@media (prefers-reduced-motion:reduce){.mkWisch,.mkNachlauf{animation:none}.mkNachlauf{display:none}}
.mkKachel{transform:rotate(var(--r,0deg));transition:transform .34s ${EASE},filter .34s ${EASE}}
@media (hover:hover) and (pointer:fine){
  .mkKachel:hover{transform:rotate(calc(var(--r,0deg) * .4)) translateY(-8px) scale(1.08);filter:brightness(1.08)}
}
@media (prefers-reduced-motion:reduce){.mkKachel{transition:none}}
button:focus-visible{outline:3px solid #FFC7E4;outline-offset:3px}
`;
