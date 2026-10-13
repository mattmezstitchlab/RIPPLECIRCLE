import React from 'react';
import { ArrowRight, Clock3, GitBranch, Music2, Pause, Play, Users } from 'lucide-react';
import type { DayMoment } from '../../data/dayOf';
import { DAY_MOMENTS } from '../../data/dayOf';
import { DEMO_INCIDENT, END_MINUTE, START_MINUTE, shouldShowPublicCascade } from '../../utils/publicTimeline';
import { minutesFrom17ToTime, timeToMinutesFrom17 } from '../../utils/time';

interface Props {
  minute: number;
  selectedKind: string;
  selectedTitle: string;
  moment: DayMoment;
  people: string[];
  playingTitle: string | null;
  following: boolean;
  onMinute: (value: number) => void;
  onFollow: () => void;
  onMoment: (id: string) => void;
  children?: React.ReactNode;
}

export const InstantInspector: React.FC<Props> = ({
  minute, selectedKind, selectedTitle, moment, people, playingTitle,
  following, onMinute, onFollow, onMoment, children
}) => {
  const activeCascade = shouldShowPublicCascade(minute);
  const incident = DAY_MOMENTS.find(m => m.id === DEMO_INCIDENT);
  const isIncident = moment.id === DEMO_INCIDENT;
  const inDemoPath = ['d9','d10','d14'].includes(moment.id) && activeCascade;
  const next = DAY_MOMENTS.find(m => timeToMinutesFrom17(m.at) > minute);
  const contextLabel = selectedKind === 'moment' ? moment.title : selectedTitle;
  const causeText = isIncident
    ? moment.cause ?? 'Source du scénario non renseignée.'
    : inDemoPath
      ? 'Moment rattaché au retard traiteur de 21:08 dans le scénario fictif.'
      : selectedKind === 'person'
        ? 'Profil consulté à cet instant ; les liens sociaux ne prouvent pas une causalité.'
        : 'Moment prévu dans le conducteur fictif. Aucune cause démontrée.';
  const effects = isIncident ? moment.impacts ?? [] : [];
  return (
    <section className="ripple-context-panel" aria-label="Inspecteur contextuel de l’instant">
      <div className="ripple-context-header">
        <div>
          <p className="ripple-context-overline"><Clock3 className="w-3.5 h-3.5" /> Instant exploré · démo</p>
          <p className="ripple-context-time" data-testid="explored-time">{minutesFrom17ToTime(minute)}</p>
        </div>
        <button type="button" onClick={onFollow} aria-pressed={following} className="ripple-live-button">
          {following ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          {following ? 'Arrêter le suivi' : 'Suivre la régie'}
        </button>
      </div>
      <label className="ripple-timeline-label" htmlFor="ripple-instant-range">
        <span>15:00</span><span>Déplacer l'instant</span><span>05:00 +1</span>
      </label>
      <input id="ripple-instant-range" aria-label="Explorer le temps du programme" type="range"
        min={START_MINUTE} max={END_MINUTE} step={1} value={minute}
        onChange={event => onMinute(Number(event.target.value))}
        className="ripple-instant-slider" />
      <div className="ripple-context-steps">
        <div className="ripple-context-step">
          <span className="ripple-context-index">01</span>
          <div>
            <p className="ripple-context-caption">Maintenant</p>
            <p className="ripple-context-title">{contextLabel}</p>
            <p className="ripple-context-hint">{moment.at} · {moment.lieu}</p>
            {selectedKind !== 'moment' && <p className="ripple-context-hint">Moment traversé : {moment.title}</p>}
          </div>
        </div>
        <div className="ripple-context-step">
          <span className="ripple-context-index">02</span>
          <div>
            <p className="ripple-context-caption">Pourquoi ?</p>
            <p className="ripple-context-copy">{causeText}</p>
          </div>
        </div>
        <div className="ripple-context-step">
          <span className="ripple-context-index">03</span>
          <div>
            <p className="ripple-context-caption">Conséquences</p>
            {effects.length > 0 ? (
              <ul className="ripple-effects-list">
                {effects.map((effect,i) => <li key={effect.role + i}><span>{effect.role}</span>{effect.text}</li>)}
              </ul>
            ) : inDemoPath ? (
              <p className="ripple-context-copy">Étape liée par le scénario au retard de 21:08 ; impact détaillé non recalculé.</p>
            ) : (
              <p className="ripple-context-copy">Aucun impact causal établi pour cet instant.</p>
            )}
            {people.length > 0 && <p className="ripple-context-meta"><Users className="w-3.5 h-3.5" /> {people.slice(0,3).join(' · ')}{people.length > 3 ? '…' : ''}</p>}
            {playingTitle && <p className="ripple-context-meta"><Music2 className="w-3.5 h-3.5" /> {playingTitle}</p>}
          </div>
        </div>
        <div className="ripple-context-step">
          <span className="ripple-context-index">04</span>
          <div>
            <p className="ripple-context-caption">Action</p>
            {isIncident && moment.planB && <p className="ripple-context-copy font-medium">{moment.planB} <span className="ripple-sim-tag">Plan B fictif</span></p>}
            {inDemoPath && <p className="ripple-context-copy">Examiner l’incident initial pour comprendre les liens illustratifs.</p>}
            <div className="flex flex-wrap gap-2 mt-2">
              {activeCascade && incident && !isIncident && (
                <button type="button" className="ripple-context-action" onClick={() => onMoment(incident.id)}>
                  <GitBranch className="w-3.5 h-3.5" /> Voir la cause
                </button>
              )}
              {next && (
                <button type="button" className="ripple-context-action" onClick={() => onMoment(next.id)}>
                  Moment suivant <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {children && <div className="ripple-context-extra">{children}</div>}
      <p className="ripple-context-disclaimer">Chaîne d'effets dessinée à partir d’un scénario préparé · aucune inférence causale ni action réelle.</p>
    </section>
  );
};
