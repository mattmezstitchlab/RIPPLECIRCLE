import React from 'react';
import { RIPPLE_CENTER as C, RINGS as R } from '../../ripple/config';
import { polarXY } from '../../utils/radial';
import { dialAngles } from '../../utils/clockFace';
import { minutesFrom17ToTime } from '../../utils/time';

/**
 * Aiguilles dans le sens horaire, 12 en haut. Le cercle extérieur garde
 * volontairement son conducteur chronologique 15:00 → 05:00 : les deux
 * échelles sont distinctes pour éviter une fausse correspondance d'angles.
 */
export const ClockDial: React.FC<{ minutes: number; night: boolean }> = ({ minutes, night }) => {
  const { hour, minute } = dialAngles(minutes);
  const hand = (radius: number, angle: number) => polarXY(C, C, radius, angle);
  const h = hand(65, hour);
  const m = hand(98, minute);
  return (
    <g className="ripple-clock-face" pointerEvents="none">
      <circle cx={C} cy={C} r={R.centerDisk - 2} fill="var(--ripple-surface,#fff)" stroke="var(--ripple-line,rgba(0,0,0,.1))" strokeWidth={1.5} />
      <circle cx={C} cy={C} r={137} fill="none" stroke={night ? '#72727a' : '#d2d2d7'} strokeWidth={0.9} />
      {Array.from({ length: 60 }, (_, i) => {
        const a = i * 6;
        const start = hand(i % 5 === 0 ? 126 : 131, a);
        const end = hand(138, a);
        return <line key={i} x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke="var(--ripple-ink,#1d1d1f)" strokeWidth={i % 5 === 0 ? 2.8 : 1} opacity={i % 5 === 0 ? 0.75 : 0.25} />;
      })}
      {[12, 3, 6, 9].map((n) => {
        const p = hand(113, n * 30);
        return <text key={n} x={p.x} y={p.y + 5} fontSize={17} fontWeight={700} fill="var(--ripple-ink,#1d1d1f)" textAnchor="middle">{n}</text>;
      })}
      <line x1={C} y1={C} x2={h.x} y2={h.y} stroke="var(--ripple-ink,#1d1d1f)" strokeWidth={8} strokeLinecap="round" />
      <line x1={C} y1={C} x2={m.x} y2={m.y} stroke="#0A84FF" strokeWidth={4.5} strokeLinecap="round" />
      <circle cx={C} cy={C} r={7} fill="#0A84FF" stroke="var(--ripple-surface,#fff)" strokeWidth={2} />
      <rect x={C - 37} y={C + 70} width={74} height={24} rx={7} fill={night ? '#252531' : '#f2f3f6'} />
      <text x={C} y={C + 87} textAnchor="middle" fontSize={16} fontWeight={800} fill="var(--ripple-ink,#1d1d1f)" fontFamily="monospace">{minutesFrom17ToTime(minutes)}</text>
      <text x={C} y={C - 90} textAnchor="middle" fontSize={10} letterSpacing={1.6} fontWeight={700} fill="var(--ripple-muted,#515154)">RÉGIE · DÉMO</text>
    </g>
  );
};
