import { notFound } from 'next/navigation';
import { isLocale, LOCALES, type Locale } from '@/i18n';
import LocaleNav from '@/components/LocaleNav';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

const content = {
  fr: {
    title: 'Informations legales & confidentialite',
    subtitle:
      'Page de cadrage juridique pour le MVP Shiftwell. A completer/valider avant diffusion large (RGPD, cadre institutionnel, contacts).',
    sections: {
      legalNotice: 'Mentions legales',
      privacy: 'Confidentialite (MVP)',
      cookies: 'Cookies / stockage local',
      dataHosting: 'Hebergement & infrastructure',
      limitations: 'Limites / responsabilite',
      provenance: 'Provenance des references',
      contact: 'Contact',
    },
    legalNotice: [
      'Shiftwell est un outil de pre-analyse oriente recherche en chronobiologie.',
      'Le site ne fournit pas de diagnostic medical et ne remplace pas un avis medical.',
      'Les informations editeur / structure / adresse doivent etre ajoutees dans une version institutionnelle.',
    ],
    privacy: [
      'Le score est calcule localement dans le navigateur (MVP).',
      'La contribution a l etude est optionnelle et soumise a consentement explicite.',
      'Le dataset principal MVP vise une collecte pseudonymisee (sans identite obligatoire).',
      'La base legale, la duree de conservation et les modalites d exercice des droits doivent etre finalisees avec le cadre de recherche.',
    ],
    cookies: [
      'Shiftwell utilise le stockage local du navigateur (localStorage) pour conserver un brouillon de saisie.',
      'Ce stockage reste sur l appareil de l utilisateur.',
      'Aucun cookie publicitaire n est prevu dans le MVP.',
    ],
    dataHosting: [
      'Frontend statique : Next.js export statique (Cloudflare Pages).',
      'Collecte etude (si activee) : endpoint externe configure (ex: Google Apps Script / Google Form backend).',
      'Le detail exact de l hebergement des donnees de collecte doit etre documente dans la notice finale.',
    ],
    limitations: [
      'Les scores affiches dans le MVP sont des scores indicatifs (proxy v0.1).',
      'Aucune recommandation clinique personnalisee n est fournie.',
      'Le contenu des pages legales/consentement est une base de travail avant validation institutionnelle.',
    ],
    provenance: [
      'Certaines regles de scoring et d explicabilite peuvent referencer des travaux scientifiques externes.',
      'Ces references restent des oeuvres tierces et ne sont pas des contenus auteurs par Shiftwell.',
      'Les copies locales ou extractions presentes dans le repo servent uniquement a l implementation, la revue interne et la tracabilite.',
    ],
    contact:
      'TODO - Ajouter un contact institutionnel (equipe de recherche / structure), et si necessaire les informations DPO.',
  },

  en: {
    title: 'Legal information & privacy',
    subtitle:
      'Legal framing page for the Shiftwell MVP. To be completed/validated before broad release (GDPR, institutional framework, contacts).',
    sections: {
      legalNotice: 'Legal notice',
      privacy: 'Privacy (MVP)',
      cookies: 'Cookies / local storage',
      dataHosting: 'Hosting & infrastructure',
      limitations: 'Limitations / liability',
      provenance: 'Reference provenance',
      contact: 'Contact',
    },
    legalNotice: [
      'Shiftwell is a research-oriented pre-analysis tool in chronobiology.',
      'The site does not provide medical diagnosis and does not replace medical advice.',
      'Publisher / institution / address details must be added in an institutional version.',
    ],
    privacy: [
      'Score computation is performed locally in the browser (MVP).',
      'Study contribution is optional and requires explicit consent.',
      'The MVP main dataset targets pseudonymized collection (no mandatory identity).',
      'Legal basis, retention period and data subject rights process must be finalized with the research framework.',
    ],
    cookies: [
      'Shiftwell uses browser local storage (localStorage) to save a draft.',
      'This storage remains on the user device.',
      'No advertising cookies are planned in the MVP.',
    ],
    dataHosting: [
      'Static frontend: Next.js static export (Cloudflare Pages).',
      'Study collection (if enabled): configured external endpoint (e.g. Google Apps Script / Google Form backend).',
      'Exact hosting details for collected data must be documented in the final notice.',
    ],
    limitations: [
      'Displayed scores in the MVP are indicative scores (proxy v0.1).',
      'No personalized clinical recommendation is provided.',
      'Legal/consent page content is a working baseline pending institutional validation.',
    ],
    provenance: [
      'Some scoring and explainability rules may reference external scientific works.',
      'Those references remain third-party works and are not authored by Shiftwell.',
      'Local copies or extracted artifacts in the repository are used only for implementation, internal review, and traceability.',
    ],
    contact:
      'TODO - Add institutional contact (research team / organization), and DPO details if required.',
  },

  de: {
    title: 'Rechtliche Informationen & Datenschutz',
    subtitle:
      'Rechtlicher Rahmen fur das Shiftwell-MVP. Vor breiter Nutzung vervollstandigen/validieren (DSGVO, institutioneller Rahmen, Kontakte).',
    sections: {
      legalNotice: 'Rechtliche Hinweise',
      privacy: 'Datenschutz (MVP)',
      cookies: 'Cookies / lokaler Speicher',
      dataHosting: 'Hosting & Infrastruktur',
      limitations: 'Grenzen / Haftung',
      provenance: 'Referenz-Provenienz',
      contact: 'Kontakt',
    },
    legalNotice: [
      'Shiftwell ist ein forschungsorientiertes Voranalyse-Tool in der Chronobiologie.',
      'Die Website stellt keine medizinische Diagnose und ersetzt keine arztliche Beratung.',
      'Angaben zu Herausgeber / Institution / Adresse mussen in einer institutionellen Version erganzt werden.',
    ],
    privacy: [
      'Die Score-Berechnung erfolgt lokal im Browser (MVP).',
      'Der Studienbeitrag ist optional und erfordert eine ausdruckliche Einwilligung.',
      'Der Hauptdatensatz im MVP ist pseudonymisiert ausgelegt (keine Pflicht-Identitat).',
      'Rechtsgrundlage, Aufbewahrungsdauer und Betroffenenrechte mussen mit dem Forschungsrahmen finalisiert werden.',
    ],
    cookies: [
      'Shiftwell verwendet lokalen Browser-Speicher (localStorage) fur Entwurfe.',
      'Dieser Speicher verbleibt auf dem Gerat des Nutzers.',
      'Im MVP sind keine Werbe-Cookies vorgesehen.',
    ],
    dataHosting: [
      'Statisches Frontend: Next.js Static Export (Cloudflare Pages).',
      'Studienerhebung (falls aktiv): konfigurierter externer Endpunkt (z. B. Google Apps Script / Google Form Backend).',
      'Das genaue Hosting der erhobenen Daten muss in der finalen Notice dokumentiert werden.',
    ],
    limitations: [
      'Die im MVP angezeigten Scores sind indikative Scores (Proxy v0.1).',
      'Es werden keine personalisierten klinischen Empfehlungen gegeben.',
      'Die Inhalte der Legal-/Consent-Seiten sind eine Arbeitsgrundlage bis zur institutionellen Validierung.',
    ],
    provenance: [
      'Einige Scoring- und Erklarbarkeitsregeln konnen auf externe wissenschaftliche Arbeiten verweisen.',
      'Diese Referenzen bleiben Werke Dritter und werden nicht von Shiftwell verfasst.',
      'Lokale Kopien oder extrahierte Artefakte im Repository dienen nur der Implementierung, internen Prufung und Nachvollziehbarkeit.',
    ],
    contact:
      'TODO - Institutionellen Kontakt (Forschungsteam / Organisation) und ggf. DPO-Angaben erganzen.',
  },
} as const;

export default async function LegalPage({
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
        <span className="badge primary">Legal</span>
        <h1 className="section-title" style={{ marginTop: 12 }}>
          {c.title}
        </h1>
        <p className="section-subtitle">{c.subtitle}</p>
      </section>

      <div className="grid grid-2">
        <Section title={c.sections.legalNotice} items={c.legalNotice} />
        <Section title={c.sections.privacy} items={c.privacy} />
        <Section title={c.sections.cookies} items={c.cookies} />
        <Section title={c.sections.dataHosting} items={c.dataHosting} />
      </div>

      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <Section title={c.sections.limitations} items={c.limitations} />
        <Section title={c.sections.provenance} items={c.provenance} />
      </div>

      <section className="card" style={{ padding: 16, marginTop: 16 }}>
        <h2 className="section-title" style={{ fontSize: 18 }}>
          {c.sections.contact}
        </h2>
        <p className="small muted" style={{ margin: 0 }}>
          {c.contact}
        </p>
      </section>
    </main>
  );
}

function Section({
  title,
  items,
}: {
  title: string;
  items: readonly string[];
}) {
  return (
    <section className="card" style={{ padding: 16 }}>
      <h2 className="section-title" style={{ fontSize: 18 }}>
        {title}
      </h2>
      <ul style={{ margin: 0, paddingLeft: 18 }}>
        {items.map((item) => (
          <li key={item} className="small" style={{ marginBottom: 8 }}>
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
