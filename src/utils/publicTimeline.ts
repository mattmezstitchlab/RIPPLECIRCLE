/**
 * Public, illustrative chronology — NOT the private causal engine.
 * Each arrow is an editorial link to a fictional wedding scenario, not
 * a statistical causal inference or optimization result.
 */
import { DAY_MOMENTS, type DayMoment, type DayRole } from '../data/dayOf';
import { timeToMinutesFrom17 } from './time';

export const START_MINUTE = timeToMinutesFrom17('15:00');
export const END_MINUTE = timeToMinutesFrom17('05:00');
export const DEMO_INCIDENT = 'd7';
export const DEMO_PATH = ['d7', 'd9', 'd10', 'd14'] as const;
export const DEMO_ROLE_COLORS: Partial<Record<DayRole, string>> = {
  traiteur: '#FF9F0A',
  dj: '#5E5CE6',
  photographe: '#30D158',
  maries: '#FF453A',
  invite: '#0A84FF'
};
const ordered = [...DAY_MOMENTS].sort((a, b) => timeToMinutesFrom17(a.at) - timeToMinutesFrom17(b.at));
const clamp = (minute: number): number =>
  Math.round(Math.max(START_MINUTE, Math.min(END_MINUTE, Number.isFinite(minute) ? minute : START_MINUTE)));

export function momentAt(minute: number): DayMoment {
  const at = clamp(minute);
  return [...ordered].reverse().find(m => timeToMinutesFrom17(m.at) <= at) ?? ordered[0];
}

/** Time is a 14h linear conductor clockwise (not the analog 12h clock). */
export function minuteAtAngle(angle: number): number {
  if (!Number.isFinite(angle)) return START_MINUTE;
  const norm = ((angle % 360) + 360) % 360;
  return clamp(START_MINUTE + norm / 360 * (END_MINUTE - START_MINUTE));
}
export function angleAtMinute(minute: number): number {
  return (clamp(minute) - START_MINUTE) / (END_MINUTE - START_MINUTE) * 360;
}
export function shouldShowPublicCascade(minute: number): boolean {
  const from = timeToMinutesFrom17('21:08');
  const until = timeToMinutesFrom17('23:45');
  return minute >= from && minute <= until;
}
export function causalDemoLinks() {
  const source = DAY_MOMENTS.find(m => m.id === DEMO_INCIDENT);
  if (!source) return [];
  return DEMO_PATH.slice(1).map(id => ({
    source: source.id,
    target: id,
    sourceMinute: timeToMinutesFrom17(source.at),
    targetMinute: timeToMinutesFrom17(DAY_MOMENTS.find(m => m.id === id)?.at ?? source.at)
  }));
}
export function rolesForPublicIncident(): DayRole[] {
  const incident = DAY_MOMENTS.find(m => m.id === DEMO_INCIDENT);
  return [...new Set(incident?.impacts?.map(i => i.role) ?? [])];
}
