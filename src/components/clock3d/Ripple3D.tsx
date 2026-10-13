/**
 * Ripple3D — The Clock of Consequences.
 *
 * The 3D instrument is the centrepiece of the page, laid out like a
 * Swiss-horology blueprint (header + margins + frame + annotations) as
 * in the original Muse reference. The page chrome DOES frame the object
 * — that was the mistake in the previous revision. The jewel is still
 * the only thing that matters, but it rests on a proper engraved
 * blueprint sheet, not floating in a dark void.
 *
 * Double-click empty space (or press F, or click the F/R pusher on the
 * back, or use the ⇅ DOS / ↺ FACE button) to flip the jewel and reveal
 * the mechanical back plate — the flat titanium side with crowns and
 * the movement cover.
 */
import { useEffect, useState, lazy, Suspense } from 'react';
import { ClockHeader } from './ClockHeader';
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

  useEffect(() => { setHasGL(webglAvailable()); }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') clock.toggleFlip();
      if (e.key === '0') clock.reset();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!hasGL) return <FallbackNotice />;

  return (
    <div
      className="relative flex h-screen flex-col overflow-hidden"
      style={{
        background:
          'radial-gradient(900px 600px at 50% 42%, #fff 0%, transparent 60%),' +
          'repeating-linear-gradient(0deg, transparent 0 39px, rgba(0,0,0,0.025) 39px 40px),' +
          'repeating-linear-gradient(90deg, transparent 0 39px, rgba(0,0,0,0.025) 39px 40px),' +
          '#f3f1ea',
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
    <div className="absolute inset-0 grid place-items-center text-[10px] tracking-[0.3em] text-[#777]">
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
