import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { dialAngles } from '../../../utils/clockFace';
import { timeToMinutesFrom17 } from '../../../utils/time';

describe('RIPPLECIRCLE — instrument centré', () => {
  it('oriente les aiguilles comme une horloge classique à 12 heures', () => {
    expect(dialAngles(timeToMinutesFrom17('12:00'))).toEqual({ hour: 0, minute: 0 });
    expect(dialAngles(timeToMinutesFrom17('15:00'))).toEqual({ hour: 90, minute: 0 });
    expect(dialAngles(timeToMinutesFrom17('21:00'))).toEqual({ hour: 270, minute: 0 });
    expect(dialAngles(timeToMinutesFrom17('21:30'))).toEqual({ hour: 285, minute: 180 });
    expect(dialAngles(timeToMinutesFrom17('00:15'))).toEqual({ hour: 7.5, minute: 90 });
  });
  it('garde les vues dans le cercle et uniquement Compte dans le header', () => {
    const landing = readFileSync(resolve(__dirname, '../Landing.tsx'), 'utf8');
    const ripple = readFileSync(resolve(__dirname, '../Ripple.tsx'), 'utf8');
    expect(landing).not.toContain('<nav');
    expect(landing).toContain('Compte');
    expect(ripple).toContain('ripple-orbit-nav');
    expect(ripple).toContain('InstantInspector');
    expect(ripple).toContain('PublicIncidentDemo');
    expect(ripple).toContain('<ClockDial');
    expect(ripple).toContain('ripple-context-fold');
    expect(ripple).toContain('timeline-scrub-ring');
  });
});
