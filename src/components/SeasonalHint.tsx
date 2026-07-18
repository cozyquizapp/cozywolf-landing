// Saison-Hinweis (Weihnachtsfeier): erscheint NUR Okt-Dez, rein clientseitig
// (kein Prerender -> keine SEO-Irritation ausserhalb der Saison). Dezente Band,
// dismissbar pro Session. Wolf-Wunsch: Timing ~ab Oktober.
import { useState } from 'react';
import { useLang } from '../lang';
import { BRAND } from '../brand';

const KEY = 'cw-xmas-dismissed';

export function SeasonalHint() {
  const lang = useLang();
  const [show, setShow] = useState(() => {
    const m = new Date().getMonth(); // 0=Jan ... 9=Okt, 10=Nov, 11=Dez
    const inSeason = m >= 9 && m <= 11;
    let dismissed = false;
    try { dismissed = sessionStorage.getItem(KEY) === '1'; } catch { /* ignore */ }
    return inSeason && !dismissed;
  });
  if (!show) return null;
  const de = lang === 'de';
  return (
    <div className="cw-reveal cw-in" style={{ padding: '0 clamp(16px, 4vw, 32px)', marginTop: 14 }}>
      <div style={{
        maxWidth: 1120, margin: '0 auto',
        display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'center',
        padding: '12px 18px', borderRadius: 16, textAlign: 'center',
        background: `radial-gradient(ellipse at 15% 50%, rgba(${BRAND.pinkRgb},0.16), transparent 65%), rgba(255,255,255,0.03)`,
        border: `1px solid rgba(${BRAND.pinkRgb},0.32)`,
      }}>
        <span aria-hidden style={{ fontSize: 20 }}>🎄</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: BRAND.ink, lineHeight: 1.4 }}>
          {de
            ? 'Weihnachtsfeier-Termine sind früh gefragt, sichert euch jetzt euren Wunschtermin.'
            : 'Christmas party dates fill up early, secure your preferred date now.'}
        </span>
        <a href="/kontakt" className="cw-btn" style={{
          fontSize: 14, fontWeight: 900, color: '#fff', textDecoration: 'none',
          padding: '8px 16px', borderRadius: 999,
          background: 'linear-gradient(135deg, #CE1C6F, #AB0055)', whiteSpace: 'nowrap',
        }}>{de ? 'Termin sichern' : 'Reserve a date'}</a>
        <button
          onClick={() => { try { sessionStorage.setItem(KEY, '1'); } catch { /* ignore */ } setShow(false); }}
          aria-label={de ? 'Hinweis schließen' : 'Dismiss'}
          style={{
            marginLeft: 4, width: 26, height: 26, flexShrink: 0, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '50%', border: '1px solid rgba(255,255,255,0.14)',
            background: 'transparent', color: BRAND.muted, fontSize: 15, lineHeight: 1,
          }}
        >×</button>
      </div>
    </div>
  );
}
