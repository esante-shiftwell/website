'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { getDictionary, type Locale } from '@/i18n';

function isActivePath(pathname: string, locale: Locale, section: 'home' | 'analyze' | 'method' | 'study' | 'consent' | 'legal' | 'about') {
  const base = `/${locale}`;

  if (section === 'home') {
    return pathname === base || pathname === `${base}/`;
  }

  const target = `${base}/${section}`;
  return pathname === target || pathname === `${target}/` || pathname.startsWith(`${target}/`);
}

export default function LocaleNav({
  locale,
  title = 'Shiftwell',
  subtitle,
}: {
  locale: Locale;
  title?: string;
  subtitle?: string;
}) {
  const pathname = usePathname() ?? '/';
  const dict = getDictionary(locale);
  const c = dict.common;

  const navItems: Array<{
    key: 'home' | 'analyze' | 'method' | 'study' | 'consent' | 'legal' | 'about';
    href: string;
    label: string;
  }> = [
    { key: 'home', href: `/${locale}/`, label: c.home },
    { key: 'analyze', href: `/${locale}/analyze/`, label: c.analyze },
    { key: 'method', href: `/${locale}/method/`, label: c.method },
    { key: 'study', href: `/${locale}/study/`, label: c.study },
    { key: 'consent', href: `/${locale}/consent/`, label: c.consent },
    { key: 'legal', href: `/${locale}/legal/`, label: c.legal },
    { key: 'about', href: `/${locale}/about/`, label: c.about },
  ];

  return (
    <div className="topbar">
      <div className="brand">
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            overflow: 'hidden',
            border: '1px solid var(--border)',
            background: '#0f172a',
          }}
        >
          <Image
            src="/shiftwell-icon.png"
            alt="Shiftwell"
            width={40}
            height={40}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            unoptimized
          />
        </div>

        <div>
          <div className="brand-name">{title}</div>
          <div className="small muted">{subtitle ?? dict.tagline}</div>
        </div>
      </div>

      <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
        {navItems.map((item) => {
          const active = isActivePath(pathname, locale, item.key);
          return (
            <Link
              key={item.key}
              className={`btn ${active ? 'primary' : 'ghost'}`}
              href={item.href}
              aria-current={active ? 'page' : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}