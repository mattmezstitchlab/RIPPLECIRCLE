/** Géométrie partagée des vues circulaires. */

export const polarXY = (cx: number, cy: number, r: number, deg: number) => {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

/** Arc SVG dans le sens horaire, de a0 vers a1. */
export const arcPathAt = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const s = polarXY(cx, cy, r, a0);
  const e = polarXY(cx, cy, r, a1);
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${e.x} ${e.y}`;
};

export const normDeg = (a: number) => ((a % 360) + 360) % 360;

/** Distance angulaire la plus courte entre deux angles. */
export const angularDist = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);
