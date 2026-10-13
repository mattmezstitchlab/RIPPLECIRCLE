/**
 * Ripple3D — The Clock of Consequences.
 *
 * The ENTIRE page is now the jewel. No header, no side bars, no dashboard.
 * The instrument floats centered on the paper background like a precision
 * object one would place on a black velvet tray.
 *
 *   - Double-click the empty space (or click the F/R crown on the back, or
 *     press F) to flip the jewel and reveal the mechanical back — a flat
 *     brushed-titanium plate with engraved markings, two crown wheels and
 *     a pusher.
 *   - Chrome (view presets, dock, inspector) fades out after idle so the
 *     object can be contemplated; move the mouse to bring it back.
 *   - The 2D Ripple is still reachable via the small "R · 2D" pusher in
 *     the top-left corner — also the escape hatch from the fullscreen
 *     instrument.
 *
 * For the list of features in Phase B/C and what remains for D/E/F, see
 * the commit message of eda776b. This revision strips all page-furniture
 * to deliver the "le bijou du site" brief.
 */
import { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { ClockHUD } from './ClockHUD';
import { useClockState } from '../../hooks/clock/useClockState';

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
  const idleTimer = useRef<number | null>(null);

  useEffect(() => {
    setHasGL(webglAvailable());
  }, []);

  // Auto-hide chrome after idle; reveal on mouse movement / keyboard.
  useEffect(() => {
    const reveal = () => {
      clock.setChromeVisible(true);
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
      idleTimer.current = window.setTimeout(() => clock.setChromeVisible(false), 2800);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') clock.toggleFlip();
      if (e.key === '0') clock.reset();
      reveal();
    };
    window.addEventListener('mousemove', reveal);
    window.addEventListener('touchstart', reveal);
    window.addEventListener('keydown', onKey);
    reveal();
    return () => {
      window.removeEventListener('mousemove', reveal);
      window.removeEventListener('touchstart', reveal);
      window.removeEventListener('keydown', onKey);
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // When flipped, force-chrome on for a moment so users can see the back
    // before it fades out again.
    clock.setChromeVisible(true);
    if (idleTimer.current) window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => clock.setChromeVisible(false), 3200);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clock.flipped]);

  if (!hasGL) return <FallbackNotice />;

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{
        background:
          'radial-gradient(1000px 700px at 50% 52%, #fff 0%, transparent 62%),' +
          'radial-gradient(1800px 1200px at 50% 55%, rgba(200,195,182,0.25) 0%, transparent 65%),' +
          '#f3f1ea',
        color: '#111110',
        cursor: 'default'
      }}
    >
      <Suspense fallback={<SceneLoading />}>
        <ClockScene clock={clock} />
      </Suspense>
      <ClockHUD clock={clock} />
    </div>
  );
}

function SceneLoading() {
  return (
    <div className="absolute inset-0 grid place-items-center text-[10px] tracking-[0.32em] text-[#777]">
      CALIBRAGE DU MOUVEMENT…
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
          Votre appareil ou navigateur ne prend pas en charge WebGL.
        </p>
      </div>
    </div>
  );
}
