/**
 * Entwuerfe fuer die Stationen 04 bis 07.
 *
 * 2026-08-27, Wolf: "du koenntest neue mockups bauen fuer die weiteren
 * teile?" Alle Entwuerfe fahren die Handschrift A („Die Leinwand"), die bei
 * Station 01 gewaehlt wurde: grosse Schrift, Haarlinien statt Karten, flacher
 * Grund, ein Akzent. Verglichen wird also nicht mehr die Handschrift, sondern
 * nur noch, was ein Abschnitt aus seinem Inhalt macht.
 *
 * Statisch. Ein Mockup entscheidet die Form, nicht die Bedienung.
 */
import { sx } from '../onepage/sx';
import type { OnePageDict } from '../onepage/texts';
import { CREME, HAAR, PINK, SPARTAN, H2, Kicker, Zeile } from './stil';

type P = { L: OnePageDict; mobil: boolean; entwurf: number };

const RAHMEN = (mobil: boolean) => `max-width:1240px;margin:0 auto;padding:${mobil ? '52px 22px 70px' : '96px 40px 120px'}`;

// ═══════════════════════════════════════════════ 04 Ablauf
export const ABLAUF_ENTWUERFE = {
  1: {
    name: 'Zwei Listen',
    idee: {
      de: 'Was du mitbringst und was sie brauchen, als zwei Listen nebeneinander, nur durch eine Haarlinie getrennt. Ruhig und sofort vergleichbar. Sagt aber nicht, dass die eine Liste die wichtigere ist.',
      en: 'What you bring and what they need, as two lists side by side, separated only by a hairline. Calm and immediately comparable. Does not say that one list matters more.',
    },
  },
  2: {
    name: 'Das Ungleichgewicht',
    idee: {
      de: 'Die Aussage des Abschnitts ist nicht „hier sind zwei Listen", sondern „ihr braucht fast nichts". Also steht links riesig, was sie brauchen, und rechts klein und vollstaendig, was du mitbringst. Die Form sagt dasselbe wie der Satz.',
      en: 'The point of this section is not “here are two lists” but “you need almost nothing”. So what they need stands huge on the left, and what you bring stands small and complete on the right. The form says what the sentence says.',
    },
  },
  3: {
    name: 'Der Abend',
    idee: {
      de: 'Was du mitbringst, in der Reihenfolge des Abends: Aufbau, Moderation, Fragen, Spiel. Nummeriert wie die Stationen der Seite. Macht aus einer Aufzaehlung einen Ablauf, und der Abschnitt heisst schliesslich so.',
      en: 'What you bring, in the order of the evening: setup, hosting, questions, game. Numbered like the stations of the page. Turns a list into a sequence, and the section is called “How it works” after all.',
    },
  },
} as const;

export function Ablauf({ L, mobil, entwurf }: P) {
  const A = L.ablauf;
  const liste = (titel: string, punkte: readonly string[], stark: boolean) => (
    <div>
      <div style={sx(`margin-bottom:${mobil ? '14px' : '18px'};font-size:12px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;color:${stark ? PINK : 'rgba(246,239,230,.55)'}`)}>{titel}</div>
      <ul style={sx('margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:13px')}>
        {punkte.map(t => (
          <li key={t} style={sx('display:flex;gap:14px;font-size:16px;line-height:1.5;font-weight:600;color:rgba(246,239,230,.82);text-wrap:pretty')}>
            <span style={sx(`flex:none;width:16px;height:1px;margin-top:12px;background:${stark ? PINK : 'rgba(246,239,230,.35)'}`)}></span>
            {t}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <section style={sx(RAHMEN(mobil))}>
      <Kicker nummer="[ 04 ]" label={A.label} />
      <H2 text={A.h2} mobil={mobil} />
      <p style={sx(`margin:0 0 ${mobil ? '20px' : '30px'};max-width:56ch;font-size:18px;line-height:1.6;font-weight:500;color:rgba(246,239,230,.78)`)}>{A.sub}</p>

      {entwurf === 1 && (
        <Zeile spalten="1fr 1fr" letzte mobil={mobil}>
          {liste(A.duo1Title, A.duo1, false)}
          {liste(A.duo0Title, A.duo0, true)}
        </Zeile>
      )}

      {entwurf === 2 && (
        <Zeile spalten="1fr 380px" letzte mobil={mobil}>
          <div>
            <div style={sx(`margin-bottom:16px;font-size:12px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;color:rgba(246,239,230,.55)`)}>{A.duo1Title}</div>
            {/* Der erste Punkt gross, der Rest klein: „eine freie Wand" ist die
                Antwort, alles andere hat die Gruppe ohnehin dabei. */}
            <div style={sx(`font-family:${SPARTAN};font-size:${mobil ? '34px' : 'clamp(34px,3.7vw,58px)'};font-weight:900;line-height:.98;letter-spacing:-.03em;color:${CREME};text-wrap:balance`)}>
              {A.duo1[0]}
            </div>
            <div style={sx('margin-top:18px;font-size:15.5px;line-height:1.6;font-weight:600;color:rgba(246,239,230,.6)')}>
              {A.duo1.slice(1).join(' · ')}
            </div>
          </div>
          {liste(A.duo0Title, A.duo0, true)}
        </Zeile>
      )}

      {entwurf === 3 && (
        <>
          <Zeile spalten="1fr" mobil={mobil}>
            <div style={sx(`display:grid;gap:${mobil ? '26px' : '30px'};grid-template-columns:${mobil ? '1fr' : 'repeat(4,1fr)'}`)}>
              {A.duo0.map((t, i) => (
                <div key={t}>
                  <div style={sx(`font-family:${SPARTAN};font-size:${mobil ? '34px' : '44px'};font-weight:900;line-height:1;letter-spacing:-.04em;color:${PINK};opacity:.4`)}>{`0${i + 1}`}</div>
                  <div style={sx('margin-top:10px;font-size:16px;line-height:1.5;font-weight:700;color:#F6EFE6;text-wrap:pretty')}>{t}</div>
                </div>
              ))}
            </div>
          </Zeile>
          <Zeile spalten="240px 1fr" letzte mobil={mobil}>
            <div style={sx('font-size:12px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;color:rgba(246,239,230,.55)')}>{A.duo1Title}</div>
            <div style={sx('font-size:16px;line-height:1.6;font-weight:600;color:rgba(246,239,230,.8)')}>{A.duo1.join(' · ')}</div>
          </Zeile>
        </>
      )}
    </section>
  );
}

// ═══════════════════════════════════════════════ 05 Ueber mich
export const JOH_ENTWUERFE = {
  1: {
    name: 'Das Zitat',
    idee: {
      de: 'Nur das Zitat, so gross wie eine Ueberschrift, mit den betonten Woertern in Pink. Darunter Name und Rolle. Kein Bild, keine zweite Spalte. Ehrlich, solange es keine echten Fotos gibt, und die Schrift traegt hier ohnehin.',
      en: 'Just the quote, as large as a heading, with the stressed words in pink. Name and role underneath. No image, no second column. Honest while there are no real photos, and the type carries it anyway.',
    },
  },
  2: {
    name: 'Zitat und Fakten',
    idee: {
      de: 'Zitat links, rechts die vier harten Angaben als Liste: Moderation vor Ort, Gruppengroesse, Abstimmung, Region. Wer wissen will, ob es fuer ihn passt, findet es hier, ohne die FAQ zu lesen.',
      en: 'Quote on the left, the four hard facts on the right: hosting in person, group size, tailoring, region. Anyone wondering whether it fits them finds it here without reading the FAQ.',
    },
  },
  3: {
    name: 'Der Wolf',
    idee: {
      de: 'Zitat links, rechts der Wolf gross als Objekt, so wie im Hero die Kacheln stehen. Bringt die Marke ins Bild, ohne ein Foto zu behaupten, das es noch nicht gibt. Risiko: ein Logo ist kein Mensch, und der Abschnitt heisst „Ueber mich".',
      en: 'Quote on the left, the wolf large as an object on the right, the way the tiles sit in the hero. Brings the brand into the picture without claiming a photo that does not exist yet. Risk: a logo is not a person, and the section is called “About me”.',
    },
  },
} as const;

export function UeberMich({ L, mobil, entwurf }: P) {
  const J = L.johannes;
  const zitat = (
    <div style={sx(`font-family:${SPARTAN};font-size:${mobil ? '30px' : entwurf === 1 ? 'clamp(38px,4.4vw,72px)' : 'clamp(30px,3.2vw,48px)'};`
      + 'font-weight:900;line-height:1.06;letter-spacing:-.028em;text-wrap:balance')}>
      {J.quote.map((w, i) => (
        <span key={i} style={sx(`color:${w.hot ? PINK : CREME}`)}>{w.w}{i < J.quote.length - 1 ? ' ' : ''}</span>
      ))}
    </div>
  );
  const signatur = (
    <div style={sx(`margin-top:${mobil ? '22px' : '30px'};display:flex;align-items:baseline;gap:12px;flex-wrap:wrap`)}>
      <span style={sx(`font-family:${SPARTAN};font-size:22px;font-weight:900;color:${CREME}`)}>{J.name}</span>
      <span style={sx('font-size:12px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;color:rgba(246,239,230,.55)')}>{J.role}</span>
    </div>
  );
  const koerper = (
    <p style={sx('margin:18px 0 0;max-width:52ch;font-size:17px;line-height:1.6;font-weight:500;color:rgba(246,239,230,.78)')}>{J.body}</p>
  );

  return (
    <section style={sx(RAHMEN(mobil))}>
      <Kicker nummer="[ 05 ]" label={J.kicker} />
      {entwurf === 1 && (
        <div style={sx('max-width:22ch')}>{null}</div>
      )}
      {entwurf === 1 ? (
        <div>
          {zitat}
          {koerper}
          {signatur}
        </div>
      ) : (
        <Zeile spalten={entwurf === 3 ? '1fr 300px' : '1fr 340px'} letzte mobil={mobil}>
          <div>
            {zitat}
            {koerper}
            {signatur}
          </div>
          {entwurf === 2 ? (
            <ul style={sx('margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:14px')}>
              {J.chips.map(c => (
                <li key={c} style={sx(`display:flex;gap:14px;padding-bottom:14px;border-bottom:1px solid ${HAAR};font-size:15.5px;line-height:1.45;font-weight:700;color:rgba(246,239,230,.82)`)}>
                  <span style={sx(`flex:none;width:6px;height:6px;margin-top:8px;border-radius:2px;background:${PINK}`)}></span>
                  {c}
                </li>
              ))}
            </ul>
          ) : (
            <div aria-hidden="true" style={sx(`${mobil ? '' : 'margin-left:auto;'}width:100%;max-width:260px;aspect-ratio:1/1;`
              + 'background:url(/assets/wolf-party.webp) center/contain no-repeat;filter:drop-shadow(0 18px 30px rgba(0,0,0,.6))')}></div>
          )}
        </Zeile>
      )}
    </section>
  );
}

// ═══════════════════════════════════════════════ 06 Fragen
export const FAQ_ENTWUERFE = {
  1: {
    name: 'Offen, zwei Spalten',
    idee: {
      de: 'Alle sechs Fragen mit Antwort sichtbar, in zwei Spalten. Niemand muss klicken, um zu erfahren, was es kostet. Braucht mehr Hoehe, dafuer liest man alles beim Scrollen mit.',
      en: 'All six questions with answers visible, in two columns. Nobody has to click to find out what it costs. Takes more height, but everything is read while scrolling.',
    },
  },
  2: {
    name: 'Frage links, Antwort rechts',
    idee: {
      de: 'Jede Frage eine Zeile, Frage links gross, Antwort rechts, dazwischen eine Haarlinie. Genau die Form der Stationen 01 und 02, der Abschnitt faellt also nicht mehr aus der Reihe.',
      en: 'One row per question, question large on the left, answer on the right, a hairline between. Exactly the form of stations 01 and 02, so this section no longer breaks the pattern.',
    },
  },
  3: {
    name: 'Aufklappen',
    idee: {
      de: 'Wie heute, nur ohne Kasten: Haarlinie statt Rahmen, Plus statt Pfeil. Am kuerzesten, aber der Preis versteckt sich hinter einem Klick, und genau danach suchen die meisten.',
      en: 'Like today, minus the box: hairline instead of a frame, plus instead of an arrow. Shortest, but the price hides behind a click, and that is what most people look for.',
    },
  },
} as const;

export function Fragen({ L, mobil, entwurf }: P) {
  const F = L.faq;
  return (
    <section style={sx(RAHMEN(mobil))}>
      <Kicker nummer="[ 06 ]" label={F.label} />
      <H2 text={F.h2} mobil={mobil} />

      {entwurf === 1 && (
        <div style={sx(`margin-top:${mobil ? '24px' : '36px'};display:grid;gap:${mobil ? '26px' : '34px 56px'};grid-template-columns:${mobil ? '1fr' : '1fr 1fr'}`)}>
          {F.items.map(it => (
            <div key={it.q} style={sx(`padding-top:22px;border-top:1px solid ${HAAR}`)}>
              <div style={sx(`margin-bottom:9px;font-size:18px;font-weight:900;line-height:1.3;color:${CREME};text-wrap:balance`)}>{it.q}</div>
              <div style={sx('font-size:15.5px;line-height:1.62;font-weight:500;color:rgba(246,239,230,.76);text-wrap:pretty')}>{it.a}</div>
            </div>
          ))}
        </div>
      )}

      {entwurf === 2 && (
        <div style={sx(`margin-top:${mobil ? '20px' : '30px'}`)}>
          {F.items.map((it, i) => (
            <Zeile key={it.q} spalten="380px 1fr" letzte={i === F.items.length - 1} mobil={mobil}>
              <div style={sx(`font-family:${SPARTAN};font-size:${mobil ? '24px' : 'clamp(22px,2.4vw,34px)'};font-weight:900;line-height:1.06;letter-spacing:-.022em;color:${CREME};text-wrap:balance`)}>{it.q}</div>
              <div style={sx('font-size:16.5px;line-height:1.62;font-weight:500;color:rgba(246,239,230,.8);max-width:62ch;text-wrap:pretty')}>{it.a}</div>
            </Zeile>
          ))}
        </div>
      )}

      {entwurf === 3 && (
        <div style={sx(`margin-top:${mobil ? '20px' : '30px'};max-width:860px`)}>
          {F.items.map((it, i) => (
            <div key={it.q} style={sx(`padding:${mobil ? '18px 0' : '22px 0'};border-top:1px solid ${HAAR}${i === F.items.length - 1 ? `;border-bottom:1px solid ${HAAR}` : ''}`)}>
              <div style={sx('display:flex;align-items:flex-start;gap:16px')}>
                <span style={sx(`flex:1;font-size:${mobil ? '17px' : '19px'};font-weight:900;line-height:1.35;color:${CREME}`)}>{it.q}</span>
                <span style={sx(`flex:none;font-family:${SPARTAN};font-size:26px;font-weight:900;line-height:.8;color:${PINK}`)}>+</span>
              </div>
              {i === 0 && (
                <div style={sx('margin-top:12px;font-size:16px;line-height:1.62;font-weight:500;color:rgba(246,239,230,.76);max-width:62ch')}>{it.a}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ═══════════════════════════════════════════════ 07 Anfragen
export const FORM_ENTWUERFE = {
  1: {
    name: 'Formular rechts',
    idee: {
      de: 'Links Ueberschrift, Preis und was enthalten ist, rechts das Formular. Wie die anderen Stationen: Aussage links, Sache rechts. Der Preis steht neben dem Feld, in das man tippt.',
      en: 'Heading, price and what is included on the left, the form on the right. Like the other stations: statement left, thing right. The price sits next to the field you type in.',
    },
  },
  2: {
    name: 'Eine Spalte',
    idee: {
      de: 'Alles untereinander, mittig, das Formular breit. Am ruhigsten und auf dem Handy identisch zum Desktop. Dafuer verschwindet der Preis nach oben, waehrend man tippt.',
      en: 'Everything stacked and centred, the form wide. Calmest, and identical on phone and desktop. But the price scrolls away while you type.',
    },
  },
  3: {
    name: 'Zwei Wege',
    idee: {
      de: 'Die Wahl zwischen Event und Test-Team steht nicht als zwei Reiter da, sondern als zwei grosse Zeilen mit ihrem Preis: „ab 350 €" und „0 €". Man entscheidet sichtbar, bevor man tippt. Der kostenlose Weg ist gerade das wichtigste Angebot.',
      en: 'The choice between event and test team is not two tabs but two large rows with their price: “from €350” and “€0”. You decide visibly before typing. The free route is currently the most important offer.',
    },
  },
} as const;

export function Anfragen({ L, mobil, entwurf }: P) {
  const F = L.form;
  const feld = (label: string, ph: string, breit = true) => (
    <label key={label} style={sx(`display:block;${breit ? '' : 'flex:1 1 200px;'}`)}>
      <span style={sx('display:block;margin-bottom:7px;font-size:12.5px;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:rgba(246,239,230,.6)')}>{label}</span>
      <span style={sx(`display:block;padding:14px 16px;border-radius:14px;border:1px solid ${HAAR};background:rgba(246,239,230,.03);`
        + 'font-size:15.5px;font-weight:500;color:rgba(246,239,230,.42)')}>{ph}</span>
    </label>
  );
  const formular = (
    <div style={sx('display:flex;flex-direction:column;gap:16px;width:100%')}>
      {feld(F.anlass, F.anlassPh)}
      <div style={sx('display:flex;gap:16px;flex-wrap:wrap')}>
        {feld(F.personen, F.personenPh, false)}
        {feld(F.datum, F.datumPh, false)}
      </div>
      {feld(F.name, 'Johannes Beispiel')}
      {feld(F.email, 'du@beispiel.de')}
      <span style={sx(`margin-top:6px;display:block;padding:17px 22px;border-radius:999px;background:${CREME};color:#0A0814;`
        + 'text-align:center;font-size:16px;font-weight:900')}>{F.submitEvent}</span>
      <span style={sx('font-size:13px;line-height:1.5;color:rgba(246,239,230,.5)')}>{F.privacy1}{F.privacyLink}{F.privacy2}</span>
    </div>
  );
  const preis = (gross: boolean) => (
    <div>
      <div style={sx(`font-family:${SPARTAN};font-size:${gross ? (mobil ? '44px' : '62px') : '34px'};font-weight:900;line-height:1;letter-spacing:-.03em;color:${CREME}`)}>{F.priceBig}</div>
      <div style={sx(`margin-top:6px;font-size:13px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:${PINK}`)}>{F.priceSub}</div>
      <div style={sx('margin-top:14px;font-size:15.5px;line-height:1.6;font-weight:500;color:rgba(246,239,230,.72);max-width:34ch')}>{F.priceNote1} {F.priceNote2}</div>
    </div>
  );

  return (
    <section style={sx(RAHMEN(mobil))}>
      <Kicker nummer="[ 07 ]" label={F.label} />

      {entwurf === 1 && (
        <>
          <H2 text={F.h2} mobil={mobil} />
          <Zeile spalten="1fr 480px" letzte mobil={mobil}>
            <div>
              <p style={sx('margin:0 0 30px;max-width:46ch;font-size:18px;line-height:1.6;font-weight:500;color:rgba(246,239,230,.78)')}>{F.sub}</p>
              {preis(true)}
              <div style={sx('margin-top:22px;font-size:14px;font-weight:900;color:rgba(246,239,230,.6)')}>{F.avail}</div>
            </div>
            {formular}
          </Zeile>
        </>
      )}

      {entwurf === 2 && (
        <div style={sx('max-width:620px;margin:0 auto;text-align:center')}>
          <H2 text={F.h2} mobil={mobil} />
          <p style={sx('margin:0 auto 26px;max-width:46ch;font-size:18px;line-height:1.6;font-weight:500;color:rgba(246,239,230,.78)')}>{F.sub}</p>
          <div style={sx(`margin-bottom:30px;padding:20px 0;border-top:1px solid ${HAAR};border-bottom:1px solid ${HAAR};text-align:left`)}>{preis(false)}</div>
          <div style={sx('text-align:left')}>{formular}</div>
        </div>
      )}

      {entwurf === 3 && (
        <>
          <H2 text={F.h2} mobil={mobil} />
          <p style={sx('margin:0 0 30px;max-width:52ch;font-size:18px;line-height:1.6;font-weight:500;color:rgba(246,239,230,.78)')}>{F.sub}</p>
          {[[F.tabEvent, F.priceBig, F.priceSub, F.priceNote1, true], [F.tabTest, F.testBig, F.testSub, F.testNote1, false]].map(([titel, gross, klein, note, aktiv], i) => (
            <Zeile key={String(titel)} spalten="1fr 260px" letzte={i === 1} mobil={mobil}>
              <div>
                <div style={sx(`font-family:${SPARTAN};font-size:${mobil ? '30px' : 'clamp(30px,3.2vw,46px)'};font-weight:900;line-height:1;letter-spacing:-.028em;color:${aktiv ? CREME : 'rgba(246,239,230,.62)'}`)}>{String(titel)}</div>
                <div style={sx('margin-top:12px;font-size:15.5px;line-height:1.6;font-weight:500;color:rgba(246,239,230,.72);max-width:44ch')}>{String(note)}</div>
              </div>
              <div style={sx(mobil ? '' : 'text-align:right')}>
                <div style={sx(`font-family:${SPARTAN};font-size:${mobil ? '34px' : '46px'};font-weight:900;line-height:1;letter-spacing:-.03em;color:${aktiv ? CREME : PINK}`)}>{String(gross)}</div>
                <div style={sx('margin-top:6px;font-size:12px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:rgba(246,239,230,.55)')}>{String(klein)}</div>
              </div>
            </Zeile>
          ))}
          <div style={sx(`margin-top:${mobil ? '30px' : '44px'};max-width:620px`)}>{formular}</div>
        </>
      )}
    </section>
  );
}
