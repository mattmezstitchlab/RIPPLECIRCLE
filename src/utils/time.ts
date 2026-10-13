export function parseHM(time: string): { h: number; m: number } {
  const [h, m] = time.split(':').map(Number);
  return { h: h || 0, m: m || 0 };
}

/** Minutes elapsed since 17:00. Overnight hours (00–04) wrap past midnight. */
export function timeToMinutesFrom17(time: string): number {
  const { h, m } = parseHM(time);
  let hour = h;
  if (hour < 12) hour += 24;
  return (hour - 17) * 60 + m;
}

export function minutesFrom17ToTime(totalMin: number): string {
  const clamped = Math.max(0, Math.min(660, totalMin));
  let rawHours = Math.floor(clamped / 60) + 17;
  const mins = Math.floor(clamped % 60);
  if (rawHours >= 24) rawHours -= 24;
  return `${String(rawHours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

export function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

export function phaseProgress(time: string): {
  ceremony: number;
  cocktail: number;
  dinner: number;
} {
  const t = timeToMinutesFrom17(time);
  const cerS = timeToMinutesFrom17('18:00');
  const cerE = timeToMinutesFrom17('19:30');
  const cokS = cerE;
  const cokE = timeToMinutesFrom17('21:30');
  const dinS = cokE;
  const dinE = timeToMinutesFrom17('00:00');

  return {
    ceremony: clamp01((t - cerS) / (cerE - cerS)),
    cocktail: clamp01((t - cokS) / (cokE - cokS)),
    dinner: clamp01((t - dinS) / (dinE - dinS))
  };
}

export function activePhaseLabel(time: string): 'Cérémonie' | 'Cocktail' | 'Dîner' | 'Soirée' {
  const t = timeToMinutesFrom17(time);
  if (t < timeToMinutesFrom17('19:30')) return 'Cérémonie';
  if (t < timeToMinutesFrom17('21:30')) return 'Cocktail';
  if (t < timeToMinutesFrom17('00:00')) return 'Dîner';
  return 'Soirée';
}
