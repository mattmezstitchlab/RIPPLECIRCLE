import {describe,it,expect} from 'vitest';
import {PHASES,ROLES,DEMO_SEGMENTS,GRID_MINUTES,timeLabel,boundsForSegment,phaseRoles,segmentsOf,overlaps,isValidSegment,sanitizeSegments,rolesMatchingPhase} from '../weddingScore';
describe('V9 partition universelle',()=>{
  it('une phase est un anneau temporel distinct, du passé vers l’avenir',()=>{
    expect(PHASES).toHaveLength(5);
    expect(new Set(PHASES.map(p=>p.id)).size).toBe(PHASES.length);
    expect(PHASES.every(p=>p.start<p.end)).toBe(true);
    expect(PHASES.map(p=>p.start)).toEqual([...PHASES].map(p=>p.start).sort((a,b)=>a-b));
    expect(timeLabel(1500)).toBe('01:00');
  });
  it('la taxonomie métier est unique et indexable dans plusieurs phases',()=>{
    expect(new Set(ROLES.map(r=>r.id)).size).toBe(ROLES.length);
    expect(phaseRoles('cocktail').some(r=>r.id==='photo')).toBe(true);
    expect(phaseRoles('evening').some(r=>r.id==='photo')).toBe(true);
    expect(phaseRoles('ceremony').some(r=>r.id==='dj')).toBe(false);
    expect(rolesMatchingPhase('cocktail','photo').map(r=>r.id)).toEqual(['photo']);
  });
  it('les segments sont quantifiés à 15 minutes et bornés dans leur phase',()=>{
    const phase=PHASES[2];
    expect(GRID_MINUTES).toBe(15);
    expect(boundsForSegment(phase,1129,1234)).toEqual({start:1065,end:1170});
    expect(boundsForSegment(phase,950,970)).toEqual({start:990,end:1020});
    expect(boundsForSegment(phase,1168,1169)).toEqual({start:1155,end:1170});
  });
  it('détecte les collisions sur une même piste, pas entre deux métiers',()=>{
    const a=DEMO_SEGMENTS[1];
    const b={...a,id:'other',start:a.start+15,end:a.end};
    expect(overlaps(a,b)).toBe(true);
    expect(overlaps(a,{...b,roleId:'music'})).toBe(false);
    expect(segmentsOf(DEMO_SEGMENTS,'cocktail','photo')).toHaveLength(1);
  });
  it('empêche les données corrompues de revenir dans la partition',()=>{
    expect(DEMO_SEGMENTS.every(isValidSegment)).toBe(false);
    const entries=sanitizeSegments([{...DEMO_SEGMENTS[0]},{
      id:'bad',phaseId:'cocktail',roleId:'dj',start:990,end:1010
    }]);
    expect(entries.length).toBe(1);
    expect(sanitizeSegments(null).length).toBe(DEMO_SEGMENTS.length);
  });
});
