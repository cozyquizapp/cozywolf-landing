// Mini-Quiz direkt auf der Seite: echter Vorgeschmack mit VIER Spielarten, die
// die App-Kategorien spiegeln, jede mit eigener Mechanik UND Kategorie-Farbe:
//   Mu-Cho (antippen, pink) · Schätzchen (Zahl eintippen, blau) ·
//   Schau-mal (Bild + Antwort eintippen, grün) · 10 von 10 (Punkte verteilen, gold).
// Fragen im "Now I Know"-Stil (ueberraschend, Aha). Rein Client-interaktiv,
// SSR-sicher: prerendert die erste Runde statisch. Vanille-Foto: Forest & Kim
// Starr, CC BY 3.0 (Bildnachweis im Impressum).
import { useState } from 'react';
import { BRAND } from '../brand';
import { Icon } from './Icon';
import { useLang } from '../lang';
import { Section, Btn } from '../Layout';

type ChoiceR = { type: 'choice'; q: string; options: string[]; correct: number; note: string };
type ImageR = { type: 'image'; q: string; img: string; accept: string[]; answer: string; note: string };
type EstimateR = { type: 'estimate'; q: string; unit: string; answer: number; tolerance: number; note: string };
type DistributeR = { type: 'distribute'; q: string; options: string[]; correctSet: number[]; note: string };
type Round = ChoiceR | ImageR | EstimateR | DistributeR;

const QUIZ: Record<'de' | 'en', Round[]> = {
  de: [
    { type: 'choice', q: 'Was wurde zuerst gegründet?', options: ['Google', 'YouTube', 'Netflix', 'Facebook'], correct: 2,
      note: 'Netflix (1997) gab es schon vor Google (1998), Facebook (2004) und YouTube (2005), damals noch als DVD-Versand per Post.' },
    { type: 'estimate', q: 'Wie viele Stufen hat der Eiffelturm bis ganz nach oben?', unit: 'Stufen', answer: 1665, tolerance: 300,
      note: '1.665 Stufen bis zur Spitze. Bis zur zweiten Etage sind es 674, den Rest fährt sonst der Aufzug. Die meisten schätzen viel zu niedrig.' },
    { type: 'image', q: 'Welches Gewürz wächst hier?', img: '/assets/quiz-vanille.webp', accept: ['vanille', 'vanilla'], answer: 'Vanille',
      note: 'Vanilleschoten! Vanille ist die Frucht einer Orchidee, die einzige essbare unter den Orchideen, und darum nach Safran das teuerste Gewürz.' },
    { type: 'distribute', q: 'Welche waren (oder sind) mal olympische Disziplin? Verteile 10 Punkte auf die, bei denen du sicher bist.', options: ['Tauziehen', 'Kunstwettbewerbe', 'Darts'], correctSet: [0, 1],
      note: 'Tauziehen war 1900–1920 olympisch, und Kunstwettbewerbe in Malerei und Dichtung sogar 1912–1948. Darts dagegen nie.' },
  ],
  en: [
    { type: 'choice', q: 'Which was founded first?', options: ['Google', 'YouTube', 'Netflix', 'Facebook'], correct: 2,
      note: 'Netflix (1997) came before Google (1998), Facebook (2004) and YouTube (2005), back then as a DVD-by-mail service.' },
    { type: 'estimate', q: 'How many steps does the Eiffel Tower have to the very top?', unit: 'steps', answer: 1665, tolerance: 300,
      note: '1,665 steps to the top. It is 674 to the second floor, the rest is normally by lift. Most people guess far too low.' },
    { type: 'image', q: 'Which spice grows here?', img: '/assets/quiz-vanille.webp', accept: ['vanilla', 'vanille'], answer: 'Vanilla',
      note: 'Vanilla pods! Vanilla is the fruit of an orchid, the only edible one, which is why after saffron it is the priciest spice.' },
    { type: 'distribute', q: 'Which were (or are) Olympic disciplines? Spread 10 points on the ones you are sure about.', options: ['Tug of war', 'Art competitions', 'Darts'], correctSet: [0, 1],
      note: 'Tug of war was Olympic in 1900–1920, and art competitions in painting and poetry even 1912–1948. Darts never was.' },
  ],
};

function kindLabel(type: Round['type'], de: boolean): string {
  if (type === 'estimate') return de ? 'Schätzchen' : 'Estimate';
  if (type === 'image') return 'Schau-mal';
  if (type === 'distribute') return '10 von 10';
  return 'Mu-Cho';
}
function kindColor(type: Round['type']): string {
  if (type === 'estimate') return '#3B82F6';   // blau
  if (type === 'image') return '#22C55E';       // gruen
  if (type === 'distribute') return '#FACC15';  // gold
  return '#FA4BA3';                             // pink (Mu-Cho)
}

export function MiniQuiz() {
  const lang = useLang();
  const de = lang === 'de';
  const quiz = QUIZ[lang];
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [confetti, setConfetti] = useState<Piece[] | null>(null);
  // Runden-spezifischer Zustand
  const [picked, setPicked] = useState<number | null>(null);
  const [guessInput, setGuessInput] = useState('');
  const [estDone, setEstDone] = useState(false);
  const [imgInput, setImgInput] = useState('');
  const [imgDone, setImgDone] = useState(false);
  const [pts, setPts] = useState<number[]>([]);
  const [distDone, setDistDone] = useState(false);

  const round = quiz[idx];
  const isLast = idx === quiz.length - 1;
  const accent = done ? BRAND.pink : kindColor(round.type);
  const revealed =
    round.type === 'estimate' ? estDone
      : round.type === 'distribute' ? distDone
        : round.type === 'image' ? imgDone
          : picked != null;

  const celebrate = () => { setConfetti(makeConfetti()); window.setTimeout(() => setConfetti(null), 1200); };

  const pick = (i: number) => {
    if (round.type !== 'choice' || picked != null) return;
    setPicked(i);
    if (i === round.correct) { setCorrectCount(c => c + 1); celebrate(); }
  };
  const guessNum = parseInt(guessInput, 10);
  const guessValid = guessInput.trim() !== '' && !Number.isNaN(guessNum);
  const submitEstimate = () => {
    if (round.type !== 'estimate' || estDone || !guessValid) return;
    setEstDone(true);
    if (Math.abs(guessNum - round.answer) <= round.tolerance) { setCorrectCount(c => c + 1); celebrate(); }
  };
  const imgValid = imgInput.trim().length >= 2;
  const imgCorrect = round.type === 'image' && round.accept.some(a => imgInput.trim().toLowerCase().includes(a));
  const submitImage = () => {
    if (round.type !== 'image' || imgDone || !imgValid) return;
    setImgDone(true);
    if (imgCorrect) { setCorrectCount(c => c + 1); celebrate(); }
  };
  const distTotal = pts.reduce((a, b) => a + b, 0);
  const submitDistribute = () => {
    if (round.type !== 'distribute' || distDone || distTotal !== 10) return;
    setDistDone(true);
    const onCorrect = round.correctSet.reduce((a, i) => a + (pts[i] || 0), 0);
    if (onCorrect >= 7) { setCorrectCount(c => c + 1); celebrate(); }
  };
  const addPt = (i: number, d: number) => {
    if (distDone) return;
    setPts(p => {
      const n = [...p];
      const v = (n[i] || 0) + d;
      if (v < 0) return p;
      if (d > 0 && distTotal >= 10) return p;
      n[i] = v;
      return n;
    });
  };

  const resetFor = (r: Round) => {
    setPicked(null); setEstDone(false); setDistDone(false); setImgDone(false);
    setGuessInput(''); setImgInput('');
    if (r.type === 'distribute') setPts(new Array(r.options.length).fill(0));
  };
  const next = () => {
    if (isLast) { setDone(true); return; }
    const nr = quiz[idx + 1];
    setIdx(i => i + 1);
    resetFor(nr);
  };
  const restart = () => { setIdx(0); setCorrectCount(0); setDone(false); resetFor(quiz[0]); };

  return (
    <Section>
      <style>{`
        @keyframes cwNoteIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        @keyframes cwConfetti { 0% { transform: translate(0,0) rotate(0); opacity: 1; } 100% { transform: translate(var(--dx), var(--dy)) rotate(var(--r)); opacity: 0; } }
      `}</style>
      <h2 style={secTitle}>{de ? 'Probier eine Runde' : 'Try a round'}</h2>
      <p style={{ margin: '0 auto clamp(20px, 3vh, 30px)', maxWidth: 560, textAlign: 'center', fontSize: 16, color: BRAND.inkSoft, fontWeight: 500, lineHeight: 1.6 }}>
        {de ? 'Vier Kostproben, vier Spielarten. Beim echten Quiz-Event spielt ihr am Handy gegeneinander.'
            : 'Four tastes, four game styles. At the real event you play against each other on your phones.'}
      </p>

      <div style={{
        maxWidth: 560, margin: '0 auto',
        padding: 'clamp(22px, 3vw, 34px)', borderRadius: 24,
        background: 'rgba(255,255,255,0.03)', border: `1.5px solid ${accent}55`,
        boxShadow: `0 16px 40px rgba(0,0,0,0.35), 0 0 40px ${accent}22`,
        transition: 'border-color 0.45s ease, box-shadow 0.45s ease',
      }}>
        {done ? (
          <div role="status" aria-live="polite" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'center', minHeight: 52 }} aria-hidden>
              {correctCount === quiz.length ? <Icon name="trophae" size={52} /> : correctCount >= 2 ? <Icon name="feier" size={52} /> : <span style={{ fontSize: 44 }}>🙂</span>}
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#F1F5F9' }}>
              {de ? `${correctCount} von ${quiz.length} richtig` : `${correctCount} of ${quiz.length} correct`}
            </div>
            <p style={{ margin: 0, maxWidth: 420, fontSize: 16, color: BRAND.inkSoft, fontWeight: 500, lineHeight: 1.6 }}>
              {de ? 'Und das war nur ein winziger Vorgeschmack. Das echte Quiz-Event hat fünf Fragetypen, Teams und jede Menge Überraschungen.'
                  : 'And that was just a tiny taste. The real event has five question types, teams and plenty of surprises.'}
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 }}>
              <Btn href="/kontakt">{de ? 'Quiz anfragen' : 'Request a quiz'}</Btn>
              <button onClick={restart} style={ghostBtn}>{de ? 'Nochmal' : 'Again'}</button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, gap: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: accent }}>
                {de ? `Runde ${idx + 1} von ${quiz.length}` : `Round ${idx + 1} of ${quiz.length}`}
              </span>
              <span style={{
                fontSize: 12, fontWeight: 900, letterSpacing: '0.05em', textTransform: 'uppercase',
                color: accent, background: `${accent}1f`, border: `1px solid ${accent}66`, padding: '4px 11px', borderRadius: 999,
              }}>{kindLabel(round.type, de)}</span>
            </div>

            {round.type === 'image' && (
              <img src={round.img} alt="" style={{ width: '100%', height: 'auto', maxHeight: 260, objectFit: 'cover', borderRadius: 14, marginBottom: 16, border: '1px solid rgba(255,255,255,0.08)' }} />
            )}

            <div style={{ fontSize: 'clamp(19px, 2.5vw, 25px)', fontWeight: 900, color: '#F1F5F9', lineHeight: 1.3, marginBottom: 18 }}>{round.q}</div>

            <div style={{ position: 'relative' }}>
              {confetti && <ConfettiLayer pieces={confetti} />}

              {round.type === 'choice' && (
                <div style={{ display: 'grid', gap: 10 }}>
                  {round.options.map((opt, i) => {
                    const isCorrect = i === round.correct;
                    const isPicked = i === picked;
                    let bg = 'rgba(255,255,255,0.04)', border = 'rgba(255,255,255,0.10)', col: string = BRAND.ink;
                    if (revealed && isCorrect) { bg = 'rgba(34,197,94,0.16)'; border = '#22C55E'; col = '#86EFAC'; }
                    else if (revealed && isPicked) { bg = 'rgba(239,68,68,0.14)'; border = '#EF4444'; col = '#FCA5A5'; }
                    return (
                      <button key={i} onClick={() => pick(i)} disabled={revealed} style={{
                        textAlign: 'left', padding: '13px 16px', borderRadius: 14,
                        background: bg, border: `1.5px solid ${border}`, color: col,
                        fontFamily: 'inherit', fontSize: 16, fontWeight: 800, cursor: revealed ? 'default' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: 10, transition: 'background 0.2s, border-color 0.2s, color 0.2s',
                      }}>
                        <span style={{ flex: 1 }}>{opt}</span>
                        {revealed && isCorrect && <span aria-hidden>✓</span>}
                        {revealed && isPicked && !isCorrect && <span aria-hidden>✗</span>}
                      </button>
                    );
                  })}
                </div>
              )}

              {round.type === 'image' && (
                <div>
                  <input type="text" value={imgInput} disabled={imgDone}
                    placeholder={de ? 'Antwort eintippen…' : 'Type your answer…'} aria-label={round.q}
                    onChange={(e) => setImgInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') submitImage(); }}
                    style={{
                      width: '100%', fontFamily: 'inherit', fontSize: 17, fontWeight: 700, color: BRAND.ink,
                      background: 'rgba(255,255,255,0.05)',
                      border: `1.5px solid ${imgDone ? (imgCorrect ? '#22C55E' : '#EF4444') : accent + '88'}`,
                      borderRadius: 14, padding: '13px 16px', outline: 'none',
                    }} />
                  {imgDone && (
                    <div style={{ marginTop: 12, textAlign: 'center', fontSize: 16, fontWeight: 800, color: imgCorrect ? '#86EFAC' : '#FCA5A5' }}>
                      {imgCorrect ? (de ? 'Richtig!' : 'Correct!') : (de ? `Lösung: ${round.answer}` : `Answer: ${round.answer}`)}
                    </div>
                  )}
                  {!imgDone && (
                    <div style={{ textAlign: 'center', marginTop: 16 }}>
                      <button onClick={submitImage} disabled={!imgValid} className="cw-btn" style={{ ...nextBtn, opacity: imgValid ? 1 : 0.45, cursor: imgValid ? 'pointer' : 'default' }}>{de ? 'Antwort abgeben' : 'Submit answer'}</button>
                    </div>
                  )}
                </div>
              )}

              {round.type === 'estimate' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 10 }}>
                    <input type="number" inputMode="numeric" value={guessInput} disabled={estDone}
                      placeholder="?" aria-label={round.q}
                      onChange={(e) => setGuessInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') submitEstimate(); }}
                      style={{
                        width: 150, textAlign: 'center', fontFamily: 'inherit', fontSize: 30, fontWeight: 900,
                        color: accent, background: 'rgba(255,255,255,0.05)', border: `1.5px solid ${accent}88`,
                        borderRadius: 14, padding: '8px 12px', outline: 'none',
                      }} />
                    <span style={{ fontSize: 16, fontWeight: 800, color: BRAND.inkSoft }}>{round.unit}</span>
                  </div>
                  {estDone && (
                    <div style={{ marginTop: 14, textAlign: 'center', fontSize: 16, fontWeight: 800, color: Math.abs(guessNum - round.answer) <= round.tolerance ? '#86EFAC' : '#FCA5A5' }}>
                      {de ? `Richtig: ${round.answer} ${round.unit} · deine Schätzung: ${guessNum}` : `Answer: ${round.answer} ${round.unit} · your guess: ${guessNum}`}
                    </div>
                  )}
                  {!estDone && (
                    <div style={{ textAlign: 'center', marginTop: 16 }}>
                      <button onClick={submitEstimate} disabled={!guessValid} className="cw-btn" style={{ ...nextBtn, opacity: guessValid ? 1 : 0.45, cursor: guessValid ? 'pointer' : 'default' }}>{de ? 'Schätzung abgeben' : 'Lock in guess'}</button>
                    </div>
                  )}
                </div>
              )}

              {round.type === 'distribute' && (
                <div>
                  <div style={{ textAlign: 'center', fontSize: 14, fontWeight: 800, color: BRAND.inkSoft, marginBottom: 12 }}>
                    {de ? `Punkte übrig: ` : `Points left: `}<span style={{ color: accent, fontSize: 18 }}>{10 - distTotal}</span>
                  </div>
                  <div style={{ display: 'grid', gap: 10 }}>
                    {round.options.map((opt, i) => {
                      const inSet = round.correctSet.includes(i);
                      let border = 'rgba(255,255,255,0.10)', bg = 'rgba(255,255,255,0.04)';
                      if (distDone && inSet) { border = '#22C55E'; bg = 'rgba(34,197,94,0.14)'; }
                      else if (distDone && (pts[i] || 0) > 0 && !inSet) { border = '#EF4444'; bg = 'rgba(239,68,68,0.12)'; }
                      return (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px 10px 16px',
                          borderRadius: 14, background: bg, border: `1.5px solid ${border}`,
                        }}>
                          <span style={{ flex: 1, fontSize: 15.5, fontWeight: 800, color: BRAND.ink }}>{opt}</span>
                          {distDone && inSet && <span aria-hidden style={{ color: '#86EFAC' }}>✓</span>}
                          {!distDone && (
                            <button onClick={() => addPt(i, -1)} disabled={(pts[i] || 0) === 0} aria-label="minus" style={stepBtn((pts[i] || 0) === 0)}>−</button>
                          )}
                          <span style={{ minWidth: 22, textAlign: 'center', fontSize: 17, fontWeight: 900, color: (pts[i] || 0) > 0 ? accent : 'rgba(226,232,240,0.4)' }}>{pts[i] || 0}</span>
                          {!distDone && (
                            <button onClick={() => addPt(i, 1)} disabled={distTotal >= 10} aria-label="plus" style={stepBtn(distTotal >= 10)}>+</button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {!distDone && (
                    <div style={{ textAlign: 'center', marginTop: 16 }}>
                      <button onClick={submitDistribute} disabled={distTotal !== 10} className="cw-btn" style={{ ...nextBtn, opacity: distTotal !== 10 ? 0.45 : 1, cursor: distTotal !== 10 ? 'default' : 'pointer' }}>
                        {de ? 'Punkte abgeben' : 'Lock in points'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {revealed && (
              <div aria-live="polite" style={{ marginTop: 16, animation: 'cwNoteIn 0.35s ease both' }}>
                <p style={{ margin: '0 0 16px', fontSize: 15, color: BRAND.inkSoft, fontWeight: 500, lineHeight: 1.6 }}>{round.note}</p>
                <div style={{ textAlign: 'center' }}>
                  <button onClick={next} className="cw-btn" style={nextBtn}>
                    {isLast ? (de ? 'Ergebnis' : 'Result') : (de ? 'Nächste Runde' : 'Next round')} →
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

type Piece = { left: number; dx: number; dy: number; r: number; delay: number; color: string };
const CONFETTI_COLORS = ['#FA4BA3', '#AB0055', '#22C55E', '#FACC15', '#3B82F6', '#F97316'];
function makeConfetti(): Piece[] {
  return Array.from({ length: 16 }, (_, i) => ({
    left: 30 + Math.random() * 40,
    dx: (Math.random() - 0.5) * 240,
    dy: 60 + Math.random() * 160,
    r: (Math.random() - 0.5) * 540,
    delay: Math.random() * 80,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  }));
}
function ConfettiLayer({ pieces }: { pieces: Piece[] }) {
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible', zIndex: 5 }}>
      {pieces.map((p, i) => (
        <span key={i} style={{
          position: 'absolute', top: 0, left: `${p.left}%`, width: 8, height: 8,
          background: p.color, borderRadius: i % 2 ? '50%' : '2px',
          ['--dx' as string]: `${p.dx}px`, ['--dy' as string]: `${p.dy}px`, ['--r' as string]: `${p.r}deg`,
          animation: `cwConfetti 1s cubic-bezier(0.2,0.7,0.3,1) ${p.delay}ms forwards`,
        }} />
      ))}
    </div>
  );
}

const secTitle: React.CSSProperties = {
  margin: '0 0 clamp(14px, 2vh, 20px)', textAlign: 'center',
  fontSize: 'clamp(26px, 3.4vw, 40px)', fontWeight: 900, color: '#F1F5F9', letterSpacing: '-0.01em',
};
const nextBtn: React.CSSProperties = {
  padding: '11px 24px', borderRadius: 999, border: '1.5px solid rgba(255,255,255,0.18)',
  background: 'linear-gradient(135deg, #CE1C6F, #AB0055)', color: '#fff',
  fontFamily: 'inherit', fontWeight: 900, fontSize: 15, cursor: 'pointer',
};
const ghostBtn: React.CSSProperties = {
  padding: '13px 24px', borderRadius: 999, border: `1.5px solid rgba(${BRAND.pinkRgb},0.40)`,
  background: `rgba(${BRAND.pinkRgb},0.10)`, color: BRAND.pinkSoft,
  fontFamily: 'inherit', fontWeight: 900, fontSize: 15, cursor: 'pointer',
};
const stepBtn = (disabled: boolean): React.CSSProperties => ({
  width: 32, height: 32, flexShrink: 0, borderRadius: 10, cursor: disabled ? 'default' : 'pointer',
  border: `1.5px solid rgba(${BRAND.pinkRgb},0.4)`, background: `rgba(${BRAND.pinkRgb},0.12)`,
  color: disabled ? 'rgba(226,232,240,0.3)' : BRAND.pinkSoft, fontFamily: 'inherit', fontWeight: 900, fontSize: 18, lineHeight: 1,
});
