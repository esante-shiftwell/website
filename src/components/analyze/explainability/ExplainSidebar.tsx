'use client';

import { useMemo } from 'react';
import type { Locale, ParticipantProfile, WeekSegment } from '@/components/analyze/types';
import type { DerivedMetrics } from './types';
import type { FormulaMap } from './formulaMap';
import { getNode, getUsedBy } from './formulaMap';

type ExplainState = {
  locale: Locale;
  profile: ParticipantProfile;
  workSegments: WeekSegment[];
  sleepSegments: WeekSegment[];
  derived: DerivedMetrics;
  scores: { risk: number; sleep: number; adaptability: number };
};

function ui(locale: Locale) {
  if (locale === 'fr') {
    return {
      title: 'Explicabilite',
      pick: 'Clique un score ou une metrique pour voir definition, dependances et references.',
      close: 'Fermer',
      open: 'Explain',
      uses: 'Utilise',
      usedBy: 'Utilise par',
      value: 'Valeur',
      evidence: 'References',
      empty: 'Selectionne un element.',
    };
  }
  if (locale === 'de') {
    return {
      title: 'Erklarbarkeit',
      pick: 'Klicke auf Score oder Metrik fur Definition, Abhangigkeiten und Referenzen.',
      close: 'Schliessen',
      open: 'Explain',
      uses: 'Nutzt',
      usedBy: 'Genutzt von',
      value: 'Wert',
      evidence: 'Referenzen',
      empty: 'Wahle ein Element.',
    };
  }
  return {
    title: 'Explainability',
    pick: 'Click a score or metric to see definition, dependencies, and references.',
    close: 'Close',
    open: 'Explain',
    uses: 'Uses',
    usedBy: 'Used by',
    value: 'Value',
    evidence: 'References',
    empty: 'Select an item.',
  };
}

function formatValue(key: string, state: ExplainState): string {
  if (key.startsWith('score.')) {
    const s = key.replace('score.', '') as 'risk' | 'sleep' | 'adaptability';
    const v = state.scores?.[s];
    return typeof v === 'number' ? v.toFixed(1) : '--';
  }

  if (key.startsWith('derived.')) {
    const dk = key.replace('derived.', '');
    const derivedRec = state.derived as unknown as Record<string, unknown>;
    const v = derivedRec[dk];
    if (typeof v !== 'number' || !Number.isFinite(v)) return '--';

    const low = dk.toLowerCase();
    if (low.includes('hours')) return `${(Math.round(v * 10) / 10).toFixed(1)}h`;
    if (low.includes('days')) return `${Math.round(v)}`;
    return (Math.round(v * 10) / 10).toFixed(1);
  }

  if (key === 'schedule.workSegments') return `${state.workSegments?.length ?? 0}`;
  if (key === 'schedule.sleepSegments') return `${state.sleepSegments?.length ?? 0}`;

  if (key.startsWith('profile.')) {
    const pk = key.replace('profile.', '');
    const rec = state.profile as unknown as Record<string, unknown>;
    const v = rec[pk];
    if (v == null || v === '') return '--';
    return String(v);
  }

  return '--';
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
                <span className="small muted">--</span>
              ) : (
                node.uses!.map((k) => {
                  const nextNode = getNode(map, k);
                  const label = nextNode ? nextNode.title[state.locale] : k;
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
                <span className="small muted">--</span>
              ) : (
                usedBy.map((nextNode) => (
                  <button
                    key={nextNode.key}
                    type="button"
                    className="sw-explain-chip"
                    onClick={() => setFocusKey(nextNode.key)}
                    title={nextNode.key}
                  >
                    {nextNode.title[state.locale]}
                  </button>
                ))
              )}
            </div>
          </section>

          <section style={{ marginTop: 12 }}>
            <div className="small muted" style={{ fontWeight: 900, marginBottom: 8 }}>
              {c.evidence}
            </div>

            <div className="sw-explain-chips">
              {(node.evidence ?? []).length === 0 ? (
                <span className="small muted">--</span>
              ) : (
                node.evidence!.map((item) =>
                  item.url ? (
                    <a
                      key={item.id}
                      className="sw-explain-chip"
                      href={item.url}
                      target={item.url.startsWith('http') ? '_blank' : undefined}
                      rel={item.url.startsWith('http') ? 'noreferrer' : undefined}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <span key={item.id} className="sw-explain-chip ghost" title={item.id}>
                      {item.label}
                    </span>
                  ),
                )
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
          <div className="sw-explain-mobile-drawer" onMouseDown={(event) => event.stopPropagation()}>
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
