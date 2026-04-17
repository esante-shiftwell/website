import { notFound } from 'next/navigation';
import { isLocale, LOCALES, type Locale } from '@/i18n';
import LocaleNav from '@/components/LocaleNav';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

const NOTICE_VERSION = 'notice-v0.1';

const content = {
  fr: {
    title: "Notice d'information (participation etude)",
    subtitle:
      'Version de travail pour le MVP. A faire valider par la partenaire medicale / cadre RGPD avant diffusion large.',
    sections: {
      controller: 'Responsable / cadre de l etude',
      purpose: 'Finalite',
      data: 'Donnees traitees',
      legal: 'Base de participation',
      rights: 'Vos droits',
      withdrawal: 'Retrait du consentement',
      contact: 'Contact',
      provenance: 'Cadre de provenance',
    },
    body: {
      controller:
        'Projet Shiftwell (cadre de recherche en chronobiologie). Completer ici les informations institutionnelles et de contact une fois finalisees.',
      purpose:
        'Structurer la collecte d un agenda travail/sommeil hebdomadaire et de variables minimales afin d analyser l adaptabilite aux horaires atypiques dans un cadre de recherche.',
      data: [
        'Agenda travail/sommeil sur 7 jours',
        'Metier (categorie), tranche d age, sexe (si retenu)',
        'Reponses complementaires (mode long)',
        'Scores calcules et metadonnees de version (scoring / notice)',
        'Aucune identite obligatoire dans le dataset principal du MVP',
      ],
      legal:
        'La contribution a l etude est optionnelle et repose sur un consentement explicite recueilli separement dans l interface, apres calcul local du score.',
      rights: [
        'Acces aux informations communiquees',
        'Rectification (selon les modalites retenues pour le dataset)',
        'Retrait du consentement',
        'Information sur la conservation et la suppression (a preciser dans la version finalisee)',
      ],
      withdrawal:
        'Le retrait du consentement doit etre possible via un contact dedie ou un canal defini dans la version finale de la notice. Ajouter ici la procedure operationnelle.',
      contact:
        'TODO - Ajouter le contact de l equipe de recherche (email institutionnel) et, si necessaire, les informations DPO / structure.',
      provenance:
        'Les references scientifiques externes mobilisees pour le scoring et l explicabilite restent des oeuvres tierces. Le projet ne revendique ni paternite ni propriete sur ces contenus.',
    },
  },
  en: {
    title: 'Participant information notice (study contribution)',
    subtitle:
      'Working version for MVP. To be validated by the medical partner / GDPR framework before broad use.',
    sections: {
      controller: 'Study owner / framework',
      purpose: 'Purpose',
      data: 'Processed data',
      legal: 'Participation basis',
      rights: 'Your rights',
      withdrawal: 'Withdrawal of consent',
      contact: 'Contact',
      provenance: 'Provenance framework',
    },
    body: {
      controller:
        'Shiftwell project (chronobiology research context). Complete institutional and contact information here once finalized.',
      purpose:
        'Structure the collection of a weekly work/sleep schedule and minimal variables to analyze adaptability to atypical schedules in a research setting.',
      data: [
        '7-day work/sleep schedule',
        'Profession (category), age band, sex (if retained)',
        'Additional answers (long mode)',
        'Computed scores and version metadata (scoring / notice)',
        'No mandatory identity in the MVP main dataset',
      ],
      legal:
        'Study contribution is optional and relies on explicit consent collected separately in the interface, after local score computation.',
      rights: [
        'Access to submitted information',
        'Rectification (depending on chosen dataset design)',
        'Withdrawal of consent',
        'Information about retention and deletion (to be detailed in final notice)',
      ],
      withdrawal:
        'Consent withdrawal must be possible through a dedicated contact or channel defined in the final notice. Add the operational process here.',
      contact:
        'TODO - Add research team contact (institutional email) and, if needed, DPO / institution information.',
      provenance:
        'External scientific references used for scoring and explainability remain third-party works. Shiftwell does not claim authorship or ownership over those materials.',
    },
  },
  de: {
    title: 'Teilnehmerinformation (Studienbeitrag)',
    subtitle:
      'Arbeitsversion fur das MVP. Vor breiter Nutzung durch medizinische Partner / DSGVO-Rahmen validieren.',
    sections: {
      controller: 'Verantwortung / Studienrahmen',
      purpose: 'Zweck',
      data: 'Verarbeitete Daten',
      legal: 'Grundlage der Teilnahme',
      rights: 'Ihre Rechte',
      withdrawal: 'Widerruf der Einwilligung',
      contact: 'Kontakt',
      provenance: 'Provenienzrahmen',
    },
    body: {
      controller:
        'Shiftwell-Projekt (chronobiologischer Forschungskontext). Institutionelle Angaben und Kontaktdaten hier erganzen, sobald final.',
      purpose:
        'Strukturierte Erhebung eines Wochenplans Arbeit/Schlaf und minimaler Variablen zur Analyse der Anpassungsfahigkeit an atypische Arbeitszeiten im Forschungsrahmen.',
      data: [
        '7-Tage Arbeits-/Schlafplan',
        'Beruf (Kategorie), Altersgruppe, Geschlecht (falls vorgesehen)',
        'Zusatzantworten (Langmodus)',
        'Berechnete Scores und Versions-Metadaten (Scoring / Notice)',
        'Keine verpflichtende Identitat im Hauptdatensatz des MVP',
      ],
      legal:
        'Der Studienbeitrag ist optional und basiert auf einer ausdrucklichen Einwilligung, die nach der lokalen Score-Berechnung separat eingeholt wird.',
      rights: [
        'Auskunft uber ubermittelte Informationen',
        'Berichtigung (je nach Datensatzdesign)',
        'Widerruf der Einwilligung',
        'Information zu Aufbewahrung/Loschung (in finaler Notice zu prazisieren)',
      ],
      withdrawal:
        'Der Widerruf der Einwilligung muss uber einen definierten Kontakt/Kanal moglich sein. Hier den operativen Prozess in der finalen Version erganzen.',
      contact:
        'TODO - Kontakt des Forschungsteams (institutionelle E-Mail) und ggf. DPO/Institution erganzen.',
      provenance:
        'Externe wissenschaftliche Referenzen fur Scoring und Erklarbarkeit bleiben Werke Dritter. Shiftwell beansprucht weder Autorschaft noch Eigentum an diesen Materialien.',
    },
  },
} as const;

export default async function ConsentPage({
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
        <span className="badge warn">{NOTICE_VERSION}</span>
        <h1 className="section-title" style={{ marginTop: 12 }}>
          {c.title}
        </h1>
        <p className="section-subtitle">{c.subtitle}</p>
      </section>

      <div className="grid grid-2">
        <Section title={c.sections.controller}>
          <p className="small muted">{c.body.controller}</p>
        </Section>

        <Section title={c.sections.purpose}>
          <p className="small muted">{c.body.purpose}</p>
        </Section>

        <Section title={c.sections.data}>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {c.body.data.map((item) => (
              <li key={item} className="small" style={{ marginBottom: 8 }}>
                {item}
              </li>
            ))}
          </ul>
        </Section>

        <Section title={c.sections.legal}>
          <p className="small muted">{c.body.legal}</p>
        </Section>

        <Section title={c.sections.rights}>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {c.body.rights.map((item) => (
              <li key={item} className="small" style={{ marginBottom: 8 }}>
                {item}
              </li>
            ))}
          </ul>
        </Section>

        <Section title={c.sections.withdrawal}>
          <p className="small muted">{c.body.withdrawal}</p>
        </Section>
      </div>

      <section className="card" style={{ padding: 16, marginTop: 16 }}>
        <h2 className="section-title" style={{ fontSize: 18 }}>
          {c.sections.provenance}
        </h2>
        <p className="small muted" style={{ marginBottom: 0 }}>
          {c.body.provenance}
        </p>
      </section>

      <section className="card" style={{ padding: 16, marginTop: 16 }}>
        <h2 className="section-title" style={{ fontSize: 18 }}>
          {c.sections.contact}
        </h2>
        <p className="small muted" style={{ margin: 0 }}>
          {c.body.contact}
        </p>
      </section>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card" style={{ padding: 16 }}>
      <h2 className="section-title" style={{ fontSize: 18 }}>
        {title}
      </h2>
      {children}
    </section>
  );
}
