import { describe,expect,it } from 'vitest';
import { PUBLIC_V4_EDGES, traceIndirectEffects,buildDraftAssignments,chooseDemoPlan,buildPublicReplay,replayComparison } from '../publicAftermath';
describe('RIPPLECIRCLE V4 — démonstration publique sans moteur privé',()=>{
  it('traverse les effets indirects avec preuve qualifiée et sans doublons',()=>{
    const impacts=traceIndirectEffects(12);
    expect(impacts.length).toBe(8);
    expect(new Set(impacts.map(x=>x.id)).size).toBe(impacts.length);
    expect(impacts.find(x=>x.id==='d15')?.depth).toBe(4);
    expect(impacts.find(x=>x.id==='cue-transport')?.status).toBe('hypothese');
    expect(impacts.find(x=>x.id==='cue-photo')?.projectedMinute).toBe(null);
    expect(impacts.find(x=>x.id==='d9')?.status).toBe('programme');
    expect(PUBLIC_V4_EDGES.every(e=>e.explanation.length>5)).toBe(true);
  });
  it('ne signale aucun effet si aucun incident',()=>expect(traceIndirectEffects(0)).toEqual([]));
  it('crée des propositions de mission et aucune adresse réelle',()=>{
    const actions=buildDraftAssignments(18,'service');
    expect(actions).toHaveLength(3);
    expect(actions.map(a=>a.actor)).toEqual(['Traiteur','DJ','Wedding planner']);
    expect(actions.every(a=>a.status==='brouillon'&& !('email' in a))).toBe(true);
    expect(buildDraftAssignments(0,'service')).toHaveLength(0);
    expect(chooseDemoPlan(18,null).id).toBe('service');
  });
  it('rejoue dans l’ordre la journée et distingue l’option retenue de la référence',()=>{
    const replay=buildPublicReplay(18,'service');
    expect(replay[0].id).toBe('start');
    expect(replay.at(-1)?.id).toBe('outcome');
    expect(replay.every((e,i)=>i===0||e.minute>=replay[i-1].minute)).toBe(true);
    expect(replay.find(e=>e.id==='choice')?.title).toContain('Plan B');
    const comparison=replayComparison(18,'service');
    expect(comparison).toEqual({reference:'00:00',withoutPlan:'00:18',withPlan:'00:00',minutesAvoided:18,remainingDelay:0});
  });
  it('ne prétend pas disposer de décisions historiques ou d’une issue réelle',()=>{
    const replay=buildPublicReplay(10,null);
    expect(replay.find(e=>e.id==='choice')?.title).toContain('Aucun plan');
    expect(replayComparison(10,null).withPlan).toBeNull();
    expect(replay.every(e=>e.status!=='réel')).toBe(true);
  });
});
