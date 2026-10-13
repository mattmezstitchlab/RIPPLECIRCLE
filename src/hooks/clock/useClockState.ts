/**
 * useClockState — central UI/selection state for the 3D clock.
 *
 * Kept separate from rendering and from domain data. Tracks:
 *   - current camera preset,
 *   - current exploded amount (0..1),
 *   - playing / paused idle rotation,
 *   - active visual state (OBSERVED / PREDICTED / PROPOSED / CONFIRMED),
 *   - interaction mode (instrument / connection / consequence),
 *   - selected node id (stable entity id),
 *   - hovered node id (for highlights).
 *
 * Domain state (people, moments, orchestra results) is consumed from
 * the existing hooks (useWeddingGathering, useReactiveOrchestra) and is
 * NOT duplicated here.
 */
import { useCallback, useMemo, useState } from 'react';
import type { ClockState } from '../../components/clock3d/lib/materials';

export type ClockMode = 'instrument' | 'connection' | 'consequence';
export type ViewPreset = '3/4' | 'front' | 'side' | 'top' | 'exploded';

export interface SelectedNodeInfo {
  id: string;
  name: string;
  ringId: string;
  ringName: string;
  description: string;
  connectionCount: number;
}

export function useClockState() {
  const [view, setView] = useState<ViewPreset>('3/4');
  const [exploded, setExploded] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [state, setState] = useState<ClockState>('OBSERVED');
  const [mode, setMode] = useState<ClockMode>('instrument');
  const [selectedId, setSelectedId] = useState<string>('CORE-001');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [rippleKey, setRippleKey] = useState(0); // increment to fire a ripple wave

  const triggerRipple = useCallback(() => {
    setRippleKey((k) => k + 1);
    setMode('consequence');
  }, []);

  const reset = useCallback(() => {
    setExploded(0);
    setView('3/4');
    setMode('instrument');
  }, []);

  const zoomBy = useCallback((factor: number) => {
    // Camera zoom is handled via OrbitControls dolly; this is a hook stub
    // used by the zoom buttons that dispatch a custom event consumed by
    // the camera controller.
    window.dispatchEvent(new CustomEvent('clock:zoom', { detail: { factor } }));
  }, []);

  return useMemo(
    () => ({
      view, setView,
      exploded, setExploded,
      playing, setPlaying,
      state, setState,
      mode, setMode,
      selectedId, setSelectedId,
      hoveredId, setHoveredId,
      rippleKey, triggerRipple,
      reset, zoomBy
    }),
    [view, exploded, playing, state, mode, selectedId, hoveredId, rippleKey, triggerRipple, reset, zoomBy]
  );
}

export type ClockStateApi = ReturnType<typeof useClockState>;
