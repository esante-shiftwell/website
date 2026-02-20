import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDictionary, isLocale, LOCALES, type Locale } from '@/i18n';
import LocaleNav from '@/components/LocaleNav';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

type ResourceCard = {
  badgeKey: 'analyze' | 'method' | 'study' | 'consent' | 'about';
  title: string;
  text: string;
  href: string;
  tone: 'primary' | 'secondary' | 'warn';
};

const resourceCardsByLocale: Record<Locale, ResourceCard[]> = {
  fr: [
    {
      badgeKey: 'analyze',
      title: 'Analyse hebdomadaire',
      text: 'Saisie sur 7 jours avec agenda travail/sommeil et score local en sortie.',
      href: '/analyze/',
      tone: 'primary',
    },
    {
      badgeKey: 'method',
      title: 'Méthodologie',
      text: 'Logique de calcul, hypothèses, version du scoring et limites de la version proxy.',
      href: '/method/',
      tone: 'secondary',
    },
    {
      badgeKey: 'study',
      title: 'Étude',
      text: 'Cadre scientifique, population cible, finalité de recherche et données utiles.',
      href: '/study/',
      tone: 'warn',
    },
    {
      badgeKey: 'consent',
      title: "Notice d'information",
      text: 'Consentement explicite, transparence sur la collecte et versionnement de la notice.',
      href: '/consent/',
      tone: 'secondary',
    },
    {
      badgeKey: 'about',
      title: 'À propos',
      text: 'Contexte du projet Shiftwell, chronobiologie et vision produit / recherche.',
      href: '/about/',
      tone: 'secondary',
    },
  ],
  en: [
    {
      badgeKey: 'analyze',
      title: 'Weekly analysis',
      text: '7-day work/sleep schedule entry with local score computation.',
      href: '/analyze/',
      tone: 'primary',
    },
    {
      badgeKey: 'method',
      title: 'Methodology',
      text: 'Scoring logic, assumptions, scoring version and proxy limitations.',
      href: '/method/',
      tone: 'secondary',
    },
    {
      badgeKey: 'study',
      title: 'Study',
      text: 'Scientific context, target population, research purpose and relevant data scope.',
      href: '/study/',
      tone: 'warn',
    },
    {
      badgeKey: 'consent',
      title: 'Information notice',
      text: 'Explicit consent, collection transparency and notice versioning.',
      href: '/consent/',
      tone: 'secondary',
    },
    {
      badgeKey: 'about',
      title: 'About',
      text: 'Shiftwell project background, chronobiology context and product/research vision.',
      href: '/about/',
      tone: 'secondary',
    },
  ],
  de: [
    {
      badgeKey: 'analyze',
      title: 'Wochenanalyse',
      text: '7-Tage-Eingabe für Arbeit/Schlaf mit lokaler Score-Berechnung.',
      href: '/analyze/',
      tone: 'primary',
    },
    {
      badgeKey: 'method',
      title: 'Methodik',
      text: 'Scoring-Logik, Annahmen, Versionierung und Grenzen der Proxy-Version.',
      href: '/method/',
      tone: 'secondary',
    },
    {
      badgeKey: 'study',
      title: 'Studie',
      text: 'Wissenschaftlicher Rahmen, Zielgruppe, Forschungszweck und Datenscope.',
      href: '/study/',
      tone: 'warn',
    },
    {
      badgeKey: 'consent',
      title: 'Teilnehmerinformation',
      text: 'Ausdrückliche Einwilligung, Transparenz zur Erhebung und Versionierung.',
      href: '/consent/',
      tone: 'secondary',
    },
    {
      badgeKey: 'about',
      title: 'Über Shiftwell',
      text: 'Projektkontext, Chronobiologie und Produkt-/Forschungsvision.',
      href: '/about/',
      tone: 'secondary',
    },
  ],
};

const uiCopy = {
  fr: {
    heroBadge: 'Shiftwell · Circadian Research',
    trust1: 'Calcul local',
    trust2: 'Opt-in',
    trust3: 'Consentement explicite',
    quickLinks: 'Accès rapide',
    previewTitle: "Aperçu de l'expérience",
    previewSubtitle: 'Parcours type (MVP)',
    previewSteps: [
      'Profil (court / long)',
      'Agenda de travail (7 jours)',
      'Agenda de sommeil (7 jours)',
      'Scores + contribution étude',
    ],
    calendarMock: 'Aperçu calendrier (mock)',
    open: 'Ouvrir',
    paper: 'Article scientifique',
    resourcesTitle: 'Pages & ressources',
    resourcesSubtitle:
      'Chaque page a un rôle précis : méthode, cadre scientifique, consentement et contexte projet.',
    trustNote:
      'Le score est calculé localement. La contribution à l’étude est séparée et facultative.',
  },
  en: {
    heroBadge: 'Shiftwell · Circadian Research',
    trust1: 'Local scoring',
    trust2: 'Opt-in',
    trust3: 'Explicit consent',
    quickLinks: 'Quick access',
    previewTitle: 'Experience preview',
    previewSubtitle: 'Typical flow (MVP)',
    previewSteps: [
      'Profile (short / long)',
      'Work schedule (7 days)',
      'Sleep schedule (7 days)',
      'Scores + study contribution',
    ],
    calendarMock: 'Calendar preview (mock)',
    open: 'Open',
    paper: 'Scientific paper',
    resourcesTitle: 'Pages & resources',
    resourcesSubtitle:
      'Each page has a clear role: method, scientific context, consent and project background.',
    trustNote:
      'Scores are computed locally. Study contribution is separate and optional.',
  },
  de: {
    heroBadge: 'Shiftwell · Circadian Research',
    trust1: 'Lokales Scoring',
    trust2: 'Opt-in',
    trust3: 'Ausdr. Einwilligung',
    quickLinks: 'Schnellzugriff',
    previewTitle: 'Erlebnis-Vorschau',
    previewSubtitle: 'Typischer Ablauf (MVP)',
    previewSteps: [
      'Profil (kurz / lang)',
      'Arbeitsplan (7 Tage)',
      'Schlafplan (7 Tage)',
      'Scores + Studienbeitrag',
    ],
    calendarMock: 'Kalender-Vorschau (Mock)',
    open: 'Öffnen',
    paper: 'Wissenschaftlicher Artikel',
    resourcesTitle: 'Seiten & Ressourcen',
    resourcesSubtitle:
      'Jede Seite hat eine klare Funktion: Methodik, wissenschaftlicher Rahmen, Einwilligung, Projektkontext.',
    trustNote:
      'Scores werden lokal berechnet. Der Studienbeitrag ist getrennt und optional.',
  },
} as const;

export default async function LocaleHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const d = getDictionary(locale);
  const c = d.common;
  const h = d.home;
  const ui = uiCopy[locale];
  const resources = resourceCardsByLocale[locale];

  return (
    <main>
      <LocaleNav locale={locale} subtitle={d.tagline} />

      {/* HERO */}
      <section
        className="card"
        style={{
          padding: 20,
          marginBottom: 16,
          background:
            'radial-gradient(circle at 14% 18%, rgba(42,157,143,0.10), transparent 42%), radial-gradient(circle at 86% 10%, rgba(244,162,97,0.12), transparent 38%), #ffffff',
        }}
      >
        <div className="grid grid-2" style={{ alignItems: 'start' }}>
          <div>
            <span className="badge primary">{ui.heroBadge}</span>

            <h1 className="section-title" style={{ marginTop: 12, fontSize: 28 }}>
              {h.title}
            </h1>

            <p className="section-subtitle" style={{ marginTop: 8 }}>
              {h.subtitle}
            </p>

            <div className="row" style={{ marginTop: 14 }}>
              <span className="badge primary">{ui.trust1}</span>
              <span className="badge secondary">{ui.trust2}</span>
              <span className="badge warn">{ui.trust3}</span>
            </div>

            <div className="row" style={{ marginTop: 16 }}>
              <Link className="btn primary" href={`/${locale}/analyze/`}>
                {h.startCta}
              </Link>
              <Link className="btn" href={`/${locale}/method/`}>
                {c.method}
              </Link>
              <Link className="btn" href={`/${locale}/study/`}>
                {c.study}
              </Link>
              <Link className="btn ghost" href={`/${locale}/consent/`}>
                {c.consent}
              </Link>
            </div>

            <div className="notice" style={{ marginTop: 14 }}>
              <div className="small">
                <strong>{h.disclaimerTitle}</strong> {h.disclaimerText}
              </div>
            </div>
          </div>

          <div>
            <div className="card soft" style={{ padding: 14 }}>
              <div className="small muted">{ui.previewTitle}</div>
              <div style={{ marginTop: 4, fontWeight: 700, fontSize: 14 }}>
                {ui.previewSubtitle}
              </div>

              <div className="grid" style={{ gap: 8, marginTop: 10 }}>
                {ui.previewSteps.map((step, idx) => (
                  <div
                    key={step}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '24px 1fr',
                      gap: 8,
                      alignItems: 'start',
                      border: '1px solid var(--border)',
                      borderRadius: 10,
                      padding: '8px 10px',
                      background: 'white',
                    }}
                  >
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 999,
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: 11,
                        fontWeight: 700,
                        color: 'white',
                        background: 'linear-gradient(180deg, var(--primary), var(--primary-2))',
                      }}
                    >
                      {idx + 1}
                    </div>
                    <div className="small" style={{ fontWeight: 600 }}>
                      {step}
                    </div>
                  </div>
                ))}
              </div>

              <div className="divider" />

              <div className="small muted" style={{ marginBottom: 8 }}>
                {ui.calendarMock}
              </div>
              <MiniCalendarMock dayLabels={d.days} />

              <div className="row" style={{ marginTop: 10 }}>
                <a
                  className="btn ghost"
                  href="https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1679296/full"
                  target="_blank"
                  rel="noreferrer"
                >
                  {ui.paper}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE CARDS from i18n home.cards */}
      <section className="card" style={{ padding: 20, marginBottom: 16 }}>
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 className="section-title">{ui.quickLinks}</h2>
            <p className="section-subtitle">{ui.trustNote}</p>
          </div>
        </div>

        <div className="grid grid-3" style={{ marginTop: 14 }}>
          {h.cards.map((card) => (
            <div key={card.title} className="card soft" style={{ padding: 14 }}>
              <div className="badge secondary">{card.kicker}</div>
              <h3 style={{ margin: '10px 0 6px' }}>{card.title}</h3>
              <p className="small muted" style={{ margin: 0 }}>
                {card.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* RESOURCES */}
      <section className="card" style={{ padding: 20, marginBottom: 16 }}>
        <h2 className="section-title">{ui.resourcesTitle}</h2>
        <p className="section-subtitle">{ui.resourcesSubtitle}</p>

        <div className="grid grid-2" style={{ marginTop: 14 }}>
          {resources.map((item) => (
            <section key={item.href} className="card soft" style={{ padding: 14 }}>
              <div className={`badge ${item.tone}`}>{c[item.badgeKey]}</div>
              <h3 style={{ margin: '10px 0 6px' }}>{item.title}</h3>
              <p className="small muted" style={{ margin: 0 }}>
                {item.text}
              </p>

              <div className="row" style={{ marginTop: 12 }}>
                <Link className="btn" href={`/${locale}${item.href}`}>
                  {ui.open}
                </Link>
              </div>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}

function MiniCalendarMock({ dayLabels }: { dayLabels: readonly string[] }) {
  return (
    <div
      style={{
        border: '1px solid var(--border)',
        borderRadius: 10,
        background: 'white',
        padding: 10,
      }}
    >
      {dayLabels.map((d, i) => (
        <div
          key={`${d}-${i}`}
          style={{
            display: 'grid',
            gridTemplateColumns: '56px 1fr',
            gap: 8,
            alignItems: 'center',
            marginBottom: i === dayLabels.length - 1 ? 0 : 6,
          }}
        >
          <div className="small muted">{d}</div>
          <div
            style={{
              position: 'relative',
              height: 10,
              borderRadius: 999,
              background: 'rgba(148,163,184,0.14)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: i % 2 === 0 ? '8%' : '16%',
                width: i >= 5 ? '48%' : '38%',
                top: 0,
                bottom: 0,
                borderRadius: 999,
                background:
                  i >= 5
                    ? 'linear-gradient(90deg, rgba(42,157,143,.32), rgba(42,157,143,.10))'
                    : 'linear-gradient(90deg, rgba(30,42,68,.26), rgba(244,162,97,.18))',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}