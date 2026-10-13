/*
 * Orchestra engine — public types.
 *
 * Phase 1 vertical slice:
 *   - Moments can be in one of six lifecycle states.
 *   - A state change can produce downstream CONSEQUENCES.
 *   - The system PROPOSES adjustments; an authorized user CONFIRMS or REJECTS.
 *   - Every change is recorded in an AUDIT LOG.
 *
 * This intentionally mirrors the vocabulary from the master prompt
 * (OBSERVED / PREDICTED / PROPOSED / CONFIRMED) without claiming
 * multi-user capabilities — it's a single-browser simulation that exercises
 * the real state shape for Phase 3/4.
 */

export type MomentLifecycle =
  | 'planned'
  | 'confirmed'
  | 'active'
  | 'delayed'
  | 'completed'
  | 'cancelled'
  | 'attention';

export const LIFECYCLE_META: Record<
  MomentLifecycle,
  { label: string; dot: string; text: string; provenance: ProvenanceLabel }
> = {
  planned: { label: 'Planifié', dot: '#AEAEB2', text: '#6E6E73', provenance: 'confirmed' },
  confirmed: { label: 'Confirmé', dot: '#30D158', text: '#1E7A39', provenance: 'confirmed' },
  active: { label: 'En cours', dot: '#0A84FF', text: '#005BB5', provenance: 'observed' },
  delayed: { label: 'En retard', dot: '#FF453A', text: '#C7342B', provenance: 'observed' },
  completed: { label: 'Terminé', dot: '#8E8E93', text: '#3A3A3C', provenance: 'observed' },
  cancelled: { label: 'Annulé', dot: '#8E8E93', text: '#6E6E73', provenance: 'confirmed' },
  attention: { label: 'Attention', dot: '#FF9F0A', text: '#9A5B00', provenance: 'predicted' }
};

export type ProvenanceLabel = 'observed' | 'predicted' | 'proposed' | 'confirmed';

export const PROVENANCE_META: Record<
  ProvenanceLabel,
  { label: string; color: string; description: string }
> = {
  observed: {
    label: 'Observé',
    color: '#0A84FF',
    description: 'Un utilisateur ou le système a constaté cet état.'
  },
  predicted: {
    label: 'Prédit',
    color: '#FF9F0A',
    description: 'Le système estime une conséquence possible — pas un fait établi.'
  },
  proposed: {
    label: 'Proposé',
    color: '#5E5CE6',
    description: 'Ajustement suggéré par la régie ; attend votre validation.'
  },
  confirmed: {
    label: 'Confirmé',
    color: '#30D158',
    description: 'Un responsable a validé cet état.'
  }
};

/** A proposed adjustment the organizer can accept or reject. */
export interface AdjustmentProposal {
  id: string;
  /** Moment affected. */
  momentId: string;
  /** What changed. */
  label: string;
  /** Why it's being proposed. */
  reason: string;
  /** Human-readable downstream effect. */
  consequence: string;
  status: 'pending' | 'accepted' | 'rejected';
}

/** Single audit-log entry. */
export interface AuditEntry {
  id: string;
  /** ISO timestamp. */
  at: string;
  actorId: string;
  actorLabel: string;
  message: string;
  provenance: ProvenanceLabel;
  momentId?: string;
}

/** Authorized role identifiers (simulated — no auth yet). */
export type RoleId =
  | 'maries'
  | 'temoin'
  | 'traiteur'
  | 'photographe'
  | 'dj'
  | 'invite'
  | 'planner'
  | 'logistique';
