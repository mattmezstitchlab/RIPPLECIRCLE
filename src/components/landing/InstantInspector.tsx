import React from 'react';
import { ArrowRight, Clock3, GitBranch, Music2, Pause, Play, ChevronDown } from 'lucide-react';
import { ProfilePortrait } from './ProfilePortrait';
import type { DayMoment } from '../../data/dayOf';
import { DAY_MOMENTS } from '../../data/dayOf';
import { DEMO_INCIDENT, END_MINUTE, START_MINUTE, shouldShowPublicCascade } from '../../utils/publicTimeline';
import { minutesFrom17ToTime, timeToMinutesFrom17 } from '../../utils/time';

export interface InspectorPerson {
  id: string;
  name: string;
  role: string;
  photo: string;
}
interface Props {
  mode: 'explore' | 'simulate' | 'replay';
  incidentDelay: number;
  planCount: number;
  onSimulate: () => void;
  minute: number;
  selectedKind: string;
  selectedTitle: string;
  moment: DayMoment;
  selectedPerson: InspectorPerson | null;
  contextPeople: InspectorPerson[];
  effectPeople: Partial<Record<string, InspectorPerson>>;
  onPerson: (id: string) => void;
  playingTitle: string | null;
  following: boolean;
  onMinute: (value: number) => void;
  onFollow: () => void;
  onMoment: (id: string) => void;
  tools?: React.ReactNode;
  children?: React.ReactNode;
}

export const InstantInspector: React.FC<Props> = ({
  mode, incidentDelay, planCount, onSimulate, minute, selectedKind, selectedTitle,
  moment, selectedPerson, contextPeople, effectPeople, onPerson, playingTitle,
  following, onMinute, onFollow, onMoment, tools, children
}) => {
  const activeCascade = shouldShowPublicCascade(minute);
  const incident = DAY_MOMENTS.find(m => m.id === DEMO_INCIDENT);
  const isIncident = moment.id === DEMO_INCIDENT;
  const inDemoPath = ['d9','d10','d14'].includes(moment.id) && activeCascade;
  const next = DAY_MOMENTS.find(m => timeToMinutesFrom17(m.at) > minute);
  const contextLabel = selectedKind === 'moment' ? moment.title : selectedTitle;
  const causeText = isIncident
    ? moment.cause ?? 'Source du scénario non renseignée.'
    : inDemoPath ? 'Moment lié au retard traiteur de 21:08 dans le scénario fictif.'
    : selectedKind === 'person'
      ? 'Profil sélectionné ; une relation sociale ne démontre pas une cause.'
      : 'Moment prévu dans le conducteur fictif. Aucune cause démontrée.';
  const effects = isIncident ? moment.impacts ?? [] : [];
  const impacted = isIncident ? effects.length : inDemoPath ? 1 : 0;
  return (
    <section className="ripple-context-panel ripple-v6-inspector" aria-label="Fiche de l’instant sélectionné">
      <div className="ripple-context-header ripple-v6-card-header">
        <div className="min-w-0">
          <p className="ripple-context-overline"><Clock3 className="w-3.5 h-3.5"/> Instants · démonstration</p>
          <p className="ripple-context-time" data-testid="explored-time">{minutesFrom17ToTime(minute)}</p>
        </div>
        <span className="ripple-v6-status">{mode === 'explore' ? 'Explorer' : mode === 'simulate' ? 'Et si ?' : 'Rejouer'}</span>
      </div>
      <div className="ripple-v6-summary">
        <div className="ripple-v6-summary-heading">
          <div className="min-w-0">
            <p className="ripple-context-caption">À cet instant</p>
            <h2 className="ripple-context-title">{selectedPerson ? selectedPerson.name : contextLabel}</h2>
            <p className="ripple-context-hint">
              {selectedPerson ? selectedPerson.role + ' · ' + moment.title : moment.lieu}
            </p>
          </div>
          {selectedPerson && <ProfilePortrait name={selectedPerson.name} src={selectedPerson.photo} size="large" />}
        </div>
        {isIncident && (
          <div className="ripple-v6-kpis" aria-label="Résumé du scénario fictif">
            <div><span>Retard</span><strong>+{mode === 'explore' ? moment.retard ?? 0 : incidentDelay} min</strong></div>
            <div><span>Impactés</span><strong>{impacted} rôles</strong></div>
            <div><span>Solutions</span><strong>{planCount} plans</strong></div>
          </div>
        )}
        {contextPeople.length > 0 && (
          <div className="ripple-context-people" aria-label="Personnes de ce moment">
            <p className="ripple-context-caption">Personnes concernées</p>
            {contextPeople.map(p => (
              <button key={p.id} type="button" className="ripple-context-person"
                onClick={() => onPerson(p.id)} aria-label={'Consulter ' + p.name}>
                <span className="ripple-person-text"><strong>{p.name}</strong><small>{p.role}</small></span>
                <ProfilePortrait name={p.name} src={p.photo} size="small" />
              </button>
            ))}
          </div>
        )}
        {playingTitle && <p className="ripple-context-meta"><Music2 className="w-3.5 h-3.5"/>{playingTitle}</p>}
        {mode === 'explore' && isIncident && (
          <button type="button" className="ripple-v6-primary" onClick={onSimulate}>
            Et si le retard changeait ? <ArrowRight className="w-4 h-4"/>
          </button>
        )}
      </div>
      <details className="ripple-v6-context-details">
        <summary>Comprendre cet instant <ChevronDown className="w-4 h-4" aria-hidden="true"/></summary>
        <div className="ripple-v6-context-detail-body">
          <p className="ripple-context-caption">Pourquoi ?</p>
          <p className="ripple-context-copy">{causeText}</p>
          <p className="ripple-context-caption mt-4">Conséquences</p>
          {effects.length ? (
            <ul className="ripple-effects-list">
              {effects.map((effect,i) => {
                const linked = effectPeople[effect.role];
                return <li key={effect.role + i} className="ripple-effect-person">
                  <span className="ripple-effect-copy"><strong>{effect.role}</strong>{effect.text}</span>
                  {linked && (
                    <button type="button" className="ripple-effect-avatar" onClick={() => onPerson(linked.id)}
                      aria-label={'Consulter ' + linked.name}>
                      <ProfilePortrait name={linked.name} src={linked.photo} size="small"/>
                    </button>
                  )}
                </li>;
              })}
            </ul>
          ) : <p className="ripple-context-copy">{inDemoPath ? 'Dépendance scénarisée ; effet détaillé non recalculé.' : 'Aucun impact établi pour cet instant.'}</p>}
          {isIncident && moment.planB && <p className="ripple-context-copy mt-3">Plan B fictif : {moment.planB}</p>}
          <div className="ripple-v6-context-links">
            {activeCascade && incident && !isIncident && (
              <button type="button" className="ripple-context-action" onClick={() => onMoment(incident.id)}>
                <GitBranch className="w-3.5 h-3.5"/> Voir la cause
              </button>
            )}
            {next && <button type="button" className="ripple-context-action" onClick={() => onMoment(next.id)}>
              Moment suivant <ArrowRight className="w-3.5 h-3.5"/>
            </button>}
          </div>
        </div>
      </details>
      {tools && <div className="ripple-context-extra ripple-v6-tools">{tools}</div>}
      <details className="ripple-v6-context-details ripple-v6-more">
        <summary>Voir le détail et les réglages <ChevronDown className="w-4 h-4" aria-hidden="true"/></summary>
        <div className="ripple-v6-more-body">
          <label className="ripple-timeline-label" htmlFor="ripple-instant-range">
            <span>15:00</span><span>Explorer l’heure</span><span>05:00 +1</span>
          </label>
          <input id="ripple-instant-range" aria-label="Explorer le temps du programme" type="range"
            min={START_MINUTE} max={END_MINUTE} step={1} value={minute}
            onChange={e => onMinute(Number(e.target.value))} className="ripple-instant-slider"/>
          <button type="button" onClick={onFollow} aria-pressed={following} className="ripple-live-button">
            {following ? <Pause className="w-3.5 h-3.5"/> : <Play className="w-3.5 h-3.5"/>}
            {following ? 'Arrêter le suivi' : 'Suivre la régie'}
          </button>
          {children}
        </div>
      </details>
      <p className="ripple-context-disclaimer">Données fictives · aucun envoi, aucune décision réelle.</p>
    </section>
  );
};
