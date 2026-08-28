/**
 * Die wechselnde Avatarwand: gehoert sie auf die Website, und wenn ja, wohin?
 *
 * 2026-08-28, Wolf: "in meiner gleich gehts los beamerview habe ich so ein
 * nices chaning team avatar pattern gebaut, waere das noch was fuer die
 * sektion cozyquiz auf der website? oder too much?"
 *
 * Die Wand selbst ist aus der App uebernommen, nicht neu erfunden. Vorlage ist
 * das Panel 'avatare' in frontend/src/components/CozyQuizPausedView.tsx, dort
 * die Komponente AvatarWand. Von dort auch der Takt, und der ist der ganze
 * Trick:
 *   Objekt  alle 420 ms, immer nur EINE Kachel, reihum.
 *   Farbe   alle 2,2 s, ALLE Kacheln zugleich um eins weiter, mit gestaffelter
 *           Verzoegerung, so dass eine Welle diagonal ueber die Wand laeuft.
 * Zwei getrennte Uhren, damit man sieht, dass Objekt und Farbe NICHT gepaart
 * sind -- genau das ist die Aussage der Folie. Und acht Kacheln bei acht
 * Farben heisst, dass jede Farbe genau einmal im Bild steht; auch das ist
 * Wolfs eigene Entscheidung aus der App ("da es maximal 8 teams mit 8 farben
 * sind ingame, wuerde ich nur 8 kacheln machen?").
 *
 * Die Frage "oder too much" laesst sich nur am Bild beantworten, deshalb drei
 * Fassungen, davon eine ohne.
 */
import { useEffect, useState } from 'react';
import { sx } from '../onepage/sx';
import { kachel, teammarke } from '../../qqKachel';
import { CREME, HAAR, SPARTAN, EASE } from './stil';

/** Die acht Teamfarben, 1:1 aus QQ_TEAM_PALETTE der App. */
const FARBEN = ['#F97316', '#22C55E', '#14B8A6', '#A855F7', '#FACC15', '#3B82F6', '#EC4899', '#EF4444'];

/**
 * Die Motive. In der App sind es 48; hier liegen die 25, die auf der Landing
 * schon gebraucht werden oder klein noch zu erkennen sind. Mehr braucht die
 * Wand nicht: acht Kacheln koennen ohnehin nur acht auf einmal zeigen, und
 * was zaehlt ist, dass keins doppelt steht und der Vorrat nicht sichtbar
 * durchlaeuft.
 */
const MOTIVE = [
  'donut', 'strawberry', 'game-die', 'crystal-ball', 'mushroom', 'table-lamp',
  'teapot', 'treasure-chest', 'paper-boat', 'croissant', 'cookie', 'compass',
  'popcorn', 'rocket', 'cheese', 'candle', 'houseplant', 'seashell',
  'snowflake', 'hot-air-balloon', 'playing-card', 'wizard-hat', 'disco-ball',
  'acorn', 'camera',
];

export type AvatarEntwurf = 1 | 2 | 3;

export const AVATAR_ENTWUERFE: Record<AvatarEntwurf, { name: string; idee: { de: string; en: string } }> = {
  1: {
    name: 'Band unter dem Text',
    idee: {
      de: 'Die Wand steht klein in der Zeile CozyQuiz, unter der Aufzaehlung, mit der Zeile "48 Objekte × 8 Farben, frei kombinierbar" darunter. Nicht in der Objektspalte -- dort steht das Brett, und zwei bewegte Dinge in einer Zeile kaempfen um denselben Blick. Und hier laeuft sie RUHIG: die Farbwelle wandert langsam weiter (3,4 statt 2,2 s), die Objekte springen erst, wenn jemand hinzeigt. Auf dem Beamer in drei Metern liest sich der App-Takt als lebendig, auf einer Website in fuenfzig Zentimetern als Flackern. Wolfs Argument traegt die Fassung: bei CrowdQuiz waehlt man eine bestehende Fraktion, bei CozyQuiz stellt man Farbe und Emoji selbst zusammen -- ohne Bezug zu CozyQuiz haette die Wand keinen Ort.',
      en: 'The wall sits small in the CozyQuiz row, under the bullets, with the line "48 objects × 8 colours, mix freely" beneath it. Not in the object column -- the board lives there, and two moving things in one row fight over the same glance. And here it runs CALM: the colour wave drifts on slowly (3.4s instead of 2.2), the objects only jump when someone points at it. On a projector three metres away the app rhythm reads as lively; on a website fifty centimetres away it reads as flicker. Wolf\'s own argument carries this version: in CrowdQuiz you pick an existing faction, in CozyQuiz you put colour and emoji together yourself -- without the tie to CozyQuiz the wall would have no home.',
    },
  },
  2: {
    name: 'Folie auf der Leinwand',
    idee: {
      de: 'Die Wand bleibt, wo sie herkommt: als Folie auf der Beamerleinwand in 04, zwischen der Begruessung und der ersten Frage. Das ist die ehrlichste Fassung, denn genau dort sieht man sie an einem echten Abend, und sie kostet keinen einzigen Pixel Seitenhoehe. Der Preis ist die Wartezeit -- die Leinwand braucht heute 3,8 Sekunden bis zur ersten Frage, mit einer Folie mehr sind es rund sieben, und so lange bleibt kaum jemand mit der Maus drauf.',
      en: 'The wall stays where it comes from: a slide on the projection in section 04, between the welcome and the first question. The most honest version, because that is exactly where you see it on a real night, and it costs no page height at all. The price is the wait -- the projection takes 3.8 seconds to the first question today, with one more slide it is about seven, and few people keep the mouse there that long.',
    },
  },
  3: {
    name: 'Gar nicht',
    idee: {
      de: 'Die Gegenprobe, und die Antwort auf "oder too much". Die Zeile CozyQuiz ohne die Wand, also wie sie heute live steht. Wer die drei nacheinander anschaut, sieht, ob die Wand etwas hinzufuegt oder nur beschaeftigt -- und ob das Brett rechts danach noch der Hauptdarsteller ist.',
      en: 'The control, and the answer to "or too much". The CozyQuiz row without the wall, as it is live today. Looking at the three in turn shows whether the wall adds something or merely keeps busy -- and whether the board on the right is still the lead after it.',
    },
  },
};

/**
 * Die Wand selbst. Zwei Uhren wie in der App.
 * @param kachel Kantenlaenge einer Kachel in px.
 */
export function Wand({ kachel: kw, spalten = 4, ruhig = false }: {
  kachel: number; spalten?: number;
  /**
   * Ruhig heisst: die Farbwelle laeuft langsam weiter, die Objekte springen
   * erst, wenn jemand hinzeigt.
   *
   * 2026-08-28. Wolf: "aber du hast gesagt das wechselnde grid ist zu unruhig
   * im sektor cozyquiz... jetzt widersprichst du dir". Er hat recht, ich habe
   * mir widersprochen -- die Ueberschrift meiner Antwort lautete "nicht in der
   * Zeile CozyQuiz" und die Empfehlung war dann V1, und V1 liegt genau dort.
   *
   * Gemeint war: nicht in die OBJEKTSPALTE neben das Brett. Dort stehen sonst
   * zwei bewegte Dinge in einer Zeile, und das Brett verliert, weil es langsam
   * ist und die Wand schnell.
   *
   * Der Einwand trifft aber auch unter dem Text noch zur Haelfte. Auf dem
   * Beamer, drei Meter entfernt, liest sich der App-Takt (Objekt alle 420 ms)
   * als lebendig. Auf einer Website in fuenfzig Zentimetern Abstand liest er
   * sich als Flackern, und daneben spielt das Brett.
   *
   * Also wird getrennt, was laut ist, von dem, was leise ist. Der Farbwechsel
   * ist eine Kreuzblende ueber 900 ms, die als Welle laeuft -- das ist der
   * leise Teil und darf immer laufen, nur langsamer (3,4 statt 2,2 s). Das
   * springende Objekt ist der laute Teil und kommt erst beim Zeigen.
   *
   * Der Satz "frei kombinierbar" bleibt trotzdem sichtbar: die Farbe wandert
   * ueber die Objekte hinweg, und genau das ist ja die Aussage.
   */
  ruhig?: boolean;
}) {
  const anzahl = 8;
  const [objekte, setObjekte] = useState<number[]>(() => Array.from({ length: anzahl }, (_, i) => i));
  const [farbSchritt, setFarbSchritt] = useState(0);
  const [zeigt, setZeigt] = useState(false);

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (ruhig && !zeigt) { const nur = setInterval(() => setFarbSchritt(f => f + 1), 3400); return () => clearInterval(nur); }
    let n = 0;
    const objektUhr = setInterval(() => {
      const k = n % anzahl;
      setObjekte(vorher => {
        const nachher = [...vorher];
        // Nicht "+ anzahl" rechnen: das haelt nur so lange, wie der Vorrat
        // durch acht teilbar ist. Stattdessen das naechste Motiv suchen, das
        // gerade NICHT im Bild steht.
        let kandidat = (nachher[k] + 1) % MOTIVE.length;
        let versuche = 0;
        while (nachher.includes(kandidat) && versuche < MOTIVE.length) {
          kandidat = (kandidat + 1) % MOTIVE.length; versuche++;
        }
        nachher[k] = kandidat;
        return nachher;
      });
      n++;
    }, 420);
    const farbUhr = setInterval(() => setFarbSchritt(f => f + 1), ruhig ? 3400 : 2200);
    return () => { clearInterval(objektUhr); clearInterval(farbUhr); };
  }, [ruhig, zeigt]);

  return (
    <div onMouseEnter={() => setZeigt(true)} onMouseLeave={() => setZeigt(false)}
      style={sx(`display:grid;grid-template-columns:repeat(${spalten},${kw}px);gap:${Math.round(kw * 0.13)}px`)}>
      {objekte.map((mi, i) => {
        const farbe = FARBEN[(i + farbSchritt) % FARBEN.length];
        // Die Staffelung macht aus dem gleichzeitigen Farbwechsel eine Welle,
        // die diagonal ueber die Wand laeuft: Spalte plus Reihe als Schrittmass.
        const spalte = i % spalten, reihe = Math.floor(i / spalten);
        const verzug = (spalte + reihe) * 0.09;
        return (
          <span key={i} style={sx('display:block;' + teammarke(farbe, `/assets/av-qq-${MOTIVE[mi]}.webp`, kw)
            + `transition:background-color .9s ${EASE} ${verzug}s,background-image .35s ${EASE}`)}></span>
        );
      })}
    </div>
  );
}

export function AvatarWand({ mobil, entwurf, L }: {
  mobil: boolean; entwurf: AvatarEntwurf;
  L: { modes: { quizChip: string; quizLead: string; quizBullets: string[] } };
}) {
  const rahmen = `max-width:1180px;margin:0 auto;padding:52px 24px;border-top:1px solid ${HAAR};border-bottom:1px solid ${HAAR}`;

  const name = (
    <div>
      <div style={sx(`font-family:${SPARTAN};font-size:clamp(38px,4vw,58px);font-weight:900;line-height:.9;letter-spacing:-.03em;color:${CREME}`)}>CozyQuiz</div>
      <div style={sx('margin-top:12px;font-size:12px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;color:rgba(246,239,230,.62)')}>{L.modes.quizChip}</div>
    </div>
  );

  const text = (
    <>
      <p style={sx('margin:0 0 26px;font-size:19px;line-height:1.55;font-weight:500;color:rgba(246,239,230,.82);max-width:56ch;text-wrap:pretty')}>{L.modes.quizLead}</p>
      <ul style={sx('margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:12px')}>
        {L.modes.quizBullets.map(b => (
          <li key={b} style={sx('display:flex;gap:14px;font-size:15.5px;line-height:1.5;font-weight:600;color:rgba(246,239,230,.7);text-wrap:pretty')}>
            <span style={sx('flex:none;width:18px;height:1px;margin-top:11px;background:#FA4BA3')}></span>{b}
          </li>
        ))}
      </ul>
      {entwurf === 1 && (
        <div style={sx('margin-top:28px')}>
          <Wand kachel={mobil ? 48 : 54} ruhig />
          <div style={sx('margin-top:13px;font-size:13px;font-weight:800;color:rgba(246,239,230,.55)')}>
            48 Objekte × 8 Farben, frei kombinierbar
          </div>
        </div>
      )}
    </>
  );

  /**
   * Das Brett nur als Platzhalter: hier geht es um die Zeile und darum, ob die
   * Wand dem Brett die Aufmerksamkeit nimmt. Ein festes Muster genuegt dafuer,
   * es muss nicht spielen.
   */
  const BELEGT: Record<number, string> = {
    7: '#FA4BA3', 8: '#FA4BA3', 13: '#FA4BA3', 14: '#FA4BA3', 20: '#FA4BA3',
    9: '#3B82F6', 10: '#3B82F6', 15: '#3B82F6', 16: '#3B82F6',
    22: '#22C55E', 23: '#22C55E', 28: '#22C55E', 29: '#22C55E', 26: '#22C55E',
  };
  const brett = (
    <div style={sx('min-width:0;display:flex;justify-content:flex-end')}>
      <div style={sx('width:340px;height:340px;border-radius:14px;border:2px solid rgba(246,239,230,.14);box-sizing:border-box;'
        + 'display:grid;grid-template-columns:repeat(6,1fr);grid-template-rows:repeat(6,1fr);gap:5px;padding:8px')}>
        {Array.from({ length: 36 }, (_, i) => (
          <span key={i} style={sx(BELEGT[i]
            ? kachel(BELEGT[i], '6px')
            : 'border-radius:6px;background:rgba(246,239,230,.05);box-shadow:inset 0 1px 2px rgba(0,0,0,.4)')}></span>
        ))}
      </div>
    </div>
  );

  if (entwurf === 2) {
    return (
      <div style={sx(rahmen)}>
        <div style={sx('max-width:760px;margin:0 auto')}>
          <div style={sx('margin-bottom:14px;font-size:12px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;color:rgba(246,239,230,.55)')}>
            04 · Auf der Leinwand
          </div>
          {/* Die Folie in 16:9, so wie sie auf der Leinwand in 04 stuende. */}
          <div style={sx('position:relative;width:100%;aspect-ratio:16/9;border-radius:4px;overflow:hidden;box-sizing:border-box;'
            + 'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;padding:28px;'
            + 'border:1px solid rgba(246,239,230,.22);background:linear-gradient(180deg,#141024,#0a0714);'
            + 'box-shadow:0 0 60px rgba(255,242,250,.06),inset 0 0 90px rgba(255,242,250,.03)')}>
            <div style={sx(`font-family:${SPARTAN};font-size:clamp(22px,3.2vw,38px);font-weight:900;line-height:1;letter-spacing:-.02em;color:${CREME};text-align:center`)}>
              Sucht euch ein Team-Emoji aus
            </div>
            <Wand kachel={mobil ? 52 : 74} />
            <div style={sx('font-size:13.5px;font-weight:800;color:rgba(246,239,230,.55);text-align:center')}>
              48 Objekte × 8 Farben, frei kombinierbar
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={sx(rahmen)}>
      <div style={sx(`display:grid;grid-template-columns:${mobil ? '1fr' : '290px 1fr 340px'};gap:48px;align-items:start`)}>
        {name}
        <div>{text}</div>
        {!mobil && brett}
      </div>
    </div>
  );
}
