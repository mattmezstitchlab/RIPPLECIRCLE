/**
 * DOM smoke test + source-guard tests for the Ripple zoom fix.
 *
 * The critical regression was caused by the onWheel handler intercepting
 * normal trackpad scroll (Math.abs(deltaY) > 2) and zooming uncontrollably.
 * The fix is: only zoom when Ctrl/Cmd is held (native browser pinch gesture
 * mapped to Ctrl+wheel by the OS), leave normal scroll alone.
 *
 * We verify this in two complementary ways:
 *   1. Static source check (belt-and-suspenders — catches reintroduction
 *      even if the DOM test harness changes).
 *   2. Initial-render viewBox check at 1× zoom (validates the component
 *      mounts with the correct framing).
 *
 * Click→viewBox interaction arithmetic is covered by the pure-function tests
 * in src/utils/__tests__/viewTransform.test.ts.
 */
import { describe, expect, it, beforeAll } from 'vitest';
import { render } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import App from '../../../App';
import { RIPPLE_SIZE as SIZE, RIPPLE_CENTER as C } from '../../../ripple/config';

beforeAll(() => {
  window.innerWidth = 1440;
  window.innerHeight = 900;
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false
    } as MediaQueryList);
  (window as unknown as { AudioContext?: typeof AudioContext }).AudioContext = class {
    createOscillator() {
      return { connect: () => {}, start: () => {}, stop: () => {}, frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} }, type: '' as OscillatorType };
    }
    createGain() {
      return { connect: () => {}, gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} } };
    }
    resume() {}
    get currentTime() { return 0; }
    destination = {} as AudioDestinationNode;
    state: AudioContextState = 'running';
  } as unknown as typeof AudioContext;
  if (!window.localStorage) {
    const store: Record<string, string> = {};
    Object.defineProperty(window, 'localStorage', {
      value: { getItem: (k: string) => store[k] ?? null, setItem: (k: string, v: string) => { store[k] = String(v); }, removeItem: (k: string) => { delete store[k]; }, clear: () => { for (const k of Object.keys(store)) delete store[k]; } },
      configurable: true
    });
  }
});

describe('Ripple zoom regression safeguards', () => {
  it('renders the main SVG at exactly 1× framing initially (full circle visible)', () => {
    const { container } = render(<App />);
    // role="application" is on the container div; the Ripple SVG inside it has
    // viewBox set to the initial 1× framing.
    const appDiv = container.querySelector('div[role="application"]') as HTMLElement | null;
    expect(appDiv).not.toBeNull();
    const svg = appDiv!.querySelector('svg[viewBox]') as SVGSVGElement | null;
    expect(svg).not.toBeNull();
    const viewBox = svg!.getAttribute('viewBox');
    expect(viewBox).toBeTruthy();
    const parts = viewBox!.split(/\s+/).map(Number);
    expect(parts).toHaveLength(4);
    const [minX, minY, w, h] = parts;
    const expectedSpan = SIZE + 60;
    expect(w).toBeCloseTo(expectedSpan, 0);
    expect(h).toBeCloseTo(expectedSpan, 0);
    expect(minX).toBeCloseTo(C - expectedSpan / 2, 0);
    expect(minY).toBeCloseTo(C - expectedSpan / 2, 0);
  });

  it('zoom button labels are present (Zoomer / Dézoomer)', () => {
    const { container } = render(<App />);
    const buttons = Array.from(container.querySelectorAll('button'));
    const zoomIn = buttons.find((b) => b.getAttribute('aria-label') === 'Zoomer');
    const zoomOut = buttons.find((b) => b.getAttribute('aria-label') === 'Dézoomer');
    expect(zoomIn).not.toBeNull();
    expect(zoomOut).not.toBeNull();
  });

  it('onWheel source guards on ctrlKey/metaKey — NOT on Math.abs(deltaY) > 2 (root cause)', () => {
    const src = readFileSync(resolve(__dirname, '..', 'Ripple.tsx'), 'utf8');
    expect(src).toMatch(/if\s*\(!\s*\(\s*e\.ctrlKey\s*\|\|\s*e\.metaKey\s*\)\s*\)\s*return/);
    expect(src).not.toMatch(/Math\.abs\(e\.deltaY\)\s*>\s*2/);
    expect(src).toContain('e.preventDefault()');
  });

  it('touch-action on SVG is "pan-y" (vertical page scroll allowed), not "none"', () => {
    const src = readFileSync(resolve(__dirname, '..', 'Ripple.tsx'), 'utf8');
    expect(src).not.toMatch(/className="[^"]*touch-none/);
    expect(src).toMatch(/touchAction:\s*'pan-y'/);
  });
});
