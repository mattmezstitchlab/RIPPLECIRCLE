import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BASE,
  BASE_SLACK,
  BASE_STABILITY,
  RoleKey,
  SCENES,
  Scene,
  Status
} from '../data/orchestra';
import { timeToMinutesFrom17 } from '../utils/time';

export const START = timeToMinutesFrom17('21:00');
export const END = timeToMinutesFrom17('21:56');
export const SCENE_MIN = SCENES.map((s) => timeToMinutesFrom17(s.at));

const TICK_MS = 900; // durée d'une minute simulée
const STAGGER_MS = 520; // délai entre deux rôles touchés par une même scène

export interface RoleView {
  status: Status;
  metric: string;
  text: string;
  from: RoleKey | null;
  at: string | null;
}

interface Cascade {
  sceneId: string;
  lit: number;
}

const zeroPulses = (): Record<RoleKey, number> => ({
  maries: 0,
  temoin: 0,
  traiteur: 0,
  photographe: 0,
  dj: 0,
  invite: 0,
  planner: 0
});

/**
 * Moteur d'orchestration : une horloge simulée avance, et chaque scène se
 * propage de rôle en rôle avec un léger décalage. L'état affiché est toujours
 * dérivé de l'heure et de l'avancement de la cascade.
 */
export function useOrchestra() {
  const reduceMotion =
    typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const [paused, setPaused] = useState(reduceMotion);
  const [manual, setManual] = useState(false);
  const [clock, setClock] = useState<{ minutes: number; cascade: Cascade | null }>({
    minutes: START,
    cascade: null
  });
  const [pulses, setPulses] = useState<Record<RoleKey, number>>(zeroPulses);

  const minutesRef = useRef(START);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  };

  const fire = useCallback((scene: Scene) => {
    clearTimers();
    scene.effects.forEach((effect, i) => {
      const id = window.setTimeout(() => {
        setPulses((p) => ({ ...p, [effect.role]: p[effect.role] + 1 }));
        setClock((c) =>
          c.cascade && c.cascade.sceneId === scene.id ? { ...c, cascade: { sceneId: scene.id, lit: i + 1 } } : c
        );
      }, i * STAGGER_MS);
      timers.current.push(id);
    });
  }, []);

  const running = !paused && !manual;

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      const next = minutesRef.current >= END ? START : minutesRef.current + 1;
      minutesRef.current = next;

      if (next === START) {
        clearTimers();
        setClock({ minutes: START, cascade: null });
        return;
      }

      const idx = SCENE_MIN.indexOf(next);
      const scene = idx >= 0 ? SCENES[idx] : null;
      setClock((c) => ({
        minutes: next,
        cascade: scene ? { sceneId: scene.id, lit: 0 } : c.cascade
      }));
      if (scene) fire(scene);
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [running, fire]);

  useEffect(() => () => clearTimers(), []);

  const view = useMemo(() => {
    const roles = {} as Record<RoleKey, RoleView>;
    (Object.keys(BASE) as RoleKey[]).forEach((k) => {
      roles[k] = { status: BASE[k].status, metric: BASE[k].metric, text: BASE[k].text, from: null, at: null };
    });

    let slack = BASE_SLACK;
    let stability = BASE_STABILITY;

    let latest = -1;
    SCENE_MIN.forEach((m, i) => {
      if (m <= clock.minutes) latest = i;
    });

    let lit = 0;
    for (let i = 0; i <= latest; i++) {
      const s = SCENES[i];
      const partial = i === latest && clock.cascade?.sceneId === s.id;
      const limit = partial ? (clock.cascade as Cascade).lit : s.effects.length;
      if (i === latest) lit = limit;

      s.effects.slice(0, limit).forEach((e) => {
        const prev = roles[e.role];
        roles[e.role] = {
          status: e.status ?? prev.status,
          metric: e.metric ?? prev.metric,
          text: e.text,
          from: s.source,
          at: s.at
        };
      });

      if (limit >= 1) {
        if (s.slack !== undefined) slack = s.slack;
        if (s.stability !== undefined) stability = s.stability;
      }
    }

    return { roles, slack, stability, latest, lit, scene: latest >= 0 ? SCENES[latest] : null };
  }, [clock]);

  /** Déplacer l'horloge manuellement : le direct se met en pause. */
  const scrub = useCallback((m: number) => {
    const clamped = Math.max(START, Math.min(END, m));
    minutesRef.current = clamped;
    clearTimers();
    setManual(true);
    const sceneIndex = SCENE_MIN.indexOf(clamped);
    const scene = sceneIndex >= 0 ? SCENES[sceneIndex] : null;
    setClock({
      minutes: clamped,
      cascade: scene ? { sceneId: scene.id, lit: 0 } : null
    });
    if (scene) fire(scene);
  }, [fire]);

  /** Reprendre le direct là où on en est. */
  const resume = useCallback(() => {
    setManual(false);
    setPaused(false);
  }, []);

  const toggle = useCallback(() => {
    setManual(false);
    setPaused((p) => !p);
  }, []);

  /** Une note de la partition est-elle déjà jouée ? */
  const applied = (sceneIdx: number, effectIdx: number) =>
    sceneIdx < view.latest || (sceneIdx === view.latest && effectIdx < view.lit);

  return {
    minutes: clock.minutes,
    roles: view.roles,
    slack: view.slack,
    stability: view.stability,
    scene: view.scene,
    sceneIndex: view.latest,
    lit: view.lit,
    pulses,
    paused,
    manual,
    toggle,
    scrub,
    resume,
    applied
  };
}
