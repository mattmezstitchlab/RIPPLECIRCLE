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
  const [rippleKey, setRippleKey] = useState(0);
  /** true when the jewel is flipped to its mechanical back (reglage side). */
  const [flipped, setFlipped] = useState(false);
  /** Whether the chrome (dock, inspector, annotations) is visible. Auto-hides
   *  after a short idle so the jewel can be contemplated in the round. */
  const [chromeVisible, setChromeVisible] = useState(true);

  const triggerRipple = useCallback(() => {
    setRippleKey((k) => k + 1);
    setMode('consequence');
  }, []);

  const reset = useCallback(() => {
    setExploded(0);
    setView('3/4');
    setMode('instrument');
    setFlipped(false);
  }, []);

  const zoomBy = useCallback((factor: number) => {
    window.dispatchEvent(new CustomEvent('clock:zoom', { detail: { factor } }));
  }, []);

  const toggleFlip = useCallback(() => {
    setFlipped((f) => !f);
    setChromeVisible(true);
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
      flipped, setFlipped, toggleFlip,
      chromeVisible, setChromeVisible,
      reset, zoomBy
    }),
    [view, exploded, playing, state, mode, selectedId, hoveredId, rippleKey,
     triggerRipple, flipped, toggleFlip, chromeVisible, reset, zoomBy]
  );
}

export type ClockStateApi = ReturnType<typeof useClockState>;
