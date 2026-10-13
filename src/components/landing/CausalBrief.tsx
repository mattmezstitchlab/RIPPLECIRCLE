import React, { useState } from 'react';
import { Activity, ArrowRight, ChevronDown } from 'lucide-react';
import { DayMoment } from '../../data/dayOf';

interface Props {
  incident: DayMoment;
  onSelect: () => void;
}

/** Causalité toujours visible, détails à la demande, jamais présentée comme un incident réel. */
export const CausalBrief: React.FC<Props> = ({ incident, onSelect }) => {
  const [expanded, setExpanded] = useState(false);
  const impactCount = incident.impacts?.length ?? 0;
  return (
    <section className="ripple-causal-brief p-4 rounded-[14px] space-y-3" aria-label="Causalité">
      <div className="flex items-center justify-between gap-2">
        <p className="inline-flex items-center gap-1.5 text-[11px] font-extrabold tracking-[0.08em] uppercase" style={{ color: 'var(--ripple-ink,#1d1d1f)' }}>
          <Activity className="w-4 h-4 text-[#FF9F0A]" /> Causalité
        </p>
        <span className="text-[10px] uppercase font-bold tracking-wide opacity-60">Scénario simulé</span>
      </div>
      <button type="button" onClick={onSelect} className="block text-left w-full group">
        <p className="text-[13px] leading-snug font-bold" style={{ color: 'var(--ripple-ink,#1d1d1f)' }}>
          {incident.at} · {incident.title}
          <ArrowRight className="inline w-3 h-3 ml-1 opacity-50 group-hover:opacity-100" />
        </p>
      </button>
      <div className="ripple-causal-flow" aria-label="Cause, conséquences et plan B">
        <span className="ripple-causal-marker">Cause</span>
        <p className="text-[12px] leading-snug line-clamp-2">{incident.cause ?? 'Événement identifié'}</p>
        <span className="ripple-causal-marker">Effets · {impactCount}</span>
        <p className="text-[12px] leading-snug">{incident.impacts?.slice(0, 2).map(i => i.role).join(' · ') || 'Aucun impact documenté'}</p>
        <span className="ripple-causal-marker">Plan B</span>
        <p className="text-[12px] leading-snug line-clamp-2">{incident.planB ?? 'À confirmer'}</p>
      </div>
      {impactCount > 0 && (
        <>
          <button
            type="button"
            aria-expanded={expanded}
            onClick={() => setExpanded(v => !v)}
            className="w-full flex items-center justify-between py-1 text-[12px] font-bold"
          >
            {expanded ? 'Masquer les conséquences' : `Voir les ${impactCount} conséquences`}
            <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
          {expanded && (
            <ul className="space-y-2 border-t pt-3 text-[12px]" style={{ borderColor: 'var(--ripple-line,rgba(0,0,0,.1))' }}>
              {incident.impacts?.map((i, index) => (
                <li key={`${i.role}-${index}`} className="leading-snug"><strong className="uppercase text-[10px]">{i.role}</strong> · {i.text}</li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
};
