import Link from 'next/link';
import type { Locale } from '@/i18n';

export default function LocaleNav({
    locale,
    title = 'Shiftwell',
    subtitle,
}: {
    locale: Locale;
    title?: string;
    subtitle?: string;
}) {
    return (
        <div className="topbar">
            <div className="brand">
                <div
                    style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        overflow: 'hidden',
                        border: '1px solid var(--border)',
                        background: 'linear-gradient(160deg, var(--primary), var(--secondary))',
                    }}
                />
                <div>
                    <div className="brand-name">{title}</div>
                    {subtitle ? <div className="small muted">{subtitle}</div> : null}
                </div>
            </div>

            <div className="row">
                <Link className="btn ghost" href={`/${locale}/`}>
                    Home
                </Link>
                <Link className="btn ghost" href={`/${locale}/analyze/`}>
                    Analyze
                </Link>
                <Link className="btn ghost" href={`/${locale}/method/`}>
                    Method
                </Link>
                <Link className="btn ghost" href={`/${locale}/study/`}>
                    Study
                </Link>
                <Link className="btn ghost" href={`/${locale}/consent/`}>
                    Consent
                </Link>
                <Link className="btn ghost" href={`/${locale}/legal/`}>
                    Legal
                </Link>
                <Link className="btn ghost" href={`/${locale}/about/`}>
                    About
                </Link>
            </div>
        </div>
    );
}