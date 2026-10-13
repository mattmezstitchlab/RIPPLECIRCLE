import React from 'react';
import { AlertTriangle, ArrowDown, Check, GitBranch, RotateCcw, Sparkles } from 'lucide-react';
import { publicRootChain, simulateDelay, type PublicMode, type RepairId } from '../../utils/publicSimulation';

interface Props {
  mode: PublicMode;
  delay: number;
  selectedPlan: RepairId | null;
  onDelay: (delay: number) => void;
  onMode: (mode: PublicMode) => void;
  onSelectPlan: (id: RepairId | null) => void;
}
export const PublicIncidentDemo: React.FC<Props> = ({mode,delay,selectedPlan,onDelay,onMode,onSelectPlan}) => {
  if (mode === 'observe') return null;
  const result = simulateDelay(delay,selectedPlan ?? undefined);
  const chain = publicRootChain();
  return (
    <section className="ripple-demo-explorer" aria-label="Simulation d’un imprévu">
      <div className="ripple-demo-heading">
        <p className="ripple-context-overline"><Sparkles className="w-3.5 h-3.5"/> Atelier expérimental</p>
        <span className="ripple-sim-tag">100 % fictif</span>
      </div>
      {mode === 'trace' ? (
        <div className="ripple-sim-section">
          <h3>Remonter à la première cause</h3>
          <p className="ripple-context-copy">Chemin explicatif préparé pour le scénario. Ce n'est pas une découverte automatique de causalité.</p>
          <ol className="ripple-root-chain">
            {chain.map((step,i) => (
              <li key={step.label}>
                <div><strong>{step.label}</strong><small>{step.status}</small></div>
                {i < chain.length-1 && <ArrowDown className="w-4 h-4"/>}
              </li>
            ))}
          </ol>
          <button type="button" className="ripple-context-action" onClick={() => onMode('simulate')}>Tester un retard</button>
        </div>
      ) : (
        <>
          <div className="ripple-sim-section">
            <h3>Simuler un retard traiteur</h3>
            <label htmlFor="public-demo-delay" className="ripple-context-copy">Variation du retard · <strong>+{delay} min</strong></label>
            <input id="public-demo-delay" aria-label="Retard fictif du traiteur en minutes" type="range" min="0" max="30" step="1" value={delay}
              onChange={e => {onDelay(Number(e.target.value)); onSelectPlan(null);}} className="ripple-instant-slider"/>
            <div className="ripple-demo-presets">
              {[0,5,10,12,18,30].map(n => <button type="button" key={n} onClick={() => {onDelay(n); onSelectPlan(null);}}
                aria-pressed={delay===n} className="ripple-demo-preset">{n===0?'Initial':'+'+n+' min'}</button>)}
            </div>
            <div className="ripple-sim-kpis">
              <div><span>Avant</span><strong>{result.baselineOpening}</strong></div>
              <div><span>Sans réparation</span><strong>{result.disruptedOpening}</strong></div>
              <div><span>Étapes concernées</span><strong>{result.affected.length}</strong></div>
            </div>
          </div>
          <div className="ripple-sim-section">
            <h3>Propagation illustrative</h3>
            <ol className="ripple-sim-affected">{result.affected.map(item =>
              <li key={item.id}><span>{item.label}</span><strong>{item.expected} → {item.shifted}</strong></li>)}</ol>
            <button type="button" className="ripple-context-action" onClick={() => onMode('trace')}>
              <GitBranch className="w-3.5 h-3.5"/> Trouver la première cause
            </button>
          </div>
          {mode === 'repair' ? (
            <div className="ripple-sim-section">
              <h3>Comparer trois réparations</h3>
              <p className="ripple-context-copy">Classement calculé sur le retard restant, le coût fictif et le nombre d'acteurs. Aucun engagement réel.</p>
              <div className="ripple-repair-options">{result.plans.map((plan,index) =>
                <button type="button" key={plan.id} onClick={() => onSelectPlan(selectedPlan===plan.id?null:plan.id)}
                  className="ripple-repair-option" aria-pressed={selectedPlan===plan.id}>
                  <span className="ripple-repair-top"><strong>{plan.title}</strong>{index===0&&<small>Meilleur score fictif</small>}</span>
                  <span>{plan.strategy}</span>
                  <span className="ripple-repair-metrics">Récupère {plan.savedMinutes} min · {plan.budgetEuros} € fictifs · {plan.actors.length} acteurs</span>
                  <span className="ripple-repair-outcome">Bal estimé : {plan.theoreticalOpening} {selectedPlan===plan.id&&<Check className="w-4 h-4"/>}</span>
                </button>
              )}</div>
              {result.applied && (
                <div className="ripple-repair-selected" role="status">
                  <p><Check className="w-4 h-4"/> Plan sélectionné dans la simulation · non exécuté</p>
                  <p>Horaires projetés : ouverture à {result.applied.theoreticalOpening}, soit {result.applied.residualMinutes} min de retard restant.</p>
                  <ul>{result.applied.actions.map(a=><li key={a}>{a}</li>)}</ul>
                </div>
              )}
              <button type="button" className="ripple-context-action" onClick={() => onSelectPlan(null)}><RotateCcw className="w-3.5 h-3.5"/> Effacer le choix</button>
            </div>
          ) : (
            <button type="button" className="ripple-primary-action" onClick={() => onMode('repair')}>
              <AlertTriangle className="w-4 h-4"/> Réparer le planning
            </button>
          )}
        </>
      )}
      <p className="ripple-context-disclaimer">Les horaires et coûts sont des hypothèses déterministes de démonstration. Aucune notification, aucun changement réel et aucun accès au noyau confidentiel.</p>
    </section>
  );
};
