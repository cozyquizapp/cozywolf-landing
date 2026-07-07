// Mini-Quiz direkt auf der Seite: echter Vorgeschmack (3 Fragen zum Antippen mit
// Auflösung), ersetzt den frueheren toten "Quiz ausprobieren"-Link. Rein Client-
// interaktiv (useState), SSR-sicher: prerendert die erste Frage statisch.
import { useState } from 'react';
import { BRAND, anfrageMailto } from '../brand';
import { useLang } from '../lang';
import { Section, Btn } from '../Layout';

type Q = { q: string; options: string[]; correct: number; note: string };

const QUIZ: Record<'de' | 'en', Q[]> = {
  de: [
    { q: 'Wie viele Herzen hat ein Oktopus?', options: ['1', '2', '3', '4'], correct: 2,
      note: 'Drei. Zwei pumpen das Blut zu den Kiemen, eins zum restlichen Körper.' },
    { q: 'Wie viele Knochen hat ein erwachsener Mensch?', options: ['106', '206', '306', '406'], correct: 1,
      note: '206. Babys starten mit rund 300, einige wachsen später zusammen.' },
    { q: 'Welche Farbe haben die Haare eines Eisbären wirklich?', options: ['Weiß', 'Durchsichtig', 'Schwarz', 'Hellblau'], correct: 1,
      note: 'Durchsichtig und hohl. Die Haut darunter ist schwarz, weiß wirkt nur das gestreute Licht.' },
  ],
  en: [
    { q: 'How many hearts does an octopus have?', options: ['1', '2', '3', '4'], correct: 2,
      note: 'Three. Two pump blood to the gills, one to the rest of the body.' },
    { q: 'How many bones does an adult human have?', options: ['106', '206', '306', '406'], correct: 1,
      note: '206. Babies start with around 300, some fuse together later.' },
    { q: "What colour is a polar bear's hair really?", options: ['White', 'Transparent', 'Black', 'Light blue'], correct: 1,
      note: 'Transparent and hollow. The skin underneath is black, the white is just scattered light.' },
  ],
};

export function MiniQuiz() {
  const lang = useLang();
  const de = lang === 'de';
  const quiz = QUIZ[lang];
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);

  const q = quiz[idx];
  const isLast = idx === quiz.length - 1;

  const pick = (i: number) => {
    if (picked != null) return;
    setPicked(i);
    if (i === q.correct) setCorrectCount(c => c + 1);
  };
  const next = () => {
    if (isLast) { setDone(true); return; }
    setIdx(i => i + 1);
    setPicked(null);
  };
  const restart = () => { setIdx(0); setPicked(null); setCorrectCount(0); setDone(false); };

  return (
    <Section>
      <style>{`@keyframes cwNoteIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }`}</style>
      <h2 style={secTitle}>{de ? 'Probier eine Runde' : 'Try a round'}</h2>
      <p style={{ margin: '0 auto clamp(20px, 3vh, 30px)', maxWidth: 560, textAlign: 'center', fontSize: 16, color: BRAND.inkSoft, fontWeight: 500, lineHeight: 1.6 }}>
        {de ? 'Drei kleine Fragen als Vorgeschmack. Beim echten Abend spielt ihr am Handy gegeneinander.'
            : 'Three little questions as a taste. At the real event you play against each other on your phones.'}
      </p>

      <div style={{
        maxWidth: 560, margin: '0 auto',
        padding: 'clamp(22px, 3vw, 34px)', borderRadius: 24,
        background: 'rgba(255,255,255,0.03)', border: `1.5px solid rgba(${BRAND.pinkRgb},0.24)`,
        boxShadow: `0 16px 40px rgba(0,0,0,0.35), 0 0 32px rgba(${BRAND.pinkRgb},0.10)`,
      }}>
        {done ? (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <div style={{ fontSize: 44 }} aria-hidden>{correctCount === quiz.length ? '🏆' : correctCount >= 2 ? '🎉' : '🙂'}</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#F1F5F9' }}>
              {de ? `${correctCount} von ${quiz.length} richtig` : `${correctCount} of ${quiz.length} correct`}
            </div>
            <p style={{ margin: 0, maxWidth: 420, fontSize: 16, color: BRAND.inkSoft, fontWeight: 500, lineHeight: 1.6 }}>
              {de ? 'Und das war nur ein winziger Vorgeschmack. Der echte Abend hat fünf Fragetypen, Teams und jede Menge Überraschungen.'
                  : 'And that was just a tiny taste. The real evening has five question types, teams and plenty of surprises.'}
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 }}>
              <Btn href={anfrageMailto(lang)}>{de ? 'Quiz anfragen' : 'Request a quiz'}</Btn>
              <button onClick={restart} style={ghostBtn}>{de ? 'Nochmal' : 'Again'}</button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: BRAND.pink }}>
                {de ? `Frage ${idx + 1} von ${quiz.length}` : `Question ${idx + 1} of ${quiz.length}`}
              </span>
            </div>
            <div style={{ fontSize: 'clamp(20px, 2.6vw, 26px)', fontWeight: 900, color: '#F1F5F9', lineHeight: 1.3, marginBottom: 18 }}>{q.q}</div>

            <div style={{ display: 'grid', gap: 10 }}>
              {q.options.map((opt, i) => {
                const revealed = picked != null;
                const isCorrect = i === q.correct;
                const isPicked = i === picked;
                let bg = 'rgba(255,255,255,0.04)';
                let border = 'rgba(255,255,255,0.10)';
                let col: string = BRAND.ink;
                if (revealed && isCorrect) { bg = 'rgba(34,197,94,0.16)'; border = '#22C55E'; col = '#86EFAC'; }
                else if (revealed && isPicked) { bg = 'rgba(239,68,68,0.14)'; border = '#EF4444'; col = '#FCA5A5'; }
                return (
                  <button key={i} onClick={() => pick(i)} disabled={revealed} style={{
                    textAlign: 'left', padding: '13px 16px', borderRadius: 14,
                    background: bg, border: `1.5px solid ${border}`, color: col,
                    fontFamily: 'inherit', fontSize: 16, fontWeight: 800,
                    cursor: revealed ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: 10,
                    transition: 'background 0.2s, border-color 0.2s, color 0.2s',
                  }}>
                    <span style={{ flex: 1 }}>{opt}</span>
                    {revealed && isCorrect && <span aria-hidden>✓</span>}
                    {revealed && isPicked && !isCorrect && <span aria-hidden>✗</span>}
                  </button>
                );
              })}
            </div>

            {picked != null && (
              <div style={{ marginTop: 16, animation: 'cwNoteIn 0.35s ease both' }}>
                <p style={{ margin: '0 0 16px', fontSize: 15, color: BRAND.inkSoft, fontWeight: 500, lineHeight: 1.6 }}>{q.note}</p>
                <div style={{ textAlign: 'center' }}>
                  <button onClick={next} style={nextBtn}>
                    {isLast ? (de ? 'Ergebnis' : 'Result') : (de ? 'Nächste Frage' : 'Next question')} →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Section>
  );
}

const secTitle: React.CSSProperties = {
  margin: '0 0 clamp(14px, 2vh, 20px)', textAlign: 'center',
  fontSize: 'clamp(26px, 3.4vw, 40px)', fontWeight: 900, color: '#F1F5F9', letterSpacing: '-0.01em',
};
const nextBtn: React.CSSProperties = {
  padding: '11px 24px', borderRadius: 999, border: '1.5px solid rgba(255,255,255,0.18)',
  background: `linear-gradient(135deg, ${BRAND.pink}, ${BRAND.magenta})`, color: '#fff',
  fontFamily: 'inherit', fontWeight: 900, fontSize: 15, cursor: 'pointer',
};
const ghostBtn: React.CSSProperties = {
  padding: '13px 24px', borderRadius: 999, border: `1.5px solid rgba(${BRAND.pinkRgb},0.40)`,
  background: `rgba(${BRAND.pinkRgb},0.10)`, color: BRAND.pinkSoft,
  fontFamily: 'inherit', fontWeight: 900, fontSize: 15, cursor: 'pointer',
};
