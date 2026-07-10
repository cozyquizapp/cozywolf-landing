// Test-Team-Anmeldung (Formspree) — fokussierte Variante des Kontaktformulars
// für die Reel-/Insta-Kampagne. Sammelt Name, Stadt, Gruppengröße, Wunschtermin.
// Verstecktes `art`-Feld + eigener Betreff, damit Wolf Test-Team-Leads sofort
// von normalen Event-Anfragen unterscheiden kann. SSR-sicher (reiner Client-State),
// Fallback auf Mailto wenn keine Formspree-ID gesetzt ist.
import { useState } from 'react';
import { BRAND, EMAIL, FORMSPREE_ID, FORMSPREE_ACTIVE } from '../brand';
import { Icon } from './Icon';
import { useLang } from '../lang';

type Status = 'idle' | 'sending' | 'ok' | 'error';

export function TestTeamForm() {
  const de = useLang() === 'de';
  const [status, setStatus] = useState<Status>('idle');

  const L = de
    ? {
        name: 'Dein Name', stadt: 'Stadt / Region', stadtPh: 'z. B. Hamburg',
        email: 'E-Mail für die Antwort',
        groesse: 'Wie viele seid ihr?', g610: '6–10 Leute', gmehr: 'Mehr als 10', gunter6: 'Weniger als 6', gunklar: 'Weiß ich noch nicht',
        termin: 'Wann würde es passen?', terminPh: 'z. B. ein Freitag im Dezember, abends',
        nachricht: 'Noch was? (optional)', nachrichtPh: 'Location im Kopf? Fragen? Immer her damit.',
        send: 'Als Test-Team anmelden', sending: 'Senden …',
        okT: 'Ihr seid dabei! 🐺', okB: 'Ich melde mich mit einem Terminvorschlag — meist geht das schnell. Euer Quizabend geht aufs Haus.',
        errB: 'Da ging etwas schief. Schreib mir gern direkt an',
        req: 'Pflichtfeld',
      }
    : {
        name: 'Your name', stadt: 'City / region', stadtPh: 'e.g. Bremen',
        email: 'Email for my reply',
        groesse: 'How many are you?', g610: '6–10 people', gmehr: 'More than 10', gunter6: 'Fewer than 6', gunklar: 'Not sure yet',
        termin: 'When would work?', terminPh: 'e.g. a Friday evening in December',
        nachricht: 'Anything else? (optional)', nachrichtPh: 'A venue in mind? Questions? Fire away.',
        send: 'Sign up as a test team', sending: 'Sending …',
        okT: "You're in! 🐺", okB: 'I will come back with a date suggestion, usually quickly. Your quiz night is on the house.',
        errB: 'Something went wrong. Feel free to write me directly at',
        req: 'Required',
      };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    data.set('art', 'Test-Team');

    if (!FORMSPREE_ACTIVE) {
      const body = [
        `${L.name}: ${data.get('name') || ''}`,
        `${L.stadt}: ${data.get('stadt') || ''}`,
        `${L.groesse}: ${data.get('groesse') || ''}`,
        `${L.termin}: ${data.get('termin') || ''}`,
        '', String(data.get('nachricht') || ''),
      ].join('\n');
      window.location.href =
        `mailto:${EMAIL}?subject=${encodeURIComponent(de ? 'Test-Team werden' : 'Test team sign-up')}&body=${encodeURIComponent(body)}`;
      return;
    }

    setStatus('sending');
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST', body: data, headers: { Accept: 'application/json' },
      });
      if (res.ok) { setStatus('ok'); form.reset(); }
      else setStatus('error');
    } catch { setStatus('error'); }
  }

  if (status === 'ok') {
    return (
      <div role="status" style={cardBase}>
        <div style={{ display: 'flex', justifyContent: 'center' }}><Icon name="feier" size={52} /></div>
        <div style={{ fontSize: 22, fontWeight: 900, color: '#F1F5F9', marginTop: 8, textAlign: 'center' }}>{L.okT}</div>
        <p style={{ margin: '10px 0 0', color: BRAND.inkSoft, fontWeight: 500, lineHeight: 1.6, textAlign: 'center' }}>{L.okB}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} style={cardBase}>
      {/* Hidden: Betreff + Art für die Formspree-Mail */}
      <input type="hidden" name="_subject" value={de ? '🐺 Neues Test-Team!' : '🐺 New test team!'} />
      <div style={grid}>
        <Field label={L.name} htmlFor="tt-name" required reqLabel={L.req}>
          <input id="tt-name" name="name" type="text" required style={inp} />
        </Field>
        <Field label={L.stadt} htmlFor="tt-stadt" required reqLabel={L.req}>
          <input id="tt-stadt" name="stadt" type="text" required placeholder={L.stadtPh} style={inp} />
        </Field>
        <Field label={L.groesse} htmlFor="tt-groesse">
          <select id="tt-groesse" name="groesse" defaultValue={L.g610} style={{ ...inp, appearance: 'none' }}>
            {[L.g610, L.gmehr, L.gunter6, L.gunklar].map((o) => (
              // Explizite dunkle option-Farben: das native Dropdown rendert sonst
              // helle Schrift auf weissem OS-Hintergrund → unlesbar.
              <option key={o} value={o} style={{ background: '#171126', color: '#F1F5F9' }}>{o}</option>
            ))}
          </select>
        </Field>
        <Field label={L.email} htmlFor="tt-email" required reqLabel={L.req}>
          <input id="tt-email" name="email" type="email" required style={inp} />
        </Field>
        <Field label={L.termin} htmlFor="tt-termin" full>
          <input id="tt-termin" name="termin" type="text" placeholder={L.terminPh} style={inp} />
        </Field>
        <Field label={L.nachricht} htmlFor="tt-nachricht" full>
          <textarea id="tt-nachricht" name="nachricht" rows={3} placeholder={L.nachrichtPh} style={{ ...inp, resize: 'vertical' }} />
        </Field>
      </div>

      {status === 'error' && (
        <p role="alert" style={{ margin: '14px 0 0', color: '#FCA5A5', fontWeight: 700, fontSize: 14, textAlign: 'center' }}>
          {L.errB} <a href={`mailto:${EMAIL}`} style={{ color: BRAND.pinkSoft }}>{EMAIL}</a>.
        </p>
      )}

      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <button type="submit" className="cw-btn" disabled={status === 'sending'} style={submitBtn}>
          {status === 'sending' ? L.sending : L.send}
        </button>
      </div>
    </form>
  );
}

function Field({ label, htmlFor, children, required, reqLabel, full }: {
  label: string; htmlFor: string; children: React.ReactNode; required?: boolean; reqLabel?: string; full?: boolean;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, gridColumn: full ? '1 / -1' : undefined }}>
      <label htmlFor={htmlFor} style={{ fontSize: 13, fontWeight: 800, color: BRAND.inkSoft, letterSpacing: '0.01em' }}>
        {label}{required && <span aria-hidden style={{ color: BRAND.pink }}> *</span>}
        {required && <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>{reqLabel}</span>}
      </label>
      {children}
    </div>
  );
}

const cardBase: React.CSSProperties = {
  maxWidth: 560, margin: '0 auto', textAlign: 'left',
  padding: 'clamp(22px, 3vw, 34px)', borderRadius: 24,
  background: 'rgba(255,255,255,0.03)', border: `1.5px solid rgba(${BRAND.pinkRgb},0.24)`,
  boxShadow: `0 16px 40px rgba(0,0,0,0.35), 0 0 32px rgba(${BRAND.pinkRgb},0.10)`,
};
const grid: React.CSSProperties = {
  display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
};
const inp: React.CSSProperties = {
  width: '100%', padding: '11px 14px', borderRadius: 12,
  background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.12)',
  color: '#F1F5F9', fontFamily: 'inherit', fontSize: 15, fontWeight: 600,
};
const submitBtn: React.CSSProperties = {
  padding: '14px 30px', borderRadius: 999, border: '1.5px solid rgba(255,255,255,0.18)',
  background: 'linear-gradient(135deg, #CE1C6F, #AB0055)', color: '#fff',
  fontFamily: 'inherit', fontWeight: 900, fontSize: 16, cursor: 'pointer',
};
