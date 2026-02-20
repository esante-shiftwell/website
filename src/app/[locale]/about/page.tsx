import { notFound } from 'next/navigation';
import { isLocale, LOCALES, type Locale } from '@/i18n';
import LocaleNav from '@/components/LocaleNav';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

const content = {
  fr: {
    title: 'À propos de Shiftwell',
    subtitle:
      'Shiftwell est un outil de pré-analyse orienté recherche pour explorer l’adaptation travail/sommeil chez les professionnels à horaires atypiques.',
    blocks: [
      {
        title: 'Positionnement',
        text: 'Shiftwell n’est pas un outil de diagnostic. Il sert à structurer une collecte de données agenda travail/sommeil et à produire des scores indicatifs dans un contexte de recherche.',
      },
      {
        title: 'Pourquoi ce format',
        text: 'Le score est calculé localement pour réduire la friction et limiter la dépendance à un backend. La contribution à l’étude est proposée ensuite, avec consentement explicite.',
      },
      {
        title: 'Direction produit',
        text: 'MVP d’abord (scoring proxy + pages explicatives), puis alignement strict avec le protocole scientifique et enrichissement des analyses.',
      },
      {
        title: 'Stack',
        text: 'Next.js (export statique), Cloudflare Pages, GitHub Actions + Wrangler. L’objectif est un déploiement simple, sans serveur applicatif pour la V1.',
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
        title: 'Stack',
        text: 'Next.js (static export), Cloudflare Pages, GitHub Actions + Wrangler. The goal is simple deployment with no application server for V1.',
      },
    ],
  },
  de: {
    title: 'Über Shiftwell',
    subtitle:
      'Shiftwell ist ein forschungsorientiertes Voranalyse-Tool zur Untersuchung der Arbeits-/Schlafanpassung bei atypischen Arbeitszeiten.',
    blocks: [
      {
        title: 'Positionierung',
        text: 'Shiftwell ist kein Diagnosetool. Es strukturiert die Erhebung von Arbeits-/Schlafplänen und erzeugt indikative Scores im Forschungskontext.',
      },
      {
        title: 'Warum dieses Format',
        text: 'Scores werden lokal berechnet, um Reibung zu reduzieren und keinen Backend-Zwang zu haben. Der Studienbeitrag folgt optional mit ausdrücklicher Einwilligung.',
      },
      {
        title: 'Produktrichtung',
        text: 'Zuerst MVP (Proxy-Scoring + Erklärseiten), danach strengere Protokollausrichtung und erweiterte Analysen.',
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
      <LocaleNav locale={locale} subtitle="About · Product vision · Stack" />

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