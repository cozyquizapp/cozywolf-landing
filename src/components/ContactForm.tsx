// Lead-Formular (Formspree) als zuverlaessiger Haupt-Weg statt fragilem mailto:
// laeuft in-page, funktioniert ueberall, ist messbar. Solange keine Formspree-ID
// gesetzt ist (brand.ts FORMSPREE_ID), faellt der Submit auf einen vorausgefuellten
// Mailto zurueck, damit nichts ins Leere laeuft. SSR-sicher (rein Client-State).
import { useState } from 'react';
import { BRAND, EMAIL, FORMSPREE_ID, FORMSPREE_ACTIVE } from '../brand';
import { useLang } from '../lang';

type Status = 'idle' | 'sending' | 'ok' | 'error';

export function ContactForm() {
  const de = useLang() === 'de';
  const [status, setStatus] = useState<Status>('idle');

  const L = de
    ? {
        anlass: 'Anlass', anlassPh: 'Firmenevent, Geburtstag, Pub-Quiz …',
        personen: 'Ungefähre Personenzahl', personenPh: 'z. B. 40',
        datum: 'Wunsch-Datum oder Zeitraum', datumPh: 'z. B. Freitag im November',
        name: 'Dein Name', email: 'E-Mail für die Antwort',
        nachricht: 'Nachricht (optional)', nachrichtPh: 'Worum geht es? Alles Weitere klären wir zusammen.',
        send: 'Anfrage absenden', sending: 'Senden …',
        okT: 'Danke, ist angekommen!', okB: 'Ich melde mich mit einem Vorschlag bei dir. Meist geht das schnell.',
        errB: 'Da ging etwas schief. Schreib mir gern direkt an',
        req: 'Pflichtfeld',
      }
    : {
        anlass: 'Occasion', anlassPh: 'Company event, birthday, pub quiz …',
        personen: 'Approx. number of people', personenPh: 'e.g. 40',
        datum: 'Preferred date or timeframe', datumPh: 'e.g. a Friday in November',
        name: 'Your name', email: 'Email for my reply',
        nachricht: 'Message (optional)', nachrichtPh: 'What is it about? We sort out the rest together.',
        send: 'Send request', sending: 'Sending …',
        okT: 'Thanks, got it!', okB: 'I will come back to you with a suggestion, usually quickly.',
        errB: 'Something went wrong. Feel free to write me directly at',
        req: 'Required',
      };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    // Fallback ohne Formspree-ID: vorausgefuellten Mailto oeffnen.
    if (!FORMSPREE_ACTIVE) {
      const body = [
        `${L.anlass}: ${data.get('anlass') || ''}`,
        `${L.personen}: ${data.get('personen') || ''}`,
        `${L.datum}: ${data.get('datum') || ''}`,
        `${L.name}: ${data.get('name') || ''}`,
        '', String(data.get('nachricht') || ''),
      ].join('\n');
      window.location.href =
        `mailto:${EMAIL}?subject=${encodeURIComponent(de ? 'Quiz-Anfrage' : 'Quiz booking request')}&body=${encodeURIComponent(body)}`;
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
        <div style={{ fontSize: 40 }} aria-hidden>🎉</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: '#F1F5F9', marginTop: 8 }}>{L.okT}</div>
        <p style={{ margin: '10px 0 0', color: BRAND.inkSoft, fontWeight: 500, lineHeight: 1.6 }}>{L.okB}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} style={cardBase}>
      <div style={grid}>
        <Field label={L.anlass} htmlFor="anlass">
          <input id="anlass" name="anlass" type="text" placeholder={L.anlassPh} style={inp} />
        </Field>
        <Field label={L.personen} htmlFor="personen">
          <input id="personen" name="personen" type="text" inputMode="numeric" placeholder={L.personenPh} style={inp} />
        </Field>
        <Field label={L.datum} htmlFor="datum">
          <input id="datum" name="datum" type="text" placeholder={L.datumPh} style={inp} />
        </Field>
        <Field label={L.name} htmlFor="name" required reqLabel={L.req}>
          <input id="name" name="name" type="text" required style={inp} />
        </Field>
        <Field label={L.email} htmlFor="email" required reqLabel={L.req} full>
          <input id="email" name="email" type="email" required style={inp} />
        </Field>
        <Field label={L.nachricht} htmlFor="nachricht" full>
          <textarea id="nachricht" name="nachricht" rows={4} placeholder={L.nachrichtPh} style={{ ...inp, resize: 'vertical' }} />
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
