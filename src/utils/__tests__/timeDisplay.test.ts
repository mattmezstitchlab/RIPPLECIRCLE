import { describe, expect, it } from 'vitest';
import { minutesFrom17ToTime, timeToMinutesFrom17 } from '../time';

describe('Affichage des heures sur l’anneau du jour J', () => {
  it('affiche correctement les heures avant 17h et après 04h du matin', () => {
    expect(minutesFrom17ToTime(timeToMinutesFrom17('15:00'))).toBe('15:00');
    expect(minutesFrom17ToTime(timeToMinutesFrom17('17:00'))).toBe('17:00');
    expect(minutesFrom17ToTime(timeToMinutesFrom17('21:08'))).toBe('21:08');
    expect(minutesFrom17ToTime(timeToMinutesFrom17('00:00'))).toBe('00:00');
    expect(minutesFrom17ToTime(timeToMinutesFrom17('05:00'))).toBe('05:00');
  });
});
