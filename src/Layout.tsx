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

  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  return (
    <div style={{
      minHeight: '100dvh',
      background:
        `radial-gradient(circle at 15% 10%, rgba(${BRAND.pinkRgb},0.18), transparent 28%),` +
        'radial-gradient(circle at 84% 14%, rgba(30,42,90,0.32), transparent 30%),' +
        `radial-gradient(circle at 50% 100%, rgba(${BRAND.pinkRgb},0.10), transparent 34%),` +
        BRAND.bg,
      color: BRAND.ink,
      fontFamily: FONT_BODY,
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'clip',
    }}>
      <a href="#main" className="cw-skip">{lang === 'de' ? 'Zum Inhalt springen' : 'Skip to content'}</a>
      <NavBar lang={lang} />
      <main id="main" style={{ flex: 1, width: '100%', position: 'relative', zIndex: 1 }}>{children}</main>
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
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backdropFilter: 'blur(18px)',
      background: 'rgba(7, 6, 16, 0.74)',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      boxShadow: '0 10px 40px rgba(0,0,0,0.18)',
    }}>
      <style>{`
        @media (max-width: 980px) {
          .cw-nav-links { display: none !important; }
          .cw-nav-note { display: none !important; }
          .cw-nav-cta { display: none !important; }
          .cw-burger { display: inline-flex !important; }
        }
      `}</style>
      <nav style={{
        maxWidth: 1180,
        margin: '0 auto',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}>
        <a href="/" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 12,
          textDecoration: 'none',
          marginRight: 'auto',
          minWidth: 0,
        }}>
          <span style={{
            width: 42,
            height: 42,
            borderRadius: 14,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(135deg, rgba(${BRAND.pinkRgb},0.22), rgba(${BRAND.pinkRgb},0.06))`,
            border: `1px solid rgba(${BRAND.pinkRgb},0.22)`,
            boxShadow: `0 10px 28px rgba(${BRAND.pinkRgb},0.12)`,
            flexShrink: 0,
          }}>
            <img src="/logo.webp" alt="" width={28} height={28} style={{ objectFit: 'contain' }} />
          </span>
          <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 800,
              fontSize: 21,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#fff4fb',
              lineHeight: 1,
            }}>CozyWolf</span>
            <span className="cw-nav-note" style={{
              fontSize: 11.5,
              fontWeight: 700,
              color: 'rgba(226,232,240,0.72)',
              letterSpacing: '0.04em',
              marginTop: 4,
              whiteSpace: 'nowrap',
            }}>
              Live-Quiz-Events und Test-Teams in Hamburg
            </span>
          </span>
        </a>

        <div className="cw-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {links.map((l) => {
            const active = path === l.href;
            return (
              <a key={l.href} href={l.href} aria-current={active ? 'page' : undefined} style={{
                padding: '9px 14px',
                borderRadius: 999,
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 800,
                color: active ? '#fff4fb' : 'rgba(226,232,240,0.74)',
                background: active ? `rgba(${BRAND.pinkRgb},0.14)` : 'transparent',
                border: active ? `1px solid rgba(${BRAND.pinkRgb},0.24)` : '1px solid transparent',
                transition: 'color 0.18s ease, background 0.18s ease, border-color 0.18s ease',
              }}>{l.label}</a>
            );
          })}
        </div>

        <LangSwitch lang={lang} />

        <a href="/kontakt" className="cw-nav-cta cw-btn" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '11px 18px',
          borderRadius: 999,
          textDecoration: 'none',
          fontWeight: 900,
          fontSize: 14,
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.14)',
          background: 'linear-gradient(135deg, #F54D9C, #A60C58)',
          boxShadow: `0 14px 30px rgba(${BRAND.pinkRgb},0.22)`,
          whiteSpace: 'nowrap',
        }}>
          {d.ctaBook}
        </a>

        <button
          className="cw-burger"
          onClick={() => setOpen((current) => !current)}
          aria-label={open ? 'Menü schließen' : 'Menü öffnen'}
          aria-expanded={open}
          aria-controls="cw-mobile-menu"
          style={{
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            width: 42,
            height: 42,
            borderRadius: 14,
            cursor: 'pointer',
            border: '1px solid rgba(255,255,255,0.10)',
            background: 'rgba(255,255,255,0.04)',
            color: '#fff4fb',
            fontSize: 20,
            fontFamily: 'inherit',
            lineHeight: 1,
            flexShrink: 0,
          }}
        >{open ? '×' : '☰'}</button>
      </nav>

      {open && (
        <div id="cw-mobile-menu" style={{
          padding: '0 18px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>
          <div style={{
            display: 'grid',
            gap: 8,
            padding: 14,
            borderRadius: 20,
            background: 'rgba(255,255,255,0.035)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            {links.map((l) => {
              const active = path === l.href;
              return (
                <a key={l.href} href={l.href} aria-current={active ? 'page' : undefined} style={{
                  padding: '12px 14px',
                  borderRadius: 14,
                  textDecoration: 'none',
                  fontSize: 16,
                  fontWeight: 800,
                  color: active ? '#fff4fb' : 'rgba(226,232,240,0.82)',
                  background: active ? `rgba(${BRAND.pinkRgb},0.14)` : 'transparent',
                }}>{l.label}</a>
              );
            })}
            <a href="/kontakt" className="cw-btn" style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '14px 18px',
              borderRadius: 999,
              textDecoration: 'none',
              fontWeight: 900,
              fontSize: 15,
              color: '#fff',
              background: 'linear-gradient(135deg, #F54D9C, #A60C58)',
              border: '1px solid rgba(255,255,255,0.16)',
              marginTop: 6,
            }}>
              {d.ctaBook}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

function LangSwitch({ lang }: { lang: Lang }) {
  return (
    <div style={{
      display: 'flex',
      gap: 3,
      padding: 3,
      borderRadius: 999,
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      flexShrink: 0,
    }}>
      {(['de', 'en'] as Lang[]).map((nextLang) => (
        <button
          key={nextLang}
          onClick={() => setLang(nextLang)}
          aria-pressed={lang === nextLang}
          aria-label={nextLang === 'de' ? 'Auf Deutsch umschalten' : 'Switch to English'}
          style={{
            padding: '8px 12px',
            borderRadius: 999,
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: 12,
            fontWeight: 900,
            letterSpacing: '0.08em',
            background: lang === nextLang ? 'rgba(255,255,255,0.92)' : 'transparent',
            color: lang === nextLang ? BRAND.bg : 'rgba(226,232,240,0.76)',
            transition: 'background 0.16s ease, color 0.16s ease',
          }}
        >{nextLang.toUpperCase()}</button>
      ))}
    </div>
  );
}

function StickyMobileCta({ lang }: { lang: Lang }) {
  const path = usePath();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (path === '/kontakt') return;

    const trigger = document.querySelector('[data-sticky-trigger]') ?? document.querySelector('main section');
    if (!trigger) return;

    const observer = new IntersectionObserver(
      ([entry]) => setShow(!entry.isIntersecting),
      { threshold: 0.12, rootMargin: '-42% 0px 0px 0px' },
    );

    observer.observe(trigger);
    return () => observer.disconnect();
  }, [path]);

  if (path === '/kontakt') return null;

  return (
    <div className="cw-sticky-cta" data-show={show} aria-hidden={!show}>
      <a href="/kontakt" className="cw-btn" tabIndex={show ? 0 : -1} style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        minWidth: 'min(100%, 320px)',
        padding: '15px 24px',
        borderRadius: 999,
        textDecoration: 'none',
        fontWeight: 900,
        fontSize: 16,
        color: '#fff',
        background: 'linear-gradient(135deg, #F54D9C, #A60C58)',
        border: '1px solid rgba(255,255,255,0.18)',
        boxShadow: `0 18px 40px rgba(${BRAND.pinkRgb},0.28), 0 6px 16px rgba(0,0,0,0.35)`,
      }}>{lang === 'de' ? 'Quiz anfragen' : 'Request a quiz'}</a>
    </div>
  );
}

function SiteFooter({ lang }: { lang: Lang }) {
  const d = t(lang);

  return (
    <footer style={{
      marginTop: 48,
      borderTop: '1px solid rgba(255,255,255,0.07)',
      background: 'rgba(6,6,14,0.65)',
      backdropFilter: 'blur(16px)',
    }}>
      <div style={{
        maxWidth: 1180,
        margin: '0 auto',
        padding: '34px 24px 30px',
        display: 'grid',
        gap: 22,
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 18,
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}>
          <div style={{ maxWidth: 420 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <span style={{
                width: 42,
                height: 42,
                borderRadius: 14,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, rgba(${BRAND.pinkRgb},0.22), rgba(${BRAND.pinkRgb},0.06))`,
                border: `1px solid rgba(${BRAND.pinkRgb},0.22)`,
              }}>
                <img src="/logo.webp" alt="" width={28} height={28} style={{ objectFit: 'contain' }} />
              </span>
              <span style={{
                fontFamily: FONT_DISPLAY,
                fontWeight: 800,
                fontSize: 21,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#fff4fb',
              }}>CozyWolf</span>
            </div>
            <p style={{
              margin: 0,
              color: 'rgba(226,232,240,0.70)',
              fontSize: 15,
              lineHeight: 1.6,
              fontWeight: 600,
            }}>
              Live-Quiz-Events mit echter Moderation, Handy-Gameplay und klaren Wegen für Buchungen, Test-Teams und neugierige Erstbesucher.
            </p>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 10,
          }}>
            <a href={`mailto:${EMAIL}`} style={footerLink}>{EMAIL}</a>
            <a href={INSTA_URL} target="_blank" rel="noopener noreferrer" style={{ ...footerLink, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Icon name="instagram" size={18} alt="" />
              {INSTA_HANDLE}
            </a>
            <a href="/testen" style={footerLinkMuted}>{lang === 'de' ? 'Test-Team werden' : 'Become a test team'}</a>
          </div>
        </div>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          justifyContent: 'space-between',
          alignItems: 'center',
          color: BRAND.muted,
          fontSize: 13,
        }}>
          <span>{d.footerMade}</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <a href="/impressum" style={footerLinkMuted}>{d.footerImprint}</a>
            <a href="/datenschutz" style={footerLinkMuted}>{d.footerPrivacy}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

const footerLink: React.CSSProperties = {
  color: '#fff4fb',
  textDecoration: 'none',
  fontWeight: 800,
};

const footerLinkMuted: React.CSSProperties = {
  color: BRAND.muted,
  textDecoration: 'none',
  fontWeight: 700,
};

export function Btn({ href, children, variant = 'primary' }: {
  href: string;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
}) {
  const external = href.startsWith('http') || href.startsWith('mailto:');
  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '14px 24px',
    borderRadius: 999,
    textDecoration: 'none',
    fontWeight: 900,
    fontSize: 15.5,
    lineHeight: 1,
    minHeight: 48,
    whiteSpace: 'nowrap',
  };

  const style: React.CSSProperties = variant === 'primary'
    ? {
        ...base,
        background: 'linear-gradient(135deg, #F54D9C, #A60C58)',
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.16)',
        boxShadow: `0 16px 34px rgba(${BRAND.pinkRgb},0.22)`,
      }
    : variant === 'ghost'
      ? {
          ...base,
          background: 'transparent',
          color: '#fff4fb',
          border: '1px solid rgba(255,255,255,0.14)',
        }
      : {
          ...base,
          background: 'rgba(255,255,255,0.05)',
          color: '#fff4fb',
          border: '1px solid rgba(255,255,255,0.10)',
        };

  return (
    <a
      className="cw-btn"
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      style={style}
    >
      {children}
    </a>
  );
}

export function Section({
  children,
  style,
  id,
}: {
  children: ReactNode;
  style?: React.CSSProperties;
  id?: string;
}) {
  return (
    <section id={id} style={{
      maxWidth: 1180,
      margin: '0 auto',
      padding: 'clamp(56px, 8vh, 104px) 24px',
      width: '100%',
      ...style,
    }}>{children}</section>
  );
}

export function PageHero({
  eyebrow,
  eyebrowLower,
  title,
  sub,
  visual,
}: {
  eyebrow?: string;
  eyebrowLower?: boolean;
  title: string;
  sub?: string;
  visual?: ReactNode;
}) {
  return (
    <Section
      data-sticky-trigger
      style={{
        position: 'relative',
        paddingTop: 'clamp(48px, 8vh, 84px)',
        paddingBottom: 'clamp(28px, 6vh, 56px)',
      }}
    >
      <div style={{
        position: 'absolute',
        inset: '12% 0 auto 0',
        height: 'clamp(280px, 44vw, 420px)',
        pointerEvents: 'none',
        background: `radial-gradient(circle at 50% 10%, rgba(${BRAND.pinkRgb},0.16), transparent 58%)`,
        filter: 'blur(20px)',
        opacity: 0.9,
      }} />
      <Fireflies />
      <div style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: 920,
        margin: '0 auto',
        textAlign: 'center',
      }}>
        {visual && (
          <div aria-hidden style={{
            margin: '0 auto clamp(18px, 3vh, 28px)',
            width: 'clamp(120px, 14vw, 160px)',
          }}>{visual}</div>
        )}
        {eyebrow && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 14px',
            borderRadius: 999,
            background: 'rgba(255,255,255,0.05)',
            border: `1px solid rgba(${BRAND.pinkRgb},0.20)`,
            color: '#fff4fb',
            fontWeight: 800,
            fontSize: eyebrowLower ? 14.5 : 12,
            letterSpacing: eyebrowLower ? '0.01em' : '0.08em',
            textTransform: eyebrowLower ? 'none' : 'uppercase',
            marginBottom: 18,
          }}>{eyebrow}</div>
        )}
        <h1 style={{
          margin: 0,
          fontFamily: FONT_DISPLAY,
          fontSize: 'clamp(38px, 6vw, 66px)',
          fontWeight: 800,
          lineHeight: 0.98,
          letterSpacing: '-0.03em',
          color: '#fff4fb',
          textWrap: 'balance',
        }}>{title}</h1>
        {sub && (
          <p style={{
            margin: '20px auto 0',
            maxWidth: 720,
            fontSize: 'clamp(17px, 2vw, 21px)',
            color: 'rgba(226,232,240,0.80)',
            fontWeight: 600,
            lineHeight: 1.6,
          }}>{sub}</p>
        )}
      </div>
    </Section>
  );
}
