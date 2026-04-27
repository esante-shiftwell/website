import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isLocale, LOCALES, type Locale } from '@/i18n';
import LocaleNav from '@/components/LocaleNav';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

const content = {
  fr: {
    label: 'Method',
    title: 'Methodologie',
    line: 'Une formule lisible avant d etre parfaite.',
    subtitle:
      'Shiftwell lit une semaine de travail et de sommeil comme une tension entre charge, recuperation, nuit biologique et regularite. La version actuelle reste un MVP traceable, aligne sur des references externes sans pretendre les reproduire a l identique.',
    runtimeLabel: 'Runtime',
    runtimeText:
      'Une formule proxy explicable, reliee a des references externes et pensee pour rester audit-able a mesure que le moteur se rapproche du workbook.',
    kpis: [
      { label: 'Position', value: 'MVP explicable', copy: 'Un moteur proxy documente, pas une formule clinique finale.' },
      { label: 'Reference forte', value: 'Workbook', copy: 'Les seuils et les facteurs sont compares en continu a la copie de travail.' },
      { label: 'Ambition', value: 'Traceable', copy: 'Chaque facteur visible doit pouvoir remonter vers sa source et son statut.' },
    ],
    scoringLabel: 'Ce que la formule lit aujourd hui',
    scoringTitle: 'Ce que la formule lit aujourd hui',
    scoringItems: [
      'Le score de risque resume la charge hebdomadaire a partir des segments de travail, des shifts longs, des coupures courtes, des nuits et des pertes biologiques et sociales.',
      'Le score sommeil combine duree moyenne et regularite proxy a partir du planning saisi, sans actigraphie ni mesure physiologique.',
      'Le score d adaptabilite assemble risque inverse et sommeil pour une lecture produit simple, utile a l exploration mais encore non calibree sur cohorte.',
    ],
    sourcesLabel: 'References externes',
    sourcesTitle: 'Comment Shiftwell se relie aux references externes',
    sourceText:
      "Shiftwell s appuie sur des references scientifiques tierces et sur une copie locale de travail du workbook pour documenter son moteur. Le projet n est ni auteur ni proprietaire de ces contenus externes : il les reference, les compare et les traduit en logique produit.",
    noticeText:
      "La page presente donc une relation de travail avec des sources externes, pas une reprise a l identique ni une revendication d authorite clinique.",
    externalArticle: 'Article externe',
    externalWorkbook: 'Workbook externe (copie locale de travail)',
    workbookNote: 'Le detail de provenance et les localisateurs sont decrits dans la documentation du repo.',
    backToAnalyze: "Retour a l'analyse",
    mappingLabel: 'Mapping',
    mappingHeaders: ['Reference externe', 'Variable Shiftwell', 'Statut'],
    mappingRows: [
      ['Heures travaillees', 'Calcule a partir des segments de travail de la semaine', 'Implemente'],
      ['Long shifts', 'Nombre de segments de travail longs (proxy seuil)', 'Implemente (proxy)'],
      ['Recuperation', 'Plus longue fenetre de recuperation entre shifts', 'Implemente (proxy)'],
      ['Night shifts', 'Chevauchement avec fenetre biologique nuit', 'Implemente (proxy)'],
      ['Perte biologique', 'Travail dans fenetre biologique (23h-7h, proxy)', 'Implemente (proxy)'],
      ['Perte sociale', 'Travail dans fenetre sociale (proxy)', 'Implemente (proxy)'],
      ['SRI/TST', 'Proxy regularite + duree totale sommeil', 'Proxy MVP'],
    ],
    closing: [
      {
        label: 'Limites actuelles',
        title: 'Limites actuelles',
        items: [
          'Version actuelle = proxy v0.1, avec plusieurs seuils encore a verrouiller face au protocole final.',
          "La saisie reste auto declaree : il n y a ni actigraphie ni capteur embarque dans le MVP.",
          "Le score d adaptabilite n est pas encore calibre sur une cohorte de reference.",
          'L interface explique une formule active, mais ne fournit pas encore de recommandation clinique.',
        ],
      },
      {
        label: 'Prochaines clarifications',
        title: 'Prochaines clarifications',
        items: [
          'Continuer l alignement strict avec le workbook et formaliser les ecarts encore disputes.',
          'Raffiner les facteurs biologiques et sociaux la ou le runtime reste encore proxy.',
          'Etendre la trace pour reduire encore les fallbacks d explicabilite cote UI.',
          'Stabiliser les points assez robustes pour accueillir des contributions open source plus sereines.',
        ],
      },
      {
        label: 'MVP',
        title: 'Proxy, mais lisible',
        items: [
          'La priorite actuelle est de rendre le moteur assez net pour qu un contributeur comprenne ce qui est implemente.',
          'Le but n est pas de sur-vendre une precision clinique, mais de documenter clairement ce qui existe deja.',
        ],
      },
    ],
  },
  en: {
    label: 'Method',
    title: 'Methodology',
    line: 'Readable first, perfect later.',
    subtitle:
      'Shiftwell reads a work and sleep week as a tension between load, recovery, biological night and regularity. The current version is still a traceable MVP aligned with external references without claiming to reproduce them exactly.',
    runtimeLabel: 'Runtime',
    runtimeText:
      'An explainable proxy formula connected to external references and designed to remain auditable as the engine moves closer to the workbook.',
    kpis: [
      { label: 'Position', value: 'Explainable MVP', copy: 'A documented proxy engine, not a final clinical formula.' },
      { label: 'Primary reference', value: 'Workbook', copy: 'Thresholds and factors are continuously compared against the working copy.' },
      { label: 'Ambition', value: 'Traceable', copy: 'Every visible factor should map back to a source and status.' },
    ],
    scoringLabel: 'What the formula reads today',
    scoringTitle: 'What the formula reads today',
    scoringItems: [
      'The risk score summarizes weekly load from work segments, long shifts, short breaks, nights, and biological and social loss proxies.',
      'The sleep score combines average sleep duration and a regularity proxy from the entered schedule, without actigraphy or physiological measurement.',
      'The adaptability score combines inverse risk and sleep into a simple product layer that remains useful for exploration but is not cohort-calibrated yet.',
    ],
    sourcesLabel: 'External references',
    sourcesTitle: 'How Shiftwell relates to external references',
    sourceText:
      'Shiftwell relies on third-party scientific references and on a local working copy of the workbook to document its engine. The project does not own those materials: it references them, compares them, and translates them into product logic.',
    noticeText:
      'This page therefore presents a working relationship with external references, not a verbatim republication and not a claim of clinical authority.',
    externalArticle: 'External article',
    externalWorkbook: 'External workbook (local working copy)',
    workbookNote: 'Detailed provenance and locators are described in the repository documentation.',
    backToAnalyze: 'Back to analyze',
    mappingLabel: 'Mapping',
    mappingHeaders: ['External reference', 'Shiftwell variable', 'Status'],
    mappingRows: [
      ['Hours worked', 'Computed from weekly work segments', 'Implemented'],
      ['Long shifts', 'Count of long work segments (proxy threshold)', 'Implemented (proxy)'],
      ['Recovery', 'Longest recovery window between shifts', 'Implemented (proxy)'],
      ['Night shifts', 'Overlap with biological night window', 'Implemented (proxy)'],
      ['Biological loss', 'Work encroachment in biological window (23:00-07:00 proxy)', 'Implemented (proxy)'],
      ['Social loss', 'Work encroachment in social window (proxy)', 'Implemented (proxy)'],
      ['SRI/TST', 'Regularity proxy + total sleep time', 'MVP proxy'],
    ],
    closing: [
      {
        label: 'Current limitations',
        title: 'Current limitations',
        items: [
          'Current version = proxy v0.1, with several thresholds still to be locked against the final protocol.',
          'Input is self-reported: there is no actigraphy or wearable capture in the MVP.',
          'The adaptability score is not yet calibrated on a reference cohort.',
          'The interface explains an active formula, but still does not provide clinical recommendations.',
        ],
      },
      {
        label: 'Next clarifications',
        title: 'Next clarifications',
        items: [
          'Continue strict alignment with the workbook and formalize disputed gaps.',
          'Refine biological and social factors where runtime still remains proxy-based.',
          'Extend the trace to reduce remaining explainability fallbacks on the UI side.',
          'Stabilize the parts that are robust enough to welcome calmer open-source contributions.',
        ],
      },
      {
        label: 'MVP',
        title: 'Proxy, but readable',
        items: [
          'The current priority is to make the engine clear enough that contributors understand what is implemented.',
          'The goal is not to over-claim clinical precision, but to document clearly what already exists.',
        ],
      },
    ],
  },
  de: {
    label: 'Method',
    title: 'Methodik',
    line: 'Lesbar zuerst, perfekt spater.',
    subtitle:
      'Shiftwell liest eine Arbeits- und Schlafwoche als Spannung zwischen Belastung, Erholung, biologischer Nacht und Regelmassigkeit. Die aktuelle Version bleibt ein nachvollziehbares MVP, das an externen Referenzen ausgerichtet ist, ohne sie identisch nachzubilden.',
    runtimeLabel: 'Runtime',
    runtimeText:
      'Eine erklarbare Proxy-Formel, die mit externen Referenzen verbunden ist und auditierbar bleiben soll, wahrend die Engine naher an das Workbook ruckt.',
    kpis: [
      { label: 'Position', value: 'Erklarbares MVP', copy: 'Eine dokumentierte Proxy-Engine, keine finale klinische Formel.' },
      { label: 'Hauptreferenz', value: 'Workbook', copy: 'Schwellen und Faktoren werden laufend mit der Arbeitskopie abgeglichen.' },
      { label: 'Ziel', value: 'Nachvollziehbar', copy: 'Jeder sichtbare Faktor soll auf Quelle und Status zuruckfuhren.' },
    ],
    scoringLabel: 'Was die Formel heute liest',
    scoringTitle: 'Was die Formel heute liest',
    scoringItems: [
      'Der Risiko-Score fasst die Wochenbelastung aus Arbeitssegmenten, langen Schichten, kurzen Pausen, Nachten sowie biologischen und sozialen Verlust-Proxys zusammen.',
      'Der Schlaf-Score kombiniert durchschnittliche Schlafdauer und einen Regelmassigkeits-Proxy aus dem eingegebenen Plan, ohne Aktigraphie oder physiologische Messung.',
      'Der Anpassungs-Score verbindet inverses Risiko und Schlaf zu einer einfachen Produkt-Lesart, die fur Exploration nutzlich bleibt, aber noch nicht kohortenkalibriert ist.',
    ],
    sourcesLabel: 'Externe Referenzen',
    sourcesTitle: 'Wie Shiftwell mit externen Referenzen arbeitet',
    sourceText:
      'Shiftwell nutzt wissenschaftliche Drittquellen und eine lokale Arbeitskopie des Workbooks, um seine Engine zu dokumentieren. Das Projekt besitzt diese Materialien nicht: es referenziert sie, vergleicht sie und ubersetzt sie in Produktlogik.',
    noticeText:
      'Diese Seite beschreibt daher eine Arbeitsbeziehung zu externen Referenzen, keine wortliche Wiederveroffentlichung und keinen Anspruch auf klinische Autoritat.',
    externalArticle: 'Externer Artikel',
    externalWorkbook: 'Externes Workbook (lokale Arbeitskopie)',
    workbookNote: 'Detaillierte Provenienz und Lokatoren sind in der Repository-Dokumentation beschrieben.',
    backToAnalyze: 'Zuruck zur Analyse',
    mappingLabel: 'Mapping',
    mappingHeaders: ['Externe Referenz', 'Shiftwell-Variable', 'Status'],
    mappingRows: [
      ['Arbeitsstunden', 'Aus Wochen-Arbeitssegmenten berechnet', 'Implementiert'],
      ['Lange Schichten', 'Anzahl langer Arbeitssegmente (Proxy-Schwelle)', 'Implementiert (Proxy)'],
      ['Erholung', 'Langstes Erholungsfenster zwischen Schichten', 'Implementiert (Proxy)'],
      ['Nachtschichten', 'Uberlappung mit biologischem Nachtfenster', 'Implementiert (Proxy)'],
      ['Biologischer Verlust', 'Arbeit im biologischen Fenster (23-7 Uhr, Proxy)', 'Implementiert (Proxy)'],
      ['Sozialer Verlust', 'Arbeit im sozialen Zeitfenster (Proxy)', 'Implementiert (Proxy)'],
      ['SRI/TST', 'Regelmassigkeits-Proxy + Gesamtschlafzeit', 'MVP Proxy'],
    ],
    closing: [
      {
        label: 'Aktuelle Grenzen',
        title: 'Aktuelle Grenzen',
        items: [
          'Aktuelle Version = Proxy v0.1, mehrere Schwellen mussen noch gegen das finale Protokoll fixiert werden.',
          'Die Eingabe bleibt selbstberichtet: Im MVP gibt es weder Aktigraphie noch Wearable-Erfassung.',
          'Der Anpassungs-Score ist noch nicht auf eine Referenzkohorte kalibriert.',
          'Die Oberflache erklart eine aktive Formel, liefert aber weiterhin keine klinischen Empfehlungen.',
        ],
      },
      {
        label: 'Nachste Klarstellungen',
        title: 'Nachste Klarstellungen',
        items: [
          'Die strikte Ausrichtung mit dem Workbook fortsetzen und strittige Lucken formalisieren.',
          'Biologische und soziale Faktoren dort verfeinern, wo Runtime noch proxy-basiert bleibt.',
          'Die Trace erweitern, um verbleibende Explainability-Fallbacks in der UI weiter zu reduzieren.',
          'Die ausreichend robusten Teile stabilisieren, damit Open-Source-Beitrage ruhiger andocken konnen.',
        ],
      },
      {
        label: 'MVP',
        title: 'Proxy, aber lesbar',
        items: [
          'Die aktuelle Prioritat ist, die Engine so klar zu machen, dass Beitragende verstehen, was bereits implementiert ist.',
          'Das Ziel ist nicht, klinische Prazision zu uberverkaufen, sondern sauber zu dokumentieren, was schon existiert.',
        ],
      },
    ],
  },
} as const;

export default async function MethodPage({
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

      <div className="sw-public-wide">
        <div className="sw-public-inner">
          <div className="sw-method-shell">
            <section className="sw-method-hero">
              <div className="sw-method-hero-main">
                <span className="badge primary sw-flow-kicker">{c.label}</span>
                <h1 className="sw-method-title">{c.title}</h1>
                <p className="sw-method-line">{c.line}</p>
                <p className="sw-about-lead">{c.subtitle}</p>
              </div>

              <aside className="sw-method-runtime">
                <div className="sw-flow-caption">{c.runtimeLabel}</div>
                <p className="sw-flow-copy" style={{ marginTop: 0 }}>
                  {c.runtimeText}
                </p>
              </aside>
            </section>

            <section className="sw-method-kpis sw-method-kpis-mid">
              {c.kpis.map((item) => (
                <article key={item.label} className="sw-kpi">
                  <div className="sw-kpi-label">{item.label}</div>
                  <div className="sw-kpi-value">{item.value}</div>
                  <div className="sw-kpi-copy">{item.copy}</div>
                </article>
              ))}
            </section>

            <section className="sw-method-main sw-method-main-wide">
              <div className="sw-method-main-copy">
                <div className="sw-flow-caption">{c.scoringLabel}</div>
                <h2 className="sw-method-section-title">{c.scoringTitle}</h2>
                <ul className="sw-list-clean" style={{ marginTop: 16 }}>
                  {c.scoringItems.map((item) => (
                    <li key={item} className="small" style={{ lineHeight: 1.8 }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <aside className="sw-method-sources">
                <div className="sw-flow-caption">{c.sourcesLabel}</div>
                <h2 className="sw-flow-heading">{c.sourcesTitle}</h2>
                <p className="sw-flow-copy">{c.sourceText}</p>
                <div className="sw-band-note">
                  <div className="small">{c.noticeText}</div>
                </div>

                <div className="sw-flow-stack" style={{ marginTop: 14 }}>
                  <div>
                    <div className="small muted" style={{ fontWeight: 700 }}>
                      {c.externalArticle}
                    </div>
                    <div className="small" style={{ marginTop: 8 }}>
                      <a
                        className="sw-inline-link"
                        href="https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1679296/full"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Frontiers in Public Health
                      </a>
                    </div>
                  </div>

                  <div>
                    <div className="small muted" style={{ fontWeight: 700 }}>
                      {c.externalWorkbook}
                    </div>
                    <div className="small" style={{ marginTop: 8 }}>
                      {c.workbookNote}
                    </div>
                  </div>

                  <div className="row">
                    <Link className="btn" href={`/${locale}/analyze/`}>
                      {c.backToAnalyze}
                    </Link>
                  </div>
                </div>
              </aside>
            </section>

            <section className="sw-method-mapping sw-method-mapping-mid">
              <div className="sw-flow-caption">{c.mappingLabel}</div>
              <div className="sw-table-scroll" style={{ marginTop: 10 }}>
                <table className="sw-table">
                  <thead>
                    <tr>
                      {c.mappingHeaders.map((header) => (
                        <th key={header}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {c.mappingRows.map((row) => (
                      <tr key={row[0]}>
                        {row.map((cell, index) => (
                          <td key={`${row[0]}-${index}`}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="sw-method-closing sw-method-closing-end">
              {c.closing.map((block) => (
                <article key={block.title} className="sw-method-closing-card">
                  <div className="sw-flow-caption">{block.label}</div>
                  <h2 className="sw-flow-heading">{block.title}</h2>
                  <ul className="sw-list-clean" style={{ marginTop: 12 }}>
                    {block.items.map((item) => (
                      <li key={item} className="small" style={{ lineHeight: 1.8 }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
