/**
 * PUBLIC V4 EXPERIMENTAL VIEW ONLY.
 * The graph below is an authored fictional teaching example, NOT the
 * confidential causal kernel, an inference system or verified evidence.
 *
 * No recipient, network request, notification or real schedule mutation.
 */
import { DAY_MOMENTS } from '../data/dayOf';
import { timeToMinutesFrom17 } from './time';
import { simulateDelay, type RepairId, type DemoPlan } from './publicSimulation';
export type Evidence = 'programme' | 'hypothese';

export interface ScenarioEdge {
  from: string; to: string; evidence: Evidence; explanation: string;
}
export const PUBLIC_V4_EDGES: readonly ScenarioEdge[] = [
  { from:'d7',to:'d9',evidence:'programme',explanation:'L’appel en salle dépend de la disponibilité du service.' },
  { from:'d9',to:'d10',evidence:'programme',explanation:'L’entrée en salle suit l’appel aux invités.' },
  { from:'d10',to:'d14',evidence:'programme',explanation:'Le dessert est en aval du dîner.' },
  { from:'d14',to:'d15',evidence:'programme',explanation:'Le bal suit le dessert dans ce conducteur.' },
  { from:'d10',to:'cue-photo',evidence:'hypothese',explanation:'Le photographe pourrait perdre une fenêtre de prise de vue.' },
  { from:'d14',to:'cue-light',evidence:'hypothese',explanation:'La lumière du dessert pourrait devoir être recalée.' },
  { from:'d15',to:'cue-transport',evidence:'hypothese',explanation:'L’attente après le bal pourrait affecter les navettes.' },
  { from:'d15',to:'cue-logistique',evidence:'hypothese',explanation:'La fin des opérations pourrait réduire la marge de démontage.' },
];
const PUBLIC_RESOURCES: Record<string,{label:string;role:string}> = {
  'cue-photo':{label:'Séance photo secondaire',role:'Photographe'},
  'cue-light':{label:'Signal lumière du dessert',role:'Régie lumière'},
  'cue-transport':{label:'Départ des navettes',role:'Transport'},
  'cue-logistique':{label:'Marge de démontage',role:'Logistique'}
};
export interface IndirectEffect {
  id: string; label:string; actor:string;
  depth:number; path:readonly string[];
  status: Evidence; explanation:string;
  projectedMinute: number | null;
}
function nodeTitle(id:string):string {
  return DAY_MOMENTS.find(m=>m.id===id)?.title ?? PUBLIC_RESOURCES[id]?.label ?? id;
}
/** Ordered traversal with cycle prevention. A hypothetical edge taints downstream claims. */
export function traceIndirectEffects(delay:number): IndirectEffect[] {
  if(!Number.isFinite(delay) || delay<=0) return [];
  const queue:{id:string;path:string[];status:Evidence;depth:number;explanation:string}[]=[
    {id:'d7',path:['d7'],status:'programme',depth:0,explanation:'Incident choisi dans la démonstration'}
  ];
  const seen=new Set<string>(['d7']);
  const results:IndirectEffect[]=[];
  for(let index=0;index<queue.length;index++){
    const current=queue[index];
    for(const edge of PUBLIC_V4_EDGES.filter(e=>e.from===current.id)){
      if(seen.has(edge.to)) continue;
      seen.add(edge.to);
      const status:Evidence=current.status==='hypothese'||edge.evidence==='hypothese'?'hypothese':'programme';
      const entry={id:edge.to,path:[...current.path,edge.to],status,depth:current.depth+1,
        explanation:edge.explanation};
      queue.push(entry);
      const m=DAY_MOMENTS.find(m=>m.id===edge.to);
      results.push({ id:entry.id,label:nodeTitle(entry.id),
        actor:PUBLIC_RESOURCES[entry.id]?.role ?? (m?.roles[0] ?? 'Régie'),
        depth:entry.depth,path:entry.path.map(nodeTitle),status,
        explanation:entry.explanation,
        projectedMinute:m ? timeToMinutesFrom17(m.at)+Math.max(0,Math.min(45,Math.round(delay))) : null
      });
    }
  }
  return results;
}
export function chooseDemoPlan(delay:number,selected:RepairId|null):DemoPlan {
  const sim=simulateDelay(delay, selected??undefined);
  const winner=sim.plans[0];
  return sim.applied ?? winner;
}
export interface LocalAssignment {
  id:string; actor:string;task:string;timing:string; status:'brouillon'; planId:RepairId;
}
/** A list of draft instructions only; no addresses or delivery endpoints. */
export function buildDraftAssignments(delay:number,planId:RepairId|null):LocalAssignment[] {
  if(!Number.isFinite(delay) || delay<=0) return [];
  const plan=chooseDemoPlan(delay,planId);
  return plan.actions.map((text,index)=>{
    const separator=text.indexOf(':');
    const actor=separator===-1?'Régie':text.slice(0,separator).trim();
    const task=separator===-1?text.trim():text.slice(separator+1).trim();
    return {id:plan.id+'-'+index, actor,task,
      timing:index===0?'Dès validation fictive':'Après confirmation de la régie',
      status:'brouillon' as const,planId:plan.id};
  });
}
export type ReplayKind='reference'|'incident'|'proposition'|'consequence'|'bilan';
export interface ReplayFrame {
  id:string; minute:number; kind:ReplayKind; title:string;
  description:string; status:'référence'|'projection'|'option fictive';
  planOpening:string; affectedId?:string;
}
export function buildPublicReplay(delay:number,selected:RepairId|null):ReplayFrame[] {
  const simulation=simulateDelay(delay,selected??undefined);
  const plan=simulation.applied;
  const opening=plan?.theoreticalOpening ?? simulation.disruptedOpening;
  const frames:ReplayFrame[]=[
    {id:'start',minute:timeToMinutesFrom17('15:00'),kind:'reference',title:'Préparation',
     description:'Début de la journée de référence du scénario fictif.',
     status:'référence',planOpening:simulation.baselineOpening},
    {id:'incident',minute:timeToMinutesFrom17('21:08'),kind:'incident',title:'Incident du traiteur',
     description:'Retard fictif de +'+simulation.requestedDelay+' minutes déclaré pour la simulation.',
     status:'projection',planOpening:opening,affectedId:'d7'},
    {id:'choice',minute:timeToMinutesFrom17('21:13'),kind:'proposition',
     title:plan?'Plan proposé : '+plan.title:'Aucun plan sélectionné',
     description:plan?'Option fictive retenue localement ; aucune consigne transmise.':'Le conducteur reste projeté sans plan correctif.',
     status:'option fictive',planOpening:opening,affectedId:'d8'},
    ...simulation.affected.slice(0,3).map((affected):ReplayFrame=>({
      id:'impact-'+affected.id,minute:timeToMinutesFrom17(affected.expected),
      kind:'consequence',title:affected.label,
      description:'Référence : '+affected.expected+' · sans plan : '+affected.shifted,
      status:'projection',planOpening:opening,affectedId:affected.id
    })),
    {id:'outcome',minute:timeToMinutesFrom17('00:00'),kind:'bilan',title:'Ouverture de bal',
     description:'Référence 00:00 · sans correction '+simulation.disruptedOpening+' · après option '+opening+'.',
     status:'projection',planOpening:opening,affectedId:'d15'}
  ];
  return frames.sort((a,b)=>a.minute-b.minute);
}
export function replayComparison(delay:number,selected:RepairId|null) {
  const sim=simulateDelay(delay,selected??undefined);
  return { reference:sim.baselineOpening,
    withoutPlan:sim.disruptedOpening,
    withPlan:sim.applied?.theoreticalOpening ?? null,
    minutesAvoided:sim.applied?.savedMinutes ?? 0,
    remainingDelay:sim.applied?.residualMinutes ?? sim.requestedDelay
  };
}
