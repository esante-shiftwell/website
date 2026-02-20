'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

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
    note: 'Recherche · pas un avis médical',
    localFirst: 'Local',
    optIn: 'Opt-in',
    paper: 'Paper',
    lang: 'Langue',
  },
  en: {
    legal: 'Legal',
    consent: 'Consent',
    method: 'Method',
    study: 'Study',
    about: 'About',
    analyze: 'Analyze',
    note: 'Research · not medical advice',
    localFirst: 'Local',
    optIn: 'Opt-in',
    paper: 'Paper',
    lang: 'Language',
  },
  de: {
    legal: 'Rechtliches',
    consent: 'Einwilligung',
    method: 'Methodik',
    study: 'Studie',
    about: 'Über',
    analyze: 'Analyse',
    note: 'Forschung · keine medizinische Beratung',
    localFirst: 'Lokal',
    optIn: 'Opt-in',
    paper: 'Paper',
    lang: 'Sprache',
  },
} as const;

function buildLocaleHref(pathname: string, targetLocale: FooterLocale): string {
  const hasTrailingSlash = pathname.endsWith('/');
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) {
    return `/${targetLocale}/`;
  }

  const first = segments[0];
  if (LOCALES.includes(first as FooterLocale)) {
    segments[0] = targetLocale;

    // cas "/fr" => on force "/en/"
    if (segments.length === 1) {
      return `/${targetLocale}/`;
    }

    return `/${segments.join('/')}${hasTrailingSlash ? '/' : ''}`;
  }

  // fallback si on est sur une route non localisée
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
    <footer
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: `calc(10px + env(safe-area-inset-bottom, 0px))`,
        zIndex: 40,
        padding: '0 12px',
        pointerEvents: 'none',
      }}
    >
      <div
        className="card glass shadow-md"
        style={{
          maxWidth: 1120,
          margin: '0 auto',
          padding: 10,
          pointerEvents: 'auto',
          borderRadius: 14,
        }}
      >
        <div
          className="row"
          style={{
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          {/* Left: identity + trust */}
          <div className="row" style={{ gap: 8, minWidth: 0 }}>
            <div className="brand-name" style={{ fontSize: 13 }}>
              Shiftwell
            </div>
            <span className="badge primary">{c.localFirst}</span>
            <span className="badge secondary">{c.optIn}</span>
            <div className="small muted" style={{ whiteSpace: 'nowrap' }}>
              {c.note}
            </div>
          </div>

          {/* Center: useful actions */}
          <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
            <span className="badge">
              <strong>{scoringVersion}</strong>
            </span>

            <a
              className="btn ghost"
              href={paperUrl}
              target="_blank"
              rel="noreferrer"
            >
              {c.paper}
            </a>

          </div>

          {/* Right: secondary links + locale switch */}
          <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
            {LOCALES.map((lng) => (
              <Link key={lng} 
                    className={`btn ${lng === locale ? 'primary' : 'ghost'}`}
                                  href={buildLocaleHref(pathname, lng)}>
                {lng.toUpperCase()}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}