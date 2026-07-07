// Gemeinsame Hülle für alle Seiten: Top-Nav + Footer + Seiten-Rahmen.
// Plus geteilte UI-Primitive (Btn, Section, PageHero), damit die Seiten DRY
// bleiben. Navigation läuft über echte <a>-Links (Full-Page-Loads) — Vercel
// leitet jede Route auf die SPA, React rendert per Pfad die passende Seite.
import type { ReactNode } from 'react';
import { BRAND, FONT_DISPLAY, FONT_BODY, EMAIL, INSTA_URL, INSTA_HANDLE, PLAY_URL, WONKY_URL } from './brand';
import { useLang, setLang, type Lang } from './lang';
import { usePath } from './pathContext';
import { t } from './i18n';

const NAV_LINKS = (d: ReturnType<typeof t>) => [
  { href: '/firmen', label: d.navFirmen },
  { href: '/locations', label: d.navLocations },
  { href: '/feiern', label: d.navFeiern },
  { href: '/ueber', label: d.navUeber },
  { href: '/kontakt', label: d.navKontakt },
];

export function Layout({ children }: { children: ReactNode }) {
  const lang = useLang();
  return (
    <div style={{
      minHeight: '100vh',
      background:
        `radial-gradient(ellipse at 50% -10%, rgba(${BRAND.pinkRgb},0.16), transparent 55%),` +
        'radial-gradient(ellipse at 85% 110%, rgba(30,42,90,0.16), transparent 55%),' +
        `radial-gradient(ellipse at 12% 82%, rgba(${BRAND.pinkRgb},0.07), transparent 50%),` +
        BRAND.bg,
      color: BRAND.ink,
      fontFamily: FONT_BODY,
      display: 'flex', flexDirection: 'column',
    }}>
      <NavBar lang={lang} />
      <main style={{ flex: 1, width: '100%' }}>{children}</main>
      <SiteFooter lang={lang} />
    </div>
  );
}

function NavBar({ lang }: { lang: Lang }) {
  const d = t(lang);
  const path = usePath();
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(10,8,20,0.72)',
      backdropFilter: 'blur(12px)',
      borderBottom: `1px solid rgba(${BRAND.pinkRgb},0.14)`,
    }}>
      <nav style={{
        maxWidth: 1120, margin: '0 auto',
        padding: '12px 20px',
        display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap',
      }}>
        <a href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          textDecoration: 'none', marginRight: 'auto',
        }}>
          <img src="/logo.png" alt="" width={34} height={34}
            style={{ objectFit: 'contain', filter: `drop-shadow(0 2px 8px rgba(${BRAND.pinkRgb},0.4))` }} />
          <span style={{
            fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 22,
            letterSpacing: '0.04em', textTransform: 'uppercase', color: BRAND.pink,
          }}>CozyWolf</span>
        </a>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
          {NAV_LINKS(d).map(l => {
            const active = path === l.href;
            return (
              <a key={l.href} href={l.href} style={{
                padding: '7px 12px', borderRadius: 999,
                textDecoration: 'none', fontSize: 14, fontWeight: 800,
                color: active ? BRAND.pink : BRAND.inkSoft,
                background: active ? `rgba(${BRAND.pinkRgb},0.12)` : 'transparent',
                transition: 'color 0.15s, background 0.15s',
              }}>{l.label}</a>
            );
          })}
        </div>

        <LangSwitch lang={lang} />
      </nav>
    </header>
  );
}

function LangSwitch({ lang }: { lang: Lang }) {
  return (
    <div style={{
      display: 'flex', gap: 2, padding: 3, borderRadius: 999,
      background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(${BRAND.pinkRgb},0.20)`,
    }}>
      {(['de', 'en'] as Lang[]).map(l => (
        <button key={l} onClick={() => setLang(l)} style={{
          padding: '5px 12px', borderRadius: 999, border: 'none', cursor: 'pointer',
          fontFamily: 'inherit', fontSize: 12, fontWeight: 800, letterSpacing: '0.06em',
          background: lang === l ? BRAND.pink : 'transparent',
          color: lang === l ? BRAND.bg : BRAND.inkSoft,
          transition: 'background 0.15s, color 0.15s',
        }}>{l.toUpperCase()}</button>
      ))}
    </div>
  );
}

function SiteFooter({ lang }: { lang: Lang }) {
  const d = t(lang);
  return (
    <footer style={{
      borderTop: `1px solid rgba(255,255,255,0.07)`,
      marginTop: 40,
    }}>
      <div style={{
        maxWidth: 1120, margin: '0 auto', padding: '32px 20px 40px',
        display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center',
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 20,
          letterSpacing: '0.04em', textTransform: 'uppercase', color: BRAND.pink,
        }}>CozyWolf</div>
        <div style={{ color: BRAND.inkSoft, fontSize: 15, fontWeight: 600 }}>{d.footerTagline}</div>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', fontSize: 14 }}>
          <a href={`mailto:${EMAIL}`} style={footerLink}>{EMAIL}</a>
          <span style={dot}>·</span>
          <a href={INSTA_URL} target="_blank" rel="noopener noreferrer" style={footerLink}>{INSTA_HANDLE}</a>
          <span style={dot}>·</span>
          <a href={PLAY_URL} target="_blank" rel="noopener noreferrer" style={footerLink}>play.cozyquiz.app</a>
        </div>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', fontSize: 13 }}>
          <a href="/impressum" style={footerLinkMuted}>{d.footerImprint}</a>
          <span style={dot}>·</span>
          <a href="/datenschutz" style={footerLinkMuted}>{d.footerPrivacy}</a>
          <span style={dot}>·</span>
          <a href={WONKY_URL} target="_blank" rel="noopener noreferrer" style={footerLinkMuted}>{d.footerWonky}</a>
        </div>

        <div style={{ color: BRAND.muted, fontSize: 12, marginTop: 4 }}>{d.footerMade} · 2026</div>
      </div>
    </footer>
  );
}

const footerLink: React.CSSProperties = { color: BRAND.pink, textDecoration: 'none', fontWeight: 700 };
const footerLinkMuted: React.CSSProperties = { color: BRAND.muted, textDecoration: 'none', fontWeight: 700 };
const dot: React.CSSProperties = { color: BRAND.muted, opacity: 0.5 };

// ─── Geteilte Seiten-Primitive ────────────────────────────────────────────

export function Btn({ href, children, variant = 'primary' }: {
  href: string; children: ReactNode; variant?: 'primary' | 'secondary';
}) {
  const external = href.startsWith('http') || href.startsWith('mailto:');
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '13px 26px', borderRadius: 999,
    textDecoration: 'none', fontWeight: 900, fontSize: 16,
    letterSpacing: '0.01em',
  };
  const style: React.CSSProperties = variant === 'primary'
    ? { ...base, background: `linear-gradient(135deg, ${BRAND.pink}, ${BRAND.magenta})`, color: '#fff', border: '1.5px solid rgba(255,255,255,0.18)' }
    : { ...base, background: `rgba(${BRAND.pinkRgb},0.10)`, color: BRAND.pinkSoft, border: `1.5px solid rgba(${BRAND.pinkRgb},0.40)` };
  return (
    <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined} style={style}>
      {children}
    </a>
  );
}

export function Section({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return (
    <section style={{
      maxWidth: 1120, margin: '0 auto', padding: 'clamp(40px, 7vh, 88px) 20px',
      ...style,
    }}>{children}</section>
  );
}

export function PageHero({ eyebrow, title, sub }: { eyebrow?: string; title: string; sub?: string }) {
  return (
    <Section style={{ textAlign: 'center', paddingBottom: 'clamp(24px, 4vh, 48px)' }}>
      {eyebrow && (
        <div style={{
          fontSize: 13, fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase',
          color: BRAND.pink, marginBottom: 14,
        }}>{eyebrow}</div>
      )}
      <h1 style={{
        margin: 0, fontSize: 'clamp(34px, 6vw, 60px)', fontWeight: 900, lineHeight: 1.05,
        color: '#F1F5F9', letterSpacing: '-0.02em', textWrap: 'balance',
      }}>{title}</h1>
      {sub && (
        <p style={{
          margin: '18px auto 0', maxWidth: 680, fontSize: 'clamp(16px, 2vw, 20px)',
          color: BRAND.inkSoft, fontWeight: 600, lineHeight: 1.55,
        }}>{sub}</p>
      )}
    </Section>
  );
}
