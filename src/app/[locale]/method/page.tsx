import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isLocale, LOCALES, type Locale } from '@/i18n';
import LocaleNav from '@/components/LocaleNav';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

const content = {
  fr: {
    title: 'Methodologie',
    subtitle:
      'Comment Shiftwell calcule les scores (version MVP) et comment cela se relie a des references externes.',
    sections: {
      scoring: 'Scores (MVP v0.1)',
      source: 'References externes',
      mapping: 'Mapping reference externe ↔ Shiftwell',
      limits: 'Limites actuelles',
      roadmap: 'Roadmap methodologique',
    },
    scoringItems: [
      'Score Risque (SLI proxy) : score de charge ou risque hebdomadaire derive de l agenda travail et sommeil.',
      'Score Sommeil (proxy) : combine duree moyenne de sommeil et proxy de regularite.',
      'Score Adaptabilite (principal) : combine risque inverse et score sommeil (proxy v0.1).',
    ],
    sourceText:
      "Shiftwell s'appuie sur des references scientifiques externes et sur une copie locale de travail du workbook. La version MVP implemente une logique proxy pour accelerer le pilote produit, puis sera alignee plus strictement au protocole.",
    noticeText:
      "Les references ci-dessous restent des oeuvres externes. Leur presence ici ne signifie ni paternite ni propriete par Shiftwell.",
    mappingHeaders: ['Reference externe', 'Variable Shiftwell', 'Statut'],
    backToAnalyze: "Retour a l'analyse",
    externalArticle: 'Article externe',
    externalWorkbook: 'Workbook externe (copie locale de travail)',
    mappingRows: [
      ['Heures travaillees', 'Calcule a partir des segments de travail de la semaine', 'Implemente'],
      ['Longs shifts', 'Nombre de segments de travail longs (proxy seuil)', 'Implemente (proxy)'],
      ['Recuperation', 'Plus longue fenetre de recuperation entre shifts', 'Implemente (proxy)'],
      ['Night shifts', 'Chevauchement avec fenetre biologique nuit', 'Implemente (proxy)'],
      ['Perte biologique', 'Travail dans fenetre biologique (23h-7h, proxy)', 'Implemente (proxy)'],
      ['Perte sociale', 'Travail dans fenetre sociale (proxy)', 'Implemente (proxy)'],
      ['SRI/TST', 'Proxy regularite + duree totale sommeil', 'Proxy MVP'],
    ],
    limits: [
      'Version actuelle = proxy v0.1 (seuils et ponderations a verrouiller avec le protocole final).',
      "Saisie auto declaree (pas d'actigraphie).",
      "Score d'adaptabilite non calibre sur cohorte dans la V1.",
      'Aucune recommandation clinique en sortie (volontairement).',
    ],
    roadmap: [
      'Alignement strict des seuils SLI avec le papier ou protocole',
      "Ajout d'une reference moyenne (papier ou cohorte)",
      "Calibration du score d'adaptabilite sur donnees de cohorte",
      'Evolution vers un vrai calendrier visuel (drag and drop) si besoin',
    ],
  },
  en: {
    title: 'Methodology',
    subtitle:
      'How Shiftwell computes scores (MVP version) and how it relates to external references.',
    sections: {
      scoring: 'Scores (MVP v0.1)',
      source: 'External references',
      mapping: 'External reference ↔ Shiftwell mapping',
      limits: 'Current limitations',
      roadmap: 'Method roadmap',
    },
    scoringItems: [
      'Risk score (SLI proxy): weekly load or risk score derived from work and sleep schedule.',
      'Sleep score (proxy): combines average sleep duration and regularity proxy.',
      'Adaptability score (main): combines inverse risk and sleep score (proxy v0.1).',
    ],
    sourceText:
      'Shiftwell relies on third-party scientific references and on a local working copy of the workbook. The MVP currently implements proxy logic for a fast product pilot, then will be aligned more strictly with the protocol.',
    noticeText:
      'The references below remain external works. Showing them here does not mean authorship or ownership by Shiftwell.',
    mappingHeaders: ['External reference item', 'Shiftwell variable', 'Status'],
    backToAnalyze: 'Back to Analyze',
    externalArticle: 'External article',
    externalWorkbook: 'External workbook (local working copy)',
    mappingRows: [
      ['Hours worked', 'Computed from weekly work segments', 'Implemented'],
      ['Long shifts', 'Count of long work segments (proxy threshold)', 'Implemented (proxy)'],
      ['Recovery', 'Longest recovery window between shifts', 'Implemented (proxy)'],
      ['Night shifts', 'Overlap with biological night window', 'Implemented (proxy)'],
      ['Biological loss', 'Work encroachment in biological window (23:00-07:00 proxy)', 'Implemented (proxy)'],
      ['Social loss', 'Work encroachment in social window (proxy)', 'Implemented (proxy)'],
      ['SRI/TST', 'Regularity proxy + total sleep time', 'MVP proxy'],
    ],
    limits: [
      'Current version = proxy v0.1 (thresholds and weights still to be aligned with the final protocol).',
      'Self-reported input (no actigraphy).',
      'Adaptability score not cohort-calibrated in V1.',
      'No clinical recommendations in output (intentional).',
    ],
    roadmap: [
      'Strict SLI threshold alignment with paper or protocol',
      'Add average reference (paper or cohort baseline)',
      'Calibrate adaptability score on cohort data',
      'Move to a true visual calendar grid (drag and drop) if needed',
    ],
  },
  de: {
    title: 'Methodik',
    subtitle:
      'Wie Shiftwell die Scores berechnet (MVP) und wie dies mit externen Referenzen zusammenhangt.',
    sections: {
      scoring: 'Scores (MVP v0.1)',
      source: 'Externe Referenzen',
      mapping: 'Externes Referenz-Mapping ↔ Shiftwell',
      limits: 'Aktuelle Grenzen',
      roadmap: 'Methodik-Roadmap',
    },
    scoringItems: [
      'Risiko-Score (SLI-Proxy): wochentlicher Belastungs- oder Risikoscore aus Arbeits- und Schlafplan.',
      'Schlaf-Score (Proxy): kombiniert mittlere Schlafdauer und Regelmassigkeits-Proxy.',
      'Anpassungsfahigkeit (Hauptscore): kombiniert inverses Risiko und Schlaf-Score (Proxy v0.1).',
    ],
    sourceText:
      'Shiftwell nutzt wissenschaftliche Drittquellen und eine lokale Arbeitskopie des Workbooks. Im MVP wird eine Proxy-Logik verwendet; spater erfolgt die strengere Protokoll-Ausrichtung.',
    noticeText:
      'Die unten genannten Referenzen bleiben externe Werke. Ihre Anzeige hier bedeutet keine Urheberschaft oder Eigentumerschaft durch Shiftwell.',
    mappingHeaders: ['Externe Referenz', 'Shiftwell-Variable', 'Status'],
    backToAnalyze: 'Zuruck zur Analyse',
    externalArticle: 'Externer Artikel',
    externalWorkbook: 'Externes Workbook (lokale Arbeitskopie)',
    mappingRows: [
      ['Arbeitsstunden', 'Aus Wochen-Arbeitssegmenten berechnet', 'Implementiert'],
      ['Lange Schichten', 'Anzahl langer Arbeitssegmente (Proxy-Schwelle)', 'Implementiert (Proxy)'],
      ['Erholung', 'Langstes Erholungsfenster zwischen Schichten', 'Implementiert (Proxy)'],
      ['Nachtschichten', 'Uberlappung mit biologischem Nachtfenster', 'Implementiert (Proxy)'],
      ['Biologischer Verlust', 'Arbeit im biologischen Fenster (23-7 Uhr, Proxy)', 'Implementiert (Proxy)'],
      ['Sozialer Verlust', 'Arbeit im sozialen Zeitfenster (Proxy)', 'Implementiert (Proxy)'],
      ['SRI/TST', 'Regelmassigkeits-Proxy + Gesamtschlafzeit', 'MVP Proxy'],
    ],
    limits: [
      'Aktuelle Version = Proxy v0.1 (Schwellen und Gewichte noch mit dem finalen Protokoll abzugleichen).',
      'Selbstberichtete Eingaben (keine Aktigraphie).',
      'Anpassungs-Score in V1 nicht auf Kohorte kalibriert.',
      'Keine klinischen Empfehlungen in der Ausgabe (absichtlich).',
    ],
    roadmap: [
      'Strikte SLI-Schwellen am Paper oder Protokoll ausrichten',
      'Referenzmittelwert (Paper oder Kohorte) hinzufugen',
      'Anpassungs-Score auf Kohortendaten kalibrieren',
      'Spater visuelle Kalenderansicht (Drag and Drop) falls notig',
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

      <section className="card" style={{ padding: 20, marginBottom: 16 }}>
        <span className="badge primary">Method</span>
        <h1 className="section-title" style={{ marginTop: 12 }}>
          {c.title}
        </h1>
        <p className="section-subtitle">{c.subtitle}</p>
      </section>

      <div className="grid grid-2">
        <section className="card" style={{ padding: 16 }}>
          <h2 className="section-title" style={{ fontSize: 18 }}>
            {c.sections.scoring}
          </h2>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {c.scoringItems.map((item) => (
              <li key={item} className="small" style={{ marginBottom: 8 }}>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="card" style={{ padding: 16 }}>
          <h2 className="section-title" style={{ fontSize: 18 }}>
            {c.sections.source}
          </h2>
          <p className="small muted">{c.sourceText}</p>

          <div className="notice" style={{ marginTop: 10 }}>
            <div className="small">{c.noticeText}</div>
          </div>

          <div className="grid" style={{ gap: 10, marginTop: 12 }}>
            <div className="card soft" style={{ padding: 12 }}>
              <div className="small muted" style={{ fontWeight: 700 }}>
                {c.externalArticle}
              </div>
              <div className="small" style={{ marginTop: 6 }}>
                <a
                  href="https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1679296/full"
                  target="_blank"
                  rel="noreferrer"
                >
                  Frontiers in Public Health
                </a>
              </div>
            </div>

            <div className="card soft" style={{ padding: 12 }}>
              <div className="small muted" style={{ fontWeight: 700 }}>
                {c.externalWorkbook}
              </div>
              <div className="small" style={{ marginTop: 6 }}>
                See provenance-aware source mapping in the repository docs.
              </div>
            </div>
          </div>

          <div className="row" style={{ marginTop: 12 }}>
            <Link className="btn" href={`/${locale}/analyze/`}>
              {c.backToAnalyze}
            </Link>
          </div>
        </section>
      </div>

      <section className="card" style={{ padding: 16, marginTop: 16 }}>
        <h2 className="section-title" style={{ fontSize: 18 }}>
          {c.sections.mapping}
        </h2>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
            <thead>
              <tr>
                {c.mappingHeaders.map((header) => (
                  <th
                    key={header}
                    style={{
                      textAlign: 'left',
                      fontSize: 13,
                      padding: '10px 8px',
                      borderBottom: '1px solid var(--border)',
                      color: 'var(--muted)',
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {c.mappingRows.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, index) => (
                    <td
                      key={`${row[0]}-${index}`}
                      style={{
                        padding: '10px 8px',
                        borderBottom: '1px solid var(--border)',
                        verticalAlign: 'top',
                        fontSize: 13,
                      }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <section className="card" style={{ padding: 16 }}>
          <h2 className="section-title" style={{ fontSize: 18 }}>
            {c.sections.limits}
          </h2>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {c.limits.map((item) => (
              <li key={item} className="small" style={{ marginBottom: 8 }}>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="card" style={{ padding: 16 }}>
          <h2 className="section-title" style={{ fontSize: 18 }}>
            {c.sections.roadmap}
          </h2>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {c.roadmap.map((item) => (
              <li key={item} className="small" style={{ marginBottom: 8 }}>
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
