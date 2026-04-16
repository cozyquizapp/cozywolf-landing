import { useEffect, useState } from 'react';

type Lang = 'de' | 'en';

const TRANSLATIONS = {
  de: {
    slogans: [
      'Das Quiz für den Kiosk um die Ecke',
      'Vier Teams. Ein Grid. Null Gnade.',
      'Live. Laut. Lokal.',
      'Wissen, Glück und ein bisschen Chaos.',
    ],
    byCozywolf: 'by cozywolf',
    chips: ['🏆 Live-Quiz-Show', '📱 Teams spielen am Handy', '🎬 Individuelle Fragen'],
    partnersTitle: '🎤 Für Veranstalter & Partner',
    partnersP1a: ' ist eine moderierte Live-Quiz-Show für Bars, Kioske, Firmenfeiern, Geburtstage, Tagungen — überall dort, wo Menschen zusammenkommen und einen Abend mit Tiefgang und Lachen wollen.',
    partnersP2: 'Ihr braucht nur einen Beamer oder großen Bildschirm. Ich bringe die Technik, die Fragen und die Moderation mit. Die Teams spielen mit ihrem eigenen Handy — keine App nötig, einfach QR-Code scannen und los geht\'s.',
    f1Title: 'Maßgeschneidert',
    f1Body: 'Fragen zum Anlass, zum Betrieb, zum Geburtstagskind — auf Wunsch mit Insidern und Fotos.',
    f2Title: '6 Kategorien',
    f2Body: 'Schätzchen, Mu-Cho, 10-von-10, Bunte Tüte (Top-5, Imposter, Reihenfolge, Karte), Picture-This — nie dieselbe Runde zweimal.',
    f3Title: 'Plug & Play',
    f3Body: 'Ich komme eine Stunde vor Beginn, stelle auf, und in 90 Minuten ist alles gelaufen.',
    f4Title: 'Bis 5 Teams',
    f4Body: 'Von der kleinen Runde bis zur ausgebuchten Bar — 2 bis 5 Teams.',
    nextTitle: '📅 Nächstes Event',
    nextBig: 'Bald verfügbar',
    nextSub: 'Termine für öffentliche Quiz-Abende werden hier und auf Instagram angekündigt.',
    contactTitle: '💌 Quiz buchen oder Hallo sagen',
    contactP: 'Lust auf einen Quiz-Abend bei euch? Schreibt mir — gerne mit Datum, ungefährer Teamzahl und dem Anlass. Ich melde mich schnellstmöglich mit Details & Preisen.',
    emailLabel: 'E-Mail',
    instaLabel: 'Instagram',
    footnote: 'Teams, die auf einer laufenden Veranstaltung spielen, erhalten den Beitritts-Link direkt vom Moderator.',
  },
  en: {
    slogans: [
      'The quiz for the corner store crowd.',
      'Four teams. One grid. No mercy.',
      'Live. Loud. Local.',
      'Knowledge, luck, and a little chaos.',
    ],
    byCozywolf: 'by cozywolf',
    chips: ['🏆 Live quiz show', '📱 Teams play on their phones', '🎬 Custom questions'],
    partnersTitle: '🎤 For hosts & partners',
    partnersP1a: ' is a hosted live quiz show for bars, corner shops, company parties, birthdays, conferences — anywhere people come together for an evening of laughs and a bit of depth.',
    partnersP2: 'All you need is a projector or big screen. I bring the tech, the questions, and the hosting. Teams play on their own phones — no app required, just scan a QR code and off you go.',
    f1Title: 'Tailor-made',
    f1Body: 'Questions about the occasion, the venue, the birthday person — with inside jokes and photos on request.',
    f2Title: '6 categories',
    f2Body: 'Guess-That, Mu-Cho, 10-of-10, Mixed Bag (Top-5, Imposter, Order, Map), Picture-This — never the same round twice.',
    f3Title: 'Plug & play',
    f3Body: 'I arrive an hour before start, set everything up, and 90 minutes later it\'s all done.',
    f4Title: 'Up to 5 teams',
    f4Body: 'From a cozy round to a packed bar — 2 to 5 teams.',
    nextTitle: '📅 Next event',
    nextBig: 'Coming soon',
    nextSub: 'Dates for public quiz nights will be announced here and on Instagram.',
    contactTitle: '💌 Book a quiz or say hello',
    contactP: 'Want a quiz night at your place? Drop me a line — ideally with a date, rough team count, and the occasion. I\'ll get back to you quickly with details & pricing.',
    emailLabel: 'Email',
    instaLabel: 'Instagram',
    footnote: 'Teams playing at a live event receive the join link directly from the host.',
  },
} as const;

function detectInitialLang(): Lang {
  if (typeof window === 'undefined') return 'de';
  const stored = window.localStorage.getItem('cw-lang');
  if (stored === 'de' || stored === 'en') return stored;
  const browser = window.navigator.language?.toLowerCase() ?? '';
  return browser.startsWith('de') ? 'de' : 'en';
}

export default function App() {
  const [lang, setLang] = useState<Lang>('de');
  const [slogan, setSlogan] = useState<string>(TRANSLATIONS.de.slogans[0]);

  useEffect(() => {
    const initial = detectInitialLang();
    setLang(initial);
  }, []);

  useEffect(() => {
    const pool = TRANSLATIONS[lang].slogans;
    setSlogan(pool[Math.floor(Math.random() * pool.length)]);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const t = TRANSLATIONS[lang];

  const switchLang = (next: Lang) => {
    setLang(next);
    try { window.localStorage.setItem('cw-lang', next); } catch {}
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 0%, #1e293b 0%, #0b0d14 55%, #050712 100%)',
      color: '#e2e8f0',
      fontFamily: "'Nunito', system-ui, sans-serif",
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Subtle glow dots */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background:
          'radial-gradient(circle at 20% 30%, rgba(245,158,11,0.12) 0%, transparent 35%),' +
          'radial-gradient(circle at 80% 70%, rgba(59,130,246,0.10) 0%, transparent 35%),' +
          'radial-gradient(circle at 50% 90%, rgba(234,88,12,0.08) 0%, transparent 40%)',
      }} />

      {/* Language switcher — top right */}
      <LangSwitcher lang={lang} onChange={switchLang} />

      <div style={{
        position: 'relative', zIndex: 2,
        maxWidth: 900, margin: '0 auto',
        padding: '56px 24px 80px',
        display: 'flex', flexDirection: 'column', gap: 56,
        animation: 'fadeInUp 0.6s ease both',
      }}>

        {/* Hero */}
        <section style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22,
          textAlign: 'center',
        }}>
          <img
            src="/logo.png"
            alt="CozyWolf"
            style={{ width: 128, height: 128, objectFit: 'contain', filter: 'drop-shadow(0 8px 20px rgba(245,158,11,0.3))' }}
          />

          <div>
            <h1 style={{
              margin: 0,
              fontSize: 'clamp(42px, 7vw, 72px)',
              fontWeight: 900,
              lineHeight: 1.05,
              background: 'linear-gradient(135deg, #F59E0B 0%, #EAB308 50%, #F97316 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
            }}>
              Quarter Quiz
            </h1>
            <div style={{
              fontSize: 'clamp(14px, 1.8vw, 18px)',
              color: '#94a3b8',
              marginTop: 8,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}>
              {t.byCozywolf}
            </div>
          </div>

          <p style={{
            margin: 0,
            fontSize: 'clamp(18px, 2.3vw, 24px)',
            color: '#cbd5e1',
            fontWeight: 600,
            lineHeight: 1.4,
            maxWidth: 620,
          }}>
            {slogan}
          </p>

          <div style={{
            marginTop: 10,
            display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center',
            fontSize: 14, color: '#94a3b8', fontWeight: 700,
          }}>
            {t.chips.map((c) => <Chip key={c}>{c}</Chip>)}
          </div>
        </section>

        {/* What is it / For Partners */}
        <section style={cardStyle}>
          <SectionTitle>{t.partnersTitle}</SectionTitle>
          <p style={paragraph}>
            <strong style={{ color: '#F1F5F9' }}>Quarter Quiz</strong>{t.partnersP1a}
          </p>
          <p style={paragraph}>
            {t.partnersP2}
          </p>

          <div style={featureGrid}>
            <Feature emoji="🎯" title={t.f1Title}>{t.f1Body}</Feature>
            <Feature emoji="🎮" title={t.f2Title}>{t.f2Body}</Feature>
            <Feature emoji="⚡" title={t.f3Title}>{t.f3Body}</Feature>
            <Feature emoji="🏟️" title={t.f4Title}>{t.f4Body}</Feature>
          </div>
        </section>

        {/* Next Event */}
        <section style={{ ...cardStyle, textAlign: 'center' }}>
          <SectionTitle>{t.nextTitle}</SectionTitle>
          <div style={{
            padding: '28px 20px', borderRadius: 18,
            background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(249,115,22,0.08))',
            border: '1.5px dashed rgba(245,158,11,0.4)',
          }}>
            <div style={{
              fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 900,
              color: '#FBBF24', letterSpacing: '0.02em',
            }}>
              {t.nextBig}
            </div>
            <div style={{ marginTop: 10, fontSize: 15, color: '#cbd5e1', fontWeight: 600 }}>
              {t.nextSub}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section style={cardStyle}>
          <SectionTitle>{t.contactTitle}</SectionTitle>
          <p style={paragraph}>
            {t.contactP}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
            <ContactRow
              href="mailto:cozyquiz.app@gmail.com"
              emoji="📧"
              label={t.emailLabel}
              value="cozyquiz.app@gmail.com"
            />
            <ContactRow
              href="https://instagram.com/cozywolf.events"
              emoji="📸"
              label={t.instaLabel}
              value="@cozywolf.events"
            />
          </div>
        </section>

        {/* Footnote */}
        <div style={{
          textAlign: 'center', fontSize: 12, color: '#475569',
          maxWidth: 600, margin: '0 auto', lineHeight: 1.6,
        }}>
          {t.footnote}
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function LangSwitcher({ lang, onChange }: { lang: Lang; onChange: (l: Lang) => void }) {
  return (
    <div style={{
      position: 'absolute', top: 18, right: 18, zIndex: 10,
      display: 'flex', gap: 2,
      padding: 4, borderRadius: 999,
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
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
        padding: '6px 14px',
        borderRadius: 999,
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 13,
        fontWeight: 800,
        letterSpacing: '0.08em',
        background: active ? 'rgba(245,158,11,0.9)' : 'transparent',
        color: active ? '#0b0d14' : '#cbd5e1',
        transition: 'background 0.15s, color 0.15s',
      }}
    >
      {children}
    </button>
  );
}

const cardStyle: React.CSSProperties = {
  padding: 'clamp(22px, 3.5vw, 36px)',
  borderRadius: 22,
  background: 'rgba(255,255,255,0.03)',
  border: '1.5px solid rgba(255,255,255,0.08)',
  boxShadow: '0 20px 40px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.03)',
};

const paragraph: React.CSSProperties = {
  margin: '0 0 12px',
  fontSize: 'clamp(15px, 1.6vw, 17px)',
  color: '#cbd5e1',
  lineHeight: 1.6,
  fontWeight: 500,
};

const featureGrid: React.CSSProperties = {
  marginTop: 20,
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: 14,
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      margin: '0 0 14px',
      fontSize: 'clamp(20px, 2.4vw, 26px)',
      fontWeight: 900,
      color: '#F1F5F9',
      letterSpacing: '-0.01em',
    }}>
      {children}
    </h2>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      padding: '6px 14px', borderRadius: 999,
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
    }}>
      {children}
    </span>
  );
}

function Feature({ emoji, title, children }: { emoji: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{
      padding: 16, borderRadius: 14,
      background: 'rgba(255,255,255,0.025)',
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{ fontSize: 28, lineHeight: 1, marginBottom: 8 }}>{emoji}</div>
      <div style={{ fontSize: 15, fontWeight: 900, color: '#F1F5F9', marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 13.5, color: '#94a3b8', fontWeight: 500, lineHeight: 1.5 }}>
        {children}
      </div>
    </div>
  );
}

function ContactRow({ href, emoji, label, value }: { href: string; emoji: string; label: string; value: string }) {
  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 18px', borderRadius: 14,
        background: 'rgba(245,158,11,0.08)',
        border: '1.5px solid rgba(245,158,11,0.25)',
        textDecoration: 'none', color: '#F1F5F9',
        fontWeight: 700,
        transition: 'background 0.2s, border-color 0.2s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(245,158,11,0.14)';
        (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(245,158,11,0.5)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(245,158,11,0.08)';
        (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(245,158,11,0.25)';
      }}
    >
      <span style={{ fontSize: 24 }}>{emoji}</span>
      <span style={{ fontSize: 12, color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 800 }}>
        {label}
      </span>
      <span style={{ marginLeft: 'auto', fontSize: 16, color: '#FBBF24', fontWeight: 800 }}>
        {value}
      </span>
    </a>
  );
}
