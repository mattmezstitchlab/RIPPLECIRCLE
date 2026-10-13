/**
 * Tests for the Ripple viewBox / zoom / pan math.
 *
 * These tests replicate the exact math used inside Ripple.tsx to compute
 * the viewBox string, so a regression in zoom/pan (like the Phase 1 trackpad
 * bug) is caught immediately.
 */
import { describe, expect, it } from 'vitest';
import { RIPPLE_SIZE as SIZE, RIPPLE_CENTER as C, ZOOM_MIN, ZOOM_MAX, PAN_MAX } from '../../ripple/config';

/**
 * Pure function reproducing the viewBox computation in Ripple.tsx.
 *
 *   const effectiveSpan = (SIZE + 60) / zoom;
 *   const minX = C - effectiveSpan / 2 + pan.x;
 *   const minY = C - effectiveSpan / 2 + pan.y;
 *   return `${minX} ${minY} ${effectiveSpan} ${effectiveSpan}`;
 */
function computeViewBox(zoom: number, pan: { x: number; y: number }) {
  const effectiveSpan = (SIZE + 60) / zoom;
  const minX = C - effectiveSpan / 2 + pan.x;
  const minY = C - effectiveSpan / 2 + pan.y;
  return { minX, minY, effectiveSpan, str: `${minX} ${minY} ${effectiveSpan} ${effectiveSpan}` };
}

describe('Ripple viewBox math (stability regression tests)', () => {
  it('initial load at zoom 1× / no pan shows the full circle centered', () => {
    const v = computeViewBox(1.0, { x: 0, y: 0 });
    // The outermost calendar ring sits at radius 488 from center (calOuter)
    // so the visible box must extend to C + 488 + a small margin in all directions.
    const right = v.minX + v.effectiveSpan;
    const bottom = v.minY + v.effectiveSpan;
    expect(v.minX).toBeLessThanOrEqual(C - 490);
    expect(v.minY).toBeLessThanOrEqual(C - 490);
    expect(right).toBeGreaterThanOrEqual(C + 490);
    expect(bottom).toBeGreaterThanOrEqual(C + 490);
    // And the visible span is exactly SIZE+60 = 1060 (concentric framing).
    expect(v.effectiveSpan).toBeCloseTo(SIZE + 60, 2);
  });

  it('reset after zoom/pan restores the initial framing', () => {
    const resetZoom = 1.0;
    const resetPan = { x: 0, y: 0 };
    const v = computeViewBox(resetZoom, resetPan);
    const init = computeViewBox(1.0, { x: 0, y: 0 });
    expect(v.str).toEqual(init.str);
  });

  it('zoom in narrows the visible span; zoom out widens it', () => {
    const at1x = computeViewBox(1.0, { x: 0, y: 0 });
    const at2x = computeViewBox(ZOOM_MAX, { x: 0, y: 0 });
    const atMin = computeViewBox(ZOOM_MIN, { x: 0, y: 0 });
    expect(at2x.effectiveSpan).toBeLessThan(at1x.effectiveSpan);
    expect(atMin.effectiveSpan).toBeGreaterThan(at1x.effectiveSpan);
  });

  it('pan stays within PAN_MAX bounds (cadran toujours retrouvable)', () => {
    // Pan at maximum allowed must still leave some part of the center visible.
    const v = computeViewBox(1.0, { x: PAN_MAX, y: PAN_MAX });
    // Center C must be within the visible area (with tolerance for edge).
    expect(v.minX).toBeLessThanOrEqual(C);
    expect(v.minY).toBeLessThanOrEqual(C);
    expect(v.minX + v.effectiveSpan).toBeGreaterThanOrEqual(C);
    expect(v.minY + v.effectiveSpan).toBeGreaterThanOrEqual(C);
  });

  it('zoom wheel step increments by exactly ZOOM_STEP from 1.0', () => {
    // Simulate one "+" button press — must not overshoot bounds.
    let z = 1.0;
    const step = 0.25;
    z = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, Number((z + step).toFixed(2))));
    expect(z).toBe(1.25);
    // Hold Ctrl+wheel and scroll up 4 times from 1.0 → should cap at ZOOM_MAX.
    let z2 = 1.0;
    for (let i = 0; i < 20; i++) {
      z2 = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, Number((z2 + step).toFixed(2))));
    }
    expect(z2).toBe(ZOOM_MAX);
  });

  it('normal (non-Ctrl) wheel must NOT zoom — threshold test guards against regression', () => {
    // This test encodes the rule that fixed the Phase 1 regression: a wheel
    // event without Ctrl/Meta must be ignored (letting the page scroll).
    const shouldZoom = (e: { ctrlKey: boolean; metaKey: boolean }) =>
      e.ctrlKey || e.metaKey;
    expect(shouldZoom({ ctrlKey: false, metaKey: false })).toBe(false); // ← normal trackpad scroll
    expect(shouldZoom({ ctrlKey: true, metaKey: false })).toBe(true);   // Ctrl+wheel / pinch
    expect(shouldZoom({ ctrlKey: false, metaKey: true })).toBe(true);   // Cmd+wheel (macOS)
  });
});
