import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDictionary, isLocale, LOCALES, type Locale } from '@/i18n';
import LocaleNav from '@/components/LocaleNav';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

const localePageContent = {
  fr: {
    homeTitle: 'Accueil Shiftwell',
    homeSubtitle:
      'Outil d’analyse travail / sommeil pour horaires atypiques, conçu pour un usage de recherche en chronobiologie.',
    ctaAnalyze: 'Lancer l’analyse',
    blocks: [
      {
        title: 'Analyse hebdomadaire',
        text: 'Saisis une semaine de travail et de sommeil, puis calcule tes scores localement.',
        href: '/analyze/',
        badge: 'Analyse',
      },
      {
        title: 'Méthodologie',
        text: 'Comprendre les scores, la logique de calcul et la base scientifique (papier, versioning, limites).',
        href: '/method/',
        badge: 'Method',
      },
      {
        title: 'Étude',
        text: 'Cadre de participation, données collectées, opt-in de contribution et population cible.',
        href: '/study/',
        badge: 'Study',
      },
      {
        title: 'Notice d’information',
        text: 'Notice versionnée et informations de consentement pour la contribution à l’étude.',
        href: '/consent/',
        badge: 'Consent',
      },
      {
        title: 'À propos',
        text: 'Contexte Shiftwell, vision produit et positionnement recherche.',
        href: '/about/',
        badge: 'About',
      },
    ],
  },
  en: {
    homeTitle: 'Shiftwell home',
    homeSubtitle:
      'Work/sleep analysis tool for atypical schedules, designed for chronobiology research use.',
    ctaAnalyze: 'Start analysis',
    blocks: [
      {
        title: 'Weekly analysis',
        text: 'Enter one week of work and sleep schedule and compute scores locally.',
        href: '/analyze/',
        badge: 'Analyze',
      },
      {
        title: 'Methodology',
        text: 'Understand scores, calculation logic and scientific basis (paper, versioning, limitations).',
        href: '/method/',
        badge: 'Method',
      },
      {
        title: 'Study',
        text: 'Participation details, collected data, opt-in contribution and target population.',
        href: '/study/',
        badge: 'Study',
      },
      {
        title: 'Information notice',
        text: 'Versioned information notice and consent details for study contribution.',
        href: '/consent/',
        badge: 'Consent',
      },
      {
        title: 'About',
        text: 'Shiftwell background, product vision and research positioning.',
        href: '/about/',
        badge: 'About',
      },
    ],
  },
  de: {
    homeTitle: 'Shiftwell Startseite',
    homeSubtitle:
      'Tool zur Analyse von Arbeit/Schlaf bei atypischen Arbeitszeiten für chronobiologische Forschung.',
    ctaAnalyze: 'Analyse starten',
    blocks: [
      {
        title: 'Wochenanalyse',
        text: 'Eine Woche Arbeits- und Schlafzeiten eingeben und Scores lokal berechnen.',
        href: '/analyze/',
        badge: 'Analyse',
      },
      {
        title: 'Methodik',
        text: 'Scores, Berechnungslogik und wissenschaftliche Basis verstehen (Paper, Versionen, Grenzen).',
        href: '/method/',
        badge: 'Method',
      },
      {
        title: 'Studie',
        text: 'Teilnahme, erhobene Daten, Opt-in Beitrag und Zielgruppe.',
        href: '/study/',
        badge: 'Study',
      },
      {
        title: 'Einwilligungsinfo',
        text: 'Versionierte Teilnehmerinformation und Consent-Details.',
        href: '/consent/',
        badge: 'Consent',
      },
      {
        title: 'Über',
        text: 'Shiftwell Kontext, Produktvision und Forschungsrahmen.',
        href: '/about/',
        badge: 'About',
      },
    ],
  },
} as const;

export default async function LocaleHomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const d = getDictionary(locale);
  const c = localePageContent[locale];

  return (
    <main>
      <LocaleNav locale={locale} subtitle={d.tagline} />

      <section className="card" style={{ padding: 20, marginBottom: 16 }}>
        <span className="badge primary">Shiftwell</span>
        <h1 className="section-title" style={{ marginTop: 12 }}>
          {c.homeTitle}
        </h1>
        <p className="section-subtitle">{c.homeSubtitle}</p>

        <div className="row" style={{ marginTop: 14 }}>
          <Link className="btn primary" href={`/${locale}/analyze/`}>
            {c.ctaAnalyze}
          </Link>
          <Link className="btn" href={`/${locale}/method/`}>
            Method
          </Link>
          <Link className="btn" href={`/${locale}/study/`}>
            Study
          </Link>
        </div>
      </section>

      <div className="grid grid-2">
        {c.blocks.map((b) => (
          <section key={b.href} className="card" style={{ padding: 16 }}>
            <div className="badge secondary">{b.badge}</div>
            <h3 style={{ margin: '10px 0 6px' }}>{b.title}</h3>
            <p className="small muted" style={{ margin: 0 }}>
              {b.text}
            </p>
            <div className="row" style={{ marginTop: 12 }}>
              <Link className="btn" href={`/${locale}${b.href}`}>
                Open
              </Link>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}