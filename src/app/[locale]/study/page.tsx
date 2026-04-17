import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isLocale, LOCALES, type Locale } from '@/i18n';
import LocaleNav from '@/components/LocaleNav';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

const content = {
  fr: {
    title: 'Etude & participation',
    subtitle:
      'Informations sur le cadre de participation a l etude Shiftwell (chronobiologie, horaires atypiques).',
    sections: {
      purpose: 'Objectif',
      who: 'Qui peut participer',
      data: 'Donnees collectees (MVP)',
      process: 'Processus de contribution',
      duration: 'Duree estimee',
      provenance: 'Provenance & references',
    },
    purpose:
      'Shiftwell vise a structurer la collecte de donnees agenda travail/sommeil pour analyser l adaptabilite aux horaires atypiques dans un cadre de recherche en chronobiologie.',
    who: [
      'Professionnels avec horaires atypiques (sante, securite, transport/logistique, industrie, restauration, etc.)',
      'Travail de nuit, roulement, horaires irreguliers ou fractionnes',
      'Participation volontaire',
    ],
    data: [
      'Agenda hebdomadaire (segments travail/sommeil)',
      'Metier (categorie)',
      'Tranche d age',
      'Sexe (si retenu dans le protocole final)',
      'Reponses complementaires (mode long)',
      'Scores calcules (proxy v0.1)',
      'Aucune identite obligatoire dans le dataset principal (MVP)',
    ],
    process: [
      '1. L utilisateur remplit son agenda et calcule son score localement.',
      '2. Le score est affiche sans obligation de contribution.',
      '3. L utilisateur peut ensuite contribuer a l etude (opt-in).',
      '4. Consentement explicite requis avant envoi.',
      '5. Les versions (scoring/notice) sont attachees a l envoi.',
    ],
    duration: ['Mode court : ~2 a 4 minutes', 'Mode long : ~5 a 8 minutes (MVP cible)'],
    provenance:
      'Les regles de scoring et d explicabilite peuvent s appuyer sur des references scientifiques tierces et sur des copies locales de travail. Ces contenus externes ne sont pas des documents auteurs par Shiftwell.',
    ctas: {
      analyze: 'Analyse',
      consent: 'Notice de consentement',
    },
  },
  en: {
    title: 'Study & participation',
    subtitle:
      'Information about participation in the Shiftwell study (chronobiology, atypical schedules).',
    sections: {
      purpose: 'Purpose',
      who: 'Who can participate',
      data: 'Collected data (MVP)',
      process: 'Contribution process',
      duration: 'Estimated duration',
      provenance: 'Provenance & references',
    },
    purpose:
      'Shiftwell aims to structure work/sleep schedule data collection to study adaptability to atypical working hours in a chronobiology research context.',
    who: [
      'Professionals with atypical schedules (healthcare, security, transport/logistics, industry, hospitality, etc.)',
      'Night shifts, rotating shifts, irregular or split schedules',
      'Voluntary participation',
    ],
    data: [
      'Weekly schedule (work/sleep segments)',
      'Profession (category)',
      'Age band',
      'Sex (if retained in final protocol)',
      'Additional answers (long mode)',
      'Computed scores (proxy v0.1)',
      'No mandatory identity in the main dataset (MVP)',
    ],
    process: [
      '1. User enters schedule and computes score locally.',
      '2. Score is shown without requiring contribution.',
      '3. User may then opt in and contribute to the study.',
      '4. Explicit consent is required before sending.',
      '5. Versioning (scoring/notice) is attached to submission.',
    ],
    duration: ['Short mode: ~2 to 4 minutes', 'Long mode: ~5 to 8 minutes (MVP target)'],
    provenance:
      'Scoring and explainability rules may rely on third-party scientific references and local working copies. Those external materials are not authored or owned by Shiftwell.',
    ctas: {
      analyze: 'Analyze',
      consent: 'Consent notice',
    },
  },
  de: {
    title: 'Studie & Teilnahme',
    subtitle:
      'Informationen zur Teilnahme an der Shiftwell-Studie (Chronobiologie, atypische Arbeitszeiten).',
    sections: {
      purpose: 'Ziel',
      who: 'Wer kann teilnehmen',
      data: 'Erhobene Daten (MVP)',
      process: 'Ablauf der Teilnahme',
      duration: 'Geschatzte Dauer',
      provenance: 'Provenienz & Referenzen',
    },
    purpose:
      'Shiftwell strukturiert die Erhebung von Arbeits-/Schlafplanen, um die Anpassungsfahigkeit an atypische Arbeitszeiten im Rahmen chronobiologischer Forschung zu untersuchen.',
    who: [
      'Berufstatige mit atypischen Arbeitszeiten (Pflege, Sicherheit, Logistik, Industrie, Gastronomie usw.)',
      'Nachtarbeit, Schichtrotation, unregelmassige oder geteilte Zeiten',
      'Freiwillige Teilnahme',
    ],
    data: [
      'Wochenplan (Arbeits-/Schlafsegmente)',
      'Beruf (Kategorie)',
      'Altersgruppe',
      'Geschlecht (falls im finalen Protokoll vorgesehen)',
      'Zusatzfragen (Langmodus)',
      'Berechnete Scores (Proxy v0.1)',
      'Keine Pflicht-Identitat im Hauptdatensatz (MVP)',
    ],
    process: [
      '1. Nutzer gibt Plan ein und berechnet den Score lokal.',
      '2. Der Score wird ohne Beitragspflicht angezeigt.',
      '3. Danach kann freiwillig zur Studie beigetragen werden (Opt-in).',
      '4. Vor dem Senden ist eine ausdruckliche Einwilligung erforderlich.',
      '5. Versionen (Scoring/Notice) werden an die Ubermittlung angehangt.',
    ],
    duration: ['Kurzmodus: ~2 bis 4 Minuten', 'Langmodus: ~5 bis 8 Minuten (MVP-Ziel)'],
    provenance:
      'Scoring- und Erklarningsregeln konnen sich auf wissenschaftliche Drittquellen und lokale Arbeitskopien stutzen. Diese externen Materialien werden nicht von Shiftwell verfasst oder besessen.',
    ctas: {
      analyze: 'Analyse',
      consent: 'Einwilligungsnotice',
    },
  },
} as const;

export default async function StudyPage({
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
        <span className="badge secondary">Study</span>
        <h1 className="section-title" style={{ marginTop: 12 }}>
          {c.title}
        </h1>
        <p className="section-subtitle">{c.subtitle}</p>
      </section>

      <div className="grid grid-2">
        <section className="card" style={{ padding: 16 }}>
          <h2 className="section-title" style={{ fontSize: 18 }}>
            {c.sections.purpose}
          </h2>
          <p className="small muted">{c.purpose}</p>

          <div className="divider" />

          <h3 style={{ marginTop: 0 }}>{c.sections.who}</h3>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {c.who.map((item) => (
              <li key={item} className="small" style={{ marginBottom: 8 }}>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="card" style={{ padding: 16 }}>
          <h2 className="section-title" style={{ fontSize: 18 }}>
            {c.sections.data}
          </h2>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {c.data.map((item) => (
              <li key={item} className="small" style={{ marginBottom: 8 }}>
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <section className="card" style={{ padding: 16 }}>
          <h2 className="section-title" style={{ fontSize: 18 }}>
            {c.sections.process}
          </h2>
          <ol style={{ margin: 0, paddingLeft: 18 }}>
            {c.process.map((item) => (
              <li key={item} className="small" style={{ marginBottom: 8 }}>
                {item}
              </li>
            ))}
          </ol>
        </section>

        <section className="card" style={{ padding: 16 }}>
          <h2 className="section-title" style={{ fontSize: 18 }}>
            {c.sections.duration}
          </h2>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {c.duration.map((item) => (
              <li key={item} className="small" style={{ marginBottom: 8 }}>
                {item}
              </li>
            ))}
          </ul>

          <div className="divider" />

          <h3 style={{ marginTop: 0 }}>{c.sections.provenance}</h3>
          <p className="small muted" style={{ marginBottom: 0 }}>
            {c.provenance}
          </p>

          <div className="divider" />

          <div className="row">
            <Link className="btn primary" href={`/${locale}/analyze/`}>
              {c.ctas.analyze}
            </Link>
            <Link className="btn" href={`/${locale}/consent/`}>
              {c.ctas.consent}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
