/*
 * Reactive orchestration hook (Phase 1 vertical slice).
 *
 * Extends the existing useOrchestra clock with:
 *   - Mutable per-moment lifecycle state
 *   - Delay propagation → generates AdjustmentProposals (PREDICTED / PROPOSED)
 *   - Accept / reject actions (CONFIRMED)
 *   - Audit log
 *
 * This is a client-side simulation. There is NO backend. All state lives in
 * React state + localStorage. It uses REAL application state (not just
 * hardcoded animations) so the Ripple visually reflects updates.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { DAY_MOMENTS } from '../../data/dayOf';
import { usePersistentState } from '../../hooks/usePersistentState';
import {
  AdjustmentProposal,
  AuditEntry,
  MomentLifecycle,
  ProvenanceLabel
} from './types';

interface MomentRuntime {
  id: string;
  status: MomentLifecycle;
  /** Current delay in minutes (set by an observation). */
  delayMinutes: number;
}

interface ReactiveOrchestraState {
  moments: Record<string, MomentRuntime>;
  proposals: AdjustmentProposal[];
  audit: AuditEntry[];
  /** Currently acting user (simulated auth for demo). */
  actingAs: 'planner' | 'traiteur' | 'temoin' | 'maries' | 'invite';
}

const INITIAL_LIFECYCLE = (): Record<string, MomentRuntime> => {
  const map: Record<string, MomentRuntime> = {};
  DAY_MOMENTS.forEach((m) => {
    // Pre-seed the existing "+12 min" demo scenario so the delay is real state.
    const preDelay = m.id === 'd7';
    map[m.id] = {
      id: m.id,
      status: preDelay ? 'delayed' : 'confirmed',
      delayMinutes: m.retard ?? 0
    };
  });
  return map;
};

const INITIAL_PROPOSALS: AdjustmentProposal[] = [
  {
    id: 'prop-1',
    momentId: 'd7',
    label: 'Avancer le dessert de 10 min',
    reason: 'Retard traiteur +12 min détecté à 21:08',
    consequence:
      'Pièce montée servie à 23:35 au lieu de 23:45 ; ouverture de bal à 00:00 maintenue.',
    status: 'pending'
  }
];

const INITIAL_AUDIT: AuditEntry[] = [
  {
    id: 'a0',
    at: new Date(2026, 9, 11, 21, 8).toISOString(),
    actorId: 'system',
    actorLabel: 'Régie',
    message: 'Retard traiteur +12 min constaté (observé).',
    provenance: 'observed',
    momentId: 'd7'
  },
  {
    id: 'a1',
    at: new Date(2026, 9, 11, 21, 8, 30).toISOString(),
    actorId: 'system',
    actorLabel: 'Régie',
    message: 'Ajustement proposé : avancer le dessert de 10 min.',
    provenance: 'proposed',
    momentId: 'd7'
  }
];

const ACTOR_LABEL: Record<ReactiveOrchestraState['actingAs'], string> = {
  planner: 'Éléonore (Planner)',
  traiteur: 'Mathilde (Traiteur)',
  temoin: 'Clara & Julien (Témoins)',
  maries: 'Alexandre & Sophie',
  invite: 'Antoine (Invité)'
};

export function useReactiveOrchestra() {
  const [state, setState] = usePersistentState<ReactiveOrchestraState>('ripple.orchestra.v1', {
    moments: INITIAL_LIFECYCLE(),
    proposals: INITIAL_PROPOSALS,
    audit: INITIAL_AUDIT,
    actingAs: 'planner'
  });

  const [, force] = useState(0);
  // Re-render helper after localStorage loads — usePersistentState handles this,
  // but we expose helpers that set state in-place.

  /**
   * Observational update: an authorized role reports a new delay on a moment.
   * Produces predicted consequences and, if needed, a proposal.
   */
  const reportDelay = useCallback(
    (momentId: string, delayMinutes: number, message: string) => {
      setState((s) => {
        const nextMoments = {
          ...s.moments,
          [momentId]: {
            ...s.moments[momentId],
            status: 'delayed' as MomentLifecycle,
            delayMinutes
          }
        };

        // Simple dependency propagation for the demo scenario:
        // If traiteur (d7) is delayed, subsequent moments that depend on it
        // become 'attention' (predicted).
        const nextProposals = [...s.proposals];
        const d7 = DAY_MOMENTS.find((m) => m.id === 'd7');
        if (momentId === 'd7' && d7) {
          const downstreamIds = ['d9', 'd10', 'd14'];
          downstreamIds.forEach((id) => {
            if (!nextMoments[id] || nextMoments[id].status === 'completed') return;
            nextMoments[id] = { ...nextMoments[id], status: 'attention' };
          });
          // Only propose an adjustment if none exists already.
          if (!nextProposals.some((p) => p.momentId === momentId && p.status === 'pending')) {
            nextProposals.push({
              id: `prop-${Date.now()}`,
              momentId,
              label: 'Compenser en raccourcissant le dessert',
              reason: message,
              consequence:
                'Le dessert est avancé ; les moments postérieurs sont décalés mais la marge globale est reconstituée.',
              status: 'pending'
            });
          }
        }

        const entry: AuditEntry = {
          id: `a${Date.now()}`,
          at: new Date().toISOString(),
          actorId: s.actingAs,
          actorLabel: ACTOR_LABEL[s.actingAs],
          message: `${message} (retard +${delayMinutes} min).`,
          provenance: 'observed' as ProvenanceLabel,
          momentId
        };

        return {
          ...s,
          moments: nextMoments,
          proposals: nextProposals,
          audit: [entry, ...s.audit].slice(0, 50)
        };
      });
    },
    [setState]
  );

  /**
   * Mark a moment active / completed (observed).
   */
  const setMomentStatus = useCallback(
    (momentId: string, status: MomentLifecycle) => {
      setState((s) => {
        if (!s.moments[momentId]) return s;
        const nextMoments = {
          ...s.moments,
          [momentId]: { ...s.moments[momentId], status }
        };
        // If we're marking a delayed-or-attention moment as active/completed, clear its 'attention'.
        if (status === 'completed' || status === 'active') {
          Object.keys(nextMoments).forEach((k) => {
            if (nextMoments[k].status === 'attention' && k !== momentId) {
              // Keep attention flag until planner confirms; here we leave it.
            }
          });
        }
        const entry: AuditEntry = {
          id: `a${Date.now()}`,
          at: new Date().toISOString(),
          actorId: s.actingAs,
          actorLabel: ACTOR_LABEL[s.actingAs],
          message: `Le moment passe à l'état « ${status} ».`,
          provenance: 'observed',
          momentId
        };
        return {
          ...s,
          moments: nextMoments,
          audit: [entry, ...s.audit].slice(0, 50)
        };
      });
    },
    [setState]
  );

  /** Accept a proposed adjustment. */
  const acceptProposal = useCallback(
    (proposalId: string) => {
      setState((s) => {
        const prop = s.proposals.find((p) => p.id === proposalId);
        if (!prop || prop.status !== 'pending') return s;
        // Mark proposal accepted.
        const nextProps = s.proposals.map((p) =>
          p.id === proposalId ? { ...p, status: 'accepted' as const } : p
        );
        // Clear 'attention' on downstream moments (plan B absorbs the delay).
        const nextMoments = { ...s.moments };
        Object.keys(nextMoments).forEach((k) => {
          if (nextMoments[k].status === 'attention') {
            nextMoments[k] = { ...nextMoments[k], status: 'confirmed' };
          }
        });
        const entry: AuditEntry = {
          id: `a${Date.now()}`,
          at: new Date().toISOString(),
          actorId: s.actingAs,
          actorLabel: ACTOR_LABEL[s.actingAs],
          message: `Proposition acceptée : ${prop.label}. ${prop.consequence}`,
          provenance: 'confirmed',
          momentId: prop.momentId
        };
        return {
          ...s,
          proposals: nextProps,
          moments: nextMoments,
          audit: [entry, ...s.audit].slice(0, 50)
        };
      });
    },
    [setState]
  );

  /** Reject a proposed adjustment. */
  const rejectProposal = useCallback(
    (proposalId: string) => {
      setState((s) => {
        const prop = s.proposals.find((p) => p.id === proposalId);
        if (!prop || prop.status !== 'pending') return s;
        const nextProps = s.proposals.map((p) =>
          p.id === proposalId ? { ...p, status: 'rejected' as const } : p
        );
        const entry: AuditEntry = {
          id: `a${Date.now()}`,
          at: new Date().toISOString(),
          actorId: s.actingAs,
          actorLabel: ACTOR_LABEL[s.actingAs],
          message: `Proposition refusée : ${prop.label}.`,
          provenance: 'confirmed',
          momentId: prop.momentId
        };
        return {
          ...s,
          proposals: nextProps,
          audit: [entry, ...s.audit].slice(0, 50)
        };
      });
    },
    [setState]
  );

  const setActingAs = useCallback(
    (role: ReactiveOrchestraState['actingAs']) => {
      setState((s) => ({ ...s, actingAs: role }));
    },
    [setState]
  );

  /** Reset to initial demo state (for the demo reset button). */
  const resetDemo = useCallback(() => {
    setState({
      moments: INITIAL_LIFECYCLE(),
      proposals: INITIAL_PROPOSALS,
      audit: INITIAL_AUDIT,
      actingAs: 'planner'
    });
    force((n) => n + 1);
  }, [setState]);

  const pendingProposals = useMemo(
    () => state.proposals.filter((p) => p.status === 'pending'),
    [state.proposals]
  );

  useEffect(() => {
    // Ensure sfx stays in sync with user preference (mute toggle handled elsewhere).
  }, []);

  return {
    state,
    moments: state.moments,
    proposals: state.proposals,
    pendingProposals,
    audit: state.audit,
    actingAs: state.actingAs,
    actingAsLabel: ACTOR_LABEL[state.actingAs],
    setActingAs,
    reportDelay,
    setMomentStatus,
    acceptProposal,
    rejectProposal,
    resetDemo
  };
}
