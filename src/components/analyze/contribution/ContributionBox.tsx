'use client';

import { useMemo, useState } from 'react';
import type { CollectorState, Locale } from '@/components/analyze/types';
import { shareOrEmailContribution } from '@/components/analyze/contribution';

function ui(locale: Locale) {
  if (locale === 'fr') {
    return {
      title: "Contribution à l’étude",
      subtitle:
        "Local-first : Shiftwell ne collecte rien automatiquement. Tu partages manuellement un fichier JSON (email / partage).",
      consent: "J’accepte explicitement de contribuer à l’étude Shiftwell (voir notice).",
      anon: "Inclure un identifiant anonyme (recommandé).",
      notice: 'Notice',
      scoring: 'Scoring',
      recipient: 'Destinataire',
      recipientAuto: "Ton app mail te demandera un destinataire.",
      recipientHint: "Si tu préfères le faire à la main : télécharge le JSON, puis joins-le à un email.",
      copyEmail: 'Copier l’email',
      emailCopied: 'Email copié.',
      share: 'Partager ma contribution',
      download: 'Télécharger JSON',
      copy: 'Copier JSON',
      copied: 'JSON copié.',
      downloaded: 'JSON téléchargé.',
      preview: 'Aperçu JSON',
      hide: 'Masquer',
      show: 'Afficher',
      required: "Consentement requis pour contribuer.",
      sentShare: 'Partage ouvert.',
      sentMail: 'Email ouvert.',
      truncated:
        "Le JSON est trop long pour certains clients mail : utilise la pièce jointe téléchargée.",
      error: 'Impossible d’ouvrir le partage/email.',
    };
  }

  if (locale === 'de') {
    return {
      title: 'Studienbeitrag',
      subtitle:
        'Local-first: Shiftwell sammelt nichts automatisch. Du teilst eine JSON-Datei manuell (E-Mail / Teilen).',
      consent: 'Ich willige ausdrücklich ein, zur Shiftwell-Studie beizutragen (siehe Hinweis).',
      anon: 'Anonyme ID einschließen (empfohlen).',
      notice: 'Hinweis',
      scoring: 'Scoring',
      recipient: 'Empfänger',
      recipientAuto: 'Deine Mail-App fragt nach einem Empfänger.',
      recipientHint:
        'Wenn du es manuell machen willst: JSON herunterladen und an eine E-Mail anhängen.',
      copyEmail: 'E-Mail kopieren',
      emailCopied: 'E-Mail kopiert.',
      share: 'Beitrag teilen',
      download: 'JSON herunterladen',
      copy: 'JSON kopieren',
      copied: 'JSON kopiert.',
      downloaded: 'JSON heruntergeladen.',
      preview: 'JSON Vorschau',
      hide: 'Ausblenden',
      show: 'Anzeigen',
      required: 'Einwilligung erforderlich.',
      sentShare: 'Teilen geöffnet.',
      sentMail: 'E-Mail geöffnet.',
      truncated:
        'JSON ist zu lang für manche Mail-Apps: bitte die heruntergeladene Datei anhängen.',
      error: 'Teilen/E-Mail konnte nicht geöffnet werden.',
    };
  }

  return {
    title: 'Study contribution',
    subtitle:
      'Local-first: Shiftwell does not auto-collect. You manually share a JSON file (email / share).',
    consent: 'I explicitly consent to contribute to the Shiftwell study (see notice).',
    anon: 'Include an anonymous ID (recommended).',
    notice: 'Notice',
    scoring: 'Scoring',
    recipient: 'Recipient',
    recipientAuto: 'Your mail app will ask for a recipient.',
    recipientHint: 'If you prefer manual: download the JSON and attach it to an email.',
    copyEmail: 'Copy email',
    emailCopied: 'Email copied.',
    share: 'Share contribution',
    download: 'Download JSON',
    copy: 'Copy JSON',
    copied: 'JSON copied.',
    downloaded: 'JSON downloaded.',
    preview: 'JSON preview',
    hide: 'Hide',
    show: 'Show',
    required: 'Consent required.',
    sentShare: 'Share opened.',
    sentMail: 'Email opened.',
    truncated: 'JSON is too large for some mail clients: attach the downloaded file instead.',
    error: 'Could not open share/email.',
  };
}

function safePreview(json: string, max = 1800) {
  if (json.length <= max) return { text: json, clipped: false };
  return { text: json.slice(0, max) + '\n…', clipped: true };
}

type Msg = { kind: 'ok' | 'warn' | 'err'; text: string };

export default function ContributionBox({
  locale,
  scoringVersion,
  noticeVersion,
  payload,
  collector,
  setCollector,
  onCopyJson,
  onDownloadJson,
  studyEmail,
}: {
  locale: Locale;
  scoringVersion: string;
  noticeVersion?: string;

  payload: unknown;

  collector: CollectorState;
  setCollector: (updater: (c: CollectorState) => CollectorState) => void;

  onCopyJson: () => Promise<void> | void;
  onDownloadJson: () => void;

  // ✅ passe une vraie adresse ici si tu en as une ; sinon laisse undefined
  studyEmail?: string;
}) {
  const c = useMemo(() => ui(locale), [locale]);

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const prettyJson = useMemo(() => JSON.stringify(payload, null, 2), [payload]);
  const preview = useMemo(() => safePreview(prettyJson), [prettyJson]);

  function flash(next: Msg) {
    setMsg(next);
    window.setTimeout(() => setMsg((m) => (m === next ? null : m)), 2200);
  }

  async function handleShare() {
    if (!collector.consent) {
      setMsg({ kind: 'warn', text: c.required });
      return;
    }

    try {
      setBusy(true);
      setMsg(null);

      const res = await shareOrEmailContribution({
        locale,
        payload,
        scoringVersion,
        noticeVersion,
        // ✅ IMPORTANT: no default fake email
        toEmail: (studyEmail ?? '').trim(),
        includeJsonInEmail: true,
        maxMailtoChars: 12000,
        downloadOnMailto: true,
      });

      if (!res.ok) {
        setMsg({ kind: 'err', text: c.error });
        return;
      }

      if (res.mode === 'share') {
        setMsg({ kind: 'ok', text: c.sentShare });
      } else {
        setMsg({
          kind: res.truncated ? 'warn' : 'ok',
          text: res.truncated ? c.truncated : c.sentMail,
        });
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleCopyJson() {
    try {
      await onCopyJson();
      flash({ kind: 'ok', text: c.copied });
    } catch {
      setMsg({ kind: 'err', text: c.error });
    }
  }

  function handleDownloadJson() {
    try {
      onDownloadJson();
      flash({ kind: 'ok', text: c.downloaded });
    } catch {
      setMsg({ kind: 'err', text: c.error });
    }
  }

  async function handleCopyEmail() {
    if (!studyEmail) return;
    try {
      await navigator.clipboard.writeText(studyEmail);
      flash({ kind: 'ok', text: c.emailCopied });
    } catch {
      setMsg({ kind: 'err', text: c.error });
    }
  }

  return (
    <section className="card" style={{ padding: 14, marginTop: 14 }}>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="badge primary">{c.title}</div>
          <h3 style={{ margin: '10px 0 6px' }}>{c.title}</h3>
          <p className="small muted" style={{ margin: 0 }}>
            {c.subtitle}
          </p>
        </div>

        <div className="row" style={{ gap: 8 }}>
          <span className="badge">
            {c.scoring}: <strong>{scoringVersion}</strong>
          </span>
          {noticeVersion ? (
            <span className="badge">
              {c.notice}: <strong>{noticeVersion}</strong>
            </span>
          ) : null}
        </div>
      </div>

      <div className="divider" />

      <div className="grid grid-2" style={{ gap: 12 }}>
        <div>
          <label className="small" style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <input
              type="checkbox"
              checked={collector.consent}
              onChange={(e) => setCollector((prev) => ({ ...prev, consent: e.target.checked }))}
              style={{ marginTop: 2 }}
            />
            <span>{c.consent}</span>
          </label>

          <div style={{ height: 8 }} />

          <label className="small" style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <input
              type="checkbox"
              checked={collector.includeAnonymousId}
              onChange={(e) =>
                setCollector((prev) => ({ ...prev, includeAnonymousId: e.target.checked }))
              }
              style={{ marginTop: 2 }}
            />
            <span>{c.anon}</span>
          </label>
        </div>

        <div>
          <div className="small muted" style={{ fontWeight: 900, marginBottom: 6 }}>
            {c.recipient}
          </div>

          <div className="notice" style={{ padding: 10 }}>
            <div className="small" style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ minWidth: 0 }}>
                {studyEmail ? (
                  <strong style={{ wordBreak: 'break-word' }}>{studyEmail}</strong>
                ) : (
                  <span className="muted">{c.recipientAuto}</span>
                )}
                <div className="small muted" style={{ marginTop: 6 }}>
                  {c.recipientHint}
                </div>
              </div>

              {studyEmail ? (
                <button type="button" className="btn ghost" onClick={handleCopyEmail}>
                  {c.copyEmail}
                </button>
              ) : null}
            </div>
          </div>

          <div className="row" style={{ marginTop: 10, gap: 8 }}>
            <button
              type="button"
              className="btn primary"
              onClick={handleShare}
              disabled={busy || !collector.consent}
              title={!collector.consent ? c.required : undefined}
            >
              {busy ? '…' : c.share}
            </button>

            <button type="button" className="btn" onClick={handleDownloadJson}>
              {c.download}
            </button>

            <button type="button" className="btn" onClick={handleCopyJson}>
              {c.copy}
            </button>
          </div>

          {msg ? (
            <div
              className={`notice ${msg.kind === 'warn' ? 'warn' : msg.kind === 'err' ? 'error' : ''}`}
              style={{ marginTop: 10 }}
            >
              <div className="small">{msg.text}</div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="divider" />

      <button type="button" className="btn ghost" onClick={() => setShowPreview((v) => !v)}>
        {c.preview} · {showPreview ? c.hide : c.show}
      </button>

      {showPreview ? (
        <div className="card soft" style={{ padding: 12, marginTop: 10 }}>
          <pre
            className="small"
            style={{
              margin: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontFamily:
                'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            }}
          >
            {preview.text}
          </pre>
          {preview.clipped ? <div className="small muted" style={{ marginTop: 8 }}>…</div> : null}
        </div>
      ) : null}
    </section>
  );
}