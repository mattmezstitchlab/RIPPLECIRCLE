import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { isSupportedAudioFile, previewLimit } from '../../../utils/previewAudio';

describe('Aperçu audio local 2D', () => {
  it('limite les extraits à 30 secondes et accepte les fichiers courts', () => {
    expect(previewLimit(220)).toBe(30);
    expect(previewLimit(14.2)).toBe(14.2);
    expect(previewLimit(Number.POSITIVE_INFINITY)).toBe(30);
  });
  it('refuse les fichiers non audio', () => {
    expect(isSupportedAudioFile('demo.mp3', 'audio/mpeg')).toBe(true);
    expect(isSupportedAudioFile('demo.m4a', '')).toBe(true);
    expect(isSupportedAudioFile('index.html', 'text/html')).toBe(false);
    expect(isSupportedAudioFile('image.png', '')).toBe(false);
  });
  it('garde les fichiers locaux et un chargement contrôlé sans lecture automatique', () => {
    const player = readFileSync(resolve(__dirname, '../AudioPreview.tsx'), 'utf8');
    expect(player).toContain('URL.createObjectURL(file)');
    expect(player).toContain('URL.revokeObjectURL');
    expect(player).toContain('await audio.play()');
    expect(player).not.toMatch(/fetch\(|localStorage|autoplay|https:\/\//i);
  });
  it('affiche la visualisation seulement dans le SVG et les liens pertinents', () => {
    const src = readFileSync(resolve(__dirname, '../Ripple.tsx'), 'utf8');
    expect(src).toContain('audioPulseRef');
    expect(src).toContain('personLinks.slice(0, 14)');
    expect(src).toContain('aria-pressed={relationsVisible}');
  });
});
