import { buildContributionEmail, type ContributionLocale } from './emailCopy';

type ShareResult =
  | { ok: true; mode: 'share'; fileName: string }
  | { ok: true; mode: 'mailto'; fileName: string; truncated: boolean }
  | { ok: false; reason: string };

// Narrowing helper for Web Share API with files
type NavigatorWithFileShare = Navigator & {
  share: (data: ShareData) => Promise<void>;
  canShare: (data: ShareData) => boolean;
};

function hasFileShare(nav: Navigator): nav is NavigatorWithFileShare {
  return typeof (nav as NavigatorWithFileShare).share === 'function'
    && typeof (nav as NavigatorWithFileShare).canShare === 'function';
}

function safeFileName(s: string) {
  return s.replace(/[^a-zA-Z0-9._-]+/g, '-').slice(0, 80);
}

function makeContributionFileName(args: {
  locale: ContributionLocale;
  dateISO?: string;
  prefix?: string; // e.g. "shiftwell"
}) {
  const date = args.dateISO ?? new Date().toISOString().slice(0, 10);
  const prefix = args.prefix ?? 'shiftwell';
  return safeFileName(`${prefix}-${args.locale}-${date}.json`);
}

function downloadJsonFile(json: string, fileName: string) {
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

function canWebShareFile(file: File) {
  if (typeof navigator === 'undefined') return false;
  if (!hasFileShare(navigator)) return false;

  try {
    return navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
}

function wrapJsonForEmail(json: string) {
  // balisage explicite + bloc code (email = plaintext)
  return (
    `\n---- SHIFTWELL JSON BEGIN ----\n` +
    '```json\n' +
    json +
    '\n```\n' +
    `---- SHIFTWELL JSON END ----\n`
  );
}

function truncateForMailto(s: string, maxChars: number) {
  if (s.length <= maxChars) return { text: s, truncated: false };
  return {
    text:
      s.slice(0, Math.max(0, maxChars - 200)) +
      `\n\n[TRUNCATED: payload too large for some mail clients. Attach the .json file instead.]\n`,
    truncated: true,
  };
}

export async function shareOrEmailContribution(args: {
  locale: ContributionLocale;

  payload: unknown;

  scoringVersion: string;
  noticeVersion?: string;

  toEmail?: string; // optional, can be blank
  fileNamePrefix?: string;

  // email body options
  includeJsonInEmail?: boolean; // default true
  maxMailtoChars?: number; // default 12000 (safe-ish)

  // fallback behavior
  downloadOnMailto?: boolean; // default true
}): Promise<ShareResult> {
  if (typeof window === 'undefined') {
    return { ok: false, reason: 'Not in browser context.' };
  }

  const fileName = makeContributionFileName({
    locale: args.locale,
    prefix: args.fileNamePrefix ?? 'shiftwell',
  });

  // pretty JSON: lisible si tu l’ouvres
  const json = JSON.stringify(args.payload, null, 2);

  // 1) Best UX: Web Share with file (mobile)
  try {
    const file = new File([json], fileName, { type: 'application/json' });

    if (typeof navigator !== 'undefined' && hasFileShare(navigator) && canWebShareFile(file)) {
      const mail = buildContributionEmail({
        locale: args.locale,
        scoringVersion: args.scoringVersion,
        noticeVersion: args.noticeVersion,
      });

      await navigator.share({
        title: mail.subject,
        text: mail.intro + mail.attachHint + mail.footer,
        files: [file],
      });

      return { ok: true, mode: 'share', fileName };
    }
  } catch {
    // ignore, fallback below
  }

  // 2) Desktop fallback: download + mailto
  const mail = buildContributionEmail({
    locale: args.locale,
    scoringVersion: args.scoringVersion,
    noticeVersion: args.noticeVersion,
  });

  const includeJson = args.includeJsonInEmail ?? true;
  const maxChars = args.maxMailtoChars ?? 12000;

  let body = mail.intro + mail.attachHint;

  let truncated = false;
  if (includeJson) {
    const wrapped = wrapJsonForEmail(json);
    const t = truncateForMailto(body + wrapped + mail.footer, maxChars);
    body = t.text;
    truncated = t.truncated;
  } else {
    body = body + mail.footer;
  }

  try {
    if (args.downloadOnMailto ?? true) {
      downloadJsonFile(json, fileName);
    }
  } catch {
    // still open mailto
  }

  const mailto =
    `mailto:${encodeURIComponent(args.toEmail ?? '')}` +
    `?subject=${encodeURIComponent(mail.subject)}` +
    `&body=${encodeURIComponent(body)}`;

  try {
    window.location.href = mailto;
    return { ok: true, mode: 'mailto', fileName, truncated };
  } catch {
    return { ok: false, reason: 'Failed to open mail client.' };
  }
}