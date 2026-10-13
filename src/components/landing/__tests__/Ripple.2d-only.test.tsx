import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { BASE_TRACKS, SETS } from '../../../data/playlist';
import { GROUP_COLORS, RINGS } from '../../../ripple/config';

describe('RIPPLECIRCLE — interface 2D unique', () => {
  const source = (path: string) => readFileSync(resolve(__dirname, path), 'utf8');

  it('charge uniquement Landing et retire les points d’entrée 3D', () => {
    expect(source('../../../App.tsx')).toContain('<Landing />');
    expect(source('../../../App.tsx')).not.toMatch(/Ripple3D|clock3d/);
    expect(source('../Landing.tsx')).not.toMatch(/clock3d|⟡ 3D/);
    expect(existsSync(resolve(__dirname, '../../clock3d'))).toBe(false);
    expect(existsSync(resolve(__dirname, '../../../../public/clock3d'))).toBe(false);
  });

  it('conserve les anneaux 2D, les couleurs et la programmation musicale', () => {
    expect(RINGS.playlist).toBeGreaterThan(RINGS.tables);
    expect(GROUP_COLORS.length).toBeGreaterThan(0);
    expect(Object.keys(SETS)).toEqual(['ceremonie', 'lounge', 'transition', 'diner', 'soiree']);
    expect(BASE_TRACKS.length).toBeGreaterThan(0);
    expect(source('../Ripple.tsx')).toContain('regie.audio.v1');
  });
});
