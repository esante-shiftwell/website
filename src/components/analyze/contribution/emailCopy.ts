export type ContributionLocale = 'fr' | 'en' | 'de';

export function buildContributionEmail(args: {
  locale: ContributionLocale;
  scoringVersion: string;
  noticeVersion?: string;
  dateISO?: string; // YYYY-MM-DD
}) {
  const date = args.dateISO ?? new Date().toISOString().slice(0, 10);
  const notice = args.noticeVersion ? ` · notice ${args.noticeVersion}` : '';

  if (args.locale === 'fr') {
    return {
      subject: `Shiftwell · contribution étude · ${date} · ${args.scoringVersion}${notice}`,
      intro:
        `Bonjour,\n\n` +
        `Je souhaite contribuer à l’étude Shiftwell.\n` +
        `— Date: ${date}\n` +
        `— Version scoring: ${args.scoringVersion}\n` +
        (args.noticeVersion ? `— Version notice: ${args.noticeVersion}\n` : '') +
        `\n`,
      attachHint:
        `Merci de joindre le fichier JSON téléchargé par Shiftwell à cet email.\n`,
      footer: `\nMerci.\n`,
    };
  }

  if (args.locale === 'de') {
    return {
      subject: `Shiftwell · Studienbeitrag · ${date} · ${args.scoringVersion}${notice}`,
      intro:
        `Hallo,\n\n` +
        `ich möchte zur Shiftwell-Studie beitragen.\n` +
        `— Datum: ${date}\n` +
        `— Scoring-Version: ${args.scoringVersion}\n` +
        (args.noticeVersion ? `— Hinweis-Version: ${args.noticeVersion}\n` : '') +
        `\n`,
      attachHint:
        `Bitte hänge die von Shiftwell heruntergeladene JSON-Datei an diese E-Mail an.\n`,
      footer: `\nDanke.\n`,
    };
  }

  return {
    subject: `Shiftwell · study contribution · ${date} · ${args.scoringVersion}${notice}`,
    intro:
      `Hello,\n\n` +
      `I would like to contribute to the Shiftwell study.\n` +
      `— Date: ${date}\n` +
      `— Scoring version: ${args.scoringVersion}\n` +
      (args.noticeVersion ? `— Notice version: ${args.noticeVersion}\n` : '') +
      `\n`,
    attachHint:
      `Please attach the JSON file downloaded by Shiftwell to this email.\n`,
    footer: `\nThanks.\n`,
  };
}