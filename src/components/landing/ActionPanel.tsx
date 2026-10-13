import React from 'react';
import { Check, RotateCcw, ShieldAlert, X } from 'lucide-react';
import { LIFECYCLE_META, PROVENANCE_META, ProvenanceLabel } from '../../engine/orchestra/types';
import { DAY_MOMENTS } from '../../data/dayOf';
import { sfx } from '../../utils/audio';
import { useReactiveOrchestra } from '../../engine/orchestra/useReactiveOrchestra';

const INK = 'var(--ripple-ink, #1d1d1f)';
const MUTED = 'var(--ripple-muted, #515154)';
const BODY = 'var(--ripple-body, #424245)';

interface ActionPanelProps {
  engine: ReturnType<typeof useReactiveOrchestra>;
}

const ROLES: { id: ActionPanelProps['engine']['actingAs']; label: string }[] = [
  { id: 'planner', label: 'Planner' },
  { id: 'traiteur', label: 'Traiteur' },
  { id: 'temoin', label: 'Témoins' },
  { id: 'maries', label: 'Mariés' },
  { id: 'invite', label: 'Invité' }
];

const fmtTime = (iso: string) => {
  try {
    return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return '';
  }
};

const ProvenanceBadge: React.FC<{ p: ProvenanceLabel }> = ({ p }) => {
  const meta = PROVENANCE_META[p];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
      style={{ background: `${meta.color}22`, color: meta.color, border: `1px solid ${meta.color}44` }}
      title={meta.description}
    >
      {meta.label}
    </span>
  );
};

export const ActionPanel: React.FC<ActionPanelProps> = ({ engine }) => {
  const { moments, pendingProposals, audit, actingAs, actingAsLabel, setActingAs, acceptProposal, rejectProposal, setMomentStatus, resetDemo } = engine;

  // Find the active delayed moment(s) to highlight them.
  const attentionMoments = DAY_MOMENTS.filter((m) => moments[m.id]?.status === 'attention' || moments[m.id]?.status === 'delayed');

  const canAct = actingAs === 'planner' || actingAs === 'traiteur';

  return (
    <section
      aria-label="Régie — Actions et journal"
      className="ripple-card rounded-[22px] p-5 shadow-sm"
    >
      <div className="flex items-center justify-between gap-3 border-b border-black/[0.08] theme-night:border-white/10 pb-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: MUTED }}>
            Régie · Orchestration
          </p>
          <p className="text-[13px] font-semibold mt-0.5" style={{ color: INK }}>
            Connecté en tant que <span style={{ color: '#0A84FF' }}>{actingAsLabel}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            sfx.playBlip(800, 0.04);
            resetDemo();
          }}
          className="pressable inline-flex items-center gap-1 h-8 px-3 rounded-full text-[12px] font-bold ripple-pill"
          title="Réinitialiser la démo"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Démo
        </button>
      </div>

      {/* Role switcher (simulated auth for demo) */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {ROLES.map((r) => {
          const on = actingAs === r.id;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => {
                sfx.playNodeClick();
                setActingAs(r.id);
              }}
              className="pressable h-7 px-2.5 rounded-full text-[11.5px] font-bold transition-colors"
              style={on ? { background: INK, color: 'var(--ripple-surface)' } : { color: MUTED, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.14)' }}
            >
              {r.label}
            </button>
          );
        })}
      </div>

      {/* Pending proposals */}
      {pendingProposals.length > 0 && canAct && (
        <div className="mt-4 space-y-3">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em]" style={{ color: '#5E5CE6' }}>
            <ShieldAlert className="w-3.5 h-3.5" /> Ajustements proposés
          </p>
          {pendingProposals.map((p) => {
            const m = DAY_MOMENTS.find((x) => x.id === p.momentId);
            return (
              <div key={p.id} className="rounded-[14px] p-3.5" style={{ background: 'rgba(94,92,230,0.08)', border: '1px solid rgba(94,92,230,0.25)' }}>
                <p className="text-[14px] font-bold" style={{ color: INK }}>{p.label}</p>
                <p className="text-[12px] mt-0.5 font-medium" style={{ color: MUTED }}>
                  Moment : {m?.at} · {m?.title}
                </p>
                <p className="text-[12.5px] mt-1.5 font-semibold" style={{ color: BODY }}>{p.reason}</p>
                <p className="text-[12.5px] mt-1 font-medium" style={{ color: BODY }}>
                  <span className="font-bold" style={{ color: INK }}>Conséquence :</span> {p.consequence}
                </p>
                {actingAs === 'planner' && (
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        sfx.playSuccess();
                        acceptProposal(p.id);
                      }}
                      className="pressable inline-flex items-center gap-1 h-8 px-3 rounded-full text-[12px] font-bold"
                      style={{ background: '#30D158', color: '#fff' }}
                    >
                      <Check className="w-3.5 h-3.5" /> Accepter
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        sfx.playAlert();
                        rejectProposal(p.id);
                      }}
                      className="pressable inline-flex items-center gap-1 h-8 px-3 rounded-full text-[12px] font-bold"
                      style={{ background: 'rgba(255,69,58,0.1)', color: '#C7342B', border: '1px solid rgba(255,69,58,0.3)' }}
                    >
                      <X className="w-3.5 h-3.5" /> Refuser
                    </button>
                    <span className="text-[10.5px] font-bold ml-auto" style={{ color: MUTED }}>
                      Décision planner requise
                    </span>
                  </div>
                )}
                {actingAs !== 'planner' && (
                  <p className="text-[11px] mt-2 font-semibold" style={{ color: '#9A5B00' }}>
                    ⓘ Seul·e la planner peut valider cet ajustement.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Moments needing attention */}
      {attentionMoments.length > 0 && (
        <div className="mt-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] mb-2" style={{ color: '#FF9F0A' }}>
            Moments sous surveillance
          </p>
          <ul className="space-y-1.5">
            {attentionMoments.map((m) => {
              const rt = moments[m.id];
              const meta = LIFECYCLE_META[rt.status];
              return (
                <li key={m.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="block text-[13px] font-bold truncate" style={{ color: INK }}>
                      {m.at} · {m.title}
                    </span>
                    <span className="block text-[11.5px] font-medium truncate flex items-center gap-1.5" style={{ color: meta.text }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.dot }} />
                      {meta.label}
                      {rt.delayMinutes ? ` · +${rt.delayMinutes} min` : ''}
                    </span>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {rt.status !== 'active' && canAct && (
                      <button
                        type="button"
                        onClick={() => {
                          sfx.playBlip(900, 0.03);
                          setMomentStatus(m.id, 'active');
                        }}
                        className="pressable h-7 px-2 rounded-full text-[11px] font-bold"
                        style={{ background: '#0A84FF', color: '#fff' }}
                      >
                        Démarrer
                      </button>
                    )}
                    {rt.status !== 'completed' && canAct && (
                      <button
                        type="button"
                        onClick={() => {
                          sfx.playSuccess();
                          setMomentStatus(m.id, 'completed');
                        }}
                        className="pressable h-7 px-2 rounded-full text-[11px] font-bold"
                        style={{ background: '#30D158', color: '#fff' }}
                      >
                        Terminé
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Audit log */}
      <div className="mt-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] mb-2" style={{ color: MUTED }}>
          Journal d'audit
        </p>
        <ul className="space-y-2 max-h-[260px] overflow-y-auto no-scrollbar pr-1">
          {audit.slice(0, 12).map((e) => (
            <li key={e.id} className="flex items-start gap-2">
              <span className="text-[11px] font-bold tabular shrink-0 w-[52px]" style={{ color: MUTED }}>
                {fmtTime(e.at)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] font-medium leading-snug" style={{ color: BODY }}>
                  <span className="font-bold" style={{ color: INK }}>{e.actorLabel}</span>
                  {' · '}{e.message}
                </p>
                <span className="mt-0.5"><ProvenanceBadge p={e.provenance} /></span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
