import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isLocale, LOCALES, type Locale } from '@/i18n';
import LocaleNav from '@/components/LocaleNav';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

const content = {
  fr: {
    title: 'Méthodologie',
    subtitle:
      'Comment Shiftwell calcule les scores (version MVP) et comment cela se relie à la base scientifique.',
    sections: {
      scoring: 'Scores (MVP v0.1)',
      source: 'Source scientifique',
      mapping: 'Mapping article ↔ Shiftwell',
      limits: 'Limites actuelles',
      roadmap: 'Roadmap méthodologique',
    },
    scoringItems: [
      'Score Risque (SLI proxy) : score de charge/risque hebdomadaire dérivé de l’agenda travail/sommeil.',
      'Score Sommeil (proxy) : combine durée moyenne de sommeil + proxy de régularité.',
      'Score Adaptabilité (principal) : combine risque inverse + score sommeil (proxy v0.1).',
    ],
    sourceText:
      'La base scientifique du projet repose sur un article de référence en santé publique/chronobiologie. La version MVP implémente une logique proxy pour accélérer le pilote produit, puis sera alignée plus strictement au protocole.',
    mappingRows: [
      ['Heures travaillées', 'Calculé à partir des segments de travail de la semaine', 'Implémenté'],
      ['Longs shifts', 'Nombre de segments de travail longs (proxy seuil)', 'Implémenté (proxy)'],
      ['Récupération', 'Plus longue fenêtre de récupération entre shifts', 'Implémenté (proxy)'],
      ['Night shifts', 'Chevauchement avec fenêtre biologique nuit', 'Implémenté (proxy)'],
      ['Perte biologique', 'Travail dans fenêtre biologique (23h–7h, proxy)', 'Implémenté (proxy)'],
      ['Perte sociale', 'Travail dans fenêtre sociale (proxy)', 'Implémenté (proxy)'],
      ['SRI/TST', 'Proxy régularité + durée totale sommeil', 'Proxy MVP'],
    ],
    limits: [
      'Version actuelle = proxy v0.1 (seuils/pondérations à verrouiller avec le protocole final).',
      'Saisie auto-déclarative (pas d’actigraphie).',
      'Score d’adaptabilité non calibré sur cohorte dans la V1.',
      'Aucune recommandation clinique en sortie (volontairement).',
    ],
    roadmap: [
      'Alignement strict des seuils SLI avec le papier/protocole',
      'Ajout d’une référence moyenne (papier ou cohorte)',
      'Calibration du score d’adaptabilité sur données de cohorte',
      'Évolution vers un vrai calendrier visuel (drag/drop) si besoin',
    ],
  },
  en: {
    title: 'Methodology',
    subtitle:
      'How Shiftwell computes scores (MVP version) and how it relates to the scientific basis.',
    sections: {
      scoring: 'Scores (MVP v0.1)',
      source: 'Scientific source',
      mapping: 'Paper ↔ Shiftwell mapping',
      limits: 'Current limitations',
      roadmap: 'Method roadmap',
    },
    scoringItems: [
      'Risk score (SLI proxy): weekly load/risk score derived from work/sleep schedule.',
      'Sleep score (proxy): combines average sleep duration + regularity proxy.',
      'Adaptability score (main): combines inverse risk + sleep score (proxy v0.1).',
    ],
    sourceText:
      'The scientific basis comes from a chronobiology/public health paper. The MVP currently implements a proxy logic for a fast product pilot, then will be aligned more strictly with the protocol.',
    mappingRows: [
      ['Hours worked', 'Computed from weekly work segments', 'Implemented'],
      ['Long shifts', 'Count of long work segments (proxy threshold)', 'Implemented (proxy)'],
      ['Recovery', 'Longest recovery window between shifts', 'Implemented (proxy)'],
      ['Night shifts', 'Overlap with biological night window', 'Implemented (proxy)'],
      ['Biological loss', 'Work encroachment in biological window (23:00–07:00 proxy)', 'Implemented (proxy)'],
      ['Social loss', 'Work encroachment in social window (proxy)', 'Implemented (proxy)'],
      ['SRI/TST', 'Regularity proxy + total sleep time', 'MVP proxy'],
    ],
    limits: [
      'Current version = proxy v0.1 (thresholds/weights still to be aligned with final protocol).',
      'Self-reported input (no actigraphy).',
      'Adaptability score not cohort-calibrated in V1.',
      'No clinical recommendations in output (intentional).',
    ],
    roadmap: [
      'Strict SLI thresholds alignment with paper/protocol',
      'Add average reference (paper or cohort baseline)',
      'Calibrate adaptability score on cohort data',
      'Move to a true visual calendar grid (drag/drop) if needed',
    ],
  },
  de: {
    title: 'Methodik',
    subtitle:
      'Wie Shiftwell die Scores berechnet (MVP) und wie dies mit der wissenschaftlichen Basis zusammenhängt.',
    sections: {
      scoring: 'Scores (MVP v0.1)',
      source: 'Wissenschaftliche Quelle',
      mapping: 'Mapping Paper ↔ Shiftwell',
      limits: 'Aktuelle Grenzen',
      roadmap: 'Methodik-Roadmap',
    },
    scoringItems: [
      'Risiko-Score (SLI-Proxy): wöchentlicher Belastungs-/Risikoscore aus Arbeits-/Schlafplan.',
      'Schlaf-Score (Proxy): kombiniert mittlere Schlafdauer + Regelmäßigkeits-Proxy.',
      'Anpassungsfähigkeit (Hauptscore): kombiniert inverses Risiko + Schlaf-Score (Proxy v0.1).',
    ],
    sourceText:
      'Die wissenschaftliche Basis stammt aus einem Referenzartikel (Chronobiologie/Public Health). Im MVP wird eine Proxy-Logik verwendet; später erfolgt die strengere Protokoll-Ausrichtung.',
    mappingRows: [
      ['Arbeitsstunden', 'Aus Wochen-Arbeitssegmenten berechnet', 'Implementiert'],
      ['Lange Schichten', 'Anzahl langer Arbeitsschichten (Proxy-Schwelle)', 'Implementiert (Proxy)'],
      ['Erholung', 'Längste Erholungsphase zwischen Schichten', 'Implementiert (Proxy)'],
      ['Nachtschichten', 'Überlappung mit biologischem Nachtfenster', 'Implementiert (Proxy)'],
      ['Biologischer Verlust', 'Arbeit im biologischen Fenster (23–7 Uhr, Proxy)', 'Implementiert (Proxy)'],
      ['Sozialer Verlust', 'Arbeit im sozialen Zeitfenster (Proxy)', 'Implementiert (Proxy)'],
      ['SRI/TST', 'Regelmäßigkeits-Proxy + Gesamtschlafzeit', 'MVP Proxy'],
    ],
    limits: [
      'Aktuelle Version = Proxy v0.1 (Schwellen/Gewichte noch mit Protokoll abzugleichen).',
      'Selbstberichtete Eingaben (keine Aktigraphie).',
      'Anpassungs-Score in V1 nicht auf Kohorte kalibriert.',
      'Keine klinischen Empfehlungen in der Ausgabe (absichtlich).',
    ],
    roadmap: [
      'Strikte SLI-Schwellen am Paper/Protokoll ausrichten',
      'Referenzmittelwert (Paper oder Kohorte) hinzufügen',
      'Anpassungs-Score auf Kohortendaten kalibrieren',
      'Später visuelle Kalenderansicht (Drag/Drop) falls nötig',
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
      <LocaleNav locale={locale}/>

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
            <div className="small">
              <strong>Paper:</strong>{' '}
              <a
                href="https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1679296/full"
                target="_blank"
                rel="noreferrer"
              >
                Frontiers in Public Health (Shiftwork Lifestyle Index related paper)
              </a>
            </div>
          </div>

          <div className="row" style={{ marginTop: 12 }}>
            <Link className="btn" href={`/${locale}/analyze/`}>
              Back to Analyze
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
                {['Article item', 'Shiftwell variable', 'Status'].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: 'left',
                      fontSize: 13,
                      padding: '10px 8px',
                      borderBottom: '1px solid var(--border)',
                      color: 'var(--muted)',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {c.mappingRows.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, i) => (
                    <td
                      key={`${row[0]}-${i}`}
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