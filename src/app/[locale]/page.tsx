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
      text: 'Un parcours local pour lire charge, recuperation, nuits biologiques et tensions de rythme.',
      href: '/analyze/',
      tone: 'primary',
    },
    {
      badgeKey: 'method',
      title: 'Methodologie',
      text: 'Le noyau de calcul, ses hypotheses, sa trace et ses limites explicites.',
      href: '/method/',
      tone: 'secondary',
    },
    {
      badgeKey: 'study',
      title: 'Etude',
      text: 'Le cadre scientifique, la cible et la facon dont le projet s’inscrit dans la recherche.',
      href: '/study/',
      tone: 'warn',
    },
    {
      badgeKey: 'consent',
      title: "Notice d'information",
      text: 'Une contribution separee, explicite et traçable, jamais confondue avec l’analyse locale.',
      href: '/consent/',
      tone: 'secondary',
    },
    {
      badgeKey: 'about',
      title: 'A propos',
      text: 'Le projet, son intention open source et sa vision chronobiologie + produit.',
      href: '/about/',
      tone: 'secondary',
    },
  ],
  en: [
    {
      badgeKey: 'analyze',
      title: 'Weekly analysis',
      text: 'A local-first flow to read workload, recovery, biological nights, and rhythm pressure.',
      href: '/analyze/',
      tone: 'primary',
    },
    {
      badgeKey: 'method',
      title: 'Methodology',
      text: 'The scoring core, its assumptions, traceability, and explicit limits.',
      href: '/method/',
      tone: 'secondary',
    },
    {
      badgeKey: 'study',
      title: 'Study',
      text: 'The scientific frame, target population, and the research intent behind the project.',
      href: '/study/',
      tone: 'warn',
    },
    {
      badgeKey: 'consent',
      title: 'Information notice',
      text: 'A separate, explicit, traceable contribution path, never confused with local analysis.',
      href: '/consent/',
      tone: 'secondary',
    },
    {
      badgeKey: 'about',
      title: 'About',
      text: 'Project context, open-source posture, and the chronobiology + product vision.',
      href: '/about/',
      tone: 'secondary',
    },
  ],
  de: [
    {
      badgeKey: 'analyze',
      title: 'Wochenanalyse',
      text: 'Ein lokaler Ablauf, um Belastung, Erholung, biologische Nachte und Rhythmusdruck zu lesen.',
      href: '/analyze/',
      tone: 'primary',
    },
    {
      badgeKey: 'method',
      title: 'Methodik',
      text: 'Der Scoring-Kern, seine Annahmen, Nachvollziehbarkeit und klaren Grenzen.',
      href: '/method/',
      tone: 'secondary',
    },
    {
      badgeKey: 'study',
      title: 'Studie',
      text: 'Der wissenschaftliche Rahmen, die Zielgruppe und die Forschungsabsicht hinter dem Projekt.',
      href: '/study/',
      tone: 'warn',
    },
    {
      badgeKey: 'consent',
      title: 'Teilnehmerinformation',
      text: 'Ein getrennter, ausdrücklicher und nachvollziehbarer Beitragsweg, nicht mit der lokalen Analyse vermischt.',
      href: '/consent/',
      tone: 'secondary',
    },
    {
      badgeKey: 'about',
      title: 'Uber Shiftwell',
      text: 'Projektkontext, Open-Source-Haltung und die Vision zwischen Chronobiologie und Produkt.',
      href: '/about/',
      tone: 'secondary',
    },
  ],
};

const uiCopy = {
  fr: {
    heroBadge: 'Shiftwell · Chronobiologie appliquee',
    trust1: 'Calcul local',
    trust2: 'Open source',
    trust3: 'References tracables',
    quickLinks: 'Repères rapides',
    previewTitle: "Ce que le site cherche a rendre visible",
    previewSubtitle: 'Pas juste un score : un rythme, une charge, une recuperation.',
    previewSteps: [
      'Situer la personne et le contexte de semaine',
      'Poser les plages de travail reelles',
      'Poser les temps de sommeil reconstitues',
      'Lire les tensions du rythme et les zones de recuperation',
    ],
    calendarMock: 'Lecture visuelle de la semaine',
    open: 'Ouvrir',
    paper: 'Reference externe',
    resourcesTitle: 'Pages & ressources',
    resourcesSubtitle:
      'Le site public doit rester lisible pour tout le monde : soignants, chercheurs, contributors open source et devs non experts.',
    trustNote:
      "L'analyse est calculee localement. La contribution recherche est separee. Les references externes restent des oeuvres tierces.",
    manifestoTitle: 'Un projet pour lire les semaines qui usent',
    manifestoText:
      "Shiftwell ne cherche pas a faire joli autour d’un score. Le projet essaie de rendre visible ce qui se perd dans les horaires atypiques : sommeil utile, rythme circadien, recuperation, vie sociale, et marges de sécurité.",
  },
  en: {
    heroBadge: 'Shiftwell · Applied chronobiology',
    trust1: 'Local scoring',
    trust2: 'Open source',
    trust3: 'Traceable references',
    quickLinks: 'Quick markers',
    previewTitle: 'What the site is trying to make visible',
    previewSubtitle: 'Not just a score: a rhythm, a load, a recovery pattern.',
    previewSteps: [
      'Place the person and the week in context',
      'Map real work periods',
      'Map reconstructed sleep periods',
      'Read rhythm strain and recovery windows',
    ],
    calendarMock: 'Visual reading of the week',
    open: 'Open',
    paper: 'External reference',
    resourcesTitle: 'Pages & resources',
    resourcesSubtitle:
      'The public surface should stay readable for clinicians, researchers, open-source contributors, and non-expert devs.',
    trustNote:
      'Analysis is computed locally. Research contribution is separate. External references remain third-party works.',
    manifestoTitle: 'A project for reading the weeks that wear people down',
    manifestoText:
      'Shiftwell is not trying to decorate a score. It is trying to make visible what irregular schedules quietly erode: useful sleep, circadian timing, recovery, social time, and safety margins.',
  },
  de: {
    heroBadge: 'Shiftwell · Angewandte Chronobiologie',
    trust1: 'Lokales Scoring',
    trust2: 'Open source',
    trust3: 'Nachvollziehbare Referenzen',
    quickLinks: 'Schnelle Orientierung',
    previewTitle: 'Was die Website sichtbar machen will',
    previewSubtitle: 'Nicht nur ein Score: ein Rhythmus, eine Last, eine Erholung.',
    previewSteps: [
      'Person und Wochenkontext einordnen',
      'Reale Arbeitsphasen abbilden',
      'Rekonstruierte Schlafphasen abbilden',
      'Rhythmusdruck und Erholungsfenster lesen',
    ],
    calendarMock: 'Visuelle Wochenlesung',
    open: 'Offnen',
    paper: 'Externe Referenz',
    resourcesTitle: 'Seiten & Ressourcen',
    resourcesSubtitle:
      'Die offentliche Flache soll fur Klinik, Forschung, Open-Source-Mitwirkende und nicht-expertische Devs lesbar bleiben.',
    trustNote:
      'Die Analyse wird lokal berechnet. Der Forschungsbeitrag ist getrennt. Externe Referenzen bleiben Drittwerke.',
    manifestoTitle: 'Ein Projekt, um Wochen zu lesen, die Menschen zermurben',
    manifestoText:
      'Shiftwell will keinen Score dekorieren. Das Projekt will sichtbar machen, was atypische Dienste leise abtragen: nutzbaren Schlaf, zirkadianes Timing, Erholung, soziale Zeit und Sicherheitsreserven.',
  },
} as const;

export default async function LocaleHomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const d = getDictionary(locale);
  const c = d.common;
  const h = d.home;
  const ui = uiCopy[locale];
  const resources = resourceCardsByLocale[locale];

  return (
    <main>
      <LocaleNav locale={locale} />

      <div className="sw-public-wide">
        <div className="sw-public-inner">
          <div className="sw-home-shell">
            <section className="sw-home-hero-clean">
              <div className="sw-home-hero-main">
                <span className="badge primary sw-flow-kicker">{ui.heroBadge}</span>
                <h1 className="sw-home-title">{h.title}</h1>
                <p className="sw-home-line">{ui.manifestoTitle}</p>
                <p className="sw-home-lead">{h.subtitle}</p>

                <div className="sw-home-pill-row">
                  <span className="badge primary">{ui.trust1}</span>
                  <span className="badge secondary">{ui.trust2}</span>
                  <span className="badge warn">{ui.trust3}</span>
                </div>

                <div className="sw-home-action-row">
                  <Link className="btn primary" href={`/${locale}/analyze/`}>
                    {h.startCta}
                  </Link>
                  <Link className="btn" href={`/${locale}/method/`}>
                    {c.method}
                  </Link>
                  <Link className="btn ghost" href={`/${locale}/about/`}>
                    {c.about}
                  </Link>
                </div>

                <p className="sw-home-trust-copy">
                  <strong>{h.disclaimerTitle}</strong> {h.disclaimerText}
                </p>
              </div>

              <aside className="sw-home-hero-aside">
                <div className="sw-flow-caption">{ui.previewTitle}</div>
                <p className="sw-flow-copy" style={{ marginTop: 0 }}>
                  {ui.manifestoText}
                </p>

                <div className="sw-home-step-stack">
                  {ui.previewSteps.map((step, idx) => (
                    <div key={step} className="sw-home-step">
                      <div className="sw-home-step-index">{idx + 1}</div>
                      <div className="small" style={{ fontWeight: 700 }}>
                        {step}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="sw-home-mini-wrap">
                  <div className="small muted" style={{ marginBottom: 8 }}>
                    {ui.calendarMock}
                  </div>
                  <MiniCalendarMock dayLabels={d.days} />
                </div>
              </aside>
            </section>

            <section className="sw-home-highlights">
              {h.cards.map((card) => (
                <article key={card.title} className="sw-home-highlight">
                  <div className="sw-flow-caption">{card.kicker}</div>
                  <h2 className="sw-flow-heading">{card.title}</h2>
                  <p className="sw-flow-copy">{card.text}</p>
                </article>
              ))}
            </section>

            <section className="sw-home-resource-shell">
              <div className="sw-home-resource-head">
                <div>
                  <div className="sw-flow-caption">{ui.quickLinks}</div>
                  <h2 className="sw-home-resource-title">{ui.resourcesTitle}</h2>
                </div>
                <p className="sw-home-resource-copy">{ui.resourcesSubtitle}</p>
              </div>

              <div className="sw-home-resource-grid">
                {resources.map((item, idx) => (
                  <section
                    key={item.href}
                    className={`sw-home-resource ${idx === 0 ? 'is-featured' : ''}`}
                  >
                    <div className={`badge ${item.tone}`}>{c[item.badgeKey]}</div>
                    <h3 className="sw-home-resource-card-title">{item.title}</h3>
                    <p className="sw-flow-copy">{item.text}</p>
                    <div className="sw-home-resource-actions">
                      <Link className="btn" href={`/${locale}${item.href}`}>
                        {ui.open}
                      </Link>
                    </div>
                  </section>
                ))}
              </div>

              <div className="sw-home-bottom-note">
                <p className="sw-home-trust-copy" style={{ margin: 0 }}>
                  {ui.trustNote}
                </p>
                <a
                  className="btn ghost"
                  href="https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1679296/full"
                  target="_blank"
                  rel="noreferrer"
                  aria-label={ui.paper}
                >
                  {ui.paper}
                </a>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

function MiniCalendarMock({ dayLabels }: { dayLabels: readonly string[] }) {
  return (
    <div className="sw-mini-calendar">
      {dayLabels.map((d, i) => (
        <div key={`${d}-${i}`} className="sw-mini-calendar-row">
          <div className="small muted">{d}</div>
          <div className="sw-mini-calendar-track">
            <div
              className="sw-mini-calendar-bar"
              style={{
                left: i % 2 === 0 ? '8%' : '16%',
                width: i >= 5 ? '48%' : '38%',
                background:
                  i >= 5
                    ? 'linear-gradient(90deg, rgba(42,157,143,.42), rgba(42,157,143,.14))'
                    : 'linear-gradient(90deg, rgba(27,43,69,.32), rgba(244,162,97,.26))',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
