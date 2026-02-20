import { notFound } from 'next/navigation';
import { isLocale, LOCALES, type Locale } from '@/i18n';
import LocaleNav from '@/components/LocaleNav';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

const content = {
  fr: {
    title: 'Informations légales & confidentialité',
    subtitle:
      'Page de cadrage juridique pour le MVP Shiftwell. À compléter/valider avant diffusion large (RGPD, cadre institutionnel, contacts).',
    sections: {
      legalNotice: 'Mentions légales',
      privacy: 'Confidentialité (MVP)',
      cookies: 'Cookies / stockage local',
      dataHosting: 'Hébergement & infrastructure',
      limitations: 'Limites / responsabilité',
      contact: 'Contact',
    },
    legalNotice: [
      'Shiftwell est un outil de pré-analyse orienté recherche en chronobiologie.',
      'Le site ne fournit pas de diagnostic médical et ne remplace pas un avis médical.',
      'Les informations éditeur / structure / adresse doivent être ajoutées dans une version institutionnelle.',
    ],
    privacy: [
      'Le score est calculé localement dans le navigateur (MVP).',
      'La contribution à l’étude est optionnelle et soumise à consentement explicite.',
      'Le dataset principal MVP vise une collecte pseudonymisée (sans identité obligatoire).',
      'La base légale, la durée de conservation et les modalités d’exercice des droits doivent être finalisées avec le cadre de recherche.',
    ],
    cookies: [
      'Shiftwell utilise le stockage local du navigateur (localStorage) pour conserver un brouillon de saisie.',
      'Ce stockage reste sur l’appareil de l’utilisateur.',
      'Aucun cookie publicitaire n’est prévu dans le MVP.',
    ],
    dataHosting: [
      'Frontend statique : Next.js export statique (Cloudflare Pages).',
      'Collecte étude (si activée) : endpoint externe configuré (ex: Google Apps Script / Google Form backend).',
      'Le détail exact de l’hébergement des données de collecte doit être documenté dans la notice finale.',
    ],
    limitations: [
      'Les scores affichés dans le MVP sont des scores indicatifs (proxy v0.1).',
      'Aucune recommandation clinique personnalisée n’est fournie.',
      'Le contenu des pages légales/consentement est une base de travail avant validation institutionnelle.',
    ],
    contact:
      'TODO — Ajouter un contact institutionnel (équipe de recherche / structure), et si nécessaire les informations DPO.',
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
      'Legal/consent pages content is a working baseline pending institutional validation.',
    ],
    contact:
      'TODO — Add institutional contact (research team / organization), and DPO details if required.',
  },

  de: {
    title: 'Rechtliche Informationen & Datenschutz',
    subtitle:
      'Rechtlicher Rahmen für das Shiftwell-MVP. Vor breiter Nutzung vervollständigen/validieren (DSGVO, institutioneller Rahmen, Kontakte).',
    sections: {
      legalNotice: 'Rechtliche Hinweise',
      privacy: 'Datenschutz (MVP)',
      cookies: 'Cookies / lokaler Speicher',
      dataHosting: 'Hosting & Infrastruktur',
      limitations: 'Grenzen / Haftung',
      contact: 'Kontakt',
    },
    legalNotice: [
      'Shiftwell ist ein forschungsorientiertes Voranalyse-Tool in der Chronobiologie.',
      'Die Website stellt keine medizinische Diagnose und ersetzt keine ärztliche Beratung.',
      'Angaben zu Herausgeber / Institution / Adresse müssen in einer institutionellen Version ergänzt werden.',
    ],
    privacy: [
      'Die Score-Berechnung erfolgt lokal im Browser (MVP).',
      'Der Studienbeitrag ist optional und erfordert eine ausdrückliche Einwilligung.',
      'Der Hauptdatensatz im MVP ist pseudonymisiert ausgelegt (keine Pflicht-Identität).',
      'Rechtsgrundlage, Aufbewahrungsdauer und Betroffenenrechte müssen mit dem Forschungsrahmen finalisiert werden.',
    ],
    cookies: [
      'Shiftwell verwendet lokalen Browser-Speicher (localStorage) für Entwürfe.',
      'Dieser Speicher verbleibt auf dem Gerät des Nutzers.',
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
    contact:
      'TODO — Institutionellen Kontakt (Forschungsteam / Organisation) und ggf. DPO-Angaben ergänzen.',
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
      <LocaleNav locale={locale} subtitle="Legal · Privacy · MVP framework" />

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
        <section className="card" style={{ padding: 16 }}>
          <h2 className="section-title" style={{ fontSize: 18 }}>
            {c.sections.contact}
          </h2>
          <p className="small muted" style={{ margin: 0 }}>
            {c.contact}
          </p>
        </section>
      </div>
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