import { describe,expect,it } from 'vitest';
import { publicRootChain,simulateDelay } from '../publicSimulation';
describe('Public demo causal propagation and repairs',()=>{
  it('preserves the baseline for no delay',()=>{
    const v=simulateDelay(0);
    expect(v.disruptedOpening).toBe('00:00');
    expect(v.affected.every(x=>x.expected===x.shifted)).toBe(true);
  });
  it('propagates a 10-minute incident through fictional dependent activities',()=>{
    const v=simulateDelay(10);
    expect(v.disruptedOpening).toBe('00:10');
    expect(v.affected.find(x=>x.id==='d10')?.shifted).toBe('21:52');
    expect(v.affected.find(x=>x.id==='d14')?.shifted).toBe('23:55');
  });
  it('plans are ranked and bounded',()=>{
    const v=simulateDelay(18);
    expect(v.plans[0].id).toBe('service');
    expect(v.plans[0].theoreticalOpening).toBe('00:00');
    expect(v.plans.find(x=>x.id==='buffer')?.residualMinutes).toBe(6);
    expect(v.plans.every(p=>p.savedMinutes<=18 && p.residualMinutes>=0)).toBe(true);
    expect(simulateDelay(999).requestedDelay).toBe(45);
  });
  it('selecting a plan returns an explanation but does not mutate scenario',()=>{
    const a=simulateDelay(12,'buffer'),b=simulateDelay(12);
    expect(a.applied?.id).toBe('buffer');
    expect(b.applied).toBeNull();
    expect(a.applied?.actions.length).toBeGreaterThan(0);
  });
  it('root cause status distinguishes illustrative hypothesis from fact',()=>{
    expect(publicRootChain().some(s=>s.status.includes('hypothèse'))).toBe(true);
    expect(publicRootChain().some(s=>s.status.includes('simulation'))).toBe(true);
  });
});
