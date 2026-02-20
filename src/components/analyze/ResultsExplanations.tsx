import type { DerivedMetrics, Locale, Scores } from './types';
import { getExplanations } from './utils';

export default function ResultsExplanations({
  metrics,
  scores,
  locale,
}: {
  metrics: DerivedMetrics;
  scores: Scores;
  locale: Locale;
}) {
  const messages = getExplanations(metrics, scores, locale);

  return (
    <ul style={{ margin: 0, paddingLeft: 18 }}>
      {messages.map((m) => (
        <li key={m} className="small" style={{ marginBottom: 8 }}>
          {m}
        </li>
      ))}
    </ul>
  );
}