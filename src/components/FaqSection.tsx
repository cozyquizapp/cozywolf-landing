// FAQ-Block: nimmt die typischen Einwaende eines Erstkunden vorweg (Technik,
// Installation, Gruppengroesse, Dauer, Anfahrt, Preis). Native <details>, damit
// es ohne JS/SSR-sicher auf- und zuklappt. Ich-Form, keine Gedankenstriche.
import { BRAND, anfrageMailto } from '../brand';
import { useLang } from '../lang';
import { Section } from '../Layout';

type QA = { q: string; a: React.ReactNode };

export function FaqSection() {
  const lang = useLang();
  const de = lang === 'de';
  const items: QA[] = de
    ? [
        { q: 'Brauche ich eigene Technik?', a: 'Nein. Ich bringe Beamer und Sound selbst mit. Ihr braucht nur eine freie Wand oder einen Bildschirm, Strom und WLAN für eure Gäste.' },
        { q: 'Müssen meine Gäste etwas installieren?', a: 'Nichts. Alle scannen einen QR-Code und spielen direkt im Browser am eigenen Handy. Keine App, kein Login.' },
        { q: 'Ab wie vielen und bis zu wie vielen Personen geht das?', a: 'Von der kleinen Runde bis etwa 100 Personen. Kleine Gruppen erobern das Spielfeld, große Gruppen treten als Fraktionen an. Der Abend passt sich an.' },
        { q: 'Wie lange dauert ein Abend?', a: 'Meist 90 bis 120 Minuten mit mehreren Runden. Die genaue Länge stimme ich vorher mit dir auf euren Anlass ab.' },
        { q: 'Wie weit fährst du?', a: 'Ich bin in Hamburg und im Umland unterwegs. Für weiter entfernte Anfragen melde dich einfach kurz, meist lässt sich etwas einrichten.' },
        { q: 'Was kostet das?', a: (<>Der Preis richtet sich nach Personenzahl und Anlass. Schreib mir kurz, worum es geht, dann bekommst du von mir ein faires Angebot. <a href={anfrageMailto(lang)} style={{ color: BRAND.pink, fontWeight: 800, textDecoration: 'none' }}>Anfrage schreiben</a>.</>) },
      ]
    : [
        { q: 'Do I need my own tech?', a: 'No. I bring the projector and sound myself. You only need a free wall or a screen, power, and WiFi for your guests.' },
        { q: 'Do my guests have to install anything?', a: 'Nothing. Everyone scans a QR code and plays right in the browser on their own phone. No app, no login.' },
        { q: 'How many people does it work for?', a: 'From a small round up to about 100 people. Small groups conquer the board, large groups play as factions. The evening adapts.' },
        { q: 'How long does an evening take?', a: 'Usually 90 to 120 minutes across several rounds. I agree the exact length with you beforehand to fit your occasion.' },
        { q: 'How far do you travel?', a: 'I am based in and around Hamburg. For requests further out, just get in touch and we will find a way.' },
        { q: 'What does it cost?', a: (<>The price depends on the number of people and the occasion. Drop me a line about your event and I will come back with a fair offer. <a href={anfrageMailto(lang)} style={{ color: BRAND.pink, fontWeight: 800, textDecoration: 'none' }}>Send a request</a>.</>) },
      ];

  return (
    <Section>
      <style>{`
        .cw-faq { border: 1px solid rgba(${BRAND.pinkRgb},0.16); border-radius: 16px; background: rgba(255,255,255,0.025); overflow: hidden; transition: border-color 0.18s ease; }
        .cw-faq[open] { border-color: rgba(${BRAND.pinkRgb},0.4); background: rgba(255,255,255,0.045); }
        .cw-faq > summary { list-style: none; cursor: pointer; padding: 18px 20px; display: flex; align-items: center; justify-content: space-between; gap: 14px; font-weight: 800; font-size: 17px; color: #F1F5F9; }
        .cw-faq > summary::-webkit-details-marker { display: none; }
        .cw-faq .cw-faq-plus { flex-shrink: 0; width: 26px; height: 26px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 18px; color: ${BRAND.pink}; background: rgba(${BRAND.pinkRgb},0.12); transition: transform 0.22s ease; }
        .cw-faq[open] .cw-faq-plus { transform: rotate(45deg); }
        .cw-faq .cw-faq-a { padding: 0 20px 18px; font-size: 15.5px; line-height: 1.6; color: ${BRAND.inkSoft}; font-weight: 500; }
      `}</style>
      <h2 style={{
        margin: '0 0 clamp(20px, 3vh, 32px)', textAlign: 'center',
        fontSize: 'clamp(26px, 3.4vw, 40px)', fontWeight: 900, color: '#F1F5F9', letterSpacing: '-0.01em',
      }}>{de ? 'Häufige Fragen' : 'Common questions'}</h2>
      <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map((it, i) => (
          <details key={i} className="cw-faq">
            <summary>
              <span>{it.q}</span>
              <span className="cw-faq-plus" aria-hidden>+</span>
            </summary>
            <div className="cw-faq-a">{it.a}</div>
          </details>
        ))}
      </div>
    </Section>
  );
}
