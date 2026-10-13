/** Limite volontaire des aperçus locaux ; ne remplace pas les droits musicaux. */
export const PREVIEW_LIMIT_SECONDS = 30;

export function previewLimit(duration: number): number {
  return Number.isFinite(duration) && duration > 0
    ? Math.min(PREVIEW_LIMIT_SECONDS, duration)
    : PREVIEW_LIMIT_SECONDS;
}

export function isSupportedAudioFile(name: string, mime: string): boolean {
  const extension = /\.(mp3|wav|m4a|aac|ogg|flac|webm)$/i.test(name);
  return mime.startsWith('audio/') || (mime === '' && extension);
}
