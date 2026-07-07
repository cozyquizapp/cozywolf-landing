// Über / Wer moderiert: Johannes als Person, pädagogischer Blick, Foto.
// Erste Fassung (Stufe 1/4). Ich-Form.
import { BRAND, anfrageMailto } from '../brand';
import { useLang } from '../lang';
import { t } from '../i18n';
import { Layout, Section, Btn, PageHero } from '../Layout';
import { PriceNote } from '../components/PriceNote';

const C = {
  de: {
    eyebrow: 'Über mich',
    title: 'Ich bin Johannes.',
    sub: 'Pädagoge, Moderator und der Kopf hinter CozyWolf.',
    p1: 'Ich habe Kindheitspädagogik studiert (B.A.) und moderiere seit einigen Jahren Quiz-Abende. Was als Idee in kleiner Runde anfing, ist zu CozyWolf geworden: ein Abend, den ich selbst entwickelt habe und selbst vorne halte.',
    p2: 'Aus der Pädagogik nehme ich einen guten Blick für Gruppen mit. Ich merke, wann eine Runde kippt, wer noch nicht drin ist und wann es Zeit für einen Lacher ist. Das Ziel ist nie, dass ein Team vorgeführt wird, sondern dass alle einen guten Abend haben.',
    p3: 'Deshalb bringe ich auch alles selbst mit und baue es auf. Du sollst dich um nichts kümmern müssen, außer darum, dabei zu sein.',
    cta: 'Abend anfragen',
  },
  en: {
    eyebrow: 'About me',
    title: 'I am Johannes.',
    sub: 'Educator, host and the person behind CozyWolf.',
    p1: 'I hold a B.A. in early childhood education and have been hosting quiz nights for a few years. What started as an idea in a small circle became CozyWolf: an evening I designed myself and host myself.',
    p2: 'From my background in education I bring a good eye for groups. I notice when a round is tipping, who is not yet involved and when it is time for a laugh. The goal is never to put a team on the spot, but for everyone to have a good evening.',
    p3: 'That is also why I bring everything myself and set it up. You should not have to worry about anything except being there.',
    cta: 'Request an evening',
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
          <img src="/assets/johannes.jpg" alt="Johannes" style={{
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
          <Btn href={anfrageMailto(lang)}>{d.ctaBook}</Btn>
        </div>
      </Section>
    </Layout>
  );
}
