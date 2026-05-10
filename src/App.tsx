import { useEffect, useState } from 'react';

type Lang = 'de' | 'en';

// Brand-Tokens — synchron zu CozyQuiz-App (#EC4899 Pink, #A21247 Magenta).
const BRAND = {
  pink:     '#EC4899',
  pinkRgb:  '236,72,153',
  pinkSoft: '#FBCFE8',
  magenta:  '#A21247',
  navy:     '#1E2A5A',
  bg:       '#0A0814',
};

const TRANSLATIONS = {
  de: {
    byCozywolf: 'by cozywolf',
    heroSub: 'Bis zu 8 Teams · 5 spannende Kategorien · ein Punktesystem wie du es noch nie gesehen hast.',
    heroCtaWrite: '✉️ Schreib mir',
    heroCtaInsta: '📸 Auf Insta folgen',

    whatTitle: 'Was ist CozyQuiz?',
    f1Title: 'Bis zu 8 Teams',
    f1Body:  'Jedes Team spielt am eigenen Smartphone. Scannen, joinen, los.',
    f2Title: '5 Kategorien',
    f2Body:  'Mu-Cho · Schätzchen · Schau-mal · 10-von-10 · Bunte Tüte. Keine Runde fühlt sich gleich an.',
    f3Title: 'Punkte wie noch nie',
    f3Body:  'Felder erobern, Gebiete bauen, Joker setzen, klauen. Wissen + Strategie + ein bisschen Glück.',

    forWhom: 'Für alle, die Lust auf spannende Quiz-Runden und interessante Fakten haben.',

    bookTitle: 'Lust auf einen Abend?',
    bookBody:  'Aktuell baue ich CozyQuiz noch auf — wenn du Interesse hast, schreib mir kurz, dann reden wir.',
    emailLabel: 'E-Mail',
    instaLabel: 'Instagram',

    footerMade: 'Made by cozywolf · 2026',
    footerImprint: 'Impressum',
    footerPrivacy: 'Datenschutz',
  },
  en: {
    byCozywolf: 'by cozywolf',
    heroSub: 'Up to 8 teams · 5 exciting categories · a scoring system like you’ve never seen before.',
    heroCtaWrite: '✉️ Write me',
    heroCtaInsta: '📸 Follow on Insta',

    whatTitle: 'What is CozyQuiz?',
    f1Title: 'Up to 8 teams',
    f1Body:  'Every team plays on their own smartphone. Scan, join, go.',
    f2Title: '5 categories',
    f2Body:  'Mu-Cho · Guess-That · Picture-This · 10-of-10 · Mixed Bag. No round feels the same.',
    f3Title: 'Scoring like never',
    f3Body:  'Conquer cells, build territory, play jokers, steal. Knowledge + strategy + a bit of luck.',

    forWhom: 'For everyone who likes great quiz rounds and interesting facts.',

    bookTitle: 'Want a quiz night?',
    bookBody:  'I’m still building CozyQuiz up — if you’re interested, drop me a line and we’ll talk.',
    emailLabel: 'Email',
    instaLabel: 'Instagram',

    footerMade: 'Made by cozywolf · 2026',
    footerImprint: 'Imprint',
    footerPrivacy: 'Privacy',
  },
} as const;

function detectInitialLang(): Lang {
  if (typeof window === 'undefined') return 'de';
  const stored = window.localStorage.getItem('cw-lang');
  if (stored === 'de' || stored === 'en') return stored;
  const browser = window.navigator.language?.toLowerCase() ?? '';
  return browser.startsWith('de') ? 'de' : 'en';
}

const EMAIL = 'hallo@cozywolf.de';
const INSTA_URL = 'https://instagram.com/cozywolf.events';
const INSTA_HANDLE = '@cozywolf.events';

export default function App() {
  const [lang, setLang] = useState<Lang>('de');

  useEffect(() => { setLang(detectInitialLang()); }, []);
  useEffect(() => {
    if (typeof document !== 'undefined') document.documentElement.lang = lang;
  }, [lang]);

  const t = TRANSLATIONS[lang];

  const switchLang = (next: Lang) => {
    setLang(next);
    try { window.localStorage.setItem('cw-lang', next); } catch {}
  };

  return (
    <div style={{
      minHeight: '100vh',
      background:
        `radial-gradient(ellipse at 50% -10%, rgba(${BRAND.pinkRgb},0.18), transparent 55%),` +
        'radial-gradient(ellipse at 85% 110%, rgba(99,102,241,0.10), transparent 55%),' +
        `radial-gradient(ellipse at 15% 80%, rgba(${BRAND.pinkRgb},0.08), transparent 50%),` +
        BRAND.bg,
      color: '#e2e8f0',
      fontFamily: "'Nunito', system-ui, sans-serif",
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Cross-Hatch-Brand-Pattern Overlay (subtle) */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.4,
        backgroundImage:
          `repeating-linear-gradient(45deg, rgba(${BRAND.pinkRgb},0.04) 0 2px, transparent 2px 22px),` +
          `repeating-linear-gradient(-45deg, rgba(${BRAND.pinkRgb},0.03) 0 2px, transparent 2px 22px)`,
      }} />

      <LangSwitcher lang={lang} onChange={switchLang} />

      <div style={{
        position: 'relative', zIndex: 2,
        maxWidth: 980, margin: '0 auto',
        padding: 'clamp(40px, 6vh, 72px) 24px clamp(40px, 6vh, 80px)',
        display: 'flex', flexDirection: 'column', gap: 'clamp(36px, 6vh, 64px)',
        animation: 'fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) both',
      }}>

        {/* ─── HERO ─── */}
        <section style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22,
          textAlign: 'center',
        }}>
          <img
            src="/logo.png"
            alt="CozyWolf"
            style={{
              width: 132, height: 132, objectFit: 'contain',
              filter: `drop-shadow(0 8px 24px rgba(${BRAND.pinkRgb},0.45)) drop-shadow(0 0 40px rgba(${BRAND.pinkRgb},0.25))`,
            }}
          />

          <div>
            <h1 style={{
              margin: 0,
              fontSize: 'clamp(48px, 9vw, 96px)',
              fontWeight: 900,
              lineHeight: 1,
              color: BRAND.pink,
              letterSpacing: '-0.02em',
              textShadow: `0 4px 24px rgba(0,0,0,0.6), 0 0 48px rgba(${BRAND.pinkRgb},0.4)`,
            }}>
              CozyQuiz
            </h1>
            <div style={{
              fontSize: 'clamp(13px, 1.4vw, 16px)',
              color: BRAND.pinkSoft,
              marginTop: 8,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              fontWeight: 800,
              opacity: 0.85,
            }}>
              {t.byCozywolf}
            </div>
          </div>

          <p style={{
            margin: 0,
            fontSize: 'clamp(16px, 2vw, 22px)',
            color: '#cbd5e1',
            fontWeight: 600,
            lineHeight: 1.5,
            maxWidth: 720,
          }}>
            {t.heroSub}
          </p>

          <div style={{
            marginTop: 4,
            display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center',
          }}>
            <CtaPrimary href={`mailto:${EMAIL}`}>{t.heroCtaWrite}</CtaPrimary>
            <CtaSecondary href={INSTA_URL}>{t.heroCtaInsta}</CtaSecondary>
          </div>
        </section>

        {/* ─── WAS IST COZYQUIZ — 3 Cards ─── */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 14,
        }}>
          <Feature emoji="📱" title={t.f1Title}>{t.f1Body}</Feature>
          <Feature emoji="🎯" title={t.f2Title}>{t.f2Body}</Feature>
          <Feature emoji="👑" title={t.f3Title}>{t.f3Body}</Feature>
        </section>

        {/* ─── FÜR WEN — Quote-Block ─── */}
        <section style={{
          textAlign: 'center',
          padding: 'clamp(24px, 4vh, 40px) clamp(20px, 3vw, 36px)',
          borderRadius: 22,
          background:
            `radial-gradient(ellipse at 50% 50%, rgba(${BRAND.pinkRgb},0.10) 0%, transparent 70%),` +
            'rgba(255,255,255,0.025)',
          border: `1.5px solid rgba(${BRAND.pinkRgb},0.30)`,
          boxShadow: `0 0 32px rgba(${BRAND.pinkRgb},0.15), 0 12px 32px rgba(0,0,0,0.35)`,
        }}>
          <div style={{
            fontSize: 'clamp(18px, 2.4vw, 28px)',
            fontWeight: 800,
            color: '#F1F5F9',
            lineHeight: 1.4,
            maxWidth: 720, margin: '0 auto',
          }}>
            <span style={{ color: BRAND.pink, fontSize: '1.1em', verticalAlign: 'top', marginRight: 4 }}>„</span>
            {t.forWhom}
            <span style={{ color: BRAND.pink, fontSize: '1.1em', verticalAlign: 'top', marginLeft: 4 }}>"</span>
          </div>
        </section>

        {/* ─── BOOKING ─── */}
        <section style={cardStyle}>
          <SectionTitle>{t.bookTitle}</SectionTitle>
          <p style={{
            margin: '0 0 18px',
            fontSize: 'clamp(15px, 1.7vw, 18px)',
            color: '#cbd5e1', lineHeight: 1.6, fontWeight: 500,
          }}>
            {t.bookBody}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <ContactRow href={`mailto:${EMAIL}`} emoji="✉️" label={t.emailLabel} value={EMAIL} />
            <ContactRow href={INSTA_URL} emoji="📸" label={t.instaLabel} value={INSTA_HANDLE} />
          </div>
        </section>

        {/* ─── FOOTER ─── */}
        <footer style={{
          marginTop: 8, paddingTop: 24,
          borderTop: '1px solid rgba(255,255,255,0.06)',
          textAlign: 'center', fontSize: 12, color: '#64748b',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <div>{t.footerMade}</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
            <a href="https://play.cozyquiz.app" target="_blank" rel="noopener noreferrer"
               style={footerLink}>play.cozyquiz.app</a>
            <span style={{ opacity: 0.4 }}>·</span>
            <a href={INSTA_URL} target="_blank" rel="noopener noreferrer" style={footerLink}>{INSTA_HANDLE}</a>
            <span style={{ opacity: 0.4 }}>·</span>
            <a href="/impressum" style={footerLink}>{t.footerImprint}</a>
            <span style={{ opacity: 0.4 }}>·</span>
            <a href="/datenschutz" style={footerLink}>{t.footerPrivacy}</a>
          </div>
        </footer>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cwPinkPulse {
          0%, 100% { box-shadow: 0 6px 18px rgba(${BRAND.pinkRgb},0.45), inset 0 1px 0 rgba(255,255,255,0.22); }
          50%      { box-shadow: 0 6px 24px rgba(${BRAND.pinkRgb},0.65), inset 0 1px 0 rgba(255,255,255,0.22); }
        }
      `}</style>
    </div>
  );
}

// ─── Sub-Components ─────────────────────────────────────────────────────

function LangSwitcher({ lang, onChange }: { lang: Lang; onChange: (l: Lang) => void }) {
  return (
    <div style={{
      position: 'absolute', top: 18, right: 18, zIndex: 10,
      display: 'flex', gap: 2,
      padding: 4, borderRadius: 999,
      background: 'rgba(255,255,255,0.04)',
      border: `1px solid rgba(${BRAND.pinkRgb},0.20)`,
      backdropFilter: 'blur(8px)',
    }}>
      <LangBtn active={lang === 'de'} onClick={() => onChange('de')}>DE</LangBtn>
      <LangBtn active={lang === 'en'} onClick={() => onChange('en')}>EN</LangBtn>
    </div>
  );
}

function LangBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 14px', borderRadius: 999,
        border: 'none', cursor: 'pointer',
        fontFamily: 'inherit', fontSize: 13, fontWeight: 800,
        letterSpacing: '0.08em',
        background: active ? BRAND.pink : 'transparent',
        color: active ? BRAND.bg : '#cbd5e1',
        transition: 'background 0.15s, color 0.15s',
      }}
    >{children}</button>
  );
}

function CtaPrimary({ href, children }: { href: string; children: React.ReactNode }) {
  const isExternal = href.startsWith('http');
  return (
    <a
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '12px 24px', borderRadius: 999,
        background: `linear-gradient(135deg, ${BRAND.pink}, ${BRAND.magenta})`,
        color: '#fff', textDecoration: 'none',
        fontWeight: 900, fontSize: 15,
        border: '1.5px solid rgba(255,255,255,0.18)',
        letterSpacing: '0.02em',
        animation: 'cwPinkPulse 3s ease-in-out infinite',
      }}
    >{children}</a>
  );
}

function CtaSecondary({ href, children }: { href: string; children: React.ReactNode }) {
  const isExternal = href.startsWith('http');
  return (
    <a
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '12px 22px', borderRadius: 999,
        background: `rgba(${BRAND.pinkRgb},0.10)`,
        color: BRAND.pinkSoft, textDecoration: 'none',
        fontWeight: 900, fontSize: 15,
        border: `1.5px solid rgba(${BRAND.pinkRgb},0.40)`,
        letterSpacing: '0.02em',
      }}
    >{children}</a>
  );
}

const cardStyle: React.CSSProperties = {
  padding: 'clamp(22px, 3.5vw, 36px)',
  borderRadius: 22,
  background: 'rgba(255,255,255,0.03)',
  border: `1.5px solid rgba(${BRAND.pinkRgb},0.20)`,
  boxShadow: `0 16px 40px rgba(0,0,0,0.35), 0 0 32px rgba(${BRAND.pinkRgb},0.10), inset 0 1px 0 rgba(255,255,255,0.04)`,
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      margin: '0 0 14px',
      fontSize: 'clamp(22px, 2.6vw, 30px)',
      fontWeight: 900,
      color: '#F1F5F9',
      letterSpacing: '-0.01em',
    }}>{children}</h2>
  );
}

function Feature({ emoji, title, children }: { emoji: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{
      padding: 'clamp(18px, 2vw, 24px)',
      borderRadius: 16,
      background: 'rgba(255,255,255,0.03)',
      border: `1px solid rgba(${BRAND.pinkRgb},0.18)`,
      transition: 'border-color 0.2s, transform 0.2s',
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = `rgba(${BRAND.pinkRgb},0.45)`;
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = `rgba(${BRAND.pinkRgb},0.18)`;
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      }}
    >
      <div style={{ fontSize: 32, lineHeight: 1, marginBottom: 10 }}>{emoji}</div>
      <div style={{
        fontSize: 17, fontWeight: 900, color: BRAND.pink,
        marginBottom: 6, letterSpacing: '-0.01em',
      }}>{title}</div>
      <div style={{ fontSize: 14, color: '#cbd5e1', fontWeight: 500, lineHeight: 1.5 }}>
        {children}
      </div>
    </div>
  );
}

function ContactRow({ href, emoji, label, value }: { href: string; emoji: string; label: string; value: string }) {
  const isExternal = href.startsWith('http');
  return (
    <a
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 18px', borderRadius: 14,
        background: `rgba(${BRAND.pinkRgb},0.08)`,
        border: `1.5px solid rgba(${BRAND.pinkRgb},0.28)`,
        textDecoration: 'none', color: '#F1F5F9',
        fontWeight: 700,
        transition: 'background 0.2s, border-color 0.2s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.background = `rgba(${BRAND.pinkRgb},0.16)`;
        (e.currentTarget as HTMLAnchorElement).style.borderColor = `rgba(${BRAND.pinkRgb},0.55)`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.background = `rgba(${BRAND.pinkRgb},0.08)`;
        (e.currentTarget as HTMLAnchorElement).style.borderColor = `rgba(${BRAND.pinkRgb},0.28)`;
      }}
    >
      <span style={{ fontSize: 22 }}>{emoji}</span>
      <span style={{
        fontSize: 11, color: '#94a3b8',
        letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 800,
      }}>{label}</span>
      <span style={{
        marginLeft: 'auto', fontSize: 15, color: BRAND.pink, fontWeight: 800,
        wordBreak: 'break-all',
      }}>{value}</span>
    </a>
  );
}

const footerLink: React.CSSProperties = {
  color: '#94a3b8', textDecoration: 'none',
  transition: 'color 0.15s',
};
