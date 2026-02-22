'use client';

import { useMemo } from 'react';
import type { Locale } from '@/components/analyze/types';
import type { ParticipantProfile, WeekSegment } from '@/components/analyze/types';
import type { FormulaMap } from './formulaMap';
import { getNode, getUsedBy } from './formulaMap';

type ExplainState = {
  locale: Locale;
  profile: ParticipantProfile;
  workSegments: WeekSegment[];
  sleepSegments: WeekSegment[];
  derived: any;
  scores: { risk: number; sleep: number; adaptability: number };
};

function ui(locale: Locale) {
  if (locale === 'fr') {
    return {
      title: 'Explicabilité',
      pick: 'Clique un score/une métrique pour voir définition + dépendances.',
      close: 'Fermer',
      open: 'Explain',
      uses: 'Utilise',
      usedBy: 'Utilisé par',
      value: 'Valeur',
      empty: 'Sélectionne un élément.',
    };
  }
  if (locale === 'de') {
    return {
      title: 'Erklärbarkeit',
      pick: 'Klicke Score/Metrik für Definition + Abhängigkeiten.',
      close: 'Schließen',
      open: 'Explain',
      uses: 'Nutzt',
      usedBy: 'Genutzt von',
      value: 'Wert',
      empty: 'Wähle ein Element.',
    };
  }
  return {
    title: 'Explainability',
    pick: 'Click a score/metric to see definition + dependencies.',
    close: 'Close',
    open: 'Explain',
    uses: 'Uses',
    usedBy: 'Used by',
    value: 'Value',
    empty: 'Select an item.',
  };
}

function formatValue(key: string, state: ExplainState): string {
  if (key.startsWith('score.')) {
    const s = key.replace('score.', '') as 'risk' | 'sleep' | 'adaptability';
    const v = state.scores?.[s];
    return typeof v === 'number' ? v.toFixed(1) : '—';
  }

  if (key.startsWith('derived.')) {
    const dk = key.replace('derived.', '');
    const v = state.derived?.[dk];
    if (typeof v !== 'number' || !Number.isFinite(v)) return '—';

    const low = dk.toLowerCase();
    if (low.includes('hours')) return `${(Math.round(v * 10) / 10).toFixed(1)}h`;
    if (low.includes('days')) return `${Math.round(v)}`;
    return (Math.round(v * 10) / 10).toFixed(1);
  }

  if (key === 'schedule.workSegments') return `${state.workSegments?.length ?? 0}`;
  if (key === 'schedule.sleepSegments') return `${state.sleepSegments?.length ?? 0}`;

  if (key.startsWith('profile.')) {
    const pk = key.replace('profile.', '');
    const v = (state.profile as any)?.[pk];
    if (v == null || v === '') return '—';
    return String(v);
  }

  return '—';
}

export default function ExplainSidebar({
  map,
  state,
  focusKey,
  setFocusKey,
  mobileOpen,
  setMobileOpen,
}: {
  map: FormulaMap;
  state: ExplainState;
  focusKey: string | null;
  setFocusKey: (k: string) => void;

  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const c = useMemo(() => ui(state.locale), [state.locale]);

  const node = focusKey ? getNode(map, focusKey) : null;
  const usedBy = useMemo(() => (focusKey ? getUsedBy(map, focusKey) : []), [map, focusKey]);

  const body = (
    <div className="sw-explain-body">
      <div className="sw-explain-title">{c.title}</div>
      <div className="small muted" style={{ marginTop: 6 }}>
        {c.pick}
      </div>

      <div className="divider" />

      {!node ? (
        <div className="notice">
          <div className="small">{c.empty}</div>
        </div>
      ) : (
        <>
          <div className="sw-explain-node">
            <div className="badge secondary">{node.kind}</div>

            <div style={{ marginTop: 8, fontWeight: 900, color: 'var(--ink-2)' }}>
              {node.title[state.locale]}
            </div>

            {node.summary?.[state.locale] ? (
              <div className="small muted" style={{ marginTop: 6 }}>
                {node.summary[state.locale]}
              </div>
            ) : null}

            <div className="divider" />

            <div className="small muted" style={{ fontWeight: 900 }}>
              {c.value}
            </div>
            <div style={{ marginTop: 6, fontWeight: 900 }}>{formatValue(node.key, state)}</div>
          </div>

          <div className="divider" />

          <section>
            <div className="small muted" style={{ fontWeight: 900, marginBottom: 8 }}>
              {c.uses}
            </div>

            <div className="sw-explain-chips">
              {(node.uses ?? []).length === 0 ? (
                <span className="small muted">—</span>
              ) : (
                node.uses!.map((k) => {
                  const n = getNode(map, k);
                  const label = n ? n.title[state.locale] : k;
                  return (
                    <button
                      key={k}
                      type="button"
                      className="sw-explain-chip"
                      onClick={() => setFocusKey(k)}
                      title={k}
                    >
                      {label}
                    </button>
                  );
                })
              )}
            </div>
          </section>

          <section style={{ marginTop: 12 }}>
            <div className="small muted" style={{ fontWeight: 900, marginBottom: 8 }}>
              {c.usedBy}
            </div>

            <div className="sw-explain-chips">
              {usedBy.length === 0 ? (
                <span className="small muted">—</span>
              ) : (
                usedBy.map((n) => (
                  <button
                    key={n.key}
                    type="button"
                    className="sw-explain-chip"
                    onClick={() => setFocusKey(n.key)}
                    title={n.key}
                  >
                    {n.title[state.locale]}
                  </button>
                ))
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );

  return (
    <>
      <aside className="sw-explain-side">{body}</aside>

      <button type="button" className="sw-explain-mobile-btn" onClick={() => setMobileOpen(true)}>
        {c.open}
      </button>

      {mobileOpen ? (
        <div className="sw-explain-mobile-overlay" onMouseDown={() => setMobileOpen(false)}>
          <div className="sw-explain-mobile-drawer" onMouseDown={(e) => e.stopPropagation()}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <div className="brand-name">{c.title}</div>
              <button type="button" className="btn ghost" onClick={() => setMobileOpen(false)}>
                {c.close}
              </button>
            </div>
            <div className="divider" />
            {body}
          </div>
        </div>
      ) : null}
    </>
  );
}