import { describe,it,expect } from 'vitest';
import { FRAME_LABELS,FRAME_ORDER,FRAME_DESCRIPTIONS,nextDialFrame,frameGeometry,dialAngleAtPoint } from '../dialFraming';
import { PAN_MAX } from '../../ripple/config';
describe('RIPPLECIRCLE V7 — cadrage public',()=>{
  it('cycle avec un seul bouton, sans état impossible',()=>{
    expect(FRAME_ORDER).toHaveLength(3);
    expect(nextDialFrame('full')).toBe('half');
    expect(nextDialFrame('half')).toBe('quarter');
    expect(nextDialFrame('quarter')).toBe('full');
    expect(Object.keys(FRAME_LABELS)).toEqual([...FRAME_ORDER]);
    expect(Object.keys(FRAME_DESCRIPTIONS)).toEqual([...FRAME_ORDER]);
  });
  it('centre la moitié haute sans zoom déformant',()=>{
    expect(frameGeometry('full',315)).toEqual({zoom:1,pan:{x:0,y:0},quarter:''});
    expect(frameGeometry('half',315)).toEqual({zoom:1,pan:{x:0,y:0},quarter:''});
  });
  it('ancre chaque quart du cercle autour de son angle',()=>{
    expect(frameGeometry('quarter',45).quarter).toBe('haut droite');
    expect(frameGeometry('quarter',135).quarter).toBe('bas droite');
    expect(frameGeometry('quarter',225).quarter).toBe('bas gauche');
    expect(frameGeometry('quarter',315).quarter).toBe('haut gauche');
    for (const d of [45,135,225,315]){
      const v=frameGeometry('quarter',d);
      expect(v.zoom).toBe(2);
      expect(Math.abs(v.pan.x)).toBeLessThanOrEqual(PAN_MAX);
      expect(Math.abs(v.pan.y)).toBeLessThanOrEqual(PAN_MAX);
    }
  });
  it('normalise les angles inversés et non finis',()=>{
    expect(frameGeometry('quarter',-45)).toEqual(frameGeometry('quarter',315));
    expect(frameGeometry('quarter',405)).toEqual(frameGeometry('quarter',45));
    expect(Number.isFinite(dialAngleAtPoint(500,500))).toBe(true);
    expect(dialAngleAtPoint(500,0)).toBeCloseTo(0);
    expect(dialAngleAtPoint(1000,500)).toBeCloseTo(90);
    expect(dialAngleAtPoint(500,1000)).toBeCloseTo(180);
  });
});
