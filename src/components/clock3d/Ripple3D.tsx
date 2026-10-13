/**
 * Ripple3D — The Clock of Consequences.
 *
 * A real 3D instrument built with react-three-fiber on top of the existing
 * RIPPLECIRCLE domain models (schema/core.ts, data/*, engine/orchestra/*).
 *
 * Features in this Phase B build (mechanical shell):
 *   - 7 independent concentric rings with real extruded geometry (beveled),
 *     machined-metal materials (titanium / aluminum / black steel / silver),
 *     radial ticks, spherical nodes on stems, screws on outer rings.
 *   - Faceted geometric nucleus at center (default selection).
 *   - Relationship web (lines between cross-ring nodes, subtle in instrument
 *     mode, gold-highlighted in connection/consequence mode).
 *   - Propagating ripple waves (3 staggered toruses) fired from "PROPAGER UNE ONDE".
 *   - Camera controls: OrbitControls with disabled wheel zoom (same guard as the
 *     2D Ripple so trackpad scroll is preserved), view presets (3/4, front,
 *     side, top, exploded) with eased fly-to, zoom +/- buttons, reset.
 *   - Exploded view animates rings apart along the Z-axis.
 *   - Play/pause of idle ring rotation.
 *   - Selection & hover of nodes with visual halo + right inspector panel.
 *   - Four causal states (OBSERVED / PREDICTED / PROPOSED / CONFIRMED) as pills.
 *   - Three signature modes: Instrument / Connection / Consequence.
 *   - Annotation panels in margins, paradigm card, module detail card.
 *   - Responsive: annotations hide under 1100px so the clock stays usable.
 *
 * Phases remaining (not yet claimed as done):
 *   - Phase D: wire real people/moments/playlists/memory data into nodes
 *     (this is a mechanical shell with deterministic demo labels).
 *   - Phase E: connect useReactiveOrchestra consequences to node state
 *     (status → predicted/proposed highlighting, delay propagation).
 *   - Phase F: mobile optimization, reduced-motion, a11y, 2D fallback switch.
 *
 * The 2D Ripple is NOT deleted — it remains available at the previous route
 * or via a toggle; Phase F will add the fallback switch for devices without
 * WebGL or prefers-reduced-motion.
 */
import { useState, useEffect, lazy, Suspense } from 'react';
import { ClockHeader } from './ClockHeader';
import { ClockHUD } from './ClockHUD';
import { useClockState } from '../../hooks/clock/useClockState';

// Lazy-load the Three.js canvas scene so that the bundle doesn't pay the
// Three.js cost on pages/modes that don't show the 3D clock.
const ClockScene = lazy(() =>
  import('./ClockScene').then((m) => ({ default: m.ClockScene }))
);

function webglAvailable(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('webgl2')));
  } catch {
    return false;
  }
}

export function Ripple3D() {
  const clock = useClockState();
  const [hasGL, setHasGL] = useState(true);

  useEffect(() => {
    setHasGL(webglAvailable());
  }, []);

  if (!hasGL) {
    return (
      <FallbackNotice />
    );
  }

  return (
    <div
      className="relative flex h-screen flex-col overflow-hidden"
      style={{
        background:
          'radial-gradient(900px 600px at 50% 42%, #fff 0%, transparent 60%), repeating-linear-gradient(0deg, transparent 0 39px, rgba(0,0,0,0.025) 39px 40px), repeating-linear-gradient(90deg, transparent 0 39px, rgba(0,0,0,0.025) 39px 40px), #f3f1ea',
        color: '#111110'
      }}
    >
      <ClockHeader />
      <main className="relative flex-1">
        <Suspense fallback={<SceneLoading />}>
          <ClockScene clock={clock} />
        </Suspense>
        <ClockHUD clock={clock} />
      </main>
    </div>
  );
}

function SceneLoading() {
  return (
    <div className="absolute inset-0 grid place-items-center text-[11px] tracking-[0.3em] text-[#777]">
      CALIBRAGE DE L&apos;INSTRUMENT…
    </div>
  );
}

function FallbackNotice() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#f3f1ea] p-8 text-center">
      <div className="max-w-md">
        <h2 className="font-serif text-2xl font-bold" style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}>
          Mode 2D — WebGL indisponible
        </h2>
        <p className="mt-3 text-[13px] leading-relaxed text-[#555]">
          Votre appareil ou navigateur ne prend pas en charge WebGL. Le Ripple 2D
          reste disponible — l&apos;horloge 3D sera automatiquement proposée sur
          un appareil compatible.
        </p>
      </div>
    </div>
  );
}
