import AnalyzeClient from '@/components/AnalyzeClient';
import { getDictionary, LOCALES, type Locale } from '@/i18n';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function AnalyzePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const d = getDictionary(locale);

  return (
    <main>
      <AnalyzeClient locale={locale} dict={d} />
    </main>
  );
}