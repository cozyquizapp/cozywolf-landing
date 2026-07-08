// Über / Wer moderiert: Johannes als Person, pädagogischer Blick, Foto.
// Erste Fassung (Stufe 1/4). Ich-Form.
import { BRAND } from '../brand';
import { useLang } from '../lang';
import { t } from '../i18n';
import { Layout, Section, Btn, PageHero } from '../Layout';
import { PriceNote } from '../components/PriceNote';

const C = {
  de: {
    eyebrow: 'Über mich',
    title: 'Moin, ich bin Johannes.',
    sub: 'Moderator, Pädagoge und der Kopf hinter CozyWolf.',
    p1: 'Angefangen hat alles mit selbstgebauten Quizzen für Familie und Freunde, erst mit Präsentationstools wie Prezi und Canva. Irgendwann reichten mir die fertigen Tools nicht mehr, und ich habe meine eigene App entwickelt. Daraus ist CozyWolf geworden: die App, die Marke und der Abend, den ich selbst moderiere.',
    p2: 'Ein CozyWolf-Abend ist für alle, die Spaß an Quizzen haben. Unterhaltsame, interessante Fragen quer durch viele Kategorien sorgen dafür, dass für jeden was dabei ist, und jeder mal glänzen kann.',
    p3: 'Ich bringe alles selbst mit und baue es auf. Du sollst dich um nichts kümmern müssen, außer darum, dabei zu sein.',
    cta: 'Quiz anfragen',
  },
  en: {
    eyebrow: 'About me',
    title: "Hi, I'm Johannes.",
    sub: 'Host, educator and the person behind CozyWolf.',
    p1: 'It all started with home-made quizzes for family and friends, first with presentation tools like Prezi and Canva. At some point the ready-made tools were not enough, so I built my own app. That became CozyWolf: the app, the brand and the evening I host myself.',
    p2: 'A CozyWolf evening is for anyone who enjoys a quiz. Entertaining, interesting questions across many categories mean there is something for everyone, and everyone gets a moment to shine.',
    p3: 'I bring everything myself and set it up. You should not have to worry about anything except being there.',
    cta: 'Request a quiz',
  },
};

export default function UeberPage() {
  const lang = useLang();
  const c = C[lang];
  const d = t(lang);
  return (
    <Layout>
      <PageHero eyebrow={c.eyebrow} title={c.title} sub={c.sub} />
      <Section style={{ paddingTop: 0 }}>
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
          <img src="/assets/johannes.jpg" alt="Johannes, Quizmaster von CozyWolf" style={{
            width: 180, height: 180, borderRadius: '50%', objectFit: 'cover', objectPosition: 'center 22%',
            border: `4px solid rgba(${BRAND.pinkRgb},0.5)`,
            boxShadow: `0 12px 36px rgba(${BRAND.pinkRgb},0.25)`,
          }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[c.p1, c.p2, c.p3].map((p, i) => (
              <p key={i} style={{ margin: 0, fontSize: 17, color: BRAND.inkSoft, fontWeight: 500, lineHeight: 1.7, textAlign: 'center' }}>{p}</p>
            ))}
          </div>
          <PriceNote />
          <Btn href="/kontakt">{d.ctaBook}</Btn>
        </div>
      </Section>
    </Layout>
  );
}
