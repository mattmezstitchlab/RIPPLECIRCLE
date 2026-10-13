/** Cadran conventionnel 12 h. Les minutes de régie sont décalées de 17:00. */
export function dialAngles(minutesFrom17: number): { hour: number; minute: number } {
  const normalized = ((17 * 60 + minutesFrom17) % 1440 + 1440) % 1440;
  return { hour: (normalized % 720) / 2, minute: (normalized % 60) * 6 };
}
