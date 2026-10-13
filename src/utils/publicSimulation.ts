/**
 * PUBLIC DEMONSTRATION ONLY.
 * Deterministic scenario and planning arithmetic over fictional wedding data.
 * Not an inference engine, not the confidential causal kernel.
 */
import { DAY_MOMENTS } from '../data/dayOf';
import { minutesFrom17ToTime, timeToMinutesFrom17 } from './time';

export type PublicMode = 'observe' | 'simulate' | 'trace' | 'repair';
export type RepairId = 'buffer' | 'service' | 'key-moment';

export interface DemoAdjustment {
  id: RepairId;
  title: string;
  strategy: string;
  availableMinutes: number;
  budgetEuros: number;
  actors: readonly string[];
  preservesKeyMoment: boolean;
}

export const PUBLIC_SOURCE = 'd7';
export const PUBLIC_DEPENDENCIES = [
  { id: 'd9', label: 'Appel en salle', reason: 'L’attente retarde la convocation des invités.' },
  { id: 'd10', label: 'Entrée en salle', reason: 'Le service des entrées dépend du traiteur.' },
  { id: 'd14', label: 'Dessert', reason: 'La durée du dîner peut décaler le dessert.' },
  { id: 'd15', label: 'Ouverture de bal', reason: 'Le dessert précède l’ouverture de bal.' }
] as const;
const scenarios: DemoAdjustment[] = [
  { id:'buffer',title:'Plan A · Absorber la marge',strategy:'Réduire la marge disponible avant le dîner.',availableMinutes:12,budgetEuros:0,actors:['Wedding planner','Traiteur'],preservesKeyMoment:false },
  { id:'service',title:'Plan B · Réorganiser le service',strategy:'Réduire le dressage de 8 min et raccourcir le dessert de 10 min.',availableMinutes:18,budgetEuros:80,actors:['Traiteur','DJ','Wedding planner'],preservesKeyMoment:true },
  { id:'key-moment',title:'Plan C · Protéger le moment clé',strategy:'Décaler les photos secondaires et réallouer une fenêtre de 24 min.',availableMinutes:24,budgetEuros:160,actors:['Photographe','Traiteur','DJ','Wedding planner'],preservesKeyMoment:true }
] as const;
export interface DemoPlan extends DemoAdjustment {
  delayedMinutes: number;
  savedMinutes: number;
  residualMinutes: number;
  theoreticalOpening: string;
  score: number;
  actions: readonly string[];
}
const clamp = (n: number) => Math.max(0, Math.min(45, Math.round(Number.isFinite(n) ? n : 0)));
export function simulateDelay(minutes: number, selected?: RepairId): {
  requestedDelay: number;
  baselineOpening: string;
  disruptedOpening: string;
  affected: readonly { id: string; label: string; expected: string; shifted: string; reason: string; type: string }[];
  plans: readonly DemoPlan[];
  applied: DemoPlan | null;
} {
  const delay = clamp(minutes);
  const baseline = timeToMinutesFrom17('00:00');
  const affected = PUBLIC_DEPENDENCIES.map((node) => {
    const moment = DAY_MOMENTS.find(m => m.id === node.id)!;
    return { id: node.id, label: node.label, expected: moment.at,
      shifted: minutesFrom17ToTime(timeToMinutesFrom17(moment.at) + delay),
      reason: node.reason, type: 'dépendance déduite du conducteur fictif' };
  });
  const plans: DemoPlan[] = scenarios.map(plan => {
    const savedMinutes = Math.min(delay, plan.availableMinutes);
    const residualMinutes = Math.max(0, delay - savedMinutes);
    const actors = plan.actors;
    const actions = plan.id === 'buffer'
      ? ['Wedding planner : vérifier la marge avant service', 'Traiteur : maintenir le service prévu']
      : plan.id === 'service'
        ? ['Traiteur : préparer le dressage accéléré', 'DJ : prolonger la transition musicale', 'Wedding planner : arbitrer le dessert']
        : ['Photographe : proposer le report des photos secondaires', 'Traiteur : préserver l’enchaînement du service', 'DJ : préparer le signal du bal', 'Wedding planner : valider les ajustements'];
    const score = residualMinutes * 100 + plan.budgetEuros / 10 + actors.length * 2 + (plan.preservesKeyMoment ? 0 : 1);
    return {...plan,delayedMinutes:delay,savedMinutes,residualMinutes,
      theoreticalOpening:minutesFrom17ToTime(baseline+residualMinutes),score,actions};
  }).sort((a,b) => a.score-b.score || a.id.localeCompare(b.id));
  return { requestedDelay:delay, baselineOpening:'00:00',
    disruptedOpening:minutesFrom17ToTime(baseline+delay),
    affected, plans, applied:plans.find(plan => plan.id === selected) ?? null };
}
export function publicRootChain(): readonly { label:string; status:string }[] {
  return [
    {label:'Réglage du four N°2',status:'déclaré dans le scénario'},
    {label:'Dressage ralenti',status:'hypothèse explicative'},
    {label:'Service du dîner décalé',status:'dépendance du programme'},
    {label:'Dessert décalé',status:'dépendance du programme'},
    {label:'Ouverture de bal potentiellement retardée',status:'simulation, non observée'}
  ];
}
