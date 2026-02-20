'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LOCALES = ['fr', 'en', 'de'] as const;
type FooterLocale = (typeof LOCALES)[number];

function detectLocale(pathname: string): FooterLocale | null {
  const first = pathname.split('/').filter(Boolean)[0];
  return LOCALES.includes(first as FooterLocale) ? (first as FooterLocale) : null;
}

const footerCopy = {
  fr: {
    legal: 'Légal',
    consent: 'Consentement',
    method: 'Méthode',
    study: 'Étude',
    about: 'À propos',
    analyze: 'Analyse',
    note: 'Outil de recherche / pré-analyse · Pas un avis médical',
  },
  en: {
    legal: 'Legal',
    consent: 'Consent',
    method: 'Method',
    study: 'Study',
    about: 'About',
    analyze: 'Analyze',
    note: 'Research / pre-analysis tool · Not medical advice',
  },
  de: {
    legal: 'Rechtliches',
    consent: 'Einwilligung',
    method: 'Methodik',
    study: 'Studie',
    about: 'Über',
    analyze: 'Analyse',
    note: 'Forschungs-/Voranalyse-Tool · Keine medizinische Beratung',
  },
} as const;

export default function AppFooter() {
  const pathname = usePathname();
  const locale = detectLocale(pathname ?? '/');

  const c = locale ? footerCopy[locale] : footerCopy.en;

  return (
    <footer
      style={{
        marginTop: 24,
        padding: '18px 24px 28px',
      }}
    >
      <div
        className="card soft"
        style={{
          maxWidth: 1120,
          margin: '0 auto',
          padding: 14,
        }}
      >
        <div
          className="row"
          style={{
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 12,
          }}
        >
          <div>
            <div className="brand-name" style={{ fontSize: 14 }}>
              Shiftwell
            </div>
            <div className="small muted" style={{ marginTop: 4 }}>
              {c.note}
            </div>
          </div>

          <div className="row" style={{ gap: 8 }}>
            {locale ? (
              <>
                <Link className="btn ghost" href={`/${locale}/analyze/`}>
                  {c.analyze}
                </Link>
                <Link className="btn ghost" href={`/${locale}/method/`}>
                  {c.method}
                </Link>
                <Link className="btn ghost" href={`/${locale}/study/`}>
                  {c.study}
                </Link>
                <Link className="btn ghost" href={`/${locale}/consent/`}>
                  {c.consent}
                </Link>
                <Link className="btn ghost" href={`/${locale}/legal/`}>
                  {c.legal}
                </Link>
                <Link className="btn ghost" href={`/${locale}/about/`}>
                  {c.about}
                </Link>
              </>
            ) : (
              <>
                <Link className="btn ghost" href="/fr/">
                  FR
                </Link>
                <Link className="btn ghost" href="/en/">
                  EN
                </Link>
                <Link className="btn ghost" href="/de/">
                  DE
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}