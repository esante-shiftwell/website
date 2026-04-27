'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { getDictionary, type Locale } from '@/i18n';

function isActivePath(
  pathname: string,
  locale: Locale,
  section: 'home' | 'analyze' | 'method' | 'study',
) {
  const base = `/${locale}`;

  if (section === 'home') {
    return pathname === base || pathname === `${base}/`;
  }

  const target = `${base}/${section}`;
  return pathname === target || pathname === `${target}/` || pathname.startsWith(`${target}/`);
}

function subtitle(locale: Locale) {
  if (locale === 'fr') return 'Sommeil, rythmes biologiques, horaires atypiques';
  if (locale === 'de') return 'Schlaf, biologische Rhythmen, atypische Arbeitszeiten';
  return 'Sleep, biological rhythms, atypical schedules';
}

export default function LocaleNav({
  locale,
  title = 'Shiftwell',
}: {
  locale: Locale;
  title?: string;
}) {
  const pathname = usePathname() ?? '/';
  const dict = getDictionary(locale);
  const c = dict.common;

  const navItems: Array<{
    key: 'home' | 'analyze' | 'method' | 'study';
    href: string;
    label: string;
  }> = [
    { key: 'home', href: `/${locale}/`, label: c.home },
    { key: 'analyze', href: `/${locale}/analyze/`, label: c.analyze },
    { key: 'method', href: `/${locale}/method/`, label: c.method },
    { key: 'study', href: `/${locale}/study/`, label: c.study },
  ];

  return (
    <div className="sw-topbar-wrap">
      <div className="sw-topbar-glow" aria-hidden="true" />
      <div className="topbar sw-topbar-nocturne">
        <div className="brand sw-brand-stack">
          <Link
            href={`/${locale}/`}
            aria-label="Shiftwell home"
            style={{ display: 'inline-flex', flex: '0 0 auto' }}
          >
            <div className="sw-logo-shell">
              <Image
                src="/shiftwell-icon.png"
                alt="Shiftwell"
                width={48}
                height={48}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                unoptimized
              />
            </div>
          </Link>

          <div className="sw-brand-copy">
            <div className="brand-name sw-brand-title">{title}</div>
            <div className="small muted sw-brand-subtitle">{subtitle(locale)}</div>
          </div>
        </div>

        <nav className="sw-topbar-links" aria-label="Primary navigation">
          {navItems.map((item) => {
            const active = isActivePath(pathname, locale, item.key);
            return (
              <Link
                key={item.key}
                className={`btn ${
                  item.key === 'analyze' ? 'sw-nav-cta' : active ? 'ghost sw-nav-active' : 'ghost'
                } sw-nav-pill`}
                href={item.href}
                aria-current={active ? 'page' : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
