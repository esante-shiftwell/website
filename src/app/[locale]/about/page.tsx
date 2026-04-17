import { notFound } from 'next/navigation';
import { isLocale, LOCALES, type Locale } from '@/i18n';
import LocaleNav from '@/components/LocaleNav';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

const content = {
  fr: {
    title: 'A propos de Shiftwell',
    subtitle:
      'Shiftwell est un outil de pre-analyse oriente recherche pour explorer l adaptation travail/sommeil chez les professionnels a horaires atypiques.',
    blocks: [
      {
        title: 'Positionnement',
        text: 'Shiftwell n est pas un outil de diagnostic. Il sert a structurer une collecte de donnees agenda travail/sommeil et a produire des scores indicatifs dans un contexte de recherche.',
      },
      {
        title: 'Pourquoi ce format',
        text: 'Le score est calcule localement pour reduire la friction et limiter la dependance a un backend. La contribution a l etude est proposee ensuite, avec consentement explicite.',
      },
      {
        title: 'Direction produit',
        text: 'MVP d abord (scoring proxy + pages explicatives), puis alignement strict avec le protocole scientifique et enrichissement des analyses.',
      },
      {
        title: 'Provenance des references',
        text: 'Shiftwell s appuie sur des references scientifiques tierces et sur des copies locales de travail pour la revue interne. Cela n implique ni paternite ni propriete sur ces contenus externes.',
      },
      {
        title: 'Stack',
        text: 'Next.js (export statique), Cloudflare Pages, GitHub Actions + Wrangler. L objectif est un deploiement simple, sans serveur applicatif pour la V1.',
      },
    ],
  },
  en: {
    title: 'About Shiftwell',
    subtitle:
      'Shiftwell is a research-oriented pre-analysis tool to explore work/sleep adaptation in professionals with atypical schedules.',
    blocks: [
      {
        title: 'Positioning',
        text: 'Shiftwell is not a diagnostic tool. It structures work/sleep schedule data collection and produces indicative scores in a research context.',
      },
      {
        title: 'Why this format',
        text: 'Scores are computed locally to reduce friction and avoid backend dependency. Study contribution comes afterwards with explicit consent.',
      },
      {
        title: 'Product direction',
        text: 'MVP first (proxy scoring + explanatory pages), then stricter alignment with the scientific protocol and richer analyses.',
      },
      {
        title: 'Reference provenance',
        text: 'Shiftwell relies on third-party scientific references and local working copies for internal review. This does not imply authorship or ownership of those external materials.',
      },
      {
        title: 'Stack',
        text: 'Next.js (static export), Cloudflare Pages, GitHub Actions + Wrangler. The goal is simple deployment with no application server for V1.',
      },
    ],
  },
  de: {
    title: 'Uber Shiftwell',
    subtitle:
      'Shiftwell ist ein forschungsorientiertes Voranalyse-Tool zur Untersuchung der Arbeits-/Schlafanpassung bei atypischen Arbeitszeiten.',
    blocks: [
      {
        title: 'Positionierung',
        text: 'Shiftwell ist kein Diagnosetool. Es strukturiert die Erhebung von Arbeits-/Schlafplanen und erzeugt indikative Scores im Forschungskontext.',
      },
      {
        title: 'Warum dieses Format',
        text: 'Scores werden lokal berechnet, um Reibung zu reduzieren und keinen Backend-Zwang zu haben. Der Studienbeitrag folgt optional mit ausdrucklicher Einwilligung.',
      },
      {
        title: 'Produktrichtung',
        text: 'Zuerst MVP (Proxy-Scoring + Erklarseiten), danach strengere Protokollausrichtung und erweiterte Analysen.',
      },
      {
        title: 'Referenz-Provenienz',
        text: 'Shiftwell stutzt sich auf wissenschaftliche Drittquellen und lokale Arbeitskopien fur die interne Auswertung. Daraus folgt weder Autorschaft noch Eigentum an diesen externen Materialien.',
      },
      {
        title: 'Stack',
        text: 'Next.js (Static Export), Cloudflare Pages, GitHub Actions + Wrangler. Ziel: einfache Bereitstellung ohne Application Server in V1.',
      },
    ],
  },
} as const;

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const c = content[locale];

  return (
    <main>
      <LocaleNav locale={locale} />

      <section className="card" style={{ padding: 20, marginBottom: 16 }}>
        <span className="badge primary">About</span>
        <h1 className="section-title" style={{ marginTop: 12 }}>
          {c.title}
        </h1>
        <p className="section-subtitle">{c.subtitle}</p>
      </section>

      <div className="grid grid-2">
        {c.blocks.map((b) => (
          <section key={b.title} className="card" style={{ padding: 16 }}>
            <h2 className="section-title" style={{ fontSize: 18, marginBottom: 8 }}>
              {b.title}
            </h2>
            <p className="small muted" style={{ margin: 0 }}>
              {b.text}
            </p>
          </section>
        ))}
      </div>
    </main>
  );
}
