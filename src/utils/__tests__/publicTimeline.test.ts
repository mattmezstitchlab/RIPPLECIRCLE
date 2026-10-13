import { describe, expect, it } from 'vitest';
import { DAY_MOMENTS } from '../../data/dayOf';
import { END_MINUTE, START_MINUTE, angleAtMinute, causalDemoLinks, minuteAtAngle, momentAt, rolesForPublicIncident, shouldShowPublicCascade } from '../publicTimeline';
import { timeToMinutesFrom17 } from '../time';

describe('Cadran V3 — exploration du temps sur le programme complet', () => {
  it('couvre chronologiquement 15:00 → 05:00 avec l’aiguille horaire du conducteur', () => {
    expect(START_MINUTE).toBe(-120);
    expect(END_MINUTE).toBe(720);
    expect(angleAtMinute(START_MINUTE)).toBe(0);
    expect(angleAtMinute(END_MINUTE)).toBe(360);
    expect(minuteAtAngle(0)).toBe(START_MINUTE);
    expect(minuteAtAngle(180)).toBe(300);
    expect(minuteAtAngle(270)).toBe(510);
    expect(minuteAtAngle(-90)).toBe(510);
  });
  it('choisit l’événement connu le plus récent, y compris après minuit', () => {
    expect(momentAt(timeToMinutesFrom17('15:00')).id).toBe('d1');
    expect(momentAt(timeToMinutesFrom17('21:08')).id).toBe('d7');
    expect(momentAt(timeToMinutesFrom17('21:14')).id).toBe('d8');
    expect(momentAt(timeToMinutesFrom17('00:02')).id).toBe('d15');
    expect(momentAt(timeToMinutesFrom17('05:00')).id).toBe('d18');
  });
  it('ne montre pas la cascade avant l’incident ou après la fin du scénario', () => {
    expect(shouldShowPublicCascade(timeToMinutesFrom17('20:59'))).toBe(false);
    expect(shouldShowPublicCascade(timeToMinutesFrom17('21:08'))).toBe(true);
    expect(shouldShowPublicCascade(timeToMinutesFrom17('23:46'))).toBe(false);
  });
  it('conserve une chaîne fictive stable vers des nœuds du programme réels', () => {
    const links = causalDemoLinks();
    expect(links.map(l => l.target)).toEqual(['d9','d10','d14']);
    expect(links.every(l => DAY_MOMENTS.some(m => m.id === l.target) && l.targetMinute > l.sourceMinute)).toBe(true);
    expect(rolesForPublicIncident()).toEqual(['dj','photographe','maries','invite']);
  });
});
