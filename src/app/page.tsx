'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

type Locale = 'fr' | 'en' | 'de';
const LOCALES: Locale[] = ['fr', 'en', 'de'];

function detectPreferredLocale(): Locale {
  try {
    const stored = localStorage.getItem('shiftwell:locale');
    if (stored === 'fr' || stored === 'en' || stored === 'de') return stored;
  } catch {}

  if (typeof navigator !== 'undefined') {
    const lang = (navigator.language || '').toLowerCase();
    if (lang.startsWith('fr')) return 'fr';
    if (lang.startsWith('de')) return 'de';
  }

  return 'en';
}

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const target = detectPreferredLocale();
    router.replace(`/${target}/`);
  }, [router]);

  return (
    <main>
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
            <div className="brand-name">Shiftwell</div>
            <div className="small muted">Language selection</div>
          </div>
        </div>

        <div className="row">
          <span className="badge primary">MVP</span>
          <span className="badge secondary">Circadian Research</span>
        </div>
      </div>

      <section className="card" style={{ padding: 20 }}>
        <h1 className="section-title">Choose your language</h1>
        <p className="section-subtitle">
          If automatic redirection does not trigger, choose a language below.
        </p>

        <div className="row" style={{ marginTop: 14 }}>
          {LOCALES.map((lng) => (
            <Link
              key={lng}
              className={`btn ${lng === 'fr' ? 'primary' : ''}`}
              href={`/${lng}/`}
              onClick={() => {
                try {
                  localStorage.setItem('shiftwell:locale', lng);
                } catch {}
              }}
            >
              {lng.toUpperCase()}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}