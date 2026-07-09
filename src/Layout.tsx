// Gemeinsame Hülle für alle Seiten: Top-Nav + Footer + Seiten-Rahmen.
// Plus geteilte UI-Primitive (Btn, Section, PageHero), damit die Seiten DRY
// bleiben. Navigation läuft über echte <a>-Links (Full-Page-Loads) — Vercel
// leitet jede Route auf die SPA, React rendert per Pfad die passende Seite.
import { useState, useEffect, type ReactNode } from 'react';
import { BRAND, FONT_DISPLAY, FONT_BODY, EMAIL, INSTA_URL, INSTA_HANDLE } from './brand';
import { useLang, setLang, type Lang } from './lang';
import { usePath } from './pathContext';
import { t } from './i18n';
import { Icon } from './components/Icon';
import { Fireflies } from './components/Fireflies';

const NAV_LINKS = (d: ReturnType<typeof t>) => [
  { href: '/firmen', label: d.navFirmen },
  { href: '/locations', label: d.navLocations },
  { href: '/feiern', label: d.navFeiern },
  { href: '/ueber', label: d.navUeber },
  { href: '/kontakt', label: d.navKontakt },
];

export function Layout({ children }: { children: ReactNode }) {
  const lang = useLang();
  // <html lang> mit der tatsaechlich gerenderten Sprache synchron halten
  // (auto-detektiertes EN beim ersten Laden, nicht nur beim Toggle). WCAG 3.1.1
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
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
      <a href="#main" className="cw-skip">{lang === 'de' ? 'Zum Inhalt springen' : 'Skip to content'}</a>
      <NavBar lang={lang} />
      <main id="main" style={{ flex: 1, width: '100%' }}>{children}</main>
      <SiteFooter lang={lang} />
      <StickyMobileCta lang={lang} />
    </div>
  );
}

function NavBar({ lang }: { lang: Lang }) {
  const d = t(lang);
  const path = usePath();
  const [open, setOpen] = useState(false);
  const links = NAV_LINKS(d);
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(10,8,20,0.78)',
      backdropFilter: 'blur(12px)',
      borderBottom: `1px solid rgba(${BRAND.pinkRgb},0.14)`,
    }}>
      <style>{`
        @media (max-width: 780px) {
          .cw-desktop-links { display: none !important; }
          .cw-burger { display: inline-flex !important; }
        }
      `}</style>
      <nav style={{
        maxWidth: 1120, margin: '0 auto',
        padding: '12px 20px',
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <a href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          textDecoration: 'none', marginRight: 'auto',
        }}>
          <img src="/logo.webp" alt="" width={34} height={34}
            style={{ objectFit: 'contain', filter: `drop-shadow(0 2px 8px rgba(${BRAND.pinkRgb},0.4))` }} />
          <span style={{
            fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 22,
            letterSpacing: '0.04em', textTransform: 'uppercase', color: BRAND.pink,
          }}>CozyWolf</span>
        </a>

        <div className="cw-desktop-links" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {links.map(l => {
            const active = path === l.href;
            return (
              <a key={l.href} href={l.href} aria-current={active ? 'page' : undefined} style={{
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

        <button
          className="cw-burger"
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Menü schließen' : 'Menü öffnen'}
          aria-expanded={open}
          aria-controls="cw-mobile-menu"
          style={{
            display: 'none', alignItems: 'center', justifyContent: 'center',
            width: 40, height: 40, borderRadius: 12, cursor: 'pointer',
            border: `1px solid rgba(${BRAND.pinkRgb},0.28)`, background: `rgba(${BRAND.pinkRgb},0.10)`,
            color: BRAND.pink, fontSize: 20, fontFamily: 'inherit', lineHeight: 1,
          }}
        >{open ? '✕' : '☰'}</button>
      </nav>

      {open && (
        <div id="cw-mobile-menu" style={{
          borderTop: `1px solid rgba(${BRAND.pinkRgb},0.14)`,
          padding: '8px 16px 14px',
          display: 'flex', flexDirection: 'column', gap: 2,
        }}>
          {links.map(l => {
            const active = path === l.href;
            return (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} aria-current={active ? 'page' : undefined} style={{
                padding: '12px 14px', borderRadius: 12,
                textDecoration: 'none', fontSize: 16, fontWeight: 800,
                color: active ? BRAND.pink : BRAND.inkSoft,
                background: active ? `rgba(${BRAND.pinkRgb},0.12)` : 'transparent',
              }}>{l.label}</a>
            );
          })}
        </div>
      )}
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
        <button key={l} onClick={() => setLang(l)}
          aria-pressed={lang === l}
          aria-label={l === 'de' ? 'Auf Deutsch umschalten' : 'Switch to English'}
          style={{
          padding: '8px 13px', borderRadius: 999, border: 'none', cursor: 'pointer',
          fontFamily: 'inherit', fontSize: 12, fontWeight: 800, letterSpacing: '0.06em',
          background: lang === l ? BRAND.pink : 'transparent',
          color: lang === l ? BRAND.bg : BRAND.inkSoft,
          transition: 'background 0.15s, color 0.15s',
        }}>{l.toUpperCase()}</button>
      ))}
    </div>
  );
}

// Sticky-CTA nur mobil: gleitet nach dem Hero hoch, auf /kontakt ausgeblendet.
function StickyMobileCta({ lang }: { lang: Lang }) {
  const path = usePath();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 520);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  if (path === '/kontakt') return null;
  return (
    <div className="cw-sticky-cta" data-show={show} aria-hidden={!show}>
      <a href="/kontakt" className="cw-btn" tabIndex={show ? 0 : -1} style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '14px 30px', borderRadius: 999, textDecoration: 'none',
        fontWeight: 900, fontSize: 16, color: '#fff',
        background: 'linear-gradient(135deg, #CE1C6F, #AB0055)',
        border: '1.5px solid rgba(255,255,255,0.18)',
        boxShadow: `0 10px 30px rgba(${BRAND.pinkRgb},0.4), 0 4px 12px rgba(0,0,0,0.4)`,
      }}>{lang === 'de' ? 'Quiz anfragen' : 'Request a quiz'}</a>
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
        maxWidth: 1120, margin: '0 auto', padding: '22px 20px 26px',
        display: 'flex', flexDirection: 'column', gap: 7, alignItems: 'center',
        textAlign: 'center',
      }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', fontSize: 14 }}>
          <a href={`mailto:${EMAIL}`} style={footerLink}>{EMAIL}</a>
          <span style={dot}>·</span>
          <a href={INSTA_URL} target="_blank" rel="noopener noreferrer" style={{ ...footerLink, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Icon name="instagram" size={18} alt="" />{INSTA_HANDLE}
          </a>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', fontSize: 12.5, color: BRAND.muted }}>
          <span>{d.footerMade}</span>
          <span style={dot}>·</span>
          <a href="/impressum" style={footerLinkMuted}>{d.footerImprint}</a>
          <span style={dot}>·</span>
          <a href="/datenschutz" style={footerLinkMuted}>{d.footerPrivacy}</a>
        </div>
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
    ? { ...base, background: 'linear-gradient(135deg, #CE1C6F, #AB0055)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.18)' }
    : { ...base, background: `rgba(${BRAND.pinkRgb},0.10)`, color: BRAND.pinkSoft, border: `1.5px solid rgba(${BRAND.pinkRgb},0.40)` };
  return (
    <a className="cw-btn" href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined} style={style}>
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

export function PageHero({ eyebrow, eyebrowLower, title, sub, visual }: { eyebrow?: string; eyebrowLower?: boolean; title: string; sub?: string; visual?: ReactNode }) {
  return (
    <Section style={{ textAlign: 'center', paddingBottom: 'clamp(24px, 4vh, 48px)', position: 'relative' }}>
      <style>{`
        @keyframes cwHeroGlow { 0%,100% { opacity: 0.7; transform: translateX(-50%) scale(1); } 50% { opacity: 1; transform: translateX(-50%) scale(1.08); } }
        @keyframes cwHeroFloat { 0%,100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-10px) rotate(2deg); } }
        @media (prefers-reduced-motion: reduce) { .cw-hero-glow, .cw-hero-visual { animation: none !important; } }
      `}</style>
      {/* Ambient-Fireflies hinter dem Hero — dezente Marken-Atmosphäre wie in der App. */}
      <Fireflies />
      <div className="cw-hero-glow" aria-hidden style={{
        position: 'absolute', top: '-6%', left: '50%', transform: 'translateX(-50%)',
        width: 'min(760px, 92%)', height: 'clamp(200px, 34vh, 380px)', pointerEvents: 'none', zIndex: 0,
        background: `radial-gradient(ellipse 60% 100% at 50% 30%, rgba(${BRAND.pinkRgb},0.20), rgba(${BRAND.pinkRgb},0.06) 45%, transparent 72%)`,
        filter: 'blur(6px)',
        animation: 'cwHeroGlow 7s ease-in-out infinite',
      }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
      {visual && (
        <div className="cw-hero-visual" aria-hidden style={{
          margin: '0 auto clamp(14px, 2vh, 22px)', width: 'clamp(96px, 12vw, 148px)',
          animation: 'cwHeroFloat 6s ease-in-out infinite',
        }}>{visual}</div>
      )}
      {eyebrow && (
        <div style={{
          fontWeight: 900, color: BRAND.pink, marginBottom: 14,
          fontSize: eyebrowLower ? 16 : 13,
          letterSpacing: eyebrowLower ? '0.01em' : '0.16em',
          textTransform: eyebrowLower ? 'none' : 'uppercase',
        }}>{eyebrow}</div>
      )}
      <h1 style={{
        margin: 0, fontFamily: FONT_DISPLAY, fontSize: 'clamp(36px, 6.2vw, 64px)', fontWeight: 800, lineHeight: 1.02,
        color: '#F1F5F9', letterSpacing: '-0.015em', textWrap: 'balance',
      }}>{title}</h1>
      {sub && (
        <p style={{
          margin: '18px auto 0', maxWidth: 680, fontSize: 'clamp(16px, 2vw, 20px)',
          color: BRAND.inkSoft, fontWeight: 600, lineHeight: 1.55,
        }}>{sub}</p>
      )}
      </div>
    </Section>
  );
}
