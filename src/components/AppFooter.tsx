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
    note: 'Projet de recherche - pas un avis medical',
    localFirst: 'Local-first',
    optIn: 'Contribution opt-in',
    paper: 'Reference externe',
    consent: 'Consentement',
    legal: 'Legal',
    about: 'A propos',
    lang: 'Langue',
    signature: 'Projet open source de recherche en chronobiologie.',
  },
  en: {
    note: 'Research project - not medical advice',
    localFirst: 'Local-first',
    optIn: 'Opt-in contribution',
    paper: 'External reference',
    consent: 'Consent',
    legal: 'Legal',
    about: 'About',
    lang: 'Language',
    signature: 'Open-source chronobiology research project.',
  },
  de: {
    note: 'Forschungsprojekt - keine medizinische Beratung',
    localFirst: 'Local-first',
    optIn: 'Opt-in Beitrag',
    paper: 'Externe Referenz',
    consent: 'Einwilligung',
    legal: 'Rechtliches',
    about: 'Uber',
    lang: 'Sprache',
    signature: 'Open-Source-Forschungsprojekt in Chronobiologie.',
  },
} as const;

function withTrailingSlash(path: string) {
  if (path === '/') return '/';
  return path.endsWith('/') ? path : `${path}/`;
}

function buildLocaleHref(pathname: string, targetLocale: FooterLocale): string {
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return `/${targetLocale}/`;

  const first = segments[0];
  if (LOCALES.includes(first as FooterLocale)) {
    segments[0] = targetLocale;
    if (segments.length === 1) return `/${targetLocale}/`;
    return withTrailingSlash(`/${segments.join('/')}`);
  }

  return `/${targetLocale}/`;
}

export default function AppFooter({
  paperUrl = 'https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1679296/full',
  scoringVersion = 'proxy-v0.1',
}: {
  paperUrl?: string;
  scoringVersion?: string;
}) {
  const pathname = usePathname() ?? '/';
  const locale = detectLocale(pathname);
  const c = locale ? footerCopy[locale] : footerCopy.en;

  return (
    <footer className="sw-footer-wrap">
      <div className="sw-footer-glow" aria-hidden="true" />
      <div className="sw-footer-panel">
        <div className="row sw-footer-main">
          <div className="sw-footer-copy">
            <div className="brand-name sw-footer-title">Shiftwell</div>
            <div className="small muted sw-footer-signature">{c.signature}</div>
            <div className="row" style={{ gap: 8, marginTop: 10 }}>
              <span className="badge primary">{c.localFirst}</span>
              <span className="badge secondary">{c.optIn}</span>
              <span className="badge">{scoringVersion}</span>
            </div>
            <div className="small muted" style={{ marginTop: 10 }}>
              {c.note}
            </div>
          </div>

          <div className="sw-footer-side">
            <div className="sw-footer-secondary">
              {locale ? (
                <>
                  <Link className="sw-footer-link" href={`/${locale}/consent/`}>
                    {c.consent}
                  </Link>
                  <Link className="sw-footer-link" href={`/${locale}/legal/`}>
                    {c.legal}
                  </Link>
                  <Link className="sw-footer-link" href={`/${locale}/about/`}>
                    {c.about}
                  </Link>
                </>
              ) : null}
              <a className="sw-footer-link" href={paperUrl} target="_blank" rel="noreferrer">
                {c.paper}
              </a>
            </div>

            <div className="row sw-footer-actions" style={{ gap: 6, flexWrap: 'wrap' }}>
              {LOCALES.map((lng) => (
                <Link
                  key={lng}
                  className={`btn ${lng === locale ? 'primary' : 'ghost'} sw-nav-pill`}
                  href={buildLocaleHref(pathname, lng)}
                  prefetch={false}
                  onClick={() => {
                    try {
                      localStorage.setItem('shiftwell:locale', lng);
                    } catch {
                      // ignore
                    }
                  }}
                  aria-label={`${c.lang}: ${lng.toUpperCase()}`}
                >
                  {lng.toUpperCase()}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
