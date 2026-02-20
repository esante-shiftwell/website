import Link from 'next/link';
import { getDictionary, LOCALES, type Locale } from '@/i18n';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleHomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const d = getDictionary(locale);

  return (
    <main>
      <h1>Shiftwell ({locale})</h1>
      <p>{d.home.title}</p>
      <Link href={`/${locale}/analyse/`}>Go analyze</Link>
    </main>
  );
}